/* Usage: node extract.js GAME_index.html PARSER.html GOLD.csv OUTDIR
   Writes game_vocab.json (every word and phrase the game teaches), builder.json (word-building items from the
   hand-validated gold corpus, only where the parser's segmentation matches gold) and motor.js (the parser engine). */
const fs=require('fs'),path=require('path');require('./stub.js');
const [game,parser,gold,out]=process.argv.slice(2);
const g=fs.readFileSync(game,'utf8'); const gs=[...g.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).sort((a,b)=>b.length-a.length)[0];
(0,eval)(gs+'\n;globalThis.GD={STAGES,READINGS,EPEW};');
const D=globalThis.GD, vocab=[], seen=new Set();
const add=(m,es,en,src,kind,pic)=>{ if(!m||typeof m!=='string') return; const k=m.toLowerCase().trim(); if(seen.has(k)) return; seen.add(k);
  vocab.push({m:m.trim(),es,en,src,kind,pic:(typeof pic==='string'&&pic.length<9)?pic:null}); };
D.STAGES.forEach(st=>st.levels.forEach(l=>(l.words||[]).forEach(w=>add(w.m,w.es,w.en,l.es||l.mt||l.id,'nivel',w.pic))));
D.READINGS.forEach(r=>(r.gloss||[]).forEach(([m,es,en])=>add(m,es,en,'Lectura: '+(r.title&&r.title.es||r.title||''),'frase')));
D.EPEW.forEach(c=>(c.gloss||[]).forEach(([m,es,en])=>add(m,es,en,'Epew: '+c.t,'frase')));
fs.writeFileSync(path.join(out,'game_vocab.json'),JSON.stringify(vocab));
const p=fs.readFileSync(parser,'utf8'); const ps=[...p.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).sort((a,b)=>b.length-a.length)[0];
fs.writeFileSync(path.join(out,'motor.js'),'/* Mapudungun morphological parser engine (from the verb parser page), run inside a Web Worker. */\n'+ps.replace(/require\('\/home\/[^']*\/ortho\.js'\)/g,"require('./ortho.js')")+
  '\n;globalThis.MOTOR={parse43,inferCat,GX,ORTHO:(typeof ORTHO!=="undefined"?ORTHO:null),MEANING:(typeof MEANING!=="undefined"?MEANING:null)};\n');
(0,eval)(ps+'\n;globalThis.MOTOR={parse43,inferCat,GX,MEANING};');
const M=globalThis.MOTOR, rows=fs.readFileSync(gold,'utf8').trim().split('\n').slice(1);
const items=[]; const seenB=new Set();
for(const line of rows){ const c=line.split(','); const tok=(c[1]||'').toLowerCase(), seg=(c[2]||'').toLowerCase();
  if(!tok||!seg||/[()\[\]]/.test(seg)||c[3]) continue; const ms=seg.split('-'); if(ms.length<3||ms.length>5) continue; if(seenB.has(tok)) continue;
  let r=null; try{ r=M.parse43(tok,'',3,false); if(r&&!r.nvRule){const k=M.inferCat(r.root); if(k){const r2=M.parse43(tok,k,3,false); if(r2&&!r2.nvRule) r=r2}} }catch(e){}
  if(!r||r.wclass!=='verb') continue; const pm=[r.root].concat((r.m||[]).map(x=>x.f)); if(pm.join('-')!==seg) continue;
  let mean=null; try{ const X=M.MEANING.compose(r,M.GX()); if(X&&X.ok) mean=X.sentence; }catch(e){} if(!mean) continue;
  seenB.add(tok); items.push({w:tok,m:ms,g:['ROOT'].concat((r.m||[]).map(x=>x.gloss||'')),s:[null].concat((r.m||[]).map(x=>x.slot==null?null:x.slot)),es:mean});
}
fs.writeFileSync(path.join(out,'builder.json'),JSON.stringify(items));
console.log('vocab',vocab.length,'builder',items.length);
