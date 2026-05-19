-- ═══════════════════════════════════════════════════════════════════════════
-- v2.31.1 — Re-Normalisierung der Status-Spalten auf system_keys
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Block 2 (v2.30.0) hatte die Status-Spalten in projects/deployments/
-- appointments/tasks per UPDATE auf system_keys umgestellt (`'Lead'` → `'lead'`
-- usw.). Zwischen v2.30.0 und v2.31.0 hat das Save-Modal aber weiterhin den
-- Anzeige-Wert `s.wert` (Label) gespeichert, weil das Modal noch nicht auf
-- `s.system_key` umgestellt war — Folge: jeder zwischendurch im Modal
-- bearbeitete Einsatz / Termin / Projekt / Aufgabe hat in der DB wieder
-- ein Label stehen, nicht den system_key.
--
-- Mit v2.31.0 wurden die Dual-Mode-Helper (`statusEq`, `dualStatus`, …)
-- entfernt; Code vergleicht jetzt strikt mit den system_key-Konstanten.
-- Datensätze mit Label-Wert in `status` (z. B. `'Durchgeführt'`) brechen
-- die Wirtschaftlichkeits-, Auto-Projektstatus- und Filter-Logik —
-- sichtbar an z. B. „3 von 4 Einsätzen werden als storniert gezählt".
--
-- Diese Migration wiederholt die UPDATEs aus v2.30.0; sie ist idempotent
-- und betrifft nur Zeilen, deren Status noch ein Legacy-Label trägt.
-- Verifikation am Ende: kein status darf ungemappt sein.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. projects.status
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.projects SET status = 'lead'             WHERE status = 'Lead';
UPDATE public.projects SET status = 'angebot'          WHERE status = 'Angebot';
UPDATE public.projects SET status = 'in_arbeit'        WHERE status = 'In Arbeit';
UPDATE public.projects SET status = 'abschlussphase'   WHERE status = 'Abschlussphase';
UPDATE public.projects SET status = 'abgeschlossen'    WHERE status = 'Abgeschlossen';
UPDATE public.projects SET status = 'verloren'         WHERE status = 'Verloren';
UPDATE public.projects SET status = 'storniert'        WHERE status = 'Storniert';

-- ─────────────────────────────────────────────────────────────────────────
-- 2. deployments.status
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.deployments SET status = 'ungeplant'     WHERE status = 'Ungeplant';
UPDATE public.deployments SET status = 'geplant'       WHERE status = 'Geplant';
UPDATE public.deployments SET status = 'durchgefuehrt' WHERE status = 'Durchgeführt';
UPDATE public.deployments SET status = 'abgerechnet'   WHERE status = 'Abgerechnet';
UPDATE public.deployments SET status = 'storniert'     WHERE status = 'Storniert';

-- ─────────────────────────────────────────────────────────────────────────
-- 3. appointments.status — bereits lowercase, nichts zu tun.
--    (Defensive: falls jemand testweise 'Geplant' geschrieben hat.)
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.appointments SET status = 'geplant'      WHERE status = 'Geplant';
UPDATE public.appointments SET status = 'durchgefuehrt' WHERE status = 'Durchgeführt';

-- ─────────────────────────────────────────────────────────────────────────
-- 4. tasks.status
-- ─────────────────────────────────────────────────────────────────────────
UPDATE public.tasks SET status = 'in_arbeit'           WHERE status = 'In Arbeit';
UPDATE public.tasks SET status = 'storniert'           WHERE status = 'Storniert';
-- 'offen' und 'erledigt' bleiben unverändert (system_key == label).

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Verifikation — kein Entity-Record darf einen status haben, den es
--    nicht (mehr) als system_key in lookup_values gibt.
-- ─────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  orphan_count INT;
BEGIN
  -- projects
  SELECT COUNT(*) INTO orphan_count FROM public.projects p
    WHERE p.status IS NOT NULL
      AND p.status NOT IN (SELECT system_key FROM public.lookup_values WHERE kategorie = 'projekt_status' AND system_key IS NOT NULL);
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Migration-Fail: % projects mit unbekanntem status.', orphan_count;
  END IF;

  -- deployments
  SELECT COUNT(*) INTO orphan_count FROM public.deployments d
    WHERE d.status IS NOT NULL
      AND d.status NOT IN (SELECT system_key FROM public.lookup_values WHERE kategorie = 'einsatz_status' AND system_key IS NOT NULL);
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Migration-Fail: % deployments mit unbekanntem status.', orphan_count;
  END IF;

  -- appointments
  SELECT COUNT(*) INTO orphan_count FROM public.appointments a
    WHERE a.status IS NOT NULL
      AND a.status NOT IN (SELECT system_key FROM public.lookup_values WHERE kategorie = 'termin_status' AND system_key IS NOT NULL);
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Migration-Fail: % appointments mit unbekanntem status.', orphan_count;
  END IF;

  -- tasks
  SELECT COUNT(*) INTO orphan_count FROM public.tasks t
    WHERE t.status IS NOT NULL
      AND t.status NOT IN (SELECT system_key FROM public.lookup_values WHERE kategorie = 'aufgabe_status' AND system_key IS NOT NULL);
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Migration-Fail: % tasks mit unbekanntem status.', orphan_count;
  END IF;
END $$;

COMMIT;
