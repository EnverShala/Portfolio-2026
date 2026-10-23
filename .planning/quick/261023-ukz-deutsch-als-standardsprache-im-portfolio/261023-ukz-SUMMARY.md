---
phase: quick-261023-ukz
plan: 01
status: complete
commits: [2a28fa5]
---

# Quick 261023-ukz: German default language + flag toggle

German is now the default (state.lang 'de', `<html lang="de">`, synced on mount and toggle). Both language toggle buttons (desktop and mobile) show an inline SVG flag (UK while German is active, DE while English is active) next to the label via `isDe` sc-if branches. dist/index.html mirrored byte-identically.

Both tasks were done in one commit (2a28fa5) because they touch the same files.

## Deviations
None. Browser verification was not run; only grep and cmp checks.
