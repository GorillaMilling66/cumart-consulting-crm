# Cumart CRM – Architektur & Projektübersicht

> Lebendes Dokument. Wird bei jeder größeren Änderung aktualisiert.
> Zuletzt aktualisiert: 2026-04-20

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

---

## 3. Bau-Plan (Feature-Roadmap)

Farb-Legende: ✅ fertig · 🔨 in Arbeit · ⏳ geplant · 💭 Idee

### Phase 0 – Fundament & Infrastruktur
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

### Phase 2 – Stammdaten  🔨
- ⏳ **Services-Katalog** (Admin legt Leistungen mit Preisen an)
- ⏳ **Firmen** (anlegen, auflisten, bearbeiten, löschen)
- ⏳ **Kontakte** (Ansprechpartner pro Firma)

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
  - Grund: Einfachheit, schnelles Laden, kein Build-Prozess nötig
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Hosting Frontend:** Vercel (automatisches Deploy von GitHub main-Branch)
- **Hosting Backend:** Supabase Cloud
- **Versionskontrolle:** GitHub (`GorillaMilling66/cumart-consulting-crm`)

### Code-Struktur (aktueller Stand v1.3.1)
```
/
├── index.html          ← HTML-Gerüst (Auth-Screens, App-Layout, Modals)
├── styles.css          ← Alle Styles
├── app.js              ← Gesamte App-Logik (wird später modularisiert)
├── supabase/
│   └── functions/
│       └── manage-users/
│           └── index.ts   ← Edge Function für Benutzer-CRUD
└── ARCHITECTURE.md     ← Dieses Dokument
```

**Refactoring-Strategie:** Aktuell ist `app.js` noch eine Datei. Sobald das
Projekt wächst (Schätzung: ab 5+ Features), wird `app.js` in Module aufgeteilt
(`api.js`, `ui.js`, eigene Module pro Feature-Bereich). Kein Premature-Modularize.

### Datenmodell (12 Tabellen)

**Benutzer & Rollen**
- `user_profiles` – Cumart-Mitarbeiter (verknüpft mit `auth.users`)
- `roles` – Admin / Vertrieb / Techniker (inkl. `rechte`-JSON für spätere Fine-Grained-Permissions)

**Stammdaten**
- `companies` – Firmen (Kunden, Interessenten, Lieferanten, Partner)
- `contacts` – Ansprechpartner, gehören zu einer Firma
- `services` – Leistungskatalog (Name, Kategorie, Einheit, Standardpreis)
- `lookup_values` – zentrale Dropdown-Werte (Unternehmenstyp, Termintyp, …)

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
| **Admin** | Alles, inkl. Benutzerverwaltung, Services-Katalog, Rollen-Änderungen | Sich selbst degradieren / löschen / letzter Admin |
| **Vertrieb** | Firmen, Kontakte, Projekte, Termine, eigene Notizen | Benutzerverwaltung, Services-Katalog |
| **Techniker** | Eigene Einsätze einsehen, Notizen zu Einsätzen | Preise ändern, Benutzerverwaltung |

Die genauen Rechte werden stufenweise verfeinert. Aktuell ist die Haupt-Gate
auf „Admin / Nicht-Admin". Feingranulare Rechte über `roles.rechte` (JSON-Array)
kommen in Phase 5.

### Sicherheit (Kernprinzipien)

1. **Row-Level Security (RLS)** auf allen Tabellen – Angreifer, die über die
   JS-Library direkt auf Supabase zugreifen, werden auf DB-Ebene gestoppt.
2. **Edge Functions** für sensible Operationen (User anlegen, löschen,
   Passwort-Reset). Diese laufen mit `service_role` und prüfen selbst die Admin-Rolle.
3. **Kein Klartext-Passwort via E-Mail** – Initial- und Reset-Passwörter
   werden im Admin-UI angezeigt und per Kopier-Button weitergegeben.
4. **Frontend-Gating** rein kosmetisch – echter Schutz liegt in DB + Edge Functions.

---

## 5. Design-Konventionen

### Sprache
- **UI:** Deutsch (Zielgruppe: deutschsprachige Mitarbeiter)
- **Code (Variablen, Funktionen, Kommentare):** Deutsch mischt sich mit Englisch
  - Datenfelder wie `name`, `email`, `status` bleiben englisch (Postgres-Konvention)
  - Domain-spezifische Felder dürfen deutsch sein (`einzelpreis`, `menge`, `datum_von`)
  - Funktionsnamen im JS sind englisch (`loadUsers`, `saveCompany`)
  - Kommentare dürfen deutsch sein

### Benennung
- Tabellen: snake_case, Plural (`user_profiles`, `companies`)
- Spalten: snake_case (`role_id`, `created_at`)
- JS-Funktionen: camelCase (`loadUsers`, `isAdmin`)
- CSS-Klassen: kebab-case mit Block-Präfix (`btn-primary`, `sidebar-user-avatar`)
- HTML-IDs: kebab-case, möglichst Prefix je Bereich (`u-name` für User-Modal,
  `cred-email` für Credentials-Modal)

### UI-Prinzipien
- Schlichtes, funktionales Design (wenig Farben, klare Hierarchie)
- Keine Icon-Bibliotheken – Inline-SVG wo nötig
- Modals für alle Bearbeitungen (nicht Inline-Editing)
- Toast-Meldungen für Feedback (3 Sekunden)
- Keine destruktiven Aktionen ohne Bestätigung (`confirm(...)`)

### Dateigrößen & Refactoring
- Faustregel: `app.js` wird modularisiert, wenn sie >1500 Zeilen überschreitet
  oder sich Muster 3-fach wiederholen (API-Calls, Modal-Handling, List-Rendering).

---

## 6. Deployment & Backups

### Deployment-Fluss
1. Lokale/Remote Änderung in GitHub-Repo `main`-Branch
2. Vercel deployed automatisch (~60 Sekunden)
3. Edge Functions: Änderungen direkt im Supabase Dashboard; Code parallel
   ins Repo nachführen (`supabase/functions/manage-users/index.ts`)
4. DB-Migrationen: SQL via Supabase SQL Editor; Skripte im Repo unter
   `supabase/migrations/` ablegen (Ordner noch anzulegen)

### Backup-Strategie
- **Code:** GitHub-Releases als Meilenstein-Tags (`v1.3.0`, `v1.3.1`, …)
- **Daten:** manueller SQL-Dump (CSV-Export via SQL Editor) bei jedem Meilenstein
- **Automatische Supabase-Backups:** täglich (Free Plan), aber nicht selbst wiederherstellbar → deshalb manuelle Dumps
- **Upgrade-Plan:** Sobald produktiv mit echten Kundendaten → Supabase Pro für Point-in-Time-Recovery

---

## 7. Offene Fragen / Design-Entscheidungen, die noch kommen

Stichpunkte, die wir später klären müssen:

- **Services-Katalog:** Kategorien-Schema? (Training / Einsatz / Online / Projekt?)
  Abrechnungseinheiten? (Tag / Stunde / Pauschale)
- **Projekte:** Muss jeder Einsatz zu einem Projekt gehören, oder gibt es auch
  Einzeleinsätze „ohne Projekt"?
- **Einsatz-Zuteilung:** Ein oder mehrere Techniker pro Einsatz? (Schema erlaubt mehrere)
- **Kalender-Ansicht:** Eigenständiger Kalender oder reicht eine Listenansicht?
- **Feiertage / Urlaubsplanung:** Im Scope des CRMs oder separat?
- **Datenimport:** Später aus altem CRM? Aus Excel?

---

## 8. Arbeitsprozess mit Claude

Wenn du (Selcuk) eine neue Session mit Claude startest:

1. **Erwähne „ARCHITECTURE.md"** in der ersten Nachricht, damit Claude weiß, dass es existiert.
2. **Kontext knapp:** „Wir bauen gerade Phase 2b (Firmen)" reicht.
3. **Bei Unklarheiten** prüft Claude zuerst dieses Dokument, bevor er rät.
4. **Nach größeren Änderungen:** Claude aktualisiert diese Datei gemeinsam mit dir.

Die Datei wird **nicht automatisch** aktualisiert. Wir müssen daran denken.
Daumenregel: Wenn ein Feature fertig wird, ändern wir mindestens die
Roadmap (Phase X von 🔨 auf ✅) und den "Zuletzt aktualisiert"-Timestamp oben.
