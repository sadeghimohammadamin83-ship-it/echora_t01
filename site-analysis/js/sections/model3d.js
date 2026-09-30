/* 04 — 3D SITE MODEL (Three.js r147, vendored).
   Ground = SRTM ground surface (tools/dem.py) · drape = graded imagery + linework · buildings = OSM + traced footprints
   extruded with ASSUMED heights (no height survey exists: classes from the 3–8 storey range seen in the photos)
   · trees = canopy points extracted from the imagery · sun = computed position, real-time shadows.
   Two states: existing, and after the ~8 low buildings inside the site are demolished. */
(function () {
  'use strict';
  const SA = window.SA, G = window.SA_GEO, D = window.SA_DATA, M = window.SA_DEM, I = window.SA_IMGRY, el = SA.el;
  const HALF = 300, VEX = 2.5; /* model half-size (m) and vertical exaggeration of the ground only */
  const H = { res: 16, edu: 14, cult: 12, com: 18, pub: 9, park: 0, green: 0, unk: 12, site: 6 }; /* assumed heights (m) */

  function model3d() {
    const host = SA.$('#m3d'), ui = SA.$('#m3d-ui');
    if (!window.THREE) { host.innerHTML = '<p class="t-cap">3D unavailable (WebGL / Three.js not loaded).</p>'; return; }
    const THREE = window.THREE;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); } catch (e) { host.innerHTML = '<p class="t-cap">3D needs WebGL, which this browser does not provide.</p>'; return; }
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
    renderer.outputEncoding = THREE.sRGBEncoding;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2f0eb);
    scene.fog = new THREE.Fog(0xf2f0eb, 520, 980);
    const cam = new THREE.PerspectiveCamera(32, 1, 1, 4000);
    const controls = new THREE.OrbitControls(cam, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.07; controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 90; controls.maxDistance = 900;
    controls.target.set(SA.SITE_C[0], 0, -SA.SITE_C[1]);

    /* ---------- ground height from the DEM grid (local metres; three: x east, y up, z = −north) ---------- */
    const g3 = M.grid3, n = g3.n, z0 = M.stats.site_c;
    const hAt = (x, y) => {
      const fx = (x + g3.half) / g3.step, fy = (g3.half - y) / g3.step;
      const i = Math.max(0, Math.min(n - 2, Math.floor(fx))), j = Math.max(0, Math.min(n - 2, Math.floor(fy))), u = fx - i, v = fy - j;
      const Z = (jj, ii) => g3.z[jj * n + ii];
      return ((Z(j, i) * (1 - u) + Z(j, i + 1) * u) * (1 - v) + (Z(j + 1, i) * (1 - u) + Z(j + 1, i + 1) * u) * v - z0) * VEX;
    };
    const seg = 100, geo = new THREE.PlaneGeometry(HALF * 2, HALF * 2, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, hAt(pos.getX(i), -pos.getZ(i)));
    geo.computeVertexNormals();

    /* ---------- drape texture: graded imagery + canopy tint + linework + site ---------- */
    const TS = 2048, cvs = document.createElement('canvas'); cvs.width = cvs.height = TS;
    const cx = cvs.getContext('2d'), k = TS / (HALF * 2);
    const toC = (p) => [(p[0] + HALF) * k, (HALF - p[1]) * k];
    const tex = new THREE.CanvasTexture(cvs); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const groundMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 });
    const ground = new THREE.Mesh(geo, groundMat); ground.receiveShadow = true; scene.add(ground);
    const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
    let demolished = false;
    function paint(ims) {
      cx.fillStyle = '#E9E4D8'; cx.fillRect(0, 0, TS, TS);
      const [ctxIm, aerIm] = ims || [];
      try {
        if (ctxIm) { const m = I.context.m; cx.save(); cx.setTransform(k * m[0], k * m[1], k * m[2], k * m[3], k * (m[4] + HALF), k * (m[5] + HALF)); cx.globalAlpha = 0.85; cx.drawImage(ctxIm, 0, 0, I.context.w, I.context.h); cx.restore(); }
        if (aerIm) { const A = G.aerial, p0 = toC([-A.tx / A.s, A.ty / A.s]); cx.globalAlpha = 0.95; cx.drawImage(aerIm, p0[0], p0[1], (A.w / A.s) * k, (A.h / A.s) * k); cx.globalAlpha = 1; }
      } catch (e) { /* tainted canvas on file:// — keep the flat ground colour */ }
      /* park & campus tints */
      const poly = (pts, fill, stroke, lw) => { cx.beginPath(); pts.forEach((p, i) => { const q = toC(p); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); cx.closePath(); if (fill) { cx.fillStyle = fill; cx.fill(); } if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = lw || 2; cx.stroke(); } };
      poly(SA.F('laleh_park').pts, 'rgba(120,150,95,.22)'); poly(SA.F('ut_campus').pts, 'rgba(147,169,186,.18)');
      /* streets in the user colour code */
      const line = (pts, col, w, dash) => { cx.beginPath(); pts.forEach((p, i) => { const q = toC(p); i ? cx.lineTo(q[0], q[1]) : cx.moveTo(q[0], q[1]); }); cx.strokeStyle = col; cx.lineWidth = w; cx.lineCap = 'round'; cx.lineJoin = 'round'; cx.setLineDash(dash || []); cx.stroke(); cx.setLineDash([]); };
      const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || v;
      ['Enghelab St', 'Vesal Shirazi St', 'Keshavarz Blvd', 'N. Kargar St', '16 Azar St', 'Qods St'].forEach((nn) => line(G.roads[nn].p, 'rgba(40,40,40,.28)', 5));
      [['Keshavarz', '--kesh', 9], ['Poursina', '--pour', 6], ['16Azar', '--azar', 6], ['Jalalieh', '--jal', 4.5], ['Hedayati', '--hed', 4], ['Enayat', '--ena', 4], ['Zare', '#555A60', 5.5], ['Zare', '#FFFFFF', 3.5], ['ZareS', '#555A60', 5.5], ['ZareS', '#FFFFFF', 3.5]]
        .forEach(([nn, c, w]) => line(G.streets[nn], c.startsWith('--') ? css(c) : c, w));
      /* site: cleared ground after demolition */
      if (demolished) poly(G.envelope, 'rgba(214,206,190,.92)');
      poly(G.envelope, 'rgba(46,134,222,.16)', css('--site'), 4);
      tex.needsUpdate = true;
    }
    Promise.all([load('img/layers/context_base.jpg'), load('img/layers/aerial_base.jpg')]).then((ims) => { SA._m3dIms = ims; paint(ims); render(); });
    paint();

    /* ---------- buildings ---------- */
    const mats = {
      n: new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 0.92 }),
      edu: new THREE.MeshStandardMaterial({ color: 0xdfe6ec, roughness: 0.9 }),
      site: new THREE.MeshStandardMaterial({ color: 0x9fb6cc, roughness: 0.85, transparent: true, opacity: 1 }),
    };
    const edges = new THREE.LineBasicMaterial({ color: 0x3a3a3a, transparent: true, opacity: 0.35 });
    const siteBlds = [], pick = [];
    const inEnv = (q) => { let c = false; const P = G.envelope; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { if ((P[i][1] > q[1]) !== (P[j][1] > q[1]) && q[0] < ((P[j][0] - P[i][0]) * (q[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; } return c; };
    const inPoly = (q, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { if ((P[i][1] > q[1]) !== (P[j][1] > q[1]) && q[0] < ((P[j][0] - P[i][0]) * (q[1] - P[i][1])) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; } return c; };
    /* street corridors (half-widths, m): traced footprints that fall on a street are not extruded */
    const CORR = [['Keshavarz', 11], ['Poursina', 6], ['16Azar', 6], ['Qods', 6], ['Jalalieh', 4.5], ['Hedayati', 3.5], ['Enayat', 3.5], ['Zare', 3], ['ZareS', 3]];
    const segDist = (q, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / (dx * dx + dy * dy || 1))); return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy); };
    const onStreet = (q) => CORR.some(([n, w]) => { const P = G.streets[n]; for (let i = 1; i < P.length; i++) if (segDist(q, P[i - 1], P[i]) < w) return true; return false; });
    const streetShare = (P) => {
      const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); let n = 0, k = 0;
      for (let x = Math.min(...xs); x <= Math.max(...xs); x += 1.5) for (let y = Math.min(...ys); y <= Math.max(...ys); y += 1.5) if (inPoly([x, y], P)) { n++; if (onStreet([x, y])) k++; }
      return n ? k / n : 0;
    };
    const merged = { n: [], edu: [] }, mergedEdges = [], ranges = { n: [], edu: [] };
    let dropped = 0;
    G.features.filter((f) => f.kind === 'bldg').forEach((f) => {
      const c = SA.centroid(f.pts), onSite = f.use === 'site' || inEnv(c); /* the user: every building inside the blue boundary is demolished */
      if (!onSite && streetShare(f.pts) > 0.08) { dropped++; return; }
      const h = (onSite ? H.site : H[f.use]) || 12, shape = new THREE.Shape(f.pts.map((p) => new THREE.Vector2(p[0], p[1])));
      const eg = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 1 });
      eg.rotateX(-Math.PI / 2);
      const base = Math.min(...f.pts.map((p) => hAt(p[0], p[1])));
      if (onSite) {
        const m = new THREE.Mesh(eg, mats.site.clone());
        m.position.y = base; m.castShadow = true; m.receiveShadow = true;
        m.add(new THREE.LineSegments(new THREE.EdgesGeometry(eg, 20), edges));
        m.userData = { f, h, c }; scene.add(m); pick.push(m); siteBlds.push(m);
      } else {
        eg.translate(0, base, 0);
        const key = f.use === 'edu' || f.use === 'cult' ? 'edu' : 'n';
        ranges[key].push({ tri: eg.attributes.position.count / 3, f, h });
        merged[key].push(eg); mergedEdges.push(new THREE.EdgesGeometry(eg, 20));
      }
    });
    /* one draw call per material (plus one for all edges) */
    const BGU = THREE.BufferGeometryUtils;
    ['n', 'edu'].forEach((key) => {
      if (!merged[key].length) return;
      const g2 = BGU.mergeBufferGeometries(merged[key].map((x) => x.toNonIndexed ? (x.index ? x.toNonIndexed() : x) : x));
      const m = new THREE.Mesh(g2, mats[key]); m.castShadow = true; m.receiveShadow = true;
      let acc = 0; m.userData.ranges = ranges[key].map((r) => { const o = { from: acc, to: acc + r.tri, f: r.f, h: r.h }; acc += r.tri; return o; });
      scene.add(m); pick.push(m);
    });
    if (mergedEdges.length) scene.add(new THREE.LineSegments(BGU.mergeBufferGeometries(mergedEdges), edges));
    if (dropped) console.info('[3d] footprints on street corridors not extruded:', dropped);

    /* ---------- trees (canopy extracted from imagery) ---------- */
    const tgeo = new THREE.IcosahedronGeometry(1, 0), tmat = new THREE.MeshStandardMaterial({ color: 0x7d9a5f, roughness: 1, flatShading: true });
    const pts = I.trees.filter((p) => Math.abs(p[0]) < HALF - 5 && Math.abs(p[1]) < HALF - 5);
    const inst = new THREE.InstancedMesh(tgeo, tmat, pts.length);
    const dummy = new THREE.Object3D(); let rnd = 1;
    const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
    pts.forEach((p, i) => { const r = 2.6 + rand() * 1.8; dummy.position.set(p[0], hAt(p[0], p[1]) + r * 1.4, -p[1]); dummy.scale.set(r, r * 1.15, r); dummy.rotation.y = rand() * 6; dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix); });
    inst.castShadow = true; inst.receiveShadow = false; scene.add(inst);

    /* ---------- site envelope as a thin raised outline ---------- */
    const env = G.envelope.concat([G.envelope[0]]).map((p) => new THREE.Vector3(p[0], hAt(p[0], p[1]) + 0.6, -p[1]));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(env), new THREE.LineBasicMaterial({ color: 0x2e86de })));
    const posts = new THREE.Group();
    G.envelope.forEach((p) => { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 22, 6), new THREE.MeshBasicMaterial({ color: 0x2e86de })); b.position.set(p[0], hAt(p[0], p[1]) + 11, -p[1]); posts.add(b); });
    scene.add(posts);

    /* ---------- light: sky + computed sun ---------- */
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c3, 0.62));
    const sun = new THREE.DirectionalLight(0xfff4e0, 0.95);
    sun.castShadow = true; sun.shadow.mapSize.set(1536, 1536);
    Object.assign(sun.shadow.camera, { left: -340, right: 340, top: 340, bottom: -340, near: 10, far: 1600 });
    sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.6;
    scene.add(sun); scene.add(sun.target); sun.target.position.copy(controls.target);
    let day = 172, hour = 15;
    const placeSun = () => {
      renderer.shadowMap.needsUpdate = true;
      const sp = SA.sunpos ? SA.sunpos(day, hour) : { alt: 45, az: 225 };
      const alt = Math.max(sp.alt, 2) * Math.PI / 180, az = sp.az * Math.PI / 180, R = 700;
      sun.position.set(controls.target.x + R * Math.cos(alt) * Math.sin(az), R * Math.sin(alt), controls.target.z - R * Math.cos(alt) * Math.cos(az));
      sun.intensity = sp.alt > 0 ? 0.35 + 0.65 * Math.min(1, sp.alt / 40) : 0.12;
      SA.$('#m3d-sun').textContent = (sp.alt > 0 ? 'SUN ' + sp.alt.toFixed(0) + '° · AZ ' + sp.az.toFixed(0) + '°' : 'SUN BELOW HORIZON');
    };

    /* ---------- labels (HTML, projected) ---------- */
    const labs = [
      [[-20, 330], 'بوستان لاله', 'LALEH PARK', 6], [[150, -240], 'دانشگاه تهران', 'UNIVERSITY OF TEHRAN', 18], [[SA.SITE_C[0], SA.SITE_C[1]], 'سایت', 'SITE · ≈ 8,900 m²', 26],
      [[-230, 155], 'بلوار کشاورز', 'KESHAVARZ BLVD', 4], [[-60, -52], 'پورسینا', 'POURSINA ← one-way', 4], [[74, 50], 'جلالیه', 'JALALIEH', 6], [[188, 249], 'مترو بوستان لاله', 'METRO L6', 8],
    ];
    const lw = el('div', { class: 'm3d-labels' }, host);
    const L = labs.map(([p, fa, en, lift]) => ({ v: new THREE.Vector3(p[0], hAt(p[0], p[1]) + lift, -p[1]), e: el('div', { class: 'm3d-l' }, lw, '<i></i><b>' + fa + '</b><span>' + en + '</span>') }));
    const tip = SA.tip;
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let rayPending = false, lastEv = null;
    renderer.domElement.addEventListener('pointermove', (ev) => {
      const r = renderer.domElement.getBoundingClientRect(); mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      if (rayPending) return; rayPending = true; lastEv = ev;
      requestAnimationFrame(() => {
        rayPending = false; ray.setFromCamera(mouse, cam); const hit = ray.intersectObjects(pick, false)[0];
        let info = null;
        if (hit && hit.object.visible) info = hit.object.userData.ranges ? hit.object.userData.ranges.find((r) => hit.faceIndex >= r.from && hit.faceIndex < r.to) : hit.object.userData;
        if (info) { const f = info.f, lu = D.landuse[f.use] || {}; tip.show(lastEv, SA.card({ k: lu.en + ' · assumed height', t: f.fa || lu.fa, e: f.name || 'Building footprint', rows: [['Height (assumed)', '≈ ' + info.h + ' m'], ['Footprint', '≈ ' + SA.fmt(SA.area(f.pts)) + ' m²']], src: f.src })); }
        else tip.hide();
      });
    });
    renderer.domElement.addEventListener('pointerleave', () => tip.hide());

    /* ---------- camera presets & choreography ---------- */
    const T0 = controls.target.clone();
    const presets = { axo: [T0.x + 330, 250, T0.z + 300], sw: [T0.x - 330, 230, T0.z + 260], top: [T0.x + 1, 620, T0.z + 1], street: [T0.x + 40, 26, T0.z + 190] };
    let tween = null;
    const fly = (to, dur) => { const from = cam.position.clone(), tv = new THREE.Vector3(...to), t0 = performance.now(); tween = (now) => { const t = Math.min(1, (now - t0) / (dur || 1800)), e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; cam.position.lerpVectors(from, tv, e); if (t >= 1) tween = null; }; wake(); };
    cam.position.set(T0.x + 520, 420, T0.z + 520);

    /* demolition animation: buildings sink and fade, cleared ground repaints */
    let demoT = null;
    const setState = (d) => {
      if (d === demolished) return;
      demolished = d; const t0 = performance.now(), from = siteBlds.map((m) => m.scale.y);
      demoT = (now) => {
        const t = Math.min(1, (now - t0) / 1600), e = 1 - Math.pow(1 - t, 3);
        siteBlds.forEach((m, i) => { const target = d ? 0.001 : 1; m.scale.y = from[i] + (target - from[i]) * e; m.material.opacity = d ? 1 - e : e; m.visible = m.scale.y > 0.01; m.children[0].visible = !d || t < 0.6; });
        if (t >= 1) { demoT = null; paint(SA._m3dIms); }
      };
      if (d) paint(SA._m3dIms);
      SA.$$('#m3d-state button').forEach((b, i) => b.setAttribute('aria-pressed', (i === 1) === d ? 'true' : 'false'));
      SA.$('#m3d-caption').innerHTML = d
        ? '<b>پس از تخریب</b> — ۸ بنای کوتاه داخل سایت برداشته شده‌اند؛ زمین پاک‌شده ≈ ۸٬۹۰۰ مترمربع، آماده‌ی طراحی.'
        : '<b>وضع موجود</b> — پارکینگ آسفالته با ۸ بنای کوتاه (≈ ۲۸٪ سطح اشغال)؛ همه‌ی آن‌ها تخریب می‌شوند.';
      wake();
    };

    /* ---------- UI ---------- */
    ui.innerHTML =
      '<div class="seg" id="m3d-state" role="group" aria-label="Model state"><button type="button" aria-pressed="true">Existing · وضع موجود</button><button type="button" aria-pressed="false">After demolition · پس از تخریب</button></div>' +
      '<div class="seg" id="m3d-cam" role="group" aria-label="View"><button type="button" data-v="axo">Axo NE</button><button type="button" data-v="sw">Axo SW</button><button type="button" data-v="top">Plan</button><button type="button" data-v="street">Eye level</button></div>' +
      '<div class="m3d-sunctl"><div class="seg" id="m3d-day"><button type="button" data-d="172" aria-pressed="true">Jun 21</button><button type="button" data-d="80">Equinox</button><button type="button" data-d="355">Dec 21</button></div>' +
      '<label class="t-tech">Hour <output id="m3d-h">15:00</output><input type="range" class="range" id="m3d-hour" min="6" max="19" step="0.1" value="15"></label><span class="t-tech" id="m3d-sun"></span></div>' +
      '<p class="prose" lang="fa" id="m3d-caption"></p>' +
      '<p class="t-cap">Ground: SRTM ground surface, vertical ×' + VEX + '. Heights are assumed classes (residential ≈16 m, institutional ≈14 m, hotel ≈18 m, unverified ≈12 m, on-site ≈6 m) — no height survey exists; the photos show 3–8 storeys. Trees: canopy extracted from the imagery. Drag to orbit · scroll/pinch to zoom · hover a building.</p>';
    SA.$$('#m3d-state button').forEach((b, i) => (b.onclick = () => setState(i === 1)));
    SA.$$('#m3d-cam button').forEach((b) => (b.onclick = () => fly(presets[b.dataset.v])));
    SA.$$('#m3d-day button').forEach((b) => (b.onclick = () => { day = +b.dataset.d; SA.$$('#m3d-day button').forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false')); placeSun(); wake(); }));
    const hr = SA.$('#m3d-hour');
    hr.oninput = () => { hour = +hr.value; const H2 = Math.floor(hour), Mi = Math.round((hour - H2) * 60); SA.$('#m3d-h').textContent = H2 + ':' + String(Mi).padStart(2, '0'); placeSun(); wake(); };
    setState(false); SA.$('#m3d-caption').innerHTML = '<b>وضع موجود</b> — پارکینگ آسفالته با ۸ بنای کوتاه (≈ ۲۸٪ سطح اشغال)؛ همه‌ی آن‌ها تخریب می‌شوند.';
    placeSun();

    /* ---------- render loop: only while visible, idle-aware ---------- */
    let visible = false, raf = 0, idleUntil = 0;
    function resize() { const r = host.getBoundingClientRect(); if (!r.width) return; renderer.setSize(r.width, r.height, false); cam.aspect = r.width / r.height; cam.updateProjectionMatrix(); render(); }
    function render() {
      renderer.render(scene, cam);
      const r = renderer.domElement.getBoundingClientRect();
      L.forEach(({ v, e }) => { const p = v.clone().project(cam); const vis = p.z < 1 && Math.abs(p.x) < 1.05 && Math.abs(p.y) < 1.05; e.style.opacity = vis ? 1 : 0; e.style.transform = 'translate(' + ((p.x + 1) / 2 * r.width).toFixed(1) + 'px,' + ((1 - p.y) / 2 * r.height).toFixed(1) + 'px)'; });
    }
    function loop(now) {
      raf = 0;
      if (!visible) return;
      if (tween) tween(now);
      if (demoT) { demoT(now); renderer.shadowMap.needsUpdate = true; }
      const moving = controls.update();
      render();
      if (tween || demoT || moving || now < idleUntil) raf = requestAnimationFrame(loop);
    }
    function wake() { idleUntil = performance.now() + 600; if (!raf && visible) raf = requestAnimationFrame(loop); }
    controls.addEventListener('change', wake);
    new ResizeObserver(resize).observe(host);
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) { resize(); wake(); if (!SA._m3dIntro) { SA._m3dIntro = 1; fly(presets.axo, SA.reduced ? 1 : 2600); } } }, { threshold: 0.05 }).observe(host);
    /* scroll narrative: steps drive state / camera / sun */
    const steps = [
      () => { setState(false); fly(presets.axo); },
      () => { setState(false); fly(presets.sw); },
      () => { day = 172; hour = 17.5; hr.value = hour; hr.oninput(); fly(presets.axo); },
      () => { setState(true); fly([T0.x + 200, 170, T0.z + 210]); },
      () => { setState(true); fly(presets.top); },
    ];
    SA.scrolly(SA.$('#m3d-scrolly'), (k) => steps[k] && steps[k]());
  }
  SA.sections.push(model3d);
})();
