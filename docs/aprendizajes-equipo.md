# Lo que aprendió el equipo (destilado para los agentes)

Fuente: commit `8499714` de NicBazan (2026-10-20), `aprendizajes-reel-bit-pierina.md`, `referencias/analisis-se7en-studio.md`
y el código de `mi-video/src/` (`PierinaBitReel`, `bit/`, `pierina-bit/fondo.ts`). Es el único reel completo sin cara humana del equipo:
**Bit**, una mascota robot en SVG, presenta una web (Pierina Glow) mostrada en un celular. 1080x1920, 30 fps, 50 s.
Las reglas de `criterio/` siguen mandando; esto las completa para reels sin rostros. Donde chocan, se anota.

## 1. Proceso que funcionó (el orden importa)
1. **Guion técnico primero**, escena por escena: tiempos, pose/cámara, texto, sonido (lo hace `guionista-reel`).
2. **Transcribir la voz palabra por palabra antes de animar** y atar cada acción a la palabra que la nombra.
3. **Hoja de contactos con `remotion still` antes de cada render completo.** Así aparecieron casi todos los errores: tramos de grabación equivocados, texto sobre la mascota, rectángulos con borde duro.
   `npx remotion still src/index.ts <Comp> salida.png --frame=300 --scale=0.3`
4. **Prueba corta antes de un cambio grande** (la marioneta se validó en 8,5 s antes de entrar al reel).
5. Los videos con fotogramas variables (grabaciones de celular): los segundos de ffmpeg no siempre coinciden con Remotion. **Verificar cada tramo con un still** antes de fijarlo.

## 2. Contenido
- **Hablar al cliente de su negocio, no de cómo se hace.** Fuera ventanas de código y frases sobre programar si el público son dueños de negocio.
- **No se puede inventar una frase con la voz grabada.** Cambiar lo que se dice = regrabar o cortar. Si cortar deja una frase colgada, cortar también esa y pasar el dato a **carteles en pantalla**.
- El gancho de la referencia (Se7en) es un dolor concreto + un detalle visual (reloj 23:54 → 23:55) → «¿te suena?» → marca → promesa → números → prueba → escasez/CTA. Un bloque cada 3-4 s.
- Recorrido de duración: se aceptó 50 s para no recortar voz. Para este proyecto el rango real es 25-50 s; la regla de 20-35 s es objetivo, no tope.

## 3. Mascota / personaje sin rostro humano (lo que más subió la calidad)
- Imágenes fijas que cambian cada tantos segundos se ven como sticker. **Marioneta SVG con articulaciones** (hombros, codos, caderas, rodillas) + cinemática inversa: se indica adónde va la mano/pie y el codo se calcula.
- Detalles que dan vida: boca según el volumen de la voz (lip-sync por amplitud RMS por cuadro, suavizada en 3 cuadros), parpadeo, antena con resorte, squash & stretch al caer, sombra de contacto, gestos que se funden en ~0,28 s.
- Archivos: `src/bit/BitRig.tsx`, `bitMotion.ts` (`climbState`, `landSquash`, `walkFeet`, `blendGestures`, `mouthFrom`), `mi-video/calcular-amplitud.mjs`.
- **La mascota no habla mientras hace esfuerzo físico**; la voz entra con desfase (aquí +3,5 s).
- Una mascota con ojos y boca (robot) **cumple «sin rostros humanos»**. Un humano ilustrado realista no.

## 4. Fondo, celular y pantalla
- Configuración de fondo en **un solo archivo** (`src/pierina-bit/fondo.ts`): imagen 1080x1920 con **pantalla del celular transparente**, 4 esquinas, borde del mostrador, posición de la mascota. Si se cambia la foto, hay que volver a medir todo.
- Grabación dentro del celular en perspectiva: caja recta deformada a las 4 esquinas con `matrix3d` (homografía `rectAPantalla`). Escala `contain`, sin barra de estado ni de navegación. **Sin zooms dentro de la pantalla** (cortan bordes).
- Desenfoque del fondo con **máscara radial suave**, nunca recorte rectangular (borde duro).
- Fondos de Canva: solo devuelve miniatura; bajar la imagen completa **en alta resolución** (la de 572x1024 quedó blanda).

## 5. Textos y subtítulos (versión de este equipo)
- **1 a 3 palabras**, fuente **Hando** (`mi-video/public/Hando.otf`), centrados (`left:0; right:0`).
- Cada palabra entra con rebote elástico cuando se dice; cada frase sube 20 px. Palabras clave en **#00FF88** o **#FFE600**.
- Sombra de fondo chica y tenue (elipse ~32 % x 42 %, opacidad 0,32); la primera versión, extensa, no gustó.
- **Corregir lo que Whisper entiende mal** (marcas, nombres propios, voseo): «Beat» → Bit, «Sainsoft» → ZainSoft, «portalle» → por talle, «cambias» → cambiás. Mantener una lista por cliente.
- Posición: franja libre entre el elemento principal y la mascota; no fija (y=1300 / 1420 / 1470 según la escena).
- Carteles de sección: caen desde −50 px con rebote y salen subiendo con desenfoque.
- ⚠ Chocan con `criterio/subtitulos.md` (minúsculas, sin puntos, estáticos, ≤4 palabras): el equipo usa color y rebote. Regla para los agentes: **estilo del brief manda; si no dice nada, `criterio/subtitulos.md`**.

## 6. Cámara
Plano general → push-in → zoom 2.5D a la pantalla → escenario con el celular grande. Punch-ins sutiles de 5-10 % en los momentos clave, entrando y saliendo de a poco. El origen del zoom se corre (aquí `22% 45%`) para que la mascota no se salga del cuadro.

## 7. Audio
- **La voz protagoniza.** Sin música de fondo y casi sin efectos (un destello suave y un tono tenue en el logo). Efectos a todo volumen saturaban; la música lofi generada no gustó.
- Voz con **+4 dB** (`VOICE_GAIN = 1.585`), pico −1,9 dB, sin saturar.
- ⚠ Choca con `criterio/paquete-efectos-cada-3s.md` (música y sonidos de impacto). Regla: **con voz en off, voz arriba; música y efectos solo si el brief los pide**, siempre muy bajos.
- El ffmpeg incluido en Remotion no trae `ebur128` ni `fps`. En este equipo ya hay ffmpeg completo (9.0.2): medir con ese.

## 8. Cortes de voz en Remotion (sin regrabar)
Renderizar el armado dos veces con `Sequence`, la segunda con `from` negativo, y saltar el tramo: voz, imagen y subtítulos cortan juntos. Cortar **en silencios** (mirar la amplitud cuadro a cuadro), no donde diga la transcripción. Ocultar los subtítulos de frases recortadas que queden colgando.

## 9. Herramientas (todo Node)
- **Transcripción**: `mi-video/transcribir.mjs` con `@remotion/install-whisper-cpp` (whisper.cpp, modelo `medium`, `language: 'es'`, tiempos por token, >10 min). **No requiere Python**, lo que resuelve la duda de Whisper con Python 3.14.
- `generar-subtitulos.mjs`: reagrupa tokens en palabras y las parte en cues de ≤4 palabras con las correcciones de nombres.
- Audio de entrada: `trabajo/voz16.wav` (16 kHz mono PCM 16-bit). `mi-video/trabajo/`, `whisper.cpp/`, `hyperframes/` y `cosas de mi video/` están en `.gitignore` (no llegan por git).
- Render: `npx remotion render src/index.ts <Comp> "<salida>.mp4"`.

## 10. Qué NO se subió a git (hay que pedírselo al equipo)
`PierinaBitReel_definitivo.mp4` (el entregable), `guion-tecnico-pierina-bit.md`, `pierina.mp4`, `voz.mp3`/`voz16.wav` y `pierina_bit` de trabajo: están en carpetas ignoradas. Sin ellos el reel no se puede re-renderizar.

## 11. Aprendido produciendo el reel «Qué es un sistema» (2026-10-20)
- **Esta PC es un Pentium Gold G5420 sin AVX**: whisper.cpp (el de `@remotion/install-whisper-cpp` y el filtro `whisper` de ffmpeg) se cierra con `0xC0000142` / `0xC000001D`. Si el guion es conocido, se alinea sin reconocimiento: `reels/<slug>/app/alinear-palabras.mjs` parte la voz por silencios reales (< −42 dB, ≥ 0,3 s), reparte por sílabas y ajusta cada corte al valle de energía. Precisión ~±100 ms (las palabras de 1-2 sílabas son aproximadas). Comprobar siempre que nº de segmentos == nº de frases.
- **Las capturas de `pierina_shots/` llevan rostros** (modelos) y un teléfono de contacto: no usarlas. El catálogo se dibuja en código con siluetas de prendas.
- **Filtros SVG con región en porcentaje se recortan mientras el elemento rebota** (cuadros sueltos con el texto cortado a un rectángulo). Usar `filterUnits="userSpaceOnUse"` con región fija y aplicarlo a un `<g>`, no a un `<tspan>`.
- **Remotion exporta `yuvj420p`** (rango completo): reexportar con ffmpeg a `yuv420p`, rango `tv`, BT.709, `-movflags +faststart`.
- **Voz de ElevenLabs a −21 LUFS**: `highpass 70 Hz + acompressor + loudnorm I=−14.5 TP=−2` la dejó en −14,9 LUFS / pico −2,0 dBFS. Sin limitador el +6 dB se pasa de 0 dBFS.
- Los logos de `mi-video/public/zainsoft_*.png` miden 246x118: ampliados se ven borrosos; recrear en vector.
- Verificación que funcionó: render a 0,4x → hoja de contactos de ~24 momentos clave → corregir → render completo → hoja de contactos de nuevo + hoja densa de los cuadros alrededor de cada animación con rebote.

## 12. Artefactos de render: fantasmas y parpadeos (2026-10-20)
**Síntomas** (los detectó el usuario con capturas; yo no los había notado): copia de Bit recortada a la mitad en su posición anterior (seg 32); paréntesis naranjas «( )» y una línea bajo la píldora `@zainsoft_` justo después de su rebote (seg 34); restos junto a «ESCRIBINOS POR DM»; el texto «SISTEMAS» cortado a un rectángulo durante unos cuadros. Duran de 1 a ~12 cuadros y se ven como parpadeo.

**Qué NO era**: un error del dibujo. Renderizando solo ese tramo en una pestaña limpia casi nunca aparecían. Es repintado parcial de Chrome: los bordes anti-aliasados del tamaño máximo de un rebote no se limpian. Ocurre en este equipo, sin GPU dedicada.

**Lo que no bastó** (no repetir):
- Cambiar filtros SVG por degradados (ayudó con la sombra de Bit, nada más).
- Una capa de pantalla completa que cambia de alfa en cada cuadro.
- Comparar dos renders con distinta concurrencia: los dos fallaban igual y daban «sin diferencias».
- Un detector de «píxeles fuera de rango entre cuadros vecinos»: los rebotes normales también oscilan y da falsos positivos por todos lados.

**Lo que sí funcionó (las tres juntas)**:
1. **`--gl=swangle`** en `remotion render` (rasterizado por software, determinista).
2. **`key={frame}`** en el contenedor de los elementos visuales: se recrean desde cero en cada cuadro. El `<Audio>` y los `<Sequence>` de sonido quedan **fuera** de ese contenedor.
3. Sin filtros SVG con región en porcentaje; sombras con `radialGradient`; si hace falta un filtro, `filterUnits="userSpaceOnUse"` sobre un `<g>`.

**Cómo verificar**: `app/verificar-fantasmas.ps1 -Video ... -Desde 32 -Hasta 34.4` extrae **todos** los cuadros de un tramo, recortados a la zona, y arma una hoja para mirarla. Verificado así: todos los cuadros de 32,0 a 36,4 s del `final.mp4` actual, limpios. **No** se miraron todos los cuadros del resto del video: la corrección es global, pero la comprobación fina solo cubre el cierre. Lección de proceso: mirar los cuadros inmediatamente posteriores a cada animación con rebote, no solo muestras sueltas (yo mismo había visto los paréntesis en una hoja y no los noté).

**Mapa de tiempos**: las escenas se escribieron con los tiempos de la primera voz; `toOld()/toNew()` en `SistemaReel.tsx` las reajustan a las pausas de cualquier voz nueva (13 anclas, una por frase) y `REEL_FRAMES` sale del audio. Cambiar la voz = poner el MP3, masterizar, regenerar `palabras.json` con `alinear-palabras.mjs` y renderizar, sin tocar las escenas. El alineador une frases separadas por «:» si una pausa no llega a 0,3 s.

**Estilo**: el fondo claro crema quedó aprobado (`docs/estilo-visual-reels.md`).

## 13. Flujo operativo para un reel nuevo con Bit
1. `validador-prompt`: preguntas (incluye **color de fondo**) y `BRIEF.md` aprobado.
2. `guionista-reel`: `GUION.md` y `STORYBOARD.md` aprobado. El texto para la voz va en `audio/texto-para-elevenlabs.txt` (de ahí lee el alineador).
3. El usuario genera la voz en ElevenLabs (`docs/elevenlabs-guia.md`) y la guarda en `audio/voz.mp3`.
4. Masterizar la voz:
   `ffmpeg -i audio/voz.mp3 -af "highpass=f=70,acompressor=threshold=0.063:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-14.5:TP=-2:LRA=7:linear=true" -ar 48000 -ac 1 app/public/voz_master.wav`
   y la versión para alinear: `ffmpeg -i audio/voz.mp3 -ac 1 -ar 16000 app/trabajo/voz16.wav`.
5. `cd app` y `node alinear-palabras.mjs` (comprobar que «segmentos» sea igual a «frases»).
6. Producir y ajustar escenas; vista previa con `npx remotion render src/index.ts <Comp> trabajo/prev.mp4 --scale=0.4 --gl=swangle`; hoja de contactos; corregir.
7. Render final: `npx remotion render src/index.ts <Comp> ../out/vNN.mp4 --gl=swangle --concurrency=2` (unos 6 min).
8. Exportar: `ffmpeg -i vNN.mp4 -c:v libx264 -preset slow -crf 17 -vf "scale=in_range=full:out_range=tv,format=yuv420p" -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 30 -c:a aac -b:a 192k -ar 48000 -ac 2 -movflags +faststart final.mp4`.
9. Medir LUFS y pico (`ebur128=peak=true`), portada 3:4 (`-ss <t> -vf crop=1080:1440:0:240`), `verificar-fantasmas.ps1` en cada tramo con rebotes, `CREDITOS.md` y `PUBLICACION.md`.
