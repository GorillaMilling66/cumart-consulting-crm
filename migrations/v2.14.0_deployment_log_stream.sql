-- ═══════════════════════════════════════════════════════════════════════════
-- v2.14.0 — Capture-Stream am Einsatz-Bericht
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher leben Bericht-Inhalte als 5 separate jsonb-Keys in
-- `deployments.dokumentation`: was_wurde_gemacht, erkenntnisse, log_eintrag,
-- vorbereitung, anfahrt, … Statt fester Felder kommt jetzt ein Capture-
-- Stream: jeder Eintrag ist ein eigener Datensatz mit Kategorie + Inhalt
-- + Zeitstempel. UI: oben Capture-Zeile mit Kategorie-Chips, darunter
-- chronologische Liste.
--
-- Die alten dokumentation-Felder bleiben für Backwards-Compat unverändert —
-- die UI rendert sie weiterhin daneben/darunter. Migration der Bestandsdaten
-- in den Stream erfolgt manuell oder optional über einen späteren Helper.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.deployment_log (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_id uuid NOT NULL REFERENCES public.deployments(id) ON DELETE CASCADE,
  kategorie     text NOT NULL CHECK (kategorie IN ('was_gemacht', 'erkenntnis', 'folge', 'log')),
  inhalt        text NOT NULL,
  erstellt_von  uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_deployment_log_dep ON public.deployment_log(deployment_id, created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE public.deployment_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deployment_log_all_authenticated ON public.deployment_log;
CREATE POLICY deployment_log_all_authenticated ON public.deployment_log
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.deployment_log;
CREATE POLICY only_active_users ON public.deployment_log
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

-- Verifizierung
SELECT 'deployment_log-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='deployment_log')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'deployment_log RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='deployment_log') = 2
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'deployment_log CHECK auf kategorie',
       CASE WHEN EXISTS (SELECT 1 FROM pg_constraint
           WHERE conrelid='public.deployment_log'::regclass AND contype='c')
       THEN 'OK' ELSE 'FEHLT' END;
