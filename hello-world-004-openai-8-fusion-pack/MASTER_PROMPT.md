# Master Prompt For Another LLM

You are planning a fusion pass for:

`/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html`

Do not begin with code. Build a theory of the program first. Treat this as an information architecture and game-mechanics problem, not a styling task.

## What Is Broken

The current prototype has a lot of apparatus, but the apparatus does not consistently become game consequence.

The major issue is that worlds always tend to become visually similar. A world can have different colors, props, or generated solids, but the game does not reliably change because of that world.

The second issue is the split between HELLO and WORLD:

- HELLO should assemble the vehicle/rig.
- WORLD should assemble a rule-bearing arena.
- These should not compete.
- HELLO is not a world generator.
- WORLD is not a vehicle generator.

The third issue is SAY/DIRECT. It is currently a small parser for bots and goals. It should become an AI/generative domain like HELLO, but for live game apparatus: bots, enemies, allies, targets, missions, hazards, objectives, and small generated structures.

The fourth issue is information architecture:

- AI LOG must be hidden in the rail menu.
- Rail menu should be the home for advanced apparatus.
- Play mode should not show every builder/debug/editor system.
- Game modes should own their own UI, tick, scoring, and export hooks.

## Current Target Facts

In `hello-world-004-openai (8).html`:

- `WORLD_MODE_CONFIG` has `dark`, `light`, `water`, `grass`.
- `modeFromText`, `growScenery`, `aiDesignWorld`, `buildWorldStructures`, and `applyForgeWorld` exist.
- HELLO and WORLD are registered through `HELLO_ENGINE.domain('rig')` and `HELLO_ENGINE.domain('world')`.
- A manual rig builder exists through `myParts`, `skateboard()`, `partMesh()`, `renderMyRig()`, and the rig sheet.
- A rig part graph exists visually, but it needs a stronger textual scene graph of actual part records.
- `btn-duplicate` and a clone handler exist, but clone is primarily an editor action.
- SAY/DIRECT exists as `cmd-modal`, `window.__openCmd`, and `runCommand(text)`.
- `GAME_MODES` includes free, golf, flagrun, and `HIDE & SNEAK` as `soon:true`.
- Bots, bot command, CTF flag run, multiplayer, and primitive builder systems exist.
- AI LOG exists as `#aicon`, and a `sysMenu` can toggle AI LOG/API.
- No native FILM mode exists in this target.
- No PARIS / Verdict mode exists in this target.

## Reference Files To Load

Load these in priority order:

1. `hello-world-004-openai-8-fusion-pack/FABLE5_TOKEN_EFFICIENT_PROMPT.md`
   - XML handoff prompt for evidence-bounded, low-token planning.

2. `hello-world-004-openai-8-fusion-pack/SNIPPET_EVIDENCE_INDEX.md`
   - Line-range and screenshot map. Use this before requesting target code.

3. `hello-world-004-openai-8-fusion-pack/BASE_CORE_ATLAS.html`
   - Visual step-back map for shared core, feature layers, screenshots, deadends, and expensive differences.

4. `hello-world-004-openai-8-fusion-pack/CORE_RISK_MAP.md`
   - Deadend/culdesac map and the most expensive underlying differences.

5. `hello-world-004-openai-8-fusion-pack/BASE_STANDARDIZATION_BLUEPRINT.md`
   - Standard base architecture for app shell, panel frame, game registry, room session, commit pipeline, graph service, and directive service.

6. `hello-world-004-openai-8-fusion-pack/BASE_STANDARDIZATION_INDEX.html`
   - Visual index mapping the current PLAY, MULTI, BOTS, SAY, and COMMIT screens to base modules.

7. `hello-world-004-openai-8-fusion-pack/WORLD_TEXT_LANGUAGE.md`
   - Shared vocabulary of engine primitives, dialects, relations, morphisms, and conflicts.

8. `hello-world-004-openai-8-fusion-pack/WORLD_TEXT_LANGUAGE_ATLAS.html`
   - Visual atlas of the shared world-text grammar and dialect map.

9. `hello-world-004-openai (8).html`
   - Target to modify. Request only the line ranges named by `SNIPPET_EVIDENCE_INDEX.md` unless a broad audit is explicitly required.

10. `hello-world-004-openai-8-gap-prompt.html`
   - Previous gap analysis and ready prompt.

11. `thunderhead-openai-production/game/hello-world-004-openai.html`
   - Reference for clone, production game shell, CTF, bot commander, rail/menu behavior.

12. `THUNDER_RIGS_FUTURE_FLEET.html`
   - Reference for film mode, take recorder, replay, camera cycle, WebM save, WorldRecord.

13. `THUNDER_RIGS_GOLF_FILM_OPERATOR.html`
   - Reference for golf + film operator, shot prediction, replay, material events.

14. `VERDICT_ENGINE_PARIS_MODEL.html`
   - Reference for Paris model game: evidence, deposition, reconstruction, challenge, verdict, export.

15. `VERDICT_ENGINE_PARIS_MODEL_STARTUP_FIXED.html`
   - Startup-fixed version of the same model if the first has boot issues.

16. `THUNDER_RIGS_CONSEQUENCE_ENGINE.html`
   - Reference for material response and consequence logic.

17. `THUNDER_RIGS_CONSEQUENCE_FILM_STUDIO.html`
   - Reference for collision-to-consequence film studio, material wrecks, persistent changes, recording.

18. `operator-studio-14.html`
   - Reference for branching, duplication, light table, directorial apparatus, not for 3D driving mechanics.

## Evidence Protocol

For scoped work, do not load the full target HTML into context. First classify the task into dialects and substrates, then request an `EvidencePacket` from `SNIPPET_EVIDENCE_INDEX.md`.

Use:

- code snippets for state, handlers, contracts, game loops, commit semantics, and room sync.
- screenshots for layout, rail/menu bloat, affordances, and visual consistency.
- both snippets and screenshots for UI refactors.

Output only a concise reasoning summary and an evidence log. Do not expose long chain-of-thought. If required evidence is missing, say "Data not found in provided evidence" and request the missing line range or screenshot.

## Required Architecture

Create or refactor toward these domains:

### BASE_SHELL

Purpose: stop interface bloat before adding more games.

Must own:

- `AppShell`: global mode, rail, panel stack, focus/close behavior.
- `PanelFrame`: standard title, subtitle, status, primary/secondary/danger/close actions.
- `GameRegistry`: PLAY button, game catalog, game config schema, lifecycle.
- `RoomSession`: room id, peer id, roster, room AI, authority, typed room events.
- `CommitPipeline`: draft, preview, validate, commit, cancel, undo, room sync.
- `SceneGraphService`: rig/world/directive/entity/room/event graph views and export.
- `DirectiveService`: SAY, bot commands, AI directives, and command chips as one draft path.

Do not add Film, Paris, Sneak, or clone-game work until this base shell has a migration path.

### WORLD_TEXT_LANGUAGE

Purpose: give every feature one shared vocabulary.

Must own:

- `WorldTextRecord`: common target for UI actions, text commands, AI output, room messages, graph edits, and game setup.
- Core entities: `Identity`, `Entity`, `Graph`, `Node`, `Edge`, `Rule`, `Zone`, `Actor`, `Objective`, `Draft`, `Commit`, `Event`.
- Core relations: `part-of`, `attached-to`, `located-in`, `anchored-to`, `controlled-by`, `targets`, `guards`, `blocks`, `reveals`, `hides`, `mirrored-in`, `evidenced-by`.
- Core morphisms: `describe`, `select`, `instantiate`, `bind`, `stage`, `validate`, `commit`, `render`, `sync`, `record`, `score`, `export`, `replay`, `adjudicate`.
- Dialects: HELLO, WORLD, DIRECT/BOTS, PLAY, MULTI, COMMIT, GRAPH, FILM, PARIS, RAIL.

Before changing a feature, identify its dialect and canonical target.

### HELLO_DOMAIN

Purpose: assemble and name the rig.

Must own:

- `rig.parts`: real records of every part.
- `rig.graph`: text/scene graph of parts with id, parent, kind, transform, material, tags, source.
- `rig.clone()`: create useful clones, not only editor duplicates.
- `rig.identity`: handling profile, silhouette, color, role, film subject, clone source.

HELLO must output:

```json
{
  "kind": "rig",
  "parts": [],
  "handling": {},
  "clonePolicy": {},
  "filmSubject": true
}
```

### WORLD_DOMAIN

Purpose: assemble the game world as a rule field.

Must own:

- biome/arena identity,
- collidable geometry,
- hide zones,
- hazard zones,
- loud/quiet surfaces,
- material rules,
- visibility rules,
- camera marks,
- evidence zones,
- objective anchors,
- clone spawn points.

WORLD must output:

```json
{
  "kind": "world",
  "family": "dark|light|water|grass|city|forest|courtroom|temple|custom",
  "rules": {},
  "entities": [],
  "zones": [],
  "objectives": [],
  "evidence": []
}
```

### DIRECT_DOMAIN

Purpose: generative live game apparatus, like HELLO but for actors and objectives.

SAY/DIRECT should become an AI domain for:

- bots,
- enemies,
- allies,
- seekers,
- guards,
- goals,
- cups,
- targets,
- chase routes,
- missions,
- hazards,
- small generated structures.

DIRECT must output:

```json
{
  "kind": "directive",
  "actors": [],
  "objectives": [],
  "structures": [],
  "rules": [],
  "duration": "instant|mode|take"
}
```

### GAME_MODE_REGISTRY

Every game mode must have:

- `id`
- `label`
- `setup(context)`
- `teardown(context)`
- `tick(dt, context)`
- `hud(context)`
- `score(context)`
- `winLose(context)`
- `filmHooks(context)`
- `exportHooks(context)`

Required modes:

- `free`
- `golf`
- `flagrun`
- `sneak`
- `paris`
- `film`

### RAIL_MENU

The rail is the apparatus organizer.

It should contain:

- PLAY: game modes, match, bots, direct.
- BUILD: HELLO, WORLD, primitives, scene graph.
- FILM: record, stop, replay, camera, export.
- CASE: Paris evidence, claims, verdict.
- SYSTEM: AI LOG, API, save/load, diagnostics.

AI LOG must never float open by default.

## Required Missing Mechanics

### 1. Worlds Must Affect Play

Examples:

- dark: stealth bonus, short visibility, seeker cones matter.
- light: long visibility, less hiding, better film clarity.
- water: low traction, drift, splash noise, floating hazards.
- grass/forest: occlusion, soft collisions, hide zones.
- city/courtroom: evidence zones, traffic lanes, claim anchors.

Acceptance:

- Two world prompts produce different game rules, not just colors and props.

### 2. Real Rig Text/Scene Graph

The current rig builder has `myParts`, but the next system needs a visible and exportable graph:

```json
{
  "id": "part-001",
  "kind": "wheel",
  "parent": "rig-root",
  "transform": {"x":0,"y":0,"z":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1},
  "material": {"color":"#111111"},
  "source": "manual|ai|clone|reference",
  "tags": ["drive", "visible", "filmable"]
}
```

This graph must drive the UI, export, clone, film record, and Paris reconstruction.

### 3. Clone As Mechanic

Clone types:

- editor duplicate,
- decoy clone for sneak,
- ghost clone for replay,
- rival clone for Paris,
- fleet clone for film,
- bot clone for enemy/ally variants.

Acceptance:

- A clone changes gameplay in at least one mode.

### 4. Hide & Sneak

Implement real stealth:

- seekers,
- vision cones,
- noise meter,
- hide zones,
- decoy clones,
- caught state,
- escape objective,
- score.

Acceptance:

- Player can win or lose the mode.

### 5. Paris Mode

Mode flow:

1. source replay,
2. party A reconstruction,
3. party B reconstruction,
4. claims,
5. challenges,
6. ruling,
7. verdict,
8. export.

Acceptance:

- A case record can be exported.

### 6. Film Mode

Needs:

- REC,
- STOP,
- pre-roll,
- take frames,
- event stream,
- camera mode,
- replay scrubber,
- WebM save,
- JSON WorldRecord export.

Acceptance:

- A take can be recorded, replayed, saved, and exported.

### 7. SAY/DIRECT As AI

SAY/DIRECT should not stay a fixed parser only.

It should use the same domain pattern as HELLO:

- parse or ask AI,
- return structured directive JSON,
- validate,
- apply to live game.

Acceptance:

- "make three red seekers guarding the temple and one ally decoy" produces actors, roles, teams, route/guard logic, and world tags.

## What Not To Do

- Do not add another floating panel for every feature.
- Do not make world generation only visual.
- Do not let AI directly dump unvalidated arbitrary scene code into the live game.
- Do not merge Paris, Film, Sneak, Direct, and Hello into one modal.
- Do not start by refactoring unrelated rendering or physics.

## Deliverable Expected From The Next LLM

Before code:

1. Explain the shared base from `BASE_CORE_ATLAS.html`.
2. Name which deadend or culdesac from `CORE_RISK_MAP.md` is being escaped.
3. Explain how the change preserves the base standardization rules from `BASE_STANDARDIZATION_BLUEPRINT.md`.
4. Identify which current screen in `BASE_STANDARDIZATION_INDEX.html` is being unified.
5. Identify the dialect, core entities, relations, and morphisms from `WORLD_TEXT_LANGUAGE.md`.
6. Explain the target architecture.
7. Name the exact functions/sections to modify.
8. Define the new data contracts.
9. Define acceptance tests.
10. Estimate the work with story points from `INTEGRATION_BACKLOG.md`.
11. Identify which rows in `FEATURE_TEST_INDEX.html` will prove the change.
12. Name the exact `EvidencePacket` snippets and screenshots used.
13. Only then produce scoped code edits.

After code:

1. Verify no syntax errors.
2. Verify game mode registry loads.
3. Verify AI log starts hidden.
4. Verify rig graph exports actual parts.
5. Verify world prompt changes mechanics.
6. Verify at least one of Sneak, Paris, or Film has a complete playable vertical slice.
