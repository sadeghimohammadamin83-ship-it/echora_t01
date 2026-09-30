/* Boot: build every section (in order, yielding between them), then navigation + reveal. */
(function () {
  'use strict';
  const SA = window.SA;
  SA.Navigation();
  const list = SA.sections.slice();
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1));
  function next() {
    const fn = list.shift();
    if (!fn) { sheets(); SA.initReveal(); document.documentElement.classList.add('ready'); SA.Stepper(); return; }
    try { fn(); } catch (e) { console.error('[section]', e); }
    SA.initReveal();
    idle(next, { timeout: 60 });
  }
  /* every analytical map becomes a numbered drawing sheet that zooms into place when first seen */
  function sheets() {
    const T = {
      'urban-map': ['A-02', 'URBAN CONTEXT · 2.5 km', 'OSM network · metro'], 'access-map': ['B-05', 'ACCESS ROUTES', 'OSM oneway tags'], 'iso-map': ['B-05.2', 'WALKING CATCHMENT · 2 / 5 / 10 / 15 min', 'straight-line radii · 80 m/min'],
      'road-map': ['B-06', 'STREET HIERARCHY', 'user colour code · OSM'], 'lu-map': ['B-07', 'LAND USE', 'OSM + traced footprints'], 'survey-map': ['B-09', 'PHOTO SURVEY KEY MAP', 'user photo survey · redrawn'],
      'green-map': ['C-10', 'GREEN & OPEN SPACE', 'OSM + canopy extracted from imagery'], 'noise-map': ['E-15', 'NOISE · QUALITATIVE', 'no dB measurement available'], 'views-map': ['E-16', 'VIEWS FROM THE SITE', 'field photos · diagrammatic cones'],
      'syn-map': ['F-20', 'EDGES & MOVEMENT', 'synthesis'], 'impl-map': ['F-21', 'DESIGN IMPLICATIONS', 'requirements, not a design'],
    };
    SA.maps.forEach((mv) => {
      const id = mv.host.id, t = T[id];
      if (t && !mv.host.classList.contains('sheet')) { SA.sheet(mv, { no: t[0], title: t[1], src: t[2] }); SA.enterZoom(mv, 1.45); }
    });
    SA.$$('.swot .mapframe').forEach((h, i) => { const mv = SA.maps.find((m) => m.host === h); if (mv && !h.classList.contains('sheet')) { SA.sheet(mv, { no: 'F-' + (18 + i), title: i ? 'CONSTRAINTS · MAPPED' : 'OPPORTUNITIES · MAPPED', src: 'SWOT located on the site' }); SA.enterZoom(mv, 1.4); } });
  }
  next();
})();
