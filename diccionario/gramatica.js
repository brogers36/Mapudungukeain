/* Short guide to the verbal suffixes and the nominal particles pu, ke, -chi and -kechi.
   Explanations are written for this dictionary (not copied from any grammar). Examples are in Unificado, segmented
   with "-" (the first piece is the root); the app converts them to the chosen grafemario. Most example words occur in
   the AVENUE corpus; a few are regular formations built for the example. */
window.GRAM = {
  intro: {
    es: "Un verbo mapuche es una raíz seguida de sufijos en un orden fijo; la persona va casi siempre al final. Sin <b>-a-</b> (futuro), el verbo vale para el presente o para el pasado: <b>amun</b> es «voy» o «fui» según el contexto. Toca un ejemplo para verlo en el analizador.",
    en: "A Mapudungun verb is a root followed by suffixes in a fixed order; person almost always comes last. Without <b>-a-</b> (future), the verb covers present or past: <b>amun</b> is «I go» or «I went» depending on context. Tap an example to open it in the parser."
  },
  groups: [
    { id: "persona", es: "Persona (al final del verbo)", en: "Person (at the end of the verb)",
      note: { es: "Tras una raíz que termina en consonante: <b>-ün</b> (1.ª sg.) e <b>-i</b> en vez de <b>-y</b>: <b>kutran-ün</b> «estoy/estuve enfermo», <b>kim-i</b> «sabe».", en: "After a root ending in a consonant: <b>-ün</b> (1st sg.) and <b>-i</b> instead of <b>-y</b>: <b>kutran-ün</b> «I am/was sick», <b>kim-i</b> «he/she knows»." },
      table: [
        ["-n", "yo", "I", "amu-n"], ["-ymi", "tú", "you (sg.)", "amu-y-mi"], ["-y", "él, ella", "he, she", "amu-y"],
        ["-yu", "nosotros dos", "we two", "amu-yu"], ["-ymu", "ustedes dos", "you two", "amu-y-mu"], ["-yngu", "ellos dos", "they two", "amu-y-ngu"],
        ["-iñ", "nosotros", "we", "amu-y-iñ"], ["-ymün", "ustedes", "you (pl.)", "amu-y-mün"], ["-yngün", "ellos", "they", "amu-y-ngün"]
      ] },
    { id: "tiempo", es: "Tiempo, negación y aspecto", en: "Tense, negation and aspect",
      items: [
        { m: "-a-", es: "Futuro o acción todavía no realizada.", en: "Future, or an action not yet carried out.",
          ex: [["amu-a-n", "iré", "I will go"], ["amu-a-y", "irá", "he/she will go"]] },
        { m: "-fu-", es: "Pasado interrumpido: algo que pasó o se iba a hacer pero ya no vale o no se cumplió. Con <b>-a-</b>, condicional («-ría»).", en: "Interrupted past: something that happened or was meant to happen but no longer holds or didn't happen. With <b>-a-</b>, conditional («would»).",
          ex: [["amu-fu-n", "fui (pero volví) / iba a ir", "I went (but came back) / I was going to go"], ["kim-a-fu-y", "sabría", "he/she would know"]] },
        { m: "-ke-", es: "Habitual: lo que se hace siempre o de costumbre.", en: "Habitual: what one always or usually does.",
          ex: [["amu-ke-y", "suele ir, va siempre", "he/she usually goes"], ["pi-ke-n", "digo siempre", "I always say"]] },
        { m: "-la-", es: "Negación del verbo conjugado.", en: "Negation of the conjugated verb.",
          ex: [["amu-la-n", "no voy / no fui", "I don't go / I didn't go"], ["kim-la-y-mi", "no sabes", "you don't know"]] },
        { m: "-no-", es: "Negación en las formas no conjugadas (con <b>-lu</b>, <b>-el</b>, <b>-n</b>…).", en: "Negation in non-conjugated forms (with <b>-lu</b>, <b>-el</b>, <b>-n</b>…).",
          ex: [["kim-no-lu", "el que no sabe", "the one who doesn't know"]] },
        { m: "-ki(l)-", es: "Negación del imperativo: «no hagas».", en: "Negative imperative: «don't».",
          ex: [["fem-kil-nge", "¡no hagas eso!", "don't do that!"]] },
        { m: "-le-", es: "Estado o acción en curso: «estar».", en: "State or ongoing action: «be (doing)».",
          ex: [["küme-le-n", "estoy bien", "I am well"], ["amu-le-y", "va en camino, anda", "he/she is on the way"]] },
        { m: "-küle-", es: "Estado que dura, sobre todo de quien está tendido, enfermo o quieto.", en: "Lasting state, especially of someone lying down, ill or still.",
          ex: [["kutran-küle-n", "estoy enfermo (en cama)", "I am sick (laid up)"]] },
        { m: "-meke-", es: "Estar ocupado haciendo algo.", en: "Be busy doing something.",
          ex: [["küdaw-meke-n", "estoy trabajando, ando ocupado trabajando", "I am busy working"]] },
        { m: "-nie-", es: "Mantener una acción o un estado: «tener», «seguir».", en: "Keep up an action or a state: «have», «keep».",
          ex: [["kim-nie-n", "lo sé, lo tengo sabido", "I know it (I have it known)"]] },
        { m: "-künu-", es: "Dejar algo o a alguien en un estado.", en: "Leave something or someone in a state.",
          ex: [["weda-künu-y", "lo dejó mal, lo echó a perder", "he/she left it in a bad state, spoiled it"]] },
        { m: "-we-", es: "Lo que sigue o queda: «todavía»; con negación, «ya no».", en: "What continues or remains: «still»; with negation, «no longer».",
          ex: [["müle-we-y", "todavía está, queda", "he/she/it is still there"], ["nie-we-la-y", "ya no tiene", "he/she no longer has"]] },
        { m: "-tu-", es: "De nuevo, o de vuelta al punto de partida.", en: "Again, or back to the starting point.",
          ex: [["amu-tu-y", "se fue de vuelta (a casa)", "he/she went back (home)"], ["monge-tu-y", "revivió, se recuperó", "he/she came back to life, recovered"]] },
        { m: "-pe-", es: "Acción reciente: «acaba de».", en: "Recent action: «just».",
          ex: [["pi-pe-y", "acaba de decir", "he/she has just said"]] },
        { m: "-rke-", es: "Reportativo o sorpresa: «dicen que», «resulta que». Abre los cuentos.", en: "Reportative or surprise: «they say», «it turns out». Opens folktales.",
          ex: [["müle-rke-fu-y", "había una vez (dicen que había)", "once upon a time there was (they say)"], ["amu-rke-y", "dicen que se fue / resulta que se fue", "he/she went, they say / it turns out he/she went"]] },
        { m: "-lle-", es: "Afirma con fuerza: «de veras», «sí que».", en: "Strong affirmation: «really», «indeed».",
          ex: [["amu-lle-y", "sí que fue", "he/she really did go"]] },
        { m: "-rume-", es: "De repente, de una vez.", en: "Suddenly, all at once.",
          ex: [["amu-rume-y", "se fue de repente", "he/she suddenly left"]] },
        { m: "-yaw-", es: "Andar haciendo algo de un lado a otro.", en: "Go around doing something.",
          ex: [["treka-yaw-ün", "ando caminando, paseo", "I walk around"]] }
      ] },
    { id: "direccion", es: "Dirección y lugar", en: "Direction and place",
      items: [
        { m: "-pa-", es: "Hacia acá, hacia donde está quien habla; también «venir a».", en: "Hither, toward the speaker; also «come to (do)».",
          ex: [["tripa-pa-y", "salió (hacia acá)", "he/she came out (toward here)"], ["pe-pa-fiñ", "vine a verlo", "I came to see him/her"]] },
        { m: "-me-", es: "Hacia allá: «ir a».", en: "Thither: «go to (do)».",
          ex: [["pe-me-a-n", "iré a ver", "I will go to see"]] },
        { m: "-pu-", es: "Allá, en otro lugar.", en: "There, somewhere else.",
          ex: [["küdaw-pu-y", "trabajó allá", "he/she worked over there"]] }
      ] },
    { id: "valencia", es: "Quién hace qué: voz y participantes", en: "Who does what: voice and participants",
      items: [
        { m: "-fi-", es: "Objeto de 3.ª persona: «lo», «la», «le».", en: "3rd-person object: «him», «her», «it».",
          ex: [["kim-fi-ñ", "lo sé, lo conozco", "I know him/her/it"], ["kim-fi-mi", "lo sabes, lo conoces", "you know him/her/it"]] },
        { m: "-e-", es: "Inverso: alguien hace algo a mí, a ti o a nosotros. Va en <b>-enew</b> («me»), <b>-eymi</b> («te»), <b>-eiñmu</b> («nos»), <b>-eyu</b> («yo a ti»).", en: "Inverse: someone does something to me, you or us. Found in <b>-enew</b> («me»), <b>-eymi</b> («you»), <b>-eiñmu</b> («us»), <b>-eyu</b> («I to you»).",
          ex: [["pi-enew", "me dijo", "he/she told me"], ["elu-eiñmu", "nos dio", "he/she gave us"], ["pi-eyu", "te digo, te dije", "I tell you, I told you"]] },
        { m: "-nge-", es: "Pasiva: la acción le pasa al sujeto. (Con un sustantivo, <b>-nge-</b> es «ser»; ver abajo.)", en: "Passive: the action happens to the subject. (With a noun, <b>-nge-</b> means «be»; see below.)",
          ex: [["pi-nge-y", "se dice, se llama", "it is said, he/she/it is called"], ["kim-nge-la-y", "no se sabe", "it is not known"]] },
        { m: "-w-, -uw-", es: "Reflexivo o recíproco: a sí mismo, el uno al otro.", en: "Reflexive or reciprocal: oneself, each other.",
          ex: [["pepil-uw-ün", "me preparo", "I get myself ready"], ["ayü-w-ün", "me alegro", "I am glad"]] },
        { m: "-l-, -üm-, -el-", es: "Causativo: hacer que alguien haga algo o que algo pase.", en: "Causative: make someone do something or make something happen.",
          ex: [["amu-l-fi-ñ", "lo mandé, lo hice ir", "I sent him/her (made him/her go)"], ["kim-el-tu-n", "enseñar (hacer saber)", "to teach (make know)"], ["la-ngüm-ün", "matar (hacer morir)", "to kill (make die)"]] },
        { m: "-lel-, -el-", es: "Para otro: hacer algo en beneficio (o en perjuicio) de alguien.", en: "For someone else: do something for (or to the detriment of) someone.",
          ex: [["dewma-lel-fi-ñ", "se lo hice", "I made it for him/her"]] },
        { m: "-ñma-, -üñma-", es: "Alguien afectado: quitar, hacer algo a lo de otro.", en: "Someone affected: take from someone, do something to what is theirs.",
          ex: [["nentu-ñma-fi-ñ", "se lo saqué, se lo quité", "I took it out from him/her"]] },
        { m: "-ka-", es: "Forma verbos de acción a partir de otras palabras: «hacer».", en: "Makes action verbs from other words: «do, make».",
          ex: [["nütram-ka-n", "conversar (hacer nütram)", "to converse (do nütram)"]] },
        { m: "-fal-", es: "Deber o valer la pena hacerse.", en: "Should be done, be worth doing.",
          ex: [["kim-fal-ke-y", "conviene saberlo, hay que saberlo", "it ought to be known"]] }
      ] },
    { id: "verbalizar", es: "Verbos hechos de otras palabras", en: "Verbs made from other words",
      items: [
        { m: "-nge-", es: "Con un sustantivo o adjetivo: «ser».", en: "With a noun or adjective: «be».",
          ex: [["wentru-nge-n", "soy hombre", "I am a man"], ["domo-nge-y", "es mujer", "she is a woman"]] },
        { m: "-tu-", es: "Con un sustantivo: usar, comer o hacer lo que nombra.", en: "With a noun: use, eat or do what it names.",
          ex: [["kawellu-tu-n", "andar a caballo", "to ride a horse"], ["ilo-tu-n", "comer carne", "to eat meat"]] }
      ] },
    { id: "modo", es: "Otras formas del verbo", en: "Other forms of the verb",
      items: [
        { m: "-l-", es: "Condicional: «si…». Lleva sus propias personas: <b>-li</b> (yo), <b>-lmi</b> (tú), <b>-le</b> (él, ella)…", en: "Conditional: «if…». It has its own person endings: <b>-li</b> (I), <b>-lmi</b> (you), <b>-le</b> (he, she)…",
          ex: [["amu-l-i", "si voy", "if I go"], ["amu-l-mi", "si vas", "if you go"], ["amu-l-e", "si va", "if he/she goes"]] },
        { m: "-chi, -nge, -pe", es: "Imperativo: «que vaya yo» (<b>-chi</b>), «¡ve!» (<b>-nge</b>), «que vaya él» (<b>-pe</b>). <b>amuyu</b> es también «¡vamos (los dos)!».", en: "Imperative: «let me go» (<b>-chi</b>), «go!» (<b>-nge</b>), «let him/her go» (<b>-pe</b>). <b>amuyu</b> is also «let's go (the two of us)!».",
          ex: [["amu-chi", "que vaya yo, déjame ir", "let me go"], ["amu-nge", "¡ve!", "go!"], ["amu-pe", "que vaya", "let him/her go"]] },
        { m: "-lu", es: "Participio: «el que…», «al…», «cuando…».", en: "Participle: «the one who…», «when…».",
          ex: [["amu-lu", "el que va / cuando fue", "the one who goes / when he/she went"], ["kim-lu", "el que sabe", "the one who knows"]] },
        { m: "-el, -fiel", es: "Lo que se hace o se hizo a algo: el objeto de la acción.", en: "What is or was done to something: the object of the action.",
          ex: [["i-a-el", "comida (lo que se ha de comer)", "food (what is to be eaten)"], ["ñi pe-fiel", "lo que vi, el que vi", "what I saw, the one I saw"]] },
        { m: "-a-m", es: "Finalidad: «para».", en: "Purpose: «in order to».",
          ex: [["amu-a-m", "para ir", "in order to go"]] },
        { m: "-(ü)n", es: "Sustantivo de acción: el hecho de hacer algo.", en: "Action noun: the fact of doing something.",
          ex: [["kim-ün", "conocimiento, saber", "knowledge"], ["monge-n", "vida", "life"]] }
      ] },
    { id: "nominal", es: "Partículas del nombre: pu, ke, -chi, -kechi", en: "Noun particles: pu, ke, -chi, -kechi",
      items: [
        { m: "pu", es: "Plural de personas, animales y algunas cosas. Va antes del sustantivo.", en: "Plural of people, animals and some things. It goes before the noun.",
          ex: [["pu wentru", "los hombres", "the men"], ["pu che", "la gente", "the people"]] },
        { m: "-ke", es: "Con un adjetivo, plural de lo que describe; con un número, «de a», «cada». (En el verbo, <b>-ke-</b> es otro sufijo: el habitual.)", en: "With an adjective, plural of what it describes; with a number, «each», «by». (In verbs, <b>-ke-</b> is a different suffix: the habitual.)",
          ex: [["küme-ke kawellu", "buenos caballos", "good horses"], ["kiñe-ke", "algunos; de a uno", "some; one by one"]] },
        { m: "-chi", es: "Hace adjetivo de lo que va delante de un sustantivo. Con la raíz de un verbo, forma un participio adjetivo.", en: "Makes an adjective of what precedes a noun. With a verb root, it forms an adjectival participle.",
          ex: [["tüfa-chi ruka", "esta casa", "this house"], ["küme-chi wentru", "un hombre bueno", "a good man"]] },
        { m: "-kechi", es: "Hace adverbios de modo, como «-mente».", en: "Makes adverbs of manner, like «-ly».",
          ex: [["küme-kechi", "bien, buenamente", "well, nicely"]] }
      ] }
  ],
  source: {
    es: "Explicación breve y simplificada; las formas varían según la zona. Basada en el uso del corpus AVENUE y en Augusta (1916). Los ejemplos están segmentados con guiones; la primera parte es la raíz.",
    en: "A brief, simplified explanation; forms vary by region. Based on usage in the AVENUE corpus and on Augusta (1916). Examples are segmented with hyphens; the first piece is the root."
  }
};
