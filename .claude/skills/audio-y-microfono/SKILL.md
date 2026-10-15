---
name: audio-y-microfono
description: Audio de los videos verticales — la cadena del micrófono (ecualizador del micrófono chico DJI, ganancia, limitador, de-esser), el nivel de entrega (-14,5 LUFS, pico bajo -1 dBTP), cómo sincronizar un micrófono grabado aparte en OBS (los tres desfases), la música de cama (-32 LUFS, agachada por la voz, con drop) y la pasada de cierre con ffmpeg. Usala cuando haya que subir/bajar el volumen, "que se escuche mejor", mezclar música, sincronizar audio de OBS con el video del celular, entregar un render, o cuando algo "suene mal" y haya que medirlo.
---

# Audio y micrófono

El detalle largo, con las mediciones, está en `edicion-video/references/audio.md`
(leelo si algo no cierra). Esta skill es lo que hay que tener a mano y los scripts
listos para copiar a un proyecto (`scripts/`).

## Lo fijo (ya decidido, no se pregunta)

- **Todo se entrega a −14,5 LUFS con pico real por debajo de −1 dBTP.** Instagram,
  TikTok y YouTube normalizan a −14 en una sola dirección: bajan lo fuerte y no suben
  lo flojo. Un video a −29 LUFS se oye 15 dB debajo del resto del feed.
- **El ecualizador del micrófono chico (DJI) va en todos los videos, de entrada.** Lo
  ajustó Isaias de oído en el Fairlight de DaVinci: +8,7 dB en 30 Hz (estante grave),
  +4,9 en 171 Hz, −4,7 en 1,6 kHz, +11 en 5,6 kHz (estante agudo). Las bandas de corte
  de 70 Hz y 22 kHz estaban apagadas.
- **El orden de la cadena**: EQ → ganancia → limitador. La ganancia se **recalcula
  después de ecualizar**, nunca antes.
- **Limitador solo, no compresor**: llega más fuerte y más vivo con voz bien grabada.

## La cadena de ffmpeg (ya ajustada y verificada con tonos)

Los números de DaVinci **no se copian tal cual**: los estantes de ffmpeg llegan a la
mitad de la ganancia en la frecuencia que les ponés y siguen subiendo.

```
bass=g=8.7:f=45:width_type=q:w=0.7,
equalizer=f=171:width_type=q:w=1.1:g=5.2,
equalizer=f=1600:width_type=q:w=1.1:g=-4.0,
treble=g=11:f=3500:width_type=q:w=0.7
```

Se verifica **con tonos** (un seno por frecuencia, nivel con y sin filtros), no con
ruido rosa: un bin suelto sobre ruido da cualquier cosa.

**Lo que cuesta el brillo**: el estante de +11 dB sube las eses ~8 dB (la sibilancia
pasa de −7,1 a +0,9 dB respecto de la voz). Se entrega igual porque es la configuración
que él eligió, pero si la pide domada hay un de-esser por bandas
(`asplit` → `lowpass 5200` + `highpass 5200 + acompressor`, ver `scripts/voz_final.sh`).
`deesser` de ffmpeg no hace nada medible.

## Voz terminada: `scripts/voz_final.sh`

EQ con −15 dB de margen → de-esser suave → ganancia en **lazo de seis vueltas** hasta
−14,5 LUFS (corta cuando la diferencia es < 0,15) → limitador → `atrim=start_sample=240`.

- **El lazo necesita seis vueltas**: con el limitador puesto, cada dB de ganancia
  devuelve ~0,57 dB de LUFS, así que cada vuelta cierra solo el 57 % del hueco. Con tres
  se queda en −14,8.
- **`atrim=start_sample=240` no es un detalle**: `alimiter` retrasa la señal su
  `attack` (5 ms = 240 muestras a 48 kHz). Sin compensarlo toda la pista queda 5 ms
  tarde y los cortes dejan de caer donde se midieron.
- **WAV, no AAC** para las pistas intermedias: el AAC agrega precarga y corre todo.
- Medí con `ebur128=peak=all` (da "Sample peak" y "True peak" etiquetados).

### El AAC se pasa del techo

Al decodificar, el AAC devuelve picos más altos que los que entraron. **Limitador
0,78** si es voz sola (entrega −1,5 dBTP) y **0,70** si hay música (entrega −2,4).

## Música de cama y pasada de cierre: `scripts/cierre.sh`

La música va **en la pasada de cierre con ffmpeg, no en Remotion**: cambiarle el nivel
cuesta un minuto en vez de re-renderizar diez.

- **Nivel: 17-18 dB debajo de la voz = cama a −32 LUFS** (medida sobre la cama sola,
  ya procesada y agachada). 22 dB casi no se escucha en parlante de celular; 15 o menos
  pelea con la voz.
- Cadena de la cama: `equalizer=f=2200:t=q:w=1.2:g=-3` (pozo de inteligibilidad) →
  `sidechaincompress=threshold=0.06:ratio=3:attack=15:release=400:detection=rms:knee=4`
  **disparado por la propia voz** → ganancia hasta −32 LUFS → fundidos.
- Con la voz casi siempre sonando, el ducking se come ~7 dB de promedio: **se mide el
  stem ya agachado**, no se calcula.
- **Un instrumento solista tapa aunque el nivel esté bien** (una trompeta en
  1,0-1,6 kHz, donde se entiende la voz): pozo de −8 dB en 1,2 kHz de una octava de ancho
  en todo el tema, y el arranque 4 dB más bajo. La medida que vale es voz vs música **en
  la banda del instrumento**, no el LUFS de la cama.
- **Elegir el tema**: medir sobre el tramo a usar (1) qué tan parejo es (desvío del nivel
  en ventanas de 1 s), (2) cuánta energía tiene en 300-3500 Hz (menos es mejor) y (3)
  cuánto **oscila** en esa banda (el que más decide). **Transcribí el tema solo**: si
  Whisper devuelve palabras, tiene material que el oído confunde con voz. Tramo: el más
  parejo del largo que hace falta, no desde el segundo cero (la intro suele dejar baches).
- **Con drop**: [musica-drop.md](../../../criterio/musica-drop.md) — el drop va en el corte
  donde empieza lo importante, medido al milisegundo; la intro se nivela por la banda de
  la voz (300-3500 Hz), no por LUFS. `scripts/musica.py` y `scripts/musica_mezcla.py`.
- Para saber a cuántos dB quedó la música: **generar el stem de la música sola** con el
  mismo procesado y medirlo. Indirecto: transcribir el render mezclado; si Whisper lee
  igual de bien que sin música, no tapa (usar el modelo `medium`).

Música disponible: carpeta `musica/` (ver su `LEEME.md` para licencias).

## Micrófono de estudio grabado aparte (OBS): los tres desfases

Desde septiembre 2026 los talking-head se graban con **dos fuentes**: el iPhone hace el
video (MOV, HEVC 4K, 30 fps exactos) y el micrófono de estudio va por OBS a un MP4. El
audio del celular se descarta entero. El micrófono llega ~25 dB debajo del nivel de
redes, así que se levanta con compresión y limitador, no con ganancia sola. Hay **tres**
desfases, cada uno se arregla en un lugar:

1. **Los relojes derivan.** No alcanza un offset fijo (en un video el micrófono corría
   57,6 ppm más rápido: 69 ms en 20 minutos). Se mide correlacionando la envolvente en
   ventanas a lo largo de todo el archivo, se ajusta una recta, y se estira con
   `aresample` a una tasa intermedia alta (`asetrate` sólo acepta enteros y trunca el
   factor). Ver `scripts/sync.py`.
2. **El MOV del iPhone arranca el audio 20 ms después que el video**
   (`start_time=0.020`): la maestra del micrófono lleva esos 20 ms de compensación.
3. **Remotion muxea el AAC sin declarar la precarga del codificador** y el audio sale
   2048 muestras (42,7 ms) tarde. Se arregla en la pasada de cierre sobre el render:
   `atrim=start=0.042667` y recodificar.

Además: transcodificar con `-r 30 -fps_mode cfr` corre el video hasta 68 ms; usar
`-fps_mode passthrough`. Con `-hwaccel d3d11va` va 2,8× más rápido.

**Con la compuerta de OBS el piso entre frases es silencio digital**: subir un bloque
no trae ruido, pero cambia el timbre. **Un bloque flojo** (la persona se echó para
atrás): primero buscar otra pasada a nivel; ganancia por bloque es el último recurso.
`edicion-video/scripts/revisar-bloques.mjs` avisa de los que están >5 dB abajo; el
síntoma sin medir: Whisper devuelve ese tramo vacío.

**Verificación**: prueba de labios contra un clip recortado del MOV original (trae su
propio audio, así que la sincronía es correcta por construcción):
`edicion-video/scripts/labios-por-cuadro.py`.

## Cómo se conecta en Remotion

Prop `audio` en la composición, `muted={Boolean(audio)}` en el `OffthreadVideo` y un
`<Audio>` por tramo con los mismos `trimBefore`/`trimAfter` que el video. El `<Audio>`
va sin el cuadro de margen del video: al video le sobra material para no quedarse sin
frames, al audio no le hace falta.

## Aviso sonoro al terminar

Cuando un render pasó todas las verificaciones, sonar una alarma del sistema
(Isaias deja el render y no mira la pestaña):

```powershell
(New-Object Media.SoundPlayer "C:\Windows\Media\Alarm03.wav").PlaySync()
```

## Scripts de esta skill

Son **plantillas**: tienen rutas con `@@PROYECTOS@@` (se resuelve con
`instalar/ajustar-rutas.ps1`) y una variable `R` con el proyecto de donde salieron.
Copialos a `proyectos/<nuevo>/trabajo/scripts/` y cambiá `R`.

| Script | Para qué |
|---|---|
| `voz_final.sh` | EQ + de-esser + lazo de ganancia a −14,5 LUFS |
| `cierre.sh` | cama agachada + efectos + voz → mezcla a −14,5, limitador 0,70, sobre el render mudo |
| `musica.py` | arma la cama con dos drops, cortes secos y la intro +14 dB |
| `musica_mezcla.py` | un drop en el corte, intro nivelada por la banda de la voz |
| `drop_fino.py` | ataques exactos (1 ms) del drop y la grilla de compases |
| `snr_banda.py` | voz contra cama en la banda de la voz (300-3500 Hz), ventana de 100 ms: dónde queda más apretada |
| `whisper_mezcla.py` | ¿la música tapa? Whisper sobre la entrega con y sin música, y sobre el tema solo |
| `sync.py` | desfase y deriva de una grabación contra otra por correlación de audio (ejemplo: cámara 2 vs cámara 1; el mismo método sirve para el micrófono de OBS vs el celular) |
