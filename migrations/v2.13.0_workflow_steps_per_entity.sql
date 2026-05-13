-- ═══════════════════════════════════════════════════════════════════════════
-- v2.13.0 — Modulare Workflow-Schritte pro Projekt und pro Einsatz
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher waren die Vorbereitungs-/Dokumentations-Checklisten als JS-Konstante
-- in `WORKFLOW_STEPS` hartcodiert. Pro Projekt eigene Schritte ging nicht.
-- Jetzt bekommt jede Entität (Projekt, Einsatz) ein eigenes Array von
-- Schritten in `workflow_steps` jsonb. Format pro Eintrag:
--   { "id": "ziel", "label": "Ziel formuliert", "required": true }
-- Die ID dient als Key in `workflow_state` jsonb (bestehende Spalte) — die
-- Default-Werte hier matchen die alten hartcodierten IDs, sodass bisherige
-- workflow_state-Daten weiterhin korrekt verlinkt sind.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Projekt-Default: 4 Steps aus WORKFLOW_STEPS.project_prepare
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS workflow_steps jsonb NOT NULL DEFAULT '[
    {"id":"ziel",             "label":"Ziel / Kundenherausforderung formuliert","required":true},
    {"id":"erfolgskriterien", "label":"Erfolgskriterien definiert","required":true},
    {"id":"themen",           "label":"Themen festgelegt","required":true},
    {"id":"aktivitaeten",     "label":"Erste Termine / Einsätze eingeplant","required":true}
  ]'::jsonb;

-- 2. Einsatz-Default: 5 Steps aus WORKFLOW_STEPS.deployment_document
ALTER TABLE public.deployments
  ADD COLUMN IF NOT EXISTS workflow_steps jsonb NOT NULL DEFAULT '[
    {"id":"themen",          "label":"Behandelte Themen erfasst","required":true},
    {"id":"teilnehmer",      "label":"Teilnehmer notiert","required":true},
    {"id":"erkenntnisse",    "label":"Erkenntnisse festgehalten","required":true},
    {"id":"folgemassnahmen", "label":"Folgemaßnahmen abgeleitet","required":true},
    {"id":"status_done",     "label":"Status auf Durchgeführt gesetzt","required":true}
  ]'::jsonb;

-- 3. Bestandsdaten füllen — falls workflow_steps leer / NULL durch
--    Race-Conditions oder Pre-DEFAULT-Inserts.
UPDATE public.projects
   SET workflow_steps = '[
    {"id":"ziel",             "label":"Ziel / Kundenherausforderung formuliert","required":true},
    {"id":"erfolgskriterien", "label":"Erfolgskriterien definiert","required":true},
    {"id":"themen",           "label":"Themen festgelegt","required":true},
    {"id":"aktivitaeten",     "label":"Erste Termine / Einsätze eingeplant","required":true}
  ]'::jsonb
 WHERE workflow_steps IS NULL OR jsonb_typeof(workflow_steps) <> 'array' OR jsonb_array_length(workflow_steps) = 0;

UPDATE public.deployments
   SET workflow_steps = '[
    {"id":"themen",          "label":"Behandelte Themen erfasst","required":true},
    {"id":"teilnehmer",      "label":"Teilnehmer notiert","required":true},
    {"id":"erkenntnisse",    "label":"Erkenntnisse festgehalten","required":true},
    {"id":"folgemassnahmen", "label":"Folgemaßnahmen abgeleitet","required":true},
    {"id":"status_done",     "label":"Status auf Durchgeführt gesetzt","required":true}
  ]'::jsonb
 WHERE workflow_steps IS NULL OR jsonb_typeof(workflow_steps) <> 'array' OR jsonb_array_length(workflow_steps) = 0;

-- ── Verifizierung ──────────────────────────────────────────────────────────
SELECT 'projects.workflow_steps' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='projects' AND column_name='workflow_steps')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'deployments.workflow_steps',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='deployments' AND column_name='workflow_steps')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'projects mit workflow_steps gefüllt',
       CASE WHEN (SELECT COUNT(*) FROM projects WHERE workflow_steps IS NOT NULL AND jsonb_array_length(workflow_steps) > 0) =
                 (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL)
       THEN 'OK' ELSE 'TEILWEISE' END
UNION ALL
SELECT 'deployments mit workflow_steps gefüllt',
       CASE WHEN (SELECT COUNT(*) FROM deployments WHERE workflow_steps IS NOT NULL AND jsonb_array_length(workflow_steps) > 0) =
                 (SELECT COUNT(*) FROM deployments WHERE deleted_at IS NULL)
       THEN 'OK' ELSE 'TEILWEISE' END;
