-- ═══════════════════════════════════════════════════════════════════════════
-- v2.11.0 — Termin-Teams: zusätzliche Kunden-Kontakte + interne Teilnehmer
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher hatte ein Termin nur einen `contact_id` (Hauptkontakt, FK auf contacts)
-- und keine Möglichkeit, interne Kollegen einzubinden. Die Tabelle
-- `appointment_participants` (id, appointment_id, user_id) existiert seit der
-- Initial-Migration, war aber nie über die UI angebunden.
--
-- Neu:
--   1) Junction `appointment_contacts` für weitere Kunden-Kontakte (neben dem
--      Hauptkontakt `appointments.contact_id`). Spiegelt das Pattern von
--      `appointment_participants`, aber für `contacts` statt `user_profiles`.
--   2) `appointment_participants` (interne User) wird über die UI angebunden —
--      hier nur die RLS-Policies absichern, falls die Tabelle aus einer
--      älteren Migration ohne Policies kommt.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Junction für weitere Kunden-Kontakte
CREATE TABLE IF NOT EXISTS public.appointment_contacts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  contact_id      uuid NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_appointment_contacts_appt    ON public.appointment_contacts(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_contacts_contact ON public.appointment_contacts(contact_id);

-- 2. RLS — Pattern aus project_rls_policy_pattern.md
ALTER TABLE public.appointment_contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS appointment_contacts_all_authenticated ON public.appointment_contacts;
CREATE POLICY appointment_contacts_all_authenticated ON public.appointment_contacts
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.appointment_contacts;
CREATE POLICY only_active_users ON public.appointment_contacts
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

-- 3. appointment_participants RLS absichern (idempotent — existiert evtl. schon).
ALTER TABLE public.appointment_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS appointment_participants_all_authenticated ON public.appointment_participants;
CREATE POLICY appointment_participants_all_authenticated ON public.appointment_participants
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.appointment_participants;
CREATE POLICY only_active_users ON public.appointment_participants
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

-- ── Verifizierung ──────────────────────────────────────────────────────────
SELECT 'appointment_contacts-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='appointment_contacts')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'appointment_contacts RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='appointment_contacts') = 2
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'appointment_participants RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='appointment_participants') = 2
       THEN 'OK' ELSE 'FEHLT' END;
