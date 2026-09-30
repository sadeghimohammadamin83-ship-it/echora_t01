/* Shared cartography — minimal architectural linework.
   Streets keep the user colour code; widths are screen px (non-scaling) by hierarchy.
   The site is drawn as a simplified four-sided envelope (graphic, not cadastral). */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s;
  const A = G.aerial;
  SA.px = (u, v) => [(u - A.tx) / A.s, -(v - A.ty) / A.s];
  SA.FRAME = [G.landuse.frame.x0, G.landuse.frame.y0, G.landuse.frame.x1, G.landuse.frame.y1];
  SA.F = (id) => G.features.find((f) => f.id === id);

  /* simplified site envelope — 4 straight sides enclosing the user's blue boundary
     (corners: NW, NE, SE, SW in local metres). Keeps position, orientation and proportion. */
  G.envelope = [[-48, 90], [43, 100.5], [59.5, 5.5], [-19, -19.5]];
  SA.SITE_C = SA.centroid(G.envelope);

  /* ---------- stage-aware scale: labels & px widths follow the 1600×900 canvas ---------- */
  const ppm0 = SA.MapViewer.prototype.ppm;
  SA.MapViewer.prototype.ppm = function () { return ppm0.call(this) / (SA.stageScale || 1); };
  /* per-map refresh hooks (chevrons, markers sized in px) */
  SA.onScale = function (mv, fn) {
    const prev = mv.onRefresh;
    mv.onRefresh = (ppm) => { prev && prev(ppm); fn(ppm); };
    mv.refresh();
  };

  /* ---------- street hierarchy ---------- */
  const H = {
    primary: { w: 4.6, op: 1 },
    secondary: { w: 2.8, op: 1 },
    local: { w: 2, op: 1 },
    service: { w: 1.9, op: 1 },
    minor: { w: 1.1, op: 0.55 },
  };
  SA.HIER = H;
  /* one-way directions (orient polyline so it runs with traffic) */
  const orient = (pts, dx, dy) => { const a = pts[0], z = pts[pts.length - 1]; return (z[0] - a[0]) * dx + (z[1] - a[1]) * dy > 0 ? pts : pts.slice().reverse(); };
  const ONEWAY = { Poursina: [-1, 0], '16Azar': [0, -1], Qods: [0, 1] };

  /* chevrons along a polyline, rebuilt at each scale change so they stay ~px sized */
  SA.chevrons = function (mv, g, pts, n, color, px) {
    const grp = s('g', { class: 'chev' }, g);
    SA.onScale(mv, (ppm) => {
      grp.innerHTML = '';
      const sz = (px || 3.2) / ppm;
      for (let i = 1; i <= n; i++) {
        const a = SA.along(pts, i / (n + 1)), q = SA.P(a.p), deg = (-a.ang * 180) / Math.PI;
        s('path', { d: 'M' + -sz + ' ' + -sz * 0.75 + ' L' + sz * 0.6 + ' 0 L' + -sz + ' ' + sz * 0.75, fill: 'none', stroke: color, 'stroke-width': 1.1, class: 'ns', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(' + q[0] + ' ' + q[1] + ') rotate(' + deg + ')' }, grp);
      }
    });
    return grp;
  };

  SA.streets = function (mv, g, names, o) {
    o = o || {};
    const out = {};
    names.forEach((n) => {
      const pts = G.streets[n], info = D.streets[n] || { h: 'minor' };
      if (!pts) return;
      const h = H[info.h] || H.minor, k = o.k || 1;
      const grp = s('g', { class: 'street', 'data-s': n }, g);
      const color = o.mono || info.c || 'var(--mute)';
      const common = { d: SA.d(pts), fill: 'none', class: 'ns', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      if (n === 'Zare' || n === 'ZareS') {
        s('path', Object.assign({}, common, { stroke: 'var(--zare-case)', 'stroke-width': h.w * k + 1.4 }), grp);
        s('path', Object.assign({}, common, { stroke: '#fff', 'stroke-width': h.w * k }), grp);
      } else {
        out[n] = s('path', Object.assign({}, common, { stroke: color, 'stroke-width': h.w * k, 'stroke-opacity': o.op != null ? o.op : h.op, class: 'ns' + (o.draw ? ' draw' : '') }), grp);
      }
      /* divided boulevard: refined centreline */
      if (n === 'Keshavarz' && !o.plain) s('path', Object.assign({}, common, { stroke: '#fff', 'stroke-width': 0.7, 'stroke-dasharray': '5 4', 'stroke-opacity': 0.9 }), grp);
      if (ONEWAY[n] && o.arrows !== false) SA.chevrons(mv, grp, orient(pts, ...ONEWAY[n]), n === 'Qods' ? 3 : 4, '#fff', 2.6);
      if (o.hover !== false && info.en) {
        const L = SA.len(pts);
        mv.hover(grp, () => ({ k: ({ primary: 'شریانی', secondary: 'جمع‌کننده', local: 'محلی', service: 'سرویس', minor: 'فرعی' })[info.h] || 'معبر', t: info.fa, e: info.en, rows: [['جهت', info.dirFa || '—'], ['طول ترسیمی', '≈ ' + SA.fa(Math.round(L)) + ' متر'], ['OSM', info.osm || '—']], src: info.note || '' }), 'st-' + n);
      }
    });
    return out;
  };
  /* Jalalieh dead end + pedestrian link to Keshavarz */
  SA.jalalieh = function (mv, g) {
    const J = G.streets.Jalalieh, j0 = J[0];
    const de = SA.along(J, 0.1), q = SA.P(de.p), deg = (-de.ang * 180) / Math.PI;
    const bar = s('g', null, g);
    SA.onScale(mv, (ppm) => { bar.innerHTML = ''; const L = 5 / ppm; s('line', { x1: 0, x2: 0, y1: -L, y2: L, stroke: 'var(--ink)', 'stroke-width': 2, class: 'ns', transform: 'translate(' + q[0] + ' ' + q[1] + ') rotate(' + deg + ')' }, bar); });
    s('path', { d: SA.d([j0, [j0[0] - 4, j0[1] + 24]]), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.1, 'stroke-dasharray': '2 3', class: 'ns flow slow' }, g);
  };

  /* ---------- site envelope ---------- */
  /* outward offset of the (convex, clockwise-in-svg) envelope by d metres */
  SA.envOffset = function (d) {
    const P = G.envelope, n = P.length, c = SA.centroid(P);
    return P.map((p, i) => { const a = P[(i + n - 1) % n], b = P[(i + 1) % n];
      const n1 = norm(a, p, c), n2 = norm(p, b, c), bis = [n1[0] + n2[0], n1[1] + n2[1]], L = Math.hypot(...bis) || 1, k = d / ((bis[0] / L) * n1[0] + (bis[1] / L) * n1[1]);
      return [p[0] + (bis[0] / L) * k, p[1] + (bis[1] / L) * k]; });
    function norm(a, b, c) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); let nx = dy / L, ny = -dx / L; const m = [(a[0] + b[0]) / 2 - c[0], (a[1] + b[1]) / 2 - c[1]]; if (nx * m[0] + ny * m[1] < 0) { nx = -nx; ny = -ny; } return [nx, ny]; }
  };
  SA.site = function (mv, g, o) {
    o = o || {};
    if (o.emph) {
      /* emphasised boundary: halo casing + outer dashed setback line + corner brackets */
      s('path', { d: SA.d(G.envelope, true), fill: 'none', stroke: o.dark === false ? '#fff' : 'rgba(255,255,255,.9)', 'stroke-width': (o.w || 2) + 4, class: 'ns', 'stroke-linejoin': 'miter', opacity: 0.85 }, g);
      s('path', { d: SA.d(SA.envOffset(6), true), fill: 'none', stroke: 'var(--site)', 'stroke-width': 1, 'stroke-dasharray': '6 4', class: 'ns', opacity: 0.9 }, g);
      const br = s('g', { class: 'site-br' }, g);
      SA.onScale(mv, (ppm) => {
        br.innerHTML = ''; const L = 14 / ppm;
        SA.envOffset(9).forEach((p, i, P) => { const a = P[(i + P.length - 1) % P.length], b = P[(i + 1) % P.length];
          const u = (q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [p[0] + (dx / l) * L, p[1] + (dy / l) * L]; };
          s('path', { d: SA.d([u(a), p, u(b)]), fill: 'none', stroke: 'var(--site)', 'stroke-width': 2.2, class: 'ns' }, br); });
      });
    }
    const p = s('path', { d: SA.d(G.envelope, true), fill: o.fill == null ? 'rgba(46,134,222,.12)' : o.fill, stroke: 'var(--site)', 'stroke-width': o.w || 2, class: 'ns site-poly' + (o.draw ? ' draw' : ''), 'stroke-linejoin': 'miter' }, g);
    if (o.hover !== false) mv.hover(p, { k: 'سایت پروژه', t: 'محدوده‌ی ساده‌شده‌ی سایت', big: '≈ ۸٬۹۰۰ m²', rows: [['دقت مساحت', '±۱۰٪'], ['ابعاد محاط', '≈ ۱۰۵ × ۱۱۰ متر'], ['ساخته‌شده امروز', '≈ ' + SA.fa(G.landuse.siteBuilt) + '٪']], src: 'پوشش گرافیکی چهارضلعی؛ نه مرز ثبتی. مساحت از ماسک آبی کاربر روی تصویر هوایی.' }, 'site');
    return p;
  };

  /* ---------- quiet base ---------- */
  SA.base = function (mv, o) {
    o = o || {};
    if (o.aerial !== false) mv.aerial({ filter: o.dark ? 'grayscale(1) brightness(.55) contrast(.9)' : 'grayscale(1) contrast(.62) brightness(1.2)', opacity: o.dark ? 0.9 : 0.5 });
    const b = mv.layer('base');
    if (o.buildings !== false) SA.features(mv, b, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', hover: false, dashUnc: false, style: () => (o.dark ? { fill: 'rgba(255,255,255,.08)', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 0.5, class: 'ns' } : { fill: 'var(--paper-3)', 'fill-opacity': 0.9, stroke: 'rgba(28,31,34,.25)', 'stroke-width': 0.5, class: 'ns' }) });
    return b;
  };

  SA.luFill = (u) => (D.landuse[u] ? D.landuse[u].c : 'var(--lu-unk)');
  SA.features = function (mv, g, o) {
    o = o || {};
    const list = G.features.filter(o.filter || (() => true));
    list.sort((a, b) => (a.kind === 'parcel' ? 0 : 1) - (b.kind === 'parcel' ? 0 : 1) || (a.id === 'ut_campus' ? -1 : 0));
    return list.map((f) => {
      const st = o.style ? o.style(f) : { fill: SA.luFill(f.use) };
      const p = s('path', Object.assign({ d: SA.d(f.pts, true), 'stroke-linejoin': 'round' }, st), g);
      if (f.unc && o.dashUnc !== false) { p.setAttribute('stroke', 'var(--ink)'); p.setAttribute('stroke-dasharray', '3 2'); p.setAttribute('stroke-width', 0.7); p.classList.add('ns'); }
      if (o.hover !== false) {
        const lu = D.landuse[f.use] || {};
        mv.hover(p, () => ({ k: lu.fa + (f.unc ? ' · نامطمئن' : ''), t: f.fa || lu.fa, e: f.name || '', rows: [['سطح اشغال', '≈ ' + SA.fa(SA.fmt(SA.area(f.pts))) + ' m²']], src: f.src }), o.group ? o.group(f) : null);
      }
      return p;
    });
  };
  SA.treeRows = [[[330, 300], [1250, 150]], [[560, 930], [1250, 760]], [[1080, 300], [1180, 800]]].map((r) => r.map((q) => SA.px(q[0], q[1])));
  SA.trees = function (g, o) {
    o = o || {};
    SA.treeRows.forEach((r) => {
      const L = SA.len(r), n = Math.floor(L / (o.step || 9));
      for (let i = 0; i <= n; i++) { const q = SA.P(SA.along(r, i / n).p); s('circle', { cx: q[0], cy: q[1], r: o.r || 3.2, fill: o.fill || '#9EB48B', 'fill-opacity': o.op || 0.8, stroke: o.stroke || 'none' }, g); }
    });
  };
  /* numbered marker, px-sized */
  SA.pin = function (mv, g, p, text, o) {
    o = o || {};
    const q = SA.P(p), m = s('g', { class: 'mkr', transform: 'translate(' + q[0] + ' ' + q[1] + ')' }, g);
    s('circle', { r: 8, fill: o.fill || 'var(--ink)', stroke: o.stroke || '#fff', 'stroke-width': 1.3 }, m);
    s('text', { class: 'mkr-t', 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: o.color || '#fff', text }, m);
    SA.onScale(mv, (ppm) => m.setAttribute('transform', 'translate(' + q[0] + ' ' + q[1] + ') scale(' + (1 / ppm).toFixed(4) + ')'));
    return m;
  };
  /* arrow with px head */
  SA.arrow = function (mv, g, pts, color, o) {
    o = o || {};
    const id = 'ah' + (SA._ah = (SA._ah || 0) + 1);
    const defs = SA.defs(mv.svg), m = s('marker', { id, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto', markerUnits: 'userSpaceOnUse' }, defs);
    s('path', { d: 'M0 1 L9 5 L0 9 z', fill: color }, m);
    const p = s('path', { d: SA.d(pts), fill: 'none', stroke: color, 'stroke-width': o.w || 1.6, 'stroke-dasharray': o.dash || null, class: 'ns' + (o.flow ? ' flow' : '') + (o.draw ? ' draw' : ''), 'stroke-linecap': 'round', 'marker-end': 'url(#' + id + ')' }, g);
    SA.onScale(mv, (ppm) => { const z = 9 / ppm; m.setAttribute('markerWidth', z); m.setAttribute('markerHeight', z); });
    return p;
  };
  SA.dimLine = function (mv, g, a, b, text, off) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang) * off, ny = Math.cos(ang) * off;
    const A2 = [a[0] + nx, a[1] + ny], B2 = [b[0] + nx, b[1] + ny];
    s('path', { d: SA.d([A2, B2]), stroke: 'var(--ink)', 'stroke-width': 0.8, class: 'ns' }, g);
    [A2, B2].forEach((p) => { const q = SA.P(p); s('circle', { cx: q[0], cy: q[1], r: 0.9, fill: 'var(--ink)' }, g); });
    let deg = (-ang * 180) / Math.PI; if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
    mv.label([(A2[0] + B2[0]) / 2 + nx * 0.5, (A2[1] + B2[1]) / 2 + ny * 0.5], text, 'lbl', { rot: deg, size: 9.5 });
  };
  SA.minRect = function (P) {
    let best = null;
    for (let a = 0; a < 90; a += 0.25) {
      const r = (a * Math.PI) / 180, c = Math.cos(r), sn = Math.sin(r);
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      P.forEach(([x, y]) => { const u = x * c + y * sn, v = -x * sn + y * c; x0 = Math.min(x0, u); x1 = Math.max(x1, u); y0 = Math.min(y0, v); y1 = Math.max(y1, v); });
      const ar = (x1 - x0) * (y1 - y0);
      if (!best || ar < best.ar) best = { ar, a, x0, x1, y0, y1, c, sn };
    }
    const b = best, back = (u, v) => [u * b.c - v * b.sn, u * b.sn + v * b.c];
    best.pts = [back(b.x0, b.y0), back(b.x1, b.y0), back(b.x1, b.y1), back(b.x0, b.y1)];
    best.w = b.x1 - b.x0; best.h = b.y1 - b.y0;
    return best;
  };
  SA.roadsCtx = function (g, k, o) {
    o = o || {};
    for (const n in G.roads) {
      const r = G.roads[n];
      const col = n === 'Keshavarz Blvd' ? 'var(--kesh)' : n === 'Poursina St' ? 'var(--pour)' : n === '16 Azar St' ? 'var(--azar)' : 'var(--ink)';
      const special = col !== 'var(--ink)';
      s('path', { d: SA.d(r.p), fill: 'none', stroke: col, 'stroke-opacity': special ? 1 : { t: 0.75, p: 0.5, s: 0.3 }[r.c], 'stroke-width': (special ? 2 : { t: 2.2, p: 1.4, s: 0.8 }[r.c]) * k, class: 'ns' + (o.draw ? ' draw' : ''), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    }
  };
  SA.stations = function (mv, g, px) {
    G.stations.forEach((st) => {
      const q = SA.P(st.p), dist = Math.hypot(st.p[0] - SA.SITE_C[0], st.p[1] - SA.SITE_C[1]);
      const r = s('rect', { fill: '#fff', stroke: 'var(--ink)', 'stroke-width': 1.3, class: 'ns' }, g);
      SA.onScale(mv, (ppm) => { const z = (px || 7) / ppm; r.setAttribute('x', q[0] - z / 2); r.setAttribute('y', q[1] - z / 2); r.setAttribute('width', z); r.setAttribute('height', z); });
      mv.hover(r, { k: 'مترو · ' + st.line, t: 'ایستگاه ' + st.fa, e: st.en, big: '≈ ' + SA.fa(SA.fmt(Math.round(dist / 10) * 10)) + ' m', src: 'فاصله‌ی مستقیم از مرکز سایت · OSM' });
    });
  };
})();
