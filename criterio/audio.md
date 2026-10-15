# Audio: nivel de entrega y ecualizador fijo

Isaias escucha el audio con lupa y lo marca. Dos cosas ya quedaron fijas:

**Nivel: −14,5 LUFS con pico bajo −1 dBTP.** Sobre el video 2 Isaias dijo
"excelente el video, subile un poco el volumen": había quedado en −29,3 LUFS porque
el celular grabó de lejos. Instagram y TikTok normalizan en una sola dirección
(bajan lo que viene fuerte, no suben lo que viene flojo), así que un video bajo se
reproduce muy por debajo del resto del feed.

**El ecualizador del micrófono chico (DJI) se aplica siempre, sin preguntar.**
Isaias lo ajustó en el Fairlight de DaVinci y mandó la captura: +8,7 dB en 30 Hz,
+4,9 en 171 Hz, −4,7 en 1,6 kHz, +11 en 5,6 kHz. Textual: *"ya aplico de por si en
todo los videos a futuro esta calidad de sonido con esta configuracion"*.

**Por qué:** son decisiones que ya se tomaron de oído; volver a preguntarlas o
entregar sin ellas es retroceder.

**Cómo aplicarlo:** la cadena de ffmpeg **no es la copia literal de esos números**
(los estantes de ffmpeg llegan a la mitad de la ganancia en la frecuencia marcada).
Ya está ajustada y verificada con tonos en la skill `edicion-video`
(`references/audio.md`), junto con el orden de la cadena, el limitador y el nivel
de la cama musical. Si el audio se grabó aparte con el micrófono de estudio, antes
van las tres correcciones de [micro-estudio-obs.md](micro-estudio-obs.md). Ver
[proyecto-remotion.md](proyecto-remotion.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 18/09/2026*
