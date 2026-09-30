"""Build js/data/geo.js and the optimised images from the v1 project (site-analysis-pe-faculty).

Usage:  SRC=/path/to/unzipped/parts python3 tools/prepare.py
SRC holds the six unzipped parts (1_core … 6_apple_maps_screens) side by side.
Every coordinate written to geo.js is in LOCAL METRES: origin 35.7065 N, 51.3930 E, x = east, y = north.
Nothing is invented here: geometry comes from OSM (osm.py, roads.py, districts.json), the user's
annotated aerial (streets drawn in px, converted with the fitted georeference T.json) and the traced
building masses of v1 (bldg.py). Areas below are computed from those polygons.
"""
import glob, json, math, os, sys
import numpy as np
from PIL import Image

SRC = os.environ.get('SRC', '/tmp/claude-0/src')
OUT = os.path.join(os.path.dirname(__file__), '..')
core = glob.glob(f'{SRC}/*1_core/site-analysis-pe-faculty')[0]
sys.path.insert(0, f'{core}/data/geo'); sys.path.insert(0, f'{core}/src')
from osm import SL, POLY            # noqa: E402
from roads import R, STATIONS       # noqa: E402
from bldg import TR                 # noqa: E402

T = json.load(open(f'{core}/data/geo/T.json'))
S, TX, TY = T['s'], T['tx'], T['ty']
def p2l(u, v): return [round((u - TX) / S, 1), round(-(v - TY) / S, 1)]
def r1(pts): return [[round(x, 1), round(y, 1)] for x, y in pts]

# ---- streets at site scale (user colour code). Keshavarz/Zare/Hedayati follow the user's strokes (px).
PX = {
    'Keshavarz': [(0, 306), (430, 298), (965, 198), (1290, 137)],
    'Zare': [(525, 645), (790, 575), (1052, 500)],
    'ZareS': [(533, 655), (560, 760)],
    'Hedayati': [(468, 388), (496, 520), (522, 648)],
}
streets = {k: [p2l(*p) for p in v] for k, v in PX.items()}
for k in ['Jalalieh', 'Enayat', 'Poursina', '16Azar', 'Oghab', 'Yekom', 'DavoodTaheri', 'Nosrat', 'Qods',
          'Kargar', 'BahmanOrouji', 'KeshS', 'KeshN']:
    streets[k] = r1(SL[k])

site = json.load(open(f'{core}/data/geo/site_poly.json'))
site_local = r1(site['local'])

def area(P):
    a = 0
    for i in range(len(P)):
        x1, y1 = P[i]; x2, y2 = P[(i + 1) % len(P)]; a += x1 * y2 - x2 * y1
    return abs(a) / 2

# ---- land-use features. use: class key; src: evidence; unc: uncertain flag
LU = {
    'ut_campus': ('edu', 'OSM — University of Tehran central campus', 0),
    'fac_med_sci': ('edu', 'OSM — TUMS faculty buildings', 0),
    'uni_1168538981': ('edu', 'OSM building=university', 0), 'uni_1168538982': ('edu', 'OSM building=university', 0),
    'uni_1168538983': ('edu', 'OSM building=university', 0), 'uni_1168538984': ('edu', 'OSM building=university', 0),
    'ibn_sina_hall': ('cult', 'OSM community_centre + photo sign «تالار ابن‌سینا»', 0),
    'boulevard_hotel': ('com', 'OSM «هتل و رستوران بلوار» + photo 8 sign', 0),
    'site_parking': ('park', 'OSM parking (way 1108089956) — photos 10, 11', 0),
    'tums_parking': ('park', 'OSM parking + photo 7 sign', 0),
    'laleh_park': ('green', 'OSM park — Laleh Park, 35 ha', 0),
    'fire_station': ('pub', 'OSM «ایستگاه آتش نشانی»', 0),
    'crisis_shelter': ('pub', 'OSM «سوله بحران»', 0),
    'bldg_1136501884': ('unk', 'OSM building (no use tag)', 1),
    'apt_1204729721': ('res', 'OSM building=apartments', 0),
}
for k in POLY:
    if k.startswith('apt_') and k not in LU:
        LU[k] = ('res', 'OSM building=apartments', 0)
TRU = {
    'se_inst': ('edu', 'Traced — History of Science research institute (gate sign, photo 6)', 0),
    'e_arch': ('edu', 'Traced — Institute of Archaeology, UT (sign, est. 1338)', 0),
    'e_hotel': ('com', 'Traced — Boulevard Hotel block', 0),
    'w_long': ('unk', 'Traced — large-span white roof; use not verified', 1),
    'w_1': ('edu', 'Traced — Faculty of Pharmacy (OSM POI); approximate', 1),
    'w_2': ('edu', 'Traced — Faculty of Pharmacy (OSM POI); approximate', 1),
    'e_1': ('unk', 'Traced — use not verified', 1), 'e_2': ('unk', 'Traced — use not verified', 1),
    'e_3': ('unk', 'Traced — use not verified', 1),
}
for k in TR:
    if k.startswith('w_') and k not in TRU:
        TRU[k] = ('res', 'Traced — residential fabric (photos 2, 5, 11); approximate', 1)
    if k.startswith('site_'):
        TRU[k] = ('site', 'Traced — existing low building inside the site (to be demolished)', 0)

NAMES = {
    'ut_campus': 'University of Tehran — central campus', 'fac_med_sci': 'TUMS faculty buildings',
    'ibn_sina_hall': 'Ibn Sina Hall', 'boulevard_hotel': 'Boulevard Hotel', 'site_parking': 'Existing parking (site)',
    'tums_parking': 'TUMS private parking', 'laleh_park': 'Laleh Park', 'fire_station': 'Fire station',
    'crisis_shelter': 'Crisis-management hall', 'se_inst': 'History of Science Institute', 'e_arch': 'Institute of Archaeology',
    'e_hotel': 'Boulevard Hotel', 'w_long': 'Large-span building', 'w_1': 'Faculty of Pharmacy (approx.)',
    'w_2': 'Faculty of Pharmacy (approx.)',
}
NAMES_FA = {
    'ut_campus': 'پردیس مرکزی دانشگاه تهران', 'fac_med_sci': 'دانشکده‌های علوم پزشکی', 'ibn_sina_hall': 'تالار ابن‌سینا',
    'boulevard_hotel': 'هتل بلوار', 'site_parking': 'پارکینگ فعلی (سایت)', 'tums_parking': 'پارکینگ اختصاصی علوم پزشکی',
    'laleh_park': 'بوستان لاله', 'fire_station': 'ایستگاه آتش‌نشانی', 'crisis_shelter': 'سوله‌ی مدیریت بحران',
    'se_inst': 'پژوهشکده تاریخ علم', 'e_arch': 'مؤسسه باستان‌شناسی', 'e_hotel': 'هتل بلوار',
    'w_long': 'بنای بزرگ‌دهانه (کاربری نامشخص)', 'w_1': 'دانشکده داروسازی (تقریبی)', 'w_2': 'دانشکده داروسازی (تقریبی)',
}
feats = []
for k, P in POLY.items():
    u, src, unc = LU[k]
    kind = 'parcel' if k in ('ut_campus', 'laleh_park', 'site_parking', 'tums_parking') else 'bldg'
    feats.append(dict(id=k, use=u, kind=kind, src=src, unc=unc, name=NAMES.get(k, ''), fa=NAMES_FA.get(k, ''), pts=r1(P)))
for k, P in TR.items():
    u, src, unc = TRU[k]
    feats.append(dict(id=k, use=u, kind='bldg', src=src, unc=unc, name=NAMES.get(k, ''), fa=NAMES_FA.get(k, ''),
                      pts=[p2l(*q) for q in P]))

# ---- land-use shares in the aerial frame (raster sample, 1 m). Priority: specific building > parcel.
x0, x1 = -TX / S, (1290 - TX) / S; y1, y0 = TY / S, -(1264 - TY) / S
xs, ys = np.meshgrid(np.arange(x0, x1, 1.0) + .5, np.arange(y0, y1, 1.0) + .5)
def pip(P, X, Y):
    P = np.asarray(P, float); inside = np.zeros(X.shape, bool); j = len(P) - 1
    for i in range(len(P)):
        xi, yi = P[i]; xj, yj = P[j]
        c = ((yi > Y) != (yj > Y)) & (X < (xj - xi) * (Y - yi) / (yj - yi + 1e-12) + xi)
        inside ^= c; j = i
    return inside
lab = np.full(xs.shape, '', dtype=object)
order = [f for f in feats if f['kind'] == 'parcel' and f['use'] != 'edu'] + [f for f in feats if f['id'] == 'ut_campus'] \
    + [f for f in feats if f['kind'] == 'bldg']
for f in order:
    m = pip(f['pts'], xs, ys); lab[m] = f['use']
insite = pip(site_local, xs, ys)
tot = lab.size
shares = {u: round(float((lab == u).sum()) / tot * 100, 1) for u in ['res', 'edu', 'cult', 'com', 'pub', 'park', 'green', 'unk', 'site']}
shares['open'] = round(100 - sum(shares.values()), 1)
frame = dict(x0=round(x0, 1), x1=round(x1, 1), y0=round(y0, 1), y1=round(y1, 1), area_m2=int(tot))
bld = np.zeros(xs.shape, bool)
for f in feats:
    if f['kind'] == 'bldg' and f['use'] != 'site':
        bld |= pip(f['pts'], xs, ys)
sb = np.zeros(xs.shape, bool)
for f in feats:
    if f['use'] == 'site': sb |= pip(f['pts'], xs, ys)
print('site area', area(site_local), 'land use', shares, 'site built', sb[insite].mean())

# ---- districts (x100 m) & Iran provinces (lon/lat, simplified)
D = json.load(open(f'{core}/data/geo/districts.json'))
districts = {k: [[v[i] * 100, v[i + 1] * 100] for i in range(0, len(v), 2)] for k, v in D['o'].items()}
def rdp(P, eps):
    P = np.asarray(P, float)
    if len(P) < 3: return P.tolist()
    a, b = P[0], P[-1]; d = b - a; n = np.hypot(*d)
    dist = np.abs((d[0] * (P - a)[:, 1] - d[1] * (P - a)[:, 0])) / n if n else np.hypot(*(P - a).T)
    i = int(np.argmax(dist))
    if dist[i] > eps:
        return rdp(P[:i + 1], eps)[:-1] + rdp(P[i:], eps)
    return [a.tolist(), b.tolist()]
g = json.load(open(f'{core}/data/geo/iran_prov.geojson'))
prov = []
for f in g['features']:
    geom = f['geometry']; polys = geom['coordinates'] if geom['type'] == 'MultiPolygon' else [geom['coordinates']]
    rings = []
    for p in polys:
        r = rdp(p[0], 0.04)
        if len(r) > 3: rings.append([[round(x, 2), round(y, 2)] for x, y in r])
    prov.append(dict(n=f['properties']['name'], r=rings))
roads = {k: dict(c=t, p=[[c[i], c[i + 1]] for i in range(0, len(c), 2)]) for k, (t, c) in R.items()}
stations = [dict(en=a, fa=b, line=c, p=list(p)) for a, b, c, p in STATIONS]
sun = json.load(open(f'{core}/data/geo/sun_info.json'))

GEO = dict(
    origin=[35.7065, 51.3930], aerial=dict(s=S, tx=TX, ty=TY, w=1290, h=1264),
    site=site_local, siteArea=round(area(site_local)), streets=streets, features=feats,
    landuse=dict(frame=frame, shares=shares, siteBuilt=round(float(sb[insite].mean()) * 100),
                 coverage=round(float(bld[~insite & (ys < 93.2)].mean()) * 100)),
    districts=districts, districtArea=D['areas_km2'], iran=prov, roads=roads, stations=stations, sun=sun,
)
os.makedirs(f'{OUT}/js/data', exist_ok=True)
with open(f'{OUT}/js/data/geo.js', 'w', encoding='utf8') as fh:
    fh.write('/* generated by tools/prepare.py — local metres, origin 35.7065N 51.3930E (x=east, y=north) */\n')
    fh.write('window.SA_GEO=' + json.dumps(GEO, ensure_ascii=False, separators=(',', ':')) + ';\n')

# ---- images
def save(src, dst, maxpx, q=80):
    im = Image.open(src).convert('RGB'); im.thumbnail((maxpx, maxpx), Image.LANCZOS)
    im.save(dst, 'JPEG', quality=q, optimize=True, progressive=True); return im.size
sizes = {}
raw = f'{core}/data/raw'
sizes['aerial_clean'] = save(f'{raw}/aerial_clean.jpg', f'{OUT}/img/source/aerial_clean.jpg', 1290, 84)
sizes['aerial_annotated'] = save(f'{raw}/aerial_annotated.jpg', f'{OUT}/img/source/aerial_annotated.jpg', 1290, 82)
sizes['key_map'] = save(f'{raw}/photo_key_map.jpg', f'{OUT}/img/source/photo_key_map.jpg', 1800, 80)
for f in sorted(glob.glob(f'{SRC}/*6_apple*/**/IMG_*.jpg', recursive=True)):
    n = os.path.basename(f)[:-4]
    sizes[n] = save(f, f'{OUT}/img/source/{n}.jpg', 1600, 74)
    save(f, f'{OUT}/img/thumbs/{n}.jpg', 420, 72)
for f in sorted(glob.glob(f'{SRC}/*5_photos*/**/pdf_page_*.jpg', recursive=True)):
    n = os.path.basename(f)[:-4]
    if n == 'pdf_page_01': continue
    sizes[n] = save(f, f'{OUT}/img/photos/{n}.jpg', 1500, 76)
    save(f, f'{OUT}/img/thumbs/{n}.jpg', 460, 70)
for f in sorted(glob.glob(f'{SRC}/*2_figures*/**/photos_cropped/*.jpg', recursive=True)):
    n = os.path.basename(f)[:-4]
    save(f, f'{OUT}/img/thumbs/crop_{n}.jpg', 520, 74)
with open(f'{OUT}/js/data/images.js', 'w') as fh:
    fh.write('/* generated by tools/prepare.py — pixel sizes of the optimised images */\n')
    fh.write('window.SA_IMG=' + json.dumps({k: list(v) for k, v in sizes.items()}) + ';\n')
print('done')
