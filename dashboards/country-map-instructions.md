# Country Location Map Component

## Goal
Render a 16:9 landscape map of any target country: country filled green, sea blue, neighbours dark with white borders, capital dot + label, optional neighbour labels.

---

## Stack
- `d3` (available in React artifact environment)
- `topojson` via script tag: `https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js`
- Geodata: `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json` (50m — higher border detail; use 110m for large countries if performance is a concern)

---

## Steps to build for any country

### 1. Gather data
- ISO numeric code of target country (e.g. Turkmenistan = `795`)
- Real lon/lat of the capital city
- Geographic centre lon/lat of the target country
- ISO numeric codes of all neighbouring countries

### 2. Set up projection
```js
d3.geoMercator()
  .center([country_centre_lon, country_centre_lat])
  .scale(SCALE)
  .translate([WIDTH / 2, HEIGHT / 2])
```
- Start with `scale(2000)`, increase until the country fills the frame
- Adjust `center` latitude until the **entire country fits inside the frame**:
  - Top clipped → decrease latitude value
  - Bottom clipped → increase latitude value
  - Repeat until all borders visible with minor padding on all sides

### 3. Colors
| Element | Fill | Stroke |
|---|---|---|
| Sea / background | `#1a3a5c` (full rect) | — |
| Target country | `C.[primary]` (country palette color) | `#fff` `0.8px` |
| All other land | `#1a1a1a` | `#fff` `0.3px` |

### 4. Labels

#### Capital
Yellow dot `#F5C518` radius `3.5px` + outer glow circle radius `6px` opacity `0.2` + text label right of dot, `fontSize 22`, `font-weight 500`.

#### Neighbour labels — use Python to compute positions
Never place neighbour labels manually or by guessing. Always compute positions using this Python script before writing the JSX:

```python
import json, math
from shapely.geometry import shape, box

# Load countries GeoJSON (ne_10m or ne_50m)
with open('countries.geojson') as f:
    data = json.load(f)

CENTER_LON = ...   # same as projection center
CENTER_LAT = ...
SCALE = ...        # same as d3 scale
WIDTH, HEIGHT = 960, 540
PADDING = 20       # minimum px from frame edge

def merc(lon, lat):
    x = math.radians(lon)
    y = math.log(math.tan(math.pi/4 + math.radians(lat)/2))
    cx = math.radians(CENTER_LON)
    cy = math.log(math.tan(math.pi/4 + math.radians(CENTER_LAT)/2))
    return (x - cx) * SCALE + WIDTH/2, -(y - cy) * SCALE + HEIGHT/2

def project_shape(feat):
    geom = feat['geometry']
    gtype = geom['type']
    def proj_ring(ring): return [merc(c[0],c[1]) for c in ring]
    if gtype == 'Polygon':
        return shape({'type':'Polygon','coordinates':[proj_ring(r) for r in geom['coordinates']]})
    else:
        return shape({'type':'MultiPolygon','coordinates':[[proj_ring(r) for r in poly] for poly in geom['coordinates']]})

padded_frame = box(PADDING, PADDING, WIDTH-PADDING, HEIGHT-PADDING)

LABEL_WIDTHS = {'COUNTRY_NAME': estimated_px_width, ...}  # ~8px per char at font-size 12

# IMPORTANT: always verify exact country names in the dataset before adding to NEIGHBOURS
# Country names may differ from common usage e.g. 'Republic of Serbia' not 'Serbia'
# Run this first:
# hits = [f['properties'].get('name','') for f in data['features'] if 'search_term' in f['properties'].get('name','').lower()]
# print(hits)

NEIGHBOURS = {'Exact name from dataset': iso_numeric, ...}

for feat in data['features']:
    name = feat['properties'].get('name','')
    if name not in NEIGHBOURS: continue
    shp = project_shape(feat)
    clipped = shp.intersection(padded_frame)
    if clipped.is_empty: continue
    lw = LABEL_WIDTHS.get(name.upper(), 80)
    # Try progressively smaller erosions until one works
    rp = None
    for erosion in [lw/2, lw/4, lw/6, 10]:
        eroded = clipped.buffer(-erosion)
        if not eroded.is_empty:
            if eroded.geom_type == 'MultiPolygon':
                eroded = max(eroded.geoms, key=lambda g: g.area)
            rp = eroded.representative_point()
            break
    if rp is None:
        print(f"# {name}: no space — skip")
    else:
        print(f'  {{ name: "{name.upper()}", x: {round(rp.x)}, y: {round(rp.y)} }},')
```

**How it works:**
1. Projects each country to SVG pixel space using the same Mercator formula as D3
2. Clips to the frame minus `PADDING` px on each side
3. Erodes the visible polygon inward by half the label width — guaranteeing the label fits inside the border
4. Returns the `representative_point()` of the eroded shape — a point guaranteed inside the polygon
5. Output is hardcoded `x/y` pixel coordinates for the JSX

**Rules:**
- `PADDING = 20` — keeps labels at least 20px from frame edge
- Estimate label width as ~`8px × number of chars` at font-size 12
- Progressive erosion fallback: `lw/2 → lw/4 → lw/6 → 10px` — finds the largest safe zone
- If all erosions fail (country slice too small), **skip the label** — do not force it
- Azerbaijan-sized slivers (< ~10px²) will always be skipped — correct behaviour

#### Label JSX
```jsx
const LABELS = [
  { name: "COUNTRY_A", x: 123, y: 456 },
  { name: "COUNTRY_B", x: 789, y: 234 },
];

LABELS.forEach(({ name, x, y }) => {
  svg.append("text")
    .attr("x", x).attr("y", y)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .attr("font-size", 12).attr("font-family", "Inter,sans-serif")
    .attr("letter-spacing", 2)
    .text(name);
});
```

### 5. Frame
```js
const WIDTH = 960;
const HEIGHT = 540; // 16:9
```
- SVG `viewBox="0 0 960 540"`
- Container: `aspectRatio: "16/9"`, `overflow: hidden`, `maxWidth: 960`

---

## Fitting rule
The target country must be **fully visible** inside the frame with small equal padding on all sides. No part of the country border should be clipped. Neighbouring countries are partially visible at the edges for context only.

---

## Reference: Turkmenistan
```js
const TM_NUM = 795;
.center([59.6, 39.2])
.scale(2900)
// Capital: Ashgabat [58.38, 37.95]
// Neighbours: Kazakhstan 398, Uzbekistan 860, Afghanistan 4, Iran 364, Azerbaijan 31
// Label positions (PADDING=20): Uzbekistan(736,176) Kazakhstan(885,79) Iran(345,426) Afghanistan(818,455)
// Azerbaijan skipped — too small in frame
```

## Reference: Tajikistan
```js
const TJ_NUM = 762;
.center([71.0, 38.8])
.scale(4500)
// Capital: Dushanbe [68.77, 38.56]
```

## Reference: Uzbekistan
```js
const UZ_NUM = 860;
.center([63.0, 41.5])
.scale(2400)
// Capital: Tashkent [69.28, 41.30]
```

## Reference: Kyrgyzstan
```js
const KG_NUM = 417;
.center([74.5, 41.5])
.scale(3800)
// Capital: Bishkek [74.59, 42.87]
// Neighbours: Kazakhstan 398, Uzbekistan 860, Tajikistan 762, China 156
// Label positions (PADDING=20): Kazakhstan(135,158) Uzbekistan(285,337) Tajikistan(143,472) China(827,328)
```

---

## Template JSX structure

The map is rendered inside an **IIFE** in the dashboard's main component return — not as a standalone component. `React.useRef` and `React.useState` are used prefixed (not destructured), and D3/TopoJSON are loaded from CDN inside the effect.

```jsx
{/* ── AT A GLANCE ── */}
{(() => {
  const mapRef = React.useRef(null);
  const [mapLoaded, setMapLoaded] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    async function drawMap() {
      try {
        if (!document.getElementById('d3-cdn')) {
          await new Promise((res, rej) => {
            const s = document.createElement('script'); s.id='d3-cdn';
            s.src='https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
            s.onload=res; s.onerror=rej; document.head.appendChild(s);
          });
        }
        if (!document.getElementById('topo-cdn')) {
          await new Promise((res, rej) => {
            const s = document.createElement('script'); s.id='topo-cdn';
            s.src='https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
            s.onload=res; s.onerror=rej; document.head.appendChild(s);
          });
        }
        const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(r=>r.json());
        if (cancelled) return;
        const d3=window.d3, topojson=window.topojson;
        const countries=topojson.feature(world,world.objects.countries);
        const W=960,H=540,XX=COUNTRY_ISO_NUM;
        const proj=d3.geoMercator().center([CENTRE_LON,CENTRE_LAT]).scale(SCALE).translate([W/2,H/2]);
        const path=d3.geoPath().projection(proj);
        const svg=d3.select(mapRef.current);
        svg.selectAll('*').remove();
        svg.append('rect').attr('width',W).attr('height',H).attr('fill','#1a3a5c');
        svg.append('g').selectAll('path').data(countries.features).join('path')
          .attr('d',path).attr('fill',d=>+d.id===XX?C.[primary]:'#1a1a1a')
          .attr('stroke','#fff').attr('stroke-width',0.3);
        const feat=countries.features.find(d=>+d.id===XX);
        if(feat) svg.append('path').datum(feat).attr('d',path).attr('fill',C.[primary]).attr('stroke','#fff').attr('stroke-width',0.8);
        const labels=[
          {name:'NEIGHBOUR_A',x:000,y:000},  // computed by Python script in country-map-instructions.md
        ];
        labels.forEach(({name,x,y})=>{
          svg.append('text').attr('x',x).attr('y',y).attr('text-anchor','middle')
            .attr('fill','#fff').attr('font-size',12).attr('font-family','Inter,sans-serif')
            .attr('letter-spacing',2).text(name);
        });
        const [ax,ay]=proj([CAPITAL_LON,CAPITAL_LAT]);
        svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',6).attr('fill','#F5C518').attr('opacity',0.2);
        svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',3.5).attr('fill','#F5C518');
        svg.append('text').attr('x',ax+8).attr('y',ay+4).attr('fill','#F5C518')
          .attr('font-size',22).attr('font-family','Inter,sans-serif').attr('font-weight',500).text('CAPITAL_NAME');
        if(!cancelled) setMapLoaded(true);
      } catch(e){console.error('map',e);}
    }
    drawMap();
    return ()=>{cancelled=true;};
  }, []);

  const fasvg = (vb, d) => <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} width="24" height="24" fill="#fff"><path d={d}/></svg>;

  const tiles = [
    { icon: fasvg('...', '...'), label: 'GDP',         value: '$X.XB',   note: 'World Bank 2024' },
    // ... 15 more tiles
  ];

  return (
    <div id="glance" style={{ margin:'28px 0 8px' }}>
      <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.sub, marginBottom:14 }}>At a glance</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:3 }}>
        {tiles.map(({ icon, label, value, note }) => (
          <div key={label} style={{ background:C.[primary], border:`1px solid ${C.border}`, padding:'14px 8px 12px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
            <div style={{ marginBottom:7, lineHeight:1 }}>{icon}</div>
            <div style={{ fontSize:8.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'#fff', marginBottom:4 }}>{label}</div>
            <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:12, color:'#fff', marginBottom:3, wordBreak:'break-word' }}>{value}</div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', lineHeight:1.3 }}>{note}</div>
          </div>
        ))}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'14px 12px 12px', position:'relative', overflow:'hidden', gridColumn:'span 4' }}>
          <div style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:8 }}>Shape & Location</div>
          <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', overflow:'hidden', borderRadius:4 }}>
            <svg ref={mapRef} viewBox="0 0 960 540" style={{ width:'100%', height:'100%', display:'block' }} />
            {!mapLoaded && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:C.sub, fontSize:11 }}>Loading map…</div>}
          </div>
        </div>
      </div>
    </div>
  );
})()}
```
