/* 10 TERRAIN — DEM atlas built from SRTM 30 m (AWS Terrain Tiles): hypsometric tint × hillshade, 5 m / 1 m contours,
   slope and aspect maps, and the A–B section through the site. Surface noise (roofs, canopy) removed in tools/dem.py. */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, M = window.SA_DEM, s = SA.s, el = SA.el;
  const W = M.win, C = () => SA.SITE_C;
  const place = (g, href, op) => s('image', { href, x: -W - M.step / 2, y: -W - M.step / 2, width: 2 * W + M.step, height: 2 * W + M.step, preserveAspectRatio: 'none', opacity: op == null ? 1 : op }, g);
  const zCol = (z) => { const [lo, hi] = M.bands, t = Math.max(0, Math.min(1, (z - lo) / (hi - lo))) * (M.ramp.length - 1), i = Math.min(Math.floor(t), M.ramp.length - 2); return M.ramp[t - i > 0.5 ? i + 1 : i]; };

  function terrain() {
    /* ---------- main DEM sheet ---------- */
    const host = SA.$('#dem-map');
    const mv = new SA.MapViewer(host, { view: [-1500, -1500, 1500, 1500], zoom: true });
    SA.sheet(mv, { no: 'C-10', title: 'TERRAIN · HYPSOMETRY & CONTOURS', src: M.src + ' · 50–100 m ground filter' });
    const hy = mv.layer('hypso'); place(hy, 'img/layers/dem_hypso.png'); hy.classList.add('fadein');
    const cg = mv.layer('contours');
    const byZ = M.c5.slice().sort((a, b) => a.z - b.z);
    byZ.forEach((c) => {
      const major = c.z % 25 === 0;
      const p = s('path', { d: SA.d(c.p), fill: 'none', stroke: major ? 'rgba(60,44,28,.75)' : 'rgba(60,44,28,.38)', 'stroke-width': major ? 1.1 : 0.6, class: 'ns draw' }, cg);
      p.style.transitionDelay = ((c.z - M.bands[0]) * 22).toFixed(0) + 'ms';
      if (major && c.p.length > 20) { const a = SA.along(c.p, 0.5); let deg = (-a.ang * 180) / Math.PI; if (deg > 90) deg -= 180; if (deg < -90) deg += 180; mv.label(a.p, String(c.z), 'lbl zlab', { rot: deg, size: 8.5, layer: 'contours' }); }
    });
    /* context: park, campus, key roads, site */
    const ctx = mv.layer('ctx');
    s('path', { d: SA.d(SA.F('laleh_park').pts, true), fill: 'none', stroke: '#56773F', 'stroke-width': 1, 'stroke-dasharray': '4 3', class: 'ns' }, ctx);
    s('path', { d: SA.d(SA.F('ut_campus').pts, true), fill: 'none', stroke: '#5C7F9A', 'stroke-width': 1, 'stroke-dasharray': '4 3', class: 'ns' }, ctx);
    ['Keshavarz Blvd', 'Enghelab St', 'N. Kargar St', 'Valiasr St', 'Fatemi St', 'Chamran Expy'].forEach((n) => s('path', { d: SA.d(G.roads[n].p), fill: 'none', stroke: 'rgba(28,31,34,.55)', 'stroke-width': 1.1, class: 'ns' }, ctx));
    s('path', { d: SA.d(G.envelope, true), fill: 'var(--site)', stroke: 'var(--site)', 'stroke-width': 2, class: 'ns' }, ctx);
    mv.label([C()[0] + 60, C()[1] + 40], 'SITE ' + M.stats.site_c.toFixed(0) + ' m', 'lbl', { anchor: 'start', size: 9.5 });
    /* A–B section line */
    const ab = mv.layer('ab');
    const y0 = M.profile.y[0], y1 = M.profile.y[M.profile.y.length - 1], x = M.profile.x;
    const abl = s('path', { d: SA.d([[x, y0], [x, y1]]), stroke: '#B8392E', 'stroke-width': 1.3, 'stroke-dasharray': '10 4 2 4', class: 'ns draw', fill: 'none' }, ab);
    [[x, y0, 'A'], [x, y1, 'B']].forEach(([px, py, t]) => { const m = SA.pin(mv, ab, [px, py], t, { fill: '#B8392E' }); m.classList.add('abm'); });
    SA.annot(mv, ab, [-600, 700], 'T1', 'NORTH · FOOTHILL FAN', { dir: [-1, 1], len: 30 });
    SA.annot(mv, ab, [600, -900], 'T2', 'SOUTH · TOWARDS THE PLAIN', { dir: [1, -1], len: 30 });
    SA.prepDraw(host);
    /* legend: elevation bands, as in a GIS sheet */
    const leg = SA.$('#dem-legend');
    const [lo, hi] = M.bands, step = Math.ceil((hi - lo) / 10 / 5) * 5;
    let h = '<div class="t-tech">Elevation bands (m)</div><div class="bands">';
    for (let z = hi - step; z >= lo - step + 1; z -= step) h += '<div><i style="background:' + zCol(z + step / 2) + '"></i><span>' + Math.max(lo, z) + '–' + Math.min(hi, z + step) + '</span></div>';
    h += '</div><div class="t-tech" style="margin-top:14px">Symbols</div>';
    leg.innerHTML = h;
    SA.legend(leg, [
      { kind: 'line', color: 'rgba(60,44,28,.75)', extra: 1.4, en: 'Contour 25 m (index)', fa: '' },
      { kind: 'line', color: 'rgba(60,44,28,.4)', extra: 0.8, en: 'Contour 5 m', fa: '' },
      { kind: 'dash', color: '#B8392E', en: 'Section line A–B', fa: '' },
      { kind: 'rect', color: 'var(--site)', en: 'Site envelope', fa: '' },
    ]);
    SA.observe(host, () => {
      hy.classList.add('on');
      setTimeout(() => SA.$$('.draw', cg).forEach((p) => p.classList.add('on')), 500);
      setTimeout(() => { abl.classList.add('on'); SA.revealAnnots(host); }, 2200);
    });

    /* ---------- slope + aspect small multiples ---------- */
    const mini = (id, img, no, title, legendRows) => {
      const h2 = SA.$(id);
      const m = new SA.MapViewer(h2, { view: [-1500, -1500, 1500, 1500], scale: false, coords: false });
      SA.sheet(m, { no, title, src: 'derived from the ground surface' });
      place(m.layer('r'), img);
      s('path', { d: SA.d(G.envelope, true), fill: 'none', stroke: '#1C1F22', 'stroke-width': 1.6, class: 'ns' }, m.layer('s'));
      M.c5.filter((c) => c.z % 25 === 0).forEach((c) => s('path', { d: SA.d(c.p), fill: 'none', stroke: 'rgba(28,31,34,.35)', 'stroke-width': 0.6, class: 'ns' }, m.layer('c')));
      const lg = el('div', { class: 'mini-leg' }, h2.parentNode);
      lg.innerHTML = legendRows.map(([c, t]) => '<span><i style="background:' + c + '"></i>' + t + '</span>').join('');
      return m;
    };
    mini('#slope-map', 'img/layers/dem_slope.png', 'C-10.2', 'SLOPE (%)', M.slopeClasses.map(([a, b, c], i) => [c, (b > 100 ? '> ' + a : a + '–' + b) + ' % · ' + M.stats.slope_hist[i] + '%']));
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    mini('#aspect-map', 'img/layers/dem_aspect.png', 'C-10.3', 'ASPECT', M.aspectColors.map((c, i) => [c, dirs[i]]).concat([['#E9E6DF', 'flat']]));

    /* ---------- A–B profile (real DEM) ---------- */
    const P = SA.$('#topo-profile');
    const Wd = 1200, Ht = 300, x0 = 60, x1 = Wd - 30;
    const svg = s('svg', { viewBox: '0 0 ' + Wd + ' ' + Ht, class: 'prof-svg', role: 'img', 'aria-label': 'Section A–B through the site' }, P);
    const Y = M.profile.y, Z = M.profile.z, R = M.profile.raw;
    const zmin = Math.floor(Math.min(...Z, ...R) / 10) * 10 - 5, zmax = Math.ceil(Math.max(...Z, ...R) / 10) * 10 + 5;
    const X = (y) => x0 + ((Y[0] - y) / (Y[0] - Y[Y.length - 1])) * (x1 - x0), YY = (z) => Ht - 40 - ((z - zmin) / (zmax - zmin)) * (Ht - 90);
    for (let z = Math.ceil(zmin / 10) * 10; z <= zmax; z += 10) { s('line', { x1: x0, x2: x1, y1: YY(z), y2: YY(z), stroke: 'var(--ink)', 'stroke-opacity': z % 50 ? 0.06 : 0.14 }, svg); s('text', { x: x0 - 6, y: YY(z) + 3, class: 'ax', 'text-anchor': 'end', text: z }, svg); }
    const path = (arr) => arr.map((z, i) => (i ? 'L' : 'M') + X(Y[i]).toFixed(1) + ' ' + YY(z).toFixed(1)).join('');
    s('path', { d: path(Z) + ' L' + x1 + ' ' + (Ht - 38) + ' L' + x0 + ' ' + (Ht - 38) + 'Z', fill: 'url(#pg)' }, svg);
    const defs = s('defs', null, svg), lg = s('linearGradient', { id: 'pg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    s('stop', { offset: 0, 'stop-color': M.ramp[3], 'stop-opacity': 0.55 }, lg); s('stop', { offset: 1, 'stop-color': M.ramp[0], 'stop-opacity': 0.2 }, lg);
    s('path', { d: path(R), fill: 'none', stroke: 'var(--mute)', 'stroke-width': 0.7, 'stroke-opacity': 0.6 }, svg);
    const gl = s('path', { d: path(Z), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.6, class: 'draw' }, svg);
    /* site band + labels */
    const e = G.envelope, ys = e.map((p) => p[1]);
    s('rect', { x: X(Math.max(...ys)), y: 20, width: X(Math.min(...ys)) - X(Math.max(...ys)), height: Ht - 58, fill: 'var(--site)', 'fill-opacity': 0.12 }, svg);
    s('text', { x: (X(Math.max(...ys)) + X(Math.min(...ys))) / 2, y: 32, class: 'ax b', 'text-anchor': 'middle', text: 'SITE ' + M.stats.site_c.toFixed(0) + ' m' }, svg);
    [[x0, 'A · N'], [x1, 'B · S']].forEach(([px, t], i) => s('text', { x: px, y: Ht - 16, class: 'ax b', 'text-anchor': i ? 'end' : 'start', text: t }, svg));
    const zones = [[930, 170, 'LALEH PARK'], [170, 105, 'KESHAVARZ'], [-40, -590, 'UNIVERSITY OF TEHRAN'], [-590, -650, 'ENGHELAB']];
    zones.forEach(([a, b, t]) => { if (a > Y[0] || b < Y[Y.length - 1]) return; s('text', { x: (X(a) + X(b)) / 2, y: Ht - 16, class: 'ax', 'text-anchor': 'middle', text: t }, svg); });
    const grade = ((Z[0] - Z[Z.length - 1]) / (Y[0] - Y[Y.length - 1])) * 100;
    s('text', { x: x1, y: 16, class: 'ax', 'text-anchor': 'end', text: 'SECTION A–B · x = ' + M.profile.x + ' m · grey = raw SRTM surface (roofs, canopy) · black = ground · mean grade ' + grade.toFixed(1) + ' % · vertical ×' + (((Ht - 90) / (zmax - zmin)) / ((x1 - x0) / (Y[0] - Y[Y.length - 1]))).toFixed(0) }, svg);
    /* sweeping cursor */
    const cur = s('line', { y1: 20, y2: Ht - 38, stroke: '#B8392E', 'stroke-width': 1, opacity: 0 }, svg);
    const curT = s('text', { class: 'ax b', text: '', fill: '#B8392E' }, svg);
    SA.prepDraw(P);
    SA.observe(P, () => {
      gl.classList.add('on');
      if (SA.reduced) return;
      const t0 = performance.now(), dur = 3200;
      const tick = (now) => { const k = Math.min(1, (now - t0) / dur), i = Math.round(k * (Y.length - 1)), xx = X(Y[i]); cur.setAttribute('x1', xx); cur.setAttribute('x2', xx); cur.setAttribute('opacity', 1 - k * 0.4); curT.setAttribute('x', xx + 4); curT.setAttribute('y', YY(Z[i]) - 8); curT.textContent = Z[i].toFixed(0) + ' m'; if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    P.addEventListener('pointermove', (ev) => { const r = svg.getBoundingClientRect(), xx = ((ev.clientX - r.left) / r.width) * Wd; if (xx < x0 || xx > x1) return; const yv = Y[0] - ((xx - x0) / (x1 - x0)) * (Y[0] - Y[Y.length - 1]); let i = 0; while (i < Y.length - 1 && Y[i] > yv) i++; cur.setAttribute('x1', xx); cur.setAttribute('x2', xx); cur.setAttribute('opacity', 1); curT.setAttribute('x', xx + 4); curT.setAttribute('y', YY(Z[i]) - 8); curT.textContent = Z[i].toFixed(1) + ' m · ' + (Y[i] > 0 ? Y[i] + ' m N' : -Y[i] + ' m S'); });

    /* ---------- site close-up with 1 m contours ---------- */
    const sm = new SA.MapViewer(SA.$('#topo-map'), { view: [-110, -80, 130, 170], grid: 10 });
    SA.sheet(sm, { no: 'C-10.4', title: 'SITE · 1 m CONTOURS', src: 'interpolated from the ground surface' });
    SA.atlas(sm, { veg: false, op: 0.55 });
    M.c1.forEach((c) => { const major = c.z % 5 === 0; s('path', { d: SA.d(c.p), fill: 'none', stroke: major ? '#5B4127' : 'rgba(91,65,39,.55)', 'stroke-width': major ? 1.2 : 0.6, class: 'ns' }, sm.layer('c1')); if (c.p.length > 8) { const a = SA.along(c.p, 0.3); if (Math.abs(a.p[0]) < 120 && Math.abs(a.p[1] - 45) < 120) sm.label(a.p, String(c.z), 'lbl zlab', { size: 8, layer: 'c1' }); } });
    SA.drawSite(sm, sm.layer('s'), { w: 2.4, fill: 'rgba(46,134,222,.08)' });
    G.envelope.forEach((p, i) => { SA.pin(sm, sm.layer('m'), p, '', { fill: 'var(--site)' }); sm.label([p[0] + (i < 2 ? 0 : 0), p[1] + (i < 2 ? 9 : -9)], '+' + M.stats.site[i].toFixed(1), 'lbl', { size: 9.5, layer: 'm' }); });
    SA.arrow(sm, sm.layer('a'), [[95, 95], [95, 0]], 'var(--ink)', { w: 1.4 });
    sm.label([100, 50], 'FALL ≈ ' + M.stats.slope_site.toFixed(1) + ' % → ' + Math.round(M.stats.aspect_site) + '°', 'lbl', { anchor: 'start', size: 9, rot: -90 });
    SA.$('#topo-facts').innerHTML = [
      ['Site elevation', M.stats.site_c.toFixed(0), 'm', 'سطح زمین (SRTM پالایش‌شده) در مرکز سایت'],
      ['Corners NW · NE · SE · SW', M.stats.site.map((v) => v.toFixed(0)).join(' · '), 'm', 'تفاوت ≈ ' + SA.fa((Math.max(...M.stats.site) - Math.min(...M.stats.site)).toFixed(1)) + ' متر'],
      ['Mean slope on site', M.stats.slope_site.toFixed(1), '%', 'رو به ' + Math.round(M.stats.aspect_site) + '° (جنوب/جنوب‌شرق)'],
      ['Window relief', (M.stats.max - M.stats.min).toFixed(0), 'm', SA.fa(M.stats.min.toFixed(0)) + ' تا ' + SA.fa(M.stats.max.toFixed(0)) + ' متر در ۳٫۲ کیلومتر'],
    ].map(([k, v, u, d]) => '<div class="fact"><span class="t-tech">' + k + '</span><div class="v">' + v + '<small>' + u + '</small></div><div class="d">' + d + '</div></div>').join('');
  }
  SA.sections.push(terrain);
})();
