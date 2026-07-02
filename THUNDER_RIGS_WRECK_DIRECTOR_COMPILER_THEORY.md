# THUNDER RIGS — WRECK DIRECTOR / REPLAY / COMPILER

## <Initial Interpretation>

The game requires three working instruments:

1. <wreck director>: place cars, aim each car, set its delay, test the run, then film it.
2. <ground-truth replay>: replay the recorded Jolt/Three.js state even when the browser cannot decode a WebM file.
3. <scene compiler>: turn Player 2's description into executable `ToyScene.load({...})` code and run that code to build the 3D reconstruction.

## <Operational Loop>

```text
PLAYER 1
PLACE A/B
→ AIM A/B
→ SET DELAYS
→ TEST
→ REWIND
→ FILM RUN
→ LOCK FILM

PLAYER 2
PLAY ENGINE REPLAY
→ DESCRIBE
→ GENERATE CODE
→ EXECUTE CODE
→ REPLAY MODEL
→ JUDGE
```

## <Invariants>

- Setup uses an overhead frame containing both cars.
- Player 1 can move and launch both cars.
- `TEST` runs the setup without creating evidence.
- `REWIND` restores both cars and their motion plans.
- Every filmed take stores scene transforms and camera transforms.
- `PLAY FILM` uses stored engine frames first; encoded browser video is optional.
- Player 2's text compiles to visible, editable, executable scene code.
- The judge compares the generated actor count, motion, materials, consequences, and provenance with the sealed take.

## <Program Mapping>

- `director.plans`: direction, power, delay, and armed state for cars A and B.
- `startDirectorRun`: launches all planned bodies.
- `takeSceneFrames`: records visible object and camera transforms.
- `startTakeReplay`: reconstructs and plays those frames inside the 3D canvas.
- `compileToyProgram`: converts natural-language claims into a scene program.
- `codeForToyProgram`: emits `ToyScene.load({...});`.
- `runToyCode`: validates and executes the generated program.
- `executeToyProgram`: constructs the live 3D toy reconstruction.
