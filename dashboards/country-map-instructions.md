# Country Map — Instructions

## What changes per country

### Step 1 — Gather these values

- ISO numeric code of target country
- Capital city lon/lat
- Geographic centre lon/lat of the country
- ISO numeric codes of all neighbouring countries

### Step 2 — Set projection values

```js
d3.geoMercator()
  .center([CENTRE_LON, CENTRE_LAT])
  .scale(SCALE)
  .translate([WIDTH / 2, HEIGHT / 2])
```

- Start with `scale(2000)`, increase until country fills frame
- Adjust `center` latitude until the entire country fits:
  - Top clipped → decrease latitude
  - Bottom clipped → increase latitude

### Step 3 — Compute neighbour label positions with Python

Never place labels manually. Always run this script first:

```python
import json, math
from shapely.geometry import shape, box

# Load countries GeoJSON (ne_10m or ne_50m)
with open('countries.geojson') as f:
    data = json.load(f)

CENTER_LON = ...
CENTER_LAT = ...
SCALE = ...
WIDTH, HEIGHT = 960, 540
PADDING = 20

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

LABEL_WIDTHS = {'COUNTRY_NAME': estimated_px_width}  # ~8px per char at font-size 12

# Always verify exact country names in the dataset first:
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

**Rules:**
- `PADDING = 20` — keeps labels ≥20px from frame edge
- Estimate label width as ~`8px × number of chars`
- Progressive erosion: `lw/2 → lw/4 → lw/6 → 10px`
- If all erosions fail (sliver too small) — **skip the label**

---

## Per-country reference values

```
Kyrgyzstan:
  ISO: 417 · center [74.5, 41.5] · scale 3800
  Capital: Bishkek [74.59, 42.87]
  Neighbours: Kazakhstan(135,158) Uzbekistan(285,337) Tajikistan(143,472) China(827,328)

Uzbekistan:
  ISO: 860 · center [63.0, 41.5] · scale 2400
  Capital: Tashkent [69.28, 41.30]

Tajikistan:
  ISO: 762 · center [71.0, 38.8] · scale 4500
  Capital: Dushanbe [68.77, 38.56]

Turkmenistan:
  ISO: 795 · center [59.6, 39.2] · scale 2900
  Capital: Ashgabat [58.38, 37.95]
  Neighbours: Uzbekistan(736,176) Kazakhstan(885,79) Iran(345,426) Afghanistan(818,455)
  Azerbaijan: skipped — too small in frame
```
