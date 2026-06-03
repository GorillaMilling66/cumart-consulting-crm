-- ═══════════════════════════════════════════════════════════════════════════
-- RESTORE STAMMDATEN — rekonstruiert lookup_values nach dem Wipe v1.45.6
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Quelle: aus dem app.js-Code abgeleitete kanonische Werte je Kategorie.
-- Idempotent: Status-Kategorien matchen auf (kategorie, system_key), die
-- übrigen auf (kategorie, wert) — kann also auch nach manuellen Ergänzungen
-- sicher noch einmal laufen.
--
-- v2.33.17 (Phase C #6): Status-Kategorien (termin/projekt/einsatz/aufgabe_status)
-- führen jetzt die Identitäts-Spalte `system_key` mit. Seit v2.30/v2.31 ist
-- `system_key` die Identität für Status (Auto-Status, Filter, Pillen); ein
-- Seed OHNE system_key hätte bei einem Frisch-Setup den App-Boot gebrochen
-- (Status-Vergleiche matchen nicht). `wert` ist nur das Anzeige-Label.
--
-- Behält: alles was bereits in lookup_values steht.
-- Ergänzt: nur fehlende Einträge je Kategorie.
--
-- NICHT enthalten: services, membership_programs — die sind business-
-- spezifisch und werden vom User manuell oder per separater Migration
-- wiederhergestellt.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Helper: einfügen wenn (kategorie, wert) noch nicht existiert.
-- Nutzt einen Plain-INSERT … WHERE NOT EXISTS (kein UNIQUE-Index nötig).

-- ── unternehmens_typ ───────────────────────────────────────────────────────
INSERT INTO lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('unternehmens_typ', 'Kunde',       '#16a34a', 10, true),
  ('unternehmens_typ', 'Interessent', '#d97706', 20, true),
  ('unternehmens_typ', 'Partner',     '#2563eb', 30, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
);

-- ── termin_typ ─────────────────────────────────────────────────────────────
INSERT INTO lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('termin_typ', 'Vor Ort',  '#1d4ed8', 10, true),
  ('termin_typ', 'Online',   '#7c3aed', 20, true),
  ('termin_typ', 'Call',     '#0891b2', 30, true),
  ('termin_typ', 'Meeting',  '#475569', 40, true),
  ('termin_typ', 'Schulung', '#16a34a', 50, true),
  ('termin_typ', 'Kickoff',  '#d97706', 60, true),
  ('termin_typ', 'Nachfass', '#9333ea', 70, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
);

-- ── termin_status (system_key = lowercase Identität, wert = Title-Case Label) ──
INSERT INTO lookup_values (kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('termin_status', 'Geplant',      'geplant',       '#1d4ed8', 10, true),
  ('termin_status', 'Durchgeführt', 'durchgefuehrt', '#16a34a', 20, true)
) AS v(kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.system_key = v.system_key
);

-- ── projekt_status (system_key = lowercase Identität) ──────────────────────
INSERT INTO lookup_values (kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('projekt_status', 'Lead',           'lead',           '#6b7280', 10, true),
  ('projekt_status', 'Angebot',        'angebot',        '#1d4ed8', 20, true),
  ('projekt_status', 'In Arbeit',      'in_arbeit',      '#d97706', 30, true),
  ('projekt_status', 'Abschlussphase', 'abschlussphase', '#7c3aed', 40, true),
  ('projekt_status', 'Abgeschlossen',  'abgeschlossen',  '#16a34a', 50, true),
  ('projekt_status', 'Verloren',       'verloren',       '#dc2626', 60, true)
) AS v(kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.system_key = v.system_key
);

-- ── einsatz_status (system_key = lowercase Identität, inkl. Ungeplant) ─────
INSERT INTO lookup_values (kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('einsatz_status', 'Ungeplant',    'ungeplant',     '#6b7280',  5, true),
  ('einsatz_status', 'Geplant',      'geplant',       '#1d4ed8', 10, true),
  ('einsatz_status', 'Durchgeführt', 'durchgefuehrt', '#16a34a', 20, true),
  ('einsatz_status', 'Abgerechnet',  'abgerechnet',   '#047857', 30, true),
  ('einsatz_status', 'Storniert',    'storniert',     '#dc2626', 40, true)
) AS v(kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.system_key = v.system_key
);

-- ── aufgabe_status (system_key = lowercase Identität) ──────────────────────
INSERT INTO lookup_values (kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('aufgabe_status', 'Offen',     'offen',     '#6b7280', 10, true),
  ('aufgabe_status', 'In Arbeit', 'in_arbeit', '#d97706', 20, true),
  ('aufgabe_status', 'Erledigt',  'erledigt',  '#16a34a', 30, true)
) AS v(kategorie, wert, system_key, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.system_key = v.system_key
);

-- ── leistungs_kategorie (Cumart Consulting Geschäftsbereiche) ──────────────
INSERT INTO lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('leistungs_kategorie', 'Training',        '#1d4ed8', 10, true),
  ('leistungs_kategorie', 'Consulting',      '#7c3aed', 20, true),
  ('leistungs_kategorie', 'Online-Session',  '#0891b2', 30, true),
  ('leistungs_kategorie', 'Support',         '#475569', 40, true),
  ('leistungs_kategorie', 'Mitgliedschaft',  '#047857', 50, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
);

COMMIT;

-- Verifikation: pro Kategorie zählen, was angekommen ist.
SELECT kategorie, COUNT(*) AS anzahl
FROM lookup_values
WHERE ist_aktiv = true
GROUP BY kategorie
ORDER BY kategorie;
