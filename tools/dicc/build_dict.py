"""Assemble diccionario/datos.js from:
  game_vocab.json            every word and phrase the game teaches (extract.js)
  core_extra.tsv             hand-written core entries for frequent words not in the game
  augusta_digital_entries.json  Augusta's dictionary, digital edition in Unificado
  builder_en.json            word-building items (extract.js + builder_en.py)
  rootfreq.json (optional)   AVENUE root frequencies (rootagg from the parser over the corpus)
  revisiones.json (optional) the reviewer's decisions exported from the master copy
Usage: python3 build_dict.py OUT_datos.js"""
import json, re, sys, os, time
H = os.path.dirname(os.path.abspath(__file__)); P = lambda f: os.path.join(H, f)
game = json.load(open(P('game_vocab.json')))
aug = json.load(open(P('augusta_digital_entries.json')))
builder = json.load(open(P('builder_en.json')))
freq = json.load(open(P('rootfreq.json'))) if os.path.exists(P('rootfreq.json')) else {}
rev = json.load(open(P('revisiones.json'))) if os.path.exists(P('revisiones.json')) else {}

THEME = {  # game level title -> theme key
 'Saludos y personas':'saludos','Más saludos':'saludos','Los pronombres personales':'pron','Números 1 a 10':'num','Números hasta 100':'num',
 'Animales':'anim','Más animales':'anim','Animales del monte':'anim','Tierra y cielo':'nat','Plantas y paisaje':'plant','Más plantas':'plant',
 'El cuerpo':'cuerpo','Más del cuerpo':'cuerpo','Colores':'color','Colores II':'color','La familia':'fam','La familia II':'fam',
 'Lo que hacemos':'verb','Acciones':'verb','Más acciones':'verb','Más trabajos':'verb','La ropa':'ropa','Comida':'comida','Más comida':'comida',
 'La casa':'casa','Cómo son las cosas':'desc','El año y el tiempo':'tiempo','Palabras para preguntar':'preg','Más preguntas':'preg','Dónde: en, junto a':'lugar'}
LABS = re.compile(r"^(?:(?:s|tr|intr|unitr|refl|rec|expr|adj|adv|part|partíc|comp|interj|pron|pers|conj|prep|posp|num|pl|dem|interr|interrog|v|n|loc|neg|fig|indet|t|exp|impers|poses|suf|pref|apóc|contracc|Pangui|Huapi|Imp|Tranc|Bot|Zool|Med|Anat|y)\.\s*|/?unitr\.\s*|y\s+(?=[a-z]+\.))+")
POS = [('tr.','v'),('intr.','v'),('unitr.','v'),('rec.','v'),('refl.','v'),('s.','s'),('adj.','adj'),('adv.','adv'),('pron.','pron'),('partíc.','part'),('part.','part'),('interj.','interj'),('num.','num'),('posp.','posp'),('suf.','suf'),('conj.','conj')]
def pos_of(t):
    for k, v in POS:
        if re.search(r'(^|\s|/)' + re.escape(k), t[:40]): return v
    return ''
def short(t):
    t = re.sub(r'^\((?:del esp\.|de |ger\. de|rz\.|probabl\.|lit\.|pl\.)[^)]*\)\s*', '', t.strip())
    m = re.match(r'^▹\s*([^.;]+)', LABS.sub('', t))
    if m and len(LABS.sub('', t)) < 60: return 'Véase ' + m.group(1).strip()
    t = LABS.sub('', t).strip()
    m = re.match(r"(.+?(?<!\bp)(?<!\bej)(?<!\betc)(?<!\bprobabl)(?<!\blit)[.;])(?:\s|$)", t)
    s = (m.group(1) if m else t).rstrip('.;').strip()
    return s if len(s) <= 140 else s[:137].rsplit(' ', 1)[0] + '…'
def root_of(hw, p):
    if p != 'v': return hw
    if re.search(r'[aeiouü]n$', hw) and not hw.endswith('ün'): return hw[:-1]
    if hw.endswith('ün') and len(hw) > 3: return hw[:-2] if hw[-3] not in 'aeiou' else hw[:-1]
    return hw
def fq(r): return freq.get(r, 0)

core = []; seen = set()
def find_aug(m):
    for c in (m, m + 'n', m + 'ün'):
        if c in aug: return c
    return None
for w in game:
    k = w['m'].strip(); kl = k.lower()
    if kl in seen: continue
    seen.add(kl)
    phrase = w['kind'] == 'frase' or bool(re.search(r"[\s?!¿¡-]", k))
    t = 'frases' if w['kind'] == 'frase' else THEME.get(w['src'], 'otros')
    a = None if phrase else find_aug(kl)
    core.append({'id': 'c:' + k, 'm': k, 'es': w['es'], 'en': w['en'], 't': t, 'p': '', 'a': a, 'pic': w.get('pic'),
                 'o': 'juego', 'src': w['src'], 'ph': 1 if phrase else 0, 'f': fq(root_of(kl, 'v'))})
for line in open(P('core_extra.tsv'), encoding='utf-8'):
    if not line.strip(): continue
    m, a, p, es, en, t = line.rstrip('\n').split('\t')
    if m.lower() in seen: continue
    seen.add(m.lower())
    if a == '-': a = None
    elif not a or a not in aug: a = find_aug(m.lower())
    core.append({'id': 'c:' + m, 'm': m, 'es': es, 'en': en, 't': t, 'p': p, 'a': a, 'pic': None, 'o': 'frecuente', 'src': '', 'ph': 0,
                 'f': fq(root_of(m.lower(), p))})
STOP = set('de la el los las con por en mi mis su sus un una a que no me se lo le como para todo todas todos y o al del muy más mucho'.split())
LABEL0 = r'(?:s|tr|intr|unitr|refl|rec|expr|adj|adv|y|v|n|pron|pers|partíc|part|interj|num|loc|comp|dem|interr|posp|suf|pref|conj|neg|fig|impers|poses|apóc|contracc|expr|t)\.'
def junk(h, texts):
    """Headwords the PDF extraction picked up from Spanish example text rather than real entries."""
    t = texts[0].strip()
    if "'" in h or '’' in h: return True
    if re.search(r'c(?!h)|[qvxjzbáéíóú]|(?<![cs])h', h): return True
    ws = h.split()
    if len(ws) > 1 and any(w in STOP for w in ws): return True
    if t.startswith('▹') or re.match('^' + LABEL0, t): return False
    if re.match(r'^\([^)]*\)\s*(?:' + LABEL0 + r'|▹)', t): return False
    if re.match(r'^(?:Pangui|Huapi|Imp|Tranc)\.', t): return False
    return bool(re.match(r'^[(a-záéíóúñ]', t))
linked = {c['a'] for c in core if c['a']}
A = []; skipped = 0
for hw, texts in aug.items():
    if junk(hw, texts) and hw not in linked: skipped += 1; continue
    text = ' | '.join(t.strip() for t in texts if t.strip())
    p = pos_of(text); s = short(texts[0])
    A.append({'id': 'a:' + hw, 'h': hw, 'r': root_of(hw, p), 'p': p, 's': s, 'd': text, 'en': '', 'f': fq(root_of(hw, p))})
# drafted English for Augusta (en/*.tsv: headword, English, optional corrected Spanish short gloss)
import glob
ENX = {}
for fp in sorted(glob.glob(P('en/*.tsv'))):
    for line in open(fp, encoding='utf-8'):
        c = line.rstrip('\n').split('\t')
        if len(c) >= 2 and c[0]: ENX[c[0]] = c[1:]
nen = 0
for e in A:
    x = ENX.get(e['h'])
    if x:
        e['en'] = x[0]; nen += 1
        if len(x) > 1 and x[1]: e['s'] = x[1]
    elif e['s'].startswith('Véase '):
        e['en'] = 'See ' + e['s'][6:]
# reviewer decisions
nrev = 0
for e in core + A:
    r = rev.get(e['id'])
    if not r: continue
    for k in ('m', 'es', 'en', 't', 's', 'note'):
        if k in r and r[k] is not None: e[k] = r[k]
    e['st'] = r.get('st', 0); nrev += 1
for e in core + A: e.setdefault('st', 0)
B = [{'w': b['w'], 'm': b['m'], 'g': b['g'], 's': b['s'], 'es': b['es'], 'en': b['en']} for b in builder]
SUBS = [('poseemos','tenemos'),('poseen','tienen'),('posees','tienes'),('posee','tiene'),('poseo','tengo'),('poseía','tenía'),('poseías','tenías'),('poseían','tenían'),('poseer','tener')]
for b in B:
    for x, y in SUBS: b['es'] = re.sub(r'\b' + x + r'\b', y, b['es'])
data = {'v': time.strftime('%Y%m%d%H%M%S'), 'core': core, 'aug': A, 'build': B,
        'n': {'core': len(core), 'aug': len(A), 'skipped': skipped, 'aug_en': sum(1 for e in A if e['en']), 'aug_en_drafted': nen, 'build': len(B), 'rev': nrev, 'linked': len(linked)}}
open(sys.argv[1], 'w', encoding='utf-8').write('window.DICC=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(data['n'], os.path.getsize(sys.argv[1]))
