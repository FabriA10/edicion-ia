# Storyboard: «¿Ya está lista mi moto?» (caso real LV Racing)

1080x1920 · 30 fps · ~35 s · fondo **OSCURO `#0E0F13`** (rejilla `#1B1D23`, resplandor naranja). Tiempos atados a las
palabras de la voz real. Bit con un círculo de luz cálida en el piso para que se lea su mitad negra.
Material: capturas reales de lo público + lo interno animado en código con el estilo del sitio (oscuro, rojo `#DC2626`).

| # | t | Voz | Visual (sin rostros) · fuente | Movimiento | Bit | Sonido |
|---|---|---|---|---|---|---|
| 1 Gancho | 0–4,5 | «¿Ya está lista mi moto? Si tenés un taller, te lo preguntan todos los días.» | Celular con un chat de **WhatsApp** donde llueve la misma pregunta: «¿ya está lista mi moto?», «¿y la KTM?», «¿cuándo la retiro?»… con horarios distintos. Contador de mensajes que sube. *Código* | burbujas con rebote; leve sacudida | se rasca la cabeza | notificaciones bajas |
| 2 Caso | 4,5–7,5 | «Mirá lo que hicimos para LV Racing, en Tucumán.» | Corte: la **portada real** de `lv-racing-web.vercel.app` (logo LV Racing, «Mecánica de Alto Rendimiento») dentro de un celular. Rótulo **CASO REAL** + pin «Tucumán». *Captura* | push-in lento; rótulo con rebote | señala orgulloso | golpe/whoosh de entrada (arranque de la energía) |
| 3 Tablero | 7,5–13,5 | «En el taller, cada moto avanza en un tablero: recibida, diagnóstico, repuestos, reparación y lista.» | **Tablero Kanban** (estilo del sitio): cinco columnas *Recibida · En diagnóstico · Esperando repuestos · Reparación · Lista*. Una tarjeta «KTM 350 · Orden #128» salta de columna en cada palabra; en «lista» se pone verde ✓. *Código, datos inventados* | la tarjeta se mueve con rebote; la columna activa se ilumina | sigue la tarjeta | click por columna, tilde al final |
| 4 Fotos | 13,5–17,5 | «El mecánico saca fotos con el celular y quedan guardadas en la orden.» | Celular en modo cámara (visor dibujado de una pieza: disco de freno / cadena, ilustración, sin manos) → **obturador** → la miniatura vuela a la orden: «Evidencias (3)». *Código* | flash del obturador; miniatura que vuela | — | obturador + pop |
| 5 Mi Garage | 17,5–25 | «Y el cliente entra a Mi Garage y ve el avance de su moto, con las fotos, sin llamar.» | **Login real de Mi Garage** (captura) → toque en «Ingresar» → portal animado: «KTM 350 · **En reparación**», barra de progreso que avanza hasta 4/5, galería de 3 fotos (ilustraciones) e historial. Chip «0 llamadas». *Captura + código* | transición de toque; la barra se llena | festeja | click + destello |
| 6 Remate | 25–27,5 | «Menos llamadas, y clientes que confían.» | Dos íconos: teléfono con flecha hacia abajo y un apretón/escudo con ✓. *Código* | revelación de a uno | asiente | 2 pops |
| 7 CTA | 27,5–35 | «¿Querés algo así para tu negocio? Link en la bio.» | Logo ZainSoft + «Caso real · LV Racing» + píldora **«link en la bio»** con flecha + **@zainsoft_**. *Código* | entradas con rebote | saluda | destello en el logo |

## Subtítulos
Hando Bold, minúscula, máx. 4 palabras, **blancos** con sombra negra (paleta oscura) en y ≈ 1280-1390. Claves en
`#FFE600`/naranja: «lv racing», «mi garage», «bio»; en verde `#00FF88`: «lista», «confían».

## Cuidados
- No se entra al sistema real ni se muestran datos de clientes: lo interno es una recreación con datos inventados
  (lo dice el brief; si hace falta, rótulo chico «recreación»).
- Si la portada del sitio tiene fotos con personas, se recorta o desenfoca (sin rostros).
- Marcas de motos solo como aparecen en el portfolio público.

## Assets
| Asset | Quién | Estado |
|---|---|---|
| `audio/voz.mp3` | Usuario (ElevenLabs, voz de Bit) | pendiente — texto en `GUION.md` |
| `audio/musica/…mp3` | Usuario (Pixabay; enérgica, rock/motor suave, sin voces) | pendiente |
| Portada del sitio y login de «Mi Garage» | Producción (yo), captura pública | a capturar |
| Chat, tablero, cámara, portal por dentro, íconos, logo | Código | a producir |
| Bit, sonidos | Repo | ✓ |

**Duración total: ~35 s.**
