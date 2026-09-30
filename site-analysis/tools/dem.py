"""DEM pipeline — SRTM (30 m) elevation via AWS Terrain Tiles (terrarium encoding), zoom 15.
elevation = R*256 + G + B/256 − 32768  (metres). Resampled to a 10 m grid in local metres (origin 35.7065N 51.3930E).
Outputs:
  img/layers/dem_hypso.png   hypsometric tint × hillshade (district window, 3.2 km)
  img/layers/dem_slope.png   slope classes      img/layers/dem_aspect.png  aspect classes
  js/data/dem.js             contours (1 m / 5 m), A–B profile, 3D height grid, stats
Source tiles are cached in /tmp/claude-0/dem."""
import io, json, math, os, urllib.request
import numpy as np
from PIL import Image
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = os.path.join(os.path.dirname(__file__), '..'); os.chdir(ROOT)
CACHE = '/tmp/claude-0/dem'; os.makedirs(CACHE, exist_ok=True)
LAT0, LON0 = 35.7065, 51.3930
KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000
Z = 15
def tile_xy(lat, lon):
    n = 2 ** Z; x = (np.asarray(lon) + 180) / 360 * n
    la = np.radians(np.asarray(lat, float))
    y = (1 - np.log(np.tan(la) + 1 / np.cos(la)) / np.pi) / 2 * n
    return x, y
def fetch(x, y):
    p = f'{CACHE}/{Z}_{x}_{y}.png'
    if not os.path.exists(p):
        urllib.request.urlretrieve(f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{x}/{y}.png', p)
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float64)
    return a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768

R = 2300  # half window (m) — larger than the map so edge filtering does not bias it
lat_min, lat_max = LAT0 - R / KY, LAT0 + R / KY
lon_min, lon_max = LON0 - R / KX, LON0 + R / KX
x0, y0 = tile_xy(lat_max, lon_min); x1, y1 = tile_xy(lat_min, lon_max)
tx = range(int(x0), int(x1) + 2); ty = range(int(y0), int(y1) + 2)
mosaic = np.vstack([np.hstack([fetch(x, y) for x in tx]) for y in ty])
print('tiles', len(tx) * len(ty), 'mosaic', mosaic.shape)

def sample(xl, yl):
    lat = LAT0 + yl / KY; lon = LON0 + xl / KX
    X, Y = tile_xy(lat, lon)
    px = (X - tx[0]) * 256 - 0.5; py = (Y - ty[0]) * 256 - 0.5
    i0 = np.floor(px).astype(int); j0 = np.floor(py).astype(int); fx = px - i0; fy = py - j0
    g = mosaic
    return (g[j0, i0] * (1 - fx) * (1 - fy) + g[j0, i0 + 1] * fx * (1 - fy) + g[j0 + 1, i0] * (1 - fx) * fy + g[j0 + 1, i0 + 1] * fx * fy)

STEP = 10
W0 = 2200
xs0 = np.arange(-W0, W0 + 1, STEP); ys0 = np.arange(W0, -W0 - 1, -STEP)
X0, Y0 = np.meshgrid(xs0, ys0)
from scipy.ndimage import gaussian_filter, median_filter  # noqa: E402
raw = sample(X0, Y0)
# ground surface: SRTM is a surface model (roofs, canopy). Median over ~110 m removes buildings/trees,
# a 100 m Gaussian keeps only the landform (Tehran's alluvial fan).
ground = gaussian_filter(median_filter(raw, size=11), 10)
crop = lambda A: A[(W0 - 1600) // STEP:(W0 + 1600) // STEP + 1, (W0 - 1600) // STEP:(W0 + 1600) // STEP + 1]
xs = np.arange(-1600, 1600 + 1, STEP); ys = np.arange(1600, -1600 - 1, -STEP)
XX, YY = np.meshgrid(xs, ys)
Hm = crop(raw); Hg = crop(ground)
print('surface noise removed (std raw−ground) %.2f m' % float((Hm - Hg).std()))
H = Hg
print('elevation range %.1f–%.1f m' % (H.min(), H.max()))

# ---------- derivatives ----------
dzdx = np.gradient(H, STEP, axis=1); dzdy = -np.gradient(H, STEP, axis=0)   # y north
slope = np.hypot(dzdx, dzdy) * 100   # percent
aspect = (np.degrees(np.arctan2(-dzdx, -dzdy)) + 360) % 360   # direction the slope faces (downhill), 0 = N
az, alt = math.radians(315), math.radians(40)
zf = 7  # vertical exaggeration for the shade only (ground is gentle)
sl = np.arctan(np.hypot(dzdx * zf, dzdy * zf))
hs = np.sin(alt) * np.cos(sl) + np.cos(alt) * np.sin(sl) * np.cos(az - np.arctan2(-dzdx, dzdy))
hs = np.clip(hs, 0, 1)

# ---------- hypsometric tint (warm, like the reference) ----------
lo, hi = math.floor(H.min() / 10) * 10, math.ceil(H.max() / 10) * 10
bands = np.arange(lo, hi + 10, 10)
ramp = np.array([[0xEF, 0xE6, 0xD2], [0xE3, 0xD3, 0xB2], [0xD2, 0xBC, 0x94], [0xBF, 0xA3, 0x7A], [0xA8, 0x8B, 0x66], [0x8E, 0x74, 0x55]], float)
t = np.clip((H - lo) / (hi - lo), 0, 1) * (len(ramp) - 1)
i = np.minimum(t.astype(int), len(ramp) - 2); f = (t - i)[..., None]
col = ramp[i] * (1 - f) + ramp[i + 1] * f
shade = 0.72 + 0.34 * (hs[..., None] - 0.5) * 2
img = np.clip(col * shade, 0, 255).astype(np.uint8)
Image.fromarray(img).resize((img.shape[1] * 2, img.shape[0] * 2), Image.LANCZOS).save('img/layers/dem_hypso.png', optimize=True)

# ---------- slope & aspect classes ----------
SC = [(0, 1.5, '#EDE7D8'), (1.5, 2.5, '#DDCDA8'), (2.5, 3.5, '#C9A874'), (3.5, 5, '#AE7C4C'), (5, 900, '#7A3E2A')]
simg = np.zeros(H.shape + (3,), np.uint8)
for a, b, c in SC:
    m = (slope >= a) & (slope < b); simg[m] = [int(c[k:k + 2], 16) for k in (1, 3, 5)]
Image.fromarray(simg).resize((simg.shape[1] * 2, simg.shape[0] * 2), Image.NEAREST).save('img/layers/dem_slope.png', optimize=True)
AC = ['#6E8FA8', '#8FA7B8', '#C9B98F', '#D9A15A', '#C87941', '#B8574F', '#9E7FA8', '#7F8FB8']  # N NE E SE S SW W NW
aimg = np.zeros(H.shape + (3,), np.uint8)
k = (((aspect + 22.5) % 360) // 45).astype(int)
for j, c in enumerate(AC):
    aimg[k == j] = [int(c[q:q + 2], 16) for q in (1, 3, 5)]
flat = slope < 0.5; aimg[flat] = [0xE9, 0xE6, 0xDF]
Image.fromarray(aimg).resize((aimg.shape[1] * 2, aimg.shape[0] * 2), Image.NEAREST).save('img/layers/dem_aspect.png', optimize=True)

# ---------- contours (local metres) ----------
def contours(levels, win):
    sub = (np.abs(XX) <= win) & (np.abs(YY) <= win)
    r = np.where(sub.any(1))[0]; c = np.where(sub.any(0))[0]
    fig = plt.figure(); cs = plt.contour(XX[r][:, c], YY[r][:, c], H[r][:, c], levels=levels); plt.close(fig)
    out = []
    for lev, segs in zip(cs.levels, cs.allsegs):
        for sgm in segs:
            if len(sgm) < 4: continue
            keep = sgm[::2] if len(sgm) > 60 else sgm
            out.append({'z': float(lev), 'p': [[round(float(x), 1), round(float(y), 1)] for x, y in keep]})
    return out
C5 = contours(np.arange(lo, hi + 5, 5), 1600)
C1 = contours(np.arange(lo, hi + 1, 1), 480)

# ---------- A–B profile: N→S through the site centroid (≈ x 14, y 40) ----------
cx = 14.0
py = np.arange(1500, -1500, -10)
ci = np.argmin(np.abs(xs0 - cx))
prof = np.interp(py, ys0[::-1], ground[::-1, ci]); praw = np.interp(py, ys0[::-1], raw[::-1, ci])
# ---------- 3D grid (±320 m, 8 m) ----------
g3 = np.arange(-320, 321, 8)
G3x, G3y = np.meshgrid(g3, g3[::-1])
from scipy.interpolate import RegularGridInterpolator  # noqa: E402
gi = RegularGridInterpolator((ys0[::-1], xs0), ground[::-1])
H3 = gi(np.c_[G3y.ravel(), G3x.ravel()]).reshape(G3x.shape)

sitepts = [[-48, 90], [43, 100.5], [59.5, 5.5], [-19, -19.5]]
def at(x, y): return float(H[np.argmin(np.abs(ys - y)), np.argmin(np.abs(xs - x))])
stats = {'min': round(float(H.min()), 1), 'max': round(float(H.max()), 1),
         'site': [round(at(x, y), 1) for x, y in sitepts], 'site_c': round(at(14, 40), 1),
         'slope_site': round(float(slope[(np.abs(XX - 14) < 60) & (np.abs(YY - 40) < 60)].mean()), 2), 'aspect_site': round(float(aspect[(np.abs(XX - 14) < 60) & (np.abs(YY - 40) < 60)].mean()), 0), 'noise_std': round(float((Hm - Hg).std()), 2),
         'slope_hist': [round(float(((slope >= a) & (slope < b)).mean() * 100), 1) for a, b, _ in SC]}
DEM = {'src': 'SRTM 30 m via AWS Terrain Tiles (terrarium, z15)', 'step': STEP, 'win': 1600, 'bands': [int(lo), int(hi)],
       'ramp': ['#%02X%02X%02X' % tuple(int(v) for v in c) for c in ramp], 'slopeClasses': [[a, b, c] for a, b, c in SC], 'aspectColors': AC,
       'c5': C5, 'c1': C1, 'profile': {'x': cx, 'y': [int(v) for v in py], 'z': [round(float(v), 1) for v in prof], 'raw': [round(float(v), 1) for v in praw]},
       'grid3': {'n': len(g3), 'step': 8, 'half': 320, 'z': [round(float(v), 1) for v in H3.ravel()]}, 'stats': stats}
with open('js/data/dem.js', 'w') as fh:
    fh.write('/* generated by tools/dem.py — SRTM 30 m (AWS Terrain Tiles), local metres */\nwindow.SA_DEM=' + json.dumps(DEM, separators=(',', ':')) + ';\n')
print(json.dumps(stats), 'contours', len(C5), len(C1), 'size', os.path.getsize('js/data/dem.js'))
