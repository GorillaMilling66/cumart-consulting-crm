# Setup: Neue Mandanten-Instanz aufsetzen

Diese Anleitung beschreibt, wie aus dem **einen** Repo eine
**zweite** Instanz (z. B. FiveAx) entsteht — ohne Code zu
forken. Alles, was sich pro Mandant unterscheidet, kommt aus
**Vercel-ENV-Variablen** oder aus **Daten in der Supabase-DB**.

> Wenn du beim Setup an einer Stelle merkst, dass du Cumart-
> spezifischen Code anfassen musst: stop. Das ist ein Bug im
> Refactor, kein Setup-Problem.

---

## Schritt 1 — Eigenes Supabase-Projekt anlegen

1. https://supabase.com → "New Project" (Region: Frankfurt).
2. DB-Passwort sicher abspeichern.
3. Project Settings → API → **Project URL** und **anon public key**
   notieren (kommen später in die Vercel-ENV).
4. Alle Migrationen aus `migrations/` der Reihe nach im
   Supabase-SQL-Editor anwenden. Reihenfolge = aufsteigende
   Versionsnummer im Dateinamen.
5. Verifizierungs-Query aus `architecture.md` §14.6 ausführen
   — alle erwarteten Tabellen / Lookup-Werte müssen vorhanden
   sein.
6. Edge-Function `manage-users` deployen
   (Supabase-Dashboard → Edge Functions). "Verify JWT with
   legacy secret" deaktiviert lassen.
7. Ersten Admin-User über Supabase-Auth-UI anlegen, dann
   `user_profiles`-Zeile mit `rolle_id` = Admin manuell setzen.

---

## Schritt 2 — Logos und Assets bereitstellen

- SVG-Logo (Sidebar) ins Repo legen, z. B. `fiveax-logo.svg`.
- Beim Vercel-Deploy wird per ENV `LOGO_URL=fiveax-logo.svg`
  gesetzt. Der Pfad ist relativ zum Repo-Root.
- Optional: `LOGO_URL_WHITE` für Dark-Backgrounds. Wenn nicht
  gesetzt, wird `LOGO_URL` als Fallback genutzt.

---

## Schritt 3 — Neues Vercel-Projekt erstellen

1. Vercel → "Add New Project" → dasselbe Git-Repo wählen
   (`cumart-consulting-crm`).
2. Project-Name: z. B. `fiveax-crm`. Production-Branch: `main`.
3. Framework Preset: "Other" (Vercel erkennt automatisch das
   `vercel.json`).
4. Bei "Environment Variables" alle Werte aus Schritt 4 setzen,
   **bevor** der erste Deploy läuft (sonst bricht der Build mit
   einer klaren Fehlermeldung ab).
5. Custom Domain verknüpfen (z. B. `crm.fiveax.de`).

---

## Schritt 4 — Pflicht-ENV-Variablen im Vercel-Projekt

Alle 12 müssen gesetzt sein. `generate-config.js` bricht den
Build sonst mit einer Fehlermeldung ab.

| Key | Beispiel (FiveAx) | Wofür |
|-----|-------------------|-------|
| `APP_NAME` | `FiveAx CRM` | Browser-Tab, Login-Logo, Mobile-Header, Sidebar |
| `APP_SLUG` | `fiveax` | LocalStorage-Prefix (verhindert Browser-Kollision mit Cumart) |
| `BRAND_TEXT` | `fiveax` | Top-Nav-Brand (links oben) |
| `COMPANY_NAME` | `FiveAx GmbH` | Sidebar-Untertitel, Berichts-Footer, Verantwortlich-Label |
| `COMPANY_OWNER` | `Selcuk Cumart` | Berichts-Footer |
| `COMPANY_EMAIL` | `info@fiveax.de` | Berichts-Footer |
| `COMPANY_WEB` | `fiveax.de` | Berichts-Footer |
| `EMAIL_DOMAIN` | `fiveax.de` | Placeholder im Nutzer-anlegen-Modal (`max@…`) |
| `LOGO_URL` | `fiveax-logo.svg` | Sidebar-Logo (Pfad relativ zum Repo-Root) |
| `LOGO_ALT` | `FiveAx` | Alt-Text des Sidebar-Logos |
| `SUPABASE_URL` | `https://xxx.supabase.co` | aus Schritt 1 |
| `SUPABASE_ANON_KEY` | `eyJ…` | aus Schritt 1 |

Optional:
- `LOGO_URL_WHITE` (Fallback = `LOGO_URL`)

---

## Schritt 5 — Erster Deploy + Smoke-Test

1. Vercel-Deploy triggern (oder `main`-Push).
2. Build-Log prüfen: erwartete Zeile `✓ config.js regeneriert
   für: FiveAx CRM`.
3. Custom-Domain öffnen → Login-Maske muss FiveAx-Branding
   zeigen (Tab-Titel, Logo, Texte).
4. Mit Admin-User aus Schritt 1.7 einloggen.
5. Erste Firma anlegen → speichern → neu laden: muss
   erhalten sein (= Supabase ist korrekt verbunden).

---

## Wartung über mehrere Instanzen

- **Bug-Fix / Feature:** Commit auf `main` → Vercel deployt
  **beide** Instanzen automatisch. Eine Codebase, zwei
  Branding-Varianten.
- **DB-Migration:** SQL aus `migrations/` muss auf **jedem**
  Supabase-Projekt separat angewendet werden. Reihenfolge:
  Cumart erst, FiveAx als zweiter (= Cumart bleibt der
  Lead-Tenant für Risiko-Tests).
- **Lookup-Werte / Programme / Themes:** sind pro Supabase-
  Projekt separat zu pflegen — sie sind Daten, kein Code.
