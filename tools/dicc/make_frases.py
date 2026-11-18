# Builds diccionario/frases/pares.json for "¿Cómo lo dicen?": every AVENUE line with its Spanish translation, cleaned
# of transcription tags and de-duplicated. Usage: python3 make_frases.py <folder with the Nguluche/Lafkenche/Pewenche
# script folders> diccionario/frases/pares.json. Each pair is [Mapudungun, Spanish, variety initial (N, L, P)].
import glob,re,json,sys,collections,unicodedata
src=sys.argv[1]; out=sys.argv[2]
def clean(t):
    t=re.sub(r'<[^>]*>','',t)            # tags <Noise>, <*SPA>, <!1x>
    t=re.sub(r'\+/[^/]*/\+','',t)
    t=t.replace('%','').replace('*','').replace('#','')
    t=re.sub(r'\.{2,}|…',' ',t); t=re.sub(r'-{2,}',' ',t)
    t=re.sub(r'\s+',' ',t).strip(' ,;:-')
    return t
pairs=[];seen=set();var=collections.Counter()
for f in sorted(glob.glob(src+'/*/*.txt')):
    v=f.split('/')[-2]
    L=open(f,encoding='latin-1').read().split('\n')
    for i,l in enumerate(L):
        if not l.startswith('M:'): continue
        c=next((L[j] for j in range(i+1,min(i+4,len(L))) if L[j].startswith('C:')),None)
        if c is None: continue
        m=clean(l[2:]); s=clean(c[2:])
        if not m or not s or len(s)<3 or re.fullmatch(r'[\W\d_]+',s): continue
        nm=len(m.split())
        if nm<1 or nm>30 or len(s.split())>40: continue
        if not re.search(r'[a-zñü]',m.lower()): continue
        k=(m.lower(),s.lower())
        if k in seen: continue
        seen.add(k); pairs.append([m,s,v[:1]]); var[v]+=1
json.dump(pairs,open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print(len(pairs),var)
