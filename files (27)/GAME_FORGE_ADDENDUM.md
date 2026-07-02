# GAME FORGE — ADDENDUM TO ENGINE SPEC v2

> *"we built this with fable 5 … we want to build them inside the engine — see the difference?"*
> Yes. This addendum names it, then operationalizes it.

## §A0 · The difference, named

The rig Forge was **language → noun**: a prompt becomes a thing that sits in the world.
The goal is **language → form of life**: a prompt becomes verbs, stakes, pressure,
resistance, a win — a *game*. THUNDER RIGS itself was authored that way, in
conversation with a model, from the outside. The Game Forge interiorizes that
relation: the same authorship becomes a runtime organ of the artifact. The engine
stops being a product of the conversation and becomes a place where the
conversation happens.

This is the operative-description thesis carried to its conclusion: in the rig
Forge, text describes geometry; in the Game Forge, text legislates a world —
meaning as use, with the engine as the use.

## §A1 · The critique, accepted

*"Many of the controls around the generation are token and contribute nothing to
real design."* Correct, and now structural. Audit of the gateway's controls:

| Control | Verdict |
|---|---|
| JSON schemas for `world` / `arena` / `bot_fort` / `rig_spec` / `parts` | **Token.** They admit only pre-conceived nouns (6 structure kinds, 6 part types). A model cannot *design* through them — it can only fill in a form someone already designed. The game clamps everything anyway (their own invariant 5), so the schemas prevent nothing important and prevent everything interesting. **Marked LEGACY**: a forged game authors its world *through code* via GG. Keep for compatibility until M3, then retire. |
| Moderation gate, origin policy, rate limit, server-held key | Transport hygiene. Fine. Not design controls; keep. |
| Model routing table | Convenience. One line per task. Keep. |
| **Sandbox** (Tier-1 shadow now, M4 Worker isolation) | **Real.** It's what lets untrusted code be *code*. |
| **Budget + certificate** (named ceilings, time budget, fnv1a hash, provenance strip) | **Real.** It's what makes generativity governable without pre-conceiving its output. |
| **Conformance corpus** (adversarial 9/9 · golden rigs 9/9 · golden games 15/15) | **Real.** It's the only control that *raises quality*: goldens are simultaneously the fallback floor, the few-shot curriculum, and the regression gate. |

Three controls contribute to real design. Everything else is plumbing. The
architecture now says so out loud.

## §A2 · FORGE v2.1 — the entry symbol is a parameter

`FORGE.compile(reply, {THREE, VG})` remains byte-compatible (rigs; mesh-counted cert).
New, non-breaking:

```
FORGE.compileEntry(reply, {
  entry: 'mode',                    // the symbol the reply must define
  argNames: ['GG','THREE'],         // its parameters…
  args: [GG, THREE],                // …and what they're bound to
  validate: GGKIT.validateMode,     // shape gate on the returned value
  budgetMs: 400,                    // post-hoc time budget
}) → { ok, value, cert:{ms,hash,chars}, strategy, code } | { ok:false, attempts, diagnostic }
```

Same pipeline (SANITIZE → S1 WHOLE → S2 FN-SLICE → S3 ASSIGN), same shadowed
Tier-1 sandbox, same structured `repairPrompt` diagnostics. `build` mints rigs;
`mode` mints games; the next literal costs one word.

## §A3 · GG — what VG is to rigs, GG is to games

The model designs by **writing rules**, not filling forms:

- **world**: `structure({x,z,w,h,d,y?,c?})` collidable · `ring(x,z,r,c)` · `clearWorld()` · `arena{HW,HL}`
- **actors**: `player{pos,vel,yaw,speed(),boost(s),stun(s)}` · `spawnDrone({x,z,hue,rig,brain(self,GG,dt)})` → `{pos,vel,drive(dx,dz,thrust),label,remove}` · `drones()`
- **rules**: `zone({x,z,r,once?,onEnter(who)→false declines consumption,onLeave?})` · `score(k,±n)` · `countdown(s,onExpire)` · `after/every(s,cb)` · `win(text)`
- **senses**: `dist` · `near(pos,r,kind)` · seeded `rand()/pick()` · `input()`
- **feel**: `spark · shake · flash · banner · hud`

Ceilings: drones ≤12 · zones ≤16 · schedules ≤32 · structures ≤48. Brains and
callbacks are individually quarantined. One core, two hosts: the playable
artifact injects the real host; the conformance test injects a headless one and
proves whole games in Node.

**Mode contract** (what the model writes):

```
function mode(GG, THREE){
  return { id, label, enter(), tick(dt,t), exit() };
}
```

Factory pure; world-building in `enter`; a **fresh GG per instantiation**; the
per-mode PRNG is seeded from the code's fnv1a hash — a forged game is
deterministic under its own certificate. Runtime: 3 tick-strikes → quarantine →
lobby, banner `SYS·MODE DOWN`. Never silent.

## §A4 · Deltas shipped in this package

- **forge-reference.js v2.1** — `compileEntry`; both prior suites still green.
- **thunder-gg.js / thunder-golden-games.js / forge-game.test.mjs** — GG core, two
  golden games (THUNDER SUMO, VOLT HARVEST), 15/15 headless: enter/tick, brains,
  once-zones surviving non-player contact, countdown win *and* loss, fenced+prose
  replies, truncation named, storage escape fail-safe, non-mode returns rejected.
- **THUNDER_FORGE.html** — the playable single-file: drive a golden rig, tap a
  golden game, or type one; provider `thunder` (gateway task `mode`) or dev
  browser-key modes; provenance strip; forensics + copy; `__switchGame(code)`.
- **thunder-ai-worker.js** — `+ mode` route (one line, per your own change-test);
  test extended and green. Schemaless: the client Forge is the validator.
- **hello-world-004-openai.html** — the missing legs spliced in: FORGE→v2.1,
  GOLDEN library, VG v1.1 merged over legacy aliases (`metal/wheel/headlight/glass`
  preserved), few-shot golden sys, double-failure → `LIBRARY · NAME` honest
  fallback, `window.__goldenCheck()`. The glass fresnel carries the GLSL fix
  (`#include` directives on their own lines) — the shader-error storm is closed.

## §A5 · Milestones (amended)

M0 rig-forge splice ✅ → **M2.5 GAME FORGE (this package: proven headless + playable bench)** →
M3 splice Game Forge into 004 as the MODES organ; retire legacy schema routes →
M4 Worker sandbox (the real security boundary) → M5 net-sync forged modes by
`{code, cert.hash}` → M6 the garage teaches game-authoring the way it teaches rigs.

## §A6 · Verification ledger

Proven here, in Node: everything above. Only your device can confirm: the
deployed Worker with a real key and real model IDs behind `ROUTES`; the rendered
look of the fixed glass; forged games under real latency; and multiplayer.
Boot-time in-page gates (`__goldenCheck`, `__goldenGameCheck`) exist so the
artifact re-proves its own pipeline before any model is involved.
