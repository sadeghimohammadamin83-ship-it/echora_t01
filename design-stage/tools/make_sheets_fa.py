"""نسخه‌ی فارسی و ساده‌ی شیت‌ها (۶ صفحه‌ی A3) — همان داده‌های design.py، فقط متن فارسی و کوتاه.
خروجی: output/PE_Faculty_Concept_FA.pdf"""
import os, sys, math, glob, textwrap
import numpy as np
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
from matplotlib.patches import Polygon as MPoly, Circle, FancyArrowPatch, Rectangle, FancyBboxPatch
from matplotlib.backends.backend_pdf import PdfPages
from shapely.geometry import Polygon, box
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import design as D
import content as C

for f in glob.glob(os.path.expanduser('~/.fonts/Vazirmatn-*.ttf')): fm.fontManager.addfont(f)
plt.rcParams.update({'font.family': ['Vazirmatn', 'DejaVu Sans'], 'font.size': 9, 'pdf.fonttype': 42})
INK, MUTE, LINE, PAPER = '#1C1E21', '#6E7176', '#C9C6BF', '#FAF8F4'
BLUE, RED = '#2E86DE', '#C8282E'
GC = {'Sports': '#E8913A', 'Assembly': '#C8504A', 'Academic': '#2E86DE', 'Administration': '#7C5CC4', 'Amenity': '#D2AA3C', 'Services': '#8C8C8C', 'Unresolved': '#A0A0A0'}
OPEN_C = {'plaza': '#D9D0BD', 'street': '#E9DDC4', 'court': '#BFD7A9', 'garden': '#C7DDB0', 'buffer': '#9CC487', 'walk': '#D4E3C2'}
PED1, PED2, SERV, EMER = '#1E6EC8', '#5CA0E0', '#B07A14', '#D07020'
BC = {'B1': GC['Sports'], 'B2': GC['Academic'], 'B3': GC['Academic'], 'B4': GC['Assembly'], 'B5': GC['Administration']}
KEYCOL = {k: GC[p['group']] for k, p in D.P.items()}
A3 = (16.54, 11.69)
site = Polygon(D.site_xy()); SX0, SY0, SX1, SY1 = site.bounds
src = D.source().modelspace()

FA_DIG = str.maketrans('0123456789,.', '۰۱۲۳۴۵۶۷۸۹٬٫')
def n(x, dec=0):
    s = f'{x:,.{dec}f}' if isinstance(x, float) or dec else f'{x:,}'
    return s.translate(FA_DIG)

# ---------------------------------------------------------------- Persian names
NAME = {'B1': 'سالن ورزشی', 'B2': 'کارگاه و\nآزمایشگاه', 'B3': 'بال آموزشی', 'B4': 'آمفی‌تئاتر', 'B5': 'ساختمان ورودی'}
PFA = {'CL': 'کلاس‌های تئوری', 'SH': 'سالن ورزشی چندمنظوره', 'AU': 'آمفی‌تئاتر', 'LB': 'کتابخانه', 'AS': 'سالن اجتماعات',
       'WL': 'کارگاه و آزمایشگاه', 'ST': 'سایت (کاربری نامشخص)', 'AD': 'اتاق‌های اداری', 'PR': 'ریاست و معاونت‌ها',
       'RW': 'فضای تفریحی / رفاهی', 'CF': 'بوفه', 'WC': 'سرویس‌های بهداشتی'}
GFA = {'Sports': 'ورزشی', 'Assembly': 'اجتماعات', 'Academic': 'آموزشی', 'Administration': 'اداری', 'Amenity': 'رفاهی', 'Services': 'خدماتی', 'Unresolved': 'نامشخص'}
LEV = ['همکف', 'طبقه‌ی اول', 'طبقه‌ی دوم']
OPEN_FA = {'O1': (101, 110, 0, 'میدان ورودی'), 'O2': (64, 64.9, 0, 'خیابانِ دانشکده'), 'O3': (66, 99.6, 0, 'زمین روباز'),
           'O4': (39.2, 47, 90, 'حیاط آموزشی'), 'O5': (19, 86, 90, 'باغ غربی'), 'O6': (40, 112.5, -4, 'باغ لبه‌ی پارک · خاکریز سبز'),
           'O7': (72, 15.5, 0, 'پیاده‌راه چنارهای پورسینا'), 'O8': (106.5, 33, 90, 'لبه‌ی جلالیه'), 'O9': (109, 80, 90, 'تراس بوفه')}
LBL = {'B1': (72, 39.6, 0), 'B2': (39.25, 29.5, 0), 'B3': (25, 40.6, 90), 'B4': (42, 85.2, 0), 'B5': (88.5, 84.8, 0)}


def gross_of(b): return sum(a for fl in b['floors'] for _, a in fl)


# ---------------------------------------------------------------- page frame (right-to-left)
def sheet(no, title, sub):
    fig = plt.figure(figsize=A3, facecolor=PAPER)
    fig.text(0.975, 0.955, n(no).zfill(2) if no >= 10 else '۰' + n(no), fontsize=32, color=BLUE, ha='right', va='center', weight='light')
    fig.text(0.925, 0.962, title, fontsize=20, color=INK, ha='right', va='center', weight='bold')
    fig.text(0.925, 0.928, sub, fontsize=10.5, color=MUTE, ha='right', va='center')
    fig.add_artist(plt.Line2D([0.025, 0.975], [0.905, 0.905], color=INK, lw=0.8))
    fig.add_artist(plt.Line2D([0.025, 0.975], [0.045, 0.045], color=LINE, lw=0.6))
    fig.text(0.975, 0.025, 'دانشکده‌ی تربیت بدنی · منطقه‌ی ۶ تهران · مرحله‌ی ایده‌ی طراحی', fontsize=8.5, color=MUTE, ha='right')
    fig.text(0.025, 0.025, 'ترسیم‌شده روی فایل DXF سایت (واحد: متر)', fontsize=8.5, color=MUTE, ha='left')
    return fig


def plan_ax(fig, rect, pad=24, light=False):
    ax = fig.add_axes(rect); ax.set_aspect('equal'); ax.axis('off')
    x0, y0, x1, y1 = SX0 - pad, SY0 - pad, SX1 + pad, SY1 + pad; W = box(x0, y0, x1, y1)
    for e in src.query('LWPOLYLINE[layer=="TPX_ROADS_CONTOURS"]'):
        P = np.array([p[:2] for p in e.get_points('xy')] + [e.get_points('xy')[0][:2]]); ax.plot(*P.T, color='#C2BEB5' if not light else '#D9D6CF', lw=0.5, zorder=1)
    for e in src.query('LWPOLYLINE[layer=="TPX_BUILDINGS"]'):
        g = Polygon([p[:2] for p in e.get_points('xy')])
        if g.intersects(W) and not g.intersects(site): ax.add_patch(MPoly(np.array(g.exterior.coords), fc='#DCD8D0' if not light else '#E8E5DF', ec='#ABA69D', lw=0.4, zorder=2))
    for x, y, r in D.trees():
        if x0 < x < x1 and y0 < y < y1: ax.add_patch(Circle((x, y), r, fc='#8DB87A', ec='#5E8C4E', lw=0.3, alpha=0.4 if not light else 0.22, zorder=3))
    ax.set_xlim(x0, x1); ax.set_ylim(y0, y1)
    return ax


def boundary(ax, lw=1.6):
    P = np.array(D.site_xy() + [D.site_xy()[0]]); ax.plot(*P.T, color=RED, lw=lw, ls=(0, (8, 2, 1, 2)), zorder=20)


def bpatch(ax, b, fc, alpha=0.9, ec=INK, lw=1.0, z=10):
    ax.add_patch(MPoly(D.xy(b['poly']), fc=fc, ec=ec, lw=lw, alpha=alpha, zorder=z))


def opatch(ax, kinds=None, alpha=1):
    for oid, name, poly, kind in D.OPEN:
        if kinds and kind not in kinds: continue
        g = D.open_poly(poly)
        for gg in ([g] if g.geom_type == 'Polygon' else g.geoms): ax.add_patch(MPoly(np.array(gg.exterior.coords), fc=OPEN_C[kind], ec='#9A9078', lw=0.4, alpha=alpha, zorder=5))


def route(ax, pts, col, lw, ls='-', arrow=False, z=15):
    P = D.xy(pts); ax.plot(*P.T, color=col, lw=lw, ls=ls, zorder=z, solid_capstyle='round')
    if arrow: ax.add_patch(FancyArrowPatch(P[-2], P[-1], arrowstyle='-|>', mutation_scale=10 + lw * 2, color=col, lw=0, zorder=z))


def uvtext(ax, u, v, s, size=8, rot=0, **kw):
    p = D.xy([(u, v)])[0]; ax.text(p[0], p[1], s, fontsize=size, rotation=math.degrees(D.TH) + rot, ha='center', va='center', rotation_mode='anchor', zorder=kw.pop('z', 25), **kw)


def north(ax, x, y, s=10):
    ax.add_patch(MPoly([(x, y + s), (x + s * .35, y - s * .45), (x, y - s * .2)], fc=INK, ec=INK, lw=0.5, zorder=30))
    ax.add_patch(MPoly([(x, y + s), (x - s * .35, y - s * .45), (x, y - s * .2)], fc='white', ec=INK, lw=0.5, zorder=30))
    ax.text(x, y + s * 1.3, 'شمال', ha='center', va='bottom', fontsize=9, weight='bold', zorder=30)


def scalebar(ax, x, y, L=50, step=10):
    for k in range(int(L / step)): ax.add_patch(Rectangle((x + k * step, y), step, 2.2, fc=INK if k % 2 == 0 else 'white', ec=INK, lw=0.5, zorder=30))
    for k in range(0, L + 1, step): ax.text(x + k, y - 1.5, n(k), ha='center', va='top', fontsize=7.5, zorder=30)
    ax.text(x + L + 4, y + 1, 'متر', fontsize=7.5, va='center', zorder=30)


def legend_rows(fig, x_right, y, rows, dy=0.03, size=9.5):
    """rows: (kind, colour/style, text) — drawn right-to-left: swatch on the right, text to its left"""
    for kind, sty, txt in rows:
        if kind == 'box': fig.add_artist(Rectangle((x_right - 0.022, y - 0.008), 0.022, 0.017, transform=fig.transFigure, fc=sty, ec=INK, lw=0.5))
        elif kind == 'line': fig.add_artist(plt.Line2D([x_right - 0.03, x_right], [y] * 2, transform=fig.transFigure, color=sty[0], lw=sty[1], ls=sty[2]))
        elif kind == 'dot': fig.add_artist(plt.Line2D([x_right - 0.011], [y], transform=fig.transFigure, marker=sty[1], ms=sty[2], color=sty[0], mec='white', lw=0))
        fig.text(x_right - 0.04, y, txt, fontsize=size, ha='right', va='center')
        y -= dy
    return y


pages = []

# ================================================================ ۱ · سایت‌پلان
fig = sheet(1, 'سایت‌پلان ایده — «خیابانِ دانشکده»', 'طرح روی نقشه‌ی واقعی سایت؛ محدوده = لبه‌ی خیابان‌های اطراف بلوک')
ax = plan_ax(fig, [0.3, 0.06, 0.68, 0.83], pad=30)
opatch(ax)
for b in D.BUILDINGS:
    bpatch(ax, b, BC[b['id']])
    u, v, r = LBL[b['id']]; small = b['id'] == 'B2'
    d1, d2 = (1.8, 2.2) if not small else (1.4, 3.2)
    o1, o2 = ((u - d1, v), (u + d2, v)) if r == 90 else ((u, v + d1), (u, v - d2))
    uvtext(ax, *o1, NAME[b['id']], 11 if not small else 6.5, r, color='white', weight='bold')
    uvtext(ax, *o2, f"{n(gross_of(b))} م² · {n(len(b['floors']))} طبقه", 8 if not small else 6, r, color='white')
cu, cv = 66.0, 89.0
ax.add_patch(MPoly(D.xy([(cu - 7.5, cv - 14), (cu + 7.5, cv - 14), (cu + 7.5, cv + 14), (cu - 7.5, cv + 14)]), fc='#A9CC8E', ec='white', lw=1.1, zorder=7))
ax.add_patch(MPoly(D.xy([(18, 59.2), (97.5, 59.2), (97.5, 62.6), (18, 62.6)]), fc='#C8B48C', ec='#8A7350', lw=0.5, alpha=0.75, zorder=9, hatch='////'))
for u, v in [(u, 66.2) for u in range(16, 56, 8)] + [(15, 76), (22, 72), (14, 90), (22, 100), (36, 41), (36, 52), (42, 55), (104, 92), (110, 84)]:
    ax.add_patch(Circle(D.xy([(u, v)])[0], 2.6, fc='#6FA35A', ec='#3F6E33', lw=0.5, alpha=0.85, zorder=13))
for p in D.PED['primary']: route(ax, p, PED1, 2.4, (0, (4, 2)))
for p in D.PED['secondary']: route(ax, p, PED2, 1.2, (0, (3, 2)))
for p in D.SERVICE: route(ax, p, SERV, 1.6, ':', arrow=True)
for u, v, lab, kind in D.ENTRANCES:
    p = D.xy([(u, v)])[0]
    if kind == 'bldg': ax.plot(*p, marker='v', ms=5, color=RED, zorder=22)
    else: ax.plot(*p, marker='o', ms=10 if kind == 'main' else 7, mfc=RED if kind != 'service' else SERV, mec='white', mew=1.2, zorder=23)
for k, (u, v, r, s) in OPEN_FA.items(): uvtext(ax, u, v, s, 8, r, color='#3E4E30', weight='bold')
boundary(ax)
for (u, v, s, r) in [(60, 128, 'بلوار کشاورز ← بوستان لاله', -6), (60, -9, 'خیابان پورسینا ← دانشگاه تهران', 0), (123, 50, 'جلالیه', 90), (-6, 95, 'هدایتی', 96), (-6, 20, 'عنایت', 90)]:
    uvtext(ax, u, v, s, 9.5, r, color=MUTE, weight='bold')
for (u, v, s, r, c) in [(108, 123, 'ورودی اصلی', 0, RED), (123.5, 64, 'ورودی شرقی', 90, RED), (39, -3.6, 'ورودی جنوبی', 0, RED), (1.5, 71, 'ورودی\nغربی', 0, RED), (126.5, 38, 'سرویس', 90, SERV)]:
    uvtext(ax, u, v, s, 8, r, color=c, weight='bold')
x0, x1 = ax.get_xlim(); y0, y1 = ax.get_ylim()
north(ax, x0 + 14, y1 - 22); scalebar(ax, x0 + 8, y0 + 8)
# right panel → on the LEFT side of the page (plan sits on the right, as read RTL)
fig.text(0.28, 0.87, 'ایده', fontsize=15, weight='bold', ha='right')
SHORT = 'کوچه‌ی زارع به «خیابان دانشکده» تبدیل می‌شود: مسیر پیاده‌ی سایه‌دار از جلالیه تا کوچه‌های غربی. همه‌ی ساختمان‌ها از این خیابان وارد می‌شوند؛ عمومی رو به پارک، ورزش رو به دانشگاه، آموزش رو به غرب آرام.'
fig.text(0.28, 0.84, '\n'.join(textwrap.wrap(SHORT, 46)), fontsize=10, ha='right', va='top', linespacing=1.75)
fig.text(0.28, 0.64, 'راهنما', fontsize=15, weight='bold', ha='right')
yy = legend_rows(fig, 0.28, 0.605, [
    ('box', GC['Sports'], 'سالن ورزشی'), ('box', GC['Assembly'], 'آمفی‌تئاتر'), ('box', GC['Academic'], 'بال آموزشی و کارگاه'),
    ('box', GC['Administration'], 'ساختمان ورودی (بوفه، اجتماعات، اداری)'), ('box', OPEN_C['street'], 'میدان و خیابان دانشکده'),
    ('box', OPEN_C['garden'], 'حیاط‌ها و باغ‌ها'), ('box', OPEN_C['buffer'], 'حائل سبز (درختان موجود حفظ شده)'),
    ('line', (RED, 1.6, (0, (8, 2, 1, 2))), 'محدوده‌ی سایت'), ('line', (PED1, 2.4, (0, (4, 2))), 'مسیر اصلی پیاده'),
    ('line', (PED2, 1.2, (0, (3, 2))), 'مسیر فرعی پیاده'), ('line', (SERV, 1.6, ':'), 'مسیر سرویس'),
    ('dot', (RED, 'o', 9), 'ورودی سایت'), ('dot', (RED, 'v', 6), 'ورودی ساختمان')], dy=0.027)
net, gross = D.totals(); fp = sum(D.floor_area(b) for b in D.BUILDINGS)
fig.text(0.28, yy - 0.02, 'اعداد کلیدی', fontsize=15, weight='bold', ha='right'); yy -= 0.055
for k_, v_ in [('مساحت سایت', f'{n(round(site.area))} م²'), ('زیربنای کل (ناخالص)', f'{n(gross)} م²'), ('سطح اشغال', f'{n(round(fp))} م² ({n(round(fp / site.area * 100))}٪)'),
               ('فضای باز', f'{n(round(site.area - fp))} م² ({n(round((site.area - fp) / site.area * 100))}٪)'), ('تعداد طبقات', '۱ تا ۳ طبقه')]:
    fig.text(0.28, yy, k_, fontsize=10, ha='right', color=MUTE); fig.text(0.03, yy, v_, fontsize=10.5, ha='left', weight='bold')
    fig.add_artist(plt.Line2D([0.03, 0.28], [yy - 0.011] * 2, transform=fig.transFigure, color=LINE, lw=0.5)); yy -= 0.032
pages.append(fig)

# ================================================================ ۲ · از تحلیل تا ایده
fig = sheet(2, 'از تحلیل سایت تا ایده', 'یافته‌های اصلی ← اصول طراحی ← ایده')
FIND = ['سایت میان بوستان لاله (شمال) و پردیس دانشگاه تهران (جنوب) قرار دارد.',
        'جلالیه و کوچه‌ی زارع تنها مسیر پیاده‌ی پارک به دانشگاه‌اند؛ مترو بوستان لاله ۲۸۰ متر فاصله دارد.',
        'بلوار کشاورز پرسروصدا و پرگردوغبار است؛ لبه‌ی غربی مسکونی و حساس است.',
        'جنوب و شرق سایت بافت دانشگاهی و نهادی است.',
        'ردیف چنارهای سه لبه ارزشمندند؛ زمین حدود ۳ تا ۵ متر رو به جنوب شیب دارد.',
        'آفتاب تند غرب در تابستان؛ باد غالب غربی و جنوب‌غربی.']
PRIN = ['یک خیابان عمومی پیاده از شرق تا غرب سایت', 'فضاهای عمومی رو به پارک، ورزش رو به دانشگاه، آموزش رو به غرب آرام',
        'حفظ همه‌ی چنارها و ایجاد حائل سبز در کشاورز', 'ورود همه‌ی ساختمان‌ها از خیابان دانشکده', 'حجم‌های بزرگ در جنوب و پایین‌تر از خیابان']
cols = [(0.975, 'یافته‌های اصلی تحلیل'), (0.655, 'اصول طراحی'), (0.335, 'ایده')]
for x, t in cols: fig.text(x, 0.86, t, fontsize=15, weight='bold', ha='right', color=BLUE)
for i in range(2): fig.add_artist(FancyArrowPatch((cols[i][0] - 0.3, 0.866), (cols[i + 1][0] + 0.005, 0.866), transform=fig.transFigure, arrowstyle='-|>', mutation_scale=18, color=BLUE, lw=1.5))
y = 0.81
for i, t in enumerate(FIND):
    fig.add_artist(FancyBboxPatch((0.675, y - 0.1), 0.3, 0.09, boxstyle='round,pad=0.003,rounding_size=0.006', transform=fig.transFigure, fc='white', ec=LINE, lw=0.7))
    fig.text(0.965, y - 0.055, n(i + 1), fontsize=20, color=BLUE, ha='right', va='center', weight='light')
    fig.text(0.94, y - 0.055, '\n'.join(textwrap.wrap(t, 48)), fontsize=10.5, ha='right', va='center', linespacing=1.6)
    y -= 0.12
y = 0.81
for i, t in enumerate(PRIN):
    fig.add_artist(FancyBboxPatch((0.355, y - 0.12), 0.3, 0.11, boxstyle='round,pad=0.003,rounding_size=0.006', transform=fig.transFigure, fc='#EEF4FB', ec=BLUE, lw=0.8))
    fig.text(0.645, y - 0.065, n(i + 1), fontsize=22, color=BLUE, ha='right', va='center', weight='light')
    fig.text(0.615, y - 0.065, '\n'.join(textwrap.wrap(t, 34)), fontsize=11.5, ha='right', va='center', weight='bold', linespacing=1.6)
    y -= 0.145
axc = fig.add_axes([0.03, 0.4, 0.3, 0.44]); axc.set_aspect('equal'); axc.axis('off')
axc.add_patch(MPoly(np.array(D.site_xy()), fc='#F1ECE2', ec=RED, lw=1, ls=(0, (6, 2))))
for b in D.BUILDINGS: bpatch(axc, b, BC[b['id']], lw=0.6)
route(axc, [(116.5, 62.5), (6, 63.5)], PED1, 4, arrow=True); route(axc, [(6, 63.5), (116.5, 62.5)], PED1, 4, arrow=True)
route(axc, [(112, 120), (88, 99), (76, 70)], PED1, 2.5, arrow=True)
uvtext(axc, 60, 66.5, 'خیابانِ دانشکده', 9, 0, color=PED1, weight='bold')
uvtext(axc, 60, 128, 'بوستان لاله ↑', 10, 0, color='#4E9A3E', weight='bold'); uvtext(axc, 58, -7, 'دانشگاه تهران ↓', 10, 0, color='#2E5F8A', weight='bold')
for k_, (u, v) in {'عمومی': (42, 85), 'ورزشی': (72, 38), 'آموزشی': (25, 40)}.items(): uvtext(axc, u, v, k_, 9, 0, color='white', weight='bold')
axc.set_xlim(SX0 - 12, SX1 + 12); axc.set_ylim(SY0 - 12, SY1 + 12)
fig.text(0.315, 0.36, C.CONCEPT['title_fa'], fontsize=24, weight='bold', ha='right', color=BLUE)
fig.text(0.315, 0.32, '\n'.join(textwrap.wrap(C.CONCEPT['idea_fa'], 46)), fontsize=10.5, ha='right', va='top', linespacing=1.8)
pages.append(fig)

# ================================================================ ۳ · سه گزینه
fig = sheet(3, 'سه گزینه‌ی طراحی', 'هر سه روی محدوده‌ی واقعی آزموده شدند · گزینه‌ی منتخب: الف')
ALTS = [('الف', 'خیابان دانشکده', 'کوچه‌ی زارع به خیابان عمومی تبدیل می‌شود و ساختمان‌ها دو طرف آن قرار می‌گیرند.',
         'مسیر پیاده‌ی پارک–دانشگاه عمومی می‌ماند؛ هر کاربری کنار لبه‌ی مناسب خودش است؛ درختان حفظ می‌شوند.', 'خیابان طولانی به سایه و مدیریت شبانه نیاز دارد.', 31),
        ('ب', 'حیاط مرکزی', 'ساختمان‌ها دور یک حیاط بزرگ مرکزی حلقه می‌زنند.',
         'هویت قوی، حیاط محافظت‌شده، کنترل آسان.', 'مسیر پارک–دانشگاه بسته می‌شود؛ ساخت‌وساز کنار همسایه‌های مسکونی؛ توسعه‌ی آینده سخت.', 23),
        ('ج', 'سکوی منظر', 'سالن ورزشی و آمفی‌تئاتر زیر یک سکوی سبز عمومی فرو می‌روند.',
         'کمترین حجم دیده‌شده، بیشترین فضای سبز.', 'گودبرداری عمیق، دهانه‌های بزرگ زیر خاک، هزینه و ریسک زیاد.', 27)]
GEOM = {'ب': [('Sports', [(32, 14), (88, 14), (88, 48), (32, 48)]), ('Assembly', [(18, 88), (100, 88), (100, 106), (18, 106)]),
              ('Academic', [(16, 22), (30, 22), (30, 88), (16, 88)]), ('Administration', [(88, 22), (102, 22), (102, 88), (88, 88)])],
        'ج': [('Sports', [(32, 16), (100, 16), (100, 56), (32, 56)]), ('Assembly', [(32, 60), (66, 60), (66, 98), (32, 98)]),
              ('Academic', [(14, 18), (28, 18), (28, 108), (14, 108)]), ('Administration', [(78, 78), (100, 78), (100, 100), (78, 100)])]}
for i, (key, title, idea, pro, con, score) in enumerate(ALTS):
    xr = 0.975 - i * 0.32
    a = plan_ax(fig, [xr - 0.3, 0.47, 0.3, 0.4], pad=8, light=True)
    if key == 'الف':
        opatch(a, alpha=0.8)
        for b in D.BUILDINGS: bpatch(a, b, BC[b['id']], lw=0.6)
        for p in D.PED['primary']: route(a, p, PED1, 1.8, (0, (4, 2)))
    else:
        if key == 'ج': a.add_patch(MPoly(D.xy([(8, 8), (112, 8), (112, 112), (8, 112)]), fc='#BFD7A9', ec='#6F9A57', lw=0.6, alpha=0.75, zorder=6))
        if key == 'ب': a.add_patch(MPoly(D.xy([(30, 48), (88, 48), (88, 88), (30, 88)]), fc='#BFD7A9', ec='#6F9A57', lw=0.6, zorder=6)); uvtext(a, 59, 68, 'حیاط مرکزی', 9, 0, color='#3F6E33', weight='bold')
        for grp, poly in GEOM[key]:
            sunk = key == 'ج' and grp in ('Sports', 'Assembly')
            a.add_patch(MPoly(D.xy(poly), fc='none' if sunk else GC[grp], ec=GC[grp] if sunk else INK, lw=1.4 if sunk else 0.6, ls='--' if sunk else '-', alpha=0.9, zorder=10, hatch='///' if sunk else None))
        if key == 'ج': uvtext(a, 66, 36, 'زیر سکو', 9, 0, color=INK, weight='bold')
    boundary(a, 1.0)
    sel = key == 'الف'
    fig.text(xr, 0.43, f'گزینه‌ی {key} · {title}', fontsize=15, weight='bold', ha='right', color=BLUE if sel else INK)
    if sel: fig.text(xr - 0.3, 0.43, 'منتخب', fontsize=11, weight='bold', color='white', ha='left', bbox=dict(fc=BLUE, ec='none', pad=4))
    yy = 0.39
    for lab, txt, col in [('ایده', idea, MUTE), ('مزیت', pro, '#3E8A2E'), ('ضعف', con, RED)]:
        w = textwrap.wrap(txt, 46)
        fig.text(xr, yy, lab, fontsize=10, weight='bold', ha='right', va='top', color=col)
        fig.text(xr - 0.035, yy, '\n'.join(w), fontsize=10, ha='right', va='top', linespacing=1.6); yy -= 0.028 * len(w) + 0.018
    fig.text(xr, 0.1, 'امتیاز', fontsize=10, ha='right', color=MUTE)
    fig.add_artist(Rectangle((xr - 0.27, 0.095), 0.2 * score / 35, 0.022, transform=fig.transFigure, fc=BLUE if sel else '#9DB8D6', ec='none'))
    fig.add_artist(Rectangle((xr - 0.27, 0.095), 0.2, 0.022, transform=fig.transFigure, fc='none', ec=LINE, lw=0.6))
    fig.text(xr - 0.28, 0.106, f'{n(score)} از ۳۵', fontsize=12, weight='bold', ha='right', va='center', color=BLUE if sel else INK)
fig.text(0.975, 0.06, 'معیارها: پاسخ به سایت · وضوح عملکرد · روابط فضایی · گردش · کیفیت فضای باز · امکان توسعه · هویت معماری (هر کدام از ۵)', fontsize=9, ha='right', color=MUTE)
pages.append(fig)

# ================================================================ ۴ · روابط فضایی
fig = sheet(4, 'روابط فضایی', 'ماتریس ارتباطات و دیاگرام حبابی — هماهنگ با سایت‌پلان')
keys = ['SH', 'WL', 'CL', 'LB', 'ST', 'AU', 'AS', 'CF', 'RW', 'AD', 'PR', 'WC']
RC = {'S': '#1E5FA8', 'M': '#9CC3EA', 'W': '#EFEDE8', 'R': '#C8282E', '?': '#C4C4C4'}
RFA = {'S': 'ارتباط قوی (هم‌جوار)', 'M': 'ارتباط متوسط (دسترسی آسان)', 'W': 'ارتباط ضعیف (جدا)', 'R': 'دسترسی کنترل‌شده', '?': 'نامشخص'}
axm = fig.add_axes([0.52, 0.13, 0.455, 0.75]); axm.axis('off'); N = len(keys)
axm.set_xlim(-0.5, N + 7.2); axm.set_ylim(-0.6, N + 1.2)
# RTL matrix: names on the right, triangle opens to the left
for i, a in enumerate(keys):
    yy = N - 1 - i
    axm.add_patch(Rectangle((N + 6.9, yy + 0.1), 0.25, 0.8, fc=KEYCOL[a], ec='none'))
    axm.text(N + 6.75, yy + 0.5, PFA[a], fontsize=9.5, va='center', ha='right')
    for j, b in enumerate(keys):
        if j <= i: continue
        r = C.rel(a, b); xx = N - 1 - j + 0.0
        axm.add_patch(Rectangle((xx + 0.9, yy), 0.94, 0.94, fc=RC[r], ec='white', lw=0.6))
axm.text(N + 7.2, N + 0.6, 'ماتریس ارتباطات', fontsize=14, weight='bold', ha='right')
for j, b in enumerate(keys):
    xx = N - 1 - j + 0.9 + 0.47; axm.text(xx, N - 1 - j + 0.47, n(j + 1), fontsize=9, ha='center', va='center', color=MUTE, weight='bold')
for i, a in enumerate(keys): axm.text(N + 1.15, N - 1 - i + 0.5, n(i + 1), fontsize=9, ha='center', va='center', color=MUTE, weight='bold')
fig.text(0.975, 0.105, '   '.join(''), fontsize=1)
yy = 0.09
xr = 0.975
for k_, t_ in RFA.items():
    fig.add_artist(Rectangle((xr - 0.016, yy - 0.008), 0.016, 0.016, transform=fig.transFigure, fc=RC[k_], ec=INK, lw=0.3))
    fig.text(xr - 0.022, yy, t_, fontsize=9, ha='right', va='center'); xr -= 0.125
axb = fig.add_axes([0.025, 0.08, 0.47, 0.8]); axb.set_aspect('equal'); axb.axis('off'); axb.set_xlim(-6, 126); axb.set_ylim(-14, 134)
POS = {'SH': (72, 38), 'WL': (42, 24), 'CL': (22, 40), 'LB': (24, 60), 'ST': (10, 22), 'AU': (42, 88), 'AS': (88, 96), 'CF': (98, 76), 'RW': (114, 82),
       'AD': (80, 114), 'PR': (106, 114), 'WC': (54, 64)}
WCP = [(8, 52), (28, 76), (108, 64)]
def ppos(k, o=None):
    if k != 'WC': return POS[k]
    q = POS[o] if o else (60, 60); return min(WCP, key=lambda w: (w[0] - q[0]) ** 2 + (w[1] - q[1]) ** 2)
axb.add_patch(Rectangle((0, 56), 120, 12, fc='#F3EAD6', ec='none')); axb.text(60, 62, 'خیابانِ دانشکده', ha='center', va='center', fontsize=11, color='#A38A5A', weight='bold')
axb.text(60, 128, 'بوستان لاله ↑', ha='center', fontsize=11, color='#4E9A3E', weight='bold'); axb.text(60, -12, 'دانشگاه تهران ↓', ha='center', fontsize=11, color='#2E5F8A', weight='bold')
for i, a in enumerate(keys):
    for b in keys[i + 1:]:
        r = C.rel(a, b)
        if r in ('S', 'R') or (r == 'M' and 'WC' not in (a, b)):
            (x1, y1), (x2, y2) = ppos(a, b), ppos(b, a)
            axb.plot([x1, x2], [y1, y2], color=RC[r], lw={'S': 3.2, 'M': 0.7, 'R': 2.4}[r], ls='--' if r == 'R' else '-', zorder=1, alpha=0.95 if r != 'M' else 0.5)
for a in keys:
    for (x, y) in (WCP if a == 'WC' else [POS[a]]):
        r = math.sqrt(D.P[a]['gross'] / (3 if a == 'WC' else 1)) * 0.24
        axb.add_patch(Circle((x, y), r, fc=KEYCOL[a], ec='white', lw=1.4, alpha=0.95, zorder=3))
        axb.text(x, y - r - 1.6, PFA[a] if a != 'WC' else 'سرویس', ha='center', va='top', fontsize=8, zorder=4)
        if r > 7: axb.text(x, y, n(D.P[a]['gross']), ha='center', va='center', fontsize=9, color='white', weight='bold', zorder=4)
axb.text(120, 134, 'دیاگرام حبابی (اندازه‌ی دایره ∝ مساحت)', fontsize=14, weight='bold', ha='right', va='top')
pages.append(fig)

# ================================================================ ۵ · پهنه‌بندی و دسترسی
fig = sheet(5, 'پهنه‌بندی و دسترسی', 'راست: سطح دسترسی و صدا · چپ: مسیرهای پیاده، ورودی‌ها و سرویس')
ACC = {'public': '#E9C46A', 'semi': '#F4A261', 'academic': '#5FA8E6', 'controlled': '#8E6CC8'}
axz = plan_ax(fig, [0.505, 0.07, 0.47, 0.76], pad=14, light=True)
for oid, name, poly, kind in D.OPEN:
    g = D.open_poly(poly); c_ = ACC['public'] if kind in ('plaza', 'street', 'court', 'walk') else '#CFE2BC'
    for gg in ([g] if g.geom_type == 'Polygon' else g.geoms): axz.add_patch(MPoly(np.array(gg.exterior.coords), fc=c_, ec='white', lw=0.5, alpha=0.75, zorder=5))
ZB = {'B1': 'semi', 'B2': 'academic', 'B3': 'academic', 'B4': 'semi', 'B5': 'controlled'}
for b in D.BUILDINGS: bpatch(axz, b, ACC[ZB[b['id']]], lw=0.8)
for b in D.BUILDINGS:
    u, v, r = LBL[b['id']]; uvtext(axz, u, v, NAME[b['id']], 9 if b['id'] != 'B2' else 6.5, r, color='white' if b['id'] != 'B2' else INK, weight='bold')
for (u, v, s, col) in [(60, 117, 'پرسروصدا — بلوار کشاورز', RED), (66, 98, 'پرسروصدا', RED), (72, 30, 'صدا داخل سالن', RED), (24, 28, 'آرام', BLUE), (19, 96, 'آرام', BLUE), (39, 50, 'آرام', BLUE)]:
    uvtext(axz, u, v, s, 8.5, 0, color=col, weight='bold', bbox=dict(fc='white', ec='none', alpha=0.75, pad=1.5))
boundary(axz, 1.2)
(x0, x1), (y0, y1) = axz.get_xlim(), axz.get_ylim(); north(axz, x0 + 10, y1 - 16, 8); scalebar(axz, x0 + 6, y0 + 6, 40, 10)
legend_rows(fig, 0.975, 0.875, [('box', ACC['public'], 'عمومی'), ('box', ACC['semi'], 'نیمه‌عمومی (سالن، آمفی‌تئاتر)')], dy=0.025)
legend_rows(fig, 0.78, 0.875, [('box', ACC['academic'], 'آموزشی'), ('box', ACC['controlled'], 'کنترل‌شده (اداری، ریاست)')], dy=0.025)
legend_rows(fig, 0.6, 0.875, [('box', '#CFE2BC', 'حائل سبز')], dy=0.025)
axc = plan_ax(fig, [0.025, 0.07, 0.47, 0.76], pad=14, light=True)
for b in D.BUILDINGS: bpatch(axc, b, '#E5E2DB', ec='#8A867E', lw=0.6)
opatch(axc, ['street', 'plaza'], alpha=0.6)
for p in D.PED['primary']: route(axc, p, PED1, 3.4, arrow=True)
for p in D.PED['secondary']: route(axc, p, PED2, 1.6, (0, (3, 1.5)), arrow=True)
for p in D.EMERGENCY: route(axc, p, EMER, 1.6, (0, (6, 2, 1, 2)))
for p in D.SERVICE: route(axc, p, SERV, 2.4, ':', arrow=True)
for u, v, lab, kind in D.ENTRANCES:
    p = D.xy([(u, v)])[0]
    if kind == 'bldg': axc.plot(*p, marker='v', ms=5, color=RED, zorder=22)
    else: axc.plot(*p, marker='o', ms=11 if kind == 'main' else 8, mfc=RED if kind != 'service' else SERV, mec='white', mew=1.4, zorder=23)
for b in D.BUILDINGS:
    u, v, r = LBL[b['id']]; uvtext(axc, u, v, NAME[b['id']].replace('\n', ' '), 8 if b['id'] != 'B2' else 5.5, r, color='#6A665E', weight='bold')
for (u, v, s, r, c) in [(108, 124, 'ورودی اصلی (از مترو)', 0, RED), (126, 64, 'ورودی شرقی', 90, RED), (39, -5, 'ورودی جنوبی', 0, RED), (-4, 64, 'ورودی غربی', 90, RED), (127, 36, 'سرویس از پورسینا', 90, SERV)]:
    uvtext(axc, u, v, s, 8.5, r, color=c, weight='bold')
uvtext(axc, 60, 65.2, 'خیابانِ دانشکده — محور اصلی', 8.5, 0, color='#1E5FA8', weight='bold')
boundary(axc, 1.2)
legend_rows(fig, 0.495, 0.875, [('line', (PED1, 3.4, '-'), 'مسیر اصلی پیاده'), ('line', (PED2, 1.6, (0, (3, 1.5))), 'مسیر فرعی پیاده')], dy=0.025)
legend_rows(fig, 0.3, 0.875, [('line', (EMER, 1.6, (0, (6, 2, 1, 2))), 'دسترسی اضطراری'), ('line', (SERV, 2.4, ':'), 'سرویس و بارگیری')], dy=0.025)
pages.append(fig)

# ================================================================ ۶ · جدول برنامه
fig = sheet(6, 'برنامه‌ی فیزیکی و جانمایی', 'مساحت‌ها همان مساحت‌های بریف است · ناخالص = هدف طراحی')
axt = fig.add_axes([0.42, 0.1, 0.555, 0.78]); axt.axis('off'); axt.set_xlim(0, 1); axt.set_ylim(0, 1)
cx = {'name': 0.96, 'net': 0.66, 'gross': 0.55, 'where': 0.44}
for k_, t_ in [('name', 'فضا'), ('net', 'خالص (م²)'), ('gross', 'ناخالص (م²)'), ('where', 'محل قرارگیری')]: axt.text(cx[k_], 0.975, t_, fontsize=11, weight='bold', ha='right', va='top')
axt.plot([0, 1], [0.935, 0.935], color=INK, lw=0.9)
BNAME = {b['id']: NAME[b['id']].replace('\n', ' ') for b in D.BUILDINGS}
def where_fa(key):
    out = []
    for b in D.BUILDINGS:
        lv = [LEV[i] for i, fl in enumerate(b['floors']) if any(k == key for k, _ in fl)]
        if lv: out.append(BNAME[b['id']] + ' (' + '، '.join(lv) + ')')
    return '، '.join(out)
yy = 0.9
for k, p in D.P.items():
    axt.add_patch(Rectangle((0.975, yy - 0.017), 0.02, 0.034, fc=KEYCOL[k], ec='none'))
    axt.text(cx['name'], yy, PFA[k], fontsize=10.5, ha='right', va='center')
    axt.text(cx['net'], yy, n(p['net']), fontsize=10.5, ha='right', va='center')
    axt.text(cx['gross'], yy, n(p['gross']), fontsize=10.5, ha='right', va='center', weight='bold')
    axt.text(cx['where'], yy, '\n'.join(textwrap.wrap(where_fa(k), 46)), fontsize=8.6, ha='right', va='center', color='#3A3D42', linespacing=1.4)
    axt.plot([0, 1], [yy - 0.031] * 2, color=LINE, lw=0.5); yy -= 0.064
net, gross = D.totals()
axt.plot([0, 1], [yy + 0.033] * 2, color=INK, lw=0.9)
axt.text(cx['name'], yy, 'جمع کل (۱۲ فضا)', fontsize=11.5, ha='right', va='center', weight='bold')
axt.text(cx['net'], yy, n(net), fontsize=11.5, ha='right', va='center', weight='bold'); axt.text(cx['gross'], yy, n(gross), fontsize=11.5, ha='right', va='center', weight='bold')
# left: group shares + short notes
fig.text(0.39, 0.865, 'سهم گروه‌های عملکردی', fontsize=14, weight='bold', ha='right')
gt = D.group_totals(); yy = 0.82
for g in D.GROUPS:
    w = gt[g]['gross'] / gross
    fig.add_artist(Rectangle((0.39 - 0.25 * w / 0.42, yy - 0.011), 0.25 * w / 0.42, 0.022, transform=fig.transFigure, fc=GC[g], ec='none'))
    fig.text(0.39, yy + 0.022, f"{GFA[g]} — {n(gt[g]['gross'])} م²", fontsize=9.5, ha='right', va='center')
    fig.text(0.39 - 0.25 * w / 0.42 - 0.006, yy, f'{n(round(w * 100, 1), 1)}٪', fontsize=9.5, ha='right', va='center', weight='bold'); yy -= 0.047
fig.text(0.39, 0.485, 'چرا این جانمایی؟', fontsize=14, weight='bold', ha='right')
WHY = ['سالن ورزشی بزرگ‌ترین حجم است؛ در جنوب‌شرق، رو به دانشگاه و پایین‌تر از خیابان قرار گرفت.',
       'آمفی‌تئاتر و ساختمان ورودی رو به پارک‌اند و جلوی صدای کشاورز را می‌گیرند.',
       'کلاس‌ها و کتابخانه در غرب آرام و کنار حیاط آموزشی‌اند.',
       'برنامه با سطح اشغال حدود ۳۱٪ و ۱ تا ۳ طبقه در سایت جا می‌شود.']
yy = 0.455
for t in WHY:
    fig.text(0.39, yy, '•', fontsize=11, ha='right', va='top', color=BLUE); fig.text(0.378, yy, '\n'.join(textwrap.wrap(t, 50)), fontsize=9.6, ha='right', va='top', linespacing=1.5)
    yy -= 0.028 * len(textwrap.wrap(t, 50)) + 0.01
fig.text(0.39, yy - 0.005, 'نیازمند تأیید', fontsize=12, weight='bold', ha='right', color=RED); yy -= 0.035
for t in ['کاربری فضای «سایت» (۸۹ م²) در بریف مشخص نیست.', 'شیب دقیق زمین نیاز به نقشه‌برداری دارد.', 'ضوابط تراکم و پارکینگ در دست نبود.']:
    fig.text(0.39, yy, '• ' + t, fontsize=9.6, ha='right', va='top'); yy -= 0.025
pages.append(fig)

out = os.path.join(D.OUT, 'PE_Faculty_Concept_FA.pdf')
with PdfPages(out) as pdf:
    for f in pages: pdf.savefig(f, facecolor=PAPER)
for i, f in enumerate(pages, 1): f.savefig(os.path.join(os.environ.get('PREVIEW_DIR', '/tmp'), f'fa_{i}.png'), dpi=60, facecolor=PAPER)
print('saved', out)
