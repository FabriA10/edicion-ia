# Subtítulos

## Las reglas, ya fijas

| Qué | Cómo |
|---|---|
| Tipografía | **Hando Bold** (`HandoTrial-Bold.otf`). Archivo queda para carruseles |
| Líneas | **Una sola, siempre.** Si no entra, se achica el cuerpo, no se parte |
| Palabras | **4 como máximo**, y además el ancho manda (ver abajo) |
| Mayúsculas | **Ninguna.** Ni la primera letra del cue |
| Puntos | **Ninguno.** Las comas pueden quedar |
| Posición | Altura del pecho del encuadre, ~73% del alto |
| Cuerpo | Grande — se puede porque son pocas palabras. Tope ~88 px |
| Color | Claro (`#EAECEF`) |
| Sombra | `0 4px 24px tinta_cc, 0 2px 6px tinta_99` |
| Animación | **Ninguna**: entran y salen al corte (desde el 2026-09-23) |

## Subtítulos animados

Solo se animan los momentos especiales —el arranque del video y la frase que
carga el tema de la oración— y **solo cuando Isaias lo pide** ("metele subtítulo
animado de vez en cuando, dos o tres veces"). Esos llevan **toda la letra en
color de la marca** (Acento claro por defecto), nunca un borde de color, y una
animación del catálogo: *Smooth Line Up* o *Delayed Up slide*.

El criterio, las curvas exactas y el componente `SubtituloAnimado` (probado con
render) están en la skill `subtitulos-animados` de esta carpeta y en
`docs/guides/subtitulos-animados-curvas.md`. El componente listo para usar está en
`proyectos/02-motion-graphic-neon/src/SubtituloAnimado.tsx`.

Ojo: `Subtitulos.tsx` todavía trae la entrada vieja (opacidad en 3 cuadros y
14 px en 6). En el próximo video hay que sacársela al estático.

## Plano sentado contra la pared verde: arriba y apagados en la gráfica

En el video 4c (sentado, pared verde, mucho aire arriba de la cabeza) Isaias
los mandó **arriba, en el medio**: marcó con rojo sobre una captura del celular
la zona de y≈350 a 750 y dijo *"donde te marqué ahí van los subtítulos"*. El
centro quedó en y=550. Y **no van donde hay motion graphic, íconos o gráfica
detrás de él**: esos tramos se sacan de la lista antes de repartir (y las
palabras que Whisper pone justo antes de un tramo, pero que se dicen adentro,
también).

Sobre esa pared, **el animado en Acento claro no se lee** (verde claro sobre verde
claro). Va en Azul marino, que la skill `subtitulos-animados` reserva justamente
para fondo claro.

Los animados llevan sonido cuando él lo pide: un *whoosh* sintetizado que llega
cuando la letra se posa y un golpecito por palabra en los Delayed Up slide
(`scratchpad/v4g/sfx4c.py`). La pista se mezcla **después** de la ganancia de la
voz y antes del limitador: la voz sube ~19 dB para llegar a −14,5 LUFS y los
sonidos no tienen que subir con ella.

## Sincronía en la práctica (video 4c)

- **Transcribí bloque por bloque**, no el montaje entero: sobre el montaje,
  Whisper adelantaba hasta 250 ms las palabras que abren bloque y las pegaba al
  subtítulo anterior ("del lado profesional y").
- Adentro de cada frase, **anclá el mapa lineal en las pausas reales** medidas
  en la envolvente (≥ 120 ms cerca del piso), no sólo en el principio y el final
  de la frase: una pausa de 320 ms adentro de "con ese reel, … le guste ver"
  corría el subtítulo de después 0,45 s.
- Los arranques después de una pausa de verdad (subida de 15 dB o más) son las
  anclas que no fallan; los de mitad de frase, sólo si hay un ataque a menos de
  80 ms.

## Lo que manda es el ancho, no la cantidad de palabras

Contar palabras no alcanza. "ni una" y "muchas agencias te recomiendan," son las dos
de cuatro palabras o menos, pero la segunda ocupa el doble de ancho: `fitText` la
achica para que entre y el cuerpo se cae, además de que **adelanta lo que todavía no
dijo**. Eso último es lo peor: el espectador lee la frase entera antes de escucharla
y se le va la sorpresa.

La corrección de Isaias, textual: *"podría llegar hasta muchas agencias. Corta. Te
recomiendan. Y ahí corta y sigue el siguiente"*.

Así que la repartición mide el **ancho estimado en em** — la suma del avance de cada
letra como fracción del cuerpo, con las angostas (`i l í j t f r . ,`) contando 0,32,
las anchas (`m w M W`) 0,9, el espacio 0,26 y el resto 0,55. Con 1080 px de lienzo,
50 de margen a cada lado y 88 px de cuerpo máximo entran unos **11 em** antes de que
haya que achicar.

En la repartición: **10,4 em de umbral cómodo** (arriba de ahí suma costo) y **13,2
de tope duro** (arriba de ahí la línea ni se considera).

Ese presupuesto es del formato normal, con el subtítulo centrado en el lienzo. Si
la pieza tiene gráfica en una franja —el formato ranking, por ejemplo— la caja del
subtítulo se achica y los dos números bajan con ella: con 726 px de caja son 7,4 y
9,6 em. Recalculalos, no los copies.

## Ningún subtítulo abajo de un cuarto de segundo

La repartición por costo, si la dejás sola, prefiere dejar una palabra suelta 5
cuadros en pantalla antes que cerrar una línea en una preposición. Y 150 ms es un
parpadeo: no se lee, se ve un destello.

Hace falta **un piso duro**: una línea que dure menos de 0,25 s directamente no se
considera, y abajo de 0,5 s paga costo creciente. Con el piso puesto, el repartidor
elige solo la partición sensata —"para tu" / "clínica dental" en vez de "para tu
clínica" / "dental"— y la preposición colgando deja de ser el mal menor.

Cuidado también con las líneas que caen a los dos lados de un empalme: el
repartidor trabaja bloque por bloque y no puede juntarlas. Una pasada final que
una dos cues corridas cuando la primera es un pedacito suelto arregla el caso
—"muy" en un bloque y "bueno" en el siguiente son un solo subtítulo—.

## Una sola línea siempre

Para garantizarlo sin que el texto se salga del cuadro, medí el ancho real con
`fitText` de `@remotion/layout-utils` y usá el menor entre el tope y lo que entre:

```tsx
const { fontSize } = fitText({
  text: cue.texto,
  withinWidth: width - MARGEN * 2,
  fontFamily: FUENTE_SUBTITULO,
  fontWeight: "700",
  letterSpacing: "-0.5px",
});
const cuerpo = Math.min(88, fontSize);
```

Con `whiteSpace: "nowrap"` el texto nunca se parte, y como el cuerpo se ajusta,
nunca se desborda.

## Dónde cortar cada línea

Repartir "de a 4 palabras" a lo bruto deja líneas feas: preposiciones y artículos
colgando al final, o un cue suelto de una palabra.

Lo que funciona es elegir los cortes minimizando un costo, con programación
dinámica sobre cada frase:

- **Penalización fuerte (+6)** si la línea termina en palabra que no puede cerrar:
  preposiciones, artículos, conjunciones, posesivos, demostrativos.
- **Premio (−1,5)** si la línea termina donde ya hay coma o punto: son quiebres que
  el oído ya espera.
- **Costo base** = distancia al tamaño ideal (3 palabras).
- Líneas de 1 palabra sólo si la frase entera es una palabra.

La lista de palabras que no cierran línea:

```
a, al, como, con, cuando, de, del, desde, el, en, entre, esa, esas, ese, esos,
esta, estas, este, hasta, la, las, lo, los, más, mi, mis, mismo, muy, ni, o,
para, por, que, si, sin, sobre, su, sus, tu, tus, un, una, y
```

Antes de repartir, cortá la frase en oraciones (por punto) y, si una oración sigue
siendo larga, también en comas.

## Sincronía: no confíes en Whisper

Los tiempos por palabra de Whisper **derivan hasta 0,6 segundos** contra el audio
real, y la deriva no es constante: cambia por región del archivo.

La solución que funciona es un mapa lineal por bloque. Para cada bloque conocés:

- `ventana`: dónde están las palabras en la transcripción de Whisper
- `onset` / `fin`: dónde empieza y termina el habla de verdad, medido con la
  envolvente

Entonces:

```js
const real = (t) => onset + ((t - primeraPalabra) * (fin - onset)) / (ultimaPalabra - primeraPalabra);
```

Cada bloque se corrige por separado, así la deriva local no se arrastra.

## Correcciones de transcripción

Whisper escucha mal cosas previsibles en este material. Conviene corregirlas
**palabra por palabra**, no por frase: si la corrección es una frase y el corte de
línea la parte al medio, la corrección no aplica.

Las que ya aparecieron:

| Whisper escuchó | Es |
|---|---|
| ingenio vocal | higiene bucal |
| contó | contá |
| seguidnos | seguinos |
| tenes | tenés |
| quieres | querés |

Isaias habla en rioplatense; Whisper tiende a "neutralizar" los voseos. Revisá
siempre las formas verbales de segunda persona.

## Apagar los subtítulos

Cuando una imagen ocupa la franja donde iría el subtítulo, apagalo en ese tramo.
Compiten por el mismo espacio y gana la imagen. Se resuelve pasando un rango al
componente:

```tsx
if (apagadoEn && t >= apagadoEn.desde && t < apagadoEn.hasta) return null;
```
