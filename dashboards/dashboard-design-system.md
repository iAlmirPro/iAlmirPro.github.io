# Country Dashboard — Design System
> Last updated: June 2026 · Single source of truth for all future country dashboards.

---
> ⚠️ **FIRST ACTION IN EVERY NEW DASHBOARD CONVERSATION — NO EXCEPTIONS:**
> Output this block and stop:
> ```
> Pre-build declaration: [country]
> Gate process: will execute G1→G5 per constant, outputting status line before writing the constant
> No constant will be written until it clears Gate 5
> Constants will be built and artifact updated one at a time
> ```
---

## No Exceptions Rule
- A reported problem is a *finding*, not a work order. Respond: "I can see [X]. I would fix it by [Y]. Shall I proceed?"
- Never interpret a problem report as implicit approval to fix it.
- One approved task at a time. Never chain unrequested changes.

---

## Reference Files
`at-a-glance-instructions.md` — TILES structure, icon mapping · `country-map-instructions.md` — map projection, label script

---

## File Structure
Single `.jsx`: **DATA section** (`C`, `ERAS`, `TILES`, all constants — no JSX) · **TEMPLATE section** (`css`, components, `export default`)

---

## Data State Field
- `1` = verified — web search done, source cited in `sub`
- `-1` = NOT verified — training data / assumed / not cross-checked
- `0` = not tested — placeholder

**`-1` is not a soft warning.** The only path to `1` is a completed web search with a cited source.

---

## Hybrid Workflow — New Country

```bash
# Phase 1 — fetch all API data
python3 tools/fetch_dashboard_data.py <ISO3>
# → dashboards/data/<iso3>_data.json  (~170 verified data points + jsx_ready section)

# Phase 2 — copy template, reset state:0, inject auto constants, write cheatsheet
python3 tools/prefill_dashboard.py <ISO3>
# → dashboards/<country>-dashboard-v1.jsx
# → dashboards/<country>-cheatsheet.md  (141/149 items pre-formatted, state:1 ready)
```

**Phase 3 — Identity edits** (manual, before Gate process — see list below under Quick-Start step 4)

**Phase 4 — Gate process** (reduced scope):
- Open `<country>-cheatsheet.md` before each constant
- **Pre-fetched rows** → `state:1`, use value + sub directly, skip Gate 2 web search
- **Manual rows** → still require Gate 2 web search
- Gate 5 self-check runs regardless of source
- Handoff rule after each constant applies without exception

Auto-written by prefill (state:1, no manual work): `CLIMA_DAYLIGHT` · `VITA_DEATHS` · `ENERGY_MIX` · `POP_CITIES`

Manual-only (no API source): Currency · Religion · Language · HDI (if UNDP failed) · Energy/resources · Record High/Low temps · ERAS · POL_TIMELINE · TOUR_HIGHLIGHTS · narrative `note` fields

> Color placeholders `C.xxx`, `C.yyy` in cheatsheet and auto-blocks — replace with real palette keys after Phase 3.

---

## Quick-Start Checklist (new country)

Steps 1–3 (copy, reset state:0, present file) are handled by `prefill_dashboard.py`. Start from step 4.

**Step 4 — Identity edits** (only these, nothing else):
- `C` color object — flag colors; ISO 3166 Alpha-3 lowercase prefix (`kgz`, `kaz`, `uzb`, `tjk`, `tkm`); rename `xxxS` key
- `Flag` SVG component — update `${C.xxxS}` reference to match renamed key
- `valColor` function — update accent→light mappings for new `C` keys
- Template color keys — replace `C.[prev_primary]` / `C.[prev_secondary]` throughout TEMPLATE section
- Map values — ISO numeric, center, scale, capital coordinates, neighbour labels
- Header H1, eyebrow, description · Footer sources line and legal line

**Step 5 — Constant order** (Gate 1→5 per group, handoff after each):
1. ERAS
2. TILES
3. GEO · GEO_TERRAIN · GEO_WATER · GEO_REGIONS
4. CLIMA_KPI · CLIMA_DAYLIGHT · CLIMA_RAIN_REGIONAL · CLIMA_RAIN_SEASONAL
5. POP_KPI · POP_GROWTH · POP_CITIES · POP_ETHNIC · POP_RELIGION
6. ECON_KPI · ECON_GDP_DONUT · ECON_EXPORTS_BARS · ECON_INDICATORS
7. EMP_KPI · EMP_WAGES · EMP_SECTORS_DONUT · EMP_MIGRATION
8. EDU_KPI · EDU_METRICS · EDU_FACTS
9. POL_KPI · POL_ELECTION · POL_TIMELINE
10. TOUR_KPI · TOUR_ORIGINS · TOUR_HIGHLIGHTS
11. VITA_KPI · VITA_DEATHS · VITA_TRENDS · HEALTH_KPI · HEALTH_FACTS · HEALTH_BURDEN
12. ENERGY_KPI · ENERGY_MIX · ENERGY_FACTS
13. INFRA_KPI · INFRA_PROJECTS · INFRA_DIGITAL
14. SOCIAL_KPI · SOCIAL_SERVICES · SOCIAL_COHESION
15. ENV_KPI · ENV_FACTS · ENV_WATER
16. BIZ_KPI · BIZ_CLIMATE · BIZ_RISKS · FISCAL_KPI · FISCAL_EXPORTS · FISCAL_INDICATORS
17. CRIME_KPI · CRIME_INDICATORS · CRIME_SECURITY

**Handoff after each group — mandatory:**
```
[group name] done. Next per checklist: [next group name].
```
End the turn. Do not begin the next group in the same turn.

**Step 6** — Run Inconsistency Check Protocol
**Step 7** — Present final `.jsx`

---

## Color System

```js
const C = {
  xxx:    '#RRGGBB', xxxL: '#RRGGBB',  // primary — ISO Alpha-3 lowercase (kgz/kaz/uzb/tjk/tkm)
  yel:    '#RRGGBB', yelL: '#RRGGBB',  // secondary (or grn, gld)
  red:    '#E8192C', redL: '#ff3347',  // record high — ALWAYS present
  blu:    '#2E86DE', bluL: '#5ba8ff',  // record low  — ALWAYS present
  bg:'#000', card:'#111', border:'#1e1e1e', track:'#222',
  txt:'#fff', sub:'#999', muted:'#888', faded:'#555', dim:'#444',
  sea:'#RRGGBB', land:'#1a1a1a', capital:'#RRGGBB',
  flagRed:'#RRGGBB',
  xxxS:'rgba(R,G,B,.45)',  // rename to country prefix e.g. uzbS; update Flag component reference
};
```

**Known palettes:**
```
Kyrgyzstan:   kgz #E8192C/ff3347  yel #F0B830/ffd060  blu #2E86DE/5ba8ff  (red = kgz)
Kazakhstan:   kaz #00AFCA/33c8df  yel #FFC72C/ffd966  blu #2E86DE/5ba8ff  red #E8192C/ff3347
Uzbekistan:   uzb #1EB4E5/55ccf5  grn #3DAA5C/5dc97c  blu #2E86DE/5ba8ff  red #E8192C/ff3347
Tajikistan:   tjk #239F40/3dc95a  gld #D4AF37/f0cc55  blu #2E86DE/5ba8ff  red #C8102E/f03050
Turkmenistan: tkm #009A44/00c857  yel #F5C518/ffd84d  blu #2E86DE/5ba8ff  red #C8102E/f03050
```

**`valColor` — add a case for every accent used. Always include `C.red` and `C.blu`:**
```
Kyrgyzstan:   C.kgz→C.kgzL · C.yel→C.yelL · C.blu→C.bluL → else C.txt
Kazakhstan:   C.kaz→C.kazL · C.yel→C.yelL · C.blu→C.bluL · C.red→C.redL → else C.txt
Uzbekistan:   C.uzb→C.uzbL · C.grn→C.grnL · C.blu→C.bluL · C.red→C.redL → else C.txt
Tajikistan:   C.tjk→C.tjkL · C.red→C.redL · C.gld→C.gldL · C.blu→C.bluL → else C.txt
Turkmenistan: C.tkm→C.tkmL · C.red→C.redL · C.yel→C.yelL · C.blu→C.bluL → else C.txt
```

**Color rules:** max 2 colored KpiCards per section · `red` = Record High temp · `blu` = Record Low temp · `C.dim` = default (white text)

---

## Header / Footer

- **Eyebrow:** `Country Dashboard 2025` in `C.[primary]`
- **H1:** name with suffix as `<em>` — e.g. `Uzbeki<em>stan</em>`
- **Description:** 1–2 sentences
- **Flag:** replace `<Flag />` SVG
- **Sources line:** all sources used, ending `Data as of [Month Year].`
- **Legal:** `Generated [Month Year] · Claude Sonnet 4.6 (Anthropic) · iAlmirPro`

`jsx_to_html.py` replaces `[Month Year]` at compile time.

---

## EraTimeline

Only `ERAS` array and `ERA_TOTAL` change. Structure, class names, click handler — copy unchanged.
```js
const ERAS = [
  { id:'era_id', label:'Full Name', short:'Short', start:YYYY, end:YYYY,
    color:'#hex', colorL:'#hex',  // raw hex, not C.xxx; vary across eras
    desc:'One paragraph.', events:['YEAR — event'] },
];
const ERA_TOTAL = LAST_YEAR - FIRST_YEAR;
```

---

## Data Constant Templates

`sub` = source line inside a KpiCard · `note` = interpretive panel note (not a citation)

**KPI array:**
```js
const SECTION_KPI = [
  { state:1, label:'Name', value:'$X.XB', sub:'Source · year', accent:C.xxx, delay:0.05 },
  { state:1, label:'Name', value:'X.X%',  sub:'Source · year', accent:C.dim, delay:0.10 },
];
```

**Panel + BarRow:**
```js
const SECTION_BARS = { title:'Title', data:[
  { state:1, label:'Row', value:'XX%', pct:100, color:C.xxx },
], note:'Interpretive note.' };
```

**Panel + Tbl:**
```js
const SECTION_TBL = { title:'Title', data:[
  { state:1, label:'Row', value:'Value' },
], note:'Interpretive note.' };
```

**Panel + Donut:**
```js
const SECTION_DONUT = { title:'Title', label:'XX.XM', sublabel:'unit', data:[
  { state:1, label:'Segment', value:'XX%', pct:60, color:C.xxx },
], note:'Interpretive note.' };
```

**Panel + DlRow (daylight):**
```js
const SECTION_DAYLIGHT = { title:'Daylight Hours — City (lat°N)', data:[
  { state:1, mo:'Jan', label:'9h 28m',    pct:37,  color:C.blu },
  { state:1, mo:'Jun', label:'15h 10m ★', pct:100, color:C.xxx, dark:true },
], note:'Interpretive note.' };
```

**Panel + GradientBar:**
```js
const SECTION_CLIMATE = { sublabel:'Secondary label', data:[
  { state:1, label:'Row', value:'X mm', pct:100, color:C.xxx },
], gradbar1:{ title:'Label', values:[/* 12 months */], colorStops:tempColor, unit:'°' },
   gradbar2:{ title:'Label', values:[/* 12 months */], colorStops:rainColor, unit:'mm' },
   note:'Interpretive note.' };
```

**Panel + country-rows:**
```js
const SECTION_ORIGINS = { title:'Title', data:[
  { state:1, flag:'🇷🇺', country:'Russia', val:'description', pct:'XX%' },
], note:'Interpretive note.' };
```

**RegCard array:**
```js
const GEO_REGIONS = [
  { state:1, name:'Region', type:'Type · function', desc:'2–3 sentences.', stripe:C.xxx },
];
```

**Political timeline:**
```js
const POL_TIMELINE = { title:'Title', data:[
  { state:1, yr:'YYYY', tx:'Event.' },
], note:'Interpretive note.' };
```

**Data suppression** (government doesn't publish):
```js
const SECTION_TBL = { title:'Title', data:[
  { state:-1, label:'WHO modelled estimate', value:'~X% — est.; unverified — government does not publish; WHO modelled' },
], note:'[Country] does not publish [topic]. Values are international modelled estimates only.' };
```

---

## Value Field Rules

`value` = metric only. Source/context goes in `sub` or `note`.
- ✅ `value:"1,738"` · `value:"84.3%"` · `value:"~23% est.; unverified"`
- ❌ `value:"1,738 schools (2022/23 — worlddata.info)"` — source belongs in `note`

---

## Syntax Safety

- JSX props use `=` not `:` — `<KpiCard value="$17.5B" />` not `<KpiCard value:"$17.5B" />`
- Use double quotes for `note:`, `sub:`, `desc:` — apostrophes break single-quoted strings
- Scope row gap override to `.row.g-1` only — never `.row` globally (kills Bootstrap `gy-*`)
- Never change `gy-3` to `gy-2` on panel rows

---

## Data Verification Standard

### ⛔ HARD RULE
**Writing a value without first completing a web search is a protocol violation. Training knowledge is not a source.**

Exception: values marked `ready:true` in `<country>-cheatsheet.md` are already API-verified (state:1). Skip Gate 2 for these.

### Gate Process — one constant at a time

```
CONST_NAME
[G1] N data points identified ✅
[G2] Searched N values ✅  (or: N from cheatsheet state:1 · M searched)
[G3] N confirmed · N unverified (field — reason) ✅
[G4] Constant written ✅
[G5] All confirmed sourced · unverified annotated ✅
```

Output only the status lines above. No prose narration of gate steps.

After Gate 5 passes → write constant via Bash (brace-depth Python, see below) → **STOP, end the turn.**

### Brace-depth constant replacement (use this, never regex):

```python
def replace_const(content, name, new_block):
    start = content.find(f'const {name} =')
    if start == -1: print(f"{name} ❌ NOT FOUND"); return content
    opener = '{' if '{' in content[start:start+30] else '['
    closer = '}' if opener == '{' else ']'
    i = start; depth = 0
    while i < len(content):
        if content[i] == opener: depth += 1
        elif content[i] == closer:
            depth -= 1
            if depth == 0:
                end = i + 1
                if end < len(content) and content[end] == ';': end += 1
                break
        i += 1
    return content[:start] + new_block + content[end:]
```

### Annotation format

Append `— est.; unverified — [reason]` in the same field as the value:
```jsx
// ✅ correct
{ state:-1, label:'Hypertension prevalence (est.; unverified — WHO STEPS 2019; 2024 not available)', value:'~32%' }
{ state:-1, label:'Migrant workers abroad (est. — no official registry; ILO modelled)', value:'~2,000,000' }
// ❌ wrong — bare annotation
{ state:-1, label:'Hypertension prevalence (est.)', value:'~32%' }
```

Common reasons: `no official registry; ILO modelled` · `WHO/UNICEF joint modelled` · `government does not publish; UNODC/WB modelled` · `survey outdated — most recent [year]` · `city boundary variation` · `fuel-type split modelled`

### Approved sources
World Bank · IMF WEO · UNDP HDR · UN WPP · TI (CPI) · RSF · WHO · IEP (GPI) · ILO · IQAir · UNWTO · en.climate-data.org / climatestotravel.com · OEC · national statistics agencies

---

## Inconsistency Check Protocol

Run after all constants, before commit.

**Tiles must match constants:**
GDP/GDP per Cap/GDP Growth → `ECON_KPI` · Population → `POP_KPI·POP_GROWTH·POP_CITIES·POP_ETHNIC` · Life Exp → `POP_KPI·VITA_KPI` · Inflation → `ECON_KPI` · Unemployment → `EMP_KPI` · Literacy → `EDU_KPI` · HDI → `EDU_KPI` · Peace Index → `CRIME_KPI·CRIME_INDICATORS` · Area → `GEO` · Religion → `POP_RELIGION`

**Cross-constant pairs:**
Infant mortality → `VITA_KPI·HEALTH_KPI` · Foreign reserves → `ECON_INDICATORS·FISCAL_KPI·FISCAL_INDICATORS` · Remittances → `ECON_INDICATORS·EMP_KPI·EMP_MIGRATION` · Gini → `ECON_INDICATORS·FISCAL_KPI·FISCAL_INDICATORS` · Poverty → `ECON_INDICATORS·FISCAL_KPI` · CPI → `FISCAL_KPI·FISCAL_INDICATORS·CRIME_INDICATORS` · PM2.5 → `HEALTH_FACTS·HEALTH_BURDEN·ENV_FACTS`

**Traps:** Area from FAO/CIA WF/WB only · Population: national agency mid-year · Life expectancy: use same source in TILES, POP_KPI, VITA_KPI · GDP: both TILES and ECON_KPI must carry year labels

---

## Approval & Versioning Protocol

### ⛔ HARD RULE
**Completing the task is never more important than following this process.**

**Step 1 — propose:**
```
Proposed change: [exactly what will change]
Reason: [why]
File: [current filename → new filename]
Awaiting approval.
```
Stop. Do not open the file. Do not write code.

**Step 2 — increment version first:**
```bash
cp [country]-dashboard-v[N].jsx [country]-dashboard-v[N+1].jsx
```
Never modify the current version directly.

**Step 3 — make only the approved change.** Every additional change needs its own Step 1.

**Step 4 — present the new versioned file immediately.**
