// FORGE CONFORMANCE HARNESS — Node, zero deps.
// Proves: (1) the CURRENT extractBuildFn mis-handles realistic model output;
//         (2) the PROPOSED forgeCompile pipeline handles the same corpus.
// Run: node forge-conformance.test.mjs

// ── minimal THREE / VG stubs (recording, not rendering) ─────────────────────
class Vec3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} copy(v){return this.set(v.x,v.y,v.z);} }
class Obj3D { constructor(){this.children=[];this.position=new Vec3();this.rotation=new Vec3();this.scale=new Vec3(1,1,1);this.userData={};} add(...o){o.forEach(c=>this.children.push(c));return this;} }
class Group extends Obj3D {}
class Mesh extends Obj3D { constructor(geo,mat){super();this.geometry=geo;this.material=mat;this.isMesh=true;} }
const geo = (kind)=>({kind});
const THREE = {
  Group, Mesh, Vector3: Vec3, MathUtils:{ lerp:(a,b,t)=>a+(b-a)*t },
  BoxGeometry:function(...a){return geo('box')}, SphereGeometry:function(...a){return geo('sphere')},
  CylinderGeometry:function(...a){return geo('cyl')}, ConeGeometry:function(...a){return geo('cone')},
  TorusGeometry:function(...a){return geo('torus')}, MeshStandardMaterial:function(o){return {o}},
  MeshPhysicalMaterial:function(o){return {o}}, MeshBasicMaterial:function(o){return {o}},
};
const VG = {
  paint:(hex,o)=>({m:'paint',hex}), matte:(hex,o)=>({m:'matte',hex}), metal:(hex,o)=>({m:'metal',hex}),
  glass:(t,o)=>({m:'glass'}), box:(w,h,d,m)=>new Mesh(geo('box'),m), cyl:(rt,rb,h,m,s)=>new Mesh(geo('cyl'),m),
  sphere:(r,m)=>new Mesh(geo('sphere'),m), wheel:(r,w,rim)=>new Group(), headlight:(h)=>new Group(), Group:()=>new Group(),
};
function countMeshes(node){ let n = (node instanceof Mesh)?1:0; for(const c of node.children||[]) n += countMeshes(c); return n; }

// ── CURRENT implementation (verbatim port from hello-world-003.html) ────────
function extractBuildFn_v1(reply){
  let code = String(reply||'').replace(/```(?:javascript|js|jsx)?/gi,'').replace(/```/g,'').trim();
  const bi = code.indexOf('function build');
  if (bi >= 0){
    code = code.slice(bi);
    const s = code.indexOf('{');
    if (s >= 0){ let depth=0, end=-1;
      for(let i=s;i<code.length;i++){ const c=code[i]; if(c==='{')depth++; else if(c==='}'){ depth--; if(depth===0){ end=i; break; } } }
      if (end>0) code = code.slice(0, end+1);
    }
  }
  return code;
}
function buildVehicleFromCode_v1(code){
  try{
    if(!code || typeof code!=='string') return { group:null, err:'empty' };
    const g=new Group();
    const fn=new Function('g','VG','THREE','Math', code + '\n; if(typeof build==="function"){ build(g,VG,THREE); }');
    fn(g, VG, THREE, Math);
    return { group: g.children.length ? g : null, err: g.children.length? '' : 'no meshes' };
  }catch(e){ return { group:null, err:(e&&e.message)||String(e) }; }
}

// ── PROPOSED implementation: imported from the SHIPPED module (no divergent copy) ──
import { createRequire } from 'node:module';
const FORGE = createRequire(import.meta.url)('./forge-reference.js');
// ── ADVERSARIAL CORPUS (realistic model replies) ─────────────────────────────
const CORPUS = {
  A_clean_fenced: {
    expectV2: true,
    reply: 'Here is your model:\n```javascript\nfunction build(g,VG,THREE){\n  const body=VG.box(2,0.8,4,VG.paint(0xff2e2e));\n  body.position.set(0,0.9,0); g.add(body);\n  for(let i=0;i<4;i++){ const w=VG.wheel(0.5,0.34); w.position.set(i<2?-1:1,0.5,i%2?1.4:-1.4); g.add(w);}\n}\n```\nEnjoy!' },
  B_brace_in_string: {
    expectV2: true, // the field bug: `}` inside a string fools the brace counter
    reply: 'function build(g,VG,THREE){\n  const decal="}";\n  const hull=VG.box(2,1,4,VG.paint(0x3b82f6));\n  hull.position.set(0,0.8,0); hull.userData={decal};\n  g.add(hull);\n  const fin=VG.box(0.2,1,1,VG.metal(0x9aa3b0)); fin.position.set(0,1.6,-1.8); g.add(fin);\n}' },
  C_comment_braces_and_prose: {
    expectV2: true,
    reply: 'function build(g,VG,THREE){\n  // tail } fin\n  const t=VG.box(1,0.2,2,VG.matte(0x8a5a2b)); /* flat } paddle */\n  t.position.set(0,0.3,-2); g.add(t);\n  const body=VG.sphere(1,VG.paint(0x8a5a2b)); body.position.set(0,1,0); g.add(body);\n}\nThis beaver has a flat tail and rounded body.' },
  D_arrow_assignment: {
    expectV2: true,
    reply: 'Sure. Here is the build function:\n\nconst build = (g, VG, THREE) => {\n  const cab = VG.box(1.6,1.2,2, VG.paint(0xffd23f));\n  cab.position.set(0,1.1,0.4); g.add(cab);\n  const bed = VG.box(1.8,0.5,2, VG.matte(0x111111)); bed.position.set(0,0.6,-1.4); g.add(bed);\n};\n\nLet me know if you want changes.' },
  E_trailing_prose_plain: {
    expectV2: true,
    reply: 'function build(g,VG,THREE){\n  const m=VG.cyl(0.6,0.6,2,VG.metal(0x60686f)); m.position.set(0,1,0); g.add(m);\n}\nThe cylinder forms the boiler of the little engine.' },
  F_truncated: {
    expectV2: false, // must FAIL with a precise truncation diagnostic
    reply: 'function build(g,VG,THREE){\n  const a=VG.box(1,1,1,VG.paint(0x19e6c8)); a.position.set(0,0.5,0); g.add(a);\n  const b=VG.box(1,1,1,VG.paint(' },
  G_template_literal: {
    expectV2: true,
    reply: 'function build(g,VG,THREE){\n  const tag = `rig-${1+1}`;\n  const m=VG.box(1,1,3,VG.paint(0xa855f7)); m.userData={tag}; m.position.set(0,0.5,0); g.add(m);\n  const s=VG.sphere(0.4,VG.glass(0x223040,0.4)); s.position.set(0,1.3,1); g.add(s);\n}' },
  H_helper_before_build: {
    expectV2: true, // current slicer drops the helper → ReferenceError at runtime
    reply: '```js\nfunction leg(VG,x){ const l=VG.cyl(0.15,0.12,0.8,VG.matte(0x8a5a2b)); l.position.set(x,0.4,0); return l; }\nfunction build(g,VG,THREE){\n  g.add(leg(VG,-0.5)); g.add(leg(VG,0.5));\n  const torso=VG.sphere(0.8,VG.paint(0x8a5a2b)); torso.position.set(0,1.2,0); g.add(torso);\n}\n```' },
  J_peer_escape_probe: {
    expectV2: false, // malicious peer vcode: must FAIL SAFE (localStorage unreachable)
    reply: 'function build(g,VG,THREE){\n  const key = localStorage.getItem("trig.ai.config.v2");\n  const m=VG.box(1,1,1,VG.paint(0xffffff)); m.userData={key}; g.add(m);\n}' },
};

// ── RUN ──────────────────────────────────────────────────────────────────────
const rows=[];
let v2pass=0, v2total=0;
for(const [name,{reply,expectV2}] of Object.entries(CORPUS)){
  const v1code = extractBuildFn_v1(reply);
  const v1 = buildVehicleFromCode_v1(v1code);
  const v2 = FORGE.compile(reply, {THREE, VG});
  const v1ok = !!v1.group;
  const v2ok = !!v2.ok;
  const v2expected = (v2ok===expectV2);
  v2total++; if(v2expected) v2pass++;
  rows.push({ case:name,
    v1: v1ok?`OK (${countMeshes(v1.group)} meshes)`:`FAIL: ${String(v1.err).slice(0,48)}`,
    v2: v2ok?`OK via ${v2.strategy} (${v2.cert.meshes} meshes, ${v2.cert.ms}ms)`
            :`FAIL[${v2.stage}]${v2.diagnostic?.truncated?' truncated':''}: ${String(v2.attempts?.[0]?.err||v2.err||'').slice(0,44)}`,
    verdict: v2expected?'✓ as spec\'d':'✗ SPEC VIOLATION' });
}
console.log('\nFORGE CONFORMANCE — current (v1) vs proposed (v2)\n' + '─'.repeat(96));
for(const r of rows) console.log(r.case.padEnd(26), '| v1:', r.v1.padEnd(34), '| v2:', r.v2.padEnd(44), '|', r.verdict);
console.log('─'.repeat(96));
console.log(`v2 conformance: ${v2pass}/${v2total} cases behave exactly as the spec requires`);
// Extra assertions for F and J semantics
const F = FORGE.compile(CORPUS.F_truncated.reply, {THREE, VG});
console.log('\n[F] diagnostic:', JSON.stringify(F.diagnostic));
const J = FORGE.compile(CORPUS.J_peer_escape_probe.reply, {THREE, VG});
console.log('[J] attempts:', JSON.stringify(J.attempts?.map(a=>({s:a.strategy,err:a.err}))));
if(!F.diagnostic?.truncated) { console.error('F must report truncation'); process.exit(1); }
if(J.ok) { console.error('J must fail safe'); process.exit(1); }
if(v2pass!==v2total) process.exit(1);
console.log('\nALL SPEC REQUIREMENTS HOLD.');
