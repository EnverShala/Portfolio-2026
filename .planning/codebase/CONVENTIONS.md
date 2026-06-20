# Coding Conventions

**Analysis Date:** 2026-06-20

## Code Style

- **Indentation:** 2-space indentation throughout all JS files (`image-slot.js`, `support.js`).
- **Semicolons:** Semicolons are used consistently to terminate statements.
- **Quotes:** Single quotes used for string literals in JavaScript (`'de'`, `'en'`, `'.image-slots.state.json'`). Double quotes used in HTML attribute values per HTML convention.
- **Braces:** Opening braces on the same line as the statement; no Allman style.
- **Line length:** Long lines are accepted — especially in `Portfolio.dc.html` where inline styles can exceed 200 characters per element. No enforced column limit.
- **Blank lines:** Used sparingly to separate logical blocks within functions; generally compact.
- **No trailing commas** enforced in object/array literals (mixed usage observed).
- No formatter config files (`.prettierrc`, `.editorconfig`, `biome.json`) are present.

## Naming Patterns

**Variables & properties:**
- camelCase throughout: `roleRef`, `cursorRingRef`, `progressRef`, `emailRef`, `saveDirty`, `loadP`, `_onResize`, `_typeTimer`.
- Private/internal members prefixed with underscore: `this._raf`, `this._craf`, `this._io`, `this._frame`, `this._img`, `this._onMove`, `this._outside`.
- Boolean-like state fields use full words: `sent`, `loaded`, `saving`, `deleting`.

**Functions & methods:**
- camelCase: `setupCanvas()`, `setupCursor()`, `setupReveal()`, `setupParallax()`, `setupProgress()`, `startTyping()`, `toggleLang()`, `mailClick()`, `onSubmit()`, `renderVals()`.
- Arrow functions used for event handlers and callbacks stored as class properties.

**Classes:**
- PascalCase: `Component`, `ImageSlot`, `StreamableComponent`, `StreamableLogic`.

**Files:**
- `kebab-case.js` for scripts: `image-slot.js`, `support.js`.
- `PascalCase.dc.html` for the Design Component file: `Portfolio.dc.html`.
- Assets use lowercase with hyphens or natural filenames: `assets/profile.png`.

**CSS class names:**
- `kebab-case`: `.cc-cursor`, `.sc-placeholder`, `.sc-host`, `.sc-interp`, `.sc-missing`, `.sc-for`, `.sc-if`, `.sc-helmet`.
- Internal shadow DOM classes use short single-word or compound-word names: `.frame`, `.spill`, `.ghost`, `.handle`, `.empty`, `.ring`, `.ctl`, `.cap`, `.sub`, `.err`.

**Data attributes:**
- `kebab-case` data attributes for behavior hooks: `data-hover`, `data-reveal`, `data-parallax`, `data-screen-label`, `data-over`, `data-filled`, `data-editable`, `data-reframe`, `data-panning`.

## HTML Patterns

- **Document structure:** Single-page portfolio using a `<x-dc>` wrapper (Design Component format), with a `<helmet>` block for head content and a `<script type="text/x-dc">` block for logic — this is the omelette/dc-runtime authoring convention.
- **Semantic elements:** `<nav>`, `<section>`, `<footer>`, `<form>`, `<h1>`–`<h3>`, `<p>`, `<a>`, `<button>`, `<input>`, `<textarea>`, `<label>` are all used semantically and correctly.
- **Section IDs:** Sections use `id` attributes for anchor navigation: `#top`, `#about`, `#skills`, `#portfolio`, `#contact`.
- **Custom elements:** `<image-slot>` (defined in `image-slot.js`) and dc-runtime directives `<sc-for>`, `<sc-if>` are used in the template.
- **Attribute ordering:** No strict enforced order; generally `id`/`type`/`ref` come first, followed by `style`, then event handlers (`onClick`, `onSubmit`).
- **Accessibility:** `alt=""` is set on all `<img>` tags inside `<image-slot>`; form inputs use `required` and `placeholder`. `title` attributes are present on icon links (GitHub, LinkedIn). `aria-*` attributes are not used.
- **Template interpolation:** Mustache-style `{{ expression }}` syntax used for all dynamic content; scoped conditionals use `<sc-if value="{{ ... }}">` and loops use `<sc-for list="{{ ... }}" as="item">`.
- **Inline styles:** All layout and visual styling is applied via inline `style` attributes directly on elements — there are no external CSS files and no `class`-based styling in `Portfolio.dc.html`. This is intentional for the dc-runtime format.

## CSS Patterns

- **Delivery:** All CSS for the portfolio is inline — either in a `<style>` block inside `<helmet>` or as `style="..."` attributes on elements. No external `.css` files exist.
- **Custom properties (CSS variables):** Extensively used for theming. All color and spacing tokens are defined on the root container `div` via inline `style`:
  - `--bg`, `--surface`, `--surface2`, `--border`, `--text`, `--muted`, `--green`, `--green-rgb`, `--purple`, `--purple-rgb`.
- **Keyframe animations:** Defined in the `<style>` block: `blink`, `floatBlob`, `floatBlob2`, `bobArrow`, `ringSpin`.
- **Responsive design:**
  - `clamp()` used widely for fluid typography and spacing: `font-size: clamp(2.6rem, 7vw, 5.2rem)`.
  - `min()` used for capping widths: `min(70vw, 300px)`.
  - `grid-template-columns: repeat(auto-fit, minmax(..., 1fr))` used for all section layouts — no named breakpoints.
  - `@media (hover: none)` used once to hide the custom cursor on touch devices.
- **Transitions:** Short, consistent — `.2s` or `.3s` with `ease` or `cubic-bezier(.2,.7,.2,1)`. Applied inline via `transition:` in `style` attributes.
- **Shadow DOM CSS** (in `image-slot.js`): Uses `:host`, `::slotted` selectors and part-based styling. CSS is constructed as a template string and injected into the shadow root's `<style>`.
- **No utility classes, no BEM** — the project does not use a CSS framework or systematic class naming in the main HTML.

## JavaScript Patterns

- **Module style:** No ES modules (`import`/`export`). All code uses IIFEs (`(() => { ... })()`) or class syntax embedded in dc-runtime's eval pipeline. `support.js` is a compiled, minified IIFE bundle.
- **Class-based components:** The portfolio logic is a `class Component extends DCLogic` pattern, with lifecycle methods (`componentDidMount`, `componentWillUnmount`) and React-style `setState` via the dc-runtime base class.
- **State management:** Managed through `this.state` object and `this.setState({ key: value })`, mirroring React class component patterns.
- **Refs:** `React.createRef()` used for direct DOM access: `this.canvasRef`, `this.roleRef`, `this.emailRef`, etc.
- **Event handling:** Arrow functions stored as class properties for event handlers (`toggleLang = () => {...}`). Event listeners attached in `componentDidMount` and cleaned up in `componentWillUnmount`, stored as `this._onResize`, `this._onMove`, etc. for removal.
- **Animation loops:** `requestAnimationFrame` loops stored as `this._raf`, `this._craf` and cancelled on unmount.
- **Timers:** `setTimeout` used for the typing animation; stored as `this._typeTimer` for cleanup.
- **Async patterns:** `async/await` used in `image-slot.js` (`_ingest`, `toDataUrl`). Promise chaining used in `support.js`. No `async/await` in the component logic class.
- **DOM manipulation:** Direct `el.style.*` assignment for dynamic style changes (cursor position, scroll progress, reveal animations). `IntersectionObserver` used for scroll-reveal; `ResizeObserver` used in `image-slot.js`.
- **Anti-obfuscation of email:** Email is assembled at runtime from parts (`['envershala1989', 'gmail.com'].join('@')`) to prevent scraping.
- **Content data:** All i18n strings for DE/EN are stored in a `CONTENT` object literal on the class. No external translation files.

## Comments & Documentation

- **Inline comments:** Used meaningfully throughout `image-slot.js` (the most commented file) to explain non-obvious design decisions, race conditions, and architectural constraints. Example: `// Serialize writes so two near-simultaneous drops on different slots / can't reorder at the backend`.
- **Block comments for usage docs:** `image-slot.js` starts with a full JSDoc-style `/** ... */` block documenting all attributes, behavior, and usage examples for the `<image-slot>` custom element.
- **`support.js`:** Contains a generated-file warning at the top (`// GENERATED from dc-runtime/src/*.ts — do not edit`) and internal inline comments explaining runtime decisions (streaming, race conditions, template compilation).
- **`Portfolio.dc.html`:** Section comments (`<!-- NAV -->`, `<!-- HERO -->`, `<!-- ABOUT -->`, etc.) are present but minimal. Inline logic has no JSDoc.
- **No JSDoc on the component class** in `Portfolio.dc.html` — method names are self-documenting.
- **Overall doc coverage:** Good in framework/utility files; minimal in the component logic itself.

## Summary

The codebase is a single-page portfolio using the omelette dc-runtime Design Component format — a React-backed, class-component style system with inline HTML templates. Code quality is high in the infrastructure files (`image-slot.js`, `support.js`) with clear naming, proper cleanup, and meaningful comments. The main portfolio file (`Portfolio.dc.html`) is functional and consistently structured but relies entirely on inline styles with no separation of CSS concerns, which is intentional for the dc-runtime authoring model. No linting or formatting tooling is configured.
