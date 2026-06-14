# Country Dashboard — Design System
> Last updated: June 2026
> Single source of truth for all future country dashboards.

---
> ⚠️ **FIRST ACTION IN EVERY NEW DASHBOARD CONVERSATION — NO EXCEPTIONS:**
> Before reading any other section of this file, before opening any file, before writing any code, output the following block in chat and stop:
> ```
> Pre-build declaration: [country]
> Gate process: will execute G1→G5 per constant, outputting status line before writing the constant
> No constant will be written until it clears Gate 5
> Constants will be built and artifact updated one at a time
> ```
> Any output produced without this declaration appearing first in chat is invalid.
---

## No Exceptions Rule
- **"Obvious" fixes are not exceptions.** A bug, an overflow, a broken layout — none of these bypass the approval protocol. Propose first, always.
- **Screenshots and error reports are findings, not work orders.** Respond: "I can see [X]. I would fix it by [Y]. Shall I proceed?"
- **Never interpret a problem report as implicit approval to fix it.**

---

## Reference Files

| File | Purpose |
|---|---|
| `at-a-glance-instructions.md` | TILES constant structure, icon mapping, fasvg helper |
| `country-map-instructions.md` | Map projection values, Python label-position script, per-country reference |

---

## File Structure

Single `.jsx` file divided by `// ****` dividers:
- **DATA section** — `C` palette, `ERAS`, `TILES`, all section constants. No JSX, no components.
- **TEMPLATE section** — `css` constant, all components, `export default function`.

---

## Data State Field

Every data item carries a `state` field:
- `1` = verified — confirmed by web search, source cited in sub/label
- `-1` = NOT verified — training data, assumed, or found but not cross-checked by web search
- `0` = not tested — placeholder, skipped, or search not yet performed

**`-1` is not a soft warning — it means the value must not be trusted.** Any value written from training knowledge without a web search must be `-1`, regardless of confidence. The only path to `1` is a completed web search with a cited source.

Applies to all items: KPI arrays, BarRow data, Tbl rows, Donut segments, DlRow data, ERAS items, TILES, RegCard arrays, country-row arrays.

---

## Quick-Start Checklist (new country)

> **Copy-first rule:** The new dashboard is built by copying the reference dashboard verbatim and updating only the permitted fields listed below. Do not rewrite any component from memory or from the snippets in this file. The snippets exist for verification only. If the diff between the reference file and the new file contains any component-level change not listed below, that change requires an explicit proposal and approval before proceeding.

1. Copy the most recently modified dashboard (by filesystem date) verbatim as `[country]-dashboard-v1.jsx` — **do not retype, do not rewrite, copy the file**
1b. **Immediately call `present_files` on the new file** — before any research, before any edits — so the artifact is visible in the side panel throughout the build process.
2. Update **only** the following structural/identity items — nothing else:
   - `C` color object — new country's flag colors; use ISO 3166 Alpha-3 lowercase prefix (e.g. `kgz`, `kaz`, `uzb`, `tjk`, `tkm`) — **never use 2-letter codes** (clash risk with Alpha-2); rename `xxxS` key to country prefix
   - `Flag` SVG component — including the `${C.xxxS}` reference to match the renamed key
   - `valColor` function — update accent→light mappings to match new `C` keys (see Color System → KpiCard `valColor`)
   - Template color keys — in the TEMPLATE section, replace all `C.[prev_primary]` with `C.[new_primary]` and `C.[prev_secondary]` with `C.[new_secondary]` (covers `css` defaults, `KpiCard`/`BarRow`/`DlRow` prop defaults, map fill)
   - Map values — update ISO numeric code, center, scale, capital coordinates, and neighbour labels array (see `at-a-glance-instructions.md` → Map tile)
   - Header H1, eyebrow label, description text
   - Footer sources line and legal line
3. **Update all data constants — `ERAS`, `TILES`, and every section constant. See Data Constant Templates for the exact shape of each type. Set `state` on every item (1/−1/0). Apply the MANDATORY GATED PROCESS (Gate 1→5) for every constant without exception. Do not proceed to the next constant until the current one clears all five gates. After each constant clears Gate 5, immediately save/update the artifact. See Data Verification Standard.**

   **Constant order checklist** — work through in this order, one per turn:
   1. ERAS
   2. TILES
   3. GEO, GEO_TERRAIN, GEO_WATER, GEO_REGIONS
   4. CLIMA_KPI, CLIMA_DAYLIGHT, CLIMA_RAIN_REGIONAL, CLIMA_RAIN_SEASONAL
   5. POP_KPI, POP_GROWTH, POP_CITIES, POP_ETHNIC, POP_RELIGION
   6. ECON_KPI, ECON_GDP_DONUT, ECON_EXPORTS_BARS, ECON_INDICATORS
   7. EMP_KPI, EMP_WAGES, EMP_SECTORS_DONUT, EMP_MIGRATION
   8. EDU_KPI, EDU_METRICS, EDU_FACTS
   9. POL_KPI, POL_ELECTION, POL_TIMELINE
   10. TOUR_KPI, TOUR_ORIGINS, TOUR_HIGHLIGHTS
   11. VITA_KPI, VITA_DEATHS, VITA_TRENDS
   12. HEALTH_KPI, HEALTH_FACTS, HEALTH_BURDEN
   13. ENERGY_KPI, ENERGY_MIX, ENERGY_FACTS
   14. INFRA_KPI, INFRA_PROJECTS, INFRA_DIGITAL
   15. SOCIAL_KPI, SOCIAL_SERVICES, SOCIAL_COHESION
   16. ENV_KPI, ENV_FACTS, ENV_WATER
   17. BIZ_KPI, BIZ_CLIMATE, BIZ_RISKS
   18. FISCAL_KPI, FISCAL_EXPORTS, FISCAL_INDICATORS
   19. CRIME_KPI, CRIME_INDICATORS, CRIME_SECURITY

   **Handoff after each constant — mandatory, no exceptions:**
   After a constant clears Gate 5 and the artifact is updated, output:
   ```
   [constant name] done. Next per checklist: [next constant name].
   ```
   Then end the turn. Do not call Gate 1 for the next constant, do not write any further JSX, and do not call any further tools in this turn. The next constant begins only in response to the user's next message. This handoff is the stopping mechanism — it is not optional and does not require separate justification each time.
4. Run Inconsistency Check Protocol — verify values shared across constants are consistent (same figure, same year, same source)
5. Present final `.jsx` only after all data constants have cleared Gate 5

---

## Color System

### Palette — what to fill in per country

```js
const C = {
  xxx:    '#RRGGBB', xxxL: '#RRGGBB',  // primary — ISO 3166 Alpha-3 country code (e.g. kgz, kaz, uzb, tjk, tkm)
  yel:    '#RRGGBB', yelL: '#RRGGBB',  // secondary — avg / mid / positive trend  (or grn, gld etc.)
  red:    '#E8192C', redL: '#ff3347',  // record high  — ALWAYS present, ALWAYS this key name
  blu:    '#2E86DE', bluL: '#5ba8ff',  // record low   — ALWAYS present, ALWAYS this key name
  bg:     '#000',   card: '#111',  border: '#1e1e1e',
  track:  '#222',   txt:  '#fff',  sub:    '#999',  dim: '#444',
  muted:  '#888',                       // regcard-desc text
  faded:  '#555',                       // footer-sources text
  sea:    '#RRGGBB',                    // map ocean fill — pick a dark navy matching the flag
  land:   '#1a1a1a',                    // map other countries fill — keep fixed
  capital:'#RRGGBB',                    // capital city dot — pick a contrasting accent
  flagRed:'#RRGGBB',                    // flag stripe/band color if different from C.red; else set = C.red
  xxxS:   'rgba(R,G,B,.45)',            // flag box-shadow — rename xxx to country Alpha-3 (e.g. uzbS, tjkS)
};
```

> ⚠️ **`xxxS` key** — rename to match the country prefix (e.g. `uzbS`, `tjkS`, `tkmS`). Also update the one reference in the template's `Flag` component (`${C.xxxS}`) to the new key name. This is the only permitted template edit beyond the items in step 2.

> ⚠️ **`red` and `blu` are mandatory in every palette** — they drive Record High / Record Low KpiCard accents.

> ⚠️ **Naming rule:** use ISO 3166 Alpha-3 lowercase for primary color keys (e.g. `kgz`, `kaz`, `uzb`, `tjk`, `tkm`). Never use 2-letter codes (clash risk with ISO 3166 Alpha-2).

### Known Country Palettes

```
Kyrgyzstan:   kgz #E8192C / kgzL #ff3347   yel #F0B830 / yelL #ffd060   blu #2E86DE / bluL #5ba8ff
                                            red = kgz (#E8192C / #ff3347)
Kazakhstan:   kaz #00AFCA / kazL #33c8df   yel #FFC72C / yelL #ffd966   blu #2E86DE / bluL #5ba8ff
                                            red #E8192C / redL #ff3347
Uzbekistan:   uzb #1EB4E5 / uzbL #55ccf5   grn #3DAA5C / grnL #5dc97c   blu #2E86DE / bluL #5ba8ff
                                            red #E8192C / redL #ff3347
Tajikistan:   tjk #239F40 / tjkL #3dc95a   gld #D4AF37 / gldL #f0cc55   blu #2E86DE / bluL #5ba8ff
                                            red #C8102E / redL #f03050
Turkmenistan: tkm #009A44 / tkmL #00c857   yel #F5C518 / yelL #ffd84d   blu #2E86DE / bluL #5ba8ff
                                            red #C8102E / redL #f03050
```

> `red` uses `#E8192C` for KGZ/KAZ/UZB and `#C8102E` for TJK/TKM (flag red). For new countries default to `#E8192C` unless the flag has a different red.

### KpiCard `valColor` — update per country

Add a case for every color token used as an `accent` in the file. Always include `C.red` and `C.blu`:

```
Kyrgyzstan:   C.kgz → C.kgzL · C.yel → C.yelL  · C.blu → C.bluL                      → else C.txt
Kazakhstan:   C.kaz → C.kazL · C.yel → C.yelL  · C.blu → C.bluL · C.red → C.redL    → else C.txt
Uzbekistan:   C.uzb → C.uzbL · C.grn → C.grnL  · C.blu → C.bluL · C.red → C.redL    → else C.txt
Tajikistan:   C.tjk → C.tjkL · C.red → C.redL  · C.gld → C.gldL · C.blu → C.bluL    → else C.txt
Turkmenistan: C.tkm → C.tkmL · C.red → C.redL  · C.yel → C.yelL · C.blu → C.bluL    → else C.txt
```

When `accent={C.dim}`, value renders as `C.txt` (white).

### Color Rules for KPI Card Decks

1. **White dominates** — `C.dim` is the default for most cards
2. **Max 2 colored cards per section** — 1 preferred; use 2 only when two metrics genuinely need highlighting
3. **Balance across the full dashboard** — primary, secondary, `red`, `blu` appear roughly equally
4. **Order cards by importance** — strongest/most important metric first, warnings last
5. **Color by meaning:**
   - primary (kgz/kaz/uzb/tjk/tkm) → headline achievement or max metric
   - secondary (yel/grn/gld) → avg / mid / positive trend / opportunity
   - `red` → warning / critical / negative · **always Record High temperature**
   - `blu` → water / cold / fiscal milestone · **always Record Low temperature**
6. **Never use undefined color variables**

---

## EraTimeline — What Changes Per Country

Only the `ERAS` array and `ERA_TOTAL` need to be replaced. The JSX structure, class names, and click handler are copied unchanged from the previous dashboard.

```js
const ERAS = [
  {
    id: 'era_id',
    label: 'Full Era Name',
    short: 'Short Name',
    start: YYYY,
    end:   YYYY,
    color:  '#RRGGBB',  // era bar color — use C.xxx / C.red / C.grn / neutral greys; vary across eras
    colorL: '#RRGGBB',  // lighter version (~20% brighter) for hover/active state
    desc: 'One paragraph narrative.',
    events: ['YEAR — event', ...],
  },
  // … all eras
];
const ERA_TOTAL = LAST_YEAR - FIRST_YEAR;
```

- `ERA_TOTAL` = last year − first year
- Era `color`/`colorL` use raw hex (not `C.xxx`) — vary across eras for visual distinction; use country primary, red, neutral greys, gold as appropriate

---

## Header — What to Fill In Per Country

- **Eyebrow:** `Country Dashboard 2025`
- **H1:** country name split so the suffix is `<em>` — e.g. `Uzbeki<em>stan</em>`
- **Description:** 1–2 sentence overview
- **Flag:** replace `<Flag />` SVG component
- **Eyebrow color:** `C.[primary]`

---

## Footer — What to Fill In Per Country

- **Sources line:** list all sources used, end with `Data as of [Month Year].`
- **Legal line:** `Generated [Month Year] · Claude Sonnet 4.6 (Anthropic) · iAlmirPro`

`jsx_to_html.py` replaces `[Month Year]` with the exact build date in the compiled HTML.

---

## Data Constant Templates

All data lives in the DATA section as plain objects or arrays. Every item carries a `state` field. `sub` and `note` are distinct — never confuse them:

- **`sub`** — appears only on KPI array items; it is the small source/context line below the value inside a KpiCard
- **`note`** — appears on TILES items (source line in the glance tile) AND on Panel objects (interpretive "so what?" note rendered at the bottom of the panel)

---

### KPI array — used with `KpiCard` grid

```js
const SECTION_KPI = [
  { state:1, label:'Metric Name', value:'$X.XB', sub:'Source · year · context', accent:C.xxx, delay:0.05 },
  { state:1, label:'Metric Name', value:'X.X%',  sub:'Source · year',           accent:C.dim, delay:0.10 },
  // accent:C.dim = default (white); use C.red for Record High, C.blu for Record Low
  // delay: 0.05 increments per card
];
```

---

### Panel + BarRow

```js
const SECTION_BARS = {
  title: 'Panel Title',
  data: [
    { state:1, label:'Row label', value:'XX%', pct:100, color:C.xxx },
    { state:1, label:'Row label', value:'XX%', pct:50,  color:C.dim },
  ],
  note: 'Interpretive note — what do these values mean? Is this good/bad/typical?'
};
```

---

### Panel + Tbl (key/value table)

```js
const SECTION_TBL = {
  title: 'Panel Title',
  data: [
    { state:1, label:'Row label', value:'Row value' },
    { state:1, label:'Row label', value:'Row value' },
  ],
  note: 'Interpretive note.'
};
```

---

### Panel + Donut

```js
const SECTION_DONUT = {
  title: 'Panel Title',
  data: [
    { state:1, label:'Segment A', value:'XX%', pct:60, color:C.xxx },
    { state:1, label:'Segment B', value:'XX%', pct:40, color:C.dim },
  ],
  label:    'XX.XM',   // large text at donut centre
  sublabel: 'unit',    // small text below centre
  note: 'Interpretive note.'
};
```

---

### Panel + DlRow (daylight hours)

```js
const SECTION_DAYLIGHT = {
  title: 'Daylight Hours — City (lat°N)',
  data: [
    { state:1, mo:'Jan', label:'9h 28m',    pct:37,  color:C.blu },
    { state:1, mo:'Jun', label:'15h 10m ★', pct:100, color:C.xxx, dark:true },
    // color: optional — defaults to primary if omitted
    // dark:true — uses dark label text (for light-colored bars)
  ],
  note: 'Interpretive note.'
};
```

---

### Panel + BarRow + sublabel + GradientBar

```js
const SECTION_CLIMATE = {
  sublabel: 'Secondary label below panel title',
  data: [
    { state:1, label:'Row label', value:'X mm', pct:100, color:C.xxx },
  ],
  gradbar1: { title:'Label', values:[/* 12 monthly numbers */], colorStops:tempColor, unit:'°' },
  gradbar2: { title:'Label', values:[/* 12 monthly numbers */], colorStops:rainColor, unit:'mm' },
  note: 'Interpretive note.'
};
```

---

### Panel + country-rows (visitor origins / export destinations)

```js
const SECTION_ORIGINS = {
  title: 'Panel Title',
  data: [
    { state:1, flag:'🇷🇺', country:'Russia',  val:'description or volume', pct:'XX%' },
    { state:1, flag:'🇺🇸', country:'USA',     val:'description or volume', pct:'XX%' },
  ],
  note: 'Interpretive note.'
};
```

---

### RegCard array

```js
const GEO_REGIONS = [
  { state:1, name:'Region Name', type:'Type · function', desc:'2–3 sentence description.', stripe:C.xxx },
];
```

---

### Political timeline

```js
const POL_TIMELINE = {
  title: 'Panel Title',
  data: [
    { state:1, yr:'YYYY', tx:'Event description.' },
  ],
  note: 'Interpretive note.'
};
```

---

### Data suppression

When a government does not publish data for a section, leave `data: []` and put the suppression explanation in `note`. Append any available international estimates as separate Tbl rows with `state:-1`:

```js
const SECTION_TBL = {
  title: 'Panel Title',
  data: [
    { state:-1, label:'WHO modelled estimate', value:'~X% — est.; unverified — government does not publish; WHO modelled' },
  ],
  note: '[Country] does not publish [topic] data. [One sentence on what is suppressed and why.] Values below are international modelled estimates only.'
};
```

Never skip a section. Never invent data.

---

## Syntax Safety

JSX props use `=` not `:` — `<KpiCard value="$17.5B" />` not `<KpiCard value:"$17.5B" />`.

---

## Data Verification Standard

---

### ⛔ HARD RULE — ZERO EXCEPTIONS

**Writing a value without first completing a web search is a protocol violation. Training knowledge is not a source.**

---

### The only two valid states for any value

| State | Meaning |
|---|---|
| **Confirmed** | Web search returned a source that directly supports the value — cite it in `sub` |
| **Unverified** | No search done, or no usable result — annotate `est.; unverified — [reason]` in the same field |

---

### MANDATORY GATED PROCESS — one section at a time

#### GATE 1 — READ
List every data point the section will contain. Do not proceed until the list is complete.

#### GATE 2 — SEARCH EVERY VALUE
Search every item on the Gate 1 list. Do not write any JSX yet.

#### GATE 3 — RECORD RESULT
For each value: confirmed source + year, or reason why unconfirmable.

#### GATE 4 — WRITE THE JSX
Confirmed values: cite source in `sub`. Unverified: annotate `est.; unverified — [reason]` in the same field.

#### GATE 5 — SECTION SELF-CHECK
- Every value appears on the Gate 1 list ✓
- Every confirmed value has a source in `sub` ✓
- Every unverified value has annotation in-field ✓
- No value from training knowledge without annotation ✓

After all four checks pass: save/update the artifact immediately.

**Gate output format (internal only):**
```
CONST_NAME (e.g. CLIMA_KPI, GEO_TBL)
[G1] N data points identified ✅
[G2] Searched N values ✅
[G3] N confirmed · N unverified (field — reason) ✅
[G4] Constant written ✅
[G5] All confirmed sourced · unverified annotated ✅
```

The gate process is executed internally. Do not narrate gate steps in prose. Output only the status line above per constant. No gate descriptions, no bullet lists of what was searched, no explanations of what each gate means. The status line is the only output.

#### Stop after each constant

Gates 1→5 for a single constant run together without needing approval. Once Gate 5 passes and the artifact is updated, **STOP — end the turn**. Do not begin Gate 1 for the next constant in the same turn. Each constant is its own turn.

---

### Known high-error fields — Gate 2 mandatory even if confident

- GDP total and per capita
- Tourism visitor count and visitor origin percentages
- Export product shares and destination percentages
- Monthly temperature arrays (fetch from en.climate-data.org or climatestotravel.com)
- Monthly rainfall arrays
- Historical population figures
- City populations
- Homicide rate
- PM2.5 / air quality (fetch from IQAir)
- Age at first marriage
- Mobile penetration
- School enrollment rates
- Literacy rate
- Fertility rate and median age (UN WPP)
- Religion percentages
- Ethnic composition percentages
- Wage figures
- Employment sector splits

---

### Annotation format

Append `— est.; unverified — [reason]` in the same field as the value. Never in a comment.

```jsx
// ✅ CORRECT — reason included, annotation in-field
{ state:-1, label:'Solar irradiation', value:'~1,700–2,200 kWh/m²',
  sub:'Among highest globally — est.; unverified — no IQAir/NASA POWER search done' }

{ state:-1, label:'Hypertension prevalence (est.; unverified — most recent WHO STEPS survey 2019; 2024 data not available)',
  value:'~32%', pct:100, color:C.dim }

{ state:-1, label:'Migrant workers abroad (est. — no official registry; ILO modelled)', value:'~2,000,000' }

// ❌ WRONG — bare annotation, no reason
{ state:-1, label:'Hypertension prevalence (est.)', value:'~32%', pct:100 }
{ state:-1, label:'Migrant workers abroad (est.)', value:'~2,000,000' }
```

**Common reasons:**

| Reason type | Example wording |
|---|---|
| No official registry | `no official registry; ILO modelled` |
| Modelled by international body | `WHO/UNICEF joint modelled estimate` |
| Survey outdated | `most recent WHO STEPS survey 2019; 2024 data not available` |
| Government suppresses | `[country] does not publish; UNODC/WB modelled` |
| Derived metric | `RSF rank converted to score; no numeric score published` |
| No passport-level breakdown | `origin % from border crossings; no passport breakdown` |
| City boundary variation | `no inter-census registry; boundaries vary by source` |
| Sectoral split modelled | `fuel-type split modelled, not metered` |

---

### Approved sources by data type

| Source | Use for |
|---|---|
| World Bank Open Data | GDP, per capita, growth, population, enrollment, health |
| IMF WEO / Article IV | Inflation, fiscal balance, debt ratios |
| National statistics agencies | Wages, employment, vital statistics, city populations |
| UNDP HDR | HDI, schooling, GII |
| UN World Population Prospects | Age structure, fertility, median age |
| Transparency International | CPI / corruption index |
| RSF | Press freedom ranking |
| WHO / World Bank | TB, infant mortality, health spending |
| IEP | Global Peace Index |
| ILO | Labour force, unemployment, informal employment |
| IQAir / WHO | PM2.5 annual averages |
| UNWTO / national agencies | Visitor numbers, origins, tourism revenue |
| en.climate-data.org / climatestotravel.com / timeanddate.com | Monthly temperature and rainfall |
| Worldometer / populationpyramid.net | Population pyramid data |
| OEC / national customs | Export shares and destinations |

---

## Inconsistency Check Protocol

Run after all data constants are written, before any commit. Also run when the user asks "check for inconsistencies."

### At-a-Glance tile must match constant value

| Tile | Must match |
|---|---|
| GDP | `ECON_KPI` (same year) |
| GDP per Capita | `ECON_KPI` |
| GDP Growth | `ECON_KPI` |
| Population | `POP_KPI` · `POP_GROWTH` · `POP_CITIES` · `POP_ETHNIC` |
| Life Expectancy | `POP_KPI` · `VITA_KPI` |
| Inflation | `ECON_KPI` |
| Unemployment | `EMP_KPI` |
| Literacy | `EDU_KPI` |
| HDI | `EDU_KPI` |
| Peace Index | `CRIME_KPI` · `CRIME_INDICATORS` |
| Area | `GEO` |
| Religion % | `POP_RELIGION` |

### Cross-constant pairs

| Value | Appears in |
|---|---|
| Infant mortality | `VITA_KPI` · `HEALTH_KPI` |
| Foreign reserves | `ECON_INDICATORS` · `FISCAL_KPI` · `FISCAL_INDICATORS` |
| Foreign investment | `ECON_INDICATORS` · `FISCAL_KPI` · `FISCAL_INDICATORS` |
| Remittances | `ECON_INDICATORS` · `EMP_KPI` · `EMP_MIGRATION` |
| Gini coefficient | `ECON_INDICATORS` · `FISCAL_KPI` · `FISCAL_INDICATORS` |
| Women in parliament | `FISCAL_KPI` · `FISCAL_INDICATORS` |
| Poverty rate | `ECON_INDICATORS` · `FISCAL_KPI` |
| Gold/key export | `ECON_INDICATORS` · `ENERGY_KPI` · `ENERGY_FACTS` |
| Corruption CPI | `FISCAL_KPI` · `FISCAL_INDICATORS` · `CRIME_INDICATORS` |
| PM2.5 | `HEALTH_FACTS` · `HEALTH_BURDEN` · `ENV_FACTS` |

### Known traps

- **Area:** use FAO / CIA World Factbook / World Bank — not Wikipedia or Worldometer
- **Population:** national statistics agency mid-year figure is most current — always label with exact date
- **Life expectancy:** national agencies often report ~2 years higher than World Bank — use same source in `TILES`, `POP_KPI`, and `VITA_KPI`
- **GDP:** `TILES` may show latest confirmed year; `ECON_KPI` may show estimate — both must carry year labels

### Fix procedure

1. Search and confirm the correct value
2. Report both the wrong and confirmed values with source
3. Fix **all instances** in one edit pass
4. Cite source in every `sub` / Tbl cell that carries the fixed value

---

## Approval & Versioning Protocol

---

### ⛔ HARD RULE — NO EXCEPTIONS

**Completing the task is never more important than following this process.**

---

### STEP 1 — PROPOSE BEFORE TOUCHING ANYTHING

Output this block and stop:
```
Proposed change: [exactly what will change]
Reason: [why]
File: [current filename → new filename]
Awaiting approval.
```

Do not open the file. Do not write any code. Stop and wait.

---

### STEP 2 — INCREMENT VERSION FIRST

```bash
cp [country]-dashboard-v[N].jsx [country]-dashboard-v[N+1].jsx
```

Never modify the current version file directly.

---

### STEP 3 — MAKE ONLY THE APPROVED CHANGE

Exactly what was proposed. Nothing more. Every additional change requires its own Step 1 proposal.

---

### STEP 4 — PRESENT THE FILE

Present the new versioned file immediately after the change. No further edits before presenting.

---

### One task at a time

Do not chain unrequested changes. Do not fix things that weren't broken. Do not improve things that weren't asked about. Each task is its own Step 1 → approval → Step 2 → Step 3 → Step 4 cycle.
