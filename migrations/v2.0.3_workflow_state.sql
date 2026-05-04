-- ═══════════════════════════════════════════════════════════════════════════
-- v2.0.3 — workflow_state JSONB für Vorbereitung / Dokumentation
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Punkt 9 des UX-Refactors: pro Detail-Page eine Schritt-für-Schritt-Checkliste,
-- die im Hero einen Status („✓ Vorbereitet" / „✓ Dokumentiert") zeigt sobald alle
-- Schritte abgehakt sind. Die Schritte selbst sind im Code definiert
-- (WORKFLOW_STEPS in app.js), nur der State pro Entität liegt in der DB.
--
-- Schema-Form:
--   workflow_state = {
--     "appointment_prepare": { "anfahrt": true, "teilnehmer": false, ... },
--     "deployment_document": { "themen": true, ... },
--     "project_prepare":     { "ziel": true, ... }
--   }
--
-- Default ist '{}'::jsonb, also leer. Eine Aufgabe-Tabelle braucht den State
-- vorerst nicht, weil Aufgaben das simpelste Workflow-Modell haben (offen ↔
-- erledigt, schon im status-Feld abgebildet).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS workflow_state jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.deployments
  ADD COLUMN IF NOT EXISTS workflow_state jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS workflow_state jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Verifizierungs-Query
SELECT
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema='public' AND table_name='appointments' AND column_name='workflow_state') AS appt_col,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema='public' AND table_name='deployments'  AND column_name='workflow_state') AS dep_col,
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema='public' AND table_name='projects'     AND column_name='workflow_state') AS proj_col;
-- Erwartung: alle drei = 1
