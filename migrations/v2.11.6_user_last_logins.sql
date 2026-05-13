-- ═══════════════════════════════════════════════════════════════════════════
-- v2.11.6 — Letzter Login pro Benutzer (Admin-only)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Der Login-Zeitstempel lebt in `auth.users.last_sign_in_at`, ist aber für
-- normale authenticated-Clients nicht direkt lesbar (Supabase-Auth-Schema).
-- Damit Admins den letzten Login in der Benutzerverwaltung sehen können,
-- legen wir eine SECURITY-DEFINER-Funktion an, die intern auf `auth.users`
-- zugreift und vorher selbst prüft, ob der Aufrufer Admin ist.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.user_last_logins()
RETURNS TABLE (id uuid, last_sign_in_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Admin-Gate: nur aktive User mit Rolle „Admin" dürfen die Funktion ausführen.
  IF NOT EXISTS (
    SELECT 1
      FROM public.user_profiles up
      JOIN public.roles r ON r.id = up.role_id
     WHERE up.id = auth.uid()
       AND r.name = 'Admin'
       AND up.status = 'aktiv'
  ) THEN
    RAISE EXCEPTION 'Nur Admins dürfen Login-Zeiten abfragen.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT u.id, u.last_sign_in_at
      FROM auth.users u;
END;
$$;

GRANT EXECUTE ON FUNCTION public.user_last_logins() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.user_last_logins() FROM PUBLIC, anon;

-- ── Verifizierung ──────────────────────────────────────────────────────────
SELECT 'user_last_logins-Function' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc p
           JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public' AND p.proname = 'user_last_logins')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'user_last_logins SECURITY DEFINER',
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc p
           JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public' AND p.proname = 'user_last_logins'
             AND p.prosecdef = true)
       THEN 'OK' ELSE 'FEHLT' END;
