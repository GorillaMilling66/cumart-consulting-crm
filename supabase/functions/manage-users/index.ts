import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── HILFSFUNKTIONEN ─────────────────────────────────────────
function jsonResponse(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Erzeugt ein sicheres Zufallspasswort (12 Zeichen, gemischt).
// Nutzt crypto.getRandomValues statt Math.random.
function generatePassword(length = 12): string {
  // Ohne mehrdeutige Zeichen (0/O, 1/l/I) für bessere Lesbarkeit
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  const all = lower + upper + digits + symbols

  // Garantieren, dass jede Zeichenklasse mindestens einmal vorkommt
  const required = [
    lower[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 2**32 * lower.length)],
    upper[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 2**32 * upper.length)],
    digits[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 2**32 * digits.length)],
    symbols[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 2**32 * symbols.length)],
  ]

  const remaining: string[] = []
  const buf = new Uint32Array(length - required.length)
  crypto.getRandomValues(buf)
  for (let i = 0; i < buf.length; i++) {
    remaining.push(all[Math.floor(buf[i] / 2**32 * all.length)])
  }

  // Mischen (Fisher-Yates)
  const chars = [...required, ...remaining]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 2**32 * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

// Zählt, wie viele AKTIVE Admins es aktuell gibt
async function countActiveAdmins(supabaseAdmin: any): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, roles!inner(name)')
    .eq('roles.name', 'Admin')
    .eq('status', 'aktiv')

  if (error) throw new Error('Admin-Zählung fehlgeschlagen: ' + error.message)
  return data?.length ?? 0
}

// Prüft, ob ein bestimmter User AKTIVER Admin ist.
// v2.33.12 (QA-Sweep Phase A.2 #8): inaktive Admin-Rollen wurden vorher als
// "letzter Admin" gewertet und blockierten legitime Aktionen gegen sie.
// `countActiveAdmins` filtert bereits auf status='aktiv'; hier nachziehen,
// damit die Schutzlogik konsistent über aktive Admins urteilt.
async function isUserAdmin(supabaseAdmin: any, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('user_profiles')
    .select('status, roles(name)')
    .eq('id', userId)
    .single()
  if (data?.status !== 'aktiv') return false
  return (data?.roles as any)?.name === 'Admin'
}

// Holt den Rollennamen zu einer role_id
async function getRoleName(supabaseAdmin: any, roleId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('roles')
    .select('name')
    .eq('id', roleId)
    .single()
  return data?.name ?? null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Admin-Client mit vollen Rechten
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Aufrufenden User aus JWT dekodieren
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return jsonResponse({ error: 'Kein Token' }, 401)
    }

    let callerId: string
    try {
      const parts = token.split('.')
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      callerId = payload.sub
      if (!callerId) throw new Error('Kein Subject im Token')
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return jsonResponse({ error: 'Token abgelaufen' }, 401)
      }
    } catch {
      return jsonResponse({ error: 'Ungültiger Token' }, 401)
    }

    // Prüfen ob Aufrufer aktiver Admin ist
    const { data: callerProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('role_id, status, roles(name)')
      .eq('id', callerId)
      .single()

    const callerIsAdmin = (callerProfile?.roles as any)?.name === 'Admin'
    const callerIsActive = callerProfile?.status === 'aktiv'

    if (!callerIsAdmin || !callerIsActive) {
      return jsonResponse({ error: 'Nur aktive Admins dürfen diese Aktion ausführen' }, 403)
    }

    // Aktion aus Request-Body lesen
    const { action, ...payload } = await req.json()

    // ── AKTION: Benutzer anlegen (mit Initialpasswort) ─────────
    if (action === 'invite') {
      const { email, name, role_id, password: desiredPassword } = payload
      if (!email || !name || !role_id) {
        return jsonResponse({ error: 'email, name und role_id sind Pflicht' }, 400)
      }

      // Passwort: entweder vom Admin vorgegeben oder auto-generiert
      let passwordToUse: string
      if (desiredPassword && typeof desiredPassword === 'string' && desiredPassword.length > 0) {
        if (desiredPassword.length < 6) {
          return jsonResponse({ error: 'Passwort muss mindestens 6 Zeichen haben' }, 400)
        }
        passwordToUse = desiredPassword
      } else {
        passwordToUse = generatePassword(12)
      }

      // User direkt anlegen, E-Mail als bestätigt markieren
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: passwordToUse,
        email_confirm: true,
      })

      if (createError) {
        return jsonResponse({ error: createError.message }, 400)
      }

      // Profil anlegen (status=eingeladen, muss_passwort_aendern=true)
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: createData.user.id,
          email,
          name,
          role_id,
          status: 'eingeladen',
          muss_passwort_aendern: true,
        })

      if (profileError) {
        // Rollback: Auth-User wieder löschen
        await supabaseAdmin.auth.admin.deleteUser(createData.user.id)
        return jsonResponse({ error: profileError.message }, 400)
      }

      return jsonResponse({
        success: true,
        userId: createData.user.id,
        email,
        password: passwordToUse,
        message: 'Bitte die Zugangsdaten an den User weitergeben.'
      })
    }

    // ── AKTION: Benutzer aktualisieren ────────────────────────
    if (action === 'update') {
      const { user_id, name, role_id, password } = payload
      if (!user_id) {
        return jsonResponse({ error: 'user_id ist Pflicht' }, 400)
      }

      // Aktuellen Zustand des Ziel-Users holen
      const { data: targetUser } = await supabaseAdmin
        .from('user_profiles')
        .select('id, role_id, status, roles(name)')
        .eq('id', user_id)
        .single()

      if (!targetUser) {
        return jsonResponse({ error: 'Benutzer nicht gefunden' }, 404)
      }

      // v2.33.12: nur aktive Admins zählen als "letzter Admin" (konsistent
      // zu countActiveAdmins und isUserAdmin). Inaktive Admins blockierten
      // sonst legitime Degradierungen.
      const targetIsAdmin = targetUser.status === 'aktiv' && (targetUser.roles as any)?.name === 'Admin'
      const roleIsChanging = role_id && role_id !== targetUser.role_id

      // ─── SCHUTZ 1: Anti-Self-Demotion ───
      if (user_id === callerId && roleIsChanging) {
        return jsonResponse({
          error: 'Du kannst deine eigene Rolle nicht ändern. Bitte lass das einen anderen Admin machen.'
        }, 403)
      }

      // ─── SCHUTZ 2: Letzter Admin darf nicht degradiert werden ───
      if (targetIsAdmin && roleIsChanging) {
        const newRoleName = await getRoleName(supabaseAdmin, role_id)
        if (newRoleName !== 'Admin') {
          const adminCount = await countActiveAdmins(supabaseAdmin)
          if (adminCount <= 1) {
            return jsonResponse({
              error: 'Der letzte Admin kann nicht degradiert werden. Lege erst einen weiteren Admin an.'
            }, 403)
          }
        }
      }

      // Profil aktualisieren
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({ name, role_id })
        .eq('id', user_id)

      if (profileError) {
        return jsonResponse({ error: profileError.message }, 400)
      }

      if (password && password.length >= 6) {
        const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(user_id, { password })
        if (pwError) {
          return jsonResponse({ error: pwError.message }, 400)
        }
      }

      return jsonResponse({ success: true })
    }

    // ── AKTION: Passwort zurücksetzen (Admin-Reset) ───────────
    if (action === 'reset_password') {
      const { user_id } = payload
      if (!user_id) {
        return jsonResponse({ error: 'user_id ist Pflicht' }, 400)
      }

      // Prüfen, ob Ziel-User existiert
      const { data: targetProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('email')
        .eq('id', user_id)
        .single()

      if (!targetProfile) {
        return jsonResponse({ error: 'Benutzer nicht gefunden' }, 404)
      }

      // Neues Passwort generieren
      const newPassword = generatePassword(12)

      // Im Auth-System setzen
      const { error: pwError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password: newPassword }
      )
      if (pwError) {
        return jsonResponse({ error: pwError.message }, 400)
      }

      // Flag setzen, damit der User beim nächsten Login das Passwort ändern muss
      const { error: flagError } = await supabaseAdmin
        .from('user_profiles')
        .update({ muss_passwort_aendern: true })
        .eq('id', user_id)

      if (flagError) {
        return jsonResponse({ error: flagError.message }, 400)
      }

      return jsonResponse({
        success: true,
        email: targetProfile.email,
        password: newPassword,
        message: 'Bitte die neuen Zugangsdaten an den User weitergeben.'
      })
    }

    // ── AKTION: Benutzer löschen ──────────────────────────────
    if (action === 'delete') {
      const { user_id } = payload
      if (!user_id) {
        return jsonResponse({ error: 'user_id ist Pflicht' }, 400)
      }

      // Eigenen Account kann man nicht löschen
      if (user_id === callerId) {
        return jsonResponse({ error: 'Du kannst deinen eigenen Account nicht löschen' }, 400)
      }

      // ─── SCHUTZ: Letzter Admin darf nicht gelöscht werden ───
      const targetIsAdmin = await isUserAdmin(supabaseAdmin, user_id)
      if (targetIsAdmin) {
        const adminCount = await countActiveAdmins(supabaseAdmin)
        if (adminCount <= 1) {
          return jsonResponse({
            error: 'Der letzte Admin kann nicht gelöscht werden. Lege erst einen weiteren Admin an.'
          }, 403)
        }
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)
      if (deleteError) {
        return jsonResponse({ error: deleteError.message }, 400)
      }

      return jsonResponse({ success: true })
    }

    return jsonResponse({ error: 'Unbekannte Aktion: ' + action }, 400)

  } catch (err) {
    return jsonResponse({ error: err.message }, 500)
  }
})
