// Arma verbos/raices.js: las raíces verbales del núcleo revisado y del diccionario de Augusta (1916) tal como las publica el diccionario
// (diccionario/datos.js), con su glosa, la marca gramatical de Augusta (tr., n., r., rec.) y la frecuencia en AVENUE.
// Uso: node tools/verbos/make_raices.js        (no necesita nada fuera de este repositorio)
const fs=require('fs'),path=require('path');
global.window={};require(path.join(__dirname,'..','..','diccionario','datos.js'));
const VBsrc=fs.readFileSync(path.join(__dirname,'..','..','verbos','datos.js'),'utf8');const AV=new Map(JSON.parse(VBsrc.slice(VBsrc.indexOf('{'),VBsrc.lastIndexOf('}')+1)).roots.map(r=>[r[0],r[1]]));
// raíces que terminan en ü por dictamen del autor (añadir aquí las que falten)
const U_ROOTS=new Set(['anü','müpü']);
const OK=/^[a-zñüḻṉṯ]+$/;
// raíz a partir de la forma de cita: -n tras vocal; -ün tras consonante, salvo que la raíz en -ü sea la que conoce AVENUE (anü-n, no an-ün)
function rootOf(h){if(/ün$/.test(h)){const c=h.slice(0,-2);const cc=/[^aeiouü]{2}$/.test(c.replace(/ll|ng|ch|tr/g,'C'));/* una raíz no termina en dos consonantes: allkü-n, no allk-ün */
  return(cc||U_ROOTS.has(c+'ü')||(AV.get(c+'ü')||0)>(AV.get(c)||0))?c+'ü':c}if(/[aeiou]n$/.test(h))return h.slice(0,-1);return''}
const TAG=/^(?:\([^)]*\)\s*)?(tr|n|r|rec|impers)\./;
const clean=s=>String(s||'').replace(/^(?:\([^)]*\)\s*)?(?:(?:tr|n|r|rec|impers)\.\s*(?:y\s*)?,?\s*)+/,'').replace(/\s+/g,' ').trim().slice(0,70);
const by=new Map();
// 1) núcleo revisado del diccionario: verbos de una palabra cuya glosa es un infinitivo
for(const e of window.DICC.core){const m=String(e.m||'');if(!OK.test(m)||!/n$/.test(m))continue;const first=String(e.es||'').split(/[\s,;(]/)[0];if(e.p!=='v'&&!/(ar|er|ir|ír)(se)?$/.test(first))continue;
  const r=rootOf(m);if(!r||by.has(r))continue;by.set(r,{r,f:e.f||0,es:String(e.es||'').slice(0,70),en:String(e.en||'').slice(0,70),tags:[],src:'N'})}
// 2) Augusta (1916)
for(const e of window.DICC.aug){if(e.p!=='v'||!OK.test(e.h||''))continue;const r=rootOf(e.h)||(OK.test(e.r||'')?e.r:'');if(!r)continue;const m=TAG.exec(e.d||'');const tag=m?m[1]:'';const es=clean(e.s),en=String(e.en||'').slice(0,70);
  const o=by.get(r);if(!o){by.set(r,{r,f:e.f||0,es,en,tags:tag?[tag]:[],src:'A'})}
  else{o.f=Math.max(o.f,e.f||0);if(o.src==='A'){if(es&&o.es.indexOf(es)<0&&o.es.length<60)o.es=(o.es?o.es+' | ':'')+es;if(en&&o.en.indexOf(en)<0&&o.en.length<60)o.en=(o.en?o.en+' | ':'')+en}else o.src='NA';if(tag&&o.tags.indexOf(tag)<0)o.tags.push(tag)}}
const rows=[...by.values()].sort((a,b)=>b.f-a.f||(a.r<b.r?-1:1)).map(o=>[o.r,o.f,o.es,o.en,o.tags.join(' '),o.src]);
fs.writeFileSync(path.join(__dirname,'..','..','verbos','raices.js'),'/* Generado por tools/verbos/make_raices.js; no editar a mano. Raíces verbales del diccionario Tañi Nemülkawe: [raíz, frecuencia de la raíz en AVENUE, glosa en español, glosa en inglés (si hay), marca de Augusta (tr, n, r, rec), fuente: N = núcleo revisado, A = Augusta (1916), NA = ambos]. */\nconst VB_RAICES='+JSON.stringify(rows)+';\n');
const t={};rows.forEach(r=>{t[r[4]||'(sin marca)']=(t[r[4]||'(sin marca)']||0)+1});
const sr={};rows.forEach(r=>{sr[r[5]]=(sr[r[5]]||0)+1});console.log('fuentes:',JSON.stringify(sr));console.log('raíces:',rows.length,'| con inglés:',rows.filter(r=>r[3]).length,'| marcas:',JSON.stringify(t));
