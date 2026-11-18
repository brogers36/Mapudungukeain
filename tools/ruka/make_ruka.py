# Ruka mew: builds ruka/datos.js from the hand-written phrase list (frases_ruka.json) and the AVENUE pairs.
# For each phrase it finds the key word (the rarest word of 4+ letters, by AVENUE frequency), how often it occurs, and the
# shortest AVENUE line that contains it, shown in the app as "así aparece en AVENUE". A phrase whose key word never
# occurs in AVENUE is marked "nueva" (built from the grammar, to be checked with speakers).
# Usage: python3 tools/ruka/make_ruka.py diccionario/frases/pares.json ruka/datos.js
import json, re, sys
from collections import Counter
P = json.load(open(sys.argv[1]))
here = __file__.rsplit('/', 1)[0]
F = json.load(open(here + '/frases_ruka.json'))
fold = lambda s: s.lower().replace("'", "").replace('v', 'f')
words = lambda s: re.findall(r"[a-zñü]+", fold(s))
c = Counter(w for m, s, v in P for w in words(m))
idx = {}
for i, (m, s, v) in enumerate(P):
    if len(m.split()) > 12 or '[nombre]' in m: continue
    for w in set(words(m)): idx.setdefault(w, []).append(i)
out = []
def shortest(cands, minw):
    cands = [i for i in cands if len(P[i][0].split()) >= minw]
    return min(cands, key=lambda i: len(P[i][0])) if cands else None
for f in F:
    ws = [w for w in words(f['m']) if len(w) >= 4] or words(f['m'])
    key = min(ws, key=lambda w: (c[w], -len(w)))
    n = c[key]; ex = None
    # first an AVENUE line with the whole phrase (or its AVENUE spelling, alt), then one with the key word and other words
    phr = [' '.join(words(f['m']))] + f.get('alt', [])
    for ph in phr:
        first = words(ph)[0]
        whole = [i for i in idx.get(first, []) if (' ' + ' '.join(words(P[i][0])) + ' ').find(' ' + ph + ' ') >= 0]
        if whole: break
    if whole: n = max(n, len(whole))
    pick = shortest(whole, 1) if whole else (shortest(idx.get(key, []), 2) if n else None)
    if pick is not None and not f.get('noex'): ex = list(P[pick])
    o = dict(f, k=key, n=n, ex=ex, whole=bool(whole)); o.pop('alt', None); o.pop('noex', None)
    out.append(o)
open(sys.argv[2], 'w').write('/* Ruka mew: frases (generado por tools/ruka/make_ruka.py; no editar a mano). © 2026 Brandon M. A. Rogers. */\nconst FRASES=' + json.dumps(out, ensure_ascii=False) + ';\n')
print(len(out), 'phrases;', sum(1 for o in out if o['n']), 'with key word in AVENUE;', sum(1 for o in out if not o['n']), 'new')
for o in out: print(f"{o['m']:28} {o['k']:14} {o['n']:5}", (o['ex'] or [''])[0][:60])
