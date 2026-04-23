# CLAUDE.md

Diese Datei enthält Hinweise für Claude Code (claude.ai/code), wenn mit Code in diesem Repository gearbeitet wird.

## Projekt-Überblick

Internes CRM für Cumart Consulting. **Vanilla HTML/CSS/JS SPA** (kein Framework, kein Build-Schritt) auf Basis von **Supabase** (Postgres + Auth + eine Edge Function). Deployment via Vercel Auto-Deploy von `main` nach `https://cumart.cloud`.

Die UI-Sprache ist durchgängig **Deutsch** (Labels, Statuswerte, sichtbare Texte). Neue UI-Texte bitte auf Deutsch halten.

Siehe `architecture.md` für die maßgebliche Spezifikation — sie wird mit jedem Release synchron gehalten und ist die einzige Quelle der Wahrheit für Schema, Versionshistorie und entitätsübergreifende Logik. **Version erhöhen und den betreffenden Abschnitt aktualisieren, sobald du Schema, entitätsübergreifendes Verhalten oder ein größeres Feature änderst.** Der Banner-Kommentar am Dateianfang von `app.js` sollte ebenfalls synchron bleiben.

## Befehle

Es gibt kein Build-, Lint- oder Test-Tooling. Das Repository besteht aus drei flachen Dateien plus einer Edge Function.

- **Lokal ausführen:** `index.html` direkt im Browser öffnen oder das Verzeichnis mit einem beliebigen statischen Server ausliefern (z. B. `python3 -m http.server 8000`). Die Supabase-URL und der Anon-Key sind in `app.js` hartcodiert — lokale Entwicklung greift auf das Produktions-Supabase zu.
- **Deploy:** commit + push auf `main`. Vercel deployt automatisch in ~30–60 s neu. Hard-Reload (Cmd+Shift+R), um den Cache zu umgehen.
- **Edge-Function-Deploy:** `supabase/functions/manage-users/index.ts` muss separat über das Supabase-Dashboard oder die CLI deployt werden; Vercel erkennt sie *nicht*. „Verify JWT with legacy secret" muss bei dieser Function deaktiviert bleiben.
- **Schema-Migrationen:** manuell im Supabase SQL-Editor angewendet, **oder** über die Supabase Management API (`POST https://api.supabase.com/v1/projects/loohjeiysjxzbmfwkyvv/database/query` mit einem Personal Access Token, den der Nutzer in der Session bereitstellt). Nach dem Anwenden die Verifizierungs-Query am Ende von `architecture.md` §14.6 ausführen, um zu bestätigen, dass alle benötigten Constraints/Tabellen/Lookup-Werte vorhanden sind.

## Stehende Autorisierung (erteilt am 22.04.2026 durch Selcuk)

Der Nutzer hat folgende Aktionen vorab autorisiert, sodass keine einzelne Bestätigung nötig ist:

- **Supabase-Datenänderungen per Migrations-SQL** — Anwenden versionierter Migrationsdateien aus `migrations/` auf die Produktionsdatenbank (Management API oder SQL-Editor). Umfasst DDL (`CREATE`, `ALTER`, `DROP`) und Datenstrukturänderungen, die Teil einer eingecheckten Migration sind.
- **Git-Commits und Pushes auf `main`** — normale vorwärtsgerichtete Commits und `git push` für Feature-Releases. Vercel deployt automatisch von `main`, d. h. Push = Deploy in Produktion.

**Weiterhin ausdrücklich bestätigungspflichtig** (NICHT durch die stehende Autorisierung abgedeckt):

- **Destruktives SQL außerhalb einer Migrationsdatei** — ad-hoc `DELETE` / Massen-`UPDATE` auf Live-Nutzerdaten, `DROP TABLE` außerhalb einer Migration, In-Place-Rückabwicklung einer Migration.
- **Destruktive Git-Operationen** — `push --force`, `reset --hard` auf `main`, Löschen von Branches, Umschreiben veröffentlichter Historie.
- **Credential-/Secret-Änderungen** — Rotieren des hartcodierten `SUPABASE_ANON_KEY`, Änderungen an RLS, die den Admin aussperren könnten, Änderungen am Auth-Verhalten der `manage-users` Edge Function.

Im Zweifel zuerst fragen. Der Umfang deiner Aktion muss sich an dem orientieren, was die Migration/der Commit tatsächlich beschreibt.

## Architektur

### Dateistruktur

```
index.html   ~2,46k Zeilen — alle Seiten als <div class="page">, alle Modals als versteckte Divs
styles.css   ~1,68k Zeilen — CSS-Variablen + Desktop/Mobile
app.js       ~7,87k Zeilen — jedes Modul in einer Datei, flache Globals für State
supabase/functions/manage-users/index.ts — Deno-Edge-Function für invite/update/delete/reset_password
migrations/              — versionierte SQL-Migrationen, manuell oder per Management API angewendet
```

### SPA-Modell

- Hash-Router (`#/firmen`, `#/firma/:id`, `#/projekt/:id`, …). Seiten sind gleichrangige `<div class="page">`-Elemente; das Routing schaltet `.active` um.
- Einsätze und Mitgliedschaften haben **keine Detail-Route** — sie werden ausschließlich über Modals bearbeitet.
- State lebt in flachen `let`-Globals am Anfang von `app.js` (`currentProfile`, `editing<Entity>Id`, `current<Entity>DetailId`, `<entity>Cache`, Prefill-Variablen).
- Caches werden **lazy befüllt und nach Writes manuell invalidiert**. Wenn du einen neuen Write-Pfad für eine Entität hinzufügst, deren Cache explizit leeren/aktualisieren (siehe bestehende Muster für `servicesCache`, `programsCache`, `companyContactsMap`).

### Modal-Konventionen

Jede Entität hat ihr eigenes Modal mit einem kurzen **ID-Präfix** für Formularfelder (vollständige Tabelle in `architecture.md` §7.6):
`c-*` Firmen, `k-*` Kontakte, `t-*` Termine, `p-*` Projekte, `d-*` Einsätze, `u-*` Nutzer, `s-*` Leistungen, `l-*` Lookups, `pr-*` Programme, `ms-*` Mitgliedschaften, `a-*` Aufgaben. Dieses Schema beim Hinzufügen von Feldern einhalten — über das Präfix finden die Handler ihre Inputs.

Zusammenklappbare Modal-Gruppen (`<div class="modal-group-title">`) schalten alle folgenden Geschwister-Elemente via Event-Delegation um — funktioniert automatisch in jedem Modal.

### Domänenmodell — was ist abrechenbar, was ist Aufwand

Diese Unterscheidung ist tragend durch die ganze App; sie zu verletzen bricht die Umsatzauswertung:

- **Termin** — Meeting/Akquise-Kontaktpunkt. **Nicht abrechenbar.** Nur Aufwand.
- **Einsatz (deployment)** — die abrechenbare Einheit. `menge × einzelpreis` ist Kundenumsatz *nur dann*, wenn keine `project_id` gesetzt ist.
- **Projekt** — Paket aus Einsätzen mit einem Festpreis (`geschaetzter_umsatz`). Wenn ein Einsatz eine `project_id` hat, ist sein `einzelpreis` *internes Aufwands-Tracking*, kein Kundenumsatz. Der Paketpreis ist das, was der Kunde sieht.
- **Aufgabe (task)** — interne To-Do-Notiz, zuweisbar an `user_profiles.id` (sich selbst oder anderen). **Nicht abrechenbar, keine Umsatzwirkung, keine Kopplung an Einsatz/Termin.** Bewusst entkoppelt, um die Domänen-Invarianten (Umsatz aus Einsätzen/Projekten) nicht zu stören.
- **Leistungsumsatz** — Summe der Einsatz-Positionswerte innerhalb eines Projekts (für Soll/Ist-Vergleich gegen den Paketpreis).
- **Mitgliedschaft** — Abonnement. **Leistungen aus dem Programm werden zu `entitlements`** (Kontingentzeilen), sobald die Mitgliedschaft erstellt wird; jede Nutzung wird in `entitlement_redemptions` protokolliert, normalerweise 1:1 mit einem Einsatz verknüpft.

### Entitätsübergreifende Abläufe, die erhalten bleiben müssen

- **Termin↔Einsatz-Kopplung** (`appointments.deployment_id`): Das Umschalten der Checkbox „Auch als Termin eintragen" an einem Einsatz erstellt, aktualisiert oder **löscht** den verknüpften Termin. Das Löschen des Einsatzes löscht auch seinen Termin. Das Entfernen des Datums löscht ihn. Vollständige Regeln in `architecture.md` §8.4.
- **Auto-Projektstatus** (`checkAndUpdateProjectStatus*`): Nach jedem CRUD an den Einsätzen/Terminen eines Projekts wechselt der Projektstatus basierend auf dem Fortschritt zwischen `In Arbeit → Abschlussphase → Abgeschlossen`. Die `…Smart()`-Variante für reine DOM-Updates (Quick-Toggle-Checkboxen) verwenden, die einfache Variante nach Modal-Speicherungen. Tabelle in `architecture.md` §8.5.
- **Entitlement-Einlösungen im Einsatz-Modal** (v1.14): Das Modal zeigt einen Einlösungs-Abschnitt, wenn die gewählte Firma offene Entitlements hat. Edge Cases werden über `window._pendingRedemption*`-Variablen gehandhabt — siehe §8.9. Schlüsselregel: Beim Bearbeiten darf die *eigene* bestehende Einlösung des Einsatzes nicht gegen das Restkontingent zählen (sonst könntest du deine eigene Menge nie erhöhen).
- **Anlage einer Mitgliedschaft erzeugt Entitlements** (v1.13): Das Speichern einer Mitgliedschaft erstellt automatisch pro `membership_program_benefits`-Eintrag eine `entitlements`-Zeile. Das Bearbeiten eines Programms verwendet **Benefits-Ersetzung** (erst alles löschen, dann neu einfügen), ändert aber die Entitlements bestehender Mitgliedschaften nicht.
- **Kontextsensitives Refresh nach CRUD**: `save<X>`/`delete<X>` prüft, welche Detail-Seite gerade aktiv ist, und aktualisiert nur den relevanten Abschnitt. Das bitte erhalten, wenn du neue Speicherpfade hinzufügst — der Mitgliedschaften-Abschnitt einer Firma sollte aktualisiert werden, wenn sich einer ihrer Einsätze ändert.

### Statuswerte kommen aus der DB, nicht aus dem Code

`projekt_status`, `einsatz_status` und `aufgabe_status` haben **keine CHECK-Constraints** (entfernt in v1.9.6 bzw. nie angelegt in v1.22). Erlaubte Werte sind das, was in `lookup_values` aktiv ist. Die Validierung in `app.js` liest den Lookup-Cache, keine hartcodierte Whitelist.

**Vorbehalt:** Die Strings `Abschlussphase`, `Abgeschlossen`, `Durchgeführt`, `Abgerechnet`, `geplant`, `durchgefuehrt`, `offen`, `erledigt` werden von der Auto-Status-Logik bzw. Checkbox-Toggle referenziert. Nicht umbenennen — stattdessen mit `ist_aktiv=false` deaktivieren.

### RLS-Aufstellung

Hybrid: striktes Admin-Write auf `user_profiles`, `roles`, `lookup_values`; offenes Authenticated auf allen operativen Tabellen (companies, contacts, deployments, memberships, entitlements, …). Privilegierte Aktionen (invite / delete / password reset / Admin-Rollenänderungen) laufen über die `manage-users` Edge Function, dort gehört auch der Schutz des letzten Admins hin (siehe Roadmap §13.1).

### Admin-only-UI

`data-admin-only="true"` an Elemente setzen; `applyAdminOnlyUI()` blendet sie für Nicht-Admins aus. Admin-UI nicht mit ad-hoc-`if`-Checks gaten.

## Konventionen

- **Benennung:** Funktionen `camelCase` in Englisch (`loadCompanyDetail`), DB-Spalten `snake_case` auf Deutsch (`geschaetzter_umsatz`), HTML-IDs `kebab-case` mit dem Modal-Präfix (`d-datum-von`).
- **Keine Emojis in UI-Texten** (professionelles Deutsch beibehalten).
- **Destruktive Aktionen** laufen über `confirm()`. FK-Verletzungsfehler in `delete<X>` werden abgefangen und als freundliche Toasts angezeigt.
- **Icon-Action-Buttons** in Listenansichten (bearbeiten/kopieren/duplizieren/löschen) kommen aus `renderActionIcons(entityType, id)` mit zentralen Dispatchern (`deleteEntityById`, `duplicateEntity`, `copyXById`) — nicht pro Liste neu erfinden.
- **Mobile:** 16 px Input-Font-Size ist Absicht (verhindert iOS-Zoom). `.col-action` ist auf Mobile ausgeblendet — primäre Aktion ist der Titel-Link. Tabellen verwenden `table-layout: fixed`.

## Wenn du ein Feature hinzufügst

1. Falls es das Schema ändert: Migrations-SQL schreiben, in Supabase anwenden, Verifizierungs-Query in `architecture.md` §14.6 erweitern.
2. Das Feature in `app.js` ergänzen (alles in einer Datei halten — keine Module/Bundling einführen).
3. `architecture.md` aktualisieren (Version erhöhen, Zeile in §12 ergänzen, relevante Abschnitte aktualisieren) und den Banner-Kommentar am Anfang von `app.js` entsprechend anpassen.
4. Mit Versions-Tag committen (siehe jüngstes `git log` für den Stil — Deutsch, `vX.Y.Z: <Zusammenfassung>`).
