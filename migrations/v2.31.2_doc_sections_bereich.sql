-- ═══════════════════════════════════════════════════════════════════════════
-- v2.31.2 — Doku-Bereich pro doc_section (Position im Kundenbericht)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher landen alle doc_sections eines Projekts unter „1. Projekt-Briefing"
-- im Kundenbericht. Mit dieser Migration kann der User pro Block entscheiden,
-- in welcher der drei Berichts-Sektionen er erscheint:
--
--   'briefing'           — Sektion 1 (Default, vor den Einsätzen)
--   'nach_einsaetze'     — direkt nach Sektion 2 (Einsätze)
--   'nach_lieferumfang'  — direkt nach Sektion 3 (Lieferumfang Produkte)
--
-- Die Spalte ist nur für entity_type='project' fachlich relevant; für andere
-- Entitäts-Typen (company, contact, deployment, appointment) bleibt der
-- Default-Wert stehen und wird ignoriert (kein Kundenbericht-Rendering).
--
-- Idempotent — IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE doc_sections
  ADD COLUMN IF NOT EXISTS bereich TEXT NOT NULL DEFAULT 'briefing';

-- Verifikation
SELECT
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'doc_sections' AND column_name = 'bereich'
  ) THEN 'OK — doc_sections.bereich vorhanden'
  ELSE 'FEHLT — doc_sections.bereich nicht angelegt' END AS status;
