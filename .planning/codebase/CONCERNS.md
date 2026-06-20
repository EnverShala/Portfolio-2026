# Concerns & Technical Debt

**Analysis Date:** 2026-06-20

---

## Critical Issues

### All portfolio project links are placeholder `#` hrefs
Every "Live-Test" and "Github" button in the Portfolio section (`Portfolio.dc.html` lines 174–176, 203–205, 216–218) points to `href="#"`. These are dead links — clicking them scrolls to the top of the page instead of opening the actual projects. This is the most visible broken feature on the live site, affecting Join, El Pollo Loco, and Pokèdex entries.

### GitHub and LinkedIn social links are placeholder `#` hrefs
The hero section social icons (lines 86–89) and footer social icons (lines 273–276) for GitHub and LinkedIn both use `href="#"`. These links are expected to navigate to real profiles but do nothing.

### Contact form submits nowhere
`onSubmit` (line 410) calls `e.preventDefault()` and immediately sets `sent: true`. There is no backend, API call, email service (e.g. EmailJS, Formspree), or fetch involved. Submitting the form silently discards the message. The visitor sees a success state but nothing is delivered.

### Privacy policy link is a dead UI element
The contact form includes a `privacyLink` label ("Datenschutzerklärung" / "privacy policy", line 256) rendered as a `<span>` with green styling, but it is not a link. There is no privacy policy page or document anywhere in the project. The checkbox requires agreeing to a policy that does not exist, which is a legal compliance gap for a German-language site targeting EU visitors (GDPR).

### Footer "Impressum" link is a placeholder `#`
`t.footer.legal` renders as "Impressum" (line 269) but the `href="#"` means there is no legal notice page. Under German law (§ 5 TMG) a professional/freelancer website offering services must have an accessible Impressum.

### Project screenshots are absent — image-slots show empty placeholders
`Portfolio.dc.html` declares three `<image-slot>` elements for project screenshots (`proj-join`, `proj-pollo`, `proj-pokedex`) with no `src` attribute (lines 184, 196, 226). The screenshot image files have been deleted from the project. All three project cards render as empty drag-drop placeholders in any non-editor context, leaving the portfolio section visually broken for real visitors.

---

## Technical Debt

### All CSS is written as inline `style=""` attributes
`Portfolio.dc.html` contains zero stylesheet rules for layout or component styles. Every single visual property — grid, flexbox, spacing, typography, color, transitions, hover states — is specified as inline `style` strings directly on HTML elements. This makes global design changes (e.g. adjusting a spacing scale or color token) require touching dozens of scattered attribute values. The `--bg`, `--green`, `--purple` CSS custom properties are defined on the root div (line 33) but re-stated as literal hex values in dozens of places instead of being consumed consistently.

### `--purple` CSS variable is assigned the same value as `--green`
`Portfolio.dc.html` line 33 defines `--purple: #34d399` — identical to `--green: #34d399`. The variable name implies a distinct accent color, but both resolve to the same green. This is either an unfinished design decision (purple was planned, never implemented) or an accidental copy-paste. Anywhere `var(--purple)` is used, it is indistinguishable from `var(--green)`.

### Testimonial data exists in CONTENT but no testimonial section is rendered
`CONTENT.de.testi` and `CONTENT.en.testi` (lines 325–328, 370–373) contain a full testimonial quote from "Emre Isik" about working with Enver on the Join project. There is no corresponding `<section>` or element in the HTML template that renders it. This content exists in both languages in the logic class but is completely unused.

### `support.js` is committed as a generated build artifact with a "do not edit" warning
Line 1 of `support.js` reads: `// GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with 'cd dc-runtime && bun run build'.` The source TypeScript files and the `dc-runtime/` build directory do not exist in this repository. The bundled runtime (1,513 lines) is committed directly. There is no way to patch or upgrade the runtime without the missing source.

### `image-slot.js` contains editor-only write functionality that silently does nothing in production
The `ImageSlot` component's "Replace" / "Remove" controls and drag-to-reframe only activate when `window.omelette && window.omelette.writeFile` is truthy (line 596–597). Outside the omelette editor environment this is always falsy — the controls never appear and all persistence writes are silently skipped. The sidecar file `.image-slots.state.json` also does not exist in the repo, so `fetch('.image-slots.state.json')` will 404 silently on every page load.

### The DC component framework requires React loaded from unpkg CDN at runtime
`support.js` lines 1424–1428 hard-code unpkg.com URLs for React 18.3.1 and ReactDOM 18.3.1 with SRI hashes. The entire page is blank until these CDN requests resolve. If unpkg is unavailable (offline, rate-limited, or blocked) the page fails completely with no fallback.

### `eval` / `new Function` used in the runtime for user logic and external modules
`support.js` lines 687–694 (`evalDcLogic`) and lines 1025–1032 (external module loader) use `new Function(...)` to evaluate user-provided JavaScript strings at runtime. This is noted with `//! nosemgrep:` suppression comments. While scoped to the DC design tool context, it is a pattern that makes CSP compliance impossible without `unsafe-eval`.

---

## Missing Features / Gaps

### No actual email or message delivery on form submit
The contact form has all the right UI (name, email, message, privacy checkbox, send button, success state) but `onSubmit` (line 410) does nothing except `setState({ sent: true })`. An integration with Formspree, EmailJS, Netlify Forms, or a backend endpoint is needed before the form is functional.

### No privacy policy or Impressum pages
Both are linked from the UI (footer nav, contact form checkbox) but no content exists. Required for GDPR compliance and German TMG law on a professional services site.

### No 404 / error page
The project is a single `.dc.html` file with no routing. Navigating to any non-root URL would return a 404 from whatever server hosts the file. No fallback or error page exists.

### No `<title>` or SEO meta tags
`Portfolio.dc.html` has `<meta charset>` and `<meta viewport>` but no `<title>`, `<meta name="description">`, Open Graph tags, or canonical URL. The page will appear as an untitled document in browser tabs and search results.

### No favicon
There is no `<link rel="icon">` declaration and no favicon file in the project root or `assets/` directory.

### Language toggle does not persist across page reloads
`state.lang` is stored in component memory only (line 283). Reloading the page always resets to `'de'`. There is no `localStorage` read/write in `toggleLang` (line 404–408) or `componentDidMount`.

---

## Performance Concerns

### Animated canvas dot grid runs on the main thread every frame
`setupCanvas()` (lines 460–503) runs a nested loop over every grid point (step=40px, so ~48×27 ≈ 1,296 points at 1920×1080) on every `requestAnimationFrame`. Each point involves trigonometry, a distance sqrt, and a `ctx.arc()` + `ctx.fill()` call. This is intentionally decorative but will produce measurable CPU usage on lower-end hardware and will drain mobile battery. There is no `prefers-reduced-motion` check.

### Two separate `requestAnimationFrame` loops run simultaneously
`setupCanvas()` starts `this._raf` and `setupCursor()` starts `this._craf` (lines 503, 515). Both run perpetually on every frame. They could be merged into a single loop to halve the RAF callback overhead.

### Three Google Fonts families loaded with full weight ranges
`Portfolio.dc.html` lines 12–13 load Space Grotesk (400–700), Manrope (400–700), and JetBrains Mono (400–500) from Google Fonts. No `font-display: swap` is specified. All three are render-blocking until the font CSS resolves.

### React and ReactDOM loaded synchronously from CDN before any page content renders
`support.js` line 1440 sets `s.async = false` on the React script tags. The page is blank until both CDN scripts download, parse, and execute.

### Two large animated radial gradient blobs use `filter: blur()` on `position: fixed` elements
`Portfolio.dc.html` lines 36–37 apply `filter: blur(46px)` and `filter: blur(54px)` to `position: fixed` full-viewport elements. CSS `filter` on fixed/absolute elements forces GPU compositing of a large area and can cause repaints on low-end devices.

### `scroll` event listener is not passive-flagged on cursor mousemove
`setupCursor()` attaches `mousemove` (line 508) without `{ passive: true }`. Passive event listeners are required for smooth scrolling on touch devices.

---

## Maintainability

### 604-line single-file component with all logic, content, and markup inline
The entire portfolio — all translations, all skills data, all animation logic, all section HTML — lives in `Portfolio.dc.html`. There are no separate modules, no component decomposition, and no external data files. Adding a new project card, skill, or language requires editing a single 604-line file and locating the right nested position within it.

### All translatable content is hardcoded inside the JS class
`CONTENT` (lines 294–385) is a large nested object literal directly in the component's class body. There is no CMS, no JSON file, no i18n library. Editing copy requires touching the JavaScript class. The two language objects (`de`/`en`) are not validated against each other — a missing key in one language silently renders nothing for that interpolation.

### CSS variable tokens defined on a root `<div>` rather than `:root`
Design tokens (`--bg`, `--surface`, `--border`, `--green`, etc.) are defined as inline styles on the root `<div>` (line 33), not on `:root` or in a `<style>` block. This means they are scoped to the subtree of that div and inaccessible to any sibling-level CSS rules or the `::before`/`::after` pseudo-elements at the document level.

### `cursorDotRef` is created but never used
`Portfolio.dc.html` line 287 declares `cursorDotRef = React.createRef()` and it appears in `renderVals()` (line 427). There is no `ref="{{ cursorDotRef }}"` in the HTML template and no usage of `this.cursorDotRef.current` anywhere in the logic. It is dead code.

### Parallax effect only activates on `mousemove` inside the hero section
`setupParallax()` (lines 552–566) attaches the mousemove listener to `this.heroRef.current`, which is the `<section id="top">` element. The parallax elements are only affected while the pointer is inside the hero. This is the intended behavior, but on mobile (no hover) the parallax initializes and runs listeners that never fire — wasted event registration.

### No error boundary around the entire portfolio
The DC runtime provides per-component error boundaries (line 771–778 in `support.js`), but a JavaScript exception in `componentDidMount()` (e.g. canvas or IntersectionObserver failure on an older browser) is caught and logged to the console but leaves the affected setup silently incomplete with no visible user feedback.

---

## Dead Code / Cleanup

### `uploads/rund.PNG` — orphaned asset with no reference in any source file
`uploads/rund.PNG` exists in the repository but is not referenced by any `src`, `href`, or import anywhere in `Portfolio.dc.html`, `image-slot.js`, or `support.js`. It appears to be a leftover file from a previous iteration.

### `.thumbnail` — binary WebP artifact committed to git
`.thumbnail` is a 4,480-byte WebP image (320×275px) in the repository root. It is not referenced anywhere in the source and appears to be an editor-generated preview thumbnail. Binary blobs in git root are not meaningful to track and inflate the repository.

### `cursorDotRef` declared and exported but never referenced in the template
As noted above: `this.cursorDotRef = React.createRef()` is created, added to `renderVals()`, but no element in the HTML has `ref="{{ cursorDotRef }}"`. Cleanup candidate.

### `t.portfolio.code` key defined but never rendered
`CONTENT.de.portfolio.code` (line 320) and `CONTENT.en.portfolio.code` (line 365) both define `code: 'Github'`. The template renders the Github button text as a hardcoded `Github` string literal rather than `{{ t.portfolio.code }}`. The translation key is unused.

### `testi` translation block (both `de` and `en`) defined but unused
`CONTENT.de.testi` (lines 325–328) and `CONTENT.en.testi` (lines 370–373) define a complete testimonial block. No element in the template renders `{{ t.testi.quote }}` or `{{ t.testi.author }}`. This is dead content data taking up space in the class definition.

---

## Opportunities

### Add real project URLs to portfolio buttons
The single highest-impact fix: replace the six `href="#"` values on the Live-Test / Github buttons with actual URLs. No code changes to logic or structure are needed — just attribute values.

### Add static fallback `src` images to project `<image-slot>` elements
Each project card's `<image-slot>` accepts a `src` attribute as a fallback. Adding real screenshot images to `assets/` and wiring them as `src="assets/join.png"` etc. would make the portfolio visually complete without requiring the omelette editor environment.

### Add `localStorage` persistence for language toggle
A two-line change in `toggleLang` and a one-line read in `componentDidMount` would make the language preference survive page reloads.

### Wire the contact form to Formspree or EmailJS
Replacing `onSubmit`'s two-line body with a `fetch('https://formspree.io/f/YOUR_ID', {...})` call would make the contact form functional with no backend needed.

### Add `<title>` and `<meta name="description">`
Adding these to the `<helmet>` block in `Portfolio.dc.html` requires two lines and immediately improves search visibility and browser tab presentation.

### Merge the two `requestAnimationFrame` loops into one
Combining the canvas draw loop and cursor lerp loop into a single RAF callback reduces scheduling overhead and makes the animation timing consistent.

### Add `prefers-reduced-motion` check to disable canvas animation and CSS keyframes
A single `window.matchMedia('(prefers-reduced-motion: reduce)')` check in `setupCanvas()` and CSS `@media (prefers-reduced-motion: reduce)` rules for the keyframe animations would make the page accessible to users who have motion sensitivity settings enabled.

---

## Summary

The portfolio is visually polished with a coherent dark-green design system and smooth animations, but it is fundamentally incomplete as a working professional portfolio site. The most critical gaps are: all external links (GitHub, LinkedIn, project live demos) are placeholder `href="#"` values; the contact form discards every submission; there is no privacy policy or Impressum despite legally requiring both for a German-market freelancer site; and the portfolio project screenshot images have been deleted, leaving all three project cards showing empty placeholders. The codebase itself is maintainable in the short term — it is a single-file component with straightforward logic — but the all-inline-styles pattern and the monolithic single-file structure will become friction as the portfolio grows.
