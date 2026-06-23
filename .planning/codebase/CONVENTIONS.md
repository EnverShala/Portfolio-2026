# Coding Conventions

**Analysis Date:** 2026-06-23

## CSS Approach

**No external stylesheet for component styles.** All layout, typography, color, and spacing for every section is written as inline `style` attributes directly on HTML elements in `Portfolio.dc.html`.

**Shared/global CSS lives in a `<style>` block** inside the `<helmet>` section of `Portfolio.dc.html` (lines 14–83). This block owns:
- CSS reset (`*`, `html`, `body`, `::selection`, scrollbar)
- Keyframe animations (`blink`, `floatBlob`, `floatBlob2`, `bobArrow`, `ringSpin`)
- All media queries (see Media Query Breakpoints section)
- Named CSS classes that toggle responsive behavior (`.nav-logo-text`, `.nav-logo-icon`, `.nav-burger`, `.burger-icon`, `.close-icon`, `.nav-links`, `.cc-cursor`)

**CSS custom properties** are declared as inline vars on the root wrapper `<div>` (line 86 of `Portfolio.dc.html`):
- `--bg`, `--surface`, `--surface2`, `--border`, `--text`, `--muted`, `--green`, `--green-rgb`, `--purple`, `--purple-rgb`

**`image-slot.js` uses Shadow DOM with a concatenated stylesheet string** (lines 163–221). Styles are written as a single concatenated string assigned to `const stylesheet`. Shadow DOM scoping means these rules are fully isolated from the page.

**Hover/focus state CSS** uses the x-dc runtime's `style-hover` and `style-focus` custom attributes rather than CSS pseudo-classes. The runtime injects a generated class into the document `<head>` for each unique value. Example:
```html
<a data-hover style="color: var(--muted);" style-hover="color: var(--text); text-shadow: 0 0 12px rgba(255,255,255,0.5);">
```

**`!important` is used extensively in media queries** to override inline styles, since a `<style>` block cannot beat the specificity of `style=""` attributes without it.

**`clamp()` for responsive sizing** is the preferred pattern for font sizes, padding, and gaps:
```html
style="font-size: clamp(2.6rem, 7vw, 5.2rem); padding: clamp(70px, 11vw, 130px) clamp(20px, 5vw, 64px);"
```

## Naming Conventions

**JS refs:** camelCase, suffixed with `Ref`
- `rootRef`, `canvasRef`, `cursorDotRef`, `cursorRingRef`, `roleRef`, `heroRef`, `progressRef`, `emailRef`

**JS state keys:** camelCase
- `lang`, `sent`, `sending`, `sendError`, `menuOpen`

**JS methods/handlers:** camelCase verbs
- `toggleLang`, `toggleMenu`, `closeMenu`, `onSubmit`, `mailClick`
- Setup methods: `setupCanvas`, `setupCursor`, `setupReveal`, `setupParallax`, `setupProgress`, `setupNavScroll`, `startTyping`

**JS internal animation/timer handles:** underscore-prefixed camelCase
- `this._raf`, `this._craf`, `this._typeTimer`, `this._onResize`, `this._onMove`, `this._onScroll`, `this._onOver`, `this._onOut`, `this._io`

**HTML element IDs:** kebab-case
- `#top`, `#hero-photo`, `#about`, `#about-photo`, `#skills`, `#portfolio`, `#contact`, `#main-nav`, `#nav-mobile-menu`

**HTML CSS class names:** kebab-case
- `.cc-cursor`, `.nav-links`, `.nav-burger`, `.nav-logo-text`, `.nav-logo-icon`, `.burger-icon`, `.close-icon`, `.about-photo-wrap`, `.skills-grid`, `.skills-icons`, `.skills-text-top`, `.skills-text-bottom`

**Component class name:** The class is named `Component` (line 307 of `Portfolio.dc.html`), extending `DCLogic` (the x-dc runtime's base class). It is not named `App`.

**Top-level data constants:** `ALLCAPS`
- `CONTENT` (bilingual string map), `SKILLS` (skills array)

**`image-slot.js` private instance fields:** underscore-prefixed
- `this._frame`, `this._img`, `this._empty`, `this._cap`, `this._spill`, `this._ghost`, `this._err`, `this._input`, `this._view`, `this._gen`, `this._subFn`, `this._ro`

## JS Style

**Module pattern for `image-slot.js`:** IIFE wrapping the entire file — no `export`, no `import`. The custom element registers itself via `customElements.define` inside the IIFE:
```js
(() => {
  // ... all code ...
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
```

**`support.js`:** Also a compiled IIFE (`"use strict"; (() => { ... })();`). Do not edit — it is generated from `dc-runtime/src/*.ts` via `bun run build`.

**Component logic in `Portfolio.dc.html`:** Written as a class body inside `<script type="text/x-dc" data-dc-script>`. The runtime evals it via `new Function(...)`. Class fields use the class-fields proposal syntax — no explicit constructor:
```js
class Component extends DCLogic {
  state = { lang: 'en', sent: false, sending: false, sendError: false, menuOpen: false };
  rootRef = React.createRef();
}
```

**Arrow functions for all event handlers and class methods** — ensures correct `this` binding without `.bind()`:
```js
toggleLang = () => { ... };
onSubmit = async (e) => { ... };
```

**`async/await` for fetch calls** — used in `onSubmit` for the contact form POST to `sendMail.php`.

**Template expressions use `{{ expr }}` syntax** — resolved by the x-dc runtime. Supports dot-path access, equality operators, and negation:
```html
{{ t.nav.about }}
{{ sending }}
```

**Conditional rendering:** `<sc-if value="{{ expr }}">` — renders children when truthy.

**List rendering:** `<sc-for list="{{ arr }}" as="item">` — iterates an array.

**`renderVals()` method** returns a flat object that the template renders against. All state, refs, handlers, and computed values must be explicitly returned here to be template-accessible.

**`componentDidMount` / `componentWillUnmount`** lifecycle hooks mirror React class component conventions. Every event listener added in setup methods is stored by reference on `this` and removed in `componentWillUnmount`.

**Email obfuscation pattern** — the address is never written as a plain string; assembled at runtime:
```js
['envershala1989', 'gmail.com'].join('@')
```

**No `console.log` in production code.** Debugging is visual/in-browser.

## HTML Patterns

**Single source file:** `Portfolio.dc.html` is the sole source of truth. `dist/` is a manually-kept production copy and must be kept in sync manually after edits.

**Sections are identified by `id` and a `data-screen-label` attribute:**
```html
<section id="top" data-screen-label="Hero" ref="{{ heroRef }}">
<section id="about" data-screen-label="Über mich">
<section id="skills" data-screen-label="Skills">
<section id="portfolio" data-screen-label="Portfolio">
<section id="contact" data-screen-label="Kontakt">
```

**Reveal animations** are applied via a `data-reveal` attribute on elements that should fade-in on scroll. The `setupReveal()` method picks these up with `querySelectorAll('[data-reveal]')` and attaches an `IntersectionObserver`.

**Parallax layers** use `data-parallax="<depth>"` with a float depth multiplier. The `setupParallax()` method reads this attribute to compute offset on `mousemove`.

**Hover-interactive elements** carry `data-hover` to trigger custom cursor enlargement:
```html
<a data-hover style="..." style-hover="...">
```

**SVG icons are inline** — no icon library. Each icon is a hand-written `<svg>` element directly in the markup.

**Honeypot spam field** in the contact form:
```html
<div aria-hidden="true" style="position:absolute;left:-9999px;...">
  <input type="text" name="website" tabindex="-1" autocomplete="off" />
</div>
```
If the `website` field is filled, the `onSubmit` handler silently drops the submission. Same check is expected server-side in `sendMail.php`.

**`image-slot` custom element** is used for profile photos:
```html
<image-slot id="hero-photo" src="assets/profile.png" fit="cover" shape="circle"
  placeholder="Dein Foto hier ablegen"
  style="display: block; width: min(70vw, 300px); height: min(70vw, 300px);">
</image-slot>
```

**i18n is handled entirely in JS** via the `CONTENT` object with `de` and `en` keys. All user-visible strings are `{{ t.section.key }}` references. Language state is toggled with `setState({ lang: next })`.

## Media Query Breakpoints

All media queries live in the `<style>` block inside `<helmet>` in `Portfolio.dc.html` (lines 30–82).

| Breakpoint | Applies to | Purpose |
|---|---|---|
| `max-width: 868px` | `.about-photo-wrap`, `.skills-icons` | Hide about photo; shrink skills icon grid columns |
| `max-width: 821px` | `.skills-grid` | Stack skills section to single column with explicit order |
| `max-width: 765px` | `#top` and children | Stack hero to single column; resize photo; reduce headings |
| `min-width: 481px` and `max-width: 765px` | `#top > a` (scroll indicator) | Adjust scroll arrow `bottom` offset |
| `max-width: 497px` | `.nav-logo-text`, `.nav-logo-icon` | Swap full name text for favicon icon in nav |
| `max-width: 480px` | `#top`, `#about` | Hero full-screen via `min-height: 100svh`; reduce about top padding |
| `max-width: 413px` | `.nav-links a`, `.nav-links button` | Shrink nav link and button font sizes |
| `max-width: 372px` | `#top`, nav buttons/links | Tightest mobile: hide nav links, show burger menu; reduce CTA button sizes |
| `hover: none` | `.cc-cursor` | Hide custom cursor on touch devices |

**`min-height: 100svh`** is preferred over `100vh` on mobile to account for dynamic browser toolbar collapse. `100vh` is retained as a fallback where `svh` is unsupported.

---

*Convention analysis: 2026-06-23*
