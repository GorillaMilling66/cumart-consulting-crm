-- ═══════════════════════════════════════════════════════════════════════════
-- v2.5.0 — Tags (Cross-Entity-Labels für Firma/Kontakt/Projekt)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Ein Tag (z.B. "VIP", "Heidenhain", "Akquise 2026") kann an mehrere
-- Entitäten unterschiedlicher Typen hängen. Junction `entity_tags` hält die
-- Zuordnungen mit (entity_type, entity_id).
--
-- Schema-Wahl:
--   - Eigene Tabelle statt Spalte → multi-tag, normalisiert
--   - entity_type als TEXT mit CHECK statt FK auf eine Polymorph-Tabelle
--     (Postgres kann keine echten polymorphen FKs)
--   - UNIQUE(tag_id, entity_type, entity_id) → kein doppelt-getaggt
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.tags (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  farbe         text,                                       -- Hex z.B. "#3b82f6"
  beschreibung  text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  erstellt_von  uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS public.entity_tags (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_id       uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  entity_type  text NOT NULL CHECK (entity_type IN ('company','contact','project')),
  entity_id    uuid NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tag_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON public.entity_tags(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_tags_tag    ON public.entity_tags(tag_id);

-- RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tags_all_authenticated ON public.tags;
CREATE POLICY tags_all_authenticated ON public.tags
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.tags;
CREATE POLICY only_active_users ON public.tags
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (is_active_user()) WITH CHECK (is_active_user());

DROP POLICY IF EXISTS entity_tags_all_authenticated ON public.entity_tags;
CREATE POLICY entity_tags_all_authenticated ON public.entity_tags
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.entity_tags;
CREATE POLICY only_active_users ON public.entity_tags
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (is_active_user()) WITH CHECK (is_active_user());

-- Verifizierung
SELECT 'tags-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='tags')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'entity_tags-Tabelle',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='entity_tags')
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'tags Policies (Soll=2)',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='tags') = 2
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'entity_tags Policies (Soll=2)',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='entity_tags') = 2
       THEN 'OK' ELSE 'FEHLT' END;
