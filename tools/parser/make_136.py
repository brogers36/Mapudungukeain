"""Build 136 of the Mapudungun Verb Parser: build 131 with the analyst rulings of 2026-11-04/05 written into the
engine's own tables (not appended as patches), so the parser and the dictionary run the same code.
Usage: python3 -I make_136.py "Mapudungun Verb Parser 131.html" "Mapudungun Verb Parser 136.html" """
import sys
src = open(sys.argv[1], encoding='utf-8').read()
def edit(old, new, count=1, why=''):
    global src
    n = src.count(old)
    if n != count: raise SystemExit(f'edit does not apply ({n} matches, expected {count}): {why or old[:60]}')
    src = src.replace(old, new)

# visible build number
edit('<span style="font-size:.5em;font-weight:400;opacity:.65">build 131</span>',
     '<span style="font-size:.5em;font-weight:400;opacity:.65">build 136</span>', why='header')
edit('Mapudungun verb parser - engine build 131,', 'Mapudungun verb parser - engine build 136 (rulings of 2026-11-04/05 on build 131),', why='engine banner')

# 1. chillka is a root; pipi is a reduplicated root (both never split)
edit("RULED_ROOTS.push('wirar','wirarwirar');",
     "RULED_ROOTS.push('wirar','wirarwirar');\n"
     "RULED_ROOTS.push('chillka','pipi');   /* build136, analyst rulings 2026-11-04/05: chillka- is a root (chillka-tu-n, not\n"
     "   chi-l-l-ka-tu-n); pipi- is a reduplicated root */", why='ruled roots')

# 2. trekatu, nentutu, kintutu are treka-tu, nentu-tu, kintu-tu, with -tu- the restorative (slot 16)
edit('  "leftu","trekatu","nentutu","wimtu","kintutu",',
     '  "leftu","wimtu",   /* build136: trekatu, nentutu, kintutu removed, ruled treka-tu, nentu-tu, kintu-tu (2026-11-05) */',
     count=2, why='lex stems')
edit('const TU_LEX={', 'const TU_LEX={"treka": "16", "nentu": "16", "kintu": "16", ', why='tu lexicon')

# 3. pipi- is a verb root (root-adjacent -nge- is the passive)
edit('const CATLEX={', 'const CATLEX={"pipi": "verb", ', why='category lexicon')

# 4. senses: pipi- (after Augusta's pipingen), yow- = llow-, nentu- = entu- 'sacar'
edit('const GLOSS_SUPP={"i":{"d":"Comer","src":"S"},"puw":{"d":"Llegar","src":"S"},',
     'const GLOSS_SUPP={"i":{"d":"Comer","src":"S"},"puw":{"d":"Llegar","src":"S"},\n'
     '  /* build136 rulings: pipi- after Augusta pipingen \'decir o repetir siempre una misma cosa\' (kept short: slot rules\n'
     '     read the gloss); yow- is llow-; nentu- is entu-, which Augusta gives only as a cross-reference */\n'
     '  "pipi":{"d":"Decir siempre lo mismo","src":"R"},"yow":{"d":"Recibir, aceptar","src":"R"},"nentu":{"d":"Sacar","src":"R"},"nentun":{"d":"Sacar","src":"R"},', why='gloss supp')
edit("      const rt=k.replace(/(ün|n)$/,''); if(GLOSS[rt] && /^[RC]$/.test(GLOSS[rt].src) && k!==rt) continue;",
     "      const rt=k.replace(/(ün|n)$/,''); if(GLOSS[rt] && /^[RC]$/.test(GLOSS[rt].src) && k!==rt) continue;\n"
     "      if(GLOSS[k] && /^[RC]$/.test(GLOSS[k].src)) continue;   /* build136: a ruling on the same key also wins (nentu) */", why='GX')

# 5. emür is not a root (truncated fem-/chem- + -(ü)rke-)
edit("const ADD_ROOTS=['yow','llow','emür','üre',", "const ADD_ROOTS=['yow','llow','üre',   /* build136: emür removed, a truncated token (2026-11-05) */\n  ", why='add roots')
edit("const PROTECT=new Set(['emür','üre','emu','üwe']);", "const PROTECT=new Set(['üre','emu','üwe']);   /* build136: emür removed (truncated fem-/chem- + -ürke-) */", why='protect')

# 6. scoring: weakly attested roots get at most frequency bucket 1 (chi- no longer beats chillka-, chilla-, chilka-)
edit("    const fb = (a && attestedStrong(c.root)) ? _b + 1 : _b;",
     "    /* build136: a root attested only weakly (via the spelling fold or the loan list) gets at most bucket 1; ROOTFREQ counts\n"
     "       bare wordforms, so a frequent free word such as chi (8,801 tokens) otherwise beat chillka-, chilla-, chilka- */\n"
     "    const fb = (a && attestedStrong(c.root)) ? _b + 1 : (a ? Math.min(1, _b) : _b);", why='frequency bucket')

# 7. meaning panel: chillka-tu- (and chilka-tu-) 'leer'
edit("      steps.push('-l-ka- con küme-: tema lexicalizado küme-l-ka- \\u00abestar bien\\u00bb (decisión del analista)'); }",
     "      steps.push('-l-ka- con küme-: tema lexicalizado küme-l-ka- \\u00abestar bien\\u00bb (decisión del analista)'); }\n"
     "    /* build136: chillka-tu- 'leer, estudiar'; chilka- is read as a spelling of chillka- only when -tu- follows, so chilka-n\n"
     "       keeps Augusta's 'marcar los animales' (analyst ruling 2026-11-04) */\n"
     "    if(/^chill?ka$/.test(p.root) && ms[0] && /^n?tu$/.test(ms[0].f)){\n"
     "      lex={inf:'leer', comp:''}; i0=1; hadVblz=true;\n"
     "      steps.push('-tu- con chillka- (o chilka-): tema lexicalizado chillka-tu- \\u00ableer\\u00bb (decisión del analista)'); }", why='meaning chillka')

open(sys.argv[2], 'w', encoding='utf-8').write(src)
print('written', sys.argv[2], len(src))
