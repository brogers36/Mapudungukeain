/* Remove copyrighted dictionary text from the public parser engine without changing how it parses.
   The engine's gloss tables (GLOSS, GLOSS_VIEW) quote Augusta's digital edition (2019) and Catrileo (1995).
   Parsing reads that wording in a few tests: whether the first word is a Spanish infinitive (isVerbDef and the
   nvFlag feature), the noun/adjective/adverb class of a definition (nvClassOfDef), a leading article, a "▹" or
   "V." cross-reference, and whether a definition exists at all. Each definition is replaced by its shortest
   word prefix that gives every one of those tests the same answer (labels plus usually one word), and Augusta's
   1916 text, OCR'd from the printed original, is added as a separate display field "t". Catrileo entries get
   no display text. The display code is pointed at "t".
   Usage: node clean_motor.js motor.js augusta1916_entries.json OUT_motor.js */
const fs = require('fs'), vm = require('vm'), path = require('path');
const [inp, augf, out] = process.argv.slice(2);
let src = fs.readFileSync(inp, 'utf8');
const AUG = JSON.parse(fs.readFileSync(augf, 'utf8'));
const ctx = { console, atob, btoa }; ctx.globalThis = ctx; ctx.self = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'stub.js'), 'utf8'), ctx);
vm.runInContext(src + '\n;globalThis.__G={GLOSS,GLOSS_VIEW:(typeof GLOSS_VIEW!=="undefined"?GLOSS_VIEW:{})};', ctx);
const { GLOSS, GLOSS_VIEW } = ctx.__G;
// the wording tests, copied from the engine source
function fnSrc(name) { const i = src.indexOf('function ' + name + '('); let d = 0, j = src.indexOf('{', i);
  for (let k = j; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (!d) return src.slice(i, k + 1); } } }
const T = {}; const tctx = { P: { GLOSS }, T }; vm.createContext(tctx);
vm.runInContext(fnSrc('isVerbDef') + ';' + fnSrc('nvClassOfDef') + ';T.isVerbDef=isVerbDef;T.nvClassOfDef=nvClassOfDef;', tctx);
const LAB = /^(?:(?:intr|tr|unitr|refl|comp|Pangui|Huapi|adj|adv|s|n)\.\s*)+/;
function sig(d) {
  d = String(d || '');
  const sv = d.replace(LAB, '');
  return JSON.stringify([!!d, T.isVerbDef(d), T.nvClassOfDef(d), /^(el|la|los|las)\s/i.test(d), /^dem\./i.test(d),
    /^(interrog|adv)\./i.test(d), /^[¿¡]?[A-ZÁÉÍÓÚa-záéíóú]+(ar|er|ir|arse|erse|irse)\b/.test(sv),
    (/▹\s*([^\s,.;]+)/.exec(d) || [])[1] || null]);
}
function stub(d) {
  d = String(d || ''); if (!d) return d;
  const want = sig(d), ws = d.split(/(?<=\s)/);
  const tgt = (/▹\s*([^\s,.;]+)/.exec(d) || [])[1];
  const col = /^([^:.]{0,45}):\s*(.+)$/.exec(d.replace(/^(?:(?:interrog|comp|dem|pron|pers|suf|interj|conj|prep|part|loc|relat|indet|cant|n|adj|adv|v|tr|intr|refl|Bot|Zool|Pangui|Huapi|Imp|fig|t)\.\s*)+/i, ''));
  for (let n = 1; n <= ws.length; n++) {
    const p = ws.slice(0, n).join('').trim();
    const cands = [p];
    if (tgt && !p.includes('▹')) cands.push(p + ' ▹ ' + tgt);
    if (col) { const lab = d.slice(0, d.length - col[0].length); const after = col[2].split(/(?<=\s)/).slice(0, n).join('').trim();
      const w0 = col[1].trim().split(/\s+/)[0];
      for (const pre of ['Uso', 'Uso de', w0, w0 + ' de']) { cands.push((lab + pre + ': ' + after).trim()); if (tgt) cands.push((lab + pre + ': ' + after + ' ▹ ' + tgt).trim()); } }
    for (const c of cands) if (sig(c) === want) return c;
  }
  return d;
}
const t16 = k => { const x = AUG[k]; return x && x.length ? x.join(' ‖ ') : null; };
let nA = 0, nK = 0, nT = 0, nLong = 0;
function cleanTable(tbl) {
  const o = {};
  for (const k of Object.keys(tbl)) {
    const g = tbl[k], e = Object.assign({}, g);
    if (g.src === 'A' || g.src === 'K') {
      // tables are rebuilt in order: stubs of earlier keys must not change later tests that follow "▹" references
      e.d = stub(g.d); delete e.ed;
      if (e.d.split(/\s+/).length > 3) nLong++;
      if (g.src === 'A') { nA++; const t = t16(k); if (t) { e.t = t; nT++; } } else nK++;
    }
    o[k] = e;
  }
  return o;
}
const NG = cleanTable(GLOSS), NV = cleanTable(GLOSS_VIEW);
const lineOf = (name, obj) => (name === 'GLOSS' ? 'const ' : 'var ') + name + '=' + JSON.stringify(obj) + ';';
src = src.replace(/^const GLOSS=.*$/m, () => lineOf('GLOSS', NG)).replace(/^var GLOSS_VIEW=.*$/m, () => lineOf('GLOSS_VIEW', NV));
// display: Augusta 1916 text instead of the stub; no Catrileo or digital-edition badge
const edits = [
  ["\\u2014 ${g.d} <span class=srcbadge>${g.src==='K'?'Catrileo 1995':g.ed==='dig'?", "\\u2014 ${g.t||(ES?'(sin texto)':'(no text)')} <span class=srcbadge>${g.src==='K'?'':g.ed==='dig'?"],
  ['title="${g?g.d.replace(/"/g', 'title="${g?(g.t||g.d).replace(/"/g'],
];
for (const [a, b] of edits) { if (src.split(a).length !== 2) throw new Error('display edit no longer applies: ' + a.slice(0, 50)); src = src.replace(a, b); }
// the meaning composer reads the display text when there is one
const sa = "function senseOf(entry, GLOSS, depth){     if(!entry) return null;     var d=String(entry.d||'');";
const sa2 = src.indexOf("function senseOf(entry, GLOSS, depth){");
if (sa2 < 0) throw new Error('senseOf not found');
src = src.replace(/(function senseOf\(entry, GLOSS, depth\)\{\s*if\(!entry\) return null;\s*var d=String\()entry\.d(\|\|''\);)/, '$1entry.t||entry.d$2');
fs.writeFileSync(out, src);
console.log({ A: nA, K: nK, with1916text: nT, stubsOver3words: nLong, bytes: src.length });
