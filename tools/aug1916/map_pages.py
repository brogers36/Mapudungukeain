"""Match the pages of a second scan to the first one's page numbers.
For each page of A (TSV dir), the page of B (TSV dir) with the most words in common, among B pages A_page + offset for
offsets in a window, is taken as the same page; blank A pages take the offset of their nearest matched neighbours.
Writes B's TSVs renamed to A's numbering into OUT. Usage: python3 map_pages.py A_DIR B_DIR OUT FIRST LAST OFF_MIN OFF_MAX"""
import csv, os, re, shutil, sys
from collections import Counter
A, B, OUT = sys.argv[1:4]; first, last, omin, omax = map(int, sys.argv[4:8])
os.makedirs(OUT, exist_ok=True)
def words(f):
    if not os.path.exists(f): return set()
    return {r['text'].lower() for r in csv.DictReader(open(f, encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE)
            if r['level'] == '5' and len((r['text'] or '').strip()) > 3}
off = {}
for p in range(first, last + 1):
    wa = words(os.path.join(A, '%03d.tsv' % p))
    if len(wa) < 30: continue
    best = max(((len(wa & words(os.path.join(B, '%03d.tsv' % (p + o)))), o) for o in range(omin, omax + 1)), default=(0, None))
    if best[0] >= max(15, len(wa) // 5): off[p] = best[1]
c = Counter(off.values()); print('offsets found:', dict(c.most_common(5)), 'pages matched', len(off))
for p in range(first, last + 1):
    o = off.get(p)
    if o is None:
        near = [off[q] for q in sorted(off, key=lambda q: abs(q - p))[:2]]
        o = near[0] if near and all(x == near[0] for x in near) else c.most_common(1)[0][0]
    src = os.path.join(B, '%03d.tsv' % (p + o))
    if os.path.exists(src): shutil.copy(src, os.path.join(OUT, '%03d.tsv' % p))
print('wrote', len(os.listdir(OUT)), 'pages')
