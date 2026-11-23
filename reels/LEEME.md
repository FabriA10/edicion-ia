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

## Reel «3 señales de que tu negocio necesita un sistema» (informativo, 2026-11-23) — HECHO
`zainsoft-senales-sistema/`: `out/final.mp4` (33,0 s, −14,6 LUFS, pico −3,5 dBFS, **con música**), `out/portada-9x16.png`, `BRIEF.md`, `GUION.md`, `STORYBOARD.md`, `CREDITOS.md`, `PUBLICACION.md`.
Composición `app/src/reel/SenalesReel.tsx`, fondo crema, todo en código salvo la planilla: **captura de un Excel real** (pedido del usuario) con datos de ejemplo, en `app/public/excel/` (`.xlsx` con autor «ZainSoft» + `excel.png` con las iniciales de la cuenta tapadas). `final.mp4` viene de `out/v02.mp4`; la versión con la planilla dibujada es `final_v01.mp4`. Tiempos atados a las palabras de la voz (31,8 s).
- **Primera vez de los subtítulos con volumen en fondo claro**: colores de `docs/estilo-visual-reels.md` (tinta → `#8A8173`, naranja → `#A8401C`, verde → `#006B3C`, rojo → `#8E1B12`), sin el óvalo blanco; se leen bien.
- Logo con ícono original y «Zain» negro (regla del fondo claro).
- Música «Upbeat Acoustic» (The Mountain, Pixabay) desde 0 s, cama −32 LUFS agachada; la voz queda 26 dB arriba en 300-3500 Hz.
- Falta: que el usuario lo vea y escuche completo; confirmar el origen de la música. No se pasó por `revisor-calidad-reel`.

## Reel «¿Ya está lista mi moto?» (caso real LV Racing, 2026-11-20) — HECHO
`zainsoft-caso-lv-racing/`: `out/final.mp4` (31,1 s, −14,5 LUFS, pico −3,4 dBFS, **con música**, viene de `out/v04.mp4`: logo con ícono original y «Zain» blanco + **subtítulos con volumen** + **fotos reales de piezas** (Pexels, en `app/public/fotos/`) en el visor y la galería de Mi Garage; versiones anteriores `final_v01`–`final_v03.mp4`), `out/portada-9x16.png`, `BRIEF.md`, `GUION.md`, `STORYBOARD.md`, `CREDITOS.md`, `PUBLICACION.md`.
Composición `app/src/reel/LvReel.tsx`, **fondo OSCURO** (pedido del usuario) con un círculo de luz cálida detrás de Bit para que se lea su mitad negra. Tiempos atados a las palabras de la voz (29,9 s).
- Cliente autorizado (usuario, 2026-11-20). Capturas de lo **público** de `lv-racing-web.vercel.app` (portada y login de Mi Garage, sin iniciar sesión) en `app/public/lv/`; tablero, cámara y portal por dentro son **recreación** con datos inventados (rotulada en pantalla).
- Música «Rock» (The Mountain, Pixabay) desde 41 s: tiene mucha energía en la banda de la voz (28-34 %), así que va con hueco de −5 dB en 1,2 kHz y −4 dB en 2,5 kHz; la voz queda 24,7 dB arriba en 300-3500 Hz.
- Al publicar: etiquetar a @lvracingtucuman.
- Falta: que el usuario lo vea y escuche completo; confirmar el origen de la música. No se pasó por `revisor-calidad-reel`.

## Reel «Son las 23 y tu WhatsApp no para» (turnos online, 2026-11-15) — HECHO
`zainsoft-turnos-online/`: `out/final.mp4` (29,2 s, −14,5 LUFS, pico −4,0 dBFS, **con música**), `out/portada-9x16.png` (1080x1920; todo dentro del 3:4), `BRIEF.md`, `GUION.md`, `STORYBOARD.md`, `CREDITOS.md`, `PUBLICACION.md`.
Composición `app/src/reel/TurnosReel.tsx`, **todo dibujado en código** (la web no tiene demo de turnos): WhatsApp a las 23:04, sillón vacío «NO VINO», agenda web, agenda del dueño, recordatorio con chips WhatsApp/Mail/SMS, íconos «menos…», poste de barbería. Rubro barbería. Tiempos atados a las palabras de la voz (`at('palabra')`).
- Marca de WhatsApp y recordatorio por WhatsApp, mail o SMS: aprobados/dados por el usuario (2026-11-15).
- Voz de Bit en `audio/voz/voz.mp3` (copiada a `audio/voz.mp3`), 28,0 s. Música «Chill Acoustic» (velariomusic, Pixabay) desde 34 s, cama −32 LUFS agachada; **entra recién en 3,0 s**, después de «…no para:» (pedido del usuario: momento tenso sin música). Versión anterior con música desde el inicio: `out/final_v01.mp4`.
- Portadas: desde este reel se entrega `portada-9x16.png` (la 3:4 se cortaba de costado en la pestaña Reels).
- Falta: que el usuario lo vea y escuche completo; confirmar el origen de la música. No se pasó por `revisor-calidad-reel`.

## Reel «El menú en PDF que nadie puede leer» (menú digital con QR, 2026-11-05) — HECHO
`zainsoft-menu-digital/`: `out/final.mp4` (28,2 s, −14,5 LUFS, pico −4,1 dBFS, **con música**; viene de `out/v02.mp4`), `out/portada.png`, `BRIEF.md`, `GUION.md`, `STORYBOARD.md`, `CREDITOS.md`, `PUBLICACION.md`.
Composición `app/src/reel/MenuReel.tsx`, fondo crema, voz de Bit (27,0 s). **Todos los tiempos salen de las palabras de la voz** (`at('palabra')`): si se cambia la voz, se alinea de nuevo y se renderiza sin tocar escenas.
- El «celular» es la maqueta de la demo de la web: capturas reales en `app/public/demo/` (m0–m3 y la tarjeta «Así le llega al local por WhatsApp»), medidas en `app/src/menu-medidas.json`. El PDF y el escaneo del QR se dibujan con el mismo marco.
- El cambio de precio $12.500 → $13.200 es ilustrativo y dice «(ejemplo)»; el QR es decorativo.
- Música: «Lounge Chill» (velariomusic, Pixabay) desde 22 s, cama a −32 LUFS agachada por la voz (sin filtro oscuro). La voz queda 27 dB arriba en 300–3500 Hz.
- Corregido en v02: el PDF del gancho se leía perfecto mientras Bit decía «nadie lo puede leer»; ahora es un escaneo borroso y torcido desde el inicio.
- Falta: que el usuario lo vea y escuche completo; confirmar el origen de la música. No se pasó por `revisor-calidad-reel`.

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
