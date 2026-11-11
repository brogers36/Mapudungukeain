/* Runs the morphological parser off the main thread. Message in: {id, word, sys:'uni'|'azu'|'rag', prev};
   prev is the word before it in a phrase (tañi tremoleken: after a possessive the -n form is the nominaliser);
   message out: {id, r:{root, morphs, gl, wclass, mean, who}} or r:null. */
importScripts('stub.js', 'motor.js');
const SYS = {uni: 'unificado', azu: 'azumchefe', rag: 'ragileo'};
onmessage = ev => {
  const {id, word, sys, prev} = ev.data; let r = null;
  try {
    const M = self.MOTOR; let w = String(word).toLowerCase().trim();
    if (M.ORTHO && sys && sys !== 'uni') { try { w = M.ORTHO.toUnificado(w, SYS[sys]).text; } catch (e) {} }
    /* No Mapudungun verb ends in r: a word ending in r with nothing after it (cantar, enseñar, tomar) is a Spanish
       infinitive, not a loan root plus interruptive -r-, so it gets no analysis (analyst ruling 2026-11-07).
       Material after the r (enseñar-ün) is still parsed. */
    if (/r$/.test(w)) { postMessage({id, r: null}); return; }
    let p = M.parse43(w, '', 3, false);
    if (p && !p.nvRule) { const c = M.inferCat(p.root); if (c) { const p2 = M.parse43(w, c, 3, false); if (p2 && !p2.nvRule) p = p2; } }
    if (p && p.root && prev && M.contextResolve) { try { let pv = String(prev).toLowerCase().trim(); if (M.ORTHO && sys && sys !== 'uni') { try { pv = M.ORTHO.toUnificado(pv, SYS[sys]).text; } catch (e) {} } p = M.contextResolve([pv, w], [null, p])[1] || p; } catch (e) {} }
    if (p && p.root) {
      let mean = null, en = null, who = null, two = false;
      if (p.wclass === 'verb' && M.MEANING) { try { const X = M.MEANING.compose(p, M.GX()); if (X && X.ok) { mean = X.sentence; en = X.en || null; who = {person: X.person || null, obj: X.obj || null}; two = !!X.twoTense; } } catch (e) {} }
      const ms = (p.m || []).filter(x => x && x.f);
      r = {root: p.root, morphs: ms.map(x => x.f), gl: ms.map(x => (x.slot === 5 && x.base === 'ye') ? 'CF5' : (x.gloss || '')), wclass: p.wclass || '', mean, en, who, two, ctx: p.ctx || null, cmp: (p.cmp && p.cmp.length > 1) ? p.cmp : null, words: (p.words && p.words.length > 1) ? p.words : null};
    }
  } catch (e) { r = null; }
  postMessage({id, r});
};
