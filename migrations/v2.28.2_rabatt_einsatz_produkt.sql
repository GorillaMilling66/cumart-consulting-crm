-- ═══════════════════════════════════════════════════════════════════════════
-- v2.28.2 — Kundenrabatt pro Einsatz und pro Produktposition
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Optionaler Rabatt pro Position. Zwei Felder:
--   rabatt_typ  text  CHECK ('prozent' | 'betrag')   — NULL = kein Rabatt
--   rabatt_wert numeric                              — Wert (z. B. 10 für 10% oder 50.00 für 50€)
--
-- Wirkt sowohl auf den Kundenpreis im Bericht als auch auf die interne Marge
-- (echter Rabatt — wir lügen uns die Marge nicht künstlich hoch).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.deployments
  ADD COLUMN IF NOT EXISTS rabatt_typ  text CHECK (rabatt_typ IN ('prozent','betrag')),
  ADD COLUMN IF NOT EXISTS rabatt_wert numeric;

ALTER TABLE public.project_products
  ADD COLUMN IF NOT EXISTS rabatt_typ  text CHECK (rabatt_typ IN ('prozent','betrag')),
  ADD COLUMN IF NOT EXISTS rabatt_wert numeric;

-- Verifikation
SELECT 'deployments.rabatt_typ'    AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='deployments' AND column_name='rabatt_typ')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'deployments.rabatt_wert',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='deployments' AND column_name='rabatt_wert')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'project_products.rabatt_typ',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='project_products' AND column_name='rabatt_typ')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'project_products.rabatt_wert',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='project_products' AND column_name='rabatt_wert')
       THEN 'OK' ELSE 'FEHLT' END;
