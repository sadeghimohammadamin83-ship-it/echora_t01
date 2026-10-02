// Deck A — Architectural Standards of Sports Facilities & Physical Education Faculty
const pptxgen = require("pptxgenjs");
const path = require("path");
const { COL, THEME, defineLayouts, board, T, R, E, L, PL, dimH, dimV, SRC, TAG, STAT, FIG, NODE } = require("./lib");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const pres = new pptxgen();
pres.title = "Architectural Standards of Sports Facilities & Physical Education Faculty";
pres.author = "Architecture Studio — Design 4";
defineLayouts(pres, "DESIGN 4 · ARCHITECTURAL STANDARDS OF SPORTS FACILITIES & PHYSICAL EDUCATION FACULTY");

// ---------- Source strings (short, placed under each visual) ----------
const S = {
  FIBA: "FIBA, Official Basketball Rules 2024 (v1.0) — Rule One, Art. 2 'Court' & Diagram 1; Art. 2.4.5 team bench areas; 'Basketball Equipment' — playing floor.",
  FIVB: "FIVB, Official Volleyball Rules 2025–2028 — Rule 1 'Playing Area' (1.1 dimensions & free zone, 1.1.2 free playing space, 1.3 lines, 1.4 zones).",
  SEHALL: "Sport England, Sports Halls: Design & Layouts (2012 update) — revised 4-court hall 34.5 × 20.0 × 7.5 m.",
  GG: "SGSA, Guide to Safety at Sports Grounds ('Green Guide'), 6th ed. 2018, Ch. 12 Seated accommodation; SGSA Supplementary Guidance SG01 (2022).",
  SEACC: "Sport England, Accessible Sports Facilities — Design Guidance Note (2010): wheelchair spectator space.",
  AISF: "Sport England, Accessible & Inclusive Sports Facilities — Part D: Changing & toilet provision (2024).",
  BS9999: "BSI, BS 9999 Fire safety in the design, management and use of buildings — seating: seatway width vs. seats per row table.",
  BB103: "UK DfE, Building Bulletin 103 — Area guidelines for mainstream schools (2014): general classroom 55 m² / 30 pupils.",
  YORK: "University of York, Space Guidelines & Standards (Aug 2025) — m² per workplace by room type.",
  ADM: "HM Government, Approved Document M, Vol. 2 (2015 ed.) — Diagram 18, wheelchair-accessible unisex WC.",
  M4: "Iranian National Building Regulations (INBR), Topic 4 'General Building Requirements' (Mabhas 4), ed. 1396/2017.",
  IRACC: "Supreme Council of Urban Planning & Architecture of Iran — 'Urban & architectural regulations for people with physical-motor disabilities'.",
};

// =====================================================================
// 01 COVER
// =====================================================================
pres.addSection({ title: "Introduction" });
{
  const s = pres.addSlide({ masterName: "COVER", sectionTitle: "Introduction" });
  T(s, "ARCHITECTURE STUDIO · DESIGN 4 · STANDARDS STUDY", 0.6, 0.6, 8, 0.3, { fontSize: 10, bold: true, color: COL.accent, charSpacing: 3 });
  T(s, "ARCHITECTURAL STANDARDS OF\nSPORTS FACILITIES &\nPHYSICAL EDUCATION FACULTY", 0.6, 1.2, 7.4, 2.6, { fontSize: 30, bold: true, color: COL.ink, lineSpacingMultiple: 0.95 });
  T(s, "Space · dimensions · circulation · zoning — every standard shown as\nNUMBER + VISUAL + EXPLANATION + SOURCE", 0.6, 4.05, 7, 0.7, { fontSize: 12, color: COL.grey });
  const items = [["PART 01", "Sports facilities — basketball & volleyball"], ["PART 02", "Physical Education Faculty"], ["PART 03", "Comparative standards + references"]];
  items.forEach((it, i) => {
    T(s, it[0], 0.6, 5.2 + i * 0.42, 1.0, 0.3, { fontSize: 9, bold: true, color: COL.accent });
    T(s, it[1], 1.6, 5.2 + i * 0.42, 5.5, 0.3, { fontSize: 11, color: COL.ink });
  });
  // Motif: dimensioned court drawing (FIBA 28 × 15 m)
  const k = 0.135, x0 = 8.15, y0 = 1.75;
  R(s, pres, x0, y0, 32 * k, 19 * k, { fill: COL.panel, line: COL.line, dash: "dash" });
  const cx = x0 + 2 * k, cy = y0 + 2 * k;
  R(s, pres, cx, cy, 28 * k, 15 * k, { line: COL.ink, lw: 1.25 });
  L(s, pres, cx + 14 * k, cy, cx + 14 * k, cy + 15 * k, { lw: 1 });
  E(s, pres, cx + 14 * k - 0.3, cy + 7.5 * k - 0.3, 0.6, 0.6, { lw: 1 });
  dimH(s, pres, cx, cx + 28 * k, y0 - 0.25, "28.00 m");
  dimV(s, pres, x0 + 32 * k + 0.25, cy, cy + 15 * k, "15.00 m", { right: true });
  T(s, "FIBA court 28 × 15 m + 2 m boundary lane", x0, y0 + 19 * k + 0.12, 5.5, 0.25, { fontSize: 8, color: COL.grey });
  // Section motif with clear height
  const sy = 5.95;
  L(s, pres, x0, sy, x0 + 32 * k, sy, { lw: 1.5 });
  L(s, pres, x0, sy - 7 * 0.12, x0 + 32 * k, sy - 7 * 0.12, { lw: 0.75, dash: "dash", color: COL.grey });
  dimV(s, pres, x0 + 32 * k + 0.25, sy - 7 * 0.12, sy, "≥ 7 m", { right: true });
  FIG(s, pres, x0 + 1.0, sy, 0.4);
  FIG(s, pres, x0 + 3.2, sy, 0.4);
  T(s, "Clear height above court (FIBA) — section", x0, sy + 0.1, 5, 0.25, { fontSize: 8, color: COL.grey });
  T(s, "All standards cited on-slide · full references on final slide · 2026", 0.6, 6.85, 8, 0.25, { fontSize: 8, color: COL.mid });
}

// =====================================================================
// 02 SPORTS FACILITY ANATOMY + ZONING
// =====================================================================
pres.addSection({ title: "Part 01 — Sports facilities" });
{
  const s = board(pres, "01 — SPORTS FACILITY ANATOMY", "Ten functional parts organised around one large clear-span volume", "Part 01 — Sports facilities");
  // Zoning diagram (not to scale)
  const X = 0.6, Y = 1.45;
  // Public front
  NODE(s, pres, "PUBLIC FRONT\nentrance · foyer · reception · WC", X, Y + 4.05, 6.2, 0.75, { fill: COL.zPublic, tr: 35 });
  // Spectators
  NODE(s, pres, "SPECTATORS — seating · aisles · accessible spaces", X + 1.3, Y + 3.25, 4.9, 0.6, { fill: COL.zPublic, tr: 65 });
  // Playing space
  NODE(s, pres, "PLAYING SPACE\ncourt + safety / free zone", X + 1.3, Y + 1.0, 4.9, 2.1, { fill: COL.zSport, tr: 45, fs: 11 });
  R(s, pres, X + 1.75, Y + 1.3, 4.0, 1.5, { line: COL.ink, lw: 1 });
  // Athletes column
  NODE(s, pres, "CHANGING\n+ SHOWERS", X, Y + 1.0, 1.15, 0.95, { fill: COL.zPrivate, tr: 45 });
  NODE(s, pres, "WARM-UP\nOFFICIALS", X, Y + 2.05, 1.15, 0.6, { fill: COL.zPrivate, tr: 60 });
  NODE(s, pres, "FIRST AID", X, Y + 2.75, 1.15, 0.4, { fill: COL.zPrivate, tr: 60 });
  // Support column
  NODE(s, pres, "EQUIPMENT\nSTORE", X + 6.35, Y + 1.0, 1.1, 0.95, { fill: COL.zService, tr: 50 });
  NODE(s, pres, "CLEANING\nSTAFF", X + 6.35, Y + 2.05, 1.1, 0.6, { fill: COL.zService, tr: 65 });
  NODE(s, pres, "SECURITY\nCONTROL", X + 6.35, Y + 2.75, 1.1, 0.4, { fill: COL.zService, tr: 65 });
  NODE(s, pres, "SERVICE ENTRANCE · LOADING", X + 1.3, Y + 0.25, 6.15, 0.55, { fill: COL.zService, tr: 75 });
  NODE(s, pres, "PLAYER\nENTRANCE", X, Y + 0.25, 1.15, 0.55, { fill: COL.zPrivate, tr: 30 });
  // Key relationships
  L(s, pres, X + 1.15, Y + 1.45, X + 1.75, Y + 1.45, { color: COL.cAthlete, lw: 2, end: "triangle" });
  L(s, pres, X + 6.35, Y + 1.45, X + 5.75, Y + 1.45, { color: COL.cService, lw: 2, end: "triangle" });
  T(s, "Diagram — architectural interpretation (not to scale) of the space groups listed in Sport England sports-hall guidance.", X, Y + 4.95, 7.5, 0.3, { fontSize: 7.5, color: COL.grey, italic: true });
  // Legend
  const lg = [[COL.zPublic, "Public / spectators"], [COL.zSport, "Playing space"], [COL.zPrivate, "Athletes (controlled)"], [COL.zService, "Support / service"]];
  lg.forEach((g, i) => { R(s, pres, X + i * 1.9, Y + 5.3, 0.18, 0.18, { fill: g[0], tr: 40, line: null }); T(s, g[1], X + i * 1.9 + 0.25, Y + 5.3, 1.6, 0.2, { fontSize: 8 }); });

  // Right: the hall module — Sport England 4-court hall, plan + section
  const k = 0.115, hx = 8.45, hy = 1.8;
  T(s, "THE HALL MODULE", hx, 1.35, 4, 0.25, { fontSize: 9, bold: true, color: COL.grey, charSpacing: 2 });
  R(s, pres, hx, hy, 34.5 * k, 20 * k, { fill: COL.zSport, tr: 80, lw: 1.25 });
  // FIBA court + 2 m lane fitted
  R(s, pres, hx + (34.5 - 28) / 2 * k, hy + 2.5 * k, 28 * k, 15 * k, { line: COL.grey, lw: 0.75 });
  L(s, pres, hx + 17.25 * k, hy + 2.5 * k, hx + 17.25 * k, hy + 17.5 * k, { color: COL.grey, lw: 0.5 });
  dimH(s, pres, hx, hx + 34.5 * k, hy - 0.2, "34.5 m");
  dimV(s, pres, hx + 34.5 * k + 0.2, hy, hy + 20 * k, "20.0 m", { right: true });
  // Section
  const sy = hy + 20 * k + 1.15, hk = 0.1;
  L(s, pres, hx, sy, hx + 34.5 * k, sy, { lw: 1.5 });
  L(s, pres, hx, sy - 7.5 * hk, hx + 34.5 * k, sy - 7.5 * hk, { lw: 1 });
  L(s, pres, hx, sy, hx, sy - 7.5 * hk, { lw: 1 });
  L(s, pres, hx + 34.5 * k, sy, hx + 34.5 * k, sy - 7.5 * hk, { lw: 1 });
  dimV(s, pres, hx + 34.5 * k + 0.2, sy - 7.5 * hk, sy, "7.5 m", { right: true });
  FIG(s, pres, hx + 0.7, sy, 0.38); FIG(s, pres, hx + 2.6, sy, 0.38);
  STAT(s, "34.5 × 20.0 × 7.5 m", "Recommended 4-court hall — Sport England's minimum for school projects; replaces the older 33 × 18 m hall.", hx, sy + 0.2, 4.4, { fs: 16, gap: 0.32 });
  TAG(s, pres, "RECOMMENDED GUIDELINE", hx, sy + 1.05, "recommended");
  SRC(s, S.SEHALL, hx, sy + 1.32, 4.4);
}

// =====================================================================
// 03 BASKETBALL — COURT
// =====================================================================
{
  const s = board(pres, "02 — BASKETBALL · PLAYING SPACE", "Basketball court 28 × 15 m inside a 2 m obstruction-free boundary lane", "Part 01 — Sports facilities");
  const k = 0.185, x0 = 0.95, y0 = 1.75;
  // boundary lane
  R(s, pres, x0, y0, 32 * k, 19 * k, { fill: COL.panel, line: COL.mid, dash: "dash" });
  const cx = x0 + 2 * k, cy = y0 + 2 * k, cw = 28 * k, ch = 15 * k;
  R(s, pres, cx, cy, cw, ch, { fill: "FFFFFF", line: COL.ink, lw: 1.5 });
  L(s, pres, cx + cw / 2, cy, cx + cw / 2, cy + ch, { lw: 1 });
  E(s, pres, cx + cw / 2 - 1.8 * k, cy + ch / 2 - 1.8 * k, 3.6 * k, 3.6 * k, { lw: 1 });
  // schematic keys + three-point arcs (not dimensioned)
  [0, 1].forEach((side) => {
    const kx = side === 0 ? cx : cx + cw - 5.8 * k;
    R(s, pres, kx, cy + ch / 2 - 2.45 * k, 5.8 * k, 4.9 * k, { line: COL.ink, lw: 0.75 });
    s.addShape(pres.shapes.ARC, {
      x: (side === 0 ? cx + 1.575 * k : cx + cw - 1.575 * k) - 6.75 * k, y: cy + ch / 2 - 6.75 * k, w: 13.5 * k, h: 13.5 * k,
      angleRange: side === 0 ? [270, 90] : [90, 270], line: { color: COL.ink, width: 0.75 },
    });
  });
  // dimensions
  dimH(s, pres, cx, cx + cw, y0 - 0.28, "28.00 m — court length");
  dimV(s, pres, x0 + 32 * k + 0.28, cy, cy + ch, "15.00 m", { right: true });
  dimH(s, pres, x0, cx, cy + ch + 0.25, "2 m", { below: true });
  dimV(s, pres, x0 - 0.12, y0, cy, "2 m");
  // team benches & scorer (outside boundary lane, scorer's side)
  const by = y0 + 19 * k + 0.08;
  R(s, pres, cx + 3.0 * k, by, 8 * k, 0.32, { fill: COL.zPrivate, tr: 55, line: COL.ink });
  R(s, pres, cx + cw - 11 * k, by, 8 * k, 0.32, { fill: COL.zPrivate, tr: 55, line: COL.ink });
  R(s, pres, cx + cw / 2 - 2.5 * k, by, 5 * k, 0.32, { fill: COL.zService, tr: 60, line: COL.ink });
  T(s, "TEAM A BENCH · 16 seats", cx + 3.0 * k, by + 0.36, 2, 0.2, { fontSize: 7.5, bold: true });
  T(s, "TEAM B BENCH · 16 seats", cx + cw - 11 * k, by + 0.36, 2, 0.2, { fontSize: 7.5, bold: true });
  T(s, "SCORER'S TABLE", cx + cw / 2 - 1, by + 0.36, 2, 0.2, { fontSize: 7.5, bold: true, align: "center" });
  T(s, "Others ≥ 2 m behind team bench → spectator front row starts beyond this line", cx, by + 0.58, 6.5, 0.2, { fontSize: 7.5, color: COL.grey });
  T(s, "Plan — diagram redrawn based on FIBA OBR 2024, Diagram 1. Key and arc markings drawn schematically; only dimensioned values are cited.", x0, by + 0.82, 7.2, 0.3, { fontSize: 7.5, italic: true, color: COL.grey });

  // Right column: standards cards
  const rx = 8.85;
  STAT(s, "28 × 15 m", "Court, measured from inner edge of boundary line; 'flat, hard surface free from obstructions'.", rx, 1.4, 3.9);
  TAG(s, pres, "INTERNATIONAL COMPETITION STANDARD", rx, 2.32, "competition");
  STAT(s, "≥ 2 m", "Obstruction-free boundary lane around the court → whole floor ≥ 32 × 19 m.", rx, 2.7, 3.9);
  STAT(s, "≥ 7 m", "Height of ceiling / lowest obstruction above the court (lights, ducts, trusses).", rx, 3.75, 3.9);
  STAT(s, "16 seats", "Per team bench area, marked outside the court on the scorer's-table side.", rx, 4.8, 3.9);
  // mini section
  const sy = 6.35, sx = rx;
  L(s, pres, sx, sy, sx + 3.2, sy, { lw: 1.5 });
  L(s, pres, sx, sy - 0.7, sx + 3.2, sy - 0.7, { lw: 0.75, dash: "dash", color: COL.grey });
  dimV(s, pres, sx + 3.35, sy - 0.7, sy, "7 m", { right: true });
  FIG(s, pres, sx + 0.5, sy, 0.36); FIG(s, pres, sx + 1.4, sy, 0.36);
  T(s, "Section — clear height governs roof structure depth", sx, sy + 0.05, 3.9, 0.2, { fontSize: 7.5, color: COL.grey });
  SRC(s, S.FIBA, 0.95, 6.55, 11.9, { h: 0.25 });
  T(s, "WHY IT MATTERS  The 32 × 19 m floor + 7 m clear height fixes the minimum structural bay and roof depth; storage, benches and seating must all sit outside the 2 m lane.", 0.75, 6.84, 11.8, 0.25, { fontSize: 8, bold: false, color: COL.ink });
}

// =====================================================================
// 04 BASKETBALL — SPECTATORS
// =====================================================================
{
  const s = board(pres, "03 — BASKETBALL · SPECTATOR AREA", "Seating section: seat, row, riser, aisle and sightline (C-value)", "Part 01 — Sports facilities");
  // Section drawing — 1 m = 0.55 in
  const m = 0.7, gx = 0.7, gy = 5.75; // floor of court
  L(s, pres, gx, gy, gx + 2.4, gy, { lw: 2 }); // court floor
  T(s, "COURT", gx, gy + 0.05, 1.2, 0.2, { fontSize: 8, bold: true });
  const P = { x: gx + 1.1, y: gy }; // point of focus = touchline
  E(s, pres, P.x - 0.05, P.y - 0.05, 0.1, 0.1, { fill: COL.accent, line: null });
  T(s, "point of focus\n(touchline)", P.x - 0.55, gy + 0.22, 1.2, 0.35, { fontSize: 7, color: COL.accent, align: "center" });
  // free lane + bench zone
  dimH(s, pres, P.x, gx + 2.4, gy + 0.62, "2 m lane + bench zone", { below: true, fs: 7.5 });
  // tiers
  const rows = 6, T_ = 0.8 * m, N = 0.4 * m; // drawn row depth / riser (schematic)
  let x = gx + 2.4, y = gy - 0.3 * m;
  L(s, pres, gx + 2.4, gy, gx + 2.4, y, { lw: 1.5 });
  const eyes = [];
  for (let i = 0; i < rows; i++) {
    L(s, pres, x, y, x + T_, y, { lw: 1.5 });
    L(s, pres, x + T_, y, x + T_, y - N, { lw: 1.5 });
    // seat (simple)
    R(s, pres, x + T_ * 0.45, y - 0.45 * m, T_ * 0.3, 0.06, { fill: COL.grey, line: null });
    R(s, pres, x + T_ * 0.72, y - 0.85 * m, 0.05, 0.42 * m, { fill: COL.grey, line: null });
    const ex = x + T_ * 0.6, ey = y - 1.2 * m;
    E(s, pres, ex - 0.07, ey - 0.07, 0.14, 0.17, { line: COL.ink, lw: 0.75 });
    eyes.push([ex, ey]);
    x += T_; y -= N;
  }
  // sightlines
  [0, 3, 5].forEach((i) => L(s, pres, eyes[i][0], eyes[i][1], P.x, P.y, { color: COL.accent, lw: 0.75, dash: "dash" }));
  // C-value callout between row 3 and 4
  const e3 = eyes[3], e2 = eyes[2];
  L(s, pres, e2[0] + 0.25, e2[1] - 0.12, e3[0] - 0.4, e3[1] + 0.6, { color: COL.ink, lw: 0.5 });
  T(s, "C = vertical clearance of sightline\nover the head in front", e3[0] - 2.6, e3[1] - 1.0, 2.2, 0.35, { fontSize: 7.5, bold: true });
  // dims
  const r1x = gx + 2.4 + T_;
  dimH(s, pres, gx + 2.4 + T_ * 2, gx + 2.4 + T_ * 3, gy - 0.3 * m - 2 * N + 0.25, "row depth ≥ 700 mm", { below: true, fs: 7.5 });
  dimV(s, pres, gx + 2.4 + T_ * 6 + 0.25, gy - 0.3 * m - 6 * N, gy - 0.3 * m - 5 * N, "riser = from C-value calc.", { right: true, fs: 7.5 });
  // gangway marker at top
  T(s, "radial gangway ≥ 1.2 m (see plan) →", gx + 3.6, 2.05, 3.0, 0.2, { fontSize: 7.5, bold: true, color: COL.cPublic });
  // wheelchair platform at top
  const wx = gx + 2.4 + T_ * 6, wy = gy - 0.3 * m - 6 * N;
  R(s, pres, wx, wy - 0.02, 1.4 * m, 0.02, { fill: COL.ink, line: null });
  T(s, "accessible\nplatform", wx, wy - 0.42, 0.9, 0.35, { fontSize: 7, color: COL.zPrivate, bold: true });
  T(s, "Section — diagram redrawn based on Green Guide Ch. 12 sightline geometry (rows/risers drawn schematically; riser height is calculated, not fixed).", 0.7, 6.55, 6.9, 0.25, { fontSize: 7.5, italic: true, color: COL.grey });
  // formula
  T(s, [{ text: "C = D(N + R) / (D + T) − R", options: { bold: true, fontSize: 11 } }, { text: "\nD = horizontal eye-to-focus distance · N = riser · R = eye height above focus · T = row depth", options: { fontSize: 7.5, color: COL.grey } }], 0.7, 1.4, 6.6, 0.6);

  // Right: plan inset + cards
  const px = 8.1, py = 1.45, mm = 0.0009; // in per mm
  T(s, "PLAN — SEATING ROW", px, py, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  for (let i = 0; i < 6; i++) R(s, pres, px + i * 500 * mm, py + 0.3, 500 * mm - 0.04, 0.32, { fill: COL.zPublic, tr: 55, line: COL.ink, lw: 0.5 });
  dimH(s, pres, px, px + 500 * mm, py + 0.85, "500", { below: true, fs: 7.5 });
  R(s, pres, px + 6 * 500 * mm + 0.08, py + 0.3, 1200 * mm, 0.32, { fill: "FFFFFF", line: COL.cPublic, dash: "dash" });
  T(s, "gangway\n≥ 1200", px + 6 * 500 * mm + 0.08, py + 0.3, 1200 * mm, 0.32, { fontSize: 6.5, color: COL.cPublic, align: "center", valign: "middle" });
  // wheelchair space
  R(s, pres, px + 0.6, py + 1.15, 1400 * mm, 900 * mm, { fill: COL.zPrivate, tr: 60, line: COL.ink });
  T(s, "WHEELCHAIR SPACE", px + 0.6, py + 1.15, 1400 * mm, 900 * mm, { fontSize: 6.5, bold: true, align: "center", valign: "middle" });
  R(s, pres, px + 0.6 + 1400 * mm + 0.04, py + 1.15, 500 * mm - 0.04, 900 * mm * 0.5, { fill: COL.zPublic, tr: 55, line: COL.ink, lw: 0.5 });
  T(s, "companion", px + 0.6 + 1400 * mm + 0.5, py + 1.2, 1, 0.2, { fontSize: 6.5, color: COL.grey });
  dimH(s, pres, px + 0.6, px + 0.6 + 1400 * mm, py + 1.15 + 900 * mm + 0.14, "1400", { below: true, fs: 7.5 });
  dimV(s, pres, px + 0.45, py + 1.15, py + 1.15 + 900 * mm, "900", { fs: 7.5 });

  const cx = 8.1, cy = 3.72;
  const rowsT = [
    ["500 mm", "Seat width, new construction (460 mm existing).", "recommended", "RECOMMENDED"],
    ["≥ 700 mm", "Seating row depth.", "recommended", "RECOMMENDED"],
    ["90 mm (60 min.)", "C-value for new seated areas: 90–120 mm; 60 mm practical minimum.", "recommended", "RECOMMENDED"],
    ["≤ 28 seats", "Per row between two gangways (≤ 14 with a gangway on one side); gangway ≥ 1.2 m.", "recommended", "RECOMMENDED"],
    ["1400 × 900 mm", "Wheelchair-user spectator space, with companion seat alongside.", "recommended", "RECOMMENDED"],
  ];
  rowsT.forEach((r, i) => {
    T(s, r[0], cx, cy + i * 0.41, 1.75, 0.3, { fontSize: 12, bold: true });
    T(s, r[1], cx + 1.8, cy + i * 0.41 + 0.01, 3.0, 0.4, { fontSize: 8, color: COL.grey });
  });
  TAG(s, pres, "RECOMMENDED GUIDELINE (UK)", 8.1, 5.78, "recommended");
  SRC(s, S.GG + "  Wheelchair space: " + S.SEACC, 8.1, 6.05, 4.75, { h: 0.6 });
  T(s, "WHY IT MATTERS  Sightlines, not seat counts, set the rake: rake + row depth decide hall height, stair geometry and the depth of the spectator zone beside the court.", 0.7, 6.84, 12, 0.25, { fontSize: 8 });
}

// =====================================================================
// 05 BASKETBALL — ATHLETES + SUPPORT
// =====================================================================
{
  const s = board(pres, "04 — BASKETBALL · ATHLETES, CHANGING & SUPPORT", "Controlled athlete sequence + a service spine that never crosses the public", "Part 01 — Sports facilities");
  // Athlete flow
  const fx = 0.7, fy = 1.45, fw = 2.6, fh = 0.55, gap = 0.27;
  T(s, "ATHLETE SEQUENCE", fx, fy, 3, 0.25, { fontSize: 9, bold: true, color: COL.grey, charSpacing: 2 });
  const steps = ["PLAYER ENTRANCE", "CHANGING ROOM", "SHOWERS / WC", "WARM-UP", "SPORTS HALL"];
  steps.forEach((t, i) => {
    const y = fy + 0.35 + i * (fh + gap);
    NODE(s, pres, t, fx, y, fw, fh, { fill: i === 4 ? COL.zSport : COL.zPrivate, tr: i === 4 ? 40 : 55, fs: 9 });
    if (i < steps.length - 1) L(s, pres, fx + fw / 2, y + fh, fx + fw / 2, y + fh + gap, { color: COL.cAthlete, lw: 2, end: "triangle" });
  });
  // side branches
  const by = fy + 0.35;
  NODE(s, pres, "OFFICIALS' ROOM", fx + 3.0, by + 1 * (fh + gap), 1.75, 0.45, { fill: COL.zPrivate, tr: 75, fs: 8 });
  NODE(s, pres, "COACHES / TEAM AREA", fx + 3.0, by + 3 * (fh + gap), 1.75, 0.45, { fill: COL.zPrivate, tr: 75, fs: 8 });
  NODE(s, pres, "FIRST AID / MEDICAL", fx + 3.0, by + 4 * (fh + gap) + 0.05, 1.75, 0.45, { fill: "FFFFFF", fs: 8, line: COL.accent });
  L(s, pres, fx + fw, by + 1 * (fh + gap) + 0.25, fx + 3.0, by + 1 * (fh + gap) + 0.22, { color: COL.ink, lw: 0.75, dash: "dash" });
  L(s, pres, fx + fw, by + 3 * (fh + gap) + 0.25, fx + 3.0, by + 3 * (fh + gap) + 0.22, { color: COL.ink, lw: 0.75, dash: "dash" });
  L(s, pres, fx + fw, by + 4 * (fh + gap) + 0.28, fx + 3.0, by + 4 * (fh + gap) + 0.28, { color: COL.accent, lw: 1.25, begin: "triangle", end: "triangle" });
  T(s, "direct, step-free route to court AND to an external ambulance point", fx + 3.0, by + 4 * (fh + gap) + 0.52, 2.4, 0.4, { fontSize: 7.5, color: COL.accent });
  T(s, "Bench: 16 seats / team (FIBA Art. 2.4.5) — team area sits between the athlete corridor and the court.", fx, 6.05, 5.4, 0.4, { fontSize: 8 });

  // Support zoning
  const zx = 6.4, zy = 1.45;
  T(s, "SUPPORT / BACK-OF-HOUSE ZONING", zx, zy, 5, 0.25, { fontSize: 9, bold: true, color: COL.grey, charSpacing: 2 });
  R(s, pres, zx + 1.6, zy + 0.45, 3.6, 2.6, { fill: COL.zSport, tr: 55, lw: 1.25 });
  T(s, "SPORTS HALL", zx + 1.6, zy + 1.5, 3.6, 0.3, { fontSize: 10, bold: true, align: "center" });
  NODE(s, pres, "EQUIPMENT\nSTORE\n(floor level,\nwide doors)", zx + 5.25, zy + 0.45, 1.25, 1.35, { fill: COL.zService, tr: 50, fs: 7.5 });
  NODE(s, pres, "CLEANING", zx + 5.25, zy + 1.9, 1.25, 0.5, { fill: COL.zService, tr: 65, fs: 7.5 });
  NODE(s, pres, "SERVICE ENTRANCE\n+ LOADING", zx + 5.25, zy + 2.5, 1.25, 0.55, { fill: COL.zService, tr: 30, fs: 7.5, color: "FFFFFF" });
  NODE(s, pres, "CHANGING\n+ OFFICIALS", zx, zy + 0.45, 1.55, 1.1, { fill: COL.zPrivate, tr: 55, fs: 7.5 });
  NODE(s, pres, "FIRST AID", zx, zy + 1.65, 1.55, 0.55, { fill: "FFFFFF", line: COL.accent, fs: 7.5 });
  NODE(s, pres, "STAFF ROOM", zx, zy + 2.3, 1.55, 0.75, { fill: COL.zService, tr: 70, fs: 7.5 });
  NODE(s, pres, "SECURITY / CONTROL", zx + 1.6, zy + 3.15, 1.75, 0.5, { fill: COL.zService, tr: 70, fs: 7.5 });
  NODE(s, pres, "PUBLIC FOYER", zx + 3.45, zy + 3.15, 1.75, 0.5, { fill: COL.zPublic, tr: 45, fs: 7.5 });
  // service arrows
  PL(s, pres, [[zx + 5.88, zy + 2.5], [zx + 5.88, zy + 1.85]], { color: COL.cService, lw: 1.75, dash: "dash" });
  L(s, pres, zx + 5.25, zy + 1.1, zx + 5.2, zy + 1.1, { color: COL.cService, lw: 1.75, end: "triangle" });
  L(s, pres, zx + 1.55, zy + 1.0, zx + 1.6, zy + 1.0, { color: COL.cAthlete, lw: 1.75, end: "triangle" });
  T(s, "Zoning diagram — architectural interpretation; positions are relational, not dimensional.", zx, zy + 3.7, 6.2, 0.25, { fontSize: 7.5, italic: true, color: COL.grey });
  // principles
  const pr = [
    ["Store → hall", "Equipment store opens directly onto the playing floor at the same level."],
    ["Service ≠ public", "Loading and cleaning reach the hall without crossing foyer or spectators."],
    ["Control point", "Security sits at the junction of public foyer and controlled zones."],
    ["Medical", "First aid is adjacent to both changing and court; ambulance access outside."],
  ];
  pr.forEach((p, i) => {
    const px = zx + (i % 2) * 3.25, py = zy + 3.98 + Math.floor(i / 2) * 0.53;
    T(s, p[0], px, py, 3.1, 0.22, { fontSize: 9, bold: true });
    T(s, p[1], px, py + 0.22, 3.1, 0.4, { fontSize: 8, color: COL.grey });
  });
  SRC(s, "Planning principles — Sport England, Sports Halls: Design & Layouts (2012) support accommodation; Sport England AISF Part D (2024). Bench: " + S.FIBA.split("—")[0] + "Art. 2.4.5.", 0.7, 6.55, 12, { h: 0.3 });
  T(s, "No dimensions are shown for support rooms: sizes depend on brief and capacity; none were verified as fixed standards for this study.", 0.7, 6.84, 12, 0.25, { fontSize: 8, color: COL.ink });
}

// =====================================================================
// 06 VOLLEYBALL — COURT + HALL FIT + SPECTATORS/PLAYERS
// =====================================================================
{
  const s = board(pres, "05 — VOLLEYBALL · PLAYING SPACE, HEIGHT & HALL FIT", "Volleyball 18 × 9 m: free zone + 12.5 m height decide if a hall can host official play", "Part 01 — Sports facilities");
  const k = 0.155, x0 = 0.75, y0 = 1.85;
  // FIVB competition envelope 31 x 19
  R(s, pres, x0, y0, 31 * k, 19 * k, { fill: COL.panel, line: COL.accent, dash: "dash" });
  // min free zone 3 m → 24 x 15
  const ax = x0 + 6.5 * k - 3 * k, ay = y0 + 5 * k - 3 * k;
  R(s, pres, ax, ay, 24 * k, 15 * k, { fill: "FFFFFF", line: COL.grey, dash: "dash" });
  const cx = x0 + 6.5 * k, cy = y0 + 5 * k, cw = 18 * k, ch = 9 * k;
  R(s, pres, cx, cy, cw, ch, { fill: COL.zSport, tr: 60, line: COL.ink, lw: 1.5 });
  L(s, pres, cx + cw / 2, cy - 0.15, cx + cw / 2, cy + ch + 0.15, { lw: 2.25 }); // net/centre
  L(s, pres, cx + cw / 2 - 3 * k, cy, cx + cw / 2 - 3 * k, cy + ch, { lw: 0.75 });
  L(s, pres, cx + cw / 2 + 3 * k, cy, cx + cw / 2 + 3 * k, cy + ch, { lw: 0.75 });
  dimH(s, pres, cx, cx + cw, cy - 0.2, "18 m", { fs: 8 });
  dimV(s, pres, cx - 0.15, cy, cy + ch, "9 m", { fs: 8 });
  dimH(s, pres, cx + cw / 2, cx + cw / 2 + 3 * k, cy + ch + 0.12, "3 m", { below: true, fs: 7 });
  dimH(s, pres, cx + cw, cx + cw + 3 * k, cy + ch / 2, "3 m", { fs: 7 });
  dimH(s, pres, cx + cw + 3 * k, cx + cw + 6.5 * k, cy + ch / 2 + 0.3, "6.5", { fs: 7 });
  dimV(s, pres, cx + cw * 0.25, cy + ch, cy + ch + 5 * k, "5 m", { fs: 7 });
  T(s, "NET / CENTRE LINE", cx + cw / 2 - 0.8, y0 + 0.05, 1.6, 0.2, { fontSize: 7, bold: true, align: "center" });
  T(s, "attack lines 3 m from centre line · all lines 5 cm wide", x0, 4.95, 4.6, 0.2, { fontSize: 7, color: COL.grey });
  // legend
  const lg = [["solid", COL.ink, "Court 18 × 9 m"], ["dash", COL.grey, "Min. free zone 3 m → 24 × 15 m"], ["dash", COL.accent, "FIVB / World / Official: 5 m sides, 6.5 m ends → 31 × 19 m"]];
  lg.forEach((g, i) => { L(s, pres, x0, 5.35 + i * 0.24, x0 + 0.4, 5.35 + i * 0.24, { color: g[1], dash: g[0], lw: 1.25 }); T(s, g[2], x0 + 0.5, 5.26 + i * 0.24, 4.6, 0.2, { fontSize: 8 }); });
  T(s, "Plan — diagram redrawn based on FIVB Rules 2025–28, Rule 1 & Diagram 1a/1b.", x0, 6.05, 5, 0.2, { fontSize: 7.5, italic: true, color: COL.grey });

  // Heights section
  const hx = 5.8, hy = 5.45, hk = 0.26;
  T(s, "SECTION — FREE PLAYING SPACE", hx, 1.4, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  L(s, pres, hx, hy, hx + 2.8, hy, { lw: 1.75 });
  [[7, COL.grey, "7 m general"], [7.5, COL.zSport, "7.5 m SE hall"], [12.5, COL.accent, "12.5 m FIVB official"]].forEach((h, i) => {
    L(s, pres, hx, hy - h[0] * hk, hx + 2.6, hy - h[0] * hk, { color: h[1], lw: 1.25, dash: i === 1 ? "solid" : "dash" });
    T(s, h[2], hx + 0.05, hy - h[0] * hk + (i === 0 ? 0.03 : -0.2), 2.5, 0.18, { fontSize: 7.5, bold: true, color: h[1] });
  });
  L(s, pres, hx + 1.3, hy, hx + 1.3, hy - 2.43 * hk, { lw: 2.25 });
  T(s, "net 2.43 m (men)\n2.24 m (women)", hx + 1.4, hy - 2.43 * hk - 0.05, 1.3, 0.35, { fontSize: 7, color: COL.grey });
  FIG(s, pres, hx + 0.5, hy, 0.47); FIG(s, pres, hx + 2.1, hy, 0.47);

  // Fit-check table
  const tx = 9.2, ty = 1.4;
  T(s, "HALL FIT-CHECK  (SE 34.5 × 20 × 7.5 m)", tx, ty, 3.6, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  const rows = [
    ["Layout", "Footprint", "Fits?"],
    ["Volleyball + 3 m", "24 × 15 m · 7 m", "YES"],
    ["Volleyball FIVB", "31 × 19 m · 12.5 m", "PLAN ✓\nHEIGHT ✗"],
    ["Basketball + 2 m", "32 × 19 m · 7 m", "YES"],
  ];
  s.addTable(rows.map((r, i) => r.map((c) => ({ text: c, options: { bold: i === 0 || c.startsWith("YES") || c.includes("✗"), color: c.includes("✗") ? COL.accent : COL.ink, fill: { color: i === 0 ? COL.panel : "FFFFFF" } } }))), {
    x: tx, y: ty + 0.3, w: 3.65, colW: [1.25, 1.35, 1.05], fontSize: 8, fontFace: "Arial", border: { type: "solid", color: COL.line, pt: 0.5 }, margin: 0.05, rowH: 0.36,
  });
  TAG(s, pres, "CALCULATION FROM CITED VALUES", tx, ty + 1.95, "calc");
  T(s, "A standard 4-court hall accepts every court in plan, but only competition-grade volume (≥ 12.5 m) hosts FIVB-level play → decide the competition level BEFORE fixing roof height.", tx, ty + 2.25, 3.65, 0.9, { fontSize: 8.5 });
  // spectators / players note
  T(s, "SPECTATORS · PLAYERS · SUPPORT", tx, ty + 3.2, 3.6, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  T(s, [
    { text: "Spectators: ", options: { bold: true } }, { text: "same Green Guide seat/row/C-value rules as slide 04; front row starts beyond the free zone (5 / 6.5 m at official level).", options: { breakLine: true } },
    { text: "Players: ", options: { bold: true } }, { text: "team benches beside the scorer's table, outside the free zone (Rule 1.4).", options: { breakLine: true } },
    { text: "Changing / support: ", options: { bold: true } }, { text: "identical sequence to basketball — the hall is shared.", options: {} },
  ], tx, ty + 3.45, 3.55, 1.3, { fontSize: 8, paraSpaceAfter: 3 });
  SRC(s, S.FIVB + "  Hall: " + S.SEHALL, 0.75, 6.42, 12, { h: 0.3 });
  T(s, "TYPES  18 × 9 m, 3 m free zone, 7 m height = rule for all play · 5 / 6.5 m + 12.5 m = FIVB, World & Official competitions only.", 0.75, 6.84, 12, 0.25, { fontSize: 8 });
}

// =====================================================================
// 07 CIRCULATION — ATHLETE / PUBLIC / SERVICE
// =====================================================================
{
  const s = board(pres, "06 — CIRCULATION SYSTEMS", "Three separate flows meet only at the court edge — and only by design", "Part 01 — Sports facilities");
  const X = 1.25, Y = 1.45, W = 7.3, H = 4.35;
  // building outline
  R(s, pres, X, Y, W, H, { line: COL.ink, lw: 1.5 });
  // zones
  R(s, pres, X + 2.0, Y + 0.7, 3.6, 2.1, { fill: COL.zSport, tr: 55, line: COL.ink });
  T(s, "SPORTS HALL", X + 2.0, Y + 1.6, 3.6, 0.3, { fontSize: 10, bold: true, align: "center" });
  R(s, pres, X + 2.0, Y + 2.8, 3.6, 0.6, { fill: COL.zPublic, tr: 55, line: COL.ink });
  T(s, "SPECTATOR SEATING", X + 2.0, Y + 2.8, 3.6, 0.6, { fontSize: 8, bold: true, align: "center", valign: "middle" });
  R(s, pres, X + 2.0, Y + 3.4, 3.6, 0.95, { fill: COL.zPublic, tr: 75, line: COL.ink });
  T(s, "RECEPTION · FOYER · WC", X + 2.0, Y + 3.6, 3.6, 0.3, { fontSize: 8, bold: true, align: "center" });
  R(s, pres, X, Y, 2.0, 2.0, { fill: COL.zPrivate, tr: 55, line: COL.ink });
  T(s, "CHANGING\nSHOWERS · WC", X, Y + 0.6, 2.0, 0.6, { fontSize: 8, bold: true, align: "center" });
  R(s, pres, X, Y + 2.0, 2.0, 0.8, { fill: COL.zPrivate, tr: 75, line: COL.ink });
  T(s, "WARM-UP", X, Y + 2.1, 2.0, 0.3, { fontSize: 8, bold: true, align: "center" });
  R(s, pres, X + 5.6, Y, 1.7, 2.8, { fill: COL.zService, tr: 60, line: COL.ink });
  T(s, "STORAGE\nEQUIPMENT\nPLANT", X + 5.6, Y + 0.9, 1.7, 0.7, { fontSize: 8, bold: true, align: "center" });
  // flows
  PL(s, pres, [[X - 0.45, Y + 0.45], [X + 0.6, Y + 0.45], [X + 0.6, Y + 2.45], [X + 1.6, Y + 2.45], [X + 2.3, Y + 2.0]], { color: COL.cAthlete, lw: 2.5 });
  T(s, "PLAYER\nENTRANCE", X - 0.7, Y + 0.0, 0.8, 0.35, { fontSize: 7, bold: true, color: COL.cAthlete });
  PL(s, pres, [[X + 3.4, Y + H + 0.4], [X + 3.4, Y + 3.8], [X + 2.7, Y + 3.5], [X + 2.7, Y + 3.05]], { color: COL.cPublic, lw: 2.5, dash: "dash" });
  PL(s, pres, [[X + 4.8, Y + 3.1], [X + 5.2, Y + 3.8], [X + 5.2, Y + H + 0.4]], { color: COL.cPublic, lw: 2.5, dash: "dash" });
  T(s, "MAIN ENTRANCE", X + 2.2, Y + H + 0.42, 1.2, 0.2, { fontSize: 7, bold: true, color: COL.cPublic });
  T(s, "EXIT", X + 5.3, Y + H + 0.22, 0.6, 0.2, { fontSize: 7, bold: true, color: COL.cPublic });
  PL(s, pres, [[X + W + 0.45, Y + 0.4], [X + 6.6, Y + 0.4], [X + 6.6, Y + 1.75], [X + 5.8, Y + 1.75], [X + 5.2, Y + 1.75]], { color: COL.cService, lw: 2.5, dash: "lgDashDot" });
  T(s, "SERVICE\nENTRANCE", X + W + 0.05, Y + 0.05, 0.9, 0.35, { fontSize: 7, bold: true, color: COL.cService });
  // conflict point
  E(s, pres, X + 1.75, Y + 2.55, 0.5, 0.5, { line: COL.accent, lw: 1.5, dash: "dash" });
  T(s, "controlled crossing\n(court edge only)", X + 0.05, Y + 3.1, 1.9, 0.35, { fontSize: 7, color: COL.accent, align: "center" });
  T(s, "Circulation diagram — architectural interpretation (principle, not a specific building).", X, 6.35, 7.3, 0.2, { fontSize: 7.5, italic: true, color: COL.grey });

  // legend + rules
  const lx = 9.2;
  const lg = [
    [COL.cAthlete, "solid", "ATHLETE", "Player entrance → changing → shower → warm-up → court"],
    [COL.cPublic, "dash", "PUBLIC", "Main entrance → reception → spectator zone → seating → exit"],
    [COL.cService, "lgDashDot", "SERVICE", "Service entrance → storage → equipment → sports hall"],
  ];
  lg.forEach((g, i) => {
    const y = 1.55 + i * 0.95;
    L(s, pres, lx, y + 0.12, lx + 0.7, y + 0.12, { color: g[0], dash: g[1], lw: 2.5, end: "triangle" });
    T(s, g[2], lx + 0.85, y, 2.5, 0.25, { fontSize: 10, bold: true, color: g[0] });
    T(s, g[3], lx + 0.85, y + 0.28, 3.0, 0.55, { fontSize: 8.5, color: COL.grey });
  });
  T(s, "DESIGN RULES", lx, 4.5, 3, 0.25, { fontSize: 9, bold: true, color: COL.grey, charSpacing: 2 });
  T(s, [
    { text: "Separate entrances on different façades.", options: { bullet: true, breakLine: true } },
    { text: "Spectators never pass through changing or store zones.", options: { bullet: true, breakLine: true } },
    { text: "Service reaches the hall floor level without steps.", options: { bullet: true, breakLine: true } },
    { text: "Exits sized and located per fire regulation (INBR Topic 3) — verify for the chosen occupancy.", options: { bullet: true } },
  ], lx, 4.8, 3.7, 1.6, { fontSize: 8.5, paraSpaceAfter: 4 });
  SRC(s, "Principle drawn from Sport England sports-hall guidance (zoning of changing, storage, spectator & public areas); fire exits — INBR Topic 3 (Mabhas 3, fire protection).", 0.7, 6.8, 12, { h: 0.25 });
}

// =====================================================================
// 08 CHANGING ROOMS + SHOWERS
// =====================================================================
{
  const s = board(pres, "07 — CHANGING ROOMS + SHOWERS + ATHLETE SUPPORT", "Dry → transition → wet: a one-way sequence from entrance to hall", "Part 01 — Sports facilities");
  const X = 0.7, Y = 1.55, k = 0.62; // 1 m = 0.62 in
  // overall room 10 m x 7 m (layout drawn by author)
  R(s, pres, X, Y, 10 * k, 7 * k, { line: COL.ink, lw: 2 });
  // dry zone
  R(s, pres, X, Y, 6 * k, 7 * k, { fill: COL.zPrivate, tr: 82, line: null });
  // wet zone
  R(s, pres, X + 6 * k, Y, 4 * k, 4.5 * k, { fill: COL.zSemi, tr: 60, line: null });
  R(s, pres, X + 6 * k, Y + 4.5 * k, 4 * k, 2.5 * k, { fill: COL.panel, line: null });
  L(s, pres, X + 6 * k, Y, X + 6 * k, Y + 7 * k, { lw: 1, dash: "dash", color: COL.grey });
  // lockers along top wall
  for (let i = 0; i < 10; i++) R(s, pres, X + 0.15 + i * 0.5 * k, Y + 0.05, 0.5 * k - 0.02, 0.35, { fill: "FFFFFF", line: COL.ink, lw: 0.5 });
  T(s, "LOCKERS", X + 0.15, Y + 0.42, 2, 0.2, { fontSize: 7, bold: true });
  // benches
  R(s, pres, X + 0.15, Y + 1.35, 5.4 * k, 0.4 * k, { fill: COL.grey, tr: 30, line: COL.ink, lw: 0.5 });
  R(s, pres, X + 0.15, Y + 3.0, 5.4 * k, 0.4 * k, { fill: COL.grey, tr: 30, line: COL.ink, lw: 0.5 });
  for (let i = 1; i < 6; i++) L(s, pres, X + 0.15 + i * 0.55, Y + 3.0, X + 0.15 + i * 0.55, Y + 3.0 + 0.4 * k, { lw: 0.5 });
  dimH(s, pres, X + 0.15, X + 0.15 + 0.55, Y + 3.0 + 0.4 * k + 0.12, "500 / person", { below: true, fs: 7 });
  T(s, "BENCH + HOOKS", X + 0.15, Y + 1.12, 2, 0.2, { fontSize: 7, bold: true });
  // showers (communal) along top of wet zone
  for (let i = 0; i < 4; i++) {
    const sx = X + 6 * k + 0.3 + i * 0.75 * k;
    E(s, pres, sx, Y + 0.12, 0.13, 0.13, { line: COL.ink, lw: 0.75 });
  }
  dimH(s, pres, X + 6 * k + 0.365, X + 6 * k + 0.365 + 0.75 * k, Y + 0.55, "750", { below: true, fs: 7 });
  T(s, "COMMUNAL SHOWERS", X + 6 * k + 0.15, Y + 0.8, 2.3, 0.2, { fontSize: 7, bold: true });
  // cubicle shower
  R(s, pres, X + 6 * k + 0.15, Y + 1.7, 0.9 * k, 0.9 * k, { line: COL.ink });
  T(s, "cubicle\n800 min.\n900 pref.", X + 6 * k + 0.15 + 0.9 * k + 0.08, Y + 1.7, 1.0, 0.5, { fontSize: 7, color: COL.ink });
  // drying area
  T(s, "DRYING ZONE\n(transition, drained floor)", X + 6 * k + 0.15, Y + 2.35, 2.4, 0.35, { fontSize: 7, bold: true });
  // WCs
  for (let i = 0; i < 2; i++) R(s, pres, X + 6 * k + 0.2 + i * 1.1, Y + 4.5 * k + 0.3, 1.0, 1.0, { line: COL.ink });
  T(s, "WC", X + 6 * k + 0.2, Y + 4.5 * k + 0.6, 1.0, 0.3, { fontSize: 8, bold: true, align: "center" });
  T(s, "WC", X + 6 * k + 1.3, Y + 4.5 * k + 0.6, 1.0, 0.3, { fontSize: 8, bold: true, align: "center" });
  // entrance & exit
  L(s, pres, X - 0.55, Y + 6.3 * k, X + 0.4, Y + 6.3 * k, { color: COL.cAthlete, lw: 2.5, end: "triangle" });
  T(s, "ENTRY\nfrom athlete\ncorridor", X - 0.6, Y + 6.3 * k + 0.08, 0.8, 0.5, { fontSize: 6.5, bold: true, color: COL.cAthlete });
  PL(s, pres, [[X + 0.6, Y + 6.3 * k], [X + 3.0, Y + 6.3 * k], [X + 3.0, Y + 2.3], [X + 3.9, Y + 2.3], [X + 4.3, Y + 1.25]], { color: COL.cAthlete, lw: 1.25, dash: "dash" });
  PL(s, pres, [[X + 3.0, Y + 6.3 * k], [X + 10 * k + 0.55, Y + 6.3 * k]], { color: COL.cAthlete, lw: 2.5 });
  T(s, "TO WARM-UP /\nSPORTS HALL", X + 10 * k + 0.05, Y + 6.3 * k + 0.08, 1.2, 0.35, { fontSize: 6.5, bold: true, color: COL.cAthlete });
  T(s, "DRY ZONE", X + 0.15, Y + 2.25, 2, 0.25, { fontSize: 9, bold: true, color: COL.zPrivate });
  T(s, "WET ZONE", X + 6 * k + 1.3, Y + 1.15, 1.2, 0.25, { fontSize: 9, bold: true, color: COL.cPublic });
  T(s, "Plan — illustrative layout by the author; only the labelled component dimensions (mm) are cited. Room size is not a standard.", X, Y + 7 * k + 0.12, 6.6, 0.3, { fontSize: 7.5, italic: true, color: COL.grey });

  // Right column
  const rx = 8.45;
  STAT(s, "500 mm", "Bench length per person (changing).", rx, 1.45, 2.0, { fs: 20, gap: 0.38 });
  STAT(s, "750 mm", "Spacing between heads, communal shower.", rx + 2.2, 1.45, 2.0, { fs: 20, gap: 0.38 });
  STAT(s, "800 / 900", "Min. / preferred manoeuvring width in a shower cubicle (mm).", rx, 2.45, 2.1, { fs: 20, gap: 0.38 });
  TAG(s, pres, "TYPICAL PLANNING VALUE", rx, 3.4, "typical");
  T(s, "Values as quoted from Sport England changing guidance by UK changing-room specifiers — verify in the current Sport England note before use.", rx, 3.65, 4.3, 0.5, { fontSize: 7.5, color: COL.grey });
  T(s, "ACCESSIBLE CHANGING", rx, 4.25, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  T(s, "Provide a separate accessible changing room with its own WC + shower on the same step-free route; Sport England AISF Part D sets layouts and grab-rail positions.", rx, 4.5, 4.3, 0.7, { fontSize: 8.5 });
  T(s, "ATHLETE FLOW", rx, 5.25, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  ["CHANGING", "SHOWER", "WC", "WARM-UP", "HALL"].forEach((t, i) => {
    NODE(s, pres, t, rx + i * 0.88, 5.5, 0.75, 0.38, { fill: i === 4 ? COL.zSport : COL.zPrivate, tr: 55, fs: 6.5 });
    if (i < 4) L(s, pres, rx + i * 0.88 + 0.75, 5.69, rx + (i + 1) * 0.88, 5.69, { color: COL.cAthlete, lw: 1.5, end: "triangle" });
  });
  SRC(s, "Component values — Sport England changing-room guidance as cited by UK suppliers (e.g. sportschangingrooms.co.uk); accessible provision — " + S.AISF, 0.7, 6.5, 12, { h: 0.3 });
  T(s, "WHY IT MATTERS  Wet and dry zones must not overlap: the drying zone is the threshold that keeps the locker floor dry and defines the one-way route to the hall.", 0.7, 6.84, 12, 0.25, { fontSize: 8 });
}

// =====================================================================
// 09 FACULTY — ZONING / BUBBLE
// =====================================================================
pres.addSection({ title: "Part 02 — PE Faculty" });
{
  const s = board(pres, "08 — PHYSICAL EDUCATION FACULTY · SPACE RELATIONSHIPS", "Four functional groups under one entrance — each with its own critical adjacency", "Part 02 — PE Faculty");
  const cx = 4.5, cy = 1.5;
  NODE(s, pres, "FACULTY · ENTRANCE + FOYER", cx - 1.5, cy, 3.0, 0.5, { fill: COL.zPublic, tr: 30, fs: 9 });
  const groups = [
    ["EDUCATIONAL", COL.zSemi, ["CLASSROOMS", "LIBRARY", "AUDITORIUM"]],
    ["SOCIAL", COL.zPublic, ["CAFETERIA", "LOUNGE", "INFORMAL STUDY"]],
    ["SPORTS", COL.zSport, ["SPORTS HALL", "CHANGING", "SHOWERS", "EQUIPMENT"]],
    ["SUPPORT", COL.zService, ["ADMINISTRATION", "STORAGE", "SERVICES", "WC"]],
  ];
  const gx = [0.6, 2.9, 5.2, 7.5];
  groups.forEach((g, i) => {
    const x = gx[i], y = cy + 1.15;
    NODE(s, pres, g[0], x, y, 2.0, 0.45, { fill: g[1], tr: 25, fs: 9 });
    PL(s, pres, [[cx, cy + 0.5], [cx, cy + 0.8], [x + 1.0, cy + 0.8], [x + 1.0, y]], { lw: 1, color: COL.ink });
    g[2].forEach((t, j) => {
      NODE(s, pres, t, x + 0.15, y + 0.65 + j * 0.5, 1.7, 0.38, { fill: g[1], tr: 70, fs: 7.5, bold: false });
      L(s, pres, x + 0.08, y + 0.45, x + 0.08, y + 0.84 + j * 0.5, { lw: 0.5, color: COL.grey });
      L(s, pres, x + 0.08, y + 0.84 + j * 0.5, x + 0.15, y + 0.84 + j * 0.5, { lw: 0.5, color: COL.grey });
    });
  });
  // service chain under sports
  NODE(s, pres, "SERVICE ACCESS", 5.35, 5.35, 1.7, 0.38, { fill: COL.zService, tr: 30, fs: 7.5, color: "FFFFFF" });
  L(s, pres, 6.2, 5.35, 6.2, 5.18, { lw: 1.5, end: "triangle" });
  // adjacency strengths
  T(s, "KEY ADJACENCIES", 0.6, 5.85, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  T(s, [
    { text: "SPORTS HALL ↔ CHANGING ", options: { bold: true } }, { text: "direct · ", options: {} },
    { text: "HALL ↔ EQUIPMENT ", options: { bold: true } }, { text: "direct, same level · ", options: {} },
    { text: "CLASSROOMS ↔ LIBRARY ", options: { bold: true } }, { text: "near · ", options: {} },
    { text: "CAFETERIA ↔ SERVICE ", options: { bold: true } }, { text: "direct · ", options: {} },
    { text: "AUDITORIUM ↔ FOYER ", options: { bold: true } }, { text: "direct (event use)", options: {} },
  ], 0.6, 6.08, 9.0, 0.45, { fontSize: 8 });

  // Circulation systems panel
  const rx = 10.0;
  T(s, "FIVE USER STREAMS", rx, 1.5, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  const streams = [
    [COL.zPublic, "solid", "PUBLIC", "foyer → auditorium / events → spectators"],
    [COL.zSemi, "solid", "STUDENTS", "foyer → classrooms, library, cafeteria"],
    [COL.cAthlete, "solid", "ATHLETES", "entrance → changing → hall / fields"],
    [COL.zPrivate, "dash", "STAFF", "admin ↔ classrooms ↔ labs"],
    [COL.cService, "lgDashDot", "SERVICE", "yard → kitchen, stores, plant"],
  ];
  streams.forEach((st, i) => {
    const y = 1.85 + i * 0.75;
    L(s, pres, rx, y + 0.1, rx + 0.6, y + 0.1, { color: st[0], dash: st[1], lw: 2.5, end: "triangle" });
    T(s, st[2], rx + 0.75, y, 2.2, 0.22, { fontSize: 9, bold: true });
    T(s, st[3], rx + 0.75, y + 0.24, 2.6, 0.4, { fontSize: 7.5, color: COL.grey });
  });
  T(s, "Adjacency diagram — architectural interpretation; distances not scaled.", rx, 5.7, 2.9, 0.4, { fontSize: 7.5, italic: true, color: COL.grey });
  SRC(s, "Space groups as defined in the studio brief; adjacency logic consistent with Sport England sports-hall guidance (hall–changing–store) and university space-planning guides. No numerical standard on this slide.", 0.6, 6.6, 12.2, { h: 0.3 });
}

// =====================================================================
// 10 CLASSROOM + LIBRARY
// =====================================================================
{
  const s = board(pres, "09 — FACULTY · CLASSROOM + LIBRARY", "Teaching rooms sized per place, side-lit, entered from a 1.8 m corridor", "Part 02 — PE Faculty");
  // Classroom plan: 8.0 x 6.9 m = 55.2 m2 example, 1 m = 0.5 in
  const k = 0.46, X = 1.45, Y = 1.75, W = 8.0 * k, H = 6.9 * k;
  R(s, pres, X, Y, W, H, { line: COL.ink, lw: 2 });
  // windows on left wall
  for (let i = 0; i < 3; i++) R(s, pres, X - 0.05, Y + 0.3 + i * 0.95, 0.1, 0.7, { fill: COL.zSemi, line: COL.ink, lw: 0.5 });
  // daylight arrows
  [0, 1, 2].forEach((i) => L(s, pres, X - 0.4, Y + 0.65 + i * 0.95, X - 0.08, Y + 0.65 + i * 0.95, { color: COL.zPublic, lw: 2, end: "triangle" }));
  T(s, "DAYLIGHT (left of writing hand)", X - 0.85, Y + H + 0.15, 0.8, 0.5, { fontSize: 6.5, bold: true, color: COL.zPublic });
  // board + teacher zone at top
  R(s, pres, X + 0.6, Y + 0.05, W - 1.2, 0.08, { fill: COL.ink, line: null });
  T(s, "BOARD / SCREEN", X + 0.6, Y + 0.17, W - 1.2, 0.2, { fontSize: 7, bold: true, align: "center" });
  R(s, pres, X + 0.6, Y + 0.45, W - 1.2, 0.55, { fill: COL.panel, line: null });
  T(s, "TEACHER ZONE", X + 0.6, Y + 0.6, W - 1.2, 0.25, { fontSize: 7, align: "center", color: COL.grey });
  // desks 5 rows x 3 double desks
  for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) {
    const dx = X + 0.35 + c * 1.07, dy = Y + 1.15 + r * 0.41;
    R(s, pres, dx, dy, 0.75, 0.22, { fill: COL.zSemi, tr: 60, line: COL.ink, lw: 0.5 });
    E(s, pres, dx + 0.1, dy + 0.24, 0.12, 0.12, { line: COL.grey, lw: 0.5 });
    E(s, pres, dx + 0.52, dy + 0.24, 0.12, 0.12, { line: COL.grey, lw: 0.5 });
  }
  // door + corridor on right
  R(s, pres, X + W - 0.05, Y + H - 0.75, 0.1, 0.45, { fill: "FFFFFF", line: null });
  s.addShape(pres.shapes.ARC, { x: X + W - 0.45, y: Y + H - 0.75, w: 0.9, h: 0.9, angleRange: [180, 270], line: { color: COL.ink, width: 0.5 } });
  R(s, pres, X + W + 0.05, Y, 1.8 * k, H, { fill: COL.zPublic, tr: 80, line: null });
  dimH(s, pres, X + W + 0.05, X + W + 0.05 + 1.8 * k, Y + 0.25, "1.80 m", { fs: 7.5 });
  T(s, "CORRIDOR\n(educational)", X + W + 0.05, Y + 1.5, 1.8 * k, 0.4, { fontSize: 6.5, bold: true, align: "center" });
  dimH(s, pres, X, X + W, Y + H + 0.2, "8.0 m", { below: true });
  dimV(s, pres, X - 0.55, Y, Y + H, "6.9 m", { fs: 8 });
  T(s, "55 m² / 30 places ≈ 1.8 m² per place — example proportions by author; area from BB103.", X, Y + H + 0.5, 4.6, 0.4, { fontSize: 7.5, italic: true, color: COL.grey });
  // classroom stats
  STAT(s, "55 m²", "General classroom for 30 (school guideline, used as a lower bound).", 6.15, 1.5, 2.3, { fs: 18, gap: 0.36 });
  STAT(s, "2.5–2.75 m²", "Per workplace — group-work / IT / seminar rooms (university guide).", 6.15, 2.4, 2.3, { fs: 18, gap: 0.36 });
  STAT(s, "1.80 m", "Min. corridor width, educational spaces.", 6.15, 3.3, 2.3, { fs: 18, gap: 0.36 });
  TAG(s, pres, "RECOMMENDED", 6.15, 4.1, "recommended");
  TAG(s, pres, "MANDATORY (IRAN)", 6.15, 4.38, "mandatory");

  // Library plan
  const lx = 8.85, ly = 1.5, lw = 4.0, lh = 3.3;
  T(s, "LIBRARY — ZONING PLAN", lx, ly - 0.1, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  const by = ly + 0.45;
  R(s, pres, lx, by, lw, lh, { line: COL.ink, lw: 1.5 });
  R(s, pres, lx, by + lh - 0.8, 1.3, 0.8, { fill: COL.zPublic, tr: 50, line: COL.ink, lw: 0.5 });
  T(s, "ENTRY +\nSERVICE DESK", lx, by + lh - 0.75, 1.3, 0.6, { fontSize: 6.5, bold: true, align: "center", valign: "middle" });
  for (let i = 0; i < 5; i++) R(s, pres, lx + 1.55 + i * 0.45, by + 1.2, 0.18, 1.3, { fill: COL.zService, tr: 40, line: null });
  T(s, "BOOK STACKS", lx + 1.5, by + 2.55, 2.3, 0.2, { fontSize: 6.5, bold: true, align: "center" });
  for (let i = 0; i < 6; i++) R(s, pres, lx + 0.15 + i * 0.62, by + 0.08, 0.5, 0.3, { fill: COL.zSemi, tr: 50, line: COL.ink, lw: 0.5 });
  T(s, "QUIET ZONE — individual carrels along daylight façade", lx + 0.1, by + 0.42, 3.8, 0.2, { fontSize: 6.5, bold: true });
  R(s, pres, lx + 0.1, by + 0.8, 1.2, 1.55, { fill: COL.zSemi, tr: 70, line: COL.ink, lw: 0.5 });
  T(s, "READING\nTABLES", lx + 0.1, by + 1.3, 1.2, 0.4, { fontSize: 6.5, bold: true, align: "center" });
  R(s, pres, lx + 2.75, by + lh - 0.8, 1.25, 0.8, { fill: COL.zPrivate, tr: 65, line: COL.ink, lw: 0.75 });
  T(s, "GROUP STUDY\n(enclosed — acoustic)", lx + 2.75, by + lh - 0.75, 1.25, 0.6, { fontSize: 6.5, bold: true, align: "center", valign: "middle" });
  [0, 1, 2, 3].forEach((i) => L(s, pres, lx + 0.5 + i * 1.0, by - 0.22, lx + 0.5 + i * 1.0, by - 0.03, { color: COL.zPublic, lw: 2, end: "triangle" }));
  PL(s, pres, [[lx + 0.65, by + lh + 0.3], [lx + 0.65, by + lh - 0.85], [lx + 1.5, by + 0.75]], { color: COL.cPublic, lw: 1.25, dash: "dash" });
  T(s, "Noise gradient: loud (entry, group) → quiet (carrels). Accessible route ≥ 1.5 m turning space at desk and stacks.", lx, by + lh + 0.1, lw, 0.45, { fontSize: 7.5 });
  T(s, "Area per reader: no authoritative value verified for this study — not presented as a standard.", lx, by + lh + 0.6, lw, 0.4, { fontSize: 7.5, italic: true, color: COL.accent });
  SRC(s, S.BB103 + "  " + S.YORK + "  Corridor: " + S.M4, 0.6, 6.5, 12.2, { h: 0.4 });
}

// =====================================================================
// 11 AUDITORIUM + CAFETERIA
// =====================================================================
{
  const s = board(pres, "10 — FACULTY · AUDITORIUM + CAFETERIA + STUDENT SPACES", "Rows limited by seatway width; food moves one way from kitchen to waste", "Part 02 — PE Faculty");
  // Auditorium section
  const ax = 0.7, ay = 3.05;
  T(s, "AUDITORIUM — SECTION", ax, 1.4, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  R(s, pres, ax, ay - 0.5, 1.2, 0.5, { fill: COL.panel, line: COL.ink });
  T(s, "STAGE", ax, ay - 0.42, 1.2, 0.3, { fontSize: 8, bold: true, align: "center" });
  let x = ax + 1.2, y = ay;
  const eyes = [];
  for (let i = 0; i < 8; i++) {
    L(s, pres, x, y, x + 0.36, y, { lw: 1.25 });
    L(s, pres, x + 0.36, y, x + 0.36, y - 0.11, { lw: 1.25 });
    E(s, pres, x + 0.17, y - 0.4, 0.09, 0.11, { line: COL.ink, lw: 0.5 });
    eyes.push([x + 0.21, y - 0.35]);
    x += 0.36; y -= 0.11;
  }
  [0, 4, 7].forEach((i) => L(s, pres, eyes[i][0], eyes[i][1], ax + 1.0, ay - 0.5, { color: COL.accent, dash: "dash", lw: 0.75 }));
  T(s, "sightline to stage edge → riser grows with distance", ax + 1.3, ay - 1.45, 3.2, 0.2, { fontSize: 7, color: COL.accent });
  T(s, "WHEELCHAIR\nSPACES at rear", x - 0.1, y - 0.15, 1.0, 0.35, { fontSize: 6.5, bold: true, color: COL.zPrivate });
  T(s, "Section — schematic; riser from sightline calculation.", ax, ay + 0.08, 4.4, 0.2, { fontSize: 7, italic: true, color: COL.grey });
  // Auditorium plan rows
  const py = 3.5, mm = 0.00115;
  T(s, "PLAN — ROW LENGTH vs SEATWAY", ax, py, 4, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  for (let r = 0; r < 3; r++) for (let i = 0; i < 14; i++) R(s, pres, ax + 0.45 + i * 0.27, py + 0.32 + r * 0.36, 0.24, 0.2, { fill: COL.zSemi, tr: 55, line: COL.ink, lw: 0.4 });
  R(s, pres, ax, py + 0.27, 0.4, 1.1, { line: COL.cPublic, dash: "dash" });
  R(s, pres, ax + 0.45 + 14 * 0.27, py + 0.27, 0.4, 1.1, { line: COL.cPublic, dash: "dash" });
  T(s, "aisle", ax, py + 1.4, 0.5, 0.2, { fontSize: 6.5, color: COL.cPublic });
  T(s, "aisle", ax + 0.45 + 14 * 0.27, py + 1.4, 0.5, 0.2, { fontSize: 6.5, color: COL.cPublic });
  dimV(s, pres, ax + 0.45 + 14 * 0.27 + 0.5, py + 0.52, py + 0.68, "", { right: true, fs: 7 });
  T(s, "seatway ≥ 300", ax + 0.45 + 14 * 0.27 + 0.45, py + 0.05, 1.1, 0.2, { fontSize: 7, bold: true, color: COL.accent });
  T(s, "14 seats between two aisles", ax + 0.45, py + 1.4, 3.8, 0.2, { fontSize: 7, bold: true, align: "center" });
  s.addTable([
    [{ text: "Seatway (mm)", options: { bold: true, fill: { color: COL.panel } } }, { text: "Aisle one side", options: { bold: true, fill: { color: COL.panel } } }, { text: "Aisles both sides", options: { bold: true, fill: { color: COL.panel } } }],
    ["300 – 324", "7 seats", "14 seats"],
    ["425 – 449", "12 seats", "24 seats"],
  ], { x: ax, y: py + 1.7, w: 4.3, colW: [1.4, 1.4, 1.5], fontSize: 8, fontFace: "Arial", border: { type: "solid", color: COL.line, pt: 0.5 }, margin: 0.04, rowH: 0.24 });
  SRC(s, S.BS9999, ax, py + 2.5, 4.5, { h: 0.3 });

  // Cafeteria plan
  const cx = 5.6, cy = 1.4;
  T(s, "CAFETERIA — PLAN + SERVICE SEQUENCE", cx, cy - 0.05, 4.5, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  const by = cy + 0.5;
  R(s, pres, cx, by, 4.3, 3.4, { line: COL.ink, lw: 1.5 });
  R(s, pres, cx, by, 1.4, 2.2, { fill: COL.zService, tr: 55, line: COL.ink, lw: 0.75 });
  T(s, "KITCHEN", cx, by + 0.8, 1.4, 0.3, { fontSize: 8, bold: true, align: "center" });
  R(s, pres, cx, by + 2.2, 1.4, 0.6, { fill: COL.zService, tr: 75, line: COL.ink, lw: 0.75 });
  T(s, "STORE", cx, by + 2.35, 1.4, 0.3, { fontSize: 7.5, bold: true, align: "center" });
  R(s, pres, cx, by + 2.8, 1.4, 0.6, { fill: COL.zService, tr: 85, line: COL.ink, lw: 0.75 });
  T(s, "RETURN / WASTE", cx, by + 2.95, 1.4, 0.3, { fontSize: 7.5, bold: true, align: "center" });
  R(s, pres, cx + 1.4, by, 0.45, 2.2, { fill: COL.zPublic, tr: 40, line: COL.ink, lw: 0.75 });
  T(s, "SERVERY", cx + 1.4, by + 0.4, 0.45, 1.4, { fontSize: 6.5, bold: true, align: "center", valign: "middle", vert: "vert270" });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const tx = cx + 2.15 + c * 0.7, ty = by + 0.25 + r * 0.72;
    R(s, pres, tx, ty, 0.45, 0.35, { fill: COL.zPublic, tr: 70, line: COL.ink, lw: 0.5 });
    [[-0.13, 0.11], [0.5, 0.11]].forEach((o) => E(s, pres, tx + o[0], ty + o[1], 0.1, 0.1, { line: COL.grey, lw: 0.5 }));
  }
  PL(s, pres, [[cx + 0.7, by - 0.35], [cx + 0.7, by + 0.35]], { color: COL.cService, lw: 2, dash: "lgDashDot" });
  T(s, "SERVICE ENTRANCE ↓", cx + 0.8, by - 0.3, 1.5, 0.2, { fontSize: 6.5, bold: true });
  PL(s, pres, [[cx + 4.6, by + 3.1], [cx + 2.0, by + 3.1], [cx + 2.0, by + 1.1], [cx + 1.9, by + 1.1]], { color: COL.cPublic, lw: 1.5, dash: "dash" });
  PL(s, pres, [[cx + 3.2, by + 2.85], [cx + 3.2, by + 3.25], [cx + 1.45, by + 3.25]], { color: COL.accent, lw: 1.5 });
  T(s, "students in", cx + 3.6, by + 3.15, 1.0, 0.2, { fontSize: 6.5, color: COL.cPublic });
  // sequence
  const seq = ["KITCHEN", "SERVICE", "DINING", "RETURN / WASTE"];
  seq.forEach((t, i) => {
    NODE(s, pres, t, cx + i * 1.1, by + 3.6, 0.95, 0.38, { fill: i === 2 ? COL.zPublic : COL.zService, tr: 55, fs: 6.5 });
    if (i < 3) L(s, pres, cx + i * 1.1 + 0.95, by + 3.79, cx + (i + 1) * 1.1, by + 3.79, { lw: 1.5, end: "triangle" });
  });
  T(s, "Plan — illustrative zoning by author. Area per seat: no authoritative value verified → derive from table + chair + aisle layout (Neufert, 'Restaurants').", cx, by + 4.05, 4.3, 0.45, { fontSize: 7.5, italic: true, color: COL.grey });

  // student spaces
  const sx = 10.3;
  T(s, "STUDENT / SOCIAL", sx, 1.4, 2.6, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  [["LOUNGE", "between teaching and sport — the faculty's social hinge"], ["INFORMAL STUDY", "edges of corridors & atria, daylit, visible"], ["COMMON SPACE", "shared foyer for auditorium + cafeteria events"]].forEach((t, i) => {
    NODE(s, pres, t[0], sx, 1.75 + i * 1.0, 2.5, 0.38, { fill: COL.zPublic, tr: 55, fs: 8 });
    T(s, t[1], sx, 2.17 + i * 1.0, 2.5, 0.45, { fontSize: 7.5, color: COL.grey });
  });
  T(s, "AUDITORIUM CHECKLIST", sx, 4.85, 2.6, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  T(s, [
    { text: "Wheelchair spaces 1400 × 900 mm (SE 2010)", options: { bullet: true, breakLine: true } },
    { text: "Exits at stage end + rear, sized per INBR Topic 3", options: { bullet: true, breakLine: true } },
    { text: "Acoustic separation from sports hall", options: { bullet: true } },
  ], sx, 5.1, 2.6, 1.1, { fontSize: 7.5, paraSpaceAfter: 3 });
  T(s, "WHY IT MATTERS  Row length is a fire-escape rule, not a comfort choice; the cafeteria needs its own service yard so food and waste never cross the student route.", 0.7, 6.84, 12, 0.25, { fontSize: 8 });
}

// =====================================================================
// 12 WC + ACCESSIBILITY + STAIRS
// =====================================================================
{
  const s = board(pres, "11 — SANITARY SPACES + ACCESSIBILITY", "Iranian minimums shown beside the UK reference — both dimensioned", "Part 02 — PE Faculty");
  const k = 1.15; // 1 m = 1.15 in
  // Iranian accessible WC 1.70 x 1.50
  const ix = 0.95, iy = 2.0;
  T(s, "ACCESSIBLE WC — IRAN (min.)", ix, 1.4, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  R(s, pres, ix, iy, 1.7 * k, 1.5 * k, { line: COL.ink, lw: 2 });
  E(s, pres, ix + 0.05, iy + 0.03, 1.5 * k * 0.95, 1.5 * k * 0.95, { line: COL.accent, dash: "dash", lw: 1 });
  R(s, pres, ix + 1.7 * k - 0.45, iy + 0.1, 0.38, 0.6, { fill: "FFFFFF", line: COL.ink });
  T(s, "WC", ix + 1.7 * k - 0.45, iy + 0.3, 0.38, 0.2, { fontSize: 6.5, bold: true, align: "center" });
  L(s, pres, ix + 1.7 * k - 0.05, iy + 0.85, ix + 1.7 * k - 0.05, iy + 1.25, { lw: 2.5, color: COL.zPrivate });
  T(s, "grab rail", ix + 1.7 * k - 0.75, iy + 1.0, 0.65, 0.2, { fontSize: 6, color: COL.zPrivate });
  // door 90
  R(s, pres, ix + 0.25, iy + 1.5 * k - 0.04, 0.9 * k, 0.08, { fill: "FFFFFF", line: null });
  s.addShape(pres.shapes.ARC, { x: ix + 0.25 - 0.9 * k, y: iy + 1.5 * k - 0.9 * k, w: 1.8 * k, h: 1.8 * k, angleRange: [0, 90], line: { color: COL.ink, width: 0.5 } });
  L(s, pres, ix + 0.25 + 0.9 * k, iy + 1.5 * k, ix + 0.25 + 0.9 * k, iy + 1.5 * k + 0.9 * k, { lw: 1 });
  dimH(s, pres, ix, ix + 1.7 * k, iy - 0.2, "170 cm", { fs: 8 });
  dimV(s, pres, ix - 0.15, iy, iy + 1.5 * k, "150 cm", { fs: 8 });
  dimH(s, pres, ix + 0.25, ix + 0.25 + 0.9 * k, iy + 1.5 * k + 1.15, "door 90 cm", { below: true, fs: 7.5 });
  T(s, "Ø150 turning\ncircle", ix + 0.45, iy + 0.55, 0.9, 0.35, { fontSize: 6.5, color: COL.accent, align: "center" });
  TAG(s, pres, "MANDATORY (IRAN) · VERIFY EDITION", ix, iy + 3.2, "mandatory");
  SRC(s, S.IRACC, ix, iy + 3.47, 3.4, { h: 0.65 });

  // UK ADM 1.5 x 2.2
  const ux = 4.75, uy = 2.0, kk = 0.95;
  T(s, "ACCESSIBLE WC — UK REFERENCE", ux, 1.4, 3, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  R(s, pres, ux, uy, 1.5 * kk, 2.2 * kk, { line: COL.ink, lw: 2 });
  E(s, pres, ux, uy + 0.55, 1.5 * kk, 1.5 * kk, { line: COL.accent, dash: "dash", lw: 1 });
  R(s, pres, ux + 0.08, uy + 0.08, 0.38, 0.6, { fill: "FFFFFF", line: COL.ink });
  T(s, "WC", ux + 0.08, uy + 0.28, 0.38, 0.2, { fontSize: 6.5, bold: true, align: "center" });
  R(s, pres, ux + 1.5 * kk - 0.32, uy + 0.12, 0.25, 0.35, { fill: "FFFFFF", line: COL.ink });
  T(s, "basin", ux + 1.5 * kk - 0.75, uy + 0.2, 0.42, 0.2, { fontSize: 6, color: COL.grey });
  dimH(s, pres, ux, ux + 1.5 * kk, uy - 0.2, "1500 mm", { fs: 8 });
  dimV(s, pres, ux + 1.5 * kk + 0.15, uy, uy + 2.2 * kk, "2200 mm", { right: true, fs: 8 });
  T(s, "1500 turning\ncircle", ux + 0.25, uy + 1.15, 0.9, 0.35, { fontSize: 6.5, color: COL.accent, align: "center" });
  TAG(s, pres, "MANDATORY (UK)", ux, iy + 3.2, "mandatory");
  SRC(s, S.ADM, ux, iy + 3.47, 3.0, { h: 0.5 });

  // standard WC + shower (no dims)
  const wx = 8.15, wy = 1.75;
  T(s, "STANDARD WC · BASIN · SHOWER", wx, 1.4, 3.2, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  for (let i = 0; i < 3; i++) {
    R(s, pres, wx + i * 0.75, wy, 0.75, 1.2, { line: COL.ink, lw: 1 });
    R(s, pres, wx + i * 0.75 + 0.2, wy + 0.08, 0.35, 0.5, { fill: "FFFFFF", line: COL.ink, lw: 0.5 });
    s.addShape(pres.shapes.ARC, { x: wx + i * 0.75 + 0.1 - 0.55, y: wy + 1.2 - 0.55, w: 1.1, h: 1.1, angleRange: [270, 360], line: { color: COL.grey, width: 0.5 } });
  }
  for (let i = 0; i < 3; i++) E(s, pres, wx + 0.15 + i * 0.6, wy + 1.75, 0.35, 0.25, { line: COL.ink, lw: 0.5 });
  T(s, "BASINS — circulation zone in front kept clear of door swings", wx, wy + 2.05, 3.2, 0.3, { fontSize: 6.5, color: COL.grey });
  T(s, "Not dimensioned: cubicle and basin sizes were not verified from an authoritative source for this study (see Neufert 'Sanitary facilities').", wx, wy + 2.45, 3.3, 0.55, { fontSize: 7.5, italic: true, color: COL.accent });

  // Stairs + corridor + ramp (Iran)
  const tx = 11.55, ty = 1.4;
  T(s, "STAIR · RAMP · CORRIDOR (IRAN)", 8.15, 4.55, 4.5, 0.2, { fontSize: 8, bold: true, color: COL.grey, charSpacing: 1 });
  // stair profile
  const sx = 8.2, sy = 6.1;
  let x = sx, y = sy;
  for (let i = 0; i < 4; i++) { L(s, pres, x, y, x, y - 0.18, { lw: 1.25 }); L(s, pres, x, y - 0.18, x + 0.28, y - 0.18, { lw: 1.25 }); x += 0.28; y -= 0.18; }
  dimV(s, pres, sx - 0.1, sy - 0.18, sy, "10–18 cm", { fs: 7 });
  dimH(s, pres, sx + 0.28, sx + 0.56, sy - 0.62, "≥ 28 cm", { fs: 7 });
  T(s, "2R + T = 63–64 cm · headroom ≥ 205 cm", sx + 1.25, sy - 0.55, 2.6, 0.2, { fontSize: 7.5, bold: true });
  // ramp
  L(s, pres, sx + 1.25, sy, sx + 3.6, sy - 0.25, { lw: 1.5 });
  L(s, pres, sx + 1.25, sy, sx + 3.6, sy, { lw: 0.5, color: COL.grey });
  T(s, "ramp ≤ 8 % · run ≤ 3 m · rise ≤ 25 cm · width ≥ 120 cm", sx + 1.25, sy + 0.05, 3.5, 0.2, { fontSize: 7, color: COL.ink });
  T(s, "Corridor: ≥ 1.80 m educational · ≥ 1.40 m main accessible route", 8.15, 6.32, 4.6, 0.2, { fontSize: 7.5, bold: true });
  SRC(s, "Stairs & corridors — " + S.M4 + " Ramp — Iranian accessibility regulations (above). Values cross-checked only via published summaries → confirm in official text.", 0.95, 6.55, 11.9, { h: 0.3 });
}

// =====================================================================
// 13 COMPARATIVE STANDARDS
// =====================================================================
pres.addSection({ title: "Part 03 — Comparison + references" });
{
  const s = board(pres, "12 — COMPARATIVE STANDARDS", "Where Iranian and international values differ — and why", "Part 03 — Comparison + references");
  const head = ["Requirement", "Iranian source", "International source", "Type", "Why they may differ"].map((t) => ({ text: t, options: { bold: true, color: "FFFFFF", fill: { color: COL.ink } } }));
  const rows = [
    ["Accessible WC (min. room)", "170 × 150 cm\nIran accessibility regs", "150 × 220 cm\nUK ADM Vol. 2, Diag. 18", "Mandatory (both)", "UK room contains basin + side transfer space + full 1500 turning circle; Iranian minimum is a compact WC-only room."],
    ["Stair clear width", "≥ 110 cm (INBR Topic 4 summary)\n≥ 115 cm (other summary)", "— (not compared)", "Mandatory", "Two secondary summaries disagree → official 1396 text must be checked; width also depends on occupant load (Topic 3)."],
    ["Corridor, educational", "≥ 180 cm\nINBR Topic 4", "— (BB103 sets areas, not widths)", "Mandatory", "Iran fixes a width for school/university corridors; UK guidance works through area budgets and fire design."],
    ["Basketball clear height", "Not verified (Ministry of Sport & Youth guidelines not accessible)", "≥ 7 m FIBA · 7.5 m Sport England hall", "Competition / recommended", "FIBA = playing rule; Sport England adds margin for badminton & multi-use."],
    ["Volleyball clear height", "Not verified", "7 m (all) · 12.5 m FIVB official", "Competition", "Level of play: World/Official events need high-ball space."],
    ["Spectator seat width", "Not verified", "460 mm existing · 500 mm new (Green Guide)", "Recommended", "UK guidance raised comfort/safety for new build."],
    ["Classroom area", "Not verified for universities", "55 m² / 30 (BB103) · 2.5–2.75 m²/place (Univ. York)", "Recommended", "School vs university norms; furniture & pedagogy differ."],
  ];
  const body = rows.map((r) => r.map((c, i) => ({ text: c, options: { bold: i === 0, color: c.startsWith("Not verified") || c.includes("disagree") ? COL.accent : COL.ink } })));
  s.addTable([head, ...body], { x: 0.6, y: 1.35, w: 12.15, colW: [1.9, 2.5, 2.6, 1.45, 3.7], fontSize: 9.5, rowH: 0.55, fontFace: "Arial", border: { type: "solid", color: COL.line, pt: 0.5 }, margin: 0.05, valign: "middle" });
  // classification legend
  const ly = 6.0;
  let x = 0.6;
  [["MANDATORY REGULATION", "mandatory"], ["RECOMMENDED GUIDELINE", "recommended"], ["INTERNATIONAL COMPETITION STANDARD", "competition"], ["TYPICAL PLANNING VALUE", "typical"], ["CALCULATION", "calc"]].forEach((t) => { x += TAG(s, pres, t[0], x, ly, t[1]) + 0.15; });
  T(s, "Red text = value could not be verified or sources conflict — not presented as a standard.", 0.6, 6.3, 12, 0.2, { fontSize: 8, color: COL.accent });
  SRC(s, "See full references (next slide). Iranian values were checked through published summaries of INBR Topic 4 and the Supreme Council accessibility regulations; the printed official editions remain the authority.", 0.6, 6.6, 12.2, { h: 0.3 });
}

// =====================================================================
// 14 REFERENCES
// =====================================================================
{
  const s = board(pres, "13 — REFERENCES", "Sources cited on the slides", "Part 03 — Comparison + references");
  const ir = [
    ["Iranian National Building Regulations, Topic 3 — Fire protection Ministry of Roads & Urban Development, latest ed.\nمبحث ۳ — حفاظت ساختمان‌ها در مقابل حریق", ""],
    ["Iranian National Building Regulations, Topic 4 — General building requirements, 1396 / 2017 ed.\nمبحث ۴ — الزامات عمومی ساختمان", ""],
    ["Iranian National Building Regulations, Topics 15 (elevators), 19 (energy), 22 (maintenance) — consulted for scope; no values cited.", ""],
    ["Supreme Council of Urban Planning & Architecture of Iran — Urban & architectural regulations for people with physical-motor disabilities.\nضوابط و مقررات شهرسازی و معماری برای افراد دارای معلولیت جسمی-حرکتی", ""],
    ["Ministry of Sport & Youth — sports facility guidelines: NOT ACCESSIBLE for verification in this study; flagged on slide 12.", ""],
  ];
  const intl = [
    ["FIBA, Official Basketball Rules 2024 & Basketball Equipment.", "https://assets.fiba.basketball/image/upload/documents-corporate-fiba-official-rules-2024-v10a.pdf"],
    ["FIVB, Official Volleyball Rules 2025–2028.", "https://www.fivb.com/wp-content/uploads/2025/01/FIVB-Volleyball_Rules2025_2028-EN-v05.pdf"],
    ["Sport England, Sports Halls: Design & Layouts (2012).", "https://sportengland-production-files.s3.eu-west-2.amazonaws.com/s3fs-public/sports-halls-design-and-layouts-2012.pdf"],
    ["Sport England, Accessible Sports Facilities (2010).", "https://sportengland-production-files.s3.eu-west-2.amazonaws.com/s3fs-public/accessible-sports-facilities-2010.pdf"],
    ["Sport England, AISF Part D — Changing & toilet provision (2024).", "https://sportengland-production-files.s3.eu-west-2.amazonaws.com/s3fs-public/2024-08/AISF-Part-D-Changing-and-toilet-provision.pdf"],
    ["SGSA, Guide to Safety at Sports Grounds, 6th ed. (2018) & SG01 (2022).", "https://sgsa.org.uk/document/greenguide/"],
    ["BSI, BS 9999 — Fire safety in the design, management & use of buildings (seating).", "https://knowledge.bsigroup.com"],
    ["HM Government, Approved Document M Vol. 2 (2015 ed.).", "https://www.gov.uk/government/publications/access-to-and-use-of-buildings-approved-document-m"],
    ["DfE, Building Bulletin 103 — Area guidelines for mainstream schools (2014).", "https://dera.ioe.ac.uk/id/eprint/20283/1/BB103_Area_Guidelines_for_Mainstream_Schools_FINAL_23_4_14.pdf"],
    ["University of York, Space Guidelines & Standards (Aug 2025).", "https://www.york.ac.uk/media/campusdevelopment/63697_UniofYork%20Space%20Guidelines%20and%20Standards%20v2.pdf"],
    ["Neufert, Architects' Data (Wiley) · Metric Handbook (Routledge) · Architectural Graphic Standards (Wiley) — general planning references; no values cited where not verified.", ""],
  ];
  T(s, "IRANIAN SOURCES", 0.6, 1.35, 4, 0.25, { fontSize: 9, bold: true, color: COL.accent, charSpacing: 2 });
  ir.forEach((r, i) => T(s, r[0], 0.6, 1.7 + i * 0.62, 4.6, 0.6, { fontSize: 8 }));
  T(s, "INTERNATIONAL SOURCES", 5.6, 1.35, 4, 0.25, { fontSize: 9, bold: true, color: COL.accent, charSpacing: 2 });
  intl.forEach((r, i) => {
    const runs = [{ text: r[0], options: { breakLine: !!r[1] } }];
    if (r[1]) runs.push({ text: r[1], options: { hyperlink: { url: r[1] }, color: COL.cPublic, fontSize: 6.5 } });
    T(s, runs, 5.6, 1.7 + i * 0.44, 7.2, 0.44, { fontSize: 8 });
  });
  T(s, "World Aquatics rules not used — no pool standards are presented in this study.", 5.6, 6.6, 7, 0.2, { fontSize: 7.5, italic: true, color: COL.grey });
}

const out = path.join(__dirname, "..", "01_Architectural_Standards_Sports_PE_Faculty.pptx");
pres.writeFile({ fileName: out }).then(async () => { await applyTheme(out, THEME); console.log("wrote", out); });
