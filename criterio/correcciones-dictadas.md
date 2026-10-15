# Las correcciones llegan dictadas, desordenadas y con capturas

Mirando el render, Isaias dicta las correcciones **en un solo mensaje largo**:
transcripción de voz con tartamudeos, minutos de referencia ("1:05", "1.34"), órdenes
mezcladas con lo que está escuchando ("en cambio, en cambio, la publicidad no simple"
= lo que oye, no lo que pide) y frases condicionales ("fíjate si…, si ese era el
último, déjalo tal cual"). A veces adjunta una captura del celular con un círculo rojo.

## Cómo aplicarlo

- **Desglosarlo en ítems numerados antes de tocar nada.** Las condiciones ("si es la
  última toma, déjalo") se verifican y se informa el resultado **con el número que lo
  respalda**; no se "arreglan" por las dudas.
- **"Inspirate" / "no sé, algo que dé miedo" es libertad creativa**: decidir, hacerlo
  entero y contar qué se eligió; no preguntar. Lo que sigue sin confirmar se lista en
  la respuesta.
- **Los minutos son del render que miró (la versión anterior), no del nuevo**: al
  sacar un tramo todo se corre.
- **Del círculo rojo al lienzo.** Emparejar puntos ORB entre la captura (con el rojo
  tapado) y el cuadro exacto del render (`cv2.estimateAffinePartial2D`, RANSAC),
  invertir la transformación y llevar los píxeles rojos. En una captura real dio 204
  aciertos de 300 y el círculo cayó en y 793-1219 de 1920. A ojo, el visor de la
  captura recorta y escala distinto. (No hay script guardado: son unas veinte líneas
  de OpenCV — `ORB_create`, `BFMatcher`, `estimateAffinePartial2D`.)

## Por qué

La primera lectura del texto dictado suele dar órdenes equivocadas (qué se quita,
qué se deja); la persona revisa con lupa y vuelve con más correcciones, así que cada
ítem mal entendido cuesta una vuelta entera de render.

Ver [trabajar-sin-preguntar.md](trabajar-sin-preguntar.md) y
[como-trabaja-isaias.md](como-trabaja-isaias.md).
