# Golden Triad Prompt Flow

The current HELLO stack has mature golden vehicle examples. WORLD and AI Builder need matching golden examples so the same request is interpreted at the correct domain scale.

## Core Theory

`<same_input>` must not produce the same kind of output in every domain.

```text
<rocky branch> [in HELLO]      -> <rig identity>
<rocky branch> [in WORLD]      -> <rule-bearing arena>
<rocky branch> [in AI Builder] -> <local focal construction>
<rocky branch> [in SAY/DIRECT] -> <mission / actors / objectives>
```

The missing layer is a triad corpus:

```text
<VehicleGolden> [pairs with] <WorldGolden> [pairs with] <BuilderGolden>
```

HELLO already has detailed `<VehicleGolden>` records. WORLD and AI Builder need examples with the same family pressure, not generic primitive placement.

`world-family-prompts.yaml` is the next layer under the triads. It defines what is inside each world family, what AI Builder should build there, and how bots should behave there.

## Prompt Flow

### 1. Shared Router

```xml
<router>
  <input>rocky branch</input>
  <active_domain>HELLO|WORLD|AI_BUILDER|SAY_DIRECT</active_domain>
  <family_match>best golden family by keyword and visual intent</family_match>
  <output>domain-specific prompt context</output>
</router>
```

### 2. HELLO Flow

```xml
<domain_contract>
You are HELLO. Build the player's rig identity.
Do not build terrain, world rules, local structures, or missions.
</domain_contract>

<golden_context>
Use the vehicle golden family as craft pressure.
The rig must have readable silhouette, layered materials, animated life, and functional vehicle identity.
</golden_context>

<output_contract>
Return only function build(g, VG, THREE){ ... return g; }
</output_contract>
```

### 3. WORLD Flow

```xml
<domain_contract>
You are WORLD. Build an entire drivable arena.
Do not make a vehicle. Do not place isolated props.
Make a rule-bearing place with landmark, routes, zones, hazards, atmosphere, and gameplay consequences.
</domain_contract>

<golden_context>
Use the matching world golden family.
Imitate its level of authored composition: central landmark, route grammar, secondary landmarks, visual-only detail, collidable solids, and rules.
</golden_context>

<required_world_brief>
Before code, internally derive:
1. world name
2. central landmark
3. driving routes
4. collision solids
5. visual-only details
6. zones and hazards
7. gameplay rules
8. graph records implied by the build
</required_world_brief>

<output_contract>
Return only function build(w, WG, THREE){ ... return w; }
</output_contract>
```

### 4. AI Builder Flow

```xml
<domain_contract>
You are FIELD SMITH. Build one local focal construction inside the current world.
Do not change sky, global terrain, game mode, or the player's rig.
The result is a previewable DraftGraph that can be committed or canceled.
</domain_contract>

<golden_context>
Use the matching builder golden family.
The build must have base, primary silhouette, secondary readable details, material contrast, and one gameplay affordance.
</golden_context>

<required_builder_brief>
Before code, internally derive:
1. local object name
2. anchor/base
3. primary silhouette
4. secondary details
5. collision solids
6. visual-only details
7. gameplay affordance
</required_builder_brief>

<output_contract>
Return only function build(w, WG, THREE){ ... return w; }
</output_contract>
```

### 5. SAY / DIRECT Flow

```xml
<domain_contract>
You are SAY/DIRECT. Build game apparatus, not geometry-first output.
Use the current world or builder object as a target for missions, actors, objectives, rules, and temporary behaviors.
</domain_contract>

<output_contract>
Return a DirectiveGraph with actors, objectives, zones, triggers, and commit policy.
</output_contract>
```

## Golden Family Triads

| Vehicle Golden | WORLD Golden Should Be | AI Builder Golden Should Be |
| --- | --- | --- |
| `thor` / Mjolnir Runner | storm hammer pass, rune road, lightning gates, wet stone traction | hammer gate, rune battery, cracked anvil shrine |
| `zeus` / Olympus GT | sky-temple switchback, eagle pylons, marble ramps, visibility boost | eagle arch, thunder dais, laurel beacon |
| `raijin` / Taiko Oni | drum-storm alley, oni gates, taiko towers, pulse hazards | taiko gate, oni signal drum, thunder mask totem |
| `tlaloc` / Jade Rain | rain temple causeway, serpent canals, slick jade stone | serpent rain altar, jade cistern, mask fountain |
| `perun` / Oak Hammerfall | oak war ridge, axe gates, shield groves, thunder roots | axe-blade barricade, oak watch post, shield shrine |
| `shango` / Oshe Drumline | red storm courtyard, double-axe lanes, drum fire circles | oshe double-axe gate, talking drum tower |
| `indra` / Airavata Hauler | elephant-cloud road, vajra pylons, monsoon ramps | elephant gate, vajra mast, cloud plinth |
| `leigong` / Thunder Drum Rig | cloud drum runway, wing bridges, bolt cages | thunder drum beacon, winged signal tower |
| `thunderbird` / Sky Piercer | feather canyon, storm perch, painted mesa lanes | feather totem ramp, beak gate, storm perch |
| `ursus` / Ironhide Ursus | bear forest pass, claw rocks, den roads, muffled snow/soil | bear-den barricade, claw-mark monolith, saddle camp |

## Why This Fixes The Quality Gap

HELLO currently succeeds because its few-shot corpus teaches the model to author form. WORLD and AI Builder need equivalent pressure:

```text
<family lore> + <composition brief> + <domain scale> + <certificate law>
```

If WORLD only sees primitive vocabulary, it will make primitive layouts. If AI Builder only sees local bounds, it will make safe chunky objects. The triad corpus teaches each domain how much detail is expected.

## Integration Target

Wire `thunder-golden-triads.js` into:

- `aiForgeWorld()` near the current `GOLDEN_WORLDS.pick(text)` path.
- `aiForgeDraft()` near the current `GOLDEN_DRAFTS.pick(text)` path.

The prompt should include:

```text
matching vehicle golden: what quality level HELLO already achieves
matching world golden: what whole-place composition should achieve
matching builder golden: what local construction should achieve
matching world-family YAML: what landmarks, routes, zones, rules, builder targets, and bot roles belong inside the world
```

Do not replace certificates with prose. Strengthen the prompt first, then later add certificate checks for landmark, route, rule, material variety, and graph richness.

## Domain Context Selection

Do not inject every family into every prompt. Select one family, then select one domain block:

```text
WORLD      -> world_genome + inside_world + world_prompt
AI Builder -> inside_world.builder_targets + ai_builder_prompt
BOTS       -> inside_world.bot_roles + inside_world.routes + inside_world.zones + bot_prompt
SAY/DIRECT -> objectives + actors + zones + triggers derived from the same family
```
