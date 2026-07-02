// BEAR RECEIPT — the model reply Watson pasted, replayed through the shipped Forge.
// Proves: the code was always good; the old children.length>=3 gate was the liar.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const FORGE = require('./forge-reference.js');

class Vec3 { constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} copy(v){return this.set(v.x,v.y,v.z);}
  clone(){return new Vec3(this.x,this.y,this.z);} add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;}
  sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;} multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
  length(){return Math.hypot(this.x,this.y,this.z);} normalize(){const l=this.length()||1;return this.multiplyScalar(1/l);} }
class Obj3D { constructor(){this.children=[];this.position=new Vec3();this.rotation=new Vec3();
  this.scale=new Vec3(1,1,1);this.userData={};this.visible=true;this.quaternion={setFromUnitVectors(){}};}
  add(...o){o.forEach(c=>this.children.push(c));return this;} }
class Group extends Obj3D {}
class Mesh extends Obj3D { constructor(){super();this.isMesh=true;} }
const THREE = { Group, Vector3: Vec3 };
const mesh = () => new Mesh(); const mat = () => ({});
const groupOf = (n) => { const g=new Group(); for(let i=0;i<n;i++) g.add(mesh()); return g; };
const VG = {
  C: new Proxy({}, { get: () => 0xabcdef }),
  paint:mat, matte:mat, metalMat:mat, goldMat:mat, emiss:mat, makeGlass:mat, GLASS_BLUE:mat,
  box:mesh, cyl:mesh, cone:mesh, sphere:mesh, ico:mesh, torus:mesh,
  eye:()=>groupOf(2), glow:()=>new Obj3D(),
  jaggedBolt:(l,s)=>{const g=groupOf(s||5);g.add(new Obj3D());g.userData.strike=()=>{};return g;},
  knobbyWheel:()=>groupOf(10), slickWheel:()=>groupOf(2),
  decalPlane:mesh, boltDecal:mesh, numDecal:mesh, runeDecal:mesh, tomoeDecal:mesh, greekKey:mesh,
  contactShadow:mesh,
  figure:()=>{const g=groupOf(2);g.userData.head=g.children[1];const L=groupOf(2),R=groupOf(2);
    g.add(L,R);g.userData.armL=L;g.userData.armR=R;return g;},
  tickBolts:()=>{},
};

const { code } = JSON.parse(readFileSync(new URL('./bear.json', import.meta.url), 'utf8'));
const r = FORGE.compile(code, { THREE, VG, maxMeshes: 220 });
if (!r.ok) { console.log('FORGE FAILED (unexpected):', JSON.stringify(r.attempts, null, 1)); process.exit(1); }

const topChildren = r.group.children.length;               // what the OLD gate looked at
const oldGate = topChildren >= 3;
const newGate = r.cert.meshes >= 6;
const tickOk  = typeof r.group.userData.tick === 'function';

console.log('\nBEAR RECEIPT — the reply the game threw away, replayed verbatim');
console.log('─'.repeat(66));
console.log('forge          ', r.ok ? 'OK' : 'FAIL', '· strategy', r.strategy, '· hash', r.cert.hash);
console.log('certificate    ', r.cert.meshes, 'meshes ·', r.cert.tris, 'tris ·', r.cert.ms + 'ms');
console.log('living contract', tickOk ? 'userData.tick present (bob, gait, tail wag)' : 'MISSING');
console.log('top-level kids ', topChildren, ' (wrapper adds ONE group — by design)');
console.log('OLD gate  children.length>=3 →', oldGate ? 'pass' : 'REJECT   ← the bug: threw the bear away');
console.log('NEW gate  cert.meshes>=6     →', newGate ? 'ACCEPT' : 'reject');
console.log('─'.repeat(66));
if (!(r.ok && tickOk && !oldGate && newGate)) process.exit(1);
console.log('VERDICT: the model made real code both times. The gate lied. Fixed.');
