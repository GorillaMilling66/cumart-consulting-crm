-- Migration v2.33.0 — Projekt-Status auf system_keys normalisieren
-- Erzeugt: 28.05.2026
-- Hintergrund: Phase B des QA-Sweeps hat 2 Projekte in der Produktion gefunden,
-- die noch Title-Case-Labels statt system_keys in `projects.status` halten.
-- Die Quelle ist der Status-Picker (`_loadStatusOptions` / `selectEntityStatus`
-- in app.js), der `lookup_values.wert` statt `system_key` in die DB schreibt
-- (wird in einem Folge-Patch behoben). Diese Migration heilt den bereits
-- entstandenen Daten-Drift.
--
-- v2.31 hat die Konvention etabliert, dass `projects.status` ausschließlich
-- system_keys aus `lookup_values` (Kategorie `projekt_status`, ist_aktiv=true)
-- enthält. Werte mit Title-Case-Label brechen Auto-Status-Logik, Filter
-- und Pillen-Darstellung silent.
--
-- Strategie:
-- 1. Defensive Generalisierung: jeder Wert in projects.status, der nicht
--    in den aktiven system_keys vorkommt, aber als `wert` (Label) eines
--    aktiven Lookups existiert, wird auf den passenden system_key gemappt.
-- 2. Verifikations-Query am Ende: 0 Treffer = alle projects-Status sauber.

BEGIN;

-- Snapshot der zu korrigierenden Zeilen (für Logging im SQL-Editor)
WITH drift AS (
  SELECT p.id, p.name, p.status AS alt_status, lv.system_key AS neu_status
  FROM projects p
  LEFT JOIN lookup_values lv
    ON lv.kategorie = 'projekt_status'
   AND lv.ist_aktiv = true
   AND lv.wert = p.status
  WHERE p.deleted_at IS NULL
    AND p.status NOT IN (
      SELECT system_key FROM lookup_values
       WHERE kategorie = 'projekt_status' AND ist_aktiv = true AND system_key IS NOT NULL
    )
)
SELECT id, name, alt_status, neu_status FROM drift;

-- Eigentlicher Update: nur Status, deren Label eindeutig auf einen aktiven
-- system_key zeigt. Status ohne Lookup-Match werden NICHT angefasst (manuelle
-- Klärung).
UPDATE projects p
   SET status = lv.system_key
  FROM lookup_values lv
 WHERE lv.kategorie = 'projekt_status'
   AND lv.ist_aktiv = true
   AND lv.wert = p.status
   AND p.status NOT IN (
     SELECT system_key FROM lookup_values
      WHERE kategorie = 'projekt_status' AND ist_aktiv = true AND system_key IS NOT NULL
   );

-- Verifikation: jede aktive Projekt-Zeile hat jetzt einen gültigen system_key.
-- Bei korrektem Lauf liefert die Query 0 Zeilen.
SELECT id, name, status AS verbleibender_drift
  FROM projects
 WHERE deleted_at IS NULL
   AND status NOT IN (
     SELECT system_key FROM lookup_values
      WHERE kategorie = 'projekt_status' AND ist_aktiv = true AND system_key IS NOT NULL
   );

COMMIT;
