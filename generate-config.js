#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   Build-Script — überschreibt config.js mit den ENV-Werten
   des aktuellen Vercel-Projekts. Wird von Vercel automatisch
   vor jedem Deploy aufgerufen (siehe vercel.json).

   Lokal: macht nichts (committed config.js bleibt erhalten),
   damit `python3 -m http.server` weiter mit Cumart-Defaults
   funktioniert.
   ═══════════════════════════════════════════════════════════ */

'use strict';

const fs = require('fs');
const path = require('path');

const REQUIRED = [
  'APP_NAME', 'APP_SLUG', 'BRAND_TEXT',
  'COMPANY_NAME', 'COMPANY_OWNER', 'COMPANY_EMAIL', 'COMPANY_WEB',
  'EMAIL_DOMAIN',
  'LOGO_URL', 'LOGO_ALT',
  'SUPABASE_URL', 'SUPABASE_ANON_KEY'
];

const isVercel = process.env.VERCEL === '1';
const missing = REQUIRED.filter(k => !process.env[k]);

if (missing.length > 0) {
  if (isVercel) {
    console.error('\n❌ Vercel-Build: folgende ENV-Variablen fehlen im Project:\n');
    missing.forEach(k => console.error('   - ' + k));
    console.error('\nBitte in Vercel → Project Settings → Environment Variables setzen.\n');
    process.exit(1);
  }
  console.warn('⚠️  Lokaler Build ohne ENV-Override — config.js bleibt unverändert.');
  console.warn('    Fehlend: ' + missing.join(', '));
  process.exit(0);
}

const LOGO_URL_WHITE = process.env.LOGO_URL_WHITE || process.env.LOGO_URL;
const q = (v) => JSON.stringify(v);

const content = `/* AUTO-GENERATED beim Vercel-Build (generate-config.js).
   Lokale Edits werden beim nächsten Deploy überschrieben.
   Quelle: ENV-Variablen des Vercel-Projekts. */

(function () {
  'use strict';

  const CONFIG = {
    APP_NAME:        ${q(process.env.APP_NAME)},
    APP_SLUG:        ${q(process.env.APP_SLUG)},
    BRAND_TEXT:      ${q(process.env.BRAND_TEXT)},
    COMPANY_NAME:    ${q(process.env.COMPANY_NAME)},
    COMPANY_OWNER:   ${q(process.env.COMPANY_OWNER)},
    COMPANY_EMAIL:   ${q(process.env.COMPANY_EMAIL)},
    COMPANY_WEB:     ${q(process.env.COMPANY_WEB)},
    EMAIL_DOMAIN:    ${q(process.env.EMAIL_DOMAIN)},

    LOGO_URL:        ${q(process.env.LOGO_URL)},
    LOGO_URL_WHITE:  ${q(LOGO_URL_WHITE)},
    LOGO_ALT:        ${q(process.env.LOGO_ALT)},

    SUPABASE_URL:        ${q(process.env.SUPABASE_URL)},
    SUPABASE_ANON_KEY:   ${q(process.env.SUPABASE_ANON_KEY)}
  };

  CONFIG.FUNCTIONS_URL     = CONFIG.SUPABASE_URL + '/functions/v1';
  CONFIG.STORAGE_PREFIX    = CONFIG.APP_SLUG;
  CONFIG.EMAIL_PLACEHOLDER = 'max@' + CONFIG.EMAIL_DOMAIN;

  window.APP_CONFIG = CONFIG;
  document.title = CONFIG.APP_NAME;
})();
`;

const outPath = path.join(__dirname, 'config.js');
fs.writeFileSync(outPath, content, 'utf8');
console.log('✓ config.js regeneriert für: ' + process.env.APP_NAME);
