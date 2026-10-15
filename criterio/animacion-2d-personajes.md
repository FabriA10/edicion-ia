# Video animado 2D con personajes (01/10/2026)

Pedido dictado: solo vale la voz en off de los crudos (el video es negro). Primero el
**corte limpio de la voz**, después "pura animación de personajes con fondos creados
por vos", con cambios de escena seguidos. Referencia de estilo: animación plana tipo
*explainer*: formas redondas, manos circulares, **sin contorno**, cejas de color.

Todo en `proyectos/11-animacion-2d-personajes/` (`src/anim/`; orden de scripts en
`trabajo/scripts/LEEME.txt`).

## Cómo está armado

- **Títere SVG propio** con poses por cuadro clave (`personaje/Personaje.tsx`,
  `kf.ts`): cabeza, ojos, cejas, boca por apertura, brazos de dos segmentos con manos
  redondas, piernas. `estilos.ts` define cada personaje (colores, pelo, ropa).
- **26 escenas** en una tabla (`guion.ts`); cada una arranca **unos cuadros ANTES de la
  palabra que la abre**, para que la imagen ya esté cuando se la dice.
- **Transiciones**: corte, barrido con desenfoque de movimiento, subida, zoom, iris
  (`Video.tsx`). Detalle en la skill `transiciones-y-efectos`.
- **Cámara 2D** (`Camara.tsx`): mira al punto (x, y) con zoom z, con la curva de paneo.
- **Subtítulos** arriba (centro y=360) en toda la animación; en la pantalla partida,
  sobre la costura del medio.
- Música "biscuit" con drop en los momentos clave, 164 efectos de la carpeta de
  sonidos más timbre, zumbido y campanita sintetizados (`sfx.py`, `musica.py`,
  `cierre.sh`: se rehacen **sin re-renderizar**).

## Lecciones que valen para cualquier animación

- **Los muebles tienen que estar a la escala de los personajes.** Una persona de
  ~950 px: asiento del sillón a ~300 px, mesada a ~400. Si no, "se ve gigante".
- **El celular vibra en ráfagas cortas**, no sacudiéndose sin parar: 10 cuadros
  prendido de cada 24, con 2,4 px y 0,55° (la primera versión, 7 px y 2,2° sin parar,
  se rechazó por "muy exagerada"). El zumbido del sonido cae en cada ráfaga.
- **Balanceo mínimo** de cuerpo y cabeza para que los personajes nunca queden duros.
- Piernas dobladas (`pose.piernas`) para sentado o acostado: una persona semiacostada
  "sin pierna" se rechazó.
- Un cartel no tapa la cara del personaje.
- **La voz decide el tiempo.** Los tiempos finos de las palabras salen de transcribir
  **cada corrida de voz aislada** (`corridas.py`): Whisper sobre el trozo entero corre
  una palabra hasta 0,55 s. Una pausa de 0,45 s antes de una palabra final ("…todo")
  puede hacer que el detector de pasadas la descarte por corta: revisarlo.
- Versión liviana para el celular: x264 crf 22 (23,7 MB, diferencia media 0,3/255).
