-- ═══════════════════════════════════════════════════════════════════════════
-- v2.0.5 — notes.titel nullable
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bugfix: postCompanyNote / postProjectNote (v2.0.0) inserten nur `inhalt`,
-- `company_id`/`project_id` und `erstellt_von` — kein Titel. Die `notes`-
-- Tabelle hatte aber `titel text NOT NULL`, also schlug jeder Notiz-Insert
-- aus dem Activity-Stream fehl (Cmd+Enter im Notiz-Eingabe-Feld zeigte
-- keine Reaktion, weil der Fehler nur per Toast angezeigt wurde und der
-- meist nicht ankam).
--
-- Strukturierte Notizen mit Titel sind vorerst nicht in der UI und können
-- bei Bedarf später nachgezogen werden.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.notes ALTER COLUMN titel DROP NOT NULL;

-- Verifizierung
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notes' AND column_name = 'titel';
-- Erwartung: is_nullable = 'YES'
