# Video del 29/09: collage de hook, columna izquierda y "generación Z"

Dos crudos (57 s y 18 min). Entregas: v1 (corte limpio + grade + un "scratch") y
**v2, aprobada el 30/09** ("todo bien, los cortes, los zooms, la música… por el resto
está excelente"). Todo vive en `proyectos/08-collage-columna-izquierda/`; el orden de
los scripts está en `trabajo/scripts/LEEME.txt`.

## Lo que pidió en la v2 (con capturas marcadas en rojo)

- Cortes **"de generación Z": 60 ms de respiro** entre frases (ver la nota abierta en
  [cortes.md](cortes.md)).
- **Hook**: él recortado delante de un **collage** de 14 fotos que mandó, que se
  asientan y **estallan en el corte** a la parte 2. Sin subtítulos en el hook.
- **Parte 2**: tarjetas de íconos animadas y **subtítulos en la columna izquierda**
  (x 30-355 al principio; ver [encuadre-y-zona-roja.md](encuadre-y-zona-roja.md): la
  columna final va en x 110-435).
- Motion graphics: "3 formas" (una dona vuela a una tarjeta) y una portada de manual
  ("comentá la palabra"; maqueta hasta que haya la portada real).
- Un **globo con el texto de la voz en off**; la colita apunta hacia el costado desde
  el que habla (derecha), porque la voz viene de afuera de cuadro.
- **Música** del reel anterior que **se frena con el scratch** y vuelve en el corte a
  la parte 2.

## Correcciones ya hechas

- Sacar el amago "y en" del arranque del CTA (todo lo posterior se corrió 0,3 s).
- El globo "se buguea": saltaba de tamaño con los puntitos; el tamaño tiene que ser
  fijo.

## Cosas técnicas que salieron de este video

- **El iPhone grabó VFR** (cuadros a velocidad variable): se corta por `pts`, no por
  número de cuadro (`references/generador.md`, `trabajo/scripts/pts-p1.csv`).
- **La pared de este crudo no era verde**: era celeste grisácea. La clave sale de la
  distancia a un modelo de pared + una placa limpia (`trabajo/scripts/clave/`), no del
  exceso de verde (ver [pared-verde.md](pared-verde.md)).
- La voz en off se generó con una voz de ElevenLabs y se dejó como MP3: va en un hueco
  medido, 0,12 s antes de la respuesta de él. Ver [voz-en-off.md](voz-en-off.md).
