# THUNDER RIGS · Protocol Kernel v0.3

## 1. <Initial Interpretation>

The immediate objective is not another cosmetic material mode. It is a correct substrate that allows one persistent <rig identity> to remain controllable while its physical embodiment changes among <rigid vehicle>, <hybrid elastic shell>, <powered articulated wreck>, and <soft-body jelly car>.

The same substrate must later provide the immutable source replay consumed by the VERDICT ENGINE. Therefore locomotion, morphing, state observation, and evidence recording are implemented as one fixed-step protocol rather than unrelated game effects.

## 2. <Theory Skeleton>

{world kernel} := {
  <ControlIntent>,
  <ControlFrame>,
  <RigIdentity>,
  <MaterialProfile>,
  <Topology>,
  <LocomotionAdapter>,
  <MorphTransaction>,
  <SupportProbe>,
  <RigSnapshot>,
  <SimulationEvent>,
  <WorldRecord>
}

The central morphisms are:

- [normalize input] : raw keyboard/touch → <ControlIntent>
- [interpret intent] : <ControlIntent> × <Topology> → actuator commands
- [probe support] : <world geometry> × <embodiment state> → grounded confidence
- [integrate physics] : actuator commands × fixed dt → next world state
- [sample state] : active embodiment → topology-independent <RigSnapshot>
- [morph embodiment] : old state × target topology → new embodiment with transferred momentum
- [seal record] : streams + snapshots + hashes → immutable <WorldRecord>

## 3. <Domain Entities>

### <RigIdentity>

`rig-player-01` persists across every morph. The body is replaceable; identity, input sequence, material assignment, state history, and evidence lineage are not.

### <MaterialProfile>

A material defines density, contact parameters, damping, compliance, pressure, fracture threshold, render profile, and sonic profile. It does not define locomotion by itself.

### <Topology>

- `RIGID`: one rigid chassis plus Jolt vehicle constraint.
- `HYBRID`: rigid chassis plus deformable visual shell.
- `ARTICULATED`: eight rigid parts connected by powered swing-twist constraints.
- `SOFT`: tetrahedral pressure-bearing soft body controlled through its vertex velocity field.

### <ControlIntent>

The input contract contains desired planar velocity, heading, throttle, steer, brake, jump, ability, source, sequence, and protocol tick. It contains no wheel, joint, or vertex references.

### <ControlFrame>

A normalized diagnostic frame shared by all topologies: desired forward/up/center, target planar speed, target yaw rate, locomotion phase, and grounded confidence.

## 4. <Operational Description>

### [actuate rigid]

The rigid adapter maps throttle, steer, and braking to Jolt's wheeled vehicle controller. Wheel casts, suspension, differential behavior, and tire contact remain Jolt-managed.

### [actuate articulated]

The articulated adapter is no longer a passive ragdoll pushed through its root.

1. Each part receives a declared mass and contact material.
2. Swing-twist constraints receive frequency-and-damping motors with bounded torque.
3. A persistent `SkeletonPose` is driven through `DriveToPoseUsingMotors` every fixed tick.
4. Static-world support is ray-probed under every part.
5. Planar traction is distributed across supported parts in proportion to mass.
6. Left/right parts receive differential target speeds for steering.
7. The core receives bounded yaw torque.
8. Braking damps every part rather than only the root.
9. Jump and boost are distributed across the active articulated mass.

The result remains loose and destructible while still being intentionally driveable.

### [actuate soft]

The soft adapter is no longer a rigid-body impulse applied to a soft wrapper.

1. Jolt soft-body vertex position and velocity buffers are mapped directly from WASM memory.
2. Each tick derives center of mass, average velocity, orientation, deformation, bottom vertices, and left/right/longitudinal groups.
3. A downward static-world ray resolves the current support surface, including ramps.
4. Contact confidence is calculated from actual bottom vertices near that support surface.
5. Supported vertices receive planar traction toward desired velocity.
6. Left and right vertex groups receive differential traction for steering.
7. Rest-shape error produces a bounded shape-memory velocity correction.
8. When support is weak, a rear-to-front compression wave supplies crawling/slithering locomotion rather than fake ground traction.
9. Pressure changes slightly with speed and ability pulses.
10. Braking damps horizontal velocity across every vertex.

### [probe support]

All non-rigid adapters use the same `probeStaticSupport` service. It casts into Jolt's static object layer and reports hit distance and support height. This removes the earlier hidden assumption that ground is always a horizontal plane at `y = 0`.

### [morph embodiment]

A morph transaction samples position, orientation, linear velocity, and angular velocity before deactivating the source embodiment. The destination embodiment is reconstructed from that normalized state. Returning to a wheeled form rights the chassis but preserves linear motion.

## 5. <Conditions and Invariants>

1. The fixed physics timestep is always `1/60` second.
2. Raw controls are normalized exactly once per protocol tick.
3. No input handler directly addresses wheels, joints, bodies, or vertices.
4. Exactly one primary embodiment is active at a time.
5. Every adapter publishes grounded confidence through the same <ControlFrame> field.
6. Every morph emits `MORPH_REQUESTED` and `MORPH_COMMITTED` events.
7. Every committed morph is followed by a topology-independent state hash.
8. The original source stream is append-only until sealed.
9. A sealed record accepts no further controls or events.
10. Material, topology, and locomotion adapter remain independently represented.

## 6. <State Transitions>

`RIGID ↔ HYBRID ↔ ARTICULATED ↔ SOFT`

Each transition follows:

`ACTIVE_SOURCE → SAMPLE_NORMALIZED_STATE → DEACTIVATE_SOURCE → CONSTRUCT/ACTIVATE_TARGET → TRANSFER_MOMENTUM → HASH → ACTIVE_TARGET`

Protocol record lifecycle:

`OPEN → RECORDING → SNAPSHOT_MARKED* → FINAL_SNAPSHOT → SEALED → EXPORTED`

## 7. <Assumption Ledger>

- The authoritative simulation is single-client and deterministic enough for local replay at this stage.
- FNV-1a hashes are diagnostic integrity markers, not cryptographic signatures.
- The primary static support surface can be found with a downward ray beneath each embodiment region.
- The soft body's rest configuration remains a useful shape-memory reference after ordinary impacts.
- The articulated car should preserve a loose target pose, not a perfectly rigid automotive silhouette.
- The WorldRecord schema remains protocol version `0.2`; the engine implementation is build `v0.3`.

## 8. <Failure Description>

### Failure: articulated rig moves as one dragged lump

Cause: root-only force or motors that are too stiff. Mitigation: distributed support-weighted traction and bounded per-joint motor torque.

### Failure: articulated rig explodes or jitters

Cause: excessive motor frequency/torque or mismatched target root. Mitigation: stabilized ragdoll settings, parent-child collision suppression, damping, and current-root pose anchoring.

### Failure: soft rig accelerates while airborne

Cause: treating geometrically low vertices as grounded. Mitigation: static-world support ray plus vertex-to-support proximity.

### Failure: soft rig loses its recognizable form

Cause: traction without shape memory or pressure. Mitigation: bounded rest-shape correction and pressure control.

### Failure: replay cannot be trusted by the Verdict Engine

Cause: UI-owned truth, non-fixed timing, mutable source stream, or missing lineage. Mitigation: fixed tick, append-only streams, snapshots, state hashes, and final integrity digest.

## 9. <Change Test>

### Add a tracked vehicle

Implement `TRACKED.actuate(intent, dt)` while retaining the same <ControlIntent>, <ControlFrame>, snapshots, hashes, and record format.

### Add cloth or granular topology

Create a new adapter and topology sampler. No changes should be needed in keyboard/touch input, morph transaction framing, or Verdict ingestion.

### Add networked controls

Change `ControlIntent.source` from `HUMAN` to `NETWORK` and preserve ordered sequence numbers. Physics adapters remain unchanged.

### Add a Verdict reconstruction branch

Fork from a declared snapshot and seed. Store altered controls in a branch stream rather than editing the source record.

### Replace FNV with cryptographic sealing

Replace only the hash/digest service. Snapshot, event, and branch semantics remain intact.

## 10. <Implementation and Validation>

The single-file implementation includes:

- normalized fixed-step `ControlIntent` generation;
- rigid, hybrid, articulated, and soft locomotion adapters;
- powered Jolt articulated pose motors;
- per-part support probes and distributed traction;
- direct WASM soft vertex velocity actuation;
- soft support-surface probing, steering fields, shape memory, and pressure;
- morph-safe momentum transfer;
- live adapter, grounded-confidence, tick, and record-state diagnostics;
- active locomotion certification that resets, drives, steers, brakes, and measures every adapter;
- topology-specific displacement thresholds and grounded-confidence results written as `ADAPTER_TEST_RESULT` events;
- manual snapshot controls;
- sealed WorldRecord JSON export;
- schema-valid protocol v0.2 sample record for the future Verdict importer.

Validation performed:

- JavaScript module syntax: passed `node --check`.
- ESLint `no-undef` and `no-redeclare`: passed.
- DOM IDs: no duplicates and no unresolved `$()` references.
- JoltPhysics.js 1.0.0 runtime API harness:
  - powered ragdoll created, motor-driven, force-actuated, and stepped;
  - soft body created, vertex velocity memory written, pressure changed, and stepped;
  - static support ray cast returned the expected floor hit.
- Sample WorldRecord: passed JSON Schema Draft 2020-12 validation against `THUNDER_WORLD_RECORD_SCHEMA_v0.1.json`.

Browser rendering could not be validated inside the build container because Chromium could not initialize EGL/WebGL, including its SwiftShader path. This is an environment limitation rather than a successful visual runtime test; the build should therefore still be exercised in a normal browser through a local HTTP server.

## Verdict Engine boundary

The uploaded Paris Model currently owns its own fixed incident truth and replay simulation. It should not yet become the authority. The next integration step is a read-only WorldRecord importer that replaces its source replay inputs while leaving party branches, claim provenance, comparison, and judgment above that boundary.

## 11. <Locomotion Certification Added in v0.3>

The earlier mode-switch smoke test was insufficient because an embodiment could initialize correctly while still failing to move. The embedded certification now exercises behavior rather than construction:

1. preserve the operator’s normalized state, mode, substance, control source, and inputs;
2. switch the control provenance to `SYSTEM_TEST` and set a neutral RUBBER contact profile without changing topology;
3. reset each embodiment to the same origin and heading;
4. settle under braking;
5. apply forward throttle and a small steering request for a topology-appropriate fixed duration;
6. brake and sample final center of mass;
7. measure planar displacement;
8. compare against an explicit per-topology minimum;
9. emit `ADAPTER_TEST_RESULT` and a labeled snapshot;
10. emit an aggregate `ADAPTER_TEST_SUITE` event and restore the operator’s prior normalized state and momentum.

Current minimum displacement requirements are intentionally modest because they certify controllability rather than balance or final game feel:

- `RIGID`: 0.80 m
- `ARTICULATED`: 0.18 m
- `SOFT`: 0.12 m
- `HYBRID`: 0.80 m

These thresholds belong to the certification layer and can be raised as locomotion tuning matures without changing <ControlIntent>, <WorldRecord>, or the Verdict ingestion contract.

