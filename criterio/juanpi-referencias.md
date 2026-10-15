# Juanpi: estilos de referencia y la config que le pasaron

## 06/10/2026 — pedido

Juanpi pasó una grabación de pantalla con reels de **devinjatho**, **rumedias** y
**lewisdang**, y una configuración de edición que le pasó otro editor. Textual:

> "encontré un chico que pasó su configuración para editar y quiero ver qué onda,
> agregalo de skills, además quiero que tengas de referencia para que puedas editar de
> manera distinta dependiendo del video que sea, así que ahí te paso videos de cuentas
> que editan muy bien y la tomes de referencia o copies su estilo de edición, efectos,
> subtítulos, recortes, sonidos, animaciones, motion graphics, sonidos, TODO QUIERO QUE
> COPIES o tomes de referencia"

## Qué se decidió

- La configuración entró como la skill **`formato-partido`** (se llamaba
  `editar-video`; se renombró para que no compita con `edicion-video` cuando piden
  "editá este video"). Se usa cuando la piden o cuando el video es explicativo y la
  animación enseña.
- Los estilos quedaron en la skill **`estilos-de-referencia`**, con la tabla de qué
  estilo va con qué tipo de video. Material en `referencias/`.
- **Choques con el criterio del kit, resueltos a favor de Juanpi** (él pidió copiar):
  cuando se edita con un estilo de referencia, sus subtítulos reemplazan a los del kit
  (devinjatho: MAYÚSCULA, dos líneas, color con brillo, titulares no literales;
  rumedias: dos niveles con la palabra clave en azul; formato partido: blancos y planos,
  sin placa), y también su paleta, transiciones y sonido.
- **No cambia**: tomas sin trabas, bordes medidos, zona segura física (250/1500 px y
  120 px a los costados), −14,5 LUFS, verificaciones, y Compumaq sigue con
  `reel-dopamina-juanpi` salvo que Juanpi pida otra cosa.

## 06/10/2026 — fuentes y HyperFrames

Juanpi, textual: *"ok instalo y de paso instala el hyperframes también"*.

- Se instaló `@remotion/google-fonts@4.0.525` en `01-base-talking-head` (Poppins,
  Montserrat, Cinzel para los estilos de referencia).
- Se instaló HyperFrames (CLI global 0.8.136, su Chrome, sus 21 skills y
  `proyectos/19-hyperframes-base/`). Queda **a pedido**: el default sigue siendo Remotion.
- Incidente: el primer `npx skills add heygen-com/hyperframes` en la raíz **pisó la skill
  `motion-graphics` del kit** (HyperFrames tiene una con el mismo nombre). Se restauró
  idéntica (mismo hash) desde la copia bajada de Drive el 02/10
  (`E:\Descargas\Juanpi Edición-…`). Desde ahí, solo `instalar\actualizar-hyperframes.ps1`.
