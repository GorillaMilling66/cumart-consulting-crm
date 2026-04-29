-- ═══════════════════════════════════════════════════════════════════════════
-- v2.0.0-pre.1 — Datenmodell-Migrationen für das Komplett-Redesign
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Drei strukturelle Erweiterungen, die die neuen UI-Bereiche brauchen:
--
--   (1) project_success_criteria  — Erfolgskriterien als echte Datensätze
--                                   (statt Freitext im JSONB), abhakbar.
--   (2) tasks.deployment_id       — Verknüpfung von Aufgaben zu Einsätzen
--                                   für „Action Items" im Einsatz-Bericht.
--   (3) project_themes.farbe-Mapping — bestehende freie Hex-Werte werden
--                                   auf 8 kuratierte Pastell-Farben geziehen.
--
-- Idempotent. Originale (JSONB-Erfolgskriterien) bleiben als Backup.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── (1) project_success_criteria ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_success_criteria (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  text          text NOT NULL,
  ist_erreicht  boolean NOT NULL DEFAULT false,
  reihenfolge   integer NOT NULL DEFAULT 0,
  erreicht_am   timestamptz,
  erreicht_von  uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_psc_project
  ON public.project_success_criteria(project_id, reihenfolge)
  WHERE deleted_at IS NULL;

ALTER TABLE public.project_success_criteria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "psc_all_authenticated" ON public.project_success_criteria;
CREATE POLICY "psc_all_authenticated" ON public.project_success_criteria
  AS PERMISSIVE FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "only_active_users" ON public.project_success_criteria;
CREATE POLICY "only_active_users" ON public.project_success_criteria
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

-- Best-Effort-Migration: Erfolgskriterien aus dokumentation.erfolgskriterien
-- (Freitext im JSONB) → einzelne Datensätze. Splittet an Newline / Bullet.
INSERT INTO public.project_success_criteria (project_id, text, ist_erreicht, reihenfolge)
SELECT
  p.id,
  btrim(regexp_replace(lines.line, '^[\s•\-\*✅☑]+', '')),
  false,
  (row_number() OVER (PARTITION BY p.id ORDER BY lines.line_ord) - 1) * 10
FROM public.projects p
CROSS JOIN LATERAL (
  SELECT t.line, t.line_ord
  FROM unnest(regexp_split_to_array(
    COALESCE(p.dokumentation->>'erfolgskriterien', ''),
    '[\r\n;]+'
  )) WITH ORDINALITY AS t(line, line_ord)
) AS lines
WHERE p.deleted_at IS NULL
  AND COALESCE(p.dokumentation->>'erfolgskriterien', '') <> ''
  AND length(btrim(regexp_replace(lines.line, '^[\s•\-\*✅☑]+', ''))) BETWEEN 2 AND 200
  AND NOT EXISTS (
    SELECT 1 FROM public.project_success_criteria psc
    WHERE psc.project_id = p.id AND psc.deleted_at IS NULL
  );

-- ── (2) tasks.deployment_id ──────────────────────────────────────────────
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS deployment_id uuid
    REFERENCES public.deployments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_deployment
  ON public.tasks(deployment_id)
  WHERE deleted_at IS NULL AND deployment_id IS NOT NULL;

-- ── (3) Themen-Farben auf kuratierte Palette mappen ──────────────────────
-- Acht Pastell-Werte. Bestehende Themen mit freien Hex-Werten werden auf
-- den nächstgelegenen Palette-Wert via einfacher String-Heuristik gemappt.
-- Themen ohne Farbe bekommen Default Blau.
WITH palette AS (
  SELECT * FROM (VALUES
    ('#E6F1FB'),  -- blue
    ('#EEEDFE'),  -- purple
    ('#FAEEDA'),  -- amber
    ('#EAF3DE'),  -- green
    ('#FBEAF0'),  -- pink
    ('#E1F5EE'),  -- teal
    ('#FCEBEB'),  -- red
    ('#F1EFE8')   -- grey
  ) AS p(hex)
)
UPDATE public.project_themes pt
   SET farbe = (
     -- Wähle den Palette-Eintrag mit kürzestem RGB-Abstand zum aktuellen Wert.
     -- Heuristik via SUBSTRING + lpad: Hex-Komponenten in Integer wandeln.
     SELECT p.hex
       FROM palette p
       ORDER BY (
         abs( ('x' || substring(upper(p.hex)  from 2 for 2))::bit(8)::int -
              ('x' || substring(upper(pt.farbe) from 2 for 2))::bit(8)::int ) +
         abs( ('x' || substring(upper(p.hex)  from 4 for 2))::bit(8)::int -
              ('x' || substring(upper(pt.farbe) from 4 for 2))::bit(8)::int ) +
         abs( ('x' || substring(upper(p.hex)  from 6 for 2))::bit(8)::int -
              ('x' || substring(upper(pt.farbe) from 6 for 2))::bit(8)::int )
       )
       LIMIT 1
   )
 WHERE pt.deleted_at IS NULL
   AND pt.farbe IS NOT NULL
   AND pt.farbe ~ '^#[0-9A-Fa-f]{6}$'
   AND pt.farbe NOT IN ('#E6F1FB','#EEEDFE','#FAEEDA','#EAF3DE','#FBEAF0','#E1F5EE','#FCEBEB','#F1EFE8');

-- Themen ohne Farbe → Default Blau
UPDATE public.project_themes
   SET farbe = '#E6F1FB'
 WHERE deleted_at IS NULL
   AND (farbe IS NULL OR farbe = '');

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verifikation
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema='public' AND table_name='project_success_criteria') AS psc_table,
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='tasks' AND column_name='deployment_id') AS tasks_dep_col,
  (SELECT count(*) FROM public.project_success_criteria WHERE deleted_at IS NULL) AS psc_imported,
  (SELECT count(*) FROM public.project_themes
     WHERE deleted_at IS NULL
       AND farbe IN ('#E6F1FB','#EEEDFE','#FAEEDA','#EAF3DE','#FBEAF0','#E1F5EE','#FCEBEB','#F1EFE8'))
    AS themes_in_palette,
  (SELECT count(*) FROM public.project_themes
     WHERE deleted_at IS NULL
       AND farbe NOT IN ('#E6F1FB','#EEEDFE','#FAEEDA','#EAF3DE','#FBEAF0','#E1F5EE','#FCEBEB','#F1EFE8'))
    AS themes_outside_palette;
