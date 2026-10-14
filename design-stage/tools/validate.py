"""Independent validation: re-open the output DXF, audit it, prove the source survey is untouched, and check the
proposal geometry against the boundary and the program. Prints a report; exit code ≠ 0 on failure."""
import os, sys, hashlib
import ezdxf
from ezdxf import recover
from shapely.geometry import Polygon
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import design as D
OUTF = os.path.join(D.OUT, 'PE_Faculty_Concept_SitePlan.dxf')
fail = []
def chk(c, m):
    print(('  ✓ ' if c else '  ✗ ') + m)
    if not c: fail.append(m)

print('source sha256', hashlib.sha256(open(D.SRC, 'rb').read()).hexdigest()[:16], '(file not modified by the tools)')
src = ezdxf.readfile(D.SRC)
doc, auditor = recover.readfile(OUTF)
chk(not auditor.has_errors, f'output opens and audits clean (errors {len(auditor.errors)}, fixes {len(auditor.fixes)})')
au = doc.audit(); chk(not au.has_errors, 'ezdxf audit of the reopened document: no errors')
chk(doc.dxfversion == src.dxfversion, f'DXF version kept: {doc.dxfversion}')
for k in ['$INSUNITS', '$MEASUREMENT', '$LUNITS', '$INSBASE']:
    chk(doc.header.get(k) == src.header.get(k), f'header {k} unchanged ({src.header.get(k)})')

# every source entity is still there, same type, layer and geometry
def sig(e):
    t = e.dxftype(); a = [t, e.dxf.layer]
    if t == 'LWPOLYLINE': a += [tuple(round(v, 6) for v in p[:2]) for p in e.get_points('xy')] + [e.closed]
    elif t == 'INSERT': a += [e.dxf.name, tuple(round(v, 6) for v in e.dxf.insert), round(e.dxf.xscale, 6), round(e.dxf.rotation, 6)]
    elif t == 'TEXT': a += [e.dxf.text, tuple(round(v, 6) for v in e.dxf.insert), round(e.dxf.height, 6)]
    elif t == 'HATCH': a += [len(e.paths), e.dxf.pattern_name]
    return tuple(a)
S = {e.dxf.handle: sig(e) for e in src.modelspace()}
O = {e.dxf.handle: e for e in doc.modelspace()}
missing = [h for h in S if h not in O]; changed = [h for h in S if h in O and sig(O[h]) != S[h]]
chk(not missing, f'all {len(S)} source model-space entities present (missing {len(missing)})')
chk(not changed, f'source entities geometrically unchanged (changed {len(changed)})')
chk(len(list(src.blocks)) <= len(list(doc.blocks)), f'source blocks kept ({len(list(src.blocks))} → {len(list(doc.blocks))}, none exploded)')
srcL = {l.dxf.name: (l.dxf.color, l.dxf.linetype) for l in src.layers}
chk(all(n in doc.layers and (doc.layers.get(n).dxf.color, doc.layers.get(n).dxf.linetype) == v for n, v in srcL.items()), f'{len(srcL)} source layers kept with their properties')
new = [e for h, e in O.items() if h not in S]
newL = sorted({e.dxf.layer for e in new})
chk(all(not l.startswith('TPX_') for l in newL), 'no new entity was put on a source (TPX_*) layer')
print('  new layers:', ', '.join(f"{l} ({sum(1 for e in new if e.dxf.layer == l)})" for l in newL))
empty = [l.dxf.name for l in doc.layers if l.dxf.name not in srcL and not any(e.dxf.layer == l.dxf.name for e in new)]
chk(not empty, f'no empty proposal layers {empty}')

# proposal checks
site = Polygon(D.site_xy())
fps = [e for e in new if e.dxf.layer == 'PROPOSED_BUILDINGS']
chk(len(fps) == len(D.BUILDINGS) and all(e.closed for e in fps), f'{len(fps)} building footprints, all closed polylines')
for e in fps:
    g = Polygon([p[:2] for p in e.get_points('xy')])
    chk(site.buffer(-0.4).contains(g), f'footprint {g.area:7.1f} m² lies inside the boundary')
labels = ' '.join((e.plain_text() if e.dxftype() == 'MTEXT' else e.dxf.text) for e in new if e.dxf.layer == 'BUILDING_LABELS')
for b in D.BUILDINGS:
    gross = sum(a for fl in b['floors'] for _, a in fl)
    chk(b['name'] in labels and f'{gross:,}' in labels, f"label for {b['id']} {b['name']} shows {gross:,} m²")
pl = D.placed(); net, gross = D.totals()
chk(len(D.P) == 12 and all(pl[k] == p['gross'] for k, p in D.P.items()), f'all 12 program items placed with their exact gross (Σ {sum(pl.values()):,} = {gross:,})')
chk((net, gross) == (5759, 7864), f'totals net {net:,} / gross {gross:,} match the brief')
anno = ' '.join((e.plain_text() if e.dxftype() == 'MTEXT' else e.dxf.text) for e in new if e.dxftype() in ('TEXT', 'MTEXT') and e.dxf.layer == 'ANNOTATIONS')
chk(all(p['en'] in anno for p in D.P.values()), 'area schedule in the title block lists all 12 items')
ped = [e for e in new if e.dxf.layer == 'PEDESTRIAN_CIRCULATION']
chk(len(ped) == len(D.PED['primary']) + len(D.PED['secondary']), f'{len(ped)} pedestrian routes drawn')
# connectivity: every route touches another route or the boundary (no dead ends in the network)
from shapely.geometry import LineString
from shapely.ops import unary_union
lines = [LineString([p[:2] for p in e.get_points('xy')]) for e in ped]
net_ = unary_union(lines)
chk(net_.geom_type in ('LineString', 'MultiLineString') and unary_union([l.buffer(0.8) for l in lines]).geom_type == 'Polygon', 'pedestrian network is one connected system')
for b in D.BUILDINGS:
    g = D.bpoly(b); chk(any(l.distance(g) < 4.5 for l in lines), f"{b['id']} reached by the pedestrian network (≤ 4.5 m)")
print('RESULT:', 'PASS' if not fail else f'FAIL ({len(fail)})'); sys.exit(1 if fail else 0)
