-- ═══════════════════════════════════════════════════════════════════════════
-- v2.28.9 — Projekte können „nach Aufwand" abgerechnet werden
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher hat jedes Projekt einen Festpreis (geschaetzter_umsatz / Paketpreis).
-- Manche Projekte werden aber nicht pauschal, sondern nach tatsächlich
-- erbrachten Einsätzen + Produkten abgerechnet. Für diese Fälle:
--
--   preis_nach_aufwand = true  → Kunden-Endpreis = Σ Einsatz-Netti + Σ Produkt-VK
--                                Paketpreis-Feld bleibt informativ/leer.
--   preis_nach_aufwand = false → wie bisher: Paketpreis ist die Erlös-Basis.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS preis_nach_aufwand boolean NOT NULL DEFAULT false;

-- Verifikation
SELECT 'projects.preis_nach_aufwand' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='projects' AND column_name='preis_nach_aufwand')
       THEN 'OK' ELSE 'FEHLT' END AS status;
