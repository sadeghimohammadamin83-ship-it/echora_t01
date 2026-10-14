"""Geometry + program checks (run before and after writing the DXF)."""
import sys, itertools
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
import design as D
site = Polygon(D.site_xy()); ok = True
def bad(m):
    global ok; ok = False; print('  ✗', m)
print('site area', round(site.area, 1), 'valid', site.is_valid)
# program
pl = D.placed()
for k, p in D.P.items():
    if pl[k] != p['gross']: bad(f'{k} placed {pl[k]} ≠ gross {p["gross"]}')
net, gross = D.totals(); print('program net', net, 'gross', gross, '| placed', sum(pl.values()))
# floors ≤ footprint, buildings inside site, no overlaps, tree conflicts
fp = 0
for b in D.BUILDINGS:
    A = D.floor_area(b); fp += A
    for i, fl in enumerate(b['floors']):
        s = sum(a for _, a in fl)
        if s > A + 1: bad(f'{b["id"]} floor {i} {s} > footprint {A:.0f}')
    g = D.bpoly(b)
    if not site.buffer(-0.5).contains(g): bad(f'{b["id"]} not inside the boundary')
    for lname, L in D.lanes_xy().items():
        if g.intersects(Polygon(L)) and 'Zare' not in lname: bad(f'{b["id"]} on {lname}')
    hit = [(round(r, 1)) for x, y, r in D.trees() if g.intersects(Point(x, y).buffer(r * 0.8))]
    print(f'  {b["id"]} {b["name"]:<18} footprint {A:7.1f}  floors {len(b["floors"])}  gross {sum(a for fl in b["floors"] for _, a in fl):5d}  tree crowns touched {hit}')
for a, b in itertools.combinations(D.BUILDINGS, 2):
    if D.bpoly(a).intersection(D.bpoly(b)).area > 0.5: bad(f'{a["id"]} overlaps {b["id"]}')
print(f'ground coverage {fp:.0f} m² = {fp / site.area * 100:.1f} %   FAR(gross/site) {gross / site.area:.2f}')
for oid, name, poly, kind in D.OPEN:
    o = D.open_poly(poly)
    if not o.is_valid: bad(f'{oid} invalid polygon')
    out = o.difference(site.buffer(0.6)).area
    if out > 2: bad(f'{oid} {out:.1f} m² outside boundary')
    ov = sum(o.intersection(D.bpoly(b)).area for b in D.BUILDINGS)
    if ov > 1: bad(f'{oid} overlaps buildings {ov:.1f} m²')
yard = Polygon(D.xy(D.SERVICE_YARD)); print('service yard trees', [r for x, y, r in D.trees() if yard.intersects(Point(x, y).buffer(r * .8))])
# existing building inside the site
import ezdxf
for e in D.source().modelspace().query('LWPOLYLINE[layer=="TPX_BUILDINGS"]'):
    q = Polygon([p[:2] for p in e.get_points('xy')])
    if q.intersects(site): print('existing building inside boundary:', round(q.area, 1), 'm², handle', e.dxf.handle, 'under', [b['id'] for b in D.BUILDINGS if D.bpoly(b).intersects(q)])
print('OK' if ok else 'FAILED'); sys.exit(0 if ok else 1)
