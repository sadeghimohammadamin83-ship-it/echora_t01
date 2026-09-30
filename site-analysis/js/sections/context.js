/* Shared drawing helpers + sections 00 Cover · 01 Location · 02 Urban context · 03 GIS board.
   Linework & site envelope come from js/core/draw.js; imagery, sheets and annotations from js/core/atlas.js. */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el;
  const FRAME = SA.FRAME, F = SA.F;
  SA.sections = SA.sections || [];

  /* ---------------- shared drawing (delegates to the atlas linework) ---------------- */
  SA.drawStreets = function (mv, g, names, o) {
    o = o || {};
    return SA.streets(mv, g, names, { k: o.k && o.k < 1 ? 0.85 : 1, mono: o.mono, hover: o.hover, draw: o.draw, arrows: o.arrows, op: o.op });
  };
  SA.drawSite = function (mv, g, o) {
    o = o || {};
    const p = SA.site(mv, g, { fill: o.fill, w: o.w ? Math.min(o.w, 2.6) : 2, hover: o.hover, draw: o.draw });
    return p;
  };
  SA.drawFeatures = function (mv, g, o) { return SA.features(mv, g, o); };
  SA.drawTrees = function (g, o) { return SA.trees(g, o); };
  SA.onewayArrows = function (g, pts, n, color, size) {
    for (let i = 1; i <= n; i++) {
      const a = SA.along(pts, i / (n + 1)), q = SA.P(a.p), deg = (-a.ang * 180) / Math.PI;
      s('path', { d: 'M-' + size + ' -' + size * 0.6 + ' L' + size + ' 0 L-' + size + ' ' + size * 0.6, fill: 'none', stroke: color, 'stroke-width': size * 0.35, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(' + q[0] + ' ' + q[1] + ') rotate(' + deg + ')' }, g);
    }
  };

  /* ================= 00 COVER — architectural opening ================= */
  function cover() {
    const host = SA.$('#cover-map');
    const c = SA.SITE_C;
    const mv = new SA.MapViewer(host, { view: [c[0] - 330, c[1] - 200, c[0] + 170, c[1] + 210], fit: 'xMidYMid slice', north: false, scale: false, coords: false });
    SA.atlas(mv, { dark: true, veg: true, op: 0.9 });
    const g = mv.layer('lines');
    SA.features(mv, g, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', hover: false, dashUnc: false, style: () => ({ fill: 'rgba(255,255,255,.04)', stroke: 'rgba(255,255,255,.34)', 'stroke-width': 0.6, class: 'ns' }) });
    SA.streets(mv, g, ['16Azar', 'Qods', 'Poursina', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS', 'Keshavarz'], { hover: false, draw: true, arrows: false });
    const site = SA.site(mv, mv.layer('site'), { hover: false, fill: 'rgba(46,134,222,.22)', w: 2.4, draw: true });
    const dg = mv.layer('dims');
    const mr = SA.minRect(G.envelope);
    SA.dimLine(mv, dg, mr.pts[0], mr.pts[1], '≈ ' + Math.round(mr.w) + ' m', -14);
    SA.dimLine(mv, dg, mr.pts[1], mr.pts[2], '≈ ' + Math.round(mr.h) + ' m', -14);
    dg.classList.add('dims');
    SA.annot(mv, dg, G.envelope[1], 'A01', 'KESHAVARZ × JALALIEH', { dir: [1, 1], len: 46, color: '#fff' });
    SA.annot(mv, dg, [c[0], c[1]], 'A02', 'SITE · ≈ 8,900 m²', { dir: [1, -1], len: 70, color: '#7DB7EE' });
    SA.annot(mv, dg, G.envelope[3], 'A03', 'POURSINA · UNIVERSITY EDGE', { dir: [-1, -1], len: 40, color: '#fff' });
    SA.sheet(mv, { no: 'A-00', title: 'SITE LOCATION PLAN', src: 'Base: Google Maps + aerial, graded · OSM · user annotation' });
    SA.prepDraw(host);
    const go = () => { SA.$$('.draw', host).forEach((p, i) => setTimeout(() => p.classList.add('on'), 200 + i * 90)); setTimeout(() => dg.classList.add('on'), 1400); SA.revealAnnots(host); };
    SA.observe(host, go);
    if (!SA.reduced) addEventListener('scroll', () => { const y = scrollY; if (y < innerHeight * 1.2) mv.world.setAttribute('transform', 'translate(0 ' + (y * 0.06).toFixed(1) + ')'); }, { passive: true });
    SA.$('#cover-legend').innerHTML = '<span class="t-tech">User colour code</span>' + ['kesh:Keshavarz', 'jal:Jalalieh', 'zare:Zare\'', 'hed:Hedayati', 'ena:Enayat', 'pour:Poursina', 'azar:16 Azar'].map((x) => { const [cc, n] = x.split(':'); return '<i style="--c:var(--' + cc + ')">' + n + '</i>'; }).join('') + '<i style="--c:var(--site)">Site</i>';
    return site;
  }

  /* ================= 01 LOCATION — nested zoom ================= */
  function location() {
    const stage = SA.$('#loc-stage');
    const frames = [];
    const mk = (view, label, corners, extra) => {
      const f = el('div', { class: 'zf' }, stage);
      const mv = new SA.MapViewer(f, Object.assign({ view, corners, label, coords: false }, extra));
      frames.push({ f, mv }); return mv;
    };
    /* 1 Iran — lon/lat equirectangular, x scaled by cos 32° */
    const K = Math.cos((32 * Math.PI) / 180), ll = (lon, lat) => [lon * K, lat];
    const m1 = mk([43.5 * K, 24.5, 64 * K, 40.5], 'Iran', { tl: '01 · Iran', tr: 'Natural Earth' }, { scale: false });
    const g1 = m1.layer('p');
    G.iran.forEach((pv) => pv.r.forEach((ring) => {
      const p = s('path', { d: SA.d(ring.map((q) => ll(q[0], q[1])), true), fill: pv.n === 'Tehran' ? 'var(--site)' : 'var(--paper-3)', stroke: 'var(--card)', 'stroke-width': 0.6, class: 'ns' }, g1);
      m1.hover(p, { k: 'Province', t: pv.n === 'Tehran' ? 'استان تهران' : '', e: pv.n }, 'pv-' + pv.n);
    }));
    m1.label(ll(51.39, 36.35), 'TEHRAN', 'lbl'); m1.label(ll(55.2, 32.3), 'IRAN', 'lbl', { size: 16 });
    const t1 = SA.P(ll(51.39, 35.7)); frames[0].mark = s('circle', { cx: t1[0], cy: t1[1], r: 0.22, fill: '#fff', stroke: 'var(--ink)', 'stroke-width': 0.08 }, g1);
    /* 2 Tehran — 22 districts */
    const all = [].concat(...Object.values(G.districts));
    const bx = [Math.min(...all.map((p) => p[0])), Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[0])), Math.max(...all.map((p) => p[1]))];
    const m2 = mk([bx[0] - 1200, bx[1] - 1500, bx[2] + 1200, bx[3] + 1500], 'Tehran districts', { tl: '02 · Tehran · 22 districts', tr: 'OSM' });
    const g2 = m2.layer('d');
    for (const k in G.districts) {
      const P = G.districts[k], is6 = k === '6';
      const p = s('path', { d: SA.d(P, true), fill: is6 ? 'var(--site)' : 'var(--paper-3)', stroke: 'var(--card)', 'stroke-width': 1.2, class: 'ns' }, g2);
      m2.hover(p, { k: 'Municipal district', t: 'منطقه‌ی ' + SA.fa(k), big: G.districtArea[k] + ' km²', e: 'District ' + k }, 'd' + k);
      m2.label(SA.centroid(P), k, 'lbl' + (is6 ? ' light' : ''), { size: is6 ? 12 : 9 });
    }
    frames[1].mark = s('circle', { cx: 0, cy: -40, r: 260, fill: '#fff', stroke: 'var(--ink)', 'stroke-width': 90 }, g2);
    /* 3 District 6 */
    const d6 = G.districts['6'], xs = d6.map((p) => p[0]), ys = d6.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, r = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 300;
    const m3 = mk([cx - r, cy - r, cx + r, cy + r], 'District 6', { tl: '03 · District 6 · 21.4 km²', tr: 'OSM rel. 6729037' });
    const g3 = m3.layer('d');
    s('path', { d: SA.d(d6, true), fill: 'rgba(46,134,222,.07)', stroke: 'var(--site)', 'stroke-width': 1.4, class: 'ns' }, g3);
    s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)' }, g3);
    s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)', opacity: 0.7 }, g3);
    roadsInto(m3, g3, 1);
    stationsInto(m3, g3, 3.2);
    frames[2].mark = s('circle', { cx: SA.SITE_C[0], cy: -SA.SITE_C[1], r: 60, fill: 'var(--site)', stroke: '#fff', 'stroke-width': 2, class: 'ns' }, g3);
    /* 4 UT / Laleh */
    const m4 = mk([-800, -760, 800, 840], 'University of Tehran and Laleh Park', { tl: '04 · Laleh Park ↔ University of Tehran', tr: 'OSM' });
    const g4 = m4.layer('d');
    const pk = s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)' }, g4);
    m4.hover(pk, { k: 'Green space', t: 'بوستان لاله', big: '35 ha', e: 'Laleh Park — est. 1966 (Farah Park)', src: 'Wikipedia [4]; OSM [1]' });
    const cp = s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)', opacity: 0.8 }, g4);
    m4.hover(cp, { k: 'Educational', t: 'پردیس مرکزی دانشگاه تهران', big: '≈ 20.8 ha', e: 'University of Tehran — inaugurated 1934', src: 'OSM polygon [1]; [5]' });
    roadsInto(m4, g4, 2);
    stationsInto(m4, g4, 5);
    s('path', { d: SA.d(G.envelope, true), fill: 'var(--site)', stroke: 'var(--ink)', 'stroke-width': 0.8, class: 'ns' }, g4);
    m4.label([-40, 470], 'LALEH PARK', 'lbl'); m4.label([160, -330], 'UNIVERSITY OF TEHRAN', 'lbl'); m4.label([-40, 505], 'بوستان لاله', 'lbl-fa'); m4.label([160, -295], 'دانشگاه تهران', 'lbl-fa');
    frames[3].mark = s('circle', { cx: SA.SITE_C[0], cy: -SA.SITE_C[1], r: 30, fill: 'none' }, g4);
    /* 5 Site */
    const m5 = mk([-95, -60, 105, 145], 'The site', { tl: '05 · Site', tr: 'aerial + user annotation' });
    m5.aerial({ filter: 'saturate(.35) contrast(.95) brightness(1.06)' });
    const g5 = m5.layer('d');
    SA.drawStreets(m5, g5, ['Keshavarz', 'Jalalieh', 'Zare', 'ZareS', 'Hedayati', 'Enayat', 'Poursina', '16Azar'], { k: 0.75 });
    SA.drawSite(m5, g5, { fill: 'rgba(46,134,222,.28)', w: 2 });
    const mr = SA.minRect(G.envelope);
    s('path', { d: SA.d(mr.pts, true), fill: 'none', stroke: '#fff', 'stroke-width': 0.9, 'stroke-dasharray': '3 2', class: 'ns' }, g5);
    dim(m5, g5, mr.pts[0], mr.pts[1], '≈ ' + Math.round(mr.w) + ' m', -9);
    dim(m5, g5, mr.pts[1], mr.pts[2], '≈ ' + Math.round(mr.h) + ' m', -9);
    m5.label(SA.SITE_C, '≈ 8,900 m²', 'lbl light', { size: 13 });
    m5.label([SA.SITE_C[0], SA.SITE_C[1] - 9], '±10 % · min. rectangle at ' + mr.a.toFixed(1) + '°', 'lbl light', { size: 8.5 });
    frames[4].mark = null;
    /* choreography */
    const set = (k) => frames.forEach((fr, j) => { fr.f.className = 'zf mapframe ' + (j < k ? 'past' : j === k ? 'cur' : 'next'); });
    const origins = () => frames.forEach((fr, j) => {
      const tgt = fr.mark; if (!tgt) return;
      const r1 = fr.f.getBoundingClientRect(), r2 = tgt.getBoundingClientRect();
      if (!r1.width) return;
      fr.f.style.transformOrigin = ((r2.left + r2.width / 2 - r1.left) / r1.width * 100).toFixed(2) + '% ' + ((r2.top + r2.height / 2 - r1.top) / r1.height * 100).toFixed(2) + '%';
      const nx = frames[j + 1]; if (nx) nx.f.style.transformOrigin = fr.f.style.transformOrigin;
    });
    set(0);
    requestAnimationFrame(origins); addEventListener('resize', origins);
    SA.scrolly(SA.$('#loc-scrolly'), (k) => { origins(); set(k); });
  }
  function dim(mv, g, a, b, text, off) {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]), nx = -Math.sin(ang) * off, ny = Math.cos(ang) * off;
    const A2 = [a[0] + nx, a[1] + ny], B2 = [b[0] + nx, b[1] + ny];
    s('path', { d: SA.d([A2, B2]), stroke: '#fff', 'stroke-width': 0.9, class: 'ns', 'marker-start': SA.marker(mv.svg, 'dimw', '#fff', 5), 'marker-end': SA.marker(mv.svg, 'dimw', '#fff', 5) }, g);
    let deg = (-ang * 180) / Math.PI; if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
    mv.label([(A2[0] + B2[0]) / 2 + nx * 0.6, (A2[1] + B2[1]) / 2 + ny * 0.6], text, 'lbl light', { rot: deg, size: 10 });
  }
  SA.dim = dim;
  function roadsInto(mv, g, k) {
    for (const n in G.roads) {
      const r = G.roads[n];
      s('path', { d: SA.d(r.p), fill: 'none', stroke: r.c === 't' ? 'var(--ink-2)' : 'var(--mute)', 'stroke-width': ({ t: 2.2, p: 1.4, s: 0.8 })[r.c] * k, class: 'ns', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    }
    s('path', { d: SA.d(G.roads['Keshavarz Blvd'].p), fill: 'none', stroke: 'var(--kesh)', 'stroke-width': 2.4 * k, class: 'ns' }, g);
    s('path', { d: SA.d(G.roads['Poursina St'].p), fill: 'none', stroke: 'var(--pour)', 'stroke-width': 1.6 * k, class: 'ns' }, g);
    s('path', { d: SA.d(G.roads['16 Azar St'].p), fill: 'none', stroke: 'var(--azar)', 'stroke-width': 1.6 * k, class: 'ns' }, g);
  }
  SA.roadsInto = roadsInto;
  function stationsInto(mv, g, size) {
    G.stations.forEach((st) => {
      const q = SA.P(st.p), dist = Math.hypot(st.p[0] - SA.SITE_C[0], st.p[1] - SA.SITE_C[1]);
      const r = s('rect', { x: q[0], y: q[1], width: 1, height: 1, fill: '#fff', stroke: 'var(--ink)', 'stroke-width': 1.4, class: 'ns stn', 'data-sz': size }, g);
      mv.hover(r, { k: 'Metro · ' + st.line, t: 'ایستگاه ' + st.fa, e: st.en, big: '≈ ' + SA.fmt(Math.round(dist / 10) * 10) + ' m', src: 'straight line from site centroid · OSM [1][15]' });
    });
    const prev = mv.onRefresh;
    mv.onRefresh = (ppm) => { prev && prev(ppm); SA.$$('.stn', mv.svg).forEach((r) => { const z = r.dataset.sz * 2 / ppm; const st = G.stations[SA.$$('.stn', mv.svg).indexOf(r)]; const q = SA.P(st.p); r.setAttribute('x', q[0] - z / 2); r.setAttribute('y', q[1] - z / 2); r.setAttribute('width', z); r.setAttribute('height', z); }); };
    mv.refresh();
  }
  SA.stationsInto = stationsInto;

  /* ================= 02 URBAN CONTEXT ================= */
  function urban() {
    const host = SA.$('#urban-map');
    const C = SA.SITE_C;
    const mv = new SA.MapViewer(host, { view: [C[0] - 2750, C[1] - 2750, C[0] + 2750, C[1] + 2750], zoom: true, corners: { tl: 'Radius 2.5 km · OSM network', tr: 'hover stations & roads' } });
    const base = mv.layer('base');
    const d6 = s('path', { d: SA.d(G.districts['6'], true), fill: 'rgba(46,134,222,.05)', stroke: 'var(--site)', 'stroke-width': 1, 'stroke-dasharray': '5 4', class: 'ns' }, base);
    mv.hover(d6, { k: 'Municipal boundary', t: 'مرز منطقه‌ی ۶', big: '21.4 km²', src: 'OSM relation 6729037' });
    const pk = s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)' }, base);
    mv.hover(pk, { k: 'Primary · green', t: 'بوستان لاله', big: '35 ha', e: 'Laleh Park — adjacent, across Keshavarz' });
    const cp = s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)' }, base);
    mv.hover(cp, { k: 'Primary · educational', t: 'پردیس مرکزی دانشگاه تهران', big: '≈ 20.8 ha', e: 'adjacent, across Poursina' });
    /* rings */
    const rg = mv.layer('rings');
    [500, 1000, 1500, 2000, 2500].forEach((m) => {
      s('circle', { cx: C[0], cy: -C[1], r: m, fill: 'none', stroke: 'var(--ink)', 'stroke-opacity': m === 2500 ? 0.55 : 0.18, 'stroke-width': m === 2500 ? 1.2 : 0.8, 'stroke-dasharray': m === 2500 ? null : '2 4', class: 'ns' }, rg);
      mv.label([C[0] + m * Math.cos(-0.72), C[1] + m * Math.sin(-0.72)], (m / 1000).toFixed(1) + ' km', 'lbl', { size: 8.5, layer: 'rings' });
    });
    const rd = mv.layer('roads');
    for (const n in G.roads) {
      const r = G.roads[n], w = { t: 3.2, p: 2, s: 1.1 }[r.c], col = n === 'Keshavarz Blvd' ? 'var(--kesh)' : n === 'Poursina St' ? 'var(--pour)' : n === '16 Azar St' ? 'var(--azar)' : r.c === 't' ? 'var(--ink)' : r.c === 'p' ? 'var(--ink-2)' : 'var(--mute)';
      const p = s('path', { d: SA.d(r.p), fill: 'none', stroke: col, 'stroke-width': w, class: 'ns draw', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, rd);
      mv.hover(p, { k: { t: 'Expressway', p: 'Primary arterial', s: 'Secondary / collector' }[r.c], e: n, rows: [['Mapped length', '≈ ' + SA.fmt(Math.round(SA.len(r.p) / 10) * 10) + ' m']], src: 'OSM [1]' }, 'r-' + n);
    }
    ['Keshavarz Blvd', 'Enghelab St', 'Valiasr St', 'N. Kargar St', 'Fatemi St', 'Chamran Expy', 'Jomhuri St', 'Hafez St', 'Taleqani St'].forEach((n) => {
      const r = G.roads[n].p, a = SA.along(r, 0.5); let deg = (-a.ang * 180) / Math.PI; if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
      mv.label([a.p[0], a.p[1]], n.toUpperCase(), 'lbl', { rot: deg, size: 8.5, layer: 'labels' });
    });
    stationsInto(mv, mv.layer('stations'), 5);
    SA.$$('.stn', mv.svg).forEach((r) => r.setAttribute('fill', '#fff'));
    const sg = mv.layer('site');
    s('path', { d: SA.d(G.envelope, true), fill: 'var(--site)', stroke: 'var(--site)', 'stroke-width': 3, class: 'ns' }, sg);
    const pul = s('circle', { cx: C[0], cy: -C[1], r: 40, fill: 'none', stroke: 'var(--site)', 'stroke-width': 1.5, class: 'ns pulse-ring' }, sg);
    mv.label([C[0] + 120, C[1] + 70], 'SITE', 'lbl', { anchor: 'start', size: 11 });
    SA.prepDraw(host);
    SA.observe(host, () => SA.$$('.draw', host).forEach((p, i) => setTimeout(() => p.classList.add('on'), i * 60)));
    SA.legend(SA.$('#urban-legend'), [
      { kind: 'line', color: 'var(--ink)', extra: 4, en: 'Expressway', fa: 'بزرگراه' },
      { kind: 'line', color: 'var(--ink-2)', extra: 2.6, en: 'Primary arterial', fa: 'شریانی اصلی' },
      { kind: 'line', color: 'var(--mute)', extra: 1.5, en: 'Secondary / collector', fa: 'جمع‌کننده' },
      { kind: 'rect', color: '#fff', extra: 'stroke="#1C1F22" stroke-width="1.5"', en: 'Metro station', fa: 'ایستگاه مترو' },
      { kind: 'dash', color: 'var(--site)', en: 'District 6 boundary', fa: 'مرز منطقه‌ی ۶' },
      { kind: 'rect', color: 'var(--lu-green)', en: 'Laleh Park', fa: 'بوستان لاله' },
      { kind: 'rect', color: 'var(--lu-edu)', en: 'UT campus', fa: 'پردیس دانشگاه' },
    ]);
    /* distance ladder */
    const lad = SA.$('#urban-ladder');
    const W = 2500, icon = { metro: '■', culture: '◆', sport: '●', edu: '▲', city: '○' };
    const box = el('div', { class: 'ladder' }, lad);
    D.poi.forEach((p, i) => {
      const row = el('div', { class: 'lr rv d' + ((i % 4) + 1), 'data-t': p.t }, box,
        '<span class="ic">' + icon[p.t] + '</span><span class="nm">' + p.en + '<em class="fa-inline">' + p.fa + '</em></span><span class="bar"><i style="width:' + ((p.m / W) * 100).toFixed(1) + '%"></i></span><span class="m">' + (p.m >= 1000 ? (p.m / 1000).toFixed(2) + ' km' : p.m + ' m') + '</span>');
      row.tabIndex = 0;
    });
  }

  /* ================= 03 GIS BOARD — sticky map + 7 analytical steps ================= */
  function gis() {
    const host = SA.$('#gis-map'), panel = SA.$('#gis-panel');
    const CTX = [-360, -300, 380, 420], SITEV = [-80, -50, 100, 130];
    const mv = new SA.MapViewer(host, { view: FRAME, zoom: true, corners: { tr: 'LOCAL GRID · METRES' } });
    SA.gisMV = mv;
    SA.sheet(mv, { no: 'A-03', title: 'GIS BOARD · SITE & CONTEXT', src: 'OSM · user annotation · imagery graded & classified' });
    /* BASE */
    const base = mv.layer('base', { label: 'Base', fa: 'پایه', sw: 'background:linear-gradient(135deg,#8a8378,#e7e0d2)' });
    SA.atlas(mv, { veg: false }).setAttribute('data-inbase', '1');
    base.appendChild(mv.layers.atlas ? mv.layers.atlas.g : SA.$('[data-layer=atlas]', mv.svg));
    const fr = mv.layer('frame', { opacity: false });
    s('rect', { x: FRAME[0], y: -FRAME[3], width: FRAME[2] - FRAME[0], height: FRAME[3] - FRAME[1], fill: 'none', stroke: 'var(--ink)', 'stroke-width': 0.7, 'stroke-dasharray': '4 3', class: 'ns' }, fr);
    mv.label([FRAME[0] + 3, FRAME[3] + 5], 'AERIAL 0.19 m/px', 'lbl', { anchor: 'start', size: 8, layer: 'frame' });
    /* LAND USE, split by category so each can be switched */
    const LUL = [['res', 'Residential', 'مسکونی'], ['edu', 'Education', 'آموزشی'], ['cult', 'Cultural', 'فرهنگی'], ['com', 'Commercial', 'تجاری'], ['pub', 'Public service', 'عمومی'], ['park', 'Parking', 'پارکینگ'], ['unk', 'Unverified', 'نامشخص']];
    const lu = mv.layer('landuse', { label: 'Land use', fa: 'کاربری', sw: 'background:linear-gradient(90deg,var(--lu-res) 33%,var(--lu-edu) 33% 66%,var(--lu-com) 66%)', on: false });
    const hatch = SA.hatch(mv.svg, 'gh-park', 'rgba(28,31,34,.4)', 3, 0.5);
    LUL.forEach(([k, en, fa]) => {
      const g = mv.layer('lu-' + k, { parent: lu, label: en, fa, sw: 'background:' + (k === 'park' ? '#C3C0B8' : SA.luFill(k)), on: true });
      SA.drawFeatures(mv, g, { filter: (f) => f.use === k, style: (f) => (k === 'park' ? { fill: hatch, stroke: 'var(--mute)', 'stroke-width': 0.6, class: 'ns' } : { fill: SA.luFill(f.use), 'fill-opacity': f.kind === 'parcel' ? 0.55 : 0.92, stroke: 'var(--card)', 'stroke-width': 0.5, class: 'ns' }), group: (f) => 'lu-' + f.use });
    });
    /* GREEN: park polygon + canopy extracted from the imagery (stipple) */
    const gr = mv.layer('green', { label: 'Green', fa: 'سبز', sw: 'background:radial-gradient(#56773F 30%,transparent 32%) 0 0/4px 4px,#C9D6B4', on: false });
    const pk = s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)', 'fill-opacity': 0.35, stroke: '#56773F', 'stroke-width': 0.8, class: 'ns' }, gr);
    mv.hover(pk, { k: 'Green structure', t: 'بوستان لاله', big: '35 ha', src: 'OSM · canopy stipple extracted from imagery (' + SA.fa(window.SA_IMGRY.veg.aerial) + '٪ of the aerial frame)' });
    SA.vegLayer(mv, gr);
    /* BUILDINGS (figure) */
    const bl = mv.layer('buildings', { label: 'Buildings', fa: 'توده', sw: 'background:var(--ink)', on: false });
    SA.drawFeatures(mv, bl, { filter: (f) => f.kind === 'bldg', hover: false, dashUnc: false, style: (f) => ({ fill: f.use === 'site' ? 'none' : 'var(--ink)', 'fill-opacity': 0.85, stroke: f.use === 'site' ? 'var(--ink)' : 'none', 'stroke-width': 0.8, 'stroke-dasharray': f.use === 'site' ? '2 1.5' : null, class: 'ns' }) });
    /* ROAD NETWORK */
    const rd = mv.layer('roads', { label: 'Road network', fa: 'معابر', sw: 'background:linear-gradient(90deg,var(--kesh) 25%,var(--pour) 25% 50%,var(--azar) 50% 75%,var(--jal) 75%)', on: false });
    for (const n of ['Enghelab St', 'Vesal Shirazi St', 'Keshavarz Blvd', 'N. Kargar St']) s('path', { d: SA.d(G.roads[n].p), fill: 'none', stroke: 'var(--ink)', 'stroke-opacity': 0.3, 'stroke-width': 2.2, class: 'ns' }, rd);
    SA.streets(mv, rd, ['Qods', 'Nosrat', 'BahmanOrouji', 'Kargar', 'DavoodTaheri', 'Oghab', 'Yekom', '16Azar', 'Poursina', 'Enayat', 'Hedayati', 'Jalalieh', 'Zare', 'ZareS', 'Keshavarz'], { draw: true });
    /* PEDESTRIAN + transit */
    const ped = mv.layer('pedestrian', { label: 'Pedestrian', fa: 'پیاده', sw: 'background:repeating-linear-gradient(90deg,var(--ink) 0 3px,transparent 3px 6px)', on: false });
    SA.jalalieh(mv, ped);
    SA.arrow(mv, ped, [[188, 249], [140, 195], [90, 150], [G.streets.Jalalieh[0][0] - 4, G.streets.Jalalieh[0][1] + 24], G.streets.Jalalieh[0], G.streets.Jalalieh[G.streets.Jalalieh.length - 1], [60, -70]], 'var(--site-deep)', { w: 1.8, dash: '4 4', flow: true });
    s('path', { d: SA.d(G.streets.Zare), stroke: 'var(--ink)', 'stroke-width': 1.3, fill: 'none', 'stroke-dasharray': '3 3', class: 'ns flow slow' }, ped);
    SA.stations(mv, ped, 8);
    mv.label([198, 262], 'M BOOSTAN-E LALEH · L6', 'lbl', { anchor: 'start', size: 8.5, layer: 'pedestrian' });
    /* PUBLIC / PRIVATE gradient along the four edges of the envelope */
    const pp = mv.layer('publicprivate', { label: 'Public / private', fa: 'عمومی/خصوصی', sw: 'background:linear-gradient(90deg,#1F6C9F,#9F2F2D)', on: false });
    const E = G.envelope, EDG = [[E[0], E[1], '#1F6C9F', 'PUBLIC'], [E[1], E[2], '#6FA8D6', 'SEMI-PUBLIC'], [E[2], E[3], '#1F6C9F', 'PUBLIC / INSTITUTIONAL'], [E[3], E[0], '#9F2F2D', 'PRIVATE / SENSITIVE']];
    EDG.forEach(([a, b, c, t]) => {
      const off = SA.offset([a, b], -7);
      s('path', { d: SA.d(off), stroke: c, 'stroke-width': 14, 'stroke-opacity': 0.35, fill: 'none' }, pp);
      s('path', { d: SA.d([a, b]), stroke: c, 'stroke-width': 3, fill: 'none', class: 'ns' }, pp);
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], cc = SA.SITE_C, v = [m[0] - cc[0], m[1] - cc[1]], L = Math.hypot(...v);
      mv.label([m[0] + (v[0] / L) * 22, m[1] + (v[1] / L) * 22], t, 'lbl', { size: 8.5, layer: 'publicprivate' });
    });
    /* SITE */
    const st = mv.layer('site', { label: 'Site', fa: 'سایت', sw: 'background:var(--site)' });
    const sp = SA.drawSite(mv, st, { w: 2.4, fill: 'rgba(46,134,222,.14)' });
    const mr = SA.minRect(E);
    const dims = s('g', { class: 'dims' }, st);
    SA.dimLine(mv, dims, mr.pts[0], mr.pts[1], '≈ ' + Math.round(mr.w) + ' m', -10);
    SA.dimLine(mv, dims, mr.pts[1], mr.pts[2], '≈ ' + Math.round(mr.h) + ' m', -10);
    mv.label([SA.SITE_C[0], SA.SITE_C[1] + 4], 'SITE', 'lbl', { size: 12, layer: 'site' });
    mv.label([SA.SITE_C[0], SA.SITE_C[1] - 6], '≈ 8,900 m²', 'lbl', { size: 9, layer: 'site' });
    /* ANALYSIS: opportunities / constraints annotations */
    const an = mv.layer('analysis', { label: 'Analysis', fa: 'تحلیل', sw: 'background:linear-gradient(90deg,#3E7A4E 50%,#A8443C 50%)', on: false });
    const J = G.streets.Jalalieh;
    SA.annot(mv, an, [J[0][0] - 8, J[0][1] - 6], 'O1', 'PUBLIC ENTRY · NE CORNER', { dir: [1, 1], color: '#3E7A4E' });
    SA.annot(mv, an, [60, 60], 'O2', 'PEDESTRIAN SPINE · JALALIEH', { dir: [1, -1], color: '#3E7A4E' });
    SA.annot(mv, an, [20, -12], 'O3', 'UNIVERSITY EDGE', { dir: [1, -1], len: 40, color: '#3E7A4E' });
    SA.annot(mv, an, [-40, 45], 'C1', 'SENSITIVE RESIDENTIAL EDGE', { dir: [-1, 1], color: '#A8443C' });
    SA.annot(mv, an, [-60, 99], 'C2', 'NOISE · KESHAVARZ', { dir: [-1, 1], color: '#A8443C' });
    SA.annot(mv, an, [J[J.length - 1][0] - 4, J[J.length - 1][1] + 25], 'C3', 'SERVICE ↔ PEDESTRIAN CONFLICT', { dir: [1, -1], len: 44, color: '#A8443C' });
    [[[-20, 330], 'LALEH PARK'], [[150, -250], 'UNIVERSITY OF TEHRAN'], [[-250, 140], 'KESHAVARZ BLVD']].forEach(([p, t]) => mv.label(p, t, 'lbl', { size: 9 }));
    SA.prepDraw(host);
    /* panel: layers with opacity + live legend */
    SA.LayerControl(panel, mv, ['base', 'roads', 'buildings', 'landuse', 'lu-res', 'lu-edu', 'lu-cult', 'lu-com', 'lu-pub', 'lu-park', 'green', 'pedestrian', 'publicprivate', 'site', 'analysis'], 'Layers');
    SA.$$('.layers label', panel).forEach((lab) => { if (/lu-/.test(lab.querySelector('input').dataset.n || '')) lab.classList.add('sub'); });
    const legend = el('div', { class: 'gis-legend' }, panel);
    const views = el('div', { class: 'seg gis-views' }, panel, '<button type="button" aria-pressed="true">Site</button><button type="button" aria-pressed="false">Context</button>');
    const vb = SA.$$('button', views);
    const setV = (v) => { mv.setView(v, 1300); vb[0].setAttribute('aria-pressed', v === CTX ? 'false' : 'true'); vb[1].setAttribute('aria-pressed', v === CTX ? 'true' : 'false'); };
    vb[0].onclick = () => setV(FRAME); vb[1].onclick = () => setV(CTX);
    const LEG = {
      base: [['rect', '#D8D0C0', 'Graded imagery (Google 0.65 m/px + aerial 0.19 m/px)']],
      landuse: LUL.map(([k, en]) => ['rect', k === 'park' ? '#C3C0B8' : SA.luFill(k), en]),
      green: [['rect', '#9EB48B', 'Laleh Park (OSM)'], ['dot', '#56773F', 'Canopy — extracted from imagery']],
      movement: [['line', 'var(--kesh)', 'Primary · Keshavarz'], ['line', 'var(--pour)', 'Secondary · one-way'], ['line', 'var(--jal)', 'Local'], ['dash', 'var(--site-deep)', 'Pedestrian: metro → Jalalieh → UT']],
      pp: [['line', '#1F6C9F', 'Public edge'], ['line', '#6FA8D6', 'Semi-public edge'], ['line', '#9F2F2D', 'Private / sensitive edge']],
      site: [['rect', 'var(--site)', 'Site envelope · ≈ 8,900 m² (±10 %)']],
      analysis: [['dot', '#3E7A4E', 'O · opportunity'], ['dot', '#A8443C', 'C · constraint']],
    };
    const showLeg = (keys, title) => { legend.innerHTML = '<div class="t-tech">' + title + '</div>'; SA.legend(legend, [].concat(...keys.map((k) => LEG[k])).map(([kind, color, en]) => ({ kind, color, en }))); };
    /* 7 steps on one map */
    const seq = [
      { v: FRAME, on: ['base', 'site'], leg: ['base', 'site'], t: '01 · Base map' },
      { v: CTX, on: ['base', 'landuse', 'site'], leg: ['landuse'], t: '02 · Land use' },
      { v: CTX, on: ['base', 'green', 'site'], leg: ['green'], t: '03 · Green structure' },
      { v: CTX, on: ['base', 'roads', 'pedestrian', 'site'], leg: ['movement'], t: '04 · Movement' },
      { v: FRAME, on: ['base', 'buildings', 'publicprivate', 'site'], leg: ['pp'], t: '05 · Public / private' },
      { v: SITEV, on: ['base', 'roads', 'site'], leg: ['site'], t: '06 · Site boundary' },
      { v: SITEV, on: ['base', 'roads', 'green', 'site', 'analysis'], leg: ['analysis'], t: '07 · Opportunities / constraints' },
    ];
    const toggleable = ['base', 'roads', 'buildings', 'landuse', 'green', 'pedestrian', 'publicprivate', 'site', 'analysis'];
    SA.scrolly(SA.$('#gis-scrolly'), (k) => {
      const q = seq[k];
      setV(q.v);
      toggleable.forEach((n) => { const want = q.on.indexOf(n) > -1; if (mv.layers[n].on !== want) mv.toggle(n, want); });
      showLeg(q.leg, q.t);
      if (k === 5) { sp.classList.add('pulse'); dims.classList.add('on'); setTimeout(() => sp.classList.remove('pulse'), 1600); }
      if (k === 6) SA.revealAnnots(host);
    });
    showLeg(seq[0].leg, seq[0].t);
  }

  SA.sections.push(cover, location, urban, gis);
})();
