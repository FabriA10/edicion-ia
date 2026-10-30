---
slug: zainsoft-sistema-01-que-es
estado: aprobado        # aprobado por el usuario el 2026-10-20
entrega: out/final.mp4 = v06 (fondo claro, voz nueva con «solamente», render con --gl=swangle). Pendiente: visto bueno final del usuario y licencias. (respuestas a las 4 preguntas)
fecha: 2026-10-20
serie: zainsoft-sistema (3 reels)
---

# Brief: serie «Qué es un sistema» de ZainSoft. Reel 1: ¿qué es un sistema?

## Pedido original
> Explicar el producto de ZainSoft: la mayoría no entiende qué es un sistema, cómo aporta valor y cómo se adapta a un negocio;
> piensan que solo hacemos páginas web, marketing o redes. Hablar de qué es un sistema, cómo se estructura y cómo lo construimos
> para un cliente y su negocio. Formato reels, voz masculina de ElevenLabs, con Bit, siguiendo el reel de Bit y Pierina Glow.

## Objetivo
- Corregir la idea «ZainSoft = páginas web / marketing / redes» y que se entienda qué es un sistema y qué le aporta a un negocio.
- Público: dueños de negocios y emprendedores (ropa, canchas, gastronomía…), no técnicos.
- Acción final: seguir la cuenta y escribir por DM.

## Serie (decidido: 3 reels de 35-45 s, un mensaje cada uno)
1. **Qué es un sistema** (este): web ≠ sistema; ejemplos en varios rubros. Termina avisando el siguiente.
2. **Cómo se estructura**: las piezas (lo que ve el cliente, lo que ve el dueño, los datos, los avisos), explicado con Bit y analogías, sin jerga.
3. **Cómo lo construimos para tu negocio**: conversar → armar → probar → entregar → acompañar. Sin inventar plazos (los confirma el usuario).

## Contenido (reel 1)
- Mensaje central: una web es la vidriera; un sistema es todo el negocio funcionando por detrás.
- Ejemplos ilustrativos en 3 rubros (**decidido: varios rubros en rápida sucesión**): ropa, canchas, restaurante. **A confirmar por el usuario** que cada función citada es algo que ZainSoft efectivamente construye (ver supuestos).
- No hablar de código ni de cómo se programa (aprendizaje del reel anterior). No dar cifras ni plazos.

## Formato
- Duración: 36-42 s (≈100 palabras de voz). 1080x1920, 30 fps.
- Idioma: español rioplatense (voseo: «pensás», «escribinos»).

## Voz y sonido
- Voz en off: **ElevenLabs, voz masculina**, plan pago (decidido). Se genera con la guía `docs/elevenlabs-guia.md` y el usuario aporta el MP3 en `audio/voz.mp3`. Misma voz y ajustes en los 3 reels.
- Música: ninguna por defecto (voz protagonista). Efectos: mínimos y bajos (ver `docs/aprendizajes-equipo.md`).

## Estilo visual (sin rostros)
- **Bit** (mascota robot, componentes `mi-video/src/bit/`) como hilo conductor; paleta naranja ZainSoft (#F2602E / #F05A2B); fuente Hando.
- Maquetas en celular/pantalla de los rubros, íconos y tarjetas generados en código. Sin personas.
- **Fondo: claro crema (`#F5EFE6`), decidido el 2026-10-20** porque no se notaban las partes negras de Bit. Ver `docs/estilo-visual-reels.md`. La primera versión (oscura) queda como `out/final-oscuro-voz-v1.mp4`.
- Subtítulos: estilo del equipo (1-3 palabras, Hando, palabras clave en color).
- Cuenta del CTA: **@zainsoft_** (según el documento del equipo; el análisis de Se7en proponía `@zainsoft.dev`: **a confirmar**).

## Restricciones
- Sin rostros humanos. Sin código en pantalla. Sin cifras inventadas. Sin música comercial.

## Entregables
- [ ] final.mp4  - [ ] portada 3:4  - [ ] caption + hashtags  - [ ] nota de etiqueta IA (voz sintética)

## Decisiones tomadas
- Plan de voz: ElevenLabs pago (Starter o superior) → la voz puede ser la definitiva.
- Formato: serie de 3 reels de 35-45 s.
- Ejemplo: varios rubros en rápida sucesión.
- Referencia: el reel de Bit y Pierina Glow (guiarse por su código y aprendizajes; el .mp4 no está disponible).

## Confirmado por el usuario (2026-10-20)
- Fondo claro aprobado. Texto actualizado: «ZainSoft **solamente** hacemos páginas web» (voz regenerada completa; `audio/voz.mp3`, la anterior en `audio/voz-v1.mp3`).
- Las funciones por rubro (ropa, canchas, restaurante) son reales: **válido**.
- Cuenta del CTA: **@zainsoft_**.
- Storyboard del reel 1: **aprobado**.

## Supuestos ya resueltos (históricos)
1. Que ZainSoft construye, para ropa: control de stock, pedidos por WhatsApp y panel de ventas; para canchas: turnos; para restaurante: pedidos cocina-caja. (Solo el pedido por WhatsApp y el catálogo de Pierina Glow figuran en el material del equipo.)
2. Cuenta de Instagram correcta: @zainsoft_ vs @zainsoft.dev.
3. Se pronuncia «ZainSoft» como «sáin-soft»; se verifica al generar la voz.
