# Storyboard: «El menú en PDF que nadie puede leer»

1080x1920 · 30 fps · ~34 s · fondo **claro crema `#F5EFE6`** (rejilla y resplandor de la paleta aprobada).
Tiempos estimados: se ajustan a la voz real con `alinear-palabras.mjs`.
El celular es una maqueta oscura generada en código (la misma del reel de tarjetas); adentro va la **captura real de la
demo** (tomada cuadro a cuadro con un navegador automatizado, sin enviar nada) o el PDF generado en código.

| # | t | Voz | Visual (sin rostros) · fuente | Movimiento | Bit | Sonido |
|---|---|---|---|---|---|---|
| 1 Gancho | 0–3,2 | «¿Todavía tenés el menú en PDF? Nadie lo puede leer.» | Celular con un **PDF de menú** (hoja escaneada gris, letra chiquita, generado en código, sin marcas reales). En «nadie lo puede leer», sticker **«nadie lo lee»** con una lupa tachada | push-in lento; sticker con rebote | al costado, mira el celular con cara de «pensar» | papel + pop |
| 2 Problema | 3,2–6,6 | «Hay que agrandarlo con los dedos, y se ve todo borroso.» | **Pellizco de zoom**: dos anillos de toque que se separan (sin manos); el PDF se agranda y se pixela/borronea | zoom 1 → 2,5 dentro de la pantalla | se rasca la cabeza | «stretch» suave |
| 3 Giro | 6,6–11,6 | «Con un menú digital, tu cliente escanea el QR de la mesa, sin instalar nada.» | Corte limpio: un **cartelito de mesa** «MESA 4 · escaneá el menú» con un QR (generado en código, decorativo). El celular pasa por encima, línea de escaneo, y la pantalla se abre en la **demo real** (Bodegón La Esquina, mesa 4). Chip **«sin instalar nada»** | el celular baja y escanea; flash suave al abrir | señala el QR | escaneo + destello |
| 4 Pedido | 11,6–15,8 | «Elige por categoría y suma lo que quiere con un toque.» | Demo real: toque en **«Principales»**, toque en **«Agregar»** de la milanesa → contador `1`, barra **«Enviar pedido (2) · $17.000»** | punch-in suave a la lista; anillos de toque | — | clicks + pop |
| 5 WhatsApp | 15,8–21,4 | «Y el pedido te llega por WhatsApp, ordenado, con la mesa y el total.» | Toque en «Enviar pedido» → sale del celular, grande, la tarjeta real **«Así le llega al local por WhatsApp»**: 🧾 Pedido · Mesa 4 · 1 x Empanadas $4.500 · 1 x Milanesa $12.500 · **Total $17.000**. Ícono de WhatsApp. Se resaltan «Mesa 4» y «Total» cuando la voz los nombra | la tarjeta crece al centro; resaltes que laten | festeja | notificación suave |
| 6 Precios | 21,4–25,6 | «Y vos cambiás los precios cuando quieras, sin pagar comisiones.» | Sobre la demo, el precio de la milanesa se edita (un lápiz, **$12.500 → $13.200**, ejemplo) y aparece el sello **«sin comisiones»** | el número rueda como contador | señala | tic + golpe del sello |
| 7 CTA | 25,6–34 | «¿Lo querés para tu local? Probá la demo: link en la bio.» | Logo ZainSoft, **«Probá la demo»**, píldora **«link en la bio»** con flecha hacia arriba, **@zainsoft_**. El celular queda chico al costado mostrando la demo | entradas con rebote | saluda | destello en el logo |

Ritmo: cada tramo de 3 s tiene un evento (sticker, pellizco, escaneo, toque, tarjeta, contador, sello, logo).

## Subtítulos
Estilo de la serie (Hando Bold, minúscula, máx. 4 palabras, una línea) en y ≈ 1280-1390. Palabras clave: «pdf», «borroso»
en `ROJO`; «qr», «menú digital», «local», «bio» en `NARANJA`; «whatsapp» en `VERDE_C`.

## Cuidados
- El local y los precios son **de ejemplo** (la demo lo dice): en pantalla no se presentan como un cliente real. El cambio
  de precio de la escena 6 es ilustrativo.
- El QR del cartelito es decorativo (no lleva a ningún lado). Opcional: que sea un QR real a la demo.
- Sin manos ni personas: los toques son anillos blancos, como en el reel de tarjetas.

## Assets
| Asset | Quién | Estado |
|---|---|---|
| `audio/voz.mp3` | Usuario (ElevenLabs, voz de Bit) | pendiente — texto en `GUION.md` |
| `audio/musica/…mp3` | Usuario (Pixabay; cálida, tipo bar/lounge, sin voces) | pendiente |
| Capturas de la demo (pestañas, agregar, pedido, «así le llega») | Producción (yo), navegador automatizado | a capturar |
| PDF del menú, cartelito con QR, lápiz, sello, logo | Código | a producir |
| Bit, sonidos | Repo | ✓ |

**Duración total: ~34 s.**
