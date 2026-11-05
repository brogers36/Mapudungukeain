# Augusta (1916) desde el original impreso

El diccionario publica el texto de Félix José de Augusta, *Diccionario araucano-español y español-araucano*, tomo I
(1916, dominio público), leído del escaneo del Internet Archive (`diccionarioarauc01fluoft`) con OCR propio. El tomo II
(`diccionarioarauc02fluoft`) se lee igual. No usa el texto de la edición digital de 2019 ni el de CORLEXIM: esa capa
tiene derechos vigentes.

## Pasos

```
# 1. OCR (tesseract, español) de las páginas 23 a 312, a 300 ppp
#    pdftoppm -f P -l P -r 300 -gray -png augusta1916.pdf ocr/imgPPP ; tesseract ocr/imgPPP.png ocr/PPP -l spa --psm 4 tsv txt
python3 split.py ocr raw.json                   # entradas por sangría; se descartan encabezados y notas al pie
python3 align.py raw.json keys2019.json al.json # forma de cada titular y subforma «—»
python3 build16.py al.json avenue_words.json keys2019.json e16.json   # una entrada por titular y subforma; ortografía a Unificado
python3 confirm.py e16.json keys2019.json DIGITAL.json e16c.json     # confirma cada titular por su definición
python3 finish16.py e16c.json .                 # augusta1916_entries.json, augusta1916_verified.json
```

`keys2019.json` es solo la lista ordenada de titulares de la edición digital (formas de palabras) y `DIGITAL.json` se
usa únicamente para comparar definiciones. Los dos viven fuera del repositorio. Lo que se publica sale del escaneo.

## Qué hace cada paso

- **Titulares.** Tesseract no conoce ŋ ni ə y lee la ü como `ii`, `í` o `u`. Cada titular y cada subforma («—ln» =
  raíz + `ln`) se compara con la lista ordenada de titulares; cuando un grupo tiene varias subformas, la raíz se elige
  según cuál las explica mejor.
- **Confirmación.** Un titular cuenta como verificado solo si la definición de 1916 comparte palabras de contenido con
  la definición del mismo titular en la edición digital. Si no, el titular se escribe a partir del OCR y la app avisa
  que no se pudo confirmar.
- **Ortografía.** Las palabras mapuches dentro de las definiciones pasan de la ortografía de Augusta a Unificado
  (i/u semivocales → y/w, q → g, ŋ → ng, ə → ü, -n tras consonante → -ün) y se comparan con las formas del corpus
  AVENUE. El español, los nombres botánicos y lo que no se reconoce quedan como están impresos.

## Segundo ejemplar (HathiTrust)

El ejemplar de la Universidad de Texas digitalizado por Google (HathiTrust `txu.059172017840807`, los dos tomos en un
PDF de 765 páginas, 600 ppp) se leyó con el mismo OCR. `map_pages.py` empareja sus páginas con las del Internet Archive
(tomo I: +3, tomo II: +329), y `vote.py` combina las dos lecturas y después la capa de texto del PDF. El ejemplar trae
además el **Suplemento al tomo I** (13 páginas), que el del Internet Archive no tiene; sus entradas llevan la marca
«[Suplemento al tomo I]».

## Revisión

- `vote.py`: segunda lectura palabra por palabra (otro escaneo o la capa de texto del PDF); se aplica antes de `split.py`.
- `build_es16.py` comprueba los titulares en español con el diccionario de LibreOffice (RLA-ES; `LO_ES_DIR` apunta a
  la carpeta `es` de github.com/LibreOffice/dictionaries) y con el orden alfabético; los dudosos van a
  `augusta1916_es_flags.json`.
- `flag_mapu.js`: palabras mapuches de los dos tomos que no están en AVENUE ni son titulares y que el analizador no
  puede analizar; `revision_ocr_mapu.json`, ordenada por frecuencia. Las dos listas aparecen en la copia maestra, y
  sus correcciones se aplican al publicar (`build_dict.py`).
- `ocrtrain/`: líneas para corregir y entrenar Tesseract con el alfabeto de Augusta.

## Límites conocidos

- Las páginas en blanco de los PDF (tomo I: 58, 166, 176, 182, 184, 228, 234, 302; tomo II: 54, 64, 108, 230, 234,
  266, 276, 348, 404, 424) están en blanco también en el libro: son el reverso de la última página de una letra, y la
  letra siguiente empieza en página impar. No falta texto.
- El texto es OCR sin revisar: hay errores de lectura, sobre todo en los ejemplos en mapudungun.
- Tomo II (español-araucano, `diccionarioarauc02fluoft`, págs. 13 a 426): `python3 build_es16.py raw2.json
  avenue_words.json keys2019.json augusta1916_entries.json augusta1916_es.json` (7.969 titulares en español). 
