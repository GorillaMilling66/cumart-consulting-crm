-- ═══════════════════════════════════════════════════════════════════════════
-- v2.16.2 — project_themes.project_id nullable, company_id NOT NULL
-- ═══════════════════════════════════════════════════════════════════════════
--
-- v2.16.0 hat Themen firmen-scoped gemacht, aber project_id blieb NOT NULL.
-- Effekt: Einsätze ohne Projekt konnten keine neuen Themen anlegen (400).
--
-- Diese Migration:
-- 1) project_themes.project_id wird nullable — Themen können fortan
--    existieren, ohne einem Projekt zugeordnet zu sein. Curriculum-Link
--    läuft ausschließlich über project_theme_assignments.
-- 2) project_themes.company_id wird NOT NULL — jedes Thema gehört zu
--    einer Firma. Orphans (company_id IS NULL) müssten vorher behandelt
--    werden; v2.16.0-Backfill hat 0 Orphans gelassen.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) project_id nullable machen
ALTER TABLE public.project_themes ALTER COLUMN project_id DROP NOT NULL;

-- 2) company_id NOT NULL machen (sicherer Vorab-Check)
DO $$
DECLARE orphan_count int;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM public.project_themes
   WHERE company_id IS NULL AND deleted_at IS NULL;
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Es gibt % Themen ohne company_id — bitte erst zuordnen.', orphan_count;
  END IF;
END $$;

ALTER TABLE public.project_themes ALTER COLUMN company_id SET NOT NULL;

-- ─── Verifizierung ─────────────────────────────────────────────────────────
SELECT 'project_id nullable' AS pruefung,
       (SELECT is_nullable FROM information_schema.columns
        WHERE table_schema='public' AND table_name='project_themes'
          AND column_name='project_id') AS status
UNION ALL
SELECT 'company_id NOT NULL',
       (SELECT is_nullable FROM information_schema.columns
        WHERE table_schema='public' AND table_name='project_themes'
          AND column_name='company_id');
