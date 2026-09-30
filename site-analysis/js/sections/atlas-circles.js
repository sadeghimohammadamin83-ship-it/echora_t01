/* ANALYSIS ATLAS — six circular analytical vignettes on one base (graphic language of the reference sheets).
   Each circle = one question, one colour, drawn from the project data. */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, s = SA.s, el = SA.el, F = (id) => SA.F(id);
  const C = () => SA.SITE_C;
  function circles() {
    const box = SA.$('#atlas-circles');
    const J = G.streets.Jalalieh, J0 = J[0], JS = J[J.length - 1];
    const mk = (title, fa, no, r, draw, note) => {
      const fig = el('figure', { class: 'ac rv' }, box);
      const disc = el('div', { class: 'ac-disc' }, fig);
      const c = C(), mv = new SA.MapViewer(disc, { view: [c[0] - r, c[1] - r, c[0] + r, c[1] + r], fit: 'xMidYMid slice', north: false, scale: false, coords: false });
      const base = mv.layer('base');
      s('circle', { cx: c[0], cy: -c[1], r: r * 2, fill: '#F4F2EE' }, base);
      SA.features(mv, base, { filter: (f) => f.kind === 'bldg' && f.use !== 'site', hover: false, dashUnc: false, style: () => ({ fill: '#CFCBC3' }) });
      ['Keshavarz', 'Poursina', '16Azar', 'Qods', 'Jalalieh', 'Hedayati', 'Enayat', 'Zare', 'ZareS', 'DavoodTaheri', 'Nosrat', 'Oghab', 'Yekom'].forEach((n) => s('path', { d: SA.d(G.streets[n]), fill: 'none', stroke: '#fff', 'stroke-width': n === 'Keshavarz' ? 26 : n === 'Poursina' || n === '16Azar' || n === 'Qods' ? 12 : 6, 'stroke-linecap': 'round' }, base));
      ['Enghelab St', 'Vesal Shirazi St', 'N. Kargar St', 'Keshavarz Blvd'].forEach((n) => s('path', { d: SA.d(G.roads[n].p), fill: 'none', stroke: '#fff', 'stroke-width': 14 }, base));
      const g = mv.layer('an');
      draw(mv, g);
      s('path', { d: SA.d(G.envelope, true), fill: 'none', stroke: 'var(--site)', 'stroke-width': 1.8, class: 'ns' }, mv.layer('site'));
      el('figcaption', null, fig, '<span class="ac-no">' + no + '</span><b>' + title + '</b><span class="fa">' + fa + '</span><span class="ac-note">' + note + '</span>');
      SA.prepDraw(disc);
      SA.observe(fig, () => { SA.$$('.draw', disc).forEach((p, i) => setTimeout(() => p.classList.add('on'), 200 + i * 60)); disc.classList.add('in'); });
      return mv;
    };
    /* 1 GREEN — park, canopy, green corridors */
    mk('Green', 'فضای سبز و پیوندهای سبز', 'AT-1', 330, (mv, g) => {
      s('path', { d: SA.d(F('laleh_park').pts, true), fill: '#A9C08F' }, g);
      SA.vegLayer(mv, g);
      [[[-320, 158], [0, 146], [320, 222]], [[60, 300], [J0[0] - 4, J0[1] + 24], J0, JS, [70, -260]]].forEach((pts) => { SA.arrow(mv, g, pts, '#3E7A4E', { w: 7, draw: true }); });
    }, 'OSM + canopy extracted from the imagery · arrows = potential corridors');
    /* 2 PUBLIC SPACES */
    mk('Public spaces', 'فضاهای عمومی و نهادی', 'AT-2', 330, (mv, g) => {
      const pub = ['laleh_park', 'ut_campus', 'ibn_sina_hall', 'fac_med_sci', 'uni_1168538981', 'uni_1168538982', 'uni_1168538983', 'uni_1168538984', 'fire_station', 'crisis_shelter', 'boulevard_hotel'];
      G.features.filter((f) => pub.indexOf(f.id) > -1 || f.use === 'edu' || f.use === 'cult').forEach((f) => s('path', { d: SA.d(f.pts, true), fill: f.kind === 'parcel' ? 'rgba(240,196,64,.35)' : '#F0C440', stroke: '#C99A12', 'stroke-width': 0.8, class: 'ns' }, g));
    }, 'public & institutional parcels and buildings (OSM / signs)');
    /* 3 PUBLIC TRANSPORT */
    mk('Public transport', 'حمل‌ونقل عمومی', 'AT-3', 700, (mv, g) => {
      s('path', { d: SA.d(G.roads['Enghelab St'].p), fill: 'none', stroke: '#D6417F', 'stroke-width': 30, 'stroke-opacity': 0.55 }, g);
      s('path', { d: SA.d(G.roads['Enghelab St'].p), fill: 'none', stroke: '#fff', 'stroke-width': 1.5, 'stroke-dasharray': '6 5', class: 'ns' }, g);
      mv.label([-400, -560], 'BRT LINE 1 · ENGHELAB', 'lbl', { size: 9 });
      G.stations.forEach((st) => { const q = SA.P(st.p); s('circle', { cx: q[0], cy: q[1], r: 20, fill: '#fff', stroke: '#B8295F', 'stroke-width': 7 }, g); });
      SA.arrow(mv, g, [[188, 249], [J0[0] - 4, J0[1] + 24]], '#B8295F', { w: 2.5, dash: '4 3', draw: true });
      SA.arrow(mv, g, [[-51, -591], [-40, -60]], '#B8295F', { w: 2.5, dash: '4 3', draw: true });
    }, 'metro stations (OSM) · BRT line 1 on Enghelab (source [15])');
    /* 4 DIRECTION OF MOVEMENT */
    mk('Direction of movement', 'جهت حرکت و گره‌ها', 'AT-4', 170, (mv, g) => {
      const P = G.streets.Poursina, A = G.streets['16Azar'], Q = G.streets.Qods;
      const or = (pts, dx, dy) => { const a = pts[0], z = pts[pts.length - 1]; return (z[0] - a[0]) * dx + (z[1] - a[1]) * dy > 0 ? pts : pts.slice().reverse(); };
      [[or(P, -1, 0), '#EF7F1A'], [or(A, 0, -1), '#EF7F1A'], [or(Q, 0, 1), '#EF7F1A']].forEach(([pts, c]) => SA.arrow(mv, g, pts, c, { w: 2, dash: '2 5', flow: true }));
      [[-85.5, -50], [78.2, 6.7], [-133, 110], [248, 65.6]].forEach((p) => { const q = SA.P(p); s('circle', { cx: q[0], cy: q[1], r: 16, fill: 'none', stroke: '#EF7F1A', 'stroke-width': 1.4, class: 'ns' }, g); s('circle', { cx: q[0], cy: q[1], r: 3, fill: '#EF7F1A' }, g); });
      SA.arrow(mv, g, SA.offset(G.streets.Keshavarz, 5), '#EF7F1A', { w: 1.6 });
      SA.arrow(mv, g, SA.offset(G.streets.Keshavarz, -5).slice().reverse(), '#EF7F1A', { w: 1.6 });
    }, 'one-way directions from OSM · junction nodes');
  }
  SA.sections.push(circles);
})();
