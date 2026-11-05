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
for k in aug1:
    for w in k.split(): V[w] += 3          # the volume I headwords help recognise Mapudungun words
SEPS = r'(?:\|\||\[\||\|\]|\|l|l\||\]\||\|\[)'
def sp_ok(w):
    w = w.lower()
    return is_es(w) or w in ES
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
out = {}; bad = 0
for e in raw:
    h, stem, rest = head_of(e['t'])
    if not h or len(h) < 2: bad += 1; continue
    if not sp_ok(h) and stem == h:
        # the bar read as a letter (abroch|ar -> abrochuar): drop one character
        for i in range(2, len(h)):
            if sp_ok(h[:i] + h[i+1:]): stem, h = h[:i], h[:i] + h[i+1:]; break
    if not sp_ok(h):
        c = SC.correction(h)
        if c and c != h and len(c) == len(h): h = c; stem = h if stem == h else stem
        else: bad += 1
    if stem == h:
        # no bar printed or read: the stem is what the first "—" form attaches to (abrum|ado ... —ar)
        mx = re.search(r'[-—–]{1,2}\s?([a-záéíóúñü]{1,6})\b', rest)
        if mx:
            x = mx.group(1)
            if h.endswith(x) and len(h) > len(x) + 1: stem = h[:-len(x)]
            else:
                for L in range(len(h) - 1, 1, -1):
                    if sp_ok(h[:L] + x): stem = h[:L]; break
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
json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(out), 'Spanish headwords;', bad, 'groups with an unrecognised headword')
