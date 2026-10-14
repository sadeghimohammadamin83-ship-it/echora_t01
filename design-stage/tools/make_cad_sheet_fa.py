"""یک شیت با ظاهر «خروجی پلات اتوکد»: سفید، خطی، ضخامت‌خط استاندارد، هاشور ساده، کادر و جدول مشخصات — همه با فونت فارسی.
کاغذ A2 افقی، مقیاس واقعی ۱:۵۰۰ (هر متر = ۲ میلی‌متر). خروجی: output/PE_Faculty_SitePlan_CAD_FA.pdf"""
import os, sys, math, glob, textwrap
import numpy as np
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.patches import Polygon as MPoly, Circle, Rectangle
from shapely.geometry import Polygon, box, LineString
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import design as D

for f in glob.glob(os.path.expanduser('~/.fonts/Vazirmatn-*.ttf')): fm.fontManager.addfont(f)
plt.rcParams.update({'font.family': ['Vazirmatn', 'DejaVu Sans'], 'hatch.linewidth': 0.35, 'pdf.fonttype': 42})
MM = 1 / 25.4
PT = 72 / 25.4                               # points per mm  (lineweight mm → pt)
def lw(mm): return mm * PT
def fs(mm): return mm * PT / 0.72            # text height (cap height ≈ 0.72 em) mm → font size pt
FD = str.maketrans('0123456789,.', '۰۱۲۳۴۵۶۷۸۹٬٫')
def n(x): return (f'{x:,}' if isinstance(x, int) else f'{x:,.1f}').translate(FD)

PW, PH = 594, 420                            # A2 landscape, mm
SCALE = 500                                  # 1:500 → 1 m = 2 mm
BLACK, GREY, LGREY, RED, BLUE, ORANGE, GREEN = '#000000', '#5A5A5A', '#9A9A9A', '#E00000', '#1F4FD8', '#C87800', '#3C7A2E'

fig = plt.figure(figsize=(PW * MM, PH * MM), facecolor='white')
paper = fig.add_axes([0, 0, 1, 1]); paper.set_xlim(0, PW); paper.set_ylim(0, PH); paper.axis('off')

# ---------------------------------------------------------------- frame + title strip
paper.add_patch(Rectangle((10, 10), PW - 20, PH - 20, fill=False, lw=lw(0.7), ec=BLACK))
TB_X = PW - 10 - 125                          # right strip (title block), 125 mm wide
paper.plot([TB_X, TB_X], [10, PH - 10], color=BLACK, lw=lw(0.5))

# ---------------------------------------------------------------- viewport at true 1:500
VX0, VY0, VX1, VY1 = 16, 16, TB_X - 6, PH - 16
k = 1000 / SCALE                              # mm per metre
cx, cy = Polygon(D.site_xy()).centroid.coords[0]
cx += 4
wm, hm = (VX1 - VX0) / k, (VY1 - VY0) / k
ax = fig.add_axes([VX0 / PW, VY0 / PH, (VX1 - VX0) / PW, (VY1 - VY0) / PH])
ax.set_xlim(cx - wm / 2, cx + wm / 2); ax.set_ylim(cy - hm / 2, cy + hm / 2); ax.set_aspect('equal'); ax.axis('off')
W = box(cx - wm / 2, cy - hm / 2, cx + wm / 2, cy + hm / 2)
src = D.source().modelspace(); site = Polygon(D.site_xy())
DEG = math.degrees(D.TH)


def P(e): return np.array([p[:2] for p in e.get_points('xy')] + ([e.get_points('xy')[0][:2]] if e.closed else []))


# existing survey (from the DXF) — thin, grey, as plotted
for e in src.query('LWPOLYLINE[layer=="TPX_ROADS_CONTOURS"]'): ax.plot(*P(e).T, color=GREY, lw=lw(0.18))
for e in src.query('LWPOLYLINE[layer=="TPX_ROADS_AXES"]'): ax.plot(*P(e).T, color=LGREY, lw=lw(0.09), ls=(0, (12, 3, 2, 3)))
for e in src.query('LWPOLYLINE[layer=="TPX_BUILDINGS"]'):
    g = Polygon([p[:2] for p in e.get_points('xy')])
    if g.intersects(W) and not g.intersects(site): ax.add_patch(MPoly(np.array(g.exterior.coords), fill=False, ec=BLACK, lw=lw(0.25)))
for t in src.query('TEXT[layer=="TPX_BUILDING_HEIGHTS_TEXT"]'):
    p = t.dxf.insert
    if W.contains(Polygon([(p.x, p.y), (p.x + .1, p.y), (p.x, p.y + .1)])) and not site.buffer(2).contains(Polygon([(p.x, p.y), (p.x + .1, p.y), (p.x, p.y + .1)])):
        ax.text(p.x, p.y, 'ارتفاع ' + t.dxf.text.replace('H ', '').replace(' m', '').translate(FD) + ' م', fontsize=fs(1.4), color=GREY, ha='center', va='center')
for x, y, r in D.trees():
    if W.buffer(10).contains(Polygon([(x, y), (x + .1, y), (x, y + .1)])):
        ax.add_patch(Circle((x, y), r, fill=False, ec=GREEN, lw=lw(0.13))); ax.plot([x], [y], marker='+', ms=2, color=GREEN, mew=lw(0.13))
for e in src.query('LWPOLYLINE[layer=="TPX_CONTOUR_LINES_5M"]'): ax.plot(*P(e).T, color='#8B5A2B', lw=lw(0.18), ls=(0, (6, 3)))
for t in src.query('TEXT[layer=="TPX_CONTOUR_LINES_5M_TEXT"]'):
    p = t.dxf.insert; ax.text(p.x, p.y, '+' + t.dxf.text.replace('.0', '').translate(FD), fontsize=fs(1.8), color='#8B5A2B', ha='center', va='center', bbox=dict(fc='white', ec='none', pad=0.5))

# existing building to remove
for e in src.query('LWPOLYLINE[layer=="TPX_BUILDINGS"]'):
    g = Polygon([p[:2] for p in e.get_points('xy')])
    if g.intersects(site):
        ax.add_patch(MPoly(np.array(g.exterior.coords), fill=False, ec=GREY, lw=lw(0.18), ls=(0, (3, 2)))); b = g.bounds
        ax.plot([b[0], b[2]], [b[1], b[3]], color=GREY, lw=lw(0.13)); ax.plot([b[0], b[2]], [b[3], b[1]], color=GREY, lw=lw(0.13))

# ---------------------------------------------------------------- proposal
def uvtext(u, v, s, h_mm, rot=0, **kw):
    q = D.xy([(u, v)])[0]; ax.text(q[0], q[1], s, fontsize=fs(h_mm), rotation=DEG + rot, rotation_mode='anchor', ha='center', va='center', **kw)


for oid, name, poly, kind in D.OPEN:                       # open spaces: thin outline
    g = D.open_poly(poly)
    for gg in ([g] if g.geom_type == 'Polygon' else g.geoms): ax.add_patch(MPoly(np.array(gg.exterior.coords), fill=False, ec=GREEN if kind in ('buffer', 'garden') else GREY, lw=lw(0.18)))
# Faculty Street paving hatch (dots) and canopy
fs_poly = D.open_poly(D.OPEN[1][2])
ax.add_patch(MPoly(np.array(fs_poly.exterior.coords), fill=False, ec=LGREY, lw=0, hatch='..'))
ax.add_patch(MPoly(D.xy([(18, 59.2), (97.5, 59.2), (97.5, 62.6), (18, 62.6)]), fill=False, ec=GREY, lw=lw(0.18), ls=(0, (4, 2))))
for u in np.arange(20, 97, 6): ax.add_patch(Circle(D.xy([(u, 62.2)])[0], 0.25, fc=BLACK, ec='none'))
# court markings
cu, cv = 66.0, 89.0
ax.add_patch(MPoly(D.xy([(cu - 7.5, cv - 14), (cu + 7.5, cv - 14), (cu + 7.5, cv + 14), (cu - 7.5, cv + 14)]), fill=False, ec=BLACK, lw=lw(0.25)))
ax.plot(*D.xy([(cu - 7.5, cv), (cu + 7.5, cv)]).T, color=BLACK, lw=lw(0.18)); ax.add_patch(Circle(D.xy([(cu, cv)])[0], 1.8, fill=False, ec=BLACK, lw=lw(0.18)))
# berm
ax.plot(*D.xy([(12, 115), (40, 116.5), (70, 112.5), (82, 111)]).T, color=GREEN, lw=lw(0.35), ls=(0, (8, 2)))
# proposed trees: circle + cross (CAD symbol)
for u, v in [(u, 66.2) for u in range(16, 56, 8)] + [(15, 76), (22, 72), (14, 90), (22, 100), (36, 41), (36, 52), (42, 55), (104, 92), (110, 84)]:
    q = D.xy([(u, v)])[0]; ax.add_patch(Circle(q, 2.6, fill=False, ec=GREEN, lw=lw(0.25)))
    ax.plot([q[0] - 1.2, q[0] + 1.2], [q[1], q[1]], color=GREEN, lw=lw(0.13)); ax.plot([q[0], q[0]], [q[1] - 1.2, q[1] + 1.2], color=GREEN, lw=lw(0.13))
# buildings: heavy outline + ANSI31-like hatch
for b in D.BUILDINGS:
    Q = D.xy(b['poly'])
    ax.add_patch(MPoly(Q, fill=True, fc='white', ec='none', zorder=5))
    ax.add_patch(MPoly(Q, fill=False, ec=LGREY, lw=0, hatch='////', zorder=6))
    ax.add_patch(MPoly(Q, fill=False, ec=BLACK, lw=lw(0.6), zorder=7))
# hall playing floor / auditorium stage (thin)
ax.add_patch(MPoly(D.xy([(51, 23), (93, 23), (93, 49), (51, 49)]), fill=False, ec=BLACK, lw=lw(0.13), ls=(0, (5, 2)), zorder=8))
ax.plot(*D.xy([(46.5, 51.2), (97.5, 51.2)]).T, color=BLACK, lw=lw(0.13), zorder=8)
ax.add_patch(MPoly(D.xy([(31, 90), (53, 90), (53, 99.5), (31, 99.5)]), fill=False, ec=BLACK, lw=lw(0.13), zorder=8))
for kk in range(5): ax.plot(*D.xy([(31 + kk * .8, 74 + kk * 3.2), (53 - kk * .8, 74 + kk * 3.2)]).T, color=BLACK, lw=lw(0.13), zorder=8)
# building labels (white box behind, like a masked MTEXT)
FA = {'B1': ('سالن ورزشی چندمنظوره', 'زیربنا ۳٬۲۲۹ م² · ۳ سطح · کف سالن ۱٫۵- '), 'B2': ('کارگاه و آزمایشگاه', '۲۱۶ م² · ۱ طبقه'),
      'B3': ('بال آموزشی و کتابخانه', 'زیربنا ۱٬۵۵۲ م² · ۳ طبقه'), 'B4': ('آمفی‌تئاتر', 'زیربنا ۱٬۲۰۶ م² · ۲ طبقه'),
      'B5': ('ساختمان ورودی', 'زیربنا ۱٬۶۶۱ م² · ۳ طبقه')}
SUB = {'B1': 'همکف: سالن و رختکن · طبقه‌ی اول: سکوی تماشاگران', 'B3': 'همکف: کتابخانه، «سایت»، سرویس · طبقات: کلاس‌ها',
       'B4': 'سالن ۹۶۰ م² · طبقه‌ی اول: اتاق فنی و سرویس', 'B5': 'همکف: بوفه و رفاهی · اول: سالن اجتماعات · دوم: اداری و ریاست'}
LBL = {'B1': (72, 37, 0, 3.5), 'B2': (39.25, 29.5, 0, 1.8), 'B3': (25, 40.6, 90, 2.6), 'B4': (42, 82, 0, 3.0), 'B5': (88.5, 84.8, 0, 2.6)}
for b in D.BUILDINGS:
    u, v, r, h = LBL[b['id']]; t1, t2 = FA[b['id']]
    off = (lambda d: (u - d, v)) if r == 90 else (lambda d: (u, v + d))
    box_ = dict(fc='white', ec='none', pad=1.2)
    uvtext(*off(h * 0.9), t1, h, r, color=BLACK, weight='bold', bbox=box_, zorder=9)
    uvtext(*off(-h * 0.35), t2, h * 0.62, r, color=BLACK, bbox=box_, zorder=9)
    if b['id'] in SUB: uvtext(*off(-h * 1.15), SUB[b['id']], h * 0.5, r, color=GREY, bbox=box_, zorder=9)
uvtext(72, 25.2, 'زمین بازی ۴۲×۲۶', 1.6, 0, color=GREY, bbox=dict(fc='white', ec='none', pad=0.6), zorder=9)
uvtext(42, 94.8, 'سن', 1.8, 0, color=BLACK, bbox=dict(fc='white', ec='none', pad=0.6), zorder=9)
OPEN_FA = {'O1': (101, 110, 0, 'میدان ورودی'), 'O2': (64, 65.2, 0, 'خیابانِ دانشکده (کوچه‌ی زارع سابق) — پیاده'), 'O3': (66, 100.6, 0, 'زمین روباز ۱۵×۲۸'),
           'O4': (39.2, 47, 90, 'حیاط آموزشی'), 'O5': (19, 86, 90, 'باغ غربی'), 'O6': (40, 113.2, -4, 'باغ لبه‌ی پارک · خاکریز سبز'),
           'O7': (72, 15.5, 0, 'پیاده‌راه چنارهای پورسینا'), 'O8': (106.5, 33, 90, 'لبه‌ی جلالیه'), 'O9': (109, 80, 90, 'تراس بوفه')}
for k_, (u, v, r, s) in OPEN_FA.items(): uvtext(u, v, s, 2.0, r, color=BLACK, bbox=dict(fc='white', ec='none', pad=0.5), zorder=9)
# circulation
for p in D.PED['primary']: ax.plot(*D.xy(p).T, color=BLUE, lw=lw(0.35), ls=(0, (6, 3)), zorder=8)
for p in D.PED['secondary']: ax.plot(*D.xy(p).T, color=BLUE, lw=lw(0.18), ls=(0, (3, 2)), zorder=8)
for p in D.EMERGENCY: ax.plot(*D.xy(p).T, color=ORANGE, lw=lw(0.25), ls=(0, (10, 3, 2, 3)), zorder=8)
for p in D.SERVICE: ax.plot(*D.xy(p).T, color=ORANGE, lw=lw(0.35), ls=(0, (1, 2)), zorder=8)
ax.add_patch(MPoly(D.xy(D.SERVICE_YARD), fill=False, ec=ORANGE, lw=lw(0.25), zorder=8))
# entrances (filled triangles)
DIRS = {'MAIN': -2.3, 'EAST': math.pi, 'WEST': 0.0, 'SOUTH': math.pi / 2, 'SERVICE': math.pi}
for u, v, lab, kind in D.ENTRANCES:
    a = 0 if kind == 'bldg' else DIRS.get(lab.split(' ')[0], 0); s_ = 1.2 if kind == 'bldg' else 2.6
    pts = [(u + s_ * math.cos(a), v + s_ * math.sin(a)), (u + s_ * .6 * math.cos(a + 2.4), v + s_ * .6 * math.sin(a + 2.4)), (u + s_ * .6 * math.cos(a - 2.4), v + s_ * .6 * math.sin(a - 2.4))]
    ax.add_patch(MPoly(D.xy(pts), fc=RED if kind != 'service' else ORANGE, ec='none', zorder=10))
for (u, v, s, r) in [(104, 123.5, 'ورودی اصلی', 0), (124, 64, 'ورودی شرقی', 90), (39, -4.5, 'ورودی جنوبی', 0), (1.0, 71, 'ورودی غربی', 0), (124, 40, 'سرویس (از پورسینا)', 90)]:
    uvtext(u, v, s, 2.2, r, color=RED if 'سرویس' not in s else ORANGE, weight='bold', bbox=dict(fc='white', ec='none', pad=0.5), zorder=10)
# boundary
B = np.array(D.site_xy() + [D.site_xy()[0]]); ax.plot(*B.T, color=RED, lw=lw(0.5), ls=(0, (14, 3, 2, 3)), zorder=11)
uvtext(30, 131.5, 'محدوده‌ی سایت — مساحت ۱۳٬۸۴۶ م²', 2.2, -4, color=RED, zorder=11)
# street names
for (u, v, s, r) in [(40, 141, 'بلوار کشاورز', -6), (60, -11, 'خیابان پورسینا (یک‌طرفه)', 0), (127.5, 85, 'کوچه‌ی جلالیه', 90), (-5.5, 100, 'کوچه‌ی هدایتی', 96), (-5.0, 22, 'کوچه‌ی عنایت', 90)]:
    uvtext(u, v, s, 3.0, r, color=BLACK, bbox=dict(fc='white', ec='none', pad=0.5), zorder=10)
q = np.array([cx - wm / 2 + 30, cy + hm / 2 - 12]); ax.text(*q, 'بوستان لاله', fontsize=fs(4), color=GREY, ha='center')
q = np.array([cx + wm / 2 - 50, cy - hm / 2 + 8]); ax.text(*q, 'پردیس مرکزی دانشگاه تهران', fontsize=fs(4), color=GREY, ha='center')


# dimensions (architectural ticks)
def dim(a, b, off, txt=None):
    A, Bp = np.array(D.xy([a])[0]), np.array(D.xy([b])[0]); d = Bp - A; L = np.linalg.norm(d); t = d / L; nrm = np.array([-t[1], t[0]])
    A2, B2 = A + nrm * off, Bp + nrm * off
    for p0, p1 in [(A, A2), (Bp, B2)]: ax.plot(*np.c_[p0 + nrm * np.sign(off) * 0.8, p1 + nrm * np.sign(off) * 1.0], color=BLACK, lw=lw(0.13), zorder=12)
    ax.plot(*np.c_[A2 - t * 1.2, B2 + t * 1.2], color=BLACK, lw=lw(0.13), zorder=12)
    for p in (A2, B2): ax.plot(*np.c_[p - (t + nrm) * 0.7, p + (t + nrm) * 0.7], color=BLACK, lw=lw(0.35), zorder=12)
    m = (A2 + B2) / 2 + nrm * 1.1; ang = math.degrees(math.atan2(t[1], t[0]))
    if ang > 90: ang -= 180
    if ang < -90: ang += 180
    ax.text(*m, txt or n(round(L, 1)), fontsize=fs(1.8), rotation=ang, rotation_mode='anchor', ha='center', va='center', zorder=12)


dim((46.5, 20.0), (97.5, 20.0), -2.6); dim((97.5, 20.0), (97.5, 59.2), -2.6)
dim((18.0, 22.0), (32.0, 22.0), -2.6); dim((18.0, 22.0), (18.0, 59.2), 2.4)
dim((28.0, 102.3), (56.0, 102.3), 2.2); dim((28.0, 68.0), (28.0, 102.3), 2.4)
dim((76.5, 97.7), (100.5, 97.7), 2.2); dim((100.5, 72.0), (100.5, 97.7), -2.2)
dim((0.0, 0.0), (114.0, 0.1), -7.0); dim((114.0, 0.1), (115.0, 56.5), -9.0)
dim((57.0, 105.0), (75.0, 105.0), 1.8)

# ---------------------------------------------------------------- title strip (right), RTL
X1 = PW - 14                                    # right edge of text inside strip
def T(x, y, s, h, **kw): paper.text(x, y, s, fontsize=fs(h), ha=kw.pop('ha', 'right'), va=kw.pop('va', 'center'), **kw)
def HL(y, w=lw(0.25)): paper.plot([TB_X, PW - 10], [y, y], color=BLACK, lw=w)

# north arrow + scale
na = (TB_X + 30, PH - 42)
paper.add_patch(Circle(na, 13, fill=False, ec=BLACK, lw=lw(0.25)))
paper.add_patch(MPoly([(na[0], na[1] + 13), (na[0] + 4.5, na[1] - 6), (na[0], na[1] - 2)], fc=BLACK, ec=BLACK, lw=lw(0.18)))
paper.add_patch(MPoly([(na[0], na[1] + 13), (na[0] - 4.5, na[1] - 6), (na[0], na[1] - 2)], fc='white', ec=BLACK, lw=lw(0.18)))
T(na[0], na[1] + 18, 'شمال', 3, ha='center', weight='bold')
T(X1, PH - 26, 'مقیاس ۱:۵۰۰', 4.2, weight='bold'); T(X1, PH - 34, 'واحد: متر · روی کاغذ A2', 2.4)
sx, sy = X1 - 50, PH - 50
for i in range(5): paper.add_patch(Rectangle((sx + i * 10, sy), 10, 2.2, fc=BLACK if i % 2 == 0 else 'white', ec=BLACK, lw=lw(0.18)))
for i, mval in enumerate([0, 5, 10, 15, 20, 25]): T(sx + i * 10, sy - 3.2, n(mval), 2.0, ha='center')
T(X1, sy + 1.1, 'متر', 2.2)
HL(PH - 68)
# legend
y = PH - 76; T(X1, y, 'راهنما', 3.5, weight='bold'); y -= 8
LEG = [('box', None, 'ساختمان پیشنهادی (هاشور)'), ('line', (BLACK, 0.25, '-'), 'ساختمان موجود'), ('line', (RED, 0.5, (0, (14, 3, 2, 3))), 'محدوده‌ی سایت'),
       ('line', (BLUE, 0.35, (0, (6, 3))), 'مسیر اصلی پیاده'), ('line', (BLUE, 0.18, (0, (3, 2))), 'مسیر فرعی پیاده'),
       ('line', (ORANGE, 0.25, (0, (10, 3, 2, 3))), 'دسترسی اضطراری'), ('line', (ORANGE, 0.35, (0, (1, 2))), 'سرویس و بارگیری'),
       ('line', ('#8B5A2B', 0.18, (0, (6, 3))), 'خط تراز ۵ متری'), ('tree', None, 'درخت پیشنهادی'), ('treeE', None, 'درخت موجود'),
       ('tri', None, 'ورودی'), ('x', None, 'بنای موجود — تخریب')]
for kind, sty, txt in LEG:
    x0_ = X1 - 18
    if kind == 'box':
        paper.add_patch(Rectangle((x0_, y - 2.2), 14, 4.4, fill=False, ec=LGREY, lw=0, hatch='////')); paper.add_patch(Rectangle((x0_, y - 2.2), 14, 4.4, fill=False, ec=BLACK, lw=lw(0.6)))
    elif kind == 'line': paper.plot([x0_, x0_ + 14], [y, y], color=sty[0], lw=lw(sty[1]), ls=sty[2])
    elif kind == 'tree':
        paper.add_patch(Circle((x0_ + 7, y), 2.2, fill=False, ec=GREEN, lw=lw(0.25))); paper.plot([x0_ + 6, x0_ + 8], [y, y], color=GREEN, lw=lw(0.13)); paper.plot([x0_ + 7, x0_ + 7], [y - 1, y + 1], color=GREEN, lw=lw(0.13))
    elif kind == 'treeE': paper.add_patch(Circle((x0_ + 7, y), 2.2, fill=False, ec=GREEN, lw=lw(0.13)))
    elif kind == 'tri': paper.add_patch(MPoly([(x0_ + 10, y), (x0_ + 5, y + 2.2), (x0_ + 5, y - 2.2)], fc=RED, ec='none'))
    elif kind == 'x':
        paper.add_patch(Rectangle((x0_ + 3, y - 2), 8, 4, fill=False, ec=GREY, lw=lw(0.18), ls=(0, (3, 2)))); paper.plot([x0_ + 3, x0_ + 11], [y - 2, y + 2], color=GREY, lw=lw(0.13)); paper.plot([x0_ + 3, x0_ + 11], [y + 2, y - 2], color=GREY, lw=lw(0.13))
    T(X1 - 21, y, txt, 2.3); y -= 6.2
HL(y + 1)
# area table
y -= 5; T(X1, y, 'جدول مساحت‌ها (متر مربع)', 3.2, weight='bold'); y -= 6.5
cols = [X1, X1 - 62, X1 - 80, X1 - 99]
for c, h in zip(cols, ['فضا', 'خالص', 'ناخالص', 'ساختمان']): T(c, y, h, 2.2, weight='bold')
paper.plot([TB_X + 4, PW - 14], [y - 2.6, y - 2.6], color=BLACK, lw=lw(0.25)); y -= 5.6
PFA = {'CL': 'کلاس‌های تئوری', 'SH': 'سالن ورزشی چندمنظوره', 'AU': 'آمفی‌تئاتر', 'LB': 'کتابخانه', 'AS': 'سالن اجتماعات', 'WL': 'کارگاه و آزمایشگاه',
       'ST': 'سایت (کاربری نامشخص)', 'AD': 'اتاق‌های اداری', 'PR': 'ریاست و معاونت‌ها', 'RW': 'فضای تفریحی / رفاهی', 'CF': 'بوفه', 'WC': 'سرویس‌های بهداشتی'}
BN = {'B1': 'سالن', 'B2': 'کارگاه', 'B3': 'آموزشی', 'B4': 'آمفی', 'B5': 'ورودی'}
for k_, p in D.P.items():
    bs = sorted({w.split(' ')[0] for w in D.where(k_)}); bs = '، '.join(BN[b] for b in bs) if len(bs) < 3 else f'{n(len(bs))} ساختمان'
    T(cols[0], y, PFA[k_], 2.15); T(cols[1], y, n(p['net']), 2.15); T(cols[2], y, n(p['gross']), 2.15); T(cols[3], y, bs, 1.9)
    paper.plot([TB_X + 4, PW - 14], [y - 2.5, y - 2.5], color=LGREY, lw=lw(0.09)); y -= 5.0
net, gross = D.totals()
paper.plot([TB_X + 4, PW - 14], [y + 2.4, y + 2.4], color=BLACK, lw=lw(0.25))
T(cols[0], y, 'جمع', 2.3, weight='bold'); T(cols[1], y, n(net), 2.3, weight='bold'); T(cols[2], y, n(gross), 2.3, weight='bold'); y -= 6.5
fp = round(sum(D.floor_area(b) for b in D.BUILDINGS))
for s in [f'مساحت سایت: {n(round(site.area))} م²', f'سطح اشغال: {n(fp)} م² ({n(round(fp / site.area * 100))}٪)', 'تعداد طبقات: ۱ تا ۳']:
    T(X1, y, s, 2.2); y -= 4.6
HL(y + 1)
# notes
y -= 4.5; T(X1, y, 'یادداشت‌ها', 3.0, weight='bold'); y -= 5.5
for s in ['۱. نقشه‌ی پایه همان فایل DXF سایت است و تغییری نکرده.', '۲. محدوده روی لبه‌ی خیابان‌های بلوک ترسیم شده (غیرثبتی).',
          '۳. کاربری فضای «سایت» در برنامه مشخص نیست.', '۴. تراز دقیق زمین نیاز به نقشه‌برداری دارد.']:
    T(X1, y, s, 2.0); y -= 4.4
# title block cells (bottom)
TBY = 10; rows = [('طراحی دانشکده‌ی تربیت بدنی دانشگاه تهران', 3.6, True), ('عنوان نقشه: سایت‌پلان ایده — «خیابانِ دانشکده»', 3.0, True),
                  ('موقعیت: تهران، منطقه‌ی ۶ — میان بوستان لاله و دانشگاه تهران', 2.3, False)]
HL(TBY + 62, lw(0.5))
yy = TBY + 55
for s, h, bold in rows: T(X1, yy, s, h, weight='bold' if bold else 'normal'); yy -= 8.5
HL(TBY + 30)
cells = [('دانشجو:', ''), ('استاد:', ''), ('مقیاس:', '۱:۵۰۰'), ('تاریخ:', '۱۴۰۵/۰۷/۲۲'), ('مرحله:', 'ایده'), ('شماره‌ی شیت:', '۱ از ۱')]
cw = 125 / 3
for i, (a, b) in enumerate(cells):
    c, r = i % 3, i // 3
    x_r = PW - 10 - c * cw; y_c = TBY + 30 - (r + 1) * 15
    paper.add_patch(Rectangle((x_r - cw, y_c), cw, 15, fill=False, ec=BLACK, lw=lw(0.25)))
    T(x_r - 2.5, y_c + 10.5, a, 2.0, color=GREY); T(x_r - 2.5, y_c + 4.5, b, 2.8, weight='bold')

out = os.path.join(D.OUT, 'PE_Faculty_SitePlan_CAD_FA.pdf')
fig.savefig(out, facecolor='white')
fig.savefig(os.path.join(os.environ.get('PREVIEW_DIR', '/tmp'), 'cad_fa.png'), dpi=110, facecolor='white')
print('saved', out)
