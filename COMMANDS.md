# Project Commands

## Preview JSX (live local server)

```bash
bash ../jsxpreviewer/jsxpreview.sh uzbekistan-dashboard.jsx
```

- Opens http://127.0.0.1:7743 in browser
- Watches file for changes — hit ⌘R after each save
- Ctrl+C to stop
- Replace filename with any other dashboard JSX

---

## Export JSX → static HTML

```bash
python3 jsx_to_html.py uzbekistan-dashboard.jsx
```

- Writes `dashboards/uzbekistan.html`
- Requires Python 3.9+ and Node.js
- npm packages auto-installed on first run into `~/.jsx_to_html_cache/`
- Install BeautifulSoup first time: `pip3 install beautifulsoup4`

---

## Syntax check (must return zero results before committing)

```bash
grep -n 'value:"\|sub:"\|accent:"\|label:"' dashboards/uzbekistan-dashboard.jsx
```

---

## Open diff vs. git HEAD in Beyond Compare

### Single file
```bash
git show HEAD:dashboards/uzbekistan-dashboard.jsx > /tmp/git_uz.jsx
"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_uz.jsx /Users/almir/Projects/iAlmirProHome/dashboards/uzbekistan-dashboard.jsx &
```

### All three MD reference files at once
```bash
git show HEAD:dashboards/dashboard-design-system.md  > /tmp/git_dds.md
git show HEAD:dashboards/at-a-glance-instructions.md > /tmp/git_aag.md
git show HEAD:dashboards/country-map-instructions.md > /tmp/git_cmi.md

"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_dds.md /Users/almir/Projects/iAlmirProHome/dashboards/dashboard-design-system.md &
"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_aag.md /Users/almir/Projects/iAlmirProHome/dashboards/at-a-glance-instructions.md &
"/Users/almir/Applications/Beyond Compare.app/Contents/MacOS/bcomp" /tmp/git_cmi.md /Users/almir/Projects/iAlmirProHome/dashboards/country-map-instructions.md &
```

---

## Git

### Push to GitHub Pages
```bash
git add .
git commit -m "your message"
git push
```

Site live at https://ialmirpro.github.io within ~60 seconds.

### Check what's staged
```bash
git status
git diff --staged
```

### Unstage a file
```bash
git restore --staged dashboards/somefile.jsx
```

### Copy dashboard to new version before editing
```bash
cp dashboards/uzbekistan-dashboard-v1.jsx dashboards/uzbekistan-dashboard-v2.jsx
```
