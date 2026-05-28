# Phase A.1 — Status & Auto-Status-Logik

Statisches Code-Audit auf Stand `main` (v2.32.13). Fokus: Status-Identitäts-Bruch nach Block-2-Migration (system_keys statt Labels) und Lücken in der Auto-Projekt-Status-Logik.

Die Findings sind nach Schweregrad gruppiert, durchgehend nummeriert (#1…#N).

---

## Critical (Crash / Datenverlust / falscher Status persistiert)

### #1 Status-Picker schreibt **Labels** statt **system_keys** in die DB
- Datei: `app.js:25643–25652`, `25676–25686`, `25707–25732`
- Symptom: Klick auf eine Status-Pille (Projekt/Einsatz/Termin) öffnet ein Popup. Der Popup-Loader (`_loadStatusOptions`) selektiert NUR `id, wert, farbe, reihenfolge` — `system_key` fehlt im SELECT. Das Popup rendert dann `value=o.wert` und ruft `selectEntityStatus(entityType, entityId, o.wert, currentStatus)`. `selectEntityStatus` schreibt `o.wert` (= das **Label**, z. B. `'Abgeschlossen'`, `'In Arbeit'`, `'Durchgeführt'`) als neuen `status` in die DB.
- Code:
  ```js
  // _loadStatusOptions (25647) — system_key fehlt!
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe, reihenfolge')
    .eq('kategorie', cat).eq('ist_aktiv', true).order('reihenfolge');

  // Render (25677, 25681)
  const isCurrent = o.wert === currentStatus;
  …onclick="…selectEntityStatus('…','…','${esc(o.wert)}','${esc(currentStatus)}')"

  // selectEntityStatus (25723–25726) — Entwickler weiß es!
  // „der Picker übergibt aktuell o.wert, also Label"
  const { error } = await db.from(table)
    .update({ status: newStatus }).in('status', [currentStatus]).eq('id', entityId);
  ```
- Reproduktion: Auf Projekt-Detail-Seite (oder Einsatz/Termin-Detail) auf die Status-Pille klicken → Status aus dem Popup wählen → DB-Zeile enthält danach ein Label wie `'Abgeschlossen'`, nicht den system_key `'abgeschlossen'`. Alle nachfolgenden Status-Vergleiche (Filter, Auto-Status, KPIs, `dispStatus()`) verfehlen diesen Datensatz. CLAUDE.md sagt explizit: „NIE Status-Labels im Code referenzieren". Hier wird das Label sogar in die DB geschrieben.
- Sonderfall **termin_status**: Labels und system_keys sind dort identisch (`'geplant'`/`'durchgefuehrt'`), Bug bleibt versteckt. Beim `einsatz_status` ist `'Geplant'` (Label) ≠ `'geplant'` (system_key). Beim `projekt_status` ist alles betroffen (`'Lead'`/`'lead'`, `'In Arbeit'`/`'in_arbeit'`, `'Abschlussphase'`/`'abschlussphase'`, …).
- Fix-Vorschlag:
  1. `_loadStatusOptions` selektiert zusätzlich `system_key`.
  2. Render: `value=o.system_key`, `isCurrent = o.system_key === currentStatus`, Label-Anzeige weiter via `o.wert`.
  3. `selectEntityStatus` erhält damit den system_key — kein weiterer Bug-Pfad.
  4. Defense-in-depth: Status-Konstante validieren (`Object.values(PROJECT_STATUS).includes(newStatus)` etc.) bevor in DB geschrieben wird.

### #2 `selectEntityStatus`/`advanceEntityStatus` triggern **keinen** Auto-Projekt-Status
- Datei: `app.js:25613–25628` (advance), `25707–25732` (select)
- Symptom: Beide Pfade ändern den Status einer Entität (deployment, appointment, project) per UPDATE und triggern danach nur `loadProjectDetail`/`loadDeploymentDetail`/`loadAppointmentDetail`, aber **kein** `checkAndUpdateProjectStatus`. Wenn ein Einsatz oder Termin per Picker auf `Durchgeführt` (oder zurück auf `Geplant`) geschoben wird und der Datensatz zu einem Projekt gehört, läuft die Auto-Status-Logik nicht.
- Code:
  ```js
  // advanceEntityStatus (25619–25622)
  const { error } = await db.from(flow.table)
    .update({ status: toStatus }).in('status', [fromStatus]).eq('id', entityId);
  …
  if (entityType === 'project'    && currentProjectDetailId)    loadProjectDetail(currentProjectDetailId);
  // → kein checkAndUpdateProjectStatus für project_id des Einsatzes/Termins
  ```
- Reproduktion: Projekt-Detail offen → ein durchgeführter Einsatz wird per Picker auf `Geplant` zurückgesetzt → Projekt-Status bleibt fälschlich auf `Abschlussphase`/`Abgeschlossen`. Umgekehrt: letzter Einsatz auf `Durchgeführt` schalten → Projekt bleibt auf `In Arbeit`.
- Fix-Vorschlag: Nach dem UPDATE für `deployment`/`appointment` die `project_id` der Entität laden und `checkAndUpdateProjectStatus(project_id)` aufrufen.

### #3 Soft-Delete via Kebab-Menü umgeht Auto-Projekt-Status komplett
- Datei: `app.js:3202–3249` (`_performSoftDelete`), `3253–3277` (`deleteEntityById`)
- Symptom: Der zentrale Delete-Dispatcher (`deleteEntityById` → `_performSoftDelete`), der von allen Listen-Zeilen-Icons (Kebab → „Löschen") aufgerufen wird, ruft **kein** `checkAndUpdateProjectStatus`, obwohl `entityType` `'deployment'` oder `'appointment'` sein kann.
- Code:
  ```js
  // _performSoftDelete — Auto-Status fehlt komplett
  const { error } = await db.from(table).update({ deleted_at: deletedAt }).eq('id', id);
  …
  // Bei Einsatz: gekoppelten Termin auch soft-deleten. IDs merken für Undo.
  let coupledApptIds = [];
  if (entityType === 'deployment') { … }
  …
  // → kein checkAndUpdateProjectStatus
  ```
- Vergleich: Die Modal-Pfade (`deleteDeployment`, `deleteAppointment`) machen es korrekt (laden `affectedProjectId`, rufen `checkAndUpdateProjectStatus`). Der Listen-Pfad nicht.
- Reproduktion: Projekt mit allen Einsätzen auf `Durchgeführt`, einem Termin auf `Geplant`, Projekt-Status `Abschlussphase`. Termin via Kebab → Löschen → Projekt müsste auf `Abgeschlossen` springen (alle Einsätze done + keine offenen Termine mehr). Tut es nicht.
- Fix-Vorschlag: In `_performSoftDelete` vor dem UPDATE die `project_id` der Entität (für `'deployment'` / `'appointment'`) laden, nach dem UPDATE `checkAndUpdateProjectStatus(project_id)` aufrufen. Im Undo-Pfad ebenso (mit invertierter Sicht).

### #4 Termin-Status-Modal-Select ist hartcodiert auf 2 Werte — `Storniert` etc. nicht setzbar
- Datei: `index.html:3523–3526` (Termin-Modal), `app.js:12078`
- Symptom: Das `<select id="t-status">` im Termin-Modal hat nur zwei statische `<option>`-Einträge (`geplant`, `durchgefuehrt`). Im Gegensatz zu `p-status`, `d-status`, `a-status`, die per JS aus den `lookup_values` befüllt werden (mit system_key als value). Validierung in `saveAppointment` Z. 12078 prüft hart gegen `['geplant', 'durchgefuehrt']` statt gegen den Lookup-Cache:
  ```js
  if (!['geplant', 'durchgefuehrt'].includes(status)) { showToast('Status ungültig.', true); return; }
  ```
- Folge: Wenn ein Mandant in `lookup_values` einen weiteren `termin_status` (z. B. `'abgesagt'`) anlegt, kann er ihn im Termin-Modal nicht setzen. Wenn ein Termin per Status-Picker (#1) auf einen anderen Wert geschoben wurde, lässt sich er im Modal nicht mehr speichern (`Status ungültig`).
- Fix-Vorschlag: HTML-Select dynamisch aus `lookup_values.kategorie = 'termin_status'` befüllen (analog zu `d-status`), Validierung gegen den Cache statt der hartcodierten Liste.

### #5 `toggleDeploymentDone` / `toggleAppointmentDone` syncen **nicht** den gekoppelten Termin/Einsatz
- Datei: `app.js:16187–16221` (toggleAppointmentDone), `16315–16350` (toggleDeploymentDone)
- Symptom: Beim Quick-Toggle auf Projekt-Detail wird nur die eine Entität geupdated. Beim Modal-Save (`saveDeployment` → `syncDeploymentAppointment`) wird der Termin-Status nachgeführt — beim Quick-Toggle nicht. Result: Einsatz auf `Durchgeführt`, gekoppelter Termin bleibt auf `Geplant` (sichtbar in allen Termin-Listen).
- Code:
  ```js
  async function toggleDeploymentDone(deploymentId, isChecked, checkboxEl) {
    const newStatus = isChecked ? DEPLOYMENT_STATUS.DURCHGEFUEHRT : DEPLOYMENT_STATUS.GEPLANT;
    …
    const { error } = await db.from('deployments')
      .update({ status: newStatus }).eq('id', deploymentId);
    // → kein syncDeploymentAppointment, kein Termin-Update
  }
  ```
- Auch betroffen: `quickDeploymentMarkDone` (18565), `quickDeploymentMarkBilled` (18582), `markDeploymentDone` (21768), `markDeploymentBilled` (21788).
- Reproduktion: Einsatz mit gekoppeltem Termin (Checkbox „Auch als Termin eintragen" beim Anlegen). Auf Projekt-Detail per Checkbox abhaken → Einsatz=`Durchgeführt`, Termin=`Geplant`. Inkonsistenter Zustand in der Termin-Liste/Kalender.
- Fix-Vorschlag: Nach jedem Quick-Status-Wechsel eines Einsatzes auch den gekoppelten Termin (FK `appointments.deployment_id`) updaten — entweder analog der `syncDeploymentAppointment`-Logik (mapping `DURCHGEFUEHRT/ABGERECHNET → durchgefuehrt`, `GEPLANT → geplant`), oder eine Helper-Funktion extrahieren.

### #6 `saveDeployment`: Projekt-Wechsel hinterlässt verwaisten Auto-Status im **alten** Projekt
- Datei: `app.js:14671–14674`
- Symptom: Beim Bearbeiten eines bestehenden Einsatzes wird vor dem UPDATE die alte `project_id` nicht geladen. Nach dem UPDATE wird nur `checkAndUpdateProjectStatus(saved.project_id)` für das **neue** Projekt ausgeführt. Wenn der User den Einsatz von Projekt A nach Projekt B verschiebt (oder zu standalone macht: `project_id = null`), bleibt Projekt A in einem veralteten Auto-Status.
- Code:
  ```js
  // Auto-Projekt-Status-Check wenn Einsatz an Projekt gebunden
  if (saved.project_id) {
    await checkAndUpdateProjectStatus(saved.project_id);
  }
  // → alte project_id wird nirgendwo nachgehalten
  ```
- Reproduktion: Projekt A hat einen einzigen Einsatz auf `Geplant` (Status `In Arbeit`). Diesen Einsatz öffnen und auf Projekt B verschieben. Projekt A hat jetzt 0 Einsätze, müsste laut Spec keinen Auto-Status-Change bekommen (`!depStats.hasAny → return`). Aber wenn Projekt A mehrere Einsätze hatte und der eine verschoben war der einzige offene → Projekt A bleibt auf `In Arbeit`, müsste aber auf `Abschlussphase`/`Abgeschlossen` springen.
- Fix-Vorschlag: Vor dem UPDATE die alte `project_id` aus der DB lesen (für `editingDeploymentId`). Nach dem UPDATE für beide IDs (alt + neu, falls verschieden) `checkAndUpdateProjectStatus` aufrufen.
- Analog für `saveAppointment` Z. 12054–12170 (gleiches Muster) — dort denselben Fix.

---

## High (sichtbar fehlerhaft, kein Datenverlust)

### #7 `updateProjectHeaderStatusBadge` zeigt **system_key** statt Label
- Datei: `app.js:16296–16305`
- Symptom: Nach einem Auto-Status-Change durch `checkAndUpdateProjectStatusSmart` wird das Projekt-Header-Badge mit `badge.textContent = newStatus` belegt — `newStatus` ist der **system_key** (z. B. `'abgeschlossen'`, `'in_arbeit'`). Das Badge zeigt dann den Rohwert statt das Label.
- Code:
  ```js
  function updateProjectHeaderStatusBadge(newStatus) {
    …
    badge.textContent = newStatus;   // ← sollte dispStatus(newStatus) sein
  }
  ```
- Reproduktion: Auf Projekt-Detail per Checkbox letzten geplanten Einsatz abhaken → Auto-Status springt auf `Abgeschlossen` → Badge zeigt `abgeschlossen` (klein, ohne Umlaute) statt das mandantenspezifische Label.
- Fix-Vorschlag: `badge.textContent = dispStatus(newStatus);` (oder `getStatusLabel('projekt_status', newStatus, newStatus)`).

### #8 `toggleDeploymentDone` rendert Status-Badge mit system_key statt Label
- Datei: `app.js:16331–16334`
- Symptom: Nach Quick-Toggle wird die Status-Zelle der Zeile gerendert mit `${esc(newStatus)}` — wieder system_key statt Label. Zeile rendert `geplant` / `durchgefuehrt` statt `Geplant` / `Durchgeführt`. Vergleich: `toggleAppointmentDone` Z. 16204 verwendet korrekt `${esc(appointmentStatusLabel(newStatus))}`.
- Code:
  ```js
  statusCell.innerHTML = `<span class="badge" style="…">${esc(newStatus)}</span>`;
  ```
- Fix-Vorschlag: `${esc(dispStatus(newStatus))}` analog zur Termin-Variante.

### #9 `renderProjectModalActivities` zeigt system_keys statt Labels
- Datei: `app.js:12783`
- Symptom: Im Projekt-Modal-Aktivitäten-Block (sichtbar nach „Anlegen" eines neuen Projekts mit Sub-Items) wird `${esc(it.status || '')}` direkt gerendert — der Wert kommt aus DB-Spalten (`appointments.status`, `tasks.status`, `deployments.status`) und ist nach v2.31 ein system_key. User sieht `'geplant'`, `'offen'`, `'durchgefuehrt'`.
- Code:
  ```js
  <span class="p-activity-status">${esc(it.status || '')}</span>
  ```
- Fix-Vorschlag: `${esc(dispStatus(it.status))}` (kategorie-unabhängig).

### #10 `toggleTaskDone` / `quickTaskComplete` syncen gekoppelten Termin nicht
- Datei: `app.js:22918–22927`, `18815–18823`
- Symptom: Beim Abhaken einer Aufgabe (via Inline-Checkbox oder Schnellaktion „Erledigen") wird nur `tasks.status` auf `'erledigt'` gesetzt. Der über `appointments.task_id` gekoppelte Termin (v1.40) bleibt auf `'geplant'`. Beim Modal-Save (`saveTask` → `syncTaskAppointment`) wird der Termin nachgeführt; beim Quick-Toggle nicht.
- Code:
  ```js
  async function toggleTaskDone(taskId, isDone) {
    const update = isDone
      ? { status: 'erledigt', erledigt_am: new Date().toISOString() }
      : { status: 'offen',    erledigt_am: null };
    const { error } = await db.from('tasks').update(update).eq('id', taskId);
    // → kein Termin-Sync
  }
  ```
- Außerdem: `quickTaskComplete` (18815) setzt `erledigt_am` gar nicht — Inkonsistenz zur Modal-Save-Variante.
- Fix-Vorschlag: Beide Funktionen rufen analog `syncTaskAppointment(taskId, taskData, /* shouldExist */ true)` auf bzw. einen schlankeren Helper, der den Termin-Status mappt. `quickTaskComplete` muss `erledigt_am` setzen.

### #11 `saveDeploymentBundle` / `deleteDeploymentBundle` triggern keinen Auto-Projekt-Status
- Datei: `app.js:15944–16103`, `16105–16125`
- Symptom: Beide Bundle-Operationen legen Einsätze an, löschen sie soft oder ändern deren Status (`r.status || DEPLOYMENT_STATUS.GEPLANT`), rufen aber nur `refreshProjectAfterFinanceChange`, das wiederum **kein** `checkAndUpdateProjectStatus` macht.
- Code:
  ```js
  // refreshProjectAfterFinanceChange (15687–15696)
  await Promise.all([
    loadProjectProducts(projectId),
    loadProjectDeployments(projectId),
    p ? loadProjectDashboard(p) : Promise.resolve()
  ]);
  ```
- Reproduktion: Projekt-Detail → neues Bündel mit allen Tagen auf `Durchgeführt` anlegen → Projekt müsste auto auf `Abschlussphase` springen. Tut es nicht.
- Fix-Vorschlag: In `refreshProjectAfterFinanceChange` einen `await checkAndUpdateProjectStatus(projectId)` ergänzen, oder am Ende der jeweiligen Bundle-Save/-Delete-Funktion.

### #12 `quickAddProjectActivity` triggert keinen Auto-Projekt-Status
- Datei: `app.js:12789–12830`
- Symptom: Beim Quick-Add aus dem Projekt-Modal werden Termine/Aufgaben/Einsätze ins Projekt eingefügt. Wenn das Projekt bereits in `Abschlussphase`/`Abgeschlossen` ist und ein neuer Einsatz mit `Geplant` dazukommt, müsste der Projekt-Status laut Spec zurück auf `In Arbeit` springen. Tut er nicht.
- Code:
  ```js
  } else if (typ === 'einsatz') {
    …
    const { error } = await db.from('deployments').insert({…, status: DEPLOYMENT_STATUS.GEPLANT, …});
    …
  }
  await renderProjectModalActivities(editingProjectId);
  // → kein checkAndUpdateProjectStatus(editingProjectId)
  ```
- Fix-Vorschlag: Am Funktionsende `await checkAndUpdateProjectStatus(editingProjectId)`.

### #13 Termin-Status-Sync bei storniertem Einsatz mappt fälschlich auf `durchgefuehrt`
- Datei: `app.js:14734`
- Symptom: `syncDeploymentAppointment` mappt den Termin-Status aus dem Einsatz-Status wie folgt:
  ```js
  const terminStatus = deployment.status === DEPLOYMENT_STATUS.GEPLANT ? 'geplant' : 'durchgefuehrt';
  ```
  Damit landen auch `Storniert` und `Abgerechnet` auf `'durchgefuehrt'`. Beim stornierten Einsatz ist das semantisch falsch — der Termin hat nicht stattgefunden.
- Fix-Vorschlag: Explizites Mapping mit Schalt-Logik (DURCHGEFUEHRT/ABGERECHNET → `durchgefuehrt`, GEPLANT → `geplant`, STORNIERT → Termin löschen oder Termin-Status auf `'geplant'` zurücksetzen; UNGEPLANT → Termin löschen, da kein Datum).

### #14 Termin-Status-Validierung `saveAppointment` ist hartcodiert
- Datei: `app.js:12078`
- Symptom: Validierung gegen die zwei hartkodierten system_keys. Wenn ein Mandant einen neuen `termin_status` (z. B. `'abgesagt'`) anlegt und der Status-Picker (nach Fix #1) ihn an einen Termin setzt, lässt das Modal das Speichern nicht zu.
- Code:
  ```js
  if (!['geplant', 'durchgefuehrt'].includes(status)) { showToast('Status ungültig.', true); return; }
  ```
- Fix-Vorschlag: Analog zu `saveDeployment` Z. 14524: `!Object.values(APPOINTMENT_STATUS).includes(status) && !terminStatusCache.some(s => s.system_key === status)` (Termin-Status-Cache müsste auch lazy geladen werden, gibt's noch nicht).

---

## Medium (Edge Case / Inkonsistenz mit Spec)

### #15 Hartcodierte Status-Strings statt Konstanten (DB-Filter / JS-Vergleiche)
- Dateien: viele Stellen in `app.js`. Beispiele:
  - `app.js:11018–11019, 13071–13072, 13096, 13438–13439, 18193, 18232, 18235, 21990` — `a.status === 'durchgefuehrt' / 'geplant'`
  - `app.js:5436, 5438, 5775, 5778, 17117, 17309, 17556, 18050, 18076, 18666, 19726, 19730, 19735, 23114` — `.neq('status', 'erledigt')`
  - `app.js:5781, 5784, 6152, 17131, 17316, 17570` — `.eq('status', 'geplant')`
  - `app.js:5854, 6052, 17121, 17312, 17560, 19742, 19875, 19881` — `.eq('status', 'durchgefuehrt')` / `.eq('status', 'erledigt')`
  - `app.js:5333, 18235, 18817, 18828, 22760, 22764, 22843, 22920–22921, 22936, 24858–24859, 25534–25535` — Direkte `status: 'erledigt' / 'offen' / 'durchgefuehrt' / 'geplant'`
  - `app.js:8898, 8908, 9313, 9355, 12798, 12808, 24239, 24263, 24846, 25418, 25456, 28742, 31933` — Insert mit hartcodiertem Status
- Symptom: Funktioniert, solange Label = system_key. Verletzt aber die Block-2-Konvention aus CLAUDE.md („NIE Status-Labels im Code referenzieren … immer system_keys über die Konstanten-Maps"). Risiko: wenn jemand in v2.32+ den system_key umbenennt oder die String-Form ändert, brechen alle Stellen lautlos. Auch erschwert es das Suchen/Refactoring.
- Reproduktion: Globales Suchen nach `'erledigt'` zeigt ~50+ Treffer, `'durchgefuehrt'` ~15+, `'geplant'` ~12+, `'offen'` ~20+.
- Fix-Vorschlag: Iterativ durch `TASK_STATUS.ERLEDIGT`, `APPOINTMENT_STATUS.GEPLANT`, `DEPLOYMENT_STATUS.DURCHGEFUEHRT` etc. ersetzen. Code-Konvention klar machen mit ESLint-Custom-Rule oder grep-Check im CI.
- `TASK_STATUS` wird laut grep aktuell nur EINMAL benutzt (`app.js:2737`) — der ganze Aufgaben-Bereich verwendet hartcodierte Strings. Konstanten dort komplett ungenutzt.

### #16 `appointmentStatusBg` / `appointmentStatusColor` unterstützen nur 2 Fälle
- Datei: `app.js:3754–3755`
- Symptom:
  ```js
  function appointmentStatusBg(s)    { return s === 'geplant' ? '#eff6ff' : '#f0fdf4'; }
  function appointmentStatusColor(s) { return s === 'geplant' ? '#1d4ed8' : '#16a34a'; }
  ```
  Wenn jemand termin_status um `'storniert'` erweitert, gibt's grün (false-Branch).
- Fix-Vorschlag: switch über system_keys mit `default` auf `var(--muted)`, oder über `_statusLabelCache[…].farbe` (analog zu `projektStatusFarbe`/`einsatzStatusFarbe`).

### #17 Status-Pille-Anzeige am Termin-Detail mit Tippfehler-CSS-Klasse
- Datei: `app.js:24741`
- Symptom:
  ```js
  const cls = a.status === APPOINTMENT_STATUS.DURCHGEFUEHRT ? 'durchgefhrt' : 'geplant';
  ```
  CSS-Klasse `status-pill-durchgefhrt` (mit Tippfehler) — vermutlich kein zugehöriger CSS-Selektor in `styles.css` definiert, fällt auf Default zurück.
- Fix-Vorschlag: `'durchgefuehrt'`.

### #18 Projekt-Template `text-or-lookup` speichert Label statt system_key
- Datei: `app.js:8462–8466`, `8218–8223`
- Symptom: Im Projekt-Template-Editor wird Status als `text-or-lookup` definiert mit `kategorie: 'projekt_status'`. Der Editor schreibt `value=o.wert` (Label) in das Select. Beim Anwenden des Templates über `applyTemplateToEntity` (8811–8842) wird der Wert direkt ins `p-status`-Select gesetzt (`el.value = val`). Da `p-status` mit `value=s.system_key` befüllt ist, matcht das Label nicht — das Select bleibt auf dem Default. **Oder**: wenn der User manuell ein Lookup-Label in den Template-Editor eingibt, landet das in der DB als Default-Status.
- Code:
  ```js
  // Z. 8463 — Kommentar verrät den Bug
  // Für projekt_status: lookup_values.wert wird als Text gespeichert (kein FK)
  const opts = (lookupOptions[f.key] || []).map(o =>
    `<option value="${esc(o.wert)}" ${val === o.wert ? 'selected' : ''}>${esc(o.wert)}</option>`).join('');
  ```
- Fix-Vorschlag: Statt `wert` den `system_key` als value laden + speichern. Lookup-Loader (Z. 8415–8417) muss `system_key` mitselektieren.

### #19 `_loadStatusOptions`-Cache wird nie invalidiert
- Datei: `app.js:25641–25652`
- Symptom: `_statusOptionsCache[entityType]` ist ein Module-Level-Cache, der nie geleert wird. Wenn ein Admin ein Status-Lookup umbenennt, deaktiviert oder hinzufügt, sieht der Picker bis zum Page-Reload alte Werte.
- Fix-Vorschlag: Cache nach `saveLookup`/`deleteLookup` invalidieren (analog zu anderen Lookup-Caches).

### #20 `saveLookup` schreibt keinen `system_key` bei neuen Status-Lookup-Einträgen
- Datei: `app.js:8105–8143`
- Symptom: Wenn ein Admin in den Stammdaten einen neuen `projekt_status`-Wert anlegt, geht der Payload ohne `system_key` raus. Damit fehlt der wichtigste Identitäts-Schlüssel — der Datensatz erscheint zwar im Dropdown, aber `_loadStatusLabels` ignoriert ihn (`if (!row.system_key) continue;`), und `projektStatusFarbe(systemKey)` findet ihn nicht.
- Code:
  ```js
  const payload = { kategorie, wert, farbe, reihenfolge, ist_aktiv };
  // → kein system_key, kein Auto-Mapping aus 'wert' → 'wert'.toLowerCase().replace(…)
  ```
- Fix-Vorschlag: Bei den 4 Status-Kategorien automatisch einen `system_key` aus `wert` ableiten (lowercase, ASCII, snake_case), oder ein eigenes Feld im Modal exposen, das nur für Status-Kategorien sichtbar ist.

### #21 `checkAndUpdateProjectStatus` springt nicht zurück auf `Lead`/`Angebot`
- Datei: `app.js:16395`, Spec `architecture.md:801–814`
- Symptom: Die Auto-Status-Logik ist im Code dokumentiert „Lead/Angebot/Verloren: keine Automatik". Der Code bestätigt das mit `if (!aktiveStatus.includes(projektStatusKey)) return;`. Das ist vermutlich gewollt — aber: Wenn ein Projekt manuell auf `Angebot` zurückgesetzt wird, der Auto-Status hat es vorher auf `Abschlussphase` gebracht, und danach ein neuer Einsatz kommt → der Auto-Status läuft nicht mehr, weil `Angebot ∉ [IN_ARBEIT, ABSCHLUSSPHASE, ABGESCHLOSSEN]`. Vermutlich gewollt (User-Override schützen), aber dokumentationswürdig.
- Empfehlung: Im Code-Kommentar Z. 16385 klarstellen, dass ein manueller Rückwärtssprung auf Lead/Angebot die Automatik dauerhaft anhält, bis User selbst wieder `In Arbeit` setzt.

### #22 Soft-gelöschte Einsätze werden in Auto-Status korrekt ausgenommen — aber: gekoppelter Termin bleibt
- Datei: `app.js:16399–16400`, `12189`
- Symptom: `checkAndUpdateProjectStatus` filtert `.is('deleted_at', null)` für deployments und appointments. `deleteAppointment` löscht den Termin soft, ruft danach `checkAndUpdateProjectStatus`. Das ist konsistent. **Aber**: wenn ein Einsatz soft-gelöscht wird, wird der gekoppelte Termin in `_performSoftDelete` mit gelöscht (Z. 3221–3226) — `deleteDeployment` macht das auch selbst (14976–14981). In beiden Fällen wird der Auto-Status danach (oder gar nicht, siehe #3) gegen den Termin- und Einsatz-Bestand geprüft. Konsistent, aber: bei `_performSoftDelete` läuft Auto-Status gar nicht (siehe #3).
- Info — kein eigenständiger Bug zusätzlich zu #3.

### #23 `dispStatus` mit ambigen system_keys kann falsche Kategorie wählen
- Datei: `app.js:2557–2569`
- Symptom: `dispStatus` durchsucht alle 4 Kategorien in fester Reihenfolge (`projekt_status, einsatz_status, aufgabe_status, termin_status`). Bei ambigen Schlüsseln wie `'in_arbeit'` (projekt_status + aufgabe_status), `'storniert'` (projekt_status + einsatz_status + aufgabe_status), `'durchgefuehrt'` (einsatz_status + termin_status), `'geplant'` (einsatz_status + termin_status) gewinnt immer die Erste. Wenn ein Mandant die Labels pro Kategorie unterschiedlich anpasst (z. B. `'In Arbeit'` für Projekt vs. `'Läuft'` für Aufgabe), zeigt `dispStatus` immer das Projekt-Label.
- Empfehlung: An den meisten Stellen ist die Kategorie bekannt — dort `getStatusLabel(kategorie, key)` statt `dispStatus(key)` verwenden. `dispStatus` als Fallback nur dort, wo die Kategorie wirklich unbekannt ist.

### #24 Kein system_key-Lookup beim Termin-Status — `termin_status` wird nicht gecached
- Datei: `app.js` global
- Symptom: Im Gegensatz zu `projektStatusCache`/`einsatzStatusCache`/`aufgabeStatusCache` gibt es keinen `terminStatusCache`. Termin-Status wird nirgendwo aus `lookup_values` mit Farbe/Reihenfolge geladen — nur `_statusLabelCache` (für Label-Lookup) und `_statusOptionsCache` (für Picker, siehe #1, ohne system_key).
- Folge: Wenn ein Mandant `termin_status` um zusätzliche Werte erweitert, hat das HTML-Select keine Anzeige und die Farben sind hartcodiert (`appointmentStatusBg`, siehe #16).
- Empfehlung: `loadTerminStatus`-Loader + `terminStatusCache` analog zu den anderen drei einführen, beim Modal-Open befüllen.

---

## Low (Code-Smell, kein User-Impact)

### #25 `_activityStatusStyle` mit `switch` über hartcodierte Strings statt Konstanten
- Datei: `app.js:2713–2725`
- Symptom: Funktion ist „shared" für 3 Domänen (Einsatz, Termin, Aufgabe). switch über `'geplant'`, `'durchgefuehrt'`, `'abgerechnet'`, `'storniert'`, `'erledigt'`, `'offen'` — alles ohne Konstanten.
- Fix-Vorschlag: Stilbruch laut CLAUDE.md, aber funktional korrekt. Konstanten verwenden.

### #26 Toast-Strings mit Status-Anzeige bypassen Lookup-Cache
- Datei: `app.js:18232`
- Symptom:
  ```js
  if (appt.status === 'durchgefuehrt') { showToast('Termin ist bereits als durchgeführt markiert.', true); return; }
  ```
  Der Text „durchgeführt" ist hartkodiert; bei mandantenspezifischen Labels (Block 1) bricht die Konsistenz.
- Fix-Vorschlag: `dispStatus(APPOINTMENT_STATUS.DURCHGEFUEHRT)` als Label im Text.

### #27 `selectEntityStatus` Race-Schutz mit `.in('status', [currentStatus])` versagt nach #1
- Datei: `app.js:25725–25726`
- Symptom: Der Race-Schutz vergleicht den aktuellen DB-Status mit `currentStatus`. Nach Bug #1 ist `currentStatus` aber bereits ein system_key (vom `dataset.currentStatus`), und der DB-Wert kann nach #1 ein Label sein. Damit verliert der Race-Schutz seine Wirkung — `.in('status', [currentStatus])` matcht nichts, das UPDATE schlägt lautlos fehl.
- Fix-Vorschlag: Mit #1 zusammen lösen.

### #28 `appointmentStatusLabel` und `aufgabeStatusLabel` sind Thin-Wrapper für `getStatusLabel`
- Datei: `app.js:3756`, `22243–22245`
- Symptom: Kein eigentlicher Bug, aber Duplikate, weil `dispStatus()` denselben Job kategorie-übergreifend macht. Inkonsistente API.
- Empfehlung: Standardisieren — entweder alles über `dispStatus()` (kategorieblind) oder explizit `getStatusLabel(kategorie, key)` mit kategorie-spezifischen Helpern.

### #29 Hartcodierte `status: 'aktiv'`-Filter für Memberships/User
- Datei: `app.js:10011, 10032, 10141, 12254, 19887, 31046`
- Symptom: `'aktiv'` ist kein Lookup-Status, sondern `user_profiles.status` (CHECK: `eingeladen/aktiv/inaktiv`) bzw. `memberships.status`. Diese sind nicht durch Block-2-Migration betroffen, aber im Stil inkonsistent zu den `*_STATUS`-Maps. Falls die Migration auf eine Multi-Mandanten-Welt ausgeweitet wird, sollten auch diese Werte konstantisiert werden.
- Empfehlung: `MEMBERSHIP_STATUS`, `USER_STATUS` analog einführen — niedrige Priorität.

### #30 `_PROJEKT_PHASE_RANG` enthält keinen Eintrag für `STORNIERT`
- Datei: `app.js:23678–23685`
- Symptom: Map deckt 6 von 7 system_keys ab. `'storniert'` fällt durch Fallback `|| 10` und wird wie `Lead` behandelt — bei der Plan-Phase-Sichtbarkeit (`applyProjectPlanPhaseVisibility`) zeigt ein storniertes Projekt alle Plan-Sektionen wie ein Lead. Vermutlich unkritisch (stornierte Projekte werden eh selten geöffnet), aber inkonsistent.
- Fix-Vorschlag: `[PROJECT_STATUS.STORNIERT]: 50` (analog `VERLOREN`).

---

## Info (Beobachtung ohne Bug)

### #31 Auto-Status-Logik schließt Aufgaben bewusst aus — laut Spec korrekt
- Beobachtung: `checkAndUpdateProjectStatus` prüft nur Einsätze und Termine, keine Aufgaben. Das deckt sich mit der Spec aus CLAUDE.md („Aufgabe: bewusst entkoppelt"). Aufgaben können `erledigt` oder `offen` sein ohne Projekt-Status-Wirkung. Keine Aktion nötig.

### #32 `architecture.md` §8.5 hat im Text noch hartkodierte deutsche Label-Strings
- Datei: `architecture.md:807–809`, `825`
- Beobachtung: Tabelle und Beschreibung verwenden `'Abgeschlossen'`, `'Abschlussphase'`, `'In Arbeit'`, `'Geplant ↔ Durchgeführt'` als Werte. Nach v2.31 ist die Identität `'abgeschlossen'` etc. Die Spec sollte konsequent system_keys nennen (oder klar machen, dass die Tabelle Label/Anzeige zeigt).
- Empfehlung: Spec-Text auffrischen. Niedrige Priorität.

### #33 `STORNIERT` taucht in `_STATUS_FLOW.deployment.terminal` korrekt auf, aber nicht in `.order`
- Datei: `app.js:25559–25564`
- Beobachtung: Wenn ein Einsatz manuell auf `storniert` gesetzt wird, hat er keinen Folgestatus in der Flow-Kette — `_statusFlowNext` gibt `null` zurück, `renderStatusAdvanceAction` zeigt „Status: Storniert" als Final-State. Konsistent gewollt. Keine Aktion.

### #34 Termin-Status-Picker ohne `Storniert`/erweiterte Werte
- Beobachtung: `_STATUS_FLOW.appointment.order` ist `[GEPLANT, DURCHGEFUEHRT]` mit Terminal `[DURCHGEFUEHRT]`. Wenn ein Mandant `termin_status` erweitert (siehe #4), wird der Picker nach #1-Fix die zusätzlichen Werte zeigen — aber `renderStatusAdvanceAction` für `appointment` kennt nur die zwei Standardwerte. Bewusste Vereinfachung; bei Erweiterung der Mandanten-Lookups müsste die Flow-Kette nachgeführt werden.

### #35 Status-Konstanten-Maps sind eingefroren, aber `TASK_STATUS` ist faktisch ungenutzt
- Datei: `app.js:2507–2512`, ein Treffer (`2737`)
- Beobachtung: TASK_STATUS wird im gesamten Code nur an einer Stelle benutzt — alle anderen Stellen verwenden `'erledigt'`, `'offen'`, `'in_arbeit'`. Die Block-2-Migration wurde an dieser Domäne nicht konsequent umgesetzt.
- Empfehlung: Großes Refactoring oder bewusst dokumentieren (in Code-Kommentar/CLAUDE.md), dass Task-Status-Strings noch nicht auf Konstanten umgestellt sind.

---

## Übersicht für Phase A.2 (Priorisierung)

**Sofort fixen (Block 2 ist gebrochen):**
- #1 Status-Picker schreibt Labels statt system_keys
- #2 Picker triggert keinen Auto-Status
- #3 Listen-Delete umgeht Auto-Status
- #5 Quick-Toggle synct gekoppelte Entität nicht

**Vor nächstem Release fixen (sichtbar fehlerhaft):**
- #4, #6, #7, #8, #9, #10, #11, #12, #13, #14

**Mit Konstanten-Refactoring zusammen (Mittel/Lang):**
- #15 (Task-Status-Konstanten), #18 (Template), #20 (Lookup-Modal), #24 (terminStatusCache), #16/#17 (Helper)

**Doku/Nicht-Block-2:**
- #21–#23, #25–#34
