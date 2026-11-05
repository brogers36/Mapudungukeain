"""e16.json (build16.py) -> augusta1916_entries.json: {headword: [text, ...]} plus a list of headwords whose
spelling was matched (verified) rather than only converted from the OCR.
Usage: python3 finish16.py e16.json OUT_DIR"""
import json, re, sys, os
E = json.load(open(sys.argv[1], encoding='utf-8'))
LAB = r'(?:s|n|tr|ir|r|a|adj|adv|partíc|interj|rec|ger|num|pron|conj|posp|prep|expr|imper|impers|c|v|ant|t)\.'
def clean(d):
    d = re.sub(r'^[\s.,:;|*+!\'"]+', '', d)
    d = re.sub(r'\s+([,.;:])', r'\1', d)
    d = re.sub(r'\s*\|\|\s*$', '', d).strip()
    return d
import importlib.util
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build16.py'), encoding='utf-8').read()
ns = {'re': re}; exec('import unicodedata\n' + src[src.index('def sa('):src.index('CONF = [')], ns)
conv = ns['conv']
out = {}; ver = set(); drop = 0; moved = 0
for e in E:
    if not e.get('conf'):
        e['ok'] = False
        e['h'] = conv(re.sub(r'[^\wñüÑÜáéíóú]', '', e['form'] or '')) if e.get('form') else e['h']
    h = e['h'].strip()
    h = re.sub(r'[^a-zñüḻṉṯ ]', '', h.lower()).strip()
    d = clean(e['d'])
    bad = not h or len(h) < 2 or not d
    if not bad and not e['ok']:
        # unverified headwords: keep only clean-looking ones whose text starts like an entry
        bad = bool(re.search(r'[bcjqvxz]', h.replace('ch', '')) or not re.match(r'^(?:\(|=|V\.|' + LAB + ')', d))
    if bad:
        # the form could not be read: its definition stays with the group's headword instead of being lost
        g = re.sub(r'[^a-zñüḻṉṯ ]', '', (e.get('grp') or '').lower()).strip()
        if d and g in out: out[g].append('[forma ilegible en el escaneo] ' + d); moved += 1
        else: drop += 1
        continue
    d = re.sub(r'^ir\.', 'tr.', d)
    if e['reg']: d = '(' + ', '.join(e['reg']) + ') ' + d
    out.setdefault(h, [])
    if d not in out[h]: out[h].append(d)
    if e['ok']: ver.add(h)
od = sys.argv[2]
json.dump(out, open(os.path.join(od, 'augusta1916_entries.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
json.dump(sorted(ver), open(os.path.join(od, 'augusta1916_verified.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(len(out), 'headwords,', len(ver), 'verified,', moved, 'unreadable forms kept under their group,', drop, 'dropped')
