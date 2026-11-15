/* Constructor de verbos del mapudungun: reglas y cuadros de terminaciones.
   © 2026 Brandon M. A. Rogers. Los cuadros transitivos siguen los de J. Becker Peña; el cotejo es con Smeets (2008), A Grammar of Mapuche.
   PARA ACTUALIZAR: edita las tablas de este archivo (INTR, TR, SM, NEGIMP, SUF) y guarda; la app toma los cambios sola.
   TO UPDATE: edit the tables in this file (INTR, TR, SM, NEGIMP, SUF) and commit; the app picks up the change by itself. */
// Mapudungun verb builder: generation rules. Used by the browser tool and by the Node validation script.
// Sources:
//  - Intransitive endings, the imperative and allomorphy: B. Rogers's parser rulings and AVENUE attestation counts.
//  - Transitive agent>patient endings: the four J. Becker Peña charts (indicative, imperative, conditional, subordinate),
//    checked cell by cell against the chart images on 2026-11-15, with g rewritten as ng.
//  - Cross-check and slot order: Smeets (2008), A Grammar of Mapuche, Appendix "Paradigms" (tables 1-4, negative
//    imperative list), 26.1, 26.4.2, 26.4.9 and 26.23. Slot-23 agent markers -mu- (2A) and -(u)w- (1A) are placed
//    in slot 23, so they precede directionals, negation, tense and the like.
(function(root){
const V=/[aeiouü]$/;const isV=s=>V.test(s);
const SUBJ=['1s','1d','1p','2s','2d','2p','3s','3d','3p'];
const INTR={
 ind:{V:['n','yu','yiñ','ymi','ymu','ymün','y','yngu','yngün'],C:['ün','iyu','iyiñ','imi','imu','imün','i','ingu','ingün']},
 cond:{V:['li','liyu','liyiñ','lmi','lmu','lmün','le','le engu','le engün'],C:['li','liyu','liyiñ','ülmi','ülmu','ülmün','le','le engu','le engün']},
 imp:{V:['chi','yu','yiñ','nge','mu','mün','pe','pe engu','pe engün'],C:['chi','iyu','iyiñ','nge','mu','mün','pe','pe engu','pe engün']}};
// Smeets's spellings where they differ (appendix table 2: kon-üy-m-i, kon-y-u, amu-l-i-u, amu-l-i-iñ)
const INTR_SM={ind:{C:[null,'yu','yiñ','üymi','üymu','üymün','üy','üyngu','üyngün']},cond:{V:[null,'liu','liiñ'],C:[null,'liu','liiñ']},imp:{C:[null,'yu','yiñ']}};
const same3=(a,b)=>({'2s':a,'2d':a,'2p':a,'3':b});
// Becker Peña charts
const TR={
 ind:{'1s':{'2s':'eyu','2d':'wiyiñ','2p':'wiyiñ','3':'fiñ'},'1d':same3('wiyiñ','fiyu'),'1p':same3('wiyiñ','fiyiñ'),
  '2s':{'1s':'en','1d':'muyu','1p':'muiñ','3':'fimi'},'2d':{'1s':'mun','1d':'muyu','1p':'muiñ','3':'fimu'},'2p':{'1s':'mun','1d':'muyu','1p':'muiñ','3':'fimün'},
  '3':{'1s':'enew','1d':'eyumew','1p':'eiñmew','2s':'eymew','2d':'eymumew','2p':'eymünmew','3':'fi','3inv':'eyew'}},
 cond:{'1s':{'2s':'eliyu','2d':'wliyiñ','2p':'wliyiñ','3':'fili'},'1d':same3('wliyiñ','filiyu'),'1p':same3('wliyiñ','filiyiñ'),
  '2s':{'1s':'eli','1d':'muliyu','1p':'muliyiñ','3':'filmi'},'2d':{'1s':'muli','1d':'muliyu','1p':'muliyiñ','3':'filmu'},'2p':{'1s':'muli','1d':'muliyu','1p':'muliyiñ','3':'filmün'},
  '3':{'1s':'elimew','1d':'eliyumew','1p':'eliyiñmew','2s':'elmew','2d':'elimumew','2p':'elimünmew','3':'file','3inv':'eliyew'}},
 imp:{'1s':{'3':'fichi'},'1d':{'3':'fiyu'},'1p':{'3':'fiiñ'},'2s':{'1s':'en','1d':'momu','1p':'moiñ','3':'finge'},'2d':{'1s':'muchi','1d':'momu','1p':'moiñ','3':'fimu'},'2p':{'1s':'mochi','1d':'momu','1p':'moiñ','3':'fimün'},
  '3':{'1s':'echimew','1d':'eyumew','1p':'eiñmew','2s':'engemew','2d':'eymumew','2p':'eymünmew','3':'fipe','3inv':'epemew'}},
 sub:{'1s':{'2s':'fiel','2d':'wfiel','2p':'wfiel','3':'fiel'},'1d':same3('wfiel','fiel'),'1p':same3('wfiel','fiel'),
  '2s':{'1s':'fiel','1d':'mufiel','1p':'mufiel','3':'fiel'},'2d':{'1s':'mufiel','1d':'mufiel','1p':'mufiel','3':'fiel'},'2p':{'1s':'mufiel','1d':'mufiel','1p':'mufiel','3':'fiel'},
  '3':{'1s':'etew','1d':'etew','1p':'etew','2s':'etew','2d':'etew','2p':'etew','3':'fiel','3inv':'etew'}}};
const POSS={'1s':{'2s':'mi','2d':'mi','2p':'mi','3':'ñi'},'1d':{'2s':'mu','2d':'mu','2p':'mu','3':'yu'},'1p':{'2s':'mün','2d':'mün','2p':'mün','3':'iñ'},
 '2s':{'1s':'mi','1d':'mi','1p':'mi','3':'mi'},'2d':{'1s':'mu','1d':'mu','1p':'mu','3':'mu'},'2p':{'1s':'mün','1d':'mün','1p':'mün','3':'mün'},
 '3':{'1s':'ñi','1d':'yu','1p':'iñ','2s':'mi','2d':'mu','2p':'mün','3':'ñi','3inv':'ñi'}};
// Smeets, appendix table 3 and 4 (absent cell = not in her paradigm)
const SM={
 ind:{'1s':{'2s':'eyu','2d':'wyiñ','2p':'wyiñ','3':'fin'},'1d':same3('wyiñ','fiyu'),'1p':same3('wyiñ','fiyiñ'),
  '2s':{'1s':'en','1d':'muyu','1p':'muyiñ','3':'fiymi'},'2d':{'1s':'mun','1d':'muyu','1p':'muyiñ','3':'fiymu'},'2p':{'1s':'mun','1d':'muyu','1p':'muyiñ','3':'fiymün'},
  '3':{'1s':'enew','1d':'eyumew','1p':'eyiñmew','2s':'eymew','2d':'eymumew','2p':'eymünmew','3':'fiy','3inv':'eyew'}},
 cond:{'1s':{'2s':'elyu','2d':'wliiñ','2p':'wliiñ','3':'fili'},'1d':same3('wliiñ','filiu'),'1p':same3('wliiñ','filiiñ'),
  '2s':{'1s':'eli','1d':'muliu','1p':'muliiñ','3':'filmi'},'2d':{'1s':'muli','1d':'muliu','1p':'muliiñ','3':'filmu'},'2p':{'1s':'muli','1d':'muliu','1p':'muliiñ','3':'filmün'},
  '3':{'1s':'elimew','1d':'elyumew','1p':'elyiñmew','2s':'elmew','2d':'elmumew','2p':'elmünmew','3':'file','3inv':'elyew'}},
 imp:{'1s':{'3':'fichi'},'1d':{'3':'fiyu'},'1p':{'3':'fiyiñ'},'2s':{'1s':'en','1d':'muyu','1p':'muyiñ','3':'finge'},'2d':{'1s':'muchi','1d':'muyu','1p':'muyiñ','3':'fimu'},'2p':{'1s':'muchi','1d':'muyu','1p':'muyiñ','3':'fimün'},
  '3':{'1s':'echimew','3':'fipe'}},
 sub:{'1s':{'2s':'fiel','3':'fiel'},'1d':{'3':'fiel'},'1p':{'3':'fiel'},'2s':{'1s':'fiel','1d':'mufiel','1p':'mufiel','3':'fiel'},'2d':{'1s':'mufiel','1d':'mufiel','1p':'mufiel','3':'fiel'},'2p':{'1s':'mufiel','1d':'mufiel','1p':'mufiel','3':'fiel'},
  '3':{'1s':'etew','1d':'etew','1p':'etew','2s':'etew','2d':'etew','2p':'etew','3':'fiel','3inv':'etew'}}};
// Smeets, appendix: transitive negative imperative (the ending follows -ki-, slot 10)
const NEGIMP={'2s>1s':{e:'eli',alts:['keeli','keli']},'2d>1s':{e:'mulchi'},'2p>1s':{e:'mulchi'},'2s>1d':{e:'mulyu'},'2d>1d':{e:'mulyu'},'2p>1d':{e:'mulyu'},'2s>1p':{e:'mulyiñ'},'2d>1p':{e:'mulyiñ'},'2p>1p':{e:'mulyiñ'},
 '1s>3':{e:'filchi'},'1d>3':{e:'filyu'},'1p>3':{e:'filyiñ'},'2s>3':{e:'filnge'},'2d>3':{e:'filmu'},'2p>3':{e:'filmün'},'3>1s':{e:'elchimu',alts2:['elimu']}};
const SUF=[
 {id:'nie',slot:32,V:'nie',C:'nie',gl:'PROG.PERS',es:'mantener, tener V-do',en:'keep, have V-ed'},
 {id:'kunu',slot:32,V:'künu',C:'künu',gl:'PFV.PERS',es:'dejar V-do',en:'leave V-ed'},
 {id:'refl',slot:31,V:'w',C:'uw',gl:'REFL',es:'reflexivo o recíproco',en:'reflexive or reciprocal'},
 {id:'iaw',slot:30,V:'yaw',C:'iaw',altC:'kiaw',lab:'yaw / iaw',gl:'CIRC',es:'andar V-ndo',en:'go around V-ing'},
 {id:'le',slot:28,V:'le',C:'küle',altC:'le',gl:'STAT',es:'estativo, estar V-ndo',en:'stative, be V-ing'},
 {id:'meke',slot:28,V:'meke',C:'meke',gl:'PROG',es:'progresivo, estar ocupado V-ndo',en:'progressive, be busy V-ing'},
 {id:'ben',slot:27,V:'lel',C:'el',lab:'(l)el',gl:'BEN',es:'benefactivo, para alguien',en:'benefactive, for someone'},
 {id:'io',slot:26,V:'ñma',C:'üñma',gl:'IO',es:'objeto indirecto, a alguien (afectado)',en:'indirect object, affected person'},
 {id:'pass',slot:23,V:'nge',C:'nge',gl:'PASS',es:'pasiva, agente no especificado',en:'passive, unspecified agent'},
 {id:'me',slot:20,V:'me',C:'me',gl:'THITHER',es:'ir a V (y volver)',en:'go and V'},
 {id:'we',slot:19,V:'we',C:'we',gl:'PERSIST',es:'ya, todavía; con negación: ya no',en:'already, still; with negation: no longer'},
 {id:'r',slot:18,V:'r',C:'ür',gl:'INTERR',es:'de pasada (exige -pa- o -pu-)',en:'in passing (needs -pa- or -pu-)',needs:['pa','pu']},
 {id:'pa',slot:17,V:'pa',C:'pa',gl:'HITHER',es:'venir a V, hacia acá',en:'come and V, hither'},
 {id:'pu',slot:17,V:'pu',C:'pu',gl:'LOC',es:'V allá, al llegar',en:'V there, on arrival'},
 {id:'tu',slot:16,V:'tu',C:'tu',gl:'REST',es:'de nuevo, de vuelta',en:'again, back'},
 {id:'ka',slot:16,V:'ka',C:'ka',gl:'CONT',es:'seguir V-ndo',en:'keep on V-ing'},
 {id:'ke',slot:14,V:'ke',C:'ke',gl:'HAB',es:'habitual, siempre',en:'habitual, always'},
 {id:'pe',slot:13,V:'pe',C:'pe',gl:'PROX',es:'recién, hace poco',en:'just now, recently'},
 {id:'rke',slot:12,V:'rke',C:'ürke',gl:'REPORT',es:'reportativo: dicen que, resulta que',en:'reportative: they say, it turns out'},
 {id:'lle',slot:11,V:'lle',C:'lle',gl:'AFF',es:'afirmativo, ciertamente',en:'affirmative, certainly'},
 {id:'a',slot:9,V:'a',C:'a',gl:'FUT',es:'futuro, no realizado',en:'future, non-realized'},
 {id:'fu',slot:8,V:'fu',C:'fu',gl:'IPD',es:'pasado sin efecto presente, contraexpectativa',en:'impeditive: past without present effect'}];
const EXCL=[['nie','kunu'],['le','meke'],['pa','pu'],['tu','ka'],['refl','pass']];
const NEG={ind:'la',cond:'no',imp:'kil',nf:'no',sub:'no'};
const NONFIN=[{id:'n',V:'n',C:'ün',gl:'INF',es:'infinitivo, nombre verbal',en:'infinitive, verbal noun'},{id:'lu',V:'lu',C:'lu',gl:'SVN',es:'el que V; cuando, porque V',en:'the one who Vs; when, because'},
 {id:'el',V:'el',C:'el',gl:'OVN',es:'lo V-do; que V (subordinada)',en:'what is V-ed; subordinate that-clause'},{id:'am',V:'am',C:'am',gl:'PURP',es:'para V',en:'in order to V'},{id:'ael',V:'ael',C:'ael',alt:'al',gl:'FUT-OVN',es:'para V, que V (futuro)',en:'to V, that will V'}];
function stem(rt,sel,mood,neg,extra,negMorph){
 let s=rt;const parts=[],notes=[];const list=SUF.filter(x=>sel.includes(x.id));
 if(neg){const m=negMorph||NEG[mood];list.push({id:'neg',slot:10,V:m,C:m,gl:mood==='imp'?'PROH':'NEG'})}
 if(extra)list.push(extra);
 list.sort((a,b)=>b.slot-a.slot);
 for(const x of list){let m=isV(s)?x.V:x.C;
  if(x.id==='a'&&/a$/.test(s)){m='ya';notes.push('fut_ya')}
  if(x.id==='le'&&!isV(s))notes.push('le_alt');if(x.id==='iaw'&&!isV(s))notes.push('iaw_alt');
  parts.push([m,x.slot,x.gl]);s+=m}
 return{s,parts,notes}}
// split a transitive ending into its slot-23 agent marker (if any) and the rest
function split(e,ag,pt){if(ag[0]==='2'&&pt[0]==='1'&&/^m[uo]/.test(e))return{pre:{id:'ag2',slot:23,V:e.slice(0,2),C:e.slice(0,2),gl:'2A'},rest:e.slice(2)};
 if(ag[0]==='1'&&pt[0]==='2'&&/^w/.test(e))return{pre:{id:'ag1',slot:23,V:'w',C:'uw',gl:'1A'},rest:e.slice(1)};return{pre:null,rest:e}}
function assemble(rt,sel,mood,neg,e,ag,pt,negMorph){const sp=split(e,ag,pt);const st=stem(rt,sel,mood,neg,sp.pre,negMorph);let rest=sp.rest;if(/^iy/.test(rest)&&isV(st.s))rest=rest.slice(1);return{s:st.s,parts:st.parts,ending:rest,notes:st.notes,word:st.s+rest}}
function build(o){ // o:{root,mood,subj,obj,neg,sel}
 const rt=o.root.trim().toLowerCase(),sel=o.sel||[],mood=o.mood,k=SUBJ.indexOf(o.subj);const alts=[];let A,ver,sm='',poss='',num3=false,notes=[],smForm='';
 if(!o.obj||o.obj==='none'){if(mood==='sub')return null;const st=stem(rt,sel,mood,o.neg);const C=!isV(st.s);const e=INTR[mood][C?'C':'V'][k];
  A={s:st.s,parts:st.parts,ending:e,notes:st.notes,word:st.s+e.split(' ')[0]};ver='intr';const se=((INTR_SM[mood]||{})[C?'C':'V']||[])[k];if(se){smForm=st.s+se;sm=se}
  if(e==='y'&&/e$/.test(st.s))alts.push(st.s.slice(0,-1)+'i');if(/yiñ$/.test(e)&&!C)alts.push(st.s+e.replace(/yiñ$/,'iñ'));
  if(mood==='cond'&&o.neg)alts.push(A.word.replace(/no(?=[^o]*$)/,'nu'));
  const form=st.s+e;return fin(form)}
 const ag=o.subj[0]==='3'?'3':o.subj,pt=o.obj;
 if(mood==='imp'&&o.neg){const c=NEGIMP[ag+'>'+pt];if(!c)return null;A=assemble(rt,sel,mood,true,c.e,ag,pt,'ki');ver='smeets';
  for(const a of(c.alts||[]))alts.push(A.word.replace(/kieli$/,a));for(const a of(c.alts2||[]))alts.push(A.word.replace(/elchimu$/,a));if(o.subj!=='3s'&&ag==='3')num3=true;return fin(A.word)}
 let e=(TR[mood][ag]||{})[pt];if(!e)return null;let se=(SM[mood][ag]||{})[pt];
 if(ag==='3'&&o.subj!=='3s'){if(mood==='ind'&&pt==='3'){e=o.subj==='3d'?'fingu':'fingün';se=o.subj==='3d'?'fiyngu':'fiyngün'}else num3=true}
 A=assemble(rt,sel,mood,o.neg,e,ag,pt);if(mood==='sub')poss=POSS[ag][pt];
 if(se){const B=assemble(rt,sel,mood,o.neg,se,ag,pt);if(B.word!==A.word){smForm=(mood==='sub'?POSS[ag][pt]+' ':'')+B.word;sm=se;ver='diff'}else ver='both'}else{ver='chartonly';sm=mood==='imp'?'imp3':(mood==='sub'?'wfiel':'')}
 if(mood==='sub'&&e==='mufiel'){const B=assemble(rt,sel,mood,o.neg,'fiel',ag,'3');alts.push(B.word);notes.push('mu_drop')}
 if(/mew$/.test(A.ending))alts.push(A.word.replace(/mew$/,'mu'));if(/finge$/.test(A.word))alts.push(A.word.replace(/finge$/,'fe'));
 if(/yiñ$/.test(A.ending)&&isV(A.s))alts.push(A.word.replace(/yiñ$/,'iñ'));
 return fin((poss?poss+' ':'')+A.word);
 function fin(form){return{form,word:A.word,poss,smForm,alts:[...new Set(alts)].filter(a=>a!==A.word&&a!==form),root:rt,parts:A.parts,ending:A.ending,ver,sm,num3,notes:[...A.notes,...notes],seg:[rt,...A.parts.map(p=>p[0]),A.ending].join('-')}}}
function nonfinite(o){const rt=o.root.trim().toLowerCase();const out=[];for(const nf of NONFIN){const sel=(o.sel||[]).filter(x=>!(nf.id==='ael'&&x==='a'));const st=stem(rt,sel,'nf',o.neg);
  let e=isV(st.s)?nf.V:nf.C;let form=st.s+e;const alts=[];if(nf.id==='ael'){if(/a$/.test(st.s)){form=st.s+'yael';alts.push(st.s+'yal')}else alts.push(st.s+'al');if(o.neg)alts.push(st.s.replace(/no$/,'nu')+'al')}
  if(nf.id==='el'&&/fu$/.test(st.s))alts.push(st.s.slice(0,-1)+'el');
  out.push({id:nf.id,form,alts,parts:st.parts,ending:e,gl:nf.gl,es:nf.es,en:nf.en,seg:[rt,...st.parts.map(p=>p[0]),e].join('-')})}return out}
function objectsFor(mood,subj,neg){const ag=subj[0]==='3'?'3':subj;if(mood==='imp'&&neg)return Object.keys(NEGIMP).filter(k=>k.startsWith(ag+'>')).map(k=>k.split('>')[1]);return Object.keys(TR[mood][ag]||{})}
const api={SUBJ,SUF,EXCL,NONFIN,INTR,TR,SM,NEGIMP,build,nonfinite,objectsFor,isV};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.VB=api;
})(typeof window!=='undefined'?window:globalThis);
