# THUNDERHEAD OpenAI Production Slice

## <Initial Interpretation>

The immediate objective is not to let an LLM run the game. The objective is to make language a safe, dependable asset pipeline:

`player language → server model router → bounded output → Forge/schema validation → deterministic engine state`

This package implements that boundary without replacing Three.js, Jolt, game rules, or multiplayer authority.

## <Theory Skeleton>

- `<PlayerPrompt>` [requests] `<RigSource>`, `<WorldDoc>`, `<ArenaCommands>`, `<RigSpec>`, or `<BotDoctrine>`.
- `<AIGateway>` [selects] the cheapest model adequate for the task.
- `<OpenAIResponse>` [crosses] exactly one validator: FORGE for source code or strict JSON Schema for documents.
- `<CertifiedAsset>` [enters] the deterministic game.
- `<FailureDiagnostic>` [permits] exactly one repair escalation for Forge source.
- `<FallbackAsset>` [keeps] the game playable when AI is absent or fails.

## <Assumption Ledger>

1. Multiplayer remains on the existing `thunder-worker-url` Worker.
2. AI is deployed as a separate Worker and placed in `<meta name="thunder-ai-url">`.
3. The standard OpenAI key exists only as the Worker secret `OPENAI_API_KEY`.
4. GitHub Pages is served from the origin `https://hartswf0.github.io`.
5. The game remains a single HTML artifact; the external AI service is a security boundary, not a build dependency.

## <Operational Description>

The Worker exposes:

- `GET /ai/health`
- `POST /ai/respond`
- `POST /ai/moderate`
- `GET /ai/realtime-token`

Task routing:

| Task | Model | Validation |
|---|---|---|
| `classify` | `gpt-5.4-nano` | strict schema |
| `forge` | `gpt-5.4-mini` | client Forge v2 |
| `forge_repair` | `gpt-5.5` | client Forge v2 |
| `world` | `gpt-5.4-mini` | strict schema |
| `arena` | `gpt-5.4-mini` | strict schema |
| `bot_fort` | `gpt-5.4-mini` | strict schema |
| `rig_spec` | `gpt-5.4-mini` | strict schema |
| `parts` | `gpt-5.4-mini` | strict schema |

The patched HTML defaults to `provider: thunder`. Direct OpenAI/Gemini/Anthropic modes remain only for development and are visibly marked as browser-key modes.

## <State Transitions>

### Rig generation

`IDLE → MODERATING → GENERATING_MINI → FORGE_CERTIFY`

- Success: `FORGE_CERTIFY → CERTIFIED → APPLY_RIG`
- Failure: `FORGE_CERTIFY → DIAGNOSTIC → GENERATING_5_5_REPAIR → FORGE_CERTIFY`
- Second failure: `FORGE_CERTIFY → EXPLICIT_FALLBACK`

### Structured generation

`IDLE → MODERATING → GENERATING → SCHEMA_VALID → ENGINE_CLAMP → APPLY`

No partial model output is applied.

## <Invariants>

1. The OpenAI API key never enters the HTML, localStorage, room messages, or peer documents.
2. A model cannot select an arbitrary model ID; the Worker owns routing.
3. Forge source executes only through `FORGE.compile`.
4. Forge gets at most one model repair attempt.
5. Structured tasks use strict schemas and are still clamped by game code.
6. Ordinary game physics and bot motion remain deterministic.
7. Peer-sourced code still requires the later M4 Worker sandbox before it is a complete security boundary.

## <Failure Description>

- **AI Worker URL missing:** UI reports the gateway as offline; deterministic builders remain available.
- **OpenAI secret missing:** `/ai/health` reports `keyConfigured:false`; generation returns 503.
- **Model refusal or severe moderation category:** request returns a visible 422 error and nothing enters the game.
- **Malformed Forge source:** structured compiler diagnostic is sent once to GPT-5.5.
- **Network failure:** no partial object is committed.
- **Bad origin:** Worker returns 403.
- **Burst abuse:** best-effort per-isolate rate limit returns 429. Replace with a durable Cloudflare rate-limiting product before public scale.

## <Change Test>

- New model: change one entry in `ROUTES`; browser code does not change.
- New structured asset: add one schema and one task name.
- New provider: implement it inside the gateway; do not reintroduce browser secrets.
- New VG feature: bump VG version and rerun Forge golden/adversarial tests.
- Realtime voice: the existing token route can mint `gpt-realtime-2` client secrets without exposing the standard key.

## <Implementation>

### 1. Deploy the AI Worker

```bash
cd worker
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put SAFETY_SALT
npm test
npm run deploy
```

Use a long random value for `SAFETY_SALT`.

### 2. Put the deployed URL into the HTML

At the top of `game/hello-world-004-openai.html`, change:

```html
<meta name="thunder-ai-url" content="">
```

to:

```html
<meta name="thunder-ai-url" content="https://thunderhead-ai.YOUR-SUBDOMAIN.workers.dev">
```

Do not change `thunder-worker-url`; it remains the multiplayer service.

### 3. Confirm the gateway

Open:

```text
https://thunderhead-ai.YOUR-SUBDOMAIN.workers.dev/ai/health
```

Expected essentials:

```json
{
  "ok": true,
  "keyConfigured": true,
  "originPolicyConfigured": true
}
```

### 4. Deploy the HTML

Place `hello-world-004-openai.html` in the GitHub Pages repository, test it on the real HTTPS origin, and then rename it to the desired entry file.

## <Verification>

Run locally:

```bash
cd worker
npm test
node ../forge/forge-conformance.test.mjs
```

Current package validation:

- Worker route/model/schema tests: green
- Forge adversarial conformance: 9/9
- Patched HTML module syntax: green
- Patched HTML classic-script syntax: green
- Worker syntax: green

Real-device acceptance still requires a deployed Worker with an actual OpenAI key, because this package intentionally contains no credential.
