# At a Glance — Instructions

```js
const fasvg = (vb, d) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} width="24" height="24" fill="#fff">
    <path d={d}/>
  </svg>
);
```

---

### `TILES` constant — module level, DATA section

Replace all 16 values. Include `state` field on every tile.

```js
const TILES = [
  { state:1, label:'GDP',          value:'$X.XB',   note:'World Bank 2024',   icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'GDP per Cap.', value:'$X,XXX',  note:'World Bank 2024',   icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'GDP Growth',   value:'+X.X%',   note:'World Bank 2024',   icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Population',   value:'XX.XM',   note:'Stats Agency 2025', icon:fasvg('0 0 640 512', '...') },
  { state:1, label:'Area',         value:'XXX,XXX', note:'km² · World Bank',  icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Currency',     value:'XXX',     note:'ISO 4217',          icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Inflation',    value:'X.X%',    note:'IMF 2024',          icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Unemployment', value:'X.X%',    note:'ILO 2024',          icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Literacy',     value:'XX.X%',   note:'UNESCO 2024',       icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Religion',     value:'XX% X',   note:'census year',       icon:fasvg('0 0 640 512', '...') },
  { state:1, label:'Language',     value:'XXXXX',   note:'official',          icon:fasvg('0 0 640 512', '...') },
  { state:1, label:'Life Exp.',    value:'XX.X yrs',note:'WHO 2024',          icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'HDI',          value:'X.XXX',   note:'UNDP 2024 · rank X',icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Government',   value:'XXXXXX',  note:'type',              icon:fasvg('0 0 512 512', '...') },
  { state:1, label:'Energy',       value:'XXX TCM', note:'proved reserves',   icon:fasvg('0 0 448 512', '...') },
  { state:1, label:'Security',     value:'GPI X.XX',note:'IEP rank XX/163',   icon:fasvg('0 0 512 512', '...') },
];
```

---

### Icons — always inline FA6 solid SVG paths

- **Never use emoji** — always inline `<svg>` with the exact `<path d="...">` from FA6 free source
- Fetch the real path: `https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/[name].svg`
- **Always verify the viewBox from source** — do not assume `0 0 512 512` (e.g. `hands-praying` = `0 0 640 512`)

Standard icon mapping:

| Icon name | Used for |
|---|---|
| `chart-line` | GDP |
| `dollar-sign` | GDP per Capita |
| `arrow-trend-up` | GDP Growth |
| `users` | Population |
| `globe` | Area · HDI |
| `money-bill-wave` | Currency |
| `tag` | Inflation |
| `person-circle-xmark` | Unemployment |
| `book-open` | Literacy |
| `hands-praying` | Religion |
| `language` | Language |
| `heart-pulse` | Life Expectancy |
| `landmark` | Government |
| `fire-flame-simple` | Energy / Gas Reserves |
| `shield-halved` | Security / Peace Index |

---

### Map tile — what to set per country

The IIFE and map rendering code are unchanged from the previous dashboard. Only these values change:

| Variable | What to set |
|---|---|
| `COUNTRY_ISO_NUM` | ISO numeric code (e.g. Uzbekistan = `860`) |
| `CENTRE_LON, CENTRE_LAT` | Geographic centre of the country |
| `SCALE` | D3 Mercator scale — start at `2000`, increase until country fills frame |
| `CAPITAL_LON, CAPITAL_LAT` | Capital city coordinates |
| `CAPITAL_NAME` | Capital city name |
| neighbour `labels` array | Computed positions — see `country-map-instructions.md` |

> The EraTimeline click handler is injected automatically by `jsx_to_html.py` — do NOT add it manually.
