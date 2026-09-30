/* 06 Land use · 07 Building typology · 08 Photo survey  (+ shared photo gallery list) */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el, F = (id) => SA.F(id);

  /* ---- all survey photos as one viewer list (numbering preserved) ---- */
  const pad = (n) => String(n).padStart(2, '0');
  SA.photoList = D.photos.map((p) => ({
    src: 'img/photos/pdf_page_' + pad(p.page) + '.jpg', thumb: 'img/thumbs/pdf_page_' + pad(p.page) + '.jpg',
    fa: (p.no === '—' ? 'تکمیلی، بی‌شماره — ' : 'عکس ' + SA.fa(p.no) + ' — ') + p.fa,
    en: 'Photo survey · PDF p.' + p.page + ' · ' + p.en + (p.dir != null ? ' · view ≈ ' + p.dir + '° (' + p.conf + ')' : ' · view direction ' + p.conf),
    no: p.no === '—' ? 'unnumbered' : 'No. ' + p.no, group: 'Photo survey', page: p.page, pno: p.no,
  }));
  SA.openPage = (page) => { const i = SA.photoList.findIndex((x) => x.page === page); SA.viewer.open(SA.photoList, Math.max(0, i)); };

  /* ================= 06 LAND USE ================= */
  function landuse() {
    const host = SA.$('#lu-map'), fr = SA.FRAME;
    const mv = new SA.MapViewer(host, { view: [fr[0] - 20, fr[1] - 10, fr[2] + 30, fr[3] + 15], zoom: true, grid: 10, corners: { tl: 'Land use · aerial frame', tr: 'hover a parcel or a legend row' } });
    mv.aerial({ filter: 'grayscale(1) brightness(1.25) contrast(.6)', opacity: 0.35 });
    const g = mv.layer('lu');
    const hatch = SA.hatch(mv.svg, 'h-park', 'rgba(28,31,34,.35)', 3, 0.5);
    SA.drawFeatures(mv, g, {
      style: (f) => f.use === 'park'
        ? { fill: hatch, stroke: 'var(--mute)', 'stroke-width': 0.5 }
        : { fill: SA.luFill(f.use), 'fill-opacity': f.kind === 'parcel' ? 0.6 : 0.95, stroke: 'var(--card)', 'stroke-width': 0.5 },
      group: (f) => 'lu-' + f.use,
    });
    SA.drawStreets(mv, mv.layer('st'), ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS'], { hier: true, k: 0.6, hover: false });
    SA.drawSite(mv, mv.layer('site'), { w: 2.2, fill: 'none' });
    mv.label([SA.SITE_C[0], SA.SITE_C[1]], 'SITE · TODAY: PARKING', 'lbl', { size: 9.5 });
    /* donut: shares of the CLASSIFIED area in the aerial frame (streets/unmapped excluded, stated) */
    const sh = G.landuse.shares, keys = ['edu', 'park', 'res', 'unk', 'site', 'com', 'green', 'cult'];
    const data = keys.filter((k) => sh[k] > 0).map((k) => ({ k, v: sh[k], color: D.landuse[k].c, en: D.landuse[k].en }));
    const tot = data.reduce((a, d) => a + d.v, 0);
    const dn = SA.donut(SA.$('#lu-donut'), data, { r: 92, w: 20, center: (100 - sh.open).toFixed(0) + '%', sub: 'of frame mapped' });
    const items = data.map((d) => ({ kind: d.k === 'park' ? 'rect' : 'rect', color: d.color, en: d.en + ' — ' + ((d.v / tot) * 100).toFixed(1) + '%', fa: D.landuse[d.k].fa, k: d.k }));
    SA.legend(SA.$('#lu-legend'), items, (it, on) => { if (on) { mv.hot('lu-' + it.k); dn.focus(it.k); } else { mv.unhot(); dn.focus(null); } });
    mv.onHot = (grp, on) => { const k = on && typeof grp === 'string' ? grp.replace('lu-', '') : null; dn.focus(k); };
    SA.$('#lu-note').innerHTML = 'سهم‌ها از مساحت <strong>نقشه‌شده</strong> در قاب تصویر هوایی (≈ ' + SA.fa((G.landuse.frame.area_m2 / 10000).toFixed(1)) + ' هکتار) است؛ ' + SA.fa(sh.open) + '٪ باقی‌مانده معابر، حیاط‌ها و قطعات بدون داده‌اند. صنعتی و اداری در این محدوده دیده نشد؛ خدمات امدادی (آتش‌نشانی، سوله‌ی بحران) در شمال کشاورز و بیرون قاب است. خط‌چین = کاربری نامطمئن.';
  }

  /* ================= 07 BUILDING TYPOLOGY ================= */
  function typology() {
    const host = SA.$('#fg-map'), fr = SA.FRAME;
    const V = [fr[0] + 10, fr[1] + 10, fr[2] - 5, fr[3] - 45];
    const mv = new SA.MapViewer(host, { view: V, zoom: true });
    SA.sheet(mv, { no: 'B-07', title: 'URBAN MORPHOLOGY · FIGURE–GROUND', src: 'OSM footprints + buildings traced from the aerial' });
    const ground = mv.layer('ground');
    s('rect', { x: fr[0] - 50, y: -fr[3] - 50, width: fr[2] - fr[0] + 100, height: fr[3] - fr[1] + 100, fill: 'var(--card)' }, ground);
    /* 02 street void */
    const sv = mv.layer('street', { on: false });
    ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS', 'Qods', 'DavoodTaheri', 'Oghab'].forEach((n) => {
      const w = { Keshavarz: 38, Poursina: 16, '16Azar': 16, Qods: 14 }[n] || 7;
      s('path', { d: SA.d(G.streets[n]), fill: 'none', stroke: '#D9DEE2', 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sv);
      s('path', { d: SA.d(G.streets[n]), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 0.6, 'stroke-dasharray': '3 3', class: 'ns draw' }, sv);
    });
    /* 03 green void */
    const gv = mv.layer('greenvoid', { on: false });
    s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'rgba(158,180,139,.35)' }, gv);
    SA.vegLayer(mv, gv);
    /* 04 open space: everything not built, hatched */
    const ov = mv.layer('open', { on: false });
    s('rect', { x: fr[0], y: -fr[3], width: fr[2] - fr[0], height: fr[3] - fr[1], fill: SA.hatch(mv.svg, 'h-open', 'rgba(28,31,34,.18)', 3.5, 0.5) }, ov);
    /* 01 building mass — revealed from the site outwards */
    const bg = mv.layer('mass');
    const c = SA.SITE_C, hatch = SA.hatch(mv.svg, 'h-dem', 'var(--mute)', 2.4, 0.5);
    const nodes = SA.drawFeatures(mv, bg, { filter: (f) => f.kind === 'bldg', dashUnc: false, style: (f) => (f.use === 'site' ? { fill: hatch, stroke: 'var(--ink)', 'stroke-width': 0.8, 'stroke-dasharray': '2 1.5', class: 'ns bld' } : { fill: 'var(--ink)', class: 'bld' }) });
    void nodes;
    const feats = G.features.filter((f) => f.kind === 'bldg');
    SA.$$('path', bg).forEach((p, i) => { const f = feats[i]; if (!f) return; const q = SA.centroid(f.pts); p.style.transitionDelay = (Math.hypot(q[0] - c[0], q[1] - c[1]) * 6).toFixed(0) + 'ms'; });
    /* 05 site relationship */
    const sr = mv.layer('rel', { on: false });
    SA.drawSite(mv, sr, { w: 2.4, fill: 'rgba(46,134,222,.10)' });
    SA.annot(mv, sr, [-40, 40], 'M1', 'FINE-GRAIN RESIDENTIAL · BLIND WALLS', { dir: [-1, 1], len: 40 });
    SA.annot(mv, sr, [60, -40], 'M2', 'INSTITUTIONAL PAVILIONS', { dir: [1, -1], len: 36 });
    SA.annot(mv, sr, [0, 125], 'M3', 'BOULEVARD + PARK VOID', { dir: [1, 1], len: 30 });
    SA.annot(mv, sr, [10, 45], 'M4', '≈ 28 % BUILT TODAY · TO BE CLEARED', { dir: [1, 1], len: 50 });
    SA.prepDraw(host);
    SA.observe(host, () => bg.classList.add('on'));
    const facts = SA.$('#fg-facts');
    facts.innerHTML = [
      ['Coverage around site', G.landuse.coverage, '%', 'نسبت ساخته به باز در قاب هوایی، بدون نوار پارک (تقریبی)'],
      ['Built inside site', G.landuse.siteBuilt, '%', '۸ بنای کوتاه؛ همه تخریب می‌شوند'],
      ['Observed height', '3–8', 'floors', 'از عکس‌ها (تقریبی)'],
    ].map(([k, v, u, d]) => '<div class="fact"><span class="t-tech">' + k + '</span><div class="v">' + (typeof v === 'number' ? '<span data-count="' + v + '">0</span>' : v) + '<small>' + u + '</small></div><div class="d">' + d + '</div></div>').join('');
    const set = (on) => ['street', 'greenvoid', 'open', 'rel'].forEach((n) => mv.toggle(n, on.indexOf(n) > -1));
    const steps = [
      () => { set([]); mv.setView(V, 900); },
      () => { set(['street']); SA.$$('.draw', sv).forEach((p) => p.classList.add('on')); },
      () => set(['street', 'greenvoid']),
      () => set(['open', 'greenvoid']),
      () => { set(['street', 'greenvoid', 'rel']); mv.setView([-110, -60, 110, 150], 1200); SA.revealAnnots(host); },
    ];
    SA.scrolly(SA.$('#morph-scrolly'), (k) => steps[k]());
    /* typology archive: field photos, original aspect ratio, drawing numbers */
    const T = [
      { page: 5, en: 'Mid-rise blocks, 6–8 storeys', fa: 'بلوک‌های میان‌مرتبه‌ی ۶–۸ طبقه، ۱۶ آذر', ty: 'T1 · MID-RISE BLOCK' },
      { page: 20, en: 'Brick on a stone plinth', fa: 'آجر با پاسنگ سنگی، کوچه‌ی زارع', ty: 'T2 · BRICK + PLINTH' },
      { page: 17, en: 'Yellow brick, 3–4 storeys, blind walls', fa: 'آجر زرد ۳–۴ طبقه با بدنه‌ی کور', ty: 'T3 · BLIND PARTY WALL' },
      { page: 26, en: '5 storeys with balconies', fa: 'ساختمان ۵ طبقه با بالکن و دیوار حیاط', ty: 'T4 · COURTYARD WALL' },
      { page: 7, en: 'Plane-tree street edge', fa: 'خیابان با ردیف چنار', ty: 'T5 · TREE-LINED EDGE' },
      { page: 15, en: 'Steel fence on plinth — institutional edge', fa: 'نرده‌ی فلزی روی پاسنگ، لبه‌ی نهادی', ty: 'T6 · INSTITUTIONAL FENCE' },
    ];
    const box = SA.$('#types');
    T.forEach((t, i) => {
      const k = SA.photoList.findIndex((p) => p.page === t.page);
      const c2 = el('figure', { class: 'arch-fig rv d' + ((i % 3) + 1) }, box);
      el('div', { class: 'af-h' }, c2, '<span>' + t.ty + '</span><span>DWG B-07.' + (i + 1) + '</span>');
      const b = el('button', { type: 'button', class: 'af-img', 'aria-label': 'Open photo: ' + t.en }, c2);
      el('img', { src: SA.photoList[k].thumb, alt: t.en, loading: 'lazy' }, b);
      el('span', { class: 'af-ann' }, b, 'PDF p.' + t.page + ' · photo ' + SA.photoList[k].pno);
      b.addEventListener('click', () => SA.viewer.open(SA.photoList, k));
      el('figcaption', null, c2, '<b>' + t.en + '</b><span class="fa">' + t.fa + '</span>');
    });
    const tl = SA.$('#timeline');
    el('div', { class: 't-tech' }, tl, 'Historical layers · documented dates');
    const line = el('div', { class: 'tl-line' }, tl);
    D.timeline.forEach((t, i) => el('div', { class: 'tl-it rv d' + ((i % 4) + 1) }, line, '<span class="y">' + t.y + '</span><span class="en">' + t.en + '</span><span class="fa">' + t.fa + '</span>'));
  }

  /* ================= 08 PHOTO SURVEY ================= */
  function survey() {
    const host = SA.$('#survey-map');
    const mv = new SA.MapViewer(host, { view: [-150, -135, 300, 175], zoom: true, grid: 10, corners: { tl: 'Key map — redrawn in vector', tr: 'numbers = your numbers' } });
    const b = mv.layer('b');
    SA.drawFeatures(mv, b, { filter: (f) => f.kind === 'parcel' || f.use !== 'site', hover: false, dashUnc: false, style: (f) => ({ fill: f.use === 'green' ? 'var(--lu-green)' : f.kind === 'parcel' ? 'var(--paper-2)' : 'var(--paper-3)', 'fill-opacity': f.use === 'green' ? 0.5 : 1 }) });
    SA.drawStreets(mv, mv.layer('st'), ['KeshS', 'KeshN', 'Qods', 'Yekom', 'Nosrat', 'DavoodTaheri', 'Oghab', 'BahmanOrouji', '16Azar', 'Poursina', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS'], { hier: true, k: 0.7, hover: false, w: { KeshS: 5, KeshN: 5 }, mono: null });
    SA.drawSite(mv, mv.layer('site'), { hover: false, w: 1.6 });
    [[[-60, 150], 'KESHAVARZ BOULEVARD'], [[210, 150], 'KESHAVARZ'], [[284, -40], 'QODS'], [[-110, -20], '16 AZAR']].forEach(([p, t]) => mv.label(p, t, 'lbl', { size: 8.5 }));
    const cg = mv.layer('cones'), mg = mv.layer('marks');
    const byNo = {};
    D.photos.forEach((p) => { if (p.xy) (byNo[p.no.replace(/[()]/g, '')] = byNo[p.no.replace(/[()]/g, '')] || []).push(p); });
    const R = 26, half = 28;
    D.stations.forEach((st) => {
      const ps = byNo[st.no] || [], q = SA.P(st.xy);
      ps.forEach((p) => {
        if (p.dir == null) return;
        const a0 = ((p.dir - half - 90) * Math.PI) / 180, a1 = ((p.dir + half - 90) * Math.PI) / 180;
        const d = 'M' + q[0] + ' ' + q[1] + ' L' + (q[0] + R * Math.cos(a0)) + ' ' + (q[1] + R * Math.sin(a0)) + ' A' + R + ' ' + R + ' 0 0 1 ' + (q[0] + R * Math.cos(a1)) + ' ' + (q[1] + R * Math.sin(a1)) + 'Z';
        const cone = s('path', { d, fill: p.conf === 'uncertain' ? 'none' : 'var(--site)', 'fill-opacity': 0.16, stroke: 'var(--site)', 'stroke-width': 0.8, 'stroke-dasharray': p.conf === 'uncertain' ? '2 2' : null, class: 'ns cone', 'data-no': st.no }, cg);
        mv.hover(cone, { k: 'Photo ' + p.no + ' · view ≈ ' + p.dir + '° · ' + p.conf, t: p.fa, img: 'img/thumbs/pdf_page_' + pad(p.page) + '.jpg', src: 'PDF page ' + p.page }, 'no-' + st.no);
        cone.addEventListener('click', () => SA.openPage(p.page));
      });
      const g = s('g', { class: 'mk' + (st.missing ? ' missing' : ''), transform: 'translate(' + q[0] + ' ' + q[1] + ')', tabindex: st.missing ? -1 : 0, role: 'button', 'aria-label': 'Photo station ' + st.no }, mg);
      const unknown = ps.length && ps.every((p) => p.dir == null);
      s('circle', { r: 6.4, fill: st.missing ? 'var(--card)' : unknown ? 'var(--card)' : 'var(--ink)', stroke: 'var(--ink)', 'stroke-width': 1.2, 'stroke-dasharray': st.missing ? '2 1.6' : null, class: 'ns' }, g);
      s('text', { class: 'mk-t' + (st.missing || unknown ? ' dark' : ''), 'text-anchor': 'middle', 'dominant-baseline': 'central', text: st.no }, g);
      const first = ps[0];
      mv.hover(g, st.missing
        ? { k: 'Station 13', t: 'عکس ۱۳ روی نقشه‌ی کلید هست ولی در PDF نیست', e: 'missing' }
        : { k: 'Station ' + st.no + ' · ' + ps.length + ' frame' + (ps.length > 1 ? 's' : ''), t: first ? first.fa : '', img: first ? 'img/thumbs/pdf_page_' + pad(first.page) + '.jpg' : null, src: 'click to open all frames of this station' }, 'no-' + st.no);
      if (!st.missing) {
        const open = () => { const i = SA.photoList.findIndex((x) => x.pno.replace(/[()]/g, '') === st.no); SA.viewer.open(SA.photoList, i); };
        g.addEventListener('click', open); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      }
    });
    const prev = mv.onRefresh;
    mv.onRefresh = (ppm) => { prev && prev(ppm); SA.$$('.mk', mv.svg).forEach((g) => { const t = g.getAttribute('transform').replace(/ scale\([^)]*\)/, ''); g.setAttribute('transform', t + ' scale(' + (1.6 / ppm / 0.9).toFixed(3) + ')'); }); };
    mv.refresh();
    SA.legend(SA.$('#survey-legend'), [
      { kind: 'rect', color: 'rgba(46,134,222,.3)', extra: 'stroke="#2E86DE"', en: 'View direction — inferred', fa: 'جهت دید استنتاج‌شده' },
      { kind: 'rect', color: 'none', extra: 'stroke="#2E86DE" stroke-dasharray="2 2"', en: 'View direction — uncertain', fa: 'جهت نامطمئن' },
      { kind: 'dot', color: 'var(--ink)', en: 'Station with direction', fa: 'ایستگاه' },
      { kind: 'dot', color: '#D5D1C8', en: 'Direction unknown / panorama', fa: 'جهت نامشخص' },
    ]);
    /* grid of frames grouped by number */
    const grid = SA.$('#survey-grid');
    const order = ['1', '2', '3', '4', '5', '6', '(6)', '7', '8', '9', '10', '11', '12', '—'];
    order.forEach((no) => {
      SA.photoList.forEach((p, i) => {
        if (p.pno !== no) return;
        const t = SA.thumb(grid, SA.photoList, i, { no: no === '—' ? '·' : no.replace(/[()]/g, '') });
        const key = no.replace(/[()]/g, '');
        t.addEventListener('pointerenter', () => mv.hot('no-' + key)); t.addEventListener('pointerleave', () => mv.unhot());
        t.addEventListener('focus', () => mv.hot('no-' + key)); t.addEventListener('blur', () => mv.unhot());
      });
    });
  }

  SA.sections.push(landuse, typology, survey);
})();
