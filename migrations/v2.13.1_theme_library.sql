-- ═══════════════════════════════════════════════════════════════════════════
-- v2.13.1 — Globale Themen-Bibliothek
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Bisher leben Themen ausschließlich pro Projekt (`project_themes`). Jedes
-- Projekt sammelt seine Themen frisch — wiederkehrende Themen (z. B. „TNC7
-- Grundlagen", „Werkzeugverwaltung", „Programmierung Schraubstock") müssen
-- jedes Mal neu eingetippt werden.
-- Neu: zentrale `theme_library` als Pool an Standard-Themen. Beim Projekt
-- können mehrere Themen aus der Bibliothek übernommen werden — sie werden
-- als project_themes-Zeilen mit Name/Beschreibung/Farbe kopiert (Snapshot,
-- damit projekt-spezifische Anpassungen möglich bleiben).
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.theme_library (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  beschreibung  text,
  kategorie     text,                                         -- z. B. „TNC7", „Werkzeug", „Programmierung"
  farbe         text,                                         -- Hex-Color für Pill (optional)
  ist_aktiv     boolean NOT NULL DEFAULT true,
  erstellt_von  uuid REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_theme_library_name      ON public.theme_library(name)      WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_theme_library_kategorie ON public.theme_library(kategorie) WHERE deleted_at IS NULL;

-- RLS analog zu products / project_products: alle authenticated dürfen lesen+
-- schreiben, RESTRICTIVE only_active_users sperrt deaktivierte Konten aus.
ALTER TABLE public.theme_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS theme_library_all_authenticated ON public.theme_library;
CREATE POLICY theme_library_all_authenticated ON public.theme_library
  AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS only_active_users ON public.theme_library;
CREATE POLICY only_active_users ON public.theme_library
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_active_user()) WITH CHECK (public.is_active_user());

-- Optional: project_themes bekommt eine Referenz zur Bibliothek (Snapshot-
-- Quelle), damit man im UI sieht „kommt aus Bibliothek X". Nicht zwingend,
-- aber praktisch fürs spätere Re-Sync-Feature.
ALTER TABLE public.project_themes
  ADD COLUMN IF NOT EXISTS library_theme_id uuid REFERENCES public.theme_library(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_project_themes_library ON public.project_themes(library_theme_id) WHERE deleted_at IS NULL;

-- Verifizierung
SELECT 'theme_library-Tabelle' AS pruefung,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables
           WHERE table_schema='public' AND table_name='theme_library')
       THEN 'OK' ELSE 'FEHLT' END AS status
UNION ALL
SELECT 'theme_library RLS 2 Policies',
       CASE WHEN (SELECT COUNT(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='theme_library') = 2
       THEN 'OK' ELSE 'FEHLT' END
UNION ALL
SELECT 'project_themes.library_theme_id',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema='public' AND table_name='project_themes' AND column_name='library_theme_id')
       THEN 'OK' ELSE 'FEHLT' END;
