/* ═══════════════════════════════════════════════════════════════════════════
   @module GOLDEN_WORLDS
   Three certified world masterworks in WG v1 — the few-shot corpus for the
   world Forge, exactly as the thunder-god library serves the vehicle Forge.
   Each is a COMPOSITION: a drivable place with lanes, gates, and landmarks,
   not scattered props. All solids respect the two clear circles by arithmetic.
   ═══════════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GOLDEN_WORLDS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const WORLDS = {};

  WORLDS.canyon = {
    num: 1, name: 'CANYON RUN',
    keywords: 'canyon desert mesa rock dune sand arch gate cliff sunset western badlands ravine dust road run',
    code: `function build(w, WG, THREE){
  const P = WG.P;
  WG.atmosphere({ sky:'#e8a15c', fog:'#c97b3f', ground:'#8a5a34' });
  // twin mesa ridges flank a driving lane along z
  const ridgeZ = [-45,-28,-10,8,26,44];
  ridgeZ.forEach((z,i)=>{
    WG.mesa(-22-(i%2)*5, z, 8+(i%3)*3, 7+(i%4)*4, 9, P.sandDk);
    WG.mesa( 22+((i+1)%2)*5, z, 8+((i+1)%3)*3, 6+((i+2)%4)*4, 9, P.clay);
  });
  // stone gates over the lane
  WG.arch(0,-20, 0, 12, 8, P.bone);
  WG.arch(0, 32, 0, 12, 7, P.bone);
  WG.banner(-7,-20, 0, 6, P.blood);
  WG.banner( 7,-20, 0, 6, P.amber);
  // torch gates crossing the lane
  WG.torchRow(0,-34, 0, 4, 6);
  WG.torchRow(0, 44, 0, 4, 6);
  // jump line + landmark + far rune
  WG.ramp(-19,-38, 0.5, 7, 3, 4);
  WG.ramp( 19,-38,-0.5, 7, 3, 4);
  WG.spire(0,-56, 15, P.stoneDk);
  // skull rock — atoms: a half-buried skull watching the lane
  const skull = WG.sphere(4.2, WG.matte(P.bone, 0.9), 10, 8); skull.scale.y = 0.85;
  WG.put(skull, 30, 1.6, 8); WG.solid(skull, 8, 5, 8);
  const jaw = WG.box(5.2, 1.4, 3.4, WG.matte(P.bone, 0.95)); WG.put(jaw, 30, 0.7, 10.6);
  [-1,1].forEach(s=>{
    const sock = WG.cyl(0.9, 0.7, WG.emiss(P.ember, 2), 8); sock.rotation.x = Math.PI/2;
    WG.put(sock, 30 + s*1.6, 2.4, 11.4);
    WG.tick(t => { sock.material.emissiveIntensity = 1.4 + Math.sin(t*1.1 + s*2)*0.8; });
  });
  WG.glowRune(0, 54, 5, P.amber);
  // boulder field beyond the ridges
  WG.scatter(10, 36, 62, 41, (x,z,i,rnd)=> WG.rock(x, z, 2+rnd()*2.6, P.stoneDk));
  return w;
}`
  };

  WORLDS.necropolis = {
    num: 2, name: 'NEON NECROPOLIS',
    keywords: 'city neon dark night urban metropolis tower building street grid cyber ghost dead necropolis skyline downtown ruins gothic',
    code: `function build(w, WG, THREE){
  const P = WG.P;
  WG.atmosphere({ sky:'#0b0b12', fog:'#241a33', ground:'#17171d' });
  WG.rules({ traction: 0.85 });   // wet obsidian streets \u2014 the world bears rules
  const rnd = WG.rand(97);
  const lit = [P.volt, P.blood, P.amber, P.violet];
  // a street grid of dead towers — skip the clear circles with margin
  for (let gx=-2; gx<=2; gx++) for (let gz=-2; gz<=2; gz++){
    const x = gx*16 + (rnd()-0.5)*4, z = gz*16 + (rnd()-0.5)*4;
    if (Math.hypot(x,z) < 20 || Math.hypot(x,z-15) < 19) continue;
    const h = 8 + Math.floor(rnd()*4)*4;
    WG.block(x, z, 5+rnd()*2.5, h, 5+rnd()*2.5, P.ash, lit[Math.floor(rnd()*4)], rnd()*0.4);
  }
  // the dead ring beyond the grid, and a rune crossroads
  WG.pylonRing(0,-46, 12, 10, 7, P.violet);
  WG.glowRune(34, 34, 5, P.violet);
  WG.glowRune(-34,-34, 4, P.volt);
  // corner banners mark the bounds
  WG.banner( 40, 40, 0.7, 7, P.blood);
  WG.banner(-40, 40,-0.7, 7, P.blood);
  WG.banner( 40,-40, 2.4, 7, P.violet);
  WG.banner(-40,-40,-2.4, 7, P.violet);
  return w;
}`
  };

  WORLDS.grove = {
    num: 3, name: 'GROVE OF PYLONS',
    keywords: 'forest grove tree pine sacred shrine glow pillar ring magic druid ancient woods jungle nature mystic pylon',
    code: `function build(w, WG, THREE){
  const P = WG.P;
  WG.atmosphere({ sky:'#16261a', fog:'#1d3b28', ground:'#24331f' });
  // the great ring stands around the spawn — pillars far outside the clear circles
  WG.pylonRing(0, 0, 14, 30, 8, P.volt);
  WG.glowRune(0, 0, 6, P.volt);   // visual only: the car wakes on the rune itself
  // four groves in the cardinal shadows
  WG.grove( 34, 30, 6, 9, 5);
  WG.grove(-34, 30, 6, 9, 6);
  WG.grove( 34,-32, 6, 9, 7);
  WG.grove(-34,-32, 6, 9, 8);
  // a torch path leads north, banners guard the south
  WG.torchRow(0,-30, 0, 4, 7);
  WG.banner( 5, 44, 0.4, 7, P.amber);
  WG.banner(-5, 44,-0.4, 7, P.amber);
  // old stones sleep between the trees
  WG.scatter(8, 40, 64, 23, (x,z,i,rnd)=> WG.rock(x, z, 1.6+rnd()*2.2, P.stoneDk));
  return w;
}`
  };


  WORLDS.colossus = {
    num: 4, name: 'SUNKEN COLOSSUS',
    keywords: 'colossus statue titan giant head ancient god monument buried sunken ruin temple ozymandias stone king face guardian idol wonder epic',
    code: `function build(w, WG, THREE){
  const P = WG.P;
  WG.atmosphere({ sky:'#caa15e', fog:'#9a7440', ground:'#7d6039' });
  const stone = WG.matte(P.bone, 0.9), dark = WG.matte(P.stoneDk, 0.95), gold = WG.paint(P.gold, 0.4);
  // ── THE HEAD, half-buried, built from atoms ──
  const head = WG.sphere(9, stone, 12, 10); head.scale.y = 0.92;
  WG.put(head, 0, 3.5, -46);  WG.solid(head, 17, 12, 16);
  const brow = WG.box(10, 1.6, 2.6, dark); WG.put(brow, 0, 8.2, -39.6);
  const noseB = WG.box(2.2, 4.5, 2.4, stone); WG.put(noseB, 0, 5.2, -38.2);
  [-1,1].forEach(s=>{
    const eye = WG.box(2.6, 1.1, 0.6, WG.emiss(P.amber, 2.4));
    WG.put(eye, s*3.4, 7.0, -38.6);
    WG.tick(t => { eye.material.emissiveIntensity = 1.6 + Math.sin(t*0.9 + s)*0.9; });
    const crownS = WG.cone(1.1, 4.5, gold, 5); WG.put(crownS, s*4.5, 12.6, -45, s*0.2); crownS.rotation.z = s*-0.28;
  });
  const crownC = WG.cone(1.3, 5.5, gold, 5); WG.put(crownC, 0, 13.4, -46.5);
  // ── the reaching arm: shoulder, forearm, three fingers clawing from the sand ──
  const shoulder = WG.sphere(3.4, stone, 8, 6); WG.put(shoulder, 17, 1.4, -34); WG.solid(shoulder, 6.5, 4.5, 6.5);
  const fore = WG.box(4.2, 3.0, 9.5, stone); WG.put(fore, 19.5, 1.5, -25, 0.35); WG.solid(fore, 5, 3, 10);
  for (let i=0;i<3;i++){
    const fing = WG.box(1.2, 4.5+(i%2), 1.4, stone);
    WG.put(fing, 21+i*2.2, 2.0, -19.5+i*1.2, 0.2); fing.rotation.x = -0.35;
    WG.solid(fing, 1.6, 4.5, 1.8);
  }
  // ── a fallen crown-ring the car can circle, and the spine of the god ──
  const halo = WG.torus(7, 0.8, gold, 20); halo.rotation.x = Math.PI/2;
  WG.put(halo, -24, 0.9, -20, 0); WG.tick(t => { halo.rotation.z = t*0.12; });
  WG.scatter(7, 26, 52, 77, (x,z,i,rnd)=> WG.rock(x, z, 1.8+rnd()*2.4, P.stoneDk));
  // ── pilgrim road: torches and banners lead to the face; a rune burns before it ──
  WG.torchRow(0, 27, 0, 4, 7);
  WG.torchRow(0, -18, 0, 4, 8);
  WG.glowRune(0, -30, 5.5, P.amber);
  WG.banner( 9, -30, 0.4, 7, P.blood);
  WG.banner(-9, -30,-0.4, 7, P.blood);
  WG.arch(0, 34, 0, 12, 7, P.bone);
  WG.ruin(30, 18, 10, 8, P.bone, 4);
  WG.ruin(-32, 24, 9, 9, P.bone, 9);
  return w;
}`
  };

  function pick(prompt) {
    const p = String(prompt || '').toLowerCase();
    let best = null, bestScore = -1;
    Object.keys(WORLDS).forEach(id => {
      const e = WORLDS[id];
      let score = 0;
      e.keywords.split(/\s+/).forEach(k => { if (k && p.indexOf(k) >= 0) score++; });
      if (score > bestScore) { bestScore = score; best = id; }
    });
    return { id: best, score: bestScore, entry: WORLDS[best] };
  }

  return { WORLDS, pick };
});
