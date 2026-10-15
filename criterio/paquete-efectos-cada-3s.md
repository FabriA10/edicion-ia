# El paquete de efectos: cada ~3 segundos pasa algo

**El 26/09/2026 Isaias aprobó el video 4c entero** ("excelente, quedó todo súper
bien") y pidió que sea el modelo de los que siguen: *"fijate y aprendé cuáles han
sido las mejoras… lo que te permite que siempre, cada tres segundos, haya un tipo
de efecto"*.

Antes la regla era "dos motion graphics por video" y le quedaba quieto. Desde acá
**el ritmo de efectos es lo que sostiene la atención**, y se reparte entre:

| Efecto | Cómo va | Dónde está el código |
|---|---|---|
| **Zooms visibles** en algunos cortes | salen 1,30 → 1, entran 1 → 1,12. **El 1,08 no se nota en el celular.** El hook, un zoom out lento que dura toda la frase. | `proyectos/06-paquete-efectos/`, `proyectos/10-gancho-susto-tarjetas/src/v4/Efectos3.tsx` |
| **Subtítulos animados con sonido** en las frases que cargan el tema | whoosh + golpecito por palabra, sintetizados | `subtitulos-animados`, `sonidos-y-efectos` |
| **Fila de íconos en revelación** cuando enumera | círculos con candado y borrosos que se destraban al nombrarlos, de izquierda a derecha | `06-paquete-efectos/src/v4g/Insignias.tsx` |
| **Motion graphics de neón a cuadro completo** | un solo mundo con cámara que viaja | `motion-graphics`, `02-motion-graphic-neon` |
| **Gráfica detrás de él** con la pared verde recortada | grade igual al video, despill sólo en el borde | `references/grafica-sobre-el-vivo.md` |
| **Música de cama** | −32 LUFS, agachada por la voz, con pozo en la banda del instrumento que compita | `audio-y-microfono` |

## Cómo aplicarlo

En cada video nuevo, antes de renderizar, recorré la línea de tiempo en tramos de
3 s y mirá que en ninguno pase "nada". No hace falta un efecto nuevo por tramo:
alcanza con que el ojo tenga algo que seguir (un zoom que se asienta, un
subtítulo que se anima, una tarjeta que entra).

Lo que **no** cambia: los efectos acompañan a la voz y nunca tapan lo que se dice,
y siguen valiendo la zona segura y los márgenes de 120 px
([encuadre-y-zona-roja.md](encuadre-y-zona-roja.md)).

Detalle técnico en la skill `edicion-video`: `references/grafica-sobre-el-vivo.md`,
`references/audio.md`, `references/movimiento.md`, `references/subtitulos.md`.
