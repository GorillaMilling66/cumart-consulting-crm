-- v2.33.15 — Aufräumen: Test-Projekt „ifm GmbH" + seine zwei Einsätze soft-löschen
-- ============================================================================
-- Kontext: Das Projekt „Automtisierungscoaching - ifm GmbH"
-- (1d4fe69a-a664-4478-8c55-d988cbcee666) war laut Selcuk (03.06.2026) nur ein
-- Testlauf, um den Anlage-Flow zu prüfen — kein echter Kundeneinsatz. Daran
-- hängen genau zwei Einsätze (89d48f67-…, d09631c5-…), beide am 22.05. angelegt,
-- sofort auf „durchgefuehrt" gesetzt, nie datiert. Das sind exakt die zwei
-- Phase-B-#2-Funde des QA-Sweeps (durchgeführt ohne Datum). v2.33.14 hat den
-- UI-Guard gebaut, der das künftig verhindert; diese Migration räumt die
-- vorhandenen Altbestände auf.
--
-- Footprint sauber abgegrenzt (Stand 03.06.2026, per Management API verifiziert):
--   * keine entitlement_redemptions an den beiden Einsätzen
--   * keine gekoppelten Termine (appointments.deployment_id)
--   * die Firma „ifm GmbH" (b20ab837-e076-4dbc-a711-d25c86b6ba47) hat keine
--     weiteren aktiven Projekte/Einsätze und bleibt als (leerer) CRM-Eintrag
--     erhalten — sie ist ein legitimer Lead, kein Test-Müll.
--
-- Soft-Delete (deleted_at) — umkehrbar via `deleted_at = NULL`.
-- Anwenden: Supabase Management API / SQL-Editor (siehe CLAUDE.md).
-- ----------------------------------------------------------------------------

-- Pre-Check (zur Doku — erwartet: 1 aktives Projekt, 2 aktive Einsätze):
--   SELECT count(*) FROM projects
--    WHERE id='1d4fe69a-a664-4478-8c55-d988cbcee666' AND deleted_at IS NULL;            -- 1
--   SELECT count(*) FROM deployments
--    WHERE id IN ('89d48f67-275c-432a-becd-23ecb760bc93',
--                 'd09631c5-97f1-4192-a21b-bface5a7ed31') AND deleted_at IS NULL;       -- 2

WITH d AS (
  UPDATE deployments
     SET deleted_at = now()
   WHERE id IN ('89d48f67-275c-432a-becd-23ecb760bc93',
                'd09631c5-97f1-4192-a21b-bface5a7ed31')
     AND deleted_at IS NULL
  RETURNING id
),
p AS (
  UPDATE projects
     SET deleted_at = now()
   WHERE id = '1d4fe69a-a664-4478-8c55-d988cbcee666'
     AND deleted_at IS NULL
  RETURNING id
)
SELECT (SELECT count(*) FROM d) AS deployments_soft_deleted,   -- erwartet 2
       (SELECT count(*) FROM p) AS projects_soft_deleted;      -- erwartet 1

-- Post-Check (Verifikation — beide müssen 0 liefern):
--   SELECT count(*) FROM projects
--    WHERE id='1d4fe69a-a664-4478-8c55-d988cbcee666' AND deleted_at IS NULL;            -- 0
--   SELECT count(*) FROM deployments
--    WHERE id IN ('89d48f67-275c-432a-becd-23ecb760bc93',
--                 'd09631c5-97f1-4192-a21b-bface5a7ed31') AND deleted_at IS NULL;       -- 0
