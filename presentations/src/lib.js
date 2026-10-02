// Shared drawing helpers for the two architecture decks (pptxgenjs, LAYOUT_WIDE 13.333 x 7.5 in).
const path = require("path");

const IMG = (f) => path.join(__dirname, "img", f);

// Palette — white board, black/grey type, one accent (vermilion) for dimensions & key highlights.
const COL = {
  bg: "FFFFFF",
  ink: "1A1A1A",
  grey: "6B6B6B",
  mid: "9A9A9A",
  line: "BDBDBD",
  panel: "F3F3F3",
  accent: "D9472B",
  // Zone colours — used identically in every zoning diagram
  zPublic: "F2B134",
  zSemi: "6FA8DC",
  zPrivate: "9B7FBF",
  zSport: "5BAA6A",
  zService: "8C8C8C",
  // Circulation systems
  cAthlete: "D9472B",
  cPublic: "2F6FB5",
  cService: "1A1A1A",
};

const THEME = {
  name: "Architectural Board",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "1A1A1A", lt1: "FFFFFF", dk2: "3A3A3A", lt2: "F3F3F3",
    accent1: "D9472B", accent2: "6FA8DC", accent3: "5BAA6A", accent4: "F2B134",
    accent5: "9B7FBF", accent6: "8C8C8C", hlink: "2F6FB5", folHlink: "6B6B6B",
  },
};

function defineLayouts(pres, footer) {
  pres.layout = "LAYOUT_WIDE";
  pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
  pres.defineSlideMaster({
    title: "BOARD",
    background: { color: COL.bg },
    objects: [
      { text: { text: footer, options: { x: 0.5, y: 7.12, w: 6, h: 0.25, fontSize: 7, color: COL.mid, charSpacing: 1, margin: 0 } } },
      { placeholder: { options: { name: "kicker", type: "body", x: 0.5, y: 0.32, w: 9, h: 0.25, fontSize: 9, bold: true, color: COL.accent, charSpacing: 2, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.55, w: 12.3, h: 0.55, fontSize: 22, bold: true, color: COL.ink, margin: 0, valign: "top", align: "left" }, text: "" } },
    ],
    slideNumber: { x: 12.4, y: 7.1, w: 0.45, h: 0.25, fontSize: 8, color: COL.grey, align: "right" },
  });
  pres.defineSlideMaster({
    title: "COVER",
    background: { color: COL.bg },
    objects: [],
  });
}

function board(pres, kicker, title, section) {
  const s = pres.addSlide({ masterName: "BOARD", sectionTitle: section });
  s.addText(kicker, { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  return s;
}

function T(s, text, x, y, w, h, o = {}) {
  s.addText(text, Object.assign({ x, y, w, h, fontSize: 10, color: COL.ink, margin: 0, valign: "top", isTextBox: true, fontFace: "Arial" }, o));
}

function R(s, pres, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: o.fill ? { color: o.fill, transparency: o.tr || 0 } : { type: "none" },
    line: o.line === null ? { type: "none" } : { color: o.line || COL.ink, width: o.lw || 0.75, dashType: o.dash || "solid" },
  });
}

function E(s, pres, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.OVAL, {
    x, y, w, h,
    fill: o.fill ? { color: o.fill, transparency: o.tr || 0 } : { type: "none" },
    line: o.line === null ? { type: "none" } : { color: o.line || COL.ink, width: o.lw || 0.75, dashType: o.dash || "solid" },
  });
}

// Straight line from (x1,y1) to (x2,y2); handles any direction via flips.
function L(s, pres, x1, y1, x2, y2, o = {}) {
  const line = { color: o.color || COL.ink, width: o.lw || 0.75, dashType: o.dash || "solid" };
  if (o.end) line.endArrowType = o.end;
  if (o.begin) line.beginArrowType = o.begin;
  s.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2),
    w: Math.max(Math.abs(x2 - x1), 0.0001), h: Math.max(Math.abs(y2 - y1), 0.0001),
    flipH: x2 < x1, flipV: y2 < y1, line,
  });
}

// Polyline arrow through points [[x,y],...]; arrowhead on last segment.
function PL(s, pres, pts, o = {}) {
  for (let i = 0; i < pts.length - 1; i++) {
    const last = i === pts.length - 2;
    L(s, pres, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], Object.assign({}, o, { end: last && o.arrow !== false ? "triangle" : undefined }));
  }
}

// Architectural dimension: horizontal (y fixed) with oblique ticks, label above.
function dimH(s, pres, x1, x2, y, label, o = {}) {
  const c = o.color || COL.accent;
  L(s, pres, x1, y, x2, y, { color: c, lw: 0.75 });
  [x1, x2].forEach((x) => L(s, pres, x - 0.05, y + 0.05, x + 0.05, y - 0.05, { color: c, lw: 1.25 }));
  if (o.ext !== false) [x1, x2].forEach((x) => L(s, pres, x, y - 0.09, x, y + 0.09, { color: c, lw: 0.5 }));
  const above = o.below ? 0.04 : -0.22;
  T(s, label, (x1 + x2) / 2 - 1, y + above, 2, 0.2, { fontSize: o.fs || 9, bold: true, color: c, align: "center" });
}

function dimV(s, pres, x, y1, y2, label, o = {}) {
  const c = o.color || COL.accent;
  L(s, pres, x, y1, x, y2, { color: c, lw: 0.75 });
  [y1, y2].forEach((y) => L(s, pres, x - 0.05, y + 0.05, x + 0.05, y - 0.05, { color: c, lw: 1.25 }));
  [y1, y2].forEach((y) => L(s, pres, x - 0.09, y, x + 0.09, y, { color: c, lw: 0.5 }));
  const w = 1.6;
  const left = o.right ? x + 0.06 : x - 0.06 - w;
  T(s, label, left, (y1 + y2) / 2 - 0.1, w, 0.2, { fontSize: o.fs || 9, bold: true, color: c, align: o.right ? "left" : "right" });
}

// Source line, always placed directly beneath its visual.
function SRC(s, text, x, y, w, o = {}) {
  T(s, [{ text: "SOURCE  ", options: { bold: true, color: COL.ink } }, { text, options: { color: COL.grey } }], x, y, w, o.h || 0.3, { fontSize: o.fs || 7.5 });
}

// Small status tag: VERIFIED / INTERPRETATION / MANDATORY / etc.
function TAG(s, pres, text, x, y, kind) {
  const map = {
    verified: ["1A1A1A", "FFFFFF"],
    interp: ["FFFFFF", "1A1A1A"],
    mandatory: ["1A1A1A", "FFFFFF"],
    competition: [COL.accent, "FFFFFF"],
    recommended: ["6B6B6B", "FFFFFF"],
    typical: ["FFFFFF", "6B6B6B"],
    calc: ["FFFFFF", COL.accent],
  };
  const [fill, color] = map[kind] || map.verified;
  const w = Math.max(0.7, text.length * 0.078 + 0.25);
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.2, fill: { color: fill }, line: { color: kind === "calc" ? COL.accent : kind === "typical" ? "6B6B6B" : "1A1A1A", width: 0.75 } });
  T(s, text, x, y + 0.015, w, 0.18, { fontSize: 6.5, bold: true, color, align: "center", charSpacing: 1 });
  return w;
}

// Big-number standard callout: value / caption.
function STAT(s, value, caption, x, y, w, o = {}) {
  T(s, value, x, y, w, 0.5, { fontSize: o.fs || 26, bold: true, color: o.color || COL.ink });
  T(s, caption, x, y + (o.gap || 0.48), w, 0.45, { fontSize: 8.5, color: COL.grey });
}

// Human figure (simple scale figure), height h in inches, standing at (x, yFloor).
function FIG(s, pres, x, yFloor, h, color) {
  const c = color || COL.grey;
  const head = h * 0.13;
  E(s, pres, x - head / 2, yFloor - h, head, head, { fill: c, line: null });
  R(s, pres, x - h * 0.08, yFloor - h + head * 1.05, h * 0.16, h * 0.45, { fill: c, line: null });
  R(s, pres, x - h * 0.07, yFloor - h + head * 1.05 + h * 0.45, h * 0.06, h - head * 1.05 - h * 0.45, { fill: c, line: null });
  R(s, pres, x + h * 0.01, yFloor - h + head * 1.05 + h * 0.45, h * 0.06, h - head * 1.05 - h * 0.45, { fill: c, line: null });
}

// Labelled box node for flow / adjacency diagrams.
function NODE(s, pres, text, x, y, w, h, o = {}) {
  s.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: o.fill || "FFFFFF", transparency: o.tr || 0 },
    line: { color: o.line || COL.ink, width: o.lw || 0.75, dashType: o.dash || "solid" },
  });
  T(s, text, x, y, w, h, { fontSize: o.fs || 8.5, bold: o.bold !== false, color: o.color || COL.ink, align: "center", valign: "middle", charSpacing: o.cs || 0 });
}

module.exports = { IMG, COL, THEME, defineLayouts, board, T, R, E, L, PL, dimH, dimV, SRC, TAG, STAT, FIG, NODE };
