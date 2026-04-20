/* ═══════════════════════════════════════════════════════════
   Cumart CRM – Application Script
   Extrahiert aus index.html v1.3.0
   Einzige Änderung: initAuth() wird erst nach DOMContentLoaded
   aufgerufen, damit das externe Script unabhängig von seiner
   Position im HTML funktioniert.
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
let inPasswordRecovery = false; // TRUE während Recovery-Link-Flow

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

  // Passwort-Recovery-Flow aus E-Mail-Link (Supabase Reset-Mail)
  if (hash.includes('type=recovery') || hash.includes('type=invite')) {
    inPasswordRecovery = true;
    showRecoveryScreen();
    // Warten auf PASSWORD_RECOVERY/SIGNED_IN-Event, dann bleibt der User im Screen
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
    // Während Recovery-Flow keine Auto-Logins
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

  // Profil muss existieren
  if (profileError || !profile) {
    await db.auth.signOut();
    currentUser = null;
    showLoginScreen();
    showToast('Benutzerprofil nicht gefunden. Bitte wende dich an einen Administrator.', true);
    return;
  }

  // Inaktive User blocken
  if (profile.status === 'inaktiv') {
    await db.auth.signOut();
    currentUser = null;
    showLoginScreen();
    showToast('Dein Konto ist deaktiviert. Bitte wende dich an einen Administrator.', true);
    return;
  }

  currentProfile = profile;

  // Muss der User sein Passwort ändern? -> Screen sperrt App
  if (profile.muss_passwort_aendern === true) {
    showMustChangeScreen();
    return;
  }

  // Normal in die App
  renderSidebar();
  document.getElementById('btn-new-user').style.display = isAdmin() ? 'inline-block' : 'none';
  showApp();

  await loadRoles();
  await loadUsers();
}

function renderSidebar() {
  const bar = document.getElementById('sidebar-user');
  bar.innerHTML = `
    <div class="sidebar-user-avatar">${ini(currentProfile?.name || currentUser.email)}</div>
    <div class="sidebar-user-info">
      <div class="sidebar-user-name">${currentProfile?.name || currentUser.email}</div>
      <div class="sidebar-user-role">${currentProfile?.roles?.name || '—'}</div>
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

// ── PASSWORT-ÄNDERN-PFLICHT (Admin-Reset-Flow) ───────────────
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
    // 1. Passwort im Auth-System ändern
    const { error: pwError } = await db.auth.updateUser({ password: pw1 });
    if (pwError) throw new Error(pwError.message);

    // 2. Flag in user_profiles zurücksetzen
    const { error: flagError } = await db
      .from('user_profiles')
      .update({ muss_passwort_aendern: false })
      .eq('id', currentUser.id);

    if (flagError) throw new Error(flagError.message);

    // 3. Profil neu laden und in die App
    const { data: profile, error: profileError } = await db
      .from('user_profiles')
      .select('*, roles(id, name, rechte)')
      .eq('id', currentUser.id)
      .single();

    if (profileError || !profile) throw new Error('Profil konnte nicht geladen werden.');

    currentProfile = profile;

    renderSidebar();
    document.getElementById('btn-new-user').style.display = isAdmin() ? 'inline-block' : 'none';
    showApp();

    await loadRoles();
    await loadUsers();

    showToast('Passwort erfolgreich geändert.');
  } catch (e) {
    errEl.textContent = e.message;
    errEl.classList.add('show');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Passwort speichern';
  }
}

// ── PASSWORT-RECOVERY (Passwort vergessen per Mail) ──────────
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

    // URL-Hash entfernen
    window.history.replaceState(null, '', window.location.pathname);

    // Recovery-Modus beenden und Session als normaler Login behandeln
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

// ── ROLLEN ───────────────────────────────────────────────────
async function loadRoles() {
  const { data, error } = await db
    .from('roles')
    .select('*')
    .eq('ist_aktiv', true)
    .order('name');

  if (error) { showToast('Fehler beim Laden der Rollen: ' + error.message, true); return; }
  allRoles = data || [];
}

// ── BENUTZER LADEN ───────────────────────────────────────────
async function loadUsers() {
  const tbody = document.getElementById('users-table-body');
  tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Lade ...</div></td></tr>';

  const { data: users, error } = await db
    .from('user_profiles')
    .select('*, roles(name)')
    .order('name');

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty">Fehler: ${error.message}</div></td></tr>`;
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

    // Action-Buttons nur für Admins
    let actions = '';
    if (canAdminister) {
      actions += `<button class="btn btn-sm" onclick="openUserModal('edit', '${u.id}')">Bearbeiten</button>`;
      // Reset nur für andere User, nicht für sich selbst (Admin kann sein eigenes Passwort im Profil ändern)
      if (!isMe) {
        actions += `<button class="btn btn-sm" onclick="resetUserPassword('${u.id}', '${(u.name||'').replace(/'/g, '&#39;')}')">Passwort zurücksetzen</button>`;
      }
    }

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${ini(u.name)}</div>
            <div>
              <div style="font-weight:500">${u.name}</div>
              ${isMe ? '<div style="font-size:11px;color:var(--muted)">Das bist du</div>' : ''}
            </div>
          </div>
        </td>
        <td style="color:var(--muted)">${u.email}</td>
        <td>
          <span class="badge" style="background:${roleBg};color:${roleColor}">
            ${u.roles?.name || '—'}
          </span>
        </td>
        <td>
          <span class="badge" style="background:${statusBg(u.status)};color:${statusColor(u.status)}">
            ${statusLabel(u.status)}
          </span>
        </td>
        <td style="text-align:right">
          <div class="btn-row" style="justify-content:flex-end">${actions}</div>
        </td>
      </tr>`;
  }).join('');
}

// ── BENUTZER MODAL ───────────────────────────────────────────
async function openUserModal(mode, userId = null) {
  if (!isAdmin()) {
    showToast('Du hast keine Berechtigung für diese Aktion.', true);
    return;
  }

  editingUserId = userId;

  const roleSelect = document.getElementById('u-role');
  roleSelect.innerHTML = allRoles.map(r =>
    `<option value="${r.id}">${r.name}</option>`
  ).join('');
  roleSelect.disabled = false;

  // Felder zentral leeren (Zombie-Werte vermeiden)
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
    // Passwort-Feld sichtbar & aktiv beim Anlegen
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
      // Neuer User: Zugangsdaten anzeigen
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

// ── PASSWORT-RESET DURCH ADMIN ───────────────────────────────
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

// ── ZUGANGSDATEN-MODAL ──────────────────────────────────────
function showCredentials({ title, email, password }) {
  document.getElementById('modal-credentials-title').textContent = title;
  document.getElementById('cred-email').textContent = email;
  document.getElementById('cred-password').textContent = password;
  document.getElementById('modal-credentials').classList.add('open');
}

function closeCredentialsModal() {
  document.getElementById('modal-credentials').classList.remove('open');
  // Aus Sicherheitsgründen Werte entfernen
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

// ── START ────────────────────────────────────────────────────
// Warten bis DOM geladen ist, damit alle getElementById-Zugriffe sicher sind.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
