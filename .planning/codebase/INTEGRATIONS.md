# External Integrations

**Analysis Date:** 2026-06-20

## APIs & External Services

**Contact form:**
- No backend API. The form submit handler (`onSubmit`) calls `e.preventDefault()` and sets `sent: true` — it does NOT actually send data anywhere. There is no email API, no form service (e.g. Formspree, EmailJS), and no server endpoint.
- Email link is constructed client-side: `window.location.href = 'mailto:' + ['envershala1989', 'gmail.com'].join('@')` — triggers the user's local mail client.

**No analytics, no tracking, no auth services detected.**

## CDN / Asset Sources

**React (loaded by `support.js` at runtime):**
- `https://unpkg.com/react@18.3.1/umd/react.production.min.js`
  - SRI: `sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z`
- `https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js`
  - SRI: `sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1`
- Both loaded with `crossOrigin="anonymous"` and `async=false` by the dc-runtime boot sequence inside `support.js`

**Babel (conditionally loaded by `support.js` for x-import JSX modules):**
- `https://unpkg.com/@babel/standalone@7.26.4/babel.min.js`
- Only loaded if an `<x-import>` tag referencing a `.jsx` or `.tsx` file is used. Not used in the current portfolio template.

**Google Fonts:**
- Preconnect: `https://fonts.googleapis.com`, `https://fonts.gstatic.com` (crossorigin)
- Stylesheet: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap`
- Declared in `Portfolio.dc.html` inside `<helmet>` (injected into `<head>` at runtime)

**Local assets:**
- `assets/profile.png` — profile photo, served locally. Used by `<image-slot id="hero-photo">` and `<image-slot id="about-photo">`.

## Third-party Scripts

**`support.js` (local, but internally loads from CDN):**
- This is the dc-runtime bundle, served locally from the project root.
- At runtime it fetches React and ReactDOM from unpkg (see above).
- Also conditionally fetches Babel standalone from unpkg if JSX x-imports are used.

**`image-slot.js` (local):**
- Pure vanilla JS custom element. No third-party scripts loaded.

**No other third-party scripts (no analytics snippet, no chat widget, no cookie banner, no social SDK).**

## Environment / Config

**No environment variables.** The project has no `.env` file, no config file, and no feature flags system.

**Runtime config surface:**
- `window.omelette` — optional host bridge provided by the omelette design tool environment. When present, enables `writeFile` (persisting `.image-slots.state.json`) and marks image slots as editable. When absent (plain browser), slots are read-only and sidecar writes are silently skipped.
- `window.React` / `window.ReactDOM` — expected on `window` after unpkg scripts load; dc-runtime throws if they are missing.
- `window.Babel` — expected if JSX x-imports are used; loaded on demand.

**Sidecar state file:**
- `.image-slots.state.json` — written to project root by `image-slot.js`. Stores base64 WebP data URLs and crop/pan/zoom state per image slot id. Not a config file; generated at runtime by the design tool.

**No secrets, no API keys, no auth tokens in any project file.**

## Summary

The portfolio has two external CDN dependencies that load at runtime: Google Fonts (for typography) and unpkg (for React 18 UMD bundles loaded by the dc-runtime). All other functionality — layout, animations, language toggle, contact form — is self-contained with no backend, no analytics, and no third-party service integrations. The contact form does not submit data; it opens the user's mail client via a `mailto:` link.

---

*Integration audit: 2026-06-20*
