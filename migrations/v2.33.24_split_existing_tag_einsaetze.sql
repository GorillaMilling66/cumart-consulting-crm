-- v2.33.24 — Bestehende Tag-Einsätze (Menge>1) in einzelne Werktags-Tage aufteilen
-- ============================================================================
-- Einmalige Daten-Migration analog zur Bündel-Save-Logik aus v2.33.23 (Option A,
-- von Selcuk gewählt): eine pro-Tag-Leistung (services.einheit='Tag') mit Menge N
-- = N einzelne Einsatztage. Diese Migration teilt die VORHANDENEN solchen
-- Einsätze in N Werktags-Einsätze (je Menge 1) auf, damit Kalender/Auslastung/
-- Umsatz-Verlauf/Briefing alle Tage zeigen.
--
-- Betroffen (4 von 9 Tag-Einsätzen mit Menge>1; per Management API ermittelt):
--   * faadac8e… „Inbetriebnahmeunterstützung"        Bündel,    M5  → 01.06.–05.06.
--   * 5f4b760c… „Schulung TNC640 Anwendungstechnik"   Bündel,    M5  → 08.06.–12.06.
--   * b605c654… „Tagespauschale Senior Trainer Haas"  standalone,M10 → 01.06.–12.06. (10 Werktage)
--   * aa392e29… „Tagespauschale Senior Trainer SHB"   standalone,M2  → 21.05.–22.05.
-- NICHT betroffen (bewusst): 3 AWT-Trainings ohne Datum (ungeplant, kein Startdatum
-- zum Aufteilen) und 4f6d1aca… (storniert).
--
-- Datumsherleitung: Werktage (Mo–Fr) ab datum_von, Wochenende übersprungen —
-- exakt die Logik aus _bundleWorkingDaysFrom (v2.33.23), headless verifiziert.
-- Pro Einsatz: Original wird Tag 1 (datum_von=datum_bis=Tag1, menge=1), die
-- weiteren Tage werden als Kopien der Zeile angelegt (alle Felder kopiert, nur
-- Datum/Menge überschrieben) + Techniker-Junction mitkopiert. bundle_id wird
-- mitkopiert (Bündel-Member bleiben im Bündel). Reversibel (Kopien löschen,
-- Original-Menge zurücksetzen). Anwenden: Management API / SQL-Editor.
-- ----------------------------------------------------------------------------

-- ── faadac8e (Bündel, Menge 5 → 01.06.–05.06.) ──
WITH newdays(d) AS (VALUES ('2026-06-02'::date),('2026-06-03'),('2026-06-04'),('2026-06-05')),
ins AS (
  INSERT INTO deployments (titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,datum_von,datum_bis,menge)
  SELECT titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,nd.d,nd.d,1
  FROM deployments o CROSS JOIN newdays nd WHERE o.id='faadac8e-b084-4114-99ce-f56bfffb3dff' RETURNING id),
techcopy AS (
  INSERT INTO deployment_technicians (deployment_id,user_id)
  SELECT i.id,t.user_id FROM ins i CROSS JOIN (SELECT user_id FROM deployment_technicians WHERE deployment_id='faadac8e-b084-4114-99ce-f56bfffb3dff') t RETURNING deployment_id)
UPDATE deployments SET datum_von='2026-06-01',datum_bis='2026-06-01',menge=1 WHERE id='faadac8e-b084-4114-99ce-f56bfffb3dff';

-- ── 5f4b760c (Bündel, Menge 5 → 08.06.–12.06.) ──
WITH newdays(d) AS (VALUES ('2026-06-09'::date),('2026-06-10'),('2026-06-11'),('2026-06-12')),
ins AS (
  INSERT INTO deployments (titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,datum_von,datum_bis,menge)
  SELECT titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,nd.d,nd.d,1
  FROM deployments o CROSS JOIN newdays nd WHERE o.id='5f4b760c-786f-4708-b7a4-0fca028f6976' RETURNING id),
techcopy AS (
  INSERT INTO deployment_technicians (deployment_id,user_id)
  SELECT i.id,t.user_id FROM ins i CROSS JOIN (SELECT user_id FROM deployment_technicians WHERE deployment_id='5f4b760c-786f-4708-b7a4-0fca028f6976') t RETURNING deployment_id)
UPDATE deployments SET datum_von='2026-06-08',datum_bis='2026-06-08',menge=1 WHERE id='5f4b760c-786f-4708-b7a4-0fca028f6976';

-- ── b605c654 (standalone, Menge 10 → 01.06.–12.06., 10 Werktage) ──
WITH newdays(d) AS (VALUES ('2026-06-02'::date),('2026-06-03'),('2026-06-04'),('2026-06-05'),('2026-06-08'),('2026-06-09'),('2026-06-10'),('2026-06-11'),('2026-06-12')),
ins AS (
  INSERT INTO deployments (titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,datum_von,datum_bis,menge)
  SELECT titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,nd.d,nd.d,1
  FROM deployments o CROSS JOIN newdays nd WHERE o.id='b605c654-baf2-4f98-9cf4-392658d77df4' RETURNING id),
techcopy AS (
  INSERT INTO deployment_technicians (deployment_id,user_id)
  SELECT i.id,t.user_id FROM ins i CROSS JOIN (SELECT user_id FROM deployment_technicians WHERE deployment_id='b605c654-baf2-4f98-9cf4-392658d77df4') t RETURNING deployment_id)
UPDATE deployments SET datum_von='2026-06-01',datum_bis='2026-06-01',menge=1 WHERE id='b605c654-baf2-4f98-9cf4-392658d77df4';

-- ── aa392e29 (standalone, Menge 2 → 21.05.–22.05.) ──
WITH newdays(d) AS (VALUES ('2026-05-22'::date)),
ins AS (
  INSERT INTO deployments (titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,datum_von,datum_bis,menge)
  SELECT titel,beschreibung,status,project_id,company_id,service_id,einzelpreis,notizen,erstellt_von,uhrzeit_von,uhrzeit_bis,ort,externe_techniker,dokumentation,workflow_state,bundle_id,bundle_overrides,workflow_steps,rabatt_typ,rabatt_wert,contact_id,deleted_at,nd.d,nd.d,1
  FROM deployments o CROSS JOIN newdays nd WHERE o.id='aa392e29-3c7a-4849-a1b0-3c8a2d8b318c' RETURNING id),
techcopy AS (
  INSERT INTO deployment_technicians (deployment_id,user_id)
  SELECT i.id,t.user_id FROM ins i CROSS JOIN (SELECT user_id FROM deployment_technicians WHERE deployment_id='aa392e29-3c7a-4849-a1b0-3c8a2d8b318c') t RETURNING deployment_id)
UPDATE deployments SET datum_von='2026-05-21',datum_bis='2026-05-21',menge=1 WHERE id='aa392e29-3c7a-4849-a1b0-3c8a2d8b318c';

-- Verifikation (separate Query):
--   Bündel a5fd41ae aktive Member = 5; Bündel dd371804 = 5;
--   Tagespauschale-Haas-Tage in Maschinenabnahme-Projekt = 10; SHB-geplant = 2.
