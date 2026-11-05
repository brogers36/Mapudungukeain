"""Character error rate of OCR models on held-out lines (NAME.png + NAME.gt.txt).
Usage: python3 cer.py HELD_DIR MODEL_SPEC... where MODEL_SPEC is LANG or LANG@TESSDATA_DIR
Prints CER overall and on the characters Augusta's alphabet adds (ŋ ə ü ʃ ·)."""
import os, subprocess, sys, unicodedata
d = sys.argv[1]
def lev(a, b):
    p = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        c = [i]
        for j, y in enumerate(b, 1): c.append(min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (x != y)))
        p = c
    return p[-1]
names = sorted(f[:-7] for f in os.listdir(d) if f.endswith('.gt.txt'))
for spec in sys.argv[2:]:
    lang, _, td = spec.partition('@')
    E = N = es = ns = 0
    for n in names:
        gt = unicodedata.normalize('NFC', open(os.path.join(d, n + '.gt.txt'), encoding='utf-8').read().strip())
        cmd = ['tesseract', os.path.join(d, n + '.png'), 'stdout', '-l', lang, '--psm', '7'] + (['--tessdata-dir', td] if td else [])
        out = unicodedata.normalize('NFC', subprocess.run(cmd, capture_output=True, text=True).stdout.strip())
        E += lev(gt, out); N += len(gt)
        sp = ''.join(c for c in gt if c in 'ŋəüʃ·'); so = ''.join(c for c in out if c in 'ŋəüʃ·')
        es += lev(sp, so); ns += len(sp)
    print(f'{spec}: CER {E / N:.1%} over {N} chars; Augusta letters (ŋ ə ü ʃ ·) error {es / max(ns, 1):.1%} over {ns}')
