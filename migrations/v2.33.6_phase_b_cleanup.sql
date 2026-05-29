-- Migration v2.33.6 — Phase-B-Müll-Aufräumen aus dem QA-Sweep
-- Erzeugt: 29.05.2026
--
-- Aufräum-Migration für zwei konkrete Datensätze, die der Live-Daten-Audit
-- vom 28.05.2026 (qa/findings-data.md) identifiziert hat:
--
-- 1. B-Befund #4: Einsatz `81319be2-37f4-4c52-ac96-be9b6b9bb7e4` zeigt auf
--    ein soft-gelöschtes Projekt (`ed661e87-…` „Testprojekt v3", gelöscht
--    am 13.05.2026). Beim Projekt-Soft-Delete wurden die Einsätze nicht
--    mit-kaskadiert — das Live-Symptom des Cluster-6-Bugs, der in v2.33.6
--    auch im Code (`_performSoftDelete`) gefixt wird. Diese Migration heilt
--    den einen verwaisten Bestands-Einsatz.
--
-- 2. B-Befunde #5/#6: Projekt `4d2a6400-68ee-4afe-92ee-2c9d5225e35d`
--    („AWT-Training P2 - ALT!") ist Status `in_arbeit` ohne irgendeinen
--    Einsatz und mit `preis_nach_aufwand=false` + `geschaetzter_umsatz=0`.
--    Beide Zustände sind fachlich widersprüchlich; der Name signalisiert
--    Müll. Soft-Delete.
--
-- Beides ist als reine Daten-Aufräumung markiert — kein Schema-Change.
-- Sollte sich der Stand zwischen Audit und Migration geändert haben (z. B.
-- Selcuk hat einen der beiden Records inzwischen selbst aufgeräumt), wird
-- der UPDATE 0 Zeilen treffen und die RETURNING-Liste ist leer.

BEGIN;

-- ── B #4: verwaister Einsatz auf soft-deleted Projekt ─────────
UPDATE deployments
   SET deleted_at = '2026-05-29 12:00:00+00'
 WHERE id = '81319be2-37f4-4c52-ac96-be9b6b9bb7e4'
   AND deleted_at IS NULL
RETURNING id, titel, status, project_id;

-- ── B #5/#6: Müll-Projekt „AWT-Training P2 - ALT!" ────────────
UPDATE projects
   SET deleted_at = '2026-05-29 12:00:00+00'
 WHERE id = '4d2a6400-68ee-4afe-92ee-2c9d5225e35d'
   AND deleted_at IS NULL
RETURNING id, name, status, preis_nach_aufwand, geschaetzter_umsatz;

-- ── Verifikation: beide aktive Datensätze sollten weg sein ────
SELECT 'waise_einsatz_aktiv' AS kontrolle,
       (SELECT count(*) FROM deployments
         WHERE id = '81319be2-37f4-4c52-ac96-be9b6b9bb7e4' AND deleted_at IS NULL) AS treffer
UNION ALL
SELECT 'alt_projekt_aktiv',
       (SELECT count(*) FROM projects
         WHERE id = '4d2a6400-68ee-4afe-92ee-2c9d5225e35d' AND deleted_at IS NULL);

COMMIT;
