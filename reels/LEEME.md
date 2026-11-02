# Reels: estado y cómo retomar

## Serie «ZainSoft: qué es un sistema» (3 reels, 35-45 s, voz masculina ElevenLabs, Bit, fondo claro crema)
| # | Reel | Estado |
|---|---|---|
| 1 | Qué es un sistema (`zainsoft-sistema-01-que-es/`) | **Hecho**: `out/final.mp4` (36,4 s, −15,0 LUFS, pico −4,9 dBFS), `out/portada.png`, `PUBLICACION.md`. Falta: que el usuario lo vea y escuche completo y dé el visto bueno. |
| 2 | **Cómo se construye un sistema** (ciclo de vida: relevamiento → diseño → desarrollo y documentación → implementación → mantenimiento; `zainsoft-sistema-02-estructura/`) | **Hecho y APROBADO por el revisor** (2026-10-20): `out/final.mp4` (43,4 s, −14,5 LUFS, true peak −3,9 dBTP), `out/portada.png` (provisoria, con subtítulo), `PUBLICACION.md`. Falta: que el usuario lo escuche; detalle no bloqueante en 0,3-0,5 s (el techo del edificio tapa «de un día»), arreglable en una v02. El tema de las 4 piezas quedó en `descartado/`. |
| 3 | **A definir** (el plan original «cómo lo construimos» se superpone con el reel 2). Candidatos: caso Pierina Glow o las 4 piezas (`zainsoft-sistema-02-estructura/descartado/`). | El usuario lo define después. |

## Reel suelto «Esta invitación no se imprime» (tarjetas digitales, 2026-10-30)
`zainsoft-tarjetas-digitales/`: **hecho**, `out/final.mp4` (28,0 s, −14,5 LUFS, pico −4,3 dBFS), `out/portada.png`, `PUBLICACION.md`, `CREDITOS.md`.
Voz Armaan, fondo crema, Bit, capturas reales de las 3 tarjetas de la web (sacadas cuadro a cuadro con Playwright; ver `app/public/tarjetas/`).
Falta: que el usuario lo vea y escuche completo. Pasó la revisión de cuadros y de fantasmas en los tramos con rebote (CTA y confirmaciones); no se pasó por `revisor-calidad-reel`.
Trampa aprendida: una captura `fullPage` de una página con fondo `fixed` sale blanca después de la primera pantalla; hay que fijar el fondo por CSS antes de capturar.

## Reel «Una sola computadora» (hackeo a Binance + semana de hackeos, 2026-10-31) — HECHO
`zainsoft-binance-hackeo/`: `out/final.mp4` (59,5 s, −14,5 LUFS, pico −3,2 dBFS, **con música**; viene de `out/v03.mp4`), `out/portada.png`, `STORYBOARD.md`, `CREDITOS.md`, `PUBLICACION.md`.
Composición `app/src/reel/BinanceReel.tsx`, fondo crema con viñeta y luz que se vuelve cálida en el giro. Voz de 57,4 s sin acelerar.
- Capturas citadas (`app/public/capturas/`): diapositiva 4 del post de @ingenia.ai, titulares de Infobae (30/10), BleepingComputer (Polymarket, 29/10) y Tokyo Reporter (GMO, 26/10). El comunicado oficial de Binance está en X y no se pudo capturar sin sesión.
- Aclaración en pantalla: «primer informe de Binance · 29/10» + titular «un ataque complejo» con sello ACTUALIZACIÓN 30/10 (Binance amplió la versión de la notebook).
- Falta: que el usuario lo vea y escuche completo. Fantasmas revisados en los 4 tramos con rebote; no se pasó por `revisor-calidad-reel`.
- Música: «Grey Square Tension» (leberch, Pixabay) en `audio/musica/`, mezclada en la pasada de cierre con ffmpeg (no en Remotion): lowpass 1,4 kHz hasta 41 s y fundido a la versión completa en 40,9–42,4 s, pozo de −3 dB en 2,2 kHz, sidechain con `voz_master.wav`, cama a −32 LUFS. La voz queda 27–29 dB arriba en 300–3500 Hz. Comandos en el historial de esta sesión; si se cambia la voz hay que rehacer la cama.
- Alineación: pausas entre frases ≥ 0,36 s y en comas 0,25-0,30 s → `MIN_SIL = 33` en `app/alinear-palabras.mjs`.

## Reel «Octubre Negro» (ola de ciberataques, 2026-10-22) — TERMINADO, no hay que tocarlo
Composición `mi-video/src/OctubreNegroReel.tsx` (datos en `mi-video/src/octubre/`, capturas en `mi-video/public/octubre/`), 60 s. Arranca oscuro y pasa a crema en "¿Pánico? No.".
Queda como referencia de estilo para el reel de Binance. La voz y el render no están en git (ignorados).

## Pendientes abiertos (del reel 1)
1. El usuario debe escuchar el video completo (no pude oírlo) y mirar el segundo ~16 (barra de ventas, único tramo donde dos renders difirieron levemente).
2. Licencias sin confirmar: voz «Armaan» de ElevenLabs (uso comercial en su plan), fuente Hando, sonidos `poof.aac` y `flash.aac`.
3. Pedir al equipo el logo de ZainSoft **en vector** (el del repo mide 246×118 px; se recreó en código).
4. Voz sintética: marcar como contenido con IA al publicar si la app lo pide.
5. Nada de este trabajo está en git (`git status`: todo sin seguimiento). Decidir si se hace commit/rama en el repo `edicion-ia` o se guarda aparte.
6. Pedir al equipo lo que no está en git (video final de Pierina+Bit, `pierina.mp4`, voces) si hace falta.
7. En `out/` solo quedan `final.mp4`, `portada.png` y `v06.mp4`: el usuario borró las versiones anteriores (incluida la oscura, que se regenera con los tokens de `docs/estilo-visual-reels.md`).

## Nota de entorno (2026-10-20)
- En la sesión solo se cargaron como agentes `validador-prompt` y `guionista-reel`; `productor-video`, `editor-video` y `revisor-calidad-reel` no aparecieron. Se usaron agentes generales que leen su `.md` y siguen sus instrucciones.

## Para empezar el próximo video
1. Abrir una sesión en `D:\Proyecto\Videos-Reels` (carga `CLAUDE.md` y los agentes).
2. Decir qué reel o tema es. El primer paso es `validador-prompt`, que **siempre pregunta el color de fondo** (aprobado hasta ahora: claro crema) y las demás dudas.
3. Usar la misma voz y ajustes de ElevenLabs (`docs/elevenlabs-guia.md`).
4. Leer `docs/aprendizajes-equipo.md` §12-13 antes de renderizar (flujo y trampas).
5. `ffmpeg` 9.0.2 está instalado; si la sesión no lo ve, reiniciar la terminal.
6. Para un reel nuevo, copiar `zainsoft-sistema-01-que-es/app/` sin `node_modules`, `out` ni `trabajo`, y correr `npm install` (~7 min).

## Mapa de documentación
- `CLAUDE.md`: flujo, reglas duras, entorno.
- `docs/estilo-visual-reels.md`: fondos y paletas.
- `docs/reels-sin-rostros.md`: formato de Instagram y técnicas sin rostros.
- `docs/elevenlabs-guia.md`: cómo generar la voz.
- `docs/aprendizajes-equipo.md`: lo aprendido (del equipo y de esta producción).
- `.claude/agents/`: validador-prompt, guionista-reel, productor-video, editor-video, revisor-calidad-reel.
