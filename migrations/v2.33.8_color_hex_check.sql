-- Migration v2.33.8 — CHECK-Constraints auf Farb-Spalten gegen CSS-Injection
-- Erzeugt: 29.05.2026
--
-- Hintergrund (QA-Sweep Phase A.3 #7):
-- Farb-Werte aus `lookup_values.farbe`, `project_themes.farbe` und
-- `theme_library.farbe` werden im Code ~20× über `style="background:${esc(...)}"`
-- ins DOM interpoliert. `esc()` escapt HTML-Spezialzeichen (& < > " '),
-- NICHT CSS-Spezialzeichen wie `;`, `:`, `(`, `)`, `/`, Leerzeichen.
-- Ein böswilliger Eingriff (via DevTools oder kompromittierter Insider)
-- könnte als Farbe z.B. einen Phishing-Layer liefern:
--   `red;position:fixed;top:0;left:0;width:100vw;height:100vh;
--    background:rgba(0,0,0,.9);z-index:9999`
-- → JEDE Pillen-Anzeige würde den Bildschirm überdecken.
--
-- Die UI nutzt `<input type="color">` (gibt nativ nur 7-Zeichen-Hex aus),
-- daher kann der Vektor nur via DevTools-Direkt-Update genutzt werden.
-- Seit v2.33.3 ist lookup_values Admin-write-only — bleibt aber Insider-
-- Vektor und für `project_themes` (alle authenticated dürfen schreiben).
--
-- Diese Migration ergänzt CHECK-Constraints auf allen drei Tabellen.
-- Format-Whitelist: `#rgb` (3), `#rgba` (4), `#rrggbb` (6), `#rrggbbaa` (8)
-- Hex-Pattern, case-insensitive. NULL bleibt erlaubt.
--
-- Pre-Check (vor Migration ausgeführt): 0 Nicht-Hex-Werte im Bestand
-- (lookup_values: 34/0, project_themes: 5/0, theme_library: 2/0).

BEGIN;

ALTER TABLE public.lookup_values
  ADD CONSTRAINT lookup_values_farbe_hex_check
  CHECK (farbe IS NULL OR farbe ~* '^#[0-9a-f]{3,8}$');

ALTER TABLE public.project_themes
  ADD CONSTRAINT project_themes_farbe_hex_check
  CHECK (farbe IS NULL OR farbe ~* '^#[0-9a-f]{3,8}$');

ALTER TABLE public.theme_library
  ADD CONSTRAINT theme_library_farbe_hex_check
  CHECK (farbe IS NULL OR farbe ~* '^#[0-9a-f]{3,8}$');

-- Verifikation: alle drei Constraints angelegt
SELECT conname, conrelid::regclass::text AS tabelle, pg_get_constraintdef(oid) AS definition
  FROM pg_constraint
 WHERE conname IN (
   'lookup_values_farbe_hex_check',
   'project_themes_farbe_hex_check',
   'theme_library_farbe_hex_check'
 )
 ORDER BY conname;

COMMIT;
