# Augusta (1916) desde el original impreso

El diccionario publica el texto de Félix José de Augusta, *Diccionario araucano-español y español-araucano*, tomo I
(1916, dominio público), leído del escaneo del Internet Archive (`diccionarioarauc01fluoft`) con OCR propio. No usa el
texto de la edición digital de 2019 ni el de CORLEXIM; los tomos I y II salen del escaneo: esa capa tiene derechos vigentes.

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

## Límites conocidos

- Ocho páginas del PDF del Internet Archive están en blanco (58, 166, 176, 182, 184, 228, 234, 302). Sus entradas
  faltan hasta conseguir otra copia de esas páginas (Memoria Chilena tiene el libro).
- El texto es OCR sin revisar: hay errores de lectura, sobre todo en los ejemplos en mapudungun.
- Tomo II (español-araucano, `diccionarioarauc02fluoft`, págs. 13 a 426): `python3 build_es16.py raw2.json
  avenue_words.json keys2019.json augusta1916_entries.json augusta1916_es.json` (7.969 titulares en español). Diez
  páginas de ese PDF están en blanco (54, 64, 108, 230, 234, 266, 276, 348, 404, 424).
