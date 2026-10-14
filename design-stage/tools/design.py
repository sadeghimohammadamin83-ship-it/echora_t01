"""Design data for the PE Faculty concept site plan — one source of truth for the DXF, the sheets and the checks.

Geometry is defined in a SITE GRID (u, v) aligned with Poursina St / Jalalieh (19.2°), origin at the south-west
corner of the site boundary (Poursina × Enayat). u → east-north-east along Poursina, v → north-north-west along
Jalalieh. All units are metres; xy() converts to the drawing's own coordinates (DXF model space, metres).

The site boundary is NOT redrawn: it is assembled from the vertices of the existing road-edge polyline
(TPX_ROADS_CONTOURS, ring #65 of the source drawing), following the block the user marked in red."""
import math, os
import numpy as np
import ezdxf
from shapely.geometry import Polygon, Point, LineString

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'source', 'site_source.dxf')
OUT = os.path.join(HERE, '..', 'output')

# ---------------------------------------------------------------- site grid
O = np.array([295.51, 224.15])              # SW corner of the boundary (source vertex, ring 65 #46)
TH = math.radians(19.2)                     # bearing of Poursina (source edge 40→39 = 199.2° − 180°)
U = np.array([math.cos(TH), math.sin(TH)]); V = np.array([-math.sin(TH), math.cos(TH)])


def xy(Q):
    Q = np.atleast_2d(np.array(Q, float)); return O + np.outer(Q[:, 0], U) + np.outer(Q[:, 1], V)


def uv(X):
    X = np.atleast_2d(np.array(X, float)) - O; return np.c_[X @ U, X @ V]


def rect(u0, v0, u1, v1):
    return [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]


# ---------------------------------------------------------------- source geometry (read-only)
_doc = None


def source():
    global _doc
    if _doc is None: _doc = ezdxf.readfile(SRC)
    return _doc


RING = 65                                   # index of the road-edge ring that encloses the block
ORDER = [7] + list(range(14, 29)) + [38, 39, 40, 46, 45, 8]   # outer road edges; dead-end lanes absorbed
LANES = {                                    # dead-end lanes inside the block (vertex ranges of the same ring)
    'Hedayati lane (retained)': list(range(7, 14)),
    "Zare' lane (becomes Faculty Street)": list(range(28, 39)),
    'Enayat lane (retained)': list(range(40, 47)),
}


def ring_vertices():
    e = list(source().modelspace().query('LWPOLYLINE[layer=="TPX_ROADS_CONTOURS"]'))[RING]
    return [tuple(p[:2]) for p in e.get_points('xy')]


def site_xy():
    Vt = ring_vertices(); return [Vt[i] for i in ORDER]


def lanes_xy():
    Vt = ring_vertices(); return {k: [Vt[i] for i in idx] for k, idx in LANES.items()}


def trees():
    """existing individual trees (source blocks TREE…_CR###: crown radius = ### / 10 m)"""
    out = []
    for e in source().modelspace().query('INSERT[layer=="TPX_VEGETATION_TREES_INDIVIDUAL"]'):
        r = int(e.dxf.name.split('CR')[-1]) / 10.0
        out.append((e.dxf.insert.x, e.dxf.insert.y, r))
    return out


# ---------------------------------------------------------------- program (brief — do not edit areas)
PROGRAM = [  # key, English, Persian, net, gross, group
    ('CL', 'Theoretical classrooms', 'کلاس‌های تئوری', 820, 1194, 'Academic'),
    ('SH', 'Multipurpose sports hall', 'سالن ورزشی چندمنظوره', 2392, 3229, 'Sports'),
    ('AU', 'Auditorium', 'آمفی‌تئاتر', 855, 1154, 'Assembly'),
    ('LB', 'Library', 'کتابخانه', 161, 217, 'Academic'),
    ('AS', 'Secondary assembly hall', 'سالن اجتماعات', 381, 512, 'Assembly'),
    ('WL', 'Workshop & laboratory hall', 'سالن کارگاه و آزمایشگاه', 160, 216, 'Academic'),
    ('ST', '"Site" (سایت) — function unresolved', 'سایت (نامشخص)', 66, 89, 'Unresolved'),
    ('AD', 'Administrative rooms', 'اتاق‌های اداری', 184, 249, 'Administration'),
    ('PR', 'Presidency & vice-presidency', 'ریاست و معاونت‌ها', 251, 340, 'Administration'),
    ('RW', 'Recreational / staff welfare', 'تفریحی / رفاهی', 116, 160, 'Amenity'),
    ('CF', 'Cafeteria / buffet', 'بوفه', 258, 348, 'Amenity'),
    ('WC', 'Toilets', 'سرویس‌های بهداشتی', 115, 156, 'Services'),
]
P = {p[0]: dict(key=p[0], en=p[1], fa=p[2], net=p[3], gross=p[4], group=p[5]) for p in PROGRAM}
GROUPS = ['Sports', 'Assembly', 'Academic', 'Administration', 'Amenity', 'Services', 'Unresolved']

# ---------------------------------------------------------------- buildings (u, v in metres)
# Each floor lists (program key, m² of that item's gross on this floor). The checks below prove that every
# item's gross is placed exactly once and that no floor holds more than its footprint.
BUILDINGS = [
    dict(id='B1', name='SPORTS HALL', fa='سالن ورزشی', poly=rect(46.5, 20.0, 97.5, 59.2), h=12.0, zone='Sports',
         note='hall floor set ≈1.5 m below street (site falls N→S); ancillary bar (changing, fitness, coaches) on the north side facing the Faculty Street; north clerestory light',
         floors=[[('SH', 1999)], [('SH', 810)], [('SH', 420)]]),
    dict(id='B2', name='WORKSHOP & LAB', fa='کارگاه و آزمایشگاه', poly=rect(32.0, 22.1, 46.5, 37.0), h=5.0, zone='Academic',
         note='attached to the hall (sports-science lab); service from the Poursina walk',
         floors=[[('WL', 216)]]),
    dict(id='B3', name='ACADEMIC WING', fa='بال آموزشی', poly=rect(18.0, 22.0, 32.0, 59.2), h=12.0, zone='Academic',
         note='classrooms open east to the Learning Court; closed, shaded west facade to the residential edge; library at the north end on the street',
         floors=[[('LB', 217), ('ST', 89), ('WC', 52), ('CL', 163)], [('CL', 521)], [('CL', 510)]]),
    dict(id='B4', name='AUDITORIUM', fa='آمفی‌تئاتر', poly=rect(28.0, 68.0, 56.0, 102.3), h=13.0, zone='Assembly',
         note='blank north wall shields the campus from Keshavarz; foyer on the Faculty Street; event egress to the West Garden',
         floors=[[('AU', 960)], [('AU', 194), ('WC', 52)]]),
    dict(id='B5', name='GATEWAY BUILDING', fa='ساختمان ورودی', poly=rect(76.5, 72.0, 100.5, 97.7), h=13.5, zone='Administration',
         note='GF cafeteria + staff welfare on the Entry Plaza and the court; L1 secondary assembly hall; L2 administration with controlled presidency suite',
         floors=[[('CF', 348), ('RW', 160), ('WC', 26)], [('AS', 512)], [('AD', 249), ('PR', 340), ('WC', 26)]]),
]

# ---------------------------------------------------------------- open space, landscape, circulation
OPEN = [  # id, name, polygon (u, v), kind
    ('O1', 'ENTRY PLAZA · PARK GATE', [(76.5, 97.7), (100.5, 97.7), (104.0, 102.0), (116.6, 104.0), (116.6, 118.9), (91.2, 119.4), (78.0, 106.0), (76.5, 106.0)], 'plaza'),
    ('O2', 'FACULTY STREET (former Zare\' lane)', [(12.0, 59.2), (97.5, 59.2), (97.5, 56.5), (116.0, 56.5), (116.0, 68.0), (100.5, 68.0), (100.5, 72.0), (76.5, 72.0), (76.5, 73.0), (56.0, 73.0), (56.0, 68.0), (12.0, 68.0)], 'street'),
    ('O3', 'OUTDOOR COURT 15 × 28 (long axis N–S)', rect(57.0, 73.0, 75.0, 105.0), 'court'),
    ('O4', 'LEARNING COURT (quiet)', rect(32.0, 37.0, 46.5, 59.2), 'garden'),
    ('O5', 'WEST GARDEN (residential buffer)', [(10.0, 68.0), (28.0, 68.0), (28.0, 106.0), (12.0, 108.0)], 'garden'),
    ('O6', 'PARK EDGE GARDEN · acoustic berm + plane trees', [(10.0, 108.0), (28.0, 106.0), (56.0, 106.0), (78.0, 106.0), (91.2, 119.4), (61.6, 121.4), (44.9, 123.0), (27.1, 125.8), (8.0, 129.0)], 'buffer'),
    ('O7', 'POURSINA PLANE-TREE WALK', [(14.0, 1.0), (113.5, 1.0), (114.0, 19.0), (97.5, 19.0), (97.5, 20.0), (46.5, 20.0), (46.5, 22.1), (18.0, 22.0), (14.0, 22.0)], 'walk'),
    ('O8', 'JALALIEH EDGE · retained trees', [(97.5, 19.0), (114.0, 19.0), (115.0, 56.5), (110.0, 56.5), (110.0, 48.0), (97.5, 48.0)], 'buffer'),
    ('O9', 'COURT TERRACE (café, existing trees)', [(100.5, 68.0), (116.0, 68.0), (116.4, 103.2), (104.0, 102.0), (100.5, 97.7)], 'garden'),
]
SERVICE_YARD = rect(97.5, 49.5, 106.5, 55.4)                # one-van loading bay, clear of the retained trees

PED = {  # polylines (u, v): primary / secondary
    'primary': [
        [(112.0, 118.0), (100.0, 104.0), (88.0, 97.0)],                        # park corner → gateway
        [(116.5, 62.0), (12.0, 63.5)],                                         # Faculty Street (Jalalieh → west lanes)
        [(88.0, 98.0), (75.8, 99.0), (75.8, 62.7)],                            # plaza → street along the court
    ],
    'secondary': [
        [(14.0, 11.0), (113.0, 11.0)],                                         # Poursina walk
        [(39.0, 11.0), (39.0, 21.0)],                                          # Poursina walk → workshop / Learning Court
        [(116.5, 62.0), (115.5, 30.0), (114.5, 11.0)],                         # Jalalieh footway: Faculty Street → Poursina walk (UT)
        [(12.0, 63.5), (8.0, 63.0)],                                           # west link to Hedayati / Zare'-south lanes
        [(26.0, 63.3), (20.0, 74.0), (20.0, 90.0), (24.0, 110.0)],             # West Garden walk: street → auditorium egress → park edge
    ],
}
SERVICE = [[(118.5, 57.5), (112.0, 57.0), (106.5, 54.5)]]                    # Jalalieh (entered from Poursina) → service yard
EMERGENCY = [[(116.5, 61.0), (60.0, 61.0)]]                                  # fire / ambulance lane along the Faculty Street
ENTRANCES = [  # (u, v, label, kind)
    (110.0, 116.0, 'MAIN ENTRANCE · park corner', 'main'),
    (116.0, 62.0, 'EAST GATE · Jalalieh (from UT / metro)', 'secondary'),
    (8.5, 63.2, 'WEST GATE · neighbourhood lanes', 'secondary'),
    (39.0, 2.0, 'SOUTH GATE · Poursina (UT)', 'secondary'),
    (72.0, 59.2, 'hall', 'bldg'), (42.0, 68.0, 'auditorium', 'bldg'), (88.0, 97.7, 'gateway', 'bldg'),
    (76.5, 80.0, 'café', 'bldg'), (28.0, 86.0, 'auditorium egress', 'bldg'), (25.0, 59.2, 'academic', 'bldg'), (39.0, 22.1, 'workshop', 'bldg'),
    (118.0, 58.0, 'SERVICE · via Jalalieh from Poursina', 'service'),
]


# ---------------------------------------------------------------- derived numbers
def bpoly(b): return Polygon(xy(b['poly']))


def open_poly(poly):
    return Polygon(xy(poly)).intersection(Polygon(site_xy()))


def floor_area(b): return Polygon(b['poly']).area


def placed():
    out = {k: 0 for k in P}
    for b in BUILDINGS:
        for fl in b['floors']:
            for k, a in fl: out[k] += a
    return out


def group_totals():
    g = {k: dict(net=0, gross=0) for k in GROUPS}
    for p in P.values(): g[p['group']]['net'] += p['net']; g[p['group']]['gross'] += p['gross']
    return g


def totals():
    return sum(p['net'] for p in P.values()), sum(p['gross'] for p in P.values())


def where(key):
    out = []
    for b in BUILDINGS:
        for i, fl in enumerate(b['floors']):
            for k, a in fl:
                if k == key: out.append(f"{b['id']} {('GF', 'L1', 'L2', 'L3')[i]} ({a})")
    return out
