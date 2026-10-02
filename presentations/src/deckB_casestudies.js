// Deck B — Case-study analysis: Anna Pao Sohmen Centre (primary) + Charles University FTVS
const pptxgen = require("pptxgenjs");
const path = require("path");
const { IMG, COL, THEME, defineLayouts, board, T, R, E, L, PL, dimH, dimV, SRC, TAG, STAT, FIG, NODE } = require("./lib");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const pres = new pptxgen();
pres.title = "Case-Study Analysis — Anna Pao Sohmen Centre & Charles University FTVS";
pres.author = "Architecture Studio — Design 4";
defineLayouts(pres, "DESIGN 4 · PRECEDENT ANALYSIS · FACULTY OF PHYSICAL EDUCATION");

const Z = { pub: COL.zPublic, semi: COL.zSemi, priv: COL.zPrivate, sport: COL.zSport, serv: COL.zService };
const S = {
  AD: "ArchDaily, 'Anna Pao Sohmen Centre at YK Pao School / Scenic Architecture Office' (2025) — archdaily.com/1041795",
  GD: "gooood, 'Anna Pao Sohmen Centre at Shanghai YK Pao School by Scenic Architecture Office' — gooood.cn",
  DRW: "Drawings: Scenic Architecture Office, as published (uploaded set, pp. 33–48)",
  PH: "Photographs: uploaded set (pp. 1–32), as published with the project",
};

// --- plan overlay helper: crop is 760 × 1000 px taken at (290, 0) of the 1440 × 1019 originals ---
function plan(s, file, X, Y, H) {
  const sc = H / 1000;
  s.addImage({ path: IMG(file), x: X, y: Y, w: 760 * sc, h: H });
  const P = (x, y) => [X + (x - 290) * sc, Y + y * sc];
  const zone = (x1, y1, x2, y2, col, tr = 45, o = {}) => {
    const [a, b] = P(x1, y1), [c, d] = P(x2, y2);
    s.addShape(pres.shapes.RECTANGLE, { x: a, y: b, w: c - a, h: d - b, fill: col ? { color: col, transparency: tr } : { type: "none" }, line: o.line ? { color: o.line, width: 1, dashType: o.dash || "solid" } : { type: "none" } });
  };
  const arrow = (pts, col, o = {}) => PL(s, pres, pts.map((p) => P(p[0], p[1])), Object.assign({ color: col, lw: 2 }, o));
  const pin = (x, y, label, col, o = {}) => {
    const [a, b] = P(x, y);
    E(s, pres, a - 0.11, b - 0.11, 0.22, 0.22, { fill: col || COL.ink, line: null });
    T(s, label, a - 0.11, b - 0.1, 0.22, 0.2, { fontSize: 7, bold: true, color: "FFFFFF", align: "center" });
  };
  const core = (x1, y1, x2, y2) => zone(x1, y1, x2, y2, null, 0, { line: COL.ink, dash: "solid" });
  return { P, zone, arrow, pin, core, sc };
}

function zoneLegend(s, x, y, vertical) {
  const items = [[Z.pub, "Public"], [Z.semi, "Semi-public / education"], [Z.priv, "Controlled / private"], [Z.sport, "Sports"], [Z.serv, "Service"]];
  items.forEach((it, i) => {
    const xx = vertical ? x : x + i * 1.75, yy = vertical ? y + i * 0.26 : y;
    R(s, pres, xx, yy, 0.18, 0.16, { fill: it[0], tr: 35, line: null });
    T(s, it[1], xx + 0.25, yy - 0.01, 1.5, 0.2, { fontSize: 7.5 });
  });
}
function circLegend(s, x, y) {
  [[COL.cPublic, "dash", "Public / students"], [COL.cAthlete, "solid", "Sports users"], [COL.cService, "lgDashDot", "Service"]].forEach((c, i) => {
    L(s, pres, x, y + 0.08 + i * 0.25, x + 0.45, y + 0.08 + i * 0.25, { color: c[0], dash: c[1], lw: 2, end: "triangle" });
    T(s, c[2], x + 0.55, y - 0.01 + i * 0.25, 1.6, 0.2, { fontSize: 7.5 });
  });
}
function bullets(s, items, x, y, w, h, fs = 8.5) {
  T(s, items.map((t, i) => {
    if (Array.isArray(t)) return { text: "", options: {} };
    return { text: t, options: { bullet: true, breakLine: i < items.length - 1 } };
  }), x, y, w, h, { fontSize: fs, paraSpaceAfter: 4 });
}
// Two-part analytical note: VERIFIED + INTERPRETATION
function notes(s, x, y, w, verified, interp, fs = 8.5) {
  let yy = y;
  if (verified) {
    TAG(s, pres, "VERIFIED", x, yy, "verified");
    T(s, verified, x, yy + 0.27, w, 0.9, { fontSize: fs });
    yy += 0.27 + Math.min(1.6, 0.17 * Math.ceil(verified.length / (w * 13))) + 0.15;
  }
  if (interp) {
    TAG(s, pres, "ARCHITECTURAL INTERPRETATION", x, yy, "interp");
    bullets(s, interp, x, yy + 0.27, w, 3.0, fs);
  }
}

// =====================================================================
// 01 COVER
// =====================================================================
pres.addSection({ title: "Introduction" });
{
  const s = pres.addSlide({ masterName: "COVER", sectionTitle: "Introduction" });
  s.addImage({ path: IMG("ph_028.jpg"), x: 6.4, y: 0, w: 6.933, h: 4.62 });
  T(s, "ARCHITECTURE STUDIO · DESIGN 4 · PRECEDENT ANALYSIS", 0.6, 0.6, 5.6, 0.3, { fontSize: 9.5, bold: true, color: COL.accent, charSpacing: 2 });
  T(s, "HOW ARE SPORT,\nLEARNING AND\nSERVICE ORGANISED?", 0.6, 1.15, 5.7, 2.2, { fontSize: 30, bold: true, lineSpacingMultiple: 0.95 });
  T(s, "Spatial analysis of two precedents for a Faculty of Physical Education", 0.6, 3.4, 5.6, 0.6, { fontSize: 13, color: COL.grey });
  T(s, [{ text: "CASE 01 — PRIMARY", options: { bold: true, color: COL.accent, breakLine: true } }, { text: "Anna Pao Sohmen Centre, YK Pao School, Shanghai", options: { bold: true, breakLine: true } }, { text: "Scenic Architecture Office", options: { color: COL.grey } }], 0.6, 4.5, 5.5, 0.8, { fontSize: 11 });
  T(s, [{ text: "CASE 02", options: { bold: true, color: COL.accent, breakLine: true } }, { text: "Faculty of Physical Education and Sport, Charles University, Prague", options: { bold: true } }], 0.6, 5.5, 5.5, 0.6, { fontSize: 11 });
  T(s, "Photo: Anna Pao Sohmen Centre — uploaded set (p. 28)", 6.4, 4.66, 4, 0.2, { fontSize: 7, color: COL.grey });
  T(s, "Key question: why are these spaces organised this way, and what can a faculty design learn from it?", 0.6, 6.6, 9.5, 0.3, { fontSize: 9, italic: true, color: COL.grey });
}

// =====================================================================
// 02 METHOD
// =====================================================================
{
  const s = board(pres, "00 — CASE STUDIES + METHOD", "Plans first: every reading is tagged VERIFIED or INTERPRETATION", "Introduction");
  const steps = [
    ["01", "COLLECT", "Uploaded drawings & photos (Case 01) are the primary source; publications fill gaps."],
    ["02", "READ PLANS", "Identify levels, rooms (translated from drawing legends), entrances, cores."],
    ["03", "OVERLAY", "Colour-coded zoning + circulation drawn over the original plans."],
    ["04", "RELATE", "Adjacency, public → private gradient, section stacking."],
    ["05", "EXTRACT", "Design principles → lessons for a PE Faculty."],
  ];
  steps.forEach((st, i) => {
    const x = 0.6 + i * 2.48;
    T(s, st[0], x, 1.5, 0.6, 0.4, { fontSize: 20, bold: true, color: COL.accent });
    T(s, st[1], x, 1.98, 2.3, 0.25, { fontSize: 10, bold: true });
    T(s, st[2], x, 2.26, 2.25, 0.8, { fontSize: 8.5, color: COL.grey });
    if (i < 4) L(s, pres, x + 2.15, 1.7, x + 2.4, 1.7, { lw: 1.25, end: "triangle" });
  });
  // case cards
  const cards = [
    ["ph_001.jpg", "CASE 01 · PRIMARY", "Anna Pao Sohmen Centre", "Shanghai, China · Scenic Architecture Office · 2025", "Full drawing set available: 6 plans, 3 sections, 2 axonometrics, site plan."],
    [null, "CASE 02", "FTVS, Charles University", "Prague 6 – Veleslavín, Czech Republic", "No published floor plans or sections could be obtained → analysis limited to campus & programme level."],
  ];
  cards.forEach((c, i) => {
    const x = 0.6 + i * 4.3, y = 3.3;
    if (c[0]) s.addImage({ path: IMG(c[0]), x, y, w: 4.0, h: 2.0, sizing: { type: "cover", w: 4.0, h: 2.0 } });
    else { R(s, pres, x, y, 4.0, 2.0, { fill: COL.panel, line: null }); T(s, "Documentation gap —\nno plans published", x, y + 0.7, 4.0, 0.6, { fontSize: 10, bold: true, color: COL.accent, align: "center" }); }
    T(s, c[1], x, y + 2.1, 4, 0.2, { fontSize: 8, bold: true, color: COL.accent, charSpacing: 1 });
    T(s, c[2], x, y + 2.32, 4, 0.3, { fontSize: 12, bold: true });
    T(s, c[3], x, y + 2.62, 4, 0.22, { fontSize: 8.5, color: COL.grey });
    T(s, c[4], x, y + 2.86, 4, 0.45, { fontSize: 8.5 });
  });
  // legends
  const lx = 9.4;
  T(s, "ZONE COLOURS (used on every slide)", lx, 3.3, 3.5, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  zoneLegend(s, lx, 3.6, true);
  T(s, "CIRCULATION", lx, 5.0, 3.5, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  [[COL.cPublic, "dash", "Public / students"], [COL.cAthlete, "solid", "Sports users"], [COL.cService, "lgDashDot", "Service"]].forEach((c, i) => {
    L(s, pres, lx, 5.35 + i * 0.25, lx + 0.45, 5.35 + i * 0.25, { color: c[0], dash: c[1], lw: 2, end: "triangle" });
    T(s, c[2], lx + 0.55, 5.26 + i * 0.25, 2, 0.2, { fontSize: 7.5 });
  });
  TAG(s, pres, "VERIFIED", lx, 6.2, "verified");
  T(s, "from drawings or a cited publication", lx + 0.85, 6.2, 2.8, 0.2, { fontSize: 7.5 });
  TAG(s, pres, "ARCHITECTURAL INTERPRETATION", lx, 6.48, "interp");
  T(s, "reading of the plan", lx + 2.45, 6.48, 1.5, 0.2, { fontSize: 7.5 });
}

// =====================================================================
// CASE 01 — 03 INTRODUCTION
// =====================================================================
pres.addSection({ title: "Case 01 — Anna Pao Sohmen Centre" });
{
  const s = board(pres, "CASE 01 — ANNA PAO SOHMEN CENTRE · PROJECT", "A six-level 'vertical campus' of sport, making and gathering on a tight school site", "Case 01 — Anna Pao Sohmen Centre");
  s.addImage({ path: IMG("ph_001.jpg"), x: 0.6, y: 1.4, w: 4.2, h: 2.8 });
  s.addImage({ path: IMG("ph_028.jpg"), x: 0.6, y: 4.3, w: 4.2, h: 2.1, sizing: { type: "cover", w: 4.2, h: 2.1 } });
  T(s, "Entrance façade (p. 1) · lifted volume over the field (p. 28)", 0.6, 6.45, 4.2, 0.2, { fontSize: 7, color: COL.grey });
  const rows = [
    ["Project", "Anna Pao Sohmen Centre at YK Pao School", "AD"],
    ["Architect", "Scenic Architecture Office (SAO)", "AD"],
    ["Location", "Shanghai, China — school campus on Hongqiao Road (虹桥路, site plan)", "AD + drawing"],
    ["Completed", "2025", "AD"],
    ["Area", "2,473 m² (ArchDaily)  ·  GFA 7,911.8 m² = 6,945.5 above + 966.3 basement (gooood)", "CONFLICT"],
    ["Levels", "B1 · GF · 2F mezzanine · 3F · 4F · roof court = 6 levels", "drawings"],
    ["Programme", "Indoor pool, multi-purpose basketball hall, table tennis, roof sports court; STEAM classrooms (art, music, ICT, wood, robotics, fashion, photography); teacher-training centre; collective hub / lecture space", "AD / gooood"],
    ["Institution", "YK Pao School — school campus (age groups not verified)", "AD"],
  ];
  const tbl = rows.map((r) => [
    { text: r[0], options: { bold: true, color: COL.grey } },
    { text: r[1], options: { color: r[2] === "CONFLICT" ? COL.accent : COL.ink } },
    { text: r[2] === "CONFLICT" ? "SOURCES DIFFER" : r[2], options: { fontSize: 7, color: r[2] === "CONFLICT" ? COL.accent : COL.grey, bold: r[2] === "CONFLICT" } },
  ]);
  s.addTable(tbl, { x: 5.1, y: 1.4, w: 7.7, colW: [1.1, 5.4, 1.2], fontSize: 8.5, fontFace: "Arial", border: { type: "solid", color: COL.line, pt: 0.5 }, margin: 0.05, valign: "middle" });
  T(s, "CONCEPT (as published)", 5.1, 5.15, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  T(s, "“The upper mass floats above the synthetic turf field, with angled concrete columns carrying the load while keeping the ground level open” — building upward to add six levels of programme while increasing usable outdoor area.", 5.1, 5.4, 7.7, 0.6, { fontSize: 9.5, italic: true });
  T(s, "Area: the two published figures cannot both be gross floor area; 2,473 m² likely refers to a footprint/site figure — NOT VERIFIED. Use GFA only with its source.", 5.1, 6.05, 7.7, 0.35, { fontSize: 8, color: COL.accent });
  SRC(s, S.AD + "  ·  " + S.GD + "  ·  " + S.DRW, 5.1, 6.45, 7.7, { h: 0.35 });
}

// =====================================================================
// 04 SITE + CONTEXT
// =====================================================================
{
  const s = board(pres, "CASE 01 — SITE + CONTEXT", "Placed at the hinge between campus lawn and sports field, close to the main gate", "Case 01 — Anna Pao Sohmen Centre");
  // site image crop: orig 2234 × 1751; crop y 250..1450
  const X = 0.6, Y = 1.35, W = 7.6, sc = W / 2234, Hc = 1200 * sc;
  s.addImage({ path: IMG("site_crop.jpg"), x: X, y: Y, w: W, h: Hc });
  const P = (x, y) => [X + x * sc, Y + (y - 250) * sc];
  // building highlight
  const [bx, by] = P(1162, 782);
  E(s, pres, bx - 0.75, by - 0.75, 1.5, 1.5, { line: COL.accent, lw: 2 });
  T(s, "ANNA PAO SOHMEN CENTRE", bx + 0.75, by - 0.95, 2.2, 0.2, { fontSize: 8, bold: true, color: COL.accent });
  const lab = (x, y, t, col, dx = 0.12, dy = -0.1, w = 2) => { const [a, b] = P(x, y); T(s, t, a + dx, b + dy, w, 0.35, { fontSize: 7.5, bold: true, color: col || COL.ink }); };
  lab(726, 413, "HONGQIAO ROAD (虹桥路)", COL.ink, 0.0, -0.05, 2.2);
  const [m1, m2] = P(603, 609); E(s, pres, m1 - 0.08, m2 - 0.08, 0.16, 0.16, { fill: COL.cPublic, line: null });
  lab(603, 609, "school main entrance", COL.cPublic, 0.12, 0.05);
  const [s1, s2] = P(229, 877); E(s, pres, s1 - 0.08, s2 - 0.08, 0.16, 0.16, { fill: COL.cPublic, line: null });
  lab(229, 877, "secondary entrance", COL.cPublic, 0.12, 0.05);
  const [e1, e2] = P(1011, 882); E(s, pres, e1 - 0.08, e2 - 0.08, 0.16, 0.16, { fill: COL.accent, line: null });
  lab(1011, 882, "building entrance", COL.accent, -1.25, 0.05, 1.2);
  PL(s, pres, [P(620, 640), P(800, 760), P(990, 870)], { color: COL.cPublic, lw: 2, dash: "dash" });
  lab(1374, 1117, "SPORTS FIELD + TRACK", Z.sport, -0.3, 0.0);
  lab(700, 820, "CENTRAL LAWN", COL.grey, -0.3, 0.0);
  lab(1620, 820, "low-rise residential", COL.grey, 0, 0);
  T(s, "Site plan (uploaded p. 46) — annotations translated from the Chinese labels: 学校主入口 main school entrance · 学校次入口 secondary entrance · 主入口 building entrance.", X, Y + Hc + 0.08, W, 0.35, { fontSize: 7.5, italic: true, color: COL.grey });
  notes(s, 8.55, 1.4, 4.25,
    "Road (Hongqiao Rd.), school main & secondary entrances and the building's main entrance are labelled on the site plan. North arrow and 0–30 m scale on drawing. Building sits between the school buildings, the lawn and the field with 400 m-type track (drawn).",
    [
      "The centre is the 'turn' of the campus: entered from the lawn side, it opens on the other side to the field — a hinge, not an object.",
      "Short walk from the main gate → doubles as a public/event building without crossing the teaching campus.",
      "Tight footprint between existing buildings and the field explains the vertical stacking and the lift-up over the track.",
      "Vehicular / service access: NOT VERIFIED from the site plan.",
      "Orientation / solar strategy: NOT VERIFIED from published sources.",
    ]);
  SRC(s, S.DRW + " — site plan; " + S.AD, 8.55, 6.45, 4.25, { h: 0.35 });
}

// =====================================================================
// 05 CONCEPT
// =====================================================================
{
  const s = board(pres, "CASE 01 — ARCHITECTURAL CONCEPT", "Build up, free the ground: the field continues under the building", "Case 01 — Anna Pao Sohmen Centre");
  s.addImage({ path: IMG("axo_shell.jpg"), x: 0.6, y: 1.35, w: 3.85, h: 5.32 });
  T(s, "Exploded axonometric — architects' drawing (p. 39)", 0.6, 6.7, 3.9, 0.2, { fontSize: 7, color: COL.grey });
  s.addImage({ path: IMG("ph_026.jpg"), x: 4.7, y: 1.35, w: 4.0, h: 2.25 });
  s.addImage({ path: IMG("ph_005.jpg"), x: 4.7, y: 3.7, w: 4.0, h: 2.34 });
  T(s, "Covered field under the 3F–4F volume; angled concrete columns at the track edge (pp. 26, 5)", 4.7, 6.1, 4.0, 0.35, { fontSize: 7, color: COL.grey });
  // concept diagram
  const dx = 9.05, dy = 1.45;
  T(s, "CONCEPT DIAGRAM", dx, dy, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  // conventional
  L(s, pres, dx, dy + 1.4, dx + 3.6, dy + 1.4, { lw: 1.5 });
  R(s, pres, dx + 0.2, dy + 0.5, 1.6, 0.9, { fill: Z.sport, tr: 50 });
  R(s, pres, dx + 2.0, dy + 1.3, 1.4, 0.1, { fill: Z.sport, tr: 20, line: null });
  T(s, "A · object beside the field", dx, dy + 1.48, 3.6, 0.2, { fontSize: 7.5 });
  // lifted
  const y2 = dy + 3.2;
  L(s, pres, dx, y2, dx + 3.6, y2, { lw: 1.5 });
  R(s, pres, dx + 0.2, y2 - 0.6, 1.6, 0.6, { fill: Z.sport, tr: 50 });
  R(s, pres, dx + 0.2, y2 - 1.3, 3.0, 0.7, { fill: Z.semi, tr: 45 });
  R(s, pres, dx + 0.2, y2 - 1.45, 3.0, 0.15, { fill: Z.sport, tr: 20, line: null });
  R(s, pres, dx + 1.8, y2 - 0.1, 1.6, 0.1, { fill: Z.sport, tr: 20, line: null });
  L(s, pres, dx + 2.85, y2, dx + 3.05, y2 - 0.6, { lw: 1.5 }); L(s, pres, dx + 3.2, y2, dx + 3.05, y2 - 0.6, { lw: 1.5 });
  T(s, "B · stacked + lifted: field runs under, roof becomes a court", dx, y2 + 0.08, 3.7, 0.35, { fontSize: 7.5 });
  TAG(s, pres, "ARCHITECTURAL INTERPRETATION", dx, y2 + 0.5, "interp");
  bullets(s, [
    "Upper floors (3F–4F) cantilever south over the track — dashed outline on the GF plan matches the 3F footprint.",
    "Sports volumes stacked: pool (GF/B1) → gym (3F–4F) → roof court.",
    "Learning wraps the gym on three sides → daylight + views (ArchDaily).",
  ], dx, y2 + 0.78, 3.75, 1.8, 8);
  SRC(s, S.AD + " (quoted concept); " + S.DRW + "; " + S.PH, 4.7, 6.45, 8.1, { h: 0.35 });
}

// =====================================================================
// 06 GROUND FLOOR
// =====================================================================
{
  const s = board(pres, "CASE 01 — GROUND FLOOR PLAN", "GF: an assembly lobby between pool and field; wet + service behind", "Case 01 — Anna Pao Sohmen Centre");
  const p = plan(s, "plan_gf.jpg", 0.6, 1.3, 5.45);
  p.zone(312, 275, 755, 485, Z.sport);
  p.zone(765, 275, 885, 490, Z.priv);
  p.zone(585, 190, 700, 270, Z.priv);
  p.zone(395, 225, 490, 270, Z.priv, 55);
  p.zone(312, 488, 390, 540, Z.priv, 55);
  p.zone(310, 225, 390, 270, Z.serv); p.zone(515, 190, 580, 270, Z.serv); p.zone(730, 215, 785, 270, Z.serv); p.zone(300, 10, 520, 135, Z.serv);
  p.zone(390, 490, 760, 640, Z.pub, 50);
  p.zone(790, 495, 885, 640, Z.semi, 50);
  p.zone(730, 500, 790, 590, Z.serv, 65);
  // cores
  p.core(340, 610, 450, 745); p.core(665, 495, 725, 585); p.core(425, 165, 490, 225); p.core(805, 215, 860, 265);
  // circulation
  p.arrow([[250, 565], [330, 565], [470, 580]], COL.cPublic, { dash: "dash" });
  p.arrow([[560, 700], [560, 640]], COL.cPublic, { dash: "dash" });
  p.arrow([[700, 610], [835, 590], [835, 500]], COL.cAthlete);
  p.arrow([[820, 470], [760, 440]], COL.cAthlete);
  p.arrow([[455, 150], [455, 205], [540, 230]], COL.cService, { dash: "lgDashDot" });
  p.pin(255, 545, "E", COL.accent); p.pin(560, 715, "F", Z.sport);
  T(s, "E entrance (from site plan) · F opens to field under the cantilever · ▭ cores", 0.6, 6.82, 5.6, 0.2, { fontSize: 7, color: COL.grey });
  // legend of rooms
  const lx = 6.35;
  T(s, "ROOMS (drawing legend, translated)", lx, 1.35, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  T(s, "1 Assembly lobby · 2 Storage · 3 Toilet · 4 Pool foyer · 5 Change rooms · 6 Swimming pool · 7 Equipment · 8 Emergency clinic · 9 Office · 10 Staff lounge · 11 Power distribution", lx, 1.6, 2.9, 1.1, { fontSize: 8 });
  zoneLegend(s, lx, 2.85, true);
  circLegend(s, lx, 4.35);
  T(s, "", lx, 4.6, 1, 0.1);
  notes(s, 9.55, 1.35, 3.3,
    "Pool hall is the largest GF space; change rooms sit between pool and pool foyer; clinic, office, storage and equipment line the north edge; a staircase rises from the lobby to the 2F mezzanine.",
    [
      "WHY the lobby here: it is the threshold between campus (entrance) and field (south) — gathering space that also distributes to the pool and upper floors.",
      "Direct access: pool foyer → change rooms → pool (wet sequence never re-enters the dry lobby).",
      "Controlled: clinic & staff rooms at the back edge, near the north stair.",
      "Service: plant + storage stacked on the north strip, power room detached — away from public frontage.",
      "Acoustic / humidity: pool enclosed by service & change rooms rather than by classrooms.",
    ], 8);
  SRC(s, S.DRW + " — Ground Floor Plan (p. 40). Zones, arrows and pins added by author.", 6.35, 6.6, 6.5, { h: 0.3 });
}

// =====================================================================
// 07 B1 + 2F
// =====================================================================
{
  const s = board(pres, "CASE 01 — BASEMENT + SECOND FLOOR", "Below: plant under the pool. Above: a mezzanine that watches the pool and the field", "Case 01 — Anna Pao Sohmen Centre");
  const b = plan(s, "plan_b1.jpg", 0.6, 1.35, 4.6);
  b.zone(305, 165, 890, 620, Z.serv, 55);
  b.zone(340, 295, 705, 455, null, 0, { line: COL.ink, dash: "dash" });
  T(s, "BASEMENT — equipment rooms (设备间) all round the void under the pool (泳池下方管道空腔)", 0.6, 6.0, 3.5, 0.45, { fontSize: 7.5 });
  T(s, "Note: drawing's English legend reads 'Activity mezzanine' for item 1; the Chinese 设备间 = equipment room → used here.", 0.6, 6.45, 3.5, 0.45, { fontSize: 7, italic: true, color: COL.accent });
  const p = plan(s, "plan_2f.jpg", 4.25, 1.35, 4.6);
  p.zone(312, 275, 750, 485, null, 0, { line: Z.sport, dash: "dash" });
  p.zone(755, 275, 885, 490, Z.sport);
  p.zone(390, 490, 885, 640, Z.pub, 50);
  p.zone(310, 175, 720, 270, Z.serv); p.zone(745, 215, 865, 270, Z.serv);
  p.core(340, 610, 450, 745); p.core(425, 165, 490, 225); p.core(665, 495, 725, 585);
  p.arrow([[700, 580], [700, 520], [780, 500]], COL.cPublic, { dash: "dash" });
  p.arrow([[880, 555], [1030, 555], [1030, 670]], COL.cPublic, { dash: "dash" });
  T(s, "2F — 1 Activity mezzanine · 2 Table tennis · 3 Storage · 4 Equipment; dashed = pool void below", 4.25, 6.0, 3.6, 0.45, { fontSize: 7.5 });
  s.addImage({ path: IMG("ph_010.jpg"), x: 8.15, y: 1.35, w: 2.3, h: 1.34 });
  s.addImage({ path: IMG("ph_025.jpg"), x: 10.55, y: 1.35, w: 2.3, h: 1.54 });
  T(s, "Table tennis looks into the pool through the wave windows (p. 10) · lobby stair-seating to mezzanine (p. 25)", 8.15, 2.95, 4.7, 0.35, { fontSize: 7, color: COL.grey });
  notes(s, 8.15, 3.35, 4.7,
    "B1 contains only equipment rooms and the pipe void beneath the pool. 2F: mezzanine over the lobby, table-tennis room above the change rooms, equipment strip along the north; an external bridge/stair leaves the east side.",
    [
      "Service stacked under service: B1 plant directly below the pool → shortest pipe runs, no plant on public levels.",
      "Visual connection: table tennis overlooks the pool; mezzanine overlooks lobby + field → sport is displayed, not hidden.",
      "The lobby stair is also seating (photo) → circulation doubles as spectator space.",
    ], 8);
  SRC(s, S.DRW + " — Basement (p. 42) & Second Floor (p. 35) plans; " + S.PH, 8.15, 6.55, 4.7, { h: 0.3 });
}

// =====================================================================
// 08 THIRD FLOOR
// =====================================================================
{
  const s = board(pres, "CASE 01 — THIRD FLOOR PLAN", "3F: the gym as the centre, wrapped by classrooms, offices and an atrium ring", "Case 01 — Anna Pao Sohmen Centre");
  const p = plan(s, "plan_3f.jpg", 0.6, 1.3, 5.45);
  p.zone(545, 265, 1000, 600, Z.sport);
  p.zone(560, 190, 1000, 262, Z.serv); p.zone(570, 615, 750, 650, Z.serv);
  p.zone(310, 280, 445, 390, Z.semi); p.zone(310, 485, 445, 600, Z.semi);
  p.zone(310, 395, 440, 485, null, 0, { line: Z.sport, dash: "dash" });
  p.zone(310, 700, 525, 880, Z.pub, 45);
  p.zone(530, 765, 770, 880, Z.semi);
  p.zone(775, 765, 1005, 880, Z.priv);
  p.zone(775, 615, 880, 700, Z.priv);
  p.zone(880, 610, 1005, 735, Z.serv, 60);
  p.zone(505, 650, 805, 740, null, 0, { line: COL.ink, dash: "dash" });
  p.core(345, 615, 470, 760); p.core(405, 165, 490, 235); p.core(1005, 735, 1040, 960);
  // circulation
  p.arrow([[420, 690], [520, 760], [790, 755], [960, 750]], COL.cPublic, { dash: "dash" });
  p.arrow([[470, 650], [475, 250]], COL.cPublic, { dash: "dash" });
  p.arrow([[830, 700], [830, 640], [800, 600]], COL.cAthlete);
  p.pin(375, 440, "C", Z.sport); p.pin(655, 700, "A", COL.ink);
  T(s, "A atrium void with roof light · C pomelo courtyard (open) · ▭ cores", 0.6, 6.82, 5.6, 0.2, { fontSize: 7, color: COL.grey });
  const lx = 6.35;
  T(s, "ROOMS (drawing legend)", lx, 1.35, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  T(s, "1 Atrium · 2 Storage · 3 Toilet · 4 Indoor gym · 5 Change room · 6 Classroom · 7 Equipment · 8 Multi-function room · 9 Seminar · 10 Office · 11 Pomelo courtyard", lx, 1.6, 2.9, 1.1, { fontSize: 8 });
  zoneLegend(s, lx, 2.85, true);
  circLegend(s, lx, 4.35);
  s.addImage({ path: IMG("ph_021.jpg"), x: lx, y: 5.15, w: 2.0, h: 1.14 });
  T(s, "Atrium + oval roof light (p. 21)", lx + 2.05, 5.2, 0.9, 0.6, { fontSize: 7, color: COL.grey });
  notes(s, 9.55, 1.35, 3.3,
    "Gym (4) occupies the centre-north; classrooms + courtyard on the west; multi-function, seminar and offices on the south façade; change rooms + toilets between gym and offices; a sculptural stair + lift form the SW core.",
    [
      "Gym = organising mass; every other room is a 'liner' along a façade → daylight for learning, gym lit from roof/high windows.",
      "Change rooms (5) sit on the atrium side of the gym → sports users enter the gym without crossing classrooms.",
      "Atrium ring = public spine: links core, multi-function hall (event use), seminars and gym doors.",
      "Courtyard splits the classroom wing → light, air and a quiet outdoor pause.",
      "Offices at the SE corner: controlled, next to the external stair rather than the public core.",
    ], 8);
  SRC(s, S.DRW + " — Third Floor Plan (p. 33). Overlay by author.", 6.35, 6.6, 6.5, { h: 0.3 });
}

// =====================================================================
// 09 4F + ROOF
// =====================================================================
{
  const s = board(pres, "CASE 01 — FOURTH FLOOR + ROOF", "4F studios ring the gym void; the roof is a second, open-air court", "Case 01 — Anna Pao Sohmen Centre");
  const p = plan(s, "plan_4f.jpg", 0.6, 1.35, 4.6);
  p.zone(545, 265, 1000, 610, null, 0, { line: Z.sport, dash: "dash" });
  p.zone(520, 190, 1000, 262, Z.serv);
  p.zone(310, 280, 445, 395, Z.semi); p.zone(310, 485, 445, 610, Z.semi);
  p.zone(480, 265, 540, 600, Z.priv, 55);
  p.zone(310, 760, 1005, 880, Z.semi);
  p.zone(855, 640, 1000, 710, Z.serv, 60);
  p.zone(470, 610, 850, 760, Z.pub, 65);
  p.core(345, 615, 470, 760); p.core(405, 165, 490, 235);
  T(s, "4F — studios: visual art, ICT, robotics, maker, wood, greenhouse, fashion, photography, dark room, 3D print, recording; dashed = gym void", 0.6, 6.0, 3.55, 0.6, { fontSize: 7.5 });
  const r = plan(s, "plan_roof.jpg", 4.25, 1.35, 4.6);
  r.zone(560, 255, 970, 620, Z.sport);
  r.zone(465, 260, 540, 620, Z.serv);
  r.zone(310, 625, 1005, 760, Z.sport, 75);
  r.zone(535, 660, 780, 740, null, 0, { line: COL.zPublic, dash: "dash" });
  T(s, "ROOF — 1 roof playground (court + stepped seats N & S) · 2 activity space · 3 solar equipment platform · 4 clerestory desks", 4.25, 6.0, 3.6, 0.6, { fontSize: 7.5 });
  s.addImage({ path: IMG("ph_003.jpg"), x: 8.15, y: 1.35, w: 2.3, h: 1.54 });
  s.addImage({ path: IMG("ph_016.jpg"), x: 10.55, y: 1.35, w: 2.3, h: 1.54 });
  T(s, "Roof court above the studio façade (p. 3) · pitched-roof wood studio (p. 16)", 8.15, 2.95, 4.7, 0.3, { fontSize: 7, color: COL.grey });
  notes(s, 8.15, 3.35, 4.7,
    "4F studios line west and south façades; offices/dark room/photo studio line the gym's west wall. Roof: full court with stepped seating on both long sides, solar plant platform, and 'clerestory desks' over the atrium.",
    [
      "Noise/mess-tolerant making studios grouped on one floor, above quieter classrooms.",
      "Roof court reuses the gym's footprint → the long-span structure carries play twice.",
      "Stepped seats make the roof a small outdoor arena; clerestory desks = skylights that are also furniture.",
      "Plant (solar) kept to a strip beside the court, away from the play edge.",
    ], 8);
  SRC(s, S.DRW + " — Fourth Floor (p. 41) & Roof plans (p. 37); " + S.PH, 8.15, 6.55, 4.7, { h: 0.3 });
}

// =====================================================================
// 10 FUNCTIONAL ZONING
// =====================================================================
{
  const s = board(pres, "CASE 01 — FUNCTIONAL ZONING", "Zoning is vertical: wet sport low, dry sport high, learning around, service below", "Case 01 — Anna Pao Sohmen Centre");
  s.addImage({ path: IMG("axo_prog.jpg"), x: 0.6, y: 1.3, w: 4.85, h: 5.32 });
  T(s, "Programme axonometric — architects' drawing and colours (p. 38)", 0.6, 6.65, 4.9, 0.2, { fontSize: 7, color: COL.grey });
  // zoning stack in study palette
  const x0 = 5.9, y0 = 1.45, rowH = 0.72, colW = 1.3;
  const cols = ["PUBLIC", "SEMI-PUBLIC / EDU", "CONTROLLED", "SPORTS", "SERVICE"];
  const zc = [Z.pub, Z.semi, Z.priv, Z.sport, Z.serv];
  cols.forEach((c, i) => T(s, c, x0 + 0.75 + i * colW, y0, colW - 0.05, 0.3, { fontSize: 7, bold: true, align: "center", color: COL.grey }));
  const lv = [
    ["ROOF", ["", "", "", "roof court + seats", "solar platform"]],
    ["4F", ["atrium", "studios, ICT, art", "offices, dark room", "(gym void)", "equipment, WC"]],
    ["3F", ["atrium, multi-function", "classrooms, seminar", "offices, change", "indoor gym", "storage, WC"]],
    ["2F", ["mezzanine", "", "", "table tennis", "equipment"]],
    ["GF", ["assembly lobby", "pool foyer", "clinic, staff", "pool", "storage, power"]],
    ["B1", ["", "", "", "", "plant under pool"]],
  ];
  lv.forEach((l, j) => {
    const y = y0 + 0.35 + j * rowH;
    T(s, l[0], x0, y + 0.2, 0.7, 0.3, { fontSize: 10, bold: true });
    l[1].forEach((t, i) => {
      if (!t) { R(s, pres, x0 + 0.75 + i * colW, y, colW - 0.05, rowH - 0.07, { fill: COL.panel, line: null }); return; }
      NODE(s, pres, t, x0 + 0.75 + i * colW, y, colW - 0.05, rowH - 0.07, { fill: zc[i], tr: 45, line: "FFFFFF", fs: 7.5, bold: false });
    });
  });
  TAG(s, pres, "VERIFIED ROOMS · ZONE ASSIGNMENT = INTERPRETATION", x0, 6.15, "interp");
  SRC(s, S.DRW + " — all plans + programme axonometric (p. 38).", x0, 6.45, 7.0, { h: 0.3 });
}

// =====================================================================
// 11 ADJACENCY
// =====================================================================
{
  const s = board(pres, "CASE 01 — SPATIAL RELATIONSHIPS / ADJACENCY", "Two hearts — the lobby (GF) and the atrium (3F) — connected by one core", "Case 01 — Anna Pao Sohmen Centre");
  const N = (t, x, y, w, col, o = {}) => NODE(s, pres, t, x, y, w, 0.45, Object.assign({ fill: col, tr: 40, fs: 8 }, o));
  N("CAMPUS LAWN / ENTRANCE", 0.6, 1.5, 2.2, Z.pub, { tr: 70 });
  N("ASSEMBLY LOBBY", 0.6, 2.5, 2.2, Z.pub);
  N("FIELD + TRACK\n(under building)", 0.6, 3.5, 1.6, Z.sport, { tr: 70 });
  N("POOL FOYER", 3.3, 2.5, 1.7, Z.semi);
  N("CHANGE ROOMS", 5.4, 2.5, 1.7, Z.priv);
  N("POOL", 7.5, 2.5, 1.4, Z.sport);
  N("PLANT (B1)", 7.5, 3.5, 1.4, Z.serv);
  N("MEZZANINE (2F)", 3.3, 3.5, 1.7, Z.pub);
  N("TABLE TENNIS (2F)", 5.4, 3.5, 1.7, Z.sport);
  N("WEST CORE: LIFT + STAIR", 0.6, 4.6, 2.2, "FFFFFF", { line: COL.ink });
  N("ATRIUM (3F–4F)", 3.3, 4.6, 1.7, Z.pub);
  N("INDOOR GYM", 5.4, 5.6, 1.7, Z.sport);
  N("CHANGE (3F)", 5.4, 4.6, 1.7, Z.priv);
  N("CLASSROOMS / STUDIOS", 3.3, 5.6, 1.7, Z.semi);
  N("COURTYARD", 0.6, 5.6, 2.2, Z.sport, { tr: 75 });
  N("MULTI-FUNCTION / SEMINAR", 7.5, 4.6, 1.4, Z.pub, { fs: 7 });
  N("OFFICES", 7.5, 5.6, 1.4, Z.priv);
  N("ROOF COURT", 3.3, 6.35, 1.7, Z.sport, { tr: 60 });
  const ln = (a, b, o = {}) => L(s, pres, a[0], a[1], b[0], b[1], Object.assign({ lw: o.strong ? 2.25 : 1, color: o.col || COL.ink, dash: o.dash || "solid" }, o));
  ln([1.7, 1.95], [1.7, 2.5], { strong: true }); ln([1.4, 2.95], [1.4, 3.5], { strong: true });
  ln([2.8, 2.72], [3.3, 2.72], { strong: true }); ln([5.0, 2.72], [5.4, 2.72], { strong: true, col: COL.cAthlete }); ln([7.1, 2.72], [7.5, 2.72], { strong: true, col: COL.cAthlete });
  ln([8.2, 2.95], [8.2, 3.5], { dash: "lgDashDot" });
  ln([2.8, 2.85], [3.3, 3.6], {}); ln([6.25, 3.5], [7.5, 2.85], { dash: "dash", col: COL.cPublic });
  ln([2.5, 2.95], [2.5, 4.6], { strong: true }); ln([2.8, 4.82], [3.3, 4.82], { strong: true });
  ln([5.0, 4.82], [5.4, 4.82], {}); ln([6.25, 5.05], [6.25, 5.6], { strong: true, col: COL.cAthlete });
  PL(s, pres, [[4.15, 4.6], [4.15, 4.45], [8.2, 4.45], [8.2, 4.6]], { lw: 1, arrow: false }); ln([4.15, 5.05], [4.15, 5.6], {}); ln([2.8, 5.82], [3.3, 5.82], {});
  ln([8.2, 5.05], [8.2, 5.6], {}); ln([4.15, 6.05], [4.15, 6.35], { dash: "dash" });
  // legend
  const lx = 9.4;
  T(s, "LINE TYPES", lx, 1.5, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  [[2.25, COL.ink, "solid", "direct / required (plan-verified)"], [2.25, COL.cAthlete, "solid", "sports sequence"], [1, COL.ink, "solid", "near / shared corridor"], [1, COL.cPublic, "dash", "visual connection"], [1, COL.ink, "lgDashDot", "service (vertical)"]].forEach((l, i) => {
    L(s, pres, lx, 1.88 + i * 0.3, lx + 0.5, 1.88 + i * 0.3, { lw: l[0], color: l[1], dash: l[2] });
    T(s, l[3], lx + 0.6, 1.79 + i * 0.3, 2.8, 0.2, { fontSize: 8 });
  });
  TAG(s, pres, "ARCHITECTURAL INTERPRETATION", lx, 3.5, "interp");
  bullets(s, [
    "Pool ↔ change ↔ foyer: linear wet sequence on GF (plan).",
    "Gym ↔ change (3F): change rooms open off the atrium beside gym doors.",
    "Lobby ↔ field: lobby glazed + stepped to the track (section p. 34).",
    "Atrium ↔ multi-function / seminar: event rooms on the public ring.",
    "Plant directly below pool: vertical service adjacency.",
    "Table tennis ↔ pool: visual only (wave windows, photo p. 10).",
  ], lx, 3.78, 3.45, 2.6, 8);
  SRC(s, S.DRW + " (plans pp. 33–42, section p. 34); " + S.PH, 0.6, 6.82, 12, { h: 0.25 });
}

// =====================================================================
// 12 CIRCULATION
// =====================================================================
{
  const s = board(pres, "CASE 01 — CIRCULATION", "One public core, one back stair, one external stair — and stairs that are also seats", "Case 01 — Anna Pao Sohmen Centre");
  // vertical diagram (schematic section)
  const x0 = 0.9, yB = 6.3, lh = 0.72;
  const lv = ["B1", "GF", "2F", "3F", "4F", "ROOF"];
  lv.forEach((l, i) => { const y = yB - i * lh; L(s, pres, x0, y, x0 + 7.2, y, { lw: 0.75, color: COL.line }); T(s, l, x0 - 0.45, y - 0.22, 0.4, 0.2, { fontSize: 8, bold: true }); });
  const col = (x, i1, i2, label, colr, dash) => {
    L(s, pres, x, yB - i1 * lh, x, yB - i2 * lh, { lw: 3, color: colr, dash: dash || "solid" });
    T(s, label, x - 0.6, yB - i2 * lh - 0.42, 1.2, 0.35, { fontSize: 7, bold: true, align: "center", color: colr });
  };
  col(1.4, 1, 5, "WEST CORE\nlift + sculptural stair", COL.cPublic);
  col(3.0, 0, 5, "NORTH STAIR\n(back of house)", COL.cService, "lgDashDot");
  col(6.9, 1, 3, "EAST EXTERNAL STAIR", COL.cAthlete);
  L(s, pres, 4.4, yB - 1 * lh, 5.0, yB - 2 * lh, { lw: 3, color: COL.cPublic });
  T(s, "lobby stair-seating", 4.2, yB - 1 * lh - 0.25, 1.6, 0.2, { fontSize: 7, bold: true, color: COL.cPublic });
  // horizontal spines
  L(s, pres, 1.4, yB - 3 * lh - 0.05, 6.9, yB - 3 * lh - 0.05, { lw: 1.5, color: COL.cPublic, dash: "dash" });
  T(s, "3F atrium ring (public spine)", 3.6, yB - 3 * lh - 0.3, 2.6, 0.2, { fontSize: 7, color: COL.cPublic });
  L(s, pres, 1.4, yB - 1 * lh - 0.05, 4.4, yB - 1 * lh - 0.05, { lw: 1.5, color: COL.cPublic, dash: "dash" });
  T(s, "GF lobby", 1.6, yB - 1 * lh - 0.3, 1, 0.2, { fontSize: 7, color: COL.cPublic });
  T(s, "Schematic vertical-circulation diagram, based on cores identified in all plans (not to scale).", 0.6, 6.45, 7.5, 0.2, { fontSize: 7.5, italic: true, color: COL.grey });
  s.addImage({ path: IMG("ph_023.jpg"), x: 8.55, y: 1.35, w: 2.1, h: 1.4 });
  s.addImage({ path: IMG("ph_020.jpg"), x: 10.75, y: 1.35, w: 2.1, h: 1.4 });
  T(s, "Stair with timber screen (p. 23) · atrium stair landing (p. 20)", 8.55, 2.8, 4.3, 0.2, { fontSize: 7, color: COL.grey });
  notes(s, 8.55, 3.1, 4.3,
    "Cores in plans: lift + curved stair (SW, all levels GF–4F), north stair (B1–roof), straight stair lobby→2F, east external stair/bridge (2F–3F).",
    [
      "Students / visitors: lobby → west core or stair-seating → atrium ring → rooms.",
      "Sports users: field/lobby → change rooms → pool or gym without passing studios.",
      "Staff: offices next to the east external stair; north stair as back route.",
      "Service: north stair + equipment strip connect B1 plant to every level.",
      "User-separation by schedule is likely, not by fully separate routes — NOT VERIFIED.",
    ], 8);
  SRC(s, S.DRW + "; " + S.PH, 8.55, 6.55, 4.3, { h: 0.3 });
}

// =====================================================================
// 13 PUBLIC → PRIVATE GRADIENT
// =====================================================================
{
  const s = board(pres, "CASE 01 — PUBLIC → PRIVATE GRADIENT", "Control increases with height and with distance from the lobby", "Case 01 — Anna Pao Sohmen Centre");
  const g = [
    [Z.pub, "PUBLIC", "Field under the building · lobby · stair-seating · mezzanine", "open edge to field; lobby doubles as assembly"],
    [Z.semi, "SEMI-PUBLIC", "Atrium ring · multi-function hall · seminars · pool foyer", "reached via the public core; event-capable rooms"],
    [Z.priv, "CONTROLLED", "Classrooms · studios · change rooms · clinic", "doors off the ring; change rooms gate the sports volumes"],
    [Z.serv, "PRIVATE / SERVICE", "Offices · staff lounge · equipment · plant (B1) · solar platform", "edges, back stair, basement and roof strip"],
  ];
  g.forEach((r, i) => {
    const y = 1.5 + i * 1.12, w = 7.2 - i * 0.9;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6 + i * 0.45, y, w, h: 0.95, fill: { color: r[0], transparency: 35 }, line: { type: "none" } });
    T(s, r[1], 0.75 + i * 0.45, y + 0.08, w - 0.3, 0.3, { fontSize: 11, bold: true });
    T(s, r[2], 0.75 + i * 0.45, y + 0.38, w - 0.3, 0.25, { fontSize: 8.5 });
    T(s, r[3], 0.75 + i * 0.45, y + 0.62, w - 0.3, 0.25, { fontSize: 7.5, italic: true, color: COL.grey });
  });
  T(s, "↓ increasing control", 0.6, 6.0, 3, 0.25, { fontSize: 9, bold: true, color: COL.accent });
  s.addImage({ path: IMG("ph_029.jpg"), x: 8.3, y: 1.45, w: 2.2, h: 1.48 });
  s.addImage({ path: IMG("ph_031.jpg"), x: 10.6, y: 1.45, w: 2.2, h: 1.48 });
  T(s, "Courtyard threshold (p. 29) · entrance (p. 31)", 8.3, 2.98, 4.5, 0.2, { fontSize: 7, color: COL.grey });
  TAG(s, pres, "ARCHITECTURAL INTERPRETATION", 8.3, 3.35, "interp");
  bullets(s, [
    "Control is architectural, not only by doors: height (GF open → 4F studios), depth (front lobby → back offices) and sequence (change rooms before courts).",
    "The lobby can open for events while upper teaching floors stay closed — the core is the single checkpoint.",
    "Pool access is gated twice: pool foyer → change rooms.",
    "Service zones never face the lobby: north strip, basement, roof edge.",
  ], 8.3, 3.62, 4.5, 2.8, 8.5);
  SRC(s, "Derived from " + S.DRW + "; " + S.PH, 0.6, 6.55, 12, { h: 0.3 });
}

// =====================================================================
// 14 SECTIONS
// =====================================================================
{
  const s = board(pres, "CASE 01 — SECTIONAL ORGANISATION", "Three long spans stacked: pool → gym → roof court", "Case 01 — Anna Pao Sohmen Centre");
  // N–S section: crop origin (114, 420) in a 2400 × 1697 original; drawing coordinates were read at 1/1.2 scale
  const X = 0.6, Y = 1.35, W = 6.9, sc = W / 2160, H = 1020 * sc;
  s.addImage({ path: IMG("sec_ns.jpg"), x: X, y: Y, w: W, h: H });
  const D = (dx, dy) => [X + (dx * 1.2 - 114) * sc, Y + (dy * 1.2 - 420) * sc];
  const zr = (x1, y1, x2, y2, c, tr = 55) => { const [a, b] = D(x1, y1), [cc, d] = D(x2, y2); s.addShape(pres.shapes.RECTANGLE, { x: a, y: b, w: cc - a, h: d - b, fill: { color: c, transparency: tr }, line: { type: "none" } }); };
  zr(810, 370, 1440, 540, Z.sport, 65); zr(830, 560, 1410, 765, Z.sport); zr(1045, 800, 1410, 1000, Z.sport, 40);
  zr(785, 790, 1030, 925, Z.pub); zr(810, 935, 1040, 1060, Z.serv); zr(1420, 545, 1520, 1055, Z.serv, 65);
  zr(370, 520, 600, 660, Z.semi); zr(370, 665, 545, 765, Z.semi); zr(745, 600, 825, 765, Z.pub, 70);
  const lab = (dx, dy, t, c) => { const [a, b] = D(dx, dy); T(s, t, a, b, 1.6, 0.2, { fontSize: 7, bold: true, color: c || COL.ink }); };
  lab(1460, 420, "ROOF COURT + seats", COL.ink); lab(1080, 680, "INDOOR GYM", COL.ink); lab(1080, 960, "POOL", COL.ink); lab(800, 870, "LOBBY", COL.ink); lab(380, 600, "STUDIOS", COL.ink); lab(840, 1000, "PLANT", COL.ink);
  T(s, "N–S section (p. 36) — overlay by author", X, Y + H + 0.03, 4, 0.2, { fontSize: 7, color: COL.grey });
  // pool section
  const X2 = 0.6, Y2 = Y + H + 0.3, W2 = 3.4, sc2 = W2 / 1760, H2 = 1010 * sc2;
  s.addImage({ path: IMG("sec_pool.jpg"), x: X2, y: Y2, w: W2, h: H2 });
  const D2 = (dx, dy) => [X2 + (dx * 1.2 - 488) * sc2, Y2 + (dy * 1.2 - 430) * sc2];
  const zr2 = (x1, y1, x2, y2, c, tr = 55) => { const [a, b] = D2(x1, y1), [cc, d] = D2(x2, y2); s.addShape(pres.shapes.RECTANGLE, { x: a, y: b, w: cc - a, h: d - b, fill: { color: c, transparency: tr }, line: { type: "none" } }); };
  zr2(935, 545, 1745, 765, Z.sport); zr2(540, 820, 1295, 1000, Z.sport, 40); zr2(1300, 805, 1540, 860, Z.sport, 30); zr2(1325, 880, 1500, 930, Z.priv); zr2(540, 960, 1540, 1060, Z.serv, 60); zr2(530, 520, 690, 765, Z.sport, 80);
  T(s, "E–W section through pool, table tennis, change rooms & courtyard (p. 48) — overlay by author", X2 + W2 + 0.15, Y2 + 0.1, 2.6, 0.6, { fontSize: 7, color: COL.grey });
  // reading
  notes(s, 8.3, 1.35, 4.5,
    "Sections show the pool at grade/below grade with plant beneath, the indoor gym as a double-height volume on 3F–4F directly above, and the roof court with stepped seating on top. The assembly lobby + mezzanine sit beside the pool and open to the track.",
    [
      "Double-height gym sits on a deep transfer floor over the pool → the most demanding spans are stacked, so loads travel straight down.",
      "Wave-shaped pool clerestory: daylight under the gym floor (ArchDaily: arched clerestory windows).",
      "Learning floors (≈ 2 storeys) wrap the gym height → classrooms share the gym's section, not its noise.",
      "The 3F courtyard (with tree) is cut into the stack — outdoor space at upper level.",
      "Floor-to-floor heights NOT dimensioned here: not stated in sources; scaling the drawings would be approximate.",
    ], 8);
  SRC(s, S.DRW + " — sections pp. 34, 36, 48; " + S.AD, X2 + W2 + 0.15, 6.2, 3.3, { h: 0.6 });
}

// =====================================================================
// 15 INDOOR / OUTDOOR + ENVIRONMENT
// =====================================================================
{
  const s = board(pres, "CASE 01 — INDOOR / OUTDOOR + ENVIRONMENT", "Outdoor space at three levels: under, inside and on top of the building", "Case 01 — Anna Pao Sohmen Centre");
  const ph = [["ph_026.jpg", "UNDER — covered field", "sport + recreation + shelter"], ["ph_029.jpg", "INSIDE — pomelo courtyard (3F)", "social + landscape + light"], ["ph_003.jpg", "ON TOP — roof court", "sport + spectators"], ["ph_002.jpg", "EDGE — pool clerestory", "daylight + visual link to street"]];
  ph.forEach((p, i) => {
    const x = 0.6 + i * 3.1;
    s.addImage({ path: IMG(p[0]), x, y: 1.35, w: 2.95, h: 1.95, sizing: { type: "cover", w: 2.95, h: 1.95 } });
    T(s, p[1], x, 3.38, 2.95, 0.22, { fontSize: 9, bold: true });
    T(s, p[2], x, 3.6, 2.95, 0.22, { fontSize: 8, color: COL.grey });
  });
  T(s, "Photos: uploaded set pp. 26, 29, 3, 2", 0.6, 3.85, 6, 0.2, { fontSize: 7, color: COL.grey });
  // environment table
  const rows = [
    ["Strategy", "Evidence", "Status"],
    ["Daylight to learning spaces", "Classrooms 'profit from natural daylighting and scenic views' (ArchDaily); rooms line façades on plans", "VERIFIED"],
    ["Pool daylight", "Arched clerestory windows along the pool; timber beams diffuse light (ArchDaily); wave windows in photos/section", "VERIFIED"],
    ["Atrium roof light", "Oval atrium + 'clerestory desks' on roof plan; photos p. 20–21", "VERIFIED (drawings)"],
    ["Green façade / shading", "Planted screens and timber-colour grid on façades (photos p. 1–6)", "VISIBLE — performance not verified"],
    ["Solar energy", "'Solar equipment platform' on roof plan", "VERIFIED (drawing) — capacity unknown"],
    ["Natural ventilation / orientation", "No published statement", "NOT VERIFIED"],
  ];
  s.addTable(rows.map((r, i) => r.map((c, j) => ({ text: c, options: { bold: i === 0 || j === 0, color: c.startsWith("NOT") ? COL.accent : COL.ink, fill: { color: i === 0 ? COL.panel : "FFFFFF" } } }))),
    { x: 0.6, y: 4.15, w: 12.2, colW: [2.6, 7.0, 2.6], fontSize: 8, fontFace: "Arial", border: { type: "solid", color: COL.line, pt: 0.5 }, margin: 0.04, rowH: 0.27 });
  SRC(s, S.AD + "; " + S.DRW + "; " + S.PH, 0.6, 6.6, 12, { h: 0.25 });
}

// =====================================================================
// 16 STRUCTURE
// =====================================================================
{
  const s = board(pres, "CASE 01 — STRUCTURAL / ARCHITECTURAL LOGIC", "Long spans stacked on one footprint; angled columns release the ground", "Case 01 — Anna Pao Sohmen Centre");
  s.addImage({ path: IMG("ph_005.jpg"), x: 0.6, y: 1.35, w: 4.2, h: 2.46 });
  s.addImage({ path: IMG("ph_012.jpg"), x: 0.6, y: 3.9, w: 4.2, h: 2.8 });
  T(s, "Angled columns at the field edge (p. 5) · gym roof structure with skylights (p. 12)", 0.6, 6.72, 4.3, 0.2, { fontSize: 7, color: COL.grey });
  // diagram
  const x0 = 5.2, yG = 5.4;
  L(s, pres, x0, yG, x0 + 4.0, yG, { lw: 2 });
  R(s, pres, x0 + 0.1, yG - 0.8, 2.3, 0.8, { fill: Z.sport, tr: 40 }); T(s, "POOL span", x0 + 0.1, yG - 0.55, 2.3, 0.25, { fontSize: 8, bold: true, align: "center" });
  R(s, pres, x0 + 0.1, yG - 1.3, 3.3, 0.5, { fill: COL.panel }); T(s, "lobby / mezzanine", x0 + 2.45, yG - 0.55, 1.2, 0.25, { fontSize: 7 });
  R(s, pres, x0 + 0.1, yG - 2.45, 3.3, 0.18, { fill: COL.ink, line: null });
  R(s, pres, x0 + 0.1, yG - 2.27, 3.3, 0.97, { fill: Z.sport, tr: 55 }); T(s, "GYM span (3F–4F)", x0 + 0.1, yG - 1.95, 3.3, 0.25, { fontSize: 8, bold: true, align: "center" });
  R(s, pres, x0 + 0.1, yG - 2.75, 3.3, 0.3, { fill: Z.sport, tr: 75 }); T(s, "ROOF COURT", x0 + 0.1, yG - 2.72, 3.3, 0.25, { fontSize: 7.5, bold: true, align: "center" });
  L(s, pres, x0 + 3.4, yG - 1.3, x0 + 3.6, yG, { lw: 2.5 }); L(s, pres, x0 + 3.4, yG - 1.3, x0 + 3.2, yG, { lw: 2.5 });
  T(s, "V / angled\ncolumns", x0 + 3.55, yG - 0.85, 0.9, 0.35, { fontSize: 7, bold: true });
  [0.1, 1.2, 2.4].forEach((dx) => L(s, pres, x0 + dx + 0.05, yG - 1.3, x0 + dx + 0.05, yG - 0.8, { lw: 1, dash: "dash", color: COL.grey }));
  T(s, "Schematic section — interpretation, not to scale", x0, yG + 0.1, 4, 0.2, { fontSize: 7, italic: true, color: COL.grey });
  notes(s, 9.6, 1.35, 3.2,
    "Angled concrete columns carry the upper mass over the turf (ArchDaily). Plans show a regular column grid around the gym and pool; sections show a deep structural zone under the gym floor and under the roof court.",
    [
      "The gym is column-free; its roof is also a playground → a deep, stiff roof structure (visible joists/beams in section).",
      "Pool directly below the gym → the transfer floor between them is the key structural element.",
      "Perimeter rooms are on a smaller grid → structure follows the 'big room + liner' plan.",
      "Material, span and member sizes: NOT VERIFIED (no structural data published).",
    ], 8);
  SRC(s, S.AD + "; " + S.DRW + "; " + S.PH, 5.2, 6.55, 7.6, { h: 0.3 });
}

// =====================================================================
// 17 PRINCIPLES (Case 01)
// =====================================================================
{
  const s = board(pres, "CASE 01 — KEY DESIGN PRINCIPLES", "Seven principles extracted from the Anna Pao Sohmen Centre", "Case 01 — Anna Pao Sohmen Centre");
  const pr = [
    ["01", "Stack the long spans", "Pool → gym → roof court on one footprint frees the site."],
    ["02", "Lift to give back ground", "Upper floors cantilever; the field continues under the building."],
    ["03", "Big room + liner", "Gym in the centre; classrooms / studios line the façades for daylight."],
    ["04", "Thresholds that gather", "Lobby and atrium are distribution AND event spaces (stair-seating)."],
    ["05", "Wet sequence is linear", "Foyer → change → pool; dry users never cross wet floors."],
    ["06", "Show the sport", "Visual links: table tennis → pool, mezzanine → field, roof seats → court."],
    ["07", "Service stacked out of sight", "Plant under the pool, equipment strip at the back, solar on the roof edge."],
  ];
  pr.forEach((p, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = 0.6 + col * 3.1, y = 1.45 + row * 2.55;
    T(s, p[0], x, y, 0.8, 0.5, { fontSize: 24, bold: true, color: COL.accent });
    T(s, p[1], x, y + 0.6, 2.9, 0.3, { fontSize: 11, bold: true });
    T(s, p[2], x, y + 0.95, 2.85, 0.9, { fontSize: 10.5, color: COL.grey });
  });
  s.addImage({ path: IMG("axo_prog.jpg"), x: 9.9, y: 3.85, w: 2.45, h: 2.69 });
  T(s, "Programme axo (p. 38)", 9.9, 6.56, 2.5, 0.2, { fontSize: 7, color: COL.grey });
  TAG(s, pres, "PRINCIPLES = INTERPRETATION OF VERIFIED PLANS", 0.6, 6.5, "interp");
}

// =====================================================================
// CASE 02 — CHARLES UNIVERSITY
// =====================================================================
pres.addSection({ title: "Case 02 — Charles University FTVS" });
{
  const s = board(pres, "CASE 02 — FTVS, CHARLES UNIVERSITY · PROJECT + CONTEXT", "A faculty inside a converted 1950s complex, with sport spread across a campus", "Case 02 — Charles University FTVS");
  const rows = [
    ["Institution", "Faculty of Physical Education and Sport (FTVS / 'CU SPORT'), Charles University", "FTVS / CUNI"],
    ["Address", "José Martího 269/31, Praha 6 – Veleslavín, Czech Republic", "FTVS contacts"],
    ["Original building", "Built 1949–1956 for the Communist Party's political college (VŠP ÚV KSČ, 'Vokovická Sorbonna')", "slavnevily.cz · cs.wikipedia"],
    ["Use as faculty", "Faculty moved here after 1989 (VŠP dissolved 1990); faculty part of Charles University since 1959", "cs.wikipedia"],
    ["Architecture", "'Strict, originally symmetrical' composition on a functionalist basis", "slavnevily.cz"],
    ["Blocks", "Lettered blocks A–H (A–D insulation, E–H façade renewal in a university tender)", "zakazky.cuni.cz"],
    ["Architect", "NOT VERIFIED", ""],
    ["Area / plans", "NOT VERIFIED — no published floor plans, sections or areas found", ""],
  ];
  s.addTable(rows.map((r) => [{ text: r[0], options: { bold: true, color: COL.grey } }, { text: r[1], options: { color: r[1].startsWith("NOT") ? COL.accent : COL.ink, bold: r[1].startsWith("NOT") } }, { text: r[2], options: { fontSize: 7, color: COL.grey } }]),
    { x: 0.6, y: 1.4, w: 7.4, colW: [1.35, 4.55, 1.5], fontSize: 8.5, fontFace: "Arial", border: { type: "solid", color: COL.line, pt: 0.5 }, margin: 0.05, valign: "middle" });
  // context diagram (relational, not spatial)
  const cx = 8.5, cy = 1.45;
  T(s, "CONTEXT — RELATIONAL DIAGRAM", cx, cy, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  NODE(s, pres, "PRAGUE CENTRE", cx + 2.3, cy + 0.4, 1.9, 0.45, { fill: COL.panel, fs: 8 });
  NODE(s, pres, "NOVÝ VELESLAVÍN\nmetro + city district", cx, cy + 1.4, 2.1, 0.6, { fill: Z.pub, tr: 55, fs: 8 });
  NODE(s, pres, "FTVS COMPLEX\nblocks A–H", cx + 2.3, cy + 2.4, 1.9, 0.6, { fill: Z.semi, tr: 40, fs: 8 });
  NODE(s, pres, "STADIUM + PITCHES\ntennis · beach volley", cx, cy + 3.4, 2.1, 0.6, { fill: Z.sport, tr: 45, fs: 8 });
  NODE(s, pres, "SPORTS HALL\n+ gym rooms", cx + 2.3, cy + 3.6, 1.9, 0.6, { fill: Z.sport, tr: 45, fs: 8 });
  L(s, pres, cx + 3.25, cy + 0.85, cx + 3.25, cy + 2.4, { lw: 1, dash: "dash", end: "triangle" });
  T(s, "≈ 25 min by\npublic transport", cx + 3.33, cy + 1.4, 1.0, 0.35, { fontSize: 7, color: COL.grey });
  L(s, pres, cx + 2.1, cy + 1.7, cx + 2.3, cy + 2.6, { lw: 1 });
  L(s, pres, cx + 2.1, cy + 3.7, cx + 2.3, cy + 2.9, { lw: 1 });
  L(s, pres, cx + 3.25, cy + 3.0, cx + 3.25, cy + 3.6, { lw: 1 });
  TAG(s, pres, "ARCHITECTURAL INTERPRETATION — relational, not a map", cx, cy + 4.4, "interp");
  T(s, "Positions are not geographic. Exact site layout, access points and orientation could not be verified from available documentation.", cx, cy + 4.7, 4.3, 0.5, { fontSize: 8, color: COL.accent });
  T(s, "SITE / CONTEXT READING", 0.6, 5.05, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  bullets(s, [
    "A suburban campus in Prague 6, served by the Nový Veleslavín transport hub — the faculty is a destination, not part of the historic university core (verified: location; interpretation: role).",
    "Teaching occupies a building designed for a different institution → sport facilities were added around it rather than integrated in one volume (interpretation).",
  ], 0.6, 5.3, 7.4, 1.1, 8.5);
  SRC(s, "ftvs.cuni.cz (contacts; 'Jak se vyznat na fakultě'); cs.wikipedia.org — VŠP ÚV KSČ & FTVS UK; slavnevily.cz — 'Škola ve Veleslavíně'; zakazky.cuni.cz — FTVS tender; cuni.cz.", 0.6, 6.5, 12.2, { h: 0.3 });
}

{
  const s = board(pres, "CASE 02 — FUNCTIONAL PROGRAMME, ZONING + STANDARDS CHECK", "Verified facilities, organised as a campus of separate sports elements", "Case 02 — Charles University FTVS");
  // facility list
  const fac = [
    [Z.sport, "Sports hall 22 × 32 m (704 m²), Taraflex floor, multi-court markings", "iscus.cz #19361"],
    [Z.sport, "Gym + gymnastics room", "iscus.cz #19361"],
    [Z.sport, "Stadium: football 100 × 65 m + 400 m track, 6 lanes, jump sectors", "iscus.cz #19360"],
    [Z.sport, "Tennis courts · beach-volleyball court", "ftvs.cuni.cz"],
    [Z.priv, "CU SPORT Gym — basement of block H: reception, weights, stretching, TRX, shooting range + cardio, athletic tunnel, warm-up", "ftvs.cuni.cz"],
    [Z.semi, "'Creative Hub' study room above the gym (block H)", "ftvs.cuni.cz"],
    [Z.semi, "Teaching, departments, administration in blocks A–H", "ftvs.cuni.cz"],
  ];
  T(s, "VERIFIED FACILITIES", 0.6, 1.4, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  fac.forEach((f, i) => {
    R(s, pres, 0.6, 1.72 + i * 0.5, 0.18, 0.18, { fill: f[0], tr: 30, line: null });
    T(s, f[1], 0.9, 1.68 + i * 0.5, 4.3, 0.42, { fontSize: 8.5 });
    T(s, f[2], 0.9, 1.68 + i * 0.5 + 0.0, 4.3, 0.42, { fontSize: 6.5, color: COL.grey, align: "right", valign: "bottom" });
  });
  // vertical stacking in block H — verified
  T(s, "BLOCK H — VERIFIED STACKING", 0.6, 5.35, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  NODE(s, pres, "CREATIVE HUB (study)", 0.6, 5.62, 2.6, 0.38, { fill: Z.semi, tr: 40, fs: 8 });
  NODE(s, pres, "CU SPORT GYM (basement)", 0.6, 6.0, 2.6, 0.38, { fill: Z.priv, tr: 40, fs: 8 });
  T(s, "Study above training — a small-scale version of APSC's 'learning over sport'.", 3.3, 5.7, 2.0, 0.65, { fontSize: 7.5, italic: true });
  // hall to scale with court fits
  const k = 0.13, hx = 5.7, hy = 1.95;
  T(s, "SPORTS HALL 32 × 22 m — STANDARDS FIT (to scale)", hx, 1.4, 4.5, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  R(s, pres, hx, hy, 32 * k, 22 * k, { fill: Z.sport, tr: 80, lw: 1.5 });
  R(s, pres, hx, hy + 1.5 * k, 32 * k, 19 * k, { line: COL.grey, dash: "dash" });
  R(s, pres, hx + 2 * k, hy + 3.5 * k, 28 * k, 15 * k, { line: COL.ink, lw: 1 });
  R(s, pres, hx + 4 * k, hy + 3.5 * k, 24 * k, 15 * k, { line: COL.accent, dash: "dash" });
  dimH(s, pres, hx, hx + 32 * k, hy - 0.2, "32 m");
  dimV(s, pres, hx + 32 * k + 0.2, hy, hy + 22 * k, "22 m", { right: true });
  T(s, "— basketball 28 × 15 + 2 m lane = 32 × 19 m → fits exactly in length\n- - volleyball 18 × 9 + 3 m = 24 × 15 m → fits; FIVB official (31 × 19 m) fits in plan", hx, hy + 22 * k + 0.1, 4.6, 0.6, { fontSize: 7.5 });
  TAG(s, pres, "CALCULATION FROM CITED VALUES", hx, hy + 22 * k + 0.75, "calc");
  T(s, "Hall clear height: NOT VERIFIED → official FIVB use (12.5 m) cannot be confirmed.", hx, hy + 22 * k + 1.0, 4.6, 0.4, { fontSize: 8, color: COL.accent });
  // adjacency (programme level)
  const ax = 10.6, ay = 1.45;
  T(s, "ADJACENCY (programme)", ax, ay - 0.05, 2.5, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  const nd = [["ENTRANCE / ADMIN", Z.pub], ["TEACHING BLOCKS", Z.semi], ["CHANGING ?", Z.priv], ["HALL · GYM", Z.sport], ["STADIUM · COURTS", Z.sport]];
  nd.forEach((n, i) => {
    NODE(s, pres, n[0], ax, ay + 0.3 + i * 0.72, 2.2, 0.42, { fill: n[1], tr: 45, fs: 7.5, dash: i === 2 ? "dash" : "solid" });
    if (i < 4) L(s, pres, ax + 1.1, ay + 0.72 + i * 0.72, ax + 1.1, ay + 1.02 + i * 0.72, { lw: 1.25, end: "triangle", dash: i === 1 || i === 2 ? "dash" : "solid" });
  });
  TAG(s, pres, "INTERPRETATION", ax, ay + 3.95, "interp");
  T(s, "Dashed = relationship not verifiable without plans (location of changing rooms, routes between blocks and outdoor facilities).", ax, ay + 4.22, 2.3, 0.8, { fontSize: 7.5, color: COL.grey });
  SRC(s, "iscus.cz — Haly sportovního centra UK Veleslavín (#19361) & Stadion a venkovní hřiště (#19360); ftvs.cuni.cz — sports facilities, 'CU SPORT Gym'. Court values: FIBA OBR 2024 Art. 2; FIVB Rules 2025–28 Rule 1.", 0.6, 6.5, 12.2, { h: 0.3 });
}

{
  const s = board(pres, "CASE 02 — CIRCULATION, SECTION + PRINCIPLES", "What can be learned — and what must be obtained before analysing further", "Case 02 — Charles University FTVS");
  T(s, "NOT VERIFIED FROM AVAILABLE DOCUMENTATION", 0.6, 1.4, 6, 0.25, { fontSize: 10, bold: true, color: COL.accent });
  const gaps = [
    ["Floor plans", "room layout, entrances, cores, changing-room position"],
    ["Sections", "hall clear height, vertical stacking, basement gym depth"],
    ["Circulation", "routes between blocks, sports hall and stadium; athlete vs. public separation"],
    ["Structure", "grid, hall roof span and system"],
    ["Environment", "orientation, daylight, ventilation strategy"],
  ];
  gaps.forEach((g, i) => {
    R(s, pres, 0.6, 1.8 + i * 0.52, 5.6, 0.45, { fill: COL.panel, line: null });
    T(s, g[0], 0.75, 1.88 + i * 0.52, 1.4, 0.3, { fontSize: 9, bold: true });
    T(s, g[1], 2.15, 1.88 + i * 0.52, 4.0, 0.3, { fontSize: 8.5, color: COL.grey });
  });
  T(s, "HOW TO CLOSE THE GAP", 0.6, 4.55, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  bullets(s, [
    "Request plans from the faculty's building-management office (FTVS UK).",
    "Prague 6 building archive — building-permit drawings of José Martího 31.",
    "Site visit: photograph entrances, changing rooms, hall section; pace distances.",
  ], 0.6, 4.82, 5.6, 1.4, 8.5);
  // principles
  T(s, "PRINCIPLES THAT CAN BE EXTRACTED (programme level)", 6.7, 1.4, 6, 0.25, { fontSize: 10, bold: true });
  const pr = [
    ["01", "Campus of parts", "Teaching blocks + separate hall + outdoor stadium: each sport element sized to its own standard (hall exactly fits a FIBA court + lane)."],
    ["02", "Outdoor sport as a field, not a roof", "100 × 65 m pitch with 400 m track needs land — opposite of APSC's vertical strategy."],
    ["03", "Adaptive reuse", "A 1950s symmetrical college re-programmed for sport education; renovation by blocks (A–H)."],
    ["04", "Training under study", "Basement gym beneath a study hub in block H — vertical mix at small scale."],
  ];
  pr.forEach((p, i) => {
    const y = 1.85 + i * 1.08;
    T(s, p[0], 6.7, y, 0.6, 0.4, { fontSize: 18, bold: true, color: COL.accent });
    T(s, p[1], 7.35, y, 5.4, 0.28, { fontSize: 10, bold: true });
    T(s, p[2], 7.35, y + 0.3, 5.4, 0.6, { fontSize: 8.5, color: COL.grey });
  });
  TAG(s, pres, "INTERPRETATION OF VERIFIED FACTS", 6.7, 6.2, "interp");
  SRC(s, "As previous two slides.", 0.6, 6.6, 6, { h: 0.25 });
}

// =====================================================================
// COMPARISON
// =====================================================================
pres.addSection({ title: "Comparison + lessons" });
{
  const s = board(pres, "COMPARATIVE ANALYSIS", "Vertical compression vs. horizontal campus — two answers to the same programme", "Comparison + lessons");
  const head = ["Category", "Anna Pao Sohmen Centre (Shanghai)", "FTVS Charles University (Prague)"].map((t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: COL.ink } } }));
  const rows = [
    ["Site organisation", "Compact infill between lawn and field; ground freed by lifting", "Suburban campus; buildings + separate outdoor sports land"],
    ["Main entrance", "From the lawn into an assembly lobby (site plan)", "Not verified"],
    ["Functional zoning", "Vertical: wet sport low, dry sport high, learning wraps", "Horizontal (interp.): teaching blocks, hall, stadium as separate parts"],
    ["Public / private", "Height + depth + sequence; lobby = only public threshold", "Not verifiable without plans"],
    ["Circulation", "One public core + atrium ring; stairs as seating", "Between blocks and outdoors — not verified"],
    ["Sports spaces", "Pool, gym, table tennis, roof court — stacked", "Hall 32 × 22 m, gym rooms, stadium 100 × 65 m + track, courts"],
    ["Educational spaces", "STEAM classrooms & studios lining façades", "Teaching in converted 1950s blocks A–H"],
    ["Social spaces", "Lobby, mezzanine, atrium, courtyard, roof seats", "Creative Hub study room (block H)"],
    ["Service spaces", "Basement plant, north equipment strip, roof solar", "Not verified"],
    ["Indoor / outdoor", "Under, inside and on top (field, courtyard, roof)", "Outdoor sport on grade beside buildings"],
    ["Structural logic", "Stacked long spans + angled columns", "Not verified"],
    ["Main strategy", "Compress & stack → maximise outdoor ground", "Distribute & reuse → land-based campus"],
  ];
  s.addTable([head, ...rows.map((r) => r.map((c, i) => ({ text: c, options: { bold: i === 0, color: c.startsWith("Not verif") ? COL.accent : COL.ink } })))],
    { x: 0.6, y: 1.35, w: 12.2, colW: [2.0, 5.1, 5.1], fontSize: 8.5, fontFace: "Arial", border: { type: "solid", color: COL.line, pt: 0.5 }, margin: 0.045, rowH: 0.36 });
  T(s, "Not a ranking: APSC shows how to fit a sports-learning programme on scarce land; FTVS shows the land and buildings a full PE faculty with outdoor athletics actually needs.", 0.6, 6.45, 12.2, 0.35, { fontSize: 9, italic: true });
}

{
  const s = board(pres, "DESIGN LESSONS FOR A FACULTY OF PHYSICAL EDUCATION", "Twelve transferable principles — not copies of either building", "Comparison + lessons");
  const L12 = [
    ["Functional zoning", "Zone in section as well as plan: wet sport + plant low, dry halls above, learning on the daylit perimeter.", "APSC"],
    ["Education ↔ sport", "Wrap halls with teaching rooms that look in (glazed screens) but are acoustically separated.", "APSC"],
    ["Student social space", "Make the lobby/atrium the social core: stair-seating, mezzanines, courtyard.", "APSC"],
    ["Circulation", "One legible public spine + separate back-of-house stair/lift for service and staff.", "APSC"],
    ["Spectator / user separation", "Spectators via lobby & seating; athletes via change rooms that open directly onto courts.", "APSC + standards"],
    ["Changing rooms", "Place them between entrance and every court/pool: foyer → change → sport, wet never crossing dry.", "APSC"],
    ["Hall adjacency", "Hall ↔ change ↔ store at the same level; size hall to FIBA 32 × 19 m min. footprint.", "FTVS + FIBA"],
    ["Service access", "Plant and storage stacked behind or below; a service yard away from the public front.", "APSC"],
    ["Outdoor sport", "Reserve land for a 400 m track & pitch if athletics is taught; otherwise use roofs/undercrofts.", "FTVS vs APSC"],
    ["Public / private", "Grade control by height and depth; let the ground floor open for events.", "APSC"],
    ["Courtyards + landscape", "Cut courtyards into upper floors to light deep plans and give quiet outdoor rooms.", "APSC"],
    ["Flexible + large-span", "Stack long spans on one footprint; multi-court halls; reuse existing buildings where possible.", "APSC + FTVS"],
  ];
  L12.forEach((l, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 0.6 + col * 4.12, y = 1.4 + row * 1.33;
    R(s, pres, x, y, 3.95, 1.2, { fill: i % 2 === 0 ? COL.panel : "FFFFFF", line: COL.line, lw: 0.5 });
    T(s, String(i + 1).padStart(2, "0"), x + 0.12, y + 0.08, 0.5, 0.3, { fontSize: 12, bold: true, color: COL.accent });
    T(s, l[0].toUpperCase(), x + 0.6, y + 0.1, 3.2, 0.25, { fontSize: 8.5, bold: true });
    T(s, l[1], x + 0.6, y + 0.36, 3.25, 0.62, { fontSize: 8 });
    T(s, "from: " + l[2], x + 0.6, y + 0.95, 3.2, 0.2, { fontSize: 6.5, color: COL.grey });
  });
  T(s, "All lessons are architectural interpretations derived from the analysed plans, sections and verified facts; dimensional rules come from the standards study (FIBA / FIVB / Sport England / INBR).", 0.6, 6.8, 12.2, 0.25, { fontSize: 7.5, italic: true, color: COL.grey });
}

{
  const s = board(pres, "REFERENCES", "Sources used in the case-study analysis", "Comparison + lessons");
  const refs = [
    ["CASE 01 — ANNA PAO SOHMEN CENTRE", [
      ["Uploaded drawing & photo set (CamScanner PDF, 64 pp.): plans GF, 2F, 3F, 4F, roof, basement; sections; axonometrics; site plan — Scenic Architecture Office.", ""],
      ["ArchDaily — Anna Pao Sohmen Centre at YK Pao School / Scenic Architecture Office (2025).", "https://www.archdaily.com/1041795/anna-pao-sohmen-centre-at-yk-pao-school-scenic-architecture-office"],
      ["gooood — Anna Pao Sohmen Centre at Shanghai YK Pao School by Scenic Architecture Office.", "https://www.gooood.cn/anna-pao-sohmen-centre-at-shanghai-yk-pao-school-by-scenic-architecture-office.htm"],
    ]],
    ["CASE 02 — FTVS, CHARLES UNIVERSITY", [
      ["FTVS UK — Contacts / faculty pages; sports facilities; CU SPORT Gym.", "https://www.ftvs.cuni.cz/en/faculty/contacts"],
      ["iscus.cz — Haly sportovního centra UK Veleslavín (#19361).", "https://iscus.cz/kraje/praha/pasport/19361"],
      ["iscus.cz — Stadion a venkovní hřiště sportovního centra UK Veleslavín (#19360).", "https://iscus.cz/kraje/praha/pasport/19360"],
      ["Wikipedia (cs) — Vysoká škola politická ÚV KSČ; Fakulta tělesné výchovy a sportu UK.", "https://cs.wikipedia.org/wiki/Fakulta_t%C4%9Blesn%C3%A9_v%C3%BDchovy_a_sportu_Univerzity_Karlovy"],
      ["SlavneVily.cz — Škola ve Veleslavíně (Stavby Prahy 6).", "https://www.slavnevily.cz/stavby-/-unesco/stavby-prahy-6/skola-ve-veleslavine"],
      ["Charles University tenders — UK FTVS block renovation.", "https://zakazky.cuni.cz/contract_display_7294.html"],
    ]],
    ["STANDARDS USED FOR CHECKS", [
      ["FIBA Official Basketball Rules 2024.", "https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-v10a.pdf"],
      ["FIVB Official Volleyball Rules 2025–2028.", "https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf"],
    ]],
  ];
  let y = 1.35;
  refs.forEach((g) => {
    T(s, g[0], 0.6, y, 8, 0.25, { fontSize: 9, bold: true, color: COL.accent, charSpacing: 2 });
    y += 0.3;
    g[1].forEach((r) => {
      const runs = [{ text: r[0], options: { breakLine: !!r[1] } }];
      if (r[1]) runs.push({ text: r[1], options: { hyperlink: { url: r[1] }, color: COL.cPublic, fontSize: 7 } });
      T(s, runs, 0.6, y, 12.2, 0.4, { fontSize: 8.5 });
      y += r[1] ? 0.4 : 0.3;
    });
    y += 0.12;
  });
}

const out = path.join(__dirname, "..", "02_Case_Studies_APSC_and_Charles_University.pptx");
pres.writeFile({ fileName: out }).then(async () => { await applyTheme(out, THEME); console.log("wrote", out); });
