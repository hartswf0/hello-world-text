# THUNDER RIGS ENGINE — SPECIFICATION v2.0
### codename THUNDERHEAD · the runtime under THUNDER RIGS / VALLEY RUN
##### supersedes: `THUNDER_RIGS_ENGINE_SPEC.md` (v1, "Engine Spec & Handoff") · applies to: `hello-world-003.html` (8,275 lines) and all descendants

> v1 was a **handoff** — a map of one file in one broken state. v2 is a **constitution** — the invariant architecture any build of this engine must satisfy, plus the migration path from the file that exists to the engine this file wants to be. The keystone subsystem (§5, the Forge) is not proposed here; it is **proven** — `forge-conformance.test.mjs` runs 9 adversarial cases of real model output against both the current extractor and the new pipeline. Current: 4/9 hard failures, including the exact field error `Unexpected token ')'`. New: 9/9 spec-conformant, including fail-safe on malicious peer code and precision diagnostics on truncation.

**Read order.** §0 thesis · §1 architecture map · §5 Forge (the active bug's grave) · §12 migration (what to do first). Everything else is reference.

---

## 0 · THESIS — what "a real game engine" means here

Every engine is organized around its asset pipeline. Unreal is organized around imported art; Roblox around a parts catalog; BEFLIX around a mosaic of programmed cells. **THUNDER RIGS is organized around language.** A player describes a form of life; a language model writes build code; the engine compiles, certifies, and instantiates that code as a drivable body in a shared physical arena. The sentence is the asset. The LLM is the content pipeline. The compiler is the engine's heart.

This forces the three commitments that structure everything below:

1. **Untrusted source is the native asset format.** Model output — and, over the network, *other people's* model output — is source code. A real engine treats source with a real compiler: staged, diagnosable, budgeted, certified, conformance-tested, never silently fallen back from. (§5)
2. **One document, one codec.** Everything a player authors lives in a versioned document (`RigDoc`, `WorldDoc`) with exactly one parse/validate/migrate/encode surface. The v1 disease — `normalizeSpec` drops keys, so five call sites hand-re-attach `rp`/`vcode`, and forgetting once desyncs the world (v1's "#1 place bugs hide") — is not patched; it is made **impossible by construction**. (§4)
3. **The frame is a schedule, not a function.** v1's `frame()` is a 250-line god-loop: animation, input, five physics substeps, bots, three game modes, lasers, wrecks, commander, sync, render — one exception anywhere kills everything. A real engine runs registered systems on a fixed-timestep schedule with per-system quarantine and named ceilings. (§3)

Everything else — netcode, editor, export — is these three commitments applied at a boundary.

**What does not change.** The studio doctrine is load-bearing and survives intact: **one self-contained HTML file**, no build step, CDN Three.js `0.160.0` via importmap, IBM Plex Mono, absolute black/white plus named accents (`teal #19e6c8` · `amber #ffd23f` · `red #ff2e2e` · `blue #3b82f6`), no border-radius on rectangular containers, no emoji glyphs in UI (vector/CSS marks only), mobile-first, Power-of-10 named loop ceilings, theory-before-code, Node parse + VM sandbox validation before any delivery. "Single file" is not the opposite of "engine." The file becomes the **build artifact of this spec**: internally modular, externally one thing you open.

---

## 1 · ARCHITECTURE AT A GLANCE

```
┌────────────────────────────────────────────────────────────────────┐
│  SHELL      screens · body-class state machine · input · HUD      │
│  ┌──────────┐ ┌──────────┐ ┌───────────────┐ ┌──────────────────┐ │
│  │ GARAGE   │ │  MODES   │ │     AGENT     │ │      PORT        │ │
│  │ editor   │ │ golf/ctf │ │ bots/commander│ │ glb + sidecar    │ │
│  │ as ops   │ │ targets… │ │ (authority-   │ │ export/import    │ │
│  └────┬─────┘ └────┬─────┘ │  gated)       │ └────────┬─────────┘ │
│       │            │       └───────┬───────┘          │           │
│  ┌────▼────────────▼───────────────▼───────────────── ▼─────────┐ │
│  │ SIM   fixed-step physics · colliders · ball · damage         │ │
│  └────┬──────────────────────────────────────────────┬──────────┘ │
│  ┌────▼──────────────┐   ┌───────────────────────────▼──────────┐ │
│  │ FORGE             │   │ NET   transport · authority ·        │ │
│  │ language→geometry │   │       doc-sync · presence            │ │
│  │ compiler (§5)     │   └───────────────────┬──────────────────┘ │
│  └────┬──────────────┘                       │                    │
│  ┌────▼───────────────────────────────────── ▼──────────────────┐ │
│  │ DOC   RigDoc/WorldDoc · codec · store · hash · overlay       │ │
│  └───────────────────────────┬───────────────────────────────── ┘ │
│  ┌───────────────────────────▼───────────────────────────────── ┐ │
│  │ KERNEL   clock · scheduler · system registry · quarantine    │ │
│  └────────────────────────────────────────────────────────────── ┘│
└────────────────────────────────────────────────────────────────────┘
```

Ten modules. Arrows point at dependencies; **dependencies flow down only.** DOC knows nothing of NET; FORGE knows nothing of GARAGE; nothing knows SHELL. The v1 file violates this everywhere (the ritual IIFE reaches into physics; export reaches into the ring; sync reaches into the builder through `window.__rig`). The migration (§12) is the act of restoring this diagram.

**Single-file assembly rule.** Each module is one IIFE registered on a tiny root object, in dependency order, inside the one `<script type="module">`:

```js
const ENGINE = { reg(name, mod){ this[name]=Object.freeze(mod); }, sys:[] };
/* ═══ @module KERNEL v2.0 · contract: §3 · deps: none ═══ */
ENGINE.reg('KERNEL', (()=>{ /* … */ return { clock, schedule, quarantine }; })());
/* ═══ @module DOC v2.0 · contract: §4 · deps: KERNEL ═══ */
ENGINE.reg('DOC', (()=>{ /* … */ })());
```

The `@module` banner carries name, version, contract section, and declared deps. This is what makes the single file *maintainable by a language model*: an LLM session regenerates **one module against its contract section**, never the whole file blind. The banner is the seam. A module's public surface is frozen; everything else inside it is private and may be rewritten freely if the surface and its conformance tests hold.

---

## 2 · THE GAME (unchanged charter, one paragraph)

The hidden game is **authorship under physics plus other people**: speak/shape a machine (`HELLO`) and a place (`WORLD`), then the shared arena resists your authorship — collisions, gravity, a ball, bot pressure, rivals. Primary verbs: **Describe · Shape · Drive · Strike · Direct · Export**. Core loop: see → predict → choose → commit → resolve → reveal → adapt → escalate. The screen transforms state; it never scrolls. Stakes: *other players see and collide with what you make.* (v1 Part II remains the canonical long form; nothing in v2 alters the game's charter — v2 alters what carries it.)

---

## 3 · KERNEL — clock, scheduler, quarantine

**Contract.**

```js
KERNEL = {
  clock: { now, simTime, frame, dtFixed: 1/60 },
  register(sys: { name, phase, tick(ctx), ceiling? }): void,
  start(): void,                    // owns the single requestAnimationFrame chain
  quarantined(): string[],          // systems currently benched, for HUD surfacing
}
```

**Fixed timestep.** One accumulator drives simulation at `dtFixed = 1/60`. Render runs at rAF rate; simulation consumes the accumulator in whole steps, `MAX_SUBSTEPS = 5` (named ceiling). If the accumulator exceeds `PANIC_S = 0.25` — the hidden-tab return, v1's most-misdiagnosed "bug" — the kernel **discards** the excess, emits `clock.panic`, and resumes cleanly instead of spiraling through catch-up physics. The v1 behavior (`dt` clamped to 0.1, everything else runs on wall-time deltas) makes bot cadence, interpolation, and golf timing all frame-rate-dependent; the fixed step removes that class.

**Phases, in order, every frame:**

| phase | runs | rate |
|---|---|---|
| `INPUT` | poll joystick/keys/pointer into an input snapshot | per frame |
| `FIXED` | SIM substeps ×N (physics, collisions, ball) | dtFixed × N |
| `THINK` | AGENT (bots, commander), MODES tick | per frame |
| `SYNC` | NET send/receive windows | throttled |
| `EDIT` | GARAGE live-preview writebacks | per frame, in-ritual only |
| `FX` | sparks, wrecks, camera, animation overlays | per frame |
| `RENDER` | one `renderer.render` | per frame |

**Quarantine.** Every system tick runs inside its own try/catch. A system that throws `QUARANTINE_STRIKES = 3` times in `10 s` is benched: removed from the schedule, named in the HUD (`SYS·AGENT DOWN`), retried after `30 s`. One broken game mode no longer freezes driving, rendering, and the room — v1's single `try` around the whole frame body means any uncaught throw beneath it kills the entire heartbeat.

**Ceilings (Power-of-10, all named, all enforced at the site of growth):**

`MAX_SUBSTEPS 5 · BOT_MAX 6 · LASER_MAX 24 · SPARK_MAX 400 · STRUCT_MAX 70 · PARTS_MAX 96 · MESH_MAX 220 · WRECK_MAX 12 · CHAT_LINES 120 · ROOM_PEERS 8 · DOC_BYTES 65536 · FORGE_RETRIES 1 · SCHED_SYSTEMS 24`

---

## 4 · DOC — the data spine

**The rule that retires v1's worst bug class:** documents cross every boundary — persistence, network, editor, compiler — **only** through the codec. No function anywhere else constructs, normalizes, or "fixes up" a doc. There is nothing to re-attach because nothing is ever dropped: the codec either accepts a field (validating and clamping it) or **rejects the document with a named error**. Silence is forbidden.

### 4.1 RigDoc v2

```js
RigDoc = {
  v: 2,
  id: string,                       // stable per-rig identity (nanoid-8)
  name: string,                     // ≤24 chars, uppercased
  envelope: { L: num, W: num, H: num },        // clamps: L∈[3.8,6.0] W∈[2.0,3.6] H∈[1.6,3.4]
  palette: { color: hex, accent: hex },
  source:                            // EXACTLY ONE — the visual's provenance
    | { kind:'code',  code: string }                    // Forge-certified build code
    | { kind:'parts', parts: Part[] }                   // freeform ring parts (v1 `rp`)
    | { kind:'slots', slots: {theme,body,spoiler,topper,front,side,rear,face} }, // procedural
  overlay: { [meshPath: string]: Delta },      // §4.3 — persisted edits atop 'code' builds
  cert?: { meshes:int, tris:int, ms:int, hash:hex8 },   // Forge-issued, code kind only
}
Part  = { k, x,y,z, sx,sy,sz, c, rx?,ry?,rz?, an? }     // unchanged wire shape from v1 `rp`
Delta = { p?:[x,y,z], r?:[x,y,z], s?:[x,y,z], c?:hex, an?:{type,axis,speed,range} }
```

v1's implicit priority chain (`vcode` → `rp` → procedural, three nullable fields on one object) becomes an **explicit tagged union**. `buildCar` stops probing and switches on `source.kind`. There is no state in which a rig has two visual sources or zero.

### 4.2 WorldDoc v1

```js
WorldDoc = {
  v: 1,
  id: string,
  mode: 'dark'|'light'|'water'|'grass',
  palette?: { sky?, floor?, fog? },
  structures: Structure[],           // ≤ STRUCT_MAX; each SOLID (registers a collider)
  scenery:    Prop[],                // decorative only, never colliders
}
Structure = { kind, x, z, w, h, d, rot?, c? }
```

Worlds get a document **identical in citizenship to rigs**. v1's F4 ("worlds still don't sync") is not a missing feature; it is the symptom of worlds having no document. Give them one and §7's doc-sync carries them with zero world-specific network code.

### 4.3 Overlay — persistent edits on code-built meshes

v1 change-scenario B, decided. When the source is `code`, the built group's tree is **deterministic** (same code → same children order). Each mesh gets a `meshPath` = child-index path from the root (`"0"`, `"3/1"`). Gizmo drags, paints, and per-part chat edits on a code-built rig write `Delta`s into `overlay[meshPath]` instead of mutating transient meshes. After every Forge build, `DOC.applyOverlay(group, doc)` replays the deltas. Overlay entries are valid **only against the cert hash that minted them**: if `doc.source.code` changes, `cert.hash` changes, and stale overlay entries are dropped with a `notify('EDITS CLEARED — MODEL RECODED')`. Trade taken: code compactness *and* edit fidelity, with honest invalidation instead of silent drift. Overlay rides inside the doc, so it persists and syncs for free.

### 4.4 Codec contract

```js
DOC = {
  parse(json)   -> { ok:true, doc } | { ok:false, err:{ code, path, msg } },   // strict; unknown top-level keys REJECT
  migrate(any)  -> RigDoc|WorldDoc,   // v1 loadout {color,…,rp,vcode} → v2 tagged union; total, never throws
  encode(doc)   -> json,              // canonical: sorted keys, rounded floats (pos 3dp, quat 4dp)
  hash(doc)     -> hex8,              // FNV-1a over canonical encode — identity for sync & equality
  equal(a,b)    -> hash(a)===hash(b), // retires v1 rigsEqual's stringify-compare
  store: { saveRig(doc), loadRig(), saveWorld(doc), loadWorld() },  // sole owner of localStorage keys
}
```

Storage keys: `trig.rig.v2` · `trig.world.v2` · `trig.ai.config.v2` (unchanged) · legacy `trig.loadout.v1` read once by `migrate` then left untouched. **Canonical encoding is what makes `hash` an identity** — v1 already rounds on transmit; v2 promotes rounding into the codec so hash, wire, and disk always agree.

---

## 5 · FORGE — the language→geometry compiler ★ keystone, proven

The Forge is what makes this an engine rather than a demo that calls an API. It treats every reply — from the player's model or a peer's — as **untrusted source code for a tiny language** whose runtime library is `VG` and whose one required export is `build(g, VG, THREE)`.

### 5.1 The source language (the contract the model writes against)

Frozen as **VG v1** — any change bumps the version and re-runs the golden corpus:

```
VG.paint(hex,{rough,metal}) · VG.matte(hex,{rough}) · VG.metal(hex,{rough}) · VG.glass(tint,op)
VG.box(w,h,d,mat) · VG.cyl(rT,rB,h,mat,segs) · VG.sphere(r,mat,wS,hS)
VG.wheel(r,w,rimHex) · VG.headlight(hex) · VG.Group()
+ full THREE geometry namespace · Math
REQUIRED: define build(g,VG,THREE); add 30–80 meshes to g; ground at y≈0;
fit x:[-2,2] y:[0,3] z:[-2.5,2.5]; strict mode; no I/O, no DOM, no timers.
```

### 5.2 Pipeline (validated 9/9 in `forge-conformance.test.mjs`)

```
reply ─▶ SANITIZE ─▶ S1 WHOLE ─▶ S2 FN-SLICE ─▶ S3 ASSIGN ─▶ REPAIR ─▶ FALLBACK
              │          │            │              │           │          │
              │       compile      compile        compile    1 model     library
              │       + execute    + execute      + execute  retry w/    build by
              │       + certify    + certify      + certify  structured  keyword
              ▼                                              diagnostic  (always
        prefer fenced contents;                                          works)
        strip BOM/zero-width
```

* **SANITIZE** — if fenced blocks exist, **extract their contents** (v1 merely deleted the ``` markers, leaving surrounding prose to poison the compile; that single change fixes corpus cases A and H).
* **S1 WHOLE** — compile the entire sanitized text as the function body. `new Function` **compiles before executing**, so syntax errors surface with zero side effects. This is the primary strategy and the whole reason v1's failure class dies: v1 sliced *first* with a naïve brace counter, so a `}` inside a string, comment, or template literal truncated valid code into garbage — corpus B, C, G, and the field error `Unexpected token ')'`. S1 never slices; balanced-but-decorated code just compiles.
* **S2 FN-SLICE** — only if S1 fails (prose outside fences): a **state-aware scanner** (tracks `'…' "…" \`…\` ${…} // /*…*/` states; braces count only in code state) slices from the first `function` keyword through the last of up to 12 chained function declarations — preserving helper functions that v1's `indexOf('function build')` slice amputated (corpus H: `leg is not defined`).
* **S3 ASSIGN** — normalizes `const build = (g,VG,THREE) => {…}` and bare `build = …` forms (corpus D).
* **REPAIR** — exactly `FORGE_RETRIES = 1` model retry, fed a **structured diagnostic**, not a vibe: `{stage, strategy, err, braceBalance:+1, parenBalance:+2, truncated:true, head, tail}`. Truncation gets named as truncation (corpus F) so the retry prompt can say *"your reply was cut off after N chars — return fewer meshes"* rather than *"there was an error."*
* **FALLBACK** — the deterministic library (§5.5). **Never silent:** the readout names which stage produced the rig (`FORGED · S1` / `REPAIRED` / `LIBRARY · MOOSE`), and the raw code + diagnostic are one tap away in an inline expander — phone-visible, no devtools. v1's Part V "honest error" principle, now structural.

### 5.3 Certification & budgets

Every successful build emits `cert = { meshes, tris, ms, hash }` into the RigDoc. Enforced at certify: `meshes ≤ MESH_MAX 220`; `tris` estimated from geometry params; `ms` recorded (main-thread builds are not interruptible — the *hard* wall-clock kill belongs to the Worker tier, §5.7). A rig without a cert never enters a doc with `kind:'code'`.

### 5.4 Conformance gates (what "done" means for any Forge edit, forever)

1. **Adversarial corpus** — the 9 cases in `forge-conformance.test.mjs` (fenced, brace-in-string, comment-braces+prose, arrow, trailing prose, truncated, template literal, helper-before-build, peer-escape probe) behave exactly as specified. Currently: **9/9.**
2. **Golden corpus** — all 18 reference builds (`garage.html` ×9 vehicles, `garage-animals.html` ×9 animals) compile and execute through **S1 unchanged**, mesh counts asserted. These files are the quality bar *and* the regression suite *and* the few-shot examples — one corpus, three jobs.
3. Both run in Node before any delivery (studio doctrine), and both are exposed in-page as `window.__forgeConformance()` for on-device confirmation.

### 5.5 The deterministic library

Port the 18 golden builds into `FORGE.library` keyed by subject words (`moose`, `beaver`, `racer`, `tank`…). It is simultaneously: the no-API-key floor (the engine is a complete toy without any model), the fallback terminus of §5.2, and the source of few-shot examples spliced into the code-gen system prompt (two nearest library builds by keyword → dramatic quality lift for the model's own attempts).

### 5.6 Provider seam

One adapter surface: `FORGE.request(prompt, sys, image?, maxTokens) → text`, wrapping v1's `callConfiguredLLM` (openai / anthropic / gemini / custom). Provider errors are **first-class UI**, not console noise: a 404 on a bad model id renders `MODEL 'gpt-5.4-mini' NOT FOUND — CHECK AI SETTINGS` in the readout. v1's hard truth — an invalid model id silently starves every generative feature — becomes a visible, self-diagnosing state.

### 5.7 Security model — stated, tiered, honest

`new Function` executes model code with page authority. For **your own** rig this is the accepted deal (your key, your browser, your code). The real exposure is **peer vcode**: a rig doc arriving over the room executes on *your* machine and could read `localStorage` — including your API key.

* **Tier 1 (now, proven):** all Forge executions run in strict mode with shadowed globals — `window, document, localStorage, sessionStorage, fetch, navigator, XMLHttpRequest, WebSocket, indexedDB, globalThis, self, top, parent, frames, open, importScripts` passed as `undefined` parameters. Corpus case J (peer code calling `localStorage.getItem`) **fails safe**. Stated residual: constructor-chain escapes (`({}).constructor.constructor('return …')()`), so Tier 1 raises the bar and **is not a boundary**.
* **Tier 2 (M4):** peer-sourced code compiles and executes inside a **sandboxed Worker** with a stub THREE that records the scene graph; the structured-clone of that graph crosses back to the page and is instantiated by trusted code. The Worker has no DOM, no storage, and a hard terminate at `WORKER_BUILD_MS = 2000` — the interruptibility Tier 1 cannot provide. Your own code may keep the fast Tier-1 path.

---

## 6 · SIM — the physical contract

* **Bodies.** `P` (player), ball `B`, bots — dynamic states `{pos, vel, yaw, …}` stepped only in `FIXED` phase at `dtFixed`. Visual groups follow bodies; never the reverse (v1 I4, kept).
* **Colliders become registration, not convention.** v1 I3 ("in `physicsMeshes[]` AND has `userData.dims`") is a two-step handshake that fails half-done. v2: `SIM.addCollider(mesh, {l,h,w}) → ColliderHandle` / `SIM.removeCollider(handle)` — one call, one owner, one list, and world matrices for colliders refresh **once per fixed step** (v1 PATCH 1, kept and now guaranteed by phase ordering rather than comment).
* **Resolution.** Sphere-vs-OBB (`resolveOBBCollision`) unchanged in math; relocated behind `SIM.resolve(body, radius)` so modes and bots stop calling collision internals directly.
* **Damage.** Attacker proposes (`car.hit`), victim applies to itself — the v1 pattern, kept and named in the authority table (§7.2). Wrecks, debris, respawn are `FX`/`SIM` cooperation with ceilings `WRECK_MAX 12`.

---

## 7 · NET — authority, docs, presence

Transport stays v1's Cloudflare-worker HTTP room (`state` send ≤ every `ROOM_STATE_MS 100`, poll `ROOM_POLL_MS 150`, snapshot cadence `ROOM_SNAPSHOT_MS 3500`) — it is proven and cheap. What changes is **what** travels.

### 7.1 Doc-sync (rigs and worlds, one mechanism)

State packets carry **hashes, not documents**: `{rig: hex8, world: hex8, pos, quat, vel, …}`. A peer seeing an unknown hash sends `doc.pull {hash}`; the owner (rig) or host (world) replies `doc.push {doc}`; docs are cached by hash. Consequences: the 100 ms state packet shrinks (v1 re-sent the full transmit spec whenever `rigsEqual`'s JSON compare flinched); equality is O(1); **worlds sync by symmetry** — F4 closes with zero world-specific wire code beyond the host answering pulls; late joiners converge by pulling whatever hashes they see.

### 7.2 Authority table (the whole netcode, one table)

| state | authority | mechanism |
|---|---|---|
| own rig pose (pos/quat/vel) | owning client | state packet, remote lerp `REMOTE_CAR_LERP 10` |
| own `RigDoc` | owning client | doc-sync by hash |
| `WorldDoc` | host (solo = self) | doc-sync by hash; edits by non-hosts are proposals |
| ball | host | state packet, lerp `REMOTE_BALL_LERP 8` |
| bots | host (`isBotAuthority`) | serialized bot states, cap `BOT_MAX 6` |
| match / mode / score | host | mode events |
| damage | attacker proposes → victim applies | `car.hit` / `bot.hit` events |
| chat / DM | sender | append, `CHAT_LINES 120` |

Broadcast remains gated on `ritualComplete` ("step inside" is the publish act — v1 condition, kept).

---

## 8 · GARAGE — the editor as operations

Every edit is an **Op** applied to the doc through one gate — never a raw mutation of a mesh that something later "syncs back":

```js
Op = { t:'part.add'|'part.move'|'part.paint'|'part.del'|'mesh.delta'|'doc.recode'|'doc.envelope'|'palette', … }
GARAGE.apply(op) -> { doc' }        // validates, applies, persists via DOC.store, marks dirty for NET
GARAGE.undo()                        // ops log, depth UNDO_MAX 64  ← free consequence of ops
```

Routing by `source.kind`: `parts` ops rewrite `doc.source.parts`; `mesh.delta` on a `code` rig writes `doc.overlay[meshPath]` (§4.3); `doc.recode` swaps code, re-certs, invalidates stale overlay. The gizmo's `objectChange` handler becomes *emit `mesh.delta` on release* — same feel, but edits now persist, sync, and undo because they are data. Ring UI, radial layout, per-part chat (`chatPart` → ops), painter, and the two-tab HELLO/WORLD ritual are unchanged as *surfaces*; they become thin emitters of Ops. The `window.__rig` bridge dies; SHELL binds to `GARAGE` through `ENGINE`.

---

## 9 · SHELL — screens, input, doctrine

* **State machine (formalizing v1's body classes):** `TITLE → RITUAL(HELLO ⇄ WORLD) → PLAY → {GAMES, SAY, GARAGE-reopen}` with body classes `in-ritual · hello-build · sneak-mode · ritual-done · sheet-open · editing · menu-open · play-mode · world-light · ctf-live` driven by one `SHELL.setState(s)` — classes become outputs of the machine, not inputs scattered across 40 call sites.
* **Input map:** joystick `#drivezone`, `KeyW/A/S/D`+arrows, jump/fire/boost buttons, ring taps, `#ritual-input`, image upload, command console — polled in `INPUT` phase into one snapshot consumed by `FIXED`.
* **Doctrine (hard UI law):** IBM Plex Mono everywhere; black/white + the four named accents only; **no border-radius on rectangular containers; no emoji glyphs — all marks drawn vector/CSS**; touch targets ≥ 44 px; the ritual screen never scrolls, it transforms.

---

## 10 · MODES — game modes as plugins

```js
Mode = { id, label, enter(ctx), tick(ctx, dt, now), exit(ctx), hud?(ctx) }
MODES.register(mode) · MODES.set(id)     // registry ≤ SCHED_SYSTEMS budget
```

`freedrive`, `golf` (`tickGolf`), `flagrun` (CTF world build/clear, teams, overdrive, wrecks, commander), `targets` (SAY-placed cups) port as the first four registrations. A mode touches the world only through SIM/DOC/AGENT surfaces; `MODES.set` guarantees `exit` runs (v1's CTF teardown leaks flags/wrecks if the mode dies mid-match — quarantine + mandatory `exit` closes it). "Hide & Sneak," THUNDER WATCH-style watchers, and future variants become registrations, not rewrites.

---

## 11 · PORT — export/import

`PORT.export()` → `.glb` (GLTFExporter, binary) + `<name>.thunder.json` sidecar `{engine:'thunderhead@2', rig: RigDoc, world: WorldDoc, semantics:{colliders, spawn, modes}}` — the Godot bridge's glTF+semantic-sidecar pattern, standardized. `PORT.import(sidecar)` restores docs through `DOC.parse` like any other boundary. Export includes certs, so a receiving engine can trust mesh budgets without re-counting.

---

## 12 · MIGRATION — from `hello-world-003.html` to THUNDERHEAD, in six shippable milestones

Strangler pattern; the game **runs at every step**; each milestone is one focused session with a hard acceptance gate (the one-turn discipline, institutionalized). Function-ownership map: every v1 function listed in the v1 Part III inventory is claimed by exactly one module; the extraction order below respects the dependency diagram.

| # | milestone | moves | gate (all must pass) |
|---|---|---|---|
| **M0** | **FORGE drop-in** *(the active bug — do first)* | Replace `extractBuildFn` + `buildVehicleFromCode` + `aiCodeVehicle`'s post-processing with `forge-reference.js` (§Appendix A); add inline error/code expander to the readout; wire structured-diagnostic repair prompt | 9/9 adversarial · 18/18 golden via S1 · Node run green · a build succeeds on the user's real deployed device with a **valid** model id (`gpt-5.4-mini` must be corrected in AI settings — the engine now *says so* on screen, §5.6) |
| **M1** | **DOC codec** | Introduce `DOC`; `migrate` reads `trig.loadout.v1`; tagged-union `source`; delete every manual `rp`/`vcode` re-attach (5 sites); `rigsEqual` → `DOC.equal` | round-trip property test (parse∘encode = id on 200 fuzzed docs) · old saves load · two-client rig parity by hash |
| **M2** | **KERNEL** | Extract `frame()` into scheduler + phases; systems: sim, agent, modes, fx, sync; quarantine + HUD badge; fixed timestep | frame-time parity within ±10% of v1 on-device · all four modes run · induced throw in `golf.tick` benches golf only, driving continues |
| **M3** | **NET doc-sync** | Hash-in-state, `doc.pull/push`; **WorldDoc syncs** | two clients converge on rig *and world* hash within 2 poll cycles · late joiner converges · F4 closed |
| **M4** | **FORGE-W** | Worker isolation for peer-sourced code (Tier 2, §5.7); hard 2 s terminate | J-class probes cannot reach page state even via constructor chains · peer rig visual parity with Tier-1 path |
| **M5** | **GARAGE ops + overlay** | Ops gate, undo, `mesh.delta` overlay on code rigs, kill `window.__rig` | edit code-rig part → reload → edit persists · peer sees the edit · recode invalidates overlay with notify · undo 64 deep |
| **M6** | **MODES + PORT polish** | Registry-ify modes; sidecar import; conformance suite behind `window.__thunderhead.verify()` | mode enter/exit leak-check (mesh & collider counts return to baseline) · export→import round-trip = hash-equal docs |

**Verification doctrine (permanent):** golden + adversarial corpora in Node before any delivery; structural probes on-page (`__forgeConformance`, mesh/collider counts, class toggles, `localStorage` round-trips); **the preview pauses `requestAnimationFrame` when the tab is hidden — dim/stale frames are not bugs**; multiplayer and LLM paths confirm only on the user's real, keyed, deployed devices at `hartswf0.github.io`. Local edits do not exist until pushed.

---

## 13 · INVARIANTS (testable) · FAILURE MODES (each with its killer) · CHANGE SCENARIOS

**Invariants — each names the mechanism that enforces it:**

| # | invariant | enforced by |
|---|---|---|
| I1 | A doc crosses any boundary only through `DOC.parse/encode` | codec is sole constructor; strict-reject on unknown keys |
| I2 | A rig has exactly one visual source | tagged union `source.kind` |
| I3 | A mesh collides iff a live `ColliderHandle` exists for it | `SIM.addCollider` single gate |
| I4 | Bodies step only in `FIXED`; visuals follow bodies | kernel phase ordering |
| I5 | Loops grow only under a named ceiling | §3 ceiling table; enforced at growth site |
| I6 | Model output executes only via the Forge pipeline | no other `new Function`/`eval` in the file (grep-gate in Node check) |
| I7 | Peer-sourced code never touches page state | Tier 1 shadow (proven) → Tier 2 Worker (M4) |
| I8 | Fallbacks are named, never silent | §5.2 readout provenance + expander |
| I9 | Broadcast only after `ritualComplete` | NET send gate |
| I10 | Same doc ⇒ same hash ⇒ same visual on every client | canonical encode + deterministic builds + overlay-by-cert |

**Failure modes → what kills them:** F1 model output uncompilable → §5.2 S1-first + scanner + structured repair + library floor (*proven 9/9*). F2 invalid model id → §5.6 first-class provider errors on screen. F3 silent key-drop desync → I1 (the class is unconstructible). F4 worlds don't sync → §7.1 symmetry. F5 hidden-tab freeze misread → §3 panic-reset + doctrine note. F6 code-mesh edits vanish → §4.3 overlay. **F7 (new, was latent):** malicious peer vcode reads your key → I7 tiers. **F8 (new):** one mode's exception kills the heartbeat → §3 quarantine.

**Change scenarios, priced:** *new provider* → one branch in `FORGE.request` (§5.6). *new game mode* → one `MODES.register` (§10). *new VG part* → VG v1→v1.1 + golden-corpus re-run (§5.1). *worlds editable by guests* → flip WorldDoc authority row to "any + host commit" (§7.2), one row. *export to Roblox* → new PORT emitter against the same sidecar. *bigger arenas / streams* → the only scenario that strains the file-as-artifact rule; the answer is still one file, with DOC store gaining an IndexedDB shelf — noted, not designed.

---

## 14 · RESIDUAL HUMAN THEORY (what the code cannot hold)

The **taste** in garage quality — proportion, palette, pose — lives in the 18 golden builds and the model's eye, not in any invariant; the corpus is how taste is *transmitted*, not generated. The **social meaning** of the arena — why it matters that others collide with your beaver-tank — rides on the sync bytes but is not in them; "step inside" is the engine's one ritual acknowledgment that publishing a self is a threshold act. The **maintainer's discipline** — one module per session, gates before delivery, never trusting a hidden-tab screenshot — is enforced by this document only insofar as it is read. And the model id in AI settings is a fact about the world (`gpt-5.4-mini` is not a model); the engine can now *say* it loudly, but only a human can make it true.

---

### APPENDIX A — `forge-reference.js`
Browser-ready module implementing §5.2–§5.7 Tier 1 exactly as validated. Drop-in for M0: include before the main module, then route `build()`'s code path through `FORGE.compile(reply, {maxMeshes:220})` and delete `extractBuildFn`/`buildVehicleFromCode`.

### APPENDIX B — `forge-conformance.test.mjs`
The Node harness: v1-verbatim port vs v2 pipeline over the 9-case adversarial corpus, plus truncation-precision and fail-safe assertions. Extend with the 18 golden builds at M0 (paste each `build*()` body as a corpus entry, assert mesh counts). Green run required before every delivery, forever.

*End of specification. The file you open is the artifact; this document is the program.*
