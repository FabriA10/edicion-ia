# Estilo de los motion graphics

Aprobado el 23/09/2026.

**Lo que no va:** los motion graphics planos de antes, con fondo verde con degradé,
íconos chicos tipo app y cero texto (`meta-whatsapp-menor-precio.mp4`,
`ia-ojo-v3_2.mp4`). Textual de Isaias: *"a mí a día de hoy no me gusta nada"*.

**Lo que aprobó:** la v1 neón de [mg-whatsapp-neon.md](mg-whatsapp-neon.md)
(el render de ejemplo (no viene en esta carpeta; se lo pedís a Isaias)). Textual: *"toppe de gamma esto, te
mejoraste un 1000%, esto es a lo que me refería"*. El estilo:

- fondo del color oscuro de la marca, casi negro, con grano, viñeta y polvo de luz;
- palabras clave enormes (Archivo pesada y angosta) que se prenden como tubo de
  neón, alternando el color de acento y el blanco claro;
- líneas chicas con Delayed Up slide y palabras grandes con Smooth Line Up (las
  curvas están en la skill `subtitulos-animados`);
- íconos inventados en SVG como tubos de neón.

**La regla nueva, pedida el mismo día: un solo mundo y una cámara que viaja.**
Todas las escenas están en el mismo fondo; la cámara se desliza de una a otra
(abajo, diagonal abajo-izquierda, abajo…) y lo de atrás no desaparece, sale de
cuadro. Lo que viene ya estaba ahí, apagado, y se prende cuando llega la cámara.
Isaias lo llama "3D, no 3D literal". La referencia fue el intro de un video de
Devin Jatho: paneo de unos 0,5 s que arranca lento, cruza rápido y se asienta
largo.

**Por qué:** cortar entre escenas "como si fuera un video nuevo" se siente armado
de a pedazos. Con la cámara, todo queda conectado en un solo lugar.

**Cómo aplicarlo:** partir de
`proyectos/02-motion-graphic-neon/src/mg2/Mundo.tsx`. Tomarse el
tiempo: *"si no, vas a hacer todo muy rápido y no se va a entender nada"*. Con 6 s y
cuatro escenas, los viajes van de 18 a 20 cuadros. El manual de marca del primer cliente prohibía elneón: se resolvió como brillo sobre los colores de la marca (con otra marca, sobre su acento). Y siguen valiendo
los topes de [movimiento.md](movimiento.md): dos por video, solo cuando los piden.

---
*De la memoria de Claude en la PC de Isaias · última versión: 23/09/2026*
