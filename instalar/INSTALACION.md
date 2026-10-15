# Instalación

## La forma corta

1. Abrí **esta carpeta entera** como proyecto en Claude Code (la pestaña **Code** de la
   app de escritorio de Claude, o `claude` desde la terminal parado en la carpeta).
2. Escribile: **"instalá la carpeta"**.

Claude lee `CLAUDE.md`, corre `instalar\instalar.ps1`, te pide permiso para lo que
modifique tu PC (instalar programas) y al final te dice qué quedó listo. Si querés
hacerlo vos, es un solo comando:

```powershell
powershell -ExecutionPolicy Bypass -File instalar\instalar.ps1
```

Opciones útiles: `-SoloVerificar` (no instala nada, solo dice qué falta),
`-Crudos "D:\Videos\crudos"` y `-Obs "D:\Obs grabaciones"` (dónde están tus archivos),
`-Tipografias` (instala Hando y Archivo en Windows, solo para las vistas previas).

## Qué instala (y las versiones con las que funciona)

Las versiones son las que funcionan en la PC de Isaias (Windows 10). No hace falta clavar
el número exacto; si algo falla, compará contra esto antes de investigar.

| Herramienta | Versión de referencia | Para qué | Cómo |
|---|---|---|---|
| Node.js | v24.19.0 (npm 11.17.0) | corre Remotion y los scripts `.mjs` de medición | `winget install OpenJS.NodeJS.LTS` |
| FFmpeg **full build** | 9.0.1 (gyan.dev) | convierte crudos, mide, sincroniza, ecualiza, arregla el render. **Tiene que ser el full, no el essentials**: se usan `silencedetect`, `loudnorm`, `alimiter`, `acompressor`, `sidechaincompress`… | `winget install Gyan.FFmpeg` |
| Python | 3.12.10 | transcribe con Whisper y arma sonido/medición | `winget install Python.Python.3.12` |
| faster-whisper, numpy, scipy, pillow, opencv-python | faster-whisper 1.2.1, numpy 2.5.3, scipy 1.18.1, pillow 12.3.0 | transcripción, medición, imagen del susto | `pip install …` (lo hace `instalar.ps1`) |
| Dependencias de Remotion | remotion 4.0.525 | render de los 11 proyectos (~560 MB, **una sola vez**) | `npm ci` en `proyectos\01-base-talking-head` |
| Claude Code | — | | app de escritorio de Claude, pestaña Code |

Los modelos de Whisper se bajan solos la primera vez y quedan en `~/.cache/huggingface`:
`small` (~0,5 GB: transcribir crudos y armar el menú de pasadas), `base` (verificar un
render), `medium` y `large-v3` (1,5 y 3 GB: escuchar tramos dudosos y comprobar música).

Para transcribir un crudo entero se usa el script del proyecto, no el CLI de
`openai-whisper`:

```bash
cd proyectos/01-base-talking-head
python transcribir.py public/crudo-NN.mp4 trabajo/vNN/transcripcion.json
```

Tarda unos 40 minutos para 11 minutos de audio: Claude lo lanza en segundo plano.

## Si winget instala algo nuevo

El PATH no se actualiza en la terminal que ya estaba abierta: **cerrala, abrí una nueva
y volvé a correr `instalar.ps1`**. El script te lo avisa.

## Después de instalar

- `instalar\verificar.ps1` revisa herramientas, filtros de FFmpeg, paquetes de Python,
  skills, sonidos, proyectos y rutas.
- **Prueba rápida con Claude**, ya adentro de la carpeta: *"¿cuántas palabras lleva como
  máximo un subtítulo y a cuántos LUFS se entrega el audio?"*. Tiene que contestar
  **4 palabras** y **−14,5 LUFS**. Si no lo sabe, no abriste la carpeta correcta.
- Para mirar un proyecto: `npm run dev` dentro de su carpeta abre Remotion Studio.
- Para un proyecto nuevo (copia de otro): corré `instalar\preparar-proyectos.ps1` y lo
  enlaza solo al mismo `node_modules`.

## HyperFrames (opcional, se instaló el 06/10/2026)

No lo instala `instalar.ps1`: es aparte y solo hace falta si se quiere hacer video en
HTML con HyperFrames en vez de Remotion. En una PC nueva:

1. `npm i -g hyperframes` (la herramienta; necesita Node 22 o más y FFmpeg).
2. `hyperframes browser ensure` (baja su Chrome para renderizar, ~115 MB).
3. Las skills ya vienen en `.claude/skills/`. Para actualizarlas:
   `powershell -ExecutionPolicy Bypass -File instalar\actualizar-hyperframes.ps1`.
   **Nunca** con `npx skills add/update` ni `hyperframes skills update` en la raíz del
   kit: pisan la skill `motion-graphics` del kit.
4. `hyperframes doctor` revisa todo. whisper-cpp, Kokoro, MusicGen y Docker son
   opcionales (transcribir y voces se hacen con lo del kit).

Junta datos de uso anónimos; se apaga con `hyperframes telemetry disable`.

**Si el C: tiene poco espacio** (la PC de Juanpi): los modelos de Whisper
(`%USERPROFILE%\.cache\huggingface`, ~5 GB), el Chrome de HyperFrames
(`%USERPROFILE%\.cache\hyperframes`) y la herramienta global se pueden mover a otro disco
dejando una junction (`mklink /J <ruta vieja> <ruta nueva>`). La caché de npm no: con
junction npm falla; se usa `npm config set cache "<disco>:\…\npm-cache"`.

## Configuración recomendada de Claude Code

- **Permisos en modo automático (Auto)**: Isaias le deja el encargo y se va; Claude corre
  los comandos largos (transcribir, renderizar) sin pedir permiso a cada paso.
- **Modelo: el más capaz disponible, con esfuerzo alto.** El criterio de edición es fino y
  los modelos más chicos lo aplican peor.
- **Un chat por video.** Si abrís varios chats sobre el mismo proyecto, uno pisa al otro
  (`criterio/sesiones-en-paralelo.md`).

## Si usás Mac

Los scripts de instalación son de Windows (PowerShell). El resto (Remotion, ffmpeg,
Python, las skills) funciona igual: instalá Node, ffmpeg y Python con Homebrew, corré
`npm ci` en `proyectos/01-base-talking-head`, hacé las junctions con `ln -s` y pedile a
Claude que adapte `ajustar-rutas.ps1` (son reemplazos de texto). Los `.sh` ya son bash.
