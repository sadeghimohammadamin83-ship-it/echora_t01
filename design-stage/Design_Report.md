# Faculty of Physical Education — Concept Stage Report
**“Faculty Street” · خیابانِ دانشکده** · Tehran District 6, between Laleh Park and the University of Tehran
Concept site plan drawn directly over the supplied DXF. This is a studio exercise, not a construction drawing.

---

## 1 · Files inspected

| File | Content | Use |
|---|---|---|
| `source/site_source.dxf` (copy of the uploaded `fbe68bdb-1.dxf`, SHA-256 `5be8161d…`) | AutoCAD 2018 DXF (AC1032).<br>Units are metres (`$INSUNITS 6`).<br>The frame is 670 × 627 m.<br>20 layers `TPX_*`: buildings with height and area text, roads (axes and edges), 5 m contours, 1,870 tree blocks, green spaces, waterways.<br>4,092 model-space entities and 127 blocks. | Base drawing. It is never edited. |
| `site-analysis/` (the interactive atlas, sections 01–22, and its data `js/data/*.js`) | Site findings, OSM street data, the aerial-traced buildings, SRTM terrain, climate, sun, wind, noise, views, and the 8 design implications. | Source of all findings (§3). |
| The red-marked screenshot sent by the user | The site boundary. | Boundary definition (§2). |

## 2 · Understanding of the drawing

### Georeference
- **Scale.** Fitting the DXF buildings onto the 46 aerial-traced footprints from the site analysis gives a free scale of **0.9997**. So the drawing is in true metres.
- **Orientation.** The fitted rotation is **−0.25°**, consistent with UTM grid convergence at this longitude. Drawing +Y is north (±0.3°).

### Boundary
- The boundary is **the block the user marked in red**. It is not redrawn.
- It is assembled from the vertices of the existing road-edge polyline (`TPX_ROADS_CONTOURS`, ring #65) along Keshavarz (N), Jalalieh (E), Poursina (S) and the Hedayati / Enayat lanes (W).
- Area **13,846 m²**, perimeter 475 m; a near-rectangle of about 114 × 119–131 m, aligned with Poursina (bearing 19.2°).
- It is not a cadastral line.

### Inside the boundary
- **Dead-end lanes.** Three dead-end lanes notch into the block: Hedayati (from Keshavarz), Zare' with its south leg (from Jalalieh) and Enayat (from Poursina).
  - Zare' is absorbed into the design.
  - Hedayati and Enayat are kept open as public lanes. Their ownership needs checking.
- **Trees.** 49 surveyed trees are inside the boundary, and 55 are inside it or within 4 m of it. Most stand in the plane-tree rows on the three street edges.
- **Existing building.** One existing building of 56 m² (handle 3395) is inside. The analysis assumes every on-site building is demolished, so it is marked "to remove" on its own layer; the source entity is untouched.
- **Levels.** The 1230 contour runs at the Keshavarz edge and the 1225 contour at the SE corner. That is about 5 m of fall, against about 3 m from SRTM in the atlas. **A topographic survey is needed.**
- **Data quality.** All contour polylines carry a dummy elevation (0.048). Their levels come from the `TPX_CONTOUR_LINES_5M_TEXT` labels.

## 3 · Site findings → opportunities / constraints (matrix)

Status: **D** = documented in the atlas or DXF · **H** = hypothesis to verify · **C** = calculated here.

| # | Finding | Source | Status | O / C | Design driver |
|---|---|---|---|---|---|
| F1 | Between Laleh Park (35 ha, N) and the UT campus (≈21 ha, S) | Atlas 01–03 | D | O | Threshold: public face to the park, institutional face to the campus |
| F2 | Jalalieh + Zare' = the only pedestrian park ↔ campus link; metro L6 ≈ 280 m | Atlas 05, 06, 21 | D | O | Zare' becomes the Faculty Street; main entry at Keshavarz × Jalalieh |
| F3 | No arterial frontage; cars arrive only from one-way Poursina | Atlas 05–06 | D | C | No traffic on site; service via Jalalieh from Poursina |
| F4 | Keshavarz noise (buses, sirens), wind and dust channelled along it | Atlas 14–15 | D | C | North berm + trees; blank auditorium wall faces north |
| F5 | Sensitive fine-grain residential to the west | Atlas 07–09, 19 | D | C | Quiet, low west edge; no outdoor sport or night light toward it |
| F6 | Institutional fabric to the S and E | Atlas 07, 18 | D | O | Large-span hall toward the SE |
| F7 | Plane-tree rows on three edges | Atlas 10 · DXF | D | O | Keep every row; no footprint inside a crown |
| F8 | N → S fall ≈3 m (SRTM) / ≈5 m (DXF) | Atlas 11 · DXF | **H** | O | Hall at the low south edge, floor ≈ −1.5 m |
| F9 | BSk climate, strong west sun, winter inversion | Atlas 12–13 | D | O/C | Courts open south; shaded, closed west facades; N–S court |
| F10 | SW / W winds, summer dust, calm inversions | Atlas 14 | D | O/C | Buildings shelter the courts on the west |
| F11 | Views to the park (upper floors) and to the campus | Atlas 09, 16 | D | O | Admin + presidency on the top floor of the corner building |
| F12 | 13,846 m² site vs 7,864 m² gross program | DXF · brief | C | O | 1–3 levels, ≈31 % coverage |
| F13 | Existing parking is lost | Atlas 19 | D | C | Rely on metro + campus; drop-off on Jalalieh (to confirm) |
| F14 | Brief item "سایت" has no stated function | Brief | **H** | C | Keep as an unresolved, reserved space |

**Main design drivers.**
- **Threshold:** the faculty is a passage between park and campus, not an enclosure.
- **Faculty Street:** the Zare' lane becomes the spine.
- **Four edges, four characters:** north public and noisy, south institutional, west quiet and private, east pedestrian.
- **Keep the trees.**
- **Bulk where it fits:** large volumes low and south.

## 4 · Three concept alternatives (sheet 03)

| | A · Faculty Street | B · Courtyard Faculty | C · Landscape Plinth |
|---|---|---|---|
| Idea | Zare' becomes a public E–W street; buildings are "rooms" along it, grouped by edge | A perimeter ring around one large central court | Hall + auditorium sunk under a public deck that continues the park; a thin bar sits on top |
| Evidence | F1 F2 F4 F5 F6 F7 | F4 F9 F10 | F1 F7 F8 |
| Organisation | Public / events N · sports SE · learning SW · admin at the corner | Program wraps the court | Below: sports + events; above: learning + admin |
| Circulation | One spine + park-corner plaza + perimeter walks | Internal ring, one controlled gate | Public deck, corner ramps, service ramp |
| Built / open | Plaza → street → courts; green edges | One protected court; edges built up | Maximum green; the roof is the park |
| + | Keeps the only public link; clear addresses; phasing | Identity, sheltered microclimate, control | Least visible bulk, maximum open space |
| − | Long spine needs shade and night management | Cuts the park–campus link; builds against the residents; poor expansion | Deep excavation, long buried spans, daylight and egress for the hall, cost |
| Score / 35 (7 criteria × 5) | **31** | 23 | 27 |

Criteria scored: response to site, functional clarity, spatial relationships, circulation efficiency, open-space quality, expansion, identity.

**Selected: A.**
- It is the only option that keeps the park–campus pedestrian link public (F1, F2).
- It puts each use on the edge whose character fits it (F4–F6).
- It keeps all three tree edges (F7), at low technical risk.
- C has the strongest landscape idea, but its risks cannot be justified at concept stage.

No hybrid was made.

## 5 · Program

The brief areas are unchanged. All 12 items are kept. The two assembly spaces stay separate. "سایت" is kept unresolved.

| Functional space | Net | Gross | Group | Placed in (building · level · m²) |
|---|---:|---:|---|---|
| Theoretical classrooms | 820 | 1,194 | Academic | B3 GF 163 · L1 521 · L2 510 |
| Multipurpose sports hall | 2,392 | 3,229 | Sports | B1 GF 1,999 · L1 810 (gallery + ancillary) · L2 420 |
| Auditorium | 855 | 1,154 | Assembly | B4 GF 960 · L1 194 (technical / balcony) |
| Library | 161 | 217 | Academic | B3 GF 217 |
| Secondary assembly hall | 381 | 512 | Assembly | B5 L1 512 |
| Workshop & laboratory hall | 160 | 216 | Academic | B2 GF 216 |
| "سایت" — function unresolved | 66 | 89 | Unresolved | B3 GF 89 (reserved) |
| Administrative rooms | 184 | 249 | Administration | B5 L2 249 |
| Presidency & vice-presidency | 251 | 340 | Administration | B5 L2 340 (controlled suite) |
| Recreational / staff welfare | 116 | 160 | Amenity | B5 GF 160 |
| Cafeteria / buffet | 258 | 348 | Amenity | B5 GF 348 |
| Toilets | 115 | 156 | Services | B3 GF 52 · B4 L1 52 · B5 GF 26 · B5 L2 26 |
| **Total** | **5,759** | **7,864** | | gross / net = 1.366 |

**Groups (gross share).**

| Group | Net (m²) | Gross (m²) | Share of gross |
|---|---:|---:|---:|
| Sports | 2,392 | 3,229 | 41.1 % |
| Assembly | 1,236 | 1,666 | 21.2 % |
| Academic | 1,141 | 1,627 | 20.7 % |
| Administration | 435 | 589 | 7.5 % |
| Amenity | 374 | 508 | 6.5 % |
| Services | 115 | 156 | 2.0 % |
| Unresolved | 66 | 89 | 1.1 % |

**Fit.**
- Ground-floor footprint is **4,313 m² (31.2 %)**, leaving 9,532 m² of open space.
- Total gross / site area = **0.57**.
- No FAR, coverage or height rule was supplied, so none is assumed.
- The program fits on 1–3 levels. Footprints are gross ÷ levels; total gross is not shown as ground floor.

**Special requirements.**
- **Direct access:** hall, auditorium, café, gateway.
- **Acoustic separation:** hall and court vs library and classrooms; auditorium shell.
- **Controlled access:** presidency (through administration), secondary assembly hall (gateway lobby).
- **Shared circulation:** toilets, café, Faculty Street.

## 6 · Relationships (sheet 04)

The 12 × 12 matrix uses five codes:
- **S** strong / adjacent
- **M** moderate / convenient
- **W** weak / separated
- **R** restricted / controlled
- **?** unresolved, for "سایت"

Key pairs:

| Code | Pairs |
|---|---|
| S | classrooms–library, classrooms–WC, hall–workshop/lab, auditorium–WC, assembly hall–café, café–welfare, café–WC, admin–WC |
| R | administration–presidency |
| W | hall–library, hall–auditorium (separate crowd entrances), workshop–library |

The bubble diagram places each function where it sits on the plan. The toilets appear as the three distributed points. The zoning and circulation diagrams (sheet 05) use the same buildings and routes as the DXF.

## 7 · The proposal on the DXF

### Buildings
Planned on a site grid parallel to Poursina, so they read with the street pattern.

| Building | Footprint and levels | What it holds and why |
|---|---|---|
| **B1 Sports hall** | 51 × 39 m, 3,229 m² | In the south-east, at the low edge toward the campus. The hall floor sits ≈1.5 m below the street, giving a playing floor of 42 × 26 m with north clerestory light. The 3-level ancillary bar faces the Faculty Street. |
| **B2 Workshop & lab** | 216 m², 1 level | Attached to the hall (sports science). Served from the Poursina walk. |
| **B3 Academic wing** | 14 × 37 m, 3 levels | On the quiet west. Classrooms look east into the Learning Court; the west facade is closed and shaded. The library sits at the north end, on the street. "سایت" is reserved on the ground floor. |
| **B4 Auditorium** | 28 × 34 m, 2 levels | On the park side. Its blank north wall shields the site from Keshavarz. The foyer opens onto the street, and egress runs to the West Garden. |
| **B5 Gateway building** | 24 × 26 m, 3 levels | At the main corner (Keshavarz × Jalalieh, the route from the metro).<br>GF: café + staff welfare on the plaza and terrace.<br>L1: secondary assembly hall.<br>L2: administration with a controlled presidency suite, looking to the park. |

### Open spaces
- Entry Plaza (park corner)
- **Faculty Street** (former Zare', 9–13 m wide, shade canopy along the south side)
- Outdoor court 15 × 28 m, long axis N–S (between B4 and B5, facing the noisy north rather than the residents)
- Learning Court
- West Garden (residential buffer)
- Park Edge Garden with a planted acoustic berm
- Poursina plane-tree walk
- Jalalieh edge
- Café terrace

### Movement
- **Primary pedestrian routes:** park corner → plaza → Faculty Street (Jalalieh ↔ western lanes), and plaza → street along the court.
- **Secondary pedestrian routes:** Poursina walk, Jalalieh footway, West Garden walk, south gate.
- **Gates:** main (NE), east (Jalalieh, from the UT and the metro), west (neighbourhood lanes), south (Poursina / UT).
- **Service:** Jalalieh entered from Poursina → existing Zare' mouth → a 9 × 6 m loading bay. It is placed to clear the retained trees.
- **Emergency:** 4 m clear lane along the street, controlled by bollards.
- **Vehicles:** no general traffic and no on-site parking.

### DXF layers added
Source layers `TPX_*` are untouched.

| Layer | Contents |
|---|---|
| `SITE_BOUNDARY` | Boundary on the road edges |
| `EXISTING_TO_REMOVE` | Overlay + cross on the 56 m² building |
| `PROPOSED_BUILDINGS` | 5 closed polylines, 0.50 mm |
| `PROPOSED_BUILDINGS_HATCH` | Fills by functional group, 35 % transparent |
| `PROPOSED_UPPER_FLOORS` | Playing floor, ancillary bar, stage / seating, foyer |
| `FUNCTIONAL_ZONES` | Public / events · sports · learning |
| `OPEN_SPACE`, `OPEN_SPACE_HATCH` | 9 open spaces, clipped to the boundary |
| `LANDSCAPE` | Proposed trees, berm, court markings, canopy |
| `PEDESTRIAN_CIRCULATION` | 3 primary + 5 secondary routes |
| `VEHICULAR_CIRCULATION` | Emergency lane |
| `SERVICE_ACCESS` | Service route + loading bay |
| `ENTRANCES` | Site and building entrances |
| `BUILDING_LABELS` | Name, gross m², levels, floor contents |
| `DIMENSIONS` | 11 aligned dimensions |
| `ANNOTATIONS` | Title block, north arrow, 50 m scale bar, legend, area schedule, notes, outside the frame at x = 690–865 |
| `CONCEPT_DIAGRAMS` | Inset concept diagram |

Each footprint also carries XDATA (`PRJ_BUILDING`: id, name, gross, levels).

The DXF labels are in English, because Persian shaping in AutoCAD TEXT is unreliable. The sheets are bilingual.

## 8 · Quality control

Results are in `output/validation_report.txt`. Each check was **actually run**:

**File integrity**
- The output reopens with `ezdxf.recover` and its audit shows 0 errors and 0 fixes. The version (AC1032), `$INSUNITS` (6), `$MEASUREMENT`, `$LUNITS` and `$INSBASE` are unchanged.
- All **4,092 source entities** are present and geometrically identical (compared by handle, type, layer, coordinates and text). All 20 source layers keep their properties, the 127 source blocks are kept (none exploded), and no new entity sits on a `TPX_*` layer.
- The source file's hash is unchanged.

**Proposal geometry**
- All 5 footprints are closed and lie inside the boundary.
- Every label matches the schedule.
- All 12 program items are placed at exactly their gross area (Σ 7,864).
- No floor exceeds its footprint.
- No footprint overlaps another or enters a tree crown (80 % of its radius) or a retained lane.

**Circulation**
- The pedestrian network is one connected system, and it reaches every building within 4.5 m.

**Independent re-reads**
- The JavaScript parser `dxf-parser` reads the file: 37 layers, `$INSUNITS 6`.
- The `ezdxf` drawing add-on rendered `output/DXF_render_*.png` straight from the output DXF.

**Not tested:** opening the file in AutoCAD itself, because it is not available here. The file uses standard R2018 entities only (LWPOLYLINE, HATCH, TEXT, MTEXT, CIRCLE, LINE, DIMENSION).

## 9 · Assumptions and unresolved issues

1. **Boundary.** The boundary follows the road edges marked by the user. It is not cadastral. The Hedayati and Enayat lanes are inside it but kept public; ownership and rights of way need checking.
2. **Levels.** DXF contours give about 5 m of fall and SRTM about 3 m. The ≈ −1.5 m hall floor is provisional until a survey is done.
3. **"سایت" (66 / 89 m²).** Its function is unknown. It is reserved in the academic wing ground floor and **not reinterpreted**. Please confirm what it is.
4. **Regulations.** No FAR, coverage, height, setback or parking rule was supplied, and none was assumed.
5. **Heights.** Heights are indicative: hall ≈12 m, auditorium ≈13 m, gateway 3 levels ≈13.5 m, academic 3 levels ≈12 m.
6. **Trees.**
   - Tree crowns come from the DXF block names (`CR###` = crown radius in decimetres). This interpretation is consistent with the drawn circles.
   - The service route keeps ≥ 1.9 m from every trunk. It passes under the crown of one Jalalieh street tree, where the existing Zare' lane already runs.
7. **Parking.** No on-site parking. Drop-off and accessible bays on Jalalieh need to be confirmed.
8. **Sports hall.** Its dimensions (42 × 26 m playing floor inside a 51 × 39 m footprint) are a planning assumption for handball, futsal and volleyball. They are to be developed.

## 10 · Outputs

| Path | What |
|---|---|
| `design-stage/output/PE_Faculty_Concept_SitePlan.dxf` | **Editable DXF**: source survey + proposal on new layers |
| `design-stage/output/PE_Faculty_Concept_Sheets.pdf` | 6 A3 sheets for studio review |
| `design-stage/output/Sheet01…06_*.png` | The same sheets as PNG (170 dpi) |
| `design-stage/output/DXF_render_full.png`, `DXF_render_site.png` | Previews rendered from the output DXF |
| `design-stage/output/validation_report.txt` | QC log |
| `design-stage/tools/` | `design.py` (single source of geometry + program), `content.py`, `make_dxf.py`, `make_sheets.py`, `check.py`, `validate.py`, `preview.py` |

To regenerate everything, run from `design-stage/tools`:

```
python3 make_dxf.py && python3 validate.py && python3 make_sheets.py
```

Requires `ezdxf`, `shapely`, `matplotlib` ≥ 3.10 and the Vazirmatn font.
