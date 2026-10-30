# Storyboard: «Esta invitación no se imprime»

1080x1920 · 30 fps · ~31 s · fondo **claro crema `#F5EFE6`** (rejilla y resplandor naranja de la paleta aprobada).
Tiempos estimados: se ajustan a la voz real (`audio/voz.mp3`) con `alinear-palabras.mjs`.

El celular es una maqueta oscura (`CARD #1A1C22`) generada en código; adentro va la **grabación real** de las tarjetas.

| # | t inicio–fin | Voz / texto en pantalla | Visual (sin rostros) | Fuente del visual | Movimiento / transición | Sonido |
|---|---|---|---|---|---|---|
| 1a | 0,0–1,4 | «Esta invitación de quince no se imprime.» · cartel arriba: **no se imprime** (tachando un ícono de impresora) | Bit entra desde la izquierda con un sobre violeta con sello «15» en las manos y lo extiende hacia cámara | Bit: marioneta SVG del repo; sobre: generado en código, copiando el sobre de la tarjeta | Bit entra con squash; el sobre ocupa casi todo el cuadro | papel (whoosh corto) |
| 1b | 1,4–3,0 | «Se abre así.» | El sobre se convierte en la pantalla del celular: «Tocá para abrir» → un dedo (punto de toque, sin mano) toca → el sobre se abre y aparece «Mis 15 · Martina» con estrellas | captura propia de `tarjetas/quince/` | zoom out 1,30 → 1 mientras se abre; destellos dorados | sobre que se abre + destello suave |
| 2 | 3,0–6,5 | «Es una web: tus invitados la abren desde el celular.» · subtítulos | Celular centrado; la tarjeta hace scroll suave hasta «Estás invitado». Bit al costado, señalando la pantalla | captura propia | push-in lento 1 → 1,08 sobre el celular | — |
| 3a | 6,5–8,0 | «Tiene cuenta regresiva,» · chip **cuenta regresiva** | Scroll a la cuenta regresiva (los segundos corren) | captura propia | punch-in 1 → 1,12 a la cuenta; chip entra con rebote | tic de reloj bajo |
| 3b | 8,0–9,3 | «cómo llegar» · chip **cómo llegar** | Scroll a «¿Dónde y cuándo?», se marca el botón «Cómo llegar» con un anillo naranja | captura propia | corte con desplazamiento; anillo que late | pop sutil |
| 3c | 9,3–10,7 | «y el alias para el regalo.» · chip **alias para regalos** | Scroll a «Lluvia de sobres»; toque en «Copiar alias» | captura propia | los 3 chips quedan apilados a la izquierda del celular (fila de íconos) | click UI |
| 4 | 10,7–15,2 | «Y confirman por WhatsApp, hasta con la canción que no puede faltar.» · palabras clave **WhatsApp** (verde `#00A35C`) y **la canción** | Formulario «¿Venís a mi fiesta?»: se marca «¡Obvio que voy!», «2 personas», en «Canción que no puede faltar» se escribe una canción (texto genérico, p. ej. «la de los lentos 😅», sin canciones reales con nombre) → toque en «Confirmar por WhatsApp» | captura propia (formulario lleno con datos de ejemplo) | punch-in al formulario; escritura tipo máquina; al confirmar, burbuja de WhatsApp verde sale del celular | teclado suave, pop al confirmar |
| 5 | 15,2–18,0 | «Sin perseguir a nadie para saber quién va.» | Bit festeja (gesto de festejo) mientras caen tildes verdes «✓ confirmado» alrededor del celular (3-4 burbujas con nombres genéricos: «Tía Marta ✓», «Juli ✓», «Primo Nico ✓») | generado en código | burbujas que suben y se apilan; Bit salta con squash | pops escalonados, muy bajos |
| 6a | 18,0–19,6 | «La hacemos para quince,» · rótulo **15 años** | Celular con la tarjeta de 15 (portada) | captura propia | corte rápido; rótulo cae con rebote | whoosh corto |
| 6b | 19,6–21,0 | «casamientos» · rótulo **casamientos** | La pantalla gira (giro 3D tipo carta) a la tarjeta de casamiento: «Sofía & Tomás», hojas verdes | captura propia de `tarjetas/casamiento/` | giro 3D 180° del celular | whoosh corto |
| 6c | 21,0–22,4 | «o baby showers,» · rótulo **baby shower** | Giro a la tarjeta de baby shower | captura propia de `tarjetas/baby-shower/` | giro 3D 180° | whoosh corto |
| 6d | 22,4–23,6 | «a tu estilo.» | Las 3 tarjetas se abren en abanico, una al lado de la otra (tres celulares) | captura propia | abanico con rebote; las 3 entran en x 120-960 | destello suave |
| 7a | 23,6–25,0 | «¿Tenés un evento?» | Los 3 celulares se apartan; Bit al centro con el gesto de «pensar» | generado en código | Bit entra con squash | — |
| 7b | 25,0–28,5 | «Pedí la tuya desde el link en la bio.» · franja CTA: logo ZainSoft + **link en la bio** + **@zainsoft_** (y ≈ 1250-1450) | Bit señala hacia arriba (hacia el perfil/bio); franja con el logo y el usuario | generado en código; logo recreado (como en la serie) | franja entra desde abajo; flecha que late hacia arriba | sonido tenue en el logo |
| 7c | 28,5–31,0 | (sin voz) | El celular vuelve con el sobre cerrado «Tocá para abrir» de la escena 1 → empalma con el inicio (bucle) | captura propia | el celular cae al centro con rebote; corte seco al final | — |

Revisión del ritmo (tramos de 3 s): 0-3 sobre/apertura · 3-6 scroll + push-in · 6-9 dos chips · 9-12 alias + formulario ·
12-15 escritura + WhatsApp · 15-18 tildes y Bit · 18-21 dos giros · 21-24 giro + abanico · 24-27 Bit + franja · 27-31 bucle.
No hay tramo sin evento.

## Subtítulos
- Estilo de la serie: Hando Bold, minúscula, sin puntos, una línea, máx. 4 palabras; tinta `#14151A` con sombra blanca suave.
- Posición: debajo del celular, y ≈ 1500-1600 (dentro de la zona segura). En las escenas con chips/rótulos no se superponen.
- Palabras clave: «whatsapp» en `VERDE_C #00A35C`; «quince», «casamientos», «baby showers» y «link en la bio» en `NARANJA #F2602E`.

## Paleta y tipografías
- Paleta «Claro crema» de `docs/estilo-visual-reels.md` (`CREMA`, `TINTA`, `NARANJA`, `VERDE_C`, `GRIS_C`, `CARD`).
- Hando Bold para subtítulos y carteles. Dentro del celular, las fuentes propias de cada tarjeta (vienen en la captura).

## Assets a conseguir
| Asset | Quién | Cómo |
|---|---|---|
| `audio/voz.mp3` (o `voz-01…07.mp3`) | **Usuario** (cuenta de ElevenLabs) | Texto de `GUION.md`, voz Armaan, mismos ajustes (`docs/elevenlabs-guia.md`) |
| Grabaciones de las 3 tarjetas en celular (390x844 @3x, ~60 fps) | Producción (yo) | Navegador automatizado sobre las tarjetas publicadas: abrir sobre, scrolls, toques, formulario lleno con datos de ejemplo. **No se envía el WhatsApp**: se graba hasta el toque y la burbuja es animación |
| Bit (marioneta SVG) | Repo | `mi-video/src/bit/` del reel de Pierina / app del reel 2 |
| Logo ZainSoft | Repo | recreado en código (como en la serie); sigue pendiente el vector |
| Sonidos (papel, pop, click, whoosh, destello) | Repo | `sonidos/` (licencia a confirmar, ver pendientes de la serie) |

## Preguntas abiertas
- Ninguna bloqueante. Opcional: ¿quieren que en la franja final aparezca también la URL de la web, o solo «link en la bio» + @zainsoft_?

**Duración total calculada: ~31 s.**
