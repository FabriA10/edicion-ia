# El formato ranking

Una variante de talking-head: Isaias enumera N herramientas y en la franja libre
del encuadre va apareciendo una columna de casillas numeradas que se llenan con
el logo de cada marca a medida que la nombra.

Lo pidió con tres referencias de Instagram donde el mismo formato tiene diez
puestos. Lo que hay que copiar de esas referencias es el mecanismo, no el estilo:
la columna de números, el logo que aparece grande y **viaja hasta su casilla**, y
el número que desaparece cuando el logo se posa encima.

## El encuadre manda

Este formato **sólo funciona si el crudo deja una franja libre**. En el video 4
Isaias está pegado al borde derecho y la pared queda vacía de x=0 a x≈430 en todo
el alto: ahí va la columna. Si el plano viene centrado, no hay dónde ponerla y
hay que discutir el encuadre antes de grabar, no después.

Medidas que quedaron (lienzo 1080×1920):

- Casillas de **148×148** con esquinas de 34, centradas en **x=150**.
- Seis casillas cada **168 px**, la primera en **y=420**: de 346 a 1334, cómodas
  dentro de la zona segura.
- Casilla vacía: relleno `fondo` al 78 %, borde punteado `hueso` al 55 %, el
  número en Hando Bold de 76.
- Casilla llena: baldosa **blanca** con el logo adentro y 17 px de aire. El blanco
  es lo que hace que los logos de marcas distintas convivan sin pelearse.

## El subtítulo se corre

Con la columna ocupando la izquierda, el subtítulo **no puede ir centrado en el
lienzo**: choca con los números. Va centrado en el espacio que queda.

- Caja de **x=284 a x=1010**, o sea centro en **647** y ancho **726**.
- Con cuerpo máximo de 88 px eso son unos **8,2 em**, bastante menos que los 11 em
  del formato normal. Hay que bajar el presupuesto de ancho del generador.
- Isaias pidió **tres palabras como máximo** para este formato, no cuatro.

En las referencias que pasó, el subtítulo está centrado en x≈610 de 1080: la misma
solución.

## La animación

Una sola, y es la única del video: el logo **aparece al doble de tamaño, corrido
190 px a la derecha de su casilla**, espera lo justo para que se lea la marca, y
se posa en la casilla con la curva de `curvas.ts`.

- 6 cuadros de fundido de entrada
- 8 cuadros quieto y grande
- 16 cuadros de viaje (escala 2 → 1, desplazamiento 190 → 0)

Total 30 cuadros = 1 segundo. El número de la casilla se apaga durante el viaje.

**Dónde se dispara:** el logo tiene que **posarse sobre el nombre de la marca**,
no sobre el número. En cinco de los seis bloques del video 4 el número y el nombre
van pegados ("la primera es Diagnocat"), así que disparar al principio del bloque
lo deja aterrizando encima del nombre. En Claude el nombre llegaba recién al final
de la frase ("...que hay hoy en día en el mercado se llama Claude"), y ahí el
disparo va corrido 2,4 s para que aterrice igual sobre la palabra.

La columna entra escalonada al principio del video, una casilla cada 0,06 s.

## Los logos

Isaias los manda por chat, pero las imágenes de un mensaje no llegan al disco. Dio
permiso explícito para bajarlos de la web. Lo que funcionó: pedir el HTML de la
página oficial y sacar la URL del asset.

```bash
curl -sL -A "<user agent de Chrome>" https://marca.com/ \
  | grep -oiE '(src|href|content)="[^"]*(logo|icon|brand)[^"]*\.(svg|png|webp)[^"]*"'
```

Preferí **SVG** siempre que exista: entra en un `<img>` como cualquier imagen, no
hay que rasterizarlo y escala sin límite. Los favicon `.ico` no sirven —vienen a
16 o 32 px—, pero `/icon.svg`, `/apple-touch-icon.png` y el `favicon.png` de 512
suelen estar ahí.

Dos cosas aprendidas poniéndolas mal:

- **El logo va con fondo transparente.** El isotipo de una marca traía su fondo menta
  y sobre la baldosa blanca quedaba un recuadro pegado que parecía un error.
- **Un logo sólo de símbolo se lee mejor que uno con bajada**, salvo que la marca
  no sea reconocible sin el nombre. Relu y SmileFy van con la palabra; Diagnocat,
  Gamma y Claude van sólo con el símbolo.

## Lo que este formato NO lleva

Isaias fue explícito: *"no hace falta que juegues con ningún tipo de zoom ni nada
por el estilo. Tipo, lo único efecto que tenés que hacer es aparecer el icono y se
va numerando ahí cada uno"*.

Sin zooms, sin motion graphics, sin fotos. El único movimiento es el de los logos.
Ver también `movimiento.md`: los zooms y los motion graphics van **sólo cuando los
pide**.
