-- ═══════════════════════════════════════════════════════════════════════════
-- v2.12.0 — Einsatz-Bündel (Mehrtages-Klammer mit per-Tag-Override)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Use-Case: ein Trainer hat 3 nicht zusammenhängende Tage am gleichen Projekt
-- (Mo + Mi + Fr). Bisher legt das CRM 3 unabhängige Einsätze an, jeder mit
-- eigener Doku/Vorbereitung/Abrechnung — Dokumentations-Overhead pro Tag.
--
-- Neu: `deployment_bundles` als gemeinsame Klammer. Pro Bündel ein Satz
-- geteilter Felder (Titel, Service, Einzelpreis, Doku, Ort, internes Team,
-- Beschreibung, Notizen). Die einzelnen Einsätze hängen via `bundle_id` ans
-- Bündel und halten nur noch die per-Tag-Daten (Datum, Uhrzeit, Status, Menge).
--
-- Hybrid-Modus: jeder Einsatz kann shared Felder individuell überschreiben.
-- Die überschriebenen Feldnamen liegen in `deployments.bundle_overrides`
-- (jsonb-Array von Field-Keys). Beim Speichern des Bündels werden die shared
-- Werte nur dort propagiert, wo das Feld NICHT im overrides-Array steht.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Bundle-Tabelle (geteilte Stammdaten)
CREATE TABLE IF NOT EXISTS public.deployment_bundles (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titel             text NOT NULL,
  beschreibung      text,
  dokumentation     jsonb NOT NULL DEFAULT '{}'::jsonb,
  notizen           text,
  service_id        uuid REFERENCES public.services(id) ON DELETE SET NULL,
  einzelpreis       numeric(12,2) NOT NULL DEFAULT 0,
  ort               text,
  externe_techniker text,
  company_id        uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  project_id        uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  erstellt_von      uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_bundles_project ON public.deployment_bundles(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bundles_company ON public.deployment_bundles(company_id) WHERE deleted_at IS NULL;

-- 2. Junction für internes Team am Bündel
CREATE TABLE IF NOT EXISTS public.deployment_bundle_technicians (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id   uuid NOT NULL REFERENCES public.deployment_bundles(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bundle_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bundle_techs_bundle ON public.deployment_bundle_technicians(bundle_id);

-- 3. deployments-Tabelle erweitern: bundle_id + bundle_overrides
ALTER TABLE public.deployments
  ADD COLUMN IF NOT EXISTS bundle_id uuid REFERENCES public.deployment_bundles(id) ON DELETE SET NULL;
ALTER TABLE public.deployments
  ADD COLUMN IF NOT EXISTS bundle_overrides jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_deployments_bundle ON public.deployments(bundle_id) WHERE deleted_at IS NULL;

-- 4. RLS — Pattern aus project_rls_policy_pattern.md
ALTER TABLE public.deployment_bundles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deployment_bundles_all_authenticated ON public.deployment_bundles;
CREATE POLICY deployment_bundles_all_authenticated ON public.deployment_bundles
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.deployment_bundles;
CREATE POLICY only_active_users ON public.deployment_bundles
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

ALTER TABLE public.deployment_bundle_technicians ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deployment_bundle_technicians_all_authenticated ON public.deployment_bundle_technicians;
CREATE POLICY deployment_bundle_technicians_all_authenticated ON public.deployment_bundle_technicians
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.deployment_bundle_technicians;
CREATE POLICY only_active_users ON public.deployment_bundle_technicians
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

-- ── Verifizierung ──────────────────────────────────────────────────────────
SELECT 'deployment_bundles-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='deployment_bundles')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'deployment_bundle_technicians-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='deployment_bundle_technicians')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'deployments.bundle_id',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='deployments' AND column_name='bundle_id')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'deployments.bundle_overrides',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='deployments' AND column_name='bundle_overrides')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'deployment_bundles RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='deployment_bundles') = 2
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'deployment_bundle_technicians RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='deployment_bundle_technicians') = 2
       THEN 'OK' ELSE 'FEHLT' END;
