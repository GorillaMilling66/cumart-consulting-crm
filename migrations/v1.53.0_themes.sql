-- ═══════════════════════════════════════════════════════════════════════════
-- v1.53.0 — Themen als echte M:N-Strukturdaten (Phase A des Master-Plan v2.1)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Aus Freitext (`projects.dokumentation.themenwahl`,
-- `deployments.dokumentation.durchgefuehrte_themen`) werden echte Tabellen
-- mit Foreign Keys, damit:
--   - Cross-Projekt-Suche möglich ist ("Wo haben wir schon TNC geschult?"),
--   - Einsätze konkret gegen Projekt-Themen taggen können (M:N),
--   - das Entwicklungs-Log (Phase C) automatisch synthetisierbar wird.
--
-- Status-Werte werden NICHT als CHECK-Constraint zementiert (Lehre v1.9.6).
-- Stattdessen `lookup_values.theme_status` mit drei Default-Einträgen.
-- App-Validierung läuft gegen den aktiven Lookup-Cache.
--
-- Bestehende Freitext-Inhalte werden best-effort migriert (Bullet-/Newline-/
-- Komma-Split). Originale bleiben im JSONB als Backup, werden aber ab v1.53
-- nicht mehr in der UI primär gerendert.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. project_themes ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.project_themes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name          text NOT NULL,
  beschreibung  text,
  status        text NOT NULL DEFAULT 'offen',  -- validiert via lookup_values.theme_status
  owner_id      uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  farbe         text,                            -- Hex-Code, optional
  reihenfolge   integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_project_themes_project
  ON public.project_themes(project_id, reihenfolge)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_project_themes_owner
  ON public.project_themes(owner_id)
  WHERE deleted_at IS NULL;

-- ── 2. deployment_themes (Junction) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deployment_themes (
  deployment_id uuid NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  theme_id      uuid NOT NULL REFERENCES public.project_themes(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (deployment_id, theme_id)
);

CREATE INDEX IF NOT EXISTS idx_deployment_themes_theme
  ON public.deployment_themes(theme_id);

-- ── 3. RLS-Pattern (gemäß Doku §15.2 + memory project_rls_policy_pattern) ─
ALTER TABLE public.project_themes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployment_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "project_themes_all_authenticated" ON public.project_themes;
CREATE POLICY "project_themes_all_authenticated" ON public.project_themes
  AS PERMISSIVE FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "only_active_users" ON public.project_themes;
CREATE POLICY "only_active_users" ON public.project_themes
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS "deployment_themes_all_authenticated" ON public.deployment_themes;
CREATE POLICY "deployment_themes_all_authenticated" ON public.deployment_themes
  AS PERMISSIVE FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "only_active_users" ON public.deployment_themes;
CREATE POLICY "only_active_users" ON public.deployment_themes
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

-- ── 4. Lookup-Werte für theme_status seeden (idempotent via NOT EXISTS) ───
INSERT INTO public.lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('theme_status', 'offen',          '#6b7280', 10, true),
  ('theme_status', 'in_arbeit',      '#d97706', 20, true),
  ('theme_status', 'abgeschlossen',  '#16a34a', 30, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM public.lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
);

-- ── 5. Best-Effort-Migration: themenwahl-Freitext → project_themes ────────
-- Nur Projekte, die bisher keine project_themes haben (Idempotenz).
-- Splittet an Newline / Bullet (• - *) / Semikolon. Komma absichtlich nicht,
-- weil "TNC-Programmierung, Werkzeuge" oft als ein Thema gemeint ist.
INSERT INTO public.project_themes (project_id, name, status, reihenfolge)
SELECT
  p.id AS project_id,
  btrim(regexp_replace(lines.line, '^[\s•\-\*]+', '')) AS name,
  'offen' AS status,
  (row_number() OVER (PARTITION BY p.id ORDER BY lines.line_ord) - 1) * 10 AS reihenfolge
FROM public.projects p
CROSS JOIN LATERAL (
  SELECT t.line, t.line_ord
  FROM unnest(regexp_split_to_array(
    COALESCE(p.dokumentation->>'themenwahl', ''),
    '[\r\n;]+'
  )) WITH ORDINALITY AS t(line, line_ord)
) AS lines
WHERE p.deleted_at IS NULL
  AND COALESCE(p.dokumentation->>'themenwahl', '') <> ''
  AND length(btrim(regexp_replace(lines.line, '^[\s•\-\*]+', ''))) BETWEEN 2 AND 120
  AND NOT EXISTS (
    SELECT 1 FROM public.project_themes pt
    WHERE pt.project_id = p.id AND pt.deleted_at IS NULL
  );

-- ── 6. Best-Effort-Migration: durchgefuehrte_themen → deployment_themes ──
-- Matcht jeden Einsatz-Themen-Eintrag gegen project_themes des verknüpften
-- Projekts via case-insensitive Vergleich. Levenshtein-Toleranz ≤ 2 wäre
-- noch besser, aber pg hat das nicht out-of-the-box; ILIKE auf trim() reicht
-- als konservativer Auto-Match. Nicht-Treffer bleiben im Freitext.
INSERT INTO public.deployment_themes (deployment_id, theme_id)
SELECT DISTINCT d.id, pt.id
FROM public.deployments d
JOIN public.project_themes pt
  ON pt.project_id = d.project_id
 AND pt.deleted_at IS NULL
CROSS JOIN LATERAL (
  SELECT btrim(line) AS theme_line
  FROM unnest(regexp_split_to_array(
    COALESCE(d.dokumentation->>'durchgefuehrte_themen', ''),
    '[\r\n;]+'
  )) AS u(line)
) AS einsatz_lines
WHERE d.deleted_at IS NULL
  AND d.project_id IS NOT NULL
  AND COALESCE(d.dokumentation->>'durchgefuehrte_themen', '') <> ''
  AND lower(btrim(regexp_replace(einsatz_lines.theme_line, '^[\s•\-\*]+', '')))
      = lower(pt.name)
ON CONFLICT (deployment_id, theme_id) DO NOTHING;

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Verifikation
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema='public'
       AND table_name IN ('project_themes','deployment_themes')) AS tables_created,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public'
       AND tablename IN ('project_themes','deployment_themes')) AS rls_policies,
  (SELECT count(*) FROM public.lookup_values
     WHERE kategorie='theme_status' AND ist_aktiv=true) AS theme_status_lookups,
  (SELECT count(*) FROM public.project_themes WHERE deleted_at IS NULL) AS themes_imported,
  (SELECT count(*) FROM public.deployment_themes) AS deployment_themes_imported;
