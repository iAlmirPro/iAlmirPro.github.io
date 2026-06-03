# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal website at **https://ialmirpro.github.io** — plain static HTML, no build tools, no framework. Push to `main` and GitHub Pages serves it within ~60 seconds.

```
index.html   — landing page
style.css    — dark header, firebrick accent
script.js    — auto-updating copyright year
dashboards/  — country data dashboards (JSX source → compiled HTML)
```

## Deployment

```bash
git add .
git commit -m "your message"
git push
```

A GitHub Action (`cache-bust.yml`) automatically rewrites the `style.css?v=` query string in `index.html` to the git SHA on every push that touches `style.css`.

## Dashboard workflow

Country dashboards live in `dashboards/`. Each is authored as React JSX, then compiled to a self-contained static HTML file:

```bash
# Convert JSX to HTML (requires Python 3.9+ and Node.js)
pip3 install beautifulsoup4   # first time only
python3 dashboards/jsx_to_html.py dashboards/[country]-dashboard.jsx
# → writes dashboards/[country].html
```

npm packages for the renderer are auto-installed on first run into `~/.jsx_to_html_cache/`.

**After generating any JSX file, run this syntax check — must return zero results:**
```bash
grep -n 'value:"\|sub:"\|accent:"\|label:"' dashboards/[file].jsx
```

## Dashboard design rules

The single source of truth for all dashboard design is **`dashboards/dashboard-design-system.md`**. Read it before touching any dashboard file. Key rules:

### Approval protocol
- **Never make changes without explicit final approval.** Always propose first, describe in plain language, wait for confirmation, then act.
- A reported problem is a *finding*, not a work order. Respond: "I can see [X]. I would fix it by [Y]. Shall I proceed?"
- One approved task at a time — do not chain unrequested changes.
- Never change anything not explicitly requested.

### Versioning
- Every meaningful change → new version: `v1 → v2 → v3…`
- Never overwrite an existing version — copy first, then edit.
- Always present the `.jsx` file after each version.

### New country checklist
1. Copy `kyrgyzstan-dashboard.jsx` as `[country]-dashboard-v1.jsx`
2. Update the `C` color palette using country-code prefix (e.g. `kaz`, `uz`, `tj`, `tm`) — never use codes that clash (`ir` = Ireland)
3. Update `Flag` SVG, hero H1/eyebrow/description
4. Replace all data section by section — **every single value must be confirmed via web search before writing** (see Data Verification Standard in dashboard-design-system.md). No assumptions, no training knowledge, no test data. Values that cannot be confirmed must be marked `est.; unverified` in their sub/label field.
5. Run duplicate check: visual component takes priority over table row; remove table row if duplicated
6. Run color audit: max 2 colored KpiCards per section
7. Add `GradientBar` and `AgeBar` at required placements (§2 Climate, §3 Population Growth, §8 Tourism, §10 Fiscal)
8. Run syntax check (grep command above)

### Color system
`red` (`#E8192C`) and `blu` (`#2E86DE`) are mandatory in every palette — they drive Record High/Low KpiCard accents. Record High temperature always uses `accent={C.red}`, Record Low always uses `accent={C.blu}`.

### CSS safety
- Scope the row gap override to `.row.g-1` **only** — never `.row` globally (kills Bootstrap `gy-*` on mobile)
- Never change `gy-3` to `gy-2` on panel rows (removes mobile gap between panels)

### JSX syntax
JSX props use `=`, not `:`. `<KpiCard value="$17.5B" />` not `<KpiCard value:"$17.5B" />`.
