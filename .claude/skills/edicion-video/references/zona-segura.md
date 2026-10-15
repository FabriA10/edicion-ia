# Zona segura del vertical

## Los límites

Sobre el lienzo de 1080×1920:

```
arriba     250 px
abajo     1500 px   (o sea, 420 px de margen desde el borde inferior)
costados   110 px   (antes 70: no alcanza, ver abajo)
```

**Los costados son 120, no 70 (30/09).** En los celulares 20:9 (casi todos los
Android) Instagram llena la pantalla a lo alto y **recorta ~108 px de cada
costado** del video; en los iPhone 19,5:9, ~96. Isaias lo vio al subir el reel del
29/09: la columna de subtítulos arrancaba en x 30 y *"no llega a la pantalla"*.
Todo lo que se tiene que leer va de x 110 a 970 (él mismo marcó el borde
izquierdo en ~110 al pedir la columna "un pelín para la izquierda" desde 130), y la cara también tiene que quedar
adentro de 108-972: si un zoom o un encuadre más cerrado lo empuja contra el borde,
en esos celulares se le corta la oreja. Para mirarlo, dibujá líneas en x 108 y 972
sobre los cuadros de prueba.

Afuera de eso la interfaz de la app tapa el contenido: arriba el header, abajo el
copy, el usuario y el audio, y a la derecha la columna de like, comentario y
compartir.

En el proyecto están en `src/base/zonaSegura.ts`. Usá las constantes, no números
sueltos: si mañana cambia el criterio, cambia en un solo lugar.

## La columna de la derecha

Instagram pone los botones en una franja de unos 200 px sobre el lado derecho. Para
las piezas de Isaias **esa franja se ignora a propósito**: lo que manda son los
bordes de arriba, abajo y los costados.

El motivo es práctico: respetar también la columna derecha deja un área usable tan
angosta que no entran dos tarjetas lado a lado. Como las fotos son gráficas y no
texto, que un botón tape una esquina no rompe nada.

Si alguna vez hay **texto importante** del lado derecho, ahí sí conviene respetarla.

## Dónde poner las cosas

No hay una posición fija. Lo que hay es un criterio: **buscá la franja con espacio
libre que además caiga entera dentro de la zona segura.**

En un plano medio de busto como el de Isaias, las franjas son:

| Franja | Alto aprox. | Sirve para |
|---|---|---|
| Arriba de la cabeza | 250-480 | Títulos, si el encuadre deja aire |
| La cara | 480-1100 | No tapar nunca |
| Entre el mentón y los subtítulos | 1100-1400 | **La mejor para fotos y tarjetas** |
| Línea de subtítulos | ~1400-1500 | Subtítulos |
| Abajo de 1500 | — | Nada. Acá va la interfaz |

La franja del pecho es la buena porque hay espacio real (el polar es plano y
uniforme), está lejos de los bordes, y cae completa dentro de la zona segura.

## Dos errores que ya cometimos

**Poner las tarjetas abajo de los subtítulos** (1520-1820). Se ven perfectas en el
render y desaparecen abajo de la interfaz en el teléfono.

**Pegarlas al mentón** (arrancando en 1120). Técnicamente entra, pero visualmente
la tarjeta roza la cara y se siente apretado. Con arrancar en ~1155 alcanza para
que respire.

## Chequeo rápido

Antes de dar por buena una posición, hacé la cuenta:

```
arriba_del_elemento >= 250
arriba_del_elemento + alto <= 1500
izquierda >= 70   y   derecha <= 1010
```

Si alguna no da, movelo. Es más rápido que descubrirlo cuando ya está subido.

## El aire de arriba: encuadre más cerrado, por bloque (30/09)

En el plano sentado del iPhone la cabeza queda en y≈590: un tercio de pared
vacía arriba. Isaias lo marcó en rojo: *"hay mucho espacio arriba, ¿se puede hacer
zoom para toda la escena entera?"*. Primero fue un 1,2x único anclado abajo a la
izquierda; al subirlo aparecieron los costados (arriba: la columna en zona roja y,
con la columna corrida, la cara contra el recorte derecho). Lo que quedó:

- **Un encuadre por bloque** (escala + corrimiento, origen en la esquina de abajo a
  la izquierda: `x' = x + s·X`, `y' = 1920 + s·(Y − 1920)`). Él se sienta en otro
  lugar según la toma —la oreja derecha iba de x 800 a 935 del crudo— y un
  encuadre único no respeta los dos costados en todas.
- Para cada bloque: lo más cerrado posible hasta 1,15x, con la oreja (p90) en
  x ≤ 972, la remera (p20) sin meterse más de ~30 px en la columna de gráfica, y
  sin borde a la izquierda (el corrimiento nunca positivo). Queda la cabeza en
  ~375-430 px. `medir_encuadre.py` mide cara (por color de piel), remera y cabeza
  cada 10 cuadros; `encuadres.py` calcula la tabla (08-collage-columna-izquierda).
- Bloques seguidos de la misma toma comparten encuadre (el más exigente): un salto
  de 1 % en un corte parece un error, no otro plano.
- Los zooms que entran 1 → 1,12 se sacaron: al final del zoom él no entraba entre
  la columna y el recorte. Los que salen de 1,3 quedan (se asientan en ~10 cuadros).
- Si una toma no entra ni a 1x (el CTA del 29/09: de x 366 a 935), va casi sin
  zoom y la columna le pisa el hombro: lo dijo él, *"tapar un poco más a mí, no hay
  problema"*.
