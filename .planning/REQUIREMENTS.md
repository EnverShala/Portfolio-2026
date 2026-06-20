# Requirements — Portfolio 2026

## v1 Requirements

### Design

- [ ] **DES-01**: Design polish pass — specific visual tweaks applied once user has reviewed the live site and communicated changes
- [ ] **DES-02**: Visual consistency — CSS tokens used consistently, no duplicate hex values

### Content & Links

- [ ] **CNT-01**: All six portfolio project buttons (Live-Test + Github for Join, El Pollo Loco, Pokèdex) point to real URLs
- [ ] **CNT-02**: GitHub and LinkedIn social icons in hero and footer point to real profile URLs
- [ ] **CNT-03**: Project screenshot images present for all three portfolio cards
- [ ] **CNT-04**: `<title>` and `<meta name="description">` set in `<helmet>` block
- [ ] **CNT-05**: Favicon present and linked

### Functionality

- [ ] **FNC-01**: Contact form delivers submissions via Formspree or EmailJS (user receives email)
- [ ] **FNC-02**: Language toggle preference persisted in localStorage (survives page reload)

### Legal / Compliance

- [ ] **LEG-01**: Impressum page exists and is linked from footer (German TMG §5)
- [ ] **LEG-02**: Privacy policy page exists and is linked from contact form checkbox (GDPR)

---

## v2 (Deferred)

- Merge dual RAF loops into single animation frame
- Add `prefers-reduced-motion` check for canvas animation
- Passive event listener on mousemove
- Testimonials section (content exists in CONTENT object)
- 404 / error page (requires server config)
- Split Portfolio.dc.html into separate modules
- Replace CDN React with local bundle

---

## Out of Scope

- Backend / SSR — static file only; no server
- CMS / admin UI — content editing stays in Portfolio.dc.html
- Multiple pages / routing — single-page scroll only
- Build toolchain — DC Runtime zero-build constraint

---

## Traceability

| REQ-ID | Phase | Status |
|--------|-------|--------|
| DES-01 | Phase 1 | Pending |
| DES-02 | Phase 1 | Pending |
| CNT-01 | Phase 2 | Pending |
| CNT-02 | Phase 2 | Pending |
| CNT-03 | Phase 2 | Pending |
| CNT-04 | Phase 2 | Pending |
| CNT-05 | Phase 2 | Pending |
| FNC-01 | Phase 2 | Pending |
| FNC-02 | Phase 2 | Pending |
| LEG-01 | Phase 3 | Pending |
| LEG-02 | Phase 3 | Pending |
