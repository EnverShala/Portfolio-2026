<!-- refreshed: 2026-06-23 -->
# Codebase Structure

**Analysis Date:** 2026-06-23

## Directory Layout

```
portfolio2026/                  # Project root — also the authoring workspace
├── Portfolio.dc.html           # PRIMARY SOURCE — main portfolio page (x-dc component)
├── datenschutz.dc.html         # Privacy policy page (x-dc component)
├── impressum.dc.html           # Legal notice page (x-dc component)
├── support.js                  # dc-runtime (pre-compiled from dc-runtime/src/*.ts)
├── image-slot.js               # Shadow DOM web component for droppable image slots
├── sendMail.php                # PHP contact-form backend with rate limiting
├── .htaccess                   # NOT PRESENT at root (only in dist/)
├── favicon.svg                 # SVG favicon (used by both root and dist)
├── robots.txt                  # Robots exclusion
├── fonts/                      # Self-hosted webfonts (woff2)
│   ├── fonts.css               # @font-face declarations
│   ├── Manrope-*.woff2         # Body font (400/500/600/700, latin + latin-ext)
│   ├── SpaceGrotesk-*.woff2    # Heading font (400/500/600/700, latin + latin-ext)
│   └── JetBrainsMono-*.woff2  # Monospace/code font (400/500, latin + latin-ext)
├── assets/
│   └── profile.png             # Profile photo (initial/fallback for image-slot)
├── uploads/
│   └── rund.PNG                # User-uploaded file (gitignored pattern)
├── .planning/                  # GSD planning documents (not deployed)
│   ├── codebase/               # Architecture maps (this file lives here)
│   ├── STATE.md
│   ├── ROADMAP.md
│   ├── REQUIREMENTS.md
│   └── quick/                  # Quick-task plans and summaries
└── dist/                       # DEPLOYMENT TARGET — served by Apache
    ├── index.html              # Compiled/copied from Portfolio.dc.html
    ├── datenschutz.dc.html     # Copied from root
    ├── impressum.dc.html       # Copied from root
    ├── support.js              # Copied from root
    ├── image-slot.js           # Copied from root
    ├── sendMail.php            # Copied from root
    ├── favicon.svg             # Copied from root
    ├── robots.txt              # Copied from root
    ├── .htaccess               # Apache config (clean URLs, CSP headers, security)
    ├── .image-slots.state.json # Runtime sidecar — persists dropped image data
    ├── fonts/                  # Copied from root fonts/
    ├── assets/
    │   └── profile.png         # Copied from root assets/
    └── uploads/
        ├── rund.PNG            # User uploads
        └── .htaccess           # Blocks direct browser access to uploads/
```

## Key Files

### `Portfolio.dc.html` — Primary Source File
The entire portfolio page. Contains three parts that the dc-runtime assembles:

1. **Bootstrap** (lines 1-9): Bare HTML head that loads `support.js` only.
2. **`<x-dc>` template** (lines 10-305): The full page HTML with `{{ expr }}` bindings, `<sc-for>`, `<sc-if>`, `<helmet>`, `data-reveal`, `data-parallax` attributes. Sections in order:
   - Animated background blobs + `<canvas ref="{{ canvasRef }}">` + custom cursor div
   - Scroll progress bar `<div ref="{{ progressRef }}">` 
   - `<nav id="main-nav">` — fixed navigation with lang toggle button
   - `<section id="top">` — hero: photo (image-slot), name, typewriter role, CTA, social links
   - `<section id="about">` — about: text bullets + second image-slot
   - `<section id="skills">` — skills: `<sc-for list="{{ skills }}">` grid + text
   - `<section id="portfolio">` — portfolio: "Coming Soon" placeholder
   - `<section id="contact">` — contact form with `<sc-if>` for sent/unsent states
   - `<footer>` — links, legal, copyright
3. **`<script type="text/x-dc" data-dc-script>`** (lines 306-705): The `Component` class extending `DCLogic`. Contains all state, refs, content data (CONTENT/SKILLS), event handlers, and lifecycle methods.

### `support.js` — dc-runtime
Pre-compiled bundle (from `dc-runtime/src/*.ts`, TypeScript source not in repo). Exposes the `x-dc` component system as a browser IIFE. Key exported globals: `DCLogic`, `StreamableLogic`, `getDC`, `__dcUpdate`, `__dcBoot`, `__dcRegistry`. Loads React 18 UMD from unpkg with SRI integrity checking.

### `image-slot.js` — Image Slot Web Component
Self-contained IIFE that defines the `<image-slot>` custom element. No external dependencies. Uses Shadow DOM for style encapsulation. Shared sidecar store pattern: all instances on a page share a module-level `slots` object and `subs` subscriber set.

### `sendMail.php` — Contact Form Backend
PHP script that:
- Accepts POST JSON: `{name, email, message, website}` (website = honeypot)
- Rate-limits by IP: 3 requests per 10 minutes (file-based, no DB)
- Validates and sanitizes inputs
- Sends email via PHP `mail()`
- Returns HTTP 200 on success, 4xx/5xx on failure

### `dist/.htaccess` — Apache Configuration
- `DirectoryIndex index.html` — serves `index.html` at root
- Clean URL rewrites: `/legalnotice` → `impressum.dc.html`, `/privacypolicy` → `datenschutz.dc.html`
- Blocks dotfiles except `.image-slots.state.json`
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`
- CSP: `script-src 'self' https://unpkg.com 'unsafe-inline' 'unsafe-eval'` (unpkg needed for React CDN; unsafe-eval needed for dc-runtime's `new Function()`)

### `dist/.image-slots.state.json` — Image Sidecar
Runtime file written by `image-slot.js` via `window.omelette.writeFile` in the design tool. In production (no omelette), this file is read-only via `fetch()` and serves as the persisted state of any dropped images. Schema: `{ [id]: { u: "data:image/webp;base64,...", s: 1, x: 0, y: 0 } }`.

### `datenschutz.dc.html` / `impressum.dc.html`
Standalone x-dc pages for legal content. Served at `/privacypolicy` and `/legalnotice` via `.htaccess` rewrites. Same runtime pattern as `Portfolio.dc.html` — each has its own `<x-dc>` template and `<script data-dc-script>` block.

## Source → Dist Relationship

**There is no automated build pipeline.** The `dist/` directory is maintained manually:

| What changes | What to copy to dist/ |
|---|---|
| `Portfolio.dc.html` | `dist/index.html` (rename on copy) |
| `datenschutz.dc.html` | `dist/datenschutz.dc.html` |
| `impressum.dc.html` | `dist/impressum.dc.html` |
| `support.js` | `dist/support.js` |
| `image-slot.js` | `dist/image-slot.js` |
| `sendMail.php` | `dist/sendMail.php` |
| `fonts/` | `dist/fonts/` |
| `assets/profile.png` | `dist/assets/profile.png` |
| `favicon.svg`, `robots.txt` | `dist/` (same names) |

**Files that exist ONLY in dist/** (never edit source versions of these):
- `dist/.htaccess` — Apache config, no root equivalent
- `dist/.image-slots.state.json` — runtime state, not source
- `dist/uploads/.htaccess` — blocks upload directory browsing

**File that exists ONLY in root** (not deployed):
- `.planning/` — all planning docs
- `uploads/` at root — local design-tool uploads, not deployed

## Asset Pipeline

**Fonts** (`fonts/`):
- Self-hosted woff2 files, organized as `{Family}-{weight}-{subset}.woff2`
- `fonts/fonts.css` declares all `@font-face` rules
- Referenced from `Portfolio.dc.html` inside `<helmet>` → injected into `<head>` at runtime
- Three families: Manrope (body), Space Grotesk (headings), JetBrains Mono (code/mono)
- Latin and latin-ext subsets for each weight

**Images** (`assets/`):
- Only `assets/profile.png` exists as source-controlled asset
- Used as `src="assets/profile.png"` on both `<image-slot>` elements
- The image-slot component overrides it at runtime with a user-dropped image stored in `.image-slots.state.json`

**SVG** (inline in HTML):
- All icons (GitHub, LinkedIn, email, burger menu) are inlined SVG directly in `Portfolio.dc.html`
- `favicon.svg` is a separate file referenced via `<link rel="icon">`

## Naming Conventions

**Files:**
- Source page files: `{Name}.dc.html` (the `.dc.html` extension is the dc-runtime convention)
- `dist/index.html` is the exception — `Portfolio.dc.html` is renamed to `index.html` on deploy

**Sections:** `id="top"`, `id="about"`, `id="skills"`, `id="portfolio"`, `id="contact"` — lowercase, used as anchor targets in nav links

**Refs:** `camelCase` suffixed with `Ref` — `canvasRef`, `roleRef`, `progressRef`, `heroRef`, `cursorRingRef`

**State keys:** camelCase — `lang`, `sent`, `sending`, `sendError`, `menuOpen`

**Content keys:** nested object path matching section and field — `t.nav.about`, `t.hero.cta`, `t.contact.namePh`

## Where to Add New Code

**New page section** (e.g., testimonials, services):
- Add the HTML markup inside `<x-dc>` in `Portfolio.dc.html`, before `<!-- FOOTER -->`
- Add a new `<section id="sectionname" data-screen-label="...">` following the existing pattern
- Add `data-reveal` to elements that should animate in on scroll
- Add nav link in both desktop `<div class="nav-links">` and mobile `#nav-mobile-menu`
- Add content strings to both `CONTENT.de` and `CONTENT.en` objects in the JS block

**New page** (e.g., a case study):
- Create `{name}.dc.html` at project root with full `<x-dc>` structure
- Copy to `dist/{name}.dc.html`
- If clean URL needed, add a rewrite rule to `dist/.htaccess`

**New state field:**
- Add to `state = { ... }` in the Component class
- Expose in `renderVals()` return object
- Use via `{{ fieldName }}` in template

**New interactive subsystem** (e.g., a third-party widget):
- Add setup in `componentDidMount()`, store all handles on `this._*`
- Add cleanup in `componentWillUnmount()`
- Use a `ref="{{ myRef }}"` in the template to get the DOM node

**New font:**
- Add woff2 files to `fonts/` (and `dist/fonts/`)
- Add `@font-face` declarations to `fonts/fonts.css` (and `dist/fonts/fonts.css`)

---

*Structure analysis: 2026-06-23*
