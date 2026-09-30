/* Slides 14 opportunities · 15 constraints · 16 five forces · 17 five rules · 18 implications · appendix */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, s = SA.s, el = SA.el;
  const ST = G.streets, E = G.envelope, C = () => SA.SITE_C;
  const J0 = ST.Jalalieh[0], JS = ST.Jalalieh[ST.Jalalieh.length - 1];
  const edge = { N: [E[0], E[1]], E: [E[1], E[2]], S: [E[2], E[3]], W: [E[3], E[0]] };
  const offs = (pts, d) => SA.offset(pts, d);

  function siteMap(host, o) {
    o = o || {};
    const mv = new SA.MapViewer(host, { view: o.view || [-125, -85, 130, 170], zoom: true, grid: 10, corners: o.corners });
    SA.base(mv, { dark: o.dark });
    SA.streets(mv, mv.layer('st'), ['16Azar', 'Poursina', 'Enayat', 'Hedayati', 'Jalalieh', 'Zare', 'ZareS', 'Keshavarz'], { hover: false, op: o.dark ? 0.85 : 0.75 });
    SA.jalalieh(mv, mv.layer('st'));
    SA.site(mv, mv.layer('site'), { hover: false, fill: o.dark ? 'rgba(46,134,222,.16)' : 'rgba(46,134,222,.1)' });
    return mv;
  }
  /* link a list to map groups */
  function link(mv, list, sel) {
    SA.$$(sel, list).forEach((li) => {
      const g = li.dataset.g, on = () => { mv.hot(g); list.classList.add('dim'); li.classList.add('hot'); }, off = () => { mv.unhot(); list.classList.remove('dim'); li.classList.remove('hot'); };
      li.addEventListener('pointerenter', on); li.addEventListener('pointerleave', off); li.addEventListener('focus', on); li.addEventListener('blur', off);
    });
    mv.onHot = (grp, on) => { list.classList.toggle('dim', !!on); SA.$$(sel, list).forEach((li) => li.classList.toggle('hot', on && li.dataset.g === grp)); };
  }

  /* ================= 14 / 15 mapped SWOT ================= */
  const SW = {
    S: [['مجاورت مستقیم با دانشگاه تهران و علوم پزشکی (طب ورزشی، فیزیولوژی)', { line: edge.S }], ['بوستان لاله‌ی ۳۵ هکتاری آن سوی بلوار؛ ظرفیت ورزش روباز', { area: [[-110, 128], [120, 158], [120, 170], [-110, 170]] }], ['مترو بوستان لاله ≈ ۲۸۰ متر و بلوار شهری', { pt: [112, 150] }], ['زمین تقریباً مسطح و قابل تخلیه (پارکینگ)', { pt: [0, 45] }], ['کریدور پیاده‌ی جلالیه', { line: ST.Jalalieh }]],
    O: [['حلقه‌ی پیوند پارک و دانشگاه از جلالیه و زارع', { line: [ST.Zare[0], ST.Zare[1], ST.Zare[2], J0] }], ['اشتراک فضاهای ورزشی با دانشگاه و محله در ساعات غیرآموزشی', { pt: [5, 20] }], ['جایگزینی پارکینگ با فضای عمومی و سبز؛ بهبود لبه‌ی کشاورز', { line: edge.N }], ['هم‌افزایی پژوهشی با علوم پزشکی و دانشکده‌ی فعلی تربیت بدنی', { pt: [60, -45] }]],
    W: [['مساحت ≈ ۰٫۹ هکتار: سالن چندمنظوره و زمین‌های روباز استاندارد با هم تنگ‌اند', { pt: [10, 45] }], ['هیچ ضلعی مستقیم به خیابان سواره‌ی اصلی باز نمی‌شود', { line: edge.W }], ['بدنه‌های کور همسایه در غرب و شرق', { line: edge.E }], ['صدای کشاورز و آلودگی PM2.5 برای ورزش روباز', { line: ST.Keshavarz }]],
    T: [['صدا و نور شبانه‌ی ورزش در برابر مسکونی غرب', { area: [[-115, 92], [-50, 92], [-22, -24], [-95, -45], [-115, -45]] }], ['حجم بزرگ سالن‌ها در برابر مقیاس ۳ تا ۸ طبقه', { pt: [25, 12] }], ['تداخل سرویس و پیاده در جلالیه‌ی بن‌بست؛ امداد محدود', { pt: [JS[0] - 2, JS[1] + 30] }], ['از دست رفتن پارکینگ فعلی و فشار پارک حاشیه‌ای', { pt: [-10, 70] }], ['وارونگی دما در زمستان و خیرگی آفتاب عصر', { line: offs(edge.W, -8) }]],
  };
  const QC = { S: '#3E7A4E', O: '#2E86DE', W: '#B0782A', T: '#A8443C' };
  const QN = { S: ['قوت‌ها', 'Strengths', 'ق'], O: ['فرصت‌ها', 'Opportunities', 'ف'], W: ['ضعف‌ها', 'Weaknesses', 'ض'], T: ['تهدیدها', 'Threats', 'ت'] };
  function swot(host, keys) {
    const listBox = el('aside', { class: 'panel swot-lists' }, host), mapBox = el('div', { class: 'fig' }, host);
    const mv = siteMap(el('div', { class: 'map' }, mapBox), { corners: { tl: keys.map((k) => QN[k][0]).join(' + '), tr: 'SWOT مکان‌مند' } });
    const g = mv.layer('sw');
    keys.forEach((k) => {
      const col = el('div', null, listBox, '<div class="swh" style="--c:' + QC[k] + '">' + QN[k][0] + '<span>' + QN[k][1] + '</span></div>');
      const ol = el('ol', { class: 'nlist' }, col);
      SW[k].forEach(([t, geo], i) => {
        const id = QN[k][2] + SA.fa(i + 1), c = QC[k];
        let node = null;
        if (geo.area) node = s('path', { d: SA.d(geo.area, true), fill: c, 'fill-opacity': 0.16, stroke: c, 'stroke-width': 1, 'stroke-dasharray': '4 3', class: 'ns' }, g);
        else if (geo.line) node = s('path', { d: SA.d(geo.line), fill: 'none', stroke: c, 'stroke-width': 4, 'stroke-opacity': 0.6, 'stroke-linecap': 'butt', class: 'ns' }, g);
        const at = geo.pt || (geo.line ? SA.along(geo.line, 0.5).p : SA.centroid(geo.area));
        const m = SA.pin(mv, g, at, id, { fill: c });
        const data = { k: QN[k][0] + ' · ' + id, t };
        if (node) mv.hover(node, data, id);
        mv.hover(m, data, id);
        el('li', { tabindex: 0, 'data-g': id }, ol, '<span class="b" style="background:' + c + '">' + id + '</span><span class="t">' + t + '</span>');
      });
    });
    link(mv, listBox, 'li[data-g]');
  }
  SA.slides.opp = () => swot(SA.$('#swot-o'), ['S', 'O']);
  SA.slides.con = () => swot(SA.$('#swot-c'), ['W', 'T']);

  /* ================= 16 FIVE SITE FORCES ================= */
  const FORCES = [
    { c: '#3E7A4E', t: 'اتصال پیاده‌ی پارک ↔ دانشگاه', en: 'pedestrian link', p: 'جلالیه برای خودرو بن‌بست ولی برای پیاده باز است؛ مترو و پارک در شمال، دانشگاه در جنوب.', draw: (mv, g, c) => SA.arrow(mv, g, [[48, 150], [J0[0] - 4, J0[1] + 24], J0, JS, [80, -60]], c, { w: 3, dash: '5 4', flow: true }) },
    { c: '#D98A1C', t: 'لبه‌ی فعال و پرصدای کشاورز', en: 'active north edge', p: 'بلوار دوطرفه، اتوبوس، آژیر آتش‌نشانی؛ هم چهره‌ی شهری و هم منبع صدا و آلودگی.', draw: (mv, g, c) => s('path', { d: SA.d(ST.Keshavarz), fill: 'none', stroke: SA.hatch(mv.svg, 'fh', c, 3, 1.1), 'stroke-width': 26 }, g) },
    { c: '#A8443C', t: 'حساسیت بافت مسکونی غرب', en: 'sensitive west', p: 'بافت ریزدانه‌ی ۳ تا ۸ طبقه؛ حساس به صدا، نور شب و اشراف.', draw: (mv, g, c) => s('path', { d: SA.d(SA.offset(edge.W, 7)), fill: 'none', stroke: c, 'stroke-width': 7, 'stroke-opacity': 0.7, class: 'ns' }, g) },
    { c: '#5C7F9A', t: 'لبه‌ی نهادی جنوب و شرق', en: 'institutional S/E', p: 'دانشگاه تهران، علوم پزشکی، باستان‌شناسی و تاریخ علم؛ مقیاس بزرگ‌تر و فعالیت آرام.', draw: (mv, g, c) => s('path', { d: SA.d([E[1], E[2], E[3]]), fill: 'none', stroke: c, 'stroke-width': 7, 'stroke-opacity': 0.7, class: 'ns', 'stroke-linejoin': 'miter' }, g) },
    { c: '#D9A91A', t: 'خورشید و شرایط ورزش روباز', en: 'sun · outdoor sport', p: 'تابش قوی جنوب، خیرگی عصر از غرب؛ محور بلند زمین‌ها نزدیک شمال–جنوب.', draw: (mv, g, c) => { const q = SA.P(C()); s('path', { d: 'M' + (q[0] - 40) + ' ' + (q[1] + 30) + ' A 55 55 0 0 1 ' + (q[0] + 40) + ' ' + (q[1] + 30), fill: 'none', stroke: c, 'stroke-width': 2, class: 'ns', 'stroke-dasharray': '3 3' }, g); SA.arrow(mv, g, [[-70, 30], [-30, 30]], c, { w: 2 }); } },
  ];
  SA.slides.syn = function () {
    const mv = siteMap(SA.$('#syn-map'), { corners: { tl: 'پنج نیروی اصلی سایت', tr: 'سنتز' } });
    const ol = SA.$('#forces');
    FORCES.forEach((f, i) => {
      const id = 'f' + i, g = s('g', { class: 'force' }, mv.layer('f'));
      f.draw(mv, g, f.c);
      const at = [[60, 70], [-60, 108], [-55, 20], [45, -20], [0, 40]][i];
      SA.pin(mv, g, at, SA.fa(i + 1), { fill: f.c });
      mv.hover(g, { k: 'نیروی ' + SA.fa(i + 1), t: f.t, e: f.en }, id);
      el('li', { tabindex: 0, 'data-g': id, style: '--c:' + f.c }, ol, '<span class="b">' + SA.fa(i + 1) + '</span><div><h4>' + f.t + '<small>' + f.en + '</small></h4><p>' + f.p + '</p></div>');
    });
    link(mv, ol, 'li[data-g]');
  };

  /* ================= 17 FIVE DESIGN RULES ================= */
  const RULES = [
    { c: '#E0685E', t: 'حفاظت از غرب', en: 'Protect the West', p: 'لبه‌ی آرام، کم‌ارتفاع و سبز؛ بدون زمین روباز پرسروصدا یا نور شب رو به مسکونی. کلاس‌ها و اداری در این سو.' },
    { c: '#4D9BE6', t: 'فعال‌سازی شمال‌شرق', en: 'Activate the Northeast', p: 'ورودی عمومی و چهره‌ی شهری در گوشه‌ی کشاورز × جلالیه، رو به پارک و مترو؛ لابی، کافه، فضای نمایشی.' },
    { c: '#8FB3CC', t: 'گشودگی به جنوب و شرق', en: 'Open toward South / East', p: 'جبهه‌ی آموزشی–پژوهشی رو به دانشگاه و علوم پزشکی؛ ورودی دانشجویان از پورسینا/جلالیه.' },
    { c: '#9EB48B', t: 'تقویت ستون فقرات پیاده', en: 'Strengthen the Pedestrian Spine', p: 'جلالیه + زارع به‌عنوان مسیر پارک ↔ دانشگاه؛ سرویس و امداد از سمت پورسینا و جدا از پیاده.' },
    { c: '#E8A05A', t: 'برنامه‌های بزرگ‌دهانه در لبه‌ی نهادی', en: 'Large-span programs on institutional edges', p: 'سالن‌های سرپوشیده رو به لبه‌ی جنوب/شرق؛ شکستن حجم برای هم‌مقیاسی با ۳ تا ۸ طبقه. زمین روباز در میانه با محور شمال–جنوب.' },
  ];
  SA.slides.strat = function () {
    const mv = siteMap(SA.$('#strat-map'), { dark: true, view: [-110, -70, 120, 150], corners: { tl: 'پنج قاعده‌ی طراحی', tr: 'دیاگرام راهبردی' } });
    const P = (arr) => arr.map((q) => SA.px(...q));
    const draws = [
      (g, c) => { s('path', { d: SA.d(SA.offset(edge.W, -9)), fill: 'none', stroke: c, 'stroke-width': 14, 'stroke-opacity': 0.35, class: 'ns' }, g); s('path', { d: SA.d(SA.offset(edge.W, -9)), fill: 'none', stroke: c, 'stroke-width': 1.2, 'stroke-dasharray': '3 3', class: 'ns' }, g); },
      (g, c) => { const q = SA.P([J0[0] - 12, J0[1] - 8]); s('circle', { cx: q[0], cy: q[1], r: 12, fill: c, 'fill-opacity': 0.55 }, g); s('circle', { cx: q[0], cy: q[1], r: 6, fill: 'none', stroke: c, class: 'ns ripple' }, g); SA.arrow(mv, g, [[110, 150], [J0[0] - 8, J0[1] - 4]], c, { w: 2 }); },
      (g, c) => { SA.arrow(mv, g, [[10, 5], [0, -40]], c, { w: 2 }); SA.arrow(mv, g, [[40, 40], [80, 30]], c, { w: 2 }); s('path', { d: SA.d([E[1], E[2], E[3]]), fill: 'none', stroke: c, 'stroke-width': 3, class: 'ns', 'stroke-dasharray': '8 4' }, g); },
      (g, c) => { SA.arrow(mv, g, [[48, 150], [J0[0] - 4, J0[1] + 24], J0, JS, [80, -50]], c, { w: 2.6, dash: '5 4', flow: true }); s('path', { d: SA.d(ST.Zare), fill: 'none', stroke: c, 'stroke-width': 2, 'stroke-dasharray': '5 4', class: 'ns flow' }, g); SA.arrow(mv, g, [[JS[0] + 14, JS[1] - 25], [JS[0] + 4, JS[1] + 28]], '#C49A45', { w: 2.2 }); },
      (g, c) => { s('path', { d: SA.d(P([[760, 720], [960, 690], [985, 800], [790, 830]]), true), fill: c, 'fill-opacity': 0.45, stroke: c, 'stroke-dasharray': '4 3', class: 'ns' }, g); const oz = P([[610, 430], [820, 400], [850, 560], [640, 600]]); s('path', { d: SA.d(oz, true), fill: '#9EB48B', 'fill-opacity': 0.3, stroke: '#9EB48B', 'stroke-dasharray': '4 3', class: 'ns' }, g); const oc = SA.centroid(oz); s('path', { d: SA.d([[oc[0] - 4, oc[1] + 28], [oc[0] + 4, oc[1] - 28]]), stroke: '#9EB48B', 'stroke-width': 1, class: 'ns' }, g); mv.label([oc[0] + 12, oc[1]], 'زمین روباز · محور ش–ج', 'lbl-fa light', { anchor: 'start', size: 10 }); mv.label(SA.centroid(P([[760, 720], [960, 690], [985, 800], [790, 830]])), 'سالن‌ها', 'lbl-fa light', { size: 10 }); },
    ];
    const at = [[-50, 40], [30, 112], [30, -30], [85, 70], [35, 0]];
    const ol = SA.$('#rules');
    RULES.forEach((r, i) => {
      const id = 'r' + i, g = s('g', null, mv.layer('rules'));
      draws[i](g, r.c); SA.pin(mv, g, at[i], SA.fa(i + 1), { fill: r.c, color: '#15181B' });
      mv.hover(g, { k: 'قاعده‌ی ' + SA.fa(i + 1), t: r.t, e: r.en }, id);
      el('li', { tabindex: 0, 'data-g': id, style: '--c:' + r.c }, ol, '<span class="b" style="color:#15181B">' + SA.fa(i + 1) + '</span><div><h4>' + r.t + '<small>' + r.en + '</small></h4><p>' + r.p + '</p></div>');
    });
    link(mv, ol, 'li[data-g]');
  };

  /* ================= 18 IMPLICATIONS · program table ================= */
  SA.slides.impl = function () {
    const rows = [
      ['سالن‌های سرپوشیده', 'لبه‌ی جنوب/شرق نهادی و بزرگ‌مقیاس', 'حجم بزرگ در برابر بافت ۳–۸ طبقه', 'سالن‌ها در جنوب‌شرق؛ حجم شکسته، کمی فرورفته در تراز پایین‌تر', '۵'],
      ['فضاهای نیمه‌باز ورزشی', 'آفتاب قوی تابستان، هوای آلوده‌ی زمستان', 'نیاز به سایه و پناه', 'سایبان‌دار میان سالن و زمین روباز', '۵'],
      ['زمین‌های روباز', 'خیرگی عصر از غرب؛ مسکونی حساس در غرب', 'خیرگی و مزاحمت نور/صدا', 'در میانه با محور شمال–جنوب؛ دور از لبه‌ی غربی', '۱، ۵'],
      ['کلاس‌ها و آموزش', 'لبه‌های کم‌صدا؛ دانشگاه در جنوب', 'آرامش و پیوند علمی', 'رو به جنوب و کوچه‌های آرام', '۳'],
      ['فضاهای عمومی و مشترک', 'پارک و مترو در شمال‌شرق', 'حضور شهری', 'لابی/کافه/نمایش در گوشه‌ی شمال‌شرقی', '۲'],
      ['ورودی عمومی', 'اتصال پیاده‌ی جلالیه به کشاورز', 'نقطه‌ی پیوند', 'گوشه‌ی کشاورز × جلالیه', '۲، ۴'],
      ['ورودی دانشجویان', 'پیاده از دانشگاه و مترو انقلاب', 'جریان روزانه از جنوب', 'از پورسینا / جلالیه', '۳، ۴'],
      ['سرویس و امداد', 'خودرو فقط از پورسینا به جلالیه', 'تداخل با پیاده', 'انتهای جنوبی جلالیه؛ جدا از مسیر پیاده', '۴'],
      ['فضاهای پرصدا', 'کشاورز پرصدا؛ غرب حساس', 'انتقال صدا به همسایه', 'رو به شمال/شرق، با حائل سبز', '۱، ۲'],
      ['فضاهای آرام و اداری', 'غرب مسکونی و کوچه‌های آرام', 'نیاز به حریم', 'در لبه‌ی غربی به‌عنوان حائل', '۱'],
      ['حریم همسایگان', 'بدنه‌های کور و اشراف در غرب', 'حساسیت دید و نور شب', 'لبه‌ی بسته/سبز، بدون نورافکن رو به غرب', '۱'],
    ];
    SA.$('#impl-table').innerHTML = '<table class="impl-t"><thead><tr><th>برنامه</th><th>یافته‌ی سایت</th><th>مسئله / فرصت</th><th>پاسخ طراحی</th></tr></thead><tbody>' +
      rows.map((r) => '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[4].split('، ').map((n) => '<span class="r">' + n + '</span>').join('') + r[3] + '</td></tr>').join('') + '</tbody></table>';
    /* compact zoning diagram */
    const mv = siteMap(SA.$('#impl-map'), { view: [-75, -40, 95, 125], corners: { tl: 'دیاگرام پهنه‌بندی برنامه', tr: 'نه حجم‌گذاری' } });
    const g = mv.layer('z'), P = (arr) => arr.map((q) => SA.px(...q));
    const Z = [
      [P([[760, 700], [985, 670], [1010, 800], [790, 835]]), '#E8A05A', 'سالن‌ها'],
      [P([[610, 430], [820, 400], [850, 600], [640, 640]]), '#9EB48B', 'زمین روباز'],
      [P([[500, 360], [590, 350], [640, 870], [600, 880]]), '#C0504A', 'آرام / اداری'],
      [P([[880, 300], [965, 290], [975, 390], [890, 400]]), '#4D9BE6', 'عمومی'],
      [P([[870, 430], [980, 420], [1000, 650], [880, 660]]), '#8FB3CC', 'آموزش'],
    ];
    Z.forEach(([pts, c, t]) => { const p = s('path', { d: SA.d(pts, true), fill: c, 'fill-opacity': 0.45, stroke: c, class: 'ns' }, g); mv.label(SA.centroid(pts), t, 'lbl-fa', { size: 10.5 }); mv.hover(p, { k: 'پهنه‌ی پیشنهادی', t }); });
  };

  /* ================= APPENDIX ================= */
  SA.slides.app = function () {
    SA.$('#bib').innerHTML = D.sources.map(([n, t, u]) => '<li><span class="n">[' + n + ']</span> ' + SA.esc(t) + (u ? ' <a href="' + u + '" target="_blank" rel="noopener">↗</a>' : '') + '</li>').join('');
    const A = SA.$('#archive'), IMG = window.SA_IMG;
    const groups = [
      ['تصاویر هوایی و نقشه‌ی کلید', [['aerial_clean', 'تصویر هوایی تمیز — پایه‌ی زمین‌مرجع'], ['aerial_annotated', 'تصویر هوایی با حاشیه‌نویسی رنگی کاربر'], ['photo_key_map', 'نقشه‌ی کلید عکس‌ها (صفحه‌ی ۱ PDF)']].map(([n, t]) => ({ src: 'img/source/' + n + '.jpg', fa: t, group: 'مواد خام', w: (IMG[n] || [])[0], h: (IMG[n] || [])[1] }))],
      ['اسکرین‌شات‌های Apple Maps', Array.from({ length: 10 }, (_, i) => { const n = 'IMG_' + (8728 + i); return { src: 'img/source/' + n + '.jpg', thumb: 'img/thumbs/' + n + '.jpg', fa: 'اسکرین‌شات Apple Maps — ' + n, group: 'مواد خام', w: (IMG[n] || [])[0], h: (IMG[n] || [])[1] }; })],
    ];
    groups.forEach(([t, list]) => { const box = el('div', { class: 'arch' }, A, '<h5>' + t + '</h5>'); const row = el('div', { class: 'arch-row' }, box); list.forEach((_, i) => SA.photo(row, list, i)); });
    el('p', { class: 't-cap' }, A, '۳۵ عکس برداشت میدانی در اسلاید ۱۳ هستند.');
  };
})();
