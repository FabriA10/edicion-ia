---
name: sonidos-y-efectos
description: Sonidos de los videos verticales — la biblioteca de efectos de la carpeta sonidos/ (whoosh, pops, clicks, golpes, risers, neón), cuál usar en cada animación y a qué nivel, cómo se arma la pista de efectos con un script (sfx.py) y cómo se sintetizan whoosh, pop, tic, golpe, zumbido y slide con reverb. Usala cuando haya que ponerle sonido a una animación, a una transición, a un subtítulo animado o a un motion graphic, "que suene con reverb", "poné un whoosh", "que tenga más impacto", o cuando haya que armar un grito, un golpe o un efecto que no existe.
---

# Sonidos y efectos

Cada animación lleva un sonido. Isaias lo notó y lo aprobó: *"las animaciones, los
sonidos"* (video 5). La biblioteca está en `sonidos/` (ver `sonidos/INDICE.md`, agrupada
por tipo, con los usados marcados ▸); los scripts de ejemplo, en `scripts/`.

## Principios

1. **Los efectos acompañan, no compiten con la voz.** Se suman **después del limitador
   de la voz** y antes del limitador final de la mezcla (`audio-y-microfono/scripts/cierre.sh`).
   La pista de efectos se hace aparte (`extras.wav`) y se mezcla en el cierre, así se
   rehace **sin re-renderizar** el video.
2. **Cada efecto cae un poco ANTES de la imagen que subraya.** El whoosh de una
   transición llega *al medio del corte*: va ~0,3 s antes (`s − 0,30`). Un pop va 2-4
   cuadros antes de la palabra (`antes(k, n)`), porque el cerebro espera el sonido.
3. **Cada animación del paquete lleva su sonido** (`criterio/paquete-efectos-cada-3s.md`):
   | Animación | Sonido |
   |---|---|
   | zoom en un corte | whoosh corto (barrido 3800 → 500 Hz, −19 dB) o largo (1,1 s) |
   | transición barrido / subida | `Sweep .mp3` (−9 dB), 0,32 s antes del medio del corte |
   | transición zoom | `Whoosh4.mp3` (−8 dB) |
   | iris / aparición | `Appearance 1.mp3` recortado a 1-1,5 s (−12 dB) |
   | tarjeta / ícono que entra | pop (`Pop up 4.mp3`, −8…−17 dB) |
   | subtítulo animado | whoosh cuando la letra se posa + golpecito por palabra |
   | mensaje / notificación | `Pop up 5.wav` (−11 dB) |
   | check / "publicado" | `Correct Sound.mp3` recortado a 1 s |
   | error / "no" | `Negative Error.wav` |
   | tubo de neón que se prende | zumbido sintetizado (−24 dB) + pop |
   | viaje de cámara | whoosh |
   | contador | `Counter.wav` (−16 dB) o tic sintetizado |
   | hoja que pasa | `Paper in Air.aac` recortado (−11 a −15 dB) |
   | sello / golpe seco | `Drop.aac` (−10 dB) |
   | subida antes de un golpe | `Riser 1.wav` (−18 dB), termina en el golpe |
   | chiste | `Sad Trumpet.mp3`, grillos (`Crickets…mp4`) |
4. **Cada efecto se normaliza por su RMS activo antes de ponerle ganancia.**
   `sfx.py:carga()` lleva todos a −20 dBFS de RMS (ventanas de 20 ms por encima de
   −50 dB) y recién ahí se les pone el dB relativo. Sin esto, los niveles de la
   biblioteca (que vienen de todos lados) no se pueden comparar.
5. **Recortá y hacé un fundido corto (40 ms)** si el efecto es más largo de lo que
   hace falta: `carga(nombre, desde, dur)`.
6. **Repetidos, escalonados y con variación**: seis hojas o siete mensajes no suenan
   igual cada uno: alterná el nivel (`−11 − (i % 2)`) y repartilos entre dos tiempos.
7. **Vibraciones del celular**: el zumbido cae solo en cada ráfaga del dibujo
   (cuadros múltiplos de 24), a −20/−23 dB, no continuo.
8. **Sonido sin tapar el chiste**: dejá el silencio donde la animación lo pide
   (grillos después de "nadie pide turno").

## Reverb (pedido: "utilizá mucho reverb")

En los videos de dopamina (reacción, gancho con susto) **todos los efectos van por una
reverb**. `scripts/sfx-sintetizados-reaccion.py` la hace con una respuesta al impulso
sintética (ruido gaussiano con caída exponencial τ = 0,35 s, 1,4 s de cola, pasa-banda
250-7000 Hz) mezclada en paralelo: cada efecto se suma a una pista **seca** y, con una
fracción `rev` (0,45 por defecto, 0,8 en los golpes grandes), a una pista **húmeda**
que después se convoluciona con la IR. Pico final −3 dBFS.

## Sintetizar lo que no existe

Todo con numpy/scipy, sin samples (en `sfx-sintetizados-reaccion.py` y `sfx4.py`):

| Función | Qué es |
|---|---|
| `barrido(dur, f0, f1, pico, grave, cae)` | whoosh: ruido filtrado con barrido de frecuencia |
| `pop(f0, pico, dur)` / `burbuja()` | pop y burbuja (seno con caída) |
| `tic(pico, fc)` | clic corto |
| `golpe(pico, dur)` | golpe grave (bombo + crack de ruido) |
| `zumbido(pico)` | zumbido de tubo de neón / vibración |
| `slide(dur, sube)` | deslizamiento de tono |
| `tono(f0, dur, decae, armónicos)`, `timbre()`, `DING()` | campanita, timbre de teléfono, "idea" (`sfx.py`) |

**Un grito que da miedo** se mide, no se oye: caos (tono que se mueve y se quiebra,
subarmónicos), aspereza de 50-120 Hz, aire de garganta, algo no humano debajo, y un golpe
real (`Glass break`, `explosion-1`, recortados en el ataque). Ver
`criterio/gancho-con-susto.md` y `scripts/grito4.py`.

## Música

En `musica/` (ver `musica/LEEME.md`) y en la skill `audio-y-microfono`.

## Hay que mirar el índice antes de usar uno

`sonidos/INDICE.md` agrupa por el **nombre** de cada archivo: antes de usar uno nuevo,
**oílo** (o medí su duración y su ataque con ffprobe/`astats`). Los `impact*` traen una
subida que avisa un golpe; los `.mp4` de la carpeta (`Crickets…`, `Censor Beep`,
`Film Camera On`) se leen con ffmpeg igual que un audio.

## Scripts (plantillas)

Rutas con `@@PROYECTOS@@` y `@@SONIDOS@@` (se resuelven con `instalar/ajustar-rutas.ps1`).
Cada uno lee los tiempos de un archivo del proyecto del que salió (`voz.ts`, `tiempos.ts`,
`plan.json`): al copiarlo, cambialo por los de tu proyecto.

| Script | Qué arma |
|---|---|
| `sfx.py` | pista de efectos de una animación 2D: transiciones, mensajes, contadores, remates (164 efectos de `sonidos/` + sintetizados) |
| `sfx-sintetizados-reaccion.py` | todo sintetizado con reverb: zooms, posts, subtítulos animados, motion graphics, chasquido |
| `sfx3.py`, `sfx4.py` | gancho con susto: clima, susto, transición, tarjetas, motion graphics |
| `grito4.py`, `susto3.py` | el grito sintético y el clip de la cara deformada (OpenCV) |
| `sfx-v2.py` | efectos del video del 29/09 + voz en off (`atempo`) + la "pista de sonidos" |
