# Phase C — Schema-vs-Code

Stand: 2026-05-28 (gegen `main`). Methodik: Schema aus `architecture.md` §14 + allen Migrationen (`v1.15.0`…`v2.32.6`) extrahiert; `app.js` per Grep auf alle `.from('<table>')`-Pfade analysiert (635 Treffer, 36 unique Tabellen).

## Summary Table (Tabellen × Status)

| Tabelle | Spalten-Quelle (letzte Migration) | Im Code referenziert | Drift |
|---|---|---|---|
| `companies` | Init + v1.16 + v1.24 (`abc_klassifizierung`) + v2.6 (`ist_lieferant`) | ja | — |
| `contacts` | Init + v1.16 | ja | — |
| `appointments` | Init + v1.16 + v2.0.3 + v2.0 + v1.40 (`task_id`) | ja | — |
| `projects` | Init + v1.16 + v2.0.3 + v2.0 + v2.13 (`workflow_steps`) + v2.28.9 (`preis_nach_aufwand`) | ja | **High** (s. #5 `updated_at`) |
| `deployments` | Init + v1.16 + v2.0.3 + v2.12 (`bundle_id`, `bundle_overrides`) + v2.13 + v2.28.2 (`rabatt_typ/wert`) + v2.32.6 (`contact_id`) | ja | **Critical** (s. #1 `ganztag`) |
| `deployment_technicians` | Init | ja | — |
| `deployment_bundles` | v2.12 + v2.32.6 (`contact_id`) | ja | — |
| `deployment_bundle_technicians` | v2.12 | ja | — |
| `deployment_log` | v2.14.0 | ja | — |
| `deployment_themes` | v1.53 | ja | — |
| `services` | Init + v1.10 | ja | — |
| `lookup_values` | Init + v2.30 (`system_key`) | ja | — |
| `roles` | Init | ja | — |
| `user_profiles` | Init (`status`, **kein** `ist_aktiv`) | ja | **Critical** (s. #3) |
| `tasks` | v1.22 + v2.0.0-pre.1 (`deployment_id`) | ja | **Critical** (s. #4 `appointment_id`) |
| `notes` | (keine Migration im Repo!) + v2.0.5 (`titel` nullable) | ja | **Medium** (s. #11) |
| `memberships` | v1.13 + v1.16 | ja | — |
| `membership_programs` | v1.12 + v2.7.2 (`laufzeit_modus`) | ja | — |
| `membership_program_benefits` | v1.12 | ja | — |
| `entitlements` | v1.13 | ja | — |
| `entitlement_redemptions` | v1.14 | ja | — |
| `products` | v2.6 | ja | — |
| `project_products` | v2.10 + v2.28.2 | ja | — |
| `project_themes` | v1.53 + v2.16 + v2.16.2 + v2.13.1 | ja | — |
| `project_theme_assignments` | v2.16 | ja | — |
| `project_success_criteria` | v2.0.0-pre.1 | **nein** | **Medium** (s. #10) |
| `appointment_participants` | Init | ja | — |
| `appointment_contacts` | v2.11 | ja | — |
| `templates` | v1.50 + v2.27.1 | ja | — |
| `doc_sections` | v2.27 + v2.31.2 (`bereich`) | ja | — |
| `theme_library` | v2.13.1 | ja | — |
| `tags` | v2.5 | ja | — |
| `entity_tags` | v2.5 | ja | — |
| `pins` | v2.3 | ja | — |
| `attachments` | v2.9 | ja | — |
| `shortcuts` | v2.8 | ja | — |

Insgesamt: 36 Tabellen — alle Code-Referenzen finden eine existierende Tabelle (kein Tabellen-Drift). Drifts bei einzelnen Spalten siehe unten.

---

## Critical

### #1 Bündel-Composer schreibt `ganztag` in `deployments`-Insert → DB-Error

- Datei: `app.js:32031` (in `_composerSaveEinsatzBundle`)
- Symptom: Bei Multi-Tage-Bündel-Anlage schlägt der Bulk-Insert mit `column "ganztag" of relation "deployments" does not exist` fehl. Das Bundle wird vorher angelegt und der Code rollback-löscht es; User sieht „Einsätze des Bündels konnten nicht angelegt werden". Bündel-Anlage ist effektiv kaputt.
- Schema-Quelle: `architecture.md` §4.6 + alle Migrationen — keine `ganztag`-Spalte auf `deployments` oder `appointments`. Existiert nur als UI-Checkbox `d-ganztag`/`t-ganztag`. Normaler `saveDeployment` (`app.js:14572`) und `saveAppointment` (`app.js:12105`) lassen `ganztag` korrekt weg.
- Code:
  ```js
  // app.js:32021-32036
  const deploymentPayloads = days.map(iso => ({
    bundle_id: bundle.id,
    company_id, contact_id, project_id, service_id,
    datum_von: iso, datum_bis: iso,
    titel: bundleTitel, menge, einzelpreis,
    status: DEPLOYMENT_STATUS.GEPLANT,
    uhrzeit_von, uhrzeit_bis,
    ganztag,                  // ← Spalte existiert nicht
    ort, externe_techniker: externe,
    dokumentation: {}, erstellt_von: currentProfile?.id || null
  }));
  ```
- Verwandt (silent, nicht crashend): `app.js:24963` rendert `d.ganztag ? 'Ganztag' : ' '` — liest `undefined`.
- Fix: (a) `ganztag` aus dem Payload entfernen, oder (b) Migration `ALTER TABLE deployments ADD COLUMN ganztag boolean NOT NULL DEFAULT false` und auch in `saveDeployment`/`saveAppointment` mitschreiben.

### #2 Drei Status-IN-Filter mit Title-Case-Labels nach v2.30/v2.31 → Filter wirkungslos

- Dateien: `app.js:4746`, `app.js:5432`, `app.js:5794`
- Symptom: Drei Supabase-`.not('status', 'in', '(...)')`-Filter benutzen noch Title-Case-Labels. DB hat seit v2.30.0/v2.31.1 ausschließlich lowercase system_keys. Filter sind silent unwirksam — Briefing zeigt z. B. abgeschlossene Projekte als „hot", weil sie nicht ausgeschlossen werden.
- Schema-Quelle: `migrations/v2.30.0_lookup_system_keys.sql:78-91` + `v2.31.1_normalize_status_to_system_keys.sql`.
- Code:
  ```js
  // app.js:4746 — Briefing „heiße Projekte"
  .not('status', 'in', '(Abgeschlossen,Storniert,Verloren,"Lead-zurück")')
  //  Soll: '(abgeschlossen,storniert,verloren)'
  //  „Lead-zurück" existiert auch nicht als system_key.

  // app.js:5432 — Today-Tile (aktive Einsätze)
  .not('status', 'in', '(Storniert)')   // Soll: '(storniert)'

  // app.js:5794 — „Termin vergessen?" (Einsätze ohne Datum)
  .not('status', 'in', '(Abgerechnet,Storniert)')  // Soll: '(abgerechnet,storniert)'
  ```

### #3 `user_profiles.ist_aktiv` existiert nicht → Dropdown leer/Fehler

- Dateien: `app.js:8434`, `app.js:9435`
- Symptom: Zwei Stellen filtern `user_profiles` mit `.eq('ist_aktiv', true)`. `user_profiles` hat laut Schema (architecture.md §4.10) nur `status` (eingeladen/aktiv/inaktiv) — keine `ist_aktiv`-Spalte. Postgres meldet 42703; Dropdown bleibt leer.
- Code:
  ```js
  // app.js:8434 — Template-Field-Renderer (User-Type-Felder)
  const { data } = await db.from('user_profiles')
    .select('id, name').eq('ist_aktiv', true).order('name');

  // app.js:9435 — Theme-Modal: Owner-Dropdown
  const { data: users } = await db.from('user_profiles')
    .select('id, name').eq('ist_aktiv', true).order('name');
  ```
- Fix: `.eq('status', 'aktiv')` statt `.eq('ist_aktiv', true)`.

### #4 `tasks.appointment_id` existiert nicht → Termin-Detail-Activity-Stream lädt nichts

- Datei: `app.js:6508`
- Symptom: Im Activity-Stream der Termin-Detail-Page wird `tasks` mit `.eq('appointment_id', id)` gefiltert. `tasks` hat laut v1.22 + v2.0.0-pre.1 die FKs `assigned_to`, `company_id`, `contact_id`, `project_id`, `deployment_id`, `erstellt_von` — **kein `appointment_id`**. Die Termin↔Aufgabe-Kopplung ist einseitig: `appointments.task_id` (v1.40) zeigt auf die Aufgabe; die Aufgabe weiß nichts vom Termin.
- Code:
  ```js
  // app.js:6505-6510 — Termin: Tasks + Anhänge im Activity-Stream
  else if (type === 'termin') {
    const [tasks, atts] = await Promise.all([
      db.from('tasks')
        .select('id, titel, faelligkeit, status, erledigt_am, created_at')
        .is('deleted_at', null)
        .eq('appointment_id', id)         // ← Spalte gibt's nicht
        .order('created_at', { ascending: false }).limit(50),
      ...
    ]);
  ```
- Fix-Optionen: (a) Reverse-Lookup via `appointments.task_id` für den Termin; (b) Tasks im Kontext via `OR(company_id, contact_id)` aus dem Termin.

---

## High

### #5 `projects.updated_at` selektiert/gelesen — Spalte existiert nicht

- Dateien: `app.js:4744`, `app.js:4754-4755`, `app.js:23355`
- Symptom: Drei Stellen lesen `projects.updated_at`. `projects` hat laut Schema (architecture.md §4.5) nur `created_at` + `deleted_at`, **kein `updated_at`** (keine Migration ergänzt es). Die Briefing-Query (Zeile 4744) liefert PostgREST-Fehler 42703 → Try/Catch fängt → „heiße Projekte"-Block des Briefings verschwindet silent.
- Code:
  ```js
  // app.js:4743-4755
  .select('id, name, enddatum, status, updated_at, company:companies(name)')
  // ...
  const updated = p.updated_at ? new Date(p.updated_at) : null;
  const staleDays = updated ? Math.round((today - updated) / DAY_MS) : 999;
  
  // app.js:23355 (Project-Health-Card, defensiver Fallback)
  const lastTs = lastDep?.[0]?.created_at || p.updated_at || p.created_at;
  ```
- Fix: (a) `updated_at` aus Select entfernen, Fallback auf `created_at` (wie Zeile 23355 schon macht); oder (b) Spalte + Trigger ergänzen (analog `doc_sections.updated_at`).

### #6 `restore_stammdaten.sql` säet Status-Labels statt system_keys

- Datei: `migrations/restore_stammdaten.sql:62-88`
- Symptom: Das Restore-Skript seedet `projekt_status` und `einsatz_status` mit Title-Case-Labels (`'Lead'`, `'Angebot'`, `'Geplant'`, `'Durchgeführt'`) **ohne** `system_key`. Wer das Skript auf eine frische Instanz vor v2.30/v2.31 anwendet, bricht den App-Boot — `_loadStatusLabels` baut leeren Cache (Code überspringt Zeilen mit `system_key IS NULL`).
- Fix: `restore_stammdaten.sql` um `system_key`-Spalte (kanonische system_keys aus v2.30) ergänzen, ODER Hinweis ergänzen, dass v2.30/v2.31.1 anschließend laufen muss.

### #7 `KATEGORIE_LABELS` ohne `theme_status` — Stammdaten-Filter zeigt rohen Schlüssel

- Datei: `app.js:2935-2943`
- Symptom: Map rendert UI-Labels für 7 Kategorien (aufgabe_status, einsatz_status, leistungs_kategorie, projekt_status, termin_status, termin_typ, unternehmens_typ) — **kein `theme_status`** (v1.53). Fallback in `kategorieLabel()` zeigt „Theme Status" statt einer deutschen Bezeichnung. Kosmetisch, nicht funktional.
- Fix: `theme_status: 'Themen-Status'` ergänzen.

---

## Medium (totes Schema / toter Code)

### #8 Wipe-Skripte decken neuere Tabellen nicht ab

- Datei: `migrations/v2.3.1_wipe_operational.sql` und `migrations/wipe_all_operational_data.sql`
- Symptom: Stammen aus v2.3.1 (vor v2.5/v2.9/v2.11/v2.12/v2.13.1/v2.14/v2.16/v2.27). Folgende Tabellen werden **nicht** gewipt: `appointment_contacts`, `attachments`, `deployment_bundles`, `deployment_bundle_technicians`, `deployment_log`, `doc_sections`, `entity_tags`, `tags`, `project_theme_assignments`, `theme_library`, `shortcuts`. Bei einem FiveAx-Wipe bleiben dort Reste.
- Fix: Wipe-Skript erweitern (Reihenfolge: Junctions/Detail vor Master).

### #9 `dokumentation`-Keys `durchgefuehrte_themen` / `erkenntnisse` im UI noch aktiv, aber Daten als Stream migriert

- Datei: `app.js:8978-8984` (`DOCUMENTATION_SCHEMAS.einsatz`)
- Symptom: `DOCUMENTATION_SCHEMAS.einsatz` enthält noch `durchgefuehrte_themen` + `erkenntnisse`. Migration `v2.14.3_migrate_legacy_doku_to_stream.sql` hat genau diese Inhalte in `deployment_log` migriert und die Quell-Keys aus `dokumentation` gelöscht. UI rendert leere Textareas; Schreiben würde Daten parallel zum Stream führen.
- Fix: Schema-Liste auf verbleibende Felder (`teilnehmer`, `folge_massnahmen`, `anmerkungen`) reduzieren.

### #10 `project_success_criteria` — angelegt, aber nicht im app.js verwendet

- Tabelle: `project_success_criteria` (v2.0.0-pre.1)
- Symptom: Tabelle inkl. RLS + Daten-Migration aus `projects.dokumentation.erfolgskriterien` angelegt. **Keine** `.from('project_success_criteria')`-Referenz in app.js. Entweder totes Schema oder noch nicht umgesetztes Feature.
- Fix: Klären; sonst dokumentieren oder dropen.

### #11 `notes` hat keine Migration im Repo (Init-Schema fehlt)

- Tabelle: `notes`
- Symptom: `notes` wird in `v1.15.0` (RLS), `v1.16.0` (Soft-Delete-Tabelle), `v2.0.5_notes_titel_nullable.sql` und `v2.3.1_wipe_operational.sql` referenziert — aber **kein `CREATE TABLE notes ...`** im `migrations/`-Verzeichnis. Tabelle wurde initial außerhalb angelegt; nicht reproduzierbar bei Frisch-Aufsetzung. Spalten nur empirisch aus Code-Referenzen: `id, inhalt, titel (nullable), company_id, project_id, contact_id, erstellt_von, created_at`.
- Fix: Migration nachreichen oder Init-Schema in `architecture.md` §14 dokumentieren.

### #12 `notes`-Reads ohne `.is('deleted_at', null)`

- Dateien: `app.js:6057`, `app.js:22275`, `app.js:23483`, `app.js:24368`, `app.js:24581`
- Symptom: `_inject_soft_delete_filter.py` listet `notes` nicht in `TABLES` (`companies, contacts, appointments, projects, deployments, memberships`) — Filter wird daher nicht automatisch injiziert. Reads holen also potenziell Soft-deleted Notizen. Unklar, ob `notes` überhaupt `deleted_at` hat (siehe #11).
- Fix: Schema von `notes` klären; falls Soft-Delete genutzt wird, Filter manuell ergänzen oder Tabelle ins Helper-Script aufnehmen.

---

## Low (Performance, Index-Hinweise)

### #13 `getTaskAppointmentMap(taskIds)` — 1 Extra-Query pro Listen-Render

- Datei: `app.js:3762-3773`
- Symptom: Pro Aufgaben-Liste (4 Varianten) ein extra Round-Trip zu `appointments.task_id IN (...)`. Mit `idx_appointments_task_id` schnell, aber Round-Trip vermeidbar.
- Fix-Idee: Map cachen oder Embed `appointments!task_id(id)` direkt im Tasks-Select.

### #14 `tasks.contact_id`-Filter ohne dedizierten Index

- Datei: `app.js:24580` (Kontakt-Detail Tasks-Tab)
- Symptom: Migration v1.22 legt Indexe für `assigned_to`, `company_id`, `project_id`, `deployment_id` an — **kein** `idx_tasks_contact`. Bei großen Beständen Seq-Scan.
- Fix-Idee: `CREATE INDEX idx_tasks_contact ON tasks(contact_id) WHERE deleted_at IS NULL`.

### #15 Volltextsuche per `ilike` — bekannte Limitation (§7.10)

- Datei: globale Suche in `app.js`
- Symptom: 4 parallele `ilike %q%` ohne pg_trgm-Indexe. Architektur erwähnt es als Risiko bei >1000 Datensätzen. Aktuell unkritisch (Single-User), für FiveAx-Migration relevant.
- Fix-Idee: pg_trgm-Indexe auf den durchsuchten Textspalten.

---

## Info (Beobachtungen)

### #17 Status-System-Keys im Code-Pfad konsistent durchgezogen

- Die 4 Konstanten-Maps (`PROJECT_STATUS`, `DEPLOYMENT_STATUS`, `APPOINTMENT_STATUS`, `TASK_STATUS`) in `app.js:2484-2512` referenzieren die system_keys aus v2.30.0/v2.31.1 korrekt. Alle 15 `.eq('status', ...)`-Filter im Code arbeiten mit diesen Werten — bis auf die 3 `.not('status','in',...)`-Pfade aus **#2**.

### #18 Alle 36 Code-referenzierten Tabellen existieren im Schema

Kein Tabellen-Drift im engeren Sinne.

### #19 FK-Embed-Namen für `notes` empirisch gesetzt

- 15 verschiedene `!FK_NAME`-Embeds im Code, davon `notes_company_id_fkey`, `notes_project_id_fkey`, `notes_contact_id_fkey`, `notes_erstellt_von_fkey` ohne nachprüfbare CREATE-Statement (siehe #11). Vermutlich Supabase-Default-Naming. Bei einer Neu-Anlage darauf achten.

### #20 RLS-Policy-Pattern (`PERMISSIVE all_authenticated` + `RESTRICTIVE only_active_users`) durchgängig

In allen sichtbaren Tabellen mind. 2 Policies. Für `notes` über v1.15.0_auth_hardening.sql ENABLE'd; ohne CREATE TABLE in Repo aber nicht prüfbar (siehe #11).

### #21 `_inject_soft_delete_filter.py` deckt nur 6 Soft-Delete-Tabellen ab

- TABLES = `companies, contacts, appointments, projects, deployments, memberships`. Später hinzugekommene Soft-Delete-Tabellen (`tasks`, `products`, `project_products`, `deployment_bundles`, `deployment_log`, `project_themes`, `project_theme_assignments`, `attachments`, `theme_library`) sind dort **nicht** verzeichnet — der `.is('deleted_at', null)`-Filter wird im Code manuell gesetzt. Konsistenz nur via Code-Review prüfbar.

### #22 `appointments.status` system_keys == labels

Lowercase Werte `geplant` / `durchgefuehrt` werden direkt als UI angezeigt. Wer das Label ändern will (z. B. „Geplant"), muss `system_key` bei `geplant`/`durchgefuehrt` lassen.

---

## Wichtigste Fixes priorisiert

1. **#1 `ganztag`** — Bündel-Composer kaputt, jeder Multi-Day-Versuch crasht. (`app.js:32031`)
2. **#3 `user_profiles.ist_aktiv`** — Two-line fix, schaltet User-Picker im Theme- und Template-Modal überhaupt erst frei. (`app.js:8434, 9435`)
3. **#2 Title-Case Status-IN-Filter** — Briefing zeigt falsche „hot" Projekte und „Termin vergessen?" filtert nicht aus. (`app.js:4746, 5432, 5794`)
4. **#4 `tasks.appointment_id`** — Termin-Activity-Stream zeigt nie Aufgaben. (`app.js:6508`)
5. **#5 `projects.updated_at`** — Briefing-„heiße Projekte"-Block fällt vermutlich silent aus. (`app.js:4744, 4754, 23355`)
6. **#6 `restore_stammdaten.sql`** — bricht jede frische Mandanteninstanz, wenn nicht direkt v2.30/v2.31.1 nachgezogen wird.
7. **#11 / #12 `notes`** — Init-Schema fehlt im Repo; Soft-Delete-Filter inkonsistent. Klären, bevor FiveAx live geht.
