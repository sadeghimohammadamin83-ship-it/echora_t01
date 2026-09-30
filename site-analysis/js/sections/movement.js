/* 04 Accessibility · 05 Road network */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el;
  const ST = G.streets;
  const J0 = ST.Jalalieh[0], JS = ST.Jalalieh[ST.Jalalieh.length - 1]; /* north end, Poursina junction */

  /* ================= 04 ACCESSIBILITY ================= */
  function access() {
    const host = SA.$('#access-map');
    const mv = new SA.MapViewer(host, { view: [-260, -660, 520, 330], zoom: true, grid: 50, corners: { tl: 'Access routes · street network', tr: 'OSM oneway tags' } });
    const base = mv.layer('base');
    const park = SA.F('laleh_park'), camp = SA.F('ut_campus');
    s('path', { d: SA.d(park.pts, true), fill: 'var(--lu-green)', 'fill-opacity': 0.55 }, base);
    s('path', { d: SA.d(camp.pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.35 }, base);
    SA.drawFeatures(mv, base, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', hover: false, dashUnc: false, style: () => ({ fill: 'var(--paper-3)' }) });
    const rd = mv.layer('roads');
    for (const n of ['Enghelab St', 'Vesal Shirazi St', 'Qods St', '16 Azar St', 'Keshavarz Blvd', 'N. Kargar St', 'Jamalzadeh St']) {
      if (!G.roads[n]) continue;
      s('path', { d: SA.d(G.roads[n].p), fill: 'none', stroke: 'var(--paper-3)', 'stroke-width': n === 'Enghelab St' || n === 'Keshavarz Blvd' ? 14 : 8, 'stroke-linecap': 'round' }, rd);
    }
    SA.drawStreets(mv, rd, ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS'], { hier: true, k: 0.9 });
    SA.drawSite(mv, mv.layer('site'), { w: 2, fill: 'rgba(46,134,222,.2)' });
    SA.stationsInto(mv, mv.layer('st'), 7);
    [[[188, 272], 'M BOOSTAN-E LALEH'], [[-51, -615], 'M MEYDAN-E ENGHELAB']].forEach(([p, t]) => mv.label(p, t, 'lbl', { size: 8.5 }));
    [[[-120, -600], 'ENGHELAB ST'], [[395, -380], 'QODS ↑'], [[-160, 190], 'KESHAVARZ BLVD'], [[-20, -250], 'UNIVERSITY OF TEHRAN'], [[-40, 400], 'LALEH PARK']].forEach(([p, t]) => mv.label(p, t, 'lbl', { size: 8.5 }));
    /* routes (local metres) — built only from street geometry + oneway tags */
    const P = G.roads['Poursina St'].p, Q = G.roads['Qods St'].p;
    const enayatS = ST.Enayat[0], enayatN = ST.Enayat[ST.Enayat.length - 1];
    const R = [
      { id: 'ped-metro', en: 'Pedestrian · metro L6', col: 'var(--site)', dash: true, pts: [[188, 249], [150, 205], [100, 160], [J0[0] - 4, J0[1] + 24], J0, [J0[0] - 6, J0[1] - 12]],
        chain: [['Metro Boostan-e Laleh · L6', 'ایستگاه مترو بوستان لاله', '≈ 280 m from centroid'], ['Keshavarz Blvd — crossing', 'عبور از بلوار کشاورز', 'divided boulevard'], ['Jalalieh pedestrian link', 'اتصال پیاده‌ی جلالیه', '≈ 20 m, cars blocked'], ['NE corner — potential main entry', 'گوشه‌ی شمال‌شرقی — ورودی اصلی بالقوه', 'analysis, not design']] },
      { id: 'ped-ut', en: 'Pedestrian · University', col: 'var(--pos)', dash: true, pts: [[-51, -591], [110, -600], [-30, -190], [-85.5, -50], [-30, -32], P[1], JS, [JS[0] - 4, JS[1] + 20]],
        chain: [['Metro Meydan-e Enghelab · L4', 'مترو میدان انقلاب', '≈ 630 m'], ['Enghelab St → 16 Azar', 'انقلاب ← ۱۶ آذر', 'along the UT fence'], ['Poursina', 'پورسینا', 'plane-tree edge, faces UT'], ['Jalalieh / Enayat', 'جلالیه / عنایت', 'south entries']] },
      { id: 'car', en: 'Vehicle · service', col: 'var(--serv)', dash: false, pts: [[480, -610], Q[2], Q[1], [248, 65.6], P[1], JS, [JS[0] - 3, JS[1] + 30]],
        chain: [['Enghelab St', 'خیابان انقلاب', 'primary arterial'], ['Qods St · one-way ↑ N', 'قدس — یک‌طرفه به شمال', 'OSM way 174845593'], ['Poursina · one-way ← W', 'پورسینا — یک‌طرفه به غرب', 'OSM way 174845590'], ['Jalalieh · dead end', 'جلالیه — بن‌بست', 'service / emergency (V)']] },
      { id: 'car-w', en: 'Vehicle · west alleys', col: 'var(--hed)', dash: false, pts: [ST.Keshavarz[0], [-56, 99.6], ST.Hedayati[0], ST.Hedayati[1], ST.Hedayati[2], ST.ZareS[0], ST.ZareS[1]],
        chain: [['Keshavarz Blvd', 'بلوار کشاورز', 'south carriageway'], ['Hedayati', 'هدایتی', 'local alley ≈ 69 m'], ["Zare' (south leg)", 'زارع — شاخه‌ی جنوبی', 'secondary access (S)']] },
    ];
    const rg = mv.layer('routes');
    R.forEach((r) => {
      r.g = s('g', { class: 'route' }, rg);
      s('path', { d: SA.d(r.pts), fill: 'none', stroke: 'var(--card)', 'stroke-width': 7, class: 'ns', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.8 }, r.g);
      r.path = s('path', { d: SA.d(r.pts), fill: 'none', stroke: r.col, 'stroke-width': 3.2, class: 'ns draw', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'marker-end': SA.marker(mv.svg, 'ah-' + r.id, r.col, 3.4) }, r.g);
      r.flow = s('path', { d: SA.d(r.pts), fill: 'none', stroke: '#fff', 'stroke-width': 1.3, class: 'ns flow', opacity: 0 }, r.g);
      r.dot = s('circle', { r: 5, fill: r.col, stroke: '#fff', 'stroke-width': 1.5, class: 'ns', opacity: 0 }, r.g);
      r.nodes = s('g', null, r.g);
    });
    /* entry markers (analysis) */
    const eg = mv.layer('entries');
    const ent = (p, t, c, tipo) => {
      const q = SA.P(p), g = s('g', { transform: 'translate(' + q[0] + ' ' + q[1] + ')' }, eg);
      s('circle', { r: 6.5, fill: c, stroke: '#fff', 'stroke-width': 1.5 }, g); s('text', { class: 'ent-t', text: t, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, g);
      mv.hover(g, tipo);
    };
    ent([J0[0] - 14, J0[1] - 6], 'P', 'var(--ink)', { k: 'Potential main pedestrian entry', t: 'ورودی پیاده‌ی بالقوه‌ی اصلی', e: 'NE corner · Keshavarz × Jalalieh' });
    ent([-45, 88], 'P', 'var(--ink)', { k: 'Potential pedestrian entry', t: 'ورودی پیاده از لبه‌ی کشاورز', e: 'north edge' });
    ent([-36, 36], 'S', 'var(--ink)', { k: 'Secondary entry', t: 'ورودی ثانویه از کوچه', e: "Hedayati / Zare'" });
    ent([-32, -2], 'S', 'var(--ink)', { k: 'Secondary entry', t: 'ورودی ثانویه از عنایت', e: 'Enayat' });
    ent([JS[0] - 12, JS[1] + 26], 'V', 'var(--serv)', { k: 'Service / vehicle access', t: 'دسترسی سرویس و خودرو', e: 'Jalalieh, from the Poursina side' });
    /* dead-end bar */
    const de = SA.along(ST.Jalalieh, 0.1).p, q = SA.P(de);
    s('rect', { x: q[0] - 7, y: q[1] - 1.6, width: 14, height: 3.2, fill: 'var(--ink)', transform: 'rotate(-17 ' + q[0] + ' ' + q[1] + ')' }, eg);
    mv.label([de[0] + 10, de[1] + 3], 'DEAD END', 'lbl', { anchor: 'start', size: 8 });
    SA.prepDraw(host);
    /* UI */
    const seg = SA.$('#access-seg'), chain = SA.$('#access-chain');
    let raf = null, cur = -1;
    const play = (k) => {
      cur = k; cancelAnimationFrame(raf);
      SA.$$('button', seg).forEach((b, j) => b.setAttribute('aria-pressed', j === k ? 'true' : 'false'));
      R.forEach((r, j) => {
        r.g.style.opacity = j === k ? 1 : 0.14; r.path.classList.remove('on'); r.flow.setAttribute('opacity', 0); r.dot.setAttribute('opacity', 0);
      });
      const r = R[k]; void r.path.getBoundingClientRect(); r.path.classList.add('on');
      chain.innerHTML = r.chain.map((c, i) => '<li style="--c:' + r.col + '"><span class="n">' + (i + 1) + '</span><div><b>' + c[0] + '</b><span class="fa-inline">' + c[1] + '</span><em>' + c[2] + '</em></div></li>').join('');
      const lis = SA.$$('li', chain);
      /* moving dot + chain highlight in sync */
      const L = SA.len(r.pts), segs = r.pts.map((_, i) => SA.len(r.pts.slice(0, i + 1)) / L);
      const t0 = performance.now(), dur = SA.reduced ? 1 : 1900;
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, a = SA.along(r.pts, e), p = SA.P(a.p);
        r.dot.setAttribute('cx', p[0]); r.dot.setAttribute('cy', p[1]); r.dot.setAttribute('opacity', 1);
        const stage = Math.min(lis.length - 1, Math.floor(e * lis.length * 0.999));
        lis.forEach((li, i) => li.classList.toggle('on', i <= stage));
        if (t < 1) raf = requestAnimationFrame(tick); else { r.flow.setAttribute('opacity', 0.9); }
      };
      raf = requestAnimationFrame(tick);
      void segs;
    };
    R.forEach((r, k) => { const b = el('button', { type: 'button', 'aria-pressed': 'false' }, seg, r.en); b.onclick = () => play(k); });
    SA.observe(host, () => play(0));
    SA.legend(el('div', { class: 'access-legend' }, SA.$('#access-chain').parentNode), [
      { kind: 'dot', color: 'var(--ink)', en: 'P · potential pedestrian entry', fa: 'ورودی پیاده' },
      { kind: 'dot', color: 'var(--ink)', en: 'S · secondary entry', fa: 'ورودی ثانویه' },
      { kind: 'dot', color: 'var(--serv)', en: 'V · service / vehicle', fa: 'سرویس' },
    ]);

    /* ---- isochrone / catchment ---- */
    const ih = SA.$('#iso-map'), C = SA.SITE_C;
    const iv = new SA.MapViewer(ih, { view: [C[0] - 1400, C[1] - 1400, C[0] + 1400, C[1] + 1400], corners: { tl: 'Catchment · 400 / 800 / 1200 m', tr: 'straight line' } });
    const ib = iv.layer('b');
    s('path', { d: SA.d(park.pts, true), fill: 'var(--lu-green)', 'fill-opacity': 0.6 }, ib);
    s('path', { d: SA.d(camp.pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.5 }, ib);
    SA.roadsInto(iv, ib, 0.9);
    const rings = [[160, '2 min', 0.26], [400, '5 min', 0.18], [800, '10 min', 0.11], [1200, '15 min', 0.06]];
    const ig = iv.layer('iso');
    rings.slice().reverse().forEach(([m, t, o], j) => {
      const c = s('circle', { cx: C[0], cy: -C[1], r: m, fill: 'var(--site)', 'fill-opacity': o, stroke: 'var(--site)', 'stroke-width': 1, class: 'ns iso-ring', style: 'transform-origin:' + C[0] + 'px ' + -C[1] + 'px' }, ig);
      iv.label([C[0], C[1] + m - 30], t.toUpperCase() + ' · ' + m + ' m', 'lbl', { size: 8.5, layer: 'iso' });
      void j; void c;
    });
    SA.stationsInto(iv, iv.layer('st'), 5.5);
    s('path', { d: SA.d(G.envelope, true), fill: 'var(--site)' }, iv.layer('site'));
    const cnt = (m) => G.stations.filter((st) => Math.hypot(st.p[0] - C[0], st.p[1] - C[1]) <= m);
    SA.$('#iso-facts').innerHTML = rings.map(([m, t]) => '<div class="fact"><span class="t-tech">' + t + ' · ' + m + ' m</span><div class="v"><span data-count="' + cnt(m).length + '">0</span><small>stations</small></div><div class="d">' + (cnt(m).map((x) => x.fa).join('، ') || '—') + '</div></div>').join('');
    SA.observe(ih, () => SA.$$('.iso-ring', ih).forEach((c, i, all) => setTimeout(() => c.classList.add('in'), 300 * (all.length - 1 - i))));
  }

  /* ================= 05 ROAD NETWORK ================= */
  function roads() {
    const host = SA.$('#road-map');
    const mv = new SA.MapViewer(host, { view: [-150, -100, 130, 170], zoom: true, grid: 10, corners: { tl: 'Street hierarchy · site scale', tr: 'width = hierarchy · colour = user code' } });
    mv.aerial({ filter: 'grayscale(1) brightness(1.18) contrast(.7)', opacity: 0.5 });
    const b = mv.layer('b');
    SA.drawFeatures(mv, b, { filter: (f) => f.kind === 'bldg', hover: false, dashUnc: false, style: () => ({ fill: 'var(--paper-3)', 'fill-opacity': 0.8 }) });
    const rg = mv.layer('roads');
    const order = ['Oghab', 'Yekom', 'DavoodTaheri', 'Nosrat', 'BahmanOrouji', 'Qods', '16Azar', 'Poursina', 'Enayat', 'Hedayati', 'ZareS', 'Zare', 'Jalalieh', 'Keshavarz'];
    const paths = SA.drawStreets(mv, rg, order, { hier: true, draw: true, w: { Keshavarz: 14 } });
    /* flows: one-way arrows + direction animation */
    const fg = mv.layer('flow');
    const rev = (a) => a.slice().reverse();
    const flows = [
      [ST.Poursina, 'var(--pour)'], [ST['16Azar'], 'var(--azar)'], [ST.Qods, 'var(--mute)'],
    ];
    /* orient: Poursina W (x decreasing), 16 Azar S (y decreasing), Qods N (y increasing) */
    const orient = (pts, dx, dy) => { const a = pts[0], z = pts[pts.length - 1]; return (z[0] - a[0]) * dx + (z[1] - a[1]) * dy > 0 ? pts : rev(pts); };
    const oPts = [orient(ST.Poursina, -1, 0), orient(ST['16Azar'], 0, -1), orient(ST.Qods, 0, 1)];
    oPts.forEach((pts) => {
      s('path', { d: SA.d(pts), fill: 'none', stroke: '#fff', 'stroke-width': 1.4, class: 'ns flow', opacity: 0.95 }, fg);
      SA.onewayArrows(fg, pts, 4, '#fff', 2.2);
    });
    void flows;
    /* Keshavarz two carriageways: S eastbound, N westbound */
    const K = ST.Keshavarz;
    const kS = SA.offset(K, -3.2), kN = SA.offset(K, 3.2);
    s('path', { d: SA.d(orient(kS, 1, 0)), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1, class: 'ns flow', opacity: 0.8 }, fg);
    s('path', { d: SA.d(orient(kN, -1, 0)), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1, class: 'ns flow', opacity: 0.8 }, fg);
    s('path', { d: SA.d(K), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 0.5, 'stroke-dasharray': '1 1.5', opacity: 0.6 }, fg);
    /* dead end + pedestrian link */
    const de = SA.along(ST.Jalalieh, 0.1).p, q = SA.P(de);
    s('rect', { x: q[0] - 6, y: q[1] - 1.4, width: 12, height: 2.8, fill: 'var(--ink)', transform: 'rotate(-17 ' + q[0] + ' ' + q[1] + ')' }, fg);
    s('path', { d: SA.d([J0, [J0[0] - 4, J0[1] + 24]]), stroke: 'var(--ink)', 'stroke-width': 1.6, fill: 'none', class: 'ns flow', 'stroke-dasharray': '2 3' }, fg);
    SA.drawSite(mv, mv.layer('site'), { w: 1.6, fill: 'rgba(46,134,222,.1)' });
    /* labels along streets */
    const lab = (n, t, tt, off) => {
      const a = SA.along(ST[n], tt), deg0 = (-a.ang * 180) / Math.PI; let deg = deg0; if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
      const o = off || 0, p = [a.p[0] - Math.sin(a.ang) * o, a.p[1] + Math.cos(a.ang) * o];
      mv.label(p, t, 'lbl-fa', { rot: deg, size: 11 });
    };
    lab('Keshavarz', 'بلوار کشاورز', 0.28, 11); lab('Poursina', 'پورسینا ← یک‌طرفه', 0.35, -8); lab('16Azar', '۱۶ آذر ↓', 0.35, 7);
    lab('Jalalieh', 'جلالیه', 0.55, 7); lab('Hedayati', 'هدایتی', 0.4, -6); lab('Enayat', 'عنایت', 0.5, -6); lab('Zare', 'زارع', 0.45, 5);
    SA.prepDraw(host);
    SA.observe(host, () => Object.values(paths).forEach((p, i) => setTimeout(() => p.classList.add('on'), i * 110)));

    /* hierarchy diagram (topology, not geography) */
    const H = SA.$('#road-hier');
    const levels = [
      { k: 'primary', en: 'Primary · arterial', fa: 'شریانی', items: ['Keshavarz'], w: 11 },
      { k: 'secondary', en: 'Secondary · collector', fa: 'جمع‌کننده', items: ['Poursina', '16Azar', 'Qods'], w: 7 },
      { k: 'local', en: 'Local', fa: 'محلی', items: ['Jalalieh', 'Hedayati', 'Enayat'], w: 4.2 },
      { k: 'service', en: 'Service', fa: 'سرویس', items: ['Zare'], w: 3.2 },
      { k: 'ped', en: 'Pedestrian', fa: 'پیاده', items: ['ped'], w: 1.6 },
    ];
    const svg = s('svg', { viewBox: '0 0 520 300', class: 'hier-svg' }, H);
    const pos = {};
    levels.forEach((L, i) => {
      const y = 30 + i * 60;
      s('text', { x: 0, y: y + 4, class: 'h-l', text: L.en.toUpperCase() }, svg);
      s('text', { x: 0, y: y + 20, class: 'h-f', text: L.fa }, svg);
      s('line', { x1: 150, x2: 150 + 40, y1: y, y2: y, stroke: 'var(--ink)', 'stroke-width': L.w * 0.6, 'stroke-dasharray': L.k === 'ped' ? '3 3' : null }, svg);
      L.items.forEach((n, j) => {
        const x = 260 + j * 90, info = D.streets[n] || { fa: 'اتصال پیاده', en: 'Jalalieh → Keshavarz' };
        pos[n] = [x, y];
        const g = s('g', { class: 'h-node', transform: 'translate(' + x + ' ' + y + ')', tabindex: 0 }, svg);
        s('circle', { r: 14, fill: n === 'Zare' ? '#fff' : n === 'ped' ? 'var(--card)' : info.c, stroke: n === 'Zare' || n === 'ped' ? 'var(--zare-case)' : 'none', 'stroke-width': 1.5, 'stroke-dasharray': n === 'ped' ? '2 2' : null }, g);
        s('text', { y: 30, class: 'h-n', 'text-anchor': 'middle', text: info.fa }, g);
        g.addEventListener('pointerenter', () => mv.hot('st-' + n)); g.addEventListener('pointerleave', () => mv.unhot());
        g.addEventListener('focus', () => mv.hot('st-' + n)); g.addEventListener('blur', () => mv.unhot());
      });
    });
    const link = (a, b) => { const A = pos[a], B = pos[b]; s('path', { d: 'M' + A[0] + ' ' + (A[1] + 14) + ' C' + A[0] + ' ' + (A[1] + 40) + ' ' + B[0] + ' ' + (B[1] - 40) + ' ' + B[0] + ' ' + (B[1] - 14), fill: 'none', stroke: 'var(--ink)', 'stroke-opacity': 0.35, 'stroke-width': 1 }, svg.firstChild ? svg : svg); };
    [['Keshavarz', 'Hedayati'], ['Poursina', 'Jalalieh'], ['Poursina', 'Enayat'], ['Qods', 'Poursina'], ['16Azar', 'Poursina'], ['Jalalieh', 'Zare'], ['Hedayati', 'Zare'], ['Jalalieh', 'ped'], ['Keshavarz', 'ped']].forEach(([a, b]) => link(a, b));
    SA.$$('.h-node', svg).forEach((n) => svg.appendChild(n));
    /* table */
    const T = SA.$('#road-table');
    const rows = ['Keshavarz', 'Poursina', '16Azar', 'Qods', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare'];
    T.innerHTML = '<table class="tbl"><thead><tr><th></th><th>Street</th><th>Class</th><th>Direction</th><th>OSM</th></tr></thead><tbody>' + rows.map((n) => {
      const i = D.streets[n];
      return '<tr data-s="' + n + '" tabindex="0"><td><i class="swl" style="--c:' + i.c + (n === 'Zare' ? ';box-shadow:0 0 0 1px var(--zare-case)' : '') + '"></i></td><td><b>' + i.en + '</b><span class="fa-inline">' + i.fa + '</span></td><td>' + i.h + '</td><td class="fa-inline">' + i.dirFa + '</td><td>' + (i.osm || '—') + '</td></tr>';
    }).join('') + '</tbody></table><p class="t-cap">Keshavarz, Hedayati and Zare\' follow your drawn lines (OSM centrelines are offset by ≈ 10–20 m). Lengths in tooltips are measured on the drawn geometry.</p>';
    SA.$$('tr[data-s]', T).forEach((tr) => {
      const n = tr.dataset.s;
      tr.addEventListener('pointerenter', () => mv.hot('st-' + n)); tr.addEventListener('pointerleave', () => mv.unhot());
      tr.addEventListener('focus', () => mv.hot('st-' + n)); tr.addEventListener('blur', () => mv.unhot());
    });
  }

  SA.sections.push(access, roads);
})();
