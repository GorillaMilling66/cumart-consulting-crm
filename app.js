/* ═══════════════════════════════════════════════════════════
   Cumart CRM – Application Script
   Version 2.0.0-pre.0 (Komplett-Redesign Phase 0: Foundation).
   - Neue Design-Tokens (warm-creme Page-BG, Pastell-Themen-Palette
     in 8 Farben, Typ-Pillen für Activity-Stream, neue Radius- &
     Border-Skala). Bestehende Variablennamen behalten ihre Rolle.
   - Top-Navigation mit drei Hauptbereichen Briefing · Arbeitsplatz
     · Listen ersetzt den heutigen App-Header. Logo „cumart" links,
     Suche/Zahnrad/Avatar rechts. Sidebar bleibt parallel sichtbar
     bis Phase 5 (sonst kein Zugriff auf Admin-Bereiche).
   - Hash-Router um /briefing, /arbeitsplatz, /listen, /einstellungen
     erweitert. Loader-Stubs zeigen „kommt in Phase X"-Hinweis mit
     Sprung zur aktuellen Funktion.
   - setActiveTopNavTab markiert den passenden Bereichs-Tab je nach
     aktiver Page (Listen-Tab z.B. auch bei Detail-Pages aktiv).
   - Avatar-Initialen werden im Top-Nav rechts gespiegelt.
   Version 1.53.0 (Phase A des Master-Plan v2.1: Themen als
   echte M:N-Strukturdaten).
   - Neue Tabelle `project_themes` (id, project_id, name,
     beschreibung, status, owner_id, farbe, reihenfolge,
     deleted_at) — kanonische Themenliste pro Projekt.
   - Neue Junction `deployment_themes` (deployment_id, theme_id)
     — M:N zwischen Einsätzen und Themen.
   - Themen-Sektion im Projekt-Stammdaten-Tab zwischen
     Beschreibung und Dokumentation: CRUD-Modal mit Farbe,
     Status (lookup_values.theme_status), Owner, Reihenfolge.
   - Theme-Picker im Einsatz-Modal als Multi-Select-Pillen,
     zeigt nur Themen des verknüpften Projekts. Bei keinem
     Projekt: Disabled mit Hinweis.
   - Confirm-Dialog beim Projekt-Wechsel eines Einsatzes mit
     bestehenden Theme-Zuordnungen — bei OK werden die alten
     Junctions gelöscht (keine Auto-Übernahme).
   - Best-Effort-Migration aus dokumentation.themenwahl
     (Splittet an Newline/Bullet/Semikolon) und
     dokumentation.durchgefuehrte_themen (Match per case-
     insensitivem Vergleich gegen project_themes).
   - Hinweis-Banner im Stammdaten-Tab nach Migration —
     dismissibles via localStorage.
   - Migration v1.53.0_themes.sql via Management API
     angewendet: 2 Tabellen, 4 RLS-Policies, 3 theme_status-
     Lookups.
   - Helper: loadProjectThemesData, renderProjectThemes,
     openThemeModal, saveTheme, deleteTheme,
     renderDeploymentThemePicker, fetchDeploymentThemeIds,
     confirmDeploymentProjectSwitch, syncDeploymentThemes.)
   Version 1.52.0 (Strukturierte Dokumentation für Projekt /
   Termin / Einsatz). Neue jsonb-Spalte `dokumentation` auf den
   drei Tabellen, Daten-Migration: notizen → dokumentation.
   anmerkungen. Pro Entitätstyp ein festes Feld-Schema:
     Projekt:  Kundenherausforderung, Lösungsansatz, Themenwahl,
               Erfolgskriterien, Anmerkungen
     Termin:   Gesprächsinhalt, Vereinbarungen, Nächste Schritte,
               Anmerkungen
     Einsatz:  Durchgeführte Themen, Teilnehmer, Erkenntnisse,
               Folge-Maßnahmen, Anmerkungen
   Im Projekt-Detail (Stammdaten-Tab) als Inline-Edit-Block mit
   Auto-Save on Blur pro Feld; in Termin/Einsatz-Modalen als
   kollabierbarer Bereich, beim Save mit ins Payload. Helfer:
   DOCUMENTATION_SCHEMAS, renderDocumentationBlock,
   readDocumentationFromDom, saveDocumentationFieldInline.
   notizen-Spalte bleibt als historischer Backup erhalten,
   neue Saves schreiben aber nur in `dokumentation`.)
   Version 1.51.0 (Projekt-Templates mit Sub-Items + Aktivitäten-
   Bereich im Projekt-Anlage-Modal).
   - Projekt-Template-Editor bekommt zusätzlichen Block „Standard-
     Aktivitäten": Liste editierbarer Zeilen mit Typ (Termin /
     Aufgabe / Einsatz) · Titel · Werktage-Offset ab Projektstart;
     bei Einsatz zusätzlich Service / Menge / Einzelpreis.
     Speicherort: daten._subitems (Array im JSONB).
   - Beim Anlegen eines Projekts mit Template werden die Sub-Items
     nach erfolgreichem Insert automatisch als echte Datensätze
     erstellt (appointments / tasks / deployments) — Datum =
     Projektstart + Offset Werktage (Sa/So übersprungen). Ohne
     Projektstart bleiben sie datumslos.
   - Projekt-Anlage-Modal bleibt nach erstem Save offen, ein
     Aktivitäten-Bereich erscheint mit drei Quick-Add-Karten
     (Termin / Aufgabe / Einsatz) + Liste der bereits angelegten
     Aktivitäten. Save-Button wird zu „Schließen". Beim Edit-Mode
     unverändert (Modal schließt nach Save wie bisher).
   - Helper: addWerktage(startISO, days), createTemplateSubItems,
     showProjectActivitiesSection, renderProjectModalActivities,
     quickAddProjectActivity. _activeProjectTemplateId trackt das
     gewählte Template über das Modal-Formular hinweg.)
   Version 1.50.0 (Templates für Anlage-Modale).
   Neue Tabelle `templates` (typ · name · daten jsonb · reihenfolge ·
   ist_aktiv) — Admin pflegt unter „Stammdaten → Templates", alle
   authenticated dürfen lesen. Beim Anlegen eines Termins / einer
   Aufgabe / eines Einsatzes / Projekts kann oben im Modal ein
   Template gewählt werden — die hinterlegten Felder werden
   automatisch befüllt (change/input-Events werden gefeuert, damit
   abhängige Logik wie Auto-Berechnungen reagiert). Datumsfelder
   bleiben bewusst leer, der Nutzer füllt sie kontext-spezifisch.
   Modal-IDs nutzen `tpl-*` (kein Konflikt mit Termin-`t-*`).
   TEMPLATE_SCHEMAS pro Typ definiert die templatisierbaren Felder,
   TEMPLATE_FIELD_MAP mappt JSON-Schlüssel auf Modal-DOM-IDs.
   Neue RLS-Policies: select_authenticated + admin_write/update/delete
   PERMISSIVE + only_active_users RESTRICTIVE.)
   Version 1.49.0 (Heute-Tab Aufgaben-Aside auch im Bürotag-Pfad).
   Wenn kein Einsatz für heute ansteht (kein heroMode), wurde der
   Aufgaben-Aside rechts bisher nicht gerendert — der Bereich war
   für den User komplett unsichtbar, auch wenn er Aufgaben hatte.
   Jetzt: scope='heute' bekommt unabhängig vom heroMode den
   .heute-grid-Layout mit heute-aside, der renderHeuteTasksAside
   anzeigt (auch im Empty-State „alles im Griff").)
   Version 1.48.0 (Detail-Header mit Kontaktdaten-Zeile).
   - Firma + Kontakt: Adresse / Telefon / E-Mail / Website (bzw.
     Tel + Mail beim Kontakt) wandern aus der separaten
     „Kontaktdaten"-Karte direkt unter den Titel im Header. Mit
     kleinen Lucide-Icons (Pin/Phone/Mail/Globe) und tel:/mailto:
     /https-Links. Helper renderDetailHeaderMeta + ICON_*_SVG.
   - Sidebar-Spalte (Firma-Stammdaten) von 260 auf 320 px ver-
     breitert, contact-card-sub darf jetzt 2 Zeilen wrappen
     (statt nowrap+ellipsis) — Position+E-Mail bleibt lesbar.
   - Schnellaktionen-Button im Quick-Create-Panel entfernt
     (Firma + Kontakt). Handler-Bindings bleiben defensiv (no-op
     wenn Element fehlt).
   Version 1.47.0 (Detail-Seiten Verdichtung & Hervorhebung).
   - Firma-Detail: Tab-Liste auf 3 reduziert (Stammdaten /
     Projekte / Aktivitäten). Kontakte als Sidebar-Panel über
     Schnell-Anlegen statt eigener Tab. Mitgliedschaften in
     Stammdaten-Dashboard eingegliedert. Termine + Aufgaben +
     Einsätze gestapelt im Aktivitäten-Tab.
   - Wochen-Tab: nur noch Mo–Fr (Wochenende ausgeblendet) +
     KW-Header (ISO 8601) über dem Strip.
   - Projekt-Detail: 4-Spalten-Stat-Row (Status / Wirtschaft-
     lichkeit / Zeitplan / Offene Aufgaben) statt 3-Spalten-
     Orphan. Letzte/Bevorstehend/Team in 3-Spalten-Row,
     Projektdaten-Card komplett ersetzt durch kompakte
     Team-Card (nur Verantwortlich + Hauptkontakt; Umsatz/Daten
     bleiben oben in den Stat-Cards).
   - Card-Titel hervorgehoben (Stat-Label, Info-Card-Title,
     Quick-Create-Title, Contacts-Panel-Title): bold, dunkel,
     farbiger Punkt davor — vorher zu unauffällig.
   - switchDetailTab kennt Aliasse für entfallene Firma-Tabs:
     kontakte/mitgliedschaften → stammdaten,
     termine/aufgaben/einsaetze → aktivitaeten.
   - loadCompanyContacts rendert kompakte Sidebar-Karten
     statt voller Tabelle. ISO-Wochen-Helper isoWeekNumber.)
   Version 1.46.0 (Monat-Tab Rollen-Schärfung — Technik bekommt
   Restmonat-Liste + Pflegerückstand-KPI statt nackt-Geplant;
   Vertrieb bekommt Forecast-KPI (Realisiert + Geplant + gewichtete
   Pipeline 10/30/70/90), Akquise-KPI und neue Mitgliedschaften-
   Sektion (ablaufend ≤60T oder Kontingent ≥80%). Beides-Sicht
   spiegelt Forecast + Mitgliedschaften. Bottom-Grid optional
   3-spaltig via .is-three. Drei neue Queries in loadBriefingData:
   memberships/entitlements/redemptions, plus Pflegerückstand und
   Restmonat clientside aggregiert.)
   Version 1.45.6 (Monat-Tab rollenbasiert: Technik / Vertrieb /
   Beides als Toggle oben rechts. Default je nach Rolle aus
   user_profiles.roles, persistiert in localStorage.
   - Technik-Sicht: Auslastung % · Durchgeführte Einsätze ·
     Geplante Einsätze · Aufgaben offen. Plus Einsatzleistung
     als Balken-Übersicht (Geplant/Durchgeführt/Abgerechnet/
     Storniert) und Top-Einsatztage pro Kunde.
   - Vertrieb-Sicht: Abgerechnet · Geplant · Pipeline · Conversion
     (Termine→Einsatz). Plus Umsatz-Verlauf, Top-Kunden, Pipeline-
     Stages und Akquise-Zähler („X Termine von dir erstellt").
   - Beides-Sicht: kombiniert (Auslastung + Umsatz + Pipeline).
   Daten-Selectoren in loadBriefingData um createdAppointments-
   Count, createdDeploymentsCount, conversionRate, tasksDoneInMonth,
   topCustomerDays erweitert.)
   Version 1.45.5 (Wochen-Items aligned + Datenpflege-Filter:
   1) Wochen-Agenda-Items haben jetzt eine einzelne fixed-width
      Pille (78 px) statt Tag+Status nebeneinander. Damit stehen
      Pills und Titel sauber untereinander aligned.
   2) Firmen-Liste: neuer Filter „Nur unvollständige" + Pill
      „unvollständig" (amber Token-Farben) neben dem Firmennamen.
      Click „Erste Firma öffnen" navigiert zur ersten
      unvollständigen, „Unvollständige Firmen" springt mit
      gesetztem Filter in die Liste.)
   Version 1.45.4 (Heute-Tab — nächste 3 Tage als 3 Cards
   nebeneinander direkt unter den Einsatzkarten. Vorher waren
   sie in einem zugeklappten Akkordeon ganz unten — jetzt sofort
   sichtbar im Hauptbereich, links neben der Aufgaben-Aside.
   Pro Card: Wochentag + Datum, Item-Liste mit Einsätzen (zuerst,
   Status-Border) und Terminen (mit Uhrzeit-Pill). Wochenend-
   Tage leicht eingegraut. Klick auf Item öffnet das jeweilige
   Bearbeiten-Modal.)
   Version 1.45.3 (Polish & Bugs:
   - Datenpflege-Tippfehler: „Firmaen ohne Adresse" → „Firmen
     ohne Adresse" (Singular/Plural-Switch statt Suffix-Konkat).
   - Routing-Alias: /#/mitgliedschafts-programme zeigt jetzt
     ebenfalls die Programme-Seite (vorher 404).
   - Aufgaben-Badge in der Sidebar: präziserer Tooltip
     („X offen, davon Y überfällig") — dokumentiert die
     Badge-Logik klar.)
   Version 1.45.2 (Monat-Tab Datendichte:
   - Erweiterte KPI-Reihe mit 4 Kacheln: Abgerechnet · Geplant ·
     Auslastung % · Pipeline. Pro Kachel 2 px linker Status-
     Token-Border und (für Umsatz-Kacheln) Mini-Sparkline rechts
     unten (30 Tage Umsatz-Verlauf).
   - Auslastungs-Selector: durchgef.+abgerechn. Tage / BW-
     Werktage im Monat.
   - Umsatz-Verlauf-Chart als SVG (kein Chart-Lib): solide
     grüne Linie für realisierten Umsatz bis heute, gestrichelte
     blaue Forecast-Linie ab heute (geplante Einsätze), grau
     gestrichelte Ziel-Linie als Mittel der letzten 3 Monatsumsätze.
   - Top-5-Kunden im Monat aus durchgef.+abgerechn. Einsätzen,
     mit vertikalem Balken proportional zum Top-1, Klick öffnet
     Firmen-Detail.
   - Pipeline-Stages (Lead/Angebot/In Arbeit/Abschlussphase) mit
     Stage-Token-Hintergründen, Klick öffnet Projekt-Liste.
   - Daten-Selectoren in loadBriefingData für Monat: Pipeline-
     Projekte, 30-Tage-Sparkline, Tagesumsatz-Reihe, Top-Kunden,
     Vor-3-Monats-Mittel als Ziel-Default.)
   Version 1.45.1 (Wochen-Tab Wochenstreifen oben:
   - Wochenstreifen mit 7 Tageskarten Mo–So mit farbigem
     Indikator-Balken (geplant=blau, durchgeführt=grün,
     abgerechnet=dunkelgrün, feiertag=amber, frei=grau).
     Pro Karte: Wochentag + Datum, „X T · Y E", Tagessumme.
     Heute mit 1.5 px Info-Border. Sa/So-frei mit 0.5 Opacity.
   - Klick auf Tageskarte scrollt smooth zur Tageszeile in
     der Agenda darunter (mit Highlight-Pulse).
   - Agenda darunter erweitert auf 7 Tage Mo–So (vorher 5).
     Pro Tageszeile rechts oben Tagessumme (Σ €). Feiertage
     werden mit Amber-Akzent markiert. Status-Border am
     Listeneintrag aus den Status-Tokens.
   - Bei < 1280 px Viewport scrollt der Streifen horizontal
     mit Snap.)
   Version 1.45.0 (Heute-Tab Redesign — Datendichte rauf,
   Scroll runter. Statt großer Hero-Blöcke pro Einsatz: 2-
   Spalten-Grid kompakter Karten (~120 px hoch). Pro Karte
   in 3 Zeilen: Type-Pill + Status-Pill, Firma + Untertitel,
   Stadt + Tagessatz × Tage = Gesamt. Genau eine Karte
   bekommt den „Jetzt"-Marker (aktive Stunde im Zeitfenster,
   Fallback erster Geplanter). „Abgerechnet" wird auf 0,7
   Opacity reduziert und der Firmenname durchgestrichen.
   Letzte Zelle ist eine gestrichelte „+ Einsatz hinzufügen"-
   Karte. Die Datenpflege-Card wandert als blaue Insight-
   Pille in die Aufgaben-Sidebar. Vorschau · die nächsten
   3 Tage steht jetzt in einem zugeklappten Akkordeon —
   Header zeigt KPI „X Termine, Y Einsätze ab morgen".
   Begrüßungszeile referenziert nur Vor-Ort-Einsätze ≠
   Abgerechnet (sonst „Heute frei oder bereits abgerechnet").
   Plus globale Status-Farb-Tokens als CSS-Variablen für
   konsistente Skala über alle Tabs.)
   Version 1.44.14 (Aufgaben-Aside breiter und lesbarer:
   - Aside-Spalte 320 → 400 px (Breakpoints angepasst:
     ab 1200 px schrumpft sie auf 340 px, ab 1000 px wird das
     Layout vertikal gestackt).
   - Task-Titel umbricht jetzt auf bis zu 2 Zeilen statt
     abzuschneiden — komplette Aufgaben-Texte sichtbar.
   - Pro Aufgabe größeres Padding + 13 px Schrift statt 12 px.
   - Pro Sektion bis zu 8 Aufgaben statt 5 (mehr Inhalt im
     Blickfeld); „weitere ansehen"-Link bleibt für Rest.)
   Version 1.44.13 (Wochen-Tab umgebaut:
   1) 2-spaltiges Layout wie Heute — Agenda links, Aufgaben-
      Aside rechts (sticky). Wegen kollabierter Aufgaben-Box
      mussten Aufgaben vorher untergehen oder ausgeklappt
      werden — jetzt immer sichtbar parallel zur Agenda.
   2) Agenda-Liste statt Spalten-Strip. Mo–Fr als vertikale
      Cards mit Tag-Header. Pro Tag horizontale Item-Zeilen
      mit Pill (Termin/Einsatz), Status/Uhrzeit, Titel und
      Sub-Zeile (Firma · Ort · ggf. „Tag X/Y" bei Mehrtägigen).
      Lesbarer als die engen 5 Spalten, sobald pro Tag
      mehrere Items anstehen. Klick weiter Inline-Dashboard
      darunter (über bestehenden weekStripToggleExpand).)
   Version 1.44.12 (Dieser-Monat-Tab als Drilldown-Dashboard.
   Statt der bisherigen Briefing-Cards bekommt der Monat-Tab
   ein KPI-Kachel-Grid. Pro Kachel ein klickbarer Drilldown
   in die jeweilige Liste mit gesetztem Filter:
   - Termine im Monat → Termine-Liste, Filter: Range=Monat
   - Geplante/Durchgeführte/Abgerechnete Einsätze → Einsätze-
     Liste mit Range=Monat + entsprechendem Status-Filter
   - Stornierte Einsätze (nur wenn vorhanden)
   - Offene Aufgaben → Aufgaben-Liste, Scope=mine_open
   Plus zwei prominente Umsatz-Kacheln:
   - Geplanter Umsatz (Geplant + Durchgeführt) in Grün
   - Abgerechneter Umsatz in Blau
   navigateTo erweitert um deployments/appointments mit Filter-
   Object (range/status/firma/projekt). Neue Globale
   pendingDeploymentsFilter, ausgewertet beim Listen-Init.)
   Version 1.44.11 (Firma-Combobox + unabhängige Anlage:
   1) Firma-Felder in Termin/Aufgabe/Projekt/Einsatz/Kontakt
      sind jetzt <input list="…"> Combobox — analog zur
      Kontakt-Combobox aus v1.44.10. Plus-Buttons + extra
      Quick-Create-Modal entfernt. Tippt der User einen Namen
      ein, der nicht in der Liste ist, wird die Firma beim
      Speichern automatisch angelegt (nur Name, Rest später).
   2) Kontakt darf jetzt unabhängig von einer Firma angelegt
      werden — Combobox bleibt immer enabled, auch ohne Firma
      gewählt. Beim Anlegen eines neuen Kontakts wird company_id
      auf null gesetzt, falls keine Firma gewählt.
   3) onChange-Handler auf Firma-Select wurden zu input-Events
      auf Firma-Combobox: getCompanyComboboxId() liefert die
      ID nur bei exaktem Match — abhängige Dropdowns (Kontakt,
      Projekt, Adress-Auto-Fill) reagieren erst, wenn der
      Firmen-Name gefunden wurde.)
   Version 1.44.10 (Kontakt-Combobox statt Select+Plus-Modal.
   Bisher: Kontakt-Dropdown + Plus-Button → das Quick-Create-
   Modal öffnete sich „hinter" dem aktiven Modal (z-index-Bug)
   und unterbrach den Flow. Neu: Kontakt-Felder in Termin,
   Aufgabe, Projekt und Mitgliedschaft sind <input list="…">
   Combobox. User tippt → Datalist filtert vorhandene Kontakte
   der gewählten Firma. Beim Speichern:
   - Match in Liste → existierende ID
   - Nicht-leer & nicht in Liste → neuer Kontakt mit Vor+Nach-
     name-Split (erstes Wort = Vorname, Rest = Nachname,
     Fallback „—")
   - Leer → null
   Plus-Buttons + Quick-Create-Kontakt-Modal-Aufrufe entfernt.
   Kein extra Fenster mehr — einfach Namen tippen, Speichern.)
   Version 1.44.9 (Aufgaben-Layout-Anpassung:
   1) Heute-Tab im Hero-Modus jetzt 2-spaltig: Hero-Blöcke
      links, Aufgaben-Aside rechts (sticky). Damit muss man
      nicht runterscrollen, um die offenen Aufgaben zu sehen.
      Aside zeigt Überfällig (rot), Heute fällig, Demnächst —
      jeweils max 5, Klick öffnet das Aufgabe-Bearbeiten-Modal.
   2) Wochen-Tab: Aufgaben-Box standardmäßig zugeklappt
      (<details>) — sonst dominieren die Aufgaben die
      Wochenübersicht. Toggle zeigt Anzahl + Hinweis auf
      Überfällige. Aufgeklappt: alle Wochen-Aufgaben +
      überfällige als kompakte Liste.
   3) Im non-hero-Modus weiterhin die alte Hot-Card im
      Card-Stack — keine Doppelung dank skipHot.)
   Version 1.44.8 (Diese-Woche-Strip Feinjustage:
   1) Sa/So entfernt — Wochen-Strip zeigt nur Mo–Fr (Werktage).
      Geschäftslogik: an Wochenenden finden keine Kunden-
      Termine/Einsätze statt.
   2) Klick auf Pill öffnet jetzt das Inline-Dashboard
      unterhalb der Strip statt das Bearbeiten-Modal — analog
      zum Listen-Inline-Expand. Aktive Pill bekommt einen
      Akzent-Outline. Erneuter Klick schließt. Auf Mobile
      fällt es zurück auf das Modal (Inline-Expand braucht
      Platz).
   Wiederverwendet die existierenden render-Funktionen
   renderDeploymentExpandedRow / renderAppointmentExpandedRow,
   damit die Detail-Ansicht 1:1 dieselbe ist wie in den Listen.)
   Version 1.44.7 (Diese-Woche-Tab als 7-Tage-Strip. Statt der
   bisherigen Briefing-Cards bekommt der Wochen-Tab eine
   Spaltenansicht Mo–So. Pro Tag werden alle Einsätze (zuerst,
   umsatzrelevant) und Termine als kompakte klickbare Pills
   angezeigt. Klick öffnet das jeweilige Bearbeiten-Modal.
   Heute hervorgehoben mit grünem Akzent, Vergangenheit
   abgedimmt, Wochenende leicht eingegraut. Einsatz-Pills
   bekommen die Status-Farbe (geplant=grün, durchgeführt=grau,
   abgerechnet=blau, storniert=rot). Überfällige Aufgaben
   bleiben als Hot-Card oberhalb der Strip stehen, damit sie
   nicht vergessen werden. Mobile: vertikales Stacking.)
   Version 1.44.6 (Zwei UX-Verbesserungen rund um Einsätze:
   1) Hero-Block: mehrere Einsätze am selben Tag werden jetzt
      als eigene Hero-Blöcke untereinander gerendert — vorher
      stand nur „+1 weiterer Einsatz heute" als Kommentar.
      Begründung: jeder Einsatz braucht seine eigene Aktion.
   2) Schnell-Status-Icons in der Hauptliste der Einsätze
      neben dem Bearbeiten-Symbol:
      - Geplant + Datum vergangen/heute → Check-Icon (grün)
        setzt direkt auf Durchgeführt
      - Durchgeführt + Admin → €-Icon (blau) setzt auf
        Abgerechnet. Nicht-Admins sehen das Icon nicht
        (umsatzwirksame Aktion, Admin-only).
      - Abgerechnet → kein Schnellweg.
   renderActionIcons bekommt einen optionalen extraIconsHtml-
   Parameter, neuer Helfer renderDeploymentQuickStatusIcons.)
   Version 1.44.5 (Einsatz-Hero kennt jetzt beide Status-
   Übergänge: Geplant → „Als durchgeführt markieren",
   Durchgeführt → „Als abgerechnet markieren". Bei Abgerechnet
   kein Schnellweg mehr (Korrektur muss bewusst über
   Vollbearbeitung). Beide Helfer triggern auch
   checkAndUpdateProjectStatus, falls der Einsatz zu einem
   Projekt gehört, damit der Auto-Projektstatus synchron
   bleibt.)
   Version 1.44.4 (Heute-Page Aufräumarbeit:
   1) KPI-Bar wandert nach oben rechts neben die Tabs „Heute /
      Diese Woche / Dieser Monat" — Text-only, keine Icons,
      keine Cards. Spart eine ganze Sektion am Listenanfang.
   2) Im Hero-Modus (Einsatz heute): „Sonst heute"-Sektion
      komplett raus. Einsätze-KPI raus (steht prominent im
      Hero), Aufgaben + Überfällig fusioniert: „1 Aufgabe
      (1 überfällig)".
   3) Vorschau-Sortierung: Einsatz immer vor Termin (Einsatz
      ist umsatzrelevant, geht vor).
   4) Vorschau-Pills mit fester Breite (64 px), damit Titel
      sauber untereinander stehen — egal wie lang das Label.)
   Version 1.44.3 (Vorschau-Bereich zeigt jetzt pro Tag die
   konkreten Termine/Einsätze mit Titel, Firma und Ort statt
   nur die Anzahl. Termine vor Einsätzen sortiert, Termine
   nach Uhrzeit. Pro Eintrag ein farbiger Pill-Tag (Termin/
   Einsatz) und Sub-Zeile mit Firma · Ort. Leere Tage
   bleiben als „— frei" erkennbar.)
   Version 1.44.2 (Neuer Aufgaben-Filter „Meine überfälligen"
   im Scope-Dropdown. Briefing-Button „Alle überfälligen
   ansehen" springt jetzt direkt mit gesetztem Filter auf die
   Aufgaben-Seite — vorher wurde nur „Meine offenen" gesetzt
   und der User musste selbst nachfiltern.)
   Version 1.44.1 (Fix Vorschau-Bereich im Heute-Tab. Bisher
   filterte er auf `data.appointments`, aber im Heute-Scope
   wird die Range nur auf heute begrenzt — Treffer für
   `datum > heute` waren immer leer. Neu: dedizierte Queries
   für die nächsten 3 Tage (Termine + Einsätze), Vorschau wird
   nur noch im Heute-Tab gerendert (Woche/Monat haben eigene
   Tabs), leere Tage erscheinen als „— frei", damit man auf
   einen Blick sieht, wo Lücken sind.)
   Version 1.44.0 (Einsatz-Hero im Heute-Dashboard. Wenn an
   einem Tag ein Einsatz ansteht, ersetzt ein prominenter
   Hero-Block oben die KPI-Leiste: großer Firmenname,
   Stat-Grid mit Zeitraum/Tagessatz/Standort/Team, grüner
   Akzent — Begründung: ein Einsatz ist die einzige direkt
   umsatzbringende Tätigkeit und soll an Vor-Ort-Tagen alles
   andere visuell schlagen. KPIs werden kompakter zur
   Einordnung darunter, restliche Briefing-Cards bleiben als
   sekundäre Information. Ohne Einsatz heute: aktuelles
   Layout (Bürotag-Modus, Fokus auf Termine/Aufgaben).
   Status-Hero ändert seinen Akzent (grün = geplant, gelb =
   In Arbeit, grau = durchgeführt). Aktion „Als durchgeführt
   markieren" direkt im Hero ohne Modal-Umweg.)
   Version 1.43.0 (Vier UX-Verbesserungen rund um Datenpflege:
   1) Kalender-Quick-Create-Einsatz: aktueller User wird auto-
   matisch als Techniker eingetragen. 2) Quick-Create-Mini-
   Modale für Firma + Kontakt mit Plus-Button neben jedem
   Firma-/Kontakt-Dropdown in den Anlege-Modals — Firma nur
   mit Name, Kontakt nur mit Vor+Nachname anlegbar, Rest
   später ergänzen. 3) Briefing-Card „Datenpflege" zählt
   unvollständige Datensätze (Firma ohne Adresse+Kontakt,
   Kontakt ohne Telefon+E-Mail+Position). 4) Kalender-Bar
   bekommt „Alle Mitarbeiter"-Option als ersten Eintrag im
   Mitarbeiter-Dropdown — Default bleibt eingeloggter User.)
   Version 1.42.0 (Dein Tag — Briefing-Dashboard als Login-
   Landing. Drei Tabs Heute/Woche/Monat im narrativen Stil:
   Narrativ-Leiste mit regelbasiertem Slot-Filling, KPI-Mini-
   Leiste (Termine/Einsätze/Aufgaben/Überfällig bzw. Umsatz
   beim Monat), Briefing-Cards in vier Tönen (Hot/Opp/Gap/Good)
   sortiert nach Dringlichkeit, Streak-Bar und Vorschau der
   nächsten Tage. Login-Flow geht jetzt auf #/heute. Sidebar-
   Eintrag „Dein Tag" oben über Firmen.
   Phase 1 ohne AI: Briefings sind regelbasiert mit
   Lückenfindern (Tage seit letztem Termin, alte Aufgaben).
   Phase 2 später: Lead/Angebot-Pipeline, Ziele-Konfiguration,
   AI-generierte Narrative.)
   Version 1.41.0 (Programm-Modal Redesign — letzter Modal im
   Preview-Stil. 3-Spalten-Layout: Preview links (Status, Name,
   Preis prominent, Laufzeit, Präfix, Bonis-Anzahl, Beschreibung),
   Stammdaten mittig, Bonis & Kontingente rechts. Live-Update
   der Preview beim Tippen UND beim Hinzufügen/Entfernen von
   Bonus-Zeilen via MutationObserver auf den Benefits-Container.
   Damit ist die Modal-Vereinheitlichung abgeschlossen — alle
   acht Anlege-Modals folgen demselben Layout.)
   Version 1.40.0 (Aufgabe↔Termin-Kopplung + Kalender-Icon
   in Listen-Zeilen.
   Migration: appointments.task_id (FK + Index). Aufgabe-Modal
   bekommt im Footer eine Kopplung-Sektion mit Checkbox „Auch
   als Termin im Kalender eintragen". Sync-Logik analog zur
   Einsatz-Termin-Kopplung: anlegen/aktualisieren/soft-löschen,
   Aufgabe-Status `erledigt` mappt auf Termin-Status
   `durchgefuehrt`. Beim Löschen einer Aufgabe folgt der
   Termin (mit Undo).
   Kalender-Icon: kleines blaues Kalender-Symbol rechts neben
   Titel in allen Aufgaben-Listen (wenn Termin gekoppelt) und
   allen Einsatz-Listen (wenn datum_von gesetzt). Map-Lookup
   task_id → appointment_id pro Listen-Render in einem Query.)
   Version 1.39.0 (Code-Hygiene-Pass: Leichen aus den letzten
   Releases entfernt. Tote Funktionen: terminTypIcon + Emoji-
   Map (ersetzt durch farbige Punkte in v1.37), die zwei
   deprecated Wrapper setAppointmentDateShortcut und
   autoExpandSingleAppointmentRow. Toter CSS-Block: kompletter
   modal-kanban-Bereich (~135 Zeilen), .termin-typ-icon-emoji,
   .termin-title-icon, .benefit-service-hint. Plus drei
   versteckte Aufrufstellen von autoExpandSingleAppointmentRow
   auf die generische autoExpandSingleRow umgestellt. Insgesamt
   ~150 Zeilen toten Code entfernt — keine Funktionsänderung.)
   Version 1.38.2 (Performance-Schritt 2: Hint-Lookup arbeitet
   jetzt auch in Sub-Tabs. data-company-id/contact-id/project-id
   auf allen <tr> der Sub-Tab-Listen (Firma/Kontakt/Projekt-
   Termine, -Einsätze, -Aufgaben). Drei-stufiger Hint-Lookup:
   Listen-Cache → rowEl.dataset → App-State (current*DetailId).
   Dadurch klappen auch Sub-Tab-Inline-Expands auf parallele
   Welle 1 + 2.)
   Version 1.38.1 (Performance: Inline-Expand-Dashboards laden
   spürbar schneller. (1) Skeleton-Card erscheint sofort beim
   Klick statt „Lade …" — gefühlt instant. (2) In-Memory-
   Cache mit 30 s TTL: zweites Aufklappen derselben Zeile ist
   instant; bei Status-Wechseln/Refreshes wird der Cache
   invalidiert. (3) Welle 1 (Hauptobjekt) und Welle 2 (Histo-
   rie / verwandte) feuern jetzt parallel — Hint mit company_id/
   project_id/contact_id kommt aus den bestehenden Listen-
   Caches. Spart bei Einsatz (vorher 6 Roundtrips, davon 5
   sequenziell hinter Welle 1) ca. 30–50 % der Wartezeit beim
   ersten Aufklappen.)
   Version 1.38.0 (Alle übrigen Modals im Preview-Stil:
   Einsatz (1280 px, 3-col mit Footer für Techniker/Kopplung/
   Notizen), Aufgabe (3-col), Firma (3-col: Stammdaten links,
   Adresse+Kontakt rechts), Kontakt (3-col mit Avatar-
   Initialen in der Preview), Projekt (3-col), Mitgliedschaft
   (3-col). Pro Modal ein renderXxxPreview + setupXxxPreview-
   Listeners. Programm-Modal vorerst unverändert — Benefits-
   Liste ist strukturell anders. Keine Emojis in Sektions-
   Headern — SVG-Icons im Sidebar-Stil.)
   Version 1.37.0 (Termin-Modal-Redesign mit Live-Preview:
   3-Spalten-Layout (Preview links, Stammdaten mittig,
   Zugehörigkeiten rechts), 1280 px breit. Linke Preview-
   Card aktualisiert sich live beim Tippen — Typ-Pill mit
   Farbpunkt, Titel, Datum+Uhrzeit, Kontext-KV, Status-Badge.
   Termin-Typ-Emojis in Listen/Kalender/Dashboards ersetzt
   durch farbige Punkte aus lookup_values.farbe. Sektions-
   Header haben jetzt SVG-Icons statt Emojis. Alle Queries,
   die Typ laden, holen jetzt auch farbe.)
   Version 1.36.2 (Kontext-Card im Inline-Expand-Dashboard nutzt
   jetzt die volle Breite: 2-Spalten-Layout mit Primär-Infos
   links (Firma/Leistung/Techniker/Menge/Ort/Notizen) und
   Verwandtem rechts (Projekt-Kontext, Historie, verwandte
   Aufgaben). Schriftgrößen leicht erhöht: erp-kv 13→14 px,
   erp-related 12→13 px.)
   Version 1.36.1 (Stats-Items im Expand-Dashboard strecken
   sich gleichmäßig über die volle Breite — flex: 1 1 130px.)
   Version 1.36.0 (Sidebar-Branding + globale Top-Header-Suche:
   Sidebar-Kopf zeigt jetzt das Cumart-Logo (SVG), darunter
   „Cumart Consulting" (klein, uppercase) und „Cumart CRM",
   getrennt durch eine Trennlinie vom User-Block. Die globale
   Suche wandert aus der Sidebar in einen neuen fixed Top-
   Header, der sich über die volle Breite rechts der Sidebar
   erstreckt — 42 px hohe Suchleiste mit Lupen-Icon, zentriert,
   max 720 px breit, Placeholder „Firmen, Kontakte, Projekte,
   Termine, Einsätze suchen …". Main-Content top-padding auf
   96 px. Mobile unverändert (eigener mobile-header).)
   Version 1.35.3 (Zwei visuelle Fixes: 1) Heute-Ring im
   Kalender wird nicht mehr vom overflow-x des Containers
   abgeschnitten — inset box-shadow statt outset. 2) Inline-
   Expand-Dashboards haben jetzt sauber abgesetzte Cards:
   Panel-Hintergrund leicht grau, Stats/Kontext/Schnell-
   aktionen je in eigener weißer Card mit Border-Radius —
   das wirkte vorher wie „nicht sauber geladen".)
   Version 1.35.2 (Fix: Im Termin-Dashboard „Offene Aufgaben
   (Firma / Kontakt)" wird jetzt auch der Kunden-Name vor
   dem Status angezeigt — vorher nur Status. Kontakt hat
   Vorrang vor Firma, analog zum Aufgabe-Dashboard.)
   Version 1.35.1 (Design-Harmonisierung der Kanban-Modals:
   Sektions-Header (Kanban-Spalten + Footer-Gruppen) teilen
   jetzt dieselbe Typo/Größe, Input-Höhe durchgängig 36 px,
   Icons 14 px, Labels 12 px, Date-Shortcut- und Typ-Icon-
   Buttons 26 px. Symmetrie zwischen den drei Modals.)
   Version 1.35.0 (Modal-Redesign im Kanban-Stil: Termin-,
   Einsatz- und Aufgabe-Modals sind jetzt breite Mehr-Spalten-
   Layouts (links nach rechts durch den Formularfluss) mit
   Icon-Headern pro Spalte. Termin 3 Spalten (Was/Wann/Wer&Wo),
   Aufgabe 3 Spalten (Was/Wann&Wer/Kontext), Einsatz 4 Spalten
   (Kunde/Leistung/Zeitraum/Team). Modal-Breiten auf 960 bzw.
   1140 px erhöht. Sekundäre Bereiche (Notizen, Kopplung,
   Beschreibung) wandern in einen Footer-Bereich unter dem
   Kanban — Kopplung bleibt offen, Notizen/Beschreibung
   standardmäßig kollabiert. Mobile: Spalten stapeln vertikal.
   Alle Feld-IDs und Handler unverändert.)
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

// Selected Techniker IDs im Einsatz-Modal — Set wird beim Modal-Open neu befüllt
// und beim saveDeployment ausgewertet (Persistierung in deployment_technicians-Tabelle).
let selectedTechnikerIds = new Set();

// Map: companyId → { next: {datum, titel, id} | null, last: {datum, titel, id} | null }
let companyAppointmentMap = {};

// Pending filter für Termine, kommt aus URL-Hash-Parametern
let pendingAppointmentsFilter = null;
let pendingDeploymentsFilter = null;

// Pending filter für Aufgaben (z.B. #/aufgaben?firma=…&scope=all_open)
let pendingTasksFilter = null;
let pendingCompaniesFilter = null;
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
const ICON_CHECK = '<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
const ICON_BILLED = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700" stroke="none" fill="currentColor">€</text></svg>';

/**
 * Rendert die Standard-Aktionen für Listen-Zeilen (v1.20.0):
 * Bearbeiten als Hover-sichtbares Primär-Icon + Kebab-Menü für sekundäre
 * Aktionen (Kopieren / Duplizieren / Löschen).
 */
function renderActionIcons(entityType, id, extraIconsHtml = '') {
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
      ${extraIconsHtml}
      <button class="icon-btn" ${editHandler} title="Bearbeiten">${ICON_EDIT}</button>
      <button class="icon-btn kebab-btn" onclick="openKebabMenu('${entityType}', '${esc(id)}', this, event)" title="Weitere Aktionen">${ICON_KEBAB}</button>
    </div>`;
}

/** v1.44.6: Schnell-Status-Icons für Einsatz-Listen.
 *  - Geplant + Datum vergangen oder heute: Check-Icon → setzt auf Durchgeführt
 *  - Durchgeführt + Admin: €-Icon → setzt auf Abgerechnet
 *  Begründung: Sequenz Geplant → Durchgeführt ist Aufwand-Tracking, darf
 *  jeder. Durchgeführt → Abgerechnet ist umsatzwirksam — nur Admin. */
function renderDeploymentQuickStatusIcons(d) {
  const todayISO = toISODate(new Date());
  const html = [];
  if (d.status === 'Geplant' && d.datum_von && d.datum_von <= todayISO) {
    html.push(`<button class="icon-btn icon-btn-success" onclick="quickDeploymentMarkDone('${esc(d.id)}')" title="Als durchgeführt markieren">${ICON_CHECK}</button>`);
  } else if (d.status === 'Durchgeführt' && isAdmin()) {
    html.push(`<button class="icon-btn icon-btn-billed" onclick="quickDeploymentMarkBilled('${esc(d.id)}')" title="Als abgerechnet markieren">${ICON_BILLED}</button>`);
  }
  return html.join('');
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

/** Kleines Kalender-Indikator-Icon (v1.40) für Listen-Zeilen — zeigt an, dass
 *  der Eintrag im Mitarbeiter-Kalender erscheint. */
const ROW_CAL_ICON = `<span class="row-calendar-indicator" title="Im Kalender sichtbar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>`;

/** Lädt eine Map task_id → appointment_id für eine Liste von task-IDs (v1.40).
 *  Wird vor dem Render von Aufgaben-Listen aufgerufen, damit das Kalender-Icon
 *  in jeder Zeile gezeigt werden kann. */
async function loadLinkedAppointmentMap(taskIds) {
  if (!Array.isArray(taskIds) || taskIds.length === 0) return new Map();
  const { data } = await db.from('appointments')
    .select('id, task_id').is('deleted_at', null)
    .in('task_id', taskIds).not('task_id', 'is', null);
  const map = new Map();
  (data || []).forEach(a => { if (a.task_id) map.set(a.task_id, a.id); });
  return map;
}

/** Gibt das HTML-Snippet für einen Termin-Typ-Dot zurück (farbig aus lookup_values.farbe).
 *  Ersetzt die v1.34-Emoji-Implementierung ab v1.37. */
function terminTypDotHtml(typ) {
  const farbe = typ?.farbe;
  const wert  = typ?.wert || '';
  if (!farbe) {
    return `<span class="termin-type-dot termin-type-dot-muted" title="${esc(wert)}"></span>`;
  }
  return `<span class="termin-type-dot" style="background:${esc(farbe)}" title="${esc(wert)}"></span>`;
}

/** Füllt den Icon-Picker im Termin-Modal mit Buttons pro Typ (v1.34, farbige Dots v1.37). */
function renderTerminTypIconsPicker() {
  const container = document.getElementById('t-typ-icons');
  const select = document.getElementById('t-typ');
  if (!container || !select) return;
  container.innerHTML = terminTypenCache
    .filter(t => t.ist_aktiv !== false)
    .map(t => {
      const farbe = t.farbe || '#9ca3af';
      return `
        <button type="button" class="termin-typ-icon-btn" data-typ-id="${esc(t.id)}"
                onclick="selectTerminTypIcon('${esc(t.id)}')">
          <span class="termin-type-dot" style="background:${esc(farbe)}"></span>
          ${esc(t.wert)}
        </button>`;
    }).join('');
  updateTerminTypIconSelection();
  select.onchange = () => { updateTerminTypIconSelection(); renderAppointmentPreview(); };
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

/** Live-Preview im Termin-Modal (v1.37). Liest alle Feldwerte und rendert
 *  eine Vorschau-Karte, wie der Termin später in Listen/Kalendern erscheint. */
function renderAppointmentPreview() {
  const el = document.getElementById('t-preview');
  if (!el) return;

  const titelVal = document.getElementById('t-titel').value.trim();
  const datumVal = document.getElementById('t-datum').value;
  const uhrzeitVon = document.getElementById('t-uhrzeit-von').value;
  const uhrzeitBis = document.getElementById('t-uhrzeit-bis').value;
  const typId = document.getElementById('t-typ').value;
  const statusVal = document.getElementById('t-status').value;
  // t-company ist seit v1.44.11 eine Combobox — ID nur bei exaktem Match,
  // sonst leer (neue Firma wird beim Save angelegt).
  const companyId = getCompanyComboboxId('t-company', 't-company-list');
  // t-contact ist seit v1.44.10 ein Combobox-<input>
  const contactInput = document.getElementById('t-contact');
  const contactName = (contactInput?.value || '').trim();
  const projectSelect = document.getElementById('t-project');
  const projectName = projectSelect.value ? (projectSelect.options[projectSelect.selectedIndex]?.textContent || '') : '';
  const ortVal = document.getElementById('t-ort').value.trim();
  const ganztag = document.getElementById('t-ganztag')?.checked;

  const typ = terminTypenCache.find(t => t.id === typId);
  const company = companiesCache.find(c => c.id === companyId);

  // Typ-Pill
  const typPillHtml = typ
    ? `<div class="preview-type-pill">${terminTypDotHtml(typ)}<span>${esc(typ.wert)}</span></div>`
    : `<div class="preview-type-pill"><span class="preview-type-dot preview-type-dot-muted"></span><span style="color:var(--muted)">— Typ wählen —</span></div>`;

  // Titel
  const titelHtml = titelVal
    ? `<div class="preview-title">${esc(titelVal)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neuer Termin</div>`;

  // Zeit-Zeile
  let timeStr = '';
  if (datumVal) {
    timeStr = formatDateDE(datumVal);
    if (ganztag) {
      timeStr += ' · Ganztag';
    } else if (uhrzeitVon) {
      timeStr += ' · ' + uhrzeitVon.substring(0, 5);
      if (uhrzeitBis) timeStr += '–' + uhrzeitBis.substring(0, 5);
    }
  }
  const timeHtml = timeStr
    ? `<div class="preview-time">${esc(timeStr)}</div>`
    : `<div class="preview-time preview-time-muted">— Datum wählen —</div>`;

  // Kontext-KV
  const kvRows = [];
  if (company) kvRows.push(['Firma',   esc(company.name)]);
  if (contactName) kvRows.push(['Kontakt', esc(contactName)]);
  if (projectName && projectSelect.value) kvRows.push(['Projekt', esc(projectName)]);
  if (ortVal)  kvRows.push(['Ort', esc(ortVal)]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : `<div class="preview-kv-value-muted" style="font-size:12px">Keine Zuordnung gewählt.</div>`;

  // Status-Badge
  const statusHtml = `
    <div class="preview-status-wrap">
      <span class="badge" style="background:${appointmentStatusBg(statusVal)};color:${appointmentStatusColor(statusVal)}">
        ${esc(appointmentStatusLabel(statusVal))}
      </span>
    </div>`;

  el.innerHTML = `
    ${typPillHtml}
    ${titelHtml}
    ${timeHtml}
    ${kvHtml}
    ${statusHtml}
  `;
}

/** Bindet Live-Listener einmalig an alle Termin-Modal-Felder, damit die Preview
 *  beim Tippen/Ändern aktualisiert wird. Idempotent via dataset-Flag. */
function setupAppointmentPreviewListeners() {
  const modal = document.getElementById('modal-appointment');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['t-titel','t-datum','t-uhrzeit-von','t-uhrzeit-bis','t-typ','t-status',
               't-company','t-contact','t-project','t-ort','t-ganztag'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderAppointmentPreview);
    el.addEventListener('change', renderAppointmentPreview);
  });
  modal.dataset.previewWired = '1';
}

// ── EINSATZ-PREVIEW (v1.38.0) ──

/** Live-Preview im Einsatz-Modal. */
function renderDeploymentPreview() {
  const el = document.getElementById('d-preview');
  if (!el) return;

  const titelVal = document.getElementById('d-titel').value.trim();
  const statusVal = document.getElementById('d-status').value;
  // d-company ist seit v1.44.11 eine Combobox
  const companyId = getCompanyComboboxId('d-company', 'd-company-list');
  const company = companiesCache.find(c => c.id === companyId);
  const projectSelect = document.getElementById('d-project');
  const projectName = projectSelect.value ? (projectSelect.options[projectSelect.selectedIndex]?.textContent || '') : '';
  const serviceSelect = document.getElementById('d-service');
  const serviceName = serviceSelect.value ? (serviceSelect.options[serviceSelect.selectedIndex]?.textContent.split(' (')[0] || '') : '';
  const menge = Number(document.getElementById('d-menge').value) || 0;
  const einzelpreis = Number(document.getElementById('d-einzelpreis').value) || 0;
  const gesamt = menge * einzelpreis;
  const datumVon = document.getElementById('d-datum-von').value;
  const datumBis = document.getElementById('d-datum-bis').value;
  const uhrzeitVon = document.getElementById('d-uhrzeit-von').value;
  const uhrzeitBis = document.getElementById('d-uhrzeit-bis').value;
  const ganztag = document.getElementById('d-ganztag')?.checked;
  const ortVal = document.getElementById('d-ort').value.trim();
  const externe = document.getElementById('d-externe-techniker').value.trim();

  // Status-Pill
  const statusColor = einsatzStatusFarbe(statusVal);
  const statusPill = `<span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(statusVal || '—')}</span>`;

  // Titel (mit Auto-Generierung wenn leer)
  const titelDisplay = titelVal || (serviceName && company?.name
    ? `${serviceName} × ${company.name}${currentProfile?.name ? ' × ' + currentProfile.name : ''}`
    : '');
  const titelHtml = titelDisplay
    ? `<div class="preview-title">${esc(titelDisplay)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neuer Einsatz</div>`;

  // Datum / Zeit
  let timeStr = '';
  if (datumVon) {
    timeStr = formatDateDE(datumVon);
    if (datumBis && datumBis !== datumVon) timeStr += ' – ' + formatDateDE(datumBis);
    if (ganztag) timeStr += ' · Ganztag';
    else if (uhrzeitVon) timeStr += ' · ' + uhrzeitVon.substring(0, 5) + (uhrzeitBis ? '–' + uhrzeitBis.substring(0, 5) : '');
  } else {
    timeStr = '— Ungeplant —';
  }
  const timeHtml = datumVon
    ? `<div class="preview-time">${esc(timeStr)}</div>`
    : `<div class="preview-time preview-time-muted">${esc(timeStr)}</div>`;

  // Summe (prominent)
  const summeHtml = gesamt > 0
    ? `<div style="font-size:20px;font-weight:600;color:var(--text);margin:4px 0">${esc(formatPreis(gesamt))}</div>
       <div style="font-size:12px;color:var(--muted);margin-top:-4px">${menge} × ${esc(formatPreis(einzelpreis))}</div>`
    : `<div class="preview-time-muted" style="font-size:13px">— Menge × Preis —</div>`;

  // Techniker-Chips
  const technikerNames = [...selectedTechnikerIds]
    .map(id => userProfilesCache.find(u => u.id === id)?.name)
    .filter(Boolean);
  if (externe) technikerNames.push(externe + ' (extern)');
  const technikerHtml = technikerNames.length
    ? `<div style="font-size:11px;color:var(--muted);margin-top:4px">Team: ${technikerNames.map(n => esc(n)).join(' · ')}</div>`
    : '';

  // Kontext-KV
  const kvRows = [];
  if (company) kvRows.push(['Firma', esc(company.name)]);
  if (serviceName) kvRows.push(['Leistung', esc(serviceName)]);
  if (projectName && projectSelect.value) kvRows.push(['Projekt', esc(projectName)]);
  if (ortVal) kvRows.push(['Ort', esc(ortVal)]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : '';

  el.innerHTML = `
    <div>${statusPill}</div>
    ${titelHtml}
    ${timeHtml}
    ${summeHtml}
    ${kvHtml}
    ${technikerHtml}
  `;
}

function setupDeploymentPreviewListeners() {
  const modal = document.getElementById('modal-deployment');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['d-titel','d-datum-von','d-datum-bis','d-uhrzeit-von','d-uhrzeit-bis',
               'd-status','d-company','d-project','d-service','d-menge','d-einzelpreis',
               'd-ort','d-ganztag','d-externe-techniker'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderDeploymentPreview);
    el.addEventListener('change', renderDeploymentPreview);
  });
  modal.dataset.previewWired = '1';
}

// ── AUFGABE-PREVIEW (v1.38.0) ──

function renderTaskPreview() {
  const el = document.getElementById('a-preview');
  if (!el) return;

  const titelVal = document.getElementById('a-titel').value.trim();
  const statusVal = document.getElementById('a-status').value;
  const faelligkeit = document.getElementById('a-faelligkeit').value;
  const assigneeSelect = document.getElementById('a-assigned-to');
  const assigneeName = assigneeSelect.value ? (assigneeSelect.options[assigneeSelect.selectedIndex]?.textContent || '') : '';
  const beschreibung = document.getElementById('a-beschreibung').value.trim();
  // a-company ist seit v1.44.11 eine Combobox
  const companyId = getCompanyComboboxId('a-company', 'a-company-list');
  const company = companiesCache.find(c => c.id === companyId);
  // a-contact ist seit v1.44.10 ein Combobox-<input>
  const contactInput = document.getElementById('a-contact');
  const contactName = (contactInput?.value || '').trim();
  const projectSelect = document.getElementById('a-project');
  const projectName = projectSelect.value ? (projectSelect.options[projectSelect.selectedIndex]?.textContent || '') : '';

  const todayISO = toISODate(new Date());

  // Status-Pill
  const statusPill = `<span class="badge" style="background:${aufgabeStatusBg(statusVal)};color:${aufgabeStatusColor(statusVal)}">${esc(aufgabeStatusLabel(statusVal) || '—')}</span>`;

  // Titel
  const titelHtml = titelVal
    ? `<div class="preview-title">${esc(titelVal)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neue Aufgabe</div>`;

  // Fälligkeit
  let faelligkeitStr = '';
  if (faelligkeit) {
    const days = Math.round((new Date(faelligkeit) - new Date(todayISO)) / 86400000);
    faelligkeitStr = formatDateDE(faelligkeit);
    if (statusVal !== 'erledigt') {
      if (days < 0) faelligkeitStr += ` · ${Math.abs(days)} Tag${Math.abs(days) === 1 ? '' : 'e'} überfällig`;
      else if (days === 0) faelligkeitStr += ' · heute';
      else faelligkeitStr += ` · in ${days} Tag${days === 1 ? '' : 'en'}`;
    }
  }
  const faelligkeitHtml = faelligkeitStr
    ? `<div class="preview-time">${esc(faelligkeitStr)}</div>`
    : `<div class="preview-time preview-time-muted">— Keine Fälligkeit —</div>`;

  // Kontext-KV
  const kvRows = [];
  if (assigneeName) kvRows.push(['Zuständig', esc(assigneeName) + (assigneeSelect.value === currentProfile?.id ? ' <span style="color:var(--success);font-size:11px">(mir)</span>' : '')]);
  if (company) kvRows.push(['Firma', esc(company.name)]);
  if (contactName) kvRows.push(['Kontakt', esc(contactName)]);
  if (projectName && projectSelect.value) kvRows.push(['Projekt', esc(projectName)]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : '';

  // Beschreibung-Auszug
  const beschreibungHtml = beschreibung
    ? `<div style="font-size:12px;color:var(--muted);white-space:pre-wrap;max-height:80px;overflow:hidden;line-height:1.4">${esc(beschreibung.slice(0, 180))}${beschreibung.length > 180 ? '…' : ''}</div>`
    : '';

  el.innerHTML = `
    <div>${statusPill}</div>
    ${titelHtml}
    ${faelligkeitHtml}
    ${kvHtml}
    ${beschreibungHtml}
  `;
}

function setupTaskPreviewListeners() {
  const modal = document.getElementById('modal-aufgabe');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['a-titel','a-faelligkeit','a-status','a-assigned-to','a-beschreibung',
               'a-company','a-contact','a-project'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderTaskPreview);
    el.addEventListener('change', renderTaskPreview);
  });
  modal.dataset.previewWired = '1';
}

// ── FIRMA-PREVIEW (v1.38.0) ──
function renderCompanyPreview() {
  const el = document.getElementById('c-preview');
  if (!el) return;

  const name    = document.getElementById('c-name').value.trim();
  const typ     = document.getElementById('c-typ');
  const typName = typ.value ? (typ.options[typ.selectedIndex]?.textContent || '') : '';
  const branche = document.getElementById('c-branche').value.trim();
  const abc     = document.getElementById('c-abc').value;
  const strasse = document.getElementById('c-strasse').value.trim();
  const plz     = document.getElementById('c-plz').value.trim();
  const stadt   = document.getElementById('c-stadt').value.trim();
  const land    = document.getElementById('c-land').value.trim();
  const telefon = document.getElementById('c-telefon').value.trim();
  const email   = document.getElementById('c-email').value.trim();
  const website = document.getElementById('c-website').value.trim();

  // ABC-Badge + Typ-Pill
  let topHtml = '';
  if (abc) {
    topHtml += `<span class="abc-badge abc-badge-${esc(abc)}" style="width:28px;height:28px;font-size:13px;display:inline-flex;align-items:center;justify-content:center">${esc(abc)}</span>`;
  }
  if (typName) {
    topHtml += `<span class="badge" style="background:var(--bg);color:var(--text);margin-left:${abc ? '8px' : '0'}">${esc(typName)}</span>`;
  }
  const topWrap = topHtml
    ? `<div style="display:flex;align-items:center">${topHtml}</div>`
    : '';

  // Name
  const nameHtml = name
    ? `<div class="preview-title">${esc(name)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neue Firma</div>`;

  // Branche
  const brancheHtml = branche ? `<div class="preview-time">${esc(branche)}</div>` : '';

  // Adresse
  const adrLines = [];
  if (strasse) adrLines.push(esc(strasse));
  const plzStadt = [plz, stadt].filter(Boolean).join(' ');
  if (plzStadt) adrLines.push(esc(plzStadt));
  if (land && land !== 'Deutschland') adrLines.push(esc(land));
  const adrHtml = adrLines.length
    ? `<div style="font-size:13px;color:var(--text);line-height:1.4">${adrLines.join('<br>')}</div>`
    : `<div class="preview-kv-value-muted" style="font-size:12px">— Keine Adresse —</div>`;

  // Kontakt-Zeilen
  const kvRows = [];
  if (telefon) kvRows.push(['Telefon', esc(telefon)]);
  if (email)   kvRows.push(['E-Mail',  esc(email)]);
  if (website) kvRows.push(['Website', esc(website)]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : '';

  el.innerHTML = `
    ${topWrap}
    ${nameHtml}
    ${brancheHtml}
    ${adrHtml}
    ${kvHtml}
  `;
}

function setupCompanyPreviewListeners() {
  const modal = document.getElementById('modal-company');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['c-name','c-typ','c-branche','c-abc','c-strasse','c-plz','c-stadt','c-land',
               'c-telefon','c-email','c-website'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderCompanyPreview);
    el.addEventListener('change', renderCompanyPreview);
  });
  modal.dataset.previewWired = '1';
}

// ── KONTAKT-PREVIEW (v1.38.0) ──
function renderContactPreview() {
  const el = document.getElementById('k-preview');
  if (!el) return;

  const vorname  = document.getElementById('k-vorname').value.trim();
  const nachname = document.getElementById('k-nachname').value.trim();
  const position = document.getElementById('k-position').value.trim();
  // k-company ist seit v1.44.11 eine Combobox
  const companyInput = document.getElementById('k-company');
  const companyName  = (companyInput?.value || '').trim();
  const telefon  = document.getElementById('k-telefon').value.trim();
  const email    = document.getElementById('k-email').value.trim();

  // Avatar mit Initialen
  const fullName = [vorname, nachname].filter(Boolean).join(' ');
  const initials = [vorname, nachname].filter(Boolean).map(s => s.charAt(0).toUpperCase()).join('') || '?';
  const avatarHtml = `
    <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600">${esc(initials)}</div>`;

  const nameHtml = fullName
    ? `<div class="preview-title">${esc(fullName)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neuer Kontakt</div>`;

  const positionHtml = position ? `<div class="preview-time">${esc(position)}</div>` : '';

  const kvRows = [];
  if (companyName) kvRows.push(['Firma', esc(companyName)]);
  if (telefon) kvRows.push(['Telefon', esc(telefon)]);
  if (email)   kvRows.push(['E-Mail',  esc(email)]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : '';

  el.innerHTML = `
    ${avatarHtml}
    ${nameHtml}
    ${positionHtml}
    ${kvHtml}
  `;
}

function setupContactPreviewListeners() {
  const modal = document.getElementById('modal-contact');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['k-vorname','k-nachname','k-position','k-company','k-telefon','k-email'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderContactPreview);
    el.addEventListener('change', renderContactPreview);
  });
  modal.dataset.previewWired = '1';
}

// ── PROJEKT-PREVIEW (v1.38.0) ──
function renderProjectPreview() {
  const el = document.getElementById('p-preview');
  if (!el) return;

  const name       = document.getElementById('p-name').value.trim();
  const status     = document.getElementById('p-status').value;
  const umsatz     = Number(document.getElementById('p-umsatz').value) || 0;
  const startdatum = document.getElementById('p-startdatum').value;
  const enddatum   = document.getElementById('p-enddatum').value;
  // p-company ist seit v1.44.11 eine Combobox
  const companyInput = document.getElementById('p-company');
  const companyName  = (companyInput?.value || '').trim();
  // p-hauptkontakt ist seit v1.44.10 ein Combobox-<input> — der Wert ist
  // direkt der Anzeigename, kein Mapping über options nötig.
  const kontaktInput = document.getElementById('p-hauptkontakt');
  const kontaktName  = (kontaktInput?.value || '').trim();
  const verantwSelect = document.getElementById('p-verantwortlicher');
  const verantwName   = verantwSelect.value ? (verantwSelect.options[verantwSelect.selectedIndex]?.textContent || '') : '';
  const beschreibung  = document.getElementById('p-beschreibung').value.trim();

  const statusColor = projektStatusFarbe(status);
  const statusPill = status
    ? `<span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(status)}</span>`
    : '';

  const nameHtml = name
    ? `<div class="preview-title">${esc(name)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neues Projekt</div>`;

  // Zeitraum
  let zeitStr = '';
  if (startdatum && enddatum) zeitStr = `${formatDateDE(startdatum)} – ${formatDateDE(enddatum)}`;
  else if (startdatum) zeitStr = `ab ${formatDateDE(startdatum)}`;
  else if (enddatum)   zeitStr = `bis ${formatDateDE(enddatum)}`;
  const zeitHtml = zeitStr
    ? `<div class="preview-time">${esc(zeitStr)}</div>`
    : '';

  // Umsatz prominent
  const umsatzHtml = umsatz > 0
    ? `<div style="font-size:20px;font-weight:600;color:var(--text);margin:4px 0">${esc(formatPreis(umsatz))}</div>
       <div style="font-size:11px;color:var(--muted);margin-top:-4px">Geschätzter Umsatz</div>`
    : '';

  const kvRows = [];
  if (companyName) kvRows.push(['Firma', esc(companyName)]);
  if (kontaktName) kvRows.push(['Kontakt', esc(kontaktName)]);
  if (verantwName && verantwSelect.value) kvRows.push(['Verantw.', esc(verantwName)]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : '';

  const beschreibungHtml = beschreibung
    ? `<div style="font-size:12px;color:var(--muted);white-space:pre-wrap;max-height:80px;overflow:hidden;line-height:1.4">${esc(beschreibung.slice(0, 180))}${beschreibung.length > 180 ? '…' : ''}</div>`
    : '';

  el.innerHTML = `
    ${statusPill ? `<div>${statusPill}</div>` : ''}
    ${nameHtml}
    ${zeitHtml}
    ${umsatzHtml}
    ${kvHtml}
    ${beschreibungHtml}
  `;
}

function setupProjectPreviewListeners() {
  const modal = document.getElementById('modal-project');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['p-name','p-status','p-umsatz','p-startdatum','p-enddatum',
               'p-company','p-hauptkontakt','p-verantwortlicher','p-beschreibung'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderProjectPreview);
    el.addEventListener('change', renderProjectPreview);
  });
  modal.dataset.previewWired = '1';
}

// ── MITGLIEDSCHAFT-PREVIEW (v1.38.0) ──
function renderMembershipPreview() {
  const el = document.getElementById('ms-preview');
  if (!el) return;

  const programSelect = document.getElementById('ms-program');
  const programName   = programSelect.value ? (programSelect.options[programSelect.selectedIndex]?.textContent || '') : '';
  const start   = document.getElementById('ms-start').value;
  const ende    = document.getElementById('ms-end').value;
  const nummer  = document.getElementById('ms-nummer').value.trim();
  const preis   = Number(document.getElementById('ms-preis').value) || 0;
  const status  = document.getElementById('ms-status').value;
  // ms-hauptkontakt ist seit v1.44.10 ein Combobox-<input>
  const kontaktInput = document.getElementById('ms-hauptkontakt');
  const kontaktName  = (kontaktInput?.value || '').trim();
  const verantwSelect = document.getElementById('ms-verantwortlicher');
  const verantwName   = verantwSelect.value ? (verantwSelect.options[verantwSelect.selectedIndex]?.textContent || '') : '';

  const statusMap = {
    aktiv:     { bg: '#dcfce7', color: '#166534', label: 'Aktiv' },
    pausiert:  { bg: '#fef3c7', color: '#854d0e', label: 'Pausiert' },
    beendet:   { bg: '#f3f4f6', color: '#6b7280', label: 'Beendet' }
  };
  const s = statusMap[status] || statusMap.aktiv;
  const statusPill = `<span class="badge" style="background:${s.bg};color:${s.color}">${s.label}</span>`;

  const nameHtml = programName
    ? `<div class="preview-title">${esc(programName)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neue Mitgliedschaft</div>`;

  // Laufzeit
  let zeitStr = '';
  if (start && ende) zeitStr = `${formatDateDE(start)} – ${formatDateDE(ende)}`;
  else if (start)    zeitStr = `ab ${formatDateDE(start)}`;
  const zeitHtml = zeitStr ? `<div class="preview-time">${esc(zeitStr)}</div>` : '';

  // Preis prominent
  const preisHtml = preis > 0
    ? `<div style="font-size:20px;font-weight:600;color:var(--text);margin:4px 0">${esc(formatPreis(preis))}</div>`
    : '';

  const kvRows = [];
  if (nummer) kvRows.push(['Nummer', esc(nummer)]);
  if (kontaktName) kvRows.push(['Kontakt', esc(kontaktName)]);
  if (verantwName && verantwSelect.value) kvRows.push(['Verantw.', esc(verantwName)]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : '';

  el.innerHTML = `
    <div>${statusPill}</div>
    ${nameHtml}
    ${zeitHtml}
    ${preisHtml}
    ${kvHtml}
  `;
}

function setupMembershipPreviewListeners() {
  const modal = document.getElementById('modal-membership');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['ms-program','ms-start','ms-end','ms-nummer','ms-preis','ms-status',
               'ms-hauptkontakt','ms-verantwortlicher'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderMembershipPreview);
    el.addEventListener('change', renderMembershipPreview);
  });
  modal.dataset.previewWired = '1';
}

// ── PROGRAMM-PREVIEW (v1.41.0) ──
function renderProgramPreview() {
  const el = document.getElementById('pr-preview');
  if (!el) return;

  const name        = document.getElementById('pr-name').value.trim();
  const laufzeit    = Number(document.getElementById('pr-laufzeit').value) || 0;
  const preis       = Number(document.getElementById('pr-preis').value) || 0;
  const praefix     = document.getElementById('pr-praefix').value.trim();
  const aktiv       = document.getElementById('pr-aktiv').value === 'true';
  const beschreibung = document.getElementById('pr-beschreibung').value.trim();

  // Bonis aus dem dynamischen Container zählen
  const benefitsContainer = document.getElementById('pr-benefits-container');
  const benefitRows = benefitsContainer ? benefitsContainer.querySelectorAll('.benefit-row') : [];
  const benefitCount = benefitRows.length;

  // Status-Pill
  const statusPill = aktiv
    ? `<span class="badge" style="background:#dcfce7;color:#166534">Aktiv</span>`
    : `<span class="badge" style="background:#f3f4f6;color:#6b7280">Archiviert</span>`;

  // Name
  const nameHtml = name
    ? `<div class="preview-title">${esc(name)}</div>`
    : `<div class="preview-title preview-title-placeholder">Neues Programm</div>`;

  // Preis prominent
  const preisHtml = preis > 0
    ? `<div style="font-size:20px;font-weight:600;color:var(--text);margin:4px 0">${esc(formatPreis(preis))}</div>
       <div style="font-size:11px;color:var(--muted);margin-top:-4px">pro Laufzeit</div>`
    : '';

  // Kontext-KV
  const kvRows = [];
  if (laufzeit > 0) kvRows.push(['Laufzeit', `${laufzeit} Monat${laufzeit === 1 ? '' : 'e'}`]);
  if (praefix) kvRows.push(['Präfix', esc(praefix)]);
  kvRows.push(['Bonis', `${benefitCount} hinterlegt`]);
  const kvHtml = kvRows.length
    ? `<div class="preview-kv">${kvRows.map(([l, v]) => `<div class="preview-kv-label">${l}</div><div class="preview-kv-value">${v}</div>`).join('')}</div>`
    : '';

  const beschreibungHtml = beschreibung
    ? `<div style="font-size:12px;color:var(--muted);white-space:pre-wrap;max-height:80px;overflow:hidden;line-height:1.4">${esc(beschreibung.slice(0, 180))}${beschreibung.length > 180 ? '…' : ''}</div>`
    : '';

  el.innerHTML = `
    <div>${statusPill}</div>
    ${nameHtml}
    ${preisHtml}
    ${kvHtml}
    ${beschreibungHtml}
  `;
}

function setupProgramPreviewListeners() {
  const modal = document.getElementById('modal-program');
  if (!modal || modal.dataset.previewWired === '1') return;
  const ids = ['pr-name','pr-laufzeit','pr-preis','pr-praefix','pr-aktiv','pr-beschreibung'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', renderProgramPreview);
    el.addEventListener('change', renderProgramPreview);
  });
  // Benefits-Container: bei Änderungen (Add/Remove/Edit) Preview aktualisieren
  const benefitsContainer = document.getElementById('pr-benefits-container');
  if (benefitsContainer) {
    benefitsContainer.addEventListener('input', renderProgramPreview);
    benefitsContainer.addEventListener('change', renderProgramPreview);
    // MutationObserver für Add/Remove von Bonus-Zeilen
    const obs = new MutationObserver(renderProgramPreview);
    obs.observe(benefitsContainer, { childList: true });
  }
  modal.dataset.previewWired = '1';
}

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item:not(.nav-item-group)').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name)?.classList.add('active');

  const navBtn = document.getElementById('nav-' + name);
  if (navBtn) navBtn.classList.add('active');

  // v2.0.0 — Top-Nav-Tab-Activation + Listen-Sub-Nav
  setActiveTopNavTab(name);
  updateListenTabBar(name);

  setMobileNav(name);

  if (name === 'users') loadUsers();
  if (name === 'services') loadServices();
  if (name === 'lookups') loadLookupsPage();
  if (name === 'programs') loadPrograms();
  if (name === 'templates') loadTemplates();
  if (name === 'companies') loadCompanies();
  if (name === 'contacts') loadContacts();
  if (name === 'appointments') loadAppointments();
  if (name === 'tasks') loadTasks();
  if (name === 'projects') loadProjects();
  if (name === 'deployments') loadDeployments();
  // v2.0.0 — Hauptbereiche
  if (name === 'briefing')      loadBriefingV2?.();
  if (name === 'arbeitsplatz')  loadArbeitsplatz?.();
  if (name === 'listen')        loadListenPage?.();
  if (name === 'einstellungen') loadEinstellungen?.();
}

// ═══════════════════════════════════════════════════════════
//  v2.0.0 — DREI-BEREICHE (Briefing / Arbeitsplatz / Listen)
// ═══════════════════════════════════════════════════════════
//
// Loader-Stubs. In Phase 0 zeigen sie Übergangs-Inhalte; werden
// in Phasen 2-5 mit echten Inhalten gefüllt.

let _briefingV2Scope = 'heute';

async function loadBriefingV2() {
  const userId = currentProfile?.id;
  if (!userId) return;
  const heroEl  = document.getElementById('briefing-v2-hero');
  const mainEl  = document.getElementById('briefing-v2-main');
  const asideEl = document.getElementById('briefing-v2-aside');
  if (!heroEl || !mainEl || !asideEl) return;

  // Tab-Active-Setzung
  document.querySelectorAll('.briefing-v2-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.scope === _briefingV2Scope);
  });

  heroEl.innerHTML  = '<div class="info-card-empty">Lade …</div>';
  mainEl.innerHTML  = '';
  asideEl.innerHTML = '';

  try {
    const data = await loadBriefingData(userId, _briefingV2Scope);
    heroEl.innerHTML  = renderBriefingV2Hero(data, _briefingV2Scope);
    mainEl.innerHTML  = renderBriefingV2Main(data, _briefingV2Scope);
    asideEl.innerHTML = renderBriefingV2Aside(data, _briefingV2Scope);
  } catch (e) {
    heroEl.innerHTML = `<div class="info-card-empty" style="color:var(--danger)">Fehler: ${esc(e.message)}</div>`;
  }
}

function switchBriefingV2(scope) {
  _briefingV2Scope = scope;
  loadBriefingV2();
}

/** Dynamischer Eröffnungssatz je nach Tageskontext. */
function renderBriefingV2Hero(data, scope) {
  const firstName = (currentProfile?.name || '').split(' ')[0] || 'Selcuk';
  const todayISO = toISODate(new Date());
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Guten Morgen';
    if (h < 18) return 'Hallo';
    return 'Guten Abend';
  })();

  if (scope === 'heute') {
    const todayDeps = (data.deployments || []).filter(d =>
      d.datum_von <= todayISO && (d.datum_bis || d.datum_von) >= todayISO);
    const todayAppts = (data.appointments || []).filter(a => a.datum === todayISO);
    const overdue = (data.overdueTasks || []).length;
    const overdueSuffix = overdue > 0 ? ` — <strong>${overdue}</strong> überfällige Aufgaben.` : '.';

    let lead = '';
    if (todayDeps.length > 0) {
      const firma = todayDeps[0].company?.name || '—';
      lead = `Heute bist du im Einsatz bei <strong>${esc(firma)}</strong>${overdueSuffix}`;
    } else if (todayAppts.length > 0) {
      lead = `Heute hast du <strong>${todayAppts.length}</strong> Termin${todayAppts.length === 1 ? '' : 'e'}${overdueSuffix}`;
    } else {
      lead = `Heute keine festen Termine — guter Slot für Akquise oder Aufholarbeit${overdueSuffix}`;
    }
    return `<div class="briefing-v2-hero-text">${greeting}, ${esc(firstName)}. ${lead}</div>`;
  }

  if (scope === 'woche') {
    const term = (data.appointments || []).length;
    const eins = (data.deployments || []).length;
    return `<div class="briefing-v2-hero-text">${greeting}, ${esc(firstName)}. Diese Woche: <strong>${term}</strong> Termin${term === 1 ? '' : 'e'} und <strong>${eins}</strong> Einsatz${eins === 1 ? '' : 'sätze'}.</div>`;
  }

  // monat
  const term = (data.appointments || []).length;
  const eins = (data.deployments || []).length;
  return `<div class="briefing-v2-hero-text">${greeting}, ${esc(firstName)}. Dieser Monat: <strong>${term}</strong> Termine und <strong>${eins}</strong> Einsätze.</div>`;
}

/** Hauptbereich — Hero-Card des aktuellen Einsatzes (wenn vorhanden) +
 *  Folge-Karten für weitere heutige Aktivitäten + KPI-Tiles unten. */
function renderBriefingV2Main(data, scope) {
  const todayISO = toISODate(new Date());
  const todayDeps = scope === 'heute'
    ? (data.deployments || []).filter(d => d.datum_von <= todayISO && (d.datum_bis || d.datum_von) >= todayISO)
    : [];
  const todayAppts = scope === 'heute'
    ? (data.appointments || []).filter(a => a.datum === todayISO)
    : [];
  const otherDeps = scope === 'heute'
    ? (data.deployments || []).filter(d => !todayDeps.includes(d) && d.datum_von >= todayISO).slice(0, 2)
    : [];
  const otherAppts = scope === 'heute'
    ? todayAppts.slice(0, 2)
    : [];

  // Hero-Card: erster heutiger Einsatz, sonst erster Termin, sonst nichts
  let heroCardHtml = '';
  if (todayDeps.length > 0) {
    const dep = todayDeps[0];
    const status = (dep.status || 'Geplant');
    const statusKey = status.toLowerCase().replace(/[^a-z]/g, '');
    const preis = (Number(dep.einzelpreis) || 0) * (Number(dep.menge) || 1);
    heroCardHtml = `
      <div class="briefing-v2-hero-card">
        <div class="briefing-v2-hero-card-pills">
          <span class="briefing-v2-hero-card-eyebrow">JETZT · VOR-ORT</span>
          <span class="status-pill status-pill-${esc(statusKey)}">${esc(status)}</span>
        </div>
        <div class="briefing-v2-hero-card-title">${esc(dep.company?.name || dep.titel || '—')}</div>
        <div class="briefing-v2-hero-card-meta">${esc(dep.titel || dep.service?.name || '')} · ${esc(dep.ort || '')} · ${esc(formatPreis(preis))}</div>
      </div>`;
  }

  // Folge-Karten (kompakt, nebeneinander)
  const followCards = [
    ...otherDeps.map(d => ({
      eyebrow: 'EINSATZ',
      time: formatTime(d.uhrzeit_von) || formatDateCompact(d.datum_von),
      title: d.company?.name || d.titel || '—',
      meta: [d.ort, formatPreis((Number(d.einzelpreis) || 0) * (Number(d.menge) || 1))].filter(Boolean).join(' · ')
    })),
    ...otherAppts.map(a => ({
      eyebrow: a.typ?.wert || 'TERMIN',
      time: formatTime(a.uhrzeit_von) || formatDateCompact(a.datum),
      title: a.titel || '—',
      meta: [a.ort, a.contact ? [a.contact.vorname, a.contact.nachname].filter(Boolean).join(' ') : null].filter(Boolean).join(' · ')
    }))
  ].slice(0, 3);
  const followCardsHtml = followCards.length === 0 ? '' : `
    <div class="briefing-v2-follow-grid">
      ${followCards.map(c => `
        <div class="briefing-v2-follow-card">
          <div class="briefing-v2-follow-eyebrow">${esc(c.eyebrow)} · ${esc(c.time || '')}</div>
          <div class="briefing-v2-follow-title">${esc(c.title)}</div>
          <div class="briefing-v2-follow-meta">${esc(c.meta || '')}</div>
        </div>`).join('')}
    </div>`;

  // KPI-Tiles unten
  const kpiTermine   = (data.appointments || []).length;
  const kpiEinsaetze = (data.deployments || []).length;
  const kpiAufgaben  = (data.tasks || []).length;
  const kpiOverdue   = (data.overdueTasks || []).length;
  const kpiHtml = `
    <div class="briefing-v2-kpi-grid">
      <div class="briefing-v2-kpi"><div class="briefing-v2-kpi-label">Termine</div><div class="briefing-v2-kpi-value">${kpiTermine}</div></div>
      <div class="briefing-v2-kpi"><div class="briefing-v2-kpi-label">Einsätze</div><div class="briefing-v2-kpi-value">${kpiEinsaetze}</div></div>
      <div class="briefing-v2-kpi"><div class="briefing-v2-kpi-label">Aufgaben</div><div class="briefing-v2-kpi-value">${kpiAufgaben}</div></div>
      <div class="briefing-v2-kpi ${kpiOverdue > 0 ? 'is-overdue' : ''}"><div class="briefing-v2-kpi-label">Überfällig</div><div class="briefing-v2-kpi-value">${kpiOverdue}</div></div>
    </div>`;

  return heroCardHtml + followCardsHtml + kpiHtml;
}

/** Sidebar: INBOX (neue Aufgaben), ÜBERFÄLLIG, HEUTE FÄLLIG. */
function renderBriefingV2Aside(data, scope) {
  const todayISO = toISODate(new Date());
  const overdue = data.overdueTasks || [];
  const todayDue = (data.tasks || []).filter(t => t.faelligkeit === todayISO);

  const overdueHtml = overdue.length === 0 ? '' : `
    <div class="briefing-v2-side-card">
      <div class="briefing-v2-side-title is-danger">ÜBERFÄLLIG · ${overdue.length}</div>
      ${overdue.slice(0, 5).map(t => {
        const days = Math.max(0, Math.round((new Date(todayISO) - new Date(t.faelligkeit)) / 86400000));
        return `
          <label class="briefing-v2-side-item">
            <input type="checkbox" onchange="markTaskDoneInline('${esc(t.id)}', this.checked)">
            <span class="briefing-v2-side-item-label">${esc(t.titel)}</span>
            <span class="briefing-v2-side-item-meta">${days}T</span>
          </label>`;
      }).join('')}
    </div>`;

  const todayDueHtml = todayDue.length === 0 ? '' : `
    <div class="briefing-v2-side-card">
      <div class="briefing-v2-side-title">HEUTE FÄLLIG · ${todayDue.length}</div>
      ${todayDue.map(t => `
        <label class="briefing-v2-side-item">
          <input type="checkbox" onchange="markTaskDoneInline('${esc(t.id)}', this.checked)">
          <span class="briefing-v2-side-item-label">${esc(t.titel)}</span>
        </label>`).join('')}
    </div>`;

  if (overdue.length === 0 && todayDue.length === 0) {
    return `
      <div class="briefing-v2-side-card">
        <div class="briefing-v2-side-empty">Alles im Griff. Keine überfälligen, keine fälligen Aufgaben.</div>
      </div>`;
  }
  return overdueHtml + todayDueHtml;
}

/** Inline-Häkchen aus dem Briefing — markiert Aufgabe als erledigt. */
async function markTaskDoneInline(taskId, checked) {
  if (!checked) return;
  const { error } = await db.from('tasks')
    .update({ status: 'erledigt', erledigt_am: new Date().toISOString() })
    .eq('id', taskId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast('Aufgabe erledigt.');
  loadBriefingV2();
}

// v2.0.0 — Arbeitsplatz-State (überlebt Modal-Wechsel innerhalb der Seite)
let _arbeitsplatzContext = null;  // { type, id, label }
let _arbeitsplatzCaptureText = '';

async function loadArbeitsplatz() {
  // Datum oben rechts
  const dateEl = document.getElementById('arbeitsplatz-date');
  if (dateEl) {
    const d = new Date();
    dateEl.textContent = `${WEEKDAYS_DE[d.getDay()]}, ${d.getDate()}. ${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`;
  }

  // Capture-Feld an State binden
  const captureInput = document.getElementById('arbeitsplatz-capture-input');
  if (captureInput) {
    captureInput.value = _arbeitsplatzCaptureText;
    captureInput.oninput = () => { _arbeitsplatzCaptureText = captureInput.value; };
  }

  // Kontext-Pille rendern
  renderArbeitsplatzContext();

  // Drei Lazy-Loads
  await Promise.all([
    renderArbeitsplatzRecent(),
    renderArbeitsplatzToday(),
    renderArbeitsplatzTemplates()
  ]);
}

function renderArbeitsplatzContext() {
  const area = document.getElementById('arbeitsplatz-context-pill-area');
  if (!area) return;
  if (!_arbeitsplatzContext) {
    area.innerHTML = `<button class="arbeitsplatz-context-set" onclick="openArbeitsplatzContextPicker()">+ Kontext setzen (Firma · Projekt · Kontakt)</button>`;
    return;
  }
  area.innerHTML = `
    <span class="arbeitsplatz-context-pill">
      ${esc(_arbeitsplatzContext.label)}
      <button class="arbeitsplatz-context-clear" onclick="clearArbeitsplatzContext()" aria-label="Kontext entfernen">×</button>
    </span>
    <span class="arbeitsplatz-context-hint">(Kontext bleibt für mehrere Anlagen)</span>`;
}

function clearArbeitsplatzContext() {
  _arbeitsplatzContext = null;
  renderArbeitsplatzContext();
}

/** Öffnet die globale Suche und übergibt Auswahl zurück als Kontext. */
function openArbeitsplatzContextPicker() {
  // Wir nutzen die existierende Suche und definieren einen Callback,
  // der statt Navigation den Kontext setzt.
  window._arbeitsplatzContextPickerActive = true;
  openSearchOverlay();
}

/** Wird aus der Such-Auswahl aufgerufen, wenn Kontext-Modus aktiv ist. */
function setArbeitsplatzContextFromSearch(type, id, title) {
  _arbeitsplatzContext = { type, id, label: title };
  window._arbeitsplatzContextPickerActive = false;
  closeSearchOverlay();
  renderArbeitsplatzContext();
}

/** Zuletzt-bearbeitet aus localStorage (recentlyVisited). */
async function renderArbeitsplatzRecent() {
  const wrap = document.getElementById('arbeitsplatz-recent');
  if (!wrap) return;
  const list = getRecentlyVisited();
  if (list.length === 0) {
    wrap.innerHTML = '<div class="info-card-empty">Noch nichts besucht. Sobald du eine Detailseite öffnest, taucht sie hier auf.</div>';
    return;
  }
  wrap.innerHTML = list.map(e => {
    const label = TYPE_LABELS_FOR_ARBEITSPLATZ[e.type] || e.type;
    const typClass = (e.type === 'firma' ? 'firma' : e.type === 'kontakt' ? 'kontakt' : e.type === 'projekt' ? 'projekt' : 'einsatz');
    return `
      <button class="arbeitsplatz-recent-row" onclick="arbeitsplatzOpenRecent('${esc(e.type)}','${esc(e.id)}')">
        <span class="type-pill type-pill-${typClass}">${esc(label)}</span>
        <span class="arbeitsplatz-recent-title">${esc(e.title)}</span>
      </button>`;
  }).join('');
}

const TYPE_LABELS_FOR_ARBEITSPLATZ = {
  firma: 'FIRMA', kontakt: 'KONTAKT', projekt: 'PROJEKT', einsatz: 'EINSATZ', termin: 'TERMIN'
};

function arbeitsplatzOpenRecent(type, id) {
  navigateTo(type, id);
}

/** Heute-von-dir: Aktionen heute, aggregiert aus mehreren Tabellen. */
async function renderArbeitsplatzToday() {
  const wrap = document.getElementById('arbeitsplatz-today');
  const counter = document.getElementById('arbeitsplatz-today-count');
  if (!wrap) return;
  const userId = currentProfile?.id;
  if (!userId) return;

  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const todayStartISO = todayStart.toISOString();

  // Parallel-Queries: heute erstellte Termine, Einsätze, Aufgaben, erledigte Aufgaben
  const [apptRes, depRes, taskRes, taskDoneRes] = await Promise.all([
    db.from('appointments').select('id, titel, created_at').is('deleted_at', null)
      .eq('erstellt_von', userId).gte('created_at', todayStartISO).order('created_at', { ascending: false }).limit(20),
    db.from('deployments').select('id, titel, created_at').is('deleted_at', null)
      .eq('erstellt_von', userId).gte('created_at', todayStartISO).order('created_at', { ascending: false }).limit(20),
    db.from('tasks').select('id, titel, created_at').is('deleted_at', null)
      .eq('erstellt_von', userId).gte('created_at', todayStartISO).order('created_at', { ascending: false }).limit(20),
    db.from('tasks').select('id, titel, erledigt_am').is('deleted_at', null)
      .eq('status', 'erledigt').gte('erledigt_am', todayStartISO).order('erledigt_am', { ascending: false }).limit(20)
  ]);

  const items = [
    ...((apptRes.data) || []).map(a => ({ type: 'TERMIN',  ts: a.created_at, label: a.titel })),
    ...((depRes.data) || []).map(d => ({ type: 'EINSATZ', ts: d.created_at, label: d.titel })),
    ...((taskRes.data) || []).map(t => ({ type: 'AUFGABE', ts: t.created_at, label: t.titel })),
    ...((taskDoneRes.data) || []).map(t => ({ type: 'STATUS', ts: t.erledigt_am, label: `${t.titel} → erledigt` }))
  ].filter(i => i.ts).sort((a, b) => b.ts.localeCompare(a.ts)).slice(0, 6);

  if (counter) counter.textContent = `${items.length} Aktion${items.length === 1 ? '' : 'en'}`;

  if (items.length === 0) {
    wrap.innerHTML = '<div class="info-card-empty">Heute noch nichts angelegt. Leg los — die Kacheln oben warten.</div>';
    return;
  }

  wrap.innerHTML = items.map(it => {
    const time = new Date(it.ts).toTimeString().substring(0, 5);
    const cls = it.type.toLowerCase();
    const pill = it.type.charAt(0) + it.type.slice(1).toLowerCase();
    return `
      <div class="arbeitsplatz-today-row">
        <span class="arbeitsplatz-today-time">${esc(time)}</span>
        <span class="type-pill type-pill-${esc(cls)}">${esc(pill)}</span>
        <span class="arbeitsplatz-today-label">${esc(it.label || '—')}</span>
      </div>`;
  }).join('');
}

/** Templates-Streifen: häufig genutzte Vorlagen. */
async function renderArbeitsplatzTemplates() {
  const wrap = document.getElementById('arbeitsplatz-template-grid');
  if (!wrap) return;
  // Lade aktive Templates aller 4 Typen
  const types = ['einsatz','projekt','aufgabe','termin'];
  const results = await Promise.all(types.map(t => fetchActiveTemplates(t)));
  const all = [];
  results.forEach((tpls, idx) => {
    (tpls || []).slice(0, 1).forEach(t => all.push({ ...t, _typ: types[idx] }));
  });
  if (all.length === 0) {
    wrap.innerHTML = '<div class="info-card-empty">Keine aktiven Templates angelegt. Erstelle welche unter „Templates".</div>';
    return;
  }
  wrap.innerHTML = all.slice(0, 4).map(t => `
    <button class="arbeitsplatz-template-card" onclick="arbeitsplatzApplyTemplate('${esc(t._typ)}','${esc(t.id)}')">
      <div class="arbeitsplatz-template-name">${esc(t.name)}</div>
      <div class="arbeitsplatz-template-typ">${esc(t._typ.charAt(0).toUpperCase() + t._typ.slice(1))}</div>
    </button>`).join('');
}

/** Eine Anlage starten — öffnet das passende Modal mit
 *  Capture-Text als Titel-Vorschlag und Arbeitsplatz-Kontext als
 *  Firma/Projekt/Kontakt-Vorbelegung. */
async function arbeitsplatzCreate(typ) {
  const captureText = (_arbeitsplatzCaptureText || '').trim();
  // Kontext-Vorbelegung
  const ctx = _arbeitsplatzContext;
  if (ctx) {
    if (ctx.type === 'firma') {
      appointmentModalPrefillCompanyId = ctx.id;
      taskModalPrefillCompanyId = ctx.id;
      deploymentModalPrefillCompanyId = ctx.id;
    } else if (ctx.type === 'projekt') {
      appointmentModalPrefillProjectId = ctx.id;
      taskModalPrefillProjectId = ctx.id;
      deploymentModalPrefillProjectId = ctx.id;
    } else if (ctx.type === 'kontakt') {
      appointmentModalPrefillContactId = ctx.id;
      taskModalPrefillContactId = ctx.id;
    }
  }

  // Modal je Typ öffnen
  if (typ === 'aufgabe')      await openTaskModal('new');
  else if (typ === 'termin')  await openAppointmentModal('new');
  else if (typ === 'einsatz') await openDeploymentModal('new');
  else if (typ === 'projekt') await openProjectModal('new');
  else if (typ === 'firma')   await openCompanyModal('new');
  else if (typ === 'kontakt') await openContactModal('new');
  else if (typ === 'notiz')   { showToast('Notizen kommen über die Detail-Page eines Projekts/einer Firma.', false); return; }

  // Capture-Text in Titel-Feld kopieren wenn leer
  if (captureText) {
    const titelMap = {
      aufgabe: 'a-titel', termin: 't-titel', einsatz: 'd-titel', projekt: 'p-name', firma: 'c-name', kontakt: 'k-name'
    };
    const id = titelMap[typ];
    if (id) {
      const el = document.getElementById(id);
      if (el && !el.value) el.value = captureText;
    }
  }

  // Capture leeren NACH dem Anlegen — passiert beim nächsten loadArbeitsplatz()
  // weil wir nicht wissen ob der User cancelt. Heuristik: Capture wird nach
  // erfolgreicher Anlage (close+refresh) sowieso überschrieben.
}

function arbeitsplatzOpenTemplatePicker() {
  showToast('Wähle ein Template aus der Vorlagen-Liste unten.', false);
  document.getElementById('arbeitsplatz-template-grid')?.scrollIntoView({ behavior: 'smooth' });
}

async function arbeitsplatzApplyTemplate(typ, templateId) {
  // Modal öffnen, dann Template anwenden
  if (typ === 'aufgabe')      await openTaskModal('new');
  else if (typ === 'termin')  await openAppointmentModal('new');
  else if (typ === 'einsatz') await openDeploymentModal('new');
  else if (typ === 'projekt') await openProjectModal('new');
  await applyTemplateToEntity(typ, templateId);
}

async function loadListenPage() {
  // v2.0.0 — /listen ist nur ein Default-Redirect auf Firmen (siehe navigateTo).
  // Diese Funktion wird beim direkten Aufruf von showPage('listen') ausgeführt
  // und blendet einen Hinweis ein, weil der Hash-Router auf /firmen umlenkt.
  const c = document.getElementById('listen-container');
  if (!c) return;
  c.innerHTML = `
    <div class="redesign-stub">
      <div class="redesign-stub-eyebrow">LISTEN</div>
      <h1 class="redesign-stub-title">Wähle eine Liste oben</h1>
      <p class="redesign-stub-hint">Firmen, Kontakte, Projekte, Termine, Einsätze oder Aufgaben.</p>
    </div>`;
}

/** v2.0.0 — Sub-Nav für Listen ein-/ausblenden + aktiven Tab markieren. */
const LISTEN_PAGES = ['companies','contacts','projects','appointments','deployments','tasks'];
const EINSTELLUNGEN_PAGES = ['lookups','services','programs','templates','users'];
function updateListenTabBar(pageName) {
  const listenBar = document.getElementById('listen-tab-bar');
  const settingsBar = document.getElementById('einstellungen-tab-bar');
  if (listenBar) {
    const inListen = LISTEN_PAGES.includes(pageName);
    listenBar.style.display = inListen ? 'flex' : 'none';
    if (inListen) {
      listenBar.querySelectorAll('.listen-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.page === pageName);
      });
    }
  }
  if (settingsBar) {
    const inSettings = EINSTELLUNGEN_PAGES.includes(pageName);
    settingsBar.style.display = inSettings ? 'flex' : 'none';
    if (inSettings) {
      settingsBar.querySelectorAll('.listen-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.page === pageName);
      });
    }
  }
}

async function loadEinstellungen() {
  const c = document.getElementById('einstellungen-container');
  if (!c) return;
  c.innerHTML = `
    <div class="redesign-stub">
      <div class="redesign-stub-eyebrow">EINSTELLUNGEN</div>
      <h1 class="redesign-stub-title">Konfiguration</h1>
      <p class="redesign-stub-hint">Wird in Phase 5 gebaut. Bis dahin findest du Stammdaten / Benutzer / Leistungen / Programme / Templates in der Sidebar unter „Einstellungen".</p>
    </div>`;
}

/** v2.0.0 — markiert den passenden Top-Nav-Tab als aktiv. */
function setActiveTopNavTab(pageName) {
  document.querySelectorAll('.app-topnav-tab').forEach(t => t.classList.remove('active'));
  let tabId = null;
  // Mapping: welche Page gehört zu welchem Bereich?
  if (pageName === 'briefing' || pageName === 'heute') tabId = 'topnav-briefing';
  else if (pageName === 'arbeitsplatz') tabId = 'topnav-arbeitsplatz';
  else if (['listen','companies','contacts','projects','appointments','deployments','tasks',
            'company-detail','contact-detail','project-detail'].includes(pageName)) tabId = 'topnav-listen';
  // Einstellungen-Pages markieren keinen Top-Nav-Tab (eigener Bereich)
  if (tabId) document.getElementById(tabId)?.classList.add('active');
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
  } else if (page === 'appointments' && param && typeof param === 'object') {
    // v1.44.12: range/status für Monat-Drilldown
    pendingAppointmentsFilter = { ...(pendingAppointmentsFilter || {}), ...param };
    hash = '#/termine';
  } else if (page === 'deployments' && param && typeof param === 'object') {
    // v1.44.12: range/status/firma/projekt für Monat-Drilldown
    pendingDeploymentsFilter = { ...(pendingDeploymentsFilter || {}), ...param };
    hash = '#/einsaetze';
  } else if (page === 'heute') {
    hash = '#/heute';
  } else if (page === 'companies' && param && typeof param === 'object') {
    pendingCompaniesFilter = { ...(pendingCompaniesFilter || {}), ...param };
    hash = '#/firmen';
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
  } else if (page === 'templates') {
    hash = '#/templates';
  } else if (page === 'briefing') {
    hash = '#/briefing';
  } else if (page === 'arbeitsplatz') {
    hash = '#/arbeitsplatz';
  } else if (page === 'listen') {
    // v2.0.0 — /listen ohne Sub-Tab leitet auf Firmen weiter (sinnvoller Default)
    hash = '#/firmen';
  } else if (page === 'einstellungen') {
    // v2.0.0 — Default Sub-Tab beim Klick auf Zahnrad
    hash = '#/stammdaten';
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

  if (hash === '#/heute' || hash === '' || hash === '#') {
    showPage('heute');
    if (typeof loadBriefing === 'function') loadBriefing(_currentBriefingTab || 'heute');
    return;
  }
  if (hash === '#/firmen') { showPage('companies'); return; }
  if (hash === '#/kontakte')   { showPage('contacts'); return; }
  if (hash === '#/projekte')   { showPage('projects'); return; }
  if (hash === '#/einsaetze')  { showPage('deployments'); return; }
  if (hash === '#/benutzer')   { showPage('users'); return; }
  if (hash === '#/leistungen') { showPage('services'); return; }
  if (hash === '#/stammdaten') { showPage('lookups'); return; }
  if (hash === '#/programme')  { showPage('programs'); return; }
  if (hash === '#/templates')  { showPage('templates'); return; }
  // v2.0.0 — Drei-Bereiche-Architektur
  if (hash === '#/briefing')      { showPage('briefing');      return; }
  if (hash === '#/arbeitsplatz')  { showPage('arbeitsplatz');  return; }
  if (hash === '#/listen')        { showPage('listen');        return; }
  if (hash === '#/einstellungen') { showPage('einstellungen'); return; }
  // v1.45.3: Alias — die Sidebar trägt das Label „Mitgliedschafts-Programme",
  // historisch wurde teils auch /#/mitgliedschafts-programme verlinkt.
  if (hash === '#/mitgliedschafts-programme') { showPage('programs'); return; }

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
    navigateTo('heute');  // v1.42: Landing auf Briefing-Dashboard
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
  // v2.0.0 — Avatar-Initialen in Top-Nav
  const topnavAvatar = document.getElementById('topnav-avatar-initials');
  if (topnavAvatar) topnavAvatar.textContent = ini(currentProfile?.name || currentUser?.email || '?');
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
    initCalendarBar();
    navigateTo('heute');  // v1.42: Briefing-Dashboard nach erstem Passwort-Wechsel

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
//  TEMPLATES (v1.50.0)
// ═══════════════════════════════════════════════════════════
//
// Vorlagen für Termin / Aufgabe / Einsatz / Projekt. Eine Tabelle
// `templates`, daten als JSON. Beim Anlegen einer Entität kann
// ein Template gewählt werden — die hinterlegten Felder werden
// automatisch gefüllt. Datumsfelder werden bewusst nicht
// vorbelegt (Kontext-spezifisch).

/** Feld-Schemata pro Template-Typ. type bestimmt das Render im
 *  Template-Editor (text/number/checkbox/textarea/time/lookup/service/user). */
const TEMPLATE_SCHEMAS = {
  termin: [
    { key: 'titel',        label: 'Titel',         type: 'text',     placeholder: 'z. B. Erstgespräch' },
    { key: 'typ_id',       label: 'Termin-Typ',    type: 'lookup',   kategorie: 'termin_typ' },
    { key: 'status',       label: 'Status',        type: 'lookup',   kategorie: 'termin_status' },
    { key: 'ort',          label: 'Ort',           type: 'text',     placeholder: 'z. B. Online / Vor Ort' },
    { key: 'ganztag',      label: 'Ganztägig',     type: 'checkbox' },
    { key: 'uhrzeit_von',  label: 'Uhrzeit von',   type: 'time' },
    { key: 'uhrzeit_bis',  label: 'Uhrzeit bis',   type: 'time' },
    { key: 'beschreibung', label: 'Beschreibung',  type: 'textarea' }
  ],
  aufgabe: [
    { key: 'titel',        label: 'Titel',         type: 'text' },
    { key: 'status',       label: 'Status',        type: 'lookup',   kategorie: 'aufgabe_status' },
    { key: 'beschreibung', label: 'Beschreibung',  type: 'textarea' },
    { key: 'assigned_to',  label: 'Zuständig (Default)', type: 'user' }
  ],
  einsatz: [
    { key: 'titel',        label: 'Titel',         type: 'text' },
    { key: 'service_id',   label: 'Leistung',      type: 'service' },
    { key: 'menge',        label: 'Menge',         type: 'number',   step: '0.01' },
    { key: 'einzelpreis',  label: 'Einzelpreis (€)', type: 'number', step: '0.01' },
    { key: 'status',       label: 'Status',        type: 'lookup',   kategorie: 'einsatz_status' },
    { key: 'ort',          label: 'Ort',           type: 'text' },
    { key: 'ganztag',      label: 'Ganztägig',     type: 'checkbox' },
    { key: 'uhrzeit_von',  label: 'Uhrzeit von',   type: 'time' },
    { key: 'uhrzeit_bis',  label: 'Uhrzeit bis',   type: 'time' },
    { key: 'beschreibung', label: 'Beschreibung',  type: 'textarea' }
  ],
  projekt: [
    { key: 'name',                label: 'Name (Default)', type: 'text', placeholder: 'wird beim Anlegen meist überschrieben' },
    { key: 'status',              label: 'Status',         type: 'text-or-lookup', kategorie: 'projekt_status' },
    { key: 'geschaetzter_umsatz', label: 'Geschätzter Umsatz (€)', type: 'number', step: '0.01' },
    { key: 'beschreibung',        label: 'Beschreibung',   type: 'textarea' }
  ]
};

let editingTemplateId = null;
let templatesCache = { termin: null, aufgabe: null, einsatz: null, projekt: null };

/** Holt aktive Templates für einen Typ (cache-first, Admin sieht beim Pflegen
 *  alle inkl. archivierter — siehe loadTemplates für die Liste). */
async function fetchActiveTemplates(typ) {
  if (templatesCache[typ]) return templatesCache[typ];
  const { data } = await db.from('templates')
    .select('*').eq('typ', typ).eq('ist_aktiv', true)
    .order('reihenfolge').order('name');
  templatesCache[typ] = data || [];
  return templatesCache[typ];
}
function invalidateTemplatesCache() {
  templatesCache = { termin: null, aufgabe: null, einsatz: null, projekt: null };
}

/** Liste auf der Admin-Seite — gefiltert nach gewähltem Typ, inkl. archivierter. */
async function loadTemplates() {
  if (!isAdmin()) { showToast('Du hast keine Berechtigung für diese Seite.', true); return; }
  const tbody = document.getElementById('templates-table-body');
  const filter = document.getElementById('tpl-filter-typ');
  const typ = filter?.value || 'termin';
  tbody.innerHTML = '<tr><td colspan="4"><div class="empty">Lade Templates ...</div></td></tr>';

  const { data, error } = await db.from('templates')
    .select('*').eq('typ', typ)
    .order('ist_aktiv', { ascending: false }).order('reihenfolge').order('name');
  if (error) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty">Fehler: ${esc(error.message)}</div></td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4"><div class="empty">Noch keine Templates für diesen Typ. Klicke oben auf „+ Neues Template".</div></td></tr>';
    return;
  }
  tbody.innerHTML = data.map(t => `
    <tr>
      <td><div class="cell-link" onclick="openTemplateModal('edit','${esc(t.id)}')">${esc(t.name)}</div></td>
      <td>${t.reihenfolge}</td>
      <td>${t.ist_aktiv ? '<span class="badge" style="background:#dcfce7;color:#16a34a">Aktiv</span>' : '<span class="badge" style="background:#f3f4f6;color:#6b7280">Archiviert</span>'}</td>
      <td class="col-action" style="text-align:right">
        <button class="btn btn-sm" onclick="openTemplateModal('edit','${esc(t.id)}')">Bearbeiten</button>
      </td>
    </tr>
  `).join('');
}

async function openTemplateModal(mode, templateId = null) {
  if (!isAdmin()) { showToast('Nur Admins.', true); return; }
  editingTemplateId = templateId;
  document.getElementById('modal-template-title').textContent = mode === 'edit' ? 'Template bearbeiten' : 'Neues Template';
  document.getElementById('tpl-save-btn').textContent = mode === 'edit' ? 'Speichern' : 'Anlegen';
  document.getElementById('tpl-delete-btn').style.display = mode === 'edit' ? 'inline-block' : 'none';

  let prefilled = {};
  let typ = document.getElementById('tpl-filter-typ')?.value || 'termin';
  let name = '';
  let reihenfolge = 0;
  let ist_aktiv = true;

  if (mode === 'edit' && templateId) {
    const { data, error } = await db.from('templates').select('*').eq('id', templateId).single();
    if (error || !data) { showToast('Template nicht gefunden.', true); return; }
    typ = data.typ;
    name = data.name;
    reihenfolge = data.reihenfolge;
    ist_aktiv = data.ist_aktiv;
    prefilled = data.daten || {};
  }

  document.getElementById('tpl-typ').value = typ;
  document.getElementById('tpl-typ').disabled = (mode === 'edit'); // Typ nicht änderbar bei Edit
  document.getElementById('tpl-name').value = name;
  document.getElementById('tpl-reihenfolge').value = reihenfolge;
  document.getElementById('tpl-aktiv').value = String(ist_aktiv);

  await renderTemplateFields(typ, prefilled);

  document.getElementById('modal-template').classList.add('open');
}

function closeTemplateModal() {
  document.getElementById('modal-template').classList.remove('open');
  editingTemplateId = null;
  document.getElementById('tpl-typ').disabled = false;
}

async function onTemplateTypeChange() {
  const typ = document.getElementById('tpl-typ').value;
  await renderTemplateFields(typ, {});
}

/** Generiert die Vorbelegungs-Felder dynamisch aus dem Schema. */
async function renderTemplateFields(typ, prefilled) {
  const wrap = document.getElementById('tpl-fields');
  const schema = TEMPLATE_SCHEMAS[typ] || [];

  // Lookup-Optionen vorab laden
  const lookupOptions = {};
  for (const f of schema) {
    if (f.type === 'lookup' || f.type === 'text-or-lookup') {
      const { data } = await db.from('lookup_values')
        .select('id, wert').eq('kategorie', f.kategorie).eq('ist_aktiv', true)
        .order('reihenfolge').order('wert');
      lookupOptions[f.key] = data || [];
    }
  }

  // Services + User für Einsatz/Aufgabe.
  // v1.51.2: Bei Projekt-Templates auch laden, damit Einsatz-Sub-Items
  // im Sub-Items-Editor die Leistungs-Auswahl haben.
  let serviceOpts = [];
  let userOpts = [];
  if (schema.some(f => f.type === 'service') || typ === 'projekt') {
    const { data } = await db.from('services').select('id, name').eq('ist_aktiv', true).order('name');
    serviceOpts = data || [];
  }
  if (schema.some(f => f.type === 'user')) {
    const { data } = await db.from('user_profiles').select('id, name').eq('ist_aktiv', true).order('name');
    userOpts = data || [];
  }

  wrap.innerHTML = '<div class="form-grid">' + schema.map(f => {
    const val = prefilled[f.key];
    const id = `tpl-f-${f.key}`;
    if (f.type === 'text') {
      return `<div class="form-group"><label>${esc(f.label)}</label><input type="text" id="${id}" placeholder="${esc(f.placeholder || '')}" value="${esc(val ?? '')}"></div>`;
    }
    if (f.type === 'number') {
      return `<div class="form-group"><label>${esc(f.label)}</label><input type="number" id="${id}" step="${esc(f.step || 'any')}" value="${val ?? ''}"></div>`;
    }
    if (f.type === 'time') {
      return `<div class="form-group"><label>${esc(f.label)}</label><input type="time" id="${id}" value="${esc(val ?? '')}"></div>`;
    }
    if (f.type === 'checkbox') {
      const checked = val === true ? 'checked' : '';
      return `<div class="form-group"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="${id}" ${checked}> ${esc(f.label)}</label></div>`;
    }
    if (f.type === 'textarea') {
      return `<div class="form-group full"><label>${esc(f.label)}</label><textarea id="${id}" rows="2">${esc(val ?? '')}</textarea></div>`;
    }
    if (f.type === 'lookup') {
      const opts = (lookupOptions[f.key] || []).map(o =>
        `<option value="${esc(o.id)}" ${val === o.id ? 'selected' : ''}>${esc(o.wert)}</option>`).join('');
      return `<div class="form-group"><label>${esc(f.label)}</label><select id="${id}"><option value="">— Nicht vorbelegen —</option>${opts}</select></div>`;
    }
    if (f.type === 'text-or-lookup') {
      // Für projekt_status: lookup_values.wert wird als Text gespeichert (kein FK)
      const opts = (lookupOptions[f.key] || []).map(o =>
        `<option value="${esc(o.wert)}" ${val === o.wert ? 'selected' : ''}>${esc(o.wert)}</option>`).join('');
      return `<div class="form-group"><label>${esc(f.label)}</label><select id="${id}"><option value="">— Nicht vorbelegen —</option>${opts}</select></div>`;
    }
    if (f.type === 'service') {
      const opts = serviceOpts.map(o =>
        `<option value="${esc(o.id)}" ${val === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('');
      return `<div class="form-group"><label>${esc(f.label)}</label><select id="${id}"><option value="">— Nicht vorbelegen —</option>${opts}</select></div>`;
    }
    if (f.type === 'user') {
      const opts = userOpts.map(o =>
        `<option value="${esc(o.id)}" ${val === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('');
      return `<div class="form-group"><label>${esc(f.label)}</label><select id="${id}"><option value="">— Nicht vorbelegen —</option>${opts}</select></div>`;
    }
    return '';
  }).join('') + '</div>';

  // v1.51.0: Bei Projekt-Templates zusätzlich Sub-Items-Editor („Standard-Aktivitäten")
  if (typ === 'projekt') {
    const subitems = Array.isArray(prefilled._subitems) ? prefilled._subitems : [];
    wrap.insertAdjacentHTML('beforeend', renderTemplateSubItemsEditor(subitems, serviceOpts));
  }
}

/** v1.51.0: Sub-Items-Editor für Projekt-Templates. Pro Zeile:
 *  Typ · Titel · Offset (Werktage) · bei Einsatz zusätzlich Service/Menge/Preis.
 *  State im DOM (data-attr) statt globalem Array — readTemplateFields liest später aus. */
function renderTemplateSubItemsEditor(subitems, serviceOpts) {
  return `
    <div class="tpl-subitems-block">
      <div class="tpl-subitems-head">
        <div class="tpl-subitems-title">Standard-Aktivitäten</div>
        <button type="button" class="btn btn-sm" onclick="addTemplateSubItem()">+ Aktivität</button>
      </div>
      <p class="tpl-subitems-hint">
        Werden beim Anwenden des Templates automatisch als Termine / Aufgaben / Einsätze
        zum neuen Projekt erstellt. Das Datum wird aus „Projektstart + Werktage-Offset"
        berechnet (Sa/So werden übersprungen). Ohne Projektstart bleiben sie datumslos.
      </p>
      <div id="tpl-subitems-list" data-services='${esc(JSON.stringify(serviceOpts))}'>
        ${subitems.map((s, i) => renderTemplateSubItemRow(s, i, serviceOpts)).join('')}
        ${subitems.length === 0 ? '<div class="info-card-empty">Noch keine Standard-Aktivitäten. Klicke oben auf „+ Aktivität".</div>' : ''}
      </div>
    </div>`;
}

function renderTemplateSubItemRow(item, idx, serviceOpts) {
  const t = item.typ || 'termin';
  const titel = item.titel || '';
  const offset = item.offset_werktage ?? 0;
  const service = item.service_id || '';
  const menge = item.menge ?? '';
  const einzelpreis = item.einzelpreis ?? '';
  const isEinsatz = t === 'einsatz';
  const serviceOpt = (serviceOpts || []).map(o =>
    `<option value="${esc(o.id)}" ${service === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('');
  return `
    <div class="tpl-subitem-row${isEinsatz ? ' is-einsatz' : ''}" data-idx="${idx}">
      <div class="tpl-si-main">
        <select class="tpl-si-typ" onchange="onSubItemTypChange(${idx})">
          <option value="termin"  ${t === 'termin'  ? 'selected' : ''}>Termin</option>
          <option value="aufgabe" ${t === 'aufgabe' ? 'selected' : ''}>Aufgabe</option>
          <option value="einsatz" ${t === 'einsatz' ? 'selected' : ''}>Einsatz</option>
        </select>
        <input type="text" class="tpl-si-titel" placeholder="Titel" value="${esc(titel)}">
        <div class="tpl-si-offset-wrap" title="Werktage ab Projektstart">
          <input type="number" class="tpl-si-offset" min="0" step="1" value="${offset}">
          <span class="tpl-si-offset-suffix">WT</span>
        </div>
        <button type="button" class="tpl-si-del" onclick="removeTemplateSubItem(${idx})" title="Entfernen" aria-label="Entfernen">×</button>
      </div>
      <div class="tpl-si-einsatz">
        <label class="tpl-si-extra-label">Leistung</label>
        <select class="tpl-si-service">
          <option value="">— wählen —</option>${serviceOpt}
        </select>
        <label class="tpl-si-extra-label">Menge</label>
        <input type="number" class="tpl-si-menge" placeholder="1" step="0.01" value="${menge}">
        <label class="tpl-si-extra-label">Preis €</label>
        <input type="number" class="tpl-si-preis" placeholder="0,00" step="0.01" value="${einzelpreis}">
      </div>
    </div>`;
}

function addTemplateSubItem() {
  const list = document.getElementById('tpl-subitems-list');
  if (!list) return;
  const empty = list.querySelector('.info-card-empty');
  if (empty) empty.remove();
  const serviceOpts = JSON.parse(list.dataset.services || '[]');
  const idx = list.querySelectorAll('.tpl-subitem-row').length;
  list.insertAdjacentHTML('beforeend', renderTemplateSubItemRow({}, idx, serviceOpts));
}

function removeTemplateSubItem(idx) {
  const list = document.getElementById('tpl-subitems-list');
  if (!list) return;
  const row = list.querySelector(`.tpl-subitem-row[data-idx="${idx}"]`);
  if (row) row.remove();
  if (list.querySelectorAll('.tpl-subitem-row').length === 0) {
    list.innerHTML = '<div class="info-card-empty">Noch keine Standard-Aktivitäten. Klicke oben auf „+ Aktivität".</div>';
  }
}

function onSubItemTypChange(idx) {
  const list = document.getElementById('tpl-subitems-list');
  const row = list?.querySelector(`.tpl-subitem-row[data-idx="${idx}"]`);
  if (!row) return;
  const isEinsatz = row.querySelector('.tpl-si-typ').value === 'einsatz';
  row.classList.toggle('is-einsatz', isEinsatz);
}

/** Liest die aktuellen Sub-Items aus dem DOM. */
function readTemplateSubItems() {
  const list = document.getElementById('tpl-subitems-list');
  if (!list) return [];
  return [...list.querySelectorAll('.tpl-subitem-row')].map(row => {
    const typ = row.querySelector('.tpl-si-typ').value;
    const titel = row.querySelector('.tpl-si-titel').value.trim();
    const offset = Number(row.querySelector('.tpl-si-offset').value) || 0;
    const item = { typ, titel, offset_werktage: offset };
    if (typ === 'einsatz') {
      const sid = row.querySelector('.tpl-si-service').value;
      const menge = row.querySelector('.tpl-si-menge').value;
      const preis = row.querySelector('.tpl-si-preis').value;
      if (sid) item.service_id = sid;
      if (menge !== '') item.menge = Number(menge);
      if (preis !== '') item.einzelpreis = Number(preis);
    }
    return item;
  }).filter(it => it.titel); // ohne Titel keine Auto-Anlage möglich
}

/** Liest die Werte aus den dynamischen Feldern und gibt nur die nicht-leeren zurück.
 *  v1.51.0: Bei typ='projekt' werden zusätzlich die Sub-Items unter `_subitems`
 *  abgelegt — Auto-Erstellen passiert beim Anwenden des Templates. */
function readTemplateFields(typ) {
  const schema = TEMPLATE_SCHEMAS[typ] || [];
  const out = {};
  for (const f of schema) {
    const el = document.getElementById(`tpl-f-${f.key}`);
    if (!el) continue;
    if (f.type === 'checkbox') {
      if (el.checked) out[f.key] = true;
      // unchecked = nicht vorbelegen
    } else {
      const v = el.value.trim();
      if (v === '') continue;
      if (f.type === 'number') out[f.key] = Number(v);
      else out[f.key] = v;
    }
  }
  if (typ === 'projekt') {
    const subitems = readTemplateSubItems();
    if (subitems.length > 0) out._subitems = subitems;
  }
  return out;
}

async function saveTemplate() {
  if (!isAdmin()) { showToast('Nur Admins.', true); return; }
  const typ = document.getElementById('tpl-typ').value;
  const name = document.getElementById('tpl-name').value.trim();
  const reihenfolge = Number(document.getElementById('tpl-reihenfolge').value) || 0;
  const ist_aktiv = document.getElementById('tpl-aktiv').value === 'true';
  if (!name) { showToast('Bitte Name eingeben.', true); return; }

  const daten = readTemplateFields(typ);

  if (editingTemplateId) {
    const { error } = await db.from('templates')
      .update({ name, reihenfolge, ist_aktiv, daten })
      .eq('id', editingTemplateId);
    if (error) { showToast('Fehler beim Speichern: ' + error.message, true); return; }
    showToast('Template aktualisiert.');
  } else {
    const { error } = await db.from('templates')
      .insert({ typ, name, reihenfolge, ist_aktiv, daten, erstellt_von: currentProfile?.id });
    if (error) { showToast('Fehler beim Anlegen: ' + error.message, true); return; }
    showToast('Template angelegt.');
  }
  invalidateTemplatesCache();
  closeTemplateModal();
  await loadTemplates();
}

async function deleteTemplate() {
  if (!editingTemplateId) return;
  if (!await confirmDialog('Dieses Template wirklich löschen?')) return;
  const { error } = await db.from('templates').delete().eq('id', editingTemplateId);
  if (error) { showToast('Fehler beim Löschen: ' + error.message, true); return; }
  invalidateTemplatesCache();
  showToast('Template gelöscht.');
  closeTemplateModal();
  await loadTemplates();
}

/** Mappt Template-JSON-Schlüssel auf Modal-DOM-IDs pro Entitäts-Typ. */
const TEMPLATE_FIELD_MAP = {
  termin: {
    titel:        't-titel',
    typ_id:       't-typ',
    status:       't-status',
    ort:          't-ort',
    ganztag:      't-ganztag',
    uhrzeit_von:  't-uhrzeit-von',
    uhrzeit_bis:  't-uhrzeit-bis',
    // v1.52.0: keine freie notizen-Textarea mehr — Template-Feld "beschreibung"
    // landet im Doku-Feld „Gesprächsinhalt"
    beschreibung: 't-doc-gespraechsinhalt'
  },
  aufgabe: {
    titel:        'a-titel',
    status:       'a-status',
    beschreibung: 'a-beschreibung',
    assigned_to:  'a-assigned-to'
  },
  einsatz: {
    titel:        'd-titel',
    service_id:   'd-service',
    menge:        'd-menge',
    einzelpreis:  'd-einzelpreis',
    status:       'd-status',
    ort:          'd-ort',
    ganztag:      'd-ganztag',
    uhrzeit_von:  'd-uhrzeit-von',
    uhrzeit_bis:  'd-uhrzeit-bis',
    beschreibung: 'd-beschreibung'
  },
  projekt: {
    name:                'p-name',
    status:              'p-status',
    geschaetzter_umsatz: 'p-umsatz',
    beschreibung:        'p-beschreibung'
  }
};
const TEMPLATE_PREFIX = { termin: 't', aufgabe: 'a', einsatz: 'd', projekt: 'p' };

/** Befüllt die "Aus Template"-Auswahl im Anlage-Modal. Nur im New-Modus
 *  und nur, wenn aktive Templates für den Typ existieren — sonst Zeile aus. */
async function populateTemplateDropdown(typ, mode) {
  const prefix = TEMPLATE_PREFIX[typ];
  if (!prefix) return;
  const row = document.getElementById(`${prefix}-template-row`);
  const sel = document.getElementById(`${prefix}-template-select`);
  if (!row || !sel) return;
  if (mode !== 'new') { row.style.display = 'none'; return; }
  const tpls = await fetchActiveTemplates(typ);
  if (tpls.length === 0) { row.style.display = 'none'; return; }
  sel.innerHTML = '<option value="">— Kein Template —</option>' + tpls.map(t =>
    `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join('');
  sel.value = '';
  row.style.display = '';
}

/** Wendet ein Template auf das aktive Anlage-Modal an: setzt jedes
 *  im Template hinterlegte Feld auf das passende DOM-Element und löst
 *  change/input-Events aus, damit abhängige Logik (Auto-Berechnungen,
 *  Preview etc.) reagiert. */
/** v1.51.0: aktives Projekt-Template merken — saveProject schaut hier nach
 *  und erzeugt Sub-Items mit project_id nach erfolgreichem Insert. */
let _activeProjectTemplateId = null;

async function applyTemplateToEntity(typ, templateId) {
  if (typ === 'projekt') _activeProjectTemplateId = templateId || null;
  if (!templateId) return;
  const tpls = await fetchActiveTemplates(typ);
  const tpl = tpls.find(t => t.id === templateId);
  if (!tpl) return;
  const map = TEMPLATE_FIELD_MAP[typ] || {};
  const daten = tpl.daten || {};
  let applied = 0;
  for (const key of Object.keys(daten)) {
    if (key.startsWith('_')) continue; // _subitems & andere Meta-Schlüssel überspringen
    const elId = map[key];
    if (!elId) continue;
    const el = document.getElementById(elId);
    if (!el) continue;
    const val = daten[key];
    if (el.type === 'checkbox') {
      el.checked = !!val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.value = val;
      el.dispatchEvent(new Event('change', { bubbles: true }));
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    applied++;
  }
  let toastSuffix = '';
  if (typ === 'projekt' && Array.isArray(daten._subitems) && daten._subitems.length > 0) {
    toastSuffix = ` · ${daten._subitems.length} Aktivität${daten._subitems.length === 1 ? '' : 'en'} folgen nach dem Speichern`;
  }
  if (applied > 0 || toastSuffix) showToast(`Template „${tpl.name}" angewendet${applied > 0 ? ` (${applied} Felder)` : ''}${toastSuffix}.`);
}

/** v1.51.0: Datum + N Werktage (Mo-Fr). Sa/So überspringen. */
function addWerktage(startISO, days) {
  if (!startISO) return null;
  const d = new Date(startISO + 'T00:00:00');
  let added = 0;
  if (days === 0) return toISODate(d);
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return toISODate(d);
}

/** v1.51.0: Erzeugt die Sub-Items eines Projekt-Templates als echte Datensätze
 *  (appointments/tasks/deployments) mit project_id und berechnetem Datum. */
async function createTemplateSubItems(templateId, projectId, projectStartdatum) {
  const tpls = await fetchActiveTemplates('projekt');
  const tpl = tpls.find(t => t.id === templateId);
  if (!tpl) return 0;
  const subitems = tpl.daten?._subitems;
  if (!Array.isArray(subitems) || subitems.length === 0) return 0;

  const userId = currentProfile?.id || currentUser?.id || null;
  const apptRows = [];
  const taskRows = [];
  const depRows  = [];

  for (const it of subitems) {
    const datum = projectStartdatum ? addWerktage(projectStartdatum, it.offset_werktage || 0) : null;
    if (it.typ === 'termin') {
      apptRows.push({
        titel: it.titel,
        datum,
        status: 'geplant',
        project_id: projectId,
        erstellt_von: userId
      });
    } else if (it.typ === 'aufgabe') {
      taskRows.push({
        titel: it.titel,
        faelligkeit: datum,
        status: 'offen',
        project_id: projectId,
        assigned_to: userId,
        erstellt_von: userId
      });
    } else if (it.typ === 'einsatz') {
      depRows.push({
        titel: it.titel,
        datum_von: datum,
        datum_bis: datum,
        status: 'Geplant',
        project_id: projectId,
        service_id: it.service_id || null,
        menge: it.menge ?? 1,
        einzelpreis: it.einzelpreis ?? 0,
        erstellt_von: userId
      });
    }
  }

  let created = 0;
  if (apptRows.length > 0) {
    const { error, count } = await db.from('appointments').insert(apptRows);
    if (!error) created += apptRows.length;
  }
  if (taskRows.length > 0) {
    const { error } = await db.from('tasks').insert(taskRows);
    if (!error) created += taskRows.length;
  }
  if (depRows.length > 0) {
    const { error } = await db.from('deployments').insert(depRows);
    if (!error) created += depRows.length;
  }
  return created;
}

// ═══════════════════════════════════════════════════════════
//  DOKUMENTATION (v1.52.0)
// ═══════════════════════════════════════════════════════════
//
// Strukturierte Dokumentation pro Entität (Projekt / Termin / Einsatz).
// Pro Entitätstyp ein festes Feld-Schema. Speicherung in
// `<table>.dokumentation` jsonb.

const DOCUMENTATION_SCHEMAS = {
  projekt: [
    { key: 'kundenherausforderung', label: 'Kundenherausforderung', placeholder: 'Welches Problem will der Kunde lösen?' },
    { key: 'loesungsansatz',        label: 'Lösungsansatz',         placeholder: 'Wie gehen wir es an?' },
    { key: 'themenwahl',            label: 'Themenwahl',            placeholder: 'Welche Module / Bestandteile?' },
    { key: 'erfolgskriterien',      label: 'Erfolgskriterien',      placeholder: 'Woran messen wir Erfolg?' },
    { key: 'anmerkungen',           label: 'Anmerkungen',           placeholder: 'Sonstiges, was hier dokumentiert sein soll' }
  ],
  termin: [
    { key: 'gespraechsinhalt',  label: 'Gesprächsinhalt',  placeholder: 'Was wurde besprochen?' },
    { key: 'vereinbarungen',    label: 'Vereinbarungen',   placeholder: 'Was wurde zugesagt?' },
    { key: 'naechste_schritte', label: 'Nächste Schritte', placeholder: 'Folge-Termin? Aufgaben?' },
    { key: 'anmerkungen',       label: 'Anmerkungen',      placeholder: 'Sonstiges' }
  ],
  einsatz: [
    { key: 'durchgefuehrte_themen', label: 'Durchgeführte Themen', placeholder: 'Was haben wir gemacht?' },
    { key: 'teilnehmer',            label: 'Teilnehmer',           placeholder: 'Anzahl + Skill-Level' },
    { key: 'erkenntnisse',          label: 'Erkenntnisse',         placeholder: 'Was hat funktioniert / nicht?' },
    { key: 'folge_massnahmen',      label: 'Folge-Maßnahmen',      placeholder: 'Was muss noch passieren?' },
    { key: 'anmerkungen',           label: 'Anmerkungen',          placeholder: 'Sonstiges' }
  ]
};

const DOCUMENTATION_TABLE = {
  projekt: 'projects',
  termin:  'appointments',
  einsatz: 'deployments'
};

/** Rendert den Doku-Block. Im Inline-Modus (Projekt-Detail) speichert
 *  jedes Feld bei blur einzeln (saveDocumentationFieldInline). Im Modal-
 *  Modus (Termin/Einsatz) wird das Block-Ergebnis erst beim Save ausgelesen
 *  via readDocumentationFromDom. */
function renderDocumentationBlock(entityType, dokData, options = {}) {
  const schema = DOCUMENTATION_SCHEMAS[entityType] || [];
  const data = dokData || {};
  const idPrefix = options.idPrefix || `doc-${entityType}`;
  const inline = !!options.inline;
  const entityId = options.entityId || '';
  return `<div class="doc-grid">${schema.map(f => {
    const id = `${idPrefix}-${f.key}`;
    const val = data[f.key] || '';
    const blurAttr = inline && entityId
      ? `onblur="saveDocumentationFieldInline('${entityType}','${esc(entityId)}','${f.key}', this)"`
      : '';
    const savedAttr = inline ? `data-saved-value="${esc(val)}"` : '';
    return `
      <div class="doc-field">
        <label class="doc-field-label" for="${id}">${esc(f.label)}</label>
        <textarea id="${id}" class="doc-field-textarea" rows="2" placeholder="${esc(f.placeholder || '')}" ${blurAttr} ${savedAttr}>${esc(val)}</textarea>
        ${inline ? `<div class="doc-field-status" id="${id}-status"></div>` : ''}
      </div>`;
  }).join('')}</div>`;
}

/** Liest den aktuellen Stand des Doku-Blocks aus dem DOM. Leere Felder
 *  werden ausgelassen (kein Eintrag im JSON). */
function readDocumentationFromDom(entityType, idPrefix) {
  const schema = DOCUMENTATION_SCHEMAS[entityType] || [];
  const out = {};
  for (const f of schema) {
    const el = document.getElementById(`${idPrefix}-${f.key}`);
    if (!el) continue;
    const v = (el.value || '').trim();
    if (v) out[f.key] = v;
  }
  return out;
}

/** Inline-Save eines einzelnen Feldes — nutzt JSONB-Update direkt im
 *  jeweiligen Datensatz. Statusanzeige unter dem Feld. */
async function saveDocumentationFieldInline(entityType, id, key, el) {
  const table = DOCUMENTATION_TABLE[entityType];
  if (!table || !id) return;
  const newVal = (el.value || '').trim();
  const saved = el.dataset.savedValue ?? '';
  if (newVal === saved) return;

  const statusEl = document.getElementById(`${el.id}-status`);
  if (statusEl) { statusEl.textContent = 'Speichere ...'; statusEl.style.color = 'var(--muted)'; }

  // Aktuellen JSON holen, key setzen oder löschen, zurückschreiben.
  const { data, error: fetchErr } = await db.from(table).select('dokumentation').eq('id', id).single();
  if (fetchErr) {
    if (statusEl) { statusEl.textContent = 'Fehler beim Laden'; statusEl.style.color = 'var(--danger)'; }
    return;
  }
  const dok = data?.dokumentation && typeof data.dokumentation === 'object' ? { ...data.dokumentation } : {};
  if (newVal) dok[key] = newVal;
  else delete dok[key];

  const { error } = await db.from(table).update({ dokumentation: dok }).eq('id', id);
  if (error) {
    if (statusEl) { statusEl.textContent = 'Fehler: ' + error.message; statusEl.style.color = 'var(--danger)'; }
    return;
  }
  el.dataset.savedValue = newVal;
  if (statusEl) {
    statusEl.textContent = 'Gespeichert';
    statusEl.style.color = 'var(--status-done-accent)';
    setTimeout(() => { if (statusEl.textContent === 'Gespeichert') statusEl.textContent = ''; }, 1800);
  }
}

// ═══════════════════════════════════════════════════════════
//  PROJEKT-THEMEN (v1.53.0 — Phase A des Master-Plan v2.1)
// ═══════════════════════════════════════════════════════════
//
// Themen sind projektlokal — pro Projekt eine kanonische Liste,
// gegen die Einsätze taggen können. Cache pro Projekt-ID, wird
// nach Theme-CRUD oder Project-Refresh invalidiert.

let themesCacheByProject = {};      // projectId → [{id, name, status, owner_id, farbe, reihenfolge, einsatz_count}]
let editingThemeId = null;
let editingThemeProjectId = null;

function invalidateThemesCache(projectId) {
  if (projectId) delete themesCacheByProject[projectId];
  else themesCacheByProject = {};
}

/** Lädt Themen eines Projekts inkl. Einsatz-Anzahl pro Thema. */
async function loadProjectThemesData(projectId) {
  if (themesCacheByProject[projectId]) return themesCacheByProject[projectId];

  const { data: themes, error } = await db.from('project_themes')
    .select('id, name, beschreibung, status, owner_id, farbe, reihenfolge, owner:user_profiles!project_themes_owner_id_fkey(id, name)')
    .is('deleted_at', null).eq('project_id', projectId)
    .order('reihenfolge').order('name');
  if (error) return [];

  // Einsatz-Anzahl pro Thema (Junction-Aggregation)
  const themeIds = (themes || []).map(t => t.id);
  let countMap = {};
  if (themeIds.length > 0) {
    const { data: junctions } = await db.from('deployment_themes')
      .select('theme_id').in('theme_id', themeIds);
    (junctions || []).forEach(j => {
      countMap[j.theme_id] = (countMap[j.theme_id] || 0) + 1;
    });
  }
  const result = (themes || []).map(t => ({ ...t, einsatz_count: countMap[t.id] || 0 }));
  themesCacheByProject[projectId] = result;
  return result;
}

/** Rendert die Themen-Sektion im Projekt-Stammdaten-Tab. */
async function renderProjectThemes(projectId) {
  const list = document.getElementById('project-themes-list');
  const banner = document.getElementById('project-themes-banner');
  if (!list) return;

  const themes = await loadProjectThemesData(projectId);

  // Banner: zeigen wenn migrierte Freitext-Themen existieren UND noch nicht vom User akzeptiert
  // (heuristisch: Projekt hat alte themenwahl im JSONB UND mindestens 1 Theme automatisch importiert
  //  UND localStorage hat den Banner für dieses Projekt nicht ausgeblendet)
  const seenKey = `themes_banner_seen_${projectId}`;
  const seen = (() => { try { return localStorage.getItem(seenKey) === '1'; } catch { return false; } })();
  if (banner) {
    if (themes.length > 0 && !seen) {
      banner.style.display = '';
      banner.innerHTML = `
        <div class="themes-banner">
          <span>Bestehende Themen wurden automatisch importiert — bitte prüfe die Liste und passe sie ggf. an.</span>
          <button class="themes-banner-close" type="button" onclick="dismissThemesBanner('${esc(projectId)}')" aria-label="Banner schließen">×</button>
        </div>`;
    } else {
      banner.style.display = 'none';
    }
  }

  if (themes.length === 0) {
    list.innerHTML = '<div class="info-card-empty">Noch keine Themen. Klicke oben auf „+ Thema", um die kanonische Themen-Liste für dieses Projekt anzulegen — Einsätze taggen später dagegen.</div>';
    return;
  }

  list.innerHTML = `<div class="themes-list">${themes.map(t => renderThemeRow(t, projectId)).join('')}</div>`;
}

function dismissThemesBanner(projectId) {
  try { localStorage.setItem(`themes_banner_seen_${projectId}`, '1'); } catch {}
  const banner = document.getElementById('project-themes-banner');
  if (banner) banner.style.display = 'none';
}

function renderThemeRow(t, projectId) {
  const ownerName = t.owner?.name || '';
  const ownerInitials = ownerName ? ini(ownerName) : '';
  const farbe = t.farbe || '#1d4ed8';
  const statusLabel = (t.status || 'offen').replace('_', ' ');
  const einsatzText = t.einsatz_count === 0
    ? 'kein Einsatz'
    : `${t.einsatz_count} Einsa${t.einsatz_count === 1 ? 'tz' : 'tze'}`;
  return `
    <div class="theme-row" onclick="openThemeModal('edit','${esc(t.id)}','${esc(projectId)}')">
      <span class="theme-color-dot" style="background:${esc(farbe)}"></span>
      <div class="theme-row-body">
        <div class="theme-row-name">${esc(t.name)}</div>
        ${t.beschreibung ? `<div class="theme-row-desc">${esc(t.beschreibung)}</div>` : ''}
      </div>
      <span class="theme-row-status status-${esc(t.status || 'offen')}">${esc(statusLabel)}</span>
      <span class="theme-row-meta">
        ${ownerInitials ? `<span class="theme-row-owner" title="${esc(ownerName)}">${esc(ownerInitials)}</span>` : ''}
        <span class="theme-row-count">${esc(einsatzText)}</span>
      </span>
    </div>`;
}

/** Öffnet das Theme-Modal — Anlage oder Bearbeiten. */
async function openThemeModal(mode, themeId, projectId) {
  if (!projectId) { showToast('Kein Projekt-Kontext.', true); return; }
  editingThemeId = themeId;
  editingThemeProjectId = projectId;
  document.getElementById('modal-theme-title').textContent = mode === 'edit' ? 'Thema bearbeiten' : 'Neues Thema';
  document.getElementById('th-save-btn').textContent = mode === 'edit' ? 'Speichern' : 'Anlegen';
  document.getElementById('th-delete-btn').style.display = mode === 'edit' ? 'inline-block' : 'none';

  // Status-Lookup laden
  const { data: statusOpts } = await db.from('lookup_values')
    .select('wert').eq('kategorie', 'theme_status').eq('ist_aktiv', true)
    .order('reihenfolge');
  const statusSel = document.getElementById('th-status');
  statusSel.innerHTML = (statusOpts || []).map(o =>
    `<option value="${esc(o.wert)}">${esc(o.wert.replace('_', ' '))}</option>`).join('');

  // User-Liste für Owner
  const { data: users } = await db.from('user_profiles')
    .select('id, name').eq('ist_aktiv', true).order('name');
  const ownerSel = document.getElementById('th-owner');
  ownerSel.innerHTML = '<option value="">— Niemand —</option>' +
    (users || []).map(u => `<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');

  // Defaults / Edit-Daten
  document.getElementById('th-name').value = '';
  document.getElementById('th-beschreibung').value = '';
  document.getElementById('th-farbe').value = '#1d4ed8';
  document.getElementById('th-reihenfolge').value = 0;
  statusSel.value = 'offen';
  ownerSel.value = '';

  if (mode === 'edit' && themeId) {
    const { data: t, error } = await db.from('project_themes')
      .select('*').eq('id', themeId).single();
    if (error || !t) { showToast('Thema nicht gefunden.', true); return; }
    document.getElementById('th-name').value = t.name || '';
    document.getElementById('th-beschreibung').value = t.beschreibung || '';
    document.getElementById('th-farbe').value = t.farbe || '#1d4ed8';
    document.getElementById('th-reihenfolge').value = t.reihenfolge ?? 0;
    if (t.status) statusSel.value = t.status;
    if (t.owner_id) ownerSel.value = t.owner_id;
  }

  document.getElementById('modal-theme').classList.add('open');
}

function closeThemeModal() {
  document.getElementById('modal-theme').classList.remove('open');
  editingThemeId = null;
  editingThemeProjectId = null;
}

async function saveTheme() {
  const name = document.getElementById('th-name').value.trim();
  if (!name) { showToast('Bitte Name eingeben.', true); return; }
  const payload = {
    name,
    beschreibung: document.getElementById('th-beschreibung').value.trim() || null,
    status: document.getElementById('th-status').value,
    owner_id: document.getElementById('th-owner').value || null,
    farbe: document.getElementById('th-farbe').value || null,
    reihenfolge: Number(document.getElementById('th-reihenfolge').value) || 0
  };

  let error;
  if (editingThemeId) {
    ({ error } = await db.from('project_themes').update(payload).eq('id', editingThemeId));
  } else {
    payload.project_id = editingThemeProjectId;
    ({ error } = await db.from('project_themes').insert(payload));
  }
  if (error) { showToast('Fehler: ' + error.message, true); return; }

  showToast(editingThemeId ? 'Thema aktualisiert.' : 'Thema angelegt.');
  invalidateThemesCache(editingThemeProjectId);
  const projectId = editingThemeProjectId;
  closeThemeModal();
  if (projectId === currentProjectDetailId) await renderProjectThemes(projectId);
}

async function deleteTheme() {
  if (!editingThemeId) return;
  const ok = await confirmDialog({
    title: 'Thema löschen?',
    message: 'Das Thema wird soft-gelöscht. Bestehende Einsatz-Zuordnungen werden beibehalten, das Thema erscheint aber nicht mehr in der Liste.',
    confirmLabel: 'Löschen', cancelLabel: 'Abbrechen', danger: true
  });
  if (!ok) return;
  const { error } = await db.from('project_themes')
    .update({ deleted_at: new Date().toISOString() }).eq('id', editingThemeId);
  if (error) { showToast('Fehler: ' + error.message, true); return; }
  showToast('Thema gelöscht.');
  invalidateThemesCache(editingThemeProjectId);
  const projectId = editingThemeProjectId;
  closeThemeModal();
  if (projectId === currentProjectDetailId) await renderProjectThemes(projectId);
}

// ─── Theme-Picker fürs Einsatz-Modal ────────────────────────
//
// Picker zeigt nur Themen des verknüpften Projekts. State liegt
// in zwei Modul-Variablen, damit Save-Diff sauber läuft.

let _deploymentSelectedThemeIds = new Set();
let _deploymentInitialThemeIds  = new Set();
let _deploymentLastProjectId    = null;

/** Initialisiert den Theme-Picker beim Modal-Öffnen oder Projekt-Wechsel. */
async function renderDeploymentThemePicker(projectId, selectedIds) {
  const wrap = document.getElementById('d-themes-picker');
  if (!wrap) return;
  _deploymentSelectedThemeIds = new Set(selectedIds || []);
  _deploymentLastProjectId    = projectId || null;

  if (!projectId) {
    wrap.innerHTML = '<div class="info-card-empty">Themen werden auf Projektebene definiert. Wähle erst ein Projekt aus.</div>';
    return;
  }

  const themes = await loadProjectThemesData(projectId);
  if (themes.length === 0) {
    wrap.innerHTML = '<div class="info-card-empty">Dieses Projekt hat noch keine Themen. Lege sie auf der Projekt-Detailseite an, dann kannst du hier taggen.</div>';
    return;
  }

  wrap.innerHTML = `<div class="theme-picker-list">${themes.map(t => {
    const checked = _deploymentSelectedThemeIds.has(t.id) ? 'checked' : '';
    const farbe = t.farbe || '#1d4ed8';
    return `
      <label class="theme-pick-item">
        <input type="checkbox" data-theme-id="${esc(t.id)}" ${checked}
               onchange="toggleDeploymentTheme('${esc(t.id)}', this.checked)">
        <span class="theme-color-dot" style="background:${esc(farbe)}"></span>
        <span class="theme-pick-name">${esc(t.name)}</span>
      </label>`;
  }).join('')}</div>`;
}

function toggleDeploymentTheme(themeId, checked) {
  if (checked) _deploymentSelectedThemeIds.add(themeId);
  else _deploymentSelectedThemeIds.delete(themeId);
}

/** Lädt die zugeordneten Themen eines Einsatzes (für Edit-Modus). */
async function fetchDeploymentThemeIds(deploymentId) {
  const { data } = await db.from('deployment_themes')
    .select('theme_id').eq('deployment_id', deploymentId);
  return (data || []).map(r => r.theme_id);
}

/** Confirm-Dialog beim Projekt-Wechsel mit existierenden Theme-Zuordnungen.
 *  Aufgerufen aus dem onchange-Handler von d-project.
 *  Returns: true → Wechsel ok, false → Wechsel abbrechen. */
async function confirmDeploymentProjectSwitch(newProjectId) {
  // Wenn keine Themen ausgewählt sind, ist der Wechsel kostenlos
  if (_deploymentSelectedThemeIds.size === 0) return true;
  // Wenn Projekt-ID gleich bleibt, kein Wechsel
  if (_deploymentLastProjectId === newProjectId) return true;

  const ok = await confirmDialog({
    title: 'Projekt wechseln?',
    message: `Dieser Einsatz hat ${_deploymentSelectedThemeIds.size} Themen-Zuordnung${_deploymentSelectedThemeIds.size === 1 ? '' : 'en'} aus dem alten Projekt. Beim Wechsel werden diese gelöscht — die Themen am alten Projekt bleiben unverändert. Themen am neuen Projekt sind dann manuell zu taggen.`,
    confirmLabel: 'Wechseln', cancelLabel: 'Abbrechen', danger: false
  });
  return ok;
}

/** Sync-Diff der deployment_themes nach erfolgreichem Save. */
async function syncDeploymentThemes(deploymentId) {
  const wanted = new Set(_deploymentSelectedThemeIds);
  const initial = new Set(_deploymentInitialThemeIds);
  const toAdd    = [...wanted].filter(id => !initial.has(id));
  const toRemove = [...initial].filter(id => !wanted.has(id));

  if (toAdd.length > 0) {
    const rows = toAdd.map(theme_id => ({ deployment_id: deploymentId, theme_id }));
    await db.from('deployment_themes').insert(rows);
  }
  if (toRemove.length > 0) {
    await db.from('deployment_themes').delete()
      .eq('deployment_id', deploymentId).in('theme_id', toRemove);
  }
  // Cache pro Projekt invalidieren (Einsatz-Counts ändern sich)
  if (_deploymentLastProjectId) invalidateThemesCache(_deploymentLastProjectId);
  // Initial-Set auf neuen Stand setzen — falls der User direkt weiterspeichert
  _deploymentInitialThemeIds = new Set(wanted);
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

  setupProgramPreviewListeners();  // v1.41
  renderProgramPreview();           // v1.41

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

  // Hauptkontakt-Combobox (v1.44.10) — Kontakte der Firma als Datalist,
  // freier Texteingabe legt einen neuen Kontakt beim Speichern an.
  await fillContactCombobox('ms-hauptkontakt', 'ms-hauptkontakt-list', companyId);

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
    if (data.hauptkontakt_id) setContactComboboxValue('ms-hauptkontakt', 'ms-hauptkontakt-list', data.hauptkontakt_id);
    if (data.verantwortlicher_id) verantwSelect.value = data.verantwortlicher_id;
  }

  setupMembershipPreviewListeners();  // v1.38
  renderMembershipPreview();           // v1.38

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
    // Hauptkontakt-Combobox auflösen — legt ggf. einen neuen Kontakt an
    let hauptkontakt_id = null;
    try {
      hauptkontakt_id = await resolveContactComboboxValue('ms-hauptkontakt', 'ms-hauptkontakt-list', currentMembershipCompanyId);
    } catch (e) {
      btn.disabled = false; btn.textContent = editingMembershipId ? 'Speichern' : 'Anlegen';
      return;
    }

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

  // v1.45.5: Pending-Filter aus Drilldown anwenden
  if (pendingCompaniesFilter) {
    if (pendingCompaniesFilter.incomplete) {
      const cb = document.getElementById('companies-incomplete-filter');
      if (cb) cb.checked = true;
    }
    pendingCompaniesFilter = null;
  }

  filterCompanies();
}

/** v1.45.5: prüft ob eine Firma als „unvollständig" zählt — gleiche Logik
 *  wie in loadIncompleteRecordsStats (keine Adresse UND keine Kontaktdaten). */
function isCompanyIncomplete(c) {
  return !((c.strasse || '').trim())
      && !((c.stadt   || '').trim())
      && !((c.telefon || '').trim())
      && !((c.email   || '').trim());
}

function filterCompanies() {
  const searchTerm = document.getElementById('companies-search').value.trim().toLowerCase();
  const typFilter  = document.getElementById('companies-typ-filter').value;
  const incompleteFilter = document.getElementById('companies-incomplete-filter')?.checked;

  let filtered = companiesCache;
  if (typFilter) filtered = filtered.filter(c => c.typ_id === typFilter);
  if (incompleteFilter) filtered = filtered.filter(isCompanyIncomplete);
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
          <div class="cell-link" onclick="navigateTo('firma', '${esc(c.id)}')">${abcHtml}${esc(c.name)}${isCompanyIncomplete(c) ? '<span class="incomplete-badge" title="Datenpflege-Bedarf — keine Adresse und keine Kontaktdaten">unvollständig</span>' : ''}</div>
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

  setupCompanyPreviewListeners();  // v1.38
  renderCompanyPreview();           // v1.38

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
  // v1.48.0: Kontaktdaten-Meta im Header
  const cMeta = document.getElementById('company-detail-meta');
  if (cMeta) cMeta.innerHTML = '';
  // v1.47.0: contacts ist jetzt #company-contacts-list (kein tbody mehr).
  const cContactsList = document.getElementById('company-contacts-list');
  if (cContactsList) cContactsList.innerHTML = '<div class="info-card-empty">Lade ...</div>';
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
    const cMetaErr = document.getElementById('company-detail-meta');
    if (cMetaErr) cMetaErr.innerHTML = `<span style="color:var(--danger);font-size:13px">${esc(msg)}</span>`;
    document.getElementById('company-detail-title').textContent = msg;
    document.getElementById('company-detail-name').textContent = '—';
    document.getElementById('company-detail-subline').innerHTML = '';
    // Abhängige Sektionen nicht starten, sondern leeren Zustand anzeigen
    // v1.47.0: contacts ist Sidebar-Liste, kein tbody mehr
    const cListErr = document.getElementById('company-contacts-list');
    if (cListErr) cListErr.innerHTML = '<div class="info-card-empty">—</div>';
    document.getElementById('company-appointments-body').innerHTML = '<tr><td colspan="7"><div class="empty">—</div></td></tr>';
    document.getElementById('company-projects-body').innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    const depBody = document.getElementById('company-deployments-body');
    if (depBody) depBody.innerHTML = '<tr><td colspan="6"><div class="empty">—</div></td></tr>';
    const msBody = document.getElementById('company-memberships-body');
    if (msBody) msBody.innerHTML = '<div class="info-card-empty">—</div>';
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

  // v1.48.0: Kontaktdaten direkt in den Header (kein eigenes Card mehr).
  renderDetailHeaderMeta('company-detail-meta', {
    address: [c.strasse, [c.plz, c.stadt].filter(Boolean).join(' '), c.land && c.land !== 'Deutschland' ? c.land : null].filter(Boolean).join(', '),
    telefon: c.telefon,
    email: c.email,
    website: c.website
  });
  // Notizen: jetzt inline-editierbar im Dashboard (siehe oben, #company-notes-inline)
}

/** v1.48.0: Rendert Adresse/Tel/Mail/Web als kompakte Inline-Zeile direkt
 *  unter dem Titel — vorher als eigene "Kontaktdaten"-Karte unten. Nur
 *  vorhandene Felder werden angezeigt. */
function renderDetailHeaderMeta(elementId, fields) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const items = [];
  if (fields.address && fields.address.trim()) {
    items.push(`<span class="detail-meta-item"><span class="detail-meta-icon">${ICON_PIN_SVG}</span><span>${esc(fields.address)}</span></span>`);
  }
  if (fields.telefon) {
    items.push(`<span class="detail-meta-item"><span class="detail-meta-icon">${ICON_PHONE_SVG}</span><a href="tel:${esc(fields.telefon)}">${esc(fields.telefon)}</a></span>`);
  }
  if (fields.email) {
    items.push(`<span class="detail-meta-item"><span class="detail-meta-icon">${ICON_MAIL_SVG}</span><a href="mailto:${esc(fields.email)}">${esc(fields.email)}</a></span>`);
  }
  if (fields.website) {
    const url = fields.website.startsWith('http') ? fields.website : `https://${fields.website}`;
    items.push(`<span class="detail-meta-item"><span class="detail-meta-icon">${ICON_GLOBE_SVG}</span><a href="${esc(url)}" target="_blank" rel="noopener">${esc(fields.website)}</a></span>`);
  }
  el.innerHTML = items.join('');
}

const ICON_PIN_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';
const ICON_PHONE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
const ICON_MAIL_SVG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>';
const ICON_GLOBE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

/** v1.47.0: Kontakte als kompakte Sidebar-Liste (kein Tab mehr).
 *  Rendert in #company-contacts-list mit Name + Position + E-Mail
 *  als anklickbare Karten. Bearbeiten/Kopieren via Hover-Icons. */
async function loadCompanyContacts(companyId) {
  const list   = document.getElementById('company-contacts-list');
  const countEl = document.getElementById('company-contacts-count');

  const { data, error } = await db.from('contacts')
    .select('*').is('deleted_at', null).eq('company_id', companyId).order('nachname').order('vorname');

  if (error) {
    if (list) list.innerHTML = `<div class="info-card-empty">Fehler: ${esc(error.message)}</div>`;
    if (countEl) countEl.textContent = 'Kontakte';
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
  if (countEl) countEl.textContent = total === 0 ? 'Kontakte' : `Kontakte · ${total}`;

  if (!list) return;
  if (total === 0) {
    list.innerHTML = '<div class="info-card-empty">Noch keine Kontakte. Klicke oben auf „+ Kontakt".</div>';
    return;
  }

  list.innerHTML = data.map(k => {
    const fullName = [k.vorname, k.nachname].filter(Boolean).join(' ') || '—';
    const sub = [k.position, k.email || k.telefon].filter(Boolean).join(' · ');
    return `
      <div class="contact-card" onclick="navigateTo('kontakt', '${esc(k.id)}')">
        <div class="contact-card-avatar">${esc(ini(fullName))}</div>
        <div class="contact-card-body">
          <div class="contact-card-name">${esc(fullName)}</div>
          ${sub ? `<div class="contact-card-sub">${esc(sub)}</div>` : ''}
        </div>
        <div class="contact-card-actions" onclick="event.stopPropagation()">
          <button class="btn-copy" onclick="copyContactById('${esc(k.id)}')" title="Kopieren" aria-label="Kopieren">${COPY_ICON_SVG}</button>
          <button class="btn-icon" onclick="openContactModal('edit', '${esc(k.id)}')" title="Bearbeiten" aria-label="Bearbeiten">✎</button>
        </div>
      </div>`;
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
      <tr data-appt-id="${esc(a.id)}" data-company-id="${esc(a.company_id || '')}" data-contact-id="${esc(a.contact_id || '')}">
        <td>
          <div class="date-cell${isPast ? ' past' : ''}">${esc(formatDateDE(a.datum))}</div>
        </td>
        <td class="col-tablet" style="color:var(--muted)">${esc(uhrzeit || '—')}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))">${terminTypDotHtml(a.typ)}${esc(a.titel || '—')}</div>
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
  autoExpandSingleRow(tbody, 'appointment', toShow);
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
  // v1.44.11: k-company ist eine Combobox — neue Firmen werden inline angelegt
  fillCompanyCombobox('k-company', 'k-company-list');

  document.getElementById('k-vorname').value = '';
  document.getElementById('k-nachname').value = '';
  document.getElementById('k-position').value = '';
  document.getElementById('k-telefon').value = '';
  document.getElementById('k-email').value = '';
  document.getElementById('k-notizen').value = '';
  setCompanyComboboxValue('k-company', 'k-company-list', '');

  if (mode === 'new') {
    document.getElementById('modal-contact-title').textContent = 'Neuer Kontakt';
    document.getElementById('k-save-btn').textContent = 'Anlegen';
    document.getElementById('k-delete-btn').style.display = 'none';

    if (contactModalPrefillCompanyId) {
      setCompanyComboboxValue('k-company', 'k-company-list', contactModalPrefillCompanyId);
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
    if (data.company_id) setCompanyComboboxValue('k-company', 'k-company-list', data.company_id);
  }

  setupContactPreviewListeners();  // v1.38
  renderContactPreview();           // v1.38

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
    // v1.44.11: Firma-Combobox auflösen — legt ggf. eine neue Firma an
    let company_id = null;
    try {
      company_id = await resolveCompanyComboboxValue('k-company', 'k-company-list');
    } catch (e) {
      btn.disabled = false; btn.textContent = editingContactId ? 'Speichern' : 'Anlegen';
      return;
    }

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

  // Pending-Filter aus URL-Parameter / Drill-Down anwenden (v1.44.12)
  if (pendingAppointmentsFilter) {
    if (pendingAppointmentsFilter.firma)  companyFilter.value = pendingAppointmentsFilter.firma;
    if (pendingAppointmentsFilter.range)  document.getElementById('appointments-range-filter').value  = pendingAppointmentsFilter.range;
    if (pendingAppointmentsFilter.status) document.getElementById('appointments-status-filter').value = pendingAppointmentsFilter.status;
    if (pendingAppointmentsFilter.typ)    document.getElementById('appointments-typ-filter').value    = pendingAppointmentsFilter.typ;
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
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))">${terminTypDotHtml(a.typ)}${esc(a.titel || '—')}</div>
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

  // v1.44.11: t-company ist eine Combobox mit Datalist
  fillCompanyCombobox('t-company', 't-company-list');

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
  // v1.52.0: Doku-Block initial leer rendern (wird bei Edit überschrieben)
  document.getElementById('t-documentation-block').innerHTML =
    renderDocumentationBlock('termin', null, { idPrefix: 't-doc' });
  document.getElementById('t-ort-hint').style.display = 'none';
  setCompanyComboboxValue('t-company', 't-company-list', '');

  await rebuildContactDropdownForAppointment('');
  await rebuildProjectDropdownForAppointment('');

  if (mode === 'new') {
    document.getElementById('modal-appointment-title').textContent = 'Neuer Termin';
    document.getElementById('t-save-btn').textContent = 'Anlegen';
    document.getElementById('t-delete-btn').style.display = 'none';

    // Prefill-Company aus Firmen-Detailseite
    if (appointmentModalPrefillCompanyId) {
      setCompanyComboboxValue('t-company', 't-company-list', appointmentModalPrefillCompanyId);
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
          setCompanyComboboxValue('t-company', 't-company-list', proj.company_id);
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
          setCompanyComboboxValue('t-company', 't-company-list', k.company_id);
          await rebuildContactDropdownForAppointment(k.company_id);
          await rebuildProjectDropdownForAppointment(k.company_id);
          updateOrtHint();
        }
        setContactComboboxValue('t-contact', 't-contact-list', k.id);
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
    // v1.52.0: Doku-Block aus dokumentation-jsonb befüllen
    document.getElementById('t-documentation-block').innerHTML =
      renderDocumentationBlock('termin', data.dokumentation, { idPrefix: 't-doc' });
    if (data.typ_id) typSelect.value = data.typ_id;
    if (data.company_id) {
      setCompanyComboboxValue('t-company', 't-company-list', data.company_id);
      await rebuildContactDropdownForAppointment(data.company_id);
      await rebuildProjectDropdownForAppointment(data.company_id);
      if (data.contact_id) setContactComboboxValue('t-contact', 't-contact-list', data.contact_id);
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
  setupAppointmentPreviewListeners();  // v1.37
  renderAppointmentPreview();          // v1.37 — initialer Preview-Stand

  await populateTemplateDropdown('termin', mode);
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
  await fillContactCombobox('t-contact', 't-contact-list', companyId);
}

function updateOrtHint() {
  const companyId = getCompanyComboboxId('t-company', 't-company-list');
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
  const companyId = getCompanyComboboxId('t-company', 't-company-list');
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

  const companyId = getCompanyComboboxId('t-company', 't-company-list');
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
  const companyInput = document.getElementById('t-company');
  const typSelect = document.getElementById('t-typ');

  // v1.44.11: Combobox-Input statt Select. `input`-Event triggert auch beim
  // Auswählen aus dem Datalist. Wir laden Kontakt/Projekt nur, wenn der Text
  // exakt zu einer Firma matcht — sonst leer.
  companyInput.oninput = async () => {
    const id = getCompanyComboboxId('t-company', 't-company-list');
    await rebuildContactDropdownForAppointment(id);
    await rebuildProjectDropdownForAppointment(id);
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
  const project_id   = document.getElementById('t-project')?.value || null;
  const ort          = document.getElementById('t-ort').value.trim();
  // v1.52.0: dokumentation aus dem Doku-Block lesen (statt freier notizen-Textarea)
  const dokumentation = readDocumentationFromDom('termin', 't-doc');
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
    // v1.44.11: Firma-Combobox auflösen — legt ggf. eine neue Firma an
    let company_id = null;
    try {
      company_id = await resolveCompanyComboboxValue('t-company', 't-company-list');
    } catch (e) {
      btn.disabled = false; btn.textContent = editingAppointmentId ? 'Speichern' : 'Anlegen';
      return;
    }
    // Kontakt-Combobox auflösen — legt ggf. einen neuen Kontakt an
    let contact_id = null;
    try {
      contact_id = await resolveContactComboboxValue('t-contact', 't-contact-list', company_id);
    } catch (e) {
      btn.disabled = false; btn.textContent = editingAppointmentId ? 'Speichern' : 'Anlegen';
      return;
    }
    const payload = {
      titel, datum,
      uhrzeit_von: uhrzeit_von || null,
      uhrzeit_bis: uhrzeit_bis || null,
      typ_id, status,
      company_id, contact_id, project_id,
      ort: ort || null,
      dokumentation
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

  // v1.44.11: p-company ist eine Combobox
  fillCompanyCombobox('p-company', 'p-company-list');

  const userSelect = document.getElementById('p-verantwortlicher');
  userSelect.innerHTML = '<option value="">— Kein Verantwortlicher —</option>'
    + userProfilesCache.map(u => `<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');

  // Hauptkontakt-Combobox: initial leer (immer enabled, kein „Erst Firma wählen")
  await fillContactCombobox('p-hauptkontakt', 'p-hauptkontakt-list', '');

  // Firma-Combobox-Input → Hauptkontakt-Combobox neu befüllen bei Match
  document.getElementById('p-company').oninput = async () => {
    const id = getCompanyComboboxId('p-company', 'p-company-list');
    await rebuildHauptkontaktDropdown(id);
  };

  document.getElementById('p-name').value = '';
  document.getElementById('p-beschreibung').value = '';
  document.getElementById('p-startdatum').value = '';
  document.getElementById('p-enddatum').value = '';
  document.getElementById('p-umsatz').value = '';
  document.getElementById('p-notizen').value = '';
  statusSelect.value = 'Angebot';
  setCompanyComboboxValue('p-company', 'p-company-list', '');

  if (mode === 'new') {
    document.getElementById('modal-project-title').textContent = 'Neues Projekt';
    document.getElementById('p-save-btn').textContent = 'Anlegen';
    document.getElementById('p-delete-btn').style.display = 'none';

    // Verantwortlicher: Default = aktueller User
    if (currentUser?.id) userSelect.value = currentUser.id;

    // Prefill-Company aus Firmen-Detailseite
    if (projectModalPrefillCompanyId) {
      setCompanyComboboxValue('p-company', 'p-company-list', projectModalPrefillCompanyId);
      await rebuildHauptkontaktDropdown(projectModalPrefillCompanyId);
      projectModalPrefillCompanyId = null;
    }

    // Prefill-Hauptkontakt aus Kontakt-Detailseite (setzt auch Firma vor)
    if (projectModalPrefillHauptkontaktId) {
      const { data: k } = await db.from('contacts')
        .select('id, company_id').is('deleted_at', null).eq('id', projectModalPrefillHauptkontaktId).single();
      if (k) {
        if (k.company_id) {
          setCompanyComboboxValue('p-company', 'p-company-list', k.company_id);
          await rebuildHauptkontaktDropdown(k.company_id);
        }
        setContactComboboxValue('p-hauptkontakt', 'p-hauptkontakt-list', k.id);
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
      setCompanyComboboxValue('p-company', 'p-company-list', data.company_id);
      await rebuildHauptkontaktDropdown(data.company_id);
      if (data.hauptkontakt_id) setContactComboboxValue('p-hauptkontakt', 'p-hauptkontakt-list', data.hauptkontakt_id);
    }
  }

  setupProjectPreviewListeners();  // v1.38
  renderProjectPreview();           // v1.38

  await populateTemplateDropdown('projekt', mode);
  document.getElementById('modal-project').classList.add('open');
  setTimeout(() => document.getElementById('p-name').focus(), 100);
}

async function rebuildHauptkontaktDropdown(companyId) {
  await fillContactCombobox('p-hauptkontakt', 'p-hauptkontakt-list', companyId);
}

function closeProjectModal() {
  document.getElementById('modal-project').classList.remove('open');
  editingProjectId = null;
  projectModalPrefillCompanyId = null;
  projectModalPrefillHauptkontaktId = null;
  _activeProjectTemplateId = null;
  // v1.51.0: Aktivitäten-Bereich zurücksetzen + Save-Button-Verhalten reset
  const sec = document.getElementById('p-activities-section');
  if (sec) sec.style.display = 'none';
  const btn = document.getElementById('p-save-btn');
  if (btn) {
    btn.textContent = 'Anlegen';
    btn.onclick = saveProject;
  }
}

async function saveProject() {
  const name              = document.getElementById('p-name').value.trim();
  const status            = document.getElementById('p-status').value;
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

  const geschaetzter_umsatz = umsatzRaw === '' ? 0 : Number(umsatzRaw);
  if (Number.isNaN(geschaetzter_umsatz) || geschaetzter_umsatz < 0) {
    showToast('Umsatz muss eine Zahl ≥ 0 sein.', true); return;
  }

  btn.disabled = true;
  btn.textContent = editingProjectId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    // v1.44.11: Firma-Combobox auflösen — legt ggf. eine neue Firma an
    let company_id = null;
    try {
      company_id = await resolveCompanyComboboxValue('p-company', 'p-company-list');
    } catch (e) {
      btn.disabled = false; btn.textContent = editingProjectId ? 'Speichern' : 'Anlegen';
      return;
    }
    // Hauptkontakt-Combobox auflösen — legt ggf. einen neuen Kontakt an
    let hauptkontakt_id = null;
    try {
      hauptkontakt_id = await resolveContactComboboxValue('p-hauptkontakt', 'p-hauptkontakt-list', company_id);
    } catch (e) {
      btn.disabled = false; btn.textContent = editingProjectId ? 'Speichern' : 'Anlegen';
      return;
    }
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
    const isNewProject = !savedId;

    let newProjectId = savedId;
    let error;
    if (editingProjectId) {
      ({ error } = await db.from('projects').update(payload).eq('id', editingProjectId));
    } else {
      const { data, error: insErr } = await db.from('projects').insert(payload).select('id').single();
      error = insErr;
      if (data) newProjectId = data.id;
    }
    if (error) throw new Error(error.message);

    // v1.51.0: Sub-Items aus dem aktiven Template auto-erstellen (nur bei neuem Projekt)
    let subitemsCreated = 0;
    if (isNewProject && _activeProjectTemplateId && newProjectId) {
      subitemsCreated = await createTemplateSubItems(_activeProjectTemplateId, newProjectId, startdatum);
    }

    const baseToast = savedId ? 'Projekt aktualisiert.' : 'Projekt angelegt.';
    const toastMsg = subitemsCreated > 0
      ? `${baseToast} ${subitemsCreated} Aktivität${subitemsCreated === 1 ? '' : 'en'} aus Template erstellt.`
      : baseToast;
    showToast(toastMsg);

    // v1.51.0: Bei neuen Projekten Modal nicht schließen — stattdessen Aktivitäten-
    // Bereich einblenden, damit der User direkt weitere Aktivitäten anlegen kann.
    if (isNewProject && newProjectId) {
      editingProjectId = newProjectId;
      _activeProjectTemplateId = null; // Sub-Items wurden bereits erstellt
      // Modal in Bearbeiten-Modus überführen + Aktivitäten-Bereich zeigen
      document.getElementById('modal-project-title').textContent = 'Projekt: ' + name;
      btn.textContent = 'Schließen';
      btn.onclick = closeProjectModalFromActivities;
      const delBtn = document.getElementById('p-delete-btn');
      if (delBtn) delBtn.style.display = 'inline-block';
      // Template-Auswahl ausblenden (Template kann nur einmal angewandt werden)
      const tplRow = document.getElementById('p-template-row');
      if (tplRow) tplRow.style.display = 'none';
      await showProjectActivitiesSection(newProjectId);
      btn.disabled = false;
      return;
    }

    closeProjectModal();

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
    if (!editingProjectId || btn.textContent === 'Wird angelegt ...' || btn.textContent === 'Wird gespeichert ...') {
      btn.textContent = editingProjectId ? 'Speichern' : 'Anlegen';
    }
  }
}

/** v1.51.0: „Schließen" nach Aktivitäten-Editierung — Modal zu, Listen refreshen. */
async function closeProjectModalFromActivities() {
  const id = editingProjectId;
  closeProjectModal();
  if (id && currentProjectDetailId === id) {
    await loadProjectDetail(id);
  } else if (currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active')) {
    await loadCompanyProjects(currentCompanyDetailId);
  } else {
    await loadProjects();
  }
}

/** v1.51.0: Blendet den Aktivitäten-Bereich ein, befüllt Datumsfelder mit
 *  Projektstart (oder heute), lädt das Service-Dropdown + die Liste. */
async function showProjectActivitiesSection(projectId) {
  const sec = document.getElementById('p-activities-section');
  if (!sec) return;
  const startdatum = document.getElementById('p-startdatum').value || toISODate(new Date());
  document.getElementById('pq-termin-datum').value = startdatum;
  document.getElementById('pq-aufgabe-faelligkeit').value = startdatum;
  document.getElementById('pq-einsatz-datum').value = startdatum;
  document.getElementById('pq-termin-titel').value = '';
  document.getElementById('pq-aufgabe-titel').value = '';
  document.getElementById('pq-einsatz-titel').value = '';

  // Service-Dropdown befüllen
  const services = await loadServicesCache();
  const sel = document.getElementById('pq-einsatz-service');
  sel.innerHTML = '<option value="">— Leistung wählen —</option>' +
    services.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');

  sec.style.display = '';
  await renderProjectModalActivities(projectId);
}

async function renderProjectModalActivities(projectId) {
  const list = document.getElementById('p-activities-list');
  if (!list) return;
  list.innerHTML = '<div class="info-card-empty">Lade ...</div>';

  const [apptRes, taskRes, depRes] = await Promise.all([
    db.from('appointments').select('id, titel, datum, status').is('deleted_at', null).eq('project_id', projectId).order('datum'),
    db.from('tasks').select('id, titel, faelligkeit, status').is('deleted_at', null).eq('project_id', projectId).order('faelligkeit'),
    db.from('deployments').select('id, titel, datum_von, status').is('deleted_at', null).eq('project_id', projectId).order('datum_von')
  ]);

  const items = [
    ...(apptRes.data || []).map(a => ({ kind: 'Termin', icon: 'T', id: a.id, titel: a.titel || '—', datum: a.datum, status: a.status })),
    ...(taskRes.data || []).map(t => ({ kind: 'Aufgabe', icon: 'A', id: t.id, titel: t.titel || '—', datum: t.faelligkeit, status: t.status })),
    ...(depRes.data  || []).map(d => ({ kind: 'Einsatz', icon: 'E', id: d.id, titel: d.titel || '—', datum: d.datum_von, status: d.status }))
  ];

  if (items.length === 0) {
    list.innerHTML = '<div class="info-card-empty">Noch keine Aktivitäten — leg über die Karten oben los.</div>';
    return;
  }

  // Sortierung nach Datum (NULLs ans Ende)
  items.sort((a, b) => {
    if (!a.datum && !b.datum) return 0;
    if (!a.datum) return 1;
    if (!b.datum) return -1;
    return a.datum.localeCompare(b.datum);
  });

  list.innerHTML = items.map(it => `
    <div class="p-activity-row">
      <span class="p-activity-kind p-activity-kind-${it.kind.toLowerCase()}">${esc(it.kind)}</span>
      <span class="p-activity-date">${it.datum ? esc(formatDateCompact(it.datum)) : '—'}</span>
      <span class="p-activity-titel">${esc(it.titel)}</span>
      <span class="p-activity-status">${esc(it.status || '')}</span>
    </div>
  `).join('');
}

/** v1.51.0: Quick-Add aus dem Projekt-Modal — direkt mit project_id einfügen. */
async function quickAddProjectActivity(typ) {
  if (!editingProjectId) { showToast('Erst Projekt speichern.', true); return; }
  const userId = currentProfile?.id || currentUser?.id || null;

  if (typ === 'termin') {
    const datum = document.getElementById('pq-termin-datum').value || null;
    const titel = document.getElementById('pq-termin-titel').value.trim();
    if (!titel) { showToast('Titel fehlt.', true); return; }
    const { error } = await db.from('appointments').insert({
      titel, datum, status: 'geplant', project_id: editingProjectId, erstellt_von: userId
    });
    if (error) { showToast('Fehler: ' + error.message, true); return; }
    document.getElementById('pq-termin-titel').value = '';
    showToast('Termin angelegt.');
  } else if (typ === 'aufgabe') {
    const faelligkeit = document.getElementById('pq-aufgabe-faelligkeit').value || null;
    const titel = document.getElementById('pq-aufgabe-titel').value.trim();
    if (!titel) { showToast('Titel fehlt.', true); return; }
    const { error } = await db.from('tasks').insert({
      titel, faelligkeit, status: 'offen',
      project_id: editingProjectId, assigned_to: userId, erstellt_von: userId
    });
    if (error) { showToast('Fehler: ' + error.message, true); return; }
    document.getElementById('pq-aufgabe-titel').value = '';
    showToast('Aufgabe angelegt.');
  } else if (typ === 'einsatz') {
    const datum = document.getElementById('pq-einsatz-datum').value || null;
    const titel = document.getElementById('pq-einsatz-titel').value.trim();
    const service_id = document.getElementById('pq-einsatz-service').value || null;
    if (!titel) { showToast('Titel fehlt.', true); return; }
    const { error } = await db.from('deployments').insert({
      titel, datum_von: datum, datum_bis: datum, status: 'Geplant',
      project_id: editingProjectId, service_id,
      menge: 1, einzelpreis: 0,
      erstellt_von: userId
    });
    if (error) { showToast('Fehler: ' + error.message, true); return; }
    document.getElementById('pq-einsatz-titel').value = '';
    showToast('Einsatz angelegt.');
  }
  await renderProjectModalActivities(editingProjectId);
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

  // v1.47.0: nur Verantwortlich + Hauptkontakt — alle anderen Felder
  // sind redundant in den 4 Stat-Cards oben (Status, Wirtschaftlichkeit
  // mit Umsatz, Zeitplan mit Daten, Offene Aufgaben).
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
  `;

  // Inline-Beschreibung (v1.30) — Kurzbeschreibung als Headline
  const beschreibungArea = document.getElementById('project-beschreibung-inline');
  if (beschreibungArea) {
    beschreibungArea.value = p.beschreibung || '';
    beschreibungArea.dataset.savedValue = p.beschreibung || '';
    beschreibungArea.dataset.projectId = p.id;
    document.getElementById('project-beschreibung-save-status').textContent = '';
  }
  // v1.52.0: Strukturierte Dokumentation (5 Felder mit Auto-Save on Blur)
  const docBlock = document.getElementById('project-documentation-block');
  if (docBlock) {
    docBlock.innerHTML = renderDocumentationBlock('projekt', p.dokumentation, {
      idPrefix: 'project-doc',
      inline: true,
      entityId: p.id
    });
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

  // v1.53.0: Themen-Sektion rendern
  invalidateThemesCache(p.id);
  renderProjectThemes(p.id);
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
      <tr data-appt-id="${esc(a.id)}" data-appt-status="${esc(a.status)}" data-company-id="${esc(a.company_id || '')}" data-contact-id="${esc(a.contact_id || '')}" data-project-id="${esc(a.project_id || '')}">
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
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))">${terminTypDotHtml(a.typ)}${esc(a.titel || '—')}</div>
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
  autoExpandSingleRow(tbody, 'appointment', sorted);
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
  // v1.48.0: Telefon/E-Mail jetzt im Header-Meta
  const kMeta = document.getElementById('contact-detail-meta');
  if (kMeta) kMeta.innerHTML = '';
  document.getElementById('contact-appointments-body').innerHTML = '<tr><td colspan="6"><div class="empty">Lade Termine ...</div></td></tr>';
  document.getElementById('contact-projects-body').innerHTML = '<tr><td colspan="6"><div class="empty">Lade Projekte ...</div></td></tr>';
  const kTasksBody = document.getElementById('contact-tasks-body');
  if (kTasksBody) kTasksBody.innerHTML = '<tr><td colspan="6"><div class="empty">Lade Aufgaben ...</div></td></tr>';

  const { data, error } = await db.from('contacts')
    .select('*, company:companies(id, name, strasse, plz, stadt, abc_klassifizierung)').is('deleted_at', null)
    .eq('id', contactId).single();

  if (error || !data) {
    const msg = friendlyFetchError(error, 'Kontakt');
    const kMetaErr = document.getElementById('contact-detail-meta');
    if (kMetaErr) kMetaErr.innerHTML = `<span style="color:var(--danger);font-size:13px">${esc(msg)}</span>`;
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

  // v1.48.0: Telefon/E-Mail jetzt im Header-Meta. Position+Firma stehen
  // bereits in der Subline — Doppelung vermeiden.
  renderDetailHeaderMeta('contact-detail-meta', {
    telefon: k.telefon,
    email: k.email
  });
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
      <tr data-appt-id="${esc(a.id)}" data-company-id="${esc(a.company_id || '')}" data-contact-id="${esc(a.contact_id || '')}">
        <td><div class="date-cell${isPast ? ' past' : ''}">${esc(formatDateDE(a.datum))}</div></td>
        <td class="col-tablet" style="color:var(--muted)">${esc(uhrzeit || '—')}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('appointment','${esc(a.id)}',this.closest('tr'))">${terminTypDotHtml(a.typ)}${esc(a.titel || '—')}</div>
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
  autoExpandSingleRow(tbody, 'appointment', sorted);
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

  // Pending-Filter aus Drill-Down anwenden (v1.44.12)
  if (pendingDeploymentsFilter) {
    if (pendingDeploymentsFilter.range)   document.getElementById('deployments-range-filter').value  = pendingDeploymentsFilter.range;
    if (pendingDeploymentsFilter.status)  document.getElementById('deployments-status-filter').value = pendingDeploymentsFilter.status;
    if (pendingDeploymentsFilter.firma)   companyFilter.value = pendingDeploymentsFilter.firma;
    if (pendingDeploymentsFilter.projekt) projectFilter.value = pendingDeploymentsFilter.projekt;
    pendingDeploymentsFilter = null;
  }

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
      <tr data-dep-id="${esc(d.id)}" data-company-id="${esc(d.company_id || '')}" data-project-id="${esc(d.project_id || '')}">
        <td>${renderDeploymentDateCell(d.datum_von, d.datum_bis)}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('deployment','${esc(d.id)}',this.closest('tr'))">${esc(d.titel || '—')}${d.datum_von ? ROW_CAL_ICON : ''}</div>
        </td>
        <td class="col-tablet">${firmaHtml}</td>
        <td class="col-desktop">${projektHtml}</td>
        <td class="col-desktop" style="color:var(--muted)">${leistungHtml}</td>
        <td><span class="badge" style="background:${esc(statusColor)}22;color:${esc(statusColor)}">${esc(d.status)}</span></td>
        <td class="col-tablet">${esc(formatPreis(gesamt))}</td>
        <td class="col-action" style="text-align:right">${renderActionIcons('deployment', d.id, renderDeploymentQuickStatusIcons(d))}</td>
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

  // v1.44.11: d-company ist eine Combobox — der Anzeigename steht im Input
  const companyInput = document.getElementById('d-company');
  const companyName = (companyInput?.value || '').trim();

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

  // v1.44.11: d-company ist eine Combobox — der Anzeigename steht im Input
  const companyInput = document.getElementById('d-company');
  const companyName = (companyInput?.value || '').trim();

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

  // v1.44.11: d-company ist eine Combobox
  fillCompanyCombobox('d-company', 'd-company-list');

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
  // v1.52.0: Doku-Block leer rendern (wird bei Edit überschrieben)
  document.getElementById('d-documentation-block').innerHTML =
    renderDocumentationBlock('einsatz', null, { idPrefix: 'd-doc' });
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
      setCompanyComboboxValue('d-company', 'd-company-list', deploymentModalPrefillCompanyId);
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
          setCompanyComboboxValue('d-company', 'd-company-list', proj.company_id);
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
    // v1.52.0: Doku-Block aus dokumentation befüllen
    document.getElementById('d-documentation-block').innerHTML =
      renderDocumentationBlock('einsatz', data.dokumentation, { idPrefix: 'd-doc' });
    document.getElementById('d-externe-techniker').value = data.externe_techniker || '';

    if (data.company_id) {
      setCompanyComboboxValue('d-company', 'd-company-list', data.company_id);
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

  setupDeploymentPreviewListeners();  // v1.38
  renderDeploymentPreview();           // v1.38

  await populateTemplateDropdown('einsatz', mode);

  // v1.53.0: Theme-Picker initialisieren — Edit-Modus mit existierenden Themen,
  // New-Modus leer. _deploymentInitialThemeIds spiegelt den DB-Stand für Save-Diff.
  const _projectSel = document.getElementById('d-project');
  const _initialProjectId = _projectSel ? (_projectSel.value || null) : null;
  let _initialThemeIds = [];
  if (mode === 'edit' && deploymentId) {
    _initialThemeIds = await fetchDeploymentThemeIds(deploymentId);
  }
  _deploymentInitialThemeIds = new Set(_initialThemeIds);
  await renderDeploymentThemePicker(_initialProjectId, _initialThemeIds);

  document.getElementById('modal-deployment').classList.add('open');
  setTimeout(() => document.getElementById('d-titel').focus(), 100);
}

function setupDeploymentModalListeners() {
  const companyInput = document.getElementById('d-company');
  const serviceSelect = document.getElementById('d-service');
  const datumVon = document.getElementById('d-datum-von');
  const datumBis = document.getElementById('d-datum-bis');
  const menge = document.getElementById('d-menge');
  const einzelpreis = document.getElementById('d-einzelpreis');

  // v1.44.11: Combobox-Input statt Select. Bei Match (existierende Firma)
  // werden Projekt-Dropdown und Adress-Auto-Fill getriggert.
  companyInput.oninput = async () => {
    const id = getCompanyComboboxId('d-company', 'd-company-list');
    await rebuildProjectDropdownForDeployment(id);
    updateDeploymentOrtHint();

    // Auto-Ort: Wenn Ort-Feld leer und Firma (mit Match) Adresse hat → übernehmen
    const ortInput = document.getElementById('d-ort');
    if (!ortInput.value.trim() && id) {
      const company = companiesCache.find(c => c.id === id);
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

  // v1.53.0: Projekt-Wechsel mit existierenden Theme-Zuordnungen → Confirm-Dialog
  const projectSel = document.getElementById('d-project');
  projectSel.onchange = async () => {
    const newProjectId = projectSel.value || null;
    const ok = await confirmDeploymentProjectSwitch(newProjectId);
    if (!ok) {
      projectSel.value = _deploymentLastProjectId || '';
      return;
    }
    _deploymentSelectedThemeIds = new Set();
    _deploymentInitialThemeIds  = new Set();
    await renderDeploymentThemePicker(newProjectId, []);
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
  const companyId = getCompanyComboboxId('d-company', 'd-company-list');
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
  const companyId = getCompanyComboboxId('d-company', 'd-company-list');
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
  const project_id    = document.getElementById('d-project').value || null;
  const service_id    = document.getElementById('d-service').value || null;
  const mengeRaw      = document.getElementById('d-menge').value;
  const einzelRaw     = document.getElementById('d-einzelpreis').value;
  const ort           = document.getElementById('d-ort').value.trim();
  const beschreibungInput = document.getElementById('d-beschreibung').value.trim();
  // v1.52.0: dokumentation aus dem Doku-Block (statt freier notizen-Textarea)
  const dokumentation = readDocumentationFromDom('einsatz', 'd-doc');
  const externe_techniker = document.getElementById('d-externe-techniker').value.trim();
  const createAppointment = document.getElementById('d-create-appointment').checked;
  const btn           = document.getElementById('d-save-btn');

  // Auto-Titel + Auto-Beschreibung nur beim Neu-Anlegen (nicht beim Edit)
  const isNew = !editingDeploymentId;
  // v1.44.11: Firma-Combobox auflösen — legt ggf. eine neue Firma an.
  // Muss VOR Auto-Titel-Generierung passieren, damit der Firmen-Name
  // im Cache steht.
  let company_id = null;
  try {
    company_id = await resolveCompanyComboboxValue('d-company', 'd-company-list');
  } catch (e) {
    return;
  }

  const finalTitel = titel || (isNew ? generateDeploymentAutoTitle() : '');
  const finalBeschreibung = beschreibungInput || (isNew ? generateDeploymentAutoDescription() : '');

  if (!finalTitel) { showToast('Bitte Titel eingeben (oder Leistung/Firma wählen für Auto-Titel).', true); return; }
  if (!company_id) { showToast('Bitte Firma auswählen oder neuen Namen tippen.', true); return; }

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
      dokumentation,
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

    // ──────── v1.53.0: Themen-Zuordnung syncen ────────
    try {
      await syncDeploymentThemes(saved.id);
    } catch (e) {
      console.warn('Themen-Zuordnung konnte nicht synchronisiert werden:', e.message);
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
  const companyId = getCompanyComboboxId('d-company', 'd-company-list');
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
      <tr data-dep-id="${esc(d.id)}" data-company-id="${esc(d.company_id || '')}" data-project-id="${esc(d.project_id || '')}">
        <td>${renderDeploymentDateCell(d.datum_von, d.datum_bis)}</td>
        <td>
          <div class="cell-link" onclick="toggleRowExpand('deployment','${esc(d.id)}',this.closest('tr'))">${esc(d.titel || '—')}${d.datum_von ? ROW_CAL_ICON : ''}</div>
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
      <tr data-dep-id="${esc(d.id)}" data-dep-status="${esc(d.status)}" data-company-id="${esc(d.company_id || '')}" data-project-id="${esc(d.project_id || '')}">
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
          <div class="cell-link" onclick="toggleRowExpand('deployment','${esc(d.id)}',this.closest('tr'))">${esc(d.titel || '—')}${d.datum_von ? ROW_CAL_ICON : ''}</div>
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
  // v2.0.0 — Arbeitsplatz-Kontext-Picker-Modus: Auswahl setzt Kontext statt Navigation
  if (window._arbeitsplatzContextPickerActive) {
    const typeMap = { company: 'firma', contact: 'kontakt', project: 'projekt' };
    const ctxType = typeMap[entry.type];
    if (ctxType) { setArbeitsplatzContextFromSearch(ctxType, entry.id, entry.title); return; }
  }
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

  // v1.47.0: Firma-Detail hat nur noch 3 Tabs. Alte URLs/Bookmarks auf
  // entfernte Tabs werden umgemappt: Kontakte/Mitgliedschaften → Stammdaten,
  // Termine/Aufgaben/Einsätze → Aktivitäten.
  if (entityType === 'company') {
    const COMPANY_TAB_ALIASES = {
      kontakte: 'stammdaten',
      mitgliedschaften: 'stammdaten',
      termine: 'aktivitaeten',
      aufgaben: 'aktivitaeten',
      einsaetze: 'aktivitaeten'
    };
    if (COMPANY_TAB_ALIASES[tabKey]) tabKey = COMPANY_TAB_ALIASES[tabKey];
  }

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
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)').is('deleted_at', null)
      .eq('company_id', companyId).eq('status', 'durchgefuehrt')
      .order('datum', { ascending: false }).limit(1),
    // Letzter durchgeführter/abgerechneter Einsatz
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('company_id', companyId).in('status', ['Durchgeführt', 'Abgerechnet'])
      .not('datum_von', 'is', null).order('datum_von', { ascending: false }).limit(1),
    // Bevorstehender geplanter Termin
    db.from('appointments')
      .select('id, titel, datum, uhrzeit_von, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)').is('deleted_at', null)
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
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)').is('deleted_at', null)
      .eq('contact_id', contactId).eq('status', 'durchgefuehrt')
      .order('datum', { ascending: false }).limit(1),
    db.from('appointments')
      .select('id, titel, datum, uhrzeit_von, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)').is('deleted_at', null)
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
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)').is('deleted_at', null)
      .eq('project_id', p.id).eq('status', 'durchgefuehrt')
      .order('datum', { ascending: false }).limit(1),
    // Letzter durchgeführter/abgerechneter Einsatz
    db.from('deployments')
      .select('id, titel, datum_von').is('deleted_at', null)
      .eq('project_id', p.id).in('status', ['Durchgeführt', 'Abgerechnet'])
      .not('datum_von', 'is', null).order('datum_von', { ascending: false }).limit(1),
    // Bevorstehender geplanter Termin
    db.from('appointments')
      .select('id, titel, datum, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)').is('deleted_at', null)
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

// In-Memory-Cache für die gerenderte Detail-HTML der Inline-Expand-Dashboards (v1.38.1).
// TTL 30 s — bei Status-Wechseln/Refreshes invalidieren wir gezielt.
const _expandedDetailCache = new Map();   // key: `${type}:${id}` → { html, ts }
const _EXPANDED_CACHE_TTL_MS = 30 * 1000;

function getExpandedDetailCached(type, id) {
  const key = `${type}:${id}`;
  const entry = _expandedDetailCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > _EXPANDED_CACHE_TTL_MS) {
    _expandedDetailCache.delete(key);
    return null;
  }
  return entry.html;
}
function setExpandedDetailCache(type, id, html) {
  _expandedDetailCache.set(`${type}:${id}`, { html, ts: Date.now() });
}
function invalidateExpandedDetailCache(type, id) {
  if (id) _expandedDetailCache.delete(`${type}:${id}`);
  else _expandedDetailCache.clear();
}

/** Skeleton-Stand-In, der sofort beim Klick gerendert wird, während die Queries laufen.
 *  Zeigt Platzhalter-Stats und einen dezenten Lade-Hinweis. */
function renderExpandedSkeleton() {
  const greyPill = `<span class="badge" style="background:#f3f4f6;color:transparent">———</span>`;
  const stats = Array.from({ length: 5 }).map(() => `
    <div class="erp-stat-item">
      <div class="erp-stat-label" style="background:#f3f4f6;color:transparent;width:60%;border-radius:3px">—</div>
      <div class="erp-stat-value" style="background:#f3f4f6;color:transparent;width:80%;border-radius:3px;margin-top:4px">—</div>
    </div>`).join('');
  return `
    <div class="erp-stats">${stats}</div>
    <div style="padding:14px 18px;color:var(--muted);font-size:13px;text-align:center">Lade Details …</div>`;
}

/** Hint-Lookup: liest aus den Listen-Caches die FK-IDs, damit die Render-Funktionen
 *  Welle 1 und Welle 2 der DB-Queries parallel feuern können (v1.38.1).
 *  v1.38.2: Fallback auf rowEl.dataset (für Sub-Tabs, deren Daten nicht im Haupt-Cache sind).
 *  Zusätzlicher Fallback (v1.38.2): Aus dem App-State (currentCompanyDetailId etc.), denn
 *  in einem Firma-/Projekt-Sub-Tab haben alle Zeilen denselben FK-Bezug. */
function lookupExpandHint(type, id, rowEl) {
  // 1. Listen-Cache (Hauptliste)
  let cacheHit = null;
  if (type === 'appointment') cacheHit = appointmentsCache.find(x => x.id === id);
  else if (type === 'deployment') cacheHit = deploymentsCache.find(x => x.id === id);
  else if (type === 'task') cacheHit = tasksCache.find(x => x.id === id);

  if (cacheHit) {
    return {
      company_id: cacheHit.company_id || null,
      contact_id: cacheHit.contact_id || null,
      project_id: cacheHit.project_id || null
    };
  }

  // 2. data-Attribute auf der <tr> (Sub-Tab-Listen)
  const ds = rowEl?.dataset || {};
  const fromRow = {
    company_id: ds.companyId || null,
    contact_id: ds.contactId || null,
    project_id: ds.projectId || null
  };

  // 3. App-State-Fallback: in Sub-Tabs ist der FK-Bezug oft implizit klar
  const onCompanyTab = currentCompanyDetailId && document.getElementById('page-company-detail').classList.contains('active');
  const onContactTab = currentContactDetailId && document.getElementById('page-contact-detail').classList.contains('active');
  const onProjectTab = currentProjectDetailId && document.getElementById('page-project-detail').classList.contains('active');

  if (onCompanyTab && !fromRow.company_id) fromRow.company_id = currentCompanyDetailId;
  if (onProjectTab && !fromRow.project_id) fromRow.project_id = currentProjectDetailId;
  if (onContactTab && type === 'task' && !fromRow.contact_id) fromRow.contact_id = currentContactDetailId;

  // Nur einen Hint zurückgeben, wenn mindestens eine FK-ID bekannt ist
  return (fromRow.company_id || fromRow.contact_id || fromRow.project_id) ? fromRow : null;
}

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

  // Neue Expand-Row einfügen — sofort mit Skeleton (v1.38.1)
  const panelRow = document.createElement('tr');
  panelRow.className = 'expanded-row';
  const colCount = rowEl.querySelectorAll('td').length || 1;
  const td = document.createElement('td');
  td.colSpan = colCount;
  panelRow.appendChild(td);
  rowEl.parentNode.insertBefore(panelRow, rowEl.nextSibling);
  rowEl.classList.add('row-expanded');

  _expandedRow = { type: entityType, id: entityId, rowEl, panelRow };

  // Cache-Hit? → direkt aus Cache rendern, keine DB-Query
  const cachedHtml = getExpandedDetailCached(entityType, entityId);
  if (cachedHtml) {
    td.innerHTML = `<div class="expanded-row-panel-inner">${cachedHtml}</div>`;
    return;
  }

  // Cache-Miss → Skeleton sofort + Daten laden
  td.innerHTML = `<div class="expanded-row-panel-inner">${renderExpandedSkeleton()}</div>`;
  const hint = lookupExpandHint(entityType, entityId, rowEl);

  try {
    let html = '';
    if (entityType === 'appointment')      html = await renderAppointmentExpandedRow(entityId, hint);
    else if (entityType === 'deployment')  html = await renderDeploymentExpandedRow(entityId, hint);
    else if (entityType === 'task')        html = await renderTaskExpandedRow(entityId, hint);

    // Nur in den DOM schreiben, wenn die Zeile noch geöffnet ist (User hat nicht zwischenzeitlich woanders geklickt)
    if (_expandedRow.id === entityId && _expandedRow.type === entityType) {
      td.innerHTML = `<div class="expanded-row-panel-inner">${html}</div>`;
      setExpandedDetailCache(entityType, entityId, html);
    }
  } catch (e) {
    td.innerHTML = `<div class="expanded-row-panel-inner"><div class="info-card-empty">Fehler: ${esc(e.message)}</div></div>`;
  }
}

/** Baut das Termin-Inline-Dashboard (v1.27).
 *  Lädt den Termin + Kontextdaten + 3 verwandte Termine + offene Aufgaben. */
async function renderAppointmentExpandedRow(appointmentId, hint) {
  const todayISO = toISODate(new Date());
  const placeholderUuid = '00000000-0000-0000-0000-000000000000';

  // Wenn ein hint mit company_id/contact_id da ist: Welle 1 + 2 parallel feuern (v1.38.1).
  // Sonst sequentiell wie vorher.
  let apptResult, relAppts, openTasksForCompanyOrContact;

  const apptPromise = db.from('appointments')
    .select(`
      *,
      typ:lookup_values!appointments_typ_id_fkey(id, wert, farbe),
      company:companies(id, name, abc_klassifizierung),
      contact:contacts(id, vorname, nachname, telefon, email),
      project:projects(id, name, status),
      deployment:deployments(id, titel, status)
    `)
    .is('deleted_at', null).eq('id', appointmentId).single();

  if (hint) {
    const relApptsPromise = hint.company_id
      ? db.from('appointments')
          .select('id, titel, datum, status, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)')
          .is('deleted_at', null).eq('company_id', hint.company_id).neq('id', appointmentId)
          .order('datum', { ascending: false }).limit(3)
      : Promise.resolve({ data: [] });
    const tasksPromise = (hint.company_id || hint.contact_id)
      ? db.from('tasks')
          .select('id, titel, faelligkeit, status, company:companies(id, name), contact:contacts(id, vorname, nachname)')
          .is('deleted_at', null)
          .or(`company_id.eq.${hint.company_id || placeholderUuid},contact_id.eq.${hint.contact_id || placeholderUuid}`)
          .neq('status', 'erledigt').order('faelligkeit', { ascending: true, nullsFirst: false }).limit(3)
      : Promise.resolve({ data: [] });

    [apptResult, relAppts, openTasksForCompanyOrContact] = await Promise.all([apptPromise, relApptsPromise, tasksPromise]);
  } else {
    apptResult = await apptPromise;
  }

  if (apptResult.error || !apptResult.data) {
    return `<div class="info-card-empty">Termin konnte nicht geladen werden.</div>`;
  }
  const a = apptResult.data;

  // Wenn kein Hint: Welle 2 jetzt nachholen
  if (!hint) {
    [relAppts, openTasksForCompanyOrContact] = await Promise.all([
      a.company_id
        ? db.from('appointments')
            .select('id, titel, datum, status, typ:lookup_values!appointments_typ_id_fkey(wert, farbe)')
            .is('deleted_at', null).eq('company_id', a.company_id).neq('id', appointmentId)
            .order('datum', { ascending: false }).limit(3)
        : Promise.resolve({ data: [] }),
      db.from('tasks')
        .select('id, titel, faelligkeit, status, company:companies(id, name), contact:contacts(id, vorname, nachname)')
        .is('deleted_at', null)
        .or(`company_id.eq.${a.company_id || placeholderUuid},contact_id.eq.${a.contact_id || placeholderUuid}`)
        .neq('status', 'erledigt').order('faelligkeit', { ascending: true, nullsFirst: false }).limit(3)
    ]);
  }

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

  const mainHtml = `
    <div class="erp-context-main">
      <div class="erp-kv">
        <div class="erp-kv-label">Firma</div>      <div class="erp-kv-value">${firmaVal}</div>
        <div class="erp-kv-label">Kontakt</div>    <div class="erp-kv-value">${kontaktVal}</div>
        <div class="erp-kv-label">Projekt</div>    <div class="erp-kv-value">${projektVal}</div>
        <div class="erp-kv-label">Ort</div>        <div class="erp-kv-value">${ortVal}</div>
        <div class="erp-kv-label">Notizen</div>    <div class="erp-kv-value">${notizenVal}</div>
      </div>
    </div>`;

  // Verwandte Termine derselben Firma
  const relHtml = (relAppts.data || []).length > 0
    ? `<div class="erp-related">
         <div class="erp-section-title">Letzte Termine derselben Firma</div>
         ${relAppts.data.map(r => `
           <div class="erp-related-row">
             <div class="erp-related-date">${esc(formatDateDE(r.datum))}</div>
             <div class="erp-related-title" onclick="openAppointmentModal('edit','${esc(r.id)}')">${terminTypDotHtml(r.typ)}${esc(r.titel || '—')}</div>
             <div class="erp-related-meta">${esc(r.typ?.wert || '')} · ${esc(appointmentStatusLabel(r.status))}</div>
           </div>
         `).join('')}
       </div>`
    : '';

  // Offene Aufgaben im Kontext (Firma oder Kontakt) — Meta zeigt Kunden-Name + Status (v1.35.2)
  const taskRows = (openTasksForCompanyOrContact.data || []);
  const tasksHtml = taskRows.length > 0
    ? `<div class="erp-related">
         <div class="erp-section-title">Offene Aufgaben (Firma / Kontakt)</div>
         ${taskRows.map(t => {
           const overdue = t.faelligkeit && t.faelligkeit < todayISO;
           // Kontakt hat Vorrang vor Firma (analog zum Aufgabe-Dashboard v1.33)
           const customerLabel = (t.contact ? [t.contact.vorname, t.contact.nachname].filter(Boolean).join(' ') : '')
             || t.company?.name
             || '';
           const statusText = overdue ? 'überfällig' : aufgabeStatusLabel(t.status);
           return `
             <div class="erp-related-row">
               <div class="erp-related-date">${t.faelligkeit ? esc(formatDateDE(t.faelligkeit)) : '<span style="color:var(--muted)">—</span>'}</div>
               <div class="erp-related-title" onclick="openTaskModal('edit','${esc(t.id)}')">${esc(t.titel || '—')}</div>
               <div class="erp-related-meta" ${overdue ? 'style="color:var(--danger);font-weight:600"' : ''}>${customerLabel ? esc(customerLabel) + ' · ' : ''}${esc(statusText)}</div>
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

  const asideContent = relHtml + tasksHtml;
  const contextClass = asideContent ? 'erp-context-block' : 'erp-context-block erp-context-block-single';
  const asideWrap = asideContent ? `<div class="erp-context-aside">${asideContent}</div>` : '';
  return `
    ${statsHtml}
    <div class="erp-body">
      <div class="${contextClass}">${mainHtml}${asideWrap}</div>
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
  invalidateExpandedDetailCache();  // v1.38.1: Detail-Cache leeren, damit frische Daten beim nächsten Aufklappen kommen
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
async function renderDeploymentExpandedRow(deploymentId, hint) {
  // Welle 1 (Hauptobjekt) und Welle 2 (Techniker/gekoppelter Termin/Bonus/Historie/Projekt-Einsätze)
  // parallel feuern, wenn ein Hint mit company_id/project_id da ist (v1.38.1).
  const depPromise = db.from('deployments')
    .select(`
      *,
      company:companies(id, name, abc_klassifizierung),
      service:services(id, name, einheit),
      project:projects(id, name, status, geschaetzter_umsatz)
    `)
    .is('deleted_at', null).eq('id', deploymentId).single();

  // Diese drei brauchen nur die deploymentId — sofort starten
  const technikerPromise = db.from('deployment_technicians')
    .select('user_id, user:user_profiles!deployment_technicians_user_id_fkey(id, name)')
    .eq('deployment_id', deploymentId);
  const linkedApptPromise = db.from('appointments')
    .select('id, titel, datum, status')
    .is('deleted_at', null).eq('deployment_id', deploymentId).limit(1);
  const redemptionPromise = db.from('entitlement_redemptions')
    .select('id, menge_eingeloest')
    .eq('deployment_id', deploymentId).limit(1);

  // Diese zwei brauchen company_id / project_id — aus Hint, sonst null und nachholen
  const buildRelPromise = (cid) => cid
    ? db.from('deployments')
        .select('id, titel, datum_von, status, menge, einzelpreis')
        .is('deleted_at', null).eq('company_id', cid).neq('id', deploymentId)
        .order('datum_von', { ascending: false, nullsFirst: false }).limit(3)
    : Promise.resolve({ data: [] });
  const buildProjDepsPromise = (pid) => pid
    ? db.from('deployments')
        .select('menge, einzelpreis').is('deleted_at', null).eq('project_id', pid)
    : Promise.resolve({ data: [] });

  let depResult, technikerResult, linkedApptResult, redemptionResult, relResult, projectDepsResult;

  if (hint) {
    [depResult, technikerResult, linkedApptResult, redemptionResult, relResult, projectDepsResult] =
      await Promise.all([
        depPromise, technikerPromise, linkedApptPromise, redemptionPromise,
        buildRelPromise(hint.company_id), buildProjDepsPromise(hint.project_id)
      ]);
  } else {
    // Ohne Hint: Hauptobjekt zuerst, damit wir company_id/project_id für Welle 2 haben
    [depResult, technikerResult, linkedApptResult, redemptionResult] = await Promise.all([
      depPromise, technikerPromise, linkedApptPromise, redemptionPromise
    ]);
    if (!depResult.error && depResult.data) {
      [relResult, projectDepsResult] = await Promise.all([
        buildRelPromise(depResult.data.company_id),
        buildProjDepsPromise(depResult.data.project_id)
      ]);
    } else {
      relResult = { data: [] };
      projectDepsResult = { data: [] };
    }
  }

  if (depResult.error || !depResult.data) {
    return `<div class="info-card-empty">Einsatz konnte nicht geladen werden.</div>`;
  }
  const d = depResult.data;

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

  const mainHtml = `
    <div class="erp-context-main">
      <div class="erp-kv">
        <div class="erp-kv-label">Firma</div>     <div class="erp-kv-value">${firmaVal}</div>
        <div class="erp-kv-label">Leistung</div>  <div class="erp-kv-value">${serviceVal}</div>
        <div class="erp-kv-label">Techniker</div> <div class="erp-kv-value">${technikerVal}</div>
        <div class="erp-kv-label">Uhrzeit</div>   <div class="erp-kv-value">${zeitVal}</div>
        <div class="erp-kv-label">Menge × €</div> <div class="erp-kv-value">${mengeVal}</div>
        <div class="erp-kv-label">Ort</div>       <div class="erp-kv-value">${ortVal}</div>
        <div class="erp-kv-label">Notizen</div>   <div class="erp-kv-value">${notizenVal}</div>
      </div>
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

  const asideContent = projektKontextHtml + relHtml;
  const contextClass = asideContent ? 'erp-context-block' : 'erp-context-block erp-context-block-single';
  const asideWrap = asideContent ? `<div class="erp-context-aside">${asideContent}</div>` : '';
  return `
    ${statsHtml}
    <div class="erp-body">
      <div class="${contextClass}">${mainHtml}${asideWrap}</div>
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
  invalidateExpandedDetailCache();  // v1.38.1
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
async function renderTaskExpandedRow(taskId, hint) {
  // Welle 1 + 2 parallel feuern, wenn Hint da ist (v1.38.1).
  const taskPromise = db.from('tasks')
    .select(`
      *,
      assigned:user_profiles!tasks_assigned_to_fkey(id, name, email),
      company:companies(id, name),
      contact:contacts(id, vorname, nachname),
      project:projects(id, name, status)
    `)
    .is('deleted_at', null).eq('id', taskId).single();

  const buildRelPromise = (cid, kid) => {
    const orParts = [];
    if (cid) orParts.push(`company_id.eq.${cid}`);
    if (kid) orParts.push(`contact_id.eq.${kid}`);
    return orParts.length
      ? db.from('tasks')
          .select('id, titel, faelligkeit, status, company:companies(id, name), contact:contacts(id, vorname, nachname)')
          .is('deleted_at', null).neq('id', taskId).neq('status', 'erledigt')
          .or(orParts.join(','))
          .order('faelligkeit', { ascending: true, nullsFirst: false }).limit(3)
      : Promise.resolve({ data: [] });
  };

  let taskResult, relResult;
  if (hint) {
    [taskResult, relResult] = await Promise.all([taskPromise, buildRelPromise(hint.company_id, hint.contact_id)]);
  } else {
    taskResult = await taskPromise;
  }

  if (taskResult.error || !taskResult.data) {
    return `<div class="info-card-empty">Aufgabe konnte nicht geladen werden.</div>`;
  }
  const t = taskResult.data;
  const todayISO = toISODate(new Date());

  if (!hint) {
    relResult = await buildRelPromise(t.company_id, t.contact_id);
  }

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

  const mainHtml = `
    <div class="erp-context-main">
      <div class="erp-kv">
        <div class="erp-kv-label">Firma</div>         <div class="erp-kv-value">${firmaVal}</div>
        <div class="erp-kv-label">Kontakt</div>       <div class="erp-kv-value">${kontaktVal}</div>
        <div class="erp-kv-label">Projekt</div>       <div class="erp-kv-value">${projektVal}</div>
        <div class="erp-kv-label">Beschreibung</div>  <div class="erp-kv-value">${beschreibungVal}</div>
        <div class="erp-kv-label">Notizen</div>       <div class="erp-kv-value">${notizenVal}</div>
      </div>
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

  const asideContent = relHtml;
  const contextClass = asideContent ? 'erp-context-block' : 'erp-context-block erp-context-block-single';
  const asideWrap = asideContent ? `<div class="erp-context-aside">${asideContent}</div>` : '';
  return `
    ${statsHtml}
    <div class="erp-body">
      <div class="${contextClass}">${mainHtml}${asideWrap}</div>
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
  // v1.43: „Alle Mitarbeiter" als zusätzliche Option oben
  select.innerHTML = `<option value="__all__">Alle Mitarbeiter</option>`
    + userProfilesCache
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

  // Events parallel laden — bei userId='__all__' ohne Personen-Filter (v1.43.0)
  const isAll = userId === '__all__';
  const apptQuery = db.from('appointments')
    .select('id, titel, datum, uhrzeit_von, status, company:companies(name), typ:lookup_values!appointments_typ_id_fkey(wert, farbe)')
    .is('deleted_at', null)
    .gte('datum', startISO).lte('datum', endISO);
  if (!isAll) apptQuery.eq('erstellt_von', userId);

  const [depRes, apptRes] = await Promise.all([
    isAll
      // „Alle": direkt alle Einsätze laden, ohne Join über deployment_technicians
      ? db.from('deployments')
          .select('id, titel, datum_von, datum_bis, status, deleted_at, company:companies(name)')
          .is('deleted_at', null)
      : db.from('deployment_technicians')
          .select('deployment:deployments!inner(id, titel, datum_von, datum_bis, status, deleted_at, company:companies(name))')
          .eq('user_id', userId),
    apptQuery
  ]);

  const deployments = isAll
    ? (depRes.data || []).filter(d => d && !d.deleted_at && d.datum_von)
    : (depRes.data || [])
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
            ${terminTypDotHtml(a.typ)}${a.uhrzeit_von ? esc(formatTime(a.uhrzeit_von)) + ' · ' : ''}${esc(a.titel || '—')}
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

// ═══════════════════════════════════════════════════════════
//  QUICK-CREATE FIRMA / KONTAKT (v1.43.0)
// ═══════════════════════════════════════════════════════════
//
// Inline-Anlegen von Firma/Kontakt aus anderen Modals heraus, ohne
// das Eltern-Modal zu verlassen. Pflichtfelder: nur Name (Firma)
// bzw. Vor+Nachname (Kontakt). Nach Save wird das Ziel-Select
// neu populiert und der neue Eintrag direkt selektiert.

let _qcTargetSelectId = null;       // Ziel-Select-ID, in den der neue Eintrag gewählt wird
let _qcContextCompanySelectId = null; // Bei Kontakt-Quick-Create: Firma aus diesem Select vorbelegen

function openQuickCreateCompany(targetSelectId) {
  _qcTargetSelectId = targetSelectId;
  document.getElementById('qf-name').value = '';
  document.getElementById('modal-quick-firma').classList.add('open');
  setTimeout(() => document.getElementById('qf-name').focus(), 100);
}

function closeQuickCreateCompany() {
  document.getElementById('modal-quick-firma').classList.remove('open');
  _qcTargetSelectId = null;
}

async function saveQuickCreateCompany() {
  const name = document.getElementById('qf-name').value.trim();
  if (!name) { showToast('Bitte Firmenname eingeben.', true); return; }
  const targetId = _qcTargetSelectId;
  const btn = document.getElementById('qf-save-btn');

  btn.disabled = true; btn.textContent = 'Wird angelegt …';
  try {
    // Default-Typ: erster aktiver „unternehmens_typ" aus den Lookups
    const typen = await loadUnternehmensTypen();
    const default_typ_id = typen[0]?.id || null;
    if (!default_typ_id) {
      throw new Error('Kein Firmen-Typ verfügbar — bitte unter Stammdaten einen anlegen.');
    }
    const { data, error } = await db.from('companies')
      .insert({ name, typ_id: default_typ_id, land: 'Deutschland' })
      .select('id, name').single();
    if (error) throw new Error(error.message);

    // Cache aktualisieren + neue Firma vorne einsortieren (alphabetisch)
    companiesCache.push({ id: data.id, name: data.name });
    companiesCache.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'de'));

    // Ziel-Select neu populieren — Platzhalter-Option (falls vorhanden) erhalten
    if (targetId) {
      const sel = document.getElementById(targetId);
      if (sel) {
        const placeholderHtml = sel.querySelector('option[value=""]')?.outerHTML || '';
        sel.innerHTML = placeholderHtml + companiesCache
          .map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
        sel.value = data.id;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    closeQuickCreateCompany();
    showToast(`Firma „${name}" angelegt — du kannst sie später ergänzen.`);
  } catch (e) {
    showToast('Fehler: ' + e.message, true);
  } finally {
    btn.disabled = false; btn.textContent = 'Anlegen';
  }
}

/* ───────────────────────────────────────────────
   FIRMA-COMBOBOX (v1.44.11)
   Analog zur Kontakt-Combobox — ersetzt das Firma-<select> + Plus-Button.
   User tippt → Datalist filtert vorhandene Firmen. Beim Speichern:
   - Match in Liste → existierende Firma-ID
   - Nicht-leer & nicht in Liste → neue Firma (nur Name) wird angelegt
   - Leer → null
   ─────────────────────────────────────────────── */

function fillCompanyCombobox(inputId, datalistId) {
  const input = document.getElementById(inputId);
  const dl = document.getElementById(datalistId);
  if (!input || !dl) return;
  input.placeholder = 'Firma wählen oder neuen Namen tippen …';
  dl.innerHTML = (companiesCache || []).map(c =>
    `<option data-id="${esc(c.id)}" value="${esc(c.name)}"></option>`
  ).join('');
}

function setCompanyComboboxValue(inputId, datalistId, companyId) {
  const input = document.getElementById(inputId);
  const dl = document.getElementById(datalistId);
  if (!input) return;
  if (!companyId) {
    input.value = '';
    input.dataset.resolvedId = '';
    return;
  }
  const opt = dl ? Array.from(dl.options).find(o => o.dataset.id === companyId) : null;
  if (opt) {
    input.value = opt.value;
    input.dataset.resolvedId = companyId;
    return;
  }
  // Fallback aus Cache, falls Datalist noch nicht aktualisiert ist
  const company = (companiesCache || []).find(c => c.id === companyId);
  if (company) {
    input.value = company.name;
    input.dataset.resolvedId = companyId;
  }
}

/** Synchroner Lookup für onInput-Handler: gibt nur eine ID zurück, wenn der
 *  Text exakt zu einer Liste-Option passt — sonst leer. Wird genutzt um
 *  abhängige Dropdowns (Kontakt, Projekt) live nachzuladen, ohne dass
 *  bereits eine neue Firma angelegt wird. */
function getCompanyComboboxId(inputId, datalistId) {
  const input = document.getElementById(inputId);
  const dl = document.getElementById(datalistId);
  if (!input || !dl) return '';
  const value = (input.value || '').trim();
  if (!value) return '';
  const opt = Array.from(dl.options).find(o => o.value === value);
  return opt && opt.dataset.id ? opt.dataset.id : '';
}

async function resolveCompanyComboboxValue(inputId, datalistId) {
  const input = document.getElementById(inputId);
  const dl = document.getElementById(datalistId);
  if (!input) return null;
  const value = (input.value || '').trim();
  if (!value) return null;
  if (dl) {
    const opt = Array.from(dl.options).find(o => o.value === value);
    if (opt && opt.dataset.id) return opt.dataset.id;
  }
  // Nicht in Liste → neue Firma anlegen (nur Name, Rest später ergänzen)
  const { data, error } = await db.from('companies')
    .insert({ name: value, erstellt_von: currentProfile?.id })
    .select('id, name').single();
  if (error) {
    showToast('Fehler beim Anlegen der Firma: ' + error.message, true);
    throw error;
  }
  if (Array.isArray(companiesCache)) companiesCache.push({ id: data.id, name: data.name });
  showToast(`Firma „${value}" angelegt.`);
  return data.id;
}

/* ───────────────────────────────────────────────
   KONTAKT-COMBOBOX (v1.44.10)
   Ersetzt das Kontakt-<select> + Plus-Button durch ein <input list="…"> mit
   <datalist>. User kann tippen oder aus Liste wählen. Ergebnis:
   - Match in Liste → existierende Kontakt-ID
   - Nicht-leer & nicht in Liste → neuer Kontakt wird beim Speichern angelegt
     (Vorname = erstes Wort, Nachname = Rest, Fallback „—")
   - Leer → null
   ─────────────────────────────────────────────── */

async function fillContactCombobox(inputId, datalistId, companyId) {
  const input = document.getElementById(inputId);
  const dl = document.getElementById(datalistId);
  if (!input || !dl) return;
  // v1.44.11: Kontakt darf auch ohne Firma angelegt werden — Input bleibt
  // immer enabled. Ohne Firma ist die Datalist leer (oder zeigt nichts an,
  // weil eine Liste aller Kontakte ohne Firmenkontext nicht hilfreich ist).
  input.value = '';
  input.dataset.resolvedId = '';
  input.disabled = false;
  if (!companyId) {
    dl.innerHTML = '';
    input.placeholder = 'Neuen Namen tippen …';
    return;
  }
  input.placeholder = 'Kontakt wählen oder neuen Namen tippen …';
  const { data, error } = await db.from('contacts')
    .select('id, vorname, nachname').is('deleted_at', null).eq('company_id', companyId)
    .order('nachname').order('vorname');
  if (error) { dl.innerHTML = ''; return; }
  dl.innerHTML = (data || []).map(k => {
    const name = [k.vorname, k.nachname].filter(Boolean).join(' ');
    return `<option data-id="${esc(k.id)}" value="${esc(name)}"></option>`;
  }).join('');
}

function setContactComboboxValue(inputId, datalistId, contactId) {
  const input = document.getElementById(inputId);
  const dl = document.getElementById(datalistId);
  if (!input) return;
  if (!contactId) {
    input.value = '';
    input.dataset.resolvedId = '';
    return;
  }
  const opt = dl ? Array.from(dl.options).find(o => o.dataset.id === contactId) : null;
  if (opt) {
    input.value = opt.value;
    input.dataset.resolvedId = contactId;
  }
}

async function resolveContactComboboxValue(inputId, datalistId, companyId) {
  const input = document.getElementById(inputId);
  const dl = document.getElementById(datalistId);
  if (!input) return null;
  const value = (input.value || '').trim();
  if (!value) return null;
  // Match in Liste? — exakter Treffer
  if (dl) {
    const opt = Array.from(dl.options).find(o => o.value === value);
    if (opt && opt.dataset.id) return opt.dataset.id;
  }
  // v1.44.11: Kontakt darf auch ohne Firma angelegt werden (z.B. wenn der
  // Termin/Aufgabe keine Firmen-Zuordnung hat). company_id ist dann null.
  const parts = value.split(/\s+/);
  const vorname = parts[0];
  const nachname = parts.slice(1).join(' ') || '—';
  const insertData = { vorname, nachname, erstellt_von: currentProfile?.id };
  if (companyId) insertData.company_id = companyId;
  const { data, error } = await db.from('contacts')
    .insert(insertData).select('id').single();
  if (error) {
    showToast('Fehler beim Anlegen des Kontakts: ' + error.message, true);
    throw error;
  }
  showToast(`Kontakt „${value}" angelegt.`);
  return data.id;
}

function openQuickCreateKontakt(targetSelectId, contextCompanySelectId) {
  _qcTargetSelectId = targetSelectId;
  _qcContextCompanySelectId = contextCompanySelectId || null;
  document.getElementById('qk-vorname').value = '';
  document.getElementById('qk-nachname').value = '';

  // Firma-Dropdown im Quick-Modal befüllen (wenn Cache da)
  const firmaSel = document.getElementById('qk-firma');
  if (firmaSel) {
    firmaSel.innerHTML = '<option value="">— Keine Firma —</option>'
      + companiesCache.map(c => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    // Vorbelegung: aus Eltern-Modal-Firma
    if (contextCompanySelectId) {
      const ctxVal = document.getElementById(contextCompanySelectId)?.value || '';
      if (ctxVal) firmaSel.value = ctxVal;
    }
  }

  document.getElementById('modal-quick-kontakt').classList.add('open');
  setTimeout(() => document.getElementById('qk-vorname').focus(), 100);
}

function closeQuickCreateKontakt() {
  document.getElementById('modal-quick-kontakt').classList.remove('open');
  _qcTargetSelectId = null;
  _qcContextCompanySelectId = null;
}

async function saveQuickCreateKontakt() {
  const vorname  = document.getElementById('qk-vorname').value.trim();
  const nachname = document.getElementById('qk-nachname').value.trim();
  const firmaId  = document.getElementById('qk-firma').value || null;
  if (!vorname || !nachname) { showToast('Bitte Vor- und Nachname eingeben.', true); return; }
  const targetId = _qcTargetSelectId;
  const btn = document.getElementById('qk-save-btn');

  btn.disabled = true; btn.textContent = 'Wird angelegt …';
  try {
    const { data, error } = await db.from('contacts')
      .insert({ vorname, nachname, company_id: firmaId })
      .select('id, vorname, nachname, company_id').single();
    if (error) throw new Error(error.message);

    // Ziel-Select neu populieren — wir brauchen die aktuellen Kontakte des Firma-Kontexts.
    // Pragmatisch: wenn Eltern-Modal eine Firma im Kontext hat, rebuilde die passende Dropdown.
    if (targetId) {
      const sel = document.getElementById(targetId);
      if (sel) {
        const fullName = `${vorname} ${nachname}`;
        const opt = document.createElement('option');
        opt.value = data.id;
        opt.textContent = fullName;
        sel.appendChild(opt);
        sel.value = data.id;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    closeQuickCreateKontakt();
    showToast(`Kontakt „${vorname} ${nachname}" angelegt — du kannst ihn später ergänzen.`);
  } catch (e) {
    showToast('Fehler: ' + e.message, true);
  } finally {
    btn.disabled = false; btn.textContent = 'Anlegen';
  }
}

async function calendarQuickCreateDeployment(iso) {
  closeCalendarQuickMenu();
  closeCalendarDayPopover();
  await openDeploymentModal('new');
  const von = document.getElementById('d-datum-von');
  const bis = document.getElementById('d-datum-bis');
  if (von) { von.value = iso; von.dispatchEvent(new Event('change', { bubbles: true })); }
  if (bis && !bis.value) bis.value = iso;
  // v1.43.0: Aktueller User automatisch als Techniker, sonst landet der Einsatz
  // nicht im Kalender, aus dem er gerade angelegt wurde.
  if (currentProfile?.id) {
    selectedTechnikerIds.add(currentProfile.id);
    if (typeof renderTechnikerChipsForDeployment === 'function') {
      renderTechnikerChipsForDeployment();
    }
  }
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
//  DEIN TAG — BRIEFING-DASHBOARD (v1.42.0)
// ═══════════════════════════════════════════════════════════
//
// Login-Landing-Page mit drei Tabs (Heute/Woche/Monat). Jeder Tab
// erzeugt aus den realen Daten ein narratives Briefing mit:
// - Narrativ-Leiste (regelbasierte Template-Sätze)
// - KPI-Mini-Leiste (4 Werte)
// - Briefing-Cards (hot/opp/gap/good — sortiert nach Dringlichkeit)
// - Streak-Bar (Aufgaben-Streak)
// - Vorschau (nächste 3 Werktage / Wochen)

let _currentBriefingTab = 'heute';
// v1.45.6: Monat-Tab Sicht — 'technik' | 'vertrieb' | 'beides'.
// Default aus Rolle, kann pro Session geändert werden.
let _monthDashView = null;
function getMonthDashView() {
  if (_monthDashView) return _monthDashView;
  const stored = (() => { try { return localStorage.getItem('monthDashView'); } catch (e) { return null; }})();
  if (stored && ['technik','vertrieb','beides'].includes(stored)) { _monthDashView = stored; return _monthDashView; }
  const role = currentProfile?.roles?.name;
  if (role === 'Techniker') _monthDashView = 'technik';
  else if (role === 'Vertrieb') _monthDashView = 'vertrieb';
  else _monthDashView = 'beides';
  return _monthDashView;
}
function setMonthDashView(v) {
  _monthDashView = v;
  try { localStorage.setItem('monthDashView', v); } catch (e) {}
  loadBriefing('monat');
}

const WEEKDAYS_DE = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MONTHS_DE   = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

/** v1.47.0: ISO-8601 Kalenderwoche aus Date. Mo=Tag 1, Donnerstag-Regel. */
function isoWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/** Berechnet den Datums-Bereich für „Heute" / „Diese Woche" / „Dieser Monat". */
function briefingRangeForScope(scope) {
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const todayISO = toISODate(now);
  if (scope === 'heute') {
    return { startISO: todayISO, endISO: todayISO, label: 'heute' };
  }
  if (scope === 'woche') {
    // v1.47.0: nur Werktage (Mo–Fr). Samstag/Sonntag werden im Dashboard
    // weder als Karten noch in der Agenda angezeigt — Range entsprechend
    // verkürzt, damit Tagessummen/KPIs nicht durch Wochenend-Daten verfälscht.
    const dow = now.getDay(); // 0=So..6=Sa
    const monOffset = dow === 0 ? -6 : 1 - dow;
    const monday = new Date(now); monday.setDate(now.getDate() + monOffset);
    const friday = new Date(monday); friday.setDate(monday.getDate() + 4);
    return { startISO: toISODate(monday), endISO: toISODate(friday), label: 'diese Woche' };
  }
  // Monat
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { startISO: toISODate(first), endISO: toISODate(last), label: 'diesen Monat' };
}

/** Zählt unvollständige Datensätze (v1.43.0).
 *  Heuristik:
 *  - Firma unvollständig: keine Strasse UND keine Stadt UND kein Telefon UND keine E-Mail
 *  - Kontakt unvollständig: kein Telefon UND keine E-Mail UND keine Position
 *  Gibt nur die Zahlen zurück + die ältesten 3 IDs als Anker für die Detail-Action. */
async function loadIncompleteRecordsStats() {
  const [companiesRes, contactsRes] = await Promise.all([
    db.from('companies')
      .select('id, name, strasse, stadt, telefon, email, created_at')
      .is('deleted_at', null).order('created_at', { ascending: false }),
    db.from('contacts')
      .select('id, vorname, nachname, telefon, email, position, created_at')
      .is('deleted_at', null).order('created_at', { ascending: false })
  ]);

  const isCompanyIncomplete = c =>
    !((c.strasse || '').trim()) &&
    !((c.stadt   || '').trim()) &&
    !((c.telefon || '').trim()) &&
    !((c.email   || '').trim());
  const isContactIncomplete = k =>
    !((k.telefon  || '').trim()) &&
    !((k.email    || '').trim()) &&
    !((k.position || '').trim());

  const incompleteCompanies = (companiesRes.data || []).filter(isCompanyIncomplete);
  const incompleteContacts  = (contactsRes.data  || []).filter(isContactIncomplete);

  return {
    companies: incompleteCompanies.length,
    contacts:  incompleteContacts.length,
    sampleCompanies: incompleteCompanies.slice(0, 3),
    sampleContacts:  incompleteContacts.slice(0, 3)
  };
}

/** Lädt die Datenbasis für ein Briefing parallel. */
async function loadBriefingData(userId, scope) {
  const range = briefingRangeForScope(scope);
  const todayISO = toISODate(new Date());

  // Sehr alter Termin als Heuristik für „X Tage kein neuer Termin" — wir laden den
  // jüngsten von uns erstellten Termin und rechnen die Tage seit dann.
  const [
    apptInRange,
    depInRange,
    tasksInRange,
    overdueTasks,
    oldOpenTasks,
    lastCreatedAppt,
    weekDoneAppts,    // für Good-Karten: durchgeführte Termine der letzten 7 Tage
    weekDoneDeps,     // dito Einsätze
    incompleteStats   // v1.43: Datenpflege
  ] = await Promise.all([
    db.from('appointments')
      .select('id, titel, datum, uhrzeit_von, uhrzeit_bis, status, ort, company:companies(id, name), contact:contacts(id, vorname, nachname), typ:lookup_values!appointments_typ_id_fkey(wert, farbe), deployment_id')
      .is('deleted_at', null).eq('erstellt_von', userId)
      .gte('datum', range.startISO).lte('datum', range.endISO)
      .order('datum', { ascending: true }).order('uhrzeit_von', { ascending: true, nullsFirst: false }),
    db.from('deployment_technicians')
      .select('deployment:deployments!inner(id, titel, datum_von, datum_bis, status, deleted_at, menge, einzelpreis, ort, company:companies(id, name), service:services(name))')
      .eq('user_id', userId),
    db.from('tasks')
      .select('id, titel, faelligkeit, status, company:companies(id, name), contact:contacts(id, vorname, nachname)')
      .is('deleted_at', null).eq('assigned_to', userId)
      .gte('faelligkeit', range.startISO).lte('faelligkeit', range.endISO)
      .neq('status', 'erledigt'),
    db.from('tasks')
      .select('id, titel, faelligkeit, status, company:companies(id, name)')
      .is('deleted_at', null).eq('assigned_to', userId)
      .lt('faelligkeit', todayISO).neq('status', 'erledigt')
      .order('faelligkeit', { ascending: true }),
    db.from('tasks')
      .select('id, titel, created_at, faelligkeit')
      .is('deleted_at', null).eq('assigned_to', userId)
      .neq('status', 'erledigt')
      .lt('created_at', new Date(Date.now() - 14 * 86400000).toISOString()),
    db.from('appointments')
      .select('id, datum, created_at').is('deleted_at', null).eq('erstellt_von', userId)
      .order('created_at', { ascending: false }).limit(1),
    db.from('appointments')
      .select('id, datum').is('deleted_at', null).eq('erstellt_von', userId)
      .eq('status', 'durchgefuehrt')
      .gte('datum', toISODate(new Date(Date.now() - 7 * 86400000)))
      .lte('datum', todayISO),
    db.from('deployment_technicians')
      .select('deployment:deployments!inner(id, datum_von, status, deleted_at)')
      .eq('user_id', userId),
    loadIncompleteRecordsStats()
  ]);

  // Einsätze filtern auf Range + nicht gelöscht
  const allDeps = (depInRange.data || []).map(r => r.deployment).filter(d => d && !d.deleted_at);
  const depsInRangeFiltered = allDeps.filter(d => {
    if (!d.datum_von) return false;
    const von = d.datum_von;
    const bis = d.datum_bis || von;
    return von <= range.endISO && bis >= range.startISO;
  });
  const depsThisWeekDone = (weekDoneDeps.data || [])
    .map(r => r.deployment).filter(d => d && !d.deleted_at && d.datum_von)
    .filter(d => d.datum_von >= toISODate(new Date(Date.now() - 7 * 86400000)) && d.datum_von <= todayISO)
    .filter(d => d.status === 'Durchgeführt' || d.status === 'Abgerechnet');

  // v1.44: Für Heute-Hero — alle Techniker der heutigen Einsätze laden, damit
  // im Hero-Block das volle Team angezeigt werden kann (nicht nur „ich").
  let todayDepTechniciansMap = {};
  if (scope === 'heute') {
    const todayDeps = depsInRangeFiltered.filter(d =>
      d.datum_von <= todayISO && (d.datum_bis || d.datum_von) >= todayISO
    );
    if (todayDeps.length > 0) {
      const ids = todayDeps.map(d => d.id);
      const techRes = await db.from('deployment_technicians')
        .select('deployment_id, user_id, user:user_profiles!deployment_technicians_user_id_fkey(id, name)')
        .in('deployment_id', ids);
      (techRes.data || []).forEach(row => {
        if (!todayDepTechniciansMap[row.deployment_id]) todayDepTechniciansMap[row.deployment_id] = [];
        if (row.user) todayDepTechniciansMap[row.deployment_id].push(row.user);
      });
    }
  }

  // v1.44.1: Vorschau auf 3 Tage — nur im Heute-Scope. Eigene Queries, weil die
  // Range-Daten oben nur den heutigen Tag abdecken. Tabs „Woche"/„Monat" haben
  // ihre eigenen Daten, dort ist eine Vorschau redundant.
  let previewAppointments = [];
  let previewDeployments = [];
  if (scope === 'heute') {
    const tomorrow = new Date(todayISO); tomorrow.setDate(tomorrow.getDate() + 1);
    const plus3 = new Date(todayISO); plus3.setDate(plus3.getDate() + 3);
    const fromISO = toISODate(tomorrow);
    const toISO   = toISODate(plus3);
    const [apptRes, depRes] = await Promise.all([
      db.from('appointments')
        .select('id, titel, datum, uhrzeit_von, ort, company:companies(id, name)')
        .is('deleted_at', null).eq('erstellt_von', userId)
        .gte('datum', fromISO).lte('datum', toISO)
        .order('datum', { ascending: true }).order('uhrzeit_von', { ascending: true, nullsFirst: false }),
      db.from('deployment_technicians')
        .select('deployment:deployments!inner(id, titel, datum_von, datum_bis, ort, deleted_at, company:companies(id, name), service:services(name))')
        .eq('user_id', userId)
    ]);
    previewAppointments = apptRes.data || [];
    previewDeployments = (depRes.data || [])
      .map(r => r.deployment).filter(d => d && !d.deleted_at && d.datum_von)
      .filter(d => {
        const von = d.datum_von, bis = d.datum_bis || d.datum_von;
        return von <= toISO && bis >= fromISO;
      });
  }

  // v1.45.2: Zusätzliche Monats-Daten für das Datendichte-Dashboard.
  // v1.45.6: Erweitert für Vertrieb/Technik-Sichten — erstellte Termine/
  // Einsätze, erledigte Aufgaben, Conversion.
  let pipelineProjects = [];
  let topCustomers = [];
  let revenueSparkline = []; // 30 Tage
  let prevMonthsAvg = 0;
  let monthDailyRevenue = [];
  let createdAppointmentsCount = 0;
  let createdDeploymentsCount  = 0;
  let conversionRate           = null;
  let tasksDoneInMonth         = 0;
  let topCustomerDays          = []; // pro Kunde Tage-Zahl (Technik)
  let overdueGeplant           = []; // v1.46.0: Geplant-Einsätze mit Datum < heute
  let restmonatGeplant         = []; // v1.46.0: Geplant-Einsätze ab heute bis Monatsende
  let membershipAttention      = []; // v1.46.0: ablaufend / Kontingent ≥ 80 %
  if (scope === 'monat') {
    const monthStart = new Date(todayISO + 'T00:00:00'); monthStart.setDate(1);
    const monthEnd   = new Date(monthStart); monthEnd.setMonth(monthStart.getMonth() + 1); monthEnd.setDate(0);
    const sparkStart = new Date(todayISO + 'T00:00:00'); sparkStart.setDate(sparkStart.getDate() - 29);
    const prev3Start = new Date(monthStart); prev3Start.setMonth(prev3Start.getMonth() - 3);
    const prev3End   = new Date(monthStart); prev3End.setDate(0);
    const monthStartISO = toISODate(monthStart);
    const monthEndISO   = toISODate(monthEnd);

    // v1.46.0: 60-Tage-Horizont für ablaufende Mitgliedschaften.
    const horizon60 = new Date(todayISO + 'T00:00:00'); horizon60.setDate(horizon60.getDate() + 60);
    const horizon60ISO = toISODate(horizon60);

    const [pipelineRes, recentDepsRes, prev3DepsRes,
           createdApptsRes, createdDepsRes, conversionRes, tasksDoneRes,
           membershipsRes, entitlementsRes, redemptionsRes] = await Promise.all([
      // Pipeline: Projekte aus den relevanten Stages
      db.from('projects')
        .select('id, name, status, geschaetzter_umsatz, company:companies(id, name)')
        .is('deleted_at', null)
        .in('status', ['Lead', 'Angebot', 'In Arbeit', 'Abschlussphase']),
      // v1.46.0: titel/ort/service ergänzt für Restmonat-Liste & Pflegerückstand
      db.from('deployment_technicians')
        .select('deployment:deployments!inner(id, titel, datum_von, datum_bis, status, deleted_at, menge, einzelpreis, ort, company:companies(id, name), service:services(name))')
        .eq('user_id', userId),
      // Vorige 3 Monate für Ziel-Berechnung
      db.from('deployment_technicians')
        .select('deployment:deployments!inner(id, datum_von, datum_bis, status, deleted_at, menge, einzelpreis)')
        .eq('user_id', userId),
      // v1.45.6: Im Monat erstellte Termine (Vertrieb)
      db.from('appointments')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null).eq('erstellt_von', userId)
        .gte('created_at', monthStartISO).lte('created_at', monthEndISO + 'T23:59:59'),
      // v1.45.6: Im Monat erstellte Einsätze (Vertrieb)
      db.from('deployments')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null).eq('erstellt_von', userId)
        .gte('created_at', monthStartISO).lte('created_at', monthEndISO + 'T23:59:59'),
      // v1.45.6: Conversion — durchgef. Termine im Monat mit/ohne Einsatz-Folge
      db.from('appointments')
        .select('id, deployment_id')
        .is('deleted_at', null).eq('erstellt_von', userId)
        .eq('status', 'durchgefuehrt')
        .gte('datum', monthStartISO).lte('datum', monthEndISO),
      // v1.45.6: Im Monat erledigte Aufgaben (Technik)
      db.from('tasks')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null).eq('assigned_to', userId)
        .eq('status', 'erledigt')
        .gte('erledigt_am', monthStartISO).lte('erledigt_am', monthEndISO + 'T23:59:59'),
      // v1.46.0: Aktive Mitgliedschaften (für Ablauf-Sektion + Kontingent-Stand)
      db.from('memberships')
        .select('id, mitgliedsnummer, status, start_datum, end_datum, company:companies(id, name), program:membership_programs(name)')
        .is('deleted_at', null)
        .eq('status', 'aktiv'),
      // v1.46.0: Aktive Entitlements (verfall_datum >= heute oder NULL)
      db.from('entitlements')
        .select('id, titel, gesamt_menge, verfall_datum, membership_id, company_id'),
      // v1.46.0: Alle Redemptions (Aggregation pro entitlement_id clientside)
      db.from('entitlement_redemptions')
        .select('entitlement_id, menge_eingeloest')
    ]);

    const allDepsBroad = (recentDepsRes.data || [])
      .map(r => r.deployment).filter(d => d && !d.deleted_at && d.datum_von);

    // 30-Tage-Sparkline: pro Tag den Umsatz aus durchgef.+abgerechn. Einsätzen
    const sparkMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(sparkStart); d.setDate(sparkStart.getDate() + i);
      sparkMap[toISODate(d)] = 0;
    }
    allDepsBroad.forEach(d => {
      if (!['Durchgeführt', 'Abgerechnet'].includes(d.status)) return;
      // Tageswert pro abgedecktem Tag im Sparkline-Fenster
      const von = d.datum_von, bis = d.datum_bis || d.datum_von;
      const einzel = Number(d.einzelpreis) || 0;
      Object.keys(sparkMap).forEach(iso => {
        if (iso >= von && iso <= bis) sparkMap[iso] += einzel;
      });
    });
    revenueSparkline = Object.values(sparkMap);

    // Pro Tag des aktuellen Monats: kumulierter Umsatz (durchgef.+abgerechn.) +
    // Forecast-Anteil aus geplanten Einsätzen.
    const mStart = toISODate(monthStart);
    const mEnd   = toISODate(monthEnd);
    const dailyMap = {};
    let cur = new Date(monthStart);
    while (toISODate(cur) <= mEnd) {
      dailyMap[toISODate(cur)] = { iso: toISODate(cur), realized: 0, forecast: 0 };
      cur.setDate(cur.getDate() + 1);
    }
    allDepsBroad.forEach(d => {
      const von = d.datum_von, bis = d.datum_bis || d.datum_von;
      if (von > mEnd || bis < mStart) return;
      const einzel = Number(d.einzelpreis) || 0;
      Object.keys(dailyMap).forEach(iso => {
        if (iso < von || iso > bis) return;
        if (d.status === 'Durchgeführt' || d.status === 'Abgerechnet') {
          dailyMap[iso].realized += einzel;
        } else if (d.status === 'Geplant') {
          dailyMap[iso].forecast += einzel;
        }
      });
    });
    monthDailyRevenue = Object.values(dailyMap);

    // Top-Kunden im Monat: Aggregation pro Firma aus durchgef.+abgerechn.
    const customerMap = new Map();
    allDepsBroad.forEach(d => {
      if (!d.company?.id) return;
      if (!['Durchgeführt', 'Abgerechnet'].includes(d.status)) return;
      const von = d.datum_von, bis = d.datum_bis || d.datum_von;
      if (von > mEnd || bis < mStart) return;
      // Tageswert × abgedeckter Anteil im Monat
      const einzel = Number(d.einzelpreis) || 0;
      const overlapStart = von > mStart ? von : mStart;
      const overlapEnd   = bis < mEnd   ? bis : mEnd;
      const days = Math.round((new Date(overlapEnd) - new Date(overlapStart)) / 86400000) + 1;
      const wert = einzel * Math.max(1, days);
      const cur = customerMap.get(d.company.id) || { id: d.company.id, name: d.company.name, umsatz: 0 };
      cur.umsatz += wert;
      customerMap.set(d.company.id, cur);
    });
    topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.umsatz - a.umsatz)
      .slice(0, 5);

    // v1.45.6: Top-Einsatztage für Technik — Aggregation in Tagen statt €
    const customerDayMap = new Map();
    allDepsBroad.forEach(d => {
      if (!d.company?.id) return;
      if (!['Durchgeführt', 'Abgerechnet'].includes(d.status)) return;
      const von = d.datum_von, bis = d.datum_bis || d.datum_von;
      if (von > monthEndISO || bis < monthStartISO) return;
      const overlapStart = von > monthStartISO ? von : monthStartISO;
      const overlapEnd   = bis < monthEndISO   ? bis : monthEndISO;
      const days = Math.round((new Date(overlapEnd) - new Date(overlapStart)) / 86400000) + 1;
      const cur = customerDayMap.get(d.company.id) || { id: d.company.id, name: d.company.name, days: 0 };
      cur.days += Math.max(1, days);
      customerDayMap.set(d.company.id, cur);
    });
    topCustomerDays = Array.from(customerDayMap.values())
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);

    // v1.45.6: Counts + Conversion aus den separaten Queries
    createdAppointmentsCount = createdApptsRes.count || 0;
    createdDeploymentsCount  = createdDepsRes.count  || 0;
    tasksDoneInMonth         = tasksDoneRes.count    || 0;
    const convAppts = conversionRes.data || [];
    if (convAppts.length > 0) {
      const withDeployment = convAppts.filter(a => a.deployment_id).length;
      conversionRate = Math.round((withDeployment / convAppts.length) * 100);
    }

    // Pipeline-Projekte
    pipelineProjects = pipelineRes.data || [];

    // v1.46.0: Pflegerückstand & Restmonat (Technik) — aus dem breiten Einsatz-Pool
    overdueGeplant = allDepsBroad
      .filter(d => d.status === 'Geplant' && (d.datum_bis || d.datum_von) < todayISO)
      .sort((a, b) => (b.datum_bis || b.datum_von).localeCompare(a.datum_bis || a.datum_von));
    restmonatGeplant = allDepsBroad
      .filter(d => d.status === 'Geplant'
                && (d.datum_bis || d.datum_von) >= todayISO
                && d.datum_von <= monthEndISO)
      .sort((a, b) => (a.datum_von || '').localeCompare(b.datum_von || ''));

    // v1.46.0: Mitgliedschafts-Aufmerksamkeit — Ablauf in 60 Tagen oder Kontingent ≥ 80 % verbraucht.
    const allMemberships = membershipsRes.data || [];
    const allEntitlements = entitlementsRes.data || [];
    const allRedemptions = redemptionsRes.data || [];
    const redeemedByEntId = new Map();
    allRedemptions.forEach(r => {
      redeemedByEntId.set(r.entitlement_id,
        (redeemedByEntId.get(r.entitlement_id) || 0) + (Number(r.menge_eingeloest) || 0));
    });
    const entByMembership = new Map();
    allEntitlements.forEach(e => {
      if (!e.membership_id) return;
      const arr = entByMembership.get(e.membership_id) || [];
      arr.push(e);
      entByMembership.set(e.membership_id, arr);
    });
    membershipAttention = allMemberships.map(m => {
      const ents = entByMembership.get(m.id) || [];
      const total = ents.reduce((s, e) => s + (Number(e.gesamt_menge) || 0), 0);
      const used = ents.reduce((s, e) => s + (redeemedByEntId.get(e.id) || 0), 0);
      const usagePct = total > 0 ? Math.round((used / total) * 100) : 0;
      const daysToEnd = m.end_datum
        ? Math.round((new Date(m.end_datum + 'T00:00:00') - new Date(todayISO + 'T00:00:00')) / 86400000)
        : null;
      const isExpiring = daysToEnd !== null && daysToEnd >= 0 && daysToEnd <= 60;
      const isDepleted = total > 0 && usagePct >= 80;
      return { ...m, usagePct, total, used, daysToEnd, isExpiring, isDepleted };
    })
    .filter(m => m.isExpiring || m.isDepleted)
    .sort((a, b) => {
      // Ablaufende zuerst (kleinster daysToEnd), dann höchste Auslastung
      const aRank = a.isExpiring ? (a.daysToEnd ?? 999) : 1000 + (100 - a.usagePct);
      const bRank = b.isExpiring ? (b.daysToEnd ?? 999) : 1000 + (100 - b.usagePct);
      return aRank - bRank;
    })
    .slice(0, 6);

    // Ziel-Default: Mittel der letzten 3 abgeschlossenen Monatsumsätze
    const prev3Deps = (prev3DepsRes.data || [])
      .map(r => r.deployment).filter(d => d && !d.deleted_at && d.datum_von);
    const prev3Start_ISO = toISODate(prev3Start);
    const prev3End_ISO   = toISODate(prev3End);
    const monthlySum = {};
    prev3Deps.forEach(d => {
      if (!['Durchgeführt', 'Abgerechnet'].includes(d.status)) return;
      const von = d.datum_von;
      if (von < prev3Start_ISO || von > prev3End_ISO) return;
      const ym = von.substring(0, 7);
      const einzel = Number(d.einzelpreis) || 0;
      const tage = (() => {
        const bis = d.datum_bis || von;
        return Math.max(1, Math.round((new Date(bis) - new Date(von)) / 86400000) + 1);
      })();
      monthlySum[ym] = (monthlySum[ym] || 0) + einzel * tage;
    });
    const prev3Vals = Object.values(monthlySum);
    if (prev3Vals.length > 0) prevMonthsAvg = prev3Vals.reduce((s,v)=>s+v,0) / prev3Vals.length;
  }

  return {
    range,
    appointments: apptInRange.data || [],
    deployments:  depsInRangeFiltered,
    tasks:        tasksInRange.data || [],
    overdueTasks: overdueTasks.data || [],
    oldOpenTasks: oldOpenTasks.data || [],
    lastCreatedAppt: (lastCreatedAppt.data || [])[0] || null,
    weekDoneAppts: weekDoneAppts.data || [],
    weekDoneDeps:  depsThisWeekDone,
    incompleteStats: incompleteStats || { companies: 0, contacts: 0 },
    todayDepTechniciansMap,
    previewAppointments,
    previewDeployments,
    pipelineProjects,
    topCustomers,
    revenueSparkline,
    monthDailyRevenue,
    prevMonthsAvg,
    topCustomerDays,
    createdAppointmentsCount,
    createdDeploymentsCount,
    conversionRate,
    tasksDoneInMonth,
    overdueGeplant,
    restmonatGeplant,
    membershipAttention
  };
}

/** Master: lädt Daten + rendert Briefing für aktuellen Tab. */
async function loadBriefing(scope) {
  const userId = currentProfile?.id;
  if (!userId) return;
  _currentBriefingTab = scope;

  const container = document.getElementById('briefing-container');
  if (!container) return;
  container.innerHTML = `<div style="padding:40px 0;text-align:center;color:var(--muted);font-size:13px">Lade Briefing …</div>`;

  // Date-Sub im Page-Header setzen
  const today = new Date();
  const dateSub = document.getElementById('heute-date-sub');
  if (dateSub) {
    dateSub.textContent = `${WEEKDAYS_DE[today.getDay()]}, ${today.getDate()}. ${MONTHS_DE[today.getMonth()]} ${today.getFullYear()}`;
  }

  try {
    const data = await loadBriefingData(userId, scope);
    container.innerHTML = renderBriefing(scope, data);
  } catch (e) {
    container.innerHTML = `<div style="padding:40px 0;text-align:center;color:var(--danger);font-size:13px">Fehler: ${esc(e.message)}</div>`;
  }
}

function switchBriefingTab(scope) {
  document.querySelectorAll('#heute-tabs .detail-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === scope);
  });
  loadBriefing(scope);
}

/** Baut das komplette Briefing-HTML aus Daten + Scope. */
function renderBriefing(scope, data) {
  const initials = ini(currentProfile?.name || currentUser?.email || '?');
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Guten Morgen';
    if (h < 18) return 'Hallo';
    return 'Guten Abend';
  })();
  const firstName = (currentProfile?.name || '').split(' ')[0] || '';

  // v1.44: Heute mit Einsatz → Hero-Modus. Der Einsatz bringt Umsatz und ist
  // Priorität für den Tag; alles andere wird zur sekundären Information.
  const todayISO = toISODate(new Date());
  const todayDeps = scope === 'heute'
    ? data.deployments.filter(d => d.datum_von <= todayISO && (d.datum_bis || d.datum_von) >= todayISO)
    : [];
  const heroMode = todayDeps.length > 0;

  // v1.44.4: KPI-Leiste wandert nach oben rechts in die Tab-Zeile, kompakt
  // als Text ohne Icons. Wird hier nur befüllt — Container ist im HTML schon.
  const metaEl = document.getElementById('heute-tab-meta');
  if (metaEl) metaEl.innerHTML = renderBriefingKpisInline(scope, data, { heroMode });

  if (heroMode) {
    // v1.45.0: 2-Spalten-Grid kompakter Einsatzkarten + Aufgaben-Aside.
    // v1.45.4: Nächste 3 Tage als 3 Cards nebeneinander direkt unter den
    // Einsatzkarten (statt zugeklappter Akkordeon).
    return `
      ${renderBriefingNarrative(scope, data, greeting, firstName, initials)}
      <div class="heute-grid">
        <div class="heute-main">
          ${renderHeuteDeploymentGrid(todayDeps)}
          ${renderHeuteNext3DaysGrid(data)}
        </div>
        <div class="heute-aside">${renderHeuteTasksAside(data)}</div>
      </div>
      ${renderBriefingStreak(scope, data)}
    `;
  }

  // v1.44.7: Diese-Woche-Tab → 7-Tage-Strip statt Briefing-Cards. Die Woche
  // soll auf einen Blick verständlich sein: pro Tag eine Spalte mit Einsätzen
  // (zuerst, umsatzrelevant) und Terminen als kompakte Pills. Klick öffnet
  // das Inline-Dashboard unterhalb. Heute hervorgehoben, Vergangenheit dezent.
  // v1.44.9: Aufgaben standardmäßig zugeklappt — sonst dominieren sie die
  // Woche-Übersicht. Klick auf den Toggle öffnet die Wochen-Aufgaben-Liste.
  if (scope === 'woche') {
    // v1.45.1: Wochenstreifen Mo–So oben (kompakte Tageskarten mit Σ €)
    // + Agenda darunter (jetzt 7 Tage statt 5) + Aufgaben-Aside.
    return `
      ${renderBriefingNarrative(scope, data, greeting, firstName, initials)}
      ${renderWeekStrip(data)}
      <div class="heute-grid">
        <div class="heute-main">${renderBriefingWeekAgenda(data)}</div>
        <div class="heute-aside">${renderHeuteTasksAside(data)}</div>
      </div>
      ${renderBriefingStreak(scope, data)}
    `;
  }

  // v1.44.12: Monat-Tab → klickbare KPI-Kacheln. Pro Kachel ein Drilldown
  // in die jeweilige Liste mit gesetztem Filter.
  if (scope === 'monat') {
    return `
      ${renderBriefingNarrative(scope, data, greeting, firstName, initials)}
      ${renderBriefingMonthDashboard(data)}
      ${renderBriefingStreak(scope, data)}
    `;
  }

  // v1.49.0: Heute ohne Einsatz (Bürotag) bekommt jetzt auch den
  // Aufgaben-Aside rechts — vorher nur im Hero-Pfad. Aside zeigt auch
  // Empty-State („Keine offenen Aufgaben — alles im Griff."), damit
  // klar ist, dass der Bereich existiert.
  if (scope === 'heute') {
    return `
      ${renderBriefingNarrative(scope, data, greeting, firstName, initials)}
      <div class="heute-grid">
        <div class="heute-main">
          ${renderBriefingCards(scope, data)}
          ${renderBriefingPreview(scope, data)}
        </div>
        <div class="heute-aside">${renderHeuteTasksAside(data)}</div>
      </div>
      ${renderBriefingStreak(scope, data)}
    `;
  }

  return `
    ${renderBriefingNarrative(scope, data, greeting, firstName, initials)}
    ${renderBriefingCards(scope, data)}
    ${renderBriefingStreak(scope, data)}
    ${renderBriefingPreview(scope, data)}
  `;
}

/** v1.45.6: Monat-Dashboard mit Sicht-Toggle (Technik / Vertrieb / Beides).
 *  Default je nach Rolle; per localStorage merkt sich die Wahl. */
function renderBriefingMonthDashboard(data) {
  const view = getMonthDashView();
  const toggle = `
    <div class="month-view-toggle">
      <button class="month-view-btn ${view === 'technik' ? 'is-active' : ''}" type="button" onclick="setMonthDashView('technik')">Technik</button>
      <button class="month-view-btn ${view === 'vertrieb' ? 'is-active' : ''}" type="button" onclick="setMonthDashView('vertrieb')">Vertrieb</button>
      <button class="month-view-btn ${view === 'beides' ? 'is-active' : ''}" type="button" onclick="setMonthDashView('beides')">Beides</button>
    </div>`;

  let body = '';
  if (view === 'technik')      body = renderMonthDashTechnik(data);
  else if (view === 'vertrieb') body = renderMonthDashVertrieb(data);
  else                          body = renderMonthDashBeides(data);

  return `<div class="month-dashboard">${toggle}${body}</div>`;
}

/** v1.46.0: Datum-Pille für Restmonat-/Pflegerückstand-Liste.
 *  Einzeltag → "Mo 28.04."; Mehrtägig → "28.04. – 30.04. (3T)". */
function restmonatDateLabel(von, bis) {
  if (!von) return '—';
  const v = parseLocalDate(von);
  const dayShort = (d) => `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.`;
  const wd = ['So','Mo','Di','Mi','Do','Fr','Sa'][v.getDay()];
  if (!bis || bis === von) return `${wd} ${dayShort(v)}`;
  const b = parseLocalDate(bis);
  const days = Math.max(1, Math.round((b - v) / 86400000) + 1);
  return `${dayShort(v)}–${dayShort(b)} (${days}T)`;
}

/** v1.46.0: Technik-Sicht — Auslastung, Restmonat-Liste, Pflegerückstand, Top-Tage.
 *  Kein Umsatz-Verlauf, keine Pipeline. */
function renderMonthDashTechnik(data) {
  const todayISO = toISODate(new Date());
  const depsDurchgef = data.deployments.filter(d => d.status === 'Durchgeführt');

  // Auslastung
  const arbeitsTage = computeMonthAuslastung(data, todayISO);
  const auslastungPct = arbeitsTage.werk > 0
    ? Math.round((arbeitsTage.belegt / arbeitsTage.werk) * 100)
    : 0;

  // Pflegerückstand: Geplant aber Datum < heute
  const overdue = data.overdueGeplant || [];
  // Restmonat: Geplant ab heute bis Monatsende
  const restmonat = data.restmonatGeplant || [];

  // Aufgaben
  const tasksOpen = (data.tasks || []).length;
  const tasksOverdue = (data.overdueTasks || []).length;
  const tasksDone = data.tasksDoneInMonth || 0;

  const kpiRow = `
    <div class="month-kpi-row">
      ${monthKpiTile('Auslastung', `${auslastungPct}%`, `${arbeitsTage.belegt} / ${arbeitsTage.werk} Tage`, 'done',
        "navigateTo('deployments',{ range:'month', status:'Durchgeführt' })")}
      ${monthKpiTile('Durchgeführt', depsDurchgef.length, 'Einsätze im Monat', 'done',
        "navigateTo('deployments',{ range:'month', status:'Durchgeführt' })")}
      ${monthKpiTile('Pflegerückstand', overdue.length,
        overdue.length > 0 ? 'Geplant, Datum vorbei' : 'alle Status aktuell',
        overdue.length > 0 ? 'overdue' : 'done',
        "navigateTo('deployments',{ status:'Geplant' })")}
      ${monthKpiTile('Aufgaben offen', tasksOpen, tasksOverdue > 0 ? `${tasksOverdue} überfällig` : 'gesamt', tasksOverdue > 0 ? 'overdue' : 'plan',
        "navigateTo('tasks',{ scope:'mine_open' })")}
    </div>`;

  // Restmonat-Liste der geplanten Einsätze
  const restmonatHtml = restmonat.length === 0
    ? '<div class="month-section-empty">Keine geplanten Einsätze mehr in diesem Monat.</div>'
    : restmonat.slice(0, 8).map(d => {
        const dateLabel = restmonatDateLabel(d.datum_von, d.datum_bis);
        const titel = d.titel || d.service?.name || 'Einsatz';
        const ort = d.ort ? ` · ${esc(d.ort)}` : '';
        return `
          <button class="restmonat-row" type="button" onclick="openDeploymentModal('edit','${esc(d.id)}')">
            <span class="restmonat-date">${esc(dateLabel)}</span>
            <span class="restmonat-body">
              <span class="restmonat-firma">${esc(d.company?.name || '—')}</span>
              <span class="restmonat-meta">${esc(titel)}${ort}</span>
            </span>
          </button>`;
      }).join('');

  // Pflegerückstand-Liste
  const pflegeHtml = overdue.length === 0
    ? ''
    : `<div class="month-section month-section-overdue">
        <div class="month-section-title">Pflegerückstand · ${overdue.length}</div>
        <div class="restmonat-list">${overdue.slice(0, 5).map(d => {
          const dateLabel = restmonatDateLabel(d.datum_von, d.datum_bis);
          const titel = d.titel || d.service?.name || 'Einsatz';
          return `
            <button class="restmonat-row is-overdue" type="button" onclick="openDeploymentModal('edit','${esc(d.id)}')">
              <span class="restmonat-date">${esc(dateLabel)}</span>
              <span class="restmonat-body">
                <span class="restmonat-firma">${esc(d.company?.name || '—')}</span>
                <span class="restmonat-meta">${esc(titel)} — Status aktualisieren</span>
              </span>
            </button>`;
        }).join('')}</div>
      </div>`;

  // Top-Kunden nach Tagen
  const topDays = data.topCustomerDays || [];
  const maxDays = topDays.length > 0 ? topDays[0].days : 1;
  const topDaysHtml = topDays.length === 0
    ? '<div class="month-section-empty">Noch keine Einsatztage in diesem Monat.</div>'
    : topDays.map(c => {
        const pct = Math.max(4, Math.round((c.days / maxDays) * 100));
        return `
          <button class="top-customer-row" type="button" onclick="navigateTo('firma','${esc(c.id)}')">
            <span class="top-customer-bar" style="height:${pct}%"></span>
            <span class="top-customer-name">${esc(c.name)}</span>
            <span class="top-customer-sum">${c.days} ${c.days === 1 ? 'Tag' : 'Tage'}</span>
          </button>`;
      }).join('');

  return `
    ${kpiRow}
    <div class="month-bottom-grid">
      <div class="month-section">
        <div class="month-section-title">Geplant — Restmonat</div>
        <div class="restmonat-list">${restmonatHtml}</div>
        <div class="month-section-meta">${tasksDone} Aufgaben erledigt im Monat</div>
      </div>
      <div class="month-section">
        <div class="month-section-title">Top-Einsatztage (Kunde)</div>
        <div class="top-customers">${topDaysHtml}</div>
      </div>
    </div>
    ${pflegeHtml}`;
}

/** v1.46.0: Pipeline-Forecast-Gewichtung (Wahrscheinlichkeit pro Stage). */
const PIPELINE_FORECAST_WEIGHT = {
  'Lead': 0.10,
  'Angebot': 0.30,
  'In Arbeit': 0.70,
  'Abschlussphase': 0.90
};

/** v1.46.0: Vertrieb-Sicht — Forecast, Akquise, Mitgliedschaften.
 *  KPI-Reihe: Abgerechnet · Forecast · Conversion · Akquise.
 *  Bottom-Grid: Top-Kunden | Pipeline | Mitgliedschaften. */
function renderMonthDashVertrieb(data) {
  const todayISO = toISODate(new Date());
  const depsGeplant     = data.deployments.filter(d => d.status === 'Geplant');
  const depsDurchgef    = data.deployments.filter(d => d.status === 'Durchgeführt');
  const depsAbgerechnet = data.deployments.filter(d => d.status === 'Abgerechnet');

  const sumDays = (arr) => arr.reduce((s, d) => {
    const von = d.datum_von, bis = d.datum_bis || d.datum_von;
    if (!von) return s;
    const days = Math.max(1, Math.round((new Date(bis) - new Date(von)) / 86400000) + 1);
    return s + (Number(d.einzelpreis) || 0) * days;
  }, 0);
  const umsatzGeplant     = sumDays(depsGeplant) + sumDays(depsDurchgef);
  const umsatzAbgerechnet = sumDays(depsAbgerechnet);

  const pipelineProjects = data.pipelineProjects || [];
  const pipelineSum = pipelineProjects.reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
  const pipelineWeighted = pipelineProjects.reduce((s, p) => {
    const w = PIPELINE_FORECAST_WEIGHT[p.status] || 0;
    return s + ((Number(p.geschaetzter_umsatz) || 0) * w);
  }, 0);
  const forecast = umsatzAbgerechnet + umsatzGeplant + pipelineWeighted;

  const conv = data.conversionRate;
  const convText = conv === null ? '—' : `${conv}%`;
  const sparkData = data.revenueSparkline || [];

  const akquiseCount = (data.createdAppointmentsCount || 0) + (data.createdDeploymentsCount || 0);
  const akquiseSub = `${data.createdAppointmentsCount || 0} Termine · ${data.createdDeploymentsCount || 0} Einsätze`;

  const kpiRow = `
    <div class="month-kpi-row">
      ${monthKpiTile('Abgerechnet', formatPreis(umsatzAbgerechnet), `${depsAbgerechnet.length} Einsätze`, 'billed',
        "navigateTo('deployments',{ range:'month', status:'Abgerechnet' })", sparkData)}
      ${monthKpiTile('Forecast', formatPreis(forecast),
        `inkl. ${formatPreis(pipelineWeighted)} Pipeline (gew.)`, 'plan',
        "navigateTo('projects')", sparkData)}
      ${monthKpiTile('Conversion', convText, 'Termine → Einsatz', 'done',
        "navigateTo('appointments',{ range:'month', status:'durchgefuehrt' })")}
      ${monthKpiTile('Akquise', akquiseCount, akquiseSub, 'info',
        "navigateTo('appointments',{ range:'month' })")}
    </div>`;

  // Umsatz-Verlauf
  const monthName = MONTHS_DE[new Date(todayISO).getMonth()];
  const ziel = data.prevMonthsAvg && data.prevMonthsAvg > 0 ? data.prevMonthsAvg : null;
  const chartHtml = renderRevenueChart(data.monthDailyRevenue || [], todayISO, ziel);

  // Top-Kunden + Pipeline-Stages
  const topCustomers = data.topCustomers || [];
  const maxUmsatz = topCustomers.length > 0 ? topCustomers[0].umsatz : 1;
  const customersHtml = topCustomers.length === 0
    ? '<div class="month-section-empty">Noch keine Umsätze in diesem Monat.</div>'
    : topCustomers.map(c => {
        const pct = Math.max(4, Math.round((c.umsatz / maxUmsatz) * 100));
        return `
          <button class="top-customer-row" type="button" onclick="navigateTo('firma','${esc(c.id)}')">
            <span class="top-customer-bar" style="height:${pct}%"></span>
            <span class="top-customer-name">${esc(c.name)}</span>
            <span class="top-customer-sum">${esc(formatPreis(c.umsatz))}</span>
          </button>`;
      }).join('');

  const stagesHtml = renderPipelineStages(pipelineProjects);
  const membershipsHtml = renderMembershipAttention(data.membershipAttention || []);

  return `
    ${kpiRow}
    <div class="month-section-title">Umsatz-Verlauf ${esc(monthName)} · kumuliert</div>
    <div class="month-chart">${chartHtml}</div>
    <div class="month-bottom-grid is-three">
      <div class="month-section">
        <div class="month-section-title">Top-Kunden</div>
        <div class="top-customers">${customersHtml}</div>
      </div>
      <div class="month-section">
        <div class="month-section-title">Pipeline · ${esc(formatPreis(pipelineSum))}</div>
        <div class="pipeline-stages">${stagesHtml}</div>
      </div>
      <div class="month-section">
        <div class="month-section-title">Mitgliedschaften</div>
        ${membershipsHtml}
      </div>
    </div>`;
}

/** v1.46.0: Pipeline-Stage-Liste (extrahiert für Wiederverwendung in Beides). */
function renderPipelineStages(pipelineProjects) {
  const stages = ['Lead', 'Angebot', 'In Arbeit', 'Abschlussphase'];
  const stageMap = { Lead: 'plan', 'Angebot': 'plan', 'In Arbeit': 'done', 'Abschlussphase': 'billed' };
  return stages.map(stage => {
    const projs = pipelineProjects.filter(p => p.status === stage);
    const sum   = projs.reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
    const weight = Math.round((PIPELINE_FORECAST_WEIGHT[stage] || 0) * 100);
    return `
      <button class="pipeline-stage-row is-${stageMap[stage]}" type="button" onclick="navigateTo('projects')">
        <span class="pipeline-stage-name">${esc(stage)} <span class="pipeline-stage-weight">${weight}%</span></span>
        <span class="pipeline-stage-count">${projs.length}</span>
        <span class="pipeline-stage-sum">${esc(formatPreis(sum))}</span>
      </button>`;
  }).join('');
}

/** v1.46.0: Mitgliedschafts-Aufmerksamkeit — ablaufend ≤ 60 T oder Kontingent ≥ 80 %. */
function renderMembershipAttention(attentionList) {
  if (attentionList.length === 0) {
    return '<div class="month-section-empty">Keine Mitgliedschaft braucht aktuell Aufmerksamkeit.</div>';
  }
  return `<div class="membership-list">${attentionList.map(m => {
    const pillParts = [];
    if (m.isExpiring) {
      const tone = m.daysToEnd <= 14 ? 'is-overdue' : 'is-warn';
      const txt = m.daysToEnd <= 0
        ? 'läuft heute'
        : m.daysToEnd === 1 ? 'in 1 Tag' : `in ${m.daysToEnd} T`;
      pillParts.push(`<span class="membership-pill ${tone}">${esc(txt)}</span>`);
    }
    if (m.isDepleted && m.total > 0) {
      const tone = m.usagePct >= 100 ? 'is-overdue' : 'is-warn';
      pillParts.push(`<span class="membership-pill ${tone}">${m.usagePct}% verbraucht</span>`);
    }
    const program = m.program?.name || 'Mitgliedschaft';
    const usageMeta = m.total > 0
      ? `${m.used} / ${m.total} eingelöst`
      : 'kein Kontingent';
    return `
      <button class="membership-row" type="button" onclick="navigateTo('firma','${esc(m.company?.id || '')}')">
        <span class="membership-body">
          <span class="membership-firma">${esc(m.company?.name || '—')}</span>
          <span class="membership-meta">${esc(program)} · ${esc(usageMeta)}</span>
        </span>
        <span class="membership-pills">${pillParts.join('')}</span>
      </button>`;
  }).join('')}</div>`;
}

/** v1.46.0: Beides-Sicht — vereint Vertrieb (Forecast/Top-Kunden/Pipeline/
 *  Mitgliedschaften) und Technik (Auslastung). */
function renderMonthDashBeides(data) {
  const todayISO = toISODate(new Date());
  const depsGeplant     = data.deployments.filter(d => d.status === 'Geplant');
  const depsDurchgef    = data.deployments.filter(d => d.status === 'Durchgeführt');
  const depsAbgerechnet = data.deployments.filter(d => d.status === 'Abgerechnet');

  const sumDays = (arr) => arr.reduce((s, d) => {
    const von = d.datum_von, bis = d.datum_bis || d.datum_von;
    if (!von) return s;
    const days = Math.max(1, Math.round((new Date(bis) - new Date(von)) / 86400000) + 1);
    return s + (Number(d.einzelpreis) || 0) * days;
  }, 0);
  const umsatzGeplant     = sumDays(depsGeplant) + sumDays(depsDurchgef);
  const umsatzAbgerechnet = sumDays(depsAbgerechnet);

  const arbeitsTage = computeMonthAuslastung(data, todayISO);
  const auslastungPct = arbeitsTage.werk > 0
    ? Math.round((arbeitsTage.belegt / arbeitsTage.werk) * 100)
    : 0;

  const pipelineProjects = data.pipelineProjects || [];
  const pipelineSum = pipelineProjects.reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
  const pipelineWeighted = pipelineProjects.reduce((s, p) => {
    const w = PIPELINE_FORECAST_WEIGHT[p.status] || 0;
    return s + ((Number(p.geschaetzter_umsatz) || 0) * w);
  }, 0);
  const forecast = umsatzAbgerechnet + umsatzGeplant + pipelineWeighted;
  const sparkData = data.revenueSparkline || [];

  const kpiRow = `
    <div class="month-kpi-row">
      ${monthKpiTile('Abgerechnet', formatPreis(umsatzAbgerechnet), `${depsAbgerechnet.length} Einsätze`, 'billed',
        "navigateTo('deployments',{ range:'month', status:'Abgerechnet' })", sparkData)}
      ${monthKpiTile('Forecast', formatPreis(forecast),
        `inkl. ${formatPreis(pipelineWeighted)} Pipeline (gew.)`, 'plan',
        "navigateTo('projects')", sparkData)}
      ${monthKpiTile('Auslastung', `${auslastungPct}%`, `${arbeitsTage.belegt} / ${arbeitsTage.werk} Tage`, 'done',
        "navigateTo('deployments',{ range:'month', status:'Durchgeführt' })")}
      ${monthKpiTile('Pipeline', formatPreis(pipelineSum), `${pipelineProjects.length} Projekte`, 'info',
        "navigateTo('projects')")}
    </div>`;

  const monthName = MONTHS_DE[new Date(todayISO).getMonth()];
  const ziel = data.prevMonthsAvg && data.prevMonthsAvg > 0 ? data.prevMonthsAvg : null;
  const chartHtml = renderRevenueChart(data.monthDailyRevenue || [], todayISO, ziel);

  const topCustomers = data.topCustomers || [];
  const maxUmsatz = topCustomers.length > 0 ? topCustomers[0].umsatz : 1;
  const customersHtml = topCustomers.length === 0
    ? '<div class="month-section-empty">Noch keine Umsätze in diesem Monat.</div>'
    : topCustomers.map(c => {
        const pct = Math.max(4, Math.round((c.umsatz / maxUmsatz) * 100));
        return `
          <button class="top-customer-row" type="button" onclick="navigateTo('firma','${esc(c.id)}')">
            <span class="top-customer-bar" style="height:${pct}%"></span>
            <span class="top-customer-name">${esc(c.name)}</span>
            <span class="top-customer-sum">${esc(formatPreis(c.umsatz))}</span>
          </button>`;
      }).join('');

  const stagesHtml = renderPipelineStages(pipelineProjects);
  const membershipsHtml = renderMembershipAttention(data.membershipAttention || []);

  return `
    ${kpiRow}
    <div class="month-section-title">Umsatz-Verlauf ${esc(monthName)} · kumuliert</div>
    <div class="month-chart">${chartHtml}</div>
    <div class="month-bottom-grid is-three">
      <div class="month-section">
        <div class="month-section-title">Top-Kunden</div>
        <div class="top-customers">${customersHtml}</div>
      </div>
      <div class="month-section">
        <div class="month-section-title">Pipeline</div>
        <div class="pipeline-stages">${stagesHtml}</div>
      </div>
      <div class="month-section">
        <div class="month-section-title">Mitgliedschaften</div>
        ${membershipsHtml}
      </div>
    </div>`;
}

/** Helper für KPI-Kachel mit optionaler Sparkline. */
function monthKpiTile(kicker, value, sub, color, onclick, sparkData) {
  return `
    <button class="kpi-tile is-${color}" type="button" onclick="${onclick}">
      <div class="kpi-tile-body">
        <div class="kpi-tile-kicker">${esc(kicker)}</div>
        <div class="kpi-tile-value">${esc(String(value))}</div>
        ${sub ? `<div class="kpi-tile-sub">${esc(sub)}</div>` : ''}
      </div>
      ${sparkData && sparkData.length > 0 ? `<div class="kpi-tile-spark">${renderSparkline(sparkData)}</div>` : ''}
    </button>`;
}

/** Helper für Auslastung — extrahiert, wird von Technik + Beides genutzt. */
function computeMonthAuslastung(data, todayISO) {
  const monthStart = new Date(todayISO + 'T00:00:00'); monthStart.setDate(1);
  const monthEnd   = new Date(monthStart); monthEnd.setMonth(monthStart.getMonth() + 1); monthEnd.setDate(0);
  const yearHolidays = computeBwHolidays(monthStart.getFullYear());
  let werk = 0, belegt = 0;
  let cur = new Date(monthStart);
  while (cur <= monthEnd) {
    const iso = toISODate(cur);
    const dow = cur.getDay();
    const isWorkday = dow !== 0 && dow !== 6 && !yearHolidays.has(iso);
    if (isWorkday) {
      werk++;
      if (data.deployments.some(dep =>
        ['Durchgeführt', 'Abgerechnet'].includes(dep.status) &&
        iso >= dep.datum_von &&
        iso <= (dep.datum_bis || dep.datum_von)
      )) belegt++;
    }
    cur.setDate(cur.getDate() + 1);
  }
  return { werk, belegt };
}

/** ALT (vor v1.45.6) — wird durch die neuen renderMonthDash*-Funktionen ersetzt.
 *  Bleibt im Code als Fallback, falls jemand direkt darauf zugreift. */
function _renderBriefingMonthDashboard_legacy(data) {
  const todayISO = toISODate(new Date());
  const depsGeplant     = data.deployments.filter(d => d.status === 'Geplant');
  const depsDurchgef    = data.deployments.filter(d => d.status === 'Durchgeführt');
  const depsAbgerechnet = data.deployments.filter(d => d.status === 'Abgerechnet');

  // Umsatz pro Tag aus dem Monat × abgedeckter Tage = Summe
  const sumDays = (arr) => arr.reduce((s, d) => {
    const von = d.datum_von, bis = d.datum_bis || d.datum_von;
    if (!von) return s;
    const days = Math.max(1, Math.round((new Date(bis) - new Date(von)) / 86400000) + 1);
    return s + (Number(d.einzelpreis) || 0) * days;
  }, 0);
  const umsatzGeplant     = sumDays(depsGeplant) + sumDays(depsDurchgef);
  const umsatzAbgerechnet = sumDays(depsAbgerechnet);
  const umsatzGesamt      = umsatzGeplant + umsatzAbgerechnet;

  // Auslastung: durchgef.+abgerechn. Tage / Werktage im Monat
  const arbeitsTage = (() => {
    const monthStart = new Date(todayISO + 'T00:00:00'); monthStart.setDate(1);
    const monthEnd   = new Date(monthStart); monthEnd.setMonth(monthStart.getMonth() + 1); monthEnd.setDate(0);
    const yearHolidays = computeBwHolidays(monthStart.getFullYear());
    let werk = 0, belegt = 0;
    let cur = new Date(monthStart);
    while (cur <= monthEnd) {
      const iso = toISODate(cur);
      const dow = cur.getDay();
      const isWorkday = dow !== 0 && dow !== 6 && !yearHolidays.has(iso);
      if (isWorkday) {
        werk++;
        if (data.deployments.some(dep =>
          ['Durchgeführt', 'Abgerechnet'].includes(dep.status) &&
          iso >= dep.datum_von &&
          iso <= (dep.datum_bis || dep.datum_von)
        )) belegt++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return { werk, belegt };
  })();
  const auslastungPct = arbeitsTage.werk > 0
    ? Math.round((arbeitsTage.belegt / arbeitsTage.werk) * 100)
    : 0;

  // Pipeline aggregiert
  const pipelineProjects = data.pipelineProjects || [];
  const pipelineSum = pipelineProjects.reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);

  // KPI-Kacheln mit Sparkline
  const tile = (kicker, value, sub, color, onclick, sparkData) => `
    <button class="kpi-tile is-${color}" type="button" onclick="${onclick}">
      <div class="kpi-tile-body">
        <div class="kpi-tile-kicker">${esc(kicker)}</div>
        <div class="kpi-tile-value">${esc(String(value))}</div>
        ${sub ? `<div class="kpi-tile-sub">${esc(sub)}</div>` : ''}
      </div>
      ${sparkData ? `<div class="kpi-tile-spark">${renderSparkline(sparkData)}</div>` : ''}
    </button>`;

  const sparkData = data.revenueSparkline || [];

  const kpiRow = `
    <div class="month-kpi-row">
      ${tile('Abgerechnet', formatPreis(umsatzAbgerechnet),
          `${depsAbgerechnet.length} Einsätze`, 'billed',
          "navigateTo('deployments',{ range:'month', status:'Abgerechnet' })",
          sparkData)}
      ${tile('Geplant', formatPreis(umsatzGeplant),
          `${depsGeplant.length + depsDurchgef.length} Einsätze`, 'plan',
          "navigateTo('deployments',{ range:'month', status:'Geplant' })",
          sparkData)}
      ${tile('Auslastung', `${auslastungPct}%`,
          `${arbeitsTage.belegt} / ${arbeitsTage.werk} Tage`, 'done',
          "navigateTo('deployments',{ range:'month', status:'Durchgeführt' })",
          null)}
      ${tile('Pipeline', formatPreis(pipelineSum),
          `${pipelineProjects.length} Projekte`, 'info',
          "navigateTo('projects')",
          null)}
    </div>`;

  // Umsatz-Verlauf-Diagramm
  const monthName = MONTHS_DE[new Date(todayISO).getMonth()];
  const ziel = data.prevMonthsAvg && data.prevMonthsAvg > 0 ? data.prevMonthsAvg : null;
  const chartHtml = renderRevenueChart(data.monthDailyRevenue || [], todayISO, ziel);

  // Top-Kunden + Pipeline-Stages nebeneinander
  const topCustomers = data.topCustomers || [];
  const maxUmsatz = topCustomers.length > 0 ? topCustomers[0].umsatz : 1;
  const customersHtml = topCustomers.length === 0
    ? `<div class="month-section-empty">Noch keine Umsätze in diesem Monat.</div>`
    : topCustomers.map(c => {
        const pct = Math.max(4, Math.round((c.umsatz / maxUmsatz) * 100));
        return `
          <button class="top-customer-row" type="button" onclick="navigateTo('firma','${esc(c.id)}')">
            <span class="top-customer-bar" style="height:${pct}%"></span>
            <span class="top-customer-name">${esc(c.name)}</span>
            <span class="top-customer-sum">${esc(formatPreis(c.umsatz))}</span>
          </button>`;
      }).join('');

  // Pipeline-Stages
  const stages = ['Lead', 'Angebot', 'In Arbeit', 'Abschlussphase'];
  const stageMap = { Lead: 'plan', 'Angebot': 'plan', 'In Arbeit': 'done', 'Abschlussphase': 'billed' };
  const stagesHtml = stages.map(stage => {
    const projs = pipelineProjects.filter(p => p.status === stage);
    const sum   = projs.reduce((s, p) => s + (Number(p.geschaetzter_umsatz) || 0), 0);
    return `
      <button class="pipeline-stage-row is-${stageMap[stage]}" type="button" onclick="navigateTo('projects')">
        <span class="pipeline-stage-name">${esc(stage)}</span>
        <span class="pipeline-stage-count">${projs.length}</span>
        <span class="pipeline-stage-sum">${esc(formatPreis(sum))}</span>
      </button>`;
  }).join('');

  return `
    <div class="month-dashboard">
      ${kpiRow}

      <div class="month-section-title">Umsatz-Verlauf ${esc(monthName)} · kumuliert</div>
      <div class="month-chart">${chartHtml}</div>

      <div class="month-bottom-grid">
        <div class="month-section">
          <div class="month-section-title">Top-Kunden</div>
          <div class="top-customers">${customersHtml}</div>
        </div>
        <div class="month-section">
          <div class="month-section-title">Pipeline</div>
          <div class="pipeline-stages">${stagesHtml}</div>
        </div>
      </div>
    </div>`;
}

/** Mini-Sparkline als SVG (30 Tage). */
function renderSparkline(values) {
  if (!values || values.length === 0) return '';
  const w = 80, h = 24;
  const max = Math.max(...values, 1);
  const step = w / Math.max(1, values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = h - (v / max) * (h - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return `
    <svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
    </svg>`;
}

/** Umsatz-Verlauf für aktuellen Monat: solide Linie bis heute (kumuliert
 *  durchgef.+abgerechn.), gestrichelte Forecast-Linie ab heute, horizontale
 *  Ziel-Linie. */
function renderRevenueChart(daily, todayISO, ziel) {
  if (!daily || daily.length === 0) return '<div class="month-section-empty">Keine Daten.</div>';

  // Kumulieren
  let cumReal = 0, cumForecast = 0;
  let realPath = [];   // bis heute
  let forecastStart = null;
  let forecastPath = [];
  daily.forEach(d => {
    cumReal += d.realized;
    if (d.iso <= todayISO) {
      realPath.push({ iso: d.iso, value: cumReal });
      forecastStart = cumReal;
    }
    if (d.iso > todayISO) {
      cumForecast += d.realized + d.forecast;
      forecastPath.push({ iso: d.iso, value: forecastStart + cumForecast });
    }
  });

  const w = 720, h = 90;
  const padL = 40, padR = 16, padT = 8, padB = 18;
  const innerW = w - padL - padR, innerH = h - padT - padB;
  const allValues = [...realPath, ...forecastPath].map(p => p.value);
  const zielVal = ziel && ziel > 0 ? ziel : 0;
  const maxVal = Math.max(...allValues, zielVal, 1);

  const xFor = (i) => padL + (i / (daily.length - 1)) * innerW;
  const yFor = (v) => padT + innerH - (v / maxVal) * innerH;

  const realCoords = realPath.map((p, idx) => `${xFor(idx)},${yFor(p.value)}`).join(' ');

  // Forecast: schließe an letzten Real-Punkt an
  const lastRealIdx = realPath.length - 1;
  const forecastCoordsArr = forecastPath.map((p, idx) =>
    `${xFor(lastRealIdx + 1 + idx)},${yFor(p.value)}`
  );
  const forecastCoords = lastRealIdx >= 0
    ? `${xFor(lastRealIdx)},${yFor(realPath[lastRealIdx].value)} ${forecastCoordsArr.join(' ')}`
    : forecastCoordsArr.join(' ');

  const zielY = zielVal > 0 ? yFor(zielVal) : null;
  const zielLineHtml = zielY !== null ? `
    <line x1="${padL}" y1="${zielY}" x2="${padL+innerW}" y2="${zielY}" stroke="#9ca3af" stroke-width="1" stroke-dasharray="2 4"/>
    <text x="${padL+innerW-2}" y="${zielY-3}" font-size="10" fill="#6b7280" text-anchor="end">Ziel ${formatPreis(zielVal)}</text>
  ` : '';

  // X-Achsen-Labels: Tag 1, 15, letzter
  const xLabels = [];
  if (daily.length > 0) {
    const days = [0, Math.floor(daily.length / 2), daily.length - 1];
    days.forEach(i => {
      const dayNum = new Date(daily[i].iso + 'T00:00:00').getDate();
      xLabels.push(`<text x="${xFor(i)}" y="${h-4}" font-size="10" fill="#6b7280" text-anchor="middle">${dayNum}</text>`);
    });
  }

  return `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="xMidYMid meet">
      ${zielLineHtml}
      ${realCoords ? `<polyline points="${realCoords}" fill="none" stroke="${getComputedColor('--status-done-accent')}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      ${forecastCoords ? `<polyline points="${forecastCoords}" fill="none" stroke="${getComputedColor('--color-info')}" stroke-width="2" stroke-dasharray="4 4" stroke-linecap="round" stroke-linejoin="round"/>` : ''}
      ${xLabels.join('')}
      <text x="${padL-4}" y="${padT+10}" font-size="10" fill="#6b7280" text-anchor="end">${formatPreis(maxVal)}</text>
      <text x="${padL-4}" y="${h-padB+4}" font-size="10" fill="#6b7280" text-anchor="end">0</text>
    </svg>`;
}

function getComputedColor(varName) {
  // Pragmatischer Fallback — gibt bei nicht gesetzten Variablen einen Hex-Default zurück
  const fallback = {
    '--status-done-accent': '#5a8c1f',
    '--color-info': '#1d4ed8'
  }[varName];
  return fallback || '#666';
}

/** v1.45.1: Wochenstreifen oben — 7 Tageskarten Mo–So mit Indikator-Balken
 *  (geplant/durchgeführt/abgerechnet/feiertag/frei), „X T · Y E" und
 *  Tagessumme. Klick scrollt smooth zur Tageszeile in der Agenda darunter. */
function renderWeekStrip(data) {
  const todayISO = toISODate(new Date());
  const startISO = data.range.startISO;
  const start = new Date(startISO + 'T00:00:00');

  // v1.47.0: 5 Werktage statt 7. Wochenende ausgeblendet.
  const dayInfo = {};
  for (let i = 0; i < 5; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const iso = toISODate(d);
    dayInfo[iso] = { iso, terms: 0, deps: [], tagSumme: 0 };
  }
  (data.appointments || []).forEach(a => {
    if (dayInfo[a.datum]) dayInfo[a.datum].terms++;
  });
  (data.deployments || []).forEach(dep => {
    const von = dep.datum_von;
    const bis = dep.datum_bis || dep.datum_von;
    const einzel = Number(dep.einzelpreis) || 0;
    Object.values(dayInfo).forEach(di => {
      if (di.iso >= von && di.iso <= bis) {
        di.deps.push(dep);
        if (dep.status !== 'Storniert') di.tagSumme += einzel;
      }
    });
  });

  const yearHolidays = new Map();
  const cards = Object.values(dayInfo).map(di => {
    const d = new Date(di.iso + 'T00:00:00');
    const dow = d.getDay();
    const year = d.getFullYear();
    if (!yearHolidays.has(year)) yearHolidays.set(year, computeBwHolidays(year));
    const isHoliday = yearHolidays.get(year).has(di.iso);
    const isToday   = di.iso === todayISO;
    const isPast    = di.iso < todayISO;
    const isWeekend = dow === 0 || dow === 6;

    // Indikator-Balken: höchster aktiver Status bestimmt die Farbe
    let indicator = 'free';
    if (isHoliday) indicator = 'holiday';
    else if (di.deps.length > 0) {
      if (di.deps.some(d => d.status === 'Abgerechnet')) indicator = 'billed';
      else if (di.deps.some(d => d.status === 'Durchgeführt')) indicator = 'done';
      else if (di.deps.some(d => d.status === 'Geplant')) indicator = 'plan';
      else if (di.deps.some(d => d.status === 'Storniert')) indicator = 'overdue';
    }
    else if (di.terms > 0) indicator = 'plan';

    const cls = ['week-strip-card', `is-ind-${indicator}`];
    if (isToday)   cls.push('is-today');
    if (isPast)    cls.push('is-past');
    if (isWeekend && indicator === 'free') cls.push('is-free-weekend');

    const counts = (di.terms > 0 || di.deps.length > 0)
      ? `${di.terms} T · ${di.deps.length} E`
      : '— frei';
    const summeText = di.tagSumme > 0 ? formatPreis(di.tagSumme) : '—';

    return `
      <button class="${cls.join(' ')}" type="button" onclick="scrollToWeekDay('${esc(di.iso)}')">
        <div class="week-strip-card-bar"></div>
        <div class="week-strip-card-day">${esc(WEEKDAYS_DE[dow].substring(0,2))}</div>
        <div class="week-strip-card-date">${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}.</div>
        <div class="week-strip-card-counts">${esc(counts)}</div>
        <div class="week-strip-card-sum">${esc(summeText)}</div>
      </button>`;
  }).join('');

  // v1.47.0: KW-Header + Datumsspanne über den Tageskarten.
  const startDate = new Date(startISO + 'T00:00:00');
  const endDate = new Date(startDate); endDate.setDate(startDate.getDate() + 4);
  const kw = isoWeekNumber(startDate);
  const fmt = (d) => `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.`;
  const headerRange = `${fmt(startDate)}–${fmt(endDate)}${endDate.getFullYear()}`;
  return `
    <div class="week-strip-header">
      <span class="week-strip-kw">KW ${kw}</span>
      <span class="week-strip-range">${esc(headerRange)}</span>
    </div>
    <div class="week-strip-row">${cards}</div>`;
}

/** Scrollt smooth zur Tageszeile in der Wochen-Agenda. */
function scrollToWeekDay(iso) {
  const target = document.getElementById(`week-day-${iso}`);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  // Kurzer Highlight-Pulse
  target.classList.add('week-day-pulse');
  setTimeout(() => target.classList.remove('week-day-pulse'), 1200);
}

/** v1.44.13: Wochen-Agenda für „Diese Woche". Mo–Fr als Liste mit Tag-
 *  Headern. Pro Tag: Einsätze (zuerst, umsatzrelevant) und Termine als
 *  klickbare Item-Zeilen. Lesbarer als die alte Spalten-Strip, wenn pro
 *  Tag mehrere Items anstehen. Klick öffnet Inline-Dashboard unterhalb. */
function renderBriefingWeekAgenda(data) {
  const todayISO = toISODate(new Date());
  const startISO = data.range.startISO;

  const days = [];
  const start = new Date(startISO + 'T00:00:00');
  // v1.47.0: zurück auf 5 Werktage (Mo–Fr). Feiertag-Erkennung (BW)
  // und Tagessumme aus Einsätzen pro Tag bleiben.
  const yearHolidays = new Map();
  for (let i = 0; i < 5; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const iso = toISODate(d);
    const dow = d.getDay();
    const year = d.getFullYear();
    if (!yearHolidays.has(year)) yearHolidays.set(year, computeBwHolidays(year));
    const isHoliday = yearHolidays.get(year).has(iso);
    days.push({
      iso,
      weekday: WEEKDAYS_DE[dow],
      day: d.getDate(),
      month: MONTHS_DE[d.getMonth()],
      isToday: iso === todayISO,
      isPast: iso < todayISO,
      isWeekend: dow === 0 || dow === 6,
      isHoliday,
      items: [],
      tagSumme: 0
    });
  }

  // Einsätze auf alle abgedeckten Tage (mehrtägig). Tagessumme = einzelpreis
  // pro Tag (nicht das Gesamt × Tage — sonst doppelt gezählt).
  (data.deployments || []).forEach(dep => {
    const von = dep.datum_von;
    const bis = dep.datum_bis || dep.datum_von;
    const einzel = Number(dep.einzelpreis) || 0;
    days.forEach(day => {
      if (day.iso >= von && day.iso <= bis) {
        let tagInfo = '';
        if (von !== bis) {
          const tagN = Math.round((new Date(day.iso) - new Date(von)) / 86400000) + 1;
          const totalTage = Math.round((new Date(bis) - new Date(von)) / 86400000) + 1;
          tagInfo = `Tag ${tagN}/${totalTage}`;
        }
        day.items.push({ kind: 'einsatz', dep, tagInfo });
        if (dep.status !== 'Storniert') day.tagSumme += einzel;
      }
    });
  });
  // Termine
  (data.appointments || []).forEach(t => {
    const day = days.find(d => d.iso === t.datum);
    if (day) day.items.push({ kind: 'termin', appt: t });
  });
  // Pro Tag: Einsätze zuerst, dann Termine nach Uhrzeit
  days.forEach(d => {
    d.items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'einsatz' ? -1 : 1;
      if (a.kind === 'termin') {
        return ((a.appt.uhrzeit_von || '') || '').localeCompare(b.appt.uhrzeit_von || '');
      }
      return 0;
    });
  });

  return `
    <div class="week-agenda">
      ${days.map(day => renderWeekAgendaDay(day)).join('')}
    </div>
    <div id="week-strip-expand"></div>`;
}

function renderWeekAgendaDay(day) {
  const cls = ['week-agenda-day'];
  if (day.isToday) cls.push('is-today');
  if (day.isPast)  cls.push('is-past');
  if (day.isWeekend) cls.push('is-weekend');
  if (day.isHoliday) cls.push('is-holiday');

  const itemsHtml = day.items.length === 0
    ? `<div class="week-agenda-empty">— frei</div>`
    : day.items.map(it => renderWeekAgendaItem(it)).join('');

  // v1.45.1: Tagessumme rechts oben (Σ €)
  const tagSummeText = day.tagSumme > 0 ? formatPreis(day.tagSumme) : '';

  return `
    <div class="${cls.join(' ')}" id="week-day-${esc(day.iso)}">
      <div class="week-agenda-head">
        <div class="week-agenda-head-left">
          <div class="week-agenda-day-name">${esc(day.weekday)}${day.isToday ? ' · Heute' : ''}${day.isHoliday ? ' · Feiertag' : ''}</div>
          <div class="week-agenda-day-date">${day.day}. ${esc(day.month)}</div>
        </div>
        ${tagSummeText ? `<div class="week-agenda-day-sum">${esc(tagSummeText)}</div>` : ''}
      </div>
      <div class="week-agenda-items">${itemsHtml}</div>
    </div>`;
}

function renderWeekAgendaItem(it) {
  // v1.45.5: Eine fixed-width Pille pro Item (statt Tag + Status nebeneinander).
  // Damit stehen alle Items sauber untereinander aligned.
  if (it.kind === 'einsatz') {
    const d = it.dep;
    const status = d.status || 'Geplant';
    const firma = d.company?.name || 'Einsatz';
    const titel = d.titel || d.service?.name || 'Einsatz';
    const wert = (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0);
    const meta = [
      it.tagInfo,
      d.ort && d.ort !== firma ? d.ort : '',
      wert > 0 ? formatPreis(wert) : ''
    ].filter(Boolean).join(' · ');
    return `<div class="week-agenda-item is-einsatz dep-status-${esc(status.replace(/\s+/g,'-').toLowerCase())}" data-kind="deployment" data-id="${esc(d.id)}" onclick="weekStripToggleExpand('deployment','${esc(d.id)}',this)">
      <span class="week-agenda-pill">Einsatz</span>
      <div class="week-agenda-body">
        <div class="week-agenda-titel">${esc(firma)}</div>
        <div class="week-agenda-sub">${esc(titel)}${meta ? ' · ' + esc(meta) : ''}</div>
      </div>
    </div>`;
  } else {
    const t = it.appt;
    const time = t.uhrzeit_von ? t.uhrzeit_von.substring(0, 5) : '';
    const titel = t.titel || 'Termin';
    const firma = t.company?.name || '';
    const sub = [firma, t.ort].filter(Boolean).join(' · ');
    const pillText = time || 'Termin';
    return `<div class="week-agenda-item is-termin" data-kind="appointment" data-id="${esc(t.id)}" onclick="weekStripToggleExpand('appointment','${esc(t.id)}',this)">
      <span class="week-agenda-pill">${esc(pillText)}</span>
      <div class="week-agenda-body">
        <div class="week-agenda-titel">${esc(titel)}</div>
        ${sub ? `<div class="week-agenda-sub">${esc(sub)}</div>` : ''}
      </div>
    </div>`;
  }
}

/** Alte Spalten-Strip — wird seit v1.44.13 nicht mehr verwendet, aber zur
 *  Sicherheit hier belassen (falls anderer Code drauf zugreift). */
function renderBriefingWeekStrip(data) {
  const todayISO = toISODate(new Date());
  const startISO = data.range.startISO;

  const days = [];
  const start = new Date(startISO + 'T00:00:00');
  for (let i = 0; i < 5; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const iso = toISODate(d);
    days.push({
      iso,
      weekday: WEEKDAYS_DE[d.getDay()],
      day: d.getDate(),
      month: MONTHS_DE[d.getMonth()],
      isToday: iso === todayISO,
      isPast: iso < todayISO,
      einsaetze: [],
      termine: []
    });
  }

  // Einsätze auf alle abgedeckten Tage verteilen (mehrtägig)
  (data.deployments || []).forEach(dep => {
    const von = dep.datum_von;
    const bis = dep.datum_bis || dep.datum_von;
    days.forEach(day => {
      if (day.iso >= von && day.iso <= bis) day.einsaetze.push(dep);
    });
  });
  // Termine auf den Tag mappen
  (data.appointments || []).forEach(t => {
    const day = days.find(d => d.iso === t.datum);
    if (day) day.termine.push(t);
  });
  // Termine pro Tag nach Uhrzeit sortieren
  days.forEach(d => {
    d.termine.sort((a, b) => (a.uhrzeit_von || '').localeCompare(b.uhrzeit_von || ''));
  });

  return `
    <div class="week-strip">
      ${days.map(day => `
        <div class="week-day${day.isToday ? ' is-today' : ''}${day.isPast ? ' is-past' : ''}">
          <div class="week-day-head">
            <div class="week-day-name">${esc(day.weekday)}</div>
            <div class="week-day-date">${day.day}. ${esc(day.month)}</div>
          </div>
          <div class="week-day-items">
            ${day.einsaetze.map(d => renderWeekPill('einsatz', d)).join('')}
            ${day.termine.map(t => renderWeekPill('termin', t)).join('')}
            ${day.einsaetze.length === 0 && day.termine.length === 0 ? '<div class="week-day-empty">— frei</div>' : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <div id="week-strip-expand"></div>`;
}

/** Klein-Pill für die Wochen-Strip — klickbar, öffnet Inline-Dashboard
 *  unterhalb der Strip (oder Modal auf Mobile). */
function renderWeekPill(kind, item) {
  if (kind === 'einsatz') {
    const status = item.status || 'Geplant';
    const firma = item.company?.name || 'Einsatz';
    const titel = item.titel || item.service?.name || 'Einsatz';
    const wert = (Number(item.menge) || 0) * (Number(item.einzelpreis) || 0);
    const tooltip = `${titel}${firma !== titel ? ' · ' + firma : ''}${wert > 0 ? ' · ' + formatPreis(wert) : ''} · ${status}`;
    return `<div class="week-pill is-einsatz dep-status-${esc(status.replace(/\s+/g,'-').toLowerCase())}" data-kind="deployment" data-id="${esc(item.id)}" onclick="weekStripToggleExpand('deployment','${esc(item.id)}',this)" title="${esc(tooltip)}">
      <span class="week-pill-kind">Einsatz</span>
      <span class="week-pill-title">${esc(firma)}</span>
    </div>`;
  } else {
    const time = item.uhrzeit_von ? item.uhrzeit_von.substring(0, 5) : '';
    const titel = item.titel || 'Termin';
    const firma = item.company?.name || '';
    const tooltip = `${time ? time + ' · ' : ''}${titel}${firma ? ' · ' + firma : ''}`;
    return `<div class="week-pill is-termin" data-kind="appointment" data-id="${esc(item.id)}" onclick="weekStripToggleExpand('appointment','${esc(item.id)}',this)" title="${esc(tooltip)}">
      ${time ? `<span class="week-pill-time">${esc(time)}</span>` : ''}
      <span class="week-pill-title">${esc(firma || titel)}</span>
    </div>`;
  }
}

/** v1.44.8: Inline-Dashboard unterhalb der Wochen-Strip toggeln.
 *  Wiederverwendet die existierenden render-Funktionen aus dem
 *  Listen-Inline-Expand. Auf Mobile fällt die Pill auf das Modal zurück. */
let _weekStripExpanded = { kind: null, id: null };
async function weekStripToggleExpand(entityType, entityId, pillEl) {
  if (isMobileForExpand && isMobileForExpand()) {
    if (entityType === 'deployment')  return openDeploymentModal('edit', entityId);
    if (entityType === 'appointment') return openAppointmentModal('edit', entityId);
    return;
  }

  const container = document.getElementById('week-strip-expand');
  if (!container) return;

  // Doppelklick auf gleiche Pill → schließen
  if (_weekStripExpanded.kind === entityType && _weekStripExpanded.id === entityId) {
    container.innerHTML = '';
    document.querySelectorAll('.week-pill.is-active').forEach(el => el.classList.remove('is-active'));
    _weekStripExpanded = { kind: null, id: null };
    return;
  }

  // Vorher aktive Pill abschalten
  document.querySelectorAll('.week-pill.is-active').forEach(el => el.classList.remove('is-active'));
  pillEl?.classList.add('is-active');
  _weekStripExpanded = { kind: entityType, id: entityId };

  // Skeleton sofort
  container.innerHTML = `<div class="week-expand-panel"><div class="expanded-row-panel-inner">${renderExpandedSkeleton()}</div></div>`;

  try {
    let html = '';
    if (entityType === 'deployment')       html = await renderDeploymentExpandedRow(entityId, null);
    else if (entityType === 'appointment') html = await renderAppointmentExpandedRow(entityId, null);

    // Nur einsetzen, wenn der User in der Zwischenzeit nicht woanders geklickt hat
    if (_weekStripExpanded.kind === entityType && _weekStripExpanded.id === entityId) {
      container.innerHTML = `<div class="week-expand-panel"><div class="expanded-row-panel-inner">${html}</div></div>`;
    }
  } catch (e) {
    container.innerHTML = `<div class="week-expand-panel"><div class="info-card-empty">Fehler: ${esc(e.message)}</div></div>`;
  }
}

/** v1.44.4: Inline-KPI-Bar oben rechts neben den Tabs.
 *  - Hero-Modus (Einsatz heute): „X Termine · Y Aufgaben (Z überfällig)"
 *    — Einsätze raus (steht prominent im Hero), Aufgaben + Überfällig fusioniert.
 *  - Heute ohne Einsatz: alle vier (Termine · Einsätze · Aufgaben · Überfällig).
 *  - Woche: dito.
 *  - Monat: Termine · Einsätze · Aufgaben · Umsatz.
 *  Kein Icon, kein Cards-Look — knappe Text-Pills mit Trennpunkt. */
function renderBriefingKpisInline(scope, data, opts = {}) {
  const overdueText = data.overdueTasks.length > 0
    ? ` <span class="kpi-inline-bad">(${data.overdueTasks.length} überfällig)</span>`
    : '';
  const parts = [];

  if (opts.heroMode) {
    parts.push(`<span class="kpi-inline-num">${data.appointments.length}</span> ${data.appointments.length === 1 ? 'Termin' : 'Termine'}`);
    parts.push(`<span class="kpi-inline-num">${data.tasks.length}</span> ${data.tasks.length === 1 ? 'Aufgabe' : 'Aufgaben'}${overdueText}`);
  } else if (scope === 'monat') {
    const umsatz = data.deployments
      .filter(d => d.status === 'Durchgeführt' || d.status === 'Abgerechnet')
      .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
    parts.push(`<span class="kpi-inline-num">${data.appointments.length}</span> Termine`);
    parts.push(`<span class="kpi-inline-num">${data.deployments.length}</span> Einsätze`);
    parts.push(`<span class="kpi-inline-num">${data.tasks.length}</span> Aufgaben`);
    parts.push(`<span class="kpi-inline-num">${esc(formatPreis(umsatz))}</span> Umsatz`);
  } else {
    parts.push(`<span class="kpi-inline-num">${data.appointments.length}</span> Termine`);
    parts.push(`<span class="kpi-inline-num">${data.deployments.length}</span> Einsätze`);
    parts.push(`<span class="kpi-inline-num">${data.tasks.length}</span> Aufgaben${overdueText}`);
  }

  return parts.join('<span class="kpi-inline-sep">·</span>');
}

/** v1.45.0: Heute-Tab Grid mit kompakten Einsatzkarten. Eine Karte pro
 *  Einsatz heute + eine „+ Einsatz hinzufügen"-Karte als letzte Zelle.
 *  Genau eine Karte bekommt den „Jetzt"-Marker (aktive Stunde im
 *  Zeitfenster, Fallback: erster Geplanter). */
function renderHeuteDeploymentGrid(todayDeps) {
  const techMap = {}; // wird vom Hero-Code befüllt — hier nicht zwingend nötig
  const nowIso = new Date();
  const todayISO = toISODate(nowIso);

  // „Jetzt"-Karte bestimmen: ein Einsatz dessen Uhrzeit-Fenster heute aktiv ist;
  // Fallback der erste Geplante; sonst keiner.
  const jetztId = (() => {
    const nowHM = `${String(nowIso.getHours()).padStart(2,'0')}:${String(nowIso.getMinutes()).padStart(2,'0')}`;
    const inWindow = todayDeps.find(d => {
      if (d.status === 'Abgerechnet' || d.status === 'Storniert') return false;
      if (!d.uhrzeit_von || !d.uhrzeit_bis) return false;
      const von = d.uhrzeit_von.substring(0, 5);
      const bis = d.uhrzeit_bis.substring(0, 5);
      return nowHM >= von && nowHM <= bis;
    });
    if (inWindow) return inWindow.id;
    const firstPlanned = todayDeps.find(d => d.status === 'Geplant');
    return firstPlanned?.id || null;
  })();

  const cards = todayDeps.map(d => renderHeuteDeploymentCard(d, d.id === jetztId)).join('');
  const addCard = `
    <button class="heute-card heute-card-add" type="button" onclick="openDeploymentModal('new')">
      <span class="heute-card-add-plus" aria-hidden="true">+</span>
      <span>Einsatz hinzufügen</span>
    </button>`;

  return `<div class="heute-deploy-grid">${cards}${addCard}</div>`;
}

function renderHeuteDeploymentCard(d, isNow) {
  const status = d.status || 'Geplant';
  const isBilled = status === 'Abgerechnet';
  const isCancel = status === 'Storniert';

  const firma = d.company?.name || 'Einsatz';
  const typeLabel = (d.ort || '').toLowerCase().includes('online') ? 'Online' : 'Vor Ort';
  // Untertitel: Service-Name oder Titel
  const subtitle = d.titel || d.service?.name || '';

  // Standort: nur die Stadt extrahieren (heuristisch — nimm letzten PLZ-Stadt-Block)
  const stadtMatch = (d.ort || '').match(/(\d{5})\s+([^,]+)/);
  const stadt = stadtMatch ? stadtMatch[2].trim() : (d.ort || '').split(',').pop().trim();

  // Tagessatz × Tage = Gesamt
  const einzel = Number(d.einzelpreis) || 0;
  const menge  = Number(d.menge) || 0;
  const gesamt = einzel * menge;
  const priceText = einzel > 0
    ? `${formatPreis(einzel)}${menge > 1 ? ` × ${menge} = ${formatPreis(gesamt)}` : ''}`
    : '';

  const classes = [
    'heute-card',
    `is-status-${esc(status.replace(/\s+/g,'-').toLowerCase())}`,
    isNow   ? 'is-now'    : '',
    isBilled ? 'is-billed' : '',
    isCancel ? 'is-cancelled' : ''
  ].filter(Boolean).join(' ');

  return `
    <button class="${classes}" type="button" onclick="openDeploymentModal('edit','${esc(d.id)}')">
      <div class="heute-card-row1">
        <span class="heute-card-type">${esc(typeLabel)}</span>
        <span class="heute-card-status">${esc(status)}</span>
      </div>
      <div class="heute-card-row2">
        <div class="heute-card-firma">${esc(firma)}</div>
        ${subtitle ? `<div class="heute-card-sub">${esc(subtitle)}</div>` : ''}
      </div>
      <div class="heute-card-row3">
        ${stadt ? `<span>${esc(stadt)}</span>` : '<span class="heute-card-meta-muted">—</span>'}
        ${priceText ? `<span class="heute-card-price">${esc(priceText)}</span>` : ''}
      </div>
      ${isNow ? '<span class="heute-card-now-pill">Jetzt</span>' : ''}
    </button>`;
}

/** v1.45.4: Nächste 3 Tage als 3 Cards nebeneinander — direkt unter den
 *  Einsatzkarten platziert. Pro Card: Wochentag + Datum + Item-Liste
 *  (Einsätze zuerst, dann Termine nach Uhrzeit). */
function renderHeuteNext3DaysGrid(data) {
  const todayISO = toISODate(new Date());
  const days = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date(todayISO + 'T00:00:00'); d.setDate(d.getDate() + i);
    const iso = toISODate(d);
    days.push({
      iso,
      weekday: WEEKDAYS_DE[d.getDay()],
      day: d.getDate(),
      month: MONTHS_DE[d.getMonth()],
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      items: []
    });
  }

  // Items verteilen
  (data.previewAppointments || []).forEach(a => {
    const day = days.find(d => d.iso === a.datum);
    if (day) day.items.push({ kind: 'termin', appt: a });
  });
  (data.previewDeployments || []).forEach(dep => {
    const von = dep.datum_von, bis = dep.datum_bis || dep.datum_von;
    days.forEach(day => {
      if (day.iso >= von && day.iso <= bis) day.items.push({ kind: 'einsatz', dep });
    });
  });
  // Sort: Einsätze zuerst, dann Termine nach Uhrzeit
  days.forEach(d => {
    d.items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'einsatz' ? -1 : 1;
      if (a.kind === 'termin') return ((a.appt.uhrzeit_von || '') || '').localeCompare(b.appt.uhrzeit_von || '');
      return 0;
    });
  });

  return `
    <div class="heute-next3-grid">
      ${days.map(day => renderHeuteNext3DayCard(day)).join('')}
    </div>`;
}

function renderHeuteNext3DayCard(day) {
  const cls = ['heute-next3-card'];
  if (day.isWeekend) cls.push('is-weekend');

  const itemsHtml = day.items.length === 0
    ? `<div class="heute-next3-empty">— frei</div>`
    : day.items.map(it => renderHeuteNext3Item(it)).join('');

  return `
    <div class="${cls.join(' ')}">
      <div class="heute-next3-head">
        <div class="heute-next3-day-name">${esc(day.weekday)}</div>
        <div class="heute-next3-day-date">${day.day}. ${esc(day.month)}</div>
      </div>
      <div class="heute-next3-items">${itemsHtml}</div>
    </div>`;
}

function renderHeuteNext3Item(it) {
  if (it.kind === 'einsatz') {
    const d = it.dep;
    const status = d.status || 'Geplant';
    const firma = d.company?.name || 'Einsatz';
    const titel = d.titel || d.service?.name || '';
    return `<button class="heute-next3-item is-einsatz dep-status-${esc(status.replace(/\s+/g,'-').toLowerCase())}" type="button" onclick="openDeploymentModal('edit','${esc(d.id)}')" title="${esc(firma + (titel ? ' · ' + titel : ''))}">
      <span class="heute-next3-item-tag">Einsatz</span>
      <span class="heute-next3-item-text">${esc(firma)}</span>
    </button>`;
  } else {
    const t = it.appt;
    const time = t.uhrzeit_von ? t.uhrzeit_von.substring(0, 5) : '';
    const titel = t.titel || 'Termin';
    const firma = t.company?.name || '';
    return `<button class="heute-next3-item is-termin" type="button" onclick="openAppointmentModal('edit','${esc(t.id)}')" title="${esc((time ? time + ' · ' : '') + titel + (firma ? ' · ' + firma : ''))}">
      ${time ? `<span class="heute-next3-item-time">${esc(time)}</span>` : '<span class="heute-next3-item-tag">Termin</span>'}
      <span class="heute-next3-item-text">${esc(firma || titel)}</span>
    </button>`;
  }
}

/** Vorschau-Akkordeon (standardmäßig zugeklappt) — die nächsten 3 Tage. */
function renderHeutePreviewAccordion(data) {
  // Wir reusen die schon existierenden previewAppointments / previewDeployments
  const apptCount = (data.previewAppointments || []).length;
  const depCount  = (data.previewDeployments  || []).length;
  if (apptCount + depCount === 0) {
    return `
      <details class="heute-preview-accordion">
        <summary class="heute-preview-summary">
          <span class="heute-preview-chevron">▸</span>
          <span class="heute-preview-label">Vorschau · die nächsten 3 Tage</span>
          <span class="heute-preview-count">— frei</span>
        </summary>
        <div class="heute-preview-body">
          <div style="font-size:13px;color:var(--muted);padding:8px 0;font-style:italic">Keine weiteren Termine oder Einsätze in diesem Zeitraum.</div>
        </div>
      </details>`;
  }
  // Render die existierende flache Liste innerhalb des <details>-Body
  const inner = renderBriefingPreview('heute', data); // gibt das bisherige .briefing-preview-Markup zurück
  return `
    <details class="heute-preview-accordion">
      <summary class="heute-preview-summary">
        <span class="heute-preview-chevron">▸</span>
        <span class="heute-preview-label">Vorschau · die nächsten 3 Tage</span>
        <span class="heute-preview-count">${apptCount} Termin${apptCount === 1 ? '' : 'e'} · ${depCount} Einsatz${depCount === 1 ? '' : 'e'} ab morgen</span>
      </summary>
      <div class="heute-preview-body">${inner}</div>
    </details>`;
}

/** v1.44: Hero-Block für einen heutigen Einsatz — prominent ganz oben.
 *  Begründung: Ein Einsatz ist die einzige direkt umsatzbringende Tätigkeit;
 *  an Einsatz-Tagen muss der Vor-Ort-Termin alles andere visuell schlagen.
 *  v1.44.6: pro Einsatz ein eigener Hero (mehrere Einsätze am selben Tag
 *  werden untereinander gestapelt — kein „+1 weiterer"-Kommentar mehr). */
function renderBriefingHeroDeployment(dep, data) {
  const techMap = data.todayDepTechniciansMap || {};
  const techs = techMap[dep.id] || [];
  const techText = techs.length > 0
    ? techs.map(t => esc(t.name || '—')).join(' · ')
    : 'Keine Techniker eingetragen';

  // Zeitraum
  const von = dep.datum_von;
  const bis = dep.datum_bis || dep.datum_von;
  const tage = Math.max(1, Math.round((new Date(bis) - new Date(von)) / 86400000) + 1);
  const zeitraumText = von === bis
    ? formatDateDE(von)
    : `${formatDateDE(von)} – ${formatDateDE(bis)}`;
  const tageSub = tage > 1 ? `${tage} Tage` : '1 Tag';

  // Tagessatz / Wert
  const einzelpreis = Number(dep.einzelpreis) || 0;
  const menge = Number(dep.menge) || 0;
  const wert = einzelpreis * menge;
  const tagessatzText = einzelpreis > 0
    ? `${formatPreis(einzelpreis)}${menge > 1 ? ` × ${menge}` : ''}`
    : '—';

  const status = dep.status || 'geplant';
  const statusClass = status === 'Durchgeführt' || status === 'Abgerechnet'
    ? 'is-done'
    : (status === 'In Arbeit' ? 'is-active' : 'is-planned');

  const titel = dep.titel || dep.service?.name || 'Einsatz';
  const firma = dep.company?.name || '—';
  const ort = (dep.ort || '').trim() || (dep.company?.name ? `bei ${dep.company.name}` : '—');

  // Status-Toggle-Button: bietet je nach Status den nächsten logischen Schritt an.
  // Geplant → Durchgeführt, Durchgeführt → Abgerechnet. Bei Abgerechnet kein
  // Schnellweg mehr (Korrektur muss bewusst über Vollbearbeitung laufen).
  let toggleBtn = '';
  if (status === 'Geplant' || (status !== 'Durchgeführt' && status !== 'Abgerechnet')) {
    toggleBtn = `<button class="briefing-btn" onclick="markDeploymentDone('${esc(dep.id)}')">Als durchgeführt markieren</button>`;
  } else if (status === 'Durchgeführt') {
    toggleBtn = `<button class="briefing-btn" onclick="markDeploymentBilled('${esc(dep.id)}')">Als abgerechnet markieren</button>`;
  }

  return `
    <div class="briefing-hero-deployment ${statusClass}">
      <div class="briefing-hero-stripe"></div>
      <div class="briefing-hero-head">
        <span class="briefing-hero-kicker">Vor-Ort-Tag · Heute</span>
        <span class="briefing-hero-status">${esc(status)}</span>
      </div>
      <div class="briefing-hero-firma">${esc(firma)}</div>
      <div class="briefing-hero-titel">${esc(titel)}</div>
      <div class="briefing-hero-stats">
        <div class="briefing-hero-stat">
          <div class="briefing-hero-stat-label">Zeitraum</div>
          <div class="briefing-hero-stat-value">${esc(zeitraumText)}</div>
          <div class="briefing-hero-stat-sub">${esc(tageSub)}</div>
        </div>
        <div class="briefing-hero-stat">
          <div class="briefing-hero-stat-label">Tagessatz</div>
          <div class="briefing-hero-stat-value">${esc(tagessatzText)}</div>
          ${wert > 0 ? `<div class="briefing-hero-stat-sub">Gesamt ${esc(formatPreis(wert))}</div>` : ''}
        </div>
        <div class="briefing-hero-stat">
          <div class="briefing-hero-stat-label">Standort</div>
          <div class="briefing-hero-stat-value">${esc(ort)}</div>
        </div>
        <div class="briefing-hero-stat">
          <div class="briefing-hero-stat-label">Team</div>
          <div class="briefing-hero-stat-value">${techText}</div>
        </div>
      </div>
      <div class="briefing-hero-actions">
        <button class="briefing-btn is-primary" onclick="openDeploymentModal('edit','${esc(dep.id)}')">Einsatz öffnen</button>
        ${toggleBtn}
        ${dep.company?.id ? `<button class="briefing-btn" onclick="navigateTo('firma','${esc(dep.company.id)}')">Firma öffnen</button>` : ''}
      </div>
    </div>`;
}

/** v1.44.9: Aufgaben-Sidebar im Heute-Tab. Zeigt überfällige (rot) zuerst,
 *  dann heute fällige, dann zukünftige offene. Kompakt, klickbar — Klick
 *  öffnet das Aufgabe-Bearbeiten-Modal direkt. */
function renderHeuteTasksAside(data) {
  const todayISO = toISODate(new Date());
  const overdue = data.overdueTasks || [];
  const todayTasks = (data.tasks || []).filter(t => t.faelligkeit === todayISO);
  // v1.44.14: keine harte Slice mehr — der Aside zeigt selbst max 8 + "weitere ansehen"-Link
  const futureTasks = (data.tasks || []).filter(t => t.faelligkeit && t.faelligkeit > todayISO);

  const sections = [];

  if (overdue.length > 0) {
    sections.push(`
      <div class="aside-section">
        <div class="aside-section-head is-danger">
          <span class="aside-section-title">Überfällig</span>
          <span class="aside-section-count">${overdue.length}</span>
        </div>
        ${overdue.slice(0, 8).map(t => renderAsideTaskRow(t, todayISO)).join('')}
        ${overdue.length > 8 ? `<button class="aside-section-more" onclick="navigateTo('tasks',{ scope:'mine_overdue' })">+ ${overdue.length - 8} weitere ansehen</button>` : ''}
      </div>`);
  }

  if (todayTasks.length > 0) {
    sections.push(`
      <div class="aside-section">
        <div class="aside-section-head">
          <span class="aside-section-title">Heute fällig</span>
          <span class="aside-section-count">${todayTasks.length}</span>
        </div>
        ${todayTasks.map(t => renderAsideTaskRow(t, todayISO)).join('')}
      </div>`);
  }

  if (futureTasks.length > 0) {
    sections.push(`
      <div class="aside-section">
        <div class="aside-section-head">
          <span class="aside-section-title">Demnächst</span>
          <span class="aside-section-count">${futureTasks.length}</span>
        </div>
        ${futureTasks.slice(0, 8).map(t => renderAsideTaskRow(t, todayISO)).join('')}
        ${futureTasks.length > 8 ? `<button class="aside-section-more" onclick="navigateTo('tasks',{ scope:'mine_open' })">+ ${futureTasks.length - 8} weitere ansehen</button>` : ''}
      </div>`);
  }

  if (sections.length === 0) {
    sections.push(`
      <div class="aside-section">
        <div class="aside-section-head">
          <span class="aside-section-title">Aufgaben</span>
        </div>
        <div class="aside-empty">Keine offenen Aufgaben — alles im Griff.</div>
      </div>`);
  }

  // v1.45.0: Datenpflege als blaue Insight-Pille in der Sidebar
  let dataInsightHtml = '';
  const ic = data.incompleteStats;
  if (ic && (ic.companies + ic.contacts) > 0) {
    const parts = [];
    if (ic.companies > 0) parts.push(`<strong>${ic.companies}</strong> ${ic.companies === 1 ? 'Firma' : 'Firmen'} ohne Adresse oder Kontaktdaten`);
    if (ic.contacts  > 0) parts.push(`<strong>${ic.contacts}</strong> Kontakt${ic.contacts === 1 ? '' : 'e'} ohne Telefon, E-Mail oder Position`);
    let actionBtn = '';
    if (ic.sampleCompanies && ic.sampleCompanies[0]) {
      actionBtn = `<button class="aside-insight-btn" onclick="navigateTo('firma','${esc(ic.sampleCompanies[0].id)}')">Erste Firma öffnen</button>`;
    } else if (ic.sampleContacts && ic.sampleContacts[0]) {
      actionBtn = `<button class="aside-insight-btn" onclick="navigateTo('kontakt','${esc(ic.sampleContacts[0].id)}')">Ersten Kontakt öffnen</button>`;
    }
    dataInsightHtml = `
      <div class="aside-insight">
        <div class="aside-insight-head">Datenpflege</div>
        <div class="aside-insight-body">${parts.join('. ')}.</div>
        <div class="aside-insight-actions">
          ${actionBtn}
          ${ic.companies > 0 ? `<button class="aside-insight-btn is-ghost" onclick="navigateTo('companies',{ incomplete: true })">Unvollständige Firmen</button>` : ''}
          ${ic.contacts  > 0 ? `<button class="aside-insight-btn is-ghost" onclick="navigateTo('contacts')">Alle Kontakte</button>` : ''}
        </div>
      </div>`;
  }

  return `
    <div class="aside-card">
      <div class="aside-card-title">Aufgaben</div>
      ${sections.join('')}
      <div class="aside-card-footer">
        <button class="aside-link" onclick="navigateTo('tasks',{ scope:'mine_open' })">Alle meine offenen ansehen →</button>
      </div>
    </div>
    ${dataInsightHtml}`;
}

/** Eine Zeile in der Aufgaben-Aside / Wochen-Liste. */
function renderAsideTaskRow(t, todayISO) {
  const ueberfaellig = t.faelligkeit && t.faelligkeit < todayISO;
  const heute = t.faelligkeit === todayISO;
  const datumLabel = t.faelligkeit
    ? (heute ? 'Heute' : (ueberfaellig ? `${Math.round((new Date(todayISO) - new Date(t.faelligkeit)) / 86400000)} Tage überfällig` : formatDateDE(t.faelligkeit)))
    : '—';
  const datumClass = ueberfaellig ? ' is-bad' : (heute ? ' is-warn' : '');
  const firma = t.company?.name ? ` · ${esc(t.company.name)}` : '';
  return `
    <button class="aside-task-row" onclick="openTaskModal('edit','${esc(t.id)}')">
      <div class="aside-task-titel">${esc(t.titel || '—')}</div>
      <div class="aside-task-meta">
        <span class="aside-task-date${datumClass}">${esc(datumLabel)}</span>${firma}
      </div>
    </button>`;
}

/** v1.44.9: Aufgaben-Box im Wochen-Tab — standardmäßig zugeklappt.
 *  Klick auf Toggle öffnet eine kompakte Liste der Wochen-Aufgaben +
 *  überfälligen. Damit die Wochen-Strip nicht überlagert wird. */
function renderWocheTasksCollapsed(data) {
  const todayISO = toISODate(new Date());
  const overdue = data.overdueTasks || [];
  const weekTasks = (data.tasks || []);
  const total = overdue.length + weekTasks.length;

  if (total === 0) return '';

  // Inhalt: überfällige zuerst (rot), dann Wochen-Tasks gruppiert nach Datum
  const inner = [];
  if (overdue.length > 0) {
    inner.push(`
      <div class="aside-section">
        <div class="aside-section-head is-danger">
          <span class="aside-section-title">Überfällig</span>
          <span class="aside-section-count">${overdue.length}</span>
        </div>
        ${overdue.map(t => renderAsideTaskRow(t, todayISO)).join('')}
      </div>`);
  }
  if (weekTasks.length > 0) {
    inner.push(`
      <div class="aside-section">
        <div class="aside-section-head">
          <span class="aside-section-title">Diese Woche fällig</span>
          <span class="aside-section-count">${weekTasks.length}</span>
        </div>
        ${weekTasks.map(t => renderAsideTaskRow(t, todayISO)).join('')}
      </div>`);
  }

  const summary = [
    weekTasks.length > 0 ? `${weekTasks.length} fällig` : null,
    overdue.length > 0 ? `<span class="kpi-inline-bad">${overdue.length} überfällig</span>` : null
  ].filter(Boolean).join(' · ');

  return `
    <details class="woche-tasks-box">
      <summary class="woche-tasks-summary">
        <span class="woche-tasks-chevron">▸</span>
        <span class="woche-tasks-label">Aufgaben diese Woche</span>
        <span class="woche-tasks-count">${summary}</span>
      </summary>
      <div class="woche-tasks-list">
        ${inner.join('')}
      </div>
    </details>`;
}

/** Hilfsaktion für den Hero: Status auf „Durchgeführt" setzen ohne Modal-Umweg.
 *  Triggert auch checkAndUpdateProjectStatus, falls der Einsatz zu einem
 *  Projekt gehört — sonst läuft der Auto-Status nicht synchron. */
async function markDeploymentDone(id) {
  if (!confirm('Einsatz als durchgeführt markieren?')) return;
  try {
    const { data: dep, error: selErr } = await db.from('deployments')
      .select('id, project_id, status').eq('id', id).single();
    if (selErr || !dep) throw new Error('Einsatz nicht gefunden.');
    if (dep.status === 'Durchgeführt' || dep.status === 'Abgerechnet') {
      showToast(`Einsatz ist bereits „${dep.status}".`, true); return;
    }
    const { error } = await db.from('deployments').update({ status: 'Durchgeführt' }).eq('id', id);
    if (error) throw error;
    showToast('Einsatz als „Durchgeführt" markiert.');
    if (dep.project_id) await checkAndUpdateProjectStatus(dep.project_id);
    if (typeof loadBriefing === 'function' && _currentBriefingTab) loadBriefing(_currentBriefingTab);
  } catch (e) {
    showToast('Fehler: ' + e.message, true);
  }
}

/** Hilfsaktion für den Hero: Status von „Durchgeführt" auf „Abgerechnet" setzen. */
async function markDeploymentBilled(id) {
  if (!confirm('Einsatz als abgerechnet markieren?')) return;
  try {
    const { data: dep, error: selErr } = await db.from('deployments')
      .select('id, project_id, status').eq('id', id).single();
    if (selErr || !dep) throw new Error('Einsatz nicht gefunden.');
    if (dep.status !== 'Durchgeführt') {
      showToast('Abrechnung nur aus Status „Durchgeführt" möglich.', true); return;
    }
    const { error } = await db.from('deployments').update({ status: 'Abgerechnet' }).eq('id', id);
    if (error) throw error;
    showToast('Einsatz als „Abgerechnet" markiert.');
    if (dep.project_id) await checkAndUpdateProjectStatus(dep.project_id);
    if (typeof loadBriefing === 'function' && _currentBriefingTab) loadBriefing(_currentBriefingTab);
  } catch (e) {
    showToast('Fehler: ' + e.message, true);
  }
}

// ── NARRATIV-LEISTE (regelbasiert mit Slot-Filling) ──
function renderBriefingNarrative(scope, data, greeting, firstName, initials) {
  const parts = [];
  const todayISO = toISODate(new Date());

  if (scope === 'heute') {
    // v1.45.0: Begrüßung referenziert nur Vor-Ort-Einsätze ≠ Abgerechnet
    const todayDeps = data.deployments.filter(d => d.datum_von <= todayISO && (d.datum_bis || d.datum_von) >= todayISO);
    const todayAppts = data.appointments.filter(a => a.datum === todayISO);
    const aktiveDeps = todayDeps.filter(d => d.status !== 'Abgerechnet' && d.status !== 'Storniert');
    if (aktiveDeps.length > 0) {
      const firma = aktiveDeps[0].company?.name || 'einem Kunden';
      parts.push(`Heute bist du im Einsatz bei <strong>${esc(firma)}</strong> — der Tag gehört dem Kunden`);
    } else if (todayDeps.length > 0) {
      parts.push(`Heute frei oder bereits abgerechnet`);
    } else if (todayAppts.length > 0) {
      parts.push(`<strong>${todayAppts.length}</strong> Termin${todayAppts.length === 1 ? '' : 'e'} heute`);
    } else {
      parts.push(`Heute keine festen Termine — guter Slot für Akquise oder Aufholarbeit`);
    }
    if (data.overdueTasks.length > 0) {
      parts.push(`dazu <span class="accent-hot">${data.overdueTasks.length} überfällige Aufgabe${data.overdueTasks.length === 1 ? '' : 'n'}</span>`);
    }
    if (data.oldOpenTasks.length >= 3) {
      parts.push(`und <span class="accent-warn">${data.oldOpenTasks.length} alte Tasks</span>, die schon &gt; 14 Tage offen sind`);
    }
  } else if (scope === 'woche') {
    parts.push(`Diese Woche: <strong>${data.appointments.length}</strong> Termine, <strong>${data.deployments.length}</strong> Einsätze`);
    if (data.overdueTasks.length > 0) {
      parts.push(`<span class="accent-hot">${data.overdueTasks.length} überfällig</span>`);
    }
    if (data.tasks.length > 0) {
      parts.push(`<strong>${data.tasks.length}</strong> Aufgabe${data.tasks.length === 1 ? '' : 'n'} fällig`);
    }
  } else {
    // Monat
    const umsatzMonat = data.deployments
      .filter(d => d.status === 'Durchgeführt' || d.status === 'Abgerechnet')
      .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
    parts.push(`Diesen Monat: <strong>${data.appointments.length}</strong> Termine, <strong>${data.deployments.length}</strong> Einsätze`);
    if (umsatzMonat > 0) {
      parts.push(`<span class="accent-good">${esc(formatPreis(umsatzMonat))}</span> aus durchgeführten/abgerechneten Einsätzen`);
    }
    if (data.overdueTasks.length > 0) {
      parts.push(`<span class="accent-hot">${data.overdueTasks.length} überfällige Aufgabe${data.overdueTasks.length === 1 ? '' : 'n'}</span>`);
    }
  }

  const text = parts.join(', ') + '.';
  return `
    <div class="briefing-narrative">
      <div class="briefing-narrative-avatar">${esc(initials)}</div>
      <div class="briefing-narrative-body">
        <div class="briefing-narrative-greeting">${esc(greeting)}${firstName ? ', ' + esc(firstName) : ''}</div>
        <div class="briefing-narrative-text">${text}</div>
      </div>
    </div>`;
}

// ── KPI-LEISTE ──
function renderBriefingKpis(scope, data, opts = {}) {
  const todayISO = toISODate(new Date());
  // Anzahl-Werte je nach Scope
  let label1 = 'Termine', val1 = data.appointments.length;
  let label2 = 'Einsätze', val2 = data.deployments.length;
  let label3 = 'Aufgaben', val3 = data.tasks.length;
  let label4 = 'Überfällig', val4 = data.overdueTasks.length;
  if (scope === 'monat') {
    const umsatz = data.deployments
      .filter(d => d.status === 'Durchgeführt' || d.status === 'Abgerechnet')
      .reduce((s, d) => s + (Number(d.menge) || 0) * (Number(d.einzelpreis) || 0), 0);
    label4 = 'Umsatz';
    val4 = formatPreis(umsatz);
  }

  const tasksClass = val3 > 0 ? 'is-warn' : '';
  const overdueClass = scope !== 'monat' && val4 > 0 ? 'is-danger' : '';
  const compactClass = opts.compact ? ' is-compact' : '';
  return `
    <div class="briefing-kpis${compactClass}">
      <div class="briefing-kpi">
        <div class="briefing-kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        </div>
        <div class="briefing-kpi-body">
          <div class="briefing-kpi-label">${esc(label1)}</div>
          <div class="briefing-kpi-value">${val1}</div>
        </div>
      </div>
      <div class="briefing-kpi">
        <div class="briefing-kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7l9 6 9-6M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M3 7l2-2h14l2 2"/></svg>
        </div>
        <div class="briefing-kpi-body">
          <div class="briefing-kpi-label">${esc(label2)}</div>
          <div class="briefing-kpi-value">${val2}</div>
        </div>
      </div>
      <div class="briefing-kpi ${tasksClass}">
        <div class="briefing-kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
        </div>
        <div class="briefing-kpi-body">
          <div class="briefing-kpi-label">${esc(label3)}</div>
          <div class="briefing-kpi-value">${val3}</div>
        </div>
      </div>
      <div class="briefing-kpi ${overdueClass}">
        <div class="briefing-kpi-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        </div>
        <div class="briefing-kpi-body">
          <div class="briefing-kpi-label">${esc(label4)}</div>
          <div class="briefing-kpi-value">${esc(String(val4))}</div>
        </div>
      </div>
    </div>`;
}

// ── BRIEFING-CARDS (Hot/Opp/Gap/Good — regelbasierte Erzeugung) ──
function renderBriefingCards(scope, data, opts = {}) {
  const cards = [];
  const todayISO = toISODate(new Date());
  const onlyHot = !!opts.onlyHot;

  // ── HOT — überfällige Aufgaben ──
  // v1.44.9: heroMode nutzt eine Aufgaben-Aside, da darf hier nicht doppelt gerendert werden.
  if (data.overdueTasks.length > 0 && !opts.skipHot) {
    const oldest = data.overdueTasks[0];
    const daysOverdue = Math.round((new Date(todayISO) - new Date(oldest.faelligkeit)) / 86400000);
    const restCount = data.overdueTasks.length - 1;
    const firmaText = oldest.company?.name ? ` bei <strong>${esc(oldest.company.name)}</strong>` : '';
    const restText = restCount > 0 ? `<br><em>+ ${restCount} weitere überfällige Aufgabe${restCount === 1 ? '' : 'n'} </em>` : '';
    cards.push(`
      <div class="briefing-card tone-hot">
        <div class="briefing-card-stripe"></div>
        <div class="briefing-card-head">
          <span class="briefing-kicker">Dringend</span>
          <span class="briefing-card-since">Seit ${daysOverdue} Tag${daysOverdue === 1 ? '' : 'en'} überfällig</span>
        </div>
        <div class="briefing-card-headline">${esc(oldest.titel || '—')}${firmaText} wartet auf dich.</div>
        <div class="briefing-card-body">
          Die Aufgabe sollte am <strong>${esc(formatDateDE(oldest.faelligkeit))}</strong> erledigt sein.${restText}
        </div>
        <div class="briefing-actions">
          <button class="briefing-btn is-primary" onclick="openTaskModal('edit','${esc(oldest.id)}')">Aufgabe öffnen</button>
          <button class="briefing-btn" onclick="navigateTo('tasks',{ scope:'mine_overdue' })">Alle überfälligen ansehen</button>
        </div>
      </div>`);
  }

  // onlyHot-Modus: nur die Hot-Card (überfällige Aufgaben), Rest skippen.
  // Wird von „Diese Woche" genutzt, wo die Wochen-Strip die Hauptansicht ist.
  if (onlyHot) return cards.join('');

  // ── OPP — Heute Vor-Ort + Termine ohne Folgeschritt ──
  // v1.44: Wenn der Hero-Modus den Einsatz schon prominent zeigt, hier nicht
  // doppeln — sonst steht der gleiche Einsatz zweimal auf der Seite.
  if (scope === 'heute' && !opts.skipTodayDeployment) {
    const todayDeps = data.deployments.filter(d => d.datum_von <= todayISO && (d.datum_bis || d.datum_von) >= todayISO);
    if (todayDeps.length > 0) {
      const dep = todayDeps[0];
      const wert = (Number(dep.menge) || 0) * (Number(dep.einzelpreis) || 0);
      cards.push(`
        <div class="briefing-card tone-opp">
          <div class="briefing-card-stripe"></div>
          <div class="briefing-card-head">
            <span class="briefing-kicker">Chance</span>
            <span class="briefing-card-since">Heute vor Ort</span>
          </div>
          <div class="briefing-card-headline">Vor-Ort-Tag bei ${esc(dep.company?.name || '—')} — nutze den Tag.</div>
          <div class="briefing-card-body">
            ${esc(dep.service?.name || dep.titel || 'Einsatz')}${wert > 0 ? `, Tagessatz <strong>${esc(formatPreis(wert))}</strong>` : ''}.
            ${dep.ort ? `Standort: ${esc(dep.ort)}.` : ''}
          </div>
          <div class="briefing-actions">
            <button class="briefing-btn is-primary" onclick="openDeploymentModal('edit','${esc(dep.id)}')">Einsatz öffnen</button>
          </div>
        </div>`);
    }
  }
  // Termine ohne gekoppelten Einsatz UND ohne Folgetermin → Opportunity-Hinweis (vereinfacht)
  if (scope !== 'heute') {
    const wertvolleTermine = data.appointments.filter(a => a.status === 'durchgefuehrt' && !a.deployment_id);
    if (wertvolleTermine.length > 0) {
      const t = wertvolleTermine[0];
      cards.push(`
        <div class="briefing-card tone-opp">
          <div class="briefing-card-stripe"></div>
          <div class="briefing-card-head">
            <span class="briefing-kicker">Chance</span>
            <span class="briefing-card-since">${esc(formatDateDE(t.datum))}</span>
          </div>
          <div class="briefing-card-headline">${esc(t.titel || 'Termin')} ohne Folgeschritt.</div>
          <div class="briefing-card-body">
            Termin durchgeführt${t.company?.name ? ` bei <strong>${esc(t.company.name)}</strong>` : ''}, aber bisher kein Einsatz oder Folgetermin angelegt.
            ${wertvolleTermine.length > 1 ? `<em>+ ${wertvolleTermine.length - 1} weitere ohne Folgeschritt.</em>` : ''}
          </div>
          <div class="briefing-actions">
            <button class="briefing-btn is-primary" onclick="openAppointmentModal('edit','${esc(t.id)}')">Termin öffnen</button>
          </div>
        </div>`);
    }
  }

  // ── GAP — Lückenfinder ──
  // Tage seit letztem angelegten Termin
  if (data.lastCreatedAppt) {
    const daysSince = Math.round((new Date(todayISO) - new Date(data.lastCreatedAppt.created_at.substring(0,10))) / 86400000);
    if (daysSince >= 5) {
      cards.push(`
        <div class="briefing-card tone-gap">
          <div class="briefing-card-stripe"></div>
          <div class="briefing-card-head">
            <span class="briefing-kicker">Lücke</span>
            <span class="briefing-card-since">${daysSince} Tage</span>
          </div>
          <div class="briefing-card-headline">${daysSince} Tage kein neuer Termin angelegt.</div>
          <div class="briefing-card-body">
            Die Akquise-Pipeline läuft langsamer als üblich. Letzter angelegter Termin: <strong>${esc(formatDateDE(data.lastCreatedAppt.datum || data.lastCreatedAppt.created_at.substring(0,10)))}</strong>.
          </div>
          <div class="briefing-actions">
            <button class="briefing-btn is-primary" onclick="openAppointmentModal('new')">Termin anlegen</button>
          </div>
        </div>`);
    }
  }
  // Alte offene Aufgaben (>14 Tage)
  if (data.oldOpenTasks.length >= 3) {
    cards.push(`
      <div class="briefing-card tone-gap">
        <div class="briefing-card-stripe"></div>
        <div class="briefing-card-head">
          <span class="briefing-kicker">Lücke</span>
          <span class="briefing-card-since">Älter als 14 Tage</span>
        </div>
        <div class="briefing-card-headline">${data.oldOpenTasks.length} Aufgaben hängen länger als 2 Wochen.</div>
        <div class="briefing-card-body">
          Aufgaben, die so lange offen sind, werden meist nicht mehr erledigt. Entscheide: erledigen, neu planen, oder löschen.
        </div>
        <div class="briefing-actions">
          <button class="briefing-btn is-primary" onclick="navigateTo('tasks',{ scope:'mine_open' })">Aufgaben durchgehen</button>
        </div>
      </div>`);
  }

  // ── DATENPFLEGE — unvollständige Firmen/Kontakte (v1.43.0) ──
  if (data.incompleteStats && (data.incompleteStats.companies + data.incompleteStats.contacts) > 0) {
    const ic = data.incompleteStats;
    const parts = [];
    if (ic.companies > 0) parts.push(`<strong>${ic.companies}</strong> ${ic.companies === 1 ? 'Firma' : 'Firmen'} ohne Adresse oder Kontaktdaten`);
    if (ic.contacts  > 0) parts.push(`<strong>${ic.contacts}</strong> Kontakt${ic.contacts === 1 ? 'e' : 'e'} ohne Telefon, E-Mail oder Position`);
    const oldestSample = (ic.sampleCompanies?.[0] || ic.sampleContacts?.[0]);
    let actionBtn = '';
    if (ic.sampleCompanies && ic.sampleCompanies[0]) {
      actionBtn = `<button class="briefing-btn is-primary" onclick="navigateTo('firma','${esc(ic.sampleCompanies[0].id)}')">Erste Firma öffnen</button>`;
    } else if (ic.sampleContacts && ic.sampleContacts[0]) {
      actionBtn = `<button class="briefing-btn is-primary" onclick="navigateTo('kontakt','${esc(ic.sampleContacts[0].id)}')">Ersten Kontakt öffnen</button>`;
    }
    cards.push(`
      <div class="briefing-card tone-gap">
        <div class="briefing-card-stripe"></div>
        <div class="briefing-card-head">
          <span class="briefing-kicker">Datenpflege</span>
          <span class="briefing-card-since">Schnell-Anlagen ergänzen</span>
        </div>
        <div class="briefing-card-headline">${ic.companies + ic.contacts} Datensätze sind nur halb ausgefüllt.</div>
        <div class="briefing-card-body">
          ${parts.join(', ')}. ${oldestSample ? `Ältester offener: <em>${esc(oldestSample.name || (oldestSample.vorname + ' ' + oldestSample.nachname))}</em>.` : ''}
        </div>
        <div class="briefing-actions">
          ${actionBtn}
          ${ic.companies > 0 ? `<button class="briefing-btn" onclick="navigateTo('companies')">Alle Firmen</button>` : ''}
          ${ic.contacts  > 0 ? `<button class="briefing-btn" onclick="navigateTo('contacts')">Alle Kontakte</button>` : ''}
        </div>
      </div>`);
  }

  // ── GOOD — was gut läuft (compact) ──
  const goodParts = [];
  if (data.weekDoneAppts.length > 0) {
    goodParts.push(`<strong>${data.weekDoneAppts.length}</strong> Termine durchgeführt diese Woche`);
  }
  if (data.weekDoneDeps.length > 0) {
    goodParts.push(`<strong>${data.weekDoneDeps.length}</strong> Einsätze`);
  }
  if (scope !== 'heute' && data.tasks.length === 0 && data.overdueTasks.length === 0) {
    goodParts.push(`keine offenen Aufgaben in diesem Zeitraum`);
  }
  if (goodParts.length > 0) {
    cards.push(`
      <div class="briefing-card tone-good is-compact">
        <div class="briefing-card-stripe"></div>
        <div class="briefing-card-body">
          <strong>Was gut läuft:</strong> ${goodParts.join(' · ')}.
        </div>
      </div>`);
  }

  if (cards.length === 0) {
    return `
      <div class="briefing-card tone-good is-compact">
        <div class="briefing-card-stripe"></div>
        <div class="briefing-card-body">
          <strong>Alles im Griff.</strong> Keine dringenden Punkte, keine kritischen Lücken — der Tag ist deins.
        </div>
      </div>`;
  }
  return cards.join('');
}

// ── STREAK-BAR (Aufgaben-Erledigungs-Streak) ──
function renderBriefingStreak(scope, data) {
  // Heuristik: Wenn keine überfälligen Aufgaben offen → Streak aktiv
  if (data.overdueTasks.length > 0) return '';
  const totalDone = data.weekDoneAppts.length + data.weekDoneDeps.length;
  if (totalDone === 0) return '';
  return `
    <div class="briefing-streak">
      <div class="briefing-streak-dot"></div>
      <div>
        <strong>Keine überfälligen Aufgaben.</strong> ${totalDone} Aktivität${totalDone === 1 ? '' : 'en'} in der Woche durchgeführt — sauberer Stand.
      </div>
    </div>`;
}

// ── VORSCHAU (nächste 3 Werktage / Wochen) ──
async function renderBriefingPreviewAsync(scope, userId) {
  // Lädt für Heute/Woche die nächsten 3 Werktage; für Monat die nächsten 4 Wochen.
  // Wird derzeit synchron via separater Logik in renderBriefingPreview aufgerufen — Stub.
}

function renderBriefingPreview(scope, data) {
  // v1.44.1: Vorschau nur im Heute-Scope (Woche/Monat haben eigene Tabs) und
  // nur die nächsten 3 Kalendertage. Daten kommen aus separaten Queries
  // (siehe loadBriefingData), weil der Heute-Scope sonst nur heute lädt.
  // v1.44.3: pro Tag werden jetzt die einzelnen Termine/Einsätze mit Titel,
  // Firma und Ort gelistet — nicht mehr nur die Anzahl.
  if (scope !== 'heute') return '';

  const todayISO = toISODate(new Date());
  const days = {};
  for (let i = 1; i <= 3; i++) {
    const d = new Date(todayISO); d.setDate(d.getDate() + i);
    days[toISODate(d)] = { items: [] };
  }

  (data.previewAppointments || []).forEach(a => {
    if (!days[a.datum]) return;
    const ortFirma = [a.company?.name, a.ort].filter(Boolean).join(' · ');
    days[a.datum].items.push({
      kind: 'termin',
      titel: a.titel || 'Termin',
      sub: ortFirma,
      time: a.uhrzeit_von || ''
    });
  });
  (data.previewDeployments || []).forEach(d => {
    Object.keys(days).forEach(iso => {
      const von = d.datum_von, bis = d.datum_bis || d.datum_von;
      if (iso >= von && iso <= bis) {
        const ortFirma = [d.company?.name, d.ort].filter(Boolean).join(' · ');
        days[iso].items.push({
          kind: 'einsatz',
          titel: d.titel || d.service?.name || 'Einsatz',
          sub: ortFirma,
          time: ''
        });
      }
    });
  });

  // Pro Tag: Einsätze immer zuerst (umsatzrelevant), dann Termine nach Uhrzeit
  Object.values(days).forEach(d => {
    d.items.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'einsatz' ? -1 : 1;
      return (a.time || '').localeCompare(b.time || '');
    });
  });

  const dates = Object.keys(days).sort();
  const rowsHtml = dates.map(iso => {
    const dt = new Date(iso);
    const day = WEEKDAYS_DE[dt.getDay()];
    const sub = `${dt.getDate()}. ${MONTHS_DE[dt.getMonth()]}`;
    const items = days[iso].items;

    let bodyHtml;
    if (items.length === 0) {
      bodyHtml = `<div class="briefing-preview-empty">— frei</div>`;
    } else {
      bodyHtml = items.map(it => `
        <div class="briefing-preview-item">
          <span class="briefing-preview-kind is-${it.kind}">${it.kind === 'termin' ? 'Termin' : 'Einsatz'}</span>
          <div class="briefing-preview-item-body">
            <div class="briefing-preview-item-titel">${it.time ? `<span class="briefing-preview-time">${esc(it.time.substring(0,5))}</span> ` : ''}${esc(it.titel)}</div>
            ${it.sub ? `<div class="briefing-preview-item-sub">${esc(it.sub)}</div>` : ''}
          </div>
        </div>`).join('');
    }

    return `
      <div class="briefing-preview-row">
        <div class="briefing-preview-day-col">
          <div class="briefing-preview-day">${esc(day)}</div>
          <div class="briefing-preview-day-sub">${esc(sub)}</div>
        </div>
        <div class="briefing-preview-items">${bodyHtml}</div>
      </div>`;
  }).join('');
  return `
    <div class="briefing-preview">
      <div class="briefing-preview-title">Vorschau · die nächsten 3 Tage</div>
      ${rowsHtml}
    </div>`;
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
  } else if (scopeFilter === 'mine_overdue') {
    const todayISO = toISODate(new Date());
    filtered = filtered.filter(t =>
      t.assigned_to === meId &&
      t.status !== 'erledigt' &&
      t.faelligkeit && t.faelligkeit < todayISO
    );
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

async function renderTasksTable(tasks) {
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

  // v1.40: Map task_id → appointment_id für das Kalender-Icon in der Zeile
  const linkedMap = await loadLinkedAppointmentMap(tasks.map(t => t.id));
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

    const calIcon = linkedMap.has(t.id) ? ROW_CAL_ICON : '';
    return `
      <tr data-task-id="${esc(t.id)}" data-company-id="${esc(t.company_id || '')}" data-contact-id="${esc(t.contact_id || '')}" data-project-id="${esc(t.project_id || '')}">
        <td><input type="checkbox" ${done ? 'checked' : ''} onclick="event.stopPropagation();toggleTaskDone('${esc(t.id)}', this.checked)" aria-label="Als erledigt markieren"></td>
        <td><div class="cell-link" style="${titelStyle}" onclick="toggleRowExpand('task','${esc(t.id)}',this.closest('tr'))">${esc(t.titel || '—')}${calIcon}</div></td>
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

  // v1.44.11: a-company ist eine Combobox
  fillCompanyCombobox('a-company', 'a-company-list');

  // Defaults
  document.getElementById('a-titel').value = '';
  document.getElementById('a-faelligkeit').value = '';
  document.getElementById('a-beschreibung').value = '';
  document.getElementById('a-notizen').value = '';
  document.getElementById('a-create-appointment').checked = false;  // v1.40
  statusSelect.value = 'offen';
  if (currentProfile?.id) assigneeSelect.value = currentProfile.id;
  setCompanyComboboxValue('a-company', 'a-company-list', '');

  await rebuildContactDropdownForTask('');
  await rebuildProjectDropdownForTask('');

  if (mode === 'new') {
    document.getElementById('modal-aufgabe-title').textContent = 'Neue Aufgabe';
    document.getElementById('a-save-btn').textContent = 'Anlegen';
    document.getElementById('a-delete-btn').style.display = 'none';

    // Prefill aus Firmen-Detailseite
    if (taskModalPrefillCompanyId) {
      setCompanyComboboxValue('a-company', 'a-company-list', taskModalPrefillCompanyId);
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
          setCompanyComboboxValue('a-company', 'a-company-list', proj.company_id);
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
          setCompanyComboboxValue('a-company', 'a-company-list', k.company_id);
          await rebuildContactDropdownForTask(k.company_id);
          await rebuildProjectDropdownForTask(k.company_id);
        }
        setContactComboboxValue('a-contact', 'a-contact-list', k.id);
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
      setCompanyComboboxValue('a-company', 'a-company-list', data.company_id);
      await rebuildContactDropdownForTask(data.company_id);
      await rebuildProjectDropdownForTask(data.company_id);
      if (data.contact_id) setContactComboboxValue('a-contact', 'a-contact-list', data.contact_id);
    } else {
      await rebuildProjectDropdownForTask('');
    }
    if (data.project_id) {
      const projSel = document.getElementById('a-project');
      if (projSel) projSel.value = data.project_id;
    }

    // v1.40: Checkbox-Stand aus existierendem gekoppelten Termin
    const { data: linkedAppt } = await db.from('appointments')
      .select('id').is('deleted_at', null).eq('task_id', editingTaskId).limit(1);
    if (linkedAppt && linkedAppt.length > 0) {
      document.getElementById('a-create-appointment').checked = true;
    }
  }

  // Firma-Combobox-Input — bei Match Kontakt/Projekt nachladen (v1.44.11)
  document.getElementById('a-company').oninput = async () => {
    const id = getCompanyComboboxId('a-company', 'a-company-list');
    await rebuildContactDropdownForTask(id);
    await rebuildProjectDropdownForTask(id);
  };

  setupTaskPreviewListeners();  // v1.38
  renderTaskPreview();           // v1.38

  await populateTemplateDropdown('aufgabe', mode);
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
  await fillContactCombobox('a-contact', 'a-contact-list', companyId);
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
  const project_id   = document.getElementById('a-project')?.value || null;
  const notizen      = document.getElementById('a-notizen').value.trim();
  const createAppt   = document.getElementById('a-create-appointment').checked;  // v1.40
  const btn          = document.getElementById('a-save-btn');

  if (!titel) { showToast('Bitte Titel eingeben.', true); return; }
  if (!assigned_to) { showToast('Bitte eine Person zuweisen.', true); return; }
  const gueltigeStatus = aufgabeStatusCache.map(s => s.wert);
  if (gueltigeStatus.length && !gueltigeStatus.includes(status)) { showToast('Status ungültig.', true); return; }
  if (createAppt && !faelligkeit) {
    showToast('Für die Termin-Kopplung muss ein Fälligkeitsdatum gesetzt sein.', true);
    return;
  }

  btn.disabled = true;
  btn.textContent = editingTaskId ? 'Wird gespeichert ...' : 'Wird angelegt ...';

  try {
    // v1.44.11: Firma-Combobox auflösen — legt ggf. eine neue Firma an
    let company_id = null;
    try {
      company_id = await resolveCompanyComboboxValue('a-company', 'a-company-list');
    } catch (e) {
      btn.disabled = false; btn.textContent = editingTaskId ? 'Speichern' : 'Anlegen';
      return;
    }
    // Kontakt-Combobox auflösen — legt ggf. einen neuen Kontakt an
    let contact_id = null;
    try {
      contact_id = await resolveContactComboboxValue('a-contact', 'a-contact-list', company_id);
    } catch (e) {
      btn.disabled = false; btn.textContent = editingTaskId ? 'Speichern' : 'Anlegen';
      return;
    }

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

    let savedTaskId = editingTaskId;
    if (editingTaskId) {
      const { error } = await db.from('tasks').update(payload).eq('id', editingTaskId);
      if (error) throw new Error(error.message);
    } else {
      const { data: ins, error } = await db.from('tasks').insert(payload).select('id').single();
      if (error) throw new Error(error.message);
      savedTaskId = ins?.id;
    }

    // v1.40 — Termin synchronisieren (anlegen/aktualisieren/löschen)
    if (savedTaskId) {
      await syncTaskAppointment(savedTaskId, { ...payload, id: savedTaskId }, createAppt);
    }

    closeTaskModal();
    showToast(editingTaskId ? 'Aufgabe aktualisiert.' : 'Aufgabe angelegt.');
    await _refreshTaskContext();
    refreshCalendarBar();   // v1.40 — Termin könnte neu sichtbar sein
    updateTaskBadge();
  } catch (e) {
    showToast(e.message, true);
  } finally {
    btn.disabled = false;
    btn.textContent = editingTaskId ? 'Speichern' : 'Anlegen';
  }
}

/** Synchronisiert einen Termin zur Aufgabe basierend auf Checkbox-Status (v1.40).
 *  Analog zur Termin-Einsatz-Kopplung (siehe syncDeploymentAppointment, §8.4):
 *  - Checkbox an  + kein Termin           → Termin anlegen
 *  - Checkbox an  + Termin existiert      → Termin aktualisieren
 *  - Checkbox aus + Termin existiert      → Termin soft-löschen
 *  - Aufgabe ohne Fälligkeit              → bereits oben blockiert
 *  Aufgabe-Status `erledigt` wird auf Termin-Status `durchgefuehrt` gemappt.
 *  v1.40.1: Wirft jetzt explizit Errors, damit Migration-/Schema-Probleme sichtbar werden. */
async function syncTaskAppointment(taskId, taskData, shouldExist) {
  const { data: existing, error: selErr } = await db.from('appointments')
    .select('id').is('deleted_at', null).eq('task_id', taskId).limit(1);
  if (selErr) {
    if (/task_id/i.test(selErr.message || '')) {
      throw new Error('Termin-Kopplung nicht möglich: Migration v1.40.0 noch nicht in Supabase ausgeführt (Spalte appointments.task_id fehlt).');
    }
    throw new Error('Termin-Lookup fehlgeschlagen: ' + selErr.message);
  }
  const existingId = existing && existing.length > 0 ? existing[0].id : null;

  if (!shouldExist) {
    if (existingId) {
      const { error } = await db.from('appointments').update({ deleted_at: new Date().toISOString() }).eq('id', existingId);
      if (error) throw new Error('Termin-Löschung fehlgeschlagen: ' + error.message);
    }
    return;
  }

  // Default-Termin-Typ: erster aktiver aus dem Cache
  if (terminTypenCache.length === 0) await loadTerminTypen();
  const defaultTypId = terminTypenCache[0]?.id || null;
  if (!defaultTypId) {
    throw new Error('Kein Termin-Typ verfügbar — Termin-Kopplung nicht möglich. Bitte unter Stammdaten einen Termin-Typ anlegen.');
  }

  const apptStatus = taskData.status === 'erledigt' ? 'durchgefuehrt' : 'geplant';
  const apptPayload = {
    titel:       taskData.titel,
    datum:       taskData.faelligkeit,
    uhrzeit_von: '08:00',
    uhrzeit_bis: '16:00',
    typ_id:      defaultTypId,
    status:      apptStatus,
    company_id:  taskData.company_id,
    contact_id:  taskData.contact_id,
    project_id:  taskData.project_id,
    notizen:     taskData.beschreibung || null,
    task_id:     taskId
  };

  let error;
  if (existingId) {
    ({ error } = await db.from('appointments').update(apptPayload).eq('id', existingId));
  } else {
    apptPayload.erstellt_von = currentProfile?.id || null;
    ({ error } = await db.from('appointments').insert(apptPayload));
  }
  if (error) {
    if (/task_id/i.test(error.message || '')) {
      throw new Error('Termin-Kopplung nicht möglich: Migration v1.40.0 noch nicht in Supabase ausgeführt (Spalte appointments.task_id fehlt).');
    }
    throw new Error('Termin-Sync fehlgeschlagen: ' + error.message);
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

    // v1.40: gekoppelten Termin (falls vorhanden) ebenfalls soft-löschen
    await db.from('appointments').update({ deleted_at: deletedAt }).eq('task_id', id).is('deleted_at', null);

    closeTaskModal();
    await _refreshTaskContext();
    refreshCalendarBar();   // v1.40
    updateTaskBadge();

    showToast('Aufgabe gelöscht.', false, {
      actionLabel: 'Rückgängig',
      durationMs: 5000,
      onAction: async () => {
        try {
          await db.from('tasks').update({ deleted_at: null }).eq('id', id);
          // v1.40: gekoppelten Termin ebenfalls wiederherstellen
          await db.from('appointments').update({ deleted_at: null }).eq('task_id', id).eq('deleted_at', deletedAt);
          await _refreshTaskContext();
          refreshCalendarBar();
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
  await renderDetailTaskRows(tbody, countEl, data || [], 'company');
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
  await renderDetailTaskRows(tbody, countEl, data || [], 'contact');
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
  await renderDetailTaskRows(tbody, countEl, data || [], 'project');
}

async function renderDetailTaskRows(tbody, countEl, tasks, entityType) {
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

  // v1.40: Map task_id → appointment_id für Kalender-Icon
  const visibleTasks = tasks.slice(0, 10);
  const linkedMap = await loadLinkedAppointmentMap(visibleTasks.map(t => t.id));

  tbody.innerHTML = visibleTasks.map(t => {
    const done = t.status === 'erledigt';
    const overdue = isTaskOverdue(t, todayISO);
    const assigneeName = t.assigned ? (t.assigned.name || t.assigned.email || '?') : '—';
    const fael = t.faelligkeit
      ? `<span ${overdue ? 'style="color:#dc2626;font-weight:600"' : ''}>${esc(formatDateDE(t.faelligkeit))}</span>`
      : '<span style="color:var(--muted)">—</span>';
    const titelStyle = done ? 'text-decoration:line-through;color:var(--muted)' : '';
    const calIcon = linkedMap.has(t.id) ? ROW_CAL_ICON : '';

    return `
      <tr data-task-id="${esc(t.id)}" data-company-id="${esc(t.company_id || '')}" data-contact-id="${esc(t.contact_id || '')}" data-project-id="${esc(t.project_id || '')}">
        <td><input type="checkbox" ${done ? 'checked' : ''} onclick="event.stopPropagation();toggleTaskDone('${esc(t.id)}', this.checked)" aria-label="Als erledigt markieren"></td>
        <td><div class="cell-link" style="${titelStyle}" onclick="toggleRowExpand('task','${esc(t.id)}',this.closest('tr'))">${esc(t.titel || '—')}${calIcon}</div></td>
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
  invalidateExpandedDetailCache();  // v1.38.1
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
  // v1.45.3: präziser Tooltip — dokumentiert die Badge-Logik. Zahl im Badge =
  // alle dem User zugewiesenen Aufgaben mit Status ≠ erledigt (überfällige
  // zählen also mit). Tooltip splittet das auf, damit der Wert mit dem
  // Heute-Header („heute fällig (X überfällig)") konsistent interpretierbar ist.
  const title = ueberfaellig > 0
    ? `${offen} ${offen === 1 ? 'Aufgabe' : 'Aufgaben'} offen, davon ${ueberfaellig} überfällig`
    : `${offen} ${offen === 1 ? 'Aufgabe' : 'Aufgaben'} offen`;
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
