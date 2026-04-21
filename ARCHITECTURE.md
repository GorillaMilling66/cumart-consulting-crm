# Cumart CRM – Architektur & Entwicklungsplan

Stand: **21. April 2026**, Version **v1.5.3**

---

## 1. Zweck & Philosophie

Internes CRM für Cumart Consulting. Kein Verkauf, kein Multi-Tenant, nur unser Team.
Gebaut für **Selcuk + wenige Mitarbeiter**. Einfachheit schlägt Skalierbarkeit.

**Design-Prinzipien:**

- **Schema-first, Feature-second.** Erst die DB-Tabelle korrekt, dann das Frontend drumherum.
- **Ein Feature zur Zeit.** Kein paralleles Rumflicken. Jede Version ist lauffähig.
- **Kein Framework, kein Build-Step.** Vanilla HTML/CSS/JS. Wenn `app.js` > 1.500 Zeilen wird, modularisieren – aber erst dann.
- **Admin-konfigurierbare Stammdaten.** Kategorien, Typen, Farben werden in `lookup_values` gepflegt – kein Code-Deploy für einen neuen Firmen-Typ.
- **Cache-first, DB-fallback.** Listen werden einmal geladen und clientseitig gefiltert. Details & Schreibvorgänge immer direkt.
- **UI deutsch, Code englisch.** Labels/Buttons deutsch, Funktionsnamen `camelCase` englisch, DB-Spalten `snake_case` deutsch/gemischt.

---

## 2. Tech-Stack

| Schicht | Technologie |
|---|---|
| Datenbank | Supabase Postgres (Free Plan) |
| Auth | Supabase Auth (ES256 JWTs) |
| Serverlogik | Supabase Edge Functions (Deno) |
| Storage | – (noch nicht genutzt) |
| Frontend | Vanilla HTML + CSS + JS |
| Hosting | Vercel (Auto-Deploy von `main`) |
| Repo | `GorillaMilling66/cumart-consulting-crm` |
| Live-URL | `cumart-consulting-crm.vercel.app` |

**Keine:** React, Vue, npm, Webpack, Vite, TypeScript, TanStack, shadcn, …

---

## 3. Repo-Struktur

```
/
├── index.html              – Thin-Shell mit allen Page-Containern und Modals
├── styles.css              – Alle Styles
├── app.js                  – Gesamte Frontend-Logik
├── ARCHITECTURE.md         – Diese Datei
├── README.md               – Kurzübersicht
└── supabase/
    └── functions/
        └── manage-users/
            └── index.ts    – Edge Function für User-Verwaltung
```

**Backups liegen in einem separaten Ordner außerhalb des Repos** (Datenexporte als CSV).

---

## 4. Datenbank-Schema (12 Tabellen)

| Tabelle | Zweck | Status |
|---|---|---|
| `user_profiles` | Benutzerprofil, 1:1 zu `auth.users` | ✅ In Benutzung |
| `roles` | Admin/Vertrieb/Techniker | ✅ In Benutzung |
| `lookup_values` | Admin-konfigurierbare Dropdowns | ✅ In Benutzung |
| `companies` | Firmen (Kunden, Partner, Lieferanten) | ✅ In Benutzung |
| `contacts` | Personen, optional einer Firma zugeordnet | ✅ In Benutzung |
| `services` | Leistungskatalog (mit Kategorie & Standardpreis) | ✅ In Benutzung |
| `projects` | Kundenprojekte mit Festpreis | 🔨 Schema existiert, UI fehlt |
| `appointments` | Termine (Akquise, Erstberatung, Angebot, ...) | 🔨 Schema existiert, UI fehlt |
| `appointment_participants` | N:M Termine ↔ Mitarbeiter | 🔨 Schema existiert, UI fehlt |
| `deployments` | Einsätze mit Einzelpreis × Menge | 🔨 Schema existiert, UI fehlt |
| `deployment_technicians` | N:M Einsätze ↔ Techniker | 🔨 Schema existiert, UI fehlt |
| `notes` | Freitext-Notizen zu beliebigen Entitäten | 🔨 Schema existiert, UI fehlt |

**RLS-Strategie (Option C, hybrid):**
- `user_profiles`, `roles`: strikte rollen-basierte Policies (Admin schreibt, alle lesen eingeschränkt)
- `lookup_values`: Lesen für alle, Schreiben nur Admin
- Alle anderen Tabellen: Lesen/Schreiben für eingeloggte Benutzer

Verfeinerung später, wenn wir Anforderungen kennen.

**Wichtige Konventionen:**
- Primary Keys: UUID (`gen_random_uuid()`)
- Soft-Delete: Noch nicht implementiert, offen
- Audit-Spalten: `erstellt_von` (FK → `user_profiles`), `created_at`, `updated_at`

---

## 5. Frontend-Konventionen

**Naming:**
- HTML-IDs: kebab-case, **per Seite/Section geprefixt**, um Kollisionen zu vermeiden:
  - `u-*` = user modal
  - `c-*` = company modal
  - `k-*` = contact (kontakt) modal
  - `s-*` = service modal
  - `l-*` = lookup modal
  - `page-*` = Seiten-Container
  - `nav-*` / `m-nav-*` = Desktop- bzw. Mobile-Nav
- JS-Funktionen: camelCase, englisch
- DB-Spalten: snake_case

**UI-Muster:**
- **Modals, keine Inline-Editierung.** Jede Entität hat ein Bearbeiten-Modal (Vollständigkeit > Geschwindigkeit)
- **Toast** für nicht-kritisches Feedback (3 Sekunden)
- **`confirm()`** bei destruktiven Aktionen (Löschen)
- **Foreign-Key-Fehler abfangen** → Empfehlung „archivieren statt löschen"
- **Admin-Only**: `data-admin-only="true"` + `applyAdminOnlyUI()` macht Buttons/Menüs für Nicht-Admins unsichtbar
- **Cache-First**: `companiesCache`, `contactsCache` – einmal laden, clientseitig filtern

**Navigation:**
- Hash-Router (kein SPA-Framework): `#/firmen`, `#/firma/UUID`, `#/kontakte`, `#/benutzer`, `#/leistungen`, `#/stammdaten`
- `navigateTo(page, param)` → setzt Hash → `handleHashChange()` → `showPage()`
- Browser-Zurück funktioniert, URLs sind bookmarkbar

**Responsivität:**
- Desktop-Sidebar ≥ 768 px
- Mobile: fixe Header oben + Bottom-Nav (Firmen / Kontakte / Mehr)
- Tabellen-Spalten verstecken sich progressiv: `.col-tablet` (≥ 768 px), `.col-desktop` (≥ 1024 px)

---

## 6. Wichtige Entscheidungen & deren Begründung

| # | Entscheidung | Begründung |
|---|---|---|
| 1 | Vanilla statt Framework | Kleine App, kein Build-Step, maximal transparent |
| 2 | Ein Admin erstellt Benutzer manuell (keine Self-Signup) | Interne App, <10 User, Free-Tier-Rate-Limit |
| 3 | Legacy anon key + ES256 JWTs | Transition von HS256; "Verify JWT with legacy secret" in Edge-Functions deaktiviert |
| 4 | Hybrid-RLS (Option C) | Strikte Policies da wo's zählt, lose wo wir noch nicht wissen |
| 5 | Multi-Type-Firmen (Kunde+Partner) **verworfen** | Komplexität zu hoch, Nutzen unklar – falls Schmerz, später neu bewerten |
| 6 | Modell C für Umsatz | Projekte = Festpreis, Einsätze/Termine = Einzelpreis × Menge, Status 2-stufig |
| 7 | Kontakt-zu-Firma-Zuordnung: optional | Freelancer/Einzelpersonen existieren ohne Firma |
| 8 | Responsive Spalten-Auto-Hide | Kein Column-Picker-UI nötig für <15 Benutzer |
| 9 | Schema-first nach Rebuild | Vermeidet Code-Degradation durch iteratives Patching |
| 10 | Hash-Router statt History API | Einfacher zu implementieren, kein Server-seitiges Routing nötig bei Vercel |

---

## 7. Changelog

### v1.5.3 – Firmen-Detailseite + Kopier-Buttons (21.04.2026) ✅
- Hash-Router implementiert (`#/firmen`, `#/firma/UUID`, ...)
- Firmen-Detailseite mit Kopf + Info-Grid + Kontakte-Sektion
- Breadcrumb-Navigation mit Zurück-Pfeil
- Klickbare Firmennamen in Firmen- und Kontaktlisten
- Kopier-Icons in Firmenliste, Firmen-Detailseite, Kontaktliste
- Plaintext-Formate für E-Mail-Copy-Paste (Firma + Adresse + Kontakte bzw. Kontakt + Firma)

### v1.5.2 – Mobile Bottom-Navigation (April 2026)
- Bottom-Nav für < 768 px: Firmen / Kontakte / Mehr
- Safe-Area-Insets für iPhones
- Mehr-Overlay als Bottom-Sheet

### v1.5.1 – Kontakte (April 2026)
- Kontakte-CRUD
- Firma-Zuordnung optional
- Filter nach Firma inkl. „ohne Firmenzuordnung"

### v1.5.0 – Firmen (April 2026)
- Firmen-CRUD mit 4-Section-Modal (Stammdaten / Adresse / Kontakt / Notizen)
- `companies.typ` als FK auf `lookup_values`
- Client-Suche + Typ-Filter

### v1.4.2 – Icon-Upgrade (April 2026)
- Lucide-Style SVG-Icons überall

### v1.4.1 – Settings-Submenü (April 2026)
- Einklappbare Einstellungen-Gruppe
- Hauptnav nur Firmen + Kontakte

### v1.4.0 – Services & Lookup-Management (April 2026)
- Leistungskatalog mit Preis/Einheit/Kategorie
- `services.kategorie` als FK auf `lookup_values`
- Stammdaten-Seite mit Inline-Neue-Kategorie

### v1.3.1 – Modularisierung (April 2026)
- CSS → `styles.css`, JS → `app.js`, dünnes `index.html`

### v1.3.0 – Benutzerverwaltung (April 2026)
- User-CRUD mit admin-gesetzten Passwörtern
- Credentials-Modal, Passwort-Reset, Must-Change-Flow
- Login-Blocker für inaktive Benutzer, Auto-Aktivierung bei First-Login
- Edge Function `manage-users` mit Last-Admin-Schutz und Anti-Self-Demotion

---

## 8. Offene Fragen / Technische Schulden

- **Soft-Delete**: Firmen/Kontakte mit FK-Verweisen können aktuell nur archiviert werden (manuell als Typ umgestellt). Ein echtes `archiviert_am`-Feld fehlt.
- **Multi-Type-Firmen**: Wenn eine Firma Kunde + Partner sein muss, gibt's aktuell keinen sauberen Weg. Falls es schmerzt → eigene Tabelle `company_typ_zuordnung` oder Array-Spalte.
- **Edge Function Hardening**: `manage-users` noch nicht vollständig gegen Last-Admin-Deletion + Role-Self-Escalation getestet.
- **Notizen als eigene Entität**: `notes`-Tabelle existiert, UI fehlt. Aktuell sind Notizen nur als Freitext-Feld in Firmen/Kontakten.
- **Audit-Log**: Kein Tracking, wer wann was geändert hat. `updated_at` gibt's, aber keinen Änderungs-History.
- **Datei-Anhänge**: Supabase Storage noch nicht eingebunden. Angebot-PDFs, Protokolle etc. liegen außerhalb des CRM.

---

## 9. Fahrplan (High-Level)

### Phase 1 ✅ – Fundament
Auth, Benutzerverwaltung, Rollen, RLS, Edge Function, Passwort-Flows

### Phase 2a ✅ – Stammdaten
Leistungskatalog, Lookup-Werte, Settings-Menü, Icons, Mobile-Nav

### Phase 2b ✅ – CRM-Grunddaten
Firmen, Kontakte, Detailseiten, Kopier-Buttons

### Phase 3 🔨 – Operatives Geschäft (aktuell)
- **3a: Termine** (Appointments) ← next
- **3b: Projekte** (Projects)
- **3c: Einsätze** (Deployments)

### Phase 4 – Auswertung
- Dashboard mit KPIs pro Mitarbeiter (Aktivität, Pipeline, Umsatz)
- Umsatzsicht pro Projekt/Firma/Monat
- Ziel-Tracking (monatliche Soll vs. Ist)

### Phase 5 – Komfort
- Notizen als eigene Entität mit Zeitstempel
- Datei-Anhänge (Supabase Storage)
- Soft-Delete/Archivierung überall
- Audit-Log
