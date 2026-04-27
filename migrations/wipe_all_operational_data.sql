-- ═══════════════════════════════════════════════════════════════════════════
-- WIPE ALL OPERATIONAL DATA — leert die DB komplett, behält nur die Benutzer
-- ═══════════════════════════════════════════════════════════════════════════
--
-- DESTRUKTIV. Nicht rückgängig zu machen ohne Backup/PITR.
--
-- Behalten:
--   user_profiles  (Benutzer)
--   roles          (Rollen-Definitionen)
--
-- Gelöscht:
--   alle operativen Daten + alle Stammdaten (lookup_values, services,
--   programs). Variante 2a — komplett leer, Stammdaten muss der User
--   anschließend neu anlegen.
--
-- Reihenfolge: erst Junction/Detail-Tabellen, dann Master, zuletzt Stammdaten.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Termin-Teilnehmer (Junction)
DELETE FROM appointment_participants;

-- 2. Termine (FK → tasks, deployments, projects, companies, contacts)
DELETE FROM appointments;

-- 3. Aufgaben
DELETE FROM tasks;

-- 4. Notizen (FK → projects/companies/contacts)
DELETE FROM notes;

-- 5. Einsatz-Techniker-Zuweisungen (Junction)
DELETE FROM deployment_technicians;

-- 6. Bonus-Einlösungen (FK → deployments, entitlements)
DELETE FROM entitlement_redemptions;

-- 7. Entitlements (FK → memberships, programs)
DELETE FROM entitlements;

-- 8. Membership-Programm-Benefits (FK → programs, services)
DELETE FROM membership_program_benefits;

-- 9. Mitgliedschaften (FK → companies, programs)
DELETE FROM memberships;

-- 10. Einsätze (FK → companies, projects, services)
DELETE FROM deployments;

-- 11. Projekte (FK → companies)
DELETE FROM projects;

-- 12. Kontakte (FK → companies)
DELETE FROM contacts;

-- 13. Membership-Programme
DELETE FROM membership_programs;

-- 14. Firmen (referenziert von vielen — daher zuletzt unter den Daten)
DELETE FROM companies;

-- 15. Stammdaten — Services
DELETE FROM services;

-- 16. Stammdaten — Lookup-Werte (Status, Typen, Kategorien)
DELETE FROM lookup_values;

COMMIT;

-- Verifikation: alle Counts außer user_profiles + roles sollten 0 sein
SELECT 'user_profiles'                AS entity, COUNT(*) FROM user_profiles
UNION ALL SELECT 'roles',                          COUNT(*) FROM roles
UNION ALL SELECT 'companies',                      COUNT(*) FROM companies
UNION ALL SELECT 'contacts',                       COUNT(*) FROM contacts
UNION ALL SELECT 'projects',                       COUNT(*) FROM projects
UNION ALL SELECT 'deployments',                    COUNT(*) FROM deployments
UNION ALL SELECT 'deployment_technicians',         COUNT(*) FROM deployment_technicians
UNION ALL SELECT 'appointments',                   COUNT(*) FROM appointments
UNION ALL SELECT 'appointment_participants',       COUNT(*) FROM appointment_participants
UNION ALL SELECT 'tasks',                          COUNT(*) FROM tasks
UNION ALL SELECT 'notes',                          COUNT(*) FROM notes
UNION ALL SELECT 'memberships',                    COUNT(*) FROM memberships
UNION ALL SELECT 'membership_programs',            COUNT(*) FROM membership_programs
UNION ALL SELECT 'membership_program_benefits',    COUNT(*) FROM membership_program_benefits
UNION ALL SELECT 'entitlements',                   COUNT(*) FROM entitlements
UNION ALL SELECT 'entitlement_redemptions',        COUNT(*) FROM entitlement_redemptions
UNION ALL SELECT 'services',                       COUNT(*) FROM services
UNION ALL SELECT 'lookup_values',                  COUNT(*) FROM lookup_values
ORDER BY entity;
