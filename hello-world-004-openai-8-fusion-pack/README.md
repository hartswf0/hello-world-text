# Hello World 004 (8) Fusion Pack

This pack is the handoff for another AI/LLM that will plan the next fusion pass around:

`/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html`

## Load Order

1. `MASTER_PROMPT.md`
2. `FABLE5_TOKEN_EFFICIENT_PROMPT.md`
3. `SNIPPET_EVIDENCE_INDEX.md`
4. `BASE_CORE_ATLAS.html`
5. `CORE_RISK_MAP.md`
6. `BASE_STANDARDIZATION_BLUEPRINT.md`
7. `BASE_STANDARDIZATION_INDEX.html`
8. `WORLD_TEXT_LANGUAGE.md`
9. `WORLD_TEXT_LANGUAGE_ATLAS.html`
10. `INFORMATION_ARCHITECTURE.md`
11. `SUBSTRATES_AND_SURFACES.md`
12. `INTEGRATION_BACKLOG.md`
13. `FEATURE_TEST_INDEX.html`
14. `FILE_MANIFEST.json`
15. `../hello-world-004-openai-8-gap-prompt.html`
16. `../hello-world-004-openai (8).html`
17. Reference files listed in `FILE_MANIFEST.json`, only as needed for implementation detail.

## Core Problem

The prototype has many features, but they do not cohere into a stronger game architecture.

The main failures:

- Worlds often look like variations of the same arena and do not reliably affect play.
- HELLO and WORLD blur together: HELLO should assemble the rig; WORLD should assemble a rule-bearing arena.
- SAY/DIRECT is parser-like and should become a generative AI surface for bots, enemies, allies, goals, and live game geometry.
- AI LOG should be hidden in the rail menu, not floating as default play chrome.
- CLONE exists, but mostly as an editor duplicate, not as a game mechanic.
- HIDE & SNEAK is registered but still a stub.
- PARIS / Verdict mode is missing from the game registry.
- FILM mode is missing: no take recorder, replay scrubber, camera cycle, WebM export, or WorldRecord sidecar.
- The rig needs a real text/scene graph of actual parts, not only visual editing chrome.

## Target Output For The Next LLM

The next LLM should produce an implementation plan first, then code. It should not start by randomly merging features. It must establish contracts:

- `HELLO_DOMAIN`: rig identity, parts, clones, loadout, handling, film subject.
- `WORLD_DOMAIN`: arenas, rules, hazards, visibility, material response, objectives, evidence tags.
- `DIRECT_DOMAIN`: generated bots, enemies, allies, goals, targets, missions, and live game apparatus.
- `GAME_MODE_REGISTRY`: setup, teardown, tick, HUD, scoring, win/loss, replay/export hooks.
- `RAIL_MENU`: hidden apparatus for AI log, API, editor, scene graph, film tools, and diagnostics.
- `FILM_RECORD`: take, frame stream, controls, events, cameras, WebM, WorldRecord.
- `PARIS_CASE`: replay, claims, challenge, ruling, verdict, export.

## Files Created In This Pack

- `README.md`: this load guide.
- `MASTER_PROMPT.md`: prompt to paste into another LLM.
- `FABLE5_TOKEN_EFFICIENT_PROMPT.md`: XML handoff prompt optimized for low-token evidence retrieval.
- `SNIPPET_EVIDENCE_INDEX.md`: line-range and screenshot map for requesting only the needed code evidence.
- `BASE_CORE_ATLAS.html`: visual atlas for shared core, feature layers, screenshots, deadends, and costly differences.
- `CORE_RISK_MAP.md`: underlying deadends, culdesacs, and the expensive integration differences.
- `BASE_STANDARDIZATION_BLUEPRINT.md`: standard base architecture for app shell, panels, registry, rooms, commit, graph, and directives.
- `BASE_STANDARDIZATION_INDEX.html`: visual index mapping current PLAY/MULTI/BOTS/SAY/COMMIT screens to base modules.
- `WORLD_TEXT_LANGUAGE.md`: shared vocabulary of engine primitives, dialects, relations, morphisms, and conflicts.
- `WORLD_TEXT_LANGUAGE_ATLAS.html`: visual atlas of the shared world-text grammar and dialect map.
- `INFORMATION_ARCHITECTURE.md`: entity, operation, state, invariant, and transition model.
- `SUBSTRATES_AND_SURFACES.md`: the underlying state substrates and visible UI surfaces.
- `INTEGRATION_BACKLOG.md`: story-pointed integration plan with acceptance tests.
- `FEATURE_TEST_INDEX.html`: local index for comparing target behavior against reference prototypes.
- `FILE_MANIFEST.json`: exact files to load, with priority and purpose.

## How To Chunk The Work

Start with the base shell before new game modes:

1. `AppShell` + `PanelFrame`
2. `GameRegistry`
3. `RoomSession`
4. `CommitPipeline`
5. `SceneGraphService`
6. `DirectiveService`
7. `WorldTextLanguage`
8. `RigGraph`
9. `WorldGraph`
10. `EvidencePacketProtocol`
11. one vertical slice: `Sneak`, `Film`, or `Paris`

Use `SNIPPET_EVIDENCE_INDEX.md` before reading large code. Use `FEATURE_TEST_INDEX.html` as the working board. Open the target and a reference side by side, run the manual test, then mark only the checks that actually pass.
