# THUNDER RIGS — JOLT PHYSICS UPGRADE THEORY

## 1. <Initial Interpretation>

The upgrade must replace visual-only or kinematic approximations with a physics substrate that supports three distinct material regimes without sacrificing driveability:

- <rigid vehicle structure>
- <articulated bodies>
- <elastic bodies>

## 2. <Theory Skeleton>

```text
<PHYSICS_WORLD>
:=
<RIGID_COLLISION_WORLD>
+
<VEHICLE_CONSTRAINT_SYSTEM>
+
<RAGDOLL_CONSTRAINT_SYSTEM>
+
<SOFT_BODY_SYSTEM>
+
<DEFORMABLE_RENDER_SKIN>
```

```text
<PRIMARY_RIG>
:=
<RIGID_SAFETY_CAGE>
+
<SUSPENSION_AND_WHEELS>
+
<ELASTIC_VISIBLE_SKIN>
```

The collision cage remains authoritative. The visible skin may dent and recover without destabilizing steering, mass, or wheel contact.

## 3. <Domain Entities>

- <PHYSICS_WORLD>
- <BODY>
- <STATIC_BODY>
- <DYNAMIC_BODY>
- <SOFT_BODY>
- <VEHICLE>
- <WHEEL>
- <SUSPENSION>
- <RAGDOLL>
- <JOINT>
- <COLLISION_EVENT>
- <DEFORMATION_FIELD>
- <CONTROL_INPUT>

## 4. <Operations>

```text
<CONTROL_INPUT> [drives] <VEHICLE_CONTROLLER>
<VEHICLE_CONTROLLER> [applies] <ENGINE_AND_TIRE_FORCES>
<COLLISION_WORLD> [resolves] <CONTACTS>
<CONTACT_ACCELERATION> [excites] <DEFORMATION_FIELD>
<DEFORMATION_FIELD> [dents-and-recovers] <VISIBLE_SKIN>
<JOINT_LIMITS> [constrain] <RAGDOLL_PARTS>
<COMPLIANCE> [governs] <SOFT_BODY_RECOVERY>
```

## 5. <Conditions>

- A vehicle wheel must query the world through a wheel collision cast.
- A ragdoll limb must remain connected by a bounded swing-twist relation.
- A soft body must retain both edge structure and enclosed volume.
- The visible vehicle skin must never become the authoritative collision shape.
- Physics must advance through bounded timesteps.

## 6. <Invariants>

1. The <PRIMARY_RIG> remains controllable after a visible dent.
2. Static bodies never enter the moving broad-phase layer.
3. Soft-body vertices are rendered from the current Jolt motion state.
4. Parent and child ragdoll parts do not collide directly.
5. Reset restores the vehicle pose and velocities without rebuilding the world.
6. UI input never writes mesh transforms directly; it changes physics inputs.

## 7. <State Transitions>

```text
<RESTING_RIG>
[throttle]
<ACCELERATING_RIG>
[contact]
<IMPACTING_RIG>
[collision resolution]
<PHYSICALLY_STABLE_RIG_WITH_DENTED_SKIN>
[spring recovery]
<RESTORED_SKIN>
```

```text
<SPAWNED_RAGDOLL>
[impulse]
<ARTICULATED_FALL>
[ground contact]
<SETTLED_RAGDOLL>
```

```text
<SOFT_BODY_AT_REST>
[compression]
<DEFORMED_SOFT_BODY>
[edge and volume constraints]
<RECOVERING_SOFT_BODY>
```

## 8. <Assumption Ledger>

- JoltPhysics.js is loaded as a WASM-compatible ECMAScript module.
- Three.js remains the renderer rather than the source of physical truth.
- A static web server is available for reliable module loading.
- The first implementation favors robust vehicle control over permanently destructible chassis topology.
- Elastic vehicle damage is initially reversible; persistent damage can later be stored as a deformation rest-state.

## 9. <Failure Modes>

- <WASM_LOAD_FAILURE>: display a blocking, explicit boot error.
- <WEBGL_FAILURE>: the renderer cannot start; physics code remains syntactically valid but no scene is visible.
- <SOFT_BODY_OVERLOAD>: too many high-resolution compliant bodies reduce frame rate.
- <UNBOUNDED_TIMESTEP>: prevented by fixed 1/60-second stepping and frame-delta clamping.
- <RAGDOLL_SELF_COLLISION>: prevented by disabling parent-child collisions.
- <SKIN_CAGE_DIVERGENCE>: prevented by attaching deformation only to the rendered child mesh.

## 10. <Change Test>

The theory survives these modifications:

- swapping the procedural car mesh for a generated GLTF rig;
- adding persistent dents by changing the skin rest positions;
- adding breakable ragdoll joints through force thresholds;
- replacing cube soft bodies with cloth, tires, or creature tissue;
- synchronizing authoritative rigid-body transforms in multiplayer;
- lowering soft-body lattice resolution on mobile while preserving the same entity model.

## 11. <Implementation Map>

- Jolt broad-phase and object-layer filters: collision authority.
- Jolt wheeled vehicle constraint: suspension, steering, differential, braking, wheel casts.
- Jolt ragdoll settings: capsule parts and swing-twist limits.
- Jolt soft-body shared settings: vertices, edges, tetrahedral volumes, surface faces.
- Three.js buffer deformation: collision-driven vehicle skin response.
- Fixed-step accumulator: deterministic-enough local simulation and stable contact resolution.

## 12. <Validation>

The delivered HTML was checked for JavaScript module syntax. Its Jolt 1.0.0 constructors and stepping paths were separately instantiated for a wheeled vehicle, articulated ragdoll, and compliant soft-body lattice in Node.js.
