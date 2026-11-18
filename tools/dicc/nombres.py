# Personal names in the AVENUE lines used by "¿Cómo lo dicen?" (diccionario/frases/). make_frases.py replaces each of
# them, in both languages, with "[nombre]". Built by hand from the capitalized words of the corpus (2026-11-17).
# Places, Ngünechen / Dios, countries, peoples, institutions and public figures (presidents) are kept.
# ALWAYS: replaced in any capitalization. CAPS: ordinary Spanish words too (rosa, julio, domingo...), replaced only
# when written with a capital letter.
ALWAYS = """
juan juana juanita juanito luis lucho luchu lui pedro pedrito pegro pegrito pablo pablu antonio toño maria maría mariquita
bernardo bernarda luisa isabel manuela fernando fernandu roberto robertu francisco fransiku vrancisco fancisco pancho panchu
sergio florentino florintino angelica angélica manuel mario jose josé ramon ramón hilda elena teresa victor víctor mariano daniel dani
miguel mguel mateo mateu florindo irma marcelina rafa carlos ricardo marta alfredo afredo alfreo alfreu alfrew alfredu vicente norma lidia ema
felipe ignacio inacio silvia artemio tomasa ernesto ernestu hernesto alberto albertu teodoro isiderio ofelia eugenio ariel
germán german samuel segundu segindo josefina jeronimo jerónimo silverio sandra aladino aladinu fortunato fortunatu gonzalo gonsalo
carlo martin martín fidelisa fidelicia cristina critina maruja antonia pamela alejito bautista laura jorge leopoldo abel olga
gabriel nicha rosabel beatriz beatri beatris martina vero pati agustin agustín autin clorinda rosalia rosalía elsa audalia audulia audilia
meche peyo yoni alejandro elba sulema guillermo osvaldo o'valdo rogelio diego feliciano mauricio paula luci sofia sofía
marcelino desiderio eusebio usebio pascuala paskuala selinda celinda laly avelino avelinu abelino abelinu andre andres andrés
adolfo margarita fabiola monica mónica reimundo nachio lalo nolberto dominguito domingitu jülio nicolás nicola' karme carme
veronica verónica vilma maldina ilada aristo tiofo matia domingia mamuela
cayul kayul kayules cariqueo huaiquiñir huaquiñir liempi huenchunao wenchunao cayuman painen paynen paynenlafuiñ coñuepan koñoepan
coñoepan coñoepán comuepan melin calfuco kalfuco kalfuko curin curín kurin nahuel huaiquil marillan huenteu huenteo
quilaqueo fauri caniupil cañiupil paillali payllali cahuemu chanillao millal pichuman pichulman millapan carilao carialo huenchupil
caniuman mariman cayuleo levin huilcaleo marinao huiriqueo huaiquimil waikimil huaquimil ñanculeo melillan huilipan quintriqueo canio kanio
millanao millanau cayunao kayunaw cuyanao cuayano curilem kurikeo curiqueo kintrikeo cancura kankura mollfünao mollfunao kolin colin
llankin llanquin paynekew collinao huaiquinao huaiquinau huenchual leviqueo antilef maliqueo ñancucheo meliñir lemuñir caririñi
paillal apeleo painequeo quilalew wirkaman huisca wiska huiscaengün necul huenupil wenupil antivil marivil huaiquipan arillan
calfücoy calfucoi callfüco pichuñan antillanca pichún kilakeao kilakeo quilaque awkul catricura katrilaw catrilau namuncura
quilapan kilapan alkapan alcapan huaiquilao huakilao curriao huilkaman huilcaman aucan mariguan waykillan nawelpan nawelengün
chahuinca kalfukomu linkoñir lincoñir manriqueñi mariquez huichunco millañ peiro lefiñ leiman peterman camargo camargos camargu camrago
neira saavedra saveedra savedra saaverdra quiroga morales morale morale' muñoz muños rozas lillo schmith imbode sandoval poblete
pacheco contreras figueroa vargas barga mellado mellao carmona vielma pastene pasten monroy moroy saez carreru arraigada bustos bustu
lastarria tarria tarrias gonzáles gonzale' sepuveda inostrozas castillu kotamu
luchumu juanmu juanitamu rafamu faurimu huenchupilmu bernardomu fernandomu antoniomu autinmu domingomu kurinmu neiramu contreramu
sandramu aureliamu mariamu muñomu aurelio alfonso paulu ilda raidel cayuqueo huente waikil huiquil haauiquil gonzale nicola piegramu
armando raúl raul rodrigo patricio héctor hector hugo jaime nelson oscar óscar rené rene ruth sara susana claudia patricia cecilia
ximena jimena marisol marcela raquel rebeca rodolfo rolando ruben rubén sebastián sebastian valentina wilson yolanda zunilda emundo edmundo
emilio enrique eduardo fabián gustavo gerardo humberto iván javier julián leonardo lorenzo marcos mariela maximiliano nicanor omar
orlando ramiro renato rigoberto salomé sonia tatiana ulises waldo yanet yasna marcelamu
wentew huenteo wenteo be'nardo nolbertongelu waikimilengün kayunawmu kayunawmew jeré jerez jerey machao kayulmu chikoyem chicoyem andreyem fortunatumeu
"""
CAPS = """
domingo dominga julio flora rosa rosita carmen pilar salvador mora peral marin marín pascual jesús santos chico chiko torre
paine millan rain luc huapi wapi tomás tomas ana carolina gloria luz mercedes esperanza
"""
def sets():
    a = set(ALWAYS.split()); c = set(CAPS.split())
    return a, c
