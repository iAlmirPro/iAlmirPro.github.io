# Country Dashboard — Design System
> Last updated: May 2026 — reflects all changes through the Kyrgyzstan/Kazakhstan/Tajikistan/Uzbekistan session.
> Use this file as the single source of truth for all future country dashboards.

---

## Approval Protocol & Versioning

### Approval Protocol
- **Never make changes without explicit final approval.** Always propose first, describe in plain language, wait for confirmation, then act.
- **Always ask before acting** — even when the fix seems obvious.
- Report findings (color audits, duplicate checks, etc.) first — ask what to do next before touching anything.
- One approved task at a time — do not chain unrequested changes.
- **Never change anything not explicitly requested** — e.g. if asked to change bar colors, do not also change label colors.

### No Exceptions Rule
- **"Obvious" fixes are not exceptions.** A bug, an overflow, a broken layout — none of these bypass the approval protocol. Propose first, always.
- **Screenshots and error reports are findings, not work orders.** When the user shares a screenshot showing a problem, respond by describing what you see and what you would change — then STOP and wait.
- **The correct response to any reported problem is:** "I can see [X]. I would fix it by [Y]. Shall I proceed?"
- **Never interpret a problem report as implicit approval to fix it.**

### Versioning Convention
- Every meaningful change = new version: `v1 → v2 → v3...`
- **Never overwrite** an existing version — copy first, then edit.
- Always present `.jsx` after each version.

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
5. Replace all data section by section — verify every KPI value via web search
6. Run duplicate check: no label/key should appear in both a visual component and a table row — if duplicated, remove the table row; the visual takes priority
7. Run color audit: max 2 colored KpiCards per section, balanced across dashboard
8. Add `GradientBar` and `AgeBar` components (see Visualization Components section)
9. Insert the three standard `GradientBar` visualizations into §2 Climate and §8 Tourism panels
10. Insert `AgeBar` into §3 Population Growth panel
11. Insert Trade Balance `GradientBar` into §10 Key Fiscal Indicators panel
12. Run syntax check: `grep -n 'value:"\|sub:"\|accent:"'` — must return zero results
13. Present `.jsx` for download

---

## File Structure

```
[country]-dashboard-v1.jsx    ← React JSX source
```

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

### Color Semantic Meaning

```
primary (kg / kaz / uz / tj / tm)  →  max / high / hot / headline metric
yel                                 →  avg / mid / opportunity / positive trend
red                                 →  warning / critical / negative / risk / Record High temp
blu                                 →  min / low / cold / water / depth / Record Low temp
dim                                 →  neutral — default for most cards
```

**Mandatory color assignments:**
- `accent={C.red}` — **Record High** temperature KpiCard (all countries)
- `accent={C.blu}` — **Record Low** temperature KpiCard (all countries)

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
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, paddingTop:24 }}>
    <span style={{ color:C.txt, fontSize:16, flexShrink:0 }}>{icon}</span>
    <span style={{ fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', color:C.txt, fontWeight:500 }}>{label}</span>
  </div>
);
```

Usage: `<SectionHeader icon={Icons.mountain} label="Geography & Landscape" />`

- No border-top, no rule line — clean minimal header
- `paddingTop: 24` creates spacing from the section above
- `marginBottom: 28` before the first KPI grid

---

### `<KpiCard>`

```jsx
const KpiCard = ({ label, value, sub, accent = C.kg, delay = 0 }) => {
  const valColor = accent === C.kg ? C.kgL : accent === C.yel ? C.yelL : accent === C.red ? C.redL : accent === C.blu ? C.bluL : C.txt;
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
  <KpiCard label="GDP Nominal" value="$17.5B" sub="World Bank 2024" accent={C.kg} delay={0.05} />
</div>
```

---

### `<Panel>`, `<BarRow>`, `<Tbl>`, `<RegCard>`, `<DlRow>`, `<Donut>`

See `kyrgyzstan-dashboard.jsx` for full component source — these are unchanged from the original design system.

**Panel usage:**
```jsx
<div className="col-12 col-md-6">
  <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
    <Tbl rows={[...]} />
    <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
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

**Visitor / Export Origins Row** (used in §8 Tourism and §10 Export destinations):
```jsx
{[
  { flag:'🇷🇺', country:'Russia',     val:'largest source market',       pct:'~38%' },
  { flag:'🇰🇿', country:'Kazakhstan', val:'frequent short-stay visitors', pct:'~22%' },
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
  <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.kg}`, marginBottom:14 }}>
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
  people,      // §3 Population, §9 Vital Statistics, §13 Health, §14 Social, tourism origins
  chart,       // §4 Economy, §10 Fiscal, §9 Causes of Death, GDP statistics
  briefcase,   // §5 Employment, §8 Tourism, §16 Business
  graduation,  // §6 Education
  landmark,    // §7 Political, cities, heritage, facts tables
}
```

SVG paths are copied verbatim from Font Awesome 6 free set — see `kyrgyzstan-dashboard.jsx` `Icons` object for full `<path d="...">` values.

---

### `<GradientBar>` ← NEW

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
| `invertPeak` | false | Peak marker on minimum value instead of maximum |
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
| §10 Fiscal | Key Fiscal Indicators | Trade balance 2015–2024 ($B) | trade colorStops + `absScale={true}` |

All three climate/tourism bars placed at the **bottom of their panel**, after the interpretive note.

---

### `<AgeBar>`

Stacked dual-bar visualization for population age structure. Male on top (blue), female below (red). 16 discrete 5-year cohort chunks with % labels inside each chunk. Two median age marker lines.

```jsx
const AgeBar = ({ title, male, female, medianM, medianF }) => {
  const maleColor = '#2E86DE';
  const femaleColor = '#E8192C';
  const decadeLabels = [0,10,20,30,40,50,60,70,80];
  const maxVal = Math.max(...male, ...female);
  const barH = 26;
  const chunkColor = (v, hex) => {
    const alpha = (v / maxVal);
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.round(153+(r-153)*alpha)},${Math.round(153+(g-153)*alpha)},${Math.round(153+(b-153)*alpha)})`;
  };
  // Formula: 153 + (peak_channel - 153) * alpha  →  #999 at zero, full color at max
  const medMPct = Math.min((medianM / 80) * 100, 100);
  const medFPct = Math.min((medianF / 80) * 100, 100);
  const darkM = /* per-country darkened blue — e.g. '#1a5fa0' */;
  const darkF = '#a01020';
  const renderBar = (arr, color, radius) => (
    <div style={{ height:barH, borderRadius:radius, overflow:'hidden', display:'flex' }}>
      {arr.map((v, i) => (
        <div key={i} style={{
          flex:1, background:chunkColor(v, color),
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:7, color:'rgba(255,255,255,0.85)', fontWeight:600, lineHeight:1
        }}>
          {v.toFixed(1)}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ marginTop:14 }}>
      {title && <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{title}</div>}
      <div style={{ position:'relative' }}>
        {renderBar(male, maleColor, '4px 4px 0 0')}
        <div style={{ height:2, background:C.bg }} />
        {renderBar(female, femaleColor, '0 0 4px 4px')}
        <div style={{ position:'absolute', top:2, height:barH-4, left:`${medMPct}%`,
          width:1, background:darkM, transform:'translateX(-50%)', borderRadius:1, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:barH+4, height:barH-4, left:`${medFPct}%`,
          width:1, background:darkF, transform:'translateX(-50%)', borderRadius:1, pointerEvents:'none' }} />
      </div>
      <div style={{ position:'relative', height:18, marginTop:3 }}>
        {decadeLabels.filter(age => age !== 0 && age !== 80).map(age => (
          <div key={age} style={{ position:'absolute', left:`${(age/80)*100}%`, transform:'translateX(-50%)', textAlign:'center' }}>
            <div style={{ fontSize:8, color:C.sub, lineHeight:1 }}>{age}y</div>
          </div>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginTop:3, fontSize:9, color:C.sub, flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ display:'inline-block', width:10, height:4, background:maleColor, borderRadius:1 }} />
          Male (median <strong style={{ color:maleColor }}>{medianM} yrs<span style={{ color:C.sub, fontWeight:300 }}>)</span></strong>
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ display:'inline-block', width:10, height:4, background:femaleColor, borderRadius:1 }} />
          Female (median <strong style={{ color:femaleColor }}>{medianF} yrs<span style={{ color:C.sub, fontWeight:300 }}>)</span></strong>
        </span>
      </div>
    </div>
  );
};
```

**Chunk color formula:** `153 + (peak_channel - 153) * alpha` — zero cohort = `#999` (C.sub), max cohort = full `maleColor`/`femaleColor`. Consistent with GradientBar #999 baseline.

**Male color:** Always `#2E86DE` — fixed across all dashboards to avoid conflict with female (`#E8192C`).

**Per-country `darkM`** (median line, darkened blue):

| Country | `darkM` |
|---|---|
| Kyrgyzstan | `#1a5fa0` |
| Kazakhstan | `#006d7e` |
| Tajikistan | `#145a24` |
| Uzbekistan | `#0e6d8c` |
| Turkmenistan | `#1a5fa0` |

**Median lines:** `width:1`, `height:barH-4` (22px), 1px wide, `borderRadius:1`
- Male: `top:2` (inside male bar)
- Female: `top:barH+4` = `top:30` (inside female bar)

**Bar height:** `barH = 26px` per bar; 2px gap between bars

**Chunk labels:** `fontSize:7`, `color:'rgba(255,255,255,0.85)'`, `fontWeight:600` — white text inside each chunk showing `v.toFixed(1)`

**X-axis:** Labels `10y`, `20y`, `30y`, `40y`, `50y`, `60y`, `70y` — 0 and 80 hidden

**Legend:** Centered (`justifyContent:'center'`). `)` rendered as `<span style={{ color:C.sub, fontWeight:300 }}>)</span>` inside `<strong>` to prevent JSX whitespace gap.

**Data:** 16 cohorts (0–4 through 75–79+), values as **% of total population** (not % of each sex). Male and female arrays each sum to ~50%. Source: UN WPP 2024 / national census.

**Placement:** Bottom of **Population Growth** panel in §3, after interpretive note.

---

## Standard Section Structure

Each section follows this pattern:

```jsx
{/* ══ N. SECTION NAME ══ */}
<SectionHeader icon={Icons.chart} label="Section Name" />

{/* KPI card grid */}
<div className="row g-1 mb-3">
  <div className="col-6 col-md-4 d-flex"><KpiCard ... /></div>
  <div className="col-6 col-md-4 d-flex"><KpiCard ... /></div>
  {/* 6–9 cards */}
</div>

{/* Panel row */}
<div className="row gy-3 mb-3">
  <div className="col-12 col-md-6">
    <Panel title="..." icon={Icons.chart}>
      <BarRow ... />
      <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Note.</p>
      {/* GradientBar or AgeBar inserted here if applicable */}
    </Panel>
  </div>
</div>
```

---

## All 17 Dashboard Sections

### Core sections (1–9, all country dashboards)

| # | Label | Icon | KPI cards | Panels | Visualizations |
|---|---|---|---|---|---|
| 1 | Geography & Landscape | mountain | 9 | Terrain zones (bars) · Water bodies (table) · Region cards (4×RegCard) | — |
| 2 | Climate: Weather, Daylight & Rainfall | cloudSun | 9 | Daylight hours (DlRow×12) · Rainfall by region (bars) | **GradientBar: temperature + rainfall** at bottom of Rainfall panel |
| 3 | Population & Demographics | people | 6 | Population growth (bars) · Largest cities (bars) · Ethnic composition (donut) · Religion & language (table) | **AgeBar** at bottom of Population Growth panel |
| 4 | Economy & Finance | chart | 6 | GDP by sector (donut + export bars) · Key economic indicators (table) · Real estate cards | — |
| 5 | Employment & Wages | briefcase | 6 | Wages by sector (bars) · Employment by sector (donut + table) | — |
| 6 | Education & Human Development | graduation | 6 | Education metrics (bars) · Key education facts (table) | — |
| 7 | Political Landscape | landmark | 6 | Election results (bars) · Political timeline (inline) | — |
| 8 | Tourism | briefcase | 6 | Visitor origins (flag+%+desc rows) · Tourism highlights (table) | **GradientBar: tourism intensity** at bottom of Tourism Highlights panel |
| 9 | Vital Statistics | people | 6 | Causes of death (bars — NOT donut) · Marriage & vital trends (table) | — |

### Extended sections (10–17)

| # | Label | Icon | KPI cards | Panels | Visualizations |
|---|---|---|---|---|---|
| 10 | Economic Depth & Fiscal Position | chart | 9 | Export destinations (flag+% rows) · Key fiscal indicators (table) | **GradientBar: trade balance 2015–2024** at bottom of Key Fiscal Indicators panel |
| 11 | Energy & Resources | mountain | 6 | Electricity mix (donut) · Energy & resources facts (table) | — |
| 12 | Infrastructure & Digital Connectivity | map | 6 | Key infrastructure projects (table) · Digital indicators (bars) | — |
| 13 | Health System | people | 6 | Health system facts (table) · Disease & health burden (bars) | — |
| 14 | Social Indicators & Inequality | people | 6 | Social cohesion & gender (table) · Access & basic services (bars) | — |
| 15 | Environment & Climate | water | 6 | Environmental facts (table) · Air quality & pollution sources (bars) | — |
| 16 | Business & Investment Climate | briefcase | 6 | Investment climate summary (table) · Key risks & opportunities (bars) | — |
| 17 | Crime & Security | landmark | 6 | Crime & security indicators (table) · Security context (bars) | — |

---

## Hero Section

```jsx
<div style={{ padding:'20px 0 0', display:'grid', gridTemplateColumns:'1fr auto',
  alignItems:'end', gap:32, marginBottom:8 }}>
  <div>
    <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase',
      color:C.kg, marginBottom:14 }}>Country Dashboard 2025</div>
    <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900,
      fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9,
      letterSpacing:'-0.02em', marginBottom:16 }}>
      Kyrgy<em style={{ fontStyle:'italic', color:C.kg, fontWeight:400 }}>zstan</em>
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
<div style={{ padding:'8px 0 0', marginTop:8 }}>
  <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
    Sources: NSC KR · World Bank · IMF 2025 · ... · Data as of May 2026.
  </p>
  <p style={{ fontSize:9.5, color:'#444', marginTop:6, lineHeight:1.6 }}>
    Generated [Month Year] · Claude Sonnet 4.5 (Anthropic) · iAlmirPro
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

### ⚠️ MANDATORY RULE — NO EXCEPTIONS

**Every single data value in every dashboard must be confirmed via web search before it is written into the file.**

- **No assumptions.** Training knowledge is not a source. A value that "sounds right" is not verified.
- **No test data.** Placeholder numbers, rounded guesses, and carry-overs from similar countries are forbidden.
- **No prioritising.** There is no tier of "important" vs "minor" values. Every KpiCard value, every BarRow value, every Tbl row value, every GradientBar array, every Donut segment percentage, every AgeBar cohort, every narrative figure inside `<p>` text — all must be searched and confirmed individually.
- **No batching without searching.** Do not write a batch of 30 values and search 10 of them. Search first, write after.
- **No deferring.** A value is either confirmed (search done, source found) or it is unverified. There is no middle ground of "probably correct" or "will check later."

### The only two valid states for any value

| State | Meaning | What to do |
|---|---|---|
| **Confirmed** | Web search returned a source that directly supports the value | Write the value; cite the source in the `sub` field |
| **Unverified** | No web search was done, or search returned no usable result | Write the value AND append `est.; unverified` to the `sub` field, label, or Tbl row |

### How to mark unverified values

Append `— est.; unverified` directly in the field where the value appears:

```jsx
// KpiCard sub text
<KpiCard label="Solar irradiation" value="~1,700–2,200 kWh/m²"
  sub="Among highest globally; ideal for solar — est.; unverified" />

// BarRow label
<BarRow label="Hypertension prevalence (est.; unverified)" value="~32%" pct={100} />

// Tbl row
['Presidential schools (elite)', '14 across the country — est.; unverified'],

// AgeBar title
<AgeBar title="Population age structure — est.; individual 5-yr cohort values unverified" ... />

// Panel title
<Panel title="Causes of Death (est.; breakdown unverified)" ...>
```

The annotation must appear **where the data is displayed**, not in a comment or elsewhere.

### Verification process — required sequence

1. **Read the full section** before writing anything.
2. **Search every value** in that section via web search. Run searches in parallel where possible.
3. **Record the confirmed value and source** for each data point.
4. **Write the value** with the source cited in `sub`.
5. **Mark anything unconfirmed** with `est.; unverified` before committing.
6. **Never commit a file** that contains unverified values without the `est.; unverified` annotation.

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
| en.climate-data.org / timeanddate.com | Monthly temperature and rainfall averages |
| Worldometer / populationpyramid.net | Population pyramid cohort data |
| OEC / national customs agencies | Export product shares and destination percentages |

### Known high-error fields — always search these

These fields are systematically wrong when generated from training data alone:

- GDP total and per capita (often overstated)
- Tourism visitor count and **visitor origin percentages** (origin ranking is frequently wrong)
- Export product shares and percentages (proportions shift year to year)
- Monthly temperature arrays (Jan/Dec are commonly too low)
- Historical population figures (Soviet-era and 2010–2020 figures often off)
- City populations (secondary cities frequently wrong)
- Homicide rate (often overstated)
- PM2.5 / air quality values (often understated)
- Age at first marriage (men's age consistently understated)
- Mobile penetration (often overstated as "~100%")
- Primary/secondary school enrollment rates (often overstated as "~99%")

---

## Approval & Versioning Protocol

- **Never make changes without explicit approval** — always propose first, act only after confirmation
- **Always ask** before running a color audit, duplicate check, or any bulk change
- **Never change anything not explicitly asked for** — if asked to update bar colors, do not also update label colors, legend colors, or anything else
- **One task at a time** — do not chain unrequested changes
- **New version for every meaningful change:** `v1 → v2 → v3...`
- **Never overwrite** an existing version — copy first, then edit
- Present `.jsx` after each version
