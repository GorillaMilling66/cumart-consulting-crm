# Phase B — Live-Daten-Audit

**Sweep durchgeführt am:** 2026-05-28
**Datenbank:** loohjeiysjxzbmfwkyvv (Produktion)
**Modus:** read-only (nur SELECTs ausgeführt — keine Mutationen)
**Datenstand:** klein (Single-Tenant Cumart Consulting, im Aufbau)

---

## Info — Bestandsaufnahme

### Row-Counts (alle public-Tabellen)

| Tabelle | Rows | Tabelle | Rows |
|---|---:|---|---:|
| appointment_contacts | 0 | memberships | 5 |
| appointment_participants | 1 | membership_program_benefits | 1 |
| appointments | 3 | membership_programs | 1 |
| attachments | 18 | notes | 4 |
| companies | 257 | pins | 1 |
| contacts | 259 | products | 35 |
| deployment_bundle_technicians | 2 | project_products | 4 |
| deployment_bundles | 1 | project_success_criteria | 2 |
| deployment_log | 14 | project_theme_assignments | 1 |
| deployment_technicians | 23 | project_themes | 5 |
| deployment_themes | 2 | projects | 12 |
| deployments | 24 | roles | 3 |
| doc_sections | 9 | services | 6 |
| entitlement_redemptions | 3 | shortcuts | 2 |
| entitlements | 5 | tags | 1 |
| entity_tags | 2 | tasks | 6 |
| lookup_values | 34 | templates | 5 |
|  |  | theme_library | 2 |
|  |  | user_profiles | 2 |

### Soft-Delete-Stand

| Tabelle | Aktiv | Soft-gelöscht |
|---|---:|---:|
| companies | 251 | 6 |
| contacts | 258 | 1 |
| projects | 8 | 4 |
| deployments | 22 | 2 |
| appointments | 3 | 0 |
| memberships | 5 | 0 |
| tasks | 6 | 0 |

### Status-Histogramm (aktive Rows)

- **projects:** `lead` 2, `angebot` 2, `in_arbeit` 2, **`Abschlussphase` 1**, **`Abgeschlossen` 1** (zwei mit Label statt system_key — siehe High #1)
- **deployments:** `ungeplant` 10, `geplant` 5, `durchgefuehrt` 2, `abgerechnet` 3, `storniert` 2
- **appointments:** `geplant` 2, `durchgefuehrt` 1
- **tasks:** `offen` 4, `erledigt` 2
- **memberships:** `aktiv` 5

### Rollen / Auth

- Aktive Rollen: Admin (1 User), Techniker (1 User), Vertrieb (0 User)
- `user_profiles` ohne `role_id`: 0
- `user_profiles` mit `status='aktiv'` ohne `auth.users`-Eintrag: 0

### Lookup-Konsistenz (Stand v2.31)

- Status-Lookups (`projekt_status`, `einsatz_status`, `termin_status`, `aufgabe_status`) haben alle einen `system_key`.
- Keine doppelten aktiven `system_key`-Werte innerhalb einer Kategorie.
- Keine doppelten aktiven `wert`-Werte innerhalb einer Kategorie.
- Hinweis: `aufgabe_status` kennt nur drei Werte (`offen`, `in_arbeit`, `erledigt`). `TASK_STATUS.STORNIERT` aus CLAUDE.md hat in den Stammdaten kein Pendant — siehe Low #10.

---

## Critical
*(Keine kritischen FK-Verletzungen oder Bilanz-Brüche gefunden.)*

---

## High

### #1 Projekt-Status enthält Labels statt `system_key` (Migration v2.30/v2.31 nicht durchgängig)
- Query:
  ```sql
  SELECT id, name, status
  FROM projects
  WHERE deleted_at IS NULL
    AND status NOT IN (
      SELECT system_key FROM lookup_values
      WHERE kategorie='projekt_status' AND ist_aktiv=true AND system_key IS NOT NULL
    );
  ```
- Trefferzahl: **2**
- Beispiele (IDs):
  - `94f4a3ab-ac0f-4af6-8966-c81e4cb2a0f9` — status `'Abgeschlossen'` (soll: `'abgeschlossen'`)
  - `1d4fe69a-a664-4478-8c55-d988cbcee666` — status `'Abschlussphase'` (soll: `'abschlussphase'`)
- Erklärung: Laut CLAUDE.md sind seit v2.31 in Status-Spalten ausschließlich `system_key`-Werte zulässig. Hier stehen noch die Labels. Folgen:
  - `dispStatus()`, Status-Filter und Pillen-Färbung greifen nicht, weil der Code Label-Fallbacks abgebaut hat.
  - Vergleiche wie `=== PROJECT_STATUS.ABGESCHLOSSEN` (= `'abgeschlossen'`) matchen NICHT — Auto-Status-Trigger und KPI-Berechnungen ignorieren diese Projekte still.
  - `lower(p.status)` würde sie zwar finden, aber `getStatusLabel()`/Pillen erwarten exakten `system_key`.
- Korrektur-Vorschlag (als versionierte Migration, z. B. `migrations/v2.32.14_project_status_keyfix.sql`):
  ```sql
  UPDATE projects SET status='abgeschlossen' WHERE status='Abgeschlossen';
  UPDATE projects SET status='abschlussphase' WHERE status='Abschlussphase';
  -- Defensive Generalisierung:
  UPDATE projects p SET status = l.system_key
    FROM lookup_values l
   WHERE l.kategorie='projekt_status' AND l.ist_aktiv=true AND l.wert = p.status
     AND p.status NOT IN (SELECT system_key FROM lookup_values WHERE kategorie='projekt_status');
  ```

### #2 Deployments mit Status `durchgefuehrt`, aber ohne Datum
- Query:
  ```sql
  SELECT id, titel, status, datum_von, datum_bis
  FROM deployments
  WHERE deleted_at IS NULL
    AND status IN ('durchgefuehrt','abgerechnet')
    AND (datum_von IS NULL OR datum_bis IS NULL);
  ```
- Trefferzahl: **2** (beide `durchgefuehrt`, `abgerechnet`-Einsätze sind sauber)
- Beispiele (IDs):
  - `89d48f67-275c-432a-becd-23ecb760bc93` — „AWT-Trainingseinheit", Projekt `1d4fe69a…` (ifm GmbH), `menge=3.00`, `einzelpreis=1500.00`
  - `d09631c5-97f1-4192-a21b-bface5a7ed31` — „Tagespauschale Senior Trainer Fräsen × ifm GmbH × Selcuk Cumart", selbes Projekt
- Erklärung: Beide Einsätze sind „durchgeführt" markiert, aber `datum_von`/`datum_bis` sind NULL. Folgen:
  - Reports „pro Monat geleistete Stunden" / „Auslastung" können den Einsatz nicht periodisch zuordnen.
  - Auto-Projektstatus-Logik verhält sich undefiniert.
  - Constraint `deployments_datum_consistency` (v1.9.3) erlaubt NULL und prüft nicht gegen Status. Ein „durchgefuehrt"-Einsatz ohne Datum ist fachlich widersprüchlich.
- Korrektur-Vorschlag:
  - UI-Validierung: Statuswechsel auf `durchgefuehrt` verlangt `datum_von`/`datum_bis` (Composer + Detail-Modal).
  - DB: Datum manuell nachpflegen, kein Bulk-Fix möglich (fachliche Klärung mit Selcuk).

### #3 Mitgliedschaften mit `preis = 0`
- Query:
  ```sql
  SELECT id, company_id, status, preis FROM memberships WHERE deleted_at IS NULL AND preis = 0;
  ```
- Trefferzahl: **5 von 5** (alle aktiven Mitgliedschaften)
- Erklärung: Entweder bewusst (TNC-Club Premium kostenfrei in der Pilotphase) oder Datenlücke. Beeinflusst Umsatzauswertungen, falls Mitgliedschaftspreis in KPI eingerechnet wird. `membership_programs.standard_preis` existiert als Default-Feld, wird beim Speichern aber nicht prefilled.
- Korrektur-Vorschlag: Klären, ob `preis=0` Absicht ist; sonst beim Mitgliedschafts-Speichern aus `membership_programs.standard_preis` prefillen.

---

## Medium

### #4 Deployment referenziert soft-gelöschtes Projekt
- Query:
  ```sql
  SELECT d.id, d.titel, d.project_id, p.deleted_at
  FROM deployments d
  LEFT JOIN projects p ON p.id = d.project_id
  WHERE d.deleted_at IS NULL AND d.project_id IS NOT NULL
    AND (p.id IS NULL OR p.deleted_at IS NOT NULL);
  ```
- Trefferzahl: **1**
- Beispiel: Einsatz `81319be2-37f4-4c52-ac96-be9b6b9bb7e4` → `project_id = ed661e87-…` („Testprojekt v3", soft-deleted am 2026-05-13)
- Erklärung: Beim Soft-Delete des Projekts wurden die zugehörigen Einsätze nicht mitkaskadiert. Der Einsatz ist aktiv (`status='ungeplant'`), zeigt aber auf ein nicht mehr sichtbares Projekt. Im Firmen-Detail bleibt er hängen, das Projekt ist nicht öffenbar.
- Korrektur-Vorschlag:
  - Code: `deleteProject` (Soft-Delete) sollte die aktiven Einsätze kaskadieren (Confirm-Prompt „Einsätze mit löschen?") oder zumindest `project_id = NULL` setzen.
  - Konkret hier: Einsatz `81319be2` soft-deleten (war Testdatensatz).

### #5 Projekt `in_arbeit` ohne irgendeinen Einsatz
- Query:
  ```sql
  SELECT p.id, p.name, p.status FROM projects p
  WHERE p.deleted_at IS NULL AND p.status='in_arbeit'
    AND NOT EXISTS (SELECT 1 FROM deployments d WHERE d.project_id = p.id AND d.deleted_at IS NULL);
  ```
- Trefferzahl: **1**
- Beispiel: `4d2a6400-68ee-4afe-92ee-2c9d5225e35d` — „AWT-Training P2 - ALT!" (Name signalisiert Müll-Datensatz)
- Erklärung: Ein Projekt im Status `in_arbeit`, das nie einen Einsatz hatte, kann fachlich nicht „in Arbeit" sein. Auto-Status-Logik triggert nur bei CRUD an Einsätzen/Terminen.
- Korrektur-Vorschlag: Soft-Delete oder Status zurück auf `lead`/`verloren`.

### #6 Projekte mit `geschaetzter_umsatz = 0` und `preis_nach_aufwand = false`
- Query:
  ```sql
  SELECT id, name, preis_nach_aufwand, geschaetzter_umsatz
  FROM projects
  WHERE deleted_at IS NULL AND preis_nach_aufwand=false
    AND (geschaetzter_umsatz IS NULL OR geschaetzter_umsatz = 0);
  ```
- Trefferzahl: **1**
- Beispiel: `4d2a6400-68ee-4afe-92ee-2c9d5225e35d` (dasselbe „ALT!"-Projekt wie #5)
- Erklärung: `preis_nach_aufwand=false` heißt Festpreis-Projekt, dann gehört `geschaetzter_umsatz > 0`. Das zweite Projekt mit `geschaetzter_umsatz=0` (`aeb520de-…`, „Programmlaufzeitoptimierung") hat `preis_nach_aufwand=true` — das ist konsistent.
- Korrektur-Vorschlag: UI-Validierung — bei `preis_nach_aufwand=false` Festpreis erzwingen.

### #7 deployment_technicians referenzieren soft-gelöschte Einsätze
- Query:
  ```sql
  SELECT count(*) FROM deployment_technicians dt
  JOIN deployments d ON d.id = dt.deployment_id
  WHERE d.deleted_at IS NOT NULL;
  ```
- Trefferzahl: **2**
- Erklärung: Junction-Einträge überleben Soft-Delete des Parents. Solange Lese-Pfade `deleted_at IS NULL` filtern, harmlos — aber Aufräum-Pflicht beim Hard-Delete.
- Korrektur-Vorschlag: Beim Soft-Delete des Einsatzes Junction-Rows mit löschen (sie tragen ohne Parent keine Bedeutung). Alternativ einmaliger Purge.

---

## Low

### #8 Aktive Doppel-Companies (mit soft-gelöschten Geschwistern)
- Query:
  ```sql
  SELECT lower(trim(name)) AS norm, array_agg(id), array_agg(deleted_at)
  FROM companies GROUP BY 1 HAVING count(*) > 1;
  ```
- Trefferzahl: **3 Gruppen**, jeweils genau 1 aktiv + 1–2 soft-deleted:
  - „universität stuttgart" — 1 aktiv, 2 deleted
  - „robert bosch gmbh" — 1 aktiv, 1 deleted
  - „röchling industrial se & co. kg" — 1 aktiv, 1 deleted
- Erklärung: Aufräum-Spuren aus früherem Import — keine aktive Dublette, kein Datenfehler. Die soft-gelöschten Geschwister bleiben dauerhaft im Storage.
- Korrektur-Vorschlag: Nightly Hard-Delete-Job für soft-gelöschte Companies älter als X Tage.

### #9 `geplant`-Termine in der Vergangenheit (< 30 Tage)
- Query:
  ```sql
  SELECT id, titel, datum, (CURRENT_DATE - datum) AS days_overdue
  FROM appointments WHERE deleted_at IS NULL AND status='geplant' AND datum < CURRENT_DATE;
  ```
- Trefferzahl: **2** (8 und 9 Tage überfällig — unterhalb der „30 Tage verwaist"-Schwelle, daher Low)
- Beispiele: `f3b7756f-…` „Machbarkeitsanalyse & Ausarbeitung", `42aab9a2-…` „PLC Schulungsangebot erörtern und abstimmen"
- Korrektur-Vorschlag: Dashboard-Reminder „N überfällige Termine — bitte Status setzen".

### #10 `TASK_STATUS.STORNIERT` ohne Lookup-Eintrag
- Aktuell: 0 Tasks mit Status `storniert` (kein Datenwert betroffen).
- CLAUDE.md erwähnt `TASK_STATUS.STORNIERT`, aber `lookup_values` (Kategorie `aufgabe_status`) kennt nur `offen`, `in_arbeit`, `erledigt`.
- Korrektur-Vorschlag: Entweder `storniert`-Lookup ergänzen (Konsistenz) oder die Konstante aus Code/Doc entfernen.

### #11 Last-Admin-Risiko
- Trefferzahl: **1 aktiver Admin** (Selcuk).
- Erklärung: `trg_prevent_last_admin_delete` schützt DB-seitig, aber bei Account-Verlust gibt es keinen Backup-Admin. Organisatorische Mitigation.

---

## Info — was sauber ist (Negativ-Befunde, 0 Treffer)

- **Orphan-FKs**: `deployments.company_id`, `appointments.deployment_id`, `appointments.company_id`, `contacts.company_id`, `memberships.company_id`, `memberships.program_id`, `entitlements.membership_id`, `entitlement_redemptions.entitlement_id`, `entitlement_redemptions.deployment_id`, `tasks.assigned_to`, `deployment_technicians`, `deployment_themes`, `deployment_log`, `project_theme_assignments`, `project_products`, `appointment_participants`, `appointment_contacts`, `entity_tags`, `attachments` (alle 18 mit gültigem Parent), `notes`, `pins`.
- **Status-Validität nach v2.31** (Tabellen vs. Lookup): `deployments`, `appointments`, `tasks` — alle Werte sind gültige aktive `system_keys`. Nur `projects` driftet (siehe High #1).
- **Datum-Konsistenz**: `deployments.datum_von > datum_bis` 0, `projects.startdatum > enddatum` 0, `appointments.uhrzeit_von > uhrzeit_bis` 0, `memberships.start_datum > end_datum` 0.
- **Abgelaufene Mitgliedschaften noch `aktiv`**: 0 (alle laufen 2026-01-01 bis 2026-12-31).
- **Entitlement-Überzeichnung**: 0. Alle 5 Entitlements (Quote je 1) im grünen Bereich.
- **Mitgliedschaften ohne Entitlements trotz Programm-Benefits**: 0. Alle 5 Mitgliedschaften haben je 1 Entitlement.
- **Redemption-Firma vs. Mitgliedschafts-Firma Mismatch**: 0.
- **Redemptions ohne `deployment_id`** (Revisions-Bruch): 0.
- **Termine `durchgefuehrt` mit Zukunfts-Datum**: 0.
- **Termine `geplant` > 30 Tage in der Vergangenheit**: 0.
- **Tasks `erledigt` ohne `erledigt_am`** bzw. umgekehrt: 0.
- **Deployments `abgerechnet` mit Zukunfts-Datum oder ohne Datum**: 0.
- **Companies mit leerem Namen**: 0.
- **Contacts ohne Vorname/Nachname**: 0.
- **Deployments mit `menge <= 0` oder `einzelpreis IS NULL`**: 0.
- **Ungültige E-Mail-Formate** (companies/contacts/user_profiles): 0.
- **User ohne Rolle**: 0.
- **user_profiles aktiv ohne `auth.users`**: 0.
- **Projekte/Deployments/Contacts ohne Firma**: jeweils 0.
- **Soft-deleted Companies mit aktiven Kindern**: 0 (Soft-Delete sauber auf Companies-Ebene).
- **Aktive cross-table FKs auf soft-deleted Parents**: nur 1 Fall (Medium #4, deployment → projekt).
- **Doppelte aktive `system_key`/`wert` innerhalb einer Lookup-Kategorie**: 0.
- **Status-Lookups mit `system_key IS NULL`**: 0.

---

## Zusammenfassung der notwendigen Aktionen

| Prio | Aktion |
|---|---|
| High #1 | Migration `v2.32.14_project_status_keyfix.sql` — 2 Projekt-Status auf `system_key` setzen (`'Abgeschlossen'`→`'abgeschlossen'`, `'Abschlussphase'`→`'abschlussphase'`) |
| High #2 | Datum nachpflegen für 2 ifm-GmbH-Einsätze (`89d48f67`, `d09631c5`) — manuell mit Selcuk |
| High #2 | UI-Validierung: Status `durchgefuehrt` setzt `datum_von`/`datum_bis` voraus |
| High #3 | Klären: Mitgliedschaftspreise `0` belassen oder aus `standard_preis` prefillen |
| Medium #4 | Soft-Delete von Projekten kaskadieren auf aktive Einsätze; Einsatz `81319be2` aufräumen |
| Medium #5/#6 | Test-Projekt `4d2a6400…` „AWT-Training P2 - ALT!" soft-deleten |
| Medium #7 | Optional: Junction-Cleanup bei Soft-Delete des Parents |
| Low #8–#11 | Aufräum-Empfehlungen, kein Handlungszwang |
