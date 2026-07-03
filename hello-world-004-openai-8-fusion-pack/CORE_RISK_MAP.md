# Core Risk Map

## <Initial Interpretation>

The missing base is a shared <runtime context>, not another feature page. Every major surface needs to read and mutate the same core:

```text
<HELLO> [authors] <RigGraph>
<WORLD> [authors] <WorldGraph>
<DIRECT> [authors] <DirectiveGraph>
<PLAY> [runs] <GameModeRegistry>
<GAME ACTION> [records into] <EventStream>
<FILM> [captures] <FilmRecord>
<PARIS> [argues over] <ParisCase>
<RAIL> [houses] <RailApparatus>
```

The current system has many useful surfaces, but several of them terminate in feature-local state. Those terminations are the deadends and culdesacs.

## <Shared Core>

The base should be:

```text
<SharedRuntimeContext> := {
  <RigGraph>,
  <WorldGraph>,
  <DirectiveGraph>,
  <GameModeRegistry>,
  <EventStream>,
  <RailApparatus>,
  <FilmRecord>,
  <ParisCase>
}
```

Every integration story should answer:

- Which <substrate> owns the state?
- Which <surface> edits or displays it?
- Which [operation] mutates it?
- Which <event> records the mutation?
- Which <test row> proves it?
- Which <export> carries it to another LLM?

## <Deadends And Culdesacs>

### <GeometryOnlyHello>

Current pattern:

```text
<prompt> [builds] <mesh group>
<mesh group> [appears as] <vehicle>
```

Why it is a dead end:

The game can see a mesh, but another mode cannot reliably know which part is a decoy, spoiler, camera mount, weak point, evidence marker, hide module, or clone root.

Exit path:

```text
<prompt> [builds] <RigGraph>
<RigGraph> [renders into] <mesh group>
<RigGraph> [exports into] <text scene graph>
```

### <DecorOnlyWorld>

Current pattern:

```text
<world prompt> [changes] <palette + props>
```

Why it is a dead end:

Worlds look different but do not reliably change the rules of play. A dark world, water world, forest world, and Paris/courtroom world need different mechanics.

Exit path:

```text
<world prompt> [builds] <WorldGraph>
<WorldGraph.rules> [change] <visibility + traction + noise + evidence + scoring>
<WorldGraph.zones> [enable] <hide + hazards + camera marks + verdict anchors>
```

### <ParserOnlyDirect>

Current pattern:

```text
<say text> [matches] <command pattern>
<command pattern> [spawns] <object or bot>
```

Why it is a dead end:

It cannot author a durable game apparatus: teams, roles, enemies, allies, patrols, objectives, temporary laws, and failure handling.

Exit path:

```text
<say text> [generates] <DirectiveGraph>
<DirectiveGraph> [validates against] <RigGraph + WorldGraph + GameModeRegistry>
<valid directive> [applies] <actors + objectives + rules>
<rejected directive> [records] <safe failure>
```

### <ModeSpecificLoops>

Current pattern:

```text
<mode> [owns] <private state>
<mode UI> [owns] <private controls>
```

Why it is a culdesac:

Each new game becomes another one-off. Hide-and-sneak, film, Paris, CTF, golf, and clone games cannot share enough behavior.

Exit path:

```text
<GameMode> := {
  setup(context),
  teardown(context),
  tick(context, dt),
  hud(context),
  score(context),
  export(context)
}
```

### <PixelOnlyFilm>

Current pattern:

```text
<canvas> [captures] <video frames>
```

Why it is a dead end:

Pixels alone cannot reconstruct why a car won, which clone was real, when a stealth detection happened, or which evidence supports a Paris verdict.

Exit path:

```text
<EventStream slice> + <camera path> + <graph snapshots> [become] <FilmRecord>
```

### <ThemeOnlyParis>

Current pattern:

```text
<Paris mode> [looks like] <court / debate / evidence theme>
```

Why it is a culdesac:

If the case does not consume events, claims, evidence anchors, and reconstructions, it becomes a skin rather than a game.

Exit path:

```text
<EventStream> + <WorldGraph.evidenceZones> + <FilmRecord> [become] <ParisCase>
<ParisCase> [supports] <claims + challenges + rulings>
```

### <FloatingApparatus>

Current pattern:

```text
<AI log> + <API config> + <debug panels> [float over] <play>
```

Why it is a culdesac:

The player cannot tell which surface matters, and advanced tools become bloat instead of apparatus.

Exit path:

```text
<RailApparatus> [contains] <AI log + API + scene graph + diagnostics + export>
<GameModeRegistry> [decides] <visible surfaces>
```

## <Most Expensive Differences>

### 1. <EntityIdentity> Is Missing Across Surfaces

Cost: 13 points.

Why expensive:

Rig parts, generated meshes, bots, clones, world structures, film frames, and Paris evidence all need common ids. Retrofitting ids means touching render, physics, sync, selection, export, and history.

Integration target:

```text
<EntityId> [binds] <graph record> + <mesh> + <event> + <UI row> + <export record>
```

### 2. <WorldSemantics> Are Not Yet Rule-Bearing

Cost: 13 points.

Why expensive:

World families need to affect visibility, traction, noise, hazards, objectives, cover, evidence, and camera marks. That means world generation must stop after producing inspectable data, then apply it to the live scene.

Integration target:

```text
<WorldGraph.rules> [affect] <physics + bot perception + scoring + film + Paris>
```

### 3. <AIOutput> Needs Contracts Instead Of Free Text

Cost: 8 points.

Why expensive:

HELLO and DIRECT must accept generated output without corrupting the scene. This requires schemas, validators, previews, safe rejection, and fallback.

Integration target:

```text
<AI draft> [validates into] <RigGraph | WorldGraph | DirectiveGraph>
```

### 4. <ModeLifecycle> Needs To Become Generic

Cost: 13 points.

Why expensive:

Modes touch everything: controls, camera, HUD, scoring, bots, physics, rail visibility, events, film, export, and reset.

Integration target:

```text
<GameModeRegistry> [owns] <setup + teardown + tick + hud + score + export>
```

### 5. <EventTime> Is Not Yet Authoritative

Cost: 8 points.

Why expensive:

The current game mostly lives in the present. Film and Paris require a past: who did what, to which entity, under which world rule, at what time.

Integration target:

```text
<state change> [records] <GameEvent>
<GameEvent> [feeds] <FilmRecord + ParisCase + replay + debug>
```

### 6. <RailInformationArchitecture> Is Underpowered

Cost: 5 points.

Why expensive:

Less algorithmically hard, but it touches many surfaces. The payoff is high: bloat gets moved out of play, and every apparatus has a home.

Integration target:

```text
<RailSection> := <BUILD | DIRECT | FILM | CASE | SYSTEM>
```

## <Recommended Base Sequence>

1. Build <SharedRuntimeContext>.
2. Add <EntityId> and basic validators.
3. Promote <RigGraph> enough to export a real text scene graph.
4. Promote <WorldGraph> enough that two worlds have different rule payloads.
5. Add <EventStream> with mode changes, clone spawns, bot orders, and target hits.
6. Wrap SAY/DIRECT into <DirectiveGraph> with preview/apply/reject.
7. Normalize <RailApparatus> and hide AI log/API/debug there.
8. Add one vertical slice game: <HideAndSneak> is the best stress test because it forces world rules, rig tags, bots, and events to interact.

## <Change Test>

If <FilmMode> is added later:

```text
<FilmMode> [consumes] <GameModeRegistry + EventStream + FilmRecord>
```

It should not need to know how HELLO internally builds meshes.

If <ParisMode> is added later:

```text
<ParisMode> [consumes] <EventStream + WorldGraph.evidenceZones + FilmRecord + ParisCase>
```

It should not need to scrape the canvas or infer claims from screen pixels.

If <CloneGame> is added later:

```text
<clone action> [creates] <EntityId + RigGraph reference + GameEvent>
```

It should not be only an editor duplicate.
