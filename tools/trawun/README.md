# Trawün: el servicio de la comunidad (Cloudflare Worker + D1)

`trawun/` es la página de la comunidad del juego: conversación en mapudungun (canal «Mapudungun mew», solo en
mapudungun, y «Ramtun», preguntas en cualquier idioma) y fotos (vestuario, progreso, otras). Mientras
`var TRAWUN_API="";` esté vacío en `trawun/index.html`, la página funciona en **vista previa**: todo se queda en el
teléfono de cada persona y nadie más lo ve. Para que sea compartida hay que publicar este servicio y poner su dirección
en `TRAWUN_API`.

Archivos: `worker.js` (el servicio), `schema.sql` (las tablas), `wrangler.toml`, `deploy.mjs` (publica todo de una vez),
`build_figura.py` (copia el dibujo de los personajes del juego a `trawun/figura.js`; volver a correrlo si cambia el
Vestuario).

## Publicarlo: un solo comando desde tu computadora

Con Node.js 18 o más nuevo y una copia del repositorio: `node tools/trawun/deploy.mjs`. Abre el navegador una vez
para autorizar tu cuenta de Cloudflare (la misma que la copia en línea del progreso). Crea la base y las tablas,
publica el servicio, crea una **clave de moderación** al azar y la muestra una sola vez. Guárdala tú; no la mandes a
nadie. Después manda solo la dirección del servicio (termina en `.workers.dev`) para ponerla en `TRAWUN_API`.

## Moderación

Abrir `https://brogers36.github.io/Mapudungukeain/trawun/?admin` y pegar la clave. Ahí aparecen:

- las fotos subidas, que **no se muestran a nadie** (salvo a quien la subió) hasta que las apruebes;
- los mensajes y publicaciones con avisos (⚑). Con tres avisos de personas distintas se ocultan solos hasta que decidas.

Acciones: aprobar o mostrar, ocultar, borrar, y bloquear un apodo (oculta todo lo suyo y no puede volver a escribir).

## Qué guarda y cómo protege a menores

- Solo un apodo (2 a 20 letras o números). Ni nombre, ni correo, ni contraseña: el teléfono guarda una clave al azar
  que identifica a quien escribe. Si se borra el navegador, se pierde el apodo (se puede elegir otro).
- Los mensajes y comentarios con correos, teléfonos, enlaces, usuarios de redes (@…) o nombres de otras apps se
  rechazan, en la página y otra vez en el servicio.
- Las fotos se vuelven a dibujar en el teléfono antes de enviarse (máximo 1280 px, JPEG): eso borra los datos EXIF,
  como la ubicación GPS. Esperan aprobación antes de mostrarse.
- Las publicaciones de vestuario y de progreso llevan solo datos del juego (el personaje, la ropa, los números); la
  página las dibuja, así que se muestran enseguida.
- Límites: un mensaje cada 3 segundos y 40 cada 10 minutos; 20 publicaciones y 5 fotos al día por apodo. Los mensajes
  de más de seis meses se borran solos.
- Solo se aceptan peticiones desde `https://brogers36.github.io` (variable `ORIGINS`).
