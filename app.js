/* ═══════════════════════════════════════════════════════════
   Cumart CRM – Application Script
   Version 1.34.0 (Punkte 6 + 9: Termin-Typ-Icons und Modal-
   Redesign. Termin-Modal hat jetzt einen Icon-Picker neben
   dem Typ-Dropdown — jeder Typ bekommt ein Emoji via Fuzzy-
   Match auf den Lookup-Wert (Call 📞, Meeting 🤝, Training 🎓,
   usw., Fallback 📅). Die Icons erscheinen auch vor Termin-
   Titeln in allen Listen, im Kalender-Popover und im Termin-
   Dashboard, damit man auf einen Blick den Termin-Typ sieht.
   Modal-Redesign: Optional-Sektionen in Termin-/Einsatz-/
   Aufgabe-Modal sind standardmäßig kollabiert — Einsatz-
   Modal zeigt „Beschreibung & Notizen" und „Techniker" zu-
   geklappt (per Klick aufklappbar), Termin-Modal „Notizen"
   zugeklappt, Aufgabe-Modal „Zuordnung (optional)" und
   „Notizen" zugeklappt. Fachliche Pflichtfelder bleiben
   oben sichtbar. Einsatz-Modal hat zusätzlich eine eigene
   „Kopplung"-Sektion (Termin-Sync + Bonus-Einlösung)
   getrennt von den Notizen.)
   Version 1.33.0 (Fünferpack: 1) Kontakt hat Vorrang vor Firma
   im Kunden-Label der Verwandten-Aufgaben. 2) Plus-Button im
   Kalender-Popover öffnet Mini-Menü (+Termin/+Einsatz/+Aufgabe)
   mit Datum-Prefill auf den geklickten Tag. 3) Einsatz-Menge
   wird automatisch aus den Werktagen des Datumsbereichs
   berechnet; manuelle Edit überschreibt Auto-Wert, Reset-Icon
   ↻ neben d-menge setzt zurück. 4) Datum-Schnellauswahl auf
   Werktage umgestellt (Heute / Nächster WT / +3 WT / +7 WT /
   Nächster Mo) + drei dynamisch benannte Monats-Buttons;
   generischer setDateShortcut-Helper, eingesetzt in Termin-,
   Einsatz- und Aufgabe-Modal. 5) Ganztags-Checkbox in Termin-
   und Einsatz-Modal setzt 08:00–16:00 und sperrt die Zeit-
   Inputs.)
   Version 1.32.0 (Kalender-Bar — permanenter Monats-Zeitstrahl
   am unteren Rand (Desktop ab 900 px). Farbcode pro Tag: weiß
   frei, gelb Termin, grün Einsatz, rot Feiertag (Baden-
   Württemberg, via Gauß'scher Osterformel berechnet, keine
   externe API). Warn-Symbol ⚠ bei Einsatz an Feiertag, damit
   versehentliche Fehlplanungen sofort auffallen. Mitarbeiter-
   Dropdown (alle aktiven User wählbar, Default: eingeloggter
   User) · Prev/Next-Monat · Heute-Button · Klick auf Tag öffnet
   Popover mit Termin-/Einsatz-Details und Kollisions-Warnung.
   Refresh nach jedem Termin-/Einsatz-Write.)
   Version 1.31.0 (Dreifach-Paket: 1) Sidebar-Reihenfolge auf
   Firmen · Kontakte · Projekte · Termine · Einsätze · Aufgaben
   umsortiert. 2) Einsatz-Dashboard bleibt bei „durchgeführt"
   und „abgerechnet" offen — preserveExpandedRowAcross stellt
   die aufgeklappte Zeile nach dem Liste-Refresh wieder her
   (data-dep-id auf allen Einsatz-trs). 3) Verwandte offene
   Aufgaben im Aufgabe-Dashboard filtern auf Firma/Kontakt
   statt Firma/Zuständiger und zeigen den Kundenkontext vor
   dem Status-Label.)
   Version 1.30.1 (Fix: loadProjectDetail crashte beim Init,
   weil es noch die in v1.30.0 entfernten HTML-Elemente
   project-detail-beschreibung-wrap / -notizen-wrap zu
   verstecken versuchte. Die Render-Kette brach dadurch ab,
   und die Stammdaten-Seite blieb im „Lade …"-Zustand.)
   Version 1.30.0 (Projekt-Dashboard-Parität — Projekt-
   Stammdaten-Tab bekommt dasselbe Dashboard-Layout wie
   Firma/Kontakt: 4 Stats-Cards (Status · Wirtschaftlichkeit
   mit Marge/Überziehung · Zeitplan mit Tage-bis/überzogen ·
   Offene Aufgaben), 2-col „Letzte Aktivität" + „Bevorstehend",
   Inline-editierbare Beschreibung + Notizen, Quick-Create-
   Panel rechts (Termin/Einsatz/Aufgabe). Schließt die letzte
   Lücke in der Dashboard-Vereinheitlichung.)
   Version 1.29.0 (Aufgabe-Inline-Expand-Dashboard — damit
   haben alle vier Entitäten den gleichen Klick-Flow: Termin
   (v1.27), Einsatz (v1.28), Aufgabe (v1.29) klappen das
   Detail-Dashboard direkt unterhalb der Zeile auf, Firma/
   Kontakt/Projekt behalten ihre eigenen Detail-Routen.
   Aufgabe-Dashboard: Stats (Status · Fälligkeit mit Tage-
   bis/überfällig/heute · Zuständiger), Kontext (Firma/Kontakt/
   Projekt/Beschreibung/Notizen), verwandte offene Aufgaben
   (selbe Firma ODER selber Zuständiger). Schnellaktionen:
   erledigen · wieder öffnen · Fälligkeit +7 Tage · mir
   zuweisen · Folge-Aufgabe · Vollbearbeitung.)
   Version 1.28.0 (Einsatz-Inline-Expand-Dashboard — Klick
   auf einen Einsatz-Titel klappt darunter ein Detail-
   Dashboard auf. Stats (Status, Wert, Datum, ABC, Projekt-
   Verknüpfung, gekoppelter Termin, Bonus-Einlösung), Kontext
   (Firma, Leistung, Techniker, Uhrzeit, Menge×Preis, Ort,
   Notizen), Projekt-Kontext mit Soll/Ist-Marge wenn im Projekt,
   Historie letzter 3 Einsätze derselben Firma. Schnellaktionen:
   als durchgeführt · als abgerechnet · duplizieren · Folge-
   Einsatz · Vollbearbeitung. Auto-Expand bei genau einem
   Einsatz in Firma-/Projekt-Detail-Tabs. Shared Helper
   autoExpandSingleRow(tbody, entityType, items) generalisiert.)
   Version 1.27.1 (Auto-Expand bei genau einem Termin in
   Detail-Tabs.)
   Version 1.27.0 (Termin-Inline-Expand-Dashboard: Klick auf
   einen Termin-Titel in einer Liste klappt darunter ein
   Detail-Dashboard auf — Stats (Status, Typ, Datum, ABC der
   Firma, Gekoppelter Einsatz), Kontext-Card (Firma, Kontakt,
   Projekt, Ort, Notizen), letzte Termine derselben Firma,
   offene Aufgaben (Firma/Kontakt), Schnellaktionen (als
   durchgeführt markieren · Folge-Termin +1 Woche · Aufgabe
   aus Termin · Einsatz aus Termin · Vollbearbeitung). Nur
   eine Zeile gleichzeitig offen app-weit. Mobile fällt
   automatisch auf das Bearbeiten-Modal zurück. Wirkt in
   allen 4 Termine-Listen: Haupt, Firma-Tab, Kontakt-Tab,
   Projekt-Tab. Bearbeiten-Button/-Icon öffnet weiterhin
   das volle Modal für tiefere Edits. Shared Infrastruktur
   toggleRowExpand/closeExpandedRow — wiederverwendbar für
   Einsatz v1.28 und Aufgabe v1.29.)
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
let currentProjectDetailId = null;
let currentContactDetailId = null;
let contactModalPrefillCompanyId = null;
let appointmentModalPrefillCompanyId = null;
let appointmentModalPrefillProjectId = null;
let appointmentModalPrefillContactId = null;
let projectModalPrefillCompanyId = null;
let projectModalPrefillHauptkontaktId = null;
let deploymentModalPrefillCompanyId = null;
let deploymentModalPrefillProjectId = null;
let editingProjectId = null;
let editingDeploymentId = null;
let _deploymentMengeManuallyEdited = false;  // v1.33: verhindert, dass Auto-Menge manuelle Eingabe überschreibt
let editingTaskId = null;
let taskModalPrefillCompanyId = null;
let taskModalPrefillProjectId = null;
let taskModalPrefillContactId = null;

let companiesCache   = [];
let contactsCache    = [];
let appointmentsCache = [];
let projectsCache    = [];
let deploymentsCache = [];
let tasksCache       = [];
let terminTypenCache = [];
let projektStatusCache = [];
let einsatzStatusCache = [];
let aufgabeStatusCache = [];
let servicesCache    = [];
let userProfilesCache = [];

// Map: companyId → contacts[] (für synchronen Copy-Zugriff)
let companyContactsMap = {};

// Selected Techniker IDs im Einsatz-Modal (temporär)
let selectedTechnikerIds = new Set();

// Map: companyId → { next: {datum, titel, id} | null, last: {datum, titel, id} | null }
let companyAppointmentMap = {};

// Pending filter für Termine, kommt aus URL-Hash-Parametern
let pendingAppointmentsFilter = null;

// Pending filter für Aufgaben (z.B. #/aufgaben?firma=…&scope=all_open)
let pendingTasksFilter = null;
// Aktiver Projekt-Filter (kein UI-Dropdown, nur per URL-Param)
let tasksProjectFilterActive = null;

// Auto-Fill-Tracking für Ort-Feld
let lastAutoFilledOrt = '';

// ── HILFSFUNKTIONEN ──────────────────────────────────────────
function ini(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function statusLabel(s) { return { eingeladen: 'Eingeladen', aktiv: 'Aktiv', inaktiv: 'Inaktiv' }[s] || 'Unbekannt'; }
function statusBg(s) { return { eingeladen: '#fffbeb', aktiv: '#f0fdf4', inaktiv: '#fef2f2' }[s] || '#f3f4f6'; }
function statusColor(s) { return { eingeladen: '#d97706', aktiv: '#16a34a', inaktiv: '#dc2626' }[s] || '#6b7280'; }

function isAdmin() { return currentProfile?.roles?.name === 'Admin'; }

/** Übersetzt Supabase-/PostgREST-Fehler in eine alltagstaugliche Meldung.
 *  PGRST116 = .single() hat 0 oder >1 Zeilen → "nicht gefunden".
 *  entityLabel z.B. "Firma", "Kontakt", "Projekt". */
function friendlyFetchError(error, entityLabel) {
  if (!error || error.code === 'PGRST116') return `${entityLabel} nicht gefunden.`;
  return 'Ein Fehler ist aufgetreten. Bitte die Seite neu laden.';
}

/** Mapping von lookup_values.kategorie-Keys auf UI-Labels.
 *  Unbekannte Keys werden von kategorieLabel() automatisch Title-Cased. */
const KATEGORIE_LABELS = {
  aufgabe_status:      'Aufgaben-Status',
  einsatz_status:      'Einsatz-Status',
  leistungs_kategorie: 'Leistungs-Kategorie',
  projekt_status:      'Projekt-Status',
  termin_status:       'Termin-Status',
  termin_typ:          'Termin-Typ',
  unternehmens_typ:    'Unternehmens-Typ',
};

function kategorieLabel(key) {
  if (!key) return '';
  if (KATEGORIE_LABELS[key]) return KATEGORIE_LABELS[key];
  // Fallback: snake_case → Title Case
  return key.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
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

// ═══════════════════════════════════════════════════════════
//  INPUT-SANITIZER (Tipp-Zeit-Validierung)
// ═══════════════════════════════════════════════════════════

/** Erlaubt nur telefon-taugliche Zeichen: Ziffern, +, -, (, ), /, ., Leerzeichen */
function sanitizePhoneInput(el) {
  const before = el.value;
  const after  = before.replace(/[^\d+\-()\/. ]/g, '');
  if (before !== after) {
    const pos = el.selectionStart - (before.length - after.length);
    el.value = after;
    try { el.setSelectionRange(pos, pos); } catch {}
  }
}

/** Erlaubt nur Ziffern (z.B. PLZ) */
function sanitizeNumericInput(el, maxLen = null) {
  const before = el.value;
  let after = before.replace(/\D/g, '');
  if (maxLen) after = after.slice(0, maxLen);
  if (before !== after) {
    const pos = el.selectionStart - (before.length - after.length);
    el.value = after;
    try { el.setSelectionRange(pos, pos); } catch {}
  }
}

/** Trimmt und kleinbuchstabiert E-Mail sanft (keine Auto-Lowercasing beim Tippen, nur on blur) */
function sanitizeEmailOnBlur(el) {
  el.value = el.value.trim();
}

let _toastActionTimer = null;

/** Zeigt einen Toast. options = { actionLabel, onAction, durationMs }. */
function showToast(msg, isError = false, options = {}) {
  const t = document.getElementById('toast');
  if (!t) return;
  const hasAction = options.actionLabel && typeof options.onAction === 'function';
  const duration = options.durationMs || (hasAction ? 5000 : 3000);

  t.innerHTML = '';
  const msgEl = document.createElement('span');
  msgEl.className = 'toast-msg';
  msgEl.textContent = msg;
  t.appendChild(msgEl);

  if (hasAction) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toast-action';
    btn.textContent = options.actionLabel;
    btn.onclick = () => {
      clearTimeout(_toastActionTimer);
      t.className = 'toast';
      try { options.onAction(); } catch (err) { console.error(err); }
    };
    t.appendChild(btn);
  }

  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(_toastActionTimer);
  _toastActionTimer = setTimeout(() => { t.className = 'toast'; }, duration);
}

// ─── Custom Confirm-Dialog (v1.20.0) ───
let _confirmResolver = null;

/** Zeigt einen Confirm-Dialog und gibt ein Promise<boolean> zurück.
 *  Default-Fokus liegt auf „Abbrechen" — user muss aktiv zu „Löschen" klicken/tabben. */
function confirmDialog({ title = 'Wirklich löschen?', message = '', confirmLabel = 'Löschen', cancelLabel = 'Abbrechen', danger = true } = {}) {
  return new Promise((resolve) => {
    _confirmResolver = resolve;
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').innerHTML = message;
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    const okBtn = document.getElementById('confirm-ok-btn');
    cancelBtn.textContent = cancelLabel;
    okBtn.textContent = confirmLabel;
    okBtn.className = 'btn ' + (danger ? 'btn-danger' : 'btn-primary');
    cancelBtn.onclick = () => _closeConfirm(false);
    okBtn.onclick     = () => _closeConfirm(true);
    document.getElementById('modal-confirm').classList.add('open');
    setTimeout(() => cancelBtn.focus(), 50);
  });
}

function _closeConfirm(result) {
  document.getElementById('modal-confirm').classList.remove('open');
  if (_confirmResolver) { const r = _confirmResolver; _confirmResolver = null; r(result); }
}

// ─── Kebab-Menü (v1.20.0, single shared instance) ───
let _kebabOpenFor = null;

function openKebabMenu(entityType, id, btnEl, event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }
  // Selber Button nochmal → schließen
  if (_kebabOpenFor && _kebabOpenFor.entityType === entityType && _kebabOpenFor.id === id) {
    closeKebabMenu();
    return;
  }
  _kebabOpenFor = { entityType, id };
  const menu = document.getElementById('kebab-menu');
  const rect = btnEl.getBoundingClientRect();
  // Menü rechts-bündig zum Kebab-Button, 4px darunter
  menu.style.top  = (rect.bottom + 4) + 'px';
  menu.style.left = Math.max(8, rect.right - 160) + 'px';
  menu.classList.add('open');
}

function closeKebabMenu() {
  _kebabOpenFor = null;
  const m = document.getElementById('kebab-menu');
  if (m) m.classList.remove('open');
}

function handleKebabAction(action) {
  if (!_kebabOpenFor) return;
  const { entityType, id } = _kebabOpenFor;
  closeKebabMenu();
  if (action === 'copy') {
    const handlers = { company: copyCompanyById, contact: copyContactById, appointment: copyAppointmentById, project: copyProjectById, deployment: copyDeploymentById, task: copyTaskById };
    handlers[entityType]?.(id);
  } else if (action === 'duplicate') {
    duplicateEntity(entityType, id);
  } else if (action === 'delete') {
    deleteEntityById(entityType, id);
  }
}

document.addEventListener('click', (ev) => {
  if (!_kebabOpenFor) return;
  if (ev.target.closest('#kebab-menu') || ev.target.closest('.kebab-btn')) return;
  closeKebabMenu();
});
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Escape') return;
  if (_kebabOpenFor) { ev.preventDefault(); closeKebabMenu(); return; }
  if (document.getElementById('modal-confirm')?.classList.contains('open')) {
    ev.preventDefault(); _closeConfirm(false);
  }
});
window.addEventListener('scroll', () => closeKebabMenu(), true);
window.addEventListener('resize', () => closeKebabMenu());

// ═══════════════════════════════════════════════════════════
//  ICON-ACTION-BUTTONS (v1.11.0)
// ═══════════════════════════════════════════════════════════

/** SVG-Icons (Heroicons-Style, inline damit keine Library nötig) */
const ICON_EDIT = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>';
const ICON_DELETE = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"/></svg>';
const ICON_KEBAB = '<svg fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';

/**
 * Rendert die Standard-Aktionen für Listen-Zeilen (v1.20.0):
 * Bearbeiten als Hover-sichtbares Primär-Icon + Kebab-Menü für sekundäre
 * Aktionen (Kopieren / Duplizieren / Löschen).
 */
function renderActionIcons(entityType, id) {
  const editHandler = {
    company: `onclick="openCompanyModal('edit', '${esc(id)}')"`,
    contact: `onclick="openContactModal('edit', '${esc(id)}')"`,
    appointment: `onclick="openAppointmentModal('edit', '${esc(id)}')"`,
    project: `onclick="location.hash='#/projekt/${esc(id)}'"`,
    deployment: `onclick="openDeploymentModal('edit', '${esc(id)}')"`,
    task: `onclick="openTaskModal('edit', '${esc(id)}')"`
  }[entityType];

  return `
    <div class="action-icons">
      <button class="icon-btn" ${editHandler} title="Bearbeiten">${ICON_EDIT}</button>
      <button class="icon-btn kebab-btn" onclick="openKebabMenu('${entityType}', '${esc(id)}', this, event)" title="Weitere Aktionen">${ICON_KEBAB}</button>
    </div>`;
}

/* ───────────────────────────────────────────────
   DISPATCHER: LÖSCHEN & DUPLIZIEREN
   ─────────────────────────────────────────────── */

/** Führt den eigentlichen Soft-Delete durch, inkl. Einsatz→Termin-Kaskade
 *  und Undo-Toast (5s Rückgängig). Ohne Confirm — Caller muss vorher fragen. */
async function _performSoftDelete(entityType, id) {
  const labels = { company: 'Firma', contact: 'Kontakt', appointment: 'Termin', project: 'Projekt', deployment: 'Einsatz', task: 'Aufgabe' };
  const tables = { company: 'companies', contact: 'contacts', appointment: 'appointments', project: 'projects', deployment: 'deployments', task: 'tasks' };
  const label = labels[entityType];
  const table = tables[entityType];
  if (!table || !label) return;

  try {
    const deletedAt = new Date().toISOString();
    const { error } = await db.from(table).update({ deleted_at: deletedAt }).eq('id', id);
    if (error) {
      if (error.message.toLowerCase().includes('foreign key') || error.code === '23503') {
        throw new Error('Dieser Eintrag wird noch an anderer Stelle verwendet und kann nicht gelöscht werden.');
      }
      throw new Error(error.message);
    }

    // Bei Einsatz: gekoppelten Termin auch soft-deleten. IDs merken für Undo.
    let coupledApptIds = [];
    if (entityType === 'deployment') {
      const { data: appts } = await db.from('appointments').select('id').is('deleted_at', null).eq('deployment_id', id);
      coupledApptIds = (appts || []).map(a => a.id);
      if (coupledApptIds.length) {
        await db.from('appointments').update({ deleted_at: deletedAt }).eq('deployment_id', id);
      }
    }

    showToast(`${label} gelöscht.`, false, {
      actionLabel: 'Rückgängig',
      durationMs: 5000,
      onAction: async () => {
        try {
          await db.from(table).update({ deleted_at: null }).eq('id', id);
          if (coupledApptIds.length) {
            await db.from('appointments').update({ deleted_at: null }).in('id', coupledApptIds);
          }
          showToast(`${label} wiederhergestellt.`);
          await refreshAfterEntityChange(entityType);
        } catch (err) {
          showToast('Wiederherstellen fehlgeschlagen: ' + err.message, true);
        }
      }
    });
    await refreshAfterEntityChange(entityType);
  } catch (e) {
    showToast(e.message, true);
  }
}

/** Zentraler Delete-Dispatcher aus den Listen-Icons (Kebab → Löschen).
 *  Seit v1.20.0: Custom-Confirm + _performSoftDelete (Undo-Toast). */
async function deleteEntityById(entityType, id, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  closeKebabMenu();

  const labels = { company: 'Firma', contact: 'Kontakt', appointment: 'Termin', project: 'Projekt', deployment: 'Einsatz', task: 'Aufgabe' };
  const nameCols = { company: 'name', contact: 'nachname', appointment: 'titel', project: 'name', deployment: 'titel', task: 'titel' };
  const tables = { company: 'companies', contact: 'contacts', appointment: 'appointments', project: 'projects', deployment: 'deployments', task: 'tasks' };
  const label = labels[entityType];
  const nameCol = nameCols[entityType];
  const table = tables[entityType];
  if (!table || !label) return;

  // Entity-Name für Confirm-Nachricht holen
  const { data: ent } = await db.from(table).select(`id, ${nameCol}`).is('deleted_at', null).eq('id', id).single();
  const entName = ent?.[nameCol] || '(ohne Name)';

  const ok = await confirmDialog({
    title: `${label} löschen?`,
    message: `<strong>${esc(entName)}</strong> wirklich löschen?`,
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

  await _performSoftDelete(entityType, id);
}

/** Zentraler Duplicate-Dispatcher aus den Listen-Icons. */
async function duplicateEntity(entityType, id, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }

  try {
    switch (entityType) {
      case 'company':     await duplicateCompany(id); break;
      case 'contact':     await duplicateContact(id); break;
      case 'appointment': await duplicateAppointment(id); break;
      case 'project':     await duplicateProject(id); break;
      case 'deployment':  await duplicateDeployment(id); break;
      case 'task':        await duplicateTask(id); break;
      default: throw new Error('Unbekannter Typ: ' + entityType);
    }
  } catch (e) {
    showToast('Duplizieren fehlgeschlagen: ' + e.message, true);
  }
}

/** Refresht die relevante Liste nach Delete/Duplicate. */
async function refreshAfterEntityChange(entityType) {
  const hash = location.hash || '';
  // Je nach aktiver Seite neu laden
  if (entityType === 'company') {
    if (hash.startsWith('#/firmen')) await loadCompanies();
    else if (hash.startsWith('#/firma/')) location.hash = '#/firmen';
  } else if (entityType === 'contact') {
    if (hash.startsWith('#/kontakte')) await loadContacts();
    else if (hash.startsWith('#/kontakt/')) location.hash = '#/kontakte';
    else if (hash.startsWith('#/firma/') && currentCompanyDetailId) await loadCompanyDetail(currentCompanyDetailId);
  } else if (entityType === 'appointment') {
    if (hash.startsWith('#/termine')) await loadAppointments();
    else if (hash.startsWith('#/firma/') && currentCompanyDetailId) await loadCompanyDetail(currentCompanyDetailId);
    else if (hash.startsWith('#/kontakt/') && currentContactDetailId) await loadContactDetail(currentContactDetailId);
    else if (hash.startsWith('#/projekt/') && currentProjectDetailId) await loadProjectDetail(currentProjectDetailId);
  } else if (entityType === 'project') {
    if (hash.startsWith('#/projekte')) await loadProjects();
    else if (hash.startsWith('#/projekt/')) location.hash = '#/projekte';
    else if (hash.startsWith('#/firma/') && currentCompanyDetailId) await loadCompanyDetail(currentCompanyDetailId);
  } else if (entityType === 'deployment') {
    if (hash.startsWith('#/einsaetze')) await loadDeployments();
    else if (hash.startsWith('#/firma/') && currentCompanyDetailId) await loadCompanyDetail(currentCompanyDetailId);
    else if (hash.startsWith('#/projekt/') && currentProjectDetailId) await loadProjectDetail(currentProjectDetailId);
  } else if (entityType === 'task') {
    if (hash.startsWith('#/aufgaben')) await loadTasks();
    else if (hash.startsWith('#/firma/') && currentCompanyDetailId) await loadCompanyTasks(currentCompanyDetailId);
    else if (hash.startsWith('#/projekt/') && currentProjectDetailId) await loadProjectTasks(currentProjectDetailId);
    else if (hash.startsWith('#/kontakt/') && currentContactDetailId) await loadContactTasks(currentContactDetailId);
    updateTaskBadge();
  }
}

/* ───────────────────────────────────────────────
   DUPLICATE-HANDLER pro Entität
   ─────────────────────────────────────────────── */

/** Firma duplizieren: gleiche Stammdaten + Name "X (Kopie)", keine Kontakte/Termine/Projekte. */
async function duplicateCompany(sourceId) {
  const { data: src, error } = await db.from('companies').select('*').is('deleted_at', null).eq('id', sourceId).single();
  if (error || !src) throw new Error(error?.message || 'Firma nicht gefunden');

  const payload = {
    name: (src.name || 'Firma') + ' (Kopie)',
    typ_id: src.typ_id,
    branche: src.branche,
    abc_klassifizierung: src.abc_klassifizierung,
    strasse: src.strasse,
    plz: src.plz,
    stadt: src.stadt,
    land: src.land,
    telefon: src.telefon,
    email: src.email,
    website: src.website,
    notizen: src.notizen,
    erstellt_von: currentProfile?.id || null
  };
  const { error: insErr } = await db.from('companies').insert(payload);
  if (insErr) throw new Error(insErr.message);

  showToast('Firma dupliziert: ' + payload.name);
  await refreshAfterEntityChange('company');
}

/** Kontakt duplizieren: gleiche Firma, Nachname mit "(Kopie)". */
async function duplicateContact(sourceId) {
  const { data: src, error } = await db.from('contacts').select('*').is('deleted_at', null).eq('id', sourceId).single();
  if (error || !src) throw new Error(error?.message || 'Kontakt nicht gefunden');

  const payload = {
    vorname: src.vorname,
    nachname: (src.nachname || 'Kontakt') + ' (Kopie)',
    position: src.position,
    company_id: src.company_id,
    telefon: src.telefon,
    email: src.email,
    notizen: src.notizen,
    erstellt_von: currentProfile?.id || null
  };
  const { error: insErr } = await db.from('contacts').insert(payload);
  if (insErr) throw new Error(insErr.message);

  showToast('Kontakt dupliziert.');
  await refreshAfterEntityChange('contact');
}

/** Termin duplizieren: gleiche Daten inkl. Datum + "(Kopie)" im Titel, OHNE deployment_id-Kopplung. */
async function duplicateAppointment(sourceId) {
  const { data: src, error } = await db.from('appointments').select('*').is('deleted_at', null).eq('id', sourceId).single();
  if (error || !src) throw new Error(error?.message || 'Termin nicht gefunden');

  const payload = {
    titel: (src.titel || 'Termin') + ' (Kopie)',
    datum: src.datum,
    uhrzeit_von: src.uhrzeit_von,
    uhrzeit_bis: src.uhrzeit_bis,
    status: 'geplant',  // Kopie startet immer neu
    typ_id: src.typ_id,
    company_id: src.company_id,
    contact_id: src.contact_id,
    project_id: src.project_id,
    deployment_id: null, // Kopplung NICHT übernehmen
    ort: src.ort,
    notizen: src.notizen,
    erstellt_von: currentProfile?.id || null
  };
  const { error: insErr } = await db.from('appointments').insert(payload);
  if (insErr) throw new Error(insErr.message);

  showToast('Termin dupliziert.');
  await refreshAfterEntityChange('appointment');
}

/** Projekt duplizieren: gleiche Header-Daten + "(Kopie)", OHNE Einsätze/Termine. */
async function duplicateProject(sourceId) {
  const { data: src, error } = await db.from('projects').select('*').is('deleted_at', null).eq('id', sourceId).single();
  if (error || !src) throw new Error(error?.message || 'Projekt nicht gefunden');

  const payload = {
    name: (src.name || 'Projekt') + ' (Kopie)',
    status: 'Angebot',  // Kopie startet immer frisch
    company_id: src.company_id,
    hauptkontakt_id: src.hauptkontakt_id,
    verantwortlicher_id: src.verantwortlicher_id,
    startdatum: src.startdatum,
    enddatum: src.enddatum,
    geschaetzter_umsatz: src.geschaetzter_umsatz || 0,
    beschreibung: src.beschreibung,
    notizen: src.notizen,
    erstellt_von: currentProfile?.id || null
  };
  const { error: insErr } = await db.from('projects').insert(payload);
  if (insErr) throw new Error(insErr.message);

  showToast('Projekt dupliziert.');
  await refreshAfterEntityChange('project');
}

/** Einsatz duplizieren: gleiche Daten + "(Kopie)", OHNE Techniker/Termin-Kopplung. */
async function duplicateDeployment(sourceId) {
  const { data: src, error } = await db.from('deployments').select('*').is('deleted_at', null).eq('id', sourceId).single();
  if (error || !src) throw new Error(error?.message || 'Einsatz nicht gefunden');

  const payload = {
    titel: (src.titel || 'Einsatz') + ' (Kopie)',
    datum_von: src.datum_von,
    datum_bis: src.datum_bis,
    uhrzeit_von: src.uhrzeit_von,
    uhrzeit_bis: src.uhrzeit_bis,
    status: 'Geplant',  // Kopie startet frisch
    company_id: src.company_id,
    project_id: src.project_id,
    service_id: src.service_id,
    menge: src.menge || 1,
    einzelpreis: src.einzelpreis || 0,
    ort: src.ort,
    externe_techniker: src.externe_techniker,
    beschreibung: src.beschreibung,
    notizen: src.notizen,
    erstellt_von: currentProfile?.id || null
  };
  const { error: insErr } = await db.from('deployments').insert(payload);
  if (insErr) throw new Error(insErr.message);

  showToast('Einsatz dupliziert.');
  await refreshAfterEntityChange('deployment');
}

/* ───────────────────────────────────────────────
   COPY-TO-CLIPBOARD-HANDLER (für alle Entitäten)
   ─────────────────────────────────────────────── */

/** Termin-Daten formatiert in Zwischenablage. */
async function copyAppointmentById(id, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  try {
    const { data: a, error } = await db.from('appointments')
      .select('*, companies(name), contacts(vorname, nachname)').is('deleted_at', null)
      .eq('id', id).single();
    if (error || !a) throw new Error(error?.message || 'Termin nicht gefunden');

    const lines = [];
    lines.push(a.titel || '(ohne Titel)');
    if (a.datum) {
      let zeit = formatDateDE(a.datum);
      if (a.uhrzeit_von && a.uhrzeit_bis) zeit += `, ${a.uhrzeit_von.substring(0,5)}–${a.uhrzeit_bis.substring(0,5)} Uhr`;
      else if (a.uhrzeit_von) zeit += `, ab ${a.uhrzeit_von.substring(0,5)} Uhr`;
      lines.push(zeit);
    }
    if (a.companies?.name) lines.push('Firma: ' + a.companies.name);
    if (a.contacts) {
      const name = [a.contacts.vorname, a.contacts.nachname].filter(Boolean).join(' ');
      if (name) lines.push('Kontakt: ' + name);
    }
    if (a.ort) lines.push('Ort: ' + a.ort);
    if (a.notizen) lines.push('Notizen: ' + a.notizen);

    copyTextSync(lines.join('\n'), 'Termin-Daten kopiert.');
  } catch (e) {
    showToast('Kopieren fehlgeschlagen: ' + e.message, true);
  }
}

/** Projekt-Daten formatiert in Zwischenablage. */
async function copyProjectById(id, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  try {
    const { data: p, error } = await db.from('projects')
      .select('*, companies(name), contacts:hauptkontakt_id(vorname, nachname)').is('deleted_at', null)
      .eq('id', id).single();
    if (error || !p) throw new Error(error?.message || 'Projekt nicht gefunden');

    const lines = [];
    lines.push(p.name);
    lines.push('Status: ' + (p.status || '—'));
    if (p.companies?.name) lines.push('Firma: ' + p.companies.name);
    if (p.contacts) {
      const name = [p.contacts.vorname, p.contacts.nachname].filter(Boolean).join(' ');
      if (name) lines.push('Hauptkontakt: ' + name);
    }
    if (p.startdatum) lines.push('Start: ' + formatDateDE(p.startdatum));
    if (p.enddatum)   lines.push('Ende: '  + formatDateDE(p.enddatum));
    if (p.geschaetzter_umsatz) lines.push('Geschätzter Umsatz: ' + formatPreis(p.geschaetzter_umsatz));
    if (p.beschreibung) lines.push('', p.beschreibung);

    copyTextSync(lines.join('\n'), 'Projekt-Daten kopiert.');
  } catch (e) {
    showToast('Kopieren fehlgeschlagen: ' + e.message, true);
  }
}

/** Einsatz-Daten formatiert in Zwischenablage. */
async function copyDeploymentById(id, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  try {
    const { data: d, error } = await db.from('deployments')
      .select('*, companies(name), projects(name), services(name, einheit)').is('deleted_at', null)
      .eq('id', id).single();
    if (error || !d) throw new Error(error?.message || 'Einsatz nicht gefunden');

    const lines = [];
    lines.push(d.titel || '(ohne Titel)');
    lines.push('Status: ' + (d.status || '—'));
    if (d.companies?.name) lines.push('Firma: ' + d.companies.name);
    if (d.projects?.name) lines.push('Projekt: ' + d.projects.name);
    if (d.services?.name) lines.push('Leistung: ' + d.services.name);
    if (d.datum_von && d.datum_bis) {
      if (d.datum_von === d.datum_bis) lines.push('Datum: ' + formatDateDE(d.datum_von));
      else lines.push('Zeitraum: ' + formatDateDE(d.datum_von) + ' – ' + formatDateDE(d.datum_bis));
    } else {
      lines.push('Ungeplant');
    }
    if (d.uhrzeit_von && d.uhrzeit_bis) lines.push('Uhrzeit: ' + d.uhrzeit_von.substring(0,5) + '–' + d.uhrzeit_bis.substring(0,5));
    if (d.ort) lines.push('Ort: ' + d.ort);
    if (d.beschreibung) lines.push('', d.beschreibung);

    copyTextSync(lines.join('\n'), 'Einsatz-Daten kopiert.');
  } catch (e) {
    showToast('Kopieren fehlgeschlagen: ' + e.message, true);
  }
}

async function copyToClipboard(text, toastMsg = 'In Zwischenablage kopiert.') {
  // Diese Version wird für Kontext ohne User-Gesture-Druck verwendet (z.B. Credentials-Modal)
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(toastMsg);
      return true;
    }
    return copyTextSync(text, toastMsg);
  } catch (e) {
    // Fallback auf synchrone Variante
    return copyTextSync(text, toastMsg);
  }
}

/**
 * Synchron kopieren - iOS-kompatibel, funktioniert nur wenn direkt
 * aus einem User-Click-Event aufgerufen (kein async/await davor!).
 */
function copyTextSync(text, toastMsg = 'In Zwischenablage kopiert.') {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '0';
    ta.style.width = '1px';
    ta.style.height = '1px';
    ta.style.opacity = '0';
    ta.style.fontSize = '16px'; // verhindert iOS-Zoom
    document.body.appendChild(ta);

    // iOS-Trick: Range + Selection für contenteditable workaround
    ta.contentEditable = 'true';
    ta.readOnly = false;
    const range = document.createRange();
    range.selectNodeContents(ta);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    ta.setSelectionRange(0, 999999);
    ta.focus();
    ta.select();

    const ok = document.execCommand('copy');
    document.body.removeChild(ta);

    if (!ok) throw new Error('Kopierbefehl fehlgeschlagen');
    showToast(toastMsg);
    return true;
  } catch (e) {
    showToast('Kopieren nicht möglich.', true);
    return false;
  }
}

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

/**
 * SYNCHRON - darf keine async-Calls vor dem Copy haben (iOS-Bedingung).
 * Greift auf Caches zu: companiesCache, companyContactsMap.
 */
function copyCompanyById(companyId, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  const company = companiesCache.find(c => c.id === companyId);
  if (!company) {
    showToast('Firma noch nicht geladen. Bitte kurz warten und erneut versuchen.', true);
    return;
  }
  const contacts = companyContactsMap[companyId] || [];
  const text = formatCompanyBlock(company, contacts);
  copyTextSync(text, 'Firmendaten kopiert.');
}

/**
 * SYNCHRON - sucht Kontakt in contactsCache oder companyContactsMap.
 */
function copyContactById(contactId, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  let contact = null;

  // Erst contactsCache (hat meist .company dabei)
  if (contactsCache.length > 0) {
    contact = contactsCache.find(c => c.id === contactId);
  }

  // Sonst aus companyContactsMap zusammenbauen
  if (!contact) {
    for (const [cid, list] of Object.entries(companyContactsMap)) {
      const hit = list.find(c => c.id === contactId);
      if (hit) {
        const company = companiesCache.find(c => c.id === cid);
        contact = { ...hit, company };
        break;
      }
    }
  }

  if (!contact) {
    showToast('Kontakt noch nicht geladen. Bitte kurz warten und erneut versuchen.', true);
    return;
  }
  const text = formatContactBlock(contact);
  copyTextSync(text, 'Kontakt kopiert.');
}

// ═══════════════════════════════════════════════════════════
//  DATUM/ZEIT-HILFSFUNKTIONEN
// ═══════════════════════════════════════════════════════════

function parseLocalDate(isoDateStr) {
  const [y, m, d] = isoDateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

/** Kompaktere Version für Firmen-Liste: "Di 21.04.26" */
function formatDateCompact(isoDateStr) {
  if (!isoDateStr) return '—';
  try {
    const d = parseLocalDate(isoDateStr);
    const wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(2);
    return `${wd} ${day}.${month}.${year}`;
  } catch {
    return isoDateStr;
  }
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

function appointmentStatusBg(s)    { return s === 'geplant' ? '#eff6ff' : '#f0fdf4'; }
function appointmentStatusColor(s) { return s === 'geplant' ? '#1d4ed8' : '#16a34a'; }
function appointmentStatusLabel(s) { return s === 'geplant' ? 'Geplant' : 'Durchgeführt'; }

/** Termin-Typ-Icons (v1.34). Fuzzy-Match auf den Lookup-Wert — unbekannte Typen
 *  fallen auf 📅 zurück. Reihenfolge in der Map ist bewusst: längere Begriffe
 *  vor kürzeren, damit z. B. „Follow-up" nicht von „up" verschluckt wird. */
const TERMIN_TYPE_ICON_MAP = [
  ['kickoff',       '🚀'],
  ['kick-off',      '🚀'],
  ['workshop',      '🛠️'],
  ['präsentation',  '📊'],
  ['praesentation', '📊'],
  ['schulung',      '🎓'],
  ['training',      '🎓'],
  ['follow',        '🔁'],
  ['beratung',      '💬'],
  ['abstimmung',    '📋'],
  ['akquise',       '🎯'],
  ['meeting',       '🤝'],
  ['vor ort',       '📍'],
  ['online',        '💻'],
  ['call',          '📞'],
  ['telefonat',     '📞'],
  ['videocall',     '🎥'],
  ['demo',          '🎬'],
  ['messe',         '🏢']
];

function terminTypIcon(wert) {
  if (!wert) return '📅';
  const lower = String(wert).toLowerCase();
  for (const [key, icon] of TERMIN_TYPE_ICON_MAP) {
    if (lower.includes(key)) return icon;
  }
  return '📅';
}

/** Füllt den Icon-Picker im Termin-Modal mit Buttons pro Typ. Der Dropdown bleibt
 *  als Fallback und als „Source of Truth" für den Wert (v1.34). */
function renderTerminTypIconsPicker() {
  const container = document.getElementById('t-typ-icons');
  const select = document.getElementById('t-typ');
  if (!container || !select) return;
  container.innerHTML = [...select.options]
    .filter(o => o.value)
    .map(o => `
      <button type="button" class="termin-typ-icon-btn" data-typ-id="${esc(o.value)}"
              onclick="selectTerminTypIcon('${esc(o.value)}')">
        <span class="termin-typ-icon-emoji">${terminTypIcon(o.textContent)}</span>
        ${esc(o.textContent)}
      </button>`).join('');
  updateTerminTypIconSelection();
  select.onchange = updateTerminTypIconSelection;
}

function selectTerminTypIcon(typId) {
  const select = document.getElementById('t-typ');
  if (!select) return;
  select.value = typId;
  updateTerminTypIconSelection();
}

function updateTerminTypIconSelection() {
  const select = document.getElementById('t-typ');
  const container = document.getElementById('t-typ-icons');
  if (!select || !container) return;
  const currentId = select.value;
  container.querySelectorAll('.termin-typ-icon-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.typId === currentId);
  });
}

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
  if (name === 'programs') loadPrograms();
  if (name === 'companies') loadCompanies();
  if (name === 'contacts') loadContacts();
  if (name === 'appointments') loadAppointments();
  if (name === 'tasks') loadTasks();
  if (name === 'projects') loadProjects();
  if (name === 'deployments') loadDeployments();
}

function setMobileNav(pageName) {
  document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.remove('active'));

  if (pageName === 'companies' || pageName === 'company-detail') {
    document.getElementById('m-nav-companies')?.classList.add('active');
  } else if (pageName === 'appointments') {
    document.getElementById('m-nav-appointments')?.classList.add('active');
  } else if (pageName === 'tasks') {
    document.getElementById('m-nav-tasks')?.classList.add('active');
  } else {
    // contacts, contact-detail, projects, project-detail, deployments, users, services, lookups, programs → Mehr-Tab
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
  let hash;
  if (page === 'firma' && param) {
    hash = `#/firma/${param}`;
  } else if (page === 'projekt' && param) {
    hash = `#/projekt/${param}`;
  } else if (page === 'kontakt' && param) {
    hash = `#/kontakt/${param}`;
  } else if (page === 'appointments' && param && typeof param === 'object' && param.firma) {
    hash = `#/termine?firma=${param.firma}`;
  } else if (page === 'appointments' && param && typeof param === 'object' && param.projekt) {
    hash = `#/termine?projekt=${param.projekt}`;
  } else if (page === 'companies') {
    hash = '#/firmen';
  } else if (page === 'contacts') {
    hash = '#/kontakte';
  } else if (page === 'appointments') {
    hash = '#/termine';
  } else if (page === 'tasks') {
    hash = '#/aufgaben';
  } else if (page === 'projects') {
    hash = '#/projekte';
  } else if (page === 'deployments') {
    hash = '#/einsaetze';
  } else if (page === 'users') {
    hash = '#/benutzer';
  } else if (page === 'services') {
    hash = '#/leistungen';
  } else if (page === 'lookups') {
    hash = '#/stammdaten';
  } else if (page === 'programs') {
    hash = '#/programme';
  } else {
    hash = '#/firmen';
  }
  window.location.hash = hash;
}

function parseHashQuery(hashPart) {
  const idx = hashPart.indexOf('?');
  if (idx < 0) return { path: hashPart, params: {} };
  const path = hashPart.substring(0, idx);
  const query = hashPart.substring(idx + 1);
  const params = {};
  query.split('&').forEach(pair => {
    if (!pair) return;
    const [k, v] = pair.split('=');
    params[decodeURIComponent(k)] = decodeURIComponent(v || '');
  });
  return { path, params };
}

let _currentDetailKey = null;

function handleHashChange() {
  if (document.getElementById('app').style.display === 'none') return;
  if (inPasswordRecovery) return;

  const hash = window.location.hash || '';
  const { path } = parseHashQuery(hash);

  // Detail-Seiten: Query-Params (z.B. ?tab=) strippen und Re-Load vermeiden,
  // wenn derselbe Datensatz angezeigt wird (v1.23.0).
  if (path.startsWith('#/firma/')) {
    const id = path.slice('#/firma/'.length);
    if (id) {
      const key = 'firma:' + id;
      if (_currentDetailKey !== key) {
        _currentDetailKey = key;
        loadCompanyDetail(id);
      } else {
        // nur Tab-Wechsel innerhalb der geladenen Seite
        switchDetailTab('company', getActiveDetailTab());
      }
      return;
    }
  }

  if (path.startsWith('#/projekt/')) {
    const id = path.slice('#/projekt/'.length);
    if (id) {
      const key = 'projekt:' + id;
      if (_currentDetailKey !== key) {
        _currentDetailKey = key;
        loadProjectDetail(id);
      } else {
        switchDetailTab('project', getActiveDetailTab());
      }
      return;
    }
  }

  if (path.startsWith('#/kontakt/')) {
    const id = path.slice('#/kontakt/'.length);
    if (id) {
      const key = 'kontakt:' + id;
      if (_currentDetailKey !== key) {
        _currentDetailKey = key;
        loadContactDetail(id);
      } else {
        switchDetailTab('contact', getActiveDetailTab());
      }
      return;
    }
  }

  // Anderen Seiten: Detail-Key zurücksetzen
  _currentDetailKey = null;

  if (hash.startsWith('#/termine')) {
    const { params } = parseHashQuery(hash);
    if (params.firma)   pendingAppointmentsFilter = { firma: params.firma };
    if (params.projekt) pendingAppointmentsFilter = { projekt: params.projekt };
    showPage('appointments');
    return;
  }

  if (hash.startsWith('#/aufgaben')) {
    const { params } = parseHashQuery(hash);
    if (params.scope)     pendingTasksFilter = { scope: params.scope };
    if (params.firma)     pendingTasksFilter = { firma: params.firma };
    if (params.projekt)   pendingTasksFilter = { projekt: params.projekt };
    if (params.assignee)  pendingTasksFilter = { assignee: params.assignee };
    showPage('tasks');
    return;
  }

  if (hash === '#/firmen' || hash === '' || hash === '#') { showPage('companies'); return; }
  if (hash === '#/kontakte')   { showPage('contacts'); return; }
  if (hash === '#/projekte')   { showPage('projects'); return; }
  if (hash === '#/einsaetze')  { showPage('deployments'); return; }
  if (hash === '#/benutzer')   { showPage('users'); return; }
  if (hash === '#/leistungen') { showPage('services'); return; }
  if (hash === '#/stammdaten') { showPage('lookups'); return; }
  if (hash === '#/programme')  { showPage('programs'); return; }

  // Unbekannte Route → 404
  const lbl = document.getElementById('page-404-hash');
  if (lbl) lbl.textContent = hash || '(leer)';
  showPage('404');
}

// ── SCREEN-WECHSEL ───────────────────────────────────────────
function hideAllScreens() {
  hideFab?.();
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('reset-screen').style.display = 'none';
  document.getElementById('recovery-screen').style.display = 'none';
  document.getElementById('mustchange-screen').style.display = 'none';
  document.getElementById('app').style.display = 'none';
}

function showLoginScreen()    { hideAllScreens(); document.getElementById('auth-screen').style.display = 'flex'; hideCalendarBar(); }
function showResetScreen()    { hideAllScreens(); document.getElementById('reset-screen').style.display = 'flex'; }
function showRecoveryScreen() { hideAllScreens(); document.getElementById('recovery-screen').style.display = 'flex'; setTimeout(() => document.getElementById('recovery-1').focus(), 100); }
function showMustChangeScreen() { hideAllScreens(); document.getElementById('mustchange-screen').style.display = 'flex'; setTimeout(() => document.getElementById('mustchange-1').focus(), 100); }
function showApp()            { hideAllScreens(); document.getElementById('app').style.display = 'flex'; showFab?.(); }

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
  updateTaskBadge();
  initCalendarBar();  // v1.32: Kalender-Bar nach Login initialisieren

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
    updateTaskBadge();
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

    const nameHtml = canAdminister
      ? `<div class="cell-link" onclick="openUserModal('edit', '${esc(u.id)}')">${esc(u.name)}</div>`
      : `<div style="font-weight:500">${esc(u.name)}</div>`;

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${esc(ini(u.name))}</div>
            <div>
              ${nameHtml}
              ${isMe ? '<div style="font-size:11px;color:var(--muted)">Das bist du</div>' : ''}
            </div>
          </div>
        </td>
        <td style="color:var(--muted)">${esc(u.email)}</td>
        <td><span class="badge" style="background:${roleBg};color:${roleColor}">${esc(u.roles?.name || '—')}</span></td>
        <td><span class="badge" style="background:${statusBg(u.status)};color:${statusColor(u.status)}">${esc(statusLabel(u.status))}</span></td>
        <td class="col-action" style="text-align:right"><div class="btn-row" style="justify-content:flex-end">${actions}</div></td>
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
  const ok = await confirmDialog({
    title: 'Benutzer löschen?',
    message: 'Der Benutzer wird <strong>endgültig</strong> gelöscht (Supabase Auth + Profil). Diese Aktion kann nicht rückgängig gemacht werden.',
    confirmLabel: 'Endgültig löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

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
    const hasKategorie = !!s.kategorie;
    const katFarbe = s.kategorie?.farbe || '#6b7280';
    const katWert  = s.kategorie?.wert  || '—';
    const katHtml  = hasKategorie
      ? `<span class="badge" style="background:${esc(katFarbe)}22;color:${esc(katFarbe)}">${esc(katWert)}</span>`
      : `<span style="color:var(--muted)">—</span>`;
    const aktivBg  = s.ist_aktiv ? '#f0fdf4' : '#f3f4f6';
    const aktivCol = s.ist_aktiv ? '#16a34a' : '#6b7280';
    const aktivTxt = s.ist_aktiv ? 'Aktiv' : 'Archiviert';
    const editBtn = canEdit ? `<button class="btn btn-sm" onclick="openServiceModal('edit', '${s.id}')">Bearbeiten</button>` : '';

    const nameHtml = canEdit
      ? `<div class="cell-link" onclick="openServiceModal('edit', '${esc(s.id)}')">${esc(s.name)}</div>`
      : `<div style="font-weight:500">${esc(s.name)}</div>`;

    return `
      <tr>
        <td>
          ${nameHtml}
          ${s.beschreibung ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(s.beschreibung)}</div>` : ''}
        </td>
        <td>${katHtml}</td>
        <td style="color:var(--muted)">${esc(s.einheit || '—')}</td>
        <td>${esc(formatPreis(s.standardpreis))}</td>
        <td><span class="badge" style="background:${aktivBg};color:${aktivCol}">${aktivTxt}</span></td>
        <td class="col-action" style="text-align:right">${editBtn}</td>
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
  document.getElementById('s-uhrzeit-von').value = '';
  document.getElementById('s-uhrzeit-bis').value = '';

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
    document.getElementById('s-uhrzeit-von').value = data.standard_uhrzeit_von ? data.standard_uhrzeit_von.substring(0, 5) : '';
    document.getElementById('s-uhrzeit-bis').value = data.standard_uhrzeit_bis ? data.standard_uhrzeit_bis.substring(0, 5) : '';
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
  const uhrzeit_von   = document.getElementById('s-uhrzeit-von').value;
  const uhrzeit_bis   = document.getElementById('s-uhrzeit-bis').value;
  const btn           = document.getElementById('s-save-btn');

  if (!name) { showToast('Bitte Name eingeben.', true); return; }
  if (!kategorie_id) { showToast('Bitte Kategorie auswählen.', true); return; }
  if (!einheit) { showToast('Bitte Einheit auswählen.', true); return; }

  const standardpreis = preisRaw === '' ? 0 : Number(preisRaw);
  if (Number.isNaN(standardpreis) || standardpreis < 0) { showToast('Preis muss eine Zahl ≥ 0 sein.', true); return; }

  if (uhrzeit_von && uhrzeit_bis && uhrzeit_von >= uhrzeit_bis) {
    showToast('„Standard-Uhrzeit bis" muss nach „Standard-Uhrzeit von" liegen.', true); return;
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
      ist_aktiv,
      standard_uhrzeit_von: uhrzeit_von || null,
      standard_uhrzeit_bis: uhrzeit_bis || null
    };
    let error;
    if (editingServiceId) { ({ error } = await db.from('services').update(payload).eq('id', editingServiceId)); }
    else { ({ error } = await db.from('services').insert(payload)); }
    if (error) throw new Error(error.message);

    // Cache invalidieren, damit neue/geänderte Zeiten beim nächsten Einsatz-Modal da sind
    servicesCache = [];

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
  const ok = await confirmDialog({
    title: 'Leistung löschen?',
    message: 'Falls die Leistung schon in Einsätzen oder Terminen verwendet wird, archiviere sie besser (über den „Aktiv"-Schalter), statt sie zu löschen.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

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
    select.innerHTML = kategorien.map(k => `<option value="${esc(k)}">${esc(kategorieLabel(k))}</option>`).join('');
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
        <td><div class="cell-link" onclick="openLookupModal('edit', '${esc(lv.id)}')">${esc(lv.wert)}</div></td>
        <td>
          <span class="color-dot" style="background:${esc(lv.farbe || '#6b7280')}"></span>
          <span style="font-family:'SF Mono',Menlo,monospace;font-size:12px;color:var(--muted)">${esc(lv.farbe || '#6b7280')}</span>
        </td>
        <td style="color:var(--muted)">${esc(String(lv.reihenfolge ?? 0))}</td>
        <td><span class="badge" style="background:${aktivBg};color:${aktivCol}">${aktivTxt}</span></td>
        <td class="col-action" style="text-align:right"><button class="btn btn-sm" onclick="openLookupModal('edit', '${esc(lv.id)}')">Bearbeiten</button></td>
      </tr>`;
  }).join('');
}

async function openLookupModal(mode, lookupId = null) {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Aktion.', true); return; }
  editingLookupId = lookupId;

  const kategorien = await loadLookupKategorien();
  const kSelect = document.getElementById('l-kategorie');
  let options = kategorien.map(k => `<option value="${esc(k)}">${esc(kategorieLabel(k))}</option>`).join('');
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
  const ok = await confirmDialog({
    title: 'Wert löschen?',
    message: 'Wenn dieser Wert noch referenziert wird, verhindert die DB das Löschen. Dann besser archivieren (Aktiv-Schalter ausschalten).',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

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
//  MITGLIEDSCHAFTS-PROGRAMME (v1.12.0)
// ═══════════════════════════════════════════════════════════

let editingProgramId = null;

/** Liste der Programme laden und rendern. */
async function loadPrograms() {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Seite.', true); return; }

  const tbody = document.getElementById('programs-table-body');
  tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade Programme ...</div></td></tr>';

  const { data: programs, error } = await db.from('membership_programs')
    .select('*, membership_program_benefits(id)')
    .order('name');
  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    return;
  }

  if (!programs || programs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Noch keine Programme angelegt. Klicke oben auf „+ Neues Programm".</div></td></tr>';
    return;
  }

  tbody.innerHTML = programs.map(p => {
    const anzahlBenefits = (p.membership_program_benefits || []).length;
    const statusBadge = p.ist_aktiv
      ? '<span class="badge" style="background:#dcfce7;color:#16a34a">Aktiv</span>'
      : '<span class="badge" style="background:#f3f4f6;color:#6b7280">Archiviert</span>';

    return `
      <tr>
        <td>
          <div class="cell-link" onclick="openProgramModal('edit', '${esc(p.id)}')">${esc(p.name)}</div>
          ${p.beschreibung ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(p.beschreibung)}</div>` : ''}
        </td>
        <td class="col-tablet" style="color:var(--muted)">${p.laufzeit_monate} Monate</td>
        <td class="col-tablet">${esc(formatPreis(p.standard_preis || 0))}</td>
        <td class="col-desktop" style="color:var(--muted)">${anzahlBenefits} Bonus${anzahlBenefits === 1 ? '' : 'se'}</td>
        <td>${statusBadge}</td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="openProgramModal('edit', '${esc(p.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');
}

/** Programm-Modal öffnen (new oder edit). */
async function openProgramModal(mode, programId = null) {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Aktion.', true); return; }
  editingProgramId = programId;

  // Services-Cache sicherstellen (für Benefit-Service-Dropdown)
  await loadServicesCache();

  // Felder zurücksetzen
  document.getElementById('pr-name').value = '';
  document.getElementById('pr-beschreibung').value = '';
  document.getElementById('pr-laufzeit').value = '12';
  document.getElementById('pr-preis').value = '';
  document.getElementById('pr-praefix').value = '';
  document.getElementById('pr-aktiv').value = 'true';

  const benefitsContainer = document.getElementById('pr-benefits-container');
  benefitsContainer.innerHTML = '';

  if (mode === 'new') {
    document.getElementById('modal-program-title').textContent = 'Neues Programm';
    document.getElementById('pr-save-btn').textContent = 'Anlegen';
    document.getElementById('pr-delete-btn').style.display = 'none';
    // Eine leere Benefit-Row als Startpunkt
    addBenefitRow();
  } else {
    document.getElementById('modal-program-title').textContent = 'Programm bearbeiten';
    document.getElementById('pr-save-btn').textContent = 'Speichern';
    document.getElementById('pr-delete-btn').style.display = 'block';

    const { data, error } = await db.from('membership_programs')
      .select('*, membership_program_benefits(*)')
      .eq('id', programId).single();
    if (error || !data) {
      showToast('Programm konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true);
      editingProgramId = null;
      return;
    }

    document.getElementById('pr-name').value = data.name || '';
    document.getElementById('pr-beschreibung').value = data.beschreibung || '';
    document.getElementById('pr-laufzeit').value = data.laufzeit_monate || 12;
    document.getElementById('pr-preis').value = data.standard_preis ?? '';
    document.getElementById('pr-praefix').value = data.mitgliedsnummer_praefix || '';
    document.getElementById('pr-aktiv').value = data.ist_aktiv ? 'true' : 'false';

    const benefits = (data.membership_program_benefits || []).sort((a, b) => (a.reihenfolge || 0) - (b.reihenfolge || 0));
    if (benefits.length === 0) {
      addBenefitRow();
    } else {
      benefits.forEach(b => addBenefitRow(b));
    }
  }

  document.getElementById('modal-program').classList.add('open');
  setTimeout(() => document.getElementById('pr-name').focus(), 100);
}

function closeProgramModal() {
  document.getElementById('modal-program').classList.remove('open');
  editingProgramId = null;
}

/** Neue Benefit-Zeile im Modal einfügen. Optional mit Daten vorbefüllen. */
function addBenefitRow(data = null) {
  const container = document.getElementById('pr-benefits-container');
  const row = document.createElement('div');
  row.className = 'benefit-row';
  row.dataset.benefitId = data?.id || '';

  const serviceOptions = '<option value="">— Kein Service (Freitext) —</option>'
    + servicesCache.map(s => `<option value="${esc(s.id)}"${data?.service_id === s.id ? ' selected' : ''}>${esc(s.name)}</option>`).join('');

  row.innerHTML = `
    <div class="benefit-row-titel">
      <input type="text" class="benefit-titel" placeholder="Bonus-Titel (z. B. Technikerbesuch)" value="${esc(data?.titel || '')}">
      <select class="benefit-service">${serviceOptions}</select>
    </div>
    <input type="number" class="benefit-menge" placeholder="Menge" min="1" step="1" value="${data?.menge_pro_laufzeit || 1}" title="Wie oft pro Laufzeit">
    <button type="button" class="benefit-remove" onclick="removeBenefitRow(this)" title="Bonus entfernen">
      ${ICON_DELETE}
    </button>
  `;

  // Auto-fill Titel aus Service wenn Service gewählt wird und Titel leer
  const serviceSelect = row.querySelector('.benefit-service');
  const titelInput = row.querySelector('.benefit-titel');
  serviceSelect.onchange = () => {
    if (!titelInput.value.trim() && serviceSelect.value) {
      const opt = serviceSelect.options[serviceSelect.selectedIndex];
      titelInput.value = opt?.textContent || '';
    }
  };

  container.appendChild(row);
}

function removeBenefitRow(btn) {
  const row = btn.closest('.benefit-row');
  const container = document.getElementById('pr-benefits-container');
  row.remove();
  // Wenn nach dem Entfernen keine Row mehr da ist, eine leere anlegen
  if (container.children.length === 0) addBenefitRow();
}

/** Programm + Benefits atomar speichern. */
async function saveProgram() {
  const name         = document.getElementById('pr-name').value.trim();
  const beschreibung = document.getElementById('pr-beschreibung').value.trim();
  const laufzeit     = parseInt(document.getElementById('pr-laufzeit').value, 10);
  const preisRaw     = document.getElementById('pr-preis').value;
  const praefix      = document.getElementById('pr-praefix').value.trim();
  const ist_aktiv    = document.getElementById('pr-aktiv').value === 'true';
  const btn          = document.getElementById('pr-save-btn');

  if (!name) { showToast('Bitte Name eingeben.', true); return; }
  if (!laufzeit || laufzeit < 1) { showToast('Laufzeit muss mindestens 1 Monat sein.', true); return; }

  const standard_preis = preisRaw === '' ? 0 : Number(preisRaw);
  if (Number.isNaN(standard_preis) || standard_preis < 0) {
    showToast('Preis muss eine Zahl ≥ 0 sein.', true); return;
  }

  // Benefits aus dem DOM einsammeln und validieren
  const rows = document.querySelectorAll('#pr-benefits-container .benefit-row');
  const benefits = [];
  let reihenfolge = 0;
  for (const row of rows) {
    const titel      = row.querySelector('.benefit-titel').value.trim();
    const service_id = row.querySelector('.benefit-service').value || null;
    const mengeRaw   = row.querySelector('.benefit-menge').value;
    const menge      = Number(mengeRaw);

    // Leere Zeilen ignorieren
    if (!titel && !service_id) continue;

    if (!titel) { showToast('Jeder Bonus braucht einen Titel (oder wähle einen Service).', true); return; }
    if (!mengeRaw || Number.isNaN(menge) || menge < 1) {
      showToast(`Menge bei Bonus „${titel}" muss ≥ 1 sein.`, true); return;
    }

    benefits.push({
      titel,
      service_id,
      menge_pro_laufzeit: menge,
      reihenfolge: reihenfolge++
    });
  }

  btn.disabled = true;
  btn.textContent = editingProgramId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      name,
      beschreibung: beschreibung || null,
      laufzeit_monate: laufzeit,
      standard_preis,
      mitgliedsnummer_praefix: praefix || null,
      ist_aktiv,
      erstellt_von: currentProfile?.id || null
    };

    let programId = editingProgramId;

    if (editingProgramId) {
      const { error } = await db.from('membership_programs').update(payload).eq('id', editingProgramId);
      if (error) throw new Error(error.message);
    } else {
      const { data, error } = await db.from('membership_programs').insert(payload).select('id').single();
      if (error) throw new Error(error.message);
      programId = data.id;
    }

    // Benefits: simpler Replace-Approach - erst alle alten löschen, dann neue einfügen.
    // Bei Edit-Mode: bestehende Entitlements, die auf diese Benefits verweisen, sind in v1.12 noch nicht existent.
    // Ab v1.13 müssen wir smarter vorgehen (updaten statt replacen), damit laufende Mitgliedschaften nicht brechen.
    await db.from('membership_program_benefits').delete().eq('program_id', programId);

    if (benefits.length > 0) {
      const benefitRows = benefits.map(b => ({ ...b, program_id: programId }));
      const { error: bErr } = await db.from('membership_program_benefits').insert(benefitRows);
      if (bErr) throw new Error('Bonis konnten nicht gespeichert werden: ' + bErr.message);
    }

    closeProgramModal();
    showToast(editingProgramId ? 'Programm aktualisiert.' : 'Programm angelegt.');
    await loadPrograms();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingProgramId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteProgram() {
  if (!editingProgramId) return;
  const ok = await confirmDialog({
    title: 'Programm löschen?',
    message: 'Alle zugehörigen Bonis werden mitgelöscht. Bei bereits laufenden Mitgliedschaften blockiert die DB das Löschen — dann bitte archivieren.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

  const btn = document.getElementById('pr-delete-btn');
  btn.disabled = true;
  btn.textContent = 'Wird gelöscht ...';

  try {
    // Benefits werden via ON DELETE CASCADE automatisch entfernt
    const { error } = await db.from('membership_programs').delete().eq('id', editingProgramId);
    if (error) {
      if (error.message.toLowerCase().includes('foreign key') || error.code === '23503') {
        throw new Error('Dieses Programm wird bereits von laufenden Mitgliedschaften verwendet. Archiviere es stattdessen.');
      }
      throw new Error(error.message);
    }
    closeProgramModal();
    showToast('Programm gelöscht.');
    await loadPrograms();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Löschen';
  }
}

// ═══════════════════════════════════════════════════════════
//  MITGLIEDSCHAFTEN (v1.13.0)
// ═══════════════════════════════════════════════════════════

let editingMembershipId = null;
let currentMembershipCompanyId = null;  // für Modal-Context

/** Lädt Programme-Cache (für Dropdowns). */
let programsCache = [];
async function loadProgramsCache() {
  if (programsCache.length > 0) return programsCache;
  const { data, error } = await db.from('membership_programs')
    .select('*, membership_program_benefits(*)')
    .eq('ist_aktiv', true)
    .order('name');
  if (error) { return []; }
  programsCache = data || [];
  return programsCache;
}

/** Rendert die Mitgliedschafts-Sektion auf der Firma-Detail-Seite. */
async function renderCompanyMemberships(companyId) {
  const container = document.getElementById('company-memberships-body');
  const countEl = document.getElementById('company-memberships-count');
  if (!container) return;

  container.innerHTML = '<div class="empty">Lade Mitgliedschaften ...</div>';

  // Mitgliedschaften + Programm-Info + alle Entitlements + Redemptions
  const { data: memberships, error } = await db.from('memberships')
    .select(`
      *,
      membership_programs(name, laufzeit_monate),
      contacts:hauptkontakt_id(vorname, nachname),
      user_profiles:verantwortlicher_id(name)
    `).is('deleted_at', null)
    .eq('company_id', companyId)
    .order('start_datum', { ascending: false });

  if (error) {
    container.innerHTML = `<div class="empty">Fehler: ${esc(error.message)}</div>`;
    return;
  }

  if (!memberships || memberships.length === 0) {
    countEl.textContent = 'Mitgliedschaften';
    container.innerHTML = '<div class="empty">Noch keine Mitgliedschaften angelegt.</div>';
    return;
  }

  // Für jede Mitgliedschaft: Entitlements + Redemptions holen
  const membershipIds = memberships.map(m => m.id);
  const { data: entitlements } = await db.from('entitlements')
    .select('*')
    .in('membership_id', membershipIds);
  const entitlementsByMs = {};
  (entitlements || []).forEach(e => {
    if (!entitlementsByMs[e.membership_id]) entitlementsByMs[e.membership_id] = [];
    entitlementsByMs[e.membership_id].push(e);
  });

  const entitlementIds = (entitlements || []).map(e => e.id);
  let redemptionsByEnt = {};
  if (entitlementIds.length > 0) {
    const { data: redemptions } = await db.from('entitlement_redemptions')
      .select('entitlement_id, menge_eingeloest')
      .in('entitlement_id', entitlementIds);
    (redemptions || []).forEach(r => {
      redemptionsByEnt[r.entitlement_id] = (redemptionsByEnt[r.entitlement_id] || 0) + Number(r.menge_eingeloest || 0);
    });
  }

  const aktiv = memberships.filter(m => m.status === 'aktiv').length;
  countEl.textContent = `${memberships.length} Mitgliedschaft${memberships.length === 1 ? '' : 'en'}${aktiv > 0 ? ` · ${aktiv} aktiv` : ''}`;
  setTabCount('company', 'mitgliedschaften', memberships.length);

  container.innerHTML = memberships.map(m => renderMembershipCard(m, entitlementsByMs[m.id] || [], redemptionsByEnt)).join('');
}

/** Rendert eine einzelne Mitgliedschafts-Karte. */
function renderMembershipCard(m, entitlements, redemptionsByEnt) {
  const programName = m.membership_programs?.name || '(Programm entfernt)';
  const hauptkontakt = m.contacts ? [m.contacts.vorname, m.contacts.nachname].filter(Boolean).join(' ') : '';
  const verantwortlich = m.user_profiles?.name || '';

  const statusBadge = {
    aktiv:    '<span class="badge" style="background:#dcfce7;color:#16a34a">Aktiv</span>',
    pausiert: '<span class="badge" style="background:#fef3c7;color:#d97706">Pausiert</span>',
    beendet:  '<span class="badge" style="background:#f3f4f6;color:#6b7280">Beendet</span>'
  }[m.status] || '';

  // Tage bis Ablauf berechnen
  let ablaufHinweis = '';
  if (m.status === 'aktiv' && m.end_datum) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const endDatum = parseLocalDate(m.end_datum);
    const tage = Math.floor((endDatum - heute) / (1000 * 60 * 60 * 24));
    if (tage < 0) {
      ablaufHinweis = ` · <span style="color:var(--danger)">abgelaufen seit ${Math.abs(tage)} Tag${Math.abs(tage) === 1 ? '' : 'en'}</span>`;
    } else if (tage <= 60) {
      ablaufHinweis = ` · <span style="color:var(--warning)">läuft in ${tage} Tag${tage === 1 ? '' : 'en'} ab</span>`;
    } else {
      ablaufHinweis = ` · läuft in ${tage} Tagen ab`;
    }
  }

  // Benefits rendern
  const benefitsHtml = entitlements.length === 0
    ? '<div style="font-size:12px;color:var(--muted);padding:4px 0">Keine Bonis angelegt.</div>'
    : entitlements
        .sort((a, b) => (a.reihenfolge || 0) - (b.reihenfolge || 0))
        .map(e => renderEntitlementProgress(e, redemptionsByEnt[e.id] || 0))
        .join('');

  return `
    <div class="membership-card">
      <div class="membership-card-header">
        <div>
          <div class="membership-card-title" onclick="openMembershipModal('edit', '${esc(m.id)}', '${esc(m.company_id)}')">
            ${esc(programName)}
          </div>
          <div class="membership-card-meta">
            ${m.mitgliedsnummer ? `Nr. ${esc(m.mitgliedsnummer)} · ` : ''}${esc(formatDateDE(m.start_datum))} – ${esc(formatDateDE(m.end_datum))}${ablaufHinweis}
          </div>
          ${hauptkontakt || verantwortlich ? `
            <div class="membership-card-meta" style="margin-top:4px">
              ${hauptkontakt ? `Hauptkontakt: ${esc(hauptkontakt)}` : ''}${hauptkontakt && verantwortlich ? ' · ' : ''}${verantwortlich ? `Betreut von: ${esc(verantwortlich)}` : ''}
            </div>
          ` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${statusBadge}
          <button class="btn btn-sm" onclick="openMembershipModal('edit', '${esc(m.id)}', '${esc(m.company_id)}')">Bearbeiten</button>
        </div>
      </div>
      <div class="membership-card-benefits">${benefitsHtml}</div>
    </div>`;
}

/** Rendert eine Fortschrittszeile für ein Entitlement. */
function renderEntitlementProgress(e, eingeloest) {
  const gesamt = Number(e.gesamt_menge) || 0;
  const offen = Math.max(0, gesamt - eingeloest);
  const anteil = gesamt > 0 ? Math.min(100, (eingeloest / gesamt) * 100) : 0;

  let fillClass = '';
  if (anteil >= 100) fillClass = '';
  else if (offen > 0 && e.verfall_datum) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const verfall = parseLocalDate(e.verfall_datum);
    const tage = Math.floor((verfall - heute) / (1000 * 60 * 60 * 24));
    if (tage < 0) fillClass = 'danger';
    else if (tage <= 60) fillClass = 'warning';
  }

  const statusText = anteil >= 100
    ? 'vollständig eingelöst'
    : `${eingeloest} von ${gesamt} eingelöst`;

  return `
    <div class="benefit-progress-row">
      <div>
        <div style="font-weight:500">${esc(e.titel)}</div>
        <div style="font-size:11px;color:var(--muted)">${esc(statusText)}${offen > 0 ? ` · ${offen} offen` : ''}</div>
      </div>
      <div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${fillClass}" style="width:${anteil}%"></div>
        </div>
        <div class="progress-bar-label">${Math.round(anteil)} %</div>
      </div>
      <div style="text-align:right;font-size:11px;color:var(--muted)">
        ${e.verfall_datum ? 'Verfall:<br>' + esc(formatDateDE(e.verfall_datum)) : ''}
      </div>
    </div>`;
}

/** Öffnet das Mitgliedschafts-Modal. */
async function openMembershipModal(mode, membershipId = null, companyId = null) {
  editingMembershipId = membershipId;
  currentMembershipCompanyId = companyId;

  // Programme + Kontakte + User laden
  await loadProgramsCache();

  const programSelect = document.getElementById('ms-program');
  programSelect.innerHTML = '<option value="">— Programm wählen —</option>'
    + programsCache.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');

  // Hauptkontakt-Dropdown: Kontakte der Firma laden
  const hauptkontaktSelect = document.getElementById('ms-hauptkontakt');
  hauptkontaktSelect.innerHTML = '<option value="">— Kein Hauptkontakt —</option>';
  if (companyId) {
    const { data: contacts } = await db.from('contacts')
      .select('id, vorname, nachname').is('deleted_at', null)
      .eq('company_id', companyId).order('nachname');
    (contacts || []).forEach(c => {
      const name = [c.vorname, c.nachname].filter(Boolean).join(' ') || '(ohne Name)';
      hauptkontaktSelect.innerHTML += `<option value="${esc(c.id)}">${esc(name)}</option>`;
    });
  }

  // Verantwortlicher-Dropdown: alle aktiven User
  if (userProfilesCache.length === 0) {
    const { data } = await db.from('user_profiles').select('id, name, status').order('name');
    userProfilesCache = data || [];
  }
  const verantwSelect = document.getElementById('ms-verantwortlicher');
  verantwSelect.innerHTML = '<option value="">— Keiner —</option>'
    + userProfilesCache.filter(u => u.status === 'aktiv')
        .map(u => `<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');

  // Felder zurücksetzen
  document.getElementById('ms-start').value = new Date().toISOString().slice(0, 10);
  document.getElementById('ms-end').value = '';
  document.getElementById('ms-nummer').value = '';
  document.getElementById('ms-preis').value = '';
  document.getElementById('ms-status').value = 'aktiv';
  document.getElementById('ms-notizen').value = '';
  document.getElementById('ms-benefits-preview').style.display = 'none';

  if (mode === 'new') {
    document.getElementById('modal-membership-title').textContent = 'Neue Mitgliedschaft';
    document.getElementById('ms-save-btn').textContent = 'Anlegen';
    document.getElementById('ms-delete-btn').style.display = 'none';
  } else {
    document.getElementById('modal-membership-title').textContent = 'Mitgliedschaft bearbeiten';
    document.getElementById('ms-save-btn').textContent = 'Speichern';
    document.getElementById('ms-delete-btn').style.display = 'block';

    const { data, error } = await db.from('memberships').select('*').is('deleted_at', null).eq('id', membershipId).single();
    if (error || !data) { showToast('Mitgliedschaft nicht gefunden: ' + (error?.message || ''), true); editingMembershipId = null; return; }

    programSelect.value = data.program_id || '';
    document.getElementById('ms-start').value = data.start_datum || '';
    document.getElementById('ms-end').value   = data.end_datum || '';
    document.getElementById('ms-nummer').value = data.mitgliedsnummer || '';
    document.getElementById('ms-preis').value = data.preis ?? '';
    document.getElementById('ms-status').value = data.status || 'aktiv';
    document.getElementById('ms-notizen').value = data.notizen || '';
    if (data.hauptkontakt_id) hauptkontaktSelect.value = data.hauptkontakt_id;
    if (data.verantwortlicher_id) verantwSelect.value = data.verantwortlicher_id;
  }

  document.getElementById('modal-membership').classList.add('open');
}

function closeMembershipModal() {
  document.getElementById('modal-membership').classList.remove('open');
  editingMembershipId = null;
  currentMembershipCompanyId = null;
}

/** Wird beim Programm-Wechsel aufgerufen: berechnet Enddatum, Preis-Vorschlag, Mitgliedsnummer, Benefits-Preview. */
function onMembershipProgramChange() {
  const programId = document.getElementById('ms-program').value;
  const program = programsCache.find(p => p.id === programId);
  if (!program) {
    document.getElementById('ms-benefits-preview').style.display = 'none';
    return;
  }

  // Enddatum berechnen
  recalcMembershipEnd();

  // Preis vorschlagen, wenn leer
  const preisInput = document.getElementById('ms-preis');
  if (!preisInput.value && program.standard_preis) {
    preisInput.value = program.standard_preis;
  }

  // Mitgliedsnummer vorschlagen wenn leer und Präfix definiert (nur bei New-Mode)
  const nummerInput = document.getElementById('ms-nummer');
  if (!editingMembershipId && !nummerInput.value.trim() && program.mitgliedsnummer_praefix) {
    nummerInput.value = `${program.mitgliedsnummer_praefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  }

  // Benefits-Preview rendern
  const benefits = (program.membership_program_benefits || []).sort((a, b) => (a.reihenfolge || 0) - (b.reihenfolge || 0));
  const previewList = document.getElementById('ms-benefits-preview-list');
  const previewBox = document.getElementById('ms-benefits-preview');

  if (benefits.length === 0) {
    previewBox.style.display = 'none';
    return;
  }

  previewList.innerHTML = benefits.map(b =>
    `• ${esc(b.titel)} — ${b.menge_pro_laufzeit}× pro Laufzeit`
  ).join('<br>');
  previewBox.style.display = 'block';
}

/** Berechnet Enddatum aus Startdatum + Laufzeit des gewählten Programms. */
function recalcMembershipEnd() {
  const programId = document.getElementById('ms-program').value;
  const startStr = document.getElementById('ms-start').value;
  const endInput = document.getElementById('ms-end');
  if (!programId || !startStr) return;

  const program = programsCache.find(p => p.id === programId);
  if (!program) return;

  // Nur überschreiben, wenn Enddatum leer (damit manuelle Änderungen erhalten bleiben)
  if (endInput.value) return;

  const start = parseLocalDate(startStr);
  const end = new Date(start);
  end.setMonth(end.getMonth() + (program.laufzeit_monate || 12));
  end.setDate(end.getDate() - 1); // letzter Tag der Laufzeit

  endInput.value = end.toISOString().slice(0, 10);
}

/** Speichert die Mitgliedschaft und erzeugt Entitlements bei Neuanlage. */
async function saveMembership() {
  const program_id   = document.getElementById('ms-program').value;
  const start_datum  = document.getElementById('ms-start').value;
  const end_datum    = document.getElementById('ms-end').value;
  const mitgliedsnummer = document.getElementById('ms-nummer').value.trim();
  const preisRaw     = document.getElementById('ms-preis').value;
  const hauptkontakt_id = document.getElementById('ms-hauptkontakt').value || null;
  const verantwortlicher_id = document.getElementById('ms-verantwortlicher').value || null;
  const status       = document.getElementById('ms-status').value;
  const notizen      = document.getElementById('ms-notizen').value.trim();
  const btn          = document.getElementById('ms-save-btn');

  if (!program_id) { showToast('Bitte Programm auswählen.', true); return; }
  if (!start_datum) { showToast('Bitte Startdatum eingeben.', true); return; }
  if (!end_datum) { showToast('Bitte Enddatum eingeben (oder Programm wählen für Auto-Berechnung).', true); return; }
  if (end_datum < start_datum) { showToast('Enddatum muss nach dem Startdatum liegen.', true); return; }

  const preis = preisRaw === '' ? 0 : Number(preisRaw);
  if (Number.isNaN(preis) || preis < 0) { showToast('Preis muss eine Zahl ≥ 0 sein.', true); return; }

  btn.disabled = true;
  btn.textContent = editingMembershipId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      company_id: currentMembershipCompanyId,
      program_id,
      mitgliedsnummer: mitgliedsnummer || null,
      status,
      start_datum,
      end_datum,
      preis,
      hauptkontakt_id,
      verantwortlicher_id,
      notizen: notizen || null,
      erstellt_von: currentProfile?.id || null
    };

    if (editingMembershipId) {
      const { error } = await db.from('memberships').update(payload).eq('id', editingMembershipId);
      if (error) throw new Error(error.message);
      showToast('Mitgliedschaft aktualisiert.');
    } else {
      const { data: newMs, error } = await db.from('memberships').insert(payload).select('id').single();
      if (error) throw new Error(error.message);

      // Entitlements aus Programm-Benefits erzeugen
      const program = programsCache.find(p => p.id === program_id);
      const benefits = (program?.membership_program_benefits || []);
      if (benefits.length > 0) {
        const entitlementRows = benefits.map(b => ({
          company_id: currentMembershipCompanyId,
          source_type: 'membership',
          membership_id: newMs.id,
          service_id: b.service_id,
          titel: b.titel,
          gesamt_menge: b.menge_pro_laufzeit,
          verfall_datum: end_datum,
          reihenfolge: b.reihenfolge || 0
        }));
        const { error: entErr } = await db.from('entitlements').insert(entitlementRows);
        if (entErr) throw new Error('Mitgliedschaft angelegt, aber Bonis nicht: ' + entErr.message);
      }

      showToast(`Mitgliedschaft angelegt mit ${benefits.length} Bonus${benefits.length === 1 ? '' : 'sen'}.`);
    }

    closeMembershipModal();
    if (currentCompanyDetailId) await renderCompanyMemberships(currentCompanyDetailId);
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingMembershipId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteMembership() {
  if (!editingMembershipId) return;
  const id = editingMembershipId;
  const companyId = currentMembershipCompanyId;

  const ok = await confirmDialog({
    title: 'Mitgliedschaft löschen?',
    message: 'Die Mitgliedschaft wird ausgeblendet. Für beendete Verträge besser den Status auf „beendet" setzen, statt zu löschen. Rückgängig-Link erscheint 5 Sekunden lang.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

  try {
    const { error } = await db.from('memberships').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    if (error) throw new Error(error.message);

    closeMembershipModal();
    if (companyId) await renderCompanyMemberships(companyId);

    showToast('Mitgliedschaft gelöscht.', false, {
      actionLabel: 'Rückgängig',
      durationMs: 5000,
      onAction: async () => {
        try {
          await db.from('memberships').update({ deleted_at: null }).eq('id', id);
          if (companyId) await renderCompanyMemberships(companyId);
          showToast('Mitgliedschaft wiederhergestellt.');
        } catch (err) {
          showToast('Wiederherstellen fehlgeschlagen: ' + err.message, true);
        }
      }
    });
  } catch (e) {
    showToast(e.message, true);
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

/**
 * Baut eine Map {companyId → {next, last}} basierend auf allen Terminen.
 * `next`: nächster kommender (ab heute), falls vorhanden
 * `last`: letzter vergangener, falls vorhanden
 */
async function loadCompanyAppointmentMap() {
  const { data, error } = await db.from('appointments')
    .select('id, company_id, datum, titel, status, uhrzeit_von').is('deleted_at', null)
    .not('company_id', 'is', null);

  if (error) { companyAppointmentMap = {}; return; }

  const todayISO = toISODate(new Date());
  const map = {};

  (data || []).forEach(a => {
    if (!a.company_id) return;
    if (!map[a.company_id]) map[a.company_id] = { next: null, last: null };

    if (a.datum >= todayISO) {
      // Kandidat für "next": das früheste zukünftige Datum
      const current = map[a.company_id].next;
      if (!current || a.datum < current.datum ||
          (a.datum === current.datum && (a.uhrzeit_von || '') < (current.uhrzeit_von || ''))) {
        map[a.company_id].next = a;
      }
    } else {
      // Kandidat für "last": das jüngste vergangene Datum
      const current = map[a.company_id].last;
      if (!current || a.datum > current.datum ||
          (a.datum === current.datum && (a.uhrzeit_von || '') > (current.uhrzeit_von || ''))) {
        map[a.company_id].last = a;
      }
    }
  });

  companyAppointmentMap = map;
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

  const [companiesResult, contactsResult] = await Promise.all([
    db.from('companies').select('*, typ:lookup_values!companies_typ_id_fkey(id, wert, farbe)').is('deleted_at', null).order('name'),
    db.from('contacts').select('id, vorname, nachname, company_id, email, telefon').is('deleted_at', null).not('company_id', 'is', null),
    loadCompanyAppointmentMap()
  ]);

  const { data, error } = companiesResult;

  // companyContactsMap aus allen Kontakten befüllen
  companyContactsMap = {};
  (contactsResult.data || []).forEach(k => {
    if (!k.company_id) return;
    if (!companyContactsMap[k.company_id]) companyContactsMap[k.company_id] = [];
    companyContactsMap[k.company_id].push(k);
  });
  // Sortieren pro Firma
  Object.keys(companyContactsMap).forEach(cid => {
    companyContactsMap[cid].sort((a, b) => (a.nachname || '').localeCompare(b.nachname || ''));
  });

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

/** Rendert die Termin-Zelle für die Firmen-Liste */
function renderNextAppointmentCell(companyId) {
  const entry = companyAppointmentMap[companyId];
  if (!entry || (!entry.next && !entry.last)) {
    return '<span style="color:var(--muted);font-style:italic;font-size:12px">—</span>';
  }

  // Prio: nächster Termin, wenn vorhanden
  if (entry.next) {
    return `
      <div class="next-appt">
        <div class="next-appt-label" style="color:var(--link)">Nächster</div>
        <div class="next-appt-date upcoming">${esc(formatDateCompact(entry.next.datum))}</div>
        <div class="next-appt-title" title="${esc(entry.next.titel || '')}">${esc(entry.next.titel || '')}</div>
      </div>`;
  }

  // Sonst: letzter vergangener
  return `
    <div class="next-appt">
      <div class="next-appt-label">Letzter</div>
      <div class="next-appt-date past">${esc(formatDateCompact(entry.last.datum))}</div>
      <div class="next-appt-title" title="${esc(entry.last.titel || '')}">${esc(entry.last.titel || '')}</div>
    </div>`;
}

function renderCompaniesTable(companies) {
  const tbody = document.getElementById('companies-table-body');
  const countEl = document.getElementById('companies-count');

  const total = companiesCache.length;
  const shown = companies.length;
  countEl.textContent = (shown === total)
    ? `${total} ${total === 1 ? 'Firma' : 'Firmen'}`
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

    const abcHtml = c.abc_klassifizierung
      ? `<span class="abc-badge abc-badge-${esc(c.abc_klassifizierung)}" title="ABC ${esc(c.abc_klassifizierung)}" style="margin-right:8px;vertical-align:middle">${esc(c.abc_klassifizierung)}</span>`
      : '';

    return `
      <tr>
        <td>
          <div class="cell-link" onclick="navigateTo('firma', '${esc(c.id)}')">${abcHtml}${esc(c.name)}</div>
          ${c.website ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">${esc(c.website)}</div>` : ''}
        </td>
        <td>
          <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
        </td>
        <td class="col-tablet" style="color:var(--muted)">${esc(ort || '—')}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(c.telefon || '—')}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(c.branche || '—')}</td>
        <td class="col-desktop">${renderNextAppointmentCell(c.id)}</td>
        <td class="col-action" style="text-align:right">${renderActionIcons('company', c.id)}</td>
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
  document.getElementById('c-abc').value = '';
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

    const { data, error } = await db.from('companies').select('*').is('deleted_at', null).eq('id', companyId).single();
    if (error || !data) { showToast('Firma konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingCompanyId = null; return; }

    document.getElementById('c-name').value = data.name || '';
    document.getElementById('c-branche').value = data.branche || '';
    document.getElementById('c-abc').value = data.abc_klassifizierung || '';
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
  const abcRaw   = document.getElementById('c-abc').value;
  const abc_klassifizierung = ['A','B','C'].includes(abcRaw) ? abcRaw : null;
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
      branche: branche || null, abc_klassifizierung,
      strasse: strasse || null, plz: plz || null,
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
  const id = editingCompanyId;
  const ok = await confirmDialog({
    title: 'Firma löschen?',
    message: 'Diese Firma wird ausgeblendet. Du kannst das 5 Sekunden lang rückgängig machen.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;
  closeCompanyModal();
  await _performSoftDelete('company', id);
}

// ═══════════════════════════════════════════════════════════
//  FIRMEN-DETAILSEITE
// ═══════════════════════════════════════════════════════════

async function loadCompanyDetail(companyId) {
  currentCompanyDetailId = companyId;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-company-detail').classList.add('active');
  document.querySelectorAll('.nav-item:not(.nav-item-group)').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-companies')?.classList.add('active');
  setMobileNav('company-detail');

  document.getElementById('company-detail-name').textContent = '…';
  document.getElementById('company-detail-title').textContent = '…';
  document.getElementById('company-detail-subline').innerHTML = '';
  document.getElementById('company-detail-info').innerHTML = '<div style="color:var(--muted);font-size:13px">Lade Firma ...</div>';
  document.getElementById('company-contacts-body').innerHTML = '<tr><td colspan="5"><div class="empty">Lade Kontakte ...</div></td></tr>';
  document.getElementById('company-appointments-body').innerHTML = '<tr><td colspan="7"><div class="empty">Lade Termine ...</div></td></tr>';
  document.getElementById('company-appointments-show-all').style.display = 'none';
  document.getElementById('company-projects-body').innerHTML = '<tr><td colspan="6"><div class="empty">Lade Projekte ...</div></td></tr>';
  const cTasksBody = document.getElementById('company-tasks-body');
  if (cTasksBody) cTasksBody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade Aufgaben ...</div></td></tr>';

  const { data, error } = await db.from('companies')
    .select('*, typ:lookup_values!companies_typ_id_fkey(id, wert, farbe)').is('deleted_at', null)
    .eq('id', companyId).single();

  if (error || !data) {
    const msg = friendlyFetchError(error, 'Firma');
    document.getElementById('company-detail-info').innerHTML = `<div style="color:var(--danger);font-size:13px">${esc(msg)}</div>`;
    document.getElementById('company-detail-title').textContent = msg;
    document.getElementById('company-detail-name').textContent = '—';
    document.getElementById('company-detail-subline').innerHTML = '';
    // Abhängige Sektionen nicht starten, sondern leeren Zustand anzeigen
    document.getElementById('company-contacts-body').innerHTML = '<tr><td colspan="5"><div class="empty">—</div></td></tr>';
    document.getElementById('company-appointments-body').innerHTML = '<tr><td colspan="7"><div class="empty">—</div></td></tr>';
    document.getElementById('company-projects-body').innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    const depBody = document.getElementById('company-deployments-body');
    if (depBody) depBody.innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    const msBody = document.getElementById('company-memberships-body');
    if (msBody) msBody.innerHTML = '<div class="empty">—</div>';
    const tasksBody = document.getElementById('company-tasks-body');
    if (tasksBody) tasksBody.innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    return;
  }

  renderCompanyDetail(data);
  trackVisit('company', data.id, data.name, [data.stadt, data.branche].filter(Boolean).join(' · '));
  initDetailTabs('company');
  await loadCompanyContacts(companyId);
  await loadCompanyAppointments(companyId);
  await loadCompanyProjects(companyId);
  await loadCompanyDeployments(companyId);
  await renderCompanyMemberships(companyId);
  await loadCompanyTasks(companyId);
}

function renderCompanyDetail(c) {
  document.getElementById('company-detail-name').textContent = c.name;
  document.getElementById('company-detail-title').textContent = c.name;

  const typFarbe = c.typ?.farbe || '#6b7280';
  const typWert  = c.typ?.wert || '—';
  const abcBadgeHtml = c.abc_klassifizierung
    ? `<span class="abc-badge abc-badge-${esc(c.abc_klassifizierung)}" title="ABC-Klassifizierung ${esc(c.abc_klassifizierung)}">${esc(c.abc_klassifizierung)}</span>`
    : '';
  const subline = document.getElementById('company-detail-subline');
  subline.innerHTML = `
    ${abcBadgeHtml}
    <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
    ${c.branche ? `<span>· ${esc(c.branche)}</span>` : ''}
  `;

  const editBtn = document.getElementById('company-detail-edit-btn');
  editBtn.onclick = () => openCompanyModal('edit', c.id);

  const copyBtn = document.getElementById('company-detail-copy-btn');
  copyBtn.onclick = () => copyCompanyById(c.id);

  // Bestehende Sektion-Add-Buttons (+ Kontakt hinzufügen etc.) im jeweiligen Tab-Panel
  document.getElementById('company-detail-add-contact-btn').onclick = () => {
    contactModalPrefillCompanyId = c.id;
    openContactModal('new');
  };

  document.getElementById('company-detail-add-appointment-btn').onclick = () => {
    appointmentModalPrefillCompanyId = c.id;
    openAppointmentModal('new');
  };

  document.getElementById('company-detail-add-project-btn').onclick = () => {
    projectModalPrefillCompanyId = c.id;
    openProjectModal('new');
  };

  document.getElementById('company-detail-add-deployment-btn').onclick = () => {
    deploymentModalPrefillCompanyId = c.id;
    openDeploymentModal('new');
  };

  document.getElementById('company-detail-add-membership-btn').onclick = () => {
    openMembershipModal('new', null, c.id);
  };

  const addTaskBtn = document.getElementById('company-detail-add-task-btn');
  if (addTaskBtn) addTaskBtn.onclick = () => {
    taskModalPrefillCompanyId = c.id;
    openTaskModal('new');
  };

  // Quick-Create-Panel im Stammdaten-Tab (v1.24.0)
  document.getElementById('company-quick-contact').onclick = () => {
    contactModalPrefillCompanyId = c.id; openContactModal('new');
  };
  document.getElementById('company-quick-appointment').onclick = () => {
    appointmentModalPrefillCompanyId = c.id; openAppointmentModal('new');
  };
  document.getElementById('company-quick-task').onclick = () => {
    taskModalPrefillCompanyId = c.id; openTaskModal('new');
  };
  document.getElementById('company-quick-deployment').onclick = () => {
    deploymentModalPrefillCompanyId = c.id; openDeploymentModal('new');
  };
  document.getElementById('company-quick-project').onclick = () => {
    projectModalPrefillCompanyId = c.id; openProjectModal('new');
  };
  document.getElementById('company-quick-membership').onclick = () => {
    openMembershipModal('new', null, c.id);
  };

  // ABC-Klick öffnet Edit-Modal (v1.25)
  const abcCard = document.getElementById('company-abc-card');
  if (abcCard) abcCard.onclick = () => openAbcEditModal(c.id, c.abc_klassifizierung);

  // Schnellaktionen-Button (v1.25)
  const quickActionsBtn = document.getElementById('company-quick-actions');
  if (quickActionsBtn) quickActionsBtn.onclick = () => openQuickActionsModal(c.id, c.name);

  // ABC initial setzen (Auto-Wert wird gleich von loadCompanyDashboard nachgereicht)
  renderCompanyAbcBadge(c.abc_klassifizierung, null);

  // Notizen inline-editierbar
  const notesArea = document.getElementById('company-notes-inline');
  notesArea.value = c.notizen || '';
  notesArea.dataset.savedValue = c.notizen || '';
  notesArea.dataset.companyId = c.id;
  document.getElementById('company-notes-save-status').textContent = '';

  // Stats-Widgets asynchron laden
  loadCompanyDashboard(c.id, c.abc_klassifizierung);

  const info = document.getElementById('company-detail-info');
  const adrLines = [];
  if (c.strasse) adrLines.push(c.strasse);
  const ort = [c.plz, c.stadt].filter(Boolean).join(' ');
  if (ort) adrLines.push(ort);
  if (c.land && c.land !== 'Deutschland') adrLines.push(c.land);
  const adrHtml = adrLines.length > 0
    ? adrLines.map(l => esc(l)).join('<br>')
    : '<span class="detail-value-muted">—</span>';

  const telHtml = c.telefon
    ? `<a href="tel:${esc(c.telefon)}">${esc(c.telefon)}</a>`
    : '<span class="detail-value-muted">—</span>';
  const mailHtml = c.email
    ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`
    : '<span class="detail-value-muted">—</span>';
  let websiteHtml;
  if (c.website) {
    const url = c.website.startsWith('http') ? c.website : `https://${c.website}`;
    websiteHtml = `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(c.website)}</a>`;
  } else {
    websiteHtml = '<span class="detail-value-muted">—</span>';
  }

  info.innerHTML = `
    <div class="detail-field">
      <div class="detail-label">Adresse</div>
      <div class="detail-value">${adrHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Website</div>
      <div class="detail-value">${websiteHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Telefon</div>
      <div class="detail-value">${telHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">E-Mail</div>
      <div class="detail-value">${mailHtml}</div>
    </div>
  `;
  // Notizen: jetzt inline-editierbar im Dashboard (siehe oben, #company-notes-inline)
}

async function loadCompanyContacts(companyId) {
  const tbody = document.getElementById('company-contacts-body');
  const countEl = document.getElementById('company-contacts-count');

  const { data, error } = await db.from('contacts')
    .select('*').is('deleted_at', null).eq('company_id', companyId).order('nachname').order('vorname');

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Kontakte';
    return;
  }

  // Cache aktualisieren für sync-Copy
  companyContactsMap[companyId] = data || [];

  // Für die companiesCache-Lookup-Kompatibilität: Firma ins companiesCache pushen falls leer
  if (companiesCache.length === 0) {
    const { data: c } = await db.from('companies').select('*').is('deleted_at', null).eq('id', companyId).single();
    if (c) companiesCache = [c];
  }

  const total = (data || []).length;
  countEl.textContent = total === 0 ? 'Keine Kontakte' : `${total} Kontakt${total === 1 ? '' : 'e'}`;
  setTabCount('company', 'kontakte', total);

  if (total === 0) {
    tbody.innerHTML = '<tr><td colspan="5"><div class="empty">Noch keine Kontakte für diese Firma. Klicke oben auf „+ Kontakt hinzufügen".</div></td></tr>';
    return;
  }

  tbody.innerHTML = data.map(k => {
    const fullName = [k.vorname, k.nachname].filter(Boolean).join(' ');
    return `
      <tr>
        <td><div class="cell-link" onclick="navigateTo('kontakt', '${esc(k.id)}')">${esc(fullName)}</div></td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.position || '—')}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.telefon || '—')}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(k.email || '—')}</td>
        <td class="col-action" style="text-align:right">
          <div class="btn-row" style="justify-content:flex-end">
            <button class="btn-copy" onclick="copyContactById('${esc(k.id)}')" title="Kontakt kopieren" aria-label="Kontakt kopieren">${COPY_ICON_SVG}</button>
            <button class="btn btn-sm" onclick="openContactModal('edit', '${esc(k.id)}')">Bearbeiten</button>
          </div>
        </td>
      </tr>`;
  }).join('');
}

async function loadCompanyAppointments(companyId) {
  closeExpandedRow();
  const tbody = document.getElementById('company-appointments-body');
  const countEl = document.getElementById('company-appointments-count');
  const showAllWrap = document.getElementById('company-appointments-show-all');
  const showAllLink = document.getElementById('company-appointments-show-all-link');

  const { data, error } = await db.from('appointments')
    .select('*, typ:lookup_values!appointments_typ_id_fkey(id, wert, farbe), contact:contacts(id, vorname, nachname)').is('deleted_at', null)
    .eq('company_id', companyId);

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Termine';
    showAllWrap.style.display = 'none';
    return;
  }

  const all = data || [];
  const total = all.length;
  const anzGeplant       = all.filter(a => a.status === 'geplant').length;
  const anzDurchgefuehrt = all.filter(a => a.status === 'durchgefuehrt').length;
  setTabCount('company', 'termine', total);

  if (total === 0) {
    countEl.textContent = 'Keine Termine';
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty">Noch keine Termine für diese Firma. Klicke oben auf „+ Termin hinzufügen".</div></td></tr>';
    showAllWrap.style.display = 'none';
    return;
  }

  countEl.textContent = `${total} Termin${total === 1 ? '' : 'e'} · ${anzGeplant} geplant · ${anzDurchgefuehrt} durchgeführt`;

  // Sortieren: kommende aufsteigend, dann vergangene absteigend
  const todayISO = toISODate(new Date());
  const upcoming = all.filter(a => a.datum >= todayISO)
    .sort((a, b) => a.datum === b.datum
      ? (a.uhrzeit_von || '').localeCompare(b.uhrzeit_von || '')
      : a.datum.localeCompare(b.datum));
  const past = all.filter(a => a.datum < todayISO)
    .sort((a, b) => a.datum === b.datum
      ? (b.uhrzeit_von || '').localeCompare(a.uhrzeit_von || '')
      : b.datum.localeCompare(a.datum));

  const sorted = upcoming.concat(past);
  const toShow = sorted.slice(0, 10);
  const hasMore = sorted.length > 10;

  tbody.innerHTML = toShow.map(a => {
    const typFarbe = a.typ?.farbe || '#6b7280';
    const typWert  = a.typ?.wert || '—';
    const isPast = a.datum < todayISO;
    const kontaktName = a.contact
      ? [a.contact.vorname, a.contact.nachname].filter(Boolean).join(' ')
      : '';

    const uhrzeit = a.uhrzeit_von
      ? (a.uhrzeit_bis ? `${formatTime(a.uhrzeit_von)}–${formatTime(a.uhrzeit_bis)}` : formatTime(a.uhrzeit_von))
      : '';

    return `
      <tr>
        <td>
          <div class="date-cell${isPast ? ' past' : ''}">${esc(formatDateDE(a.datum))}</div>
        </td>
        <td class="col-tablet" style="color:var(--muted)">${esc(uhrzeit || '—')}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))"><span class="termin-title-icon" title="${esc(a.typ?.wert || '')}">${terminTypIcon(a.typ?.wert)}</span>${esc(a.titel || '—')}</div>
        </td>
        <td class="col-tablet">
          <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
        </td>
        <td class="col-desktop" style="color:var(--muted)">${esc(kontaktName || '—')}</td>
        <td>
          <span class="badge" style="background:${appointmentStatusBg(a.status)};color:${appointmentStatusColor(a.status)}">${esc(appointmentStatusLabel(a.status))}</span>
        </td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="openAppointmentModal('edit', '${esc(a.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');

  if (hasMore) {
    showAllLink.onclick = () => navigateTo('appointments', { firma: companyId });
    showAllLink.textContent = `Alle ${total} Termine dieser Firma anzeigen →`;
    showAllWrap.style.display = '';
  } else {
    showAllWrap.style.display = 'none';
  }

  // Auto-Expand wenn genau ein Termin — spart den manuellen Klick (v1.27.1)
  autoExpandSingleAppointmentRow(tbody, toShow);
}

// ═══════════════════════════════════════════════════════════
//  KONTAKTE (CONTACTS)
// ═══════════════════════════════════════════════════════════

async function loadContacts() {
  const tbody = document.getElementById('contacts-table-body');
  tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade Kontakte ...</div></td></tr>';

  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  }

  const companyFilter = document.getElementById('contacts-company-filter');
  const existingValue = companyFilter.value;
  companyFilter.innerHTML = '<option value="">Alle Firmen</option><option value="__none__">Ohne Firmenzuordnung</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if (existingValue) companyFilter.value = existingValue;

  const { data, error } = await db.from('contacts')
    .select('*, company:companies(id, name)').is('deleted_at', null).order('nachname').order('vorname');

  if (error) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }

  contactsCache = data || [];

  // Sync-Copy-Cache aktualisieren
  companyContactsMap = {};
  contactsCache.forEach(k => {
    if (!k.company_id) return;
    if (!companyContactsMap[k.company_id]) companyContactsMap[k.company_id] = [];
    companyContactsMap[k.company_id].push(k);
  });

  filterContacts();
}

function filterContacts() {
  const searchTerm = document.getElementById('contacts-search').value.trim().toLowerCase();
  const companyFilterVal = document.getElementById('contacts-company-filter').value;

  let filtered = contactsCache;
  if (companyFilterVal === '__none__') {
    filtered = filtered.filter(k => !k.company_id);
  } else if (companyFilterVal) {
    filtered = filtered.filter(k => k.company_id === companyFilterVal);
  }
  if (searchTerm) {
    filtered = filtered.filter(k => {
      const haystack = [k.vorname, k.nachname, k.position, k.email, k.telefon, k.company?.name]
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
    const firmaHtml = k.company_id && k.company
      ? `<div class="cell-link" onclick="navigateTo('firma', '${esc(k.company_id)}')">${esc(k.company.name)}</div>`
      : '<span style="color:var(--muted);font-style:italic">Ohne Firma</span>';

    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div class="avatar">${esc(ini(fullName))}</div>
            <div class="cell-link" onclick="navigateTo('kontakt', '${esc(k.id)}')">${esc(fullName)}</div>
          </div>
        </td>
        <td>${firmaHtml}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.position || '—')}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(k.telefon || '—')}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(k.email || '—')}</td>
        <td class="col-action" style="text-align:right">${renderActionIcons('contact', k.id)}</td>
      </tr>`;
  }).join('');
}

async function openContactModal(mode, contactId = null) {
  editingContactId = contactId;

  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  }
  const companySelect = document.getElementById('k-company');
  companySelect.innerHTML = '<option value="">— Keine Firma —</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

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
    }
  } else {
    document.getElementById('modal-contact-title').textContent = 'Kontakt bearbeiten';
    document.getElementById('k-save-btn').textContent = 'Speichern';
    document.getElementById('k-delete-btn').style.display = 'block';

    const { data, error } = await db.from('contacts').select('*').is('deleted_at', null).eq('id', contactId).single();
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

function closeContactModal() {
  document.getElementById('modal-contact').classList.remove('open');
  editingContactId = null;
  contactModalPrefillCompanyId = null;
}

async function saveContact() {
  const vorname    = document.getElementById('k-vorname').value.trim();
  const nachname   = document.getElementById('k-nachname').value.trim();
  const position   = document.getElementById('k-position').value.trim();
  const company_id = document.getElementById('k-company').value || null;
  const telefon    = document.getElementById('k-telefon').value.trim();
  const email      = document.getElementById('k-email').value.trim();
  const notizen    = document.getElementById('k-notizen').value.trim();
  const btn        = document.getElementById('k-save-btn');

  if (!vorname) { showToast('Bitte Vorname eingeben.', true); return; }
  if (!nachname) { showToast('Bitte Nachname eingeben.', true); return; }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('E-Mail-Adresse sieht nicht korrekt aus.', true); return; }

  btn.disabled = true;
  btn.textContent = editingContactId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      vorname, nachname,
      position: position || null, company_id,
      telefon: telefon || null, email: email || null,
      notizen: notizen || null
    };
    if (!editingContactId) payload.erstellt_von = currentUser?.id || null;

    let error;
    if (editingContactId) { ({ error } = await db.from('contacts').update(payload).eq('id', editingContactId)); }
    else { ({ error } = await db.from('contacts').insert(payload)); }
    if (error) throw new Error(error.message);

    closeContactModal();
    showToast(editingContactId ? 'Kontakt aktualisiert.' : 'Kontakt angelegt.');

    const savedId = editingContactId;
    if (savedId && currentContactDetailId === savedId && document.getElementById('page-contact-detail').classList.contains('active')) {
      await loadContactDetail(savedId);
    } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
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
  const id = editingContactId;
  const ok = await confirmDialog({
    title: 'Kontakt löschen?',
    message: 'Der Kontakt wird ausgeblendet. Rückgängig-Link erscheint 5 Sekunden lang.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;
  closeContactModal();
  await _performSoftDelete('contact', id);
}

// ═══════════════════════════════════════════════════════════
//  TERMINE (APPOINTMENTS)
// ═══════════════════════════════════════════════════════════

async function loadTerminTypen() {
  if (terminTypenCache.length > 0) return terminTypenCache;
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe').eq('kategorie', 'termin_typ').eq('ist_aktiv', true).order('reihenfolge');
  if (error) { showToast('Fehler beim Laden der Termintypen: ' + error.message, true); return []; }
  terminTypenCache = data || [];
  return terminTypenCache;
}

async function loadAppointments() {
  const tbody = document.getElementById('appointments-table-body');
  tbody.innerHTML = '<tr><td colspan="8"><div class="empty">Lade Termine ...</div></td></tr>';

  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  }

  // Firma-Filter-Dropdown befüllen
  const companyFilter = document.getElementById('appointments-company-filter');
  const existingCompanyValue = companyFilter.value;
  companyFilter.innerHTML = '<option value="">Alle Firmen</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if (existingCompanyValue) companyFilter.value = existingCompanyValue;

  // Termintyp-Filter-Dropdown befüllen
  const typen = await loadTerminTypen();
  const typFilter = document.getElementById('appointments-typ-filter');
  if (typFilter.options.length <= 1) {
    typFilter.innerHTML = '<option value="">Alle Typen</option>'
      + typen.map(t => `<option value="${esc(t.id)}">${esc(t.wert)}</option>`).join('');
  }

  // Pending-Filter aus URL-Parameter anwenden
  if (pendingAppointmentsFilter?.firma) {
    companyFilter.value = pendingAppointmentsFilter.firma;
    pendingAppointmentsFilter = null;
  }

  const { data, error } = await db.from('appointments')
    .select('*, typ:lookup_values!appointments_typ_id_fkey(id, wert, farbe), company:companies(id, name), contact:contacts(id, vorname, nachname)').is('deleted_at', null)
    .order('datum', { ascending: false }).order('uhrzeit_von', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }

  appointmentsCache = data || [];
  filterAppointments();
}

function filterAppointments() {
  const searchTerm  = document.getElementById('appointments-search').value.trim().toLowerCase();
  const rangeFilter = document.getElementById('appointments-range-filter').value;
  const companyFilterVal = document.getElementById('appointments-company-filter').value;
  const statusFilter = document.getElementById('appointments-status-filter').value;
  const typFilter   = document.getElementById('appointments-typ-filter').value;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  let filtered = appointmentsCache;

  // Range-Filter
  if (rangeFilter === 'today') {
    filtered = filtered.filter(a => a.datum === todayISO);
  } else if (rangeFilter === 'week') {
    const weekStart = new Date(today);
    const day = weekStart.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    weekStart.setDate(weekStart.getDate() + diff);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const startISO = toISODate(weekStart);
    const endISO   = toISODate(weekEnd);
    filtered = filtered.filter(a => a.datum >= startISO && a.datum <= endISO);
  } else if (rangeFilter === 'month') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startISO = toISODate(monthStart);
    const endISO   = toISODate(monthEnd);
    filtered = filtered.filter(a => a.datum >= startISO && a.datum <= endISO);
  } else if (rangeFilter === 'upcoming') {
    filtered = filtered.filter(a => a.datum >= todayISO);
  } else if (rangeFilter === 'past') {
    filtered = filtered.filter(a => a.datum < todayISO);
  }

  // Firma-Filter
  if (companyFilterVal) filtered = filtered.filter(a => a.company_id === companyFilterVal);

  // Status-Filter
  if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);

  // Typ-Filter
  if (typFilter) filtered = filtered.filter(a => a.typ_id === typFilter);

  // Such-Filter
  if (searchTerm) {
    filtered = filtered.filter(a => {
      const haystack = [a.titel, a.ort, a.notizen, a.company?.name,
                        a.contact ? [a.contact.vorname, a.contact.nachname].filter(Boolean).join(' ') : '']
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  // Sortierung: für upcoming/today/week/month aufsteigend; sonst absteigend (jüngste zuerst)
  const ascending = ['upcoming', 'today', 'week', 'month'].includes(rangeFilter);
  filtered.sort((a, b) => {
    if (a.datum !== b.datum) return ascending
      ? a.datum.localeCompare(b.datum)
      : b.datum.localeCompare(a.datum);
    return ascending
      ? (a.uhrzeit_von || '').localeCompare(b.uhrzeit_von || '')
      : (b.uhrzeit_von || '').localeCompare(a.uhrzeit_von || '');
  });

  renderAppointmentsTable(filtered);
}

function renderAppointmentsTable(appointments) {
  closeExpandedRow();
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
    const typFarbe = a.typ?.farbe || '#6b7280';
    const typWert  = a.typ?.wert || '—';
    const isPast = a.datum < todayISO;

    const uhrzeit = a.uhrzeit_von
      ? (a.uhrzeit_bis ? `${formatTime(a.uhrzeit_von)}–${formatTime(a.uhrzeit_bis)}` : formatTime(a.uhrzeit_von))
      : '';

    const firmaHtml = a.company_id && a.company
      ? `<div class="cell-link" onclick="navigateTo('firma', '${esc(a.company_id)}')">${esc(a.company.name)}</div>`
      : '<span style="color:var(--muted);font-style:italic">—</span>';

    return `
      <tr>
        <td>
          <div class="date-cell${isPast ? ' past' : ''}">${esc(formatDateDE(a.datum))}</div>
        </td>
        <td class="col-tablet" style="color:var(--muted)">${esc(uhrzeit || '—')}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))"><span class="termin-title-icon" title="${esc(a.typ?.wert || '')}">${terminTypIcon(a.typ?.wert)}</span>${esc(a.titel || '—')}</div>
        </td>
        <td class="col-tablet">
          <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
        </td>
        <td class="col-desktop">${firmaHtml}</td>
        <td class="col-desktop" style="color:var(--muted)">${esc(a.ort || '—')}</td>
        <td>
          <span class="badge" style="background:${appointmentStatusBg(a.status)};color:${appointmentStatusColor(a.status)}">${esc(appointmentStatusLabel(a.status))}</span>
        </td>
        <td class="col-action" style="text-align:right">${renderActionIcons('appointment', a.id)}</td>
      </tr>`;
  }).join('');
}

async function openAppointmentModal(mode, appointmentId = null) {
  editingAppointmentId = appointmentId;
  lastAutoFilledOrt = '';
  renderDateShortcuts();  // v1.33: aktuelle Monats-Buttons

  // Firmen laden
  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name, strasse, plz, stadt').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  } else {
    const { data: cs } = await db.from('companies').select('id, name, strasse, plz, stadt').is('deleted_at', null).order('name');
    companiesCache = cs || companiesCache;
  }

  const companySelect = document.getElementById('t-company');
  companySelect.innerHTML = '<option value="">— Keine Firma —</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

  // Termintypen laden
  const typen = await loadTerminTypen();
  const typSelect = document.getElementById('t-typ');
  if (typen.length === 0) {
    typSelect.innerHTML = '<option value="">Keine Typen – bitte erst unter „Stammdaten" anlegen</option>';
  } else {
    typSelect.innerHTML = typen.map(t => `<option value="${esc(t.id)}">${esc(t.wert)}</option>`).join('');
  }
  renderTerminTypIconsPicker();  // v1.34: klickbare Icon-Reihe aus den geladenen Typen

  document.getElementById('t-titel').value = '';
  document.getElementById('t-datum').value = toISODate(new Date());
  document.getElementById('t-uhrzeit-von').value = '';
  document.getElementById('t-uhrzeit-bis').value = '';
  document.getElementById('t-uhrzeit-von').disabled = false;
  document.getElementById('t-uhrzeit-bis').disabled = false;
  const tGanz = document.getElementById('t-ganztag'); if (tGanz) tGanz.checked = false;
  document.getElementById('t-status').value = 'geplant';
  document.getElementById('t-ort').value = '';
  document.getElementById('t-notizen').value = '';
  document.getElementById('t-ort-hint').style.display = 'none';
  companySelect.value = '';

  await rebuildContactDropdownForAppointment('');
  await rebuildProjectDropdownForAppointment('');

  if (mode === 'new') {
    document.getElementById('modal-appointment-title').textContent = 'Neuer Termin';
    document.getElementById('t-save-btn').textContent = 'Anlegen';
    document.getElementById('t-delete-btn').style.display = 'none';

    // Prefill-Company aus Firmen-Detailseite
    if (appointmentModalPrefillCompanyId) {
      companySelect.value = appointmentModalPrefillCompanyId;
      await rebuildContactDropdownForAppointment(appointmentModalPrefillCompanyId);
      await rebuildProjectDropdownForAppointment(appointmentModalPrefillCompanyId);
      updateOrtHint();
      appointmentModalPrefillCompanyId = null;
    }

    // Prefill-Project aus Projekt-Detailseite
    if (appointmentModalPrefillProjectId) {
      // Projekt laden, um zugehörige Firma zu setzen
      const { data: proj } = await db.from('projects')
        .select('id, name, company_id').is('deleted_at', null).eq('id', appointmentModalPrefillProjectId).single();
      if (proj) {
        if (proj.company_id) {
          companySelect.value = proj.company_id;
          await rebuildContactDropdownForAppointment(proj.company_id);
          await rebuildProjectDropdownForAppointment(proj.company_id);
          updateOrtHint();
        } else {
          await rebuildProjectDropdownForAppointment('');
        }
        const projSelect = document.getElementById('t-project');
        if (projSelect) projSelect.value = proj.id;
      }
      appointmentModalPrefillProjectId = null;
    }

    // Prefill-Contact aus Kontakt-Detailseite
    if (appointmentModalPrefillContactId) {
      const { data: k } = await db.from('contacts')
        .select('id, vorname, nachname, company_id').is('deleted_at', null).eq('id', appointmentModalPrefillContactId).single();
      if (k) {
        if (k.company_id) {
          companySelect.value = k.company_id;
          await rebuildContactDropdownForAppointment(k.company_id);
          await rebuildProjectDropdownForAppointment(k.company_id);
          updateOrtHint();
        }
        document.getElementById('t-contact').value = k.id;
      }
      appointmentModalPrefillContactId = null;
    }
  } else {
    document.getElementById('modal-appointment-title').textContent = 'Termin bearbeiten';
    document.getElementById('t-save-btn').textContent = 'Speichern';
    document.getElementById('t-delete-btn').style.display = 'block';

    const { data, error } = await db.from('appointments').select('*').is('deleted_at', null).eq('id', appointmentId).single();
    if (error || !data) { showToast('Termin konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingAppointmentId = null; return; }

    document.getElementById('t-titel').value = data.titel || '';
    document.getElementById('t-datum').value = data.datum || '';
    document.getElementById('t-uhrzeit-von').value = data.uhrzeit_von ? data.uhrzeit_von.substring(0, 5) : '';
    document.getElementById('t-uhrzeit-bis').value = data.uhrzeit_bis ? data.uhrzeit_bis.substring(0, 5) : '';
    document.getElementById('t-status').value = data.status || 'geplant';
    document.getElementById('t-ort').value = data.ort || '';
    document.getElementById('t-notizen').value = data.notizen || '';
    if (data.typ_id) typSelect.value = data.typ_id;
    if (data.company_id) {
      companySelect.value = data.company_id;
      await rebuildContactDropdownForAppointment(data.company_id);
      await rebuildProjectDropdownForAppointment(data.company_id);
      if (data.contact_id) document.getElementById('t-contact').value = data.contact_id;
      updateOrtHint();
    } else {
      await rebuildProjectDropdownForAppointment('');
    }
    if (data.project_id) {
      const projSelect = document.getElementById('t-project');
      if (projSelect) projSelect.value = data.project_id;
    }
  }

  setupAppointmentAutoFill();

  document.getElementById('modal-appointment').classList.add('open');
  setTimeout(() => document.getElementById('t-titel').focus(), 100);
}

function closeAppointmentModal() {
  document.getElementById('modal-appointment').classList.remove('open');
  editingAppointmentId = null;
  appointmentModalPrefillCompanyId = null;
  appointmentModalPrefillProjectId = null;
  appointmentModalPrefillContactId = null;
  lastAutoFilledOrt = '';
}

async function rebuildContactDropdownForAppointment(companyId) {
  const contactSelect = document.getElementById('t-contact');
  if (!companyId) {
    contactSelect.innerHTML = '<option value="">— Erst Firma wählen —</option>';
    contactSelect.disabled = true;
    return;
  }
  contactSelect.disabled = false;
  const { data, error } = await db.from('contacts')
    .select('id, vorname, nachname').is('deleted_at', null).eq('company_id', companyId).order('nachname').order('vorname');
  if (error) { contactSelect.innerHTML = '<option value="">Fehler beim Laden</option>'; return; }

  const contacts = data || [];
  if (contacts.length === 0) {
    contactSelect.innerHTML = '<option value="">— Keine Kontakte bei dieser Firma —</option>';
  } else {
    contactSelect.innerHTML = '<option value="">— Kein Kontakt —</option>'
      + contacts.map(k => `<option value="${esc(k.id)}">${esc([k.vorname, k.nachname].filter(Boolean).join(' '))}</option>`).join('');
  }
}

function updateOrtHint() {
  const companyId = document.getElementById('t-company').value;
  const hint = document.getElementById('t-ort-hint');
  if (!companyId) { hint.style.display = 'none'; return; }
  const company = companiesCache.find(c => c.id === companyId);
  if (!company) { hint.style.display = 'none'; return; }
  const parts = [company.strasse, [company.plz, company.stadt].filter(Boolean).join(' ')].filter(Boolean);
  if (parts.length === 0) { hint.style.display = 'none'; return; }
  hint.innerHTML = `Firmenadresse: ${esc(parts.join(', '))} <span style="text-decoration:underline">· übernehmen</span>`;
  hint.style.display = '';
}

function useCompanyAddressForOrt() {
  const companyId = document.getElementById('t-company').value;
  if (!companyId) return;
  const company = companiesCache.find(c => c.id === companyId);
  if (!company) return;
  const parts = [company.strasse, [company.plz, company.stadt].filter(Boolean).join(' ')].filter(Boolean);
  if (parts.length === 0) return;
  const address = parts.join(', ');
  document.getElementById('t-ort').value = address;
  lastAutoFilledOrt = address;
}

function autoFillOrtIfAppropriate() {
  const typSelect = document.getElementById('t-typ');
  const typOption = typSelect.options[typSelect.selectedIndex];
  if (!typOption) return;
  const typName = (typOption.textContent || '').toLowerCase();
  if (!typName.includes('vor ort')) return;

  const ortInput = document.getElementById('t-ort');
  // Nur auto-fillen, wenn Feld leer ist oder noch den letzten Auto-Fill enthält
  if (ortInput.value !== '' && ortInput.value !== lastAutoFilledOrt) return;

  const companyId = document.getElementById('t-company').value;
  if (!companyId) return;
  const company = companiesCache.find(c => c.id === companyId);
  if (!company) return;
  const parts = [company.strasse, [company.plz, company.stadt].filter(Boolean).join(' ')].filter(Boolean);
  if (parts.length === 0) return;
  const address = parts.join(', ');
  ortInput.value = address;
  lastAutoFilledOrt = address;
}

// ═══════════════════════════════════════════════════════════
//  DATUM-SCHNELLAUSWAHL (v1.25 → v1.33 generalisiert auf Werktage + Monate)
// ═══════════════════════════════════════════════════════════
//
// Generischer Helper für alle Datums-Inputs. Jedes Container-Div mit
// `class="date-shortcuts" data-shortcut-target="<input-id>"` wird beim
// Modal-Öffnen via renderDateShortcuts() befüllt. Alle „+N Tage"-Buttons
// rechnen in Werktagen (Mo–Fr, ohne BW-Feiertage). Zusätzlich die drei
// folgenden Monatsnamen als Direkt-Sprung auf den 1. Werktag des Monats.

function isWorkday(date, holidaysByYear) {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return false;
  const year = date.getFullYear();
  if (!holidaysByYear.has(year)) holidaysByYear.set(year, computeBwHolidays(year));
  return !holidaysByYear.get(year).has(toISODate(date));
}

function nextWorkdayAfter(date, holidaysByYear) {
  const x = new Date(date);
  do { x.setDate(x.getDate() + 1); } while (!isWorkday(x, holidaysByYear));
  return x;
}

function addWorkdays(date, n, holidaysByYear) {
  const x = new Date(date);
  let added = 0;
  while (added < n) {
    x.setDate(x.getDate() + 1);
    if (isWorkday(x, holidaysByYear)) added++;
  }
  return x;
}

/** Zählt Werktage zwischen from und to inklusive (Mo–Fr, ohne BW-Feiertage). */
function countWorkdaysInclusive(fromISO, toISO) {
  if (!fromISO || !toISO) return 0;
  if (fromISO > toISO) return 0;
  const holidaysByYear = new Map();
  let count = 0;
  const x = new Date(fromISO);
  const end = new Date(toISO);
  while (x <= end) {
    if (isWorkday(x, holidaysByYear)) count++;
    x.setDate(x.getDate() + 1);
  }
  return count;
}

const MONTH_NAMES_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

/** Befüllt alle `.date-shortcuts`-Container mit Buttons für ihren target-Input (v1.33). */
function renderDateShortcuts() {
  const now = new Date();
  const m1Name = MONTH_NAMES_DE[(now.getMonth() + 1) % 12];
  const m2Name = MONTH_NAMES_DE[(now.getMonth() + 2) % 12];
  const m3Name = MONTH_NAMES_DE[(now.getMonth() + 3) % 12];
  document.querySelectorAll('.date-shortcuts[data-shortcut-target]').forEach(container => {
    const targetId = container.dataset.shortcutTarget;
    container.innerHTML = `
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','today')">Heute</button>
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','nextWorkday')">Nächster WT</button>
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','plus3wt')">+3 WT</button>
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','plus7wt')">+7 WT</button>
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','nextMonday')">Nächster Mo</button>
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','m1')">${esc(m1Name)}</button>
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','m2')">${esc(m2Name)}</button>
      <button type="button" class="date-shortcut-btn" onclick="setDateShortcut('${targetId}','m3')">${esc(m3Name)}</button>
    `;
  });
}

/** Setzt das Datum eines Inputs auf den Shortcut-Wert und feuert ein change-Event,
 *  damit abhängige Felder (z. B. d-menge bei Einsatz) reagieren können. */
function setDateShortcut(inputId, key) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const holidaysByYear = new Map();
  let target = new Date(today);

  switch (key) {
    case 'today':
      break;
    case 'nextWorkday':
      target = nextWorkdayAfter(today, holidaysByYear);
      break;
    case 'plus3wt':
      target = addWorkdays(today, 3, holidaysByYear);
      break;
    case 'plus7wt':
      target = addWorkdays(today, 7, holidaysByYear);
      break;
    case 'nextMonday': {
      const dow = today.getDay();  // 0=So, 1=Mo, ..., 6=Sa
      const offset = dow === 1 ? 7 : ((8 - dow) % 7 || 7);
      target.setDate(today.getDate() + offset);
      break;
    }
    case 'm1':
    case 'm2':
    case 'm3': {
      const delta = parseInt(key.substring(1), 10);
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth() + delta, 1);
      target = isWorkday(firstOfMonth, holidaysByYear) ? firstOfMonth : nextWorkdayAfter(firstOfMonth, holidaysByYear);
      break;
    }
    default:
      return;
  }
  input.value = toISODate(target);
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/** @deprecated v1.33 — Alias für alte Aufrufer. Neue Buttons nutzen setDateShortcut. */
function setAppointmentDateShortcut(key) {
  const mapping = { today: 'today', tomorrow: 'nextWorkday', plus3: 'plus3wt', plus7: 'plus7wt', nextMonday: 'nextMonday' };
  setDateShortcut('t-datum', mapping[key] || key);
}

/** Ganztags-Checkbox im Termin-/Einsatz-Modal (v1.33).
 *  prefix = 't' (Termin) oder 'd' (Einsatz). Wenn aktiv: 08:00–16:00 setzen + Inputs sperren. */
function applyGanztag(prefix) {
  const cb  = document.getElementById(`${prefix}-ganztag`);
  const von = document.getElementById(`${prefix}-uhrzeit-von`);
  const bis = document.getElementById(`${prefix}-uhrzeit-bis`);
  if (!cb || !von || !bis) return;
  if (cb.checked) {
    von.value = '08:00';
    bis.value = '16:00';
    von.disabled = true;
    bis.disabled = true;
  } else {
    von.disabled = false;
    bis.disabled = false;
  }
}

function setupAppointmentAutoFill() {
  const companySelect = document.getElementById('t-company');
  const typSelect = document.getElementById('t-typ');

  companySelect.onchange = async () => {
    await rebuildContactDropdownForAppointment(companySelect.value);
    await rebuildProjectDropdownForAppointment(companySelect.value);
    updateOrtHint();
    autoFillOrtIfAppropriate();
  };

  typSelect.onchange = () => {
    autoFillOrtIfAppropriate();
  };
}

async function saveAppointment() {
  const titel        = document.getElementById('t-titel').value.trim();
  const datum        = document.getElementById('t-datum').value;
  const uhrzeit_von  = document.getElementById('t-uhrzeit-von').value;
  const uhrzeit_bis  = document.getElementById('t-uhrzeit-bis').value;
  const typ_id       = document.getElementById('t-typ').value;
  const status       = document.getElementById('t-status').value;
  const company_id   = document.getElementById('t-company').value || null;
  const contact_id   = document.getElementById('t-contact').value || null;
  const project_id   = document.getElementById('t-project')?.value || null;
  const ort          = document.getElementById('t-ort').value.trim();
  const notizen      = document.getElementById('t-notizen').value.trim();
  const btn          = document.getElementById('t-save-btn');

  if (!titel)   { showToast('Bitte Titel eingeben.', true); return; }
  if (!datum)   { showToast('Bitte Datum wählen.', true); return; }
  if (!typ_id)  { showToast('Bitte Typ auswählen.', true); return; }
  if (!['geplant', 'durchgefuehrt'].includes(status)) { showToast('Status ungültig.', true); return; }

  if (uhrzeit_von && uhrzeit_bis && uhrzeit_von >= uhrzeit_bis) {
    showToast('„Uhrzeit bis" muss nach „Uhrzeit von" liegen.', true);
    return;
  }

  btn.disabled = true;
  btn.textContent = editingAppointmentId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      titel, datum,
      uhrzeit_von: uhrzeit_von || null,
      uhrzeit_bis: uhrzeit_bis || null,
      typ_id, status,
      company_id, contact_id, project_id,
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

    // Auto-Projekt-Status-Check wenn Termin an Projekt gebunden
    if (project_id) {
      await checkAndUpdateProjectStatus(project_id);
    }

    // Kontext-sensibles Refresh
    if (currentContactDetailId && document.getElementById('page-contact-detail').classList.contains('active')) {
      await loadContactAppointments(currentContactDetailId);
    } else if (currentProjectDetailId && document.getElementById('page-project-detail').classList.contains('active')) {
      await loadProjectDetail(currentProjectDetailId);
    } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
      await Promise.all([
        loadCompanyAppointments(currentCompanyDetailId),
        loadCompanyAppointmentMap()
      ]);
    } else {
      await loadAppointments();
    }
    refreshCalendarBar();  // v1.32
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingAppointmentId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteAppointment() {
  if (!editingAppointmentId) return;
  const id = editingAppointmentId;
  const ok = await confirmDialog({
    title: 'Termin löschen?',
    message: 'Der Termin wird ausgeblendet. Rückgängig-Link erscheint 5 Sekunden lang.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

  try {
    // project_id vorher merken für Status-Check
    const { data: apptInfo } = await db.from('appointments')
      .select('project_id').is('deleted_at', null).eq('id', id).single();
    const affectedProjectId = apptInfo?.project_id || null;

    const deletedAt = new Date().toISOString();
    const { error } = await db.from('appointments').update({ deleted_at: deletedAt }).eq('id', id);
    if (error) throw new Error(error.message);

    closeAppointmentModal();

    if (affectedProjectId) await checkAndUpdateProjectStatus(affectedProjectId);
    await _refreshAppointmentContext();

    showToast('Termin gelöscht.', false, {
      actionLabel: 'Rückgängig',
      durationMs: 5000,
      onAction: async () => {
        try {
          await db.from('appointments').update({ deleted_at: null }).eq('id', id);
          if (affectedProjectId) await checkAndUpdateProjectStatus(affectedProjectId);
          await _refreshAppointmentContext();
          showToast('Termin wiederhergestellt.');
        } catch (err) {
          showToast('Wiederherstellen fehlgeschlagen: ' + err.message, true);
        }
      }
    });
  } catch (e) {
    showToast(e.message, true);
  }
}

async function _refreshAppointmentContext() {
  if (currentContactDetailId && document.getElementById('page-contact-detail').classList.contains('active')) {
    await loadContactAppointments(currentContactDetailId);
  } else if (currentProjectDetailId && document.getElementById('page-project-detail').classList.contains('active')) {
    await loadProjectDetail(currentProjectDetailId);
  } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
    await Promise.all([
      loadCompanyAppointments(currentCompanyDetailId),
      loadCompanyAppointmentMap()
    ]);
  } else {
    await loadAppointments();
  }
}

// ═══════════════════════════════════════════════════════════
//  PROJEKTE (PROJECTS)
// ═══════════════════════════════════════════════════════════

async function loadProjektStatus() {
  if (projektStatusCache.length > 0) return projektStatusCache;
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe, reihenfolge').eq('kategorie', 'projekt_status').eq('ist_aktiv', true).order('reihenfolge');
  if (error) { showToast('Fehler beim Laden der Projekt-Status: ' + error.message, true); return []; }
  projektStatusCache = data || [];
  return projektStatusCache;
}

function projektStatusFarbe(wert) {
  const s = projektStatusCache.find(x => x.wert === wert);
  return s?.farbe || '#6b7280';
}

async function loadUserProfilesCache() {
  if (userProfilesCache.length > 0) return userProfilesCache;
  const { data, error } = await db.from('user_profiles')
    .select('id, name, email').in('status', ['aktiv', 'eingeladen']).order('name');
  if (error) { return []; }
  userProfilesCache = data || [];
  return userProfilesCache;
}

async function loadProjects() {
  const tbody = document.getElementById('projects-table-body');
  tbody.innerHTML = '<tr><td colspan="8"><div class="empty">Lade Projekte ...</div></td></tr>';

  await loadProjektStatus();

  // Firmen sicherstellen
  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  }

  // User sicherstellen
  await loadUserProfilesCache();

  // Filter-Dropdowns befüllen
  const statusFilter = document.getElementById('projects-status-filter');
  if (statusFilter.options.length <= 2) {
    const existing = statusFilter.value;
    let options = '<option value="">Alle Status</option><option value="_active">Aktive (Lead, Angebot, In Arbeit)</option>';
    options += projektStatusCache.map(s => `<option value="${esc(s.wert)}">${esc(s.wert)}</option>`).join('');
    statusFilter.innerHTML = options;
    if (existing) statusFilter.value = existing;
  }

  const companyFilter = document.getElementById('projects-company-filter');
  const existingComp = companyFilter.value;
  companyFilter.innerHTML = '<option value="">Alle Firmen</option><option value="__none__">Interne Projekte (ohne Firma)</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if (existingComp) companyFilter.value = existingComp;

  const userFilter = document.getElementById('projects-verantwortlicher-filter');
  const existingUser = userFilter.value;
  userFilter.innerHTML = '<option value="">Alle Verantwortlichen</option>'
    + '<option value="__none__">Ohne Verantwortlichen</option>'
    + userProfilesCache.map(u => `<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');
  if (existingUser) userFilter.value = existingUser;

  const { data, error } = await db.from('projects')
    .select('*, company:companies(id, name), verantwortlicher:user_profiles!projects_verantwortlicher_id_fkey(id, name)').is('deleted_at', null)
    .order('startdatum', { ascending: false, nullsFirst: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }

  projectsCache = data || [];
  filterProjects();
}

function filterProjects() {
  const searchTerm       = document.getElementById('projects-search').value.trim().toLowerCase();
  const statusFilterVal  = document.getElementById('projects-status-filter').value;
  const companyFilterVal = document.getElementById('projects-company-filter').value;
  const userFilterVal    = document.getElementById('projects-verantwortlicher-filter').value;

  let filtered = projectsCache;

  if (statusFilterVal === '_active') {
    filtered = filtered.filter(p => ['Lead', 'Angebot', 'In Arbeit'].includes(p.status));
  } else if (statusFilterVal) {
    filtered = filtered.filter(p => p.status === statusFilterVal);
  }

  if (companyFilterVal === '__none__') {
    filtered = filtered.filter(p => !p.company_id);
  } else if (companyFilterVal) {
    filtered = filtered.filter(p => p.company_id === companyFilterVal);
  }

  if (userFilterVal === '__none__') {
    filtered = filtered.filter(p => !p.verantwortlicher_id);
  } else if (userFilterVal) {
    filtered = filtered.filter(p => p.verantwortlicher_id === userFilterVal);
  }

  if (searchTerm) {
    filtered = filtered.filter(p => {
      const haystack = [p.name, p.beschreibung, p.notizen, p.company?.name, p.verantwortlicher?.name]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  renderProjectsTable(filtered);
}

function renderProjectsTable(projects) {
  const tbody = document.getElementById('projects-table-body');
  const countEl = document.getElementById('projects-count');

  const total = projectsCache.length;
  const shown = projects.length;
  countEl.textContent = (shown === total)
    ? `${total} Projekt${total === 1 ? '' : 'e'}`
    : `${shown} von ${total} Projekten`;

  if (shown === 0) {
    const msg = total === 0
      ? 'Noch keine Projekte angelegt. Klicke oben auf „+ Neues Projekt".'
      : 'Keine Projekte entsprechen den Filterkriterien.';
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty">${msg}</div></td></tr>`;
    return;
  }

  tbody.innerHTML = projects.map(p => {
    const statusColor = projektStatusFarbe(p.status);
    const firmaHtml = p.company_id && p.company
      ? `<div class="cell-link" onclick="navigateTo('firma', '${esc(p.company_id)}')">${esc(p.company.name)}</div>`
      : '<span style="color:var(--muted);font-style:italic">Intern</span>';
    const verantwortlich = p.verantwortlicher?.name
      ? esc(p.verantwortlicher.name)
      : '<span style="color:var(--muted);font-style:italic">—</span>';

    return `
      <tr>
        <td>
          <div class="cell-link" onclick="navigateTo('projekt', '${esc(p.id)}')">${esc(p.name)}</div>
          ${p.beschreibung ? `<div style="font-size:11px;color:var(--muted);margin-top:2px;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.beschreibung)}</div>` : ''}
        </td>
        <td><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(p.status)}</span></td>
        <td class="col-tablet">${firmaHtml}</td>
        <td class="col-desktop" style="color:var(--muted)">${verantwortlich}</td>
        <td class="col-desktop" style="color:var(--muted)">${p.startdatum ? esc(formatDateCompact(p.startdatum)) : '—'}</td>
        <td class="col-desktop" style="color:var(--muted)">${p.enddatum ? esc(formatDateCompact(p.enddatum)) : '—'}</td>
        <td class="col-tablet">${esc(formatPreis(p.geschaetzter_umsatz))}</td>
        <td class="col-action" style="text-align:right">${renderActionIcons('project', p.id)}</td>
      </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  PROJEKT-MODAL
// ═══════════════════════════════════════════════════════════

async function openProjectModal(mode, projectId = null) {
  editingProjectId = projectId;

  await loadProjektStatus();

  // Firmen laden
  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  }

  await loadUserProfilesCache();

  const statusSelect = document.getElementById('p-status');
  statusSelect.innerHTML = projektStatusCache.map(s =>
    `<option value="${esc(s.wert)}">${esc(s.wert)}</option>`).join('');

  const companySelect = document.getElementById('p-company');
  companySelect.innerHTML = '<option value="">— Intern (ohne Firma) —</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

  const userSelect = document.getElementById('p-verantwortlicher');
  userSelect.innerHTML = '<option value="">— Kein Verantwortlicher —</option>'
    + userProfilesCache.map(u => `<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');

  const hauptkontaktSelect = document.getElementById('p-hauptkontakt');
  hauptkontaktSelect.innerHTML = '<option value="">— Erst Firma wählen —</option>';
  hauptkontaktSelect.disabled = true;

  // Firma onchange → Hauptkontakt-Dropdown neu aufbauen
  companySelect.onchange = async () => {
    await rebuildHauptkontaktDropdown(companySelect.value);
  };

  document.getElementById('p-name').value = '';
  document.getElementById('p-beschreibung').value = '';
  document.getElementById('p-startdatum').value = '';
  document.getElementById('p-enddatum').value = '';
  document.getElementById('p-umsatz').value = '';
  document.getElementById('p-notizen').value = '';
  statusSelect.value = 'Angebot';
  companySelect.value = '';

  if (mode === 'new') {
    document.getElementById('modal-project-title').textContent = 'Neues Projekt';
    document.getElementById('p-save-btn').textContent = 'Anlegen';
    document.getElementById('p-delete-btn').style.display = 'none';

    // Verantwortlicher: Default = aktueller User
    if (currentUser?.id) userSelect.value = currentUser.id;

    // Prefill-Company aus Firmen-Detailseite
    if (projectModalPrefillCompanyId) {
      companySelect.value = projectModalPrefillCompanyId;
      await rebuildHauptkontaktDropdown(projectModalPrefillCompanyId);
      projectModalPrefillCompanyId = null;
    }

    // Prefill-Hauptkontakt aus Kontakt-Detailseite (setzt auch Firma vor)
    if (projectModalPrefillHauptkontaktId) {
      const { data: k } = await db.from('contacts')
        .select('id, company_id').is('deleted_at', null).eq('id', projectModalPrefillHauptkontaktId).single();
      if (k) {
        if (k.company_id) {
          companySelect.value = k.company_id;
          await rebuildHauptkontaktDropdown(k.company_id);
        }
        hauptkontaktSelect.value = k.id;
      }
      projectModalPrefillHauptkontaktId = null;
    }
  } else {
    document.getElementById('modal-project-title').textContent = 'Projekt bearbeiten';
    document.getElementById('p-save-btn').textContent = 'Speichern';
    document.getElementById('p-delete-btn').style.display = 'block';

    const { data, error } = await db.from('projects').select('*').is('deleted_at', null).eq('id', projectId).single();
    if (error || !data) { showToast('Projekt konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingProjectId = null; return; }

    document.getElementById('p-name').value = data.name || '';
    document.getElementById('p-beschreibung').value = data.beschreibung || '';
    document.getElementById('p-startdatum').value = data.startdatum || '';
    document.getElementById('p-enddatum').value = data.enddatum || '';
    document.getElementById('p-umsatz').value = data.geschaetzter_umsatz ?? '';
    document.getElementById('p-notizen').value = data.notizen || '';
    statusSelect.value = data.status || 'Angebot';
    if (data.verantwortlicher_id) userSelect.value = data.verantwortlicher_id;
    if (data.company_id) {
      companySelect.value = data.company_id;
      await rebuildHauptkontaktDropdown(data.company_id);
      if (data.hauptkontakt_id) hauptkontaktSelect.value = data.hauptkontakt_id;
    }
  }

  document.getElementById('modal-project').classList.add('open');
  setTimeout(() => document.getElementById('p-name').focus(), 100);
}

async function rebuildHauptkontaktDropdown(companyId) {
  const hauptkontaktSelect = document.getElementById('p-hauptkontakt');
  if (!companyId) {
    hauptkontaktSelect.innerHTML = '<option value="">— Erst Firma wählen —</option>';
    hauptkontaktSelect.disabled = true;
    return;
  }
  hauptkontaktSelect.disabled = false;
  const { data, error } = await db.from('contacts')
    .select('id, vorname, nachname').is('deleted_at', null).eq('company_id', companyId).order('nachname').order('vorname');
  if (error) { hauptkontaktSelect.innerHTML = '<option value="">Fehler beim Laden</option>'; return; }
  const contacts = data || [];
  if (contacts.length === 0) {
    hauptkontaktSelect.innerHTML = '<option value="">— Keine Kontakte bei dieser Firma —</option>';
  } else {
    hauptkontaktSelect.innerHTML = '<option value="">— Kein Hauptkontakt —</option>'
      + contacts.map(k => `<option value="${esc(k.id)}">${esc([k.vorname, k.nachname].filter(Boolean).join(' '))}</option>`).join('');
  }
}

function closeProjectModal() {
  document.getElementById('modal-project').classList.remove('open');
  editingProjectId = null;
  projectModalPrefillCompanyId = null;
  projectModalPrefillHauptkontaktId = null;
}

async function saveProject() {
  const name              = document.getElementById('p-name').value.trim();
  const status            = document.getElementById('p-status').value;
  const company_id        = document.getElementById('p-company').value || null;
  const hauptkontakt_id   = document.getElementById('p-hauptkontakt').value || null;
  const verantwortlicher_id = document.getElementById('p-verantwortlicher').value || null;
  const startdatum        = document.getElementById('p-startdatum').value || null;
  const enddatum          = document.getElementById('p-enddatum').value || null;
  const umsatzRaw         = document.getElementById('p-umsatz').value;
  const beschreibung      = document.getElementById('p-beschreibung').value.trim();
  const notizen           = document.getElementById('p-notizen').value.trim();
  const btn               = document.getElementById('p-save-btn');

  if (!name) { showToast('Bitte Name eingeben.', true); return; }
  if (!status) { showToast('Bitte Status auswählen.', true); return; }
  // Status gegen Lookup-Cache validieren (dynamisch statt hardcoded)
  const validProjectStatuses = projektStatusCache.map(s => s.wert);
  if (validProjectStatuses.length > 0 && !validProjectStatuses.includes(status)) {
    showToast('Status ungültig. Erlaubte Werte: ' + validProjectStatuses.join(', '), true);
    return;
  }
  if (startdatum && enddatum && startdatum > enddatum) {
    showToast('Enddatum muss nach Startdatum liegen.', true); return;
  }
  if (hauptkontakt_id && !company_id) {
    showToast('Hauptkontakt ohne Firma ist nicht möglich.', true); return;
  }

  const geschaetzter_umsatz = umsatzRaw === '' ? 0 : Number(umsatzRaw);
  if (Number.isNaN(geschaetzter_umsatz) || geschaetzter_umsatz < 0) {
    showToast('Umsatz muss eine Zahl ≥ 0 sein.', true); return;
  }

  btn.disabled = true;
  btn.textContent = editingProjectId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      name, status,
      company_id, hauptkontakt_id, verantwortlicher_id,
      startdatum, enddatum,
      geschaetzter_umsatz,
      beschreibung: beschreibung || null,
      notizen: notizen || null
    };
    if (!editingProjectId) payload.erstellt_von = currentUser?.id || null;

    const savedId = editingProjectId;

    let error;
    if (editingProjectId) { ({ error } = await db.from('projects').update(payload).eq('id', editingProjectId)); }
    else { ({ error } = await db.from('projects').insert(payload)); }
    if (error) throw new Error(error.message);

    closeProjectModal();
    showToast(savedId ? 'Projekt aktualisiert.' : 'Projekt angelegt.');

    // Kontext-sensibles Refresh
    if (savedId && currentProjectDetailId === savedId) {
      await loadProjectDetail(savedId);
    } else if (currentContactDetailId && document.getElementById('page-contact-detail').classList.contains('active')) {
      await loadContactProjects(currentContactDetailId);
    } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
      await loadCompanyProjects(currentCompanyDetailId);
    } else {
      await loadProjects();
    }
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingProjectId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteProject() {
  if (!editingProjectId) return;
  const id = editingProjectId;
  const ok = await confirmDialog({
    title: 'Projekt löschen?',
    message: 'Das Projekt wird ausgeblendet. Zugeordnete Termine verlieren die Projekt-Zuordnung nicht, werden aber über die Projekt-Liste unerreichbar. Rückgängig-Link erscheint 5 Sekunden lang.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;
  closeProjectModal();
  await _performSoftDelete('project', id);
}

// ═══════════════════════════════════════════════════════════
//  PROJEKT-DETAILSEITE
// ═══════════════════════════════════════════════════════════

async function loadProjectDetail(projectId) {
  currentProjectDetailId = projectId;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-project-detail').classList.add('active');
  document.querySelectorAll('.nav-item:not(.nav-item-group)').forEach(b => b.classList.remove('active'));
  document.getElementById('nav-projects')?.classList.add('active');
  setMobileNav('project-detail');

  document.getElementById('project-detail-name').textContent = '…';
  document.getElementById('project-detail-title').textContent = '…';
  document.getElementById('project-detail-subline').innerHTML = '';
  document.getElementById('project-detail-info').innerHTML = '<div style="color:var(--muted);font-size:13px">Lade Projekt ...</div>';
  document.getElementById('project-appointments-body').innerHTML = '<tr><td colspan="6"><div class="empty">Lade Termine ...</div></td></tr>';
  const pTasksBody = document.getElementById('project-tasks-body');
  if (pTasksBody) pTasksBody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade Aufgaben ...</div></td></tr>';

  await loadProjektStatus();

  const { data, error } = await db.from('projects')
    .select('*, company:companies(id, name), hauptkontakt:contacts(id, vorname, nachname, email, telefon), verantwortlicher:user_profiles!projects_verantwortlicher_id_fkey(id, name, email)').is('deleted_at', null)
    .eq('id', projectId).single();

  if (error || !data) {
    const msg = friendlyFetchError(error, 'Projekt');
    document.getElementById('project-detail-info').innerHTML = `<div style="color:var(--danger);font-size:13px">${esc(msg)}</div>`;
    document.getElementById('project-detail-title').textContent = msg;
    document.getElementById('project-detail-name').textContent = '—';
    document.getElementById('project-detail-subline').innerHTML = '';
    document.getElementById('project-appointments-body').innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    const depBody = document.getElementById('project-deployments-body');
    if (depBody) depBody.innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    const tasksBody = document.getElementById('project-tasks-body');
    if (tasksBody) tasksBody.innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    return;
  }

  renderProjectDetail(data);
  trackVisit('project', data.id, data.name, data.company?.name || '');
  initDetailTabs('project');
  await loadProjectAppointments(projectId);
  await loadProjectDeployments(projectId);
  await loadProjectTasks(projectId);
}

function renderProjectDetail(p) {
  document.getElementById('project-detail-name').textContent = p.name;
  document.getElementById('project-detail-title').textContent = p.name;

  const statusColor = projektStatusFarbe(p.status);
  const subline = document.getElementById('project-detail-subline');
  const sublineParts = [`<span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(p.status)}</span>`];
  if (p.company) {
    sublineParts.push(`<span>· <span class="cell-link" onclick="navigateTo('firma', '${esc(p.company.id)}')">${esc(p.company.name)}</span></span>`);
  } else {
    sublineParts.push('<span>· Internes Projekt</span>');
  }
  subline.innerHTML = sublineParts.join('');

  const editBtn = document.getElementById('project-detail-edit-btn');
  editBtn.onclick = () => openProjectModal('edit', p.id);

  document.getElementById('project-detail-add-appointment-btn').onclick = () => {
    appointmentModalPrefillProjectId = p.id;
    openAppointmentModal('new');
  };

  document.getElementById('project-detail-add-deployment-btn').onclick = () => {
    deploymentModalPrefillProjectId = p.id;
    deploymentModalPrefillCompanyId = p.company?.id || null;
    openDeploymentModal('new');
  };

  const addTaskBtn = document.getElementById('project-detail-add-task-btn');
  if (addTaskBtn) addTaskBtn.onclick = () => {
    taskModalPrefillProjectId = p.id;
    openTaskModal('new');
  };

  const hauptkontaktName = p.hauptkontakt
    ? [p.hauptkontakt.vorname, p.hauptkontakt.nachname].filter(Boolean).join(' ')
    : null;

  const verantwortlicherName = p.verantwortlicher?.name || null;

  const info = document.getElementById('project-detail-info');
  info.innerHTML = `
    <div class="detail-field">
      <div class="detail-label">Verantwortlich</div>
      <div class="detail-value">${verantwortlicherName ? esc(verantwortlicherName) : '<span class="detail-value-muted">—</span>'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Hauptkontakt</div>
      <div class="detail-value">${hauptkontaktName ? esc(hauptkontaktName) : '<span class="detail-value-muted">—</span>'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Startdatum</div>
      <div class="detail-value">${p.startdatum ? esc(formatDateDE(p.startdatum)) : '<span class="detail-value-muted">—</span>'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Enddatum (geplant)</div>
      <div class="detail-value">${p.enddatum ? esc(formatDateDE(p.enddatum)) : '<span class="detail-value-muted">—</span>'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Geschätzter Umsatz</div>
      <div class="detail-value" style="font-weight:500">${esc(formatPreis(p.geschaetzter_umsatz))}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Leistungsumsatz (Einsätze)</div>
      <div class="detail-value" id="project-detail-leistungsumsatz" style="font-weight:500;color:var(--muted)">Lade ...</div>
    </div>
  `;

  // Inline-Beschreibung + Notizen (v1.30)
  const beschreibungArea = document.getElementById('project-beschreibung-inline');
  if (beschreibungArea) {
    beschreibungArea.value = p.beschreibung || '';
    beschreibungArea.dataset.savedValue = p.beschreibung || '';
    beschreibungArea.dataset.projectId = p.id;
    document.getElementById('project-beschreibung-save-status').textContent = '';
  }
  const notizenArea = document.getElementById('project-notizen-inline');
  if (notizenArea) {
    notizenArea.value = p.notizen || '';
    notizenArea.dataset.savedValue = p.notizen || '';
    notizenArea.dataset.projectId = p.id;
    document.getElementById('project-notizen-save-status').textContent = '';
  }

  // Quick-Create-Panel (v1.30) — ersetzt die Einzelbuttons im Header der Sub-Tabs
  const qcAppt = document.getElementById('project-quick-appointment');
  if (qcAppt) qcAppt.onclick = () => { appointmentModalPrefillProjectId = p.id; openAppointmentModal('new'); };
  const qcDep = document.getElementById('project-quick-deployment');
  if (qcDep) qcDep.onclick = () => {
    deploymentModalPrefillProjectId = p.id;
    deploymentModalPrefillCompanyId = p.company?.id || null;
    openDeploymentModal('new');
  };
  const qcTask = document.getElementById('project-quick-task');
  if (qcTask) qcTask.onclick = () => { taskModalPrefillProjectId = p.id; openTaskModal('new'); };

  // Dashboard-Stats asynchron laden (v1.30)
  loadProjectDashboard(p);
}

async function loadProjectAppointments(projectId) {
  closeExpandedRow();
  const tbody = document.getElementById('project-appointments-body');
  const countEl = document.getElementById('project-appointments-count');

  const { data, error } = await db.from('appointments')
    .select('*, typ:lookup_values!appointments_typ_id_fkey(id, wert, farbe)').is('deleted_at', null)
    .eq('project_id', projectId);

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Termine';
    return;
  }

  const all = data || [];
  const total = all.length;
  setTabCount('project', 'termine', total);

  if (total === 0) {
    countEl.textContent = 'Keine Termine';
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty">Noch keine Termine für dieses Projekt. Klicke oben auf „+ Termin hinzufügen".</div></td></tr>';
    return;
  }

  const anzGeplant       = all.filter(a => a.status === 'geplant').length;
  const anzDurchgefuehrt = all.filter(a => a.status === 'durchgefuehrt').length;
  countEl.textContent = `${total} Termin${total === 1 ? '' : 'e'} · ${anzGeplant} geplant · ${anzDurchgefuehrt} durchgeführt`;

  const todayISO = toISODate(new Date());
  const upcoming = all.filter(a => a.datum >= todayISO)
    .sort((a, b) => a.datum === b.datum
      ? (a.uhrzeit_von || '').localeCompare(b.uhrzeit_von || '')
      : a.datum.localeCompare(b.datum));
  const past = all.filter(a => a.datum < todayISO)
    .sort((a, b) => a.datum === b.datum
      ? (b.uhrzeit_von || '').localeCompare(a.uhrzeit_von || '')
      : b.datum.localeCompare(a.datum));

  const sorted = upcoming.concat(past);

  tbody.innerHTML = sorted.map(a => {
    const typFarbe = a.typ?.farbe || '#6b7280';
    const typWert  = a.typ?.wert || '—';
    const isPast = a.datum < todayISO;
    const uhrzeit = a.uhrzeit_von
      ? (a.uhrzeit_bis ? `${formatTime(a.uhrzeit_von)}–${formatTime(a.uhrzeit_bis)}` : formatTime(a.uhrzeit_von))
      : '';

    // Checkbox-State: durchgefuehrt = checked
    const isDone = a.status === 'durchgefuehrt';
    const checkboxTitle = isDone ? 'Als nicht durchgeführt markieren' : 'Als durchgeführt markieren';

    return `
      <tr data-appt-id="${esc(a.id)}" data-appt-status="${esc(a.status)}">
        <td style="text-align:center">
          <input type="checkbox" class="appointment-done-check"
                 ${isDone ? 'checked' : ''}
                 onchange="toggleAppointmentDone('${esc(a.id)}', this.checked, this)"
                 title="${esc(checkboxTitle)}"
                 style="width:16px;height:16px;cursor:pointer;margin:0">
        </td>
        <td><div class="date-cell${isPast ? ' past' : ''}">${esc(formatDateDE(a.datum))}</div></td>
        <td class="col-tablet" style="color:var(--muted)">${esc(uhrzeit || '—')}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))"><span class="termin-title-icon" title="${esc(a.typ?.wert || '')}">${terminTypIcon(a.typ?.wert)}</span>${esc(a.titel || '—')}</div>
        </td>
        <td class="col-tablet">
          <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
        </td>
        <td class="appt-status-cell">
          <span class="badge" style="background:${appointmentStatusBg(a.status)};color:${appointmentStatusColor(a.status)}">${esc(appointmentStatusLabel(a.status))}</span>
        </td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="openAppointmentModal('edit', '${esc(a.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');

  // Show-All-Link immer ausblenden (wir zeigen hier ohnehin alle)
  document.getElementById('project-appointments-show-all').style.display = 'none';

  // Auto-Expand wenn genau ein Termin (v1.27.1)
  autoExpandSingleAppointmentRow(tbody, sorted);
}

// ═══════════════════════════════════════════════════════════
//  PROJEKTE AUF FIRMEN-DETAILSEITE
// ═══════════════════════════════════════════════════════════

async function loadCompanyProjects(companyId) {
  const tbody = document.getElementById('company-projects-body');
  const countEl = document.getElementById('company-projects-count');

  await loadProjektStatus();

  const { data, error } = await db.from('projects')
    .select('*').is('deleted_at', null).eq('company_id', companyId)
    .order('startdatum', { ascending: false, nullsFirst: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Projekte';
    return;
  }

  const all = data || [];
  const total = all.length;
  setTabCount('company', 'projekte', total);

  if (total === 0) {
    countEl.textContent = 'Keine Projekte';
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Noch keine Projekte für diese Firma. Klicke oben auf „+ Projekt hinzufügen".</div></td></tr>';
    return;
  }

  const anzAktiv = all.filter(p => ['Lead', 'Angebot', 'In Arbeit'].includes(p.status)).length;
  const anzAbgeschlossen = all.filter(p => p.status === 'Abgeschlossen').length;
  countEl.textContent = `${total} Projekt${total === 1 ? '' : 'e'} · ${anzAktiv} aktiv · ${anzAbgeschlossen} abgeschlossen`;

  // Sortierung: aktive zuerst, dann abgeschlossen, dann verloren
  const sortPrio = { 'In Arbeit': 1, 'Angebot': 2, 'Lead': 3, 'Abgeschlossen': 4, 'Verloren': 5 };
  const sorted = [...all].sort((a, b) => {
    const pa = sortPrio[a.status] || 99;
    const pb = sortPrio[b.status] || 99;
    if (pa !== pb) return pa - pb;
    return (b.startdatum || '').localeCompare(a.startdatum || '');
  });

  tbody.innerHTML = sorted.map(p => {
    const statusColor = projektStatusFarbe(p.status);
    return `
      <tr>
        <td>
          <div class="cell-link" onclick="navigateTo('projekt', '${esc(p.id)}')">${esc(p.name)}</div>
        </td>
        <td><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(p.status)}</span></td>
        <td class="col-tablet" style="color:var(--muted)">${p.startdatum ? esc(formatDateCompact(p.startdatum)) : '—'}</td>
        <td class="col-tablet" style="color:var(--muted)">${p.enddatum ? esc(formatDateCompact(p.enddatum)) : '—'}</td>
        <td class="col-desktop">${esc(formatPreis(p.geschaetzter_umsatz))}</td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="navigateTo('projekt', '${esc(p.id)}')">Details</button>
        </td>
      </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  PROJEKT-DROPDOWN IM TERMIN-MODAL
// ═══════════════════════════════════════════════════════════

async function rebuildProjectDropdownForAppointment(companyId) {
  const projectSelect = document.getElementById('t-project');
  if (!projectSelect) return;

  // Alle aktiven Projekte der Firma (oder interne, wenn keine Firma)
  let query = db.from('projects')
    .select('id, name, status').is('deleted_at', null)
    .in('status', ['Lead', 'Angebot', 'In Arbeit']);

  if (companyId) {
    query = query.eq('company_id', companyId);
  } else {
    query = query.is('company_id', null);
  }

  const { data, error } = await query.order('name');

  if (error) { projectSelect.innerHTML = '<option value="">Fehler beim Laden</option>'; return; }

  const projects = data || [];
  if (projects.length === 0) {
    const hint = companyId ? 'Keine aktiven Projekte bei dieser Firma' : 'Keine aktiven internen Projekte';
    projectSelect.innerHTML = `<option value="">— ${hint} —</option>`;
  } else {
    projectSelect.innerHTML = '<option value="">— Kein Projekt —</option>'
      + projects.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  }
}

// ═══════════════════════════════════════════════════════════
//  KONTAKT-DETAILSEITE
// ═══════════════════════════════════════════════════════════

async function loadContactDetail(contactId) {
  currentContactDetailId = contactId;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-contact-detail').classList.add('active');
  document.querySelectorAll('.nav-item:not(.nav-item-group)').forEach(b => b.classList.remove('active'));
  setMobileNav('contact-detail');

  document.getElementById('contact-detail-name').textContent = '…';
  document.getElementById('contact-detail-title').textContent = '…';
  document.getElementById('contact-detail-avatar').textContent = '…';
  document.getElementById('contact-detail-subline').innerHTML = '';
  document.getElementById('contact-detail-info').innerHTML = '<div style="color:var(--muted);font-size:13px">Lade Kontakt ...</div>';
  document.getElementById('contact-appointments-body').innerHTML = '<tr><td colspan="6"><div class="empty">Lade Termine ...</div></td></tr>';
  document.getElementById('contact-projects-body').innerHTML = '<tr><td colspan="6"><div class="empty">Lade Projekte ...</div></td></tr>';
  const kTasksBody = document.getElementById('contact-tasks-body');
  if (kTasksBody) kTasksBody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade Aufgaben ...</div></td></tr>';

  const { data, error } = await db.from('contacts')
    .select('*, company:companies(id, name, strasse, plz, stadt, abc_klassifizierung)').is('deleted_at', null)
    .eq('id', contactId).single();

  if (error || !data) {
    const msg = friendlyFetchError(error, 'Kontakt');
    document.getElementById('contact-detail-info').innerHTML = `<div style="color:var(--danger);font-size:13px">${esc(msg)}</div>`;
    document.getElementById('contact-detail-title').textContent = msg;
    document.getElementById('contact-detail-name').textContent = '—';
    document.getElementById('contact-detail-avatar').textContent = '—';
    document.getElementById('contact-detail-subline').innerHTML = '';
    document.getElementById('contact-appointments-body').innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    document.getElementById('contact-projects-body').innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    const emptyTasksBody = document.getElementById('contact-tasks-body');
    if (emptyTasksBody) emptyTasksBody.innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    return;
  }

  // Cache aktualisieren, damit synchroner Copy direkt klappt
  if (data.company_id) {
    if (!companyContactsMap[data.company_id]) companyContactsMap[data.company_id] = [];
    const existing = companyContactsMap[data.company_id].findIndex(k => k.id === data.id);
    if (existing >= 0) companyContactsMap[data.company_id][existing] = data;
    else companyContactsMap[data.company_id].push(data);
  }

  renderContactDetail(data);
  trackVisit('contact', data.id,
    `${data.vorname || ''} ${data.nachname || ''}`.trim() || '—',
    data.company?.name || data.email || '');
  initDetailTabs('contact');
  await Promise.all([
    loadContactAppointments(contactId),
    loadContactProjects(contactId),
    loadContactTasks(contactId),
    loadProjektStatus()
  ]);
  // Projekte nochmal rendern, falls sie vor projektStatus fertig waren
  await loadContactProjects(contactId);
}

function renderContactDetail(k) {
  const fullName = [k.vorname, k.nachname].filter(Boolean).join(' ').trim() || '(Ohne Namen)';
  document.getElementById('contact-detail-name').textContent = fullName;
  document.getElementById('contact-detail-title').textContent = fullName;
  document.getElementById('contact-detail-avatar').textContent = ini(fullName);

  // Subline: Badge + Firma-Link oder "Ohne Firma"
  const subline = document.getElementById('contact-detail-subline');
  const sublineParts = ['<span class="badge" style="background:#eff6ff;color:#1d4ed8">Kontakt</span>'];
  if (k.position) sublineParts.push(`<span>· ${esc(k.position)}</span>`);
  if (k.company) {
    sublineParts.push(`<span>· <span class="cell-link" onclick="navigateTo('firma', '${esc(k.company.id)}')">${esc(k.company.name)}</span></span>`);
  } else {
    sublineParts.push('<span>· Ohne Firma</span>');
  }
  subline.innerHTML = sublineParts.join('');

  // Buttons verdrahten
  document.getElementById('contact-detail-edit-btn').onclick = () => openContactModal('edit', k.id);
  document.getElementById('contact-detail-copy-btn').onclick = () => copyContactById(k.id);

  document.getElementById('contact-detail-add-appointment-btn').onclick = () => {
    appointmentModalPrefillContactId = k.id;
    openAppointmentModal('new');
  };

  document.getElementById('contact-detail-add-project-btn').onclick = () => {
    projectModalPrefillHauptkontaktId = k.id;
    openProjectModal('new');
  };

  const addTaskBtn = document.getElementById('contact-detail-add-task-btn');
  if (addTaskBtn) addTaskBtn.onclick = () => {
    taskModalPrefillContactId = k.id;
    openTaskModal('new');
  };

  // Quick-Create-Panel im Stammdaten-Tab (v1.24.0)
  document.getElementById('contact-quick-appointment').onclick = () => {
    appointmentModalPrefillContactId = k.id; openAppointmentModal('new');
  };
  document.getElementById('contact-quick-task').onclick = () => {
    taskModalPrefillContactId = k.id; openTaskModal('new');
  };
  document.getElementById('contact-quick-project').onclick = () => {
    projectModalPrefillHauptkontaktId = k.id; openProjectModal('new');
  };

  // ABC-Card: Klick öffnet Firma-ABC-Edit (Kontakt spiegelt die Firma-Klassifizierung).
  const abcCard = document.getElementById('contact-abc-card');
  if (abcCard) {
    if (k.company?.id) {
      abcCard.style.cursor = 'pointer';
      abcCard.onclick = () => openAbcEditModal(k.company.id, k.company.abc_klassifizierung);
    } else {
      abcCard.style.cursor = 'default';
      abcCard.onclick = null;
    }
  }

  // Umsatz-Card: Klick navigiert zur Firma
  const revenueCard = document.getElementById('contact-revenue-card');
  if (revenueCard) {
    if (k.company?.id) {
      revenueCard.style.cursor = 'pointer';
      revenueCard.onclick = () => navigateTo('firma', k.company.id);
    } else {
      revenueCard.style.cursor = 'default';
      revenueCard.onclick = null;
    }
  }

  // Schnellaktionen-Button: öffnet Quick-Actions-Modal mit Firma-Kontext (deaktiviert ohne Firma)
  const quickActionsBtn = document.getElementById('contact-quick-actions');
  if (quickActionsBtn) {
    if (k.company?.id) {
      quickActionsBtn.disabled = false;
      quickActionsBtn.onclick = () => openQuickActionsModal(k.company.id, k.company.name);
    } else {
      quickActionsBtn.disabled = true;
      quickActionsBtn.onclick = null;
    }
  }

  // ABC initial setzen (Auto-Wert kommt gleich aus loadContactDashboard)
  renderContactAbcBadge(k.company?.abc_klassifizierung || null, null, !!k.company?.id);

  // Notizen inline-editierbar
  const notesArea = document.getElementById('contact-notes-inline');
  notesArea.value = k.notizen || '';
  notesArea.dataset.savedValue = k.notizen || '';
  notesArea.dataset.contactId = k.id;
  document.getElementById('contact-notes-save-status').textContent = '';

  // Stats-Widgets asynchron laden
  loadContactDashboard(k.id, k.company?.id || null, k.company?.abc_klassifizierung || null, k.company?.name || null);

  // Detail-Grid
  const telHtml = k.telefon
    ? `<a href="tel:${esc(k.telefon)}">${esc(k.telefon)}</a>`
    : '<span class="detail-value-muted">—</span>';
  const mailHtml = k.email
    ? `<a href="mailto:${esc(k.email)}">${esc(k.email)}</a>`
    : '<span class="detail-value-muted">—</span>';
  const positionHtml = k.position
    ? esc(k.position)
    : '<span class="detail-value-muted">—</span>';
  const firmaHtml = k.company
    ? `<span class="cell-link" onclick="navigateTo('firma', '${esc(k.company.id)}')">${esc(k.company.name)}</span>`
    : '<span class="detail-value-muted">Ohne Firma</span>';

  document.getElementById('contact-detail-info').innerHTML = `
    <div class="detail-field">
      <div class="detail-label">Telefon</div>
      <div class="detail-value">${telHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">E-Mail</div>
      <div class="detail-value">${mailHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Position</div>
      <div class="detail-value">${positionHtml}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Firma</div>
      <div class="detail-value">${firmaHtml}</div>
    </div>
  `;
  // Notizen: jetzt inline im Dashboard (siehe unten, wird in loadContactDetail gesetzt)
}

async function loadContactAppointments(contactId) {
  closeExpandedRow();
  const tbody = document.getElementById('contact-appointments-body');
  const countEl = document.getElementById('contact-appointments-count');

  const { data, error } = await db.from('appointments')
    .select('*, typ:lookup_values!appointments_typ_id_fkey(id, wert, farbe)').is('deleted_at', null)
    .eq('contact_id', contactId);

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Termine';
    return;
  }

  const all = data || [];
  const total = all.length;
  setTabCount('contact', 'termine', total);

  if (total === 0) {
    countEl.textContent = 'Keine Termine';
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Noch keine Termine mit diesem Kontakt. Klicke oben auf „+ Termin hinzufügen".</div></td></tr>';
    return;
  }

  const anzGeplant       = all.filter(a => a.status === 'geplant').length;
  const anzDurchgefuehrt = all.filter(a => a.status === 'durchgefuehrt').length;
  countEl.textContent = `${total} Termin${total === 1 ? '' : 'e'} · ${anzGeplant} geplant · ${anzDurchgefuehrt} durchgeführt`;

  // Sortierung: kommende aufsteigend, dann vergangene absteigend
  const todayISO = toISODate(new Date());
  const upcoming = all.filter(a => a.datum >= todayISO)
    .sort((a, b) => a.datum === b.datum
      ? (a.uhrzeit_von || '').localeCompare(b.uhrzeit_von || '')
      : a.datum.localeCompare(b.datum));
  const past = all.filter(a => a.datum < todayISO)
    .sort((a, b) => a.datum === b.datum
      ? (b.uhrzeit_von || '').localeCompare(a.uhrzeit_von || '')
      : b.datum.localeCompare(a.datum));

  const sorted = upcoming.concat(past);

  tbody.innerHTML = sorted.map(a => {
    const typFarbe = a.typ?.farbe || '#6b7280';
    const typWert  = a.typ?.wert || '—';
    const isPast = a.datum < todayISO;
    const uhrzeit = a.uhrzeit_von
      ? (a.uhrzeit_bis ? `${formatTime(a.uhrzeit_von)}–${formatTime(a.uhrzeit_bis)}` : formatTime(a.uhrzeit_von))
      : '';

    return `
      <tr>
        <td><div class="date-cell${isPast ? ' past' : ''}">${esc(formatDateDE(a.datum))}</div></td>
        <td class="col-tablet" style="color:var(--muted)">${esc(uhrzeit || '—')}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))"><span class="termin-title-icon" title="${esc(a.typ?.wert || '')}">${terminTypIcon(a.typ?.wert)}</span>${esc(a.titel || '—')}</div>
        </td>
        <td class="col-tablet">
          <span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span>
        </td>
        <td>
          <span class="badge" style="background:${appointmentStatusBg(a.status)};color:${appointmentStatusColor(a.status)}">${esc(appointmentStatusLabel(a.status))}</span>
        </td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="openAppointmentModal('edit', '${esc(a.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');

  // Auto-Expand wenn genau ein Termin (v1.27.1)
  autoExpandSingleAppointmentRow(tbody, sorted);
}

async function loadContactProjects(contactId) {
  const tbody = document.getElementById('contact-projects-body');
  const countEl = document.getElementById('contact-projects-count');

  const { data, error } = await db.from('projects')
    .select('*').is('deleted_at', null).eq('hauptkontakt_id', contactId)
    .order('startdatum', { ascending: false, nullsFirst: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Projekte';
    return;
  }

  const all = data || [];
  const total = all.length;
  setTabCount('contact', 'projekte', total);

  if (total === 0) {
    countEl.textContent = 'Keine Projekte als Hauptkontakt';
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Dieser Kontakt ist bisher bei keinem Projekt als Hauptkontakt hinterlegt.</div></td></tr>';
    return;
  }

  const anzAktiv = all.filter(p => ['Lead', 'Angebot', 'In Arbeit'].includes(p.status)).length;
  const anzAbgeschlossen = all.filter(p => p.status === 'Abgeschlossen').length;
  countEl.textContent = `${total} Projekt${total === 1 ? '' : 'e'} · ${anzAktiv} aktiv · ${anzAbgeschlossen} abgeschlossen`;

  // Sortierung wie Firmen-Detail: aktive zuerst
  const sortPrio = { 'In Arbeit': 1, 'Angebot': 2, 'Lead': 3, 'Abgeschlossen': 4, 'Verloren': 5 };
  const sorted = [...all].sort((a, b) => {
    const pa = sortPrio[a.status] || 99;
    const pb = sortPrio[b.status] || 99;
    if (pa !== pb) return pa - pb;
    return (b.startdatum || '').localeCompare(a.startdatum || '');
  });

  tbody.innerHTML = sorted.map(p => {
    const statusColor = projektStatusFarbe(p.status);
    return `
      <tr>
        <td>
          <div class="cell-link" onclick="navigateTo('projekt', '${esc(p.id)}')">${esc(p.name)}</div>
        </td>
        <td><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(p.status)}</span></td>
        <td class="col-tablet" style="color:var(--muted)">${p.startdatum ? esc(formatDateCompact(p.startdatum)) : '—'}</td>
        <td class="col-tablet" style="color:var(--muted)">${p.enddatum ? esc(formatDateCompact(p.enddatum)) : '—'}</td>
        <td class="col-desktop">${esc(formatPreis(p.geschaetzter_umsatz))}</td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="navigateTo('projekt', '${esc(p.id)}')">Details</button>
        </td>
      </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════
//  EINSÄTZE (DEPLOYMENTS)
// ═══════════════════════════════════════════════════════════

async function loadEinsatzStatus() {
  if (einsatzStatusCache.length > 0) return einsatzStatusCache;
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe, reihenfolge').eq('kategorie', 'einsatz_status').eq('ist_aktiv', true).order('reihenfolge');
  if (error) { return []; }
  einsatzStatusCache = data || [];
  return einsatzStatusCache;
}

function einsatzStatusFarbe(wert) {
  const s = einsatzStatusCache.find(x => x.wert === wert);
  return s?.farbe || '#6b7280';
}

async function loadServicesCache() {
  if (servicesCache.length > 0) return servicesCache;
  const { data, error } = await db.from('services')
    .select('id, name, einheit, standardpreis, ist_aktiv, standard_uhrzeit_von, standard_uhrzeit_bis')
    .eq('ist_aktiv', true).order('name');
  if (error) { return []; }
  servicesCache = data || [];
  return servicesCache;
}

// Kompaktes Datum-Range-Format: "21.04.2026" oder "21.04.–23.04.2026" oder "Ungeplant"
function formatDeploymentDateRange(von, bis) {
  if (!von && !bis) return 'Ungeplant';
  if (!von) return '—';
  if (!bis || von === bis) return formatDateDE(von);
  // Beide Daten im selben Jahr?
  const vonD = parseLocalDate(von);
  const bisD = parseLocalDate(bis);
  if (vonD.getFullYear() === bisD.getFullYear()) {
    const vonStr = `${String(vonD.getDate()).padStart(2,'0')}.${String(vonD.getMonth()+1).padStart(2,'0')}.`;
    return `${vonStr}–${formatDateDE(bis).replace(/^[A-Za-z]{2}, /, '')}`;
  }
  return `${formatDateDE(von)} – ${formatDateDE(bis)}`;
}

/**
 * Rendert das Datum einer Deployment-Zeile, inkl. "Ungeplant"-Badge bei NULL.
 */
function renderDeploymentDateCell(von, bis) {
  if (!von && !bis) {
    return '<span class="badge" style="background:#f3f4f6;color:#6b7280">Ungeplant</span>';
  }
  return `<div class="date-cell">${esc(formatDeploymentDateRange(von, bis))}</div>`;
}

function calcDeploymentGesamt(menge, einzelpreis) {
  const m = Number(menge) || 0;
  const e = Number(einzelpreis) || 0;
  return m * e;
}

async function loadDeployments() {
  const tbody = document.getElementById('deployments-table-body');
  tbody.innerHTML = '<tr><td colspan="8"><div class="empty">Lade Einsätze ...</div></td></tr>';

  await loadEinsatzStatus();
  await loadServicesCache();

  // Firmen und Projekte für Filter
  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  }
  if (projectsCache.length === 0) {
    const { data: ps } = await db.from('projects').select('id, name, company_id').is('deleted_at', null).order('name');
    projectsCache = ps || [];
  }

  const companyFilter = document.getElementById('deployments-company-filter');
  const existingCompany = companyFilter.value;
  companyFilter.innerHTML = '<option value="">Alle Firmen</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if (existingCompany) companyFilter.value = existingCompany;

  const projectFilter = document.getElementById('deployments-project-filter');
  const existingProject = projectFilter.value;
  projectFilter.innerHTML = '<option value="">Alle Projekte</option><option value="__none__">Ohne Projekt (Einzelbuchung)</option>'
    + projectsCache.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
  if (existingProject) projectFilter.value = existingProject;

  const { data, error } = await db.from('deployments')
    .select('*, company:companies(id, name), project:projects(id, name), service:services(id, name, einheit)').is('deleted_at', null)
    .order('datum_von', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="8"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`; return; }

  deploymentsCache = data || [];
  filterDeployments();
}

function filterDeployments() {
  const searchTerm  = document.getElementById('deployments-search').value.trim().toLowerCase();
  const rangeFilter = document.getElementById('deployments-range-filter').value;
  const statusFilter = document.getElementById('deployments-status-filter').value;
  const companyFilterVal = document.getElementById('deployments-company-filter').value;
  const projectFilterVal = document.getElementById('deployments-project-filter').value;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  let filtered = deploymentsCache;

  // Zeitraum
  if (rangeFilter === 'unscheduled') {
    filtered = filtered.filter(d => !d.datum_von);
  } else if (rangeFilter === 'upcoming') {
    filtered = filtered.filter(d => d.datum_bis && d.datum_bis >= todayISO);
  } else if (rangeFilter === 'past') {
    filtered = filtered.filter(d => d.datum_bis && d.datum_bis < todayISO);
  } else if (rangeFilter === 'month') {
    const mStart = toISODate(new Date(today.getFullYear(), today.getMonth(), 1));
    const mEnd   = toISODate(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    filtered = filtered.filter(d => d.datum_von && d.datum_bis && d.datum_von <= mEnd && d.datum_bis >= mStart);
  } else if (rangeFilter === 'quarter') {
    const q = Math.floor(today.getMonth() / 3);
    const qStart = toISODate(new Date(today.getFullYear(), q * 3, 1));
    const qEnd   = toISODate(new Date(today.getFullYear(), q * 3 + 3, 0));
    filtered = filtered.filter(d => d.datum_von && d.datum_bis && d.datum_von <= qEnd && d.datum_bis >= qStart);
  } else if (rangeFilter === 'year') {
    const yStart = toISODate(new Date(today.getFullYear(), 0, 1));
    const yEnd   = toISODate(new Date(today.getFullYear(), 11, 31));
    filtered = filtered.filter(d => d.datum_von && d.datum_bis && d.datum_von <= yEnd && d.datum_bis >= yStart);
  }
  // 'all' zeigt alle (inkl. Ungeplante)

  if (statusFilter) filtered = filtered.filter(d => d.status === statusFilter);
  if (companyFilterVal) filtered = filtered.filter(d => d.company_id === companyFilterVal);
  if (projectFilterVal === '__none__') {
    filtered = filtered.filter(d => !d.project_id);
  } else if (projectFilterVal) {
    filtered = filtered.filter(d => d.project_id === projectFilterVal);
  }

  if (searchTerm) {
    filtered = filtered.filter(d => {
      const haystack = [d.titel, d.beschreibung, d.notizen, d.ort, d.externe_techniker,
                        d.company?.name, d.project?.name, d.service?.name]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  renderDeploymentsTable(filtered);
}

function renderDeploymentsTable(deployments) {
  closeExpandedRow();
  const tbody = document.getElementById('deployments-table-body');
  const countEl = document.getElementById('deployments-count');

  const total = deploymentsCache.length;
  const shown = deployments.length;
  countEl.textContent = (shown === total)
    ? `${total} Einsatz${total === 1 ? '' : '̈e'}`.replace('tz̈e', 'tze')
    : `${shown} von ${total} Einsätzen`;
  // Hinweis zum Umsatz aktiver Einsätze
  const umsatzAktiv = deployments
    .filter(d => ['Durchgeführt', 'Abgerechnet'].includes(d.status) && !d.project_id)
    .reduce((sum, d) => sum + calcDeploymentGesamt(d.menge, d.einzelpreis), 0);
  if (umsatzAktiv > 0) {
    countEl.textContent += ` · ${formatPreis(umsatzAktiv)} direkt abrechenbar`;
  }

  if (shown === 0) {
    const msg = total === 0
      ? 'Noch keine Einsätze angelegt. Klicke oben auf „+ Neuer Einsatz".'
      : 'Keine Einsätze entsprechen den Filterkriterien.';
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty">${msg}</div></td></tr>`;
    return;
  }

  tbody.innerHTML = deployments.map(d => {
    const statusColor = einsatzStatusFarbe(d.status);
    const firmaHtml = d.company
      ? `<div class="cell-link" onclick="navigateTo('firma', '${esc(d.company.id)}')">${esc(d.company.name)}</div>`
      : '<span style="color:var(--muted);font-style:italic">—</span>';
    const projektHtml = d.project
      ? `<div class="cell-link" onclick="navigateTo('projekt', '${esc(d.project.id)}')">${esc(d.project.name)}</div>`
      : '<span style="color:var(--muted);font-style:italic">Einzelbuchung</span>';
    const leistungHtml = d.service
      ? esc(d.service.name)
      : '<span style="color:var(--muted);font-style:italic">—</span>';
    const gesamt = calcDeploymentGesamt(d.menge, d.einzelpreis);

    return `
      <tr data-dep-id="${esc(d.id)}">
        <td>${renderDeploymentDateCell(d.datum_von, d.datum_bis)}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('deployment','${esc(d.id)}',this.closest('tr'))">${esc(d.titel || '—')}</div>
        </td>
        <td class="col-tablet">${firmaHtml}</td>
        <td class="col-desktop">${projektHtml}</td>
        <td class="col-desktop" style="color:var(--muted)">${leistungHtml}</td>
        <td><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(d.status)}</span></td>
        <td class="col-tablet">${esc(formatPreis(gesamt))}</td>
        <td class="col-action" style="text-align:right">${renderActionIcons('deployment', d.id)}</td>
      </tr>`;
  }).join('');
}

/**
 * Generiert einen Auto-Titel für den Einsatz:
 *   "Leistungsname × Firma × Benutzer"
 * Leere Teile werden übersprungen. Wird nur beim Neu-Anlegen verwendet.
 */
function generateDeploymentAutoTitle() {
  const serviceSelect = document.getElementById('d-service');
  let serviceName = '';
  if (serviceSelect.value) {
    const raw = serviceSelect.options[serviceSelect.selectedIndex]?.textContent || '';
    serviceName = raw.split(' (')[0].trim(); // Einheit-Klammer entfernen
  }

  const companySelect = document.getElementById('d-company');
  const companyName = companySelect.value
    ? (companySelect.options[companySelect.selectedIndex]?.textContent || '').trim()
    : '';

  const userName = currentProfile?.name || currentUser?.email || '';

  return [serviceName, companyName, userName].filter(Boolean).join(' × ');
}

/**
 * Generiert eine Auto-Beschreibung für den Einsatz.
 * Format: "Leistung bei Firma am Datum von/bis. Techniker: ... Ort: ..."
 * Keine Preise. Wird nur beim Neu-Anlegen verwendet.
 */
function generateDeploymentAutoDescription() {
  const lines = [];

  const serviceSelect = document.getElementById('d-service');
  let serviceName = 'Einsatz';
  if (serviceSelect.value) {
    const raw = serviceSelect.options[serviceSelect.selectedIndex]?.textContent || '';
    serviceName = raw.split(' (')[0].trim();
  }

  const companySelect = document.getElementById('d-company');
  const companyName = companySelect.value
    ? (companySelect.options[companySelect.selectedIndex]?.textContent || '').trim()
    : '';

  const datumVon = document.getElementById('d-datum-von').value;
  const datumBis = document.getElementById('d-datum-bis').value;
  const uhrzeitVon = document.getElementById('d-uhrzeit-von').value;
  const uhrzeitBis = document.getElementById('d-uhrzeit-bis').value;

  // Satz 1: Was, Wo, Wann
  let satz = `${serviceName}${companyName ? ' bei ' + companyName : ''}`;
  if (datumVon && datumBis) {
    if (datumVon === datumBis) {
      satz += ` am ${formatDateDE(datumVon)}`;
    } else {
      satz += ` vom ${formatDateDE(datumVon)} bis ${formatDateDE(datumBis)}`;
    }
    if (uhrzeitVon && uhrzeitBis) {
      satz += ` von ${uhrzeitVon} bis ${uhrzeitBis} Uhr`;
    } else if (uhrzeitVon) {
      satz += ` ab ${uhrzeitVon} Uhr`;
    }
  }
  lines.push(satz + '.');

  // Techniker
  const techniker = [];
  if (selectedTechnikerIds && selectedTechnikerIds.size > 0) {
    const internal = [...selectedTechnikerIds]
      .map(uid => userProfilesCache.find(u => u.id === uid)?.name)
      .filter(Boolean);
    techniker.push(...internal);
  }
  const externe = document.getElementById('d-externe-techniker').value.trim();
  if (externe) techniker.push(externe + ' (extern)');
  if (techniker.length > 0) {
    lines.push(`Techniker: ${techniker.join(', ')}`);
  }

  // Ort
  const ort = document.getElementById('d-ort').value.trim();
  if (ort) {
    lines.push(`Ort: ${ort}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
//  EINSATZ-MODAL
// ═══════════════════════════════════════════════════════════

async function openDeploymentModal(mode, deploymentId = null) {
  editingDeploymentId = deploymentId;
  selectedTechnikerIds = new Set();
  _deploymentMengeManuallyEdited = false;  // v1.33: Auto-Menge-Flag zurücksetzen
  renderDateShortcuts();                    // v1.33: aktuelle Monats-Buttons

  // Caches sicherstellen
  await Promise.all([loadEinsatzStatus(), loadServicesCache(), loadUserProfilesCache()]);

  if (companiesCache.length === 0) {
    const { data: cs } = await db.from('companies').select('id, name, strasse, plz, stadt').is('deleted_at', null).order('name');
    companiesCache = cs || [];
  } else {
    const { data: cs } = await db.from('companies').select('id, name, strasse, plz, stadt').is('deleted_at', null).order('name');
    companiesCache = cs || companiesCache;
  }

  const companySelect = document.getElementById('d-company');
  companySelect.innerHTML = '<option value="">— Firma wählen —</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

  // Service-Dropdown (mit data-Attributen für Auto-Fill von Preis und Zeiten)
  const serviceSelect = document.getElementById('d-service');
  serviceSelect.innerHTML = '<option value="">— Keine Leistung —</option>'
    + servicesCache.map(s => {
        const uhrzeitVon = s.standard_uhrzeit_von ? s.standard_uhrzeit_von.substring(0, 5) : '';
        const uhrzeitBis = s.standard_uhrzeit_bis ? s.standard_uhrzeit_bis.substring(0, 5) : '';
        return `<option value="${esc(s.id)}"
                  data-preis="${s.standardpreis || 0}"
                  data-einheit="${esc(s.einheit || '')}"
                  data-uhrzeit-von="${esc(uhrzeitVon)}"
                  data-uhrzeit-bis="${esc(uhrzeitBis)}">${esc(s.name)} (${esc(s.einheit || '—')})</option>`;
      }).join('');

  // Status-Select dynamisch aus Lookup-Cache
  const statusSelect = document.getElementById('d-status');
  statusSelect.innerHTML = einsatzStatusCache.map(s =>
    `<option value="${esc(s.wert)}">${esc(s.wert)}</option>`
  ).join('');
  statusSelect.value = einsatzStatusCache.find(s => s.wert === 'Geplant')?.wert || einsatzStatusCache[0]?.wert || '';

  // Felder zurücksetzen
  document.getElementById('d-titel').value = '';
  // Datum bleibt leer beim Neu-Anlegen → User kann bewusst "Ungeplant" wählen
  document.getElementById('d-datum-von').value = '';
  document.getElementById('d-datum-bis').value = '';
  document.getElementById('d-uhrzeit-von').value = '';
  document.getElementById('d-uhrzeit-bis').value = '';
  document.getElementById('d-uhrzeit-von').disabled = false;
  document.getElementById('d-uhrzeit-bis').disabled = false;
  const dGanz = document.getElementById('d-ganztag'); if (dGanz) dGanz.checked = false;
  document.getElementById('d-ort').value = '';
  document.getElementById('d-ort-hint').style.display = 'none';
  document.getElementById('d-menge').value = '1';
  document.getElementById('d-einzelpreis').value = '';
  document.getElementById('d-beschreibung').value = '';
  document.getElementById('d-notizen').value = '';
  document.getElementById('d-externe-techniker').value = '';
  document.getElementById('d-create-appointment').checked = false;
  // Redeem-State zurücksetzen (v1.14.0)
  document.getElementById('d-redeem-check').checked = false;
  document.getElementById('d-redeem-details').style.display = 'none';
  document.getElementById('d-redeem-wrap').style.display = 'none';
  const datumHintWrap = document.getElementById('d-datum-hint-wrap');
  if (datumHintWrap) datumHintWrap.style.display = '';

  renderTechnikerChipsForDeployment();
  await rebuildProjectDropdownForDeployment('');
  updateDeploymentPriceHint();

  setupDeploymentModalListeners();

  if (mode === 'new') {
    document.getElementById('modal-deployment-title').textContent = 'Neuer Einsatz';
    document.getElementById('d-save-btn').textContent = 'Anlegen';
    document.getElementById('d-delete-btn').style.display = 'none';

    // Prefill aus Firmen-Detail / Projekt-Detail
    if (deploymentModalPrefillCompanyId) {
      companySelect.value = deploymentModalPrefillCompanyId;
      await rebuildProjectDropdownForDeployment(deploymentModalPrefillCompanyId);
      updateDeploymentOrtHint();
      deploymentModalPrefillCompanyId = null;
    }
    if (deploymentModalPrefillProjectId) {
      // Projekt laden + dessen Firma setzen, falls noch nicht
      const { data: proj } = await db.from('projects')
        .select('id, name, company_id').is('deleted_at', null).eq('id', deploymentModalPrefillProjectId).single();
      if (proj) {
        if (proj.company_id) {
          companySelect.value = proj.company_id;
          await rebuildProjectDropdownForDeployment(proj.company_id);
          updateDeploymentOrtHint();
        }
        document.getElementById('d-project').value = proj.id;
      }
      deploymentModalPrefillProjectId = null;
    }
    // Service-Prefill (Schnellaktionen, v1.25)
    if (window._pendingDeploymentPrefillServiceId) {
      serviceSelect.value = window._pendingDeploymentPrefillServiceId;
      window._pendingDeploymentPrefillServiceId = null;
      // Auto-Fill von Preis/Uhrzeit/Titel anstoßen (wie wenn der User selbst klickt)
      serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    updateDeploymentPriceHint();
  } else {
    document.getElementById('modal-deployment-title').textContent = 'Einsatz bearbeiten';
    document.getElementById('d-save-btn').textContent = 'Speichern';
    document.getElementById('d-delete-btn').style.display = 'block';

    const { data, error } = await db.from('deployments').select('*').is('deleted_at', null).eq('id', deploymentId).single();
    if (error || !data) { showToast('Einsatz konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true); editingDeploymentId = null; return; }

    document.getElementById('d-titel').value = data.titel || '';
    document.getElementById('d-datum-von').value = data.datum_von || '';
    document.getElementById('d-datum-bis').value = data.datum_bis || '';
    document.getElementById('d-uhrzeit-von').value = data.uhrzeit_von ? data.uhrzeit_von.substring(0, 5) : '';
    document.getElementById('d-uhrzeit-bis').value = data.uhrzeit_bis ? data.uhrzeit_bis.substring(0, 5) : '';
    document.getElementById('d-status').value = data.status || 'Geplant';
    document.getElementById('d-ort').value = data.ort || '';
    document.getElementById('d-menge').value = data.menge ?? 1;
    _deploymentMengeManuallyEdited = true;  // v1.33: existierende Menge nicht durch Auto-Berechnung ersetzen
    document.getElementById('d-einzelpreis').value = data.einzelpreis ?? '';
    document.getElementById('d-beschreibung').value = data.beschreibung || '';
    document.getElementById('d-notizen').value = data.notizen || '';
    document.getElementById('d-externe-techniker').value = data.externe_techniker || '';

    if (data.company_id) {
      companySelect.value = data.company_id;
      await rebuildProjectDropdownForDeployment(data.company_id);
      if (data.project_id) document.getElementById('d-project').value = data.project_id;
      updateDeploymentOrtHint();
    }

    if (data.service_id) serviceSelect.value = data.service_id;

    // Techniker laden
    const { data: techRows } = await db.from('deployment_technicians')
      .select('user_id').eq('deployment_id', deploymentId);
    selectedTechnikerIds = new Set((techRows || []).map(t => t.user_id));
    renderTechnikerChipsForDeployment();

    // Verknüpften Termin prüfen
    const { data: linkedAppt } = await db.from('appointments')
      .select('id').is('deleted_at', null).eq('deployment_id', deploymentId).limit(1);
    document.getElementById('d-create-appointment').checked = (linkedAppt || []).length > 0;

    // Bestehende Redemption laden (v1.14.0)
    const { data: linkedRedemption } = await db.from('entitlement_redemptions')
      .select('entitlement_id, menge_eingeloest')
      .eq('deployment_id', deploymentId).limit(1);
    if (linkedRedemption && linkedRedemption.length > 0) {
      // Merken - wird nach refreshRedeemSection angewandt
      window._pendingRedemptionEntitlementId = linkedRedemption[0].entitlement_id;
      window._pendingRedemptionMenge = linkedRedemption[0].menge_eingeloest;
    } else {
      window._pendingRedemptionEntitlementId = null;
      window._pendingRedemptionMenge = null;
    }

    updateDeploymentPriceHint();
  }

  await refreshRedeemSection();  // v1.14.0 - lädt offene Entitlements der Firma

  document.getElementById('modal-deployment').classList.add('open');
  setTimeout(() => document.getElementById('d-titel').focus(), 100);
}

function setupDeploymentModalListeners() {
  const companySelect = document.getElementById('d-company');
  const serviceSelect = document.getElementById('d-service');
  const datumVon = document.getElementById('d-datum-von');
  const datumBis = document.getElementById('d-datum-bis');
  const menge = document.getElementById('d-menge');
  const einzelpreis = document.getElementById('d-einzelpreis');

  companySelect.onchange = async () => {
    await rebuildProjectDropdownForDeployment(companySelect.value);
    updateDeploymentOrtHint();

    // Auto-Ort: Wenn Ort-Feld leer und Firma mit Adresse gewählt → automatisch übernehmen
    const ortInput = document.getElementById('d-ort');
    if (!ortInput.value.trim() && companySelect.value) {
      const company = companiesCache.find(c => c.id === companySelect.value);
      if (company) {
        const parts = [company.strasse, [company.plz, company.stadt].filter(Boolean).join(' ')].filter(Boolean);
        if (parts.length > 0) {
          ortInput.value = parts.join(', ');
        }
      }
    }

    updateDeploymentPriceHint();
    await refreshRedeemSection();  // v1.14.0
  };

  document.getElementById('d-project').onchange = () => {
    updateDeploymentPriceHint();
  };

  serviceSelect.onchange = () => {
    // Auto-fill Einzelpreis aus Service-Standardpreis, wenn noch leer
    const opt = serviceSelect.options[serviceSelect.selectedIndex];
    const preis = opt?.getAttribute('data-preis');
    const uhrzeitVon = opt?.getAttribute('data-uhrzeit-von');
    const uhrzeitBis = opt?.getAttribute('data-uhrzeit-bis');

    const currentPreis = document.getElementById('d-einzelpreis').value;
    if (preis && (currentPreis === '' || Number(currentPreis) === 0)) {
      document.getElementById('d-einzelpreis').value = preis;
    }

    // Auto-fill Uhrzeiten aus Service-Defaults, wenn Felder leer
    const dVon = document.getElementById('d-uhrzeit-von');
    const dBis = document.getElementById('d-uhrzeit-bis');
    if (uhrzeitVon && !dVon.value) dVon.value = uhrzeitVon;
    if (uhrzeitBis && !dBis.value) dBis.value = uhrzeitBis;

    updateDeploymentPriceHint();
  };

  // Gemeinsamer Handler für Datums-Änderungen — v1.33 auto-Menge nach Werktagen.
  const onDatumChange = () => {
    // datum_bis mit-anpassen wenn vorher = datum_von oder leer
    if (datumVon.value && (!datumBis.value || datumBis.value < datumVon.value)) {
      datumBis.value = datumVon.value;
    }
    recomputeDeploymentMengeFromDates();
  };
  datumVon.onchange = onDatumChange;
  datumBis.onchange = onDatumChange;

  // User-Edit auf Menge setzt den Manual-Override-Flag, damit die Auto-Berechnung
  // die manuelle Eingabe nicht überschreibt.
  menge.addEventListener('input', (e) => {
    if (e.isTrusted) _deploymentMengeManuallyEdited = true;
    updateDeploymentPriceHint();
  });
  einzelpreis.oninput = updateDeploymentPriceHint;

  // Reset-Icon neben Menge
  const resetBtn = document.getElementById('d-menge-reset');
  if (resetBtn) {
    resetBtn.onclick = () => {
      _deploymentMengeManuallyEdited = false;
      recomputeDeploymentMengeFromDates(true);
    };
  }
}

/** Werktags-Menge aus datum_von/bis berechnen (v1.33). Überschreibt Menge nicht,
 *  wenn der User bereits manuell editiert hat — außer `force=true` (Reset-Icon). */
function recomputeDeploymentMengeFromDates(force = false) {
  if (!force && _deploymentMengeManuallyEdited) return;
  const von = document.getElementById('d-datum-von').value;
  const bis = document.getElementById('d-datum-bis').value || von;
  if (!von) return;
  const workdays = countWorkdaysInclusive(von, bis);
  if (workdays < 1) return;
  const mengeInput = document.getElementById('d-menge');
  mengeInput.value = String(workdays);
  updateDeploymentPriceHint();
}

function updateDeploymentOrtHint() {
  const companyId = document.getElementById('d-company').value;
  const hint = document.getElementById('d-ort-hint');
  if (!companyId) { hint.style.display = 'none'; return; }
  const company = companiesCache.find(c => c.id === companyId);
  if (!company) { hint.style.display = 'none'; return; }
  const parts = [company.strasse, [company.plz, company.stadt].filter(Boolean).join(' ')].filter(Boolean);
  if (parts.length === 0) { hint.style.display = 'none'; return; }
  hint.innerHTML = `Firmenadresse: ${esc(parts.join(', '))} <span style="text-decoration:underline">· übernehmen</span>`;
  hint.style.display = '';
}

function useCompanyAddressForDeploymentOrt() {
  const companyId = document.getElementById('d-company').value;
  if (!companyId) return;
  const company = companiesCache.find(c => c.id === companyId);
  if (!company) return;
  const parts = [company.strasse, [company.plz, company.stadt].filter(Boolean).join(' ')].filter(Boolean);
  if (parts.length === 0) return;
  document.getElementById('d-ort').value = parts.join(', ');
}

function updateDeploymentPriceHint() {
  const hintEl = document.getElementById('d-preis-hint');
  const mengeGroup = document.getElementById('d-menge-group');
  const preisGroup = document.getElementById('d-einzelpreis-group');
  const menge = Number(document.getElementById('d-menge').value) || 0;
  const einzel = Number(document.getElementById('d-einzelpreis').value) || 0;
  const gesamt = menge * einzel;
  const projectId = document.getElementById('d-project').value;
  const projectSelect = document.getElementById('d-project');
  const projectName = projectId ? (projectSelect.options[projectSelect.selectedIndex]?.textContent || 'Projekt') : null;

  // Menge + Einzelpreis immer sichtbar — auch bei Projekt, damit Mehr-/Mindereinsätze trackbar sind
  mengeGroup.style.display = '';
  preisGroup.style.display = '';

  if (projectId) {
    // Projekt-Zuordnung: Hinweis, dass Wert nur für internes Tracking ist
    hintEl.innerHTML = `Interner Wert: <strong>${esc(formatPreis(gesamt))}</strong> · Nur zum Aufwands-Tracking. Kundenumsatz läuft über Projekt-Paketpreis „${esc(projectName)}".`;
  } else {
    // Einzelbuchung: Gesamt-Preis wird direkt abgerechnet
    hintEl.innerHTML = `Gesamt: <strong>${esc(formatPreis(gesamt))}</strong> · Wird direkt dem Kunden berechnet.`;
  }
}

async function rebuildProjectDropdownForDeployment(companyId) {
  const select = document.getElementById('d-project');
  if (!select) return;
  if (!companyId) {
    select.innerHTML = '<option value="">— Kein Projekt (Einzelbuchung) —</option>';
    return;
  }
  const { data, error } = await db.from('projects')
    .select('id, name, status').is('deleted_at', null).eq('company_id', companyId)
    .in('status', ['Lead', 'Angebot', 'In Arbeit', 'Abgeschlossen'])
    .order('name');
  if (error) { select.innerHTML = '<option value="">Fehler beim Laden</option>'; return; }
  const projects = data || [];
  select.innerHTML = '<option value="">— Kein Projekt (Einzelbuchung) —</option>'
    + projects.map(p => `<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.status)}</option>`).join('');
}

function renderTechnikerChipsForDeployment() {
  const wrap = document.getElementById('d-techniker-list');
  if (userProfilesCache.length === 0) {
    wrap.innerHTML = '<span style="font-size:12px;color:var(--muted)">Keine internen Techniker verfügbar.</span>';
    return;
  }
  wrap.innerHTML = userProfilesCache.map(u => {
    const selected = selectedTechnikerIds.has(u.id);
    return `
      <div class="techniker-chip${selected ? ' selected' : ''}" data-user-id="${esc(u.id)}"
           onclick="toggleTechnikerChip('${esc(u.id)}')">
        <span class="techniker-chip-avatar">${esc(ini(u.name))}</span>
        <span>${esc(u.name)}</span>
      </div>`;
  }).join('');
}

function toggleTechnikerChip(userId) {
  if (selectedTechnikerIds.has(userId)) selectedTechnikerIds.delete(userId);
  else selectedTechnikerIds.add(userId);
  renderTechnikerChipsForDeployment();
}

function closeDeploymentModal() {
  document.getElementById('modal-deployment').classList.remove('open');
  editingDeploymentId = null;
  deploymentModalPrefillCompanyId = null;
  deploymentModalPrefillProjectId = null;
  selectedTechnikerIds = new Set();
}

async function saveDeployment() {
  const titel         = document.getElementById('d-titel').value.trim();
  const datum_von     = document.getElementById('d-datum-von').value;
  const datum_bis     = document.getElementById('d-datum-bis').value;
  const uhrzeit_von   = document.getElementById('d-uhrzeit-von').value;
  const uhrzeit_bis   = document.getElementById('d-uhrzeit-bis').value;
  const status        = document.getElementById('d-status').value;
  const company_id    = document.getElementById('d-company').value || null;
  const project_id    = document.getElementById('d-project').value || null;
  const service_id    = document.getElementById('d-service').value || null;
  const mengeRaw      = document.getElementById('d-menge').value;
  const einzelRaw     = document.getElementById('d-einzelpreis').value;
  const ort           = document.getElementById('d-ort').value.trim();
  const beschreibungInput = document.getElementById('d-beschreibung').value.trim();
  const notizen       = document.getElementById('d-notizen').value.trim();
  const externe_techniker = document.getElementById('d-externe-techniker').value.trim();
  const createAppointment = document.getElementById('d-create-appointment').checked;
  const btn           = document.getElementById('d-save-btn');

  // Auto-Titel + Auto-Beschreibung nur beim Neu-Anlegen (nicht beim Edit)
  const isNew = !editingDeploymentId;
  const finalTitel = titel || (isNew ? generateDeploymentAutoTitle() : '');
  const finalBeschreibung = beschreibungInput || (isNew ? generateDeploymentAutoDescription() : '');

  if (!finalTitel) { showToast('Bitte Titel eingeben (oder Leistung/Firma wählen für Auto-Titel).', true); return; }
  if (!company_id) { showToast('Bitte Firma auswählen.', true); return; }

  // Datum: entweder beide gesetzt oder beide leer (Ungeplant)
  const vonGesetzt = !!datum_von;
  const bisGesetzt = !!datum_bis;
  if (vonGesetzt !== bisGesetzt) {
    showToast('Bitte entweder beide Daten setzen oder beide leer lassen (Ungeplant).', true);
    return;
  }
  if (vonGesetzt && bisGesetzt && datum_bis < datum_von) {
    showToast('Datum bis muss nach Datum von liegen.', true); return;
  }

  if (!['Geplant', 'Durchgeführt', 'Abgerechnet', 'Storniert'].includes(status) &&
      !einsatzStatusCache.some(s => s.wert === status)) {
    showToast('Status ungültig. Bitte aus Liste wählen.', true); return;
  }
  if (uhrzeit_von && uhrzeit_bis && uhrzeit_von >= uhrzeit_bis) {
    showToast('„Uhrzeit bis" muss nach „Uhrzeit von" liegen.', true); return;
  }
  // Uhrzeit ohne Datum macht keinen Sinn — Warnung
  if (!vonGesetzt && (uhrzeit_von || uhrzeit_bis)) {
    showToast('Uhrzeit ohne Datum nicht möglich. Bitte Datum setzen oder Uhrzeit leeren.', true);
    return;
  }

  const menge = mengeRaw === '' ? 1 : Number(mengeRaw);
  if (Number.isNaN(menge) || menge < 0) { showToast('Menge muss eine Zahl ≥ 0 sein.', true); return; }
  const einzelpreis = einzelRaw === '' ? 0 : Number(einzelRaw);
  if (Number.isNaN(einzelpreis) || einzelpreis < 0) { showToast('Einzelpreis muss eine Zahl ≥ 0 sein.', true); return; }

  btn.disabled = true;
  btn.textContent = editingDeploymentId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    const payload = {
      titel: finalTitel,
      datum_von: datum_von || null,
      datum_bis: datum_bis || null,
      uhrzeit_von: uhrzeit_von || null,
      uhrzeit_bis: uhrzeit_bis || null,
      status,
      company_id, project_id, service_id,
      menge, einzelpreis,
      ort: ort || null,
      beschreibung: finalBeschreibung || null,
      notizen: notizen || null,
      externe_techniker: externe_techniker || null
    };
    if (!editingDeploymentId) payload.erstellt_von = currentUser?.id || null;

    let saved;
    if (editingDeploymentId) {
      const { data, error } = await db.from('deployments').update(payload).eq('id', editingDeploymentId).select().single();
      if (error) throw new Error(error.message);
      saved = data;
    } else {
      const { data, error } = await db.from('deployments').insert(payload).select().single();
      if (error) throw new Error(error.message);
      saved = data;
    }

    // ──────── Techniker-Relations synchronisieren ────────
    // Zuerst alle existierenden löschen, dann neu anlegen (simpler als Diff)
    await db.from('deployment_technicians').delete().eq('deployment_id', saved.id);
    if (selectedTechnikerIds.size > 0) {
      const techRows = [...selectedTechnikerIds].map(uid => ({ deployment_id: saved.id, user_id: uid }));
      const { error: techErr } = await db.from('deployment_technicians').insert(techRows);
      if (techErr) {
        console.warn('Techniker konnten nicht gespeichert werden:', techErr.message);
        showToast('Einsatz gespeichert, Techniker-Zuordnung fehlgeschlagen.', true);
      }
    }

    // ──────── Termin-Kopplung ────────
    await syncDeploymentAppointment(saved, createAppointment);

    // ──────── Entitlement-Einlösung (v1.14.0) ────────
    try {
      await syncDeploymentRedemption(saved.id);
    } catch (redeemErr) {
      // Einsatz ist bereits gespeichert - Redemption-Fehler als Warnung zeigen, nicht abbrechen
      showToast('Einsatz gespeichert, aber: ' + redeemErr.message, true);
    }

    closeDeploymentModal();
    showToast(editingDeploymentId ? 'Einsatz aktualisiert.' : 'Einsatz angelegt.');

    // Auto-Projekt-Status-Check wenn Einsatz an Projekt gebunden
    if (saved.project_id) {
      await checkAndUpdateProjectStatus(saved.project_id);
    }

    // Kontext-sensibles Refresh
    if (currentProjectDetailId && document.getElementById('page-project-detail').classList.contains('active')) {
      await loadProjectDetail(currentProjectDetailId);
    } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
      await loadCompanyDeployments(currentCompanyDetailId);
      // Memberships-Section neu rendern, damit Fortschritt aktualisiert wird
      await renderCompanyMemberships(currentCompanyDetailId);
    } else {
      await loadDeployments();
    }
    refreshCalendarBar();  // v1.32
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingDeploymentId ? 'Speichern' : 'Anlegen';
  }
}

/**
 * Synchronisiert einen Termin zum Einsatz basierend auf Checkbox-Status.
 * Semantik (v1.9.4): Checkbox=Termin-Existenz, keine halben Sachen.
 * - Checkbox an + kein Termin          → neuen Termin anlegen
 * - Checkbox an + Termin existiert     → Termin updaten
 * - Checkbox aus + Termin existiert    → Termin LÖSCHEN (verhindert Duplikate)
 * - Checkbox aus + kein Termin         → nichts tun
 * - Kein Datum am Einsatz              → existierenden Termin löschen (Termin braucht Datum)
 */
async function syncDeploymentAppointment(deployment, shouldHaveAppointment) {
  const { data: existing } = await db.from('appointments')
    .select('id').is('deleted_at', null).eq('deployment_id', deployment.id).limit(1);
  const existingId = existing?.[0]?.id;

  // Ohne Datum kann kein Termin angelegt werden (Termine brauchen Datum)
  if (!deployment.datum_von) {
    if (existingId) {
      await db.from('appointments').update({ deleted_at: new Date().toISOString() }).eq('id', existingId);
    }
    if (shouldHaveAppointment) {
      showToast('Termin-Kopplung benötigt ein Datum. Bitte Datum setzen und erneut speichern.', true);
    }
    return;
  }

  if (!shouldHaveAppointment) {
    if (existingId) {
      // Hart löschen — Entkopplung würde bei erneutem Anhaken Duplikate erzeugen
      await db.from('appointments').update({ deleted_at: new Date().toISOString() }).eq('id', existingId);
    }
    return;
  }

  // Default-Termintyp: "Vor Ort" suchen, sonst erster aktiver
  await loadTerminTypen();
  const typVorOrt = terminTypenCache.find(t => /vor[- ]?ort/i.test(t.wert)) || terminTypenCache[0];
  const typ_id = typVorOrt?.id || null;

  // Terminstatus: Geplant → 'geplant', sonst 'durchgefuehrt'
  const terminStatus = deployment.status === 'Geplant' ? 'geplant' : 'durchgefuehrt';

  const payload = {
    titel: deployment.titel,
    datum: deployment.datum_von,
    uhrzeit_von: deployment.uhrzeit_von,
    uhrzeit_bis: deployment.uhrzeit_bis,
    status: terminStatus,
    company_id: deployment.company_id,
    project_id: deployment.project_id,
    ort: deployment.ort,
    notizen: deployment.notizen ? `[Einsatz-Termin]\n${deployment.notizen}` : '[Einsatz-Termin]',
    typ_id,
    deployment_id: deployment.id
  };

  if (existingId) {
    await db.from('appointments').update(payload).eq('id', existingId);
  } else {
    payload.erstellt_von = currentUser?.id || null;
    await db.from('appointments').insert(payload);
  }
}

// ═══════════════════════════════════════════════════════════
//  ENTITLEMENT-EINLÖSUNG IM EINSATZ-MODAL (v1.14.0)
// ═══════════════════════════════════════════════════════════

/**
 * Lädt offene Entitlements der gewählten Firma und befüllt das Dropdown.
 * Wird bei Firmenwechsel und beim Modal-Open aufgerufen.
 */
async function refreshRedeemSection() {
  const companyId = document.getElementById('d-company').value;
  const wrap = document.getElementById('d-redeem-wrap');
  const select = document.getElementById('d-redeem-entitlement');
  const check = document.getElementById('d-redeem-check');
  const hint = document.getElementById('d-redeem-hint');

  // Ohne Firma: Section verstecken
  if (!companyId) {
    wrap.style.display = 'none';
    check.checked = false;
    document.getElementById('d-redeem-details').style.display = 'none';
    return;
  }

  // Offene Entitlements der Firma laden (inkl. bereits-eingeloester Mengen)
  const { data: entitlements, error } = await db.from('entitlements')
    .select(`
      *,
      memberships(mitgliedsnummer, membership_programs(name)),
      projects(name)
    `)
    .eq('company_id', companyId)
    .order('verfall_datum', { ascending: true, nullsFirst: false });

  if (error) {
    wrap.style.display = 'none';
    return;
  }

  // Für jedes Entitlement: wie viel ist bereits eingelöst?
  const entIds = (entitlements || []).map(e => e.id);
  let redemptionsByEnt = {};
  if (entIds.length > 0) {
    const { data: redemptions } = await db.from('entitlement_redemptions')
      .select('entitlement_id, menge_eingeloest, deployment_id')
      .in('entitlement_id', entIds);
    (redemptions || []).forEach(r => {
      // Bei Edit: die eigene bestehende Redemption bei der Rest-Berechnung NICHT abziehen
      // (damit man sie in einem Schritt anpassen kann)
      if (editingDeploymentId && r.deployment_id === editingDeploymentId) return;
      redemptionsByEnt[r.entitlement_id] = (redemptionsByEnt[r.entitlement_id] || 0) + Number(r.menge_eingeloest || 0);
    });
  }

  // Nur Entitlements mit offener Menge > 0 ODER bereits verknüpfte bestehende Redemption anzeigen
  const offen = (entitlements || []).filter(e => {
    const rest = Number(e.gesamt_menge) - (redemptionsByEnt[e.id] || 0);
    const istAktuelleRedemption = window._pendingRedemptionEntitlementId === e.id;
    return rest > 0 || istAktuelleRedemption;
  });

  if (offen.length === 0) {
    wrap.style.display = 'block';
    check.checked = false;
    check.disabled = true;
    document.getElementById('d-redeem-details').style.display = 'none';
    hint.textContent = 'Diese Firma hat aktuell keine offenen Bonis.';
    return;
  }

  hint.textContent = 'Wähle einen offenen Bonus aus den Mitgliedschaften/Projekten dieser Firma.';
  check.disabled = false;
  wrap.style.display = 'block';

  // Dropdown befüllen
  select.innerHTML = offen.map(e => {
    const rest = Number(e.gesamt_menge) - (redemptionsByEnt[e.id] || 0);
    const quelle = e.memberships
      ? `Mitgliedschaft: ${e.memberships.membership_programs?.name || '?'}`
      : e.projects
        ? `Projekt: ${e.projects.name}`
        : 'Manuell';
    const verfallInfo = e.verfall_datum ? ` · bis ${formatDateDE(e.verfall_datum)}` : '';
    return `<option value="${esc(e.id)}" data-rest="${rest}" data-gesamt="${e.gesamt_menge}">
      ${esc(e.titel)} (${rest} offen${verfallInfo}) — ${esc(quelle)}
    </option>`;
  }).join('');

  // Bei Edit-Mode: bestehende Redemption wieder anwenden
  if (window._pendingRedemptionEntitlementId) {
    check.checked = true;
    select.value = window._pendingRedemptionEntitlementId;
    document.getElementById('d-redeem-menge').value = window._pendingRedemptionMenge || 1;
    document.getElementById('d-redeem-details').style.display = 'block';
    onRedeemEntitlementChange();
    // Nach Anwendung löschen, damit nicht erneut angewandt wird
    window._pendingRedemptionEntitlementId = null;
    window._pendingRedemptionMenge = null;
  } else if (check.checked) {
    onRedeemEntitlementChange();
  }
}

/** Togglet den Details-Bereich beim Klick auf die Haupt-Checkbox. */
function onRedeemCheckToggle() {
  const check = document.getElementById('d-redeem-check');
  const details = document.getElementById('d-redeem-details');
  if (check.checked) {
    details.style.display = 'block';
    onRedeemEntitlementChange();
  } else {
    details.style.display = 'none';
  }
}

/** Aktualisiert den Mengen-Hinweis bei Entitlement-Auswahl. */
function onRedeemEntitlementChange() {
  const select = document.getElementById('d-redeem-entitlement');
  const mengeInput = document.getElementById('d-redeem-menge');
  const mengeHint = document.getElementById('d-redeem-menge-hint');
  const opt = select.options[select.selectedIndex];
  if (!opt) { mengeHint.textContent = ''; return; }

  const rest = Number(opt.getAttribute('data-rest') || 0);
  const gesamt = Number(opt.getAttribute('data-gesamt') || 0);
  mengeInput.max = rest;
  mengeHint.textContent = `Maximal ${rest} von ${gesamt} verbleibend.`;

  // Bei Einzel-Bonis (gesamt=1) Menge auf 1 fixieren
  if (gesamt === 1) {
    mengeInput.value = 1;
    mengeInput.readOnly = true;
    mengeHint.textContent = 'Einzel-Bonus: wird vollständig eingelöst.';
  } else {
    mengeInput.readOnly = false;
    if (Number(mengeInput.value) > rest) mengeInput.value = rest;
  }
}

/**
 * Schreibt oder aktualisiert die Redemption für einen Einsatz.
 * Wird aus saveDeployment aufgerufen nach erfolgreichem Speichern.
 */
async function syncDeploymentRedemption(deploymentId) {
  const wantRedeem = document.getElementById('d-redeem-check').checked;
  const entitlementId = document.getElementById('d-redeem-entitlement').value;
  const mengeRaw = document.getElementById('d-redeem-menge').value;
  const menge = Number(mengeRaw);

  // Bestehende Redemption für diesen Einsatz holen
  const { data: existing } = await db.from('entitlement_redemptions')
    .select('id, entitlement_id')
    .eq('deployment_id', deploymentId).limit(1);
  const existingRedemption = existing && existing.length > 0 ? existing[0] : null;

  // Fall A: Soll gelöscht werden (Checkbox aus, aber Redemption existiert)
  if (!wantRedeem) {
    if (existingRedemption) {
      await db.from('entitlement_redemptions').delete().eq('id', existingRedemption.id);
    }
    return;
  }

  // Validierung
  if (!entitlementId) throw new Error('Bitte einen Bonus auswählen oder die Einlöse-Checkbox deaktivieren.');
  if (!menge || menge <= 0) throw new Error('Einlöse-Menge muss > 0 sein.');

  const payload = {
    entitlement_id: entitlementId,
    deployment_id: deploymentId,
    menge_eingeloest: menge,
    einloesung_datum: new Date().toISOString().slice(0, 10),
    erstellt_von: currentProfile?.id || null
  };

  if (existingRedemption) {
    // Update (bei Entitlement-Wechsel: erst löschen, dann neu)
    if (existingRedemption.entitlement_id !== entitlementId) {
      await db.from('entitlement_redemptions').delete().eq('id', existingRedemption.id);
      const { error } = await db.from('entitlement_redemptions').insert(payload);
      if (error) throw new Error('Einlösung konnte nicht gespeichert werden: ' + error.message);
    } else {
      const { error } = await db.from('entitlement_redemptions')
        .update({ menge_eingeloest: menge })
        .eq('id', existingRedemption.id);
      if (error) throw new Error('Einlösung konnte nicht aktualisiert werden: ' + error.message);
    }
  } else {
    const { error } = await db.from('entitlement_redemptions').insert(payload);
    if (error) throw new Error('Einlösung konnte nicht gespeichert werden: ' + error.message);
  }
}

async function deleteDeployment() {
  if (!editingDeploymentId) return;
  const id = editingDeploymentId;

  // Prüfen, ob Redemptions existieren (für die Warnung im Confirm)
  const { data: existingReds } = await db.from('entitlement_redemptions')
    .select('id').eq('deployment_id', id);
  const hasRedemptions = (existingReds || []).length > 0;

  const ok = await confirmDialog({
    title: 'Einsatz löschen?',
    message: hasRedemptions
      ? 'Der Einsatz wird ausgeblendet. Verknüpfte Termine werden mit-ausgeblendet und sind über die Rückgängig-Aktion wieder erreichbar.<br><br><strong>Bonus-Einlösungen werden hart gelöscht</strong> und können nicht über Rückgängig wiederhergestellt werden.'
      : 'Der Einsatz und der gekoppelte Termin werden ausgeblendet. Rückgängig-Link erscheint 5 Sekunden lang.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

  try {
    // project_id + company_id vorher merken für Status-Check nach Löschung
    const { data: depInfo } = await db.from('deployments')
      .select('project_id, company_id').is('deleted_at', null).eq('id', id).single();
    const affectedProjectId = depInfo?.project_id || null;
    const affectedCompanyId = depInfo?.company_id || null;

    // Gekoppelte Termine erst: IDs merken + soft-delete
    const { data: appts } = await db.from('appointments').select('id').is('deleted_at', null).eq('deployment_id', id);
    const coupledApptIds = (appts || []).map(a => a.id);
    const deletedAt = new Date().toISOString();
    if (coupledApptIds.length) {
      await db.from('appointments').update({ deleted_at: deletedAt }).eq('deployment_id', id);
    }

    // Zugehörige Redemptions hart löschen (v1.14.0) — NICHT über Undo wiederherstellbar
    await db.from('entitlement_redemptions').delete().eq('deployment_id', id);

    const { error } = await db.from('deployments').update({ deleted_at: deletedAt }).eq('id', id);
    if (error) throw new Error(error.message);

    closeDeploymentModal();

    if (affectedProjectId) await checkAndUpdateProjectStatus(affectedProjectId);
    await _refreshDeploymentContext(affectedCompanyId);

    showToast('Einsatz gelöscht.', false, {
      actionLabel: 'Rückgängig',
      durationMs: 5000,
      onAction: async () => {
        try {
          await db.from('deployments').update({ deleted_at: null }).eq('id', id);
          if (coupledApptIds.length) {
            await db.from('appointments').update({ deleted_at: null }).in('id', coupledApptIds);
          }
          if (affectedProjectId) await checkAndUpdateProjectStatus(affectedProjectId);
          await _refreshDeploymentContext(affectedCompanyId);
          showToast(hasRedemptions
            ? 'Einsatz wiederhergestellt (Bonus-Einlösungen bleiben gelöscht).'
            : 'Einsatz wiederhergestellt.');
        } catch (err) {
          showToast('Wiederherstellen fehlgeschlagen: ' + err.message, true);
        }
      }
    });
  } catch (e) {
    showToast(e.message, true);
  }
}

async function _refreshDeploymentContext(companyId) {
  if (currentProjectDetailId && document.getElementById('page-project-detail').classList.contains('active')) {
    await loadProjectDetail(currentProjectDetailId);
  } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
    await loadCompanyDeployments(currentCompanyDetailId);
    if (companyId) await renderCompanyMemberships(companyId);
  } else {
    await loadDeployments();
  }
}

// ═══════════════════════════════════════════════════════════
//  EINSÄTZE AUF FIRMA-DETAIL
// ═══════════════════════════════════════════════════════════

async function loadCompanyDeployments(companyId) {
  closeExpandedRow();
  const tbody = document.getElementById('company-deployments-body');
  const countEl = document.getElementById('company-deployments-count');

  await loadEinsatzStatus();

  const { data, error } = await db.from('deployments')
    .select('*, project:projects(id, name), service:services(id, name)').is('deleted_at', null)
    .eq('company_id', companyId)
    .order('datum_von', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Einsätze';
    return;
  }

  const all = data || [];
  const total = all.length;
  setTabCount('company', 'einsaetze', total);

  if (total === 0) {
    countEl.textContent = 'Keine Einsätze';
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Noch keine Einsätze für diese Firma. Klicke oben auf „+ Einsatz hinzufügen".</div></td></tr>';
    return;
  }

  const umsatz = all
    .filter(d => !d.project_id && ['Durchgeführt', 'Abgerechnet'].includes(d.status))
    .reduce((sum, d) => sum + calcDeploymentGesamt(d.menge, d.einzelpreis), 0);

  countEl.textContent = `${total} Einsatz${total === 1 ? '' : 'e'}`
    + (umsatz > 0 ? ` · ${formatPreis(umsatz)} direkt abrechenbar` : '');

  tbody.innerHTML = all.map(d => {
    const statusColor = einsatzStatusFarbe(d.status);
    const projektHtml = d.project
      ? `<div class="cell-link" onclick="navigateTo('projekt', '${esc(d.project.id)}')">${esc(d.project.name)}</div>`
      : '<span style="color:var(--muted);font-style:italic">Einzelbuchung</span>';
    const gesamt = calcDeploymentGesamt(d.menge, d.einzelpreis);

    return `
      <tr data-dep-id="${esc(d.id)}">
        <td>${renderDeploymentDateCell(d.datum_von, d.datum_bis)}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('deployment','${esc(d.id)}',this.closest('tr'))">${esc(d.titel || '—')}</div>
        </td>
        <td class="col-tablet">${projektHtml}</td>
        <td><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(d.status)}</span></td>
        <td class="col-desktop">${esc(formatPreis(gesamt))}</td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="openDeploymentModal('edit', '${esc(d.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');

  // Auto-Expand wenn genau ein Einsatz (v1.28)
  autoExpandSingleRow(tbody, 'deployment', all);
}

// ═══════════════════════════════════════════════════════════
//  EINSÄTZE AUF PROJEKT-DETAIL
// ═══════════════════════════════════════════════════════════

async function loadProjectDeployments(projectId) {
  closeExpandedRow();
  const tbody = document.getElementById('project-deployments-body');
  const countEl = document.getElementById('project-deployments-count');
  const summaryEl = document.getElementById('project-deployments-summary');
  const leistungsUmsatzEl = document.getElementById('project-detail-leistungsumsatz');

  await loadEinsatzStatus();

  const { data, error } = await db.from('deployments')
    .select('*, service:services(id, name)').is('deleted_at', null)
    .eq('project_id', projectId)
    .order('datum_von', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Einsätze';
    summaryEl.style.display = 'none';
    if (leistungsUmsatzEl) leistungsUmsatzEl.textContent = '—';
    return;
  }

  const all = data || [];
  const total = all.length;
  setTabCount('project', 'einsaetze', total);

  // Leistungsumsatz (Summe aller Einsatz-Werte) im Header anzeigen
  const leistungsUmsatz = all.reduce((s, d) => s + calcDeploymentGesamt(d.menge, d.einzelpreis), 0);
  if (leistungsUmsatzEl) {
    leistungsUmsatzEl.textContent = formatPreis(leistungsUmsatz);
    leistungsUmsatzEl.style.color = leistungsUmsatz > 0 ? 'var(--text)' : 'var(--muted)';
  }

  if (total === 0) {
    countEl.textContent = 'Keine Einsätze';
    tbody.innerHTML = '<tr><td colspan="7"><div class="empty">Noch keine Einsätze für dieses Projekt. Klicke oben auf „+ Einsatz hinzufügen".</div></td></tr>';
    summaryEl.style.display = 'none';
    return;
  }

  const anzGeplant      = all.filter(d => d.status === 'Geplant').length;
  const anzDurchgefuehrt = all.filter(d => d.status === 'Durchgeführt').length;
  const anzAbgerechnet  = all.filter(d => d.status === 'Abgerechnet').length;
  const anzUngeplant    = all.filter(d => !d.datum_von).length;
  const summeAufwand    = all.reduce((s, d) => s + calcDeploymentGesamt(d.menge, d.einzelpreis), 0);

  let countText = `${total} Einsatz${total === 1 ? '' : 'e'} · ${anzGeplant} geplant · ${anzDurchgefuehrt} durchgef. · ${anzAbgerechnet} abgerechnet`;
  if (anzUngeplant > 0) countText += ` · ${anzUngeplant} ohne Datum`;
  countEl.textContent = countText;

  tbody.innerHTML = all.map(d => {
    const statusColor = einsatzStatusFarbe(d.status);
    const leistungHtml = d.service
      ? esc(d.service.name)
      : '<span style="color:var(--muted);font-style:italic">—</span>';
    const gesamt = calcDeploymentGesamt(d.menge, d.einzelpreis);

    // Checkbox-State: Durchgeführt oder Abgerechnet = checked
    const isDone = d.status === 'Durchgeführt' || d.status === 'Abgerechnet';
    const isLocked = d.status === 'Abgerechnet' || d.status === 'Storniert';
    const checkboxTitle = isLocked
      ? `Status „${d.status}" kann nicht per Checkbox geändert werden`
      : (isDone ? 'Als nicht durchgeführt markieren' : 'Als durchgeführt markieren');

    return `
      <tr data-dep-id="${esc(d.id)}" data-dep-status="${esc(d.status)}">
        <td style="text-align:center">
          <input type="checkbox" class="deployment-done-check"
                 ${isDone ? 'checked' : ''}
                 ${isLocked ? 'disabled' : ''}
                 onchange="toggleDeploymentDone('${esc(d.id)}', this.checked, this)"
                 title="${esc(checkboxTitle)}"
                 style="width:16px;height:16px;cursor:${isLocked ? 'not-allowed' : 'pointer'};margin:0">
        </td>
        <td>${renderDeploymentDateCell(d.datum_von, d.datum_bis)}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('deployment','${esc(d.id)}',this.closest('tr'))">${esc(d.titel || '—')}</div>
        </td>
        <td class="col-tablet" style="color:var(--muted)">${leistungHtml}</td>
        <td class="dep-status-cell"><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(d.status)}</span></td>
        <td class="col-desktop">${esc(formatPreis(gesamt))}</td>
        <td class="col-action" style="text-align:right">
          <button class="btn btn-sm" onclick="openDeploymentModal('edit', '${esc(d.id)}')">Bearbeiten</button>
        </td>
      </tr>`;
  }).join('');

  // Summary mit Aufwands-Info
  summaryEl.style.display = '';
  summaryEl.innerHTML = `Interner Aufwand laut Einsatz-Preisen: <strong>${esc(formatPreis(summeAufwand))}</strong>. Kundenumsatz läuft über den Projekt-Paketpreis.`;

  // Auto-Expand wenn genau ein Einsatz (v1.28)
  autoExpandSingleRow(tbody, 'deployment', all);
}

/**
 * Quick-Toggle für Termin-Status via Checkbox in Projekt-Detail.
 * Togglet zwischen 'geplant' und 'durchgefuehrt' per direktes DOM-Update (kein Page-Reload).
 */
async function toggleAppointmentDone(appointmentId, isChecked, checkboxEl) {
  const newStatus = isChecked ? 'durchgefuehrt' : 'geplant';

  if (checkboxEl) checkboxEl.disabled = true;

  try {
    const { error } = await db.from('appointments')
      .update({ status: newStatus })
      .eq('id', appointmentId);
    if (error) throw new Error(error.message);

    // DOM-Update der betroffenen Zeile (ohne Reload)
    const tr = checkboxEl ? checkboxEl.closest('tr') : null;
    if (tr) {
      tr.setAttribute('data-appt-status', newStatus);
      const statusCell = tr.querySelector('.appt-status-cell');
      if (statusCell) {
        statusCell.innerHTML = `<span class="badge" style="background:${appointmentStatusBg(newStatus)};color:${appointmentStatusColor(newStatus)}">${esc(appointmentStatusLabel(newStatus))}</span>`;
      }
    }

    // Count-Label für Termine aus DOM neu berechnen
    refreshProjectAppointmentsCountLabel();

    // Projekt-Status-Check + evtl. Header-Update, ohne ganze Seite neu zu laden
    if (currentProjectDetailId) {
      await checkAndUpdateProjectStatusSmart(currentProjectDetailId);
    }
  } catch (e) {
    showToast('Status konnte nicht geändert werden: ' + e.message, true);
    if (checkboxEl) checkboxEl.checked = !isChecked;
  } finally {
    if (checkboxEl) checkboxEl.disabled = false;
  }
}

/**
 * Berechnet das Count-Label der Projekt-Termine aus den data-appt-status Attributen im DOM.
 */
function refreshProjectAppointmentsCountLabel() {
  const countEl = document.getElementById('project-appointments-count');
  const body = document.getElementById('project-appointments-body');
  if (!countEl || !body) return;
  const rows = body.querySelectorAll('tr[data-appt-status]');
  const total = rows.length;
  if (total === 0) return;

  const arr = Array.from(rows);
  const anzGeplant       = arr.filter(r => r.getAttribute('data-appt-status') === 'geplant').length;
  const anzDurchgefuehrt = arr.filter(r => r.getAttribute('data-appt-status') === 'durchgefuehrt').length;
  countEl.textContent = `${total} Termin${total === 1 ? '' : 'e'} · ${anzGeplant} geplant · ${anzDurchgefuehrt} durchgeführt`;
}

/**
 * Wie checkAndUpdateProjectStatus, aber updated das Header-Status-Badge direkt im DOM
 * statt die ganze Projekt-Seite neu zu laden. Für flüssige UX bei Quick-Toggle.
 */
async function checkAndUpdateProjectStatusSmart(projectId) {
  const { data: project, error: pErr } = await db.from('projects')
    .select('id, status').is('deleted_at', null).eq('id', projectId).single();
  if (pErr || !project) return;

  const aktiveStatus = ['In Arbeit', 'Abschlussphase', 'Abgeschlossen'];
  if (!aktiveStatus.includes(project.status)) return;

  const { data: deployments } = await db.from('deployments')
    .select('status').is('deleted_at', null).eq('project_id', projectId);
  const allDeps = deployments || [];

  const { data: appointments } = await db.from('appointments')
    .select('status').is('deleted_at', null).eq('project_id', projectId);
  const allAppts = appointments || [];

  const countsDone = (arr, doneValues) => {
    if (arr.length === 0) return { hasAny: false, allDone: true };
    const done = arr.filter(x => doneValues.includes(x.status)).length;
    return { hasAny: true, allDone: done === arr.length };
  };

  const depStats = countsDone(allDeps, ['Durchgeführt', 'Abgerechnet']);
  const apptStats = countsDone(allAppts, ['durchgefuehrt']);

  if (!depStats.hasAny) return;

  let neuerStatus = project.status;
  if (depStats.allDone && apptStats.allDone) {
    neuerStatus = 'Abgeschlossen';
  } else if (depStats.allDone) {
    neuerStatus = 'Abschlussphase';
  } else {
    neuerStatus = 'In Arbeit';
  }

  if (neuerStatus !== project.status) {
    const { error: updErr } = await db.from('projects')
      .update({ status: neuerStatus }).eq('id', projectId);
    if (!updErr) {
      showToast(`Projekt-Status automatisch auf „${neuerStatus}" aktualisiert.`);
      // Header-Badge direkt im DOM updaten (kein Page-Reload)
      updateProjectHeaderStatusBadge(neuerStatus);
    }
  }
}

/**
 * Aktualisiert das Status-Badge in der Projekt-Detail-Subline ohne Reload.
 */
function updateProjectHeaderStatusBadge(newStatus) {
  const subline = document.getElementById('project-detail-subline');
  if (!subline) return;
  const badge = subline.querySelector('.badge');
  if (!badge) return;
  const color = projektStatusFarbe(newStatus);
  badge.style.background = color + '22';
  badge.style.color = color;
  badge.textContent = newStatus;
}

// ═══════════════════════════════════════════════════════════
//  EINSATZ-ABHAKEN + AUTO-PROJEKT-STATUS (v1.9.5)
// ═══════════════════════════════════════════════════════════

/**
 * Quick-Toggle für Einsatz-Status via Checkbox in Projekt-Detail.
 * Togglet zwischen 'Geplant' und 'Durchgeführt' per direktes DOM-Update (kein Page-Reload).
 */
async function toggleDeploymentDone(deploymentId, isChecked, checkboxEl) {
  const newStatus = isChecked ? 'Durchgeführt' : 'Geplant';

  if (checkboxEl) checkboxEl.disabled = true;

  try {
    const { error } = await db.from('deployments')
      .update({ status: newStatus })
      .eq('id', deploymentId);
    if (error) throw new Error(error.message);

    // DOM-Update der betroffenen Zeile (ohne Reload)
    const tr = checkboxEl ? checkboxEl.closest('tr') : null;
    if (tr) {
      tr.setAttribute('data-dep-status', newStatus);
      const statusCell = tr.querySelector('.dep-status-cell');
      if (statusCell) {
        const color = einsatzStatusFarbe(newStatus);
        statusCell.innerHTML = `<span class="badge" style="background:${esc(color)}22;color:${esc(color)}">${esc(newStatus)}</span>`;
      }
    }

    // Count-Label für Einsätze aus DOM neu berechnen
    refreshProjectDeploymentsCountLabel();

    // Projekt-Status-Check + evtl. Header-Update, ohne ganze Seite neu zu laden
    if (currentProjectDetailId) {
      await checkAndUpdateProjectStatusSmart(currentProjectDetailId);
    }
  } catch (e) {
    showToast('Status konnte nicht geändert werden: ' + e.message, true);
    if (checkboxEl) checkboxEl.checked = !isChecked;
  } finally {
    if (checkboxEl) checkboxEl.disabled = false;
  }
}

/**
 * Berechnet das Count-Label der Projekt-Einsätze aus den data-dep-status Attributen
 * im DOM (ohne DB-Query) und updated den Text.
 */
function refreshProjectDeploymentsCountLabel() {
  const countEl = document.getElementById('project-deployments-count');
  const body = document.getElementById('project-deployments-body');
  if (!countEl || !body) return;
  const rows = body.querySelectorAll('tr[data-dep-status]');
  const total = rows.length;
  if (total === 0) return;

  const arr = Array.from(rows);
  const anzGeplant       = arr.filter(r => r.getAttribute('data-dep-status') === 'Geplant').length;
  const anzDurchgefuehrt = arr.filter(r => r.getAttribute('data-dep-status') === 'Durchgeführt').length;
  const anzAbgerechnet   = arr.filter(r => r.getAttribute('data-dep-status') === 'Abgerechnet').length;
  // "ohne Datum" bleibt vom Initial-Load korrekt - Status-Toggle ändert das Datum nicht

  let text = `${total} Einsatz${total === 1 ? '' : 'e'} · ${anzGeplant} geplant · ${anzDurchgefuehrt} durchgef. · ${anzAbgerechnet} abgerechnet`;
  // Vorhandenes "ohne Datum"-Suffix aus bisherigem Label übernehmen (falls da)
  const prevText = countEl.textContent;
  const match = prevText.match(/· \d+ ohne Datum$/);
  if (match) text += ` ${match[0].replace('· ', '· ')}`;
  countEl.textContent = text;
}

/**
 * Prüft den Stand aller Einsätze und Termine eines Projekts und
 * aktualisiert den Projekt-Status automatisch:
 *  - Alle Einsätze durchgeführt + alle Termine durchgeführt → 'Abgeschlossen'
 *  - Alle Einsätze durchgeführt (min. 1)                     → 'Abschlussphase'
 *  - Sonst (wenn bisher 'Abschlussphase'/'Abgeschlossen')    → 'In Arbeit'
 *
 * Läuft nur wenn Projekt in einem "aktiven" Status ist
 * (Lead, Angebot, Verloren werden nicht automatisch angefasst).
 */
async function checkAndUpdateProjectStatus(projectId) {
  // Aktuellen Projekt-Status holen
  const { data: project, error: pErr } = await db.from('projects')
    .select('id, status, name').is('deleted_at', null).eq('id', projectId).single();
  if (pErr || !project) return;

  const aktiveStatus = ['In Arbeit', 'Abschlussphase', 'Abgeschlossen'];
  if (!aktiveStatus.includes(project.status)) return; // Lead/Angebot/Verloren: keine Automatik

  // Einsätze laden
  const { data: deployments } = await db.from('deployments')
    .select('status').is('deleted_at', null).eq('project_id', projectId);
  const allDeps = deployments || [];

  // Termine laden
  const { data: appointments } = await db.from('appointments')
    .select('status').is('deleted_at', null).eq('project_id', projectId);
  const allAppts = appointments || [];

  const countsDone = (arr, doneValues) => {
    if (arr.length === 0) return { hasAny: false, allDone: true }; // leer = neutral
    const done = arr.filter(x => doneValues.includes(x.status)).length;
    return { hasAny: true, allDone: done === arr.length };
  };

  const depStats = countsDone(allDeps, ['Durchgeführt', 'Abgerechnet']);
  const apptStats = countsDone(allAppts, ['durchgefuehrt']);

  // Logik für neuen Status
  let neuerStatus = project.status;
  if (!depStats.hasAny) {
    // Keine Einsätze → kein Auto-Status-Change
    return;
  }
  if (depStats.allDone && apptStats.allDone) {
    neuerStatus = 'Abgeschlossen';
  } else if (depStats.allDone) {
    neuerStatus = 'Abschlussphase';
  } else {
    neuerStatus = 'In Arbeit';
  }

  if (neuerStatus !== project.status) {
    const { error: updErr } = await db.from('projects')
      .update({ status: neuerStatus }).eq('id', projectId);
    if (!updErr) {
      showToast(`Projekt-Status automatisch auf „${neuerStatus}" aktualisiert.`);
    }
  }
}

// ═══════════════════════════════════════════════════════════
//  MODAL-GRUPPEN EIN-/AUSKLAPPEN
// ═══════════════════════════════════════════════════════════

/**
 * Toggelt die Sichtbarkeit aller Geschwister-Elemente zwischen diesem
 * modal-group-title und dem nächsten. Event-Delegation auf document.
 */
function toggleModalGroup(titleEl) {
  const collapsed = titleEl.classList.toggle('collapsed');
  let sib = titleEl.nextElementSibling;
  while (sib && !sib.classList.contains('modal-group-title')) {
    sib.style.display = collapsed ? 'none' : '';
    sib = sib.nextElementSibling;
  }
}

// Global click-delegation für alle Modal-Gruppen-Titel
document.addEventListener('click', (e) => {
  const title = e.target.closest('.modal-group-title');
  if (!title) return;
  // Nur wenn der Title selbst geklickt wurde, nicht ein Kind-Element
  // (aktuell gibt's keine interaktiven Kinder, daher immer toggeln)
  toggleModalGroup(title);
});

// ═══════════════════════════════════════════════════════════
//  GLOBALE SUCHE (v1.19.0) — Cmd+K / Ctrl+K / "/"
// ═══════════════════════════════════════════════════════════

let searchDebounceTimer = null;
let searchAbortController = null;
let searchResults = [];        // flache Liste {type, id, title, subtitle}
let searchActiveIndex = -1;

const RECENT_VISITS_KEY = 'cumart_recent_visits';
const RECENT_VISITS_MAX = 5;

function getRecentlyVisited() {
  try { return JSON.parse(localStorage.getItem(RECENT_VISITS_KEY) || '[]'); }
  catch { return []; }
}

function pushRecentlyVisited(entry) {
  if (!entry?.id || !entry?.type) return;
  const clean = { type: entry.type, id: entry.id, title: entry.title || '', subtitle: entry.subtitle || '' };
  let list = getRecentlyVisited().filter(e => !(e.type === clean.type && e.id === clean.id));
  list.unshift(clean);
  list = list.slice(0, RECENT_VISITS_MAX);
  try { localStorage.setItem(RECENT_VISITS_KEY, JSON.stringify(list)); } catch {}
}

function trackVisit(type, id, title, subtitle) {
  pushRecentlyVisited({ type, id, title, subtitle });
}

function openSearchOverlay() {
  const overlay = document.getElementById('search-overlay');
  overlay.classList.add('open');
  const input = document.getElementById('search-input');
  input.value = '';
  searchActiveIndex = -1;
  renderRecentlyVisited();
  setTimeout(() => input.focus(), 50);
}

function closeSearchOverlay() {
  document.getElementById('search-overlay').classList.remove('open');
  if (searchAbortController) { try { searchAbortController.abort(); } catch {} searchAbortController = null; }
  clearTimeout(searchDebounceTimer);
}

function closeSearchOverlayOnBackdrop(ev) {
  if (ev.target.id === 'search-overlay') closeSearchOverlay();
}

function renderRecentlyVisited() {
  const container = document.getElementById('search-results');
  const recent = getRecentlyVisited();
  if (recent.length === 0) {
    container.innerHTML = '<div class="search-hint">Tippe, um zu suchen. <kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> navigieren · <kbd class="kbd">↵</kbd> öffnen</div>';
    searchResults = [];
    return;
  }
  searchResults = recent;
  searchActiveIndex = 0;
  const html = `<div class="search-group-header">Zuletzt besucht</div>` +
    recent.map((e, i) => renderSearchItem(e, i)).join('');
  container.innerHTML = html;
  wireSearchItemClicks();
}

function searchIconForType(type) {
  const icons = {
    company: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/></svg>`,
    contact: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 22v-1a7 7 0 0 1 16 0v1"/></svg>`,
    project: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`,
    deployment: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0L21 4.3A6 6 0 0 1 13 13l-7 7a2.1 2.1 0 0 1-3-3l7-7A6 6 0 0 1 19 2.6Z"/></svg>`,
  };
  return icons[type] || '';
}

function searchTypeLabel(type) {
  return { company: 'Firma', contact: 'Kontakt', project: 'Projekt', deployment: 'Einsatz' }[type] || type;
}

function renderSearchItem(entry, idx) {
  const icon = searchIconForType(entry.type);
  const typeLabel = searchTypeLabel(entry.type);
  return `
    <div class="search-item${idx === searchActiveIndex ? ' active' : ''}" data-idx="${idx}" role="option" tabindex="-1">
      <div class="search-item-icon">${icon}</div>
      <div class="search-item-body">
        <div class="search-item-title">${esc(entry.title || '—')}</div>
        ${entry.subtitle ? `<div class="search-item-sub">${esc(entry.subtitle)}</div>` : ''}
      </div>
      <div class="search-item-type-badge">${typeLabel}</div>
    </div>`;
}

function wireSearchItemClicks() {
  document.querySelectorAll('#search-results .search-item').forEach(el => {
    const idx = parseInt(el.dataset.idx, 10);
    el.onclick = () => openSearchResult(searchResults[idx]);
  });
}

function openSearchResult(entry) {
  if (!entry) return;
  pushRecentlyVisited(entry);
  closeSearchOverlay();
  if (entry.type === 'company')         location.hash = '#/firma/'   + entry.id;
  else if (entry.type === 'contact')    location.hash = '#/kontakt/' + entry.id;
  else if (entry.type === 'project')    location.hash = '#/projekt/' + entry.id;
  else if (entry.type === 'deployment') {
    // Einsatz hat keine Detail-Route → Liste + Modal
    if (location.hash === '#/einsaetze') openDeploymentModal('edit', entry.id);
    else { location.hash = '#/einsaetze'; setTimeout(() => openDeploymentModal('edit', entry.id), 120); }
  }
}

function onSearchInput() {
  const q = document.getElementById('search-input').value.trim();
  clearTimeout(searchDebounceTimer);
  if (q.length === 0) { renderRecentlyVisited(); return; }
  if (q.length < 2) {
    document.getElementById('search-results').innerHTML = '<div class="search-hint">Mindestens 2 Zeichen eingeben.</div>';
    searchResults = []; searchActiveIndex = -1;
    return;
  }
  searchDebounceTimer = setTimeout(() => runSearchQueries(q), 200);
}

async function runSearchQueries(q) {
  if (searchAbortController) { try { searchAbortController.abort(); } catch {} }
  searchAbortController = new AbortController();
  const signal = searchAbortController.signal;

  document.getElementById('search-results').innerHTML = '<div class="search-hint">Suche läuft …</div>';

  // PostgREST .or() benutzt Kommas und Klammern als Trenner. Wir escapen.
  const safe = q.replace(/([%,\(\)])/g, '\\$1');
  const pat = `%${safe}%`;

  try {
    const [comps, conts, projs, deps] = await Promise.all([
      db.from('companies').select('id, name, website, stadt').is('deleted_at', null)
        .or(`name.ilike.${pat},website.ilike.${pat},stadt.ilike.${pat}`)
        .abortSignal(signal).limit(5),
      db.from('contacts').select('id, vorname, nachname, email').is('deleted_at', null)
        .or(`vorname.ilike.${pat},nachname.ilike.${pat},email.ilike.${pat}`)
        .abortSignal(signal).limit(5),
      db.from('projects').select('id, name, beschreibung').is('deleted_at', null)
        .or(`name.ilike.${pat},beschreibung.ilike.${pat}`)
        .abortSignal(signal).limit(5),
      db.from('deployments').select('id, titel, notizen').is('deleted_at', null)
        .or(`titel.ilike.${pat},notizen.ilike.${pat}`)
        .abortSignal(signal).limit(5),
    ]);
    if (signal.aborted) return;
    renderSearchResults(comps, conts, projs, deps, q);
  } catch (err) {
    if (signal.aborted) return;
    if (err?.name === 'AbortError') return;
    document.getElementById('search-results').innerHTML =
      `<div class="search-empty">Fehler: ${esc(err.message || String(err))}</div>`;
  }
}

function renderSearchResults(comps, conts, projs, deps, q) {
  const container = document.getElementById('search-results');
  const results = [];

  (comps.data || []).forEach(c => results.push({
    type: 'company', id: c.id, title: c.name, subtitle: c.stadt || c.website || ''
  }));
  (conts.data || []).forEach(k => results.push({
    type: 'contact', id: k.id,
    title: `${k.vorname || ''} ${k.nachname || ''}`.trim() || '—',
    subtitle: k.email || ''
  }));
  (projs.data || []).forEach(p => results.push({
    type: 'project', id: p.id, title: p.name,
    subtitle: (p.beschreibung || '').slice(0, 80)
  }));
  (deps.data || []).forEach(d => results.push({
    type: 'deployment', id: d.id, title: d.titel || '(ohne Titel)',
    subtitle: (d.notizen || '').slice(0, 80)
  }));

  searchResults = results;
  searchActiveIndex = results.length > 0 ? 0 : -1;

  if (results.length === 0) {
    container.innerHTML = `<div class="search-empty">Keine Treffer für „${esc(q)}".</div>`;
    return;
  }

  const labels = { company: 'Firmen', contact: 'Kontakte', project: 'Projekte', deployment: 'Einsätze' };
  const order = ['company', 'contact', 'project', 'deployment'];
  const byType = { company: [], contact: [], project: [], deployment: [] };
  results.forEach((r, i) => byType[r.type].push({ entry: r, idx: i }));

  container.innerHTML = order
    .filter(t => byType[t].length > 0)
    .map(t => `
      <div class="search-group-header">${labels[t]}</div>
      ${byType[t].map(x => renderSearchItem(x.entry, x.idx)).join('')}
    `).join('');
  wireSearchItemClicks();
}

function moveSearchActive(delta) {
  if (searchResults.length === 0) return;
  searchActiveIndex = (searchActiveIndex + delta + searchResults.length) % searchResults.length;
  document.querySelectorAll('#search-results .search-item').forEach(el => {
    const idx = parseInt(el.dataset.idx, 10);
    const on = idx === searchActiveIndex;
    el.classList.toggle('active', on);
    if (on) el.scrollIntoView({ block: 'nearest' });
  });
}

function isInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
}

document.addEventListener('keydown', (ev) => {
  const overlay = document.getElementById('search-overlay');
  const isOpen = overlay?.classList.contains('open');

  if (!isOpen) {
    if ((ev.metaKey || ev.ctrlKey) && (ev.key === 'k' || ev.key === 'K')) {
      ev.preventDefault();
      openSearchOverlay();
      return;
    }
    if (ev.key === '/' && !isInputFocused()) {
      ev.preventDefault();
      openSearchOverlay();
    }
    return;
  }

  if (ev.key === 'Escape') { ev.preventDefault(); closeSearchOverlay(); return; }
  if (ev.key === 'ArrowDown') { ev.preventDefault(); moveSearchActive(1); return; }
  if (ev.key === 'ArrowUp')   { ev.preventDefault(); moveSearchActive(-1); return; }
  if (ev.key === 'Enter') {
    if (searchActiveIndex >= 0 && searchResults[searchActiveIndex]) {
      ev.preventDefault();
      openSearchResult(searchResults[searchActiveIndex]);
    }
  }
});

function wireSearchInput() {
  const input = document.getElementById('search-input');
  if (input) input.addEventListener('input', onSearchInput);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireSearchInput);
} else {
  wireSearchInput();
}

// ═══════════════════════════════════════════════════════════
//  DETAIL-TABS (v1.23.0)
// ═══════════════════════════════════════════════════════════
//
// Tabs auf Firma-/Projekt-/Kontakt-Detail. Ersetzen die gestapelten
// Cards durch eine Tab-Leiste. Der aktive Tab wird in die URL geschrieben
// (`?tab=xxx`), damit Reload/Teilen funktioniert.

/** Aktiviert einen Tab auf einer Detail-Seite und schreibt ihn in die URL.
 *  entityType: 'company' | 'project' | 'contact'
 *  tabKey: z.B. 'stammdaten', 'kontakte', 'termine', 'aufgaben' … */
function switchDetailTab(entityType, tabKey) {
  const pageId = { company: 'page-company-detail', project: 'page-project-detail', contact: 'page-contact-detail' }[entityType];
  const page = document.getElementById(pageId);
  if (!page) return;

  page.querySelectorAll('.detail-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tabKey);
  });
  page.querySelectorAll('.detail-tab-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.tab === tabKey);
  });

  // URL aktualisieren ohne History-Eintrag
  const hash = location.hash || '';
  const [path, queryStr] = hash.split('?');
  const params = new URLSearchParams(queryStr || '');
  if (tabKey === 'stammdaten') params.delete('tab');
  else params.set('tab', tabKey);
  const newHash = path + (params.toString() ? '?' + params.toString() : '');
  if (newHash !== hash) history.replaceState(null, '', newHash);
}

/** Liest ?tab= aus dem Hash, fällt auf 'stammdaten' zurück. */
function getActiveDetailTab() {
  const hash = location.hash || '';
  const idx = hash.indexOf('?');
  if (idx < 0) return 'stammdaten';
  const params = new URLSearchParams(hash.substring(idx + 1));
  return params.get('tab') || 'stammdaten';
}

/** Initialisiert den Tab-Zustand auf der gerade geladenen Detail-Seite. */
function initDetailTabs(entityType) {
  switchDetailTab(entityType, getActiveDetailTab());
}

/** Setzt eine Zahl ins Tab-Count-Badge. */
function setTabCount(entityType, tabKey, count) {
  const el = document.getElementById(`tab-count-${entityType}-${tabKey}`);
  if (!el) return;
  if (count === 0 || count == null) { el.style.display = 'none'; return; }
  el.textContent = String(count);
  el.style.display = '';
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD-WIDGETS (v1.24.0, erweitert v1.25.0)
// ═══════════════════════════════════════════════════════════

/** Auto-ABC nach Kalenderjahr-Umsatz (v1.25): ≥10k=A · ≥2k=B · sonst C. */
function computeAutoAbc(yearRevenue) {
  if (yearRevenue >= 10000) return 'A';
  if (yearRevenue >= 2000)  return 'B';
  return 'C';
}

/** Setzt das ABC-Badge auf der Firma-Detail-Seite (manuell vs. auto).
 *  manualAbc: 'A'|'B'|'C'|null  ·  autoAbc: 'A'|'B'|'C'|null (errechnet) */
/** Rendert ein ABC-Badge + Label + Modus-Text in die durch `ids` adressierten Elemente.
 *  Wiederverwendbar für Firma-Card (eigene ABC) und Kontakt-Card (geerbte ABC der Firma).
 *  Wenn `emptyLabel` gesetzt (Kontakt ohne Firma), werden Auto/Manuell-Modus ausgeblendet. */
function renderAbcBadgeIn(ids, manualAbc, autoAbc, opts = {}) {
  const { modePrefix = 'ABC', emptyLabel = null } = opts;
  const badge  = document.getElementById(ids.badge);
  const label  = document.getElementById(ids.label);
  const modeEl = ids.mode ? document.getElementById(ids.mode) : null;
  if (!badge || !label) return;

  const effective = manualAbc || autoAbc;
  badge.classList.remove('abc-badge-A', 'abc-badge-B', 'abc-badge-C', 'abc-badge-unknown');

  if (emptyLabel) {
    badge.textContent = '—';
    badge.classList.add('abc-badge-unknown');
    label.textContent = emptyLabel;
    label.classList.add('stat-value-muted');
    if (modeEl) modeEl.textContent = modePrefix;
    return;
  }

  if (effective) {
    badge.textContent = effective;
    badge.classList.add(`abc-badge-${effective}`);
    label.textContent = {
      A: 'Kern-/Top-Kunde',
      B: 'Wichtiger Kunde',
      C: 'Geringere Priorität'
    }[effective] || '';
    label.classList.remove('stat-value-muted');
  } else {
    badge.textContent = '—';
    badge.classList.add('abc-badge-unknown');
    label.textContent = 'Nicht klassifiziert';
    label.classList.add('stat-value-muted');
  }

  if (modeEl) {
    if (manualAbc)      modeEl.textContent = `${modePrefix} · manuell`;
    else if (autoAbc)   modeEl.textContent = `${modePrefix} · auto`;
    else                modeEl.textContent = modePrefix;
  }
}

function renderCompanyAbcBadge(manualAbc, autoAbc) {
  renderAbcBadgeIn(
    { badge: 'company-abc-badge', label: 'company-abc-label', mode: 'company-abc-mode-label' },
    manualAbc, autoAbc
  );
}

function renderContactAbcBadge(manualAbc, autoAbc, hasCompany) {
  renderAbcBadgeIn(
    { badge: 'contact-abc-badge', label: 'contact-abc-label', mode: 'contact-abc-mode-label' },
    manualAbc, autoAbc,
    { modePrefix: 'ABC · Firma', emptyLabel: hasCompany ? null : 'Keine Firma zugeordnet' }
  );
}

/** Lädt alle Dashboard-Daten der Firma-Detail-Seite. */
async function loadCompanyDashboard(companyId, manualAbc) {
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd   = `${now.getFullYear()}-12-31`;
  const todayISO  = toISODate(now);

  // Parallel alle Queries
  const [
    depYearResult, depAllResult,
    projYearResult, projAllResult,
    openTasksResult,
    lastApptResult, lastDepResult,
    upcomingApptResult, upcomingDepResult,
    opportunitiesResult
  ] = await Promise.all([
    // Einsätze (direkt) im aktuellen Kalenderjahr, abgerechnet (datum_von in YYYY oder created_at falls kein datum)
    db.from('deployments')
      .select('menge, einzelpreis, status, project_id, datum_von, created_at').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgerechnet').is('project_id', null),
    // Alle abgerechneten Einsätze (für Historie seit Erstkontakt)
    db.from('deployments')
      .select('menge, einzelpreis, datum_von, created_at').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgerechnet').is('project_id', null),
    // Projekte abgeschlossen — wir brauchen enddatum (sonst created_at) für Kalenderjahr-Zuordnung
    db.from('projects')
      .select('geschaetzter_umsatz, enddatum, created_at').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgeschlossen'),
    db.from('projects')
      .select('geschaetzter_umsatz').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgeschlossen'),
    // Offene Aufgaben
    db.from('tasks').select('id, faelligkeit').is('deleted_at', null)
      .eq('company_id', companyId).neq('status', 'erledigt'),
    // Letzter durchgeführter Termin
    db.from('appointments')
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert)').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'durchgefuehrt')
      .order('datum', { ascending: false }).limit(1),
    // Letzter durchgeführter/abgerechneter Einsatz
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('company_id', companyId).in('status', ['Durchgeführt', 'Abgerechnet'])
      .not('datum_von', 'is', null).order('datum_von', { ascending: false }).limit(1),
    // Bevorstehender geplanter Termin
    db.from('appointments')
      .select('id, titel, datum, uhrzeit_von, typ:lookup_values!appointments_typ_id_fkey(wert)').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'geplant')
      .gte('datum', todayISO).order('datum', { ascending: true }).limit(2),
    // Bevorstehender geplanter Einsatz
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Geplant')
      .gte('datum_von', todayISO).order('datum_von', { ascending: true }).limit(2),
    // Opportunities (Projekte mit Status Lead/Angebot)
    db.from('projects')
      .select('id, name, status, geschaetzter_umsatz, enddatum').is('deleted_at', null)
      .eq('company_id', companyId).in('status', ['Lead', 'Angebot'])
      .order('enddatum', { ascending: true, nullsFirst: false })
  ]);

  // ── UMSATZ KALENDERJAHR ───────────────────────────────────
  const inYear = (dateStr) => dateStr && dateStr >= yearStart && dateStr <= yearEnd;
  const refDate = (d) => d.datum_von || (d.created_at || '').substring(0, 10) || null;

  const umsatzYearDep = (depYearResult.data || [])
    .filter(d => inYear(refDate(d)))
    .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
  const umsatzYearProj = (projYearResult.data || [])
    .filter(p => inYear(p.enddatum || (p.created_at || '').substring(0, 10)))
    .reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
  const umsatzYear = umsatzYearDep + umsatzYearProj;

  // ── UMSATZ HISTORIE GESAMT ────────────────────────────────
  const umsatzAllDep = (depAllResult.data || [])
    .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
  const umsatzAllProj = (projAllResult.data || [])
    .reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
  const umsatzAll = umsatzAllDep + umsatzAllProj;

  // ── RENDERN: Umsatz-Card + Auto-ABC ───────────────────────
  const yearLabel = document.getElementById('company-revenue-year-label');
  if (yearLabel) yearLabel.textContent = `Umsatz ${now.getFullYear()}`;

  const revEl = document.getElementById('company-total-revenue');
  if (revEl) {
    revEl.textContent = formatPreis(umsatzYear);
    revEl.classList.toggle('stat-value-muted', umsatzYear === 0);
  }
  const histEl = document.getElementById('company-revenue-history');
  if (histEl) {
    histEl.textContent = umsatzAll > 0
      ? `Historie seit Erstkontakt: ${formatPreis(umsatzAll)}`
      : ' ';
  }

  // Auto-ABC + Display
  const autoAbc = computeAutoAbc(umsatzYear);
  renderCompanyAbcBadge(manualAbc, autoAbc);

  // ── OFFENE AUFGABEN ──────────────────────────────────────
  const openTasks = openTasksResult.data || [];
  const offenCount = openTasks.length;
  const ueberfaellig = openTasks.filter(t => t.faelligkeit && t.faelligkeit < todayISO).length;
  const tasksEl = document.getElementById('company-open-tasks');
  if (tasksEl) {
    tasksEl.textContent = String(offenCount);
    tasksEl.classList.toggle('stat-value-muted', offenCount === 0);
    tasksEl.classList.toggle('stat-value-overdue', ueberfaellig > 0);
    tasksEl.title = ueberfaellig > 0 ? `${offenCount} offen, davon ${ueberfaellig} überfällig` : `${offenCount} offen`;
  }

  // ── LETZTE AKTIVITÄT (nur durchgeführt/abgerechnet) ──────
  const lastAppt = (lastApptResult.data || [])[0] || null;
  const lastDep  = (lastDepResult.data || [])[0] || null;
  const lastEl   = document.getElementById('company-last-activity');
  if (lastEl) {
    const items = [];
    if (lastAppt) items.push({
      datum: lastAppt.datum, titel: lastAppt.titel, type: 'Termin',
      typWert: lastAppt.typ?.wert,
      onClick: `openAppointmentModal('edit','${esc(lastAppt.id)}')`
    });
    if (lastDep?.datum_von) items.push({
      datum: lastDep.datum_von, titel: lastDep.titel, type: 'Einsatz',
      onClick: `openDeploymentModal('edit','${esc(lastDep.id)}')`
    });
    items.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
    lastEl.innerHTML = items.length === 0
      ? '<div class="info-card-empty">Noch nichts durchgeführt.</div>'
      : items.slice(0, 2).map(i => `
        <div class="last-activity-item" style="cursor:pointer" onclick="${i.onClick}">
          <div class="last-activity-date">${esc(formatDateDE(i.datum))}</div>
          <div class="last-activity-title">${esc(i.titel || '—')}<span class="last-activity-type">${esc(i.type)}${i.typWert ? ' · ' + esc(i.typWert) : ''}</span></div>
        </div>
      `).join('');
  }

  // ── BEVORSTEHENDE AKTIVITÄT (geplante zukünftige) ────────
  const upcomingEl = document.getElementById('company-upcoming-activity');
  if (upcomingEl) {
    const items = [];
    (upcomingApptResult.data || []).forEach(a => items.push({
      datum: a.datum, titel: a.titel, type: 'Termin', typWert: a.typ?.wert,
      onClick: `openAppointmentModal('edit','${esc(a.id)}')`
    }));
    (upcomingDepResult.data || []).forEach(d => items.push({
      datum: d.datum_von, titel: d.titel, type: 'Einsatz',
      onClick: `openDeploymentModal('edit','${esc(d.id)}')`
    }));
    items.sort((a, b) => (a.datum || '').localeCompare(b.datum || ''));
    upcomingEl.innerHTML = items.length === 0
      ? '<div class="info-card-empty">Nichts geplant.</div>'
      : items.slice(0, 2).map(i => `
        <div class="last-activity-item" style="cursor:pointer" onclick="${i.onClick}">
          <div class="last-activity-date">${esc(formatDateDE(i.datum))}</div>
          <div class="last-activity-title">${esc(i.titel || '—')}<span class="last-activity-type">${esc(i.type)}${i.typWert ? ' · ' + esc(i.typWert) : ''}</span></div>
        </div>
      `).join('');
  }

  // ── OPPORTUNITIES (Projekte mit Lead/Angebot) ─────────────
  const oppEl = document.getElementById('company-opportunities');
  if (oppEl) {
    const opps = opportunitiesResult.data || [];
    if (opps.length === 0) {
      oppEl.innerHTML = '<div class="info-card-empty">Keine offenen Opportunities.</div>';
    } else {
      oppEl.innerHTML = opps.map(p => `
        <div class="opportunity-row">
          <div style="min-width:0;flex:1">
            <div class="opportunity-name cell-link" onclick="navigateTo('projekt','${esc(p.id)}')">${esc(p.name)}</div>
            <div class="opportunity-meta">${esc(p.status)}${p.enddatum ? ' · Zieldatum ' + esc(formatDateDE(p.enddatum)) : ''}</div>
          </div>
          <div class="opportunity-value">${esc(formatPreis(p.geschaetzter_umsatz || 0))}</div>
        </div>
      `).join('');
    }
  }
}

/** Lädt alle Dashboard-Daten der Kontakt-Detail-Seite (v1.26 — an Firma-Dashboard angeglichen).
 *  Termine werden am Kontakt gefiltert; Einsätze + Umsatz werden über die zugeordnete Firma gespiegelt;
 *  Opportunities zeigen Projekte, in denen dieser Kontakt Hauptkontakt ist. */
async function loadContactDashboard(contactId, companyId, manualAbc, companyName) {
  const now       = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const yearEnd   = `${now.getFullYear()}-12-31`;
  const todayISO  = toISODate(now);
  const hasCompany = !!companyId;

  // Firma-abhängige Queries nur wenn Firma zugeordnet, sonst leere Platzhalter
  const companyQueries = hasCompany ? [
    db.from('deployments')
      .select('menge, einzelpreis, datum_von, created_at').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgerechnet').is('project_id', null),
    db.from('deployments')
      .select('menge, einzelpreis, datum_von, created_at').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgerechnet').is('project_id', null),
    db.from('projects')
      .select('geschaetzter_umsatz, enddatum, created_at').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgeschlossen'),
    db.from('projects')
      .select('geschaetzter_umsatz').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Abgeschlossen'),
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('company_id', companyId).in('status', ['Durchgeführt', 'Abgerechnet'])
      .not('datum_von', 'is', null).order('datum_von', { ascending: false }).limit(1),
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'Geplant')
      .gte('datum_von', todayISO).order('datum_von', { ascending: true }).limit(2)
  ] : [null, null, null, null, null, null];

  const [
    openTasksResult,
    lastApptResult, upcomingApptResult,
    opportunitiesResult,
    depYearResult, depAllResult,
    projYearResult, projAllResult,
    lastDepResult, upcomingDepResult
  ] = await Promise.all([
    db.from('tasks').select('id, faelligkeit').is('deleted_at', null)
      .eq('contact_id', contactId).neq('status', 'erledigt'),
    db.from('appointments')
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert)').is('deleted_at', null)
      .eq('contact_id', contactId).eq('status', 'durchgefuehrt')
      .order('datum', { ascending: false }).limit(1),
    db.from('appointments')
      .select('id, titel, datum, uhrzeit_von, typ:lookup_values!appointments_typ_id_fkey(wert)').is('deleted_at', null)
      .eq('contact_id', contactId).eq('status', 'geplant')
      .gte('datum', todayISO).order('datum', { ascending: true }).limit(2),
    // Opportunities: Projekte wo DIESER Kontakt Hauptkontakt ist und Status Lead/Angebot
    db.from('projects')
      .select('id, name, status, geschaetzter_umsatz, enddatum').is('deleted_at', null)
      .eq('hauptkontakt_id', contactId).in('status', ['Lead', 'Angebot'])
      .order('enddatum', { ascending: true, nullsFirst: false }),
    ...companyQueries
  ]);

  // ── UMSATZ (nur wenn Firma) ───────────────────────────────
  const inYear = (dateStr) => dateStr && dateStr >= yearStart && dateStr <= yearEnd;
  const refDate = (d) => d.datum_von || (d.created_at || '').substring(0, 10) || null;

  let umsatzYear = 0, umsatzAll = 0;
  if (hasCompany) {
    const umsatzYearDep = (depYearResult.data || [])
      .filter(d => inYear(refDate(d)))
      .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
    const umsatzYearProj = (projYearResult.data || [])
      .filter(p => inYear(p.enddatum || (p.created_at || '').substring(0, 10)))
      .reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
    umsatzYear = umsatzYearDep + umsatzYearProj;

    const umsatzAllDep = (depAllResult.data || [])
      .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
    const umsatzAllProj = (projAllResult.data || [])
      .reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
    umsatzAll = umsatzAllDep + umsatzAllProj;
  }

  // ── RENDERN: Umsatz-Card ─────────────────────────────────
  const yearLabel = document.getElementById('contact-revenue-year-label');
  if (yearLabel) {
    yearLabel.textContent = hasCompany
      ? `Umsatz ${companyName ? companyName : 'Firma'} · ${now.getFullYear()}`
      : 'Umsatz Firma';
  }
  const revEl = document.getElementById('contact-revenue-year');
  if (revEl) {
    revEl.textContent = hasCompany ? formatPreis(umsatzYear) : '—';
    revEl.classList.toggle('stat-value-muted', !hasCompany || umsatzYear === 0);
  }
  const histEl = document.getElementById('contact-revenue-history');
  if (histEl) {
    histEl.textContent = hasCompany && umsatzAll > 0
      ? `Historie seit Erstkontakt: ${formatPreis(umsatzAll)}`
      : (hasCompany ? ' ' : 'Keine Firma zugeordnet');
  }

  // ── ABC (geerbt von Firma) + Auto-Wert aus Jahresumsatz ──
  const autoAbc = hasCompany ? computeAutoAbc(umsatzYear) : null;
  renderContactAbcBadge(manualAbc, autoAbc, hasCompany);

  // ── OFFENE AUFGABEN ──────────────────────────────────────
  const openTasks = openTasksResult.data || [];
  const offenCount = openTasks.length;
  const ueberfaellig = openTasks.filter(t => t.faelligkeit && t.faelligkeit < todayISO).length;
  const tasksEl = document.getElementById('contact-open-tasks');
  if (tasksEl) {
    tasksEl.textContent = String(offenCount);
    tasksEl.classList.toggle('stat-value-muted', offenCount === 0);
    tasksEl.classList.toggle('stat-value-overdue', ueberfaellig > 0);
    tasksEl.title = ueberfaellig > 0 ? `${offenCount} offen, davon ${ueberfaellig} überfällig` : `${offenCount} offen`;
  }

  // ── LETZTE AKTIVITÄT (Termin am Kontakt + Einsatz der Firma) ──
  const lastAppt = (lastApptResult.data || [])[0] || null;
  const lastDep  = hasCompany ? ((lastDepResult?.data || [])[0] || null) : null;
  const lastEl   = document.getElementById('contact-last-activity');
  if (lastEl) {
    const items = [];
    if (lastAppt) items.push({
      datum: lastAppt.datum, titel: lastAppt.titel, type: 'Termin',
      typWert: lastAppt.typ?.wert,
      onClick: `openAppointmentModal('edit','${esc(lastAppt.id)}')`
    });
    if (lastDep?.datum_von) items.push({
      datum: lastDep.datum_von, titel: lastDep.titel, type: 'Einsatz (Firma)',
      onClick: `openDeploymentModal('edit','${esc(lastDep.id)}')`
    });
    items.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
    lastEl.innerHTML = items.length === 0
      ? '<div class="info-card-empty">Noch nichts durchgeführt.</div>'
      : items.slice(0, 2).map(i => `
        <div class="last-activity-item" style="cursor:pointer" onclick="${i.onClick}">
          <div class="last-activity-date">${esc(formatDateDE(i.datum))}</div>
          <div class="last-activity-title">${esc(i.titel || '—')}<span class="last-activity-type">${esc(i.type)}${i.typWert ? ' · ' + esc(i.typWert) : ''}</span></div>
        </div>
      `).join('');
  }

  // ── BEVORSTEHEND ─────────────────────────────────────────
  const upcomingEl = document.getElementById('contact-upcoming-activity');
  if (upcomingEl) {
    const items = [];
    (upcomingApptResult.data || []).forEach(a => items.push({
      datum: a.datum, titel: a.titel, type: 'Termin', typWert: a.typ?.wert,
      onClick: `openAppointmentModal('edit','${esc(a.id)}')`
    }));
    if (hasCompany) {
      (upcomingDepResult?.data || []).forEach(d => items.push({
        datum: d.datum_von, titel: d.titel, type: 'Einsatz (Firma)',
        onClick: `openDeploymentModal('edit','${esc(d.id)}')`
      }));
    }
    items.sort((a, b) => (a.datum || '').localeCompare(b.datum || ''));
    upcomingEl.innerHTML = items.length === 0
      ? '<div class="info-card-empty">Nichts geplant.</div>'
      : items.slice(0, 2).map(i => `
        <div class="last-activity-item" style="cursor:pointer" onclick="${i.onClick}">
          <div class="last-activity-date">${esc(formatDateDE(i.datum))}</div>
          <div class="last-activity-title">${esc(i.titel || '—')}<span class="last-activity-type">${esc(i.type)}${i.typWert ? ' · ' + esc(i.typWert) : ''}</span></div>
        </div>
      `).join('');
  }

  // ── OPPORTUNITIES (Projekte mit Kontakt als Hauptkontakt, Lead/Angebot) ──
  const oppEl = document.getElementById('contact-opportunities');
  if (oppEl) {
    const opps = opportunitiesResult.data || [];
    if (opps.length === 0) {
      oppEl.innerHTML = '<div class="info-card-empty">Keine offenen Opportunities.</div>';
    } else {
      oppEl.innerHTML = opps.map(p => `
        <div class="opportunity-row">
          <div style="min-width:0;flex:1">
            <div class="opportunity-name cell-link" onclick="navigateTo('projekt','${esc(p.id)}')">${esc(p.name)}</div>
            <div class="opportunity-meta">${esc(p.status)}${p.enddatum ? ' · Zieldatum ' + esc(formatDateDE(p.enddatum)) : ''}</div>
          </div>
          <div class="opportunity-value">${esc(formatPreis(p.geschaetzter_umsatz || 0))}</div>
        </div>
      `).join('');
    }
  }
}

/** Inline-Notizen-Save: auf Blur speichern, wenn Wert sich geändert hat. */
async function saveCompanyNotesInline() {
  const area = document.getElementById('company-notes-inline');
  const statusEl = document.getElementById('company-notes-save-status');
  const newValue = area.value;
  const oldValue = area.dataset.savedValue || '';
  const companyId = area.dataset.companyId;
  if (!companyId) return;
  if (newValue === oldValue) return;

  statusEl.textContent = 'Speichere ...';
  const { error } = await db.from('companies')
    .update({ notizen: newValue || null }).eq('id', companyId);
  if (error) {
    statusEl.textContent = 'Fehler beim Speichern: ' + error.message;
    statusEl.style.color = 'var(--danger)';
    return;
  }
  area.dataset.savedValue = newValue;
  statusEl.style.color = 'var(--muted)';
  statusEl.textContent = 'Gespeichert ✓';
  setTimeout(() => { if (statusEl.textContent === 'Gespeichert ✓') statusEl.textContent = ''; }, 2000);
}

async function saveContactNotesInline() {
  const area = document.getElementById('contact-notes-inline');
  const statusEl = document.getElementById('contact-notes-save-status');
  const newValue = area.value;
  const oldValue = area.dataset.savedValue || '';
  const contactId = area.dataset.contactId;
  if (!contactId) return;
  if (newValue === oldValue) return;

  statusEl.textContent = 'Speichere ...';
  const { error } = await db.from('contacts')
    .update({ notizen: newValue || null }).eq('id', contactId);
  if (error) {
    statusEl.textContent = 'Fehler beim Speichern: ' + error.message;
    statusEl.style.color = 'var(--danger)';
    return;
  }
  area.dataset.savedValue = newValue;
  statusEl.style.color = 'var(--muted)';
  statusEl.textContent = 'Gespeichert ✓';
  setTimeout(() => { if (statusEl.textContent === 'Gespeichert ✓') statusEl.textContent = ''; }, 2000);
}

/** Lädt Projekt-Dashboard-Stats (v1.30): Wirtschaftlichkeit + Offene Aufgaben +
 *  Letzte/Bevorstehende Aktivität. Die Status- und Deadline-Cards werden direkt
 *  aus den Projektdaten befüllt (synchron), die restlichen parallel. */
async function loadProjectDashboard(p) {
  const now = new Date();
  const todayISO = toISODate(now);

  // ── STATUS-CARD (synchron aus den Projektdaten) ─────────────
  const statusEl = document.getElementById('project-status-value');
  const statusSublineEl = document.getElementById('project-status-subline');
  if (statusEl) {
    const color = projektStatusFarbe(p.status);
    statusEl.innerHTML = `<span class="badge" style="background:${esc(color)}22;color:${esc(color)}">${esc(p.status)}</span>`;
  }
  if (statusSublineEl) {
    if (p.startdatum) statusSublineEl.textContent = `Start: ${formatDateDE(p.startdatum)}`;
    else              statusSublineEl.textContent = 'Noch nicht gestartet';
  }

  // ── DEADLINE-CARD ───────────────────────────────────────────
  const deadlineEl = document.getElementById('project-deadline-value');
  const deadlineSublineEl = document.getElementById('project-deadline-subline');
  if (deadlineEl) {
    if (!p.enddatum) {
      deadlineEl.innerHTML = '<span class="stat-value-muted">Kein Enddatum</span>';
      if (deadlineSublineEl) deadlineSublineEl.textContent = '';
    } else {
      const days = Math.round((new Date(p.enddatum) - new Date(todayISO)) / 86400000);
      const isClosed = p.status === 'Abgeschlossen';
      if (isClosed) {
        deadlineEl.innerHTML = '<span style="color:var(--success);font-weight:600">Abgeschlossen</span>';
      } else if (days < 0) {
        deadlineEl.innerHTML = `<span style="color:var(--danger);font-weight:600">${Math.abs(days)} Tag${Math.abs(days)===1?'':'e'} überzogen</span>`;
      } else if (days === 0) {
        deadlineEl.innerHTML = `<span style="color:var(--warning);font-weight:600">heute</span>`;
      } else {
        deadlineEl.innerHTML = `in ${days} Tag${days===1?'':'en'}`;
      }
      if (deadlineSublineEl) deadlineSublineEl.textContent = `Enddatum: ${formatDateDE(p.enddatum)}`;
    }
  }

  // ── PARALLEL: Finanz-Queries + Aktivität + Aufgaben ─────────
  const [
    depsResult,
    openTasksResult,
    lastApptResult, lastDepResult,
    upcomingApptResult, upcomingDepResult
  ] = await Promise.all([
    // Projekt-Einsätze für Soll/Ist
    db.from('deployments').select('menge, einzelpreis').is('deleted_at', null).eq('project_id', p.id),
    // Offene Aufgaben
    db.from('tasks').select('id, faelligkeit').is('deleted_at', null)
      .eq('project_id', p.id).neq('status', 'erledigt'),
    // Letzter durchgeführter Termin
    db.from('appointments')
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert)').is('deleted_at', null)
      .eq('project_id', p.id).eq('status', 'durchgefuehrt')
      .order('datum', { ascending: false }).limit(1),
    // Letzter durchgeführter/abgerechneter Einsatz
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('project_id', p.id).in('status', ['Durchgeführt', 'Abgerechnet'])
      .not('datum_von', 'is', null).order('datum_von', { ascending: false }).limit(1),
    // Bevorstehender geplanter Termin
    db.from('appointments')
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert)').is('deleted_at', null)
      .eq('project_id', p.id).eq('status', 'geplant')
      .gte('datum', todayISO).order('datum', { ascending: true }).limit(2),
    // Bevorstehender geplanter Einsatz
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('project_id', p.id).eq('status', 'Geplant')
      .gte('datum_von', todayISO).order('datum_von', { ascending: true }).limit(2)
  ]);

  // ── FINANCE-CARD: Soll vs. Ist + Marge ─────────────────────
  const aufwand = (depsResult.data || [])
    .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
  const paket = Number(p.geschaetzter_umsatz) || 0;
  const marge = paket - aufwand;

  const financeMarginEl = document.getElementById('project-finance-margin');
  const financeSublineEl = document.getElementById('project-finance-subline');
  if (financeMarginEl) {
    if (paket === 0 && aufwand === 0) {
      financeMarginEl.innerHTML = '<span class="stat-value-muted">—</span>';
    } else {
      const color = marge >= 0 ? 'var(--success)' : 'var(--danger)';
      const label = marge >= 0 ? 'Marge' : 'Überziehung';
      financeMarginEl.innerHTML = `<span style="color:${color};font-weight:600">${esc(formatPreis(Math.abs(marge)))}</span> <span style="color:var(--muted);font-size:11px">${esc(label)}</span>`;
    }
  }
  if (financeSublineEl) {
    financeSublineEl.textContent = `Paket ${formatPreis(paket)} · Aufwand ${formatPreis(aufwand)}`;
  }

  // ── AUFGABEN-CARD ─────────────────────────────────────────
  const openTasks = openTasksResult.data || [];
  const offenCount = openTasks.length;
  const ueberfaellig = openTasks.filter(t => t.faelligkeit && t.faelligkeit < todayISO).length;
  const tasksEl = document.getElementById('project-open-tasks');
  if (tasksEl) {
    tasksEl.textContent = String(offenCount);
    tasksEl.classList.toggle('stat-value-muted', offenCount === 0);
    tasksEl.classList.toggle('stat-value-overdue', ueberfaellig > 0);
    tasksEl.title = ueberfaellig > 0 ? `${offenCount} offen, davon ${ueberfaellig} überfällig` : `${offenCount} offen`;
  }

  // ── LETZTE AKTIVITÄT (Termin + Einsatz im Projekt) ────────
  const lastAppt = (lastApptResult.data || [])[0] || null;
  const lastDep  = (lastDepResult.data || [])[0] || null;
  const lastEl   = document.getElementById('project-last-activity');
  if (lastEl) {
    const items = [];
    if (lastAppt) items.push({
      datum: lastAppt.datum, titel: lastAppt.titel, type: 'Termin',
      typWert: lastAppt.typ?.wert,
      onClick: `openAppointmentModal('edit','${esc(lastAppt.id)}')`
    });
    if (lastDep?.datum_von) items.push({
      datum: lastDep.datum_von, titel: lastDep.titel, type: 'Einsatz',
      onClick: `openDeploymentModal('edit','${esc(lastDep.id)}')`
    });
    items.sort((a, b) => (b.datum || '').localeCompare(a.datum || ''));
    lastEl.innerHTML = items.length === 0
      ? '<div class="info-card-empty">Noch nichts durchgeführt.</div>'
      : items.slice(0, 2).map(i => `
        <div class="last-activity-item" style="cursor:pointer" onclick="${i.onClick}">
          <div class="last-activity-date">${esc(formatDateDE(i.datum))}</div>
          <div class="last-activity-title">${esc(i.titel || '—')}<span class="last-activity-type">${esc(i.type)}${i.typWert ? ' · ' + esc(i.typWert) : ''}</span></div>
        </div>
      `).join('');
  }

  // ── BEVORSTEHEND ─────────────────────────────────────────
  const upcomingEl = document.getElementById('project-upcoming-activity');
  if (upcomingEl) {
    const items = [];
    (upcomingApptResult.data || []).forEach(a => items.push({
      datum: a.datum, titel: a.titel, type: 'Termin', typWert: a.typ?.wert,
      onClick: `openAppointmentModal('edit','${esc(a.id)}')`
    }));
    (upcomingDepResult.data || []).forEach(dd => items.push({
      datum: dd.datum_von, titel: dd.titel, type: 'Einsatz',
      onClick: `openDeploymentModal('edit','${esc(dd.id)}')`
    }));
    items.sort((a, b) => (a.datum || '').localeCompare(b.datum || ''));
    upcomingEl.innerHTML = items.length === 0
      ? '<div class="info-card-empty">Nichts geplant.</div>'
      : items.slice(0, 2).map(i => `
        <div class="last-activity-item" style="cursor:pointer" onclick="${i.onClick}">
          <div class="last-activity-date">${esc(formatDateDE(i.datum))}</div>
          <div class="last-activity-title">${esc(i.titel || '—')}<span class="last-activity-type">${esc(i.type)}${i.typWert ? ' · ' + esc(i.typWert) : ''}</span></div>
        </div>
      `).join('');
  }
}

/** Inline-Save Projekt-Beschreibung (v1.30). */
async function saveProjectBeschreibungInline() {
  const area = document.getElementById('project-beschreibung-inline');
  const statusEl = document.getElementById('project-beschreibung-save-status');
  const newValue = area.value;
  const oldValue = area.dataset.savedValue || '';
  const projectId = area.dataset.projectId;
  if (!projectId || newValue === oldValue) return;

  statusEl.textContent = 'Speichere ...';
  const { error } = await db.from('projects')
    .update({ beschreibung: newValue || null }).eq('id', projectId);
  if (error) {
    statusEl.textContent = 'Fehler beim Speichern: ' + error.message;
    statusEl.style.color = 'var(--danger)';
    return;
  }
  area.dataset.savedValue = newValue;
  statusEl.style.color = 'var(--muted)';
  statusEl.textContent = 'Gespeichert ✓';
  setTimeout(() => { if (statusEl.textContent === 'Gespeichert ✓') statusEl.textContent = ''; }, 2000);
}

/** Inline-Save Projekt-Notizen (v1.30). */
async function saveProjectNotizenInline() {
  const area = document.getElementById('project-notizen-inline');
  const statusEl = document.getElementById('project-notizen-save-status');
  const newValue = area.value;
  const oldValue = area.dataset.savedValue || '';
  const projectId = area.dataset.projectId;
  if (!projectId || newValue === oldValue) return;

  statusEl.textContent = 'Speichere ...';
  const { error } = await db.from('projects')
    .update({ notizen: newValue || null }).eq('id', projectId);
  if (error) {
    statusEl.textContent = 'Fehler beim Speichern: ' + error.message;
    statusEl.style.color = 'var(--danger)';
    return;
  }
  area.dataset.savedValue = newValue;
  statusEl.style.color = 'var(--muted)';
  statusEl.textContent = 'Gespeichert ✓';
  setTimeout(() => { if (statusEl.textContent === 'Gespeichert ✓') statusEl.textContent = ''; }, 2000);
}

// ═══════════════════════════════════════════════════════════
//  ABC-EDIT-MODAL (v1.25.0)
// ═══════════════════════════════════════════════════════════

let _abcEditCompanyId = null;

function openAbcEditModal(companyId, currentManualAbc) {
  _abcEditCompanyId = companyId;
  // Aktive Markierung im Picker
  document.querySelectorAll('#modal-abc-edit .abc-edit-btn').forEach(btn => {
    const v = btn.dataset.abc || '';
    btn.style.borderColor = (v === (currentManualAbc || '')) ? 'var(--primary)' : '';
    btn.style.background  = (v === (currentManualAbc || '')) ? 'var(--bg)' : '';
  });
  document.getElementById('modal-abc-edit').classList.add('open');
}

function closeAbcEditModal() {
  document.getElementById('modal-abc-edit').classList.remove('open');
  _abcEditCompanyId = null;
}

async function setCompanyAbc(value) {
  if (!_abcEditCompanyId) return;
  const id = _abcEditCompanyId;
  closeAbcEditModal();

  const { error } = await db.from('companies')
    .update({ abc_klassifizierung: value }).eq('id', id);
  if (error) { showToast('Fehler beim Speichern: ' + error.message, true); return; }

  showToast(value
    ? `ABC manuell auf „${value}" gesetzt.`
    : 'ABC zurück auf „automatisch" gesetzt.');

  // Detail-Page reload (refetch + re-render)
  if (currentCompanyDetailId === id) {
    await loadCompanyDetail(id);
  } else if (currentContactDetailId && document.getElementById('page-contact-detail').classList.contains('active')) {
    // Kontakt-Detail offen? Sein ABC-Spiegel muss sich aktualisieren, wenn die Firma gewechselt wurde.
    await loadContactDetail(currentContactDetailId);
  }
}

// ═══════════════════════════════════════════════════════════
//  SCHNELLAKTIONEN-MODAL (v1.25.0)
// ═══════════════════════════════════════════════════════════

let _quickActionsCompanyId = null;
let _quickActionsCompanyName = null;

function openQuickActionsModal(companyId, companyName) {
  _quickActionsCompanyId = companyId;
  _quickActionsCompanyName = companyName;
  const ctx = document.getElementById('quick-actions-context');
  if (ctx) ctx.textContent = `Vordefinierte Workflows für „${companyName || '(ohne Name)'}".`;
  document.getElementById('modal-quick-actions').classList.add('open');
}

function closeQuickActionsModal() {
  document.getElementById('modal-quick-actions').classList.remove('open');
  _quickActionsCompanyId = null;
  _quickActionsCompanyName = null;
}

/** Schnellaktion: TNC-Club Premiumtag — Einsatz mit dem TNC-Club-Premium-Service vorbefüllen.
 *  Wenn die Firma eine aktive TNC-Club-Premium-Mitgliedschaft hat, wird die
 *  Bonus-Einlösung im Einsatz-Modal automatisch angeboten (v1.14-Logik). */
async function runQuickActionTncTag() {
  if (!_quickActionsCompanyId) return;
  const companyId = _quickActionsCompanyId;
  closeQuickActionsModal();

  // Service-ID per Name-Lookup (robust gegen UUID-Wechsel)
  const { data: svc, error } = await db.from('services')
    .select('id').eq('name', 'TNC-Club Premiumtag').eq('ist_aktiv', true).limit(1).single();
  if (error || !svc) {
    showToast('Service „TNC-Club Premiumtag" nicht gefunden — bitte unter Stammdaten anlegen.', true);
    return;
  }

  // Modal mit Prefill öffnen — Service-Selection + Auto-Fill (Titel, Uhrzeit, Preis) zieht
  // im Einsatz-Modal automatisch (v1.10), Entitlement-Sektion zeigt sich, falls Firma die
  // passende Mitgliedschaft hat (v1.14).
  deploymentModalPrefillCompanyId = companyId;
  window._pendingDeploymentPrefillServiceId = svc.id;
  await openDeploymentModal('new');
}

// ═══════════════════════════════════════════════════════════
//  INLINE-EXPAND-ROW DASHBOARDS (v1.27.0)
// ═══════════════════════════════════════════════════════════
//
// Ein Klick auf eine Listen-Zeile klappt darunter ein Detail-Dashboard
// auf (Stats · Kontext · verwandte Einträge · Schnellaktionen).
// Nur eine Zeile gleichzeitig app-weit. Auf Mobile (<=600 px) wird
// stattdessen das bestehende Bearbeiten-Modal geöffnet.

let _expandedRow = { type: null, id: null, rowEl: null, panelRow: null };

function isMobileForExpand() {
  return window.matchMedia('(max-width: 600px)').matches;
}

function closeExpandedRow() {
  if (_expandedRow.rowEl) _expandedRow.rowEl.classList.remove('row-expanded');
  if (_expandedRow.panelRow) _expandedRow.panelRow.remove();
  _expandedRow = { type: null, id: null, rowEl: null, panelRow: null };
}

/** Findet die Trigger-Zeile einer Entität über ihr data-Attribut. Nur Typen mit
 *  `data-*-id` auf `<tr>` werden gefunden — aktuell deployment, appointment, task. */
function findRowForEntity(type, id) {
  const attr = type === 'deployment'  ? 'data-dep-id'
             : type === 'appointment' ? 'data-appt-id'
             : type === 'task'        ? 'data-task-id'
             : null;
  if (!attr) return null;
  return document.querySelector(`tr[${attr}="${CSS.escape(id)}"]`);
}

/** Führt `fn` aus und stellt die vorher aufgeklappte Zeile danach wieder her,
 *  falls sie im neu gerenderten DOM noch existiert. Wichtig für Schnellaktionen,
 *  die eine Status-Änderung bewirken und die Liste refreshen, aber das Dashboard
 *  nicht schließen sollen (v1.31 — Einsatz durchgeführt/abgerechnet). */
async function preserveExpandedRowAcross(fn) {
  const prev = _expandedRow.id ? { type: _expandedRow.type, id: _expandedRow.id } : null;
  closeExpandedRow();
  await fn();
  if (!prev) return;
  const row = findRowForEntity(prev.type, prev.id);
  if (row) await toggleRowExpand(prev.type, prev.id, row);
}

/** Auto-Expand (v1.27.1, generalisiert v1.28): Wenn in einem Sub-Tab genau ein Eintrag
 *  angezeigt wird, klappt die einzige Zeile automatisch auf — spart den manuellen Klick.
 *  Greift nicht auf Mobile (dort würde das Klick→Modal-Verhalten ungewöhnlich brechen). */
function autoExpandSingleRow(tbody, entityType, items) {
  if (!tbody || !Array.isArray(items) || items.length !== 1) return;
  if (isMobileForExpand()) return;
  const firstRow = tbody.querySelector('tr');
  if (!firstRow) return;
  toggleRowExpand(entityType, items[0].id, firstRow);
}

/** @deprecated Wrapper-Kompat — verwende autoExpandSingleRow(tbody, 'appointment', items). */
function autoExpandSingleAppointmentRow(tbody, items) {
  autoExpandSingleRow(tbody, 'appointment', items);
}

/** Öffnet oder schließt das Inline-Dashboard für eine Listen-Zeile.
 *  Auf Mobile: Fallback zum bestehenden Bearbeiten-Modal. */
async function toggleRowExpand(entityType, entityId, rowEl) {
  if (isMobileForExpand()) {
    if (entityType === 'appointment') return openAppointmentModal('edit', entityId);
    if (entityType === 'deployment')  return openDeploymentModal('edit', entityId);
    if (entityType === 'task')        return openTaskModal('edit', entityId);
    return;
  }

  const sameOpen = _expandedRow.id === entityId
                && _expandedRow.type === entityType
                && _expandedRow.rowEl === rowEl;
  closeExpandedRow();
  if (sameOpen) return;

  // Neue Expand-Row einfügen
  const panelRow = document.createElement('tr');
  panelRow.className = 'expanded-row';
  const colCount = rowEl.querySelectorAll('td').length || 1;
  const td = document.createElement('td');
  td.colSpan = colCount;
  td.innerHTML = '<div class="expanded-row-panel-inner"><div class="info-card-empty">Lade ...</div></div>';
  panelRow.appendChild(td);
  rowEl.parentNode.insertBefore(panelRow, rowEl.nextSibling);
  rowEl.classList.add('row-expanded');

  _expandedRow = { type: entityType, id: entityId, rowEl, panelRow };

  try {
    let html = '';
    if (entityType === 'appointment')      html = await renderAppointmentExpandedRow(entityId);
    else if (entityType === 'deployment')  html = await renderDeploymentExpandedRow(entityId);
    else if (entityType === 'task')        html = await renderTaskExpandedRow(entityId);
    td.innerHTML = `<div class="expanded-row-panel-inner">${html}</div>`;
  } catch (e) {
    td.innerHTML = `<div class="expanded-row-panel-inner"><div class="info-card-empty">Fehler: ${esc(e.message)}</div></div>`;
  }
}

/** Baut das Termin-Inline-Dashboard (v1.27).
 *  Lädt den Termin + Kontextdaten + 3 verwandte Termine + offene Aufgaben. */
async function renderAppointmentExpandedRow(appointmentId) {
  const [apptResult, relatedResult] = await Promise.all([
    db.from('appointments')
      .select(`
        *,
        typ:lookup_values!appointments_typ_id_fkey(id, wert, farbe),
        company:companies(id, name, abc_klassifizierung),
        contact:contacts(id, vorname, nachname, telefon, email),
        project:projects(id, name, status),
        deployment:deployments(id, titel, status)
      `)
      .is('deleted_at', null).eq('id', appointmentId).single(),
    // Platzhalter — echte „verwandte" Query kommt unten, sobald wir company_id kennen
    Promise.resolve({ data: [] })
  ]);

  if (apptResult.error || !apptResult.data) {
    return `<div class="info-card-empty">Termin konnte nicht geladen werden.</div>`;
  }
  const a = apptResult.data;

  // Zweite Runde: verwandte Daten basierend auf company_id / contact_id
  const todayISO = toISODate(new Date());
  const [relAppts, openTasksForCompanyOrContact] = await Promise.all([
    a.company_id
      ? db.from('appointments')
          .select('id, titel, datum, status, typ:lookup_values!appointments_typ_id_fkey(wert)')
          .is('deleted_at', null).eq('company_id', a.company_id).neq('id', appointmentId)
          .order('datum', { ascending: false }).limit(3)
      : Promise.resolve({ data: [] }),
    db.from('tasks').select('id, titel, faelligkeit, status').is('deleted_at', null)
      .or(`company_id.eq.${a.company_id || '00000000-0000-0000-0000-000000000000'},contact_id.eq.${a.contact_id || '00000000-0000-0000-0000-000000000000'}`)
      .neq('status', 'erledigt').order('faelligkeit', { ascending: true, nullsFirst: false }).limit(3)
  ]);

  // Stats-Row
  const statusBg  = appointmentStatusBg(a.status);
  const statusCol = appointmentStatusColor(a.status);
  const statusLbl = appointmentStatusLabel(a.status);
  const typFarbe  = a.typ?.farbe || '#6b7280';
  const typWert   = a.typ?.wert  || '—';

  const abcBadge = a.company?.abc_klassifizierung
    ? `<span class="abc-badge abc-badge-${a.company.abc_klassifizierung}" style="width:24px;height:24px;font-size:12px;display:inline-flex;align-items:center;justify-content:center">${esc(a.company.abc_klassifizierung)}</span>`
    : `<span style="color:var(--muted)">—</span>`;

  const uhrzeit = a.uhrzeit_von
    ? (a.uhrzeit_bis ? `${formatTime(a.uhrzeit_von)}–${formatTime(a.uhrzeit_bis)}` : formatTime(a.uhrzeit_von))
    : null;

  const datumIst = a.datum < todayISO ? 'vergangen' : (a.datum === todayISO ? 'heute' : 'kommend');
  const datumColor = a.datum === todayISO ? 'var(--warning)' : (a.datum < todayISO ? 'var(--muted)' : 'var(--text)');

  const deploymentStat = a.deployment
    ? `<span class="cell-link" onclick="openDeploymentModal('edit','${esc(a.deployment.id)}')">${esc(a.deployment.titel || '—')}</span>`
    : '<span class="erp-stat-muted">nicht gekoppelt</span>';

  const statsHtml = `
    <div class="erp-stats">
      <div class="erp-stat-item">
        <div class="erp-stat-label">Status</div>
        <div><span class="badge" style="background:${statusBg};color:${statusCol}">${esc(statusLbl)}</span></div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Typ</div>
        <div><span class="badge" style="background:${esc(typFarbe)}22;color:${esc(typFarbe)}">${esc(typWert)}</span></div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Datum</div>
        <div class="erp-stat-value" style="color:${datumColor}">${esc(formatDateDE(a.datum))} · ${esc(datumIst)}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Uhrzeit</div>
        <div class="erp-stat-value ${uhrzeit ? '' : 'erp-stat-muted'}">${uhrzeit ? esc(uhrzeit) : '—'}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">ABC (Firma)</div>
        <div>${abcBadge}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Gekoppelter Einsatz</div>
        <div class="erp-stat-value">${deploymentStat}</div>
      </div>
    </div>`;

  // Kontext-Block
  const firmaVal = a.company
    ? `<span class="cell-link" onclick="navigateTo('firma','${esc(a.company.id)}')">${esc(a.company.name)}</span>`
    : '<span class="erp-kv-muted">—</span>';
  const kontaktVal = a.contact
    ? `<span class="cell-link" onclick="navigateTo('kontakt','${esc(a.contact.id)}')">${esc([a.contact.vorname, a.contact.nachname].filter(Boolean).join(' '))}</span>`
    : '<span class="erp-kv-muted">—</span>';
  const projektVal = a.project
    ? `<span class="cell-link" onclick="navigateTo('projekt','${esc(a.project.id)}')">${esc(a.project.name)}</span> <span style="color:var(--muted);font-size:11px">· ${esc(a.project.status)}</span>`
    : '<span class="erp-kv-muted">—</span>';
  const ortVal = a.ort ? esc(a.ort) : '<span class="erp-kv-muted">—</span>';
  const notizenVal = a.notizen
    ? `<div style="white-space:pre-wrap;font-size:12px;color:var(--muted);max-height:80px;overflow:auto">${esc(a.notizen)}</div>`
    : '<span class="erp-kv-muted">—</span>';

  const kontextHtml = `
    <div>
      <div class="erp-kv">
        <div class="erp-kv-label">Firma</div>      <div class="erp-kv-value">${firmaVal}</div>
        <div class="erp-kv-label">Kontakt</div>    <div class="erp-kv-value">${kontaktVal}</div>
        <div class="erp-kv-label">Projekt</div>    <div class="erp-kv-value">${projektVal}</div>
        <div class="erp-kv-label">Ort</div>        <div class="erp-kv-value">${ortVal}</div>
        <div class="erp-kv-label">Notizen</div>    <div class="erp-kv-value">${notizenVal}</div>
      </div>`;

  // Verwandte Termine derselben Firma
  const relHtml = (relAppts.data || []).length > 0
    ? `<div class="erp-related">
         <div class="erp-section-title">Letzte Termine derselben Firma</div>
         ${relAppts.data.map(r => `
           <div class="erp-related-row">
             <div class="erp-related-date">${esc(formatDateDE(r.datum))}</div>
             <div class="erp-related-title" onclick="openAppointmentModal('edit','${esc(r.id)}')"><span class="termin-title-icon">${terminTypIcon(r.typ?.wert)}</span>${esc(r.titel || '—')}</div>
             <div class="erp-related-meta">${esc(r.typ?.wert || '')} · ${esc(appointmentStatusLabel(r.status))}</div>
           </div>
         `).join('')}
       </div>`
    : '';

  // Offene Aufgaben im Kontext (Firma oder Kontakt)
  const taskRows = (openTasksForCompanyOrContact.data || []);
  const tasksHtml = taskRows.length > 0
    ? `<div class="erp-related">
         <div class="erp-section-title">Offene Aufgaben (Firma / Kontakt)</div>
         ${taskRows.map(t => {
           const overdue = t.faelligkeit && t.faelligkeit < todayISO;
           return `
             <div class="erp-related-row">
               <div class="erp-related-date">${t.faelligkeit ? esc(formatDateDE(t.faelligkeit)) : '<span style="color:var(--muted)">—</span>'}</div>
               <div class="erp-related-title" onclick="openTaskModal('edit','${esc(t.id)}')">${esc(t.titel || '—')}</div>
               <div class="erp-related-meta" ${overdue ? 'style="color:var(--danger);font-weight:600"' : ''}>${overdue ? 'überfällig' : esc(aufgabeStatusLabel(t.status))}</div>
             </div>`;
         }).join('')}
       </div>`
    : '';

  // Schnellaktionen
  const isDone = a.status === 'durchgefuehrt';
  const actionsHtml = `
    <div class="erp-actions">
      <div class="erp-section-title" style="margin-top:0">Schnellaktionen</div>
      ${isDone ? '' : `<button class="erp-action-btn erp-action-primary" onclick="quickAppointmentMarkDone('${esc(a.id)}')">
        <span class="erp-action-btn-icon">✓</span> Als durchgeführt markieren
      </button>`}
      <button class="erp-action-btn" onclick="quickAppointmentFollowup('${esc(a.id)}')">
        <span class="erp-action-btn-icon">+</span> Folge-Termin (+1 Woche)
      </button>
      <button class="erp-action-btn" onclick="quickAppointmentCreateTask('${esc(a.id)}')">
        <span class="erp-action-btn-icon">+</span> Aufgabe aus Termin
      </button>
      <button class="erp-action-btn" onclick="quickAppointmentCreateDeployment('${esc(a.id)}')">
        <span class="erp-action-btn-icon">+</span> Einsatz aus Termin
      </button>
      <button class="erp-action-btn" onclick="openAppointmentModal('edit','${esc(a.id)}')">
        <span class="erp-action-btn-icon">✎</span> Vollbearbeitung …
      </button>
    </div>`;

  return `
    ${statsHtml}
    <div class="erp-body">
      ${kontextHtml}${relHtml}${tasksHtml}</div>
      ${actionsHtml}
    </div>`;
}

// ── TERMIN-SCHNELLAKTIONEN ──────────────────────────────────

/** Termin als durchgeführt markieren — UPDATE + Auto-Projekt-Status + Liste refreshen. */
async function quickAppointmentMarkDone(appointmentId) {
  const { data: appt, error: selErr } = await db.from('appointments')
    .select('id, project_id, status').eq('id', appointmentId).single();
  if (selErr || !appt) { showToast('Termin nicht gefunden.', true); return; }
  if (appt.status === 'durchgefuehrt') { showToast('Termin ist bereits als durchgeführt markiert.', true); return; }

  const { error } = await db.from('appointments')
    .update({ status: 'durchgefuehrt' }).eq('id', appointmentId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }

  showToast('Termin auf „durchgeführt" gesetzt.');
  if (appt.project_id) await checkAndUpdateProjectStatus(appt.project_id);
  closeExpandedRow();
  await refreshCurrentAppointmentList();
}

/** Folge-Termin (+7 Tage) mit Prefill aus dem aktuellen Termin. */
async function quickAppointmentFollowup(appointmentId) {
  const { data: a, error } = await db.from('appointments')
    .select('company_id, contact_id, project_id, typ_id, ort, titel').eq('id', appointmentId).single();
  if (error || !a) { showToast('Termin nicht gefunden.', true); return; }

  closeExpandedRow();

  if (a.company_id)  appointmentModalPrefillCompanyId  = a.company_id;
  if (a.contact_id)  appointmentModalPrefillContactId  = a.contact_id;
  if (a.project_id)  appointmentModalPrefillProjectId  = a.project_id;

  await openAppointmentModal('new');
  // Nach dem Öffnen Prefill-Werte aus dem Ursprungstermin eintragen (Typ/Ort/Titel),
  // Datum +7 Tage vom Originaldatum.
  const d = new Date(); d.setDate(d.getDate() + 7);
  document.getElementById('t-datum').value = toISODate(d);
  if (a.ort)   document.getElementById('t-ort').value   = a.ort;
  if (a.titel) document.getElementById('t-titel').value = `Folgetermin: ${a.titel}`;
  if (a.typ_id) {
    const typSelect = document.getElementById('t-typ');
    if (typSelect) typSelect.value = a.typ_id;
  }
}

/** Aufgabe aus Termin — Prefill auf Firma/Kontakt + Titel-Hinweis. */
async function quickAppointmentCreateTask(appointmentId) {
  const { data: a, error } = await db.from('appointments')
    .select('company_id, contact_id, titel, datum').eq('id', appointmentId).single();
  if (error || !a) { showToast('Termin nicht gefunden.', true); return; }

  closeExpandedRow();
  if (a.company_id) taskModalPrefillCompanyId = a.company_id;
  if (a.contact_id) taskModalPrefillContactId = a.contact_id;
  await openTaskModal('new');
  const titleInput = document.getElementById('a-titel');
  if (titleInput) titleInput.value = `Follow-up zu Termin: ${a.titel || formatDateDE(a.datum)}`;
}

/** Einsatz aus Termin — Prefill Firma + Datum, Techniker bleibt leer. */
async function quickAppointmentCreateDeployment(appointmentId) {
  const { data: a, error } = await db.from('appointments')
    .select('company_id, project_id, datum, uhrzeit_von, uhrzeit_bis, ort, titel').eq('id', appointmentId).single();
  if (error || !a) { showToast('Termin nicht gefunden.', true); return; }
  if (!a.company_id) { showToast('Termin hat keine Firma — bitte erst Firma am Termin setzen.', true); return; }

  closeExpandedRow();
  deploymentModalPrefillCompanyId = a.company_id;
  if (a.project_id) deploymentModalPrefillProjectId = a.project_id;
  await openDeploymentModal('new');

  if (a.datum)       document.getElementById('d-datum-von').value = a.datum;
  if (a.uhrzeit_von) document.getElementById('d-uhrzeit-von').value = a.uhrzeit_von;
  if (a.uhrzeit_bis) document.getElementById('d-uhrzeit-bis').value = a.uhrzeit_bis;
  if (a.ort)         document.getElementById('d-ort').value = a.ort;
  if (a.titel)       document.getElementById('d-titel').value = a.titel;
}

/** Hilfs-Refresh: lädt die aktuell sichtbare Termine-Liste neu (Haupt-Seite / Firma / Kontakt / Projekt). */
async function refreshCurrentAppointmentList() {
  if (currentContactDetailId && document.getElementById('page-contact-detail').classList.contains('active')) {
    await loadContactAppointments(currentContactDetailId);
  } else if (currentProjectDetailId && document.getElementById('page-project-detail').classList.contains('active')) {
    await loadProjectAppointments(currentProjectDetailId);
  } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
    await loadCompanyAppointments(currentCompanyDetailId);
  } else {
    await loadAppointments();
  }
  refreshCalendarBar();  // v1.32: Kalender mitziehen
}

// ── EINSATZ-INLINE-DASHBOARD (v1.28.0) ──────────────────────

/** Baut das Einsatz-Inline-Dashboard.
 *  Lädt Einsatz + Firma/Service/Projekt + Techniker + gekoppelter Termin +
 *  Entitlement-Einlösung (wenn vorhanden) + letzte 3 Einsätze derselben Firma.
 *  Wenn Einsatz Teil eines Projekts ist, wird zusätzlich Soll-vs-Ist gegen den Paketpreis gezeigt. */
async function renderDeploymentExpandedRow(deploymentId) {
  const depResult = await db.from('deployments')
    .select(`
      *,
      company:companies(id, name, abc_klassifizierung),
      service:services(id, name, einheit),
      project:projects(id, name, status, geschaetzter_umsatz)
    `)
    .is('deleted_at', null).eq('id', deploymentId).single();

  if (depResult.error || !depResult.data) {
    return `<div class="info-card-empty">Einsatz konnte nicht geladen werden.</div>`;
  }
  const d = depResult.data;

  const [
    technikerResult,
    linkedApptResult,
    redemptionResult,
    relResult,
    projectDepsResult
  ] = await Promise.all([
    // Techniker (intern) via Join-Tabelle
    db.from('deployment_technicians')
      .select('user_id, user:user_profiles!deployment_technicians_user_id_fkey(id, name)')
      .eq('deployment_id', deploymentId),
    // Gekoppelter Termin
    db.from('appointments')
      .select('id, titel, datum, status')
      .is('deleted_at', null).eq('deployment_id', deploymentId).limit(1),
    // Entitlement-Einlösung (nur Menge — Detail-Info lebt am Entitlement selbst)
    db.from('entitlement_redemptions')
      .select('id, menge_eingeloest')
      .eq('deployment_id', deploymentId).limit(1),
    // Letzte 3 Einsätze derselben Firma (ohne diesen)
    d.company_id
      ? db.from('deployments')
          .select('id, titel, datum_von, status, menge, einzelpreis')
          .is('deleted_at', null).eq('company_id', d.company_id).neq('id', deploymentId)
          .order('datum_von', { ascending: false, nullsFirst: false }).limit(3)
      : Promise.resolve({ data: [] }),
    // Projekt-Einsätze (für Soll/Ist)
    d.project_id
      ? db.from('deployments')
          .select('menge, einzelpreis').is('deleted_at', null).eq('project_id', d.project_id)
      : Promise.resolve({ data: [] })
  ]);

  const todayISO = toISODate(new Date());

  // Stats-Row
  const statusColor = einsatzStatusFarbe(d.status);
  const gesamt = calcDeploymentGesamt(d.menge, d.einzelpreis);
  const wertLabel = d.project_id ? 'Positionswert (Aufwand)' : 'Wert';

  const abcBadge = d.company?.abc_klassifizierung
    ? `<span class="abc-badge abc-badge-${d.company.abc_klassifizierung}" style="width:24px;height:24px;font-size:12px;display:inline-flex;align-items:center;justify-content:center">${esc(d.company.abc_klassifizierung)}</span>`
    : `<span style="color:var(--muted)">—</span>`;

  const datumLabel = d.datum_von
    ? (d.datum_bis && d.datum_bis !== d.datum_von
        ? `${esc(formatDateDE(d.datum_von))} – ${esc(formatDateDE(d.datum_bis))}`
        : esc(formatDateDE(d.datum_von)))
    : '<span class="erp-stat-muted">Ungeplant</span>';

  const linkedAppt = (linkedApptResult.data || [])[0] || null;
  const terminStat = linkedAppt
    ? `<span class="cell-link" onclick="openAppointmentModal('edit','${esc(linkedAppt.id)}')">${esc(formatDateDE(linkedAppt.datum))}${linkedAppt.titel ? ' · ' + esc(linkedAppt.titel) : ''}</span>`
    : '<span class="erp-stat-muted">nicht gekoppelt</span>';

  const redemption = (redemptionResult.data || [])[0] || null;
  const entitlementStat = redemption
    ? `<span style="color:var(--success);font-weight:600">${esc(redemption.menge_eingeloest)} eingelöst</span>`
    : '<span class="erp-stat-muted">keine</span>';

  const statsHtml = `
    <div class="erp-stats">
      <div class="erp-stat-item">
        <div class="erp-stat-label">Status</div>
        <div><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(d.status)}</span></div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">${esc(wertLabel)}</div>
        <div class="erp-stat-value">${esc(formatPreis(gesamt))}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Datum</div>
        <div class="erp-stat-value">${datumLabel}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">ABC (Firma)</div>
        <div>${abcBadge}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Projekt</div>
        <div class="erp-stat-value">${d.project
          ? `<span class="cell-link" onclick="navigateTo('projekt','${esc(d.project.id)}')">${esc(d.project.name)}</span>`
          : '<span class="erp-stat-muted">Einzelbuchung</span>'}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Gekoppelter Termin</div>
        <div class="erp-stat-value">${terminStat}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Bonus-Einlösung</div>
        <div class="erp-stat-value">${entitlementStat}</div>
      </div>
    </div>`;

  // Kontext-Block
  const firmaVal = d.company
    ? `<span class="cell-link" onclick="navigateTo('firma','${esc(d.company.id)}')">${esc(d.company.name)}</span>`
    : '<span class="erp-kv-muted">—</span>';
  const serviceVal = d.service
    ? `${esc(d.service.name)}${d.service.einheit ? ` <span style="color:var(--muted);font-size:11px">· ${esc(d.service.einheit)}</span>` : ''}`
    : '<span class="erp-kv-muted">—</span>';

  const internalTechniker = (technikerResult.data || [])
    .map(t => t.user?.name).filter(Boolean);
  const technikerList = [...internalTechniker];
  if (d.externe_techniker) technikerList.push(`${d.externe_techniker} (extern)`);
  const technikerVal = technikerList.length
    ? esc(technikerList.join(', '))
    : '<span class="erp-kv-muted">—</span>';

  const uhrzeit = d.uhrzeit_von
    ? (d.uhrzeit_bis ? `${formatTime(d.uhrzeit_von)}–${formatTime(d.uhrzeit_bis)}` : formatTime(d.uhrzeit_von))
    : null;
  const zeitVal = uhrzeit ? esc(uhrzeit) : '<span class="erp-kv-muted">—</span>';

  const mengeVal = `${esc(d.menge ?? 0)} × ${esc(formatPreis(d.einzelpreis ?? 0))} = <strong>${esc(formatPreis(gesamt))}</strong>`;
  const ortVal = d.ort ? esc(d.ort) : '<span class="erp-kv-muted">—</span>';
  const notizenVal = d.notizen
    ? `<div style="white-space:pre-wrap;font-size:12px;color:var(--muted);max-height:80px;overflow:auto">${esc(d.notizen)}</div>`
    : '<span class="erp-kv-muted">—</span>';

  const kontextHtml = `
    <div>
      <div class="erp-kv">
        <div class="erp-kv-label">Firma</div>     <div class="erp-kv-value">${firmaVal}</div>
        <div class="erp-kv-label">Leistung</div>  <div class="erp-kv-value">${serviceVal}</div>
        <div class="erp-kv-label">Techniker</div> <div class="erp-kv-value">${technikerVal}</div>
        <div class="erp-kv-label">Uhrzeit</div>   <div class="erp-kv-value">${zeitVal}</div>
        <div class="erp-kv-label">Menge × €</div> <div class="erp-kv-value">${mengeVal}</div>
        <div class="erp-kv-label">Ort</div>       <div class="erp-kv-value">${ortVal}</div>
        <div class="erp-kv-label">Notizen</div>   <div class="erp-kv-value">${notizenVal}</div>
      </div>`;

  // Projekt-Kontext (Soll/Ist) wenn im Projekt
  let projektKontextHtml = '';
  if (d.project_id && d.project) {
    const aufwandSumme = (projectDepsResult.data || [])
      .reduce((s, r) => s + (Number(r.menge) || 0) * (Number(r.einzelpreis) || 0), 0);
    const paket = Number(d.project.geschaetzter_umsatz) || 0;
    const diff = paket - aufwandSumme;
    const diffColor = diff >= 0 ? 'var(--success)' : 'var(--danger)';
    const diffLabel = diff >= 0 ? 'Marge' : 'Überziehung';
    projektKontextHtml = `
      <div class="erp-related">
        <div class="erp-section-title">Projekt-Kontext</div>
        <div class="erp-kv" style="grid-template-columns:120px 1fr">
          <div class="erp-kv-label">Paketpreis</div>       <div class="erp-kv-value">${esc(formatPreis(paket))}</div>
          <div class="erp-kv-label">Interner Aufwand</div> <div class="erp-kv-value">${esc(formatPreis(aufwandSumme))}</div>
          <div class="erp-kv-label">${esc(diffLabel)}</div> <div class="erp-kv-value" style="color:${diffColor};font-weight:600">${esc(formatPreis(Math.abs(diff)))}</div>
        </div>
      </div>`;
  }

  // Historie: letzte 3 Einsätze derselben Firma
  const relRows = (relResult.data || []);
  const relHtml = relRows.length > 0
    ? `<div class="erp-related">
         <div class="erp-section-title">Letzte Einsätze derselben Firma</div>
         ${relRows.map(r => {
           const gRel = calcDeploymentGesamt(r.menge, r.einzelpreis);
           return `
             <div class="erp-related-row">
               <div class="erp-related-date">${r.datum_von ? esc(formatDateDE(r.datum_von)) : '<span style="color:var(--muted)">—</span>'}</div>
               <div class="erp-related-title" onclick="openDeploymentModal('edit','${esc(r.id)}')">${esc(r.titel || '—')}</div>
               <div class="erp-related-meta">${esc(r.status)} · ${esc(formatPreis(gRel))}</div>
             </div>`;
         }).join('')}
       </div>`
    : '';

  // Schnellaktionen
  const isGeplant      = d.status === 'Geplant';
  const isDurchgefuehrt = d.status === 'Durchgeführt';
  const isAbgerechnet  = d.status === 'Abgerechnet';

  const actionsHtml = `
    <div class="erp-actions">
      <div class="erp-section-title" style="margin-top:0">Schnellaktionen</div>
      ${isGeplant ? `<button class="erp-action-btn erp-action-primary" onclick="quickDeploymentMarkDone('${esc(d.id)}')">
        <span class="erp-action-btn-icon">✓</span> Als durchgeführt markieren
      </button>` : ''}
      ${isDurchgefuehrt ? `<button class="erp-action-btn erp-action-primary" onclick="quickDeploymentMarkBilled('${esc(d.id)}')">
        <span class="erp-action-btn-icon">€</span> Als abgerechnet markieren
      </button>` : ''}
      ${isAbgerechnet ? `<div style="padding:8px 12px;font-size:12px;color:var(--muted);background:#f9fafb;border-radius:6px;border:1px dashed var(--border)">Einsatz ist abgerechnet — kein weiterer Status-Wechsel per Schnellaktion.</div>` : ''}
      <button class="erp-action-btn" onclick="quickDeploymentDuplicate('${esc(d.id)}')">
        <span class="erp-action-btn-icon">⎘</span> Duplizieren
      </button>
      <button class="erp-action-btn" onclick="quickDeploymentFollowup('${esc(d.id)}')">
        <span class="erp-action-btn-icon">+</span> Folge-Einsatz anlegen
      </button>
      <button class="erp-action-btn" onclick="openDeploymentModal('edit','${esc(d.id)}')">
        <span class="erp-action-btn-icon">✎</span> Vollbearbeitung …
      </button>
    </div>`;

  return `
    ${statsHtml}
    <div class="erp-body">
      ${kontextHtml}${projektKontextHtml}${relHtml}</div>
      ${actionsHtml}
    </div>`;
}

/** Einsatz auf „Durchgeführt" setzen — mit Auto-Projekt-Status-Check.
 *  Das Dashboard bleibt offen, damit der User direkt weiterarbeiten kann
 *  (z. B. „Durchgeführt" → „Abgerechnet" ohne erneutes Aufklappen). */
async function quickDeploymentMarkDone(deploymentId) {
  const { data: dep, error: selErr } = await db.from('deployments')
    .select('id, project_id, status').eq('id', deploymentId).single();
  if (selErr || !dep) { showToast('Einsatz nicht gefunden.', true); return; }
  if (dep.status === 'Durchgeführt' || dep.status === 'Abgerechnet') {
    showToast(`Einsatz ist bereits „${dep.status}".`, true); return;
  }
  const { error } = await db.from('deployments')
    .update({ status: 'Durchgeführt' }).eq('id', deploymentId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast('Einsatz auf „Durchgeführt" gesetzt.');
  if (dep.project_id) await checkAndUpdateProjectStatus(dep.project_id);
  await preserveExpandedRowAcross(() => refreshCurrentDeploymentList());
}

/** Einsatz auf „Abgerechnet" setzen — nur aus „Durchgeführt" heraus.
 *  Dashboard bleibt offen (v1.31). */
async function quickDeploymentMarkBilled(deploymentId) {
  const { data: dep, error: selErr } = await db.from('deployments')
    .select('id, project_id, status').eq('id', deploymentId).single();
  if (selErr || !dep) { showToast('Einsatz nicht gefunden.', true); return; }
  if (dep.status !== 'Durchgeführt') {
    showToast('Abrechnung nur aus Status „Durchgeführt" möglich.', true); return;
  }
  const { error } = await db.from('deployments')
    .update({ status: 'Abgerechnet' }).eq('id', deploymentId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast('Einsatz als „Abgerechnet" markiert.');
  if (dep.project_id) await checkAndUpdateProjectStatus(dep.project_id);
  await preserveExpandedRowAcross(() => refreshCurrentDeploymentList());
}

/** Einsatz duplizieren (nutzt bestehende duplicateDeployment-Helfer, v1.11). */
async function quickDeploymentDuplicate(deploymentId) {
  closeExpandedRow();
  try {
    await duplicateDeployment(deploymentId);
  } catch (e) {
    showToast('Fehler: ' + e.message, true);
  }
}

/** Folge-Einsatz: Modal im New-Mode mit Prefill aus dem aktuellen Einsatz.
 *  Datum bleibt leer, damit der User bewusst neu plant. Status: Geplant. */
async function quickDeploymentFollowup(deploymentId) {
  const { data: d, error } = await db.from('deployments')
    .select('company_id, project_id, service_id, einzelpreis, menge, ort, titel').eq('id', deploymentId).single();
  if (error || !d) { showToast('Einsatz nicht gefunden.', true); return; }

  closeExpandedRow();
  if (d.company_id) deploymentModalPrefillCompanyId = d.company_id;
  if (d.project_id) deploymentModalPrefillProjectId = d.project_id;
  if (d.service_id) window._pendingDeploymentPrefillServiceId = d.service_id;

  await openDeploymentModal('new');
  if (d.ort)         document.getElementById('d-ort').value = d.ort;
  if (d.titel)       document.getElementById('d-titel').value = `Folgeeinsatz: ${d.titel}`;
  // Service-change-Event kümmert sich um Preis/Uhrzeit; wenn kein Service, behalten wir Menge/Preis
  if (!d.service_id) {
    if (d.menge)       document.getElementById('d-menge').value = d.menge;
    if (d.einzelpreis) document.getElementById('d-einzelpreis').value = d.einzelpreis;
  }
}

/** Hilfs-Refresh: lädt die aktuell sichtbare Einsatz-Liste neu. */
async function refreshCurrentDeploymentList() {
  if (currentProjectDetailId && document.getElementById('page-project-detail').classList.contains('active')) {
    await loadProjectDeployments(currentProjectDetailId);
  } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
    await loadCompanyDeployments(currentCompanyDetailId);
  } else {
    await loadDeployments();
  }
  refreshCalendarBar();  // v1.32: Kalender mitziehen
}

// ── AUFGABE-INLINE-DASHBOARD (v1.29.0) ──────────────────────

/** Baut das Aufgabe-Inline-Dashboard. Zeigt Status, Fälligkeit/Tage-bis-fällig,
 *  Zuständigen, Kontext (Firma/Kontakt/Projekt), Beschreibung/Notizen,
 *  verwandte offene Aufgaben (selbe Firma ODER selber Zuständiger). */
async function renderTaskExpandedRow(taskId) {
  const taskResult = await db.from('tasks')
    .select(`
      *,
      assigned:user_profiles!tasks_assigned_to_fkey(id, name, email),
      company:companies(id, name),
      contact:contacts(id, vorname, nachname),
      project:projects(id, name, status)
    `)
    .is('deleted_at', null).eq('id', taskId).single();

  if (taskResult.error || !taskResult.data) {
    return `<div class="info-card-empty">Aufgabe konnte nicht geladen werden.</div>`;
  }
  const t = taskResult.data;
  const todayISO = toISODate(new Date());

  // Verwandte offene Aufgaben — selbe Firma ODER selber Kontakt (nicht: selber Zuständiger).
  // Fachlicher Grund: wir wollen „was steht sonst noch bei diesem Kunden an", nicht
  // „was hat dieselbe Person sonst noch zu tun". Selber Zuständiger wurde nie gebraucht.
  const orParts = [];
  if (t.company_id)  orParts.push(`company_id.eq.${t.company_id}`);
  if (t.contact_id)  orParts.push(`contact_id.eq.${t.contact_id}`);
  const relResult = orParts.length
    ? await db.from('tasks')
        .select('id, titel, faelligkeit, status, company:companies(id, name), contact:contacts(id, vorname, nachname)')
        .is('deleted_at', null).neq('id', taskId).neq('status', 'erledigt')
        .or(orParts.join(','))
        .order('faelligkeit', { ascending: true, nullsFirst: false }).limit(3)
    : { data: [] };

  // Stats-Row
  const done = t.status === 'erledigt';
  const overdue = t.faelligkeit && !done && t.faelligkeit < todayISO;
  const daysUntilFael = t.faelligkeit
    ? Math.round((new Date(t.faelligkeit) - new Date(todayISO)) / 86400000)
    : null;

  const faelligLabel = (() => {
    if (!t.faelligkeit) return '<span class="erp-stat-muted">Keine Fälligkeit</span>';
    if (done)           return esc(formatDateDE(t.faelligkeit));
    if (daysUntilFael < 0)   return `<span style="color:var(--danger);font-weight:600">${esc(formatDateDE(t.faelligkeit))} · ${Math.abs(daysUntilFael)} Tag${Math.abs(daysUntilFael)===1?'':'e'} überfällig</span>`;
    if (daysUntilFael === 0) return `<span style="color:var(--warning);font-weight:600">${esc(formatDateDE(t.faelligkeit))} · heute</span>`;
    return `${esc(formatDateDE(t.faelligkeit))} <span style="color:var(--muted);font-size:11px">· in ${daysUntilFael} Tag${daysUntilFael===1?'':'en'}</span>`;
  })();

  const assigneeLabel = t.assigned
    ? esc(t.assigned.name || t.assigned.email || '?')
    : '<span class="erp-stat-muted">nicht zugewiesen</span>';
  const assignedToMe = t.assigned_to === currentProfile?.id;

  const statsHtml = `
    <div class="erp-stats">
      <div class="erp-stat-item">
        <div class="erp-stat-label">Status</div>
        <div><span class="badge" style="background:${aufgabeStatusBg(t.status)};color:${aufgabeStatusColor(t.status)}">${esc(aufgabeStatusLabel(t.status))}</span></div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Fälligkeit</div>
        <div class="erp-stat-value">${faelligLabel}</div>
      </div>
      <div class="erp-stat-item">
        <div class="erp-stat-label">Zuständig</div>
        <div class="erp-stat-value">${assigneeLabel}${assignedToMe ? ' <span style="color:var(--success);font-size:11px">(mir)</span>' : ''}</div>
      </div>
    </div>`;

  // Kontext-Block
  const firmaVal = t.company
    ? `<span class="cell-link" onclick="navigateTo('firma','${esc(t.company.id)}')">${esc(t.company.name)}</span>`
    : '<span class="erp-kv-muted">—</span>';
  const kontaktVal = t.contact
    ? `<span class="cell-link" onclick="navigateTo('kontakt','${esc(t.contact.id)}')">${esc([t.contact.vorname, t.contact.nachname].filter(Boolean).join(' '))}</span>`
    : '<span class="erp-kv-muted">—</span>';
  const projektVal = t.project
    ? `<span class="cell-link" onclick="navigateTo('projekt','${esc(t.project.id)}')">${esc(t.project.name)}</span> <span style="color:var(--muted);font-size:11px">· ${esc(t.project.status)}</span>`
    : '<span class="erp-kv-muted">—</span>';
  const beschreibungVal = t.beschreibung
    ? `<div style="white-space:pre-wrap;font-size:12px;color:var(--text);max-height:80px;overflow:auto">${esc(t.beschreibung)}</div>`
    : '<span class="erp-kv-muted">—</span>';
  const notizenVal = t.notizen
    ? `<div style="white-space:pre-wrap;font-size:12px;color:var(--muted);max-height:80px;overflow:auto">${esc(t.notizen)}</div>`
    : '<span class="erp-kv-muted">—</span>';

  const kontextHtml = `
    <div>
      <div class="erp-kv">
        <div class="erp-kv-label">Firma</div>         <div class="erp-kv-value">${firmaVal}</div>
        <div class="erp-kv-label">Kontakt</div>       <div class="erp-kv-value">${kontaktVal}</div>
        <div class="erp-kv-label">Projekt</div>       <div class="erp-kv-value">${projektVal}</div>
        <div class="erp-kv-label">Beschreibung</div>  <div class="erp-kv-value">${beschreibungVal}</div>
        <div class="erp-kv-label">Notizen</div>       <div class="erp-kv-value">${notizenVal}</div>
      </div>`;

  // Verwandte offene Aufgaben — vor dem Status-Label steht der Kunden-Kontext (Firma, sonst Kontakt).
  const relRows = (relResult.data || []);
  const relHtml = relRows.length > 0
    ? `<div class="erp-related">
         <div class="erp-section-title">Verwandte offene Aufgaben (Firma / Kontakt)</div>
         ${relRows.map(r => {
           const rOver = r.faelligkeit && r.faelligkeit < todayISO;
           // Kontakt hat Vorrang vor Firma (v1.33): wenn eine Aufgabe an einen Kontakt gekoppelt ist,
           // ist das die präzisere Zuordnung; Firma-Fallback nur wenn kein Kontakt gesetzt.
           const customerLabel = (r.contact ? [r.contact.vorname, r.contact.nachname].filter(Boolean).join(' ') : '')
             || r.company?.name
             || '';
           const statusText = rOver ? 'überfällig' : aufgabeStatusLabel(r.status);
           return `
             <div class="erp-related-row">
               <div class="erp-related-date">${r.faelligkeit ? esc(formatDateDE(r.faelligkeit)) : '<span style="color:var(--muted)">—</span>'}</div>
               <div class="erp-related-title" onclick="openTaskModal('edit','${esc(r.id)}')">${esc(r.titel || '—')}</div>
               <div class="erp-related-meta" ${rOver ? 'style="color:var(--danger);font-weight:600"' : ''}>${customerLabel ? esc(customerLabel) + ' · ' : ''}${esc(statusText)}</div>
             </div>`;
         }).join('')}
       </div>`
    : '';

  // Schnellaktionen
  const canReassignToMe = currentProfile?.id && !assignedToMe;
  const actionsHtml = `
    <div class="erp-actions">
      <div class="erp-section-title" style="margin-top:0">Schnellaktionen</div>
      ${done
        ? `<button class="erp-action-btn" onclick="quickTaskReopen('${esc(t.id)}')">
            <span class="erp-action-btn-icon">↺</span> Wieder öffnen
          </button>`
        : `<button class="erp-action-btn erp-action-primary" onclick="quickTaskComplete('${esc(t.id)}')">
            <span class="erp-action-btn-icon">✓</span> Als erledigt markieren
          </button>`
      }
      ${!done ? `<button class="erp-action-btn" onclick="quickTaskPostpone('${esc(t.id)}', 7)">
        <span class="erp-action-btn-icon">⏭</span> Fälligkeit +7 Tage
      </button>` : ''}
      ${canReassignToMe ? `<button class="erp-action-btn" onclick="quickTaskAssignToMe('${esc(t.id)}')">
        <span class="erp-action-btn-icon">→</span> Mir zuweisen
      </button>` : ''}
      <button class="erp-action-btn" onclick="quickTaskFollowup('${esc(t.id)}')">
        <span class="erp-action-btn-icon">+</span> Folge-Aufgabe anlegen
      </button>
      <button class="erp-action-btn" onclick="openTaskModal('edit','${esc(t.id)}')">
        <span class="erp-action-btn-icon">✎</span> Vollbearbeitung …
      </button>
    </div>`;

  return `
    ${statsHtml}
    <div class="erp-body">
      ${kontextHtml}${relHtml}</div>
      ${actionsHtml}
    </div>`;
}

/** Aufgabe erledigen — Status auf 'erledigt'. */
async function quickTaskComplete(taskId) {
  const { error } = await db.from('tasks')
    .update({ status: 'erledigt' }).eq('id', taskId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast('Aufgabe erledigt.');
  closeExpandedRow();
  await _refreshTaskContext();
  await updateTaskBadge();
}

/** Erledigte Aufgabe wieder öffnen — Status auf 'offen'. */
async function quickTaskReopen(taskId) {
  const { error } = await db.from('tasks')
    .update({ status: 'offen' }).eq('id', taskId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast('Aufgabe wieder geöffnet.');
  closeExpandedRow();
  await _refreshTaskContext();
  await updateTaskBadge();
}

/** Fälligkeit verschieben: +N Tage von aktuellem Fälligkeitsdatum (bzw. heute, wenn keins gesetzt). */
async function quickTaskPostpone(taskId, days) {
  const { data: t, error: selErr } = await db.from('tasks')
    .select('faelligkeit').eq('id', taskId).single();
  if (selErr || !t) { showToast('Aufgabe nicht gefunden.', true); return; }
  const base = t.faelligkeit ? new Date(t.faelligkeit) : new Date();
  base.setDate(base.getDate() + days);
  const newDate = toISODate(base);

  const { error } = await db.from('tasks')
    .update({ faelligkeit: newDate }).eq('id', taskId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast(`Fälligkeit verschoben auf ${formatDateDE(newDate)}.`);
  closeExpandedRow();
  await _refreshTaskContext();
  await updateTaskBadge();
}

/** Aufgabe dem eingeloggten User zuweisen. */
async function quickTaskAssignToMe(taskId) {
  if (!currentProfile?.id) { showToast('Kein Profil verfügbar.', true); return; }
  const { error } = await db.from('tasks')
    .update({ assigned_to: currentProfile.id }).eq('id', taskId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast('Aufgabe dir zugewiesen.');
  closeExpandedRow();
  await _refreshTaskContext();
  await updateTaskBadge();
}

/** Folge-Aufgabe mit gleichem Kontext (Firma/Kontakt/Projekt/Zuständiger). */
async function quickTaskFollowup(taskId) {
  const { data: t, error } = await db.from('tasks')
    .select('company_id, contact_id, project_id, titel').eq('id', taskId).single();
  if (error || !t) { showToast('Aufgabe nicht gefunden.', true); return; }

  closeExpandedRow();
  if (t.company_id) taskModalPrefillCompanyId = t.company_id;
  if (t.contact_id) taskModalPrefillContactId = t.contact_id;
  if (t.project_id) taskModalPrefillProjectId = t.project_id;
  await openTaskModal('new');
  const titleInput = document.getElementById('a-titel');
  if (titleInput && t.titel) titleInput.value = `Folge zu: ${t.titel}`;
}

// ═══════════════════════════════════════════════════════════
//  KALENDER-BAR (v1.32.0) — Mitarbeiter-Zeitstrahl am unteren Rand
// ═══════════════════════════════════════════════════════════
//
// Permanenter Footer mit Tages-Zeitstrahl des gewählten Mitarbeiters.
// Farbcode pro Tag: frei (weiß), Termin (gelb), Einsatz (grün),
// Feiertag (rot, Baden-Württemberg). Warn-Icon ⚠ bei Einsatz an
// Feiertag, damit versehentliche Fehlplanungen auffallen.
//
// Zuordnung:
//   - „Einsatz des Users" = User steht in `deployment_technicians`
//   - „Termin des Users"  = `appointments.erstellt_von = user_id`
//
// Desktop-Feature: auf Mobile (<900 px) via CSS ausgeblendet.

let _calendarState = {
  userId: null,
  year: null,
  month: null,    // 0–11 wie bei Date
  eventsByDay: new Map(),
  holidays: new Map()
};

/** Gauß-Osterformel — gibt das Datum des Ostersonntag eines Jahres zurück. */
function computeEasterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31);
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** Berechnet die gesetzlichen Feiertage für Baden-Württemberg eines Jahres.
 *  Gibt eine Map {ISO-Datum → Feiertagsname} zurück. */
function computeBwHolidays(year) {
  const holidays = new Map();
  const addFixed = (m, d, name) => {
    const iso = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    holidays.set(iso, name);
  };
  const easter = computeEasterSunday(year);
  const addFromEaster = (offsetDays, name) => {
    const dt = new Date(easter);
    dt.setDate(dt.getDate() + offsetDays);
    holidays.set(toISODate(dt), name);
  };
  addFixed(1, 1, 'Neujahr');
  addFixed(1, 6, 'Heilige Drei Könige');
  addFromEaster(-2, 'Karfreitag');
  addFromEaster(1, 'Ostermontag');
  addFixed(5, 1, 'Tag der Arbeit');
  addFromEaster(39, 'Christi Himmelfahrt');
  addFromEaster(50, 'Pfingstmontag');
  addFromEaster(60, 'Fronleichnam');
  addFixed(10, 3, 'Tag der Deutschen Einheit');
  addFixed(11, 1, 'Allerheiligen');
  addFixed(12, 25, '1. Weihnachtstag');
  addFixed(12, 26, '2. Weihnachtstag');
  return holidays;
}

/** Initialisiert die Kalender-Bar nach dem Login. */
async function initCalendarBar() {
  const bar = document.getElementById('calendar-bar');
  if (!bar) return;
  bar.style.display = '';

  await loadUserProfilesCache();
  const select = document.getElementById('calendar-user-select');
  select.innerHTML = userProfilesCache
    .map(u => `<option value="${esc(u.id)}">${esc(u.name || u.email || '?')}</option>`).join('');
  if (currentProfile?.id) select.value = currentProfile.id;

  if (!bar.dataset.wired) {
    document.getElementById('calendar-prev').onclick  = () => calendarShift(-1);
    document.getElementById('calendar-next').onclick  = () => calendarShift(1);
    document.getElementById('calendar-today').onclick = () => calendarGoToToday();
    select.onchange = () => {
      _calendarState.userId = select.value;
      renderCalendarBar();
    };
    // Klicks außerhalb des Popovers (und nicht auf einem Tag) schließen es
    document.addEventListener('click', (e) => {
      const popover = document.getElementById('calendar-popover');
      if (popover && popover.style.display !== 'none'
          && !popover.contains(e.target)
          && !e.target.closest('.calendar-day')) {
        popover.style.display = 'none';
      }
    });
    bar.dataset.wired = '1';
  }

  _calendarState.userId = currentProfile?.id || userProfilesCache[0]?.id || null;
  const now = new Date();
  _calendarState.year  = now.getFullYear();
  _calendarState.month = now.getMonth();
  await renderCalendarBar();
}

function hideCalendarBar() {
  const bar = document.getElementById('calendar-bar');
  if (bar) bar.style.display = 'none';
  const pop = document.getElementById('calendar-popover');
  if (pop) pop.style.display = 'none';
}

async function calendarShift(delta) {
  const d = new Date(_calendarState.year, _calendarState.month + delta, 1);
  _calendarState.year  = d.getFullYear();
  _calendarState.month = d.getMonth();
  await renderCalendarBar();
}

async function calendarGoToToday() {
  const now = new Date();
  _calendarState.year  = now.getFullYear();
  _calendarState.month = now.getMonth();
  await renderCalendarBar();
}

/** Haupt-Render: lädt Events des Users im Monat, baut die Tages-Boxen. */
async function renderCalendarBar() {
  const { userId, year, month } = _calendarState;
  if (!userId || year == null || month == null) return;

  const monthLabel = new Date(year, month, 1)
    .toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  document.getElementById('calendar-month-label').textContent = monthLabel;

  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month + 1, 0);
  const startISO = toISODate(monthStart);
  const endISO   = toISODate(monthEnd);

  _calendarState.holidays = computeBwHolidays(year);

  // Events parallel laden
  const [depRes, apptRes] = await Promise.all([
    // Einsätze: über deployment_technicians → deployments
    db.from('deployment_technicians')
      .select('deployment:deployments!inner(id, titel, datum_von, datum_bis, status, deleted_at, company:companies(name))')
      .eq('user_id', userId),
    // Termine: erstellt_von = user, im Monatsfenster
    db.from('appointments')
      .select('id, titel, datum, uhrzeit_von, status, company:companies(name), typ:lookup_values!appointments_typ_id_fkey(wert)').is('deleted_at', null)
      .eq('erstellt_von', userId)
      .gte('datum', startISO).lte('datum', endISO)
  ]);

  const deployments = (depRes.data || [])
    .map(r => r.deployment)
    .filter(d => d && !d.deleted_at && d.datum_von);
  const apptsInMonth = apptRes.data || [];

  // Event-Map pro Tag befüllen
  const eventsByDay = new Map();
  const getDay = (iso) => {
    if (!eventsByDay.has(iso)) eventsByDay.set(iso, { termine: [], einsatze: [] });
    return eventsByDay.get(iso);
  };

  for (const a of apptsInMonth) getDay(a.datum).termine.push(a);

  for (const d of deployments) {
    const from = new Date(d.datum_von);
    const to   = d.datum_bis ? new Date(d.datum_bis) : from;
    if (from > monthEnd || to < monthStart) continue;
    const iterStart = from < monthStart ? new Date(monthStart) : new Date(from);
    const iterEnd   = to > monthEnd ? new Date(monthEnd) : new Date(to);
    for (let x = new Date(iterStart); x <= iterEnd; x.setDate(x.getDate() + 1)) {
      getDay(toISODate(x)).einsatze.push(d);
    }
  }
  _calendarState.eventsByDay = eventsByDay;

  // Tages-Boxen rendern
  const container = document.getElementById('calendar-days');
  const todayISO = toISODate(new Date());
  const daysInMonth = monthEnd.getDate();
  const DOW = ['So','Mo','Di','Mi','Do','Fr','Sa'];
  const parts = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const dt = new Date(year, month, day);
    const iso = toISODate(dt);
    const dow = dt.getDay();
    const ev = eventsByDay.get(iso);
    const hasTermin  = !!ev?.termine?.length;
    const hasEinsatz = !!ev?.einsatze?.length;
    const isHoliday  = _calendarState.holidays.has(iso);
    const conflict   = isHoliday && hasEinsatz;

    const classes = ['calendar-day'];
    if (dow === 0 || dow === 6) classes.push('cal-day-weekend');
    if (iso === todayISO)       classes.push('cal-day-today');
    if (isHoliday)              classes.push('cal-day-feiertag');
    else if (hasEinsatz)        classes.push('cal-day-einsatz');
    else if (hasTermin)         classes.push('cal-day-termin');

    parts.push(`
      <div class="${classes.join(' ')}" data-day="${iso}" onclick="openCalendarDayPopover('${iso}', event)">
        ${conflict ? '<span class="calendar-day-warn" title="Einsatz an Feiertag">⚠</span>' : ''}
        <div class="calendar-day-num">${day}</div>
        <div class="calendar-day-dow">${DOW[dow]}</div>
      </div>`);
  }
  container.innerHTML = parts.join('');
}

/** Popover auf Tages-Klick — zeigt Feiertag, Einsätze, Termine + Kollisions-Warnung. */
function openCalendarDayPopover(iso, evt) {
  if (evt) evt.stopPropagation();
  const popover = document.getElementById('calendar-popover');
  if (!popover) return;
  const ev = _calendarState.eventsByDay.get(iso) || { termine: [], einsatze: [] };
  const holiday = _calendarState.holidays.get(iso);
  const dt = new Date(iso);
  const title = dt.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const parts = [];
  parts.push(`
    <div class="calendar-popover-title">
      <span>${esc(title)}</span>
      <span class="calendar-popover-title-actions">
        <button class="calendar-popover-plus" onclick="toggleCalendarQuickMenu('${esc(iso)}', event)" aria-label="Schnell anlegen" title="Schnell anlegen für diesen Tag">+</button>
        <button class="calendar-popover-close" onclick="closeCalendarDayPopover()" aria-label="Schließen">×</button>
      </span>
    </div>`);

  if (holiday) {
    parts.push(`<div class="calendar-popover-holiday">Feiertag: ${esc(holiday)}</div>`);
  }
  if (holiday && ev.einsatze.length > 0) {
    parts.push('<div class="calendar-popover-warn">⚠ An diesem Feiertag ist ein Einsatz eingeplant. Falls das nicht beabsichtigt ist, bitte umplanen.</div>');
  }

  if (ev.einsatze.length > 0) {
    parts.push(`
      <div class="calendar-popover-section">
        <div class="calendar-popover-section-title">Einsätze (${ev.einsatze.length})</div>
        ${ev.einsatze.map(d => `
          <div class="calendar-popover-item" onclick="openDeploymentModal('edit','${esc(d.id)}'); closeCalendarDayPopover()">
            ${esc(d.titel || '—')}
            <div class="calendar-popover-item-meta">${esc(d.company?.name || '—')} · ${esc(d.status)}</div>
          </div>`).join('')}
      </div>`);
  }

  if (ev.termine.length > 0) {
    parts.push(`
      <div class="calendar-popover-section">
        <div class="calendar-popover-section-title">Termine (${ev.termine.length})</div>
        ${ev.termine.map(a => `
          <div class="calendar-popover-item" onclick="openAppointmentModal('edit','${esc(a.id)}'); closeCalendarDayPopover()">
            <span class="termin-title-icon">${terminTypIcon(a.typ?.wert)}</span>${a.uhrzeit_von ? esc(formatTime(a.uhrzeit_von)) + ' · ' : ''}${esc(a.titel || '—')}
            <div class="calendar-popover-item-meta">${esc(a.company?.name || '—')} · ${esc(appointmentStatusLabel(a.status))}</div>
          </div>`).join('')}
      </div>`);
  }

  if (!holiday && ev.termine.length === 0 && ev.einsatze.length === 0) {
    parts.push('<div style="padding:8px 0;color:var(--muted);font-size:12px">Frei — nichts eingeplant.</div>');
  }

  popover.innerHTML = parts.join('');
  popover.style.display = '';

  // Positionieren — bevorzugt oberhalb des Tages, sonst darunter.
  const dayEl = document.querySelector(`.calendar-day[data-day="${iso}"]`);
  if (dayEl) {
    const rect = dayEl.getBoundingClientRect();
    const popW = popover.offsetWidth || 320;
    const popH = popover.offsetHeight || 200;
    let left = rect.left + rect.width / 2 - popW / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - popW - 10));
    const top = rect.top - popH - 8;
    popover.style.left = `${left}px`;
    popover.style.top  = `${top < 10 ? rect.bottom + 8 : top}px`;
  }
}

function closeCalendarDayPopover() {
  const pop = document.getElementById('calendar-popover');
  if (pop) pop.style.display = 'none';
  closeCalendarQuickMenu();
}

/** Mini-Schnellanlege-Menü (v1.33): zeigt + Termin / + Einsatz / + Aufgabe
 *  mit dem ISO-Datum der aktuell geklickten Kalender-Box als Prefill. */
function toggleCalendarQuickMenu(iso, evt) {
  if (evt) evt.stopPropagation();
  const existing = document.getElementById('calendar-quickmenu');
  if (existing) { existing.remove(); return; }

  const menu = document.createElement('div');
  menu.className = 'calendar-popover-quickmenu';
  menu.id = 'calendar-quickmenu';
  menu.innerHTML = `
    <button onclick="calendarQuickCreateAppointment('${esc(iso)}')">+ Termin</button>
    <button onclick="calendarQuickCreateDeployment('${esc(iso)}')">+ Einsatz</button>
    <button onclick="calendarQuickCreateTask('${esc(iso)}')">+ Aufgabe</button>
  `;
  // Relativ zum Plus-Button positionieren
  document.body.appendChild(menu);
  const plusBtn = evt?.currentTarget;
  if (plusBtn) {
    const rect = plusBtn.getBoundingClientRect();
    menu.style.top  = `${rect.bottom + 4}px`;
    menu.style.left = `${Math.max(10, rect.right - 180)}px`;
  }
}

function closeCalendarQuickMenu() {
  const m = document.getElementById('calendar-quickmenu');
  if (m) m.remove();
}

async function calendarQuickCreateAppointment(iso) {
  closeCalendarQuickMenu();
  closeCalendarDayPopover();
  await openAppointmentModal('new');
  const datum = document.getElementById('t-datum');
  if (datum) { datum.value = iso; datum.dispatchEvent(new Event('change', { bubbles: true })); }
}

async function calendarQuickCreateDeployment(iso) {
  closeCalendarQuickMenu();
  closeCalendarDayPopover();
  await openDeploymentModal('new');
  const von = document.getElementById('d-datum-von');
  const bis = document.getElementById('d-datum-bis');
  if (von) { von.value = iso; von.dispatchEvent(new Event('change', { bubbles: true })); }
  if (bis && !bis.value) bis.value = iso;
}

async function calendarQuickCreateTask(iso) {
  closeCalendarQuickMenu();
  closeCalendarDayPopover();
  await openTaskModal('new');
  const fael = document.getElementById('a-faelligkeit');
  if (fael) fael.value = iso;
}

/** Refresh-Hook — wird nach Termin-/Einsatz-Writes aufgerufen. Keine Queries wenn die Bar
 *  nicht initialisiert ist (noch kein Login oder User ist ausgeloggt). */
async function refreshCalendarBar() {
  if (!_calendarState.userId) return;
  const bar = document.getElementById('calendar-bar');
  if (!bar || bar.style.display === 'none') return;
  await renderCalendarBar();
}

// ═══════════════════════════════════════════════════════════
//  AUFGABEN (TASKS) — v1.22.0
// ═══════════════════════════════════════════════════════════
//
// Abgrenzung zu Termin/Einsatz:
//   Termin  = Meeting mit Kunden (nicht abrechenbar, Aufwand)
//   Einsatz = abrechenbare Leistung (Kundenumsatz)
//   Aufgabe = interne To-Dos, nicht kundenfakturierbar, nicht umsatzwirksam
//
// Aufgaben sind bewusst entkoppelt — kein Auto-Projektstatus-Trigger,
// keine Termin-/Einsatz-Kopplung. Das schützt die Domänen-Invarianten.

// Status-Badge-Helper (Lookup-Werte: offen / in_arbeit / erledigt)
function aufgabeStatusBg(s) {
  return { offen: '#f3f4f6', in_arbeit: '#fffbeb', erledigt: '#f0fdf4' }[s] || '#f3f4f6';
}
function aufgabeStatusColor(s) {
  return { offen: '#6b7280', in_arbeit: '#d97706', erledigt: '#16a34a' }[s] || '#6b7280';
}
function aufgabeStatusLabel(s) {
  return { offen: 'Offen', in_arbeit: 'In Arbeit', erledigt: 'Erledigt' }[s] || s;
}

async function loadAufgabeStatus() {
  if (aufgabeStatusCache.length > 0) return aufgabeStatusCache;
  const { data, error } = await db.from('lookup_values')
    .select('id, wert, farbe, reihenfolge').eq('kategorie', 'aufgabe_status').eq('ist_aktiv', true).order('reihenfolge');
  if (error) { showToast('Fehler beim Laden der Aufgaben-Status: ' + error.message, true); return []; }
  aufgabeStatusCache = data || [];
  return aufgabeStatusCache;
}

function isTaskOverdue(task, todayISO) {
  return task.status !== 'erledigt' && task.faelligkeit && task.faelligkeit < todayISO;
}

// ── LISTE ───────────────────────────────────────────────────────────────────

async function loadTasks() {
  const tbody = document.getElementById('tasks-table-body');
  tbody.innerHTML = '<tr><td colspan="7"><div class="empty">Lade Aufgaben ...</div></td></tr>';

  await Promise.all([
    loadAufgabeStatus(),
    loadUserProfilesCache(),
    (async () => {
      if (companiesCache.length === 0) {
        const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
        companiesCache = cs || [];
      }
    })()
  ]);

  // Filter-Dropdowns befüllen
  const companyFilter = document.getElementById('tasks-company-filter');
  const existingCompany = companyFilter.value;
  companyFilter.innerHTML = '<option value="">Alle Firmen</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
  if (existingCompany) companyFilter.value = existingCompany;

  const assigneeFilter = document.getElementById('tasks-assignee-filter');
  const existingAssignee = assigneeFilter.value;
  assigneeFilter.innerHTML = '<option value="">Alle Zuweisungen</option>'
    + userProfilesCache.map(u => `<option value="${esc(u.id)}">${esc(u.name || u.email || '?')}</option>`).join('');
  if (existingAssignee) assigneeFilter.value = existingAssignee;

  const statusFilter = document.getElementById('tasks-status-filter');
  if (statusFilter.options.length <= 1) {
    statusFilter.innerHTML = '<option value="">Alle Status</option>'
      + aufgabeStatusCache.map(s => `<option value="${esc(s.wert)}">${esc(aufgabeStatusLabel(s.wert))}</option>`).join('');
  }

  // Pending filter aus URL
  if (pendingTasksFilter?.scope)    document.getElementById('tasks-scope-filter').value = pendingTasksFilter.scope;
  if (pendingTasksFilter?.firma)    { companyFilter.value = pendingTasksFilter.firma; document.getElementById('tasks-scope-filter').value = 'all'; }
  if (pendingTasksFilter?.projekt)  document.getElementById('tasks-scope-filter').value = 'all';
  if (pendingTasksFilter?.assignee) assigneeFilter.value = pendingTasksFilter.assignee;
  tasksProjectFilterActive = pendingTasksFilter?.projekt || null;
  pendingTasksFilter = null;

  const { data, error } = await db.from('tasks')
    .select('*, company:companies(id, name), project:projects(id, name), contact:contacts(id, vorname, nachname), assigned:user_profiles!tasks_assigned_to_fkey(id, name, email)')
    .is('deleted_at', null).order('faelligkeit', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    return;
  }

  tasksCache = data || [];
  filterTasks();
}

function filterTasks() {
  const searchTerm   = document.getElementById('tasks-search').value.trim().toLowerCase();
  const scopeFilter  = document.getElementById('tasks-scope-filter').value;
  const assigneeFilterVal = document.getElementById('tasks-assignee-filter').value;
  const companyFilterVal  = document.getElementById('tasks-company-filter').value;
  const statusFilter = document.getElementById('tasks-status-filter').value;
  const projektFilter = tasksProjectFilterActive;

  const meId = currentProfile?.id;
  let filtered = tasksCache;

  // Scope
  if (scopeFilter === 'mine_open') {
    filtered = filtered.filter(t => t.assigned_to === meId && t.status !== 'erledigt');
  } else if (scopeFilter === 'assigned_to_me') {
    filtered = filtered.filter(t => t.assigned_to === meId);
  } else if (scopeFilter === 'created_by_me') {
    filtered = filtered.filter(t => t.erstellt_von === meId);
  } else if (scopeFilter === 'all_open') {
    filtered = filtered.filter(t => t.status !== 'erledigt');
  } else if (scopeFilter === 'done') {
    filtered = filtered.filter(t => t.status === 'erledigt');
  }
  // 'all' = kein Scope-Filter

  if (assigneeFilterVal) filtered = filtered.filter(t => t.assigned_to === assigneeFilterVal);
  if (companyFilterVal)  filtered = filtered.filter(t => t.company_id === companyFilterVal);
  if (projektFilter)     filtered = filtered.filter(t => t.project_id === projektFilter);
  if (statusFilter)      filtered = filtered.filter(t => t.status === statusFilter);

  if (searchTerm) {
    filtered = filtered.filter(t => {
      const haystack = [
        t.titel, t.beschreibung, t.notizen,
        t.company?.name, t.project?.name,
        t.assigned ? (t.assigned.name || t.assigned.email) : '',
        t.contact ? [t.contact.vorname, t.contact.nachname].filter(Boolean).join(' ') : ''
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(searchTerm);
    });
  }

  // Sortierung: offene zuerst (nach Fälligkeit asc, überfällig oben), erledigte unten
  filtered.sort((a, b) => {
    const aDone = a.status === 'erledigt';
    const bDone = b.status === 'erledigt';
    if (aDone !== bDone) return aDone ? 1 : -1;
    const aF = a.faelligkeit || '9999-12-31';
    const bF = b.faelligkeit || '9999-12-31';
    if (aF !== bF) return aF.localeCompare(bF);
    return (b.created_at || '').localeCompare(a.created_at || '');
  });

  renderTasksTable(filtered);
}

function renderTasksTable(tasks) {
  closeExpandedRow();
  const tbody = document.getElementById('tasks-table-body');
  const countEl = document.getElementById('tasks-count');

  const total = tasksCache.length;
  const shown = tasks.length;
  countEl.textContent = (shown === total)
    ? `${total} Aufgabe${total === 1 ? '' : 'n'}`
    : `${shown} von ${total} Aufgaben`;

  if (shown === 0) {
    const msg = total === 0
      ? 'Noch keine Aufgaben angelegt. Klicke oben auf „+ Neue Aufgabe".'
      : 'Keine Aufgaben entsprechen den Filterkriterien.';
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty">${msg}</div></td></tr>`;
    return;
  }

  const todayISO = toISODate(new Date());

  tbody.innerHTML = tasks.map(t => {
    const done = t.status === 'erledigt';
    const overdue = isTaskOverdue(t, todayISO);
    const assigneeName = t.assigned ? (t.assigned.name || t.assigned.email || '?') : '<span style="color:var(--muted);font-style:italic">—</span>';

    const kontextParts = [];
    if (t.company) kontextParts.push(`<span class="cell-link" onclick="event.stopPropagation();navigateTo('firma','${esc(t.company.id)}')">${esc(t.company.name)}</span>`);
    if (t.project) kontextParts.push(`<span class="cell-link" onclick="event.stopPropagation();navigateTo('projekt','${esc(t.project.id)}')">${esc(t.project.name)}</span>`);
    const kontextHtml = kontextParts.length ? kontextParts.join(' · ') : '<span style="color:var(--muted);font-style:italic">—</span>';

    const fael = t.faelligkeit
      ? `<span class="${overdue ? 'date-cell past' : 'date-cell'}" ${overdue ? 'style="color:#dc2626;font-weight:600"' : ''}>${esc(formatDateDE(t.faelligkeit))}</span>`
      : '<span style="color:var(--muted)">—</span>';

    const titelStyle = done ? 'text-decoration:line-through;color:var(--muted)' : '';

    return `
      <tr>
        <td><input type="checkbox" ${done ? 'checked' : ''} onclick="event.stopPropagation();toggleTaskDone('${esc(t.id)}', this.checked)" aria-label="Als erledigt markieren"></td>
        <td><div class="cell-link" style="${titelStyle}" onclick="toggleRowExpand('task','${esc(t.id)}',this.closest('tr'))">${esc(t.titel || '—')}</div></td>
        <td>${fael}</td>
        <td class="col-tablet" style="color:var(--muted)">${assigneeName}</td>
        <td class="col-desktop">${kontextHtml}</td>
        <td><span class="badge" style="background:${aufgabeStatusBg(t.status)};color:${aufgabeStatusColor(t.status)}">${esc(aufgabeStatusLabel(t.status))}</span></td>
        <td class="col-action" style="text-align:right">${renderActionIcons('task', t.id)}</td>
      </tr>`;
  }).join('');
}

// ── MODAL ───────────────────────────────────────────────────────────────────

async function openTaskModal(mode, taskId = null) {
  editingTaskId = taskId;
  renderDateShortcuts();  // v1.33: aktuelle Monats-Buttons

  await Promise.all([
    loadAufgabeStatus(),
    loadUserProfilesCache(),
    (async () => {
      if (companiesCache.length === 0) {
        const { data: cs } = await db.from('companies').select('id, name').is('deleted_at', null).order('name');
        companiesCache = cs || [];
      }
    })()
  ]);

  // Dropdowns befüllen
  const statusSelect = document.getElementById('a-status');
  statusSelect.innerHTML = aufgabeStatusCache
    .map(s => `<option value="${esc(s.wert)}">${esc(aufgabeStatusLabel(s.wert))}</option>`).join('');

  const assigneeSelect = document.getElementById('a-assigned-to');
  assigneeSelect.innerHTML = userProfilesCache
    .map(u => `<option value="${esc(u.id)}">${esc(u.name || u.email || '?')}</option>`).join('');

  const companySelect = document.getElementById('a-company');
  companySelect.innerHTML = '<option value="">— Keine Firma —</option>'
    + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');

  // Defaults
  document.getElementById('a-titel').value = '';
  document.getElementById('a-faelligkeit').value = '';
  document.getElementById('a-beschreibung').value = '';
  document.getElementById('a-notizen').value = '';
  statusSelect.value = 'offen';
  if (currentProfile?.id) assigneeSelect.value = currentProfile.id;
  companySelect.value = '';

  await rebuildContactDropdownForTask('');
  await rebuildProjectDropdownForTask('');

  if (mode === 'new') {
    document.getElementById('modal-aufgabe-title').textContent = 'Neue Aufgabe';
    document.getElementById('a-save-btn').textContent = 'Anlegen';
    document.getElementById('a-delete-btn').style.display = 'none';

    // Prefill aus Firmen-Detailseite
    if (taskModalPrefillCompanyId) {
      companySelect.value = taskModalPrefillCompanyId;
      await rebuildContactDropdownForTask(taskModalPrefillCompanyId);
      await rebuildProjectDropdownForTask(taskModalPrefillCompanyId);
      taskModalPrefillCompanyId = null;
    }

    // Prefill aus Projekt-Detailseite
    if (taskModalPrefillProjectId) {
      const { data: proj } = await db.from('projects')
        .select('id, name, company_id').is('deleted_at', null).eq('id', taskModalPrefillProjectId).single();
      if (proj) {
        if (proj.company_id) {
          companySelect.value = proj.company_id;
          await rebuildContactDropdownForTask(proj.company_id);
        }
        await rebuildProjectDropdownForTask(proj.company_id || '');
        const projSel = document.getElementById('a-project');
        if (projSel) projSel.value = proj.id;
      }
      taskModalPrefillProjectId = null;
    }

    // Prefill aus Kontakt-Detailseite
    if (taskModalPrefillContactId) {
      const { data: k } = await db.from('contacts')
        .select('id, vorname, nachname, company_id').is('deleted_at', null).eq('id', taskModalPrefillContactId).single();
      if (k) {
        if (k.company_id) {
          companySelect.value = k.company_id;
          await rebuildContactDropdownForTask(k.company_id);
          await rebuildProjectDropdownForTask(k.company_id);
        }
        document.getElementById('a-contact').value = k.id;
      }
      taskModalPrefillContactId = null;
    }
  } else {
    document.getElementById('modal-aufgabe-title').textContent = 'Aufgabe bearbeiten';
    document.getElementById('a-save-btn').textContent = 'Speichern';
    document.getElementById('a-delete-btn').style.display = 'block';

    const { data, error } = await db.from('tasks').select('*').is('deleted_at', null).eq('id', taskId).single();
    if (error || !data) {
      showToast('Aufgabe konnte nicht geladen werden: ' + (error?.message || 'Unbekannter Fehler'), true);
      editingTaskId = null;
      return;
    }

    document.getElementById('a-titel').value        = data.titel || '';
    document.getElementById('a-faelligkeit').value  = data.faelligkeit || '';
    document.getElementById('a-beschreibung').value = data.beschreibung || '';
    document.getElementById('a-notizen').value      = data.notizen || '';
    statusSelect.value   = data.status || 'offen';
    if (data.assigned_to) assigneeSelect.value = data.assigned_to;
    if (data.company_id) {
      companySelect.value = data.company_id;
      await rebuildContactDropdownForTask(data.company_id);
      await rebuildProjectDropdownForTask(data.company_id);
      if (data.contact_id) document.getElementById('a-contact').value = data.contact_id;
    } else {
      await rebuildProjectDropdownForTask('');
    }
    if (data.project_id) {
      const projSel = document.getElementById('a-project');
      if (projSel) projSel.value = data.project_id;
    }
  }

  // Firma-Change-Handler für Kontakt/Projekt-Nachladen
  companySelect.onchange = async () => {
    await rebuildContactDropdownForTask(companySelect.value);
    await rebuildProjectDropdownForTask(companySelect.value);
  };

  document.getElementById('modal-aufgabe').classList.add('open');
  setTimeout(() => document.getElementById('a-titel').focus(), 100);
}

function closeTaskModal() {
  document.getElementById('modal-aufgabe').classList.remove('open');
  editingTaskId = null;
  taskModalPrefillCompanyId = null;
  taskModalPrefillProjectId = null;
  taskModalPrefillContactId = null;
}

async function rebuildContactDropdownForTask(companyId) {
  const contactSelect = document.getElementById('a-contact');
  if (!companyId) {
    contactSelect.innerHTML = '<option value="">— Kein Kontakt —</option>';
    return;
  }
  const { data, error } = await db.from('contacts')
    .select('id, vorname, nachname').is('deleted_at', null).eq('company_id', companyId).order('nachname').order('vorname');
  if (error) { contactSelect.innerHTML = '<option value="">Fehler beim Laden</option>'; return; }
  const contacts = data || [];
  contactSelect.innerHTML = '<option value="">— Kein Kontakt —</option>'
    + contacts.map(k => `<option value="${esc(k.id)}">${esc([k.vorname, k.nachname].filter(Boolean).join(' '))}</option>`).join('');
}

async function rebuildProjectDropdownForTask(companyId) {
  const projSel = document.getElementById('a-project');
  if (!projSel) return;
  let query = db.from('projects').select('id, name, company_id').is('deleted_at', null).order('name');
  if (companyId) query = query.eq('company_id', companyId);
  const { data, error } = await query;
  if (error) { projSel.innerHTML = '<option value="">Fehler beim Laden</option>'; return; }
  const projects = data || [];
  projSel.innerHTML = '<option value="">— Kein Projekt —</option>'
    + projects.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
}

async function saveTask() {
  const titel        = document.getElementById('a-titel').value.trim();
  const faelligkeit  = document.getElementById('a-faelligkeit').value || null;
  const beschreibung = document.getElementById('a-beschreibung').value.trim();
  const status       = document.getElementById('a-status').value;
  const assigned_to  = document.getElementById('a-assigned-to').value || null;
  const company_id   = document.getElementById('a-company').value || null;
  const contact_id   = document.getElementById('a-contact').value || null;
  const project_id   = document.getElementById('a-project')?.value || null;
  const notizen      = document.getElementById('a-notizen').value.trim();
  const btn          = document.getElementById('a-save-btn');

  if (!titel) { showToast('Bitte Titel eingeben.', true); return; }
  if (!assigned_to) { showToast('Bitte eine Person zuweisen.', true); return; }
  const gueltigeStatus = aufgabeStatusCache.map(s => s.wert);
  if (gueltigeStatus.length && !gueltigeStatus.includes(status)) { showToast('Status ungültig.', true); return; }

  btn.disabled = true;
  btn.textContent = editingTaskId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    // erledigt_am mitschreiben/zurücknehmen abhängig vom Status
    let erledigt_am = null;
    if (status === 'erledigt') {
      // Behalte vorhandenes Datum, falls Aufgabe bereits erledigt war
      if (editingTaskId) {
        const { data: cur } = await db.from('tasks').select('status, erledigt_am').is('deleted_at', null).eq('id', editingTaskId).single();
        erledigt_am = (cur?.status === 'erledigt' && cur.erledigt_am) ? cur.erledigt_am : new Date().toISOString();
      } else {
        erledigt_am = new Date().toISOString();
      }
    }

    const payload = {
      titel, faelligkeit,
      beschreibung: beschreibung || null,
      status, erledigt_am,
      assigned_to,
      company_id, contact_id, project_id,
      notizen: notizen || null
    };
    if (!editingTaskId) payload.erstellt_von = currentProfile?.id || null;

    let error;
    if (editingTaskId) { ({ error } = await db.from('tasks').update(payload).eq('id', editingTaskId)); }
    else { ({ error } = await db.from('tasks').insert(payload)); }
    if (error) throw new Error(error.message);

    closeTaskModal();
    showToast(editingTaskId ? 'Aufgabe aktualisiert.' : 'Aufgabe angelegt.');
    await _refreshTaskContext();
    updateTaskBadge();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingTaskId ? 'Speichern' : 'Anlegen';
  }
}

async function deleteTask() {
  if (!editingTaskId) return;
  const id = editingTaskId;
  const ok = await confirmDialog({
    title: 'Aufgabe löschen?',
    message: 'Die Aufgabe wird ausgeblendet. Rückgängig-Link erscheint 5 Sekunden lang.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;

  try {
    const deletedAt = new Date().toISOString();
    const { error } = await db.from('tasks').update({ deleted_at: deletedAt }).eq('id', id);
    if (error) throw new Error(error.message);

    closeTaskModal();
    await _refreshTaskContext();
    updateTaskBadge();

    showToast('Aufgabe gelöscht.', false, {
      actionLabel: 'Rückgängig',
      durationMs: 5000,
      onAction: async () => {
        try {
          await db.from('tasks').update({ deleted_at: null }).eq('id', id);
          await _refreshTaskContext();
          updateTaskBadge();
          showToast('Aufgabe wiederhergestellt.');
        } catch (err) {
          showToast('Wiederherstellen fehlgeschlagen: ' + err.message, true);
        }
      }
    });
  } catch (e) {
    showToast(e.message, true);
  }
}

async function toggleTaskDone(taskId, isDone) {
  const update = isDone
    ? { status: 'erledigt', erledigt_am: new Date().toISOString() }
    : { status: 'offen',    erledigt_am: null };
  const { error } = await db.from('tasks').update(update).eq('id', taskId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast(isDone ? 'Aufgabe erledigt.' : 'Aufgabe reaktiviert.');
  await _refreshTaskContext();
  updateTaskBadge();
}

async function duplicateTask(sourceId) {
  const { data: src, error } = await db.from('tasks').select('*').is('deleted_at', null).eq('id', sourceId).single();
  if (error || !src) throw new Error(error?.message || 'Aufgabe nicht gefunden');

  const payload = {
    titel: (src.titel || 'Aufgabe') + ' (Kopie)',
    beschreibung: src.beschreibung,
    status: 'offen',
    erledigt_am: null,
    faelligkeit: src.faelligkeit,
    assigned_to: src.assigned_to,
    company_id: src.company_id,
    contact_id: src.contact_id,
    project_id: src.project_id,
    notizen: src.notizen,
    erstellt_von: currentProfile?.id || null
  };
  const { error: insErr } = await db.from('tasks').insert(payload);
  if (insErr) throw new Error(insErr.message);

  showToast('Aufgabe dupliziert.');
  await refreshAfterEntityChange('task');
}

async function copyTaskById(id, ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  try {
    const { data: t, error } = await db.from('tasks')
      .select('*, companies(name), projects(name), assigned:user_profiles!tasks_assigned_to_fkey(name, email)').is('deleted_at', null)
      .eq('id', id).single();
    if (error || !t) throw new Error(error?.message || 'Aufgabe nicht gefunden');

    const lines = [];
    lines.push(t.titel || '(ohne Titel)');
    if (t.faelligkeit) lines.push('Fällig: ' + formatDateDE(t.faelligkeit));
    if (t.assigned) lines.push('Zugewiesen: ' + (t.assigned.name || t.assigned.email));
    if (t.companies?.name) lines.push('Firma: ' + t.companies.name);
    if (t.projects?.name)  lines.push('Projekt: ' + t.projects.name);
    lines.push('Status: ' + aufgabeStatusLabel(t.status));
    if (t.beschreibung) lines.push('', t.beschreibung);

    await navigator.clipboard.writeText(lines.join('\n'));
    showToast('Aufgabe in Zwischenablage kopiert.');
  } catch (e) {
    showToast('Kopieren fehlgeschlagen: ' + e.message, true);
  }
}

// ── SUB-SEKTIONEN AUF DETAIL-SEITEN ─────────────────────────────────────────

async function loadCompanyTasks(companyId) {
  const tbody = document.getElementById('company-tasks-body');
  const countEl = document.getElementById('company-tasks-count');
  await loadAufgabeStatus();

  const { data, error } = await db.from('tasks')
    .select('*, assigned:user_profiles!tasks_assigned_to_fkey(id, name, email)').is('deleted_at', null)
    .eq('company_id', companyId);
  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Aufgaben';
    return;
  }
  renderDetailTaskRows(tbody, countEl, data || [], 'company');
}

async function loadContactTasks(contactId) {
  const tbody = document.getElementById('contact-tasks-body');
  const countEl = document.getElementById('contact-tasks-count');
  await loadAufgabeStatus();

  const { data, error } = await db.from('tasks')
    .select('*, assigned:user_profiles!tasks_assigned_to_fkey(id, name, email)').is('deleted_at', null)
    .eq('contact_id', contactId);
  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Aufgaben';
    return;
  }
  renderDetailTaskRows(tbody, countEl, data || [], 'contact');
}

async function loadProjectTasks(projectId) {
  const tbody = document.getElementById('project-tasks-body');
  const countEl = document.getElementById('project-tasks-count');
  await loadAufgabeStatus();

  const { data, error } = await db.from('tasks')
    .select('*, assigned:user_profiles!tasks_assigned_to_fkey(id, name, email)').is('deleted_at', null)
    .eq('project_id', projectId);
  if (error) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    countEl.textContent = 'Aufgaben';
    return;
  }
  renderDetailTaskRows(tbody, countEl, data || [], 'project');
}

function renderDetailTaskRows(tbody, countEl, tasks, entityType) {
  closeExpandedRow();
  const total = tasks.length;
  const offen = tasks.filter(t => t.status !== 'erledigt').length;
  const erledigt = tasks.filter(t => t.status === 'erledigt').length;
  if (entityType) setTabCount(entityType, 'aufgaben', total);

  if (total === 0) {
    countEl.textContent = 'Keine Aufgaben';
    tbody.innerHTML = '<tr><td colspan="6"><div class="empty">Noch keine Aufgaben. Klicke oben auf „+ Aufgabe hinzufügen".</div></td></tr>';
    return;
  }
  countEl.textContent = `${total} Aufgabe${total === 1 ? '' : 'n'} · ${offen} offen · ${erledigt} erledigt`;

  const todayISO = toISODate(new Date());

  // Sortierung: offene zuerst nach Fälligkeit, erledigte ans Ende
  tasks.sort((a, b) => {
    const aDone = a.status === 'erledigt';
    const bDone = b.status === 'erledigt';
    if (aDone !== bDone) return aDone ? 1 : -1;
    const aF = a.faelligkeit || '9999-12-31';
    const bF = b.faelligkeit || '9999-12-31';
    if (aF !== bF) return aF.localeCompare(bF);
    return (b.created_at || '').localeCompare(a.created_at || '');
  });

  tbody.innerHTML = tasks.slice(0, 10).map(t => {
    const done = t.status === 'erledigt';
    const overdue = isTaskOverdue(t, todayISO);
    const assigneeName = t.assigned ? (t.assigned.name || t.assigned.email || '?') : '—';
    const fael = t.faelligkeit
      ? `<span ${overdue ? 'style="color:#dc2626;font-weight:600"' : ''}>${esc(formatDateDE(t.faelligkeit))}</span>`
      : '<span style="color:var(--muted)">—</span>';
    const titelStyle = done ? 'text-decoration:line-through;color:var(--muted)' : '';

    return `
      <tr>
        <td><input type="checkbox" ${done ? 'checked' : ''} onclick="event.stopPropagation();toggleTaskDone('${esc(t.id)}', this.checked)" aria-label="Als erledigt markieren"></td>
        <td><div class="cell-link" style="${titelStyle}" onclick="toggleRowExpand('task','${esc(t.id)}',this.closest('tr'))">${esc(t.titel || '—')}</div></td>
        <td>${fael}</td>
        <td class="col-tablet" style="color:var(--muted)">${esc(assigneeName)}</td>
        <td><span class="badge" style="background:${aufgabeStatusBg(t.status)};color:${aufgabeStatusColor(t.status)}">${esc(aufgabeStatusLabel(t.status))}</span></td>
        <td class="col-action" style="text-align:right">${renderActionIcons('task', t.id)}</td>
      </tr>`;
  }).join('');

  // Auto-Expand wenn genau eine Aufgabe (v1.29)
  autoExpandSingleRow(tbody, 'task', tasks.slice(0, 10));
}

async function _refreshTaskContext() {
  const hash = location.hash || '';
  if (hash.startsWith('#/aufgaben')) {
    await loadTasks();
  } else if (hash.startsWith('#/firma/') && currentCompanyDetailId) {
    await loadCompanyTasks(currentCompanyDetailId);
  } else if (hash.startsWith('#/projekt/') && currentProjectDetailId) {
    await loadProjectTasks(currentProjectDetailId);
  } else if (hash.startsWith('#/kontakt/') && currentContactDetailId) {
    await loadContactTasks(currentContactDetailId);
  }
}

// ── SIDEBAR-BADGE ───────────────────────────────────────────────────────────

async function updateTaskBadge() {
  const badges = [
    document.getElementById('nav-tasks-badge'),       // Desktop: auf Aktivität-Gruppe
    document.getElementById('m-nav-tasks-badge')      // Mobile: auf Aktivität-Tab
  ].filter(Boolean);
  if (badges.length === 0 || !currentProfile?.id) return;

  const { data, error } = await db.from('tasks')
    .select('id, faelligkeit, status').is('deleted_at', null)
    .eq('assigned_to', currentProfile.id).neq('status', 'erledigt');
  if (error) { badges.forEach(b => b.style.display = 'none'); return; }

  const todayISO = toISODate(new Date());
  const offen = (data || []).length;
  const ueberfaellig = (data || []).filter(t => t.faelligkeit && t.faelligkeit < todayISO).length;

  if (offen === 0) { badges.forEach(b => b.style.display = 'none'); return; }
  const title = ueberfaellig > 0 ? `${offen} offen · ${ueberfaellig} überfällig` : `${offen} offen`;
  badges.forEach(badge => {
    badge.textContent = String(offen);
    badge.style.display = '';
    badge.classList.toggle('nav-badge-overdue', ueberfaellig > 0);
    badge.title = title;
  });
}

// ═══════════════════════════════════════════════════════════
//  FAB — Quick-Add Floating Action Button (v1.21.0)
// ═══════════════════════════════════════════════════════════

let _fabOpen = false;

function showFab() {
  document.getElementById('fab')?.classList.add('visible');
}

function hideFab() {
  document.getElementById('fab')?.classList.remove('visible');
  closeFabMenu();
}

function toggleFabMenu(ev) {
  if (ev) { ev.preventDefault(); ev.stopPropagation(); }
  if (_fabOpen) closeFabMenu(); else openFabMenu();
}

function openFabMenu() {
  const menu = document.getElementById('fab-menu');
  if (!menu) return;
  // Titel an aktuellen Kontext anpassen
  const ctx = _getFabContext();
  const title = document.getElementById('fab-menu-title');
  if (title) title.textContent = ctx.label ? `Schnell anlegen · ${ctx.label}` : 'Schnell anlegen';
  menu.classList.add('open');
  _fabOpen = true;
}

function closeFabMenu() {
  document.getElementById('fab-menu')?.classList.remove('open');
  _fabOpen = false;
}

/** Ermittelt aktuellen Seiten-Kontext für Kontext-aware Prefill. */
function _getFabContext() {
  // Firmen-Detail aktiv?
  if (document.getElementById('page-company-detail')?.classList.contains('active') && currentCompanyDetailId) {
    return { type: 'company', id: currentCompanyDetailId, label: 'für diese Firma' };
  }
  if (document.getElementById('page-project-detail')?.classList.contains('active') && currentProjectDetailId) {
    return { type: 'project', id: currentProjectDetailId, label: 'für dieses Projekt' };
  }
  if (document.getElementById('page-contact-detail')?.classList.contains('active') && currentContactDetailId) {
    return { type: 'contact', id: currentContactDetailId, label: 'für diesen Kontakt' };
  }
  return { type: null, id: null, label: '' };
}

async function fabAction(target) {
  closeFabMenu();
  const ctx = _getFabContext();

  // Kontext-abhängige Prefill-Variablen setzen und dann das jeweilige
  // Modal öffnen.
  if (target === 'company') {
    openCompanyModal('new');
    return;
  }

  if (target === 'contact') {
    if (ctx.type === 'company') contactModalPrefillCompanyId = ctx.id;
    openContactModal('new');
    return;
  }

  if (target === 'appointment') {
    if (ctx.type === 'company') {
      appointmentModalPrefillCompanyId = ctx.id;
    } else if (ctx.type === 'project') {
      appointmentModalPrefillProjectId = ctx.id;
    } else if (ctx.type === 'contact') {
      appointmentModalPrefillContactId = ctx.id;
    }
    openAppointmentModal('new');
    return;
  }

  if (target === 'task') {
    if (ctx.type === 'company') {
      taskModalPrefillCompanyId = ctx.id;
    } else if (ctx.type === 'project') {
      taskModalPrefillProjectId = ctx.id;
    } else if (ctx.type === 'contact') {
      taskModalPrefillContactId = ctx.id;
    }
    openTaskModal('new');
    return;
  }

  if (target === 'project') {
    if (ctx.type === 'company') {
      projectModalPrefillCompanyId = ctx.id;
    } else if (ctx.type === 'contact') {
      // Hauptkontakt vorselektieren — das Modal zieht die Firma
      // automatisch aus contact.company_id nach.
      projectModalPrefillHauptkontaktId = ctx.id;
    }
    openProjectModal('new');
    return;
  }

  if (target === 'deployment') {
    if (ctx.type === 'company') deploymentModalPrefillCompanyId = ctx.id;
    else if (ctx.type === 'project') deploymentModalPrefillProjectId = ctx.id;
    openDeploymentModal('new');
    return;
  }
}

// Click-outside schließt FAB-Menu
document.addEventListener('click', (ev) => {
  if (!_fabOpen) return;
  if (ev.target.closest('#fab-menu') || ev.target.closest('#fab')) return;
  closeFabMenu();
});

// Tastenkürzel „n" (nur wenn kein Eingabefeld fokussiert und kein Modal offen)
document.addEventListener('keydown', (ev) => {
  if (ev.key !== 'n' && ev.key !== 'N') return;
  if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
  if (isInputFocused()) return;
  // Kein anderes Overlay/Menü offen
  if (document.getElementById('search-overlay')?.classList.contains('open')) return;
  if (document.getElementById('modal-confirm')?.classList.contains('open')) return;
  if (document.querySelector('.modal-overlay.open:not(#modal-confirm)')) return;
  if (!document.getElementById('fab')?.classList.contains('visible')) return;
  ev.preventDefault();
  toggleFabMenu();
});

// ═══════════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════════

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}
