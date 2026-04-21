# Cumart CRM — Architektur-Dokumentation

**Version:** 1.10.0
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

---

## 3. Dateistruktur

```
cumart-consulting-crm/
├── index.html       ~1.7k Zeilen  (alle Pages + Modals als hidden divs)
├── styles.css         ~900 Zeilen  (CSS-Variablen, Desktop + Mobile)
├── app.js            ~4.8k Zeilen  (alle Module in einer Datei)
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
| `services`                | Leistungskatalog (mit Default-Uhrzeiten)        |
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
| status              | text         | NO       | 'Angebot'    | **Kein CHECK** (seit v1.9.6), validiert über lookup_values |
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

**Projekt-Status-Werte (Lookup, Kategorie `projekt_status`):**
- `Lead` / `Angebot` / `In Arbeit` / `Abschlussphase` / `Abgeschlossen` / `Verloren`

Die drei aktiven Status (`In Arbeit`, `Abschlussphase`, `Abgeschlossen`) werden automatisch gewechselt, siehe 8.4.

### 4.6 `deployments` (Einsätze)

| Spalte            | Typ          | Nullable | Default   | Notes                              |
|-------------------|--------------|----------|-----------|------------------------------------|
| id                | uuid         | NO       | gen_random_uuid() | PK                         |
| titel             | text         | NO       |           | Kann beim Frontend-Save leer sein → Auto-Titel (v1.10.0) |
| datum_von         | date         | YES      |           | NULLable seit v1.9.3               |
| datum_bis         | date         | YES      |           | NULLable seit v1.9.3               |
| uhrzeit_von       | time         | YES      |           |                                    |
| uhrzeit_bis       | time         | YES      |           |                                    |
| status            | text         | NO       | 'Geplant' | **Kein CHECK** (seit v1.9.6), validiert über lookup_values |
| company_id        | uuid         | YES      |           | FK → companies (pflicht im UI)     |
| project_id        | uuid         | YES      |           | FK → projects                      |
| service_id        | uuid         | YES      |           | FK → services                      |
| menge             | numeric      | YES      | 1         |                                    |
| einzelpreis       | numeric      | YES      | 0         | bei Projekt-Einsatz: interner Aufwand |
| ort               | text         | YES      |           |                                    |
| externe_techniker | text         | YES      |           | Freitext für Nicht-User            |
| beschreibung      | text         | YES      |           | Kann beim Save leer sein → Auto-Beschreibung (v1.10.0) |
| notizen           | text         | YES      |           |                                    |
| erstellt_von      | uuid         | YES      |           |                                    |
| created_at        | timestamptz  | YES      | now()     |                                    |

**Constraints:** `deployments_datum_consistency`: Entweder beide Datumsfelder NULL oder beide gesetzt mit `datum_bis >= datum_von`

### 4.7 `deployment_technicians` (Junction)

| Spalte        | Typ  | Nullable | Notes                                         |
|---------------|------|----------|-----------------------------------------------|
| id            | uuid | NO       | PK                                            |
| deployment_id | uuid | NO       | FK → deployments (ON DELETE CASCADE)          |
| user_id       | uuid | NO       | FK → user_profiles (ON DELETE CASCADE)        |

**Constraint:** UNIQUE (deployment_id, user_id)

### 4.8 `services`

| Spalte                 | Typ          | Nullable | Default | Notes                              |
|------------------------|--------------|----------|---------|------------------------------------|
| id                     | uuid         | NO       | gen_random_uuid() | PK                       |
| name                   | text         | NO       |         |                                    |
| kategorie_id           | uuid         | YES      |         | FK → lookup_values (leistungs_kategorie) |
| einheit                | text         | NO       |         | CHECK: Tag, Stunde, Pauschale, Stück |
| standardpreis          | numeric      | YES      | 0       |                                    |
| standard_uhrzeit_von   | time         | YES      |         | **Neu v1.10.0:** Default-Startzeit im Einsatz-Modal |
| standard_uhrzeit_bis   | time         | YES      |         | **Neu v1.10.0:** Default-Endzeit im Einsatz-Modal |
| beschreibung           | text         | YES      |         |                                    |
| ist_aktiv              | boolean      | YES      | true    |                                    |
| created_at             | timestamptz  | YES      | now()   |                                    |

Die Default-Uhrzeiten werden im Einsatz-Modal automatisch übernommen, wenn die Uhrzeit-Felder dort leer sind. Beispiel: Leistung „TNC-Club Premiumtag" mit `09:00–15:00` → wird beim Anklicken vorausgefüllt.

### 4.9 `lookup_values`

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
- `leistungs_kategorie` → Training / Einsatz / Online / Projekt / ...

**Design-Entscheidung (v1.9.6):** Status-Werte für Projekte und Einsätze sind ausschließlich durch `lookup_values` definiert — keine hardcoded DB-CHECK-Constraints. Admin kann jederzeit neue Werte in den Stammdaten hinzufügen, die sofort im System verfügbar sind.

**Caveat:** Status-Werte mit Business-Logik-Bedeutung (z.B. `Abschlussphase`, `Abgeschlossen`, `Durchgeführt`, `Abgerechnet`) dürfen nicht umbenannt werden — die Auto-Status-Logik referenziert sie fest. Deaktivieren via `ist_aktiv = false` ist OK.

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

Rollen: Admin, Vertrieb, Techniker.

---

## 5. Row Level Security (RLS)

**Hybrid-Strategie ("Option C"):** Strikt auf `user_profiles`, `roles`, `lookup_values` (Admin-Write). Open authenticated auf allen operativen Tabellen.

**Bekannte offene Punkte** (siehe Roadmap): Role-Self-Escalation theoretisch möglich, Last-Admin-Schutz fehlt.

---

## 6. Edge Function `manage-users`

**URL:** `https://loohjeiysjxzbmfwkyvv.supabase.co/functions/v1/manage-users`
**Runtime:** Deno, JWT ES256
**Actions:** invite / update / delete / reset_password
**Wichtig:** „Verify JWT with legacy secret" ist deaktiviert.

---

## 7. Frontend-Architektur

### 7.1 SPA-Modell

Kein Server-Side-Rendering, keine Builds. `index.html` enthält alle Pages als `<div class="page">` — in `app.js` wird nur die jeweils aktive sichtbar geschaltet per `.active`-Klasse.

### 7.2 Router

Hash-basiert in `handleHashChange()`. Hashes: `#/firmen`, `#/firma/UUID`, `#/kontakte`, `#/kontakt/UUID`, `#/termine`, `#/projekte`, `#/projekt/UUID`, `#/einsaetze`, `#/benutzer`, `#/leistungen`, `#/stammdaten`.

Keine Detail-Route für Einsätze — CRUD läuft via Modal.

### 7.3 Navigation

- **Desktop-Sidebar:** Firmen / Kontakte / Termine / Projekte / Einsätze + Einstellungen (admin-only)
- **Mobile-Bottom-Nav:** Firmen / Termine / Einsätze / Mehr
- **Mehr-Menü:** Kontakte, Projekte + admin-Tools

### 7.4 State Management

Flat global variables in `app.js`. Keine Reactive-Lib. Wichtige Variablen: `currentUser`, `currentProfile`, Detail-IDs (`currentCompanyDetailId` etc.), Prefill-Variablen für Modal-Autofill, Editing-IDs für offene Modals, diverse Caches (lazy-loaded).

### 7.5 Caching-Strategie

Caches werden lazy gefüllt und persistieren pro Session. Invalidation: manuell nach CRUD durch Re-Aufruf der `load*`-Funktionen. **Wichtig:** `servicesCache` wird beim Speichern einer Leistung explizit geleert, damit neue Standard-Uhrzeiten im Einsatz-Modal sichtbar werden (v1.10.0).

### 7.6 Modal-Konventionen

| Modal               | ID                 | Prefixe |
|---------------------|--------------------|---------|
| Firma               | modal-company      | c-*     |
| Kontakt             | modal-contact      | k-*     |
| Termin              | modal-appointment  | t-*     |
| Projekt             | modal-project      | p-*     |
| Einsatz             | modal-deployment   | d-*     |
| Benutzer            | modal-user         | u-*     |
| Leistung            | modal-service      | s-*     |
| Lookup              | modal-lookup       | l-*     |

### 7.7 Collapsible Modal-Gruppen (v1.9.1)

Klick auf `<div class="modal-group-title">` togglet alle nachfolgenden Geschwister bis zum nächsten Titel — via Event-Delegation, wirkt in allen Modals automatisch.

### 7.8 DOM-Update statt Page-Reload (v1.9.8)

Für Quick-Toggle-Checkboxen werden nur betroffene DOM-Elemente aktualisiert (Badge, Count-Label, Header-Status). Vermeidet Flicker. Kommt bei `toggleDeploymentDone` und `toggleAppointmentDone` zum Einsatz.

---

## 8. Cross-Entity-Logik

### 8.1 Prefill-Kaskaden

| Start             | Action          | Prefill                                 |
|-------------------|-----------------|-----------------------------------------|
| Firma-Detail      | + Kontakt       | Firma                                   |
| Firma-Detail      | + Termin        | Firma + Kontakt-Dropdown gefiltert      |
| Firma-Detail      | + Projekt       | Firma                                   |
| Firma-Detail      | + Einsatz       | Firma                                   |
| Kontakt-Detail    | + Termin        | Firma + Kontakt                         |
| Kontakt-Detail    | + Projekt       | Firma + Hauptkontakt                    |
| Projekt-Detail    | + Termin        | Firma + Projekt                         |
| Projekt-Detail    | + Einsatz       | Firma + Projekt                         |

### 8.2 Auto-Fill im Einsatz-Modal (v1.10.0)

Zusätzlich zu den Prefill-Kaskaden gibt es beim Anlegen eines Einsatzes drei weitere Automatiken, die aktiv werden, sobald der User bestimmte Felder auswählt:

**(1) Leistung wählen → Auto-Fill Einzelpreis + Uhrzeiten**
- `services.standardpreis` → `d-einzelpreis` (nur wenn leer / 0)
- `services.standard_uhrzeit_von` → `d-uhrzeit-von` (nur wenn leer)
- `services.standard_uhrzeit_bis` → `d-uhrzeit-bis` (nur wenn leer)

**(2) Firma wählen → Auto-Ort**
- Firmenadresse (`strasse, plz stadt`) wird in `d-ort` gesetzt (nur wenn leer)
- Manueller „übernehmen"-Link unter dem Feld bleibt als Fallback erhalten (z.B. wenn User Ort manuell geändert hat und doch zurück zur Firmenadresse möchte)

**(3) Speichern mit leerem Titel/Beschreibung → Auto-Generate** (nur beim Neu-Anlegen, nicht bei Edit)

- **Titel:** `{Leistung} × {Firma} × {Benutzer}` — leere Teile werden übersprungen
  - Beispiel: `TNC-Club Premiumtag × Dürr Systems AG × Selcuk Cumart`

- **Beschreibung:** mehrzeilige Zusammenfassung **ohne Preise**
  ```
  TNC-Club Premiumtag bei Dürr Systems AG am 25.04.2026 von 09:00 bis 15:00 Uhr.
  Techniker: Selcuk Cumart, Yasin Satici
  Ort: Industriestr. 2, 71735 Eberdingen
  ```

Implementiert in `generateDeploymentAutoTitle()` und `generateDeploymentAutoDescription()`. Beim Edit-Modus bleibt alles wie vom User eingetippt.

### 8.3 Kontext-sensitiver Refresh nach CRUD

`save<X>` und `delete<X>` prüfen, welche Detail-Page aktiv ist, und refreshen nur die relevante Sektion.

### 8.4 Termin-Einsatz-Kopplung (v1.9.4 — Lösch-Semantik)

`appointments.deployment_id` koppelt Termin an Einsatz. Bei Checkbox „Auch als Termin eintragen":

| Aktion                                  | Ergebnis                       |
|-----------------------------------------|--------------------------------|
| Checkbox an + kein Termin               | Termin wird angelegt           |
| Checkbox an + Termin existiert          | Termin wird aktualisiert       |
| Checkbox aus + Termin existiert         | Termin wird **gelöscht**       |
| Checkbox aus + kein Termin              | nichts                         |
| Datum wird entfernt + Termin existiert  | Termin wird **gelöscht**       |
| Einsatz wird gelöscht                   | Gekoppelter Termin auch weg    |

### 8.5 Auto-Projekt-Status (v1.9.5)

Nach CRUD auf Einsätzen/Terminen eines Projekts:

| Einsätze done | Termine done     | Neuer Status     |
|---------------|------------------|------------------|
| ja            | ja               | `Abgeschlossen`  |
| ja            | nein (oder leer) | `Abschlussphase` |
| nein          | egal             | `In Arbeit`      |

Regeln: Projekt in aktiven Status (`In Arbeit`, `Abschlussphase`, `Abgeschlossen`) und ≥ 1 Einsatz vorhanden.

**Funktionsvarianten:**
- `checkAndUpdateProjectStatus()` — Full Page-Reload nach Modal-CRUD
- `checkAndUpdateProjectStatusSmart()` — direktes DOM-Update nach Checkbox-Toggle

### 8.6 Leistungsumsatz-Tracking (v1.9.5)

Projekt-Header zeigt zwei Umsatz-Werte:
- **Geschätzter Umsatz** — manueller Paketpreis (= Kundenrechnung)
- **Leistungsumsatz (Einsätze)** — Summe aller Einsatz-Werte (`menge × einzelpreis`)

### 8.7 Einsätze ohne Datum (v1.9.3)

Für Vorausplanung in Paket-Projekten. Regeln: beide Datumsfelder nullable, Constraint `deployments_datum_consistency`, Uhrzeit/Termin-Kopplung ohne Datum nicht möglich. Anzeige: graues „Ungeplant"-Badge.

### 8.8 Quick-Toggle-Checkboxen (v1.9.5 + v1.9.7)

Auf Projekt-Detail haben sowohl Einsatz- als auch Termin-Tabelle eine Checkbox-Spalte ganz links. Toggelt zwischen:
- Einsatz: `Geplant` ↔ `Durchgeführt`
- Termin: `geplant` ↔ `durchgefuehrt`

Jedes Toggle löst Auto-Status-Logik aus (8.5).

---

## 9. Input-Validierung

| Feld-Typ  | HTML-Attribute                                    | JS-Sanitizer                |
|-----------|---------------------------------------------------|------------------------------|
| Telefon   | `type="tel"`, `inputmode="tel"`                   | `sanitizePhoneInput()`       |
| PLZ       | `inputmode="numeric"`, `maxlength="10"`           | `sanitizeNumericInput()`     |
| E-Mail    | `type="email"` + no-autocapitalize etc.           | `sanitizeEmailOnBlur()`      |
| Preis     | `type="number"`, `min="0"`, `step="0.01"`         | Native + NaN-Check           |

**Status-Validierung (v1.9.6):** Dynamisch gegen Lookup-Cache statt hardcoded Whitelist.

---

## 10. Mobile-Optimierung

- Breakpoints: <768px = Mobile, 768px+ = Tablet, 1024px+ = Desktop
- `.col-action` auf Mobile ausgeblendet — Primär-Aktion über Titel-Link
- Tabellen mit `table-layout: fixed` → kein horizontales Scrollen
- `fontSize: 16px` auf inputs → verhindert iOS-Zoom
- Sync-Clipboard-Fallback für iOS

---

## 11. Konventionen

### 11.1 Naming

| Kontext           | Konvention               | Beispiel                  |
|-------------------|--------------------------|---------------------------|
| UI-Text           | Deutsch, keine Emojis    | „Neuer Termin"            |
| Function-Namen    | camelCase (Englisch)     | `loadCompanyDetail()`     |
| DB-Spalten        | snake_case               | `geschaetzter_umsatz`     |
| HTML-IDs          | kebab-case mit Präfix    | `t-titel`, `d-datum-von`  |

### 11.2 UI-Verhalten

- Destruktive Aktionen mit `confirm()`
- FK-Fehler in `deleteX()` abgefangen
- Toasts 3s Anzeige
- Admin-Only UI via `data-admin-only="true"` + `applyAdminOnlyUI()`

### 11.3 Farbsystem

CSS-Variablen in `:root`. Status-Farben aus `lookup_values.farbe`.

---

## 12. Version-Historie

| Version | Datum       | Highlights                                                         |
|---------|-------------|--------------------------------------------------------------------|
| v1.0.0  | Apr 2026    | CRM-Grundstruktur                                                  |
| v1.1.0  | Apr 2026    | RLS-Hardening (open policies entfernt)                             |
| v1.2.0  | Apr 2026    | User-Status-Konsolidierung                                         |
| v1.3.0  | Apr 2026    | manage-users Edge Function                                         |
| v1.4.0  | Apr 2026    | Passwort-Recovery-Flow                                             |
| v1.5.0  | Apr 2026    | Firmen-Detailseite + Copy-Buttons                                  |
| v1.6.0  | Apr 2026    | Phase 3a: Termine (Liste, Modal, Filter)                           |
| v1.6.1  | Apr 2026    | Termine auf Firmen-Detail                                          |
| v1.7.0  | Apr 2026    | Phase 3b: Projekte (Liste, Detail)                                 |
| v1.7.1  | Apr 2026    | iOS-Fix, Input-Validierung, Mobile-Layout                          |
| v1.8.0  | Apr 2026    | Kontakt-Detailseite                                                |
| v1.9.0  | Apr 2026    | Phase 3c: Einsätze + Termin-Kopplung                               |
| v1.9.1  | Apr 2026    | Firmen-Plural-Fix, Collapsible Modals, Preis-Visibility            |
| v1.9.2  | Apr 2026    | Einsatz-Wert sichtbar bei Projekten, Spalte 'Wert'                 |
| v1.9.3  | Apr 2026    | Einsätze ohne Datum (Schema: datum_von/bis nullable)               |
| v1.9.4  | Apr 2026    | Termin-Duplikat-Bug gefixt (Lösch-Semantik)                        |
| v1.9.5  | Apr 2026    | Einsatz-Abhaken-Checkbox, Auto-Projekt-Status, Leistungsumsatz     |
| v1.9.6  | Apr 2026    | Dynamische Status-Validierung (CHECK-Constraints entfernt)         |
| v1.9.7  | Apr 2026    | Termin-Abhaken-Checkbox in Projekten                               |
| v1.9.8  | Apr 2026    | Flüssiges DOM-Update bei Checkbox-Toggle                           |
| **v1.10.0** | **21.04.2026** | **Auto-Fill im Einsatz-Modal: Titel, Uhrzeit aus Leistung, Ort aus Firma, Beschreibung** |

---

## 13. Roadmap & offene Punkte

### 13.1 Hoch — Security

| Punkt                        | Beschreibung                                           |
|------------------------------|--------------------------------------------------------|
| Last-Admin-Schutz            | Edge Function verhindert Lösch/Downgrade des letzten Admins |
| Role-Self-Escalation         | RLS-Policy blockiert Rollenwechsel durch User selbst   |
| Login-Blocker inaktiv        | Server-seitige Blockade für Status=inaktiv             |
| Auto eingeladen → aktiv      | Beim ersten Login + Passwort-Change                    |
| Soft-Delete                  | `deleted_at` statt hard delete für wichtige Entitäten  |

### 13.2 Mittel — Fachlich

| Punkt                      | Beschreibung                                           |
|----------------------------|--------------------------------------------------------|
| Phase 4: Dashboard         | Umsatz geplant vs. real, KPI-Tracking, Ziele           |
| Dublettenerkennung         | Bei Firmen- und Kontakt-Anlage                         |
| Export                     | CSV/Excel für alle Entitäten                           |
| Multi-Leistungen pro Einsatz | Sub-Positionen statt 1:1 service_id                  |
| Kalender-View              | Monat/Woche-Ansicht für Termine                        |
| Einsätze-Check-Spalte      | Auch in Hauptliste und Firma-Detail                    |

### 13.3 Niedrig — Komfort

| Punkt                      | Beschreibung                                           |
|----------------------------|--------------------------------------------------------|
| Notes-Entity aktivieren    | Separate Tabelle statt Freitext-Felder                 |
| Audit-Log                  | Wer hat wann was geändert                              |
| Globale Suche              | Cmd+K über alle Entitäten                              |
| Storage                    | File-Uploads an Projekten/Einsätzen                    |
| Email-Integration          | Termineinladungen, Zusagen tracken                     |

---

## 14. Betriebs-Notizen

### 14.1 Deployment-Flow

1. Dateien editieren
2. GitHub Web-UI: „Upload files" → Drop → „Replace existing"
3. Commit mit Version-Tag
4. Vercel deployed automatisch (~30–60s)
5. Hard-Reload im Browser (Cmd+Shift+R)

### 14.2 Konfiguration (hardcoded in app.js)

```js
SUPABASE_URL      = 'https://loohjeiysjxzbmfwkyvv.supabase.co'
SUPABASE_ANON_KEY = 'eyJhbGci...'  // legacy anon key
FUNCTIONS_URL     = SUPABASE_URL + '/functions/v1'
```

### 14.3 Benutzer aktuell

| Name          | E-Mail                | Rolle    |
|---------------|-----------------------|----------|
| Selcuk Cumart | selcuk@cumart.tech    | Admin    |
| Yasin Satici  | yasin@fiveax.com      | Vertrieb |

### 14.4 Schema-Migrationen (kritisch, in Reihenfolge)

1. Initial Schema (v1.0)
2. RLS-Hardening (v1.1)
3. User-Status-Konsolidierung (v1.2)
4. Phase 3a Termine (v1.6)
5. Phase 3b Projekte (v1.7)
6. Phase 3c Deployments + Junction (v1.9.0)
7. **v1.9.3:** `deployments.datum_von/bis` nullable + `deployments_datum_consistency`
8. **v1.9.6:** DROP CHECKs auf `projects.status` + `deployments.status`
9. Lookup-Eintrag `Abschlussphase` in `lookup_values`
10. **v1.10.0:** `services` bekommt `standard_uhrzeit_von`, `standard_uhrzeit_bis` (time, nullable)

### 14.5 Verifikations-Query (alle Migrationen prüfen)

```sql
SELECT 'projects.status CHECK' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM pg_constraint
           WHERE conrelid='public.projects'::regclass AND conname='projects_status_check')
       THEN 'VORHANDEN - muss entfernt werden' ELSE 'OK' END AS status
UNION ALL
SELECT 'deployments.status CHECK',
       CASE WHEN EXISTS (SELECT 1 FROM pg_constraint
           WHERE conrelid='public.deployments'::regclass AND conname='deployments_status_check')
       THEN 'VORHANDEN - muss entfernt werden' ELSE 'OK' END
UNION ALL
SELECT 'deployments.datum_von nullable',
       CASE WHEN (SELECT is_nullable FROM information_schema.columns
           WHERE table_schema='public' AND table_name='deployments' AND column_name='datum_von')='YES'
       THEN 'OK' ELSE 'NICHT OK' END
UNION ALL
SELECT 'deployments_datum_consistency',
       CASE WHEN EXISTS (SELECT 1 FROM pg_constraint
           WHERE conrelid='public.deployments'::regclass AND conname='deployments_datum_consistency')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'services.standard_uhrzeit_von',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='services' AND column_name='standard_uhrzeit_von')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'services.standard_uhrzeit_bis',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='services' AND column_name='standard_uhrzeit_bis')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'Lookup-Wert Abschlussphase',
       CASE WHEN EXISTS (SELECT 1 FROM lookup_values
           WHERE kategorie='projekt_status' AND wert='Abschlussphase' AND ist_aktiv=true)
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'appointments.deployment_id',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='appointments' AND column_name='deployment_id')
       THEN 'OK' ELSE 'FEHLT' END;
```

---

## 15. Entwicklungs-Philosophie

1. **Schema-First:** Schema-Änderungen über Migration, dann Frontend nachziehen
2. **Ein Feature pro Version:** Kleine, testbare Releases
3. **Cache-First mit expliziter Invalidation:** Lazy gefüllt, manuell invalidiert nach Writes
4. **Sync-Ready auf Mobile:** Clipboard, Input-Modes, Layout iOS-getestet
5. **Pragmatisch > elegant:** Keine Framework-Overengineering, keine Build-Pipeline
6. **Fachliche Trennung:** Termin (Aufwand) vs. Einsatz (Umsatz) vs. Projekt (Paket)
7. **Stammdaten > Code:** Admin-veränderliche Werte kommen aus `lookup_values`, nicht aus CHECK-Constraints
8. **DOM-Update > Page-Reload:** Für häufige Micro-Interaktionen gezielt Elemente aktualisieren
9. **Auto-Fill > Pflichtfelder:** Felder, die sinnvoll aus Kontext ableitbar sind, werden automatisch befüllt (v1.10.0) — reduziert Tipparbeit ohne Kontrolle zu verlieren

---

*Ende der Dokumentation · Cumart CRM v1.10.0*
