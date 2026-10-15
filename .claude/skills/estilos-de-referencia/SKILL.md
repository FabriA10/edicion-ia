---
name: estilos-de-referencia
description: Estilos de edición copiados de cuentas que Juanpi pasó como referencia (devinjatho, rumedias, lewisdang) — subtítulos, colores, motion graphics, transiciones, sonidos y ritmo de cada una, con cómo armarlos en Remotion y para qué tipo de video va cada estilo. Usala cuando Juanpi pida "editalo como devin / como el de las tarjetas / como el de los chips", "copiá este estilo", "con el estilo de la referencia", "que se vea distinto según el video", cuando pase un video o una grabación de pantalla con reels de referencia para sumar, o cuando haya que elegir cómo encarar un crudo nuevo que no es de Compumaq.
---

# Estilos de referencia

Juanpi pasó reels de cuentas que editan muy bien para que se **copie su estilo o se
tome de referencia** (06/10/2026, textual: *"quiero que tengas de referencia para que
puedas editar de manera distinta dependiendo del video que sea… efectos, subtítulos,
recortes, sonidos, animaciones, motion graphics, TODO QUIERO QUE COPIES o tomes de
referencia"*).

Cada estilo está desarmado pieza por pieza en `references/`. Los reels recortados y las
hojas de cuadros (4 por segundo) están en `referencias/<cuenta>/` en la raíz del kit:
**mirá las hojas antes de construir** un elemento, no te fíes solo del texto.

## 1. Elegir el estilo según el video

| El video es… | Estilo | Referencia |
|---|---|---|
| Opinión fuerte, negocios, marketing, "el error que comete todo el mundo", reacción a otro creador, gancho polémico | **Oscuro cinematográfico** | `references/devinjatho.md` |
| Antes/después, portfolio (el de Juanpi como editor), servicio que transforma algo, anuncio limpio | **Raw vs Output** | `references/rumedias.md` |
| Negocio local o servicio explicado con conceptos y marcas (Google, Yelp, Mercado Libre), tono profesional y luminoso, sin música | **Editorial blanco con chips** | `references/lewisdang.md` |
| Explicativo donde la animación enseña (procesos, pasos, antes y después en el mismo escenario) | **Formato partido** | skill `formato-partido` |
| Fórmula de varios ingredientes que se suman ("si hacés esto, esto y esto…") | **Medidores** (reel 4 de devinjatho) | `references/devinjatho.md`, §Medidores |
| Compumaq, tips de tecnología | El aprobado | skill `reel-dopamina-juanpi` |

Si el pedido no dice estilo y el video no es de Compumaq, elegí con esta tabla y al
entregar contá cuál usaste y por qué (una línea). Se pueden **tomar piezas sueltas**
de un estilo (la simulación de Instagram, el visor con marcos neón, los chips de
vidrio) para otro video; en Compumaq solo si Juanpi lo pide (lo aprobado no se toca).

## 2. Qué cambia y qué queda del kit

**Lo reemplaza el estilo elegido** (es pedido de Juanpi, manda sobre `criterio/`):
subtítulos (fuente, mayúscula, color, si son literales o titulares), paleta, tipo de
transiciones, densidad de gráficas y diseño de sonido.

**Queda siempre**, porque no es gusto sino física o calidad:
- Tomas sin trabas, verificadas con dos modelos (`reel-dopamina-juanpi` §2).
- Bordes medidos con la envolvente, nunca con Whisper (`edicion-video`).
- Zona segura: nada leíble arriba de 250 px ni abajo de 1500 px, 120 px a los
  costados (los celulares 20:9 recortan los bordes).
- Audio: −14,5 LUFS, pico bajo −1 dBTP, ecualizador del micrófono chico.
- La curva de movimiento del kit (`Easing.bezier(0.16, 1, 0.3, 1)`) salvo que el
  estilo pida explícitamente otra (los `spring` del formato partido).
- Verificaciones antes de mandar y la alarma al terminar.

**No se copia**: el nombre, la cara, los logos ni las frases de las cuentas ("Comment
Rumedias…", "_lewisdang_"). Se copia **cómo** editan; los textos, la marca y la cuenta
del CTA son los del cliente de Juanpi. Las fotos de casos reales las da quien contrata.

## 3. Tipografías

El kit trae `Archivo-var.ttf` (pesos 100–900 y ancho 62–125) y Hando Bold. Con Archivo
a peso 900 y ancho 115–125 se imita bien el bloque pesado de devinjatho. Para las
itálicas de rumedias/lewisdang (tipo Poppins/Montserrat) y la serif dorada de
"Congratulations" (tipo Cinzel): `@remotion/google-fonts@4.0.525` está instalado en
`01-base-talking-head` desde el 06/10/2026 (los demás proyectos lo ven por la junction).
Se carga así, una vez por componente:
`import {loadFont} from "@remotion/google-fonts/Poppins"; const {fontFamily} = loadFont("normal", {weights: ["500", "700"]});`
(lo mismo con `Montserrat`, `Cinzel`, `ArchivoBlack`). La fuente se baja al renderizar:
hace falta internet.

## 4. Sumar una referencia nueva

Cuando Juanpi pase otra grabación de pantalla o reels:

1. `ffprobe` para ver tamaño; un cuadro entero (`-ss 30 -frames:v 1`) para medir dónde
   está el reel en la pantalla (cambia con el zoom del navegador: medí cada tramo).
2. Recortá cada reel y guardalo en `referencias/<cuenta>/`:
   `ffmpeg -ss A -to B -hwaccel cuda -i grab.mp4 -vf "crop=W:H:X:Y,scale=-2:960,fps=30" -c:v h264_nvenc -cq 24 -c:a aac salida.mp4`
3. Hojas de cuadros a 4 por segundo: `-vf "crop=…,fps=4,scale=200:-2,tile=8x4"`, y
   recortes a tamaño doble de los cuadros donde haya tipografía.
4. Transcribí el audio (large-v3 en CUDA, palabras con tiempos) y compará con lo que
   dicen los subtítulos: ¿literales o titulares? ¿cuántas palabras? ¿qué queda sin
   subtitular?
5. Medí los huecos entre frases (¿hay cama de música? ¿a cuántos dB de la voz?) y los
   ataques del audio cerca de cada evento visual (qué suena con qué).
6. Escribí `references/<cuenta>.md` con el mismo esquema (look, subtítulos, gráficas,
   transiciones, sonido, ritmo, cómo armarlo) y sumala a la tabla del punto 1.

Ojo: lo que no se puede oír no se inventa. Si un sonido no se distingue en la
medición, poné el del kit que mejor cuadra con el evento y decilo como supuesto.
