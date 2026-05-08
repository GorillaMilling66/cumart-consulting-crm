-- ═══════════════════════════════════════════════════════════════════════════
-- v2.6.0 — Produkte + Lieferantenmanagement (Phase 1)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Hardware-Verkauf (Spannmittel, Halter, Werkzeuge): Produktkatalog mit EK/VK,
-- Lieferanten als Rolle einer Firma (eine Firma kann gleichzeitig Kunde und
-- Lieferant sein).
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Lieferant-Marker auf companies — eine Firma kann sowohl Kunde als auch
-- Lieferant sein, daher zusätzlich zu `typ_id` (das bleibt für die Haupt-
-- klassifizierung).
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS ist_lieferant boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_companies_lieferant ON public.companies(ist_lieferant) WHERE ist_lieferant = true;

-- 2. Produktkatalog
CREATE TABLE IF NOT EXISTS public.products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  beschreibung          text,
  artikelnummer         text,                                       -- intern
  hersteller_artikelnr  text,                                       -- extern (vom Lieferanten)
  einheit               text DEFAULT 'Stk',                         -- Stk, m, kg, Set, ...
  einkaufspreis         numeric(12,2) NOT NULL DEFAULT 0,
  verkaufspreis         numeric(12,2) NOT NULL DEFAULT 0,
  kategorie             text,                                       -- Spannmittel, Halter, Werkzeug, ...
  lieferant_id          uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  notizen               text,
  ist_aktiv             boolean NOT NULL DEFAULT true,
  erstellt_von          uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz                                 -- Soft-Delete analog zu Hauptobjekten
);

CREATE INDEX IF NOT EXISTS idx_products_active    ON public.products(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_lieferant ON public.products(lieferant_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_products_kategorie ON public.products(kategorie) WHERE deleted_at IS NULL;

-- 3. RLS — analog zum bestehenden Pattern
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_all_authenticated ON public.products;
CREATE POLICY products_all_authenticated ON public.products
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.products;
CREATE POLICY only_active_users ON public.products
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (is_active_user()) WITH CHECK (is_active_user());

-- Verifizierung
SELECT 'companies.ist_lieferant' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='companies' AND column_name='ist_lieferant')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'products-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='products')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'products RLS aktiv',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='products') = 2
       THEN 'OK' ELSE 'FEHLT' END;
