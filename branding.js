/* ═══════════════════════════════════════════════════════════
   DOM-Branding — wendet window.APP_CONFIG auf statische HTML-
   Elemente an. Wird von app.js bei DOMContentLoaded gerufen,
   bevor irgendwelche Daten geladen werden, damit nichts
   flackert.

   Diese Datei ist mandanten-unabhängig und wird beim
   Vercel-Build nicht angefasst.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  window.applyBranding = function applyBranding() {
    const C = window.APP_CONFIG;
    if (!C) return;

    // Login-Screen-Logo (nur der erste Auth-Screen ist brand-spezifisch;
    // die anderen drei sind funktionale Screen-Titel)
    const loginLogo = document.querySelector('#auth-screen .auth-logo');
    if (loginLogo) loginLogo.textContent = C.APP_NAME;

    // Top-Nav-Brand (kleingeschrieben)
    document.querySelectorAll('.app-topnav-brand').forEach(el => {
      el.textContent = C.BRAND_TEXT;
    });

    // Sidebar-Brand: Logo, Firmenname, App-Name
    const sidebarLogo = document.querySelector('.sidebar-brand-logo');
    if (sidebarLogo) {
      sidebarLogo.src = C.LOGO_URL;
      sidebarLogo.alt = C.LOGO_ALT;
    }
    const sidebarCompany = document.querySelector('.sidebar-brand-company');
    if (sidebarCompany) sidebarCompany.textContent = C.COMPANY_NAME;
    const sidebarApp = document.querySelector('.sidebar-brand-app');
    if (sidebarApp) sidebarApp.textContent = C.APP_NAME;

    // Mobile-Header-Titel
    document.querySelectorAll('.mobile-header-title').forEach(el => {
      el.textContent = C.APP_NAME;
    });

    // Nutzer-Modal: Email-Placeholder
    const uEmail = document.getElementById('u-email');
    if (uEmail) uEmail.placeholder = C.EMAIL_PLACEHOLDER;
  };
})();
