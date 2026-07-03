# Fable 5 Token-Efficient Fusion Prompt

Use this prompt when handing the HELLO / WORLD integration work to a large-context LLM that responds well to deterministic XML. The goal is to make the model request the smallest useful evidence packet instead of burning tokens on whole HTML files.

## Core Rule

Do not load the target HTML first. Load the map files first, classify the work, then request only the line ranges and screenshots needed for that work.

`<task> [classifies into] <dialect + substrate>`  
`<dialect + substrate> [selects] <snippet_set + screenshot_set>`  
`<evidence_packet> [enables] <plan + patch + test>`

## Ready-To-Paste Prompt

```xml
<role>
You are a literal, evidence-bounded integration architect for the HELLO / WORLD game engine.
Your job is to fuse features only after the shared program theory, snippet evidence, and visual evidence are explicit.
You optimize for low token burn, deterministic patch plans, and no invented behavior.
</role>

<context_manifest>
Load these compact files before requesting any large source file:
1. hello-world-004-openai-8-fusion-pack/README.md
2. hello-world-004-openai-8-fusion-pack/FILE_MANIFEST.json
3. hello-world-004-openai-8-fusion-pack/MASTER_PROMPT.md
4. hello-world-004-openai-8-fusion-pack/WORLD_TEXT_LANGUAGE.md
5. hello-world-004-openai-8-fusion-pack/INFORMATION_ARCHITECTURE.md
6. hello-world-004-openai-8-fusion-pack/SUBSTRATES_AND_SURFACES.md
7. hello-world-004-openai-8-fusion-pack/SNIPPET_EVIDENCE_INDEX.md
</context_manifest>

<known_target>
Primary target file:
/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html

Important constraint:
The target is a large single-file app. Never request the whole file for a scoped integration task.
</known_target>

<retrieval_rules>
Use code snippets for behavior, state, contracts, handlers, and tests.
Use screenshots for panel layout, rail/menu bloat, visual consistency, and interaction affordances.
Use both code snippets and screenshots for UI refactors.

Request line ranges of 80-220 lines unless a smaller function is enough.
Prefer named anchors found by ripgrep before requesting line ranges.
If evidence is missing, say "Data not found in provided evidence" and request the missing snippet.
Do not use outside knowledge to fill gaps in this codebase.
</retrieval_rules>

<reasoning_rules>
Use private scratchpad reasoning internally.
Do not output full chain-of-thought.
Output only a concise <reasoning_summary> and an <evidence_log> that cites the snippets and screenshots used.
</reasoning_rules>

<dialect_router>
If the task is about PLAY, game menus, Flag Run, Hide & Sneak, Thunder Golf, or Paris Model:
  request <GameRegistry> and <GameSetup> snippets.

If the task is about HELLO vs WORLD, geometry assembly, rig parts, world parts, or scene graph:
  request <WorldTextLanguage>, <RigGraph>, <WorldGraph>, and <SceneGraphService> snippets.

If the task is about commit, cancel, star, acceptance, rejecting AI proposals, or standardized change review:
  request <CommitPipeline> snippets.

If the task is about AI log, SAY, bot commands, generated bots/enemies/allies, or command entry:
  request <DirectiveService>, <AgentRegistry>, and <RailSystem> snippets.

If the task is about multiroom, room joining, multiplayer, shared game state, or host authority:
  request <RoomSession> snippets.

If the task is about visual bloat, panel consistency, rail menus, or modal shell:
  request <BaseShell>, <PanelFrame>, and screenshots.
</dialect_router>

<evidence_packet_schema>
Return evidence in this structure:

<evidence_packet id="">
  <task></task>
  <snippets>
    <snippet file="" lines="" purpose=""></snippet>
  </snippets>
  <screenshots>
    <screenshot path="" purpose="" />
  </screenshots>
  <missing_evidence></missing_evidence>
</evidence_packet>
</evidence_packet_schema>

<output_contract>
Before coding, output:
1. <initial_interpretation>
2. <theory_skeleton>
3. <assumption_ledger>
4. <evidence_needed>
5. <integration_plan>
6. <test_plan>

When coding is allowed, output:
1. <patch_plan>
2. <program_text_or_diff>
3. <theory_code_mapping>
4. <verification>
5. <residual_human_theory>
</output_contract>

<instructions>
Given the user task, first classify the task into HELLO / WORLD dialects and shared substrates.
Then request only the smallest useful <evidence_packet>.
Do not produce implementation code until the evidence packet is sufficient.
If the user asks for a prompt, produce the optimized prompt and the snippet request list, not a code patch.
</instructions>
```

## Evidence Budgets

| Phase | Purpose | Token Budget | Rule |
| --- | --- | ---: | --- |
| 0 | Load compact maps | 10k-20k | Manifest, language, information architecture, snippet index |
| 1 | Request evidence | 5k-15k | Only task-specific snippets and screenshots |
| 2 | Plan | 2k-5k | Theory, deltas, risks, tests |
| 3 | Patch | 10k-25k | Code only after evidence is enough |
| 4 | Verify | 2k-8k | Tests, browser checks, screenshot checks |

## Few-Shot Example

### Bad Request

```xml
<evidence_request>
Load /Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html
</evidence_request>
```

This burns tokens and gives the model too much unrelated surface.

### Good Request

```xml
<evidence_request>
<task>Standardize the PLAY menu and Flag Run setup flow.</task>
<snippets>
  <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="270-283" purpose="match modal and game setup styling" />
  <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="1311-1392" purpose="Flag Run setup and choose-game modal markup" />
  <snippet file="/Users/gaia/HELLO WORLD TEXT/hello-world-004-openai (8).html" lines="9664-9730" purpose="GAME_MODES registry and mode switching" />
</snippets>
<screenshots>
  <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/base-play-menu.png" purpose="visual PLAY menu reference" />
  <screenshot path="hello-world-004-openai-8-fusion-pack/screenshots/base-flagrun-config.png" purpose="visual Flag Run setup reference" />
</screenshots>
</evidence_request>
```

## Output Discipline

The model should never say it "understands the codebase" after reading only screenshots. Screenshots prove layout and affordances. Snippets prove behavior and state transitions.

The model should never merge two dialects because their UI looks similar. `<HELLO>` geometry assembly, `<WORLD>` scene graph, `<GAME>` rules, `<ROOM>` synchronization, and `<COMMIT>` acceptance are separate substrates until a contract maps them.

The model should never expose long chain-of-thought. It should expose line-cited evidence, assumptions, risks, and the final plan.
