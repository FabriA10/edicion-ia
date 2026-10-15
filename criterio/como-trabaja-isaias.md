# Cómo trabajar con Isaias en los videos

Esto es tan útil como las reglas técnicas. Ahorra vueltas enteras.

## Revisa con lupa y marca cosas concretas

Isaias manda capturas señalando puntos específicos: "acá queda espacio antes de que
empiece la oración", "este subtítulo tapa las manos". No manda devoluciones vagas.

Tomalo literal. Si marcó cinco cosas, son cinco cosas: no es una muestra de un
problema general que tenés que ir a buscar a todo el video.

## Cuando dice que algo está bien, está bien

**No lo toques en la siguiente vuelta.** La sombra de los subtítulos y el color
Claro ya pasaron revisión. Si lo "mejorás" de paso, la próxima devolución va a ser
sobre eso.

## Cuando pide un cambio puntual, hacé ese cambio y nada más

Textual: *"no toques ni cambies ninguna cosa por otra"*.

La tentación es aprovechar el viaje y acomodar dos cosas más que te hacen ruido. No
lo hagas. Un render con un cambio pedido y tres no pedidos obliga a revisar todo de
nuevo, y lo que estaba aprobado deja de estarlo.

Y si la corrección viene con una excepción ("mejorá los cortes, excepto el CTA"),
**lo exceptuado queda idéntico**: mismos cuadros, mismas muestras, misma ganancia
que la versión anterior.

## Si dice que algo suena mal pero no sabe explicar qué, medilo

**Casi siempre tiene razón y casi siempre hay un número que lo confirma:** una
palabra 8 dB por debajo del resto, un corte 10 ms antes de una sibilante, una frase
que cierra en 150 Hz cuando la línea base son 110.

Buscar ese número es más rápido que discutir, y encima te deja el arreglo exacto en
vez de una corrección a ojo. Las herramientas para medir están en `scripts/` de la
skill `edicion-video`.

## Marca la toma buena en voz alta

Desde el video 8 Isaias dice en voz alta cuál toma le sirvió ("esta es la buena",
"esta sirve", "usá ésta") después de la que quiere. Buscá esas marcas antes de
elegir nada. En los videos de la clienta, lo mismo lo hacen las aprobaciones de fondo
("continúen", "perfecto").

## El ida y vuelta normal

Un video suele llevar varias vueltas de render. En el video 1 fueron siete
(`corte-01.mp4` hasta `corte-01-v7.mp4`), y el de la clienta llegó a la v5. Eso es lo
esperable, no una señal de que algo salió mal.

Lo que sí hace la diferencia es que **cada vuelta arregle solo lo marcado**. Así las
vueltas van bajando de tamaño. Si cada vuelta toca cosas de más, no terminan nunca.

---
*Del paquete del 17/09, actualizado el 24/09/2026 (los subtítulos ya no llevan
animación de entrada; se sumaron las excepciones y las marcas habladas)*
