"""Give each 1916 entry (and each "—" sub-form in it) its Unificado headword.
The OCR'd headwords are noisy (tesseract has no ŋ or ə, reads ü as ii/ú). The digital edition lists the same groups,
expanded into one headword per sub-form, in the same order, so each OCR'd form is matched to the nearest headword
of that ordered list. Only the headword spellings are used from it; every definition comes from the 1916 scan.
Usage: python3 align.py raw.json KEYS.json OUT.json"""
import json, re, sys, unicodedata
from difflib import SequenceMatcher
raw = json.load(open(sys.argv[1], encoding='utf-8'))
K = json.load(open(sys.argv[2], encoding='utf-8'))  # ordered headword list
def strip_acc(s):
    s = unicodedata.normalize('NFD', s)
    s = re.sub(r'ñ', 'ñ', s); s = re.sub(r'ü', 'ü', s)
    s = re.sub(r'[̀-ͯ]', '', s)
    return unicodedata.normalize('NFC', s)
def coarse(s):
    s = strip_acc(s.lower())
    s = re.sub(r'[^a-zñüə]', '', s)
    for a, b in (('ng', 'g'), ('q', 'g'), ('ii', 'u'), ('iu', 'u'), ('ü', 'u'), ('ə', 'u'), ('y', 'i'), ('w', 'u'), ('v', 'f'), ('tr', 't'), ('ll', 'l'), ('i', 'u')):
        s = s.replace(a, b)
    return re.sub(r'(.)\1+', r'\1', s)
CK = [coarse(k) for k in K]
from collections import defaultdict
B2 = defaultdict(list); B1 = defaultdict(list)
for i, c in enumerate(CK):
    B2[c[:2]].append(i); B1[c[:1]].append(i)
def cands(c):
    xs = B2.get(c[:2], [])
    return xs if len(xs) >= 3 else B1.get(c[:1], [])
SEP = r'[|!\[\]]'
def head_of(t):
    t = t.lstrip('¡¿«"\' ')
    t = re.sub(r'(?<=[a-zñüáéíóú])[:·](?=[a-zñüáéíóú])', '', t)
    m = re.match(r"(.{1,48}?)(?:,|\s=|=|:|\s\(|\s—|\.\s|\s(?:V|n|tr|s|adj|adv|r)\.)", t)
    h = (m.group(1) if m else t.split(' ')[0])
    return h.strip(' *+!¡')
def score(a, b):
    if not a or not b: return 0
    return SequenceMatcher(None, a, b, autojunk=False).ratio()
def fine(s):
    s = strip_acc(s.lower()); s = re.sub(r'[^a-zñüə]', '', s)
    s = re.sub(r'i{2,}', 'ü', s)
    s = re.sub(r'(?<=[aeou])i(?![aeiou])', 'y', s); s = re.sub(r'(?<=[aeio])u(?![aeiou])', 'w', s)
    s = re.sub(r'(?<=[aeou])i(?=[aeou])', 'y', s); s = re.sub(r'(?<=[aeio])u(?=[aeio])', 'w', s)
    return s.replace('q', 'g')
FK = [fine(k) for k in K]
KN = [re.sub(r'\s', '', k) for k in K]
p = 0; out = []
for e in raw:
    t = re.sub(r'(?<=[a-zñüáéíóú])[:·](?=[a-zñüáéíóú])', '', e['t']); h = head_of(t)
    # main form: separator chars removed
    hm = re.sub(SEP, '', h)
    ch = coarse(hm); fh = fine(hm)
    best = (0, None); heads = []
    for i in cands(ch):
        s = 0.85 * score(ch, CK[i]) + 0.15 * score(fh, FK[i])
        s -= (0.0002 * abs(i - p) if abs(i - p) < 300 else 0.06)
        heads.append((s, i))
        if s > best[0]: best = (s, i)
    rec = {'pg': e['pg'], 't': t, 'h_ocr': h}
    heads.sort(reverse=True)
    xs0 = [m.group(1) for m in re.finditer(r'(?:\|\||\[\||\|\]|\|l|l\||\]\||\|\[)\s*[-—–]+\s*([^\s,.;:(]+(?: [^\s,.;:(=—]+(?=[*+]?,))?)', t)]
    if len(xs0) >= 1 and heads:
        # a short or garbled head is decided by the sub-forms it has to explain
        def subfit(i):
            kk = re.sub(r'\s', '', K[i]); tot = 0
            for x in xs0[:6]:
                cx = coarse(x); bb = 0
                for L in range(max(2, len(kk) - 4), len(kk) + 1):
                    cf = coarse(kk[:L]) + cx; pre = kk[:L]
                    for j in range(max(0, i - 5), min(len(K), i + 45)):
                        if not KN[j].startswith(pre): continue
                        sc = score(cf, CK[j])
                        if sc > bb: bb = sc
                tot += bb
            return tot / min(6, len(xs0))
        hd = dict((i, hs) for hs, i in heads)
        pool = [i for hs, i in heads[:(15 if len(xs0) >= 3 else 4)] if hs > 0.5] + [i for i in range(max(0, p - 30), min(len(K), p + 12)) if hd.get(i, 0) > 0.45 or score(ch[:2], CK[i][:2]) >= 0.5]
        pool = list(dict.fromkeys(pool))
        W = 0.6 if len(xs0) < 3 else 1.5
        top = [(hd.get(i, 0) + W * subfit(i), hd.get(i, 0), i) for i in pool]
        top = [x for x in top if x[0] > 0.55 + W * 0.85]
        if top:
            top.sort(reverse=True); best = (max(top[0][1], 0.74), top[0][2])
    if best[1] is not None and best[0] >= 0.74:
        rec['k'] = K[best[1]]; rec['i'] = best[1]; rec['ks'] = round(best[0], 3); p = best[1] + 1
    # stem as printed (before the vertical bar), for "—" forms
    ms = re.match(r'[¡¿«"\' ]*([^\s,]+?)' + SEP, t)
    stem_ocr = ms.group(1) if ms else None
    rec['stem_ocr'] = stem_ocr
    subs = []
    xs = [m for m in re.finditer(r'(?:\|\||\[\||\|\]|\|l|l\||\]\||\|\[)\s*[-—–]+\s*([^\s,.;:(]+(?: [^\s,.;:(=—]+(?=[*+]?,))?)', t)]
    if xs and (stem_ocr or rec.get('k')):
        c0 = best[1] if best[1] is not None else p
        stems = []
        if rec.get('k'):
            kk = re.sub(r'\s', '', rec['k']); stems += [coarse(kk[:L]) for L in range(2, len(kk) + 1)]
            slen = {}
            for L in range(len(kk), 1, -1): slen[coarse(kk[:L])] = L
        if stem_ocr: stems.append(coarse(stem_ocr))
        stems = list(dict.fromkeys(x for x in stems if x))
        def bestfor(cf):
            b2 = (0, None)
            for i in cands(cf):
                s = score(cf, CK[i]) - (0.0002 * abs(i - c0) if abs(i - c0) < 200 else 0.08)
                if s > b2[0]: b2 = (s, i)
            return b2
        top = None
        for st in stems:
            r = [bestfor(st + coarse(m.group(1))) for m in xs]
            tot = sum(x[0] for x in r) - (0.06 * len(r) * abs(len(st) - len(coarse(stem_ocr))) if stem_ocr else 0)
            if top is None or tot > top[0]: top = (tot, st, r)
        if top is None: top = (0, '', [(0, None)] * len(xs))
        rec['stem_c'] = top[1]
        if rec.get('k') and top[1] in slen: rec['stem_len'] = slen[top[1]]
        # final assignment with the chosen stem: each headword used once per group, best matches first
        st = top[1]; fst = None
        if rec.get('k') and rec.get('stem_len'): fst = re.sub(r'\s', '', rec['k'])[:rec['stem_len']]
        cand_lists = []
        for m in xs:
            cf = st + coarse(m.group(1)); ff = fine((fst or '') + m.group(1)) if fst else None
            cl = []
            for i in cands(cf):
                s = score(cf, CK[i]) - (0.0002 * abs(i - c0) if abs(i - c0) < 200 else 0.08)
                if ff: s = 0.7 * s + 0.3 * score(ff, FK[i])
                if fst and not KN[i].startswith(fst): s -= 0.05
                cl.append((s, i))
            cl.sort(reverse=True); cand_lists.append(cl[:5])
        used = {rec.get('i')}; assign = [None] * len(xs)
        order = sorted(range(len(xs)), key=lambda j: -(cand_lists[j][0][0] if cand_lists[j] else 0))
        for j in order:
            for s, i in cand_lists[j]:
                if i not in used and s >= 0.8: assign[j] = (s, i); used.add(i); break
        for j, m in enumerate(xs):
            sc, i = assign[j] if assign[j] else ((cand_lists[j][0][0] if cand_lists[j] else 0), None)
            ok = i is not None and K[i] != rec.get('k')
            subs.append({'at': m.start(), 'x': m.group(1), 'k': K[i] if ok else None, 'i': i if ok else None, 'ks': round(sc, 3)})
    rec['subs'] = subs
    out.append(rec)
idx = [r.get('i') for r in out]
drop = 0
for j, r in enumerate(out):
    if r.get('i') is None: continue
    prev = next((idx[x] for x in range(j - 1, max(-1, j - 6), -1) if idx[x] is not None), None)
    nxt = next((idx[x] for x in range(j + 1, min(len(out), j + 6)) if idx[x] is not None), None)
    far = lambda q: q is not None and abs(q - r['i']) > 150
    if (far(prev) and far(nxt)) or (prev is not None and nxt is not None and prev < nxt and not (prev - 30 <= r['i'] <= nxt + 30) and (r['ks'] < 0.9 or nxt - prev < 80)):
        r['k_rej'] = r.pop('k'); r.pop('i'); drop += 1
print('order check dropped', drop)
json.dump(out, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
n = len(out); m = sum(1 for r in out if r.get('k'))
ns = sum(len(r['subs']) for r in out); ms_ = sum(1 for r in out for s in r['subs'] if s['k'])
print(f'entries {n}, headword matched {m} ({m/n:.1%}); sub-forms {ns}, matched {ms_} ({ms_/max(ns,1):.1%})')
