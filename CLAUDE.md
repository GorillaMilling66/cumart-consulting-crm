# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Snapshot

Internal CRM for Cumart Consulting. **Vanilla HTML/CSS/JS SPA** (no framework, no build step) on top of **Supabase** (Postgres + Auth + one Edge Function). Deployed via Vercel auto-deploy from `main` to `https://cumart.cloud`.

UI language is **German** throughout (labels, status values, user-facing strings). Keep new UI text in German.

See `architecture.md` for the authoritative spec — it's kept in sync with each release and is the single source of truth for schema, version history, and cross-entity logic. **Bump its version and update the relevant section whenever you change schema, cross-entity behavior, or add a major feature.** `app.js`'s top-of-file banner should stay in sync too.

## Commands

There is no build, lint, or test tooling. The repository is three flat files plus one Edge Function.

- **Run locally:** open `index.html` directly in a browser, or serve the directory with any static server (e.g. `python3 -m http.server 8000`). The Supabase URL and anon key are hardcoded in `app.js` — local dev hits production Supabase.
- **Deploy:** commit + push to `main`. Vercel redeploys automatically in ~30–60s. Hard-reload (Cmd+Shift+R) to bust cache.
- **Edge Function deploy:** `supabase/functions/manage-users/index.ts` must be deployed via the Supabase dashboard or CLI separately; it is *not* picked up by Vercel. "Verify JWT with legacy secret" must stay disabled on that function.
- **Schema migrations:** applied by hand in the Supabase SQL editor, **or** via the Supabase Management API (`POST https://api.supabase.com/v1/projects/loohjeiysjxzbmfwkyvv/database/query` with a Personal Access Token the user provides in-session). After applying, run the verification query at the end of `architecture.md` §14.6 to confirm all required constraints/tables/lookup values are present.

## Standing authorization (granted 2026-04-22 by Selcuk)

The user has pre-authorized the following actions so you don't need to confirm case-by-case:

- **Supabase data changes via migration SQL** — applying versioned migration files in `migrations/` against the production database (Management API or SQL editor). Includes DDL (`CREATE`, `ALTER`, `DROP`) and data-shape changes that are part of a checked-in migration.
- **Git commits and pushes to `main`** — normal forward-moving commits and `git push` for feature releases. Vercel auto-deploys from `main`, so pushing = deploying to prod.

**Still requires explicit confirmation** (the standing authorization does NOT cover):

- **Destructive SQL outside a migration file** — ad-hoc `DELETE` / mass `UPDATE` against live user data, `DROP TABLE` outside a migration, reverting a migration in-place.
- **Destructive Git operations** — `push --force`, `reset --hard` on `main`, deleting branches, rewriting published history.
- **Credential/secret changes** — rotating the hardcoded `SUPABASE_ANON_KEY`, changing RLS in ways that could lock out the admin, modifying `manage-users` Edge Function auth behavior.

When in doubt, ask first. Match the scope of your action to what the migration/commit actually says it does.

## Architecture

### File layout

```
index.html   ~2.04k lines — all pages as <div class="page">, all modals as hidden divs
styles.css   ~1.41k lines — CSS variables + desktop/mobile
app.js       ~6.74k lines — every module in one file, flat globals for state
supabase/functions/manage-users/index.ts — Deno edge fn for invite/update/delete/reset_password
migrations/              — versioned SQL migrations, applied by hand or via Management API
```

### SPA model

- Hash router (`#/firmen`, `#/firma/:id`, `#/projekt/:id`, …). Pages are sibling `<div class="page">` elements; routing toggles `.active`.
- Einsätze and Mitgliedschaften have **no detail route** — they are edited exclusively via modal.
- State lives in flat `let` globals at the top of `app.js` (`currentProfile`, `editing<Entity>Id`, `current<Entity>DetailId`, `<entity>Cache`, prefill vars).
- Caches are **lazy-filled and manually invalidated after writes**. When adding a new write path for an entity, explicitly clear/refresh its cache (see existing patterns for `servicesCache`, `programsCache`, `companyContactsMap`).

### Modal conventions

Each entity has its own modal with a short **ID prefix** for form fields (see `architecture.md` §7.6 for the full table):
`c-*` companies, `k-*` contacts, `t-*` appointments, `p-*` projects, `d-*` deployments, `u-*` users, `s-*` services, `l-*` lookups, `pr-*` programs, `ms-*` memberships. Follow this scheme when adding fields — the prefix is how handlers find their inputs.

Collapsible modal groups (`<div class="modal-group-title">`) toggle all following siblings via event delegation — works automatically in any modal.

### Domain model — what's billable vs. what's effort

This distinction is load-bearing across the app; violating it breaks revenue reporting:

- **Termin** — meeting/acquisition touchpoint. **Not billable.** Effort only.
- **Einsatz (deployment)** — the billable unit. `menge × einzelpreis` is customer revenue *only when* there is no `project_id`.
- **Projekt** — package of Einsätze with a fixed price (`geschaetzter_umsatz`). When an Einsatz has a `project_id`, its `einzelpreis` is *internal effort tracking*, not customer revenue. The package price is what the customer sees.
- **Leistungsumsatz** — sum of Einsatz line-values inside a project (for soll/ist comparison against the package price).
- **Mitgliedschaft** — subscription. **Benefits from the program become `entitlements`** (quota rows) when the membership is created; each use is logged in `entitlement_redemptions`, normally linked 1:1 to an Einsatz.

### Cross-entity flows to preserve

- **Appointment↔Deployment coupling** (`appointments.deployment_id`): toggling the "Auch als Termin eintragen" checkbox on an Einsatz creates, updates, or **deletes** the linked Termin. Deleting the Einsatz deletes its Termin. Removing the date deletes it. Full rules in `architecture.md` §8.4.
- **Auto project status** (`checkAndUpdateProjectStatus*`): after any CRUD on a project's Einsätze/Termine, the project status transitions across `In Arbeit → Abschlussphase → Abgeschlossen` based on completion. Use the `…Smart()` variant for DOM-only updates (quick-toggle checkboxes), the plain one after modal saves. Table in `architecture.md` §8.5.
- **Entitlement redemptions in the Einsatz modal** (v1.14): the modal shows a redemption section when the chosen firm has open entitlements. Edge cases handled via `window._pendingRedemption*` vars — see §8.9. Key rule: on edit, the deployment's *own* existing redemption must not count against remaining quota (otherwise you can never raise your own menge).
- **Membership creation fans out entitlements** (v1.13): saving a Mitgliedschaft auto-creates one `entitlements` row per `membership_program_benefits` entry. Editing a program uses **benefits-replacement** (delete-all-then-insert) but does not touch entitlements of existing memberships.
- **Context-sensitive refresh after CRUD**: `save<X>`/`delete<X>` check which detail page is active and refresh only the relevant section. Preserve this when adding new save paths — a firm's memberships section should refresh when one of its Einsätze changes.

### Status values come from the DB, not from code

`projekt_status` and `einsatz_status` have **no CHECK constraints** (dropped in v1.9.6). Allowed values are whatever is active in `lookup_values`. Validation in `app.js` reads the lookup cache, not a hardcoded whitelist.

**Caveat:** the strings `Abschlussphase`, `Abgeschlossen`, `Durchgeführt`, `Abgerechnet`, `geplant`, `durchgefuehrt` are referenced by the auto-status logic. Don't rename them — deactivate with `ist_aktiv=false` instead.

### RLS posture

Hybrid: strict admin-write on `user_profiles`, `roles`, `lookup_values`; open-authenticated on all operational tables (companies, contacts, deployments, memberships, entitlements, …). Privileged actions (invite / delete / password reset / admin role changes) go through the `manage-users` Edge Function, which is where last-admin protection belongs (see roadmap §13.1).

### Admin-only UI

Use `data-admin-only="true"` on elements; `applyAdminOnlyUI()` hides them for non-admins. Don't gate admin UI with ad-hoc `if` checks.

## Conventions

- **Naming:** functions `camelCase` English (`loadCompanyDetail`), DB columns `snake_case` German (`geschaetzter_umsatz`), HTML IDs `kebab-case` with the modal prefix (`d-datum-von`).
- **No emojis in UI text** (keep it professional German).
- **Destructive actions** go through `confirm()`. FK-violation errors in `delete<X>` are caught and surfaced as friendly toasts.
- **Icon action buttons** in list views (edit/copy/duplicate/delete) come from `renderActionIcons(entityType, id)` with central dispatchers (`deleteEntityById`, `duplicateEntity`, `copyXById`) — don't reinvent per-list.
- **Mobile:** 16px input font-size is intentional (prevents iOS zoom). `.col-action` is hidden on mobile — primary action is the title link. Tables use `table-layout: fixed`.

## When adding a feature

1. If it changes the schema: write the migration SQL, apply it in Supabase, extend the verification query in `architecture.md` §14.6.
2. Add the feature to `app.js` (keep everything in one file — don't introduce modules/bundling).
3. Update `architecture.md` (bump version, add a §12 row, update the relevant sections), and update the banner comment at the top of `app.js` to match.
4. Commit with a version tag (see recent `git log` for the style — German, `vX.Y.Z: <summary>`).
