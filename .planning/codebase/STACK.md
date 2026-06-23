# Technology Stack

**Analysis Date:** 2026-06-23

## Languages

**Primary:**
- HTML5 — three `.dc.html` page files (`Portfolio.dc.html`, `impressum.dc.html`, `datenschutz.dc.html`)
- JavaScript (ES2020+, class syntax, async/await) — all client logic in `.dc.html` `<script data-dc-script>` blocks and in `support.js` / `image-slot.js`
- PHP 8+ — server-side contact form handler (`sendMail.php`)

**Secondary:**
- CSS — global resets, keyframes, responsive breakpoints in `<helmet><style>` blocks; font declarations in `fonts/fonts.css`; no TypeScript in source files

## Runtime

**Client:**
- Browser only — no Node.js, no build step required
- React 18.3.1 — UMD build, loaded from `https://unpkg.com` by `support.js` at boot with SRI hash verification

**Server:**
- PHP (version unspecified) — required only for `sendMail.php`. Uses `mail()` — host must have an MTA configured.
- Apache — `.htaccess` present with `mod_headers` and `mod_rewrite` directives

**Package Manager:**
- None — zero npm dependencies at the project level; no lockfile

## Frameworks & Libraries

**Core rendering engine:**
- `dc-runtime` (pre-compiled into `support.js`) — proprietary Design Component runtime built on React 18. Provides `<x-dc>`, `<sc-for>`, `<sc-if>`, `<helmet>`, `{{ }}` interpolation, and a `DCLogic` base class for component state.
  - Comment at top of `support.js`: `// GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with cd dc-runtime && bun run build.`
  - Source not present in this repo.

**React (CDN, runtime dependency):**
- React 18.3.1 — `https://unpkg.com/react@18.3.1/umd/react.production.min.js` (SRI verified)
- ReactDOM 18.3.1 — `https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js` (SRI verified)

**Custom Elements:**
- `<image-slot>` — defined in `image-slot.js`; drag-and-drop photo placeholder with design-tool sidecar persistence

## Build & Tooling

**Build:** None at the project level. `support.js` is a pre-compiled artifact. Pages are served directly from `.dc.html` source files (or `dist/` copies).

**Task runner:** None

**Deployment output:** `dist/` directory mirrors the project root with compiled copies of all pages, assets, fonts, and scripts. `dist/index.html` is the served entry point.

## Styling

**Approach:** Mixed — `<style>` block inside each page's `<helmet>` tag provides global resets, CSS custom properties (design tokens), keyframes, and responsive breakpoints. Element-level layout and decoration use inline `style=""` attributes. No CSS preprocessor, no utility framework, no CSS-in-JS.

**Fonts:** Self-hosted `.woff2` files in `fonts/` directory, declared in `fonts/fonts.css` with `font-display: swap`. No external CDN for fonts.
- `Space Grotesk` — weights 400/500/600/700 (headings, nav brand)
- `Manrope` — weights 400/500/600/700 (body text, form inputs)
- `JetBrains Mono` — weights 400/500 (monospace labels, tags, social icons)

**Design system:** Custom, dark theme (`#070a0b` background, `#34d399` green accent). No third-party design system.

**Design tokens (CSS custom properties):**
- Defined inline on the root `<div>`: `--bg`, `--surface`, `--surface2`, `--border`, `--text`, `--muted`, `--green`, `--green-rgb`, `--purple`, `--purple-rgb`

## Data & State

**Component state:**
- `DCLogic`-subclass `this.state` object: `{ lang, sent, sending, sendError, menuOpen }`
- Mutations via `this.setState()`; no external store

**Contact form backend:**
- `sendMail.php` — accepts `POST application/json`, validates input, sends via PHP `mail()` to `envershala1989@gmail.com`
- Honeypot field (`website`) for spam filtering
- File-based rate limiting: 3 requests per 10 minutes per IP (temp dir JSON sidecar)

**Storage:**
- `image-slot.js` persists dropped images as base64 WebP in `.image-slots.state.json` via `window.omelette.writeFile` (design-tool host only; falls back silently in production)
- No localStorage, sessionStorage, cookies, or database

**Content:**
- All copy and translations hardcoded as `CONTENT` object inside `<script data-dc-script>` in each `.dc.html` file
- Bilingual DE/EN with runtime toggle via `toggleLang()`

## Security

**Server headers (`.htaccess`):**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy: default-src 'none'; script-src 'self' https://unpkg.com 'unsafe-inline'; ...`
- Directory listing disabled (`Options -Indexes`)
- Dotfile access blocked

**`sendMail.php` defenses:**
- CORS restricted to `https://enver-shala.de` and `https://www.enver-shala.de`
- Honeypot anti-bot field
- File-based rate limiting per IP
- Header injection prevention (CR/LF stripping)
- Email format validation (`FILTER_VALIDATE_EMAIL`)
- Length limits on all fields

## Summary

Multi-page static portfolio (three `.dc.html` pages + `dist/` compiled output) served on Apache/PHP hosting. All client rendering is browser-only via the dc-runtime (React 18 from CDN). The contact form has a real PHP backend (`sendMail.php`). Fonts are self-hosted woff2 files. No build tool, no package manager, no JS framework at the project level.

---

*Stack analysis: 2026-06-23*
