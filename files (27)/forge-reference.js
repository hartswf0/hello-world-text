/* ═══ @module FORGE v2.1 · contract: SPEC §5 · deps: none (THREE, VG injected) ═══
   THUNDERHEAD Forge — the language→geometry compiler.
   Treats every model reply (yours or a peer's) as untrusted source for a tiny
   language whose runtime is VG and whose entry symbol is a parameter: `build` mints rigs, `mode` mints GAMES.
   Pipeline: SANITIZE → S1 WHOLE → S2 FN-SLICE → S3 ASSIGN → (caller: REPAIR → LIBRARY).
   Conformance: forge-conformance.test.mjs must run 9/9 before any edit ships.
   Drop-in (M0): include before the main module; replace extractBuildFn +
   buildVehicleFromCode call sites with FORGE.compile(reply, {THREE, VG}).      */
(function (root, factory) {
  const mod = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = mod;  // Node (conformance)
  else root.FORGE = mod;                                                       // browser
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ── ceilings (SPEC §3) ─────────────────────────────────────────────────────
  const MESH_MAX = 220;          // certify budget
  const CHAIN_MAX = 12;          // POW10: ≤12 chained function decls in S2
  const HEADTAIL = 80;           // diagnostic excerpt length

  // ── Tier-1 shadow (SPEC §5.7) — raises the bar; NOT a boundary. M4 = Worker.
  const SHADOWED = ['window','document','localStorage','sessionStorage','fetch',
    'navigator','XMLHttpRequest','WebSocket','indexedDB','globalThis','self',
    'top','parent','frames','open','importScripts'];

  // ── Stage 1 · SANITIZE: prefer fenced contents; strip BOM/zero-width ──────
  function sanitize(reply) {
    let t = String(reply || '').replace(/\uFEFF|\u200B/g, '');
    const fences = [...t.matchAll(/```(?:[a-zA-Z]*)\n?([\s\S]*?)```/g)].map(m => m[1]);
    if (fences.length) t = fences.join('\n');
    return t.trim();
  }

  // ── scanner: string / template / ${} / comment-aware structural scan ──────
  function jsScan(src) {
    let brace = 0, paren = 0; const events = [];
    let st = 'code'; const tplExpr = [];
    for (let i = 0; i < src.length; i++) {
      const c = src[i], n = src[i + 1];
      if (st === 'code') {
        if (c === '/' && n === '/') { st = 'line'; i++; continue; }
        if (c === '/' && n === '*') { st = 'block'; i++; continue; }
        if (c === "'") { st = 's1'; continue; }
        if (c === '"') { st = 's2'; continue; }
        if (c === '`') { st = 'tpl'; continue; }
        if (c === '{') { brace++; events.push({ i, c, d: brace }); continue; }
        if (c === '}') { brace--; events.push({ i, c, d: brace }); continue; }
        if (c === '(') { paren++; continue; }
        if (c === ')') { paren--; continue; }
      } else if (st === 's1') { if (c === '\\') { i++; continue; } if (c === "'") st = 'code'; }
      else if (st === 's2') { if (c === '\\') { i++; continue; } if (c === '"') st = 'code'; }
      else if (st === 'tpl') {
        if (c === '\\') { i++; continue; }
        if (c === '`') { st = 'code'; continue; }
        if (c === '$' && n === '{') { tplExpr.push(1); st = 'code'; brace++; events.push({ i: i + 1, c: '{', d: brace }); i++; continue; }
      }
      else if (st === 'line') { if (c === '\n') st = 'code'; }
      else if (st === 'block') { if (c === '*' && n === '/') { st = 'code'; i++; } }
      if (st === 'code' && tplExpr.length && c === '}') {
        const last = events[events.length - 1];
        if (last && last.c === '}') { tplExpr.pop(); st = 'tpl'; }
      }
    }
    return { brace, paren, events };
  }

  function balancedBlockEnd(src, from) {
    const scan = jsScan(src);
    let openDepth = -1;
    for (const e of scan.events) {
      if (e.i < from) continue;
      if (e.c === '{' && openDepth < 0) { openDepth = e.d; continue; }
      if (e.c === '}' && openDepth >= 0 && e.d === openDepth - 1) return e.i;
    }
    return -1;
  }

  // ── Stage 3 · strategies (SPEC §5.2) ──────────────────────────────────────
  function stratWhole(t) { return t; }
  function stratSliceFunctions(t) {
    const fi = t.search(/\bfunction\s+[A-Za-z_$]/);
    if (fi < 0) return null;
    let cursor = fi, end = -1;
    for (let guard = 0; guard < CHAIN_MAX; guard++) {
      const e = balancedBlockEnd(t, cursor);
      if (e < 0) break;
      end = e;
      const rest = t.slice(e + 1);
      const m = rest.match(/^\s*(function\s+[A-Za-z_$])/);
      if (!m) break;
      cursor = e + 1 + rest.indexOf(m[1]);
    }
    return end > 0 ? t.slice(fi, end + 1) : null;
  }
  function stratBuildAssignment(t) {
    const m = t.match(/\b(?:const|let|var)?\s*build\s*=\s*(?:async\s*)?\(?/);
    if (!m) return null;
    const start = m.index;
    const e = balancedBlockEnd(t, start);
    if (e < 0) return null;
    let out = t.slice(start, e + 1);
    if (!/^(const|let|var)\b/.test(out)) out = 'const ' + out;
    return out + ';';
  }

  // ── cert helpers ───────────────────────────────────────────────────────────
  function fnv1a(str) { // hex8 content hash (also the overlay-validity key, SPEC §4.3)
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function countMeshes(node) {
    let n = node && node.isMesh ? 1 : 0;
    const kids = (node && node.children) || [];
    for (let i = 0; i < kids.length; i++) n += countMeshes(kids[i]);
    return n;
  }
  function estimateTris(node) {
    let t = 0;
    if (node && node.isMesh && node.geometry) {
      const g = node.geometry;
      const idx = g.index && g.index.count;
      const pos = g.attributes && g.attributes.position && g.attributes.position.count;
      t += Math.floor(((idx != null ? idx : (pos || 0))) / 3);
    }
    const kids = (node && node.children) || [];
    for (let i = 0; i < kids.length; i++) t += estimateTris(kids[i]);
    return t;
  }

  // ── Stage 4 · compile + execute + certify (SPEC §5.3) ─────────────────────
  function execute(code, ctx) {
    const THREE = ctx.THREE, VG = ctx.VG;
    const maxMeshes = ctx.maxMeshes || MESH_MAX;
    const g = new THREE.Group();
    let fn;
    try {
      fn = new Function('g', 'VG', 'THREE', 'Math', ...SHADOWED,
        '"use strict";\n' + code + '\n;if(typeof build==="function"){build(g,VG,THREE);}');
    } catch (e) { return { ok: false, stage: 'compile', err: e.message }; }
    try {
      const t0 = Date.now();
      fn(g, VG, THREE, Math, ...SHADOWED.map(() => undefined));
      const ms = Date.now() - t0;
      const meshes = countMeshes(g);
      if (!meshes) return { ok: false, stage: 'execute', err: 'built zero meshes' };
      if (meshes > maxMeshes) return { ok: false, stage: 'certify', err: 'mesh budget exceeded: ' + meshes + '>' + maxMeshes };
      return { ok: true, group: g, cert: { meshes, tris: estimateTris(g), ms, hash: fnv1a(code) } };
    } catch (e) { return { ok: false, stage: 'execute', err: e.message }; }
  }

  // ── the pipeline (SPEC §5.2) ───────────────────────────────────────────────
  function compile(reply, ctx) {
    const t = sanitize(reply);
    if (!t) return { ok: false, stage: 'sanitize', err: 'empty reply', attempts: [] };
    const attempts = [];
    const strategies = [['whole', stratWhole], ['fn-slice', stratSliceFunctions], ['assign', stratBuildAssignment]];
    for (let s = 0; s < strategies.length; s++) {
      const name = strategies[s][0], strat = strategies[s][1];
      const cand = strat(t);
      if (cand == null) { attempts.push({ strategy: name, err: 'not applicable' }); continue; }
      const r = execute(cand, ctx);
      if (r.ok) return { ok: true, group: r.group, cert: r.cert, strategy: name, code: cand };
      attempts.push({ strategy: name, stage: r.stage, err: r.err });
    }
    const bal = jsScan(t);
    return {
      ok: false, stage: 'all-strategies', attempts,
      diagnostic: {
        braceBalance: bal.brace, parenBalance: bal.paren,
        truncated: bal.brace > 0 || bal.paren > 0,
        head: t.slice(0, HEADTAIL), tail: t.slice(-HEADTAIL),
        chars: t.length
      }
    };
  }

  // ── v2.1 · ENTRY GENERALIZATION (SPEC ADDENDUM §A2) ────────────────────────
  // The Forge's entry symbol is a parameter, not a constant. `build` makes rigs;
  // `mode` makes GAMES. Same sandbox, same budget discipline, same diagnostics.
  function stratEntryAssignment(t, entry) {
    const re = new RegExp('\\b(?:const|let|var)?\\s*' + entry + '\\s*=\\s*(?:async\\s*)?\\(?');
    const m = t.match(re);
    if (!m) return null;
    const start = m.index;
    const e = balancedBlockEnd(t, start);
    if (e < 0) return null;
    let out = t.slice(start, e + 1);
    if (!/^(const|let|var)\b/.test(out)) out = 'const ' + out;
    return out + ';';
  }
  function executeEntry(code, opts) {
    const entry = opts.entry || 'build';
    const argNames = opts.argNames || [];
    const args = opts.args || [];
    const budgetMs = opts.budgetMs || 0;               // measured post-hoc (Tier-1 is not interruptible)
    let fn;
    try {
      fn = new Function('__ret', ...argNames, ...SHADOWED,
        '"use strict";\n' + code +
        '\n;if(typeof ' + entry + '==="function"){__ret.v=' + entry + '(' + argNames.join(',') + ');}');
    } catch (e) { return { ok: false, stage: 'compile', err: e.message }; }
    const __ret = { v: undefined };
    try {
      const t0 = Date.now();
      fn(__ret, ...args, ...SHADOWED.map(() => undefined));
      const ms = Date.now() - t0;
      if (typeof __ret.v === 'undefined')
        return { ok: false, stage: 'execute', err: 'entry "' + entry + '" was not defined or returned undefined' };
      if (budgetMs && ms > budgetMs)
        return { ok: false, stage: 'certify', err: 'time budget exceeded: ' + ms + 'ms>' + budgetMs + 'ms' };
      return { ok: true, value: __ret.v, cert: { ms, hash: fnv1a(code), chars: code.length } };
    } catch (e) { return { ok: false, stage: 'execute', err: e.message }; }
  }
  function compileEntry(reply, opts) {
    opts = opts || {};
    const entry = opts.entry || 'build';
    const validate = opts.validate || (v => (v && typeof v === 'object') ? { ok: true }
      : { ok: false, err: 'entry must return an object' });
    const t = sanitize(reply);
    if (!t) return { ok: false, stage: 'sanitize', err: 'empty reply', attempts: [] };
    const attempts = [];
    const strategies = [
      ['whole', () => t],
      ['fn-slice', () => stratSliceFunctions(t)],
      ['assign', () => stratEntryAssignment(t, entry)],
    ];
    for (const [name, strat] of strategies) {
      const cand = strat();
      if (cand == null) { attempts.push({ strategy: name, err: 'not applicable' }); continue; }
      const r = executeEntry(cand, opts);
      if (!r.ok) { attempts.push({ strategy: name, stage: r.stage, err: r.err }); continue; }
      const val = validate(r.value);
      if (!val.ok) { attempts.push({ strategy: name, stage: 'validate', err: val.err }); continue; }
      return { ok: true, value: r.value, cert: r.cert, strategy: name, code: cand };
    }
    const bal = jsScan(t);
    return { ok: false, stage: 'all-strategies', attempts,
      diagnostic: { braceBalance: bal.brace, parenBalance: bal.paren,
        truncated: bal.brace > 0 || bal.paren > 0,
        head: t.slice(0, HEADTAIL), tail: t.slice(-HEADTAIL), chars: t.length } };
  }

  // ── structured repair prompt (SPEC §5.2 REPAIR) — feed to the 1 retry ─────
  function repairPrompt(fail) {
    const d = (fail && fail.diagnostic) || {};
    const a = (fail && fail.attempts && fail.attempts[0]) || {};
    if (d.truncated) {
      return 'Your previous reply was TRUNCATED (unbalanced: ' +
        (d.braceBalance > 0 ? '{×' + d.braceBalance + ' ' : '') +
        (d.parenBalance > 0 ? '(×' + d.parenBalance : '') +
        ') after ' + (d.chars || '?') + ' chars. Return a COMPLETE function build(g,VG,THREE){...} ' +
        'with FEWER, LARGER meshes so it fits. Only the function. No prose, no markdown.';
    }
    return 'Your previous code failed at stage "' + (a.stage || '?') + '" with: "' +
      String(a.err || '').slice(0, 160) + '". Return a CORRECTED, COMPLETE ' +
      'function build(g,VG,THREE){...} — valid strict-mode JavaScript, all braces/parens ' +
      'balanced, define any helpers INSIDE build. Only the function. No prose, no markdown.';
  }

  return { compile, execute, compileEntry, sanitize, repairPrompt, jsScan, SHADOWED, MESH_MAX, fnv1a };
});
