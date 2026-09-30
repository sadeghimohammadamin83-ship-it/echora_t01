/* Boot: build every section (in order, yielding between them), then navigation + reveal. */
(function () {
  'use strict';
  const SA = window.SA;
  SA.Navigation();
  const list = SA.sections.slice();
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1));
  function next() {
    const fn = list.shift();
    if (!fn) { SA.initReveal(); document.documentElement.classList.add('ready'); return; }
    try { fn(); } catch (e) { console.error('[section]', e); }
    SA.initReveal();
    idle(next, { timeout: 60 });
  }
  next();
})();
