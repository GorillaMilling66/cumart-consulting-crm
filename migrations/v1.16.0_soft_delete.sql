-- ═══════════════════════════════════════════════════════════════════════════
-- v1.16.0 — Soft-Delete
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Adressiert Roadmap §13.1 Item 5 (letzter offener Security-Punkt).
--
-- Statt hartem DELETE setzen alle delete*-Handler künftig
--   deleted_at = now()
-- auf den sechs Kern-Entitäten. List-/Detail-Queries filtern
--   WHERE deleted_at IS NULL.
--
-- Vorteile:
--   • Versehentliche Löschungen sind wiederherstellbar (manuell per SQL)
--   • FK-Constraints werden nicht mehr zur Sackgasse (referenzierte Firmen
--     können "gelöscht" werden, ohne Kontakte/Einsätze vorher manuell
--     aufzuräumen)
--   • Audit-Trail ist implizit vorhanden
--
-- Nicht-Soft-Delete-Tabellen (Stammdaten / Junction / System):
--   services, lookup_values, roles, user_profiles, memberships_programs,
--   membership_program_benefits, deployment_technicians, entitlements,
--   entitlement_redemptions, notes, appointment_participants.
--
-- Kaskade: nicht implementiert (Kind-Zeilen bleiben referenziert, werden
-- aber über die UI unerreichbar, weil Eltern-Lists filtern). Ausnahme:
-- Einsatz↔Termin-Kopplung — wird in app.js mit einem zweiten
-- Soft-Delete auf `appointments.deployment_id` behandelt.
--
-- Ausführung: in Supabase SQL-Editor als Ganzes (idempotent).
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── deleted_at-Spalte auf den sechs Kern-Tabellen ──────────────────────────
ALTER TABLE public.companies    ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.contacts     ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.projects     ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.deployments  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE public.memberships  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;


-- ─── Partielle Indexe: der Regelfall (deleted_at IS NULL) ist der Filter ────
-- Liefert dem Planner eine Shortcut-Menge für die aktiven Zeilen. Klein, weil
-- nur nicht-gelöschte indiziert werden.

CREATE INDEX IF NOT EXISTS idx_companies_active
  ON public.companies (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contacts_active
  ON public.contacts (company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_active
  ON public.appointments (datum DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_active
  ON public.projects (company_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deployments_active
  ON public.deployments (company_id, project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memberships_active
  ON public.memberships (company_id, status) WHERE deleted_at IS NULL;


-- ═══════════════════════════════════════════════════════════════════════════
-- Verifikation
-- ═══════════════════════════════════════════════════════════════════════════
-- SELECT 'deleted_at auf allen 6 Tabellen (v1.16)' AS pruefung,
--        CASE WHEN (
--          SELECT COUNT(*) FROM information_schema.columns
--          WHERE table_schema='public'
--            AND column_name='deleted_at'
--            AND table_name IN ('companies','contacts','appointments',
--                               'projects','deployments','memberships')
--        ) = 6 THEN 'OK' ELSE 'TEILWEISE' END AS status;
