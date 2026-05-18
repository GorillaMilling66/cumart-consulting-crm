-- ═══════════════════════════════════════════════════════════════════════════
-- v2.27.0 — Freie Doku-Bereiche pro Entität
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Auf jeder Detail-Seite (Firma · Kontakt · Projekt · Einsatz · Termin) kann
-- der User selbst beliebige Doku-Bereiche anlegen — pro Bereich ein Titel und
-- ein freier Inhalt (Mehrzeiler). Ersetzt die starre `dokumentation`-JSONB-
-- Logik mit ihren festen Feldern.
--
-- Polymorpher Bezug über (entity_type, entity_id) — gleicher Pattern wie
-- `pins` und `attachments`. Keine harten FKs auf die Zieltabelle, damit
-- die Tabelle für alle Entity-Typen mit einem Schema funktioniert.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.doc_sections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  text NOT NULL CHECK (entity_type IN ('company','contact','project','deployment','appointment')),
  entity_id    uuid NOT NULL,
  titel        text NOT NULL,
  inhalt       text,
  reihenfolge  integer NOT NULL DEFAULT 0,
  erstellt_von uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doc_sections_entity
  ON public.doc_sections (entity_type, entity_id, reihenfolge);

-- Trigger: updated_at automatisch pflegen
CREATE OR REPLACE FUNCTION public.trg_doc_sections_set_updated()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doc_sections_updated ON public.doc_sections;
CREATE TRIGGER trg_doc_sections_updated
  BEFORE UPDATE ON public.doc_sections
  FOR EACH ROW EXECUTE FUNCTION public.trg_doc_sections_set_updated();

-- RLS: gleiches Hybrid-Muster wie `pins` / `attachments` —
-- alle authentifizierten User dürfen lesen + schreiben, inaktive User raus.
ALTER TABLE public.doc_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS doc_sections_all_authenticated ON public.doc_sections;
CREATE POLICY doc_sections_all_authenticated ON public.doc_sections
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.doc_sections;
CREATE POLICY only_active_users ON public.doc_sections
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (is_active_user()) WITH CHECK (is_active_user());

-- Verifikation
SELECT 'doc_sections-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='doc_sections')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'doc_sections Index',
       CASE WHEN EXISTS (SELECT 1 FROM pg_indexes
           WHERE schemaname='public' AND tablename='doc_sections' AND indexname='idx_doc_sections_entity')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'doc_sections updated_at-Trigger',
       CASE WHEN EXISTS (SELECT 1 FROM pg_trigger
           WHERE tgname='trg_doc_sections_updated' AND NOT tgisinternal)
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'doc_sections Policies (Soll=2)',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='doc_sections') = 2
       THEN 'OK' ELSE 'FEHLT' END;
