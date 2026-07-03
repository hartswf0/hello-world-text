# Information Architecture

## <Initial Interpretation>

The target program should become a fused game engine where language produces separate but connected systems:

- <HELLO> produces the player's rig.
- <WORLD> produces the arena and rules.
- <DIRECT> produces live actors, goals, enemies, allies, and apparatus.
- <GAME_MODE> decides how the current world and rig become a playable loop.
- <FILM> records what happened.
- <PARIS> argues over what happened.
- <RAIL> hides advanced apparatus.

The main problem is not lack of code. The problem is weak boundaries. Many systems exist, but they are not yet contractually connected.

## <Entities>

- <Rig>: player vehicle, clone source, film subject.
- <RigPart>: actual part record, transform, material, source, tags.
- <RigGraph>: text/scene graph of all parts.
- <World>: rule-bearing arena, not just sky/floor.
- <WorldZone>: hide zone, hazard zone, evidence zone, camera mark, objective anchor.
- <DirectCommand>: language request for actors/objectives.
- <Actor>: bot, seeker, ally, enemy, clone, witness, party model.
- <GameMode>: free, golf, flagrun, sneak, paris, film.
- <FilmTake>: recorded frame stream plus events and controls.
- <ParisCase>: evidence, reconstructions, claims, challenges, verdict.
- <RailMenu>: hidden apparatus shell.
- <AILog>: diagnostic transcript, hidden by default.

## [Operations]

- [assemble-rig]: HELLO text/image/manual parts -> RigGraph -> playable rig.
- [assemble-world]: WORLD text/image/forge -> WorldGraph -> rules + geometry + zones.
- [direct-game]: SAY/DIRECT text -> directive JSON -> actors/objectives/structures.
- [clone-rig]: rig -> clone entity with a purpose.
- [start-mode]: mode setup -> HUD + objectives + rules.
- [tick-mode]: mode tick -> score, events, transitions.
- [record-take]: frame stream + events + controls -> FilmTake.
- [adjudicate-case]: evidence + claims + challenges -> verdict.
- [hide-apparatus]: advanced panels -> rail drawers.

## <States>

- <BuildRig>
- <BuildWorld>
- <Play>
- <Film>
- <Sneak>
- <ParisEvidence>
- <ParisReconstruction>
- <ParisChallenge>
- <ParisVerdict>
- <RailOpen>
- <AILogHidden>
- <AILogOpen>

## <Constraints>

- <HELLO> cannot overwrite <WORLD>.
- <WORLD> cannot rewrite <Rig>.
- <DIRECT> cannot bypass validation.
- <GameMode> cannot assume all UI is visible.
- <AILog> must be hidden unless explicitly opened from rail.
- <RigGraph> must be source of truth for manual rig parts.
- <WorldGraph> must include mechanics, not only visuals.
- <FilmTake> must record clones and world zones that affect the take.
- <ParisCase> must distinguish witnessed, inferred, and fabricated claims.

## <Invariants>

- Every <RigPart> has a stable id.
- Every <WorldZone> has a rule tag.
- Every <GameMode> owns setup, tick, teardown, HUD, scoring, and export hooks.
- Every <Clone> has a purpose: editor, decoy, ghost, rival, fleet, bot.
- Every generated object is validated before entering live play.
- Every advanced diagnostic surface lives in <RailMenu>.

## <State Transitions>

```text
<HELLO prompt> [transforms into] <RigGraph>
<RigGraph> [transforms into] <PlayableRig>
<WORLD prompt> [transforms into] <WorldGraph>
<WorldGraph> [transforms into] <WorldRules + Geometry + Zones>
<DIRECT prompt> [transforms into] <DirectiveJSON>
<DirectiveJSON> [transforms into] <Actors + Objectives + Small Structures>
<GameMode setup> [enables] <PlayState>
<PlayState events> [transform into] <FilmTake>
<FilmTake> [transforms into] <ParisEvidence>
<ParisEvidence + Reconstructions> [transform into] <Verdict>
```

## Required Domain Contracts

### <RigGraph>

```json
{
  "id": "rig-main",
  "name": "string",
  "parts": [
    {
      "id": "part-001",
      "kind": "wheel",
      "parent": "rig-main",
      "transform": {"x":0,"y":0,"z":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1},
      "material": {"color":"#111111"},
      "source": "manual",
      "tags": ["drive", "visible"]
    }
  ],
  "handling": {},
  "clonePolicy": {}
}
```

### <WorldGraph>

```json
{
  "id": "world-current",
  "family": "forest",
  "palette": {},
  "rules": {
    "visibility": "low",
    "traction": "soft",
    "noise": "muffled"
  },
  "geometry": [],
  "zones": [
    {"id":"hide-001","kind":"hideZone","x":0,"z":0,"r":5,"rules":["blocksVision"]}
  ],
  "objectives": [],
  "evidence": []
}
```

### <DirectiveJSON>

```json
{
  "actors": [
    {"kind":"seeker","team":"hostile","count":3,"behavior":"guard","target":"temple"}
  ],
  "objectives": [
    {"kind":"escape","target":"north-gate"}
  ],
  "structures": [],
  "rules": [
    {"kind":"noise", "source":"boost", "radius":18}
  ]
}
```

### <GameMode>

```js
{
  id: "sneak",
  label: "Hide & Sneak",
  setup(ctx) {},
  teardown(ctx) {},
  tick(dt, ctx) {},
  hud(ctx) {},
  score(ctx) {},
  winLose(ctx) {},
  filmHooks(ctx) {},
  exportHooks(ctx) {}
}
```

## <Failure Modes>

- <World> only changes color: reject as incomplete.
- <SAY/DIRECT> only parses fixed examples: keep fallback, but add generative path.
- <Clone> only duplicates editor selection: keep editor clone, but add gameplay clone.
- <AI log> visible by default: fail rail invariant.
- <Rig graph> displays labels but cannot export part records: fail graph invariant.
- <Film> records video but no event/sidecar data: incomplete.
- <Paris> renders verdict UI but no claim/evidence model: incomplete.

## <Change Scenarios>

1. If the next priority is stealth:
   - Implement <sneak> first.
   - Minimum slice: hide zones, seekers, detection meter, decoy clone, escape objective.

2. If the next priority is cinema:
   - Implement <film> first.
   - Minimum slice: REC/STOP, take frames, replay, camera cycle, export.

3. If the next priority is AI architecture:
   - Implement <DIRECT_DOMAIN> first.
   - Minimum slice: structured directive JSON, validation, actor/objective application.

4. If the next priority is evidence:
   - Implement <ParisCase> first.
   - Minimum slice: replay -> claims -> challenge -> verdict -> export.

