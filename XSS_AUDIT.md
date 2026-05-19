# XSS-Audit — Phase 3.1 Bestandsaufnahme

**Gesamt:** 2895 Template-Interpolationen in `app.js`.  
**HIGH:** 13 (0%) — DB-Property ohne `esc()`-Wrap.  
**MEDIUM:** 68 (2%) — Property-Access, Quelle unklar.  
**LOW/SAFE:** 2814 — Wrapped oder numerisch/strukturell.

## HIGH — Top-Muster (DB-Property direkt ohne esc)

Diese sind die echten Risiko-Kandidaten. Pro Pattern: Anzahl, erste Fundstelle.

| # | Pattern | Vorkommen | Erste Zeile |
|---|---------|-----------|-------------|
| 1 | `_attachmentIcon ? _attachmentIcon(a.mime_type, a.filename) : '📎'` | 3 | 6195 |
| 2 | `t.status === 'erledigt' ? 'is-done' : ''` | 2 | 24489 |
| 3 | `t.status === 'erledigt' ? 'checked' : ''` | 2 | 24490 |
| 4 | `val === o.wert ? 'selected' : ''` | 1 | 8189 |
| 5 | `t.beschreibung && t.beschreibung.length > 100 ? '…' : ''` | 1 | 28205 |
| 6 | `logs.map(l => `<li><span class="log-kat">${l.kategorie === 'erkenntnis' ? 'Er...` | 1 | 29266 |
| 7 | `d.ort ? `<tr><td>Ort</td><td>${_e(d.ort)}</td></tr>` : ''` | 1 | 29298 |
| 8 | `company.strasse ? `<br>${_e(company.strasse)}` : ''` | 1 | 29498 |
| 9 | `(company.plz \|\| company.stadt) ? `<br>${_e([company.plz, company.stadt].fil...` | 1 | 29499 |

## MEDIUM — Property-Access mit unklarer Quelle

Variablen wie `${o.titel}` — könnte lokale safe Var oder DB-Wert sein. Spot-Check empfohlen.

| # | Pattern | Vorkommen | Erste Zeile |
|---|---------|-----------|-------------|
| 1 | `i.onClick` | 6 | 16873 |
| 2 | `d.id` | 3 | 4381 |
| 3 | `f.key` | 3 | 8164 |
| 4 | `statusStyle.cls` | 2 | 2474 |
| 5 | `it.click` | 2 | 2479 |
| 6 | `p.entity_type` | 2 | 5211 |
| 7 | `p.entity_id` | 2 | 5211 |
| 8 | `badge.cls` | 2 | 5539 |
| 9 | `kat.emoji` | 2 | 6211 |
| 10 | `u.id` | 2 | 7302 |
| 11 | `arbeitsTage.belegt` | 2 | 19924 |
| 12 | `arbeitsTage.werk` | 2 | 19924 |
| 13 | `day.day` | 2 | 20767 |
| 14 | `ic.companies` | 2 | 21321 |
| 15 | `ic.contacts` | 2 | 21322 |
| 16 | `s.system_key` | 1 | 9 |
| 17 | `s.bg` | 1 | 4088 |
| 18 | `s.color` | 1 | 4088 |
| 19 | `counts.einsatz` | 1 | 4683 |
| 20 | `counts.termin` | 1 | 4684 |
| 21 | `a.id` | 1 | 4818 |
| 22 | `r.type` | 1 | 5218 |
| 23 | `r.id` | 1 | 5218 |
| 24 | `c.abc_klassifizierung` | 1 | 5252 |
| 25 | `hero.editFn` | 1 | 6100 |
| 26 | `hero.fullPage` | 1 | 6101 |
| 27 | `param.type` | 1 | 6560 |
| 28 | `param.id` | 1 | 6560 |
| 29 | `param.projekt` | 1 | 6582 |
| 30 | `drawerPreviewEl.innerHTML` | 1 | 7059 |
| 31 | `s.id` | 1 | 7570 |
| 32 | `t.reihenfolge` | 1 | 8037 |
| 33 | `el.id` | 1 | 8776 |
| 34 | `t.einsatz_count` | 1 | 8925 |
| 35 | `p.laufzeit_monate` | 1 | 9389 |
| 36 | `program.mitgliedsnummer_praefix` | 1 | 9933 |
| 37 | `b.menge_pro_laufzeit` | 1 | 9947 |
| 38 | `e.gesamt_menge` | 1 | 14509 |
| 39 | `entry.id` | 1 | 16342 |
| 40 | `d.externe_techniker` | 1 | 18116 |

## Nächste Schritte (Phase 3.2)

1. HIGH-Liste durchgehen, jede Stelle prüfen:
   - `grep -nF "${pattern}" app.js`
   - Quelle der Variable identifizieren (lokal/DB/Markup)
   - Bei DB-Quelle ohne `esc()`: wrappen.
2. MEDIUM nur stichprobenartig — meist lokale Variablen.
3. CSP (Phase 3.3) ist bereits via vercel.json aktiv → Defense-in-Depth.
