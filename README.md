# EU AI Act dataset

The obligations, application dates, Annex III use cases, prohibited practices and fines of the EU AI Act as structured data. JSON, YAML and iCalendar, in English and German, updated for the Digital Omnibus (Regulation (EU) 2026/1744).

[Deutsche Fassung weiter unten](#deutsch)

| File | Content | Entries |
|---|---|---|
| [`data/obligations.json`](data/obligations.json) | Obligations by article, role and application date | 33 |
| [`data/deadlines.json`](data/deadlines.json) | Application dates from 2024 to 2030 | 10 |
| [`data/deadlines.ics`](data/deadlines.ics) | The same dates as a calendar file (English), [German](data/deadlines.de.ics) | 10 |
| [`data/annex-iii.json`](data/annex-iii.json) | Annex III: 8 areas, 25 high-risk use cases with example and boundary | 8 / 25 |
| [`data/prohibited-practices.json`](data/prohibited-practices.json) | Article 5 prohibitions, including the two added by the Omnibus | 10 |
| [`data/fines.json`](data/fines.json) | The three fine tiers of Article 99 | 3 |

Every JSON file has a YAML twin with the same content.

## Why this exists

Most AI Act material is prose: PDFs, blog posts, slide decks. That is fine for reading and useless for anything else. If you build a compliance tool, an internal register, a policy checker or a chatbot that answers AI Act questions, you need the obligations as data, with the article, the addressee and the date in separate fields.

The Digital Omnibus moved most high-risk dates. Many lists online still show 2 August 2026 for Annex III. This dataset uses the amended dates:

| What | Applies from |
|---|---|
| Prohibited practices (Art. 5), AI literacy (Art. 4) | 2 Feb 2025 |
| General-purpose AI models (Art. 53, 55) | 2 Aug 2025 |
| Transparency (Art. 50) | 2 Aug 2026 |
| Machine-readable marking for systems placed on the market before 2 Aug 2026, two new prohibitions | 2 Dec 2026 |
| High-risk AI under Annex III | 2 Dec 2027 |
| High-risk AI in products under Annex I | 2 Aug 2028 |

## Structure

An obligation looks like this:

```json
{
  "id": "high_risk_deployer-art-26-6",
  "category": "high_risk_deployer",
  "type": "obligation",
  "article": "Art. 26 Abs. 6",
  "article_en": "Art. 26(6)",
  "roles": ["deployer"],
  "who": { "de": "Betreiber", "en": "Deployer" },
  "duty": { "de": "Automatisch erzeugte Protokolle mindestens 6 Monate aufbewahren", "en": "Keep automatically generated logs for at least 6 months" },
  "applies_from": [
    { "date": "2027-12-02", "scope": "annex_iii" },
    { "date": "2028-08-02", "scope": "annex_i" }
  ],
  "applies_from_text": { "de": "2.12.2027 / 2.8.2028", "en": "2 Dec 2027 / 2 Aug 2028" }
}
```

Fields used across the files:

- `roles`: `provider`, `deployer`, `distributor`, `importer`, `all_operators`, `all_organisations`, `public_body`, `private_public_service_provider`, `gpai_provider`, `gpai_provider_systemic_risk`
- `applies_from[].scope`: `general`, `annex_iii`, `annex_i`, `systems_placed_before_2026_08_02`, `legacy_gpai_models`
- `category`: `all_organisations`, `transparency`, `high_risk_provider`, `high_risk_deployer`, `gpai`
- `type`: `obligation`, or `recommendation` for the one entry that is good practice rather than a legal duty (keeping an AI inventory)
- Text fields are objects with `de` and `en`.

Each file starts with a `meta` block: version, date of the legal status, sources on EUR-Lex, licence.

## Usage

Fetch a file directly:

```bash
curl -s https://raw.githubusercontent.com/SimpleAct-Compliance/eu-ai-act-dataset/main/data/obligations.json
```

All deployer obligations that apply from 2 December 2027:

```js
const { obligations } = await (await fetch('https://raw.githubusercontent.com/SimpleAct-Compliance/eu-ai-act-dataset/main/data/obligations.json')).json()
const due = obligations.filter((o) => o.roles.includes('deployer') && o.applies_from.some((a) => a.date === '2027-12-02'))
console.log(due.map((o) => `${o.article_en}: ${o.duty.en}`))
```

Subscribe to the deadlines in Google Calendar, Outlook or Apple Calendar with the raw URL of `data/deadlines.ics`.

## Checks

```bash
node scripts/validate.mjs     # structure, dates, counts, both languages present
node scripts/build-ics.mjs    # regenerate the calendar files from deadlines.json
```

No dependencies. The check runs on every push.

## Scope and limits

- The texts are summaries, not the wording of the regulation. The Official Journal is authoritative: [Regulation (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj), [Regulation (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj).
- Not legal advice. Whether an obligation applies depends on the system, its intended purpose and your role.
- Guidelines and implementing acts of the Commission are not part of the dataset.
- The legal status is in `meta.as_of` of each file. Changes are listed in the [changelog](CHANGELOG.md).

Corrections are welcome as issues or pull requests. Please cite the article.

## Licence

Data under [CC BY 4.0](LICENSE). You may use, change and redistribute it, also commercially, with attribution: "EU AI Act dataset by SimpleAct, https://github.com/SimpleAct-Compliance/eu-ai-act-dataset".

Maintained by [SimpleAct](https://simpleact.de), compliance software for the EU AI Act and the GDPR. The same content as readable guides: [EU AI Act overview](https://simpleact.eu/ai-act), [deadlines](https://simpleact.eu/ai-act-deadlines), [Annex III](https://simpleact.eu/annex-iii-high-risk-ai).

---

<a id="deutsch"></a>

## Deutsch

Pflichten, Fristen, Anhang-III-Fälle, verbotene Praktiken und Bußgelder der KI-Verordnung als strukturierte Daten. JSON, YAML und Kalenderdatei, auf Deutsch und Englisch, auf dem Stand des Digital Omnibus (Verordnung (EU) 2026/1744).

| Datei | Inhalt |
|---|---|
| `data/obligations.json` | 33 Pflichten mit Artikel, Adressat und Geltungsbeginn |
| `data/deadlines.json`, `data/deadlines.de.ics` | 10 Stichtage von 2024 bis 2030, auch als Kalender zum Abonnieren |
| `data/annex-iii.json` | Anhang III: 8 Bereiche, 25 Anwendungsfälle mit Beispiel und Abgrenzung |
| `data/prohibited-practices.json` | Die Verbote nach Art. 5, einschließlich der zwei neuen aus dem Omnibus |
| `data/fines.json` | Die drei Bußgeldstufen nach Art. 99 |

Alle Textfelder gibt es als `de` und `en`. Die Texte sind Zusammenfassungen, nicht der Wortlaut, und keine Rechtsberatung. Maßgeblich ist das Amtsblatt der EU.

Die Daten stehen unter CC BY 4.0. Nutzung, Änderung und Weitergabe sind erlaubt, auch kommerziell, mit Quellenangabe. Lesbare Fassungen derselben Inhalte: [KI-Verordnung im Überblick](https://simpleact.de/ai-act), [Fristen](https://simpleact.de/eu-ai-act-fristen), [Anhang III](https://simpleact.de/annex-iii-hochrisiko-ki).
