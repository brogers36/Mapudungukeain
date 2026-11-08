# Copia en línea del progreso (Cloudflare Worker + D1)

El juego guarda el progreso en el teléfono. Con la copia en línea, también lo envía a este servicio bajo un código
al azar (por ejemplo `kawellu-7qx4-9mpa`), sin nombre ni correo. El mismo código en otro teléfono, o después de
desinstalar la app, recupera el progreso. Si el servicio no responde, el juego sigue funcionando con la copia local.

Archivos: `worker.js` (el servicio), `schema.sql` (la tabla), `wrangler.toml` (para publicarlo con la línea de comandos).

## Publicarlo desde el panel de Cloudflare (sin instalar nada)

Los nombres de los menús pueden cambiar un poco.

1. Crear una cuenta gratis en https://dash.cloudflare.com/sign-up.
2. **Base de datos.** *Storage & Databases → D1 SQL Database → Create*. Nombre: `mapudungukeain-sync`. Abrir la base,
   pestaña *Console*, pegar el contenido de `schema.sql` y ejecutarlo.
3. **Servicio.** *Workers & Pages → Create → Worker* (plantilla «Hello World»). Nombre: `mapudungukeain-sync`.
   *Deploy*, luego *Edit code*: borrar lo que hay, pegar `worker.js` completo y *Deploy*.
4. **Conectar la base.** En el Worker: *Settings → Bindings → Add → D1 database*. Variable name: `DB`; base:
   `mapudungukeain-sync`. Guardar (vuelve a publicarse solo).
5. Copiar la dirección del Worker (algo como `https://mapudungukeain-sync.TU-SUBDOMINIO.workers.dev`).
6. En `index.html` del juego, poner esa dirección en `var SYNC_URL="";` y publicar. Sin dirección, la opción no aparece.

Prueba rápida: abrir `https://…workers.dev/p/x` en el navegador debe responder `{"error":"bad code"}`.

## Con la línea de comandos (alternativa)

```
npm i -g wrangler && wrangler login
wrangler d1 create mapudungukeain-sync          # copiar el database_id a wrangler.toml
wrangler d1 execute mapudungukeain-sync --remote --file schema.sql
wrangler deploy
```

## Qué guarda y quién puede leerlo

Solo las claves `mpk_…` del juego (niveles, nueces, ropa, palabras, ajustes), como máximo 256 KB por código. El código
funciona como contraseña: quien lo tenga puede ver y reemplazar ese progreso. Los códigos tienen unos 10¹² valores
posibles por palabra, así que no se adivinan. Solo se aceptan peticiones desde `https://brogers36.github.io`
(variable `ORIGINS`).

Si un mismo código se usa en dos teléfonos a la vez, gana el último que jugó: al abrir el juego se toma la copia en
línea si es más nueva y el teléfono no ha cambiado desde la última vez; si los dos cambiaron, se guarda la del
teléfono que se está usando.
