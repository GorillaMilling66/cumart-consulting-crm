-- ═══════════════════════════════════════════════════════════════════════════
-- v1.15.0 — Auth-Härtung
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Adressiert Roadmap §13.1 (Items 1–4):
--   1. Last-Admin-Schutz (auch gegen Status-Inaktivierung, nicht nur Delete/Role-Downgrade)
--   2. Role-Self-Escalation blockiert (authenticated darf eigene role_id nicht ändern)
--   3. Login-Blocker für Status=inaktiv serverseitig (RLS statt nur Client-Check)
--   4. Auto-Transition eingeladen → aktiv beim ersten Passwortwechsel (DB-Trigger)
--
-- Ausführung: in Supabase SQL-Editor als Ganzes ausführen (idempotent).
-- Verifikation: am Ende dieses Files + Gesamt-Query in architecture.md §14.6.
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 1. Helper: ist der aufrufende User aktiv? ───────────────────────────────
-- Wird als RESTRICTIVE-Policy auf allen operativen Tabellen verwendet.
-- SECURITY DEFINER, damit die Funktion die user_profiles-Zeile des Callers
-- lesen kann, auch wenn RLS auf user_profiles restriktiv ist.

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND status = 'aktiv'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_active_user() TO authenticated;


-- ─── 2. Restrictive Policy „nur aktive User" auf allen operativen Tabellen ──
-- RESTRICTIVE-Policies werden zusätzlich zu bestehenden PERMISSIVE-Policies
-- ausgewertet (AND-Verknüpfung), d.h. diese Änderung verschärft nur, ohne
-- bestehende RLS-Regeln zu brechen.
--
-- Ausgelassen:
--   • user_profiles  — inaktive User müssen ihr eigenes Profil lesen können,
--                      damit der Client "Konto deaktiviert"-Screen zeigen kann
--   • roles          — wird über user_profiles.roles(name) gejoint; wenn es
--                      für aktive User zugänglich ist, reicht das

DO $$
DECLARE
  tbl text;
  tbls text[] := ARRAY[
    'companies',
    'contacts',
    'appointments',
    'projects',
    'deployments',
    'deployment_technicians',
    'services',
    'lookup_values',
    'memberships',
    'membership_programs',
    'membership_program_benefits',
    'entitlements',
    'entitlement_redemptions',
    'notes',
    'appointment_participants'
  ];
BEGIN
  FOREACH tbl IN ARRAY tbls LOOP
    -- Sicherstellen, dass RLS aktiv ist (idempotent)
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

    -- Alte Fassung entfernen, damit die Migration wiederholbar ist
    EXECUTE format('DROP POLICY IF EXISTS "only_active_users" ON public.%I', tbl);

    EXECUTE format($f$
      CREATE POLICY "only_active_users" ON public.%I
        AS RESTRICTIVE
        FOR ALL
        TO authenticated
        USING (public.is_active_user())
        WITH CHECK (public.is_active_user())
    $f$, tbl);
  END LOOP;
END $$;


-- ─── 3. user_profiles UPDATE-Guard ──────────────────────────────────────────
-- Ein einziger BEFORE-UPDATE-Trigger deckt drei Anforderungen ab:
--   (a) Last-Admin-Schutz (gilt IMMER — auch für service_role / Edge Function)
--   (b) Role-Self-Escalation geblockt für authenticated
--   (c) Auto-activate: eingeladen → aktiv beim ersten Passwortwechsel
--       + Status-Änderung durch authenticated wird stumm zurückgerollt
--
-- Der Trigger läuft als SECURITY INVOKER (default), damit current_user
-- korrekt den Aufrufer widerspiegelt (authenticated vs. service_role vs.
-- postgres).

CREATE OR REPLACE FUNCTION public.user_profiles_update_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  old_role_name text;
  new_role_name text;
  admin_count   int;
  is_privileged boolean;
BEGIN
  is_privileged := current_user IN ('service_role', 'postgres', 'supabase_admin');

  SELECT name INTO old_role_name FROM public.roles WHERE id = OLD.role_id;
  SELECT name INTO new_role_name FROM public.roles WHERE id = NEW.role_id;

  -- (a) Last-Admin-Schutz — gilt IMMER, egal wer aufruft.
  --     Auslöser: bisher aktiver Admin wird inaktiv ODER verliert Admin-Rolle.
  IF OLD.status = 'aktiv'
     AND old_role_name = 'Admin'
     AND (NEW.status IS DISTINCT FROM 'aktiv'
          OR new_role_name IS DISTINCT FROM 'Admin') THEN
    SELECT COUNT(*) INTO admin_count
      FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
     WHERE up.status = 'aktiv'
       AND r.name = 'Admin'
       AND up.id <> NEW.id;

    IF admin_count < 1 THEN
      RAISE EXCEPTION
        'Der letzte aktive Admin kann nicht deaktiviert oder degradiert werden. Lege erst einen weiteren Admin an.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  -- Ab hier: authenticated-Regeln (service_role / postgres überspringen)
  IF is_privileged THEN
    RETURN NEW;
  END IF;

  -- (b) role_id ist für authenticated schreibgeschützt
  IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
    RAISE EXCEPTION
      'Rollenwechsel nur über die Benutzerverwaltung möglich.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;

  -- (c) status wird serverseitig kontrolliert:
  --     - Erster Passwortwechsel flippt eingeladen → aktiv
  --     - Alle anderen status-Änderungen durch authenticated werden
  --       stumm zurückgerollt (NEW.status := OLD.status)
  IF OLD.muss_passwort_aendern = true
     AND NEW.muss_passwort_aendern = false
     AND OLD.status = 'eingeladen' THEN
    NEW.status := 'aktiv';
  ELSE
    NEW.status := OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_update_guard ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_update_guard
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.user_profiles_update_guard();


-- ─── 4. user_profiles DELETE-Guard (Last-Admin) ─────────────────────────────
-- Feuert auch bei ON DELETE CASCADE aus auth.users, d.h. bildet die letzte
-- Verteidigungslinie falls die Edge-Function-Prüfung umgangen wird (Direct-DB,
-- manueller Supabase-Dashboard-Delete etc.).

CREATE OR REPLACE FUNCTION public.prevent_last_admin_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  old_role_name text;
  admin_count   int;
BEGIN
  SELECT name INTO old_role_name FROM public.roles WHERE id = OLD.role_id;

  IF OLD.status = 'aktiv' AND old_role_name = 'Admin' THEN
    SELECT COUNT(*) INTO admin_count
      FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
     WHERE up.status = 'aktiv'
       AND r.name = 'Admin'
       AND up.id <> OLD.id;

    IF admin_count < 1 THEN
      RAISE EXCEPTION
        'Der letzte aktive Admin kann nicht gelöscht werden. Lege erst einen weiteren Admin an.'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_last_admin_delete ON public.user_profiles;
CREATE TRIGGER trg_prevent_last_admin_delete
  BEFORE DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_last_admin_delete();


-- ═══════════════════════════════════════════════════════════════════════════
-- Verifikation (nach der Migration ausführen, sollte alles "OK" liefern)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- SELECT 'is_active_user function' AS pruefung,
--        CASE WHEN EXISTS (
--          SELECT 1 FROM pg_proc p
--          JOIN pg_namespace n ON n.oid = p.pronamespace
--          WHERE n.nspname = 'public' AND p.proname = 'is_active_user'
--        ) THEN 'OK' ELSE 'FEHLT' END AS status
-- UNION ALL
-- SELECT 'trg_user_profiles_update_guard',
--        CASE WHEN EXISTS (
--          SELECT 1 FROM pg_trigger
--          WHERE tgrelid = 'public.user_profiles'::regclass
--            AND tgname = 'trg_user_profiles_update_guard'
--        ) THEN 'OK' ELSE 'FEHLT' END
-- UNION ALL
-- SELECT 'trg_prevent_last_admin_delete',
--        CASE WHEN EXISTS (
--          SELECT 1 FROM pg_trigger
--          WHERE tgrelid = 'public.user_profiles'::regclass
--            AND tgname = 'trg_prevent_last_admin_delete'
--        ) THEN 'OK' ELSE 'FEHLT' END
-- UNION ALL
-- SELECT 'Restrictive Policy only_active_users auf companies',
--        CASE WHEN EXISTS (
--          SELECT 1 FROM pg_policies
--          WHERE schemaname = 'public' AND tablename = 'companies'
--            AND policyname = 'only_active_users'
--        ) THEN 'OK' ELSE 'FEHLT' END
-- UNION ALL
-- SELECT 'Restrictive Policies auf allen 15 operativen Tabellen',
--        CASE WHEN (
--          SELECT COUNT(*) FROM pg_policies
--          WHERE schemaname = 'public' AND policyname = 'only_active_users'
--        ) = 15 THEN 'OK' ELSE 'TEILWEISE' END;
