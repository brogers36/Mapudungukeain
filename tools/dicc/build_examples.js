/* Example sentences from the AVENUE corpus for the dictionary.
   Usage: node build_examples.js CORPUS_DIR motor.js datos.js OUT_ejemplos.js
   Reads every transcript (M: Mapudungun line, C: its Spanish translation), keeps pairs that are entirely Mapudungun
   (no <SPA>/<*SPA> code-switching, no unclear or overlapping speech), 3 to 12 words long, with no capitalised name
   inside the sentence (a caution about the speakers' privacy), parses every word with the dictionary's parser and keeps,
   for each root that has a dictionary entry, up to three sentences from different recordings, preferring 5 to 9 words. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const [dir,motor,datos,out,esfile]=process.argv.slice(2);
const ctx={console,atob,btoa}; ctx.globalThis=ctx; ctx.self=ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'stub.js'),'utf8'),ctx); vm.runInContext(fs.readFileSync(motor,'utf8'),ctx);
const M=ctx.MOTOR;
const D=JSON.parse(fs.readFileSync(datos,'utf8').replace(/^window\.DICC=/,'').replace(/;\s*$/,''));
const fold=s=>s.toLowerCase().replace(/[()']/g,'').replace(/v/g,'f').normalize('NFD').replace(/[\u0300-\u0302\u0304-\u0307\u0309-\u036f]/g,'').normalize('NFC');
// dictionary roots: core headwords (minus -n/-ün for verbs), Augusta roots and headwords
const roots=new Set();
const cite=h=>{ h=fold(h); const out=[h]; if(/[aeiouü]n$/.test(h)) out.push(h.slice(0,-1)); if(/ün$/.test(h)) out.push(h.slice(0,-2)); return out; };
D.core.forEach(e=>{ if(!e.ph) cite(e.m).forEach(x=>roots.add(x)); });
D.aug.forEach(e=>{ roots.add(fold(e.r)); cite(e.h).forEach(x=>roots.add(x)); });
// Spanish words that appear untagged in the Mapudungun tier: function words plus every Spanish headword of the
// dictionary's Spanish -> Mapudungun half that is not also a Mapudungun word
const mapuKeys=new Set(); D.core.forEach(e=>mapuKeys.add(fold(e.m))); D.aug.forEach(e=>{ mapuKeys.add(fold(e.h)); mapuKeys.add(fold(e.r)); });
const SPANISH=new Set('a al de del el la las lo los un una unos unas que en por para con se si no pero como ahora bien muy mas más yo es son esta está estaba hay pues o y entonces cuando porque también tambien todo nada algo eso esto ese esa este esta aqui aquí ahi ahí'.split(' '));
if(esfile){ const ES=JSON.parse(fs.readFileSync(esfile,'utf8').replace(/^window\.DICC_ES=/,'').replace(/;\s*$/,'')); ES.forEach(e=>{ const w=fold(e.h); if(!/\s/.test(w)&&!mapuKeys.has(w)) SPANISH.add(w); }); }
function readText(f){ const b=fs.readFileSync(f); const u=b.toString('utf8'); return u.includes('\ufffd')?b.toString('latin1'):u; }
const files=[]; for(const d of fs.readdirSync(dir)) { const p=path.join(dir,d); if(fs.statSync(p).isDirectory()) for(const f of fs.readdirSync(p)) if(f.endsWith('.txt')) files.push([d,path.join(p,f)]); }
const pairs=[];
for(const [variety,f] of files){
  const lines=readText(f).split(/\r?\n/); let m=null;
  for(const l of lines){
    if(/^M:/.test(l)) m=l.slice(2).trim();
    else if(/^C:/.test(l)&&m!=null){ pairs.push({v:variety,f:path.basename(f,'.txt'),m,c:l.slice(2).trim()}); m=null; }
  }
}
const clean=s=>s.replace(/<!1[^>]*>/g,'').replace(/<(uh|uhm|hm|%|P|Noise|Cough|Laugh|Throat|Smack|Breath|Sniff|)>/gi,'').replace(/\s+/g,' ').trim();
const cache=new Map();
function parseRoot(w){ if(cache.has(w)) return cache.get(w); let root=null;
  try{ let r=M.parse43(w,'',3,false); if(r&&!r.nvRule){ const k=M.inferCat(r.root); if(k){ const r2=M.parse43(w,k,3,false); if(r2&&!r2.nvRule) r=r2; } } if(r&&r.root) root=fold(String(r.root)); }catch(e){}
  cache.set(w,root); return root; }
const byRoot=new Map(); let kept=0;
for(const p of pairs){
  if(/<\*?SPA>|<|\[|\(\(|\*|\?\?|#/.test(clean(p.m))||!p.c||/<|\[|\?\?/.test(p.c)) continue;
  const mm=clean(p.m), cc=p.c.replace(/\s+/g,' ').trim();
  const words=mm.replace(/[¿?¡!.,;:"“”…]/g,' ').split(/\s+/).filter(Boolean);
  if(words.length<3||words.length>12||cc.split(/\s+/).length<2) continue;
  if(words.slice(1).some(w=>/^[A-ZÑÜ]/.test(w))) continue;
  if(/\d/.test(mm)||/^[.…]/.test(mm)||/^[.…]|\.\.\./.test(cc)) continue;
  if(words.some(w=>SPANISH.has(fold(w).replace(/[^a-zñü]/g,'')))) continue;
  kept++;
  const seen=new Set();
  for(const w of words){ const lw=w.toLowerCase().replace(/'/g,''); if(lw.length<2) continue; const root=parseRoot(lw); if(!root||!roots.has(root)||seen.has(root)) continue; seen.add(root);
    const score=Math.abs(words.length-7)+(/[.!?]$/.test(mm)?0:2)+(/[.!?]$/.test(cc)?0:1);
    let a=byRoot.get(root); if(!a) byRoot.set(root,a=[]); a.push({m:mm,c:cc,w,f:p.f,v:p.v,s:score}); }
}
const EX={};
for(const [root,a] of byRoot){ a.sort((x,y)=>x.s-y.s||x.m.length-y.m.length); const pick=[], files=new Set(), seenM=new Set();
  for(const x of a){ const key=x.m.toLowerCase(); if(files.has(x.f)||seenM.has(key)) continue; files.add(x.f); seenM.add(key); pick.push([x.m,x.c,x.w,x.v]); if(pick.length===3) break; }
  EX[root]=pick; }
fs.writeFileSync(out,'window.DICC_EJ='+JSON.stringify(EX)+';\n');
console.log(files.length,'files,',pairs.length,'M/C pairs,',kept,'usable sentences,',Object.keys(EX).length,'roots with examples,',fs.statSync(out).size,'bytes');
