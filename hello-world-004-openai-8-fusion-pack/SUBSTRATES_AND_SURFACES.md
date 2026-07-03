# Substrates And Surfaces

## <Initial Interpretation>

The integration should stop treating each feature as a separate panel. The program needs durable <substrates> underneath, and then thin <surfaces> that operate on those substrates.

If a surface owns its own state, it will drift. If a substrate has no surface, it is invisible. If a world has no substrate-level rules, it will only look different.

## <Substrates>

### <RigGraph>

The authoritative data model for the player's vehicle.

Owns:

- part ids
- parent/child structure
- transforms
- material
- source: manual, AI, clone, import, reference
- tags: drive, visual, damageable, hide, decoy, filmable
- handling hints
- clone policy

Surfaces that use it:

- HELLO
- rig sheet
- inspector
- clone
- film
- Paris reconstruction
- export

Why it matters:

The current `myParts` array is close, but it needs stable ids and exportable graph semantics. A real graph lets another LLM reason over actual parts instead of opaque geometry.

### <WorldGraph>

The authoritative model for the arena as rules plus geometry.

Owns:

- world family
- palette
- collidable structures
- zones
- hazards
- visibility rules
- traction rules
- noise rules
- objective anchors
- evidence/camera marks
- spawn/clone points

Surfaces that use it:

- WORLD
- game modes
- SAY/DIRECT
- film
- Paris evidence
- scene graph

Why it matters:

Worlds look the same because the current system can add color and props without changing rule semantics. A world must expose mechanics.

### <DirectiveGraph>

The generated live-game apparatus produced by SAY/DIRECT.

Owns:

- actors
- teams
- roles
- behaviors
- patrol routes
- goals
- targets
- temporary rules
- small generated structures

Surfaces that use it:

- SAY/DIRECT
- bots
- sneak
- flagrun
- film
- Paris

Why it matters:

SAY/DIRECT is currently useful but too parser-bound. It should become "HELLO for game actions": structured, validated, generative, and applicable to live play.

### <GameModeRegistry>

The substrate that turns rig/world/directives into game loops.

Owns:

- mode setup
- mode teardown
- mode tick
- HUD contract
- scoring
- win/loss
- rail entries
- film hooks
- export hooks

Surfaces that use it:

- PLAY rail
- mode picker
- HUD
- film
- Paris
- tests

Why it matters:

Without a registry contract, every mode becomes special-case UI and unshared state.

### <EventStream>

The canonical record of what happened.

Owns:

- collisions
- clone spawn/despawn
- bot orders
- world rule activations
- target hits
- stealth detections
- captures
- camera marks
- claims/verdict links

Surfaces that use it:

- film
- replay
- Paris
- WorldRecord export
- debug log

Why it matters:

If the game cannot remember what changed, worlds cannot affect anything in a way that survives into film or verdict.

### <RailApparatus>

The hidden operations shell.

Owns:

- AI LOG
- API key/config
- diagnostics
- editor tools
- scene graph drawers
- film tools
- case tools
- import/export

Surfaces that use it:

- rail menu
- hidden drawers
- keyboard shortcuts

Why it matters:

The rail should be where complexity lives. Play surfaces should stay mode-specific and lean.

### <FilmRecord>

The substrate for takes, replay, and export.

Owns:

- take id
- frame samples
- controls
- event stream slice
- camera path
- clone identities
- world zones active during take
- video blob if available
- JSON sidecar

Surfaces that use it:

- FILM mode
- replay UI
- Paris evidence
- export

Why it matters:

Film is not just `captureStream`. It needs a synchronized record of state and meaning.

### <ParisCase>

The substrate for argument and verdict.

Owns:

- source evidence
- party reconstructions
- claims
- claim modality: witnessed, inferred, fabricated
- challenges
- rulings
- verdict score
- export record

Surfaces that use it:

- PARIS mode
- film replay
- WORLD evidence zones
- DIRECT claims/actors if later needed

Why it matters:

Paris is a game mode, not just a page. It turns play/film into evidence.

## <Surfaces>

### <HELLO Surface>

Purpose:

Build and revise the rig.

Must not:

- generate arbitrary arenas
- own private unexported part state
- hide the real part graph from the user

Must show:

- live rig
- part graph
- selected part
- text/image prompt
- clone policy

### <WORLD Surface>

Purpose:

Build the arena and its rules.

Must not:

- only recolor the floor
- generate decoration without zones/rules
- change rig identity

Must show:

- world family
- active rules
- zones
- objective anchors
- evidence/camera marks
- collision structures

### <DIRECT Surface>

Purpose:

Generate live game apparatus.

Must not:

- be only fixed command parsing
- bypass validation
- create actors without roles/objectives

Must show:

- command prompt
- generated directive preview
- actor/objective list
- apply/reject

### <PLAY Surface>

Purpose:

Show only the current mode controls and feedback.

Must not:

- expose all editor/debug tools
- own mode state outside registry

### <FILM Surface>

Purpose:

Record and inspect takes.

Must show:

- REC/STOP
- take status
- replay
- scrubber
- camera mode
- save video
- export record

### <PARIS Surface>

Purpose:

Turn film/play evidence into a case.

Must show:

- evidence replay
- reconstruction tools
- claims
- challenges
- ruling
- verdict
- export

### <RAIL Surface>

Purpose:

Organize hidden apparatus.

Must contain:

- PLAY
- BUILD
- DIRECT
- FILM
- CASE
- SYSTEM

## <Rule>

Every new feature must answer:

```text
Which <substrate> does this change?
Which <surface> exposes it?
Which <game mode> consumes it?
Which <event> records it?
Which <test> proves it is not just visual?
```

