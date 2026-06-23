# Stack

**Analysis Date:** 2026-06-23

## Runtime & Language

**Primary language:** HTML5 + CSS3 + vanilla JavaScript (ES2020+)

**Secondary language:** PHP 8+ — contact form mailer only (`dist/sendMail.php`)

**Runtime:** Browser (no Node.js, no server-side rendering). PHP runs on the Apache host solely for the `sendMail.php` endpoint.

**No package manager.** No `package.json`, `composer.json`, `requirements.txt`, or lockfile exists. All dependencies are either self-hosted files or loaded at runtime from unpkg CDN.

## Frameworks & Libraries

**dc-runtime (custom, self-contained):**
- Bundled as `support.js` — a single IIFE generated from `dc-runtime/src/*.ts` via `bun run build`
- Implements the `<x-dc>` declarative component system: parses `.dc.html` templates, compiles `{{ }}` interpolations, handles `<sc-for>`, `<sc-if>`, `<helmet>`, `<x-import>`, and `<dc-import>` tags
- Boots by dynamically loading React 18 from unpkg, then mounts to `#dc-root`
- Exposes `DCLogic` / `StreamableLogic` base class for component logic; logic classes use a React class-component lifecycle (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`, `renderVals`)
- Source: `support.js` (root) and `dist/support.js` (deployed copy)

**React 18.3.1 (runtime CDN load, not bundled):**
- Loaded dynamically by `support.js` from `https://unpkg.com/react@18.3.1/umd/react.production.min.js`
- SRI hash enforced: `sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z`
- ReactDOM loaded from `https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js`
- SRI hash enforced: `sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1`
- Used via UMD globals (`window.React`, `window.ReactDOM`) — NOT via npm

**@babel/standalone 7.26.4 (conditional CDN load):**
- Loaded on-demand by `support.js` only when an `<x-import>` tag references a `.jsx` or `.tsx` file
- URL: `https://unpkg.com/@babel/standalone@7.26.4/babel.min.js`
- Not loaded for this portfolio (no JSX x-imports in `Portfolio.dc.html`)

**`<image-slot>` custom web component:**
- Source: `image-slot.js` (root) and `dist/image-slot.js`
- Vanilla JS, no framework dependency
- Uses Shadow DOM (`mode: 'open'`), Custom Elements API, ResizeObserver, Pointer Events, Canvas 2D API
- Persists dropped images as WebP data-URLs in `.image-slots.state.json` sidecar via `window.omelette.writeFile` — only writable inside the Omelette design-tool; read-only on the live site
- Loaded via `<helmet><script src="image-slot.js"></script></helmet>` inside the dc template

## Build & Tooling

**No build step for the portfolio itself.** `Portfolio.dc.html` is authored directly; `dist/` files are its deployed copies.

**dc-runtime build (internal tooling only):**
- Source: `dc-runtime/src/*.ts` (TypeScript)
- Build command: `cd dc-runtime && bun run build`
- Output: `support.js` (self-contained IIFE) — do not edit `support.js` by hand

**Apache `.htaccess` (`dist/.htaccess`):**
- Disables directory listing (`Options -Indexes`)
- Clean URL rewrites: `/legalnotice` → `impressum.dc.html`, `/privacypolicy` → `datenschutz.dc.html`
- Blocks access to dotfiles (except `.image-slots.state.json`)
- Security headers: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- CSP allows `script-src 'self' https://unpkg.com 'unsafe-inline' 'unsafe-eval'` — required for React UMD + dc-runtime's `eval`-based logic execution

## Fonts & Assets

**Self-hosted web fonts (no Google Fonts or other CDN):**
All font files live in `fonts/` (root, mirrored in `dist/fonts/`) and are declared in `fonts/fonts.css` with `font-display: swap`.

| Family | Weights | Files |
|--------|---------|-------|
| Manrope | 400, 500, 600, 700 | `Manrope-{weight}-latin.woff2` + `latin-ext.woff2` |
| Space Grotesk | 400, 500, 600, 700 | `SpaceGrotesk-{weight}-latin.woff2` + `latin-ext.woff2` |
| JetBrains Mono | 400, 500 | `JetBrainsMono-{weight}-latin.woff2` + `latin-ext.woff2` |

**Font usage in the portfolio:**
- `Manrope` — body text, primary UI font (`font-family: 'Manrope', system-ui, sans-serif`)
- `Space Grotesk` — nav logo, headings
- `JetBrains Mono` — nav language toggle button, monospace labels

**Static assets:**
- `assets/profile.png` — hero section profile photo (also at `dist/assets/profile.png`)
- `uploads/rund.PNG` — secondary image asset (also at `dist/uploads/rund.PNG`)
- `favicon.svg` — SVG favicon (root and `dist/favicon.svg`)
- `robots.txt` — search engine directives (root and `dist/robots.txt`)

## Deployment

**Host:** Apache shared hosting at `https://enver-shala.de`
- PHP mailer runs server-side at `dist/sendMail.php` (same-origin POST endpoint)
- No CDN/proxy layer by default (`$behindProxy = false`; Cloudflare support coded but disabled)

**Git repository:** `github.com/EnverShala/Portfolio-2026` (branch: `main`)

**Dist root:** `dist/` is the Apache document root. The `dist/` files are the deployed versions of their repo-root counterparts.

---

*Stack analysis: 2026-06-23*
