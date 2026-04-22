# Cumart CRM — Architektur-Dokumentation

**Version:** 1.21.0
**Stand:** 22. April 2026
**Betreiber:** Cumart Consulting (Selcuk Cumart)
**Repository:** `GorillaMilling66/cumart-consulting-crm` (GitHub)
**Live:** `https://cumart.cloud` (Primary) · `https://cumart-consulting-crm.vercel.app` (Fallback)

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
- **Mitgliedschaften & Bonis** (Kontingent-Tracking: TNC-Club, Pakete, ab v1.12)

**Fachliche Trennung der Kern-Entitäten:**

| Entität       | Bedeutung                              | Umsatz          |
|---------------|----------------------------------------|-----------------|
| Termin        | Gesprächstermin, Akquise, Abstimmung   | nein (Aufwand)  |
| Einsatz       | Abrechenbare Leistung beim Kunden      | ja              |
| Projekt       | Paket mehrerer Einsätze mit Festpreis  | ja (Paketpreis) |
| Mitgliedschaft| Vertragsverhältnis mit Kontingenten    | ja (abonnement) |
| Entitlement   | Einzelner Bonus/Kontingent-Eintrag     | wird „verbraucht" |

**Umsatz-Logik:**
- Bei **Einzel-Einsätzen** (kein Projekt): `menge × einzelpreis` = Kundenumsatz
- Bei **Projekt-Einsätzen**: Einzel-Preise sind interner Wert (Aufwands-Tracking), Paketpreis = Kundenumsatz
- **Leistungsumsatz** eines Projekts = Summe aller Einsatz-Werte (für Soll/Ist-Vergleich)
- **Mitgliedschaft:** Beitrag pro Laufzeit; Bonis werden bei Einlösung an Einsatz gekoppelt

---

## 2. Tech-Stack

| Schicht       | Technologie                             |
|---------------|-----------------------------------------|
| Frontend      | Vanilla HTML/CSS/JS (kein Framework)    |
| Hosting       | Vercel (Auto-Deploy aus main)           |
| Backend       | Supabase (Postgres + Auth + Edge Funcs) |
| Auth          | Supabase Auth, JWT ES256                |
| Admin-Actions | Edge Function `manage-users` (Deno)     |
| Custom Domain | cumart.cloud (IONOS DNS → Vercel)       |
| Plan          | Supabase Free Tier                      |

---

## 3. Dateistruktur

```
cumart-consulting-crm/
├── index.html       ~1.95k Zeilen  (alle Pages + Modals als hidden divs)
├── styles.css       ~1.05k Zeilen  (CSS-Variablen, Desktop + Mobile)
├── app.js            ~6.15k Zeilen  (alle Module in einer Datei)
├── CLAUDE.md                        (Onboarding-Guide für Claude-Code-Sessions)
├── migrations/                      (versionierte SQL-Migrationen, manuell in Supabase angewandt)
│   ├── v1.15.0_auth_hardening.sql
│   └── v1.16.0_soft_delete.sql
├── supabase/
│   └── functions/manage-users/
└── .git/
```

Supabase:
```
Project: loohjeiysjxzbmfwkyvv.supabase.co
├── Schema: public (16 operative Tabellen)
└── Edge Functions:
    └── manage-users   (invite, update, delete, reset_password)
```

---

## 4. Datenbank-Schema (Postgres)

### 4.1 Tabellen-Übersicht

| Tabelle                   | Zweck                                                |
|---------------------------|------------------------------------------------------|
| `companies`               | Firmen/Kunden                                        |
| `contacts`                | Kontakte bei Firmen                                  |
| `appointments`            | Termine (Akquise, Abstimmung)                        |
| `projects`                | Paket-Projekte mit Festpreis                         |
| `deployments`             | Einsätze (abrechenbare Leistungen)                   |
| `deployment_technicians`  | n:m zwischen Einsätzen und internen Technikern       |
| `services`                | Leistungskatalog (mit Default-Uhrzeiten)             |
| `lookup_values`           | Generische Dropdown-Werte (Status, Typen etc.)       |
| `roles`                   | Rollen (Admin, Vertrieb, Techniker)                  |
| `user_profiles`           | Interne Benutzer (ergänzt auth.users)                |
| `membership_programs`     | Mitgliedschafts-Typen (v1.12, z. B. TNC-Club)        |
| `membership_program_benefits` | Bonis pro Programm (v1.12)                       |
| `memberships`             | Konkrete Mitgliedschaft einer Firma (v1.13)          |
| `entitlements`            | Kontingent-Einträge (v1.13)                          |
| `entitlement_redemptions` | Einlösungen pro Einsatz (v1.14)                      |
| `notes`                   | (angelegt, bisher ungenutzt)                         |
| `appointment_participants`| (angelegt, bisher ungenutzt)                         |

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
| deleted_at    | timestamptz  | YES      |         | Soft-Delete (v1.16). NULL = aktiv, Wert = Löschzeitpunkt |

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
| erstellt_von  | uuid         | YES      |         |                                    |
| created_at    | timestamptz  | YES      | now()   |                                    |
| deleted_at    | timestamptz  | YES      |         | Soft-Delete (v1.16)                |

### 4.4 `appointments`

| Spalte         | Typ          | Nullable | Default        | Notes                              |
|----------------|--------------|----------|----------------|------------------------------------|
| id             | uuid         | NO       | gen_random_uuid() | PK                              |
| titel          | text         | NO       |                |                                    |
| datum          | date         | NO       |                |                                    |
| uhrzeit_von    | time         | YES      |                |                                    |
| uhrzeit_bis    | time         | YES      |                |                                    |
| status         | text         | NO       | 'geplant'      | 'geplant', 'durchgefuehrt' (Konstanten) |
| typ_id         | uuid         | YES      |                | FK → lookup_values (termin_typ)    |
| company_id     | uuid         | YES      |                |                                    |
| contact_id     | uuid         | YES      |                | FK → contacts (ON DELETE SET NULL) |
| project_id     | uuid         | YES      |                | FK → projects (ON DELETE SET NULL) |
| deployment_id  | uuid         | YES      |                | FK → deployments (Einsatz-Kopplung)|
| ort            | text         | YES      |                |                                    |
| notizen        | text         | YES      |                |                                    |
| erstellt_von   | uuid         | YES      |                |                                    |
| created_at     | timestamptz  | YES      | now()          |                                    |
| deleted_at     | timestamptz  | YES      |                | Soft-Delete (v1.16)                |

### 4.5 `projects`

| Spalte              | Typ          | Default      | Notes                              |
|---------------------|--------------|--------------|------------------------------------|
| id                  | uuid         | gen_random_uuid() | PK                            |
| name                | text (NOT NULL) |           | Paketname                          |
| status              | text (NOT NULL) | 'Angebot' | **Kein CHECK** (v1.9.6), validiert über lookup_values |
| company_id          | uuid         |              | NULL = internes Projekt            |
| hauptkontakt_id     | uuid         |              | FK → contacts                      |
| verantwortlicher_id | uuid         |              | FK → user_profiles                 |
| startdatum          | date         |              |                                    |
| enddatum            | date         |              |                                    |
| geschaetzter_umsatz | numeric      | 0            | **Paketpreis (Kundenrechnung)**    |
| beschreibung        | text         |              |                                    |
| notizen             | text         |              |                                    |
| erstellt_von        | uuid         |              |                                    |
| created_at          | timestamptz  | now()        |                                    |
| deleted_at          | timestamptz  |              | Soft-Delete (v1.16)                |

**Projekt-Status-Werte** (Lookup `projekt_status`): Lead, Angebot, In Arbeit, Abschlussphase, Abgeschlossen, Verloren. Drei aktive Status werden automatisch gewechselt (siehe 8.5).

### 4.6 `deployments` (Einsätze)

| Spalte            | Typ          | Nullable | Default   | Notes                              |
|-------------------|--------------|----------|-----------|------------------------------------|
| id                | uuid         | NO       | gen_random_uuid() | PK                         |
| titel             | text         | NO       |           | Auto-Titel möglich (v1.10.0)       |
| datum_von         | date         | YES      |           | NULLable seit v1.9.3               |
| datum_bis         | date         | YES      |           | NULLable seit v1.9.3               |
| uhrzeit_von       | time         | YES      |           |                                    |
| uhrzeit_bis       | time         | YES      |           |                                    |
| status            | text         | NO       | 'Geplant' | Kein CHECK, validiert über Lookup  |
| company_id        | uuid         | YES      |           | FK → companies (pflicht im UI)     |
| project_id        | uuid         | YES      |           | FK → projects                      |
| service_id        | uuid         | YES      |           | FK → services                      |
| menge             | numeric      | YES      | 1         |                                    |
| einzelpreis       | numeric      | YES      | 0         | bei Projekt-Einsatz: interner Aufwand |
| ort               | text         | YES      |           |                                    |
| externe_techniker | text         | YES      |           | Freitext für Nicht-User            |
| beschreibung      | text         | YES      |           | Auto-Beschreibung möglich (v1.10.0)|
| notizen           | text         | YES      |           |                                    |
| erstellt_von      | uuid         | YES      |           |                                    |
| created_at        | timestamptz  | YES      | now()     |                                    |
| deleted_at        | timestamptz  | YES      |           | Soft-Delete (v1.16)                |

**Constraints:** `deployments_datum_consistency`: Entweder beide Datumsfelder NULL oder beide gesetzt mit `datum_bis >= datum_von`

### 4.7 `deployment_technicians` (Junction)

| Spalte        | Typ  | Notes                                                 |
|---------------|------|-------------------------------------------------------|
| id            | uuid | PK                                                    |
| deployment_id | uuid | FK → deployments (ON DELETE CASCADE)                  |
| user_id       | uuid | FK → user_profiles (ON DELETE CASCADE)                |

**Constraint:** UNIQUE (deployment_id, user_id)

### 4.8 `services`

| Spalte                 | Typ          | Default | Notes                              |
|------------------------|--------------|---------|------------------------------------|
| id                     | uuid         | gen_random_uuid() | PK                       |
| name                   | text (NOT NULL) |      |                                    |
| kategorie_id           | uuid         |         | FK → lookup_values (leistungs_kategorie) |
| einheit                | text (NOT NULL) |      | CHECK: Tag, Stunde, Pauschale, Stück |
| standardpreis          | numeric      | 0       |                                    |
| standard_uhrzeit_von   | time         |         | v1.10.0: Default-Startzeit         |
| standard_uhrzeit_bis   | time         |         | v1.10.0: Default-Endzeit           |
| beschreibung           | text         |         |                                    |
| ist_aktiv              | boolean      | true    |                                    |
| created_at             | timestamptz  | now()   |                                    |

Default-Uhrzeiten werden im Einsatz-Modal automatisch übernommen, wenn die Uhrzeit-Felder dort leer sind.

### 4.9 `lookup_values`

| Spalte      | Typ         | Notes                              |
|-------------|-------------|------------------------------------|
| id          | uuid        | PK                                 |
| kategorie   | text        | z.B. 'termin_typ', 'projekt_status'|
| wert        | text        | Anzeigename                        |
| farbe       | text        | Hex-Farbe für Badges               |
| reihenfolge | integer     | Sortierung im Dropdown             |
| ist_aktiv   | boolean     | Archiviert vs. aktiv               |

**Kategorien** (admin-verwaltbar, 6 aktuell): unternehmens_typ · termin_typ · termin_status · projekt_status · einsatz_status · leistungs_kategorie

**UI-Darstellung (v1.18):** raw Keys werden in der UI über `kategorieLabel(key)` gerendert — `KATEGORIE_LABELS`-Mapping oben in app.js mit Title-Case-Fallback für unbekannte Keys. Wird z.B. auf `/#/stammdaten` im Filter-Dropdown und im Lookup-Modal eingesetzt.

**Design-Entscheidung (v1.9.6):** Status-Werte für Projekte/Einsätze sind ausschließlich durch `lookup_values` definiert — keine hardcoded DB-CHECK-Constraints. Admin kann jederzeit neue Werte in den Stammdaten hinzufügen, die sofort im System verfügbar sind.

**Caveat:** Status-Werte mit Business-Logik-Bedeutung (z.B. `Abschlussphase`, `Abgeschlossen`, `Durchgeführt`, `Abgerechnet`) dürfen nicht umbenannt werden — die Auto-Status-Logik referenziert sie fest. Deaktivieren via `ist_aktiv = false` ist OK.

### 4.10 `user_profiles` + `roles`

`user_profiles` (1:1 zu `auth.users`): id, name, email, role_id, status (CHECK: eingeladen/aktiv/inaktiv), muss_passwort_aendern.

`roles`: id, name, rechte (JSONB), ist_aktiv. Aktuelle Rollen: Admin, Vertrieb, Techniker.

### 4.11 `membership_programs` (v1.12.0)

Admin-definierter Katalog von Mitgliedschafts-Paketen.

| Spalte                    | Typ          | Nullable | Default | Notes                              |
|---------------------------|--------------|----------|---------|------------------------------------|
| id                        | uuid         | NO       | gen_random_uuid() | PK                      |
| name                      | text         | NO       |         | z.B. "TNC-Club Premium"            |
| beschreibung              | text         | YES      |         |                                    |
| laufzeit_monate           | integer      | NO       | 12      | Default-Laufzeit                   |
| standard_preis            | numeric      | YES      | 0       | Richtpreis (überschreibbar)        |
| mitgliedsnummer_praefix   | text         | YES      |         | z.B. "TNC" → "TNC-2026-0042"       |
| ist_aktiv                 | boolean      | YES      | true    |                                    |
| erstellt_von              | uuid         | YES      |         | FK → user_profiles                 |
| created_at                | timestamptz  | YES      | now()   |                                    |

### 4.12 `membership_program_benefits` (v1.12.0)

Welche Bonis gehören zu einem Programm.

| Spalte              | Typ          | Nullable | Default | Notes                              |
|---------------------|--------------|----------|---------|------------------------------------|
| id                  | uuid         | NO       | gen_random_uuid() | PK                      |
| program_id          | uuid         | NO       |         | FK → membership_programs (CASCADE) |
| service_id          | uuid         | YES      |         | FK → services (optional)           |
| titel               | text         | NO       |         | Freitext für Bonis ohne Service    |
| beschreibung        | text         | YES      |         |                                    |
| menge_pro_laufzeit  | numeric      | NO       | 1       | z.B. 1 Besuch, 4 LifeCalls         |
| reihenfolge         | integer      | YES      | 0       |                                    |
| created_at          | timestamptz  | YES      | now()   |                                    |

### 4.13 `memberships` (v1.13.0)

Konkrete Mitgliedschaft einer Firma.

| Spalte              | Typ          | Nullable | Default | Notes                              |
|---------------------|--------------|----------|---------|------------------------------------|
| id                  | uuid         | NO       | gen_random_uuid() | PK                      |
| company_id          | uuid         | NO       |         | FK → companies (CASCADE)           |
| program_id          | uuid         | NO       |         | FK → membership_programs (RESTRICT) |
| mitgliedsnummer     | text         | YES      |         | z.B. "TNC-2026-0042"               |
| status              | text         | NO       | 'aktiv' | aktiv / pausiert / beendet         |
| start_datum         | date         | NO       |         |                                    |
| end_datum           | date         | NO       |         | auto: start + laufzeit_monate      |
| preis               | numeric      | YES      | 0       | tatsächlicher Preis dieser Mitgliedschaft |
| hauptkontakt_id     | uuid         | YES      |         | FK → contacts (ON DELETE SET NULL) |
| verantwortlicher_id | uuid         | YES      |         | FK → user_profiles                 |
| notizen             | text         | YES      |         |                                    |
| erstellt_von        | uuid         | YES      |         |                                    |
| created_at          | timestamptz  | YES      | now()   |                                    |
| deleted_at          | timestamptz  | YES      |         | Soft-Delete (v1.16)                |

**Indizes:** company_id, program_id, status, end_datum (für Ablauf-Warnings)

### 4.14 `entitlements` (v1.13.0)

Kontingent-Einträge — konkrete Bonis die eine Firma hat.

| Spalte        | Typ          | Nullable | Default | Notes                              |
|---------------|--------------|----------|---------|------------------------------------|
| id            | uuid         | NO       | gen_random_uuid() | PK                      |
| company_id    | uuid         | NO       |         | FK → companies (CASCADE)           |
| source_type   | text         | NO       |         | CHECK: membership / project / manual |
| membership_id | uuid         | YES      |         | FK → memberships (CASCADE, wenn source=membership) |
| project_id    | uuid         | YES      |         | FK → projects (CASCADE, wenn source=project) |
| service_id    | uuid         | YES      |         | FK → services                      |
| titel         | text         | NO       |         | z.B. "Technikerbesuch (Premium-Bonus)" |
| gesamt_menge  | numeric      | NO       | 1       | 8 für LifeCalls, 1 für Bonus       |
| verfall_datum | date         | YES      |         | Ablaufdatum (bei Mitgliedschaft = end_datum) |
| notizen       | text         | YES      |         |                                    |
| reihenfolge   | integer      | YES      | 0       |                                    |
| created_at    | timestamptz  | YES      | now()   |                                    |

**Berechnete Werte (Frontend-seitig aus Redemptions):**
- `eingeloest` = `SUM(entitlement_redemptions.menge_eingeloest)`
- `offen` = `gesamt_menge - eingeloest`
- `status` = offen > 0 ? "offen" : "vollständig"

### 4.15 `entitlement_redemptions` (v1.14.0)

Jede Einlösung eines Bonus wird hier protokolliert.

| Spalte           | Typ          | Nullable | Default          | Notes                              |
|------------------|--------------|----------|------------------|------------------------------------|
| id               | uuid         | NO       | gen_random_uuid()| PK                                 |
| entitlement_id   | uuid         | NO       |                  | FK → entitlements (CASCADE)        |
| deployment_id    | uuid         | YES      |                  | FK → deployments (SET NULL)        |
| menge_eingeloest | numeric      | NO       | 1                | z.B. 1 LifeCall = 1, Doppel-Session = 2 |
| einloesung_datum | date         | NO       | CURRENT_DATE     |                                    |
| notizen          | text         | YES      |                  |                                    |
| erstellt_von     | uuid         | YES      |                  |                                    |
| created_at       | timestamptz  | YES      | now()            |                                    |

**Design:** Normalerweise hat jede Redemption eine `deployment_id`. Bei manuellen Einlösungen (ohne Einsatz) ist sie NULL — aktuell nicht im UI, aber vorbereitet.

---

## 5. Row Level Security (RLS)

**Hybrid-Strategie ("Option C"):** Strikt auf `user_profiles`, `roles`, `lookup_values` (Admin-Write). Open authenticated auf allen operativen Tabellen (inkl. aller Mitgliedschafts-Tabellen).

### 5.1 Auth-Härtung (v1.15.0)

Zusätzliche serverseitige Schichten:

- **`is_active_user()`** (SECURITY DEFINER): `true`, wenn `auth.uid()` in `user_profiles` mit `status='aktiv'` existiert.
- **Restrictive Policy `only_active_users`** auf allen 15 operativen Tabellen (companies, contacts, appointments, projects, deployments, deployment_technicians, services, lookup_values, memberships, membership_programs, membership_program_benefits, entitlements, entitlement_redemptions, notes, appointment_participants). Ausgenommen: `user_profiles` (inaktiver User muss eigenes Profil lesen können für Client-Screen), `roles` (für Profil-Join).
- **Trigger `trg_user_profiles_update_guard`** (BEFORE UPDATE auf `user_profiles`):
  - (a) Last-Admin-Schutz — gilt IMMER (auch für service_role). Blockt Downgrade oder Inaktivierung des letzten aktiven Admins.
  - (b) `role_id` ist für `authenticated` schreibgeschützt (nur Edge Function / service_role darf).
  - (c) Auto-Aktivierung: `eingeladen → aktiv` beim ersten Passwortwechsel (OLD.muss_passwort_aendern true → false, OLD.status='eingeladen'). Sonstige Status-Änderungen durch `authenticated` werden stumm zurückgerollt.
- **Trigger `trg_prevent_last_admin_delete`** (BEFORE DELETE auf `user_profiles`): fängt Delete (inkl. ON DELETE CASCADE aus `auth.users`) des letzten Admins ab.

Damit sind Roadmap §13.1 Items 1–4 durch DB-Triggers + Restrictive Policies gedeckt — app.js und Edge Function brauchen keine Änderung, die bestehenden Last-Admin-Checks in der Edge Function werden zur ersten Verteidigungslinie (nettere Fehlermeldungen).

---

## 6. Edge Function `manage-users`

**URL:** `https://loohjeiysjxzbmfwkyvv.supabase.co/functions/v1/manage-users`
**Runtime:** Deno, JWT ES256
**Actions:** invite / update / delete / reset_password
**Wichtig:** „Verify JWT with legacy secret" ist deaktiviert.

---

## 7. Frontend-Architektur

### 7.1 SPA-Modell

Kein SSR, keine Builds. `index.html` enthält alle Pages als `<div class="page">` — nur die aktive ist via `.active`-Klasse sichtbar.

### 7.2 Router

Hash-basiert. Hashes: `#/firmen`, `#/firma/UUID`, `#/kontakte`, `#/kontakt/UUID`, `#/termine`, `#/projekte`, `#/projekt/UUID`, `#/einsaetze`, `#/benutzer`, `#/leistungen`, `#/stammdaten`, `#/programme` (v1.12).

Keine Detail-Route für Einsätze oder Mitgliedschaften — CRUD läuft via Modal.

### 7.3 Navigation

- **Desktop-Sidebar:** Firmen / Kontakte / Termine / Projekte / Einsätze + Einstellungen (admin-only: Benutzer, Leistungen, Stammdaten, Mitgliedschafts-Programme)
- **Mobile-Bottom-Nav:** Firmen / Termine / Einsätze / Mehr
- **Mehr-Menü:** Kontakte, Projekte + admin-Tools

### 7.4 State Management

Flat global variables in `app.js`. Kein Framework. Wichtige Variablen: `currentUser`, `currentProfile`, Detail-IDs, Prefill-Variablen, Editing-IDs, diverse Caches (lazy-loaded).

**Neu in v1.13/v1.14:** `programsCache`, `editingMembershipId`, `currentMembershipCompanyId`, temporäre `window._pendingRedemption*` für Edit-Mode.

### 7.5 Caching-Strategie

Caches werden lazy gefüllt, manuell invalidiert nach Writes.

**Wichtige Invalidationen:**
- `servicesCache`: beim Speichern einer Leistung (v1.10)
- `programsCache`: beim Speichern eines Programms (v1.12)
- `companyContactsMap`: beim Speichern eines Kontakts

### 7.6 Modal-Konventionen

| Modal                 | ID                 | Prefix  |
|-----------------------|--------------------|---------|
| Firma                 | modal-company      | c-*     |
| Kontakt               | modal-contact      | k-*     |
| Termin                | modal-appointment  | t-*     |
| Projekt               | modal-project      | p-*     |
| Einsatz               | modal-deployment   | d-*     |
| Benutzer              | modal-user         | u-*     |
| Leistung              | modal-service      | s-*     |
| Lookup                | modal-lookup       | l-*     |
| Mitgliedschafts-Programm | modal-program   | pr-*    |
| Mitgliedschaft        | modal-membership   | ms-*    |

### 7.7 Collapsible Modal-Gruppen (v1.9.1)

Klick auf `<div class="modal-group-title">` togglet alle nachfolgenden Geschwister. Event-Delegation, wirkt in allen Modals automatisch.

### 7.8 DOM-Update statt Page-Reload (v1.9.8)

Für Quick-Toggle-Checkboxen werden nur betroffene DOM-Elemente aktualisiert (Badge, Count-Label, Header-Status). Vermeidet Flicker.

### 7.9 Icon-Action-Buttons (v1.11.0, neu strukturiert v1.20.0)

Alle 5 Hauptlisten (Firmen, Kontakte, Termine, Projekte, Einsätze) haben in der rechten Spalte **zwei Icons**: Bearbeiten (primär) + Kebab ⋮ (sekundär).

- **Default-Zustand:** Icons sind `opacity:0 · pointer-events:none`.
- **Hover-Reveal:** `tbody tr:hover .action-icons` schaltet beides sichtbar und klickbar.
- **Touch-Fallback:** `@media (hover: none)` zeigt die Icons dauerhaft (weil Touch keinen Hover-State hat).
- **Kebab-Menu:** single shared `<div id="kebab-menu">` mit drei Items (Kopieren / Duplizieren / Löschen). Positioniert via `getBoundingClientRect()`. Schließt bei Klick-außerhalb, `Esc`, Scroll, Resize.
- **Zentral gerendert via `renderActionIcons(entityType, id)`**; Dispatcher: `deleteEntityById()`, `duplicateEntity()`, `copyXById()`.
- **Mobile:** Icon-Spalte via `.col-action { display: none; @media (max-width: 767px) }` weiterhin ausgeblendet (wie vorher) — Primär-Aktion über Titel-Link.

### 7.10 Globale Suche (v1.19.0)

- **Shortcut:** `Cmd+K` (Mac) / `Ctrl+K` (sonst), alternativ `/` wenn kein Eingabefeld fokussiert ist. Overlay schließen per `Esc` oder Backdrop-Klick.
- **Discovery-Buttons:** in der Sidebar und im Mobile-Header (🔍-Icon).
- **Queries:** debounced 200 ms, dann 4 parallele `.or(ilike %q%)`-Queries gegen `companies`, `contacts`, `projects`, `deployments` — jeweils auf die wichtigsten Textspalten. `AbortController` verwirft alte Queries bei neuem Tastendruck. Minimum 2 Zeichen, Limit 5 pro Tabelle.
- **Ergebnis-Navigation:** `↑` / `↓` schalten `search-item.active`, `↵` öffnet den Treffer. Firma/Kontakt/Projekt routen direkt auf die Detail-Seite; Einsatz öffnet das Einsatz-Modal (kein eigener Detail-Route).
- **„Zuletzt besucht":** Liste der letzten 5 Detail-Besuche aus `localStorage.cumart_recent_visits` als Empty-State (wird beim Öffnen des Overlays ohne Eingabe angezeigt). Wird in `loadCompany/Contact/ProjectDetail` über `trackVisit(type, id, title, subtitle)` gefüllt und beim Öffnen eines Suchtreffers aktualisiert.
- **Keine Volltextsuche:** wir nutzen `ilike`, keine `tsvector`/`pg_trgm`. Kann bei >1000 Datensätzen pro Tabelle zum Performance-Upgrade werden.

### 7.11 Custom Confirm-Dialog + Undo-Toast (v1.20.0)

- **`confirmDialog({ title, message, confirmLabel, cancelLabel, danger })`** liefert `Promise<boolean>`. Default-Fokus liegt auf „Abbrechen" (Enter schließt mit cancel, Tab→Löschen zum Bestätigen). HTML-Markup im `message`-Feld erlaubt — das Confirm-Modal nutzt `innerHTML`.
- Alle 11 `delete*`-Handler (List-Dispatcher + 10 modal-delete) benutzen diese Funktion statt `confirm()`.
- **`showToast(msg, isError, options)`**: `options = { actionLabel, onAction, durationMs }`. Mit Action wird ein zweiter Inline-Button gerendert, der bei Klick den Callback feuert. Default-Dauer mit Action ist 5 s (ohne 3 s).
- **Undo-Toast-Flow:** nach jedem erfolgreichen Soft-Delete wird ein Toast mit „Rückgängig"-Button gezeigt. Bei Klick wird `deleted_at` wieder auf `NULL` gesetzt und die Liste refresht. Verfügbar für: companies / contacts / appointments / projects / deployments / memberships. Für Einsätze wird zusätzlich vermerkt, dass Bonus-Einlösungen hart gelöscht wurden und nicht revertet werden.
- **`_performSoftDelete(entityType, id)`** ist der zentrale Helper (ohne Confirm) — beide Pfade (List-Kebab + Modal-Delete) rufen ihn, nachdem ihr jeweiliges Confirm durch ist. Das vermeidet doppelte Confirm-Dialoge bei geschachtelten Modalen.

### 7.12 FAB Quick-Add (v1.21.0)

- **Schwebender `+`-Button** unten rechts, sichtbar sobald `showApp()` läuft (nach Login). Desktop: 24 px Abstand; Mobile: über der Bottom-Nav.
- **Popover-Menü** mit 5 Aktionen (Neue Firma / Kontakt / Termin / Einsatz / Projekt). Jede öffnet das bestehende Modal via `openXxxModal('new')`.
- **Kontext-Awareness via `_getFabContext()`**: liest aktiven `.page` + `current*DetailId`-Var und setzt entsprechende Prefill-Globals vor dem Modal-Open:
  - Firmen-Detail aktiv → `company_id` landet in `contactModalPrefillCompanyId` / `appointmentModalPrefillCompanyId` / `projectModalPrefillCompanyId` / `deploymentModalPrefillCompanyId`
  - Projekt-Detail aktiv → `project_id` in `appointmentModalPrefillProjectId` / `deploymentModalPrefillProjectId`
  - Kontakt-Detail aktiv → `contact_id` in `appointmentModalPrefillContactId` (für Termin) bzw. `projectModalPrefillHauptkontaktId` (für Projekt — das Modal zieht `company_id` über den Kontakt automatisch nach)
- Der Menü-Titel zeigt den aktiven Kontext an („Schnell anlegen · für diese Firma").
- **Shortcut `n`** (ohne Modifier, wenn kein `INPUT`/`TEXTAREA`/`contenteditable` fokussiert und kein anderes Overlay offen) toggelt das FAB-Menü.
- **Click-outside / Esc** schließen das Menü.

---

## 8. Cross-Entity-Logik

### 8.1 Prefill-Kaskaden

| Start             | Action          | Prefill                                 |
|-------------------|-----------------|-----------------------------------------|
| Firma-Detail      | + Kontakt       | Firma                                   |
| Firma-Detail      | + Termin        | Firma + Kontakt-Dropdown gefiltert      |
| Firma-Detail      | + Projekt       | Firma                                   |
| Firma-Detail      | + Einsatz       | Firma                                   |
| Firma-Detail      | + Mitgliedschaft| Firma (via `currentMembershipCompanyId`) |
| Kontakt-Detail    | + Termin        | Firma + Kontakt                         |
| Kontakt-Detail    | + Projekt       | Firma + Hauptkontakt                    |
| Projekt-Detail    | + Termin        | Firma + Projekt                         |
| Projekt-Detail    | + Einsatz       | Firma + Projekt                         |

### 8.2 Auto-Fill im Einsatz-Modal (v1.10.0)

- **Leistung wählen** → Einzelpreis + Uhrzeiten aus Service-Defaults (nur wenn leer)
- **Firma wählen** → Ort aus Firmenadresse (nur wenn leer)
- **Leere Titel/Beschreibung beim Speichern** → Auto-Generierung:
  - Titel: `{Leistung} × {Firma} × {Benutzer}`
  - Beschreibung: mehrzeilige Zusammenfassung ohne Preise

### 8.3 Duplizieren (v1.11.0)

Icon-Button „Duplizieren" kopiert eine Entität mit Suffix „(Kopie)":

| Entität  | Verhalten                                                     |
|----------|---------------------------------------------------------------|
| Firma    | Name „X (Kopie)", ohne Kontakte/Termine/Projekte              |
| Kontakt  | Nachname „Y (Kopie)", gleiche Firma                           |
| Termin   | Titel „(Kopie)", Datum übernommen, Status „geplant", keine Deployment-Kopplung |
| Projekt  | Name „(Kopie)", Status „Angebot" zurück, ohne Einsätze/Termine |
| Einsatz  | Titel „(Kopie)", Status „Geplant", keine Techniker, keine Termin-Kopplung |

### 8.4 Termin-Einsatz-Kopplung (v1.9.4 — Lösch-Semantik)

`appointments.deployment_id` koppelt Termin an Einsatz. Bei Checkbox „Auch als Termin eintragen":

| Aktion                                  | Ergebnis                       |
|-----------------------------------------|--------------------------------|
| Checkbox an + kein Termin               | Termin wird angelegt           |
| Checkbox an + Termin existiert          | Termin wird aktualisiert       |
| Checkbox aus + Termin existiert         | Termin wird **gelöscht**       |
| Datum wird entfernt + Termin existiert  | Termin wird **gelöscht**       |
| Einsatz wird gelöscht                   | Gekoppelter Termin auch weg    |

### 8.5 Auto-Projekt-Status (v1.9.5)

Nach CRUD auf Einsätzen/Terminen eines Projekts:

| Einsätze done | Termine done     | Neuer Status     |
|---------------|------------------|------------------|
| ja            | ja               | `Abgeschlossen`  |
| ja            | nein (oder leer) | `Abschlussphase` |
| nein          | egal             | `In Arbeit`      |

**Funktionsvarianten:**
- `checkAndUpdateProjectStatus()` — Full Page-Reload nach Modal-CRUD
- `checkAndUpdateProjectStatusSmart()` — direktes DOM-Update nach Checkbox-Toggle

### 8.6 Leistungsumsatz-Tracking (v1.9.5)

Projekt-Header zeigt zwei Umsatz-Werte: `Geschätzter Umsatz` (Paketpreis = Kundenrechnung) und `Leistungsumsatz` (Summe aller Einsatz-Werte).

### 8.7 Einsätze ohne Datum (v1.9.3)

Für Vorausplanung in Paket-Projekten. Regeln: beide Datumsfelder nullable, Constraint `deployments_datum_consistency`, Uhrzeit/Termin-Kopplung ohne Datum nicht möglich. Anzeige: graues „Ungeplant"-Badge.

### 8.8 Quick-Toggle-Checkboxen (v1.9.5 + v1.9.7)

Projekt-Detail: Einsatz- und Termin-Tabelle haben Checkbox-Spalte links. Toggle wechselt Status (`Geplant ↔ Durchgeführt` / `geplant ↔ durchgefuehrt`). Löst Auto-Status-Logik aus (8.5).

### 8.9 Mitgliedschafts-Lifecycle (v1.12 → v1.14)

End-to-End-Workflow in drei Stufen:

**Stufe 1: Programm-Definition (v1.12.0, Admin):**
1. Programm anlegen (Name, Laufzeit, Preis, Präfix, Beschreibung)
2. Benefits hinzufügen (Titel, optional Service, Menge pro Laufzeit)
3. Bestehende Programme editierbar — **Benefits-Replacement strategy**: beim Speichern werden alle alten Benefits gelöscht und die aktuellen neu angelegt. Bereits bestehende Entitlements von laufenden Mitgliedschaften bleiben unberührt.

**Stufe 2: Mitgliedschaft für Firma (v1.13.0):**
1. Firma-Detail → „+ Mitgliedschaft anlegen"
2. Programm wählen → End-Datum auto-berechnet, Preis-Vorschlag, Mitgliedsnummer-Vorschlag
3. Hauptkontakt + Verantwortlicher setzen
4. Speichern → Entitlements werden automatisch aus Programm-Benefits erzeugt (1:1)
5. Mitgliedschafts-Karte zeigt Fortschritt mit Progress-Bars + Ablauf-Hinweis

**Stufe 3: Einlösung über Einsatz (v1.14.0):**
1. Neuer Einsatz bei der Firma → Einlöse-Sektion im Modal erscheint falls offene Bonis da
2. Checkbox „Als Bonus-Einlösung verbuchen" aktivieren
3. Dropdown zeigt offene Entitlements der Firma (inkl. Quelle: Mitgliedschaft/Projekt)
4. Menge eingeben (bei Einzel-Bonis auto auf 1, bei Kontingent 1..offen)
5. Speichern → Redemption wird angelegt/aktualisiert

**Einlöse-Regeln (v1.14.0):**
- Checkbox aus + bestehende Redemption → Redemption wird gelöscht
- Entitlement-Wechsel beim Edit → alte Redemption gelöscht, neue angelegt
- Einsatz gelöscht → zugehörige Redemption mit gelöscht
- Bei Edit-Mode: die eigene bestehende Redemption wird bei der Rest-Mengen-Berechnung nicht abgezogen (sonst könnte man nie die eigene Menge erhöhen)

### 8.10 Kontext-sensitiver Refresh nach CRUD

`save<X>` und `delete<X>` prüfen, welche Detail-Page aktiv ist, und refreshen nur die relevante Sektion. Memberships-Sektion wird automatisch mit aktualisiert, wenn ein Einsatz einer Firma gespeichert/gelöscht wird (damit Fortschritt live sichtbar ist).

---

## 9. Input-Validierung

| Feld-Typ  | HTML-Attribute                                    | JS-Sanitizer                |
|-----------|---------------------------------------------------|-----------------------------|
| Telefon   | `type="tel"`, `inputmode="tel"`                   | `sanitizePhoneInput()`      |
| PLZ       | `inputmode="numeric"`, `maxlength="10"`           | `sanitizeNumericInput()`    |
| E-Mail    | `type="email"` + no-autocapitalize etc.           | `sanitizeEmailOnBlur()`     |
| Preis     | `type="number"`, `min="0"`, `step="0.01"`         | Native + NaN-Check          |
| Einlöse-Menge | `type="number"`, `min="0.01"`, dynamisches `max` | Native + Rest-Check    |

**Status-Validierung (v1.9.6):** Dynamisch gegen Lookup-Cache statt hardcoded Whitelist.

---

## 10. Mobile-Optimierung

- Breakpoints: <768px Mobile, 768px+ Tablet, 1024px+ Desktop
- `.col-action` auf Mobile ausgeblendet — Primär-Aktion über Titel-Link
- Tabellen mit `table-layout: fixed` → kein horizontales Scrollen
- `fontSize: 16px` auf inputs → verhindert iOS-Zoom
- Sync-Clipboard-Fallback für iOS
- Benefit-Progress-Rows: responsive stacked auf Mobile

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
- FK-Fehler in `deleteX()` abgefangen (ab v1.16 selten — Soft-Delete umgeht FK-Violations)
- Toasts 3s Anzeige
- Admin-Only UI via `data-admin-only="true"` + `applyAdminOnlyUI()`

### 11.3 Soft-Delete-Regel (v1.16+)

Für die sechs Kern-Entitäten (companies, contacts, appointments, projects, deployments, memberships) gilt:

- **Löschen setzt `deleted_at = now()`** — kein hartes `DELETE`. Alle `delete*()`-Handler und der generische `deleteEntityById`-Dispatcher verwenden `update({ deleted_at: ... })`.
- **Jede Read-Query muss `.is('deleted_at', null)` setzen** — List-Views, Detail-Fetches, Edit-Prefills, Dropdowns, Duplicate-Quellen. Folge: gelöschte Zeilen sind über die UI unsichtbar aber in der DB rekonstruierbar.
- **Einsatz-Kaskade:** Beim Soft-Delete eines Einsatzes wird die gekoppelte Termin-Zeile (`appointments.deployment_id`) ebenfalls soft-gelöscht — hält die bisherige Kopplungs-Semantik aus §8.4 aufrecht.
- **Kind-Entitäten werden NICHT kaskadiert** — soft-gelöschte Firma behält ihre Kontakte/Projekte/Einsätze in der DB; sie sind durch die Filter nur nicht mehr erreichbar (bewusste Entscheidung für v1.16, kann später kaskadiert werden).
- **Neue Soft-Delete-Tabelle einführen?** Dann: (a) `deleted_at` + Partial-Index per Migration, (b) Handler auf Soft-Delete umstellen, (c) alle Read-Queries mit `.is('deleted_at', null)` versehen — z. B. über `migrations/_inject_soft_delete_filter.py`.

### 11.4 Farbsystem

CSS-Variablen in `:root`. Status-Farben aus `lookup_values.farbe`. Progress-Bars mit 3 States (grün/orange/rot je nach Restlaufzeit).

---

## 12. Version-Historie

| Version | Datum       | Highlights                                                         |
|---------|-------------|--------------------------------------------------------------------|
| v1.0.0 – v1.5.0 | Apr 2026 | CRM-Grundstruktur, Auth, Firmen, RLS-Hardening         |
| v1.6.x – v1.8.0 | Apr 2026 | Phase 3a-b: Termine, Projekte, Kontakt-Detail          |
| v1.9.0  | Apr 2026    | Phase 3c: Einsätze mit Termin-Kopplung                             |
| v1.9.1 – v1.9.8 | Apr 2026 | Iterative Verbesserungen: Collapsible Modals, Auto-Status, Smart-Reload, Dynamische Status-Validierung |
| v1.10.0 | Apr 2026    | Auto-Fill im Einsatz-Modal (Titel/Uhrzeit/Ort/Beschreibung)        |
| v1.10.1 | Apr 2026    | Custom Domain cumart.cloud live                                    |
| v1.11.0 | Apr 2026    | Icon-Action-Buttons in allen Hauptlisten + Duplizieren             |
| v1.12.0 | Apr 2026    | **Mitgliedschafts-Programme** (Admin-Katalog + Benefits)           |
| v1.13.0 | Apr 2026    | **Mitgliedschaften auf Firma-Ebene** + automatische Entitlements   |
| v1.14.0 | 21.04.2026  | Einlöse-Integration im Einsatz-Modal → End-to-End-Workflow geschlossen |
| v1.15.0 | 22.04.2026  | Auth-Härtung (Last-Admin-Schutz, Role-Lock, Inaktiv-Blocker per RLS, Auto-Aktivierung per Trigger) |
| v1.16.0 | 22.04.2026  | Soft-Delete auf companies/contacts/appointments/projects/deployments/memberships — Roadmap §13.1 vollständig abgeschlossen |
| v1.17.0 | 22.04.2026  | UX-Bugfixes (B1–B4): 404-Seite für unbekannte Hashes, `friendlyFetchError()` gegen PGRST116-Leak, Detail-Seiten-Fehler unterdrücken Sub-Sektions-Spinner, Leistungs-Kategorie ohne Wert rendert als dezentes „—" statt Badge |
| v1.18.0 | 22.04.2026  | Stammdaten-Labels: `KATEGORIE_LABELS`-Mapping + `kategorieLabel()`-Helper — UI zeigt „Einsatz-Status" statt `einsatz_status`. Unbekannte Keys werden automatisch Title-Cased (Fallback). |
| v1.19.0 | 22.04.2026  | Globale Suche (Cmd+K) — Overlay mit debounced Parallel-Queries gegen Firmen / Kontakte / Projekte / Einsätze, Pfeil-Navigation, Enter öffnet, „Zuletzt besucht" via localStorage |
| v1.20.0 | 22.04.2026  | Zeilen-Aktionen aufgeräumt — Hover-Reveal-Icons, Kebab-Menü für Secondary Actions (Kopieren / Duplizieren / Löschen), Custom `confirmDialog()` (Promise-basiert) statt native `confirm()`, Undo-Toast (5 s) für Soft-Delete-Rückgängig |
| **v1.21.0** | **22.04.2026** | **FAB Quick-Add** — schwebender `+`-Button unten rechts mit Popover-Menü (Neue Firma / Kontakt / Termin / Einsatz / Projekt). Kontext-Aware Prefill aus Firmen-/Projekt-/Kontakt-Detail. Shortcut `n` wenn kein Input fokussiert. |

---

## 13. Roadmap & offene Punkte

### 13.1 Hoch — Security

| Punkt                        | Status       | Beschreibung                                           |
|------------------------------|--------------|--------------------------------------------------------|
| Last-Admin-Schutz            | ✅ v1.15.0   | Edge Function + DB-Trigger blockiert Lösch/Downgrade/Inaktivierung des letzten aktiven Admins |
| Role-Self-Escalation         | ✅ v1.15.0   | Trigger blockiert `role_id`-Änderung durch authenticated — nur Edge Function (service_role) darf |
| Login-Blocker inaktiv        | ✅ v1.15.0   | Restrictive RLS-Policy `only_active_users` auf allen operativen Tabellen + Client-Check |
| Auto eingeladen → aktiv      | ✅ v1.15.0   | BEFORE-UPDATE-Trigger flippt Status beim ersten `muss_passwort_aendern` true→false |
| Soft-Delete                  | ✅ v1.16.0   | `deleted_at` auf 6 Kern-Entitäten, alle `delete*`-Handler auf UPDATE umgestellt, alle Read-Queries filtern `deleted_at IS NULL` |

### 13.2 Mittel — Fachlich

| Punkt                         | Beschreibung                                           |
|-------------------------------|--------------------------------------------------------|
| Dashboard (v1.15 vorgesehen)  | Verfallende Bonis, Umsatz geplant vs. real, KPIs       |
| Projekt-Kontingente           | Projekt mit „enthält 8 LifeCalls" → Auto-Entitlements  |
| Dublettenerkennung            | Bei Firmen- und Kontakt-Anlage                         |
| Export                        | CSV/Excel für alle Entitäten                           |
| Multi-Leistungen pro Einsatz  | Sub-Positionen statt 1:1 service_id                    |
| Kalender-View                 | Monat/Woche-Ansicht für Termine                        |
| Manuelle Bonus-Einlösung      | Redemption ohne Einsatz (für Sonderfälle)              |
| Verfalls-Notifications        | Mail-Erinnerung N Tage vor Ablauf                      |

### 13.3 Niedrig — Komfort

| Punkt                      | Beschreibung                                           |
|----------------------------|--------------------------------------------------------|
| Notes-Entity aktivieren    | Separate Tabelle statt Freitext-Felder                 |
| Audit-Log                  | Wer hat wann was geändert                              |
| Globale Suche              | Cmd+K über alle Entitäten                              |
| Storage                    | File-Uploads an Projekten/Einsätzen                    |
| Email-Integration          | Termineinladungen, Zusagen tracken                     |

### 13.4 Aktuell ungenutzte Schema-Elemente

- `notes` Tabelle
- `appointment_participants` Tabelle
- `roles.rechte` (JSONB-Feld, noch kein granular rights system)
- `entitlements.source_type = 'manual'` (vorbereitet, noch kein UI)
- `entitlement_redemptions.deployment_id = NULL` (manuelle Einlösungen vorbereitet)

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
SUPABASE_ANON_KEY = 'eyJhbGci...'  // legacy anon key, bewusst öffentlich
FUNCTIONS_URL     = SUPABASE_URL + '/functions/v1'
```

### 14.3 DNS-Konfiguration (v1.10.1)

Custom Domain `cumart.cloud` (IONOS):
- `A-Record: @ → 76.76.21.21` (Vercel)
- `CNAME: www → cname.vercel-dns.com`
- Mail-Records (MX, DMARC, DKIM) erhalten für spätere Nutzung

### 14.4 Benutzer aktuell

| Name          | E-Mail                | Rolle    | Status |
|---------------|-----------------------|----------|--------|
| Selcuk Cumart | selcuk@cumart.tech    | Admin    | aktiv  |

*Stand 22.04.2026 — nur ein User in der DB. Weitere Vertriebs- / Techniker-Profile werden über den Admin-Flow („Benutzer anlegen") eingeladen; der DB-Trigger flippt nach erstem Passwortwechsel automatisch von `eingeladen` → `aktiv` (v1.15).*

### 14.5 Schema-Migrationen (kritisch, in Reihenfolge)

1. Initial Schema (v1.0)
2. RLS-Hardening (v1.1)
3. User-Status-Konsolidierung (v1.2)
4. Phase 3a Termine (v1.6)
5. Phase 3b Projekte (v1.7)
6. Phase 3c Deployments + Junction (v1.9.0)
7. **v1.9.3:** `deployments.datum_von/bis` nullable + `deployments_datum_consistency`
8. **v1.9.6:** DROP CHECKs auf `projects.status` + `deployments.status`
9. Lookup-Eintrag `Abschlussphase` in `lookup_values`
10. **v1.10.0:** `services.standard_uhrzeit_von/bis` (time nullable)
11. **v1.12.0:** `membership_programs` + `membership_program_benefits`
12. **v1.13.0:** `memberships` + `entitlements` + `entitlement_redemptions`
13. **v1.15.0:** Auth-Härtung — `is_active_user()`, Restrictive Policies `only_active_users` auf 15 operativen Tabellen, `trg_user_profiles_update_guard`, `trg_prevent_last_admin_delete`. SQL: `migrations/v1.15.0_auth_hardening.sql`
14. **v1.16.0:** Soft-Delete — `deleted_at timestamptz` + Partial-Indexe auf companies / contacts / appointments / projects / deployments / memberships. SQL: `migrations/v1.16.0_soft_delete.sql`

### 14.6 Verifikations-Query (alle Migrationen prüfen)

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
SELECT 'membership_programs-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='membership_programs')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'membership_program_benefits-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='membership_program_benefits')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'memberships-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='memberships')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'entitlements-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='entitlements')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'entitlement_redemptions-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='entitlement_redemptions')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'Lookup-Wert Abschlussphase',
       CASE WHEN EXISTS (SELECT 1 FROM lookup_values
           WHERE kategorie='projekt_status' AND wert='Abschlussphase' AND ist_aktiv=true)
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'is_active_user function (v1.15)',
       CASE WHEN EXISTS (SELECT 1 FROM pg_proc p
           JOIN pg_namespace n ON n.oid=p.pronamespace
           WHERE n.nspname='public' AND p.proname='is_active_user')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'trg_user_profiles_update_guard (v1.15)',
       CASE WHEN EXISTS (SELECT 1 FROM pg_trigger
           WHERE tgrelid='public.user_profiles'::regclass
             AND tgname='trg_user_profiles_update_guard')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'trg_prevent_last_admin_delete (v1.15)',
       CASE WHEN EXISTS (SELECT 1 FROM pg_trigger
           WHERE tgrelid='public.user_profiles'::regclass
             AND tgname='trg_prevent_last_admin_delete')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'Restrictive Policies only_active_users (v1.15, Soll=15)',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND policyname='only_active_users') = 15
       THEN 'OK' ELSE 'TEILWEISE' END
UNION ALL
SELECT 'deleted_at auf 6 Soft-Delete-Tabellen (v1.16)',
       CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
           WHERE table_schema='public' AND column_name='deleted_at'
             AND table_name IN ('companies','contacts','appointments',
                                'projects','deployments','memberships')) = 6
       THEN 'OK' ELSE 'TEILWEISE' END
UNION ALL
SELECT 'Partial-Indexe idx_<table>_active (v1.16, Soll=6)',
       CASE WHEN (SELECT COUNT(*) FROM pg_indexes
           WHERE schemaname='public'
             AND indexname IN ('idx_companies_active','idx_contacts_active',
                               'idx_appointments_active','idx_projects_active',
                               'idx_deployments_active','idx_memberships_active')) = 6
       THEN 'OK' ELSE 'TEILWEISE' END;
```

---

## 15. Entwicklungs-Philosophie

1. **Schema-First:** Schema-Änderungen über Migration, dann Frontend nachziehen
2. **Ein Feature pro Version:** Kleine, testbare Releases
3. **Cache-First mit expliziter Invalidation:** Lazy gefüllt, manuell invalidiert nach Writes
4. **Sync-Ready auf Mobile:** Clipboard, Input-Modes, Layout iOS-getestet
5. **Pragmatisch > elegant:** Keine Framework-Overengineering, keine Build-Pipeline
6. **Fachliche Trennung:** Termin (Aufwand) vs. Einsatz (Umsatz) vs. Projekt (Paket) vs. Mitgliedschaft (Abo)
7. **Stammdaten > Code:** Admin-veränderliche Werte (Status, Typen, Programme) kommen aus DB, nicht aus Code
8. **DOM-Update > Page-Reload:** Für häufige Micro-Interaktionen gezielt Elemente aktualisieren
9. **Auto-Fill > Pflichtfelder:** Sinnvoll ableitbare Felder automatisch befüllen
10. **Generisch > Hardcoded:** TNC-Club-Spezifika als Programm-Konfiguration, nicht als Sonderlogik (v1.12+)
11. **Transparente Einlösung:** Jede Bonus-Einlösung ist an konkreten Einsatz gekoppelt (v1.14) — revisionssicher

---

*Ende der Dokumentation · Cumart CRM v1.21.0*
