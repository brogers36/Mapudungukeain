"""Turn aligned 1916 groups into dictionary entries, one per headword and per "—" sub-form.
Definitions are Augusta's 1916 text as OCR'd from the scan; Mapudungun words inside them are converted from
Augusta's spelling to Unificado. Usage:
  python3 build16.py al.json avenue_words.json keys.json OUT.json"""
import json, re, sys, unicodedata
from collections import Counter
from spellchecker import SpellChecker
A = json.load(open(sys.argv[1], encoding='utf-8'))
AV = Counter(json.load(open(sys.argv[2], encoding='utf-8')))
KEYS = json.load(open(sys.argv[3], encoding='utf-8'))
V = Counter(AV)
for k in KEYS:
    for w in k.lower().split(): V[w] += 3
ES = SpellChecker(language='es').word_frequency
MAPU_FN = set('ta ka fey pu tati may ñi tañi chi che rume ni mi iñ meu mew ti pe am anta kam ngelay ngey ley fau faw tüfa feychi kiñe epu küla meli kechu'.split())

def sa(s):
    s = unicodedata.normalize('NFD', s); s = re.sub(r'ñ', 'ñ', s); s = re.sub(r'ü', 'ü', s)
    s = re.sub(r'[̀-ͯ]', '', s); return unicodedata.normalize('NFC', s)
VOW = 'aeiouü'
def conv(w):
    """Augusta 1916 spelling (as OCR'd) -> Unificado, one word, lower case."""
    w = sa(w.lower().replace('ŋ', 'ng'))
    w = re.sub(r"[`'’]", '', w)
    w = re.sub(r'i{2,}', 'ü', w)
    w = w.replace('q', 'g').replace('ŋ', 'ng').replace('ə', 'ü').replace('ſ', 'sh').replace('ʃ', 'sh')
    # glides: i/u next to a vowel inside the syllable become y/w
    w = re.sub(r'(?<=[aeouü])i(?![aeiouü])', 'y', w)
    w = re.sub(r'(?<![a-zñü])i(?=[aeouü])', 'y', w)
    w = re.sub(r'(?<=[aeiouü])i(?=[aeouü])', 'y', w)
    w = re.sub(r'(?<=[aeiü])u(?![aeiouü])', 'w', w)
    w = re.sub(r'(?<=[aeioü])u(?=[aeioü])', 'w', w)
    w = re.sub(r'(?<![a-zñü])u(?=[aeioü])', 'w', w)
    # infinitive -ün written without its vowel: dollown -> dollowün, kulann -> kulanün
    w = re.sub(r'([^aeiouüy])n$', r'\1ün', w)
    return w
# Augusta's ʃ (Unificado sh) is read as f, like a long s: wəʃákelu -> wefakelu = weshakelu
CONF = [('f', 'sh'), ('i', 'ü'), ('u', 'ü'), ('ü', 'i'), ('ü', 'u'), ('ü', 'iw'), ('e', 'ü'), ('a', 'ü'), ('o', 'ü'), ('y', 'ng'), ('g', 'ng'), ('n', 'ng'), ('l', 'll'), ('ll', 'l'), ('d', 'z')]
# systematic italic misreads mined from the review list (flag_mapu.js): applied only when the OCR form is unattested
# and the result is well attested, since some (f for d) also occur in real words (wefakelu)
CONF2 = [('f', 'd'), ('t', 'i'), ('s', 'y'), ('s', 'n'), ('m', 'k'), ('a', 'u'), ('pr', 'pür'), ('pl', 'pül'), ('kr', 'kür'), ('tr', 'tür')]
def snap(c):
    if V.get(c, 0) >= 2: return c
    r = _snap0(c)
    if r: return r
    best = None
    for a, b in CONF2:
        for m in re.finditer(re.escape(a), c):
            v = c[:m.start()] + b + c[m.end():]
            f = V.get(v, 0)
            if f >= 10 and (best is None or f > best[1]): best = (v, f)
    return best[0] if best else None
def _snap0(c):
    best = None
    for a, b in CONF:
        for m in re.finditer(re.escape(a), c):
            v = c[:m.start()] + b + c[m.end():]
            f = V.get(v, 0)
            if f >= 2 and (best is None or f > best[1]): best = (v, f)
    return best[0] if best else None
MARK = re.compile(r'k|w|ü|tr|ng')
CLIT = re.compile(r'(?:se|me|te|nos|lo|la|le|los|las|les|selo|sela|selos|selas)$')
SUFX = re.compile(r'(?:mente|s|es)$')
def is_es(w):
    w = w.lower(); l = sa(w)
    for x in (w, l):
        if x in ES: return True
        b = CLIT.sub('', x)
        if b != x and len(b) > 3 and (b in ES or b + 'r' in ES or re.sub(r'a(?=r$)', 'á', b) in ES or b.replace('a', 'á', 1) in ES): return True
        b = SUFX.sub('', x)
        if b != x and len(b) > 3 and b in ES: return True
    # accents dropped by the OCR: any accented variant in the list
    for i, ch in enumerate(l):
        if ch in 'aeiou' and l[:i] + 'áéíóú'['aeiou'.index(ch)] + l[i+1:] in ES: return True
    return False
def mapu_word(tok):
    """Return converted form if tok is a Mapudungun word, else None."""
    core = re.sub(r"[^\wñüÑÜáéíóúÁÉÍÓÚ'`]", '', tok)
    if len(core) < 2 or re.search(r'\d', core): return None
    if core[0].isupper() and len(core) > 3 and is_es(core) and core.lower() not in V: return None
    c = conv(core)
    s = snap(c)
    # Augusta's own letters (read by the trained model) only occur in Mapudungun
    if re.search(r'[ŋəʃŊƏ]', core): return s or c
    sp = is_es(core)
    if sp and core.lower() not in MAPU_FN:
        if not s or V.get(s, 0) < 5 * max(1, ES[core.lower()] // 1000): return None
    if s: return s
    if re.search(r'[jvzxbh]|c(?!h)|qu|gu[eiéí]|gü', re.sub(r'[cs]h', '', core.lower())): return None
    if not sp and MARK.search(c): return c
    return None
def fix_text(t, stem):
    """OCR clean-up, '—' expanded to the group's stem, Mapudungun words converted."""
    t = re.sub(r'(?<=[a-zñüáéíóú])[:·](?=[a-zñüáéíóú])', '', t)
    t = re.sub(r'\s*(?:\[\||\|\]|\[\]|l\||\|l)\s*', ' || ', t)
    t = re.sub(r'\s*\|\s*\|\s*', ' || ', t)
    t = re.sub(r'—\s*[-—–]+|[-–]—', '—', t)
    t = re.sub(r'(?<=\s)[-–](?=[a-zñüA-Z])', '—', t)
    out = []
    bot = False
    for tok in re.split(r'(\s+)', t):
        if not tok or tok.isspace(): out.append(tok); continue
        if re.match(r'Bot\.|fam\.', tok): bot = True
        if bot:
            out.append(tok)
            if tok.endswith(';') or tok.endswith('.') and tok not in ('Bot.', 'fam.', 'L.'): bot = tok == 'Bot.' or tok == 'fam.'
            continue
        if tok.startswith('—') and stem:
            m = re.match(r'—([\wñüáéíóú\'`]*)(.*)', tok)
            if m:
                body = stem + conv(m.group(1)) if m.group(1) else stem
                s = snap(body) if m.group(1) else None
                out.append((s or body) + m.group(2)); continue
        m = re.match(r'^([¡¿«(\[]*)(.*?)([.,;:!?»)\]]*)$', tok)
        pre, core, post = m.groups()
        cw = mapu_word(core) if core else None
        if cw:
            if core[:1].isupper(): cw = cw[:1].upper() + cw[1:]
            out.append(pre + cw + post)
        else:
            out.append(tok)
    t = ''.join(out)
    return re.sub(r'\s+', ' ', t).strip()
REGION = {'*': 'Panguipulli', '+': 'Huapi'}
def split_groups(rec):
    t = rec['t']
    head_k = rec.get('k')
    stem = None
    if rec.get('stem_c') is not None and head_k:
        # real Unificado prefix whose coarse form equals the chosen stem
        sys.path.insert(0, '.')
    if head_k and rec.get('stem_len'):
        stem = re.sub(r'\s', '', head_k)[:rec['stem_len']]
    elif rec.get('stem_ocr'):
        stem = conv(re.sub(r'[^\wñü]', '', rec['stem_ocr']))
    elif head_k:
        stem = head_k
    else:
        stem = conv(re.sub(r'[|!\[\]*+\s]', '', rec['h_ocr']))
    # segment boundaries: sub-forms found by the aligner
    bounds = [(0, None)] + [(s['at'], s) for s in rec['subs']]
    segs = []
    for i, (a, s) in enumerate(bounds):
        b = bounds[i + 1][0] if i + 1 < len(bounds) else len(t)
        segs.append((t[a:b], s))
    res = []
    for j, (seg, s) in enumerate(segs):
        if j == 0:
            hw = head_k or conv(re.sub(r'[|!\[\]*+]', '', rec['h_ocr']))
            body = seg[len(rec['h_ocr']) + seg.find(rec['h_ocr']) if rec['h_ocr'] in seg else 0:]
            ok = bool(head_k)
        else:
            m = re.match(r'\s*(?:\|\||\[\||\|\]|ll|\|)\s*[-—–]+\s*([^\s,.;:(]+(?: [^\s,.;:(=—]+(?=[*+]?,))?)', seg)
            body = seg[m.end():] if m else seg
            hw = s['k'] or (stem + conv(s['x']))
            ok = bool(s['k'])
        reg = [REGION[c] for c in '*+' if c in (seg[:40].split(',')[0])]
        body = re.sub(r'^[\s*+!|,]+', '', body)
        pos = (rec.get('i') if j == 0 else (s.get('i') if s.get('i') is not None else rec.get('i')))
        form = re.sub(r'[|!\[\]*+]', '', rec['h_ocr']) if j == 0 else (rec.get('stem_ocr') or '') + s['x']
        res.append({'pos': pos, 'form': form, 'h': hw.strip(), 'ok': ok, 'reg': reg, 'd': fix_text(body, stem).strip(' |'), 'pg': rec['pg'], 'grp': head_k or hw})
    return res
out = []
for rec in A:
    out += split_groups(rec)
json.dump(out, open(sys.argv[4], 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
n = len(out); ok = sum(1 for e in out if e['ok'])
print(f'{n} entries, {ok} with verified headword ({ok/n:.1%})')
