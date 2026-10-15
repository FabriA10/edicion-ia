# Subtítulos de los videos

Para los verticales los subtítulos van así, y ya está validado:

- **Tipografía Hando Bold** (`HandoTrial-Bold.otf`). Es la que se usa siempre, no
  Archivo. Archivo queda para los carruseles.
- **Una sola línea, nunca dos.** Si no entra, se achica el cuerpo, no se parte.
- **4 palabras por subtítulo como máximo.**
- **Todos en minúscula**, sin excepción: ni la primera letra del cue va en mayúscula.
- **Sin puntos.** Las comas pueden quedar.
- **Cuerpo grande**: aprovechar que son pocas palabras.
- **A la altura del pecho** del encuadre (~73 % del alto), no abajo de todo.
- La sombra y el color Claro ya están aprobados: no tocarlos.
- **Desde el 23/09/2026 los subtítulos van estáticos**, sin la entrada de 3 cuadros
  / 14 px que llevaban antes. Solo se animan momentos especiales (el arranque, la
  frase que carga el tema) y solo cuando Isaias lo pide ("dos o tres veces en el
  video"). El animado lleva **toda la letra en color de la marca** (Acento claro por
  defecto), no un borde: lo remarcó dos veces. Curvas y criterio en la skill
  `subtitulos-animados` (`.claude/skills/subtitulos-animados/` de esta carpeta).
- **El ancho manda por encima de la cantidad de palabras.** Cuatro palabras cortas
  entran; cuatro largas se achican, quedan feas y encima adelantan lo que todavía no
  se dijo. "muchas agencias" corta, y "te recomiendan" va aparte.
- **El subtítulo dice lo que se escucha, literal.** Nada de parafrasear ni de
  escribir lo que uno cree que quiso decir: si en el audio suena "y te llega al
  privado", el cue no puede decir "y te lo mando". Isaias lo marcó como *"has
  transcrito cualquier cosa en el subtítulo"*.
- **La altura depende del plano, no es un número fijo.** El 73 % era el pecho en el
  busto cerrado del video 1; en un plano sentado con escritorio el pecho cae en el
  58 %, y al 73 % los subtítulos terminan sobre las manos.

**Excepción:** los videos de la clienta van en **Helvetica Bold, centrados a la mitad
del cuadro**. Ver [clienta-dos-camaras.md](clienta-dos-camaras.md).

**Por qué:** Isaias los fijó uno por uno revisando renders; la versión con dos
líneas y cuerpo chico la rechazó explícitamente.

**Cómo aplicarlo:** de entrada en cualquier pieza nueva de video, sin
volver a preguntar. Para que entren a tiempo, ver
[sincronia-subtitulos.md](sincronia-subtitulos.md). El código está en
`src/base/Subtitulos.tsx` del proyecto principal
([proyecto-remotion.md](proyecto-remotion.md)).

---
*De la memoria de Claude en la PC de Isaias · última versión: 23/09/2026*
