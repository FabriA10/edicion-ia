---
name: motion-graphics
description: Motion graphics en Remotion para videos verticales — el estilo neón con un solo mundo y una cámara que viaja, tarjetas de íconos, filas de íconos en revelación, mapas, ranking, columnas, pantalla dividida, gráfica detrás de la persona, ChatGPT simulado, collage, libro que pasa páginas y animación 2D con personajes. Usala cuando pidan "un motion graphic", "animá esta frase", "ponele íconos", "una gráfica detrás mío", "hacé una animación", o cuando haya que retocar uno de los de la carpeta proyectos/. Define qué componente reutilizar, las curvas, los topes y las reglas que Isaias ya fijó.
---

# Motion graphics

Todo se hace en **Remotion**, dentro de `proyectos/`. Esta skill es el mapa: qué ya
existe, qué reglas lo gobiernan y por dónde empezar. Los detalles finos están en
`edicion-video/references/movimiento.md` y en `criterio/motion-graphics-estilo.md`:
leelos antes de dibujar nada.

## Antes de empezar

1. **La paleta no es de nadie.** Sale de `src/base/marca.ts` (y de `C` en el
   `base.ts` de cada motion neón). Poné los colores de la marca del video con
   `marca/LEEME.md` antes de renderizar una sola prueba.
2. **¿Lo pidió?** Los zooms y los motion graphics van **sólo cuando se piden**. Los
   motion graphics a cuadro completo, dos por video como tope, salvo que se aplique el
   paquete [cada ~3 s pasa algo](../../../criterio/paquete-efectos-cada-3s.md).
3. **Mirá dónde está la cabeza** en la toma donde la persona está más alta, y poné
   la gráfica a esa altura. No alcanza con respetar la zona segura (arriba 250,
   abajo 1500, y **márgenes de 120 px a los costados** para todo lo que se lea).
4. **Todo se mueve con la misma curva.** Nada de la suavización de manual.

## Las curvas (`src/base/curvas.ts`, `src/mg/base.ts`)

| Nombre | `Easing.bezier(...)` | Para qué |
|---|---|---|
| `SALIDA_SUAVE` / `SALE` | `0.16, 1, 0.3, 1` | **La curva de todo**: sale disparada en el primer cuadro y se va frenando hasta posarse. A ¼ del tiempo ya recorrió el 85 %. Zooms, entradas, tarjetas. |
| `PESADO` | `0.22, 1, 0.36, 1` | objetos con peso |
| `ASIENTA` | `0.34, 1.42, 0.64, 1` | rebote al llegar (tarjetas, íconos que "aterrizan") |
| `ENTRA` | `0.7, 0, 0.84, 0` | salidas que aceleran (algo que se va) |
| `AMBAS` | `0.65, 0, 0.35, 1` | movimientos que van y vienen |
| `CURVA_CAMARA` | `0.6, 0, 0.2, 1` | **sólo la cámara que viaja**: arranca lento, cruza rápido, se asienta largo |
| `SMOOTH_LINE_UP` | `0.0325, 0.64, 0.2025, 0.974` | subtítulo animado grande (20 cuadros, 384 px) |
| `DELAYED_UP_SLIDE` | `0.0684, 0.9019, 0.2429, 1` | subtítulo animado chico |

Los zooms duran siempre `CUADROS_ZOOM = 45` cuadros (30 fps).

## El estilo neón: un solo mundo y una cámara que viaja

Aprobado el 23/09 ("toppe de gamma esto"), tal cual está en
`proyectos/02-motion-graphic-neon/`:

- **Fondo oscuro con grano, viñeta y polvo de luz** en tres planos (`mg/Fondo.tsx`,
  `mg2/Mundo.tsx`): los de adelante, más grandes, más borrosos y más rápidos.
- **Palabras clave enormes** (Archivo pesada y angosta: `display(tam, peso, ancho)`)
  que se prenden como tubo de neón: `encendido(f, semilla)` (dos parpadeos y queda),
  `halo(i)` para el texto, `haloSvg(i)` para trazos, `apagado()` para cuando se enfría.
- **Un solo mundo**: todas las escenas viven en el mismo fondo, en lugares distintos;
  `camara(f, paradas, viajes, deriva)` (`mg2/Mundo.tsx`) la desliza de una a otra.
  **Lo de atrás no desaparece: sale de cuadro. Lo que viene ya estaba ahí, apagado.**
- Con 6 s y cuatro escenas, los viajes van de **18 a 20 cuadros**. Tomarse el tiempo:
  *"si no, vas a hacer todo muy rápido y no se va a entender nada"*.
- **Más texto, menos cambios de pantalla.** En una frase de 5 s va **un** viaje de
  cámara, dos como mucho. La riqueza sale de adentro de cada lugar: líneas entrando
  palabra por palabra, textos que ilustran, íconos que cambian de estado.
- **El foco es la frase; lo que la ilustra va de fondo**: textos decorativos con
  opacidad 0,34-0,5, 1-2 px de desenfoque, más chicos, detrás de las palabras, lejos
  del subrayado, con una entrada mínima.
- **Trampa del paralaje**: la posición de cada elemento es *donde se ve con la cámara
  en reposo*. Si se escribe en coordenadas de mundo, el paralaje los corre hacia el
  centro y se pisan.
- **Con la voz, el texto va palabra por palabra al ataque de cada una.** La palabra
  chica arranca 3 cuadros antes de sonar (asoma recién al tercero), la grande uno
  antes. La cámara se va durante la última palabra grande. **El subrayado va 10
  cuadros después** de la palabra: antes, la letra que todavía sube lo cruza y parece
  tachada.
- Íconos: inventados en SVG como tubos de neón (`mg/Iconos.tsx`), no bajados de
  internet.
- **Lo que no va**: fondos planos con degradé, íconos chicos tipo app y cero texto.

## Qué hay armado (y dónde)

Ver el mapa completo en `proyectos/LEEME.md`. Lo reutilizable más importante:

| Necesito… | Mirar |
|---|---|
| Subtítulos animados (Smooth Line Up / Delayed Up slide) | `02-motion-graphic-neon/src/SubtituloAnimado.tsx` |
| Mundo neón con cámara | `02-motion-graphic-neon/src/mg2/Mundo.tsx`, `mg3/Mensajes.tsx` (globos de chat de fondo, contador, tildes) |
| Fila de íconos "en revelación" (candado → se destraba) | `06-paquete-efectos/src/v4g/Insignias.tsx`, `Insignia.tsx` |
| Íconos sueltos sobre el video, cartelito de pregunta, tres ejes | `03-reel-iconos-tres-ejes/src/reel1/` |
| Tarjetas de íconos que "hacen algo" (se dibuja, se llena, cuenta, se tilda) | `08-collage-columna-izquierda/src/v2/Zona.tsx`, `10-gancho-susto-tarjetas/src/v4/Tarjetas.tsx` |
| Collage de fotos que se asientan y estallan | `08-collage-columna-izquierda/src/v2/Hook.tsx` |
| Mapa neón, guía "de la A a la Z" | `10-gancho-susto-tarjetas/src/v4/MGMapa.tsx`, `MGGuia.tsx` |
| Libro 3D que se abre y pasa páginas | `10-gancho-susto-tarjetas/src/v4/Libro.tsx` |
| Pantallas 3D inclinadas, gráfica detrás de la persona | `06-paquete-efectos/src/v4g/G5Pantallas.tsx`, `Detras.tsx`; método en `edicion-video/references/grafica-sobre-el-vivo.md` |
| Perfil de Instagram / logos de plataformas en SVG | `06-paquete-efectos/src/v4g/PerfilIG.tsx`, `Logos.tsx` |
| ChatGPT que escribe el prompt al ritmo de la voz | `07-chatgpt-simulado/src/v5/ChatGPT.tsx` |
| Ranking de logos que aterrizan en su casilla | `01-base-talking-head/src/base/ranking/Ranking.tsx` |
| Tres columnas (clasificación) con tarjetas | `01-base-talking-head/src/base/columnas/` |
| Pantalla dividida / cuadrado 1080×1080 | `01-base-talking-head/src/base/Dividida07.tsx`, `Cuadrado.tsx` |
| Posts de redes sobre la persona desenfocada | `09-reaccion-a-posts/src/v3/` |
| Chasquido (silueta, onda, flash, silla vacía) | `09-reaccion-a-posts/src/v3/Efectos.tsx` |
| Animación 2D con personajes (títere SVG, escenas, cámara 2D) | `11-animacion-2d-personajes/src/anim/` |
| Grade de color del crudo | `01-base-talking-head/src/base/Color.tsx` + `edicion-video/references/color.md` |

## Reglas que ya se corrigieron

- **Nada de texto de relleno inventado**: los mensajes, nombres y cifras de una pieza
  salen del guion o de lo que mandó quien contrata. Los de los ejemplos son de otra
  marca (de odontología): **cambialos**.
- **Si el guion cita un caso, mostrar su logo** ([caso-con-logo.md](../../../criterio/caso-con-logo.md)).
- **El logo va con fondo transparente** y sin su cuadro de color
  (`edicion-video/references/ranking.md`).
- **Fotos reales las da quien contrata**; nunca de internet para "rellenar un caso".
- **Cada animación acompaña una palabra o frase concreta**: se ata a su tiempo por
  el ataque de la palabra, no por el tiempo de Whisper
  ([sincronia-subtitulos.md](../../../criterio/sincronia-subtitulos.md)).
- **Los globos y rótulos de tamaño fijo**: un globo que cambia de tamaño con los
  puntitos "se buguea".
- **Animación 2D**: muebles a la escala de los personajes; vibraciones en ráfagas
  cortas; balanceo mínimo para que nunca queden duros
  ([animacion-2d-personajes.md](../../../criterio/animacion-2d-personajes.md)).

## Cómo se prueba (sin renderizar todo)

```bash
cd proyectos/<proyecto>
node node_modules/@remotion/cli/remotion-cli.js still src/index.ts <ComposicionId> salida.png --frame=90
```

- Los ids de composición están en `src/Root.tsx`. `npm run dev` abre el Studio.
- **Renderizá desde la carpeta de la carpeta**, no desde una ruta temporal larga:
  pasando los 260 caracteres Chrome headless falla con ENOENT.
- Cada `renderStill` deja ~90 MB en `%TEMP%`: borralos. Para muchos cuadros sueltos,
  un solo bundle (`stills.mjs`) en vez de uno por cuadro.
- **Mirá siempre cuadros antes de entregar**: el primero, uno en medio de cada
  viaje de cámara y el último; y al menos uno donde la persona esté más alta.
