/* Slides: start · 01 location · 02 urban · 03 UT + setting · 04 UT concept · 05 adjacency  (+ shared photo helpers) */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el, F = SA.F;
  SA.slides = SA.slides || {};
  const E = G.envelope, C = () => SA.SITE_C;
  const faN = (x) => SA.fa(x);

  /* ---------- photos: original aspect ratio, never cropped ---------- */
  const pad = (n) => String(n).padStart(2, '0');
  SA.photoList = D.photos.map((p) => ({
    src: 'img/photos/pdf_page_' + pad(p.page) + '.jpg', thumb: 'img/thumbs/pdf_page_' + pad(p.page) + '.jpg',
    fa: (p.no === '—' ? 'تکمیلی، بی‌شماره — ' : 'عکس ' + SA.fa(p.no.replace(/[()]/g, '')) + ' — ') + p.fa,
    en: 'PDF p.' + p.page + (p.dir != null ? ' · view ≈ ' + p.dir + '° (' + p.conf + ')' : ' · view direction: ' + p.conf),
    no: p.no === '—' ? 'بی‌شماره' : 'عکس ' + SA.fa(p.no.replace(/[()]/g, '')), group: 'برداشت میدانی', page: p.page, pno: p.no.replace(/[()]/g, ''),
    w: (window.SA_IMG['pdf_page_' + pad(p.page)] || [3, 4])[0], h: (window.SA_IMG['pdf_page_' + pad(p.page)] || [3, 4])[1],
  }));
  SA.openPage = (page) => SA.viewer.open(SA.photoList, Math.max(0, SA.photoList.findIndex((x) => x.page === page)));
  SA.photo = function (host, list, k, o) {
    o = o || {};
    const it = list[k];
    const b = el('button', { type: 'button', class: 'ph', 'aria-label': 'نمایش تمام‌صفحه: ' + (it.fa || '') }, host);
    const img = el('img', { src: it.thumb || it.src, alt: it.fa || '', loading: 'lazy', decoding: 'async' }, b);
    if (it.w && it.h) { img.width = it.w; img.height = it.h; }
    if (o.no) el('span', { class: 'no' }, b, o.no);
    b.addEventListener('click', () => SA.viewer.open(list, k));
    return b;
  };
  SA.ferBlock = function (host, rows, head) {
    host.innerHTML = (head !== false ? '<div class="fer-h">یافته ← اثر ← پاسخ طراحی</div>' : '') +
      rows.map((r) => '<div class="fr"><span>' + r[0] + '</span><span class="ar">←</span><span>' + r[1] + '</span><span class="ar">←</span><span class="rsp">' + r[2] + '</span></div>').join('');
  };
  SA.kv = function (host, rows) {
    host.innerHTML = rows.map(([k, v, u, d]) => '<div><div class="k">' + k + '</div><div class="v">' + v + (u ? '<small>' + u + '</small>' : '') + '</div>' + (d ? '<div class="d">' + d + '</div>' : '') + '</div>').join('');
  };

  /* ================= START ================= */
  SA.slides.start = function () {
    const host = SA.$('#start-map');
    const mv = new SA.MapViewer(host, { view: [-230, -140, 170, 200], fit: 'xMidYMid slice', north: false, scale: false, coords: false, grid: 10 });
    const g = mv.layer('b');
    SA.features(mv, g, { hover: false, dashUnc: false, style: (f) => ({ fill: f.use === 'green' ? 'rgba(158,180,139,.10)' : f.kind === 'parcel' ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)', stroke: 'rgba(255,255,255,.22)', 'stroke-width': 0.6, class: 'ns' }) });
    SA.trees(g, { fill: 'rgba(158,180,139,.35)', r: 2.6 });
    SA.streets(mv, mv.layer('st'), ['16Azar', 'Qods', 'Poursina', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS', 'Keshavarz', 'Oghab', 'Yekom', 'DavoodTaheri', 'Nosrat', 'BahmanOrouji'], { hover: false, op: 0.85, draw: true, arrows: false });
    SA.site(mv, mv.layer('s'), { hover: false, fill: 'rgba(46,134,222,.25)', w: 2.2, draw: true });
    const sec = host.closest('.slide');
    sec._enter = () => SA.$$('.draw', host).forEach((p, i) => { p.classList.remove('on'); void p.getBoundingClientRect(); setTimeout(() => p.classList.add('on'), 150 + i * 60); });
  };

  /* ================= 01 LOCATION ================= */
  SA.slides.loc = function (sec) {
    const stage = SA.$('#loc-stage'), frames = [];
    const mk = (view, corners, extra) => { const f = el('div', { class: 'zf' }, stage); const mv = new SA.MapViewer(f, Object.assign({ view, corners, coords: false }, extra)); frames.push({ f, mv }); return mv; };
    const K = Math.cos((32 * Math.PI) / 180), ll = (lon, lat) => [lon * K, lat];
    /* 1 Iran */
    const m1 = mk([43.5 * K, 24.5, 64 * K, 40.5], { tl: '۱ · ایران', tr: 'Natural Earth' }, { scale: false });
    const g1 = m1.layer('p');
    G.iran.forEach((pv) => pv.r.forEach((ring) => { const p = s('path', { d: SA.d(ring.map((q) => ll(q[0], q[1])), true), fill: pv.n === 'Tehran' ? 'var(--site)' : 'var(--paper-3)', stroke: 'var(--card)', 'stroke-width': 0.7, class: 'ns' }, g1); m1.hover(p, { k: 'استان', e: pv.n }, 'pv' + pv.n); }));
    m1.label(ll(51.39, 36.4), 'تهران', 'lbl-fa'); m1.label(ll(55.2, 32.3), 'ایران', 'lbl-fa', { size: 17 });
    const t1 = SA.P(ll(51.39, 35.7)); frames[0].mark = s('circle', { cx: t1[0], cy: t1[1], r: 0.22, fill: '#fff', stroke: 'var(--ink)', 'stroke-width': 0.08 }, g1);
    /* 2 Tehran */
    const all = [].concat(...Object.values(G.districts));
    const bx = [Math.min(...all.map((p) => p[0])), Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[0])), Math.max(...all.map((p) => p[1]))];
    const m2 = mk([bx[0] - 1200, bx[1] - 1500, bx[2] + 1200, bx[3] + 1500], { tl: '۲ · تهران · ۲۲ منطقه', tr: 'OSM' });
    const g2 = m2.layer('d');
    for (const k in G.districts) {
      const P = G.districts[k], is6 = k === '6';
      const p = s('path', { d: SA.d(P, true), fill: is6 ? 'var(--site)' : 'var(--paper-3)', stroke: 'var(--card)', 'stroke-width': 1.2, class: 'ns' }, g2);
      m2.hover(p, { k: 'منطقه‌ی شهرداری', t: 'منطقه‌ی ' + faN(k), big: faN(G.districtArea[k]) + ' km²' }, 'd' + k);
      m2.label(SA.centroid(P), faN(k), 'lbl-fa' + (is6 ? ' light' : ''), { size: is6 ? 13 : 10 });
    }
    frames[1].mark = s('circle', { cx: 0, cy: -40, r: 200, fill: 'none' }, g2);
    /* 3 District 6 */
    const d6 = G.districts['6'], xs = d6.map((p) => p[0]), ys = d6.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, r = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2 + 300;
    const m3 = mk([cx - r, cy - r, cx + r, cy + r], { tl: '۳ · منطقه‌ی ۶ · ۲۱٫۴ km²', tr: 'OSM rel. 6729037' });
    const g3 = m3.layer('d');
    s('path', { d: SA.d(d6, true), fill: 'rgba(46,134,222,.06)', stroke: 'var(--site)', 'stroke-width': 1.3, class: 'ns' }, g3);
    s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)' }, g3);
    s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.7 }, g3);
    SA.roadsCtx(g3, 1); SA.stations(m3, g3, 6);
    frames[2].mark = s('circle', { cx: C()[0], cy: -C()[1], r: 55, fill: 'var(--site)', stroke: '#fff', 'stroke-width': 2, class: 'ns' }, g3);
    /* 4 UT / Laleh */
    const m4 = mk([-800, -760, 800, 840], { tl: '۴ · بوستان لاله ↔ دانشگاه تهران', tr: 'OSM' });
    const g4 = m4.layer('d');
    s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)' }, g4);
    s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.75 }, g4);
    SA.roadsCtx(g4, 1.3); SA.stations(m4, g4, 7);
    s('path', { d: SA.d(E, true), fill: 'var(--site)', stroke: 'var(--ink)', 'stroke-width': 0.8, class: 'ns' }, g4);
    m4.label([-40, 470], 'بوستان لاله', 'lbl-fa', { size: 13 }); m4.label([160, -310], 'دانشگاه تهران', 'lbl-fa', { size: 13 });
    frames[3].mark = s('circle', { cx: C()[0], cy: -C()[1], r: 30, fill: 'none' }, g4);
    /* 5 Site */
    const m5 = mk([-95, -60, 110, 150], { tl: '۵ · سایت', tr: 'تصویر هوایی + حاشیه‌نویسی کاربر' });
    SA.base(m5, { buildings: false });
    const g5 = m5.layer('d');
    SA.streets(m5, g5, ['Keshavarz', 'Jalalieh', 'Zare', 'ZareS', 'Hedayati', 'Enayat', 'Poursina', '16Azar']);
    SA.jalalieh(m5, g5);
    SA.site(m5, g5, { fill: 'rgba(46,134,222,.18)', w: 2.2 });
    const mr = SA.minRect(E);
    SA.dimLine(m5, g5, mr.pts[0], mr.pts[1], '≈ ' + Math.round(mr.w) + ' m', -10);
    SA.dimLine(m5, g5, mr.pts[1], mr.pts[2], '≈ ' + Math.round(mr.h) + ' m', -10);
    m5.label(C(), 'سایت · ≈ ۸٬۹۰۰ مترمربع', 'lbl-fa', { size: 13 });
    const set = (k) => {
      frames.forEach((fr, j) => (fr.f.className = 'zf mapframe ' + (j < k ? 'past' : j === k ? 'cur' : 'next')));
      SA.$$('#loc-steps button').forEach((b, j) => b.setAttribute('aria-pressed', j === k ? 'true' : 'false'));
    };
    const origins = () => frames.forEach((fr, j) => {
      if (!fr.mark) return; const r1 = fr.f.getBoundingClientRect(), r2 = fr.mark.getBoundingClientRect(); if (!r1.width) return;
      const o = ((r2.left + r2.width / 2 - r1.left) / r1.width * 100).toFixed(1) + '% ' + ((r2.top + r2.height / 2 - r1.top) / r1.height * 100).toFixed(1) + '%';
      fr.f.style.transformOrigin = o; if (frames[j + 1]) frames[j + 1].f.style.transformOrigin = o;
    });
    const steps = [['ایران', 'استان تهران در شمال فلات'], ['تهران', '۲۲ منطقه؛ منطقه‌ی ۶ در مرکز'], ['منطقه‌ی ۶', '≈ ۲۱٫۴ کیلومترمربع؛ شریان‌ها و مترو'], ['پارک ↔ دانشگاه', 'بوستان لاله و پردیس دانشگاه'], ['سایت', 'محدوده‌ی ساده‌شده و ابعاد']];
    const ol = SA.$('#loc-steps');
    steps.forEach(([t, d], i) => { const li = el('li', null, ol); const b = el('button', { type: 'button', 'aria-pressed': 'false' }, li, '<span class="n">' + faN(i + 1) + '</span><span><b>' + t + '</b><span>' + d + '</span></span>'); b.onclick = () => { stop(); origins(); set(i); }; });
    SA.kv(SA.$('#loc-kv'), [['مساحت <span class="approx">±10%</span>', '8,900', 'm²', 'تقریبی؛ نه سند ثبتی'], ['ابعاد محاط', '105×110', 'm', 'شکل نامنظم'], ['ارتفاع (SRTM)', '1226–1230', 'm', 'شیب ملایم به جنوب'], ['مختصات مرکز', '35.7070N', '', '51.3931E']]);
    let tm = null; const stop = () => { clearTimeout(tm); tm = null; };
    set(0);
    sec._enter = () => { stop(); origins(); set(0); let k = 0; const tick = () => { k++; if (k > 4) return; origins(); set(k); tm = setTimeout(tick, 1900); }; tm = setTimeout(tick, 1100); };
    sec._leave = stop;
  };

  /* ================= 02 URBAN ================= */
  SA.slides.urban = function () {
    const c = C();
    const mv = new SA.MapViewer(SA.$('#urban-map'), { view: [c[0] - 2650, c[1] - 2650, c[0] + 2650, c[1] + 2650], zoom: true, corners: { tl: 'شعاع ۲٫۵ کیلومتر · شبکه‌ی OSM', tr: 'روی ایستگاه‌ها بروید' } });
    const b = mv.layer('b');
    const d6 = s('path', { d: SA.d(G.districts['6'], true), fill: 'rgba(46,134,222,.04)', stroke: 'var(--site)', 'stroke-width': 1, 'stroke-dasharray': '5 4', class: 'ns' }, b);
    mv.hover(d6, { k: 'مرز شهرداری', t: 'منطقه‌ی ۶', big: '۲۱٫۴ km²' });
    const pk = s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)' }, b); mv.hover(pk, { k: 'فضای سبز عمومی', t: 'بوستان لاله', big: '۳۵ هکتار' });
    const cp = s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)' }, b); mv.hover(cp, { k: 'آموزشی', t: 'پردیس مرکزی دانشگاه تهران', big: '≈ ۲۰٫۸ هکتار' });
    const rg = mv.layer('rings');
    [500, 1000, 1500, 2000, 2500].forEach((m) => {
      s('circle', { cx: c[0], cy: -c[1], r: m, fill: 'none', stroke: 'var(--ink)', 'stroke-opacity': m === 2500 ? 0.5 : 0.16, 'stroke-width': m === 2500 ? 1.1 : 0.7, 'stroke-dasharray': m === 2500 ? null : '2 4', class: 'ns' }, rg);
      mv.label([c[0] + m * Math.cos(-0.72), c[1] + m * Math.sin(-0.72)], (m / 1000).toFixed(1) + ' km', 'lbl', { size: 8.5, layer: 'rings' });
    });
    SA.roadsCtx(mv.layer('roads'), 1.1, { draw: true });
    ['Keshavarz Blvd', 'Enghelab St', 'Valiasr St', 'N. Kargar St', 'Fatemi St', 'Chamran Expy', 'Jomhuri St', 'Taleqani St'].forEach((n) => {
      const a = SA.along(G.roads[n].p, 0.5); let deg = (-a.ang * 180) / Math.PI; if (deg > 90) deg -= 180; if (deg < -90) deg += 180;
      mv.label(a.p, n.toUpperCase(), 'lbl', { rot: deg, size: 8 });
    });
    SA.stations(mv, mv.layer('st'), 7);
    s('path', { d: SA.d(E, true), fill: 'var(--site)', stroke: 'var(--site)', 'stroke-width': 2, class: 'ns' }, mv.layer('site'));
    mv.label([c[0] + 130, c[1] + 70], 'سایت', 'lbl-fa', { anchor: 'start', size: 12 });
    const lad = el('div', { class: 'ladder' }, SA.$('#urban-ladder'));
    D.poi.filter((p, i) => i < 13 || p.t === 'sport').forEach((p) => el('div', { class: 'lr', 'data-t': p.t }, lad, '<span class="nm">' + p.fa + '</span><span class="bar"><i style="width:' + ((p.m / 2500) * 100).toFixed(1) + '%"></i></span><span class="m">' + (p.m >= 1000 ? (p.m / 1000).toFixed(2) + ' km' : p.m + ' m') + '</span>'));
    SA.legend(SA.$('#urban-legend'), [
      { kind: 'line', color: 'var(--ink)', extra: 3, en: 'بزرگراه', fa: 'expressway' },
      { kind: 'line', color: 'rgba(28,31,34,.5)', extra: 2, en: 'شریانی', fa: 'arterial' },
      { kind: 'rect', color: '#fff', extra: 'stroke="#1C1F22" stroke-width="1.5"', en: 'ایستگاه مترو', fa: 'metro' },
      { kind: 'dash', color: 'var(--site)', en: 'مرز منطقه‌ی ۶', fa: 'district' },
    ]);
    const sec = SA.$('#urban-map').closest('.slide');
    sec._enter = () => SA.$$('#urban-map .draw').forEach((p, i) => setTimeout(() => p.classList.add('on'), i * 50));
  };

  /* ================= 03 UT + URBAN SETTING ================= */
  SA.slides.ut = function () {
    const mv = new SA.MapViewer(SA.$('#ut-map'), { view: [-360, -680, 560, 420], zoom: true, grid: 50, corners: { tl: 'پردیس دانشگاه تهران، پارک و سایت', tr: 'OSM' } });
    const b = mv.layer('b');
    s('path', { d: SA.d(F('laleh_park').pts, true), fill: 'var(--lu-green)', 'fill-opacity': 0.7 }, b);
    const cp = s('path', { d: SA.d(F('ut_campus').pts, true), fill: 'var(--lu-edu)', 'fill-opacity': 0.35, stroke: 'var(--lu-edu)', 'stroke-width': 1.2, class: 'ns' }, b);
    mv.hover(cp, { k: 'آموزشی · محصور', t: 'پردیس مرکزی دانشگاه تهران', big: '≈ ۲۰٫۸ هکتار', src: 'OSM [1]' });
    SA.features(mv, b, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', dashUnc: false, style: (f) => ({ fill: f.use === 'edu' || f.use === 'cult' ? 'var(--lu-edu)' : 'var(--paper-3)', stroke: 'rgba(28,31,34,.3)', 'stroke-width': 0.5, class: 'ns' }) });
    SA.roadsCtx(mv.layer('r'), 1.4);
    SA.streets(mv, mv.layer('st'), ['Jalalieh', 'Enayat', 'Hedayati', 'Zare'], { hover: false });
    SA.site(mv, mv.layer('s'), { w: 2 });
    SA.stations(mv, mv.layer('m'), 7);
    const a = mv.layer('a');
    SA.arrow(mv, a, [[70, 150], [60, 110]], 'var(--pos)', { w: 1.6, dash: '4 3' });
    SA.arrow(mv, a, [[30, -20], [60, -110]], 'var(--pos)', { w: 1.6, dash: '4 3' });
    [[[-60, 330], 'بوستان لاله'], [[180, -330], 'پردیس دانشگاه تهران'], [[250, 100], 'علوم پزشکی / نهادی'], [[-240, 20], 'مسکونی'], [[-80, -600], 'خیابان انقلاب']].forEach(([p, t]) => mv.label(p, t, 'lbl-fa', { size: 12 }));
    SA.kv(SA.$('#ut-kv'), [['پردیس مرکزی', '≈ 20.8', 'ha', 'پلیگون OSM'], ['افتتاح', '1934', '', 'روی باغ جلالیه [5]'], ['فاصله از پارک', '≈ 40', 'm', 'عرض بلوار کشاورز'], ['دانشکده‌ی فعلی تربیت بدنی', '≈ 2.5', 'km', 'کارگر شمالی (امیرآباد)']]);
    SA.ferBlock(SA.$('#ut-fer'), [
      ['دانشکده‌های علوم پزشکی و تالار ابن‌سینا روبه‌روی لبه‌ی جنوبی', 'امکان اشتراک آموزشی–پژوهشی (طب ورزشی، فیزیولوژی)', 'لبه‌ی جنوبی: فضاهای آموزشی و پژوهشی رو به دانشگاه'],
      ['پارک ۳۵ هکتاری آن سوی بلوار', 'امتداد دویدن و تمرین آزاد در پارک', 'ورودی عمومی در شمال‌شرق، رو به پارک و مترو'],
      ['پردیس محصور با نرده روی پاسنگ', 'لبه‌ی نهادی بسته', 'لبه‌ی نفوذپذیر و فعال، نه دیوار بسته'],
    ]);
  };

  /* ================= 04 UT CONCEPT / SPATIAL LOGIC ================= */
  SA.slides.concept = function () {
    const mv = new SA.MapViewer(SA.$('#concept-map'), { view: [-260, -700, 600, 260], grid: 50, corners: { tl: 'خوانش نموداری پردیس', tr: 'نه نقشه‌ی طرح جامع' } });
    const b = mv.layer('b');
    const camp = F('ut_campus').pts;
    s('path', { d: SA.d(camp, true), fill: 'rgba(158,180,139,.28)', stroke: 'var(--ink)', 'stroke-width': 1.6, class: 'ns' }, b);
    /* enclosure hatch along edge */
    s('path', { d: SA.d(camp, true), fill: 'none', stroke: 'var(--ink)', 'stroke-width': 5, 'stroke-opacity': 0.12, class: 'ns' }, b);
    SA.features(mv, b, { filter: (f) => ['fac_med_sci', 'ibn_sina_hall', 'uni_1168538981', 'uni_1168538982', 'uni_1168538983', 'uni_1168538984'].indexOf(f.id) > -1, hover: false, dashUnc: false, style: () => ({ fill: 'var(--ink)', 'fill-opacity': 0.75 }) });
    /* axis parallel to 16 Azar through the campus centroid (map reading) */
    const cc = SA.centroid(camp), dv = [-243, 710], L = Math.hypot(...dv), u = [dv[0] / L, dv[1] / L];
    const ax = [[cc[0] - u[0] * 330, cc[1] - u[1] * 330], [cc[0] + u[0] * 290, cc[1] + u[1] * 290]];
    const g = mv.layer('ax');
    s('path', { d: SA.d(ax), stroke: 'var(--site)', 'stroke-width': 2.2, class: 'ns draw', fill: 'none' }, g);
    const nrm = [u[1], -u[0]];
    [-150, 60].forEach((t) => { const p = [cc[0] + u[0] * t, cc[1] + u[1] * t]; s('path', { d: SA.d([[p[0] - nrm[0] * 150, p[1] - nrm[1] * 150], [p[0] + nrm[0] * 150, p[1] + nrm[1] * 150]]), stroke: 'var(--site)', 'stroke-width': 1, 'stroke-dasharray': '4 4', class: 'ns', fill: 'none' }, g); });
    SA.marker(mv, g, ax[0], '۱', { fill: 'var(--site)' });
    mv.label([ax[0][0] + 40, ax[0][1] - 5], 'سردر (۱۹۶۵) · خیابان انقلاب', 'lbl-fa', { anchor: 'start', size: 11 });
    SA.marker(mv, g, [cc[0] + u[0] * 40, cc[1] + u[1] * 40], '۲', { fill: 'var(--site)' });
    mv.label([cc[0] + u[0] * 40 + 25, cc[1] + u[1] * 40], 'محور اصلی شمالی–جنوبی (خوانش)', 'lbl-fa', { anchor: 'start', size: 11 });
    SA.marker(mv, g, [cc[0] + nrm[0] * 120 - u[0] * 150, cc[1] + nrm[1] * 120 - u[1] * 150], '۳', { fill: 'var(--pos)' });
    mv.label([cc[0] + nrm[0] * 120 - u[0] * 150 + 22, cc[1] + nrm[1] * 120 - u[1] * 150], 'پاویون در منظر سبز', 'lbl-fa', { anchor: 'start', size: 11 });
    /* site + Jalalieh spine linking to the campus */
    SA.site(mv, mv.layer('s'), { w: 2 });
    SA.streets(mv, mv.layer('st'), ['Poursina', '16Azar', 'Jalalieh', 'Keshavarz'], { hover: false });
    SA.arrow(mv, mv.layer('sp'), [[60, 150], [65, 10], [70, -80]], 'var(--site)', { w: 1.6, dash: '3 3', flow: true });
    SA.marker(mv, mv.layer('sp'), [95, 60], '۴', { fill: 'var(--site-deep)' });
    mv.label([112, 60], 'امتداد محور پیاده به سایت', 'lbl-fa', { anchor: 'start', size: 11 });
    const sec = SA.$('#concept-map').closest('.slide');
    sec._enter = () => SA.$$('#concept-map .draw').forEach((p) => { p.classList.remove('on'); void p.getBoundingClientRect(); p.classList.add('on'); });
    SA.$('#concept-cols').innerHTML =
      '<div class="cc"><h4><i>۱</i>ایده: باغ–پردیس</h4><p>دانشگاه روی زمین باغ جلالیه (اواخر دوره‌ی ناصری، دهه‌ی ۱۸۸۰) ساخته و در ۱۹۳۴ افتتاح شد؛ منطق اولیه، «بنا در باغ» است.</p><span class="src">[5]</span></div>' +
      '<div class="cc"><h4><i>۲</i>سازمان فضایی</h4><p>طرح جامع گروهی از معماران فرانسوی، سوئیسی و ایرانی (Dubrulle، Siroux، Moser، Godard، Markov، فروغی). در خوانش نقشه، بناها پاویون‌وار در فضای سبز قرار گرفته‌اند.</p><span class="src">[5] · خوانش نقشه</span></div>' +
      '<div class="cc"><h4><i>۳</i>محور، حیاط و لبه</h4><p>سردر ۱۹۶۵ (کوروش فرزامی) رو به خیابان انقلاب؛ کتابخانه‌ی مرکزی ۱۹۷۱ (فرمانفرماییان). پردیس محصور با نرده روی پاسنگ سنگی (عکس‌های ۴ و ۵). محور شمالی–جنوبی موازی ۱۶ آذر، خوانش نقشه است.</p><span class="src">[5][6] · برداشت میدانی</span></div>' +
      '<div class="cc"><h4><i>۴</i>تداوم در بستر</h4><p>علوم پزشکی در ۱۹۸۶ جدا شد و هنوز در پردیس مرکزی است؛ لبه‌ی شمالی پردیس (پورسینا) با دانشکده‌های علوم پزشکی و تالار ابن‌سینا مستقیماً روبه‌روی سایت است.</p><span class="src">[6] · OSM</span></div>' +
      '<div class="cont"><h4>چه چیزی را در دانشکده تربیت بدنی <span>ادامه می‌دهیم؟</span></h4>' +
      '<div><b>پاویون در منظر</b><p>سالن‌ها و حجم‌های ورزشی به‌صورت اجسام مستقل در فضای باز سبز، نه یک بلوک پیوسته.</p></div>' +
      '<div><b>محور و آستانه</b><p>امتداد محور پیاده از پارک، از راه جلالیه، تا دانشگاه به‌عنوان آستانه‌ی ورود دانشکده.</p></div>' +
      '<div><b>باغِ فعال</b><p>حیاط/زمین روباز مرکزی به‌جای باغ، با لبه‌ی نفوذپذیر به‌جای نرده‌ی بسته؛ با زبان معماری معاصر.</p></div></div>';
  };

  /* ================= 05 ADJACENCY + URBAN FABRIC ================= */
  SA.slides.adj = function () {
    const mv = new SA.MapViewer(SA.$('#adj-map'), { view: [-190, -160, 190, 230], zoom: true, grid: 10, corners: { tl: 'همجواری‌ها و چهار لبه', tr: 'روی ردیف جدول بروید' } });
    SA.base(mv);
    const z = mv.layer('z');
    const zone = (id, pts, c) => { const p = s('path', { d: SA.d(pts, true), fill: c, 'fill-opacity': 0.22, stroke: c, 'stroke-width': 1, 'stroke-dasharray': '4 3', class: 'ns' }, z); p.dataset.g = id; p.classList.add('feat'); return p; };
    const zones = {
      ut: zone('ut', [[-85, -52], [245, 56], [270, -40], [270, -160], [-40, -160]], '#93A9BA'),
      tums: zone('tums', [[62, 115], [170, 158], [230, 60], [245, 56], [95, -20], [65, 0]], '#8FA7B8'),
      west: zone('west', [[-185, 95], [-50, 95], [-22, -22], [-95, -60], [-185, -60]], '#D9C4A0'),
      nw: zone('nw', [[-185, 150], [-50, 150], [-50, 96], [-185, 96]], '#E3D2B2'),
      kesh: zone('kesh', [[-185, 150], [-50, 150], [45, 165], [190, 200], [190, 140], [45, 104], [-50, 93], [-185, 95]], '#D9A91A'),
      jal: zone('jal', [[44, 104], [62, 110], [80, 6], [60, 5]], '#5FA83A'),
      park: zone('park', [[-185, 170], [190, 215], [190, 230], [-185, 230]], '#9EB48B'),
      serv: zone('serv', [[60, 110], [95, 120], [100, 170], [60, 158]], '#D49A5B'),
    };
    SA.streets(mv, mv.layer('st'), ['16Azar', 'Qods', 'Poursina', 'Enayat', 'Hedayati', 'Jalalieh', 'Zare', 'ZareS', 'Keshavarz'], { hover: false });
    SA.site(mv, mv.layer('s'), { w: 2.4, hover: false });
    /* 4 edges on the envelope */
    const ed = mv.layer('edges');
    const sides = [['N', E[0], E[1], '#1F6C9F', 'شمال · عمومی، پرصدا'], ['E', E[1], E[2], '#5FA83A', 'شرق · پیاده، نیمه‌عمومی'], ['S', E[2], E[3], '#6E8FA8', 'جنوب · نهادی، سبز'], ['W', E[3], E[0], '#A8443C', 'غرب · مسکونی، حساس']];
    sides.forEach(([k, a, bb, c, t]) => {
      s('path', { d: SA.d([a, bb]), stroke: c, 'stroke-width': 5, class: 'ns', 'stroke-linecap': 'butt' }, ed);
      const m = [(a[0] + bb[0]) / 2, (a[1] + bb[1]) / 2], cx0 = C(), off = [(m[0] - cx0[0]) * 0.28, (m[1] - cx0[1]) * 0.28];
      mv.label([m[0] + off[0], m[1] + off[1]], t, 'lbl-fa', { size: 11 });
    });
    const rows = [
      ['ut', 'دانشگاه تهران – جنوب', '#93A9BA', 'دانشگاهی–نهادی؛ شکل‌گیری تاریخی و توسعه‌ی معاصر', 'میان تا بزرگ‌مقیاس', 'آموزشی، پژوهشی', 'ارتباط عملکردی و هویتی', 'رابطه‌ی پیاده و بصری با دانشگاه چگونه برقرار شود؟'],
      ['tums', 'علوم پزشکی / نهادی – شرق', '#8FA7B8', 'توده‌های نهادی و آموزشی', 'متوسط تا بزرگ', 'آموزشی، خدماتی', 'لبه‌ی نهادی نسبتاً فعال', 'کدام عملکردهای بزرگ به این لبه نزدیک شوند؟'],
      ['west', 'مسکونی – غرب', '#D9C4A0', 'ریزدانه، بدنه‌های کور جانبی', '۳ تا ۸ طبقه', 'سکونت', 'حساس به صدا، نور شب و اشراف', 'فعالیت‌های پرسروصدا چگونه فاصله بگیرند؟'],
      ['nw', 'مسکونی – شمال‌غرب', '#E3D2B2', 'مسکونی + خدمات محلی', 'کم تا میان', 'سکونت/خدمات', 'تعامل کنترل‌شده', 'چه میزان فعالیت عمومی به این لبه برسد؟'],
      ['kesh', 'بلوار کشاورز – شمال', '#D9A91A', 'لبه‌ی شهری مهم، دو سواره‌رو', 'بزرگ‌تر از بافت محلی', 'سواره، پیاده، اتوبوس', 'هویت شهری + صدا + آلودگی', 'ورودی اصلی یا حائل شهری؟'],
      ['jal', 'جلالیه – شرق/شمال‌شرق', '#5FA83A', 'بن‌بست سواره، پیوند پیاده', 'ریز تا میان', 'حرکت پیاده', 'فرصت ورود اصلی', 'آیا ستون فقرات پیاده می‌شود؟'],
      ['park', 'بوستان لاله – شمال', '#9EB48B', 'پارک ۳۵ هکتاری', 'باز', 'تفریح، ورزش آزاد', 'دید و پیوند سبز', 'چگونه فعالیت روباز به پارک متصل شود؟'],
      ['serv', 'خدمات / تجاری – شمال‌شرق', '#D49A5B', 'هتل بلوار، پارکینگ علوم پزشکی', 'متغیر', 'اقامتی، پارکینگ', 'تنوع لبه، ترافیک سرویس', 'کدام عملکرد عمومی در تماس با این لبه باشد؟'],
      ['mix', 'بافت پیرامون', '#B8B4AA', 'ساختار پهلوی اول و دوم + مداخلات معاصر (نه همه‌ی بناها)', 'متنوع', 'مختلط', 'هویت و تداوم بستر', 'چگونه بدون تقلید تاریخی هماهنگ شویم؟'],
    ];
    const T = SA.$('#adj-table');
    T.innerHTML = '<table class="adj-t"><thead><tr><th>همجواری</th><th>ویژگی بافت</th><th>مقیاس</th><th>فعالیت</th><th>حساسیت / فرصت</th><th>سؤال طراحی</th></tr></thead><tbody>' +
      rows.map((r) => '<tr data-z="' + r[0] + '" tabindex="0"><td style="--c:' + r[2] + '"><i></i>' + r[1] + '</td><td>' + r[3] + '</td><td>' + r[4] + '</td><td>' + r[5] + '</td><td>' + r[6] + '</td><td>' + r[7] + '</td></tr>').join('') + '</tbody></table>';
    const tbl = T.querySelector('table');
    SA.$$('tr[data-z]', T).forEach((tr) => {
      const k = tr.dataset.z, on = () => { tbl.classList.add('dim'); tr.classList.add('hl'); if (zones[k]) mv.hot(k); }, off = () => { tbl.classList.remove('dim'); tr.classList.remove('hl'); mv.unhot(); };
      tr.addEventListener('pointerenter', on); tr.addEventListener('pointerleave', off); tr.addEventListener('focus', on); tr.addEventListener('blur', off);
    });
    Object.keys(zones).forEach((k) => { const r = rows.find((x) => x[0] === k); mv.hover(zones[k], { k: 'همجواری', t: r[1], rows: [['حساسیت/فرصت', r[6]]], src: r[7] }, k); });
  };
})();
