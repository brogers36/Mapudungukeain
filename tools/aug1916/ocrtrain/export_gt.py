"""Corrected lines from the "Líneas de Augusta" page -> Tesseract ground truth.
Read the page's database with the ArtifactData tool (action "list", collection "lineas", out_dir DOCS) and run:
  python3 export_gt.py DOCS/lineas lines TRAIN_DIR
Each line marked "Corregida" becomes TRAIN_DIR/NAME.png + NAME.gt.txt; lines marked "No se lee" are left out."""
import json, os, shutil, sys, unicodedata
docs, lines, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True); n = skip = 0
for f in sorted(os.listdir(docs)):
    if not f.endswith('.json'): continue
    d = json.load(open(os.path.join(docs, f), encoding='utf-8'))
    d = d.get('data', d)
    name = f[:-5]; img = os.path.join(lines, name + '.png')
    if d.get('st') != 'ok' or not d.get('t') or not os.path.exists(img): skip += 1; continue
    shutil.copy(img, out)
    open(os.path.join(out, name + '.gt.txt'), 'w', encoding='utf-8').write(unicodedata.normalize('NFC', d['t'].strip()) + '\n')
    n += 1
print(n, 'lines exported;', skip, 'skipped')
