-- ═══════════════════════════════════════════════════════════════════════════
-- v1.24.0 — ABC-Klassifizierung auf companies
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Neues Feld `abc_klassifizierung` zur strategischen Einstufung von Kunden:
--   A = Kern-/Top-Kunde (hoher Wert, hohe Priorität)
--   B = wichtiger Kunde
--   C = geringerer strategischer Wert
--   NULL = noch nicht klassifiziert (Default)
--
-- Anzeige farbig im Dashboard auf Firmen-Detail und in der Firmen-Liste.
-- Edit über Firmen-Modal (Pflicht-Eingabe entfällt — Admin pflegt bei Bedarf).
--
-- CHECK-Constraint erlaubt nur 'A', 'B', 'C' oder NULL. Das ist anders als
-- bei Status-Werten (projekt_status / einsatz_status / aufgabe_status), wo
-- wir bewusst keine CHECK haben — aber ABC ist ein semantisch fixes Schema
-- (kein Lookup-Katalog, keine Admin-Erweiterung geplant).
--
-- Ausführung: in Supabase SQL-Editor oder via Management API (idempotent).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS abc_klassifizierung text;

-- CHECK-Constraint nur hinzufügen wenn noch nicht vorhanden
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'companies_abc_klassifizierung_check'
      AND conrelid = 'public.companies'::regclass
  ) THEN
    ALTER TABLE public.companies
      ADD CONSTRAINT companies_abc_klassifizierung_check
      CHECK (abc_klassifizierung IN ('A', 'B', 'C') OR abc_klassifizierung IS NULL);
  END IF;
END $$;

-- Partieller Index auf klassifizierte Zeilen (selten gefiltert, aber schnell)
CREATE INDEX IF NOT EXISTS idx_companies_abc
  ON public.companies (abc_klassifizierung)
  WHERE deleted_at IS NULL AND abc_klassifizierung IS NOT NULL;


-- ═══════════════════════════════════════════════════════════════════════════
-- Verifikation
-- ═══════════════════════════════════════════════════════════════════════════
-- SELECT 'Spalte abc_klassifizierung auf companies (v1.24)' AS pruefung,
--        CASE WHEN EXISTS (
--          SELECT 1 FROM information_schema.columns
--          WHERE table_schema='public' AND table_name='companies'
--            AND column_name='abc_klassifizierung'
--        ) THEN 'OK' ELSE 'FEHLT' END AS status
-- UNION ALL
-- SELECT 'CHECK-Constraint companies_abc_klassifizierung_check',
--        CASE WHEN EXISTS (
--          SELECT 1 FROM pg_constraint
--          WHERE conname = 'companies_abc_klassifizierung_check'
--        ) THEN 'OK' ELSE 'FEHLT' END;
