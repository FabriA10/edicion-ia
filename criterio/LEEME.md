# Criterio: lo que se aprendió corrigiendo renders

Cada archivo salió de una corrección concreta de Isaias sobre un render. No son
preferencias para discutir en cada video: **cambiarlas sin que lo pidan es
retroceder.** Si algo te parece mal, decilo antes de aplicarlo al revés en un video
entero.

Las skills (`.claude/skills/`) tienen el método paso a paso. Esto tiene lo que las skills
no dicen o dicen distinto, y el contexto de cada formato. **Leé los que apliquen antes de
editar.** Siempre: `cortes.md`, `subtitulos.md`, `audio.md` y `como-trabaja-isaias.md`.

## Reglas de edición

- [cortes.md](cortes.md) — sin aire entre frames, la última pasada, la toma entera le gana
  al empalme. **Ojo: el punto de salida está en discusión** (0,25 s en la skill, ~60 ms en
  la corrección más nueva: "de generación Z").
- [subtitulos.md](subtitulos.md) — Hando Bold, una línea, 4 palabras, minúscula, quietos,
  a la altura del pecho.
- [sincronia-subtitulos.md](sincronia-subtitulos.md) — anclar por frase y enganchar al
  ataque acústico; Whisper se corre hasta 200 ms.
- [audio.md](audio.md) — −14,5 LUFS y el ecualizador del micrófono chico, siempre.
- [movimiento.md](movimiento.md) — la curva que sale disparada y se frena; zooms.
- [paquete-efectos-cada-3s.md](paquete-efectos-cada-3s.md) — **la plantilla aprobada**:
  cada ~3 s pasa algo (zooms, subtítulos animados con sonido, íconos, neón, música).
- [motion-graphics-estilo.md](motion-graphics-estilo.md) — neón sobre el acento de la
  marca; un solo mundo con una cámara que viaja.
- [encuadre-y-zona-roja.md](encuadre-y-zona-roja.md) — sin aire arriba, y los celulares
  20:9 recortan ~108 px por costado: márgenes de 120.
- [musica-drop.md](musica-drop.md) — el drop va donde empieza lo importante.

## Formatos y material

- [proyecto-remotion.md](proyecto-remotion.md) — todo se hace en Remotion: el pipeline y
  por qué.
- [micro-estudio-obs.md](micro-estudio-obs.md) — los tres desfases cuando el audio se grabó
  aparte en OBS.
- [pared-verde.md](pared-verde.md) — gráfica detrás de la persona; el fondo real se tiene
  que seguir viendo.
- [pantalla-dividida.md](pantalla-dividida.md) — se entrega en dos vueltas: primero el
  corte limpio en 1080×1080.
- [reel1-iconos.md](reel1-iconos.md) — íconos sueltos sobre el video y reveal de tres ejes.
- [clienta-dos-camaras.md](clienta-dos-camaras.md) — dos cámaras: voz de la cámara 1, 60/40.
- [mg-whatsapp-neon.md](mg-whatsapp-neon.md) — el motion graphic aprobado; Isaias habla a
  7,3 sílabas por segundo.
- [formato-chatgpt-simulado.md](formato-chatgpt-simulado.md) — el prompt que se escribe
  solo al ritmo de la voz.
- [collage-y-columna-izquierda.md](collage-y-columna-izquierda.md) — collage de hook,
  subtítulos en columna, "generación Z".
- [reaccion-a-posts.md](reaccion-a-posts.md) — el post entra después del "empecemos";
  tres vueltas.
- [gancho-con-susto.md](gancho-con-susto.md) — el susto no avisa; la luz que se prende.
- [caso-con-logo.md](caso-con-logo.md) — si el guion cita un caso, se muestra su logo.
- [animacion-2d-personajes.md](animacion-2d-personajes.md) — títere SVG, escenas, escala
  de los muebles.
- [logos-de-marcas.md](logos-de-marcas.md) — se bajan de la página oficial de la marca;
  hay permiso.
- [voz-en-off.md](voz-en-off.md) — no hay credencial: se deja el hueco y se pide el MP3.

## Juanpi

- [juanpi-compumaq.md](juanpi-compumaq.md) — sus correcciones de los videos de Compumaq:
  subtítulos con slide up, sonidos virales no saturados, nada de frases repetidas.
- [juanpi-referencias.md](juanpi-referencias.md) — estilos de otras cuentas para copiar
  (devinjatho, rumedias, lewisdang) y la config "formato partido"; qué reemplazan del
  kit y qué no.

## Cómo trabajar

- [como-trabaja-isaias.md](como-trabaja-isaias.md) — las correcciones se toman literales y
  se cambia solo lo marcado.
- [correcciones-dictadas.md](correcciones-dictadas.md) — llegan por voz, desordenadas y con
  capturas: desglosar antes de tocar.
- [trabajar-sin-preguntar.md](trabajar-sin-preguntar.md) — se entrega la pieza entera y se
  cuenta qué se asumió.
- [aviso-sonoro.md](aviso-sonoro.md) — sonar una alarma cuando el render pasó las
  verificaciones.
- [verificar-no-explicar.md](verificar-no-explicar.md) — si un dato contradice la toma
  elegida, se verifica.
- [sesiones-en-paralelo.md](sesiones-en-paralelo.md) — no editar encima de otra sesión con
  cambios sin guardar.

## Cómo sumar una regla nueva

Cuando una corrección tenga que quedar fija, agregala en el archivo que corresponda (o en
uno nuevo, sumándolo a esta lista) con la fecha, el video del que salió y lo que se dijo,
textual. Si cambia el método, corregí también la skill correspondiente para que las dos no
digan cosas distintas.
