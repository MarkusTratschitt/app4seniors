import { Codex } from "@openai/codex-sdk";

const codex = new Codex();
const thread1 = codex.startThread();
const result1 = await thread1.run(`
SYSTEM
du bist ein strenger, pedantischer code-generator. ziel: nuxt4-app mit pug, less, typescript, pinia. fokus: wcag 2.2 aa, einfache sprache, offline-first. schreibe nur dateiaenderungen im format:

=== write:<pfad/filename> ===
<dateiinhalt>
=== end ===

=== patch:<pfad/filename> ===
<unified diff>
=== end ===

keine erklaerungen. wenn information fehlt, nutze sprechende platzhalter und TODO kommentare. halte dich an:
- strikte typisierung
- pug fuer templates, less fuer styles
- aria-attribute, focus-visible, skip-links
- keine exotischen libraries ohne begruendung
- tests mit vitest, e2e mit playwright
- barrierefreie defaults: kontrast >= 4.5:1, tastaturbedienbar

bei fehlerquellen: implementiere robuste fallbacks (z. b. fehlende media, fehlende rechte, offline).

USER
aufgabe: <kurzbeschreibung>

annahmen/kontext:
- framework: nuxt4, vue 3
- templates: pug, styles: less, scripts: typescript strict
- state: pinia
- a11y: wcag 2.2 aa
- tests: vitest + playwright
- output: nur write/patch-bloecke

akzeptanzkriterien:
- <liste messbarer kriterien>

artefakte:
- <dateiliste, die erzeugt/geaendert werden soll>

USER
aufgabe: initiales nuxt4 monorepo mit pug, less, typescript strict, pinia, eslint, stylelint, prettier, vitest, playwright einrichten.

akzeptanzkriterien:
- "npm dev" startet
- lint und test laufen "gruen"
- pug/less sind im build integriert
- base layout hat skip-link und focus-styles

artefakte:
- package.json, tsconfig.json, .eslintrc.cjs, .prettierrc, .stylelintrc.cjs
- nuxt.config.ts
- app.vue, layouts/default.vue, pages/index.vue
- tests/unit/example.spec.ts
- tests/e2e/example.spec.ts
- .github/workflows/ci.yml

USER
aufgabe: design-tokens, farben, typografie, abstaende; globaler focus-visible; hochkontrast-toggle.

akzeptanzkriterien:
- kontrast >= 4.5:1
- sichtbarer focus-ring auf interaktiven elementen
- toggle "hochkontrast" aendert token-werte

artefakte:
- assets/styles/tokens.less
- assets/styles/base.less
- components/HighContrastToggle.vue
- layouts/default.vue (patch, toggle platzieren)

`);
const result = await thread1.run("Implement the plan");

console.log(result);
console.log(result1);

const result2 = await thread1.run("Pick up where you left off");

console.log(result2);

