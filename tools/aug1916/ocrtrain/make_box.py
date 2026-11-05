"""WordStr-free line box files for Tesseract LSTM training: every character of the ground-truth line gets the
line's full box (as tesstrain's generate_line_box.py does). Usage: python3 make_box.py LINES_DIR"""
import sys, os, unicodedata
from PIL import Image
d = sys.argv[1]
for f in sorted(os.listdir(d)):
    if not f.endswith('.gt.txt'): continue
    base = f[:-7]; img = os.path.join(d, base + '.png')
    if not os.path.exists(img): continue
    w, h = Image.open(img).size
    t = unicodedata.normalize('NFC', open(os.path.join(d, f), encoding='utf-8').read().strip())
    with open(os.path.join(d, base + '.box'), 'w', encoding='utf-8') as o:
        for ch in t:
            o.write(f'{" " if ch == " " else ch} 0 0 {w} {h} 0\n' if ch != ' ' else f'  0 0 {w} {h} 0\n')
        o.write(f'\t 0 0 {w} {h} 0\n')
