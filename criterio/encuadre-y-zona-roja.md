# Encuadre sin aire arriba y la zona roja de los costados

Dos pedidos del 30/09/2026 sobre el video del 29/09, uno después del otro:

1. *"siento que hay mucho espacio arriba, ¿se puede hacer zoom para toda la escena
   entera?"* — el crudo sentado deja la cabeza en y≈590 de 1920.
2. Después de subirlo, los subtítulos de la columna izquierda estaban en **"zona
   roja"**, *"no llega a la pantalla"*. En los celulares 20:9 el Reel llena la
   pantalla a lo alto y **recorta ~108 px de cada costado** (96 en 19,5:9). La
   columna arrancaba en x 30. Dijo que podía tapar un poco de él o correrlo a la
   derecha, "un poquito nada más".

## Lo que quedó

- Columna de texto en x 110-435 (mismo ancho, así los subtítulos no bajan de 52 px).
  Primero fue 130 y pidió "un pelín para la izquierda", marcando el borde ~18 px
  más afuera: **lo que se lee va desde ~110**.
- **Un encuadre por bloque** (escala hasta 1,15× + corrimiento, origen en la esquina
  de abajo a la izquierda) que mantiene la oreja derecha adentro de x 972 y la
  remera sin meterse más de ~30 px en la columna. Con un encuadre único no
  alcanzaba: la persona se sienta en distinto lugar según la toma (oreja entre x
  800 y 935 del crudo). Bloques seguidos de la misma toma comparten encuadre.
- Se sacaron los zooms lentos 1 → 1,12: al final del zoom ya no entraba entre la
  columna y el recorte.

## Por qué

La pared vacía se ve floja, pero **lo que no llega a la pantalla del celular no se
lee**, y una cara cortada contra el borde tampoco sirve.

## Cómo aplicarlo

- En videos con gráfica al costado, **márgenes laterales de ~120 px** para todo lo
  que se tiene que leer. La regla vieja de 70 no alcanza.
- Medí cara y cuerpo por bloque y calculá el encuadre con `encuadres.py` /
  `medir_encuadre.py` (`proyectos/08-collage-columna-izquierda/trabajo/scripts/`).
- Verificá con cuadros sueltos que tengan dibujadas las líneas de recorte
  (x 108 y 972, y 250).
- Antes de fijar la posición de una gráfica, mirá dónde está la cabeza **en la
  toma donde la persona está más alta** ([movimiento.md](movimiento.md)).

Ver también `.claude/skills/edicion-video/references/zona-segura.md`.
