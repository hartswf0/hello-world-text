# Snippet Evidence Index

This index tells another LLM which small pieces of evidence to request for each HELLO / WORLD integration problem. It exists to avoid loading the large target file as one context block.

Primary target:

`/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html`

## Evidence Packet Shape

```xml
<evidence_packet id="">
  <task></task>
  <snippets>
    <snippet file="" lines="" purpose=""></snippet>
  </snippets>
  <screenshots>
    <screenshot path="" purpose="" />
  </screenshots>
  <open_questions></open_questions>
</evidence_packet>
```

## Choosing Evidence

| Need | Use | Do Not Use |
| --- | --- | --- |
| Layout, bloat, visual consistency | Screenshots plus the panel CSS/HTML snippets | Screenshots alone for behavior |
| State ownership, handlers, save/apply flow | Code snippets | Full-file loading |
| Cross-feature integration | Two or three adjacent substrate snippets | Unbounded search dumps |
| Missing feature extraction | Reference file snippets by search term | Whole reference files |
| Regression testing | Feature index plus target function snippets | Visual opinion only |

## Core Evidence Sets

| `<dialect/module>` | `<question>` | `<code snippets to request>` | `<screenshots to load>` | `<why>` |
| --- | --- | --- | --- | --- |
| `<BaseShell>` / `<PanelFrame>` | What is the standardized shell for command, rail, panels, and modals? | Target lines `43-64`, `71-83`, `270-283`, `408-440`, `8321-8400` | `screenshots/base-standardization-index.png`, `screenshots/base-play-menu.png` | Defines the surface language every feature should reuse. |
| `<GameRegistry>` / `<PLAY>` | How does the play button choose or configure games? | Target lines `1311-1392`, `9664-9730` | `screenshots/base-play-menu.png`, `screenshots/base-flagrun-config.png` | Separates game discovery from game rules and settings. |
| `<GameSetup>` / `<FlagRun>` | How does a specific game expose settings before launch? | Target lines `270-283`, `1311-1343`, `9664-9790` | `screenshots/base-flagrun-config.png` | Shows settings, start/cancel flow, and mode registry coupling. |
| `<RoomSession>` / `<MULTI>` | How do rooms, host, join, poll, and shared state work? | Target lines `1066-1095`, `3746-3839`, `4164-4285` | `screenshots/base-multiplayer.png` | Defines the network boundary and where game state can become room state. |
| `<DirectiveService>` / `<SAY>` | How do typed commands become world/game actions? | Target lines `1185-1215`, `1394-1449`, `3014-3057`, `6539-6552`, `6756-6839` | `screenshots/base-direct.png`, `screenshots/base-command-bar.png` | Shows command intake, parsing, AI request, and draft/proposal path. |
| `<AgentRegistry>` / `<BOTS>` | How are bots configured, deployed, purged, and commanded? | Target lines `1106-1128`, `6880-6920`, `9766-9783` | `screenshots/base-bot-command.png` | Needed before adding generative enemies, allies, hide-and-sneak seekers, or bot SAY logic. |
| `<CommitPipeline>` | Where does propose, commit, reject, star, cancel, and apply belong? | Target lines `1185-1215`, `6341-6428`, `6756-6839`, `8717-8810` | `screenshots/base-inspector-commit.png` | Prevents AI changes, build edits, and game setup changes from each using different acceptance logic. |
| `<SceneGraphService>` | What is the current graph of actual rig/world parts? | Target lines `71-83`, `408-410`, `7128-7141`, `7246-7288` | `screenshots/base-inspector-commit.png`, `screenshots/world-text-language-atlas.png` | Needed to replace vague visual worlds with inspectable entities and relations. |
| `<RigGraph>` / `<HELLO>` | How is the vehicle assembled and cloned? | Target lines `3843-4021`, `8685-8716`, `8864-9460` | `screenshots/layer-rig.png`, `screenshots/base-inspector-commit.png` | HELLO is rig/vehicle assembly, not the same thing as WORLD scene construction. |
| `<WorldGraph>` / `<WORLD>` | How do world modes, world text, and generated spaces become scene state? | Target lines `5328-5405`, `6504-6528`, `8685-8810` | `screenshots/layer-world.png`, `screenshots/world-text-language-atlas.png` | WORLD needs a part graph with meaningful environmental effects, not just different-looking geometry. |
| `<RailSystem>` / `<AI_LOG>` | How should AI log, API, file, sys, build, and game rail entries be hidden or exposed? | Target lines `43-64`, `408-440`, `8321-8400`, `9144-9157` | `screenshots/base-play-menu.png`, `screenshots/base-command-bar.png` | Keeps the interface from bloating while preserving advanced controls. |
| `<FilmSystem>` | What is missing for making a film? | Search reference files for `MediaRecorder`, `take`, `shot`, `camera`, `timeline`, `operator` | Request screenshots from any film reference page found | Film needs capture, staging, camera path, timeline, and commit points. |
| `<ParisModel>` | What is missing for the Paris model game? | Search `VERDICT_ENGINE_PARIS_MODEL.html` for `verdict`, `claim`, `evidence`, `model`, `score` | Screenshot Paris reference if available | Paris model is a rules/deliberation game, not just a visual mode. |
| `<HideSneak>` | What is missing for hide and sneak? | Search reference files for `hide`, `sneak`, `seeker`, `visibility`, `stealth`, `tag` | Screenshot reference if available | Requires perception, occlusion, teams, detection, and win/loss state. |

## Command Recipes

Use these recipes to retrieve evidence without opening whole files.

```bash
nl -ba "hello-world-004-openai (8).html" | sed -n '1311,1392p'
nl -ba "hello-world-004-openai (8).html" | sed -n '9664,9730p'
rg -n "GAME_MODES|setGameMode|initGames" "hello-world-004-openai (8).html"
rg -n "MediaRecorder|take|shot|camera|timeline|operator" *.html
rg -n "hide|sneak|seeker|visibility|stealth|tag" *.html
rg -n "verdict|claim|evidence|paris|model" *.html
```

## Minimal Evidence Requests By Task

### Standardize the Play Flow

```xml
<evidence_request>
  <snippets>
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="270-283" purpose="game setup CSS" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="1311-1392" purpose="game setup HTML" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="9664-9730" purpose="mode registry" />
  </snippets>
  <screenshots>
    <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/base-play-menu.png" purpose="choose-game modal" />
    <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/base-flagrun-config.png" purpose="game settings modal" />
  </screenshots>
</evidence_request>
```

### Unify HELLO Geometry And WORLD Scene Graph

```xml
<evidence_request>
  <snippets>
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="3014-3057" purpose="HELLO_ENGINE protocol" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="5328-5405" purpose="world mode configuration" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="8685-8810" purpose="rig/world/draft domains" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="8864-9460" purpose="manual rig builder and rig graph" />
  </snippets>
  <screenshots>
    <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/world-text-language-atlas.png" purpose="world text dialect map" />
  </screenshots>
</evidence_request>
```

### Make SAY Generative For Bots, Enemies, And Allies

```xml
<evidence_request>
  <snippets>
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="1106-1128" purpose="bot command modal" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="1394-1449" purpose="direct game modal" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="6539-6552" purpose="AI command parsing" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="6756-6839" purpose="AI proposal and commit handlers" />
  </snippets>
  <screenshots>
    <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/base-bot-command.png" purpose="bot controls" />
    <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/base-direct.png" purpose="direct command controls" />
  </screenshots>
</evidence_request>
```

### Standardize Commit, Cancel, Star, And Clone

```xml
<evidence_request>
  <snippets>
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="1185-1215" purpose="proposal UI and commit buttons" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="6341-6428" purpose="DraftEngine stage/commit/clear" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="6756-6839" purpose="proposal commit/reject handlers" />
    <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="8864-9460" purpose="clone and rig part editing" />
  </snippets>
  <screenshots>
    <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/base-inspector-commit.png" purpose="inspector, clone, and transform reference" />
  </screenshots>
</evidence_request>
```

## Dead Ends To Avoid

`<visual_similarity> [does-not-imply] <shared_state_contract>`

Do not assume panels are integrated because they share mint outlines and black backgrounds.

`<command_text> [does-not-imply] <world_effect>`

Do not assume SAY, Direct Game, Bot Command, and API command bars share a substrate until they use the same directive service and commit pipeline.

`<generated_geometry> [does-not-imply] <world>`

Do not call geometry a world unless it has named entities, relations, affordances, rules, and effects on play.

`<mode_menu> [does-not-imply] <game>`

Do not call a menu item a game unless it has setup, start, active loop, scoring, stop, and room synchronization rules.
