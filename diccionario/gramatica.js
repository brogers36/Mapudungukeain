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
      note: { es: "Tras una raíz que termina en consonante: <b>-ün</b> (1.ª sg.) e <b>-i</b> en vez de <b>-y</b>: <b>kutran-ün</b> «estoy/estuve enfermo», <b>kim-i</b> «sabe/sabía».", en: "After a root ending in a consonant: <b>-ün</b> (1st sg.) and <b>-i</b> instead of <b>-y</b>: <b>kutran-ün</b> «I am/was sick», <b>kim-i</b> «he/she knows/knew»." },
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
          ex: [["amu-ke-y", "suele / solía ir, va / iba siempre", "he/she usually goes / used to go"], ["pi-ke-n", "digo / decía siempre", "I always say / always said"]] },
        { m: "-ye-m, -yü-m", es: "Rasgo constante (<b>-ye-</b>, o su alomorfo <b>-yü-</b>) seguido de la persona <b>-m</b>: «cada vez que…». En el verbo se separa así: <b>aku-a-ye-m</b> o <b>aku-ya-yü-m</b> «cada vez que va a llegar». (Después de un sustantivo, <b>-yem</b> es otro sufijo; ver abajo.)", en: "Constant feature (<b>-ye-</b>, or its allomorph <b>-yü-</b>) followed by the person marker <b>-m</b>: «whenever…». On a verb it is split this way: <b>aku-a-ye-m</b> or <b>aku-ya-yü-m</b> «whenever it is going to arrive». (After a noun, <b>-yem</b> is a different suffix; see below.)",
          ex: [["aku-a-ye-m", "cuando va a llegar", "when it is going to arrive"]] },
        { m: "-la-", es: "Negación del verbo conjugado.", en: "Negation of the conjugated verb.",
          ex: [["amu-la-n", "no voy / no fui", "I don't go / I didn't go"], ["kim-la-y-mi", "no sabes / no sabías", "you don't / didn't know"]] },
        { m: "-no-", es: "Negación en las formas no conjugadas (con <b>-lu</b>, <b>-el</b>, <b>-n</b>…).", en: "Negation in non-conjugated forms (with <b>-lu</b>, <b>-el</b>, <b>-n</b>…).",
          ex: [["kim-no-lu", "el que no sabe", "the one who doesn't know"]] },
        { m: "-ki(l)-", es: "Negación del imperativo: «no hagas».", en: "Negative imperative: «don't».",
          ex: [["fem-kil-nge", "¡no hagas eso!", "don't do that!"]] },
        { m: "-le-", es: "Estado o acción en curso: «estar».", en: "State or ongoing action: «be (doing)».",
          ex: [["küme-le-n", "estoy / estaba bien", "I am / was well"], ["amu-le-y", "va / iba en camino, anda / andaba", "he/she is / was on the way"]] },
        { m: "-küle-", es: "Estado que dura, sobre todo de quien está tendido, enfermo o quieto.", en: "Lasting state, especially of someone lying down, ill or still.",
          ex: [["kutran-küle-n", "estoy / estaba enfermo (en cama)", "I am / was sick (laid up)"]] },
        { m: "-meke-", es: "Estar ocupado haciendo algo.", en: "Be busy doing something.",
          ex: [["küdaw-meke-n", "estoy / estaba trabajando, ando / andaba ocupado trabajando", "I am / was busy working"]] },
        { m: "-nie-", es: "Mantener una acción o un estado: «tener», «seguir».", en: "Keep up an action or a state: «have», «keep».",
          ex: [["kim-nie-n", "lo sé / lo sabía, lo tengo / tenía sabido", "I know / knew it (I have / had it known)"]] },
        { m: "-künu-", es: "Dejar algo o a alguien en un estado.", en: "Leave something or someone in a state.",
          ex: [["weda-künu-y", "lo deja / dejó mal, lo echa / echó a perder", "he/she leaves / left it in a bad state, spoils / spoiled it"]] },
        { m: "-we-", es: "Lo que sigue o queda: «todavía»; con negación, «ya no».", en: "What continues or remains: «still»; with negation, «no longer».",
          ex: [["müle-we-y", "todavía está / estaba, queda / quedaba", "he/she/it is / was still there"], ["nie-we-la-y", "ya no tiene / tenía", "he/she no longer has / had"]] },
        { m: "-tu-", es: "De nuevo, o de vuelta al punto de partida.", en: "Again, or back to the starting point.",
          ex: [["amu-tu-y", "se va / se fue de vuelta (a casa)", "he/she goes / went back (home)"], ["monge-tu-y", "revive / revivió, se recupera / se recuperó", "he/she comes / came back to life, recovers / recovered"]] },
        { m: "-pe-", es: "Acción reciente: «acaba de».", en: "Recent action: «just».",
          ex: [["pi-pe-y", "acaba / acababa de decir", "he/she has / had just said"]] },
        { m: "-rke-", es: "Reportativo o sorpresa: «dicen que», «resulta que». Abre los cuentos.", en: "Reportative or surprise: «they say», «it turns out». Opens folktales.",
          ex: [["müle-rke-fu-y", "había una vez (dicen que había)", "once upon a time there was (they say)"], ["amu-rke-y", "dicen que se va o se fue / resulta que se va o se fue", "he/she goes or went, they say / it turns out he/she goes or went"]] },
        { m: "-lle-", es: "Afirma con fuerza: «de veras», «sí que».", en: "Strong affirmation: «really», «indeed».",
          ex: [["amu-lle-y", "sí que va / sí que fue", "he/she really does / did go"]] },
        { m: "-rume-", es: "De repente, de una vez.", en: "Suddenly, all at once.",
          ex: [["amu-rume-y", "se va / se fue de repente", "he/she suddenly leaves / left"]] },
        { m: "-yaw-", es: "Andar haciendo algo de un lado a otro.", en: "Go around doing something.",
          ex: [["treka-yaw-ün", "ando / andaba caminando, paseo / paseaba", "I walk / walked around"]] }
      ] },
    { id: "direccion", es: "Dirección y lugar", en: "Direction and place",
      items: [
        { m: "-pa-", es: "Hacia acá, hacia donde está quien habla; también «venir a».", en: "Hither, toward the speaker; also «come to (do)».",
          ex: [["tripa-pa-y", "sale / salió (hacia acá)", "he/she comes / came out (toward here)"], ["pe-pa-fiñ", "vengo / vine a verlo", "I come / came to see him/her"]] },
        { m: "-me-", es: "Hacia allá: «ir a».", en: "Thither: «go to (do)».",
          ex: [["pe-me-a-n", "iré a ver", "I will go to see"]] },
        { m: "-pu-", es: "Allá, en otro lugar.", en: "There, somewhere else.",
          ex: [["küdaw-pu-y", "trabaja / trabajó allá", "he/she works / worked over there"]] }
      ] },
    { id: "valencia", es: "Quién hace qué: voz y participantes", en: "Who does what: voice and participants",
      items: [
        { m: "-fi-", es: "Objeto de 3.ª persona: «lo», «la», «le».", en: "3rd-person object: «him», «her», «it».",
          ex: [["kim-fi-ñ", "lo sé / lo sabía, lo conozco / lo conocía", "I know / knew him/her/it"], ["kim-fi-mi", "lo sabes / lo sabías, lo conoces / lo conocías", "you know / knew him/her/it"]] },
        { m: "-e-", es: "Inverso: alguien hace algo a mí, a ti o a nosotros. Va en <b>-enew</b> («me»), <b>-eymi</b> («te»), <b>-eiñmu</b> («nos»), <b>-eyu</b> («yo a ti»).", en: "Inverse: someone does something to me, you or us. Found in <b>-enew</b> («me»), <b>-eymi</b> («you»), <b>-eiñmu</b> («us»), <b>-eyu</b> («I to you»).",
          ex: [["pi-enew", "me dice / me dijo", "he/she tells / told me"], ["elu-eiñmu", "nos da / nos dio", "he/she gives / gave us"], ["pi-eyu", "te digo, te dije", "I tell you, I told you"]] },
        { m: "-nge-", es: "Pasiva: la acción le pasa al sujeto. (Con un sustantivo, <b>-nge-</b> es «ser»; ver abajo.)", en: "Passive: the action happens to the subject. (With a noun, <b>-nge-</b> means «be»; see below.)",
          ex: [["pi-nge-y", "se dice / se decía, se llama / se llamaba", "it is / was said, he/she/it is / was called"], ["kim-nge-la-y", "no se sabe / no se sabía", "it is / was not known"]] },
        { m: "-w-, -uw-", es: "Reflexivo o recíproco: a sí mismo, el uno al otro.", en: "Reflexive or reciprocal: oneself, each other.",
          ex: [["pepil-uw-ün", "me preparo / me preparé", "I get / got myself ready"], ["ayü-w-ün", "me alegro / me alegré", "I am / was glad"]] },
        { m: "-l-, -üm-, -el-", es: "Causativo: hacer que alguien haga algo o que algo pase.", en: "Causative: make someone do something or make something happen.",
          ex: [["amu-l-fi-ñ", "lo mando / lo mandé, lo hago / lo hice ir", "I send / sent him/her (make / made him/her go)"], ["kim-el-tu-n", "enseñar (hacer saber)", "to teach (make know)"], ["la-ngüm-ün", "matar (hacer morir)", "to kill (make die)"]] },
        { m: "-lel-, -el-", es: "Para otro: hacer algo en beneficio (o en perjuicio) de alguien.", en: "For someone else: do something for (or to the detriment of) someone.",
          ex: [["dewma-lel-fi-ñ", "se lo hago / se lo hice", "I make / made it for him/her"]] },
        { m: "-ñma-, -üñma-", es: "Alguien afectado: quitar, hacer algo a lo de otro.", en: "Someone affected: take from someone, do something to what is theirs.",
          ex: [["nentu-ñma-fi-ñ", "se lo saco / saqué, se lo quito / quité", "I take / took it out from him/her"]] },
        { m: "-ka-", es: "Forma verbos de acción a partir de otras palabras: «hacer».", en: "Makes action verbs from other words: «do, make».",
          ex: [["nütram-ka-n", "conversar (hacer nütram)", "to converse (do nütram)"]] },
        { m: "-fal-", es: "Deber o valer la pena hacerse.", en: "Should be done, be worth doing.",
          ex: [["kim-fal-ke-y", "conviene / convenía saberlo, hay / había que saberlo", "it ought to be known / ought to have been known"]] }
      ] },
    { id: "verbalizar", es: "Verbos hechos de otras palabras", en: "Verbs made from other words",
      items: [
        { m: "-nge-", es: "Con un sustantivo o adjetivo: «ser».", en: "With a noun or adjective: «be».",
          ex: [["wentru-nge-n", "soy / era hombre", "I am / was a man"], ["domo-nge-y", "es / era mujer", "she is / was a woman"]] },
        { m: "-tu-", es: "Con un sustantivo: usar, comer o hacer lo que nombra.", en: "With a noun: use, eat or do what it names.",
          ex: [["kawellu-tu-n", "andar a caballo", "to ride a horse"], ["ilo-tu-n", "comer carne", "to eat meat"]] }
      ] },
    { id: "modo", es: "Otras formas del verbo", en: "Other forms of the verb",
      items: [
        { m: "-l-", es: "Condicional: «si…». Lleva sus propias personas: <b>-li</b> (yo), <b>-lmi</b> (tú), <b>-le</b> (él, ella)…", en: "Conditional: «if…». It has its own person endings: <b>-li</b> (I), <b>-lmi</b> (you), <b>-le</b> (he, she)…",
          ex: [["amu-l-i", "si voy", "if I go"], ["amu-l-mi", "si vas", "if you go"], ["amu-l-e", "si va", "if he/she goes"]] },
        { m: "-chi, -nge, -pe, -yu, -mu, -iñ, -mün", es: "Imperativo. Singular: «que vaya yo» (<b>-chi</b>), «¡ve!» (<b>-nge</b>), «que vaya él/ella» (<b>-pe</b>). Dual: <b>-yu</b> (nosotros dos), <b>-mu</b> (ustedes dos), <b>-pe engu</b> (ellos dos). Plural: <b>-iñ</b> o <b>-yiñ</b> (nosotros), <b>-mün</b> (ustedes), <b>-pe engün</b> (ellos). <b>-mu</b> y <b>-mün</b> van directo después de la raíz; en el indicativo va <b>-i-</b> o <b>-y-</b> antes (<b>amu-y-mün</b> «ustedes van»). <b>-yu</b> e <b>-iñ</b> son iguales al indicativo: <b>amuyu</b> es «vamos los dos» o «¡vamos (los dos)!».", en: "Imperative. Singular: «let me go» (<b>-chi</b>), «go!» (<b>-nge</b>), «let him/her go» (<b>-pe</b>). Dual: <b>-yu</b> (us two), <b>-mu</b> (you two), <b>-pe engu</b> (those two). Plural: <b>-iñ</b> or <b>-yiñ</b> (us), <b>-mün</b> (you all), <b>-pe engün</b> (them). <b>-mu</b> and <b>-mün</b> go straight after the root; the indicative has <b>-i-</b> or <b>-y-</b> before them (<b>amu-y-mün</b> «you all go»). <b>-yu</b> and <b>-iñ</b> are the same as the indicative: <b>amuyu</b> is «we two go» or «let's go (the two of us)!».",
          ex: [["amu-chi", "que vaya yo, déjame ir", "let me go"], ["amu-nge", "¡ve!", "go!"], ["amu-pe", "que vaya", "let him/her go"], ["amu-mu", "¡vayan (ustedes dos)!", "go (you two)!"], ["amu-mün", "¡vayan (ustedes)!", "go (you all)!"], ["amu-pe engün", "que vayan (ellos)", "let them go"]] },
        { m: "-lu", es: "Participio: «el que…», «al…», «cuando…».", en: "Participle: «the one who…», «when…».",
          ex: [["amu-lu", "el que va / cuando fue", "the one who goes / when he/she went"], ["kim-lu", "el que sabe", "the one who knows"]] },
        { m: "-el, -fiel", es: "Lo que se hace o se hizo a algo: el objeto de la acción.", en: "What is or was done to something: the object of the action.",
          ex: [["i-a-el", "comida (lo que se ha de comer)", "food (what is to be eaten)"], ["ñi pe-fiel", "lo que vi, el que vi", "what I saw, the one I saw"]] },
        { m: "-a-m", es: "Finalidad: «para».", en: "Purpose: «in order to».",
          ex: [["amu-a-m", "para ir", "in order to go"]] },
        { m: "-(ü)n", es: "Sustantivo de acción: el hecho de hacer algo.", en: "Action noun: the fact of doing something.",
          ex: [["kim-ün", "conocimiento, saber", "knowledge"], ["monge-n", "vida", "life"]] }
      ] },
    { id: "nominal", es: "Partículas del nombre: pu, ke, -chi, -kechi, -yem", en: "Noun particles: pu, ke, -chi, -kechi, -yem",
      items: [
        { m: "pu", es: "Plural de personas, animales y algunas cosas. Va antes del sustantivo.", en: "Plural of people, animals and some things. It goes before the noun.",
          ex: [["pu wentru", "los hombres", "the men"], ["pu che", "la gente", "the people"]] },
        { m: "-ke", es: "Con un adjetivo, plural de lo que describe; con un número, «de a», «cada». (En el verbo, <b>-ke-</b> es otro sufijo: el habitual.)", en: "With an adjective, plural of what it describes; with a number, «each», «by». (In verbs, <b>-ke-</b> is a different suffix: the habitual.)",
          ex: [["küme-ke kawellu", "buenos caballos", "good horses"], ["kiñe-ke", "algunos; de a uno", "some; one by one"]] },
        { m: "-chi", es: "Hace adjetivo de lo que va delante de un sustantivo. Con la raíz de un verbo, forma un participio adjetivo.", en: "Makes an adjective of what precedes a noun. With a verb root, it forms an adjectival participle.",
          ex: [["tüfa-chi ruka", "esta casa", "this house"], ["küme-chi wentru", "un hombre bueno", "a good man"]] },
        { m: "-kechi", es: "Hace adverbios de modo, como «-mente».", en: "Makes adverbs of manner, like «-ly».",
          ex: [["küme-kechi", "bien, buenamente", "well, nicely"]] },
        { m: "-yem, -em", es: "Con un sustantivo: dolor, recuerdo doloroso, compasión, ternura o admiración, o que alguien o algo ya no existe. (En el verbo, <b>-ye-m</b> es otra cosa; ver arriba.)", en: "With a noun: pain, painful remembrance, compassion, tenderness or admiration, or that someone or something no longer exists. (On a verb, <b>-ye-m</b> is something else; see above.)",
          ex: [["ñuke-yem", "la querida madre; la madre que ya no está", "dear mother; the mother who is gone"], ["chaw-em", "el padre que ya no está", "the father who is gone"]] }
      ] }
  ],
  source: {
    es: "Explicación breve y simplificada; las formas varían según la zona. Basada en el uso del corpus AVENUE y en Augusta (1916). Los ejemplos están segmentados con guiones; la primera parte es la raíz.",
    en: "A brief, simplified explanation; forms vary by region. Based on usage in the AVENUE corpus and on Augusta (1916). Examples are segmented with hyphens; the first piece is the root."
  }
};

/* Compound and reduplicated verb roots. Every example is an Augusta (1916) headword in its citation form, so tapping it
   opens the dictionary entry; "+" marks the join of two roots and "~" the repeated part (both removed when searching). */
window.RAICES = {
  intro: {
    es: "Muchos verbos tienen una raíz hecha de dos partes: dos raíces verbales juntas, un verbo con su objeto pegado, o una raíz repetida. Los sufijos van siempre después de la raíz entera: <b>leftripay</b> «huyó» es <b>lef</b> + <b>tripa</b> + <b>-y</b>. Toca un ejemplo para ver su entrada.",
    en: "Many verbs have a root made of two parts: two verb roots together, a verb with its object attached, or a repeated root. Suffixes always come after the whole root: <b>leftripay</b> «he/she fled» is <b>lef</b> + <b>tripa</b> + <b>-y</b>. Tap an example to see its entry."
  },
  groups: [
    { id: "vv", es: "Verbo + verbo", en: "Verb + verb",
      note: { es: "Dos raíces verbales forman una sola raíz. A menudo una dice la acción y la otra la dirección o la manera. Las raíces de dirección más frecuentes son <b>püra-</b> «subir», <b>nag-</b> «bajar», <b>kon-</b> «entrar», <b>tripa-</b> «salir» y <b>wüño-</b> «volver».", en: "Two verb roots form a single root. Often one gives the action and the other the direction or the manner. The most frequent direction roots are <b>püra-</b> «go up», <b>nag-</b> «go down», <b>kon-</b> «go in», <b>tripa-</b> «go out» and <b>wüño-</b> «go back»." },
      items: [
        { m: "dirección + acción", en_m: "direction + action", es: "La primera raíz dice hacia dónde; la segunda, qué se hace. Aquí con <b>kintu-</b> «mirar, buscar».", en: "The first root says which way; the second, what is done. Here with <b>kintu-</b> «look, search».",
          ex: [["püra+kintu-n", "mirar hacia arriba", "to look up"], ["nag+kintu-n", "mirar hacia abajo", "to look down"], ["wüño+kintu-n", "mirar hacia atrás", "to look back"], ["kon+kintu-n", "mirar adentro", "to look inside"]] },
        { m: "manera + movimiento", en_m: "manner + movement", es: "La primera raíz dice cómo; la segunda, el movimiento.", en: "The first root says how; the second, the movement.",
          ex: [["lef+tripa-n", "huir, salir corriendo (lef- «correr» + tripa- «salir»)", "to flee, run out (lef- «run» + tripa- «go out»)"], ["amu+yaw-ün", "andar sin rumbo (amu- «ir» + yaw- «andar»)", "to wander about (amu- «go» + yaw- «go around»)"], ["ina+kintu-n", "seguir con la vista al que se va (ina- «seguir»)", "to follow someone with one's eyes (ina- «follow»)"]] },
        { m: "posición + dirección", en_m: "position + direction", es: "La primera raíz dice la posición; la segunda, desde dónde o hacia dónde se llega a ella.", en: "The first root gives the position; the second, where one comes into it from or goes into it.",
          ex: [["anü+püra-n", "sentarse (el que está acostado)", "to sit up (from lying down)"], ["anü+kon-ün", "sentarse dentro de algo o entre otros", "to sit down inside something or among others"], ["witra+püra-n", "encabritarse (el caballo)", "to rear up (a horse)"]] }
      ] },
    { id: "vn", es: "Verbo + sustantivo", en: "Verb + noun",
      note: { es: "El verbo lleva pegado su objeto, sin <b>pu</b> ni artículo. El conjunto nombra la actividad en general más que un objeto en particular: <b>ketramapun</b> es «arar la tierra», no «arar esta tierra».", en: "The verb carries its object attached, without <b>pu</b> or an article. The whole names the activity in general rather than a particular object: <b>ketramapun</b> is «to plough land», not «to plough this land»." },
      items: [
        { m: "verbo + objeto", en_m: "verb + object", es: "Con <b>mapu</b> «tierra» y <b>düngu</b> «asunto, palabra».", en: "With <b>mapu</b> «land» and <b>düngu</b> «matter, word».",
          ex: [["ketra+mapu-n", "arar la tierra", "to plough land"], ["kintu+mapu-n", "buscar un terreno", "to look for land"], ["kintu+düngu-n", "buscar pleitos", "to look for trouble"], ["elu+düngu-n", "dar aviso", "to give notice"]] }
      ] },
    { id: "redup", es: "Raíces reduplicadas", en: "Reduplicated roots",
      note: { es: "Se repite la raíz entera. Muchas de estas raíces solo existen dobles (no hay un verbo <b>pish-</b>, solo <b>pishpish-</b>).", en: "The whole root is repeated. Many of these roots only exist doubled (there is no verb <b>pish-</b>, only <b>pishpish-</b>)." },
      items: [
        { m: "sonidos", en_m: "sounds", es: "Imitan el sonido de un animal o de una cosa.", en: "They imitate the sound of an animal or a thing.",
          ex: [["ngay~ngay-ün", "relinchar", "to neigh"], ["pish~pish-ün", "piar", "to chirp"], ["naw~naw-ün", "maullar", "to meow"]] },
        { m: "muchos a la vez", en_m: "many at once", es: "La acción la hacen varios sujetos.", en: "Several subjects do the action.",
          ex: [["anü~anü-n", "sentarse más de uno", "to sit (more than one)"], ["kudu~kudu-n", "acostarse muchos", "to lie down (many)"], ["witra~witra-n", "estar de pie varios", "to stand (several)"], ["püf~püf-ün", "saltar más de uno", "to jump (more than one)"]] },
        { m: "intensidad o repetición", en_m: "intensity or repetition", es: "La acción es fuerte, completa o repetida.", en: "The action is strong, thorough or repeated.",
          ex: [["far~far-ün", "sudar mucho", "to sweat a lot"], ["apo~apo-n", "llenarse mucho", "to fill right up"], ["lif~lif-ün", "limpiar bien", "to clean thoroughly"]] }
      ] }
  ],
  source: {
    es: "Explicación breve y simplificada. Los ejemplos son entradas de Augusta (1916) en su forma de diccionario; las traducciones resumen las suyas. «+» une dos raíces y «~» marca la parte repetida.",
    en: "A brief, simplified explanation. The examples are Augusta (1916) entries in their dictionary form; the translations summarise his. «+» joins two roots and «~» marks the repeated part."
  }
};
