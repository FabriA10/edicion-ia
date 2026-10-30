---
slug: zainsoft-tarjetas-digitales
estado: aprobado        # confirmado por el usuario el 2026-10-30
fecha: 2026-10-30
---

# Brief: Tarjetas digitales de ZainSoft (invitaciones web)

## Pedido original
> "hace lo de las tarjetas digitales"
> (idea propuesta en la sesión: «Tu invitación de 15 ya no va en papel», mostrando las 3 tarjetas de muestra
> que ya funcionan en la web)

## Objetivo
- Qué debe lograr: vender el servicio de tarjetas digitales y de paso ganar alcance (es contenido que se comparte).
- Público: quien organiza un evento (15, casamiento, baby shower): mamás, novios, familias. No técnicos.
- Acción final: **link en la bio** → web de ZainSoft (`zainsoft.sofdev.workers.dev`, sección tarjetas / armador de presupuesto).

## Contenido
- Mensaje central: tu invitación puede ser una web que se abre como un sobre, con todo adentro, y tus invitados
  confirman desde el celular.
- Puntos a cubrir (funciones reales de las tarjetas, `web/public/tarjetas/` + `comun/tarjeta.js`):
  1. Se abre como un sobre (con música).
  2. Cuenta regresiva, ubicación con mapa y botón para agendar.
  3. Confirmación de asistencia por WhatsApp (y datos para regalos).
- Tarjetas a mostrar (decidido: las 3, ritmo rápido): **15 años** (Martina, violeta y dorado) como protagonista →
  cortes rápidos a **casamiento** (Sofía & Tomás) y **baby shower**.
- Fuente: las tarjetas publicadas en `https://zainsoft.sofdev.workers.dev/tarjetas/{quince,casamiento,baby-shower}/`
  (repo `agustinamade6-dev/Enterprice-portafolio`). Los nombres, fechas y lugares son de muestra.
- Cifras: ninguna. Sin precios ni plazos (la web no tiene precios fijos).

## Formato
- Duración objetivo: 30-35 s (límite práctico 60 s).
- 1080x1920, 30 fps. Zona segura x 120-960, y 250-1670.
- Español rioplatense (voseo) en voz y textos del reel.

## Voz y sonido
- Voz: **ElevenLabs «Armaan»**, la misma voz y los mismos ajustes de la serie (`docs/elevenlabs-guia.md`).
  El usuario genera el MP3 con su cuenta a partir del guion y lo deja en `audio/voz.mp3`.
- Música: ninguna (confirmado). La música propia de las tarjetas no se usa.
- Efectos: pocos y bajos (papel del sobre al abrirse, pop sutil en la confirmación). Voz protagonista.

## Estilo visual (sin rostros)
- **Fondo: claro crema `#F5EFE6`** (elegido por el usuario el 2026-10-30). Tokens de `docs/estilo-visual-reels.md`.
- Tipo: capturas de pantalla reales (grabación de las tarjetas en un celular) + motion graphics + Bit.
- Marca: naranja `#F2602E`, tinta `#14151A`, fuente Hando, logo recreado en código.
- Subtítulos: estilo de los reels anteriores.
- Sin rostros: las tarjetas no tienen fotos de personas (verificado: solo tipografía, ilustraciones y SVG).

## Restricciones
- Sin rostros ni personas. Sin cifras, precios ni plazos inventados. Sin jerga técnica.
- No presentar los nombres de muestra (Martina, Sofía & Tomás) como clientes reales.

## Entregables
- [ ] final.mp4  - [ ] portada 3:4  - [ ] caption + hashtags  - [ ] nota de etiqueta IA (voz sintética)

## Decisiones tomadas (preguntas respondidas, 2026-10-30)
- Fondo: claro crema.
- Voz: ElevenLabs Armaan.
- Tarjetas: las 3, rápido (15 como protagonista).
- CTA: link en la bio.

- Duración: 30-35 s.
- Música: ninguna (voz protagonista, efectos pocos y bajos).
- Bit: hilo conductor (entrega el sobre al inicio, festeja la confirmación, señala el link en la bio).

## Supuestos pendientes de confirmar
- (ninguno)
