-- v2.33.21 — Daten-Korrektur: Techniker-Leck (David → Selcuk) auf 9 Solo-Einsätzen
-- ============================================================================
-- Kontext: Der in v2.33.20 behobene Composer-Bug (Multi-Pick-State-Sets sind
-- lexikalische `let`-Bindungen, wurden aber per window[...] gelesen → undefined)
-- ließ eine im Modal gesetzte Techniker-Auswahl (David Liebhäußer) in alle danach
-- im Composer angelegten Einsätze lecken. Folge: David stand als ALLEINIGER
-- Techniker auf 9 Einsätzen, die Selcuk angelegt hat — im Briefing sichtbar als
-- fremde Einsätze unter David.
--
-- Korrigiert NUR die 9 Solo-Einsätze (genau ein Techniker = David) → Selcuk
-- (von Selcuk am 03.06.2026 freigegeben). Die 4 Bündel-Einsätze des Projekts
-- „Programmierprojekt … SHB Metall", bei denen David Co-Techniker neben einem
-- zweiten ist, bleiben UNANGETASTET (separat zu prüfen).
--
-- Sicher: alle 9 haben genau einen Techniker (David) → UPDATE verletzt nicht
-- UNIQUE(deployment_id,user_id); NOT-EXISTS-Guard zusätzlich. Reversibel.
-- Anwenden: Supabase Management API / SQL-Editor (siehe CLAUDE.md).
-- ----------------------------------------------------------------------------

UPDATE deployment_technicians dt
   SET user_id = 'f51ee41a-ae41-4283-aece-7080ff326c3f'    -- Selcuk Cumart
 WHERE dt.user_id = '83734e32-7183-41b5-a463-ccf001ac7e7e'  -- David Liebhäußer
   AND dt.deployment_id IN (
     '1496a534-a427-4b23-8ff0-afc069484d14',  -- TNC-Club Premiumtag - Bayer Maschinenbau
     '0abf1111-0da2-406b-86d6-7f1cb8551fd3',  -- TNC-Club Premiumtag × Horst Thiele
     '6b98440e-ee3b-4ffb-ac1e-de4ad401652f',  -- Optimierung für VA-SACS Bauteile
     'c23c93a5-34d5-4be9-b164-b27a2b520806',  -- TNC-Club Premiumtag × Karl Hoch
     'eb3069f1-3975-4197-a996-92c173be8636',  -- Tagespauschalen An- & Abreise (Haas/Starrag)
     'b605c654-baf2-4f98-9cf4-392658d77df4',  -- Tagespauschale Senior Trainer Fräsen × Haas
     '7a859605-9b4b-45de-9924-2bac6c7747ef',  -- Reisekosten - Hotel + Spesen (Haas/Starrag)
     'aa392e29-3c7a-4849-a1b0-3c8a2d8b318c',  -- Tagespauschale Senior Trainer × SHB (geplant)
     '4f6d1aca-1b89-4d07-8067-d1ba06009aac'   -- Tagespauschale Senior Trainer × SHB (storniert)
   )
   AND NOT EXISTS (
     SELECT 1 FROM deployment_technicians t2
      WHERE t2.deployment_id = dt.deployment_id
        AND t2.user_id = 'f51ee41a-ae41-4283-aece-7080ff326c3f'
   );

-- Verifikation (erwartet: David 0, Selcuk 9 auf den 9 Einsätzen):
--   SELECT user_id, count(*) FROM deployment_technicians
--    WHERE deployment_id IN (… die 9 IDs …) GROUP BY user_id;
