# -*- coding: utf-8 -*-
"""
Ramsar urban services — OSM extraction, per-capita and coverage maps (Maps 1–10).

Run on a machine with internet access:
    pip install requests geopandas shapely pyproj matplotlib
    python ramsar_osm_services.py                 # downloads OSM via Overpass
    python ramsar_osm_services.py --cache osm.json   # re-use a saved download

Outputs (folder ./out):
    services.csv            every feature: category, name, area_m2, lon, lat
    per_capita.csv          area and count per category, m²/person vs. standard
    coverage.csv            share of building floor area (population proxy) inside each buffer
    map01_green.png ... map10_composite.png

Method
- Study area: bounding box around the Ramsar city built-up strip (edit BBOX).
  The legal city boundary is a DATA GAP; replace BBOX with the official boundary
  shapefile when the municipality supplies it (--boundary file.shp).
- Population proxy: the 1395 city population (35,997, Statistical Centre of Iran)
  is distributed over OSM building footprints in proportion to footprint area.
- Buffers are Euclidean (straight-line) distances in UTM 39N (EPSG:32639).
  Network distance would be stricter; treat coverage as an upper bound.
- OSM is volunteered data: missing features show up as false "gaps".
  Every gap must be checked in the field before it is reported as a deficit.
"""
import argparse
import json
import os
import sys

import requests
import geopandas as gpd
import matplotlib.pyplot as plt
from shapely.geometry import Point, Polygon, LineString
from shapely.ops import unary_union

BBOX = (36.885, 50.600, 36.945, 50.700)  # south, west, north, east — Ramsar city strip
POPULATION = 35997                        # city, census 1395 (SCI)
POP_SOURCE = "مرکز آمار ایران، سرشماری 1395"
CRS_M = "EPSG:32639"

OVERPASS = "https://overpass-api.de/api/interpreter"

# category -> (overpass filters, buffer radii in m, per-capita standard m²/person or None)
CATEGORIES = {
    "green":     (['nwr["leisure"~"^(park|garden|playground)$"]', 'nwr["landuse"="recreation_ground"]'], (300, 500), 7.0),
    "culture":   (['nwr["amenity"~"^(library|arts_centre|community_centre|theatre|cinema)$"]', 'nwr["tourism"="museum"]'], (1000,), 1.0),
    "sport":     (['nwr["leisure"~"^(sports_centre|pitch|stadium|swimming_pool|fitness_centre)$"]'], (750,), 1.0),
    "education": (['nwr["amenity"~"^(school|kindergarten|college|university)$"]'], (500, 1000), None),
    "health":    (['nwr["amenity"~"^(hospital|clinic|doctors|pharmacy)$"]', 'nwr["healthcare"]'], (1000,), 1.5),
    "public":    (['nwr["amenity"~"^(fire_station|police|townhall|place_of_worship|post_office)$"]'], (1000,), None),
    "tourism":   (['nwr["tourism"~"^(hotel|guest_house|hostel|motel|attraction|viewpoint|information|museum)$"]'], (500,), None),
    "parking":   (['nwr["amenity"="parking"]'], (300,), None),
    "public_space": (['nwr["place"="square"]', 'way["highway"="pedestrian"]', 'nwr["natural"="beach"]'], (400,), None),
}
EXTRA = ['way["building"]', 'way["highway"~"^(primary|secondary|tertiary|trunk|residential)$"]', 'way["natural"="coastline"]']

TITLES = {
    "green": ("Map 1", "فضای سبز"), "culture": ("Map 2", "خدمات فرهنگی"), "sport": ("Map 3", "خدمات ورزشی"),
    "education": ("Map 4", "خدمات آموزشی"), "health": ("Map 5", "خدمات درمانی"), "public": ("Map 6", "خدمات عمومی"),
    "tourism": ("Map 7", "خدمات گردشگری"), "parking": ("Map 8", "پارکینگ"), "public_space": ("Map 9", "فضاهای عمومی"),
}


def build_query():
    s, w, n, e = BBOX
    parts = []
    for filters, _, _ in CATEGORIES.values():
        parts += [f'{f}({s},{w},{n},{e});' for f in filters]
    parts += [f'{f}({s},{w},{n},{e});' for f in EXTRA]
    return "[out:json][timeout:180];(" + "".join(parts) + ");out geom tags;"


def download(cache):
    if cache and os.path.exists(cache):
        with open(cache, encoding="utf-8") as f:
            return json.load(f)
    r = requests.post(OVERPASS, data={"data": build_query()}, timeout=300)
    r.raise_for_status()
    data = r.json()
    if cache:
        with open(cache, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
    return data


def element_geometry(el):
    if el["type"] == "node":
        return Point(el["lon"], el["lat"])
    if el["type"] == "way" and "geometry" in el:
        pts = [(p["lon"], p["lat"]) for p in el["geometry"]]
        if len(pts) >= 4 and pts[0] == pts[-1]:
            return Polygon(pts)
        return LineString(pts) if len(pts) >= 2 else None
    if el["type"] == "relation" and "members" in el:
        polys = []
        for m in el["members"]:
            if m.get("role") == "outer" and "geometry" in m:
                pts = [(p["lon"], p["lat"]) for p in m["geometry"]]
                if len(pts) >= 4 and pts[0] == pts[-1]:
                    polys.append(Polygon(pts))
        return unary_union(polys) if polys else None
    return None


def matches(tags, filt):
    """Tiny evaluator for the filter strings above (key=value or key~regex alternatives)."""
    import re
    body = filt[filt.index("[") + 1: filt.rindex("]")]
    if "~" in body:
        k, v = body.split("~", 1)
        k, v = k.strip('"'), v.strip('"')
        return k in tags and re.search(v, tags[k]) is not None
    if "=" in body:
        k, v = body.split("=", 1)
        return tags.get(k.strip('"')) == v.strip('"')
    return body.strip('"') in tags


def classify(data):
    rows, buildings, roads, coast = [], [], [], []
    for el in data.get("elements", []):
        tags = el.get("tags", {})
        geom = element_geometry(el)
        if geom is None or geom.is_empty:
            continue
        if "building" in tags and geom.geom_type in ("Polygon", "MultiPolygon"):
            buildings.append(geom)
        if tags.get("highway") in ("primary", "secondary", "tertiary", "trunk", "residential"):
            roads.append(geom)
        if tags.get("natural") == "coastline":
            coast.append(geom)
        for cat, (filters, _, _) in CATEGORIES.items():
            if any(matches(tags, f) for f in filters):
                rows.append({"category": cat, "name": tags.get("name:fa") or tags.get("name") or "",
                             "osm_id": f'{el["type"]}/{el["id"]}', "geometry": geom})
    gdf = gpd.GeoDataFrame(rows, geometry="geometry", crs="EPSG:4326")
    b = gpd.GeoDataFrame(geometry=buildings, crs="EPSG:4326")
    r = gpd.GeoDataFrame(geometry=roads, crs="EPSG:4326")
    c = gpd.GeoDataFrame(geometry=coast, crs="EPSG:4326")
    return gdf, b, r, c


def run(cache, outdir, boundary=None):
    os.makedirs(outdir, exist_ok=True)
    data = download(cache)
    svc, bld, roads, coast = classify(data)
    if svc.empty or bld.empty:
        sys.exit("No OSM features found — check BBOX or the Overpass response.")

    svc_m, bld_m, roads_m, coast_m = (g.to_crs(CRS_M) for g in (svc, bld, roads, coast))
    if boundary:
        area = gpd.read_file(boundary).to_crs(CRS_M).unary_union
        svc_m = svc_m[svc_m.intersects(area)]
        bld_m = bld_m[bld_m.intersects(area)]

    # population proxy
    bld_m["fp"] = bld_m.area
    bld_m["pop"] = POPULATION * bld_m["fp"] / bld_m["fp"].sum()
    bld_pts = bld_m.copy()
    bld_pts["geometry"] = bld_m.centroid

    svc_m["area_m2"] = svc_m.geometry.apply(lambda g: g.area if g.geom_type in ("Polygon", "MultiPolygon") else 0.0)
    pts = svc_m.copy()
    pts["geometry"] = svc_m.geometry.representative_point()
    ll = pts.to_crs("EPSG:4326")
    svc_out = svc_m.drop(columns="geometry").assign(lon=ll.geometry.x.round(6), lat=ll.geometry.y.round(6))
    svc_out.to_csv(os.path.join(outdir, "services.csv"), index=False, encoding="utf-8-sig")

    per_cap, cov_rows, uncovered = [], [], {}
    for cat, (_, radii, std) in CATEGORIES.items():
        sub = svc_m[svc_m.category == cat]
        area = float(sub["area_m2"].sum())
        per_cap.append({"category": cat, "count": len(sub), "area_m2": round(area),
                        "per_capita_m2": round(area / POPULATION, 2) if area else None,
                        "standard_m2": std,
                        "deficit_m2_per_person": round(area / POPULATION - std, 2) if (area and std) else None,
                        "population": POPULATION, "population_source": POP_SOURCE})
        for rad in radii:
            if sub.empty:
                cov = 0.0
                ub = None
            else:
                ub = unary_union(list(sub.geometry.buffer(rad)))
                inside = bld_pts[bld_pts.within(ub)]
                cov = inside["pop"].sum() / POPULATION
            cov_rows.append({"category": cat, "buffer_m": rad, "population_covered_share": round(cov, 3),
                             "population_uncovered": round(POPULATION * (1 - cov))})
        uncovered[cat] = ub
    import pandas as pd
    pd.DataFrame(per_cap).to_csv(os.path.join(outdir, "per_capita.csv"), index=False, encoding="utf-8-sig")
    pd.DataFrame(cov_rows).to_csv(os.path.join(outdir, "coverage.csv"), index=False, encoding="utf-8-sig")

    # maps
    def base(ax):
        bld_m.plot(ax=ax, color="#d9d9d9", linewidth=0)
        if not roads_m.empty:
            roads_m.plot(ax=ax, color="#999999", linewidth=0.4)
        if not coast_m.empty:
            coast_m.plot(ax=ax, color="#2b7bb9", linewidth=1.2)
        ax.set_axis_off()

    for i, (cat, (_, radii, _)) in enumerate(CATEGORIES.items(), start=1):
        fig, ax = plt.subplots(figsize=(11, 7))
        base(ax)
        sub = svc_m[svc_m.category == cat]
        if not sub.empty:
            for rad, alpha in zip(sorted(radii, reverse=True), (0.12, 0.22)):
                gpd.GeoSeries([unary_union(list(sub.geometry.buffer(rad)))], crs=CRS_M).plot(ax=ax, color="#1a9850", alpha=alpha)
            outside = bld_pts[~bld_pts.within(unary_union(list(sub.geometry.buffer(max(radii)))))]
            outside.plot(ax=ax, color="#d73027", markersize=1)
            sub.plot(ax=ax, color="#08519c", markersize=12)
        num, fa = TITLES[cat]
        ax.set_title(f"{num} — {cat}  |  buffers {radii} m  |  red = buildings outside buffer\n"
                     f"Data: © OpenStreetMap contributors (ODbL), Overpass; population {POPULATION:,} (SCI 1395)", fontsize=9)
        fig.savefig(os.path.join(outdir, f"map{i:02d}_{cat}.png"), dpi=200, bbox_inches="tight")
        plt.close(fig)

    # Map 10: number of service categories missing within their buffer, per building
    fig, ax = plt.subplots(figsize=(11, 7))
    base(ax)
    keys = ["green", "culture", "sport", "education", "health"]
    miss = bld_pts.copy()
    miss["missing"] = 0
    for k in keys:
        ub = uncovered.get(k)
        miss["missing"] += (~miss.within(ub)).astype(int) if ub is not None else 1
    miss.plot(ax=ax, column="missing", cmap="Reds", markersize=2, legend=True,
              legend_kwds={"label": "service categories missing (of 5)"})
    ax.set_title("Map 10 — composite service deficit (green, culture, sport, education, health)\n"
                 "Data: © OpenStreetMap contributors; population proxy = building footprint", fontsize=9)
    fig.savefig(os.path.join(outdir, "map10_composite.png"), dpi=200, bbox_inches="tight")
    plt.close(fig)
    print("Done →", os.path.abspath(outdir))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", default="osm_ramsar.json")
    ap.add_argument("--out", default="out")
    ap.add_argument("--boundary", default=None, help="official city boundary (shp/geojson) if available")
    a = ap.parse_args()
    run(a.cache, a.out, a.boundary)
