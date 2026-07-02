# THUNDER RIGS — Engine Spec & Handoff
### A `<theory-of-the-program>` for a fresh, powerful LLM context window

> "I will first construct the `<theory-of-the-program>`, then generate `<program text>` only after the theory is explicit."

This document is a **handoff**. It hands a new LLM (with an empty context window) everything it needs to continue building — and to fix the one thing that is broken right now — without re-reading a 7,800-line file blind. Read Part 0, then Part IV (the active bug) first if you only have time for two sections.

---

## 0. ORIENTATION (read this first)

- **What it is:** a single self-contained HTML file — an HTML5 / **Three.js r0.160** real-time **multiplayer arena driving game** called **THUNDER RIGS · DRIVABLE FORTS**. No build step, no bundler, no server logic. Runs by opening the `.html`.
- **The file:** `/Users/gaia/Downloads/HELLO_WORLD_SNEAK_thunder_rigs.html` (~7,800 lines). It is a **copy**; the originals (`THUNDER_RIGS_flagrun_creative_rigs (2).html`, `drivable-forts-hide (2).html`) are untouched sources.
- **Quality reference files** (the bar the vehicles/creatures must hit — study these, they are the *method*): `/Users/gaia/Downloads/garage.html` (9 code-built low-poly vehicles), `/Users/gaia/Downloads/garage-animals (1).html` (9 code-built low-poly animals). These are what "good" looks like: **each model is a hand-written `build()` function using a shared quality toolkit** (PBR paint/metal/glass, env-map, real wheels, contact shadows), NOT an assembly of fixed primitives.
- **The deployment reality:** the user plays a **deployed** copy at `hartswf0.github.io`. Local edits do NOT reach them until the file is pushed there. Wire deploy or tell them to copy the file.
- **The verification reality (critical):** you cannot fully test this from a headless preview:
  - `requestAnimationFrame` is **paused when the browser tab is hidden**, which the preview keeps it. The entire `frame()` loop (physics, camera, render, bots, golf, targets) stops. So screenshots are dim/stale and gameplay can't be observed. *This has repeatedly been mistaken for bugs.*
  - **Multiplayer** needs a second client — untestable solo.
  - **LLM code-gen** needs the user's own valid API key/model — untestable without it.
  - **Verify by construction**: DOM state, `localStorage`, pure functions, and structural checks (mesh counts, class toggles). Trust the sync/persistence patterns that are already proven for `rp`.
- **THE THING BLOCKING THE USER RIGHT NOW:** AI vehicle code-gen returns code that throws `SyntaxError: Unexpected token ')'` inside `new Function(...)` (`buildVehicleFromCode`), so no vehicle is built ("RIG ·0", "the model returned no usable code"). See **Part IV**. This is the priority.

---

# PART I — THEORY OF THE PROGRAM  (Naurian Loop)

## 1. `[Elicit]` `<purpose>`
Let a player **design, by language and by hand, a vehicle (`HELLO`) and a world (`WORLD`) from first principles**, then **drive that creation in a shared physical arena**, and **export it to other engines (Godot/Roblox)**. The real-world activity is *making a toy car + a play-space and then playing with it with other people* — but authored with words and direct manipulation instead of a modeling suite.

The through-line the user keeps asserting: **do not assume a fixed parts palette.** Generate real geometry from first principles; whatever meshes result *are* the editable object.

## 2. `[Identify]` `<domain entities>`
- `<player>` — a person; drives a `<rig>`, authors `<rig>` and `<world>`.
- `<rig>` (a.k.a. vehicle / loadout) — the drivable object. Canonical data is `<myLoadout>` (see §Part III). Three possible visual sources, in priority order: `vcode` (LLM/hand-written build code) → `rp` (freeform primitive parts) → procedural spec fields (`body/spoiler/topper/front/side/rear/face`).
- `<myLoadout>` — `{group}` = the **single synced source of truth** for the rig. Persisted to `localStorage['trig.loadout.v1']`; transmitted to peers via `rigTransmitSpec`.
- `<world>` — {structures} that are SOLID (`physicsMeshes` with `userData.dims` + `_ritualWorld:true`), plus decorative `<scenery>` (`sceneryGroup`, named `'ritual-scenery'`), plus palette/atmosphere.
- `<ball>` — `B` (pos/vel/active), a rocket-league-style ball; basis for Golf/soccer/targets.
- `<bot>` — an AI-driven `<rig>` (`deployBot`, `localBots[]`).
- `<target>` — a placed goal/cup the ball can be knocked into (`TARGETS[]`).
- `<ring>` — the radial builder UI (`#rig-ring`) during the ritual: `<tool>`s (move/rotate/scale/spin/paint/delete) + `<part>`s + utilities orbiting the model.
- `<gizmo>` — `TransformControls` instance `transform`; attaches to a selected mesh/part.
- `<room>` — a multiplayer session (`currentRoom`, `currentPeerId`, `remoteCars{}`).
- `<VG toolkit>` — the quality material/parts library the code-gen writes against.
- `<AI config>` — `getAIConfig()` from `localStorage['trig.ai.config.v2']` (provider/model/apiKey). **The user's model is `gpt-5.4-mini`, which is NOT a real OpenAI model → all AI calls fail.**

## 3. `[Define]` `<operations>` `[morphisms]`
- `<text|image>` [→ `buildRigFromPrompt` / `aiCodeVehicle`] `<rig spec | build code>`
- `<build code>` [→ `buildVehicleFromCode`] `<THREE.Group of meshes>`
- `<spec>` [→ `applyLoadout`] `<rebuilt playerCar + persist + sync>`
- `<myLoadout>` [→ `rigTransmitSpec`] `<compact transmit object incl. rp & vcode>`
- `<peer state msg>` [→ `remoteSpecFromMsg → buildCar>`] `<remote car>`
- `<tap on model>` [→ `pickPart` / `codePick`] `<select part or raw mesh + attach gizmo>`
- `<gizmo drag>` [→ TransformControls `objectChange` writeback>] `<mutate myParts | mutate mesh>`
- `<selected part> + <words>` [→ `chatPart`] `<recolor/resize/reshape/spin/delete that part>`
- `<command text>` [→ `runCommand`] `<deployBot ×N | placeTarget | clear>`
- `<world text|image>` [→ `aiDesignWorld` / `worldPreset`] `<collidable structures + palette>`
- `<built scene>` [→ `exportEverything`] `<.glb + .thunder.json>`
- `<drive input>` [→ `driveCarPhysics` + `resolveOBBCollision`] `<motion + collisions>`

## 4. `[Specify]` `<conditions>`
- AI (text/image → anything) is enabled **iff** `getAIConfig().apiKey` is set. Without a key, only deterministic parsers run (`worldPreset`, `parseRigPrompt`, `runCommand` keyword parser, `chatPart`).
- The `HELLO` ring shows the **native/freeform** builder unless `myLoadout.vcode` is set (>10 chars), in which case the **code-gen model owns the visual** and `renderMyRig()` early-returns.
- Multiplayer broadcast (`syncRoomState`) is gated on `ritualComplete` (true only after "step inside").
- Bots deploy only where `isBotAuthority()` = `!currentRoom || currentRole==='host'`; cap `BOT_MAX=6`.
- The build-view camera is active only while `window.__ritualCam` is `'hello'|'world'`.

## 5. `[State]` `<invariants>`
- **I1 — One synced truth:** whatever the player builds must end up in `myLoadout` (as spec fields, `rp`, or `vcode`) or it will NOT reach other players. `normalizeSpec()` DROPS unknown keys — so `rp` and `vcode` must be re-attached after every `normalizeSpec` (done in `saveLoadout`/`loadLoadout`/`applyLoadout`/`remoteSpecFromMsg`/`rigTransmitSpec`). **This is the #1 place bugs hide.**
- **I2 — Priority of visual source:** `buildCar(spec)` resolves `vcode` → `rp` → procedural, in that order.
- **I3 — Collision contract:** a mesh collides with the car ONLY if it is in the global `physicsMeshes[]` AND has `userData.dims = {l,h,w}`.
- **I4 — Physics vs. visual are separate:** `P` (player physics body, `CAR_R=1.6`) is distinct from `playerCar` (the mesh). `playerCar` follows `P` in play.
- **I5 — Frame loop is the heartbeat:** almost everything animated (camera framing during the ritual, physics, bots, golf/targets, render) runs inside `frame()` → `requestAnimationFrame`. If the tab is hidden, ALL of it stops. Design/verify accordingly.

## 6. `[Map]` `<state transitions>`
```
TITLE ──(ENTER WORKBENCH)──▶ RITUAL(HELLO)
RITUAL(HELLO) ◀──tabs──▶ RITUAL(WORLD)
RITUAL ──(step inside / releaseToSneak)──▶ PLAY(sneak-mode, ritualComplete=true)
PLAY ──(HELLO·WORLD reopen)──▶ RITUAL   (edit anytime; re-sync on release)
PLAY ──(PLAY fab)──▶ GAMES MENU ──▶ {Free Drive | Thunder Golf | Flag Run | Hide&Sneak(soon)}
PLAY ──(SAY: menu ▸ PLAY ▸ SAY ▸ DIRECT)──▶ COMMAND CONSOLE ──▶ spawn bots / place targets
```
Body classes drive UI gating: `in-ritual`, `hello-build`, `sneak-mode`, `ritual-done`, `sheet-open`, `editing`, `menu-open`, `play-mode`, `world-light`, `ctf-live`.

## 7. `[Expose]` `<assumptions>` — Assumption Ledger
- The user has, or will set, a **valid, vision-capable AI model**. `<requires-user-decision>` — currently FALSE (`gpt-5.4-mini` is invalid); this alone blocks all generative features.
- Running **LLM-authored code via `new Function`** is acceptable (user's own key, own browser, single-player creative tool). `<uncertain>` — powerful but a trust/security note; keep it opt-in.
- `three@0.160` addons (`GLTFExporter`, `TransformControls`, `PMREMGenerator`) are available via the importmap. `<safe>` (already imported).
- Edits to a **code-gen model's meshes are transient** (lost when the code re-runs on reload/sync) — only the code syncs, not the per-mesh tweaks. `<requires-user-decision>` (see change scenario B).
- The preview environment cannot run the frame loop or the LLM; the user's real browser can. `<safe>` and load-bearing.

## 8. `[Find]` `<failure modes>`
- **F1 (ACTIVE):** LLM returns build code that fails `new Function` compile → `SyntaxError` → `buildVehicleFromCode` returns null → no rig. Causes: truncation (token cap), stray markdown/comments, `const` redeclaration, ES features, an emitted image/vision refusal, or the extractor mis-slicing. See Part IV.
- **F2:** invalid AI model → every generative call 4xx's → user sees "code-gen failed / no usable code."
- **F3:** `normalizeSpec` silently drops `rp`/`vcode` → builds don't sync / don't persist (I1). Historically the exact bug that made "other players don't see my build."
- **F4:** world structures not added to `selectableObjects`/room snapshot → **worlds still don't sync** (KNOWN, NOT YET FIXED — only rigs sync).
- **F5:** `frame()` paused (hidden tab) → looks frozen; not a bug.
- **F6:** gizmo drag not persisted → parts snap back (fixed for `rp` via `objectChange` writeback; code-mesh edits are transient by design).

## 9. `[Describe]` `<change scenarios>`
- **A — "Make worlds sync too":** mirror the `rp`/`vcode` pattern for world structures. Serialize `_ritualWorld` meshes into the room snapshot (`currentRoomSnapshot`) or a new `worldTransmit`; rebuild on remote. The pattern is proven for rigs; repeat it.
- **B — "Persist edits to code-gen models":** capture per-mesh gizmo/paint deltas as an overlay applied AFTER `buildVehicleFromCode` re-runs (a `{meshIndex: {pos,rot,scale,color}}` patch stored beside `vcode`), OR stop re-running the code and serialize the resulting group to glTF for sync. Decide the trade (code compactness vs. edit fidelity).
- **C — "Swap the AI provider":** everything routes through `requestAIText(prompt, sys, imageDataUrl, maxTokens)` → `callConfiguredLLM`. Add the provider branch there; nothing else changes.

---

# PART II — THE GAME  (as a real game)

## THE HIDDEN GAME
The struggle is **authorship under physics + other people**: you speak/shape a machine and a place, then the shared world resists it (collisions, opponents, a ball, gravity, bot pressure). The scarce resources are **the quality of your description, screen space, and the moment before commit**. The transformable object is the **rig itself** — its geometry is live, editable, and drivable.

## PLAYER_ROLE
`ROLE` = builder-driver · `JOB` = design a rig + a world, then contest the arena · `POWER` = author geometry by words/hands + drive it · `LIMIT` = one rig at a time, `BOT_MAX` bots, arena bounds `HW=HL=80` · `IMMEDIATE PROBLEM` = "what are you? where are you?" (the two tabs) · `STAKES` = other players see and collide with what you make.

## PRIMARY_VERBS  (`INPUT → TARGET → COST → STATE CHANGE → FEEDBACK`)
1. **Describe** — type/image → rig or world → time + a model call → new geometry appears → readout "designed from scratch."
2. **Shape** — tap a piece + gizmo/chat → that mesh → precision/attention → mesh moves/recolors/reshapes → cyan cage + live update.
3. **Drive** — joystick/keys → the rig → position/exposure → motion + collisions → shake, sparks, camera follow.
4. **Strike** — ram the ball → the ball → momentum/position → ball launches → spark + tracker; into a target = score.
5. **Direct** (SAY) — words → the world → nothing but intent → bots spawn / targets appear → notify banner.
6. **Export** — one tap → the whole scene → nothing → `.glb` + `.thunder.json` downloaded → "import into Godot."

## RULES_AND_RESISTANCE
May: author freely, edit any piece, drive, place bots/targets (host/solo), export.
May not: exceed bounds/bot cap; broadcast before "step inside."
Pushes back: collisions (car & ball vs `physicsMeshes`), gravity, bots (Flag Run AI), the ball's momentum, other players.
Runs out: bot slots, screen space, the pre-commit moment.
Changes over time: the built world persists as scars/structures; the rig you ship is what everyone drives against.
Ends a round: golf sink / CTF cap / player exit.

## CORE_LOOP
`SEE` the model centered in the ring · `PREDICT` from the readout + preview · `CHOOSE` describe vs. shape vs. drive · `COMMIT` → (`build` / gizmo release / `step inside`) · `RESOLVE` geometry rebuilds + physics runs · `REVEAL` the lit result + collisions + peers' reactions · `ADAPT` re-chat a piece, re-describe, re-drive · `ESCALATE` add bots/targets, contest Flag Run, export and take it elsewhere.

## NO_SCROLL_SCREEN (ritual/HELLO)
```
┌──────────────────────────────────────┐
│ HELLO | WORLD (tabs)   "part · READY" │   ← objective + current selection/mode
│  RIG·n           PARTS                │
│         [ model, dead-centre ]        │   ← the world/model IS the surface
│   (ring of tools + parts orbits it)   │
│  input: describe / edit this part  →  │   ← one verb phrase; tap=select, drag=orbit/gizmo
│  step inside →                        │
└──────────────────────────────────────┘
```
Tap selects a piece; drag on empty space orbits; drag a gizmo handle transforms; the screen **transforms state** (rebuilds the model), it never scrolls.

## BUILD_SPEC (essentials)
- **Entities:** `player, rig(myLoadout), world, ball(B), bots(localBots), targets(TARGETS), ring, gizmo(transform), room`.
- **State vars:** `myLoadout{color,accent,body,spoiler,topper,front,side,rear,face,maxLength/Width/Height, rp[], vcode}`, `myParts[]`, `P{pos,vel,yaw,...}`, `B{pos,vel,active}`, `physicsMeshes[]`, `selectableObjects[]`, `GAME{mode,goalMesh,strokes}`, `CTF{...}`.
- **Inputs:** joystick `#drivezone`, `#btn-jump/fire/boost`, ring buttons, text `#ritual-input`, image upload, command console.
- **Timers/resources:** `ROOM_STATE_MS` sync throttle, `BOT_MAX`, golf `par`, overdrive.
- **Win/Loss:** Golf = ball in goal (`tickGolf`); Flag Run = cap limit (`CTF`); Targets = hits (`tickTargets`); sandbox = none.
- **Feedback:** `notify`, `showBanner`, `flashReadout`, sparks, camera shake, contact.
- **Persistent:** `localStorage['trig.loadout.v1']` (rig), `['trig.world.mode.v1']`, `['trig.ai.config.v2']`.

---

# PART III — CURRENT IMPLEMENTATION (map of the actual code)

**File layout (line numbers approximate; the file shifts as it's edited — grep the anchors):**
- Importmap + addons: `three`, `OrbitControls`, `TransformControls`, `GLTFExporter`, `GLTFLoader` (~2680).
- Renderer/scene/camera/lights (~3833). **No tone-mapping / shadows / scene.environment currently** (a quality upgrade lever; env-map exists only inside the VG toolkit).
- **VG toolkit + code executor (~3853):** `vgEnvMap()` (PMREM procedural env), `VG` = `{paint, matte, metal, glass, box, cyl, sphere, wheel, headlight, Group}` (PBR `MeshPhysical`/`MeshStandard`), `buildVehicleFromCode(code)` (`new Function('g','VG','THREE','Math', code + '; if(typeof build==="function"){build(g,VG,THREE);}')`), `aiCodeVehicle(prompt,image,fix)`, `extractBuildFn(reply)`, `window.__setVehicleCode(code)`, `window.__vgLastErr`.
- **Vehicle spec system:** `normalizeSpec` (~3873, DROPS unknown keys), `rigTransmitSpec` (~2810, re-adds `rp`+`vcode`), `applyLoadout`/`saveLoadout`/`loadLoadout`/`remoteSpecFromMsg` (all re-attach `rp`+`vcode` — Invariant I1), `buildCar(specOrColor)` (resolves `vcode`→`rp`→procedural).
- **AI plumbing:** `getAIConfig`, `callConfiguredLLM(prompt,sys,config,image,maxTokens)` (openai Responses+Chat, anthropic, gemini, custom), `requestAIText(...,maxTokens)`, `buildRigFromPrompt` (procedural-spec generator), `aiDesignWorld`, `aiAddParts` (legacy primitive adder).
- **HELLO ritual IIFE (`helloWorldRitual`, ~6xxx):** the radial ring (`RING[]`, `buildRing`, `layoutRing`), `myParts[]` freeform builder (`skateboard`, `partMesh`, `renderMyRig` — **early-returns if `myLoadout.vcode` set**), `addPart`, `nudge`, gizmo (`setGizmo`/`syncGizmo` + `objectChange` writeback), `pickPart` (myParts) / `codePick` (raw code meshes), `chatPart` (per-part language edit), `openPainter`/`codePaint`, `syncRigParts` (writes `myParts`→`myLoadout.rp`), `build()` (the HELLO/WORLD submit handler — **contains the code-gen path with 1 repair retry**), `setTab`, `releaseToSneak`. `window.__rig` bridge exposes parts/sel/mode/live/addSpec/select/del/buildParts to the (outside-IIFE) parts-sheet/scene-graph/HUD.
- **World builder:** `worldPreset(text)`, `aiDesignWorld(text,image)`, `buildWorldStructures`, `makeStructure` (sets `dims`+`_ritualWorld`, pushes to `physicsMeshes`), `growScenery`/`sceneryGroup`, `applyWorldPalette`.
- **Games/modes:** `GAME` + `GAME_MODES`, `tickGolf`, `TARGETS`+`placeTarget`+`tickTargets`, `runCommand` (SAY parser), `CTF`/`tickCTF` (Flag Run), `deployBot`/`updateBots`.
- **Multiplayer:** `roomSend`, `syncRoomState` (sends `rigTransmitSpec(myLoadout)` + pos/rot), `applyRemoteState` (`remoteSpecFromMsg` → `buildCar`), `rigsEqual` (JSON of `rigTransmitSpec`, so it compares `rp`+`vcode` automatically).
- **Physics/play:** `P`, `B`, `CAR_R`, `resolveOBBCollision`, `driveCarPhysics`, `ballPhysics`, `carBallCollisions`, `frame()` (the rAF heartbeat).
- **Export:** `collectBuilt()` + `exportEverything()` → `.glb` (GLTFExporter binary) + `.thunder.json` manifest; on `#btn-file-exp`.
- **Test hooks on `window`:** `__buildVehicleFromCode`, `__aiCodeVehicle`, `__extractBuildFn`, `__setVehicleCode`, `__vgLastErr`, `__rig`, `__runCommand`, `__setGameMode`, `__chatPart`, `__openGames`, `__camPos`, `__worldCount`.

**Sync contract (the load-bearing detail):** `rp` (freeform parts, compact `{k,x,y,z,sx,sy,sz,c,rx,ry,rz,an}`) and `vcode` (build-code string) ride inside `rigTransmitSpec`. Every function that calls `normalizeSpec` MUST re-attach them or they vanish (I1/F3). This is verified working for `rp` (a build persisted to `trig.loadout.v1` and a remote rebuilt all 9 parts). `vcode` follows the identical path.

---

# PART IV — THE ACTIVE BUG  (fix this first)

**Symptom:** typing in HELLO with a key set → console: `[VG build code] SyntaxError: Unexpected token ')' at new Function (<anonymous>) at buildVehicleFromCode at build`. UI: `RIG ·0`, "the model returned no usable code." So the model IS returning text, but `buildVehicleFromCode(code)` can't compile it.

**Current pipeline:** `build()` → `aiCodeVehicle(txt,image,fix)` → `requestAIText(..., maxTokens=14000)` → `extractBuildFn(reply)` (strips ```` ``` ````/prose, brace-matches one `function build(){...}`) → `buildVehicleFromCode(code)` → `new Function('g','VG','THREE','Math', code + '; if(typeof build==="function"){build(g,VG,THREE);}')`. On failure `window.__vgLastErr` is set and ONE repair retry runs (re-prompts the model with the error).

**Most-likely causes, in order — a fresh pass should nail this:**
1. **The extractor's brace-matcher is fooled by `{`/`}` inside strings, comments, or regex** in the model output, so it slices the function at the wrong `}` → unbalanced → `Unexpected token ')'`. FIX: strip line/block comments before matching, or (better) do NOT slice — wrap the *entire* cleaned reply and let the model's own `function build` be found at call time; or ask the model to return ONLY the function with a sentinel and split on it.
2. **Truncation still possible** if the model ignores the token budget or emits an enormous model. FIX: detect unbalanced braces/parens after extraction and treat as truncation (retry, or ask for fewer meshes).
3. **The model wraps output** (an arrow fn, `export`, top-level `const build = (g,VG)=>{}`, or ES modules) that the `if(typeof build==='function')` shim can't call. FIX: normalize to a callable — accept `build`, `buildVehicle`, or a bare block; try `new Function('g','VG','THREE', reply)` as a body directly if `function build` isn't found.
4. **Model emits a comment/`//` on the last line** so the appended `;\n if(...)` lands inside a comment. FIX: append with a leading newline (already `\n`), and strip trailing `//...` lines.

**Recommended rebuild (clean-room, ~1 focused pass):** re-implement the executor to be defensive: (a) strip fenced code + JS comments; (b) locate `function build` OR treat the whole thing as a body; (c) balance-check braces/parens and reject early with a precise message; (d) `new Function` inside try/catch capturing `e.message` AND the offending line; (e) surface the raw code + error inline (an expander) so the user can see it on the phone without devtools; (f) keep the single repair retry. Validate against `garage.html`'s 9 `build*()` functions as golden inputs (they MUST all execute against `VG`). Then the LLM path is just "produce a function of that shape."

**A hard truth for the handoff:** even with the executor bulletproof, generation quality depends on (1) a **valid vision-capable model** in `getAIConfig()` (the user's `gpt-5.4-mini` is invalid — this must be fixed by the user), and (2) the **system prompt** giving the model the exact `VG` API + first-principles instruction (already drafted in `aiCodeVehicle`). Consider shipping a **built-in library of `garage.html`/`garage-animals` `build()` functions** selectable by keyword as a deterministic, always-works fallback that ALSO teaches the model by example.

---

# PART V — FUN-KILLER PURGE & WHAT TO DO FIRST

`REMOVE → REPLACE WITH → PLAYER OPERATION`
- Assumed fixed part palette → **first-principles generated geometry** → shape the actual object, then edit its real meshes.
- Silent primitive fallback on AI failure → **honest error + repair retry + built-in code library** → the player always gets a real model or a clear reason.
- Blind headless "verification" → **golden-input tests + real-browser confirmation** → trust structural proofs, confirm visuals on device.
- Local-only builds → **push to `hartswf0.github.io`** → the player and peers actually see it.

**First three moves for the receiving LLM:**
1. Make `buildVehicleFromCode` + `extractBuildFn` bulletproof against real model output; prove it by executing all 9 `garage.html` `build()` functions unchanged (structural mesh-count check). Add the inline error/code expander.
2. Add a **built-in `build()` library** (port `garage.html` + `garage-animals`) selectable by keyword, wired as both a no-key fallback AND few-shot examples in the code-gen prompt.
3. Then, and only then, extend: world sync (change scenario A), materials/lighting upgrade (`scene.environment` + ACES tone-mapping — but it recolors the whole game, so gate/verify on device), and persistence of code-mesh edits (change scenario B).

## `<Residual Human Theory>` (what the code does not capture)
- The **taste** in "garage quality" — proportion, palette, pose. The prompt gestures at it; only good examples + a good model realize it.
- The **social meaning** of a shared arena (why a player cares that others see their beaver-tank). The sync plumbing carries the bytes, not the meaning.
- The **verification blindness** is not in the code — a maintainer MUST know that the preview pauses the loop and that the user's deployed, keyed, multi-device reality is the only real test bed. Do not "fix" phantom bugs that are just the paused frame loop.
- The **one-turn discipline**: this engine grew by many small blind patches. It will improve fastest via *few, well-specified, golden-tested* changes — exactly what this document is meant to enable.

---
*End of handoff. Grep the anchors, fix Part IV first, verify by construction + golden inputs, confirm on the user's real deployed browser.*
