/* Atlas layer — the cartographic language shared by every map of the scroll board.
   · processed imagery base (context: Google, 0.65 m/px; site: aerial, 0.19 m/px) — graded, never raw
   · vegetation extracted from the imagery, drawn as a stipple (not a photo)
   · drawing sheet: number, title, source, coordinate ticks, registration marks
   · annotation system A01… with leader lines, revealed on scroll
   · spatial transitions: every map "zooms into place" the first time it is seen */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, I = window.SA_IMGRY, s = SA.s, el = SA.el;
  const A = G.aerial;
  /* registry of every map (for sheets, entrances, refresh) */
  SA.maps = SA.maps || [];
  const MV0 = SA.MapViewer;
  SA.MapViewer = function (h, o) { MV0.call(this, h, o); SA.maps.push(this); };
  SA.MapViewer.prototype = MV0.prototype;

  /* ---------------- patterns ---------------- */
  SA.stipple = function (svg, id, color, gap, r) {
    const defs = SA.defs(svg);
    if (!defs.querySelector('#' + id)) {
      const p = s('pattern', { id, width: gap, height: gap, patternUnits: 'userSpaceOnUse' }, defs);
      s('circle', { cx: gap / 4, cy: gap / 4, r, fill: color }, p);
      s('circle', { cx: (gap * 3) / 4, cy: (gap * 3) / 4, r, fill: color }, p);
    }
    return 'url(#' + id + ')';
  };

  /* ---------------- imagery base ----------------
     o.context: draw the wide Google-derived base; o.aerial: draw the sharp site aerial on top (frame only);
     o.veg: stipple canopy extracted from the imagery; o.dark: dark grading. */
  SA.atlas = function (mv, o) {
    o = Object.assign({ context: true, aerial: true, veg: true, dark: false, op: 1 }, o);
    const g = mv.layer('atlas');
    /* keep the base under everything: after the grid if there is one, else first */
    const grid = mv.layers.grid && mv.layers.grid.g;
    mv.world.insertBefore(g, grid ? grid.nextSibling : mv.world.firstChild);
    const C = I.context, M = C.m, sfx = o.dark ? 'dark' : 'base';
    if (o.context) s('image', { href: 'img/layers/context_' + sfx + '.jpg', width: C.w, height: C.h, transform: 'matrix(' + M.join(' ') + ')', preserveAspectRatio: 'none', opacity: o.op * (o.aerial ? 0.9 : 1) }, g);
    if (o.aerial) {
      const x = -A.tx / A.s, y = -A.ty / A.s, w = A.w / A.s, h = A.h / A.s;
      const defs = SA.defs(mv.svg), fid = 'fe' + (SA._fe = (SA._fe || 0) + 1);
      /* feathered edge so the sharp aerial dissolves into the context base */
      const lg = s('mask', { id: fid, maskUnits: 'userSpaceOnUse', x, y, width: w, height: h }, defs);
      const gr = s('radialGradient', { id: fid + 'g', cx: 0.5, cy: 0.5, r: 0.62 }, defs);
      s('stop', { offset: 0.72, 'stop-color': '#fff' }, gr); s('stop', { offset: 1, 'stop-color': '#000' }, gr);
      s('rect', { x, y, width: w, height: h, fill: 'url(#' + fid + 'g)' }, lg);
      s('image', { href: 'img/layers/aerial_' + sfx + '.jpg', x, y, width: w, height: h, preserveAspectRatio: 'none', mask: 'url(#' + fid + ')', opacity: o.op }, g);
    }
    if (o.veg) SA.vegLayer(mv, g, o);
    return g;
  };
  SA.vegLayer = function (mv, parent, o) {
    o = o || {};
    const defs = SA.defs(mv.svg), id = 'vm' + (SA._vm = (SA._vm || 0) + 1);
    const C = I.context, x = -A.tx / A.s, y = -A.ty / A.s, w = A.w / A.s, h = A.h / A.s;
    const m = s('mask', { id, maskUnits: 'userSpaceOnUse', x: -2000, y: -2000, width: 4000, height: 4000 }, defs);
    s('image', { href: 'img/layers/context_veg.png', width: C.w, height: C.h, transform: 'matrix(' + C.m.join(' ') + ')', preserveAspectRatio: 'none' }, m);
    s('rect', { x, y, width: w, height: h, fill: '#000' }, m);                   /* inside the aerial frame use the finer mask */
    s('image', { href: 'img/layers/aerial_veg.png', x, y, width: w, height: h, preserveAspectRatio: 'none' }, m);
    const g = s('g', { class: 'veg', mask: 'url(#' + id + ')' }, parent || mv.layer('veg'));
    s('rect', { x: -2000, y: -2000, width: 4000, height: 4000, fill: o.dark ? 'rgba(126,160,106,.26)' : 'rgba(142,168,110,.30)' }, g);
    s('rect', { x: -2000, y: -2000, width: 4000, height: 4000, fill: SA.stipple(mv.svg, 'stp' + (o.dark ? 'd' : 'l'), o.dark ? '#9CC08A' : '#56773F', 2.2, 0.36) }, g);
    return g;
  };

  /* ---------------- drawing sheet ---------------- */
  SA.sheet = function (mv, o) {
    const host = mv.host;
    host.classList.add('sheet');
    const tb = el('div', { class: 'titleblock' }, host,
      '<span class="tb-no">' + o.no + '</span><span class="tb-t">' + o.title + '</span>' + (o.fa ? '<span class="tb-fa">' + o.fa + '</span>' : '') + '<span class="tb-src">' + (o.src || '') + '</span>');
    ['tl', 'tr', 'bl', 'br'].forEach((k) => el('i', { class: 'reg ' + k, 'aria-hidden': 'true' }, host));
    const tk = el('div', { class: 'ticks', 'aria-hidden': 'true' }, host);
    const prev = mv.onRefresh;
    mv.onRefresh = (ppm) => {
      prev && prev(ppm);
      const r = mv.svg.getBoundingClientRect(), q = mv.cur || mv.view, k = SA.stageScale || 1;
      if (!r.width) return;
      const W = r.width / k, H = r.height / k, vw = q[2] - q[0], vh = q[3] - q[1];
      const sc = Math.min(W / vw, H / vh), ox = (W - vw * sc) / 2, oy = (H - vh * sc) / 2;
      const nice = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000], step = nice.find((n) => n * sc > 70) || 5000;
      let h = '';
      for (let x = Math.ceil(q[0] / step) * step; x <= q[2]; x += step) { const X = ox + (x - q[0]) * sc; if (X < 40 || X > W - 40) continue; h += '<span class="tx" style="left:' + X.toFixed(0) + 'px">' + SA.toLatLon([x, 0])[1].toFixed(4) + '°</span>'; }
      for (let y = Math.ceil(q[1] / step) * step; y <= q[3]; y += step) { const Y = oy + (q[3] - y) * sc; if (Y < 40 || Y > H - 40) continue; h += '<span class="ty" style="top:' + Y.toFixed(0) + 'px">' + SA.toLatLon([0, y])[0].toFixed(4) + '°</span>'; }
      tk.innerHTML = h;
    };
    mv.refresh();
    return tb;
  };

  /* ---------------- annotation system ---------------- */
  SA.annot = function (mv, g, p, id, text, o) {
    o = o || {};
    const a = s('g', { class: 'annot' }, g), q = SA.P(p);
    const dir = o.dir || [1, 1];
    const line = s('path', { fill: 'none', stroke: o.color || 'currentColor', 'stroke-width': 0.8, class: 'ns an-l' }, a);
    const dot = s('circle', { cx: q[0], cy: q[1], fill: o.color || 'currentColor', class: 'an-d' }, a);
    const tag = s('text', { class: 'an-id', text: id }, a);
    const txt = s('text', { class: 'an-t', text }, a);
    SA.onScale(mv, (ppm) => {
      const L = (o.len || 34) / ppm, k = 1 / ppm, ex = q[0] + dir[0] * L, ey = q[1] - dir[1] * L, hx = ex + dir[0] * 14 * k;
      line.setAttribute('d', 'M' + q[0] + ' ' + q[1] + ' L' + ex + ' ' + ey + ' L' + hx + ' ' + ey);
      dot.setAttribute('r', 2.2 * k);
      const anchor = dir[0] > 0 ? 'start' : 'end', tx = hx + dir[0] * 3 * k;
      tag.setAttribute('x', tx); tag.setAttribute('y', ey - 2 * k); tag.setAttribute('text-anchor', anchor); tag.style.fontSize = 8.5 * k + 'px';
      txt.setAttribute('x', tx); txt.setAttribute('y', ey + 10 * k); txt.setAttribute('text-anchor', anchor); txt.style.fontSize = 10.5 * k + 'px';
      [tag, txt].forEach((t) => { t.style.strokeWidth = 3.2 * k + 'px'; });
    });
    return a;
  };
  SA.revealAnnots = function (root) { SA.$$('.annot', root).forEach((a, i) => setTimeout(() => a.classList.add('on'), 250 + i * 160)); };

  /* ---------------- spatial entrance: zoom into place on first view ---------------- */
  SA.enterZoom = function (mv, k) {
    if (SA.reduced) return;
    const h = mv.home, cx = (h[0] + h[2]) / 2, cy = (h[1] + h[3]) / 2, w = ((h[2] - h[0]) * (k || 1.6)) / 2, hh = ((h[3] - h[1]) * (k || 1.6)) / 2;
    mv.setView([cx - w, cy - hh, cx + w, cy + hh], 0);
    mv.host.classList.add('pre');
    SA.observe(mv.host, () => { mv.host.classList.remove('pre'); mv.setView(h, 1700); SA.revealAnnots(mv.host); });
  };
})();
