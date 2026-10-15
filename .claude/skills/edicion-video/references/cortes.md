# El criterio de corte

Esta es la parte que más veces hubo que rehacer, así que vale la pena entenderla
bien en vez de copiar números.

## La idea de fondo

El objetivo es que **no se perciba que hubo un corte**: que el video corra como si
fuera una toma continua, apretada. Isaias lo llama "cortes de generación Z". En la
práctica significa una sola cosa:

> **En el video no existe el silencio.**

No hay respiraciones, no hay aire antes de que arranque una frase, no hay cola
muerta después de que termine. Si entre dos frames queda medio segundo de nada, el
video arrastra y se nota.

Esto es contraintuitivo si venís de edición clásica, donde se deja aire para que
"respire". Acá no: el espacio muerto es exactamente lo que hace que alguien
deslice.

## Las dos reglas

### El frame entra con voz ya sonando

El punto de entrada va **exactamente en el arranque de la voz**, no unas
centésimas antes. Ni siquiera 50 ms de colchón: eso ya se percibe como demora.

Apenas aparece el frame nuevo tiene que haber sonido.

### La salida corta antes de que la cola termine de caer

El punto de salida va **apenas después de la última voz**, sin esperar a que el
sonido se apague del todo. La cola de una palabra decae durante 100-200 ms
después de que dejás de percibirla; esperar todo eso es aire muerto.

**La excepción importante:** si alarga la última sílaba —"salidaaas", "entoncees"—
esa palabra se deja entera. Alargar es intencional, es énfasis; cortarla suena a
error. Cuando pasa, se compensa entrando más rápido en el frame siguiente.

Para saber si alargó o no, mirá la envolvente: una sílaba alargada se ve como una
meseta sostenida al final de la palabra, no como una caída.

## La pausa de adentro de una frase NO es un hueco para matar

Esto es lo que más entendí mal, y lo corrigió él en el video 7 después de
recibirlo: *"cortaste todos los frames mal, porque los cortaste antes de tiempo.
Detectaste que no había más sonido y lo cortaste"*.

La regla de que no hay silencios vale **entre frases**, no adentro de una. Él no
memoriza el guion entero: lo dice **frase por frase**, y adentro de una frase
larga hace pausas para acomodarse. Sus palabras: *"nunca vas a ver que hago una
frase que corta y después digo otra frase. No es que digo palabra por palabra,
digo una frase completa"*.

El ejemplo que dio, y que conviene tener de memoria porque explica el criterio
entero:

> **"…tampoco gastó miles de dólares [360 ms] en publicidad."**
>
> *"Cuando decís 'miles de dólares' tenés que justificar en qué — en publicidad.
> Entonces es una frase que está unida."* Hay silencio, el detector lo marca, y
> **cortar ahí queda antinatural**. La pausa es suya.

Cómo se aplica, que cambia el armado entero:

1. **Antes de elegir bordes, leé la transcripción como guion** y marcá dónde
   termina cada ORACIÓN, no cada pasada.
2. Un bloque no es una pasada del menú: es **una corrida continua de la misma
   toma**, con todas sus pausas internas adentro. En el video 7 eso llevó el
   corte de 34 bloques a 9.
3. Sólo se corta donde de verdad hay que **saltar a otra toma**, o donde hay un
   tropiezo real que sacar.
4. La salida de cada bloque **no va donde deja de haber voz**: va donde la frase
   **terminó de caer** —medilo contra el umbral de cola, voz − 22,5 dB— y ahí se
   le suma un respiro. En el video 7 fueron 0,25 s para todos y 0,5 s para el
   remate.

La diferencia entre un tropiezo y una pausa se mide, no se discute: el tropiezo
del video 7 —"y no, no subió un video por día"— tenía **100 ms** entre las dos
palabras; las pausas que él hace a propósito iban de **240 a 1000 ms**. Cuando el
hueco es de décimas, es respiración; cuando es de centésimas, es que se trabó.

Ojo con no irse al otro lado: esto **no** deroga la regla de que no hay aire
muerto. Entre un bloque y el siguiente se sigue sin silencio. Lo único que
cambia es que una pausa adentro de una frase dejó de contar como aire muerto.

## Por qué silencedetect no alcanza

`ffmpeg silencedetect` responde una sola pregunta: "¿el nivel está por encima o por
debajo de este umbral?". Sirve para encontrar pausas largas, pero falla en las dos
cosas que importan acá:

1. **El umbral es relativo a nada.** Si la ventana que analizás es casi toda voz, el
   piso calculado sube y el final de la frase no se detecta.
2. **No distingue una consonante sorda de un silencio.** Una /s/ o una /f/ tienen
   poca energía en graves y se leen como silencio, aunque para el oído sean parte
   de la palabra.

El segundo punto costó una corrección entera: el corte cayó entre la vocal de
"hicimos" y su /s/ final, y la palabra quedó como "hicimo". Ver más abajo.

## Cómo medir bien

Usá `scripts/envolvente.mjs`, que calcula el nivel RMS en ventanas de 10 ms. Con
eso ves el nivel real cuadro a cuadro y podés decidir con criterio.

```bash
node scripts/envolvente.mjs <archivo.wav> 252.6 1.0
```

Imprime una barra por ventana, así se lee de un vistazo dónde arranca y termina
cada sonido.

### El piso de ruido

Medilo **una vez** sobre una pausa larga real del crudo, y usá un umbral absoluto
para todo el archivo. En la sala de Isaias el piso es de unos −66 dB, muy parejo,
así que **−50 dB funciona bien como umbral de voz**: está claramente arriba del
ruido y abajo de cualquier habla, incluso susurrada.

Calcular el piso por ventana parece más prolijo pero falla justo en las ventanas
que son casi todas voz.

### Las sibilantes viven en los agudos

Si sospechás que un corte se comió una /s/, /f/, /ch/ o /j/, no la vas a ver en la
envolvente de banda completa: esos sonidos tienen su energía arriba de 4 kHz y casi
nada abajo.

Filtrá y volvé a medir:

```bash
ffmpeg -v error -ss <t> -t <dur> -i audio.wav \
  -af "highpass=f=4000,asetnsamples=160,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-" \
  -f null -
```

Una /s/ aparece como un pico limpio de 80-100 ms. En el caso de "hicimos", la
vocal terminaba en 252,87, había un bache de 30 ms, y la /s/ iba de 252,91 a
253,00. El corte estaba en 252,90 — justo en el bache. Se escuchaba "hicimo".

**Conviene revisar esto siempre que un bloque termine en palabra con /s/ final**,
que en español rioplatense es casi la mitad de las frases.

### La ese despegada del final de frase

Lo de "hicimos" era una /s/ pegada a la palabra, a 30 ms de la vocal. Cuando la
frase cierra y la voz se va apagando, la ese se despega mucho más y queda mucho
más abajo de nivel.

En "nunca te van a faltar pacientes" el reparto era éste:

| tramo | banda completa | >4 kHz |
|---|---|---|
| "-tes" (la vocal) | −47 a −51 dB | −75 dB |
| nada | −60 dB | −85 dB |
| **la /s/ final** | −55 dB | **−52 dB** |
| silencio | −63 dB | −90 dB |

Dos cosas la hacen invisible:

- **En la banda completa está por debajo del umbral de voz.** Mide −55 dB contra
  un umbral de −50: para el detector, ahí no hay nadie hablando.
- **Arranca 150 ms después de la vocal**, no 30. Una ventana corta no llega.

Lo único que la delata es la relación entre bandas: −52 dB arriba de 4 kHz contra
un piso de −91 son 39 dB de señal, o sea una sibilante clarísima. **El umbral va
siempre contra el piso medido de la banda, nunca contra un número fijo.**
`revisarSibilante` usa piso + 25 dB y mira 450 ms para adelante.

Para no confundirla con la palabra siguiente: en una sibilante la banda completa
mide casi lo mismo que la de agudos, porque la energía está toda arriba. Si la
completa está 12 dB o más por encima, eso es una vocal, y una vocal ahí ya es la
palabra que sigue.

### El silencio que hay adentro de una palabra

Las oclusivas —/k/, /t/, /p/, /b/, /d/, /g/— se pronuncian cerrando la boca: hay
30 a 60 ms de silencio real **adentro** de la palabra, antes de la explosión.

En la envolvente ese silencio se ve igual que el final de una frase. En "del boca
en boca":

    639.81-639.86  la vocal cae         -36 -> -49 dB
    639.87-639.91  silencio de la /k/   -51 -> -54 dB   <- el corte estaba acá
    639.92-640.09  "ca"                 -40 -> -32 dB
    640.10-640.20  silencio de verdad   -50 -> -58 dB

El corte en 639,90 dejaba "del boca en bo-". Y lo peor: en la medición no parecía
un error, parecía una frase terminada.

**`bordeSalida` ya resuelve esto**: tolera baches de hasta 60 ms antes de dar por
cerrado el bloque, justo para no frenar en una oclusiva. El error fue no correrlo.

## El OUT no sale nunca de Whisper

Los dos finales cortados del video 2 tienen la misma causa de fondo, y es de
método, no de oído:

- Whisper dijo que "boca" terminaba en 639,87. La envolvente dice 640,13. Son
  260 ms de diferencia: una sílaba entera.
- Whisper dijo que "pacientes" terminaba en 917,04. Contando la ese, 917,36.

Whisper ubica **palabras**, con la resolución que le alcanza para escribir texto.
Los cortes se ubican con la **envolvente**, que mide el sonido. Tomar un borde del
tiempo de Whisper es cómodo y sale mal: siempre `buscar-bordes.mjs`, y si la
palabra termina en /s/, además `dos-bandas.mjs` mirando las dos bandas juntas.

## Cuál pasada elegir: siempre la última

Cuando encontrás una pasada completa y bien dicha de una frase, **no te quedes con
ésa**. Seguí leyendo: si la frase aparece otra vez más adelante en el crudo, la que
va es **la última**.

Es contraintuitivo, porque la primera pasada completa suele sonar bien y da la
sensación de que ya está. Pero que la oración esté completa no quiere decir que él
haya quedado conforme: en el crudo del 2026-09-15 el hook estaba entero en 4:58, y
sin embargo enseguida se arrepiente, mira a un costado y lo vuelve a decir cuatro
veces más hasta la versión de 6:07. Esa cara de duda queda en el video aunque el
audio esté perfecto.

La regla, en sus palabras: *"si ves que digo dos veces la misma oración, buscá que
sea la última opción siempre"*.

Vale igual cuando no repite la frase literal sino que la va reformulando. La última
formulación es la que tiene decidida, y casi siempre es la más corta y la que mejor
engancha con lo que sigue.

**Un efecto lateral que conviene aprovechar:** como las últimas pasadas de bloques
consecutivos suelen estar pegadas en el crudo, elegirlas hace que dos bloques del
guion caigan en la misma toma. Ahí el empalme deja de ser un corte y pasa a ser un
plano continuo al que sólo le sacás la pausa del medio.

### Mejor que adivinar: que él marque la toma en voz alta

Desde el video 8, Isaias marca las tomas buenas hablando. Cuando una le sale
bien, deja medio segundo de silencio y dice una frase corta:

> **"esta es la buena"** · "esta sirve" · "esta va" · "usá ésta"
> (con "Claude" adelante o atrás, como le salga)

Eso cambia el trabajo de raíz. Hasta el video 7 la elección salía de una regla
—"la última de cada tanda"— más mediciones que buscaban confirmarla o
desmentirla. La regla es buena pero es inferencia: en el video 7 la última toma
del gancho estaba mordida en tres lugares y hubo que desobedecerla. La marca no
es inferencia, es **el dato que falta**: cuál le gustó a él.

#### Cómo se detecta

La marca es su propia pasada del menú, porque está separada de la toma por
silencio. Entonces se pide que se cumplan **dos** cosas a la vez, y con eso los
falsos positivos desaparecen:

1. Es una pasada **corta** (menos de ~1,5 s).
2. Su texto cae en la familia de frases de marca.

```js
const MARCAS = /(esta|ésta)\s+(es\s+la\s+buena|sirve|va|me\s+(gust|sali|qued))/i;
const esMarca = (p) => p.f - p.i < 1.5 && MARCAS.test(p.t);
```

**El ancla es la frase en castellano, no la palabra "Claude".** Whisper escribe
sin problema tres o cuatro palabras corrientes juntas, pero un nombre propio
extranjero le sale distinto cada vez —cloud, clod, claud, clau—, así que si se
la busca a ella sola la detección se vuelve frágil. Que él la diga está bien y
suma, pero el que manda es el castellano.

La toma marcada es **la pasada inmediatamente anterior** a la marca. Si hay
varias marcadas en la misma tanda, va la última marcada.

#### Lo que aprendimos en el crudo del 29/09 (el de "¿qué contenido haría si fuera odontólogo?")

Fueron trece marcas en 18 minutos y el regex de arriba no agarraba casi
ninguna. Lo que hay que saber:

- **Las formas reales son otras**: "esa es buena", "ese es bueno", "esa toma es
  buena", "y ese es buena", "ahora sí, ahora sí, esa es buena". Y `small` las
  escribe deformadas: "Hasta la buena" (= "esta es la buena"), "es a juana",
  "y se bueno", "es el one". **Buscá "buen" en toda pasada de menos de 1,5 s y
  re-escuchala con `medium`**; no confíes en el regex.
- **Revoca en voz alta.** "No, pará, mejor Claude, esa que te dije que es buena
  borrala, vamos a hacer una de nuevo" y "esa que te dije, esa es buena, no la
  usemos, vamos a usar esta otra". Una marca revocada no cuenta; vale la marca
  que viene después (o la última de la tanda que sigue).
- **Marca tarde, hablándote.** A mitad del crudo dijo "ah, por cierto, esa es
  buena, me olvidé de decirte… la de 'lo segundo es hacer de forma progresiva…',
  esa era buena". Son comentarios largos (5-20 s) que el menú parte en varias
  pasadas: leé el menú buscando frases dirigidas a vos, no sólo marcas cortas.
- **La marca vale para la corrida entera, no para la última frase.** Si la toma
  marcada es una secuencia continua con un silencio adentro —ver abajo—, va
  entera: *"tienen que ir todos juntos"*.

#### El silencio que deja para el guion NO se corta

Excepción a la regla de que no hay silencios: cuando el guion tiene algo que
pasa *sobre* su silencio —una voz en off, un efecto—, él lo actúa en la toma y
deja el hueco. En el 29/09: *"Lo primero es que no haría contenido, haría
anuncios" → [scratch] → [voz en off: "Pero Isaías, no todos quieren hacer
anuncios"] → [mira al costado] "bueno, está bien… ¿qué contenido haría…?"*. Él
dejó 2,7 s entre "anuncios" y el "bueno": ahí va el efecto y la voz en off, y
**ese silencio se deja**, textual: *"a pesar de que siempre te digo que corte
los silencios… dejá el silencio"*. Si no mandó el guion, preguntá qué va ahí
antes de cortarlo.

#### Lo que NO cambia

- **La marca se corta.** Es una pasada aparte, así que sale sola del menú.
- **Los bordes se siguen midiendo.** Él marca *qué toma*, no dónde entra ni
  dónde sale: eso sigue saliendo de la envolvente.
- **La toma marcada se verifica igual**, transcrita aislada con el modelo
  grande. Si le falta una palabra —como el "caros" que se comió la última toma
  del gancho del video 7— **se le avisa**, no se cambia por las buenas.
- **Si no marcó nada, vale la regla de siempre**: la última de la tanda.

#### Lo que ahorra

El barrido actual transcribe las 300 pasadas con `small` y después vuelve a
escuchar las finalistas con `medium`: media hora de máquina. Con las marcas
alcanza con transcribir las marcadas y sus vecinas — minutos.

#### Por qué no alcanza con ordenar mejor la grabación

La otra idea era grabar agrupado: las cinco repeticiones de una frase juntas,
después las de la siguiente. **Eso ya lo hace**, y el menú de pasadas ya lo
aprovecha. El problema nunca fue encontrar las tandas: fue saber cuál de las
cinco le gustó. Ordenar mejor no agrega ese dato; marcar sí.

Lo único que sí conviene pedirle de esa idea: **que los tartamudeos queden
aparte**. Un "o, la, o la" no es una repetición de la frase, es un tropiezo, y
no cuenta como toma.

### Cómo se reconoce cuál es la última: el menú de pasadas

Isaias explicó cómo lo piensa él: *"sabés que lo que estoy por decir a
continuación no tiene nada que ver con la última frase que estaba repitiendo
constantemente"*. El final de una tanda no se busca contando repeticiones, se
busca en el **cambio de tema**.

Leyendo la transcripción del archivo entero eso es casi imposible de ver: el
modelo funde las repeticiones en párrafos y los tiempos se corren hasta 0,3 s.
Lo que lo resuelve es armar el menú primero, en dos pasos:

1. **Partir el crudo en pasadas delimitadas por silencio real**, con la
   envolvente: una corrida de voz con huecos de menos de 0,22 s es una pasada.
   El crudo del video 6 dio 157.
2. **Transcribir cada pasada aislada.** Son unos minutos de máquina y cambia
   todo el trabajo: la tanda se ve entera, numerada y con sus tiempos, el cambio
   de tema salta a la vista, y **cada línea del menú ya es un corte válido**,
   porque arranca y termina en silencio por construcción.

```
 78   281.74- 285.25 ( 3.51s)  Los procedimientos con sangre o la misma cirugía es...
 79   286.42- 288.90 ( 2.48s)  mostrar el procedimiento donde se verse.
 80   289.38- 294.10 ( 4.72s)  mostrar el procedimiento de la cirugía y se ve sangre…
 81   294.86- 298.22 ( 3.36s)  Mostrar el procedimiento donde hay sangre, donde se ve la cirugía.
 82   298.53- 300.44 ( 1.91s)  es lo peor que puedes hacer
 83   300.66- 303.43 ( 2.77s)  puede entretener a las personas…      ← cambió de tema
```

El 81 es la última de la tanda, y se sabe porque el 83 ya habla de otra cosa.

Elegir sobre ese menú en vez de sobre tiempos sueltos es lo que hizo que el
video 6 pasara la revisión de bordes con cero avisos a la primera.

### Pero la última tiene que estar completa y bien dicha

La regla existe porque la última suele ser la buena, no al revés. Cuando no lo
es, va la anterior y **se le avisa en una línea**. En el video 6 pasó dos veces:

| tanda | última pasada | la que fue |
|---|---|---|
| "igual no lo descartes…" | "no lo descartes **este** contenido" (258,62) | la de 250,62, que dice "en el contenido" |
| el cierre | "si querés aprender más, si querés aprender a vender…" (622,82) | la misma pasada, entrando en 623,83, después del arranque pegado |

Antes de descartar una última pasada por mal dicha, **escuchala con el modelo
grande y aislada**, no con el que usaste para el barrido. Los dos casos de arriba
los confirmaron `small` y `medium` por separado.

### Cuando la última pasada tampoco está entera

Pasa, y bastante: la última pasada es la que él dio por buena pero tiene un hueco
de titubeo en el medio. En el video 4 el gancho se cortaba después de
"herramientas", y el bloque de Diagnocat estaba partido en cuatro pedazos con
huecos de 3 y 4 segundos.

El orden para resolverlo:

1. **Mirar si el hueco parte una frase o separa dos intentos.** En el gancho del
   video 4 los primeros 1,4 s eran un arranque en falso ("estas son seis
   herramientas que puede…") y la pasada buena empezaba de nuevo 0,4 s después,
   entera. No había nada que empalmar: había que entrar más tarde.
2. **Si parte una frase, empalmar los pedazos de esa misma pasada.** Suenan como
   una frase sola porque lo son.
3. **Si quedan más de dos pedazos, mezclar con la pasada anterior.** El cuerpo se
   mueve entre tomas, pero en un plano fijo eso se lee como un corte normal, y es
   mejor que tres empalmes seguidos.

Un detalle que ahorra tiempo: los huecos de Whisper **no se miden con el `fin` de
cada palabra**, porque el modelo lo estira hasta la palabra siguiente y tapa el
silencio. Se miden de arranque a arranque, o directamente sobre la envolvente.

## La duda arrastrada antes de arrancar

Antes de largar una toma suele haber un sonido sostenido de titubeo —una "sssss"
larga, una "eeeh"— separado de la frase por una pausa. No es parte de la palabra:
es el arranque en falso.

El detector de voz lo marca como habla, porque lo es. Si te guiás sólo por "dónde
empieza el sonido", el corte entra ahí y la pieza abre con un zumbido de medio
segundo antes de la primera palabra. En el video 2 el hook empezaba con 340 ms de
"ssss" y la palabra recién entraba un segundo después.

Cómo distinguirlo, mirando la envolvente:

- El titubeo es **plano y apagado** (unos 15 dB por debajo del habla) y **largo**
  para lo que dice: 300 ms para un solo fonema.
- Después hay **silencio real**, de 300 ms o más.
- Recién ahí arranca la palabra, con un **ataque neto** y nivel pleno.

El corte va en el ataque de la palabra de verdad, no en el titubeo. Y con el mismo
cuidado de siempre: si la palabra empieza con /s/ —"si", "siempre", "sos"— hay que
entrar en la /s/, que en la banda de agudos se ve 100 ms antes que la vocal. En el
hook del video 2 la "S" real arrancaba en 403,70 y la vocal en 403,81: entrar en
403,81 hubiera comido la ese, entrar en 402,63 traía el titubeo entero.

## El corte necesita silencio, no un bajón de nivel

Es el error que más veces volvió en correcciones, y siempre suena igual: un
pedacito de palabra pegado al principio o al final del bloque. Isaias lo describe
como *"dice dem, y recién va la frase"*, *"se escucha dial que responde"*,
*"se escucha afía o una tomografía"*.

Pasa cuando el punto de corte se elige **adentro de una corrida de voz**, apoyado
en un bajón de nivel de uno o dos cuadros. Ese bajón es el borde entre dos
palabras, sí, pero en el habla corrida las palabras están pegadas: la consonante
de la anterior sigue sonando adentro de la siguiente. Cortar ahí deja la cola.

La regla: **el punto de entrada tiene que tener silencio real antes** —100 ms o
más por debajo del piso, no un `+` en la envolvente—. Si la frase que querés no
tiene silencio antes, no la cortes ahí: agarrá el bloque desde una frase antes, o
buscá otra pasada.

Tres casos reales del video 4, todos el mismo error:

| Corte | Lo que se escuchaba | Qué había en el medio |
|---|---|---|
| 1156,97 | "dial que responde" | el corte caía adentro de "artificiaL que" |
| 1124,10 | "dem, la sexta es" | la cola del "de" del intento anterior |
| 169,83 | "afía o una tomografía" | la mitad final de "radiografía" |

## Antes de empalmar, buscá la pasada entera

El empalme es la última opción, no la primera. En el video 4 armé el bloque de
Diagnocat con tres pedazos de tres pasadas distintas —y encima la pasada que
elegí para el arranque era una donde él se equivoca, dice "le cargás un informe"
y se frena—. Veinticinco segundos antes en el crudo estaba la frase entera,
corrida, en una sola toma.

La corrección de Isaias, textual: *"tenés que poner el mejor fragmento donde sale
todo completo"*.

Antes de empalmar nada, listá **todas** las corridas de voz de la zona (con el
umbral de la envolvente, no con los tiempos de Whisper) y transcribí las más
largas. La pasada entera suele estar ahí y no la viste porque la transcripción
larga la fundió con las de al lado.

## Si la oración no cierra, estirá el bloque hasta que cierre

Distinto de la entonación: acá la frase directamente no terminó. En el video 4 el
bloque de Gamma cortaba en "…en formato texto con imágenes," y lo que seguía
—"presentaciones e incluso formatos visuales"— quedaba afuera. La frase sonaba
colgada.

Sus palabras: *"o has cortado antes de que termine la oración y había algo que
decía después… si no hay una frase completa, estirá el frame hasta que termine la
oración bien"*.

O sea: primero fijate si hay una pasada completa; si no, estirá el corte hasta el
final de la oración. Nunca lo dejes cortado a mitad de idea para ganar dos
segundos.

**Y si la oración nunca se terminó, la frase no va.** Puede pasar que las dos o
tres pasadas que existen estén todas cortadas. En el video 4, "incluso te va a
dejar los hallazgos cargados arriba **de**…" se corta ahí en una pasada y en
"…los hallazgos **que**…" en la otra: no hay ninguna entera.

Ahí no hay corte que lo arregle y conviene chequear las tres salidas antes de
insistir:

1. ¿Hay otra pasada? Listá **todas** las corridas de voz de la zona. Si ninguna
   pasa de un segundo y medio, no hay.
2. ¿Sirve cortarla más corto, en la última palabra que sí cierra? Medilo con
   `entonacion.mjs`, no a ojo. En este caso terminar en "cargados" daba **186 Hz**
   —abiertísima— contra 89 Hz terminando en "arriba": el recorte era mucho peor
   que el original.
3. Si ninguna de las dos, **sacá la frase** y decíselo. Que falte una idea es
   mucho menos grave que una frase que suena mordida, y con tres segundos de
   pickup vuelve a entrar sin tocar nada más.

Ojo con una trampa de este caso: Isaias **se acuerda de lo que iba a decir**, así
que escucha el corte como truncado aunque acústicamente cierre grave. Si marca una
frase dos veces, no discutas el número: no está.

## El arranque en falso NO es una palabra

Antes de largar una toma suele haber un pedacito de sonido de 200-300 ms, después
un silencio corto, y recién ahí la frase. Ese pedacito **no va**, aunque se
parezca a la primera palabra de la frase.

En el video 4 empalmé uno de esos como si fuera un "muy" y quedó "muy muy bueno".
La toma de al lado ya decía "muy bueno" entera: el empalme sobraba. Su comentario:
*"quitá el anterior frame de muy, que quede muy bueno si querés mostrar a
alguien"*.

Cómo reconocerlo: dura menos de 0,35 s, está separado de la frase por un silencio
de 250-300 ms, y si transcribís la frase sola **ya incluye esa palabra**. Si el
bloque de al lado ya la dice, el pedacito es un arranque en falso.

## Palabras repetidas: queda una sola

Cuando en un tramo se escucha la misma palabra dos veces seguidas —"hoy, hoy en
día", "el segundo, el segundo motivo"— **está mal y hay que rehacer el corte**. No
alcanza con que el audio suene fuerte y la frase esté bien dicha de ahí en
adelante: la repetición delata el tropiezo.

Ojo, porque no siempre hay una pausa marcada entre las dos. En el video 2 el bloque
decía *"Hoy en… día la mayoría depende"* con un bache de 160 ms en el medio; en la
envolvente no aparece como dos bloques separados, pero al oído suena a tartamudeo.

La salida casi nunca es recortar más fino: es **buscar otra pasada donde la frase
salga de corrido**. Siempre hay una, porque graba cada frase muchas veces. En ese
caso la pasada limpia estaba 50 segundos más adelante y encima enganchaba mejor con
el bloque siguiente.

Vale también para la repetición que NO es un error: *"nadie está haciendo anuncios
y como nadie está haciendo anuncios sos el primero"* es una figura retórica, está
dicha de corrido y se deja.

### La pasada aislada puede esconder la repetición; el render no

Esto se escapó de nuevo en el video 7 y merece la pena saber por qué, porque el
control que lo agarra ya se estaba corriendo.

La pasada 40, transcrita **aislada** con el modelo grande, daba *"Este
consultorio consigue más de 600 personas interesadas en tratamientos caros"* —
una sola vez. Sobre un recorte corto el modelo normaliza el tartamudeo y lo
escribe limpio. La misma toma, transcrita **desde el render terminado**, daba
*"Este consultorio, este consultorio consiguió más de 600 personas…"*.

O sea: la verificación de "transcribí el render de vuelta" **sí lo encontró**, y
la falla fue de lectura — el renglón estaba ahí y pasó como si nada. Entonces:

- **Cuando la transcripción del render y la de la pasada aislada no coinciden,
  la del render tiene razón.** Es audio más largo y con más contexto.
- Leer esa transcripción es un paso del trabajo, no un trámite. Una palabra
  repetida al principio de un renglón es un defecto, aunque el resto esté bien.
- Los dos arranques suelen estar a **un segundo exacto** uno del otro, con 150 a
  200 ms de silencio en el medio: se ven de una en la envolvente.

### Y a veces ninguna transcripción lo ve (29-30/09)

El bloque del CTA del 29/09 arrancaba *"y en… y entre vos y yo"*: un "y en"
amagado de 230 ms, un valle de 50 ms y recién ahí el "y" bueno. Lo marcó él:
*"el primer 'y en' quitalo… y ojo, no modifiques el resto del guion"*. Esta vez
**ningún** Whisper lo escribió: ni medium ni large-v3 sobre el bloque aislado,
ni medium sobre el render terminado con música — todos dan "y entre vos y yo".
Cuando el amago es la misma palabra corta que la frase (un "y", un "el"), el
modelo la funde con la siguiente.

Así que en el arranque de cada bloque el chequeo es acústico:

1. Mirá la envolvente de banda de voz en los primeros 0,8 s del bloque. Si hay
   **dos corridas de voz antes de la primera palabra larga**, separadas por un
   valle (acá 585,22-585,27, piso −39 dB contra picos de −12), sospechá.
2. Transcribí **sola** la primera corrida (acá 584,95-585,25 dio "Y…"). Si es lo
   mismo que arranca después del valle, es un amago: el IN va en el fondo del
   valle, en el cuadro que cae adentro (acá 585,2667; el anterior, 585,2333,
   todavía arrastraba la cola del "en").
3. Mové sólo ese IN (`entra` en la tabla) y compará los bloques contra los de
   antes: tiene que cambiar ese número y nada más. Todo lo que viene después en
   la edición se corre los mismos cuadros (acá 9): subtítulos, íconos, motion
   graphics y sonidos se corren enteros, no se re-sincronizan a mano.

## La entonación: si termina en agudo, la frase quedó abierta

Un bloque puede tener el audio impecable, la frase completa, el corte medido al
milisegundo — y aun así sonar mal. La señal es el **tono con el que termina**.

Cuando una oración cierra de verdad, el tono **baja** por debajo del habla normal.
Cuando iba a seguir hablando y el corte la interrumpió, el tono **queda arriba**.
Al oído se percibe como que falta algo, aunque la frase esté gramaticalmente
completa.

En sus palabras: *"cuando termina en agudo significa que no lo hice bien"*. Es
información sobre la toma, no sobre el corte: él sabe que ahí iba a decir otra cosa.

### Cómo medirlo

```bash
node scripts/entonacion.mjs audio.wav 480.78 484.49
```

Estima el tono por autocorrelación y reporta la pendiente de la parte final en
semitonos por segundo.

**Lo que importa mirar es el tono final contra su línea base**, más que la
pendiente. La línea base de Isaias está en 105-115 Hz:

- Termina **por debajo de ~110 Hz** → cerró.
- Termina **por encima de ~140 Hz** → quedó abierta. El caso que marcó terminaba
  en 170 Hz.

La pendiente sobre medio segundo es ruidosa y a veces contradice al oído; el valor
absoluto del final es mucho más estable.

### El artefacto de octava

Los últimos cuadros, con la voz apagándose, dan lecturas basura: la
autocorrelación engancha un armónico y aparecen saltos a 200-400 Hz que no
existen. Se reconocen porque la **claridad** cae por debajo de 0,5 mientras el
nivel se desploma. El script ya los descarta, pero si un número te sorprende,
mirá el detalle antes de creerle:

```bash
node scripts/entonacion.mjs audio.wav 480.78 484.49 --detalle
```

### Qué hacer cuando termina en agudo

Por orden:

1. **Buscar otra pasada de la misma frase que cierre grave.** Casi siempre existe,
   porque repite cada frase muchas veces. Medí el final de todas y quedate con la
   que cierra — y si hay varias, con la última.
2. **Si ninguna cierra, extender el corte** para incluir lo que estaba por decir.
   La frase se completa sola y el tono baja donde corresponde.

En el video 2 el bloque del factor terminaba en 170 Hz. Midiendo las diez pasadas
de esa idea, dos cerraban grave; la buena estaba 33 segundos más adelante y además
decía la idea más completa: *"y esto se debe a un solo factor, el primero es que no
tenés competencia, y si tenés es muy poca"*, terminando en 117 Hz.

## El remate necesita aire

La regla de cortar apenas termina la voz vale para todos los bloques **menos el
último**. El final de la pieza necesita respirar: si cortás 20 ms después de la
última sílaba, la palabra suena truncada aunque los fonemas estén completos, y el
video termina de golpe.

Al último bloque dale **medio segundo** después de que cae la voz. No un segundo
—eso ya es un silencio que invita a deslizar—, medio. Es lo que le da el
dramatismo al remate.

## Cuando el bloque cierra una idea, la palabra tiene que terminar de caer

La regla de cortar apenas termina la voz deja la última palabra todavía en
−30/−38 dB. Mitad de una idea eso no se nota, porque la voz del bloque siguiente
la tapa. Pero cuando el bloque **cierra un tema** y lo que sigue arranca otro, la
cola truncada se escucha: la palabra queda como mordida.

En el video 4 pasó con "…los hallazgos cargados arriba", que cierra Diagnocat justo
antes de que empiece Relu. El corte medido caía en 234,97 con la palabra en
−38,5 dB.

El arreglo es estirar la salida hasta que la caída llegue a **−45 dB o menos**, que
ya es inaudible. Acá fueron 33 ms —un cuadro—, y alcanzó. Mirá la envolvente
ventana por ventana en vez de confiar en `bordeSalida`:

```
234.930  -19.1   ← última voz
234.970  -38.5   ← donde caía el corte medido
235.000  -45.4   ← acá termina de verdad
235.030  -33.3   ← arranca el intento siguiente: hasta acá y no más
```

Ojo con el redondeo a cuadros: el cuadro siguiente (235,033) ya se comía el
arranque del reintento. El margen real era de un cuadro.

## Empalmar dos tomas

Cuando la mejor versión de una frase no existe entera, se puede armar con pedazos.
Funciona bien si:

- Las dos piezas son **de la misma toma** (posición del cuerpo y las manos
  parecidas) o están separadas por un corte que ya se justifica de por sí.
- El empalme cae en un **borde de palabra**, no en medio de una.
- La pausa que queda entre las dos piezas es **corta** (100-200 ms): suena a
  respiración natural, no a edición.

Ejemplo real: la toma decía *"Entonces, lo primero... lo primero que hicimos, lo
primero que hicimos ver..."*, trabándose dos veces. Se tomó el "Entonces," del
arranque (249,41-249,82) y la última pasada limpia (252,03-253,01) de la misma
toma. El resultado se escucha como una frase sola.

## Cuando se traga una palabra

Si en el crudo una palabra dura muy poco y está varios dB por debajo del resto, la
está tragando. No fuerces el corte para incluirla: no se va a entender igual.
Sacala también del subtítulo, para que lo que se lee coincida con lo que se
escucha.

Cómo distinguirlo de una sibilante recortada: una palabra tragada es **corta y
apagada en todas las bandas**; una sibilante recortada tiene **energía fuerte en
agudos** aunque en graves parezca nada.


## Completar una frase no es pegarle la reformulación

Video 4c, en tres vueltas sobre la misma frase del 1:50:

1. *"Termina en agudo, agregá lo que falta"* → se cambió a la pasada que decía
   "…hace una video reacción **a algún creador o…**" (222).
2. *"Cortaste justo la parte que iba a completar la frase"* → después de ese
   "o…" no la completa en ninguna toma: la reformula. Se le pegó la última de la
   tanda, "y hace un estilo de video que es como una video reacción" (231).
3. *"Repite lo mismo dos veces… usá la final, que sea completa"* → quedó sólo la
   231.

Lo que había que ver en la primera vuelta: cuando una pasada termina abierta y
las siguientes **reformulan** la idea en vez de terminarla, la que va es la
reformulación final, **sola**. Sumar las dos arma una frase que dice lo mismo
dos veces. Antes de "completar", leé la tanda entera hasta la última pasada.
