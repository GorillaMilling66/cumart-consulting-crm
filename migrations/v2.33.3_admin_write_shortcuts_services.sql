-- Migration v2.33.3 — RLS-Härtung: shortcuts + services auf Admin-Write
-- Erzeugt: 28.05.2026
--
-- Hintergrund (QA-Sweep Phase A.3 #4 + #12):
-- Beide Tabellen haben aktuell `*_all_authenticated`-Policies (USING true /
-- WITH CHECK true), die jedem authenticated User Insert/Update/Delete
-- erlauben. Die UI gated die Pflege-Modale über `nav-settings-group` und
-- `data-admin-only="true"`, aber das ist ausschließlich Client-Side — ein
-- Insider mit User-Rolle kann via DevTools direkt schreiben.
--
-- Für `shortcuts` ist das besonders relevant, weil die `url`-Spalte aktuell
-- keine Scheme-Validierung hat: ein böswilliger User könnte einen
-- javascript:-URI in `url` schreiben, der dann im Arbeitsplatz-Quick-Link
-- aller anderen User klickbar wird und im Origin der CRM-App JavaScript
-- ausführt → Token-Hijack-Pfad.
--
-- Für `services` ist das Risiko mittelhoch: Standardpreise/Mengen sind
-- finanziell relevant, eine Drittpartei könnte versehentlich oder gezielt
-- Preise verändern.
--
-- Beide Tabellen bekommen das gleiche Policy-Trio wie `lookup_values`:
--   1. SELECT für alle authenticated
--   2. Modify (INSERT/UPDATE/DELETE) nur via is_admin()
--   3. Die RESTRICTIVE-Policy `only_active_users` bleibt unverändert
--      (greift parallel zur SELECT-Permission).
--
-- Side-Effects:
-- - Cache-Invalidierungen im Code (saveService / saveShortcut → load*Cache)
--   bleiben funktional. Non-Admins werden bei Insert-Versuch ein 42501 / RLS-
--   Fehler sehen — ihre UI sollte die Modale gar nicht öffnen (data-admin-only).
-- - Die Verifikations-Query am Ende stellt sicher, dass die alten
--   `*_all_authenticated`-Policies wirklich weg sind und das neue Trio aktiv ist.

BEGIN;

-- ─── services ─────────────────────────────────────────────────
DROP POLICY IF EXISTS services_all_authenticated ON public.services;

CREATE POLICY services_select_authenticated ON public.services
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);

CREATE POLICY services_modify_admin ON public.services
  AS PERMISSIVE FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── shortcuts ────────────────────────────────────────────────
DROP POLICY IF EXISTS shortcuts_all_authenticated ON public.shortcuts;

CREATE POLICY shortcuts_select_authenticated ON public.shortcuts
  AS PERMISSIVE FOR SELECT TO authenticated
  USING (true);

CREATE POLICY shortcuts_modify_admin ON public.shortcuts
  AS PERMISSIVE FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ─── Verifikation ─────────────────────────────────────────────
-- Sollte je 3 Policies pro Tabelle zurückgeben (SELECT all_auth, modify_admin,
-- only_active_users RESTRICTIVE). Alte *_all_authenticated mit FOR ALL ohne
-- is_admin-Filter müssen weg sein.
SELECT tablename, policyname, cmd, permissive, qual::text
  FROM pg_policies
 WHERE tablename IN ('services','shortcuts')
 ORDER BY tablename, cmd, policyname;

COMMIT;
