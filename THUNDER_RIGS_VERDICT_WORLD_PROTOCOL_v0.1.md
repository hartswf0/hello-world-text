# THUNDER RIGS → VERDICT ENGINE
## World, Embodiment, Evidence, and Branch Protocol v0.1

**Status:** Theory-first protocol. No implementation patch should precede these contracts.

---

## 1. <Initial Interpretation>

The present failure is not primarily that the ragdoll and jelly forces are too weak. The failure is that the program assumes every <embodiment> can be driven through the same [apply impulse to one body] operation.

That assumption is false.

A wheeled car, an articulated wreck, and a deformable gel body have different controllable degrees of freedom. They can share one player intention, but they cannot share one actuator.

The larger project also requires a second separation:

- <THUNDER RIGS> is the authoritative world simulator.
- <VERDICT ENGINE> is an evidence, reconstruction, argument, and judgment system.
- <VERDICT ENGINE> must consume a sealed simulation record rather than contain its own hidden version of the accident truth.

The correct chain is:

`<input intention> → [normalize] → <control intent> → [embodiment adapter] → <physical actuation> → <world consequence> → [record] → <evidence trace> → [branch] → <claim> → <verdict>`

---

## 2. <Theory Skeleton>

### 2.1 Core entities

- <world>: the authoritative Jolt simulation and its fixed clock.
- <rig identity>: the persistent identity that survives material and topology changes.
- <embodiment>: the current physical realization of a rig.
- <topology>: RIGID, ARTICULATED, SOFT, or HYBRID.
- <material profile>: density, friction, restitution, compliance, damping, pressure, fracture, sound, and rendering parameters.
- <control frame>: a non-colliding reference frame containing desired heading, desired planar velocity, and desired posture.
- <control intent>: normalized player or agent intention independent of embodiment.
- <actuator adapter>: the embodiment-specific transformation from control intent into physical forces, torques, motor targets, pressure changes, or vertex velocities.
- <sensor>: an observer of the world that emits measurements, not truth claims.
- <event>: an immutable occurrence tied to a simulation tick.
- <snapshot>: a restorable world state at a defined tick.
- <branch>: a reconstruction fork created from a snapshot.
- <claim>: a proposition linked to evidence IDs, a time range, and an epistemic class.
- <record>: the sealed source of replay, evidence, provenance, and branch ancestry.

### 2.2 Structured groups

{topologies} := {RIGID, ARTICULATED, SOFT, HYBRID}

{epistemic classes} := {OBSERVED, INFERRED, HYPOTHETICAL, FABRICATED}

{authoritative event classes} := {
CONTROL_INTENT,
MORPH_REQUESTED,
MORPH_COMMITTED,
MATERIAL_CHANGED,
CONTACT_BEGIN,
CONTACT_END,
IMPACT,
DEFORMATION,
JOINT_LIMIT,
SENSOR_SAMPLE,
STATE_HASH,
SNAPSHOT_CREATED,
BRANCH_CREATED
}

### 2.3 Core morphisms

- [interpret input]: <raw controls> → <control intent>
- [actuate rigid]: <control intent> → <wheel engine steering brake forces>
- [actuate articulated]: <control intent> → <joint motor targets + distributed contact traction>
- [actuate soft]: <control intent> → <vertex-field forces + pressure/shape targets>
- [sample embodiment]: <embodiment> → <normalized rig snapshot>
- [morph]: <normalized rig snapshot + target topology + target material> → <new embodiment>
- [observe]: <world state> → <sensor measurement>
- [record]: <world transition> → <immutable event>
- [branch]: <sealed snapshot + declared changes> → <reconstruction world>
- [support]: <evidence references> → <claim support graph>

---

## 3. <Critical Separation: Material Is Not Topology>

The previous build binds GEL to JELLY and SCRAP to RAGDOLL. That is convenient for a demo but wrong for a general testing protocol.

The corrected model makes three dimensions orthogonal:

1. <topology> — how the body is connected.
2. <material profile> — how the body responds physically.
3. <locomotion profile> — how intention becomes motion.

Examples:

- a <steel articulated car> is jointed but stiff and heavy;
- a <rubber articulated car> is jointed and highly rebounding;
- a <foam soft car> is deformable and slow to recover;
- an <ice rigid car> is stiff with low traction;
- a <gel soft car> is pressure-supported and highly compliant.

A named preset may choose all three dimensions, but the protocol must store them separately.

**Invariant:** changing the visible material must modify the actual collision bodies, constraints, masses, compliance, and contact response. A shader-only change is not a material transformation.

---

## 4. <Universal Control Protocol>

### 4.1 <ControlIntent>

Every player, bot, replay, or remote client produces the same normalized intent:

```text
<ControlIntent> := {
  tick,
  rig_id,
  desired_planar_velocity: [x, z],
  desired_heading,
  throttle: [-1, 1],
  steer: [-1, 1],
  brake: [0, 1],
  jump: boolean,
  ability: boolean,
  source: HUMAN | BOT | REPLAY | NETWORK,
  sequence
}
```

The intent does not mention wheels, vertices, joints, or a particular physics body.

### 4.2 <ControlFrame>

The <control frame> persists while the body collapses, bends, or changes topology. It contains:

- desired forward direction;
- desired up direction;
- desired center path;
- target planar speed;
- target yaw rate;
- current locomotion phase;
- grounded confidence.

The control frame is not a hidden car and does not collide. It is a target used by physical actuators.

### 4.3 [Actuate before step]

All embodiment adapters execute before the fixed physics step.

No adapter may teleport the body during ordinary driving.

No renderer, audio system, UI component, or LLM may write physical state directly.

---

## 5. <Embodiment Adapters>

### 5.1 <RigidVehicleAdapter>

**Physical form:** one principal rigid chassis plus Jolt vehicle constraint and wheels.

[actuate rigid] performs:

- engine torque from throttle;
- steering angle from steer;
- service brake and hand brake from brake state;
- optional airborne stabilization torque;
- traction and power limits from the material profile.

This remains the reference adapter because it has a clear forward axis and wheel contacts.

### 5.2 <ArticulatedRigAdapter>

**Physical form:** multiple rigid parts connected by powered constraints.

The current generic root impulse must be removed. An articulated rig is driven by two cooperating systems:

#### A. [pose motor]

- assigns a target relative orientation to each joint;
- uses constraint motors to maintain a recognizable car pose without making it rigid;
- changes motor strength, damping, and allowed angle from the material profile;
- weakens on strong impacts so the rig can genuinely collapse;
- recovers gradually rather than snapping back.

#### B. [distributed traction]

- detects which parts are in usable ground contact;
- divides the requested drive force across those parts;
- applies left/right differential force to create yaw;
- applies counter-torque to the core to reduce uncontrolled tumbling;
- applies braking as velocity damping across every part, not an instantaneous zeroing of the whole ragdoll.

The articulated car therefore moves as a scrambling, flopping, self-righting vehicle. It remains a real ragdoll because every visible part is physically simulated and the controller acts only through forces and powered constraints.

### 5.3 <SoftRigAdapter>

**Physical form:** one Jolt soft body with tetrahedral volume constraints, pressure, and writable per-vertex state.

The soft car must not be controlled by treating its wrapper <Body> as an ordinary rigid chassis.

The adapter must calculate from the soft vertices:

- center of mass;
- mean linear velocity;
- principal forward and lateral axes;
- contact vertex set;
- left, right, front, rear, top, and bottom vertex groups;
- deformation ratio and volume ratio.

[actuate soft] performs:

#### A. [surface traction]

Apply propulsion mainly to bottom/contact vertices. Force magnitude is distributed by inverse mass and contact confidence.

#### B. [steer by differential traction]

Apply stronger forward traction on one side and weaker or reverse traction on the other side. This creates a physical yaw moment rather than rotating the soft body directly.

#### C. [shape-drive wave]

For low-contact states, create a traveling compression pattern from rear to front. The body should squish, release, and roll/ooze forward.

#### D. [shape memory]

Use pressure, compliance, damping, and optional skin constraints to bias the body toward a car-like rest form. Shape memory is weaker for gel and stronger for foam/rubber.

#### E. [soft braking]

Damp horizontal velocity per vertex while preserving vertical collision motion. Never freeze every vertex abruptly.

The jelly car should feel like driving a physical substance, not like a rigid car hidden inside a jelly shader.

### 5.4 <HybridRigAdapter>

A hybrid embodiment is permitted only when declared explicitly. It combines:

- a reduced rigid or articulated internal cage;
- a deformable external body;
- two-way coupling;
- a declared split between structural and visible mass.

A hybrid may be useful for high-speed gameplay, but it must never be labeled as a pure soft body in evidence records.

---

## 6. <Normalized Rig State and Morph Protocol>

### 6.1 <RigSnapshot>

```text
<RigSnapshot> := {
  protocol_version,
  tick,
  rig_id,
  topology,
  material_id,
  control_frame,
  center_of_mass,
  orientation_basis,
  linear_momentum,
  angular_momentum,
  kinetic_energy,
  bounds,
  contact_summary,
  deformation_summary,
  damage_state,
  actuator_state,
  random_seed,
  source_event_id
}
```

### 6.2 [Morph transaction]

A morph is an atomic transaction:

1. [request morph] records target topology and material.
2. [finish current step] prevents a half-step body replacement.
3. [sample aggregate state] computes the normalized snapshot from the whole embodiment.
4. [deactivate source] removes source constraints and bodies from the world.
5. [instantiate target] creates the new topology and applies the real material profile.
6. [project state] conserves center position and linear momentum; approximates angular momentum and energy within declared limits.
7. [settle target] performs bounded collision-safe initialization without advancing evidence time.
8. [commit morph] emits MORPH_COMMITTED with before/after hashes.
9. [resume] routes the next ControlIntent to the new adapter.

**Invariant:** a ragdoll snapshot is derived from all parts, not the root part.

**Invariant:** a soft-body snapshot is derived from all vertices, not the wrapper body transform alone.

---

## 7. <World Record Protocol>

### 7.1 Fixed simulation clock

- physics tick: fixed 60 Hz;
- event time: integer tick plus optional substep index;
- presentation time: separate and non-authoritative;
- all controls are sequence-numbered and applied at tick boundaries;
- every spawned entity receives a persistent stable ID;
- all randomness is seeded and recorded.

### 7.2 <WorldRecord>

```text
<WorldRecord> := {
  header: {
    protocol_version,
    engine_build,
    case_id,
    fixed_dt,
    seed,
    world_hash,
    created_at
  },
  entity_manifest,
  material_manifest,
  sensor_manifest,
  initial_snapshot,
  control_stream,
  event_stream,
  periodic_snapshots,
  state_hashes,
  branch_manifest,
  integrity_digest
}
```

### 7.3 Authoritative versus derived data

**Authoritative:** controls, body/vertex state, contacts, collisions, morphs, sensor raw samples, snapshots, and hashes.

**Derived:** estimated speed, fault attribution, inferred visibility, reconstructed intention, and legal or rhetorical conclusions.

The record must never store a derived interpretation as though it were a raw observation.

### 7.4 Non-authoritative subscribers

{rendering, sound, particles, satisfaction meter, narration, UI, analytics} subscribe to events but cannot change physics.

Sound is generated from IMPACT, DEFORMATION, JOINT_LIMIT, MATERIAL_CHANGED, and velocity events. Sound never becomes the collision detector.

---

## 8. <Sensor and Evidence Protocol>

The future self-driving wreck world should expose sensor channels as explicit observers:

{camera, lidar, radar, GNSS, IMU, wheel odometry, control bus, vehicle diagnostics, environmental sensors}

Each <SensorSample> contains:

```text
<SensorSample> := {
  event_id,
  tick,
  sensor_id,
  sensor_type,
  frame_id,
  raw_payload,
  units,
  calibration_id,
  noise_profile_id,
  latency_ticks,
  visibility_mask,
  source_world_hash
}
```

A sensor may be incomplete, noisy, delayed, occluded, or faulty. It may not silently access omniscient world truth.

### 8.1 Epistemic classification

- OBSERVED: directly linked to one or more raw sensor samples or source replay frames.
- INFERRED: calculated from observed evidence with an identified method and uncertainty.
- HYPOTHETICAL: produced by a declared branch that changes one or more source conditions.
- FABRICATED: lacks a valid evidence or branch lineage.

### 8.2 <Claim>

```text
<Claim> := {
  claim_id,
  party_id,
  text,
  epistemic_class,
  evidence_event_ids,
  time_range,
  branch_id,
  inference_method,
  uncertainty,
  created_at,
  author
}
```

The classification is computed from lineage, not selected solely by a button.

---

## 9. <Verdict Engine Handoff>

The Verdict Engine should no longer define accident truth as a private JavaScript constant or directly own the authoritative physics replay.

It should load a sealed <WorldRecord> and create three views:

1. <SOURCE REPLAY> — immutable playback of the sealed record.
2. <PARTY BRANCH> — a declared reconstruction fork from a source snapshot.
3. <MODEL OVERLAY> — visual and numerical comparison between source and branches.

### 9.1 [Create reconstruction]

A party reconstruction must:

1. select a source snapshot;
2. declare changed parameters;
3. create a branch ID;
4. replay from the snapshot under the same protocol;
5. record all differences from source;
6. expose branch ancestry in every claim.

### 9.2 [Score argument]

A verdict score should compare:

- evidence coverage;
- temporal alignment;
- physical consistency;
- sensor consistency;
- branch minimality;
- provenance honesty;
- uncertainty disclosure;
- challenge success.

The AI judge may summarize these measures. It may not invent hidden measurements or alter the source record.

---

## 10. <Invariants>

1. Every active embodiment is controllable through <ControlIntent>.
2. Every embodiment has its own actuator adapter.
3. The adapter acts through physics, never ordinary-motion teleportation.
4. <material>, <topology>, and <locomotion> are separate fields.
5. A material change alters actual physical parameters.
6. Morphing preserves persistent <rig identity>.
7. Morphing samples aggregate momentum from the whole embodiment.
8. The physics clock is fixed and authoritative.
9. Audio and rendering are event subscribers only.
10. Source replay is immutable.
11. Reconstructions are branches, never edits to source.
12. Every OBSERVED claim has sensor or replay lineage.
13. Every INFERRED claim identifies a method and uncertainty.
14. Every HYPOTHETICAL claim identifies a branch.
15. The LLM never runs inside the physics step.
16. The world record can be replayed without the original UI.
17. The Verdict Engine can operate on a record produced by another compatible simulator.

---

## 11. <Failure Description>

### Existing jelly failure

- [apply impulse] targets the soft wrapper as though it were a rigid center of mass;
- steering does not act on left/right vertex groups;
- soft-body movement is not calculated from vertex state;
- there is no traction/contact vertex protocol;
- there is no pressure or shape-memory actuation cycle.

### Existing ragdoll failure

- only the core part is treated as the active body;
- a generic world-space impulse does not establish a stable forward axis;
- no powered joint pose exists;
- no ground-contact set distributes traction;
- steering has no differential force or torque model;
- braking zeroes or damps the wrong abstraction.

### Existing Verdict Engine failure

- fixed truth values are embedded in the interface;
- replay, reconstruction, evidence classification, and judgment are coupled in one runtime;
- claims do not reference immutable event IDs;
- party models are parameter objects rather than replayable branches;
- the source world cannot be independently verified or reproduced.

---

## 12. <State Transition Map>

```text
UNSPAWNED
  → [instantiate]
ACTIVE_RIGID | ACTIVE_ARTICULATED | ACTIVE_SOFT | ACTIVE_HYBRID
  → [receive ControlIntent]
ACTUATING
  → [fixed physics step]
SIMULATED
  → [emit events + sensor samples]
RECORDED
  → [continue]
ACTIVE_*

ACTIVE_*
  → [request morph]
MORPH_PENDING
  → [sample normalized snapshot]
SOURCE_STOWED
  → [instantiate target]
TARGET_SETTLING
  → [commit hashes]
ACTIVE_TARGET

SEALED_SOURCE
  → [select snapshot + declare changes]
BRANCH_CREATED
  → [simulate]
RECONSTRUCTION_RECORDED
  → [attach evidence]
CLAIMED
  → [challenge]
RULED
  → [score]
VERDICT
```

---

## 13. <Acceptance Tests>

### Locomotion tests

- RIGID, ARTICULATED, SOFT, and HYBRID each travel ten meters under the same forward ControlIntent.
- Each topology visibly responds differently while reaching the intended general direction.
- Each topology can steer left and right from rest.
- Each topology can brake without teleporting or instantly freezing.
- ARTICULATED movement continues after losing one non-core part.
- SOFT movement continues after a major deformation and recovers according to material compliance.

### Morph tests

- morph at rest;
- morph at speed;
- morph in midair;
- morph while contacting two objects;
- morph after deformation;
- morph after ragdoll collapse;
- round-trip RIGID → SOFT → ARTICULATED → RIGID preserves identity and approximately preserves momentum.

### Record tests

- identical input stream and seed produce matching state hashes;
- a source record replays without the original UI;
- audio disabled versus enabled produces identical physics hashes;
- a branch lists every changed parameter;
- an OBSERVED claim without evidence lineage is rejected;
- a HYPOTHETICAL claim without a branch ID is rejected;
- the Verdict Engine cannot mutate the sealed source.

---

## 14. <Implementation Order>

### Phase 1 — Protocol kernel

- implement ControlIntent;
- implement fixed-step command queue;
- implement stable entity IDs;
- implement event stream and state hashes;
- implement RigSnapshot and adapter interface.

### Phase 2 — Correct locomotion

- retain and wrap the rigid vehicle adapter;
- rebuild ragdoll as a powered articulated rig with contact traction;
- rebuild jelly around per-vertex state, contact groups, and shape-drive actuation;
- add adapter-level diagnostic overlays.

### Phase 3 — Morph transactions

- aggregate state sampling;
- topology-independent momentum transfer;
- atomic morph commit;
- rollback on failed target creation.

### Phase 4 — Evidence world

- sensor observers;
- raw versus derived evidence separation;
- deterministic snapshots;
- exportable sealed WorldRecord.

### Phase 5 — Verdict integration

- remove private fixed TRUTH from the Verdict Engine;
- import WorldRecord;
- render immutable source replay;
- create declared reconstruction branches;
- bind claims to events and sensor samples;
- score provenance and physical consistency.

---

## 15. <Change Test>

The theory survives these future changes:

- replacing Jolt with another engine, because Verdict consumes the protocol rather than Jolt objects;
- adding liquid, cloth, granular, magnetic, or brittle topology adapters;
- adding autonomous vehicles, because bots emit the same ControlIntent as humans;
- adding multiplayer, because control commands are sequence-numbered and tick-bound;
- adding LLM prompting, because prompts compile into declarative operations outside the physics step;
- adding legal cases beyond car wrecks, because evidence and branches are entity-independent;
- adding uncertainty and sensor failure, because sensor samples are explicitly partial and calibrated;
- adding sonic material behavior, because audio remains an event subscriber.

---

## 16. <Program Text Boundary>

The next program text should not merely increase impulse constants.

It should first introduce the protocol kernel and adapter boundary, then replace the ragdoll and jelly controllers behind that boundary. Only after the source world produces a sealed WorldRecord should the Verdict Engine be connected to it.
