# Trawün: el servicio de la comunidad (Cloudflare Worker + D1)

`trawun/` es la página de la comunidad del juego: conversación en mapudungun (canal «Mapudungun mew», solo en
mapudungun, y «Ramtun», preguntas en cualquier idioma) y fotos (vestuario, progreso, otras). Mientras
`var TRAWUN_API="";` esté vacío en `trawun/index.html`, la página funciona en **vista previa**: todo se queda en el
teléfono de cada persona y nadie más lo ve. Para que sea compartida hay que publicar este servicio y poner su dirección
en `TRAWUN_API`.

Archivos: `worker.js` (el servicio), `schema.sql` (las tablas), `wrangler.toml`, `deploy.mjs` (publica todo de una vez),
`build_figura.py` (copia el dibujo de los personajes del juego a `trawun/figura.js`; volver a correrlo si cambia el
Vestuario).

## Sin internet

El juego y el diccionario siguen en GitHub Pages y funcionan completos sin internet; Cloudflare solo guarda lo que
Trawün comparte. La página de Trawün también abre sin conexión (el juego la guarda al instalarse) y muestra los últimos
mensajes y publicaciones que vio; para escribir, compartir o entrar por primera vez hace falta internet.

## Publicarlo: un solo comando desde tu computadora

Para publicar Trawün y la copia en línea del progreso juntos: `node tools/publicar_servicios.mjs`. Si la computadora
ya tiene una sesión de Cloudflare, el comando muestra qué cuenta es y pregunta si usarla; responde «n» para cerrarla y
entrar con otra (por ejemplo, una cuenta nueva creada en https://dash.cloudflare.com/sign-up).

Solo Trawün:

Con Node.js 18 o más nuevo y una copia del repositorio: `node tools/trawun/deploy.mjs`. Abre el navegador una vez
para autorizar tu cuenta de Cloudflare (la misma que la copia en línea del progreso). Crea la base y las tablas,
publica el servicio, crea una **clave de moderación** al azar y la muestra una sola vez. Guárdala tú; no la mandes a
nadie. Después manda solo la dirección del servicio (termina en `.workers.dev`) para ponerla en `TRAWUN_API`.

## Moderación

Abrir `https://brogers36.github.io/Mapudungukeain/trawun/?admin` y pegar la clave. Ahí aparecen:

- las fotos subidas, que **no se muestran a nadie** (salvo a quien la subió) hasta que las apruebes;
- los mensajes y publicaciones con avisos (⚑). Con tres avisos de personas distintas se ocultan solos hasta que decidas.

Acciones: aprobar o mostrar, ocultar, borrar, y bloquear un apodo (oculta todo lo suyo y no puede volver a escribir).

## Avisos en el teléfono

**Recomendado: Telegram.** 1) En Telegram, abre @BotFather, escribe `/newbot` y sigue los pasos; te da un token.
2) Abre tu bot nuevo y mándale «hola». 3) Corre `node tools/trawun/deploy.mjs --telegram` y pega el token. El script
encuentra tu conversación, guarda todo en Cloudflare y te manda un mensaje de prueba. Desde ahí, los avisos llegan
como mensajes del bot, con un botón «Abrir moderación».

La opción de abajo (ntfy) queda como alternativa, pero desde Cloudflare falla a menudo (errores 429 y 522).

El servicio avisa al teléfono del moderador cuando llega una foto para revisar o alguien usa ⚑, con la app gratuita
**ntfy** (sin cuenta). `deploy.mjs` crea un canal privado al azar la primera vez y lo muestra una sola vez: en la app,
tocar «+» y suscribirse a ese canal (servidor ntfy.sh). El aviso dice solo «Una foto nueva espera tu revisión» o
«Alguien avisó (⚑)…», nunca apodos, mensajes ni fotos, y como máximo uno de cada tipo cada 15 minutos (con la cuenta de
lo que llegó entretanto). Tocar el aviso abre la página de moderación.

**Importante:** sin cuenta, ntfy.sh cuenta los mensajes por dirección de internet, y Cloudflare comparte sus
direcciones con muchos otros servicios, así que el cupo diario gratuito suele estar agotado (error 429 en la página de
moderación). Solución: crear una cuenta gratis en https://ntfy.sh/signup, crear un token en *Account → Access tokens* y
correr `node tools/trawun/deploy.mjs --token-aviso` (pide pegar el token). Los avisos usan entonces el cupo de esa cuenta.

Volver a correr `deploy.mjs` actualiza el servicio y **mantiene** la clave y el canal. Para cambiarlos a propósito:
`node tools/trawun/deploy.mjs --nueva-clave` o `--nuevo-aviso`.

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
