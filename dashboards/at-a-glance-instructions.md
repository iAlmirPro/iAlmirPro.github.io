## At a Glance Summary

### Purpose
A 4-column tile grid placed between the hero and §1 Geography. Gives a scannable overview of the country's key stats before the detailed sections begin.

### Structure
- 16 stat tiles in a `display:grid, gridTemplateColumns:'1fr 1fr 1fr 1fr'` grid, `gap:3`
- 1 full-width map tile below (`gridColumn:'span 4'`)
- Each tile: `padding:'14px 8px 12px'`, `display:flex, flexDirection:'column', alignItems:'center', textAlign:'center'`

### Tile anatomy (top to bottom, all centred)
1. Icon — 24×24 inline FA6 solid SVG, `fill:#fff`, `marginBottom:7`
2. Label — `fontSize:8.5`, `letterSpacing:0.08em`, uppercase, `color:#fff`
3. Value — Fraunces 900, `fontSize:12`, `color:#fff`
4. Note — `fontSize:9`, `color:rgba(255,255,255,0.75)`

### Tile colors
- **Background:** `C.[primary]` (country primary color — e.g. `C.kg` for Kyrgyzstan)
- **All text and icons:** white

### Icons — always inline FA6 solid SVG paths
- **Never use emoji** — always inline `<svg>` with the exact `<path d="...">` copied from FA6 free GitHub source (`https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/[name].svg`)
- Use `curl` or direct fetch to get the real path — never write paths from memory
- **Always verify the viewBox from the source SVG** — do not assume `0 0 512 512`. e.g. `hands-praying` is `0 0 640 512`
- Area tile uses the country silhouette SVG (same path as the mini map), not an FA6 icon
- Standard icon mapping (adapt per country): `chart-line` GDP · `dollar-sign` GDP per Capita · `arrow-trend-up` Growth · `users` Population · silhouette Area · `money-bill-wave` Currency · `tag` Inflation · `person-circle-xmark` Unemployment · `book-open` Literacy · `hands-praying` Religion · `language` Language · `heart-pulse` Life Expectancy · `globe` HDI · `landmark` Government · `fire-flame-simple` Gas/Energy · `shield-halved` Neutrality/Security

### Mini map tile
- `gridColumn:'span 4'`, full-width SVG, `viewBox:"0 0 560 260"`
- Country outline: 80-point path projected from real lon/lat border coordinates — fetch from Natural Earth GeoJSON or use `curl` to get coordinates; never draw from memory
- Country fill: `C.[primary]` at `opacity:0.75`, stroke `C.[primary]L` `strokeWidth:1.2`
- Caspian / sea feature (if applicable): dark blue rect `#1a3a5c` west side
- Capital dot: `C.yel` circle r=4, labelled below in `C.yel`
- Ghost country name: white, Fraunces 900, `opacity:0.12`

### Mini map tile — updated approach (v21+)
The static SVG mini map has been replaced with a **D3 choropleth map** rendered via `useEffect`. See `country-map-instructions.md` for the full implementation. Key points:
- Load D3 from cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js`
- Load TopoJSON from cdnjs: `https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js`
- World geodata: `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json`
- Use `React.useRef` and `React.useState` inside the IIFE (not destructured at top level)
- Map tile label: "Shape & Location", `aspectRatio:'16/9'`

### Helper function
```js
const fasvg = (viewBox, d) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width="24" height="24" fill="#fff">
    <path d={d}/>
  </svg>
);
```

### Standard tiles (16)
GDP · GDP per Capita · GDP Growth · Population · Area · Currency · Inflation · Unemployment · Literacy · Religion · Language · Life Expectancy · HDI · Government · Energy/Gas Reserves · Neutrality/Security
