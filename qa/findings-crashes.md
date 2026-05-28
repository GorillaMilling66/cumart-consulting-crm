# Phase A.2 — Crashes, Nulls, Fehlerpfade

Statisches Audit auf Basis von `app.js` (~32 125 Zeilen) und `supabase/functions/manage-users/index.ts` (334 Zeilen). Status v2.32.13.

Gegenüber CLAUDE.md / v2.31 ist die **Status-System-Key-Konvention** zwingend (Filter müssen system_keys wie `'storniert'` referenzieren, **niemals** Labels wie `'Storniert'`). Mehrere Filter-Strings im Code verstoßen noch dagegen — das ist der Treffer mit der größten Reichweite.

---

## Critical (App-Crash / weißer Screen / Data Loss möglich)

### #1 saveDeployment — Doppelklick auf „Anlegen" legt zwei Einsätze (und ggf. zwei Firmen) an
- Datei: `app.js:14452-14555`
- Symptom: `btn.disabled = true` steht erst Zeile 14554, davor laufen bereits `await db.from('deployments').select(...)` (Z. 14471, nur edit), `await resolveCompanyComboboxValue(...)` (Z. 14490) und `await resolveContactComboboxValue(...)` (Z. 14499). `resolveCompanyComboboxValue` (`app.js:19383-19389`) führt aktiv ein `db.from('companies').insert(...)` aus, wenn der Combobox-Text nicht in der Datalist gefunden wird. Solange der erste Async-Call läuft, ist der Save-Button noch klickbar.
- Code:
  ```js
  // app.js:14488-14491
  let company_id = null;
  try {
    company_id = await resolveCompanyComboboxValue('d-company', 'd-company-list');
  } catch (e) { return; }
  // ... viele weitere awaits ...
  // app.js:14554
  btn.disabled = true;
  ```
- Reproduktion: Einsatz-Modal mit Modus „Neu" öffnen, in das Firmen-Combobox-Feld einen Namen tippen, der **noch nicht existiert** (z. B. „Müller Test GmbH"), dann zweimal hintereinander auf „Anlegen" klicken oder Enter doppelt drücken. Ergebnis: zwei `companies`-Zeilen mit identischem Namen und zwei `deployments`-Zeilen mit identischem Payload.
- Fix: `btn.disabled = true; btn.textContent = …` **vor** den ersten Await ziehen (direkt nach den synchronen Validierungen, wie in `saveAppointment` / `saveTask` korrekt). Im Catch wieder `false` setzen.

### #2 Drei Status-Filter referenzieren Labels statt system_keys → falsche KPIs/Listen
- Datei: `app.js:4746`, `app.js:5432`, `app.js:5794`
- Symptom: Nach v2.31 sind in den Status-Spalten ausschließlich system_keys (`'storniert'`, `'abgerechnet'`, `'abgeschlossen'`, `'verloren'`). Drei `.not('status', 'in', '(…)')`-Filter nutzen Labels. Filter matcht keine Zeile mehr → die Einsätze/Projekte werden NICHT ausgeschlossen.
- Code:
  ```js
  // app.js:4746 — Briefing „heiße Projekte":
  .not('status', 'in', '(Abgeschlossen,Storniert,Verloren,"Lead-zurück")')
  // app.js:5432 — Arbeitsplatz-KPI „Heute Einsätze":
  .not('status', 'in', '(Storniert)'),
  // app.js:5794 — Aside „ungeplante Einsätze":
  .not('status', 'in', '(Abgerechnet,Storniert)')
  ```
- Reproduktion: Einen Einsatz auf `storniert` setzen, dessen `datum_von` heute ist. KPI „Heute Einsätze" auf dem Arbeitsplatz zählt ihn jetzt mit, obwohl der Kommentar Z. 5425-5426 explizit das Gegenteil dokumentiert. Analog: abgeschlossene Projekte erscheinen in den „heißen Projekten"; abgerechnete/stornierte ungeplante Einsätze tauchen in der Aside auf.
- Fix: Auf system_keys umschreiben, z. B. `.not('status', 'in', \`(${DEPLOYMENT_STATUS.STORNIERT})\`)` oder besser `.in('status', [PROJECT_STATUS.LEAD, …])` wie in `app.js:14405`.
- **Cross-Ref:** Phase C #2 beschreibt denselben Bug aus Schema-Perspektive.

### #3 Membership-Insert ohne Rollback — Mitgliedschaft ohne Entitlements bei Fehler
- Datei: `app.js:10318-10336`
- Symptom: `saveMembership` legt zuerst die `memberships`-Zeile an (Z. 10318), erstellt dann die Entitlements (Z. 10335). Schlägt der Entitlement-Insert fehl (RLS, ungültige `service_id`, Netzwerk-Abbruch), bleibt die Mitgliedschaft leer und gilt als „aktive Mitgliedschaft mit 0 Boni" — die in v1.13 dokumentierte Invariante „Mitgliedschaft erzeugt Entitlements" gilt nicht mehr.
- Code:
  ```js
  const { data: newMs, error } = await db.from('memberships').insert(payload).select('id').single();
  if (error) throw new Error(error.message);
  // … benefits.map …
  const { error: entErr } = await db.from('entitlements').insert(entitlementRows);
  if (entErr) throw new Error('Mitgliedschaft angelegt, aber Bonis nicht: ' + entErr.message);
  ```
- Reproduktion: Programm mit Benefits anlegen, wobei eine Benefit-`service_id` aus dem Cache veraltet ist. Mitgliedschaft speichern → ms-Zeile existiert, entitlements-Insert wirft FK-Fehler. Liste zeigt „aktiv, 0 Boni offen".
- Fix: Bei Entitlement-Insert-Fehler die gerade angelegte `memberships`-Zeile soft-deleten/hart löschen, bevor die Exception bubbelt. Ideal: Trigger oder Edge Function für Atomarität.

---

## High

### #4 Inline-Doku-Saves — Read-modify-write race verliert Felder
- Datei: `app.js:9045-9076` (`saveDocumentationFieldInline`), `app.js:23749-23757` (`saveProjectBriefField`), `app.js:24807-24813` (`saveAppointmentDokuField`), `app.js:25480-25486` (`saveDeploymentDokuField`)
- Symptom: Alle vier lesen `dokumentation` als JSON, mergen einen einzelnen Key, schreiben zurück. Schneller Wechsel von Feld A zu Feld B (zweimal blur in kurzer Folge): Save B startet den Read, bevor Save A den Write fertig hat → B sieht alte Doku ohne A's Änderung → A wird beim Write von B wieder überschrieben.
- Code:
  ```js
  // app.js:23751-23756
  const { data: p } = await db.from('projects').select('dokumentation').eq('id', currentProjectDetailId).single();
  const dok = p?.dokumentation || {};
  if (key === 'ziel') dok.kundenherausforderung = value || '';
  else dok[key] = value || '';
  await db.from('projects').update({ dokumentation: dok }).eq('id', currentProjectDetailId);
  ```
- Reproduktion: Im Projekt-Brief Tab Feld „Ziel" tippen, per Tab in „Kundenherausforderung" springen, dort weitertippen, Tab verlassen. In ~50 % der Fälle bleibt eines der Felder leer. Tritt besonders bei langsamem Netz auf.
- Fix: Pro Entität In-Flight-Queue (Promise-Chain pro `id`), oder `jsonb_set(dokumentation, '{key}', $value)` Postgres-side statt das ganze Objekt zurückzuschreiben.

### #5 `togglePin` race löst UNIQUE-Constraint-Verletzung aus
- Datei: `app.js:5663-5677`
- Symptom: `togglePin` macht erst `isItemPinned` (`select id`), dann insert/delete. Doppelklick → zwei `isItemPinned`-Calls parallel, beide `false`, beide insertieren → zweiter stößt UNIQUE-Constraint `(user_id, entity_type, entity_id)` aus `migrations/v2.3.0_pins.sql` an. Z. 5675 zeigt Toast „Fehler: duplicate key", obwohl erste Aktion erfolgreich war.
- Reproduktion: Pin-Stern zweimal schnell hintereinander klicken → roter Fehler-Toast.
- Fix: Button während Pin-Toggle disabled, oder `.upsert({ … }, { onConflict: 'user_id,entity_type,entity_id', ignoreDuplicates: true })`.

### #6 `new Date(d.datum_von)` interpretiert lokale ISO-Datumsstrings als UTC → Kalender-Off-by-one
- Datei: `app.js:19072-19078` (Kalender-Render), `app.js:5298` (KPI-Tage), `app.js:17527` (Projekt-Deadline-Differenz)
- Symptom: `parseLocalDate` (`app.js:3702`) wäre korrekt, wird hier aber nicht benutzt. `new Date('2026-03-29')` ergibt UTC-Mitternacht — in Europe/Berlin im Sommer 02:00 lokal. `monthStart`/`monthEnd` werden mit `new Date(year, month, 1)` (lokal) erzeugt. Vergleich `from > monthEnd || to < monthStart` ist am Monatsrand fehlerhaft; `for`-Loop mit `setDate(+1)` kann an DST-Übergängen einen Tag überspringen.
- Reproduktion: Einsatz mit `datum_von = 2026-03-29` (DST-Tag DE) anlegen, Kalenderansicht. Einsatz erscheint einen Tag früher oder im Vormonat. Analog 31.10.
- Fix: `parseLocalDate(d.datum_von)` statt `new Date(d.datum_von)`, oder Iteration auf ISO-Strings ziehen (wie `app.js:19761-19765` schon richtig macht).

### #7 `new Date().toISOString().slice(0, 10)` als Datums-Default schreibt manchmal Vortag
- Datei: `app.js:10145` (`ms-start` Default), `app.js:10263` (Mitgliedschafts-Enddatum), `app.js:14928` (`einloesung_datum`)
- Symptom: `.toISOString()` liefert UTC. Zwischen 00:00 und ~02:00 Uhr Berlin-Sommerzeit ist der UTC-Tag ein Tag früher. Defaultes Mitgliedschafts-Startdatum, auto-berechnetes Enddatum und `einloesung_datum` einer Entitlement-Redemption sind dann einen Tag zu früh.
- Code:
  ```js
  document.getElementById('ms-start').value = new Date().toISOString().slice(0, 10);            // app.js:10145
  endInput.value = end.toISOString().slice(0, 10);                                              // app.js:10263
  einloesung_datum: new Date().toISOString().slice(0, 10),                                      // app.js:14928
  ```
- Reproduktion: Browser-Timezone in DevTools auf positiven Offset stellen, lokal kurz nach Mitternacht → Mitgliedschaft anlegen, Startdatum zeigt Vortag.
- Fix: `toISODate(new Date())` (existiert in `app.js:3707`) verwenden.

### #8 Edge Function manage-users — Last-Admin-Schutz ignoriert `status='inaktiv'`
- Datei: `supabase/functions/manage-users/index.ts:64-71`, `:311-319`
- Symptom: `countActiveAdmins` filtert `status='aktiv'`, aber `isUserAdmin` prüft nur die Rolle. Beim Löschen eines bestehenden Admins gibt `isUserAdmin(target)` für einen inaktiven Admin trotzdem `true` zurück. `countActiveAdmins` zählt nur andere aktive Admins. Beim Update (`role_id`-Change, Z. 218) ignoriert `targetIsAdmin = (targetUser.roles)?.name === 'Admin'` ebenfalls den Status.
- Code:
  ```ts
  async function isUserAdmin(supabaseAdmin: any, userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from('user_profiles').select('roles(name)').eq('id', userId).single()
    return (data?.roles as any)?.name === 'Admin'   // status wird nicht geprüft
  }
  ```
- Reproduktion: Zwei Admins A (aktiv) und B (inaktiv). Versuch, B zu löschen → blockt mit „Der letzte Admin kann nicht gelöscht werden", weil `countActiveAdmins` = 1 und `isUserAdmin(B)` true. B ist inaktiv, das Löschen wäre safe.
- Fix: `isUserAdmin` zusätzlich `status='aktiv'` prüfen, oder `countActiveAdmins` Ziel-User explizit ausschließen und prüfen, ob danach ≥ 1 aktiver Admin übrig bleibt.

### #9 Edge Function lückt: `status='inaktiv'` per Direkt-Tabellen-Update Last-Admin-Lockout möglich
- Datei: `supabase/functions/manage-users/index.ts:230-238` (nicht abgedeckt)
- Symptom: Die `update`-Action akzeptiert nur `{ name, role_id, password }` — gut. Allerdings wird `status` aus der UI direkt über `user_profiles`-Tabelle gepatcht. RLS gated `roles`/`role_id` strikt, `status` aber nicht — der einzige aktive Admin kann sich selbst auf `inaktiv` setzen. Ergebnis: keine aktiven Admins mehr, App lockt aus.
- Reproduktion: Als einziger Admin → eigenes Profil → „Deaktivieren". UI führt `db.from('user_profiles').update({ status: 'inaktiv' }).eq('id', currentUser.id)`. RLS lässt durch. Nächster Reload → `onLogin` (`app.js:7159`) sieht `status='inaktiv'`, loggt aus, App permanent gelockt.
- Fix: Anti-Self-Deactivation client-side **und** in Postgres-Trigger / Policy. Ideal: `status`-Änderungen ebenfalls über die Edge Function mit Last-Admin- und Anti-Self-Schutz.

---

## Medium

### #10 `Number(d.menge) || 1` macht aus `menge=0` einen Phantom-Wert von 1 → falsches Honorar
- Datei: `app.js:4642`, `app.js:4649`, `app.js:5072`, `app.js:6330`, `app.js:6455`, `app.js:16045`, `app.js:23500`, `app.js:24958`
- Symptom: Eingabe `menge=0` (gültig, z. B. Storno-Korrektur) ist `Number(0) || 1 = 1`. UI zeigt `einzelpreis × 1` statt `× 0` als Honorar.
- Reproduktion: Einsatz mit `einzelpreis=1000`, `menge=0` anlegen (UI lässt 0 zu, `app.js:14533` validiert nur `< 0`). Detail-/Listenansicht zeigt Honorar 1.000 € statt 0 €.
- Fix: `Number(d.menge ?? 1)` bzw. `d.menge != null ? Number(d.menge) : 1`. Konsistent in allen 8 Vorkommen.

### #11 `addAppointmentActionItem` / `toggleAppointmentActionItem` — Insert/Update ohne Error-Check
- Datei: `app.js:24839-24861`
- Symptom: Beide ignorieren `error`. Schlägt der Insert/Update fehl, zeigt UI trotzdem „Aufgabe hinzugefügt" und reloadt die Liste ohne den Eintrag. User glaubt, Aufgabe sei gespeichert.
- Reproduktion: Action-Item in Termin-Detail anlegen, Tablet offline. Liste reloadt, kein Eintrag, kein Fehlerhinweis.
- Fix: `const { error } = await …; if (error) { showToast('Fehler: ' + error.message, true); return; }` analog `app.js:23983-23989`.

### #12 `prompt(...)` — schneller Doppelklick stapelt zwei Modals
- Datei: `app.js:23981` (Erfolgskriterium), `app.js:24841` (Action Item)
- Symptom: `prompt()` returnt bei Abbrechen `null`, das wird korrekt durch `if (!text || !text.trim())` gefangen. Aber: Plus-Button hat kein Disabled → Doppelklick öffnet zwei `prompt`-Dialoge nacheinander.
- Fix: Auf das vorhandene `confirmDialog`-Pattern wechseln (mit Button-Disable).

### #13 `setupDeploymentModalListeners` bindet bei jedem Modal-Open neue `addEventListener` — Doppel-Listener
- Datei: `app.js:14164-14264` (Aufruf in `app.js:13981`)
- Symptom: Anders als die Preview-Wiring-Funktionen (`app.js:3905-3915` mit `previewWired`-Guard) hat diese Funktion keinen Idempotenz-Guard. Bei jedem Modal-Open werden neue `addEventListener('input', …)` auf `menge` und `einzelpreis` registriert (Z. 14251, 14259). Nach N Modal-Öffnungen feuert jedes input-Event N-mal.
- Reproduktion: Einsatz-Modal 10× öffnen/schließen, im 11. Mal Zeichen in Menge tippen → „Manuell-bearbeitet"-Flag wird 11× gesetzt, Preview-Render läuft 11×.
- Fix: Guard wie bei `previewWired`: `if (modal.dataset.deploymentListenersWired === '1') return; modal.dataset.deploymentListenersWired = '1';`.

### #14 `value = ...${esc(a.titel)}` — escapt in Eingabewerte und zeigt `&amp;` / `&#39;` an
- Datei: `app.js:18262`, `app.js:18621`, `app.js:18878`, `app.js:24889`
- Symptom: `esc()` (`app.js:2959`) ist für HTML-Inhalt. Eingabe-Felder (`input.value`) speichern den rohen String, brauchen kein HTML-Escape. Ein Termin „Demo & Test" wird beim Folgetermin-Prefill als `Folgetermin: Demo &amp; Test` ins Input geschrieben, beim Speichern landet das wörtlich in der DB.
- Code:
  ```js
  if (a.titel) document.getElementById('t-titel').value = `Folgetermin: ${esc(a.titel)}`;
  ```
- Reproduktion: Termin „Demo & Test" anlegen, dann „Folge-Termin (+1 Woche)" → Titel-Input zeigt `Folgetermin: Demo &amp; Test`. Speichern → DB hat den escapten String.
- Fix: In allen vier Stellen `esc()` weglassen: `input.value = \`Folgetermin: ${a.titel}\``.

### #15 `checkAndUpdateProjectStatus` zählt stornierte Einsätze als „nicht erledigt"
- Datei: `app.js:16388-16438`
- Symptom: Auto-Status-Helper prüft, ob alle Einsätze in `DURCHGEFUEHRT|ABGERECHNET` sind. Ein stornierter Einsatz fällt durch → `allDone=false`. Projekt mit 3 durchgeführten und 1 stornierten Einsatz bleibt in `IN_ARBEIT` hängen.
- Reproduktion: Projekt mit 3 Einsätzen, alle durchgeführt. 4. Einsatz hinzufügen, sofort als „Storniert" markieren. Projekt-Status bleibt „In Arbeit" statt „Abschlussphase".
- Fix: Stornierte Einsätze/Termine vor der Berechnung rausfiltern (`arr.filter(x => x.status !== DEPLOYMENT_STATUS.STORNIERT)`).

### #16 `formatCompanyBlock(company)` ohne Null-Guard für `company` selbst
- Datei: `app.js:3617-3632`
- Symptom: Wenn `company` undefined, crasht Z. 3619 „Cannot read properties of undefined (reading 'name')". Einzige Aufrufstelle (`app.js:3656-3662`) guardet, neue Aufrufer könnten das vergessen.
- Fix: `if (!company) return '';` als erste Zeile.

---

## Low

### #17 `JSON.parse(list.dataset.services || '[]')` ohne try
- Datei: `app.js:8567`
- Fix: try/catch wie `getRecentlyVisited` (`app.js:16480-16482`).

### #18 `onSubItemPreisInput` bei `menge=0` schreibt `Infinity` ins dataset
- Datei: `app.js:8632-8643`
- Symptom: `preis / 0 = Infinity`, `String(Infinity) === "Infinity"`. Beim nächsten Mengen-Edit: `Number("Infinity") * neueMenge = Infinity`.
- Fix: `if (menge > 0)` Guard, sonst dataset leeren.

### #19 `.then(({ data }) => …)` ohne `.catch` — Unhandled Promise Rejection beim Phasen-Toggle
- Datei: `app.js:23744-23745`
- Fix: `.catch(err => console.warn('phase visibility:', err))`.

### #20 `parseHashQuery` bei kaputtem URL-Encoding wirft `URIError`
- Datei: `app.js:6933-6937`
- Symptom: `decodeURIComponent('%E0%A4%A')` wirft `URIError`. Bei manipulierter URL bricht der Hash-Router komplett ab → kein Routing mehr.
- Fix: try/catch pro decodeURIComponent-Pair.

### #21 Edge Function — `update`-Action setzt `name` auch auf leeren String, ohne Validierung
- Datei: `supabase/functions/manage-users/index.ts:230-238`
- Fix: `if (name !== undefined && !name?.trim()) return jsonResponse({ error: 'Name darf nicht leer sein' }, 400);` und `name`-Trim vor Update.

---

## Info

### #22 17 Destrukturierungen ignorieren das `error`-Feld
- Datei: `app.js:3767, 5657, 5944, 5947, 6150, 6161, 6172, 8233, 8415, 8430, 8434, 9584, 10136, 16517, 28178, 28348, 28641`
- Symptom: `const { data } = await db.from(…).…;` ohne Error-Check. Code arbeitet mit `data?.…` weiter — meistens tolerant. Trotzdem: jedes nicht-protokollierte Fehler-Event verschluckt sich, Debugging erschwert.
- Fix: Mindestens `if (error) console.warn(...)` als Coding-Standard verankern.

### #23 `currentUser.email` ohne Optional-Chaining in Sidebar-Renderern
- Datei: `app.js:7365, 7367, 7379, 7380`
- Fix: Einheitlich `currentUser?.email`.

### #24 Edge Function: `(targetUser.roles as any)?.name` — supabase-js könnte je nach Version Arrays liefern
- Datei: `supabase/functions/manage-users/index.ts:70, 123, 207`
- Symptom: Bei 1:1-Embed `roles(name)` liefert supabase-js typischerweise ein Objekt, in manchen Versionen aber ein Array. Casts `(roles as any)?.name` returnen dann `undefined`, Admin-Checks schlagen fehl → kompletter Lockout möglich.
- Fix: `const rolesField = (data as any)?.roles; const roleName = Array.isArray(rolesField) ? rolesField[0]?.name : rolesField?.name;`.

---

## Sweep-Coverage / Was NICHT gefunden wurde

- **JSON.parse-Crashes:** 3 Stellen, 2 davon mit try/catch oder kontrolliertem Input. Risiko gering.
- **`document.getElementById(…).value` ohne Null-Check:** ~129 Stellen (`.value.trim()`-Pattern), alle in Modal-Speicher-Funktionen, die garantiert nach Modal-Open laufen.
- **Race auf saveCompany / saveContact / saveTask / saveAppointment / saveProject:** `btn.disabled = true` steht VOR jedem await — sicher. Nur `saveDeployment` (#1) hat die Lücke.
- **Status-Konstanten:** Werden im Code richtig verwendet (PROJECT_STATUS.*, DEPLOYMENT_STATUS.* etc.). Nur die drei in #2 genannten Roh-Filter brechen das Pattern.
- **localStorage:** Beide Stellen mit try/catch eingewickelt (`app.js:16480-16482`, `9161`).

---

## Empfohlene Priorisierung für den Fix-Sweep

1. **#2** (Status-Filter mit Labels) — High-Impact, 3-Zeilen-Fix, betrifft KPI-Zählungen und das Hot-Project-Briefing.
2. **#1** (saveDeployment Doppelklick-Race) — schwer zu reproduzieren, aber kann Duplikat-Firmen und -Einsätze produzieren.
3. **#8/#9** (Edge Function Last-Admin-Lücken) — Lockout-Risiko, sicherheitsrelevant.
4. **#4** (Inline-Doku-Race) — Datenverlust beim Tippen, häufiges Szenario.
5. **#7** (`toISOString().slice(0,10)` Vortag-Bug) — 3 Einzeiler.
6. **#15** (Auto-Projektstatus ignoriert Storniert) — semantisch verletzt CLAUDE.md §8.5.
7. **#10** (`Number(menge) || 1`) — falsches Honorar in vielen UI-Stellen.
8. **#14** (`esc()` in Input-Values) — sichtbarer UI-Bug bei Sonderzeichen.
