#!/usr/bin/env python3
"""XSS-Audit für app.js — findet potentielle DB-Property-Zugriffe in
Template-Literal-Interpolationen, die NICHT via `esc(...)` o.ä. gewrappt sind.

Heuristik (zwei Stufen):

STUFE 1 — Whitelist (offensichtlich sicher):
  * ${esc(...)} oder beliebiger Funktionsaufruf eines bekannten Display-Helpers
  * ${X.length}, ${X.size}, ${X.count} (numerisch)
  * Reine Zahlen, statische Strings
  * Bekannte Markup-Helper-Variablen (nameHtml, statusPill, …)
  * Indices/Counter

STUFE 2 — Risiko-Ranking (für die übrigen):
  * HIGH: enthält Property-Access mit DB-typischen Namen
    (.name, .titel, .beschreibung, .notizen, .text, .inhalt, .email, …)
  * MEDIUM: enthält irgendeinen Property-Access ohne function-call
  * LOW: alles andere (Conditionals, Variablen)

Output:
  XSS_AUDIT.md mit den HIGH/MEDIUM Patterns + Zeilennummern.
"""

import re
from collections import Counter

FILE = '/Users/selcukcumart/Documents/cumart-consulting-crm/app.js'
OUT  = '/Users/selcukcumart/Documents/cumart-consulting-crm/XSS_AUDIT.md'

with open(FILE, 'r', encoding='utf-8') as f:
    src = f.read()

# ──────────────────────────────────────────────────────────────────
# Interpolations-Extraktor (nested-brace-aware)
# ──────────────────────────────────────────────────────────────────
def extract_interpolations(text):
    results = []
    line = 1
    i = 0
    while i < len(text):
        if text[i] == '\n':
            line += 1
            i += 1
            continue
        if text[i:i+2] == '${':
            depth = 1
            j = i + 2
            while j < len(text) and depth > 0:
                if text[j] == '{':
                    depth += 1
                elif text[j] == '}':
                    depth -= 1
                if depth > 0:
                    j += 1
            expr = text[i+2:j].strip()
            results.append((line, expr))
            line += text[i+2:j].count('\n')
            i = j + 1
        else:
            i += 1
    return results

# ──────────────────────────────────────────────────────────────────
# Whitelist — funktion-call-Prefixes
# ──────────────────────────────────────────────────────────────────
SAFE_PREFIXES = (
    'esc(', 'escSafe(', 'escHtml(', 'escape(',
    'formatPreis(', 'formatDateDE(', 'formatDateCompact(',
    'formatDateTimeCompact(', 'formatLastLogin(', 'formatNumber(',
    'formatTime(', 'formatDuration(',
    'Number(', 'parseFloat(', 'parseInt(', 'String(',
    'dispStatus(', 'appointmentStatusLabel(', 'aufgabeStatusLabel(',
    'getStatusLabel(', 'statusLabel(',
    'aufgabeStatusBg(', 'aufgabeStatusColor(',
    'appointmentStatusBg(', 'appointmentStatusColor(',
    'projektStatusFarbe(', 'einsatzStatusFarbe(',
    'statusBg(', 'statusColor(',
    'calcDeploymentNetto(', 'calcDeploymentGesamt(',
    'terminTypDotHtml(',
    'renderActionIcons(',
)

# Bekannte "bereits gerenderte HTML"-Variablen (kommt aus Code, kein User-Input)
SAFE_BARE_HTML_VARS = {
    'nameHtml', 'firmaHtml', 'titelHtml', 'timeHtml', 'kvHtml',
    'statusHtml', 'typPillHtml', 'statusPill', 'statusBadge',
    'rowAccentCls', 'titleCls', 'editHandler', 'deleteHandler',
    'duplicateHandler', 'editIcon', 'goToPlan', 'extraIconsHtml',
    'statusOptions', 'statusFilter',
    'kpiRow', 'sparkData', 'auslastungBar',
    'rowsHtml', 'cardsHtml', 'stagesHtml', 'topDaysHtml',
    'customersHtml', 'stornoHint', 'stornoHintHtml',
    'cancelledHtml', 'pflegeHtml', 'restmonatHtml',
    'cls', 'statusCls', 'statusClass', 'extraCls',
    'ICON_EDIT', 'ICON_DELETE', 'ICON_DUPLICATE', 'COPY_ICON_SVG', 'ROW_CAL_ICON',
}

# Bekannte numerische / index Variablen
SAFE_BARE_NUMERIC = {
    'i', 'idx', 'index', 'n', 'k', 'j', 'count', 'total', 'len',
    'shown', 'opts', 'q', 'overdue.length', 'msg', 'param',
    'color', 'pct', 'weight', 'heightPx', 'h',
    'year', 'hhmm', 'iso', 'days',
    'stageMap', 'stage',
    'critsTotal', 'critsDone', 'tasksDone',
}

# DB-typische Property-Namen (Risiko-Indikator)
DB_PROPS = re.compile(
    r"\.(name|titel|title|beschreibung|notizen|text|inhalt|content|"
    r"email|telefon|tel|ort|adresse|webseite|website|"
    r"vorname|nachname|firma|company|kontakt|kommentar|message|"
    r"wert|label|kategorie|tag|tags|"
    r"filename|filepath|url|"
    r"strasse|plz|stadt|land|"
    r"betrag|menge|einzelpreis|"
    r"datum|von|bis|"
    r"benutzer|user|"
    r"frage|antwort|"
    r"role|status|rolle|"
    r"intern_notiz|admin_notiz|kunden_notiz"
    r")\b"
)

# Reines property-access ohne function-call (.foo, .foo?.bar, etc.)
PROPERTY_ACCESS_NO_CALL = re.compile(r"^[a-zA-Z_][\w\.\?]*$")

def is_pure_whitelist(expr):
    e = expr.strip()
    for p in SAFE_PREFIXES:
        if e.startswith(p):
            return True
    if e in SAFE_BARE_HTML_VARS or e in SAFE_BARE_NUMERIC:
        return True
    if re.match(r"^['\"`].*['\"`]$", e):
        return True
    if re.match(r"^-?\d+(\.\d+)?$", e):
        return True
    # Length/size/count am Ende → numerisch
    if re.search(r"\.(length|size|count|len)$", e) and '(' not in e:
        return True
    return False

def classify_risk(expr):
    """Liefert ('high'|'medium'|'low', reason)."""
    e = expr.strip()
    # Property-Zugriff auf DB-typischen Namen ohne function-wrap außenrum?
    # Heuristik: enthält DB_PROP_PATTERN UND keine `esc(` Wrap UND keine
    # bekannten numerischen Suffixes
    has_db_prop = bool(DB_PROPS.search(e))
    has_esc = 'esc(' in e or 'escSafe(' in e or 'dispStatus(' in e
    has_format = any(p in e for p in ('formatPreis(', 'formatDate', 'formatTime('))
    if has_esc or has_format:
        return ('low', 'wrapped')
    if has_db_prop:
        return ('high', 'db-property without esc wrap')
    # Pure property access ohne function call → könnte DB-Wert sein
    if PROPERTY_ACCESS_NO_CALL.match(e) and '.' in e:
        return ('medium', 'property access, source unknown')
    # Ternary mit DB-property?
    if has_db_prop:
        return ('high', 'db-property in conditional')
    return ('low', 'expression')

interps = extract_interpolations(src)
suspect = [(l, e) for l, e in interps if not is_pure_whitelist(e)]

ranked = [(l, e, *classify_risk(e)) for l, e in suspect]
high   = [(l, e, r) for l, e, lvl, r in ranked if lvl == 'high']
medium = [(l, e, r) for l, e, lvl, r in ranked if lvl == 'medium']
low    = [(l, e, r) for l, e, lvl, r in ranked if lvl == 'low']

# Top-Patterns pro Risiko-Stufe
def top_unique(lst, n=80):
    cnt = Counter(e for l, e, _ in lst)
    first = {}
    for l, e, _ in lst:
        if e not in first:
            first[e] = l
    return [(p, c, first[p]) for p, c in cnt.most_common(n)]

# ──────────────────────────────────────────────────────────────────
# Markdown-Bericht
# ──────────────────────────────────────────────────────────────────
total = len(interps)
out = []
out.append('# XSS-Audit — Phase 3.1 Bestandsaufnahme')
out.append('')
out.append(f'**Gesamt:** {total} Template-Interpolationen in `app.js`.  ')
out.append(f'**HIGH:** {len(high)} ({len(high)*100//max(total,1)}%) — DB-Property ohne `esc()`-Wrap.  ')
out.append(f'**MEDIUM:** {len(medium)} ({len(medium)*100//max(total,1)}%) — Property-Access, Quelle unklar.  ')
out.append(f'**LOW/SAFE:** {total - len(high) - len(medium)} — Wrapped oder numerisch/strukturell.')
out.append('')

out.append('## HIGH — Top-Muster (DB-Property direkt ohne esc)')
out.append('')
out.append('Diese sind die echten Risiko-Kandidaten. Pro Pattern: Anzahl, erste Fundstelle.')
out.append('')
out.append('| # | Pattern | Vorkommen | Erste Zeile |')
out.append('|---|---------|-----------|-------------|')
for i, (pat, cnt, fl) in enumerate(top_unique(high, 80), 1):
    p = pat.replace('|', '\\|').replace('\n', ' ')
    if len(p) > 80:
        p = p[:77] + '...'
    out.append(f'| {i} | `{p}` | {cnt} | {fl} |')
out.append('')

out.append('## MEDIUM — Property-Access mit unklarer Quelle')
out.append('')
out.append('Variablen wie `${o.titel}` — könnte lokale safe Var oder DB-Wert sein. Spot-Check empfohlen.')
out.append('')
out.append('| # | Pattern | Vorkommen | Erste Zeile |')
out.append('|---|---------|-----------|-------------|')
for i, (pat, cnt, fl) in enumerate(top_unique(medium, 40), 1):
    p = pat.replace('|', '\\|').replace('\n', ' ')
    if len(p) > 80:
        p = p[:77] + '...'
    out.append(f'| {i} | `{p}` | {cnt} | {fl} |')
out.append('')

out.append('## Nächste Schritte (Phase 3.2)')
out.append('')
out.append('1. HIGH-Liste durchgehen, jede Stelle prüfen:')
out.append('   - `grep -nF "${pattern}" app.js`')
out.append('   - Quelle der Variable identifizieren (lokal/DB/Markup)')
out.append('   - Bei DB-Quelle ohne `esc()`: wrappen.')
out.append('2. MEDIUM nur stichprobenartig — meist lokale Variablen.')
out.append('3. CSP (Phase 3.3) ist bereits via vercel.json aktiv → Defense-in-Depth.')

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(out) + '\n')

print(f'Total: {total}')
print(f'HIGH: {len(high)}  ({len(set(e for l,e,_ in high))} unique)')
print(f'MEDIUM: {len(medium)}  ({len(set(e for l,e,_ in medium))} unique)')
print(f'LOW: {len(low)}')
print(f'Report: {OUT}')
