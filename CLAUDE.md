# Videos-Reels: reels de Instagram sin rostros

Espacio de trabajo para producir reels verticales (1080x1920) **sin rostros humanos**.
Base: el repo `FabriA10/edicion-ia` (criterios en `criterio/`, skills en `.claude/skills/`, sonidos, música, marca).
A ese repo se le agregó: `.claude/agents/`, `reels/`, `docs/reels-sin-rostros.md` y este archivo.

Responder en español.

## Flujo (orquestas tú, la sesión principal)

Cada reel vive en `reels/<slug>/`. No se salta ningún paso ni su compuerta.

| # | Agente | Entrada | Salida | Compuerta |
|---|--------|---------|--------|-----------|
| 1 | `validador-prompt` | el pedido del usuario | preguntas + `BRIEF.md` borrador | Hazle las preguntas al usuario con AskUserQuestion, **siempre incluida la del color de fondo**; `estado: aprobado` solo con su confirmación |
| 2 | `guionista-reel` | `BRIEF.md` aprobado | `GUION.md`, `STORYBOARD.md` | El usuario aprueba el storyboard |
| 3 | `productor-video` | storyboard | `out/v01.mp4`, `CREDITOS.md` | ffprobe + cuadros revisados |
| 4 | `editor-video` | `out/vNN.mp4` | `out/final.mp4`, `portada.png` | LUFS y pico medidos |
| 5 | `revisor-calidad-reel` | `out/final.mp4` | `APROBADO` / `RECHAZADO` | Si rechaza, vuelve al agente que indica |

Los subagentes no hablan con el usuario: las preguntas las hace la sesión principal. Un agente puede ejecutarse solo si el
usuario lo pide (p. ej. "solo edita este video").

## Reglas duras
- **Color de fondo: se pregunta SIEMPRE antes de producir** cualquier video nuevo, aunque el usuario no lo mencione. No se asume ni se copia del reel anterior. Opciones, tokens y cuándo recomendar cada una: `docs/estilo-visual-reels.md` (el usuario aprobó el fondo claro crema el 2026-10-20 porque Bit tiene media cara negra).
- **Sin rostros humanos**, ni reales, ni de stock, ni generados, ni ilustrados realistas. Alternativas: tipografía, objetos, pantallas, manos sin cara, siluetas, personajes abstractos. Ver `docs/reels-sin-rostros.md`.
- Zona segura: contenido clave en x 120-960, y 250-1670.
- Audio final −14,5 LUFS, pico ≤ −1 dBTP (`criterio/audio.md`).
- No inventar cifras ni datos; no usar claves, voces ni cuentas de otros proyectos (`criterio/voz-en-off.md`).
- Todo asset de terceros se anota en `reels/<slug>/CREDITOS.md` con fuente y licencia.
- Las reglas de `criterio/` salieron de correcciones reales: no se cambian sin que el usuario lo pida (`criterio/LEEME.md`).
- Los entregables no se sobrescriben: `v01`, `v02`, … y `final`.

## Entorno
- Remotion (Node) para componer; `ffmpeg`/`ffprobe` para medir y exportar. **Verificar con `ffmpeg -version` al empezar**: si falta, avisar (`winget install Gyan.FFmpeg`).
- **Esta PC es un Pentium Gold G5420 (sin AVX)**: whisper.cpp se cierra al iniciar; no usarlo. Los subtítulos se alinean con `app/alinear-palabras.mjs` (guion conocido + silencios).
- **Render siempre con `--gl=swangle`** y los visuales con `key={frame}` (si no, aparecen fantasmas y parpadeos). Ver `docs/aprendizajes-equipo.md` §12; flujo operativo completo en §13; estado y pendientes en `reels/LEEME.md`.
- `*.mp4`, `out/`, `node_modules/` están en `.gitignore`.
- No se ejecutan scripts del repo sin leerlos; los de `instalar/` modifican rutas y el entorno del usuario.

## Mapa
- `docs/estilo-visual-reels.md` : paletas de fondo (claro crema aprobado / oscuro), tokens y regla de preguntar el fondo.
- `docs/aprendizajes-equipo.md` : lo que el equipo aprendió haciendo el reel de Bit/Pierina (leer antes de producir). Se actualiza con cada `git pull`.
- `reels/_plantilla/BRIEF.md` : plantilla del brief.
- `docs/reels-sin-rostros.md` : formato de Instagram, zona segura, técnicas sin rostros, licencias.
- `criterio/`, `.claude/skills/`, `sonidos/`, `musica/`, `marca/`, `referencias/` : del repo base.
- `CONOCIMIENTOS.md` : índice del repo base (algunas rutas son de otra PC).
