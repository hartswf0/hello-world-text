// FORGE-WORLD CONFORMANCE — golden worlds through the shipped Forge + WG certificate
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const FORGE = require('./forge-reference.js');
const WGK = require('./thunder-world-grammar.js');
const GW = require('./thunder-golden-worlds.js');
const GD = require('./thunder-golden-drafts.js');

// ── minimal THREE stub (world-grammar subset) ────────────────────────────────
class V3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} }
class Euler extends V3 {}
class Obj {
  constructor(){ this.position=new V3(); this.rotation=new Euler(); this.scale=new V3(1,1,1);
    this.children=[]; this.userData={}; this.parent=null; this.name=''; this.visible=true; }
  add(...cs){ cs.forEach(c=>{ c.parent=this; this.children.push(c); }); return this; }
  traverse(fn){ fn(this); this.children.forEach(c=>c.traverse(fn)); }
}
class Group extends Obj {}
class Mesh extends Obj {
  constructor(geo, mat){ super(); this.geometry=geo; this.material=mat; this.isMesh=true; }
  clone(){ const m=new Mesh(this.geometry,this.material); m.position.set(this.position.x,this.position.y,this.position.z); return m; }
}
const geo = t => ({ type:t, dispose(){} });
const mat = p => Object.assign({ dispose(){} }, p);
const THREE = {
  Group, Mesh, Vector3:V3,
  BoxGeometry:(...a)=>geo('Box'), CylinderGeometry:(...a)=>geo('Cyl'),
  ConeGeometry:(...a)=>geo('Cone'), IcosahedronGeometry:(...a)=>geo('Ico'),
  PlaneGeometry:(...a)=>geo('Plane'), SphereGeometry:(...a)=>geo('Sphere'), TorusGeometry:(...a)=>geo('Torus'),
  MeshStandardMaterial: function(p){ return mat(p); },
  MeshBasicMaterial: function(p){ return mat(p); },
  DoubleSide: 2
};
// stub geometries are factories, not classes — new-compatible:
['BoxGeometry','CylinderGeometry','ConeGeometry','IcosahedronGeometry','PlaneGeometry','SphereGeometry','TorusGeometry'].forEach(k=>{
  const f = THREE[k]; THREE[k] = function(...a){ return f(...a); };
});

const host = () => ({ THREE, _atmo:null, atmosphere(p){ this._atmo = p; } });

// ── two-stage compile: extract certified code, then ONE clean execution ─────
function compileWorld(code){
  const wgA = WGK.makeWG(host());
  const s1 = FORGE.compileEntry(code, { entry:'build', argNames:['w','WG','THREE'],
    args:[wgA.root, wgA, THREE], validate:()=>({ok:true}), budgetMs:400 });
  if (!s1.ok) return { ok:false, stage:'extract', attempts:s1.attempts };
  const wg = WGK.makeWG(host());
  const s2 = FORGE.compileEntry(s1.code, { entry:'build', argNames:['w','WG','THREE'],
    args:[wg.root, wg, THREE], validate:()=>WGK.validateWorld(wg), budgetMs:400 });
  if (!s2.ok) return { ok:false, stage:'certify', attempts:s2.attempts };
  const v = WGK.validateWorld(wg);
  const counts = wg.finish();
  return { ok:true, wg, cert:{ ...v.cert, makers:counts.makers, hash:FORGE.fnv1a(s1.code) }, code:s1.code, strategy:s2.strategy };
}

const EXPECTED_DRAFTS = { gate: {solids: 8, meshes: 37}, tower: {solids: 8, meshes: 17}, hand: {solids: 12, meshes: 35} };
const EXPECTED = { canyon: {solids: 40, meshes: 79}, necropolis: {solids: 33, meshes: 173}, grove: {solids: 52, meshes: 130}, colossus: {solids: 33, meshes: 62} };

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log((ok ? '✓' : '✗') + ' ' + name + (detail ? ' — ' + detail : ''));
  ok ? pass++ : fail++;
};

console.log('\nWORLD FORGE CONFORMANCE — golden worlds + certificate law');
console.log('─'.repeat(78));

// 1-3 · goldens compile, certify, and match frozen baselines
for (const id of Object.keys(GW.WORLDS)) {
  const r = compileWorld(GW.WORLDS[id].code);
  if (!r.ok) { check(id, false, JSON.stringify(r.attempts).slice(0,140)); continue; }
  const exp = EXPECTED[id];
  const countOk = exp == null || (r.cert.solids === exp.solids && r.cert.meshes === exp.meshes);
  check(id, r.ok && countOk,
    `via ${r.strategy} · ${r.cert.solids} solids · ${r.cert.meshes} meshes · tick:${typeof r.wg.root.userData.tick === 'function' ? 'yes' : 'no'} · ${r.cert.hash}`);
}

// 3d · DRAFT GOLDENS — focal constructions through the draft certificate
function compileDraft(code){
  const wgA = WGK.makeWG(host());
  const s1 = FORGE.compileEntry(code, { entry:'build', argNames:['w','WG','THREE'],
    args:[wgA.root, wgA, THREE], validate:()=>({ok:true}), budgetMs:400 });
  if (!s1.ok) return { ok:false, attempts:s1.attempts };
  const wg = WGK.makeWG(host());
  const s2 = FORGE.compileEntry(s1.code, { entry:'build', argNames:['w','WG','THREE'],
    args:[wg.root, wg, THREE], validate:()=>WGK.validateDraft(wg), budgetMs:400 });
  if (!s2.ok) return { ok:false, attempts:s2.attempts };
  const v = WGK.validateDraft(wg);
  wg.finish();
  return { ok:true, wg, cert:{ ...v.cert, hash:FORGE.fnv1a(s1.code) } };
}
for (const id of Object.keys(GD.DRAFTS)) {
  const r = compileDraft(GD.DRAFTS[id].code);
  if (!r.ok) { check('draft '+id, false, JSON.stringify(r.attempts).slice(0,140)); continue; }
  const exp = EXPECTED_DRAFTS[id];
  const countOk = exp == null || (r.cert.solids === exp.solids && r.cert.meshes === exp.meshes);
  check('draft '+id, countOk,
    `${r.cert.solids} solids · ${r.cert.meshes} meshes · tick:${typeof r.wg.root.userData.tick === 'function' ? 'yes' : 'no'} · ${r.cert.hash}`);
}
check('pick gate', GD.pick('a dragon gate over the road').id === 'gate');
check('pick tower', GD.pick('a watchtower with a beacon').id === 'tower');
check('pick hand', GD.pick('a giant stone hand monument').id === 'hand');
{
  const bad = `function build(w, WG, THREE){ WG.rock(30, 0, 2); return w; }`;
  const r = compileDraft(bad);
  check('draft local bounds law', !r.ok && JSON.stringify(r.attempts).includes('local bounds'));
}

// 3r · provenance + rules: graphs are records, worlds bear rules
{
  const r = compileWorld(GW.WORLDS.necropolis.code);
  check('world provenance records', r.ok && r.wg.records.length >= 10, r.ok ? (r.wg.records.length + ' records') : 'compile failed');
  check('rule-bearing world', r.ok && r.wg.rulesData && r.wg.rulesData.traction === 0.85);
}

// 4 · keyword routing
check('pick canyon', GW.pick('a desert canyon with stone arches').id === 'canyon');
check('pick necropolis', GW.pick('dark neon city of the dead').id === 'necropolis');
check('pick grove', GW.pick('a sacred forest with glowing pillars').id === 'grove');
check('pick colossus', GW.pick('a giant buried statue head in the desert').id === 'colossus');

// 5 · spawn law: a pillar inside the origin circle must fail the certificate
{
  const bad = `function build(w, WG, THREE){ WG.atmosphere({sky:'#111',fog:'#222',ground:'#333'});
    WG.pillar(0, 5, 6, 1.2); for(let i=0;i<9;i++) WG.rock(30+i*3, 30, 2); return w; }`;
  const r = compileWorld(bad);
  check('spawn law enforced', !r.ok && JSON.stringify(r.attempts).includes('clear circle'));
}

// 6 · car-spawn circle at (0,15) is also law
{
  const bad = `function build(w, WG, THREE){ WG.atmosphere({sky:'#111',fog:'#222',ground:'#333'});
    WG.rock(0, 16, 3); for(let i=0;i<9;i++) WG.rock(30+i*3, -30, 2); return w; }`;
  const r = compileWorld(bad);
  check('car-spawn circle enforced', !r.ok && JSON.stringify(r.attempts).includes('clear circle'));
}

// 7 · atmosphere is required
{
  const bad = `function build(w, WG, THREE){ for(let i=0;i<10;i++) WG.rock(28+i*3, 28, 2); return w; }`;
  const r = compileWorld(bad);
  check('atmosphere required', !r.ok && JSON.stringify(r.attempts).includes('atmosphere'));
}

// 8 · too few structures is not a world
{
  const bad = `function build(w, WG, THREE){ WG.atmosphere({sky:'#111',fog:'#222',ground:'#333'}); WG.rock(30,30,2); return w; }`;
  const r = compileWorld(bad);
  check('minimum composition', !r.ok && JSON.stringify(r.attempts).includes('too few'));
}

// 9 · ceilings throw named errors the Forge can repair on
{
  const bad = `function build(w, WG, THREE){ WG.atmosphere({sky:'#111',fog:'#222',ground:'#333'});
    for(let i=0;i<130;i++) WG.pillar(20 + (i%10)*4, 20 + Math.floor(i/10)*4, 5, 0.8); }`;
  const r = compileWorld(bad);
  check('SOLID ceiling named', !r.ok && JSON.stringify(r.attempts).includes('WG ceiling'));
}

// 10 · determinism: same code, same world
{
  const a = compileWorld(GW.WORLDS.canyon.code), b = compileWorld(GW.WORLDS.canyon.code);
  if (!a.ok || !b.ok) { check('deterministic build', false, 'compile failed'); }
  else {
  const pa = a.wg.pending[0].mesh.position, pb = b.wg.pending[0].mesh.position;
  check('deterministic build', a.cert.solids === b.cert.solids && pa.x === pb.x && pa.z === pb.z && a.cert.hash === b.cert.hash);
  }
}

// 11b · ATOMS: a fully custom structure passes the certificate
{
  const custom = `function build(w, WG, THREE){
    WG.atmosphere({sky:'#111',fog:'#222',ground:'#333'});
    const m = WG.matte(WG.P.ice);
    for (let i=0;i<9;i++){ const s = WG.sphere(2, m); WG.put(s, 24+i*4, 2, 24); WG.solid(s, 4, 4, 4); }
    const spinner = WG.torus(3, 0.5, WG.emiss(WG.P.volt), 12);
    WG.put(spinner, -30, 4, -30); WG.tick(t => { spinner.rotation.y = t; });
    return w; }`;
  const r = compileWorld(custom);
  const tickOk = r.ok && typeof r.wg.root.userData.tick === 'function';
  if (tickOk) r.wg.root.userData.tick(1.0);
  check('atoms + custom tick certified', r.ok && tickOk, r.ok ? (r.cert.solids + ' solids') : JSON.stringify(r.attempts).slice(0,120));
}

// 11 · worlds breathe: tick runs without throwing
{
  const r = compileWorld(GW.WORLDS.grove.code);
  let ok = typeof r.wg.root.userData.tick === 'function';
  try { r.wg.root.userData.tick(1.25); r.wg.root.userData.tick(2.5); } catch (e) { ok = false; }
  check('living tick contract', ok);
}

console.log('─'.repeat(78));
console.log(fail === 0 ? `WORLD GATE HOLDS. (${pass} checks)` : `WORLD GATE BROKEN: ${fail} failing.`);
process.exit(fail === 0 ? 0 : 1);
