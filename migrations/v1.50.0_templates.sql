-- ═══════════════════════════════════════════════════════════════════════════
-- v1.50.0 — Templates für Anlage-Modale
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Eine Tabelle für Vorlagen, die im Termin-/Aufgabe-/Einsatz-/Projekt-Modal
-- als "Aus Template"-Dropdown angeboten werden. Auswahl füllt nicht-leere
-- Felder aus dem `daten`-JSON ins Formular. Datumsfelder werden nicht
-- vorbelegt (kontext-spezifisch, vom User je Anlage gefüllt).
--
-- Pflege: Admin-only (analog lookup_values). Lesen für alle authenticated.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS public.templates (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  typ           text NOT NULL CHECK (typ IN ('termin','aufgabe','einsatz','projekt')),
  name          text NOT NULL,
  daten         jsonb NOT NULL DEFAULT '{}'::jsonb,
  reihenfolge   integer NOT NULL DEFAULT 0,
  ist_aktiv     boolean NOT NULL DEFAULT true,
  erstellt_von  uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_templates_typ_active
  ON public.templates(typ, reihenfolge)
  WHERE ist_aktiv = true;

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Lesen: alle authenticated User (auch Nicht-Admins, damit das Dropdown
-- befüllt werden kann). Admin-only Policy für INSERT/UPDATE/DELETE.
DROP POLICY IF EXISTS "templates_select_authenticated" ON public.templates;
CREATE POLICY "templates_select_authenticated" ON public.templates
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "templates_admin_write" ON public.templates;
CREATE POLICY "templates_admin_write" ON public.templates
  AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
      WHERE up.id = auth.uid() AND r.name = 'Admin'
    )
  );

DROP POLICY IF EXISTS "templates_admin_update" ON public.templates;
CREATE POLICY "templates_admin_update" ON public.templates
  AS PERMISSIVE FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
      WHERE up.id = auth.uid() AND r.name = 'Admin'
    )
  );

DROP POLICY IF EXISTS "templates_admin_delete" ON public.templates;
CREATE POLICY "templates_admin_delete" ON public.templates
  AS PERMISSIVE FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
      WHERE up.id = auth.uid() AND r.name = 'Admin'
    )
  );

-- RESTRICTIVE: inaktive User komplett aussperren (Auth-Hardening v1.15)
DROP POLICY IF EXISTS "only_active_users" ON public.templates;
CREATE POLICY "only_active_users" ON public.templates
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user())
  WITH CHECK (public.is_active_user());

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────
-- Verifikation: Tabelle existiert + 5 Policies (4 PERMISSIVE + 1 RESTRICTIVE)
-- ─────────────────────────────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM information_schema.tables
     WHERE table_schema='public' AND table_name='templates') AS tabelle_existiert,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='templates') AS policy_count;
