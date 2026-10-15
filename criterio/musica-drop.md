# Música con drop: el drop va donde empieza lo importante

Cuando se manda un tema que tiene drop, **se lo ubica a propósito** (24/09/2026):
*"fijate en qué parte del video convendría… si hay una frase que dice [la persona] y
que justo se corta, poné ahí el drop, cuando empieza a hablar de algo importante; si
nada encaja, arrancá directamente en el drop"*. Y *"que suene de fondo, que no tape"*.

## Cómo quedó ("biscuit", de lukrembo, `musica/biscuit-lukrembo.mp3`)

- El drop cae en el **corte de gancho a respuesta**. La intro filtrada suena debajo
  del gancho y el tema se calla un instante justo antes del drop.
- **El drop se mide al milisegundo** (primer golpe después del hueco) y se pone en el
  cuadro del corte: quedó +3,7 ms.
- **La intro venía 25 dB más baja** y toda en la banda de la voz, así que se niveló
  por **300-3500 Hz** y no por LUFS: +14 dB, quedando 2 dB por debajo de lo que pone
  el resto del tema en esa banda. El resto, la cama de siempre (−32 LUFS).
- Para comprobar que la música no tapa, el chequeo con Whisper (transcribir la
  mezcla) se hace con el modelo **medium**: `small` cambió "arruina" por "ayune" aun
  sin música y casi hace bajar la intro por nada.

## Por qué

El drop en el momento importante suma un segundo golpe de atención después del
gancho; puesto en cualquier lado se desperdicia.

## Cómo aplicarlo

Con cada tema nuevo, buscar el corte que abre la parte fuerte del guion (respuesta,
revelación) y alinear ahí el drop. Scripts de referencia:
`proyectos/04-dos-camaras/trabajo/doscam01/scripts/musica_mezcla.py` (un drop) y
`proyectos/11-animacion-2d-personajes/trabajo/scripts/musica.py` (dos drops, cortes
secos y la intro +14 dB). Ver la skill `audio-y-microfono`.
