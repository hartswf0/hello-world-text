# World Text Language

## <Initial Interpretation>

<WorldTextLanguage> is the shared language underneath HELLO / WORLD, PLAY setup, multiplayer rooms, bot command, SAY/DIRECT, scene graph, commit, film, and Paris/case logic.

The current prototype has many dialects. Each dialect is useful, but the engine becomes hard to extend when each dialect owns its own words, state, buttons, events, and commit rules.

The goal is to organize the language so every surface can translate into the same core:

```text
<WorldTextStatement> [transforms into] <WorldTextRecord>
<WorldTextRecord> [stages as] <Draft>
<Draft> [commits into] <Graph + EventStream + RoomSession>
```

## <Core Entities>

These are the engine primitives every feature should map to.

### <Identity>

Stable names for things that persist across UI, graph, room sync, film, and case evidence.

Owns:

- id
- kind
- label
- tags
- source
- author
- createdAt

Examples:

- `rig-main`
- `part-wheel-fl`
- `world-current`
- `zone-hide-001`
- `bot-seeker-003`
- `draft-world-004`
- `event-capture-014`

### <Entity>

Anything that can exist in the engine.

Kinds:

- <Rig>
- <RigPart>
- <WorldObject>
- <Zone>
- <Actor>
- <Objective>
- <CameraMark>
- <EvidenceMark>
- <Clone>
- <RoomPeer>
- <GameArtifact>

### <Graph>

The inspectable structure that relates entities.

Kinds:

- <RigGraph>
- <WorldGraph>
- <DirectiveGraph>
- <GameGraph>
- <RoomGraph>
- <EventGraph>
- <FilmGraph>
- <CaseGraph>

### <Node>

A graph record for one entity.

Required:

- id
- kind
- graph
- transform or logical position
- tags
- source

### <Edge>

A relation between nodes.

Core relations:

- <part-of>
- <attached-to>
- <located-in>
- <anchored-to>
- <controlled-by>
- <targets>
- <guards>
- <blocks>
- <reveals>
- <hides>
- <scores-for>
- <authored-by>
- <derived-from>
- <mirrored-in>
- <evidenced-by>

### <Transform>

The spatial primitive.

Owns:

- position
- rotation
- scale
- anchor
- local/world coordinate space

### <Material>

The response primitive.

Owns:

- color
- emissive
- surface
- traction
- damage response
- noise response
- visibility response

### <Rule>

The play-affecting primitive.

Kinds:

- visibility
- traction
- noise
- detection
- collision
- damage
- scoring
- spawn
- timing
- authority
- evidence
- camera

### <Zone>

A spatial area that applies rules.

Kinds:

- hide zone
- hazard zone
- objective zone
- spawn zone
- camera zone
- evidence zone
- no-build zone
- loud surface
- quiet surface

### <Actor>

An entity with behavior.

Kinds:

- player
- bot
- seeker
- guard
- ally
- enemy
- clone
- witness
- party model
- camera operator

### <Objective>

The desired game condition.

Kinds:

- capture
- escape
- score
- destroy
- defend
- hide
- reveal
- collect
- reconstruct
- prove
- challenge
- verdict

### <Draft>

A staged change before live mutation.

Kinds:

- rig draft
- world draft
- directive draft
- bot draft
- game config draft
- room draft
- graph patch draft
- film draft
- case draft

### <Commit>

A transaction that applies a valid draft.

Required:

- draftId
- kind
- validation result
- patch
- affected ids
- event id
- room scope
- undo hint

### <Event>

A historical record of what changed.

Required:

- id
- type
- t
- modeId
- roomId if any
- actorId if any
- targetIds
- payload

### <Panel>

A visible surface that edits or displays a substrate.

It should not own private logic that cannot be represented in the language.

### <RailSection>

The apparatus home for a panel or service.

Kinds:

- PLAY
- MULTI
- DIRECT
- BUILD
- GRAPH
- FILM
- CASE
- SYSTEM

## [Core Morphisms]

These are the engine verbs. Each dialect should map its local verbs to these.

### [describe]

Turns user language, UI choices, or AI output into a structured statement.

```text
"spawn 3 seekers" [describe] <WorldTextStatement>
```

### [select]

Identifies an entity or graph node.

```text
<SceneGraph row> [select] <Node>
```

### [instantiate]

Creates a new entity record.

```text
<RigPart spec> [instantiate] <RigPart>
```

### [bind]

Connects one entity to another with an edge.

```text
<wheel> [bind part-of] <rig-main>
<seeker> [bind guards] <temple-zone>
```

### [stage]

Creates a draft without live mutation.

```text
<DirectiveGraph patch> [stage] <DirectiveDraft>
```

### [validate]

Checks a draft against contracts and current context.

```text
<Draft> [validate against] <SharedRuntimeContext>
```

### [commit]

Applies a draft as a transaction.

```text
<valid Draft> [commit] <GraphPatch + Event + RoomEvent>
```

### [render]

Turns graph records into meshes, panels, HUD, or visible state.

```text
<WorldGraph> [render] <geometry + zones + rail view>
```

### [sync]

Mirrors a committed change into a room.

```text
<Commit> [sync] <RoomEvent>
```

### [record]

Writes a historical event.

```text
<state change> [record] <EventStream>
```

### [score]

Interprets events/rules as game progress.

```text
<capture event> [score] <FlagRun score>
```

### [export]

Serializes graph/event/case data for another system or LLM.

```text
<WorldTextRecord> [export] <JSON>
```

### [replay]

Reconstructs a time slice from events and graph snapshots.

```text
<FilmRecord> [replay] <WorldState at t>
```

### [adjudicate]

Turns evidence, claims, and challenges into a ruling.

```text
<ParisCase> [adjudicate] <Verdict>
```

## <Dialect Map>

### <HELLO_DIALECT>

Purpose:

Author the rig.

Local nouns:

- body
- wheel
- spoiler
- wing
- beam
- panel
- paint
- silhouette
- loadout

Local verbs:

- add
- attach
- move
- rotate
- scale
- paint
- clone
- save rig

Canonical translation:

```text
<HELLO text> [describe] <RigGraph patch>
<RigGraph patch> [stage] <RigDraft>
<RigDraft> [commit] <RigGraph + EventStream + RoomSession>
```

Conflict:

HELLO currently sometimes behaves like geometry assembly only. It must become rig graph authoring.

### <WORLD_DIALECT>

Purpose:

Author the arena as geometry plus rules.

Local nouns:

- biome
- family
- sky
- floor
- landmark
- hazard
- hide zone
- surface
- objective anchor

Local verbs:

- make
- forge
- scatter
- grow
- tint
- place
- zone
- commit

Canonical translation:

```text
<WORLD text> [describe] <WorldGraph patch>
<WorldGraph patch> [stage] <WorldDraft>
<WorldDraft> [commit] <WorldGraph + EventStream + RoomSession>
```

Conflict:

WORLD currently risks meaning "decor". It must mean "rule-bearing world."

### <DIRECT_DIALECT>

Purpose:

Author live apparatus: actors, objectives, small structures, and temporary rules.

Local nouns:

- bot
- ally
- enemy
- seeker
- guard
- target
- cup
- goal
- patrol
- mission

Local verbs:

- spawn
- clear
- guard
- chase
- defend
- order
- deploy
- purge

Canonical translation:

```text
<SAY text or bot panel> [describe] <DirectiveGraph patch>
<DirectiveGraph patch> [stage] <DirectiveDraft>
<DirectiveDraft> [commit] <Actors + Objectives + Rules + EventStream>
```

Conflict:

SAY and BOTS are two dialects for the same idea. They should share <DirectiveService>.

### <GAME_DIALECT>

Purpose:

Choose and run a game loop.

Local nouns:

- game
- mode
- teams
- cap limit
- build phase
- time limit
- score
- win/loss
- HUD

Local verbs:

- choose
- configure
- start
- pause
- reset
- score
- win
- lose

Canonical translation:

```text
<game config> [describe] <GameConfig>
<GameConfig> [bind] <GamePlugin>
<GamePlugin> [setup] <GameState>
<GameState events> [record] <EventStream>
```

Conflict:

Current game panels risk being special-case UI. They must become registry-backed plugin config.

### <ROOM_DIALECT>

Purpose:

Share state across peers.

Local nouns:

- room
- host
- guest
- peer
- roster
- invite
- room AI
- authority
- snapshot

Local verbs:

- host
- join
- leave
- send
- receive
- poll
- sync
- snapshot

Canonical translation:

```text
<local commit> [sync] <RoomEvent>
<RoomEvent> [apply] <RoomSession + GraphPatch>
```

Conflict:

Room sync cannot be an afterthought per feature. It must be a typed event language.

### <COMMIT_DIALECT>

Purpose:

Separate possible changes from live changes.

Local nouns:

- draft
- preview
- patch
- validation
- apply
- cancel
- undo

Local verbs:

- stage
- preview
- validate
- commit
- cancel
- discard
- undo

Canonical translation:

```text
<any proposed change> [stage] <Draft>
<Draft> [validate] <ValidationResult>
<valid Draft> [commit] <GraphPatch + Event + RoomEvent>
```

Conflict:

COMMIT currently has several meanings: world draft accept, save rig, deploy bot, clone selection, start match. The base must make COMMIT one transaction grammar.

### <GRAPH_DIALECT>

Purpose:

Inspect and edit the real structure.

Local nouns:

- node
- edge
- graph
- selected object
- parent
- child
- transform
- export

Local verbs:

- inspect
- select
- reveal
- hide
- copy
- export
- patch

Canonical translation:

```text
<graph node> [select] <Entity>
<graph edit> [stage] <GraphPatchDraft>
<GraphPatchDraft> [commit] <Graph + EventStream>
```

Conflict:

Scene graph must not be only display chrome. It should be the visible form of the engine language.

### <FILM_DIALECT>

Purpose:

Record and replay meaningful time.

Local nouns:

- take
- camera
- frame
- event slice
- ghost
- replay
- export

Local verbs:

- record
- stop
- scrub
- replay
- cut
- export

Canonical translation:

```text
<EventStream slice + graph snapshots> [record] <FilmRecord>
<FilmRecord> [replay] <WorldState timeline>
```

Conflict:

Film cannot be pixels only. It needs event and graph language.

### <PARIS_DIALECT>

Purpose:

Turn events and reconstructions into claims and verdicts.

Local nouns:

- evidence
- claim
- witness
- reconstruction
- challenge
- ruling
- verdict

Local verbs:

- cite
- claim
- challenge
- reconstruct
- infer
- rule
- export

Canonical translation:

```text
<FilmRecord + EventStream> [become] <Evidence>
<Evidence + Claims> [adjudicate] <Verdict>
```

Conflict:

Paris cannot be theme UI only. It needs evidence-bearing graph/event data.

### <RAIL_DIALECT>

Purpose:

House advanced apparatus without polluting play.

Local nouns:

- rail section
- AI log
- API
- diagnostics
- import
- export
- graph

Local verbs:

- open
- close
- hide
- inspect
- copy
- configure

Canonical translation:

```text
<advanced apparatus> [belongs-to] <RailSection>
<RailSection> [renders] <PanelFrame>
```

Conflict:

Rail/system tools should not remain floating play surfaces.

## <Dialect Conflicts>

| Conflict | Symptom | Base Resolution |
|---|---|---|
| <geometry> vs <graph> | Meshes exist but meaning is lost. | Every mesh-producing action creates graph records. |
| <decor> vs <rules> | Worlds look different but play the same. | Every world family carries <Rule> and <Zone> payload. |
| <command> vs <commit> | SAY/BOT actions mutate immediately. | Commands create <DirectiveDraft> first when state-changing. |
| <game menu> vs <game registry> | Each game has custom setup UI. | Games expose <GameConfigSchema>. |
| <room message> vs <event> | Multiplayer sync duplicates feature logic. | Room messages mirror committed <Event> and <Draft> records. |
| <clone duplicate> vs <clone actor> | Clone is editor-only. | Clone has purpose tags and event identity. |
| <AI prose> vs <contract> | Generated output is hard to apply safely. | AI returns <WorldTextRecord> / <Draft> JSON. |
| <scene graph display> vs <source graph> | Graph view cannot drive edits/export. | Graph service owns query, select, patch, export. |
| <save> vs <commit> | Buttons imply different persistence semantics. | Commit applies patch; save serializes state; deploy instantiates actor. |
| <rail> vs <play chrome> | Diagnostics bloat the play surface. | Rail owns apparatus; modes own visible HUD. |

## <Canonical WorldTextRecord>

Every dialect should be able to produce this shape or a subset of it.

```json
{
  "id": "wtx-001",
  "dialect": "HELLO|WORLD|DIRECT|GAME|ROOM|COMMIT|GRAPH|FILM|PARIS|RAIL",
  "intent": "create|update|delete|start|stop|query|record|export|adjudicate",
  "actor": {"id": "peer-or-system", "kind": "player|ai|system|room"},
  "target": {"graph": "rig|world|directive|game|room|event|film|case", "ids": []},
  "entities": [],
  "relations": [],
  "rules": [],
  "zones": [],
  "objectives": [],
  "patch": [],
  "commitPolicy": {
    "mode": "immediate|draft|preview|required",
    "roomScope": "local|host|room",
    "undoable": true
  },
  "events": []
}
```

## <WorldText Grammar>

This is not user-facing syntax. It is the conceptual grammar every UI/AI pathway should translate into.

```text
<WorldTextStatement> :=
  <Intent> <Scope> <Target> <Payload> <Constraint>* <CommitPolicy>?

<Intent> :=
  create | update | delete | start | stop | query | record | export | adjudicate

<Scope> :=
  rig | world | directive | game | room | graph | film | case | rail

<Target> :=
  entityId | graphId | zoneId | actorRole | objectiveId | currentSelection | currentRoom

<Payload> :=
  entitySpec | relationSpec | ruleSpec | zoneSpec | objectiveSpec | patchSpec | configSpec

<Constraint> :=
  spatialConstraint | teamConstraint | timeConstraint | authorityConstraint | safetyConstraint

<CommitPolicy> :=
  immediate | draft | preview | roomCommit | hostOnly | localOnly
```

Examples:

```text
"make three red seekers guard the temple"
[describes]
<DirectiveDraft> with <Actor seeker x3> [guards] <WorldZone temple>
```

```text
"water city"
[describes]
<WorldDraft> with <WorldGraph.family water-city> + <Rule traction:low> + <Rule noise:splash>
```

```text
"clone my vehicle as a decoy"
[describes]
<RigCloneDraft> with <Clone purpose:decoy> [derived-from] <Rig>
```

```text
"start flag run, 3 caps, 2 bots per side"
[describes]
<GameConfig> [binds] <GamePlugin flagrun>
```

## <Primitive Inventory>

### <Spatial Primitives>

- point
- vector
- transform
- anchor
- radius
- bounds
- path
- zone
- lane
- gate
- spawn

### <Material Primitives>

- visual color
- emissive color
- traction
- roughness
- damage hardness
- shatter mode
- sound/noise profile
- visibility profile

### <Gameplay Primitives>

- team
- actor
- role
- behavior
- objective
- score
- timer
- resource
- visibility
- detection
- collision
- damage
- capture
- escape

### <Authoring Primitives>

- prompt
- preset
- panel field
- command chip
- graph selection
- AI response
- draft
- patch
- preview
- validation
- commit

### <Network Primitives>

- room id
- peer id
- roster
- authority
- sequence
- snapshot
- room event
- relay
- AI host

### <Evidence Primitives>

- event
- frame
- camera mark
- claim
- witness
- reconstruction
- challenge
- ruling
- verdict

## <Translation Matrix>

| Surface | Local Output Today | Canonical Target |
|---|---|---|
| HELLO rig builder | `myParts`, meshes, loadout | <RigGraph> + <RigDraft> |
| WORLD forge | scenery, mode, pending draft | <WorldGraph> + <WorldDraft> |
| SAY/DIRECT | parser result, immediate action | <DirectiveGraph> + <DirectiveDraft> |
| Bot Command | bot config/deploy/order | <DirectiveDraft> + <Actor> |
| Choose Game | selected mode id | <GamePlugin> + <GameConfig> |
| Flag Run setup | DOM field values | <GameConfig> |
| Multiplayer | room messages | <RoomSession> + <RoomEvent> |
| Inspector | selected object mutation | <GraphPatchDraft> |
| Scene Graph | visual list | <SceneGraphService> |
| AI Log | diagnostic transcript | <RailSystem.SYSTEM> + <EventStream diagnostics> |

## <Invariants>

- Every live thing has <Identity>.
- Every visible thing is either an <Entity>, <Panel>, or <HUD> projection.
- Every state-changing command can be represented as <WorldTextRecord>.
- Every graph mutation can be staged as <Draft>.
- Every committed mutation can be recorded as <Event>.
- Every room-visible mutation can be represented as <RoomEvent>.
- Every game starts from <GamePlugin> plus <GameConfig>.
- Every AI output must become contract data before mutation.
- Every world family must include at least one rule difference.
- Every panel belongs to a rail section or game mode.

## <Residual Human Theory>

The code can enforce contracts, but the maintainers must preserve the language boundaries:

- HELLO is rig language.
- WORLD is rule-field language.
- DIRECT is apparatus language.
- PLAY is game-loop language.
- MULTI is room/authority language.
- COMMIT is transaction language.
- GRAPH is inspection/patch language.
- FILM is time/evidence language.
- PARIS is claim/verdict language.
- RAIL is hidden apparatus language.

When a new feature arrives, ask:

```text
Which dialect is this?
Which core entity does it create or mutate?
Which relation does it add?
Which morphism applies it?
Which event records it?
Which graph exports it?
```
