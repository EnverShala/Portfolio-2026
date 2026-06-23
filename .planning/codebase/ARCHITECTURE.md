<!-- refreshed: 2026-06-23 -->
# Architecture

**Analysis Date:** 2026-06-23

## Pattern

**Multi-page static site** rendered by the DC (Design Component) runtime — a bespoke, browser-side framework bundled in `support.js`. Each page is a single `.dc.html` file parsed and executed entirely on the client. No SSR, no routing library. Navigation between pages uses normal `<a href>` links; within a page, anchor-based scroll navigation. A PHP script (`sendMail.php`) handles contact form submission server-side.

## Entry Points

| File | Role |
|---|---|
| `Portfolio.dc.html` | Main portfolio page. HTML template (`<x-dc>`), inline CSS (`<helmet><style>`), bilingual content (`CONTENT`), all interactive logic (`class Component extends DCLogic`). |
| `impressum.dc.html` | Legal notice page (Impressum). Same DC runtime shell; minimal JS (lang toggle only). |
| `datenschutz.dc.html` | Privacy policy page (Datenschutz). Same DC runtime shell; minimal JS (lang toggle only). |
| `support.js` (loaded first, `<head>`) | DC runtime bootstrap — loads React 18 from unpkg, calls `init()` which mounts the component tree into `#dc-root`. |
| `image-slot.js` (loaded from `<helmet>`) | Self-contained Web Component (`<image-slot>`) injected into `<head>` by the helmet manager at runtime. |
| `sendMail.php` | PHP endpoint for contact form POST. Validates, rate-limits, and calls `mail()`. |
| `dist/index.html` | Compiled/deployed copy of the main portfolio page, served from the `dist/` directory. |

## Data Flow

```
Browser loads [page].dc.html
  → support.js runs synchronously in <head>
      → hides raw <x-dc> block (display:none)
      → loads React + ReactDOM from unpkg (async, SRI-verified)
      → on React load: createRuntime() → parseDcDocument()
          → extracts <x-dc> inner HTML as template string
          → extracts <script data-dc-script> as JS source
          → compileTemplate(html) → React render function
          → evalDcLogic(js) → DCLogic subclass (Component)
          → ReactDOM.createRoot(#dc-root).render(...)
              → Component.componentDidMount()  [Portfolio.dc.html only]
                  → setupCanvas()     — animated dot grid on <canvas>
                  → setupCursor()     — glow ring follows mouse
                  → setupReveal()     — IntersectionObserver scroll reveals
                  → setupParallax()   — hero layer depth on mousemove
                  → setupProgress()   — scroll % bar at page top
                  → setupNavScroll()  — smooth scroll + mobile menu close
                  → startTyping()     — typewriter role titles
                  → emailRef hydration (obfuscated mailto assembly)

State mutations (Component.state):
  { lang: 'en'|'de', sent, sending, sendError, menuOpen }
  → setState() → React re-render → template re-evaluated with renderVals()
  → {{ t.* }} interpolations update (bilingual content swap)
  → {{ sent }} / {{ notSent }} toggle contact form vs. success message
  → {{ menuOpen }} / toggleMenu() drives mobile burger nav

Contact form submit flow:
  User submits form
  → onSubmit (async) → fetch('sendMail.php', { method: 'POST', body: JSON })
  → sendMail.php: rate check → honeypot check → validate → mail() → 200/400/429/500
  → success: setState({ sent: true })  |  error: setState({ sendError: true })

Page-to-page navigation:
  Portfolio.dc.html  ←→  /legalnotice  (→ impressum.dc.html or dist copy)
  Portfolio.dc.html  ←→  /privacypolicy (→ datenschutz.dc.html or dist copy)
```

**State management:** Single `Component.state` object per page. No external store. Mutations go through `this.setState()` which delegates to React's `forceUpdate`.

## Key Modules / Components

| Module | File | Responsibility |
|---|---|---|
| DC Runtime | `support.js` | Framework bootstrap: loads React, parses `.dc.html` files, compiles HTML templates into React render functions, evaluates `DCLogic` JS classes, manages component registry, provides `<sc-for>`, `<sc-if>`, `<helmet>`, `<x-import>` directives. Do not edit — generated artifact. |
| Portfolio Component | `Portfolio.dc.html` — `<script data-dc-script>` | Main page component: bilingual `CONTENT` map, `SKILLS` array, all DOM refs, every interactive behaviour (canvas, cursor, reveal, parallax, scroll progress, nav scroll, typewriter, contact form, lang toggle, mobile menu). |
| Impressum Component | `impressum.dc.html` — `<script data-dc-script>` | Minimal: lang toggle + bilingual legal text rendering only. |
| Datenschutz Component | `datenschutz.dc.html` — `<script data-dc-script>` | Minimal: lang toggle + bilingual privacy policy text rendering only. |
| ImageSlot Web Component | `image-slot.js` | Custom element `<image-slot>`: drop-zone for user photos, persistent crop/reframe UI, sidecar JSON state, used for `hero-photo`, `about-photo`. |
| Contact Backend | `sendMail.php` | PHP POST endpoint: CORS, rate limiting, honeypot, input validation, `mail()` dispatch to `envershala1989@gmail.com`. |
| Template / Sections | `Portfolio.dc.html` — `<x-dc>` block | Declarative HTML for Hero, About, Skills, Portfolio (coming-soon placeholder), Contact, Footer. Uses `{{ expr }}` interpolation, `<sc-for>`, `<sc-if>`, `data-hover`, `data-reveal`, `data-parallax` attributes. |

## Rendering Model

**Client-side only.** No SSR.

1. Browser receives a static `.dc.html` file.
2. `support.js` runs synchronously in `<head>`, hides the raw `<x-dc>` template.
3. React 18 UMD is fetched from `unpkg.com` (CDN, SRI-verified, not bundled).
4. `image-slot.js` is injected into `<head>` by the helmet manager.
5. DC runtime compiles the template HTML into a React render function and evaluates the component logic class.
6. `ReactDOM.createRoot` mounts the component into `<div id="dc-root">`.
7. All subsequent updates are pure React re-renders driven by `setState`.

Fonts (Space Grotesk, Manrope, JetBrains Mono) are served locally from `fonts/` via `fonts/fonts.css` (all weights as `.woff2`, `font-display: swap`). No external CDN for fonts.

## Page Structure

Each `.dc.html` page follows this shell pattern:

```html
<head>
  <meta charset / viewport>
  <link rel="icon" href="./favicon.svg">         <!-- SVG favicon -->
  <script src="./support.js"></script>             <!-- DC runtime -->
</head>
<body>
  <x-dc>
    <helmet>
      <link rel="stylesheet" href="./fonts/fonts.css">  <!-- self-hosted fonts -->
      <script src="image-slot.js"></script>              <!-- Portfolio only -->
      <style>/* resets, tokens, keyframes, breakpoints */</style>
    </helmet>
    <!-- declarative HTML template with {{ expr }}, data-* attributes -->
    <script type="text/x-dc" data-dc-script>
      class Component extends DCLogic { /* state + logic */ }
    </script>
  </x-dc>
</body>
```

## Sections (Portfolio.dc.html)

| Section | ID | Notes |
|---|---|---|
| Hero | `#top` | Photo (`<image-slot>`), typewriter roles, CTA, social links (GitHub, email, LinkedIn) |
| About | `#about` | Intro text, three bullet cards, photo slot (hidden ≤868px) |
| Skills | `#skills` | Skill tile grid (15 items via `<sc-for>`), two text columns |
| Portfolio | `#portfolio` | Currently shows "Coming Soon / Work in Progress" placeholder — no project cards |
| Contact | `#contact` | Form → `sendMail.php`; success/error state; privacy policy link → `/privacypolicy` |
| Footer | — | Name, Impressum link → `/legalnotice`, copyright, social icons |

## Architectural Constraints

- **No build step:** Changes to `Portfolio.dc.html` are live immediately; `dist/` must be manually synced.
- **CDN dependency:** Page is blank until React 18 loads from `unpkg.com`. No offline fallback.
- **`eval` / `new Function`:** `support.js` uses `new Function(...)` to evaluate user component code at runtime (`evalDcLogic`, external module loader). Makes `unsafe-eval` in CSP mandatory.
- **Global state:** Single `Component.state` per page; no shared state between pages.
- **PHP mail():** `sendMail.php` relies on the server's configured MTA. No SMTP credentials in code.
- **Threading:** Browser single-threaded. Two concurrent RAF loops (`_raf` canvas, `_craf` cursor lerp).

## Anti-Patterns

### Inline styles for all element-level CSS
**What happens:** Every spacing, color, and layout property is in `style=""` attributes directly on elements.
**Why it's wrong:** Global design changes (spacing, color tokens) require touching dozens of scattered attributes. CSS custom properties are defined on a root `<div>` instead of `:root`, scoping them away from `::before`/`::after`.
**Do this instead:** Move layout and component styles into named classes in the `<helmet><style>` block; reference `var(--green)` etc. consistently instead of hardcoded hex values.

### `default-src 'none'` + `'unsafe-inline'` CSP conflict
**What happens:** `.htaccess` CSP sets `default-src 'none'` then adds `'unsafe-inline'` to `script-src` and `style-src` because the dc-runtime and all styles require it.
**Why it's wrong:** `unsafe-inline` in `script-src` negates most XSS protection from CSP; required by the dc-runtime's `new Function` eval path.
**Do this instead:** No straightforward fix without replacing the dc-runtime. Document as a known constraint.

## Error Handling

**Strategy:** Silent degradation on the client. `support.js` wraps each component in an error boundary (lines 771–778) that logs to console but shows no user-facing message if `componentDidMount` throws.

**Contact form:** `onSubmit` catches `fetch` errors and sets `sendError: true`, which renders `{{ t.contact.sendError }}` inline below the submit button.

## Cross-Cutting Concerns

**Logging:** `console.error` only; no analytics or error tracking service.
**Validation:** Dual-layer — JS frontend (`required`, `maxlength`, `FILTER_VALIDATE_EMAIL` mirrored in HTML attributes) and PHP backend (`sendMail.php` re-validates all fields server-side).
**Authentication:** None.
**i18n:** Runtime DE/EN toggle via `CONTENT[lang]` object; default lang is `'en'` (changed from `'de'` in an earlier revision). No persistence across reloads.

---

*Architecture analysis: 2026-06-23*
