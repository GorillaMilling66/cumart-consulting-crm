-- ═══════════════════════════════════════════════════════════════════════════
-- v1.22.0 — Aufgaben (Tasks)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Neue Entität `tasks` für interne Aufgaben, die sich Nutzer selbst oder
-- anderen Nutzern zuweisen können.
--
-- Abgrenzung zu bestehenden Entitäten (siehe architecture.md §8):
--   • Termin  = Meeting mit Kunden, nicht abrechenbar, Aufwand
--   • Einsatz = abrechenbare Leistung, Kundenumsatz
--   • Aufgabe = interne To-Dos, nicht kundenfakturierbar, nicht umsatzwirksam
--
-- Aufgaben koppeln NICHT mit Einsätzen/Terminen und triggern KEINE
-- Auto-Projektstatus-Logik — sie sind bewusst entkoppelt, um die bestehenden
-- Domänen-Invarianten nicht zu stören.
--
-- Soft-Delete von Tag 1 (deleted_at), RLS analog zu allen operativen Tabellen
-- (only_active_users restrictive policy aus v1.15.0).
--
-- Ausführung: in Supabase SQL-Editor als Ganzes (idempotent).
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 1. Tabelle `tasks` ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  titel          text        NOT NULL,
  beschreibung   text,
  status         text        NOT NULL DEFAULT 'offen',
  faelligkeit    date,
  erledigt_am    timestamptz,
  assigned_to    uuid        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  company_id     uuid        REFERENCES public.companies(id)     ON DELETE SET NULL,
  contact_id     uuid        REFERENCES public.contacts(id)      ON DELETE SET NULL,
  project_id     uuid        REFERENCES public.projects(id)      ON DELETE SET NULL,
  deployment_id  uuid        REFERENCES public.deployments(id)   ON DELETE SET NULL,
  notizen        text,
  erstellt_von   uuid        REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now(),
  deleted_at     timestamptz
);

-- ─── 2. Indizes ─────────────────────────────────────────────────────────────
-- Partieller Index auf aktive Zeilen (Standard-Filter deleted_at IS NULL).
CREATE INDEX IF NOT EXISTS idx_tasks_active
  ON public.tasks (faelligkeit) WHERE deleted_at IS NULL;

-- "Meine offenen Aufgaben"-Query: WHERE assigned_to = :me AND status <> 'erledigt'
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_open
  ON public.tasks (assigned_to, status) WHERE deleted_at IS NULL;

-- Sub-Sektionen auf Firma-/Projekt-Detail: filtern nach company_id bzw. project_id
CREATE INDEX IF NOT EXISTS idx_tasks_company
  ON public.tasks (company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_project
  ON public.tasks (project_id) WHERE deleted_at IS NULL;


-- ─── 3. RLS: only_active_users (analog zu v1.15.0) ──────────────────────────
-- Die Funktion public.is_active_user() existiert bereits seit v1.15.0.
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "only_active_users" ON public.tasks;
CREATE POLICY "only_active_users" ON public.tasks
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());


-- ─── 4. Lookup-Werte für Aufgabe-Status ─────────────────────────────────────
-- Wir nutzen das bestehende lookup_values-System (keine CHECK-Constraints,
-- konsistent zu projekt_status / einsatz_status seit v1.9.6).
--
-- Caveat: der String 'erledigt' wird in app.js von der Auto-Logik
-- (Checkbox-Toggle, faelligkeit-Badge) referenziert. Nicht umbenennen —
-- stattdessen via ist_aktiv=false deaktivieren.

INSERT INTO public.lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
VALUES
  ('aufgabe_status', 'offen',     '#6B7280', 10, true),
  ('aufgabe_status', 'in_arbeit', '#F59E0B', 20, true),
  ('aufgabe_status', 'erledigt',  '#10B981', 30, true)
ON CONFLICT DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════════════
-- Verifikation
-- ═══════════════════════════════════════════════════════════════════════════
-- SELECT 'Tabelle tasks mit deleted_at (v1.22)' AS pruefung,
--        CASE WHEN EXISTS (
--          SELECT 1 FROM information_schema.columns
--          WHERE table_schema='public' AND table_name='tasks'
--            AND column_name='deleted_at'
--        ) THEN 'OK' ELSE 'FEHLT' END AS status
-- UNION ALL
-- SELECT 'RLS only_active_users auf tasks',
--        CASE WHEN EXISTS (
--          SELECT 1 FROM pg_policies
--          WHERE schemaname='public' AND tablename='tasks'
--            AND policyname='only_active_users'
--        ) THEN 'OK' ELSE 'FEHLT' END
-- UNION ALL
-- SELECT 'Lookup aufgabe_status (3 Werte aktiv)',
--        CASE WHEN (
--          SELECT COUNT(*) FROM public.lookup_values
--          WHERE kategorie='aufgabe_status' AND ist_aktiv=true
--        ) = 3 THEN 'OK' ELSE 'UNVOLLSTAENDIG' END;
