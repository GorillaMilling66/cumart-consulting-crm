-- ═══════════════════════════════════════════════════════════════════════════
-- v2.3.0 — Pins (Favoriten) für Firmen / Projekte / Kontakte
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Eine User pinnt häufig genutzte Firmen/Projekte/Kontakte, damit sie auf
-- dem Arbeitsplatz dauerhaft oben stehen — unabhängig von "Zuletzt besucht"
-- (das nur passiv mitschreibt).
--
-- Schema: separate Tabelle statt Spalten auf Hauptobjekten — typ-übergreifend,
-- per-user (für später wenn das CRM aus Solo wächst), klare RLS-Trennung.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.pins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('company','project','contact')),
  entity_id   uuid NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_pins_user ON public.pins(user_id, created_at DESC);

ALTER TABLE public.pins ENABLE ROW LEVEL SECURITY;

-- RLS-Pattern dieses Repos: PERMISSIVE all_authenticated + RESTRICTIVE only_active_users
-- (siehe v1.15 Auth-Härtung). Pinnen ist nicht sensibel; alle Authenticated dürfen.
DROP POLICY IF EXISTS pins_all_authenticated ON public.pins;
CREATE POLICY pins_all_authenticated ON public.pins
  AS PERMISSIVE FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.pins;
CREATE POLICY only_active_users ON public.pins
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (is_active_user()) WITH CHECK (is_active_user());

-- Verifizierung
SELECT 'pins-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='pins')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'pins RLS aktiv',
       CASE WHEN EXISTS (SELECT 1 FROM pg_class c
           JOIN pg_namespace n ON n.oid=c.relnamespace
           WHERE n.nspname='public' AND c.relname='pins' AND c.relrowsecurity=true)
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'pins_all_authenticated Policy',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policies
           WHERE schemaname='public' AND tablename='pins' AND policyname='pins_all_authenticated')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'only_active_users Policy auf pins',
       CASE WHEN EXISTS (SELECT 1 FROM pg_policies
           WHERE schemaname='public' AND tablename='pins' AND policyname='only_active_users')
       THEN 'OK' ELSE 'FEHLT' END;
