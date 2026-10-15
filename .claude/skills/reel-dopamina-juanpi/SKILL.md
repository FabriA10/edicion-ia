---
name: reel-dopamina-juanpi
description: El método aprobado por Juanpi (videos 6 y 7 de Compumaq, octubre 2026) para pasar un crudo de cámara a un reel vertical "dopamínico pero estético y serio" — tomas sin trabas verificadas con dos modelos, encuadres alternados con punch-in, subtítulos de 1 a 3 palabras con slide up y aparición suave, tarjetas/contadores/barridos/mosaico, sonidos virales no saturados, cierre con la cuenta de Instagram. Usala cuando Juanpi pase un crudo y pida "editá este video", "hacelo dopamínico", "como el anterior", o para cualquier video de Compumaq. Complementa a edicion-video (que sigue valiendo para medir bordes, color y audio).
---

# Reel dopamínico (el método de Juanpi)

Aprobado por Juanpi el 04/10/2026 con la v04 del video 7 (*"perfecto, como lo
hiciste ahora"*). Las correcciones que llevaron hasta acá, textuales, están en
`criterio/juanpi-compumaq.md`: leelo antes de empezar.

**Plantilla:** `proyectos/13-compumaq-video7/` (lista de tips) y
`proyectos/12-compumaq-video6/` (ranking con gráfico de pantalla partida). Se copia
la que más se parezca, sin `node_modules`, `public`, `out` ni `trabajo`, y se
enlaza `node_modules` con una junction al de `01-base-talking-head`.

**Cómo hablarle a Juanpi:** mensajes cortos. Pidió explícitamente que no le
expliques todo para no gastar tokens. Al entregar: qué cambió, qué asumiste y qué
tiene que revisar, en pocas líneas.

## 1. Material (usar la placa de video)

```powershell
ffmpeg -i crudo.mov -vn -ac 1 -ar 16000 -c:a pcm_s16le trabajo/v01/mic16.wav
ffmpeg -i crudo.mov -vn -ac 2 -ar 48000 -c:a pcm_s16le trabajo/v01/voz48.wav
ffmpeg -hwaccel cuda -i crudo.mov -vf "scale=1080:1920:flags=lanczos,format=yuv420p" -c:v h264_nvenc -preset p5 -cq 21 -g 30 -c:a aac public/crudo-NN.mp4
```

Después, `pasadas.mjs` y `menu.py` de `edicion-video` (en segundo plano). Si el
gancho promete un número ("15 cosas"), contá los ítems reales y avisá si no coincide.

## 2. Elegir las tomas: ninguna frase mal dicha

Es lo que más correcciones costó. La regla es de Juanpi: *"siempre que cortes los
clips, fijate de que sea el clip que no repita o diga la frase bien, o hacé bien los
recortes para que la frase no quede mal"*.

1. Por cada bloque del guion, la **última toma completa** del menú.
2. Transcribí las candidatas con **medium y tiempos por palabra** (para los
   subtítulos), con un `initial_prompt` con los términos técnicos del video.
3. **Revisá cada bloque elegido con `small`, sin condicionar.** Medium "limpia" las
   trabas y las esconde; small las escribe ("comotadra", "es decir" pegado, "esto…
   es…"). Señales de alarma:
   - una palabra que small no reconoce o escribe rara;
   - **huecos de más de 0,4 s entre dos palabras** (ahí hay un titubeo o un falso arranque);
   - repeticiones ("activá el plan de energía, activá el plan…", "es una bomba, es una…");
   - un "ee"/"eh" antes de la primera palabra;
   - la frase que se cierra mal ("prendida" que se oye "por la vida"): se termina antes.
4. Cómo se arregla, en este orden:
   - **otra toma** de la misma tanda que lo diga limpio;
   - **entrar en un valle** que saltee la traba: `python scripts/buscar.py a b fin`
     lista los valles de la envolvente en [a, b] y qué se escucha desde cada uno
     (small). Elegí el primero que arranca exacto en la palabra buena;
   - **recortar el final** si la última parte sale mal;
   - **empalmar dos tomas** sólo si no queda otra: probá una grilla de puntos de a 20 ms
     con `acrossfade` de 15 ms y quedate con el que medium y small escuchan bien.
     Ojo: un empalme puede traer una toma donde él **mira la compu** y Juanpi lo
     rechazó (*"no queda profesional"*). Primero, mirá a dónde mira.
5. `revisar-bloques.mjs` (de `edicion-video`) va igual. Sus avisos en las entradas que
   saltean una traba a propósito se verifican transcribiendo, no se obedecen a ciegas.

## 3. El generador

`trabajo/v01/generar.py` (en el 13 se arma con `armar_generador.py` a partir de
`bloques07.py` + `cola07.py`). Cada bloque: `p` (pasadas), `w` (rango de palabras),
`inicio`/`fin` (bordes a mano, medidos y verificados), `e` (encuadre), `tip`/`cierre`.

- **Encuadres** (sin aire arriba): abierto `A`, cerrado `C` (punch-in), y para los
  bloques con tarjeta arriba `T`/`T2` alternados (bajan la cabeza para dejar libre la
  franja de 260 a 480). Se miden en cada crudo según dónde quedó la cabeza.
- **Salidas con aire** (pedido del 05/10): a la cola medida se le suman 0,18 s, sin
  llegar a 90 ms del arranque de la voz siguiente (en `armar_generador.py` del 14).
  Los empalmes (`empalme=True`) no se estiran.
- **Encuadre `G`** para bloques con sello, chips, flecha o ventana: baja la cabeza a
  y≈700 para que la gráfica (desde y≈255) no la pise. Nunca gráfica arriba de 250.
- **Sin mosaico** entre el gancho y el primer ítem: Juanpi lo sacó; va el barrido.
- **Zooms**: en `C` entra 1 → 1,12; en `A` sale 1,25 → 1; en `T` uno lento de toda la
  frase hasta 1,06. Curva `SALIDA_SUAVE`.
- **Bloques con `inicio` a mano: re-transcribir el tramo exacto** (medium, con
  palabras) y usar esas palabras. Si no, el subtítulo arrastra texto que quedó
  afuera del corte ("estar ese activá") o alucinaciones de Whisper ("Subtítulos por
  la comunidad de Amara"). Script: `proyectos/14-compumaq-video8/trabajo/v01/palabras_recortes.py`.
  Filtrá siempre las palabras con "subtítulos/amara/comunidad".
- Si Whisper estira una palabra más de 0,8 s, **no** se reparte por sílabas (corría el
  bloque entero): se acorta sólo esa palabra y se controla con `verificar_subs.py`.
- Números en cifra ("15", "6000", "15%"), siglas en mayúscula (XMP, BIOS), voseo
  ("sacá", "activá"); el subtítulo dice literal lo que se oye.

## 4. Lo visual (el estilo aprobado)

- **Marca**: azul medio oscuro (`src/base/marca.ts`: fondo `#0A1440`, acento `#2E44C8`,
  acento claro `#8C9DFF`).
- **Subtítulos** (`src/v06/Subtitulos06.tsx`): 1 a 3 palabras, Hando Bold, blanco con
  contorno grueso azul oscuro, al 70 % del alto. La palabra clave va en una **caja
  azul** que se despliega de izquierda a derecha. Animación: **la línea aparece suave**
  (fundido + escala 0,94 → 1, curva Smooth Line Up, 9 cuadros) y **cada palabra hace
  slide up** escalonada 2 cuadros con desenfoque que se aclara (Delayed Up slide, 10
  cuadros).
- **Gancho**: título de dos/tres líneas arriba de la cabeza, la última en neón.
- **Lista de tips** (`src/v07/Tip07.tsx`, `Iconos07.tsx`): tarjeta con ícono animado
  inventado en vidrio azul, `#01` en neón, título en mayúscula y barra de progreso.
- **Barrido con desenfoque** en la entrada de cada tip y **mosaico 3×3** del video
  entre el gancho y el primer ítem (`Compumaq07.tsx`).
- **Contadores** cuando hay cifras que cambian (4800 → 6000), sellos rojo/verde para
  veredictos, chips flotantes, gráfico en pantalla partida para comparaciones
  (`12-compumaq-video6/src/v06/`).
- **Formato veredicto** (video 8, `proyectos/14-compumaq-video8/src/v08/`): título del
  tema en dos tonos + botones Inversión/Gasto/Plata tirada y un cursor que hace clic;
  ventana de interfaz con cursor (`Clic`), anotación con flecha de costado hacia un
  chanchito (`Anotacion` con `icono`), onda de audio bajo el título del gancho.
- **Voz de los títulos**: `python -m edge_tts --voice es-AR-TomasNeural --rate=+8%`,
  `silenceremove` + `loudnorm` a −14,5, sobre el silencio previo al veredicto.
- **Cierre**: tarjeta con el logo de Instagram y **@compumaqtucuman** escribiéndose
  letra por letra, y el botón "+ Seguir" que se aprieta y pasa a "✓ Siguiendo". El
  último bloque se estira lo justo para leerlo, sin mostrarlo levantándose.
- Que ninguna gráfica quede encima de otra (cortar la anterior cuando entra la nueva).

### Tanda 3: lo aprobado + piezas de las referencias (06/10/2026)

Pedido: *"quiero que innoves a base de todo lo que te pasé, motion graphics, animaciones,
sonidos, todo"*. Se mantuvo la base aprobada (subtítulos slide up, azul de la marca,
encuadres alternados, cierre de Instagram) y se sumaron piezas de `estilos-de-referencia`.
Todo en `proyectos/19-compumaq-t3v1/src/t3v1/Graficas.tsx`, listo para reusar:

| Pieza | De dónde | Cuándo |
|---|---|---|
| `TituloBrillo` | devinjatho | 2-3 frases fuertes por video ("TENEMOS QUE HABLAR", "NO TE CONVIENE"): mayúscula, la palabra clave en rojo con brillo, palabra por palabra; ahí se callan los subtítulos |
| `Flash` | devinjatho / lewisdang | rojo en el aviso, blanco de 2 cuadros entre ideas |
| `ChipVidrio` | lewisdang | chips de vidrio con sticker, en escalera, tachados en rojo o tildados en verde |
| `Partido` | formato partido | una idea que se enseña: lienzo blanco arriba, la cara abajo (encuadre con `dy`) |
| `Billetes` | devinjatho | plata que se gasta: billetes que vuelan hacia la cámara |
| `Carrusel` | devinjatho | ejemplos que se nombran (juegos): la fila se corre, la activa con borde dorado |
| `Cubo` | devinjatho | "te lo voy a decir": cubo "?" que gira y se enciende arriba de la cabeza |
| `Fichas` | lewisdang | lista de componentes: tarjeta grande por componente + tira de 5 que se tildan |
| `Usos`, `Recuadro`, `Repaso` | lewisdang | stickers 2×2, recuadro punteado que se dibuja, repaso con tildes |
| `Compartir` | devinjatho (Instagram simulado) | CTA "compartile a tu amigo": hoja de compartir, cursor, "Enviado ✓" |

Tamaños que funcionan en el celular (después de revisar los cuadros): chips de 46 px,
valores de la ficha de 66 px, carrusel de 260×360, regla del partido de 840 px.
Música: el **drop** de biscuit en el corte del gancho a la respuesta (`audio.py` del 19,
`criterio/musica-drop.md`). Whisper ahora corre en la placa (`scripts/gpu.py`).

## 5. Sonido (no saturado, "viral")

Niveles ya aprobados (dB relativos sobre el archivo, `desde` salta el silencio inicial):

| Evento | Sonido | dB |
|---|---|---|
| arranque del gancho | `Deep Whoosh.mp3` | −17 |
| tarjeta de ranking | `whoosh hit.mp3` (0,27 s antes) | −16 |
| barrido de tip | `carpeta nueva de sonidos/whoosh 2.mp3` (0,18 s antes) + `Bloop 1.mp3` | −16 / −20 |
| palabra clave del subtítulo | `pop up 1.mp3` (desde 0,16, 0,22 s) | −21 |
| sello verde | `Correct Sound.mp3` (desde 0,26) | −18 |
| sello rojo | `Negative Error.wav` | −19 |
| chip | `Ui clicks/KF - UI Click - 3.mp3` | −18 |
| cambio de plano | `carpeta nueva de sonidos/click [short].mp3` (nunca un whoosh: *"no me gusta"*) | −22 |
| contador | `count [all layers].mp3` | −19 |
| cuenta de Instagram | `Pop up 4.mp3` + `text [layer4, short].mp3` | −17 / −22 |

Música del kit a −17 dB, agachada por la voz (`sidechaincompress`), con un tema
distinto en cada video. Si Juanpi pasa el MP3 de un tema que recomienda, se usa ese;
no se bajan canciones comerciales.

## 6. Audio, render y entrega

1. `trabajo/v01/audio.py`: cortes por cuadro con fundidos de 4 ms, EQ del micrófono
   chico, ganancia a −14,5 LUFS, limitador, efectos y cama. Medí: −14,5 ± 0,2 LUFS y
   pico bajo −1 dBTP.
2. `npx remotion render <Comp> out/vNN-video.mp4 --muted --gl=angle --timeout=120000
   --concurrency=6`, y se le pega `mezcla.wav` con ffmpeg (`-c:v copy`).
   **Temporales en el F:, nunca en C:.** Remotion copia todo `public/` a
   `%TEMP%\remotion-*-assets*` en cada render y en cada `still`, y no lo borra: el
   05/10/2026 llenó el C: (20 GB, 0,3 GB libres) y el render falló. Antes de renderizar:
   `$env:TEMP="F:\edicion con ia\tmp"; $env:TMP=$env:TEMP`, y al terminar se borran las
   carpetas `remotion-*` y `react-motion-*` de ahí. Para revisar gráficas, no sacar
   cuadros sueltos con `still` (cada uno copia el crudo entero): renderizar y mirar el mp4.
3. Antes de mandar: **`python scripts/verificar.py trabajo/v01/mezcla.wav`**
   (small + medium + barrido de repeticiones) y **`python scripts/arranques.py
   trabajo/v01`** (el comienzo de cada bloque escuchado aparte: un falso arranque
   pegado como "no es… no es la más cara" o un "ahem" no aparece transcribiendo la
   frase entera), **`python scripts/verificar_subs.py src/<carpeta>/datos.ts
   trabajo/v01/mezcla.wav "<prompt con modelos y números>"`** (cada subtítulo contra
   la voz del render: tiene que dar **0 para revisar**; si marca algo, medí los
   arranques en la envolvente y fijalos a mano en `palabras_a_mano.py`), cuadros de
   prueba de las gráficas nuevas, loudnorm sobre el mp4, y sonar la alarma.
   - **No repartir por sílabas** (06/10/2026, tanda 3: *"los subtítulos van a
     destiempo de nuevo… buscá una forma de siempre revisar o corroborar que los
     subtítulos están correctos"*). Cuando Whisper estira una palabra ("1660",
     "5060", "14400F"), el reparto corría el bloque entero hasta 1 s. El generador
     del 19 (`armar_generador.py`) usa los arranques reales y sólo acorta la palabra
     estirada; copiá eso en los proyectos nuevos.
4. Copiá el mp4 a la raíz de la carpeta como `compumaq-vNN-vMM.mp4` y mandalo.
5. Cada corrección nueva de Juanpi: aplicá **sólo lo marcado** y anotala textual en
   `criterio/juanpi-compumaq.md`.
