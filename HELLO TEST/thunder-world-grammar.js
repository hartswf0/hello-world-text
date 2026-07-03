/* ═══════════════════════════════════════════════════════════════════════════
   @module WORLD_GRAMMAR (WG v1)
   The world-side twin of VG: a vocabulary of crafted, drivable-world primitives
   the LLM composes in code. Same philosophy as the vehicle grammar — the model
   AUTHORS form; the grammar guarantees craft, collision honesty, and budgets.

   LAWS
   · FLAT SOLIDS: every collidable mesh is a direct child of the root at WORLD
     coordinates (the game's collision reads mesh.position as world-space).
   · IDENTITY ROOT: build() must never move/scale the root — the cert checks.
   · TWO CLEAR CIRCLES: no solid may crowd the origin (r 13) or the car spawn
     at (0, 0, 15) (r 12). scatter() avoids them; the certificate enforces.
   · BOUNDS: all solids within |x|,|z| ≤ 70.
   · TRANSACTIONAL: solids buffer in wg.pending — the host commits only after
     the certificate passes. reset() makes attempts idempotent.
   · CEILINGS (Power of 10): SOLID 120 · MAKER 140 · SCATTER 24 · RING 16 ·
     GROVE 12. Exceeding any throws a named error the Forge can repair on.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WGKIT = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const WG_MAX = { SOLID: 120, MAKER: 140, SCATTER: 24, RING: 16, GROVE: 12 };
  const CLEAR = [{ x: 0, z: 0, r: 13 }, { x: 0, z: 15, r: 12 }];
  const BOUND = 70;

  function makeWG(host) {
    const THREE = host.THREE;
    const wg = {};
    let solids = 0, makers = 0;

    wg.P = {
      stone: 0x8a8a92, stoneDk: 0x55555e, sand: 0xc9a96a, sandDk: 0x8a6f42,
      clay: 0xa0522d, moss: 0x4a7043, pine: 0x2e5d34, pineDk: 0x1d3b22,
      bark: 0x4e3a26, ash: 0x2e2e34, obsidian: 0x17171d, bone: 0xd8d2c0,
      ember: 0xff6a2a, volt: 0x19e6c8, amber: 0xffd23f, blood: 0xff2e2e,
      royal: 0x3b82f6, violet: 0xa855f7, ice: 0xbfe8ff, gold: 0xd4af37
    };

    wg.root = new THREE.Group();
    wg.root.name = 'wg-world';
    wg.pending = [];            // [{mesh, dims}] — committed by the host on accept
    wg.records = [];            // provenance: every maker call as a graph record
    wg.rulesData = null;        // rule-bearing worlds: physics/perception payload
    wg._ticks = [];
    wg.atmo = null;

    wg.reset = function () {
      while (wg.root.children.length) {
        const c = wg.root.children.pop();
        c.traverse(o => { if (o.geometry && o.geometry.dispose) o.geometry.dispose();
                          if (o.material && o.material.dispose) o.material.dispose(); });
      }
      wg.pending.length = 0; wg._ticks.length = 0; wg.records.length = 0; wg.rulesData = null;
      solids = 0; makers = 0; wg.atmo = null;
    };

    // ── materials ──────────────────────────────────────────────────────────
    wg.matte = (c, rough = 0.9) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.05 });
    wg.paint = (c, rough = 0.55) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, metalness: 0.2 });
    wg.emiss = (c, i = 1.6) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: i, roughness: 0.4, metalness: 0 });
    wg.basic = (c, opacity = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: opacity < 1, opacity });

    // ── internals ──────────────────────────────────────────────────────────
    function ceil(kind, n, max) { if (n > max) throw new Error('WG ceiling: ' + kind + ' > ' + max); }
    function maker() { makers++; ceil('MAKER', makers, WG_MAX.MAKER); }
    function rec(kind, args) { wg.records.push({ eid: 'w' + wg.records.length, k: kind, a: args || [] }); }
    wg.rules = function (r) { wg.rulesData = Object.assign({ traction: 1 }, r || {}); rec('rules', [wg.rulesData.traction]); };
    function reg(mesh, dims) {
      solids++; ceil('SOLID', solids, WG_MAX.SOLID);
      wg.pending.push({ mesh, dims });
      if (mesh.parent !== wg.root) wg.root.add(mesh);
      return mesh;
    }
    function solidBox(x, y, z, w, h, d, mat, ry) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z); if (ry) m.rotation.y = ry;
      return reg(m, { w, h, d });
    }
    function solidCyl(x, z, r, h, mat, seg) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, h, seg || 8), mat);
      m.position.set(x, h / 2, z);
      return reg(m, { w: r * 2, h, d: r * 2 });
    }
    function visual(mesh, x, y, z, parent) { mesh.position.set(x, y, z); (parent || wg.root).add(mesh); return mesh; }

    wg.rand = function (seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

    // ── ATOMS (VG-style): compose ANY form, then place it and declare solids ──
    wg.box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    wg.cyl = (r, h, mat, seg) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 8), mat);
    wg.cone = (r, h, mat, seg) => new THREE.Mesh(new THREE.ConeGeometry(r, h, seg || 8), mat);
    wg.sphere = (r, mat, ws, hs) => new THREE.Mesh(new THREE.SphereGeometry(r, ws || 10, hs || 8), mat);
    wg.ico = (r, det, mat) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, det || 0), mat);
    wg.torus = (r, t, mat, seg) => new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, seg || 16), mat);
    wg.plane = (w, h, mat) => { if (mat) mat.side = THREE.DoubleSide; return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); };
    wg.put = function (mesh, x, y, z, ry) { mesh.position.set(x, y, z); if (ry) mesh.rotation.y = ry; wg.root.add(mesh); return mesh; };
    wg.solid = function (mesh, w, h, d) { rec('solid', [w||2, h||2, d||2]); return reg(mesh, { w: w || 2, h: h || 2, d: d || 2 }); };
    wg.tick = function (fn) { if (typeof fn === 'function' && wg._ticks.length < 64) wg._ticks.push(fn); };

    // ── atmosphere (REQUIRED — the certificate checks) ─────────────────────
    wg.atmosphere = function (p) { wg.atmo = p || {}; if (host.atmosphere) host.atmosphere(wg.atmo); };

    // ── solid structures ───────────────────────────────────────────────────
    wg.block = function (x, z, w, h, d, c, litC, ry) {           // building with lit window strips
      maker(); rec('block', [x, z]);
      const b = solidBox(x, h / 2, z, w, h, d, wg.matte(c != null ? c : wg.P.ash), ry || 0);
      const lit = wg.emiss(litC != null ? litC : wg.P.volt, 1.8);
      const rows = Math.max(1, Math.min(4, Math.floor(h / 4)));
      for (let i = 0; i < rows; i++) {
        const y = -h / 2 + (i + 0.75) * (h / (rows + 0.5));
        const s1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 0.32, 0.06), lit);
        s1.position.set(0, y, d / 2 + 0.04); b.add(s1);
        const s2 = s1.clone(); s2.position.z = -d / 2 - 0.04; b.add(s2);
      }
      return b;
    };
    wg.mesa = function (x, z, w, h, d, c) {
      maker(); rec('mesa', [x, z]);
      const base = solidBox(x, h / 2, z, w, h, d, wg.matte(c != null ? c : wg.P.sandDk, 0.95));
      visual(new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, h * 0.16, d * 0.8), wg.matte(wg.P.sand, 0.9)), 0, h * 0.55, 0, base);
      return base;
    };
    wg.pillar = function (x, z, h, r, c) { maker(); rec('pillar', [x, z]); return solidCyl(x, z, r || 1.1, h, wg.matte(c != null ? c : wg.P.bone, 0.8)); };
    wg.spire = function (x, z, h, c) {
      maker(); rec('spire', [x, z]);
      const base = solidBox(x, h * 0.25, z, 3.2, h * 0.5, 3.2, wg.matte(c != null ? c : wg.P.stoneDk));
      visual(new THREE.Mesh(new THREE.BoxGeometry(2.1, h * 0.34, 2.1), wg.matte(wg.P.stone)), 0, h * 0.42, 0, base);
      visual(new THREE.Mesh(new THREE.ConeGeometry(1.2, h * 0.3, 6), wg.emiss(wg.P.amber, 1.2)), 0, h * 0.66, 0, base);
      return base;
    };
    wg.arch = function (x, z, ry, span, h, c) {                   // pillars solid, lintel visual (drive under)
      maker(); rec('arch', [x, z]);
      const mat = wg.matte(c != null ? c : wg.P.bone, 0.85);
      const hx = Math.cos(ry || 0) * span / 2, hz = -Math.sin(ry || 0) * span / 2;
      solidBox(x - hx, h / 2, z - hz, 1.6, h, 1.6, mat, ry || 0);
      solidBox(x + hx, h / 2, z + hz, 1.6, h, 1.6, mat, ry || 0);
      const lin = new THREE.Mesh(new THREE.BoxGeometry(span + 2.4, 1.4, 2.0), mat);
      lin.position.set(x, h + 0.7, z); lin.rotation.y = ry || 0; wg.root.add(lin);
    };
    wg.tree = function (x, z, h, ry) {
      maker(); rec('tree', [x, z]);
      const trunk = solidCyl(x, z, 0.5, h * 0.45, wg.matte(wg.P.bark, 0.95), 6);
      if (ry) trunk.rotation.y = ry;
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(h * 0.32, h * 0.5, 7), wg.matte(wg.P.pine));
      c1.position.y = h * 0.42; trunk.add(c1);
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(h * 0.22, h * 0.38, 7), wg.matte(wg.P.pineDk));
      c2.position.y = h * 0.66; trunk.add(c2);
      return trunk;
    };
    wg.rock = function (x, z, r, c) {
      maker(); rec('rock', [x, z]);
      const m = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), wg.matte(c != null ? c : wg.P.stoneDk, 0.97));
      m.position.set(x, r * 0.45, z); m.rotation.y = (x * 7 + z * 3) % 3;
      return reg(m, { w: r * 1.7, h: r * 1.4, d: r * 1.7 });
    };
    wg.ramp = function (x, z, ry, len, h, w) {
      maker(); rec('ramp', [x, z]);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w || 4, 0.6, len || 7), wg.paint(wg.P.stone, 0.6));
      m.position.set(x, h / 2, z); m.rotation.set(-Math.atan2(h, len || 7), ry || 0, 0);
      m.userData.ramp = true;
      return reg(m, { w: w || 4, h: h, d: len || 7 });
    };
    wg.bridge = function (x, z, ry, len, h, w) {                  // deck visual, feet solid
      maker(); rec('bridge', [x, z]);
      const mat = wg.matte(wg.P.stone, 0.85);
      const hx = Math.cos(ry || 0) * len / 2, hz = -Math.sin(ry || 0) * len / 2;
      solidBox(x - hx, h / 2, z - hz, 2, h, 2, mat, ry || 0);
      solidBox(x + hx, h / 2, z + hz, 2, h, 2, mat, ry || 0);
      const deck = new THREE.Mesh(new THREE.BoxGeometry(len + 3, 0.8, (w || 4)), mat);
      deck.position.set(x, h + 0.4, z); deck.rotation.y = ry || 0; wg.root.add(deck);
    };
    wg.ruin = function (x, z, w, d, c, seed) {
      maker(); rec('ruin', [x, z]);
      const rnd = wg.rand((seed || 7) * 2654435761);
      const mat = wg.matte(c != null ? c : wg.P.bone, 0.92);
      const spots = [[-w / 2, 0], [w / 2, 0], [0, -d / 2], [0, d / 2]];
      spots.forEach((s, i) => {
        const h = 2 + rnd() * 5;
        solidBox(x + s[0], h / 2, z + s[1], (i < 2 ? 1.4 : w * 0.7), h, (i < 2 ? d * 0.7 : 1.4), mat);
      });
    };
    wg.pylonRing = function (x, z, n, r, h, c) {
      maker(); rec('pylonRing', [x, z]);
      const count = Math.min(n || 8, WG_MAX.RING);
      const caps = [];
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
        const p = solidCyl(px, pz, 0.9, h, wg.matte(wg.P.obsidian, 0.7), 6);
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.7, 1.5), wg.emiss(c != null ? c : wg.P.volt, 1.4));
        cap.position.y = h / 2 + 0.35; p.add(cap); caps.push(cap);
      }
      wg._ticks.push(t => caps.forEach((cp, i) => { cp.material.emissiveIntensity = 1.1 + Math.sin(t * 1.6 + i * 0.8) * 0.7; }));
    };
    wg.glowRune = function (x, z, r, c) {                          // visual only — drive across it
      maker(); rec('glowRune', [x, z]);
      const grp = new THREE.Group(); grp.position.set(x, 0.07, z); wg.root.add(grp);
      const segs = [];
      const n = 10;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const s = new THREE.Mesh(new THREE.BoxGeometry(r * 0.42, 0.05, 0.5), wg.basic(c != null ? c : wg.P.volt, 0.85));
        s.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); s.rotation.y = -a + Math.PI / 2;
        grp.add(s); segs.push(s);
      }
      wg._ticks.push(t => { const k = 0.5 + Math.sin(t * 2.1) * 0.35; segs.forEach((s, i) => { s.material.opacity = 0.35 + k * (0.5 + 0.5 * Math.sin(t * 3 + i)); }); grp.rotation.y = t * 0.15; });
    };
    wg.torchRow = function (x, z, ry, n, gap) {
      maker(); rec('torchRow', [x, z]);
      const count = Math.min(n || 4, 8);
      const embers = [];
      for (let i = 0; i < count; i++) {
        const o = (i - (count - 1) / 2) * (gap || 6);
        const px = x + Math.cos(ry || 0) * o, pz = z - Math.sin(ry || 0) * o;
        const pole = solidCyl(px, pz, 0.28, 3.2, wg.matte(wg.P.bark), 5);
        const e = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), wg.emiss(wg.P.ember, 2.2));
        e.position.y = 1.95; pole.add(e); embers.push(e);
      }
      wg._ticks.push(t => embers.forEach((e, i) => { e.material.emissiveIntensity = 1.7 + Math.sin(t * 9 + i * 2.7) * 0.5 + Math.sin(t * 23 + i) * 0.25; }));
    };
    wg.banner = function (x, z, ry, h, c) {
      maker(); rec('banner', [x, z]);
      const pole = solidCyl(x, z, 0.22, h || 6, wg.matte(wg.P.ash), 5);
      const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.6, (h || 6) * 0.45), wg.paint(c != null ? c : wg.P.blood, 0.8));
      cloth.material.side = THREE.DoubleSide;
      cloth.position.set(0.85, (h || 6) * 0.22, 0); cloth.rotation.y = (ry || 0);
      pole.add(cloth);
      wg._ticks.push(t => { cloth.rotation.y = (ry || 0) + Math.sin(t * 1.3 + x) * 0.18; });
    };
    wg.grove = function (x, z, n, r, seed) {
      maker(); rec('grove', [x, z]);
      const count = Math.min(n || 5, WG_MAX.GROVE);
      const rnd = wg.rand((seed || 3) * 22695477);
      for (let i = 0; i < count; i++) {
        const a = rnd() * Math.PI * 2, rad = (r || 8) * (0.35 + rnd() * 0.65);
        wg.tree(x + Math.cos(a) * rad, z + Math.sin(a) * rad, 5 + rnd() * 5, rnd() * 6);
      }
    };

    // ── composition ────────────────────────────────────────────────────────
    wg.scatter = function (n, rMin, rMax, seed, fn) {
      const count = Math.min(n || 6, WG_MAX.SCATTER);
      const rnd = wg.rand((seed || 11) * 2246822519);
      let placed = 0, guard = 0;
      while (placed < count && guard < count * 9) {
        guard++;
        const a = rnd() * Math.PI * 2, rad = rMin + rnd() * Math.max(0.001, rMax - rMin);
        const x = Math.cos(a) * rad, z = Math.sin(a) * rad;
        if (CLEAR.some(cz => Math.hypot(x - cz.x, z - cz.z) < cz.r + 2)) continue;
        if (Math.abs(x) > BOUND || Math.abs(z) > BOUND) continue;
        fn(x, z, placed, rnd); placed++;
      }
      return placed;
    };

    wg.finish = function () {
      const ticks = wg._ticks.slice();
      wg.root.userData.tick = ticks.length ? (t) => { for (let i = 0; i < ticks.length; i++) { try { ticks[i](t); } catch (_) {} } } : null;
      return { solids, makers };
    };

    return wg;
  }

  // ── THE WORLD CERTIFICATE ──────────────────────────────────────────────────
  function validateWorld(wg) {
    try {
      if (!wg || !wg.root) return { ok: false, err: 'no world root' };
      if (!wg.atmo) return { ok: false, err: 'atmosphere() was never called — sky/fog/ground are required' };
      const r = wg.root;
      if (r.position.x || r.position.y || r.position.z || r.scale.x !== 1 || r.scale.y !== 1 || r.scale.z !== 1)
        return { ok: false, err: 'root transform must stay identity (build in world coordinates)' };
      const solids = wg.pending;
      if (solids.length < 8) return { ok: false, err: 'too few solid structures (' + solids.length + ' < 8) — compose a real place' };
      if (solids.length > WG_MAX.SOLID) return { ok: false, err: 'WG ceiling: SOLID > ' + WG_MAX.SOLID };
      for (const s of solids) {
        const p = s.mesh.position, foot = Math.max(s.dims.w || 0, s.dims.d || 0) / 2;
        if (Math.abs(p.x) > BOUND || Math.abs(p.z) > BOUND)
          return { ok: false, err: 'solid out of bounds at (' + p.x.toFixed(0) + ',' + p.z.toFixed(0) + ') — keep |x|,|z| <= ' + BOUND };
        for (const cz of CLEAR) {
          if (Math.hypot(p.x - cz.x, p.z - cz.z) - foot < cz.r)
            return { ok: false, err: 'solid crowds the clear circle at (' + cz.x + ',' + cz.z + ') r' + cz.r + ' — found one at (' + p.x.toFixed(0) + ',' + p.z.toFixed(0) + ')' };
        }
      }
      let meshes = 0; r.traverse(o => { if (o.isMesh) meshes++; });
      if (meshes > 700) return { ok: false, err: 'mesh budget exceeded (' + meshes + ' > 700)' };
      return { ok: true, cert: { solids: solids.length, meshes, spawnClear: true } };
    } catch (e) { return { ok: false, err: 'validate: ' + ((e && e.message) || e) }; }
  }

  // ── THE DRAFT CERTIFICATE — in-game focal constructions ───────────────────
  function validateDraft(wg) {
    try {
      if (!wg || !wg.root) return { ok: false, err: 'no draft root' };
      const solids = wg.pending;
      if (!solids.length) return { ok: false, err: 'no solid geometry — use WG.solid or the molecules' };
      if (solids.length > 40) return { ok: false, err: 'draft ceiling: 40 solids' };
      for (const s of solids) {
        const p = s.mesh.position;
        if (Math.abs(p.x) > 26 || Math.abs(p.z) > 26)
          return { ok: false, err: 'draft out of local bounds (|x|,|z| <= 26) at (' + p.x.toFixed(0) + ',' + p.z.toFixed(0) + ')' };
      }
      let meshes = 0; wg.root.traverse(o => { if (o.isMesh) meshes++; });
      if (meshes > 240) return { ok: false, err: 'draft mesh budget exceeded (' + meshes + ' > 240)' };
      return { ok: true, cert: { solids: solids.length, meshes } };
    } catch (e) { return { ok: false, err: 'validate: ' + ((e && e.message) || e) }; }
  }

  return { makeWG, validateWorld, validateDraft, WG_MAX, CLEAR, BOUND };
});
