# Guía: generar la voz masculina en ElevenLabs

Para los reels de ZainSoft. Se hace en la web de ElevenLabs con tu cuenta: nadie más necesita tu clave (`criterio/voz-en-off.md`: el repo no usa claves de otras cuentas). La interfaz cambia seguido; si un nombre no coincide, busca el equivalente.

## Antes de empezar
- **Plan pago** (Starter o superior): el plan gratis no permite uso comercial según las fuentes consultadas; confirma en los términos de ElevenLabs. Genera el audio final con el plan activo y guarda la factura.
- Cuenta de créditos: un reel de ~100 palabras gasta unos pocos cientos de caracteres; regenerar varias veces es normal.

## Pasos
1. Entra a elevenlabs.io → **Text to Speech**.
2. **Elegir la voz**: abre el selector de voces → **Explore / Voice Library** → filtros: idioma **Spanish**, género **Male**, acento latinoamericano (si hay argentino/rioplatense, mejor). Escucha 4-5 con **esta frase de prueba**: «¿Pensás que en ZainSoft hacemos páginas web? Casi. Hacemos sistemas.» Elige la que suene cercana y segura, y pulsa **Add to my voices**.
   - Si la voz tiene restricciones de uso comercial, descártala. No clones la voz de una persona real sin su permiso.
3. **Modelo**: usa el multilingüe más reciente que te ofrezca (Multilingual v2 es la opción estable; v3 es más expresivo pero menos predecible).
4. **Ajustes** (punto de partida): Stability media (~40-55 %) para que no suene monótona; Similarity alta; Speed 1.0 (si suena lenta, 1.05). Una vez elegidos, **no los cambies en los 3 reels**: la voz debe ser la misma.
5. **Pegar el texto** del bloque «Texto para ElevenLabs» de `GUION.md`, sin títulos ni notas. **Genera por escena** (un párrafo cada vez) para repetir solo la que salga mal; la última escena puede tener un poco más de energía.
6. **Pronunciación de «ZainSoft»**: debe sonar «sáin-soft». Si sale mal, en el texto enviado escribe «Sainsoft» (en pantalla va ZainSoft). Revisa también el voseo: «pensás», «trabajás», «escribinos».
7. **Escucha completo** antes de descargar. Vuelve a generar las escenas con error de énfasis o ritmo.
8. **Descarga el MP3** (`Download`) y guárdalo como:
   `D:\Proyecto\Videos-Reels\reels\zainsoft-sistema-01-que-es\audio\voz.mp3`
   Si bajaste las escenas por separado, guárdalas como `voz-01.mp3`, `voz-02.mp3`… y las uno yo.
9. Avísame: mido duración y niveles con ffprobe, alineo las palabras con `alinear-palabras.mjs` (whisper.cpp no funciona en esta PC) para sincronizar a Bit y los subtítulos, y ajusto las escenas a los tiempos reales.

## Para toda la serie
Anota el nombre de la voz y los ajustes en este archivo cuando los elijas:
- Voz elegida (reel 1): **Armaan - Funny & Expressive Vlogger** (voz clonada profesional de la biblioteca; archivo `..._pvc_sp100_s50_sb75_v4`).
- Ajustes que muestra el nombre del archivo: Speed 1.0 · Stability 50 · Similarity 75. Modelo: _(no consta; anotarlo)_.
- **Mantener los mismos en los reels 2 y 3.** Pendiente: confirmar que esa voz permite uso comercial en el plan del usuario.

## Fuentes
- https://bigvu.tv/blog/elevenlabs-pricing-2026-plans-credits-commercial-rights-api-costs/
- https://oakgen.ai/blog/elevenlabs-free-commercial-use
