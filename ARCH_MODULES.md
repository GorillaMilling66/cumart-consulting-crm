# Modul-Split-Plan für `app.js` (Block 4)

**Stand:** 19.05.2026, nach v2.32.1.
**Ziel:** den 29.578-Zeilen-Monolithen in native ES-Module aufteilen, ohne Build-Step.

---

## Ausgangslage

| Metrik | Wert |
|---|---|
| Zeilen `app.js` | **29.578** |
| Top-level Funktionen | **845** |
| Top-level Globals (`let`/`const`/`var`) | **228** |
| Banner-Sektionen (`// ═══`) | **117** |
| Inline `onclick=` Handler (HTML + JS) | **~732** |

**Konsequenz für ES-Module:** Modules laufen im eigenen Scope, daher findet ein `<button onclick="foo()">` die Funktion `foo` nicht mehr, wenn `foo` in einem Modul lebt. Lösung 1: jede UI-Funktion am Modul-Ende mit `window.foo = foo` global re-exposen. Lösung 2: alle inline-Handler durch `addEventListener` ersetzen (Riesen-Refactor). **Empfehlung Lösung 1** — pragmatisch, geringer Diff, kein onclick-Cleanup nötig.

---

## Modul-Vorschlag

15 Module, gruppiert nach Verantwortung. Reihenfolge spiegelt Extraktions-Sequenz (Helper → State → Entitäten → Features → Glue).

| # | Datei | Verantwortung | Zeilen-Range in app.js | Hauptfunktionen |
|---|---|---|---|---|
| **Helper-Schicht (geringe Kopplung)** | | | | |
| 1 | `config.js` | Branding, Supabase-URL/Key (existiert schon) | — | — |
| 2 | `utils.js` | `esc`, `formatPreis`, `formatDateDE`, `formatDateCompact`, `formatTime`, `parseLocalDate`, `toISODate`, `formatDuration`, `formatLastLogin` | 2685–2769 (~85), 3437–3650 (~210), 14831–14959 (Capture-Helper) | reine Funktionen, keine DB |
| 3 | `status.js` | `PROJECT_STATUS`/`DEPLOYMENT_STATUS`/`APPOINTMENT_STATUS`/`TASK_STATUS`, `_statusLabelCache`, `_loadStatusLabels`, `getStatusLabel`, `dispStatus`, `projektStatusFarbe`, `einsatzStatusFarbe`, `aufgabeStatusLabel`, `appointmentStatusLabel` | 2213–2310, 11939–12055 (Status-Cache), 21887–21909 (Aufgaben-Status), 22480–22500 (Termin-Status) | DB-Cache + Lookup-Helper |
| 4 | `db.js` | `db`-Client (Supabase), `SUPABASE_URL`, `FUNCTIONS_URL`, `currentUser`, `currentProfile`, Auth-Flow (`loginUser`, `logoutUser`, `isAdmin`) | 2186–2196, 2318–2370, 7257–7532 | — |
| 5 | `dom.js` | `applyAdminOnlyUI`, `showToast`, `customConfirm`, `MODAL_CLOSERS`, Kebab-Menü, Drawer-Open-Watcher | 2706–2884, 2771–2849 (Confirm), 16099–16124 (Modal-Gruppen) | nur DOM |
| **State-Schicht** | | | | |
| 6 | `state.js` | Alle `editing<X>Id`-Vars, `current<X>DetailId`, alle Caches (`companiesCache`, `contactsCache`, …), Prefill-Vars, `pendingXFilter`, Recently-Visited | 2318–2650 | mit Getter/Setter-Wrappern |
| **Entity-Schicht (eine Datei pro Entität)** | | | | |
| 7 | `companies.js` | Liste, Modal, Detail-Page V2, Themen-Tab | 10112–10456 (Liste), 10457–10815 (Detail), 23736–24159 (V2-Detail + Themen-Tab) | ~2000 |
| 8 | `contacts.js` | Liste, Modal, Detail-Page V2 | 10816–11050, 24161–24360 | ~600 |
| 9 | `projects.js` | Liste, Modal, Detail-Page V2 (Wirtschaftlichkeit, Planung, Brief), Projekt-Produkte, Bündel | 11947–12260 (Liste), 12116–12259 (Modal), 12562–12848 (Detail), 12849–12942 (auf Firma), 14968–15355 (Produkte), 15356–15964 (Bündel), 22964–23734 (V2-Detail) | ~3500 |
| 10 | `deployments.js` | Liste, Modal, Detail-Page V2, Capture-Stream, Auto-Status, Quick-Toggle | 13259–13606 (Liste), 13607–14427 (Modal), 14428–14698 (Entitlement-Einlösung), 14699–14804 (auf Firma), 14805–14967 (auf Projekt), 15965–16098 (Auto-Status), 24567–25202 (V2-Detail) | ~3500 |
| 11 | `appointments.js` | Liste, Modal, Detail-Page V2 | 11052–11521 (Liste+Modal), 11409–11521 (Teilnehmer), 24362–24566 (V2-Detail) | ~900 |
| 12 | `tasks.js` | Liste, Modal | 21882–22033 | ~150 |
| 13 | `notes.js` | Liste, Modal (Notiz-CRUD im Aktivitäten-Stream) | 21918–22033 | ~115 |
| 14 | `users.js` | Admin-Benutzerverwaltung (Edge-Function-Calls) | 7257–7532 | ~275 |
| 15 | `lookups.js` | Stammdaten-Page (`#/stammdaten`) | 7726–7900 | ~175 |
| **Feature-Schicht** | | | | |
| 16 | `services.js` | Leistungen-Verwaltung | 7534–7724 | ~190 |
| 17 | `templates.js` | Vorlagen (Termin/Aufgabe/Einsatz/Projekt) | 7902–8679 | ~775 |
| 18 | `programs.js` | Mitgliedschafts-Programme | 9352–9661 | ~310 |
| 19 | `memberships.js` | Mitgliedschaften + Entitlements | 9663–10112 | ~450 |
| 20 | `themes.js` | Bibliothek + Quick-Add + Picker | 8803–9351, 28149–28287, 28288–28707 | ~1000 |
| 21 | `documentation.js` | Strukturierte Dokumentation pro Entität | 8681–8801, 28708–28890 | ~300 |
| 22 | `tags.js` | Cross-Entity Labels | 26357–26561 | ~205 |
| 23 | `attachments.js` | Datei-Anhänge an Firma/Projekt/Einsatz | 26562–26794 | ~235 |
| 24 | `shortcuts.js` | Quick-Links auf Arbeitsplatz | 26795–26952 | ~160 |
| 25 | `duplicates.js` | Dubletten-Erkennung | 26953–28141 | ~1190 |
| 26 | `products.js` | Hardware-Katalog | 28142–28148 (Stub?), evtl. mehr | ~? |
| 27 | `csv-import.js` | Firma/Kontakt-Import | 25686–26356 | ~670 |
| 28 | `report.js` | PDF-Kundenbericht | 29102–29570 (mit `_e`, `_textToParas` etc.) | ~470 |
| **Workspace-Schicht** | | | | |
| 29 | `arbeitsplatz.js` | 3-Spalten-Layout, Stage, Karteikarte, Welcome | 5924–6131, 6132–6552 (Karteikarte) | ~620 |
| 30 | `briefing.js` | Dein-Tag Dashboard (Heute/Woche/Monat), KPI-Tiles, Pipeline-Forecast | 19235–21881 | ~2650 |
| 31 | `pins.js` | Favoriten / Pins | 5363–5497 | ~135 |
| 32 | `inbox.js` | Inbox / Dranbleiben / Datenpflege | 5499–5922 | ~425 |
| 33 | `kalender-bar.js` | Mitarbeiter-Zeitstrahl-Footer | 18539–18905 | ~370 |
| 34 | `search.js` | Globale Suche (Cmd+K) | 16125–16598 | ~475 |
| 35 | `tabs.js` | Detail-Tabs Mechanik | 16599–16668 | ~70 |
| 36 | `quickactions.js` | ABC-Modal, Schnellaktionen, FAB, Inline-Expand | 17393–17481, 17482–18538, 22795–22963 | ~1310 |
| 37 | `quick-create.js` | Inline-Anlegen aus anderen Modals | 18906–19234 | ~330 |
| **Status-Engine** | | | | |
| 38 | `status-flow.js` | Status-Weiterbringen-Engine (Primary Action, Picker) | 25203–25391 | ~190 |
| 39 | `workflow.js` | Workflow-Checklisten + Inline-Editor | 25392–25685 | ~295 |
| **Glue / Entry-Point** | | | | |
| 40 | `app.js` | Boot, Hash-Router, Init, Page-Wechsel | 6552–7257, 29571 ff. (Init) | ~720 |

> **Konsolidierungs-Idee:** statt 40 Module → eher 15 grobe (entities zusammen, features zusammen). Detail-Aufteilung in Folge-Sessions optional.

---

## Vorgeschlagene Modul-Reihenfolge (Extraktion)

Helper zuerst (geringes Risiko, viele Importeure), Entitäten in der Mitte, Glue zuletzt.

1. `utils.js` — pure Funktionen, kein Cross-Talk
2. `status.js` — hängt nur von `db.js`
3. `db.js` + `dom.js` — Foundation für alles
4. `state.js` — zentraler State (alle anderen Module importieren)
5. `tasks.js` + `notes.js` — kleinste Entitäten, gute Testfälle für den Pattern
6. `companies.js`, `contacts.js` — mittlere Komplexität
7. `appointments.js`, `deployments.js`, `projects.js` — die fetten drei
8. Feature-Module (themes, attachments, tags, …)
9. `briefing.js`, `arbeitsplatz.js` — UI-Schichten
10. `report.js` — isolierter Block am Ende
11. `app.js` Glue — Router + Boot + Init

Jedes Modul lebt in einem eigenen Commit. Smoke-Test nach jeder Extraktion: Login → Liste laden → Detail öffnen → Status-Toggle.

---

## Migrationsstrategie

### 1. Module-Style

```html
<!-- index.html -->
<script src="config.js"></script>
<script src="branding.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script type="module" src="src/main.js"></script>
```

Jedes Modul exportiert seine Funktionen:

```js
// src/utils.js
export function esc(s) { ... }
export function formatPreis(n) { ... }
```

Und macht UI-Funktionen für inline `onclick=` global verfügbar:

```js
// src/companies.js
import { esc } from './utils.js';
import { db } from './db.js';

export async function openCompanyModal(mode, id) { ... }
export async function deleteCompany(id) { ... }
// ...

// Inline-onclick-Bridge: alle UI-Funktionen ans window-Objekt
window.openCompanyModal = openCompanyModal;
window.deleteCompany    = deleteCompany;
// ...
```

### 2. Globale State-Variablen

Zentrale State-Datei mit Getter/Setter, damit cross-modular zugegriffen werden kann:

```js
// src/state.js
export const state = {
  currentUser: null,
  currentProfile: null,
  editingCompanyId: null,
  // ...
};

// Caches als Arrays (mutierbar):
export const companiesCache = [];
export const contactsCache = [];
// ...
```

Konsumenten: `import { state, companiesCache } from './state.js';`

Schreiben: `state.editingCompanyId = id;` oder `companiesCache.push(...)`.

### 3. Risiko-Minimierung

- **Nach jeder Modul-Extraktion: voller Smoke-Test in Production.** Vercel deployt automatisch nach Push.
- **Erste Extraktion (`utils.js`) als Pilot:** wenn das durchläuft, ist das Pattern validiert.
- **Bei Bruch: revertieren ist trivial** (`git revert <commit>`), weil jedes Modul ein eigener Commit ist.

### 4. Was NICHT mit extrahiert wird

- **`config.js` + `branding.js`** bleiben classic scripts (laufen vor Module-Loading, müssen `window.APP_CONFIG` early setzen).
- **Supabase JS CDN-Script** bleibt classic (kein Modul-Wrapper).
- **CSP-Header** in `vercel.json` bleibt unverändert — Modules laufen in `script-src 'self'`, das ist erlaubt.

---

## Aufwand-Schätzung

| Phase | Module | Sessions |
|---|---|---|
| 4.1 | Plan (dieses Dokument) | ✅ 1 (jetzt) |
| 4.2 | Helper (`utils.js`, `status.js`, `db.js`, `dom.js`, `state.js`) | 1–2 |
| 4.3 | Kleine Entitäten (tasks, notes, services, lookups, users) | 1 |
| 4.4 | Mittlere Entitäten (companies, contacts, appointments) | 2 |
| 4.5 | Große Entitäten (projects, deployments) | 2–3 |
| 4.6 | Feature-Module (themes, attachments, tags, …) | 2 |
| 4.7 | Workspace + Briefing + Glue | 1–2 |
| **Gesamt** | | **10–12 Sessions** |

Jede Session liefert mindestens ein Modul committed + deployed + smoke-getestet.

---

## Offene Fragen vor Phase 4.2

1. **Namensraum für Module:** `src/` vs. flach im Root?  
   Empfehlung: `src/` — sonst rohes Wurzel-Verzeichnis sehr unübersichtlich.

2. **Naming-Konvention:** `kebab-case.js` (companies-list.js) vs. eindeutige Kleinbuchstaben (companies.js)?  
   Empfehlung: schlicht `companies.js`, `deployments.js` etc. — passt zur DB-Tabellen-Benennung.

3. **TypeScript opt-in?**  
   JSDoc-Annotations + checkJS würden Type-Sicherheit ohne Build-Schritt geben — aber zusätzliche Komplexität. Empfehlung: erstmal Plain JS, TypeScript erst wenn Module stabilisiert.

4. **Migration der Inline-Handler:**  
   `window.X = X` Pattern in jedem Modul am Ende? Oder zentrale `expose.js` Datei, die alle ans window hängt?  
   Empfehlung: pro Modul am Ende — sonst muss `expose.js` immer alle Module importieren.

---

## Erfolgskriterien

- **Vorher:** `app.js` mit 29.578 Zeilen, schwer durchsuchbar, Merge-Konflikte fast garantiert bei parallelem Arbeiten.
- **Nachher:** ~15 Module à 500–3500 Zeilen, klare Verantwortung pro Datei, Bugs leichter zu lokalisieren, Test-Stellen offensichtlich.

**Kein Build-Step, keine neuen Tools, kein npm install.** Native ES-Module funktionieren in allen modernen Browsern (>96 % Marktanteil).
