# Movimiento: la curva, los zooms y los motion graphics

## La curva

Todo lo que se mueve en estos videos usa la misma curva, y **no es la suavización de
manual**. La de manual reparte la aceleración por igual entre la entrada y la salida:
arranca despacio, se acelera en el medio, frena al final. Queda con aire de plantilla.

Lo que se usa acá es otra cosa: el movimiento **sale disparado desde el primer cuadro
y a partir de ahí se va frenando cada vez más**, hasta posarse casi sin tocar el
final. Es lo que le da el efecto limpio — el ojo ve que algo *llegó*, no que se
estuvo moviendo.

Isaias la arma a mano en el editor de curvas de Fusion así:

1. El tirador del primer punto se tira **hacia abajo hasta casi 90°**, pegado a la
   vertical. Ahí es donde la curva se vuelve un desplome.
2. El tirador del segundo punto **no se baja**: se **estira apenas en horizontal**.
   Eso es lo que hace que la llegada se alargue en vez de cortarse.

En Remotion es `Easing.bezier(0.16, 1, 0.3, 1)`, que vive en `src/base/curvas.ts`
como `SALIDA_SUAVE`. A un cuarto del tiempo ya recorrió el 85 % del camino, que es el
mismo perfil que la curva dibujada a mano.

La misma curva va en los zooms y en los motion graphics. Es la firma de movimiento de
la marca.

## Zooms

- **Cuatro que entran y cuatro que salen** por video, repartidos.
- **Sólo cuando Isaias lo pide.** No es algo que se agregue por defecto.
- Un zoom que *sale* arranca punchado (1,2 a 1,35) y se posa en 1. Uno que *entra*
  arranca en 1 y cierra en 1,08 a 1,10.
- **En el celular, 1,08 no se nota.** En el video 4c los zooms estaban (medidos
  en la entrega: 1,22 al arrancar el que sale, 1,08 en los que entran) y aun
  así pidió "acordate de crear los zoom in y zoom out… de vez en cuando, no
  todos los cortes, sólo algunos". Quedaron en **1,30 → 1** los que salen y
  **1 → 1,12** los que entran, siempre arrancando o soltándose en un corte. Si
  los pide de nuevo, no los agregues de a muchos: hacelos visibles.
- Duración fija de 45 cuadros. Con la curva, el movimiento se percibe terminado cerca
  del medio y lo que queda es el asentamiento.
- **Nunca por debajo de 1**: ahí se vería el fondo.
- El zoom se aplica a **todos los tramos de video juntos**, no a cada `Sequence`. Si
  se reiniciara en cada corte, un empalme que estaba pensado para ser invisible
  pasaría a tener un salto de escala justo ahí. Por eso los zooms se definen por
  tiempo de edición y una entrada puede abarcar varios bloques.
- Los subtítulos quedan **fuera** del zoom: no se mueven ni se agrandan.

## Motion graphics

- **Dos por video como máximo. Siempre dos, nunca más.**
- **Sólo cuando Isaias lo pide.** Cuando lo pide, el trabajo es decidir *dónde* y
  *qué*: buscar el punto de la explicación donde un gráfico encaja de verdad, no
  meterlo donde toque.
- Tapan el plano entero por el tramo que duran, con el audio corriendo por abajo.
- **Los subtítulos se apagan** durante el gráfico: la pieza ya trae su propio texto.

### El lenguaje visual

Las piezas de referencia (`embudo`, `chat-consultas`) comparten:

- Fondo verde de marca con degradado que abre hacia el centro.
- Arcos y anillos finos en Claro, muy tenues, algunos saliéndose del cuadro.
- Tarjetas redondeadas con borde claro y relleno translúcido: el ícono de persona es
  el elemento que más se repite.
- Globos de chat estilo WhatsApp: fondo Claro, esquina con pico, hora chiquita abajo
  a la derecha.
- Animaciones **medianamente simples**: cosas que entran de a una, escalonadas. Nada
  de coreografías.

La consigna de Isaias es que sean *como esas pero mejores, con más fluidez* — y ahora
que existe `SALIDA_SUAVE`, la fluidez sale de ahí.

**Actualización del 2026-09-23: este lenguaje ya no le gusta.** Mandó los dos
últimos motion graphics hechos así (íconos tipo app sobre verde, sin texto) y dijo
*"a mí a día de hoy no me gusta nada"*. Lo que pide ahora:

- texto grande dentro de la animación, en color neón con los colores de la marca;
- íconos inventados;
- un fondo con profundidad;
- el texto animado con las curvas de los subtítulos animados (skill
  `subtitulos-animados`).

La primera pieza con ese estilo está en `02-motion-graphic-neon/` (neón sobre
fondo oscuro, grano, cuatro escenas) y **la aprobó**: *"toppe de gamma, esto es a lo que
me refería"*.

**Y la regla que vino con la aprobación: un solo mundo con cámara que viaja.** Las
escenas no se cortan ni desaparecen: todas viven en el mismo fondo y la cámara se
desliza de una a otra, en un recorrido que no es solo hacia abajo (abajo, diagonal
abajo-izquierda, abajo…). Lo que viene ya estaba ahí, apagado, y se prende cuando
llega la cámara; lo que queda atrás sale de cuadro. Él lo llama "3D, no 3D literal".
Lo que lo vende:

- paneos de 18 a 20 cuadros que arrancan lento, cruzan rápido y se asientan largo;
- un leve alejamiento en el medio del viaje;
- desenfoque según la velocidad;
- fondo en capas con paralaje;
- un hilo de neón que sale del subrayado de cada palabra y lleva a la escena
  siguiente.

Está armado en `02-motion-graphic-neon/src/mg2/Mundo.tsx`. **Tomate el tiempo:**
*"si no, vas a hacer todo muy rápido y no se va a entender nada"*. Si no hay audio
para cronometrar, Isaias habla a unas 7,3 sílabas por segundo.

### Sincronizarlo con su voz

Cuando manda el audio del tramo, la pieza dura exactamente eso y cada palabra
entra cuando la dice. En la primera pidió *"el principio los textos los tenés que
animar un poco más rápido"*: el escalonado fijo iba más lento que él.

- **Los ataques salen de la envolvente, no de Whisper.** En esa frase Whisper se
  adelantaba hasta 300 ms. Anclas: la explosión de las oclusivas (p, t, k), la
  subida de la ese en agudos, el fin de una pausa. Las palabras que empiezan con
  vocal o sonora se interpolan entre anclas.
- **Leé la palabra en el audio, no en el guion.** Escribió "contestas" y dijo
  "contestés": la última vocal medía F1 420 Hz, una e. En pantalla va lo que dice.
- **Cuándo arranca cada entrada:**
  - la palabra chica (Delayed Up slide) arranca 3 cuadros antes de sonar, porque
    asoma recién al tercer cuadro;
  - la grande (Smooth Line Up) arranca uno antes.
- **La voz no deja huecos para la cámara.** El viaje arranca durante la última
  palabra grande, y los primeros cuadros casi no se mueve. Cruza con las palabras
  chicas de la escena siguiente, y la grande entra cuando ya hizo el 80 %. El
  viaje más largo posible sale de esa regla: en esa frase dio 21 cuadros, con los
  dos viajes pegados.
- **Sin apuro.** Con cuatro escenas en 4,1 s y viajes de 14 cuadros la sintió
  apurada, y sacó la última escena: *"dale su tiempo, no te apures"*. Lo que no
  ata la voz se estira: viajes largos, un remate lento en la última escena,
  menos cambios en los íconos.
- **El subrayado espera 10 cuadros después de la palabra grande.** Antes, la
  letra todavía está subiendo y el trazo la tacha.

### Más texto, menos cambios de pantalla

Para el motion graphic siguiente lo dijo explícito: *"aprovechá los textos para
no tener que hacer tantas transiciones en tan poco tiempo… pueden estar animados
los textos, los íconos, pero no el cambio de pantalla constantemente y bien
rápido, porque no llegás a deleitar la animación"*.

En una frase de unos 5 s va un viaje de cámara, dos como mucho. Cada lugar se
llena de a poco con:

- las líneas de la frase;
- textos que la ilustran: globos con mensajes reales de pacientes, chips con
  los tratamientos;
- íconos que cambian de estado: un contador que sube y baja, tildes, personas que
  se prenden.

Está armado así en `02-motion-graphic-neon/src/mg3/Mensajes.tsx`.

**Pero lo que ilustra va de fondo.** En la primera versión los globos de mensajes
se leían tan fuerte como la frase, y lo marcó: *"el centro son los subtítulos, la
raya que se desliza hacia abajo; el trasfondo son los mensajes"*. Tienen que
quedar así:

- transparentes, entre 0,34 y 0,5 de opacidad;
- con 1 a 2 px de desenfoque;
- más chicos que el texto, y detrás de las palabras;
- lejos del subrayado y del hilo;
- con una entrada mínima.

Tienen que alcanzar a leerse, pero nunca competir con la frase.
- **El audio del render de Remotion sale 42,7 ms tarde.** La versión con voz se
  arma con ffmpeg: video por copia + el audio original recodificado a AAC.
  Verificalo correlacionando contra el original: tiene que dar 0 muestras.
