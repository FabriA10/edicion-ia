# Reel 1: íconos sueltos y reveal de tres ejes

El Reel 1 (gancho: *"¿Qué contenido harías si fueras su odontólogo?"*) está en
`proyectos/03-reel-iconos-tres-ejes/`, composición `Reel1`. Render en
el render de ejemplo (no viene en esta carpeta; se lo pedís a Isaias).

Es una **copia aparte** del proyecto principal: cuando se armó, otra sesión de
Claude tenía cambios sin guardar en el original y se copió para no pisarlos (ver
[sesiones-en-paralelo.md](sesiones-en-paralelo.md)). **El código de `src/reel1/`
(`Cartelito.tsx`, `Insignia.tsx`, `iconos.tsx`, `IconosOverlay.tsx`,
`TresEjes.tsx`, `Reel1Edit.tsx`) todavía no se juntó con el proyecto principal.**
Si un video nuevo lo necesita, traé los componentes al principal.

**El formato, que no está en la skill:**

- Cartelito estilo sticker de pregunta de Instagram (rótulo + tarjeta clara),
  arriba a la izquierda del gancho en selfie.
- Íconos sueltos SOBRE el video (sin fondo verde de reemplazo, sin apagar
  subtítulos): 1 a 3 íconos por momento, en la franja libre arriba de la cabeza.
  Esto es distinto de los motion graphics de `src/base/motion/`, que tapan el
  plano entero y van 2 como máximo por video. Acá el tope fue "entre 3 y 4
  momentos" porque ese fue el pedido explícito de Isaias, no el límite general de
  motion graphics.
- Reveal de "tres ejes": título con brillo + 3 círculos que entran censurados
  (blur) y se destapan, con flechas curvas animadas conectándolos al título. Usa
  la curva de salida de la marca ([movimiento.md](movimiento.md)).

---
*De la memoria de Claude en la PC de Isaias · última versión: 22/09/2026*
