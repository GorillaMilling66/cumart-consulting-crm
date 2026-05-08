-- ═══════════════════════════════════════════════════════════════════════════
-- v2.7.2 — Mitgliedschafts-Programme: Laufzeit-Modus (Monate vs. Kalenderjahr)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher hat ein Programm eine `laufzeit_monate` (z.B. 12). Beim Anlegen einer
-- Mitgliedschaft wurde das Enddatum als Startdatum + N Monate berechnet.
--
-- Neu: Manche Programme laufen bewusst auf KALENDERJAHR (z.B. „TNC-Club Premium"
-- 01.01. → 31.12.) — das wollen wir am Programm konfigurieren, sodass die
-- Mitgliedschafts-Anlage die Daten direkt vorbelegt.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.membership_programs
  ADD COLUMN IF NOT EXISTS laufzeit_modus text NOT NULL DEFAULT 'monate'
    CHECK (laufzeit_modus IN ('monate','kalenderjahr'));

-- Verifizierung
SELECT 'membership_programs.laufzeit_modus' AS pruefung,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns
         WHERE table_schema='public' AND table_name='membership_programs'
           AND column_name='laufzeit_modus'
       ) THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'CHECK-Constraint laufzeit_modus',
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_constraint
         WHERE conrelid='public.membership_programs'::regclass
           AND conname LIKE '%laufzeit_modus%'
       ) THEN 'OK' ELSE 'FEHLT' END;
