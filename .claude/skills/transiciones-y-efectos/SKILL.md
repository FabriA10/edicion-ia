---
name: transiciones-y-efectos
description: Transiciones y efectos de imagen en Remotion para videos verticales — zooms en los cortes, el barrido con desenfoque de movimiento, subida, zoom e iris entre escenas, la transición "la luz se prende" (sobreexposición a blanco), el susto (flash, negativos, rojo/cian partido, sacudida), el chasquido con silueta y onda, posts desenfocados detrás, y el desenfoque de b-roll. Usala cuando pidan "una transición", "efecto de corte", "zoom in/zoom out", "algo que dé dopamina", "un efecto de susto", o cuando haya que sumar efectos para que "cada tres segundos pase algo". Cada efecto trae su cuadro por cuadro y qué sonido lleva.
---

# Transiciones y efectos de imagen

Todos son **función del cuadro**: se calculan en Remotion y se aplican a la imagen
entera (los subtítulos y las gráficas quedan afuera, salvo que se diga). El sonido de
cada uno sale de `sonidos-y-efectos`.

Regla general (la del paquete aprobado, `criterio/paquete-efectos-cada-3s.md`):
**cada ~3 s pasa algo**, pero los efectos acompañan a la voz: nunca tapan la frase.

## 1. Zooms en los cortes

La curva es `SALIDA_SUAVE` (sale disparada y se frena). Duran `CUADROS_ZOOM = 45`
cuadros salvo que el zoom diga otra cosa.

| Tipo | De → a | Notas |
|---|---|---|
| **Sale** (zoom out punchado) | 1,30 → 1 (1,35-1,2 según el plano) | arranca justo en el corte |
| **Entra** | 1 → 1,12 (1,08-1,10 si hay poco aire) | **el 1,08 no se nota en el celular** |
| **Hook**: zoom out lento | toda la frase | un solo movimiento, sin curva visible |
| **Zoom lento progresivo** | 1 → 1,10/1,12 a velocidad constante toda la toma | para tomas largas; alterna con tomas quietas |

- Se definen por **tiempo de edición y no por corte** (`Zoom { desde, hasta, de, a }`
  en `src/base/tipos.ts`): así pueden cruzar un empalme invisible.
- **Origen del zoom en la cara**, no en el centro del cuadro: si no, la cara se va.
- **Los zooms los pide quien contrata**: cuatro que entran y cuatro que salen por
  video como referencia. Con el paquete de efectos, los pone el editor en los cortes
  donde cae una idea nueva.
- Ejemplos: `proyectos/10-gancho-susto-tarjetas/src/v4/Efectos3.tsx` (`zoomCorte`,
  con la lista `ZOOMS` en `momentos.ts`), `06-paquete-efectos/src/v4g/Video4cGrafica.tsx`
  (`escalaZoom`), `04-dos-camaras` (zoom por plano).
- **Cuidado con el recorte lateral**: un zoom que empuja la oreja contra x 972 / x 108
  se corta en celulares 20:9 ([encuadre-y-zona-roja.md](../../../criterio/encuadre-y-zona-roja.md)).

## 2. Transiciones entre escenas (animación 2D)

`proyectos/11-animacion-2d-personajes/src/anim/Video.tsx`: la tabla de escenas
(`guion.ts`) dice qué transición lleva cada una. Duran 10 cuadros por defecto y
**el whoosh cae en el medio**.

| Tipo | Qué hace |
|---|---|
| `corte` | seco |
| `barrido` | la escena sale y la nueva entra deslizándose en X (±1080 px) con **desenfoque de movimiento** (`feGaussianBlur stdDeviation = "k·9 0"`, k de 1 a 5 según la velocidad: máximo en el medio) |
| `subida` | igual, en Y (±1920 px), desenfoque en vertical |
| `zoom` | la saliente se agranda (×2,4) y se desvanece; la nueva llega desde 1,35 a 1 (**nunca se ven los bordes**) |
| `iris` | la nueva se abre como `clipPath: circle(…)` desde un punto (x, y) |

Con la curva `SUAVE` del proyecto (la salida suave). Cada escena arranca unos cuadros
**antes** de la palabra que la abre.

## 3. La luz se prende (transición de blanco)

Entre un gancho oscuro y la explicación (`10-.../src/v4/Efectos3.tsx`, `transicion`):

- **8 cuadros antes del corte** (`k = -8…-1`, `u = (k+9)/8`): brillo `1 + 2,4·u^2,2`,
  contraste `1 − 0,35·u`, velo blanco `0,97·u^2,6`, escala `1 + 0,12·u^1,7`, desenfoque
  `9·u²` px, rojo/cian partido `7·u` px.
- **En el corte**, blanco casi total. Después (10 cuadros) sale del blanco con la curva
  de salida suave: velo `0,93(1−p)`, brillo `1+1,5(1−p)`, escala `1+0,1(1−p)`,
  desenfoque `11(1−p)`, split `6(1−p)`.
- **Ahí cae el drop de la música** ([musica-drop.md](../../../criterio/musica-drop.md)).

## 4. El susto

`10-.../src/v2/Efectos.tsx` y, calculado fuera de Remotion, `trabajo/scripts/susto3.py`
(ver [gancho-con-susto.md](../../../criterio/gancho-con-susto.md)). Los cuatro cuadros
del golpe, uno por uno (versión de código; la final es un clip calculado con OpenCV):

1. Blanco 1, zoom 1,45, split 34 px, brillo 1,6, sacudida (16, −10).
2. **Negativo** (`invert(1)`), contraste 1,35, zoom 1,62, split 30.
3. Tinte rojo 0,5 (`mix-blend-mode: multiply`), zoom 1,66, viñeta roja 0,8.
4. Negativo otra vez, contraste 1,2, zoom 1,58.

Después se asienta con la curva de salida suave y sigue acercándose despacio mientras
grita. La sacudida es **determinista por cuadro** (`azar(k)`): el render sale igual
cada vez. **El susto no avisa** (nada que crezca antes del golpe).

- **Rojo/cian partido** (`FiltroSplit`): dos `feColorMatrix` que aíslan el canal rojo
  y el cian, corridos ±dx con `feOffset` y mezclados en modo `screen`.
- Destellos a umbral de 1 bit: **como mucho 3 por segundo** (epilepsia fotosensible).

## 5. El chasquido

`09-reaccion-a-posts/src/v3/Efectos.tsx`: la persona se vuelve una **silueta blanca**,
onda expansiva, flash, y queda la silla vacía. La silueta sale de `trabajo/scripts/silueta.py`
(recorte + `silueta.webm` con canal alfa).

## 6. Posts / b-roll sobre la persona

- **Fondo desenfocado** (blur de la imagen de la persona) con el post encima: aprobado
  como estándar ("está perfecto, lo vamos a seguir usando").
- El post entra **en el corte justo después del "empecemos"** y se queda hasta que
  vuelve a opinar. Ver [reaccion-a-posts.md](../../../criterio/reaccion-a-posts.md).

## 7. Cosas que se aplican a toda la imagen

- **Filtros CSS** en una sola cadena (`filtro(e)`): `url(#split)`, `invert()`,
  `brightness() contrast()`, `blur()`. El SVG de rojo/cian va primero.
- **Velos** (rojo, viñeta, blanco) van **arriba de la imagen y abajo de los subtítulos**.
- `AbsoluteFill` del grade: el filtro de color de la corrección **no** va en el
  contenedor raíz: tiñe también los subtítulos (`edicion-video/references/color.md`).

## Cómo probar un efecto

Sacá cuadros sueltos de la ventana donde ocurre (por ejemplo `k = -8, -4, -1, 0, 1, 4,
10` alrededor del corte) y mirá la secuencia. Un efecto se juzga **cuadro por cuadro**,
no a velocidad normal. Ver la sección "Cómo se prueba" de `motion-graphics`.
