"""Confirm or correct each 1916 entry's headword by its definition.
The digital edition reproduces Augusta's definitions, so the right headword for a 1916 entry is the nearby
headword whose definition shares its Spanish content words. The digital text is only compared, never copied.
Usage: python3 confirm.py e16.json keys.json digital_entries.json OUT.json"""
import json, re, sys, unicodedata
from difflib import SequenceMatcher
E = json.load(open(sys.argv[1], encoding='utf-8'))
K = json.load(open(sys.argv[2], encoding='utf-8'))
DIG = json.load(open(sys.argv[3], encoding='utf-8'))
OUT = sys.argv[4]
sys.argv = [sys.argv[0], sys.argv[2], sys.argv[2], '/dev/null']
exec(open('align.py', encoding='utf-8').read().split('p = 0; out = []')[0])   # coarse(), fine(), score()
STOP = set('para como cuando donde entre sobre hacia hasta desde tiene tener estar hacer otro otra otros otras alguno alguna algo esto este esta cual cuales porque tambien mucho muchos muy menos más mas cosa cosas sentido modo forma suele tal'.split())
def sa(s):
    s = unicodedata.normalize('NFD', s.lower()); s = re.sub(r'[̀-ͯ]', '', s); return s
def words(t):
    return {w for w in re.findall(r'[a-zñ]{4,}', sa(t)) if w not in STOP}
DW = [words(' '.join(DIG.get(k, []))) for k in K]
KI = {k: i for i, k in enumerate(K)}
def defsim(a, i):
    b = DW[i]
    if not a or not b: return 0.0
    # first sense matters most: Augusta's opening gloss words
    return len(a & b) / min(len(a), 8)
# interpolate positions for entries without one
last = 0
for e in E:
    if e.get('pos') is None and e['ok'] and e['h'] in KI: e['pos'] = KI[e['h']]
    if e.get('pos') is not None: last = e['pos']
    e['_p'] = last
fixed = conf = unconf = 0
for e in E:
    aw = words(e['d'][:160])
    if not aw: e['conf'] = None; continue
    cf, ff = coarse(e['form']), fine(e['form'])
    p = e['_p']; best = None
    for i in range(max(0, p - 60), min(len(K), p + 80)):
        hs = 0.85 * score(cf, CK[i]) + 0.15 * score(ff, FK[i])
        if hs < 0.45: continue
        ds = defsim(aw, i)
        tot = hs + 1.2 * min(ds, 1.0)
        if best is None or tot > best[0]: best = (tot, hs, ds, i)
    cur = KI.get(e['h']) if e['ok'] else None
    curds = defsim(aw, cur) if cur is not None else 0
    if best and best[2] >= 0.34 and best[1] >= 0.55:
        if K[best[3]] != e['h']:
            if cur is None or best[2] > curds + 0.15: e['h'] = K[best[3]]; e['ok'] = True; fixed += 1
        e['conf'] = True; conf += 1
    elif e['ok'] and curds >= 0.34:
        e['conf'] = True; conf += 1
    else:
        e['conf'] = False; unconf += 1
json.dump(E, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f'confirmed by definition {conf}, headword corrected {fixed}, not confirmed {unconf}')
