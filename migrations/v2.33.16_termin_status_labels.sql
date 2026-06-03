-- v2.33.16 — termin_status-Anzeige-Labels auf Title-Case harmonisieren
-- ============================================================================
-- Kontext: Mit v2.33.16 wird der t-status-Select im Termin-Modal DB-getrieben
-- (aus lookup_values.kategorie='termin_status'), genau wie d-status/p-status.
-- Dabei fiel auf: termin_status war die einzige Status-Kategorie mit klein-
-- geschriebenen `wert`-Labels ('geplant', 'durchgefuehrt'), während
-- einsatz_status/projekt_status durchgängig Title-Case nutzen ('Geplant',
-- 'Durchgeführt', 'Ungeplant', ...). Da `dispStatus()`/`getStatusLabel()` das
-- `wert`-Label anzeigen, erschien der Termin-Status appweit kleingeschrieben
-- (Listen, Pillen) — inkonsistent zum Rest. Diese Migration harmonisiert NUR
-- das Anzeige-Label.
--
-- WICHTIG: Der `system_key` (Identitäts-Spalte seit v2.31) bleibt
-- 'geplant'/'durchgefuehrt' unangetastet — daher brechen KEINE Status-
-- Vergleiche (Auto-Status, Checkbox-Toggle, Filter laufen alle über system_key,
-- siehe CLAUDE.md Block 2). `wert` ist das mandantenfrei umbenennbare Label.
--
-- Anwenden: Supabase Management API / SQL-Editor (siehe CLAUDE.md).
-- ----------------------------------------------------------------------------

UPDATE lookup_values SET wert = 'Geplant'
 WHERE kategorie = 'termin_status' AND system_key = 'geplant'       AND wert <> 'Geplant';

UPDATE lookup_values SET wert = 'Durchgeführt'
 WHERE kategorie = 'termin_status' AND system_key = 'durchgefuehrt' AND wert <> 'Durchgeführt';

-- Verifikation (erwartet: geplant→'Geplant', durchgefuehrt→'Durchgeführt'):
--   SELECT system_key, wert FROM lookup_values
--    WHERE kategorie='termin_status' ORDER BY reihenfolge;
