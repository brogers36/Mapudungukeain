"""Volume II (español-araucano) of Augusta (1916): raw OCR entries -> {Spanish headword: [text, ...]}.
Spanish headwords are read from the scan; "—" is expanded to the group's Spanish stem; each "||" form becomes its own
entry; Mapudungun words in the text are converted from Augusta's spelling to Unificado (as in build16.py).
Usage: python3 build_es16.py raw.json avenue_words.json keys.json augusta1916_entries.json OUT.json"""
import json, re, sys, os, tempfile
raw = json.load(open(sys.argv[1], encoding='utf-8'))
aug1 = json.load(open(sys.argv[4], encoding='utf-8'))
OUT = sys.argv[5]
# reuse the spelling conversion and word classification of build16.py
tmp = tempfile.NamedTemporaryFile('w', suffix='.json', delete=False); tmp.write('[]'); tmp.close()
argv = sys.argv
sys.argv = [argv[0], tmp.name, argv[2], argv[3], os.devnull]
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build16.py'), encoding='utf-8').read()
exec(src.split('\nout = []')[0])
sys.argv = argv
SC = SpellChecker(language='es', distance=1)
CONF[:0] = [('iw', 'ü'), ('iu', 'ü'), ('iwy', 'üy'), ('o', 'ü'), ('s', 'ü')]   # volume II italics: ü read as iu, ə as o or s
# confirmed volume I headwords help recognise Mapudungun words (unconfirmed ones are OCR forms and would
# reinforce the misreads: mufay, manfana)
_ver = set(json.load(open(os.path.join(os.path.dirname(os.path.abspath(sys.argv[4])), 'augusta1916_verified.json'), encoding='utf-8')))
for k in aug1:
    if k in _ver:
        for w in k.split(): V[w] += 3
# LibreOffice's Spanish dictionary (RLA-ES, hunspell; Spain and Chile), path in LO_ES_DIR
from spylls.hunspell import Dictionary
_LO = os.environ.get('LO_ES_DIR')
LO = [Dictionary.from_files(os.path.join(_LO, 'es_' + r)) for r in ('ES', 'CL')] if _LO else []
def lo_ok(w): return any(d.lookup(w) for d in LO)
SEPS = r'(?:\|\||\[\||\|\]|\|l|l\||\]\||\|\[)'
def sp_ok(w):
    w = w.lower()
    if lo_ok(w) or is_es(w) or w in ES: return True
    m = re.match(r'(.+?)(ad|id)(o|a|os|as)$', w)
    return bool(m and any(m.group(1) + x in ES for x in ('ar', 'er', 'ir')))
def accent(w):
    if w in ES or lo_ok(w): return w
    plain = ''.join(dict(zip('áéíóú', 'aeiou')).get(c, c) for c in w)
    for base in ([plain] if plain != w else []) + [plain]:
        if base != w and (base in ES or lo_ok(base)): return base
        for i, ch in enumerate(base):
            if ch in 'aeiou':
                w2 = base[:i] + 'áéíóú'['aeiou'.index(ch)] + base[i+1:]
                if w2 in ES or lo_ok(w2): return w2
    return w
_snap1 = snap
def snap(c):
    r = _snap1(c)
    if r: return r
    # two misreadings in one word (doyun -> düngun: ə read as o, ŋ as y)
    best = None
    for a, b in CONF:
        for m in re.finditer(re.escape(a), c):
            v = c[:m.start()] + b + c[m.end():]
            for a2, b2 in CONF:
                for m2 in re.finditer(re.escape(a2), v):
                    w = v[:m2.start()] + b2 + v[m2.end():]
                    f = V.get(w, 0)
                    if f >= 20 and (best is None or f > best[1]): best = (w, f)
    return best[0] if best else None
def head_of(t):
    t = re.sub(r'^[\W\d]+', '', t)
    m = re.match(r"([A-Za-zÁÉÍÓÚÜÑáéíóúüñ|!\[\]']+)", t)
    if not m: return None, None, t
    raw_h = m.group(1)
    stem_m = re.match(r"([^|!\[\]]+)[|!\[\]]", raw_h)
    h = re.sub(r"[|!\[\]']", '', raw_h).lower()
    stem = stem_m.group(1).lower() if stem_m else h
    return h, stem, t[m.end():]
def expand(seg, stem, full):
    # "—arse" -> stem + "arse"; a bare "—" stands for the whole headword
    seg = re.sub(r'[-—–]{1,2}([a-záéíóúñü]+)', lambda m: stem + m.group(1), seg)
    return re.sub(r'(?<![\wáéíóúñü])[-—–]{1,2}(?![\wáéíóúñü])', ' ' + full + ' ', seg)
G = []; bad = 0
MAPU = re.compile(r'k|w|ü|ə|tr[aeiouü]|ng|^[^aeiou]*$')
for e in raw:
    h, stem, rest = head_of(e['t'])
    if not h or len(h) < 2:
        if G: G[-1]['rest'] += ' ' + e['t']
        continue
    if not sp_ok(h):
        # the bar read as a space: "zamb| o, adj." -> zambo, stem zamb
        mj = re.match(r"\s*[¡!|\[\]l1]?\s*([a-záéíóúñü]{1,9})(?=[\s,.:;])", rest)
        if mj and sp_ok(h + mj.group(1)): stem, h, rest = h, h + mj.group(1), rest[mj.end():]
    if not sp_ok(h):
        # accents the OCR dropped (peninsula -> península)
        for i, ch in enumerate(h):
            if ch in 'aeiou':
                h2 = h[:i] + 'áéíóú'['aeiou'.index(ch)] + h[i+1:]
                if h2 in ES: stem = h2 if stem == h else stem; h = h2; break
    if not sp_ok(h) and stem == h:
        # the bar read as a letter (abroch|ar -> abrochuar): drop one character
        done = False
        for k in (1, 2):
            for i in range(2, len(h) - k + 1):
                if sp_ok(h[:i] + h[i+k:]): stem, h = h[:i], h[:i] + h[i+k:]; done = True; break
            if done: break
    if not sp_ok(h):
        c = SC.correction(h)
        if c and c != h and len(c) == len(h): h = c; stem = h if stem == h else stem
        else:
            sug = next(iter(LO[0].suggest(h)), None) if LO else None
            from difflib import SequenceMatcher as _SM
            if sug and ' ' not in sug and _SM(None, sug.lower(), h).ratio() >= 0.85: h = sug.lower(); stem = h if stem == h else stem
    ok = sp_ok(h)
    if not ok and G and (MAPU.search(h) or V.get(conv(h), 0) >= 2):
        # a line of Mapudungun that began indented: it continues the previous entry
        G[-1]['rest'] += ' ' + e['t']; continue
    if not ok: bad += 1
    a2 = accent(h)
    if a2 != h: stem = a2 if stem == h else stem; h = a2
    if stem == h:
        # no bar printed or read: the stem is what the first "—" form attaches to (abrum|ado ... —ar)
        mx = re.search(r'[-—–]{1,2}\s?([a-záéíóúñü]{1,6})\b', rest)
        if mx:
            x = mx.group(1)
            if h.endswith(x) and len(h) > len(x) + 1: stem = h[:-len(x)]
            else:
                for L in range(len(h) - 1, 1, -1):
                    if sp_ok(h[:L] + x): stem = h[:L]; break
    G.append({'h': h, 'stem': stem, 'rest': rest, 'ok': ok, 'pg': e['pg']})
# alphabetical order (Augusta's: ch after c, ll after l, ñ after n): the longest increasing run of headwords is taken
# as right; a headword outside it is a misread or a merged entry and is flagged
import unicodedata, bisect
def key(w):
    w = unicodedata.normalize('NFD', w.lower()); w = re.sub(r'[\u0301\u0300\u0308]', '', w); w = unicodedata.normalize('NFC', w)
    return w.replace('ch', 'c\x7f').replace('ll', 'l\x7f').replace('ñ', 'n\x7f')
ks = [key(g['h']) for g in G]
tails, tidx, prev = [], [], [-1] * len(G)
for n_, k_ in enumerate(ks):
    p_ = bisect.bisect_right([ks[t] for t in tidx], k_) if len(tidx) < 64 else bisect.bisect_right(tails, k_)
    if p_ > 0: prev[n_] = tidx[p_ - 1]
    if p_ == len(tidx): tidx.append(n_); tails.append(k_)
    else: tidx[p_] = n_; tails[p_] = k_
inorder = set(); n_ = tidx[-1] if tidx else -1
while n_ >= 0: inorder.add(n_); n_ = prev[n_]
# an out-of-order "headword" with no grammatical label after it is a continuation line that began indented
LABEL = re.compile(r'^[\s|!\]\[¡]*[-—–]?\w{0,6}[\s,.:;]*\(?(?:m|f|a|n|r|adj|adv|p|pron|prep|conj|interj|s|v|expr|pl|com)\.')
G2 = []
for n_, g in enumerate(G):
    if n_ not in inorder and G2 and not LABEL.match(g['rest'][:40]) and not re.match(r'\s*[=(:]', g['rest']):
        G2[-1]['rest'] += ' ' + g['h'] + g['rest']; continue
    g['_in'] = n_ in inorder; G2.append(g)
merged = len(G) - len(G2); G = G2
# an out-of-order headword that becomes Spanish and sorts between its neighbours after dropping one character
# (the bar read as a letter: ric|o -> rijo) or with a dictionary suggestion is corrected
refixed = 0
ins = [n_ for n_, g in enumerate(G) if g['_in']]
import bisect as _b
for n_, g in enumerate(G):
    if g['_in']: continue
    q = _b.bisect_left(ins, n_); lo_k = key(G[ins[q-1]]['h']) if q > 0 else ''; hi_k = key(G[ins[q]]['h']) if q < len(ins) else '\uffff'
    h = g['h']; cands = []
    for i in range(1, len(h)):
        c = h[:i] + h[i+1:]
        if len(c) > 1 and sp_ok(c): cands.append((c, h[:i]))
    if LO:
        for sg in list(LO[0].suggest(h))[:6]:
            if ' ' not in sg: cands.append((sg.lower(), None))
    for c, st in cands:
        if lo_k <= key(c) <= hi_k:
            g['h'] = c; g['stem'] = st or (c if g['stem'] == h else g['stem']); g['_in'] = True; g['ok'] = True; refixed += 1; break
print(refixed, 'out-of-order headwords corrected by their neighbours')
for g in G:
    why = []
    if not g['ok']: why.append('no está en el diccionario de LibreOffice')
    if not g['_in']: why.append('fuera de orden alfabético')
    g['why'] = why
out = {}; flags = {}
for g in G:
    h, stem, rest = g['h'], g['stem'], g['rest']
    parts = re.split(r'\s*' + SEPS + r'\s*', rest)
    segs = [(h, parts[0])]
    for p in parts[1:]:
        m = re.match(r'[-—–]{1,2}\s?([a-záéíóúñü]+)(.*)', p, re.S)
        if m: segs.append((stem + m.group(1), m.group(2)))
        else: segs[-1] = (segs[-1][0], segs[-1][1] + ' || ' + p)
    for hw, body in segs:
        body = expand(body, stem, h)
        body = re.sub(r'(?<=[a-zñüA-Z])2|2(?=[a-zñü])', 'ə', body)
        body = re.sub(r'¿(?=[a-zñü])', 'i', body)
        body = re.sub(r'^[\s,.:;|*]+', '', body)
        txt = fix_text(body, None).strip(' |')
        txt = re.sub(r'\s+([,.;:])', r'\1', txt)
        if txt:
            out.setdefault(hw, [])
            if txt not in out[hw]: out[hw].append(txt)
            why = [w for w in g['why'] if hw == h] if hw == h else ([] if sp_ok(hw) else ['no está en el diccionario de LibreOffice'])
            if why: flags[hw] = {'pg': g['pg'], 'why': why}
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
json.dump(flags, open(OUT.replace('.json', '_flags.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(G), 'groups;', merged, 'continuation lines rejoined;', len(flags), 'headwords flagged (', sum(1 for v in flags.values() if 'no está en el diccionario de LibreOffice' in v['why']), 'unknown to the dictionary,', sum(1 for v in flags.values() if 'fuera de orden alfabético' in v['why']), 'out of alphabetical order )')
print(len(out), 'Spanish headwords;', bad, 'groups with an unrecognised headword')
