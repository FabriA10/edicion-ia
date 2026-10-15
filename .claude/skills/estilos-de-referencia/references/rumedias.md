# rumedias — Raw vs Output

Agencia de video para negocios locales. Un reel analizado:
`referencias/rumedias/raw-vs-output.mp4` + `cuadros.jpg` + `detalle-tarjetas-y-subtitulo.png`.
El reel es una **vidriera del trabajo del editor**: muestra el crudo y el editado
lado a lado mientras el anuncio corre. Para Juanpi sirve tal cual para mostrar su
propio trabajo (crudo vs editado de un cliente, con permiso del cliente).

## Look

- Fondo **gris muy claro liso** (`#E9E9E9`), sin textura.
- **Dos tarjetas de video** con esquinas muy redondeadas (~40 px en 1080) y sombra
  suave:
  - atrás a la izquierda, más chica (~70 %) y **en blanco y negro**: el crudo;
  - adelante a la derecha, a color, más grande: el editado. Las dos corren
    sincronizadas (es el mismo clip).
- Encima de cada tarjeta, una **pastilla azul** (`#1DA1F2`) con un punto negro y el
  rótulo en blanco ("Raw", "OutPut"), arriba a la izquierda de su tarjeta.
- Abajo, el **CTA fijo** en negro con la palabra clave en azul entre comillas
  ('Comment "PALABRA" to get project file'). En castellano: 'Comentá "PALABRA" y te
  paso el proyecto'.
- La cámara entra con un acercamiento lento y continuo a las tarjetas (escala
  ~0,9 → 1,15 durante todo el reel); al principio se ve el lienzo entero.

## Subtítulos: dos niveles

- **Arriba, chico**: la frase de entrada en minúscula, blanca, itálica fina
  (tipo Poppins Medium Italic, ~40 px).
- **Abajo, grande**: la palabra clave en **negrita itálica azul** (`#1E8BFF`, ~95 px),
  pegada debajo ("position your" / **Business**; "as the go-to" / **expert**; "in your
  area" / **& turn attention**; "into" / **actual inquiries**).
- Van **dentro de la tarjeta editada**, a la altura del pecho; el crudo no lleva.
- Entrada: la palabra grande sube desde abajo con desenfoque que se aclara (el Delayed
  Up slide del kit sirve) y la chica aparece un instante antes.
- Son literales (la voz dice exactamente eso), partidos donde cae el acento.

## Transiciones y efectos

- **Flash naranja cálido** (fuga de luz) sobre la tarjeta editada en un cambio de
  toma: el cuadro se tiñe de naranja/durazno 3–4 cuadros y se limpia.
- Nada más: el resto es la cámara que se acerca y los subtítulos. Lo
  "dopamínico" está en el contraste crudo/editado, no en efectos.

## Sonido

Voz de anuncio con música suave de fondo; no se distinguen efectos por palabra en la
medición (ataques muy chicos). Ritmo de voz: 3,8 palabras por segundo.

## Para armarlo en Remotion

- Un solo `<Video>` del editado y el mismo clip con `filter: grayscale(1)` para el
  crudo (o el crudo real si se tiene), los dos con el mismo `startFrom`.
- Composición 1080×1920, fondo `#E9E9E9`; tarjetas con `border-radius` y
  `box-shadow: 0 20px 60px rgba(0,0,0,.18)`; la editada con `transform: scale()` de
  la cámara lenta (curva del kit).
- Pastillas: `border-radius: 999px`, padding 10/22, punto de 14 px.
- Zona segura: el CTA va por encima de 1500 px y las tarjetas respetan los 120 px de
  costado (la de atrás puede asomar de menos de 120 porque no se lee).
