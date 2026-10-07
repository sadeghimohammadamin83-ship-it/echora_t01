/* ECHORA site behaviour. Plain JS, no dependencies. */
(() => {
  const CFG = window.ECHORA_CONFIG || {};
  const C = window.ECHORA_CONTENT;
  const IMG = (n) => `assets/img/${n}.webp`;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

  let lang = 'en';
  const t = (k) => (C.ui[lang] && C.ui[lang][k]) ?? C.ui.en[k] ?? k;
  const L = (o) => (o && typeof o === 'object' ? (o[lang] ?? o.en) : o);
  const digits = (s) => (lang === 'fa' ? String(s).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]) : String(s));

  /* ---------- loader ---------- */
  root.classList.add('is-loading');
  const loader = $('#loader');
  const endLoader = () => { if (!loader || loader.classList.contains('done')) return; loader.classList.add('done'); root.classList.remove('is-loading'); };
  setTimeout(endLoader, reduce ? 0 : 1100);
  loader?.addEventListener('click', endLoader);
  addEventListener('keydown', endLoader, { once: true });

  /* ---------- config: download links, version ---------- */
  $$('[data-cfg]').forEach((el) => { el.textContent = CFG[el.dataset.cfg] ?? el.textContent; });
  let toastTimer;
  const toast = (msg) => { const el = $('#toast'); el.textContent = msg; el.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, 3800); };
  // data-dl="win" | "apk": the link is the file itself (same origin), so the browser saves it instead of navigating.
  $$('[data-dl]').forEach((a) => {
    const kind = a.dataset.dl === 'apk' ? 'APK' : 'WIN';
    const url = (CFG[kind + '_URL'] || '').trim();
    if (url) { a.href = url; a.setAttribute('download', CFG[kind + '_FILE'] || ''); }
    else a.addEventListener('click', (e) => { e.preventDefault(); toast(t('cta.soon')); });
  });

  /* ---------- i18n ---------- */
  function applyLang(next) {
    lang = next === 'fa' ? 'fa' : 'en';
    root.lang = lang; root.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.title = t('meta.title');
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-aria]').forEach((el) => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
    if (lang === 'fa') $$('[data-cfg="VERSION"]').forEach((el) => { el.textContent = C.ui.fa['hero.eyebrow'].split(' · ')[0]; });
    else $$('[data-cfg="VERSION"]').forEach((el) => { el.textContent = CFG.VERSION; });
    renderCrew(); renderMap(); renderWeb(); renderSpecies(); renderEvents(); renderTimeline(); renderGallery(); renderControls(); renderUpdates();
    store.set('echora.lang', lang);
  }
  $('#langBtn').addEventListener('click', () => applyLang(lang === 'en' ? 'fa' : 'en'));

  /* ---------- nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('.nav__links a');
  const secIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['story', 'crew', 'world', 'archive', 'updates', 'chapters', 'media', 'download'].forEach((id) => { const s = document.getElementById(id); s && secIO.observe(s); });
  const burger = $('#burger'), drawer = $('#drawer');
  const setDrawer = (open) => { burger.setAttribute('aria-expanded', open); drawer.hidden = !open; document.body.style.overflow = open ? 'hidden' : ''; };
  burger.addEventListener('click', () => setDrawer(drawer.hidden));
  drawer.addEventListener('click', (e) => { if (e.target.closest('a')) setDrawer(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) { setDrawer(false); burger.focus(); } });

  /* ---------- parallax ---------- */
  const px = $$('[data-parallax]');
  if (!reduce && px.length) {
    let ticking = false;
    const run = () => { ticking = false; const vh = innerHeight; px.forEach((el) => { const r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; const k = parseFloat(el.dataset.parallax); el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -k).toFixed(1)}px, 0)`; }); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true }); run();
  }

  /* ---------- hero motes (drifting spores) ---------- */
  const cv = $('#motes');
  if (cv && !reduce) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, on = true; const dpr = Math.min(2, devicePixelRatio || 1);
    const N = innerWidth < 700 ? 26 : 54;
    const ps = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), r: .6 + Math.random() * 1.8, s: .02 + Math.random() * .05, w: Math.random() * 6.28, red: Math.random() < .35 }));
    const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
    new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) requestAnimationFrame(tick); }).observe(cv);
    let last = performance.now();
    function tick(now) {
      if (!on) return; const dt = Math.min(50, now - last) / 1000; last = now;
      ctx.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.y -= p.s * dt; p.w += dt * .6; p.x += Math.sin(p.w) * .0006;
        if (p.y < -.02) { p.y = 1.02; p.x = Math.random(); }
        const a = .25 + .35 * Math.sin(p.w * 1.7) ** 2;
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 6.283);
        ctx.fillStyle = p.red ? `rgba(255,110,95,${a})` : `rgba(236,232,228,${a * .7})`;
        ctx.shadowBlur = 8; ctx.shadowColor = p.red ? '#ff7a84' : '#fff'; ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- crew ---------- */
  let crewSel = 0;
  const crewImg = $('#crewImg');
  C.crew.forEach((m, i) => { const im = new Image(); im.src = IMG(m.img); im.alt = ''; im.decoding = 'async'; if (i === 0) im.className = 'on'; crewImg.appendChild(im); });
  function renderCrew() {
    const m = C.crew[crewSel];
    $('#crewDetail').innerHTML = `<p class="role">${esc(L(m.role))}</p><h3>${esc(L(m.name))}</h3><p>${esc(L(m.bio))}</p>`;
    $('#crewTabs').innerHTML = C.crew.map((c, i) => `<button class="crew__tab" role="tab" id="tab-${c.id}" aria-selected="${i === crewSel}" tabindex="${i === crewSel ? 0 : -1}" data-i="${i}"><span class="thumb"><img src="${IMG(c.img)}" alt="" loading="lazy"></span><span>${esc(L(c.name))}</span></button>`).join('');
    $$('#crewImg img').forEach((im, i) => im.classList.toggle('on', i === crewSel));
    $('#classes').innerHTML = C.classes.map((c) => `<li>${esc(L(c))}</li>`).join('');
  }
  $('#crewTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; crewSel = +b.dataset.i; renderCrew(); $(`#tab-${C.crew[crewSel].id}`).focus(); });
  $('#crewTabs').addEventListener('keydown', (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 1, ArrowUp: -1 }[e.key]; if (!k) return;
    e.preventDefault(); const dir = root.dir === 'rtl' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') ? -k : k;
    crewSel = (crewSel + dir + C.crew.length) % C.crew.length; renderCrew(); $(`#tab-${C.crew[crewSel].id}`).focus();
  });

  /* ---------- region map ---------- */
  let regionSel = 'glassroot';
  const curve = (pts) => { let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; d += ` Q${pts[i][0]},${pts[i][1]} ${mx},${my}`; } const l = pts[pts.length - 1]; return d + ` L${l[0]},${l[1]}`; };
  const closed = (pts) => { const n = pts.length; const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let d = `M${mid(pts[n - 1], pts[0]).join(',')}`; for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); d += ` Q${pts[i][0]},${pts[i][1]} ${m[0]},${m[1]}`; } return d + 'Z'; };
  function renderMap() {
    const s = $('#mapSvg'); s.innerHTML = '';
    s.insertAdjacentHTML('afterbegin', `<defs>
      <pattern id="hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="18" height="18" fill="#ffffff05"/><line x1="0" y1="0" x2="0" y2="18" stroke="#ffffff14" stroke-width="3"/></pattern>
      <filter id="blur"><feGaussianBlur stdDeviation="2.5"/></filter>
      <radialGradient id="glow"><stop offset="0" stop-color="#d13a3a" stop-opacity=".35"/><stop offset="1" stop-color="#d13a3a" stop-opacity="0"/></radialGradient></defs>`);
    C.flows.forEach((f) => s.appendChild(svgEl('path', { d: curve(f), class: 'flow' })));
    C.regions.forEach((r) => {
      const g = svgEl('g', { class: `rg${r.known ? '' : ' locked'}${r.id === regionSel ? ' sel' : ''}`, tabindex: 0, role: 'button', 'data-id': r.id, 'aria-label': `${L(r.name)} · ${L(r.sub)}`, 'aria-pressed': r.id === regionSel });
      g.appendChild(svgEl('path', { d: closed(r.shape), class: 'fill', fill: r.tint }));
      const tx = svgEl('text', { x: r.center[0], y: r.center[1] + (r.id === 'glassroot' ? 90 : 10), 'text-anchor': 'middle' });
      tx.textContent = r.known ? L(r.name) : L(r.sub);
      g.appendChild(tx); s.appendChild(g);
    });
    C.trails.forEach((f) => s.appendChild(svgEl('path', { d: curve(f), class: 'trail' })));
    const camp = svgEl('g', { class: 'pin pin-camp' });
    camp.innerHTML = `<circle cx="1000" cy="610" r="60" fill="url(#glow)"/><circle class="ring" cx="1000" cy="610" r="16"/><circle cx="1000" cy="610" r="9"/><text x="1024" y="600">${esc(t('world.camp'))}</text>`;
    const sig = svgEl('g', { class: 'pin pin-sig' });
    sig.innerHTML = `<circle class="ring" cx="1540" cy="600" r="14"/><circle cx="1540" cy="600" r="7"/><text x="1540" y="572" text-anchor="middle">${esc(t('world.signal'))}</text>`;
    if (lang === 'fa') { camp.querySelector('text').setAttribute('style', 'font-family:var(--font-fa)'); sig.querySelector('text').setAttribute('style', 'font-family:var(--font-fa)'); }
    s.append(camp, sig);
    renderRegion();
  }
  function renderRegion() {
    const r = C.regions.find((x) => x.id === regionSel);
    const el = $('#region');
    if (!r.known) { el.innerHTML = `<p class="sub">${esc(L(r.sub))}</p><h3>${esc(L(r.name))}</h3><div class="nodata">${esc(t('world.locked'))}</div>`; return; }
    el.innerHTML = `<p class="sub">${esc(L(r.sub))}</p><h3>${esc(L(r.name))}</h3><p>${esc(L(r.desc))}</p>
      <dl class="kv"><div><dt>${esc(t('world.stability'))}</dt><dd class="tone-${r.tone === 'ok' ? 'ok' : r.tone === 'warn' ? 'warn' : 'alert'}">${esc(L(r.stab))}</dd></div>
      <div><dt>${esc(t('world.pressure'))}</dt><dd class="tone-${r.tone}">${esc(L(r.pres))}</dd></div></dl>
      <p class="eyebrow">${esc(t('world.features'))}</p><ul>${L(r.feats).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>`;
  }
  const pickRegion = (id) => { regionSel = id; $$('#mapSvg .rg').forEach((g) => { g.classList.toggle('sel', g.dataset.id === id); g.setAttribute('aria-pressed', g.dataset.id === id); }); renderRegion(); };
  $('#mapSvg').addEventListener('click', (e) => { const g = e.target.closest('.rg'); g && pickRegion(g.dataset.id); });
  $('#mapSvg').addEventListener('keydown', (e) => { const g = e.target.closest('.rg'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pickRegion(g.dataset.id); } });

  /* ---------- ecosystem web + species ---------- */
  let hot = null;
  const spName = (id) => (C.web.names[id] ? L(C.web.names[id]) : L(C.species.find((s) => s.id === id).name));
  const spColor = (id) => (id === 'oxygen' ? '#7fb8ff' : C.species.find((s) => s.id === id).color);
  function renderWeb() {
    const s = $('#webSvg'); s.innerHTML = '';
    const N = C.web.nodes;
    C.web.links.forEach((l, i) => {
      const [x1, y1] = N[l.a], [x2, y2] = N[l.b];
      const mx = (x1 + x2) / 2 + (y2 - y1) * .12, my = (y1 + y2) / 2 - (x2 - x1) * .12;
      const on = hot && (l.a === hot || l.b === hot);
      s.appendChild(svgEl('path', { d: `M${x1},${y1} Q${mx},${my} ${x2},${y2}`, class: `link dash${on ? ' hot' : ''}`, id: `lk${i}` }));
      const tx = svgEl('text', { class: `link-label${on ? ' hot' : ''}`, x: (x1 + 2 * mx + x2) / 4, y: (y1 + 2 * my + y2) / 4 - 6, 'text-anchor': 'middle' });
      tx.textContent = (l.both ? '↔ ' : '→ ') + L(l); s.appendChild(tx);
    });
    Object.entries(N).forEach(([id, [x, y]]) => {
      const g = svgEl('g', { class: `node${hot === id ? ' hot' : ''}`, 'data-id': id, tabindex: 0, role: 'button', 'aria-label': spName(id) });
      const c = spColor(id); const big = id === 'veilbloom' ? 22 : 15;
      g.append(svgEl('circle', { class: 'glow', cx: x, cy: y, r: big * 2.4, fill: c }), svgEl('circle', { class: 'core', cx: x, cy: y, r: big, fill: c }));
      const tx = svgEl('text', { x, y: y + big + 24, 'text-anchor': 'middle' }); tx.textContent = spName(id); g.appendChild(tx);
      s.appendChild(g);
    });
    const note = $('#webNote');
    if (hot) { const ls = C.web.links.filter((l) => l.a === hot || l.b === hot); note.textContent = ls.map((l) => `${spName(l.a)} ${l.both ? '↔' : '→'} ${spName(l.b)}: ${L(l)}`).join(' · '); }
    else note.textContent = '';
  }
  const setHot = (id) => { hot = hot === id ? null : id; renderWeb(); $$('.spec').forEach((li) => li.classList.toggle('hot', li.dataset.id === hot)); };
  $('#webSvg').addEventListener('click', (e) => { const g = e.target.closest('.node'); if (!g) return; setHot(g.dataset.id); const li = $(`.spec[data-id="${g.dataset.id}"]`); if (li) { $$('.spec').forEach((x) => x.classList.toggle('open', x === li)); li.querySelector('button').setAttribute('aria-expanded', 'true'); } });
  $('#webSvg').addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.node')) { e.preventDefault(); e.target.closest('.node').dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
  let openSpec = 'veilbloom';
  function renderSpecies() {
    $('#specList').innerHTML = C.species.map((s) => `<li class="spec${s.id === openSpec ? ' open' : ''}${s.id === hot ? ' hot' : ''}" data-id="${s.id}">
      <button type="button" aria-expanded="${s.id === openSpec}"><span class="dot${s.seen ? '' : ' unk'}" style="color:${s.color || 'transparent'}"></span>
      <span class="nm">${esc(L(s.name))}<span class="spec-status${s.seen ? ' seen' : ''}">${esc(t(s.seen ? 'archive.observed' : 'archive.reported'))}</span></span>
      <span class="sz" dir="ltr">${esc(s.size)}</span><span class="kd">${esc(L(s.kind))}</span>
      <span class="more">${esc(L(s.desc))}${s.note ? `<q>${esc(L(s.note))}</q>` : ''}</span></button></li>`).join('');
  }
  $('#specList').addEventListener('click', (e) => {
    const li = e.target.closest('.spec'); if (!li) return;
    openSpec = openSpec === li.dataset.id ? null : li.dataset.id;
    $$('.spec').forEach((x) => { x.classList.toggle('open', x.dataset.id === openSpec); x.querySelector('button').setAttribute('aria-expanded', x.dataset.id === openSpec); });
    if (C.web.nodes[li.dataset.id]) { hot = li.dataset.id; renderWeb(); $$('.spec').forEach((x) => x.classList.toggle('hot', x.dataset.id === hot)); }
  });

  /* ---------- events, chapters, controls ---------- */
  function renderEvents() { $('#events').innerHTML = C.events.map((e) => `<li>${esc(L(e))}</li>`).join(''); }
  function renderTimeline() {
    $('#timeline').innerHTML = C.chapters.map((c) => `<li class="ch${c.play ? ' play' : ''}"><span class="n">${esc(digits(String(c.n).padStart(2, '0')))}</span>
      <h3>${esc(L(c.t))}</h3><p>${esc(L(c.s))}</p><span class="st">${esc(t(c.play ? 'chap.playable' : 'chap.coming'))}</span></li>`).join('');
  }
  function renderUpdates() {
    $('#updList').innerHTML = (C.updates || []).map((u, i) => `<article class="upd${u.latest || u.tag ? ' upd--latest' : ''}" ${i === 0 ? 'open' : ''}>
      <header class="upd__head"><span class="upd__v mono">${esc(digits('v' + u.v))}</span>${u.tag ? `<span class="upd__tag mono">${esc(L(u.tag))}</span>` : u.latest ? `<span class="upd__tag mono">${esc(t('upd.latest'))}</span>` : ''}
        <h3 class="upd__t">${esc(L(u.title))}</h3><span class="upd__d mono">${esc(L(u.date))}</span></header>
      <div class="upd__body">${u.groups.map((g) => `<section><h4>${esc(L(g.h))}</h4><ul>${g.items.map((it) => `<li>${esc(L(it))}</li>`).join('')}</ul></section>`).join('')}</div>
    </article>`).join('');
  }
  function renderControls() { $('#controls').innerHTML = C.controls.map(([k, v]) => `<li><kbd>${esc(k)}</kbd><span>${esc(t(v))}</span></li>`).join(''); }

  /* ---------- gallery + lightbox ---------- */
  const G = C.gallery || [];
  let lbI = 0; let lbReturn = null;
  function renderGallery() {
    $('#gallery').innerHTML = G.map((g, i) => `<li><button type="button" class="graded" data-g="${i}" data-cursor="${esc(t('media.view'))}" aria-label="${esc(L(g.cap))}"><img src="${IMG(g.img)}" alt="${esc(L(g.cap))}" loading="lazy"></button></li>`).join('');
  }
  const lb = $('#lightbox');
  const showLb = (i) => { lbI = (i + G.length) % G.length; $('#lbImg').src = IMG(G[lbI].img); $('#lbImg').alt = L(G[lbI].cap); $('#lbCap').textContent = `${digits(lbI + 1)} / ${digits(G.length)} · ${L(G[lbI].cap)}`; };
  $('#gallery').addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (!b) return; lbReturn = b; showLb(+b.dataset.g); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb__close', lb).focus(); });
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; lbReturn?.focus(); };
  lb.addEventListener('click', (e) => { const a = e.target.closest('[data-lb]')?.dataset.lb; if (a === 'close' || e.target === lb) closeLb(); else if (a === 'prev') showLb(lbI - 1); else if (a === 'next') showLb(lbI + 1); });
  addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    const rtl = root.dir === 'rtl';
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'ArrowRight') showLb(lbI + (rtl ? -1 : 1));
    else if (e.key === 'ArrowLeft') showLb(lbI + (rtl ? 1 : -1));
    else if (e.key === 'Tab') { const f = $$('.lb__btn', lb); const i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus(); }
  });

  /* ---------- teaser (slideshow preview until a video exists) ---------- */
  const tz = $('#teaser'); let tzTimer = null, tzIdx = 0, tzReturn = null;
  const SHOT_MS = reduce ? 4000 : 5200;
  function tzBuild() {
    const st = $('#tzStage');
    if (CFG.TEASER_URL) {
      const webm = CFG.TEASER_WEBM ? `<source src="${esc(CFG.TEASER_WEBM)}" type="video/webm">` : '';
      st.innerHTML = `<video controls autoplay playsinline poster="${IMG('teaser')}" style="width:100%;height:100%;object-fit:contain;background:#000">${webm}<source src="${esc(CFG.TEASER_URL)}" type="video/mp4"></video>`;
      // no playable source in this browser: fall back to the slideshow instead of a dead player
      const last = st.querySelector('video source:last-of-type');
      last?.addEventListener('error', () => { CFG.TEASER_URL = ''; tzBuild(); tzIdx = 0; tzStep(); });
      return;
    }
    st.innerHTML = C.teaser.map((s, i) => `<div class="tz-shot" data-i="${i}"><img src="${IMG(s.img)}" alt=""><p class="tz-line${i === 3 ? ' alarm-l' : ''}">${esc(L(s))}</p></div>`).join('') +
      `<div class="tz-end"><span class="wordmark" aria-label="ECHORA">ECH<svg class="wm-o" viewBox="0 0 40 40"><circle cx="20" cy="20" r="14"/><line x1="20" y1="4" x2="20" y2="36"/></svg>RA</span><p class="mono motto">${esc(t('hero.motto'))}</p><p class="mono" style="color:var(--text-3)">${esc(t('hero.eyebrow'))}</p></div>`;
  }
  function tzStep() {
    const shots = $$('.tz-shot', tz), end = $('.tz-end', tz), bar = $('#tzBar');
    shots.forEach((s, i) => s.classList.toggle('on', i === tzIdx));
    end.classList.toggle('on', tzIdx >= shots.length);
    bar.style.transition = 'none'; bar.style.width = `${(tzIdx / (shots.length + 1)) * 100}%`;
    requestAnimationFrame(() => { bar.style.transition = `width ${SHOT_MS}ms linear`; bar.style.width = `${((tzIdx + 1) / (shots.length + 1)) * 100}%`; });
    if (tzIdx < shots.length) { tzIdx++; tzTimer = setTimeout(tzStep, SHOT_MS); }
  }
  const openTeaser = (btn) => { tzReturn = btn; tzBuild(); tz.hidden = false; document.body.style.overflow = 'hidden'; $('.lb__close', tz).focus(); if (!CFG.TEASER_URL) { tzIdx = 0; tzStep(); } };
  const closeTeaser = () => { clearTimeout(tzTimer); tz.hidden = true; $('#tzStage').innerHTML = ''; document.body.style.overflow = ''; tzReturn?.focus(); };
  $$('[data-teaser]').forEach((b) => b.addEventListener('click', () => openTeaser(b)));
  tz.addEventListener('click', (e) => { if (e.target.closest('[data-tz="close"]')) closeTeaser(); });
  addEventListener('keydown', (e) => { if (!tz.hidden && (e.key === 'Escape' || e.key === 'Tab')) { e.preventDefault(); if (e.key === 'Escape') closeTeaser(); } });

  /* ---------- reveal on scroll (content is visible at rest; animation plays on entry) ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px 12% 0px' });
    $$('.reveal').forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) io.observe(el); });
  }

  /* ---------- magnetic buttons + cursor (fine pointers only) ---------- */
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.magnetic').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    root.classList.add('has-cursor');
    const cur = $('#cursor'), dot = cur.firstElementChild; let cx = -100, cy = -100, x = -100, y = -100;
    addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      const el = e.target.closest?.('a, button, [role="button"], summary');
      const label = e.target.closest?.('[data-cursor]');
      cur.classList.toggle('hover', !!el && !label); cur.classList.toggle('label', !!label);
      dot.textContent = label ? label.dataset.cursor : '';
    }, { passive: true });
    document.addEventListener('pointerleave', () => { x = y = -100; });
    const loop = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; cur.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); };
    loop();
  }

  /* ---------- start ---------- */
  const saved = store.get('echora.lang');
  const auto = (navigator.language || '').toLowerCase().startsWith('fa') ? 'fa' : 'en';
  const hashLang = location.hash === '#fa' ? 'fa' : location.hash === '#en' ? 'en' : null;
  applyLang(hashLang || saved || auto);
})();
