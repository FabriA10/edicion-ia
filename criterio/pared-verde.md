# La pared verde

El 19/09/2026, en el video 6, apareció un fondo nuevo: una pared iluminada de verde
de arriba abajo, con Isaias al escritorio y la silla negra detrás.

Eso abre un formato que antes no se podía hacer: **gráfica por detrás de la
persona**. Isaias lo usó enseguida para pedir el formato de tres columnas de
clasificación, donde las columnas de color tapan la pared entera y la persona
queda adelante (el render de ejemplo (no viene en esta carpeta; se lo pedís a Isaias)).

No es un croma parejo (la pared va de rgb(58,124,73) arriba a rgb(37,205,95)
abajo), así que los filtros de croma de ffmpeg no sirven. El recorte sale de medir
el exceso de verde `G - max(R,B)`, que separa pared (≥34) de sujeto (≤28) en todo
el cuadro, más una red por luminancia para el borde del escritorio. El
procedimiento completo, con los números medidos, está en `references/columnas.md`
de la skill `edicion-video`.

Y una preferencia que salió de ahí y que vale para cualquier formato: **cuando la
gráfica tapa el fondo, el fondo real se tiene que seguir viendo por debajo**.
Textual de Isaias, sobre la referencia: *"el fondo que tiene es el fondo real, es
porque justamente quiero que se vea un poco la pared porque hay unas luces
atrás"*. Nada de placas opacas: color translúcido encima de la imagen de verdad.

**Por qué:** hasta el video 5 el fondo era pared lisa y toda la gráfica tenía que
caber en el aire libre del encuadre (de ahí la columna lateral del formato
ranking). Con la pared verde esa restricción desaparece.

**Cómo aplicarlo:** antes de proponer un formato, mirar un cuadro del crudo. Si la
pared está verde, la gráfica puede ocupar el fondo entero; si no, hay que buscarle
una franja libre. Ver [proyecto-remotion.md](proyecto-remotion.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 19/09/2026*
