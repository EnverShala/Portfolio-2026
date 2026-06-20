# Technology Stack

**Analysis Date:** 2026-06-20

## Runtime & Language

**Primary:**
- HTML5 — single-page portfolio document (`Portfolio.dc.html`)
- JavaScript (ES2020+, class syntax, async/await) — all logic in `.dc.html` script block and `support.js`
- No TypeScript in source files (TypeScript support exists inside the dc-runtime as a Babel preset for x-import modules, but the portfolio itself is plain JS)

**Runtime:**
- Browser (no Node.js, no server-side runtime)
- No package manager, no lockfile — zero npm dependencies at the project level

## Frameworks & Libraries

**Core rendering engine:**
- `dc-runtime` (bundled, compiled into `support.js`) — proprietary Design Component runtime built on top of React. Loads React 18.3.1 UMD from unpkg at boot. Provides `<x-dc>`, `<sc-for>`, `<sc-if>`, `<helmet>`, `{{ }}` interpolation, and a `DCLogic` base class for component state.
  - Source comment: `// GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with cd dc-runtime && bun run build.`

**React (runtime dependency, loaded from CDN):**
- React 18.3.1 — UMD build, loaded by `support.js` at runtime from `https://unpkg.com/react@18.3.1/umd/react.production.min.js`
- ReactDOM 18.3.1 — UMD build, loaded from `https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js`
- Both loaded with SRI hash integrity checks; not bundled locally

**Custom Elements (Web Components):**
- `<image-slot>` — custom element defined in `image-slot.js`. Provides drag-and-drop image placeholder with sidecar persistence (`.image-slots.state.json`). Part of the "omelette" design tool scaffold. Zero external dependencies.

## Build & Tooling

**Build:**
- `support.js` is a pre-compiled bundle (built with Bun from `dc-runtime/src/*.ts` — source directory not present in this repo)
- No build step required to run the project — open `Portfolio.dc.html` in a browser or serve it statically
- No `package.json`, no `node_modules`, no bundler config at the project root

**Task runner:**
- None at the project level

**Persistence sidecar:**
- `.image-slots.state.json` — written by `image-slot.js` via `window.omelette.writeFile` (design-tool host bridge). Falls back to read-only when host is absent (i.e. in plain browser).

## Styling

**Approach:**
- Inline CSS only — all styles are written as `style="..."` attributes directly on elements inside `Portfolio.dc.html`
- `<style>` block inside the `<helmet>` tag defines global resets, CSS custom properties (design tokens), keyframe animations, and scrollbar overrides
- CSS custom properties (design tokens) defined on the root `<div>` via `style="--bg: ...; --green: #34d399; ..."`
- No CSS preprocessor (no Sass, PostCSS, etc.)
- No utility framework (no Tailwind, no Bootstrap)
- No CSS-in-JS library

**Fonts (loaded from Google Fonts CDN):**
- `Space Grotesk` — headings and nav brand (weights 400/500/600/700)
- `Manrope` — body text and form inputs (weights 400/500/600/700)
- `JetBrains Mono` — monospace labels, tags, social icons (weights 400/500)

**Design system:**
- Custom, hand-coded. Dark theme (`#070a0b` background, `#34d399` green accent). No third-party design system.

## Data & State

**State management:**
- `DCLogic` class pattern (dc-runtime's React wrapper). Component state held in `this.state = { lang: 'de', sent: false }` and mutated via `this.setState(...)`.
- No Redux, Zustand, Context API, or other external state library.

**Data fetching:**
- `fetch()` used by `support.js` to self-fetch the `.dc.html` template after boot for hot-reload support
- `fetch()` used by `image-slot.js` to load `.image-slots.state.json` sidecar state
- No external data API calls in the portfolio logic itself

**Storage:**
- `image-slot.js` persists dropped images as base64 WebP in `.image-slots.state.json` via the omelette host bridge (`window.omelette.writeFile`)
- No localStorage, sessionStorage, cookies, or database

**Content:**
- All content (copy, skills list, translations) is hardcoded as a `CONTENT` object and `SKILLS` array inside the `<script data-dc-script>` block in `Portfolio.dc.html`
- Bilingual (German / English) with runtime toggle via `toggleLang()`

## Summary

This is a zero-dependency, browser-only portfolio site built on a proprietary React-based Design Component runtime (`support.js`). The single HTML file (`Portfolio.dc.html`) contains all markup, styles, and logic. React 18 is loaded at runtime from unpkg CDN; no build step, bundler, or package manager is involved. Styling is entirely inline CSS with CSS custom properties; fonts come from Google Fonts. State is minimal (language toggle + contact form sent flag) and managed through the dc-runtime's `DCLogic` wrapper.

---

*Stack analysis: 2026-06-20*
