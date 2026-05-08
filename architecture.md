# Cumart CRM — Architektur-Dokumentation

**Version:** 2.0.0
**Stand:** 29. April 2026 (Komplett-Redesign — alle Phasen 0-9 live)
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
- **Aufgaben** (interne To-Dos, zuweisbar an Nutzer, ab v1.22)
- **Leistungen** (Katalog: Trainings, Consulting, Online-Sessions)
- **Benutzern** (interne Cumart-Mitarbeiter mit Rollen)
- **Mitgliedschaften & Bonis** (Kontingent-Tracking: TNC-Club, Pakete, ab v1.12)

**Fachliche Trennung der Kern-Entitäten:**

| Entität       | Bedeutung                              | Umsatz          |
|---------------|----------------------------------------|-----------------|
| Termin        | Gesprächstermin, Akquise, Abstimmung   | nein (Aufwand)  |
| Einsatz       | Abrechenbare Leistung beim Kunden      | ja              |
| Projekt       | Paket mehrerer Einsätze mit Festpreis  | ja (Paketpreis) |
| Aufgabe       | Interne To-Do-Notiz, zuweisbar an User | nein            |
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
├── index.html       ~2.64k Zeilen  (alle Pages + Modals als hidden divs)
├── styles.css       ~2.23k Zeilen  (CSS-Variablen, Desktop + Mobile)
├── app.js            ~9.79k Zeilen  (alle Module in einer Datei)
├── CLAUDE.md                        (Onboarding-Guide für Claude-Code-Sessions)
├── migrations/                      (versionierte SQL-Migrationen, manuell in Supabase angewandt)
│   ├── v1.15.0_auth_hardening.sql
│   ├── v1.16.0_soft_delete.sql
│   ├── v1.22.0_tasks.sql
│   └── v1.24.0_company_abc.sql
├── supabase/
│   └── functions/manage-users/
└── .git/
```

Supabase:
```
Project: loohjeiysjxzbmfwkyvv.supabase.co
├── Schema: public (17 operative Tabellen)
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
| `tasks`                   | Aufgaben / interne To-Dos (v1.22)                    |
| `notes`                   | (angelegt, bisher ungenutzt)                         |
| `appointment_participants`| (angelegt, bisher ungenutzt)                         |

### 4.2 `companies`

| Spalte        | Typ          | Nullable | Default | Notes                              |
|---------------|--------------|----------|---------|------------------------------------|
| id            | uuid         | NO       | gen_random_uuid() | PK                      |
| name          | text         | NO       |         |                                    |
| typ_id        | uuid         | YES      |         | FK → lookup_values (unternehmens_typ) |
| branche       | text         | YES      |         |                                    |
| abc_klassifizierung | text   | YES      |         | CHECK IN ('A','B','C') — strategische Einstufung (v1.24) |
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
| workflow_state | jsonb        | NO       | '{}'::jsonb    | Vorbereitungs-Checkliste (v2.0.3, siehe §8.11) |

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
| workflow_state      | jsonb (NOT NULL) | '{}'::jsonb | Vorbereitungs-Checkliste (v2.0.3, siehe §8.11) |

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
| workflow_state    | jsonb        | NO       | '{}'::jsonb | Dokumentations-Checkliste (v2.0.3, siehe §8.11) |

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

### 4.16 `tasks` (v1.22.0)

Interne Aufgaben, die Nutzer sich selbst oder anderen zuweisen. Bewusst entkoppelt von Termin/Einsatz — keine Kopplung, keine Auto-Projektstatus-Logik, keine Umsatzwirkung.

| Spalte        | Typ          | Nullable | Default           | Notes                              |
|---------------|--------------|----------|-------------------|------------------------------------|
| id            | uuid         | NO       | gen_random_uuid() | PK                                 |
| titel         | text         | NO       |                   |                                    |
| beschreibung  | text         | YES      |                   |                                    |
| status        | text         | NO       | 'offen'           | **Kein CHECK**, validiert über `lookup_values.aufgabe_status` |
| faelligkeit   | date         | YES      |                   | Basis für „überfällig"-Badge       |
| erledigt_am   | timestamptz  | YES      |                   | automatisch gesetzt bei Status-Wechsel → erledigt |
| assigned_to   | uuid         | YES      |                   | FK → user_profiles (ON DELETE SET NULL) |
| company_id    | uuid         | YES      |                   | FK → companies (ON DELETE SET NULL) |
| contact_id    | uuid         | YES      |                   | FK → contacts (ON DELETE SET NULL) |
| project_id    | uuid         | YES      |                   | FK → projects (ON DELETE SET NULL) |
| deployment_id | uuid         | YES      |                   | FK → deployments (SET NULL) — Spalte vorbereitet, aktuell nicht im UI |
| notizen       | text         | YES      |                   |                                    |
| erstellt_von  | uuid         | YES      |                   | FK → user_profiles (SET NULL)      |
| created_at    | timestamptz  | YES      | now()             |                                    |
| deleted_at    | timestamptz  | YES      |                   | Soft-Delete                        |

**Status-Werte** (Lookup `aufgabe_status`): offen · in_arbeit · erledigt. UI rendert Labels via `aufgabeStatusLabel()`. Der Wert `erledigt` wird von der Toggle-Logik und der „Meine offenen"-Query hart referenziert — nicht umbenennen, stattdessen `ist_aktiv=false` setzen.

**Indizes:** partielle Indexe (`WHERE deleted_at IS NULL`) auf `faelligkeit`, `(assigned_to, status)`, `company_id`, `project_id`.

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

Hash-basiert. Hashes: `#/firmen`, `#/firma/UUID`, `#/kontakte`, `#/kontakt/UUID`, `#/termine`, `#/aufgaben` (v1.22), `#/projekte`, `#/projekt/UUID`, `#/einsaetze`, `#/benutzer`, `#/leistungen`, `#/stammdaten`, `#/programme` (v1.12). `#/aufgaben` unterstützt Query-Parameter `?scope=mine_open|all_open|done|all`, `?firma=UUID`, `?projekt=UUID`, `?assignee=UUID`.

**Detail-Tabs (v1.23):** `#/firma/UUID`, `#/projekt/UUID`, `#/kontakt/UUID` unterstützen `?tab=stammdaten|kontakte|termine|aufgaben|projekte|einsaetze|mitgliedschaften`. Der Router strippt die Query, bevor die ID extrahiert wird, und vermeidet Daten-Reload bei reinem Tab-Wechsel (siehe §7.14).

Keine Detail-Route für Einsätze oder Mitgliedschaften — CRUD läuft via Modal.

### 7.3 Navigation

- **Desktop-Sidebar:** flache Liste der Haupt-Bereiche (Firmen / Kontakte / Termine / Aufgaben / Projekte / Einsätze) + Einstellungen-Submenü (admin-only: Benutzer, Leistungen, Stammdaten, Mitgliedschafts-Programme). Das Badge „eigene offene Aufgaben" sitzt auf dem Aufgaben-Nav-Item (rot bei Überfälligkeit).
  - **Historisch:** v1.23 testete eine 3-Gruppen-Struktur (Kunden/Aktivität/Projekte) mit Submenüs. In v1.24 auf Wunsch zurück auf flach, weil die Gruppen ein zusätzlicher Klick wurden, um an die Listen zu kommen.
- **Mobile-Bottom-Nav:** Firmen / Termine / Aufgaben / Mehr.
- **Mehr-Menü:** Kontakte · Projekte · Einsätze + admin-Tools

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
| Aufgabe               | modal-aufgabe      | a-*     |

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
- **v1.22:** Eintrag „Neue Aufgabe" inkl. Kontext-Prefill via `taskModalPrefillCompanyId/ProjectId/ContactId`.

### 7.13 Aufgaben-Liste & Sidebar-Badge (v1.22.0)

- **Scope-Filter:** `mine_open` (Default) · `assigned_to_me` · `created_by_me` · `all_open` · `done` · `all`. Zusätzliche Dropdowns für Zuweisung / Firma / Status. Search-Box matcht Titel, Beschreibung, Notizen, Firma, Projekt, Zugewiesen.
- **Sortierung:** offene vor erledigten; innerhalb nach `faelligkeit` aufsteigend (NULL ans Ende), dann `created_at` desc.
- **Checkbox-Toggle in der Zeile:** schaltet Status offen↔erledigt und setzt `erledigt_am` automatisch. `event.stopPropagation()` verhindert, dass ein Klick auf die Checkbox den Row-Link auslöst.
- **Badge** (`#nav-tasks-badge` Desktop + `#m-nav-tasks-badge` Mobile, seit v1.23 auf Aktivität-Gruppe): zählt Aufgaben mit `assigned_to = me` und `status ≠ 'erledigt'`. Klasse `nav-badge-overdue` (rot) aktiv, sobald mindestens eine überfällig ist. Aktualisiert über `updateTaskBadge()` bei Login, nach jedem Task-Write und nach jedem List-Refresh.

### 7.14 Detail-Tabs (v1.23.0)

Firma-, Projekt- und Kontakt-Detail zeigen statt gestapelter Cards eine horizontale Tab-Leiste. Erster Tab immer „Stammdaten" (seit v1.24 Dashboard-Layout, siehe §7.15), dann pro Sub-Bereich ein Tab mit Count-Badge.

- **Tab-Sets:**
  - `company`: Stammdaten · Kontakte · Termine · Aufgaben · Projekte · Einsätze · Mitgliedschaften (7 Tabs)
  - `project`: Stammdaten · Termine · Aufgaben · Einsätze (4 Tabs)
  - `contact`: Stammdaten · Termine · Aufgaben · Projekte (4 Tabs)
- **URL-Persistenz:** aktiver Tab in `?tab=xxx`. Default `stammdaten` wird weggelassen (saubere URL). Refresh/Teilen funktioniert.
- **Router-Guard:** `_currentDetailKey` verhindert Re-Load der gesamten Detail-Daten bei reinem Tab-Switch. Hash-Änderung mit gleichem Datensatz → nur `switchDetailTab()`.
- **Count-Badges:** `setTabCount(entityType, tabKey, count)` wird parallel zum bestehenden `countEl.textContent` in jeder Load-Funktion aufgerufen. Zahl 0 blendet das Badge aus (kein „0"-Müll).
- **Mobile:** Tab-Leiste horizontal scrollbar (`overflow-x:auto`), kleinere Paddings.
- **Kein Preloading:** Tabs zeigen bereits geladene Daten an (ein `SELECT ...WHERE entity_id=...` pro Sub-Sektion beim Öffnen der Detail-Seite). Tab-Wechsel = reiner DOM-Toggle, keine zusätzlichen Queries.

### 7.15 Stammdaten-Dashboard (v1.24.0, erweitert v1.25.0, Kontakt-Parität v1.26.0, Projekt-Parität v1.30.0)

Der Stammdaten-Tab auf Firma- und Kontakt-Detail zeigt ein Mini-Dashboard im 2-Spalten-Layout (ab 960 px Viewport-Breite):

- **Links (Main):**
  - **Stats-Row** mit 3 Widgets:
    - **ABC-Badge** (groß, farbig, **klickbar seit v1.25**) — `A` grün (Top-Kunde) · `B` gelb (wichtig) · `C` grau (niedrige Prio) · leer/dashed (nicht klassifiziert). Bei Kontakt wird die ABC der zugeordneten Firma geerbt (readonly). Bei Firma öffnet ein Klick auf die Card das **ABC-Edit-Popover** (`#modal-abc-edit`) mit vier Buttons „A / B / C / Auto". „Auto" setzt `abc_klassifizierung = NULL`, dann greift der Auto-Wert (siehe unten). Label unter dem Badge zeigt „ABC · manuell" vs. „ABC · auto".
    - **Umsatz (Kalenderjahr, v1.25)** — Hauptzahl: `SUM(menge × einzelpreis)` aus direkten abgerechneten Einsätzen des laufenden Jahres + `SUM(geschaetzter_umsatz)` aus abgeschlossenen Projekten des laufenden Jahres. Subline „Historie: X €" zeigt den Gesamt-Lifetime-Umsatz. Label dynamisch „Umsatz {YEAR}". Kalenderjahr-Zuordnung: Einsatz nach `datum_von` (Fallback `created_at`), Projekt nach `enddatum` (Fallback `created_at`).
    - **Offene Aufgaben** (Count `tasks` wo `company_id`/`contact_id = X` und `status ≠ 'erledigt'`). Rot gefärbt, wenn mindestens eine überfällig. Kontakt zeigt zusätzlich **Projekte (als Hauptkontakt)**.
  - **Aktivität 2-spaltig (v1.25)** — zwei Cards nebeneinander:
    - **Letzte Aktivität** — letzter durchgeführter Termin + letzter Einsatz mit Status `Durchgeführt`/`Abgerechnet`, je Top-1, sortiert desc.
    - **Bevorstehend** — nächste geplanten Termine (`status='geplant'`, `datum >= heute`, Top-2) und Einsätze (`status='Geplant'`, `datum_von >= heute`, Top-2).
  - **Opportunities (v1.25)** — Liste aller Projekte mit Status `Lead` oder `Angebot`, nach `enddatum` aufsteigend. Jede Zeile: Projektname, Status-Pill, Summe, optionales Deadline-Datum. Klick navigiert zum Projekt-Detail.
  - **Kontaktdaten** — das bestehende `detail-grid` (Adresse/Website/Telefon/E-Mail bei Firma, Telefon/E-Mail/Position/Firma bei Kontakt).
  - **Notizen (inline-editierbar)** — `<textarea>` mit auto-save on blur (`saveCompanyNotesInline()` / `saveContactNotesInline()`), Status-Feedback „Gespeichert ✓".
- **Rechts (Quick-Create-Panel):** Sticky vertikale Button-Liste zum direkten Anlegen mit Kontext-Prefill:
  - Firma: + Kontakt · + Termin · + Aufgabe · + Einsatz · + Projekt · + Mitgliedschaft · **⚡ Schnellaktionen (v1.25)**
  - Kontakt: + Termin · + Aufgabe · + Projekt (als Hauptkontakt)

Mobile (<960 px): Quick-Create-Panel rutscht unter den Main-Bereich (nicht sticky). Stats-Row wird einspaltig (<600 px).

**Widget-Loader:** `loadCompanyDashboard(id, manualAbc)` / `loadContactDashboard(id, companyId, manualAbc, companyName)` feuern ~10 parallele Supabase-Queries (`Promise.all`) und rendern sofort, sobald alles da ist. Das passiert parallel zum normalen Detail-Laden und blockiert den Rest nicht.

**Auto-ABC (v1.25):** `computeAutoAbc(yearRevenue)` mit Schwellen `≥10.000 € = A`, `≥2.000 € = B`, sonst `C`. Wirkt nur, wenn `companies.abc_klassifizierung IS NULL`. Das Setzen eines expliziten A/B/C über das Edit-Popover hat immer Vorrang. `renderAbcBadgeIn({badge, label, mode}, manualAbc, autoAbc, opts)` (v1.26) ist der generische Renderer; `renderCompanyAbcBadge` und `renderContactAbcBadge` sind dünne Wrapper mit den jeweiligen Element-IDs + Mode-Präfix.

**Kontakt-Parität (v1.26):** Das Kontakt-Stammdaten-Dashboard spiegelt fachlich sauber die Firma-Daten, wo Kontakt keinen eigenen Wert hat:

- **ABC-Card** ist klickbar und öffnet das ABC-Edit-Popover **mit der Firma-ID**. ABC lebt nur an der Firma, der Kontakt zeigt sie readonly-gespiegelt — Klick von der Kontakt-Seite aus ändert sie direkt an der Firma (und refresht den Kontakt-Screen automatisch über `setCompanyAbc` → `loadContactDetail`). Label „ABC · Firma · manuell/auto", bei Kontakt ohne Firma: „Keine Firma zugeordnet".
- **Umsatz-Card** zeigt den Kalenderjahr-Umsatz der zugeordneten Firma (kein Kontakt-eigener Umsatz). Label „Umsatz {Firma-Name} · {YEAR}", Subline Historie. Klick navigiert zur Firma. Bei Kontakt ohne Firma: „—" + Hinweis.
- **Letzte Aktivität** mischt Termine am Kontakt (via `contact_id`) mit Einsätzen der Firma (gekennzeichnet als „Einsatz (Firma)").
- **Bevorstehend** dasselbe Muster: geplante Termine am Kontakt + geplante Einsätze der Firma.
- **Opportunities** zeigen Projekte, in denen **dieser Kontakt Hauptkontakt** ist und Status `Lead`/`Angebot` haben — bewusst nicht alle Firma-Projekte, sonst hätten alle Kontakte derselben Firma dieselbe Liste.
- **Schnellaktionen-Button** im Quick-Create-Panel öffnet das Quick-Actions-Modal mit Firma-Kontext. Bei Kontakt ohne Firma `disabled`.

**Projekt-Parität (v1.30):** Der Projekt-Stammdaten-Tab hatte bis v1.29 noch das alte `detail-grid`-Layout und wurde bei der Vereinheitlichungs-Runde v1.24–v1.26 versehentlich übersprungen. v1.30 zieht ihn auf dasselbe Dashboard-Muster:

- **4 Stats-Cards** (Projekt hat mehr eigenständige Kennzahlen als Firma/Kontakt, darum eine Card mehr):
  - **Status** — Status-Badge + Subline „Start: DD.MM.YYYY" oder „Noch nicht gestartet".
  - **Wirtschaftlichkeit** — Haupt-Wert: Marge / Überziehung (farbig: grün/rot). Subline: `Paket X € · Aufwand Y €`. Aufwand = Summe aller Einsätze im Projekt (ohne Status-Filter, reine Ist-Rechnung). Bei Paket=0 und Aufwand=0 wird „—" angezeigt.
  - **Zeitplan** — „in N Tagen" / „heute" (orange) / „N Tage überzogen" (rot) / „Abgeschlossen" (grün, wenn Status = Abgeschlossen) / „Kein Enddatum" (wenn `enddatum IS NULL`). Subline: „Enddatum: DD.MM.YYYY".
  - **Offene Aufgaben** analog zu Firma/Kontakt (Count + rot wenn überfällig).
- **Aktivität 2-spaltig**: Letzte Aktivität (letzter durchgeführter Termin + letzter durchgeführter/abgerechneter Einsatz im Projekt) neben Bevorstehend (nächste geplante Termine/Einsätze).
- **Inline-editierbare Beschreibung + Notizen** — zwei separate `<textarea>`-Felder mit auto-save on blur (`saveProjectBeschreibungInline`, `saveProjectNotizenInline`). Ersetzt die readonly-Darstellung, die vorher nur via Bearbeiten-Modal änderbar war.
- **Quick-Create-Panel rechts**: + Termin · + Einsatz (mit Firma-Prefill aus dem Projekt) · + Aufgabe. Die bestehenden „+ hinzufügen"-Buttons in den Sub-Tab-Headern bleiben — Redundanz ist gewollt, weil sie im jeweiligen Tab-Kontext bleiben.
- **Kein ABC-Widget, keine Opportunities** bei Projekt: ABC lebt an der Firma, und ein Projekt ist fachlich schon selbst die Opportunity.

Widget-Loader: `loadProjectDashboard(p)` feuert 6 parallele Queries für Einsätze/Aufgaben/Letzte/Bevorstehende. Status- und Deadline-Card werden synchron aus den Projektdaten befüllt — sofort sichtbar, bevor die Supabase-Calls zurückkommen.

### 7.16 Schnellaktionen-Modal (v1.25.0)

Pro Firma ein zentrales Modal (`#modal-quick-actions`, `openQuickActionsModal(companyId, companyName)`) mit kachelartigen Einträgen für die häufigsten Folgeaktionen eines Kundenkontakts. Jede Kachel öffnet das passende Entitäts-Modal mit `companyId`-Prefill; Kacheln für konkrete Leistungen setzen zusätzlich `window._pendingDeploymentPrefillServiceId`, das beim nächsten `openDeploymentModal('new')` die Leistung vorauswählt und dann ein synthetisches `change`-Event auf das Service-`<select>` feuert, damit die bestehende Auto-Fill-Kette (Preis/Uhrzeit/Titel) greift. Ziel: Ein-Klick-Eintrag für „Wiederkehrende Leistung für diesen Kunden".

### 7.17 Datum-Schnellauswahl im Termin-Modal (v1.25.0)

Über dem `t-datum`-Input steht eine Button-Reihe `heute` · `morgen` · `+3` · `+7` · `nächster Mo`. `setAppointmentDateShortcut(key)` berechnet das Zieldatum und schreibt es via `toISODate()` in das Input. „Nächster Montag" ist immer mindestens der Montag der Folgewoche (wenn heute schon Montag ist: in 7 Tagen).

### 7.18 Inline-Expand-Row-Dashboards (v1.27 Termin, v1.28 Einsatz, v1.29 Aufgabe)

**Prinzip:** Klick auf eine Listen-Zeile klappt direkt unterhalb ein Detail-Dashboard auf — Stats, Kontext, verwandte Einträge, Schnellaktionen. Nur **eine Zeile gleichzeitig app-weit**. Auf Mobile (`matchMedia('(max-width: 600px)')`) wird stattdessen das bestehende Bearbeiten-Modal geöffnet, weil eine Aufklapp-Kaskade in schmalen Spalten unübersichtlich wird.

**Shared Infrastruktur** (wiederverwendbar für Einsatz v1.28 / Aufgabe v1.29):
- Globaler State `_expandedRow = { type, id, rowEl, panelRow }`.
- `toggleRowExpand(entityType, entityId, rowEl)` — schließt die alte Expand-Row, fügt eine neue `<tr class="expanded-row">` mit `colspan` über alle Spalten nach der Trigger-Zeile ein, markiert die Trigger-Zeile mit `.row-expanded`, dispatcht auf die entitätsspezifische Render-Funktion (`renderAppointmentExpandedRow`, …).
- `closeExpandedRow()` — entfernt die Expand-`<tr>` aus dem DOM, resettet den State. Wird zusätzlich am Anfang jedes Listen-Render-Durchgangs aufgerufen, damit hängende Referenzen nicht überleben.
- `isMobileForExpand()` — Viewport-Check, bestimmt den Fallback-Pfad.

**Termin-Dashboard-Inhalt (`renderAppointmentExpandedRow`):**
- **Stats-Row** (inline): Status-Pill · Typ-Pill · Datum mit Label vergangen/heute/kommend · Uhrzeit · ABC-Badge der Firma · Gekoppelter Einsatz (Link oder „nicht gekoppelt").
- **Kontext-Block** (2-spaltig mit Schnellaktionen): Firma / Kontakt / Projekt / Ort / Notizen (Excerpt mit max-height).
- **Letzte Termine derselben Firma** — Top 3, Klick öffnet jeweils das Bearbeiten-Modal (bewusst: innerhalb eines Expand soll ein zweiter Expand nicht aufgehen).
- **Offene Aufgaben** im Kontext (`OR(company_id, contact_id)`, nicht-erledigt, max 3) — überfällige rot markiert.
- **Schnellaktionen** (`quickAppointment*`):
  - `quickAppointmentMarkDone` — setzt Status auf `durchgefuehrt`, triggert `checkAndUpdateProjectStatus`, refresht die aktuelle Liste.
  - `quickAppointmentFollowup` — öffnet Termin-Modal mit Prefill (Firma/Kontakt/Projekt/Typ/Ort), Datum = heute + 7, Titel = „Folgetermin: {Original-Titel}".
  - `quickAppointmentCreateTask` — Aufgabe-Modal mit Firma-/Kontakt-Prefill, Titel = „Follow-up zu Termin: …".
  - `quickAppointmentCreateDeployment` — Einsatz-Modal mit Firma/Projekt-Prefill, Datum/Uhrzeit/Ort/Titel übernommen. Blockiert, wenn Termin keine Firma hat.
  - **Vollbearbeitung** — öffnet das bestehende Termin-Modal (für Felder, die nicht im Dashboard sichtbar sind).

**Verdrahtet in allen 4 Termin-Listen:** Haupt-Liste `#/termine`, Firma-Tab (`loadCompanyAppointments`), Kontakt-Tab (`loadContactAppointments`), Projekt-Tab (`loadProjectAppointments`). Das bestehende Bearbeiten-Icon (in `renderActionIcons`) und die expliziten „Bearbeiten"-Buttons in den Sub-Tabs sind unverändert und öffnen weiterhin das Modal — Dashboard und Modal sind zwei unterschiedliche Einstiege, kein Entweder-Oder.

**Auto-Expand bei genau einem Eintrag (v1.27.1, generalisiert v1.28):** In Detail-Tabs (Firma/Kontakt/Projekt) klappt die einzige Zeile nach dem Rendern automatisch auf, wenn die Liste exakt einen Eintrag enthält. Der Gedanke: Wer nur einen Treffer in Sicht hat, will meistens direkt ins Dashboard, ein Extra-Klick ist Reibung. Greift **nicht** in der globalen Haupt-Liste (dort wäre „zufällig 1 Treffer nach Filter" kein reliables Signal) und **nicht** auf Mobile. Generischer Helper: `autoExpandSingleRow(tbody, entityType, items)`.

**Einsatz-Dashboard-Inhalt (`renderDeploymentExpandedRow`, v1.28):**
- **Stats-Row:** Status · Wert (`menge × einzelpreis`, beschriftet „Positionswert (Aufwand)" wenn im Projekt, sonst „Wert") · Datum/Zeitraum (oder „Ungeplant") · ABC der Firma · Projekt (Link oder „Einzelbuchung") · Gekoppelter Termin (Datum + Titel als Link, oder „nicht gekoppelt") · Bonus-Einlösung (Menge oder „keine").
- **Kontext-Block:** Firma · Leistung (Name + Einheit) · Techniker (intern aus `deployment_technicians` + `externe_techniker` kombiniert) · Uhrzeit · Menge × Preis = Gesamt · Ort · Notizen (Excerpt).
- **Projekt-Kontext** (nur wenn Einsatz `project_id` hat): Paketpreis vs. interner Aufwand (Summe aller Projekt-Einsätze) + farbige Marge / Überziehung. Ersetzt den manuellen Soll/Ist-Check im Projekt-Tab für die Schnellsicht.
- **Historie:** letzte 3 Einsätze derselben Firma (Klick → Modal; kein Nested-Expand).
- **Schnellaktionen** (`quickDeployment*`):
  - `quickDeploymentMarkDone` — nur aus Status `Geplant` heraus, setzt auf `Durchgeführt`, triggert `checkAndUpdateProjectStatus`.
  - `quickDeploymentMarkBilled` — nur aus `Durchgeführt` heraus, setzt auf `Abgerechnet`. Aus `Abgerechnet` heraus kein Schnell-Wechsel (Hinweis-Textfeld im Dashboard erklärt das).
  - `quickDeploymentDuplicate` — ruft die bestehende `duplicateDeployment(id)` auf (v1.11-Helfer wiederverwendet).
  - `quickDeploymentFollowup` — öffnet Einsatz-Modal `new` mit Prefill (Firma/Projekt/Service/Ort/Titel), Datum bleibt leer für bewusste Neuplanung. Service-Prefill läuft über `_pendingDeploymentPrefillServiceId`, damit die Auto-Fill-Kette (Preis/Uhrzeit/Titel aus Service-Defaults) greift.
  - **Vollbearbeitung** — öffnet das bestehende Einsatz-Modal.

Wirkt in allen 3 Einsatz-Listen: Haupt `#/einsaetze`, Firma-Tab (`loadCompanyDeployments`), Projekt-Tab (`loadProjectDeployments`). Kontakt-Tab existiert für Einsätze nicht, weil Einsätze fachlich nicht direkt an einen Kontakt gekoppelt sind.

**Aufgabe-Dashboard-Inhalt (`renderTaskExpandedRow`, v1.29):**
- **Stats-Row:** Status · Fälligkeit mit kalkuliertem Label — „vergangen · N Tage überfällig" (rot), „heute" (orange), „in N Tagen" (neutral), oder „Keine Fälligkeit" · Zuständiger (mit „(mir)"-Hint wenn eingeloggter User).
- **Kontext-Block:** Firma · Kontakt · Projekt · Beschreibung · Notizen.
- **Verwandte offene Aufgaben** (v1.31 auf Kunden-Kontext umgestellt): `OR(company_id.eq, contact_id.eq)` — selbe Firma oder selber Kontakt, `status != 'erledigt'`, max 3, nach Fälligkeit aufsteigend. Vor dem Status-Label steht der Firmen- bzw. Kontaktname, damit auf einen Blick klar ist, zu welchem Kunden eine verwandte Aufgabe gehört.
- **Schnellaktionen** (`quickTask*`):
  - `quickTaskComplete` — Status → `erledigt`, ruft `updateTaskBadge()` zusätzlich auf.
  - `quickTaskReopen` — Status → `offen` (für erledigte Aufgaben).
  - `quickTaskPostpone(id, days=7)` — verschiebt Fälligkeit um N Tage (relativ zum aktuellen Datum oder zu heute wenn keine Fälligkeit gesetzt war).
  - `quickTaskAssignToMe` — setzt `assigned_to` auf `currentProfile.id` (Button nur sichtbar wenn derzeit andere Person zuständig).
  - `quickTaskFollowup` — Aufgabe-Modal `new` mit Firma/Kontakt/Projekt-Prefill, Titel = „Folge zu: …".
  - **Vollbearbeitung** — Modal öffnen.

Wirkt in allen 4 Aufgaben-Listen: Haupt `#/aufgaben` (`renderTasksTable`) und Firma/Kontakt/Projekt-Tab (gemeinsam gerendert von `renderDetailTaskRows`). Das bestehende Häkchen am Zeilenanfang („als erledigt markieren") und die Action-Icons bleiben unverändert — sie geben schnelle Toggle- und Kebab-Optionen, ohne das Dashboard öffnen zu müssen. Refresh nach Schnellaktionen läuft über `_refreshTaskContext()`, den es bereits vor dem Inline-Expand gab; keine Duplikation.

**Konsistenz am Ende:** Termin/Einsatz/Aufgabe haben jetzt dieselbe Interaktion. Firma/Kontakt/Projekt behalten ihre eigenen Detail-Routen mit Dashboard, weil sie fachlich sowohl Container anderer Entitäten als auch eigenständige Karteikarten sind — für sie wäre Inline-Expansion die kleinere Information. Das Regal-Prinzip: kleine Objekte (Termine/Einsätze/Aufgaben) klappen auf, große (Firma/Kontakt/Projekt) sind eigene Seiten.

**CSS:** `.expanded-row-panel-inner` mit Accordion-Animation (`expandRowIn`, 160 ms), linker blauer Akzent-Border, Light-Purple-Highlight auf der Trigger-Zeile. `.erp-stats` / `.erp-kv` / `.erp-actions` / `.erp-related` bilden die Dashboard-Sub-Komponenten. Layout wird bei `<800 px` einspaltig.

### 7.19 Kalender-Bar (v1.32.0)

Permanenter Footer mit Monats-Zeitstrahl des gewählten Mitarbeiters, fixed am unteren Rand (Desktop ab 900 px, auf Mobile via CSS ausgeblendet). Zweck: auf einen Blick sehen, wer an welchen Tagen belegt/frei ist, und Feiertags-Konflikte erkennen, bevor eine Fehlplanung live geht.

**Layout:**
- Kopfzeile mit `‹` Prev-Monat · Monatsname · `›` Next-Monat · „Heute"-Button · Mitarbeiter-Dropdown (default: eingeloggter User) · Legende.
- Tages-Zeitstrahl: Eine Box pro Kalendertag (Tag-Nummer + Wochentag-Kürzel). Breite flex-verteilt, horizontal scrollbar wenn's eng wird.

**Farbcode pro Tag (Priorität von oben: höher > niedriger):**
- **Rot** — Feiertag (Baden-Württemberg, siehe unten)
- **Grün** — Einsatz eingeplant
- **Gelb** — nur Termin(e) eingeplant
- **Weiß** — frei
- Wochenend-Tage ohne Event haben einen dezenten Grauschleier, damit sie visuell vom Werktag unterscheidbar sind.
- Heute-Tag bekommt einen blauen Ring.

**Kollisions-Warnung:** Wenn an einem Feiertag ein Einsatz eingeplant ist, erscheint zusätzlich ein ⚠-Symbol oben rechts in der Tages-Box. Im Popover (Klick auf den Tag) steht der Warnhinweis „An diesem Feiertag ist ein Einsatz eingeplant. Falls das nicht beabsichtigt ist, bitte umplanen." — bewusst als weiche Warnung, nicht als Block, weil manche Kunden bewusst an Feiertagen arbeiten.

**Zuordnung Event → Mitarbeiter:**
- **Einsatz**: User steht in `deployment_technicians.user_id` (Join-Tabelle). Mehrtagige Einsätze (`datum_von` – `datum_bis`) markieren alle Tage im Bereich grün.
- **Termin**: `appointments.erstellt_von = user_id`. Termine werden nicht explizit jemandem „zugewiesen" — der Ersteller ist die beste verfügbare Heuristik.

**Feiertage (`computeBwHolidays(year)`):** Feste Feiertage (Neujahr, Heilige Drei Könige, Tag der Arbeit, Tag der Deutschen Einheit, Allerheiligen, 1./2. Weihnachtstag) sind hartkodiert. Bewegliche (Karfreitag, Ostermontag, Christi Himmelfahrt, Pfingstmontag, Fronleichnam) werden via Gauß'scher Osterformel (`computeEasterSunday(year)`) berechnet — keine externe API, keine Netzabhängigkeit. Gilt für Baden-Württemberg. Andere Bundesländer bräuchten ein konfigurierbares Feld in `user_profiles` (nicht in v1.32).

**Popover auf Klick:**
- Langform-Datum (Wochentag, Datum, Jahr).
- Rote Feiertags-Karte, wenn zutreffend.
- Kollisions-Warnung, wenn Feiertag + Einsatz.
- Sektion „Einsätze" mit Firma + Status — Klick öffnet das Einsatz-Modal.
- Sektion „Termine" mit Uhrzeit + Firma + Status — Klick öffnet das Termin-Modal.
- „Frei — nichts eingeplant." wenn leer und kein Feiertag.

**Refresh-Hook** (`refreshCalendarBar()`): Wird automatisch nach jedem Termin- und Einsatz-Write aufgerufen (via `refreshCurrentAppointmentList` / `refreshCurrentDeploymentList` + direkt am Ende von `saveAppointment` / `saveDeployment`). So ist der Kalender immer konsistent mit dem, was der User gerade gespeichert hat, ohne manuellen Reload.

**State:** `_calendarState = { userId, year, month, eventsByDay, holidays }`. Wird beim Login via `initCalendarBar()` initialisiert (Default: aktueller User, aktueller Monat) und bei `showLoginScreen()` ausgeblendet.

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
| Kontakt-Detail    | + Aufgabe       | Firma + Kontakt                         |
| Projekt-Detail    | + Termin        | Firma + Projekt                         |
| Projekt-Detail    | + Einsatz       | Firma + Projekt                         |
| Projekt-Detail    | + Aufgabe       | Firma + Projekt                         |
| Firma-Detail      | + Aufgabe       | Firma                                   |
| Firma-Detail      | ⚡ Schnellaktion → + Einsatz | Firma + Leistung (über `_pendingDeploymentPrefillServiceId`, v1.25) |

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

### 8.11 Workflow-Checklisten (v2.0.3)

Punkt 9 des UX-Refactors: pro Detail-Page eine Schritt-für-Schritt-Checkliste, die im Hero einen Status („✓ Vorbereitet" / „✓ Dokumentiert") zeigt sobald alle Schritte abgehakt sind. State liegt in der jsonb-Spalte `workflow_state` der jeweiligen Tabelle (`appointments`, `deployments`, `projects`); Schritt-Definitionen sind in `app.js` hartcodiert (`WORKFLOW_STEPS`-Konstante), weil sie eng an UI-Texte gekoppelt sind und sich selten ändern.

| Workflow-Key           | Entität     | Schritte                                                                               | Hero-Pille      |
|------------------------|-------------|----------------------------------------------------------------------------------------|-----------------|
| `appointment_prepare`  | appointment | anfahrt · teilnehmer · unterlagen · agenda                                             | ✓ Vorbereitet   |
| `deployment_document`  | deployment  | themen · teilnehmer · erkenntnisse · folgemassnahmen · status_done                     | ✓ Dokumentiert  |
| `project_prepare`      | project     | ziel · erfolgskriterien · themen · aktivitaeten                                        | ✓ Vorbereitet   |

**Schema-Form** (Beispiel deployment-Zeile):
```json
{
  "deployment_document": { "themen": true, "teilnehmer": false, ... }
}
```

**Helper:**
- `renderWorkflowChecklist(workflowKey, entityType, entityId, containerId, pillId)` — rendert die Checklist im Vorbereitung-/Dokumentation-Tab und toggelt die Hero-Pille.
- `_loadWorkflowState` / `_saveWorkflowStep` — Direct-Update gegen jsonb-Spalte (Read-Modify-Write, kein RPC).
- `onWorkflowStepToggle(...)` — Inline-Handler, schreibt sofort beim Klick und re-rendert.

**Lazy-Render:** Die Pille im Hero wird beim Laden der Detail-Page sofort gerendert (damit "✓"-Status auch ohne Tab-Wechsel sichtbar ist). Die Checklist im Tab selbst lädt erst beim Tab-Switch.

**Aufgaben** brauchen keinen Workflow-State — ihr Modell (offen ↔ erledigt) ist schon im `status`-Feld abgebildet.

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

- Destruktive Aktionen mit `confirmDialog()` (seit v1.20, Promise-basiert, Default-Fokus auf „Abbrechen") — native `confirm()` nur noch für non-destructive Prompts wie Logout oder Passwort-Reset
- FK-Fehler in `deleteX()` abgefangen (ab v1.16 selten — Soft-Delete umgeht FK-Violations)
- Toasts: 3 s Default-Anzeige, 5 s bei Action-Button (z. B. Undo seit v1.20)
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
| **v2.6.6** | **09.05.2026** | **„Heute von dir" zeigt jetzt alle Anlage-Typen.** Sektion zeigte bisher nur Termine, Einsätze, Aufgaben und erledigte Aufgaben — Importe von Firmen/Kontakten und neu angelegte Produkte/Notizen blieben unsichtbar, obwohl sie heute mit `erstellt_von = userId` erstellt wurden. Jetzt mit dabei: `companies`, `contacts`, `notes`, `products`. Limit-Cap auf 12 Items (statt 6). Defensiver `onclick`-Render: wenn `click` undefined (z.B. bei Notizen), kein Click-Handler. Hinweis: Bearbeitungen werden weiterhin nicht getrackt — dafür bräuchte es ein `updated_at`-Schema. Kein Schema-Change. |
| v2.6.5 | 09.05.2026 | **CSV-Import: eine Spalte → mehrere Zielfelder.** Mapping-Struktur umgestellt von `Array<string\|null>` auf `Array<string[]>` — jede CSV-Spalte kann jetzt 0, 1 oder mehrere Zielfelder bedienen. Im Mapping-UI hat jeder Eintrag ein primäres Dropdown, einen „+ weitere Zuordnung"-Button und pro weiterem Slot ein ×-Entfernen. Anwendungsfall: CSV hat nur eine `Id.-Nr.`-Spalte, soll aber gleichzeitig auf Artikelnummer (intern) UND Hersteller-Artikelnr. gemappt werden. Beim Insert iteriert die Schleife über alle Slots, derselbe Wert landet in allen gewählten Zielfeldern. Required-Validierung in `runImport` sammelt jetzt Keys aus allen Slots (nicht mehr nur den ersten). Helpers: `addImportMapping`, `updateImportMapping`, `removeImportMapping`; `setImportMapping` bleibt als Single-Mode-Wrapper für Backward-Compat. Kein Schema-Change. |
| v2.6.4 | 09.05.2026 | **Kontakt-Dubletten mit E-Mail-Match-Schutz.** Dubletten-Seite hat eine neue Sektion „Kontakte" zusätzlich zur „Firmen". Match-Kriterium für Kontakte absichtlich strenger als bei Firmen: gleicher Name allein reicht NICHT (verbreitete Namen wie „Thomas Müller" kommen mehrfach legitim vor). Helper `_contactDuplicateKey(k)`: lowercase `vorname + nachname + ":" + email` — wenn Email leer, kein Match (Kontakt wird nicht gruppiert). Merge-Logik analog zur Firma: FK-Updates an `appointments.contact_id`, `projects.hauptkontakt_id`, `tasks.contact_id`, `notes.contact_id`; `entity_tags` (entity_type='contact') + `pins` (entity_type='contact') mit UNIQUE-Konflikt-Behandlung; Soft-Delete des Dublikats. Confirm-Modal wird zwischen Firma- und Kontakt-Variante per `onclick`-Override umgeschaltet. Kein Schema-Change. |
| v2.6.3 | 08.05.2026 | **Listen-Tab-Counts stabil + Merge-Reload schnell.** Drei Fixes: (1) Tab-Counter (z.B. „Firmen · 247") sprang beim Klick auf den Tab auf die gefilterte Anzahl („Firmen · 2"), weil `renderCompaniesTable/Contacts/Appointments/Projects/Deployments/Tasks` nach jedem Render `setListenTabCount(...,shown)` aufriefen und damit den Total-Wert aus `loadAllListenTabCounts` (v2.3.2) überschrieben. Fix: alle 6 `setListenTabCount`-Calls in den Tabellen-Renderern entfernt — der Tab zeigt nun immer das Total, die gefilterte Anzahl steht im Card-Title („2 von 247 Firmen"). (2) Listen-Tab-CSS: `min-width:110px`, konstantes `font-weight:500`, Border immer reserviert (`border:0.5px solid transparent` im inactive Zustand) — keine Layout-Shifts beim Wechsel zwischen aktivem/inaktivem Tab. (3) Merge-Reload: nach Zusammenführung wurde `loadDublettenPage()` komplett neu gerufen, was alle Firmen + Verknüpfungs-Counts erneut scannte (~1–2 s). Jetzt entfernt `_removeMergedGroupFromUI` nur die fertige Gruppe aus dem DOM + `_dublettenGroups`-Array — der „Neu prüfen"-Button macht weiterhin den vollen Scan. Kein Schema-Change. |
| v2.6.2 | 08.05.2026 | **Merge-Performance — Parallele Wellen statt sequenzieller Roundtrips.** Beim Zusammenführen einer Dublette liefen ~15 DB-Calls hintereinander (8 FK-Updates, 4 Tag/Pin-Reads, ~3 Tag/Pin-Updates, 1 Soft-Delete) → ~2 s pro Dublette merklich spürbar. Jetzt zwei `Promise.all`-Wellen: Welle 1 schickt alle FK-Updates + Tag/Pin-Reads parallel; Welle 2 schickt Tag/Pin-Resolve-Updates + Soft-Delete parallel. Geschätzter Gewinn ~10×, ~200–300 ms pro Dublette. Kein Schema-Change. |
| v2.6.1 | 08.05.2026 | **Dubletten-Aufräumen + CSV-Import für Produkte.** Neue Settings-Sub-Page `#/dubletten` findet Firmen mit identischem normalisiertem Namen (Helper `_normalizeCompanyName`: Lowercase + Trim + Rechtsform-Suffixe `gmbh & co. kg`/`gmbh`/`ag`/`kg`/`ohg`/`gbr`/`e.V.`/`ug`/`ltd.` entfernen + Sonderzeichen weg). Pro Gruppe Tabelle mit Verknüpfungs-Counts (Kontakte/Projekte/Termine/Einsätze) — Master-Wahl per Radio, Default: Eintrag mit den meisten Verknüpfungen. Merge-Algorithmus (`confirmMerge`): alle FKs der Dublette → Master (contacts/appointments/projects/deployments/tasks/notes/memberships/products.lieferant_id), `entity_tags` + `pins` mit UNIQUE-Konflikt-Behandlung (bei Master-Match: DELETE statt UPDATE), Dublette `deleted_at = now()` soft-gelöscht. CSV-Import erweitert um Datentyp „Produkt" (`IMPORT_FIELDS.product`): name (Pflicht), artikelnummer, hersteller_artikelnr, kategorie, einheit, EK, VK, beschreibung, notizen + Spezialfeld `__lieferant_name` (resolved auf `companies.id`). Preis-Strings tolerant geparst — `1.234,56 €` / `1234,56` / `1234.56` werden alle korrekt zu `numeric`. Kein Schema-Change. |
| v2.6.0 | 08.05.2026 | **Produkte + Lieferantenmanagement (Phase 1).** Hardware-Verkauf vorbereitet — Spannmittel, Halter, Werkzeuge etc. Schema (Migration `v2.6.0_products_lieferanten.sql`): (1) `companies.ist_lieferant` boolean DEFAULT false — eine Firma kann gleichzeitig Kunde **und** Lieferant sein, daher zusätzlich zu `typ_id` (kein Schema-Bruch). Partial-Index `idx_companies_lieferant`. (2) Neue Tabelle `products` (id, name NOT NULL, beschreibung, artikelnummer, hersteller_artikelnr, einheit, einkaufspreis numeric(12,2), verkaufspreis numeric(12,2), kategorie, lieferant_id FK companies SET NULL, notizen, ist_aktiv, erstellt_von, created_at, deleted_at). Indexe auf name/lieferant_id/kategorie (alle WHERE deleted_at IS NULL). RLS-Pattern wie sonst. UI: Firma-Modal bekommt Checkbox „Auch als Lieferant" (`c-ist-lieferant`); Firmen-Liste neuer Filter-Toggle „Nur Lieferanten" (`companies-lieferant-filter`); neue Settings-Sub-Page `#/produkte` mit CRUD — Filter (Suche, Kategorie, Lieferant, „Nur aktive"), Tabelle mit EK/VK/Marge-Anzeige in € und %, Modal mit Lieferant-Dropdown (filtert auf `ist_lieferant=true`) und Kategorie-Datalist. Helper: `loadProductsPage`, `filterProducts`, `openProductModal`, `saveProduct`, `deleteProduct` (Soft-Delete). **Phase 2 folgt:** `product_sales`-Tabelle für Verkaufspositionen (mit/ohne Projekt), Marge im Projekt-Wirtschaftlichkeit-Tab. **Phase 3:** CSV-Import für Produkte (Preiskatalog-Upload). |
| v2.5.1 | 08.05.2026 | **Tags — Phase 2: Filter in den Listen.** Tag-Filter-Zeile unter den vorhandenen Filtern in Firmen-, Kontakte- und Projekte-Liste. Pillen pro existierendem Tag (in Tag-Farbe), Toggle per Klick — mehrere gleichzeitig wählbar. Clear-Button hebt Filter auf. Sobald >1 Tag aktiv, erscheint Modus-Toggle „alle" (AND) ↔ „eines" (OR). Filter wirkt zusätzlich zu Such- und Status-Filtern (alle Bedingungen mit AND verknüpft). State pro Listen-Page in `_tagFilterState`. Helper `applyTagFilter(entityType, items)`: lädt aus `entity_tags` die passenden `entity_id`s zu den selektierten Tags + Modus, filtert die Items clientside (Set-Lookup). `filterCompanies` / `filterContacts` / `filterProjects` sind dadurch async. UI gerendert in `renderTagFilterUI(entityType)`, beim Listen-Loader einmal initialisiert. Kein Schema-Change. |
| v2.5.0 | 08.05.2026 | **Tags — Cross-Entity-Labels (Phase 1).** Ein Tag (z.B. „VIP", „Heidenhain", „Akquise 2026") kann an mehrere Entitäten unterschiedlicher Typen hängen. Schema: zwei neue Tabellen — `tags` (id, name UNIQUE, farbe, beschreibung, created_at, erstellt_von) und Junction `entity_tags` (id, tag_id FK CASCADE, entity_type TEXT CHECK in company/project/contact, entity_id, created_at, UNIQUE-Composite). RLS-Pattern wie sonst (PERMISSIVE all_authenticated + RESTRICTIVE only_active_users). Indexe auf (entity_type, entity_id) und tag_id. Migration `v2.5.0_tags.sql`. UI: neue Settings-Sub-Page `#/tags` mit CRUD — Tabelle der Tags inkl. Verknüpfungs-Count, Modal mit Name + 12-Farben-Picker + Beschreibung. Tag-Picker als TAGS-Sektion im Sidepanel der Firma/Kontakt/Projekt-Detail-Page: aktuelle Tags als entfernbare Pillen, Add-Dropdown mit den noch nicht zugewiesenen Tags + „+ Neu"-Shortcut zum Tag-Modal. Helper `renderEntityTagZone`, `addTagToEntity`, `removeTagFromEntity`, `loadTagsCache`, `loadTagsForEntity`, `_entityTagsCache`-Map als Lazy-Cache. **Phase 2 folgt**: Filter in den Listen-Tabellen nach Tag. |
| v2.4.5 | 08.05.2026 | **Anrede-Splitting auch im Kontakt-Import.** Das Spezialfeld „Anrede + Vor- und Nachname (zusammen)" gab es bisher nur im Datentyp „Firma + Kontakt zusammen" (v2.4.4). Jetzt auch im reinen Kontakt-Import als `__full_name`. Beispiel: Spalte „Administrator" enthält „Herr Martin Bollwinkel" — Mapping auf das Feld → `_splitFullName` schält Anrede/Titel ab (`Herr/Frau/Dr./Prof./Dipl.-Ing.`), schreibt vorname=„Martin", nachname=„Bollwinkel". Wenn das Feld gemappt ist, sind `vorname/nachname` nicht mehr Pflicht. Validierungslogik in `runImport` greift den `contact`-Typ analog zum `company_contact`-Typ. Kein Schema-Change. |
| v2.4.4 | 08.05.2026 | **CSV-Import — „Firma + Kontakt zusammen" + Anrede-Splitting.** Neuer dritter Datentyp `company_contact` für Excel-Listen, die pro Zeile sowohl Firma- als auch Ansprechpartner-Daten enthalten. Mapping-Dropdown gruppiert die Felder per `<optgroup>` nach „Firma" und „Kontakt" (Helper erkennt `group`-Property in `IMPORT_FIELDS`). Import-Algorithmus `_runCompanyContactImport`: (1) bestehende Firmen aus DB cachen (Name → ID); (2) pro Zeile Firma upserten (find by name; sonst anlegen mit allen mapped Firma-Feldern); (3) Kontakt mit `company_id` anlegen. Mehrere Zeilen mit derselben Firma → Firma einmal angelegt, alle Kontakte verknüpft. Plus neues Spezialfeld `kontakt_anrede` für Spalten wie „Herr Martin Bollwinkel" — `_splitFullName` schält Anrede/Titel-Tokens ab (`Herr/Frau/Dr./Prof./Dipl.-Ing.`) und zerlegt den Rest in vorname (alles bis auf letztes Token) + nachname (letztes Token). Wenn die Anrede-Spalte gemappt ist, sind `kontakt_vorname/_nachname` nicht mehr Pflicht. Kein Schema-Change. |
| v2.4.3 | 08.05.2026 | **CSV-Auto-Encoding: Mac-Roman vs. Win-1252.** Auto-Detection fiel pauschal auf Windows-1252 zurück, wenn UTF-8 fehlschlug. Bei Excel-Mac-Exporten (Mac-Roman) ergab das `Stra§e` (0xA7), `Sch**Ÿ**tzenweg` (0x9F) statt `Straße`/`Schützenweg`. Neue Heuristik zählt typische deutsche Umlaut-Bytes für beide Encodings — Win-1252-Set: `0xE4 0xF6 0xFC 0xDF 0xC4 0xD6 0xDC` (ä/ö/ü/ß/Ä/Ö/Ü) vs. Mac-Roman-Set: `0x8A 0x9A 0x9F 0xA7 0x80 0x85 0x86` — wählt das Set mit mehr Treffern. Manueller Override im Dropdown bleibt für Sonderfälle. Kein Schema-Change. |
| v2.4.2 | 08.05.2026 | **CSV-Import — Mac-Newlines + Mac-Roman.** Zwei Bugs bei Excel-Mac-Exporten: (1) Datei mit Mac-Classic-Newlines (nur `\r`, kein `\n`) wurde als eine lange Zeile gelesen — der Parser ignorierte das einsame `\r`, also landeten alle Header und alle Datenwerte gemeinsam im Header-Array, das Mapping-UI zeigte 30+ vermeintliche „Spalten" mit Datenwerten dazwischen. Fix: Newline-Normalisierung vorab (`text.replace(/\r\n?/g, '\n')`). (2) Mac-Roman-Encoding wurde von der Auto-Erkennung als Windows-1252 dekodiert — die Mac-Roman-Position 0xA7 = ß wurde als § interpretiert (z.B. `Stra§e` statt `Straße`). Neue Option „Mac-Roman" im Encoding-Dropdown (TextDecoder akzeptiert das Label `macintosh`). Kein Schema-Change. |
| v2.4.1 | 08.05.2026 | **CSV-Import — Umlaute & Encoding-Auswahl.** Excel speichert „CSV (kommagetrennt)" auf deutschen Systemen meistens als Windows-1252 (nicht UTF-8) — damit zerschossen ä/ö/ü/ß beim UTF-8-Decode. Neuer Encoding-Selektor unter dem File-Input (Auto / UTF-8 / Windows-1252 / ISO-8859-1 / UTF-16 LE). Auto-Detection per BOM-Check (`EF BB BF` für UTF-8, `FF FE` für UTF-16 LE) plus UTF-8-Probe mit Replacement-Char-Heuristik (wenn `�` im UTF-8-Decode auftaucht → Fallback Windows-1252). BOM wird beim Decode abgeschnitten. Datei einmal als ArrayBuffer gehalten — Encoding-Wechsel decodiert ohne erneuten Upload. Meta-Zeile zeigt das erkannte Encoding und warnt deutlich bei verbleibenden `�`-Zeichen. Kein Schema-Change. |
| v2.4.0 | 08.05.2026 | **CSV-Import (Firmen + Kontakte).** Neue Page unter Einstellungen → Import (`#/import`). Vier-Schritte-Flow: (1) Datei wählen + Trennzeichen-Auto-Erkennung + Datentyp (Firma/Kontakt); (2) Spalten-Mapping als Tabelle (CSV-Header · Beispiel-Wert · Dropdown auf Zielfeld) — Auto-Vorschlag via Header-Aliasen (z.B. `firma`/`name`/`company` → `name`), User überschreibt frei; (3) Vorschau erste 5 Zeilen mit aktuellem Mapping; (4) Batch-Insert in Chunks von 100 mit einzelnem Retry bei Batch-Fehler, Fehler-Liste + Erfolgs-Counter. Konstante `IMPORT_FIELDS` definiert pro Entität die wählbaren Felder + Aliase + Required-Flag. RFC4180-konformer CSV-Parser inline (Quote-Escape per Doppel-Quote). Bei Kontakten: Spezialfeld `__company_name` wird per Lookup auf `company_id` gemappt — fehlende Firmen → Kontakt ohne Firma + Hinweis im Fehler-Report. Excel exportiert man einfach als CSV UTF-8. Kein Schema-Change. |
| v2.3.2 | 06.05.2026 | **Recently-Visited validieren + Listen-Tab-Counts proaktiv.** Nach dem Wipe (v2.3.1) zeigten „Zuletzt bearbeitet" (Arbeitsplatz) und „Zuletzt besucht" (Cmd+K) noch tote Items aus dem `localStorage`-Cache `cumart_recent_visits`. Helper `validateRecentEntries(list)` prüft pro Typ-Tabelle die IDs gegen die DB (`is('deleted_at', null).in('id', ids)`) und filtert tote raus; `renderArbeitsplatzRecent` und `renderRecentlyVisited` nutzen ihn jetzt und persistieren die bereinigte Liste zurück via `setRecentlyVisited`. Außerdem: Listen-Sub-Nav-Counts erschienen nur für den aktiven Tab (weil `setListenTabCount` nur vom jeweiligen Loader gerufen wird). Neuer Helper `loadAllListenTabCounts` zählt parallel alle 6 Tabellen mit `count: 'exact', head: true` und füllt alle Tab-Counts beim Wechsel in den Listen-Bereich. Kein Schema-Change. |
| v2.3.1 | 06.05.2026 | **Operative Daten geleert.** Wipe-Migration für den Übergang in den produktiven Betrieb — alle operativen Tabellen Hard-Delete in einer Transaktion (companies/contacts/projects/deployments/appointments/tasks/notes/memberships/entitlements/redemptions/themes/pins). Behalten: `user_profiles`, `roles`, `lookup_values`, `services`, `membership_programs`, `templates`. Migration `v2.3.1_wipe_operational.sql`. |
| v2.3.0 | 06.05.2026 | **Arbeitsplatz-Erweiterung: Pins + Inbox + Datenpflege.** Drei neue Sektionen oben auf dem Arbeitsplatz. (1) **ANGEHEFTET (Pins):** User pinnt Firmen/Projekte/Kontakte über ⭐ auf der Detail-Page (Pin-Button neben Bearbeiten); gepinnte Items erscheinen oben als kompakte Karten, Klick navigiert. Neue Tabelle `pins` (id, user_id, entity_type CHECK in company/project/contact, entity_id, created_at, UNIQUE(user_id,entity_type,entity_id)). RLS-Pattern wie sonst (PERMISSIVE all_authenticated + RESTRICTIVE only_active_users). Migration `v2.3.0_pins.sql`. Helper: `togglePin`, `isItemPinned`, `applyPinButtonState`, `loadPinsForCurrentUser`. (2) **DRANBLEIBEN (Inbox):** Aufgaben (überfällig + heute fällig) + Termine (heute + morgen) + durchgeführte aber nicht abgerechnete Einsätze, jeweils mit farb-codiertem Badge; Klick öffnet Modal/Detail. (3) **DATENPFLEGE:** Zähler in dashed-Pillen — Firmen ohne Adresse, durchgeführte Termine ohne Doku, durchgeführte/abgerechnete Einsätze ohne Bericht. Klick führt zur Liste. Sektion wird ausgeblendet, wenn alles sauber ist. Helper: `renderArbeitsplatzPins/Inbox/Care`. |
| v2.2.1 | 06.05.2026 | **Login-Landing auf Briefing-V2.** Beim frischen Login landete man auf `#/heute` — der alten v1.42-Dashboard-Page, die der Vorgänger des aktuellen Briefing-V2-Designs ist. Login + leere Hashes gehen jetzt auf `#/briefing`. Alte `#/heute`-Bookmarks werden im Hash-Router auf `#/briefing` umgelenkt. Kein Schema-Change. |
| v2.2.0 | 06.05.2026 | **Arbeitsplatz-Pack: Vorbereiten-Tiles + proaktive Bezugs-Vorschläge.** Drei neue Tiles unter „FORTFÜHREN" auf dem Arbeitsplatz: Termin vorbereiten / Einsatz vorbereiten / Projekt-Briefing starten. Jedes öffnet das Such-Overlay im Prepare-Mode (`_searchPrepareTyp`), das automatisch die nächsten 15 passenden Items lädt (geplante Termine/Einsätze, aktive Projekte mit Status Lead/Angebot/In Arbeit/Abschlussphase). Auswahl springt zur jeweiligen Detail-Page mit dem passenden Tab vorgewählt — neues Globalflag `_pendingDetailTab`, das `loadAppointmentDetail` / `loadDeploymentDetail` / `renderProjectDetail` statt ihrem Default-Tab aufgreifen. Tab-Mapping: Termin→`vorbereitung`, Einsatz→`planlogistik`, Projekt→`brief`. Tippen filtert die Liste clientside (Helper `loadPrepareSuggestions`, Konstante `PREPARE_LABELS`). Plus: Bezugs-Picker im Arbeitsplatz zeigt jetzt proaktive Vorschläge — wenn ein Bezug schon aktiv ist, lädt das Such-Overlay automatisch die Kontakte und Projekte der Anker-Firma (Helper `loadAnchoredSuggestions`); ohne Anker bleiben die zuletzt besuchten Items. Kein Tippen mehr nötig, um den nächsten Bezug zu wählen. Kein Schema-Change. |
| v2.1.4 | 06.05.2026 | **Drawer-Section-Header stärker hervorgehoben + Notiz-Direct-Insert.** UI-Klage: in den Anlage-Drawern (alle 6 Entitäten) sahen Section-Header (WAS / WANN / KONTEXT / NOTIZEN) wie normale Field-Labels aus — alles 11px/muted. Hierarchie-Verlust. Fix in `.drawer__section-label`: 13px/700/uppercase, dunkler Text statt muted, kleiner farbiger Punkt davor, Trennlinie drunter, plus subtil alternierender Hintergrund pro Sektion (`color-mix`). Außerdem: Arbeitsplatz-Kachel „+ Notiz" zeigt nicht mehr nur einen Hinweis-Toast, sondern legt direkt eine Notiz in `notes` an, wenn Capture-Text getippt + min. ein Bezug gesetzt ist; alle aktiven Bezüge (Firma/Projekt/Kontakt) wandern in den Insert. Kein Schema-Change. |
| v2.1.3 | 06.05.2026 | **Anfahrt-Default vollständige Adresse.** `loadDeploymentDetail` zog von der Firma nur `name/abc/stadt`, also schrieb `formatCompanyAddress` nur die Stadt als Anfahrt-Default. SELECT um `strasse/plz/land` erweitert. |
| v2.1.2 | 06.05.2026 | **Kontext-Icons im Stream + Modal-Ort-Auto-Fill, Bullets wieder weg.** Drei Punkte: (1) Activity-Stream-Eingabe auf Firma/Kontakt/Projekt: die „+ Folgetermin / + Aufgabe"-Pillen sind raus — stattdessen vier kleine Kontext-Icons 📞 / ✉️ / 🤝 / 💬, die per Klick `Call: ` / `Mail: ` / `Meeting: ` / `Chat: ` als Prefix in den Input schreiben (Helper `setNoteContext(inputId, prefix)`). Anlegen-Pfade gehen weiter über die Sidepanel-Aktionen, die seit v2.1.0 den Notiz-Text als Modal-Titel ziehen — kein Funktionsverlust. (2) Termin-/Einsatz-Modal: Ort-Feld bekommt beim Firma-Prefill (z.B. via FAB aus Firmen-Detail) und beim manuellen Firma-Wechsel automatisch die Firmenadresse als Default. Im Termin-Modal entfällt der `Vor Ort`-Typ-Check — User kann die Adresse löschen wenn nicht relevant. (3) Die Bullet-Default-Pre-Fills (`• `) für Vorbereitung/Teilnehmer aus v2.1.1 sind wieder weg, weil sie nichts bringen. Anfahrt-Default mit Firmenadresse (v2.1.1) bleibt. Kein Schema-Change. |
| v2.1.1 | 06.05.2026 | **Vorbefüllte Felder im Plan/Vorbereitung-Tab.** Damit der User direkt loslegen kann statt erst Formatierung zu setzen oder die Adresse zu kopieren: `dep-plan-vorbereitung` und `dep-plan-teilnehmer` (Einsatz-Detail) sowie `appt-vorbereitung` (Termin-Detail) starten beim Laden mit `• ` als Default, wenn das Feld leer ist. `dep-plan-anfahrt` startet mit der Firmenadresse (Helper `formatCompanyAddress(c)` formatiert Strasse/PLZ/Stadt/Land). `saveAppointmentDokuField` / `saveDeploymentDokuField` erkennen einen reinen Bullet-Trim (`'•'`) und persistieren leer statt phantom-Inhalt — der nächste Aufruf zeigt den Default wieder an. Kein Schema-Change. |
| v2.1.0 | 06.05.2026 | **Activity-Stream-UX-Pack — vier Reibungs-Fixes.** (1) **Notiz-Text als Modal-Titel:** Sidepanel-Aktionen (+ Termin / + Aufgabe / + Einsatz / + Projekt) auf Firma/Kontakt/Projekt übernehmen schon getippten Notiz-Stream-Text als Modal-Titel; Notiz-Input wird beim Klick geleert. Helper `openModalWithNoteAsTitle(noteInputId, openerFn, titleFieldId)`. (2) **Esc schließt Modale:** Lookup-Map `MODAL_CLOSERS` mappt 17 Modal-IDs auf ihre close-Funktionen — der globale Escape-Handler schließt das oberste offene Modal sauber (mit Reset der editing<X>-IDs, kein Stale-State). (3) **Bevorstehend / Geschehen:** Activity-Stream auf Firma/Kontakt/Projekt teilt items in zwei Sektionen — Datum >= heute oben (aufsteigend, „Bevorstehend"), Datum < heute unten (absteigend, „Geschehen"). Helper `renderActivityStreamSections` / `_splitActivities`, CSS `.activity-section-header`. (4) **Klickbare Titel:** Termin/Einsatz-Titel im Stream springen zur Detail-Page, Aufgabe-Titel öffnet das Aufgabe-Modal (edit), Notiz-Titel öffnet neues `modal-notiz` (Edit-Modal mit Textarea + Speichern + Löschen — `openNotizModal` / `saveNotizFromModal` / `deleteNotizFromModal`; `notes` hat kein Soft-Delete, also echter DELETE). Kein Schema-Change. |
| v2.0.9 | 06.05.2026 | **Detail-Page-Buttons defensiv verdrahten — Render-Abbruch behoben.** Beim Page-Render setzten `renderCompanyDetail` / `renderContactDetail` / `renderProjectDetail` Onclick-Handler auf IDs, die im V2-HTML teils nicht mehr existieren (z.B. `contact-detail-add-appointment-btn`). `document.getElementById('…').onclick = …` warf TypeError, der gesamte Render-Pfad brach ab — V2-Hero blieb mit „—" stehen, AKTIONEN-Sidebar war nicht verdrahtet (Klick tat nichts), Stammdaten-Dashboard zeigte ewig „Lade …", Sidepanel-Firma stand auf „Ohne Firma" obwohl die Firma im Datensatz war. Fix: kleiner Helper `wire(id, handler)` in jedem `renderXDetail`, der per `if (el) el.onclick = …` null-checkt. Damit überleben fehlende Buttons den Render. Kein Schema-Change. |
| v2.0.8 | 06.05.2026 | **Schnelleingabe-Pillen auf Firma + Kontakt + NaN-Date-Fix.** Die Quick-Input-Pillen „Notiz / + Folgetermin / + Aufgabe" über dem Activity-Stream gab es bisher nur im Projekt-Detail. Jetzt parallel auf Firma- und Kontakt-Detail: Pille wählen, Titel im Inputfeld, ⌘↵ öffnet das passende Modal mit `company_id` bzw. `contact_id` vorbelegt und dem Inputtext als Titel. Neue Helper `setCompanyQuickInputType` / `postCompanyQuickInput` / `setContactQuickInputType` / `postContactQuickInput`. Onkeydown-Handler in `index.html` von `postXNote` auf `postXQuickInput` umgestellt; das `⌘↵`-Hint ist jetzt ein Button, damit auch Klick speichert. **Bugfix:** `formatDateCompact` / `formatDateDE` warfen bei Timestamp-Werten (wie `tasks.erledigt_am` aus DB) Invalid Date — `parseLocalDate` splittet auf `-` und kriegt `28T14:30:00Z` als Tag. Resultat im Activity-Stream bei erledigten Aufgaben: „Erledigt undefined NaN.NaN.N". Beide Funktionen nehmen jetzt nur die ersten 10 Zeichen (Datums-Teil) und prüfen `isNaN(d.getTime())`. Kein Schema-Change. |
| v2.0.7 | 04.05.2026 | **Note-Handler — preventDefault + Strg+Enter.** Audit-Befund nach v2.0.6: `company-note-input` und `contact-note-input` riefen `postXNote()` ohne `preventDefault`/`stopPropagation` — auf macOS klappte Cmd+Enter, auf Windows/Linux funktionierte das Shortcut nicht (kein metaKey). Inline-Handler analog zum sauberen Project-Pattern: `(metaKey \|\| ctrlKey) && Enter`, plus `preventDefault` + `stopPropagation`. |
| v2.0.6 | 04.05.2026 | **Race-Fix Detail-Pages.** Ohne Guard liefen `loadCompanyDetail` & Co. ohne Cancellation — beim schnellen Wechsel von Firma A nach B kam A's Promise-Kette nach B's zurück und überschrieb das DOM mit A's Daten. Nutzer sahen Aufgaben/Termine der falschen Firma. Fix: neuer Helper `isStillOnDetail(entityType, id)` vergleicht beim DOM-Update die übergebene ID mit `currentXDetailId` und returnt früh bei Mismatch. Eingebaut in alle 17 kritischen Sub-Loader (3 Activity-Streams, 3 Tasks-Loader, 2 Appointments-Loader, 2 Deployments-Loader, Contacts/Projects/Memberships/Company-Dashboard/Project-Dashboard). Kein Schema-Change. |
| v2.0.5 | 04.05.2026 | **Notes-Bugfix.** `notes.titel` war seit Anlage `NOT NULL`, aber `postCompanyNote` / `postProjectNote` (eingeführt mit v2.0.0) setzen beim Insert nur `inhalt`/`company_id`/`project_id`/`erstellt_von` — der Titel ist in der Stream-UI gar nicht vorgesehen. Daher schlug jeder Cmd+Enter-Notiz-Insert mit NOT-NULL-Violation fehl, der Fehler kam nur per Toast und blieb meist unbemerkt. Fix: Migration `v2.0.5_notes_titel_nullable.sql` macht `titel` nullable. UI-Code unverändert. |
| v2.0.4 | 04.05.2026 | **Detail-Page Speed.** Sub-Sektionen der Detail-Pages laufen parallel statt seriell. `loadCompanyDetail` bündelt `renderCompanyV2Layout` + Kontakte/Termine/Projekte/Einsätze/Mitgliedschaften/Aufgaben in einem `Promise.all` (vorher 7 sequenzielle awaits, ~120 ms × 7 ≈ 840 ms reine Latenz; jetzt limitiert durch die langsamste Query). `loadProjectDetail` parallelisiert `loadProjektStatus` mit der Haupt-SELECT-Query und bündelt die drei Sub-Loader (Termine/Einsätze/Aufgaben). `loadContactDetail` zieht `loadProjektStatus` einmal zuerst (gecached) und packt `renderContactV2Layout` mit in den Promise-Block — der race-condition-Workaround (zweites `loadContactProjects` am Ende) entfällt. `renderWorkflowChecklist` (v2.0.3) bekommt einen optionalen `prefetchedState`-Parameter; die drei Detail-Loader reichen `data.workflow_state` aus dem SELECT * direkt durch, statt einen extra Roundtrip zu machen — spart 1 Query pro Page-Load. Erwartete Wartezeit-Reduktion: ~50 % auf den Detail-Pages. Kein Schema-Change. |
| v2.0.3 | 04.05.2026 | **Workflow-Checklisten (Punkt 9 des UX-Refactors).** Pro Detail-Page eine Schritt-für-Schritt-Checkliste mit Hero-Pille beim vollständigen Abhaken: Termin → „✓ Vorbereitet" (anfahrt/teilnehmer/unterlagen/agenda), Einsatz → „✓ Dokumentiert" (themen/teilnehmer/erkenntnisse/folgemassnahmen/status_done), Projekt → „✓ Vorbereitet" (ziel/erfolgskriterien/themen/aktivitaeten). State in neuer jsonb-Spalte `workflow_state` (DEFAULT `{}`) auf `appointments`/`deployments`/`projects`; Schritt-Definitionen hartcodiert in `WORKFLOW_STEPS` weil eng an UI-Texte gekoppelt. Pill rendert beim Laden der Detail-Page sofort (auch ohne Tab-Wechsel sichtbar), Checklist im Tab lazy beim Switch. Helper: `renderWorkflowChecklist`, `_loadWorkflowState`, `_saveWorkflowStep`, `onWorkflowStepToggle`. Aufgaben bleiben außen vor (offen↔erledigt-Modell reicht). Migration `migrations/v2.0.3_workflow_state.sql`. |
| v2.0.2 | 30.04.2026 | **Drawer-Refactor + Action-Items-Fix.** Alle 6 Anlage-Modale (Firma, Kontakt, Termin, Einsatz, Projekt, Aufgabe) als Right-Side-Drawer statt Center-Modal, einheitliches Verhalten + Smart-Capture-Filter. Bugfix: Action Items am Einsatz werden jetzt korrekt mit `deployment_id` verknüpft. Pilot des Drawer-Systems begann mit Kontakt-Modal, dann komplette Migration. |
| v2.0.1 | 29.04.2026 | **UX-Feinschliff.** Bugs aus v2.0.0, klickbare Listen-Zeilen (Titel-Klick → Detail-Page), Schnelleingabe-Pillen für Status/Typ in den Anlage-Modals, Kalender-Bar unter Briefing eingebettet (vorher überall). |
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
| v1.21.0 | 22.04.2026  | FAB Quick-Add — schwebender `+`-Button unten rechts mit Popover-Menü (Neue Firma / Kontakt / Termin / Einsatz / Projekt). Kontext-Aware Prefill aus Firmen-/Projekt-/Kontakt-Detail. Shortcut `n` wenn kein Input fokussiert. |
| v1.22.0 | 23.04.2026  | Aufgaben — neue Entität `tasks` mit eigener Liste, Modal, Sub-Sektionen auf Firma/Kontakt/Projekt. Zuweisbar an `user_profiles.id` (self oder anderer Nutzer). Fälligkeit + überfällig-Badge. Checkbox-Toggle in Liste (→ erledigt). Sidebar-Badge „meine offenen" mit Rotfärbung bei Überfälligkeit. FAB-Eintrag + Soft-Delete + Undo-Toast. Status via `lookup_values.aufgabe_status`. |
| v1.23.0 | 24.04.2026  | Nav-Restruktur (3 Gruppen Kunden/Aktivität/Projekte) + Detail-Tabs. In v1.24 teilweise zurückgenommen: Sidebar wieder flach, Detail-Tabs bleiben. |
| v1.24.0 | 24.04.2026  | Stammdaten-Dashboard + ABC-Klassifizierung — Sidebar zurück auf flach (User-Feedback: Gruppen waren ein extra Klick). Neues Feld `companies.abc_klassifizierung` (A/B/C, CHECK) mit farbigen Badges (grün/gelb/grau). Firma-Stammdaten-Tab komplett neu als Dashboard-Layout: Stats-Row (ABC · Gesamtumsatz · Offene Aufgaben, rot bei überfällig), Letzte Aktivität, Kontaktdaten, Inline-editierbare Notizen (auto-save on blur). Rechts ein sticky Quick-Create-Panel mit allen „+"-Aktionen für diesen Kunden direkt. Kontakt-Stammdaten analog mit geerbter ABC und reduziertem Quick-Create. |
| v1.25.0 | 24.04.2026  | Stammdaten-Dashboard v2 — Umsatz-Card zeigt Kalenderjahr-Umsatz (Hauptzahl) + Historie-Subline statt eines einzigen Gesamtbetrags. Auto-ABC nach Kalenderjahr-Umsatz (≥10k=A · ≥2k=B · sonst C); manuelle Klassifizierung bleibt Vorrang; ABC-Card ist jetzt klickbar und öffnet ein kompaktes Edit-Popover (A/B/C/Auto). Aktivitäts-Zeile 2-spaltig: „Letzte Aktivität" neben neuer Card „Bevorstehend" (nächste geplante Termine + Einsätze). Neues Widget Opportunities (Projekte in Status Lead/Angebot, nach Enddatum aufsteigend). Neues Schnellaktionen-Modal pro Firma mit Ein-Klick-Prefill-Kacheln für häufige Folgeleistungen (setzt `_pendingDeploymentPrefillServiceId` für Einsatz-Modal). Im Termin-Modal Datum-Schnellauswahl (heute/morgen/+3/+7/nächster Montag). Kein Schema-Change. |
| v1.26.0 | 24.04.2026  | Kontakt-Dashboard-Parität — Kontakt-Stammdaten-Tab zeigt dieselbe Dashboard-Struktur wie Firma: Umsatz-Card spiegelt den Kalenderjahr-Umsatz der zugeordneten Firma (Label „Umsatz {Firma} · {YEAR}", Klick navigiert zur Firma), ABC-Card ist klickbar und öffnet das ABC-Edit-Popover der Firma (Kontakt bleibt Readonly-Spiegel, aber Edit geht direkt über den Kontakt-Screen; `setCompanyAbc` refresht das Kontakt-Detail automatisch). Bevorstehend-Card mischt geplante Kontakt-Termine mit geplanten Einsätzen der Firma; Letzte Aktivität analog. Neues Opportunities-Widget für Projekte, in denen der Kontakt **Hauptkontakt** ist und Status Lead/Angebot haben. Schnellaktionen-Button im Quick-Create-Panel öffnet das bestehende Quick-Actions-Modal mit Firma-Kontext (bei Kontakt ohne Firma: `disabled`). ABC-Renderer generalisiert (`renderAbcBadgeIn`) — Firma + Kontakt teilen dieselbe Badge/Label/Modus-Logik. Kein Schema-Change. |
| v1.27.0 | 24.04.2026  | Inline-Expand-Row-Dashboard für Termine — Klick auf einen Termin-Titel in einer Liste klappt direkt darunter ein Detail-Dashboard auf: Stats (Status, Typ, Datum mit vergangen/heute/kommend-Label, Uhrzeit, ABC der Firma, gekoppelter Einsatz), Kontext (Firma/Kontakt/Projekt/Ort/Notizen), letzte 3 Termine derselben Firma, offene Aufgaben im Kontext, Schnellaktionen: als durchgeführt markieren · Folge-Termin (+1 Woche, Prefill Firma/Kontakt/Typ/Ort) · Aufgabe aus Termin · Einsatz aus Termin (mit Datum/Uhrzeit/Ort-Übernahme) · Vollbearbeitung. Nur eine Zeile gleichzeitig aufklappbar app-weit; Mobile (<600 px) fällt automatisch auf das Bearbeiten-Modal zurück. Wirkt in allen 4 Termin-Listen (Haupt, Firma-Tab, Kontakt-Tab, Projekt-Tab). Shared Infrastruktur `toggleRowExpand` / `closeExpandedRow` / `renderAppointmentExpandedRow` — wiederverwendbar für Einsatz v1.28 und Aufgabe v1.29. Kein Schema-Change. |
| v1.27.1 | 24.04.2026  | Auto-Expand bei genau einem Termin — Wenn in einem Detail-Tab (Firma/Kontakt/Projekt → Termine) nur ein einziger Termin angezeigt wird, klappt das Dashboard direkt nach dem Rendern automatisch auf. Greift nicht in der globalen Haupt-Liste und nicht auf Mobile. Helper `autoExpandSingleAppointmentRow(tbody, items)`. |
| v1.28.0 | 24.04.2026  | Einsatz-Inline-Expand-Dashboard — Klick auf einen Einsatz-Titel klappt darunter das Detail-Dashboard auf. Stats (Status, Wert bzw. Aufwand bei Projekt-Zugehörigkeit, Datum/Zeitraum, ABC der Firma, Projekt-Verknüpfung, gekoppelter Termin, Bonus-Einlösung), Kontext (Firma · Leistung · Techniker intern+extern · Uhrzeit · Menge×Preis · Ort · Notizen), Projekt-Kontext mit Soll/Ist-Marge wenn im Projekt, Historie der letzten 3 Einsätze derselben Firma. Schnellaktionen: als durchgeführt (aus Geplant) · als abgerechnet (aus Durchgeführt) · duplizieren · Folge-Einsatz (Prefill Firma/Projekt/Service/Ort/Titel, Datum leer) · Vollbearbeitung. Wirkt in allen 3 Einsatz-Listen (Haupt, Firma-Tab, Projekt-Tab). Auto-Expand bei genau einem Einsatz in den Detail-Tabs. Shared Helper `autoExpandSingleRow(tbody, entityType, items)` ersetzt die Appointment-spezifische Variante. Kein Schema-Change. |
| v1.29.0 | 24.04.2026  | Aufgabe-Inline-Expand-Dashboard — Damit haben Termin/Einsatz/Aufgabe app-weit dieselbe Klick-Interaktion. Aufgabe-Dashboard: Stats (Status · Fälligkeit mit Tage-bis/überfällig/heute-Label · Zuständiger mit „(mir)"-Hint), Kontext (Firma/Kontakt/Projekt/Beschreibung/Notizen), verwandte offene Aufgaben (selbe Firma ODER selber Zuständiger, max 3). Schnellaktionen: erledigen · wieder öffnen · Fälligkeit +7 Tage · mir zuweisen · Folge-Aufgabe · Vollbearbeitung. Wirkt in allen 4 Aufgaben-Listen. Kein Schema-Change. |
| v1.30.0 | 24.04.2026  | Projekt-Dashboard-Parität — Schließt die letzte Lücke in der Dashboard-Vereinheitlichung. Projekt-Stammdaten-Tab bekommt dasselbe Layout wie Firma/Kontakt: 4 Stats-Cards (Status · Wirtschaftlichkeit mit Marge/Überziehung farbig · Zeitplan mit Tage-bis/überzogen/abgeschlossen · Offene Aufgaben mit rot bei überfällig), 2-spaltige Aktivitäts-Zeile „Letzte Aktivität" neben „Bevorstehend", inline-editierbare Beschreibung + Notizen (auto-save on blur), Quick-Create-Panel rechts für + Termin · + Einsatz · + Aufgabe. Kein ABC und keine Opportunities — ABC lebt an der Firma, ein Projekt ist fachlich schon selbst die Opportunity. Neue Funktionen `loadProjectDashboard(p)`, `saveProjectBeschreibungInline`, `saveProjectNotizenInline`. Kein Schema-Change. |
| v1.30.1 | 24.04.2026  | Fix v1.30.0 — `loadProjectDetail` referenzierte beim Init noch die in v1.30.0 entfernten HTML-Elemente `project-detail-beschreibung-wrap` / `-notizen-wrap` und warf TypeError, wodurch die Render-Kette abbrach. Zwei tote Zeilen entfernt. |
| v1.31.0 | 24.04.2026  | Dreifach-Paket: Sidebar-Reihenfolge umsortiert (Firmen · Kontakte · Projekte · Termine · Einsätze · Aufgaben), Einsatz-Dashboard bleibt offen bei „durchgeführt"/„abgerechnet" via `preserveExpandedRowAcross(fn)`, Verwandte Aufgaben im Dashboard auf Firma/Kontakt umgestellt mit Kunden-Label vor dem Status. |
| v1.32.0 | 24.04.2026  | Kalender-Bar — Permanenter Monats-Zeitstrahl am unteren Rand (Desktop ab 900 px) mit Mitarbeiter-Auswahl, Farbcode frei/Termin/Einsatz/Feiertag (BW, Gauß-Osterformel), ⚠-Warnung bei Einsatz-an-Feiertag, Klick-Popover mit Event-Liste. |
| v1.32.1 | 24.04.2026  | FAB (Plus-Button) auf `bottom: 130 px` hochgezogen, damit er nicht mehr von der Kalender-Bar verdeckt wird. FAB-Menü mit. |
| v1.33.0 | 24.04.2026  | Fünferpack Usability: Kontakt-Label-Vorrang in Verwandte-Aufgaben, Plus-Menü im Kalender-Popover, Werktage-basierte Auto-Menge im Einsatz, erweiterte Datum-Schnellauswahl (Werktage + 3 Monats-Buttons, generischer Helper), Ganztags-Checkbox (08:00–16:00). |
| v1.34.0 | 24.04.2026  | Termin-Typ-Icons + erster Modal-Redesign-Wurf: Icon-Picker im Termin-Modal (Call 📞/Meeting 🤝/Schulung 🎓/…), Icons vor Titel in Listen + Kalender-Popover. Optional-Sektionen der Modals kollabiert. |
| v1.35.1 | 24.04.2026  | Design-Harmonisierung der Kanban-Modals: Sektions-Header (Kanban-Spalten + Footer-Gruppen) teilen Typo/Größe/Padding; Inputs+Selects+Date 36 px einheitlich, Icons 14 px, Labels 12 px muted, Date-Shortcut- und Typ-Icon-Buttons 26 px. Symmetrie zwischen Termin/Einsatz/Aufgabe. |
| v1.36–v1.41 | 24.04.2026  | Modal-Vereinheitlichung: alle acht Anlege-Modals folgen demselben 3-Spalten-Preview-Layout mit Live-Preview-Card links, Stammdaten mittig, Zugehörigkeiten rechts. Plus globale Top-Header-Suche, Cumart-Logo in der Sidebar. |
| v1.40.0 | 24.04.2026  | Aufgabe↔Termin-Kopplung. Schema: `appointments.task_id` (FK + Index). Aufgabe-Modal-Footer mit Checkbox „Auch als Termin im Kalender". Sync analog Einsatz-Termin-Kopplung. Kalender-Icon in Listen wenn Termin gekoppelt bzw. Einsatz mit `datum_von`. |
| v1.42.0 | 24.04.2026  | Dein Tag — Briefing-Dashboard als Login-Landing. Drei Tabs Heute/Woche/Monat, narratives Layout (Begrüßung mit Slot-Filling), KPI-Mini-Leiste, Briefing-Cards (Hot/Opp/Gap/Good), Streak-Bar, Vorschau. Login-Flow auf `#/heute`. Phase 1 ohne AI: regelbasierte Lückenfinder. |
| v1.43.0 | 24.04.2026  | Vier UX-Verbesserungen: (1) Kalender-Quick-Create-Einsatz trägt aktuellen User automatisch als Techniker ein, (2) Quick-Create-Mini-Modale für Firma + Kontakt mit Plus-Buttons neben Dropdowns, (3) Briefing-Card „Datenpflege" zählt unvollständige Datensätze, (4) „Alle Mitarbeiter"-Option im Kalender-Bar-Dropdown. |
| v1.44.0 | 24.04.2026  | Einsatz-Hero im Heute-Dashboard. Wenn an einem Tag ein Einsatz ansteht, ersetzt ein prominenter Hero-Block oben die KPI-Leiste: großer Firmenname, Stat-Grid mit Zeitraum/Tagessatz/Standort/Team, grüner Akzent (gelb bei In Arbeit, grau bei Durchgeführt). Begründung: ein Einsatz ist die einzige direkt umsatzbringende Tätigkeit und soll an Vor-Ort-Tagen alles andere visuell schlagen. KPIs werden kompakter zur Einordnung darunter, restliche Briefing-Cards bleiben sekundär. Aktion „Als durchgeführt markieren" direkt im Hero ohne Modal-Umweg via `markDeploymentDone(id)`. Ohne Einsatz heute: aktuelles Layout (Bürotag-Modus). Neue Funktion `renderBriefingHeroDeployment(dep, allTodayDeps, data)`, neue Daten-Anreicherung `todayDepTechniciansMap` in `loadBriefingData`. Kein Schema-Change. |
| v1.44.x–v1.45.6 | 24.–25.04.2026 | Iterationen am Tag-Dashboard: Wochen-Strip Mo–Fr / Mo–So mit Σ €, Aufgaben-Aside, Kombobox statt Select+Plus für Firma/Kontakt, Einsatz-Hero im Heute, Karten-Grid mit Jetzt-Marker, KPI-Inline-Leiste, Datendichte-Block im Monat (KPIs · Verlaufschart mit Ziel-Linie · Top-Kunden · Pipeline-Stages), Monat-Tab rollenbasiert (Technik / Vertrieb / Beides) mit Sicht-Toggle aus `user_profiles.roles` und localStorage-Persistenz. |
| v2.0.0 | 29.04.2026 | **Komplett-Redesign — Drei-Bereiche-Architektur + Vier-Zonen-Detail-Pages, alle Phasen 0-9 live.** Briefing als Section-Layout (HEUTE/DIESE WOCHE/DIESER MONAT scrollbar in einer Page) mit Hero-Einsatz-Card, KPI-Mini-Bar, Sidebar (Überfällig/Heute fällig/Datenpflege), 7-Tage-Wochen-Strip, Upcoming-Liste, 4 Month-KPIs, Verlaufschart, Top-Kunden + Pipeline-Stages. Arbeitsplatz mit Smart-Capture-Hero + Kontext-Bar (Kontext bleibt für mehrere Anlagen) + 8 Anlage-Kacheln + Zuletzt-bearbeitet + Heute-von-Dir + Vorlagen-Streifen. Listen mit Sub-Nav für 6 Entitäten + Filter-reaktive Tab-Counts. Detail-Pages für Firma/Kontakt/Projekt/Einsatz/Termin im Vier-Zonen-Frame (Hero mit drei Metriken / Tabs mit Aktivitäten als Default / Sidepanel mit Beteiligte/Aktionen/Meta). Activity-Streams aggregieren Termine/Einsätze/Aufgaben/Notizen aus 4 Tabellen clientside. Brief-Tab im Projekt mit Erfolgskriterien-Checkboxen (eigene Tabelle `project_success_criteria`), Themen-CRUD, Entwicklungs-Log auto-synthetisiert aus Einsatz-`log_eintrag`/`erkenntnisse`. Einsatz-Bericht-Tab mit Themen-Tag-Picker (M:N gegen Projekt-Themen), Action Items als Aufgaben mit `deployment_id`. Inline-Expand-Dashboards (v1.27-29) abgelöst — Klick auf Termin/Einsatz öffnet Detail-Page, Klick auf Aufgabe öffnet Modal. FAB schlanker (4 Aktionen + „Mehr im Arbeitsplatz"-Bridge mit Kontext-Übergabe). Mobile-Bottom-Nav auf Briefing/Arbeitsplatz/Listen/Mehr. Top-Nav mit Logo + 3 Bereichen + Suche/Zahnrad/Avatar; alte Sidebar entfernt. Migration `migrations/v2.0.0-pre.1_redesign_data.sql` mit `project_success_criteria` + `tasks.deployment_id` + Themen-Farb-Palette-Mapping. Backup: Tag `v1.53.0` + Branch `backup/pre-v2-redesign`. |
| v2.0.0-pre.0…7 | 29.04.2026 | **Komplett-Redesign in Phasen — Drei-Bereiche-Architektur + Vier-Zonen-Detail-Pages.** (1) Foundation: neue warm-cremiges Design-Token-System (8er-Themen-Pastell-Palette, Typ-Pillen für Activity-Stream, Border 0.5 px Default), Top-Navigation mit Briefing · Arbeitsplatz · Listen + Suche/Zahnrad/Avatar (alte Sidebar entfernt, Mobile bleibt parallel), Hash-Router um `/briefing`, `/arbeitsplatz`, `/listen`, `/einstellungen`, `/einsatz/:id`. (2) Migrationen: `project_success_criteria` (id/project_id/text/ist_erreicht/erreicht_am/erreicht_von/reihenfolge/deleted_at) + RLS-Pattern, `tasks.deployment_id` (FK SET NULL für Action-Items im Einsatz-Bericht), `project_themes.farbe` per RGB-Distanz auf 8er-Palette gemappt. (3) Listen-Sub-Nav als sticky Tab-Bar. (4) Briefing-V2: Tabs Heute/Woche/Monat, dynamischer Eröffnungssatz je Tageskontext, KPI-Tiles, Side-Cards Inbox/Überfällig/Heute-fällig mit Inline-`markTaskDoneInline`. (5) Arbeitsplatz: Smart-Capture-Hero (Phase-1 ohne NLP, Capture-Text → Modal-Titel-Vorbelegung), Kontext-Bar mit Such-Picker (`_arbeitsplatzContextPickerActive`), 8 Anlage-Kacheln, Zuletzt-Bearbeitet aus localStorage, Heute-von-Dir aus 4 Tabellen aggregiert, Vorlagen-Streifen. (6) Einstellungen-Sub-Nav für 5 Admin-Pages. (7) Projekt-Detail-Pilot Vier-Zonen-Muster: Hero (Marge / Zeitplan-Pille / Health-Punkte), Tabs Aktivitäten (Default — Filter-Pillen + Notiz-Eingabe + chronologischer Activity-Stream aus appointments/deployments/tasks/notes) · Brief (Ziel + Erfolgskriterien-Checkboxen + Herausforderungen/Lösungsansatz + Themen + Entwicklungs-Log aus Einsatz-`log_eintrag`/`erkenntnisse`) · Wirtschaftlichkeit (Einsatz-Liste mit Soll/Ist) · Plan&Lieferobjekte (Termine + Aufgaben). Sidepanel mit Beteiligte/Firma/Aktionen/Meta. `postProjectNote` schreibt in reaktivierte `notes`-Tabelle. (8) Einsatz-Detail-Page mit eigener Route — Hero (Datum/Honorar/Leistung), Tabs Bericht (Themen-Tag-Picker M:N gegen Projekt-Themen + Was-wurde-gemacht + Erkenntnisse + Log-Eintrag + Action Items als Aufgaben mit deployment_id) · Plan&Logistik (Vorbereitung/Teilnehmer/Anfahrt) · Abrechnung. Sidepanel: Projekt + Firma + Aktionen ("Bericht abschließen" primary). Helper: `loadDeploymentDetail`, `switchDeploymentV2Tab`, `renderDeploymentReportThemes`, `renderDeploymentActionItems`, `renderProjectV2Layout`, `loadProjectActivityStream`, `filterProjectActivity`, `postProjectNote`, `renderProjectBriefTab`, `saveProjectBriefField`, `renderProjectSuccessCriteria`, `renderProjectDevelopmentLog`. **Phase 8 (Firma/Kontakt-Detail Vier-Zonen-Übertragung) und Phase 9 (Polish, Mobile, Cleanup) folgen nach Validierung.** Migrationen: `migrations/v2.0.0-pre.1_redesign_data.sql`. Backup: Tag `v1.53.0` + Branch `backup/pre-v2-redesign`. |
| v1.53.0 | 29.04.2026  | **Themen als echte M:N-Strukturdaten (Phase A des Master-Plan v2.1).** Neue Tabelle `project_themes` (id, project_id FK CASCADE, name, beschreibung, status, owner_id FK SET NULL, farbe, reihenfolge, created_at, deleted_at) und Junction `deployment_themes` (deployment_id FK CASCADE, theme_id FK CASCADE, created_at, PK composite). RLS-Pattern (PERMISSIVE all_authenticated + RESTRICTIVE only_active_users). Status-Werte über `lookup_values.theme_status` admin-pflegbar (offen / in_arbeit / abgeschlossen seeded), keine CHECK-Constraints. Themen-Sektion im Projekt-Stammdaten-Tab zwischen Beschreibung und Dokumentation — Liste mit Status-Pille, Owner-Avatar, Anzahl verknüpfter Einsätze, „+ Thema"-Button öffnet CRUD-Modal (Präfix `th-*`). Theme-Picker im Einsatz-Modal als Multi-Select-Pillen, zeigt nur Themen des verknüpften Projekts; bei keinem Projekt: Hinweis statt Picker. Confirm-Dialog beim Projekt-Wechsel eines Einsatzes mit bestehenden Theme-Zuordnungen — bei OK werden die Junctions gelöscht (keine Auto-Übernahme, weil Themen kontext-spezifisch). Best-Effort-Migration: `dokumentation.themenwahl`-Freitext per Newline/Bullet/Semikolon-Split → `project_themes`; `dokumentation.durchgefuehrte_themen` per case-insensitivem Match gegen Projekt-Themen → `deployment_themes`. Originale bleiben im JSONB als Backup. Hinweis-Banner im Stammdaten-Tab nach Migration, dismissible via localStorage. Migration `migrations/v1.53.0_themes.sql`. |
| v1.52.0 | 29.04.2026  | **Strukturierte Dokumentation für Projekt / Termin / Einsatz.** Neue Spalte `dokumentation jsonb DEFAULT '{}'::jsonb` auf `projects`, `appointments`, `deployments`. Daten-Migration: bestehender `notizen`-Inhalt wandert nach `dokumentation.anmerkungen` (idempotent über `COALESCE(...->>'anmerkungen', '') = ''`-Filter). Pro Entitätstyp festes Feld-Schema in `DOCUMENTATION_SCHEMAS` (Projekt: kundenherausforderung/loesungsansatz/themenwahl/erfolgskriterien/anmerkungen; Termin: gespraechsinhalt/vereinbarungen/naechste_schritte/anmerkungen; Einsatz: durchgefuehrte_themen/teilnehmer/erkenntnisse/folge_massnahmen/anmerkungen). Render-Helfer `renderDocumentationBlock(entityType, dokData, options)` rendert Textareas mit auto-saved-value-Tracking. Im Projekt-Stammdaten-Tab als Inline-Block (Auto-Save on Blur via `saveDocumentationFieldInline`, JSONB-Update direkt). In Termin/Einsatz-Modalen als kollabierbarer Bereich; beim Save liest `readDocumentationFromDom(entityType, idPrefix)` die Werte und packt sie ins Payload. `notizen`-Spalte bleibt als historischer Backup erhalten — neue Saves schreiben aber nur in `dokumentation`. TEMPLATE_FIELD_MAP für `termin.beschreibung` zeigt jetzt auf `t-doc-gespraechsinhalt` (vorher `t-notizen`). Migration `migrations/v1.52.0_documentation.sql`. |
| v1.51.0 | 29.04.2026  | **Projekt-Templates mit Sub-Items + Aktivitäten-Bereich im Anlage-Modal.** Projekt-Template-Editor bekommt zusätzlichen Block „Standard-Aktivitäten" — Liste editierbarer Zeilen mit Typ (Termin/Aufgabe/Einsatz), Titel und Werktage-Offset ab Projektstart; bei Einsatz zusätzlich Service/Menge/Einzelpreis. Gespeichert als `daten._subitems` (Array im JSONB). Beim Anlegen eines Projekts mit Template werden die Sub-Items nach Insert automatisch als echte Datensätze (appointments/tasks/deployments) angelegt — Datum = Projektstart + Offset Werktage (Mo–Fr-Schritt, Sa/So übersprungen via `addWerktage`). Ohne Projektstart bleiben Sub-Items datumslos. Projekt-Anlage-Modal bleibt nach erstem Save offen: ein Aktivitäten-Bereich erscheint mit drei Quick-Add-Karten (Termin/Aufgabe/Einsatz, je Datum + Titel + ggf. Service) plus Liste aller bereits angelegten Aktivitäten — Save-Button wird zu „Schließen". Im Edit-Mode unverändert. Tracking-Variable `_activeProjectTemplateId` hält die Template-ID über den Insert hinweg. Neue Funktionen: `addTemplateSubItem`, `removeTemplateSubItem`, `onSubItemTypChange`, `readTemplateSubItems`, `renderTemplateSubItemsEditor`, `renderTemplateSubItemRow`, `addWerktage`, `createTemplateSubItems`, `closeProjectModalFromActivities`, `showProjectActivitiesSection`, `renderProjectModalActivities`, `quickAddProjectActivity`. Neue CSS: `.tpl-subitems-block/-head/-title/-hint`, `.tpl-subitem-row`, `.tpl-si-*`, `.p-activities-divider/-head/-hint/-list-title`, `.p-quick-add-grid/-card/-title`, `.p-activity-row/-kind/-date/-titel/-status`. Kein Schema-Change. |
| v1.50.0 | 29.04.2026  | **Templates für Anlage-Modale.** Neue Tabelle `templates` (id · typ ∈ {termin, aufgabe, einsatz, projekt} · name · daten jsonb · reihenfolge · ist_aktiv · erstellt_von · created_at). Admin-pflegt unter `#/templates`, alle authenticated dürfen lesen. RLS: 4× PERMISSIVE (select für alle, INSERT/UPDATE/DELETE nur für Admin via roles-Subquery) + 1× RESTRICTIVE `only_active_users`. Anlage-Modale (Termin/Aufgabe/Einsatz/Projekt) bekommen eine „Aus Template"-Zeile direkt unter dem Titel — Auswahl füllt alle im Template hinterlegten Felder, change/input-Events werden gefeuert, damit Auto-Berechnungen + Preview reagieren. Datumsfelder werden bewusst nicht templatisiert (kontext-spezifisch). `TEMPLATE_SCHEMAS` definiert pro Typ die templatisierbaren Felder mit Type-Tags (text/number/checkbox/textarea/time/lookup/service/user/text-or-lookup), `TEMPLATE_FIELD_MAP` mappt Template-JSON-Schlüssel auf die Modal-DOM-IDs. Modal-Präfix `tpl-*` (Kollision mit Termin-`t-*` bewusst vermieden). Neue Funktionen: `loadTemplates`, `openTemplateModal`, `closeTemplateModal`, `onTemplateTypeChange`, `renderTemplateFields`, `readTemplateFields`, `saveTemplate`, `deleteTemplate`, `fetchActiveTemplates`, `invalidateTemplatesCache`, `populateTemplateDropdown`, `applyTemplateToEntity`. Sidebar-Eintrag „Templates" mit `data-admin-only="true"`. Migration `migrations/v1.50.0_templates.sql`. |
| v1.48.0 | 28.04.2026  | Detail-Header mit Kontaktdaten-Zeile. Firma- und Kontakt-Header zeigen jetzt direkt unter dem Titel die Kontaktdaten als kompakte Inline-Zeile mit kleinen Lucide-Icons (Pin / Phone / Mail / Globe) und tel:/mailto:/https-Links — vorher musste man zur „Kontaktdaten"-Karte unten scrollen. Helper `renderDetailHeaderMeta(elementId, fields)` rendert nur vorhandene Felder. Konstanten `ICON_PIN_SVG`, `ICON_PHONE_SVG`, `ICON_MAIL_SVG`, `ICON_GLOBE_SVG`. Kontakt-Header zeigt nur Telefon + E-Mail (Position und Firma stehen schon in der Subline). Separate „Kontaktdaten"-Info-Card in beiden Stammdaten-Panels entfernt. Sidebar-Spalte des Firma-Dashboards von 260 auf 320 px verbreitert; `.contact-card-sub` wechselt von `nowrap` + Ellipsis auf 2-Zeilen-Clamp (`-webkit-line-clamp: 2`) — Position + E-Mail bleiben lesbar. Schnellaktionen-Button im Quick-Create-Panel entfernt (Firma + Kontakt). Neue CSS: `.detail-header-meta`, `.detail-meta-item`, `.detail-meta-icon`. Kein Schema-Change. |
| v1.47.0 | 28.04.2026  | Detail-Seiten Verdichtung & Hervorhebung. **Firma-Detail:** Tabs reduziert auf 3 (Stammdaten / Projekte / Aktivitäten). Kontakte als Sidebar-Panel über Schnell-Anlegen statt eigener Tab — kompakte Karten mit Avatar+Name+Position, Hover-Icons für Kopieren/Bearbeiten. Mitgliedschaften aus eigenem Tab ins Stammdaten-Dashboard verschoben. Termine + Aufgaben + Einsätze gestapelt im neuen Aktivitäten-Tab. `switchDetailTab` mappt alte Bookmark-Hashes (`?tab=kontakte/mitgliedschaften` → stammdaten, `?tab=termine/aufgaben/einsaetze` → aktivitaeten). **Wochen-Tab:** nur noch Mo–Fr (Wochenende komplett ausgeblendet, Range in `briefingRangeForScope` verkürzt), KW-Header (ISO 8601) über dem Strip mit Datumsspanne. Helper `isoWeekNumber`. **Projekt-Detail:** 4-Spalten-Stat-Row via neue `.dashboard-stats.is-4`-Modifier — vorher 3-Spalten mit „Offene Aufgaben"-Orphan; Aktivitäts-Zeile auf 3 Spalten mit neuer Team-Card (Verantwortlich + Hauptkontakt); separate Projektdaten-Card entfernt, weil Umsatz/Daten redundant zu den Stat-Cards waren. **Card-Titel hervorgehoben:** Stat-Label, Info-Card-Title, Quick-Create-Title und Contacts-Panel-Title bekommen Font-Weight 700, dunklen Text statt muted, plus farbigen 6-px-Punkt davor (`::before`-Pseudo-Element mit `var(--primary)`). Neue CSS: `.dashboard-aside`, `.contacts-panel/-head/-title`, `.contact-card/-avatar/-body/-name/-sub/-actions`, `.info-card-title-row`, `.dashboard-row-3col`, `.dashboard-stats.is-4`, `.detail-grid-tight`, `.week-strip-header/-kw/-range`. Kein Schema-Change. |
| v1.46.0 | 27.04.2026  | Monat-Tab Rollen-Schärfung. **Technik:** KPI „Pflegerückstand" (Geplant-Einsätze deren Datum < heute liegt) ersetzt nackt-Geplant; Sektion „Geplant — Restmonat" als Liste der kommenden Einsätze (Datum-Pille · Firma · Leistung+Ort) statt Einsatzleistung-Balken; eigene Sektion „Pflegerückstand" mit roter Akzentlinie wenn überfällig. **Vertrieb:** KPI „Forecast" = Realisiert + Geplant + gewichtete Pipeline (Lead 10 % · Angebot 30 % · In Arbeit 70 % · Abschlussphase 90 %); KPI „Akquise" als Zähler (erstellte Termine + Einsätze); 3-Spalten-Bottom-Grid mit neuer Sektion „Mitgliedschaften" (ablaufend ≤ 60 T oder Kontingent ≥ 80 % verbraucht, sortiert nach Dringlichkeit, mit zwei Pillen-Tönen Warn/Overdue). **Beides:** spiegelt Forecast + Mitgliedschaften. Drei neue Queries in `loadBriefingData(scope='monat')`: aktive `memberships` + alle `entitlements` + alle `entitlement_redemptions`; clientside-Aggregation `membershipAttention`, `overdueGeplant`, `restmonatGeplant`. `recentDepsRes`-Select um `titel/ort/service` erweitert. Neue Helper `restmonatDateLabel`, `renderPipelineStages`, `renderMembershipAttention`. Konstante `PIPELINE_FORECAST_WEIGHT`. CSS: `.month-bottom-grid.is-three`, `.restmonat-list/-row/-date/-firma/-meta`, `.membership-list/-row/-pill (is-warn/is-overdue)`, `.pipeline-stage-weight`. Kein Schema-Change. |
| **v1.35.0** | **24.04.2026** | **Modal-Redesign (Kanban-Stil)** — Termin-, Einsatz- und Aufgabe-Modal komplett neu: horizontale Mehr-Spalten-Layouts mit Icon-Headern, die den Formularfluss von links nach rechts organisieren. **Termin-Modal** (960 px, 3 Spalten): „📝 Was" (Titel · Typ · Status) · „📅 Wann" (Datum + Shortcuts · Ganztag · Uhrzeit von/bis als 2-col) · „👥 Wer & Wo" (Firma · Kontakt · Projekt · Ort). **Aufgabe-Modal** (960 px, 3 Spalten): „📝 Was" (Titel · Status · Beschreibung) · „📅 Wann & Wer" (Fälligkeit + Shortcuts · Zuständig) · „🔗 Kontext" (Firma · Kontakt · Projekt). **Einsatz-Modal** (1140 px, 4 Spalten): „🏢 Kunde" (Firma · Projekt · Ort) · „🎯 Leistung" (Service · Menge+↻ und Einzelpreis als 2-col · Preis-Hint) · „📅 Zeitraum" (Datum von · Datum bis · Ganztag · Uhrzeit von/bis als 2-col · Status) · „👷 Team" (Titel · Interne Techniker · Externe Techniker). Unter dem Kanban-Hauptblock ein **Footer-Bereich** mit „Kopplung" (Termin-Sync + Bonus-Einlösung, offen) und „Beschreibung & Notizen" (kollabiert). Trennlinien zwischen Spalten. Auf Mobile (<900 px) kollabieren die Spalten vertikal. Alle Feld-IDs und Handler unverändert — nur Container-Struktur und Breite. Neue CSS-Klassen `.modal-kanban`, `.modal-kanban-col`, `.modal-kanban-col-title`, `.modal-kanban-footer`, `.form-row-2`. Kein Schema-Change. |

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

| Punkt                         | Status       | Beschreibung                                           |
|-------------------------------|--------------|--------------------------------------------------------|
| Dashboard                     | offen        | Verfallende Bonis, Umsatz geplant vs. real, KPIs       |
| Kalender-View                 | offen        | Termine + Einsätze als Timeline (Task 4 der UX-Spec)   |
| Nav-Restruktur                | ✅ v1.23.0   | 3 Gruppen (Kunden / Aktivität / Projekte) + Detail-Tabs |
| Projekt-Kontingente           | offen        | Projekt mit „enthält 8 LifeCalls" → Auto-Entitlements  |
| Dublettenerkennung            | offen        | Bei Firmen- und Kontakt-Anlage                         |
| Export                        | offen        | CSV/Excel für alle Entitäten                           |
| Multi-Leistungen pro Einsatz  | offen        | Sub-Positionen statt 1:1 service_id                    |
| Manuelle Bonus-Einlösung      | offen        | Redemption ohne Einsatz (für Sonderfälle)              |
| Verfalls-Notifications        | offen        | Mail-Erinnerung N Tage vor Ablauf                      |

### 13.3 Niedrig — Komfort

| Punkt                      | Status       | Beschreibung                                           |
|----------------------------|--------------|--------------------------------------------------------|
| Globale Suche              | ✅ v1.19.0   | Cmd+K über companies / contacts / projects / deployments |
| FAB Quick-Add              | ✅ v1.21.0   | Schwebender `+`-Button mit Kontext-Prefill             |
| Zeilen-Aktionen aufräumen  | ✅ v1.20.0   | Hover-Reveal + Kebab + Undo-Toast                      |
| Stammdaten-Labels          | ✅ v1.18.0   | Menschenlesbare Kategorie-Namen                        |
| Notes-Entity aktivieren    | offen        | Separate Tabelle statt Freitext-Felder                 |
| Audit-Log                  | offen        | Wer hat wann was geändert                              |
| Storage                    | offen        | File-Uploads an Projekten/Einsätzen                    |
| Email-Integration          | offen        | Termineinladungen, Zusagen tracken                     |

### 13.4 Aktuell ungenutzte Schema-Elemente

- `notes` Tabelle
- `appointment_participants` Tabelle
- `roles.rechte` (JSONB-Feld, noch kein granular rights system)
- `entitlements.source_type = 'manual'` (vorbereitet, noch kein UI)
- `entitlement_redemptions.deployment_id = NULL` (manuelle Einlösungen vorbereitet)
- `tasks.deployment_id` (Spalte vorhanden, aktuell nicht im UI — für spätere Kopplung reserviert)

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
       THEN 'OK' ELSE 'TEILWEISE' END
UNION ALL
SELECT 'workflow_state auf appointments/deployments/projects (v2.0.3, Soll=3)',
       CASE WHEN (SELECT COUNT(*) FROM information_schema.columns
           WHERE table_schema='public' AND column_name='workflow_state'
             AND table_name IN ('appointments','deployments','projects')) = 3
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

*Ende der Dokumentation · Cumart CRM v2.6.6*
