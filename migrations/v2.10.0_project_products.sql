-- ═══════════════════════════════════════════════════════════════════════════
-- v2.10.0 — Produkt-Verkaufspositionen im Projekt (Phase 2 zu v2.6.0)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher: Wirtschaftlichkeit eines Projekts ergibt sich ausschließlich aus
-- Einsätzen (Σ menge × einzelpreis als Aufwand vs. geschaetzter_umsatz als
-- Paketpreis). Hardware-Verkauf (Spannmittel, Halter, …) ließ sich nicht am
-- Projekt erfassen.
--
-- Neu: Tabelle project_products als Verkaufspositionen. Pro Position ein Flag
-- im_paket:
--   - true  → Position ist im geschaetzter_umsatz enthalten; nur EK fließt
--             als Aufwand ein (analog zu Projekt-Einsätzen).
--   - false → Position liegt zusätzlich neben dem Paketpreis; VK ist
--             zusätzlicher Erlös, EK zusätzlicher Aufwand.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.project_products (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  product_id        uuid REFERENCES public.products(id) ON DELETE SET NULL,
  bezeichnung       text NOT NULL,                                  -- Snapshot des Produktnamens (überlebt Produkt-Löschung/Umbenennung)
  menge             numeric(12,3) NOT NULL DEFAULT 1,
  einzelpreis_vk    numeric(12,2) NOT NULL DEFAULT 0,                -- Snapshot von products.verkaufspreis bei Anlage; editierbar
  einzelpreis_ek    numeric(12,2) NOT NULL DEFAULT 0,                -- Snapshot von products.einkaufspreis bei Anlage; editierbar
  im_paket          boolean NOT NULL DEFAULT false,
  notizen           text,
  erstellt_von      uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz                                      -- Soft-Delete analog zu Hauptobjekten
);

CREATE INDEX IF NOT EXISTS idx_project_products_project ON public.project_products(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_products_product ON public.project_products(product_id) WHERE deleted_at IS NULL;

-- RLS — Pattern aus project_rls_policy_pattern (PERMISSIVE + RESTRICTIVE).
ALTER TABLE public.project_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS project_products_all_authenticated ON public.project_products;
CREATE POLICY project_products_all_authenticated ON public.project_products
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.project_products;
CREATE POLICY only_active_users ON public.project_products
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

-- ── Verifizierung ──────────────────────────────────────────────────────────
SELECT 'project_products-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='project_products')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'project_products.im_paket',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='project_products' AND column_name='im_paket')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'project_products RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='project_products') = 2
       THEN 'OK' ELSE 'FEHLT' END;
