# Phase A.4 — Cache, Refresh, Cross-Entity-Logik

Statisches Audit der Cache-Invalidierungs-, Cross-Entity-Refresh- und Termin↔Einsatz-/Entitlement-Pfade in `app.js` (v2.32.13). Schwerpunkt auf Stellen, an denen Writes oder Status-Updates die in-memory Caches stale lassen oder kontextsensitiven Refresh überspringen.

---

## Critical

### #1 Status-Picker schreibt Labels statt system_keys → bricht v2.31-Invariante

- Datei: `app.js:25647`, `:25672`–`:25686`, `:25725`–`:25727`
- Symptom: `_loadStatusOptions` lädt `lookup_values` ohne `system_key`. Der Picker übergibt `o.wert` (Anzeige-Label, z. B. `"Durchgeführt"`) an `selectEntityStatus`, das es direkt in `deployments.status`/`appointments.status`/`projects.status` schreibt. Seit v2.31 müssen das system_keys sein. Der Kommentar in Z. 25723–25724 dokumentiert den Defekt sogar explizit: „kann Label oder system_key sein — der Picker übergibt aktuell o.wert, also Label."
- Code:
  ```js
  // _loadStatusOptions (25647)
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe, reihenfolge')  // ← system_key fehlt
    .eq('kategorie', cat).eq('ist_aktiv', true).order('reihenfolge');
  // selectEntityStatus (25725-25727)
  const { error } = await db.from(table)
    .update({ status: newStatus })  // newStatus = o.wert (Label!)
    .in('status', [currentStatus]).eq('id', entityId);
  ```
- Repro: Einsatz-Detail → Status-Pille → „Durchgeführt" wählen → DB enthält `status='Durchgeführt'`. (a) `checkAndUpdateProjectStatus` vergleicht `=== 'durchgefuehrt'` → Einsatz zählt nicht als done, Projekt bleibt fälschlich „In Arbeit". (b) Filter im Listing finden den Einsatz nicht mehr. (c) Beim nächsten Modal-Öffnen kein Status-Match → Default-Sprung auf ersten Wert.
- **Verbindung zu Phase B High #1:** Dies ist die Quelle der 2 Projekte mit `'Abgeschlossen'`/`'Abschlussphase'`-Labels in der Produktions-DB. Daten-Drift ist messbar.
- Fix-Vorschlag: `_loadStatusOptions` zusätzlich `system_key` selecten; Picker-HTML schreibt `${o.system_key}`; danach `checkAndUpdateProjectStatus(project_id)` (siehe #2).

### #2 Status-Picker ruft `checkAndUpdateProjectStatus` nicht

- Datei: `app.js:25613` (`advanceEntityStatus`), `app.js:25707` (`selectEntityStatus`)
- Symptom: Beide schreiben direkt ohne Auto-Projekt-Status-Recompute. Projekt hängt in „In Arbeit", obwohl letzter Einsatz per Picker auf „Durchgeführt" gesetzt wurde.
- Repro: Projekt P mit einem Einsatz E (Geplant). Auf E die Status-Pille → „Durchgeführt". P bleibt „In Arbeit" (sollte „Abschlussphase").
- Fix-Vorschlag: `project_id` vor dem Update laden, danach `checkAndUpdateProjectStatus(project_id)` — analog `saveDeployment` Z. 14672–14674 / `saveAppointment` Z. 12146–12148. Auch für `advanceEntityStatus`.

### #3 `deleteEntityById('deployment', …)` löscht keine `entitlement_redemptions`

- Datei: `app.js:3202`–`:3249` (`_performSoftDelete`); Vergleich `app.js:14984` (`deleteDeployment` löscht hart).
- Symptom: Soft-Delete via Listen-Icon kaskadiert nur Termine, nicht Redemptions. Bonus bleibt als „verbraucht" gebucht, Einsatz ist weg → Mitgliedschafts-Bilanz stimmt nicht mehr. Modal-Delete-Pfad und Dispatcher-Pfad sind inkonsistent.
- Code:
  ```js
  if (entityType === 'deployment') {
    const { data: appts } = await db.from('appointments').select('id').is('deleted_at', null).eq('deployment_id', id);
    coupledApptIds = (appts || []).map(a => a.id);
    if (coupledApptIds.length) {
      await db.from('appointments').update({ deleted_at: deletedAt }).eq('deployment_id', id);
    }
    // ← entitlement_redemptions unangetastet
  }
  ```
- Repro: Firma F, Mitgliedschaft 8/8. Einsatz E1 mit Bonus-Einlösung (1) → Karte zeigt 7/8. Liste `#/einsaetze` → Kebab → Löschen. E1 weg, Karte zeigt weiter 7/8.
- Fix-Vorschlag: Deployment-Branch in `_performSoftDelete` um `await db.from('entitlement_redemptions').delete().eq('deployment_id', id);` ergänzen + Confirm-Text um Bonus-Warnung erweitern (wie `deleteDeployment`).

### #4 `deleteEntityById('deployment'/'appointment', …)` triggert keinen Auto-Projekt-Status

- Datei: `app.js:3299`–`:3329` (`refreshAfterEntityChange`)
- Symptom: Listen-Icon-Delete refresht nur die Liste; Modal-Delete-Pfade (`deleteDeployment` Z. 14991, `deleteAppointment` Z. 12194) rufen explizit `checkAndUpdateProjectStatus`.
- Repro: Projekt P mit Einsatz E1 „Durchgeführt", E2 „Geplant". In `#/einsaetze` Kebab am E2 → Löschen. E2 weg, P bleibt „In Arbeit" (sollte „Abschlussphase"/„Abgeschlossen").
- Fix-Vorschlag: In `_performSoftDelete` vor dem Soft-Delete `project_id` mitlesen und am Ende (sowie im Undo) `checkAndUpdateProjectStatus(projectId)` rufen.

### #5 `deleteEntityById('task', …)` lässt task↔termin-Kopplung verwaist

- Datei: `app.js:3202`–`:3249`; Vergleich `app.js:22889` (`deleteTask`).
- Symptom: `_performSoftDelete` branched nur auf `deployment`, nicht auf `task`. Task soft-gelöscht, aber `appointments` mit `task_id = …` bleiben live im Kalender / in Listen.
- Repro: Aufgabe mit „Auch als Termin eintragen" anlegen. In `#/aufgaben` Kebab → Löschen. Aufgabe weg, Termin bleibt sichtbar.
- Fix-Vorschlag: Task-Branch in `_performSoftDelete` analog Deployment-Branch — `await db.from('appointments').update({ deleted_at }).eq('task_id', id).is('deleted_at', null)`. Undo analog.

### #6 Mitgliedschaft-Soft-Delete lässt Entitlements als „offen" im Bonus-Picker

- Datei: `app.js:10352`–`:10387` (`deleteMembership`); `app.js:14782`–`:14816` (`refreshRedeemSection`).
- Symptom: FK `entitlements → memberships ON DELETE CASCADE` greift nur bei HARD-Delete. `refreshRedeemSection` filtert `entitlements` nach `company_id`, joined `memberships`, prüft aber NICHT `memberships.deleted_at IS NULL`. Bonis einer „gelöschten" Mitgliedschaft erscheinen weiter im Einlöse-Dropdown.
- Code:
  ```js
  // deleteMembership: nur Soft-Delete der Mitgliedschaft
  await db.from('memberships').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  // refreshRedeemSection (14782): kein deleted_at-Filter
  const { data: entitlements } = await db.from('entitlements')
    .select('*, memberships(...), projects(...)')
    .eq('company_id', companyId).order('verfall_datum', ...);
  ```
- Repro: Firma F, 1 aktive Mitgliedschaft (8/8). Mitgliedschaft löschen. Neuer Einsatz für F → Bonus-Sektion zeigt weiter „8 offen" auf der gelöschten Mitgliedschaft → buchbar.
- Fix-Vorschlag: Entweder (a) `deleteMembership` setzt `entitlements.verfall_datum` der Mitgliedschaft auf gestern (oder soft-deleted sie), oder (b) `refreshRedeemSection` joined nur Memberships mit `deleted_at IS NULL`. (a) ist vollständiger.

---

## High

### #7 `programsCache` nach `saveProgram`/`deleteProgram` nicht invalidiert → falsche Entitlements

- Datei: `app.js:9946` (Cache), `app.js:9808`–`:9903` (`saveProgram`), `app.js:9905`–`:9936` (`deleteProgram`), Nutzung in `saveMembership` `app.js:10322`.
- Symptom: `saveProgram` ruft `loadPrograms()` (nicht `loadProgramsCache()`). `programsCache` bleibt stale. `saveMembership` greift bei Neuanlage per `programsCache.find(p => p.id === program_id)` auf `membership_program_benefits` zu, um Entitlements zu erzeugen.
- Repro: Admin ändert Benefit-Menge im Programm „Premium" von 8 → 12 → speichert. Direkt Firma F → „+ Mitgliedschaft" → „Premium" wählen → speichern. Entitlements bekommen 8 statt 12, weil Cache veraltet.
- Fix-Vorschlag: Am Ende `saveProgram`/`deleteProgram`: `programsCache = []` (oder Helper `invalidateProgramsCache`).

### #8 Lookup-Caches werden nach `saveLookup`/`deleteLookup` nie invalidiert

- Datei: `app.js:8105`–`:8175`; betroffen: `_statusLabelCache` (2516), `terminTypenCache` (11336), `projektStatusCache` (12240), `einsatzStatusCache` (13551), `aufgabeStatusCache` (22252), `_statusOptionsCache` (25641).
- Symptom: Alle UI-Lookups (Status-Pillen-Farben, Dropdown-Optionen, Default-Termintyp in `syncDeploymentAppointment`) zeigen alten Stand bis Hard-Reload.
- Repro: Stammdaten → „einsatz_status / Geplant" auf andere Farbe → speichern. Projekt-Detail öffnen → Badges zeigen alte Farbe bis F5.
- Fix-Vorschlag: Zentraler Helper `invalidateLookupCaches(kategorie?)`, am Ende von `saveLookup`/`deleteLookup` rufen. Mindestens alle vier Status-Caches + `_statusLabelCache` + `_statusOptionsCache` + Termintypen leeren.

### #9 `companiesCache` wird nach `saveCompany`-Edit auf Firma-Detail nicht aktualisiert

- Datei: `app.js:10707`–`:10711`.
- Symptom: Wenn auf der Firma-Detailseite gespeichert wird, läuft nur `loadCompanyDetail` — `companiesCache` (Listen-Quelle, Combobox-Quelle, Map-Quelle) bleibt mit altem Namen.
- Repro: „Müller GmbH" Detail → umbenennen in „Müller AG" → speichern. Neues Termin-Modal öffnen → Combobox zeigt weiter „Müller GmbH".
- Fix-Vorschlag: `const idx = companiesCache.findIndex(c => c.id === savedId); if (idx >= 0) companiesCache[idx] = { ...companiesCache[idx], ...payload };` nach erfolgreichem Update.

### #10 `saveContact` aktualisiert `contactsCache` / `companyContactsMap` nicht (bei Firma-Wechsel)

- Datei: `app.js:11256`–`:11312`.
- Symptom: Bei Bearbeitung auf Kontakt-Detail wird nur `loadContactDetail` gerufen; das patcht `companyContactsMap[neueCompanyId]`, aber `companyContactsMap[alteCompanyId]` enthält den Kontakt weiter, und `contactsCache` ist komplett unverändert.
- Repro: Kontakt-Detail von „Anna" (Firma X) → Firma auf Y wechseln → speichern. Firma-X-Detail-Page zeigt Anna weiter in der Kontaktliste; `companyContactsMap['X']` enthält sie weiter (Termin-Modal-Pillen-Aktivität).
- Fix-Vorschlag: Auf Firma-Wechsel `loadCompanyContacts(alteCompanyId)` + Patch in `contactsCache`. Oder Helper, der beide Map-Slots updated.

### #11 `resolveContactComboboxValue` legt Kontakt an, ohne Caches zu updaten

- Datei: `app.js:19447`–`:19473`.
- Symptom: Inline-getippter Kontakt wird in DB inserted, aber weder `contactsCache` noch `companyContactsMap` gepatcht. Folge-Modale sehen den Kontakt nicht. Vergleich: `resolveCompanyComboboxValue` (19390) macht es richtig für Firmen.
- Repro: Einsatz für Firma F mit neuem Kontakt „Anna Müller" speichern. Direkt „Folge-Einsatz" → Kontakt-Combobox zeigt Anna nicht in der Datalist.
- Fix-Vorschlag: Nach Insert `companyContactsMap[insertData.company_id]?.push({ id, vorname, nachname, ... })` + `contactsCache.push(...)`.

### #12 `companyAppointmentMap` nach Termin-CRUD aus dem Termine-Listing/Kontakt-/Projekt-Detail nicht aktualisiert

- Datei: `app.js:12151`–`:12162` (`saveAppointment`), `app.js:12216`–`:12229` (`_refreshAppointmentContext`), `app.js:3309`–`:3313` (`refreshAfterEntityChange`).
- Symptom: Map wird NUR in `loadCompanies` und im Firma-Detail-Zweig refreshed. „Nächster Termin"-Spalte auf `#/firmen` bleibt stale.
- Repro: `#/firmen` zeigt Firma F „Nächster: 28.05.". `#/termine` → 28.05.-Termin auf 04.06. ändern → speichern. Zurück zu `#/firmen` → F zeigt weiter 28.05.
- Fix-Vorschlag: Im `else`-Zweig (`loadAppointments`-Pfad) zusätzlich `loadCompanyAppointmentMap()` rufen.

### #13 `syncDeploymentAppointment` aktualisiert Termin-Caches nicht

- Datei: `app.js:14704`–`:14756`.
- Symptom: Termin wird direkt INSERTed/UPDATEd; `_refreshDeploymentContext` routet zur Einsatz-Liste, nicht zur Termin-Liste. Folge: `companyAppointmentMap`, „Nächster Termin"-Spalte, `#/termine`-Cache zeigen den gekoppelten Termin nicht.
- Fix-Vorschlag: `_refreshDeploymentContext` (15018) zusätzlich `loadCompanyAppointmentMap()` aufrufen.

### #14 `window._pendingRedemptionEntitlementId` wird nicht zurückgesetzt

- Datei: `app.js:14120`–`:14131` (set), `app.js:14444`–`:14450` (`closeDeploymentModal` resetet NICHT), `app.js:14846`–`:14857` (Anwendung), `app.js:14814` (Filter „istAktuelleRedemption").
- Symptom: Wird im Edit-Pfad gesetzt, im New-Pfad NICHT initialisiert. Wenn User Edit-Modal mit Redemption R öffnet, ohne Save schließt, dann „+ Einsatz" klickt, läuft `refreshRedeemSection` und prä-aktiviert R im neuen Einsatz. Zusätzlich trickst der Filter (Z. 14814) Entitlements mit `rest=0` in die Liste.
- Repro: Einsatz E1 (mit Redemption für Bonus B) öffnen, Escape. Direkt „+ Einsatz" → neues Modal → Bonus-Checkbox ist angekreuzt und B vorausgewählt.
- Fix-Vorschlag: In `closeDeploymentModal` UND am Anfang von `openDeploymentModal` (mode='new'): `window._pendingRedemptionEntitlementId = null; window._pendingRedemptionMenge = null;`. Nach `syncDeploymentRedemption` ebenfalls resetten.

### #15 `syncDeploymentAppointment` kann Termin-Duplikate erzeugen (mit Undo-Race)

- Datei: `app.js:14704`–`:14756`, in Wechselwirkung mit `app.js:12172`–`:12214` (`deleteAppointment`).
- Symptom: SELECT in `syncDeploymentAppointment` filtert `deleted_at IS NULL`. Wenn User Termin T (gekoppelt) löscht (soft) und sofort Einsatz mit Checkbox ON erneut speichert, wird ein neuer Termin T' INSERTet (T soft-deleted, T' live → DB hat zwei Termine mit selber `deployment_id`). Wenn User dann Undo am Termin-Toast klickt: T wieder live → Doppel-Termin im Kalender/in der Liste.
- Fix-Vorschlag: `syncDeploymentAppointment` sucht auch nach soft-gelöschten Termine mit selber `deployment_id` und reaktiviert (`deleted_at = null`) statt neu zu inserten. Alternativ: bei Termin-Soft-Delete mit deployment-Kopplung `deployment_id = NULL` setzen.

### #16 Bundle-Save/-Delete triggert keinen Auto-Projekt-Status

- Datei: `app.js:15944`–`:16103` (`saveDeploymentBundle`), `app.js:16105`–`:16122` (`deleteDeploymentBundle`).
- Symptom: Bündel-Speichern updated mehrere Deployments (inkl. Status), ruft nur `refreshProjectAfterFinanceChange`. Bundle-Delete entkoppelt, aber Status auch nicht.
- Repro: Projekt P „In Arbeit" mit Bundle B (3 Tage, alle Geplant). Bundle-Modal → Tage-Status auf Durchgeführt → speichern. P bleibt „In Arbeit".
- Fix-Vorschlag: Am Ende beider Funktionen `await checkAndUpdateProjectStatus(currentProjectDetailId)` rufen.

---

## Medium

### #17 `userProfilesCache` nach `saveUser`/`deleteUser` nicht invalidiert

- Datei: `app.js:7680`–`:7761`.
- Symptom: Edge-Function-CRUD; `loadUsers` aktualisiert nur die Admin-Liste, nicht den globalen Cache (12256). Aufgabe-/Termin-/Mitgliedschaft-Modale zeigen alte Liste bis Reload.
- Fix-Vorschlag: `userProfilesCache = []` am Ende.

### #18 `servicesCache` nach `deleteService` nicht invalidiert

- Datei: `app.js:7969`–`:7999`; Vergleich `saveService` macht es (Z. 7956) richtig.
- Symptom: Gelöschte Leistung bleibt im Einsatz-Modal-Dropdown.
- Fix-Vorschlag: `servicesCache = []` vor `await loadServices()`.

### #19 `_composerSaveEinsatzBundle` und `quickAddProjectActivity` ohne Auto-Status

- Datei: `app.js:31956`–`:32075`, `app.js:12788`–`:12830`.
- Symptom: Bulk-Anlagen rufen kein `checkAndUpdateProjectStatus`. Für initial-„Geplant" unkritisch, aber sobald Status retroaktiv „Durchgeführt" wird, hängt das Projekt.
- Fix-Vorschlag: Am Ende beider Pfade `await checkAndUpdateProjectStatus(project_id)`.

### #20 `companiesCache` Schema-Mismatch je nach Loader

- Datei: `app.js:10454` (`loadCompanies` `*`), `app.js:11345` (`loadAppointments` `id, name`), `app.js:13908` (`openDeploymentModal` `id, name, strasse, plz, stadt`), Konsument `app.js:14181` (Auto-Ort).
- Symptom: Welches Modul den Cache zuerst lazy befüllt, bestimmt welche Spalten verfügbar sind. Auto-Ort-Auto-Fill liefert nichts, wenn Cache nur `{id, name}` enthält.
- Fix-Vorschlag: Vereinheitlichen — kleinster gemeinsamer Cache-Shape mit allen relevanten Adress-Feldern, oder lazy nachladen wenn Felder fehlen.

### #21 Mitgliedschaft-Update lässt Entitlements veraltet (`verfall_datum`, Programm-Wechsel)

- Datei: `app.js:10313`–`:10316`.
- Symptom: Im Edit-Branch wird nur `memberships`-Update gemacht. `entitlements.verfall_datum` bleibt am alten `end_datum`; bei Programm-Wechsel zeigen die Entitlements weiter Bonis des alten Programms.
- Repro: Mitgliedschaft M `2026 → 2026-12-31`. Editieren → `end_datum = 2027-06-30`. `entitlements.verfall_datum` bleibt 2026-12-31 → ab 2027-01-01 als abgelaufen markiert obwohl Mitgliedschaft läuft.
- Fix-Vorschlag: Bei `end_datum`-Änderung `db.from('entitlements').update({ verfall_datum: end_datum }).eq('membership_id', editingMembershipId)`. Programm-Wechsel im Edit blocken.

### #22 Multi-Tab Cache-Drift (kein BroadcastChannel)

- Symptom: Parallele Tabs schreiben unsynchronisiert. Tab B's `companiesCache.find(...)` liefert weiterhin gelöschte Firmen → Combobox-Save in B führt zu FK-Fehler. Lookup-Änderungen in A werden in B nicht reflektiert. `_statusLabelCache`, `appointmentsCache`, `companyAppointmentMap`, etc. alle betroffen.
- Fix-Vorschlag (außerhalb des Scopes als Code-Fix, aber als Dokumentations-/Architekturhinweis): in CLAUDE.md aufnehmen, dass Multi-Tab nicht supported ist; optional `BroadcastChannel('cumart-cache')` mit Invalidierungs-Topics.

### #23 `_composerSaveEinsatzBundle` ohne `invalidateThemesCache`

- Datei: `app.js:32060`–`:32072`.
- Symptom: Bündel inserted `deployment_themes` für n Tage, aber kein `invalidateThemesCache(project_id)`. `themesCacheByProject[project_id].einsatz_count` bleibt veraltet bis nächste Auflösung.
- Fix-Vorschlag: Nach den Junction-Inserts `invalidateThemesCache?.(project_id)` aufrufen.

---

## Low

### #24 `_statusOptionsCache` mit selber Stale-Problematik wie #8

- Datei: `app.js:25641`–`:25652`.
- Fix-Vorschlag: Zusammen mit #8 resetten.

### #25 `companyContactsMap` REPLACE in `loadCompanyContacts` ohne Stale-Check auf andere Firma-Slots

- Datei: `app.js:10962`.
- Symptom: Bei Kontakt-Firma-Wechsel bleibt der Eintrag im alten Slot stehen (Korrelation mit #10).
- Fix-Vorschlag: Beim Patch in `loadCompanyContacts`/`loadContactDetail` andere Map-Einträge auf Verweise zum gleichen Kontakt prüfen und entfernen.

### #26 `closeDeploymentModal` resetet `_pendingComposerThemenIds` nicht

- Datei: `app.js:14444`–`:14450`.
- Symptom: Composer-Pfad resetet das Set; bei Abbruch über X-Button persistiert es bis zum nächsten Composer-Open. Aktuell low, weil das klassische Modal den Set nicht liest.
- Fix-Vorschlag: Defensiv `_pendingComposerThemenIds = new Set()` in `closeDeploymentModal`.

### #27 `markDeploymentDone` / `quickDeploymentMarkDone` SELECT/UPDATE ohne `deleted_at`-Filter

- Datei: `app.js:21771`–`:21778`, `app.js:18566`–`:18573`.
- Symptom: Inkonsistent zu allen anderen Pfaden. Toggelt theoretisch Status auf soft-gelöschten Datensätzen.
- Fix-Vorschlag: `.is('deleted_at', null)` im SELECT und UPDATE ergänzen.

### #28 Undo-Pfad für `deleteMembership` reaktiviert keine Entitlements

- Datei: `app.js:10371`–`:10384`.
- Symptom: Wenn #6 via Entitlement-Anpassung gefixt wird, muss Undo den Original-Zustand wiederherstellen.
- Fix-Vorschlag: Im Undo `verfall_datum` aus `membership.end_datum` rekonstruieren.

---

## Info

### #29 `themesCacheByProject`-Management als positives Referenz-Muster

- Datei: `app.js:9086`–`:9092` (`invalidateThemesCache`), 9 Call-Sites.
- Beobachtung: Sauberer dedizierter Invalidierungs-Helper, an JEDEM Schreibpfad gerufen. Empfehlung: Andere Caches (`companiesCache`, `contactsCache`, `programsCache`, Lookup-Caches) auf das gleiche Muster bringen — pro Cache ein `invalidate<X>Cache`-Helper als Single-Source-of-Truth.

### #30 `editing<Entity>Id` / `current<Entity>DetailId` Race zwischen parallelen Modals

- Beobachtung: Globale Variablen nicht stack-safe; parallele Modal-Öffnungen können IDs überschreiben. Außerhalb des Cache-Scopes, aber relevant für späteres Modal-Lifecycle-Refactor.

### #31 `appointmentsCache` ist always-fresh (kein lazy-return)

- Datei: `app.js:11340`–`:11380`.
- Beobachtung: Im Gegensatz zu anderen Caches macht `loadAppointments` immer einen Full-Fetch. Damit ist der Cache nach jedem `#/termine`-Besuch sauber — erklärt, warum andere Pfade ihn nicht aktiv pflegen müssen. Trade-off: jeder Termine-Besuch ist ein Full-Scan.

### #32 Inline-angelegte Datensätze tragen nur Minimal-Felder

- Datei: `app.js:19372` (Firma), `app.js:19447` (Kontakt), `app.js:31933` (Projekt-Inline).
- Beobachtung: Hängt mit #20 zusammen. `resolveCompanyComboboxValue` pusht nur `{id, name}` in `companiesCache`. Konsumenten, die `c.strasse` etc. erwarten, bekommen `undefined`.

---

## Zusammenfassung

| Severity | Count |
|----------|-------|
| Critical | 6     |
| High     | 10    |
| Medium   | 7     |
| Low      | 5     |
| Info     | 4     |
| **Total**| **32**|

**Größte Hebel** (wenn nur wenige Fixes umgesetzt werden):

1. **#1 + #2** (Status-Picker) — bricht v2.31-System-Key-Konvention und Auto-Projekt-Status. Gemeinsam fixen. **Direkter Beleg in Phase B High #1 (2 Projekte mit Label-Status in Produktion).**
2. **#7** (`programsCache`) — direkter Bonus-Fehlbuchungs-Pfad bei Programm-Edit.
3. **#3 + #4 + #5** (Konsistenz `_performSoftDelete` vs. Modal-Delete) — alle drei sind dasselbe Strukturproblem: der zentrale Dispatcher ist „dümmer" als die Modal-Pfade. Den Helper anreichern, alle drei sind weg.
4. **#6** (Mitgliedschaft-Soft-Delete → Phantom-Bonis) — direkte Bonus-Bilanz-Verfälschung im UI.
5. **#8** (Lookup-Caches) — nutzer-sichtbar nach jedem Stammdaten-Edit, plus Risiko bei Status-Umbenennung.
