# Storyboard: Reel 2 «Cómo se construye un sistema» (≈48 s, 1080x1920, 30 fps)

**Estado: APROBADO por el usuario el 2026-10-20** (generó la voz con este texto, incluido «Hay más para ver»; voz real 42,9 s). Cuenta del CTA: @zainsoft_ (solo en pantalla).

Fondo claro crema `#F5EFE6` (confirmado 2026-10-20). Tiempos estimados; se ajustan a las marcas de palabra reales con `app/alinear-palabras.mjs` (no whisper: la PC no tiene AVX). Zona segura: x 120-960, y 250-1670. Sin código en pantalla, sin cifras ni plazos, sin personas.

## Columna visual
- **Camino de 5 pasos** (barra de progreso): fila de 5 nodos numerados unidos por una línea, en y 320-400, x 160-920. Se vuelve a iluminar de a un nodo por etapa (naranja el activo, tinta tenue los hechos). Debajo del activo, un **rótulo chico** (Hando, `GRIS_C`/tinta, ~34 px, y ≈ 430) con el nombre formal: **Relevamiento · Diseño · Desarrollo y documentación · Implementación · Mantenimiento**.
- **Escenario** (y 480-1050): una ilustración por etapa, todas del mismo edificio (SVG en código, ventanas vacías). Etapa 1 solar vacío + globos de lo que necesitás; 2 plano; 3 obra + manual; 4 inauguración; 5 edificio con herramienta y ajustes.
- **Bit** (marioneta de `mi-video/src/bit/`, pies en y 1660, escala 0,52) acompaña y "camina" el camino: avanza de nodo en nodo en el borde del escenario. Poses: saludo, señala, pensar, festejo, botón, camina.
- **Subtítulos** en y ≈ 1110-1250 (libres de escenario y de Bit).

| # | t inicio–fin | Voz / texto en pantalla | Visual (sin rostros) | Fuente del visual | Movimiento / transición | Sonido |
|---|---|---|---|---|---|---|
| 1 | 0,0-6,6 | «Un sistema no se arma de un día para otro. Y tampoco termina cuando te lo entregan.» / cartel **no se arma de un día** (0-2,2) y luego **ni termina al entregarlo** (3,3-6,6) | 0-3: un edificio completo aparece de golpe en el escenario y se deshace en bloques (tachado naranja sobre «de un día»), con Bit mirando. 3-6,6: el edificio entregado con una cinta de moño, y Bit lo recibe; aparece el camino de 5 nodos apagado, con una línea que sigue más allá de la entrega (prepara la promesa) | Código (Remotion) + Bit rig | 0-3: bloques saltan y caen con rebote; 3,3 flecha de «entrega» y la línea la atraviesa; cambio visual cada ~1,5 s | Golpe suave al caer los bloques; whoosh bajo en 3,3 |
| 2 | 6,6-10,3 | «Se construye en cinco etapas, igual que un edificio.» / cartel **5 etapas** | El camino se enciende nodo por nodo (1-5) con ícono propio: oreja/globo, plano, ladrillos, cinta, llave. Bit en pose señala recorre los nodos con el dedo | Código + Bit rig | Nodos entran con rebote cada ~0,5 s; push-in leve | Un tic bajo por nodo |
| 3 | 10,3-14,8 | «Primero, escuchamos cómo trabajás: qué necesitás, qué te hace perder tiempo.» / rótulo **Relevamiento** / cartel **escuchamos** | Nodo 1 naranja. Solar vacío; Bit con pose pensar y una libreta. Salen globos de ideas con íconos de rubro (percha, pelota, plato) y un reloj tachado al decir «perder tiempo» | Código + Bit rig | Globos suben uno por uno (~0,8 s); reloj tachado con golpe; Bit asiente | Pop bajo por globo |
| 4 | 14,8-21,6 | «Después, armamos los planos: cómo se conecta todo, según tu negocio y lo que el sistema necesita.» / rótulo **Diseño** / carteles **los planos**, **según tu negocio** | Nodo 2. Hoja de plano (líneas finas tinta sobre crema, rejilla) donde se dibujan 4 cuartos conectados por líneas. A la izquierda tarjeta «tu negocio», a la derecha «el sistema»; ambas apuntan al plano y se funden | Código | 14,8-17,5 el plano se traza; 17,5-19 llegan las dos tarjetas; 19-21,6 líneas de conexión brillan en cadena. Escena larga: justificada por los 3 cambios internos (~2 s c/u) | Trazo suave (efecto bajo) |
| 5 | 21,6-26,1 | «Lo construimos y dejamos todo documentado, como el manual del edificio.» / rótulo **Desarrollo y documentación** / cartel **documentado** | Nodo 3. El edificio se levanta piso a piso con grúa simple; luego aparece un libro/manual abierto al lado con renglones de líneas grises (sin texto legible, sin código) y un check | Código | Pisos suben con rebote cada ~0,5 s; al decir «manual» el libro entra girando y se abre; check pop | Golpe suave por piso; pasar de página |
| 6 | 26,1-31,0 | «Lo ponemos en marcha en tu negocio, sea tienda, canchas o restaurante.» / rótulo **Implementación** / cartel **en marcha** | Nodo 4. Inauguración: cinta que se corta con tijera, cartel «abierto» y ventanas que se encienden. Tres letreros pequeños en la fachada que rotan: percha (tienda), pelota (canchas), cubiertos (restaurante) | Código + Bit rig (festejo) | Corte de cinta con sacudida corta; ventanas se prenden en cadena; letreros rotan en cada palabra de rubro (~0,7 s) | Tijera/clic, tono ascendente tenue |
| 7 | 31,0-36,6 | «Y después no te soltamos: lo mantenemos, lo ajustamos y sigue creciendo con vos.» / rótulo **Mantenimiento** / cartel **lo mantenemos** | Nodo 5. El edificio con una llave inglesa y un engranaje que giran; luego se le suma un piso nuevo (crece) al decir «creciendo». Una flecha circular alrededor mantiene el ciclo vivo | Código | Llave aprieta (golpe) en «mantenemos»; engranaje gira; piso nuevo sube con rebote en «creciendo» | Clic metálico bajo; pop del piso |
| 8 | 36,6-42,6 | «Un buen sistema empieza en cómo trabaja tu negocio, y no termina con la entrega.» / cartel **empieza en tu negocio** y luego **no termina** | Plano general: camino con los 5 nodos encendidos en bucle; luz recorre 1→5 y vuelve al 1. Bit festeja al final; el cartel «no termina» cruza la meta de entrega que apareció en la escena 1 y sigue | Código + Bit rig | Pull-back; luz recorre el camino en cadena; la meta del gancho se atraviesa; leve zoom a la línea que sigue | Tono tenue ascendente |
| 9 | 42,6-48,0 | «Seguinos y escribinos por DM. Hay más para ver.» / **@zainsoft_** + **escribinos por DM** | Logo ZainSoft (recreado en código) y franja con **@zainsoft_** en píldora tinta (visible, sobre y ≈ 1000, no en la zona inferior). Bit se asoma y saluda. Al final el escenario vuelve al edificio de la escena 1, tenue, para invitar al bucle | Código; logo recreado (`docs/aprendizajes-equipo.md` §11) | Entrada con rebote; Bit saluda; fundido a edificio tenue en los últimos 0,6 s | Tono tenue en el logo |

Ritmo: cada escena tiene un cambio visual o sonoro cada ~1,5-2,5 s; las más largas (1, 4, 7, 8) tienen sub-beats indicados.

## Subtítulos
Estilo del Reel 1: 1-3 palabras (máx. 4), minúsculas, una línea, Hando, centrados, tinta `#14151A` con sombra blanca suave y óvalo de respaldo blanco al 45 %, y ≈ 1110-1250. Palabras clave en `VERDE_C` `#00A35C` o `NARANJA` `#F2602E`: **escuchamos**, **planos**, **documentado**, **en marcha**, **mantenemos**, **sistema**, **negocio**, **ZainSoft**. Correcciones del alineador: «Beat» → Bit, «Sainsoft» → ZainSoft. Los rótulos formales de etapa son aparte de los subtítulos (arriba, chicos).

## Paleta y tipografías
- Fondo `CREMA #F5EFE6` con resplandor `radial-gradient(ellipse at 50% 30%, rgba(242,96,46,0.20), rgba(245,239,230,0) 62%)` y rejilla `#E4DACB` (2 px cada 90 px, opacidad 0,8).
- Texto `TINTA #14151A`; marca `NARANJA #F2602E`; clave sobre fondo `VERDE_C #00A35C`; secundarios `GRIS_C #6B7280`.
- Tarjetas y paneles oscuros `CARD #1A1C22`; `#00FF88` / `#FFE600` solo dentro de tarjetas oscuras.
- Fuente **Hando** (`mi-video/public/Hando.otf`).
- Render con `--gl=swangle`, visuales con `key={frame}`, sin filtros SVG con región en porcentaje.

## Assets
| Asset | Quién |
|---|---|
| Bit (rig SVG), fuente Hando | Ya en el repo |
| Edificio, camino de 5 nodos, plano, manual, cinta, llave/engranaje, íconos de rubro, logo | Se generan en código (productor-video) |
| `audio/voz.mp3` (ElevenLabs «Armaan», mismos ajustes que el Reel 1) | **Usuario**, con `docs/elevenlabs-guia.md`; texto en `audio/texto-para-elevenlabs.txt` |
| Efectos: golpe suave, pop, tic, trazo, página, tijera, clic metálico, tono | Banco `sonidos/` del repo (productor-video elige; anotar en `CREDITOS.md`) |
| Música | Ninguna (brief) |

## Preguntas abiertas
1. ¿Aprobás este storyboard para pasar a producción?
2. ¿Te sirve «cinco etapas» dicho en la voz (es estructura, no plazo)?
3. ¿Alcanza «Hay más para ver» como cierre genérico, o preferís cortar en «escribinos por DM»?
4. Reel 3 sigue en revisión por superponerse con este tema (el BRIEF lo marca «a confirmar»).
5. Pendientes heredados del Reel 1: licencias de la voz Armaan, fuente Hando y sonidos; logo en vector.

## Duración total calculada
115 palabras / 2,6 palabras por segundo ≈ 44 s de habla + pausas ≈ **48 s** (tope del pedido: 60 s). Se fija con la voz real.
