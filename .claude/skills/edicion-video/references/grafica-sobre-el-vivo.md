# Gráfica sobre el vivo: detrás de él, íconos, pantallas 3D y recortes

Todo esto salió del video 4c (análisis de The Bentist, 25/09/2026), el primero
donde Isaias pidió gráfica de todos los tipos en un mismo video: dos tramos con
gráfica detrás de él, dos filas de íconos y cuatro motion graphics a cuadro
completo. El código está en `06-paquete-efectos/src/v4g/`.

**Ojo con "dos motion graphics por video"** (`movimiento.md`): esa regla es
para cuando no dice nada. Cuando él marca momento por momento qué quiere, se
hace todo lo que marcó.

## Gráfica detrás de él (pared verde)

El orden de capas: el video con el grade → la gráfica → él recortado, con el
**mismo** grade → lo demás. Él recortado va **exactamente encima** del video
original, así que fuera de la gráfica no se nota nada.

La clave es la de `columnas.md` (exceso de verde `G − max(R,B)`), pero se mide
en cada crudo. En el 4c:

| | exceso de verde |
|---|---|
| sujeto | pecho máx 17, cara máx 8, el grueso entre −10 y 14 |
| pared | mín 46 arriba, 53 a los costados, el grueso entre 50 y 75 |

Rampa 24–40. Se recorta sólo el tramo que hace falta (`clave4c.py <nombre>
<desde> <hasta>` → `public/frente-4c-<nombre>.webm`, VP8 con alfa).

**El despill va SÓLO en la franja del borde** (13 px alrededor del alfa < 1).
Como la capa recortada tapa al video original, si se le aplica a todo el cuerpo
el pelo y la piel cambian de color justo en los tramos con gráfica y se nota el
salto contra el resto del video. Con la franja, el interior queda igual al
original (diferencia media 1,7 niveles: el ruido del VP8).

Para que se lea que está **detrás**, la gráfica tiene que bajar hasta la cabeza
y que el pelo le tape un borde. Medí primero hasta dónde sube el sujeto en el
tramo (en el 4c, y=852–872 en el tercio del medio) y apoyá la tarjeta unos 70 px
por debajo de eso. Una sombra borrosa sobre la pared y un reflejo de color la
despegan: sin eso parece pegada encima del video.

## Íconos "en formato revelación"

El de "tres ejes" del reel 1: círculos que aparecen trabados con candado y
borrosos, y se destraban de izquierda a derecha cuando él nombra cada uno. En
`v4g/Insignias.tsx`, con una fila que puede reacomodarse (tres que se corren
para hacerle lugar a una cuarta).

- **No copies el título.** Mandó "tres ejes" de ejemplo y dijo textual *"no
  pongas tres ejes… siempre te lo tomás literal"*. Se copia el mecanismo.
- Van en el aire de la pared, **arriba de la cabeza**: medí el tope del sujeto
  en todo el tramo antes de fijar la altura.
- La primera versión (círculos de 160, etiquetas de 30) se veía chica en el
  vertical. Quedaron en 200 / 36 px con tres, 172 / 33 con cuatro.

## Motion graphics a cuadro completo

El lenguaje es el de `movimiento.md` (neón sobre el fondo oscuro de la marca, un solo mundo con
cámara que viaja). El mundo con la cámara quedó reutilizable en `v4g/Mundo.tsx`.

- **Entran y salen en los bordes de bloque siempre que se pueda.** El salto del
  corte queda escondido en la transición en vez de sumar uno más.
- Los que arrancan a mitad de bloque suben desde abajo en 10 cuadros con la
  curva de la marca.
- **El desenfoque de CSS vuelve transparentes los bordes.** Un motion con
  `filter: blur()` de entrada dejaba ver una línea verde del vivo en el borde
  del cuadro. El fondo opaco va en una capa aparte, sin desenfoque.
- **Una función de transición con `clamp` sigue valiendo después de que
  terminó.** El empujón de la tarjeta al motion devolvía escala 1,9 y blur 14
  para TODOS los cuadros posteriores, porque el `interpolate` quedaba clavado en
  1. El motion lo tapaba y recién se vio en el tramo siguiente. Toda función de
  transición tiene que devolver identidad fuera de su tramo.

### Pantalla inclinada 3D

La referencia que mandó ("IMAGEN 3D") no son tarjetas flotando: es una pantalla
**más grande que el cuadro**, con el borde cercano enorme y el lejano fugando, y
que nunca está quieta. La primera versión (escala 1, 20–25° de giro) se leía
como una tarjeta chica. Lo que la vende:

- escala 0,9–1,34 sobre una captura de 1904 px, `rotateY` 30–36°, `rotateX`
  17–22°, `rotateZ` ±7–10°;
- la cámara se le acerca (`translateZ` +160 a +220) mientras se lee;
- dos o tres pantallas fantasma lejos, oscuras y fuera de foco, para que haya
  profundidad;
- un barrido de luz que la cruza una vez cuando llega.

Las capturas de OBS se recortan al contenido: sin la barra de pestañas (ahí
aparecen sus otras pestañas: Drive, el tablero, documentos) ni la de tareas. La
barra del navegador se redibuja en vectores con la URL.

## Recortar a una persona de una foto

Para una foto de estudio con fondo blanco (`scratchpad/v4g/recorte_bentist.py`):
GrabCut sembrado con fondo seguro (lo casi blanco pegado a los bordes) y frente
seguro (lo oscuro del centro), después borde suave con `α = |I − B| / |F − B|`
en una franja de 5 px, y **des-mezcla del blanco**: `F = (I − (1−α)·B) / α`.
Sin la des-mezcla, sobre el fondo oscuro queda un contorno blanco alrededor del pelo.

## Tiempos

Whisper `medium` con palabras sobre el montaje y las anclas corregidas contra la
envolvente (`ataques.py`). Donde no hay valle —palabra pegada a la anterior— se
lee la envolvente a mano: "9" arrancaba con la nasal 70 ms antes de lo que decía
Whisper, y "encuentra" estaba 220 ms más tarde (Whisper la ponía en medio de
"marke-**ting**").

## Cuadros sueltos sin llenar el disco

`remotion still` vuelve a empaquetar en cada llamada. El script
`06-paquete-efectos/stills-v4g.mjs` hace un solo bundle y todos los cuadros
con `renderStill`. **Pero cada `renderStill` deja en `%TEMP%` una carpeta
`remotion-v4.0.525-assets*` de ~90 MB, y el bundle otra de ~160 MB, y nadie las
borra.** 54 cuadros llenaron el disco C: hasta 0 bytes libres y el siguiente
bundle falló copiando `public/`. El script ahora borra al final las que creó esa
misma corrida (y sólo esas: por fecha de creación).

## Pared celeste: la clave por distancia, no por exceso de verde (29/09)

En el crudo del 29/09 la pared arriba es **celeste grisácea**: el exceso de verde
da 13 ahí, lo mismo que la remera blanca, y la clave del 4c se come el cuerpo. Lo
que funcionó (`08-collage-columna-izquierda/trabajo/scripts/clave/`):

1. `modelo_pared.py`: un polinomio de color de la pared por posición, ajustado
   sobre píxeles que seguro son pared.
2. `placa.py`: mediana temporal del tramo = placa limpia. Se usa **sólo donde la
   placa se parece al modelo** (distancia < 45): trae la luz real de cada punto.
   Donde no (la silla, el escritorio, él si casi no se mueve) manda el modelo, así
   la silla y el escritorio quedan.
3. El alfa es la distancia de cada píxel a "lo que hay detrás", rampa 22-45.
4. El enchufe de la pared: referencia propia (`enchufe.py`) y regla de color crema
   **sólo en su rectángulo**: forzar la placa ahí agujereaba la cara.
5. Islas sueltas < 2500 px afuera (después de erosionar), des-mezcla del borde
   `F = (I − (1−a)·P) / a` y despill suave, porque atrás va otra imagen.

## Hook con collage detrás (29/09)

Referencia de Isaias: britt / menzi.media, la persona recortada delante de un
collage de fotos del rubro en los primeros segundos, sin subtítulos (*"lo que
resalta es lo que está atrás"*). En `08-collage-columna-izquierda/src/v2/Hook.tsx`:

- El collage se parte **por sus fotos** (polígonos medidos sobre la imagen con
  bordes rectos: fracción de filas/columnas con salto > 18), no en grilla: cada
  foto se asienta al entrar y vuela entera al estallar.
- **Fondo oscuro detrás de las fotos** mientras se asientan: sin eso las
  junturas del primer cuadro muestran la pared verde.
- Estalla alrededor de él 9 cuadros antes del corte a la parte 2 y termina de
  irse por encima de la escena normal; whoosh + golpe grave en el corte.
- Trampa: el preflight de Tailwind (`index.css`) les pone `max-width: 100%` a las
  `<Img>`. Una imagen de 1080 adentro de un pedazo de 300 px se achica al ancho
  del pedazo y el collage sale vacío. `maxWidth: "none"` en el estilo.

## Columna de íconos y subtítulos (29/09)

Cuando marca una franja libre al costado (x 30-355 en el plano sentado), van ahí
las dos cosas: **tarjetas de íconos arriba** (centro y 820) y **el subtítulo
abajo** (y 1004, caja de 325 px, cuerpo 52-88). Código en `src/v2/Zona.tsx` y
`Subtitulos.tsx`.

- La tarjeta dibujada a 176 px quedaba chica al lado del subtítulo de 88: se
  agranda entera ×1,34 (236 px) sin redibujar los glifos.
- Pidió *"no hagas los íconos que venías haciendo, mejoralos, hacé algo más
  animado"*: cada tarjeta tiene su **mecanismo** que sigue la frase —la dona que se
  llena porción por porción con cada porcentaje, el contador que salta 2 → 4 → 1
  por día llenando la semana, la balanza que se inclina, el trofeo que se tilda
  con "maestro", el botón que pasa a "siguiendo" con el dedo—, no un dibujo
  quieto.
- Un pop por tarjeta que entra y un tic en cada cambio (sfx-v2.py).
- El motion graphic le puede pasar la posta a la columna: en "3 formas" el
  anillo vuela a la tarjeta y la dona se asienta ahí en el cuadro siguiente.
