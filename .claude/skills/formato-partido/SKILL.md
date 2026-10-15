---
name: formato-partido
description: Formato partido para TikTok e Instagram en Remotion — animación arriba sobre lienzo blanco (806 px) y la cara abajo, con tramos split/full/face, animaciones con muelle que caen en la palabra que las nombra y sonidos cortos solo cuando confirman algo visible. Es la configuración que le pasaron a Juanpi (06/10/2026). Usala cuando Juanpi pida "formato partido", "animación arriba y cara abajo", "lienzo blanco arriba", "probá la config del chico", "el método nuevo" o un video explicativo donde la animación enseña lo que la voz cuenta. Para un "editá este video" sin más, siguen valiendo edicion-video y reel-dopamina-juanpi.
---

# formato-partido

> **De dónde sale:** configuración que le pasó un editor a Juanpi; la sumó el
> 06/10/2026 para probarla (*"encontré un chico que pasó su configuración para
> editar y quiero ver qué onda"*). El texto de abajo es el original. Se llamaba
> `editar-video`; se renombró para que no se pise con `edicion-video`.
> Al final, **Cómo encaja con el kit**.

Un vídeo se monta como una lista de tramos. Cada tramo es un clip recortado,
sus palabras con tiempos y una escena de Remotion que pinta la animación.

## Flujo

1. **Audio.** Extrae siempre la primera pista:
   `ffmpeg -nostdin -y -i INPUT.MOV -map 0:a:0 -ac 1 -ar 16000 audio.wav`
   (los MOV de iPhone traen una segunda pista espacial que no sirve).
2. **Transcribe por palabras** con faster-whisper large-v3 y marcas por palabra.
   Corrige nombres de producto antes de cortar.
3. **Agrupa por pausas de más de 0,6 s.** Así se ven las tomas repetidas.
   Quédate con la última toma buena y retranscribe solo esas ventanas.
4. **Mide los bordes con RMS (ventanas de 10 ms), no con Whisper.**
   - Entrada: primer cruce sostenido de −47 dB, menos 0,12 s. En el primer
     tramo del vídeo, menos 0,02 s: la voz debe empezar en el segundo 0.
   - Salida: donde el RMS baja de −50 dB, más 0,14–0,35 s de cola.
   - Revisa también la última sílaba: puede llegar 0,2 s más allá de lo
     que marca la transcripción.
5. **Corta cada tramo** a 1080x1920 y 30 fps y guarda un JSON con las palabras
   relativas al inicio del tramo (`id`, `dur`, `mode`, `words`).
6. **Pregunta antes de construir** si hay algo por decidir: el gancho, el
   cierre, qué va a pantalla completa. No construyas con dudas abiertas.
7. **Escribe una escena por tramo** y regístrala en la composición.
8. **Renderiza y revisa fotogramas** (hoja de contactos y recortes a tamaño
   real) antes de enseñar nada.

## Formatos de tramo

- `split`: lienzo blanco arriba (806 px) con la animación; la cara abajo.
- `full`: blanco entero. Una sola idea clave por vídeo.
- `face`: solo la cara, para el cierre.

## Reglas de animación

- **Nada aparece: todo llega.** Entradas con muelle (`spring`), movimientos con
  curvas de easing, reacciones con onda y sacudida. Sin fundidos planos.
- **La imagen enseña, no repite.** No pongas chips que digan lo mismo que la
  voz. Rotula solo datos: horas, cantidades, sellos.
- **Cada golpe cae en la palabra que lo nombra.** Lee los tiempos del JSON.
- **Todo depende solo del tiempo.** Sin `Math.random`, sin estado entre
  fotogramas.
- **Personajes y decorado con continuidad.** El problema y el resultado pasan
  en el mismo escenario.
- **Pantallas completas quietas.** Solo se mueven los elementos que entran.

## Subtítulos y zona segura

- Blancos y planos sobre el vídeo, en negro sobre fondos claros. Sin placa.
- Nada importante por encima del 14 % ni por debajo del 88 % de la altura.

## Sonido

Efectos cortos (pop, tick, ping) solo cuando confirman algo visible, muy por
debajo de la voz. Si un sonido no tiene evento en pantalla, quítalo.

## Cuando algo se ve descentrado

Mide los píxeles del fotograma renderizado. No ajustes la constante a ojo.

## Lo que no se puede verificar

Tú no oyes el audio. Lo que dependa del oído (empalmes, ritmo, tono) no se da
por bueno: se evita, no se afina. No empalmes dos tomas dentro de un sintagma.

---

## Cómo encaja con el kit (agregado al sumarla)

Lo que dice arriba manda **dentro de este formato**. Lo que no dice, sale del kit:

- **Whisper en la placa de video** (`device="cuda", compute_type="float16"`; las DLL
  de `nvidia-cublas-cu12` y `nvidia-cudnn-cu12` con `os.add_dll_directory`). Ffmpeg con
  `-hwaccel cuda` y `h264_nvenc`.
- **Bordes**: los umbrales de arriba (−47 / −50 dB) son los de esta config; las
  herramientas para medirlos son las de `edicion-video` (`envolvente.mjs`,
  `buscar-bordes.mjs`). Nunca de los tiempos de Whisper.
- **Tomas**: igual que en `reel-dopamina-juanpi` — revisá cada tramo elegido con
  `small` sin condicionar para que no se cuele una frase trabada.
- **Zona segura física**: además del 14 %–88 %, los 120 px a los costados
  (`criterio/encuadre-y-zona-roja.md`): los celulares 20:9 recortan los bordes.
- **Audio de entrega**: −14,5 LUFS, pico bajo −1 dBTP, ecualizador del micrófono chico
  (`audio-y-microfono`). Los efectos salen de `sonidos/` (`sonidos-y-efectos`).
- **Preguntas**: el paso 6 se hace **una vez, al arrancar** (gancho, cierre, qué va
  a `full`), no a mitad de camino (`criterio/trabajar-sin-preguntar.md`).
- **Proyecto**: se parte de `proyectos/01-base-talking-head/` (junction a su
  `node_modules`). El lienzo blanco del `split` lleva la animación; si hace falta un
  estilo de gráfica, mirá `estilos-de-referencia` (lewisdang y rumedias ya trabajan
  sobre blanco).
- **Render**: desde la carpeta del kit, con `TEMP` en el F: (ver `reel-dopamina-juanpi`,
  paso 6) y las verificaciones de `edicion-video` antes de mandar.
