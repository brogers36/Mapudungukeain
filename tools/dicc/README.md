# Tañi Nemülkawe: cómo se arma el diccionario

El diccionario (`diccionario/`) es una app aparte que vive en el mismo sitio que el juego. Comparte con el juego el idioma
(`mpk_lang`), el grafemario (`mpk_graf`) y los ngülliw (`mpk_nuts`), porque los dos están en el mismo origen.

## Archivos de entrada (esta carpeta)

| archivo | qué es |
|---|---|
| `game_vocab.json` | todas las palabras y frases que enseña el juego (sale de `extract.js`) |
| `core_extra.tsv` | entradas del núcleo escritas a mano: palabra, clave de Augusta (`-` = ninguna), clase, español, inglés, tema |
| `../aug1916/augusta1916_entries.json` | el diccionario de Augusta (1916), leído del original impreso (ver `tools/aug1916/README.md`) |
| `builder.json`, `builder_en.json` | formas para «Arma la palabra»: segmentaciones del corpus de oro que el analizador reproduce, con español (del analizador) e inglés (`builder_en.py`) |
| `parser_extra.tsv` | entradas tomadas del léxico del analizador: raíces de Augusta que no se ubicaron en el escaneo y raíces por dictamen |
| `loan_stems.json`, `loan_en.tsv` | las 246 raíces tomadas del español que conoce el analizador, con su forma principal, variantes e inglés |
| `motor_patches.js`, `motor_edits.json` | dictámenes aplicados a la copia del analizador que usa el diccionario |
| `rootfreq.json` | frecuencia en el corpus AVENUE sumada por raíz |
| `revisiones.json` | (opcional) las decisiones exportadas desde la copia maestra |

## Derechos

- Catrileo (1995) y la edición digital de Augusta (2019, adaptada de CORLEXIM) tienen derechos vigentes: su texto no se
  publica ni se guarda en este repositorio. La edición digital se usa solo fuera del repositorio, para confirmar
  titulares y como referencia en la copia maestra privada.
- `clean_motor.js` quita del analizador las definiciones de esas fuentes. Deja de cada una el prefijo mínimo (casi
  siempre la etiqueta y una palabra) que el analizador necesita para decidir si una raíz es verbo, sustantivo o
  adjetivo, y agrega el texto de 1916 en un campo aparte para mostrarlo. Se comprobó que las 20.000 formas más
  frecuentes del corpus AVENUE se analizan igual antes y después.

## Analizador

El diccionario usa el analizador **build 151** (2026-11-09) sin cambios: todos los dictámenes viven en el propio
analizador, incluidos «presente o pasado» para las formas sin marca de tiempo (2026-11-07) y *la-lu* «el muerto, el que
murió» (2026-11-09). `motor_patches.js` y `motor_edits.json` quedan vacíos; úsalos solo para un dictamen que todavía no
esté en el analizador.

## Ejemplos

`build_examples.js` toma del corpus AVENUE hasta tres oraciones por raíz (solo mapudungun, sin cambio de código al
español, sin nombres propios, de 3 a 12 palabras) y escribe `diccionario/ejemplos.js`.

## Reconstruir

```
node extract.js ../../index.html "Mapudungun Verb Parser 140.html" GOLD.csv .   # game_vocab.json, builder.json, motor.js
python3 build_dict.py ../../diccionario/datos.js && node clean_motor.js motor.js ../aug1916/augusta1916_entries.json ../../diccionario/motor.js ../../diccionario/datos.js   # sin texto con derechos
python3 builder_en.py builder.json builder_en.json
python3 build_dict.py ../../diccionario/datos.js            # también escribe datos_es.js (vacío por ahora)
node build_examples.js CORPUS_DIR ../../diccionario/motor.js ../../diccionario/datos.js ../../diccionario/ejemplos.js
sed "s/__VERSION__/$(date +%Y%m%d%H%M%S)/" sw_template.js > ../../diccionario/sw.js
python3 build_master.py ../../diccionario/datos.js copia_maestra.html PRIVADO/augusta_digital_entries.json   # copia de revisión; NO se publica
```

## Revisión

La copia maestra es un solo archivo HTML con todas las entradas editables. Exporta `revisiones.json`, que es acumulativo
(trae también las revisiones ya publicadas). Ponerlo en esta carpeta y volver a correr `build_dict.py` publica los
cambios: los campos editados reemplazan a los originales y la marca «Revisado» aparece en la app.

## Analizador: fuera del repositorio público

El código del analizador (y lo que se deriva de él: `builder.json`, `parser_extra.tsv`, `loan_stems.json`, `rootfreq.json`,
`extract.js`, `clean_motor.js`, `motor_patches.js`, `motor_edits.json`, `tools/parser/`) ya no está en este repositorio.
Se guarda aparte (por defecto en `/home/claude/privado_parser/`; `build_dict.py` lo busca ahí con la variable
`MPK_PRIVADO`). `diccionario/motor.js` se publica minificado y con los nombres internos cambiados, con el aviso de
derechos al comienzo:

```
# el motor público lleva cuatro raíces inventadas como marca de agua (lista en el archivo privado CANARIOS.txt)
terser motor_publico_marcado.js --compress --mangle toplevel,reserved=['MOTOR'] --comments false -o motor_min.js
# y anteponer el aviso de derechos de autor (ver el comienzo de diccionario/motor.js)
```
