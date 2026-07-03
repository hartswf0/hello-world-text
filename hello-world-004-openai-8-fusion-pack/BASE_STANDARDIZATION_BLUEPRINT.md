# Base Standardization Blueprint

## <Initial Interpretation>

The next integration pass should not start by adding more game modes. It should prepare <hello-world base> to receive games, rooms, bots, SAY/DIRECT commands, scene graph edits, and generated drafts through shared modular systems.

The screenshots show the current problem:

- <ChooseGamePanel> and <FlagRunConfigPanel> are useful, but they are special-case game UI.
- <MultiplayerPanel> has its own lobby shape.
- <BotCommandPanel> has its own command grammar.
- <DirectPanel> and <CommandBar> have overlapping SAY/DIRECT behavior.
- <InspectorCommitPanel> has commit/clone/delete controls that do not share a base commit contract.
- <SceneGraphPanel> is useful but still feels separate from the commit and graph export story.
- <AI_LOG> still appears as a floating apparatus instead of a rail-owned diagnostic surface.

The base needs a standardized <AppShell> and a small set of services that games plug into.

## <Theory Skeleton>

### <Entities>

- <AppShell>: the root interface manager.
- <RailSystem>: the right-side apparatus rail.
- <PanelFrame>: the standard modal/drawer/frame wrapper.
- <PanelSpec>: structured description of a panel's title, section, actions, body, state, and close behavior.
- <GameCatalog>: registry-backed list of available games.
- <GamePlugin>: one playable mode module.
- <GameConfigSchema>: declarative fields for game setup.
- <RoomSession>: multiplayer room authority, roster, sync, and room AI state.
- <BotService>: creates and manages bot actors.
- <DirectiveService>: converts SAY/BOT/AI commands into <DirectiveDraft>.
- <SceneGraphService>: exposes rig/world/directive/entity graphs.
- <CommitPipeline>: standard draft, preview, apply, cancel, undo, and event recording flow.
- <Draft>: staged change that is not live until committed.
- <EventStream>: canonical history of user, AI, game, room, and bot actions.
- <StandardAction>: named action with label, style, scope, enabled state, handler, and event type.

### [Operations]

- [openPanel]
- [closePanel]
- [selectGame]
- [configureGame]
- [startGame]
- [hostRoom]
- [joinRoom]
- [syncRoom]
- [createDraft]
- [previewDraft]
- [commitDraft]
- [cancelDraft]
- [recordEvent]
- [renderGraph]
- [sayDirective]
- [deployBot]
- [showRailSection]

### <States>

- <idle>
- <rail-open>
- <choosing-game>
- <configuring-game>
- <room-lobby>
- <directing>
- <bot-commanding>
- <drafting>
- <previewing>
- <committed>
- <in-match>
- <paused>
- <exportable>

### <Constraints>

- Every game must start through <GameRegistry>.
- Every game setup panel must render from <GameConfigSchema>.
- Every generated or edited change must pass through <CommitPipeline>.
- Every multiplayer message must be a typed <RoomEvent>.
- Every advanced tool must live in a <RailSection>.
- Every graph surface must come from <SceneGraphService>.
- Every major action must record into <EventStream>.

### <Invariants>

```text
<GamePlugin> [cannot start] without <GameRegistry>
<Draft> [cannot mutate live state] without [commitDraft]
<RoomEvent> [cannot sync] without <entityId> + <eventType> + <roomSeq>
<PanelFrame> [must expose] <title> + <section> + <primaryAction> + <secondaryAction> + <closeAction>
<AI_LOG> [must live under] <RailSystem.SYSTEM>
<SceneGraph> [must represent] actual graph records, not only rendered meshes
```

## <Standardized Base Modules>

### 1. <AppShell>

Purpose:

Own the global interface grammar.

Responsibilities:

- mode gate visibility
- rail open/close
- panel stack
- global escape/close behavior
- safe-area layout
- focus trapping for modals
- standard backdrop behavior
- status/toast placement

Required API:

```js
AppShell.openPanel(panelSpec)
AppShell.closePanel(panelId)
AppShell.setMode(modeId)
AppShell.setRailSection(sectionId)
AppShell.setStatus(status)
```

Why this comes first:

Without <AppShell>, every new game will add another modal and the interface will keep bloating.

### 2. <PanelFrame>

Purpose:

Make <ChooseGamePanel>, <FlagRunConfigPanel>, <MultiplayerPanel>, <BotCommandPanel>, <DirectPanel>, <SceneGraphPanel>, and <CommitPanel> feel like one system.

Standard panel fields:

```js
{
  id,
  section: 'PLAY|MULTI|DIRECT|BUILD|GRAPH|SYSTEM|FILM|CASE',
  title,
  subtitle,
  accent,
  size: 'compact|standard|wide|full',
  body,
  primaryAction,
  secondaryActions,
  dangerAction,
  closeAction,
  status
}
```

Standard actions:

- <primary>: START, HOST, JOIN, DEPLOY, APPLY, COMMIT
- <secondary>: BACK, PREVIEW, COPY, EXPORT
- <danger>: CANCEL, DELETE, PURGE, LEAVE
- <close>: X / CLOSE with identical behavior everywhere

### 3. <GameRegistry>

Purpose:

Make PLAY open a <GameCatalog> and make each game a module instead of a one-off modal.

Game plugin contract:

```js
{
  id,
  label,
  icon,
  summary,
  status: 'ready|soon|disabled|experimental',
  dependencies: ['bots', 'rooms', 'worldGraph', 'directiveGraph'],
  configSchema,
  setup(context, config),
  teardown(context),
  tick(context, dt),
  hud(context),
  score(context),
  winLose(context),
  roomSync(context),
  export(context)
}
```

PLAY flow:

```text
<PLAY button> [opens] <GameCatalogPanel>
<game card> [selects] <GamePlugin>
<GamePlugin.configSchema> [renders] <GameConfigPanel>
<START> [calls] <GameRegistry.start(gameId, config, context)>
```

Required before adding more games:

- Free Drive should be a <GamePlugin>.
- Thunder Golf should be a <GamePlugin>.
- Flag Run should be a <GamePlugin> with its config schema.
- Hide & Sneak should remain `soon` until it can satisfy the same contract.

### 4. <RoomSession>

Purpose:

Make multiplayer a shared substrate, not a modal-specific feature.

Room contract:

```js
{
  roomId,
  peerId,
  role: 'host|guest|solo',
  roster,
  authority: 'host|shared|local',
  aiHost,
  seq,
  send(event),
  receive(event),
  snapshot(),
  applySnapshot(snapshot)
}
```

Typed room events:

- `room.join`
- `room.leave`
- `room.chat`
- `room.ai.status`
- `game.start`
- `game.config`
- `entity.spawn`
- `entity.update`
- `draft.preview`
- `draft.commit`
- `bot.order`
- `directive.apply`
- `world.commit`
- `rig.commit`

Why this comes before game integration:

If every game invents its own room messages, multiplayer becomes a second implementation of every feature.

### 5. <CommitPipeline>

Purpose:

Standardize COMMIT across rig edits, world drafts, direct commands, bot orders, scene graph edits, AI output, and future film/case annotations.

Draft contract:

```js
{
  id,
  kind: 'rig|world|directive|bot|scene|film|case',
  source: 'manual|ai|room|import|game',
  targetGraph,
  preview,
  patch,
  validation,
  roomScope: 'local|room|host',
  createdAt,
  authorId
}
```

Commit flow:

```text
<source action> [creates] <Draft>
<Draft> [validates against] <SharedRuntimeContext>
<valid Draft> [renders in] <CommitPanel>
<COMMIT> [applies] <patch> + [records] <EventStream> + [syncs] <RoomSession>
<CANCEL> [discards] <Draft> + [records] <draft.cancel>
```

Standard buttons:

- PREVIEW
- COMMIT
- CANCEL
- DISCARD
- UNDO
- COPY PATCH

### 6. <SceneGraphService>

Purpose:

Make scene graph, rig graph, world graph, directive graph, and selected object inspector one coherent graph apparatus.

Graph types:

- <RigGraph>
- <WorldGraph>
- <DirectiveGraph>
- <EntityGraph>
- <RoomGraph>
- <EventGraph>

Required API:

```js
SceneGraphService.listGraphs()
SceneGraphService.getGraph(graphId)
SceneGraphService.selectNode(entityId)
SceneGraphService.exportGraph(graphId)
SceneGraphService.createDraftFromSelection(entityId, patch)
```

UI rule:

Scene graph should share <PanelFrame> and <CommitPipeline>. It should not be a separate visual island.

### 7. <DirectiveService>

Purpose:

Unify SAY, BOT COMMAND, TEAM AI COMMANDER, and future AI directorial instructions.

Directive flow:

```text
<button preset> [creates] <DirectiveDraft>
<typed SAY> [creates] <DirectiveDraft>
<bot panel> [creates] <DirectiveDraft>
<AI generator> [creates] <DirectiveDraft>
<DirectiveDraft> [commits through] <CommitPipeline>
```

Directive kinds:

- spawn actors
- assign bot roles
- create targets
- create goals
- set teams
- create patrols
- set temporary rules
- request world structures
- create clone decoys

Why this matters:

BOT COMMAND and SAY/DIRECT are currently two versions of "tell the game what should happen." They should share a substrate.

### 8. <RailSystem>

Purpose:

Make advanced apparatus discoverable without letting it bloat play.

Rail sections:

```text
PLAY: game catalog, current game, pause, score
MULTI: room, roster, chat, invites, host AI
DIRECT: say, bots, directives, preview queue
BUILD: hello, world, parts, inspector, commit queue
GRAPH: scene graph, rig graph, world graph, event graph
FILM: record, take, replay, camera, export
CASE: evidence, claims, reconstruction, verdict
SYSTEM: AI log, API key, diagnostics, import/export
```

Invariant:

```text
<advanced tool> [must have exactly one home] <RailSection>
```

## <Base Readiness Checklist>

Before adding Film, Paris, Sneak, clone games, or more multiplayer mechanics:

- <PanelFrame> exists and can render game, room, bot, direct, graph, and commit panels.
- <GameRegistry> owns PLAY and game selection.
- <RoomSession> is accessible from the shared runtime context.
- <CommitPipeline> handles at least world draft commit and bot/directive commit.
- <SceneGraphService> exports real graph data for rig/world/directive/entity state.
- <DirectiveService> wraps the old parser and bot panel into the same draft shape.
- <RailSystem> owns AI LOG/API/diagnostics.
- <EventStream> records `game.start`, `draft.commit`, `room.join`, `bot.order`, and `directive.apply`.

## <Most Important Sequencing>

Do this order:

1. <PanelFrame> and <RailSystem>
2. <GameRegistry> and <GamePlugin> contract
3. <RoomSession> typed events
4. <CommitPipeline>
5. <SceneGraphService>
6. <DirectiveService>
7. migrate existing Free/Golf/FlagRun panels into the base
8. only then add Sneak, Film, Paris, clone mechanics, and richer bot games

Why:

The base must become boring before the games become interesting. A game mode should contribute rules and UI specs, not invent modal behavior, room sync, graph exports, or commit semantics.
