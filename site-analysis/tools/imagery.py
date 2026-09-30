"""Imagery pipeline — turns the raw screenshots into cartographic material (no raw screenshot is used as-is).

1. Google Maps context image (img/source/google_context.webp, 668×737, ≈0.65 m/px):
   - georeferenced to local metres by an affine fit on 5 street-junction / station control points
   - Google labels and pins removed (thin white glyphs → OpenCV inpaint)
   - 2× Lanczos upscale, edge-preserving denoise, gentle unsharp mask
   - graded to a warm monochrome base (paper / ink duotone)
   - vegetation extracted (excess-green + darkness index) → soft mask for the stipple layer
2. Site-scale aerial (img/source/aerial_clean.jpg, 0.1935 m/px): same grading + vegetation mask.
Outputs → img/layers/*.jpg|png, and js/data/imagery.js (placement matrices in local metres, y north).
"""
import json, os
import numpy as np
import cv2

ROOT = os.path.join(os.path.dirname(__file__), '..')
os.chdir(ROOT)
os.makedirs('img/layers', exist_ok=True)

# ---------- control points: Google px  ->  local metres (origin 35.7065N 51.3930E) ----------
CP_PX = np.array([[178, 528], [437, 452], [215, 635], [118, 290], [612, 108]], float)
CP_LM = np.array([[-85.5, -50.0], [78.2, 6.7], [-60.0, -109.0], [-133.0, 110.0], [188.0, 249.0]], float)
W8 = np.array([1, 1, 1, 1, 0.3])  # the metro pin is a symbol, not a surveyed point


def fit_affine(src, dst, w):
    M, b = [], []
    for (x, y), (u, v), k in zip(src, dst, w):
        M += [np.r_[x, y, 1, 0, 0, 0] * k, np.r_[0, 0, 0, x, y, 1] * k]
        b += [u * k, v * k]
    p = np.linalg.lstsq(np.array(M), np.array(b), rcond=None)[0]
    return p.reshape(2, 3)


def svg_matrix(T_lm2px, scale):
    """matrix mapping image px (of an image upscaled by `scale`) -> svg coords (x, -y)."""
    A = np.vstack([T_lm2px, [0, 0, 1]])
    inv = np.linalg.inv(A)                       # px -> local
    S = np.diag([1 / scale, 1 / scale, 1])       # upscaled px -> original px
    F = np.diag([1, -1, 1])                      # local -> svg
    M = F @ inv @ S
    return [round(float(v), 6) for v in (M[0, 0], M[1, 0], M[0, 1], M[1, 1], M[0, 2], M[1, 2])]


def grade(bgr, lift=0.10, gamma=0.92, contrast=0.82, tint=((0x2A, 0x27, 0x23), (0xF3, 0xEF, 0xE6))):
    """luminance -> tone curve -> warm duotone (ink→paper)."""
    L = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)[:, :, 0].astype(np.float32) / 255
    L = np.clip((L - 0.5) * contrast + 0.5, 0, 1) ** gamma
    L = lift + (1 - lift) * L
    ink, paper = np.array(tint[0][::-1], np.float32), np.array(tint[1][::-1], np.float32)
    out = ink[None, None] + (paper - ink)[None, None] * L[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)


def veg_mask(bgr, mode, min_area):
    """tree canopy mask.
    aerial: canopy is dark and green-shifted (G−R ≥ 5, G−B ≥ 3); asphalt shadows are neutral.
    google: colour is not separable from shadow, so canopy = dark + strongly textured at 15 px; shadows are smooth."""
    f = bgr.astype(np.float32)
    B, G, R = f[..., 0], f[..., 1], f[..., 2]
    V = f.max(-1)
    L = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    if mode == 'aerial':
        m = ((V < 115) & (G - R >= 5) & (G - B >= 3)).astype(np.uint8) * 255
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    else:
        k = 15
        mu = cv2.blur(L, (k, k)); sd = np.sqrt(np.maximum(cv2.blur(L * L, (k, k)) - mu * mu, 0))
        m = ((mu < 105) & (sd > 13)).astype(np.uint8) * 255
        m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))
        m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    keep = np.zeros(n, bool); keep[1:] = st[1:, cv2.CC_STAT_AREA] >= min_area
    m = (keep[lab] * 255).astype(np.uint8)
    return cv2.GaussianBlur(m, (0, 0), 1.5)


# ================= 1. Google context image =================
g = cv2.imread('img/source/google_context.webp', cv2.IMREAD_COLOR)
T = fit_affine(CP_LM, CP_PX, W8)
res = np.array([T @ np.r_[x, y, 1] - p for (x, y), p in zip(CP_LM, CP_PX)])
mpp = 1 / np.sqrt(abs(np.linalg.det(T[:, :2])))
print('google: m/px %.3f  residuals px' % mpp, np.round(np.hypot(*res.T), 1))

# labels & pins: bright, low-saturation, thin -> inpaint
hsv = cv2.cvtColor(g, cv2.COLOR_BGR2HSV)
white = ((hsv[..., 2] > 222) & (hsv[..., 1] < 40)).astype(np.uint8)
thick = cv2.morphologyEx(white, cv2.MORPH_OPEN, np.ones((6, 6), np.uint8))   # roofs survive, glyphs don't
glyph = cv2.dilate(white & (1 - thick), np.ones((3, 3), np.uint8), iterations=2)
blue = ((hsv[..., 0] > 95) & (hsv[..., 0] < 130) & (hsv[..., 1] > 60) & (hsv[..., 2] > 60)).astype(np.uint8)  # blue label text
glyph = np.clip(glyph + cv2.dilate(blue, np.ones((3, 3), np.uint8), iterations=2), 0, 1)
clean = cv2.inpaint(g, glyph * 255, 4, cv2.INPAINT_TELEA)
cv2.imwrite('/tmp/claude-0/geo/clean.png', clean)

SC = 2
up = cv2.resize(clean, None, fx=SC, fy=SC, interpolation=cv2.INTER_LANCZOS4)
up = cv2.bilateralFilter(up, 7, 28, 7)
blur = cv2.GaussianBlur(up, (0, 0), 1.6)
up = cv2.addWeighted(up, 1.45, blur, -0.45, 0)
cv2.imwrite('img/layers/context_base.jpg', grade(up), [cv2.IMWRITE_JPEG_QUALITY, 86, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
cv2.imwrite('img/layers/context_dark.jpg', grade(up, lift=0.02, contrast=0.9, tint=((0x10, 0x12, 0x14), (0x9A, 0x98, 0x92))), [cv2.IMWRITE_JPEG_QUALITY, 84])
vm = veg_mask(cv2.resize(clean, None, fx=SC, fy=SC, interpolation=cv2.INTER_CUBIC), 'google', min_area=900)
cv2.imwrite('img/layers/context_veg.png', vm)
print('context vegetation share %.1f%%' % (100 * (vm > 127).mean()))

# ================= 2. Site-scale aerial =================
a = cv2.imread('img/source/aerial_clean.jpg', cv2.IMREAD_COLOR)
a2 = cv2.bilateralFilter(a, 7, 24, 7)
blur = cv2.GaussianBlur(a2, (0, 0), 1.4)
a2 = cv2.addWeighted(a2, 1.35, blur, -0.35, 0)
cv2.imwrite('img/layers/aerial_base.jpg', grade(a2), [cv2.IMWRITE_JPEG_QUALITY, 86, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
cv2.imwrite('img/layers/aerial_dark.jpg', grade(a2, lift=0.02, contrast=0.9, tint=((0x10, 0x12, 0x14), (0x9A, 0x98, 0x92))), [cv2.IMWRITE_JPEG_QUALITY, 84])
va = veg_mask(a, 'aerial', min_area=250)
cv2.imwrite('img/layers/aerial_veg.png', va)
print('aerial vegetation share %.1f%%' % (100 * (va > 127).mean()))

# tree points for the 3D model: sample the canopy masks on a jittered grid (local metres)
AT = {'s': 5.168759068675158, 'tx': 742.4278468197945, 'ty': 812.0903286824436}  # aerial georeference (data/geo/T.json)
rng = np.random.default_rng(7)
trees = []
for y in np.arange(-87, 157, 5.5):
    for x in np.arange(-143, 106, 5.5):
        jx, jy = x + rng.uniform(-1.8, 1.8), y + rng.uniform(-1.8, 1.8)
        u, v = int(AT['s'] * jx + AT['tx']), int(-AT['s'] * jy + AT['ty'])
        if 0 <= u < va.shape[1] and 0 <= v < va.shape[0] and va[v, u] > 160:
            trees.append([round(jx, 1), round(jy, 1)])
Ainv = np.linalg.inv(np.vstack([T, [0, 0, 1]]))
for y in np.arange(-260, 300, 8):
    for x in np.arange(-260, 300, 8):
        if -143 <= x <= 106 and -87 <= y <= 157: continue
        jx, jy = x + rng.uniform(-2.5, 2.5), y + rng.uniform(-2.5, 2.5)
        u, v = (T @ np.r_[jx, jy, 1]) * SC
        u, v = int(u), int(v)
        if 0 <= u < vm.shape[1] and 0 <= v < vm.shape[0] and vm[v, u] > 170:
            trees.append([round(jx, 1), round(jy, 1)])
print('tree points', len(trees))
aer = {'w': a.shape[1], 'h': a.shape[0]}
out = {
    'context': {'w': g.shape[1] * SC, 'h': g.shape[0] * SC, 'm': svg_matrix(T, SC), 'mpp': round(float(mpp), 3),
                'cp': len(CP_PX), 'res_m': round(float(np.hypot(*res.T).mean() * mpp), 1)},
    'trees': trees,
    'veg': {'context': round(float((vm > 127).mean() * 100), 1), 'aerial': round(float((va > 127).mean() * 100), 1)},
}
with open('js/data/imagery.js', 'w') as fh:
    fh.write('/* generated by tools/imagery.py — placement of processed imagery (svg matrix: image px -> (x,-y) local m) */\n')
    fh.write('window.SA_IMGRY=' + json.dumps(out) + ';\n')
print(out)
