/* ═══════════════════════════════════════════════════════════════════════════
   @module GOLDEN_DRAFTS
   Three certified draft masterworks — FOCAL constructions at agent scale
   (|x|,|z| <= 24, <= 40 solids, no atmosphere, alive with ticks). These are
   the few-shot corpus for the in-game FIELD SMITH, exactly as the thunder
   gods serve rigs and the great worlds serve WORLD. No scatter here: drafts
   build at their local origin, where scatter's spawn-avoidance would starve
   the composition — local rings are written as plain loops.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GOLDEN_DRAFTS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DRAFTS = {};

  DRAFTS.gate = {
    num: 1, name: 'DRAGON GATE',
    keywords: 'gate arch door entrance portal dragon fang guard threshold wall pass gateway teeth demon torii',
    code: `function build(w, WG, THREE){
  const P = WG.P;
  const stone = WG.matte(P.stoneDk, 0.9), bone = WG.matte(P.bone, 0.85), goldM = WG.paint(P.gold, 0.4);
  // the gate itself — solid pillars, a lintel to drive under
  WG.arch(0, 0, 0, 11, 8, P.stoneDk);
  WG.pillar(-11, -1, 5, 1.0, P.stoneDk);
  WG.pillar( 11, -1, 5, 1.0, P.stoneDk);
  // fangs hang from the lintel (atoms, visual)
  for (let i = 0; i < 5; i++){
    const f = WG.cone(i === 2 ? 0.55 : 0.42, i === 2 ? 2.5 : 1.6, bone, 5);
    f.rotation.x = Math.PI;
    WG.put(f, -4 + i*2, 7.5, 0);
  }
  // horned crests, ember eyes, folded wings on each pillar
  [-1, 1].forEach(s => {
    const horn = WG.cone(0.5, 2.6, bone, 5); horn.rotation.z = s * -0.5; WG.put(horn, s*6.4, 8.8, 0);
    const eye = WG.sphere(0.42, WG.emiss(P.ember, 2.4), 8, 6); WG.put(eye, s*5.5, 6.2, 0.95);
    WG.tick(t => { eye.material.emissiveIntensity = 1.7 + Math.sin(t*2.1 + s)*0.9; });
    const wing = WG.plane(3.4, 4.6, WG.paint(P.blood, 0.75)); WG.put(wing, s*8.4, 5.2, -0.4, s*0.5);
    WG.tick(t => { wing.rotation.y = s*0.5 + Math.sin(t*1.2 + s)*0.14; });
    WG.rock(s*9.5, 2.4, 2.2, P.stoneDk);
  });
  // spine ridge along the lintel
  for (let i = 0; i < 4; i++){ const sp = WG.cone(0.36, 1.1, stone, 4); WG.put(sp, -2.4 + i*1.6, 9.2 + (i%2)*0.3, 0); }
  // gilded threshold — rune burning in the gateway
  WG.glowRune(0, 0, 3.4, P.ember);
  const ring = WG.torus(4.6, 0.16, goldM, 24); ring.rotation.x = Math.PI/2; WG.put(ring, 0, 0.12, 0);
  WG.torchRow(0, 6, 0, 2, 9);
  return w;
}`
  };

  DRAFTS.tower = {
    num: 2, name: 'WATCHTOWER',
    keywords: 'tower watchtower keep fort fortress beacon outpost turret castle lookout spire lighthouse post',
    code: `function build(w, WG, THREE){
  const P = WG.P;
  const stone = WG.matte(P.stoneDk, 0.92), lite = WG.matte(P.stone, 0.85);
  // three solid tiers, each set on the last
  const t1 = WG.box(6, 4, 6, stone);   WG.put(t1, 0, 2.0, 0);  WG.solid(t1, 6, 4, 6);
  const t2 = WG.box(4.6, 4, 4.6, lite); WG.put(t2, 0, 6.0, 0);  WG.solid(t2, 4.6, 4, 4.6);
  const t3 = WG.box(3.4, 3.4, 3.4, stone); WG.put(t3, 0, 9.7, 0); WG.solid(t3, 3.4, 3.4, 3.4);
  // gilded crown, brazier bowl, and a living flame
  const crown = WG.torus(2.5, 0.22, WG.paint(P.gold, 0.4), 16); crown.rotation.x = Math.PI/2; WG.put(crown, 0, 11.6, 0);
  const bowl = WG.cyl(0.9, 0.7, WG.matte(P.ash), 8); WG.put(bowl, 0, 12.0, 0);
  const flame = WG.ico(0.55, 0, WG.emiss(P.ember, 2.6)); WG.put(flame, 0, 12.75, 0);
  WG.tick(t => {
    flame.material.emissiveIntensity = 2.0 + Math.sin(t*7)*0.7 + Math.sin(t*17)*0.3;
    const s = 1 + Math.sin(t*9)*0.12; flame.scale.set(s, 1 + Math.sin(t*6)*0.2, s);
  });
  // lit arrow-slits climbing the face, a door, an approach ramp
  for (let i = 0; i < 3; i++){ const sl = WG.box(0.35, 1.0, 0.1, WG.emiss(P.amber, 1.6)); WG.put(sl, 0, 3 + i*3.3, 3.02 - i*0.68); }
  const door = WG.box(1.6, 2.4, 0.2, WG.matte(P.bark, 0.9)); WG.put(door, 0, 1.2, 3.05);
  WG.ramp(0, 6.2, 0, 5, 1.4, 3);
  // banners on the shoulders, buttress stones at the feet
  WG.banner( 4.2, 2.2,  0.4, 6, P.royal);
  WG.banner(-4.2, 2.2, -0.4, 6, P.royal);
  WG.rock( 5.2, -4.2, 1.6, P.stoneDk);
  WG.rock(-5.2, -4.2, 1.6, P.stoneDk);
  return w;
}`
  };

  DRAFTS.hand = {
    num: 3, name: 'TITAN HAND',
    keywords: 'hand statue monument titan colossus finger fingers stone giant idol fist arm relic ruin ancient buried',
    code: `function build(w, WG, THREE){
  const P = WG.P;
  const stone = WG.matte(P.stone, 0.92), dark = WG.matte(P.stoneDk, 0.95);
  // the palm breaks the earth
  const palm = WG.box(7, 2.6, 6, stone); palm.rotation.z = 0.06; WG.put(palm, 0, 1.3, 0); WG.solid(palm, 7, 2.8, 6);
  // four fingers in two segments, clawing upward
  for (let i = 0; i < 4; i++){
    const x = -2.7 + i*1.8;
    const f1 = WG.box(1.3, 3.4, 1.3, stone); f1.rotation.x = -0.18; WG.put(f1, x, 3.9, 2.6); WG.solid(f1, 1.5, 3.6, 1.6);
    const f2 = WG.box(1.05, 2.6, 1.05, dark); f2.rotation.x = -0.42; WG.put(f2, x, 6.3, 3.5);
  }
  // the thumb, and a gold ring on the index
  const th = WG.box(1.5, 3.2, 1.5, stone); th.rotation.z = 0.7; WG.put(th, -4.6, 2.4, -0.8); WG.solid(th, 2.6, 3.2, 2);
  const ring = WG.torus(1.05, 0.22, WG.paint(P.gold, 0.35), 16); ring.rotation.x = 1.48; WG.put(ring, 0.9, 4.7, 2.75);
  // the earth remembers: rune halo, rubble ring (plain loop — never scatter in a draft)
  WG.glowRune(0, 0, 6, P.amber);
  for (let i = 0; i < 6; i++){
    const a = (i/6) * Math.PI * 2;
    WG.rock(Math.cos(a)*9.5, Math.sin(a)*9.5, 1.1 + (i%3)*0.4, P.stoneDk);
  }
  // leaning grave-slabs and a slow orbit of amber sparks
  for (let i = 0; i < 3; i++){
    const slab = WG.box(1.6, 3.2, 0.4, dark); slab.rotation.z = (i-1)*0.35; slab.rotation.y = i*0.8;
    WG.put(slab, -7 + i*7, 1.4, -6.5);
  }
  const orbs = [];
  for (let i = 0; i < 5; i++){ const o = WG.sphere(0.16, WG.emiss(P.amber, 2), 6, 5); WG.put(o, 0, 5, 0); orbs.push(o); }
  WG.tick(t => { orbs.forEach((o, i) => { const a = t*0.7 + i*1.256;
    o.position.set(Math.cos(a)*5.2, 4.5 + Math.sin(t*1.3 + i)*0.8, Math.sin(a)*5.2); }); });
  return w;
}`
  };

  function pick(prompt) {
    const p = String(prompt || '').toLowerCase();
    let best = null, bestScore = -1;
    Object.keys(DRAFTS).forEach(id => {
      const e = DRAFTS[id];
      let score = 0;
      e.keywords.split(/\s+/).forEach(k => { if (k && p.indexOf(k) >= 0) score++; });
      if (score > bestScore) { bestScore = score; best = id; }
    });
    return { id: best, score: bestScore, entry: DRAFTS[best] };
  }

  return { DRAFTS, pick };
});
