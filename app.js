/* ═══════════════════════════════════════════════════════════
   Cumart CRM – Application Script
   Version 1.4.0 (Services-Katalog + Lookup-Verwaltung)
   ═══════════════════════════════════════════════════════════ */

'use strict';

// ── KONFIGURATION ────────────────────────────────────────────
const SUPABASE_URL        = 'https://loohjeiysjxzbmfwkyvv.supabase.co';
const SUPABASE_ANON_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2hqZWl5c2p4emJtZndreXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjUwNzUsImV4cCI6MjA5MjAwMTA3NX0.L75kTzqx4hJY7buBFv9iMZ-mrQ3vdNqB-G50MPpRbNw';
const FUNCTIONS_URL       = SUPABASE_URL + '/functions/v1';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── APP STATE ────────────────────────────────────────────────
let currentUser       = null;
let currentProfile    = null;
let allRoles          = [];
let editingUserId     = null;
let editingServiceId  = null;
let editingLookupId   = null;
let inPasswordRecovery = false;

// ── HILFSFUNKTIONEN ──────────────────────────────────────────
function ini(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function statusLabel(s) {
  return { eingeladen: 'Eingeladen', aktiv: 'Aktiv', inaktiv: 'Inaktiv' }[s] || 'Unbekannt';
}
function statusBg(s) {
  return { eingeladen: '#fffbeb', aktiv: '#f0fdf4', inaktiv: '#fef2f2' }[s] || '#f3f4f6';
}
function statusColor(s) {
  return { eingeladen: '#d97706', aktiv: '#16a34a', inaktiv: '#dc2626' }[s] || '#6b7280';
}

function isAdmin() {
  return currentProfile?.roles?.name === 'Admin';
}

// Preis formatieren: 1200 -> "1.200,00 €"
function formatPreis(value) {
  if (value === null || value === undefined || value === '') return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return num.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// HTML-Escape für sicheres Einfügen von User-Eingaben
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

function showPage(name, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name)?.classList.add('active');
  el?.classList.add('active');

  // Seiten-spezifisches Laden anstoßen (idempotent)
  if (name === 'users') loadUsers();
  if (name === 'services') loadServices();
  if (name === 'lookups') loadLookupsPage();
}

// ── SCREEN-WECHSEL ───────────────────────────────────────────
function hideAllScreens() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('reset-screen').style.display = 'none';
  document.getElementById('recovery-screen').style.display = 'none';
  document.getElementById('mustchange-screen').style.display = 'none';
  document.getElementById('app').style.display = 'none';
}

function showLoginScreen() {
  hideAllScreens();
  document.getElementById('auth-screen').style.display = 'flex';
}

function showResetScreen() {
  hideAllScreens();
  document.getElementById('reset-screen').style.display = 'flex';
}

function showRecoveryScreen() {
  hideAllScreens();
  document.getElementById('recovery-screen').style.display = 'flex';
  setTimeout(() => document.getElementById('recovery-1').focus(), 100);
}

function showMustChangeScreen() {
  hideAllScreens();
  document.getElementById('mustchange-screen').style.display = 'flex';
  setTimeout(() => document.getElementById('mustchange-1').focus(), 100);
}

function showApp() {
  hideAllScreens();
  document.getElementById('app').style.display = 'flex';
}

// ── AUTH INIT ────────────────────────────────────────────────
async function initAuth() {
  const hash = window.location.hash;

  if (hash.includes('type=recovery') || hash.includes('type=invite')) {
    inPasswordRecovery = true;
    showRecoveryScreen();
    db.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        inPasswordRecovery = false;
        showLoginScreen();
      }
    });
    return;
  }

  try {
    const { data: { session } } = await db.auth.getSession();
    if (session) {
      await onLogin(session.user);
    } else {
      showLoginScreen();
    }
  } catch (e) {
    showLoginScreen();
  }

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
}

// ── LOGIN-FLOW ───────────────────────────────────────────────
async function onLogin(user) {
  currentUser = user;

  const { data: profile, error: profileError } = await db
    .from('user_profiles')
    .select('*, roles(id, name, rechte)')
    .eq('id', user.id)
    .single();

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
  applyAdminOnlyUI();
  showApp();

  // Startseite: Admin sieht Benutzer, Nicht-Admin sieht Leistungen
  if (isAdmin()) {
    showPage('users', document.getElementById('nav-users'));
  } else {
    showPage('services', document.getElementById('nav-services'));
  }

  await loadRoles();
}

// Blendet alle mit data-admin-only markierten Elemente je nach Rolle ein/aus
function applyAdminOnlyUI() {
  const admin = isAdmin();
  document.querySelectorAll('[data-admin-only="true"]').forEach(el => {
    el.style.display = admin ? '' : 'none';
  });
  // Zusätzlich: „+ Neuer Benutzer"- und „+ Neue Leistung"-Buttons
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
      error.message === 'Invalid login credentials'
        ? 'E-Mail oder Passwort falsch.'
        : error.message
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
  await db.auth.signOut();
  currentUser = null;
  currentProfile = null;
  inPasswordRecovery = false;
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

  const { error } = await db.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });

  btn.disabled = false;
  btn.textContent = 'Link senden';

  if (error) { errEl.textContent = error.message; errEl.classList.add('show'); }
  else { sucEl.style.display = 'block'; }
}

// ── PASSWORT-ÄNDERN-PFLICHT ──────────────────────────────────
async function doMustChangePassword() {
  const pw1 = document.getElementById('mustchange-1').value;
  const pw2 = document.getElementById('mustchange-2').value;
  const errEl = document.getElementById('mustchange-error');
  const btn = document.getElementById('mustchange-btn');

  errEl.classList.remove('show');

  if (pw1.length < 6) {
    errEl.textContent = 'Passwort muss mindestens 6 Zeichen haben.';
    errEl.classList.add('show');
    return;
  }
  if (pw1 !== pw2) {
    errEl.textContent = 'Passwörter stimmen nicht überein.';
    errEl.classList.add('show');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Wird gespeichert ...';

  try {
    const { error: pwError } = await db.auth.updateUser({ password: pw1 });
    if (pwError) throw new Error(pwError.message);

    const { error: flagError } = await db
      .from('user_profiles')
      .update({ muss_passwort_aendern: false })
      .eq('id', currentUser.id);

    if (flagError) throw new Error(flagError.message);

    const { data: profile, error: profileError } = await db
      .from('user_profiles')
      .select('*, roles(id, name, rechte)')
      .eq('id', currentUser.id)
      .single();

    if (profileError || !profile) throw new Error('Profil konnte nicht geladen werden.');

    currentProfile = profile;

    renderSidebar();
    applyAdminOnlyUI();
    showApp();

    if (isAdmin()) {
      showPage('users', document.getElementById('nav-users'));
    } else {
      showPage('services', document.getElementById('nav-services'));
    }

    await loadRoles();
    showToast('Passwort erfolgreich geändert.');
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Passwort speichern';
  }
}

// ── PASSWORT-RECOVERY ────────────────────────────────────────
async function doRecoveryPassword() {
  const pw1 = document.getElementById('recovery-1').value;
  const pw2 = document.getElementById('recovery-2').value;
  const errEl = document.getElementById('recovery-error');
  const btn = document.getElementById('recovery-btn');

  errEl.classList.remove('show');

  if (pw1.length < 6) {
    errEl.textContent = 'Passwort muss mindestens 6 Zeichen haben.';
    errEl.classList.add('show');
    return;
  }
  if (pw1 !== pw2) {
    errEl.textContent = 'Passwörter stimmen nicht überein.';
    errEl.classList.add('show');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Wird gespeichert ...';

  try {
    const { error } = await db.auth.updateUser({ password: pw1 });
    if (error) throw new Error(error.message);

    window.history.replaceState(null, '', window.location.pathname);
    inPasswordRecovery = false;

    const { data: { session } } = await db.auth.getSession();
    if (!session) {
      showToast('Passwort gesetzt. Bitte neu anmelden.');
      showLoginScreen();
      return;
    }

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
  const { data, error } = await db
    .from('roles')
    .select('*')
    .eq('ist_aktiv', true)
    .order('name');

  if (error) { showToast('Fehler beim Laden der Rollen: ' + error.message, true); return; }
  allRoles = data || [];
}

async function loadUsers() {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Lade ...</div></td></tr>';

  const { data: users, error } = await db
    .from('user_profiles')
    .select('*, roles(name)')
    .order('name');

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
        <td>
          <span class="badge" style="background:${roleBg};color:${roleColor}">
            ${esc(u.roles?.name || '—')}
          </span>
        </td>
        <td>
          <span class="badge" style="background:${statusBg(u.status)};color:${statusColor(u.status)}">
            ${esc(statusLabel(u.status))}
          </span>
        </td>
        <td style="text-align:right">
          <div class="btn-row" style="justify-content:flex-end">${actions}</div>
        </td>
      </tr>`;
  }).join('');
}

async function openUserModal(mode, userId = null) {
  if (!isAdmin()) {
    showToast('Du hast keine Berechtigung für diese Aktion.', true);
    return;
  }

  editingUserId = userId;

  const roleSelect = document.getElementById('u-role');
  roleSelect.innerHTML = allRoles.map(r =>
    `<option value="${esc(r.id)}">${esc(r.name)}</option>`
  ).join('');
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

    document.getElementById('modal-user-title').textContent =
      isEditingSelf ? 'Mein Profil' : 'Benutzer bearbeiten';
    document.getElementById('u-password-hint').textContent = '(leer = unverändert)';
    document.getElementById('u-password').placeholder = 'Leer lassen für unverändertes Passwort';
    document.getElementById('u-save-btn').textContent = 'Speichern';
    document.getElementById('u-delete-btn').style.display = isEditingSelf ? 'none' : 'block';
    document.getElementById('u-email').disabled = true;
    roleSelect.disabled = isEditingSelf;
    document.getElementById('u-password-group').style.display = '';

    const { data, error } = await db
      .from('user_profiles')
      .select('*, roles(id, name)')
      .eq('id', userId)
      .single();

    if (error || !data) {
      showToast('Benutzer konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true);
      editingUserId = null;
      return;
    }

    document.getElementById('u-name').value = data.name || '';
    document.getElementById('u-email').value = data.email || '';
    if (data.role_id) roleSelect.value = data.role_id;
  }

  document.getElementById('modal-user').classList.add('open');
  setTimeout(() => document.getElementById('u-name').focus(), 100);
}

function closeUserModal() {
  document.getElementById('modal-user').classList.remove('open');
  editingUserId = null;
}

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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    });

    const result = await resp.json();
    if (!resp.ok) throw new Error(result.error || 'Unbekannter Fehler');

    closeUserModal();

    if (editingUserId) {
      showToast('Benutzer aktualisiert.');
    } else {
      showCredentials({
        title: 'Zugangsdaten für ' + name,
        email: result.email,
        password: result.password
      });
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
  if (editingUserId === currentUser?.id) {
    showToast('Du kannst dich nicht selbst löschen.', true);
    return;
  }
  if (!confirm('Benutzer wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;

  const btn = document.getElementById('u-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.access_token) throw new Error('Nicht eingeloggt.');

    const resp = await fetch(`${FUNCTIONS_URL}/manage-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
        'apikey': SUPABASE_ANON_KEY
      },
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
  if (!isAdmin()) {
    showToast('Du hast keine Berechtigung für diese Aktion.', true);
    return;
  }
  if (!confirm(`Für "${userName}" ein neues Passwort generieren?\n\nDas alte Passwort wird sofort ungültig. Der Benutzer muss sich beim nächsten Login ein eigenes Passwort setzen.`)) {
    return;
  }

  try {
    const { data: { session } } = await db.auth.getSession();
    if (!session?.access_token) throw new Error('Nicht eingeloggt.');

    const resp = await fetch(`${FUNCTIONS_URL}/manage-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + session.access_token,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ action: 'reset_password', user_id: userId })
    });

    const result = await resp.json();
    if (!resp.ok) throw new Error(result.error || 'Unbekannter Fehler');

    showCredentials({
      title: 'Neues Passwort für ' + userName,
      email: result.email,
      password: result.password
    });

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
  const text = document.getElementById(elementId).textContent;
  try {
    await navigator.clipboard.writeText(text);
    showToast('In Zwischenablage kopiert.');
  } catch {
    showToast('Kopieren nicht möglich. Bitte manuell markieren.', true);
  }
}

async function copyBothCredentials() {
  const email = document.getElementById('cred-email').textContent;
  const password = document.getElementById('cred-password').textContent;
  const text = `E-Mail: ${email}\nPasswort: ${password}`;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Zugangsdaten in Zwischenablage kopiert.');
  } catch {
    showToast('Kopieren nicht möglich.', true);
  }
}

// ═══════════════════════════════════════════════════════════
//  LEISTUNGEN (SERVICES)
// ═══════════════════════════════════════════════════════════

// Lädt aktive Leistungskategorien für das Dropdown im Service-Modal
async function loadLeistungsKategorien() {
  const { data, error } = await db
    .from('lookup_values')
    .select('id, wert, farbe')
    .eq('kategorie', 'leistungs_kategorie')
    .eq('ist_aktiv', true)
    .order('reihenfolge');

  if (error) {
    showToast('Fehler beim Laden der Kategorien: ' + error.message, true);
    return [];
  }
  return data || [];
}

async function loadServices() {
  const tbody = document.getElementById('services-table-body');
  tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade ...</div></td></tr>';

  const { data, error } = await db
    .from('services')
    .select('*, kategorie:lookup_values!services_kategorie_id_fkey(id, wert, farbe)')
    .order('name');

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    const hint = isAdmin()
      ? 'Noch keine Leistungen angelegt. Klicke oben auf „+ Neue Leistung".'
      : 'Noch keine Leistungen verfügbar.';
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

    const editBtn = canEdit
      ? `<button class="btn btn-sm" onclick="openServiceModal('edit', '${s.id}')">Bearbeiten</button>`
      : '';

    return `
      <tr>
        <td>
          <div style="font-weight:500">${esc(s.name)}</div>
          ${s.beschreibung ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(s.beschreibung)}</div>` : ''}
        </td>
        <td>
          <span class="badge" style="background:${esc(katFarbe)}22;color:${esc(katFarbe)}">
            ${esc(katWert)}
          </span>
        </td>
        <td style="color:var(--muted)">${esc(s.einheit || '—')}</td>
        <td>${esc(formatPreis(s.standardpreis))}</td>
        <td>
          <span class="badge" style="background:${aktivBg};color:${aktivCol}">${aktivTxt}</span>
        </td>
        <td style="text-align:right">${editBtn}</td>
      </tr>`;
  }).join('');
}

async function openServiceModal(mode, serviceId = null) {
  if (!isAdmin()) {
    showToast('Du hast keine Berechtigung für diese Aktion.', true);
    return;
  }

  editingServiceId = serviceId;

  // Kategorie-Dropdown befüllen
  const kategorien = await loadLeistungsKategorien();
  const kategorieSelect = document.getElementById('s-kategorie');
  if (kategorien.length === 0) {
    kategorieSelect.innerHTML = '<option value="">Keine Kategorien – bitte erst unter „Stammdaten" anlegen</option>';
  } else {
    kategorieSelect.innerHTML = kategorien.map(k =>
      `<option value="${esc(k.id)}">${esc(k.wert)}</option>`
    ).join('');
  }

  // Felder leeren
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

    const { data, error } = await db
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    if (error || !data) {
      showToast('Leistung konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true);
      editingServiceId = null;
      return;
    }

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

function closeServiceModal() {
  document.getElementById('modal-service').classList.remove('open');
  editingServiceId = null;
}

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
  if (Number.isNaN(standardpreis) || standardpreis < 0) {
    showToast('Preis muss eine Zahl ≥ 0 sein.', true);
    return;
  }

  btn.disabled = true;
  btn.textContent = editingServiceId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      name,
      beschreibung: beschreibung || null,
      kategorie_id,
      einheit,
      standardpreis,
      ist_aktiv
    };

    let error;
    if (editingServiceId) {
      ({ error } = await db.from('services').update(payload).eq('id', editingServiceId));
    } else {
      ({ error } = await db.from('services').insert(payload));
    }

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
      // Foreign-Key-Verletzung (Leistung wird noch verwendet) → freundliche Nachricht
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

// Holt alle unterschiedlichen Lookup-Kategorien (Werte der kategorie-Spalte)
async function loadLookupKategorien() {
  const { data, error } = await db
    .from('lookup_values')
    .select('kategorie')
    .order('kategorie');

  if (error) {
    showToast('Fehler beim Laden der Kategorien: ' + error.message, true);
    return [];
  }
  const unique = [...new Set((data || []).map(r => r.kategorie))];
  return unique;
}

// Aufruf wenn die Stammdaten-Seite geöffnet wird
async function loadLookupsPage() {
  const kategorien = await loadLookupKategorien();
  const select = document.getElementById('lookup-filter-kategorie');

  if (kategorien.length === 0) {
    select.innerHTML = '<option value="">— Keine Kategorien vorhanden —</option>';
  } else {
    // Vorherige Auswahl merken, falls möglich
    const previous = select.value;
    select.innerHTML = kategorien.map(k =>
      `<option value="${esc(k)}">${esc(k)}</option>`
    ).join('');
    if (kategorien.includes(previous)) select.value = previous;
  }

  await loadLookups();
}

async function loadLookups() {
  const tbody = document.getElementById('lookups-table-body');
  const kategorie = document.getElementById('lookup-filter-kategorie').value;

  tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Lade ...</div></td></tr>';

  if (!kategorie) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Keine Kategorie ausgewählt.</div></td></tr>';
    return;
  }

  const { data, error } = await db
    .from('lookup_values')
    .select('*')
    .eq('kategorie', kategorie)
    .order('reihenfolge')
    .order('wert');

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Noch keine Einträge in dieser Kategorie.</div></td></tr>';
    return;
  }

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
        <td>
          <span class="badge" style="background:${aktivBg};color:${aktivCol}">${aktivTxt}</span>
        </td>
        <td style="text-align:right">
          <button class="btn btn-sm" onclick="openLookupModal('edit', '${esc(lv.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');
}

async function openLookupModal(mode, lookupId = null) {
  if (!isAdmin()) {
    showToast('Du hast keine Berechtigung für diese Aktion.', true);
    return;
  }

  editingLookupId = lookupId;

  // Kategorie-Dropdown mit bestehenden + "Neue Kategorie..."-Option befüllen
  const kategorien = await loadLookupKategorien();
  const kSelect = document.getElementById('l-kategorie');
  let options = kategorien.map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('');
  options += '<option value="__new__">+ Neue Kategorie anlegen …</option>';
  kSelect.innerHTML = options;

  // Eingabefeld für neue Kategorie zunächst ausblenden
  document.getElementById('l-new-kategorie-group').style.display = 'none';
  document.getElementById('l-new-kategorie').value = '';

  // "Neue Kategorie"-Auswahl via Change-Handler
  kSelect.onchange = () => {
    const isNew = kSelect.value === '__new__';
    document.getElementById('l-new-kategorie-group').style.display = isNew ? '' : 'none';
  };

  // Felder zurücksetzen
  document.getElementById('l-wert').value = '';
  document.getElementById('l-farbe').value = '#6b7280';
  document.getElementById('l-reihenfolge').value = '0';
  document.getElementById('l-aktiv').value = 'true';

  if (mode === 'new') {
    document.getElementById('modal-lookup-title').textContent = 'Neuer Wert';
    document.getElementById('l-save-btn').textContent = 'Anlegen';
    document.getElementById('l-delete-btn').style.display = 'none';

    // Filter-Kategorie als Default übernehmen, falls gesetzt
    const filterKat = document.getElementById('lookup-filter-kategorie').value;
    if (filterKat && kategorien.includes(filterKat)) {
      kSelect.value = filterKat;
    }
  } else {
    document.getElementById('modal-lookup-title').textContent = 'Wert bearbeiten';
    document.getElementById('l-save-btn').textContent = 'Speichern';
    document.getElementById('l-delete-btn').style.display = 'block';

    const { data, error } = await db.from('lookup_values').select('*').eq('id', lookupId).single();
    if (error || !data) {
      showToast('Wert konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true);
      editingLookupId = null;
      return;
    }

    kSelect.value = data.kategorie;
    document.getElementById('l-wert').value = data.wert || '';
    document.getElementById('l-farbe').value = data.farbe || '#6b7280';
    document.getElementById('l-reihenfolge').value = data.reihenfolge ?? 0;
    document.getElementById('l-aktiv').value = data.ist_aktiv ? 'true' : 'false';
  }

  document.getElementById('modal-lookup').classList.add('open');
  setTimeout(() => document.getElementById('l-wert').focus(), 100);
}

function closeLookupModal() {
  document.getElementById('modal-lookup').classList.remove('open');
  editingLookupId = null;
}

async function saveLookup() {
  const kSelect     = document.getElementById('l-kategorie');
  const isNew       = kSelect.value === '__new__';
  const kategorie   = isNew
    ? document.getElementById('l-new-kategorie').value.trim()
    : kSelect.value;
  const wert        = document.getElementById('l-wert').value.trim();
  const farbe       = document.getElementById('l-farbe').value;
  const reihenRaw   = document.getElementById('l-reihenfolge').value;
  const ist_aktiv   = document.getElementById('l-aktiv').value === 'true';
  const btn         = document.getElementById('l-save-btn');

  if (!kategorie) { showToast('Bitte Kategorie auswählen oder neue eingeben.', true); return; }
  if (isNew && !/^[a-z0-9_]+$/.test(kategorie)) {
    showToast('Kategorie-Schlüssel: nur Kleinbuchstaben, Zahlen und Unterstriche.', true);
    return;
  }
  if (!wert) { showToast('Bitte Wert eingeben.', true); return; }

  const reihenfolge = reihenRaw === '' ? 0 : parseInt(reihenRaw, 10);
  if (Number.isNaN(reihenfolge)) { showToast('Reihenfolge muss eine Zahl sein.', true); return; }

  btn.disabled = true;
  btn.textContent = editingLookupId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = { kategorie, wert, farbe, reihenfolge, ist_aktiv };

    let error;
    if (editingLookupId) {
      ({ error } = await db.from('lookup_values').update(payload).eq('id', editingLookupId));
    } else {
      ({ error } = await db.from('lookup_values').insert(payload));
    }
    if (error) throw new Error(error.message);

    closeLookupModal();
    showToast(editingLookupId ? 'Wert aktualisiert.' : 'Wert angelegt.');

    // Filter-Dropdown aktualisieren und auf die gerade benutzte Kategorie setzen
    await loadLookupsPage();
    const filterSelect = document.getElementById('lookup-filter-kategorie');
    if ([...filterSelect.options].some(o => o.value === kategorie)) {
      filterSelect.value = kategorie;
      await loadLookups();
    }
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingLookupId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteLookup() {
  if (!editingLookupId) return;
  if (!confirm('Wert wirklich löschen?\n\nFalls dieser Wert bereits an anderen Stellen referenziert wird (z. B. als Leistungskategorie), wird das Löschen vom System verhindert. In dem Fall bitte stattdessen archivieren.')) return;

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

// ── START ────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
