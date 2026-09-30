/* Deck engine: fit-to-screen canvas, one slide at a time, prev/next, keyboard, swipe, right-side menu, hash. */
(function () {
  'use strict';
  const SA = window.SA, el = SA.el;
  const stage = SA.$('#stage'), slides = SA.$$('.slide', stage);
  const N = slides.length - 2; /* numbered slides exclude start + appendix */
  let cur = 0;

  /* ---- scale 1600×900 canvas to the window ---- */
  function fit() {
    const k = Math.min(innerWidth / 1600, innerHeight / 900);
    SA.stageScale = k;
    stage.style.transform = 'translate(-50%, -50%) scale(' + k + ')';
    SA.maps.forEach((m) => m.refresh());
  }
  SA.maps = [];
  const MV = SA.MapViewer;
  SA.MapViewer = function (h, o) { MV.call(this, h, o); SA.maps.push(this); };
  SA.MapViewer.prototype = MV.prototype;

  /* ---- build slides (each builder receives its section) ---- */
  const built = new Set();
  function build(i) {
    const sec = slides[i], id = sec.dataset.id;
    if (built.has(id)) return; built.add(id);
    const fn = SA.slides[id];
    if (fn) { try { fn(sec); } catch (e) { console.error('[slide ' + id + ']', e); } }
    SA.prepDraw(sec);
  }

  /* ---- menu ---- */
  const menu = SA.$('#menu'), list = SA.$('#menu-list'), tab = SA.$('#menu-tab');
  const faN = (i) => (i === 0 ? '—' : i > N ? 'پ' : SA.fa(String(i).padStart(2, '0')));
  slides.forEach((sec, i) => {
    const li = el('li', null, list);
    const b = el('button', { type: 'button' }, li, '<span class="n">' + faN(i) + '</span><span>' + sec.dataset.menu + '</span>');
    b.addEventListener('click', () => { go(i); closeMenu(); });
    sec._mb = b;
  });
  const openMenu = () => { menu.classList.add('open'); tab.setAttribute('aria-expanded', 'true'); };
  const closeMenu = () => { menu.classList.remove('open'); tab.setAttribute('aria-expanded', 'false'); };
  tab.addEventListener('click', openMenu);
  tab.addEventListener('mouseenter', openMenu);
  menu.addEventListener('mouseleave', closeMenu);

  /* ---- navigation ---- */
  const prev = SA.$('#prev'), next = SA.$('#next'), cnt = SA.$('#cnt'), ctrl = SA.$('#ctrl'), prog = SA.$('#prog');
  function go(i, instant) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    const back = i < cur;
    build(i); if (slides[i + 1]) setTimeout(() => build(i + 1), 450);
    slides.forEach((sec, j) => { sec.classList.toggle('on', j === i); sec.classList.toggle('back', j !== i && back); sec.setAttribute('aria-hidden', j === i ? 'false' : 'true'); if ('inert' in sec) sec.inert = j !== i; });
    const was = slides[cur]; cur = i;
    if (was !== slides[i] && was._leave) was._leave();
    const sec = slides[i];
    requestAnimationFrame(() => { SA.maps.forEach((m) => sec.contains(m.host) && m.refresh()); sec._enter && sec._enter(); });
    SA.tip.hide();
    const dark = sec.classList.contains('dark');
    ctrl.classList.toggle('dk', dark); menu.classList.toggle('dk', dark);
    ctrl.classList.toggle('hide', i === 0);
    prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    cnt.innerHTML = i === 0 ? '' : i > N ? 'پیوست' : '<b>' + SA.fa(String(i).padStart(2, '0')) + '</b> / ' + SA.fa(String(N).padStart(2, '0'));
    prog.style.width = ((i / (slides.length - 1)) * 100).toFixed(1) + '%';
    slides.forEach((x) => x._mb.setAttribute('aria-current', x === sec ? 'true' : 'false'));
    if (history.replaceState) history.replaceState(null, '', '#' + sec.dataset.id);
    if (instant) void 0;
  }
  SA.go = go;
  prev.addEventListener('click', () => go(cur - 1));
  next.addEventListener('click', () => go(cur + 1));
  SA.$('#start-btn').addEventListener('click', () => go(1));
  addEventListener('keydown', (e) => {
    if (SA.$('.iv.on')) return; /* the image viewer owns the keyboard while open */
    if (/input|textarea|select/i.test(document.activeElement.tagName) && document.activeElement.type !== 'button') return;
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(cur + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(slides.length - 1);
  });
  /* swipe (touch): RTL — swipe right = next */
  let tx = null, ty = null;
  addEventListener('touchstart', (e) => { if (SA.$('.iv.on')) return; tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  addEventListener('touchend', (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('.mapframe')) go(cur + (dx > 0 ? 1 : -1));
  });
  /* wheel does NOT scroll the deck (no vertical scroll navigation) */
  addEventListener('wheel', (e) => { if (!e.target.closest('.iv')) e.preventDefault(); }, { passive: false });

  addEventListener('resize', fit);
  fit();
  const start = Math.max(0, slides.findIndex((x) => '#' + x.dataset.id === location.hash));
  build(0); go(start);
  document.documentElement.classList.add('ready');
})();
