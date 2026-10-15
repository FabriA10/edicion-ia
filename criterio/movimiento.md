# Movimiento: la curva, los zooms y los motion graphics

Todo lo que se mueve en los videos usa **una sola curva**, y no es la suavización de
manual. La de manual reparte la aceleración entre entrada y salida y queda con aire
de plantilla. La de la marca **sale disparada en el primer cuadro y se va frenando**
hasta posarse. En Fusion se arma tirando el tirador del primer punto casi a 90°
hacia abajo y estirando apenas el del segundo; en Remotion es
`Easing.bezier(0.16, 1, 0.3, 1)` (`SALIDA_SUAVE` en `src/base/curvas.ts`).

Reglas de uso:

- **Zooms: cuatro que entran y cuatro que salen** por video, y **solo cuando Isaias
  los pide**. Los que salen arrancan punchados (1,2-1,35) y se posan en 1; los que
  entran cierran en 1,08-1,10. (En los videos de la clienta el plan de zooms fue otro:
  ver [clienta-dos-camaras.md](clienta-dos-camaras.md).)
- **Motion graphics: dos por video, nunca más, y solo cuando Isaias los pide.**
  Cuando los pide, el trabajo es elegir dónde encajan en la explicación y qué
  animación conviene. El estilo aprobado está en
  [motion-graphics-estilo.md](motion-graphics-estilo.md).
- **Antes de fijar la posición de una gráfica, mirá dónde está la cabeza en esa
  toma.** No alcanza con respetar la zona segura: en los planos de escritorio el
  pelo llega hasta los ~650 px y cualquier etiqueta apoyada ahí se lee como que lo
  tapa. Textual: *"siempre cuando hagas animaciones, fijate dónde está la cara y
  ponelo todo por esta altura"*. Conviene revisarlo en el cuadro donde la cabeza
  queda más alta, no en uno cualquiera.

**Por qué:** son criterios que Isaias dio una vez, en detalle y con capturas del
editor de curvas; aplicarlos mal se nota enseguida: un zoom con la curva equivocada
se lee como plantilla.

**Cómo aplicarlo:** el detalle largo está en `references/movimiento.md` de la skill
`edicion-video`. Ver también [proyecto-remotion.md](proyecto-remotion.md) y
[cortes.md](cortes.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 23/09/2026*
