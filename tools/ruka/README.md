# Ruka mew (mapudungun en casa)

Page: `ruka/`. Phrases for daily family life, without audio for now.

- `frases_ruka.json`: the phrase list, edited by hand. Fields: `c` category, `m` Mapudungun (Unificado), `es`, `en`;
  optional `alt` (AVENUE spellings to look for, e.g. `küme umagtuange`) and `noex` (don't show an AVENUE example,
  when the only AVENUE use has another sense).
- `make_ruka.py`: builds `ruka/datos.js`. For each phrase it looks for the whole phrase in AVENUE and the key word
  (its rarest word of 4+ letters), and keeps the shortest AVENUE line as an example. The app shows
  "Así en AVENUE" (whole phrase found), "Palabra clave en AVENUE" or "Nueva, por revisar".
- `sw_template.js`: the offline service worker; replace `__VERSION__` on each release.

Rebuild after editing the list:

    python3 tools/ruka/make_ruka.py diccionario/frases/pares.json ruka/datos.js
    sed "s/__VERSION__/$(date +%Y%m%d%H%M)/" tools/ruka/sw_template.js > ruka/sw.js

Not yet linked from the game, the dictionary or sitemap.xml: waiting for review of the "nueva" phrases.
