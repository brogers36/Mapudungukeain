// Arma verbos/datos.js: conteos de AVENUE por palabra, lista de raíces con glosa y resumen de validación.
// Uso: node tools/verbos/make_datos.js <index.json> <stats.json> <vb_validation.json>
// Los tres archivos de entrada salen del índice de AVENUE (build_index.js, stats.js, vb_validate.js), que no vive en este
// repositorio porque contiene el texto del corpus. Solo hace falta volver a correrlo si cambia el analizador o el corpus.
const fs=require('fs'),path=require('path');const [,,IDX,STATS,VALF]=process.argv;
const I=JSON.parse(fs.readFileSync(IDX,'utf8')),S=JSON.parse(fs.readFileSync(STATS,'utf8')),V=JSON.parse(fs.readFileSync(VALF,'utf8'));
const norm=w=>w.toLowerCase().replace(/v/g,'f').replace(/'/g,'');const C=new Map();for(const w in I.types){const k=norm(w);C.set(k,(C.get(k)||0)+I.types[w][0])}
const counts=[...C.entries()].sort((a,b)=>a[0]<b[0]?-1:1).map(e=>e[0]+'\t'+e[1]).join('\n');
const roots=S.roots.filter(r=>r.gloss&&/^[a-zñü]+$/.test(r.root)&&['A','L','S','R'].includes(r.src)).slice(0,400).map(r=>[r.root,r.n,r.gloss.replace(/\s+/g,' ').slice(0,60)]);
const data={counts,roots,val:{roots:V.roots,total:V.total},build:{date:I.manifest.built.slice(0,10),parser:I.manifest.parser.file,parser_sha256:I.manifest.parser.sha256,corpus_sha256:I.manifest.corpus.sha256}};
fs.writeFileSync(path.join(__dirname,'..','..','verbos','datos.js'),'/* Generado por tools/verbos/make_datos.js; no editar a mano. Conteos de formas en el corpus AVENUE (análisis automático), raíces frecuentes con glosa de Augusta (1916) y resumen de validación. */\nconst VB_DATA='+JSON.stringify(data)+';\n');
console.log('types',C.size,'roots',roots.length);
