# Integrations

**Analysis Date:** 2026-06-23

## External Services

**GitHub (`github.com/EnverShala`):**
- Linked from the portfolio hero and about sections as a social profile link
- Target: `https://github.com/EnverShala` (opens in new tab, `rel="noopener noreferrer"`)
- No API calls — static hyperlink only

**LinkedIn (`linkedin.com/in/enver-shala-developer`):**
- Linked from the about section as a social profile link
- Target: `https://www.linkedin.com/in/enver-shala-developer/` (opens in new tab, `rel="noopener noreferrer"`)
- No API calls — static hyperlink only

**Email (Gmail, obfuscated):**
- Contact address `envershala1989@gmail.com` is assembled at runtime in JavaScript to avoid scraping:
  `window.location.href = 'mailto:' + ['envershala1989', 'gmail.com'].join('@')`
- The same address is the recipient in `dist/sendMail.php` (`$recipient = 'envershala1989@gmail.com'`)
- PHP mailer From address: `portfolio-no-reply@enver-shala.de`

## APIs & Backends

**Contact form — PHP mailer (`dist/sendMail.php`):**
- Accepts `POST application/json` with `{ name, email, message, website }` (website is honeypot)
- Sends plain-text email via PHP's native `mail()` function (no SMTP library, no Mailgun/SendGrid)
- Rate limiting: 3 requests per 10 minutes per IP, file-based (no database required), stored in `sys_get_temp_dir()`
- CORS restricted to `['https://enver-shala.de', 'https://www.enver-shala.de']`
- Returns `{ success: true }` or `{ error: "..." }` JSON
- No external mail service dependency — relies on the hosting provider's `sendmail`/MTA

**No other backend API.** The site is otherwise fully static.

## Third-party Scripts

**React 18.3.1 (loaded at runtime from unpkg CDN):**
- `https://unpkg.com/react@18.3.1/umd/react.production.min.js`
  - SRI: `sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z`
- `https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js`
  - SRI: `sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1`
- Loaded dynamically by `support.js` before `init()` runs. SRI enforced via `script.integrity` attribute — the browser will refuse to execute if the hash does not match.

**@babel/standalone 7.26.4 (conditional, not loaded in production portfolio):**
- `https://unpkg.com/@babel/standalone@7.26.4/babel.min.js`
- Only fetched when `support.js` encounters an `<x-import>` pointing to a `.jsx` or `.tsx` file. No such imports exist in `Portfolio.dc.html`, so Babel is never loaded on the live site.

**No analytics, tracking, or monitoring scripts.** No Google Analytics, no Hotjar, no Sentry, no tag managers.

## Hosting & CDN

**Hosting provider:** Apache shared host
- Domain: `enver-shala.de` (and `www.enver-shala.de`)
- Document root: `dist/` directory contents
- PHP available server-side for `sendMail.php`
- No reverse proxy or CDN layer in front (Cloudflare support is coded but disabled — `$behindProxy = false`)

**Font delivery:** Self-hosted (no CDN). All `.woff2` files are served from `dist/fonts/` on the same Apache host.

**Image delivery:** Self-hosted. Profile photo (`dist/assets/profile.png`) and other images (`dist/uploads/rund.PNG`) are served from the same host.

**unpkg.com (CDN for React only):**
- Used exclusively to load React 18 UMD bundles at page boot
- Governed by the CSP allowlist: `script-src 'self' https://unpkg.com ...`
- If unpkg is unavailable, `support.js` will throw and the page will not render

**GitHub:** Repository hosting only (`github.com/EnverShala/Portfolio-2026`). Not used as a CDN or Pages host.

---

*Integration audit: 2026-06-23*
