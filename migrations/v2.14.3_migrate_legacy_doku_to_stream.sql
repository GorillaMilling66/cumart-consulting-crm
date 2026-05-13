-- ═══════════════════════════════════════════════════════════════════════════
-- v2.14.3 — Alt-Doku in Capture-Stream migrieren
-- ═══════════════════════════════════════════════════════════════════════════
--
-- v2.14.1 hat den Capture-Stream eingeführt, die alten Bericht-Felder
-- (`dokumentation.was_wurde_gemacht`, `dokumentation.durchgefuehrte_themen`,
-- `dokumentation.erkenntnisse`, `deployments.log_eintrag`) blieben aber
-- liegen. Diese Migration kopiert ihre Inhalte als eigene Stream-Einträge
-- in `deployment_log` und räumt danach die Quell-Felder auf.
--
-- Kategorie-Mapping:
--   was_wurde_gemacht / durchgefuehrte_themen → kategorie 'was_gemacht'
--   erkenntnisse                              → kategorie 'erkenntnis'
--   log_eintrag                               → kategorie 'log'
--
-- `created_at` des Stream-Eintrags = `deployments.created_at` (Einsatz-
-- Erstellungszeitpunkt — beste verfügbare Approximation für „wann
-- wurde das geschrieben").
--
-- Die Migration ist idempotent: nach erfolgreichem Lauf sind die Quell-
-- Keys leer/NULL, ein Re-Run kopiert nichts mehr.
--
-- Verifizierung am Ende: zählt Quellen vor/nach + Stream-Einträge der
-- entsprechenden Kategorie.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1) was_wurde_gemacht → was_gemacht
INSERT INTO public.deployment_log (deployment_id, kategorie, inhalt, created_at)
SELECT id, 'was_gemacht', dokumentation->>'was_wurde_gemacht', created_at
FROM public.deployments
WHERE COALESCE(TRIM(dokumentation->>'was_wurde_gemacht'), '') <> '';

-- 2) durchgefuehrte_themen (Legacy-Fallback aus v1.52 — gleiche Bedeutung
--    wie was_wurde_gemacht, aber älterer Key) — nur wenn was_wurde_gemacht
--    leer war (sonst Duplikat)
INSERT INTO public.deployment_log (deployment_id, kategorie, inhalt, created_at)
SELECT id, 'was_gemacht', dokumentation->>'durchgefuehrte_themen', created_at
FROM public.deployments
WHERE COALESCE(TRIM(dokumentation->>'durchgefuehrte_themen'), '') <> ''
  AND COALESCE(TRIM(dokumentation->>'was_wurde_gemacht'), '') = '';

-- 3) erkenntnisse → erkenntnis
INSERT INTO public.deployment_log (deployment_id, kategorie, inhalt, created_at)
SELECT id, 'erkenntnis', dokumentation->>'erkenntnisse', created_at
FROM public.deployments
WHERE COALESCE(TRIM(dokumentation->>'erkenntnisse'), '') <> '';

-- 4) log_eintrag (Top-Level-Spalte, falls vorhanden) → log
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'deployments'
      AND column_name = 'log_eintrag'
  ) THEN
    INSERT INTO public.deployment_log (deployment_id, kategorie, inhalt, created_at)
    SELECT id, 'log', log_eintrag, created_at
    FROM public.deployments
    WHERE log_eintrag IS NOT NULL AND TRIM(log_eintrag) <> '';

    UPDATE public.deployments SET log_eintrag = NULL
    WHERE log_eintrag IS NOT NULL;
  END IF;
END $$;

-- 5) Quell-Keys aus dokumentation entfernen
UPDATE public.deployments
SET dokumentation = dokumentation
                    - 'was_wurde_gemacht'
                    - 'durchgefuehrte_themen'
                    - 'erkenntnisse'
WHERE dokumentation ? 'was_wurde_gemacht'
   OR dokumentation ? 'durchgefuehrte_themen'
   OR dokumentation ? 'erkenntnisse';

-- ─── Verifizierung ─────────────────────────────────────────────────────────
SELECT 'Quelle was_wurde_gemacht jetzt leer' AS pruefung,
       CASE WHEN (SELECT COUNT(*) FROM public.deployments
                  WHERE COALESCE(TRIM(dokumentation->>'was_wurde_gemacht'), '') <> '') = 0
       THEN 'OK' ELSE 'NICHT LEER' END AS status
UNION ALL
SELECT 'Quelle durchgefuehrte_themen jetzt leer',
       CASE WHEN (SELECT COUNT(*) FROM public.deployments
                  WHERE COALESCE(TRIM(dokumentation->>'durchgefuehrte_themen'), '') <> '') = 0
       THEN 'OK' ELSE 'NICHT LEER' END
UNION ALL
SELECT 'Quelle erkenntnisse jetzt leer',
       CASE WHEN (SELECT COUNT(*) FROM public.deployments
                  WHERE COALESCE(TRIM(dokumentation->>'erkenntnisse'), '') <> '') = 0
       THEN 'OK' ELSE 'NICHT LEER' END
UNION ALL
SELECT 'Stream-Einträge (Total)',
       (SELECT COUNT(*)::text FROM public.deployment_log WHERE deleted_at IS NULL)
UNION ALL
SELECT 'Stream-Einträge kategorie=was_gemacht',
       (SELECT COUNT(*)::text FROM public.deployment_log
        WHERE deleted_at IS NULL AND kategorie = 'was_gemacht')
UNION ALL
SELECT 'Stream-Einträge kategorie=erkenntnis',
       (SELECT COUNT(*)::text FROM public.deployment_log
        WHERE deleted_at IS NULL AND kategorie = 'erkenntnis')
UNION ALL
SELECT 'Stream-Einträge kategorie=log',
       (SELECT COUNT(*)::text FROM public.deployment_log
        WHERE deleted_at IS NULL AND kategorie = 'log');
