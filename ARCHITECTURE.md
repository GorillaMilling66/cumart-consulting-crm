# Cumart CRM – Architektur & Projektübersicht

> Lebendes Dokument. Wird bei jeder größeren Änderung aktualisiert.
> Zuletzt aktualisiert: 2026-04-20 (v1.4.2)

---

## 1. Was ist das Cumart CRM?

Ein internes Management-System für **Cumart Consulting** (CNC Heidenhain Klartext
Programmierung, Training & Beratung). Es löst das bisherige Chaos aus Excel,
Teams, einem fremden CRM und Outlook ab und führt alle Informationen zu
Kunden, Projekten, Einsätzen und Umsätzen an einem Ort zusammen.

**Primäre Nutzer:** Cumart-Mitarbeiter (aktuell ~2, perspektivisch 5–20).
Keine Kunden-Logins.

**Primäres Ziel:**
Jeder Mitarbeiter weiß jederzeit, **wer sind unsere Kunden**, **was läuft mit
ihnen**, **wer ist wann wo im Einsatz** und **wie viel Umsatz haben wir
erzielt / werden wir erzielen**.

---

## 2. Vision & Strategische Entscheidungen

### Leistungsmodell
Cumart bietet drei Hauptleistungstypen:

1. **Einsatz** – Techniker vor Ort beim Kunden (Tagessatz × Tage)
2. **Trainingsprogramm hybrid** – Einsätze + Online-Einheiten gemischt,
   oft als Projekt mit Festpreis
3. **Projektgeschäft** – größere, längerfristige Aufträge mit Festpreis

### Umsatzmodell
**Modell C (gemischt):**
- **Projekte** können einen Festpreis haben (`projects.festpreis`)
- **Einsätze und Termine** können einen Preis × Menge haben
  (`einzelpreis × menge`)
- Der Umsatz wird dort erfasst, wo er logisch entsteht

### Umsatz-Status (2 Stufen für MVP)
- `geplant` – Einsatz/Termin steht im Kalender, aber noch nicht durchgeführt
- `durchgeführt` – Leistung wurde erbracht
- (Abrechnung & Zahlung laufen weiter über bestehendes Buchhaltungssystem)

### Ziel-Tracking
Primäre Dimension: **pro Mitarbeiter pro Monat** (z. B.
"Yasin 12.500 € Monatsumsatz-Soll").
Weitere Dimensionen (pro Leistungsart, pro Quartal) können später ergänzt werden.

### Leistungskatalog (`services`)
Admin-gepflegt in der App. Admins definieren selbst, welche Leistungen mit
welchen Standardpreisen angeboten werden. Beim Anlegen eines Einsatzes oder
Termins wird aus dem Katalog ausgewählt.

### Stammdaten / Lookup-Werte
Zentrale Dropdown-Werte werden in der Tabelle `lookup_values` verwaltet
(Unternehmenstypen, Termintypen, Leistungskategorien, später Projekt-Status etc.).
Admins können neue Kategorien und Werte direkt in der App pflegen – ohne SQL.

---

## 3. Bau-Plan (Feature-Roadmap)

Farb-Legende: ✅ fertig · 🔨 in Arbeit · ⏳ geplant · 💭 Idee

### Phase 0 – Fundament & Infrastruktur  ✅
- ✅ Supabase Projekt aufgesetzt
- ✅ 12-Tabellen-Schema angelegt
- ✅ RLS Policies auf allen Tabellen sauber konfiguriert
- ✅ GitHub-Repo + Vercel-Deployment
- ✅ Code-Struktur: `index.html` + `styles.css` + `app.js`

### Phase 1 – Benutzerverwaltung  ✅
Release: **v1.3.1** (2026-04-20)

- ✅ Admin / Vertrieb / Techniker als Rollen
- ✅ Admin legt User mit Initialpasswort an (oder auto-generiert)
- ✅ Zugangsdaten-Anzeige mit Kopier-Funktion
- ✅ Passwort-Pflicht beim ersten Login
- ✅ Admin-Passwort-Reset pro User
- ✅ Self-Service Passwort-vergessen via E-Mail
- ✅ Letzter-Admin-Schutz
- ✅ Anti-Self-Demotion
- ✅ Login-Blocker für inaktive User
- ✅ Auto-Aktivierung bei erstem Login via DB-Trigger
- ✅ Frontend-Gating für Admin-Funktionen

### Phase 2a – Stammdaten & Leistungskatalog  ✅
Release: **v1.4.2** (2026-04-20)

- ✅ Lookup-Werte-Verwaltung (Kategorien, Werte, Farben, Reihenfolge, Status)
- ✅ Leistungskatalog (Name, Kategorie als FK, Einheit, Preis, Status)
- ✅ Leistungskategorien als Foreign Key auf `lookup_values`
- ✅ Foreign-Key-Schutz beim Löschen (archivieren statt löschen)
- ✅ Admin-only in "Einstellungen"-Untermenü gruppiert
- ✅ Icon-Upgrade auf Lucide-Style

### Phase 2b – Firmen & Kontakte  🔨
- 🔨 **Firmen** (anlegen, auflisten, bearbeiten, löschen)
  - Name, Typ (Lookup: Kunde/Interessent/Lieferant/Partner), Branche
  - Adresse (Straße, PLZ, Stadt, Land)
  - Kontakt (Telefon, E-Mail, Website)
  - Notizen
- ⏳ **Kontakte** (Ansprechpartner pro Firma)
  - Vorname, Nachname, Position
  - Telefon, E-Mail
  - Zuordnung zu einer Firma
  - Mehrere Kontakte pro Firma möglich

### Phase 3 – Aktivitäten  ⏳
- ⏳ **Projekte** als Klammer (Status, Festpreis, Zeitraum, Hauptkontakt)
- ⏳ **Einsätze** (Techniker-Zuteilung, Datum, Service-Bezug, Preis × Menge)
- ⏳ **Termine** (Erstgespräch, Angebotspräsentation, Online-Training mit Teilnehmern)
- ⏳ **Notizen** zu Firmen / Kontakten / Projekten

### Phase 4 – Auswertung & Ziele  ⏳
- ⏳ **Umsatz-Dashboard** (geplant vs. durchgeführt, Monat/Quartal/Jahr)
- ⏳ **Ziel-Tracking** pro Mitarbeiter pro Monat
- ⏳ **Pipeline-View** (offene Angebote, kommende Einsätze)
- ⏳ **„Meine Woche"** – Mitarbeiter-Dashboard

### Phase 5 – Feinschliff & Erweiterungen  💭
- 💭 Audit-Log (wer hat wann was geändert)
- 💭 Soft-Delete für User (statt Hard-Delete)
- 💭 Sortier-, Filter- und Suchfunktionen überall
- 💭 Bulk-Aktionen
- 💭 Import aus Excel / Outlook-Kontakten
- 💭 Benachrichtigungen (neuer Termin, Reminder)
- 💭 Permission-basierte UI (die `rechte`-JSON der Rollen nutzen)

### Bewusst NICHT geplant (bis auf Weiteres)
- Kunden-Portal mit eigenen Logins
- Rechnungsstellung (bleibt im bestehenden Buchhaltungssystem)
- Mobile App (Web-App ist mobil-responsive, das reicht zunächst)

---

## 4. Technische Architektur

### Tech-Stack
- **Frontend:** Vanilla HTML / CSS / JavaScript (kein Framework)
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Hosting Frontend:** Vercel (auto-deploy von GitHub main-Branch)
- **Hosting Backend:** Supabase Cloud
- **Versionskontrolle:** GitHub (`GorillaMilling66/cumart-consulting-crm`)
- **Icon-Set:** Lucide (inline SVG, keine Runtime-Library)

### Code-Struktur (aktueller Stand v1.4.2)
```
/
├── index.html                     ← HTML-Gerüst
├── styles.css                     ← Alle Styles
├── app.js                         ← Gesamte App-Logik
├── ARCHITECTURE.md                ← Dieses Dokument
└── supabase/
    └── functions/
        └── manage-users/
            └── index.ts           ← Edge Function für Benutzer-CRUD
```

**Refactoring-Strategie:** Aktuell ist `app.js` noch eine Datei (ca. 1200 Zeilen).
Modularisierung startet sobald `app.js > 1500 Zeilen` oder ein Muster 3-fach
auftaucht. Kein Premature-Modularize.

### Datenmodell (12 Tabellen)

**Benutzer & Rollen**
- `user_profiles` – Cumart-Mitarbeiter (verknüpft mit `auth.users`)
- `roles` – Admin / Vertrieb / Techniker (inkl. `rechte`-JSON für spätere Permissions)

**Stammdaten**
- `companies` – Firmen (Kunden, Interessenten, Lieferanten, Partner)
- `contacts` – Ansprechpartner, gehören zu einer Firma
- `services` – Leistungskatalog (Name, Kategorie-FK, Einheit, Standardpreis)
- `lookup_values` – zentrale Dropdown-Werte (admin-gepflegt)

**Aktivitäten**
- `projects` – Aufträge (Festpreis, Status, Zeitraum)
- `deployments` – Einsätze (datum_von/bis, Preis × Menge, Service-Bezug)
- `deployment_technicians` – welcher Techniker auf welchem Einsatz
- `appointments` – Termine (Erstgespräch, Online-Training, …)
- `appointment_participants` – wer nimmt am Termin teil
- `notes` – freie Notizen, verknüpfbar mit Firma / Kontakt / Projekt

### Rechte-System

| Rolle | Kann | Kann nicht |
|---|---|---|
| **Admin** | Alles, inkl. Benutzerverwaltung, Stammdaten, Leistungen, Rollen-Änderungen | Sich selbst degradieren / löschen / letzter Admin |
| **Vertrieb** | Firmen, Kontakte, Projekte, Termine, eigene Notizen | Einstellungen (keine eigene Sicht auf Leistungen/Benutzer/Stammdaten) |
| **Techniker** | Eigene Einsätze einsehen, Notizen zu Einsätzen | Einstellungen, Preise ändern |

Haupt-Gate aktuell: „Admin / Nicht-Admin".
Feingranulare Rechte via `roles.rechte` (JSON-Array) kommen in Phase 5.

### Sicherheit (Kernprinzipien)

1. **Row-Level Security (RLS)** auf allen Tabellen
2. **Edge Functions** für sensible Operationen (User anlegen, löschen, Passwort-Reset)
3. **Kein Klartext-Passwort via E-Mail** – Anzeige im Admin-UI mit Kopier-Button
4. **Frontend-Gating** kosmetisch – echter Schutz in DB + Edge Functions

---

## 5. Design-Konventionen

### Sprache
- **UI:** Deutsch
- **Code (Variablen, Funktionen, Kommentare):** Deutsch mischt mit Englisch
  - Datenfelder bleiben englisch (`name`, `email`, `status`)
  - Domain-spezifische Felder dürfen deutsch sein (`einzelpreis`, `menge`)
  - Funktionsnamen im JS sind englisch (`loadUsers`, `saveCompany`)

### Benennung
- Tabellen: snake_case, Plural (`user_profiles`, `companies`)
- Spalten: snake_case (`role_id`, `created_at`)
- JS-Funktionen: camelCase (`loadUsers`, `isAdmin`)
- CSS-Klassen: kebab-case mit Block-Präfix (`btn-primary`, `nav-item-sub`)
- HTML-IDs: kebab-case, Prefix je Bereich (`u-name`, `s-kategorie`, `l-wert`)

### UI-Prinzipien
- Schlichtes, funktionales Design (wenig Farben, klare Hierarchie)
- Lucide-Icon-Set, inline SVG, 18px in Hauptnav / 15px im Untermenü
- Modals für alle Bearbeitungen (nicht Inline-Editing)
- Toast-Meldungen für Feedback (3 Sekunden)
- Keine destruktiven Aktionen ohne `confirm(...)`
- Foreign-Key-Löschfehler werden abgefangen → freundliche Meldung „Archivieren statt löschen"

### Sidebar-Struktur (ab v1.4.1)
- **Oben:** User-Info (Name + Rolle)
- **Mitte:** `#nav-main` – Arbeits-Menüpunkte (Phase 3: Firmen, Kontakte, …)
- **Unten:**
  - `#nav-settings-group` – ausklappbares „Einstellungen"-Untermenü
    (Benutzer / Leistungen / Stammdaten), admin-only via `data-admin-only="true"`
  - Abmelden

### Admin-Gating
Jedes UI-Element mit `data-admin-only="true"` wird in `applyAdminOnlyUI()` je
nach Rolle ein-/ausgeblendet. Neue Admin-Bereiche einfach mit diesem Attribut
markieren – keine separate Logik nötig.

---

## 6. Deployment & Backups

### Deployment-Fluss
1. Änderung in GitHub-Repo `main`-Branch
2. Vercel deployed automatisch (~60 s)
3. Edge Functions: Änderungen direkt im Supabase Dashboard; Code parallel
   ins Repo nachführen (`supabase/functions/manage-users/index.ts`)
4. DB-Migrationen: SQL via Supabase SQL Editor; Skripte später in
   `supabase/migrations/` ablegen (Ordner noch anzulegen)

### Backup-Strategie
- **Code:** GitHub-Releases als Meilenstein-Tags (`v1.3.0`, `v1.3.1`, `v1.4.2`, …)
- **Daten:** manueller SQL-Dump (CSV-Export via SQL Editor) bei jedem Meilenstein
- **Automatische Supabase-Backups:** täglich (Free Plan), nicht selbst wiederherstellbar → deshalb manuelle Dumps
- **Upgrade-Plan:** Sobald echte Kundendaten produktiv → Supabase Pro für Point-in-Time-Recovery

---

## 7. Offene Fragen

- **Projekte:** Muss jeder Einsatz zu einem Projekt gehören, oder gibt es auch Einzeleinsätze?
- **Einsatz-Zuteilung:** Ein oder mehrere Techniker pro Einsatz? (Schema erlaubt mehrere)
- **Kalender-Ansicht:** Eigenständiger Kalender oder reicht Listenansicht?
- **Feiertage / Urlaubsplanung:** Im Scope oder separat?
- **Datenimport:** Später aus altem CRM? Aus Excel?
- **Firmen-Soft-Delete:** Komplett löschen oder nur archivieren, wenn bereits Projekte dranhängen?

---

## 8. Arbeitsprozess mit Claude

1. **Erwähne „ARCHITECTURE.md"** in der ersten Nachricht einer neuen Session.
2. **Kontext knapp:** „Wir bauen gerade Phase 2b (Firmen)" reicht.
3. **Bei Unklarheiten** prüft Claude zuerst dieses Dokument.
4. **Nach größeren Änderungen:** Claude aktualisiert diese Datei gemeinsam mit dir.

Die Datei wird **nicht automatisch** aktualisiert – wir müssen daran denken.
Daumenregel: Feature fertig → Roadmap-Status ändern + „Zuletzt aktualisiert"-Timestamp oben.
