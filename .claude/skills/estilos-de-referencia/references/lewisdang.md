# lewisdang — editorial blanco con chips de vidrio

Editor que muestra sus anuncios "solo con efectos de sonido". Un reel analizado:
`referencias/lewisdang/solo-efectos-de-sonido.mp4` + `cuadros.jpg` + `detalle-chips.png`.
El anuncio es de un negocio local (el que habla explica por qué Yelp y Google Ads no
le convienen); el editor lo presenta dentro de una vidriera blanca.

## Look de la vidriera

- Fondo **blanco** con una **sombra de hojas de planta** cruzando (overlay en
  multiplicar, 20–30 %), como luz de ventana.
- Arriba, el usuario chico centrado ("\_cuenta\_"); al costado de la tarjeta, un texto
  vertical chiquito ("Sound effects only!").
- El video en una **tarjeta redondeada** (~36 px) con sombra, ocupando ~60 % del ancho.
- Abajo, asomando, un **mockup de la línea de tiempo del editor** (pistas verdes con
  forma de onda, cabezal que avanza): "así se hizo".

## Gráficas dentro del anuncio

- **Texto 3D extruido detrás de la persona**: "WORD OF MOUTH" con el cielo del fondo
  reemplazado; "GOOGLE ADS" con los colores de Google y profundidad, y la persona
  **entra caminando por delante** y lo tapa. Necesita recortar a la persona
  (segmentación o clave de croma): ver `criterio/pared-verde.md` y la gráfica detrás
  de la persona de `06-paquete-efectos` (`Detras.tsx`).
- **Texto turquesa con brillo** en el pecho ("YELP PUTS YOU") con una línea chica
  debajo ("on a roof"), tipo titular de dos tamaños.
- **Tarjeta de vidrio oscuro-turquesa** (`rgba(10,40,45,.75)`, borde claro 1 px,
  desenfoque de fondo) con el logo de la marca y un **gráfico de línea roja que cae**,
  rótulo abajo ("TO THE BOTTOM ON PRICE"). Entra con un clic de cursor.
- **Recuadro de línea punteada** con una palabra grande adentro ("on the / SAME
  PAGE") que se dibuja alrededor de la palabra.
- **Chips apilados en escalera**: rectángulos de vidrio oscuro con borde claro, texto
  blanco en mayúscula (tipo Montserrat SemiBold), cada uno con un **sticker de ícono
  inclinado** (etiqueta de precio, trofeo, lupa). Entran **de a uno**, cada uno
  corrido un poco respecto al anterior, en la palabra que lo nombra
  ("EXPENSIVE", "COMPETITIVE", "SEARCHING").
- **Flash blanco** de pantalla entera como transición entre ideas (2 cuadros en
  blanco puro, después entra la siguiente escena).
- Logos de marcas: se bajan de la página oficial (`criterio/logos-de-marcas.md`).

## Sonido: los efectos son el ritmo

El reel no tiene voz ni música: solo efectos, separados por **silencio digital**
(−95 dB entre uno y otro), y aun así se sostiene. Medido sobre la grabación:
- un efecto cada **0,7–1,2 s**, cada uno corto (0,25–0,75 s);
- **dos niveles**: los golpes/barridos de cambio de escena a −20/−23 dB (87,5 y 93,0 s)
  y los clics y pops de las gráficas a −30/−34 dB: **unos 10 dB de diferencia**;
- los tres chips caen a 0,6–0,8 s uno de otro (93,8 / 94,5 / 95,3 s), cada uno con su
  clic, más graves que los de interfaz (centro de la banda en la voz: suenan "con
  cuerpo", no finitos).

Del kit: `Ui clicks/KF - UI Click - N.mp3` por chip (uno distinto cada vez),
`Mouse click.mp3` para el cursor, `Pop up 4.mp3` en el texto turquesa, `Whoosh4.mp3`
+ `impact1.mp3` en el flash blanco, `Negative Error.wav` en el gráfico que cae,
`drawing digital.mp3` en el recuadro punteado.

Regla que se saca de acá: **cada gráfica que entra suena**, y lo que suena tiene
gráfica (igual que en `formato-partido`).

## Para armarlo

- La vidriera es opcional: para un cliente, el anuncio va a pantalla completa con las
  mismas gráficas; la vidriera sirve para el portfolio de Juanpi.
- Chips: `backdrop-filter: blur(8px)` no siempre se renderiza en Chrome headless;
  probá un cuadro y si no, fondo sólido semitransparente.
- Ícono-sticker: SVG con borde blanco grueso y una rotación de −10° a 12°.
- Todo entra con la curva del kit (sale disparado y frena) en 8–10 cuadros.
