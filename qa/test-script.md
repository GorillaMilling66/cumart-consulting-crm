# Phase D — Manuelles Test-Drehbuch

**Ziel:** Cumart CRM (cumart.cloud) auf Herz und Nieren prüfen, bevor neue Features kommen. Du arbeitest die Szenarien der Reihe nach ab, hakst Bestandene ab, notierst Auffälligkeiten im **Notiz-Feld** direkt unter dem Szenario.

**Vorbereitung:**
- Browser-DevTools öffnen (Cmd+Opt+I) — Console-Tab. Alles Rote/Gelbe ist relevant.
- Network-Tab beobachten bei jedem Klick — 4xx/5xx Responses notieren.
- Test als Admin (volle Rechte) UND als regulärer User (für RLS-/Sichtbarkeits-Tests), falls möglich.
- Du darfst Test-Datensätze auf Produktion anlegen (wir putzen sie über `migrations/cleanup_testdata.sql` weg). Markiere sie eindeutig: Firmenname `ZZ-TEST-<datum>` o. Ä., damit du sie hinterher leicht löschen kannst.

**Severity-Marker für Notizen:**
- 🔴 BUG — Crash, Datenverlust, falsche Persistenz
- 🟠 UX — funktioniert, aber irritiert/unklar
- 🟡 INKONSISTENZ — Verhalten widerspricht anderer Stelle in der App
- 🟢 OK — wie erwartet, kein Eintrag nötig
- 💭 IDEE — Verbesserungsvorschlag (für später)

---

## 0. Browser-Baseline (5 Min)

- [ ] **0.1** Seite hart neu laden (Cmd+Shift+R). Console: irgendwelche Errors/Warnings beim Initial-Load?
  - Notiz:
- [ ] **0.2** Netzwerk-Tab: alle initialen Requests grün? Welche dauern > 1 s?
  - Notiz:
- [ ] **0.3** Login: einloggen, Console weiter beobachten. Beim Wechsel zum Dashboard: Errors?
  - Notiz:
- [ ] **0.4** Logout → wieder einloggen. Console-Reste vom alten Session?
  - Notiz:

---

## 1. Routing & Tiefe Links (10 Min)

- [ ] **1.1** URL `#/firmen` direkt aufrufen, dann `#/dashboard`, `#/projekte`, `#/einsaetze`, `#/termine`, `#/aufgaben`, `#/leistungen`, `#/programme`, `#/mitgliedschaften`, `#/nutzer`, `#/lookups` (alles, was im Nav steht). Jede Seite lädt ohne Crash?
  - Notiz:
- [ ] **1.2** Browser-Back/Forward über mehrere Seiten — bleibt der Scroll-Zustand sinnvoll? Werden Filter/Suchen beibehalten?
  - Notiz:
- [ ] **1.3** Direktlink auf nicht-existente Detail-Seite: `#/firma/00000000-0000-0000-0000-000000000000` → was passiert? Crash, leerer Screen, Toast?
  - Notiz:
- [ ] **1.4** Direktlink auf gelöschten Datensatz (soft-deleted): einen Test-Datensatz anlegen, löschen, dann sein Detail-URL direkt aufrufen.
  - Notiz:
- [ ] **1.5** Hash mit `?query=xxx` oder anderen Param-Anhängen — wird er ignoriert oder bricht das Routing?
  - Notiz:

---

## 2. Firmen (Companies) (15 Min)

- [ ] **2.1** Neue Firma anlegen mit Minimaldaten (nur Name `ZZ-TEST-firma-01`). Speichert? Erscheint in Liste?
  - Notiz:
- [ ] **2.2** Alle Felder ausfüllen, inkl. ABC-Klasse, Themen (Multi-Select), Branche-Lookup. Speichert?
  - Notiz:
- [ ] **2.3** **XSS-Test:** Firmenname = `<img src=x onerror="alert('XSS-FIRMA')">`. Speichern. In Liste, Detail, Auswahl-Dropdowns, Berichten — taucht das Alert auf?
  - Notiz:
- [ ] **2.4** Name mit Umlauten/Sonderzeichen (`Müller & Söhne GmbH`, `O'Brien`, `Café "Zur Linde"`). Sortierung in der Liste korrekt?
  - Notiz:
- [ ] **2.5** Duplikate erlaubt? Zwei Firmen mit exakt gleichem Namen anlegen — warnt die App?
  - Notiz:
- [ ] **2.6** Firma bearbeiten → speichern → erscheint die Änderung sofort in der Liste OHNE Page-Reload?
  - Notiz:
- [ ] **2.7** Firma duplizieren (Icon in Liste). Klont es alle Felder? Themen/Multi-Selects? Neuer Name eindeutig?
  - Notiz:
- [ ] **2.8** Firma löschen mit verknüpften Kontakten/Einsätzen → FK-Verletzung-Toast oder Soft-Delete? Was bleibt sichtbar?
  - Notiz:
- [ ] **2.9** Firma löschen ohne Verknüpfungen → wirklich weg? Oder Soft-Delete (Reaktivierung möglich)?
  - Notiz:
- [ ] **2.10** Suche: nach Namens-Fragment filtern. Case-insensitive? Sonderzeichen? Leerzeichen?
  - Notiz:
- [ ] **2.11** ABC-Klassen-Filter: Klick auf A, B, C, alle. Funktioniert korrekt?
  - Notiz:
- [ ] **2.12** Themen-Filter: kombiniert mit ABC-Filter — schneiden sich die Filter korrekt?
  - Notiz:

---

## 3. Kontakte (Contacts) (10 Min)

- [ ] **3.1** Kontakt zu Firma `ZZ-TEST-firma-01` anlegen. Vorname leer, Nachname `Test`. Speichert?
  - Notiz:
- [ ] **3.2** Kontakt OHNE Firma anlegen (falls erlaubt). Was passiert in Liste?
  - Notiz:
- [ ] **3.3** Kontakt mit ungültiger E-Mail (`abc@`, `xyz`, `a@b.c.`). Validierung?
  - Notiz:
- [ ] **3.4** Telefon mit Sonderzeichen/Leerzeichen (`+49 (171) 234-5678`). Speichert, zeigt korrekt?
  - Notiz:
- [ ] **3.5** Kontakt einer Firma → Firma der primären Kontaktperson wechseln. Bleibt Firma-Auswahl synchron in Listenansicht?
  - Notiz:
- [ ] **3.6** Kontakt löschen, der als Ansprechpartner an Einsätzen hängt. FK? Oder gelöscht-Marker?
  - Notiz:
- [ ] **3.7** XSS: Kontaktname mit `<script>alert('XSS-KONTAKT')</script>`. In Firma-Detail, Auswahl-Dropdowns, Berichten?
  - Notiz:

---

## 4. Termine (Appointments) (15 Min)

- [ ] **4.1** Termin anlegen: Firma `ZZ-TEST-firma-01`, Datum heute, Status `geplant`. Speichert?
  - Notiz:
- [ ] **4.2** Termin ohne Datum anlegen — erlaubt? Wie wird er gerendert?
  - Notiz:
- [ ] **4.3** Termin mit Datum in der Zukunft + Status `durchgefuehrt` — Validierung?
  - Notiz:
- [ ] **4.4** Termin mit Multi-User-Teilnehmern (mehrere User auswählen). Speichern, neu öffnen — alle wieder da?
  - Notiz:
- [ ] **4.5** Termin bearbeiten — Datum ändern. Erscheint Änderung sofort in Liste/Firma-Detail OHNE Reload?
  - Notiz:
- [ ] **4.6** Termin auf Status `durchgefuehrt` setzen via Quick-Toggle in Liste. Sofortige UI-Reaktion? Persistiert nach Reload?
  - Notiz:
- [ ] **4.7** Termin löschen — verschwindet aus Liste UND aus Firma-Detail-Section?
  - Notiz:

---

## 5. Projekte (Projects) (20 Min)

- [ ] **5.1** Projekt für `ZZ-TEST-firma-01` anlegen mit `geschaetzter_umsatz = 1000`. Status startet als `lead`?
  - Notiz:
- [ ] **5.2** Status manuell auf `angebot`, dann `in_arbeit` setzen. Persistiert?
  - Notiz:
- [ ] **5.3** Projekt-Themen (Themen-Picker) zuweisen. Speichert? Nach Reload da?
  - Notiz:
- [ ] **5.4** Programm-Verknüpfung (falls Projekt mit Mitgliedschaft koppelt) — Funktion?
  - Notiz:
- [ ] **5.5** **Auto-Status (kritisch):** Projekt `in_arbeit`. Einsatz dazu anlegen, Status `durchgefuehrt`. Projekt-Status springt auf `abschlussphase`? Abrechnen alle → `abgeschlossen`?
  - Notiz:
- [ ] **5.6** Projekt `abgeschlossen`. Einen Einsatz wieder auf `geplant` zurücksetzen — springt das Projekt zurück auf `in_arbeit`?
  - Notiz:
- [ ] **5.7** Projekt `abgeschlossen`. Einen Einsatz löschen — Status-Reaktion?
  - Notiz:
- [ ] **5.8** Projekt-Liste: Sortierung nach Umsatz, Datum, Status. Korrekt?
  - Notiz:
- [ ] **5.9** Projekt löschen mit verknüpften Einsätzen → was passiert mit den Einsätzen? FK-Verletzung? Cascade?
  - Notiz:
- [ ] **5.10** Projekt duplizieren — Einsätze mit-kopiert oder nicht? Datum/Status der Kopie?
  - Notiz:
- [ ] **5.11** **Soll/Ist-Vergleich:** Projekt mit `geschaetzter_umsatz = 1000`, drei Einsätze mit Einzelpreis-Summe = 1200. Wo wird der Soll/Ist-Vergleich angezeigt, wird er korrekt gerechnet?
  - Notiz:
- [ ] **5.12** Projekt-Status `nach_aufwand` setzen (v2.28.9). Wird Preisberechnung umgeschaltet?
  - Notiz:

---

## 6. Einsätze (Deployments) — der heißeste Pfad (30 Min)

### 6a. Anlage & Grundregeln

- [ ] **6.1** Einsatz für `ZZ-TEST-firma-01` ohne Projekt-Zuordnung. Menge 2, Einzelpreis 100. Speichert? Erscheint als Kundenumsatz 200 €?
  - Notiz:
- [ ] **6.2** Einsatz **mit** Projekt-Zuordnung. Erscheint Einzelpreis als interner Aufwand, nicht als zusätzlicher Umsatz?
  - Notiz:
- [ ] **6.3** Einsatz ohne Firma anlegen — erlaubt? Verhalten?
  - Notiz:
- [ ] **6.4** Einsatz mit `menge = 0` oder negativer Menge. Validierung?
  - Notiz:
- [ ] **6.5** Einsatz mit leerem Einzelpreis. Wie wird gerechnet?
  - Notiz:
- [ ] **6.6** Rabatt-Feld (v2.28.2): Rabatt 10 %, dann 100 € → Endsumme 90 €? Rendering konsistent?
  - Notiz:

### 6b. Inline-Composer (v2.32.x) — neueste Features

- [ ] **6.7** Composer öffnen aus Firma-Detail. Alle Inline-Felder vorhanden (Rabatt, Externe Techniker, Termin-Sync, Aufgabe-Notizen, Nach-Aufwand, Lieferant)?
  - Notiz:
- [ ] **6.8** Themen-Picker mit Quick-Add (v2.32.11): neues Thema beim Anlegen direkt erzeugen. Speichert? Erscheint in Themen-Liste?
  - Notiz:
- [ ] **6.9** Bonus-Einlösung im Composer (v2.32.12) — wenn Firma Mitgliedschaft hat. Einlösung wählen, speichern. Bonus-Saldo aktualisiert?
  - Notiz:
- [ ] **6.10** Multi-Select-Chip-Picker (v2.32.10) für Junction-Felder — mehrere Werte wählen, Chips entfernen, neu wählen. Funktioniert?
  - Notiz:

### 6c. Termin↔Einsatz-Kopplung (kritisch laut architecture.md §8.4)

- [ ] **6.11** Einsatz mit Datum + Checkbox „Auch als Termin eintragen" ON. Termin wird automatisch erstellt? Mit gleichem Datum?
  - Notiz:
- [ ] **6.12** Einsatz mit Termin: Checkbox auf OFF. Termin wird **gelöscht**?
  - Notiz:
- [ ] **6.13** Einsatz mit Termin: Datum am Einsatz leeren, Checkbox bleibt ON. Termin gelöscht?
  - Notiz:
- [ ] **6.14** Einsatz mit Termin: Datum ändern. Termin-Datum auch geändert?
  - Notiz:
- [ ] **6.15** Einsatz mit Termin: ganzen Einsatz löschen. Termin auch weg?
  - Notiz:
- [ ] **6.16** Manuell den gekoppelten Termin löschen. Was passiert mit Checkbox am Einsatz beim nächsten Öffnen?
  - Notiz:
- [ ] **6.17** Einsatz duplizieren — Termin auch dupliziert oder Original-Termin wieder verlinkt?
  - Notiz:

### 6d. Entitlements/Einlösungen (kritisch laut architecture.md §8.9)

- [ ] **6.18** Firma mit aktiver Mitgliedschaft + offenen Entitlements. Einsatz anlegen → Einlösungs-Sektion erscheint?
  - Notiz:
- [ ] **6.19** Einlösung wählen, Menge 2 von 5 verfügbar. Speichern. Saldo am Entitlement: 3 von 5 frei?
  - Notiz:
- [ ] **6.20** Einsatz mit Einlösung bearbeiten, Menge auf 3 erhöhen (max wäre 5, eigene 2 + frei 3). Akzeptiert? Saldo korrekt nach Save?
  - Notiz:
- [ ] **6.21** Einsatz mit Einlösung **bearbeiten und auf eine andere Einlösung wechseln**. Bilanz an beiden Entitlements korrekt?
  - Notiz:
- [ ] **6.22** Einsatz mit Einlösung löschen. Saldo am Entitlement: Menge zurückgegeben?
  - Notiz:
- [ ] **6.23** Saldo überzeichnen versuchen (mehr Menge als verfügbar). Validierung verhindert?
  - Notiz:
- [ ] **6.24** Firma ohne Mitgliedschaft: Einlösungs-Sektion erscheint NICHT?
  - Notiz:

---

## 7. Mitgliedschaften & Programme (15 Min)

- [ ] **7.1** Programm anlegen, 3 Benefits hinterlegen. Speichert?
  - Notiz:
- [ ] **7.2** Mitgliedschaft für `ZZ-TEST-firma-01` zum Programm anlegen. Sofort danach: existieren `entitlements`-Einträge passend zu den Benefits?
  - Notiz:
- [ ] **7.3** Programm-Benefits nachträglich ändern (einen rausnehmen, neuen hinzufügen). Mitgliedschafts-Entitlements **bleiben unverändert** (laut Spec)?
  - Notiz:
- [ ] **7.4** Mitgliedschaft bearbeiten — Laufzeit-Modus (v2.7.2) testen. Funktioniert?
  - Notiz:
- [ ] **7.5** Mitgliedschaft löschen mit eingelösten Entitlements. Was passiert mit den Redemptions?
  - Notiz:
- [ ] **7.6** Mitgliedschaft auslaufen lassen (Datum manuell setzen). Wie wird sie in Liste/Firma-Detail markiert?
  - Notiz:

---

## 8. Aufgaben (Tasks) (10 Min)

- [ ] **8.1** Aufgabe anlegen, sich selbst zuweisen. Erscheint im persönlichen Bereich?
  - Notiz:
- [ ] **8.2** Aufgabe einem anderen User zuweisen. Erscheint bei ihm (Wechsel-User-Test)?
  - Notiz:
- [ ] **8.3** Aufgabe an Firma/Projekt/Kontakt knüpfen. Erscheint sie auch in der jeweiligen Detail-Seite?
  - Notiz:
- [ ] **8.4** Aufgabe auf `erledigt` setzen via Quick-Toggle. Persistiert? Wechselt `erledigt_am` automatisch?
  - Notiz:
- [ ] **8.5** Aufgabe von `erledigt` zurück auf `offen`. `erledigt_am` wieder NULL?
  - Notiz:
- [ ] **8.6** Aufgabe mit Fälligkeit in der Vergangenheit — sichtbar markiert (rote Farbe)?
  - Notiz:
- [ ] **8.7** Aufgabe löschen. Sauberer Ablauf?
  - Notiz:

---

## 9. Leistungen (Services) & Lieferanten (5 Min)

- [ ] **9.1** Neue Leistung anlegen mit Standardpreis. In Einsatz-Modal als Auswahl verfügbar?
  - Notiz:
- [ ] **9.2** Lieferanten zur Leistung zuweisen (v2.6.0). Persistiert?
  - Notiz:
- [ ] **9.3** Leistung deaktivieren (`ist_aktiv=false`). Verschwindet aus Auswahl-Dropdowns, alte Einsätze trotzdem sichtbar?
  - Notiz:

---

## 10. Lookups (Stammdaten) (10 Min) — KRITISCH nach v2.31

- [ ] **10.1** Lookup-Wert in Kategorie `projekt_status` bearbeiten: nur `wert` (Label) ändern, `system_key` lassen. Speichert? In Projekt-Liste: Label aktualisiert?
  - Notiz:
- [ ] **10.2** Lookup-Wert deaktivieren (`ist_aktiv=false`) der noch von Projekten verwendet wird. Alte Projekte: Anzeige ok?
  - Notiz:
- [ ] **10.3** Neuen Lookup-Wert in Kategorie `branchen` anlegen. In Firma-Modal sofort wählbar (oder erst nach Reload)?
  - Notiz:
- [ ] **10.4** Lookup-Wert löschen — wenn von Datensätzen referenziert: FK-Schutz?
  - Notiz:
- [ ] **10.5** **Achtung:** `system_key` von einem aktiven Lookup-Wert ändern. Was passiert mit Datensätzen, die den alten Key gespeichert haben? (Erwartung: brechen!)
  - Notiz:

---

## 11. Templates & Dokumentation (5 Min)

- [ ] **11.1** Template (v1.50, v2.27) anlegen, Typ `doc` (v2.27.1). Speichert?
  - Notiz:
- [ ] **11.2** Template auf Einsatz anwenden. Doc-Sections (v2.27.0) korrekt erzeugt?
  - Notiz:
- [ ] **11.3** Doc-Section mit Bereich (v2.31.2) anlegen. Funktioniert?
  - Notiz:

---

## 12. Berichte & Exports (10 Min)

- [ ] **12.1** Kundenbericht als HTML-Download (v2.32.13). Datei öffnen — Inhalt komplett? Layout?
  - Notiz:
- [ ] **12.2** Bericht-HTML in Browser öffnen — Encoding korrekt (Umlaute)? Bilder/Logos eingebettet?
  - Notiz:
- [ ] **12.3** **XSS-Test im Bericht:** Firma mit Name `<img src=x onerror="alert('XSS-BERICHT')">` — wird im Bericht escaped oder geht das Alert ab?
  - Notiz:
- [ ] **12.4** Bericht für Firma OHNE Einsätze. Leere Sektionen oder Fehler?
  - Notiz:
- [ ] **12.5** Falls CSV-Export existiert: Formula-Injection-Test (`=cmd|...`).
  - Notiz:

---

## 13. Nutzerverwaltung (Admin) (10 Min)

- [ ] **13.1** Neuen Nutzer einladen (`manage-users` Edge Function). E-Mail kommt an? Reset-Link?
  - Notiz:
- [ ] **13.2** Nutzer-Rolle ändern (Admin/User). Sofort wirksam (Re-Login nötig)?
  - Notiz:
- [ ] **13.3** Nutzer deaktivieren (`status=inaktiv`). Kann sich noch einloggen? Sieht noch Daten?
  - Notiz:
- [ ] **13.4** **Last-Admin-Schutz:** dich selbst als letzter Admin auf User-Rolle degradieren versuchen. Verhindert?
  - Notiz:
- [ ] **13.5** Nutzer löschen — vollständig? `user_profiles` und `auth.users`?
  - Notiz:
- [ ] **13.6** Passwort-Reset für anderen Nutzer auslösen. Mail kommt?
  - Notiz:

---

## 14. Mobile (10 Min) — Browser auf Mobile-Viewport stellen (DevTools, ~375px Breite)

- [ ] **14.1** Navigation: Hamburger oder Bottom-Nav? Erreichbar alle Seiten?
  - Notiz:
- [ ] **14.2** Firma-Liste: Spalten korrekt verkürzt? `.col-action` ausgeblendet, Titel ist Link?
  - Notiz:
- [ ] **14.3** Modal auf Mobile: alle Felder erreichbar (scrollbar)? Save-Button erreichbar?
  - Notiz:
- [ ] **14.4** Input-Fokus: iOS-Zoom NICHT auslösen (Font-Size 16px)?
  - Notiz:
- [ ] **14.5** Datepicker auf Mobile: nativ?
  - Notiz:
- [ ] **14.6** Multi-Select-Chip-Picker auf Mobile: bedienbar?
  - Notiz:
- [ ] **14.7** Tabellen-Scroll horizontal nicht durchbrechen das Layout?
  - Notiz:

---

## 15. Cross-Cutting & Allgemein (10 Min)

- [ ] **15.1** **Doppelklick-Test:** Save-Button im Firma-Modal sehr schnell zweimal klicken. Doppelter Datensatz?
  - Notiz:
- [ ] **15.2** **Netzwerk-Drosselung:** DevTools → Network → „Slow 3G". Modal speichern. Spinner? Doppel-Click möglich? Fehlerpfad bei Timeout?
  - Notiz:
- [ ] **15.3** **Offline:** WLAN aus. Modal speichern versuchen. Was zeigt die App?
  - Notiz:
- [ ] **15.4** **Lange Strings:** Notiz-Feld mit 10 000 Zeichen befüllen. Performance? Speichert?
  - Notiz:
- [ ] **15.5** **Datum-Edge:** Termin auf den 29.02.2024 (Schaltjahr) setzen. Reloaded korrekt?
  - Notiz:
- [ ] **15.6** **Timezone:** Termin um 23:59 Uhr lokal — wird er morgen oder heute angezeigt nach Reload?
  - Notiz:
- [ ] **15.7** **Multi-Tab:** zwei Tabs offen, in Tab A Firma editieren, in Tab B die Liste anschauen. Wann sieht B die Änderung?
  - Notiz:
- [ ] **15.8** **Browser-Back nach Modal:** Modal öffnen, Browser-Back drücken — was passiert? Modal schließt? Routing kaputt?
  - Notiz:
- [ ] **15.9** **Console-Errors gesamt:** während dieser Tests, gab es ungewöhnliche Console-Logs?
  - Notiz:
- [ ] **15.10** **Performance:** auf den schwersten Seiten (z. B. Einsatz-Liste mit 500+ Einträgen): wie lange bis interaktiv?
  - Notiz:

---

## Aufräumen

Wenn du fertig bist:
- [ ] Alle Test-Datensätze mit Präfix `ZZ-TEST-` löschen.
- [ ] Diese Datei mit allen Notizen mir geben — ich konsolidiere mit den Code-/Daten-Findings in `qa/findings-master.md`.

---

## Notiz-Sammelraum (frei)

Wenn dir während des Tests Dinge auffallen, die in keinem Szenario stehen, hier reinschreiben:

```
- 
- 
- 
```
