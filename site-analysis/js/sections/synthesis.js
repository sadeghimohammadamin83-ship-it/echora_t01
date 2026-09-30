/* 16 Opportunities · 17 Constraints · 18 Synthesis · 19 Design implications · 20 Sources & archive */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el;
  const ST = G.streets;
  const px = (u, v) => SA.px(u, v);
  const J0 = ST.Jalalieh[0], JS = ST.Jalalieh[ST.Jalalieh.length - 1];

  /* site edges (from v1 s8.py, aerial px → local) */
  const EDGE = {
    N: { pts: [[494, 340], [640, 343], [965, 283]].map((q) => px(...q)), c: '#1F6C9F', en: 'North · Keshavarz', fa: 'شمال — کشاورز', type: 'Public', typeFa: 'عمومی' },
    E: { pts: [[978, 300], [1010, 500], [1062, 515], [1042, 640], [1064, 772]].map((q) => px(...q)), c: '#6FA8D6', en: 'East · Jalalieh', fa: 'شرق — جلالیه', type: 'Semi-public', typeFa: 'نیمه‌عمومی' },
    S: { pts: [[1052, 787], [640, 922]].map((q) => px(...q)), c: '#1F6C9F', en: 'South · Poursina', fa: 'جنوب — پورسینا', type: 'Public / institutional', typeFa: 'عمومی/نهادی' },
    W: { pts: [[628, 915], [598, 780], [548, 695], [513, 640], [482, 420], [482, 352]].map((q) => px(...q)), c: '#9F2F2D', en: 'West · Hedayati / Enayat', fa: 'غرب — هدایتی/عنایت', type: 'Private / sensitive', typeFa: 'خصوصی/حساس' },
  };

  function siteMap(host, o) {
    const mv = new SA.MapViewer(host, Object.assign({ view: [-190, -140, 200, 225], zoom: true, grid: 10 }, o));
    mv.aerial({ filter: o && o.dark ? 'grayscale(1) brightness(.5)' : 'grayscale(1) brightness(1.2) contrast(.7)', opacity: o && o.dark ? 0.9 : 0.45 });
    SA.drawStreets(mv, mv.layer('st'), ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS'], { hier: true, k: 0.7, hover: false });
    SA.drawSite(mv, mv.layer('site'), { w: 1.8, hover: false, fill: 'rgba(46,134,222,.12)' });
    return mv;
  }

  /* ================= 16 / 17 SWOT (mapped) ================= */
  const SW = {
    S: [
      ['مجاورت مستقیم با دانشگاه تهران و علوم پزشکی (طب ورزشی، فیزیولوژی)', 'Direct adjacency to UT and TUMS', { area: [[-40, -45], [110, 20], [110, -60], [-40, -90]] }],
      ['بوستان لاله‌ی ۳۵ هکتاری آن سوی بلوار؛ ظرفیت ورزش روباز', 'Laleh Park 35 ha across the boulevard', { area: [[-110, 130], [120, 160], [120, 175], [-110, 175]] }],
      ['مترو بوستان لاله ≈ ۲۸۰ متر و بلوار شهری', 'Metro ≈ 280 m, urban boulevard', { pt: [110, 150] }],
      ['زمین تقریباً مسطح و خالی‌شدنی (پارکینگ)', 'Near-flat, clearable (parking)', { pt: [SA.SITE_C[0], SA.SITE_C[1]] }],
      ['کریدور پیاده‌ی جلالیه', 'Jalalieh pedestrian corridor', { line: ST.Jalalieh }],
    ],
    O: [
      ['حلقه‌ی پیوند پارک و دانشگاه از جلالیه و زارع', 'Park ↔ university link via Jalalieh + Zare\'', { line: [ST.Zare[0], ST.Zare[1], ST.Zare[2], J0] }],
      ['اشتراک فضاهای ورزشی با دانشگاه و محله در ساعات غیرآموزشی', 'Shared sports use after hours', { pt: [0, 20] }],
      ['جایگزینی پارکینگ با فضای عمومی و سبز؛ بهبود لبه‌ی کشاورز', 'Replace parking with public/green space', { line: EDGE.N.pts }],
      ['هم‌افزایی پژوهشی با علوم پزشکی و دانشکده‌ی فعلی تربیت بدنی', 'Research synergy with TUMS', { pt: [60, -40] }],
    ],
    W: [
      ['مساحت ≈ ۰٫۹ هکتار: سالن چندمنظوره و زمین‌های روباز استاندارد با هم تنگ‌اند', 'Only ≈ 0.9 ha', { pt: [SA.SITE_C[0], SA.SITE_C[1]] }],
      ['هیچ ضلعی مستقیم به خیابان سواره‌ی اصلی باز نمی‌شود', 'No direct frontage on a main road', { line: EDGE.W.pts }],
      ['بدنه‌های کور همسایه در غرب و شرق', 'Neighbouring blind walls W and E', { line: EDGE.E.pts }],
      ['صدای کشاورز و آلودگی PM2.5 برای ورزش روباز', 'Keshavarz noise and PM2.5', { line: ST.Keshavarz }],
    ],
    T: [
      ['صدا و نور شبانه‌ی ورزش در برابر مسکونی غرب', 'Night noise/light vs west residences', { area: [[-110, 90], [-45, 90], [-45, -30], [-110, -30]] }],
      ['حجم بزرگ سالن‌ها در برابر مقیاس ۳ تا ۸ طبقه', 'Large halls vs 3–8 storey scale', { pt: [30, 15] }],
      ['تداخل سرویس و پیاده در جلالیه‌ی بن‌بست؛ دسترسی امدادی محدود', 'Service/pedestrian conflict in Jalalieh', { pt: [JS[0], JS[1] + 30] }],
      ['از دست رفتن پارکینگ فعلی و فشار پارک حاشیه‌ای', 'Loss of the existing parking', { pt: [-10, 60] }],
      ['وارونگی دما در زمستان و خیرگی آفتاب عصر', 'Winter inversion; western glare', { line: EDGE.W.pts }],
    ],
  };
  const QC = { S: '#3E7A4E', O: '#2E86DE', W: '#B0782A', T: '#A8443C' };
  const QN = { S: ['Strengths', 'قوت‌ها'], O: ['Opportunities', 'فرصت‌ها'], W: ['Weaknesses', 'ضعف‌ها'], T: ['Threats', 'تهدیدها'] };
  function swot(hostId, keys) {
    const H = SA.$(hostId);
    const mapBox = el('div', { class: 'c-7' }, H), listBox = el('div', { class: 'c-5 swot-lists' }, H);
    const mv = siteMap(el('div', { class: 'map-xl' }, mapBox), { corners: { tl: keys.map((k) => QN[k][0]).join(' + '), tr: 'mapped SWOT' } });
    const g = mv.layer('sw');
    keys.forEach((k) => {
      const col = el('div', { class: 'swq' }, listBox, '<div class="swh" style="--c:' + QC[k] + '"><span class="t-tech">' + QN[k][0] + '</span><span class="fa-inline">' + QN[k][1] + '</span></div>');
      const ol = el('ol', { class: 'nlist' }, col);
      SW[k].forEach((it, i) => {
        const id = k + (i + 1), geo = it[2], c = QC[k];
        let node;
        if (geo.area) node = s('path', { d: SA.d(geo.area, true), fill: c, 'fill-opacity': 0.22, stroke: c, 'stroke-width': 1.2, 'stroke-dasharray': '4 3', class: 'ns' }, g);
        else if (geo.line) node = s('path', { d: SA.d(geo.line), fill: 'none', stroke: c, 'stroke-width': 7, 'stroke-opacity': 0.55, 'stroke-linecap': 'round', class: 'ns' }, g);
        const anchor = geo.pt || (geo.line ? SA.along(geo.line, 0.5).p : SA.centroid(geo.area));
        const q = SA.P(anchor), mk = s('g', { transform: 'translate(' + q[0] + ' ' + q[1] + ')', class: 'swmk' }, g);
        s('circle', { r: 6.5, fill: c, stroke: '#fff', 'stroke-width': 1.4, class: 'ns' }, mk);
        s('text', { class: 'ent-t', 'text-anchor': 'middle', 'dominant-baseline': 'central', text: id }, mk);
        const data = { k: QN[k][0] + ' · ' + id, t: it[0], e: it[1] };
        if (node) mv.hover(node, data, id);
        mv.hover(mk, data, id);
        const li = el('li', { tabindex: 0 }, ol, '<span class="b" style="background:' + c + '">' + id + '</span><div><span class="fa">' + it[0] + '</span><span class="t-cap">' + it[1] + '</span></div>');
        li.dataset.g = id;
        li.addEventListener('pointerenter', () => mv.hot(id)); li.addEventListener('pointerleave', () => mv.unhot());
        li.addEventListener('focus', () => mv.hot(id)); li.addEventListener('blur', () => mv.unhot());
      });
    });
    mv.onHot = (grp, on) => SA.$$('li', listBox).forEach((li) => li.classList.toggle('hot', on && li.dataset.g === grp));
    const prev = mv.onRefresh;
    mv.onRefresh = (ppm) => { prev && prev(ppm); SA.$$('.swmk', mv.svg).forEach((m) => { const t = m.getAttribute('transform').replace(/ scale\([^)]*\)/, ''); m.setAttribute('transform', t + ' scale(' + (1.5 / ppm).toFixed(3) + ')'); }); };
    mv.refresh();
  }

  /* ================= 18 SYNTHESIS ================= */
  function synthesis() {
    const mv = siteMap(SA.$('#syn-map'), { corners: { tl: 'Edges · movement · landscape', tr: 'synthesis' } });
    const g = mv.layer('e');
    Object.keys(EDGE).forEach((k) => {
      const e = EDGE[k];
      const p = s('path', { d: SA.d(e.pts), fill: 'none', stroke: e.c, 'stroke-width': 7, 'stroke-linecap': 'round', class: 'ns draw' }, g);
      mv.hover(p, { k: 'Edge · ' + e.type, t: e.fa + ' — ' + e.typeFa, e: e.en }, 'edge-' + k);
    });
    SA.drawTrees(mv.layer('t'), { r: 3, step: 9, fill: '#6F9A57' });
    const a = mv.layer('a');
    s('path', { d: SA.d([[JS[0] + 12, JS[1] - 20], [JS[0] + 2, JS[1] + 30]]), stroke: 'var(--serv)', 'stroke-width': 3, class: 'ns', 'marker-end': SA.marker(mv.svg, 'ah-sv', 'var(--serv)', 4) }, a);
    s('path', { d: SA.d([[J0[0] + 4, J0[1] - 40], [J0[0] - 4, J0[1] + 24]]), stroke: 'var(--ink)', 'stroke-width': 1.8, 'stroke-dasharray': '3 3', class: 'ns flow', 'marker-end': SA.marker(mv.svg, 'ah-k', 'var(--ink)', 5) }, a);
    s('path', { d: SA.d(ST.Zare), stroke: 'var(--ink)', 'stroke-width': 1.5, 'stroke-dasharray': '3 3', class: 'ns flow slow', fill: 'none' }, a);
    SA.prepDraw(mv.host); SA.observe(mv.host, () => SA.$$('.draw', mv.host).forEach((p, i) => setTimeout(() => p.classList.add('on'), i * 220)));
    /* matrix: 5 criteria × 4 edges (v1 table) */
    const crit = ['عمومی / خصوصی', 'ورود پیاده', 'سرویس', 'فشار سواره', 'منظر'];
    /* [text, level 1–3] — same readings as v1, translated */
    const M = {
      N: [['عمومی', 3], ['مناسب · ورودی اصلی', 3], ['نامناسب', 1], ['زیاد', 3], ['زیاد (پارک)', 3]],
      E: [['نیمه‌عمومی', 2], ['مناسب · محور پیاده', 3], ['مناسب از سمت پورسینا', 2], ['کم (بن‌بست)', 1], ['متوسط', 2]],
      S: [['عمومی / نهادی', 2], ['مناسب · رو به دانشگاه', 3], ['محدود', 1], ['متوسط · یک‌طرفه', 2], ['متوسط (چنارها)', 2]],
      W: [['خصوصی / پشت', 1], ['ثانویه', 2], ['محدود · کوچه‌ی باریک', 1], ['کم', 1], ['کم (بدنه‌ی کور)', 1]],
    };
    const EN = { N: 'شمال', E: 'شرق', S: 'جنوب', W: 'غرب' }, SUB = { N: 'کشاورز', E: 'جلالیه', S: 'پورسینا', W: 'هدایتی / عنایت' };
    const X = SA.$('#syn-matrix');
    X.innerHTML = '<table class="mx fa-t"><thead><tr><th>معیار</th>' + Object.keys(M).map((k) => '<th data-e="' + k + '" style="--c:' + EDGE[k].c + '">' + EN[k] + '<span class="fa-inline">' + SUB[k] + '</span></th>').join('') + '</tr></thead><tbody>' +
      crit.map((c, i) => '<tr><th>' + c + '</th>' + Object.keys(M).map((k) => '<td data-e="' + k + '"><i class="lv l' + M[k][i][1] + '"></i>' + M[k][i][0] + '</td>').join('') + '</tr>').join('') + '</tbody></table>' +
      '<p class="t-cap mx-leg" lang="fa">● پررنگ = زیاد / مناسب · ● کم‌رنگ = کم / محدود</p>';
    SA.$$('[data-e]', X).forEach((c) => { const k = c.dataset.e; c.addEventListener('pointerenter', () => { mv.hot('edge-' + k); X.classList.add('dim'); SA.$$('[data-e="' + k + '"]', X).forEach((n) => n.classList.add('hl')); }); c.addEventListener('pointerleave', () => { mv.unhot(); X.classList.remove('dim'); SA.$$('.hl', X).forEach((n) => n.classList.remove('hl')); }); });
    /* N–S schematic section (v1 s8: ≈40 m boulevard, ≈100 m site) */
    const S = SA.$('#syn-section');
    const svg = s('svg', { viewBox: '0 0 1200 250', class: 'sect-svg', role: 'img', 'aria-label': 'Schematic north–south section' }, S);
    const x = (m) => 40 + ((m + 60) / 262) * 1120, gz = (m) => 1238 - (m + 60) * 0; void gz;
    const ground = [[-60, 12], [0, 11], [42, 10.5], [142, 6.5], [157, 6], [200, 5]], Y = (h) => 205 - h * 7;
    const gp = ground.map(([m, h]) => x(m) + ' ' + Y(h)).join(' L');
    s('path', { d: 'M' + gp + ' L' + x(200) + ' 240 L' + x(-60) + ' 240Z', fill: 'var(--paper-3)' }, svg);
    s('path', { d: 'M' + gp, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.4, class: 'draw' }, svg);
    const gAt = (m) => { for (let i = 1; i < ground.length; i++) if (m <= ground[i][0]) { const [a, ha] = ground[i - 1], [b, hb] = ground[i]; return ha + ((m - a) / (b - a)) * (hb - ha); } return 5; };
    const tree = (m, h, r) => { const y = Y(gAt(m)); s('line', { x1: x(m), x2: x(m), y1: y, y2: y - h * 3.2, stroke: '#6B5B45', 'stroke-width': 1.5 }, svg); s('circle', { cx: x(m), cy: y - h * 4.2, r: r * 4, fill: '#8DB27A', opacity: 0.85 }, svg); };
    [-55, -45, -35, -25, -15].forEach((m) => tree(m, 13, 5)); [6, 20, 36].forEach((m) => tree(m, 14, 5)); [146, 154].forEach((m) => tree(m, 12, 4.5));
    [[55, 18, 7], [85, 14, 5], [112, 22, 9]].forEach(([m, w, h]) => s('rect', { x: x(m), y: Y(gAt(m + w / 2)) - h * 7, width: x(m + w) - x(m), height: h * 7, fill: 'none', stroke: 'var(--ink)', 'stroke-dasharray': '4 3' }, svg));
    s('rect', { x: x(162), y: Y(gAt(170)) - 16 * 7, width: x(198) - x(162), height: 16 * 7, fill: 'var(--lu-edu)', stroke: 'var(--ink)' }, svg);
    s('rect', { x: x(42), y: 18, width: x(142) - x(42), height: 222, fill: 'var(--site)', 'fill-opacity': 0.06 }, svg);
    [[-35, 'LALEH PARK'], [21, 'KESHAVARZ'], [92, 'SITE — TODAY PARKING (DEMOLISH)'], [150, 'POURSINA'], [180, 'UT']].forEach(([m, t]) => s('text', { x: x(m), y: 236, class: 'ax b', 'text-anchor': 'middle', text: t }, svg));
    const dimL = (a, b, t) => { s('line', { x1: x(a), x2: x(b), y1: 32, y2: 32, stroke: 'var(--ink)', 'marker-start': SA.marker(svg, 'sd', 'var(--ink)', 5), 'marker-end': SA.marker(svg, 'sd', 'var(--ink)', 5) }, svg); s('text', { x: (x(a) + x(b)) / 2, y: 26, class: 'ax b', 'text-anchor': 'middle', text: t }, svg); };
    dimL(0, 42, '≈ 40 m'); dimL(42, 142, '≈ 100 m');
    s('text', { x: x(-60), y: 20, class: 'ax', text: 'N ←  SCHEMATIC SECTION · VERTICAL EXAGGERATED · +1230 → +1226' }, svg);
    SA.prepDraw(S); SA.observe(S, () => SA.$$('.draw', S).forEach((p) => p.classList.add('on')));
  }

  /* ================= 19 DESIGN IMPLICATIONS ================= */
  function implications() {
    const mv = siteMap(SA.$('#impl-map'), { dark: true, view: [-95, -55, 110, 150], corners: { tl: 'Design implications', tr: 'requirements, not a design' } });
    const g = mv.layer('im'), P = (arr) => arr.map((q) => px(...q));
    const I = [
      { t: 'حائل سبز و آکوستیک در لبه‌ی کشاورز؛ درختان حفظ شوند.', e: 'Green / acoustic buffer on Keshavarz', band: [P([[494, 372], [640, 375], [965, 315]]), 13, '#6F9A57'], at: px(720, 330) },
      { t: 'لبه‌ی پورسینا با ردیف چنارها حفظ شود و رو به دانشگاه باز باشد.', e: 'Keep the Poursina edge, open to UT', band: [P([[1045, 790], [650, 915]]), 9, '#6F9A57'], at: px(860, 880) },
      { t: 'لبه‌ی غربی آرام و کم‌ارتفاع: بدون زمین روباز پرسروصدا و نور شب رو به مسکونی.', e: 'Quiet, lower west edge', band: [P([[500, 380], [520, 640], [560, 700], [600, 800], [630, 900]]), 10, '#C0504A'], at: px(470, 560) },
      { t: 'گوشه‌ی شمال‌شرقی (کشاورز × جلالیه) نقطه‌ی ورود اصلی پیاده و چهره‌ی عمومی.', e: 'NE corner = main pedestrian entry', circle: [px(955, 330), 6, '#4D9BE6'], at: px(955, 330) },
      { t: 'سرویس و امداد از جلالیه، از سمت پورسینا، جدا از مسیر پیاده.', e: 'Service via Jalalieh from Poursina', arrow: [P([[1120, 880], [1060, 700]]), '#C49A45'], at: px(1135, 905) },
      { t: 'جلالیه و زارع به‌عنوان ستون پیاده‌ی پارک–دانشگاه تقویت شوند.', e: 'Jalalieh + Zare\' = pedestrian spine', arrow: [P([[1000, 470], [980, 250]]), '#fff', true], arrow2: [P([[560, 660], [1030, 520]]), '#fff', true], at: px(1010, 420) },
      { t: 'حجم‌های بزرگ‌دهانه (سالن‌ها) رو به لبه‌ی نهادی جنوب/شرق؛ شکستن حجم برای هم‌مقیاسی.', e: 'Large-span halls toward S/E institutional edge', zone: [P([[760, 720], [960, 690], [985, 800], [790, 830]]), '#E8913A'], at: px(870, 760) },
      { t: 'فضای باز/روباز در میانه با محور بلند نزدیک شمال–جنوب برای کاهش خیرگی؛ محافظت در برابر آفتاب غرب.', e: 'Outdoor zone in the middle, long axis ≈ N–S', zone: [P([[600, 420], [820, 395], [850, 560], [630, 600]]), '#9EB48B'], at: px(720, 500) },
    ];
    const ol = SA.$('#impl-list');
    I.forEach((it, i) => {
      const id = 'im' + (i + 1), gg = s('g', { class: 'imp' }, g);
      if (it.band) s('path', { d: SA.d(it.band[0]), fill: 'none', stroke: it.band[2], 'stroke-width': it.band[1], 'stroke-opacity': 0.55, 'stroke-linecap': 'butt' }, gg);
      if (it.circle) { const q = SA.P(it.circle[0]); s('circle', { cx: q[0], cy: q[1], r: it.circle[1], fill: it.circle[2], 'fill-opacity': 0.8 }, gg); s('circle', { cx: q[0], cy: q[1], r: it.circle[1], fill: 'none', stroke: it.circle[2], class: 'ns ripple' }, gg); }
      [it.arrow, it.arrow2].forEach((a) => { if (a) s('path', { d: SA.d(a[0]), stroke: a[1], 'stroke-width': 2.6, fill: 'none', 'stroke-dasharray': a[2] ? '4 4' : null, class: 'ns' + (a[2] ? ' flow' : ''), 'marker-end': SA.marker(mv.svg, 'ahi' + i + (a === it.arrow2 ? 'b' : ''), a[1], 4) }, gg); });
      if (it.zone) s('path', { d: SA.d(it.zone[0], true), fill: it.zone[1], 'fill-opacity': 0.4, stroke: it.zone[1], 'stroke-dasharray': '4 3', class: 'ns' }, gg);
      const q = SA.P(it.at), mk = s('g', { transform: 'translate(' + q[0] + ' ' + q[1] + ')', class: 'swmk' }, gg);
      s('circle', { r: 7, fill: '#fff', stroke: 'var(--night)', 'stroke-width': 1 }, mk);
      s('text', { class: 'ent-t dark', 'text-anchor': 'middle', 'dominant-baseline': 'central', text: i + 1 }, mk);
      mv.hover(gg, { k: 'Implication ' + (i + 1), t: it.t, e: it.e }, id);
      const li = el('li', { tabindex: 0, 'data-g': id }, ol, '<span class="b">' + (i + 1) + '</span><div><span class="fa">' + it.t + '</span><span class="t-cap">' + it.e + '</span></div>');
      li.addEventListener('pointerenter', () => { mv.hot(id); ol.classList.add('dim'); li.classList.add('hot'); });
      li.addEventListener('pointerleave', () => { mv.unhot(); ol.classList.remove('dim'); li.classList.remove('hot'); });
      li.addEventListener('focus', () => { mv.hot(id); ol.classList.add('dim'); li.classList.add('hot'); });
      li.addEventListener('blur', () => { mv.unhot(); ol.classList.remove('dim'); li.classList.remove('hot'); });
      gg.style.opacity = 0; gg.style.transition = 'opacity .7s'; it.g = gg;
    });
    mv.onHot = (grp, on) => { ol.classList.toggle('dim', !!on); SA.$$('li', ol).forEach((li) => li.classList.toggle('hot', on && li.dataset.g === grp)); };
    const prev = mv.onRefresh;
    mv.onRefresh = (ppm) => { prev && prev(ppm); SA.$$('.swmk', mv.svg).forEach((m) => { const t = m.getAttribute('transform').replace(/ scale\([^)]*\)/, ''); m.setAttribute('transform', t + ' scale(' + (1.5 / ppm).toFixed(3) + ')'); }); };
    mv.refresh();
    SA.observe(mv.host, () => I.forEach((it, i) => setTimeout(() => (it.g.style.opacity = 1), 150 + i * 220)));
  }

  /* ================= 20 SOURCES & ARCHIVE ================= */
  function archive() {
    /* only sources taken from websites (the user's own material is not listed here) */
    const web = D.sources.filter(([, , u]) => u);
    web.push(['S2', 'Copernicus Sentinel-2 L2A, scene S2A_39SWV_20250831 (ESA), via the AWS open-data registry.', 'https://registry.opendata.aws/sentinel-2-l2a-cogs/']);
    web.push(['DEM', 'AWS Terrain Tiles (SRTM 30 m, terrarium encoding).', 'https://registry.opendata.aws/terrain-tiles/']);
    SA.$('#bib').innerHTML = web.map(([n, t, u]) => { let host = ''; try { host = new URL(u).hostname.replace(/^www\./, ''); } catch (e) { /* */ } return '<li><span class="n">' + n + '</span><span class="t">' + SA.esc(t) + '</span><a href="' + u + '" target="_blank" rel="noopener">' + host + ' ↗</a></li>'; }).join('');
  }


  SA.sections.push(() => swot('#swot-o', ['S', 'O']), () => swot('#swot-c', ['W', 'T']), synthesis, implications, archive);
})();
