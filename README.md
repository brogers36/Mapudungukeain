# Mapudungukeaiñ Fill Püle

Un juego para aprender mapudungun (grafemario Unificado), con niveles desde Principiante hasta Kimche, lecturas, pronunciación, vestuario, lof, palin y epew.

Juega en: https://brogers36.github.io/Mapudungukeain/

Diccionario compañero, **Tañi Nemülkawe: Yeniekeafiel ñi Kewün Fill Püle** (mapudungun, español e inglés, con juegos de vocabulario): https://brogers36.github.io/Mapudungukeain/diccionario/ · cómo se arma: `tools/dicc/README.md`.

Sitio de las dos apps (qué son y cómo instalarlas): https://brogers36.github.io/Mapudungukeain/apps/

Todo el juego está en un solo archivo, `index.html`. El progreso se guarda en el navegador de cada jugador.

## App

El sitio funciona como app instalable (PWA): en Android, Chrome ofrece «Instalar la app»; en iPhone/iPad, Safari → Compartir → «Añadir a pantalla de inicio». Una vez abierto, el juego funciona sin conexión.

`tools/make_site.py` arma `index.html`, el manifiesto, los íconos y `sw.js` a partir del archivo del juego.
