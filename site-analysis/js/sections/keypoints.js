/* IMPORTANT POINTS — the nine facts that drive the design, located on one map. Values come from the analysis sections. */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, M = window.SA_DEM, s = SA.s, el = SA.el;
  function keypoints() {
    const host = SA.$('#kp-map'), list = SA.$('#kp-list');
    const c = SA.SITE_C, J = G.streets.Jalalieh, J0 = J[0], JS = J[J.length - 1], E = G.envelope;
    const mv = new SA.MapViewer(host, { view: [c[0] - 260, c[1] - 230, c[0] + 290, c[1] + 270], zoom: true });
    SA.sheet(mv, { no: 'K-00', title: 'IMPORTANT POINTS', src: 'summary of sections 01–20' });
    SA.atlas(mv, { dark: true, veg: true, op: 0.9 });
    const b = mv.layer('b');
    SA.features(mv, b, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', hover: false, dashUnc: false, style: () => ({ fill: 'rgba(255,255,255,.07)', stroke: 'rgba(255,255,255,.3)', 'stroke-width': 0.5, class: 'ns' }) });
    s('path', { d: SA.d(SA.F('laleh_park').pts, true), fill: 'rgba(120,190,110,.16)', stroke: '#9FD08A', 'stroke-width': 1, 'stroke-dasharray': '4 3', class: 'ns' }, b);
    s('path', { d: SA.d(SA.F('ut_campus').pts, true), fill: 'rgba(147,180,210,.14)', stroke: '#A9C6E0', 'stroke-width': 1, 'stroke-dasharray': '4 3', class: 'ns' }, b);
    SA.streets(mv, mv.layer('st'), ['16Azar', 'Qods', 'Poursina', 'Enayat', 'Hedayati', 'Jalalieh', 'Zare', 'ZareS', 'Keshavarz'], { hover: false });
    SA.jalalieh(mv, mv.layer('st'));
    SA.site(mv, mv.layer('s'), { fill: 'rgba(46,134,222,.2)', w: 2.6, emph: true, hover: false });
    SA.stations(mv, mv.layer('st'), 9);
    const P = [
      { at: c, v: '8,900', u: 'm²', t: 'مساحت سایت', d: '≈ ۰٫۹ هکتار (±۱۰٪)، محاط در ≈ ۱۰۵ × ۱۱۰ متر؛ کوچک برای برنامه‌ی ورزشی کامل', col: '#6CB4F5' },
      { at: [40, 330], v: '35', u: 'ha', t: 'بوستان لاله در شمال', d: 'فقط به عرض بلوار کشاورز (≈ ۴۰ متر) فاصله دارد — امتداد ورزش روباز', col: '#9FD08A' },
      { at: [120, -250], v: '20.8', u: 'ha', t: 'دانشگاه تهران در جنوب', d: 'پردیس مرکزی و دانشکده‌های علوم پزشکی روبه‌روی لبه‌ی جنوبی', col: '#A9C6E0' },
      { at: [188, 249], v: '280', u: 'm', t: 'مترو بوستان لاله (خط ۶)', d: 'پیاده از راه اتصال جلالیه به کشاورز', col: '#fff' },
      { at: [JS[0] + 6, JS[1] + 10], v: '0', u: 'frontage', t: 'بدون جبهه‌ی خیابان اصلی', d: 'خودرو فقط از پورسینای یک‌طرفه (غرب) به جلالیه‌ی بن‌بست و عنایت', col: '#EF7F1A' },
      { at: [J0[0] - 3, J0[1] + 12], v: '≈20', u: 'm', t: 'پیوند پیاده‌ی جلالیه', d: 'جلالیه برای خودرو بن‌بست و برای پیاده باز است: ستون پارک ↔ دانشگاه', col: '#5FA83A' },
      { at: [-58, 40], v: '3–8', u: 'floors', t: 'لبه‌ی مسکونی حساس غرب', d: 'بدنه‌های کور و اشراف؛ حساس به صدا و نور شب', col: '#E0685E' },
      { at: [-10, 118], v: 'SW · W', u: '', t: 'باد و آفتاب عصر', d: 'باد غالب جنوب‌غربی/غربی؛ خیرگی عصر از غرب برای زمین روباز', col: '#F2D27A' },
      { at: [0, -12], v: M.stats.slope_site.toFixed(1), u: '%', t: 'شیب ملایم رو به جنوب', d: '≈ ' + (Math.max(...M.stats.site) - Math.min(...M.stats.site)).toFixed(1) + ' متر اختلاف؛ ۸ بنای کوتاه (≈ ۲۸٪) تخریب می‌شوند', col: '#D9B98A' },
    ];
    const g = mv.layer('kp');
    const nodes = P.map((p, i) => {
      const id = 'kp' + i, grp = s('g', { class: 'kp', 'data-g': id }, g), q = SA.P(p.at);
      const ring = s('circle', { cx: q[0], cy: q[1], r: 1, fill: 'none', stroke: p.col, 'stroke-width': 1.2, class: 'ns kp-ring' }, grp);
      const m = SA.pin(mv, grp, p.at, SA.fa(i + 1), { fill: p.col, color: '#15181B', stroke: '#15181B' });
      SA.onScale(mv, (ppm) => ring.setAttribute('r', 18 / ppm));
      mv.hover(grp, { k: 'نکته ' + SA.fa(i + 1), t: p.t, big: p.v + ' ' + p.u, src: p.d }, id);
      const li = el('li', { tabindex: 0, 'data-g': id, style: '--c:' + p.col }, list,
        '<span class="kp-n">' + String(i + 1).padStart(2, '0') + '</span><span class="kp-v">' + p.v + '<small>' + p.u + '</small></span><span class="kp-t">' + p.t + '</span><span class="kp-d">' + p.d + '</span>');
      const on = () => focus(i), off = () => focus(-1);
      li.addEventListener('pointerenter', on); li.addEventListener('pointerleave', off); li.addEventListener('focus', on); li.addEventListener('blur', off);
      return { grp, li, m };
    });
    function focus(k) {
      list.classList.toggle('dim', k > -1); host.classList.toggle('kp-dim', k > -1);
      nodes.forEach((n, i) => { n.li.classList.toggle('hot', i === k); n.grp.classList.toggle('hot', i === k); });
    }
    mv.onHot = (grp, on) => { const k = on && typeof grp === 'string' ? +grp.slice(2) : -1; focus(isNaN(k) ? -1 : k); };
    /* motion: points appear one by one, then a slow tour highlights each */
    let tour = null;
    SA.observe(host, () => {
      nodes.forEach((n, i) => setTimeout(() => { n.grp.classList.add('in'); n.li.classList.add('in'); }, 300 + i * 220));
      if (SA.reduced) return;
      let k = 0; tour = setInterval(() => { if (list.matches(':hover') || host.matches(':hover')) return; focus(k % P.length); k++; if (k > P.length) { clearInterval(tour); focus(-1); } }, 2400);
    });
  }
  SA.sections.push(keypoints);
})();
