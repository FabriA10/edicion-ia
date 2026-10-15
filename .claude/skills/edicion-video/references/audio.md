# Nivel de audio

El crudo sale con el nivel que quedó, y ese nivel cambia mucho de un video a
otro según de dónde grabó el celular. El video 1 (busto cerrado) quedó en
−21,9 LUFS; el video 2 (sentado, cámara lejos) quedó en −29,3 LUFS: **7,4 dB más
bajo con el mismo micrófono**. Isaias lo escuchó enseguida — "subile un poco el
volumen" — y tenía razón.

## Por qué importa el número, no el "se escucha bien"

Instagram, TikTok y YouTube normalizan a **−14 LUFS**, pero la normalización es
**de una sola dirección**: si el video viene más fuerte lo bajan, si viene más
flojo **no lo suben**. Un Reel a −29 LUFS se reproduce 15 dB por debajo del resto
del feed: la persona tiene que subir el volumen del teléfono para escucharte, y
en el scroll eso no pasa, pasa que sigue de largo.

Por eso el nivel no es cuestión de gusto. **Todo lo que se entrega sale a −14,5
LUFS con pico real por debajo de −1 dBTP.**

## Medir

```bash
ffmpeg -hide_banner -nostats -i out/video.mp4 -af loudnorm=print_format=json -f null - 2>&1 \
  | sed -n '/^{/,/^}/p'
```

Mirá tres números:

- `input_i` — el volumen percibido (LUFS). Objetivo: −14,5.
- `input_tp` — el pico real (dBTP). Es cuánto podés subir antes de distorsionar.
- `input_lra` — el rango dinámico. Sirve después, para ver cuánto lo aplastaste.

## Subirlo sin romperlo

La prop `volume` de Remotion **sólo multiplica**. Si al video 2 le hubiera puesto
`volume={5.62}` (los 15 dB que le faltaban), los picos se iban a +3,8 dBFS y se
recortaban con distorsión digital. Hace falta un limitador, y Remotion no tiene.

Entonces el audio se procesa una vez con ffmpeg y se guarda como pista aparte:

```bash
ffmpeg -y -i public/crudo-02.mp4 -vn \
  -af "volume=15dB,alimiter=limit=0.85:attack=5:release=100:level=false,atrim=start_sample=240,asetpts=N/SR/TB" \
  -ac 2 -ar 48000 -c:a pcm_s16le public/audio-02.wav
```

Tres cosas de esa línea:

**La ganancia sale de la medición**: `15 = -29,3 - (-14,5)`, redondeado. Después
verificá el render, porque el limitador se come unas décimas.

**`atrim=start_sample=240` no es un detalle.** `alimiter` retrasa la señal
exactamente su `attack` (5 ms = 240 muestras a 48 kHz) para poder mirar hacia
adelante. Si no lo compensás, toda la pista queda 5 ms tarde y los cortes dejan
de caer donde los mediste con la envolvente — justo el trabajo más fino de todo
el video. Comprobalo correlacionando la pista nueva contra el crudo en tres
puntos distintos: tiene que dar 0 muestras en los tres.

**WAV, no AAC.** El AAC agrega precarga al principio del archivo y vuelve a
correr todo. Ya está en el `.gitignore` (`public/*.wav`).

## El lazo de ganancia no cierra en tres vueltas

Si iterás la ganancia hasta llegar al objetivo, el ajuste ingenuo —"me faltan
0,3 LUFS, sumo 0,3 dB"— supone que un dB de ganancia da un dB de sonoridad. Con
el limitador puesto no es así: medido en el video 4c, **devuelve 0,57 dB de LUFS
por cada dB de ganancia**, porque lo que agregás arriba se lo come él.

O sea que cada vuelta cierra un 57 % del hueco. Con tres vueltas el lazo se queda
en el camino y entrega de más o de menos —en el 4c se quedó en −14,8 y la regla
es −14,5— sin avisar, porque termina igual. **Dale seis vueltas** y que corte
solo cuando la diferencia sea menor a 0,15 LUFS:

```bash
for vuelta in 1 2 3 4 5 6; do
  # ...filtrar con $GAN, medir en $M...
  node -e "process.exit(Math.abs(($M)-($OBJ)) < 0.15 ? 0 : 1)" && break
  GAN=$(node -e "console.log((($GAN) + ($OBJ) - ($M)).toFixed(2))")
done
```

Y al medir el resultado, pedí `ebur128=peak=all` y no `peak=true`: con `all`
salen las dos líneas etiquetadas, "Sample peak" y "True peak", y sabés cuál
estás leyendo. Con una sola línea que dice `Peak: -1,5 dBFS` no sabés si te
queda margen o no.

## Medí el nivel de cada bloque, no sólo el del total

El número del archivo terminado puede dar perfecto y aun así haber un bloque que
se escucha flojo: la integrada promedia sobre 70 segundos y un bache de dos
segundos se le pierde adentro.

Con el micrófono de estudio pasa seguido, porque no es una corbatera: si en una
frase se echa para atrás o gira la cabeza para enumerar, esa toma queda **8-10 dB
por debajo** del resto del crudo. En el video 4 el bloque de "el hueso, el nervio,
cada diente" tenía la mediana en −23 dB contra −13 del resto.

Se detecta de una pasada, comparando la mediana de la envolvente de cada bloque
del corte contra las demás. Si una está más de 5 dB abajo, hay que mirarla.

**La señal que lo delata sin medir nada:** al transcribir el render de vuelta,
Whisper devuelve ese tramo **vacío**. Si en la verificación falta una frase entera
y en la envolvente hay señal, no es que el corte se la comió: está flojo.

Qué hacer, por orden:

1. **Buscar otra pasada de esa frase que esté a nivel.** Casi siempre existe, y es
   la mejor salida: subirle 10 dB a una toma tomada de lejos no la acerca al
   micrófono, le sube la sala y queda con otro timbre que el resto. Esto pesa más
   que la regla de quedarse con la última pasada: un bloque 10 dB abajo es un
   defecto, no una preferencia.
2. **Si no hay otra, ganancia por bloque.** Con la compuerta de OBS el piso entre
   frases es silencio digital, así que subir el bloque no trae ruido — pero sí
   cambia el timbre, y se nota contra el bloque de al lado.

## El AAC se pasa del techo que le pusiste

El limitador trabaja sobre la señal antes de codificar, pero **el AAC al
decodificar devuelve picos más altos que los que entraron**. No es un error de
medición: es cómo funciona un codec con transformada. Medido sobre estos videos:

| | sobrepico del AAC | limitador que hay que poner |
|---|---|---|
| voz sola | 0,7 dB | **0,78** (entrega −1,5 dBTP) |
| voz con cama de música | 1,5 dB | **0,70** (entrega −2,4 dBTP) |

Con música es el doble porque la señal viaja pegada al techo todo el tiempo en
vez de sólo en los picos de voz.

El síntoma es que el archivo entregado mide por encima de −1 dBTP aunque el
limitador esté en −1,0 nominales, y bajar el limitador "un poco" no alcanza. Si
querés comprobarlo sin adivinar, limitá a WAV y medí: ahí el número da exacto lo
que dice la teoría, y la diferencia contra el MP4 es el sobrepico.

## Limitador solo, no compresor

Probé las dos cosas sobre el mismo material y las medí:

| cadena                       | LUFS  | dBTP  | LRA  |
|------------------------------|-------|-------|------|
| original                     | −29,3 | −11,2 | 6,1  |
| compresor 3:1 + 19 dB + lim  | −15,0 | −1,4  | 2,9  |
| **15 dB + limitador**        | −14,8 | −1,4  | 4,6  |

El limitador solo llega **más fuerte y más vivo**: el compresor bajaba todo, no
sólo los picos, y dejaba la voz plana. Con voz hablada bien grabada —rango de
6 LRA— alcanza con ganancia y un limitador que toque nada más los picos.

Controlá también el piso de ruido, porque sube junto con la voz. Medí los
percentiles del nivel en ventanas de 10 ms antes y después: la distancia entre el
piso (p05) y la voz (p50) **tiene que quedar igual**. En el video 2 el piso pasó
de −65 a −50 dB y la voz de −36 a −21: los dos subieron 15 dB parejo, o sea que
la ganancia es limpia. Si esa distancia se achica, estás levantando ruido.

## Música de fondo

Va **en la pasada de cierre con ffmpeg, no en Remotion**. Es lo que permite
cambiarle el nivel en un minuto en vez de re-renderizar diez, y el nivel de la
música es justo lo que hay que ajustar dos o tres veces hasta que quede.

### De dónde sacar el tema

**Pixabay** (`pixabay.com/music`) es la fuente por defecto: licencia libre para
uso comercial y **sin obligación de atribución**, así que no le deja al Reel un
crédito colgado. El MP3 sale del `cdn.pixabay.com/download/audio/...` que está
en el HTML de la página del tema.

Cuál elegir no se decide escuchando el título. Se miden tres cosas sobre el
tramo que se va a usar, igual que en el video 6:

1. **Qué tan parejo es** (desvío estándar del nivel en ventanas de 1 s).
2. **Cuánta energía tiene en la banda de la voz** (300-3500 Hz, donde vive la
   mitad de la energía de la suya). Menos es mejor: un tema que vive en los
   graves y los agudos se mete abajo de la voz sin pelearla.
3. **Cuánto OSCILA en esa banda.** Es el que más decide y el que ningún chequeo
   de inteligibilidad detecta: una cama pareja se vuelve fondo, una que entra y
   sale te roba la atención.

Del video 7, las tres candidatas de "dramática":

| tema | parejo | energía en la banda | vaivén |
|---|---|---|---|
| Best Dramatic Music | 2,58 dB | 44,2 % | **43,65** |
| Investigation | 0,75 dB | 33,9 % | 13,92 |
| **Loneliness of the Winner** | 1,15 dB | **19,3 %** | **13,21** |

La primera es música de tráiler —sube y baja— y quedó descartada sola.

**Y transcribí el tema solo antes de elegir.** Si Whisper devuelve palabras, el
tema tiene material en la banda del habla que el oído confunde con voz, aunque
no tenga letra: "Investigation" devolvía "más o menos" repetido. La que ganó no
devuelve nada.

### De dónde sacar el tramo

No desde el segundo cero. Casi todos los temas arrancan con una intro suelta que
deja baches en la cama. Buscá el tramo más **parejo** del largo que necesitás:
partí la canción en ventanas de 1 s, calculá el desvío estándar del nivel de cada
ventana del largo del video y quedate con el mínimo. En el video 4 eso dio el
segundo 43 (desvío 1,16 dB); los primeros 43 s eran intro.

### El nivel: 17-18 dB abajo de la voz

Medido sobre la cama **sola**, ya procesada y agachada:

| Separación | Cómo queda |
|---|---|
| 22 dB | casi no se escucha, sobre todo en parlante de celular |
| **17-18 dB** | se escucha claramente y nunca compite ← esto |
| 15 dB o menos | empieza a pelear con la voz |

Con la entrega en −14,5 LUFS, eso es una cama en **−32 LUFS**.

### Cómo se llega ahí

```
volume=-15dB                         # el tema medía -10 LUFS
equalizer=f=2200:t=q:w=1.2:g=-3      # pozo en la banda de la inteligibilidad
afade=t=in:st=0:d=1.2
afade=t=out:st=<fin-2.2>:d=2.2
sidechaincompress=threshold=0.08:ratio=3:attack=15:release=400:detection=rms:knee=4
amix=inputs=2:duration=first:normalize=0
```

La cadena lateral la dispara **la propia voz** (un `asplit` de la voz ya
corregida). Es imprescindible si el tema tiene voz cantada: sin eso las dos se
pelean aunque el nivel esté bien.

Ojo con cuánto agacha: como en estos videos no hay silencios, la voz está sonando
casi todo el tiempo y el agachado se aplica casi siempre. Con estos valores se
comió **7 dB de promedio** — bastante más de lo que sugiere el papel. Por eso hay
que medir, no calcular.

### Un instrumento solista tapa aunque el nivel esté bien

Video 4c, "Sing Sang Sung": la cama estaba en −32 LUFS y Whisper leía la mezcla
igual que la voz sola, y aun así Isaias: *"satura al principio… no permite
escuchar bien por la trompeta que resalta mucho"*. El nivel promedio no lo
muestra: la trompeta toca notas sostenidas justo en **1,0-1,6 kHz**, la franja
donde se entiende la voz, y en esa banda la voz quedaba apenas **+7,7 dB**
arriba.

Cómo encontrarlo: por segundo, el pico espectral de 600-2500 Hz sobre la
mediana de esa banda (un bronce sostenido da 17-25 dB; batería y ruido, menos
de 12). Y el histograma de dónde caen esos picos dice qué frecuencia tocar.

Lo que lo arregló:

- un pozo de **−8 dB en 1,2 kHz, una octava de ancho**, en todo el tema (el de
  −3 dB se corrió a 2,5 kHz);
- **el arranque 4 dB más bajo** los primeros 17 s (el hook y lo que sigue), con
  una subida de 2 s a su nivel;
- la cama se vuelve a llevar a −32 LUFS después: sube lo que no es voz.

Resultado, voz sobre música en 1-1,6 kHz: al principio de +7,7 a **+16,9 dB**, en
el resto de +7,3 a **+12,6**. La medida que vale es esa, en la banda del
instrumento, no el LUFS de la cama.

### Medir la cama, no la mezcla

Una vez mezcladas no se separan. Para saber a cuántos dB quedó, hay que **generar
el stem de la música solo**, con el mismo procesado y la misma cadena lateral, y
medirlo aparte. Dos líneas de ffmpeg y te ahorra mandar un video con la música
inaudible (o tapando).

Un chequeo indirecto que sirve: transcribir el render mezclado. Si Whisper lee el
texto igual de bien que sin música, la música no está tapando.

### La otra ruta: música dentro de la composición

También se puede poner como `<Audio>` en Remotion, con el nivel en la prop
`volume` y las entradas y salidas como función del cuadro. Queda más prolijo
—cualquier render futuro sale con música sin acordarse de nada— pero **cada cambio
de nivel cuesta un render entero**, y no hay forma de agachar la música con la voz:
el ducking necesita la cadena lateral de ffmpeg.

Cuál usar:

- **Tema instrumental y nivel calculado por medición** (medir la cama, medir la voz,
  restar): entra bien en la composición. Es lo que se hizo en el video 2, con el
  volumen en 0,13.
- **Tema con voz cantada, o nivel que va a necesitar varias vueltas**: pasada de
  ffmpeg con `sidechaincompress`, como arriba.

## El ecualizador del micrófono chico

Isaias ajustó un ecualizador en el Fairlight de DaVinci para el micrófono DJI y
pidió que **se aplique de entrada en todos los videos de acá en adelante**, sin
volver a preguntar. Son cuatro puntos:

| frecuencia | ganancia | qué hace |
|---|---|---|
| 30 Hz (estante grave) | +8,7 dB | cuerpo, peso de la voz |
| 171 Hz (campana) | +4,9 dB | calidez, el pecho |
| 1,6 kHz (campana) | −4,7 dB | saca lo nasal y lo "de caja" |
| 5,6 kHz (estante agudo) | +11,0 dB | aire y claridad |

En la captura que mandó, **las bandas 1 y 6 estaban apagadas** —el corte de 70 Hz
y el de 22 kHz—: se nota porque sus manijas no aparecen dibujadas sobre la curva,
sólo la ②③④⑤. Si alguna vez manda una captura con las seis manijas, hay que
agregar el pasa-altos.

### La traducción a ffmpeg no es literal

La primera versión, copiando los números tal cual a `bass` y `treble` con
`width_type=q`, daba otra curva:

| | DaVinci | copia literal | ajustado |
|---|---|---|---|
| 30 Hz | +8,7 | +4,5 | +8,8 |
| 171 Hz | +4,9 | +4,6 | +4,9 |
| 1,6 kHz | −4,7 | −5,6 | −4,7 |
| 5,6 kHz | +11,0 | +5,2 | +11,0 |
| 10 kHz | — | +14,6 | +11,4 |

Los estantes de ffmpeg llegan a **la mitad** de la ganancia en la frecuencia que
les ponés y siguen subiendo después: con Q alto se pasan varios dB de largo. Hay
que bajar la frecuencia de corte y usar Q 0,7, y compensar las campanas, que se
corren cuando los estantes las pisan.

La cadena que sí da la curva:

    bass=g=8.7:f=45:width_type=q:w=0.7,
    equalizer=f=171:width_type=q:w=1.1:g=5.2,
    equalizer=f=1600:width_type=q:w=1.1:g=-4.0,
    treble=g=11:f=3500:width_type=q:w=0.7

**Comprobala con tonos, no con ruido.** Medir un bin suelto sobre ruido rosa tiene
tanta varianza que da cualquier cosa: la primera medición dijo −8 dB en 171 Hz
donde había +4,9. Un seno por frecuencia, nivel con y sin filtros, y listo.

### Lo que cuesta el brillo

El estante de +11 dB sube las eses tanto como la claridad. Medido sobre el mismo
montaje, comparando el pico de sibilancia (p99 de la banda de agudos) contra el
nivel medio de la voz:

| | sibilancia respecto de la voz |
|---|---|
| sin ecualizador | −7,1 dB |
| con el ecualizador | **+0,9 dB** |

Son 8 dB de más en las eses, y el español rioplatense está lleno. **Se entrega
igual, porque es la configuración que él ajustó de oído**, pero conviene decírselo.
Si alguna vez pide domarlas, el de-esser de ffmpeg (`deesser`) no hace nada
medible; hay que partir en bandas:

    asplit=2[lo][hi];
    [lo]lowpass=f=5200:p=2[l];
    [hi]highpass=f=5200:p=2,acompressor=threshold=-40dB:ratio=5:attack=1:release=60:knee=4:makeup=1[h];
    [l][h]amix=inputs=2:normalize=0

Con ese ajuste la sibilancia vuelve a −6,6 dB, casi igual que sin ecualizador. Ojo
que de más borra justo el brillo que él subió.

### El orden de la cadena

Ecualizador primero, después la ganancia, después el limitador. El ecualizador
cambia el nivel —acá subió 2,1 LU y los picos 1,3 dB—, así que **la ganancia se
recalcula después de ecualizar**, nunca antes: con el ecualizador puesto son 13 dB,
sin él eran 15.

## Cómo se conecta en Remotion

Igual que la pista del micrófono de estudio: prop `audio` en la composición,
`muted={Boolean(audio)}` en el `OffthreadVideo`, y un `<Audio>` por tramo con los
mismos `trimBefore`/`trimAfter` que el video. Las dos fuentes son la misma toma,
así que comparten la línea de tiempo.

El `<Audio>` va sin el cuadro de margen que lleva el video en `trimAfter`: al
video le sobra material para no quedarse sin frames, al audio no le hace falta
porque el `Sequence` lo corta igual.
