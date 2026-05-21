-- ═══════════════════════════════════════════════════════════════════════════
-- v2.32.6 — Ansprechpartner am Einsatz (deployments.contact_id)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher hatte ein Einsatz nur company_id, keinen Kontakt. Eine Firma kann
-- aber mehrere Ansprechpartner haben (z. B. Fertigungsleiter / Programmierer)
-- und unterschiedliche Einsätze beim selben Kunden können mit unterschied-
-- lichen Personen vereinbart sein. Diese Migration ergänzt einen optionalen
-- FK auf contacts pro Einsatz und pro Einsatz-Bündel.
--
-- Verhalten beim Soft-/Hard-Delete eines Kontakts: SET NULL (Einsatz bleibt,
-- Kontakt-Bezug wird genullt). Analog zu appointments.contact_id und
-- tasks.contact_id.
--
-- Idempotent — IF NOT EXISTS.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS contact_id uuid
  REFERENCES contacts(id) ON DELETE SET NULL;

ALTER TABLE deployment_bundles
  ADD COLUMN IF NOT EXISTS contact_id uuid
  REFERENCES contacts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_deployments_contact_id
  ON deployments(contact_id) WHERE contact_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_deployment_bundles_contact_id
  ON deployment_bundles(contact_id) WHERE contact_id IS NOT NULL;

COMMENT ON COLUMN deployments.contact_id IS
  'Optionaler Ansprechpartner des Einsatzes (v2.32.6). Eine Firma kann mehrere Ansprechpartner haben; unterschiedliche Einsätze beim selben Kunden können verschiedene Personen referenzieren.';
COMMENT ON COLUMN deployment_bundles.contact_id IS
  'Optionaler Ansprechpartner des Einsatz-Bündels (v2.32.6). Wird beim Anlegen eines Bündels auf alle enthaltenen Einsatz-Tage propagiert.';

-- Verifikation
SELECT
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployments' AND column_name = 'contact_id'
  ) THEN '✓ deployments.contact_id' ELSE '✗ deployments.contact_id FEHLT' END AS check_1
UNION ALL
SELECT
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'deployment_bundles' AND column_name = 'contact_id'
  ) THEN '✓ deployment_bundles.contact_id' ELSE '✗ deployment_bundles.contact_id FEHLT' END;
