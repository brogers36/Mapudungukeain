# Entrenar el OCR con el alfabeto de Augusta

Tesseract no trae ŋ ni ə y confunde la ü y la cursiva. Estas herramientas ajustan su modelo de español a la tipografía
del diccionario de 1916.

1. **Corregir líneas.** La página «Líneas de Augusta» (artefacto privado) muestra 450 líneas impresas de los dos tomos
   (`lines/`, 270 del tomo I y 180 del II, elegidas entre las que tienen más mapudungun) con la lectura actual del OCR.
   Se corrigen copiando la ortografía de Augusta tal como está impresa.
2. **Exportar.** Leer la base de datos de la página (colección `lineas`) y correr `export_gt.py`. Las 450 líneas ya
   están transcritas en `gt.json` (437 útiles; `#SKIP` = recorte ilegible o sin texto). `held.txt` son las 24 que no se
   usan para entrenar y sirven para medir el error con `cer.py`.
3. **Entrenar.** `./train.sh TRAIN_DIR tessdata_best/spa.traineddata langdata_lstm/radical-stroke.txt OUT 3000`
   ajusta el modelo `spa` de tessdata_best (el «fast» instalado no se puede entrenar), agrega las letras nuevas y deja
   `OUT/aug.traineddata`. 10 % de las líneas quedan aparte para medir el error.
4. **Volver a leer.** Repetir el OCR de los dos tomos con `-l aug` y correr de nuevo `split.py` … `build_es16.py`.

`vote.py` (en la carpeta de arriba) combina dos lecturas del mismo tomo palabra por palabra: la de Tesseract y otra
(un segundo escaneo, o la capa de texto que trae el PDF). Con la capa del PDF del Internet Archive cambió 845 palabras
del tomo I y 2.933 del tomo II.

## Resultado

`aug.traineddata` (modelo entero, 1,5 MB) es `spa` de tessdata_best ajustado con 413 líneas transcritas (3.400
iteraciones). En las 24 líneas apartadas (`held.txt`, 1.604 caracteres) el error por carácter baja de 8,0 % (`spa`
instalado) y 7,9 % (`spa` de tessdata_best) a 1,4 %. De las 51 letras propias de Augusta (ŋ ə ü ʃ ·) en esas líneas,
los modelos de español no leen ninguna; el ajustado lee bien el 90 %. Es una muestra chica: las cifras sirven para
comparar modelos, no como error exacto del diccionario entero.

    tesseract PAGE.png OUT -l aug --tessdata-dir ocrtrain --psm 4 tsv txt

La carpeta necesita también `configs/` y `tessconfigs/` de la instalación de Tesseract (para `tsv`).
