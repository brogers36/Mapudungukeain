# Build the GitHub Pages copy of the game: the standalone page plus the PWA head tags,
# service-worker registration and an Android install button. Usage: python3 make_site.py GAME.html OUTDIR
import sys, shutil, os, time
src, out = sys.argv[1], sys.argv[2]
s = open(src).read()
head = '''<meta name="theme-color" content="#14122a">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Mapudungun">
'''
tail = '''<button id="pwaInstall" hidden style="position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:50;background:#c8322f;color:#f3efe6;border:0;border-radius:999px;padding:12px 18px;font:700 1rem 'Atkinson Hyperlegible',system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4);cursor:pointer">Instalar la app</button>
<script>
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(()=>{}); }); }
(function(){ let ev=null; const b=document.getElementById('pwaInstall');
  try{ if((localStorage.getItem('mpk_lang')||'').indexOf('en')>=0) b.textContent='Install the app'; }catch(e){}
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); ev=e; b.hidden=false; });
  b.addEventListener('click', async () => { if(!ev) return; ev.prompt(); try{ await ev.userChoice; }catch(e){} ev=null; b.hidden=true; });
  window.addEventListener('appinstalled', () => { b.hidden=true; });
})();
</script>
'''
GC = '''<script>
/* Visit, install and lesson counts sent to GoatCounter as a 1x1 image request (no cookies, no personal data, no third-party
   script, so script blockers that stop gc.zgo.at don't stop it). Nothing is sent from a file copy or while offline. */
(function(){
  if(location.protocol!=='https:') return;
  var BASE='https://brogers36.goatcounter.com/count';
  function gc(path,title,event){ try{
    var u=BASE+'?p='+encodeURIComponent(path)+'&t='+encodeURIComponent(title||'')+(event?'&e=true':'')+
      (event?'':'&r='+encodeURIComponent(document.referrer||''))+'&s='+encodeURIComponent(screen.width+','+screen.height+','+(window.devicePixelRatio||1))+
      '&rnd='+Math.random().toString(36).slice(2);
    var img=new Image(); img.src=u; }catch(e){} }
  window.mpkCount=function(p,t){ gc(p,t,true); };
  gc(location.pathname||'/', document.title, false);
  window.addEventListener('appinstalled',function(){ gc('app-installed','App installed',true); });
  var standalone=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
  var seen=false; try{ seen=sessionStorage.getItem('mpk_gc_launch')==='1'; }catch(e){}
  if(standalone && !seen){ try{ sessionStorage.setItem('mpk_gc_launch','1'); }catch(e){} gc('home-screen-launch','Opened from home screen',true); }
})();
</script>
'''
assert s.count('<meta charset="utf-8">') >= 1 and s.count('</body>') == 1
s = s.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n' + head, 1).replace('</body>', tail + ('' if 'goatcounter' in s else GC) + '</body>', 1)
os.makedirs(out, exist_ok=True)
open(os.path.join(out, 'index.html'), 'w').write(s)
here = os.path.dirname(os.path.abspath(__file__))
for f in ['manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']:
    shutil.copy(os.path.join(here, f), out)
open(os.path.join(out, 'sw.js'), 'w').write(open(os.path.join(here, 'sw.js')).read().replace('__VERSION__', time.strftime('%Y%m%d%H%M%S')))
print('built', out)
