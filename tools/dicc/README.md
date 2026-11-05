# Tañi Nemülkawe: cómo se arma el diccionario

El diccionario (`diccionario/`) es una app aparte que vive en el mismo sitio que el juego. Comparte con el juego el idioma
(`mpk_lang`), el grafemario (`mpk_graf`) y los ngülliw (`mpk_nuts`), porque los dos están en el mismo origen.

## Archivos de entrada (esta carpeta)

| archivo | qué es |
|---|---|
| `game_vocab.json` | todas las palabras y frases que enseña el juego (sale de `extract.js`) |
| `core_extra.tsv` | entradas del núcleo escritas a mano: palabra, clave de Augusta (`-` = ninguna), clase, español, inglés, tema |
| `augusta_digital_entries.json` | el diccionario de Augusta (1916), edición digital en Unificado |
| `builder.json`, `builder_en.json` | formas para «Arma la palabra»: segmentaciones del corpus de oro que el analizador reproduce, con español (del analizador) e inglés (`builder_en.py`) |
| `parser_extra.tsv` | entradas tomadas del léxico del analizador: headwords de Augusta (1916) que faltan en la edición digital y raíces por dictamen |
| `loan_stems.json`, `loan_en.tsv` | las 246 raíces tomadas del español que conoce el analizador, con su forma principal, variantes e inglés |
| `motor_patches.js`, `motor_edits.json` | dictámenes aplicados a la copia del analizador que usa el diccionario |
| `rootfreq.json` | frecuencia en el corpus AVENUE sumada por raíz |
| `revisiones.json` | (opcional) las decisiones exportadas desde la copia maestra |

## Reconstruir

```
node extract.js ../../index.html PARSER.html GOLD.csv .        # game_vocab.json, builder.json, motor.js
cp motor.js ../../diccionario/
python3 builder_en.py builder.json builder_en.json
python3 build_dict.py ../../diccionario/datos.js
sed "s/__VERSION__/$(date +%Y%m%d%H%M%S)/" sw_template.js > ../../diccionario/sw.js
python3 build_master.py ../../diccionario/datos.js copia_maestra.html   # copia de revisión; NO se publica
```

## Revisión

La copia maestra es un solo archivo HTML con todas las entradas editables. Exporta `revisiones.json`, que es acumulativo
(trae también las revisiones ya publicadas). Ponerlo en esta carpeta y volver a correr `build_dict.py` publica los
cambios: los campos editados reemplazan a los originales y la marca «Revisado» aparece en la app.
