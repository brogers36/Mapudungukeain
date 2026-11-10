"""Assemble diccionario/datos.js from:
  game_vocab.json            every word and phrase the game teaches (extract.js)
  core_extra.tsv             hand-written core entries for frequent words not in the game
  ../aug1916/augusta1916_entries.json  Augusta's dictionary (1916), OCR of the printed original, spelling
                             converted to Unificado (tools/aug1916); ../aug1916/augusta1916_verified.json lists
                             the headwords confirmed against their definitions
  builder_en.json            word-building items (extract.js + builder_en.py)
  rootfreq.json (optional)   AVENUE root frequencies (rootagg from the parser over the corpus)
  revisiones.json (optional) the reviewer's decisions exported from the master copy
Usage: python3 build_dict.py OUT_datos.js"""
import json, re, sys, os, time
H = os.path.dirname(os.path.abspath(__file__))
# parser-derived files (parser_extra.tsv, loan_stems.json, rootfreq.json) are kept out of the public repository;
# they are read from the private folder MPK_PRIVADO (default /home/claude/privado_parser/dicc) when not found here
PRIV = os.environ.get('MPK_PRIVADO', '/home/claude/privado_parser/dicc')
P = lambda f: os.path.join(H, f) if os.path.exists(os.path.join(H, f)) or not os.path.exists(os.path.join(PRIV, f)) else os.path.join(PRIV, f)
game = json.load(open(P('game_vocab.json')))
aug = json.load(open(P('../aug1916/augusta1916_entries.json'), encoding='utf-8'))
VER = set(json.load(open(P('../aug1916/augusta1916_verified.json'), encoding='utf-8')))
builder = json.load(open(P('builder_en.json')))
freq = json.load(open(P('rootfreq.json'))) if os.path.exists(P('rootfreq.json')) else {}
rev = json.load(open(P('revisiones.json'))) if os.path.exists(P('revisiones.json')) else {}

THEME = {  # game level title -> theme key
 'Saludos y personas':'saludos','Más saludos':'saludos','Los pronombres personales':'pron','Números 1 a 10':'num','Números hasta 100':'num',
 'Animales':'anim','Más animales':'anim','Animales del monte':'anim','Tierra y cielo':'nat','Plantas y paisaje':'plant','Más plantas':'plant',
 'El cuerpo':'cuerpo','Más del cuerpo':'cuerpo','Colores':'color','Colores II':'color','La familia':'fam','La familia II':'fam',
 'Lo que hacemos':'verb','Acciones':'verb','Más acciones':'verb','Más trabajos':'verb','La ropa':'ropa','Comida':'comida','Más comida':'comida',
 'La casa':'casa','Cómo son las cosas':'desc','El año y el tiempo':'tiempo','Palabras para preguntar':'preg','Más preguntas':'preg','Dónde: en, junto a':'lugar'}
LABS = re.compile(r"^(?:(?:r|a|c|ant|ger|s|tr|intr|unitr|refl|rec|expr|adj|adv|part|partíc|comp|interj|pron|pers|conj|prep|posp|num|pl|dem|interr|interrog|v|n|loc|neg|fig|indet|t|exp|impers|poses|suf|pref|apóc|contracc|Pangui|Huapi|Imp|Tranc|Bot|Zool|Med|Anat|y)\.\s*|/?unitr\.\s*|y\s+(?=[a-z]+\.))+")
POS = [('tr.','v'),('intr.','v'),('unitr.','v'),('rec.','v'),('refl.','v'),('n.','v'),('r.','v'),('s.','s'),('adj.','adj'),('adv.','adv'),('pron.','pron'),('partíc.','part'),('part.','part'),('interj.','interj'),('num.','num'),('posp.','posp'),('suf.','suf'),('conj.','conj')]
def pos_of(t):
    for k, v in POS:
        if re.search(r'(^|\s|/)' + re.escape(k), t[:40]): return v
    return ''
def short(t):
    t = re.sub(r'\bpüron(?=[.,]?\s*(?:pers|poses|dem|interr|indef|indeterm|rel)\w*)', 'pron', t)
    t = re.sub(r'^pron,\s*poses,\s*', 'pron. poses. ', t.strip())
    t = re.sub(r'^\((?:Panguipulli|Huapi)[^)]*\)\s*', '', t.strip())
    t = re.sub(r'^((?:(?:s|n|tr|r|a|adj|adv|partíc|interj|rec|ger|num|pron|conj|c|v|ant|t)\.\s*,?\s*(?:y\s+)?)+)', lambda m: m.group(1).replace(',', ' '), t)
    t = re.sub(r'^=\s*([^\s.,;]+)[.,]?\s*$', r'▹ \1', t)
    t = re.sub(r'^\((?:del esp\.|de |ger\. de|rz\.|probabl\.|lit\.|pl\.)[^)]*\)\s*', '', t.strip())
    m = re.match(r'^▹\s*([^.;]+)', LABS.sub('', t))
    if m and len(LABS.sub('', t)) < 60: return 'Véase ' + m.group(1).strip()
    t = re.sub(r'^[\s:;,.·]+', '', LABS.sub('', t))   # no stray punctuation left by a stripped label
    t = re.sub(r'(?<=\w),?\s*v\.\s*g\..*$', '.', t) if re.search(r'\w.{3,},?\s*v\.\s*g\.', t) else t   # stop the gloss before the example
    m = re.match(r"(.+?(?<!\bp)(?<!\bej)(?<!\betc)(?<!\bprobabl)(?<!\blit)[.;])(?:\s|$)", t)
    s = (m.group(1) if m else t).rstrip('.;').strip()
    s = s.rstrip(' ,;:')
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
    m, _, hom = m.partition('#')   # a homophone is written word#2 (tamu#2 'aquí' beside tamu 'su, de ustedes dos')
    if a == '-': a = None
    elif not a or a not in aug: a = find_aug(m.lower())
    core.append({'id': 'c:' + m + ('~' + hom if hom else ''), 'm': m, 'es': es, 'en': en, 't': t, 'p': p, 'a': a, 'pic': None, 'o': 'frecuente', 'src': '', 'ph': 0,
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
    if hw not in VER and junk(hw, texts) and hw not in linked: skipped += 1; continue
    # a headword whose senses carry different parts of speech (me partíc. / me s. 'excrementos') becomes one entry per part of speech
    groups = []
    for t in (t.strip() for t in texts if t.strip()):
        c = re.sub(r'^\s*(\[[^\]]*\]\s*|\((?:Panguipulli|Huapi)[^)]*\)\s*)+', '', t)
        q = pos_of(c) if re.match('^' + LABEL0, c) else ''
        if groups and q and q not in {g[0] for g in groups} and groups[0][0] != '':
            groups.append([q, [t], c])
        elif groups:
            g = next((g for g in groups if g[0] == q), groups[-1]) if q else groups[-1]
            g[1].append(t)
        else:
            groups.append([pos_of(t), [t], t])
    for i, (q, ts, first) in enumerate(groups):
        text = ' ‖ '.join(ts)
        p = (pos_of(text) if i == 0 else q); s = short(first)
        A.append({'id': 'a:' + hw + ('' if i == 0 else '~' + str(i + 1)), 'h': hw, 'r': root_of(hw, p), 'p': p, 's': s, 'd': text, 'en': '', 'f': fq(root_of(hw, p)), 'u': 0 if hw in VER else 1})
# entries from the parser's lexicon (parser_extra.tsv) and the Spanish loan roots it knows (loan_stems.json + loan_en.tsv)
have = {e['h'] for e in A}
for line in open(P('parser_extra.tsv'), encoding='utf-8'):
    if not line.strip() or line.startswith('#'): continue
    h, r, p, es, en, src, d = line.rstrip('\n').split('\t')
    if h in have: continue
    if src == 'A': d = es[:1].upper() + es[1:] + '.'   # the parser's quotation of the digital edition is not republished
    A.append({'id': 'a:' + h, 'h': h, 'r': r, 'p': p, 's': es, 'd': d, 'en': en, 'f': fq(r), 'o': src}); have.add(h)
LEN = dict(l.rstrip('\n').split('\t') for l in open(P('loan_en.tsv'), encoding='utf-8') if l.strip())
NOUNISH = {'cafe','catolico','confianza','contento','estudio','firma','fuerte','joven','libre','listo','malo','mate','pobre','rico','sano','seguro','tomate','tranquilo','ultimo','zapato','arreglado'}
for lemma, x in sorted(json.load(open(P('loan_stems.json'), encoding='utf-8')).items()):
    h = x['h']; var = [v for v in x['v'] if not v.startswith(h) and not h.startswith(v)]
    hw = h if lemma in NOUNISH else h + ('n' if h[-1] in 'aeiouü' else 'ün')
    also = (' También: ' + ', '.join(v + '-' for v in var) + '.') if var else ''
    A.append({'id': 'p:' + lemma, 'h': hw, 'r': h, 'p': 's' if lemma in NOUNISH else 'v',
              's': f'«{lemma}» (préstamo del español)', 'en': f"{LEN.get(lemma, lemma)} (loan from Spanish {lemma})",
              'd': f'Préstamo del español «{lemma}». Raíz en el corpus AVENUE: {h}-.' + also, 'f': fq(h), 'o': 'L'})
# drafted English for Augusta (en/*.tsv: headword, English, optional corrected Spanish short gloss)
import glob
ENX = {}
for fp in sorted(glob.glob(P('en/*.tsv'))):
    for line in open(fp, encoding='utf-8'):
        c = line.rstrip('\n').split('\t')
        if len(c) >= 2 and c[0]: ENX[c[0]] = c[1:]
nen = 0
for e in A:
    x = ENX.get(e['id'][2:]) if '~' in e['id'] else (ENX.get(e['h'] + '~1') or ENX.get(e['h']))   # split senses: keys headword~1, headword~2
    if x and e.get('o') is None:
        e['en'] = x[0]; nen += 1
    elif e['s'].startswith('Véase '):
        e['en'] = 'See ' + e['s'][6:]
# OCR corrections from the master copy: "ocr:<word>" -> fix replaces that Mapudungun word everywhere in Augusta's
# text; "esh:<headword>" -> fix renames a Spanish headword of the Spanish -> Mapudungun half
OCRFIX = {k[4:]: v['fix'] for k, v in rev.items() if k.startswith('ocr:') and v.get('fix')}
ESHFIX = {k[4:]: v['fix'] for k, v in rev.items() if k.startswith('esh:') and v.get('fix')}
def ocrfix(t):
    # Augusta's label tr. is often read "ir." (he never uses "ir." as a label); "2.ª" read "2.2"
    t = re.sub(r'(?:(?<=\()|(?<=, )|(?<=\| )|(?<=\by )|^)ir\.(?=[\s,);:]|$)', 'tr.', t)
    t = re.sub(r'\b((?:tr|n|r)\. [12]\.)2(?=[\s,);])', r'\1ª', t)
    # the label pron. is often read "püron" (a real word, 'nudo', so only before pers./poses. etc.)
    t = re.sub(r'\bpüron(?=[.,]?\s*(?:pers|poses|dem|interr|indef|indeterm|rel)\w*)', 'pron', t)
    if not OCRFIX: return t
    return re.sub(r'[A-Za-zÁÉÍÓÚÑÜáéíóúñüḻṉṯ]+', lambda m: OCRFIX.get(m.group(0).lower(), m.group(0)) if m.group(0).lower() in OCRFIX else m.group(0), t)
for e in A:
    if e.get('o') is None: e['d'] = ocrfix(e['d']); e['s'] = ocrfix(e['s'])
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
# Spanish -> Mapudungun half of Augusta (extract_es.py), plus the few the parser has and the digital edition lacks.
# Written to a separate file that the app loads only when someone searches in Spanish.
# Spanish -> Mapudungun: volume II (español-araucano) of the 1916 original, OCR'd (tools/aug1916/build_es16.py).
# Written to a separate file that the app loads only when someone searches in Spanish.
_esf = P('../aug1916/augusta1916_es.json')
_esflags = json.load(open(P('../aug1916/augusta1916_es_flags.json'), encoding='utf-8')) if os.path.exists(P('../aug1916/augusta1916_es_flags.json')) else {}
ES = [{'id': 'e:' + ESHFIX.get(h, h), 'h': ESHFIX.get(h, h), 'd': ocrfix(' ‖ '.join(t)), 'o': None, 'u': 1 if (h in _esflags and h not in ESHFIX) else 0} for h, t in json.load(open(_esf, encoding='utf-8')).items()] if os.path.exists(_esf) else []
open(os.path.join(os.path.dirname(sys.argv[1]), 'datos_es.js'), 'w', encoding='utf-8').write(
    'window.DICC_ES=' + json.dumps(ES, ensure_ascii=False, separators=(',', ':')) + ';\n')
data = {'v': time.strftime('%Y%m%d%H%M%S'), 'core': core, 'aug': A, 'build': B,
        'n': {'es': len(ES), 'core': len(core), 'aug': sum(1 for e in A if e.get('o') is None), 'parser': sum(1 for e in A if e.get('o') in ('A','R')), 'loans': sum(1 for e in A if e.get('o') == 'L'), 'skipped': skipped, 'aug_en': sum(1 for e in A if e['en']), 'aug_en_drafted': nen, 'build': len(B), 'rev': nrev, 'linked': len(linked)}}
open(sys.argv[1], 'w', encoding='utf-8').write('window.DICC=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(data['n'], os.path.getsize(sys.argv[1]))
