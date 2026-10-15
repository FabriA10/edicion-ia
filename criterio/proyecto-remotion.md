# Todo el video se hace en Remotion

Todo el motion y la edición de video se hace con **Remotion**. DaVinci
quedó descartado. Textual de Isaias: *"davinci ya no, sacatelo de la cabeza, usá
full remotion"*.

En esta carpeta el proyecto está en `proyectos/01-base-talking-head/`.

**Por qué:** se eligió consolidar en una sola herramienta programática en vez de un
editor tradicional. Un cambio de criterio se aplica a todos los cortes de una vez,
en vez de a mano uno por uno.

**Cómo aplicarlo:** cualquier pedido de edición, subtitulado o motion se
resuelve ahí. El método completo, paso por paso, es el de la skill `edicion-video`.
Lo que hay que tener claro desde el principio:

1. Convertir el MOV de iPhone a MP4 1080×1920 con ffmpeg. En la PC de Isaias NVENC
   falla, así que se usa `libx264`.
2. Transcribir con faster-whisper (`small`, con tiempos por palabra):
   `python transcribir.py <crudo> trabajo/vNN/transcripcion.json`. Tarda unos
   40 min para 11 min de audio. Para elegir tomas, la skill arma además un menú
   que transcribe cada pasada aislada (`scripts/pasadas.mjs` + `scripts/menu.py`).
3. **Whisper deriva hasta 0,6 s contra el audio real**: no confiar en sus tiempos
   para los cortes. Los bordes se miden con la envolvente (ver
   [cortes.md](cortes.md)). Este paso es el que hace que los cortes no se coman
   palabras.
4. Verificar el render antes de darlo por bueno (transcribirlo de vuelta, buscar
   cuadros de fondo, medir el nivel). Está en la sección "Verificación" de la skill.

**Los crudos suelen ser tomas repetidas del mismo guion** (Isaias repite cada frase
5 a 15 veces): el trabajo es elegir la mejor toma de cada bloque, no recortar
muletillas. También sirve empalmar el arranque de una toma con el final de otra
cuando una se traba.

Ver [subtitulos.md](subtitulos.md) para el subtitulado,
[micro-estudio-obs.md](micro-estudio-obs.md) cuando el micrófono se grabó aparte,
[logos-de-marcas.md](logos-de-marcas.md) cuando el video nombra marcas y
[trabajar-sin-preguntar.md](trabajar-sin-preguntar.md) para la forma de trabajo.

---
*De la memoria de Claude en la PC de Isaias · última versión: 17/09/2026*
