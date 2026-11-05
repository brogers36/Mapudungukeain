/* Analyst rulings applied to the dictionary's copy of the parser engine (appended by extract.js).
   2026-11-04: chillka is a root and is never split (chillka-tu-n 'leer', not chi-l-l-ka-tu-n). */
RULED_ROOTS.push('chillka');
/* 2026-11-05: pipi- is a reduplicated root (already kept whole); give it Augusta's sense of pipingen so the meaning
   panel stops guessing. treka-tu-, nentu-tu-, kintu-tu- are root + -tu-: the roots are verbs, and -tu- gets the
   restorative reading (slot 16), not the verbaliser default (36); set per root in TU_LEX so nothing else changes. */
RULED_ROOTS.push('pipi');
GLOSS['pipi']={d:'Decir siempre lo mismo',src:'R'};   /* after Augusta's pipingen 'decir o repetir siempre una misma cosa'; keep it short, the slot rules read the gloss */
CATLEX['pipi']='verb';   /* pipi- is a verb root, so root-adjacent -nge- is the passive */
TU_LEX['treka']='16'; TU_LEX['nentu']='16'; TU_LEX['kintu']='16';   /* analyst ruling 2026-11-05: kintu- and nentu- are already transitive and treka- is not made transitive with -tu- (that takes -ñma- or -l-), so -tu- here is the restorative, slot 16 */
for(const s of ['trekatu','nentutu','kintutu']) LEX_STEMS.delete(s);   /* analyst ruling 2026-11-05 */
/* 2026-11-05: yow- is llow- 'recibir, aceptar' (analyst ruling); nentu- is entu- 'sacar' (Augusta lists nentun only as a
   cross-reference, which the meaning panel otherwise prints as '▹ entu') */
GLOSS['yow']={d:'Recibir, aceptar',src:'R'};
GLOSS['nentu']={d:'Sacar',src:'R'}; GLOSS['nentun']={d:'Sacar',src:'R'}; if(typeof GLOSS_VIEW!=='undefined' && GLOSS_VIEW['nentun']) GLOSS_VIEW['nentun']={d:'Sacar',src:'R'};
