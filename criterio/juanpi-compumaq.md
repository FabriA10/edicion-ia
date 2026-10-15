# Videos de Juanpi para Compumaq: lo que pidió corregir

Videos 6 y 7 de Compumaq (02 y 03/10/2026). Juanpi es el editor y estos son sus
pedidos: mandan sobre las reglas de Isaias donde choquen.

- **Estilo dopamínico pero estético y serio.** Referencias: reels de Instagram con
  subtítulos de 1 a 3 palabras, punch-in en cada corte, títulos grandes de dos tonos,
  barridos con desenfoque, contadores, mosaico de video. Azul medio oscuro de la marca
  (el de la pared del set).
- **Una repetición en voz es un corte mal elegido.** *"en el segundo 21 me pusiste un
  clip que repite la frase, siempre buscá la frase en la que queda correctamente lo que
  quiere decir"*. Era "es una bomba, es una máquina impresionante": se entró en la
  segunda "es una". El barrido de repeticiones de la skill tiene que correr sobre el
  render y también hay que leer cada bloque buscando repeticiones retóricas.
- **Ninguna frase mal dicha, nunca.** Video 7, 04/10/2026: marcó 7 cortes con trabas
  ("comotadra", "es decir" pegado, "esto… es…", repeticiones, titubeos). Textual:
  *"siempre que cortes los clips, fijate de que sea el clip que no repita o diga la
  frase bien, o hacé bien los recortes para que la frase no quede mal"*. Cómo se
  encuentran: transcribir **cada bloque elegido con `small` y sin condicionar**
  (medium "limpia" las trabas y las esconde) y mirar huecos de más de 0,4 s entre
  palabras. Para arreglarlas, primero buscar otra toma; si no hay, entrar en el valle
  que saltea la traba (`proyectos/13-compumaq-video7/trabajo/v01/buscar.py`), o
  empalmar dos tomas verificando el empalme con los dos modelos.
- **Voz para los títulos de cada apartado** (video 8, 05/10/2026): *"al comienzo de
  cada apartado, podés usar una voz que no sea tan robótica para decir el título"*.
  Juanpi eligió `edge-tts` con `es-AR-TomasNeural` (+8 %), normalizada a −14,5 LUFS.
  Va sobre el silencio de él quieto antes del veredicto (bloque con `pre`), y el
  subtítulo anterior se corta ahí.
- **Flechas a mano: de costado y hacia un símbolo** (caja, chanchito de ahorro), no
  apuntándole a él. *"si no encontrás nada no pongas nada"*.
- **Frases que se oyen mal, afuera** aunque el texto esté bien ("lo que se rompe
  después casi nunca se rompe": la sacó).
- **Las salidas no se aprietan tanto** (video 8, 05/10/2026): *"necesito que veas
  cuando termina de hablar en cada frase… ahí está bien dicho pero lo cortás muy
  antes"*. Después de la cola medida van +0,18 s, frenando 90 ms antes de que vuelva
  la voz. Para Juanpi esto reemplaza los "60 ms después de la cola" de `cortes.md`.
- **Gráficas arriba de la cabeza: que no la pisen.** *"están muy encima, subilas un
  poquito pero sin llegar a los bordes rojos de Instagram"*: gráficas desde y≈255, y
  en los bloques con gráfica un encuadre que baja la cabeza a y≈700.
- **Sin el mosaico de video** (*"la animación que se multiplica el chico sacala"*):
  entre el gancho y el primer tema, un barrido común.
- **Si la frase está bien dicha, va entera** (video 8, 05/10/2026): *"dejalo completo
  si no está mal, pero si está mal o una parte se repite, ahí recortalo"*. Antes de
  cortar una frase a la mitad, escuchá cómo sigue: "ya subieron de precio" seguía con
  "o son viejos, cuando podrías ahorrar un poco más para comprarte algo mejor".
- **Un falso arranque pegado sin silencio también es frase mal dicha** (video 9,
  05/10/2026): *"dice 'y un Ryzen' y después 'de procesador', cortalo en la parte que
  diga 'de procesador'… no te olvides de lo que te digo que corrijas"*. La voz venía
  corrida ("de procesador, de procesador un Ryzen, de procesador vamos…") y el valle
  elegido dejaba "un Ryzen" delante. Escuchá con small los 0,6 s antes de cada
  entrada a mano, no sólo la frase.
- **Subtítulos a destiempo cuando una palabra dura mucho** (video 9): *"en el clip de
  la motherboard los subtítulos van a destiempo"*. "B650" dura 1,5 s y disparaba el
  reparto por sílabas de todo el bloque. En esos bloques, arranques de palabra
  medidos a mano (`palabras_a_mano.py` del proyecto 15, `fijar`).
- **Cierre: sólo el "seguinos"** (video 9): *"sacá el clip del minuto 1:30 y dejá el
  que dice que nos sigan nomás"* (iba "si necesitás que te ayudemos… escribinos").
- **Una palabra estirada también es titubeo** (video 9, 06/10/2026): *"en el segundo
  0:28 titubeé y lo pusiste igual al clip, recortalo bien"*. Era el último "una
  cincuenta… sesenta" con 0,2 s de silencio en el medio: los modelos lo transcriben
  bien y no avisan. Buscá en la envolvente los huecos de más de 0,15 s **dentro** de
  una palabra o un número, no sólo entre palabras.
- **El arranque de cada toma también se escucha solo** (video 9, v04): *"el clip dice
  'no es… no es la más cara', el primer 'no es' recortalo"*. Era un falso arranque de
  0,25 s pegado (10 ms de valle) al arranque bueno; transcribiendo la frase entera,
  los dos modelos lo tragan. Transcribí aparte los primeros 0,4 s de cada bloque: si
  dicen algo distinto a la primera palabra de la frase, hay un falso arranque.
- **Etiquetas de quién habla, sólo la primera vez y abajo** (video 10, 06/10/2026,
  pedido del cliente que pasó Juanpi): *"que quite el vos y tu pc en la segunda vez"* y
  *"que lo ponga más abajo"*. Una vez presentado cada personaje, no se repite; la
  etiqueta va debajo del subtítulo (y≈1448, sin pasar 1500).
- **Tanda 3: innovar con las referencias** (06/10/2026): *"con todo lo que cargué,
  quiero que innoves a base de todo lo que te pasé, motion graphics, animaciones,
  sonidos, todo"*. Primera pieza: `proyectos/19-compumaq-t3v1` (base aprobada + piezas
  de devinjatho, lewisdang y formato partido; ver la skill, "Tanda 3"). En el crudo, el
  que habla marca las tomas en voz alta ("esa toma es buena", "falta el XT", "si queda
  mal el CTA no lo agregues"): sirven de pista, pero cada toma se verifica igual.
- **Subtítulos: se controlan siempre contra el render** (tanda 3, v03, 06/10/2026):
  *"en el 0:01 los subtítulos van a destiempo de nuevo, buscá una forma de siempre
  revisar o corroborar que los subtítulos están correctos"*. Antes de entregar,
  `scripts/verificar_subs.py` de `reel-dopamina-juanpi` tiene que dar 0 para revisar.
  La causa era el reparto por sílabas del generador: ya no se usa.
- **Las animaciones entran cuando empiezan, no antes** (tanda 3, video 3, v03, 09/10/2026):
  *"la animación en el segundo 5 sacala más tarde, porque recién en 4 segundos comenzás a
  hacer la animación; la siguiente del amplificador sacala más tarde"*. El lienzo blanco
  del formato partido estaba vacío 4 s: ahora el bloque se parte (valle en el habla
  continua) y el lienzo entra justo antes de lo que dibuja. Cada tarjeta entra en la
  palabra que la nombra ("amplificador"), no en la anterior ("comprar"). Y la aguja de un
  velocímetro tiene que girar sobre el mismo arco que se pinta (*"acomodá esa flecha"*).
- **Cortes más justos** (tanda 3, video 1, v07, 08/10/2026): *"en el video uno mejorá
  los cortes"*. Quedaban 0,3-0,4 s de aire al final de cada clip y pausas de 0,5-0,6 s
  dentro de bloques de varias pasadas. Ahora: salida 0,2 s después de la última voz
  medida (menos el cierre), los bloques se parten en las pausas de más de 0,4 s con
  un cambio de plano, y nunca dos planos iguales seguidos sin barrido.
- **Censura con "piii"** (tanda 3, video 3, 07/10/2026): en el crudo él pide *"censurá
  la parte de 'cagada'… hace un piiip, así como de censura"*. La voz se apaga en ese
  tramo (`censura` en `montaje.json`, `audio.py` del 21, con `asetnsamples` para que
  el corte caiga al milisegundo: si no, el "ca" se escapa 50 ms) y suena
  `Censor Beep.mp4`; el subtítulo dice 🤬 y entra un sello "PIIIP".
- **Titulares dentro de la línea roja** (tanda 3, video 1, v06, 06/10/2026): *"en el
  minuto 1 el 'te quedás corto' hacelo más chico porque queda muy al borde y tenés que
  respetar la línea roja de Instagram"*. "QUEDÁS CORTO" a 112 px se salía del cuadro.
  `TituloBrillo` ahora calcula el cuerpo de cada línea para que entre en los 840 px del
  medio (120 de margen por lado). Antes de entregar, mirá cada titular con las líneas
  de 120 px dibujadas.
- **Subtítulos: animación en todos** (tanda 3, video 2, 06/10/2026): *"agregale
  animaciones a los subtítulos, antes le agregaste a poquitos, ahora agregale a todos"*.
  Cada subtítulo entra entero (el de dentro.dental) y trae una palabra clave animada;
  si el guion no marca ninguna, va la más larga. El efecto rota de a uno: caja azul que
  se despliega, palabra dorada que salta con brillo, subrayado dorado que se dibuja.
  Componente: `proyectos/20-compumaq-t3v2/src/t3v2/SubtitulosTodos.tsx`.
- **Subtítulos que entran enteros** (tanda 3, v05, 06/10/2026): pasó una grabación de
  un reel de dentro.dental, *"¿podés copiar este efecto de animación de los subtítulos
  para agregarle?"*. Medido a 60 fps: la frase entra entera (sin escalonar), al 40 % y
  12 px más abajo, al 80 % en el cuadro siguiente y posada a los ~130 ms; la anterior
  se va en seco. Componente: `proyectos/19-compumaq-t3v1/src/t3v1/SubtitulosLinea.tsx`
  (misma fuente, contorno y caja de la clave que el `Subtitulos06`, sin despliegue).
- **Zooms con un cuadro trabado** (tanda 3, v04, 06/10/2026): *"fijate los zooms,
  arreglalos, que alguno está bugeado"*. El zoom se buscaba por segundos y, por
  redondeo, el primer cuadro de un clip tomaba el zoom final del anterior (un salto a
  1,12 en los punch-in). Ahora se busca por cuadro; quedó corregido en todos los
  `Compumaq*.tsx` de `proyectos/`.
- **Correcciones de la tanda 3, video 1** (v02, 06/10/2026):
  - *"minuto 1:01 los subtítulos a destiempo"*: medium estiró "14400F" 1,5 s y el reparto
    por sílabas pisó los tiempos medidos a mano de todo el bloque (hasta 2 s corridos).
    Después de `generar.py`, buscá los bloques donde alguna palabra pasa los 0,8 s: si
    tienen números o modelos, medí los arranques a mano (`fijar`).
  - *"en el 0:42 cortaste muy rápido el clip después de cuando dice 'cualquier otro
    juego', dejalo que termine la frase"*: el `fin` a mano estaba en el **arranque** de
    "juego" (tiempo de medium). Un `fin` a mano se mide en la envolvente: dónde termina
    la última palabra, no dónde empieza.
  - *"el streamear no entra en el cuadro, y el trabajar se sale también, hacelo más
    grande a los cuadros"*: tarjetas de usos de 400 × 160 con el texto en 38 px sin
    partir. En la hoja de cuadros, mirá que la palabra más larga entre con margen. Lo
    mismo pasaba en el carrusel ("CUALQUIER", "COUNTER"): el tamaño del título sale
    de su palabra más larga.
  - *"el clip final… cortalo un poquito antes, porque al final se escucha una
    respiración"*: la cola larga del cierre llegaba a la inhalación de la toma
    siguiente (subida de energía arriba de 2,5 kHz, sin voz). El último bloque termina
    antes de cualquier inhalación.
- **Si la frase "queda en agudo", no terminó** (video 12, v03): *"queda en agudo, está
  mal recortado, dejá que termine de decir"*. Cortado en "…estas 4 preguntas" la
  entonación sube porque sigue "…con multiple choice" (en la pasada siguiente, a 0,2 s).
  Antes de cerrar un bloque, escuchá qué viene en la pasada que sigue: si la
  continúa, va adentro.
- **No cortar la última palabra** (video 12, 06/10/2026): *"dice 'y si querés saber el
  porqu…' y lo cortás, dejalo que termine de decir la palabra y de ahí pasá a la otra
  toma"*. Corté un tramo de 0,2 s creyendo que era un "en" repetido (sólo small lo
  oía) y era el "qué". Antes de sacar un pedazo del medio, transcribilo solo con los
  dos modelos y fijate qué palabra de la frase le falta al corte.
- **Tropiezos antes de la primera palabra** (video 12): *"en el 0:11 se escucha como
  tartamudea antes del 'si te compraste'"*. 0,2 s de ruido de boca pegado al "si": los
  modelos lo transcriben como "¡Adiós!" o "¡Hasta la próxima!" en la ventana corta de
  `arranques.py`. Cualquier texto que no sea la primera palabra es un tropiezo.
- **Toses y carraspeos afuera** (video 11, 06/10/2026): *"en el minuto 1:22 se escucha
  como una tos, recortalo"*. Era un "ahem" de 0,4 s pegado al arranque de la frase:
  small lo transcribe "Ahem." si se escucha el tramo solo. Antes de entregar, escuchá
  con small los 0,5 s del arranque de cada bloque por separado.
- **Voz un poco más baja** (video 11): *"bajale un poco el volumen de la voz"*. Con un
  micrófono caliente, −2 dB a la voz con música y efectos iguales: el total quedó en
  −16,5 LUFS. Para Juanpi, si lo pide, manda sobre los −14,5 de la regla.
- **Cierre más corto** (video 11): *"el clip final recortalo un poquito más al final
  de todo"*: la cola del último bloque, ~0,3 s después de la última palabra.
- **Sacar los refranes que no suman.** *"sacame el refrán que dice que me basta y me
  sobra como diría mi viejo"*.
- **Subtítulos con slide up.** *"ponele un efecto estilo slide up pero que no sea feo,
  sino estético y viral"*: cada palabra sube sola, escalonada 2 cuadros, con
  desenfoque que se aclara (curva Delayed Up slide); la caja de la palabra clave se
  despliega de izquierda a derecha. Contradice "subtítulos quietos" de Isaias: para
  Juanpi, van animados. Código: `proyectos/12-compumaq-video6/src/v06/Subtitulos06.tsx`.
- **Sonidos.** *"no tan saturados"* (efectos ~5 dB más bajos que en la v01). El whoosh
  del cambio de plano *"no me gusta"*: va un click corto. Para los textos, sonidos
  *"muy virales"*: pop corto en las palabras clave, ding (`Correct Sound`) en sellos
  verdes, `Negative Error` en sellos rojos, `whoosh hit` en tarjetas.
- **Usar la placa de video** (GTX 1660 Ti) para convertir: `h264_nvenc` anda en esa PC.
