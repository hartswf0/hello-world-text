# THUNDER RIGS — WRECK RECALL GAME

## 1. <Initial Interpretation>

The film recorder is not an export feature. It is the source of truth for a two-player reconstruction game.

```text
<PLAYER_1>
[makes-and-films]
<SOURCE_WRECK>

<PLAYER_2>
[watches-and-describes]
<SOURCE_WRECK>

<DESCRIPTION>
[compiles-into]
<NEW_TOY_MODEL>

<AI_JUDGE>
[compares]
{
  <source film>,
  <hidden telemetry>,
  <description>,
  <toy model>
}
```

## 2. <Core Loop>

1. Player 1 selects a drivable embodiment and materials.
2. Player 1 drives and records a wreck.
3. The program records both visible video and hidden ground-truth telemetry.
4. Player 1 locks the take and hands the game to Player 2.
5. Player 2 receives a limited replay budget.
6. Player 2 describes what happened without seeing telemetry.
7. The description generates a separate toy reconstruction.
8. Player 2 can replay and revise that reconstruction.
9. The judge reveals the hidden comparison only after submission.
10. Unsupported claims presented as observations lose provenance credit.

## 3. <Jelly Locomotion>

<JELLY_RIG> must remain a vehicle rather than becoming a passive soft body.

```text
<steering input>
[changes]
<jelly heading>

<throttle input>
[defines]
<target horizontal velocity>

<surface friction>
[scales]
<traction and acceleration>

<brake input>
[damps]
<horizontal velocity>
```

The soft body still deforms and collides, but a traction-aware velocity controller gives it stable forward, reverse, steering, braking, jump, and boost behavior.

## 4. <Hidden Ground Truth>

Every recorded take stores:

- sampled position and velocity;
- maximum speed and path length;
- rig embodiment and road material;
- contact events and material pairs;
- impact intensity and location;
- persistent dents, fractures, traces, and debris.

This information is hidden from Player 2 until judgment.

## 5. <Toy Reconstruction>

The natural-language account is parsed into:

```text
<MODEL_SPEC>
:=
<body type>
+
<surface>
+
<speed estimate>
+
<collision geometry>
+
{materials}
+
{consequences}
+
<epistemic mode>
```

The model is not the original simulation replay. It is a new low-poly scene authored from Player 2's words.

## 6. <Judgment>

The local transparent judge scores:

- motion fidelity;
- material fidelity;
- consequence fidelity;
- provenance honesty.

An external multimodal model can later replace or supplement this judge without changing the game-state protocol.

## 7. <Invariants>

1. Player 2 cannot read hidden telemetry before submission.
2. The source film and reconstructed model remain separate artifacts.
3. A replay of the source never silently becomes the reconstruction.
4. Every generated model derives from the submitted description.
5. Jelly remains directly controllable.
6. Material consequences remain part of the hidden comparison.
7. New rounds restore the original physical sandbox.

## 8. <Failure Modes>

- recording a take without enough movement or impact;
- locking a take before browser recording finishes;
- describing too little to determine a model;
- confusing an incorrect observation with a disclosed inference;
- generating a visually plausible model that contradicts material consequences;
- browser denial of `captureStream` or `MediaRecorder`;
- excessive soft-body load on mobile devices.

## 9. <Implementation Map>

- `puppetMaterialRig`: traction-aware jelly motor and ragdoll thrust.
- `sampleTake`: records hidden motion samples during filming.
- `takeCollisionEvents`: records contact material pairs and impact data.
- `lockLatestAsSource`: seals Player 1's take.
- `parseDescription`: converts Player 2's account into a model specification.
- `buildToyModel`: creates a separate low-poly reconstruction.
- `playToyModel`: animates the generated reconstruction.
- `judgeCase`: compares source summary and model specification.
- `newRound`: restores the sandbox for another pair of players.

## 10. <Change Test>

The protocol survives later additions of:

- uploaded real wreck videos;
- multimodal video understanding;
- speech deposition instead of typing;
- two competing reconstructors;
- claim-by-claim challenges;
- LLM scene compilation;
- more exact trajectory matching;
- exportable courtroom evidence packages.
