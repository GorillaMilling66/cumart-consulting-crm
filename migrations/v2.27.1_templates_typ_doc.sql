-- ═══════════════════════════════════════════════════════════════════════════
-- v2.27.1 — `templates.typ` um 'doc' erweitern
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Die CHECK-Constraint auf `templates.typ` erlaubt heute nur
-- termin/aufgabe/einsatz/projekt. Doku-Bundles brauchen einen eigenen
-- Typ-Wert 'doc', damit die Liste auf der Templates-Seite und der Editor
-- im Template-Modal eindeutig sind.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_typ_check;
ALTER TABLE public.templates
  ADD CONSTRAINT templates_typ_check
  CHECK (typ = ANY (ARRAY['termin'::text, 'aufgabe'::text, 'einsatz'::text, 'projekt'::text, 'doc'::text]));

-- Verifikation
SELECT 'templates.typ erlaubt doc' AS pruefung,
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_constraint
         WHERE conrelid = 'public.templates'::regclass
           AND conname = 'templates_typ_check'
           AND pg_get_constraintdef(oid) LIKE '%doc%'
       ) THEN 'OK' ELSE 'FEHLT' END AS status;
