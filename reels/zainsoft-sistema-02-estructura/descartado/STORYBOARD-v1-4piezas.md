# Storyboard: Reel 2 «Cómo se estructura un sistema» (≈40 s, 1080x1920, 30 fps)

**Estado: PENDIENTE DE APROBACIÓN DEL USUARIO.** Cuenta del CTA: @zainsoft_.

Fondo claro crema `#F5EFE6` (confirmado por el usuario, 2026-10-20). Tiempos estimados; se ajustan a las marcas de palabra reales con `app/alinear-palabras.mjs` (no whisper: la PC no tiene AVX). Zona segura: x 120-960, y 250-1670.
Bit se anima con la marioneta de `mi-video/src/bit/` (BitRig + bitMotion). Poses: saludo, señala, pensar, festejo, botón, camina. Bit con los pies en y 1660 (escala 0,52); el edificio ocupa y 300-1050 para dejar libre la franja de subtítulos (y ≈ 1110-1250).

**Hilo visual: el edificio.** Una sola ilustración SVG (sin personas, ventanas vacías) de 4 niveles que se arma a lo largo del reel: fachada (nivel superior visible), administración (nivel medio), archivo (sótano, bajo la línea del suelo) y timbre (junto a la puerta). Cada pieza se ilumina en naranja al nombrarse y las anteriores quedan en tinta tenue. Dentro de cada pieza, una maqueta pequeña del rubro de ejemplo (tarjetas oscuras `CARD`, sin números reales).

| # | t | Voz / texto en pantalla | Visual (sin rostros) | Fuente | Movimiento | Sonido |
|---|---|---|---|---|---|---|
| 1 | 0,0-4,8 | «Un sistema es un edificio de cuatro piezas. Si falta una, se cae.» / cartel **4 piezas** | Desde el cuadro 0, el edificio se levanta piso a piso (4 bloques) en el centro. Bit entra caminando a un costado y se asoma. Al decir «si falta una» un bloque se apaga y el edificio se inclina apenas; al decir «se cae» se acomoda de vuelta | Código (Remotion) + Bit rig | Pisos suben con rebote cada ~0,5 s; sacudida corta 4 %; Bit pose pensar | Un golpe suave por piso (muy bajo) |
| 2 | 4,8-11,8 | «La fachada es lo que ve tu cliente: en una tienda de ropa, el catálogo y el pedido.» / cartel **la fachada** | Zoom a la fachada, que se ilumina en naranja. En su vidriera, un celular con maqueta de catálogo (siluetas de prendas dibujadas, **no** las capturas de `pierina_shots/` que tienen rostros) y un botón «pedir». Rótulo «lo que ve el cliente» | Código | Push-in 8 % a la fachada; las prendas entran una a una; botón se «presiona» al decir «pedido»; Bit señala | Pop bajo al presionar el botón |
| 3 | 11,8-18 | «La administración es tu panel. En un complejo de canchas, ves y controlás todos los turnos.» / cartel **tu panel** | Cámara baja al nivel medio, que se ilumina. Maqueta de panel: grilla de turnos de canchas con bloques de colores y un interruptor/lupa de «control». Rótulo «lo que ve el dueño» | Código | Corte tipo «pared que se abre» (como Reel 1); bloques se acomodan al decir «turnos»; Bit señala la grilla | Voz sola |
| 4 | 18-24 | «El archivo es la memoria del negocio. En un restaurante: clientes, pedidos y stock, ordenados.» / cartel **la memoria** | Cámara baja al sótano, que se ilumina. Estantes/cajones de archivo: tres cajones que se abren al nombrarse, con íconos propios: **clientes**, **pedidos**, **stock** (sin cifras) y quedan alineados | Código | Cajones salen con rebote en cada palabra; al decir «ordenados» se alinean de golpe; Bit pose pensar/señala | Click corto bajo por cajón |
| 5 | 24-30,3 | «Y el timbre avisa por WhatsApp, solo, cuando entra un pedido o se reserva un turno.» / cartel **avisos** | Junto a la puerta, un timbre grande. Bit lo pulsa (pose botón); del timbre sale un globo estilo WhatsApp con dos mensajes genéricos que aparecen al nombrarse: «nuevo pedido» y «turno reservado» (ícono de check, sin teléfono ni números) | Código | Bit pulsa el botón; globos suben con rebote; anillos de «sonido» expansivos desde el timbre | Timbre suave (efecto bajo); notificación tenue por globo |
| 6 | 30,3-33,5 | «Cuatro piezas conectadas. Eso es un sistema.» / cartel **un sistema** | Cámara se aleja al plano general: las 4 piezas encendidas y unidas por líneas con luz que recorren fachada→panel→archivo→timbre y vuelven (bucle). Rótulo **sistema** en `NARANJA` | Código | Pull-back; luz recorriendo las líneas en cadena; Bit festeja | Tono tenue ascendente |
| 7 | 33,5-40 | «En el próximo, cómo lo construimos para tu negocio. Seguinos y escribinos por DM.» / cartel **próximo: cómo lo construimos** + **@zainsoft_** | Logo ZainSoft (recreado en código) y franja con **@zainsoft_** en píldora tinta (visible, sobre y 1000, no en la zona inferior). Cartel del Reel 3 «cómo lo construimos para tu negocio». Bit sale del cuadro antes de los textos y se asoma al final saludando. El edificio vuelve a su primer cuadro tenue al fondo para invitar al bucle | Código; logo recreado (ver `docs/aprendizajes-equipo.md` §11) | Entrada con rebote; Bit saluda al final | Tono tenue en el logo |

## Subtítulos
Estilo del Reel 1: 1-3 palabras (máx. 4), Hando, centrados, tinta `#14151A` con sombra blanca suave y óvalo de respaldo blanco al 45 %, franja y ≈ 1110-1250. Palabras clave en `VERDE_C` `#00A35C` o `NARANJA` `#F2602E`: **edificio**, **fachada**, **panel**, **memoria**, **timbre**, **WhatsApp**, **sistema**, **ZainSoft**. Correcciones del alineador: «Beat» → Bit, «Sainsoft» → ZainSoft.

## Paleta y tipografías
- Fondo `CREMA #F5EFE6` con resplandor `radial-gradient(ellipse at 50% 30%, rgba(242,96,46,0.20), rgba(245,239,230,0) 62%)` y rejilla `#E4DACB` (2 px cada 90 px, opacidad 0,8).
- Texto `TINTA #14151A`; marca `NARANJA #F2602E`; palabras clave sobre el fondo `VERDE_C #00A35C`; secundarios `GRIS_C #6B7280`.
- Tarjetas, paneles, cajones y celulares oscuros `CARD #1A1C22`; `#00FF88` / `#FFE600` solo dentro de tarjetas oscuras.
- Sombra de Bit: elipse con degradado `#3a2a20`, sin filtro de desenfoque.
- Fuente **Hando** (`mi-video/public/Hando.otf`).
- Render con `--gl=swangle` y visuales con `key={frame}`; sin filtros SVG con región en porcentaje.

## Assets
| Asset | Quién |
|---|---|
| Bit (rig SVG), fuente Hando | Ya en el repo |
| Edificio, maquetas (catálogo, panel de turnos, cajones, timbre, globos WhatsApp), líneas de conexión, logo | Se generan en código (productor-video) |
| `audio/voz.mp3` (ElevenLabs «Armaan», mismos ajustes que el Reel 1) | **Usuario**, con `docs/elevenlabs-guia.md`; texto en `audio/texto-para-elevenlabs.txt` |
| Efectos: golpe suave, pop, click, timbre, notificación, tono | Banco `sonidos/` del repo (productor-video elige; anotar en `CREDITOS.md`) |
| Música | Ninguna (brief) |

## Preguntas abiertas
1. ¿Aprobás este storyboard para pasar a producción?
2. ¿Te sirve que «@zainsoft_» vaya solo en pantalla y no se diga en la voz?
3. En la escena 5 los mensajes son «nuevo pedido» y «turno reservado» (genéricos, sin números). ¿Alcanza o preferís otro texto?
4. Pendientes heredados del Reel 1: licencias de la voz Armaan, la fuente Hando y los sonidos; logo en vector.

## Duración total calculada
99 palabras / 2,6 palabras por segundo ≈ 38 s de habla + pausas entre escenas ≈ **40 s** (rango del brief: 38-42 s). Se fija con la voz real.
