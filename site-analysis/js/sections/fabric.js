/* 06 Land use · 07 Building typology · 08 Photo survey  (+ shared photo gallery list) */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el;

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
    const mv = new SA.MapViewer(host, { view: [fr[0], fr[1], fr[2], fr[3] - 60], zoom: true, corners: { tl: 'Figure-ground', tr: 'black = built · grey = on site' } });
    const g = mv.layer('fg');
    s('rect', { x: fr[0], y: -fr[3], width: fr[2] - fr[0], height: fr[3] - fr[1], fill: 'var(--card)' }, g);
    const hatch = SA.hatch(mv.svg, 'h-dem', 'var(--mute)', 2.4, 0.5);
    SA.drawFeatures(mv, g, {
      filter: (f) => f.kind === 'bldg', dashUnc: false,
      style: (f) => (f.use === 'site' ? { fill: hatch, stroke: 'var(--ink)', 'stroke-width': 0.6, 'stroke-dasharray': '2 1.5' } : { fill: 'var(--ink)' }),
    });
    SA.drawSite(mv, mv.layer('site'), { w: 2, fill: 'none' });
    const facts = SA.$('#fg-facts');
    facts.innerHTML = [
      ['Coverage around site', G.landuse.coverage, '%', 'نسبت ساخته به باز در قاب تصویر هوایی، بدون نوار پارک (تقریبی)'],
      ['Built inside site today', G.landuse.siteBuilt, '%', '۸ بنای کوتاه؛ بقیه آسفالت پارکینگ — همه تخریب می‌شوند'],
      ['Observed height', '3–8', 'floors', 'از عکس‌ها (تقریبی)؛ بلندترین‌ها کنار ۱۶ آذر'],
    ].map(([k, v, u, d]) => '<div class="fact rv"><span class="t-tech">' + k + '</span><div class="v">' + (typeof v === 'number' ? '<span data-count="' + v + '">0</span>' : v) + '<small>' + u + '</small></div><div class="d">' + d + '</div></div>').join('');
    /* typology cards: photo crop + palette extracted from that photo (k-means, k=5, share %) */
    const T = [
      { crop: 'ch_05', page: 5, en: 'Mid-rise blocks, 6–8 storeys', fa: 'بلوک‌های میان‌مرتبه‌ی ۶–۸ طبقه، ۱۶ آذر', pal: [['#B8AA9C', 36], ['#171510', 22], ['#474131', 17], ['#767060', 12], ['#DFDED7', 10]] },
      { crop: 'ch_20', page: 20, en: 'Brick on a stone plinth', fa: 'آجر با پاسنگ سنگی، کوچه‌ی زارع', pal: [['#B3977D', 30], ['#565F65', 26], ['#8B7A67', 19], ['#ABD4EF', 16], ['#4F3B33', 6]] },
      { crop: 'ch_17', page: 17, en: 'Yellow brick, 3–4 storeys, blind walls', fa: 'آجر زرد ۳–۴ طبقه با بدنه‌ی کور', pal: [['#C1A58A', 52], ['#C7E6F5', 22], ['#1F1813', 9], ['#514134', 9], ['#817369', 5]] },
      { crop: 'ch_26', page: 26, en: '5 storeys with balconies', fa: 'ساختمان ۵ طبقه با بالکن و دیوار حیاط', pal: [['#303947', 32], ['#C3D3DC', 30], ['#676259', 15], ['#14181F', 11], ['#93928E', 10]] },
      { crop: 'ch_07', page: 7, en: 'Plane-tree street edge', fa: 'خیابان با ردیف چنار', pal: [['#38352C', 36], ['#5E5949', 29], ['#8A897D', 15], ['#151512', 10], ['#CECECD', 7]] },
      { crop: 'ch_15', page: 15, en: 'Steel fence on plinth — institutional edge', fa: 'نرده‌ی فلزی روی پاسنگ، لبه‌ی نهادی', pal: [['#615E5D', 31], ['#151718', 21], ['#3B3A39', 20], ['#858382', 16], ['#C7C6C2', 8]] },
    ];
    const box = SA.$('#types');
    const list = T.map((t) => { const i = SA.photoList.findIndex((p) => p.page === t.page); return Object.assign({}, SA.photoList[i], { thumb: 'img/thumbs/crop_' + t.crop + '.jpg' }); });
    T.forEach((t, i) => {
      const c = el('figure', { class: 'type rv d' + ((i % 3) + 1) }, box);
      SA.thumb(c, list, i, { no: SA.photoList[SA.photoList.findIndex((p) => p.page === t.page)].pno });
      el('figcaption', null, c, '<b>' + t.en + '</b><span class="fa">' + t.fa + '</span><span class="pal" title="Dominant colours extracted from this photo (k-means, share %)">' + t.pal.map(([h, p]) => '<i style="background:' + h + ';flex:' + p + '"></i>').join('') + '</span>');
    });
    el('p', { class: 't-cap types-note' }, box, 'Colour strips: the five dominant colours of each field photo, extracted by k-means clustering; the width is the share of the frame. Material reading, not a specification.');
    /* timeline */
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
