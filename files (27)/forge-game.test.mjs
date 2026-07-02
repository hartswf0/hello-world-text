// GAME-FORGE CONFORMANCE — whole games through the shipped pipeline, headless.
// Proves: language-shaped mode source → compileEntry → validated mode object →
// enter/tick against GG → rules fire (zones, schedule, countdown, score, win).
// Run: node forge-game.test.mjs
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const FORGE = require('./forge-reference.js');
const { makeGG, validateMode } = require('./thunder-gg.js');
const { GAMES, pick } = require('./thunder-golden-games.js');

// ── headless host ────────────────────────────────────────────────────────────
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function makeHost(seed=7){
  const rec = { banners:[], huds:[], sparks:0, flashes:[], labels:{}, win:null, structures:0, removedStructures:0 };
  let droneSeq = 0;
  const drones = new Map();
  const player = { pos:{x:0,y:0,z:0}, vel:{x:0,z:0}, yaw:0,
    speed:()=>8, boost(){}, stuns:0, stun(s){ player.stuns++; } };
  const host = {
    arena:{HW:40,HL:40},
    addStructure(d){ rec.structures++;
      return { id:'s'+rec.structures, dims:d, remove(){ rec.removedStructures++; } }; },
    addRing(){ return { remove(){} }; },
    addZoneVisual(){ return { setActive(){}, remove(){} }; },
    spawnDroneBody(o){ const id='d'+(++droneSeq);
      const b={ id, pos:{x:o.x||0,y:0,z:o.z||0}, vel:{x:0,z:0}, yaw:0,
        drive(dx,dz,thrust){ const l=Math.hypot(dx,dz)||1; b.vel.x=dx/l*8*(thrust??1); b.vel.z=dz/l*8*(thrust??1); },
        remove(){ drones.delete(id); } };
      drones.set(id,b); return b; },
    ballBody(){ return null; },
    player,
    input(){ return {x:0,y:0,boost:false,fire:false,jump:false}; },
    fx:{ spark(){rec.sparks++;}, shake(){}, flash(h){rec.flashes.push(h);},
      banner(t){rec.banners.push(t);}, hud(a,b){rec.huds.push([a,b]);}, label(id,t){rec.labels[id]=t;} },
    onWin(t){ rec.win=t; },
    rand: mulberry32(seed),
    __drones: drones, __rec: rec,
  };
  return host;
}
function stepWorld(host, GG, mode, dt, seconds, playerScript){
  const n = Math.round(seconds/dt);
  for(let i=0;i<n;i++){
    const t=i*dt;
    if(playerScript) playerScript(t, host.player);
    for(const b of host.__drones.values()){ b.pos.x+=b.vel.x*dt; b.pos.z+=b.vel.z*dt; }
    GG.__update(dt);
    try{ mode.tick(dt,t); }catch(e){ throw new Error('tick threw: '+e.message); }
    if(host.__rec.win) break;
  }
}
function compileMode(source){
  const host=makeHost(); const GG=makeGG(host);
  const r=FORGE.compileEntry(source,{ entry:'mode', argNames:['GG','THREE'], args:[GG,{}],
    validate:validateMode, budgetMs:250 });
  return { host, GG, r };
}

let pass=0, total=0; const say=(ok,name,detail)=>{ total++; if(ok)pass++;
  console.log((ok?'✓':'✗').padEnd(2), name.padEnd(34), detail||''); };

console.log('\nGAME-FORGE CONFORMANCE — whole games, headless, through the shipped Forge\n'+'─'.repeat(84));

// ── 1 · SUMO: rules machinery end-to-end ────────────────────────────────────
{
  const {host,GG,r}=compileMode(GAMES.sumo.code);
  say(r.ok && r.strategy==='whole' && r.value.id==='sumo', 'sumo · compileEntry S1', r.ok?`hash ${r.cert.hash} · ${r.cert.ms}ms`:JSON.stringify(r.attempts));
  r.value.enter();
  say(host.__drones.size===3 && host.__rec.structures>=1, 'sumo · enter spawns arena+rivals', `drones ${host.__drones.size}`);
  // player stands at the edge-outside: rivals chase across the ring line; referee (every .5s) scores
  stepWorld(host,GG,r.value,1/60,12,(t,p)=>{ p.pos.x=19; p.pos.z=0; });
  const s=GG.scores();
  say(!!host.__rec.win, 'sumo · a win condition fired', JSON.stringify({win:host.__rec.win, scores:s}));
  say((s.YOU||0)+(s.RIVALS||0)>=3, 'sumo · scoring accumulated via GG.score', '');
  say(host.__rec.sparks>0 || host.player.stuns>0, 'sumo · feel verbs fired (spark/stun)', `sparks ${host.__rec.sparks} stuns ${host.player.stuns}`);
  r.value.exit();
}

// ── 2 · VOLT: once-zones (player-only), countdown, victory ──────────────────
{
  const {host,GG,r}=compileMode(GAMES.volt.code);
  say(r.ok && r.value.id==='volt', 'volt · compileEntry S1', r.ok?'':JSON.stringify(r.attempts));
  r.value.enter();
  const pylon=(i)=>{ const a=i/7*Math.PI*2+0.35, rr=8+(i%3)*7; return {x:Math.cos(a)*rr, z:Math.sin(a)*rr}; };
  // interceptors may cross pylons first — zones must SURVIVE them (return-false contract)
  stepWorld(host,GG,r.value,1/60,2,(t,p)=>{ p.pos.x=-35; p.pos.z=-35; });   // player far away; drones roam
  const preScore=GG.scores().VOLTS||0;
  say(preScore===0, 'volt · drones cannot consume pylons', `VOLTS ${preScore}`);
  let k=0;
  stepWorld(host,GG,r.value,1/60,14,(t,p)=>{ const tgt=pylon(Math.min(6,k));
    p.pos.x=tgt.x; p.pos.z=tgt.z; if((GG.scores().VOLTS||0)>k) k++; });
  say(host.__rec.win && /GRID RESTORED/.test(host.__rec.win), 'volt · harvest victory', host.__rec.win||'(no win)');
  say((GG.scores().VOLTS||0)>=7 && host.__rec.removedStructures>=7, 'volt · zones consumed by player only', `removed ${host.__rec.removedStructures}`);
  r.value.exit();
}

// ── 3 · VOLT: countdown → honest defeat ─────────────────────────────────────
{
  const {host,GG,r}=compileMode(GAMES.volt.code);
  r.value.enter();
  stepWorld(host,GG,r.value,1/30,62,(t,p)=>{ p.pos.x=-35; p.pos.z=-35; });
  say(!!host.__rec.win && /BLACKOUT/.test(host.__rec.win), 'volt · countdown defeat path', host.__rec.win||'(no win)');
  r.value.exit();
}

// ── 4 · adversarial: prose+fences wrapper (a realistic model reply) ─────────
{
  const wrapped='Here is your game:\n```javascript\n'+GAMES.sumo.code+'\n```\nHave fun!';
  const {r}=compileMode(wrapped);
  say(r.ok && r.strategy==='whole', 'adversarial · fenced+prose reply', r.ok?'sanitize extracted fences':JSON.stringify(r.attempts&&r.attempts[0]));
}

// ── 5 · adversarial: truncated → precise diagnostic ─────────────────────────
{
  const {r}=compileMode(GAMES.volt.code.slice(0, GAMES.volt.code.length-400));
  say(!r.ok && r.diagnostic && r.diagnostic.truncated, 'adversarial · truncation named', r.diagnostic?`{×${r.diagnostic.braceBalance}`:'');
}

// ── 6 · escape probe inside a mode → fail safe ──────────────────────────────
{
  const evil='function mode(GG,THREE){ const k=localStorage.getItem("trig.ai.config.v2"); return {id:"x",enter(){},tick(){}}; }';
  const {r}=compileMode(evil);
  say(!r.ok && r.attempts.some(a=>/localStorage|undefined/.test(a.err||'')), 'security · peer mode cannot reach storage', r.attempts&&r.attempts[0]&&r.attempts[0].err);
}

// ── 7 · contract: non-mode return rejected by validation ────────────────────
{
  const {r}=compileMode('function mode(GG,THREE){ return 42; }');
  say(!r.ok && r.attempts.some(a=>a.stage==='validate'), 'contract · validateMode rejects non-modes', '');
}

// ── 8 · keyword routing sanity ──────────────────────────────────────────────
{
  const a=pick('a sumo ring where you shove rivals out').id, b=pick('collect the glowing pylons before the timer').id;
  say(a==='sumo'&&b==='volt', 'library · pick() routes sensibly', a+' / '+b);
}

console.log('─'.repeat(84));
console.log(`game-forge: ${pass}/${total}`);
if(pass!==total) process.exit(1);
console.log('\nTHE GAME GATE HOLDS.');
