# Reels de Instagram sin rostros: formato, técnica y reglas

Investigado el 2026-10-19. Las fuentes son blogs y prensa; **se contradicen en varios números**, así que
lo marcado «verificar» debe confirmarse en help.instagram.com antes de publicar a escala.

## 1. Formato técnico

| Parámetro | Valor a usar | Nota |
|---|---|---|
| Relación / resolución | 9:16, **1080x1920** | consistente en todas las fuentes |
| Cuadros por segundo | 30 fps | 60 solo si hay mucha acción |
| Códec | MP4, H.264, yuv420p, `+faststart` | |
| Audio | AAC estéreo 48 kHz, ≥128 kbps | |
| Bitrate de video | ~5 Mbps o más (Remotion CRF 18 lo supera) | |
| Duración | **20-35 s ideal; ≤ 60 s práctico** | límite de la app: 90 s según unas fuentes, hasta 3 min según otras (verificar) |
| Tamaño | < 100 MB típico | tope de 4 GB según fuentes |
| Portada | **1080x1440 (3:4)** con lo importante en un cuadrado central de 1080x1080 | la rejilla del perfil se recorta a 3:4 o 1:1 según versión (fuentes en conflicto) |

## 2. Zona segura (interfaz de Instagram encima del video)
Fuentes: franja superior y/o inferior de ~250 px tapada (usuario, descripción, botones de me gusta/comentar/compartir a la derecha).
Reglas del proyecto, más conservadoras que cualquier fuente:
- **x 120-960 e y 250-1670** para todo texto y elemento clave.
- Los costados se suman a la «zona roja» de celulares 20:9 que recortan ~108 px por lado (`criterio/encuadre-y-zona-roja.md`).
- El llamado a la acción final no va en la franja inferior: la tapa el pie del reel.
- Verificación: dibujar guías en un cuadro de prueba y revisarlo.

## 3. Cómo se hace un reel atractivo sin caras
Un reel sin rostros compite por **ritmo, claridad y sorpresa visual**. Técnicas, de más barata a más costosa:
1. **Tipografía cinética**: palabras clave grandes que entran con curva (no lineal), énfasis por color y escala. Se hace 100 % en código (Remotion).
2. **Motion graphics / infografía**: contadores, barras, mapas, íconos, diagramas (`hyperframes-animation` y `motion-graphics` del repo).
3. **Capturas de pantalla / UI simulada**: chat, buscador, panel, editor (`formato-chatgpt-simulado.md`). Ojo: sin avatares con foto.
4. **Objetos y manos sin rostro**: producto, escritorio, teclado, plano cenital. Si el usuario filma, que sea sin cara.
5. **Stock sin personas**: paisajes, ciudad, naturaleza, objetos, texturas, abstractos. Filtrar «no people» y revisar cada clip.
6. **Ilustración / personajes abstractos**: siluetas, formas, mascotas no humanas. `criterio/animacion-2d-personajes.md`.
7. **Imagen/video generado por IA**: solo sin personas (el riesgo de caras raras y de etiquetado es alto).

Ritmo: gancho en 0-2 s, evento cada 2-3 s, subtítulos siempre (mucha gente ve sin sonido), final que invita a repetir.

## 4. Voz y música
- **Voz en off**: lo mejor es el MP3 del propio usuario o de un servicio que él controle (`criterio/voz-en-off.md`). Una voz provisoria de sistema sirve para pruebas, no para entregar.
- **Voz sintética de TTS**: no imitar a personas reales; revisar los términos de licencia de cada motor para uso comercial (no verificados aquí: Edge TTS, Piper, ElevenLabs tienen condiciones distintas).
- **Música**: pistas de `musica/` (origen y licencia a confirmar), música con licencia explícita, o la **biblioteca de Instagram** añadida al publicar desde la app (no se «hornea» en el archivo). La música comercial popular en un archivo subido puede silenciarse o reclamarse.
- Efectos de sonido: `sonidos/` (172). Confirmar su licencia antes de uso comercial.

## 5. Reglas de plataforma a tener en cuenta
- **Originalidad**: Instagram no recomienda a no seguidores las cuentas que sobre todo repostean (reglas ampliadas el 2026-04-30, ventana de 30 días). Cada reel debe ser creación propia, no un reenvío ni una copia mínimamente cambiada.
- **Etiqueta de IA**: hay etiquetas «AI info» por publicación y, desde 2026, una etiqueta de perfil para cuentas con personas generadas por IA (fuentes en conflicto sobre detalles). Un reel sin personas y con IA solo en imagen/voz debe marcarse como contenido con IA si Instagram lo pide al publicar.
- No hay regla específica contra cuentas «faceless»; el riesgo es el contenido repetitivo o producido en masa.
- Licencias de stock: Pexels y Pixabay permiten uso comercial sin atribución, pero con restricciones (no revender sin modificar, marcas y logos visibles siguen protegidos). Anotar cada asset en `CREDITOS.md`.

## 6. Qué falta en este equipo (a 2026-10-19)
- `ffmpeg` / `ffprobe` **no están en el PATH**: sin ellos no se puede medir ni exportar. Instalar con `winget install Gyan.FFmpeg`.
- Whisper (para subtítulos sincronizados) no verificado: el repo usa Python con `openai-whisper`. Python 3.14 podría no tener ruedas de todas las dependencias; si falla, usar 3.11/3.12.
- Fuente Hando Bold y varios assets del repo son de licencia propia del cliente original: confirmar antes de reutilizar.

## Fuentes consultadas
- https://argil.ai/blog/instagram-reel-size-e350f
- https://postfa.st/sizes/instagram/reels
- https://frameo.ai/blog/reel-size/
- https://www.mediapost.com/publications/article/417580/ (etiqueta de IA)
- https://pixabay.com/service/faq/ (licencia)
