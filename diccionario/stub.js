/* Minimal browser stand-ins so the parser page's script can run under Node or in a Web Worker. */
(function(G){
const mk=()=>new Proxy(function(){},{get:(t,k)=>k==='value'?'':(k===Symbol.toPrimitive?()=>'':mk()),apply:()=>mk(),set:()=>true});
if(typeof G.document==='undefined') G.document={getElementById:()=>mk(),querySelector:()=>mk(),querySelectorAll:()=>[],createElement:()=>mk(),addEventListener(){},body:mk(),title:'',documentElement:mk()};
if(typeof G.window==='undefined') G.window=G;
try{ if(typeof G.localStorage==='undefined') G.localStorage={getItem:()=>null,setItem(){}}; }catch(e){}
if(typeof G.addEventListener==='undefined') G.addEventListener=()=>{};
if(typeof G.location==='undefined') G.location={hash:'',search:''};
})(globalThis);
