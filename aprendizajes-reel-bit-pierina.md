# Aprendizajes — Reel "Bit presenta Pierina Glow"

Resumen de todo lo que se decidió y aprendió armando el reel vertical de ZainSoft con Bit como protagonista (octubre 2026).

**Entregable final:** `cosas de mi video/PierinaBitReel_definitivo.mp4` (1080×1920, 30 fps, 50,2 s, pico de audio -1,9 dB)
**Composición:** `PierinaBitReel` en `mi-video/src/PierinaBitReel.tsx` (Remotion)

---

## 1. Proceso que funcionó

1. **Guion técnico primero** (`cosas de mi video/guion-tecnico-pierina-bit.md`): escena por escena, con tiempos, pose, cámara, texto y sonido.
2. **Transcribir la voz palabra por palabra** antes de animar, y atar cada acción a la palabra que la nombra.
3. **Revisar cuadros sueltos** (hoja de contactos con `remotion still`) antes de cada render completo. Así aparecieron casi todos los errores: tramos de la grabación equivocados, textos encima de Bit, rectángulos con borde duro.
4. **Prueba corta antes de cambios grandes**: la marioneta se validó en una prueba de 8,5 s (`BitRigTest`) antes de meterla en el reel.

## 2. Decisiones de contenido

- **Bit no habla mientras trepa.** Primero sube al mostrador en silencio (3,5 s) y recién arriba dice "Hola". La voz va con un desfase de +3,5 s.
- **No hablar de código ni de programar.** Al cliente (dueños de negocios) le importa su tienda, no cómo se hace. Se sacaron la ventana de código, la notebook de Bit y las frases sobre programar.
- **Cuidado con los cortes de voz:** al sacar "Programamos… línea por línea", "incluyendo el botón de arrepentimiento" quedaba colgado de "no usamos plantillas hechas". Solución: cortar también esa frase y dejar el dato **solo en carteles en pantalla**, puestos donde Bit dice "Del resto, nos encargamos nosotros".
- **No se puede inventar una frase nueva con la voz grabada.** Para cambiar lo que dice Bit hay que grabar de nuevo o cortar.
- **Duración:** se aceptó pasar de 50 a 57 s para no recortar la voz; con los cortes quedó en 50,2 s.
- **CTA:** logo grande de ZainSoft + "Escribinos por DM" + **@zainsoft_ (instagram.com/zainsoft_)**.

## 3. Bit como marioneta SVG (lo que más subió la calidad)

Las imágenes fijas de Bit cambiando cada tantos segundos se veían como un sticker. Se redibujó en vectores:

- `src/bit/BitRig.tsx` — Bit calcado de `bit-principal.png`, con articulaciones en hombros, codos, caderas y rodillas.
  - **Cinemática inversa:** se le dice adónde va la mano o el pie y el codo/rodilla se calcula solo.
  - Boca que se abre según el volumen de la voz, parpadeo, ceño de esfuerzo, antena con resorte y squash & stretch.
  - `handsFront`: manos por delante del cuerpo (si no, al agarrar el borde quedaban escondidas).
- `src/bit/bitMotion.ts` — movimiento compartido:
  - `climbState`: trepada (manotazo al borde, pataleo, primer intento fallido, tirón con el pie apoyado en el canto).
  - `landSquash`: aplastarse y rebotar al caer.
  - `walkFeet`: ciclo de caminata con pies alternados.
  - `blendGestures`: gestos (saludar, señalar, pensar, festejar, apretar botón) que se funden entre sí en 0,28 s.
  - `mouthFrom`: lip-sync con la amplitud suavizada de la voz.
- **Interacción física:** sombra de contacto sobre la madera, las manos clavadas en el borde real del mostrador.
- **Lip-sync:** `src/pierina-bit/amplitud.json` (amplitud por cuadro, ya con el desfase de 3,5 s).

## 4. Fondo y celular

- **Config en un solo lugar:** `src/pierina-bit/fondo.ts`. Imagen: `mi-video/public/fondo_local.png` (1080×1920, con la **pantalla del celular transparente**).
- **Si se cambia la foto hay que volver a medir:** las 4 esquinas de la pantalla, el borde del mostrador (`y = y0 + m·x`), dónde se para Bit y la zona del celular que no se desenfoca.
- **Celular en perspectiva:** la grabación se arma en una caja recta y se deforma a las 4 esquinas con una `matrix3d` (homografía, `rectAPantalla`).
- **Grabación sin recortes:** escalado proporcional (`contain`) dentro de la pantalla, quitando barra de estado y de navegación del Android. Nada de zooms *dentro* de la pantalla porque cortaban bordes.
- **Desenfoque del fondo:** usar una máscara radial suave alrededor del celular, no un recorte rectangular (dejaba un rectángulo con borde duro en el zoom).
- **Fondo generado con Canva:** la herramienta solo devuelve una miniatura; la imagen completa hay que bajarla a mano. La descarga vino en 572×1024 y quedó algo blanda al agrandarla: conviene bajarla en mayor resolución.
- `pierina.mp4` tiene fotogramas variables: los segundos de una hoja de contactos con ffmpeg no siempre coinciden con lo que muestra Remotion. **Verificar cada tramo con un still** antes de fijarlo.

## 5. Textos

- **Subtítulos:** de 1 a 3 palabras, fuente Hando, centrados (`left: 0, right: 0`).
  - Cada palabra aparece con un rebote elástico cuando Bit la dice; cada frase sube 20 px al entrar.
  - Palabras clave en **#00FF88** (Pierina Glow, WhatsApp, a medida, 100 % autogestionable) o **#FFE600** (ZainSoft, stock real, plantillas…).
  - Sombra de fondo **chica y tenue** (`ellipse 32% 42%`, 0,32 de opacidad). La primera versión era demasiado extendida.
  - Corregir lo que entiende mal Whisper: "Beat" → Bit, "Sainsoft" → ZainSoft, "portalle" → por talle, "cambias" → cambiás.
- **Posición:** franja limpia entre el celular y la cabeza de Bit (y=1300). Al principio, sobre el mostrador, van debajo de sus pies (y=1470). En el cierre, más abajo (y=1420).
- **Carteles de sección:** caen desde -50 px con rebote elástico y se van subiendo con desenfoque; borde de neón y un punto que late.
- **Cierre:** Bit sale del cuadro antes de que aparezcan los textos de contacto y se asoma en la esquina recién cuando terminaron.

## 6. Cámara

- Plano general → push-in → zoom 2.5D hacia la pantalla del celular → escenario con el celular grande.
- **Punch-ins sutiles (5–10 %)** en momentos clave: entrada al catálogo (7 %), guía de medidas (6 %) y pedido por WhatsApp (9 %). Entran y salen de a poco.
- El origen del zoom va corrido a la izquierda (`22% 45%`) para que Bit no se salga del cuadro.

## 7. Audio

- **La voz es la protagonista.** Sin música de fondo y casi sin efectos: solo un destello suave al prender la pantalla y un sonido tenue en el logo.
- Voz con **+4 dB** (`VOICE_GAIN = 1.585`): pico en -1,9 dB, sin saturar.
- Los efectos de trepada, clicks y pops a todo volumen saturaban y competían con la voz. La música lofi generada tampoco gustó.
- El ffmpeg que trae Remotion no tiene filtros como `ebur128` o `fps`: medir niveles extrayendo el audio a WAV y calculando con numpy.

## 8. Cortes de voz en Remotion

- Para sacar un tramo sin regrabar: se renderiza el armado completo dos veces con `Sequence` (la segunda con `from` negativo) y se salta el tramo. Voz, imagen y subtítulos cortan juntos.
- Cortar **en silencios** (mirar la amplitud cuadro a cuadro), no en el tiempo que da la transcripción.
- Ocultar los subtítulos de las frases recortadas que quedan "colgando" justo después del corte.
- Constantes en `PierinaBitReel.tsx`: `CUT_FROM = 1107`, `CUT_LEN = 204` (cuadros del armado original).

## 9. Herramientas y comandos útiles

- Transcripción con tiempos por palabra: `mi-video/trabajo/transcribir_bitvoz.mjs` (whisper.cpp, modelo medium; tarda más de 10 min).
- Subtítulos y amplitud: `mi-video/trabajo/datos_pierina_bit.mjs`.
- Still de un cuadro: `npx remotion still src/index.ts PierinaBitReel salida.png --frame=300 --scale=0.3`
- Render: `npx remotion render src/index.ts PierinaBitReel "../cosas de mi video/PierinaBitReel_definitivo.mp4"`
- HyperFrames (`hyperframes/`) se clonó pero no se usó: todo se resolvió en Remotion.

## 10. Pendientes posibles

- Bajar el fondo de Canva en mayor resolución y reemplazar `fondo_local.png` (misma geometría).
- Escuchar el video completo para confirmar que los dos cortes de voz suenan naturales.
- Commitear los cambios en git (nada está commiteado todavía).
