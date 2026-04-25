-- ═══════════════════════════════════════════════════════════════════════════
-- v1.40.0 — Aufgabe↔Termin-Kopplung
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Eine Aufgabe kann optional als Termin im Kalender erscheinen (Checkbox im
-- Aufgabe-Modal). Realisierung über eine neue FK-Spalte `appointments.task_id`,
-- die — falls gesetzt — auf die ursprüngliche Aufgabe verweist.
--
-- Verhalten (siehe Cross-Entity-Logik §8.4 Termin-Einsatz-Kopplung als Muster):
--   • Checkbox aktiv + kein Termin existiert → neuer Termin wird erzeugt
--   • Checkbox aktiv + Termin existiert      → Termin wird aktualisiert
--   • Checkbox inaktiv + Termin existiert    → Termin wird soft-gelöscht
--   • Aufgabe wird gelöscht                  → gekoppelter Termin folgt
--
-- Kopplung ist EINSEITIG: Aufgabe → Termin. Eine manuelle Termin-Bearbeitung
-- propagiert nicht zurück in die Aufgabe (würde sonst die Aufgabe-Felder
-- überschreiben, wenn der User den Termin manuell anpasst).
--
-- ON DELETE SET NULL: Wenn eine Aufgabe hart gelöscht würde (sollte nicht
-- vorkommen — wir nutzen Soft-Delete), bleibt der Termin als Stand-Alone
-- bestehen.
--
-- Index auf task_id, damit der Lookup beim Listen-Render schnell ist
-- (z. B. Map task_id → appointment_id für das Kalender-Icon in Listen).
--
-- Ausführung: in Supabase SQL-Editor als Ganzes (idempotent).
-- ═══════════════════════════════════════════════════════════════════════════


-- ─── 1. Spalte `task_id` in appointments ────────────────────────────────────
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS task_id UUID
  REFERENCES public.tasks(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.appointments.task_id IS
  'Wenn gesetzt: Termin wurde aus einer Aufgabe synchronisiert (Aufgabe→Termin-Kopplung, v1.40).';


-- ─── 2. Index für Reverse-Lookup (task_id → appointment) ────────────────────
-- Partial Index nur auf Zeilen mit task_id IS NOT NULL — typischerweise wenig
-- Zeilen, daher kompakt und schnell.
CREATE INDEX IF NOT EXISTS idx_appointments_task_id
  ON public.appointments(task_id)
  WHERE task_id IS NOT NULL;


-- ─── 3. Verifizierung ───────────────────────────────────────────────────────
-- Sollte zwei Zeilen liefern: die Spalte + der Index.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'appointments' AND column_name = 'task_id'
  ) THEN
    RAISE EXCEPTION 'Migration v1.40.0 fehlgeschlagen: appointments.task_id nicht angelegt.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_appointments_task_id'
  ) THEN
    RAISE EXCEPTION 'Migration v1.40.0 fehlgeschlagen: idx_appointments_task_id nicht angelegt.';
  END IF;
  RAISE NOTICE 'Migration v1.40.0 erfolgreich angewendet.';
END $$;
