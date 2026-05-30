#!/usr/bin/env python3
"""
jsx_to_html.py  —  Convert a country dashboard JSX to pure static HTML.

Usage:    python3 jsx_to_html.py path/to/dashboard.jsx
Output:   path/to/dashboard.html  (same folder)

Requirements:
  - Python 3.9+  →  pip3 install beautifulsoup4
  - Node.js (modern)
  - npm  (packages auto-installed on first run into ~/.jsx_to_html_cache/)
"""

import sys, os, re, json, shutil, subprocess

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("❌  Run: pip3 install beautifulsoup4")
    sys.exit(1)

# ── npm packages needed by the Node renderer ──────────────────────────────────
NPM = ["@babel/core", "@babel/plugin-transform-react-jsx", "react", "react-dom"]

# ── Node.js: compile JSX → renderToStaticMarkup → pure HTML ──────────────────
NODE_SCRIPT = r"""
const babel = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const fs = require('fs');

const src = fs.readFileSync(process.argv[2], 'utf8')
  .replace(/const\s*\{[^}]+\}\s*=\s*React;/, '')
  .replace('export default function', 'function')
  .replace(/useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[\s*\]\s*\)/g, '');

const js = babel.transformSync(src, {
  plugins: ['@babel/plugin-transform-react-jsx'], filename: 'dashboard.jsx'
}).code;

const fn = [...js.matchAll(/^function (\w+)\(/mg)].at(-1)[1];
const Component = new Function('require','React', js + '\nreturn ' + fn + ';')(require, React);

fs.writeFileSync(process.argv[3], renderToStaticMarkup(React.createElement(Component)), 'utf8');
console.log('OK');
"""

# ── Helpers ───────────────────────────────────────────────────────────────────
def line_start(html, pos):
    return html.rfind("\n", 0, pos) + 1

def line_indent(html, pos):
    ls = line_start(html, pos)
    ln = html[ls:html.find("\n", ls)]
    return ln[:len(ln) - len(ln.lstrip())]

def ensure_npm(cache):
    if os.path.isdir(os.path.join(cache, "node_modules", "@babel", "core")):
        print("✓  npm packages ready")
        return
    print("📦  Installing npm packages (first run only)...")
    with open(os.path.join(cache, "package.json"), "w") as f:
        json.dump({"name": "jsx-converter", "version": "1.0.0", "private": True}, f)
    r = subprocess.run(["npm", "install", "--save"] + NPM, cwd=cache,
                       capture_output=True, text=True)
    if r.returncode != 0:
        print("❌  npm install failed:\n" + r.stderr); sys.exit(1)
    print("✓  npm packages installed")

def beautify_html(html):
    pretty = BeautifulSoup(html, 'html.parser').prettify()
    result = []
    for line in pretty.split('\n'):
        s = line.lstrip(' ')
        result.append('  ' * (len(line) - len(s)) + s)
    return '\n'.join(result)

def inject_comments(html, sections, panels):
    inserts = []

    # Section comments — anchor on SectionHeader div
    sec_pat = re.compile(r'<div style="[^"]*margin-bottom:28px;padding-top:24px[^"]*">')
    for i, (label, _) in enumerate(sections):
        hits = list(sec_pat.finditer(html))
        if i >= len(hits): break
        pos = hits[i].start()
        ls  = line_start(html, pos)
        ind = line_indent(html, pos)
        bar = f"{ind}<!-- " + "*" * 51 + " -->"
        cmt = f"{bar}\n{ind}<!-- {label.upper():<51} -->\n{bar}\n"
        inserts.append((ls, cmt))

    # KPI card comments
    kpi_pat   = re.compile(r'class="kpi"[^>]*>')
    label_pat = re.compile(r'font-size:10px[^>]+>\s*([^<\n]+?)\s*<')
    for m in kpi_pat.finditer(html):
        lm    = label_pat.search(html, m.end(), m.end() + 400)
        label = lm.group(1).strip() if lm else "KPI"
        ls    = line_start(html, m.start())
        ind   = line_indent(html, m.start())
        inserts.append((ls, f"{ind}<!-- KPI Card: {label} -->\n"))

    # Panel comments
    panel_pat = re.compile(r'background:#111;border:1px solid #1e1e1e;padding:24px')
    hits = list(panel_pat.finditer(html))
    for i, label in enumerate(panels):
        if i >= len(hits): break
        pos     = hits[i].start()
        div_pos = html.rfind("<div", 0, pos)
        ls      = line_start(html, div_pos)
        ind     = line_indent(html, pos)
        inserts.append((ls, f"{ind}<!-- Panel: {label} -->\n"))

    for pos, cmt in sorted(inserts, key=lambda x: x[0], reverse=True):
        html = html[:pos] + cmt + html[pos:]
    return html

def indent_style(html):
    def replace(m):
        nl = "\n"
        lines = [("      " + l.strip()) if l.strip() else "" for l in m.group(1).splitlines()]
        return "<style>" + nl + nl.join(lines).strip(nl) + nl + "    </style>"
    return re.sub(r"<style>([\s\S]*?)</style>", replace, html)

# ── Main ──────────────────────────────────────────────────────────────────────
def convert(jsx_path):
    jsx_path = os.path.abspath(jsx_path)
    if not os.path.isfile(jsx_path) or not jsx_path.endswith(".jsx"):
        print("❌  Need a valid .jsx file"); sys.exit(1)

    out_path  = jsx_path.replace(".jsx", ".html")
    cache     = os.path.expanduser("~/.jsx_to_html_cache")
    os.makedirs(cache, exist_ok=True)

    print(f"\n🔄  Converting: {os.path.basename(jsx_path)}")

    with open(jsx_path) as f:
        src = f.read()

    # Extract metadata from JSX
    m            = re.search(r"export default function (\w+)", src)
    country      = m.group(1) if m else "Country"
    page_title   = f"{country} Dashboard"
    sections     = [(s, s.replace('&','&amp;')) for s in re.findall(r'<SectionHeader\s[^>]*label="([^"]+)"', src)]
    panels       = re.findall(r'<Panel\s+title="([^"]+)"', src)

    print(f"✓  {len(sections)} sections · {len(panels)} panels detected")

    # Write and run Node renderer
    node_js = os.path.join(cache, "render.js")
    tmp_out = os.path.join(cache, "out.html")
    with open(node_js, "w") as f: f.write(NODE_SCRIPT)
    ensure_npm(cache)

    print("⚙️   Rendering to static HTML...")
    r = subprocess.run(["node", node_js, jsx_path, tmp_out],
                       cwd=cache, capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.strip().startswith("OK"):
        print("❌  Render failed:\n" + (r.stderr or r.stdout)); sys.exit(1)

    with open(tmp_out) as f:
        body = f.read().strip()

    # Extract <style> from body → move to <head>
    sm = re.search(r'<style>[\s\S]*?</style>', body)
    style_block = sm.group(0) if sm else ""
    if sm:
        body = body[:sm.start()] + body[sm.end():]

    # Build HTML shell
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{page_title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
  {style_block}
</head>
<body style="margin:0;background:#000">
{body}
</body>
</html>"""

    # Prettify → inject comments → fix style indent → fix title
    print("✨  Beautifying HTML...")
    html = beautify_html(html)

    print("💬  Injecting comments...")
    html = inject_comments(html, sections, panels)

    html = indent_style(html)
    html = re.sub(r'<title>[\s\S]*?</title>', f'<title>{page_title}</title>', html)

    with open(out_path, "w") as f:
        f.write(html)

    print(f"✅  Done → {out_path}")
    print(f"    {os.path.getsize(out_path)//1024} KB · {html.count(chr(10)):,} lines · {len(sections)} sections")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    if not shutil.which("node"):
        print("❌  Node.js not found: https://nodejs.org"); sys.exit(1)
    print(f"✓  Node.js {subprocess.check_output(['node','--version'],text=True).strip()}")
    convert(sys.argv[1])
