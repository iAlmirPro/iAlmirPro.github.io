# Country Dashboard — Design System
> Last updated: May 2026 — reflects all changes through the Kyrgyzstan/Kazakhstan/Tajikistan/Uzbekistan session.
> Use this file as the single source of truth for all future country dashboards.

---

## No Exceptions Rule
- **"Obvious" fixes are not exceptions.** A bug, an overflow, a broken layout — none of these bypass the approval protocol. Propose first, always.
- **Screenshots and error reports are findings, not work orders.** When the user shares a screenshot showing a problem, respond by describing what you see and what you would change — then STOP and wait.
- **The correct response to any reported problem is:** "I can see [X]. I would fix it by [Y]. Shall I proceed?"
- **Never interpret a problem report as implicit approval to fix it.**

---

## Reference Files

| File | Purpose |
|---|---|
| `at-a-glance-instructions.md` | Structure, tile anatomy, icons and map tile for the At-a-Glance section |
| `country-map-instructions.md` | D3 choropleth map component — projection, colours, label positioning via Python/Shapely |

> Always read both files before building or updating the At-a-Glance section or the map tile.

---

## Quick-Start Checklist (new country)

1. Copy `kyrgyzstan-dashboard.jsx` as `[country]-dashboard-v1.jsx`
2. Update the `C` color object with the new country's flag colors — use country-code prefix (e.g. `kg`, `kaz`, `uz`, `tj`) — **never use generic country codes that clash** (e.g. `ir` = Ireland, not Iran — use `tj` for Tajikistan)
3. Update the `Flag` SVG component
4. Update hero H1, eyebrow label, description text
5. **Replace all data section by section — applying the MANDATORY GATED PROCESS (Gate 1→5) for every section without exception. Do not proceed to the next section until the current section has cleared all five gates. After each section clears Gate 5, immediately save/update the artifact so the result is visible. See Data Verification Standard.**
6. Run duplicate check: no label/key should appear in both a visual component and a table row — if duplicated, remove the table row; the visual takes priority
7. Run color audit: max 2 colored KpiCards per section, balanced across dashboard
8. Add `GradientBar` component (see Visualization Components section)
9. Insert the three standard `GradientBar` visualizations into §2 Climate and §8 Tourism panels
10. Insert Trade Balance `GradientBar` into §14 Business & Investment Climate — Key Fiscal Indicators panel
11. Run inconsistency check (see Inconsistency Check Protocol)
12. Run syntax check: `grep -n 'value:"\|sub:"\|accent:"\|label:"'` — must return zero results
13. Present final `.jsx` for download — **only after all sections have cleared Gate 5**

---

## Fonts

```
Display / values / titles:  Fraunces (serif) — weights 300, 700, 900; italic 400
Body / labels:              Inter (sans-serif) — weight 300 default, 400/500 for emphasis
```

Google Fonts URL (used in CSS `@import`):
```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap
```

---

## Color System

### Palette Object (copy and adapt per country)

```js
const C = {
  kg:   '#E8192C', kgL: '#ff3347',   // primary — country color 1  (use country-code prefix)
  yel:  '#F0B830', yelL: '#ffd060',   // secondary — avg / mid / positive trend
  red:  '#E8192C', redL: '#ff3347',   // heat / record high  (always present)
  blu:  '#2E86DE', bluL: '#5ba8ff',   // water / cold / record low  (always present)
  bg:   '#000',   card: '#111',  border: '#1e1e1e',
  track:'#222',   txt:  '#fff',  sub:   '#999',  dim: '#444',
};
```

> ⚠️ **`red` and `blu` are mandatory in every palette** — they drive Record High and Record Low KpiCard accents and valColor across all dashboards.

> ⚠️ **Naming rule:** Use country-code prefix for primary color keys. Never use codes that clash with other countries or common abbreviations. Examples: `kg` (Kyrgyzstan), `kaz` (Kazakhstan), `uz` (Uzbekistan), `tj` (Tajikistan). Do NOT use `ir` (Ireland conflict).

### Known Country Palettes

```
Kyrgyzstan:   kg  #E8192C / kgL  #ff3347   yel #F0B830 / yelL #ffd060   blu #2E86DE / bluL #5ba8ff
                                            red = kg (#E8192C / #ff3347)
Kazakhstan:   kaz #00AFCA / kazL #33c8df   yel #FFC72C / yelL #ffd966   blu #2E86DE / bluL #5ba8ff
                                            red #E8192C / redL #ff3347
Uzbekistan:   uz  #1EB4E5 / uzL  #55ccf5   grn #3DAA5C / grnL #5dc97c   blu #2E86DE / bluL #5ba8ff
                                            red #E8192C / redL #ff3347
Tajikistan:   tj  #239F40 / tjL  #3dc95a   gld #D4AF37 / gldL #f0cc55   blu #2E86DE / bluL #5ba8ff
                                            red #C8102E / redL #f03050   (Tajik flag red)
Turkmenistan: tm  #009A44 / tmL  #00c857   yel #F5C518 / yelL #ffd84d   blu #2E86DE / bluL #5ba8ff
                                            red #C8102E / redL #f03050   (Turkmen flag red)
```

> **Note:** `red` uses `#E8192C` for KG/KZ/UZ (design system red) and `#C8102E` for TJ/TM (flag red). Both work — the visual difference is minor. For new countries, default to `#E8192C` unless the flag explicitly has a different red.

### KpiCard Value Color Logic

The value text color is derived from the accent. Each file's `valColor` must cover all color tokens used as accents in that file. Minimum required cases for every dashboard:
```js
// Always include C.red and C.blu — they drive Record High / Record Low
const valColor = accent === C.[primary] ? C.[primaryL] :
                 accent === C.yel       ? C.yelL        :  // if yel exists
                 accent === C.red       ? C.redL        :
                 accent === C.blu       ? C.bluL        : C.txt;
```

Per-file current `valColor` logic:
```
Kyrgyzstan:   C.kg → C.kgL   · C.yel → C.yelL  · C.blu → C.bluL        → else C.txt
Kazakhstan:   C.kaz → C.kazL · C.yel → C.yelL  · C.blu → C.bluL · C.red → C.redL → else C.txt
Uzbekistan:   C.uz → C.uzL   · C.grn → C.grnL  · C.blu → C.bluL · C.red → C.redL → else C.txt
Tajikistan:   C.tj → C.tjL   · C.red → C.redL  · C.gld → C.gldL · C.blu → C.bluL → else C.txt
Turkmenistan: C.tm → C.tmL   · C.red → C.redL  · C.yel → C.yelL · C.blu → C.bluL → else C.txt
```
When `accent={C.dim}`, value text renders as `C.txt` (white).

### Color Rules for KPI Card Decks

1. **White dominates** — `C.dim` is the default for most cards in every section
2. **Max 2 colored cards per section** — at most 2 KpiCards in each grid use a named accent
3. **1 colored card preferred** — use 2 only when two metrics genuinely need highlighting
4. **Balance across the full dashboard** — primary, `yel`, `red`, `blu` should appear roughly equally in total
5. **Color by meaning:**
   - `primary (kg/kaz/uz/tj/tm)` → headline achievement or max metric
   - `yel` → avg / mid / positive trend / opportunity
   - `red` → warning / critical / negative / risk · **always used for Record High temperature**
   - `blu` → water / cold / geographic depth / fiscal milestone · **always used for Record Low temperature**
6. **Order cards by importance** — strongest/most important metric first, warnings last
7. **Never use undefined color variables** — always check the palette before referencing a color key

---

## CSS Boilerplate

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; }
body { background: #000; }
.dash {
  background: #000; color: #fff;
  font-family: 'Inter', sans-serif; font-weight: 300; line-height: 1.6;
  padding: 0 22px 80px; max-width: 1020px; margin: 0 auto; overflow-x: hidden;
}
@keyframes up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.kpi { animation: up .4s ease forwards; opacity: 0; }
/* CRITICAL: scope to .g-1 only — do NOT override all .row or gy-* breaks on mobile */
.row.g-1 { --bs-gutter-x: 2px; --bs-gutter-y: 2px; margin-bottom: 2px; }
```

> ⚠️ **CSS Override Warning:** Scope the row override to `.row.g-1` **only** — never `.row` globally. A global `.row` override kills Bootstrap's `gy-*` vertical gap classes, causing **zero gap** between stacked panels on mobile.

Bootstrap 5 loaded dynamically:
```js
useEffect(() => {
  if (!document.getElementById('bs-cdn')) {
    const l = document.createElement('link');
    l.id = 'bs-cdn'; l.rel = 'stylesheet';
    l.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    document.head.appendChild(l);
  }
}, []);
```

---

## Layout & Grid

- Max width: `1020px`, centered, `padding: 0 22px 80px`
- **KPI card grids:** `<div className="row g-1 mb-3">` — 2px gaps, cards side by side
- **Panel rows:** `<div className="row gy-3 mb-3">` — 16px vertical gap between stacked panels on mobile
- **4-column grids** (region cards): `<div className="row g-1 mb-3">`
- Card wrappers: `col-6 col-md-4 d-flex` (KPI), `col-12 col-md-6` (panels), `col-6 col-md-3` (region cards)

> **Important:** Never change `gy-3` to `gy-2` on panel rows — this removes the mobile gap between panels.

---

## Components

### `<SectionHeader>`

```jsx
const SectionHeader = ({ icon, label }) => (
  <div id="section" className="row my-3">
    <div className="col-12 d-flex align-items-center gap-2">
      <span style={{ color:C.txt, fontSize:16, flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', color:C.txt, fontWeight:500 }}>{label}</span>
    </div>
  </div>
);
```

Usage: `<SectionHeader icon={Icons.mountain} label="Geography & Landscape" />`

- No border-top, no rule line — clean minimal header
- `my-3` provides vertical spacing above and below
- `id="section"` enables anchor targeting per section

---

### `<KpiCard>`

```jsx
const KpiCard = ({ label, value, sub, accent = C.[primary], delay = 0 }) => {
  const valColor = accent === C.[primary] ? C.[primaryL] : accent === C.yel ? C.yelL : accent === C.red ? C.redL : accent === C.blu ? C.bluL : C.txt;
  return (
    <div className="kpi" style={{
      background:C.card, border:`1px solid ${C.border}`, padding:'18px 15px 15px',
      position:'relative', overflow:'hidden', animationDelay:`${delay}s`, width:'100%', flex:1
    }}>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:accent }} />
      <div style={{ fontSize:10, letterSpacing:'0.11em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, lineHeight:1, marginBottom:4, color:valColor, wordBreak:'break-word' }}>{value}</div>
      <div style={{ fontSize:11, color:C.sub, lineHeight:1.4 }}>{sub}</div>
    </div>
  );
};
```

- `delay` staggers the fade-up animation: use `0.05, 0.10, 0.15...` increments
- `accent={C.dim}` = white value text, dim stripe — default/neutral card
- Bottom stripe is `2px` tall, full width, positioned `absolute`

Usage:
```jsx
<div className="col-6 col-md-4 d-flex">
  <KpiCard label="GDP Nominal" value="$17.5B" sub="World Bank 2024" accent={C.[primary]} delay={0.05} />
</div>
```

---

### `<Panel>`, `<BarRow>`, `<Tbl>`, `<RegCard>`, `<DlRow>`, `<Donut>`

See `kyrgyzstan-dashboard.jsx` for full component source. Key `id` attribute added in uzbekistan update:
- `<Tbl>` — outer `<table>` has `id="paneltbl"`

**Panel component source** (updated from uzbekistan — `id` attributes and padding):
```jsx
const Panel = ({ title, icon, children }) => (
  <div id="panel" style={{ background:C.card, border:`1px solid ${C.border}`, padding:'20px 20px', height:'100%' }}>
    <div id="title" style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, marginBottom:16, paddingBottom:11, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ color:C.txt, flexShrink:0 }}>{icon}</span>{title}
    </div>
    {children}
  </div>
);
```

**Panel usage:**
```jsx
<div className="col-12 col-md-6">
  <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
    <Tbl rows={[...]} />
    <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>
      Interpretive note here — what do these values mean? High/low/normal compared to global or regional benchmarks.
    </p>
  </Panel>
</div>
```

> **Every panel must end with an interpretive note** — answers *"So what?"*: is this value good/bad/typical? Compare to global average, regional peers, or historical trend. If a panel already has a descriptive paragraph, append a second note after it.

> **JSX special chars:** Use `&lt;` for `<` inside panel note text (e.g. `&lt;10/100K`) to avoid parse errors.

**Inline Divider** (between sub-sections inside a panel):
```jsx
<div style={{ height:1, background:C.border, margin:'16px 0' }} />
```

**Visitor / Export Origins Row** (used in §8 Tourism and §14 Business — Export destinations):
```jsx
{[
  { flag:'🏳️', country:'[Country A]', val:'largest source market',       pct:'~38%' },
  { flag:'🏳️', country:'[Country B]', val:'frequent short-stay visitors', pct:'~22%' },
].map(({ flag, country, val, pct }) => (
  <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
    <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
    <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
    <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
    <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
  </div>
))}
```
Layout: `flag (18px) | country name | description (flex:1, C.sub) | percentage (Fraunces 700)`

**Political Timeline** (used in §7 Political Landscape):
```jsx
{[
  { yr:'1991', tx:'Independence declared...' },
  { yr:'2005', tx:'Revolution...' },
].map(({ yr, tx }) => (
  <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.[primary]}`, marginBottom:14 }}>
    <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.yel, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
    <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
  </div>
))}
```
- Left border: primary country color — Year text: secondary (yel) — Event text: 12.5px `#888`

---

### Icons Library

All icons: `width="14" height="14"`, `fill="currentColor"`, used in `<SectionHeader>` and `<Panel>` title.

```js
const Icons = {
  mountain,    // §1 Geography, §11 Energy & Resources
  map,         // §12 Infrastructure, region maps
  water,       // §15 Environment, rivers, lakes
  cloudSun,    // §2 Climate
  sun,         // Daylight hours panel
  rain,        // Rainfall panel
  people,      // §3 Population, §9 Vital Statistics & Health, §12 Social, tourism origins
  chart,       // §4 Economy, §14 Business/Fiscal, §9 Causes of Death, GDP statistics
  briefcase,   // §5 Employment, §8 Tourism, §14 Business
  graduation,  // §6 Education
  landmark,    // §7 Political, cities, heritage, facts tables
}
```

SVG paths are copied verbatim from Font Awesome 6 free set — see `kyrgyzstan-dashboard.jsx` `Icons` object for full `<path d="...">` values.

---

### `<GradientBar>`

Horizontal gradient visualization for time-series or continuous data. Used for temperature, rainfall, tourism seasonality, and trade balance.

```jsx
const GradientBar = ({ title, values, colorStops, unit = '', height = 22, xLabels, fmt, invertPeak = false, absScale = false }) => {
  const defaultLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = xLabels || defaultLabels;
  const n = values.length;
  const min = Math.min(...values), max = Math.max(...values);
  const absMax = Math.max(...values.map(Math.abs));
  const peakIdx = invertPeak ? values.indexOf(min) : values.indexOf(max);
  const pct = v => absScale ? (Math.abs(v) / absMax) * 100 : ((v - min) / (max - min)) * 100;
  const gradient = values.map((v, i) => {
    const p = pct(v);
    return `${colorStops(p, v)} ${(i / (n - 1)) * 100}%`;
  }).join(', ');
  const peakIdx2 = absScale ? values.reduce((a,b,i,arr) => Math.abs(arr[i]) > Math.abs(arr[a]) ? i : a, 0) : peakIdx;
  const usePeakIdx = absScale ? peakIdx2 : peakIdx;
  const peakPct = (usePeakIdx / (n - 1)) * 100;
  const labelColor = C.sub;
  const peakColor = colorStops(absScale ? 100 : (invertPeak ? 0 : 100), absScale ? values[usePeakIdx] : (invertPeak ? min : max))
    .replace(/rgb\((\d+),(\d+),(\d+)\)/, (_, r, g, b) =>
      `rgb(${Math.round(r*0.45)},${Math.round(g*0.45)},${Math.round(b*0.45)})`);
  return (
    <div style={{ marginTop:14 }}>
      {title && <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{title}</div>}
      <div style={{ position:'relative', height, borderRadius:4, overflow:'hidden', background:`linear-gradient(to right, ${gradient})` }}>
        <div style={{ position:'absolute', top:'10%', bottom:'10%', left:`${peakPct}%`, width:1, background:peakColor, transform:'translateX(-50%)', borderRadius:1 }} />
      </div>
      <div style={{ display:'flex', marginTop:4 }}>
        {labels.map((l, i) => (
          <div key={l} style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:8, color: i===usePeakIdx ? '#fff' : labelColor, fontWeight: i===usePeakIdx ? 600 : 300, lineHeight:1 }}>{l}</div>
            <div style={{ fontSize:8, color: i===usePeakIdx ? '#fff' : labelColor, lineHeight:1.4 }}>{fmt ? fmt(values[i]) : `${values[i]}${unit}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Key props:**
| Prop | Default | Description |
|---|---|---|
| `values` | required | Array of numbers |
| `colorStops` | required | `(p, v) => css-color` — `p` = intensity 0–100, `v` = actual value |
| `xLabels` | months | Custom x-axis labels array |
| `unit` | `''` | Unit appended to values below bar |
| `fmt` | null | Custom value formatter e.g. `v => v > 0 ? \`+${v}B\` : \`${v}B\`` |
| `absScale` | false | Color intensity based on distance from zero (for trade balance) |
| `height` | 22 | Bar height in px |

**Peak marker line:**
- Color = `colorStops(100)` darkened to 45% brightness — same hue as gradient peak but visibly darker
- Width: **1px**, height: 80% of bar (10% inset top and bottom), `borderRadius:1`
- Peak month label: white + bold; all other labels: `C.sub`

**Standard `colorStops` functions:**

```js
// Temperature: blue (cold) → white → orange → deep red (hot)
const tempColor = p => {
  if (p < 25) return `rgb(${Math.round(40+p*0.8)},${Math.round(60+p*0.4)},${Math.round(180-p*0.8)})`;
  if (p < 50) { const t=(p-25)/25; return `rgb(${Math.round(60+t*130)},${Math.round(80+t*80)},${Math.round(160-t*100)})`; }
  if (p < 75) { const t=(p-50)/25; return `rgb(${Math.round(190+t*50)},${Math.round(160-t*80)},${Math.round(60-t*40)})`; }
  const t=(p-75)/25; return `rgb(${Math.round(240-t*30)},${Math.round(80-t*60)},${Math.round(20)})`;
};

// Rainfall: #999 (C.sub, 0 mm) → #2E86DE (peak rainfall)
// Formula: 153 + (peak_channel - 153) * p/100
const rainColor = p => `rgb(${Math.round(153-107*p/100)},${Math.round(153-19*p/100)},${Math.round(153+69*p/100)})`;
// Min=#999 rgb(153,153,153) · Peak=#2E86DE rgb(46,134,222) — same across all 5 countries

// Tourism: #999 (C.sub, low season) → #E8192C (peak season) — SAME formula across all 5 countries
// p => `rgb(${Math.round(153+79*p/100)},${Math.round(153-128*p/100)},${Math.round(153-109*p/100)})`
// Min=#999 · Peak=#E8192C rgb(232,25,44)
// ⚠️ Values must be normalized: peak month = 100, all others relative to it

// Trade balance: #999 (C.sub, zero) → #E8192C (deficit) / #239F40 (surplus) — uses actual value sign
// (p, v) => v >= 0
//   ? `rgb(${Math.round(153-118*p/100)},${Math.round(153+6*p/100)},${Math.round(153-89*p/100)})`    // → #239F40 (green surplus)
//   : `rgb(${Math.round(153+79*p/100)},${Math.round(153-128*p/100)},${Math.round(153-109*p/100)})`  // → #E8192C (red deficit)
// Always use absScale={true} for trade balance — color intensity = distance from zero
// Min=#999 for zero balance — color saturates toward peak in both directions
```

**Standard GradientBar placements per section:**

| Section | Panel | Bar | colorStops |
|---|---|---|---|
| §2 Climate | Rainfall by Region | Temperature (monthly avg °C) | `tempColor` |
| §2 Climate | Rainfall by Region | Rainfall (monthly mm) | `rainColor` |
| §8 Tourism | Tourism Highlights | Tourism intensity (relative, Jan–Dec) | country primary |
| §14 Business | Key Fiscal Indicators | Trade balance 2015–2024 ($B) | trade colorStops + `absScale={true}` |

All three climate/tourism bars placed at the **bottom of their panel**, after the interpretive note.

---

### `<EraTimeline>` — Interactive Political History Bar

A proportional horizontal bar divided into colour-coded political eras. Clicking any era reveals a detail panel with description and bullet events. Clicking again collapses it. A legend below mirrors the bar and is also clickable.

**Why vanilla JS, not React state:** `jsx_to_html.py` uses `renderToStaticMarkup` which strips all React state (`useState`) and event handlers (`onClick`). `dangerouslySetInnerHTML` script content is also stripped. The compiled HTML is fully static.

**How interactivity works in compiled HTML:** `jsx_to_html.py` detects the `ERAS` array in the JSX source, extracts `color`/`colorL` per era, and injects a self-contained `<script>` block before `</body>` automatically. No manual script wiring needed in the JSX.

**What the JSX must provide:**
- The `ERAS` array defined at module level (the compiler reads it)
- All era detail panels pre-rendered as hidden `div`s (`display:none`) — JS reveals the active one
- Bar segments and legend items with `data-era={i}` and CSS class names for the injected script to target

**ERAS data structure** — define once at module level, after the `C` palette:

```js
const ERAS = [
  {
    id: 'era_id',           // unique string key
    label: 'Full Era Name', // shown in detail panel heading
    short: 'Short Name',    // shown in legend
    start: 1900,            // start year (integer)
    end:   1924,            // end year (integer)
    color:  '#8B5E3C',      // base colour — bar segment, detail panel left border
    colorL: '#b07d52',      // light colour — active bar, year label, bullet dots
    desc: 'One paragraph narrative description of the era.',
    events: [               // bullet list — format "YEAR — description"
      '1905 — Key event',
      '1916 — Another event',
    ],
  },
  // … repeat for all eras
];
const ERA_TOTAL = [last_year] - [first_year]; // e.g. 2025 - 1900 = 125
```

**Full JSX structure** (place in its own `row gy-3 mb-3` below the other §7 panels):

```jsx
<div className="row gy-3 mb-3">
  <div className="col-12">
    <Panel title="[N] Years of Governance — Interactive Era Timeline ([start]–[end])" icon={Icons.chart}>

      {/* Proportional era bar — no gap, borderRight separates segments so % label positions stay exact */}
      <div style={{ display:'flex', height:40, borderRadius:4, overflow:'hidden' }}>
        {ERAS.map((era, i) => (
          <div key={era.id} data-era={i} className="era-seg"
            title={`${era.label} (${era.start}–${era.end})`}
            style={{ width:`${((era.end - era.start) / ERA_TOTAL) * 100}%`,
              background:era.color, cursor:'pointer', transition:'background 0.2s', flexShrink:0,
              borderRight:'1px solid #000' }}
          />
        ))}
      </div>

      {/* Year labels — bottom-to-top rotated, pinned to era boundaries */}
      <div style={{ position:'relative', height:28, marginTop:5 }}>
        {ERAS.map((era, i) => {
          const left = ((era.start - [first_year]) / ERA_TOTAL) * 100;
          const isFirst = i === 0;
          return (
            <div key={era.id} style={{
              position:'absolute', left:`${left}%`, top:0,
              transform: isFirst ? 'scaleX(-1) scaleY(-1)' : 'translateX(-50%) scaleX(-1) scaleY(-1)',
              fontSize:9, color:C.sub, whiteSpace:'nowrap', writingMode:'vertical-lr',
            }}>{era.start}</div>
          );
        })}
        <div style={{ position:'absolute', right:0, top:0, fontSize:9, color:C.sub, whiteSpace:'nowrap', writingMode:'vertical-lr', transform:'scaleX(-1) scaleY(-1)' }}>[last_year]</div>
      </div>

      {/* Placeholder — visible when no era selected */}
      <div id="era-placeholder" style={{ background:C.bg, border:`1px solid ${C.border}`,
        padding:'8px 16px', borderRadius:2, marginTop:12, fontSize:11, color:C.sub, textAlign:'center' }}>
        Click any era above to see details and key events.
      </div>

      {/* All detail panels — pre-rendered hidden; JS shows active one */}
      {ERAS.map((era, i) => (
        <div key={era.id} id={`era-panel-${i}`}
          style={{ display:'none', background:C.bg, border:`1px solid ${C.border}`,
            borderLeft:`3px solid ${era.color}`, padding:'16px 18px', borderRadius:2, marginTop:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8, flexWrap:'wrap', gap:6 }}>
            <div>
              <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:era.colorL, marginBottom:3 }}>{era.start} – {era.end}</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:17, color:C.txt }}>{era.label}</div>
            </div>
            <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:24, color:era.color, opacity:0.4 }}>{era.end - era.start}y</div>
          </div>
          <p style={{ fontSize:12, color:C.sub, lineHeight:1.7, marginBottom:12 }}>{era.desc}</p>
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {era.events.map((ev, j) => (
              <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                <div style={{ width:4, height:4, borderRadius:'50%', background:era.colorL, marginTop:5, flexShrink:0 }} />
                <div style={{ fontSize:11.5, color:C.txt, lineHeight:1.5 }}>{ev}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:14 }}>
        {ERAS.map((era, i) => (
          <div key={era.id} data-era={i} className="era-leg"
            style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
            <div style={{ width:8, height:8, borderRadius:2, background:era.color, flexShrink:0 }} />
            <span className={`era-leg-lbl era-leg-lbl-${i}`} style={{ fontSize:10, color:C.sub, letterSpacing:'0.05em' }}>{era.short}</span>
          </div>
        ))}
      </div>

      {/* jsx_to_html.py injects the click handler script automatically from the ERAS array — no script tag needed here */}

      <p style={{ fontSize:11, color:C.sub, marginTop:14, lineHeight:1.6 }}>Interpretive note here.</p>
    </Panel>
  </div>
</div>
```

**Key rules:**
- **No React state** — never use `useState` for the active era. React state is stripped by the compiler. The click handler is injected automatically by `jsx_to_html.py` from the `ERAS` array.
- **`ERA_TOTAL`** must equal `last_year - first_year` — it drives the proportional widths.
- **All panels hidden by default** (`display:'none'`) — JS reveals the active one.
- **`data-era={i}`** on both `.era-seg` and `.era-leg` divs — the script uses these to map clicks to panel IDs.
- **⚠️ Never add country suffixes to class names.** `jsx_to_html.py` injects a script that always queries `.era-seg`, `.era-leg`, `.era-leg-lbl`, `#era-placeholder`, and `#era-panel-N` exactly. Using e.g. `.era-seg-tm` or `#era-placeholder-tm` breaks the injected click handler silently — the HTML renders but clicks do nothing.
- **Place in its own row** (`row gy-3 mb-3`) — never nest inside the row containing other §7 panels, or JSX tag balance breaks.
- **Do not delete the Political Timeline panel** — the EraTimeline is an addition below it, not a replacement.

**Placement:** Own `row gy-3 mb-3` at the **bottom of §7**, after the election results + political timeline row.

---

## Standard Section Structure

Each section follows this pattern:

```jsx
{/* ══ N. SECTION NAME ══ */}
<SectionHeader icon={Icons.chart} label="Section Name" />

{/* KPI card grid */}
<div id="item" className="row g-1 mb-3">
  <div className="col-6 col-md-4 d-flex"><KpiCard ... /></div>
  <div className="col-6 col-md-4 d-flex"><KpiCard ... /></div>
  {/* 6–9 cards */}
</div>

{/* Panel row */}
<div id="item" className="row gy-3 mb-3">
  <div className="col-12 col-md-6">
    <Panel title="..." icon={Icons.chart}>
      <BarRow ... />
      <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Note.</p>
      {/* GradientBar inserted here if applicable */}
    </Panel>
  </div>
</div>
```

---

## All 15 Dashboard Sections

### When a country suppresses data for a section

**Never skip a section because data is suppressed.** All 15 sections must be present in every dashboard. If a country's government does not publish data for a section:

1. **Render the section with its `SectionHeader`** — visible in the page, not a comment.
2. **Add a suppression note** as the first element — a styled div, not a JSX comment:
```jsx
<div id="item" className="row gy-3 mb-3">
  <div className="col-12">
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.dim}`, padding:'16px 20px' }}>
      <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:C.dim, marginBottom:8 }}>Data suppressed by government</div>
      <p style={{ fontSize:13, color:C.txt, lineHeight:1.7, marginBottom:0 }}>
        [Country] does not publish [section topic] data. [One sentence on why / what is suppressed.]
      </p>
    </div>
  </div>
</div>
```
3. **Append whatever international data IS available** below the note — WHO modelled estimates, World Bank figures, satellite data, NGO reports. Annotate each value `est.; unverified — [source/reason]` per the Data Verification Standard.
4. **Never invent data** to fill a suppressed section. If no international estimate exists for a value, omit it entirely rather than guessing.

> **Reference implementation:** §9 Vital Statistics in `turkmenistan-dashboard-v11.jsx` — suppression note followed by available WHO/World Bank health data.

---

| # | Label | Icon | KPI cards | Panels | Visualizations |
|---|---|---|---|---|---|
| 1 | Geography & Landscape | mountain | 9 | Terrain zones (bars) · Water bodies (table) · Region cards (4×RegCard) | — |
| 2 | Climate: Weather, Daylight & Rainfall | cloudSun | 9 | Daylight hours (DlRow×12) · Rainfall by region (bars) | **GradientBar: temperature + rainfall** at bottom of Rainfall panel |
| 3 | Population & Demographics | people | 6 | Population growth (bars) · Largest cities (bars) · Ethnic composition (donut) · Religion & language (table) | — |
| 4 | Economy & Finance | chart | 6 | GDP by sector (donut + export bars) · Key economic indicators (table) | — |
| 5 | Employment & Wages | briefcase | 6 | Wages by sector (bars) · Employment by sector (donut + table) | — |
| 6 | Education & Human Development | graduation | 6 | Education metrics (bars) · Key education facts (table) | — |
| 7 | Political Landscape | landmark | 6 | Election results (bars) · Political timeline (inline) · Era timeline (interactive bar) | **EraTimeline** in its own row below the other panels |
| 8 | Tourism | briefcase | 6 | Visitor origins (flag+%+desc rows) · Tourism highlights (table) | **GradientBar: tourism intensity** at bottom of Tourism Highlights panel · both require published data — omit if country suppresses visitor statistics |
| 9 | Vital Statistics & Health | people | 6+ | Causes of death (bars) · Marriage & vital trends (table) · Health system facts (table) · Disease & health burden (bars) | — |
| 10 | Energy & Resources | mountain | 6 | Electricity mix (donut) · Energy & resources facts (table) | — |
| 11 | Infrastructure & Digital Connectivity | map | 6 | Key infrastructure projects (table) · Digital indicators (bars) | — |
| 12 | Social Indicators & Inequality | people | 6 | Social cohesion & gender (table) · Access & basic services (bars) | — |
| 13 | Environment & Climate | water | 6 | Environmental facts (table) · Air quality & pollution sources (bars) | — |
| 14 | Business & Investment Climate | briefcase | 6+ | Investment climate summary (table) · Key risks & opportunities (bars) · Export destinations (flag+% rows) · Key fiscal indicators (table) | **GradientBar: trade balance 2015–2024** at bottom of Key Fiscal Indicators panel |
| 15 | Crime & Security | landmark | 6 | Crime & security indicators (table) · Security context (bars) | — |

---

## Hero Section

```jsx
<div id="top" style={{ padding:'20px 0 0', display:'grid', gridTemplateColumns:'1fr minmax(0,96px)',
  alignItems:'end', gap:16, marginBottom:8 }}>
  <div>
    <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase',
      color:C.[primary], marginBottom:14 }}>Country Dashboard 2025</div>
    <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900,
      fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9,
      letterSpacing:'-0.02em', marginBottom:16 }}>
      Coun<em style={{ fontStyle:'italic', color:C.[primary], fontWeight:400 }}>try</em>
    </h1>
    <p style={{ fontSize:14, color:C.sub, maxWidth:480, lineHeight:1.7 }}>
      Description text here.
    </p>
  </div>
  <div style={{ alignSelf:'flex-start', marginTop:6 }}>
    <Flag />
  </div>
</div>
```

- **H1:** Fraunces 900, `clamp(44px,9vw,96px)`, `lineHeight:0.9`, `letterSpacing:'-0.02em'`
- **Country name suffix:** italic `<em>` with `fontWeight:400` and primary country color
- **Eyebrow:** 10px, uppercase, `letterSpacing:0.28em`, primary color, `marginBottom:14`
- **Flag:** top-right, `alignSelf:'flex-start'`, `marginTop:6`
- **Flag size:** `90×54px`, `borderRadius:3`, `boxShadow: 0 4px 24px rgba(R,G,B,.45)` using primary color channels

---

## Footer / Sources Line

```jsx
<div id="footer" style={{ padding:'8px 0 0', marginTop:8 }}>
  <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
    Sources: NSC KR · World Bank · IMF 2025 · ... · Data as of May 2026.
  </p>
  <p style={{ fontSize:9.5, color:'#444', marginTop:6, lineHeight:1.6, textAlign:'center' }}>
    Generated [Month Year] · Claude Sonnet 4.6 (Anthropic) · iAlmirPro
  </p>
</div>
```

> `[Month Year]` is hardcoded at time of authoring (e.g. `June 2026`). The `jsx_to_html.py` script replaces it with the exact build date (e.g. `3 June 2026`) when generating the static HTML.

---

## Syntax Safety Rules

JSX prop values must always use `=` not `:`. Common error pattern to avoid:

```jsx
// ❌ WRONG — Python-style colon
<KpiCard value:"$17.5B" sub:"World Bank" />

// ✅ CORRECT
<KpiCard value="$17.5B" sub="World Bank" />
```

**After generating any file, always run:**
```bash
grep -n 'value:"\|sub:"\|accent:"\|label:"' [file].jsx
# Must return zero results
```

---

## Data Verification Standard

---

### ⛔ HARD RULE — ZERO EXCEPTIONS — READ THIS BEFORE TOUCHING ANY DATA

**Writing a value without first completing a web search for it is a protocol violation. A dashboard built with unverified values that are not annotated `est.; unverified` is incorrect output and must be rebuilt from scratch.**

Training knowledge is not a source. "Sounds right" is not verified. "Similar to the last country" is not verified. Fast output is never a justification for skipping searches.

---

### The only two valid states for any value

| State | Meaning | What to do |
|---|---|---|
| **Confirmed** | Web search returned a source that directly supports the value | Write the value; cite the source in `sub` |
| **Unverified** | No search was done, or search returned no usable result | Write the value AND annotate `est.; unverified — [reason]` in `sub`, label, or Tbl row |

There is no third state. "Probably correct", "will check later", and "low priority" do not exist.

---

### MANDATORY GATED PROCESS — one section at a time, no skipping gates

Every section (§1 Geography, §2 Climate, §3 Population … §15 Crime) must pass through all five gates **in order** before the JSX for that section is written. Do not start the next section until the current one has cleared all five gates.

---

#### GATE 1 — READ
**STOP. Read the full section plan before doing anything else.**
- Identify every data point this section will contain: every KpiCard value, every BarRow value, every Tbl row, every GradientBar array, every Donut segment %, every figure inside `<p>` narrative text.
- Write out the full list. Do not proceed until the list is complete.

> ✅ Gate 1 cleared when: full data point list for this section exists.

---

#### GATE 2 — SEARCH EVERY VALUE
**STOP. For every item on the list from Gate 1, run a web search.**
- One search per data point, or a combined search if multiple points share a source (e.g. all climate values from one fetch).
- Do not write any JSX yet. Searching and writing are separate phases.
- Known high-error fields (listed below) require an explicit search even if you are confident — no exceptions.

> ✅ Gate 2 cleared when: every item on the Gate 1 list has been searched.

---

#### GATE 3 — RECORD RESULT FOR EACH VALUE
**STOP. For each searched value, record one of two outcomes:**
- **Found:** confirmed value + source name + year. Example: `GDP $64.24B — World Bank WDI 2024`
- **Not found:** reason why. Example: `City populations — Turkmenistan suppresses data; no reliable published source`

Do not proceed to writing until every item has a recorded outcome. A value with no recorded outcome has not been searched.

> ✅ Gate 3 cleared when: every item has either a confirmed source or a documented reason it cannot be confirmed.

---

#### GATE 4 — WRITE THE JSX
**NOW write the JSX for this section.**
- Confirmed values: write the value, cite the source in `sub`.
- Unverified values: write the value AND append `est.; unverified — [reason]` in the same field. See annotation rules below.
- Do not write any value that was not on the Gate 1 list and searched in Gate 2. If a new value is needed, go back to Gate 2 for it.

> ✅ Gate 4 cleared when: section JSX is written with all confirmed values sourced and all unverified values annotated.

---

#### GATE 5 — SECTION SELF-CHECK
**STOP. Before moving to the next section, run this check on what was just written:**
- Every value in this section appears on the Gate 1 list. ✓/✗
- Every confirmed value has a source cited in `sub`. ✓/✗
- Every unverified value has `est.; unverified — [reason]` in the field. ✓/✗
- No value was written from training knowledge without annotation. ✓/✗

If any check fails: fix it before proceeding. Do not carry errors forward.

**After all four checks pass: immediately save/update the artifact with the current state of the file. The user must be able to see the section result before the next section begins.**

> ✅ Gate 5 cleared when: all four checks pass and artifact is updated.

---

### After all sections: final checks before presenting the file

Only after every section has cleared all five gates:

1. Run the inconsistency check (see Inconsistency Check Protocol below)
2. Run the duplicate check: `grep -n 'value:"\|sub:"\|accent:"\|label:"'` — must return zero results
3. Present the `.jsx` file

**A file presented before all sections have cleared Gate 5 is incomplete output.**

---

### Known high-error fields — Gate 2 is mandatory for these even if you are certain

These fields are systematically wrong when generated from training data alone. There are no exceptions — search every one of these, every time:

- GDP total and per capita (often overstated)
- Tourism visitor count and **visitor origin percentages** (origin ranking is frequently wrong)
- Export product shares and destination percentages (proportions shift year to year)
- **Monthly temperature arrays** (Jan/Dec values commonly too low — always fetch from en.climate-data.org or climatestotravel.com)
- **Monthly rainfall arrays** (always fetch — do not estimate)
- Historical population figures (Soviet-era and 2010–2020 figures often off)
- City populations (secondary cities frequently wrong — note: some countries suppress this data entirely; if so, annotate)
- Homicide rate (often overstated)
- PM2.5 / air quality values (often understated — fetch from IQAir)
- Age at first marriage (men's age consistently understated)
- Mobile penetration (often overstated as "~100%")
- Primary/secondary school enrollment rates (often overstated as "~99%")
- Literacy rate (verify — do not assume)
- Fertility rate (verify from UN WPP)
- Median age (verify from UN WPP)
- Religion percentages (verify — CIA WF or national census)
- Ethnic composition percentages (verify — national census)
- Wage figures (if government does not publish: annotate as modelled — do not invent)
- Employment sector splits (if no labour force survey: annotate as modelled)

---

### How to annotate unverified values

Append `— est.; unverified — [reason]` directly in the field where the value appears. The annotation must be in the same field as the value, not in a comment.

```jsx
// ✅ CORRECT — reason included, annotation in-field
<KpiCard label="Solar irradiation" value="~1,700–2,200 kWh/m²"
  sub="Among highest globally — est.; unverified — no IQAir/NASA POWER search done" />

<BarRow label="Hypertension prevalence (est.; unverified — most recent WHO STEPS survey 2019; 2024 data not available)" value="~32%" pct={100} />

['Migrant workers abroad (est. — no official registry; ILO modelled)', '~2,000,000'],

<Panel title="Wages by Sector (est. — sectoral breakdown modelled from national avg + ILO ratios; no official data published)">

// ❌ WRONG — bare annotation, no reason
<BarRow label="Hypertension prevalence (est.)" value="~32%" pct={100} />
['Migrant workers abroad (est.)', '~2,000,000'],
```

**Common valid reasons:**

| Reason type | Example wording |
|---|---|
| No official registry | `no official registry; ILO modelled` |
| Modelled by international body | `WHO/UNICEF joint modelled estimate, not direct count` |
| Survey outdated | `most recent WHO STEPS survey is 2019; 2024 data not available` |
| Government does not publish | `[country] does not publish official homicide statistics; UNODC/WB modelled` |
| Derived/converted metric | `RSF rank 148/180 converted to score; RSF does not publish numeric score` |
| No passport-level breakdown | `origin % derived from border crossings; no passport-level breakdown published` |
| City boundary variation | `no inter-census registry; city boundaries vary by source` |
| Sectoral split modelled | `fuel-type split modelled, not metered per source` |
| Country suppresses data | `[country] does not publish city population data; estimate from UN/external sources` |

---

### Approved sources by data type

| Source | Use for |
|---|---|
| World Bank Open Data | GDP, per capita, growth, population, enrollment, health |
| IMF WEO / Article IV reports | Inflation, fiscal balance, debt ratios |
| National statistics agencies | Wages, employment, vital statistics, city populations |
| UNDP HDR | HDI, mean/expected years schooling, GII |
| UN World Population Prospects | Age structure, cohort data, fertility, median age |
| Transparency International | CPI / corruption index |
| RSF (Reporters Without Borders) | Press freedom ranking |
| WHO / World Bank health data | TB, infant mortality, health spending, disease burden |
| IEP (Institute for Economics & Peace) | Global Peace Index |
| ILO | Labour force, unemployment, informal employment |
| IQAir / WHO | Air quality (PM2.5) annual averages |
| UNWTO / national tourism agencies | Visitor numbers, visitor origins, tourism revenue |
| en.climate-data.org / climatestotravel.com / timeanddate.com | Monthly temperature and rainfall averages |
| Worldometer / populationpyramid.net | Population pyramid cohort data |
| OEC / national customs agencies | Export product shares and destination percentages |

### Gate output format — internal only

The gate process is executed internally. Do not narrate gate steps in prose. Output only the status line per section, using this exact format:

```
§1 Geography
[G1] N data points identified ✅
[G2] Searched N values ✅
[G3] N confirmed · N unverified (field name, field name — reason) ✅
[G4] JSX written ✅
[G5] All confirmed sourced · unverified annotated ✅
```

No gate descriptions. No bullet lists of what was searched. No explanations of what each gate means. The status line is the only output.

---

### Verification process — required sequence

<!-- TO REVIEW: this is a compressed summary of Gates 1–5 above. Consider whether it adds value or is redundant. -->

1. Read the full section before writing anything.
2. List every data point this section will contain (Gate 1).
3. Search every value individually before writing a single line of JSX (Gate 2).
4. Record confirmed value + source, or reason why unconfirmable (Gate 3).
5. Write the JSX with confirmed values sourced and unverified values annotated (Gate 4).
6. Self-check before moving to the next section (Gate 5).
7. Never present the file until all sections have cleared Gate 5.

---

## Inconsistency Check Protocol

### When to run
Run an inconsistency check **after all sections are written** and **before any commit**. Also run when the user asks "check for inconsistencies."

### What to check

Every value that appears in more than one place must be **identical** (or clearly labeled with different years/sources if they genuinely differ). The most common cross-section conflicts:

| At-a-Glance tile | Must match |
|---|---|
| GDP | §4 Economy KpiCard (same year) |
| GDP per Capita | §4 Economy KpiCard (same year) |
| GDP Growth | §4 Economy KpiCard (same year) |
| Population | §3 KpiCard · §3 Donut label · §3 population BarRows · any `<p>` text mentioning the figure |
| Life Expectancy (total / men / women) | §3 KpiCard · §9 Health KpiCard |
| Inflation | §4 KpiCard |
| Unemployment | §5 KpiCard |
| Literacy | §6 KpiCard |
| HDI | §6 KpiCard |
| Peace Index | §15 KpiCard · §15 Tbl |
| Area | §1 Geography KpiCard |
| Religion % | §3 Tbl |

Also check these cross-section pairs independently of At-a-Glance:

| Value | Appears in |
|---|---|
| Infant mortality | §9 KpiCard · §9 Health KpiCard |
| Foreign reserves | §4 Tbl · §14 KpiCard · §14 Tbl |
| Foreign investment | §4 Tbl · §14 KpiCard · §14 Tbl |
| Remittances | §4 Tbl · §5 KpiCard sub · §5 Donut Tbl · §5 paragraph |
| Gini coefficient | §4 Tbl · §14 KpiCard · §14 Tbl |
| Women in parliament | §14 KpiCard · §14 Tbl |
| Poverty rate | §4 Tbl · §14 KpiCard |
| Gold production | §4 Tbl · §11 KpiCard · §11 Tbl |
| Corruption CPI | §14 KpiCard · §14 Tbl · §15 BarRow |
| PM2.5 | §9 Tbl · §9 BarRow · §13 BarRow |

### How to run the check

1. `grep` for each value that appears multiple times — compare every instance
2. Any discrepancy: **search and confirm the correct value first**, then fix all instances in one edit pass
3. If two figures differ because they use different years, both must carry a year label in their `sub` or Tbl cell — a bare number with no year is never acceptable when multiple years exist in the same dashboard

### Known traps — do not confuse these

- **Area**: multiple sources cite different figures for the same country. Use FAO / CIA World Factbook / World Bank. Do **not** use Wikipedia or Worldometer for area.
- **Population**: the national statistics agency mid-year figure is the most current. Worldometer is often 3–6 months behind. Always use the national agency figure and label it with the exact date (e.g. `Jul 2025: 37,859,698`).
- **Life expectancy**: national statistics agencies often report ~2 years higher than World Bank (different methodology). Use the national agency figure for the `sub` note and cite it. Make the at-a-glance note and the section KpiCard sub consistent — use the **same source** for both.
- **GDP**: at-a-glance tiles typically show the most recent confirmed year (e.g. World Bank 2024 final). §4 may show a 2025 estimate. These may legitimately differ — both must carry their year label clearly.

### Fix procedure

When an inconsistency is found:
1. Search and confirm the correct value via web search
2. Report what was found (both the wrong value and the confirmed correct value, with source)
3. Fix **all instances** in one edit pass — never fix only one occurrence and leave others wrong
4. Cite the source in every `sub` / Tbl cell that carries the fixed value

---

## Approval & Versioning Protocol

---

### ⛔ HARD RULE — THIS APPLIES TO EVERY CHANGE WITHOUT EXCEPTION

**Completing the task is never more important than following this process. Errors and bugs are not exceptions. Urgency is not an exception. There are no exceptions.**

If this process is skipped, the output is invalid regardless of whether it works.

---

### STEP 1 — PROPOSE BEFORE TOUCHING ANYTHING

Before modifying any file, Claude must output this block in the chat and stop:

```
Proposed change: [exactly what will be changed]
Reason: [why]
File: [current filename → new filename with incremented version]
Awaiting approval.
```

**Do not open the file. Do not run any command. Do not write any code. Stop and wait.**

If the user has not responded with approval, no change has been authorised. Proceeding without this block in the chat is a protocol violation.

---

### STEP 2 — INCREMENT VERSION FIRST

After approval, the **first and only** action is to copy the file to the new version number:

```bash
cp [country]-dashboard-v[N].jsx [country]-dashboard-v[N+1].jsx
```

No edits until the new file exists. Never modify the current version file directly. If the copy has not been made, no editing may begin.

Version numbering: `v1 → v2 → v3...` — every meaningful change increments. A meaningful change is any edit to data, layout, logic, or structure. Fixing a typo in a comment is not meaningful. Everything else is.

---

### STEP 3 — MAKE ONLY THE APPROVED CHANGE

Make exactly and only what was proposed in Step 1. Nothing more.

- Asked to fix a color → fix only that color. Do not also fix label colors, legend colors, or spacing.
- Asked to fix a bug → fix only that bug. Do not also refactor, clean up, or improve nearby code.
- Asked to update a value → update only that value. Do not also update related values not mentioned.

Every additional change requires its own Step 1 proposal and approval.

---

### STEP 4 — PRESENT THE FILE

After the approved change is made: present the new versioned file immediately. Do not make further changes before presenting.

---

### Why this process exists

The pattern that required this protocol: Claude repeatedly read and acknowledged the rules, then bypassed them when focused on solving a problem — weighting "fix the issue" above "follow the process." This is not fixed by reminders or apologies. It is fixed by making the process structural: the proposal block must appear in the chat before any action, making it impossible to act without first producing visible evidence of the gate.

---

### One task at a time

Do not chain unrequested changes. Do not fix things that weren't broken. Do not improve things that weren't asked about. Each task is its own cycle of Step 1 → approval → Step 2 → Step 3 → Step 4.
