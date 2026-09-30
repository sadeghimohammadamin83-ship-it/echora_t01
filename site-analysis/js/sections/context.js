/* Shared drawing helpers + sections 00 Cover · 01 Location · 02 Urban context · 03 GIS board */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el;
  const A = G.aerial;
  SA.px = (u, v) => [(u - A.tx) / A.s, -(v - A.ty) / A.s]; /* aerial px -> local m */
  const FRAME = [G.landuse.frame.x0, G.landuse.frame.y0, G.landuse.frame.x1, G.landuse.frame.y1];
  SA.FRAME = FRAME;
  SA.SITE_C = SA.centroid(G.site);
  const F = (id) => G.features.find((f) => f.id === id);
  SA.F = F;

  /* ---------------- shared drawing ---------------- */
  const HIER_W = { primary: 11, secondary: 7, local: 4.2, service: 3.2, minor: 2.4 };
  SA.drawStreets = function (mv, g, names, o) {
    o = o || {};
    const out = {};
    names.forEach((n) => {
      const pts = G.streets[n], info = D.streets[n] || {};
      if (!pts) return;
      const w = (o.w && o.w[n]) || (o.hier ? HIER_W[info.h] || 2 : info.w || 3) * (o.k || 1);
      const grp = s('g', { class: 'street', 'data-s': n }, g);
      const color = o.mono ? o.mono : info.c || 'var(--mute)';
      if (n === 'Zare' || n === 'ZareS' || o.casing) s('path', { d: SA.d(pts), stroke: 'var(--zare-case)', 'stroke-width': w + 1.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, grp);
      const p = s('path', { d: SA.d(pts), stroke: color, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: o.draw ? 'draw' : null }, grp);
      if (o.hover !== false && info.en) {
        const L = SA.len(pts);
        mv.hover(grp, () => ({ k: (info.h || 'street') + ' street', t: info.fa, e: info.en, rows: [['Direction', info.dir || '—'], ['Length (drawn)', '≈ ' + Math.round(L) + ' m'], ['OSM', info.osm || '—']], src: info.note || '' }), 'st-' + n);
      }
      out[n] = p;
    });
    return out;
  };
  SA.drawSite = function (mv, g, o) {
    o = o || {};
    const p = s('path', { d: SA.d(G.site, true), fill: o.fill || 'var(--site-soft)', stroke: 'var(--site)', 'stroke-width': o.w || 1.6, class: 'ns site-poly' + (o.draw ? ' draw' : ''), 'stroke-linejoin': 'round' }, g);
    if (o.hover !== false) mv.hover(p, { k: 'Project site · user BLUE', t: 'سایت پروژه — دانشکده تربیت بدنی', big: '≈ 8,900 m²', rows: [['Accuracy', '±10 %'], ['Bounding box', '≈ 105 × 110 m'], ['Built today', '≈ ' + G.landuse.siteBuilt + ' % (8 low buildings)'], ['Centroid', '35.7070 N · 51.3931 E']], src: 'User blue mask × (0.1935 m/px)² — not a survey' }, 'site');
    return p;
  };
  SA.luFill = (u) => (D.landuse[u] ? D.landuse[u].c : 'var(--lu-unk)');
  SA.drawFeatures = function (mv, g, o) {
    o = o || {};
    const list = G.features.filter(o.filter || (() => true));
    list.sort((a, b) => (a.kind === 'parcel' ? 0 : 1) - (b.kind === 'parcel' ? 0 : 1) || (a.id === 'ut_campus' ? -1 : 0));
    const nodes = [];
    list.forEach((f) => {
      const st = o.style ? o.style(f) : { fill: SA.luFill(f.use) };
      const p = s('path', Object.assign({ d: SA.d(f.pts, true), 'stroke-linejoin': 'round' }, st), g);
      if (f.unc && o.dashUnc !== false) { p.setAttribute('stroke', st.stroke || 'var(--ink)'); p.setAttribute('stroke-dasharray', '2.5 2'); p.setAttribute('stroke-width', st['stroke-width'] || 0.7); }
      if (o.hover !== false) {
        const lu = D.landuse[f.use] || {};
        mv.hover(p, () => ({ k: lu.en + (f.unc ? ' · uncertain' : ''), t: f.fa || lu.fa, e: f.name || (f.kind === 'bldg' ? 'Building footprint' : 'Parcel'), rows: [['Footprint', '≈ ' + SA.fmt(SA.area(f.pts)) + ' m²']], src: f.src }), o.group ? o.group(f) : null);
      }
      p._f = f; nodes.push(p);
    });
    return nodes;
  };
  SA.treeRows = [ /* observed tree rows (aerial + photos), px of the aerial */
    [[330, 300], [1250, 150]], [[560, 930], [1250, 760]], [[1080, 300], [1180, 800]],
  ].map((r) => r.map((q) => SA.px(q[0], q[1])));
  SA.drawTrees = function (g, o) {
    o = o || {};
    SA.treeRows.forEach((r) => {
      const L = SA.len(r), n = Math.floor(L / (o.step || 9));
      for (let i = 0; i <= n; i++) {
        const a = SA.along(r, i / n).p, q = SA.P(a);
        s('circle', { cx: q[0], cy: q[1], r: o.r || 3.6, fill: o.fill || 'var(--lu-green)', stroke: o.stroke || 'var(--card)', 'stroke-width': 0.6, opacity: o.op || 0.95 }, g);
      }
    });
  };
  SA.onewayArrows = function (g, pts, n, color, size) {
    for (let i = 1; i <= n; i++) {
      const a = SA.along(pts, i / (n + 1)), q = SA.P(a.p), deg = (-a.ang * 180) / Math.PI;
      s('path', { d: 'M-' + size + ' -' + size * 0.6 + ' L' + size + ' 0 L-' + size + ' ' + size * 0.6, fill: 'none', stroke: color, 'stroke-width': size * 0.35, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(' + q[0] + ' ' + q[1] + ') rotate(' + deg + ')' }, g);
    }
  };
  /* minimum-area bounding rectangle (brute force over angles) */
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

  /* ================= 00 COVER ================= */
  function cover() {
    const host = SA.$('#cover-map');
    const mv = new SA.MapViewer(host, { view: [-210, -130, 190, 190], fit: 'xMidYMid slice', north: false, scale: false, coords: false, grid: 10 });
    const g = mv.layer('base');
    SA.drawFeatures(mv, g, { hover: false, dashUnc: false, style: (f) => ({ fill: f.kind === 'parcel' ? (f.use === 'green' ? 'rgba(158,180,139,.10)' : 'rgba(255,255,255,.035)') : 'rgba(255,255,255,.07)', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 0.4 }) });
    SA.drawTrees(g, { fill: 'rgba(158,180,139,.35)', stroke: 'none', r: 3 });
    const sg = mv.layer('streets');
    SA.drawStreets(mv, sg, ['KeshS', 'KeshN', '16Azar', 'Qods', 'Poursina', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS', 'Oghab', 'Yekom', 'DavoodTaheri', 'Nosrat', 'BahmanOrouji', 'Kargar'], { hover: false, draw: true, k: 0.5, mono: 'rgba(233,231,226,.55)', w: { KeshS: 3, KeshN: 3 } });
    const site = SA.drawSite(mv, mv.layer('site'), { hover: false, draw: true, fill: 'rgba(46,134,222,.22)', w: 1.8 });
    SA.prepDraw(host);
    const go = () => { SA.$$('.draw', host).forEach((p, i) => setTimeout(() => p.classList.add('on'), 200 + i * 70)); };
    SA.observe(host, go);
    /* slow drift (parallax) */
    if (!SA.reduced) addEventListener('scroll', () => { const y = scrollY; if (y < innerHeight * 1.2) mv.world.setAttribute('transform', 'translate(0 ' + (y * 0.05).toFixed(1) + ')'); }, { passive: true });
    SA.$('#cover-legend').innerHTML = '<span class="t-tech">User colour code</span>' + ['kesh:Keshavarz', 'jal:Jalalieh', 'zare:Zare\'', 'hed:Hedayati', 'ena:Enayat', 'pour:Poursina', 'azar:16 Azar'].map((x) => { const [c, n] = x.split(':'); return '<i style="--c:var(--' + c + ')">' + n + '</i>'; }).join('') + '<i style="--c:var(--site)">Site</i>';
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
    s('path', { d: SA.d(G.site, true), fill: 'var(--site)', stroke: 'var(--ink)', 'stroke-width': 0.8, class: 'ns' }, g4);
    m4.label([-40, 470], 'LALEH PARK', 'lbl'); m4.label([160, -330], 'UNIVERSITY OF TEHRAN', 'lbl'); m4.label([-40, 505], 'بوستان لاله', 'lbl-fa'); m4.label([160, -295], 'دانشگاه تهران', 'lbl-fa');
    frames[3].mark = s('circle', { cx: SA.SITE_C[0], cy: -SA.SITE_C[1], r: 30, fill: 'none' }, g4);
    /* 5 Site */
    const m5 = mk([-95, -60, 105, 145], 'The site', { tl: '05 · Site', tr: 'aerial + user annotation' });
    m5.aerial({ filter: 'saturate(.35) contrast(.95) brightness(1.06)' });
    const g5 = m5.layer('d');
    SA.drawStreets(m5, g5, ['Keshavarz', 'Jalalieh', 'Zare', 'ZareS', 'Hedayati', 'Enayat', 'Poursina', '16Azar'], { k: 0.75 });
    SA.drawSite(m5, g5, { fill: 'rgba(46,134,222,.28)', w: 2 });
    const mr = SA.minRect(G.site);
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
    s('path', { d: SA.d(G.site, true), fill: 'var(--site)', stroke: 'var(--site)', 'stroke-width': 3, class: 'ns' }, sg);
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

  /* ================= 03 GIS BOARD ================= */
  function gis() {
    const host = SA.$('#gis-map'), panel = SA.$('#gis-panel');
    const CTX = [-430, -330, 430, 470];
    const mv = new SA.MapViewer(host, { view: FRAME, zoom: true, grid: 10, corners: { tl: 'GIS board · local grid 10 m', tr: 'EPSG-free local metres' } });
    SA.gisMV = mv;
    mv.aerial({ label: 'Aerial base', fa: 'تصویر هوایی', sw: 'background:linear-gradient(135deg,#6d6a5a,#b9b29c)' });
    /* aerial frame outline */
    const fr = mv.layer('frame');
    s('rect', { x: FRAME[0], y: -FRAME[3], width: FRAME[2] - FRAME[0], height: FRAME[3] - FRAME[1], fill: 'none', stroke: 'var(--ink)', 'stroke-width': 0.8, 'stroke-dasharray': '4 3', class: 'ns' }, fr);
    mv.label([FRAME[0] + 3, FRAME[3] + 5], 'AERIAL FRAME · 0.19 m/px', 'lbl', { anchor: 'start', size: 8, layer: 'frame' });
    const lu = mv.layer('landuse', { label: 'Land use', fa: 'کاربری', sw: 'background:linear-gradient(90deg,var(--lu-res) 33%,var(--lu-edu) 33% 66%,var(--lu-com) 66%)', on: false });
    SA.drawFeatures(mv, lu, { filter: (f) => f.use !== 'green', style: (f) => ({ fill: SA.luFill(f.use), 'fill-opacity': f.kind === 'parcel' ? 0.55 : 0.9, stroke: 'var(--card)', 'stroke-width': 0.4 }), group: (f) => 'lu-' + f.use });
    const gr = mv.layer('green', { label: 'Green areas', fa: 'فضای سبز', sw: 'background:var(--lu-green)', on: false });
    const pk = s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)', 'fill-opacity': 0.75 }, gr);
    mv.hover(pk, { k: 'Green space', t: 'بوستان لاله', big: '35 ha', e: 'Laleh Park, est. 1966', src: 'OSM [1] · Wikipedia [4]' });
    SA.drawTrees(gr, { r: 3.4 });
    const bl = mv.layer('buildings', { label: 'Buildings', fa: 'بناها', sw: 'background:var(--ink)', on: false });
    SA.drawFeatures(mv, bl, { filter: (f) => f.kind === 'bldg', hover: false, dashUnc: false, style: (f) => ({ fill: f.use === 'site' ? 'none' : 'var(--ink)', 'fill-opacity': 0.82, stroke: f.use === 'site' ? 'var(--ink)' : 'none', 'stroke-width': 0.7, 'stroke-dasharray': f.use === 'site' ? '2 1.5' : null }) });
    const rd = mv.layer('roads', { label: 'Roads', fa: 'معابر', sw: 'background:linear-gradient(90deg,var(--kesh) 25%,var(--pour) 25% 50%,var(--azar) 50% 75%,var(--jal) 75%)', on: false });
    /* context streets beyond the aerial frame (OSM centrelines, muted); the user's lines are drawn on top */
    for (const n of ['Enghelab St', 'Vesal Shirazi St', 'Keshavarz Blvd']) s('path', { d: SA.d(G.roads[n].p), fill: 'none', stroke: 'var(--ink)', 'stroke-opacity': 0.18, 'stroke-width': n === 'Keshavarz Blvd' ? 9 : 5, 'stroke-linecap': 'round' }, rd);
    SA.drawStreets(mv, rd, ['Qods', 'Nosrat', 'BahmanOrouji', 'Kargar', 'DavoodTaheri', 'Oghab', 'Yekom', '16Azar', 'Poursina', 'Enayat', 'Hedayati', 'Jalalieh', 'Zare', 'ZareS', 'Keshavarz'], { hier: true, draw: true });
    const ped = mv.layer('pedestrian', { label: 'Pedestrian', fa: 'مسیر پیاده', sw: 'background:repeating-linear-gradient(90deg,var(--ink) 0 3px,transparent 3px 6px)', on: false });
    const jn = G.streets.Jalalieh[0], link = [jn, [jn[0] - 4, jn[1] + 24]];
    s('path', { d: SA.d(link), stroke: 'var(--ink)', 'stroke-width': 1.8, fill: 'none', class: 'ns flow' }, ped);
    s('path', { d: SA.d(G.streets.Zare), stroke: 'var(--ink)', 'stroke-width': 1.4, fill: 'none', class: 'ns flow slow' }, ped);
    s('path', { d: SA.d(G.streets.Jalalieh), stroke: 'var(--ink)', 'stroke-width': 1.4, fill: 'none', class: 'ns flow slow' }, ped);
    mv.label([jn[0] + 6, jn[1] + 14], 'PED. LINK → KESHAVARZ', 'lbl', { anchor: 'start', size: 8, layer: 'pedestrian' });
    const tr = mv.layer('transit', { label: 'Public transport', fa: 'حمل‌ونقل عمومی', sw: 'background:#fff;outline:1.5px solid var(--ink);outline-offset:-3px', on: false });
    stationsInto(mv, tr, 7);
    mv.label([198, 262], 'M  BOOSTAN-E LALEH · L6', 'lbl', { anchor: 'start', size: 8.5, layer: 'transit' });
    const tp = mv.layer('topo', { label: 'Topography', fa: 'ارتفاع', sw: 'background:linear-gradient(180deg,#8a7b62,#d9cfbd)', on: false });
    [[[-5, 127.6], '+1230'], [[-5, -28], '+1226']].forEach(([p, t]) => {
      const q = SA.P(p); s('circle', { cx: q[0], cy: q[1], r: 1.6, fill: 'var(--ink)' }, tp);
      mv.label([p[0] + 3, p[1] + 1], t + ' m', 'lbl', { anchor: 'start', size: 9, layer: 'topo' });
    });
    s('path', { d: SA.d([[-18, 100], [-18, -10]]), stroke: 'var(--ink)', 'stroke-width': 1.2, fill: 'none', class: 'ns', 'marker-end': SA.marker(mv.svg, 'ah-ink', 'var(--ink)', 6) }, tp);
    mv.label([-22, 45], 'SLOPE ≈ 2.6 % ↓ S (SRTM)', 'lbl', { rot: -90, size: 8, layer: 'topo' });
    const st = mv.layer('site', { label: 'Site boundary', fa: 'محدوده‌ی سایت', sw: 'background:var(--site)' });
    const sp = SA.drawSite(mv, st, { w: 2.2, fill: 'rgba(46,134,222,.14)' });
    mv.label([SA.SITE_C[0], SA.SITE_C[1] + 4], 'SITE', 'lbl', { size: 12, layer: 'site' });
    mv.label([SA.SITE_C[0], SA.SITE_C[1] - 5], '≈ 8,900 m²', 'lbl', { size: 9, layer: 'site' });
    /* context labels */
    [[[-20, 330], 'LALEH PARK'], [[150, -250], 'UNIVERSITY OF TEHRAN'], [[-250, 140], 'KESHAVARZ BLVD'], [[160, 290], 'KESHAVARZ BLVD']].forEach(([p, t]) => mv.label(p, t, 'lbl', { size: 9 }));
    SA.prepDraw(host);
    /* panel */
    SA.LayerControl(panel, mv, ['aerial', 'site', 'buildings', 'roads', 'landuse', 'green', 'pedestrian', 'transit', 'topo'], 'Layers');
    const lg = el('div', { class: 'gis-lu' }, panel, '<div class="t-tech">Land use · hover</div>');
    SA.legend(lg, Object.keys(D.landuse).filter((k) => k !== 'pub').map((k) => ({ kind: 'rect', color: D.landuse[k].c, en: D.landuse[k].en, fa: D.landuse[k].fa, k })), (it, on) => {
      if (!mv.layers.landuse.on) mv.toggle('landuse', true);
      on ? mv.hot('lu-' + it.k) : mv.unhot();
    });
    const views = el('div', { class: 'seg gis-views' }, panel, '<button type="button" aria-pressed="true">Site</button><button type="button" aria-pressed="false">Context</button>');
    const vb = SA.$$('button', views);
    vb[0].onclick = () => { mv.setView(FRAME, 1100); vb[0].setAttribute('aria-pressed', 'true'); vb[1].setAttribute('aria-pressed', 'false'); };
    vb[1].onclick = () => { mv.setView(CTX, 1100); vb[1].setAttribute('aria-pressed', 'true'); vb[0].setAttribute('aria-pressed', 'false'); };
    /* cinematic sequence */
    const seq = [
      { v: FRAME, on: ['aerial', 'site'] },
      { v: CTX, on: ['aerial', 'site', 'frame'] },
      { v: CTX, on: ['aerial', 'site', 'roads'] },
      { v: CTX, on: ['aerial', 'site', 'roads', 'landuse'] },
      { v: CTX, on: ['aerial', 'site', 'roads', 'landuse', 'green'] },
      { v: [-75, -45, 95, 125], on: ['aerial', 'site', 'roads', 'buildings', 'pedestrian', 'topo', 'transit', 'green'] },
    ];
    SA.scrolly(SA.$('#gis-scrolly'), (k) => {
      const q = seq[k];
      mv.setView(q.v, 1500);
      Object.keys(mv.layers).forEach((n) => { if (n === 'grid' || n === 'labels' || n === 'frame') return; const want = q.on.indexOf(n) > -1; if (mv.layers[n].on !== want) mv.toggle(n, want); });
      if (k === 5) { sp.classList.add('pulse'); setTimeout(() => sp.classList.remove('pulse'), 1600); }
      vb[0].setAttribute('aria-pressed', q.v === CTX ? 'false' : 'true'); vb[1].setAttribute('aria-pressed', q.v === CTX ? 'true' : 'false');
    });
  }

  SA.sections = SA.sections || [];
  SA.sections.push(cover, location, urban, gis);
})();
