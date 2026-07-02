import assert from 'node:assert/strict';
import worker from './thunder-ai-worker.js';

const env = {
  OPENAI_API_KEY: 'test-secret',
  ALLOWED_ORIGINS: 'https://hartswf0.github.io',
  SAFETY_SALT: 'test-salt',
};
const originHeaders = { Origin: 'https://hartswf0.github.io', 'X-Thunder-User': 'test-user' };

function req(path, method='GET', body=null) {
  const headers = new Headers(originHeaders);
  if (body !== null) headers.set('Content-Type', 'application/json');
  return new Request(`https://worker.example${path}`, {
    method, headers, body: body === null ? undefined : JSON.stringify(body),
  });
}

async function read(res) { return { status: res.status, json: await res.json() }; }

// Health does not call OpenAI.
{
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('unexpected fetch'); };
  const r = await read(await worker.fetch(req('/ai/health'), env));
  assert.equal(r.status, 200);
  assert.equal(r.json.models.forge, 'gpt-5.4-mini');
  assert.equal(r.json.models.forge_repair, 'gpt-5.5');
  globalThis.fetch = oldFetch;
}

async function runGeneration(task, responseText='READY') {
  const calls = [];
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url: String(url), body, headers: init.headers });
    if (String(url).endsWith('/moderations')) {
      return new Response(JSON.stringify({ results: [{ flagged:false, categories:{}, category_scores:{} }] }), { status:200 });
    }
    return new Response(JSON.stringify({ id:'resp_test', output_text:responseText, usage:{ input_tokens:10, output_tokens:5 } }), { status:200 });
  };
  const result = await read(await worker.fetch(req('/ai/respond', 'POST', {
    task,
    prompt:'build a thunder moose',
    system:'Return the requested bounded asset.',
    maxOutputTokens:99999,
  }), env));
  globalThis.fetch = oldFetch;
  return { result, calls };
}

{
  const { result, calls } = await runGeneration('forge', 'function build(g,VG,THREE){g.add(VG.box(1,1,1,VG.paint(0xffffff)));}');
  assert.equal(result.status, 200);
  assert.equal(result.json.model, 'gpt-5.4-mini');
  assert.equal(calls.length, 2);
  assert.equal(calls[1].body.model, 'gpt-5.4-mini');
  assert.equal(calls[1].body.max_output_tokens, 12000);
  assert.equal(calls[1].body.text, undefined);
}

{
  const { result, calls } = await runGeneration('forge_repair', 'function build(g,VG,THREE){g.add(VG.box(1,1,1,VG.paint(0xffffff)));}');
  assert.equal(result.status, 200);
  assert.equal(result.json.model, 'gpt-5.5');
  assert.equal(calls[1].body.reasoning.effort, 'medium');
}

{
  const world = JSON.stringify({ name:'REEF', sky:'#000000', fog:'#001122', ground:'#113355', structures:[] });
  const { calls } = await runGeneration('world', world);
  assert.equal(calls[1].body.text.format.type, 'json_schema');
  assert.equal(calls[1].body.text.format.strict, true);
  assert.equal(calls[1].body.text.format.name, 'thunder_world');
}

// Severe moderation category blocks before generation.
{
  let calls = 0;
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls++;
    assert.ok(String(url).endsWith('/moderations'));
    return new Response(JSON.stringify({ results: [{ flagged:true, categories:{ 'sexual/minors':true }, category_scores:{} }] }), { status:200 });
  };
  const result = await read(await worker.fetch(req('/ai/respond', 'POST', {
    task:'forge', prompt:'bad prompt', system:'bounded system',
  }), env));
  globalThis.fetch = oldFetch;
  assert.equal(result.status, 422);
  assert.equal(result.json.error, 'PROMPT_BLOCKED');
  assert.equal(calls, 1);
}

// Unknown task is rejected without OpenAI traffic.
{
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('unexpected fetch'); };
  const result = await read(await worker.fetch(req('/ai/respond', 'POST', {
    task:'unbounded', prompt:'x', system:'y',
  }), env));
  globalThis.fetch = oldFetch;
  assert.equal(result.status, 400);
  assert.equal(result.json.error, 'UNKNOWN_TASK');
}

console.log('THUNDER AI WORKER: all tests passed');
