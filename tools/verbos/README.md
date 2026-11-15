# Constructor de verbos: cómo se arma y cómo se actualiza

El constructor (`verbos/`) es una app aparte que vive en el mismo sitio que el juego y el diccionario. No usa el
analizador (`diccionario/motor.js`): solo tablas de terminaciones y reglas de alomorfía.

## Archivos

| archivo | qué es | ¿se edita a mano? |
|---|---|---|
| `verbos/reglas.js` | las tablas y reglas: `INTR` (intransitivo), `TR` (cuadros de J. Becker Peña), `SM` (Smeets 2008, apéndice), `NEGIMP` (imperativo negativo transitivo, Smeets), `SUF` (sufijos con su casilla) | **sí** |
| `verbos/app.js`, `verbos/app.css` | la interfaz: textos en español e inglés (objeto `T`), la tabla del paradigma y los estilos | sí |
| `verbos/index.html` | la página de la app: solo carga los archivos de arriba | rara vez |
| `diccionario/conjugar/index.html` | la página «Conjugar» del diccionario: carga **los mismos archivos** de `verbos/`, así que no tiene reglas ni raíces propias | rara vez |
| `verbos/datos.js` | conteos de AVENUE por palabra, raíces frecuentes con glosa y resumen de validación | no: lo genera `make_datos.js` |
| `verbos/raices.js` | inventario de raíces: núcleo revisado del diccionario y verbos de Augusta (1916), con glosa, marca de Augusta y frecuencia | no: lo genera `make_raices.js` |
| `verbos/sw.js`, `manifest.webmanifest`, íconos | app instalable y uso sin conexión | rara vez |
| `verbos/acerca/index.html` | la página que explica la app y cómo instalarla | sí |

Hay una sola copia de las reglas, las raíces y la interfaz. Un cambio en `verbos/` llega a la app y a la página del
diccionario a la vez. El service worker del diccionario guarda esos archivos para que «Conjugar» funcione sin conexión.

Un enlace puede abrir cualquiera de las dos páginas con una raíz puesta: `verbos/#leli`, `diccionario/conjugar/#leli`.

## Actualizar una terminación

1. En GitHub, abre `verbos/reglas.js` y toca el lápiz (Edit).
2. Cambia la forma en la tabla que corresponda. Las claves son agente y paciente: `'2s':{'1s':'en', ...}` es 2ª singular
   sobre 1ª singular. `TR` son los cuadros; `SM` es lo que da Smeets. Si las dos tablas difieren en una celda, la app
   muestra las dos formas con su fuente.
3. Guarda (Commit changes) en `main`. GitHub Pages publica en uno o dos minutos y la app instalada toma el cambio la
   próxima vez que se abra con conexión. No hay paso de compilación.

Para agregar un sufijo, añade una línea a `SUF` con `id`, `slot` (casilla de Smeets), la forma tras vocal (`V`) y tras
consonante (`C`), la glosa y las descripciones `es` y `en`.

## Regenerar `raices.js`

Cuando cambie el diccionario (`diccionario/datos.js`), vuelve a correr:

    node tools/verbos/make_raices.js

No necesita nada fuera de este repositorio. La raíz sale de la forma de cita (-n tras vocal, -ün tras consonante). Una raíz
en -ü se reconoce por tres vías: no puede terminar en dos consonantes (allkü-n), AVENUE la usa más con ü, o está en la
lista `U_ROOTS` del script, que es donde se agregan los dictámenes (anü, müpü).

## Regenerar `datos.js`

Solo hace falta si cambia el analizador o el corpus. Necesita el índice de AVENUE, que no está en este repositorio
porque contiene el texto del corpus:

    node tools/verbos/make_datos.js <index.json> <stats.json> <vb_validation.json>

## Fuentes

- Cuadros de terminaciones transitivas: J. Becker Peña.
- Smeets, I. (2008). *A Grammar of Mapuche*. Mouton de Gruyter. Apéndice «Paradigms» y §26.
- Augusta, F. J. de (1916). *Diccionario araucano-español y español-araucano*. Santiago: Imprenta Universitaria. Vía `diccionario/datos.js`.
- Corpus AVENUE: Duan et al. (2020), LREC.
