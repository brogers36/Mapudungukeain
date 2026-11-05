"""Build the reviewer's master copy: one self-contained HTML file with every entry editable and the published revisions
embedded. It is NOT published to the website.
Usage: python3 build_master.py ../../diccionario/datos.js OUT.html [DIGITAL.json] [OCR_FLAGS.json]
OCR_FLAGS.json: the review list from tools/aug1916/flag_mapu.js; the Spanish headword flags are read from
tools/aug1916/augusta1916_es_flags.json.
DIGITAL.json (optional): the 2019 digital edition, kept outside the repository; shown in the copy as a reference only."""
import json, sys, os
H = os.path.dirname(os.path.abspath(__file__))
s = open(sys.argv[1], encoding='utf-8').read()
d = json.loads(s[s.index('{'):s.rindex('}') + 1])
rev = json.load(open(os.path.join(H, 'revisiones.json'))) if os.path.exists(os.path.join(H, 'revisiones.json')) else {}
augd = {e['h']: e['d'] for e in d['aug']}
dig = {}
if len(sys.argv) > 3:
    D19 = json.load(open(sys.argv[3], encoding='utf-8')); dig = {k: ' | '.join(v) for k, v in D19.items()}
    want = {e['h'] for e in d['aug']} | {c['a'] for c in d['core'] if c.get('a')}
    dig = {k: v for k, v in dig.items() if k in want}
ocr = json.load(open(sys.argv[4], encoding='utf-8'))[:3000] if len(sys.argv) > 4 else []
esf = os.path.join(H, '..', 'aug1916', 'augusta1916_es_flags.json'); esj = os.path.join(H, '..', 'aug1916', 'augusta1916_es.json')
esh = []
if os.path.exists(esf):
    ES = json.load(open(esj, encoding='utf-8'))
    esh = [{'h': h, 'pg': v['pg'], 'why': v['why'], 'd': ' ‖ '.join(ES.get(h, []))[:400]} for h, v in json.load(open(esf, encoding='utf-8')).items()]
data = {'ocr': ocr, 'esh': esh, 'dig': dig, 'core': d['core'], 'aug': d['aug'], 'augd': {c['a']: augd.get(c['a'], '') for c in d['core'] if c.get('a')}, 'rev': rev, 'v': d['v']}
t = open(os.path.join(H, 'master_template.html'), encoding='utf-8').read()
open(sys.argv[2], 'w', encoding='utf-8').write(t.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')))
print('master', os.path.getsize(sys.argv[2]))
