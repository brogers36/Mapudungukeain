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

El diccionario usa el analizador **build 139** (2026-11-09). Los dictámenes viven en el propio analizador, con una
excepción: «presente o pasado» para las formas sin marca de tiempo (dictamen del 2026-11-07: *ilay* «no come / no
comió») existe solo en la copia del diccionario. Después de `clean_motor.js`, aplicarlo con
`git apply tools/dicc/motor_twotense.patch` (desde la raíz del repositorio). `motor_patches.js` y `motor_edits.json` quedan
vacíos; úsalos solo para un dictamen que todavía no esté en el analizador.

## Ejemplos

`build_examples.js` toma del corpus AVENUE hasta tres oraciones por raíz (solo mapudungun, sin cambio de código al
español, sin nombres propios, de 3 a 12 palabras) y escribe `diccionario/ejemplos.js`.

## Reconstruir

```
node extract.js ../../index.html "Mapudungun Verb Parser 139.html" GOLD.csv .   # game_vocab.json, builder.json, motor.js
python3 build_dict.py ../../diccionario/datos.js && node clean_motor.js motor.js ../aug1916/augusta1916_entries.json ../../diccionario/motor.js ../../diccionario/datos.js   # sin texto con derechos
(cd ../.. && git apply tools/dicc/motor_twotense.patch)   # presente o pasado (ver arriba)
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
