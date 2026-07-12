# BonzoCare 0.2.1 – Care & Grooming

Eine kleine installierbare Web-App für Bonzos Gesundheits- und Futterakte.

## Enthalten

- Tageserfassung für Gewicht, Temperatur, Futter, Appetit, Stuhlgang, Wasser, Stimmung, Aktivität, Erbrechen, Medikamente und Notizen
- Verlauf mit Suche und Zeitfilter
- Gewichts- und Futterdiagramme
- lokale Speicherung im Browser
- JSON-Sicherung und Wiederherstellung
- CSV-Export
- Druckansicht / PDF über die Druckfunktion
- Offline-Unterstützung nach dem ersten Öffnen

## Lokal testen

Die Dateien sollten über einen kleinen Webserver geöffnet werden, nicht direkt per Doppelklick.

Mit Python:

```bash
cd bonzo-care
python3 -m http.server 8000
```

Dann im Browser öffnen:

http://localhost:8000

## Kostenlos veröffentlichen

Am einfachsten über GitHub Pages:

1. Kostenloses GitHub-Konto erstellen.
2. Neues Repository anlegen, z. B. `bonzocare`.
3. Alle Dateien aus diesem Ordner hochladen.
4. Unter **Settings → Pages** bei **Branch** `main` und `/root` auswählen.
5. GitHub zeigt anschließend die öffentliche Adresse an.

## Auf dem iPhone installieren

1. Die veröffentlichte Adresse in **Safari** öffnen.
2. Auf **Teilen** tippen.
3. **Zum Home-Bildschirm** auswählen.
4. BonzoCare startet danach wie eine eigene App.

## Datenschutz

Alle Einträge liegen standardmäßig ausschließlich im lokalen Speicher des jeweiligen Browsers. Regelmäßig über **Mehr → Sicherung exportieren** eine JSON-Sicherung erstellen.


## Änderungen in Version 0.1.1

- neues BonzoCare-App-Icon
- Darstellungsfehler beim Geburtsdatum auf iPhones behoben
- Feld „Futtersorte“ ergänzt
- Feld „Futter-Notiz“ ergänzt
- Futtersorte und Futter-Notiz erscheinen im Verlauf und im CSV-Export
- Offline-Cache aktualisiert


## Neu in 0.1.2
- letzter bekannter Wert im Dashboard
- Datum je Kachel
- Teil-Einträge bleiben vollständig
- Futtersorten-Favoriten
- bessere Desktop-Ansicht
- automatische Datenmigration
- Versionsanzeige und Changelog


## Neu in Version 0.1.3
- antippbare Futtersorten-Favoriten
- geheimes Minispiel „Bonzo's Fly Hunter“
- Freischaltung durch zehnmaliges Tippen auf das Logo
- lokaler Highscore
- kleine Bedienverbesserungen


## Neu in Version 0.2.0 – Everyday, Teil 1

- tägliche Futtermenge wird aus mehreren Einträgen summiert
- Stuhlgänge des Tages werden gezählt
- letzter dokumentierter Stuhlgang wird auf dem Dashboard angezeigt
- letztes Gewicht und letzte Stimmung bleiben unabhängig von Teil-Einträgen sichtbar
- klarere Trennung zwischen Tagesübersicht und letztem bekannten Gesundheitswert
- bestehende lokale Daten bleiben kompatibel


## Neu in Version 0.2.1
- Pflege-Modul für Friseur, Baden, Ohren, Augen, Krallen und Zähne
- optionale Angaben für Hundesalon und Shampoo
- Pflegeverlauf mit Bearbeiten und Löschen
- letzte Pflege auf dem Dashboard
- Pflegehistorie in der JSON-Sicherung
