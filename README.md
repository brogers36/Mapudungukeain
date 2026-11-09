# Mapudungukeaiñ Fill Püle

Un juego para aprender mapudungun (grafemario Unificado), con niveles desde Principiante hasta Kimche, lecturas, pronunciación, vestuario, lof, palin y epew.

Juega en: https://brogers36.github.io/Mapudungukeain/

Diccionario compañero, **Tañi Nemülkawe: Miawülkeafiel ñi Kewün Fill Püle** (mapudungun, español e inglés, con juegos de vocabulario): https://brogers36.github.io/Mapudungukeain/diccionario/ (página: https://brogers36.github.io/Mapudungukeain/diccionario/acerca/) · cómo se arma: `tools/dicc/README.md`.

Todo el juego está en un solo archivo, `index.html`. El progreso se guarda en el navegador de cada jugador.

## App

El sitio funciona como app instalable (PWA): en Android, Chrome ofrece «Instalar la app»; en iPhone/iPad, Safari → Compartir → «Añadir a pantalla de inicio». Una vez abierto, el juego funciona sin conexión.

`tools/make_site.py` arma `index.html`, el manifiesto, los íconos y `sw.js` a partir del archivo del juego.

## Derechos

El analizador morfológico que usa el diccionario (`diccionario/motor.js`) es © 2026 Brandon M. A. Rogers, todos los derechos
reservados: no se permite copiarlo, modificarlo, redistribuirlo ni reutilizarlo, total o parcialmente, sin permiso escrito.
The morphological parser used by the dictionary (`diccionario/motor.js`) is © 2026 Brandon M. A. Rogers, all rights
reserved: no copying, modification, redistribution or reuse, in whole or in part, without written permission.
