-- ═══════════════════════════════════════════════════════════════════════════
-- RESTORE STAMMDATEN — rekonstruiert lookup_values nach dem Wipe v1.45.6
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Quelle: aus dem app.js-Code abgeleitete kanonische Werte je Kategorie.
-- Idempotent: jeder Wert wird nur eingefügt, wenn (kategorie, wert) noch
-- nicht existiert — kann also auch nach manuellen Ergänzungen sicher
-- noch einmal laufen.
--
-- Behält: alles was bereits in lookup_values steht.
-- Ergänzt: nur fehlende (kategorie, wert)-Paare.
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

-- ── termin_status (lowercase + ohne Umlaute, DB-Konvention) ────────────────
INSERT INTO lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('termin_status', 'geplant',       '#1d4ed8', 10, true),
  ('termin_status', 'durchgefuehrt', '#16a34a', 20, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
);

-- ── projekt_status ─────────────────────────────────────────────────────────
INSERT INTO lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('projekt_status', 'Lead',           '#6b7280', 10, true),
  ('projekt_status', 'Angebot',        '#1d4ed8', 20, true),
  ('projekt_status', 'In Arbeit',      '#d97706', 30, true),
  ('projekt_status', 'Abschlussphase', '#7c3aed', 40, true),
  ('projekt_status', 'Abgeschlossen',  '#16a34a', 50, true),
  ('projekt_status', 'Verloren',       '#dc2626', 60, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
);

-- ── einsatz_status (Title-Case mit Umlauten) ───────────────────────────────
INSERT INTO lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('einsatz_status', 'Geplant',      '#1d4ed8', 10, true),
  ('einsatz_status', 'Durchgeführt', '#16a34a', 20, true),
  ('einsatz_status', 'Abgerechnet',  '#047857', 30, true),
  ('einsatz_status', 'Storniert',    '#dc2626', 40, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
);

-- ── aufgabe_status (lowercase) ─────────────────────────────────────────────
INSERT INTO lookup_values (kategorie, wert, farbe, reihenfolge, ist_aktiv)
SELECT * FROM (VALUES
  ('aufgabe_status', 'offen',     '#6b7280', 10, true),
  ('aufgabe_status', 'in_arbeit', '#d97706', 20, true),
  ('aufgabe_status', 'erledigt',  '#16a34a', 30, true)
) AS v(kategorie, wert, farbe, reihenfolge, ist_aktiv)
WHERE NOT EXISTS (
  SELECT 1 FROM lookup_values lv
  WHERE lv.kategorie = v.kategorie AND lv.wert = v.wert
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
