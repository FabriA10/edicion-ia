# Gancho con susto (video 3, 30/09-01/10/2026)

El gancho es una toma a oscuras con linterna en la cara: una historia susurrada → la
persona se da vuelta a cámara con los ojos abiertos y hace **"¡Búh!"** → "perdón por
asustarte, pero quizás así aprendés de los errores de los demás". Vive en
`proyectos/10-gancho-susto-tarjetas/`; el orden de scripts y las decisiones, en
`trabajo/scripts/LEEME.txt`.

## La regla: el susto no avisa

El pedido, textual: *"que el scream sea más repentino, cosa que asuste y no le dé
tiempo a la audiencia a esperarlo"*. La vuelta 2 tenía preparación (mirada a cámara,
linterna que parpadea, cama de tensión que crece, silencio, grito que sube) y le
avisaba al que mira.

- **Nada antes del golpe**: sacar la preparación (quedó 0,23 s entre el fin del
  susurro y el búh), sin parpadeo ni cama que crezca. Un clima de fondo **parejo**
  debajo del susurro sí va (es el clima, no un aviso) y se corta seco.
- **El grito arranca ya en el agudo y en su punto más fuerte** (ataque de 1,5 ms; lo
  más fuerte en los primeros 250 ms) y suena más que la voz: **−10 LUFS contra −14,5**,
  con el mismo techo de pico (saturación, no volumen).
- **La imagen**: la persona deformada, calculada cuadro por cuadro fuera de Remotion
  (OpenCV `remap`, `trabajo/scripts/susto3.py`): primerísimo plano, cara estirada
  hacia abajo y angostada, remolino suave alrededor de la nariz (con 150° dejaba de
  leerse como cara: ~50°), mandíbula torcida; look oscuro, verdoso-grisáceo, con grano,
  cuencas hundidas y un punto de luz por pupila; destellos a umbral de 1 bit (como
  mucho 3 por segundo).

## El sonido del grito

Dos voces sintéticas con el tono fijo suenan a alarma aunque arranquen de golpe. Lo
que lo hizo grito: **caos** (el tono se mueve y se quiebra, subarmónicos,
bifonación), **aspereza de 50-120 Hz** y **aire de garganta**; algo no humano debajo
(la propia voz una octava abajo, un rugido); y **un golpe real** de la carpeta de
sonidos (`Glass break`, `explosion-1`, recortados en el ataque; los `impact` traen
una subida que avisaría). Cuidar que lo grave no se coma la franja del alarido
(1-4 kHz, ~48 % de la energía). **No se oye: se mide** (espectrograma, aspereza,
planitud) contra la versión anterior. Scripts: `grito4.py`, `sfx3.py`, `sfx4.py`.

## Transición "la luz se prende"

Entre el gancho y la explicación: los últimos 8 cuadros del gancho se sobreexponen
hasta el blanco y la parte 2 sale de ese blanco con la curva de salida suave. Ahí cae
el drop de la música ([musica-drop.md](musica-drop.md)). Código:
`src/v4/Efectos3.tsx` (`transicion`).

## Otras cosas que salieron de este video

- **Caso con logo**: [caso-con-logo.md](caso-con-logo.md).
- **La guía que se abre** (`src/v4/Libro.tsx`): un libro 3D con 14 páginas que pasan
  rápido, en el diseño del manual del cliente.
- Whisper `small` escribe mal las marcas habladas ("Hasta la próxima", "Ese es buen
  atoma"): re-escucharlas con `large-v3` aisladas.
- **Trampa de Windows**: `Subtitulos.tsx` y `subtitulos.ts` son el mismo nombre en
  minúsculas; el componente se llama `Subtitulos2.tsx` por eso.
