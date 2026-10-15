---
name: edicion-video
description: Editar crudos de cámara en videos verticales terminados (Reels, TikTok, Shorts) usando Remotion — selección de tomas, cortes sin aire, subtítulos, corrección de color, fotos y gráficas, zona segura, audio y música. Usala SIEMPRE que aparezca un crudo de cámara (.MOV, .MP4), un pedido de "editá este video", "hacé los cortes", "ponele subtítulos", "sacá las partes donde me trabo", "corregí el color", o cuando haya que retocar o re-renderizar una pieza que ya existe en la carpeta proyectos/. También cuando se hable de zona segura, safe zone, o de dónde poner imágenes en un vertical. NO es para carruseles de Instagram. Para motion graphics sueltos usá motion-graphics; para micrófono, nivel y música, audio-y-microfono; para el catálogo de sonidos, sonidos-y-efectos.
---

# Editar videos verticales

Esta skill cubre el camino completo de un crudo de cámara a una pieza vertical
terminada: 1080×1920, subtitulada, corregida de color y lista para subir.

Los proyectos viven en `proyectos/` (una carpeta por video entregado, todas con la
misma base de Remotion; el mapa está en `proyectos/LEEME.md`). Para un video nuevo
se copia el que más se parezca y se edita ahí. Todo se hace en Remotion. DaVinci
quedó descartado.

La paleta de color no es la de ningún cliente: sale de `src/base/marca.ts` de cada
proyecto, que se cambia por la de la marca del video (`marca/LEEME.md`).

## Lo primero que tenés que entender del material

**Los crudos de Isaias son tomas repetidas del mismo guion.** No es una toma
corrida con muletillas para recortar: graba cada frase cinco, diez, quince veces
hasta que sale, sin cortar la cámara. Un crudo de 11 minutos suele tener 45
segundos de contenido real.

Eso cambia el trabajo por completo. No estás limpiando una toma: estás
**seleccionando la mejor pasada de cada bloque del guion** y armando la pieza con
ellas. A veces la mejor versión de una frase no existe entera en ninguna pasada, y
hay que empalmar el arranque de una con el final de otra — si las dos piezas son
de la misma toma, el salto visual es casi imperceptible.

Antes de cortar nada, transcribí el crudo entero y leé la transcripción como un
guion. Vas a ver la estructura enseguida: los bloques se repiten en tandas.

## El flujo

1. **Convertir el crudo.** Los MOV de iPhone vienen en HEVC 4K con metadata de
   rotación. Pasalos a H.264 1080×1920 a `public/`. En la PC de Isaias NVENC falla: usá
   `libx264 -preset veryfast -crf 21` (en la tuya probá NVENC y, si falla, libx264).

2. **Transcribir** con Whisper (`small`, `--word_timestamps True`). Tarda unos 40
   minutos para 11 minutos de audio, así que lanzalo en segundo plano y seguí con
   otra cosa mientras.

3. **Armar el menú de pasadas y elegir sobre él.** Antes de anotar nada:

   ```bash
   node scripts/pasadas.mjs trabajo/vNN/mic16.wav
   python scripts/menu.py trabajo/vNN/mic16.wav
   ```

   El primero parte el crudo en pasadas delimitadas por silencio real; el segundo
   transcribe cada una aislada. Cada línea que sale de ahí **ya es un corte
   válido**, porque arranca y termina en silencio por construcción, y la tanda de
   repeticiones se ve entera, así que la última pasada de cada una salta sola.

   **Primero buscá las marcas habladas.** Desde el video 8 Isaias dice en voz
   alta cuál toma le sirvió —"esta es la buena", "esta sirve", "usá ésta"—
   después de la que quiere. Son pasadas cortas y sueltas del menú: filtralas y
   ya tenés elegida la toma de cada bloque, sin inferir nada. Ver "Mejor que
   adivinar: que él marque la toma en voz alta" en `references/cortes.md`.

   Donde no haya marca, anotá para cada bloque del guion cuál elegís y por qué.
   Ojo con la trampa más común: la primera pasada completa casi nunca es la
   buena — ver "Cuál pasada elegir" en `references/cortes.md`.

4. **Medir los bordes de verdad** con `scripts/envolvente.mjs`. Este paso es el que
   separa un corte que se siente profesional de uno que arrastra — ver
   `references/cortes.md`, que es la parte más importante de esta skill.

5. **Generar cortes y subtítulos** con un script como el de
   `references/generador.md`.

6. **Revisar los bordes antes de renderizar.** Este paso es nuevo y es el que más
   correcciones evita:

   ```bash
   node scripts/revisar-bloques.mjs trabajo/vNN/mic16.wav src/cortes-NN.ts
   ```

   Corre en segundos contra el audio y avisa de las cuatro cosas que el oído no
   pesca leyendo una transcripción: entradas que arrastran la cola de la palabra
   anterior, entradas que le comen el ataque a la primera palabra, salidas que
   cortan adentro de una corrida de voz, y bloques que quedaron 5 dB o más por
   debajo del resto. **Si tira un aviso, no renderices.**

   Contra los bordes que se entregaron mal en el video 4 encontró los cinco
   defectos que marcó Isaias, más uno que se le había pasado a él.

   **Los umbrales se calibran solos** contra el modo de nivel de la voz del
   archivo que le pasás: un crudo del micrófono de estudio (compuerta de OBS,
   silencio digital entre frases) y uno del micrófono del celular (piso de sala
   en -55 dB) necesitan números distintos, y copiar los del primero al segundo
   lo deja ciego o lo llena de falsos avisos.

   Y leé la **transcripción de cada bloque por separado**, como oración suelta. En
   el video 4 tres de los defectos estaban escritos ahí —"le cargás un infono",
   "Muy bueno" donde el "muy" venía de otro bloque— y se descartaron como errores
   del modelo cuando eran correctos. Si la transcripción contradice la toma que
   elegiste, la transcripción suele tener razón: verificala, no la expliques.

7. **Armar la composición** en Remotion y renderizar. Ojo con el tiempo: antes de
   dibujar el primer cuadro, Remotion **copia entero el `public/`** al bundle. Con
   cuatro crudos guardados ahí son 2,7 GB y cinco minutos de reloj en los que no
   pasa nada — no es que se colgó. Si molesta, sacá de `public/` los crudos de los
   videos ya entregados antes de renderizar. El `-crf 21 -preset
   veryfast` del paso 1 es para convertir el crudo, **no para el render final**:
   ahí se renderiza con los valores por defecto de Remotion (CRF 18). Pasarle 21 al
   render baja el bitrate de 6,9 a 3,9 Mbps sin que nadie lo pida. Si estás
   re-renderizando una corrección, compará el bitrate contra el render aprobado
   antes de entregarlo: tiene que dar igual.

8. **Verificar el render** antes de mostrarlo. Ver "Verificación" más abajo.

## Las reglas que ya están decididas

Estas no se discuten en cada video — ya se corrigieron una por una y quedaron
fijas. Cambiarlas sin que te lo pidan es retroceder.

### Cortes

El criterio completo está en `references/cortes.md`. El resumen:

- **No existen los silencios ENTRE frases.** Entre frame y frame no va aire, ni
  respiración, ni espacio "para que el público respire". Un frame nuevo arranca
  **con voz ya sonando**.
- **Pero la pausa de adentro de una frase es suya y se respeta.** Él dice el
  guion frase por frase, y adentro de una frase larga hace pausas para
  acomodarse: "miles de dólares … en publicidad" es UNA frase aunque tenga
  360 ms de silencio en el medio, y cortar ahí queda antinatural. Entonces un
  bloque no es una pasada del menú, es **una corrida continua de la misma
  toma**. Ver "La pausa de adentro de una frase" en `references/cortes.md`: es
  lo que llevó el video 7 de 34 bloques a 9.
- La salida no va donde deja de haber voz: va donde **la frase terminó de caer**
  —umbral de cola, voz − 22,5 dB— más un respiro de 0,25 s. **El último bloque**
  lleva medio segundo para rematar.
- **Si una palabra se escucha repetida** —"hoy, hoy en día"— el corte está mal.
  Buscá otra pasada donde la frase salga de corrido.
- **Cuidado con el titubeo del arranque**: ese "ssss" o "eeeh" largo antes de la
  frase es habla para el detector, pero no es la palabra. El corte va en el ataque
  de la palabra de verdad.
- **El corte necesita silencio antes, no un bajón de nivel.** Entrar adentro de una
  corrida de voz deja la cola de la palabra anterior pegada: "dem, la sexta es",
  "dial que responde". Si la frase que querés no tiene silencio delante, agarrá
  desde una frase antes o buscá otra pasada.
- **Antes de empalmar, buscá la pasada entera.** El empalme es la última opción. Y
  si la oración no cierra, estirá el bloque hasta que cierre en vez de dejarla
  colgada.
- **Si el bloque termina en agudo, la frase quedó abierta** y hay que cambiar de
  toma. Se mide con `scripts/entonacion.mjs`: si cierra por encima de 140 Hz,
  buscá otra pasada; su línea base son 105-115 Hz.
- **No alcanza con buscar el mínimo de volumen.** Hay que detectar voz de verdad.
- **El OUT no sale nunca del tiempo de Whisper.** Whisper ubica palabras para
  escribir texto; los bordes se miden con la envolvente. Las dos palabras cortadas
  del video 2 —"boca" y "pacientes"— salieron de confiar en Whisper: en una se
  perdió una sílaba entera detrás del silencio de una /k/, en la otra la /s/ final,
  que estaba 150 ms más tarde y 40 dB más abajo.

### Subtítulos

Detalle en `references/subtitulos.md`. El resumen:

- Tipografía **Hando Bold** (`HandoTrial-Bold.otf`). Archivo es para los carruseles.
- **Una sola línea**, nunca dos. Si no entra, se achica el cuerpo.
- **Máximo 4 palabras.**
- **Todo en minúscula**, incluida la primera letra.
- **Sin puntos.** Las comas pueden quedar.
- A la **altura del pecho** (73% del alto), no abajo de todo.
- Sombra y color claro ya están aprobados: no los toques.
- **Van estáticos**, sin animación de entrada. Solo se animan momentos
  especiales y solo cuando Isaias lo pide, con toda la letra en color de la marca:
  ver "Subtítulos animados" en `references/subtitulos.md`.

### Movimiento

La curva, los zooms y los motion graphics están en `references/movimiento.md`. Lo
que hay que saber de memoria: **la suavización no es la de manual** — el movimiento
sale disparado y se va frenando. Y los zooms y los motion graphics **sólo van cuando
Isaias los pide**; los motion graphics son dos por video, nunca más.

### Formato ranking

Cuando el guion enumera herramientas, marcas o pasos, la pieza puede llevar una
columna de casillas numeradas que se llenan con el logo de cada una. Está en
`references/ranking.md`: medidas, cómo se dispara la animación, de dónde salen los
logos y por qué el subtítulo se corre a la derecha y baja a tres palabras.

### Formato de clasificación (tres columnas)

Cuando el guion reparte cosas en categorías —esto sirve, esto no, esto te hace
quedar bien—, la pieza puede llevar tres columnas de color de alto completo y
una tarjeta por ítem que se va a posar en la que le toca. Está en
`references/columnas.md`.

La diferencia grande con el ranking es que acá la gráfica va **detrás** de él,
así que hay que recortar el fondo. Si el crudo se grabó contra la pared verde,
el recorte sale de medir el exceso de verde `G - max(R,B)` y no de ningún filtro
de croma de ffmpeg: la pared tiene casi un stop de diferencia de arriba a abajo
y los filtros que miden distancia a un color fallan en medio cuadro.

### Formato pantalla dividida

Cuando Isaias habla frente a la notebook y quiere mostrar la pantalla, el reel
sale partido: él arriba en **1080×1080** y la pantalla abajo. Está en
`references/pantalla-dividida.md`.

Lo que hay que saber antes de empezar: **son dos entregas, no una.** Primero va
el corte limpio —sin subtítulos, sin música, sin gráfica—, porque él lo escucha
mientras registra la pantalla en OBS y calcula el timing a mano. La división se
arma después, con ese registro ya hecho.

### Color

Ver `references/color.md`. La trampa: la cara viene con una luz cálida que ya
sobresatura la piel. El grade **baja el rojo en altas**, no lo sube. Y la
saturación y el matiz **se miden en cada crudo**: los del 6 (`saturate 0.78`,
`hueRotate -9`) sobre el 7 dejaban la cara lavada, porque ese crudo ya llegaba
con la saturación en su lugar.

### Zona segura

Ver `references/zona-segura.md`. Nada de contenido abajo de 1500 px ni arriba de
250 px, y 70 px de margen a los costados.

### Nivel de audio

Ver `references/audio.md`. **Todo sale a −14,5 LUFS con pico bajo −1 dBTP.** El
crudo viene con el nivel que quedó y cambia mucho según de dónde grabó el celular;
las redes bajan lo que viene fuerte pero **no suben lo que viene flojo**, así que un
video bajo se escucha bajo en el feed. Se arregla con ganancia y limitador en una
pista aparte, no con la prop `volume`, que sólo multiplica y revienta los picos.


**El ecualizador del micrófono chico va siempre.** Isaias lo ajustó en el Fairlight
de DaVinci y pidió que se aplique de entrada en todos los videos, sin preguntar:
+8,7 dB en 30 Hz, +4,9 en 171 Hz, −4,7 en 1,6 kHz y +11 en 5,6 kHz. La cadena de
ffmpeg equivalente **no son esos números copiados tal cual** —los estantes de ffmpeg
llegan a la mitad de la ganancia en la frecuencia marcada—: la cadena ya ajustada y
verificada con tonos está en `references/audio.md`. Va antes de la ganancia, y la
ganancia se recalcula después.
## El paquete de efectos (la plantilla aprobada)

Desde el video 4c el ritmo de efectos es regla: **cada ~3 segundos tiene que pasar
algo** (un zoom visible, un subtítulo animado con sonido, una fila de íconos, un
motion graphic, gráfica detrás de él). Ver `criterio/paquete-efectos-cada-3s.md` y
`references/movimiento.md`. Los sonidos de cada efecto salen de la skill
`sonidos-y-efectos`; la mezcla de voz y música, de `audio-y-microfono`.

## Gráfica detrás de él, íconos y pantallas 3D

Cuando marca momento por momento —"acá detrás mío con una máscara", "acá los
íconos", "acá la pantalla inclinada"— está todo en
`references/grafica-sobre-el-vivo.md`. Lo que no se puede olvidar: él recortado
va con el mismo grade y encima del video original, el despill sólo en el borde,
y cada `renderStill` deja 90 MB en `%TEMP%` que hay que borrar.

## Formato ChatGPT simulado

Cuando muestra un prompt "escrito en ChatGPT" y no grabó la pantalla, se simula:
la caja de ChatGPT arriba de su cabeza, el prompt palabra por palabra cuando lo
lee, y la respuesta con la imagen. Aprobado entero en el video 5; está en
`references/formato-chatgpt-simulado.md`.

## Cuando hay que meter imágenes o animaciones

Las fotos de casos (antes/después, capturas, gráficos) van **donde haya espacio
libre**, no en un lugar fijo. En un plano medio de busto, la franja entre el mentón
y la línea de subtítulos suele ser el mejor lugar. Si el encuadre deja aire arriba,
también sirve.

Dos cosas que aprendimos poniéndolas mal:

- **Nunca abajo de todo.** Ahí la interfaz de Instagram tapa todo.
- **Si la imagen ocupa la franja de los subtítulos, apagá los subtítulos** en ese
  tramo. Compiten por el mismo espacio y gana la imagen, porque es lo que la
  persona tiene que mirar.

Recortá las fotos **a la proporción exacta de la tarjeta** antes de meterlas, en
vez de dejar que `objectFit: cover` recorte por segunda vez — así controlás vos el
encuadre y no la CSS.

### Sobre las fotos de casos reales

Las fotos de antes y después (o de cualquier caso real: un cliente, un resultado)
las tiene que dar quien contrata el video. No busques ni bajes fotos de internet
para rellenar: en una pieza que dice "logramos pasar de esto a esto", una foto de
otra persona arma un caso que no existió, y en publicidad de salud o de resultados
eso es un problema real. Si no hay fotos, pedilas y dejá esa parte sin nada — el
componente ya está armado para no dibujar nada si falta el archivo.

## Verificación

Ojo: estas comprobaciones miran el **contenido** (que no falte texto, que el nivel
esté bien). Ninguna detecta un corte que arrastra media palabra, porque el texto
sale completo igual. Para eso está `scripts/revisar-bloques.mjs` del paso 6, que va
antes del render.

Nunca entregues un render sin estas tres comprobaciones. Las veces que algo se
escapó a producción fue por saltearlas.

**Transcribí el render de vuelta** (Whisper `base` alcanza) y leé el texto. Si una
palabra desapareció o una frase quedó rara, el corte se comió algo. Esto encontró
la "s" de "hicimos" y un "fue" que no estaba.

Y **pasale el barrido de repeticiones al texto**, no lo dejes a la lectura. En
el video 7 el render decía "Este consultorio, este consultorio consiguió…" en el
primer renglón de esa misma transcripción y pasó igual.

El barrido tiene que mirar **n-gramas de 1 a 7 palabras** y comparar por raíz,
sin la -s final ni los acentos. La primera versión sólo miraba repeticiones
exactas de una y de dos palabras, y en el video 4c se le escaparon las dos que
había:

| lo que decía | por qué se escapaba |
|---|---|
| "y además de **estos** / y además de **esto**" | difieren en una letra |
| "y con formato me refiero a que" ×2 | la repetición es de **siete** palabras |

```python
def raiz(w):
    w = unicodedata.normalize("NFD", w).encode("ascii", "ignore").decode()
    return w[:-1] if len(w) > 3 and w.endswith("s") else w

r = [raiz(w) for w in palabras]
for n in range(7, 0, -1):                       # de largo a corto, sin solapar
    for i in range(len(r) - 2 * n + 1):
        if r[i:i+n] == r[i+n:i+2*n]:
            print(n, " ".join(palabras[i-3:i+2*n+3]))
```

Ojo con los falsos positivos legítimos —"que que", "lo lo"— y con la figura
retórica que sí se deja; por eso imprime el contexto en vez de fallar solo.

**Y esto SÓLO se ve en el montaje.** Las dos tomas del video 4c, transcritas
aisladas con el modelo grande, vuelven limpias: el modelo colapsa la repetición
cuando le das el recorte solo. Aparecen únicamente al transcribir el render. Es
la misma trampa del video 7 y es la razón por la que este paso no se saltea
nunca, por más que las pasadas se hayan verificado una por una.

**Si la identidad de cuadro no discrimina, preguntá por la CURVA DE MOVIMIENTO.**
El método de `labios-por-cuadro.py` compara el render contra su fuente y ahí el
cuadro correcto gana por varios puntos. Pero cuando hay que comparar dos renders
con **geometrías distintas** —el cuadrado y la pantalla dividida del video 7,
uno con recorte y zoom y el otro sin— el remuestreo se come la diferencia entre
cuadros vecinos: las correlaciones daban 0,99 con márgenes de 0,002 y el
resultado saltaba entre -1 y +3 según el momento.

Lo que sí resuelve es medir **cuánto cambia la imagen de un cuadro al
siguiente** en cada archivo y correlacionar las dos curvas. El movimiento es casi
el mismo aunque el recorte y la escala no lo sean, así que el pico da el desfase
en cuadros sin remuestreo de por medio:

```python
d = decodificar(archivo, escala=160)          # gris, chiquito
curva = np.abs(np.diff(d, axis=0)).mean((1, 2))
# después, correlación cruzada de las dos curvas en +-10 cuadros
```

Contra el pre-corte, las dos versiones del video 7 dieron **+0 cuadros** con
r=0,82 y 0,89. Mismo umbral de siempre: abajo de 0,6 el número no vale.

**Medí el nivel.** `loudnorm=print_format=json` sobre el render tiene que dar
`input_i` cerca de −14,5 y `input_tp` por debajo de −1. Si da −20 o menos, el video
se va a escuchar flojo en el feed aunque en tus parlantes suene bien — ver
`references/audio.md`.

## Cómo trabajar con Isaias en esto

Revisa los renders con lupa y marca cosas concretas con capturas. Cuando dice que
algo está bien, está bien: no lo toques en la siguiente vuelta. Cuando pide un
cambio puntual, hacé ese cambio y nada más — "no toques ni cambies ninguna cosa
por otra" fue textual.

Si te dice que algo suena mal pero no sabe explicar qué, medilo. Casi siempre
tiene razón y casi siempre hay un número que lo confirma: una palabra 8 dB por
debajo, un corte 10 ms antes de una sibilante. Buscar ese número es más rápido que
discutir y te deja el arreglo exacto.

## Archivos de referencia

- `references/cortes.md` — el criterio de corte en detalle, con el método de medición
- `references/subtitulos.md` — reglas de subtitulado y el algoritmo de corte de línea
- `references/color.md` — el grade y por qué está armado así
- `references/zona-segura.md` — límites de Reels y dónde poner cada cosa
- `references/movimiento.md` — la curva de la marca, los zooms y los motion graphics
- `references/ranking.md` — el formato de lista numerada con logos que entran a su casilla
- `references/columnas.md` — el formato de tres columnas, con la clave de croma y las medidas
- `references/pantalla-dividida.md` — el cuadrado de 1080×1080 y por qué se entrega limpio primero
- `references/grafica-sobre-el-vivo.md` — gráfica detrás de él, íconos en revelación, pantallas 3D, recortar una foto, y cómo sacar cuadros sueltos sin llenar el disco
- `references/formato-chatgpt-simulado.md` — el formato de la caja de ChatGPT que se escribe sola al ritmo de su voz, con antes/después y CTA; y cómo bajar el material que manda por Drive
- `references/audio.md` — nivel de entrega, cómo subirlo sin distorsionar
- `references/generador.md` — cómo está armado el generador de cortes y subtítulos
- `scripts/envolvente.mjs` — medición de envolvente de voz (el corazón de los cortes)
- `scripts/buscar-bordes.mjs` — encuentra arranque y fin de voz alrededor de un punto
- `scripts/dos-bandas.mjs` — envolvente completa y de agudos juntas, para ver las eses
- `scripts/entonacion.mjs` — F0 por autocorrelación: dice si la frase cerró abierta
- `scripts/pasadas.mjs` — parte el crudo en pasadas separadas por silencio real
- `scripts/menu.py` — transcribe cada pasada aislada: el menú del que salen los cortes
- `scripts/labios-por-cuadro.py` — sincronía de labios por identidad de cuadro, no por correlación
- `scripts/revisar-bloques.mjs` — la revisión de bordes obligatoria del paso 6
