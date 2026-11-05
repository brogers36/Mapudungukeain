/* Analyst rulings applied to the dictionary's copy of the parser engine (appended by extract.js).
   2026-11-04: chillka is a root and is never split (chillka-tu-n 'leer', not chi-l-l-ka-tu-n). */
RULED_ROOTS.push('chillka');
/* 2026-11-05: pipi- is a reduplicated root (already kept whole); give it Augusta's sense of pipingen so the meaning
   panel stops guessing. treka-tu-, nentu-tu-, kintu-tu- are root + -tu-: the roots are verbs, so -tu- gets the
   verb-root reading (slot 33) instead of the verbaliser default (36); set per root in TU_LEX so nothing else changes. */
RULED_ROOTS.push('pipi');
GLOSS['pipi']={d:'Decir siempre lo mismo',src:'R'};   /* after Augusta's pipingen 'decir o repetir siempre una misma cosa'; keep it short, the slot rules read the gloss */
CATLEX['pipi']='verb';   /* pipi- is a verb root, so root-adjacent -nge- is the passive */
TU_LEX['treka']='33'; TU_LEX['nentu']='33'; TU_LEX['kintu']='33';
for(const s of ['trekatu','nentutu','kintutu']) LEX_STEMS.delete(s);   /* analyst ruling 2026-11-05 */
