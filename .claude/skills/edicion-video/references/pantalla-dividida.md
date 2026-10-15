# Formato pantalla dividida

Isaias habla frente a la notebook y arriba de eso muestra lo que tiene en
pantalla: un Miro, una planilla, una cuenta de Instagram. El reel queda partido
—él arriba en un cuadrado de 1080×1080, la pantalla abajo— y se arma en dos
vueltas, no en una.

## El orden de trabajo, que es lo que importa

**Primero se entrega el corte limpio. La pantalla viene después.**

Él no sabe todavía qué va a mostrar en cada momento, y vos tampoco podés saberlo
mirando el crudo: en el crudo se lo ve tecleando, pero la notebook está de
espaldas. Lo que hace es:

1. Vos entregás **el video limpio**: los cortes, el grade y el zoom de intro.
   Sin subtítulos, sin música, sin gráfica.
2. Él lo escucha mientras **registra la pantalla en OBS**, calculando a mano el
   timing de cada cosa que muestra contra lo que se oye.
3. Recién ahí se arma la división, y como el timing ya lo calculó él, del lado
   de la edición casi no hay nada que decidir.

Sus palabras: *"primero dame el video limpio y después vamos a hacer la pantalla
dividida"*. No adelantes la segunda parte ni le pongas subtítulos "por las
dudas": el subtítulo de un vertical está pensado para 1080×1920 y en el cuadrado
cae en otro lado.

## El recorte cuadrado va en la composición, no en el corte

El pre-corte se deja **vertical entero** (1080×1920) y la ventana cuadrada se
elige en la composición, con un desplazamiento:

```tsx
<AbsoluteFill style={{ overflow: "hidden" }}>
  <div style={{ position: "absolute", top: -recorteY, width: 1080, height: 1920 }}>
    <OffthreadVideo ... />
  </div>
</AbsoluteFill>
```

Así el mismo archivo sirve para el cuadrado y para el vertical, y mover el
encuadre cuesta un render en vez de volver a cortar el crudo entero. En el
video 7 el crudo duraba 16:45: volver a cortarlo son varios minutos, re-renderizar
73 segundos es uno.

### De dónde sale `recorteY`: se mide

Sobre pared verde la coronilla se mide sola — el primer renglón con píxeles que
no son pared, en la franja central del cuadro:

```python
g = rgb[:,:,1] - np.maximum(rgb[:,:,0], rgb[:,:,2])   # exceso de verde
fila = (g[:, franja] < 18).sum(1)                      # píxeles que NO son pared
top = np.where(fila > 12)[0][0]
```

En el video 7, con `recorteY = 480`, la coronilla quedó entre el **11,5 % y el
12,6 %** del alto del cuadrado en once cuadros repartidos por los 16 minutos. Que
el rango sea tan angosto es el dato que importa: quiere decir que el encuadre
aguanta todo el video y no hay que moverlo por tramos.

## El zoom de intro necesita correr el origen

El zoom out de intro es el mismo de siempre —1,35 a 1 en 45 cuadros con
`SALIDA_SUAVE`—, pero en el cuadrado **no se puede dejar el origen en el centro**.
La cuenta es corta: con escala `e` y origen en la fracción `o` del alto, el borde
de arriba entra hasta `o - o/e`.

| escala | origen 0,20 | 0,25 | 0,30 | 0,35 | 0,50 |
|---|---|---|---|---|---|
| 1,20 | 3,3 % | 4,2 % | 5,0 % | 5,8 % | 8,3 % |
| 1,25 | 4,0 % | 5,0 % | 6,0 % | 7,0 % | **10,0 %** |
| 1,30 | 4,6 % | 5,8 % | 6,9 % | 8,1 % | **11,5 %** |
| 1,35 | 5,2 % | 6,5 % | 7,8 % | 9,1 % | **13,0 %** |

Con la coronilla en el 11,5 %, el origen al 50 % le corta la cabeza en las tres
escalas de arriba. Con el origen al 30 % el borde llega al 7,8 %: casi cuatro
puntos de margen. Es la combinación que se usó.

En vertical esto no pasaba porque el plano es mucho más alto y la cabeza queda
lejos del borde; es un problema propio del cuadrado.

## La segunda vuelta: montar la pantalla

Cuando vuelve con el registro de OBS, tres cosas.

### La grabación de pantalla NO lleva cortes

Es lo que más tiempo ahorra y es contraintuitivo. Él grabó **escuchando la
edición ya terminada**, así que su línea de tiempo ES la de la edición: entra
derecho, de punta a punta, sin un solo `Sequence`. Lo único que hay que
encontrar es dónde arranca adentro de su grabación, y eso sale de correlacionar
las dos envolventes de audio:

```python
a, b = env(leer(MI_VIDEO)), env(leer(OBS))
mejor = max(((corr(a, b[off:off+len(a)]), off) for off in range(len(b)-len(a))))
```

En el video 7 dio **5,470 s con r=0,98**. Con ese número, `OBS = edición + 5,470`
y listo.

### El recorte de la pantalla: medí la tinta, no la caja

La grabación es 1920×1080 y el panel de abajo 1080×840, así que hay que recortar.
La trampa es que **la interfaz de Miro llena el cuadro de punta a punta**: la
barra de herramientas de la izquierda (hasta x=115), la barra de arriba (y<60) y
los controles de zoom de abajo a la derecha (y>1005) hacen que cualquier
detector de caja devuelva "el contenido ocupa todo" y no se pueda acercar nada.

Tapá esas cuatro zonas y buscá dónde vive el **90 % de la tinta**, no el primer
píxel oscuro. En el video 7 eso llevó la caja de 1764 px de ancho a ~1250, y
permitió una ventana de 1324×1030 en (200, 50), o sea 1,45× de acercamiento.

Comprobalo a ojo en una docena de momentos repartidos antes de encodear: el
contenido se sale de la ventana en unos pocos cuadros —12 de 341 en el video
7— y siempre mientras él está navegando, que es cuando nadie lee.

### La banda del subtítulo va sobre la costura, y el núcleo va OPACO

El degradado se abre **para los dos lados**. La versión del video 2 sólo
difuminaba hacia arriba y el borde de abajo quedaba como un filo duro contra la
pantalla; Isaias lo marcó: *"abajo es como que no está el difuminado, que quede
también en la parte de abajo porque queda más fachero y más limpia la imagen"*.

Y el núcleo tiene que ser **opaco, no 90 %**: con 90 % la diferencia entre el
color oscuro de arriba y el blanco de la captura se transparenta y la costura se
sigue viendo como una línea fina justo en el empalme.

```
linear-gradient(to bottom, fondo00 0%, fondo 42%,
                           fondo <costura>%, fondo00 100%)
```

El texto va **entero del lado de la imagen**, nunca sobre el blanco de la
captura: ahí el velo le da contraste y el Claro se lee.

## Lo que NO cambia

- Los cortes son los mismos de siempre: menú de pasadas, la última de cada tanda,
  bordes medidos con la envolvente, `revisar-bloques.mjs` antes de renderizar.
- El nivel de entrega es el mismo: −14,5 LUFS, pico bajo −1 dBTP.
- El grade va igual, con sus números medidos sobre ese crudo.
