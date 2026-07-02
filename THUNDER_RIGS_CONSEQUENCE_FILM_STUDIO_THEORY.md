# THUNDER RIGS — CONSEQUENCE FILM STUDIO

## <Initial Interpretation>

The material laboratory and the camera system are one instrument. A wreck is not complete when bodies stop moving; it is complete when the world has changed and that change can be inspected, replayed, and exported.

```text
<WRECK>
:=
<material interaction>
+
<persistent consequence>
+
<camera take>
+
<replayable record>
```

## <Theory Skeleton>

```text
<CONTROL_SURFACE>
:=
<BUILD>
+
<TEST>
+
<FILM>
```

- <BUILD> selects rig embodiment, world surface, and object material.
- <TEST> runs comparison protocols and controls environmental parameters.
- <FILM> selects camera grammar, records the WebGL world, stores takes, replays takes, and exports the consequence record.

## <Invariants>

1. The selected object remains visible while the panel is open.
2. A material is selected in one compact horizontal strip rather than a large button wall.
3. Recording captures the rendered world rather than the interface chrome.
4. A take stores duration, camera, rig state, surface, impacts, and consequence-event count.
5. Directed wreck recording resets the course, starts recording, triggers the collision, follows the impact, and stops automatically.
6. Videos are kept in browser memory until the page closes and can be downloaded individually.
7. The consequence ledger can be exported separately as JSON.

## <State Transitions>

```text
<READY>
[record]
<RECORDING>
[stop]
<PROCESSING>
[save blob]
<TAKE AVAILABLE>
[play]
<REPLAY THEATER>
```

```text
<DIRECTED WRECK>
[reset world]
[build material course]
[start orbit camera]
[start recording]
[launch crash]
[cut to impact camera]
[stop and save]
```

## <Failure Modes>

- MediaRecorder is unavailable in the browser.
- A browser codec produces WebM where a user expected MP4.
- A take exists only in memory until downloaded.
- The capture records the current viewport aspect ratio.
- Browser or GPU restrictions can prevent WebGL or WASM startup.

## <Implementation Map>

- `showPanelTab`: switches BUILD / TEST / FILM without a long scrolling control wall.
- `beginFilm` / `stopFilm`: control canvas capture through MediaRecorder.
- `directedWreckFilm`: runs the authored wreck-filming protocol.
- `renderFilmClips`: creates an in-memory take list with PLAY and SAVE actions.
- `openReplay`: opens a full-screen replay theater.
- `setCameraMode`: switches CHASE / OVERHEAD / ORBIT / IMPACT shots.
- `updateCamera`: keeps the rig framed away from the open control surface.
- `exportConsequenceRecord`: saves material, damage, take, and event metadata as JSON.
