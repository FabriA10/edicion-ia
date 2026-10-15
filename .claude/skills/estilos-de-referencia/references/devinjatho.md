# devinjatho — oscuro cinematográfico

Cuenta de marketing para negocios (EE. UU.). Cuatro reels analizados, en
`referencias/devinjatho/` (mp4 recortado + hojas de cuadros a 4 por segundo +
`detalles-graficas.png`). Transcripción con tiempos: `referencias/transcripcion-palabras.json`
(segundos de la grabación: reel 1 = 1–17, reel 2 = 17–42, reel 3 = 43–53, reel 4 = 56–65).

| Reel | De qué va | Lo que hay que mirar |
|---|---|---|
| 1 `1-peor-video-hormozi` | Arregla el video menos visto de otro creador | celular con el reel del otro, reacción con pausa y 💩, visor con marcos neón "VISUAL HOOK / VERBAL HOOK" |
| 2 `2-finalmente-lo-lograste` | Qué hacer cuando un video se viraliza | carrusel de miniaturas con vistas, "Congratulations" dorado con fuegos, flash rojo, billetes, cuenta regresiva, Instagram simulado, historia que se tipea |
| 3 `3-deja-de-usar-hooks` | Ganchos gastados | tarjeta con gráfico en las manos, celular en la mano que pasa de un gancho a otro, contador de vistas |
| 4 `4-medidores-de-vistas` | Hablar a cámara | panel blanco arriba con medidores que se activan y las vistas que suben |

## Look

- **Fondo oscuro de noche**: estudio con ventanal y luces de ciudad desenfocadas,
  luces prácticas cálidas (velas, lámparas) en el fondo, sombras azul-verdosas. La
  persona bien iluminada, el resto se hunde.
- **Abajo, degradé a negro** (último ~25 % del cuadro): ahí apoyan subtítulos y
  gráficas sin pelearse con la ropa.
- Negros aplastados, saturación baja salvo el color de acento de cada frase.
- Encuadre: plano medio con la mesa abajo; cuando la frase es fuerte, un plano más
  cerrado. Sin aire arriba.

Con un crudo de cámara común, se acerca así: bajar exposición del fondo con una
viñeta fuerte, `contrast` alto y `saturate(0.85)` en Remotion, y el degradé a negro
abajo como capa fija (`linear-gradient(transparent 70%, rgba(0,0,0,.85))`).

## Subtítulos: titulares que brillan

- **MAYÚSCULA**, sans muy pesada y ancha (Archivo peso 900, ancho ~120). Primera
  línea blanca ~85 px de alto de letra en 1080×1920; la **segunda línea es la palabra
  clave**, más grande (~115 px) y **en color con brillo del mismo color**.
- Una o dos líneas, 1 a 4 palabras en total. Centrado, a la altura del pecho
  (≈ 48–56 % del alto). Cuando hay un gráfico abajo, sube a la cara/hombros.
- Brillo: `text-shadow: 0 0 10px <color 70%>, 0 0 28px <color 35%>` + una sombra
  oscura corta para separar del fondo. Sin placa ni contorno.
- **Se arma palabra por palabra** al ritmo de la voz: "GO" → "GO F\*CKING" →
  "GO F\*CKING VIRAL". Cada palabra entra en 3–4 cuadros (escala 1,15 → 1 y
  desenfoque 6 → 0 px). La frase entera se va con un desenfoque rápido cuando entra
  la siguiente.
- **Titulares, no transcripción**: dicen la idea en corto, a veces con otras palabras
  ("lowest viewed video" → **ALEX HORMOZI'S WORST VIDEO**; "you finally get your
  first viral video" → **YOU FINALLY DID IT!**). Y **no todo se subtitula**: cuando
  una gráfica explica (la cuenta regresiva de 72 horas, el panel de medidores), no
  hay subtítulo. En este estilo eso reemplaza la regla del kit de subtítulo literal.
- Groserías con asterisco (F\*CK, SH\*T).
- **Colores de la palabra clave** según lo que significa:
  - rojo `#FF2B2B` — error, peligro, insulto ("WORST VIDEO", "DOG SH\*T", "F\*CK IT UP", "MILLIONS", "STOP USING");
  - verde `#45F04A` — logro ("DID IT!", "ULTIMATE HACK");
  - dorado serif (tipo Cinzel, degradé `#FFE9A8 → #D9A21B`, con destellos) — celebración ("Congratulations", en tipo título, no mayúscula);
  - azul `#2E8BFF` / magenta `#FF3FD0` — variantes cuando se listan varios ejemplos seguidos (cada ejemplo un color).
- **Número + palabras**: el número en letra hueca (solo contorno blanco, sin
  relleno) y las palabras rellenas al lado: "99% BUSINESS OWNERS".
- Los subtítulos del video del otro creador (cuando se lo muestra) son otro estilo:
  chicos, minúscula, blanco, con una palabra en negrita ("I **scaled** a business").

## Motion graphics (catálogo)

Cada uno con cómo armarlo en Remotion y qué del kit se reutiliza.

1. **Celular con el video de otro** (gancho del reel 1 y reel 3). Un celular en la
   mano, de frente, ocupando el centro; adentro corre un reel con la interfaz de
   Instagram. Arranca **desenfocado y se enfoca** (blur 12 → 0 en ~8 cuadros). En el
   reel 3, dentro del celular se **desliza de un reel a otro** hacia arriba con
   desenfoque vertical, uno por cada ejemplo. Armado: marco de celular en SVG/CSS
   (bordes redondeados 60 px, isla, barra de Instagram) con el video adentro. La
   mano es una foto: no hay en el kit; o se graba la mano de Juanpi con fondo verde, o
   va el celular solo, apenas inclinado y flotando.
2. **Contador de vistas con ojo**: ícono de ojo + número blanco grande que sube rápido
   (319 → 448 → 513). Cuando "sale" del celular, el chip ("👁 4.8M") vuela hacia
   afuera con desenfoque de movimiento. Kit: los contadores de `12-compumaq-video6`.
3. **Carrusel de miniaturas con vistas**: fila de tarjetas verticales debajo del
   subtítulo, cada una con su número (10.7K, 11.4K…); la fila se corre de costado y
   la ganadora (1.2M) queda en el centro, más grande, con **borde dorado y un
   destello** sobre el número. Las demás oscurecidas al 40 %.
4. **Reacción con pausa**: el video del otro creador arriba a la izquierda, él
   adelante a la derecha más grande (tapa parte del otro). Cuando lo juzga: ícono
   **⏸ gigante** semitransparente sobre el otro, que se **desatura y oscurece**, y
   aparece un **emoji 💩** sobre su cabeza. Kit: `pantalla-dividida`, posts
   desenfocados de `transiciones-y-efectos`.
5. **Visor con marcos neón (desglose)**: la cámara se aleja y todo el video queda
   chico, en el centro, con **esquinas de visor** (cuatro L blancas/doradas) sobre
   fondo negro. Después se encienden **rectángulos neón** sobre las partes que
   explica, con una pestaña-etiqueta arriba: azul `#2F9BFF` "VISUAL HOOK" sobre el
   gráfico, amarillo `#FFD23A` "VERBAL HOOK" sobre la cara; lo que no se explica baja
   al 30 %. Kit: el neón de `motion-graphics` (mismo encendido con parpadeo).
6. **Partículas que acompañan la palabra**: fuegos artificiales que explotan en la
   ventana del fondo ("Congratulations"), chispas alrededor de "MISS", **billetes 3D
   que vuelan hacia la cámara** ("THAT COST THEM MILLIONS"), un cubo "?" (tipo caja de
   Mario) que gira y se ilumina en "HERE IS THE PART THAT". Van **detrás** del
   subtítulo y nunca tapan la cara.
7. **Cuenta regresiva a negro**: corte seco a negro con "72:00:00" grande, monoespaciada,
   blanca, con "HOURS · MINUTES · SECONDS" chiquito abajo; descuenta un segundo. Sin
   subtítulo: la voz dice "for the next 72 hours".
8. **Instagram simulado**: el video se achica dentro de un feed de Instagram oscuro
   (logo arriba, fila de historias, usuario y "Original audio"), en leve perspectiva
   3D que deriva despacio. Arriba, la **pastilla roja de notificaciones** (`#FF3B4E`:
   💬 comentarios, ♥ likes, 👤 seguidores) con los números **subiendo rápido**
   (2.3K → 7.5K). Después la cámara viaja a "Tu historia", el **+ se enciende celeste**,
   clic, y un barrido lleva a una historia vertical donde una caja blanca se tipea
   letra por letra ("Hey [Name], What's It Like", con el [Name] en azul). Kit: perfil
   de Instagram y pantallas 3D de `06-paquete-efectos`, posts de
   `09-reaccion-a-posts`, tipeo de `07-chatgpt-simulado`.
9. **Tarjeta en las manos**: un panel oscuro con un gráfico de línea roja que cae,
   pegado a las manos como si lo sostuviera (sigue un poco el movimiento).
10. **Panel de medidores** (reel 4, sin subtítulos): el 38 % de arriba es **blanco** y
    se funde en el video con un degradé. Filas con etiqueta-pastilla (gris inactiva,
    **azul `#1877F2` activa**): FLAT, PACING, TONALITY, HANDS, EMOTION; cada fila con su
    trazo (línea plana, guiones, una onda que va de rojo a celeste, íconos de manos,
    emojis). Un **marcador azul** con 👁 y las vistas recorre la fila activa de
    izquierda a derecha; al llegar al final se activa la siguiente fila y las vistas
    suben de escalón (100 → 5K → 10K). Sirve para cualquier "fórmula que se suma".

## Transiciones

- **Alejarse del celular** a la persona con desenfoque (gancho → primer plano).
- **Barrido horizontal** con desenfoque de movimiento (clic en "Tu historia").
- **Deslizamiento vertical** tipo scroll de reels (dentro del celular y de vuelta a
  pantalla completa).
- **Fundido con desenfoque** entre dos frases (6 cuadros), nunca un fundido plano.
- **Flash de color** de 2–3 cuadros que se apaga en ~6: rojo en "But don't" (aviso),
  verde lavado en "LET'S WATCH", dorado (todo el cuadro se calienta) en
  "Congratulations". Kit: "la luz se prende" de `transiciones-y-efectos`, con color.
- **Corte a negro** para la cuenta regresiva.

## Sonido

Medido sobre la grabación (no se oye: son mediciones):
- Habla rápido: **3,1–3,5 palabras por segundo**, huecos entre frases de 0,3–0,6 s.
- **Hay cama de música** en los cuatro: en los huecos queda a −37/−41 dB, unos 4–7 dB
  debajo del promedio de la voz (−34). Más presente que la del kit (−17 dB relativos).
- Los **efectos llenan los huecos** y suben casi al nivel de la voz en los momentos
  grandes (fuegos y billetes: −32 dB, igual que la voz). Hay ataques agudos cortos en
  cada aparición de gráfica (carrusel, pausa, notificaciones) y uno grave en
  "Congratulations".

Del kit (supuesto, a ajustar de oído por Juanpi): `Whoosh4.mp3` en alejarse/barridos,
`Pop up 4.mp3` en cada palabra clave de color, `Bass Drop.aac` o `impact1.mp3` en el
flash rojo, `Cash register 1.mp3` + `Paper in Air.aac` en los billetes, `Timer.mp3`
o `Clock 1.mp3` en la cuenta regresiva, `notification.mp3` en la pastilla de
Instagram, `Typing 1.mp3` en la historia, `Counter.wav` en los contadores,
`Neon.mp3`/`Flicker.aac` en los marcos neón, `Correct Sound.mp3` en "DID IT!". Fuegos
artificiales y "sparkle" no hay en `sonidos/`: sintetizarlos con `sonidos-y-efectos`.

## Ritmo

En el reel 1 pasan **13 cosas en 16 segundos** (una cada ~1,2 s): cambio de
subtítulo cada 2–4 palabras y una gráfica o transición nueva cada 1,5–3 s. Es más
denso que el "cada 3 segundos" del kit. El reel 4 es lo contrario: un solo gráfico
que evoluciona y la persona quieta; también funciona porque el gráfico cambia todo
el tiempo.

## Para armarlo

Partí de `proyectos/12-compumaq-video6/` (contadores, tarjetas, pantalla partida) o
`01-base-talking-head`. Componentes nuevos que hay que escribir la primera vez y
dejar en el proyecto para reutilizar: `TituloBrillo` (subtítulo de este estilo),
`Celular`, `CarruselVistas`, `Visor` (esquinas + marcos neón con pestaña),
`InstagramFeed` (feed + pastilla de notificaciones), `CuentaRegresiva`,
`PanelMedidores`, `Billetes` / `Fuegos` (partículas deterministas: posiciones con una
semilla fija, nada de `Math.random`).
