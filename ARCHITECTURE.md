# Cumart CRM — Architektur-Dokumentation

**Version:** 1.9.8
**Stand:** 21. April 2026
**Betreiber:** Cumart Consulting (Selcuk Cumart)
**Repository:** `GorillaMilling66/cumart-consulting-crm` (GitHub)
**Live:** `cumart-consulting-crm.vercel.app`

---

## 1. Zweck & Scope

Internes CRM für Cumart Consulting zur Verwaltung von:

- **Firmen** (Kunden, Interessenten, Partner)
- **Kontakten** (Ansprechpartner bei Firmen)
- **Terminen** (Vertrieb, Abstimmung — *keine* Umsatzbringer)
- **Projekten** (Paket-Container mit Festpreis für Kundenrechnung)
- **Einsätzen** (umsatzbringende Leistungen, einzeln oder im Projekt)
- **Leistungen** (Katalog: Trainings, Consulting, Online-Sessions)
- **Benutzern** (interne Cumart-Mitarbeiter mit Rollen)

**Fachliche Trennung zwischen Termin und Einsatz (wichtig):**

| Entität  | Bedeutung                              | Umsatz          |
|----------|----------------------------------------|-----------------|
| Termin   | Gesprächstermin, Akquise, Abstimmung   | nein (Aufwand)  |
| Einsatz  | Abrechenbare Leistung beim Kunden      | ja              |
| Projekt  | Paket mehrerer Einsätze mit Festpreis  | ja (Paketpreis) |

**Umsatz-Logik:**
- Bei **Einzel-Einsätzen** (kein Projekt): `menge × einzelpreis` = Kundenumsatz
- Bei **Projekt-Einsätzen**: Einzel-Preise sind interner Wert (Aufwands-Tracking), Paketpreis = Kundenumsatz
- **Leistungsumsatz** eines Projekts = Summe aller Einsatz-Werte (für Soll/Ist-Vergleich)

---

## 2. Tech-Stack

| Schicht       | Technologie                             |
|---------------|-----------------------------------------|
| Frontend      | Vanilla HTML/CSS/JS (kein Framework)    |
| Hosting       | Vercel (Auto-Deploy aus main)           |
| Backend       | Supabase (Postgres + Auth + Edge Funcs) |
| Auth          | Supabase Auth, JWT ES256                |
| Admin-Actions | Edge Function `manage-users` (Deno)     |
| Plan          | Supabase Free Tier                      |

**Warum kein Framework:** Einfachheit, schnelle Iteration, einfaches Deployment, keine Build-Pipeline.

---

## 3. Dateistruktur

Das gesamte Frontend besteht aus drei Dateien im Repo-Root:

```
cumart-consulting-crm/
├── index.html       ~1.7k Zeilen  (alle Pages + Modals als hidden divs)
├── styles.css         ~900 Zeilen  (CSS-Variablen, Desktop + Mobile)
├── app.js            ~4.6k Zeilen  (alle Module in einer Datei)
└── .git/
```

Supabase:
```
Project: loohjeiysjxzbmfwkyvv.supabase.co
├── Schema: public
└── Edge Functions:
    └── manage-users   (invite, update, delete, reset_password)
```

---

## 4. Datenbank-Schema (Postgres)

### 4.1 Tabellen-Übersicht

| Tabelle                   | Zweck                                           |
|---------------------------|-------------------------------------------------|
| `companies`               | Firmen/Kunden                                   |
| `contacts`                | Kontakte bei Firmen                             |
| `appointments`            | Termine (Akquise, Abstimmung)                   |
| `projects`                | Paket-Projekte mit Festpreis                    |
| `deployments`             | Einsätze (abrechenbare Leistungen)              |
| `deployment_technicians`  | n:m zwischen Einsätzen und internen Technikern  |
| `services`                | Leistungskatalog                                |
| `lookup_values`           | Generische Dropdown-Werte (Status, Typen etc.)  |
| `roles`                   | Rollen (Admin, Vertrieb, Techniker)             |
| `user_profiles`           | Interne Benutzer (ergänzt auth.users)           |
| `notes`                   | (angelegt, bisher ungenutzt)                    |
| `appointment_participants`| (angelegt, bisher ungenutzt)                    |

### 4.2 `companies`

| Spalte        | Typ          | Nullable | Default | Notes                              |
|---------------|--------------|----------|---------|------------------------------------|
| id            | uuid         | NO       | gen_random_uuid() | PK                      |
| name          | text         | NO       |         |                                    |
| typ_id        | uuid         | YES      |         | FK → lookup_values (unternehmens_typ) |
| branche       | text         | YES      |         |                                    |
| strasse       | text         | YES      |         |                                    |
| plz           | text         | YES      |         |                                    |
| stadt         | text         | YES      |         |                                    |
| land          | text         | YES      | 'Deutschland' |                              |
| telefon       | text         | YES      |         |                                    |
| email         | text         | YES      |         |                                    |
| website       | text         | YES      |         |                                    |
| notizen       | text         | YES      |         |                                    |
| erstellt_von  | uuid         | YES      |         | FK → user_profiles (ON DELETE SET NULL) |
| created_at    | timestamptz  | YES      | now()   |                                    |

### 4.3 `contacts`

| Spalte        | Typ          | Nullable | Default | Notes                              |
|---------------|--------------|----------|---------|------------------------------------|
| id            | uuid         | NO       | gen_random_uuid() | PK                      |
| vorname       | text         | YES      |         |                                    |
| nachname      | text         | YES      |         |                                    |
| position      | text         | YES      |         |                                    |
| company_id    | uuid         | YES      |         | FK → companies                     |
| telefon       | text         | YES      |         |                                    |
| email         | text         | YES      |         |                                    |
| notizen       | text         | YES      |         |                                    |
| erstellt_von  | uuid         | YES      |         | FK → user_profiles                 |
| created_at    | timestamptz  | YES      | now()   |                                    |

### 4.4 `appointments`

| Spalte         | Typ          | Nullable | Default        | Notes                              |
|----------------|--------------|----------|----------------|------------------------------------|
| id             | uuid         | NO       | gen_random_uuid() | PK                              |
| titel          | text         | NO       |                |                                    |
| datum          | date         | NO       |                |                                    |
| uhrzeit_von    | time         | YES      |                |                                    |
| uhrzeit_bis    | time         | YES      |                |                                    |
| status         | text         | NO       | 'geplant'      | Werte: 'geplant', 'durchgefuehrt' (Systemkonstanten, kein Lookup) |
| typ_id         | uuid         | YES      |                | FK → lookup_values (termin_typ)    |
| company_id     | uuid         | YES      |                | FK → companies                     |
| contact_id     | uuid         | YES      |                | FK → contacts (ON DELETE SET NULL) |
| project_id     | uuid         | YES      |                | FK → projects (ON DELETE SET NULL) |
| deployment_id  | uuid         | YES      |                | FK → deployments (ON DELETE SET NULL) — Einsatz-Kopplung |
| ort            | text         | YES      |                |                                    |
| notizen        | text         | YES      |                |                                    |
| erstellt_von   | uuid         | YES      |                |                                    |
| created_at     | timestamptz  | YES      | now()          |                                    |

**Indizes:** datum, status, company_id, contact_id, project_id, deployment_id

### 4.5 `projects`

| Spalte              | Typ          | Nullable | Default      | Notes                              |
|---------------------|--------------|----------|--------------|------------------------------------|
| id                  | uuid         | NO       | gen_random_uuid() | PK                            |
| name                | text         | NO       |              | Paketname                          |
| status              | text         | NO       | 'Angebot'    | **Kein CHECK mehr** (seit v1.9.6), validiert über lookup_values (Kategorie `projekt_status`) |
| company_id          | uuid         | YES      |              | NULL = internes Projekt            |
| hauptkontakt_id     | uuid         | YES      |              | FK → contacts                      |
| verantwortlicher_id | uuid         | YES      |              | FK → user_profiles                 |
| startdatum          | date         | YES      |              |                                    |
| enddatum            | date         | YES      |              |                                    |
| geschaetzter_umsatz | numeric      | YES      | 0            | **Paketpreis (Kundenrechnung)**   |
| beschreibung        | text         | YES      |              |                                    |
| notizen             | text         | YES      |              |                                    |
| erstellt_von        | uuid         | YES      |              |                                    |
| created_at          | timestamptz  | YES      | now()        |                                    |

**Indizes:** status, company_id, verantwortlicher_id, startdatum

**Projekt-Status-Werte (Lookup, Kategorie `projekt_status`):**
- `Lead` — potentieller Interessent
- `Angebot` — Paket-Angebot rausgegangen
- `In Arbeit` — Kunde hat gebucht, Einsätze laufen
- `Abschlussphase` — alle Einsätze durchgeführt, Termine stehen noch aus
- `Abgeschlossen` — alle Einsätze + alle Termine durchgeführt
- `Verloren` — Kunde hat nicht gebucht

Die drei aktiven Status (`In Arbeit`, `Abschlussphase`, `Abgeschlossen`) werden automatisch gewechselt, siehe Abschnitt 8.4.

### 4.6 `deployments` (Einsätze)

| Spalte            | Typ          | Nullable | Default   | Notes                              |
|-------------------|--------------|----------|-----------|------------------------------------|
| id                | uuid         | NO       | gen_random_uuid() | PK                         |
| titel             | text         | NO       |           |                                    |
| datum_von         | date         | **YES**  |           | **NULLable seit v1.9.3** (Vorausplanung ohne Datum) |
| datum_bis         | date         | **YES**  |           | **NULLable seit v1.9.3**           |
| uhrzeit_von       | time         | YES      |           |                                    |
| uhrzeit_bis       | time         | YES      |           |                                    |
| status            | text         | NO       | 'Geplant' | **Kein CHECK mehr** (seit v1.9.6), validiert über lookup_values (Kategorie `einsatz_status`) |
| company_id        | uuid         | YES      |           | FK → companies (ON DELETE SET NULL) — pflicht im UI |
| project_id        | uuid         | YES      |           | FK → projects (ON DELETE SET NULL) |
| service_id        | uuid         | YES      |           | FK → services (ON DELETE SET NULL) |
| menge             | numeric      | YES      | 1         |                                    |
| einzelpreis       | numeric      | YES      | 0         | bei Projekt-Einsatz: interner Aufwand |
| ort               | text         | YES      |           |                                    |
| externe_techniker | text         | YES      |           | Freitext für Nicht-User            |
| beschreibung      | text         | YES      |           |                                    |
| notizen           | text         | YES      |           |                                    |
| erstellt_von      | uuid         | YES      |           |                                    |
| created_at        | timestamptz  | YES      | now()     |                                    |

**Constraints:**
- `deployments_datum_consistency`: Entweder beide Datumsfelder NULL (Ungeplant) oder beide gesetzt mit `datum_bis >= datum_von`

**Indizes:** status, project_id, company_id, service_id, datum_von

**Einsatz-Status-Werte (Lookup, Kategorie `einsatz_status`):**
- `Geplant` — Einsatz angelegt, noch nicht durchgeführt
- `Durchgeführt` — Einsatz hat stattgefunden
- `Abgerechnet` — Rechnung gestellt (terminaler Status)
- `Storniert` — Einsatz abgesagt

### 4.7 `deployment_technicians` (Junction-Tabelle)

| Spalte        | Typ  | Nullable | Notes                              |
|---------------|------|----------|------------------------------------|
| id            | uuid | NO       | PK                                 |
| deployment_id | uuid | NO       | FK → deployments (ON DELETE CASCADE) |
| user_id       | uuid | NO       | FK → user_profiles (ON DELETE CASCADE) |

**Constraint:** UNIQUE (deployment_id, user_id)
**Indizes:** user_id

### 4.8 `services`

| Spalte        | Typ          | Nullable | Default | Notes                              |
|---------------|--------------|----------|---------|------------------------------------|
| id            | uuid         | NO       | gen_random_uuid() | PK                       |
| name          | text         | NO       |         |                                    |
| kategorie_id  | uuid         | YES      |         | FK → lookup_values (leistungs_kategorie) |
| einheit       | text         | NO       |         | CHECK: Tag, Stunde, Pauschale, Stück |
| standardpreis | numeric      | YES      | 0       |                                    |
| beschreibung  | text         | YES      |         |                                    |
| ist_aktiv     | boolean      | YES      | true    |                                    |
| created_at    | timestamptz  | YES      | now()   |                                    |

### 4.9 `lookup_values` (generische Dropdown-Werte)

| Spalte      | Typ         | Notes                              |
|-------------|-------------|------------------------------------|
| id          | uuid        | PK                                 |
| kategorie   | text        | z.B. 'termin_typ', 'projekt_status' |
| wert        | text        | Anzeigename                        |
| farbe       | text        | Hex-Farbe für Badges               |
| reihenfolge | integer     | Sortierung im Dropdown             |
| ist_aktiv   | boolean     | Archiviert vs. aktiv               |

**Kategorien (admin-verwaltbar über Stammdaten-UI):**
- `unternehmens_typ` → Kunde / Interessent / Partner / Lieferant
- `termin_typ` → Online / Vor Ort / Kickoff / Intern
- `projekt_status` → Lead / Angebot / In Arbeit / Abschlussphase / Abgeschlossen / Verloren
- `einsatz_status` → Geplant / Durchgeführt / Abgerechnet / Storniert
- `leistungs_kategorie` → Training / Consulting / Online-Session / ...

**Wichtige Design-Entscheidung (v1.9.6):** Die Status-Werte für Projekte und Einsätze sind **ausschließlich durch `lookup_values` definiert** — keine hardcoded DB-CHECK-Constraints mehr. Admin kann jederzeit neue Werte in den Stammdaten hinzufügen, die sofort im System verfügbar sind. Validierung läuft im Frontend gegen den Lookup-Cache.

**Caveat:** Status-Werte mit Business-Logik-Bedeutung (z.B. `Abschlussphase`, `Abgeschlossen`) dürfen nicht umbenannt werden, da die Auto-Status-Logik (siehe 8.4) fest auf diese Werte referenziert. Deaktivieren via `ist_aktiv = false` ist aber OK.

### 4.10 `user_profiles` + `roles`

`user_profiles` hat 1:1 zu `auth.users`:

| Spalte                  | Notes                                          |
|-------------------------|------------------------------------------------|
| id                      | = auth.users.id                                |
| name                    |                                                |
| email                   |                                                |
| role_id                 | FK → roles                                     |
| status                  | CHECK: eingeladen, aktiv, inaktiv              |
| muss_passwort_aendern   | true bis erstes Login/Change                   |

`roles`: id, name, rechte (JSONB), ist_aktiv.

**Existierende Rollen:**
- Admin (`534b13f4-074b-4dac-9c27-98cb7b72e4d7`) — volle Admin-Rechte
- Vertrieb (`848c869d-9014-463f-9cb1-b4bb6d9be278`)
- Techniker (`b6b3ac13-d066-489d-b775-25e4c5517b7e`)

---

## 5. Row Level Security (RLS)

**Hybrid-Strategie ("Option C"):**

| Tabelle                   | Policy-Typ                                    |
|---------------------------|-----------------------------------------------|
| `user_profiles`           | Strikt: User sieht nur sich; Admin sieht alle |
| `roles`                   | Strikt: Read all, Write nur Admin             |
| `lookup_values`           | Read authenticated, Write nur Admin           |
| `companies`               | Open authenticated (read+write)               |
| `contacts`                | Open authenticated                            |
| `appointments`            | Open authenticated                            |
| `projects`                | Open authenticated                            |
| `deployments`             | Open authenticated                            |
| `deployment_technicians`  | Open authenticated                            |
| `services`                | Open authenticated                            |
| `notes`                   | Open authenticated                            |
| `appointment_participants`| Open authenticated                            |

**Historie:** Ursprünglich war ein Bug mit pre-existierenden open policies (`auth_select/insert/update/delete`) drin, der RLS komplett neutralisiert hat. Wurde per Live-Hack-Test entdeckt und behoben. Aktuelle Policies wurden explizit neu angelegt.

**Bekannte offene Punkte bei RLS** (siehe Roadmap): Role-Self-Escalation theoretisch möglich, Last-Admin-Schutz fehlt.

---

## 6. Edge Function `manage-users`

**URL:** `https://loohjeiysjxzbmfwkyvv.supabase.co/functions/v1/manage-users`
**Auth:** Bearer-Token (Session) + apikey (legacy anon key)
**Runtime:** Deno
**Wichtig:** „Verify JWT with legacy secret" ist **deaktiviert** (wegen HS256→ES256-Transition).

**Actions:**

| Action          | Input                                 | Zweck                           |
|-----------------|---------------------------------------|---------------------------------|
| `invite`        | email, name, role_id, password?       | Neuer User + Profil             |
| `update`        | user_id, name, role_id, password?     | Profil updaten                  |
| `delete`        | user_id                               | User komplett löschen           |
| `reset_password`| user_id                               | Neues Passwort generieren       |

**Passwort-Handling:** Wenn `password` leer, wird zufälliges generiert und zurückgegeben (einmaliger Display im Credentials-Modal).

---

## 7. Frontend-Architektur

### 7.1 SPA-Modell

Kein Server-Side-Rendering, keine Builds. `index.html` enthält **alle Pages** als `<div class="page">` — in `app.js` wird nur die jeweils aktive sichtbar geschaltet per `.active` class.

Alle Modals existieren permanent im DOM als `<div class="modal-overlay">`, werden mit `.open` sichtbar.

### 7.2 Router

Hash-basiert in `handleHashChange()`. Hashes:

| Hash                  | Page                   | Lade-Funktion           |
|-----------------------|------------------------|-------------------------|
| `#/firmen`            | page-companies         | `loadCompanies()`       |
| `#/firma/UUID`        | page-company-detail    | `loadCompanyDetail(id)` |
| `#/kontakte`          | page-contacts          | `loadContacts()`        |
| `#/kontakt/UUID`      | page-contact-detail    | `loadContactDetail(id)` |
| `#/termine`           | page-appointments      | `loadAppointments()`    |
| `#/termine?firma=ID`  | page-appointments      | mit Firma-Filter        |
| `#/projekte`          | page-projects          | `loadProjects()`        |
| `#/projekt/UUID`      | page-project-detail    | `loadProjectDetail(id)` |
| `#/einsaetze`         | page-deployments       | `loadDeployments()`     |
| `#/benutzer`          | page-users             | `loadUsers()` (admin)   |
| `#/leistungen`        | page-services          | `loadServices()` (admin)|
| `#/stammdaten`        | page-lookups           | `loadLookupsPage()` (admin) |

**Hinweis:** Es gibt **keine** Detail-Route für Einsätze. CRUD läuft via Modal aus Liste oder Detail-Sektion.

### 7.3 Navigation

**Desktop-Sidebar** (vertikal, links, fixed):
- Firmen / Kontakte / Termine / Projekte / Einsätze
- Einstellungen (admin-only, aufklappbar): Benutzer / Leistungen / Stammdaten
- Abmelden

**Mobile-Bottom-Nav** (4 Icons, unten fixed):
- Firmen / Termine / Einsätze / Mehr

**Mehr-Menü** (Overlay von unten):
- Hauptbereich: Kontakte / Projekte
- Einstellungen (admin-only): Benutzer / Leistungen / Stammdaten
- Abmelden

### 7.4 State Management

Flat global variables in `app.js`. Keine Reactive-Lib.

**Aktuelle State-Variablen:**
```js
// Auth
currentUser, currentProfile, allRoles
inPasswordRecovery

// Detail-Pages
currentCompanyDetailId
currentProjectDetailId
currentContactDetailId

// Modal-Prefills (werden beim Öffnen konsumiert)
contactModalPrefillCompanyId
appointmentModalPrefillCompanyId / ProjectId / ContactId
projectModalPrefillCompanyId / HauptkontaktId
deploymentModalPrefillCompanyId / ProjectId

// Editing-IDs (aktuell offenes Modal)
editingUserId / ServiceId / LookupId / CompanyId / ContactId / AppointmentId / ProjectId / DeploymentId

// Data-Caches (lazy)
companiesCache, contactsCache, appointmentsCache, projectsCache, deploymentsCache
terminTypenCache, projektStatusCache, einsatzStatusCache, servicesCache, userProfilesCache
companyContactsMap  // {companyId → contacts[]} für synchronen Copy
companyAppointmentMap  // {companyId → {next, last}} für Firmen-Übersicht

// Pending filters (aus URL-Parametern)
pendingAppointmentsFilter

// Einsatz-Modal temporär
selectedTechnikerIds  // Set<userId>
```

### 7.5 Caching-Strategie

Caches werden lazy gefüllt und persistieren solange die Session läuft. Invalidation: Manuell nach CRUD-Operationen durch Re-Aufruf der `load*`-Funktionen.

**Sync-Copy-Bedingung (iOS):** `companyContactsMap` wird bei `loadCompanies()` vorab befüllt (ein zweiter Query), damit `copyCompanyById()` **synchron** funktionieren kann — sonst verliert iOS den User-Gesture-Kontext für die Clipboard-API.

### 7.6 Modal-Konventionen

| Modal               | ID                 | Prefixe für Inputs |
|---------------------|--------------------|--------------------|
| Firma               | modal-company      | c-*                |
| Kontakt             | modal-contact      | k-*                |
| Termin              | modal-appointment  | t-*                |
| Projekt             | modal-project      | p-*                |
| Einsatz             | modal-deployment   | d-*                |
| Benutzer            | modal-user         | u-*                |
| Leistung            | modal-service      | s-*                |
| Lookup              | modal-lookup       | l-*                |
| Credentials-Anzeige | modal-credentials  | cred-*             |

Jedes Modal hat: `open<X>Modal(mode, id)`, `close<X>Modal()`, `save<X>()`, meist `delete<X>()`.

### 7.7 Collapsible Modal-Gruppen (v1.9.1)

Jedes Modal ist in Sektionen via `<div class="modal-group-title">` strukturiert. Klick auf einen Sektions-Titel togglet die Sichtbarkeit aller nachfolgenden Geschwister-Elemente bis zum nächsten `.modal-group-title`. Implementiert über Event-Delegation auf `document` — funktioniert automatisch in allen 9 Modals ohne zusätzliches Markup.

Visuelles Feedback via CSS `::after`-Pseudoelement (Chevron dreht sich bei `.collapsed`).

### 7.8 DOM-Update statt Page-Reload (v1.9.8)

Für häufige Micro-Interaktionen (Checkbox-Toggle, Status-Badge-Wechsel) wird nicht die gesamte Detail-Seite neu geladen. Stattdessen:

1. **Direktes DOM-Update** der betroffenen Zeile über `data-*-status`-Attribute
2. **Count-Label-Neuberechnung** aus diesen Attributen (kein DB-Query)
3. **Header-Status-Badge** nur aktualisiert bei tatsächlicher Status-Änderung (via `updateProjectHeaderStatusBadge`)

Das ist die **Ausnahme** von der sonst simplen „Reload nach CRUD"-Strategie und kommt bei den Quick-Toggle-Funktionen in Projekt-Detail zum Einsatz (`toggleDeploymentDone`, `toggleAppointmentDone`).

---

## 8. Cross-Entity-Logik

### 8.1 Prefill-Kaskaden

Wenn aus einer Detailseite ein verwandtes Objekt angelegt wird, werden Felder vorausgefüllt:

| Start             | Action                  | Prefill                                   |
|-------------------|-------------------------|-------------------------------------------|
| Firma-Detail      | + Kontakt               | Firma                                     |
| Firma-Detail      | + Termin                | Firma + Kontakt-Dropdown gefiltert        |
| Firma-Detail      | + Projekt               | Firma                                     |
| Firma-Detail      | + Einsatz               | Firma                                     |
| Kontakt-Detail    | + Termin                | Firma + Kontakt                           |
| Kontakt-Detail    | + Projekt               | Firma + Hauptkontakt                      |
| Projekt-Detail    | + Termin                | Firma + Projekt                           |
| Projekt-Detail    | + Einsatz               | Firma + Projekt                           |

### 8.2 Kontext-sensitiver Refresh nach CRUD

`save<X>` und `delete<X>` prüfen, welche Detail-Page gerade aktiv ist, und refreshen nur die relevante Sektion — bleibt auf der Seite statt zur Liste zurückzuspringen.

### 8.3 Termin-Einsatz-Kopplung (v1.9.4 — Lösch-Semantik)

`appointments.deployment_id` ist optional. Bei Einsatz-Anlage mit Checkbox „Auch als Termin eintragen":

| Aktion                                  | Ergebnis                       |
|-----------------------------------------|--------------------------------|
| Checkbox an + kein Termin               | Termin wird angelegt           |
| Checkbox an + Termin existiert          | Termin wird aktualisiert       |
| Checkbox aus + Termin existiert         | Termin wird **gelöscht**       |
| Checkbox aus + kein Termin              | nichts                         |
| Datum wird entfernt + Termin existiert  | Termin wird **gelöscht**       |
| Einsatz wird gelöscht                   | Gekoppelter Termin auch weg    |

**Design-Entscheidung:** Ursprünglich war es „Entkoppeln statt Löschen", was zu Duplikaten führte (beim erneuten Anhaken wurde der entkoppelte Termin nicht mehr gefunden, neuer angelegt). Ab v1.9.4 ist die Semantik „Checkbox = Termin-Existenz", keine halben Sachen.

### 8.4 Auto-Projekt-Status (v1.9.5)

Nach jeder CRUD-Operation auf Einsätzen oder Terminen eines Projekts wird `checkAndUpdateProjectStatus(projectId)` ausgelöst:

**Regeln:**
- Projekt muss in einem „aktiven" Status sein (`In Arbeit`, `Abschlussphase`, `Abgeschlossen`) — sonst keine Automatik
- Projekt muss mindestens 1 Einsatz haben — sonst keine Automatik
- `Einsätze done` = alle Status in `['Durchgeführt', 'Abgerechnet']`
- `Termine done` = alle Status in `['durchgefuehrt']`

**State-Maschine:**

| Einsätze done | Termine done     | Neuer Status     |
|---------------|------------------|------------------|
| ja            | ja               | `Abgeschlossen`  |
| ja            | nein (oder leer) | `Abschlussphase` |
| nein          | egal             | `In Arbeit`      |

**Funktionsvarianten:**
- `checkAndUpdateProjectStatus(projectId)` — wird nach Modal-CRUD aufgerufen, triggert anschließend Full Page-Reload via `loadProjectDetail`
- `checkAndUpdateProjectStatusSmart(projectId)` — wird nach Quick-Toggle-Checkbox aufgerufen, updated nur das Header-Badge direkt im DOM via `updateProjectHeaderStatusBadge`

### 8.5 Leistungsumsatz-Tracking (v1.9.5)

Jedes Projekt hat **zwei Umsatz-Werte** im Header:
- `Geschätzter Umsatz` — manuell gesetzt, der Paketpreis
- `Leistungsumsatz (Einsätze)` — Summe aller Einsatz-Werte (`menge × einzelpreis`)

Für Paket-Projekte (Festpreis) ist der Leistungsumsatz ein internes Tracking-Tool zur Soll-/Ist-Abschätzung: Weicht er vom geschätzten Umsatz ab, hast du mehr oder weniger Aufwand gemacht als kalkuliert.

### 8.6 Einsätze ohne Datum (v1.9.3)

Einsätze können ohne Datumsfelder angelegt werden — essentiell für Paket-Projekte, bei denen noch keine konkrete Terminierung feststeht (z.B. „8× 1h LifeCall" mit noch offenen Terminen).

**Regeln:**
- `datum_von` und `datum_bis` sind beide nullable
- DB-Constraint `deployments_datum_consistency` stellt sicher: Entweder beide NULL oder beide gesetzt mit `bis ≥ von`
- Uhrzeit ohne Datum nicht möglich (Frontend-Validierung)
- Termin-Kopplung ohne Datum nicht möglich (Termine brauchen Datum)

**Anzeige:**
- Datum-Spalte zeigt graues „Ungeplant"-Badge statt Datum
- Filter-Option „Nur Ungeplante" in Einsätze-Hauptliste
- Sortierung: datierte chronologisch zuerst, Ungeplante am Ende

### 8.7 Einsatz/Termin-Quick-Toggle (v1.9.5 + v1.9.7)

Auf der Projekt-Detailseite hat sowohl die Einsatz- als auch die Termin-Tabelle eine Check-Spalte ganz links. Klick togglet zwischen:

- **Einsatz:** `Geplant` ↔ `Durchgeführt` (Abgerechnet/Storniert sind locked)
- **Termin:** `geplant` ↔ `durchgefuehrt`

Nach jedem Toggle wird sofort die Auto-Status-Logik des Projekts ausgelöst — ohne Page-Reload (siehe 7.8).

---

## 9. Input-Validierung

| Feld-Typ  | HTML-Attribute                                    | JS-Sanitizer                |
|-----------|---------------------------------------------------|------------------------------|
| Telefon   | `type="tel"`, `inputmode="tel"`                   | `sanitizePhoneInput()` — nur 0-9, +, -, (, ), /, ., Leerz. |
| PLZ       | `inputmode="numeric"`, `maxlength="10"`           | `sanitizeNumericInput()`     |
| E-Mail    | `type="email"`, `autocapitalize="none"`, `autocorrect="off"`, `spellcheck="false"` | `sanitizeEmailOnBlur()` (Trim) |
| Preis     | `type="number"`, `min="0"`, `step="0.01"`         | Native + Custom NaN-Check    |

**Status-Validierung (v1.9.6):** Dynamisch gegen den jeweiligen Lookup-Cache statt hardcoded Whitelist:
```js
const validStatuses = projektStatusCache.map(s => s.wert);
if (!validStatuses.includes(status)) { ... }
```

---

## 10. Mobile-Optimierung

- Responsive Breakpoints: **<768px = Mobile, 768px+ = Tablet, 1024px+ = Desktop**
- Tabellen-Action-Spalten (`.col-action`) sind auf Mobile ausgeblendet — Primär-Aktion immer über Titel/Name-Link
- Tabellen mit `table-layout: fixed` + `overflow-x: hidden` auf Mobile → kein horizontales Scrollen
- `fontSize: 16px` auf textareas/inputs → verhindert iOS-Zoom-In
- Clipboard-API: synchroner Fallback mit `textarea + execCommand('copy')` für iOS-Kompatibilität

---

## 11. Konventionen

### 11.1 Naming

| Kontext           | Konvention               | Beispiel                  |
|-------------------|--------------------------|---------------------------|
| UI-Text           | Deutsch                  | „Neuer Termin"            |
| Function-Namen    | camelCase (Englisch)     | `loadCompanyDetail()`     |
| DB-Spalten        | snake_case (Deutsch/EN)  | `geschaetzter_umsatz`     |
| HTML-IDs          | kebab-case mit Präfix    | `t-titel`, `d-datum-von`  |

### 11.2 UI-Verhalten

- **Destruktive Aktionen:** Immer mit `confirm()` bestätigen
- **FK-Fehler:** In `deleteX()` abgefangen → User-freundliche Meldung („Noch verknüpfte Einträge vorhanden")
- **Toasts:** 3 Sekunden Anzeige, Erfolg oder Fehler (`showToast(msg, isError)`)
- **Modals:** Werden mit `openModal` sofort angezeigt; Daten werden ggf. async nachgeladen während das Modal schon offen ist
- **Admin-Only UI:** `data-admin-only="true"` + `applyAdminOnlyUI()`
- **Keine Emojis** in UI-Texten (User-Präferenz)

### 11.3 Farbsystem

CSS-Variablen in `:root`:
```
--bg:       #f9fafb
--surface:  #ffffff
--border:   #e5e7eb
--text:     #111827
--muted:    #6b7280
--primary:  #111827
--link:     #1d4ed8
--danger:   #dc2626
--success:  #16a34a
--warning:  #d97706
```

Status-Farben werden aus `lookup_values.farbe` gelesen → per JS in Badge-Styles geschrieben.

---

## 12. Version-Historie

| Version | Datum       | Highlights                                                         |
|---------|-------------|--------------------------------------------------------------------|
| v1.0.0  | Apr 2026    | CRM-Grundstruktur: Firmen, Kontakte, Benutzer, Leistungen, Stammdaten |
| v1.1.0  | Apr 2026    | RLS-Hardening nach Live-Hack-Test (open policies entfernt)         |
| v1.2.0  | Apr 2026    | Status-Feld Konsolidierung (eingeladen/aktiv/inaktiv)              |
| v1.3.0  | Apr 2026    | manage-users Edge Function (invite/update/delete/reset)            |
| v1.4.0  | Apr 2026    | Passwort-Recovery-Flow, muss_passwort_aendern                      |
| v1.5.0  | Apr 2026    | Firmen-Detailseite, Kontakt-Sektion, Copy-Buttons                  |
| v1.6.0  | Apr 2026    | Phase 3a Stufe 1: Termine (Liste, Modal, Filter)                   |
| v1.6.1  | Apr 2026    | Termine auf Firmen-Detail, Nächster-Termin-Spalte                  |
| v1.7.0  | Apr 2026    | Phase 3b: Projekte (Liste, Detail, Termin-Zuordnung)               |
| v1.7.1  | Apr 2026    | iOS-Clipboard-Fix, Input-Validierung, Mobile-Layout-Fix            |
| v1.8.0  | Apr 2026    | Kontakt-Detailseite mit Terminen und Projekten                     |
| v1.9.0  | Apr 2026    | Phase 3c: Einsätze (Modal, Techniker, Termin-Kopplung)             |
| v1.9.1  | Apr 2026    | Preis-Visibility, Projekt-Einsatz-Refresh, Firmen-Plural, Collapsible Modals |
| v1.9.2  | Apr 2026    | Einsatz-Wert sichtbar bei Projekten, Spalte 'Wert' auf Projekt-Detail |
| v1.9.3  | Apr 2026    | Einsätze ohne Datum (Schema: datum_von/bis nullable)               |
| v1.9.4  | Apr 2026    | Termin-Duplikat-Bug gefixt (Lösch-Semantik statt Entkopplung)      |
| v1.9.5  | Apr 2026    | Einsatz-Abhaken-Checkbox, Auto-Projekt-Status, Leistungsumsatz     |
| v1.9.6  | Apr 2026    | Dynamische Status-Validierung gegen Lookup (CHECK-Constraints entfernt) |
| v1.9.7  | Apr 2026    | Termin-Abhaken-Checkbox in Projekten                               |
| **v1.9.8** | **21.04.2026** | **Flüssiges DOM-Update bei Checkbox-Toggle (kein Page-Reload)**|

---

## 13. Roadmap & offene Punkte

### 13.1 Hoch — Security

| Punkt                        | Beschreibung                                           |
|------------------------------|--------------------------------------------------------|
| Last-Admin-Schutz            | Edge Function soll verhindern, dass letzter Admin gelöscht / degradiert wird |
| Role-Self-Escalation         | RLS-Policy auf user_profiles muss `role_id`-Update für sich selbst blockieren |
| Login-Blocker inaktiv        | Server-seitige Blockade für Status=inaktiv (nicht nur Frontend-Redirect) |
| Auto eingeladen → aktiv      | Beim ersten erfolgreichen Login + Passwort-Change: Status auto-setzen |
| Soft-Delete                  | Für Firmen/Kontakte/Projekte: `deleted_at` statt hard delete |

### 13.2 Mittel — Fachlich

| Punkt                      | Beschreibung                                           |
|----------------------------|--------------------------------------------------------|
| Phase 4: Dashboard         | Umsatz (geplant vs. real), KPI-Tracking, Ziele         |
| Dublettenerkennung         | Bei Firmen- und Kontakt-Anlage                         |
| Export                     | CSV/Excel für Firmen, Kontakte, Termine, Einsätze      |
| Multi-Leistungen pro Einsatz | Sub-Positionen (statt 1:1 service_id)                |
| Kalender-View              | Monat/Woche-Ansicht für Termine zusätzlich zur Liste   |
| Einsätze-Check-Spalte      | Auch in Hauptliste und Firma-Detail (aktuell nur Projekt-Detail) |

### 13.3 Niedrig — Komfort

| Punkt                      | Beschreibung                                           |
|----------------------------|--------------------------------------------------------|
| Notes-Entity aktivieren    | Bereits angelegt — separate Tabelle statt Freitext-Felder |
| Audit-Log                  | Wer hat wann was geändert                              |
| Globale Suche              | Cmd+K / Spotlight über alle Entitäten                  |
| Storage                    | File-Uploads an Projekten / Einsätzen                  |
| Email-Integration          | Termineinladungen versenden, Zusagen tracken           |

### 13.4 Aktuell ungenutzte Schema-Elemente

- `notes` Tabelle
- `appointment_participants` Tabelle
- `roles.rechte` (JSONB-Feld, noch kein granular rights system)

---

## 14. Betriebs-Notizen

### 14.1 Deployment-Flow

1. Dateien in `index.html`, `styles.css`, `app.js` editieren
2. Via GitHub Web-UI: „Add file" → „Upload files" → Drop → „Replace existing"
3. Commit-Message mit Version-Tag (z.B. „v1.9.8: ...")
4. Vercel deployed automatisch aus `main` (30–60s)
5. Hard-Reload im Browser (Cmd+Shift+R)
6. Bei erfolgreichem Test: GitHub-Release mit Tag erstellen

### 14.2 Konfiguration (hardcoded in app.js)

```js
SUPABASE_URL      = 'https://loohjeiysjxzbmfwkyvv.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGci...L75kTzqx4hJY7buBFv9iMZ-mrQ3vdNqB-G50MPpRbNw'  // legacy anon key
FUNCTIONS_URL     = SUPABASE_URL + '/functions/v1'
```

Der Anon-Key ist **bewusst hardcoded** — ist nach Design öffentlich, RLS schützt die Daten.

### 14.3 Benutzer aktuell

| Name          | E-Mail                | Rolle    | Status       |
|---------------|-----------------------|----------|--------------|
| Selcuk Cumart | selcuk@cumart.tech    | Admin    | aktiv        |
| Yasin Satici  | yasin@fiveax.com      | Vertrieb | eingeladen/aktiv |

### 14.4 Schema-Migrationen (kritisch)

Folgende Migrationen wurden seit v1.0 ausgeführt. Bei einem hypothetischen DB-Rebuild müssen sie in dieser Reihenfolge ausgeführt werden:

1. **Initial Schema** (v1.0)
2. **RLS-Hardening** (v1.1): Open Policies entfernt
3. **User-Status-Konsolidierung** (v1.2)
4. **Phase 3a Termine-Tabelle** (v1.6)
5. **Phase 3b Projekte-Tabelle** (v1.7)
6. **Phase 3c Deployments + Junction** (v1.9.0)
7. **v1.9.3:** `ALTER TABLE deployments ALTER COLUMN datum_von DROP NOT NULL;` + `datum_bis` dito + Konsistenz-CHECK `deployments_datum_consistency`
8. **v1.9.6:** `ALTER TABLE projects DROP CONSTRAINT projects_status_check;` + `ALTER TABLE deployments DROP CONSTRAINT deployments_status_check;`
9. **Lookup-Eintrag:** `Abschlussphase` in `lookup_values` (Kategorie `projekt_status`)

---

## 15. Entwicklungs-Philosophie

1. **Schema-First:** Schema-Änderungen über Migration im SQL-Editor, dann Frontend nachziehen
2. **Ein Feature pro Version:** Kleine, testbare Releases
3. **Cache-First:** Teure Queries (Listen mit Joins) werden gecached, nur bei CRUD invalidiert
4. **Sync-Ready auf Mobile:** Clipboard, Input-Modes und Layout iOS-getestet
5. **Pragmatisch > elegant:** Keine Framework-Overengineering, keine Build-Pipeline
6. **Fachliche Trennung:** Termin (Aufwand) vs. Einsatz (Umsatz) vs. Projekt (Paket) — saubere Semantik ist wichtiger als Entitäten-Sparsamkeit
7. **Stammdaten > Code:** Admin-veränderliche Werte (Status, Typen) kommen aus `lookup_values`, nicht aus CHECK-Constraints
8. **DOM-Update > Page-Reload:** Für häufige Micro-Interaktionen gezielt Elemente aktualisieren statt ganze Seiten neu rendern

---

*Ende der Dokumentation · Cumart CRM v1.9.8*
