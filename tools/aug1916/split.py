"""Split tesseract TSV output of Augusta (1916) vol. I into raw entries.
Usage: python3 split.py OCR_DIR OUT.json
An entry starts on an indented line; continuation lines are flush left. Page headers are dropped,
line-end hyphens joined. Output: [{"pg": page, "t": raw text}] in page order."""
import csv, collections, json, os, re, sys, statistics
d, out = sys.argv[1], sys.argv[2]
E = []
PAGES = []
for f in sorted(x for x in os.listdir(d) if x.endswith('.tsv')):
    pg = int(f[:3])
    rows = list(csv.DictReader(open(os.path.join(d, f), encoding='utf-8'), delimiter='\t', quoting=csv.QUOTE_NONE))
    L = collections.OrderedDict()
    for r in rows:
        if r['level'] != '5' or not (r['text'] or '').strip(): continue
        L.setdefault((int(r['block_num']), int(r['par_num']), int(r['line_num'])), []).append(r)
    lines = []
    for ws in L.values():
        lines.append((min(int(w['left']) for w in ws), min(int(w['top']) for w in ws), ' '.join(w['text'] for w in ws)))
    lines.sort(key=lambda x: x[1])
    # library and scanner notes (HathiTrust / Google copies): not part of the book
    lines = [l for l in lines if not re.search(r'Google|Digitized|Original from|UNIVERSITY OF|Generated at|hathitrust|Public Domain|handle\.net', l[2], re.I)]
    if not lines: continue
    # header: first line, all-caps words or a page number, within the top margin
    top = lines[0]
    if re.search(r'[A-ZÁÉÍÓÚÜÑ]{3,}', top[2]) and not re.search(r'[a-záéíóúñ]{3,}', top[2]): lines = lines[1:]
    if not lines: continue
    PAGES.append((pg, lines))
MARG = {}
for pg, lines in PAGES:
    xs = sorted(l[0] for l in lines)
    for v in xs:
        if sum(1 for x in xs if v <= x <= v + 25) >= 3: MARG[pg] = v; break
par = {0: [], 1: []}
for pg, v in MARG.items(): par[pg % 2].append(v)
pm = {k: statistics.median(v) for k, v in par.items() if v}
for pg, lines in PAGES:
    left = MARG.get(pg, pm[pg % 2])
    # a page made only of one-line entries has its "margin" at the indent: compare with pages of the same parity
    if left - pm[pg % 2] > 45: left = pm[pg % 2]
    H = max(l[1] for l in lines) or 1
    foot = False
    for x, y, t in lines:
        # footnotes ("1) ...", "2) ...") at the foot of the page are not entries: skip to the next page
        if y > 0.55 * H and re.match(r'^\W{0,2}(?:\d|[%*§])\)\s', t): foot = True
        if foot: continue
        start = 45 < x - left < 200
        if start or not E:
            E.append({'pg': pg, 't': t})
        else:
            prev = E[-1]['t']
            if re.search(r'[a-záéíóúñü]-$', prev) and re.match(r'[a-záéíóúñü]', t):
                E[-1]['t'] = prev[:-1] + t
            else:
                E[-1]['t'] = prev + ' ' + t
json.dump(E, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(len(E), 'entries')
