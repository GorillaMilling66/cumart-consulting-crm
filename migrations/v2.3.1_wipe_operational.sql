-- ═══════════════════════════════════════════════════════════════════════════
-- v2.3.1 — Operative Daten leeren (Stammdaten bleiben)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- DESTRUKTIV — Hard-Delete aller operativen Datensätze. Nicht reversibel
-- ohne PITR-Backup.
--
-- BEHALTEN (Stammdaten unter Einstellungen + Auth):
--   user_profiles, roles
--   lookup_values
--   services
--   membership_programs, membership_program_benefits
--   templates
--
-- GELÖSCHT (alle operativen Tabellen):
--   appointment_participants, appointments, tasks, notes,
--   deployment_technicians, deployment_themes, project_themes,
--   project_success_criteria, deployments, projects, contacts,
--   companies, memberships, entitlements, entitlement_redemptions,
--   pins
--
-- Reihenfolge: Junction/Detail zuerst, dann Master-Tabellen.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Termin-Teilnehmer (Junction)
DELETE FROM appointment_participants;

-- 2. Bonus-Einlösungen (FK → deployments, entitlements)
DELETE FROM entitlement_redemptions;

-- 3. Entitlements (FK → memberships, programs)
DELETE FROM entitlements;

-- 4. Mitgliedschaften (FK → companies, programs)
DELETE FROM memberships;

-- 5. Einsatz-Themen-Junction (FK → deployments, project_themes)
DELETE FROM deployment_themes;

-- 6. Einsatz-Techniker-Junction (FK → deployments, user_profiles)
DELETE FROM deployment_technicians;

-- 7. Projekt-Themen (FK → projects)
DELETE FROM project_themes;

-- 8. Projekt-Erfolgskriterien (FK → projects)
DELETE FROM project_success_criteria;

-- 9. Aufgaben (FK → companies, contacts, projects, deployments, user_profiles)
DELETE FROM tasks;

-- 10. Notizen (FK → companies, contacts, projects, user_profiles)
DELETE FROM notes;

-- 11. Termine (FK → companies, contacts, projects, deployments, tasks)
DELETE FROM appointments;

-- 12. Einsätze (FK → companies, projects, services)
DELETE FROM deployments;

-- 13. Projekte (FK → companies, contacts, user_profiles)
DELETE FROM projects;

-- 14. Kontakte (FK → companies)
DELETE FROM contacts;

-- 15. Firmen (oberste Ebene der operativen Hierarchie)
DELETE FROM companies;

-- 16. Pins (per-user-Favoriten, kein FK auf operative Tabellen, aber referenzieren entity_ids)
DELETE FROM pins;

COMMIT;

-- Verifizierung — alle operativen Tabellen müssen 0 sein
SELECT 'companies'                 AS t, COUNT(*) FROM companies
UNION ALL SELECT 'contacts',                    COUNT(*) FROM contacts
UNION ALL SELECT 'projects',                    COUNT(*) FROM projects
UNION ALL SELECT 'deployments',                 COUNT(*) FROM deployments
UNION ALL SELECT 'appointments',                COUNT(*) FROM appointments
UNION ALL SELECT 'tasks',                       COUNT(*) FROM tasks
UNION ALL SELECT 'notes',                       COUNT(*) FROM notes
UNION ALL SELECT 'memberships',                 COUNT(*) FROM memberships
UNION ALL SELECT 'entitlements',                COUNT(*) FROM entitlements
UNION ALL SELECT 'entitlement_redemptions',     COUNT(*) FROM entitlement_redemptions
UNION ALL SELECT 'project_themes',              COUNT(*) FROM project_themes
UNION ALL SELECT 'deployment_themes',           COUNT(*) FROM deployment_themes
UNION ALL SELECT 'deployment_technicians',      COUNT(*) FROM deployment_technicians
UNION ALL SELECT 'project_success_criteria',    COUNT(*) FROM project_success_criteria
UNION ALL SELECT 'appointment_participants',    COUNT(*) FROM appointment_participants
UNION ALL SELECT 'pins',                        COUNT(*) FROM pins
UNION ALL SELECT 'lookup_values (BLEIBT)',      COUNT(*) FROM lookup_values
UNION ALL SELECT 'services (BLEIBT)',           COUNT(*) FROM services
UNION ALL SELECT 'user_profiles (BLEIBT)',      COUNT(*) FROM user_profiles
ORDER BY t;
