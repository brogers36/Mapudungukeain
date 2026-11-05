/* Flag likely OCR misreads among the Mapudungun words of both 1916 volumes.
   A word passes when it is attested in AVENUE, is a dictionary headword, or the parser analyses it into a root the
   dictionary or the parser knows. Everything else goes to a review list ordered by frequency, with the headwords
   (and pages) where it occurs.
   Usage: node flag_mapu.js motor.js stub.js augusta1916_entries.json augusta1916_es.json avenue_words.json
          LO_ES_DIR OUT.json */
const fs = require('fs'), vm = require('vm'), path = require('path');
const [motor, stub, v1f, v2f, avf, lodir, out] = process.argv.slice(2);
const ctx = { console, atob, btoa }; ctx.globalThis = ctx; ctx.self = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(stub, 'utf8'), ctx); vm.runInContext(fs.readFileSync(motor, 'utf8'), ctx);
const M = ctx.MOTOR, GX = M.GX();
const V1 = JSON.parse(fs.readFileSync(v1f, 'utf8')), V2 = JSON.parse(fs.readFileSync(v2f, 'utf8'));
const AV = JSON.parse(fs.readFileSync(avf, 'utf8'));
// Spanish words: every word form in the LibreOffice .dic stems plus the Spanish headwords of volume II
const ES = new Set(Object.keys(V2));
for (const r of ['ES', 'CL']) for (const l of fs.readFileSync(path.join(lodir, 'es_' + r + '.dic'), 'utf8').split('\n').slice(1)) ES.add(l.split('/')[0].toLowerCase());
const VER = new Set(JSON.parse(fs.readFileSync(path.join(path.dirname(v1f), 'augusta1916_verified.json'), 'utf8')));
const HW = new Set(); for (const k of Object.keys(V1)) if (VER.has(k)) for (const w of k.split(/\s+/)) HW.add(w);
const known = r => !!(GX[r] || GX[r + 'n'] || GX[r + 'ün'] || HW.has(r) || HW.has(r + 'n') || HW.has(r + 'ün'));
const SPANISHY = /[jvzxbh]|c(?!h)|qu|gu[eiéí]|[áéíóú]/;
const MAPU = /k|w|ü|tr|ng/;
const seen = new Map();
function scan(vol, hw, text) {
  for (const raw of text.match(/[A-Za-zÁÉÍÓÚÑÜáéíóúñüḻṉṯ]+/g) || []) {
    const w = raw.toLowerCase();
    if (w.length < 3 || ES.has(w) || SPANISHY.test(w) || !MAPU.test(w)) continue;
    // Spanish with an accent the OCR dropped (tratandose = tratándose)
    if ([...w].some((ch, i) => 'aeiou'.includes(ch) && ES.has(w.slice(0, i) + 'áéíóú'['aeiou'.indexOf(ch)] + w.slice(i + 1)))) continue;
    if (/(se|lo|la|le|los|las|les|me|nos)$/.test(w) && [...w.replace(/(se|lo|la|le|los|las|les|me|nos)$/, '')].some((ch, i, arr) => { const b = arr.join(''); return 'aeiou'.includes(ch) && ES.has(b.slice(0, i) + 'áéíóú'['aeiou'.indexOf(ch)] + b.slice(i + 1)); })) continue;
    let s = seen.get(w); if (!s) { s = { n: 0, where: [] }; seen.set(w, s); }
    s.n++; if (s.where.length < 5 && !s.where.some(x => x[1] === hw)) s.where.push([vol, hw]);
  }
}
for (const [h, ts] of Object.entries(V1)) for (const t of ts) scan('I', h, t);
for (const [h, ts] of Object.entries(V2)) for (const t of ts) scan('II', h, t);
let checked = 0, okAv = 0, okHw = 0, okParse = 0; const flagged = [];
for (const [w, s] of seen) {
  checked++;
  if (AV[w]) { okAv++; continue; }
  if (HW.has(w)) { okHw++; continue; }
  let p = null; try { p = M.parse43(w); if (Array.isArray(p)) p = p[0]; } catch (e) {}
  const root = p && String(p.root || '').replace(/\(.*?\)/g, '');
  if (root && known(root) && root.length >= 2 && (p.m || []).length) { okParse++; continue; }
  flagged.push({ w, n: s.n, where: s.where, root: root || null });
}
flagged.sort((a, b) => b.n - a.n);
fs.writeFileSync(out, JSON.stringify(flagged));
const tok = [...seen.values()].reduce((a, s) => a + s.n, 0), ftok = flagged.reduce((a, s) => a + s.n, 0);
console.log({ distinctWords: checked, inAvenue: okAv, headwords: okHw, parsed: okParse, flagged: flagged.length, tokens: tok, flaggedTokens: ftok });
