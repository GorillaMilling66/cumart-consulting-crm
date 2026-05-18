-- ═══════════════════════════════════════════════════════════════════════════
-- ⚠️  ⚠️  ⚠️   ACHTUNG — DIESE MIGRATION NOCH NICHT APPLIZIEREN!   ⚠️  ⚠️  ⚠️
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Status: WIP — Block 2 Foundation-Commit (v2.29.1).
-- Diese Migration darf erst angewendet werden, wenn ALLE ~350 Magic-String-
-- Stellen in app.js auf Dual-Mode (normalizeStatus / dualStatus / system_keys)
-- umgestellt sind. Aktuell sind nur Migration-File + Helpers + Auto-Status-
-- Funktionen + _activityStatusStyle umgestellt — der Rest folgt in
-- inkrementellen Sessions.
--
-- Wer diese Migration jetzt anwendet, bricht alle übrigen Status-Filter,
-- Status-Pillen, Sort-Maps und Update-Operations in der Cumart-Live-App.
-- Sobald Block 2 vollständig ist, wird dieser WARN-Header entfernt und das
-- File auf v2.30.0 final hochgesetzt (siehe Roadmap in architecture.md §12).
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- v2.30.0 — System-Keys für Status-Lookups (Multi-Instanz-Tauglichkeit)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher referenziert app.js Status-Werte über ihre deutschen Labels
-- ('Abgeschlossen', 'Durchgeführt', …). Wenn ein Mandant (z. B. FiveAx)
-- ein Label umbenennt, brechen ~170 hartcodierte Stellen — insbesondere
-- die Auto-Status-Logik (checkAndUpdateProjectStatus*).
--
-- Diese Migration trennt **Identität** (system_key) von **Anzeige** (wert):
--
--   lookup_values bekommt eine Spalte `system_key TEXT`, eindeutig pro
--   Kategorie. Der Code referenziert ab Block 2 ausschließlich system_keys.
--   `wert` ist nur noch die UI-Anzeige und kann vom Mandanten frei
--   umbenannt werden, ohne dass irgendwas bricht.
--
--   Die Status-Spalten in projects / deployments / appointments / tasks
--   werden auf die system_keys umgestellt (UPDATE in dieser Migration).
--   Damit hängt die Daten-Identität nicht mehr am Anzeige-Label.
--
-- Konvention für system_keys: lowercase snake_case ASCII (kein Umlaut,
-- kein ß). Beispiele: lead, in_arbeit, abschlussphase, durchgefuehrt.
--
-- Sicherheits-Hinweise:
--   • Idempotent: jede Stufe prüft IF NOT EXISTS / IS NULL.
--   • In einer Transaktion: alles oder nichts.
--   • Verifikations-Block am Ende: muss 0 Zeilen Unbekanntes liefern.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. lookup_values bekommt system_key + UNIQUE-Index pro Kategorie
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.lookup_values
  ADD COLUMN IF NOT EXISTS system_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS lookup_values_kategorie_system_key_uniq
  ON public.lookup_values (kategorie, system_key)
  WHERE system_key IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Backfill: bekannte Status-Werte bekommen ihren system_key
-- ─────────────────────────────────────────────────────────────────────────

-- projekt_status
UPDATE public.lookup_values SET system_key = 'lead'              WHERE kategorie = 'projekt_status' AND wert = 'Lead'              AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'angebot'           WHERE kategorie = 'projekt_status' AND wert = 'Angebot'           AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'in_arbeit'         WHERE kategorie = 'projekt_status' AND wert = 'In Arbeit'         AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'abschlussphase'    WHERE kategorie = 'projekt_status' AND wert = 'Abschlussphase'    AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'abgeschlossen'     WHERE kategorie = 'projekt_status' AND wert = 'Abgeschlossen'     AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'verloren'          WHERE kategorie = 'projekt_status' AND wert = 'Verloren'          AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'storniert'         WHERE kategorie = 'projekt_status' AND wert = 'Storniert'         AND system_key IS NULL;

-- einsatz_status
UPDATE public.lookup_values SET system_key = 'ungeplant'         WHERE kategorie = 'einsatz_status' AND wert = 'Ungeplant'         AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'geplant'           WHERE kategorie = 'einsatz_status' AND wert = 'Geplant'           AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'durchgefuehrt'     WHERE kategorie = 'einsatz_status' AND wert = 'Durchgeführt'      AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'abgerechnet'       WHERE kategorie = 'einsatz_status' AND wert = 'Abgerechnet'       AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'storniert'         WHERE kategorie = 'einsatz_status' AND wert = 'Storniert'         AND system_key IS NULL;

-- termin_status (schon lowercase, nur system_key setzen)
UPDATE public.lookup_values SET system_key = 'geplant'           WHERE kategorie = 'termin_status' AND wert = 'geplant'             AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'durchgefuehrt'     WHERE kategorie = 'termin_status' AND wert = 'durchgefuehrt'       AND system_key IS NULL;

-- aufgabe_status
UPDATE public.lookup_values SET system_key = 'offen'             WHERE kategorie = 'aufgabe_status' AND wert = 'offen'              AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'erledigt'          WHERE kategorie = 'aufgabe_status' AND wert = 'erledigt'           AND system_key IS NULL;
UPDATE public.lookup_values SET system_key = 'storniert'         WHERE kategorie = 'aufgabe_status' AND wert = 'Storniert'          AND system_key IS NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Status-Spalten in den Entity-Tabellen auf system_keys umstellen
-- ─────────────────────────────────────────────────────────────────────────

-- projects.status
UPDATE public.projects SET status = 'lead'             WHERE status = 'Lead';
UPDATE public.projects SET status = 'angebot'          WHERE status = 'Angebot';
UPDATE public.projects SET status = 'in_arbeit'        WHERE status = 'In Arbeit';
UPDATE public.projects SET status = 'abschlussphase'   WHERE status = 'Abschlussphase';
UPDATE public.projects SET status = 'abgeschlossen'    WHERE status = 'Abgeschlossen';
UPDATE public.projects SET status = 'verloren'         WHERE status = 'Verloren';
UPDATE public.projects SET status = 'storniert'        WHERE status = 'Storniert';

-- deployments.status
UPDATE public.deployments SET status = 'ungeplant'      WHERE status = 'Ungeplant';
UPDATE public.deployments SET status = 'geplant'        WHERE status = 'Geplant';
UPDATE public.deployments SET status = 'durchgefuehrt'  WHERE status = 'Durchgeführt';
UPDATE public.deployments SET status = 'abgerechnet'    WHERE status = 'Abgerechnet';
UPDATE public.deployments SET status = 'storniert'      WHERE status = 'Storniert';

-- appointments.status — schon lowercase, nichts zu tun (Defensive: nochmal explizit)
-- (kein UPDATE nötig; Werte bleiben 'geplant' / 'durchgefuehrt')

-- tasks.status — 'Storniert' (Capitalized!) auf 'storniert' angleichen
UPDATE public.tasks SET status = 'storniert'            WHERE status = 'Storniert';
-- 'offen' und 'erledigt' bleiben unverändert.

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Verifikation — muss 0 Zeilen "unbekannt" liefern
-- ─────────────────────────────────────────────────────────────────────────

-- Welche Status-Lookup-Werte haben noch keinen system_key?
DO $$
DECLARE
  unmapped_count INT;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM public.lookup_values
  WHERE kategorie IN ('projekt_status', 'einsatz_status', 'termin_status', 'aufgabe_status')
    AND ist_aktiv = true
    AND system_key IS NULL;
  IF unmapped_count > 0 THEN
    RAISE EXCEPTION 'Migration-Fail: % aktive Status-Lookup-Werte ohne system_key (siehe SELECT … WHERE system_key IS NULL nach Rollback).', unmapped_count;
  END IF;
END $$;

-- Welche Entity-Records haben einen Status, den es nicht (mehr) als system_key gibt?
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

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Visueller Verifikations-Output (außerhalb der Transaktion)
-- ─────────────────────────────────────────────────────────────────────────
SELECT 'lookup_values' AS bereich, kategorie, wert AS label, system_key, ist_aktiv
FROM public.lookup_values
WHERE kategorie IN ('projekt_status', 'einsatz_status', 'termin_status', 'aufgabe_status')
ORDER BY kategorie, COALESCE(reihenfolge, 999), wert;

SELECT 'projects'     AS bereich, status, COUNT(*) AS anzahl FROM public.projects     GROUP BY status ORDER BY status;
SELECT 'deployments'  AS bereich, status, COUNT(*) AS anzahl FROM public.deployments  GROUP BY status ORDER BY status;
SELECT 'appointments' AS bereich, status, COUNT(*) AS anzahl FROM public.appointments GROUP BY status ORDER BY status;
SELECT 'tasks'        AS bereich, status, COUNT(*) AS anzahl FROM public.tasks        GROUP BY status ORDER BY status;
