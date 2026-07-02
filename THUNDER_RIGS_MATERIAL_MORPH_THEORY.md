# THUNDER RIGS — MATERIAL MORPH SANDBOX

## 1. <Initial Interpretation>

The sandbox is not a car with several visual skins. It is a testing table in which the same <rig identity> and the same <scene population> can be re-instantiated through different physical models.

```text
<MATERIAL_MORPH>
:=
<preserve identity>
+
<sample physical state>
+
<replace embodiment>
+
<transfer momentum>
+
<continue the experiment>
```

The playable rig must be able to become:

- <RIGID_RIG>: a hard Jolt chassis governed by a wheeled vehicle constraint;
- <HYBRID_RIG>: the same stable chassis with a recoverable deformable render skin;
- <RAGDOLL_RIG>: a modular car skeleton whose panels and wheel pods are joined by limited constraints;
- <JELLY_RIG>: a pressure-bearing tetrahedral soft-body car.

The scene must separately expose <world contact material> and <object morphology>. This makes it possible to test a jelly car on ice, a ragdoll car on rubber, or a rigid population under lunar gravity.

## 2. <Theory Skeleton>

```text
<MATERIAL_SANDBOX>
:=
<PHYSICS_WORLD>
+
<RIG_IDENTITY>
+
{RIG_EMBODIMENTS}
+
<WORLD_MATERIAL_FIELD>
+
<TEST_POPULATION>
+
<MORPHISM_CONTROLLER>
+
<TELEMETRY>
```

```text
<RIG_IDENTITY>
[inhabits exactly one]
{
  <RIGID_EMBODIMENT>,
  <HYBRID_EMBODIMENT>,
  <RAGDOLL_EMBODIMENT>,
  <JELLY_EMBODIMENT>
}
```

```text
<WORLD_MATERIAL_FIELD>
[parameterizes]
{
  <gravity>,
  <friction>,
  <restitution>,
  <surface appearance>
}
```

## 3. <Domain Entities>

- <RIG_IDENTITY>
- <ACTIVE_EMBODIMENT>
- <RIGID_CHASSIS>
- <VEHICLE_CONSTRAINT>
- <ELASTIC_RENDER_SKIN>
- <CAR_RAGDOLL>
- <RAGDOLL_PART>
- <SWING_TWIST_JOINT>
- <JELLY_CAR>
- <SOFT_VERTEX>
- <EDGE_CONSTRAINT>
- <VOLUME_CONSTRAINT>
- <PRESSURE>
- <WORLD_MATERIAL>
- <TEST_OBJECT>
- <TEST_POPULATION>
- <MORPH_SEED>
- <PHYSICAL_STATE>
- <POSITION>
- <ORIENTATION>
- <LINEAR_VELOCITY>
- <ANGULAR_VELOCITY>
- <MATERIAL_MEMORY>
- <CONTROL_INPUT>
- <CAMERA_FRAME>
- <TELEMETRY>

## 4. <Operations>

```text
<ACTIVE_EMBODIMENT> [samples-state] <PHYSICAL_STATE>
<PHYSICAL_STATE> [seeds] <NEXT_EMBODIMENT>
<NEXT_EMBODIMENT> [inherits] <POSITION>
<NEXT_EMBODIMENT> [inherits] <LINEAR_VELOCITY>
<RIGID_RETURN> [uprights] <ORIENTATION>
```

```text
<CONTROL_INPUT> [drives-wheels] <RIGID_CHASSIS>
<CONTROL_INPUT> [puppets] <CAR_RAGDOLL>
<CONTROL_INPUT> [impulses] <JELLY_CAR>
```

```text
<WORLD_MATERIAL_SELECTION>
[changes]
{
  <body friction>,
  <body restitution>,
  <gravity scale>,
  <surface roughness>,
  <surface tint>
}
```

```text
<TEST_POPULATION>
[samples-positions]
{MORPH_SEEDS}
[rematerializes-as]
<RIGID | RAGDOLL | JELLY | MIXED>
```

## 5. <Conditions>

1. Only one <rig embodiment> may be active in the physics world at a time.
2. A morph must sample the active body before removing or stowing it.
3. Returning to a wheeled chassis must derive an upright yaw from the previous orientation.
4. The vehicle constraint remains attached to its original rigid body and is never rebuilt during routine morphs.
5. The inactive rigid chassis is stowed outside the arena rather than destroyed.
6. The car ragdoll is removed and re-added as one articulated system.
7. The jelly car is removed and re-added as one soft body.
8. Scene rematerialization samples positions before clearing the old test population.
9. The fixed physics step remains bounded at 1/60 second.
10. The high oblique orthographic camera follows whichever embodiment currently carries <rig identity>.

## 6. <Invariants>

1. <RIG_IDENTITY> survives every material morph.
2. The active rig always has one authoritative Jolt body or articulated root.
3. Controls never write a Three.js transform directly.
4. Three.js remains a rendering projection of Jolt state.
5. Rigid and hybrid modes remain conventionally driveable.
6. Ragdoll and jelly modes remain controllable, but their controls become impulses rather than wheel commands.
7. World material and rig morphology remain independent dimensions.
8. Test-population morphology and playable-rig morphology remain independent dimensions.
9. Inactive embodiments do not visually remain in the arena.
10. Soft-body vertices are rendered from current Jolt motion data.
11. A visible dent does not become the rigid collision cage.
12. Mobile drive, brake, jump, boost, menu, and morph controls remain direct hit targets.

## 7. <State Transitions>

```text
<HYBRID_RIG>
[morph-to-ragdoll]
<SAMPLE_STATE>
[stow-vehicle]
<ACTIVATE_CAR_RAGDOLL>
[transfer-momentum]
<RAGDOLL_RIG>
```

```text
<RAGDOLL_RIG>
[morph-to-jelly]
<SAMPLE_ROOT_STATE>
[remove-articulation]
<ACTIVATE_SOFT_BODY>
[transfer-momentum]
<JELLY_RIG>
```

```text
<JELLY_RIG>
[morph-to-rigid]
<SAMPLE_SOFT_BODY_STATE>
[remove-soft-body]
<UPRIGHT_ORIENTATION>
[restore-vehicle]
<RIGID_RIG>
```

```text
<TEST_POPULATION_A>
[morph-all]
<SAMPLE_POSITIONS>
[clear-old-bodies]
<SPAWN_NEW_PHYSICAL_SPECIES>
<TEST_POPULATION_B>
```

## 8. <Assumption Ledger>

- JoltPhysics.js 1.0.0 exposes vehicle constraints, ragdolls, soft bodies, body removal/re-addition, impulses, and body-state access.
- Jolt's WASM-compatible module is loaded over HTTP or HTTPS.
- Momentum continuity is more important than exact conservation of mass between radically different embodiments.
- Ragdoll and jelly controls are deliberately puppet-like; they do not pretend to be wheel traction.
- The first car ragdoll uses modular box parts to make articulation legible.
- The first jelly car uses a shaped lattice rather than a production vehicle mesh.
- Material presets are comparative experimental regimes, not engineering-grade constitutive material models.
- A later build may attach persistent material histories to named objects and multiplayer identities.

## 9. <Failure Modes>

- <DOUBLE_ACTIVE_RIG>: two embodiments collide because the previous one was not removed or stowed.
- <MOMENTUM_SPIKE>: a transition reads stale velocity or treats a morph as an impact.
- <UPSIDE_DOWN_RETURN>: a ragdoll orientation is copied directly into a wheeled chassis.
- <SOFT_BODY_OVERLOAD>: too many high-resolution jelly objects reduce frame rate.
- <RAGDOLL_POPULATION_OVERLOAD>: rematerializing a large stack into many articulated bodies creates excessive body and joint counts.
- <WORLD_PRESET_CONFUSION>: visual tint changes without corresponding contact changes.
- <RESET_WITH_INTERNAL_SOFT_VELOCITY>: a jelly shape is restored while some vertex motion remains.
- <WASM_LOAD_FAILURE>: the engine never initializes when launched from `file://` or blocked CDNs.
- <WEBGL_FAILURE>: Jolt can initialize while the renderer cannot create a display context.
- <MATERIAL_FALSE_PRECISION>: users interpret preset labels as literal measured steel, rubber, ice, or foam parameters.

## 10. <Change Test>

The theory survives:

- replacing the procedural rigid car with a generated GLTF rig;
- making each generated car prompt compile into rigid, articulated, and soft-body embodiments;
- adding breakable joints to the ragdoll car;
- adding plastic deformation or permanent jelly rest-state changes;
- adding cloth, granular, liquid-like, magnetic, or brittle material species;
- adding a material brush that morphs only bodies inside a radius;
- recording before/after telemetry for every morph;
- replaying the same crash protocol across multiple material regimes;
- synchronizing only the active embodiment and morph events in multiplayer;
- lowering soft-body lattice resolution on mobile without changing the state model.

## 11. <Implementation Map>

- `RIG_MODES`: names the four playable embodiments.
- `setRigMode`: samples state, deactivates the old embodiment, activates the new embodiment, and transfers momentum.
- `createRigRagdoll`: builds the modular car skeleton and bounded swing-twist joints.
- `createRigJelly`: builds a shaped soft-body lattice with edge, volume, and pressure behavior.
- `WORLD_MATERIALS`: defines comparative gravity, friction, restitution, tint, roughness, and metalness regimes.
- `setWorldMaterial`: applies a world response across arena and test bodies.
- `morphSceneObjects`: samples test positions and rematerializes the population.
- `drivePreStep`: routes the same input into wheel control or material-body impulses.
- `activeBody`: maintains one authoritative target for telemetry, camera, jump, brake, and boost.
- `updateCamera`: follows the active embodiment from a fixed high oblique orthographic view.

## 12. <Validation>

The delivered module script passes JavaScript syntax checking.

A separate JoltPhysics.js 1.0.0 runtime test instantiated and stepped:

- a generalized rectangular tetrahedral soft body;
- soft-body removal, repositioning, re-addition, and velocity transfer;
- an eight-part modular car ragdoll;
- ragdoll removal, repositioning, re-addition, and velocity transfer.

The runtime test completed with `PASS`. A rendered Chromium test could not be completed in the container because its GPU/EGL process could not initialize a WebGL implementation.
