# Architecture

**Analysis Date:** 2026-06-20

## Pattern

**Static site / single-page component** rendered by the DC (Design Component) runtime — a
bespoke, browser-side framework bundled in `support.js`. The page is a single HTML file
(`Portfolio.dc.html`) that is parsed and executed entirely on the client. There is no server,
no build step, and no routing — the whole portfolio is one scrollable document with
anchor-based section navigation.

## Entry Points

| File | Role |
|---|---|
| `Portfolio.dc.html` | The only page. Parsed by the DC runtime on load. Contains the HTML template (`<x-dc>`), inline CSS (`<helmet><style>`), and the component logic (`<script type="text/x-dc" data-dc-script>`). |
| `support.js` (loaded first, line 6) | DC runtime bootstrap — loads React 18 from unpkg, then calls `init()` which mounts the component tree into `#dc-root`. |
| `image-slot.js` (loaded from `<helmet>`) | Self-contained Web Component (`<image-slot>`) injected into the page `<head>` by the DC helmet manager at runtime. |

## Data Flow

```
Browser loads Portfolio.dc.html
  → support.js runs immediately (sync <script> in <head>)
      → hides raw <x-dc> block (display:none)
      → loads React + ReactDOM from unpkg (async)
      → on React load: createRuntime() → parseDcDocument()
          → extracts <x-dc> inner HTML as template string
          → extracts <script data-dc-script> as JS source
          → compileTemplate(html) → React render function
          → evalDcLogic(js) → DCLogic subclass (Component)
          → ReactDOM.createRoot(#dc-root).render(...)
              → Component.componentDidMount()
                  → setupCanvas()    — animated dot grid on <canvas>
                  → setupCursor()    — glow ring follows mouse
                  → setupReveal()    — IntersectionObserver scroll reveals
                  → setupParallax()  — hero layer depth on mousemove
                  → setupProgress()  — scroll % bar at page top
                  → startTyping()    — typewriter role titles
                  → emailRef hydration (obfuscated mailto assembly)

State mutations (Component.state):
  { lang: 'de'|'en', sent: false|true }
  → setState() → React re-render → template re-evaluated with new renderVals()
  → {{ t.* }} interpolations update (bilingual content swap)
  → {{ sent }} / {{ notSent }} toggle contact form vs. success message

image-slot Web Component data flow:
  User drops image onto <image-slot> element
  → file ingested → resized via canvas → base64 WebP
  → stored in module-level `slots` map
  → persisted to .image-slots.state.json via window.omelette.writeFile (design-tool host only)
  → all registered <image-slot> subscribers re-render
```

**State management:** Single `Component.state` object (`lang`, `sent`). No external store.
Mutations go through `this.setState()` which delegates to React's `forceUpdate`. Template
bindings (`{{ expr }}`) are re-evaluated on every render from `renderVals()`.

## Key Modules / Components

| Module | File | Responsibility |
|---|---|---|
| DC Runtime | `support.js` | Framework bootstrap: loads React, parses `.dc.html` files, compiles HTML templates into React render functions, evaluates `DCLogic` JS classes, manages a component registry, provides `<sc-for>`, `<sc-if>`, `<helmet>`, and `<x-import>` directives. |
| Component (DCLogic subclass) | `Portfolio.dc.html` — `<script data-dc-script>` | Single page component: holds bilingual `CONTENT` map, `SKILLS` array, all DOM refs, and every interactive behaviour (canvas, cursor, reveal, parallax, scroll progress, typewriter, contact form, lang toggle). |
| ImageSlot Web Component | `image-slot.js` | Custom element `<image-slot>`: drop-zone for user photos, persistent crop/reframe UI, sidecar JSON state file, used for `#hero-photo`, `#about-photo`, and three project screenshot slots. |
| Template / Sections | `Portfolio.dc.html` — `<x-dc>` block | Declarative HTML for Hero, About, Skills, Portfolio (3 projects), Contact, Footer. Uses `{{ expr }}` interpolation, `<sc-for>`, `<sc-if>`, `data-hover`, `data-reveal`, `data-parallax` attributes consumed by runtime + logic. |

## Rendering Model

**Client-side only.** No SSR.

1. Browser receives a static HTML file.
2. `support.js` runs synchronously in `<head>`, hides the raw `<x-dc>` template.
3. React 18 UMD is fetched from `unpkg.com` (CDN, not bundled).
4. `image-slot.js` is injected into `<head>` by the helmet manager.
5. The DC runtime compiles the template HTML into a React render function and evaluates the
   component logic class.
6. `ReactDOM.createRoot` mounts the component into `<div id="dc-root">`.
7. All subsequent updates are pure React re-renders driven by `setState`.

Fonts (Space Grotesk, Manrope, JetBrains Mono) are fetched from Google Fonts CDN and
declared in the `<helmet>` block, which the runtime injects into `<head>` on mount.

## Summary

This is a zero-build, single-file client-side portfolio. The DC runtime (`support.js`)
acts as a lightweight React-based component framework: it parses the `.dc.html` file in
the browser, compiles the template, evaluates the embedded logic class, and mounts
everything via React 18 loaded from CDN. All content, styles, animations, bilingual text,
and interactivity live in one file (`Portfolio.dc.html`), with `image-slot.js` providing
a pluggable drag-and-drop photo slot as a standalone Web Component.

---

*Architecture analysis: 2026-06-20*
