# THUNDER RIGS — WRECK-OP FORECAST

## <Initial Interpretation>

Continuous joystick driving made the first wreck difficult before the player could use the game. The revised control loop converts driving into a shot:

```text
<drag> -> <forecast> -> <film-and-launch> -> <one-correction> -> <rewind-or-pass>
```

## <Theory Skeleton>

```text
<WRECK_OP>
:=
<CLEAR_RUNWAY>
+
<STABLE_RIG>
+
<TRAJECTORY_FORECAST>
+
<RECORDED_SHOT>
+
<OPTIONAL_COURSE_CORRECTION>
+
<REWIND>
+
<WRECK_RECALL>
```

## <Invariants>

1. The first lane contains one target and no obstacle stack.
2. The car begins near the floor rather than falling from height.
3. The rigid car uses a wider track, lower center of mass, shorter suspension, angular damping, and active upright correction.
4. The player does not need a joystick to produce the first wreck.
5. Drag direction sets travel direction; drag length sets speed.
6. The forecast remains visible until the player presses `FILM SHOT`.
7. A filmed run permits one correction drag.
8. `REWIND` restores the clean start and removes the latest take when preparing a retake.
9. Props and difficult courses remain optional menu actions.
10. The second-player reconstruction and judge loop remains unchanged.

## <Control Surface>

```text
DRAG FROM RIG
FILM SHOT
DRAG ONCE TO CORRECT
LOCK FILM
PASS DEVICE
DESCRIBE
BUILD MODEL
JUDGE
```

## <Change Test>

The same interaction can later support curved steering forecasts, braking points, multiple vehicles, replay scrubbing, and level-specific wreck puzzles without restoring the joystick as the primary first-use control.
