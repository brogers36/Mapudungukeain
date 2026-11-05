"""Combine two OCR readings of the same volume, word by word.
A is the tesseract output (TSV per page, as split.py reads it). B is a second reading: another scan OCR'd the same
way, or the text layer that came with a PDF (one NNN.txt per page). Pages are matched by content (B's page number
may differ). Within a page the two word sequences are aligned; where they disagree on a word, B's word replaces A's
only if A's is not a known word and B's is (Spanish per LibreOffice, or Mapudungun per AVENUE / the dictionary's
headwords, after converting Augusta's spelling). The output is a copy of A's TSV files with those words replaced,
so split.py and the rest of the pipeline run unchanged.
Usage: python3 vote.py A_TSV_DIR B_TXT_DIR OUT_DIR LO_ES_DIR avenue_words.json augusta1916_entries.json [--tsv-b]"""
import csv, json, os, re, sys, unicodedata
from collections import Counter
from difflib import SequenceMatcher
from spylls.hunspell import Dictionary
A, B, OUT, LOD, AVF, A1F = sys.argv[1:7]
B_IS_TSV = '--tsv-b' in sys.argv
os.makedirs(OUT, exist_ok=True)
LO = [Dictionary.from_files(os.path.join(LOD, 'es_' + r)) for r in ('ES', 'CL')]
KNOWN = Counter(json.load(open(AVF, encoding='utf-8')))
for k in json.load(open(A1F, encoding='utf-8')):
    for w in k.split(): KNOWN[w] += 3
def sa(s):
    s = unicodedata.normalize('NFD', s); s = re.sub(r'ñ', 'ñ', s); s = re.sub(r'ü', 'ü', s)
    return unicodedata.normalize('NFC', re.sub(r'[̀-ͯ]', '', s))
def conv(w):
    w = sa(w.lower()); w = re.sub(r'i{2,}', 'ü', w).replace('q', 'g')
    w = re.sub(r'(?<=[aeouü])i(?![aeiouü])', 'y', w); w = re.sub(r'(?<=[aeiü])u(?![aeiouü])', 'w', w)
    return re.sub(r'([^aeiouüy])n$', r'\1ün', w)
CORE = re.compile(r"[A-Za-zÁÉÍÓÚÑÜáéíóúñü]+")
SPLIT = re.compile(r"^([^A-Za-zÁÉÍÓÚÑÜáéíóúñü]*)([A-Za-zÁÉÍÓÚÑÜáéíóúñü]+)([^A-Za-zÁÉÍÓÚÑÜáéíóúñü]*)$")
def known(tok):
    # a word read with Augusta's own letters (trained model) is never replaced by a reading without them
    if re.search(r'[ŋəʃŊƏ]', tok): return True
    m = SPLIT.match(tok)
    if not m or len(m.group(2)) < 2: return False
    w = m.group(2)
    if any(d.lookup(w) or d.lookup(w.lower()) for d in LO): return True
    return KNOWN.get(conv(w), 0) >= 2 or KNOWN.get(w.lower(), 0) >= 2
def words_b(p):
    f = os.path.join(B, '%03d.%s' % (p, 'tsv' if B_IS_TSV else 'txt'))
    if not os.path.exists(f): return []
    if B_IS_TSV:
        return [r['text'] for r in csv.DictReader(open(f, encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE)
                if r['level'] == '5' and (r['text'] or '').strip()]
    return open(f, encoding='utf-8', errors='replace').read().split()
BP = sorted(int(f[:3]) for f in os.listdir(B) if re.match(r'\d{3}\.(txt|tsv)$', f))
BW = {p: words_b(p) for p in BP}
stats = Counter()
for f in sorted(x for x in os.listdir(A) if x.endswith('.tsv')):
    p = int(f[:3])
    rows = list(csv.DictReader(open(os.path.join(A, f), encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE))
    idx = [i for i, r in enumerate(rows) if r['level'] == '5' and (r['text'] or '').strip()]
    aw = [rows[i]['text'] for i in idx]
    # the B page whose words overlap most (B may be numbered differently)
    best, bw = 0, []
    sa_set = set(w.lower() for w in aw if len(w) > 3)
    for q in [q for q in BP if abs(q - p) <= 12] or BP[:0]:
        ov = len(sa_set & set(w.lower() for w in BW[q] if len(w) > 3))
        if ov > best: best, bw = ov, BW[q]
    if best >= max(10, len(sa_set) // 4):
        sm = SequenceMatcher(None, [w.lower() for w in aw], [w.lower() for w in bw], autojunk=False)
        for op, i1, i2, j1, j2 in sm.get_opcodes():
            if op != 'replace' or i2 - i1 != j2 - j1: continue
            for a_i, b_j in zip(range(i1, i2), range(j1, j2)):
                a, b = aw[a_i], bw[b_j]
                stats['disagree'] += 1
                ma, mb = SPLIT.match(a), SPLIT.match(b)
                if not ma or not mb or not known(b) or known(a): continue
                # the same word read two ways: similar spelling, letters only; A keeps its punctuation and "—"
                if SequenceMatcher(None, ma.group(2).lower(), mb.group(2).lower()).ratio() < 0.6: continue
                rows[idx[a_i]]['text'] = ma.group(1) + mb.group(2) + ma.group(3); stats['replaced'] += 1
        stats['pages'] += 1
    else:
        stats['pages_unmatched'] += 1
    with open(os.path.join(OUT, f), 'w', encoding='utf-8', newline='') as o:
        w = csv.DictWriter(o, fieldnames=list(rows[0].keys()) if rows else [], delimiter='\t', quoting=csv.QUOTE_NONE, escapechar='\\')
        if rows: w.writeheader(); w.writerows(rows)
print(dict(stats))
