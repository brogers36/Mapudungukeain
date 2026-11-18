# Builds diccionario/frases/pares.json for "¿Cómo lo dicen?": every AVENUE line with its Spanish translation, cleaned
# of transcription tags and de-duplicated. Usage: python3 make_frases.py <folder with the Nguluche/Lafkenche/Pewenche
# script folders> diccionario/frases/pares.json. Each pair is [Mapudungun, Spanish, variety initial (N, L, P)].
import glob,re,json,sys,collections,unicodedata,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from nombres import sets
NAMES,NAMES_CAP=sets()
replaced=collections.Counter()
def unname(t):
    def f(m):
        w=m.group(0); k=w.lower().strip("'")
        if k in NAMES or k.rstrip("'") in NAMES or (w[:1].isupper() and k in NAMES_CAP): replaced[k]+=1; return '[nombre]'
        return w
    t=re.sub(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ']+",f,t)
    # a capitalized word after don / doña / señor(a) is a name even when it is not on the list (don Koche)
    def g(m):
        replaced[m.group(2).lower()]+=1; return m.group(1)+'[nombre]'
    return re.sub(r"(\b(?:[Dd]on|[Dd]oña|[Ss]eñora?|[Ss]ra?\.?)\s+)([A-ZÁÉÍÓÚÑ][a-záéíóúüñ']+)",g,t)
src=sys.argv[1]; out=sys.argv[2]
def clean(t):
    t=re.sub(r'<[^>]*>','',t)            # tags <Noise>, <*SPA>, <!1x>
    t=re.sub(r'\+/[^/]*/\+','',t)
    t=t.replace('%','').replace('*','').replace('#','')
    t=re.sub(r'\.{2,}|…',' ',t); t=re.sub(r'-{2,}',' ',t)
    t=re.sub(r'\s+',' ',t).strip(' ,;:-')
    return t
pairs=[];seen=set();var=collections.Counter();dropped=0
for f in sorted(glob.glob(src+'/*/*.txt')):
    v=f.split('/')[-2]
    raw=open(f,'rb').read()
    try: txt=raw.decode('utf-8')          # some transcripts are UTF-8, most are Latin-1
    except UnicodeDecodeError: txt=raw.decode('latin-1')
    L=txt.split('\n')
    for i,l in enumerate(L):
        if not l.startswith('M:'): continue
        c=next((L[j] for j in range(i+1,min(i+4,len(L))) if L[j].startswith('C:')),None)
        if c is None: continue
        m=unname(clean(l[2:])); s=unname(clean(c[2:]))
        if not m or not s or len(s)<3 or re.fullmatch(r'[\W\d_]+',s): continue
        nm=len(m.split())
        if nm<1 or nm>30 or len(s.split())>40: continue
        if not re.search(r'[a-zñü]',m.lower()): continue
        # a name replaced on one side only probably survives on the other in another spelling (Collinao / kollinaw):
        # the pair is left out
        if m.count('[nombre]')!=s.count('[nombre]') and ('[nombre]' in m)!=('[nombre]' in s): dropped+=1; continue
        k=(m.lower(),s.lower())
        if k in seen: continue
        seen.add(k); pairs.append([m,s,v[:1]]); var[v]+=1
json.dump(pairs,open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(pairs),var)
print('names replaced',sum(replaced.values()),'distinct',len(replaced),'pairs left out',dropped)
