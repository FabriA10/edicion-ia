# Storyboard: Reel 1 «Qué es un sistema» (≈38 s, 1080x1920, 30 fps)

**Estado: APROBADO por el usuario el 2026-10-20.** Cuenta del CTA: @zainsoft_.

Tiempos estimados; se ajustan a las marcas de palabra reales de la voz (whisper.cpp). Zona segura: x 120-960, y 250-1670.
Bit se anima con la marioneta de `mi-video/src/bit/` (BitRig + bitMotion). Poses disponibles: saludo, señala, pensar, festejo, botón, camina.

| # | t | Voz / texto en pantalla | Visual (sin rostros) | Fuente | Movimiento | Sonido |
|---|---|---|---|---|---|---|
| 1 | 0,0-3,5 | «¿Pensás que hacemos páginas web?» / cartel **¿página web?** | Fondo oscuro cálido; Bit entra al centro y se rasca la cabeza (pensar); sobre él un cartel «página web» que se **tacha** al decir «Casi» y cambia a **SISTEMAS** | Código (Remotion) + Bit rig | Cartel cae con rebote; punch-in 6 % al decir «sistemas» | Voz sola; un destello suave |
| 2 | 3,5-9 | «Una web es la vidriera. Un sistema es todo el negocio funcionando por detrás.» | Pantalla dividida: arriba, un escaparate/vidriera sencilla (fachada de tienda en SVG); al decir «por detrás» la fachada se abre y aparecen engranajes/paneles conectados (stock, pedidos, ventas) detrás | SVG en código | Corte de cámara tipo «pared que se abre»; Bit señala | Voz sola |
| 3 | 9-16 | «…tienda de ropa: stock, pedidos por WhatsApp, cuánto vendió» | Celular con maqueta de tienda (catálogo de `pierina_shots`) y 3 tarjetas que aparecen al nombrarse: **stock**, **pedidos por WhatsApp**, **ventas del día** (íconos propios) | `pierina_shots/` + tarjetas en código | Tarjetas entran con rebote en la palabra; Bit señala la pantalla | Voz sola |
| 4 | 16-21,5 | «…complejo de canchas: ordena los turnos» | Grilla de turnos en un celular; dos bloques que intentan ocupar el mismo horario y el sistema los acomoda | Código | Bit camina al costado; el choque se resuelve con un «pop» visual | Pop muy bajo |
| 5 | 21,5-26 | «…restaurante: cocina y caja hablan entre sí» | Dos pantallas (cocina / caja) unidas por una línea que pulsa; un pedido viaja de una a otra | Código | Línea con luz recorriendo; Bit festeja al llegar | Voz sola |
| 6 | 26-32 | «Mismo concepto, distinto negocio. Nada de plantillas: a medida» | Los tres rubros en tarjetas pequeñas orbitando a Bit; cartel **a medida** en #00FF88; **0 plantillas** tachado (sin cifras inventadas: solo «plantillas» tachada) | Código | Cámara hace push-in hacia Bit; tarjetas se funden en una | Voz sola |
| 7 | 32-38 | «En el próximo te muestro cómo se estructura. Seguinos y escribinos por DM.» | Logo ZainSoft grande + **@zainsoft_** (a confirmar) + «próximo: cómo se estructura»; Bit sale del cuadro antes de los textos y se asoma al final | Logo `mi-video/public/` (zainsoft_logo*.png) | Entrada con rebote; Bit saluda al final | Tono tenue en el logo |

## Subtítulos
1-3 palabras, Hando, centrados, palabras clave en #00FF88 / #FFE600 (**sistemas**, **vidriera**, **por detrás**, **a medida**, **ZainSoft**), franja libre entre contenido y Bit (≈ y 1300). Corrección de Whisper: «Beat» → Bit, «Sainsoft» → ZainSoft.

## Assets
| Asset | Quién |
|---|---|
| Bit (rig SVG), fuente Hando, logos, capturas Pierina | Ya en el repo |
| Escaparate, tarjetas, grilla de turnos, pantallas cocina/caja | Se generan en código |
| `audio/voz.mp3` (ElevenLabs) | **Usuario**, con `docs/elevenlabs-guia.md` |
| Grabación `pierina.mp4` (si se quiere el celular con video real en la escena 3) | **Equipo** (no está en git) |

## Preguntas abiertas
1. ¿Confirmas las funciones por rubro (supuesto 1) y los 3 rubros elegidos?
2. ¿Cuenta final: @zainsoft_ o @zainsoft.dev?
3. ¿Aprobado este storyboard para pasar a producción?

## Esquema de los reels 2 y 3 (se detallan al aprobar el reel 1)
- **Reel 2, cómo se estructura:** Bit «desarma» un sistema en 4 piezas: lo que ve el cliente, lo que ve el dueño (panel), los datos (la memoria del negocio) y los avisos (WhatsApp, etc.). Analogía de un edificio.
- **Reel 3, cómo lo construimos:** Bit recorre los pasos conversar → armar → probar → entregar → acompañar; caso Pierina Glow como prueba. Plazos solo si el usuario los confirma.
