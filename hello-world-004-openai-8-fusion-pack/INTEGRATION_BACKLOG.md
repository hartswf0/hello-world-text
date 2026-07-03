# Integration Backlog With Story Points

Story points express integration risk, not raw line count.

- 1 point: local UI or copy, no shared state.
- 2 points: small state change, one surface.
- 3 points: one substrate touched, clear tests.
- 5 points: two substrates or one mode vertical slice.
- 8 points: cross-mode feature with export/replay implications.
- 13 points: new domain or mode with durable data contract.

## Epic -1: Standardized Base Before More Games

### Story -1.1: AppShell And PanelFrame

Points: 5

Goal:

Create a standard shell for modal/drawer panels before adding more surfaces.

Includes:

- standard title/subtitle/status
- standard primary, secondary, danger, and close actions
- standard panel sizes
- standard backdrop and focus behavior
- standard rail section ownership

Acceptance:

- Choose Game, Multiplayer, Bot Command, Direct, Scene Graph, and Commit can all be described as `PanelSpec` records.
- Closing and canceling behave the same way everywhere.

### Story -1.2: Registry-Driven PLAY Flow

Points: 13

Goal:

Make the PLAY button open a registry-backed game catalog and render game setup from each game's config schema.

Acceptance:

- Free Drive, Thunder Golf, and Flag Run are represented as `GamePlugin` records.
- Flag Run settings are generated from a `configSchema`, not hard-wired panel markup.
- `Hide & Sneak` can remain `soon`, but it must be represented by the same plugin contract.

### Story -1.3: RoomSession Service

Points: 8

Goal:

Move multiplayer room identity, roster, authority, AI host state, and room messages into a shared service.

Acceptance:

- Room UI reads from `RoomSession`.
- Game start, bot order, directive apply, and draft commit can be expressed as typed room events.
- Existing host/join/invite behavior still works.

### Story -1.4: Standard CommitPipeline

Points: 13

Goal:

Make COMMIT mean one transaction flow across world drafts, rig edits, bot/directive orders, scene graph patches, and AI output.

Acceptance:

- A draft has `id`, `kind`, `source`, `targetGraph`, `patch`, `preview`, `validation`, and `roomScope`.
- COMMIT applies the patch, records an event, updates graph state, and syncs to room when scoped.
- CANCEL leaves live state unchanged.

### Story -1.5: SceneGraphService

Points: 8

Goal:

Unify scene graph, rig graph, world graph, directive graph, entity graph, room graph, and event graph under one graph service.

Acceptance:

- Scene graph panel can list at least rig/world/entity graph categories.
- Selecting a graph node can create a draft patch for the CommitPipeline.
- Graph export is available from the same panel frame.

### Story -1.6: DirectiveService For SAY And Bots

Points: 8

Goal:

Route typed SAY, command chips, bot command panel selections, and AI-generated instructions into the same `DirectiveDraft` shape.

Acceptance:

- Bot Command and Direct The Game produce compatible directive drafts.
- Existing parser behavior still works as a fallback.
- Directive drafts can be previewed, committed, canceled, and recorded.

### Story -1.7: WorldTextLanguage Contract

Points: 8

Goal:

Define the shared language contract that maps HELLO, WORLD, DIRECT/BOTS, PLAY, MULTI, GRAPH, COMMIT, FILM, PARIS, and RAIL into common entities, relations, and morphisms.

Acceptance:

- Every current surface can name its dialect.
- Every state-changing surface can produce or be described by a `WorldTextRecord`.
- Every feature plan identifies its core entities, relations, morphisms, draft/commit policy, and event mapping.
- AI output, room events, and graph edits have a common target vocabulary.

### Story -1.8: EvidencePacket Protocol

Points: 5

Goal:

Stop large-code token burn by requiring every scoped integration task to request only the snippets and screenshots needed for that task.

Acceptance:

- The next LLM can classify a task into dialects and substrates before reading target code.
- The next LLM can name the exact snippet line ranges and screenshots it used.
- Scoped work does not request the full target HTML unless a broad audit is explicitly required.
- Visual claims cite screenshots; behavior claims cite code snippets.

## Epic 0: Architecture Foundation

### Story 0.1: Define Shared Context Object

Points: 5

Goal:

Create a single runtime context passed to domains and game modes.

Includes:

- rigGraph
- worldGraph
- directiveGraph
- gameModeRegistry
- eventStream
- railApparatus
- filmRecord
- parisCase

Acceptance:

- Existing free/golf/flagrun can read from context without breaking.
- Context can be inspected from console for debugging.

### Story 0.2: Add Contract Validators

Points: 5

Goal:

Add validation functions for RigGraph, WorldGraph, DirectiveGraph, and GameMode.

Acceptance:

- Invalid generated actors or world zones are rejected before entering the live scene.
- Error appears in hidden AI log, not as permanent play chrome.

### Story 0.3: EventStream Core

Points: 8

Goal:

Create `recordGameEvent(type, payload)` and start recording world changes, clone spawns, bot directives, target hits, and mode transitions.

Acceptance:

- Film and Paris can later consume the same event stream.
- Events include tick/time, entity ids, mode id, and world id.

## Epic 1: HELLO / RigGraph

### Story 1.1: Promote `myParts` To RigGraph

Points: 8

Goal:

Convert manual rig parts into stable records with ids, parent, transform, material, source, and tags.

Acceptance:

- The rig sheet lists real RigPart ids.
- Part selection updates by id, not array position only.
- RigGraph export shows all current parts.

### Story 1.2: Text Scene Graph Panel

Points: 5

Goal:

Add an exportable text/JSON view of the rig graph.

Acceptance:

- User can copy the full rig graph.
- Another LLM can read the graph and know what the rig is made of.

### Story 1.3: Clone Policy

Points: 8

Goal:

Extend clone from editor duplicate into purpose-specific clone types.

Clone types:

- editor
- decoy
- ghost
- rival
- fleet
- bot

Acceptance:

- At least one clone type changes gameplay.
- Clone creation is recorded in EventStream.
- Clones appear in FilmRecord export.

## Epic 2: WORLD / WorldGraph

### Story 2.1: WorldGraph Contract

Points: 8

Goal:

Create a WorldGraph that includes geometry, zones, rules, objectives, and evidence marks.

Acceptance:

- WORLD generation returns WorldGraph before applying meshes.
- WorldGraph can be copied/exported.

### Story 2.2: Mechanic Families

Points: 8

Goal:

Make world families mechanically different.

Families:

- dark: stealth, short sight, stronger hide zones
- light: long sight, fewer hide zones, better film clarity
- water: low traction, splash noise, drift
- grass/forest: occlusion, muffled noise, soft collision
- city/courtroom: lanes, evidence marks, verdict anchors

Acceptance:

- Two world prompts produce different rule values.
- At least one game mode reads those rule values.

### Story 2.3: World Zone Visualizer

Points: 5

Goal:

Show hide zones, hazards, evidence zones, and camera marks when the rail/world drawer is open.

Acceptance:

- Play mode remains clean.
- Build/world surface can inspect the active zones.

## Epic 3: DIRECT / Generative Game Apparatus

### Story 3.1: DirectiveGraph Parser Fallback

Points: 5

Goal:

Wrap the existing SAY/DIRECT parser into a DirectiveGraph output.

Acceptance:

- "spawn 3 bots" becomes structured actors.
- "a goal here" becomes structured objective.
- Existing behavior still works.

### Story 3.2: AI Directive Generator

Points: 8

Goal:

Add AI path for SAY/DIRECT using a validated JSON contract.

Acceptance:

- "make three red seekers guarding the temple and one ally decoy" produces actors, behaviors, teams, and targets.
- Invalid directives fail safely.

### Story 3.3: Directive Preview Surface

Points: 5

Goal:

Before applying AI directives, show a compact preview with apply/reject.

Acceptance:

- User can inspect generated actors/objectives.
- Rejected directive leaves the world unchanged.

## Epic 4: Rail And UI Discipline

### Story 4.1: Hide AI Log In Rail

Points: 3

Goal:

Remove default floating AI LOG surface. Put AI LOG under SYSTEM rail.

Acceptance:

- AI log starts hidden.
- AI log opens only from rail.
- No bottom floating badge appears in play or ritual.

### Story 4.2: Mode-Gated Surfaces

Points: 8

Goal:

Only show controls relevant to the current mode.

Acceptance:

- PLAY mode hides editor/debug surfaces.
- BUILD shows HELLO/WORLD.
- FILM shows camera/record/replay.
- PARIS shows evidence/claims/verdict.

### Story 4.3: Rail Sections

Points: 5

Goal:

Normalize rail into PLAY, BUILD, DIRECT, FILM, CASE, SYSTEM.

Acceptance:

- Every advanced apparatus has one home.
- No duplicate entry points for the same function unless one is a shortcut.

## Epic 5: Game Modes

### Story 5.1: GameModeRegistry Contract

Points: 8

Goal:

Convert modes to setup/teardown/tick/HUD/score/export contracts.

Acceptance:

- Free, golf, and flagrun still work.
- Sneak, film, and Paris can register without touching drive physics.

### Story 5.2: Hide & Sneak Vertical Slice

Points: 13

Goal:

Implement a playable stealth mode.

Includes:

- seekers
- vision cones
- hide zones
- noise meter
- decoy clone
- caught state
- escape objective

Acceptance:

- Player can win or lose.
- World rules affect detection.
- Decoy clone affects seeker behavior.

### Story 5.3: Film Vertical Slice

Points: 13

Goal:

Add record/replay/export as a mode.

Includes:

- REC
- STOP
- pre-roll
- frame samples
- event stream slice
- camera cycle
- replay scrubber
- WebM save if supported
- JSON sidecar

Acceptance:

- A take can be recorded and replayed.
- Export includes active rig, clones, world rules, and events.

### Story 5.4: Paris Vertical Slice

Points: 13

Goal:

Add a verdict mode that turns a recorded take into a case.

Includes:

- source replay
- party A reconstruction
- party B reconstruction
- claims
- challenges
- ruling
- verdict
- export

Acceptance:

- A case reaches verdict.
- Verdict names decisive dimension.
- Export contains evidence, claims, rulings, and result.

## Recommended Chunk Order

1. Story 0.1: Shared context.
2. Story 1.1: RigGraph.
3. Story 2.1: WorldGraph.
4. Story 3.1: DirectiveGraph parser fallback.
5. Story -1.8: EvidencePacket Protocol.
6. Story 4.1: AI log hidden in rail.
7. Story 5.1: GameModeRegistry.
8. Story 2.2: mechanic families.
9. Choose one vertical slice:
   - Sneak if the priority is gameplay.
   - Film if the priority is making movies.
   - Paris if the priority is evidence/adjudication.
10. Add clone mechanic into the chosen vertical slice.

## Minimum Useful First Sprint

Total: 39 points

- 0.1 Shared context: 5
- 1.1 RigGraph: 8
- 2.1 WorldGraph: 8
- 3.1 DirectiveGraph parser fallback: 5
- -1.8 EvidencePacket Protocol: 5
- 4.1 AI log hidden in rail: 3
- 2.2 Mechanic families read by one existing mode: 5

Outcome:

The game still looks similar at first glance, but the underlying state becomes different enough that later modes can consume it.
