/* Reusable components: Tooltip · MapViewer · LayerControl · Legend · ImageViewer · Navigation · Scrolly · Donut */
(function () {
  'use strict';
  const SA = window.SA, s = SA.s, el = SA.el;
  const ORIGIN = [35.7065, 51.393], KX = 111320 * Math.cos((35.7065 * Math.PI) / 180), KY = 111000;
  SA.toLatLon = (p) => [ORIGIN[0] + p[1] / KY, ORIGIN[1] + p[0] / KX];

  /* ============================== Tooltip ============================== */
  const tip = el('div', { class: 'tip', role: 'tooltip' }, document.body);
  SA.tip = {
    show(ev, html) { tip.innerHTML = html; tip.classList.add('on'); this.move(ev); },
    move(ev) {
      if (!ev) return;
      const pad = 16, w = tip.offsetWidth, h = tip.offsetHeight;
      let x = ev.clientX + pad, y = ev.clientY + pad;
      if (x + w > innerWidth - 8) x = ev.clientX - w - pad;
      if (y + h > innerHeight - 8) y = ev.clientY - h - pad;
      tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
    },
    hide() { tip.classList.remove('on'); },
  };
  /* standard data card */
  SA.card = function (o) {
    let h = '';
    if (o.k) h += '<div class="k">' + SA.esc(o.k) + '</div>';
    if (o.big) h += '<div class="big">' + o.big + '</div>';
    if (o.t) h += '<div class="t">' + SA.esc(o.t) + '</div>';
    if (o.e) h += '<div class="e">' + SA.esc(o.e) + '</div>';
    if (o.img) h += '<img src="' + o.img + '" alt="">';
    if (o.rows && o.rows.length) h += '<div class="rows">' + o.rows.map((r) => '<div><span>' + SA.esc(r[0]) + '</span><b>' + SA.esc(r[1]) + '</b></div>').join('') + '</div>';
    if (o.src) h += '<div class="src">' + SA.esc(o.src) + '</div>';
    return h;
  };

  /* ============================== MapViewer ============================== */
  /* view = [xmin, ymin, xmax, ymax] in local metres (y north). */
  function MapViewer(host, o) {
    this.o = o = Object.assign({ grid: 0, north: true, scale: true, zoom: false, coords: true }, o);
    this.host = host; host.classList.add('mapframe');
    this.svg = s('svg', { xmlns: 'http://www.w3.org/2000/svg', preserveAspectRatio: o.fit || 'xMidYMid meet', role: 'img', 'aria-label': o.label || 'map' }, host);
    this.world = s('g', { class: 'world' }, this.svg);
    this.layers = {};
    this.view = o.view.slice(); this.home = o.view.slice();
    this.setView(this.view, 0);
    if (o.grid) this.gridLayer(o.grid);
    this.over = el('div', { class: 'overlay' }, host);
    if (o.scale) { this.sb = el('div', { class: 'scalebar' }, host); }
    if (o.north) el('div', { class: 'northarrow', 'aria-hidden': 'true' }, host,
      '<svg viewBox="0 0 24 40"><path d="M12 2 L19 30 L12 25 Z" fill="currentColor"/><path d="M12 2 L5 30 L12 25 Z" fill="none" stroke="currentColor" stroke-width="1.1"/><text x="12" y="39" text-anchor="middle">N</text></svg>');
    if (o.corners) for (const k in o.corners) el('div', { class: 'corner ' + k }, host, o.corners[k]);
    if (o.coords) this.coordLabel = el('div', { class: 'corner bl coord' }, host);
    if (o.zoom) this.zoomUI();
    const ro = new ResizeObserver(() => this.refresh());
    ro.observe(host);
    this.svg.addEventListener('pointerleave', () => this.unhot());
  }
  MapViewer.prototype = {
    layer(name, opt) {
      if (this.layers[name]) return this.layers[name].g;
      opt = opt || {};
      const g = s('g', { class: 'layer' + (opt.on === false ? ' off' : ''), 'data-layer': name }, opt.parent || this.world);
      this.layers[name] = Object.assign({ g, name, on: opt.on !== false }, opt);
      return g;
    },
    toggle(name, on) {
      const L = this.layers[name]; if (!L) return;
      L.on = on == null ? !L.on : on; L.g.classList.toggle('off', !L.on);
      if (L.on) SA.$$('.draw', L.g).forEach((p) => { p.classList.remove('on'); void p.getBoundingClientRect(); p.classList.add('on'); });
      this.onToggle && this.onToggle(name, L.on);
    },
    setView(v, dur) {
      const from = this.view.slice(), to = v.slice(); this.view = to;
      const apply = (q) => { this.svg.setAttribute('viewBox', q[0] + ' ' + -q[3] + ' ' + (q[2] - q[0]) + ' ' + (q[3] - q[1])); this.cur = q; this.refresh(); };
      if (!dur || SA.reduced) return apply(to);
      cancelAnimationFrame(this._raf);
      const t0 = performance.now(), ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
      /* interpolate centre + log-size for a cinematic zoom */
      const c = (q) => [(q[0] + q[2]) / 2, (q[1] + q[3]) / 2, Math.log(q[2] - q[0]), Math.log(q[3] - q[1])];
      const A = c(this.cur || from), B = c(to);
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = ease(k);
        const cx = A[0] + (B[0] - A[0]) * e, cy = A[1] + (B[1] - A[1]) * e, w = Math.exp(A[2] + (B[2] - A[2]) * e), h = Math.exp(A[3] + (B[3] - A[3]) * e);
        apply([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]);
        if (k < 1) this._raf = requestAnimationFrame(step);
      };
      this._raf = requestAnimationFrame(step);
    },
    ppm() { /* screen px per metre */
      const r = this.svg.getBoundingClientRect(), q = this.cur || this.view;
      if (!r.width) return 0;
      const sx = r.width / (q[2] - q[0]), sy = r.height / (q[3] - q[1]);
      return (this.o.fit || '').indexOf('slice') > -1 ? Math.max(sx, sy) : Math.min(sx, sy);
    },
    refresh() {
      const ppm = this.ppm(); if (!ppm) return;
      if (this.sb) {
        const target = 110 / ppm, nice = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
        let m = nice[0]; for (const n of nice) if (n <= target) m = n;
        const w = m * ppm, lab = m >= 1000 ? m / 1000 + ' km' : m + ' m';
        this.sb.innerHTML = '<span style="width:' + w.toFixed(0) + 'px"><i></i><i></i></span><em>0</em><em style="left:' + (w / 2).toFixed(0) + 'px">' + (m >= 1000 ? m / 2000 : m / 2) + '</em><em style="left:' + w.toFixed(0) + 'px">' + lab + '</em>';
      }
      if (this.coordLabel) {
        const q = this.cur || this.view, c = SA.toLatLon([(q[0] + q[2]) / 2, (q[1] + q[3]) / 2]);
        this.coordLabel.textContent = c[0].toFixed(4) + '° N  ' + c[1].toFixed(4) + '° E';
      }
      this.onRefresh && this.onRefresh(ppm);
    },
    gridLayer(step) {
      const g = this.layer('grid', { parent: this.world }), v = this.home, pad = step * 40;
      g.setAttribute('class', 'layer gx-grid');
      const x0 = Math.floor((v[0] - pad) / step) * step, x1 = v[2] + pad, y0 = Math.floor((v[1] - pad) / step) * step, y1 = v[3] + pad;
      for (let x = x0; x <= x1; x += step) s('line', { x1: x, x2: x, y1: -y1, y2: -y0, class: x % (step * 5) === 0 ? 'maj' : null }, g);
      for (let y = y0; y <= y1; y += step) s('line', { y1: -y, y2: -y, x1: x0, x2: x1, class: y % (step * 5) === 0 ? 'maj' : null }, g);
      this.world.insertBefore(g, this.world.firstChild);
    },
    aerial(opt) {
      const A = window.SA_GEO.aerial, g = this.layer('aerial', Object.assign({ label: 'Aerial base', fa: 'تصویر هوایی' }, opt));
      this.world.insertBefore(g, this.world.firstChild.nextSibling || null);
      const img = s('image', { href: 'img/source/aerial_clean.jpg', x: -A.tx / A.s, y: -A.ty / A.s, width: A.w / A.s, height: A.h / A.s, preserveAspectRatio: 'none', class: 'aer' }, g);
      if (opt && opt.filter) img.setAttribute('style', 'filter:' + opt.filter);
      if (opt && opt.opacity != null) img.setAttribute('opacity', opt.opacity);
      return g;
    },
    /* hover: el gets .feat; data = card object or function returning one; group = selector key to co-highlight */
    hover(node, data, group) {
      node.classList.add('feat');
      if (group) node.setAttribute('data-g', group);
      const on = (ev) => {
        this.unhot(); this.svg.classList.add('hovering');
        (group ? SA.$$('[data-g="' + group + '"]', this.svg) : [node]).forEach((n) => n.classList.add('hot'));
        const c = typeof data === 'function' ? data() : data;
        if (c) SA.tip.show(ev, SA.card(c));
        this.onHot && this.onHot(group || node, true);
      };
      node.addEventListener('pointerenter', on);
      node.addEventListener('pointermove', (ev) => SA.tip.move(ev));
      node.addEventListener('pointerleave', () => this.unhot());
      node.addEventListener('focus', (ev) => { const r = node.getBoundingClientRect(); on({ clientX: r.left + r.width / 2, clientY: r.top }); });
      node.addEventListener('blur', () => this.unhot());
      return node;
    },
    hot(group) {
      this.unhot(); this.svg.classList.add('hovering');
      SA.$$('[data-g="' + group + '"]', this.svg).forEach((n) => n.classList.add('hot'));
    },
    unhot() {
      this.svg.classList.remove('hovering');
      SA.$$('.hot', this.svg).forEach((n) => n.classList.remove('hot'));
      SA.tip.hide(); this.onHot && this.onHot(null, false);
    },
    zoomUI() {
      const z = el('div', { class: 'zoomctl' }, this.host,
        '<button type="button" aria-label="بزرگ‌نمایی">+</button><button type="button" aria-label="کوچک‌نمایی">−</button><button type="button" aria-label="نمای کامل">کل</button>');
      const [bi, bo, br] = z.children;
      const zoom = (f) => { const q = this.view, cx = (q[0] + q[2]) / 2, cy = (q[1] + q[3]) / 2, w = ((q[2] - q[0]) * f) / 2, h = ((q[3] - q[1]) * f) / 2; this.setView([cx - w, cy - h, cx + w, cy + h], 500); };
      bi.onclick = () => zoom(0.66); bo.onclick = () => zoom(1.5); br.onclick = () => this.setView(this.home, 700);
      /* drag to pan */
      let st = null;
      this.svg.addEventListener('pointerdown', (e) => { if (e.button) return; st = { x: e.clientX, y: e.clientY, v: this.view.slice() }; });
      addEventListener('pointerup', () => (st = null));
      this.svg.addEventListener('pointermove', (e) => {
        if (!st || e.pointerType === 'touch') return;
        const ppm = this.ppm(), dx = (e.clientX - st.x) / ppm, dy = (e.clientY - st.y) / ppm;
        if (Math.abs(dx) + Math.abs(dy) < 2 / ppm) return;
        this.setView([st.v[0] - dx, st.v[1] + dy, st.v[2] - dx, st.v[3] + dy], 0);
      });
    },
    /* text label in world coords, constant screen size handled by vector-effect-less font sizing via ppm */
    label(p, text, cls, opt) {
      opt = opt || {};
      const q = SA.P(p), t = s('text', { x: q[0], y: q[1], class: cls || 'lbl', 'text-anchor': opt.anchor || 'middle', 'dominant-baseline': 'middle', text }, opt.parent || this.layer(opt.layer || 'labels'));
      if (opt.rot) t.setAttribute('transform', 'rotate(' + opt.rot + ' ' + q[0] + ' ' + q[1] + ')');
      t.dataset.fs = opt.size || (cls && cls.indexOf('fa') > -1 ? 12 : 10.5);
      (this._labels = this._labels || []).push(t);
      return t;
    },
  };
  /* keep labels at constant screen size */
  const _refresh = MapViewer.prototype.refresh;
  MapViewer.prototype.refresh = function () {
    _refresh.call(this);
    const ppm = this.ppm(); if (!ppm || !this._labels) return;
    for (const t of this._labels) { t.style.fontSize = (t.dataset.fs / ppm).toFixed(3) + 'px'; t.style.strokeWidth = (3.6 / ppm).toFixed(3) + 'px'; }
    this.svg.style.setProperty('--u', 1 / ppm);
  };
  SA.MapViewer = MapViewer;

  /* ============================== LayerControl ============================== */
  SA.LayerControl = function (host, mv, names, title) {
    const box = el('div', { class: 'layers' }, host);
    const h = el('h4', null, box, '<span>' + (title || 'Layers') + '</span><button type="button">All</button>');
    const inputs = [];
    names.forEach((n) => {
      const L = mv.layers[n]; if (!L) return;
      const lab = el('label', null, box);
      const inp = el('input', { type: 'checkbox' }, lab); inp.checked = L.on;
      el('span', { class: 'sw', style: L.sw || 'background:var(--ink)' }, lab);
      el('span', null, lab, L.label || n);
      el('span', { class: 'fa-s' }, lab, L.fa || '');
      inp.addEventListener('change', () => mv.toggle(n, inp.checked));
      inputs.push([n, inp]);
    });
    const sync = () => inputs.forEach(([n, i]) => (i.checked = mv.layers[n].on));
    const prev = mv.onToggle; mv.onToggle = (n, on) => { prev && prev(n, on); sync(); };
    h.querySelector('button').onclick = () => { const all = inputs.every(([, i]) => i.checked); inputs.forEach(([n]) => mv.toggle(n, !all)); };
    return { sync };
  };

  /* ============================== Legend swatch svg ============================== */
  SA.sw = function (kind, color, extra) {
    if (kind === 'line') return '<svg viewBox="0 0 26 12"><line x1="1" y1="6" x2="25" y2="6" stroke="' + color + '" stroke-width="' + (extra || 3) + '" stroke-linecap="round"/></svg>';
    if (kind === 'dash') return '<svg viewBox="0 0 26 12"><line x1="1" y1="6" x2="25" y2="6" stroke="' + color + '" stroke-width="2" stroke-dasharray="3 3"/></svg>';
    if (kind === 'dot') return '<svg viewBox="0 0 26 12"><circle cx="13" cy="6" r="4.5" fill="' + color + '"/></svg>';
    if (kind === 'arrow') return '<svg viewBox="0 0 26 12"><path d="M1 6H20" stroke="' + color + '" stroke-width="2"/><path d="M18 2L25 6L18 10Z" fill="' + color + '"/></svg>';
    return '<svg viewBox="0 0 26 12"><rect x="1" y="1" width="24" height="10" fill="' + color + '" ' + (extra || '') + '/></svg>';
  };
  SA.legend = function (host, items, click) {
    const L = el('div', { class: 'legend' + (click ? ' click' : '') }, host);
    items.forEach((it) => {
      const row = el('div', { class: 'it', tabindex: click ? 0 : null }, L, SA.sw(it.kind, it.color, it.extra) + '<span>' + it.en + '</span><span class="fa-inline">' + (it.fa || '') + '</span>');
      if (click) {
        row.addEventListener('pointerenter', () => click(it, true));
        row.addEventListener('pointerleave', () => click(it, false));
        row.addEventListener('focus', () => click(it, true));
        row.addEventListener('blur', () => click(it, false));
      }
      it.row = row;
    });
    return L;
  };

  /* ============================== ImageViewer ============================== */
  const IV = {};
  (function () {
    const root = el('div', { class: 'iv', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Image viewer' }, document.body,
      '<div class="bar"><span class="ttl"></span><div class="ctl"><button type="button" data-a="out" aria-label="کوچک‌نمایی">−</button><button type="button" data-a="in" aria-label="بزرگ‌نمایی">+</button><button type="button" data-a="fit" aria-label="اندازه‌ی کامل">⤢</button><button type="button" data-a="x" aria-label="بستن (Esc)">✕</button></div></div>' +
      '<div class="stage"><img alt=""></div>' +
      '<button type="button" class="nav prev" aria-label="قبلی">←</button><button type="button" class="nav next" aria-label="بعدی">→</button>' +
      '<div class="cap"><div><div class="fa"></div><div class="en"></div></div><div class="strip"></div></div>');
    const stage = root.querySelector('.stage'), img = stage.querySelector('img'), ttl = root.querySelector('.ttl');
    const cfa = root.querySelector('.cap .fa'), cen = root.querySelector('.cap .en'), strip = root.querySelector('.strip');
    const prev = root.querySelector('.prev'), next = root.querySelector('.next');
    let list = [], i = 0, z = 1, fit = 1, tx = 0, ty = 0, lastFocus = null;
    const W = () => img.naturalWidth || 1000, H = () => img.naturalHeight || 800;
    function apply(anim) {
      img.style.transition = anim ? 'transform .3s cubic-bezier(.22,.61,.36,1), opacity .25s' : 'opacity .25s';
      img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + z + ')';
      stage.classList.toggle('zoomed', z > fit * 1.01);
    }
    function doFit(anim) {
      const r = stage.getBoundingClientRect();
      fit = Math.min(r.width / W(), r.height / H(), 2.5); z = fit; tx = -(W() * z) / 2; ty = -(H() * z) / 2; apply(anim);
    }
    function zoomAt(f, cx, cy) {
      const r = stage.getBoundingClientRect();
      const px = (cx == null ? r.width / 2 : cx - r.left) - r.width / 2, py = (cy == null ? r.height / 2 : cy - r.top) - r.height / 2;
      const nz = Math.max(fit, Math.min(fit * 8, z * f)), k = nz / z;
      tx = px - (px - tx) * k; ty = py - (py - ty) * k; z = nz; apply(true);
    }
    function show(k) {
      i = (k + list.length) % list.length; const it = list[i];
      img.classList.add('loading'); img.onload = () => { img.classList.remove('loading'); doFit(false); };
      img.src = it.src; img.alt = it.en || it.fa || '';
      ttl.textContent = (it.group || 'Source') + '  ·  ' + (i + 1) + ' / ' + list.length + (it.no ? '  ·  ' + it.no : '');
      cfa.textContent = it.fa || ''; cen.textContent = it.en || '';
      prev.hidden = next.hidden = list.length < 2;
      strip.innerHTML = list.length > 1 && list.length < 40 ? list.map((_, j) => '<button type="button" aria-label="' + (j + 1) + '"' + (j === i ? ' aria-current="true"' : '') + '></button>').join('') : '';
      SA.$$('button', strip).forEach((b, j) => (b.onclick = () => show(j)));
      /* preload neighbour */
      if (list.length > 1) { const n = new Image(); n.src = list[(i + 1) % list.length].src; }
    }
    IV.open = function (items, k) {
      list = items; lastFocus = document.activeElement; root.classList.add('on'); document.body.style.overflow = 'hidden';
      show(k || 0); root.querySelector('[data-a="x"]').focus();
    };
    IV.close = function () { root.classList.remove('on'); document.body.style.overflow = ''; img.removeAttribute('src'); lastFocus && lastFocus.focus && lastFocus.focus(); };
    root.querySelector('.ctl').addEventListener('click', (e) => {
      const a = e.target.closest('button'); if (!a) return;
      ({ in: () => zoomAt(1.5), out: () => zoomAt(1 / 1.5), fit: () => doFit(true), x: IV.close })[a.dataset.a]();
    });
    prev.onclick = () => show(i - 1); next.onclick = () => show(i + 1);
    /* click outside the picture closes */
    root.addEventListener('click', (e) => {
      if (e.target === root || e.target.classList.contains('cap') || (e.target === stage && !moved)) {
        const r = img.getBoundingClientRect();
        if (e.target === stage && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) return;
        IV.close();
      }
    });
    img.addEventListener('click', (e) => { if (moved) return; if (z <= fit * 1.01) zoomAt(2.2, e.clientX, e.clientY); else doFit(true); });
    stage.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY); }, { passive: false });
    /* drag + pinch */
    const pts = new Map(); let moved = false, start = null;
    stage.addEventListener('pointerdown', (e) => { stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); moved = false; start = { tx, ty, z, d: pinchD() }; stage.classList.add('drag'); });
    stage.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      const p0 = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && start.d) { const d = pinchD(); zoomAt(d / (start.d || d), e.clientX, e.clientY); start.d = d; moved = true; return; }
      const dx = e.clientX - p0[0], dy = e.clientY - p0[1];
      if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;
      if (z > fit * 1.01) { tx += dx; ty += dy; apply(false); }
      else if (list.length > 1 && pts.size === 1) start.swipe = (start.swipe || 0) + dx;
    });
    const up = (e) => {
      pts.delete(e.pointerId); stage.classList.remove('drag');
      if (start && start.swipe && Math.abs(start.swipe) > 60 && z <= fit * 1.01) show(i + (start.swipe < 0 ? 1 : -1));
      if (start) start.swipe = 0;
      setTimeout(() => (moved = false), 0);
    };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    function pinchD() { if (pts.size < 2) return 0; const [a, b] = [...pts.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); }
    addEventListener('keydown', (e) => {
      if (!root.classList.contains('on')) return;
      if (e.key === 'Escape') IV.close();
      else if (e.key === 'ArrowRight') show(i + 1);
      else if (e.key === 'ArrowLeft') show(i - 1);
      else if (e.key === '+' || e.key === '=') zoomAt(1.4);
      else if (e.key === '-') zoomAt(1 / 1.4);
      else if (e.key === 'Tab') { /* focus trap */
        const f = SA.$$('button:not([hidden])', root); const a = f.indexOf(document.activeElement);
        e.preventDefault(); f[(a + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    addEventListener('resize', () => root.classList.contains('on') && doFit(false));
  })();
  SA.viewer = IV;
  /* make a thumbnail element that opens a gallery */
  SA.thumb = function (host, list, k, opt) {
    opt = opt || {};
    const it = list[k];
    const b = el('button', { type: 'button', class: 'zoomable ' + (opt.cls || ''), 'aria-label': 'Open image: ' + (it.en || it.fa || ''), style: opt.style }, host);
    el('img', { src: it.thumb || it.src, alt: it.en || it.fa || '', loading: 'lazy', decoding: 'async' }, b);
    b.addEventListener('click', () => SA.viewer.open(list, k));
    return b;
  };

  /* ============================== Navigation ============================== */
  SA.Navigation = function () {
    const rail = SA.$('.rail'), list = rail.querySelector('ol'), bar = rail.querySelector('.prog i');
    const secs = SA.$$('[data-nav]');
    let grp = null;
    secs.forEach((sec) => {
      if (sec.dataset.grp && sec.dataset.grp !== grp) { grp = sec.dataset.grp; el('li', { class: 'grp', 'aria-hidden': 'true' }, list, grp); }
      const li = el('li', null, list);
      const a = el('a', { href: '#' + sec.id }, li, '<span class="n">' + sec.dataset.no + '</span><span>' + sec.dataset.nav + '</span>');
      a.addEventListener('click', () => rail.classList.remove('open'));
      sec._a = a;
    });
    const top = SA.$('.topbar'), cur = top && top.querySelector('.cur');
    top && top.querySelector('button').addEventListener('click', () => rail.classList.toggle('open'));
    document.addEventListener('click', (e) => { if (rail.classList.contains('open') && !rail.contains(e.target) && !top.contains(e.target)) rail.classList.remove('open'); });
    let active = null;
    const setActive = (sec) => {
      if (active === sec) return; active = sec;
      secs.forEach((x) => x._a.setAttribute('aria-current', x === sec ? 'true' : 'false'));
      rail.classList.toggle('on-dark', sec.classList.contains('dark') && innerWidth > 1180);
      if (cur) cur.innerHTML = '<b>' + sec.dataset.no + '</b><span>' + sec.dataset.nav + '</span>';
      const a = sec._a; const r = a.getBoundingClientRect(), lr = list.getBoundingClientRect();
      if (r.top < lr.top || r.bottom > lr.bottom) list.scrollTop += r.top - lr.top - lr.height / 2;
      if (history.replaceState) history.replaceState(null, '', '#' + sec.id);
    };
    const onScroll = () => {
      const mid = innerHeight * 0.35; let best = secs[0];
      for (const sct of secs) if (sct.getBoundingClientRect().top <= mid) best = sct;
      setActive(best);
      const h = document.documentElement; bar.style.width = ((h.scrollTop / (h.scrollHeight - innerHeight)) * 100).toFixed(1) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
    /* keyboard: PageDown/PageUp jump sections when not typing */
    addEventListener('keydown', (e) => {
      if (SA.$('.iv.on') || /input|textarea|select/i.test(document.activeElement.tagName)) return;
      const k = secs.indexOf(active);
      if (e.key === 'PageDown' || (e.key === 'ArrowDown' && e.altKey)) { e.preventDefault(); secs[Math.min(secs.length - 1, k + 1)].scrollIntoView({ behavior: SA.reduced ? 'auto' : 'smooth' }); }
      if (e.key === 'PageUp' || (e.key === 'ArrowUp' && e.altKey)) { e.preventDefault(); secs[Math.max(0, k - 1)].scrollIntoView({ behavior: SA.reduced ? 'auto' : 'smooth' }); }
    });
  };

  /* ============================== Scrolly ============================== */
  SA.scrolly = function (root, onStep) {
    const steps = SA.$$('.step', root); let cur = -1;
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        if (!e.isIntersecting) return;
        const k = steps.indexOf(e.target); if (k === cur) return; cur = k;
        steps.forEach((x, j) => x.classList.toggle('act', j === k)); onStep(k);
      });
    }, { rootMargin: '-48% 0px -48% 0px' });
    steps.forEach((x) => io.observe(x));
    return { steps };
  };

  /* ============================== Donut ============================== */
  SA.donut = function (host, data, o) {
    o = Object.assign({ r: 80, w: 16, gap: 0.012, center: '' }, o);
    const size = (o.r + o.w) * 2 + 4, c = size / 2;
    const svg = s('svg', { viewBox: '0 0 ' + size + ' ' + size, class: 'donut' }, host);
    const tot = data.reduce((a, d) => a + d.v, 0); let a0 = -Math.PI / 2;
    const arcs = data.map((d) => {
      const a1 = a0 + (d.v / tot) * Math.PI * 2, g = Math.min(o.gap, (a1 - a0) / 3);
      const p = (a, r) => [c + r * Math.cos(a), c + r * Math.sin(a)];
      const R = o.r, big = a1 - a0 - 2 * g > Math.PI ? 1 : 0, A = p(a0 + g, R), B = p(a1 - g, R);
      const path = s('path', { d: 'M' + A + ' A' + R + ' ' + R + ' 0 ' + big + ' 1 ' + B, fill: 'none', stroke: d.color, 'stroke-width': o.w, class: 'arc draw', 'data-k': d.k }, svg);
      a0 = a1; d.path = path; return path;
    });
    const t1 = s('text', { x: c, y: c - 4, 'text-anchor': 'middle', class: 'dn-v', text: o.center }, svg);
    const t2 = s('text', { x: c, y: c + 16, 'text-anchor': 'middle', class: 'dn-l', text: o.sub || '' }, svg);
    SA.prepDraw(svg);
    SA.observe(svg, () => arcs.forEach((p, i) => setTimeout(() => p.classList.add('on'), i * 120)));
    return {
      svg, focus(k) {
        data.forEach((d) => d.path.style.opacity = k == null || d.k === k ? 1 : 0.18);
        const d = data.find((x) => x.k === k);
        t1.textContent = d ? ((d.v / tot) * 100).toFixed(1) + '%' : o.center; t2.textContent = d ? d.en : o.sub || '';
      },
    };
  };
})();
