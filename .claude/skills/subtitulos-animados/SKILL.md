---
name: subtitulos-animados
description: Usala cuando Isaias pida subtítulos animados o nombre una animación de texto —"subtítulo animado", "animá esta frase", "metele subtítulos animados de vez en cuando", "Smooth Line Up", "Delayed Up slide" (dictado "the layout up slide")— y siempre que subtitules un video, en Resolve o en Remotion, porque define qué subtítulos van quietos y cuáles se animan. También cuando pase una animación nueva para el catálogo, sea una composición de Fusion o capturas del editor de curvas. Animated subtitles / captions, text animation curves.
---

# Subtítulos animados

Cuáles subtítulos se animan, con qué color y con qué curva exacta.
Las curvas salen de las composiciones de Fusion de Isaias, leídas de la base
del proyecto y verificadas contra Resolve en vivo. El detalle —tablas cuadro por
cuadro, bloques de Fusion, componente de Remotion y cómo leer una animación
nueva— está en `docs/guides/subtitulos-animados-curvas.md`.

## La regla: quietos por defecto

- **Todos los subtítulos van estáticos**: entran y salen al corte, sin fundido
  ni desplazamiento. Esto reemplaza la entrada de 3 cuadros / 14 px que
  llevaban todos.
- **Solo se animan los momentos especiales, y solo cuando Isaias lo pide.** Él
  decide por video si el formato lo amerita y cuántos: *"metele subtítulo
  animado de vez en cuando, dos o tres veces en el video"*. Si lo pide sin
  número, van 2 o 3 en todo el video. Nunca todos.

## Qué frase se anima

La elegís vos. Leé la oración entera y preguntate qué parte carga el tema del
video:

1. **El arranque**: la presentación o el gancho.
2. **La parte importante de la oración**, que suele caer al final del bloque.

El ejemplo de Isaias: la frase es *"Hola, ¿cómo estás? Mi nombre es Isaías y
vivo en Tucumán"* en un video sobre cultura tucumana. Se animan *"hola, soy
isaías"* (el arranque) y *"y vivo en tucumán"* (lo que importa para el tema).
El resto va quieto.

## El color: toda la letra en color de la marca

**Muy importante: lo remarcó dos veces.** El subtítulo animado lleva **la letra
entera** en color de la marca. No es un borde de color sobre letra blanca: es el
relleno.

| Subtítulo | Color |
|---|---|
| Animado | Acento claro `#7F93B0` por defecto, el acento claro de la marca, que se lee sobre oscuro |
| Estático | Claro `#EAECEF`, como siempre |
| Nunca como texto | Acento `#3C527A`, que no llega a contraste |
| Solo sobre fondo claro | Azul marino `#0B1A3B` |

Todo lo demás es igual que en el estático: Hando Bold, una línea, 4 palabras
como máximo, minúscula, sin puntos, a la altura del pecho y con la misma
sombra. Lo único que cambia es la entrada y el color.

## El catálogo

Vienen cuatro; estas son las dos primeras. Se piden por su nombre.

| Nombre | Qué se mueve | Cuadros (30 fps) | Curva en Remotion | Cómo aparece |
|---|---|---|---|---|
| **Smooth Line Up** | la línea entera sube 384 px (Line Offset, 0,2 del alto) | 20 | `Easing.bezier(0.0325, 0.64, 0.2025, 0.974)` | nace cortada por un horizonte blando; en el cuadro 1 ya está entera y sigue subiendo mientras se frena |
| **Delayed Up slide** | cada palabra sube 319 px (Word Offset, 0,166 del alto), escalonada | 18 por palabra | `Easing.bezier(0.0684, 0.9019, 0.2429, 1)` | las palabras entran de a una por una ventana blanda a la altura de la línea |

- Las dos **salen disparadas y se frenan**: en el primer cuadro recorren el 39 %
  y el 44 % del camino. Es la curva de la marca, todavía más brusca.
- **Delayed Up slide escalona 2 cuadros por carácter, contando los espacios**, y
  cada palabra arranca con el retraso de su primera letra: *"y vivo en
  tucumán"* entra en los cuadros 0, 4, 14 y 20.
- **Con voz, cada palabra arranca 3 cuadros antes de sonar.** En Delayed Up
  slide la palabra sube 319 px por una ventana apenas más alta que la letra, así
  que recién asoma al tercer cuadro. Isaias suele hablar más rápido que el
  escalonado de 2 cuadros por carácter. En ese caso cada palabra arranca en su
  propio ataque, medido en la envolvente del audio y no con Whisper, que se
  adelanta hasta 300 ms. Smooth Line Up asoma desde el primer cuadro: va uno
  antes.
- En Resolve hay otras composiciones —*Smooth Word Up*, *Smooth Word Left*,
  *Blur Up slide*— que todavía no explicó. No las uses hasta que las nombre.

### Cuál usar si no la nombra

- Si la nombra, esa.
- Si no, **Smooth Line Up** para el arranque y para los cues cortos. **Delayed
  Up slide** solo si el cue dura lo suficiente para que la última palabra se
  pose: como mínimo `2 × (posición de su primera letra) + 12` cuadros. Con
  *"y vivo en tucumán"* son 2 × 10 + 12 = 32 cuadros.

## Cómo replicarla

**En Remotion**, donde se editan los videos, se usa el componente
`SubtituloAnimado` de la guía, ya probado con render. Tiene tres trampas:

- La máscara (el horizonte o la ventana) va en un contenedor **que no se
  mueve**, y el texto se desliza adentro.
- Poné siempre `maskRepeat: "no-repeat"`: si no, la palabra que todavía está
  abajo reaparece en la copia repetida del degradé.
- El retraso cuenta **caracteres**, no palabras.

**En Resolve**:

- La fuente de verdad son las composiciones **"Smooth Line Up"** y **"Delayed
  Up slide"** del Media Pool del proyecto *video 1 creativo*. Usalas tal cual,
  o pegá el bloque de la guía en el editor de nodos.
- El texto va en el **`Text` del Follower** (`Follower1` o `Follower1_1`), no
  en el `StyledText` del Text+: ese input está conectado al Follower, y
  `set_text_plus` lo pisaría.
- El color va en `Template`: `Red1` / `Green1` / `Blue1` = `0.498` / `0.690` /
  `0.651`.
- Para llevarlo a la altura del pecho, mové **el clip entero** (Inspector →
  Posición Y), no el `Center` del Text+: la máscara tiene que viajar con el
  texto.
- **No la reconstruyas con `fusion_comp add_keyframe`.** El MCP no fija los
  tiradores de Bézier, así que la curva queda con el suavizado de manual, que
  es justo lo que no va.
- *Hando Bold* derecha no está instalada en Windows (solo Regular, Bold
  Oblique y Black Oblique). Instalá `HandoTrial-Bold.otf` antes de usarla en un
  Text+.

## Agregar una animación al catálogo

Cuando pase la próxima, **leé la composición, no la captura**. El procedimiento
(de la base del proyecto al texto de Fusion) y el script están en la guía.
Anotá qué input anima, los dos keyframes con sus tiradores, el recorrido del
Path, el retraso del Follower y las máscaras. Antes de convertirla, validá tu
evaluación contra valores leídos en vivo con `fusion_comp get_input` en tiempos
fraccionarios.

## Errores comunes

| Error | Qué corresponde |
|---|---|
| Dejar la entrada vieja en todos los subtítulos | Los normales van quietos: si todo se mueve, nada se destaca |
| Pintar solo el borde de verde | Va toda la letra |
| Medir la curva a ojo en la captura | Los números exactos están en la composición |
| Leer el `Order = 7` del Follower como "Curva manual" | Es **Automático** (izquierda a derecha): 7 es su valor por defecto |
| Pensar el recorrido en alturas de letra | En Fusion es fracción del cuadro: Y × 1920, X × 1080 |
