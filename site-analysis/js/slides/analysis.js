/* Slides 06 movement · 07 land use · 08 green · 09 topography · 10 climate+sun · 11 wind/noise/air · 12 views · 13 field survey */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el, F = SA.F;
  const ST = G.streets, E = G.envelope, C = () => SA.SITE_C;
  const J0 = ST.Jalalieh[0], JS = ST.Jalalieh[ST.Jalalieh.length - 1];

  /* ================= 06 MOVEMENT + ACCESS ================= */
  SA.slides.move = function () {
    const mv = new SA.MapViewer(SA.$('#move-map'), { view: [-230, -640, 500, 300], zoom: true, grid: 50, corners: { tl: 'شبکه‌ی معابر و مسیرهای دسترسی', tr: 'ضخامت = سلسله‌مراتب · رنگ = کد کاربر' } });
    const b = mv.layer('b');
    s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)', 'fill-opacity': 0.45 }, b);
    s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.25 }, b);
    SA.features(mv, b, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', hover: false, dashUnc: false, style: () => ({ fill: 'var(--paper-3)' }) });
    const rd = mv.layer('r');
    ['Enghelab St', 'Vesal Shirazi St', 'Keshavarz Blvd', 'N. Kargar St'].forEach((n) => s('path', { d: SA.d(G.roads[n].p), fill: 'none', stroke: 'var(--ink)', 'stroke-opacity': 0.25, 'stroke-width': 2.4, class: 'ns' }, rd));
    SA.streets(mv, rd, ['Oghab', 'Yekom', 'DavoodTaheri', 'Nosrat', 'BahmanOrouji', 'Qods', '16Azar', 'Poursina', 'Enayat', 'Hedayati', 'ZareS', 'Zare', 'Jalalieh', 'Keshavarz']);
    SA.jalalieh(mv, rd);
    SA.site(mv, mv.layer('s'));
    SA.stations(mv, mv.layer('m'), 8);
    [[[188, 275], 'مترو بوستان لاله'], [[-51, -620], 'مترو میدان انقلاب'], [[-120, -575], 'خیابان انقلاب'], [[392, -380], 'قدس ↑'], [[-170, 185], 'بلوار کشاورز'], [[120, -300], 'دانشگاه تهران']].forEach(([p, t]) => mv.label(p, t, 'lbl-fa', { size: 11 }));
    const P = G.roads['Poursina St'].p, Q = G.roads['Qods St'].p;
    const R = [
      { en: 'پیاده · مترو', col: 'var(--site)', dash: '5 4', pts: [[188, 249], [150, 205], [100, 160], [J0[0] - 4, J0[1] + 24], J0, [J0[0] - 6, J0[1] - 12]],
        chain: [['مترو بوستان لاله (خط ۶)', '≈ ۲۸۰ متر از مرکز سایت'], ['عبور از بلوار کشاورز', 'بلوار جداشده‌ی دوطرفه'], ['اتصال پیاده‌ی جلالیه', '≈ ۲۰ متر؛ بسته برای خودرو'], ['گوشه‌ی شمال‌شرقی', 'ورودی عمومی بالقوه']] },
      { en: 'پیاده · دانشگاه', col: 'var(--pos)', dash: '5 4', pts: [[-51, -591], [110, -600], [-30, -190], [-85.5, -50], [-30, -32], P[1], [JS[0] - 4, JS[1] + 20]],
        chain: [['مترو میدان انقلاب (خط ۴)', '≈ ۶۳۰ متر'], ['انقلاب ← ۱۶ آذر', 'در امتداد نرده‌ی دانشگاه'], ['پورسینا', 'لبه‌ی چنارها، رو به دانشگاه'], ['جلالیه / عنایت', 'ورودی دانشجویان از جنوب']] },
      { en: 'خودرو · سرویس', col: 'var(--serv)', dash: null, pts: [[480, -610], Q[2], Q[1], [248, 65.6], P[1], [JS[0] - 3, JS[1] + 30]],
        chain: [['خیابان انقلاب', 'شریانی'], ['قدس · یک‌طرفه به شمال', 'OSM way 174845593'], ['پورسینا · یک‌طرفه به غرب', 'OSM way 174845590'], ['جلالیه · بن‌بست', 'سرویس و امداد (V)']] },
      { en: 'خودرو · کوچه‌های غرب', col: 'var(--hed)', dash: null, pts: [ST.Keshavarz[0], [-56, 99.6], ST.Hedayati[0], ST.Hedayati[1], ST.Hedayati[2], ST.ZareS[0], ST.ZareS[1]],
        chain: [['بلوار کشاورز', 'سواره‌روی جنوبی'], ['کوچه‌ی هدایتی', '≈ ۶۹ متر'], ['زارع — شاخه‌ی جنوبی', 'دسترسی ثانویه']] },
    ];
    const rg = mv.layer('routes');
    R.forEach((r) => {
      r.g = s('g', null, rg);
      s('path', { d: SA.d(r.pts), fill: 'none', stroke: 'var(--card)', 'stroke-width': 5, class: 'ns', 'stroke-linejoin': 'round', opacity: 0.85 }, r.g);
      r.path = SA.arrow(mv, r.g, r.pts, r.col, { w: 2.2, dash: r.dash, draw: !r.dash });
      r.dot = s('circle', { r: 4.5, fill: r.col, stroke: '#fff', 'stroke-width': 1.4, class: 'ns', opacity: 0 }, r.g);
    });
    /* PE entrances (analysis) */
    const eg = mv.layer('ent');
    const ent = (p, t, fill, tip) => { const m = SA.marker(mv, eg, p, t, { fill }); mv.hover(m, tip); };
    ent([J0[0] - 14, J0[1] - 8], 'ع', 'var(--ink)', { k: 'ورودی عمومی', t: 'گوشه‌ی شمال‌شرقی (کشاورز × جلالیه)', e: 'رو به پارک و مترو' });
    ent([JS[0] - 16, JS[1] + 14], 'د', 'var(--site)', { k: 'ورودی دانشجویان', t: 'جنوب‌شرق، از پورسینا/جلالیه', e: 'رو به دانشگاه' });
    ent([JS[0] - 4, JS[1] + 48], 'س', 'var(--serv)', { k: 'سرویس و امداد', t: 'جلالیه از سمت پورسینا', e: 'جدا از مسیر پیاده' });
    ent([-36, 36], 'ث', '#8A877F', { k: 'ورودی ثانویه', t: 'هدایتی / زارع', e: 'محدود؛ همسایه‌ی مسکونی' });
    SA.prepDraw(mv.host);
    const seg = SA.$('#move-seg'), chain = SA.$('#move-chain');
    let raf;
    const play = (k) => {
      cancelAnimationFrame(raf);
      SA.$$('button', seg).forEach((x, j) => x.setAttribute('aria-pressed', j === k ? 'true' : 'false'));
      R.forEach((r, j) => { r.g.style.opacity = j === k ? 1 : 0.12; r.path.classList.remove('on'); r.dot.setAttribute('opacity', 0); });
      const r = R[k]; void r.path.getBoundingClientRect(); r.path.classList.add('on');
      chain.innerHTML = r.chain.map((c, i) => '<li style="--c:' + r.col + '"><span class="n">' + SA.fa(i + 1) + '</span><div><b>' + c[0] + '</b><em>' + c[1] + '</em></div></li>').join('');
      const lis = SA.$$('li', chain), t0 = performance.now(), dur = SA.reduced ? 1 : 1800;
      const tick = (now) => {
        const t = Math.min(1, (now - t0) / dur), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, q = SA.P(SA.along(r.pts, e).p);
        r.dot.setAttribute('cx', q[0]); r.dot.setAttribute('cy', q[1]); r.dot.setAttribute('opacity', 1);
        const st = Math.min(lis.length - 1, Math.floor(e * lis.length * 0.999)); lis.forEach((li, i) => li.classList.toggle('on', i <= st));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    R.forEach((r, k) => { const x = el('button', { type: 'button', 'aria-pressed': 'false' }, seg, r.en); x.onclick = () => play(k); });
    SA.legend(SA.$('#move-legend'), [
      { kind: 'line', color: 'var(--kesh)', extra: 4.5, en: 'شریانی — کشاورز (دوطرفه)', fa: 'primary' },
      { kind: 'line', color: 'var(--pour)', extra: 2.8, en: 'جمع‌کننده — یک‌طرفه', fa: 'secondary' },
      { kind: 'line', color: 'var(--jal)', extra: 2, en: 'محلی — جلالیه، هدایتی، عنایت', fa: 'local' },
      { kind: 'line', color: '#fff', extra: 2, en: 'سرویس — زارع', fa: 'service' },
      { kind: 'dash', color: 'var(--ink)', en: 'پیوند پیاده', fa: 'pedestrian' },
    ]);
    SA.$('#move-legend').insertAdjacentHTML('beforeend', '<p class="t-cap">ع ورودی عمومی · د ورودی دانشجویان · س سرویس و امداد · ث ورودی ثانویه (پیشنهاد تحلیلی)</p>');
    const sec = SA.$('#move-map').closest('.slide');
    sec._enter = () => play(0);
  };

  /* ================= 07 LAND USE + TYPOLOGY ================= */
  SA.slides.lu = function () {
    const fr = SA.FRAME;
    const mv = new SA.MapViewer(SA.$('#lu-map'), { view: [fr[0] - 10, fr[1] - 5, fr[2] + 20, fr[3] + 5], zoom: true, grid: 10, corners: { tl: 'کاربری اراضی · قاب تصویر هوایی', tr: 'OSM + بناهای ردیابی‌شده' } });
    mv.aerial({ filter: 'grayscale(1) contrast(.6) brightness(1.25)', opacity: 0.3 });
    const hatch = SA.hatch(mv.svg, 'h-park', 'rgba(28,31,34,.35)', 3, 0.5);
    SA.features(mv, mv.layer('lu'), { style: (f) => (f.use === 'park' ? { fill: hatch, stroke: 'var(--mute)', 'stroke-width': 0.6, class: 'ns' } : { fill: SA.luFill(f.use), 'fill-opacity': f.kind === 'parcel' ? 0.55 : 0.95, stroke: 'var(--card)', 'stroke-width': 0.6, class: 'ns' }), group: (f) => 'lu-' + f.use });
    SA.streets(mv, mv.layer('st'), ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS'], { hover: false });
    SA.site(mv, mv.layer('s'), { fill: 'none', w: 2.4, hover: false });
    const sh = G.landuse.shares, keys = ['edu', 'park', 'res', 'unk', 'site', 'com', 'green', 'cult'];
    const data = keys.filter((k) => sh[k] > 0).map((k) => ({ k, v: sh[k], color: D.landuse[k].c, en: D.landuse[k].fa }));
    const tot = data.reduce((a, d) => a + d.v, 0);
    const dn = SA.donut(SA.$('#lu-donut'), data, { r: 80, w: 18, center: SA.fa((100 - sh.open).toFixed(0)) + '٪', sub: 'از قاب، نقشه‌شده' });
    SA.legend(SA.$('#lu-legend'), data.map((d) => ({ kind: 'rect', color: d.color, en: D.landuse[d.k].fa + ' — ' + SA.fa(((d.v / tot) * 100).toFixed(1)) + '٪', fa: '', k: d.k })), (it, on) => { if (on) { mv.hot('lu-' + it.k); dn.focus(it.k); } else { mv.unhot(); dn.focus(null); } });
    mv.onHot = (grp, on) => dn.focus(on && typeof grp === 'string' ? grp.replace('lu-', '') : null);
    /* figure-ground inset */
    const fg = new SA.MapViewer(SA.$('#fg-map'), { view: [fr[0], fr[1], fr[2], fr[3] - 60], corners: { tl: 'زمینه–نقش' }, scale: false, coords: false });
    const g = fg.layer('g');
    const dh = SA.hatch(fg.svg, 'h-dem', 'var(--mute)', 2.4, 0.5);
    SA.features(fg, g, { filter: (f) => f.kind === 'bldg', hover: false, dashUnc: false, style: (f) => (f.use === 'site' ? { fill: dh, stroke: 'var(--ink)', 'stroke-width': 0.6, 'stroke-dasharray': '2 1.5', class: 'ns' } : { fill: 'var(--ink)' }) });
    SA.site(fg, fg.layer('s'), { fill: 'none', hover: false, w: 1.6 });
    SA.kv(SA.$('#fg-kv'), [['سطح اشغال پیرامون', String(G.landuse.coverage), '%', 'قاب هوایی بدون نوار پارک؛ تقریبی'], ['ساخته‌شده در سایت', String(G.landuse.siteBuilt), '%', '۸ بنای کوتاه؛ همه تخریب'], ['ارتفاع مشاهده‌شده', '3–8', 'طبقه', 'از عکس‌ها؛ بلندترین‌ها کنار ۱۶ آذر'], ['لبه‌ها', '—', '', 'بدنه‌های کور جانبی، دیوار حیاط، نرده روی پاسنگ (عکس‌ها)']]);
    SA.$('#lu-note').textContent = 'سهم‌ها از مساحت نقشه‌شده در قاب تصویر هوایی (≈ ۶٫۱ هکتار)؛ ' + SA.fa(sh.open) + '٪ باقی‌مانده معابر، حیاط‌ها و قطعات بدون داده‌اند · صنعتی و اداری دیده نشد · خط‌چین = کاربری تأیید نشده';
  };

  /* ================= 08 GREEN ================= */
  SA.slides.green = function () {
    const mv = new SA.MapViewer(SA.$('#green-map'), { view: [-300, -330, 360, 360], zoom: true, grid: 50, corners: { tl: 'فضای سبز و باز', tr: 'OSM + ردیف درختان مشاهده‌شده' } });
    const b = mv.layer('b');
    const pk = s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)' }, b); mv.hover(pk, { k: 'سبز عمومی', t: 'بوستان لاله', big: '۳۵ هکتار', e: 'تأسیس ۱۹۶۶' });
    const cp = s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.3, stroke: 'var(--lu-edu)', class: 'ns' }, b); mv.hover(cp, { k: 'فضای باز محصور', t: 'پردیس دانشگاه تهران', big: '≈ ۲۰٫۸ هکتار' });
    SA.features(mv, b, { filter: (f) => f.kind === 'bldg', hover: false, dashUnc: false, style: () => ({ fill: 'var(--card)', stroke: 'var(--line)', 'stroke-width': 0.5, class: 'ns' }) });
    const hatch = SA.hatch(mv.svg, 'h-asph', 'rgba(28,31,34,.4)', 3, 0.5);
    [F('tums_parking'), F('site_parking')].forEach((f) => { const p = s('path', { d: SA.d(f.pts, true), fill: hatch, stroke: 'var(--mute)', 'stroke-width': 0.5, class: 'ns' }, b); mv.hover(p, { k: 'سطح آسفالت · پارکینگ', t: f.fa, big: '≈ ' + SA.fa(SA.fmt(SA.area(f.pts))) + ' m²' }); });
    SA.streets(mv, mv.layer('st'), ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh'], { hover: false, op: 0.7, arrows: false });
    SA.trees(mv.layer('t'), { r: 3.6, fill: '#6F9A57', op: 0.85, step: 8 });
    SA.site(mv, mv.layer('s'));
    SA.arrow(mv, mv.layer('l'), [[60, 300], [J0[0] - 4, J0[1] + 24], J0, JS, [60, -150]], 'var(--pos)', { w: 2.2, dash: '2 5', flow: true });
    mv.label([95, 262], 'پیوند سبز بالقوه', 'lbl-fa', { anchor: 'start', size: 12 });
    const A = SA.$('#green-areas'), tp = F('tums_parking');
    const items = [[350000, 'بوستان لاله', 'var(--lu-green)', '35 ha'], [208000, 'پردیس دانشگاه تهران', 'var(--lu-edu)', '≈ 20.8 ha'], [G.siteArea, 'سایت', 'var(--site)', '≈ 8,900 m²'], [SA.area(tp.pts), 'پارکینگ علوم پزشکی', 'var(--lu-park)', '≈ 4,900 m²']];
    const max = Math.sqrt(items[0][0]);
    items.forEach(([a, t, c, lab]) => el('div', { class: 'ar' }, A, '<div class="sq-w"><i style="width:' + ((Math.sqrt(a) / max) * 100).toFixed(2) + '%;background:' + c + '"></i></div><div><b>' + lab + '</b><span>' + t + '</span></div>'));
    SA.ferBlock(SA.$('#green-fer'), [
      ['ردیف چنار در کشاورز و پورسینا', 'سایه و حائل صدا', 'حفظ درختان لبه‌ها'],
      ['سایت یکسره آسفالت', 'جزیره‌ی گرمایی', 'زمین روباز با پوشش گیاهی و سایه'],
      ['پارک در شمال، پردیس در جنوب', 'پیوند سبز شمالی–جنوبی', 'کریدور سبز در امتداد جلالیه'],
    ]);
  };

  /* ================= 09 TOPOGRAPHY ================= */
  SA.slides.topo = function () {
    const H = SA.$('#topo-profile'), W = 1480, Ht = 286, x0 = 50, x1 = W - 20;
    const svg = s('svg', { viewBox: '0 0 ' + W + ' ' + Ht, class: 'prof-svg', preserveAspectRatio: 'none', role: 'img', 'aria-label': 'مقطع شمالی–جنوبی زمین' }, H);
    const yN = 950, yS = -650, X = (y) => x0 + ((yN - y) / (yN - yS)) * (x1 - x0);
    const zMin = 1200, zMax = 1245, Y = (z) => Ht - 44 - ((z - zMin) / (zMax - zMin)) * (Ht - 96);
    for (let z = 1205; z <= 1245; z += 5) { s('line', { x1: x0, x2: x1, y1: Y(z), y2: Y(z), stroke: 'var(--ink)', 'stroke-opacity': z % 10 ? 0.05 : 0.12 }, svg); if (z % 10 === 0) s('text', { x: x0 - 6, y: Y(z) + 3, class: 'ax', 'text-anchor': 'end', text: z }, svg); }
    [[950, 170, 'بوستان لاله', 'var(--lu-green)'], [170, 105, 'کشاورز', 'var(--kesh)'], [100, -20, 'سایت', 'var(--site)'], [-20, -35, '', 'var(--pour)'], [-35, -590, 'دانشگاه تهران', 'var(--lu-edu)'], [-590, -650, 'انقلاب', 'var(--mute)']].forEach(([a, b, t, c]) => {
      s('rect', { x: X(a), y: Ht - 30, width: X(b) - X(a), height: 5, fill: c }, svg); s('text', { x: (X(a) + X(b)) / 2, y: Ht - 8, class: 'axf', 'text-anchor': 'middle', text: t }, svg);
    });
    const band = (a, b, z0, z1, lab) => { s('rect', { x: X(a), y: Y(z1), width: X(b) - X(a), height: Math.max(2, Y(z0) - Y(z1)), fill: 'var(--ink)', 'fill-opacity': 0.06, stroke: 'var(--ink)', 'stroke-opacity': 0.35, 'stroke-dasharray': '3 3' }, svg); s('text', { x: (X(a) + X(b)) / 2, y: Y(z1) - 7, class: 'axf b', 'text-anchor': 'middle', text: lab }, svg); };
    band(900, 200, 1237, 1239, 'پارک ۱۲۳۷–۱۲۳۹ متر (بازه؛ موقعیت دقیق نامعلوم)');
    band(-60, -560, 1216, 1218, 'دانشگاه ≈ ۱۲۱۷ متر (بازه)');
    const d = 'M' + X(900) + ' ' + Y(1238) + ' L' + X(127.6) + ' ' + Y(1230) + ' L' + X(-28) + ' ' + Y(1226) + ' L' + X(-600) + ' ' + Y(1209);
    s('path', { d: d + ' L' + X(-600) + ' ' + (Ht - 36) + ' L' + X(900) + ' ' + (Ht - 36) + 'Z', fill: 'var(--ink)', 'fill-opacity': 0.05 }, svg);
    s('path', { d, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1.3, 'stroke-dasharray': '5 4', class: 'draw' }, svg);
    [[127.6, 1230], [-28, 1226], [-600, 1209]].forEach(([y, z]) => { s('circle', { cx: X(y), cy: Y(z), r: 4.5, fill: 'var(--card)', stroke: 'var(--ink)', 'stroke-width': 1.6 }, svg); s('text', { x: X(y), y: Y(z) - 11, class: 'ax b', 'text-anchor': 'middle', text: '+' + z }, svg); });
    s('rect', { x: X(100), y: Y(1231.5), width: X(-20) - X(100), height: Y(1224.5) - Y(1231.5), fill: 'var(--site)', 'fill-opacity': 0.14, stroke: 'var(--site)' }, svg);
    s('text', { x: x1, y: 18, class: 'axf', 'text-anchor': 'end', text: 'شمال ←  مقطع زمین از بوستان لاله تا خیابان انقلاب · SRTM ۳۰ متری · مقیاس قائم ≈ ×' + SA.fa((((Ht - 96) / (zMax - zMin)) / ((x1 - x0) / (yN - yS))).toFixed(0)) + ' · خط‌چین = درون‌یابی میان نمونه‌ها' }, svg);
    const sec = H.closest('.slide');
    sec._enter = () => SA.$$('.draw', H).forEach((p) => { p.classList.remove('on'); void p.getBoundingClientRect(); p.classList.add('on'); });
    /* plan with interpolated 1 m contours */
    const mv = new SA.MapViewer(SA.$('#topo-map'), { view: [-80, -45, 95, 140], grid: 10, corners: { tl: 'نقاط ارتفاعی SRTM', tr: 'منحنی‌ها درون‌یابی' } });
    SA.base(mv);
    const g = mv.layer('g'), defs = SA.defs(mv.svg), lg = s('linearGradient', { id: 'slope', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    s('stop', { offset: 0, 'stop-color': '#8A7B62', 'stop-opacity': 0.45 }, lg); s('stop', { offset: 1, 'stop-color': '#EDE6D6', 'stop-opacity': 0.25 }, lg);
    s('path', { d: SA.d(E, true), fill: 'url(#slope)' }, g);
    for (let z = 1226.5; z <= 1229.5; z += 0.5) { const y = -28 + ((z - 1226) / 4) * 155.6; s('path', { d: SA.d([[-75, y], [92, y]]), stroke: 'var(--ink)', 'stroke-width': z % 1 ? 0.4 : 0.8, 'stroke-opacity': 0.7, class: 'ns', fill: 'none' }, g); if (z % 1 === 0) mv.label([-66, y + 2.5], String(z), 'lbl', { anchor: 'start', size: 8.5 }); }
    SA.site(mv, mv.layer('s'), { fill: 'none' });
    [[[-5, 127.6], '+1230'], [[-5, -28], '+1226']].forEach(([p, t]) => { const q = SA.P(p); s('circle', { cx: q[0], cy: q[1], r: 1.8, fill: 'var(--ink)' }, g); mv.label([p[0] + 4, p[1] + 3], t, 'lbl', { anchor: 'start', size: 10 }); });
    SA.arrow(mv, g, [[40, 90], [40, 5]], 'var(--ink)', { w: 1.4 });
    const slope = (4 / 155.6) * 100;
    SA.kv(SA.$('#topo-kv'), [['شمال سایت', '1230', 'm', 'SRTM · 35.70765N'], ['جنوب سایت', '1226', 'm', 'SRTM · 35.70625N'], ['شیب در سایت', slope.toFixed(1), '%', '۴ متر در ≈۱۵۶ متر'], ['شیب منطقه‌ای', '≈ 3', '%', '۱۲۳۹ ← ۱۲۰۹ در ≈۱ km']]);
    SA.ferBlock(SA.$('#topo-fer'), [
      ['اختلاف ≈ ۴ متر شمال به جنوب', 'امکان تراز دوگانه', 'سالن‌های بزرگ کمی فرورفته در جنوب؛ کاهش ارتفاع دیداری'],
      ['زمین تقریباً مسطح', 'زمین روباز بدون خاک‌برداری زیاد', 'زمین‌ها در یک تراز میانی'],
      ['شیب رو به دانشگاه', 'دید و جریان آب به جنوب', 'گشودگی و زهکشی رو به پورسینا'],
    ]);
  };

  /* ================= 10 CLIMATE + SUN ================= */
  const LAT = 35.707, LON = 51.393, TZ = 3.5;
  SA.sunpos = function (doy, h) {
    const g = ((2 * Math.PI) / 365) * (doy - 1 + (h - 12) / 24);
    const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
    const eqt = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
    const tst = h * 60 + eqt + 4 * LON - 60 * TZ, ha = ((tst / 4 - 180) * Math.PI) / 180, lat = (LAT * Math.PI) / 180;
    const cz = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
    const z = Math.acos(Math.max(-1, Math.min(1, cz)));
    return { alt: 90 - (z * 180) / Math.PI, az: (Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) * 180) / Math.PI + 180 };
  };
  SA.daylight = function (doy) { let r = null, st = null; for (let m = 0; m < 1440; m += 2) { const a = SA.sunpos(doy, m / 60).alt; if (a > 0 && r == null) r = m / 60; if (a > 0) st = m / 60; } return { rise: r, set: st, len: st - r }; };
  const hm = (h) => { const H = Math.floor(h), M = Math.round((h - H) * 60); return SA.fa(H + ':' + String(M === 60 ? 0 : M).padStart(2, '0')); };
  SA.slides.sun = function () {
    const svg = SA.$('#sun-svg'), R = 112, c = C();
    const xy = (alt, az) => { const r = (R * (90 - alt)) / 90, a = (az * Math.PI) / 180; return [r * Math.sin(a), -r * Math.cos(a)]; };
    [0, 30, 60].forEach((a) => { s('circle', { r: (R * (90 - a)) / 90, fill: 'none', stroke: 'var(--night-line)', 'stroke-width': 0.6 }, svg); s('text', { x: 2, y: -(R * (90 - a)) / 90 - 2, class: 'ax d', text: a + '°' }, svg); });
    for (let az = 0; az < 360; az += 30) { const p = xy(0, az), q = xy(-10, az); s('line', { x1: 0, y1: 0, x2: p[0], y2: p[1], stroke: 'var(--night-line)', 'stroke-width': 0.4 }, svg); s('text', { x: q[0], y: q[1] + 3, class: 'ax d' + (az % 90 ? '' : ' b'), 'text-anchor': 'middle', text: { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[az] || az + '°' }, svg); }
    const sc = 1 / 2.4;
    s('path', { d: 'M' + E.map((p) => ((p[0] - c[0]) * sc).toFixed(1) + ' ' + (-(p[1] - c[1]) * sc).toFixed(1)).join('L') + 'Z', fill: 'rgba(46,134,222,.25)', stroke: 'var(--site)', 'stroke-width': 0.8 }, svg);
    /* western glare sector (afternoon, low sun) */
    const DAYS = [[172, '۳۱ خرداد', '#D9622B'], [80, 'اعتدال', '#D9A91A'], [355, '۱ دی', '#6FA8D6']];
    DAYS.forEach(([d, , col]) => { const P = []; for (let m = 0; m < 1440; m += 5) { const sp = SA.sunpos(d, m / 60); if (sp.alt > 0) P.push(xy(sp.alt, sp.az)); } s('path', { d: 'M' + P.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L'), fill: 'none', stroke: col, 'stroke-width': 1.5, class: 'draw' }, svg); for (let h = 6; h <= 18; h += 2) { const sp = SA.sunpos(d, h); if (sp.alt > 0) { const q = xy(sp.alt, sp.az); s('circle', { cx: q[0], cy: q[1], r: 1.5, fill: col }, svg); if (d === 172) s('text', { x: q[0] + 4, y: q[1] - 3, class: 'ax d', text: h + ':00' }, svg); } } });
    const cur = s('path', { fill: 'none', stroke: '#fff', 'stroke-width': 0.8, 'stroke-dasharray': '2 2' }, svg);
    const ray = s('line', { x1: 0, y1: 0, stroke: 'var(--sun)', 'stroke-width': 0.8 }, svg);
    const dot = s('circle', { r: 5.5, fill: 'var(--sun)', stroke: '#fff', 'stroke-width': 1.2 }, svg);
    /* plan: morning / noon / afternoon shadow of a 10 m element on the outdoor zone */
    const mv = new SA.MapViewer(SA.$('#sun-map'), { view: [-85, -45, 100, 140], corners: { tl: 'سایه‌ی یک عنصر ۱۰ متری · صبح / ظهر / عصر', tr: 'پلان · شمال بالا' } });
    SA.base(mv, { dark: true, buildings: false });
    SA.site(mv, mv.layer('s'), { fill: 'rgba(46,134,222,.15)', hover: false });
    const sg = mv.layer('sh'), times = [[9, 'صبح'], [13, 'ظهر'], [17, 'عصر']];
    const lines = times.map(([, t]) => ({ cs: s('line', { x1: c[0], y1: -c[1], stroke: '#fff', 'stroke-width': 4.5, 'stroke-linecap': 'round', class: 'ns', opacity: 0.85 }, sg), ln: s('line', { x1: c[0], y1: -c[1], stroke: '#0A0C0E', 'stroke-width': 2.8, 'stroke-linecap': 'round', class: 'ns' }, sg), lb: mv.label(c, '', 'lbl light', { size: 10, anchor: 'start', layer: 'sh' }), t }));
    s('circle', { cx: c[0], cy: -c[1], r: 1.6, fill: 'var(--sun)' }, sg);
    const glare = s('path', { fill: 'var(--sun)', 'fill-opacity': 0.12, stroke: 'var(--sun)', 'stroke-width': 0.8, 'stroke-dasharray': '3 3', class: 'ns' }, mv.layer('gl'));
    const glab = mv.label([-70, 45], 'خیرگی عصر ←', 'lbl-fa light', { anchor: 'start', size: 11, layer: 'gl' });
    /* controls */
    const ctl = SA.$('#sun-ctl');
    ctl.innerHTML = '<div class="seg" id="sun-days"></div><label>روز سال <output id="sun-dl"></output><input type="range" class="range" id="sun-day" min="1" max="365" value="172"></label><label>ساعت <output id="sun-hl"></output><input type="range" class="range" id="sun-hour" min="4.5" max="20" step="0.05" value="15"></label><button type="button" class="play" id="sun-play">▶ پخش روز</button>';
    const dayI = SA.$('#sun-day'), hI = SA.$('#sun-hour');
    DAYS.forEach(([d, t, col]) => { const x = el('button', { type: 'button', style: '--c:' + col }, SA.$('#sun-days'), t); x.onclick = () => { dayI.value = d; upd(); }; });
    const clim = SA.$('#clim');
    function upd() {
      const d = +dayI.value, h = +hI.value, sp = SA.sunpos(d, h), dl = SA.daylight(d);
      SA.$$('#sun-days button').forEach((x, i) => x.setAttribute('aria-pressed', DAYS[i][0] === d ? 'true' : 'false'));
      SA.$('#sun-dl').textContent = new Date(Date.UTC(2026, 0, d)).toLocaleDateString('fa-IR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
      SA.$('#sun-hl').textContent = hm(h);
      const P = []; for (let m = 0; m < 1440; m += 5) { const q = SA.sunpos(d, m / 60); if (q.alt > 0) P.push(xy(q.alt, q.az)); }
      cur.setAttribute('d', P.length ? 'M' + P.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join('L') : '');
      const q = xy(Math.max(sp.alt, -8), sp.az); dot.setAttribute('cx', q[0]); dot.setAttribute('cy', q[1]); dot.setAttribute('opacity', sp.alt > 0 ? 1 : 0.3); ray.setAttribute('x2', q[0]); ray.setAttribute('y2', q[1]);
      times.forEach(([t], i) => {
        const p = SA.sunpos(d, t), o = lines[i];
        if (p.alt <= 2) { o.cs.style.display = o.ln.style.display = 'none'; o.lb.textContent = ''; return; }
        o.cs.style.display = o.ln.style.display = '';
        const L = Math.min(10 / Math.tan((p.alt * Math.PI) / 180), 90), a = ((p.az + 180) * Math.PI) / 180, ex = c[0] + L * Math.sin(a), ey = c[1] + L * Math.cos(a);
        [o.cs, o.ln].forEach((l) => { l.setAttribute('x2', ex); l.setAttribute('y2', -ey); });
        o.lb.setAttribute('x', ex + 2); o.lb.setAttribute('y', -ey); o.lb.textContent = SA.fa(t) + ':۰۰ · ' + SA.fa(L.toFixed(1)) + ' m';
      });
      /* afternoon glare fan: sun azimuth range 15–18h (alt < 30°) */
      const fan = []; for (let t = 15; t <= 19; t += 0.25) { const p = SA.sunpos(d, t); if (p.alt > 0 && p.alt < 30) fan.push(p.az); }
      if (fan.length > 1) {
        const a0 = (Math.min(...fan) * Math.PI) / 180, a1 = (Math.max(...fan) * Math.PI) / 180, r = 70, W0 = [c[0] + r * Math.sin(a0), c[1] + r * Math.cos(a0)], W1 = [c[0] + r * Math.sin(a1), c[1] + r * Math.cos(a1)];
        glare.setAttribute('d', SA.d([c, W0, W1], true)); glab.textContent = 'خیرگی عصر (ارتفاع خورشید < ۳۰°)';
      } else { glare.setAttribute('d', ''); glab.textContent = ''; }
      let noon = 0; for (let m = 600; m < 840; m += 2) noon = Math.max(noon, SA.sunpos(d, m / 60).alt);
      clim.innerHTML = '<div><div class="k">ارتفاع خورشید</div><div class="v">' + (sp.alt > 0 ? sp.alt.toFixed(1) + '°' : '—') + '</div></div><div><div class="k">سمت</div><div class="v">' + sp.az.toFixed(0) + '°</div></div>' +
        '<div><div class="k">طلوع · غروب</div><div class="v" style="font-size:20px">' + hm(dl.rise) + ' · ' + hm(dl.set) + '</div></div><div><div class="k">ارتفاع ظهر</div><div class="v">' + noon.toFixed(1) + '°</div></div>' +
        '<div><div class="k">اقلیم</div><div class="v">BSk</div></div><div><div class="k">بارش سالانه</div><div class="v">240<small>mm</small></div></div>' +
        '<div><div class="k">میانگین حداکثر تیر</div><div class="v">36.9<small>°C</small></div></div><div><div class="k">میانگین حداقل دی</div><div class="v">1.3<small>°C</small></div></div>' +
        '<div class="sunrd">آفتاب سالانه ≈ ۳٬۰۱۰ ساعت · مهرآباد ۱۹۹۱–۲۰۲۰</div>';
    }
    dayI.oninput = upd; hI.oninput = upd; upd();
    let playing = null;
    SA.$('#sun-play').onclick = function () {
      if (playing) { cancelAnimationFrame(playing); playing = null; this.textContent = '▶ پخش روز'; return; }
      this.textContent = '❚❚ توقف'; let h = 4.6, last = performance.now();
      const st = (now) => { h += ((now - last) / 1000) * 1.6; last = now; if (h > 19.8) h = 4.6; hI.value = h; upd(); playing = requestAnimationFrame(st); };
      playing = requestAnimationFrame(st);
    };
    SA.ferBlock(SA.$('#sun-fer'), [
      ['آفتاب کم‌ارتفاع عصر از غرب', 'خیرگی و گرما برای ورزش روباز', 'محور بلند زمین‌ها نزدیک شمال–جنوب؛ سایه‌بان غربی'],
      ['تابش زیاد در جبهه‌ی جنوبی', 'گرمای تابستان، فرصت زمستان', 'سایبان افقی جنوبی؛ فضاهای زمستانی رو به جنوب'],
      ['سایه‌های بلند زمستان', 'سایه‌ی بناهای جنوبی روی زمین', 'زمین روباز دور از لبه‌ی بلند جنوبی'],
    ]);
    const sec = svg.closest('.slide');
    sec._enter = () => SA.$$('.draw', svg).forEach((p, i) => { p.classList.remove('on'); void p.getBoundingClientRect(); setTimeout(() => p.classList.add('on'), i * 200); });
    sec._leave = () => { if (playing) SA.$('#sun-play').click(); };
  };

  /* ================= 11 WIND · NOISE · AIR ================= */
  SA.slides.env = function () {
    const mv = new SA.MapViewer(SA.$('#env-map'), { view: [-175, -130, 185, 215], zoom: true, grid: 10, corners: { tl: 'باد، صدا و هوا', tr: 'ایستگاه مهرآباد ≈ ۱۰ km غرب' } });
    SA.base(mv, { dark: true });
    SA.streets(mv, mv.layer('st'), ['16Azar', 'Qods', 'Poursina', 'Enayat', 'Hedayati', 'Jalalieh', 'Zare', 'ZareS', 'Keshavarz'], { hover: false, op: 0.9 });
    SA.site(mv, mv.layer('s'), { fill: 'rgba(46,134,222,.2)', hover: false });
    /* noise: hatched edge bands (qualitative) */
    const nz = mv.layer('noise');
    const HI = SA.hatch(mv.svg, 'nh', '#E0685E', 3, 1.1), MD = SA.hatch(mv.svg, 'nm', '#E8A05A', 4, 0.9), LO = SA.hatch(mv.svg, 'nl', '#EFD27E', 5, 0.7);
    const band = (pts, w, pat, lvl) => { const p = s('path', { d: SA.d(pts), fill: 'none', stroke: pat, 'stroke-width': w, 'stroke-linecap': 'butt', opacity: 0.9 }, nz); mv.hover(p, { k: 'صدا · ' + lvl, t: { زیاد: 'کشاورز و آژیر آتش‌نشانی', متوسط: '۱۶ آذر، پورسینا، قدس', کم: 'جلالیه و کوچه‌ها' }[lvl], src: 'کیفی؛ بدون اندازه‌گیری دسی‌بل' }, 'nz' + lvl); };
    band(ST.Keshavarz, 34, HI, 'زیاد'); band(ST['16Azar'], 16, MD, 'متوسط'); band(ST.Poursina, 16, MD, 'متوسط'); band(ST.Qods, 16, MD, 'متوسط');
    ['Jalalieh', 'Hedayati', 'Enayat'].forEach((n) => band(ST[n], 9, LO, 'کم'));
    const fs = SA.centroid(F('fire_station').pts); const fq = SA.P(fs);
    for (let i = 0; i < 3; i++) s('circle', { cx: fq[0], cy: fq[1], r: 8, fill: 'none', stroke: '#E0685E', 'stroke-width': 1.1, class: 'ns siren', style: 'animation-delay:' + i * 0.8 + 's' }, nz);
    mv.label([fs[0] + 16, fs[1]], 'آتش‌نشانی · آژیر', 'lbl-fa light', { anchor: 'start', size: 11, layer: 'noise' });
    /* wind: thin curved flow lines with arrowheads */
    const wg = mv.layer('wind'), lines = [];
    for (let i = -5; i <= 5; i++) {
      const base = [], d = [Math.SQRT1_2, Math.SQRT1_2], n = [-Math.SQRT1_2, Math.SQRT1_2];
      for (let t = -260; t <= 260; t += 20) { const bend = 8 * Math.sin((t + i * 40) / 60); base.push([C()[0] + d[0] * t + n[0] * (i * 30 + bend), C()[1] + d[1] * t + n[1] * (i * 30 + bend)]); }
      lines.push(base);
    }
    const wl = lines.map((pts) => SA.arrow(mv, wg, pts, '#8FC4EC', { w: 1.1 }));
    wl.forEach((p) => p.classList.add('wflow'));
    const wlab = mv.label([-150, -110], '', 'lbl-fa light', { anchor: 'start', size: 12, layer: 'wind' });
    const setWind = (night) => {
      lines.forEach((pts, i) => { wl[i].setAttribute('d', SA.dSmooth(night ? pts.slice().reverse() : pts)); wl[i].setAttribute('stroke', night ? '#B7ACEB' : '#8FC4EC'); });
      wlab.textContent = night ? 'شب: از شمال‌شرق (کوه به دشت)' : 'روز: از جنوب‌غرب (دشت به کوه)';
    };
    setWind(false);
    const modes = [['باد روز', () => { mv.toggle('wind', true); mv.toggle('noise', false); setWind(false); }], ['باد شب', () => { mv.toggle('wind', true); mv.toggle('noise', false); setWind(true); }], ['صدا', () => { mv.toggle('wind', false); mv.toggle('noise', true); }], ['همه', () => { mv.toggle('wind', true); mv.toggle('noise', true); setWind(false); }]];
    const seg = SA.$('#env-seg');
    modes.forEach(([t, fn], i) => { const x = el('button', { type: 'button', 'aria-pressed': i === 3 ? 'true' : 'false' }, seg, t); x.onclick = () => { SA.$$('button', seg).forEach((y) => y.setAttribute('aria-pressed', y === x ? 'true' : 'false')); fn(); }; });
    SA.kv(SA.$('#env-kv'), [['باد غالب سالانه', 'SW', '', 'مهرآباد ۲۰۱۵–۲۰۲۶ [10]'], ['میانگین سالانه', '≈ 8', 'kt', '≈ ۴٫۱ متر بر ثانیه'], ['PM2.5 سالانه', '30–32', 'µg/m³', '≈ ۳ برابر رهنمود WHO [13]'], ['سهم خودروها', '84', '%', 'اوج آلودگی آذر–دی (وارونگی)']]);
    SA.ferBlock(SA.$('#env-fer'), [
      ['جریان SW–NE', 'پتانسیل تهویه‌ی طبیعی', 'نفوذپذیری و بازشوها در امتداد SW–NE'],
      ['لبه‌ی پرصدای کشاورز', 'مزاحمت برای آموزش', 'حائل سبز + فعالیت‌های فعال/پرصدا در این لبه'],
      ['لبه‌های کم‌صدای کوچه‌ای', 'آرامش', 'کلاس‌ها و فضاهای حساس رو به کوچه‌ها'],
      ['PM2.5 بالا در آذر–دی', 'محدودیت ورزش روباز زمستان', 'سالن سرپوشیده با تهویه‌ی فیلتردار'],
    ]);
  };

  /* ================= 12 VIEWS ================= */
  SA.slides.views = function () {
    const mv = new SA.MapViewer(SA.$('#views-map'), { view: [-130, -90, 140, 190], zoom: true, grid: 10, corners: { tl: 'دیدها از سایت', tr: 'سبز = مثبت · قرمز = منفی' } });
    SA.base(mv);
    SA.streets(mv, mv.layer('st'), ['Keshavarz', 'Poursina', '16Azar', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS'], { hover: false, op: 0.6, arrows: false });
    SA.site(mv, mv.layer('s'), { hover: false });
    const c = C(), vg = mv.layer('v');
    const V = [
      { dir: 0, r: 105, w: 50, pos: 1, t: 'شمال ← بوستان لاله', why: 'از طبقات بالاتر، بالای تاج درختان بلوار', rsp: 'فضاهای جمعی و سالن‌ها با دید به پارک', page: 30, from: [5, 70] },
      { dir: 197, r: 90, w: 55, pos: 1, t: 'جنوب ← پردیس و چنارهای پورسینا', why: 'لبه‌ی سبز و نهادی روبه‌رو', rsp: 'جبهه‌ی آموزشی باز رو به جنوب', page: 12, from: [10, 0] },
      { dir: 340, r: 70, w: 18, pos: 1, t: 'محور جلالیه ← بلوار', why: 'دید خطی در امتداد ستون پیاده', rsp: 'تقویت ورودی شمال‌شرقی', page: 27, from: [70, 40] },
      { dir: 270, r: 58, w: 40, pos: 0, t: 'غرب ← بدنه‌های کور', why: 'پشت ساختمان‌های مسکونی، اشراف', rsp: 'لبه‌ی بسته/سبز، بدون بازشوی مستقیم', page: 17, from: [-30, 45] },
      { dir: 90, r: 52, w: 35, pos: 0, t: 'شرق ← پارکینگ علوم پزشکی', why: 'نماهای پشتی و سطح آسفالت', rsp: 'غربال گیاهی؛ خدمات در این جبهه', page: 14, from: [55, 55] },
    ];
    const L = SA.$('#views-list');
    V.forEach((v, i) => {
      const o = [c[0] + v.from[0] - 10, v.from[1]], q = SA.P(o), a0 = ((v.dir - v.w / 2 - 90) * Math.PI) / 180, a1 = ((v.dir + v.w / 2 - 90) * Math.PI) / 180, col = v.pos ? 'var(--pos)' : 'var(--neg)';
      const d = 'M' + q[0] + ' ' + q[1] + ' L' + (q[0] + v.r * Math.cos(a0)) + ' ' + (q[1] + v.r * Math.sin(a0)) + ' A' + v.r + ' ' + v.r + ' 0 0 1 ' + (q[0] + v.r * Math.cos(a1)) + ' ' + (q[1] + v.r * Math.sin(a1)) + 'Z';
      const p = s('path', { d, fill: col, 'fill-opacity': v.pos ? 0.16 : 0, stroke: col, 'stroke-width': 1, 'stroke-dasharray': v.pos ? null : '3 3', class: 'ns' }, vg);
      if (!v.pos) p.setAttribute('fill', SA.hatch(mv.svg, 'vh', 'rgba(168,68,60,.45)', 3, 0.6));
      SA.arrow(mv, vg, [o, [o[0] + v.r * 0.85 * Math.sin((v.dir * Math.PI) / 180), o[1] + v.r * 0.85 * Math.cos((v.dir * Math.PI) / 180)]], col, { w: 1.2 });
      SA.marker(mv, vg, [o[0] + v.r * 0.55 * Math.sin((v.dir * Math.PI) / 180) + 6, o[1] + v.r * 0.55 * Math.cos((v.dir * Math.PI) / 180)], 'V' + (i + 1), { fill: col });
      mv.hover(p, { k: (v.pos ? 'دید مثبت' : 'دید منفی') + ' · V' + (i + 1), t: v.t, rows: [['دلیل', v.why], ['پاسخ', v.rsp]], img: 'img/thumbs/pdf_page_' + String(v.page).padStart(2, '0') + '.jpg' }, 'v' + i);
      const it = el('div', { class: 'vl ' + (v.pos ? 'pos' : 'neg'), tabindex: 0 }, L, '<span class="b">V' + (i + 1) + '</span><div><b>' + v.t + '</b><span class="why">' + v.why + '</span><span class="rsp">پاسخ: ' + v.rsp + '</span></div>');
      SA.photo(it, SA.photoList, SA.photoList.findIndex((x) => x.page === v.page));
      const on = () => mv.hot('v' + i), off = () => mv.unhot();
      it.addEventListener('pointerenter', on); it.addEventListener('pointerleave', off); it.addEventListener('focus', on); it.addEventListener('blur', off);
    });
  };

  /* ================= 13 FIELD SURVEY ================= */
  SA.slides.survey = function () {
    const mv = new SA.MapViewer(SA.$('#survey-map'), { view: [-140, -130, 290, 170], zoom: true, grid: 10, corners: { tl: 'نقشه‌ی کلید — بازترسیم برداری', tr: 'شماره‌ها = شماره‌های شما' } });
    const b = mv.layer('b');
    SA.features(mv, b, { filter: (f) => f.kind === 'parcel' || f.use !== 'site', hover: false, dashUnc: false, style: (f) => ({ fill: f.use === 'green' ? 'var(--lu-green)' : f.kind === 'parcel' ? 'var(--paper-2)' : 'var(--paper-3)', 'fill-opacity': f.use === 'green' ? 0.5 : 1 }) });
    SA.streets(mv, mv.layer('st'), ['Qods', 'Yekom', 'Nosrat', 'DavoodTaheri', 'Oghab', 'BahmanOrouji', '16Azar', 'Poursina', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS', 'Keshavarz'], { hover: false });
    SA.site(mv, mv.layer('s'), { hover: false });
    const cg = mv.layer('cones'), mg = mv.layer('marks');
    const byNo = {};
    D.photos.forEach((p) => { if (p.xy) { const k = p.no.replace(/[()]/g, ''); (byNo[k] = byNo[k] || []).push(p); } });
    const wall = SA.$('#photo-wall'), thumbs = [];
    const hot = (no) => { mv.hot('no-' + no); thumbs.forEach((t) => { t.b.classList.toggle('hot', t.no === no); t.b.classList.toggle('dim', t.no !== no); }); };
    const cold = () => { mv.unhot(); thumbs.forEach((t) => t.b.classList.remove('hot', 'dim')); };
    D.stations.forEach((st) => {
      const ps = byNo[st.no] || [], q = SA.P(st.xy);
      ps.forEach((p) => {
        if (p.dir == null) return;
        const R = 24, a0 = ((p.dir - 26 - 90) * Math.PI) / 180, a1 = ((p.dir + 26 - 90) * Math.PI) / 180;
        const cone = s('path', { d: 'M' + q[0] + ' ' + q[1] + ' L' + (q[0] + R * Math.cos(a0)) + ' ' + (q[1] + R * Math.sin(a0)) + ' A' + R + ' ' + R + ' 0 0 1 ' + (q[0] + R * Math.cos(a1)) + ' ' + (q[1] + R * Math.sin(a1)) + 'Z', fill: p.conf === 'uncertain' ? 'none' : 'var(--site)', 'fill-opacity': 0.15, stroke: 'var(--site)', 'stroke-width': 0.8, 'stroke-dasharray': p.conf === 'uncertain' ? '2 2' : null, class: 'ns', style: 'cursor:zoom-in' }, cg);
        mv.hover(cone, { k: 'عکس ' + SA.fa(st.no) + ' · جهت ≈ ' + SA.fa(p.dir) + '°', t: p.fa, img: 'img/thumbs/pdf_page_' + String(p.page).padStart(2, '0') + '.jpg' }, 'no-' + st.no);
        cone.addEventListener('click', () => SA.openPage(p.page));
      });
      const unknown = ps.length && ps.every((p) => p.dir == null);
      const m = SA.marker(mv, mg, st.xy, SA.fa(st.no), { fill: st.missing || unknown ? 'var(--card)' : 'var(--ink)', stroke: 'var(--ink)', color: st.missing || unknown ? 'var(--ink)' : '#fff' });
      if (st.missing) m.querySelector('circle').setAttribute('stroke-dasharray', '2 2');
      m.setAttribute('tabindex', st.missing ? -1 : 0); m.style.cursor = st.missing ? 'default' : 'pointer';
      mv.hover(m, st.missing ? { k: 'ایستگاه ۱۳', t: 'روی نقشه‌ی کلید هست ولی در PDF نیست' } : { k: 'ایستگاه ' + SA.fa(st.no) + ' · ' + SA.fa(ps.length) + ' قاب', t: ps[0] ? ps[0].fa : '', img: ps[0] ? 'img/thumbs/pdf_page_' + String(ps[0].page).padStart(2, '0') + '.jpg' : null }, 'no-' + st.no);
      if (!st.missing) {
        m.addEventListener('pointerenter', () => hot(st.no)); m.addEventListener('pointerleave', cold);
        m.addEventListener('click', () => SA.viewer.open(SA.photoList, SA.photoList.findIndex((x) => x.pno === st.no)));
        m.addEventListener('keydown', (e) => { if (e.key === 'Enter') SA.viewer.open(SA.photoList, SA.photoList.findIndex((x) => x.pno === st.no)); });
      }
    });
    const order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '—'];
    order.forEach((no) => SA.photoList.forEach((p, i) => { if (p.pno !== no) return; const t = SA.photo(wall, SA.photoList, i, { no: no === '—' ? 'تکمیلی' : SA.fa(no) }); thumbs.push({ b: t, no }); t.addEventListener('pointerenter', () => hot(no)); t.addEventListener('pointerleave', cold); }));
    /* fit ALL photos in the panel at their true aspect ratio: largest common row height that fits (no crop) */
    const fitWall = () => {
      const W = wall.clientWidth, H = wall.clientHeight, gap = 5, ars = thumbs.map((t) => { const i = t.b.querySelector('img'); return (+i.getAttribute('width') || 3) / (+i.getAttribute('height') || 4); });
      if (!W || !H) return;
      let lo = 20, hi = 260;
      const fits = (h) => { let x = 0, rows = 1; ars.forEach((ar) => { const w = Math.min(ar * h, W); if (x > 0 && x + w > W) { rows++; x = 0; } x += w + gap; }); return rows * (h + gap) - gap <= H; };
      for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (fits(m)) lo = m; else hi = m; }
      thumbs.forEach((t, i) => { t.b.style.height = Math.floor(lo) + 'px'; t.b.style.maxWidth = W + 'px'; void ars[i]; });
    };
    const sec = wall.closest('.slide');
    sec._enter = fitWall; fitWall();
  };
})();
