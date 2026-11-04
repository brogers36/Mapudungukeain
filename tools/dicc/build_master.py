"""Build the reviewer's master copy: one self-contained HTML file with every entry editable and the published revisions
embedded. It is NOT published to the website. Usage: python3 build_master.py ../../diccionario/datos.js OUT.html"""
import json, sys, os
H = os.path.dirname(os.path.abspath(__file__))
s = open(sys.argv[1], encoding='utf-8').read()
d = json.loads(s[s.index('{'):s.rindex('}') + 1])
rev = json.load(open(os.path.join(H, 'revisiones.json'))) if os.path.exists(os.path.join(H, 'revisiones.json')) else {}
augd = {e['h']: e['d'] for e in d['aug']}
data = {'core': d['core'], 'aug': d['aug'], 'augd': {c['a']: augd.get(c['a'], '') for c in d['core'] if c.get('a')}, 'rev': rev, 'v': d['v']}
t = open(os.path.join(H, 'master_template.html'), encoding='utf-8').read()
open(sys.argv[2], 'w', encoding='utf-8').write(t.replace('/*DATA*/null', json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')))
print('master', os.path.getsize(sys.argv[2]))
