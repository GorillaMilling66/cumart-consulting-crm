-- ═══════════════════════════════════════════════════════════════════════════
-- v2.9.0 — Datei-Anhänge (Phase 9 vom v2.0-Roadmap)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Generische Anhänge an Firmen, Projekte, Einsätze (später ggf. auch Termine,
-- Kontakte). Polymorphe Beziehung über (entity_type, entity_id) wie schon bei
-- entity_tags / pins.
--
-- Storage-Bucket „attachments" (privat) hält die echten Dateien; die Tabelle
-- `attachments` hält Metadaten + Pfad.
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Metadaten-Tabelle
CREATE TABLE IF NOT EXISTS public.attachments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   text NOT NULL CHECK (entity_type IN ('company','project','deployment','contact','appointment')),
  entity_id     uuid NOT NULL,
  filename      text NOT NULL,
  storage_path  text NOT NULL,
  mime_type     text,
  size_bytes    bigint,
  beschreibung  text,
  uploaded_by   uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_attachments_entity ON public.attachments(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_attachments_active ON public.attachments(created_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS attachments_all_authenticated ON public.attachments;
CREATE POLICY attachments_all_authenticated ON public.attachments
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.attachments;
CREATE POLICY only_active_users ON public.attachments
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (is_active_user()) WITH CHECK (is_active_user());

-- 2. Storage-Bucket anlegen (privat, max 50 MB pro Datei)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('attachments', 'attachments', false, 52428800)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage-Policies (auf storage.objects) — alle authenticated + active
DROP POLICY IF EXISTS "attachments_select_authenticated" ON storage.objects;
CREATE POLICY "attachments_select_authenticated" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'attachments');

DROP POLICY IF EXISTS "attachments_insert_authenticated" ON storage.objects;
CREATE POLICY "attachments_insert_authenticated" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "attachments_update_authenticated" ON storage.objects;
CREATE POLICY "attachments_update_authenticated" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments') WITH CHECK (bucket_id = 'attachments');

DROP POLICY IF EXISTS "attachments_delete_authenticated" ON storage.objects;
CREATE POLICY "attachments_delete_authenticated" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'attachments');

-- Verifizierung
SELECT 'attachments-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='attachments')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'attachments Policies (Soll=2)',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='attachments') = 2
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'Storage-Bucket attachments',
       CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id='attachments')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'Storage-Policies (Soll=4)',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='storage' AND tablename='objects'
             AND policyname LIKE 'attachments_%') = 4
       THEN 'OK' ELSE 'TEILWEISE' END;
