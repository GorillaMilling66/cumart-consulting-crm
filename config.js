/* ═══════════════════════════════════════════════════════════
   App-Konfiguration (Branding + Backend-Verbindung)

   - Lokal: diese Datei wird unverändert ausgeliefert
     (Cumart-Defaults).
   - Vercel-Deploy: generate-config.js überschreibt diese
     Datei beim Build aus den Projekt-ENV-Variablen.

   Eine neue Mandanten-Instanz aufsetzen → siehe SETUP.md.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const CONFIG = {
    APP_NAME:        'Cumart CRM',
    APP_SLUG:        'cumart',
    BRAND_TEXT:      'cumart',
    COMPANY_NAME:    'Cumart Consulting',
    COMPANY_OWNER:   'Selcuk Cumart',
    COMPANY_EMAIL:   'selcuk@cumart.tech',
    COMPANY_WEB:     'cumart.cloud',
    EMAIL_DOMAIN:    'cumart.de',

    LOGO_URL:        'cumart-logo.svg',
    LOGO_URL_WHITE:  'cumart-logo-white.png',
    LOGO_ALT:        'Cumart',

    SUPABASE_URL:        'https://loohjeiysjxzbmfwkyvv.supabase.co',
    SUPABASE_ANON_KEY:   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2hqZWl5c2p4emJtZndreXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjUwNzUsImV4cCI6MjA5MjAwMTA3NX0.L75kTzqx4hJY7buBFv9iMZ-mrQ3vdNqB-G50MPpRbNw'
  };

  // Abgeleitete Werte
  CONFIG.FUNCTIONS_URL     = CONFIG.SUPABASE_URL + '/functions/v1';
  CONFIG.STORAGE_PREFIX    = CONFIG.APP_SLUG;
  CONFIG.EMAIL_PLACEHOLDER = 'max@' + CONFIG.EMAIL_DOMAIN;

  window.APP_CONFIG = CONFIG;

  // Browser-Tab-Titel sofort setzen (Script läuft im <head>)
  document.title = CONFIG.APP_NAME;
})();
