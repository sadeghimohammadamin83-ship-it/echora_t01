"""Sentinel-2 L2A imagery (ESA Copernicus, via the AWS open-data bucket sentinel-cogs) — wide context base.

Scene S2A_39SWV_20250831_1_L2A (cloud 0.007 %). Bands read by HTTP range requests from the COGs:
TCI (true colour, 10 m) and B08 (NIR, 10 m) for NDVI.
Each output is resampled into the project's LOCAL-METRE grid (origin 35.7065N 51.3930E, north up),
so it overlays the OSM vectors exactly:
  img/layers/s2_district_{color,mono,dark}.jpg   x −3000…4200, y −3000…6200 (5 m/px; District 6 + 2.5 km radius)
  img/layers/s2_district_ndvi.png                vegetation (NDVI ≥ 0.25) as a soft mask
  img/layers/s2_tehran_{color,dark}.jpg          all 22 districts (40 m/px)
Placement → js/data/sentinel.js ({x0,y0,x1,y1} in local metres)."""
import json, math, os
import numpy as np, cv2, rasterio
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_origin
from pyproj import Transformer

os.chdir(os.path.join(os.path.dirname(__file__), '..'))
SCENE = 'S2A_39SWV_20250831_1_L2A'
BASE = f'/vsicurl/https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/39/S/WV/2025/8/{SCENE}/'
LAT0, LON0 = 35.7065, 51.3930
KX = 111320 * math.cos(math.radians(LAT0)); KY = 111000
# local-metre plane as a custom CRS: equirectangular around the origin, metres
LOCAL = f'+proj=eqc +lat_ts={LAT0} +lat_0={LAT0} +lon_0={LON0} +x_0=0 +y_0=0 +a=6371000 +b=6371000 +units=m +no_defs'
# the project's local metres use KX/KY; correct the tiny scale difference of the sphere radius
SX = KX / (math.radians(1) * 6371000 * math.cos(math.radians(LAT0))); SY = KY / (math.radians(1) * 6371000)


def warp(band_path, bands, x0, y0, x1, y1, res, resamp=Resampling.cubic):
    w, h = int(round((x1 - x0) / res)), int(round((y1 - y0) / res))
    dst = np.zeros((len(bands), h, w), np.float32)
    # destination transform in eqc metres (undo the KX/KY scale so outputs sit on local metres)
    t = from_origin(x0 / SX, y1 / SY, res / SX, res / SY)
    with rasterio.open(BASE + band_path) as src:
        for i, b in enumerate(bands):
            reproject(rasterio.band(src, b), dst[i], dst_transform=t, dst_crs=LOCAL, resampling=resamp, src_nodata=0, dst_nodata=0)
    return dst


def grade_color(rgb):
    """Sentinel TCI → soft architectural colour: lift shadows, desaturate, warm."""
    a = np.clip(rgb.transpose(1, 2, 0) / 255.0, 0, 1)
    a = a ** 0.85
    L = a.mean(-1, keepdims=True)
    a = L + (a - L) * 0.62
    a = a * np.array([1.03, 1.0, 0.94])
    a = np.clip((a - 0.5) * 1.12 + 0.52, 0, 1)
    return (a * 255).astype(np.uint8)


def duo(rgb, ink, paper, gamma=0.9, contrast=1.1, lift=0.0):
    L = rgb.mean(0) / 255.0
    L = np.clip((L - L.mean()) * contrast + 0.5, 0, 1) ** gamma
    L = lift + (1 - lift) * L
    ink, paper = np.array(ink, np.float32), np.array(paper, np.float32)
    return np.clip(ink + (paper - ink) * L[..., None], 0, 255).astype(np.uint8)


def sharpen(img, amt=0.6, sig=1.2):
    b = cv2.GaussianBlur(img, (0, 0), sig)
    return cv2.addWeighted(img, 1 + amt, b, -amt, 0)


def save(path, rgb, q=86):
    cv2.imwrite(path, cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, q, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])


out = {'scene': SCENE, 'src': 'Copernicus Sentinel-2 L2A (ESA), AWS open data, 31 Aug 2025'}

# ---------- district window (5 m) ----------
D = dict(x0=-3000, y0=-3000, x1=4200, y1=6200, res=5)
tci = warp('TCI.tif', [1, 2, 3], D['x0'], D['y0'], D['x1'], D['y1'], D['res'])
nir = warp('B08.tif', [1], D['x0'], D['y0'], D['x1'], D['y1'], D['res'])[0]
red = warp('B04.tif', [1], D['x0'], D['y0'], D['x1'], D['y1'], D['res'])[0]
col = sharpen(grade_color(tci), 0.55, 1.4)
save('img/layers/s2_district_color.jpg', col)
save('img/layers/s2_district_mono.jpg', sharpen(duo(tci, (0x5A, 0x55, 0x4C), (0xF4, 0xF0, 0xE7), 0.95, 0.8, 0.36), 0.35, 1.4))  # light, low contrast: a ground tone, not a photo
save('img/layers/s2_district_dark.jpg', sharpen(duo(tci, (0x0E, 0x10, 0x12), (0x9E, 0x9B, 0x94), 1.05, 1.15, 0.0), 0.5, 1.4))
ndvi = (nir - red) / np.maximum(nir + red, 1)
veg = np.clip((ndvi - 0.18) / 0.22, 0, 1)
veg = cv2.GaussianBlur((veg * 255).astype(np.uint8), (0, 0), 1.0)
cv2.imwrite('img/layers/s2_district_ndvi.png', veg)
out['district'] = {k: D[k] for k in ('x0', 'y0', 'x1', 'y1')}
out['district']['veg_pct'] = round(float((ndvi > 0.25).mean() * 100), 1)
print('district', col.shape, 'veg %', out['district']['veg_pct'])

# ---------- Tehran window (40 m) ----------
T = dict(x0=-28500, y0=-16500, x1=20500, y1=14500, res=40)
tt = warp('TCI.tif', [1, 2, 3], T['x0'], T['y0'], T['x1'], T['y1'], T['res'], Resampling.average)
save('img/layers/s2_tehran_color.jpg', sharpen(grade_color(tt), 0.4, 1.0))
save('img/layers/s2_tehran_dark.jpg', sharpen(duo(tt, (0x0E, 0x10, 0x12), (0xA8, 0xA5, 0x9E), 1.0, 1.2, 0.0), 0.4, 1.0))
out['tehran'] = {k: T[k] for k in ('x0', 'y0', 'x1', 'y1')}
print('tehran', tt.shape, 'nodata %', round(float((tt[0] == 0).mean() * 100), 1))

with open('js/data/sentinel.js', 'w') as fh:
    fh.write('/* generated by tools/sentinel.py — Sentinel-2 windows in local metres */\nwindow.SA_S2=' + json.dumps(out) + ';\n')
print(out)
