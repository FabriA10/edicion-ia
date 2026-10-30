# Estilo visual de los reels: fondos y paletas

Decisión del usuario (2026-10-20), tras ver el primer reel sobre fondo oscuro: **«el fondo más claro, porque no se notan los colores negros de Bit»**. Quedó aprobado el fondo claro crema.

## Regla: el color de fondo SIEMPRE se pregunta
Antes de producir cualquier video, `validador-prompt` pregunta el color de fondo (pregunta bloqueante, aunque el pedido no lo mencione). **No se asume ni se hereda del reel anterior.** Se anota en el campo «Fondo» del `BRIEF.md` y `productor-video` lo aplica con la tabla de abajo.
Cuándo recomendar cada uno:
- **Claro (crema)**: cuando hay elementos negros u oscuros importantes (la mascota Bit tiene media cara negra) o el reel se ve de día/en feed claro. Probado y aprobado.
- **Oscuro**: cuando todo el contenido es de colores vivos o neón; ojo con Bit, que pierde la mitad negra.
- **Color de marca u otro**: pedir el hex; comprobar contraste con la mascota y el texto.

## Paleta «Claro crema» (aprobada; reel 1 de la serie ZainSoft)
Tokens al inicio de `app/src/reel/SistemaReel.tsx`:

| Token | Valor | Uso |
|---|---|---|
| `CREMA` | `#F5EFE6` | fondo |
| Resplandor | `radial-gradient(ellipse at 50% 30%, rgba(242,96,46,0.20), rgba(245,239,230,0) 62%)` | calidez detrás del contenido |
| Rejilla | trazo `#E4DACB` de 2 px cada 90 px, opacidad 0,8 | textura tenue |
| `TINTA` | `#14151A` | texto sobre el fondo, logo, subtítulos |
| `NARANJA` | `#F2602E` | marca, palabras clave secundarias, botones |
| `VERDE_C` | `#00A35C` | palabras clave y líneas verdes **sobre el fondo** |
| `GRIS_C` | `#6B7280` | textos secundarios sobre el fondo |
| `CARD` | `#1A1C22` | tarjetas, paneles y teléfonos: **se mantienen oscuros** (contrastan con el crema) |
| `VERDE` / `AMARILLO` | `#00FF88` / `#FFE600` | solo **dentro** de tarjetas oscuras (barras, checks) |
| Sombra de Bit | elipse con degradado `#3a2a20` (0,5 → 0) | suelo; **sin filtro de desenfoque** |

Adaptaciones al pasar de oscuro a claro (lo que hubo que cambiar):
- Texto sobre el fondo: blanco → `TINTA`. Subtítulos: tinta, con sombra blanca suave (`0 3px 14px rgba(255,255,255,.8)`) y óvalo de respaldo blanco al 45 %.
- Palabras clave de subtítulos: verde neón → `VERDE_C`; amarillo → `NARANJA` (el amarillo no se lee sobre crema).
- Logo recreado: cuadrado `TINTA` con «Z» blanca y «S» naranja; «Zain» en `TINTA`, «Soft» naranja.
- Elementos «atenuados» (la web tachada): subir la atenuación (opacidad 0,12) porque una tarjeta oscura al 25 % se ve como un bloque gris sobre el crema.

## Paleta «Oscuro» (versión anterior, para comparar)
Fondo `#0E0F13`, rejilla `#1B1D23`, resplandor naranja 0,16, texto blanco, subtítulos blancos con sombra negra, palabras clave `#00FF88` / `#FFE600`. La versión oscura del reel 1 ya no existe (el usuario la borró); se regenera cambiando los tokens de esta tabla en `SistemaReel.tsx`.

## Otras reglas visuales que salieron de este reel
- Elementos a ≥ 120 px de los costados y entre y 250 y 1670 (zona segura).
- Subtítulos a y ≈ 1110-1250; Bit con los pies en y 1660 (escala 0,52).
- **Sin filtros SVG de desenfoque** donde se pueda (sombras con degradado). Si hace falta uno, `filterUnits="userSpaceOnUse"` con región fija y aplicado a un `<g>`. Motivo: cortaban el texto y dejaban una copia fantasma de Bit en pantalla (ver `docs/aprendizajes-equipo.md` §12).
