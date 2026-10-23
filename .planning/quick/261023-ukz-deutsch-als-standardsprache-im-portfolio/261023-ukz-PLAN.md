---
phase: quick-261023-ukz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Portfolio.dc.html
  - dist/index.html
autonomous: true
requirements: [QUICK-UKZ]

must_haves:
  truths:
    - "On first page load the site renders in German (state.lang === 'de')"
    - "The language toggle (desktop nav + mobile menu) shows a small inline-SVG flag next to the target language label: UK flag + 'EN ↔' while German is active, German flag + 'DE ↔' while English is active"
    - "The <html> element carries lang=\"de\" initially and document.documentElement.lang follows the active language on toggle"
    - "dist/index.html is byte-identical to Portfolio.dc.html"
  artifacts:
    - path: "Portfolio.dc.html"
      provides: "German default state, flag markup in both toggle buttons, html lang sync"
      contains: "lang: 'de'"
    - path: "dist/index.html"
      provides: "Deploy mirror of Portfolio.dc.html"
  key_links:
    - from: "renderVals()"
      to: "toggle button sc-if branches"
      via: "isDe boolean"
      pattern: "isDe"
    - from: "toggleLang"
      to: "document.documentElement.lang"
      via: "assignment after setState"
      pattern: "documentElement\\.lang"
---

<objective>
Make German the default language of the portfolio and add a small flag icon next to the language label in the language-toggle buttons (desktop nav + mobile menu).

Purpose: The site targets a German audience (meta descriptions are already German); visitors should land on German content, and the toggle should be visually recognisable via a flag.
Output: Updated Portfolio.dc.html, mirrored to dist/index.html.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@Portfolio.dc.html

<interfaces>
Template engine facts (custom .dc.html, extracted from codebase):
- Conditionals: `<sc-if value="{{ someBool }}" hint-placeholder-val="{{ false }}"> ... </sc-if>` (see lines ~417-447). Negation works inside braces: `{{ !sk.icon }}`.
- Inline `<svg>` markup is rendered directly in the template (e.g. burger icon line ~144). Placeholders `{{ x }}` render TEXT only — do NOT try to inject SVG via a string value.
- Values available in the template come from `renderVals()` return object (line ~731), e.g. `langLabel: lang === 'de' ? 'EN ↔' : 'DE ↔'` (line ~750).

Current spots:
- Line 2: `<html>` (no lang attribute).
- Line ~141: desktop toggle `<button data-hover onClick="{{ toggleLang }}" style="display: inline-flex; align-items: center; gap: 6px; ...">{{ langLabel }}</button>`
- Line ~155: mobile-menu toggle `<button onClick="{{ toggleLang }}" style="display: inline-flex; align-items: center; gap: 6px; ...">{{ langLabel }}</button>`
- Line ~480: `state = { lang: 'en', sent: false, ... }`
- Line ~645: `toggleLang = () => { const next = this.state.lang === 'de' ? 'en' : 'de'; this.setState({ lang: next }); ... }`
- Line ~774: `componentDidMount() { ... }`
- No localStorage / navigator.language logic exists — do not add any (default is simply 'de').
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: German default + html lang sync</name>
  <files>Portfolio.dc.html</files>
  <action>
1. Line 2: change `<html>` to `<html lang="de">`.
2. Line ~480: change the initial state `lang: 'en'` to `lang: 'de'`. Leave all other state keys untouched.
3. In `toggleLang`, after `this.setState({ lang: next });`, add `document.documentElement.lang = next;` (keeps the role-typer reset line as is).
4. In `componentDidMount()`, add `document.documentElement.lang = this.state.lang;` as the first statement so the attribute matches state even if the static attribute is ever changed.
5. In `renderVals()` return object, add `isDe: lang === 'de',` next to `langLabel` (keep `langLabel` unchanged — it already yields 'EN ↔' when German is active).
Do not touch any CONTENT strings (memory rule: never backslash-escaped apostrophes there). Check the typed-roles hero (line ~1105) still reads `this.CONTENT[this.state.lang]` — no change needed, it will start in German automatically.
  </action>
  <verify>
    <automated>cd "D:/Vizionists/portfolio2026" && grep -c "<html lang=\"de\">" Portfolio.dc.html && grep -c "state = { lang: 'de'" Portfolio.dc.html && grep -c "documentElement.lang" Portfolio.dc.html && grep -c "isDe: lang === 'de'" Portfolio.dc.html</automated>
  </verify>
  <done>Outputs 1, 1, 2, 1. Initial state is 'de', html lang attribute present and synced on mount + toggle, isDe exposed to template.</done>
</task>

<task type="auto">
  <name>Task 2: Inline SVG flags in both toggle buttons + dist mirror</name>
  <files>Portfolio.dc.html, dist/index.html</files>
  <action>
In BOTH toggle buttons (desktop line ~141 and mobile line ~155), replace the bare `{{ langLabel }}` content with two sc-if branches followed by the label, keeping the button element and its existing inline styles exactly as they are (it is already `display: inline-flex; align-items: center; gap: 6px;`, so flag and text space themselves):

- `<sc-if value="{{ isDe }}" hint-placeholder-val="{{ true }}">` containing a UK flag SVG (target language English), then `</sc-if>`.
- `<sc-if value="{{ !isDe }}" hint-placeholder-val="{{ false }}">` containing a Germany flag SVG (target language German), then `</sc-if>`.
- Then `{{ langLabel }}`.

Flag SVG requirements (inline SVG, NOT emoji — Windows renders regional-indicator emoji as letters):
- Attributes: `width="16" height="11"`, `aria-hidden="true"`, `style="display:block; flex-shrink:0; border-radius:2px; box-shadow: 0 0 0 1px rgba(255,255,255,0.12);"` (subtle edge so the black stripe stays visible on the dark surface).
- Germany: `viewBox="0 0 5 3"`, three full-width rects: y=0 fill #000000, y=1 fill #DD0000, y=2 fill #FFCE00, each height 1, width 5.
- UK (simplified Union Jack): `viewBox="0 0 60 30"`, wrap content in a clipPath-free layout: rect 60x30 fill #012169; path `M0,0 L60,30 M60,0 L0,30` stroke #FFFFFF stroke-width 6; path same diagonals stroke #C8102E stroke-width 2; path `M30,0 V30 M0,15 H60` stroke #FFFFFF stroke-width 10; same path stroke #C8102E stroke-width 6. Add `preserveAspectRatio="none"` so it fills 16x11.
Use identical flag markup in both buttons.

After editing, mirror: copy Portfolio.dc.html to dist/index.html (per project memory, dist/index.html is a byte-identical copy; previous quick tasks used `cp` + `cmp -s`). Do not touch dist/.htaccess or other dist files.
  </action>
  <verify>
    <automated>cd "D:/Vizionists/portfolio2026" && grep -c "sc-if value=\"{{ isDe }}\"" Portfolio.dc.html && grep -c "sc-if value=\"{{ !isDe }}\"" Portfolio.dc.html && grep -c "#FFCE00" Portfolio.dc.html && grep -c "#012169" Portfolio.dc.html && cmp -s Portfolio.dc.html dist/index.html && echo MIRROR_OK</automated>
  </verify>
  <done>Each grep outputs 2 (one per button) and MIRROR_OK printed. Page loads in German with a UK flag + "EN ↔" in both toggles; clicking switches to English, shows the German flag + "DE ↔", and html lang becomes "en".</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | Static client-side markup/state change; no new input, network or storage |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-ukz-01 | Tampering | Inline SVG flags | accept | Hard-coded static markup, no user data interpolated |
</threat_model>

<verification>
- Open Portfolio.dc.html in a browser: German content on first load, UK flag + "EN ↔" in desktop toggle and in burger menu (narrow viewport).
- Click toggle: English content, German flag + "DE ↔"; DevTools shows `<html lang="en">`.
- Console shows no errors; hover ring/scale on desktop toggle still works.
</verification>

<success_criteria>
- German is the default language.
- Both toggle buttons show the correct target-language flag next to the label.
- html lang attribute reflects active language.
- dist/index.html byte-identical to Portfolio.dc.html.
</success_criteria>

<output>
Create `.planning/quick/261023-ukz-deutsch-als-standardsprache-im-portfolio/261023-ukz-SUMMARY.md` when done
</output>
