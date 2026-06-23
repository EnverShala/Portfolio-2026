<!-- refreshed: 2026-06-23 -->
# Architecture

**Analysis Date:** 2026-06-23

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     Browser (no server rendering)                    │
│                                                                      │
│  Portfolio.dc.html  ──►  support.js (dc-runtime)  ──►  React 18    │
│  (source template)         parses x-dc, compiles     (UMD, unpkg)  │
│                            template → React VDOM                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  mounts into #dc-root
           ┌───────────────────▼───────────────────┐
           │           StreamableComponent          │
           │  (React class, hosts DCLogic instance) │
           │                                        │
           │  logic.renderVals()  ──►  template()   │
           │  (Component extends DCLogic)            │
           └──────────┬────────────────┬────────────┘
                      │                │
          ┌───────────▼──┐    ┌────────▼──────────────┐
          │  image-slot  │    │  Canvas particle sys   │
          │  (Shadow DOM │    │  Parallax / reveal /   │
          │   web cmpt)  │    │  typing / scroll prog  │
          └──────────────┘    └───────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │    sendMail.php      │
                              │  (PHP, rate-limited) │
                              └─────────────────────┘
```

## Component Model (x-dc)

The `x-dc` declarative component system is the core abstraction. All application code lives inside a single `<x-dc>` element in `Portfolio.dc.html`.

**How it works:**

1. `support.js` runs immediately on page load. It hides the raw `<x-dc>` element, then asynchronously loads React 18 UMD from unpkg.
2. Once React is ready, `boot()` in `support.js` (`src/boot.ts`) calls `parseDcDocument()` to extract:
   - The HTML template (everything inside `<x-dc>`)
   - The JS logic class (the `<script type="text/x-dc" data-dc-script>` block at the bottom of `Portfolio.dc.html`)
3. The template is compiled into a React render function via `compileTemplate()` (`src/compile.ts`). This converts `{{ expr }}` interpolations and directives (`<sc-for>`, `<sc-if>`) into React element builders.
4. The JS block is `eval`'d via `new Function(...)` (`src/logic.ts:evalDcLogic`), producing a `Component` class that extends `DCLogic` (alias `StreamableLogic`).
5. `StreamableComponent` (React class in `src/component.ts`) wraps the logic class: it calls `logic.renderVals()` to get the values dictionary, then passes it to the compiled template render function.
6. React renders the result into a `<div id="dc-root">` that replaces the original `<x-dc>` element.

**Template directives:**

| Syntax | Behaviour |
|--------|-----------|
| `{{ expr }}` | Interpolated expression — resolved via `resolve()` against `renderVals()` output |
| `ref="{{ refName }}"` | Passes a React ref object; the logic class declares e.g. `canvasRef = React.createRef()` |
| `<sc-for list="{{ expr }}" as="sk">` | Loops over an array; each iteration gets a child scope with `sk` and `$index` |
| `<sc-if value="{{ expr }}">` | Conditional render; `hint-placeholder-val` controls streaming placeholder |
| `<helmet>` | Moves children (link, style, script) into `<head>` at mount |
| `data-hover` / `style-hover="..."` | Adds a generated pseudo-class via `createPseudoSheet()` |
| `style-focus="..."` | Same, for `:focus` pseudo-class |
| `data-parallax="0.5"` | Mouse-parallax depth factor — handled by `setupParallax()` in the Component class |
| `data-reveal` | Scroll-reveal target — initially hidden, revealed by IntersectionObserver in `setupReveal()` |
| `onClick="{{ handler }}"` | Event handler bound from `renderVals()` |

**Logic class lifecycle** (mirrors React component lifecycle):

```javascript
class Component extends DCLogic {
  state = { lang: 'en', sent: false, sending: false, sendError: false, menuOpen: false };
  canvasRef = React.createRef();  // refs declared as class fields

  renderVals() { return { t: this.CONTENT[this.state.lang], ... }; }
  componentDidMount() { /* setup canvas, cursor, parallax, reveal, etc. */ }
  componentWillUnmount() { /* cancel RAF loops, remove listeners */ }
}
```

`setState()` on `DCLogic` delegates to the wrapper `StreamableComponent`, triggering a React re-render → `renderVals()` called again → template re-renders with new values.

## Rendering Pipeline

```
1. Page load
   support.js inline IIFE runs
     hideRawTemplate() — injects x-dc{display:none} to prevent FOUC
     loadReactUmd()    — fetches React + ReactDOM from unpkg (SRI-pinned)

2. React loaded → init()
   createRuntime(document)
     createRegistry()        — component name → {tpl, Logic, subs, ...}
     createPseudoSheet()     — injected <style> for :hover/:focus rules
     createHelmetManager()   — deduplicates head injections
     createExternalModules() — x-import loader (not used in this project)
   __dcBoot() (or DOMContentLoaded)

3. boot(runtime, document)
   parseDcDocument() — extracts template HTML + JS class text
   adoptParsed()
     updateHtml()  — compileTemplate() → r.tpl (React render fn)
     updateJs()    — evalDcLogic()     → r.Logic (Component class)
   dc.replaceWith(hostEl#dc-root)
   ReactDOM.createRoot(hostEl).render(<StandaloneRoot>)

4. Per render cycle (React reconciliation)
   StreamableComponent.render()
     __reconcileLogic()   — hot-swaps Logic class if registry updated
     logic.renderVals()   — returns flat vals dict
     r.tpl(vals, this)    — runs compiled template builders → React vdom

5. componentDidMount (after first paint)
   setupCanvas()     — requestAnimationFrame particle loop
   setupCursor()     — requestAnimationFrame cursor glow loop
   setupReveal()     — IntersectionObserver on [data-reveal] elements
   setupParallax()   — mousemove on heroRef → CSS transform on [data-parallax]
   setupProgress()   — scroll listener → progressRef width
   setupNavScroll()  — smooth scroll on all a[href^="#"]
   startTyping()     — setTimeout-based typewriter on roleRef
```

## Key Subsystems

### Canvas Particle System (`setupCanvas`, `Portfolio.dc.html` lines 540-584)
- Full-viewport `<canvas>` fixed behind all content (z-index 0), referenced via `canvasRef`
- RAF loop draws a grid of dots at 40px intervals across the viewport
- Each dot drifts using two sine waves (`time + position`) for a "living grid" effect
- Dots within 200px of the mouse cursor glow green; others are dim grey
- DPR-aware (`devicePixelRatio`, capped at 2) for retina sharpness
- Resize handler re-sizes canvas buffer; handle stored as `this._onResize`

### Custom Cursor (`setupCursor`, `Portfolio.dc.html` lines 586-609)
- A large radial-gradient `<div>` referenced via `cursorRingRef` follows the mouse at 18% lerp
- Expands from 240px to 300px over `[data-hover]` elements
- Hidden on touch devices via `@media (hover: none) { .cc-cursor { display: none } }`

### Scroll Reveal (`setupReveal`, `Portfolio.dc.html` lines 611-630)
- `IntersectionObserver` (threshold 0.1) on every `[data-reveal]` element in the component tree
- Initial state: `opacity:0; transform:translateY(28px); transition: 0.7s cubic-bezier(.2,.7,.2,1)`
- Staggered `transitionDelay` — `(i % 4) * 0.07s` per element
- Unobserves after first reveal (one-shot animation)

### Parallax (`setupParallax`, `Portfolio.dc.html` lines 632-647)
- Scoped to `#top` hero section only (via `heroRef`)
- `mousemove` translates `[data-parallax]` elements by `depth * offset * -20px`
- `data-parallax` depth values used: `0.15`, `0.2`, `0.25`, `0.3`, `0.35`, `0.5`

### Typewriter (`startTyping`, `Portfolio.dc.html` lines 684-703)
- Cycles through `CONTENT[lang].hero.roles` array into `roleRef`
- Type 85ms/char → pause 1600ms → delete 40ms/char → pause 240ms → next word
- Resets on language toggle (counters zeroed, `roleRef.current.textContent` cleared)
- `setTimeout` chain (not `setInterval`); handle stored as `this._typeTimer`

### Contact Form (`onSubmit`, `Portfolio.dc.html` lines 457-481)
- `fetch('sendMail.php', { method: 'POST', body: JSON.stringify({name, email, message, website}) })`
- Honeypot field `name="website"` (aria-hidden, off-screen) for bot filtering
- Client-side length limits: name=100, email=254, message=5000 chars
- State machine: default → `sending:true` → `sent:true` or `sendError:true`

### Language Toggle (`toggleLang`, `Portfolio.dc.html` lines 434-438)
- `state.lang` toggles between `'de'` and `'en'`
- `CONTENT` object holds both locales inline in the JS class (`Portfolio.dc.html` lines 319-414)
- `renderVals()` returns `t: this.CONTENT[lang]` — all `{{ t.* }}` bindings re-render automatically

### `image-slot` Web Component (`image-slot.js`)
- Shadow DOM custom element — fully encapsulated, no light-DOM CSS bleed
- Drag-and-drop + click-to-browse for PNG/JPEG/WebP/AVIF
- Encodes via `createImageBitmap` → canvas → `toDataURL('image/webp', 0.85)`, capped at 1200px longest side
- Reframe mode (double-click on `fit=cover` slots): pointer-capture pan + corner-drag aspect-locked scale
- Shared singleton store: all `<image-slot>` instances share a `slots` object loaded from `dist/.image-slots.state.json` via `fetch()`; writes go through `window.omelette.writeFile` (design-tool bridge — read-only in production)
- `id` attribute is the persistence key
- Used in `Portfolio.dc.html` as `#hero-photo` and `#about-photo`, both with `src="assets/profile.png"` as fallback

## Data Flow

### Language Switch
```
User clicks lang button
  → onClick="{{ toggleLang }}"
  → Component.toggleLang()
  → this.setState({ lang: 'en' })
  → DCLogic.setState() → StreamableComponent.__setLogicState()
  → React re-render → renderVals() returns new t object
  → All {{ t.* }} bindings update
  → Typewriter resets on roleRef
```

### Contact Form Submission
```
User submits form
  → onSubmit="{{ onSubmit }}"
  → Component.onSubmit(e)
  → setState({ sending: true })   — button shows "Sending..."
  → fetch('sendMail.php', POST)
  → res.ok  → setState({ sent: true })       — success block renders
  → !res.ok → setState({ sendError: true })  — error paragraph appears
```

### Image Drop
```
User drops file onto <image-slot>
  → handleEvent('drop') in ImageSlot
  → _ingest(file)
  → toDataUrl(file, clientWidth)   — async canvas encode
  → setSlot(id, { u, s:1, x:0, y:0 })
  → subs.forEach(fn)               — all ImageSlot instances re-render
  → if window.omelette.writeFile → save() — writes .image-slots.state.json
```

### Scroll Progress
```
window 'scroll' event (passive listener)
  → Component._onScroll()
  → pct = scrollY / (scrollHeight - innerHeight) * 100
  → progressRef.current.style.width = pct + '%'
  (Direct DOM mutation — bypasses React state deliberately)
```

## Patterns & Decisions

**No bundler, no build step for application source.** `Portfolio.dc.html` is edited directly. `support.js` is pre-built from `dc-runtime/src/*.ts` (note at top of file), but the TypeScript source is not in this repo — only the compiled output is present.

**React as invisible runtime.** React 18 is loaded from CDN (unpkg, SRI-pinned with `sha384-*` integrity attributes). The `Component` class only uses `React.createRef()` — never `import React` or JSX. React rendering is managed entirely by the dc-runtime layer.

**Direct DOM mutations for 60fps paths.** The canvas RAF loop, cursor lerp loop, scroll progress bar, parallax transforms, and typewriter all mutate DOM directly via `el.style.*`. Never route these through `setState()`.

**Refs as imperative escape hatches.** `canvasRef`, `cursorRingRef`, `progressRef`, `heroRef`, `roleRef` are React refs passed through the template via `ref="{{ xyzRef }}"` so `componentDidMount` can attach imperative subsystems to real DOM nodes.

**Inline bilingual content model.** Both DE and EN locales are hardcoded in the `CONTENT` object inside the JS class (`Portfolio.dc.html` lines 319-414). No i18n library or external JSON.

**CSP with `unsafe-eval`.** `dist/.htaccess` sets a Content-Security-Policy that includes `unsafe-eval` — required because dc-runtime uses `new Function()` to eval the JS logic block, and optionally uses Babel standalone for JSX transforms via x-import.

**Anti-pattern — do not bypass the lifecycle.** All event listeners and RAF loops must store handles on `this._*` and be cleaned up in `componentWillUnmount`. The existing cleanup is comprehensive — match it for any new subsystem added.

**Anti-pattern — do not route high-frequency visual updates through setState.** The canvas, cursor, and progress bar deliberately bypass React. Adding `setState` calls inside RAF callbacks or scroll handlers would cause React to re-render the full template on every frame.

---

*Architecture analysis: 2026-06-23*
