# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal website at **https://ialmirpro.github.io** — plain static HTML, no build tools, no framework. Push to `main` and GitHub Pages serves it within ~60 seconds.

```
index.html   — single-page landing site (sections: hero, about, experience, skills, certifications, interests, gallery, projects, dashboards, contact)
style.css    — dark header, firebrick accent; loaded only by index.html (Bootstrap 5.3 comes from the jsDelivr CDN)
script.js    — copyright year, mobile-nav close, scroll-spy nav highlight, touch tap-to-reveal for gallery tiles
projects/    — standalone project write-ups (own inline <style>, do not use style.css); linked from the #projects section
dashboards/  — country data dashboards (JSX source → compiled HTML) + design docs; linked from the #dashboards section
tools/       — dashboard tooling (jsx_to_html.py, fetch_dashboard_data.py + fetch_config.json, jsxpreviewer/)
data/        — gitignored (local only); fetcher output lands here
bikes.md     — unrelated personal motorcycle comparison notes (German); not part of the site
```

The `#gallery` and `#dashboards` sections in `index.html` carry `d-none` — they exist in the markup but are hidden on the live site. Dashboard pages are still reachable by direct URL. Adding a new dashboard means adding a `.dash-card` link (with `--accent` colour) in `#dashboards` in addition to producing the HTML.

## Local preview

No build step. For the landing page, serve the repo root statically (this is what `.claude/launch.json` does):

```bash
python3 -m http.server 8743
```

## Deployment

```bash
git add .
git commit -m "your message"
git push
```

A GitHub Action (`cache-bust.yml`) rewrites the `style.css?v=` query string in `index.html` to the git SHA on every push to `main` that touches `style.css`, then **commits that change back to `main`** (`chore: cache-bust CSS → <sha>`). After pushing a `style.css` change, `git pull --rebase` before the next push or it will be rejected. Don't edit the `?v=` value by hand. The workflow only rewrites `index.html`; other pages don't reference `style.css`.

## Dashboard workflow

Country dashboards live in `dashboards/`. Each is authored as React JSX, then compiled to a self-contained static HTML file.

Pipeline: `tools/fetch_dashboard_data.py` (→ `data/`, gitignored) → values hand-patched into `[country]-dashboard.jsx` via the Gate process → `tools/jsxpreviewer` for live preview → `tools/jsx_to_html.py` writes `[country].html` next to the JSX (the `-dashboard` suffix is stripped; React and the D3 map are rendered to static markup at compile time). Both the `.jsx` and the compiled `.html` are committed — recompile and commit both after any JSX change. The jsxpreviewer vendors React, Babel, D3 and Bootstrap locally (`tools/jsxpreviewer/*.min.js`), so it works offline; `__bundle.jsx` there is a gitignored build artifact.

**Live preview (run from `dashboards/` directory):**
```bash
bash ../tools/jsxpreviewer/jsxpreview.sh [country]-dashboard.jsx
# Opens http://127.0.0.1:7743 — watches file; hit ⌘R after each save; Ctrl+C to stop
```

**Compile JSX → static HTML (run from `dashboards/` directory):**
```bash
pip3 install beautifulsoup4   # first time only
python3 ../tools/jsx_to_html.py [country]-dashboard.jsx
# → writes dashboards/[country].html
# Requires Python 3.9+ and Node.js; npm packages auto-installed to ~/.jsx_to_html_cache/
```

**After generating any JSX file, run this syntax check — must return zero results:**
```bash
grep -n 'value:"\|sub:"\|accent:"\|label:"' dashboards/[file].jsx
```

**Diff a file against git HEAD in Beyond Compare:**
```bash
git show HEAD:dashboards/[file].jsx > /tmp/git_[file].jsx
"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_[file].jsx dashboards/[file].jsx &
```

**Diff all three reference docs at once (run from repo root):**
```bash
git show HEAD:dashboards/dashboard-design-system.md  > /tmp/git_dds.md
git show HEAD:dashboards/at-a-glance-instructions.md > /tmp/git_aag.md
git show HEAD:dashboards/country-map-instructions.md > /tmp/git_cmi.md
"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_dds.md dashboards/dashboard-design-system.md &
"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_aag.md dashboards/at-a-glance-instructions.md &
"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_cmi.md dashboards/country-map-instructions.md &
```

**Fetch data constants from public APIs (run from repo root):**
```bash
python3 tools/fetch_dashboard_data.py [ISO2 or ISO3]   # e.g. BIH or BA
```
Pulls ~180 constants from World Bank, IMF, WHO, Wikidata, Open-Meteo, and others — no API key required. Output values carry `state: 1` (automated). See script header for full source list.
- `data/<iso3>_data.json` — full raw API data (~170 points)
- `data/<iso3>_patch.txt` — compact patch sheet used during the Gate process (`grp:id · value · source · ①/✗`)

All five indexes (TI CPI, Freedom House, RSF, GPI, WJP) are auto-fetched. Update URLs in `tools/fetch_config.json` once a year after each publishes. See `dashboards/dashboard-design-system.md` → "Annual index URL updates" for the schedule.

## Dashboard design rules

The single source of truth for all dashboard design is **`dashboards/dashboard-design-system.md`**. Read it before touching any dashboard file (`dashboards/MUST-READ-FIRST.md` says the same: read the design system before any other file in that folder). It also holds a "Known mistakes" log — check it for recurring JSX pitfalls (e.g. the `EraTimeline` base-year, unescaped apostrophes in single-quoted strings, `ERA_TOTAL`/`ERAS.title`/`ERAS.note` that sit outside `const ERAS`). Key rules:

### Approval protocol
- **Never make changes without explicit final approval.** Always propose first, describe in plain language, wait for confirmation, then act.
- A reported problem is a *finding*, not a work order. Respond: "I can see [X]. I would fix it by [Y]. Shall I proceed?"
- One approved task at a time — do not chain unrequested changes.
- Never change anything not explicitly requested.

### Versioning
- Every meaningful change → new version: `v1 → v2 → v3…`
- Never overwrite an existing version — copy first, then edit.
- Always present the `.jsx` file after each version.
- The committed dashboards are the unversioned "final" files (`[country]-dashboard.jsx`, as in the BIH `v1→final` rename); `-vN` copies are working drafts. `jsx_to_html.py` only strips a trailing `-dashboard.jsx`, so a `x-dashboard-v2.jsx` draft compiles to `x-dashboard-v2.html` — rename to the final `x-dashboard.jsx` name before publishing.

### Pre-build declaration (new country — output this first, then stop)

```
Pre-build declaration: [country]
Gate process: will execute G1→G5 per constant, outputting status line before writing the constant
No constant will be written until it clears Gate 5
Constants will be built and artifact updated one at a time
```

Any output produced without this appearing first is invalid.

### New country checklist
1. Copy the most recently modified dashboard (by filesystem date) verbatim as `[country]-dashboard-v1.jsx` — do not retype, copy the file
2. Update the `C` color palette using **ISO 3166 Alpha-3 lowercase** prefix (e.g. `kaz`, `uzb`, `tjk`, `tkm`) — never 2-letter codes (clash risk)
3. Update `Flag` SVG, `valColor` function, template color keys, map values, header H1/eyebrow/description, footer sources
4. Replace all data constants one at a time in this order: ERAS → TILES → GEO/GEO_TERRAIN/GEO_WATER/GEO_REGIONS → CLIMA_* → POP_* → ECON_* → EMP_* → EDU_* → POL_* → TOUR_* → VITA_* → HEALTH_* → ENERGY_* → INFRA_* → SOCIAL_* → ENV_* → BIZ_* → FISCAL_* → CRIME_*
5. **Every single value must be confirmed via web search before writing** (see Data Verification Standard in `dashboard-design-system.md`). Set `state` on every item: `2` = manually web-searched & verified (source cited), `1` = API/script fetched (automated), `0` = not yet verified, `-1` = NOT verified (training knowledge / assumed). Values that cannot be confirmed must be marked `est.; unverified` in their sub/label field.
6. After each constant clears Gate 5, output: `[constant name] done. Next per checklist: [next constant name].` then end the turn.
7. Run duplicate check: visual component takes priority over table row; remove table row if duplicated
8. Run color audit: max 2 colored KpiCards per section
9. Add `GradientBar` and `AgeBar` at required placements (§2 Climate, §3 Population Growth, §8 Tourism, §10 Fiscal)
10. Run Inconsistency Check Protocol — verify values shared across constants match
11. Run syntax check (grep command above)

### Color system
`red` (`#E8192C`) and `blu` (`#2E86DE`) are mandatory in every palette — they drive Record High/Low KpiCard accents. Record High temperature always uses `accent={C.red}`, Record Low always uses `accent={C.blu}`.

### CSS safety
- Scope the row gap override to `.row.g-1` **only** — never `.row` globally (kills Bootstrap `gy-*` on mobile)
- Never change `gy-3` to `gy-2` on panel rows (removes mobile gap between panels)

### JSX syntax
JSX props use `=`, not `:`. `<KpiCard value="$17.5B" />` not `<KpiCard value:"$17.5B" />`.

## Dashboard reference files

Always read these before building or updating their respective sections:

- `dashboards/at-a-glance-instructions.md` — At-a-Glance section structure, tile anatomy, icons, map tile
- `dashboards/country-map-instructions.md` — D3 choropleth map component: projection, colours, label positioning

## Notes on other files

- `COMMANDS.md` — quick-reference cheat sheet, but contains **stale paths** (missing `tools/` prefix). Trust `CLAUDE.md` over it.

## Username rename

If the GitHub username changes, see `README.md` for the full checklist of what GitHub handles automatically vs. what must be updated manually (local remotes, hardcoded links, external services).
