/* SA core — SVG helpers, geometry, projection, reveal / counters. No dependencies. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const SA = (window.SA = window.SA || {});
  SA.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- DOM / SVG ---- */
  SA.el = function (tag, attrs, parent, html) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) attrs[k] != null && e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };
  SA.s = function (tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      if (attrs[k] == null) continue;
      if (k === 'text') e.textContent = attrs[k]; else e.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(e);
    return e;
  };
  SA.$ = (q, r) => (r || document).querySelector(q);
  SA.$$ = (q, r) => Array.from((r || document).querySelectorAll(q));

  /* ---- projection: local metres (x east, y north) -> svg (x, -y) ---- */
  SA.P = (p) => [p[0], -p[1]];
  SA.d = function (pts, close) {
    let s = '';
    for (let i = 0; i < pts.length; i++) {
      const q = SA.P(pts[i]);
      s += (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1);
    }
    return close ? s + 'Z' : s;
  };
  /* smooth path through points (Catmull-Rom → Bézier), in svg space */
  SA.dSmooth = function (pts) {
    const q = pts.map(SA.P);
    if (q.length < 3) return SA.d(pts);
    let s = 'M' + q[0][0] + ' ' + q[0][1];
    for (let i = 0; i < q.length - 1; i++) {
      const p0 = q[i - 1] || q[i], p1 = q[i], p2 = q[i + 1], p3 = q[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      s += 'C' + c1.map((v) => v.toFixed(1)).join(' ') + ' ' + c2.map((v) => v.toFixed(1)).join(' ') + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return s;
  };
  SA.len = function (pts) { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
  SA.along = function (pts, t) {
    const L = SA.len(pts) * t; let acc = 0;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (acc + l >= L || i === pts.length - 1) {
        const f = l ? Math.min(1, (L - acc) / l) : 0;
        return { p: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) };
      }
      acc += l;
    }
  };
  SA.centroid = function (P) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < P.length; i++) {
      const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], f = x1 * y2 - x2 * y1;
      a += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
    }
    a /= 2; return Math.abs(a) < 1e-9 ? P[0] : [cx / (6 * a), cy / (6 * a)];
  };
  SA.area = function (P) { let a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; a += x1 * y2 - x2 * y1; } return Math.abs(a) / 2; };
  SA.offset = function (pts, dist) { /* parallel polyline (left side positive) */
    return pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      return [p[0] - (dy / l) * dist, p[1] + (dx / l) * dist];
    });
  };

  /* arrow head marker defs (one per svg) */
  SA.defs = function (svg) {
    let d = svg.querySelector('defs');
    if (!d) d = SA.s('defs', null, svg);
    return d;
  };
  SA.marker = function (svg, id, color, size) {
    const defs = SA.defs(svg);
    if (defs.querySelector('#' + id)) return 'url(#' + id + ')';
    const m = SA.s('marker', { id, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: size || 6, markerHeight: size || 6, orient: 'auto-start-reverse', markerUnits: 'strokeWidth' }, defs);
    SA.s('path', { d: 'M0 0 L10 5 L0 10 z', fill: color }, m);
    return 'url(#' + id + ')';
  };
  SA.hatch = function (svg, id, color, gap, w) {
    const defs = SA.defs(svg);
    if (!defs.querySelector('#' + id)) {
      const p = SA.s('pattern', { id, width: gap || 4, height: gap || 4, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
      SA.s('line', { x1: 0, y1: 0, x2: 0, y2: gap || 4, stroke: color, 'stroke-width': w || 0.8 }, p);
    }
    return 'url(#' + id + ')';
  };

  /* dash-draw prepare: sets --len for .draw paths */
  SA.prepDraw = function (root) {
    SA.$$('.draw', root).forEach((p) => { try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (e) { /* hidden */ } });
  };

  /* ---- number formatting ---- */
  const FA = '۰۱۲۳۴۵۶۷۸۹';
  SA.fa = (s) => String(s).replace(/\d/g, (d) => FA[d]).replace(/\./g, '٫');
  SA.fmt = (n, dec) => Number(n).toLocaleString('en-US', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });

  /* ---- reveal-on-scroll + counters + "entered" callbacks ---- */
  const io = new IntersectionObserver((ents) => {
    ents.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target; io.unobserve(t);
      t.classList.add('in');
      if (t.dataset.count != null) SA.count(t);
      if (t._fns) t._fns.forEach((f) => f());
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
  SA.observe = (el, fn) => { if (fn) (el._fns = el._fns || []).push(fn); io.observe(el); };
  SA.count = function (el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), dur = 1400, t0 = performance.now();
    if (SA.reduced) { el.textContent = SA.fmt(to, dec); return; }
    (function f(now) {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = SA.fmt(to * e, dec);
      if (k < 1) requestAnimationFrame(f);
    })(t0);
  };
  SA.initReveal = () => SA.$$('.rv,[data-count]').forEach((e) => io.observe(e));

  /* tiny html escaper */
  SA.esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
})();
