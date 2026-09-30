/* 09 Green · 10 Topography · 11 Climate · 12 Sun path · 13 Wind · 14 Noise & air · 15 Views */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, s = SA.s, el = SA.el;
  const LAT = 35.707, LON = 51.393, TZ = 3.5;

  /* NOAA-style solar position (same algorithm as v1 s9.py) */
  SA.sunpos = function (doy, h) {
    const g = ((2 * Math.PI) / 365) * (doy - 1 + (h - 12) / 24);
    const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    const tst = h * 60 + eqt + 4 * LON - 60 * TZ, ha = ((tst / 4 - 180) * Math.PI) / 180, lat = (LAT * Math.PI) / 180;
    const cz = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
    const z = Math.acos(Math.max(-1, Math.min(1, cz))), alt = 90 - (z * 180) / Math.PI;
    const az = (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) * 180) / Math.PI + 180;
    return { alt, az };
  };
  SA.daylight = function (doy) {
    let r = null, st = null;
    for (let m = 0; m < 1440; m += 2) { const a = SA.sunpos(doy, m / 60).alt; if (a > 0 && r == null) r = m / 60; if (a > 0) st = m / 60; }
    return { rise: r, set: st, len: st - r };
  };
  const hm = (h) => { const H = Math.floor(h), M = Math.round((h - H) * 60); return H + ':' + String(M === 60 ? 0 : M).padStart(2, '0'); };

  /* ================= 09 GREEN & OPEN SPACE ================= */
  function green() {
    const host = SA.$('#green-map');
    const mv = new SA.MapViewer(host, { view: [-300, -330, 360, 360], zoom: true, grid: 50, corners: { tl: 'Green & open space', tr: 'OSM + observed tree rows' } });
    const b = mv.layer('b');
    const park = SA.F('laleh_park'), camp = SA.F('ut_campus');
    const pk = s('path', { d: SA.d(park.pts, true), fill: 'var(--lu-green)', class: 'grow' }, b);
    mv.hover(pk, { k: 'Public green', t: 'بوستان لاله', big: '35 ha', e: 'est. 1966 · tree mass north of Keshavarz', src: '[4] · OSM [1]' });
    const cp = s('path', { d: SA.d(camp.pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.35, stroke: 'var(--lu-edu)', 'stroke-width': 1, class: 'ns' }, b);
    mv.hover(cp, { k: 'Enclosed campus open space', t: 'پردیس دانشگاه تهران (فضای باز محصور)', big: '≈ 20.8 ha', e: 'garden-campus on the Jalaliyeh garden' });
    SA.drawFeatures(mv, b, { filter: (f) => f.kind === 'bldg', hover: false, dashUnc: false, style: () => ({ fill: 'var(--card)', stroke: 'var(--line)', 'stroke-width': 0.4 }) });
    const tp = SA.F('tums_parking'), sp = SA.F('site_parking');
    const hatch = SA.hatch(mv.svg, 'h-asph', 'rgba(28,31,34,.4)', 3, 0.5);
    [tp, sp].forEach((f) => { const p = s('path', { d: SA.d(f.pts, true), fill: hatch, stroke: 'var(--mute)', 'stroke-width': 0.5 }, b); mv.hover(p, { k: 'Sealed surface · parking', t: f.fa, big: '≈ ' + SA.fmt(SA.area(f.pts)) + ' m²', e: 'asphalt' }); });
    SA.drawStreets(mv, mv.layer('st'), ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh'], { hier: true, k: 0.7, hover: false, mono: 'var(--card)' });
    const tg = mv.layer('trees');
    SA.drawTrees(tg, { r: 4, fill: '#6F9A57', op: 0.9, step: 8 });
    SA.drawSite(mv, mv.layer('site'), { w: 2 });
    /* potential green link (analysis) */
    const J = G.streets.Jalalieh;
    s('path', { d: SA.d([[60, 300], [J[0][0] - 4, J[0][1] + 24], J[0], J[J.length - 1], [60, -150]]), fill: 'none', stroke: 'var(--pos)', 'stroke-width': 3, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round', class: 'ns flow slow' }, mv.layer('link'));
    mv.label([95, 260], 'POTENTIAL GREEN LINK', 'lbl', { anchor: 'start', size: 8.5 });
    mv.label([-100, 330], 'LALEH PARK', 'lbl'); mv.label([160, -250], 'UNIVERSITY OF TEHRAN', 'lbl');
    /* area squares, to scale */
    const A = SA.$('#green-areas');
    const items = [[350000, 'Laleh Park', 'بوستان لاله', 'var(--lu-green)', '35 ha'], [208000, 'UT central campus', 'پردیس دانشگاه', 'var(--lu-edu)', '≈ 20.8 ha'], [G.siteArea, 'The site', 'سایت', 'var(--site)', '≈ 8,900 m²'], [SA.area(tp.pts), 'TUMS parking (OSM)', 'پارکینگ علوم پزشکی', 'var(--lu-park)', '≈ 4,900 m²']];
    const max = Math.sqrt(items[0][0]);
    items.forEach(([a, en, fa, c, lab], i) => {
      const w = (Math.sqrt(a) / max) * 100;
      el('div', { class: 'ar rv d' + (i + 1) }, A, '<div class="sq-w"><i style="width:' + w.toFixed(2) + '%;background:' + c + '"></i></div><div><b>' + lab + '</b><span>' + en + '</span><span class="fa-inline">' + fa + '</span></div>');
    });
  }

  /* ================= 10 TOPOGRAPHY ================= */
  function topo() {
    const H = SA.$('#topo-profile');
    const W = 1200, Ht = 320, x0 = 60, x1 = W - 40;
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + Ht, class: 'prof-svg', role: 'img', 'aria-label': 'North–south terrain profile' }, H);
    /* y (local north metres) → x on the profile: north on the left */
    const yN = 950, yS = -650, X = (y) => x0 + ((yN - y) / (yN - yS)) * (x1 - x0);
    const zMin = 1200, zMax = 1245, Y = (z) => Ht - 50 - ((z - zMin) / (zMax - zMin)) * (Ht - 110);
    /* reference grid */
    for (let z = 1205; z <= 1245; z += 5) {
      s('line', { x1: x0, x2: x1, y1: Y(z), y2: Y(z), stroke: 'var(--ink)', 'stroke-opacity': z % 10 ? 0.05 : 0.12 }, svg);
      if (z % 10 === 0) s('text', { x: x0 - 8, y: Y(z) + 3, class: 'ax', 'text-anchor': 'end', text: z }, svg);
    }
    /* zones along the section */
    const zones = [[950, 170, 'LALEH PARK', 'var(--lu-green)'], [170, 105, 'KESHAVARZ', 'var(--kesh)'], [100, -20, 'SITE', 'var(--site)'], [-20, -35, '', 'var(--pour)'], [-35, -590, 'UNIVERSITY OF TEHRAN', 'var(--lu-edu)'], [-590, -650, 'ENGHELAB', 'var(--mute)']];
    zones.forEach(([a, b, t, c]) => {
      s('rect', { x: X(a), y: Ht - 34, width: X(b) - X(a), height: 6, fill: c }, svg);
      s('text', { x: (X(a) + X(b)) / 2, y: Ht - 12, class: 'ax', 'text-anchor': 'middle', text: t }, svg);
    });
    /* known samples (SRTM30): site N/S precise; park & UT as ranges at unknown exact position; Enghelab */
    const pts = [[127.6, 1230], [-28, 1226], [-600, 1209]];
    const band = (a, b, z0, z1, lab) => {
      s('rect', { x: X(a), y: Y(z1), width: X(b) - X(a), height: Math.max(2, Y(z0) - Y(z1)), fill: 'var(--ink)', 'fill-opacity': 0.08, stroke: 'var(--ink)', 'stroke-opacity': 0.4, 'stroke-dasharray': '3 3' }, svg);
      s('text', { x: (X(a) + X(b)) / 2, y: Y(z1) - 8, class: 'ax b', 'text-anchor': 'middle', text: lab }, svg);
    };
    band(900, 200, 1237, 1239, 'PARK 1237–1239 m (range, position within park n/a)');
    band(-60, -560, 1216, 1218, 'UT ≈ 1217 m');
    const line = s('path', { d: 'M' + X(900) + ' ' + Y(1238) + ' L' + X(127.6) + ' ' + Y(1230) + ' L' + X(-28) + ' ' + Y(1226) + ' L' + X(-600) + ' ' + Y(1209), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.4, 'stroke-dasharray': '5 4', class: 'draw' }, svg);
    s('path', { d: 'M' + X(900) + ' ' + Y(1238) + ' L' + X(127.6) + ' ' + Y(1230) + ' L' + X(-28) + ' ' + Y(1226) + ' L' + X(-600) + ' ' + Y(1209) + ' L' + X(-600) + ' ' + (Ht - 40) + ' L' + X(900) + ' ' + (Ht - 40) + 'Z', fill: 'var(--ink)', 'fill-opacity': 0.05 }, svg);
    pts.forEach(([y, z]) => {
      s('circle', { cx: X(y), cy: Y(z), r: 4.5, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 1.6 }, svg);
      s('text', { x: X(y), y: Y(z) - 12, class: 'ax b', 'text-anchor': 'middle', text: '+' + z }, svg);
    });
    s('rect', { x: X(100), y: Y(1231.5), width: X(-20) - X(100), height: Y(1224.5) - Y(1231.5), fill: 'var(--site)', 'fill-opacity': 0.12, stroke: 'var(--site)' }, svg);
    s('text', { x: x0, y: 22, class: 'ax', text: 'N ←   TERRAIN PROFILE LALEH PARK → ENGHELAB ST · SRTM 30 m · VERTICAL ×' + (((Ht - 110) / (zMax - zMin)) / ((x1 - x0) / (yN - yS))).toFixed(1) }, svg);
    s('text', { x: x1, y: 22, class: 'ax', 'text-anchor': 'end', text: 'dashed = interpolated between samples → S' }, svg);
    SA.prepDraw(H); SA.observe(H, () => line.classList.add('on'));
    /* plan */
    const host = SA.$('#topo-map');
    const mv = new SA.MapViewer(host, { view: [-80, -50, 100, 150], grid: 10, corners: { tl: 'Spot heights · SRTM', tr: 'approx. ± several m' } });
    mv.aerial({ filter: 'grayscale(1) brightness(1.1) contrast(.8)', opacity: 0.55 });
    const g = mv.layer('g');
    /* shaded gradient across the site: interpolated between the two samples */
    const defs = SA.defs(mv.svg), lg = s('linearGradient', { id: 'slope', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    s('stop', { offset: 0, 'stop-color': '#8A7B62', 'stop-opacity': 0.55 }, lg); s('stop', { offset: 1, 'stop-color': '#EDE6D6', 'stop-opacity': 0.4 }, lg);
    s('path', { d: SA.d(G.site, true), fill: 'url(#slope)', stroke: 'var(--site)', 'stroke-width': 2, class: 'ns' }, g);
    /* interpolated 1 m isolines (linear between 1230 @ y=127.6 and 1226 @ y=-28) */
    [1229, 1228, 1227].forEach((z) => {
      const y = -28 + ((z - 1226) / 4) * (127.6 + 28);
      s('path', { d: SA.d([[-70, y], [95, y]]), stroke: 'var(--ink)', 'stroke-width': 0.8, 'stroke-dasharray': '4 3', class: 'ns', fill: 'none' }, g);
      mv.label([-62, y + 3], z + ' (interp.)', 'lbl', { anchor: 'start', size: 8 });
    });
    [[[-5, 127.6], '+1230'], [[-5, -28], '+1226']].forEach(([p, t]) => { const q = SA.P(p); s('circle', { cx: q[0], cy: q[1], r: 2, fill: 'var(--ink)' }, g); mv.label([p[0] + 4, p[1]], t, 'lbl', { anchor: 'start', size: 10 }); });
    s('path', { d: SA.d([[40, 90], [40, 0]]), stroke: 'var(--ink)', 'stroke-width': 1.6, class: 'ns', 'marker-end': SA.marker(mv.svg, 'ah-t', 'var(--ink)', 5) }, g);
    const slope = (4 / (127.6 + 28)) * 100;
    mv.label([46, 45], 'FALL ≈ ' + slope.toFixed(1) + ' %', 'lbl', { anchor: 'start', size: 9 });
    SA.$('#topo-facts').innerHTML = [['Site north', '1230', 'm', 'نمونه‌ی SRTM در 35.70765N'], ['Site south', '1226', 'm', 'نمونه‌ی SRTM در 35.70625N'], ['Fall across site', slope.toFixed(1), '%', '۴ متر در ≈ ۱۵۶ متر فاصله‌ی دو نمونه'], ['Regional slope', '≈ 3', '%', '۱۲۳۹ ← ۱۲۰۹ متر در ≈ ۱ کیلومتر']].map(([k, v, u, d]) => '<div class="fact rv"><span class="t-tech">' + k + '</span><div class="v">' + v + '<small>' + u + '</small></div><div class="d">' + d + '</div></div>').join('');
  }

  /* ================= 11 CLIMATE ================= */
  function climate() {
    const C = SA.$('#climate');
    let dayH = 0; for (let d = 1; d <= 365; d++) dayH += SA.daylight(d).len;
    const sunPct = (3010 / dayH) * 100;
    C.innerHTML =
      '<div class="cl-temp rv"><div class="t-tech">Temperature range · coldest / hottest monthly means</div>' +
      '<svg viewBox="0 0 600 150" class="cl-svg" id="cl-temp"></svg>' +
      '<p class="prose" lang="fa">میانگین حداقل دی ≈ ۱٫۳° و میانگین حداکثر تیر ≈ ۳۶٫۹° سانتی‌گراد. داده‌ی ماهانه‌ی کامل در منابع پروژه نیست؛ فقط این دو حد نمایش داده شده‌اند.</p></div>' +
      '<div class="cl-rain rv d1"><div class="t-tech">Precipitation</div><div class="v big"><span data-count="240">0</span><small>mm / yr</small></div><svg viewBox="0 0 120 160" class="drop"><path d="M60 8 C60 8 14 70 14 102 a46 46 0 0 0 92 0 C106 70 60 8 60 8Z" fill="none" stroke="currentColor" stroke-width="1.2"/><clipPath id="dropc"><path d="M60 8 C60 8 14 70 14 102 a46 46 0 0 0 92 0 C106 70 60 8 60 8Z"/></clipPath><g clip-path="url(#dropc)"><rect class="fill" x="0" y="160" width="120" height="160" fill="var(--wind)" opacity=".5"/></g></svg><p class="t-cap" lang="fa">نیمه‌خشک؛ بارش اندک و فصلی.</p></div>' +
      '<div class="cl-sun rv d2"><div class="t-tech">Sunshine</div><div class="v big"><span data-count="3010">0</span><small>h / yr</small></div><svg viewBox="0 0 160 160" class="ring"><circle cx="80" cy="80" r="64" fill="none" stroke="var(--line)" stroke-width="10"/><circle class="arc" cx="80" cy="80" r="64" fill="none" stroke="var(--sun)" stroke-width="10" stroke-dasharray="' + ((sunPct / 100) * 402).toFixed(1) + ' 402" transform="rotate(-90 80 80)"/><text x="80" y="78" text-anchor="middle" class="rt">' + sunPct.toFixed(0) + '%</text><text x="80" y="96" text-anchor="middle" class="rs">of daylight</text></svg><p class="t-cap">3,010 h ÷ ' + SA.fmt(dayH) + ' h of daylight computed for 35.707 N.</p></div>' +
      '<div class="cl-type rv d3"><div class="t-tech">Köppen</div><div class="v big">BSk</div><p class="prose" lang="fa">نیمه‌خشک سرد. پیامد: سایه و خنک‌سازی تابستان، آفتاب‌گیری زمستان، و محافظت در برابر خیرگی برای فعالیت‌های روباز.</p><p class="t-cap">Mehrabad 1991–2020 normals [9]</p></div>';
    const svg = SA.$('#cl-temp'), X = (t) => 40 + ((t + 5) / 45) * 520;
    for (let t = 0; t <= 40; t += 10) { s('line', { x1: X(t), x2: X(t), y1: 30, y2: 110, stroke: 'var(--ink)', 'stroke-opacity': 0.1 }, svg); s('text', { x: X(t), y: 130, class: 'ax', 'text-anchor': 'middle', text: t + '°' }, svg); }
    const defs = s('defs', null, svg), lg = s('linearGradient', { id: 'tg' }, defs);
    s('stop', { offset: 0, 'stop-color': '#6FA8D6' }, lg); s('stop', { offset: 1, 'stop-color': '#D9622B' }, lg);
    const bar = s('rect', { x: X(1.3), y: 62, width: X(36.9) - X(1.3), height: 16, fill: 'url(#tg)', class: 'tbar' }, svg);
    [[1.3, 'Jan mean min 1.3°'], [36.9, 'Jul mean max 36.9°']].forEach(([t, l], i) => { s('line', { x1: X(t), x2: X(t), y1: 50, y2: 90, stroke: 'var(--ink)' }, svg); s('text', { x: X(t), y: 42, class: 'ax b', 'text-anchor': i ? 'end' : 'start', text: l }, svg); });
    void bar;
  }

  /* ================= 12 SUN PATH ================= */
  function sun() {
    const root = SA.$('#sun');
    root.innerHTML = '<div class="sun-diag"><svg viewBox="-130 -130 260 260" id="sun-svg" role="img" aria-label="Sun path diagram"></svg></div>' +
      '<div class="sun-plan"><div class="map-sq" id="sun-map"></div></div>' +
      '<div class="sun-ctl"><div class="seg" id="sun-days"></div>' +
      '<label class="t-tech">Day of year <output id="sun-dlab"></output><input type="range" class="range" id="sun-day" min="1" max="365" value="172"></label>' +
      '<label class="t-tech">Local time <output id="sun-hlab"></output><input type="range" class="range" id="sun-hour" min="4" max="20" step="0.05" value="15"></label>' +
      '<button type="button" class="play" id="sun-play">▶ Play day</button><div class="facts" id="sun-facts"></div></div>';
    const svg = SA.$('#sun-svg'), R = 110;
    const xy = (alt, az) => { const r = (R * (90 - alt)) / 90, a = (az * Math.PI) / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };
    [0, 30, 60].forEach((a) => { s('circle', { r: (R * (90 - a)) / 90, fill: 'none', stroke: 'var(--night-line)', 'stroke-width': 0.6 }, svg); s('text', { x: 2, y: -(R * (90 - a)) / 90 - 2, class: 'ax d', text: a + '°' }, svg); });
    for (let az = 0; az < 360; az += 30) {
      const p = xy(0, az), q = xy(-10, az);
      s('line', { x1: 0, y1: 0, x2: p[0], y2: p[1], stroke: 'var(--night-line)', 'stroke-width': 0.4 }, svg);
      s('text', { x: q[0], y: q[1] + 3, class: 'ax d' + (az % 90 ? '' : ' b'), 'text-anchor': 'middle', text: { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[az] || az + '°' }, svg);
    }
    /* site footprint underlay (north-up) */
    const sc = 1 / 2.4, C = SA.SITE_C;
    s('path', { d: 'M' + G.site.map((p) => ((p[0] - C[0]) * sc).toFixed(1) + ' ' + (-(p[1] - C[1]) * sc).toFixed(1)).join('L') + 'Z', fill: 'rgba(46,134,222,.25)', stroke: 'var(--site)', 'stroke-width': 0.8 }, svg);
    const DAYS = [[172, 'Jun 21', '۳۱ خرداد', '#D9622B'], [80, 'Equinox', 'اعتدال', '#D9A91A'], [355, 'Dec 21', '۱ دی', '#6FA8D6']];
    DAYS.forEach(([d, , , c]) => {
      const P = []; for (let m = 0; m < 1440; m += 5) { const sp = SA.sunpos(d, m / 60); if (sp.alt > 0) P.push(xy(sp.alt, sp.az)); }
      const p = s('path', { d: 'M' + P.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L'), fill: 'none', stroke: c, 'stroke-width': 1.6, class: 'draw' }, svg);
      void p;
      for (let h = 6; h <= 18; h += 2) { const sp = SA.sunpos(d, h); if (sp.alt > 0) { const q = xy(sp.alt, sp.az); s('circle', { cx: q[0], cy: q[1], r: 1.6, fill: c }, svg); if (d === 172) s('text', { x: q[0] + 4, y: q[1] - 3, class: 'ax d', text: h + ':00' }, svg); } }
    });
    const cur = s('path', { fill: 'none', stroke: '#fff', 'stroke-width': 1, 'stroke-dasharray': '2 2' }, svg);
    const ray = s('line', { x1: 0, y1: 0, stroke: 'var(--sun)', 'stroke-width': 0.8 }, svg);
    const sunDot = s('circle', { r: 6, fill: 'var(--sun)', stroke: '#fff', 'stroke-width': 1.4 }, svg);
    s('circle', { r: 11, fill: 'none', stroke: 'var(--sun)', 'stroke-opacity': 0.4, class: 'halo' }, sunDot.parentNode);
    SA.prepDraw(svg); SA.observe(svg, () => SA.$$('.draw', svg).forEach((p, i) => setTimeout(() => p.classList.add('on'), i * 250)));
    /* plan with shadow of a 10 m vertical reference */
    const host = SA.$('#sun-map');
    const mv = new SA.MapViewer(host, { view: [-85, -50, 100, 145], corners: { tl: 'Shadow of a 10 m vertical', tr: 'site plan · north up' } });
    mv.aerial({ filter: 'grayscale(1) brightness(.55) contrast(1.1)', opacity: 0.9 });
    SA.drawSite(mv, mv.layer('s'), { w: 2, fill: 'rgba(46,134,222,.18)', hover: false });
    const sg = mv.layer('sh');
    const pole = s('circle', { cx: C[0], cy: -C[1], r: 1.6, fill: '#fff' }, sg);
    const shadowCase = s('line', { x1: C[0], y1: -C[1], stroke: '#fff', 'stroke-width': 5.2, 'stroke-linecap': 'round', opacity: 0.85 }, sg);
    const shadow = s('line', { x1: C[0], y1: -C[1], stroke: '#0A0C0E', 'stroke-width': 3.4, 'stroke-linecap': 'round', opacity: 0.95 }, sg);
    const sunRay = s('line', { x1: C[0], y1: -C[1], stroke: 'var(--sun)', 'stroke-width': 1, 'stroke-dasharray': '3 3', class: 'ns' }, sg);
    const shLab = mv.label(C, '', 'lbl light', { size: 9, anchor: 'start', layer: 'sh' });
    void pole;
    /* controls */
    const dayI = SA.$('#sun-day'), hI = SA.$('#sun-hour'), dLab = SA.$('#sun-dlab'), hLab = SA.$('#sun-hlab'), facts = SA.$('#sun-facts');
    const seg = SA.$('#sun-days');
    DAYS.forEach(([d, en, fa, c]) => { const b = el('button', { type: 'button', 'aria-pressed': 'false', style: '--c:' + c }, seg, en + ' <span class="fa-inline">' + fa + '</span>'); b.onclick = () => { dayI.value = d; upd(); }; });
    const dateOf = (d) => new Date(Date.UTC(2026, 0, d)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
    function upd() {
      const d = +dayI.value, h = +hI.value, sp = SA.sunpos(d, h), dl = SA.daylight(d);
      SA.$$('button', seg).forEach((b, i) => b.setAttribute('aria-pressed', DAYS[i][0] === d ? 'true' : 'false'));
      dLab.textContent = dateOf(d); hLab.textContent = hm(h);
      const P = []; for (let m = 0; m < 1440; m += 5) { const q = SA.sunpos(d, m / 60); if (q.alt > 0) P.push(xy(q.alt, q.az)); }
      cur.setAttribute('d', P.length ? 'M' + P.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') : '');
      const up = sp.alt > 0, q = xy(Math.max(sp.alt, -8), sp.az);
      sunDot.setAttribute('cx', q[0]); sunDot.setAttribute('cy', q[1]); sunDot.setAttribute('opacity', up ? 1 : 0.25);
      ray.setAttribute('x2', q[0]); ray.setAttribute('y2', q[1]); ray.setAttribute('opacity', up ? 1 : 0);
      let noon = 0; for (let m = 600; m < 840; m += 2) noon = Math.max(noon, SA.sunpos(d, m / 60).alt);
      if (up) {
        const L = Math.min(10 / Math.tan((sp.alt * Math.PI) / 180), 160), a = ((sp.az + 180) * Math.PI) / 180;
        const ex = C[0] + L * Math.sin(a), ey = C[1] + L * Math.cos(a);
        [shadow, shadowCase].forEach((l) => { l.setAttribute('x2', ex); l.setAttribute('y2', -ey); l.style.display = ''; });
        const b = (sp.az * Math.PI) / 180; sunRay.setAttribute('x2', C[0] + 60 * Math.sin(b)); sunRay.setAttribute('y2', -(C[1] + 60 * Math.cos(b))); sunRay.setAttribute('opacity', 1);
        shLab.setAttribute('x', ex + 2); shLab.setAttribute('y', -ey); shLab.textContent = L.toFixed(1) + ' m';
      } else { shadow.style.display = shadowCase.style.display = 'none'; sunRay.setAttribute('opacity', 0); shLab.textContent = ''; }
      facts.innerHTML = [['Altitude', up ? sp.alt.toFixed(1) + '°' : 'below horizon'], ['Azimuth', sp.az.toFixed(0) + '°'], ['Sunrise', hm(dl.rise)], ['Sunset', hm(dl.set)], ['Noon altitude', noon.toFixed(1) + '°'], ['Day length', hm(dl.len)]]
        .map(([k, v]) => '<div class="fact"><span class="t-tech">' + k + '</span><div class="v sm">' + v + '</div></div>').join('');
    }
    dayI.oninput = upd; hI.oninput = upd;
    let playing = null;
    SA.$('#sun-play').onclick = function () {
      if (playing) { cancelAnimationFrame(playing); playing = null; this.textContent = '▶ Play day'; return; }
      this.textContent = '❚❚ Pause'; let h = 4.5, last = performance.now();
      const step = (now) => { h += ((now - last) / 1000) * 1.6; last = now; if (h > 19.8) h = 4.5; hI.value = h; upd(); playing = requestAnimationFrame(step); };
      playing = requestAnimationFrame(step);
    };
    upd();
  }

  /* ================= 13 WIND ================= */
  function wind() {
    const host = SA.$('#wind-map');
    const V = [-180, -140, 200, 210];
    const mv = new SA.MapViewer(host, { view: V, grid: 10, corners: { tl: 'Prevailing flow · schematic', tr: 'Mehrabad station ≈ 10 km W' } });
    mv.aerial({ filter: 'grayscale(1) brightness(.5) contrast(1.1)', opacity: 0.85 });
    const b = mv.layer('b');
    SA.drawFeatures(mv, b, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', hover: false, dashUnc: false, style: () => ({ fill: 'rgba(255,255,255,.14)', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 0.4 }) });
    SA.drawSite(mv, mv.layer('s'), { w: 2, fill: 'rgba(46,134,222,.22)', hover: false });
    /* particle streamlines */
    const cv = el('canvas', { class: 'wind-cv' }, host);
    const ctx = cv.getContext('2d');
    let mode = 'day', parts = [], raf = null, visible = false;
    const dirTo = () => (mode === 'day' ? 45 : 225); /* flow goes TO NE by day (from SW), TO SW by night (from NE) */
    const speed = () => (mode === 'day' ? 1 : 0.6);
    const seed = () => { parts = []; for (let i = 0; i < 520; i++) parts.push({ x: Math.random(), y: Math.random(), a: Math.random() * 60 }); };
    seed();
    const size = () => { const r = host.getBoundingClientRect(); cv.width = r.width * devicePixelRatio; cv.height = r.height * devicePixelRatio; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px'; };
    size(); addEventListener('resize', size);
    /* obstacle deflection around the site/buildings: slight meander by a smooth noise field */
    const field = (x, y, t) => 0.35 * Math.sin(x * 7 + t * 0.0004) * Math.cos(y * 5 - t * 0.0003);
    function frame(t) {
      const W = cv.width, H = cv.height, a = ((dirTo() - 90) * Math.PI) / 180;
      ctx.globalCompositeOperation = 'destination-in'; ctx.fillStyle = 'rgba(0,0,0,.9)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = mode === 'day' ? 'rgba(143,196,236,.9)' : 'rgba(170,160,230,.85)'; ctx.lineWidth = 1.3 * devicePixelRatio;
      ctx.beginPath();
      for (const p of parts) {
        const th = a + field(p.x, p.y, t), v = 0.0022 * speed() * (0.7 + 0.6 * Math.sin(p.a)) * W;
        const nx = p.x + (Math.cos(th) * v) / W, ny = p.y + (Math.sin(th) * v) / H;
        ctx.moveTo(p.x * W, p.y * H); ctx.lineTo(nx * W, ny * H);
        p.x = nx; p.y = ny; p.a += 0.02;
        if (p.x < -0.02 || p.x > 1.02 || p.y < -0.02 || p.y > 1.02 || Math.random() < 0.004) { p.x = Math.random(); p.y = Math.random(); }
      }
      ctx.stroke();
      if (visible) raf = requestAnimationFrame(frame);
    }
    new IntersectionObserver((e) => { visible = e[0].isIntersecting && !SA.reduced; cancelAnimationFrame(raf); if (visible) raf = requestAnimationFrame(frame); else if (SA.reduced) frame(0); }).observe(host);
    if (SA.reduced) setTimeout(() => { for (let i = 0; i < 40; i++) frame(i * 16); }, 300);
    /* big direction arrow */
    const ar = mv.layer('arrow');
    const big = s('g', { class: 'wind-arrow' }, ar);
    s('path', { d: 'M-60 0 H40', stroke: '#fff', 'stroke-width': 3, class: 'ns' }, big);
    s('path', { d: 'M34 -12 L58 0 L34 12 Z', fill: '#fff' }, big);
    const lab = mv.label([0, 0], '', 'lbl light', { size: 10, layer: 'arrow' });
    const P = SA.$('#wind-panel');
    P.innerHTML = '<div class="seg" id="wind-seg"><button type="button" aria-pressed="true">Day · SW</button><button type="button" aria-pressed="false">Night · NE</button></div>' +
      '<div class="rose"><svg viewBox="-70 -70 140 140" id="wind-rose"></svg></div>' +
      '<div class="facts"><div class="fact"><span class="t-tech">Annual prevailing</span><div class="v">SW</div><div class="d">مهرآباد، مشاهدات ۲۰۱۵–۲۰۲۶ [10]</div></div><div class="fact"><span class="t-tech">Annual mean</span><div class="v">≈ 8<small>kt</small></div><div class="d">≈ ۴٫۱ متر بر ثانیه؛ داده‌ی ماهانه در دسترس نبود</div></div></div>' +
      '<p class="prose" lang="fa" id="wind-txt"></p><p class="t-cap">Particles show direction only; their speed is illustrative, not measured. No wind rose is drawn because frequency data per direction is not available.</p>';
    const rose = SA.$('#wind-rose');
    ['N', 'E', 'S', 'W'].forEach((t, i) => { const a = (i * Math.PI) / 2; s('text', { x: 58 * Math.sin(a), y: -58 * Math.cos(a) + 3, class: 'ax d b', 'text-anchor': 'middle', text: t }, rose); });
    s('circle', { r: 46, fill: 'none', stroke: 'var(--night-line)' }, rose); s('circle', { r: 24, fill: 'none', stroke: 'var(--night-line)' }, rose);
    const needle = s('g', { class: 'needle' }, rose);
    s('path', { d: 'M0 44 L0 -30', stroke: 'var(--wind)', 'stroke-width': 3 }, needle); s('path', { d: 'M-8 -24 L0 -44 L8 -24Z', fill: 'var(--wind)' }, needle);
    const txt = SA.$('#wind-txt');
    const setMode = (m) => {
      mode = m; const d = dirTo();
      SA.$$('#wind-seg button').forEach((b, i) => b.setAttribute('aria-pressed', (i === 0) === (m === 'day') ? 'true' : 'false'));
      needle.setAttribute('transform', 'rotate(' + d + ')');
      const C = SA.SITE_C, a = (d * Math.PI) / 180, q = SA.P([C[0] - 115 * Math.sin(a), C[1] - 115 * Math.cos(a)]);
      big.setAttribute('transform', 'translate(' + q[0] + ' ' + q[1] + ') rotate(' + (d - 90) + ')');
      lab.setAttribute('x', q[0]); lab.setAttribute('y', q[1] + 18); lab.textContent = m === 'day' ? 'DAYTIME · FROM SW (ANABATIC)' : 'NIGHT · FROM NE (KATABATIC)';
      txt.textContent = m === 'day' ? 'روز: جریان بالارونده‌ی جنوب‌غربی از دشت به سوی کوه [11]؛ از اواخر اسفند باد بعدازظهر «بادِ گل» سربالا [16]. لبه‌ی جنوب‌غربی سایت رو به باد است.' : 'شب: جریان پایین‌رونده‌ی شمال‌شرقی از کوه به دشت [11]. بلوار و پارک در شمال، هوای خنک شبانه را به سایت می‌رسانند.';
    };
    SA.$$('#wind-seg button').forEach((b, i) => (b.onclick = () => setMode(i ? 'night' : 'day')));
    setMode('day');
  }

  /* ================= 14 NOISE & AIR ================= */
  function noise() {
    const host = SA.$('#noise-map');
    const mv = new SA.MapViewer(host, { view: [-160, -120, 150, 200], zoom: true, grid: 10, corners: { tl: 'Noise · qualitative', tr: 'no measured dB' } });
    mv.aerial({ filter: 'grayscale(1) brightness(1.2) contrast(.7)', opacity: 0.45 });
    const g = mv.layer('n');
    const band = (pts, w, c, o, lvl) => { const p = s('path', { d: SA.d(pts), fill: 'none', stroke: c, 'stroke-width': w, 'stroke-opacity': o, 'stroke-linecap': 'round', class: 'nb' }, g); mv.hover(p, { k: 'Noise · ' + lvl, t: { High: 'صدای زیاد', Medium: 'صدای متوسط', Low: 'صدای کم' }[lvl], src: 'qualitative, from traffic class and observation' }, 'nz-' + lvl); return p; };
    const HI = '#C8332B', MD = '#E8913A', LO = '#F0CD6E';
    band(G.streets.Keshavarz, 40, HI, 0.14, 'High'); band(G.streets.Keshavarz, 18, HI, 0.32, 'High');
    band(G.streets['16Azar'], 16, MD, 0.35, 'Medium'); band(G.streets.Poursina, 16, MD, 0.35, 'Medium'); band(G.streets.Qods, 16, MD, 0.35, 'Medium');
    ['Jalalieh', 'Hedayati', 'Enayat'].forEach((n) => band(G.streets[n], 8, LO, 0.6, 'Low'));
    SA.drawSite(mv, mv.layer('s'), { w: 2, fill: 'none', hover: false });
    /* fire station siren (north of Keshavarz) */
    const fs = SA.centroid(SA.F('fire_station').pts), q = SA.P(fs);
    const sg = mv.layer('siren');
    for (let i = 0; i < 3; i++) s('circle', { cx: q[0], cy: q[1], r: 8, fill: 'none', stroke: HI, 'stroke-width': 1.2, class: 'ns siren', style: 'animation-delay:' + i * 0.8 + 's' }, sg);
    const fp = s('path', { d: SA.d(SA.F('fire_station').pts, true), fill: HI, 'fill-opacity': 0.7 }, sg);
    mv.hover(fp, { k: 'Intermittent source', t: 'ایستگاه آتش‌نشانی — آژیر', e: 'Fire station, north of Keshavarz (OSM)' });
    mv.label([fs[0] + 22, fs[1]], 'FIRE STATION · SIRENS', 'lbl', { anchor: 'start', size: 8.5 });
    SA.legend(el('div', { class: 'noise-leg' }, host.parentNode), [
      { kind: 'line', color: HI, extra: 8, en: 'High — Keshavarz, sirens', fa: 'زیاد' },
      { kind: 'line', color: MD, extra: 6, en: 'Medium — 16 Azar, Poursina, Qods', fa: 'متوسط' },
      { kind: 'line', color: LO, extra: 4, en: 'Low — Jalalieh, alleys', fa: 'کم' },
    ], (it, on) => { on ? mv.hot('nz-' + it.en.split(' ')[0]) : mv.unhot(); });
    /* air */
    const A = SA.$('#air');
    const months = ['Far', 'Ord', 'Kho', 'Tir', 'Mor', 'Sha', 'Meh', 'Aba', 'Aza', 'Dey', 'Bah', 'Esf'];
    const peak = [8, 9]; /* Azar–Dey (Nov–Jan per source [13]) */
    A.innerHTML = '<div class="t-tech">Air quality · Tehran</div>' +
      '<div class="facts"><div class="fact"><span class="t-tech">PM2.5 annual mean</span><div class="v">30–32<small>µg/m³</small></div><div class="d">۲۰۱۶–۲۰۲۱؛ حدود ۳ برابر رهنمود WHO [13]</div></div>' +
      '<div class="fact"><span class="t-tech">Mobile sources</span><div class="v"><span data-count="84">0</span><small>%</small></div><div class="d">سهم خودروها در انتشار سالانه [13]</div></div></div>' +
      '<div class="share"><i style="width:84%"></i><span>vehicles 84%</span><span>other 16%</span></div>' +
      '<div class="t-tech" style="margin-top:22px">Seasonal peak · inversions</div><div class="months">' + months.map((m, i) => '<span class="' + (peak.indexOf(i) > -1 ? 'pk' : '') + '">' + m + '</span>').join('') + '</div>' +
      '<p class="prose" lang="fa">اوج آلودگی آذر–دی: وارونگی دما و لایه‌ی مرزی کم‌عمق. در تابستان، PM10 از گردوغبار [12]. پیامد: ورزش روباز در ماه‌های سرد محدودیت دارد؛ فضاهای سرپوشیده با تهویه‌ی فیلتردار لازم است.</p>';
  }

  /* ================= 15 VIEWS ================= */
  function views() {
    const host = SA.$('#views-map');
    const mv = new SA.MapViewer(host, { view: [-130, -90, 140, 190], zoom: true, grid: 10, corners: { tl: 'Views from the site', tr: 'green = positive · red = negative' } });
    mv.aerial({ filter: 'saturate(.3) brightness(1.08)', opacity: 0.8 });
    SA.drawSite(mv, mv.layer('s'), { w: 2, hover: false });
    const C = SA.SITE_C, vg = mv.layer('v');
    const V = [
      { dir: 0, r: 110, w: 50, c: 'var(--pos)', en: 'North → Laleh Park (above the tree canopy, from upper floors)', fa: 'دید به پارک از طبقات بالاتر، بالای تاج درختان', page: 30, from: [5, 70] },
      { dir: 197, r: 95, w: 55, c: 'var(--pos)', en: 'South → campus and the Poursina plane trees', fa: 'دید به پردیس و ردیف چنارهای پورسینا', page: 12, from: [10, 0] },
      { dir: 340, r: 70, w: 18, c: 'var(--pos)', en: 'Jalalieh axis → Keshavarz Blvd', fa: 'محور دید جلالیه به بلوار', page: 27, from: [70, 40] },
      { dir: 270, r: 60, w: 40, c: 'var(--neg)', en: 'West → blind walls and backs of buildings', fa: 'بدنه‌های کور و پشت ساختمان‌ها در غرب', page: 17, from: [-30, 45] },
      { dir: 90, r: 55, w: 35, c: 'var(--neg)', en: 'East → TUMS parking, rear facades', fa: 'پارکینگ علوم پزشکی و نماهای پشتی', page: 14, from: [55, 55] },
    ];
    V.forEach((v, i) => {
      const o = [C[0] + v.from[0] - 10, v.from[1]], q = SA.P(o), a0 = ((v.dir - v.w / 2 - 90) * Math.PI) / 180, a1 = ((v.dir + v.w / 2 - 90) * Math.PI) / 180;
      const d = 'M' + q[0] + ' ' + q[1] + ' L' + (q[0] + v.r * Math.cos(a0)) + ' ' + (q[1] + v.r * Math.sin(a0)) + ' A' + v.r + ' ' + v.r + ' 0 0 1 ' + (q[0] + v.r * Math.cos(a1)) + ' ' + (q[1] + v.r * Math.sin(a1)) + 'Z';
      const defs = SA.defs(mv.svg), gid = 'vg' + i, rg = s('radialGradient', { id: gid, cx: q[0], cy: q[1], r: v.r, gradientUnits: 'userSpaceOnUse' }, defs);
      s('stop', { offset: 0, 'stop-color': v.c, 'stop-opacity': 0.55 }, rg); s('stop', { offset: 1, 'stop-color': v.c, 'stop-opacity': 0.02 }, rg);
      const p = s('path', { d, fill: 'url(#' + gid + ')', stroke: v.c, 'stroke-width': 0.8, 'stroke-dasharray': '3 2', class: 'ns cone-v', style: 'transform-origin:' + q[0] + 'px ' + q[1] + 'px' }, vg);
      s('circle', { cx: q[0], cy: q[1], r: 2.4, fill: v.c }, vg);
      const lp = [o[0] + v.r * 0.62 * Math.sin((v.dir * Math.PI) / 180), o[1] + v.r * 0.62 * Math.cos((v.dir * Math.PI) / 180)];
      mv.label(lp, 'V' + (i + 1), 'lbl', { size: 11, layer: 'v' });
      mv.hover(p, { k: (v.c === 'var(--pos)' ? 'Positive' : 'Negative') + ' view · V' + (i + 1), t: v.fa, e: v.en, img: 'img/thumbs/pdf_page_' + String(v.page).padStart(2, '0') + '.jpg', src: 'photo: PDF page ' + v.page + ' — click for full screen' }, 'v' + i);
      p.addEventListener('click', () => SA.openPage(v.page));
      v.p = p;
    });
    SA.observe(host, () => V.forEach((v, i) => setTimeout(() => v.p.classList.add('in'), i * 180)));
    const L = SA.$('#views-list');
    V.forEach((v, i) => {
      const it = el('div', { class: 'vl ' + (v.c === 'var(--pos)' ? 'pos' : 'neg'), tabindex: 0 }, L, '<span class="b">V' + (i + 1) + '</span><div><b>' + v.en + '</b><span class="fa">' + v.fa + '</span></div>');
      const idx = SA.photoList.findIndex((p) => p.page === v.page);
      SA.thumb(it, SA.photoList, idx, { cls: 'vl-th' });
      it.addEventListener('pointerenter', () => mv.hot('v' + i)); it.addEventListener('pointerleave', () => mv.unhot());
      it.addEventListener('focus', () => mv.hot('v' + i)); it.addEventListener('blur', () => mv.unhot());
    });
  }

  SA.sections.push(green, topo, climate, sun, wind, noise, views);
})();
