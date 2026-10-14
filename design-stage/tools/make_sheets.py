"""Six A3 presentation sheets (PNG + one PDF), drawn from the same data as the DXF (design.py / content.py).
01 concept site plan · 02 concept inference · 03 alternatives · 04 relationships (matrix + bubbles)
05 zoning + circulation · 06 program schedule, stacking and rationale"""
import os, sys, math, glob
import numpy as np
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.patches import Polygon as MPoly, Circle, FancyArrowPatch, Rectangle, FancyBboxPatch
from matplotlib.backends.backend_pdf import PdfPages
from shapely.geometry import Polygon, box, LineString
import arabic_reshaper
from bidi.algorithm import get_display
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import design as D
import content as C

# ---------------------------------------------------------------- typography & palette
for f in glob.glob(os.path.expanduser('~/.fonts/Vazirmatn-*.ttf')): fm.fontManager.addfont(f)
plt.rcParams.update({'font.family': ['Vazirmatn', 'DejaVu Sans'], 'font.size': 8, 'axes.linewidth': 0.6, 'pdf.fonttype': 42})
INK, MUTE, LINE, PAPER = '#1C1E21', '#7A7D82', '#C9C6BF', '#FAF8F4'
G = {'Sports': '#E8913A', 'Assembly': '#C8504A', 'Academic': '#2E86DE', 'Administration': '#7C5CC4', 'Amenity': '#D2AA3C',
     'Services': '#8C8C8C', 'Unresolved': '#9A9A9A'}
OPEN_C = {'plaza': '#D9D0BD', 'street': '#E9DDC4', 'court': '#BFD7A9', 'garden': '#C7DDB0', 'buffer': '#9CC487', 'walk': '#D4E3C2'}
PED1, PED2, SERV, EMER, RED = '#1E6EC8', '#5CA0E0', '#B07A14', '#D07020', '#C8282E'
KEYCOL = {k: G[p['group']] for k, p in D.P.items()}


def fa(s): return s   # matplotlib ≥ 3.10 shapes Arabic script and applies bidi itself (raqm)


A3 = (16.54, 11.69)
site = Polygon(D.site_xy())
SX0, SY0, SX1, SY1 = site.bounds
src = D.source().modelspace()


def sheet(no, title, title_fa, sub):
    fig = plt.figure(figsize=A3, facecolor=PAPER)
    fig.text(0.025, 0.955, f'{no:02d}', fontsize=30, color='#2E86DE', weight='light', va='center')
    fig.text(0.075, 0.962, title, fontsize=17, color=INK, weight='bold', va='center')
    fig.text(0.075, 0.935, sub, fontsize=9, color=MUTE, va='center')
    fig.text(0.975, 0.962, fa(title_fa), fontsize=15, color=INK, ha='right', va='center', weight='bold')
    fig.add_artist(plt.Line2D([0.025, 0.975], [0.915, 0.915], color=INK, lw=0.8))
    fig.add_artist(plt.Line2D([0.025, 0.975], [0.045, 0.045], color=LINE, lw=0.6))
    fig.text(0.025, 0.028, 'Faculty of Physical Education · Tehran District 6 · concept stage — studio review · drawn on the supplied DXF (metres)', fontsize=7, color=MUTE)
    fig.text(0.975, 0.028, fa('دانشکده‌ی تربیت بدنی — مرحله‌ی ایده‌ی طراحی'), fontsize=8, color=MUTE, ha='right')
    return fig


def plan_ax(fig, rect, pad=24, context=True, light=False, lim=None):
    ax = fig.add_axes(rect); ax.set_aspect('equal'); ax.axis('off')
    x0, y0, x1, y1 = lim or (SX0 - pad, SY0 - pad, SX1 + pad, SY1 + pad)
    W = box(x0, y0, x1, y1)
    if context:
        for e in src.query('LWPOLYLINE[layer=="TPX_VEGETATION_GREEN_SPACES"]'):
            g = Polygon([p[:2] for p in e.get_points('xy')]).buffer(0).intersection(W)
            for gg in ([g] if g.geom_type == 'Polygon' else getattr(g, 'geoms', [])):
                if gg.geom_type == 'Polygon' and gg.area > 1: ax.add_patch(MPoly(np.array(gg.exterior.coords), fc='#DCE8CF', ec='none', zorder=0))
        for e in src.query('LWPOLYLINE[layer=="TPX_ROADS_CONTOURS"]'):
            P = np.array([p[:2] for p in e.get_points('xy')] + [e.get_points('xy')[0][:2]])
            ax.plot(*P.T, color='#B9B5AC' if not light else '#D6D3CC', lw=0.5, zorder=1)
        for e in src.query('LWPOLYLINE[layer=="TPX_BUILDINGS"]'):
            g = Polygon([p[:2] for p in e.get_points('xy')])
            if g.intersects(W) and not g.intersects(site): ax.add_patch(MPoly(np.array(g.exterior.coords), fc='#D8D4CC' if not light else '#E6E3DD', ec='#A8A39A', lw=0.4, zorder=2))
        for x, y, r in D.trees():
            if x0 < x < x1 and y0 < y < y1: ax.add_patch(Circle((x, y), r, fc='#8DB87A', ec='#5E8C4E', lw=0.3, alpha=0.45 if not light else 0.25, zorder=3))
        for e in src.query('LWPOLYLINE[layer=="TPX_CONTOUR_LINES_5M"]'):
            P = np.array([p[:2] for p in e.get_points('xy')]); ax.plot(*P.T, color='#B0864A', lw=0.6, ls=(0, (4, 2)), zorder=1, alpha=0.8)
        for t in src.query('TEXT[layer=="TPX_CONTOUR_LINES_5M_TEXT"]'):
            p = t.dxf.insert
            if x0 < p.x < x1 and y0 < p.y < y1: ax.text(p.x, p.y, t.dxf.text.replace('.0', ''), fontsize=6, color='#9A6E30', ha='center', zorder=4)
    ax.set_xlim(x0, x1); ax.set_ylim(y0, y1)
    return ax


def boundary(ax, lw=1.6):
    P = np.array(D.site_xy() + [D.site_xy()[0]]); ax.plot(*P.T, color=RED, lw=lw, ls=(0, (8, 2, 1, 2)), zorder=20)


def bpatch(ax, b, fc, alpha=1, ec=INK, lw=1.1, z=10, hatch=None):
    ax.add_patch(MPoly(D.xy(b['poly']), fc=fc, ec=ec, lw=lw, alpha=alpha, zorder=z, hatch=hatch))


def opatch(ax, kind_filter=None, alpha=1):
    for oid, name, poly, kind in D.OPEN:
        if kind_filter and kind not in kind_filter: continue
        g = D.open_poly(poly)
        for gg in ([g] if g.geom_type == 'Polygon' else g.geoms): ax.add_patch(MPoly(np.array(gg.exterior.coords), fc=OPEN_C[kind], ec='#9A9078', lw=0.4, alpha=alpha, zorder=5))


def route(ax, pts, col, lw, ls='-', z=15, arrow=False):
    P = D.xy(pts); ax.plot(*P.T, color=col, lw=lw, ls=ls, zorder=z, solid_capstyle='round')
    if arrow: ax.add_patch(FancyArrowPatch(P[-2], P[-1], arrowstyle='-|>', mutation_scale=10 + lw * 2, color=col, lw=0, zorder=z))


def north(ax, x, y, s=10):
    ax.add_patch(MPoly([(x, y + s), (x + s * .35, y - s * .45), (x, y - s * .2)], fc=INK, ec=INK, lw=0.5, zorder=30))
    ax.add_patch(MPoly([(x, y + s), (x - s * .35, y - s * .45), (x, y - s * .2)], fc='white', ec=INK, lw=0.5, zorder=30))
    ax.text(x, y + s * 1.25, 'N', ha='center', va='bottom', fontsize=9, weight='bold', zorder=30)


def scalebar(ax, x, y, L=50, step=10):
    for k in range(int(L / step)):
        ax.add_patch(Rectangle((x + k * step, y), step, 2.2, fc=INK if k % 2 == 0 else 'white', ec=INK, lw=0.5, zorder=30))
    for k in range(0, L + 1, step): ax.text(x + k, y - 1.5, str(k), ha='center', va='top', fontsize=6.5, zorder=30)
    ax.text(x + L + 3, y + 1, 'm', fontsize=6.5, va='center', zorder=30)


def uvtext(ax, u, v, s, size=7, rot=0, **kw):
    p = D.xy([(u, v)])[0]; ax.text(p[0], p[1], s, fontsize=size, rotation=math.degrees(D.TH) + rot, ha='center', va='center', rotation_mode='anchor', zorder=kw.pop('z', 25), **kw)


def gross_of(b): return sum(a for fl in b['floors'] for _, a in fl)


def names_short(b):
    return {'B1': 'SPORTS HALL', 'B2': 'WORKSHOP\n& LAB', 'B3': 'ACADEMIC WING', 'B4': 'AUDITORIUM', 'B5': 'GATEWAY'}[b['id']]


BC = {'B1': G['Sports'], 'B2': G['Academic'], 'B3': G['Academic'], 'B4': G['Assembly'], 'B5': G['Administration']}
LBL = {'B1': (72, 39.6, 0), 'B2': (39.25, 29.5, 0), 'B3': (25, 40.6, 90), 'B4': (42, 85.2, 0), 'B5': (88.5, 84.8, 0)}
out_png = []

# ================================================================ 01 SITE PLAN
fig = sheet(1, 'CONCEPT SITE PLAN — "FACULTY STREET"', 'سایت‌پلان ایده — خیابانِ دانشکده',
            'Proposal drawn directly over the supplied DXF survey · boundary = road edges of the block marked by the user · 1:500 at A1 (scaled here)')
ax = plan_ax(fig, [0.02, 0.06, 0.64, 0.84], pad=30)
opatch(ax)
for b in D.BUILDINGS:
    bpatch(ax, b, BC[b['id']], alpha=0.88)
    u, v, r = LBL[b['id']]
    d1, d2 = (1.6, 1.9) if b['id'] != 'B2' else (0.9, 2.6)
    o1, o2 = ((u - d1, v), (u + d2, v)) if r == 90 else ((u, v + d1), (u, v - d2))
    uvtext(ax, *o1, names_short(b), 8.5 if b['id'] != 'B2' else 5.5, r, color='white', weight='bold')
    uvtext(ax, *o2, f"{gross_of(b):,} m² · {len(b['floors'])} lev.", 6.5 if b['id'] != 'B2' else 5, r, color='white')
# existing to remove
for e in src.query('LWPOLYLINE[layer=="TPX_BUILDINGS"]'):
    g = Polygon([p[:2] for p in e.get_points('xy')])
    if g.intersects(site): P = np.array(g.exterior.coords); ax.plot(*P.T, color='white', lw=0.8, ls=':', zorder=12); bx = g.bounds; ax.plot([bx[0], bx[2]], [bx[1], bx[3]], color='white', lw=0.6, zorder=12); ax.plot([bx[0], bx[2]], [bx[3], bx[1]], color='white', lw=0.6, zorder=12)
# court markings, canopy, new trees
cu, cv = 66.0, 89.0
ax.add_patch(MPoly(D.xy([(cu - 7.5, cv - 14), (cu + 7.5, cv - 14), (cu + 7.5, cv + 14), (cu - 7.5, cv + 14)]), fc='#A9CC8E', ec='white', lw=1.1, zorder=7))
ax.plot(*D.xy([(cu - 7.5, cv), (cu + 7.5, cv)]).T, color='white', lw=0.8, zorder=8)
ax.add_patch(MPoly(D.xy([(18, 59.2), (97.5, 59.2), (97.5, 62.6), (18, 62.6)]), fc='#C8B48C', ec='#8A7350', lw=0.5, alpha=0.75, zorder=9, hatch='////'))
for u, v in [(u, 66.2) for u in range(16, 56, 8)] + [(15, 76), (22, 72), (14, 90), (22, 100), (36, 41), (36, 52), (42, 55), (104, 92), (110, 84)]:
    p = D.xy([(u, v)])[0]; ax.add_patch(Circle(p, 2.6, fc='#6FA35A', ec='#3F6E33', lw=0.5, alpha=0.8, zorder=13))
for path in D.PED['primary']: route(ax, path, PED1, 2.2, (0, (4, 2)), arrow=False)
for path in D.PED['secondary']: route(ax, path, PED2, 1.1, (0, (3, 2)))
for path in D.EMERGENCY: route(ax, path, EMER, 1.0, (0, (6, 2, 1, 2)))
for path in D.SERVICE: route(ax, path, SERV, 1.6, ':', arrow=True)
ax.add_patch(MPoly(D.xy(D.SERVICE_YARD), fc='none', ec=SERV, lw=1, ls=':', zorder=16))
for u, v, lab, kind in D.ENTRANCES:
    p = D.xy([(u, v)])[0]
    if kind == 'bldg': ax.plot(*p, marker='v', ms=4.5, color=RED, zorder=22); continue
    ax.plot(*p, marker='o', ms=9 if kind == 'main' else 6.5, mfc=RED if kind != 'service' else SERV, mec='white', mew=1.2, zorder=23)
OLAB = {'O1': (101, 110, 0, 'ENTRY PLAZA'), 'O2': (64, 64.9, 0, 'FACULTY STREET'), 'O3': (66, 99.6, 0, 'OUTDOOR COURT'), 'O4': (39.2, 47, 90, 'LEARNING COURT'),
        'O5': (19, 86, 90, 'WEST GARDEN'), 'O6': (40, 112.5, -4, 'PARK EDGE GARDEN · acoustic berm'), 'O7': (72, 15.5, 0, 'POURSINA PLANE-TREE WALK'),
        'O8': (106.5, 33, 90, 'JALALIEH EDGE'), 'O9': (109, 80, 90, 'CAFÉ TERRACE')}
for k, (u, v, r, s) in OLAB.items(): uvtext(ax, u, v, s, 6.3, r, color='#4A5A3A', weight='bold')
boundary(ax)
# street names (outside the boundary)
for (u, v, s, r) in [(60, 128, 'KESHAVARZ BLVD  →  LALEH PARK', -6), (60, -9, 'POURSINA ST (one-way ←)  ·  UNIVERSITY OF TEHRAN', 0), (123, 50, 'JALALIEH', 90), (-6, 95, 'HEDAYATI', 96), (-6, 20, 'ENAYAT', 90)]:
    uvtext(ax, u, v, s, 7, r, color=MUTE, weight='bold')
uvtext(ax, 108, 122.5, 'MAIN\nENTRANCE', 6.5, 0, color=RED, weight='bold')
uvtext(ax, 123.5, 63, 'EAST GATE', 5.8, 90, color=RED, weight='bold')
uvtext(ax, 39, -3.6, 'SOUTH GATE', 5.8, 0, color=RED, weight='bold')
uvtext(ax, 2.0, 70.5, 'WEST\nGATE', 5.3, 0, color=RED, weight='bold')
uvtext(ax, 126.5, 38, 'SERVICE ⟵ from Poursina', 5.3, 90, color=SERV, weight='bold')
x0, y0, x1, y1 = ax.get_xlim()[0], ax.get_ylim()[0], ax.get_xlim()[1], ax.get_ylim()[1]
north(ax, x1 - 12, y1 - 20); scalebar(ax, x0 + 8, y0 + 8)
# right column: legend + key numbers + concept
R = fig.add_axes([0.675, 0.06, 0.3, 0.84]); R.axis('off'); R.set_xlim(0, 1); R.set_ylim(0, 1)
R.text(0, 0.985, 'CONCEPT', fontsize=11, weight='bold', va='top')
R.text(0, 0.955, C.CONCEPT['idea'], fontsize=7.6, va='top', wrap=True, color=INK, linespacing=1.45)
import textwrap
R.texts[-1].set_text('\n'.join(textwrap.wrap(C.CONCEPT['idea'], 64)))
R.text(1, 0.835, '\n'.join(fa(l) for l in textwrap.wrap(C.CONCEPT['idea_fa'], 70)), fontsize=7.4, va='top', ha='right', color='#3A3D42', linespacing=1.6)
y = 0.71
R.text(0, y, 'LEGEND', fontsize=10, weight='bold'); y -= 0.035
for name, col in [('Sports hall (B1)', G['Sports']), ('Auditorium (B4)', G['Assembly']), ('Academic wing + workshop / lab (B3, B2)', G['Academic']),
                  ('Gateway: café · welfare · assembly hall · admin · presidency (B5)', G['Administration'])]:
    R.add_patch(Rectangle((0, y - 0.006), 0.05, 0.018, fc=col, ec=INK, lw=0.6)); R.text(0.07, y + 0.003, name, fontsize=7.4, va='center'); y -= 0.03
for name, col in [('Plaza / Faculty Street', OPEN_C['street']), ('Courts and gardens', OPEN_C['garden']), ('Green buffer — existing plane trees kept', OPEN_C['buffer'])]:
    R.add_patch(Rectangle((0, y - 0.006), 0.05, 0.018, fc=col, ec='#9A9078', lw=0.6)); R.text(0.07, y + 0.003, name, fontsize=7.4, va='center'); y -= 0.03
for name, col, lw, ls in [('Site boundary (user-marked, on the road edges)', RED, 1.6, (0, (8, 2, 1, 2))), ('Primary pedestrian route', PED1, 2.2, (0, (4, 2))),
                          ('Secondary pedestrian route', PED2, 1.1, (0, (3, 2))), ('Emergency access (no public traffic)', EMER, 1.0, (0, (6, 2, 1, 2))), ('Service route + loading bay', SERV, 1.6, ':')]:
    R.plot([0, 0.05], [y + 0.003] * 2, color=col, lw=lw, ls=ls); R.text(0.07, y + 0.003, name, fontsize=7.4, va='center'); y -= 0.028
R.plot([0.025], [y + 0.003], marker='o', ms=8, mfc=RED, mec='white'); R.text(0.07, y + 0.003, 'Site entrance', fontsize=7.4, va='center'); y -= 0.028
R.plot([0.025], [y + 0.003], marker='v', ms=5, color=RED); R.text(0.07, y + 0.003, 'Building entrance', fontsize=7.4, va='center'); y -= 0.028
R.add_patch(Circle((0.025, y + 0.003), 0.012, fc='#6FA35A', ec='#3F6E33')); R.text(0.07, y + 0.003, 'Proposed tree  (pale circles = surveyed trees, DXF)', fontsize=7.4, va='center'); y -= 0.028
R.plot([0.01, 0.04], [y - 0.004, y + 0.01], color=INK, lw=0.6); R.plot([0.01, 0.04], [y + 0.01, y - 0.004], color=INK, lw=0.6); R.text(0.07, y + 0.003, 'Existing structure removed (56 m²)', fontsize=7.4, va='center'); y -= 0.028
R.plot([0, 0.05], [y + 0.003] * 2, color='#B0864A', lw=0.8, ls=(0, (4, 2))); R.text(0.07, y + 0.003, '5 m contours from the DXF (1225 / 1230)', fontsize=7.4, va='center'); y -= 0.04
net, gross = D.totals(); fp = sum(D.floor_area(b) for b in D.BUILDINGS)
R.text(0, y, 'KEY NUMBERS', fontsize=10, weight='bold'); y -= 0.035
for k_, v_ in [('Site (user boundary)', f'{site.area:,.0f} m²'), ('Program net / gross', f'{net:,} / {gross:,} m²'), ('Ground-floor footprint', f'{fp:,.0f} m²  ({fp / site.area * 100:.0f} %)'),
               ('Gross / site area', f'{gross / site.area:.2f}'), ('Open space', f'{site.area - fp:,.0f} m²  ({(site.area - fp) / site.area * 100:.0f} %)'), ('Height', '1–3 levels (hall ≈12 m, sunk ≈1.5 m)')]:
    R.text(0, y, k_, fontsize=7.6, color=MUTE); R.text(1, y, v_, fontsize=7.8, ha='right', weight='bold'); R.plot([0, 1], [y - 0.008] * 2, color=LINE, lw=0.4); y -= 0.026
fig.savefig(os.path.join(D.OUT, 'Sheet01_Concept_Site_Plan.png'), dpi=170, facecolor=PAPER); out_png.append(fig)

# ================================================================ 02 CONCEPT INFERENCE
fig = sheet(2, 'CONCEPT INFERENCE', 'استنتاج ایده از تحلیل سایت', 'Site findings → design opportunities → design principles → architectural concept → spatial organisation')
cols = [('SITE FINDINGS', 'یافته‌ها'), ('OPPORTUNITIES / CONSTRAINTS', 'فرصت / محدودیت'), ('DESIGN DRIVERS', 'محرک‌های طراحی'), ('PRINCIPLES', 'اصول'), ('CONCEPT → ORGANISATION', 'ایده ← سازمان فضایی')]
X = [0.025, 0.215, 0.405, 0.595, 0.785]; Wc = 0.18
for i, (t, tf) in enumerate(cols):
    fig.text(X[i], 0.892, t, fontsize=9.5, weight='bold'); fig.text(X[i], 0.872, fa(tf), fontsize=8.5, ha='left', color=MUTE)
    if i < 4: fig.add_artist(FancyArrowPatch((X[i] + Wc - 0.012, 0.876), (X[i + 1] - 0.004, 0.876), transform=fig.transFigure, arrowstyle='-|>', mutation_scale=12, color='#2E86DE'))
y = 0.86
for fid, txt, srcs, st, oc, drv in C.FINDINGS:
    h = 0.052
    fig.add_artist(FancyBboxPatch((X[0], y - h), Wc, h - 0.006, boxstyle='round,pad=0.002,rounding_size=0.004', transform=fig.transFigure, fc='white', ec=LINE, lw=0.5))
    fig.text(X[0] + 0.004, y - 0.008, fid, fontsize=6.6, weight='bold', color='#2E86DE', va='top')
    fig.text(X[0] + 0.022, y - 0.008, '\n'.join(textwrap.wrap(txt, 58)[:3]), fontsize=5.6, va='top', linespacing=1.2)
    tag = {'D': 'documented', 'H': 'hypothesis — verify', 'C': 'calculated'}[st]
    fig.text(X[0] + Wc - 0.004, y - h + 0.0005, f'{srcs} · {tag}', fontsize=4.9, ha='right', va='bottom', color='#C8282E' if st == 'H' else MUTE)
    colr = {'O': '#4E9A3E', 'C': '#C8504A', 'O/C': '#B07A14'}[oc]
    fig.add_artist(FancyBboxPatch((X[1], y - h), Wc, h - 0.006, boxstyle='round,pad=0.002,rounding_size=0.004', transform=fig.transFigure, fc='white', ec=colr, lw=0.6))
    fig.text(X[1] + 0.004, y - 0.008, {'O': 'OPPORTUNITY', 'C': 'CONSTRAINT', 'O/C': 'OPPORTUNITY + CONSTRAINT'}[oc], fontsize=5.6, weight='bold', color=colr, va='top')
    fig.text(X[1] + 0.004, y - 0.02, '\n'.join(textwrap.wrap(drv, 54)[:3]), fontsize=5.8, va='top', linespacing=1.25)
    fig.add_artist(plt.Line2D([X[0] + Wc, X[1]], [y - h / 2] * 2, transform=fig.transFigure, color=LINE, lw=0.5))
    y -= h + 0.0005
y = 0.86
for name, txt in C.DRIVERS:
    fig.add_artist(FancyBboxPatch((X[2], y - 0.13), Wc, 0.122, boxstyle='round,pad=0.002,rounding_size=0.006', transform=fig.transFigure, fc='#EEF4FB', ec='#2E86DE', lw=0.7))
    fig.text(X[2] + 0.008, y - 0.018, name.upper(), fontsize=9, weight='bold', color='#1E5FA8', va='top')
    fig.text(X[2] + 0.008, y - 0.045, '\n'.join(textwrap.wrap(txt, 40)), fontsize=7.2, va='top', linespacing=1.4)
    y -= 0.155
fig.text(X[2], 0.085, 'Drivers combine F1–F14; see the O/C chips (green = opportunity, red = constraint).', fontsize=5.8, color=MUTE)
y = 0.86
for p in C.PRINCIPLES:
    fig.add_artist(FancyBboxPatch((X[3], y - 0.13), Wc, 0.122, boxstyle='round,pad=0.002,rounding_size=0.006', transform=fig.transFigure, fc='white', ec=INK, lw=0.7))
    fig.text(X[3] + 0.008, y - 0.014, p[0], fontsize=22, weight='light', color='#2E86DE', va='top')
    fig.text(X[3] + 0.04, y - 0.022, '\n'.join(textwrap.wrap(p[3:], 30)), fontsize=8, va='top', linespacing=1.4, weight='bold')
    y -= 0.155
# concept diagram + organisation
axc = plan_ax(fig, [X[4] - 0.005, 0.47, Wc + 0.01, 0.4], pad=6, context=False)
axc.add_patch(MPoly(np.array(D.site_xy()), fc='#F1ECE2', ec=RED, lw=1, ls=(0, (6, 2))))
for b in D.BUILDINGS: bpatch(axc, b, BC[b['id']], alpha=0.9, lw=0.6)
route(axc, [(116.5, 62.5), (6, 63.5)], PED1, 4, arrow=True); route(axc, [(6, 63.5), (116.5, 62.5)], PED1, 4, arrow=True)
route(axc, [(112, 120), (88, 99), (76, 70)], PED1, 2.5, arrow=True)
uvtext(axc, 60, 63.3, 'FACULTY STREET', 6, 0, color='white', weight='bold')
uvtext(axc, 60, 127, '↑ LALEH PARK', 6.5, 0, color='#4E9A3E', weight='bold'); uvtext(axc, 58, -6, '↓ UNIVERSITY OF TEHRAN', 6.5, 0, color='#2E5F8A', weight='bold')
fig.text(X[4], 0.455, C.CONCEPT['title'], fontsize=14, weight='bold'); fig.text(X[4] + Wc, 0.455, fa(C.CONCEPT['title_fa']), fontsize=13, ha='right', weight='bold', color='#2E86DE')
org = ['North band (park side): auditorium · outdoor court · gateway (café, welfare, assembly hall, admin, presidency)',
       'Faculty Street: shared, shaded spine; every entrance opens onto it',
       'South-east (campus side): sports hall + workshop / lab, service at the street’s east end',
       'South-west (quiet): academic wing + library around the Learning Court',
       'Edges: plane-tree rows kept; acoustic berm on Keshavarz; west garden as buffer']
yy = 0.425
for o in org:
    fig.text(X[4], yy, '•', fontsize=8, color='#2E86DE', va='top'); fig.text(X[4] + 0.01, yy, '\n'.join(textwrap.wrap(o, 46)), fontsize=7, va='top', linespacing=1.35); yy -= 0.012 * (len(textwrap.wrap(o, 46))) + 0.016
fig.savefig(os.path.join(D.OUT, 'Sheet02_Concept_Inference.png'), dpi=170, facecolor=PAPER); out_png.append(fig)

# ================================================================ 03 ALTERNATIVES
fig = sheet(3, 'THREE CONCEPT ALTERNATIVES', 'سه گزینه‌ی ایده', 'Each tested on the real boundary · scores 1–5 against the seven studio criteria · selected: A')
ALT_GEOM = {
    'B': [('Sports', [(32, 14), (88, 14), (88, 48), (32, 48)], 'SPORTS HALL'), ('Assembly', [(18, 88), (100, 88), (100, 106), (18, 106)], 'AUDITORIUM · ASSEMBLY · ADMIN'),
          ('Academic', [(16, 22), (30, 22), (30, 88), (16, 88)], 'ACADEMIC'), ('Administration', [(88, 22), (102, 22), (102, 88), (88, 88)], 'ADMIN · CAFÉ')],
    'C': [('Sports', [(32, 16), (100, 16), (100, 56), (32, 56)], 'HALL (sunk −7 m)'), ('Assembly', [(32, 60), (66, 60), (66, 98), (32, 98)], 'AUDITORIUM (sunk)'),
          ('Academic', [(14, 18), (28, 18), (28, 108), (14, 108)], 'ACADEMIC BAR on deck'), ('Administration', [(78, 78), (100, 78), (100, 100), (78, 100)], 'ADMIN PAVILION')],
}
for i, a in enumerate(C.ALTERNATIVES):
    x = 0.025 + i * 0.325
    axp = plan_ax(fig, [x, 0.5, 0.3, 0.38], pad=8, context=True, light=True)
    if a['key'] == 'A':
        opatch(axp, alpha=0.8)
        for b in D.BUILDINGS: bpatch(axp, b, BC[b['id']], alpha=0.9, lw=0.6)
        for path in D.PED['primary']: route(axp, path, PED1, 1.8, (0, (4, 2)))
    else:
        if a['key'] == 'C': axp.add_patch(MPoly(D.xy([(8, 8), (112, 8), (112, 112), (8, 112)]), fc='#BFD7A9', ec='#6F9A57', lw=0.6, alpha=0.75, zorder=6))
        if a['key'] == 'B': axp.add_patch(MPoly(D.xy([(30, 48), (88, 48), (88, 88), (30, 88)]), fc='#BFD7A9', ec='#6F9A57', lw=0.6, zorder=6))
        for grp, poly, lab in ALT_GEOM[a['key']]:
            sunk = 'sunk' in lab
            axp.add_patch(MPoly(D.xy(poly), fc=G[grp] if not sunk else 'none', ec=G[grp] if sunk else INK, lw=1.4 if sunk else 0.6, ls='--' if sunk else '-', alpha=0.9, zorder=10, hatch='///' if sunk else None))
            q = Polygon(poly).centroid; uvtext(axp, q.x, q.y, lab, 5.5, 90 if Polygon(poly).bounds[2] - Polygon(poly).bounds[0] < 16 else 0, color=INK if sunk else 'white', weight='bold')
        if a['key'] == 'B': uvtext(axp, 59, 68, 'CENTRAL COURT', 6, 0, color='#3F6E33', weight='bold'); route(axp, [(116, 62), (102, 62)], RED, 2.0); uvtext(axp, 108, 66, "Zare' link cut", 5, 0, color=RED, weight='bold')
        if a['key'] == 'C': uvtext(axp, 60, 108, 'PUBLIC LANDSCAPE DECK = park continued', 6, 0, color='#3F6E33', weight='bold')
    boundary(axp, 1.0)
    sel = a['key'] == 'A'
    fig.text(x, 0.475, f"{a['key']} · {a['title'].upper()}", fontsize=12, weight='bold', color='#1E5FA8' if sel else INK)
    fig.text(x + 0.3, 0.475, fa(a['fa']), fontsize=11, ha='right', weight='bold', color='#1E5FA8' if sel else INK)
    if sel: fig.text(x + 0.3, 0.885, 'SELECTED', fontsize=9, ha='right', weight='bold', color='white', bbox=dict(fc='#2E86DE', ec='none', pad=3))
    rows = [('Idea', a['idea']), ('Evidence', a['evidence']), ('Placement', a['placement']), ('Organisation', a['organisation']), ('Circulation', a['circulation']),
            ('Built / open', a['open_space']), ('+', a['pros']), ('−', a['cons'])]
    yy = 0.455
    for k_, v_ in rows:
        w = textwrap.wrap(v_, 78)
        fig.text(x, yy, k_, fontsize=6.6, weight='bold', color='#4E9A3E' if k_ == '+' else '#C8504A' if k_ == '−' else MUTE, va='top')
        fig.text(x + 0.05, yy, '\n'.join(w), fontsize=6.6, va='top', linespacing=1.3); yy -= 0.0118 * len(w) + 0.006
# score table
axt = fig.add_axes([0.025, 0.065, 0.66, 0.15]); axt.axis('off'); axt.set_xlim(0, 1); axt.set_ylim(0, 1)
cw = 0.88 / (len(C.CRITERIA) + 1)
axt.text(0, 0.92, 'EVALUATION', fontsize=9, weight='bold', va='top')
for j, c_ in enumerate(C.CRITERIA + ['TOTAL / 35']): axt.text(0.12 + j * cw * 0.98, 0.92, '\n'.join(textwrap.wrap(c_, 12)), fontsize=6.8, weight='bold', va='top')
for i, a in enumerate(C.ALTERNATIVES):
    yy = 0.58 - i * 0.2
    axt.text(0, yy, f"{a['key']} · {a['title']}", fontsize=8, weight='bold', color='#1E5FA8' if a['key'] == 'A' else INK, va='center')
    for j, s_ in enumerate(a['scores']):
        for k in range(5): axt.add_patch(Rectangle((0.12 + j * cw * 0.98 + k * 0.018, yy - 0.05), 0.015, 0.1, fc='#2E86DE' if k < s_ else '#E4E1DA', ec='none'))
    axt.text(0.12 + len(C.CRITERIA) * cw * 0.98, yy, str(sum(a['scores'])), fontsize=12, weight='bold', va='center', color='#1E5FA8' if a['key'] == 'A' else INK)
fig.text(0.71, 0.205, 'Why A: it is the only option that keeps the park–campus pedestrian link public (F1, F2), puts each use on the edge whose character fits it (F4–F6) and keeps every '
         'existing tree row (F7) at a low technical risk. B closes the link and builds against the west residents; C scores highest on landscape but depends on deep excavation and long '
         'buried spans that cannot be justified at this stage.', fontsize=7.4, ha='left', va='top', color=INK, linespacing=1.5)
fig.texts[-1].set_text('\n'.join(textwrap.wrap(fig.texts[-1].get_text(), 72)))
fig.savefig(os.path.join(D.OUT, 'Sheet03_Alternatives.png'), dpi=170, facecolor=PAPER); out_png.append(fig)

# ================================================================ 04 RELATIONSHIPS
fig = sheet(4, 'FUNCTIONAL RELATIONSHIPS', 'ماتریس و دیاگرام ارتباطات', 'Hypotheses tested on the plan: the matrix, the bubble diagram and the site plan describe the same arrangement')
keys = [k for k in ['SH', 'WL', 'CL', 'LB', 'ST', 'AU', 'AS', 'CF', 'RW', 'AD', 'PR', 'WC']]
axm = fig.add_axes([0.025, 0.08, 0.45, 0.8]); axm.axis('off'); n = len(keys); axm.set_xlim(-6.5, n + 0.5); axm.set_ylim(-4.2, n + 1.2)
RC = {'S': '#1E5FA8', 'M': '#9CC3EA', 'W': '#F1EFEA', 'R': '#C8282E', '?': '#BDBDBD'}
for i, a in enumerate(keys):
    yy = n - 1 - i
    axm.add_patch(Rectangle((-6.4, yy + 0.08), 0.32, 0.84, fc=KEYCOL[a], ec='none'))
    axm.text(-5.95, yy + 0.5, f"{a}  {D.P[a]['en'].split(' (')[0].split(' —')[0][:30]}", fontsize=7, va='center')
    axm.text(-0.12, yy + 0.5, f"{D.P[a]['gross']:,}", fontsize=6.3, va='center', ha='right', color=MUTE)
    for j, b in enumerate(keys):
        if j <= i: continue
        r = rel(a, b) if False else C.rel(a, b)
        axm.add_patch(Rectangle((j - 0.0, yy), 0.94, 0.94, fc=RC[r], ec='white', lw=0.6))
        axm.text(j + 0.47, yy + 0.47, r, fontsize=7, ha='center', va='center', color='white' if r in 'SR' else INK, weight='bold')
for j, b in enumerate(keys): axm.text(j + 0.47, n + 0.1, b, fontsize=7.5, ha='center', va='bottom', weight='bold', rotation=0)
yy = -0.9
for k_, t_ in C.REL_NOTES.items():
    axm.add_patch(Rectangle((-6.4, yy - 0.35), 0.7, 0.7, fc=RC[k_], ec='white')); axm.text(-6.05, yy, k_, fontsize=7, ha='center', va='center', color='white' if k_ in 'SR' else INK, weight='bold')
    axm.text(-5.4, yy, t_, fontsize=7, va='center'); yy -= 0.75
axm.text(-6.4, n + 0.9, 'RELATIONSHIP MATRIX  (gross m² at left)', fontsize=10, weight='bold')
# bubble diagram — positions follow the plan (schematic, not to scale)
axb = fig.add_axes([0.5, 0.08, 0.475, 0.8]); axb.set_aspect('equal'); axb.axis('off'); axb.set_xlim(-6, 126); axb.set_ylim(-14, 134)
POS = {'SH': (72, 38), 'WL': (42, 24), 'CL': (22, 40), 'LB': (24, 60), 'ST': (12, 24), 'AU': (42, 88), 'AS': (88, 96), 'CF': (98, 76), 'RW': (112, 82),
       'AD': (82, 114), 'PR': (106, 114), 'WC': (54, 64)}
axb.add_patch(Rectangle((0, 56), 120, 12, fc='#F3EAD6', ec='none')); axb.text(60, 62, 'FACULTY STREET', ha='center', va='center', fontsize=9, color='#A38A5A', weight='bold')
axb.text(60, 124, 'LALEH PARK ↑  (noisy Keshavarz edge)', ha='center', fontsize=8, color='#4E9A3E', weight='bold'); axb.text(60, -12, 'UNIVERSITY OF TEHRAN ↓', ha='center', fontsize=8, color='#2E5F8A', weight='bold')
axb.text(-4, 30, 'quiet west', rotation=90, fontsize=8, color=MUTE, va='center'); axb.text(124, 40, 'Jalalieh · service', rotation=90, fontsize=8, color=MUTE, va='center')
WCP = [(10, 50), (30, 80), (106, 66)]   # toilets as placed: academic wing GF, auditorium L1, gateway GF
def ppos(k, other=None):
    if k != 'WC': return POS[k]
    o = POS[other] if other else (60, 60); return min(WCP, key=lambda q: (q[0] - o[0]) ** 2 + (q[1] - o[1]) ** 2)
for i, a in enumerate(keys):
    for b in keys[i + 1:]:
        r = C.rel(a, b)
        if r in ('S', 'M', 'R'):
            (x1, y1), (x2, y2) = ppos(a, b), ppos(b, a)
            axb.plot([x1, x2], [y1, y2], color=RC[r] if r != 'M' else '#9CC3EA', lw={'S': 3.0, 'M': 0.7, 'R': 2.2}[r], ls='--' if r == 'R' else '-', zorder=1, alpha=0.95 if r != 'M' else 0.55)
for a in keys:
    pts = WCP if a == 'WC' else [POS[a]]
    for (x, y) in pts:
        r = math.sqrt(D.P[a]['gross'] / (3 if a == 'WC' else 1)) * 0.24
        axb.add_patch(Circle((x, y), r, fc=KEYCOL[a], ec='white', lw=1.4, alpha=0.95, zorder=3, ls='--' if a == 'ST' else '-'))
        axb.text(x, y, a, ha='center', va='center', fontsize=8.5 if r > 6 else 6, weight='bold', color='white', zorder=4)
        axb.text(x, y - r - 1.4, D.P[a]['en'].split(' (')[0].split(' —')[0][:24] + (f"  {D.P[a]['gross']:,}" if a != 'WC' else ' (⅓ each)'), ha='center', va='top', fontsize=5.8, zorder=4)
for (x, y, s) in [(72, 20, 'B1 hall'), (42, 74, 'B4'), (122, 104, 'B5 gateway\n(3 levels)'), (22, 26, 'B3')]:
    axb.text(x, y, s, fontsize=6, color=MUTE, ha='center', style='italic')
axb.text(-6, 134, 'BUBBLE DIAGRAM  (area ∝ gross · lines = S / M / R)', fontsize=10, weight='bold', va='top')
fig.savefig(os.path.join(D.OUT, 'Sheet04_Relationships.png'), dpi=170, facecolor=PAPER); out_png.append(fig)

# ================================================================ 05 ZONING + CIRCULATION
fig = sheet(5, 'ZONING  ·  CIRCULATION', 'پهنه‌بندی و گردش', 'Access levels and noise (left) · movement system, gates and service (right) — both on the real boundary')
axz = plan_ax(fig, [0.02, 0.07, 0.47, 0.83], pad=14, light=True)
ACC = {'public': '#E9C46A', 'semi': '#F4A261', 'academic': '#5FA8E6', 'controlled': '#8E6CC8'}
for oid, name, poly, kind in D.OPEN:
    g = D.open_poly(poly); c_ = ACC['public'] if kind in ('plaza', 'street', 'court', 'walk') else '#CFE2BC'
    for gg in ([g] if g.geom_type == 'Polygon' else g.geoms): axz.add_patch(MPoly(np.array(gg.exterior.coords), fc=c_, ec='white', lw=0.5, alpha=0.75, zorder=5))
ZB = {'B1': 'semi', 'B2': 'academic', 'B3': 'academic', 'B4': 'semi', 'B5': 'controlled'}
for b in D.BUILDINGS: bpatch(axz, b, ACC[ZB[b['id']]], lw=0.8)
axz.add_patch(MPoly(D.xy([(76.5, 72), (100.5, 72), (100.5, 80), (76.5, 80)]), fc=ACC['public'], ec=INK, lw=0.5, zorder=11, hatch='...'))
uvtext(axz, 88.5, 76, 'GF café (public)', 5.8, 0, color=INK, bbox=dict(fc='white', ec='none', alpha=0.85, pad=1)); uvtext(axz, 88.5, 88, 'L1 assembly\nL2 admin + presidency\n(controlled)', 5.8, 0, color='white', weight='bold')
for b in D.BUILDINGS:
    if b['id'] == 'B5': continue
    u, v, r = LBL[b['id']]; uvtext(axz, u, v, names_short(b), 6.5, r, color='white' if b['id'] != 'B2' else INK, weight='bold')
for (u, v, s, col) in [(60, 117, '◀ LOUD — Keshavarz traffic, sirens', '#C8282E'), (66, 89, 'LOUD\n(court)', '#C8282E'), (72, 33, 'LOUD inside —\nacoustic shell', '#C8282E'),
                       (24, 28, 'QUIET', '#1E5FA8'), (19, 92, 'QUIET\ngarden', '#1E5FA8'), (39, 46, 'QUIET', '#1E5FA8')]:
    uvtext(axz, u, v, s, 6, 0, color=col, weight='bold', bbox=dict(fc='white', ec='none', alpha=0.7, pad=1))
boundary(axz, 1.2)
(x0, x1), (y0, y1) = axz.get_xlim(), axz.get_ylim()
north(axz, x1 - 10, y1 - 16, 8); scalebar(axz, x0 + 6, y0 + 6, 40, 10)
yy = 0.86
for name, col in [('Public', ACC['public']), ('Semi-public (hall, auditorium)', ACC['semi']), ('Academic (students, staff)', ACC['academic']),
                  ('Controlled (assembly, admin, presidency)', ACC['controlled']), ('Landscape buffer', '#CFE2BC')]:
    fig.add_artist(Rectangle((0.03, yy - 0.006), 0.014, 0.014, transform=fig.transFigure, fc=col, ec=INK, lw=0.4)); fig.text(0.05, yy, name, fontsize=7.2, va='center'); yy -= 0.022
axc = plan_ax(fig, [0.51, 0.07, 0.47, 0.83], pad=14, light=True)
for b in D.BUILDINGS: bpatch(axc, b, '#E5E2DB', ec='#8A867E', lw=0.6)
opatch(axc, ['street', 'plaza'], alpha=0.6)
for path in D.PED['primary']: route(axc, path, PED1, 3.4, arrow=True)
for path in D.PED['secondary']: route(axc, path, PED2, 1.6, (0, (3, 1.5)), arrow=True)
for path in D.EMERGENCY: route(axc, path, EMER, 1.6, (0, (6, 2, 1, 2)))
for path in D.SERVICE: route(axc, path, SERV, 2.4, ':', arrow=True)
axc.add_patch(MPoly(D.xy(D.SERVICE_YARD), fc=SERV, ec=SERV, alpha=0.4, zorder=16))
for u, v, lab, kind in D.ENTRANCES:
    p = D.xy([(u, v)])[0]
    if kind == 'bldg': axc.plot(*p, marker='v', ms=5, color=RED, zorder=22)
    else: axc.plot(*p, marker='o', ms=11 if kind == 'main' else 8, mfc=RED if kind != 'service' else SERV, mec='white', mew=1.4, zorder=23)
for (u, v, s, r) in [(108, 124, 'MAIN · park corner\n(metro 280 m)', 0), (126, 64, 'EAST GATE', 90), (39, -5, 'SOUTH GATE · UT', 0), (-4, 64, 'WEST GATE', 90), (127, 36, 'SERVICE from Poursina', 90)]:
    uvtext(axc, u, v, s, 6.3, r, color=RED if 'SERVICE' not in s else SERV, weight='bold')
for (u, v, s) in [(60, 64.6, 'FACULTY STREET — primary E–W spine'), (82, 106, 'plaza'), (60, 15, 'Poursina walk (secondary)')]:
    uvtext(axc, u, v, s, 6.2, 0, color='#1E5FA8', weight='bold')
for b in D.BUILDINGS:
    u, v, r = LBL[b['id']]; uvtext(axc, u, v, b['id'], 7, 0, color='#6A665E', weight='bold')
boundary(axc, 1.2)
yy = 0.86
for name, col, lw, ls in [('Primary pedestrian route', PED1, 3.4, '-'), ('Secondary pedestrian route', PED2, 1.6, (0, (3, 1.5))), ('Emergency access (bollards)', EMER, 1.6, (0, (6, 2, 1, 2))),
                          ('Service: Jalalieh from Poursina → loading bay', SERV, 2.4, ':')]:
    fig.add_artist(plt.Line2D([0.52, 0.545], [yy] * 2, transform=fig.transFigure, color=col, lw=lw, ls=ls)); fig.text(0.552, yy, name, fontsize=7.2, va='center'); yy -= 0.022
fig.text(0.52, yy, 'No general vehicles on site. Car access to the block is only from one-way Poursina (F3).', fontsize=6.6, color=MUTE, va='center')
fig.savefig(os.path.join(D.OUT, 'Sheet05_Zoning_Circulation.png'), dpi=170, facecolor=PAPER); out_png.append(fig)

# ================================================================ 06 PROGRAM
fig = sheet(6, 'PROGRAM · STACKING · RATIONALE', 'جدول مساحت‌ها و منطق طرح', 'Brief areas unchanged · gross = planning target · ground-floor footprint ≠ gross floor area (levels shown)')
axt = fig.add_axes([0.025, 0.36, 0.55, 0.54]); axt.axis('off'); axt.set_xlim(0, 1); axt.set_ylim(0, 1)
hdr = ['', 'Functional space', 'فضا', 'Net', 'Gross', 'Group', 'Placed in (building · level · m²)']
cx = [0, 0.03, 0.36, 0.44, 0.51, 0.585, 0.7]
for c_, h_ in zip(cx, hdr): axt.text(c_ if h_ != 'فضا' else c_ + 0.06, 0.975, fa(h_) if h_ == 'فضا' else h_, fontsize=7.5, weight='bold', va='top', ha='right' if h_ == 'فضا' else 'left')
axt.plot([0, 1], [0.94, 0.94], color=INK, lw=0.8)
yy = 0.905
for k, p in D.P.items():
    axt.add_patch(Rectangle((0, yy - 0.018), 0.018, 0.036, fc=KEYCOL[k], ec='none'))
    axt.text(cx[1], yy, p['en'], fontsize=7.2, va='center'); axt.text(cx[2] + 0.06, yy, fa(p['fa']), fontsize=7.2, va='center', ha='right')
    axt.text(cx[3] + 0.045, yy, f"{p['net']:,}", fontsize=7.2, va='center', ha='right'); axt.text(cx[4] + 0.05, yy, f"{p['gross']:,}", fontsize=7.2, va='center', ha='right', weight='bold')
    axt.text(cx[5], yy, p['group'], fontsize=6.8, va='center', color=MUTE)
    axt.text(cx[6], yy, ' · '.join(D.where(k)), fontsize=6.5, va='center')
    axt.plot([0, 1], [yy - 0.03] * 2, color=LINE, lw=0.4); yy -= 0.062
net, gross = D.totals()
axt.plot([0, 1], [yy + 0.03] * 2, color=INK, lw=0.8)
axt.text(cx[1], yy, 'TOTAL (12 items)', fontsize=8, weight='bold', va='center'); axt.text(cx[3] + 0.045, yy, f'{net:,}', fontsize=8, weight='bold', va='center', ha='right')
axt.text(cx[4] + 0.05, yy, f'{gross:,}', fontsize=8, weight='bold', va='center', ha='right'); axt.text(cx[6], yy, f'gross / net = {gross / net:.3f}', fontsize=7, va='center', color=MUTE)
# group shares
axg = fig.add_axes([0.025, 0.07, 0.55, 0.24]); axg.axis('off'); axg.set_xlim(0, 1); axg.set_ylim(0, 1)
axg.text(0, 0.98, 'FUNCTIONAL GROUPS — share of the total gross area', fontsize=9, weight='bold', va='top')
gt = D.group_totals(); x = 0
for gname in D.GROUPS:
    w = gt[gname]['gross'] / gross
    axg.add_patch(Rectangle((x, 0.62), w, 0.18, fc=G[gname], ec='white', lw=1))
    if w > 0.05: axg.text(x + w / 2, 0.71, f'{w * 100:.1f} %', ha='center', va='center', fontsize=7.5, color='white', weight='bold')
    x += w
yy = 0.5
for i, gname in enumerate(D.GROUPS):
    cxx = (i % 4) * 0.25; ry = yy - (i // 4) * 0.22
    axg.add_patch(Rectangle((cxx, ry - 0.05), 0.02, 0.1, fc=G[gname], ec='none'))
    axg.text(cxx + 0.03, ry, f"{gname}  net {gt[gname]['net']:,} · gross {gt[gname]['gross']:,} ({gt[gname]['gross'] / gross * 100:.1f} %)", fontsize=6.6, va='center')
# stacking diagram
axs = fig.add_axes([0.61, 0.5, 0.365, 0.4]); axs.axis('off'); axs.set_xlim(0, 1); axs.set_ylim(0, 1)
axs.text(0, 0.99, 'STACKING — floors drawn to scale of area (bar = footprint)', fontsize=9, weight='bold', va='top')
maxA = max(D.floor_area(b) for b in D.BUILDINGS); yb = 0.86
for b in D.BUILDINGS:
    A = D.floor_area(b)
    axs.text(0, yb + 0.005, f"{b['id']} {b['name']}", fontsize=7, weight='bold', va='bottom')
    axs.text(1, yb + 0.005, f"footprint {A:,.0f} · gross {gross_of(b):,}", fontsize=6.5, va='bottom', ha='right', color=MUTE)
    for i, fl in enumerate(b['floors']):
        y_ = yb - 0.035 * (i + 1); x_ = 0.06
        axs.text(0.0, y_ + 0.014, ('GF', 'L1', 'L2', 'L3')[i], fontsize=6.3, va='center', color=MUTE)
        axs.add_patch(Rectangle((x_, y_), 0.94 * A / maxA, 0.028, fc='none', ec='#B9B5AC', lw=0.5))
        for k, a in fl:
            w = 0.94 * a / maxA; axs.add_patch(Rectangle((x_, y_), w, 0.028, fc=KEYCOL[k], ec='white', lw=0.6))
            if w > 0.05: axs.text(x_ + w / 2, y_ + 0.014, f'{k} {a}', fontsize=5.6, ha='center', va='center', color='white')
            x_ += w
    yb -= 0.035 * (len(b['floors']) + 1) + 0.03
# rationale + assumptions
axr = fig.add_axes([0.61, 0.07, 0.365, 0.4]); axr.axis('off'); axr.set_xlim(0, 1); axr.set_ylim(0, 1)
axr.text(0, 1, 'DESIGN RATIONALE', fontsize=9, weight='bold', va='top')
RAT = ["The block is the only pedestrian passage between Laleh Park and the campus (F1, F2). Turning the Zare' lane into the Faculty Street keeps that passage public and gives every building one shared address.",
       'Each use goes to the edge whose character fits it: events and the gateway to the busy park side (F4), the long-span hall to the institutional south-east (F6), learning to the quiet west (F5).',
       'The program needs only ≈31 % ground coverage on 1–3 levels, so all three plane-tree edges are kept (F7) and the courts can be oriented for winter sun and summer shade (F9–F10).',
       'The hall sits at the low south edge, sunk ≈1.5 m (F8), so its ≈12 m volume reads lower than the 3–8-storey context.']
yy = 0.92
for r_ in RAT:
    w = textwrap.wrap(r_, 92); axr.text(0, yy, '\n'.join(w), fontsize=6.7, va='top', linespacing=1.35); yy -= 0.043 * len(w) + 0.03
axr.text(0, yy - 0.01, 'ASSUMPTIONS · UNRESOLVED', fontsize=9, weight='bold', va='top', color='#C8282E'); yy -= 0.07
for a_ in ['Brief item "Site" (66 / 89 m²): function unknown — reserved in the academic wing GF, not reinterpreted.',
           'Boundary from the road edges marked by the user; lane ownership (Hedayati, Enayat) to verify.',
           'Levels: DXF contours (≈5 m fall) vs SRTM (≈3 m) — topographic survey needed.',
           'No FAR / coverage / height limit supplied; none assumed. No on-site parking provided.']:
    axr.text(0, yy, '• ' + a_, fontsize=6.6, va='top'); yy -= 0.055
fig.savefig(os.path.join(D.OUT, 'Sheet06_Program_Rationale.png'), dpi=170, facecolor=PAPER); out_png.append(fig)

with PdfPages(os.path.join(D.OUT, 'PE_Faculty_Concept_Sheets.pdf')) as pdf:
    for f in out_png: pdf.savefig(f, facecolor=PAPER)
print('sheets', len(out_png))
