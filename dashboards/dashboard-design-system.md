# Country Dashboard — Design System
> Extracted directly from `kyrgyzstan-dashboard.jsx`  
> Use this file as the single source of truth for all future country dashboards.  
> Every value, prop, and pattern below is taken verbatim from the working production file.

---

## Approval Protocol & Versioning
> ↩ Carried over from `dashboard-design-system.md` (v3 outputs) — process rules established during Kyrgyzstan v1→v7 session

### Approval Protocol
- **Never make changes without explicit final approval.** Always propose first, describe in plain language, wait for confirmation, then act.
- Report findings (color audits, duplicate checks, etc.) first — ask what to do next before touching anything.
- One approved task at a time — do not chain unrequested changes.

### Versioning Convention
- Every meaningful change = new version: `v1 → v2 → v3...`
- **Never overwrite** an existing version — copy first, then edit.
- Always present `.jsx` after each version.

---

## Quick-Start Checklist (new country)
> ↩ Step 6 (duplicate check) carried over from `dashboard-design-system.md` (v3 outputs)

1. Copy `kyrgyzstan-dashboard.jsx` as `[country]-dashboard-v1.jsx`
2. Update the `C` color object with the new country's flag colors
3. Update the `Flag` SVG component
4. Update hero H1, eyebrow label, description text
5. Replace all data section by section — verify every KPI value via web search
6. Run duplicate check: no label/key should appear in both a visual component and a table row — if duplicated, remove the table row; the visual takes priority
7. Run color audit: max 2 colored KpiCards per section, balanced `kg/yel/blu` across dashboard
8. Present `.jsx` for download

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
  kg:   '#E8192C', kgL: '#ff3347',   // primary — country color 1
  yel:  '#F0B830', yelL: '#ffd060',   // secondary — country color 2
  blu:  '#2E86DE', bluL: '#5ba8ff',   // water / cold / third accent
  bg:   '#000',   card: '#111',  border: '#1e1e1e',
  track:'#222',   txt:  '#fff',  sub:   '#999',  dim: '#444',
};
```

### Known Country Palettes

```
Kyrgyzstan:  kg #E8192C / kgL #ff3347   yel #F0B830 / yelL #ffd060   blu #2E86DE / bluL #5ba8ff
Kazakhstan:  kaz #00AFCA / kazL #33c8df  yel #FFC72C / yelL #ffd966   blu #2E86DE / bluL #5ba8ff
Uzbekistan:  uz #1EB4E5 / uzL #55ccf5   grn #3DAA5C / grnL #5dc97c   blu #2E86DE / bluL #5ba8ff
Iran:        ir #239F40 / irL #3dc95a   red #C8102E / redL #f03050   gld #D4AF37 / gldL #f0cc55
```

### KpiCard Value Color Logic

The value text color is derived from the accent:
```js
const valColor = accent === C.kg  ? C.kgL  :
                 accent === C.yel ? C.yelL :
                 accent === C.blu ? C.bluL : C.txt;
```
When `accent={C.dim}`, value text renders as `C.txt` (white).

### Color Rules for KPI Card Decks

These rules prevent color overuse:

1. **White dominates** — `C.dim` is the default for most cards in every section
2. **Max 2 colored cards per section** — at most 2 KpiCards in each grid use a named accent
3. **1 colored card preferred** — use 2 only when two metrics genuinely need highlighting
4. **Balance across the full dashboard** — `kg`, `yel`, `blu` should appear roughly equally in total
5. **Color by meaning:**
   - `primary (kg/kaz/uz/ir)` → headline achievement or most critical warning
   - `yel` → positive trend, opportunity, or important context
   - `blu` → water, cold, geographic depth, or fiscal milestone
6. **Order cards by importance** — strongest/most important metric first, warnings last
7. **Never use undefined color variables** — e.g. `C.red` and `C.blue` do not exist in Kyrgyzstan palette


### Color Semantic Meaning
> ↩ Carried over from `kazakhstan-design-system.md` (project file)

```
primary (kg / kaz / uz / ir)  →  max / high / hot / headline metric
yel                           →  avg / mid / opportunity / positive trend
blu                           →  min / low / cold / water / depth
dim                           →  neutral — default for most cards
```

---

## CSS Boilerplate

Placed inside a `<style>` tag rendered at the top of the component:

> ↩ `html, body { overflow-x: hidden; }` carried over from `kazakhstan-design-system.md` (project file) — prevents horizontal scroll on mobile

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { overflow-x: hidden; }
body { background: #000; }
.dash {
  background: #000; color: #fff;
  font-family: 'Inter', sans-serif; font-weight: 300; line-height: 1.6;
  padding: 0 22px 80px; max-width: 1020px; margin: 0 auto;
}
@keyframes up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
.kpi { animation: up .4s ease forwards; opacity: 0; }
/* CRITICAL: scope to .g-1 only — do NOT override all .row or gy-* breaks on mobile */
.row.g-1 { --bs-gutter-x: 2px; --bs-gutter-y: 2px; margin-bottom: 2px; }
```

> ↩ Carried over from `dashboard-design-system.md` (v3 outputs)  
> ⚠️ **CSS Override Warning**  
> Scope the row override to `.row.g-1` **only** — never `.row` globally.  
> A global `.row` override kills Bootstrap's `gy-*` vertical gap classes, causing **zero gap** between stacked panels on mobile.

Bootstrap 5 loaded dynamically (prevents CDN link duplication):
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
  const valColor = accent === C.kg ? C.kgL : accent === C.yel ? C.yelL : accent === C.blu ? C.bluL : C.txt;
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

Usage:
```jsx
<div className="col-6 col-md-4 d-flex">
  <KpiCard label="GDP Nominal" value="$17.5B" sub="World Bank 2024" accent={C.kg} delay={0.05} />
</div>
```

- `delay` staggers the fade-up animation: use `0.05, 0.10, 0.15...` increments
- `accent={C.dim}` = white value text, dim stripe — default/neutral card
- Bottom stripe is `2px` tall, full width, positioned `absolute`

---

### `<Panel>`

```jsx
const Panel = ({ title, icon, children }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'24px 20px', height:'100%' }}>
    <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt,
      marginBottom:16, paddingBottom:11, borderBottom:`1px solid ${C.border}`,
      display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ color:C.txt, flexShrink:0 }}>{icon}</span>{title}
    </div>
    {children}
  </div>
);
```

Usage:
```jsx
<div className="col-12 col-md-6">
  <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
    <Tbl rows={[...]} />
    <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
      Interpretive note here — what do these values mean? High/low/normal?
    </p>
  </Panel>
</div>
```

**Every panel must end with an interpretive note** (the `<p>` tag above). This explains the values in context — comparing to global averages, regional peers, or historical benchmarks.

---

### `<BarRow>`

```jsx
const BarRow = ({ label, value, pct, color = C.kg }) => (
  <div style={{ marginBottom:13 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline',
      fontSize:12, color:C.sub, marginBottom:5, gap:4 }}>
      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{label}</span>
      <span style={{ color:C.txt, fontWeight:500, flexShrink:0, whiteSpace:'nowrap' }}>{value}</span>
    </div>
    <div style={{ height:6, background:C.track, borderRadius:3, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3 }} />
    </div>
  </div>
);
```

Usage: `<BarRow label="Services" value="52%" pct={52} color={C.kg} />`

- `pct` is a number 0–100 representing the bar fill width as a percentage
- The highest bar in a group typically gets `pct={100}`; others are relative to it
- Use `color={C.dim}` for neutral/lower-priority rows

---

### `<Tbl>`

```jsx
const Tbl = ({ rows }) => (
  <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
    <tbody>
      {rows.map(([l, v], i) => (
        <tr key={i} style={{ borderBottom: i < rows.length-1 ? `1px solid ${C.border}` : 'none' }}>
          <td style={{ padding:'9px 4px', fontSize:12.5, color:C.sub, width:'58%', overflowWrap:'break-word' }}>{l}</td>
          <td style={{ padding:'9px 4px', fontSize:14, color:C.txt, fontWeight:500, textAlign:'right', fontFamily:'Fraunces,serif', overflowWrap:'break-word' }}>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
```

Usage:
```jsx
<Tbl rows={[
  ['Marriage rate (per 1,000)', '~9.0'],
  ['Divorce rate (per 1,000)', '~1.8'],
  ['Avg age at first marriage (women)', '~23 yrs'],
]} />
```

- Left column: `#999`, 58% width, label text
- Right column: white, Fraunces 700, 14px, right-aligned
- No border on last row
- **Do not repeat data** already shown in a KpiCard or BarRow

---

### `<RegCard>`

```jsx
const RegCard = ({ name, type, desc, stripe }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px',
    position:'relative', overflow:'hidden', height:'100%' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:stripe }} />
    <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:15, color:C.txt, marginBottom:3 }}>{name}</div>
    <div style={{ fontSize:10, letterSpacing:'0.09em', textTransform:'uppercase', color:C.sub, marginBottom:9 }}>{type}</div>
    <div style={{ fontSize:12, color:'#888', lineHeight:1.6 }}>{desc}</div>
  </div>
);
```

Usage:
```jsx
<div className="col-6 col-md-3 d-flex">
  <RegCard name="Bishkek & Chui" type="Capital · northern valley" desc="Capital city (1.1M)..." stripe={C.kg} />
</div>
```

- Top stripe: `3px`, color = `stripe` prop
- Always 4 cards in a row: `col-6 col-md-3`

---

### `<DlRow>` (Daylight Hours)

```jsx
const DlRow = ({ mo, label, pct, color = C.kg, dark = false }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
    <span style={{ fontSize:10, letterSpacing:'0.05em', textTransform:'uppercase',
      color:C.sub, width:24, flexShrink:0 }}>{mo}</span>
    <div style={{ flex:1, height:18, background:C.track, borderRadius:3, overflow:'hidden', minWidth:0 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3,
        display:'flex', alignItems:'center', paddingLeft:6 }}>
        <span style={{ fontSize:9, fontWeight:500, color: dark ? '#000' : '#fff',
          whiteSpace:'nowrap', overflow:'hidden' }}>{label}</span>
      </div>
    </div>
  </div>
);
```

Usage:
```jsx
{ mo:'Jun', label:'15h 22m ★', pct:100, color:C.yel, dark:true }
{ mo:'Jan', label:'9h 40m',    pct:38,  color:C.blu }
// default color is C.kg when not specified
.map(r => <DlRow key={r.mo} mo={r.mo} label={r.label} pct={r.pct} color={r.color || C.kg} dark={r.dark} />)
```

- `dark:true` renders the label text in black (for bright yellow fills)
- Jun solstice: `pct:100`, `color:C.yel`, `dark:true`
- Dec/Jan/Feb: `color:C.blu` for winter months
- Other months: `color:C.kg` (default)

---

### `<Donut>`

```jsx
const Donut = ({ segments, label, sublabel, size = 160 }) => {
  const r = 54, cx = 80, cy = 80, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map(s => {
    const dash = (s.pct / 100) * circ;
    const gap  = circ - dash;
    const rot  = (offset / 100) * 360 - 90;
    offset += s.pct;
    return { ...s, dash, gap, rot };
  });
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        <svg width={size} height={size} viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.track} strokeWidth={stroke} />
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={0}
              transform={`rotate(${s.rot} ${cx} ${cy})`}
            />
          ))}
        </svg>
        <div style={{ position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22, lineHeight:1, color:C.txt }}>{label}</div>
          {sublabel && <div style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginTop:3 }}>{sublabel}</div>}
        </div>
      </div>
      <div style={{ flex:1, minWidth:120 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }} />
            <span style={{ fontSize:11, color:C.sub, flex:1, lineHeight:1.3 }}>{s.label}</span>
            <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:12, color:C.txt }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

Usage:
```jsx
<Donut
  label="7.3M"
  sublabel="population"
  segments={[
    { label:'Kyrgyz',            value:'75.9%', pct:75.9, color:C.kg  },
    { label:'Uzbek',             value:'14.5%', pct:14.5, color:C.yel },
    { label:'Russian',           value:'5.1%',  pct:5.1,  color:C.blu },
    { label:'Dungan',            value:'1.1%',  pct:1.1,  color:'#888'},
    { label:'Other (90+ groups)',value:'3.4%',  pct:3.4,  color:C.dim },
  ]}
/>
```

**Use donuts for:** Ethnic composition, GDP by sector, Employment by sector, Energy mix  
**Do NOT use donuts for:** Causes of Death — use `<BarRow>` instead  

SVG geometry: `viewBox="0 0 160 160"`, `r=54`, `cx=cy=80`, `strokeWidth=22`  
Segments start at 12 o'clock (−90°), proceed clockwise via cumulative offset.

---

### `<Flag>` (Kyrgyzstan — adapt per country)

```jsx
const Flag = () => (
  <div style={{ width:90, height:54, background:C.kg, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px rgba(232,25,44,.45)`, flexShrink:0, position:'relative',
    display:'flex', alignItems:'center', justifyContent:'center' }}>
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" stroke={C.yel} strokeWidth="2.5" fill="none"/>
      {Array.from({length:40}).map((_,i)=>{
        const a = (i/40)*Math.PI*2;
        const x1=22+7*Math.cos(a), y1=22+7*Math.sin(a);
        const x2=22+18*Math.cos(a), y2=22+18*Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.yel} strokeWidth="1.2"/>;
      })}
      <circle cx="22" cy="22" r="6" stroke={C.yel} strokeWidth="2" fill="none"/>
    </svg>
  </div>
);
```

All flags: `90×54px`, `border-radius: 3px`, `box-shadow: 0 4px 24px rgba(R,G,B,.45)`  
The rgba values come from the primary country color.

---

### Visitor / Export Origins Row (inline pattern)

```jsx
{[
  { flag:'🇷🇺', country:'Russia',     val:'largest source market',       pct:'~38%' },
  { flag:'🇰🇿', country:'Kazakhstan', val:'frequent short-stay visitors', pct:'~22%' },
].map(({ flag, country, val, pct }) => (
  <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:`1px solid ${C.border}` }}>
    <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
    <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
    <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
    <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.kgL, flexShrink:0 }}>{pct}</span>
  </div>
))}
```

Layout: `flag (18px) | country name | description (flex:1, #999) | percentage (Fraunces 700, primary-L color)`  
Always include verified percentages. Use for both Tourism visitor origins and Export destinations.

---

### Political Timeline (inline pattern)

```jsx
{[
  { yr:'1991', tx:'Kyrgyzstan declares independence...' },
  { yr:'2005', tx:'"Tulip Revolution" ousts Akayev...' },
].map(({ yr, tx }) => (
  <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.kg}`, marginBottom:14 }}>
    <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.yel, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
    <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
  </div>
))}
```

- Left border uses primary country color
- Year text uses secondary color (yellow)
- Event text: 12.5px, `#888`

---

### Inline Divider

```jsx
<div style={{ height:1, background:C.border, margin:'16px 0' }} />
```

Use inside panels to separate sub-sections (e.g. between GDP sector donut and export bars).

---

### Panel Note (mandatory on every panel)

```jsx
<p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
  Interpretive text here — what do these values mean? High/low/normal compared to global or regional benchmarks.
</p>
```

Every panel ends with this note. It answers: *"So what?"* — is this value good, bad, typical? Compare to global average, regional peers, or historical trend.

If a panel already has a descriptive paragraph, append the note after it.

**JSX special chars:** Use `&lt;` for `<` inside note text (e.g. `&lt;10/100K`) to avoid Babel parse errors.

---

## Icons Library

All icons: `width="14" height="14"`, `fill="currentColor"`, used in `<SectionHeader>` and `<Panel>` title.

```js
const Icons = {
  mountain,    // geography, terrain, peaks
  map,         // regions, infrastructure
  water,       // rivers, lakes, environment
  cloudSun,    // climate
  sun,         // daylight hours
  rain,        // rainfall
  people,      // population, demographics, social, health, tourism origins
  chart,       // economy, GDP, statistics, causes of death
  briefcase,   // employment, business, tourism
  graduation,  // education
  landmark,    // political, cities, heritage, facts tables
}
```

SVG paths are copied verbatim from Font Awesome 6 free set — see the source file for full `<path d="...">` values.

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
    </Panel>
  </div>
  <div className="col-12 col-md-6">
    <Panel title="..." icon={Icons.landmark}>
      <Tbl rows={[...]} />
      <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Note.</p>
    </Panel>
  </div>
</div>
```

---

## All 17 Dashboard Sections

### Core sections (1–9, all country dashboards)

| # | Label | Icon | KPI cards | Panels |
|---|---|---|---|---|
| 1 | Geography & Landscape | mountain | 9 (area, elevation, peaks, borders, lakes, glaciers) | Terrain zones (bars) · Water bodies (table) · Region cards (4×RegCard) |
| 2 | Climate: Weather, Daylight & Rainfall | cloudSun | 9 (temps, records, rainfall, seasons) | Daylight hours (DlRow×12) · Rainfall by region (bars) |
| 3 | Population & Demographics | people | 6 (population, urban%, median age, density, life expectancy, fertility) | Population growth (bars) · Largest cities (bars) · Ethnic composition (donut) · Religion & language (table) |
| 4 | Economy & Finance | chart | 6 (GDP nominal, per capita, growth, PPP, inflation, currency) | GDP by sector (donut + export bars) · Key economic indicators (table) · Real estate cards (3× inline) |
| 5 | Employment & Wages | briefcase | 6 (avg wage, labour force, unemployment, informal, min wage, participation) | Wages by sector (bars) · Employment by sector (donut + table) |
| 6 | Education & Human Development | graduation | 6 (literacy, HDI, avg schooling, expected schooling, spending, universities) | Education metrics (bars) · Key education facts (table) |
| 7 | Political Landscape | landmark | 6 (system, president, parliament, next election, ruling party, independence) | Election results (bars) · Political timeline (inline) |
| 8 | Tourism | briefcase | 6 (visitors, revenue, top draw, visa-free, operators, target) | Visitor origins (flag+%+desc rows) · Tourism highlights (table) |
| 9 | Vital Statistics | people | 6 (births, natural increase, ages 0-14, ages 65+, deaths, infant mortality) | Causes of death (bars — NOT donut) · Marriage & vital trends (table) |

### Extended sections (10–17, added for deeper analysis)

| # | Label | Icon | KPI cards | Panels |
|---|---|---|---|---|
| 10 | Economic Depth & Fiscal Position | chart | 9 (reserves, budget, eurobond, credit rating, govt debt, FDI, external debt, trade balance, current account) | Export destinations (flag+% rows) · Key fiscal indicators (table) |
| 11 | Energy & Resources | mountain | 6 (generation, hydro capacity, untapped potential, investment, consumption, deficit) | Electricity mix (donut) · Energy & resources facts (table) |
| 12 | Infrastructure & Digital Connectivity | map | 6 (internet, mobile, roads, railway, fixed broadband, 5G) | Key infrastructure projects (table) · Digital indicators (bars) |
| 13 | Health System | people | 6 (health spending, OOP, spend per capita, TB incidence, TB mortality, air quality) | Health system facts (table) · Disease & health burden (bars) |
| 14 | Social Indicators & Inequality | people | 6 (poverty, Gini, rural/urban gap, gender inequality, women in parliament, gender gap index) | Social cohesion & gender (table) · Access & basic services (bars) |
| 15 | Environment & Climate | water | 6 (CO₂ per capita, hydro potential, total CO₂, glacier loss, water stress, PM2.5) | Environmental facts (table) · Air quality & pollution sources (bars) |
| 16 | Business & Investment Climate | briefcase | 6 (corporate tax, FDI, ease of doing business, VAT, corruption index, rule of law) | Investment climate summary (table) · Key risks & opportunities (bars) |
| 17 | Crime & Security | landmark | 6 (terrorism index, global peace index, homicide rate, press freedom, suicide rate, TB proxy) | Crime & security indicators (table) · Security context (bars) |

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

- H1: Fraunces 900, `clamp(44px,9vw,96px)`, `lineHeight:0.9`, `letterSpacing:'-0.02em'`
- Country name suffix in italic with `fontWeight:400` and primary color
- Eyebrow: 10px, uppercase, `letterSpacing:0.28em`, primary color
- Flag: top-right, `alignSelf:'flex-start'`, `marginTop:6`

---

## Footer / Sources Line

```jsx
<div style={{ padding:'8px 0 0', marginTop:8 }}>
  <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
    Sources: NSC KR · World Bank · IMF 2025 · ... · Data as of May 2026.
  </p>
</div>
```

---


## Data Verification Standard

All KPI values must be verified before publishing:

| Source | Use for |
|---|---|
| World Bank Open Data (data.worldbank.org) | GDP, per capita, growth, population |
| IMF WEO / Article IV reports | Inflation, fiscal balance, debt |
| National statistics agencies (NSC KR etc.) | Wages, employment, vital statistics |
| UNDP HDR | HDI, education, gender indices |
| Wikipedia economy/demographics articles | Cross-reference (acceptable when citing primary sources) |
| Transparency International | CPI / corruption index |
| RSF | Press freedom ranking |
| WHO / World Bank health data | TB, infant mortality, health spending |
| IEP (Institute for Economics & Peace) | Global Peace Index |

- Flag uncertain estimates with `~` prefix
- Cite the source in the `sub` field of KpiCard
- Always verify: GDP, population, inflation, poverty rate, remittances, tourism visitors
- Common errors found in AI-generated dashboards: GDP too high, poverty rate too low, tourism numbers unverified, tourist origin ranking wrong

---

## Approval & Versioning Protocol

- **Never make changes without explicit approval** — always propose first, act only after confirmation
- **Always ask** before running a color audit, duplicate check, or any bulk change
- **One task at a time** — do not chain unrequested changes
- **New version for every meaningful change:** `v1 → v2 → v3...`
- **Never overwrite** an existing version — copy first, then edit
- Present `.jsx` after each version
