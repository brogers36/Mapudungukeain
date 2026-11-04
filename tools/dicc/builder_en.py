"""Pick learner-friendly word-building items from builder.json (gold segmentations the parser reproduces) and give each
an English rendering composed from its morphemes. Spanish comes from the parser's meaning composer.
Usage: python3 builder_en.py builder.json out.json"""
import json, sys
V = {  # root: (base, 3sg, past, -ing)  ; 'BE:x' = copula + complement x
 'kim':('know','knows','knew','knowing'), 'pi':('say','says','said','saying'), 'fem':('do that','does that','did that','doing that'),
 'nie':('have','has','had','having'), 'müle':'BE:there', 'fele':'BE:like that', 'kutran':'BE:sick',
 'amu':('go','goes','went','going'), 'elu':('give','gives','gave','giving'), 'monge':('live','lives','lived','living'),
 'pe':('see','sees','saw','seeing'), 'kon':('go in','goes in','went in','going in'), 'aku':('arrive','arrives','arrived','arriving'),
 'tripa':('go out','goes out','went out','going out'), 'i':('eat','eats','ate','eating'), 'ramtu':('ask','asks','asked','asking'),
 'küpa':('come','comes','came','coming'), 'puw':('get there','gets there','got there','getting there'), 'allkü':('hear','hears','heard','hearing'),
 'miaw':('walk around','walks around','walked around','walking around'), 'feyentu':('believe','believes','believed','believing'),
 'ngüma':('cry','cries','cried','crying'), 'dewma':('make','makes','made','making'), 'kintu':('look for','looks for','looked for','looking for'),
 'küdau':('work','works','worked','working'), 'küdaw':('work','works','worked','working'),
}
OBJOK = {'kim','pi','pe','nie','ramtu','kintu','elu','allkü','dewma'}
PRON = {'1s':'I','2s':'you','3':'he/she','1d':'we two','2d':'you two','3d':'they two','1p':'we','2p':'you all','3p':'they'}
FINAL = {'n':'1s','ün':'1s','mi':'2s','yu':'1d','iyu':'1d','mu':'2d','ngu':'3d','iñ':'1p','yiñ':'1p','in':'1p','mün':'2p','ngün':'3p'}
OBJ = {'fiñ':'1s','fin':'1s','viñ':'1s','vin':'1s','fimi':'2s','fi':'3','vi':'3','fiyu':'1d','fiyiñ':'1p','fimün':'2p','fingün':'3p'}
ALLOW = {'NEG','CF','NRLD','IPD','STAT','REST','PERSIST','SUBJ.FIN','SUBJ','NUM','DIR','OBJ'}
def person(ms):
    last = ms[-1]
    if last in OBJ: return OBJ[last], True
    if last in FINAL: return FINAL[last], False
    if last in ('y','i'): return '3', False
    return None, None
def be(p, tense):
    if tense == 'past': return 'was' if p in ('1s','3') else 'were'
    return {'1s':'am','3':'is'}.get(p,'are')
def compose(it):
    ms, gs = it['m'], it['g'][1:]
    r = ms[0]
    if r not in V or any(g not in ALLOW for g in gs): return None
    p, obj = person(ms)
    if not p or (obj and r not in OBJOK): return None
    f = set(gs); neg='NEG' in f; fut='NRLD' in f; past='IPD' in f; hab='CF' in f; prog='STAT' in f; rest='REST' in f; pers='PERSIST' in f
    if pers and (not neg or rest or fut or past): return None
    if prog and (past or hab): return None
    S = PRON[p]; third = p == '3'; o = ' it' if obj else ''
    v = V[r]; copula = isinstance(v, str)
    if copula:
        if prog: return None
        c = v[3:]
        if fut and past: s = f"{S} would {'not ' if neg else ''}be {c}"
        elif fut: s = f"{S} will {'not ' if neg else ''}be {c}"
        elif past and hab: s = f"{S} {'did not use to' if neg else 'used to'} be {c}"
        elif past: s = f"{S} {be(p,'past')}{' not' if neg else ''} {c}"
        elif pers: s = f"{S} {be(p,'pres')} no longer {c}"
        elif hab: s = f"{S} {be(p,'pres')} {'not usually' if neg else 'usually'} {c}"
        else: s = f"{S} {be(p,'pres')}{' not' if neg else ''} {c}"
    else:
        base, s3, pst, ing = v
        def split(x): a = x.split(' ',1); return a[0], (' '+a[1] if len(a)>1 else '')
        def withobj(x):  # put the object pronoun after the verb and before any particle ("look for it", "go in")
            h, t = split(x); return (h+t+o) if t and not t.startswith(' that') else (h+o+t)
        do = 'does' if third else 'do'
        if prog and fut: s = f"{S} will {'not ' if neg else ''}be {withobj(ing)}"
        elif prog: s = f"{S} {be(p,'pres')}{' not' if neg else ''} {withobj(ing)}"
        elif fut and past: s = f"{S} would {'not ' if neg else ''}{withobj(base)}"
        elif fut: s = f"{S} will {'not ' if neg else ''}{withobj(base)}"
        elif past and hab: s = f"{S} {'did not use to' if neg else 'used to'} {withobj(base)}"
        elif past: s = f"{S} {'did not '+withobj(base) if neg else withobj(pst)}"
        elif pers: s = f"{S} no longer {withobj(s3 if third else base)}"
        elif hab: s = f"{S} {(do+' not usually '+withobj(base)) if neg else ('usually '+withobj(s3 if third else base))}"
        else: s = f"{S} {(do+' not '+withobj(base)) if neg else withobj(s3 if third else base)}"
    if rest: s += ' again'
    return s[0].upper() + s[1:]
items = json.load(open(sys.argv[1])); out = []
for it in items:
    if any(x in it['es'] for x in ('▹','(+','alguna parte','recién')): continue
    en = compose(it)
    if en: it['en'] = en; out.append(it)
json.dump(out, open(sys.argv[2],'w'), ensure_ascii=False)
print(len(out))
for it in out[::6]: print('-'.join(it['m']), '|', it['es'], '|', it['en'])
