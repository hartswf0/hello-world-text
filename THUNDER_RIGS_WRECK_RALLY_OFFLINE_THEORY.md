# THUNDER RIGS — WRECK RALLY OFFLINE

## <Initial Interpretation>

The previous build replaced driving with a director tool and still depended on browser security-sensitive modules. This build removes both failures.

## <Minimum Working Game>

```text
OPEN FILE
→ START DRIVING
→ PICK A WRECK SET
→ FILM
→ DRIVE / BRAKE / BOOST
→ STOP
→ LOCK
→ PLAYER 2 WATCHES
→ PLAYER 2 DESCRIBES
→ TEXT GENERATES EXECUTABLE ToyScene CODE
→ CODE BUILDS A TOY MODEL
→ JUDGE COMPARES MODEL TO SEALED TAKE
```

## <Operational Rules>

- The file contains no module import, WebAssembly, iframe, or local-file fetch.
- The driving model is arcade-stable and cannot roll onto its roof.
- Interesting wrecks come from moving traffic, ramps, breakable glass, barrels, crates, parked-car chains, debris, impact spin, and camera shake.
- Internal replay stores canvas-world snapshots and does not depend on video decoding.
- `SAVE VIDEO` records the internal replay through `canvas.captureStream` when the browser supports it.
- Player 2's description compiles to `ToyScene.load({...});`.
- Editing and rerunning that code rebuilds the actual toy scene.
