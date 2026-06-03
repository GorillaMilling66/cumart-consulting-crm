-- v2.33.18 — aufgabe_status: fehlenden 'storniert'-Lookup ergänzen
-- ============================================================================
-- Kontext (Phase A.1 #10 / B-Audit Low #10): Der Code referenziert
-- `TASK_STATUS.STORNIERT` (Strikethrough-Logik bei Aufgaben) und CLAUDE.md
-- listet `TASK_STATUS.{OFFEN, IN_ARBEIT, ERLEDIGT, STORNIERT}` — aber die
-- Stammdaten (`lookup_values`, Kategorie `aufgabe_status`) kannten nur
-- offen/in_arbeit/erledigt. Der Status-Wert war damit nie setzbar (toter Zweig).
--
-- Der Aufgaben-Status-Picker (a-status) ist lookup-getrieben (aufgabeStatusCache),
-- d.h. mit diesem Eintrag erscheint „Storniert" automatisch im Dropdown und die
-- bereits vorhandene Strikethrough-Logik greift — konsistent zu den anderen
-- Entitäten (einsatz_status hat 'storniert' längst). `system_key` ist die
-- Identität, `wert` das Anzeige-Label.
--
-- Anwenden: Supabase Management API / SQL-Editor (siehe CLAUDE.md). Idempotent.
-- ----------------------------------------------------------------------------

INSERT INTO lookup_values (kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
SELECT 'aufgabe_status', 'Storniert', 'storniert', '#dc2626', 40, true
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values
   WHERE kategorie = 'aufgabe_status' AND system_key = 'storniert'
);

-- Label-Harmonisierung: 'offen'/'erledigt' waren als einzige aufgabe_status-
-- Labels kleingeschrieben (in_arbeit war bereits „In Arbeit"). Title-Case
-- angleichen, damit alle vier Status-Kategorien konsistent sind. NUR das
-- Anzeige-`wert`; der `system_key` (Identität) bleibt unverändert.
UPDATE lookup_values SET wert = 'Offen'
 WHERE kategorie = 'aufgabe_status' AND system_key = 'offen'    AND wert <> 'Offen';
UPDATE lookup_values SET wert = 'Erledigt'
 WHERE kategorie = 'aufgabe_status' AND system_key = 'erledigt' AND wert <> 'Erledigt';

-- Verifikation (erwartet: Offen, In Arbeit, Erledigt, Storniert):
--   SELECT system_key, wert, reihenfolge FROM lookup_values
--    WHERE kategorie='aufgabe_status' AND ist_aktiv=true ORDER BY reihenfolge;
