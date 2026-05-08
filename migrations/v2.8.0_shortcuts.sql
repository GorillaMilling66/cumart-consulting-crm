-- ═══════════════════════════════════════════════════════════════════════════
-- v2.8.0 — Quick-Link-Shortcuts für den Arbeitsplatz
-- ═══════════════════════════════════════════════════════════════════════════
--
-- User-konfigurierbare Quick-Links auf dem Arbeitsplatz: Seminarplan, Präsen-
-- tationen, Wissensdatenbanken, externe Tools etc. Pro Eintrag Label + URL +
-- Emoji-Icon + Kategorie + Reihenfolge.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.shortcuts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text NOT NULL,
  url           text NOT NULL,
  icon          text,                                       -- Emoji o. ä.
  kategorie     text,                                       -- "Tools" / "Vorlagen" / "Externe Links"
  beschreibung  text,
  reihenfolge   integer NOT NULL DEFAULT 0,
  ist_aktiv     boolean NOT NULL DEFAULT true,
  erstellt_von  uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shortcuts_aktiv ON public.shortcuts(reihenfolge, label) WHERE ist_aktiv = true;

ALTER TABLE public.shortcuts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS shortcuts_all_authenticated ON public.shortcuts;
CREATE POLICY shortcuts_all_authenticated ON public.shortcuts
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.shortcuts;
CREATE POLICY only_active_users ON public.shortcuts
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (is_active_user()) WITH CHECK (is_active_user());

SELECT 'shortcuts-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='shortcuts')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'shortcuts Policies (Soll=2)',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='shortcuts') = 2
       THEN 'OK' ELSE 'FEHLT' END;
