"""Write the concept site plan INTO a copy of the source DXF.
Source entities are never edited: everything new lives on new layers (prefixes below), so the original survey can be
isolated with a layer filter "TPX_*". Output: output/PE_Faculty_Concept_SitePlan.dxf"""
import math, os, sys
import numpy as np
import ezdxf
from ezdxf.enums import TextEntityAlignment
from shapely.geometry import Polygon
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import design as D

doc = ezdxf.readfile(D.SRC)
msp = doc.modelspace()
DEG = math.degrees(D.TH)

# ---------------------------------------------------------------- layers  (name: ACI colour, lineweight 1/100 mm, linetype)
for lt, pat in [('PRJ_DASH', [2.0, 1.2, -0.8]), ('PRJ_DOT', [0.9, 0.15, -0.75]), ('PRJ_DASHDOT', [3.0, 1.6, -0.5, 0.0, -0.5])]:
    if lt not in doc.linetypes: doc.linetypes.add(lt, pattern=pat, description=lt)
LAYERS = {
    'SITE_BOUNDARY': (1, 70, 'PRJ_DASHDOT', 'Site boundary as marked by the user: outer road edges of ring TPX_ROADS_CONTOURS #65 (not cadastral)'),
    'EXISTING_TO_REMOVE': (8, 25, 'PRJ_DASH', 'Existing structures inside the boundary proposed for removal (overlay only; source untouched)'),
    'PROPOSED_BUILDINGS': (250, 50, 'Continuous', 'Proposed ground-floor footprints (closed polylines)'),
    'PROPOSED_BUILDINGS_HATCH': (9, 0, 'Continuous', 'Footprint fills by functional group'),
    'PROPOSED_UPPER_FLOORS': (250, 18, 'PRJ_DASH', 'Upper-floor lines / overhangs / clerestory'),
    'FUNCTIONAL_ZONES': (6, 25, 'PRJ_DASH', 'Functional zoning (public · sports · academic · admin)'),
    'OPEN_SPACE': (62, 18, 'Continuous', 'Proposed open spaces'),
    'OPEN_SPACE_HATCH': (62, 0, 'Continuous', 'Open-space fills'),
    'LANDSCAPE': (3, 18, 'Continuous', 'Proposed trees, berm, court markings'),
    'PEDESTRIAN_CIRCULATION': (5, 35, 'PRJ_DASH', 'Primary / secondary pedestrian routes'),
    'VEHICULAR_CIRCULATION': (30, 35, 'PRJ_DASHDOT', 'Emergency access (no general vehicle traffic on site)'),
    'SERVICE_ACCESS': (40, 35, 'PRJ_DOT', 'Service route and loading bay'),
    'ENTRANCES': (1, 35, 'Continuous', 'Site and building entrances'),
    'BUILDING_LABELS': (7, 18, 'Continuous', 'Building names and target gross areas'),
    'DIMENSIONS': (7, 13, 'Continuous', 'Preliminary dimensions (m)'),
    'ANNOTATIONS': (7, 18, 'Continuous', 'Title, legend, notes, north arrow, scale bar'),
    'CONCEPT_DIAGRAMS': (7, 18, 'Continuous', 'Concept inset diagram (outside the drawing frame)'),
}
for n, (c, lw, lt, desc) in LAYERS.items():
    if n in doc.layers: raise SystemExit('layer exists already: ' + n)
    L = doc.layers.add(n, color=c, linetype=lt); L.dxf.lineweight = lw; L.description = desc

if 'PRJ_BUILDING' not in doc.appids: doc.appids.new('PRJ_BUILDING')
if 'PRJ_TEXT' not in doc.styles: doc.styles.add('PRJ_TEXT', font='arial.ttf')
if 'PRJ_TEXT_B' not in doc.styles: doc.styles.add('PRJ_TEXT_B', font='arialbd.ttf')
ds = doc.dimstyles.duplicate_entry('Standard', 'PRJ_DIM')
ds.dxf.dimtxt = 1.4; ds.dxf.dimasz = 1.2; ds.dxf.dimexe = 0.8; ds.dxf.dimexo = 0.8; ds.dxf.dimgap = 0.5
ds.dxf.dimdec = 1; ds.dxf.dimtad = 1; ds.dxf.dimtxsty = 'PRJ_TEXT'; ds.dxf.dimclrd = 8; ds.dxf.dimclre = 8; ds.dxf.dimclrt = 7
ds.dxf.dimblk = 'ARCHTICK'; ds.dxf.dimtih = 0; ds.dxf.dimtoh = 0; ds.dxf.dimlunit = 2; ds.dxf.dimzin = 8

GROUP_RGB = {'Sports': (232, 145, 58), 'Assembly': (200, 80, 74), 'Academic': (46, 134, 222), 'Administration': (124, 92, 196),
             'Amenity': (210, 170, 60), 'Services': (140, 140, 140), 'Unresolved': (120, 120, 120)}
OPEN_RGB = {'plaza': (205, 196, 178), 'street': (226, 214, 190), 'court': (178, 206, 160), 'garden': (165, 201, 140),
            'buffer': (120, 170, 100), 'walk': (190, 212, 170)}


def pl(Q, layer, closed=True, rgb=None, lw=None, ltscale=None):
    e = msp.add_lwpolyline([tuple(p) for p in Q], close=closed, dxfattribs={'layer': layer})
    if rgb: e.rgb = rgb
    if lw is not None: e.dxf.lineweight = lw
    if ltscale: e.dxf.ltscale = ltscale
    return e


def hatch(geom, layer, rgb, transp=0.0, pattern=None, scale=1.0, angle=0.0):
    polys = [geom] if geom.geom_type == 'Polygon' else list(geom.geoms)
    for g in polys:
        if g.area < 0.5: continue
        h = msp.add_hatch(dxfattribs={'layer': layer})
        if pattern: h.set_pattern_fill(pattern, scale=scale, angle=angle)
        h.rgb = rgb; h.transparency = transp
        h.paths.add_polyline_path(list(g.exterior.coords)[:-1], is_closed=True, flags=1)
        for r in g.interiors: h.paths.add_polyline_path(list(r.coords)[:-1], is_closed=True, flags=16)


def text(s, p, h, layer, rot=0.0, style='PRJ_TEXT', align='MIDDLE_CENTER', rgb=None):
    t = msp.add_text(s, height=h, rotation=rot, dxfattribs={'layer': layer, 'style': style})
    t.set_placement(tuple(p), align=TextEntityAlignment[align])
    if rgb: t.rgb = rgb
    return t


def mtext(s, p, h, layer, rot=0.0, width=None, attach=5, rgb=None, style='PRJ_TEXT'):
    m = msp.add_mtext(s, dxfattribs={'layer': layer, 'char_height': h, 'rotation': rot, 'attachment_point': attach, 'style': style})
    m.dxf.insert = tuple(p) + (0,)
    if width: m.dxf.width = width
    if rgb: m.rgb = rgb
    return m


site = Polygon(D.site_xy())

# ---------------------------------------------------------------- site boundary (assembled from source vertices)
pl(D.site_xy(), 'SITE_BOUNDARY', ltscale=1.0)
c = site.representative_point()
nw = D.xy([(14, 131.5)])[0]
text(f'SITE BOUNDARY · {site.area:,.0f} m² · traced on the existing road edges (provisional, not cadastral)', nw, 1.3, 'SITE_BOUNDARY', DEG - 4.0, align='BOTTOM_LEFT', rgb=(200, 40, 40))

# ---------------------------------------------------------------- existing structure to remove (overlay)
for e in D.source().modelspace().query('LWPOLYLINE[layer=="TPX_BUILDINGS"]'):
    q = Polygon([p[:2] for p in e.get_points('xy')])
    if q.intersects(site):
        Q = list(q.exterior.coords); pl(Q, 'EXISTING_TO_REMOVE', closed=True)
        b = q.bounds; msp.add_line((b[0], b[1]), (b[2], b[3]), dxfattribs={'layer': 'EXISTING_TO_REMOVE'}); msp.add_line((b[0], b[3]), (b[2], b[1]), dxfattribs={'layer': 'EXISTING_TO_REMOVE'})

# ---------------------------------------------------------------- open spaces (under the buildings in draw order)
for oid, name, poly, kind in D.OPEN:
    g = D.open_poly(poly)
    hatch(g, 'OPEN_SPACE_HATCH', OPEN_RGB[kind], 0.55 if kind != 'street' else 0.35)
    for gg in ([g] if g.geom_type == 'Polygon' else g.geoms): pl(list(gg.exterior.coords), 'OPEN_SPACE', rgb=tuple(int(x * .7) for x in OPEN_RGB[kind]))
# open-space labels (placed in clear areas, rotated to the site grid)
OL = {'O1': (101, 110, 0), 'O2': (64, 63.4, 0), 'O3': (66, 98.5, 90), 'O4': (39.2, 52, 90), 'O5': (19, 96, 90), 'O6': (36, 113.5, -4),
      'O7': (60, 15.8, 0), 'O8': (106, 33, 90), 'O9': (108.5, 76, 90)}
for oid, name, poly, kind in D.OPEN:
    u, v, r = OL[oid]; text(name, D.xy([(u, v)])[0], 1.15 if oid != 'O2' else 1.5, 'OPEN_SPACE', DEG + r, rgb=(70, 90, 60), style='PRJ_TEXT_B' if oid in ('O2', 'O1') else 'PRJ_TEXT')
# outdoor court markings (15 × 28 multi-court, long axis N–S)
cu, cv = 66.0, 89.0
pl(D.xy([(cu - 7.5, cv - 14), (cu + 7.5, cv - 14), (cu + 7.5, cv + 14), (cu - 7.5, cv + 14)]), 'LANDSCAPE', rgb=(255, 255, 255), lw=25)
pl(D.xy([(cu - 7.5, cv), (cu + 7.5, cv)]), 'LANDSCAPE', closed=False, rgb=(255, 255, 255), lw=18)
msp.add_circle(tuple(D.xy([(cu, cv)])[0]), 1.8, dxfattribs={'layer': 'LANDSCAPE'}).rgb = (255, 255, 255)
# acoustic berm along Keshavarz + proposed trees (Faculty Street + West Garden + plaza)
pl(D.xy([(12, 115), (40, 116.5), (70, 112.5), (82, 111)]), 'LANDSCAPE', closed=False, rgb=(60, 120, 60), lw=35)
text('planted acoustic berm ≈ +1.0 m', D.xy([(46, 117.6)])[0], 0.9, 'LANDSCAPE', DEG - 3, rgb=(60, 120, 60))
NEW_TREES = [(u, 66.2) for u in range(16, 56, 8)] + [(15, 76), (22, 72), (14, 90), (22, 100)] + [(36, 41), (36, 52), (42, 55)] + [(104, 92), (110, 84)]
for u, v in NEW_TREES:
    p = D.xy([(u, v)])[0]; msp.add_circle(tuple(p), 2.6, dxfattribs={'layer': 'LANDSCAPE'}).rgb = (60, 140, 70)
    msp.add_circle(tuple(p), 0.25, dxfattribs={'layer': 'LANDSCAPE'}).rgb = (60, 140, 70)
# Faculty Street canopy (shaded colonnade along the north face of the hall + academic wing)
pl(D.xy([(18, 59.2), (97.5, 59.2), (97.5, 62.6), (18, 62.6)]), 'LANDSCAPE', rgb=(150, 120, 80), lw=18)
for u in np.arange(20, 97, 6): msp.add_circle(tuple(D.xy([(u, 62.2)])[0]), 0.2, dxfattribs={'layer': 'LANDSCAPE'})
text('shade canopy / colonnade', D.xy([(30, 60.9)])[0], 0.8, 'LANDSCAPE', DEG, rgb=(130, 100, 60))

# ---------------------------------------------------------------- functional zones
ZONES = [('PUBLIC & EVENTS · park side', [(26, 66), (101, 66), (101, 106), (26, 106)], (200, 80, 74)),
         ('SPORTS · toward the institutional edge', [(45.5, 19), (98.5, 19), (98.5, 60.2), (45.5, 60.2)], (232, 145, 58)),
         ('LEARNING · quiet west', [(16.5, 20.5), (47.5, 20.5), (47.5, 60.2), (16.5, 60.2)], (46, 134, 222))]
for name, Q, rgb in ZONES:
    pl(D.xy(Q), 'FUNCTIONAL_ZONES', rgb=rgb, lw=30, ltscale=1.5)

# ---------------------------------------------------------------- buildings
for b in D.BUILDINGS:
    Q = D.xy(b['poly']); g = Polygon(Q)
    hatch(g, 'PROPOSED_BUILDINGS_HATCH', GROUP_RGB[b['zone']], 0.35)
    e = pl(Q, 'PROPOSED_BUILDINGS', lw=50)
    gross = sum(a for fl in b['floors'] for _, a in fl)
    items = []
    for i, fl in enumerate(b['floors']):
        items.append(('GF', 'L1', 'L2', 'L3')[i] + ' ' + ' + '.join(f"{D.P[k]['en'].split(' (')[0].split(' —')[0]} {a}" for k, a in fl))
    e.set_xdata('PRJ_BUILDING', [(1000, b['id']), (1000, b['name']), (1040, round(gross, 1)), (1070, len(b['floors']))])
# building labels
LBL = {'B1': (72, 39.6, 0, 1.9), 'B2': (39.25, 29.5, 0, 0.85), 'B3': (25, 40.6, 90, 1.25), 'B4': (42, 85.2, 0, 1.7), 'B5': (88.5, 84.8, 0, 1.35)}
for b in D.BUILDINGS:
    u, v, r, h = LBL[b['id']]
    gross = sum(a for fl in b['floors'] for _, a in fl)
    lines = [b['name'], f"{gross:,} m² gross · {len(b['floors'])} level{'s' if len(b['floors']) > 1 else ''}"]
    if b['id'] == 'B1': lines += ['hall floor ≈ −1.5 m · north clerestory', 'L1 gallery 810 · L2 ancillary 420']
    if b['id'] == 'B3': lines += ['GF library 217 · "site" 89 (unresolved) · WC 52', 'L1–L2 classrooms']
    if b['id'] == 'B4': lines += ['GF hall 960 · L1 tech. + WC 246']
    if b['id'] == 'B5': lines += ['GF café 348 + staff welfare 160 + WC 52', 'L1 secondary assembly hall 512', 'L2 admin 249 + presidency 340 (controlled)']
    if b['id'] == 'B2': lines = ['WORKSHOP & LAB', '216 m² · 1 level']
    mtext('\\P'.join([('{\\fArial|b1|i0;' + lines[0] + '}')] + lines[1:]), D.xy([(u, v)])[0], h if True else 1, 'BUILDING_LABELS', DEG + r, attach=5)
    if b['id'] == 'B1':  # hall playing floor + clerestory line
        pl(D.xy([(51, 23), (93, 23), (93, 49), (51, 49)]), 'PROPOSED_UPPER_FLOORS', rgb=(150, 90, 40), lw=18)
        text('playing floor 42 × 26 (handball / futsal / volleyball)', D.xy([(72, 25)])[0], 0.9, 'PROPOSED_UPPER_FLOORS', DEG, rgb=(150, 90, 40))
        pl(D.xy([(46.5, 51.2), (97.5, 51.2)]), 'PROPOSED_UPPER_FLOORS', closed=False, rgb=(150, 90, 40))
        text('ancillary bar (3 levels)', D.xy([(72, 55.2)])[0], 0.9, 'PROPOSED_UPPER_FLOORS', DEG, rgb=(150, 90, 40))
    if b['id'] == 'B4':  # stage + raked seating sketch
        pl(D.xy([(31, 90), (53, 90), (53, 99.5), (31, 99.5)]), 'PROPOSED_UPPER_FLOORS', rgb=(150, 60, 55))
        text('stage', D.xy([(42, 94.8)])[0], 0.9, 'PROPOSED_UPPER_FLOORS', DEG)
        for k in range(5): pl(D.xy([(31 + k * .8, 74 + k * 3.2), (53 - k * .8, 74 + k * 3.2)]), 'PROPOSED_UPPER_FLOORS', closed=False, rgb=(150, 60, 55))
        pl(D.xy([(28, 68), (56, 68), (56, 72.5), (28, 72.5)]), 'PROPOSED_UPPER_FLOORS', rgb=(150, 60, 55))
        text('foyer', D.xy([(50, 70.2)])[0], 0.9, 'PROPOSED_UPPER_FLOORS', DEG)

# ---------------------------------------------------------------- circulation
for path in D.PED['primary']:
    pl(D.xy(path), 'PEDESTRIAN_CIRCULATION', closed=False, rgb=(30, 110, 200), lw=50, ltscale=1.6)
for path in D.PED['secondary']:
    pl(D.xy(path), 'PEDESTRIAN_CIRCULATION', closed=False, rgb=(80, 150, 220), lw=25, ltscale=1.0)
for path in D.EMERGENCY:
    pl(D.xy(path), 'VEHICULAR_CIRCULATION', closed=False, rgb=(200, 110, 30), lw=30, ltscale=2.0)
text('EMERGENCY ACCESS · 4 m clear (bollards)', D.xy([(86, 61.0)])[0], 0.8, 'VEHICULAR_CIRCULATION', DEG, rgb=(200, 110, 30), align='BOTTOM_CENTER')
for path in D.SERVICE:
    pl(D.xy(path), 'SERVICE_ACCESS', closed=False, rgb=(170, 120, 20), lw=35, ltscale=1.0)
pl(D.xy(D.SERVICE_YARD), 'SERVICE_ACCESS', rgb=(170, 120, 20), lw=25)
text('LOADING', D.xy([(102, 52.4)])[0], 0.85, 'SERVICE_ACCESS', DEG, rgb=(170, 120, 20))


def tri(u, v, ang, s, layer, rgb):
    pts = [(u + s * math.cos(ang), v + s * math.sin(ang)), (u + s * .6 * math.cos(ang + 2.4), v + s * .6 * math.sin(ang + 2.4)), (u + s * .6 * math.cos(ang - 2.4), v + s * .6 * math.sin(ang - 2.4))]
    Q = D.xy(pts); h = msp.add_hatch(dxfattribs={'layer': layer}); h.rgb = rgb; h.paths.add_polyline_path([tuple(q) for q in Q], is_closed=True); pl(Q, layer, rgb=rgb)


ENT_DIR = {'MAIN': -2.3, 'EAST': math.pi, 'WEST': 0.0, 'SOUTH': math.pi / 2, 'SERVICE': math.pi}
for u, v, lab, kind in D.ENTRANCES:
    if kind == 'bldg':
        tri(u, v, 0, 1.1, 'ENTRANCES', (200, 40, 40)); continue
    key = lab.split(' ')[0]; ang = ENT_DIR.get(key, 0)
    tri(u, v, ang, 2.6 if kind == 'main' else 1.9, 'ENTRANCES', (200, 40, 40) if kind != 'service' else (170, 120, 20))
    off = {'MAIN': (-4, 3.5, 'BOTTOM_RIGHT'), 'EAST': (2.5, 2.8, 'BOTTOM_LEFT'), 'WEST': (0.5, 3.0, 'BOTTOM_LEFT'), 'SOUTH': (2.4, -0.4, 'BOTTOM_LEFT'), 'SERVICE': (2.5, -3.0, 'TOP_LEFT')}[key]
    text(lab, D.xy([(u + off[0], v + off[1])])[0], 1.0 if kind != 'main' else 1.4, 'ENTRANCES', DEG, style='PRJ_TEXT_B', align=off[2], rgb=(200, 40, 40) if kind != 'service' else (170, 120, 20))

# ---------------------------------------------------------------- dimensions (aligned to the site grid)
def adim(a, b, dist):
    A, B = D.xy([a])[0], D.xy([b])[0]
    d = msp.add_aligned_dim(p1=tuple(A), p2=tuple(B), distance=dist, dimstyle='PRJ_DIM', dxfattribs={'layer': 'DIMENSIONS'}); d.render()


adim((46.5, 20.0), (97.5, 20.0), -2.4); adim((97.5, 20.0), (97.5, 59.2), -2.0)                 # hall
adim((18.0, 22.0), (32.0, 22.0), -2.4); adim((18.0, 22.0), (18.0, 59.2), 2.0)                   # academic
adim((28.0, 102.3), (56.0, 102.3), 2.0); adim((28.0, 68.0), (28.0, 102.3), 2.4)                 # auditorium
adim((76.5, 97.7), (100.5, 97.7), 2.0); adim((100.5, 72.0), (100.5, 97.7), -2.0)               # gateway
adim((57.0, 105.0), (75.0, 105.0), 1.6); adim((32.0, 22.1), (46.5, 22.1), -1.6)                # court · workshop
adim((0.0, 0.0), (114.0, 0.1), -6.0)                                                            # site: south edge

# ---------------------------------------------------------------- title block, legend, notes, north arrow, scale bar
X0, Y0 = 690.0, 0.0
pl([(X0, Y0), (X0 + 175, Y0), (X0 + 175, Y0 + 627.25), (X0, Y0 + 627.25)], 'ANNOTATIONS', lw=50)
A = 'ANNOTATIONS'


def T(s, x, y, h, bold=False, rgb=None): return text(s, (X0 + x, Y0 + y), h, A, 0, 'PRJ_TEXT_B' if bold else 'PRJ_TEXT', 'BOTTOM_LEFT', rgb)


T('FACULTY OF PHYSICAL EDUCATION', 8, 600, 5.0, True)
T('Preliminary concept site plan · "Faculty Street"', 8, 591, 3.0)
T('Tehran, District 6 · between Laleh Park (N) and the University of Tehran (S)', 8, 584, 2.0)
T('Design studio · concept stage · not for construction', 8, 578.5, 2.0, rgb=(150, 150, 150))
pl([(X0 + 8, 573), (X0 + 167, 573)], A, closed=False)
# north arrow (grid north ≈ true north: georeferencing against OSM gave −0.25° ± 0.3°)
nx, ny = X0 + 150, 548
pl([(nx, ny + 14), (nx + 5, ny - 6), (nx, ny - 2), (nx - 5, ny - 6)], A, lw=35)
h = msp.add_hatch(dxfattribs={'layer': A}); h.rgb = (30, 30, 30); h.paths.add_polyline_path([(nx, ny + 14), (nx, ny - 2), (nx - 5, ny - 6)], is_closed=True)
T('N', 150 - 1.6, 548 + 16, 4.0, True)
T('grid N ≈ true N (±0.3°)', 150 - 15, 548 - 13, 1.6, rgb=(110, 110, 110))
# scale bar
sx, sy = X0 + 8, 548
for k in range(5):
    q = [(sx + k * 10, sy), (sx + (k + 1) * 10, sy), (sx + (k + 1) * 10, sy + 2.2), (sx + k * 10, sy + 2.2)]
    if k % 2 == 0:
        hh = msp.add_hatch(dxfattribs={'layer': A}); hh.rgb = (30, 30, 30); hh.paths.add_polyline_path(q, is_closed=True)
    pl(q, A, lw=18)
for k in [0, 10, 20, 30, 40, 50]: T(str(k), 8 + k - 1, 548 + 3.4, 2.0)
T('metres · drawing units = m ($INSUNITS 6) · plot 1:500 on A1', 8, 548 - 5, 1.8)
pl([(X0 + 8, 531), (X0 + 167, 531)], A, closed=False)
# legend
T('LEGEND', 8, 522, 3.0, True)
y = 512
for name, rgb in [('Sports (hall + ancillary)', GROUP_RGB['Sports']), ('Assembly (auditorium)', GROUP_RGB['Assembly']), ('Academic (classrooms, library, lab)', GROUP_RGB['Academic']),
                  ('Gateway: admin · presidency · café · welfare · assembly', GROUP_RGB['Administration'])]:
    q = [(X0 + 8, y), (X0 + 20, y), (X0 + 20, y + 5), (X0 + 8, y + 5)]; hatch(Polygon(q), A, rgb, 0.35); pl(q, A, lw=35); T(name, 24, y + 1.2, 2.2); y -= 8
for name, rgb in [('Plaza / Faculty Street', OPEN_RGB['street']), ('Courts and gardens', OPEN_RGB['garden']), ('Green buffer (existing trees kept)', OPEN_RGB['buffer'])]:
    q = [(X0 + 8, y), (X0 + 20, y), (X0 + 20, y + 5), (X0 + 8, y + 5)]; hatch(Polygon(q), A, rgb, 0.45); pl(q, A); T(name, 24, y + 1.2, 2.2); y -= 8
for name, rgb, lw, lt in [('Site boundary (user-marked, on road edges)', (200, 40, 40), 70, 'PRJ_DASHDOT'), ('Primary pedestrian route', (30, 110, 200), 50, 'PRJ_DASH'),
                          ('Secondary pedestrian route', (80, 150, 220), 25, 'PRJ_DASH'), ('Emergency access (no public traffic)', (200, 110, 30), 30, 'PRJ_DASHDOT'),
                          ('Service route / loading', (170, 120, 20), 35, 'PRJ_DOT'), ('Functional zone', (120, 120, 120), 30, 'PRJ_DASH')]:
    e = pl([(X0 + 8, y + 2.5), (X0 + 20, y + 2.5)], A, closed=False, rgb=rgb, lw=lw); e.dxf.linetype = lt; T(name, 24, y + 1.2, 2.2); y -= 7
tri_xy = lambda x, yy, s, rgb: (lambda hh: (hh.paths.add_polyline_path([(x + s, yy), (x - s * .6, yy + s * .8), (x - s * .6, yy - s * .8)], is_closed=True), setattr(hh, 'rgb', rgb)))(msp.add_hatch(dxfattribs={'layer': A}))
tri_xy(X0 + 14, y + 2.5, 2.2, (200, 40, 40)); T('Entrance (site / building)', 24, y + 1.2, 2.2); y -= 7
msp.add_circle((X0 + 14, y + 2.5), 2.6, dxfattribs={'layer': A}).rgb = (60, 140, 70); T('Proposed tree   (existing trees: source layer TPX_VEGETATION_TREES_INDIVIDUAL)', 24, y + 1.2, 2.2); y -= 7
q = [(X0 + 9, y), (X0 + 19, y), (X0 + 19, y + 5), (X0 + 9, y + 5)]; pl(q, A, rgb=(120, 120, 120)); msp.add_line((X0 + 9, y), (X0 + 19, y + 5), dxfattribs={'layer': A}); msp.add_line((X0 + 9, y + 5), (X0 + 19, y), dxfattribs={'layer': A}); T('Existing structure to be removed (56 m², source handle 3395)', 24, y + 1.2, 2.2); y -= 9
pl([(X0 + 8, y), (X0 + 167, y)], A, closed=False); y -= 10
# area schedule
net, gross = D.totals()
T('PROGRAM · TARGET AREAS (m²)', 8, y, 3.0, True); y -= 7
T('Functional space', 8, y, 2.0, True); T('Net', 102, y, 2.0, True); T('Gross', 116, y, 2.0, True); T('Placed in', 132, y, 2.0, True); y -= 5.5
for k, p in D.P.items():
    T(p['en'], 8, y, 1.9); T(f"{p['net']:,}", 102, y, 1.9); T(f"{p['gross']:,}", 116, y, 1.9)
    T(', '.join(sorted({w.split(' ')[0] for w in D.where(k)})), 132, y, 1.9); y -= 5
pl([(X0 + 8, y + 3.5), (X0 + 167, y + 3.5)], A, closed=False)
T('TOTAL', 8, y, 2.0, True); T(f'{net:,}', 102, y, 2.0, True); T(f'{gross:,}', 116, y, 2.0, True); y -= 7
fp = sum(D.floor_area(b) for b in D.BUILDINGS)
for s_ in [f'Site area (user boundary, on road edges): {site.area:,.0f} m²', f'Ground-floor footprint: {fp:,.0f} m² = {fp / site.area * 100:.1f} % of the site',
           f'Total gross / site area: {gross / site.area:.2f}  (no FAR or coverage limit was available: none assumed)',
           'B1 sports hall · B2 workshop & lab · B3 academic wing · B4 auditorium · B5 gateway building']:
    T(s_, 8, y, 1.9); y -= 5
y -= 3; pl([(X0 + 8, y + 2), (X0 + 167, y + 2)], A, closed=False); y -= 6
T('NOTES & ASSUMPTIONS', 8, y, 3.0, True); y -= 6.5
NOTES = ['1  Source survey (layers TPX_*) is unchanged; all proposal geometry is on new layers listed in the layer table.',
         '2  Boundary = outer road edges of the block marked by the user (ring #65 of TPX_ROADS_CONTOURS); not a cadastral line.',
         '3  Hedayati and Enayat dead-end lanes lie inside the boundary and are kept open as public lanes (ownership to verify).',
         "4  Zare' lane is absorbed into the Faculty Street: pedestrian, with emergency / service access only at its east end.",
         '5  Levels: DXF 5 m contours give ≈1230 at Keshavarz and ≈1225 at the SE corner; SRTM gave ≈3 m. Survey required.',
         '6  "Site" (سایت, 66 / 89 m²) is kept as an unresolved program item reserved in the academic wing GF; function to confirm.',
         '7  Areas are planning targets; footprints follow gross area ÷ levels; no FAR / coverage rule was supplied or assumed.',
         '8  No on-site car parking (the existing lot is replaced); drop-off and accessible bays on Jalalieh, to be confirmed.',
         '9  Georeference to the site analysis: rotation −0.25°, building-overlap fit; north arrow = drawing +Y.',
         '10 Existing trees kept: no proposed footprint enters the crown (80 % radius) of a surveyed tree.']
for n_ in NOTES: T(n_, 8, y, 1.75); y -= 4.8

# ---------------------------------------------------------------- concept inset diagram (outside the frame, scale 1:2 of model)
cx0, cy0, k = X0 + 18, 128.0, 0.62
def ins(Q):
    Q = np.array(Q, float); c = np.array(site.centroid.coords[0]); return [(cx0 + 55 + (q[0] - c[0]) * k, cy0 - 15 + (q[1] - c[1]) * k) for q in Q]
T('CONCEPT · FACULTY STREET', 8, 184, 3.0, True)
T('park (N) ↔ university (S) threshold · public north · sports SE · learning west', 8, 178.5, 1.9)
pl(ins(D.site_xy()), 'CONCEPT_DIAGRAMS', rgb=(200, 40, 40))
for name, Q, rgb in ZONES:
    g = Polygon(ins(D.xy(Q))); hatch(g, 'CONCEPT_DIAGRAMS', rgb, 0.5); pl(list(g.exterior.coords), 'CONCEPT_DIAGRAMS', rgb=rgb)
pl(ins(D.xy([(116.5, 62.5), (8, 63.5)])), 'CONCEPT_DIAGRAMS', closed=False, rgb=(30, 110, 200), lw=70)
pl(ins(D.xy([(112, 118), (88, 98), (76, 70.5)])), 'CONCEPT_DIAGRAMS', closed=False, rgb=(30, 110, 200), lw=50)
for (u, v, s_) in [(64, 64.5, 'FACULTY STREET'), (64, 86, 'PUBLIC / EVENTS'), (72, 40, 'SPORTS'), (31, 40, 'LEARNING'), (62, 118, 'LALEH PARK ↑'), (60, -8, 'UNIVERSITY OF TEHRAN ↓')]:
    p = ins(D.xy([(u, v)]))[0]; text(s_, p, 1.7, 'CONCEPT_DIAGRAMS', DEG, 'PRJ_TEXT_B')

out = os.path.join(D.OUT, 'PE_Faculty_Concept_SitePlan.dxf')
doc.header['$LWDISPLAY'] = 1
doc.saveas(out)
print('saved', out)
