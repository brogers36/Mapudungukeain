"""Extract the Spanish -> Mapudungun half of the digital Augusta edition (pdftotext output, no -layout).
An entry starts on a line whose first word is a Spanish headword when the previous text line ended an entry (with a
period, closing bracket or quote) and the headword sorts at or after the previous one. Page numbers, running letters
and empty lines are dropped. Usage: python3 -I extract_es.py digital.txt out.json"""
import re, sys, json, unicodedata
txt = open(sys.argv[1], encoding='utf-8').read().split('\n')
start = next(i for i, l in enumerate(txt) if l.strip() == 'A' and i > 300)
end = next(i for i, l in enumerate(txt) if l.strip() == 'A' and i > start + 1000)
lines = [l.strip() for l in txt[end:]]
lines = [l for l in lines if l and not re.fullmatch(r'\d{1,3}', l)]
def key(w):
    w = unicodedata.normalize('NFD', w.lower()); w = ''.join(c for c in w if unicodedata.category(c) != 'Mn' or c == '̃')
    return unicodedata.normalize('NFC', w).replace('ñ', 'n~')
W = r"[a-záéíóúñü][a-záéíóúñü\-]*"
LAB = r"(?:act|adj|adv|m|f|intr|refl|prep|pron|conj|interj|loc|num|pl|part|impers|modif|com|interr|dem|pos|art|aum|dim|tr|s)\."
START = re.compile(rf"^({W}(?: {W}){{0,3}}?)(?=\s+(?:{LAB}|\[|▹|V\.)|\s+(?:{LAB}))")
REFL = re.compile(rf"^({W}(?:arse|erse|irse))(?=\s)")
entries = []; cur = None; prev_end = True; prev_key = ''; letter = 'a'
for l in lines:
    if re.fullmatch(r'[A-ZÑ]', l):
        if key(l) >= letter: letter = key(l)
        continue
    m = START.match(l) or REFL.match(l)
    if m and prev_end:
        h = m.group(1).strip(); k = key(h)
        if k[:1] == letter[:1] and not (cur and len(cur['text']) == 0):
            if cur: entries.append(cur)
            cur = {'h': h, 'text': l[m.end():].strip()}; prev_key = k
            prev_end = bool(re.search(r"[.\]')]$", l)); continue
    if cur: cur['text'] += ('' if cur['text'].endswith('-') else ' ') + l
    prev_end = bool(re.search(r"[.\]')]$", l))
if cur: entries.append(cur)
# split entries the line-based pass merged: "... . malhecho adj. ..." inside the text of malhadado
split = []
INL = re.compile(rf"(?<=[.'\]]) ({W}) (?={LAB})")
for e in entries:
    t = re.sub(r'\s+', ' ', e['text']).strip(); h = e['h']; parts = []
    while True:
        m = next((m for m in INL.finditer(t) if key(m.group(1)) > key(h) and key(m.group(1))[:2] == key(h)[:2]), None)
        if not m: break
        parts.append((h, t[:m.start()].strip())); h = m.group(1); t = t[m.end():].strip()
    parts.append((h, t)); split += [{'h': a, 'text': b} for a, b in parts]
entries = split
out = {}
for e in entries:
    t = re.sub(r'\s+', ' ', e['text']).strip()
    if not t: continue
    out.setdefault(e['h'], []).append(t)
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
print(len(entries), 'entries,', len(out), 'headwords')
