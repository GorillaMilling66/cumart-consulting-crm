-- ═══════════════════════════════════════════════════════════════════════════
-- v1.52.0 — Strukturierte Dokumentation für Projekt / Termin / Einsatz
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Eine `dokumentation` jsonb-Spalte pro Entität. Inhalt strukturiert nach
-- Entitätstyp (siehe DOCUMENTATION_SCHEMAS in app.js):
--   projects:     kundenherausforderung, loesungsansatz, themenwahl,
--                 erfolgskriterien, anmerkungen
--   appointments: gespraechsinhalt, vereinbarungen, naechste_schritte,
--                 anmerkungen
--   deployments:  durchgefuehrte_themen, teilnehmer, erkenntnisse,
--                 folge_massnahmen, anmerkungen
--
-- Daten-Migration: bestehender `notizen`-Inhalt wandert in
-- dokumentation.anmerkungen, damit nichts verloren geht. Die Spalte
-- `notizen` bleibt erhalten (Backup; Schreib-Pfade gehen aber zukünftig
-- über `dokumentation`).
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Spalten anlegen (idempotent)
ALTER TABLE public.projects     ADD COLUMN IF NOT EXISTS dokumentation jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS dokumentation jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.deployments  ADD COLUMN IF NOT EXISTS dokumentation jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Daten-Migration: notizen → dokumentation.anmerkungen
--    Nur wenn (a) notizen gefüllt ist und (b) anmerkungen noch leer/abwesend
--    (idempotent, doppeltes Apply schreibt nicht zweimal).
UPDATE public.projects
   SET dokumentation = jsonb_set(dokumentation, '{anmerkungen}', to_jsonb(notizen))
 WHERE notizen IS NOT NULL AND btrim(notizen) <> ''
   AND COALESCE(dokumentation->>'anmerkungen', '') = '';

UPDATE public.appointments
   SET dokumentation = jsonb_set(dokumentation, '{anmerkungen}', to_jsonb(notizen))
 WHERE notizen IS NOT NULL AND btrim(notizen) <> ''
   AND COALESCE(dokumentation->>'anmerkungen', '') = '';

UPDATE public.deployments
   SET dokumentation = jsonb_set(dokumentation, '{anmerkungen}', to_jsonb(notizen))
 WHERE notizen IS NOT NULL AND btrim(notizen) <> ''
   AND COALESCE(dokumentation->>'anmerkungen', '') = '';

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────
-- Verifikation:
--   - alle drei Tabellen haben die Spalte (info_schema=3)
--   - migrierte Zeilen sind sichtbar (Anzahl je Tabelle)
-- ─────────────────────────────────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND column_name='dokumentation'
       AND table_name IN ('projects','appointments','deployments')) AS spalten_existieren,
  (SELECT count(*) FROM public.projects     WHERE dokumentation ? 'anmerkungen') AS migriert_projects,
  (SELECT count(*) FROM public.appointments WHERE dokumentation ? 'anmerkungen') AS migriert_appointments,
  (SELECT count(*) FROM public.deployments  WHERE dokumentation ? 'anmerkungen') AS migriert_deployments;
