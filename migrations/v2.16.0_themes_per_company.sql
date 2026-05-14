-- ═══════════════════════════════════════════════════════════════════════════
-- v2.16.0 — Themen wandern auf die Firma
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher hingen Themen am Projekt: `project_themes.project_id` ist NOT NULL,
-- und `deployment_themes` referenziert sie indirekt. Einsätze ohne Projekt
-- konnten gar keine Themen taggen.
--
-- Neues Modell: Themen gehören zur Firma (kunden-spezifisch wieder-
-- verwendbar). Projekte ziehen sich daraus eine Curriculum-Auswahl per
-- Junction-Tabelle. Einsätze taggen direkt Themen der Firma.
--
-- Diese Migration ist additiv und non-destructive — `project_themes.
-- project_id` bleibt für Backwards-Compat erhalten (deprecated). Eine
-- spätere Migration kann die Spalte droppen, sobald der Code komplett
-- auf das Junction-Modell umgestellt ist.
--
--   project_themes (id, company_id NEU, project_id alt, name, ...)
--   project_theme_assignments (id, project_id, theme_id, reihenfolge, …) NEU
--   deployment_themes (deployment_id, theme_id → project_themes.id) unverändert
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) company_id auf project_themes ergänzen
ALTER TABLE public.project_themes
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- 2) Backfill: company_id aus zugehörigem Projekt holen
UPDATE public.project_themes pt
SET company_id = p.company_id
FROM public.projects p
WHERE pt.project_id = p.id
  AND pt.company_id IS NULL
  AND p.company_id IS NOT NULL;

-- 3) Index
CREATE INDEX IF NOT EXISTS idx_project_themes_company
  ON public.project_themes(company_id) WHERE deleted_at IS NULL;

-- 4) Curriculum-Junction: welche Themen sind in welchem Projekt eingeplant
CREATE TABLE IF NOT EXISTS public.project_theme_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  theme_id      uuid NOT NULL REFERENCES public.project_themes(id) ON DELETE CASCADE,
  reihenfolge   int DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  UNIQUE (project_id, theme_id)
);
CREATE INDEX IF NOT EXISTS idx_pta_project ON public.project_theme_assignments(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pta_theme   ON public.project_theme_assignments(theme_id)   WHERE deleted_at IS NULL;

-- 5) RLS
ALTER TABLE public.project_theme_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pta_all_authenticated ON public.project_theme_assignments;
CREATE POLICY pta_all_authenticated ON public.project_theme_assignments
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.project_theme_assignments;
CREATE POLICY only_active_users ON public.project_theme_assignments
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

-- 6) Backfill Curriculum-Junction aus bestehenden project_themes.project_id
INSERT INTO public.project_theme_assignments (project_id, theme_id, reihenfolge)
SELECT project_id, id, COALESCE(reihenfolge, 0)
FROM public.project_themes
WHERE project_id IS NOT NULL AND deleted_at IS NULL
ON CONFLICT (project_id, theme_id) DO NOTHING;

-- ─── Verifizierung ─────────────────────────────────────────────────────────
SELECT 'project_themes.company_id existiert' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='project_themes' AND column_name='company_id')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'project_theme_assignments existiert',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='project_theme_assignments')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'PTA RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='project_theme_assignments') = 2
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'Themen mit company_id',
       (SELECT COUNT(*)::text FROM public.project_themes WHERE company_id IS NOT NULL AND deleted_at IS NULL)
UNION ALL
SELECT 'Themen ohne company_id (Orphans)',
       (SELECT COUNT(*)::text FROM public.project_themes WHERE company_id IS NULL AND deleted_at IS NULL)
UNION ALL
SELECT 'Curriculum-Eintraege',
       (SELECT COUNT(*)::text FROM public.project_theme_assignments WHERE deleted_at IS NULL);
