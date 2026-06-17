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

import sys, os, re, json, shutil, subprocess, datetime

try:
    from bs4 import BeautifulSoup
except ImportError:
    print("❌  Run: pip3 install beautifulsoup4")
    sys.exit(1)

# ── npm packages needed by the Node renderer ──────────────────────────────────
NPM = ["@babel/core", "@babel/plugin-transform-react-jsx", "react", "react-dom"]

# ── npm packages needed for server-side map SVG rendering ─────────────────────
MAP_NPM = ["d3", "topojson-client", "jsdom"]

# ── Node.js: compile JSX → renderToStaticMarkup → pure HTML ──────────────────
NODE_SCRIPT = r"""
const babel = require('@babel/core');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const fs = require('fs');

const src = fs.readFileSync(process.argv[2], 'utf8')
  .replace(/const\s*\{[^}]+\}\s*=\s*React;/, '')
  .replace('export default function', 'function')
  .replace(/(React\.)?useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}\s*,\s*\[\s*\]\s*\)/g, '');

const js = babel.transformSync(src, {
  plugins: ['@babel/plugin-transform-react-jsx'], filename: 'dashboard.jsx'
}).code;

const fn = [...js.matchAll(/^function (\w+)\(/mg)].at(-1)[1];
const Component = new Function('require','React', js + '\nreturn ' + fn + ';')(require, React);

fs.writeFileSync(process.argv[3], renderToStaticMarkup(React.createElement(Component)), 'utf8');
console.log('OK');
"""

# ── Node.js: extract drawMap from JSX, run it in jsdom, output SVG ────────────
MAP_NODE_SCRIPT = r"""
const { JSDOM } = require('jsdom');
const d3mod = require('d3');
const topo  = require('topojson-client');
const fs    = require('fs');
const https = require('https');

const jsxPath   = process.argv[2];
const atlasPath = process.argv[3];
const src       = fs.readFileSync(jsxPath, 'utf8');

// ── Fetch / cache world atlas ─────────────────────────────────────────────────
function getAtlas() {
  if (fs.existsSync(atlasPath))
    return Promise.resolve(JSON.parse(fs.readFileSync(atlasPath, 'utf8')));
  return new Promise((resolve, reject) => {
    process.stderr.write('🌍  Downloading world atlas (once)...\n');
    https.get('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json', res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { fs.writeFileSync(atlasPath, data); resolve(JSON.parse(data)); });
    }).on('error', reject);
  });
}

// ── Extract inner content of { } block starting after fromIdx ─────────────────
function innerBraces(text, fromIdx) {
  let i = text.indexOf('{', fromIdx);
  if (i < 0) return null;
  let depth = 0, start = i;
  while (i < text.length) {
    if      (text[i] === '{') depth++;
    else if (text[i] === '}') { if (--depth === 0) return text.slice(start + 1, i); }
    i++;
  }
  return null;
}

getAtlas().then(worldData => {
  // 1. Extract const C = { ... }
  const cIdx  = src.search(/\bconst C\s*=/);
  const cBody = innerBraces(src, cIdx);
  if (cBody === null) throw new Error('const C not found in JSX');
  const cDef = `const C = {${cBody}};`;

  // 2. Extract drawMap inner body
  const dmIdx   = src.indexOf('async function drawMap()');
  if (dmIdx < 0) throw new Error('drawMap() not found in JSX');
  const dmInner = innerBraces(src, dmIdx);
  if (!dmInner) throw new Error('drawMap body not found');

  // 3. Minimal transforms — only remove runtime-only guards
  //    CDN loading, fetch, window.d3 are handled by mocking the environment below
  let code = dmInner
    .replace(/if\s*\(!cancelled\)\s*setMapLoaded\(true\)\s*;/g, '')
    .replace(/let cancelled\s*=\s*false\s*;/, '')
    .replace(/if\s*\(cancelled\)\s*return\s*;/g, '')
    .replace(/return\s*\(\)\s*=>\s*\{[\s\S]*?cancelled[\s\S]*?\}\s*;/, '');

  // 4. Extract try { } inner content
  const tryIdx   = code.indexOf('try');
  const tryInner = tryIdx >= 0 ? innerBraces(code, tryIdx) : code;

  // 5. Set up jsdom
  const dom = new JSDOM('<!DOCTYPE html><html><body><svg id="m" viewBox="0 0 960 540"></svg></body></html>');
  const win = dom.window;
  const doc = win.document;

  // Pre-create the CDN script elements → if(!getElementById('d3-cdn')) is false → blocks skipped
  ['d3-cdn', 'topo-cdn'].forEach(id => {
    const s = doc.createElement('script'); s.id = id; doc.head.appendChild(s);
  });

  // Inject d3 and topojson into window → const d3=window.d3 works as-is
  win.d3       = d3mod;
  win.topojson = topo;

  // Simplify topology — removes low-weight vertices (Visvalingam), ~20-30% fewer path points
  // minWeight 1e-7: conservative, preserves all visible borders at 960px wide
  // Mock fetch → const world = await fetch(...).then(r=>r.json()) works as-is
  win.fetch = () => Promise.resolve({ json: () => Promise.resolve(worldData) });

  global.document = doc;
  global.window   = win;

  const svgEl = doc.getElementById('m');

  // 6. Run as async function (the drawMap code uses await)
  const AsyncFn = Object.getPrototypeOf(async function(){}).constructor;
  const fn = new AsyncFn('mapRef', cDef + '\n' + tryInner);

  fn({ current: svgEl }).then(() => {
    const out = svgEl.outerHTML
      .replace(/^<svg[^>]*/,
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="100%" style="display:block;border-radius:4px"');
    process.stdout.write(out + '\n');
  }).catch(e => { process.stderr.write('❌ draw: ' + e.message + '\n'); process.exit(1); });

}).catch(e => { process.stderr.write('❌ ' + e.message + '\n' + e.stack + '\n'); process.exit(1); });
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

def ensure_map_npm(cache):
    if os.path.isfile(os.path.join(cache, "node_modules", "jsdom", "package.json")):
        return
    print("📦  Installing map packages (first run only)...")
    r = subprocess.run(["npm", "install", "--save"] + MAP_NPM, cwd=cache,
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(f"❌  Map package install failed.\n"
              f"    Run manually: npm install --save {' '.join(MAP_NPM)} --prefix {cache}\n"
              f"    Error: {r.stderr[:300]}")
        sys.exit(1)
    if not os.path.isfile(os.path.join(cache, "node_modules", "jsdom", "package.json")):
        print(f"❌  jsdom still not found after install.\n"
              f"    Run manually: npm install --save {' '.join(MAP_NPM)} --prefix {cache}")
        sys.exit(1)
    print("✓  Map packages installed")

def render_map_svg(jsx_path, cache):
    """Run the drawMap code from the JSX inside jsdom and return an SVG string."""
    ensure_map_npm(cache)

    atlas_path = os.path.join(cache, "world-atlas.json")
    node_js    = os.path.join(cache, "render_map.js")
    with open(node_js, "w") as f:
        f.write(MAP_NODE_SCRIPT)

    r = subprocess.run(
        ["node", node_js, jsx_path, atlas_path],
        cwd=cache, capture_output=True, text=True, timeout=60
    )
    if r.returncode != 0:
        print(f"⚠️  Map render failed:\n{r.stderr[:600]}")
        return None
    return r.stdout.strip()

def cull_offscreen_paths(svg, margin=60):
    """Remove map <path> elements whose every coordinate is outside the viewBox.

    D3 renders paths for all ~242 world countries even though only a handful
    are visible in a Central Asia map. Off-screen paths are stripped here,
    reducing SVG size by 60–70% with zero visual change.

    Works on the raw SVG string returned by the Node renderer.
    Paths use the format <path d="M x,y L x,y ..."> (no self-closing slash).
    A path is kept if ANY (x,y) pair falls within [-margin .. 960+margin] × [-margin .. 540+margin].
    """
    vx0, vy0 = -margin, -margin
    vx1, vy1 = 960 + margin, 540 + margin

    def keep(d):
        nums = re.findall(r'[-+]?\d+(?:\.\d+)?', d)
        for i in range(0, len(nums) - 1, 2):
            if vx0 <= float(nums[i]) <= vx1 and vy0 <= float(nums[i+1]) <= vy1:
                return True
        return False

    before = len(svg)
    svg = re.sub(
        r'<path\s[^>]*>',
        lambda m: m.group(0) if (dm := re.search(r'\bd="([^"]*)"', m.group(0))) is None or keep(dm.group(1)) else '',
        svg
    )
    saved = (before - len(svg)) // 1024
    if saved > 0:
        print(f"✂️   Culled off-screen paths: saved {saved} KB")
    return svg


def inject_map_svg(html, svg):
    """Replace the empty map SVG placeholder with the pre-rendered SVG."""
    # Match any empty <svg> with viewBox "0 0 960 540" (BeautifulSoup lowercases attrs)
    pattern = re.compile(
        r'<svg[^>]*viewbox="0 0 960 540"[^>]*/?>\s*(?:</svg>)?',
        re.IGNORECASE
    )
    m = pattern.search(html)
    if m:
        return html[:m.start()] + svg + html[m.end():]
    print("⚠️  Map SVG placeholder not found in HTML — skipping embed")
    return html

def beautify_html(html):
    INLINE = ['em', 'strong', 'b', 'i', 'span', 'code', 'sup', 'sub', 'small']

    # Replace inline tags (including those with attributes) with numbered placeholders
    # so prettify() doesn't wrap them in newlines causing unwanted spaces in the browser.
    placeholders = {}
    counter = [0]

    def store(m):
        key = f'__TAG{counter[0]}__'
        placeholders[key] = m.group(0)
        counter[0] += 1
        return key

    for tag in INLINE:
        html = re.sub(rf'<{tag}(?:\s[^>]*)?>', store, html)
        html = re.sub(rf'</{tag}>', store, html)

    pretty = BeautifulSoup(html, 'html.parser').prettify()
    result = []
    for line in pretty.split('\n'):
        s = line.lstrip(' ')
        result.append('  ' * (len(line) - len(s)) + s)
    pretty = '\n'.join(result)

    # Restore inline tags
    for key, val in placeholders.items():
        pretty = pretty.replace(key, val)

    return pretty

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

def extract_era_script(src):
    """If the JSX uses the EraTimeline pattern, return a self-contained <script> string, else None."""
    if 'const ERAS' not in src or '.era-seg' not in src:
        return None

    # Find the ERAS array boundaries
    eras_match = re.search(r'const ERAS\s*=\s*\[', src)
    if not eras_match:
        return None
    start = eras_match.end() - 1  # position of '['
    depth, i = 0, start
    while i < len(src):
        if   src[i] == '[': depth += 1
        elif src[i] == ']':
            depth -= 1
            if depth == 0:
                eras_src = src[start:i + 1]
                break
        i += 1
    else:
        return None

    # Extract color / colorL pairs in order from the ERAS block
    era_colors = re.findall(
        r'color:\s*[\'"]([^\'\"]+)[\'"].*?colorL:\s*[\'"]([^\'\"]+)[\'"]',
        eras_src, re.DOTALL
    )
    if not era_colors:
        return None

    colors_json = json.dumps([{'color': c, 'colorL': cl} for c, cl in era_colors])
    n = len(era_colors)

    return f"""<script>
(function(){{
  var ERA_COLORS = {colors_json};
  var active = null;
  function selectEra(i) {{
    var segs = document.querySelectorAll('.era-seg');
    var legs = document.querySelectorAll('.era-leg-lbl');
    if (active === i) {{ i = null; }}
    var ph = document.getElementById('era-placeholder');
    if (ph) ph.style.display = (i === null) ? 'block' : 'none';
    for (var k = 0; k < {n}; k++) {{
      var p = document.getElementById('era-panel-' + k);
      if (p) p.style.display = (k === i) ? 'block' : 'none';
      if (segs[k]) segs[k].style.background = (k === i) ? ERA_COLORS[k].colorL : ERA_COLORS[k].color;
      if (legs[k]) legs[k].style.color = (k === i) ? ERA_COLORS[k].colorL : '#999';
    }}
    active = i;
  }}
  document.querySelectorAll('.era-seg').forEach(function(el) {{
    el.addEventListener('click', function(){{ selectEra(parseInt(el.getAttribute('data-era'))); }});
  }});
  document.querySelectorAll('.era-leg').forEach(function(el) {{
    el.addEventListener('click', function(){{ selectEra(parseInt(el.getAttribute('data-era'))); }});
  }});
}})();
</script>"""


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

    out_path  = re.sub(r'-dashboard\.jsx$', '.html', jsx_path)
    if out_path == jsx_path:  # no -dashboard suffix, fall back
        out_path = jsx_path.replace(".jsx", ".html")
    cache     = os.path.expanduser("~/.jsx_to_html_cache")
    os.makedirs(cache, exist_ok=True)

    print(f"\n🔄  Converting: {os.path.basename(jsx_path)}")

    with open(jsx_path) as f:
        src = f.read()

    # Check for matching data file in countries/{name}.js
    name      = re.sub(r'-dashboard$', '', os.path.splitext(os.path.basename(jsx_path))[0])
    data_path = os.path.join(os.path.dirname(jsx_path), 'countries', name + '.js')
    if os.path.isfile(data_path):
        with open(data_path) as f:
            data_src = f.read()
        src = data_src + '\n' + src
        print(f"✓  Data file: countries/{name}.js")

    # Write combined source to temp file for Node renderers
    tmp_jsx = os.path.join(cache, 'combined.jsx')
    with open(tmp_jsx, 'w') as f:
        f.write(src)
    compile_path = tmp_jsx

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
    r = subprocess.run(["node", node_js, compile_path, tmp_out],
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

    # Embed map SVG if the JSX contains a D3 map component
    if 'async function drawMap()' in src:
        print("🗺️   Rendering map SVG...")
        map_svg = render_map_svg(compile_path, cache)
        if map_svg:
            # Remove paths for countries entirely outside the viewBox (0 0 960 540)
            map_svg = cull_offscreen_paths(map_svg)
            # Trim SVG coordinate precision: 6 decimal places → 1 (no visible quality loss at dashboard scale)
            map_svg = re.sub(r'(\d+\.\d)\d+', r'\1', map_svg)
            html = inject_map_svg(html, map_svg)
            html = re.sub(r'<div[^>]*>\s*Loading map[^<\n]*\s*</div>', '', html, count=1)
            print("✓  Map SVG embedded")

    # Inject EraTimeline click handler script if present
    era_script = extract_era_script(src)
    if era_script:
        html = html.replace('</body>', era_script + '\n</body>', 1)
        print("🎯  EraTimeline script injected")

    # Inject exact build date into footer generation line
    build_date = datetime.datetime.now().strftime('%-d %B %Y')
    html = re.sub(r'Generated [A-Za-z]+ \d{4}', f'Generated {build_date}', html)

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
