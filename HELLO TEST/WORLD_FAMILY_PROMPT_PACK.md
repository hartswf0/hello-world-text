# World Family Prompt Pack

This pack extends the golden triad idea into actual prompt material for WORLD, AI Builder, and bots.

The attached WorldImage / WorldModel / WorldText forge implies the missing structure:

```text
<WorldFamily> [contains] <WorldGenome>
<WorldGenome> [contains] <landmarks + routes + zones + rules + camera/control logic>
<WorldFamily> [offers] <BuilderTargets>
<WorldFamily> [conditions] <BotDoctrine>
```

## Why This Exists

HELLO has detailed vehicle goldens. WORLD and AI Builder need equivalent, domain-specific prompt pressure.

Without this layer:

```text
WORLD -> primitive placement
AI Builder -> chunky local object
Bots -> generic chase/attack behavior
```

With this layer:

```text
WORLD -> explorable rule-bearing place
AI Builder -> local authored construction that belongs inside the world
Bots -> actors whose behavior reads the world family
```

## Whole Prompt Flow

```xml
<router>
  <user_text>rocky branch</user_text>
  <active_domain>WORLD|AI_BUILDER|BOTS|SAY_DIRECT</active_domain>
  <family_match>ursus</family_match>
  <family_contract_file>world-family-prompts.yaml</family_contract_file>
</router>
```

### WORLD Prompt

```xml
<role>
You are WORLD. Build an explorable, rule-bearing world, not a pile of props.
</role>

<family_context>
Load the matching YAML family record.
Use world_genome, inside_world, world_prompt, and bot/ecology affordances.
</family_context>

<required_output>
Return a world build function or WorldGraph that includes:
- atmosphere
- central landmark
- routes
- zones
- collidable solids
- visual-only details
- gameplay rules
- graph records
</required_output>

<quality_bar>
Every frame should feel traversable. Every world should imply a larger simulation beyond the camera.
</quality_bar>
```

### AI Builder Prompt

```xml
<role>
You are AI Builder inside WORLD. Build one local construction that belongs to the active world.
</role>

<family_context>
Load ai_builder_prompt and builder_targets from the matching YAML family record.
</family_context>

<required_output>
Return a local draft with:
- anchor/base
- readable silhouette
- secondary details
- material contrast
- collision-safe solids
- visual-only details
- one gameplay affordance
</required_output>

<constraint>
Do not replace the world. Do not change atmosphere. Do not design a vehicle.
</constraint>
```

### Bot Prompt

```xml
<role>
You are Bot Director inside WORLD. Spawn and command bots that understand this world family.
</role>

<family_context>
Load bot_prompt, bot_roles, zones, routes, and rules from the matching YAML family record.
</family_context>

<required_output>
Return a DirectiveGraph:
- actors
- teams
- roles
- patrol routes
- guard targets
- perception rules
- objective hooks
- failure/win conditions
</required_output>

<constraint>
Do not create generic bots. Their behavior must read the world: routes, zones, hazards, landmarks, and material rules.
</constraint>
```

## Example: Rocky Branch

Router:

```yaml
input: rocky branch
family_match: ursus
world: IRONHIDE DEN PASS
builder: CLAW DEN BARRICADE
bots:
  seeker: "sniffs along branch arches and den-road loops"
  ally: "guides player through moss hide zones"
  decoy: "draws seekers toward claw rocks"
```

WORLD should make a forest den pass with fallen branch arches, claw rocks, moss hide zones, and soft traction/noise rules.

AI Builder should make one local fallen branch barricade with claw-mark stones, moss pads, a drive-around gap, and camp detail.

Bots should patrol den routes, check moss zones differently, react to noise on stones, and guard the branch arch or den landmark.

## Integration

Use `world-family-prompts.yaml` as prompt context for:

- `aiForgeWorld(text, imageDataUrl, fix)`
- `aiForgeDraft(text, imageDataUrl, fix)`
- bot command / SAY DIRECT generation

The implementation should select:

```js
const family = GOLDEN_TRIADS.pick(text).id;
const contract = WORLD_FAMILY_PROMPTS[family];
```

Then inject only the needed domain block:

```text
WORLD uses: world_genome + inside_world + world_prompt
AI Builder uses: builder_targets + ai_builder_prompt
Bots use: bot_roles + bot_prompt
SAY/DIRECT uses: objectives + zones + bot roles
```

Do not stuff the entire YAML into every prompt. Retrieve the matching family and the active domain only.
