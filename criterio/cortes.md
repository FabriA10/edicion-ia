# Criterio de cortes

"Cortes de generación Z": sin silencios ni respiraciones entre frame y frame.
Lo explicó Isaias y ya está aplicado:

- **No existen los silencios.** Entre frame y frame no va aire, ni respiración, ni
  espacio "para que el público respire". Un frame nuevo tiene que **arrancar con voz
  ya sonando**, no un instante antes.
- **La salida se corta un poco antes de que termine de caer la última palabra**, no
  después del decaimiento completo. Excepción: si alarga la última sílaba
  ("salidaaas"), esa palabra se deja entera y se compensa entrando más rápido en el
  frame siguiente. *(Ojo: este punto está en discusión, ver abajo.)*
- **Entre varias pasadas de la misma frase, va siempre la última.** Que la primera
  esté completa y bien dicha no alcanza: muchas veces Isaias se arrepiente ahí mismo,
  mira a un costado y la vuelve a decir. Textual: *"si ves que digo dos veces la misma
  oración, buscá que sea la última opción siempre"*. Vale también cuando reformula
  en vez de repetir literal.
- **Cómo se reconoce cuál es la última pasada**, en sus palabras: *"sabés que lo
  que estoy por decir a continuación no tiene nada que ver con la última frase que
  estaba repitiendo constantemente"*. O sea: el final de una tanda no se busca
  contando repeticiones, se busca en el cambio de tema. Lo que lo resuelve de una
  es partir el crudo en pasadas separadas por silencio real y transcribir **cada
  una aislada** (`scripts/pasadas.mjs` + `scripts/menu.py` de la skill): ahí la
  tanda se ve entera y el cambio de tema salta solo.
- **Pero la última tiene que estar completa y bien dicha.** En el video 6 dos veces
  la última pasada era peor que la anterior: una dijo "no lo descartes ESTE
  contenido" en vez de "en el contenido", y la del cierre arrancó con un "si querés
  aprender más, si querés…" pegado. En esos casos va la anterior, y se avisa.
- **La toma entera le gana al empalme.** Antes de armar un bloque con pedazos de
  varias pasadas, buscar la pasada donde la frase sale completa y corrida. Textual:
  *"tenés que poner el mejor fragmento donde sale todo completo"*. Y si la oración
  no cierra, estirar el corte hasta que cierre en vez de dejarla colgada.
- **El corte necesita silencio antes, no un bajón de nivel.** Entrar adentro de una
  corrida de voz deja la cola de la palabra anterior: se escucha "dem, la sexta es"
  o "dial que responde". Isaias marca esos restos uno por uno.
- **Si repite una palabra adentro de una misma pasada, va la última. Siempre.**
  El caso típico: arranca "ahora, le vas a ir…", se interrumpe y vuelve a empezar
  "ahora, vas a ir a…". El detector de pasadas ve una sola toma corrida, así que
  hay que bajar el umbral y buscar el valle chico (80-200 ms, piso −45/−55 dB) que
  queda entre el amago y la repetición, y poner el IN ahí. Textual: *"el que amago
  ahora, dejá siempre el último ahora"*, y *"esa solución hacela siempre"*.
- **No alcanza con buscar el mínimo de volumen.** Hay que detectar la voz de verdad
  (envolvente de energía, umbral absoluto contra el piso de ruido del cuarto) para
  saber exactamente en qué milisegundo arranca la palabra.
- **Si en el crudo se traga una palabra** (dura poco y está varios dB por debajo del
  resto), no forzar el corte para incluirla: se saca también del subtítulo.

**Por qué:** los cortes con 50-150 ms de aire adelante los marcó uno por uno como
"queda espacio antes de que empiece la oración". Es lo que separa un corte que se
siente profesional de uno que arrastra.

**Cómo aplicarlo:** medir con envolvente RMS en ventanas de 10 ms, poner el IN en el
primer cruce sostenido del umbral de voz y el OUT sobre la última ventana con voz.
`silencedetect` solo no alcanza. Las herramientas y el detalle están en la skill
`edicion-video` (`references/cortes.md`). Ver también
[proyecto-remotion.md](proyecto-remotion.md) y [subtitulos.md](subtitulos.md).

## Ojo: el punto de salida está en discusión

Hoy hay tres versiones de dónde va el OUT, y no dicen lo mismo:

1. **Esta nota:** un poco antes de que termine de caer la última palabra.
2. **La skill `edicion-video`:** donde la frase terminó de caer (umbral de cola,
   voz − 22,5 dB) **más 0,25 s de respiro**. El último bloque, medio segundo.
3. **La corrección más nueva**, sobre el video 1 de la clienta (23/09): con 0,25 s
   Isaias dijo *"excelente todo, ahora mejorá los cortes, excepto el CTA"*. La v2
   salió a **60 ms de la cola** (70-130 ms de silencio real por unión). Ver
   [clienta-dos-camaras.md](clienta-dos-camaras.md).

Hasta que Isaias lo cierre, la señal más reciente pide **salidas apretadas, del
orden de 60 ms después de la cola**. Usá esa y avisá en la entrega qué usaste.
Cuando se decida, corregí la skill y esta nota para que queden iguales.

---
*De la memoria de Claude en la PC de Isaias · última versión: 23/09/2026*
