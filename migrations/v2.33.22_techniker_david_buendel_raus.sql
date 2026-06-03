-- v2.33.22 — David auch aus dem SHB-Bündel raus (Folge von v2.33.21)
-- ============================================================================
-- v2.33.21 hatte die 4 Bündel-Einsätze (Projekt „Programmierprojekt … SHB
-- Metall", Bündel 89adb0e2-…) bewusst ausgelassen, weil David dort Co-Techniker
-- neben Selcuk war. Selcuk hat am 03.06.2026 entschieden: David soll auch dort
-- raus. Jeder der 4 Einsätze hat aktuell David + Selcuk → nach dem Entfernen
-- von David bleibt Selcuk (kein Einsatz wird technikerlos, vorab verifiziert).
--
-- WICHTIG: David muss auch aus den BÜNDEL-Technikern (deployment_bundle_technicians)
-- raus — sonst würde ein erneutes Bündel-Speichern ihn auf alle Mitglieder
-- zurück-propagieren. Reversibel. Anwenden: Management API / SQL-Editor.
-- ----------------------------------------------------------------------------

DELETE FROM deployment_technicians
 WHERE user_id = '83734e32-7183-41b5-a463-ccf001ac7e7e'   -- David Liebhäußer
   AND deployment_id IN (
     'c4601134-998d-4c00-81f9-192f2a749307',
     'b71042fe-153a-4068-9ac2-54f0e037ec50',
     'e9484ea7-f936-4688-bbcd-50abf9969546',
     'f120b422-42de-4727-9d66-1bb5f8edfadb'
   );

DELETE FROM deployment_bundle_technicians
 WHERE user_id = '83734e32-7183-41b5-a463-ccf001ac7e7e'
   AND bundle_id = '89adb0e2-2644-41ef-a1eb-8e739a655ba5';

-- Verifikation (separate Query): David gesamt auf 0 Einsätzen; die 4 Member je Selcuk.
