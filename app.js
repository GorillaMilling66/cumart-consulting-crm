/* ═══════════════════════════════════════════════════════════
   Cumart CRM – Application Script
   Version 1.6.0 (Termine – Phase 3a Stufe 1)
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── KONFIGURATION ────────────────────────────────────────────
const SUPABASE_URL        = 'https://loohjeiysjxzbmfwkyvv.supabase.co';
const SUPABASE_ANON_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2hqZWl5c2p4emJtZndreXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjUwNzUsImV4cCI6MjA5MjAwMTA3NX0.L75kTzqx4hJY7buBFv9iMZ-mrQ3vdNqB-G50MPpRbNw';
const FUNCTIONS_URL       = SUPABASE_URL + '/functions/v1';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SVG-Copy-Icon als String-Konstante
const COPY_ICON_SVG = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;

// ── APP STATE ────────────────────────────────────────────────
let currentUser        = null;
let currentProfile     = null;
let allRoles           = [];
let editingUserId      = null;
let editingServiceId   = null;
let editingLookupId    = null;
let editingCompanyId   = null;
let editingContactId   = null;
let editingAppointmentId = null;
let inPasswordRecovery = false;

let currentCompanyDetailId = null;
let contactModalPrefillCompanyId = null;

let companiesCache   = [];
let contactsCache    = [];
let appointmentsCache = [];
let terminTypenCache = []; // Lookup-Values für termin_typ

// Für Auto-Fill-Logik: speichert die zuletzt auto-ausgefüllte Adresse,
// damit wir erkennen, ob das Feld manuell bearbeitet wurde
let lastAutoFilledOrt = '';

// ── HILFSFUNKTIONEN ──────────────────────────────────────────
function ini(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function statusLabel(s) { return { eingeladen: 'Eingeladen', aktiv: 'Aktiv', inaktiv: 'Inaktiv' }[s] || 'Unbekannt'; }
function statusBg(s) { return { eingeladen: '#fffbeb', aktiv: '#f0fdf4', inaktiv: '#fef2f2' }[s] || '#f3f4f6'; }
function statusColor(s) { return { eingeladen: '#d97706', aktiv: '#16a34a', inaktiv: '#dc2626' }[s] || '#6b7280'; }

function isAdmin() {
  return currentProfile?.roles?.name === 'Admin';
}

function formatPreis(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function esc(s) {
  return (s ?? '').toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => t.className = 'toast', 3000);
}

/** Copy-to-clipboard mit Fallback für Nicht-Secure-Contexts */
async function copyToClipboard(text, toastMsg = 'In Zwischenablage kopiert.') {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(toastMsg);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (!ok) throw new Error('execCommand copy failed');
    showToast(toastMsg);
    return true;
  } catch (e) {
    showToast('Kopieren nicht möglich: ' + e.message, true);
    return false;
  }
}

/** Formatiert Firma als Plaintext-Block für Zwischenablage */
function formatCompanyBlock(company, contacts = []) {
  const lines = [];
  if (company.name) lines.push(company.name);
  if (company.strasse) lines.push(company.strasse);
  const ort = [company.plz, company.stadt].filter(Boolean).join(' ').trim();
  if (ort) lines.push(ort);

  const kontaktNamen = (contacts || [])
    .map(k => [k.vorname, k.nachname].filter(Boolean).join(' ').trim())
    .filter(Boolean);
  if (kontaktNamen.length > 0) {
    lines.push('');
    lines.push(...kontaktNamen);
  }
  return lines.join('\n');
}

/** Formatiert Kontakt als Plaintext-Block */
function formatContactBlock(contact) {
  const lines = [];
  const fullName = [contact.vorname, contact.nachname].filter(Boolean).join(' ').trim();
  if (fullName) lines.push(fullName);
  if (contact.email) lines.push(contact.email);
  if (contact.telefon) lines.push(contact.telefon);
  const company = contact.company;
  if (company) {
    if (company.name) lines.push(company.name);
    if (company.strasse) lines.push(company.strasse);
    const ort = [company.plz, company.stadt].filter(Boolean).join(' ').trim();
    if (ort) lines.push(ort);
  }
  return lines.join('\n');
}

async function copyCompanyById(companyId) {
  let company = companiesCache.find(c => c.id === companyId);
  if (!company) {
    const { data, error } = await db.from('companies').select('*').eq('id', companyId).single();
    if (error || !data) { showToast('Firma nicht gefunden.', true); return; }
    company = data;
  }
  const { data: contacts, error: contactsErr } = await db
    .from('contacts').select('vorname, nachname')
    .eq('company_id', companyId).order('nachname');
  if (contactsErr) { showToast('Kontakte konnten nicht geladen werden: ' + contactsErr.message, true); return; }
  const text = formatCompanyBlock(company, contacts || []);
  await copyToClipboard(text, 'Firmendaten kopiert.');
}

async function copyContactById(contactId) {
  let contact = contactsCache.find(k => k.id === contactId);
  if (!contact) {
    const { data, error } = await db.from('contacts')
      .select('*, company:companies(name, strasse, plz, stadt)')
      .eq('id', contactId).single();
    if (error || !data) { showToast('Kontakt nicht gefunden.', true); return; }
    contact = data;
  }
  const text = formatContactBlock(contact);
  await copyToClipboard(text, 'Kontakt kopiert.');
}

// ═══════════════════════════════════════════════════════════
//  DATUM/ZEIT-HILFSFUNKTIONEN (für Termine-Filter/Anzeige)
// ═══════════════════════════════════════════════════════════

/** "2026-04-21" → Date-Objekt lokal (nicht UTC) */
function parseLocalDate(isoDateStr) {
  const [y, m, d] = isoDateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Date → "YYYY-MM-DD" für HTML-date-Inputs */
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** "2026-04-21" → "Di, 21.04.2026" */
function formatDateDE(isoDateStr) {
  if (!isoDateStr) return '—';
  try {
    const d = parseLocalDate(isoDateStr);
    const wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${wd}, ${day}.${month}.${year}`;
  } catch {
    return isoDateStr;
  }
}

/** "14:30:00" → "14:30" */
function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

/** Termin-Status-Badge-Farben */
function appointmentStatusBg(s)    { return s === 'geplant' ? '#eff6ff' : '#f0fdf4'; }
function appointmentStatusColor(s) { return s === 'geplant' ? '#1d4ed8' : '#16a34a'; }
function appointmentStatusLabel(s) { return s === 'geplant' ? 'Geplant' : 'Durchgeführt'; }

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item:not(.nav-item-group)').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name)?.classList.add('active');

  const navBtn = document.getElementById('nav-' + name);
  if (navBtn) navBtn.classList.add('active');

  setMobileNav(name);

  if (name === 'users') loadUsers();
  if (name === 'services') loadServices();
  if (name === 'lookups') loadLookupsPage();
  if (name === 'companies') loadCompanies();
  if (name === 'contacts') loadContacts();
  if (name === 'appointments') loadAppointments();
}

function setMobileNav(pageName) {
  document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.remove('active'));

  if (pageName === 'companies' || pageName === 'company-detail') {
    document.getElementById('m-nav-companies')?.classList.add('active');
  } else if (pageName === 'contacts') {
    document.getElementById('m-nav-contacts')?.classList.add('active');
  } else if (pageName === 'appointments') {
    document.getElementById('m-nav-appointments')?.classList.add('active');
  } else {
    document.getElementById('m-nav-more')?.classList.add('active');
  }
}

function toggleSettings() {
  document.getElementById('nav-settings-group').classList.toggle('open');
}

function openMoreMenu()  { document.getElementById('more-overlay').classList.add('open'); }
function closeMoreMenu(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('more-overlay').classList.remove('open');
}

// ═══════════════════════════════════════════════════════════
//  HASH-ROUTER
// ═══════════════════════════════════════════════════════════

function navigateTo(page, param) {
  const hash =
    page === 'firma' && param ? `#/firma/${param}` :
    page === 'companies'      ? '#/firmen' :
    page === 'contacts'       ? '#/kontakte' :
    page === 'appointments'   ? '#/termine' :
    page === 'users'          ? '#/benutzer' :
    page === 'services'       ? '#/leistungen' :
    page === 'lookups'        ? '#/stammdaten' :
    '#/firmen';
  window.location.hash = hash;
}

function handleHashChange() {
  if (document.getElementById('app').style.display === 'none') return;
  if (inPasswordRecovery) return;

  const hash = window.location.hash || '';

  if (hash.startsWith('#/firma/')) {
    const id = hash.slice('#/firma/'.length);
    if (id) { loadCompanyDetail(id); return; }
  }

  if (hash === '#/firmen' || hash === '' || hash === '#') { showPage('companies'); return; }
  if (hash === '#/kontakte')   { showPage('contacts'); return; }
  if (hash === '#/termine')    { showPage('appointments'); return; }
  if (hash === '#/benutzer')   { showPage('users'); return; }
  if (hash === '#/leistungen') { showPage('services'); return; }
  if (hash === '#/stammdaten') { showPage('lookups'); return; }

  showPage('companies');
}

// ── SCREEN-WECHSEL ───────────────────────────────────────────
function hideAllScreens() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('reset-screen').style.display = 'none';
  document.getElementById('recovery-screen').style.display = 'none';
  document.getElementById('mustchange-screen').style.display = 'none';
  document.getElementById('app').style.display = 'none';
}

function showLoginScreen()    { hideAllScreens(); document.getElementById('auth-screen').style.display = 'flex'; }
function showResetScreen()    { hideAllScreens(); document.getElementById('reset-screen').style.display = 'flex'; }
function showRecoveryScreen() { hideAllScreens(); document.getElementById('recovery-screen').style.display = 'flex'; setTimeout(() => document.getElementById('recovery-1').focus(), 100); }
function showMustChangeScreen() { hideAllScreens(); document.getElementById('mustchange-screen').style.display = 'flex'; setTimeout(() => document.getElementById('mustchange-1').focus(), 100); }
function showApp()            { hideAllScreens(); document.getElementById('app').style.display = 'flex'; }

// ── AUTH INIT ────────────────────────────────────────────────
async function initAuth() {
  const hash = window.location.hash;

  if (hash.includes('type=recovery') || hash.includes('type=invite')) {
    inPasswordRecovery = true;
    showRecoveryScreen();
    db.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') { inPasswordRecovery = false; showLoginScreen(); }
    });
    return;
  }

  try {
    const { data: { session } } = await db.auth.getSession();
    if (session) await onLogin(session.user);
    else showLoginScreen();
  } catch (e) { showLoginScreen(); }

  db.auth.onAuthStateChange(async (event, session) => {
    if (inPasswordRecovery) return;
    if (event === 'SIGNED_OUT') {
      currentUser = null;
      currentProfile = null;
      showLoginScreen();
    }
    if (event === 'SIGNED_IN' && session && !currentUser) {
      await onLogin(session.user);
    }
  });

  window.addEventListener('hashchange', handleHashChange);
}

// ── LOGIN-FLOW ───────────────────────────────────────────────
async function onLogin(user) {
  currentUser = user;

  const { data: profile, error: profileError } = await db
    .from('user_profiles')
    .select('*, roles(id, name, rechte)')
    .eq('id', user.id).single();

  if (profileError || !profile) {
    await db.auth.signOut();
    currentUser = null;
    showLoginScreen();
    showToast('Benutzerprofil nicht gefunden. Bitte wende dich an einen Administrator.', true);
    return;
  }

  if (profile.status === 'inaktiv') {
    await db.auth.signOut();
    currentUser = null;
    showLoginScreen();
    showToast('Dein Konto ist deaktiviert. Bitte wende dich an einen Administrator.', true);
    return;
  }

  currentProfile = profile;

  if (profile.muss_passwort_aendern === true) {
    showMustChangeScreen();
    return;
  }

  renderSidebar();
  renderMobileHeaderUser();
  applyAdminOnlyUI();
  showApp();

  if (isAdmin()) {
    document.getElementById('nav-settings-group').classList.add('open');
  }

  await loadRoles();

  if (window.location.hash && window.location.hash !== '#') {
    handleHashChange();
  } else {
    navigateTo('companies');
  }
}

function applyAdminOnlyUI() {
  const admin = isAdmin();
  document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
    el.style.display = admin ? '' : 'none';
  });
  document.getElementById('btn-new-user').style.display = admin ? 'inline-block' : 'none';
  document.getElementById('btn-new-service').style.display = admin ? 'inline-block' : 'none';
}

function renderSidebar() {
  const bar = document.getElementById('sidebar-user');
  bar.innerHTML = `
    <div class="sidebar-user-avatar">${esc(ini(currentProfile?.name || currentUser.email))}</div>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${esc(currentProfile?.name || currentUser.email)}</div>
      <div class="sidebar-user-role">${esc(currentProfile?.roles?.name || '—')}</div>
    </div>`;
}

function renderMobileHeaderUser() {
  const el = document.getElementById('mobile-header-user');
  if (!el) return;
  el.innerHTML = `
    <span class="mobile-header-user-name">${esc(currentProfile?.name || currentUser.email)}</span>
    <div class="sidebar-user-avatar" style="width:30px;height:30px">${esc(ini(currentProfile?.name || currentUser.email))}</div>
  `;
}

async function doLogin() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl    = document.getElementById('auth-error');
  const btn      = document.getElementById('auth-btn');

  errEl.classList.remove('show');
  if (!email || !password) {
    errEl.textContent = 'Bitte E-Mail und Passwort eingeben.';
    errEl.classList.add('show');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Anmelden ...';

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw new Error(
      error.message === 'Invalid login credentials' ? 'E-Mail oder Passwort falsch.' : error.message
    );
    await onLogin(data.user);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Anmelden';
  }
}

async function doLogout(skipConfirm = false) {
  if (!skipConfirm && !confirm('Wirklich abmelden?')) return;
  document.getElementById('more-overlay')?.classList.remove('open');
  await db.auth.signOut();
  currentUser = null;
  currentProfile = null;
  inPasswordRecovery = false;
  window.location.hash = '';
  showLoginScreen();
}

async function doReset() {
  const email = document.getElementById('reset-email').value.trim();
  const errEl = document.getElementById('reset-error');
  const btn   = document.getElementById('reset-btn');
  const sucEl = document.getElementById('reset-success');

  errEl.classList.remove('show');
  sucEl.style.display = 'none';
  if (!email) { errEl.textContent = 'Bitte E-Mail eingeben.'; errEl.classList.add('show'); return; }

  btn.disabled = true;
  btn.textContent = 'Wird gesendet ...';

  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });

  btn.disabled = false;
  btn.textContent = 'Link senden';

  if (error) { errEl.textContent = error.message; errEl.classList.add('show'); }
  else { sucEl.style.display = 'block'; }
}

async function doMustChangePassword() {
  const pw1 = document.getElementById('mustchange-1').value;
  const pw2 = document.getElementById('mustchange-2').value;
  const errEl = document.getElementById('mustchange-error');
  const btn = document.getElementById('mustchange-btn');

  errEl.classList.remove('show');

  if (pw1.length < 6) { errEl.textContent = 'Passwort muss mindestens 6 Zeichen haben.'; errEl.classList.add('show'); return; }
  if (pw1 !== pw2) { errEl.textContent = 'Passwörter stimmen nicht überein.'; errEl.classList.add('show'); return; }

  btn.disabled = true;
  btn.textContent = 'Wird gespeichert ...';

  try {
    const { error: pwError } = await db.auth.updateUser({ password: pw1 });
    if (pwError) throw new Error(pwError.message);

    const { error: flagError } = await db
      .from('user_profiles').update({ muss_passwort_aendern: false })
      .eq('id', currentUser.id);
    if (flagError) throw new Error(flagError.message);

    const { data: profile, error: profileError } = await db
      .from('user_profiles').select('*, roles(id, name, rechte)')
      .eq('id', currentUser.id).single();
    if (profileError || !profile) throw new Error('Profil konnte nicht geladen werden.');

    currentProfile = profile;
    renderSidebar();
    renderMobileHeaderUser();
    applyAdminOnlyUI();
    showApp();

    if (isAdmin()) document.getElementById('nav-settings-group').classList.add('open');
    await loadRoles();
    navigateTo('companies');

    showToast('Passwort erfolgreich geändert.');
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Passwort speichern';
  }
}

async function doRecoveryPassword() {
  const pw1 = document.getElementById('recovery-1').value;
  const pw2 = document.getElementById('recovery-2').value;
  const errEl = document.getElementById('recovery-error');
  const btn = document.getElementById('recovery-btn');

  errEl.classList.remove('show');

  if (pw1.length < 6) { errEl.textContent = 'Passwort muss mindestens 6 Zeichen haben.'; errEl.classList.add('show'); return; }
  if (pw1 !== pw2) { errEl.textContent = 'Passwörter stimmen nicht überein.'; errEl.classList.add('show'); return; }

  btn.disabled = true;
  btn.textContent = 'Wird gespeichert ...';

  try {
    const { error } = await db.auth.updateUser({ password: pw1 });
    if (error) throw new Error(error.message);

    window.history.replaceState(null, '', window.location.pathname);
    inPasswordRecovery = false;

    const { data: { session } } = await db.auth.getSession();
    if (!session) { showToast('Passwort gesetzt. Bitte neu anmelden.'); showLoginScreen(); return; }

    await onLogin(session.user);
    showToast('Passwort erfolgreich geändert.');
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Passwort speichern & einloggen';
  }
}

// ═══════════════════════════════════════════════════════════
//  BENUTZER-VERWALTUNG
// ═══════════════════════════════════════════════════════════

async function loadRoles() {
  const { data, error } = await db.from('roles').select('*').eq('ist_aktiv', true).order('name');
  if (error) { showToast('Fehler beim Laden der Rollen: ' + error.message, true); return; }
  allRoles = data || [];
}

async function loadUsers() {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Lade ...</div></td></tr>';

  const { data: users, error } = await db.from('user_profiles').select('*, roles(name)').order('name');

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    return;
  }
  if (!users || users.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Noch keine Benutzer.</div></td></tr>';
    return;
  }

  const canAdminister = isAdmin();

  tbody.innerHTML = users.map(u => {
    const isMe = u.id === currentUser?.id;
    const roleColor = u.roles?.name === 'Admin' ? '#1d4ed8' : '#374151';
    const roleBg    = u.roles?.name === 'Admin' ? '#eff6ff' : '#f3f4f6';

    let actions = '';
    if (canAdminister) {
      actions += `<button class="btn btn-sm" onclick="openUserModal('edit', '${u.id}')">Bearbeiten</button>`;
      if (!isMe) {
        actions += `<button class="btn btn-sm" onclick="resetUserPassword('${u.id}', '${esc(u.name || '')}')">Passwort zurücksetzen</button>`;
      }
    }

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${esc(ini(u.name))}</div>
            <div>
              <div style="font-weight:500">${esc(u.name)}</div>
              ${isMe ? '<div style="font-size:11px;color:var(--muted)">Das bist du</div>' : ''}
            </div>
          </div>
        </td>
        <td style="color:var(--muted)">${esc(u.email)}</td>
        <td><span class="badge" style="background:${roleBg};color:${roleColor}">${esc(u.roles?.name || '—')}</span></td>
        <td><span class="badge" style="background:${statusBg(u.status)};color:${statusColor(u.status)}">${esc(statusLabel(u.status))}</span></td>
        <td style="text-align:right"><div class="btn-row" style="justify-content:flex-end">${actions}</div></td>
      </tr>`;
  }).join('');
}

async function openUserModal(mode, userId = null) {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Aktion.', true); return; }
  editingUserId = userId;

  const roleSelect = document.getElementById('u-role');
  roleSelect.innerHTML = allRoles.map(r => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
  roleSelect.disabled = false;

  document.getElementById('u-name').value = '';
  document.getElementById('u-email').value = '';
  document.getElementById('u-password').value = '';

  if (mode === 'new') {
    document.getElementById('modal-user-title').textContent = 'Neuer Benutzer';
    document.getElementById('u-password-hint').textContent = '(leer = automatisch generieren)';
    document.getElementById('u-password').placeholder = 'Leer lassen für automatisches Passwort';
    document.getElementById('u-save-btn').textContent = 'Anlegen';
    document.getElementById('u-delete-btn').style.display = 'none';
    document.getElementById('u-email').disabled = false;
    document.getElementById('u-password-group').style.display = '';
  } else {
    const isEditingSelf = userId === currentUser?.id;
    document.getElementById('modal-user-title').textContent = isEditingSelf ? 'Mein Profil' : 'Benutzer bearbeiten';
    document.getElementById('u-password-hint').textContent = '(leer = unverändert)';
    document.getElementById('u-password').placeholder = 'Leer lassen für unverändertes Passwort';
    document.getElementById('u-save-btn').textContent = 'Speichern';
    document.getElementById('u-delete-btn').style.display = isEditingSelf ? 'none' : 'block';
    document.getElementById('u-email').disabled = true;
    roleSelect.disabled = isEditingSelf;
    document.getElementById('u-password-group').style.display = '';

    const { data, error } = await db.from('user_profiles').select('*, roles(id, name)').eq('id', userId).single();
    if (error || !data) { showToast('Benutzer konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingUserId = null; return; }
    document.getElementById('u-name').value = data.name || '';
    document.getElementById('u-email').value = data.email || '';
    if (data.role_id) roleSelect.value = data.role_id;
  }

  document.getElementById('modal-user').classList.add('open');
  setTimeout(() => document.getElementById('u-name').focus(), 100);
}

function closeUserModal() { document.getElementById('modal-user').classList.remove('open'); editingUserId = null; }

async function saveUser() {
  const name     = document.getElementById('u-name').value.trim();
  const email    = document.getElementById('u-email').value.trim();
  const role_id  = document.getElementById('u-role').value;
  const password = document.getElementById('u-password').value;
  const btn      = document.getElementById('u-save-btn');

  if (!name) { showToast('Bitte Name eingeben.', true); return; }
  if (!editingUserId && !email) { showToast('Bitte E-Mail eingeben.', true); return; }
  if (!role_id) { showToast('Bitte Rolle auswählen.', true); return; }
  if (password && password.length < 6) { showToast('Passwort muss mind. 6 Zeichen haben.', true); return; }

  btn.disabled = true;
  btn.textContent = editingUserId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.access_token) throw new Error('Nicht eingeloggt.');

    const body = editingUserId
      ? { action: 'update', user_id: editingUserId, name, role_id, password: password || undefined }
      : { action: 'invite', email, name, role_id, password: password || undefined };

    const resp = await fetch(`${FUNCTIONS_URL}/manage-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token, 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify(body)
    });
    const result = await resp.json();
    if (!resp.ok) throw new Error(result.error || 'Unbekannter Fehler');

    closeUserModal();
    if (editingUserId) {
      showToast('Benutzer aktualisiert.');
    } else {
      showCredentials({ title: 'Zugangsdaten für ' + name, email: result.email, password: result.password });
    }
    await loadUsers();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingUserId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteUser() {
  if (!editingUserId) return;
  if (editingUserId === currentUser?.id) { showToast('Du kannst dich nicht selbst löschen.', true); return; }
  if (!confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;

  const btn = document.getElementById('u-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.access_token) throw new Error('Nicht eingeloggt.');

    const resp = await fetch(`${FUNCTIONS_URL}/manage-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token, 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ action: 'delete', user_id: editingUserId })
    });
    const result = await resp.json();
    if (!resp.ok) throw new Error(result.error || 'Unbekannter Fehler');

    closeUserModal();
    showToast('Benutzer gelöscht.');
    await loadUsers();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}

async function resetUserPassword(userId, userName) {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Aktion.', true); return; }
  if (!confirm(`Für "${userName}" ein neues Passwort generieren?\n\nDas alte Passwort wird sofort ungültig. Der Benutzer muss sich beim nächsten Login ein eigenes Passwort setzen.`)) return;

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.access_token) throw new Error('Nicht eingeloggt.');

    const resp = await fetch(`${FUNCTIONS_URL}/manage-users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + session.access_token, 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ action: 'reset_password', user_id: userId })
    });
    const result = await resp.json();
    if (!resp.ok) throw new Error(result.error || 'Unbekannter Fehler');

    showCredentials({ title: 'Neues Passwort für ' + userName, email: result.email, password: result.password });
    await loadUsers();
  } catch (e) {
    showToast(e.message, true);
  }
}

function showCredentials({ title, email, password }) {
  document.getElementById('modal-credentials-title').textContent = title;
  document.getElementById('cred-email').textContent = email;
  document.getElementById('cred-password').textContent = password;
  document.getElementById('modal-credentials').classList.add('open');
}

function closeCredentialsModal() {
  document.getElementById('modal-credentials').classList.remove('open');
  document.getElementById('cred-email').textContent = '';
  document.getElementById('cred-password').textContent = '';
}

async function copyCredential(elementId) {
  await copyToClipboard(document.getElementById(elementId).textContent);
}

async function copyBothCredentials() {
  const email = document.getElementById('cred-email').textContent;
  const password = document.getElementById('cred-password').textContent;
  await copyToClipboard(`E-Mail: ${email}\nPasswort: ${password}`, 'Zugangsdaten in Zwischenablage kopiert.');
}

// ═══════════════════════════════════════════════════════════
//  LEISTUNGEN (SERVICES)
// ═══════════════════════════════════════════════════════════

async function loadLeistungsKategorien() {
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe').eq('kategorie', 'leistungs_kategorie').eq('ist_aktiv', true).order('reihenfolge');
  if (error) { showToast('Fehler beim Laden der Kategorien: ' + error.message, true); return []; }
  return data || [];
}

async function loadServices() {
  const tbody = document.getElementById('services-table-body');
  tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade ...</div></td></tr>';

  const { data, error } = await db.from('services')
    .select('*, kategorie:lookup_values!services_kategorie_id_fkey(id, wert, farbe)').order('name');

  if (error) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }
  if (!data || data.length === 0) {
    const hint = isAdmin() ? 'Noch keine Leistungen angelegt. Klicke oben auf „+ Neue Leistung".' : 'Noch keine Leistungen verfügbar.';
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">${hint}</div></td></tr>`;
    return;
  }

  const canEdit = isAdmin();

  tbody.innerHTML = data.map(s => {
    const katFarbe = s.kategorie?.farbe || '#6b7280';
    const katWert  = s.kategorie?.wert || '—';
    const aktivBg  = s.ist_aktiv ? '#f0fdf4' : '#f3f4f6';
    const aktivCol = s.ist_aktiv ? '#16a34a' : '#6b7280';
    const aktivTxt = s.ist_aktiv ? 'Aktiv' : 'Archiviert';
    const editBtn = canEdit ? `<button class="btn btn-sm" onclick="openServiceModal('edit', '${s.id}')">Bearbeiten</button>` : '';

    return `
      <tr>
        <td>
          <div style="font-weight:500">${esc(s.name)}</div>
          ${s.beschreibung ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(s.beschreibung)}</div>` : ''}
        </td>
        <td><span class="badge" style="background:${esc(katFarbe)}22;color:${esc(katFarbe)}">${esc(katWert)}</span></td>
        <td style="color:var(--muted)">${esc(s.einheit || '—')}</td>
        <td>${esc(formatPreis(s.standardpreis))}</td>
        <td><span class="badge" style="background:${aktivBg};color:${aktivCol}">${aktivTxt}</span></td>
        <td style="text-align:right">${editBtn}</td>
      </tr>`;
  }).join('');
}

async function openServiceModal(mode, serviceId = null) {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Aktion.', true); return; }
  editingServiceId = serviceId;

  const kategorien = await loadLeistungsKategorien();
  const kategorieSelect = document.getElementById('s-kategorie');
  if (kategorien.length === 0) {
    kategorieSelect.innerHTML = '<option value="">Keine Kategorien – bitte erst unter „Stammdaten" anlegen</option>';
  } else {
    kategorieSelect.innerHTML = kategorien.map(k => `<option value="${esc(k.id)}">${esc(k.wert)}</option>`).join('');
  }

  document.getElementById('s-name').value = '';
  document.getElementById('s-beschreibung').value = '';
  document.getElementById('s-einheit').value = 'Tag';
  document.getElementById('s-preis').value = '';
  document.getElementById('s-aktiv').value = 'true';

  if (mode === 'new') {
    document.getElementById('modal-service-title').textContent = 'Neue Leistung';
    document.getElementById('s-save-btn').textContent = 'Anlegen';
    document.getElementById('s-delete-btn').style.display = 'none';
  } else {
    document.getElementById('modal-service-title').textContent = 'Leistung bearbeiten';
    document.getElementById('s-save-btn').textContent = 'Speichern';
    document.getElementById('s-delete-btn').style.display = 'block';

    const { data, error } = await db.from('services').select('*').eq('id', serviceId).single();
    if (error || !data) { showToast('Leistung konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingServiceId = null; return; }
    document.getElementById('s-name').value = data.name || '';
    document.getElementById('s-beschreibung').value = data.beschreibung || '';
    document.getElementById('s-einheit').value = data.einheit || 'Tag';
    document.getElementById('s-preis').value = data.standardpreis ?? '';
    document.getElementById('s-aktiv').value = data.ist_aktiv ? 'true' : 'false';
    if (data.kategorie_id) kategorieSelect.value = data.kategorie_id;
  }

  document.getElementById('modal-service').classList.add('open');
  setTimeout(() => document.getElementById('s-name').focus(), 100);
}

function closeServiceModal() { document.getElementById('modal-service').classList.remove('open'); editingServiceId = null; }

async function saveService() {
  const name          = document.getElementById('s-name').value.trim();
  const beschreibung  = document.getElementById('s-beschreibung').value.trim();
  const kategorie_id  = document.getElementById('s-kategorie').value;
  const einheit       = document.getElementById('s-einheit').value;
  const preisRaw      = document.getElementById('s-preis').value;
  const ist_aktiv     = document.getElementById('s-aktiv').value === 'true';
  const btn           = document.getElementById('s-save-btn');

  if (!name) { showToast('Bitte Name eingeben.', true); return; }
  if (!kategorie_id) { showToast('Bitte Kategorie auswählen.', true); return; }
  if (!einheit) { showToast('Bitte Einheit auswählen.', true); return; }

  const standardpreis = preisRaw === '' ? 0 : Number(preisRaw);
  if (Number.isNaN(standardpreis) || standardpreis < 0) { showToast('Preis muss eine Zahl ≥ 0 sein.', true); return; }

  btn.disabled = true;
  btn.textContent = editingServiceId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = { name, beschreibung: beschreibung || null, kategorie_id, einheit, standardpreis, ist_aktiv };
    let error;
    if (editingServiceId) { ({ error } = await db.from('services').update(payload).eq('id', editingServiceId)); }
    else { ({ error } = await db.from('services').insert(payload)); }
    if (error) throw new Error(error.message);

    closeServiceModal();
    showToast(editingServiceId ? 'Leistung aktualisiert.' : 'Leistung angelegt.');
    await loadServices();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingServiceId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteService() {
  if (!editingServiceId) return;
  if (!confirm('Leistung wirklich löschen?\n\nHinweis: Wenn sie bereits in Einsätzen oder Terminen verwendet wird, solltest du sie stattdessen archivieren.')) return;

  const btn = document.getElementById('s-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    const { error } = await db.from('services').delete().eq('id', editingServiceId);
    if (error) {
      if (error.message.toLowerCase().includes('foreign key') || error.code === '23503') {
        throw new Error('Diese Leistung wird noch in Einsätzen oder Terminen verwendet. Archiviere sie stattdessen.');
      }
      throw new Error(error.message);
    }
    closeServiceModal();
    showToast('Leistung gelöscht.');
    await loadServices();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}

// ═══════════════════════════════════════════════════════════
//  STAMMDATEN / LOOKUP-WERTE
// ═══════════════════════════════════════════════════════════

async function loadLookupKategorien() {
  const { data, error } = await db.from('lookup_values').select('kategorie').order('kategorie');
  if (error) { showToast('Fehler beim Laden der Kategorien: ' + error.message, true); return []; }
  return [...new Set((data || []).map(r => r.kategorie))];
}

async function loadLookupsPage() {
  const kategorien = await loadLookupKategorien();
  const select = document.getElementById('lookup-filter-kategorie');

  if (kategorien.length === 0) {
    select.innerHTML = '<option value="">— Keine Kategorien vorhanden —</option>';
  } else {
    const previous = select.value;
    select.innerHTML = kategorien.map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
    if (kategorien.includes(previous)) select.value = previous;
  }
  await loadLookups();
}

async function loadLookups() {
  const tbody = document.getElementById('lookups-table-body');
  const kategorie = document.getElementById('lookup-filter-kategorie').value;

  tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Lade ...</div></td></tr>';
  if (!kategorie) { tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Keine Kategorie ausgewählt.</div></td></tr>'; return; }

  const { data, error } = await db.from('lookup_values').select('*').eq('kategorie', kategorie).order('reihenfolge').order('wert');

  if (error) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Noch keine Einträge in dieser Kategorie.</div></td></tr>'; return; }

  tbody.innerHTML = data.map(lv => {
    const aktivBg  = lv.ist_aktiv ? '#f0fdf4' : '#f3f4f6';
    const aktivCol = lv.ist_aktiv ? '#16a34a' : '#6b7280';
    const aktivTxt = lv.ist_aktiv ? 'Aktiv' : 'Archiviert';
    return `
      <tr>
        <td style="font-weight:500">${esc(lv.wert)}</td>
        <td>
          <span class="color-dot" style="background:${esc(lv.farbe || '#6b7280')}"></span>
          <span style="font-family:'SF Mono',Menlo,monospace;font-size:12px;color:var(--muted)">${esc(lv.farbe || '#6b7280')}</span>
        </td>
        <td style="color:var(--muted)">${esc(String(lv.reihenfolge ?? 0))}</td>
        <td><span class="badge" style="background:${aktivBg};color:${aktivCol}">${aktivTxt}</span></td>
        <td style="text-align:right"><button class="btn btn-sm" onclick="openLookupModal('edit', '${esc(lv.id)}')">Bearbeiten</button></td>
      </tr>`;
  }).join('');
}

async function openLookupModal(mode, lookupId = null) {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Aktion.', true); return; }
  editingLookupId = lookupId;

  const kategorien = await loadLookupKategorien();
  const kSelect = document.getElementById('l-kategorie');
  let options = kategorien.map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
  options += '<option value="__new__">+ Neue Kategorie anlegen …</option>';
  kSelect.innerHTML = options;

  document.getElementById('l-new-kategorie-group').style.display = 'none';
  document.getElementById('l-new-kategorie').value = '';

  kSelect.onchange = () => {
    const isNew = kSelect.value === '__new__';
    document.getElementById('l-new-kategorie-group').style.display = isNew ? '' : 'none';
  };

  document.getElementById('l-wert').value = '';
  document.getElementById('l-farbe').value = '#6b7280';
  document.getElementById('l-reihenfolge').value = '0';
  document.getElementById('l-aktiv').value = 'true';

  if (mode === 'new') {
    document.getElementById('modal-lookup-title').textContent = 'Neuer Wert';
    document.getElementById('l-save-btn').textContent = 'Anlegen';
    document.getElementById('l-delete-btn').style.display = 'none';
    const filterKat = document.getElementById('lookup-filter-kategorie').value;
    if (filterKat && kategorien.includes(filterKat)) kSelect.value = filterKat;
  } else {
    document.getElementById('modal-lookup-title').textContent = 'Wert bearbeiten';
    document.getElementById('l-save-btn').textContent = 'Speichern';
    document.getElementById('l-delete-btn').style.display = 'block';

    const { data, error } = await db.from('lookup_values').select('*').eq('id', lookupId).single();
    if (error || !data) { showToast('Wert konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingLookupId = null; return; }

    kSelect.value = data.kategorie;
    document.getElementById('l-wert').value = data.wert || '';
    document.getElementById('l-farbe').value = data.farbe || '#6b7280';
    document.getElementById('l-reihenfolge').value = data.reihenfolge ?? 0;
    document.getElementById('l-aktiv').value = data.ist_aktiv ? 'true' : 'false';
  }

  document.getElementById('modal-lookup').classList.add('open');
  setTimeout(() => document.getElementById('l-wert').focus(), 100);
}

function closeLookupModal() { document.getElementById('modal-lookup').classList.remove('open'); editingLookupId = null; }

async function saveLookup() {
  const kSelect     = document.getElementById('l-kategorie');
  const isNew       = kSelect.value === '__new__';
  const kategorie   = isNew ? document.getElementById('l-new-kategorie').value.trim() : kSelect.value;
  const wert        = document.getElementById('l-wert').value.trim();
  const farbe       = document.getElementById('l-farbe').value;
  const reihenRaw   = document.getElementById('l-reihenfolge').value;
  const ist_aktiv   = document.getElementById('l-aktiv').value === 'true';
  const btn         = document.getElementById('l-save-btn');

  if (!kategorie) { showToast('Bitte Kategorie auswählen oder neue eingeben.', true); return; }
  if (isNew && !/^[a-z0-9_]+$/.test(kategorie)) { showToast('Kategorie-Schlüssel: nur Kleinbuchstaben, Zahlen und Unterstriche.', true); return; }
  if (!wert) { showToast('Bitte Wert eingeben.', true); return; }

  const reihenfolge = reihenRaw === '' ? 0 : parseInt(reihenRaw, 10);
  if (Number.isNaN(reihenfolge)) { showToast('Reihenfolge muss eine Zahl sein.', true); return; }

  btn.disabled = true;
  btn.textContent = editingLookupId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = { kategorie, wert, farbe, reihenfolge, ist_aktiv };
    let error;
    if (editingLookupId) { ({ error } = await db.from('lookup_values').update(payload).eq('id', editingLookupId)); }
    else { ({ error } = await db.from('lookup_values').insert(payload)); }
    if (error) throw new Error(error.message);

    closeLookupModal();
    showToast(editingLookupId ? 'Wert aktualisiert.' : 'Wert angelegt.');
    await loadLookupsPage();
    const filterSelect = document.getElementById('lookup-filter-kategorie');
    if ([...filterSelect.options].some(o => o.value === kategorie)) { filterSelect.value = kategorie; await loadLookups(); }
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingLookupId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteLookup() {
  if (!editingLookupId) return;
  if (!confirm('Wert wirklich löschen?\n\nFalls dieser Wert bereits an anderen Stellen referenziert wird, wird das Löschen vom System verhindert. In dem Fall bitte stattdessen archivieren.')) return;

  const btn = document.getElementById('l-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    const { error } = await db.from('lookup_values').delete().eq('id', editingLookupId);
    if (error) {
      if (error.message.toLowerCase().includes('foreign key') || error.code === '23503') {
        throw new Error('Dieser Wert wird noch an anderer Stelle verwendet. Archiviere ihn stattdessen.');
      }
      throw new Error(error.message);
    }
    closeLookupModal();
    showToast('Wert gelöscht.');
    await loadLookupsPage();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}

// ═══════════════════════════════════════════════════════════
//  FIRMEN (COMPANIES)
// ═══════════════════════════════════════════════════════════

async function loadUnternehmensTypen() {
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe').eq('kategorie', 'unternehmens_typ').eq('ist_aktiv', true).order('reihenfolge');
  if (error) { showToast('Fehler beim Laden der Firmentypen: ' + error.message, true); return []; }
  return data || [];
}

async function loadCompanies() {
  const tbody = document.getElementById('companies-table-body');
  tbody.innerHTML = '<tr><td colspan="7"><div class="empty">Lade Firmen ...</div></td></tr>';

  const typSelect = document.getElementById('companies-typ-filter');
  if (typSelect.options.length <= 1) {
    const typen = await loadUnternehmensTypen();
    typSelect.innerHTML = '<option value="">Alle Typen</option>'
      + typen.map(t => `<option value="${esc(t.id)}">${esc(t.wert)}</option>`).join('');
  }

  const { data, error } = await db.from('companies')
    .select('*, typ:lookup_values!companies_typ_id_fkey(id, wert, farbe)').order('name');

  if (error) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }

  companiesCache = data || [];
  filterCompanies();
}

function filterCompanies() {
  const searchTerm = document.getElementById('companies-search').value.trim().toLowerCase();
  const typFilter  = document.getElementById('companies-typ-filter').value;

  let filtered = companiesCache;
  if (typFilter) filtered = filtered.filter(c => c.typ_id === typFilter);
  if (searchTerm) {
    filtered = filtered.filter(c => {
      const haystack = [c.name, c.stadt, c.plz, c.email, c.telefon, c.branche, c.strasse, c.website]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }
  renderCompaniesTable(filtered);
}

function renderCompaniesTable(companies) {
  const tbody = document.getElementById('companies-table-body');
  const countEl = document.getElementById('companies-count');

  const total = companiesCache.length;
  const shown = companies.length;
  countEl.textContent = (shown === total)
    ? `${total} Firma${total === 1 ? '' : 'n'}`
    : `${shown} von ${total} Firmen`;

  if (shown === 0) {
    const msg = total === 0
      ? 'Noch keine Firmen angelegt. Klicke oben auf „+ Neue Firma".'
      : 'Keine Firmen entsprechen den Filterkriterien.';
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty">${msg}</div></td></tr>`;
    return;
  }

  tbody.innerHTML = companies.map(c => {
    const typFarbe = c.typ?.farbe || '#6b7280';
    const typWert  = c.typ?.wert || '—';
    const ort = [c.plz, c.stadt].filter(Boolean).join(' ');

    return `
      <tr>
        <td>
          <div class="cell-link" onclick="navigateTo('firma', '${esc(c.id)}')">${esc(c.name)}</div>
          ${c.website ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(c.website)}</div>` : ''}
        </td>
        <td>
          <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
        </td>
        <td class="col-tablet" style="color:var(--muted)">${esc(ort || '—')}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(c.telefon || '—')}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(c.email || '—')}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(c.branche || '—')}</td>
        <td style="text-align:right">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn-copy" onclick="copyCompanyById('${esc(c.id)}')" title="Firmendaten kopieren" aria-label="Firmendaten kopieren">
              ${COPY_ICON_SVG}
            </button>
            <button class="btn btn-sm" onclick="navigateTo('firma', '${esc(c.id)}')">Details</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

async function openCompanyModal(mode, companyId = null) {
  editingCompanyId = companyId;

  const typSelect = document.getElementById('c-typ');
  const typen = await loadUnternehmensTypen();
  if (typen.length === 0) {
    typSelect.innerHTML = '<option value="">Keine Typen – bitte erst unter „Stammdaten" anlegen</option>';
  } else {
    typSelect.innerHTML = typen.map(t => `<option value="${esc(t.id)}">${esc(t.wert)}</option>`).join('');
  }

  document.getElementById('c-name').value = '';
  document.getElementById('c-branche').value = '';
  document.getElementById('c-strasse').value = '';
  document.getElementById('c-plz').value = '';
  document.getElementById('c-stadt').value = '';
  document.getElementById('c-land').value = 'Deutschland';
  document.getElementById('c-telefon').value = '';
  document.getElementById('c-email').value = '';
  document.getElementById('c-website').value = '';
  document.getElementById('c-notizen').value = '';

  if (mode === 'new') {
    document.getElementById('modal-company-title').textContent = 'Neue Firma';
    document.getElementById('c-save-btn').textContent = 'Anlegen';
    document.getElementById('c-delete-btn').style.display = 'none';
  } else {
    document.getElementById('modal-company-title').textContent = 'Firma bearbeiten';
    document.getElementById('c-save-btn').textContent = 'Speichern';
    document.getElementById('c-delete-btn').style.display = 'block';

    const { data, error } = await db.from('companies').select('*').eq('id', companyId).single();
    if (error || !data) { showToast('Firma konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingCompanyId = null; return; }

    document.getElementById('c-name').value = data.name || '';
    document.getElementById('c-branche').value = data.branche || '';
    document.getElementById('c-strasse').value = data.strasse || '';
    document.getElementById('c-plz').value = data.plz || '';
    document.getElementById('c-stadt').value = data.stadt || '';
    document.getElementById('c-land').value = data.land || 'Deutschland';
    document.getElementById('c-telefon').value = data.telefon || '';
    document.getElementById('c-email').value = data.email || '';
    document.getElementById('c-website').value = data.website || '';
    document.getElementById('c-notizen').value = data.notizen || '';
    if (data.typ_id) typSelect.value = data.typ_id;
  }

  document.getElementById('modal-company').classList.add('open');
  setTimeout(() => document.getElementById('c-name').focus(), 100);
}

function closeCompanyModal() { document.getElementById('modal-company').classList.remove('open'); editingCompanyId = null; }

async function saveCompany() {
  const name     = document.getElementById('c-name').value.trim();
  const typ_id   = document.getElementById('c-typ').value;
  const branche  = document.getElementById('c-branche').value.trim();
  const strasse  = document.getElementById('c-strasse').value.trim();
  const plz      = document.getElementById('c-plz').value.trim();
  const stadt    = document.getElementById('c-stadt').value.trim();
  const land     = document.getElementById('c-land').value.trim();
  const telefon  = document.getElementById('c-telefon').value.trim();
  const email    = document.getElementById('c-email').value.trim();
  const website  = document.getElementById('c-website').value.trim();
  const notizen  = document.getElementById('c-notizen').value.trim();
  const btn      = document.getElementById('c-save-btn');

  if (!name) { showToast('Bitte Name eingeben.', true); return; }
  if (!typ_id) { showToast('Bitte Typ auswählen.', true); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('E-Mail-Adresse sieht nicht korrekt aus.', true);
    return;
  }

  btn.disabled = true;
  btn.textContent = editingCompanyId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      name, typ_id,
      branche: branche || null, strasse: strasse || null, plz: plz || null,
      stadt: stadt || null, land: land || 'Deutschland',
      telefon: telefon || null, email: email || null,
      website: website || null, notizen: notizen || null
    };
    if (!editingCompanyId) payload.erstellt_von = currentUser?.id || null;

    const savedId = editingCompanyId;

    let error;
    if (editingCompanyId) { ({ error } = await db.from('companies').update(payload).eq('id', editingCompanyId)); }
    else { ({ error } = await db.from('companies').insert(payload)); }
    if (error) throw new Error(error.message);

    closeCompanyModal();
    showToast(savedId ? 'Firma aktualisiert.' : 'Firma angelegt.');

    if (savedId && currentCompanyDetailId === savedId) {
      await loadCompanyDetail(savedId);
    } else {
      await loadCompanies();
    }
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingCompanyId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteCompany() {
  if (!editingCompanyId) return;
  if (!confirm('Firma wirklich löschen?\n\nHinweis: Wenn bereits Kontakte, Projekte oder Einsätze mit dieser Firma verknüpft sind, wird das Löschen vom System verhindert.')) return;

  const btn = document.getElementById('c-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    const deletedId = editingCompanyId;
    const { error } = await db.from('companies').delete().eq('id', deletedId);
    if (error) {
      if (error.message.toLowerCase().includes('foreign key') || error.code === '23503') {
        throw new Error('Diese Firma hat noch verknüpfte Kontakte, Projekte oder Einsätze. Diese müssen zuerst entfernt werden.');
      }
      throw new Error(error.message);
    }
    closeCompanyModal();
    showToast('Firma gelöscht.');

    if (currentCompanyDetailId === deletedId) {
      currentCompanyDetailId = null;
      navigateTo('companies');
    } else {
      await loadCompanies();
    }
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}

// ═══════════════════════════════════════════════════════════
//  FIRMEN-DETAILSEITE
// ═══════════════════════════════════════════════════════════

async function loadCompanyDetail(companyId) {
  currentCompanyDetailId = companyId;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item:not(.nav-item-group)').forEach(b => b.classList.remove('active'));
  document.getElementById('page-company-detail').classList.add('active');
  document.getElementById('nav-companies')?.classList.add('active');
  setMobileNav('company-detail');

  document.getElementById('company-detail-name').textContent = 'Wird geladen …';
  document.getElementById('company-detail-title').textContent = 'Wird geladen …';
  document.getElementById('company-detail-subline').innerHTML = '';
  document.getElementById('company-detail-info').innerHTML = '';
  document.getElementById('company-detail-notizen-wrap').style.display = 'none';
  document.getElementById('company-contacts-body').innerHTML =
    '<tr><td colspan="5"><div class="empty">Lade Kontakte ...</div></td></tr>';

  const { data: company, error } = await db.from('companies')
    .select('*, typ:lookup_values!companies_typ_id_fkey(id, wert, farbe)')
    .eq('id', companyId).single();

  if (error || !company) {
    document.getElementById('company-detail-name').textContent = 'Firma nicht gefunden';
    document.getElementById('company-detail-title').textContent = 'Firma nicht gefunden';
    document.getElementById('company-detail-info').innerHTML = `
      <div class="detail-field full">
        <div class="detail-value detail-value-muted">
          Diese Firma existiert nicht mehr oder du hast keinen Zugriff darauf.
        </div>
      </div>`;
    document.getElementById('company-contacts-body').innerHTML =
      '<tr><td colspan="5"><div class="empty">—</div></td></tr>';
    document.getElementById('company-detail-edit-btn').onclick = () => navigateTo('companies');
    document.getElementById('company-detail-edit-btn').textContent = 'Zurück';
    document.getElementById('company-detail-copy-btn').style.display = 'none';
    document.getElementById('company-detail-add-contact-btn').style.display = 'none';
    return;
  }

  renderCompanyDetail(company);
  await loadCompanyContacts(companyId);
}

function renderCompanyDetail(c) {
  document.getElementById('company-detail-name').textContent = c.name;
  document.getElementById('company-detail-title').textContent = c.name;
  document.title = c.name + ' – Cumart CRM';

  const typFarbe = c.typ?.farbe || '#6b7280';
  const typWert  = c.typ?.wert || '—';
  let subline = `<span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>`;
  if (c.branche) subline += `<span>${esc(c.branche)}</span>`;
  document.getElementById('company-detail-subline').innerHTML = subline;

  const copyBtn = document.getElementById('company-detail-copy-btn');
  copyBtn.style.display = '';
  copyBtn.onclick = () => copyCompanyById(c.id);

  document.getElementById('company-detail-edit-btn').textContent = 'Bearbeiten';
  document.getElementById('company-detail-edit-btn').onclick = () => openCompanyModal('edit', c.id);

  const adresseZeilen = [];
  if (c.strasse) adresseZeilen.push(esc(c.strasse));
  const ort = [c.plz, c.stadt].filter(Boolean).join(' ');
  if (ort) adresseZeilen.push(esc(ort));
  if (c.land && c.land !== 'Deutschland') adresseZeilen.push(esc(c.land));
  const adresseHtml = adresseZeilen.length ? adresseZeilen.join('<br>') : '<span class="detail-value-muted">—</span>';

  const telefonHtml = c.telefon
    ? `<a href="tel:${esc(c.telefon)}">${esc(c.telefon)}</a>`
    : '<span class="detail-value-muted">—</span>';
  const emailHtml = c.email
    ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`
    : '<span class="detail-value-muted">—</span>';
  const websiteHtml = c.website
    ? `<a href="${esc(c.website.startsWith('http') ? c.website : 'https://' + c.website)}" target="_blank" rel="noopener">${esc(c.website)}</a>`
    : '<span class="detail-value-muted">—</span>';

  document.getElementById('company-detail-info').innerHTML = `
    <div class="detail-field">
      <div class="detail-label">Adresse</div>
      <div class="detail-value">${adresseHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Branche</div>
      <div class="detail-value">${c.branche ? esc(c.branche) : '<span class="detail-value-muted">—</span>'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Telefon</div>
      <div class="detail-value">${telefonHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">E-Mail</div>
      <div class="detail-value">${emailHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Website</div>
      <div class="detail-value">${websiteHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Typ</div>
      <div class="detail-value">
        <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
      </div>
    </div>
  `;

  const notizenWrap = document.getElementById('company-detail-notizen-wrap');
  if (c.notizen && c.notizen.trim()) {
    document.getElementById('company-detail-notizen').textContent = c.notizen;
    notizenWrap.style.display = '';
  } else {
    notizenWrap.style.display = 'none';
  }

  document.getElementById('company-detail-add-contact-btn').style.display = '';
  document.getElementById('company-detail-add-contact-btn').onclick = () => {
    contactModalPrefillCompanyId = c.id;
    openContactModal('new');
  };
}

async function loadCompanyContacts(companyId) {
  const tbody = document.getElementById('company-contacts-body');
  const countEl = document.getElementById('company-contacts-count');

  const { data, error } = await db.from('contacts').select('*').eq('company_id', companyId).order('nachname');

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Kontakte';
    return;
  }

  const list = data || [];
  countEl.textContent = list.length === 1 ? '1 Kontakt' : `${list.length} Kontakte`;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Noch keine Kontakte für diese Firma. Klicke oben auf „+ Kontakt hinzufügen".</div></td></tr>';
    return;
  }

  tbody.innerHTML = list.map(k => {
    const fullName = [k.vorname, k.nachname].filter(Boolean).join(' ');
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${esc(ini(fullName))}</div>
            <div class="cell-link" onclick="openContactModal('edit', '${esc(k.id)}')" style="font-weight:500">${esc(fullName)}</div>
          </div>
        </td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.position || '—')}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.telefon || '—')}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(k.email || '—')}</td>
        <td style="text-align:right">
          <button class="btn btn-sm" onclick="openContactModal('edit', '${esc(k.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  KONTAKTE
// ═══════════════════════════════════════════════════════════

async function getCompaniesForDropdown() {
  if (companiesCache.length > 0) return companiesCache;
  const { data } = await db.from('companies').select('id, name').order('name');
  return data || [];
}

async function loadContacts() {
  const tbody = document.getElementById('contacts-table-body');
  tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade Kontakte ...</div></td></tr>';

  const companyFilter = document.getElementById('contacts-company-filter');
  if (companyFilter.options.length <= 2) {
    const companies = await getCompaniesForDropdown();
    const baseOpts = '<option value="">Alle Firmen</option><option value="__none__">Ohne Firmenzuordnung</option>';
    companyFilter.innerHTML = baseOpts
      + companies.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  }

  const { data, error } = await db.from('contacts')
    .select('*, company:companies(id, name, strasse, plz, stadt)').order('nachname');

  if (error) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }

  contactsCache = data || [];
  filterContacts();
}

function filterContacts() {
  const searchTerm    = document.getElementById('contacts-search').value.trim().toLowerCase();
  const companyFilter = document.getElementById('contacts-company-filter').value;

  let filtered = contactsCache;
  if (companyFilter === '__none__') {
    filtered = filtered.filter(k => !k.company_id);
  } else if (companyFilter) {
    filtered = filtered.filter(k => k.company_id === companyFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter(k => {
      const haystack = [k.vorname, k.nachname, k.email, k.telefon, k.position, k.company?.name]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  renderContactsTable(filtered);
}

function renderContactsTable(contacts) {
  const tbody = document.getElementById('contacts-table-body');
  const countEl = document.getElementById('contacts-count');

  const total = contactsCache.length;
  const shown = contacts.length;
  countEl.textContent = (shown === total)
    ? `${total} Kontakt${total === 1 ? '' : 'e'}`
    : `${shown} von ${total} Kontakten`;

  if (shown === 0) {
    const msg = total === 0
      ? 'Noch keine Kontakte angelegt. Klicke oben auf „+ Neuer Kontakt".'
      : 'Keine Kontakte entsprechen den Filterkriterien.';
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">${msg}</div></td></tr>`;
    return;
  }

  tbody.innerHTML = contacts.map(k => {
    const fullName = [k.vorname, k.nachname].filter(Boolean).join(' ');
    const firmaCell = k.company?.name
      ? `<span class="cell-link" onclick="navigateTo('firma', '${esc(k.company.id)}')">${esc(k.company.name)}</span>`
      : `<span style="color:var(--muted);font-style:italic">ohne Firma</span>`;

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${esc(ini(fullName))}</div>
            <div style="font-weight:500">${esc(fullName)}</div>
          </div>
        </td>
        <td>${firmaCell}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.position || '—')}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.telefon || '—')}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(k.email || '—')}</td>
        <td style="text-align:right">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn-copy" onclick="copyContactById('${esc(k.id)}')" title="Kontaktdaten kopieren" aria-label="Kontaktdaten kopieren">
              ${COPY_ICON_SVG}
            </button>
            <button class="btn btn-sm" onclick="openContactModal('edit', '${esc(k.id)}')">Bearbeiten</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

async function openContactModal(mode, contactId = null) {
  editingContactId = contactId;

  const companySelect = document.getElementById('k-company');
  const companies = await getCompaniesForDropdown();
  companySelect.innerHTML = '<option value="">— Keine Firma —</option>'
    + companies.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

  document.getElementById('k-vorname').value = '';
  document.getElementById('k-nachname').value = '';
  document.getElementById('k-position').value = '';
  document.getElementById('k-telefon').value = '';
  document.getElementById('k-email').value = '';
  document.getElementById('k-notizen').value = '';
  companySelect.value = '';

  if (mode === 'new') {
    document.getElementById('modal-contact-title').textContent = 'Neuer Kontakt';
    document.getElementById('k-save-btn').textContent = 'Anlegen';
    document.getElementById('k-delete-btn').style.display = 'none';

    if (contactModalPrefillCompanyId) {
      companySelect.value = contactModalPrefillCompanyId;
      contactModalPrefillCompanyId = null;
    } else {
      const filterSel = document.getElementById('contacts-company-filter');
      const preselected = filterSel ? filterSel.value : '';
      if (preselected && preselected !== '__none__') {
        companySelect.value = preselected;
      }
    }
  } else {
    document.getElementById('modal-contact-title').textContent = 'Kontakt bearbeiten';
    document.getElementById('k-save-btn').textContent = 'Speichern';
    document.getElementById('k-delete-btn').style.display = 'block';

    const { data, error } = await db.from('contacts').select('*').eq('id', contactId).single();
    if (error || !data) { showToast('Kontakt konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingContactId = null; return; }

    document.getElementById('k-vorname').value = data.vorname || '';
    document.getElementById('k-nachname').value = data.nachname || '';
    document.getElementById('k-position').value = data.position || '';
    document.getElementById('k-telefon').value = data.telefon || '';
    document.getElementById('k-email').value = data.email || '';
    document.getElementById('k-notizen').value = data.notizen || '';
    if (data.company_id) companySelect.value = data.company_id;
  }

  document.getElementById('modal-contact').classList.add('open');
  setTimeout(() => document.getElementById('k-vorname').focus(), 100);
}

function closeContactModal() { document.getElementById('modal-contact').classList.remove('open'); editingContactId = null; }

async function saveContact() {
  const vorname    = document.getElementById('k-vorname').value.trim();
  const nachname   = document.getElementById('k-nachname').value.trim();
  const position   = document.getElementById('k-position').value.trim();
  const company_id = document.getElementById('k-company').value;
  const telefon    = document.getElementById('k-telefon').value.trim();
  const email      = document.getElementById('k-email').value.trim();
  const notizen    = document.getElementById('k-notizen').value.trim();
  const btn        = document.getElementById('k-save-btn');

  if (!vorname) { showToast('Bitte Vorname eingeben.', true); return; }
  if (!nachname) { showToast('Bitte Nachname eingeben.', true); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('E-Mail-Adresse sieht nicht korrekt aus.', true);
    return;
  }

  btn.disabled = true;
  btn.textContent = editingContactId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      vorname, nachname,
      position: position || null, company_id: company_id || null,
      telefon: telefon || null, email: email || null, notizen: notizen || null
    };
    if (!editingContactId) payload.erstellt_von = currentUser?.id || null;

    let error;
    if (editingContactId) { ({ error } = await db.from('contacts').update(payload).eq('id', editingContactId)); }
    else { ({ error } = await db.from('contacts').insert(payload)); }
    if (error) throw new Error(error.message);

    closeContactModal();
    showToast(editingContactId ? 'Kontakt aktualisiert.' : 'Kontakt angelegt.');

    if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
      await loadCompanyContacts(currentCompanyDetailId);
    } else {
      await loadContacts();
    }
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingContactId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteContact() {
  if (!editingContactId) return;
  if (!confirm('Kontakt wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.')) return;

  const btn = document.getElementById('k-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    const { error } = await db.from('contacts').delete().eq('id', editingContactId);
    if (error) {
      if (error.message.toLowerCase().includes('foreign key') || error.code === '23503') {
        throw new Error('Dieser Kontakt ist noch an anderer Stelle verknüpft (z. B. als Hauptkontakt eines Projekts). Die Verknüpfung muss zuerst entfernt werden.');
      }
      throw new Error(error.message);
    }
    closeContactModal();
    showToast('Kontakt gelöscht.');

    if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
      await loadCompanyContacts(currentCompanyDetailId);
    } else {
      await loadContacts();
    }
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}

// ═══════════════════════════════════════════════════════════
//  TERMINE (APPOINTMENTS)
// ═══════════════════════════════════════════════════════════

/** Lädt die 4 Termin-Typen aus lookup_values in den Cache */
async function loadTerminTypen() {
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe')
    .eq('kategorie', 'termin_typ').eq('ist_aktiv', true)
    .order('reihenfolge');
  if (error) { showToast('Fehler beim Laden der Termintypen: ' + error.message, true); return []; }
  terminTypenCache = data || [];
  return terminTypenCache;
}

async function loadAppointments() {
  const tbody = document.getElementById('appointments-table-body');
  tbody.innerHTML = '<tr><td colspan="8"><div class="empty">Lade Termine ...</div></td></tr>';

  // Termin-Typen und Filter-Dropdown initialisieren (einmalig)
  if (terminTypenCache.length === 0) await loadTerminTypen();
  const typFilter = document.getElementById('appointments-typ-filter');
  if (typFilter.options.length <= 1) {
    typFilter.innerHTML = '<option value="">Alle Typen</option>'
      + terminTypenCache.map(t => `<option value="${esc(t.id)}">${esc(t.wert)}</option>`).join('');
  }

  // Companies-Cache ggf. befüllen (für Firmenname in Liste)
  if (companiesCache.length === 0) {
    const { data: c } = await db.from('companies').select('*, typ:lookup_values!companies_typ_id_fkey(id, wert, farbe)').order('name');
    companiesCache = c || [];
  }

  const { data, error } = await db.from('appointments')
    .select(`*,
      typ:lookup_values!appointments_typ_id_fkey(id, wert, farbe),
      company:companies(id, name, strasse, plz, stadt),
      contact:contacts(id, vorname, nachname, company_id)`)
    .order('datum', { ascending: false })
    .order('uhrzeit_von', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    return;
  }

  appointmentsCache = data || [];
  filterAppointments();
}

function filterAppointments() {
  const searchTerm   = document.getElementById('appointments-search').value.trim().toLowerCase();
  const rangeFilter  = document.getElementById('appointments-range-filter').value;
  const statusFilter = document.getElementById('appointments-status-filter').value;
  const typFilter    = document.getElementById('appointments-typ-filter').value;

  // Zeitbezogene Filter basierend auf today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  let filtered = appointmentsCache;

  // Range-Filter
  if (rangeFilter === 'upcoming') {
    filtered = filtered.filter(a => a.datum >= todayISO);
  } else if (rangeFilter === 'today') {
    filtered = filtered.filter(a => a.datum === todayISO);
  } else if (rangeFilter === 'week') {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndISO = toISODate(weekEnd);
    filtered = filtered.filter(a => a.datum >= todayISO && a.datum <= weekEndISO);
  } else if (rangeFilter === 'month') {
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const monthEndISO = toISODate(monthEnd);
    filtered = filtered.filter(a => a.datum >= todayISO && a.datum <= monthEndISO);
  } else if (rangeFilter === 'past') {
    filtered = filtered.filter(a => a.datum < todayISO);
  }
  // 'all' → kein Filter

  // Status-Filter
  if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);

  // Typ-Filter
  if (typFilter) filtered = filtered.filter(a => a.typ_id === typFilter);

  // Such-Filter
  if (searchTerm) {
    filtered = filtered.filter(a => {
      const haystack = [
        a.titel,
        a.ort,
        a.notizen,
        a.company?.name,
        a.contact ? [a.contact.vorname, a.contact.nachname].filter(Boolean).join(' ') : ''
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  // Sortierung nach Range:
  // - 'upcoming', 'today', 'week', 'month': aufsteigend (früheste zuerst)
  // - 'past', 'all': absteigend (neueste zuerst) — bereits in loadAppointments so
  if (['upcoming', 'today', 'week', 'month'].includes(rangeFilter)) {
    filtered = [...filtered].sort((a, b) => {
      if (a.datum !== b.datum) return a.datum.localeCompare(b.datum);
      return (a.uhrzeit_von || '').localeCompare(b.uhrzeit_von || '');
    });
  }

  renderAppointmentsTable(filtered);
}

function renderAppointmentsTable(appointments) {
  const tbody = document.getElementById('appointments-table-body');
  const countEl = document.getElementById('appointments-count');

  const total = appointmentsCache.length;
  const shown = appointments.length;
  countEl.textContent = (shown === total)
    ? `${total} Termin${total === 1 ? '' : 'e'}`
    : `${shown} von ${total} Terminen`;

  if (shown === 0) {
    const msg = total === 0
      ? 'Noch keine Termine angelegt. Klicke oben auf „+ Neuer Termin".'
      : 'Keine Termine entsprechen den Filterkriterien.';
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty">${msg}</div></td></tr>`;
    return;
  }

  const todayISO = toISODate(new Date());

  tbody.innerHTML = appointments.map(a => {
    const isPast = a.datum < todayISO;
    const typFarbe = a.typ?.farbe || '#6b7280';
    const typWert  = a.typ?.wert || '—';
    const uhrzeit = a.uhrzeit_von
      ? (a.uhrzeit_bis ? `${formatTime(a.uhrzeit_von)}–${formatTime(a.uhrzeit_bis)}` : formatTime(a.uhrzeit_von))
      : '—';
    const firma = a.company?.name
      ? `<span class="cell-link" onclick="navigateTo('firma', '${esc(a.company.id)}')">${esc(a.company.name)}</span>`
      : '<span style="color:var(--muted);font-style:italic">—</span>';

    return `
      <tr>
        <td>
          <div class="date-cell ${isPast ? 'past' : ''}">${esc(formatDateDE(a.datum))}</div>
        </td>
        <td class="col-tablet" style="color:var(--muted);white-space:nowrap">${esc(uhrzeit)}</td>
        <td>
          <div class="cell-link" onclick="openAppointmentModal('edit', '${esc(a.id)}')" style="font-weight:500">${esc(a.titel)}</div>
          ${a.notizen ? `<div style="font-size:11px;color:var(--muted);margin-top:2px;max-width:320px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(a.notizen)}</div>` : ''}
        </td>
        <td class="col-tablet">
          <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
        </td>
        <td class="col-desktop">${firma}</td>
        <td class="col-desktop" style="color:var(--muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${esc(a.ort || '')}">${esc(a.ort || '—')}</td>
        <td>
          <span class="badge" style="background:${appointmentStatusBg(a.status)};color:${appointmentStatusColor(a.status)}">${esc(appointmentStatusLabel(a.status))}</span>
        </td>
        <td style="text-align:right">
          <button class="btn btn-sm" onclick="openAppointmentModal('edit', '${esc(a.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');
}

async function openAppointmentModal(mode, appointmentId = null) {
  editingAppointmentId = appointmentId;
  lastAutoFilledOrt = '';

  // Typen laden und Select befüllen
  if (terminTypenCache.length === 0) await loadTerminTypen();
  const typSelect = document.getElementById('t-typ');
  typSelect.innerHTML = '<option value="">— Bitte wählen —</option>'
    + terminTypenCache.map(t => `<option value="${esc(t.id)}">${esc(t.wert)}</option>`).join('');

  // Companies laden
  const companies = await getCompaniesForDropdown();
  const companySelect = document.getElementById('t-company');
  companySelect.innerHTML = '<option value="">— Keine —</option>'
    + companies.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

  // Kontakte vorerst leer (wird dynamisch gefüllt wenn Firma gewählt)
  const contactSelect = document.getElementById('t-contact');
  contactSelect.innerHTML = '<option value="">— Kein Kontakt —</option>';

  // Felder zurücksetzen
  document.getElementById('t-titel').value = '';
  document.getElementById('t-datum').value = toISODate(new Date());
  document.getElementById('t-uhrzeit-von').value = '';
  document.getElementById('t-uhrzeit-bis').value = '';
  document.getElementById('t-status').value = 'geplant';
  document.getElementById('t-ort').value = '';
  document.getElementById('t-notizen').value = '';
  document.getElementById('t-ort-hint').style.display = 'none';

  if (mode === 'new') {
    document.getElementById('modal-appointment-title').textContent = 'Neuer Termin';
    document.getElementById('t-save-btn').textContent = 'Anlegen';
    document.getElementById('t-delete-btn').style.display = 'none';

    // Kontakte für leere Firma rebuilden (alle Kontakte)
    await rebuildContactDropdownForAppointment('');
  } else {
    document.getElementById('modal-appointment-title').textContent = 'Termin bearbeiten';
    document.getElementById('t-save-btn').textContent = 'Speichern';
    document.getElementById('t-delete-btn').style.display = 'block';

    const { data, error } = await db.from('appointments').select('*').eq('id', appointmentId).single();
    if (error || !data) {
      showToast('Termin konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true);
      editingAppointmentId = null;
      return;
    }

    document.getElementById('t-titel').value = data.titel || '';
    document.getElementById('t-datum').value = data.datum || toISODate(new Date());
    document.getElementById('t-uhrzeit-von').value = data.uhrzeit_von ? formatTime(data.uhrzeit_von) : '';
    document.getElementById('t-uhrzeit-bis').value = data.uhrzeit_bis ? formatTime(data.uhrzeit_bis) : '';
    document.getElementById('t-status').value = data.status || 'geplant';
    document.getElementById('t-ort').value = data.ort || '';
    document.getElementById('t-notizen').value = data.notizen || '';
    if (data.typ_id) typSelect.value = data.typ_id;
    if (data.company_id) companySelect.value = data.company_id;

    // Kontakt-Dropdown für die Firma rebuilden, dann Wert setzen
    await rebuildContactDropdownForAppointment(data.company_id || '');
    if (data.contact_id) contactSelect.value = data.contact_id;

    // Hinweis updaten
    updateOrtHint(data.company_id || '');
  }

  // Event-Handler einmalig binden
  setupAppointmentAutoFill();

  document.getElementById('modal-appointment').classList.add('open');
  setTimeout(() => document.getElementById('t-titel').focus(), 100);
}

function closeAppointmentModal() {
  document.getElementById('modal-appointment').classList.remove('open');
  editingAppointmentId = null;
  lastAutoFilledOrt = '';
}

/** Baut das Kontakt-Dropdown neu auf, gefiltert nach Firma */
async function rebuildContactDropdownForAppointment(companyId) {
  const select = document.getElementById('t-contact');
  const currentValue = select.value;

  // Contacts-Cache befüllen wenn nötig
  if (contactsCache.length === 0) {
    const { data } = await db.from('contacts')
      .select('*, company:companies(id, name, strasse, plz, stadt)').order('nachname');
    contactsCache = data || [];
  }

  let contacts = contactsCache;
  if (companyId) {
    contacts = contactsCache.filter(k => k.company_id === companyId);
  }

  select.innerHTML = '<option value="">— Kein Kontakt —</option>'
    + contacts.map(k => {
        const fullName = [k.vorname, k.nachname].filter(Boolean).join(' ');
        const suffix = (!companyId && k.company?.name) ? ` (${k.company.name})` : '';
        return `<option value="${esc(k.id)}">${esc(fullName + suffix)}</option>`;
      }).join('');

  // Alten Wert wiederherstellen, falls noch in Liste
  if (currentValue && [...select.options].some(o => o.value === currentValue)) {
    select.value = currentValue;
  } else {
    select.value = '';
  }
}

/** Aktualisiert den Ort-Hinweis basierend auf der gewählten Firma */
function updateOrtHint(companyId) {
  const hint = document.getElementById('t-ort-hint');
  if (!companyId) { hint.style.display = 'none'; return; }

  const company = companiesCache.find(c => c.id === companyId);
  if (!company) { hint.style.display = 'none'; return; }

  const addressParts = [];
  if (company.strasse) addressParts.push(company.strasse);
  const cityPart = [company.plz, company.stadt].filter(Boolean).join(' ').trim();
  if (cityPart) addressParts.push(cityPart);

  if (addressParts.length === 0) { hint.style.display = 'none'; return; }

  const address = addressParts.join(', ');
  hint.innerHTML = `📍 <strong>${esc(company.name)}</strong> sitzt in: ${esc(address)}`;
  hint.style.display = 'block';
  hint.dataset.address = address;
}

/** Wird von onclick=useCompanyAddressForOrt() aufgerufen: übernimmt Firma-Adresse ins Ort-Feld */
function useCompanyAddressForOrt() {
  const hint = document.getElementById('t-ort-hint');
  const addr = hint.dataset.address || '';
  if (!addr) return;
  document.getElementById('t-ort').value = addr;
  lastAutoFilledOrt = addr;
  showToast('Adresse übernommen.');
}

/** Auto-Fill Ort-Feld: wenn Typ=Vor Ort UND (Feld leer ODER enthält alten Auto-Wert) */
function autoFillOrtIfAppropriate() {
  const typId = document.getElementById('t-typ').value;
  const companyId = document.getElementById('t-company').value;
  if (!typId || !companyId) return;

  // Nur bei Typ = "Vor Ort"
  const typ = terminTypenCache.find(t => t.id === typId);
  if (!typ || typ.wert.toLowerCase() !== 'vor ort') return;

  const company = companiesCache.find(c => c.id === companyId);
  if (!company) return;

  const addressParts = [];
  if (company.strasse) addressParts.push(company.strasse);
  const cityPart = [company.plz, company.stadt].filter(Boolean).join(' ').trim();
  if (cityPart) addressParts.push(cityPart);
  if (addressParts.length === 0) return;

  const address = addressParts.join(', ');
  const ortInput = document.getElementById('t-ort');
  const currentOrt = ortInput.value.trim();

  // Auto-fillen wenn: Feld leer ODER Feld enthält exakt den letzten Auto-Wert (nicht manuell geändert)
  if (currentOrt === '' || currentOrt === lastAutoFilledOrt) {
    ortInput.value = address;
    lastAutoFilledOrt = address;
  }
}

/** Bindet alle Event-Handler für das Termin-Modal */
function setupAppointmentAutoFill() {
  const typSelect     = document.getElementById('t-typ');
  const companySelect = document.getElementById('t-company');
  const contactSelect = document.getElementById('t-contact');
  const ortInput      = document.getElementById('t-ort');

  // Event-Handler via onchange-Zuweisung (überschreibt vorherige — idempotent)
  typSelect.onchange = () => {
    autoFillOrtIfAppropriate();
  };

  companySelect.onchange = async () => {
    const companyId = companySelect.value;
    await rebuildContactDropdownForAppointment(companyId);
    updateOrtHint(companyId);
    autoFillOrtIfAppropriate();
  };

  contactSelect.onchange = () => {
    // Wenn keine Firma gewählt, aber Kontakt eine Firma hat → Firma auto-setzen
    const contactId = contactSelect.value;
    if (!contactId) return;
    if (companySelect.value) return; // Firma bereits gesetzt: nichts tun
    const contact = contactsCache.find(k => k.id === contactId);
    if (contact && contact.company_id) {
      companySelect.value = contact.company_id;
      updateOrtHint(contact.company_id);
      autoFillOrtIfAppropriate();
    }
  };

  // Manuelle Bearbeitung des Ort-Feldes: tracking zurücksetzen
  ortInput.oninput = () => {
    if (ortInput.value !== lastAutoFilledOrt) {
      lastAutoFilledOrt = '';
    }
  };
}

async function saveAppointment() {
  const titel       = document.getElementById('t-titel').value.trim();
  const datum       = document.getElementById('t-datum').value;
  const typ_id      = document.getElementById('t-typ').value;
  const uhrzeit_von = document.getElementById('t-uhrzeit-von').value;
  const uhrzeit_bis = document.getElementById('t-uhrzeit-bis').value;
  const status      = document.getElementById('t-status').value;
  const company_id  = document.getElementById('t-company').value;
  const contact_id  = document.getElementById('t-contact').value;
  const ort         = document.getElementById('t-ort').value.trim();
  const notizen     = document.getElementById('t-notizen').value.trim();
  const btn         = document.getElementById('t-save-btn');

  if (!titel) { showToast('Bitte Titel eingeben.', true); return; }
  if (!datum) { showToast('Bitte Datum eingeben.', true); return; }
  if (!typ_id) { showToast('Bitte Typ auswählen.', true); return; }
  if (!status) { showToast('Bitte Status auswählen.', true); return; }

  if (uhrzeit_von && uhrzeit_bis && uhrzeit_bis < uhrzeit_von) {
    showToast('„Uhrzeit bis" muss nach „Uhrzeit von" liegen.', true);
    return;
  }

  btn.disabled = true;
  btn.textContent = editingAppointmentId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      titel, datum, typ_id, status,
      uhrzeit_von: uhrzeit_von || null,
      uhrzeit_bis: uhrzeit_bis || null,
      company_id: company_id || null,
      contact_id: contact_id || null,
      ort: ort || null,
      notizen: notizen || null
    };
    if (!editingAppointmentId) payload.erstellt_von = currentUser?.id || null;

    let error;
    if (editingAppointmentId) { ({ error } = await db.from('appointments').update(payload).eq('id', editingAppointmentId)); }
    else { ({ error } = await db.from('appointments').insert(payload)); }
    if (error) throw new Error(error.message);

    closeAppointmentModal();
    showToast(editingAppointmentId ? 'Termin aktualisiert.' : 'Termin angelegt.');
    await loadAppointments();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingAppointmentId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteAppointment() {
  if (!editingAppointmentId) return;
  if (!confirm('Termin wirklich löschen?\n\nDiese Aktion kann nicht rückgängig gemacht werden.')) return;

  const btn = document.getElementById('t-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    const { error } = await db.from('appointments').delete().eq('id', editingAppointmentId);
    if (error) {
      if (error.message.toLowerCase().includes('foreign key') || error.code === '23503') {
        throw new Error('Dieser Termin hat noch verknüpfte Teilnehmer oder andere Abhängigkeiten.');
      }
      throw new Error(error.message);
    }
    closeAppointmentModal();
    showToast('Termin gelöscht.');
    await loadAppointments();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}

// ═══════════════════════════════════════════════════════════
//  INITIALISIERUNG
// ═══════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
