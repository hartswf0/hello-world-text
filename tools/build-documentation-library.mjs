import { readFileSync, writeFileSync } from 'node:fs';
import { relative } from 'node:path';

const root = new URL('../', import.meta.url);

const paths = [
  'hello-world-004-openai-8-fusion-pack/README.md',
  'hello-world-004-openai-8-fusion-pack/MASTER_PROMPT.md',
  'hello-world-004-openai-8-fusion-pack/FABLE5_TOKEN_EFFICIENT_PROMPT.md',
  'hello-world-004-openai-8-fusion-pack/SNIPPET_EVIDENCE_INDEX.md',
  'hello-world-004-openai-8-fusion-pack/FILE_MANIFEST.json',
  'hello-world-004-openai-8-fusion-pack/INFORMATION_ARCHITECTURE.md',
  'hello-world-004-openai-8-fusion-pack/WORLD_TEXT_LANGUAGE.md',
  'hello-world-004-openai-8-fusion-pack/BASE_STANDARDIZATION_BLUEPRINT.md',
  'hello-world-004-openai-8-fusion-pack/SUBSTRATES_AND_SURFACES.md',
  'hello-world-004-openai-8-fusion-pack/CORE_RISK_MAP.md',
  'hello-world-004-openai-8-fusion-pack/INTEGRATION_BACKLOG.md',
  'HELLO TEST/GOLDEN_TRIAD_PROMPT_FLOW.md',
  'HELLO TEST/WORLD_FAMILY_PROMPT_PACK.md',
  'HELLO TEST/world-family-prompts.yaml',
  'THUNDER_RIGS_ENGINE_SPEC.md',
  'THUNDER_RIGS_CONSEQUENCE_ENGINE_THEORY.md',
  'THUNDER_RIGS_CONSEQUENCE_FILM_STUDIO_THEORY.md',
  'THUNDER_RIGS_JOLT_PHYSICS_THEORY.md',
  'THUNDER_RIGS_MATERIAL_MORPH_THEORY.md',
  'THUNDER_RIGS_PROTOCOL_KERNEL_v0.3_BUNDLE (1)/THUNDER_RIGS_PROTOCOL_KERNEL_v0.3.md',
  'THUNDER_RIGS_VERDICT_WORLD_PROTOCOL_v0.1.md',
  'THUNDER_RIGS_VERDICT_WORLD_v1.0_FULL_BUNDLE/THUNDER_RIGS_VERDICT_WORLD_v1.0_README.md',
  'THUNDER_RIGS_WRECK_DIRECTOR_COMPILER_THEORY.md',
  'THUNDER_RIGS_WRECK_OP_FORECAST_THEORY.md',
  'THUNDER_RIGS_WRECK_RALLY_OFFLINE_THEORY.md',
  'THUNDER_RIGS_WRECK_RECALL_GAME_THEORY.md',
  'OP-14.md',
  'avis_h2owis_cineosis_film.md',
  'files (22)/THUNDER_RIGS_ENGINE_SPEC_v2.md',
  'files (26)/OP-14.md',
  'files (27)/GAME_FORGE_ADDENDUM.md',
  'thunderhead-openai-production/THUNDER_OPENAI_DEPLOY.md',
  'thunderhead-openai-production/spec/THUNDER_RIGS_ENGINE_SPEC_v2.md',
  'README(1).txt',
  'COLLISION_TRACE_JOLT_3D/README.txt',
  'COLLISION_TRACE_JOLT_3D 2/README.txt'
];

const docs = Object.fromEntries(paths.map(path => {
  const fileUrl = new URL(path, root);
  return [path, {
    path,
    title: titleFromPath(path),
    type: path.split('.').pop().toLowerCase(),
    text: readFileSync(fileUrl, 'utf8')
  }];
}));

const out = [
  '(globalThis.window || globalThis).DOCUMENTATION_LIBRARY = ',
  JSON.stringify({ generatedAt: new Date().toISOString(), docs }, null, 2),
  ';\n'
].join('');

writeFileSync(new URL('../DOCUMENTATION_LIBRARY.js', import.meta.url), out);
console.log(`Wrote ${relative(process.cwd(), new URL('../DOCUMENTATION_LIBRARY.js', import.meta.url).pathname)} with ${paths.length} documents.`);

function titleFromPath(path) {
  const file = path.split('/').pop() || path;
  return file
    .replace(/\.(md|txt|ya?ml|json)$/i, '')
    .replace(/\s\(\d+\)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bJolt\b/g, 'JOLT')
    .replace(/\bJson\b/g, 'JSON')
    .replace(/\bYaml\b/g, 'YAML');
}
