/* ¿Cómo lo dicen? Búsqueda en las frases de AVENUE con su traducción al castellano. Corre aparte de la página.
   Mensaje de entrada: {q, side:'es'|'arn', vars:'NLP'}; de salida: {ready, n} al cargar y {q, hits:[[i, score, matched]]}.
   Los pares vienen de pares.json: [mapudungun, castellano, variedad]. © 2026 Brandon M. A. Rogers. */
let P = null, IDX = null, LEN = null, AVG = 1, IDXM = null;
const STOP = new Set('el la los las lo le les de del que y a al en un una unos unas es se su sus por con para como pero o mas me te mi tu nos ya pues si eso esa ese esto esta este estos estas'.split(' '));
const fold = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const toks = s => fold(s).match(/[a-z0-9]+/g) || [];
const ENDS = ['amientos','imientos','amiento','imiento','aciones','acion','mente','ando','iendo','aron','ieron','aban','abas','aste','iste','amos','emos','imos','ados','adas','idos','idas','aba','ado','ada','ido','ida','ian','ias','ia','ar','er','ir','as','es','an','en','os','a','e','o','s'];
function stem(t) { if (t.length <= 3) return t; for (const e of ENDS) if (t.endsWith(e) && t.length - e.length >= 3) return t.slice(0, -e.length); return t; }
/* Mapudungun side: the AVENUE spellings ' (l'awen') and v/f are folded so that lawen, l'awen' and l'awen match */
const foldM = s => s.toLowerCase().replace(/'/g, '').replace(/v/g, 'f').replace(/[ḻ]/g, 'l').replace(/[ṉ]/g, 'n').replace(/[ṯ]/g, 't');
const toksM = s => foldM(s).match(/[a-zñü]+/g) || [];
function build() {
  IDX = new Map(); LEN = new Uint16Array(P.length); let tot = 0;
  for (let i = 0; i < P.length; i++) {
    const ts = toks(P[i][1]).filter(t => !STOP.has(t)); LEN[i] = ts.length; tot += ts.length;
    for (const t of new Set(ts.map(stem))) { let a = IDX.get(t); if (!a) IDX.set(t, a = []); a.push(i); }
  }
  AVG = tot / P.length;
}
function buildM() {
  IDXM = new Map();
  for (let i = 0; i < P.length; i++) for (const t of new Set(toksM(P[i][0]))) { let a = IDXM.get(t); if (!a) IDXM.set(t, a = []); a.push(i); }
}
function searchEs(q, vars) {
  const qt = [...new Set(toks(q).filter(t => !STOP.has(t)))]; if (!qt.length) return [];
  const N = P.length, S = new Map(), M = new Map();
  for (const t of qt) {
    const st = stem(t), list = IDX.get(st); if (!list) continue;
    const idf = Math.log(1 + (N - list.length + 0.5) / (list.length + 0.5));
    for (const i of list) {
      if (!vars.includes(P[i][2])) continue;
      const k = 1.2, b = 0.75, tf = 1, s = idf * (tf * (k + 1)) / (tf + k * (1 - b + b * LEN[i] / AVG));
      S.set(i, (S.get(i) || 0) + s); M.set(i, (M.get(i) || 0) + 1);
    }
  }
  const out = [];
  for (const [i, s] of S) { const cov = M.get(i) / qt.length; out.push([i, s * (0.4 + cov * cov), M.get(i)]); }
  out.sort((a, b) => b[1] - a[1] || P[a[0]][1].length - P[b[0]][1].length);
  return out.slice(0, 60);
}
function searchM(q, vars) {
  if (!IDXM) buildM();
  const qt = [...new Set(toksM(q))]; if (!qt.length) return [];
  const S = new Map();
  for (const t of qt) {
    /* exact word, or a longer word that starts with it (pe finds pefiñ, pelay) */
    for (const [w, list] of (t.length >= 3 ? [...IDXM].filter(([w]) => w.startsWith(t)) : [[t, IDXM.get(t) || []]])) {
      const bonus = w === t ? 2 : 1;
      for (const i of list) if (vars.includes(P[i][2])) S.set(i, (S.get(i) || 0) + bonus);
    }
  }
  return [...S].sort((a, b) => b[1] - a[1] || P[a[0]][0].length - P[b[0]][0].length).slice(0, 60).map(([i, s]) => [i, s, 0]);
}
let ready = fetch('pares.json').then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(d => { P = d; build(); postMessage({ready: true, n: P.length}); })
  .catch(e => postMessage({ready: false, error: String(e)}));
onmessage = ev => {
  ready.then(() => {
    if (!P) return;
    const {q, side, vars} = ev.data;
    const hits = side === 'arn' ? searchM(q, vars || 'NLP') : searchEs(q, vars || 'NLP');
    postMessage({q, side, hits: hits.map(([i, s, m]) => [P[i][0], P[i][1], P[i][2], m])});
  });
};
