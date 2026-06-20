# Portfolio 2026 — Enver Shala / Vizionists

## What This Is

A personal portfolio site for Enver Shala (Vizionists), built as a single-page DC Runtime
application. It showcases web development projects, skills, and a contact form in a bilingual
(DE/EN) dark-themed layout with animated background and smooth scroll interactions. The site
is deployed as a static file — no backend, no build step.

## Core Value

A portfolio that looks sharp and reflects the quality of the work it showcases — visitors
should immediately trust the designer/developer behind it.

## Requirements

### Validated

- ✓ Bilingual toggle (DE / EN) with full content translation — existing
- ✓ Animated canvas dot-grid background with mouse-reactive glow cursor — existing
- ✓ Hero section with typewriter role titles and parallax depth — existing
- ✓ Skills section — existing
- ✓ Portfolio section with three project cards and image-slot drop zones — existing
- ✓ Contact form UI (name, email, message, privacy checkbox, success state) — existing
- ✓ Scroll reveal animations and progress bar — existing
- ✓ Dark design system with CSS tokens (--bg, --green, --surface, --border) — existing

### Active

- [ ] Design polish pass — specific tweaks TBD (user reviews live site first)
- [ ] Real project URLs on all Live-Test / Github buttons (Join, El Pollo Loco, Pokèdex)
- [ ] Real GitHub and LinkedIn profile links in hero and footer
- [ ] Project screenshot images added back to all three portfolio cards
- [ ] Contact form wired to email delivery (Formspree or EmailJS)
- [ ] `<title>` and `<meta name="description">` for SEO
- [ ] Favicon
- [ ] Language preference persisted via localStorage
- [ ] Impressum page (German TMG §5 compliance)
- [ ] Privacy policy page (GDPR compliance for contact form)

### Out of Scope

- Backend / server-side rendering — site stays static (zero-build DC Runtime)
- CMS or admin panel — content lives in Portfolio.dc.html (acceptable for now)
- Multiple pages / routing — single scrollable page only
- 404 page — not possible without server config; deferred
- React bundle switch (CDN → local) — runtime constraint, deferred
- Testimonials section — content exists but section is not planned for v1

## Context

- **Runtime:** DC Runtime (`support.js`, generated artifact — source TypeScript not in repo).
  All logic, markup, and styles live in `Portfolio.dc.html` (604 lines, single component).
- **Codebase map:** `.planning/codebase/` — full analysis written 2026-06-20.
- **Concerns backlog:** `.planning/codebase/CONCERNS.md` — comprehensive list of technical
  debt, dead code, and missing features. These are intentionally deferred until design is
  approved by the user.
- **No tests** — zero test coverage; expected for this type of project.
- **All CSS inline** — design changes require touching scattered `style=""` attributes.
  Known friction; acceptable for current scale.

## Constraints

- **Tech stack:** DC Runtime + React 18 (CDN) — do not introduce a build toolchain
- **Single file:** keep the portfolio as one `.dc.html` file; no new pages unless Impressum/
  privacy policy are created as separate `.html` files
- **No backend:** all third-party integrations must be client-side API calls

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Design polish before fixing concerns | User wants to be happy with the look first; fixing broken links in a design they'll change wastes effort | — Pending |
| Defer all CONCERNS.md items to Phase 2+ | Concerns are correctness/compliance issues, not design — wrong order to fix them first | — Pending |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-20 after initialization*
