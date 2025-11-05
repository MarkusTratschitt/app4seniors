import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread1 = codex.startThread();
const initialResult = await thread1.run(`
USER
aufgabe: content-schemata fuer howto, schritte und medien definieren. util zum validieren.

akzeptanzkriterien:
- types: OSFamily, HowTo, Step, Media mit exhaustiver union
- validator prueft required felder, liefert fehlerliste

artefakte:
- types/content.ts
- lib/validateHowTo.ts

USER
aufgabe: 20 howto-json dateien mit platzhalter text/bild/audio fuer ios, ipados, android, windows, macos (je 4). keywords, os version range.

akzeptanzkriterien:
- dateien validieren gegen validateHowTo
- alt-texte vorhanden
- filenames schema: content/howtos/<os>/<slug>.json

artefakte:
- content/howtos/**.json
- scripts/validate-content.ts (node skript)

USER
aufgabe: komponenten fuer schrittansicht mit grosser typografie, nummerierten karten, media-fallbacks.

akzeptanzkriterien:
- tastatur: tab-ordnung korrekt, "j/k" vor/zurueck, "f" fertig
- bei bildfehler alt-text sichtbar
- aria-live fuer schrittwechsel

artefakte:
- components/HowToSteps.vue
- pages/howto/[id].vue
- assets/styles/howto.less
- tests/unit/howto.a11y.spec.ts

USER
aufgabe: fuzzy-suche ueber titel/keywords, intent-lexikon (synonyme), suchseite und suchleiste.

akzeptanzkriterien:
- tippfehler-toleranz (levenshtein <= 2)
- intent "screenshot" liefert treffer pro os
- keine ergebnisse -> freundliche vorschlaege

artefakte:
- lib/search.ts
- lib/intent.ts
- pages/search.vue
- components/SearchBar.vue
- tests/unit/search.spec.ts

`);

const planResult = await thread1.run("Implement the plan");

console.log(planResult);
console.log(initialResult);

const resumeResult = await thread1.run("Pick up where you left off");

console.log(resumeResult);


