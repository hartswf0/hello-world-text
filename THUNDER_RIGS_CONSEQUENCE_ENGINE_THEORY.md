# THUNDER RIGS — CONSEQUENCE ENGINE

I will first construct the <theory-of-the-program>, then generate <program text> only after the theory is explicit.

## 1. <Initial Interpretation>

The earlier sandbox treated <material> mostly as a global preset for friction, restitution, gravity, tint, roughness, and metalness. That changes how bodies move, but it does not make an impact persist as history.

The revised program theory is:

```text
<COLLISION>
[produces]
{
  <physical response>,
  <material response>,
  <world trace>,
  <system consequence>,
  <evidence event>
}
```

A collision is incomplete until it has written a durable difference into <world state>.

## 2. <Theory Skeleton>

```text
<CONSEQUENCE_ENGINE>
:=
<CONTACT_LISTENER>
+
<MATERIAL_IDENTITY_PER_BODY>
+
<MATERIAL_PAIR_RESPONSE>
+
<DAMAGE_STATE>
+
<FRACTURE_PIPELINE>
+
<PERSISTENT_TRACE_FIELD>
+
<CONSEQUENCE_LEDGER>
```

```text
<MATERIAL_PAIR>
[determines]
{
  <combined friction>,
  <combined restitution>,
  <damage threshold>,
  <response morphology>
}
```

## 3. <Domain Entities>

- <COLLISION_EVENT>
- <CONTACT_MANIFOLD>
- <RELATIVE_IMPACT_SPEED>
- <BODY_MATERIAL>
- <SURFACE_MATERIAL>
- <MATERIAL_PAIR>
- <INTEGRITY>
- <DAMAGE>
- <DENT>
- <FRACTURE>
- <DEBRIS>
- <SKID_TRACE>
- <RUT>
- <CRACK>
- <SCAR>
- <WORLD_CONSEQUENCE>
- <CONSEQUENCE_LEDGER>
- <MATERIAL_COURSE>

## 4. <Operations>

```text
<CONTACT_LISTENER>
[reads]
{<body A>, <body B>, <normal>, <relative velocity>}
```

```text
{<material A>, <material B>}
[combine-at-contact]
{<friction>, <restitution>}
```

```text
<COLLISION_EVENT>
[classifies]
<DENT | REBOUND | CRUSH | SHATTER | SPLINTER | CRACK | RUT | WOBBLE>
```

```text
<MATERIAL_RESPONSE>
[writes]
{
  <persistent mesh damage>,
  <physical fragments>,
  <ground trace>,
  <ledger entry>
}
```

## 5. <Conditions>

1. Every rigid and soft body owns a material identity.
2. Changing the world surface does not overwrite object materials.
3. Contact callbacks only read physics state and enqueue events.
4. Body destruction, fracture, debris creation, and trace creation occur after the physics step.
5. Fast dynamic bodies use linear-cast motion quality.
6. The vehicle collision cage approximates the chassis, cabin, and nose as a compound shape.
7. Repeated contacts for the same pair are debounced.
8. Fragments cannot recursively fracture.
9. Persistent traces are bounded to avoid unbounded GPU and memory growth.
10. Consequence state can be cleared independently from test bodies.

## 6. <Invariants>

- <surface material> and <object material> remain independent.
- Three.js remains a projection of Jolt state.
- Jolt determines contact and momentum exchange.
- The consequence layer never pretends that a visual material label is an engineering-grade constitutive model.
- A major impact leaves at least one durable world difference.
- The consequence ledger reports what changed and why.
- The playable rig retains accumulated damage until consequence state is cleared.

## 7. <State Transitions>

```text
<INTACT_GLASS>
[impact above threshold]
<SHATTERED_GLASS>
[becomes]
{<fragments>, <crack trace>, <ledger event>}
```

```text
<INTACT_STEEL>
[impact]
<DENTED_STEEL>
[retains]
<permanent rest-shape change>
```

```text
<INTACT_FOAM>
[impact]
<CRUSHED_FOAM>
[retains]
<compressed scale>
```

```text
<MOVING_RIG_ON_ASPHALT>
[brake-or-slide]
<SKID_TRACE>
```

```text
<MOVING_RIG_ON_MUD>
[displaces surface]
<RUT_TRACE>
```

## 8. <Assumption Ledger>

- JoltPhysics.js reports rigid-body contacts through `ContactListenerJS`.
- Relative body velocity is used as a game-scale severity proxy.
- Fracture is authored by material-specific consequence rules; it is not finite-element stress simulation.
- The current build uses procedural fragments rather than mesh-cutting.
- Soft-body contact consequence remains approximate because soft bodies expose simplified body-level velocity.
- The engine is a reconstruction and game instrument, not a certified crash-analysis package.

## 9. <Failure Modes>

- <GLOBAL_MATERIAL_ERASURE>: one world preset overwrites every object material.
- <COSMETIC_ONLY_RESPONSE>: tint changes but physics and state do not.
- <CONTACT_MUTATION>: bodies are created or destroyed inside the contact callback.
- <FRACTURE_STORM>: fragments recursively produce more fragments.
- <RESTING_CONTACT_SPAM>: sustained ground contact floods the ledger.
- <FALSE_ENGINEERING_PRECISION>: labels imply laboratory-calibrated material constants.
- <TRACE_OVERLOAD>: persistent marks grow without bounds.
- <COLLISION_CAGE_MISMATCH>: rendered vehicle extends far beyond its collision shape.

## 10. <Change Test>

The theory survives:

- adding cloth, fluid, granular, magnetic, brittle, or thermal responses;
- making traffic lights, guardrails, signs, windows, and road surfaces destructible;
- converting consequences into courtroom evidence;
- replaying the same wreck across alternative material hypotheses;
- scoring a reconstruction by whether it predicts the observed debris and damage field;
- replacing relative-speed severity with estimated contact impulse;
- replacing procedural fragments with pre-fractured meshes.

## 11. <Implementation Map>

- `bodyMeta`: material and integrity for every body.
- `MATERIALS`: pair-response parameters and consequence type.
- `ContactListenerJS`: captures actual Jolt body contacts.
- `combineContact`: computes pair-specific friction and restitution.
- `processCollisionQueue`: converts contacts into durable world changes.
- `permanentStrikeSkin`: writes permanent deformation into the rig rest shape.
- `fractureRigid`: removes a failed object and creates physical debris.
- `addTrace`: leaves skid, rut, crack, scar, or scuff evidence.
- `materialCourse`: places glass, wood, foam, concrete, rubber, and ice obstacles.
- `WORLD CONSEQUENCE`: reports dents, fractures, traces, debris, and recent impacts.

## 12. <Validation>

- The generated module passes `node --check`.
- The HTML contains one module script and no duplicate element IDs.
- A complete rendered WebGL/WASM browser run could not be verified in the container because headless Chromium did not complete GPU initialization.
