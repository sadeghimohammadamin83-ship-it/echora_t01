/* Vertical slide navigation — the page stays a top-to-bottom story, but moves in discrete "slides":
   every section top, every narrative step of a sticky section, and extra pages inside tall sections.
   ↓ / ↑ buttons, ArrowDown/Up, PageDown/Up, Space, one wheel gesture = one slide, swipe on touch. */
(function () {
  'use strict';
  const SA = window.SA, el = SA.el;
  SA.Stepper = function () {
    let stops = [], cur = 0, anim = null, lockUntil = 0;
    const H = () => innerHeight;
    const topOf = (e) => e.getBoundingClientRect().top + scrollY;
    const desk = () => innerWidth > 900 && innerHeight > 480;
    /* every section header is pinned while its slide is on screen; --hh = its height, used by the CSS to size the rest */
    function measure() {
      SA.$$('[data-nav]').forEach((sec) => { const h = sec.querySelector(':scope > .sec-head'); sec.style.setProperty('--hh', (h && desk() ? h.offsetHeight + 12 : 0) + 'px'); });
    }
    function build() {
      measure();
      const out = [], vh = H();
      SA.$$('[data-nav]').forEach((sec) => {
        const t = topOf(sec), h = sec.offsetHeight, hh = parseFloat(sec.style.getPropertyValue('--hh')) || 0;
        const steps = SA.$$('.scrolly .step', sec), sc = sec.querySelector('.scrolly');
        /* the first slide of a section: the header on top and the first content block (or sticky stage) right under it */
        const first = [...sec.children].find((c) => !c.classList.contains('sec-head') && c.offsetHeight >= 8);
        let y0 = t;
        if (desk() && first && topOf(first) + Math.min(first.offsetHeight, vh) > t + vh - 6) y0 = Math.max(t, topOf(first) - hh - (sc === first ? 2 : 10));
        out.push({ y: y0, sec, head: true });
        if (steps.length) { steps.forEach((st) => out.push({ y: Math.max(y0 + 41, topOf(st) + st.offsetHeight / 2 - vh / 2), sec })); }
        /* content blocks after the header (direct children, and the cells of grids) */
        const blocks = [];
        [...sec.children].forEach((c) => {
          if (c.classList.contains('sec-head') || c.classList.contains('scrolly') || c.offsetHeight < 8) return;
          if (c.classList.contains('grid')) [...c.children].forEach((g) => g.offsetHeight > 8 && blocks.push(g)); else blocks.push(c);
        });
        const scrollyEnd = steps.length ? topOf(sec.querySelector('.scrolly')) + sec.querySelector('.scrolly').offsetHeight : t;
        let page = steps.length ? scrollyEnd - vh : y0;             /* top of the screen currently shown */
        const room = vh - hh - 16;
        blocks.map((e) => ({ top: topOf(e), bot: topOf(e) + e.offsetHeight })).sort((x, y) => x.top - y.top).forEach((bl) => {
          if (bl.bot <= page + vh - 6) return;                      /* already fully visible */
          page = bl.top - hh - 10; out.push({ y: page, sec });       /* new slide: block starts under the pinned header */
          while (bl.bot > page + vh - 6) { page += room; out.push({ y: page, sec }); }   /* taller than one screen */
        });
        /* never page past the section's end: no slide shows the top of the next section */
        const lim = t + h - vh;
        if (lim > y0) out.forEach((q) => { if (q.sec === sec && !q.head && q.y > lim) q.y = lim; });
      });
      const max = document.documentElement.scrollHeight - vh;
      stops = out.map((q) => ({ y: Math.max(0, Math.min(max, Math.round(q.y))), sec: q.sec })).sort((x, y) => x.y - y.y)
        .filter((q, i, arr) => i === 0 || q.y - arr[i - 1].y > 40);
      sync();
    }
    SA.__stops = () => stops;
    function sync() { let k = 0; for (let i = 0; i < stops.length; i++) if (stops[i].y <= scrollY + 8) k = i; cur = k; ui(); }
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    function go(k) {
      k = Math.max(0, Math.min(stops.length - 1, k));
      const from = scrollY, to = stops[k].y, d = Math.abs(to - from);
      cur = k; ui();
      cancelAnimationFrame(anim);
      if (SA.reduced || d < 2) { scrollTo(0, to); return; }
      const dur = Math.min(1300, 650 + d * 0.35), t0 = performance.now();
      lockUntil = t0 + dur + 120;
      const step = (now) => { const t = Math.min(1, (now - t0) / dur); scrollTo(0, from + (to - from) * ease(t)); if (t < 1) anim = requestAnimationFrame(step); };
      anim = requestAnimationFrame(step);
    }
    SA.stepTo = go;
    /* on-screen control */
    const box = el('nav', { class: 'stepper', 'aria-label': 'Slide navigation' }, document.body,
      '<button type="button" class="st-up" aria-label="Previous slide">↑</button><span class="st-n" aria-live="polite"></span><button type="button" class="st-dn" aria-label="Next slide">↓</button>');
    const [up, n, dn] = box.children;
    function ui() {
      if (!stops.length) return;
      const sec = stops[cur].sec, inSec = stops.filter((s) => s.sec === sec), k = inSec.indexOf(stops[cur]);
      n.innerHTML = '<b>' + sec.dataset.no + '</b><i>' + (inSec.length > 1 ? (k + 1) + '/' + inSec.length : '') + '</i>';
      up.disabled = cur === 0; dn.disabled = cur === stops.length - 1;
      box.classList.toggle('dk', sec.classList.contains('dark') || sec.classList.contains('cover'));
    }
    up.onclick = () => go(cur - 1); dn.onclick = () => go(cur + 1);
    /* keyboard */
    addEventListener('keydown', (e) => {
      if (SA.$('.iv.on') || e.altKey || e.ctrlKey || e.metaKey) return;
      const t = document.activeElement;
      if (t && (/input|textarea|select/i.test(t.tagName) || t.isContentEditable)) return;
      if (['ArrowDown', 'PageDown', ' '].indexOf(e.key) > -1) { e.preventDefault(); e.stopImmediatePropagation(); go(cur + 1); }
      else if (['ArrowUp', 'PageUp'].indexOf(e.key) > -1) { e.preventDefault(); e.stopImmediatePropagation(); go(cur - 1); }
      else if (e.key === 'Home') { e.preventDefault(); go(0); } else if (e.key === 'End') { e.preventDefault(); go(stops.length - 1); }
    }, true);
    /* wheel: one gesture = one slide (desktop). Maps and the 3D model keep their own wheel. */
    const fine = matchMedia('(pointer: fine)').matches;
    let acc = 0, lastWheel = 0;
    addEventListener('wheel', (e) => {
      if (!fine || innerWidth < 900 || SA.$('.iv.on') || e.ctrlKey) return;
      if (e.target.closest('.mapframe, .m3d, .gis-panel, .rail ol, #syn-matrix, #road-table')) return;
      e.preventDefault();
      const now = performance.now();
      if (now < lockUntil) { lastWheel = now; return; }
      if (now - lastWheel > 260) acc = 0;
      lastWheel = now; acc += e.deltaY;
      if (Math.abs(acc) > 40) { go(cur + (acc > 0 ? 1 : -1)); acc = 0; }
    }, { passive: false });
    addEventListener('scroll', () => { if (performance.now() > lockUntil) sync(); }, { passive: true });
    addEventListener('resize', () => { clearTimeout(build._t); build._t = setTimeout(build, 200); });
    /* rail links jump to the section's first slide with the same motion */
    SA.$$('.rail a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
      const sec = SA.$(a.getAttribute('href')); const k = stops.findIndex((s) => s.sec === sec);
      if (k > -1) { e.preventDefault(); go(k); history.replaceState && history.replaceState(null, '', a.getAttribute('href')); }
    }));
    build();
    /* content height changes (images, maps) → rebuild */
    new ResizeObserver(() => { clearTimeout(build._t); build._t = setTimeout(build, 250); }).observe(SA.$('main'));
  };
})();
