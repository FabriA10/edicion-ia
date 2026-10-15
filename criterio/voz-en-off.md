# Voz en off (ElevenLabs y otras)

Cuando un guion pide una voz en off generada, **no hay conector ni credencial propia
en esta carpeta**. La decisión de usar una clave de otro proyecto es de quien la
tiene, y además el sistema de permisos de Claude la frena (lo probó Isaias el 29 y
30/09/2026: la consulta de la cuenta pasó, la generación no).

El plan gratis de la API sólo da voces *premade*; las voces argentinas y naturales
salen de la Voice Library y no se pueden pedir por API gratis.

## Cómo aplicarlo

1. **No prometer la voz.** Dejar el hueco medido en la línea de tiempo y, si hace
   falta, un globo con el texto.
2. **Pedir el MP3**, generado en elevenlabs.io con la voz elegida (argentina en los
   videos de Isaias; la deja en Descargas).
3. Con el MP3: `sfx-v2.py vo.mp3` + `cierre-v2.py video2`
   (`proyectos/08-collage-columna-izquierda/trabajo/scripts/`), **sin re-renderizar**.
   Si hace falta ajustar la velocidad, `atempo` (en el video del 29/09, 1,08).
4. La voz se inserta unos 0,1 s antes de la respuesta del que habla, para que la
   respuesta "conteste" a la voz.

La voz provisoria de Windows no gustó: no usarla como entrega.
