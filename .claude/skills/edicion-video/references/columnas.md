# El formato de clasificación (tres columnas)

Isaias lo trajo de una cuenta de autos: tres columnas de color de alto completo
—BUENA COMPRA / RETIENE VALOR / MALA COMPRA— y, a medida que el tipo nombra un
auto, la foto se posa en la columna que le toca. Adaptado al nicho: TE TRAE
PACIENTES / TE HACE QUEDAR BIEN / ENTRETIENE Y NADA MÁS, y en vez de fotos de
autos, una tarjeta con icono y nombre por tipo de contenido.

Lo que hay que copiar de la referencia es el mecanismo: **las columnas están
desde el primer cuadro** (son el gancho, porque plantean la pregunta antes de
que él diga nada) y **cada cosa que nombra se va a su lugar**.

La diferencia con el formato ranking es que acá la gráfica **pasa por detrás de
él**. Eso obliga a una máscara y cambia todo el armado.

## La máscara

Isaias grabó contra una pared iluminada de verde, así que el recorte es una
clave de croma. Pero **no es un croma parejo**: la pared va de rgb(58,124,73)
arriba a rgb(37,205,95) abajo, con casi un stop de diferencia. Cualquier filtro
que mida distancia a un color —`chromakey`, `colorkey`— falla en la mitad del
cuadro.

Lo que sí es parejo es el **exceso de verde absoluto**, `G - max(R, B)`. Medido
sobre 21 cuadros repartidos por todo el crudo:

| | exceso de verde |
|---|---|
| pared | mínimo **+34**, p0,1 = +39, mediana +45 |
| pelo, cara, buzo, silla, escritorio | máximo **+28**, p99 = +24 |

La ventana es 28–34 y **la rampa tiene que vivir adentro**. La primera prueba
usó 22–42, que parecía generoso, y dejó el 6,5 % de la pared medio opaca: el
resultado eran manchones oscuros flotando sobre las columnas. Con 29–34 no
queda un solo píxel mal clasificado.

Medí esos dos números antes de elegir la rampa. Son dos líneas de numpy y son la
diferencia entre un recorte limpio y uno con manchas:

```python
exceso = a[...,1] - np.maximum(a[...,0], a[...,2])
pared  = exceso[:, :330, :]     # la franja de arriba, donde nunca está él
```

Después de la rampa van tres cosas más:

- **Erosión de 1 px.** El HEVC del celular submuestrea el croma, así que cada
  borde trae medio píxel de verde. Sin la erosión queda un contorno verde
  alrededor del pelo.
- **Desenfoque binomial de 3×3.** La rampa angosta da un borde duro; esto lo
  devuelve a ser un borde.
- **Despill**: `G -= 0.92 · max(G - max(R,B), 0)`. La pared verde le rebota
  encima; sin la pared detrás, ese tinte queda sin explicación. No toca la cara
  ni el buzo, porque ahí el verde nunca es el canal más alto.

## Los tres archivos que come Remotion

La gráfica va detrás, así que la imagen que entra a la composición no es el
crudo sino el crudo **ya cortado y sin fondo**. Recortarle el fondo a los 645 s
de crudo para usar 74 es media hora de máquina tirada, así que se corta primero:

```
scratchpad/cortar06.py
  public/frente-06.webm   VP8 con alfa, sólo los cuadros que se ven
  public/fondo-06.mp4     los mismos cuadros sin recortar: la pared de verdad
  public/voz-06.wav       la voz con los mismos bordes
```

Los tres salen del **mismo cálculo de cuadros** (1600 muestras por cuadro a
48 kHz), así que la voz no puede correrse ni medio cuadro respecto de la imagen.

Eso simplifica la composición: no hay `Sequence` ni `trimBefore`, el video y la
voz entran derecho de punta a punta y el orden de capas es lo único que importa.

**Dos cosas del WebM con alfa que hay que hacer sí o sí**, o el alfa se pierde
sin decir nada y el video sale opaco:

- al escribir: `-metadata:s:v:0 alpha_mode=1` (sin esto ffmpeg no lo señaliza)
- al leerlo con ffmpeg para verificar: `-c:v libvpx` (el decodificador nativo de
  vp8 devuelve el cuadro sin canal alfa, y parece que el recorte falló)

Remotion sí lo lee bien con `<OffthreadVideo transparent />`. Comprobalo con un
`still` sobre fondo magenta antes de armar nada: son dos minutos y evita
rehacer la composición entera.

El grade va **sólo sobre la capa de imagen**, no sobre las columnas: las
columnas ya salen del color que tienen que tener.

## Las columnas son translúcidas: se tiene que ver la pared

Isaias lo pidió mirando la referencia otra vez: *"el fondo que tiene es el fondo
real, es porque justamente quiero que se vea un poco la pared porque hay unas
luces atrás"*. En la referencia se ven los autos y los árboles a través del
color, y eso es la mitad de lo que hace que el formato no parezca una placa.

Eso agrega una tercera capa y un tercer archivo: además del frente recortado hay
que sacar **los mismos cuadros sin recortar** (`fondo-06.mp4`, una pasada más de
ffmpeg con el mismo `select`). El orden queda:

    pared en gris  →  columnas translúcidas  →  tarjetas  →  Isaias  →  subtítulo

### La pared va en gris

La pared está iluminada de verde. Debajo de la columna roja, ese verde sólo
aporta barro. Y lo que él quiere que se vea no es el verde: son **las luces y la
textura**. Así que la capa de fondo va con `grayscale(1)` y el contraste
levantado (1,55), que es lo que hace que el resplandor que tiene detrás de los
hombros se lea a través del velo.

### El color va casi plano

Esto es lo que costó una vuelta. La primera versión translúcida mantuvo el
degradado de la versión opaca —oscuro arriba, claro al medio, oscuro abajo— y el
resultado **seguía leyéndose como un degradado, no como una pared**: la pared
tiene exactamente esa misma forma, porque la luz está detrás de él, así que las
dos variaciones se sumaban en fase y ninguna se distinguía.

Con el color plano, la única variación vertical que queda es la de la pared. Ahí
sí se lee el charco de luz, el halo alrededor de los hombros y las marcas del
revoque.

**La regla general:** si el fondo que querés que se vea tiene una estructura,
sacale esa misma estructura al gráfico que va encima. Si los dos la tienen, no
se ve ninguna.

### La opacidad baja hacia abajo

`[0.86, 0.82, 0.70, 0.50]` en cuatro paradas (0 %, 22 %, 70 %, 100 %). Arriba,
donde van los títulos y las tarjetas, el color manda; abajo, donde está el
resplandor, se abre. Cuatro paradas y no dos porque pidió expresamente que no se
lea como un corte horizontal por la mitad.

### Las separaciones

Neón, no una línea punteada: 9 px de ancho, guiones de 15 px cada 34, núcleo
blanco puro y tres `drop-shadow` de 3, 10 y 24 px de radio. Más grandes y más
brillantes que la primera versión, pero **bastante más finas que las de la
referencia**, que ahí se comen media columna.

## El encuadre manda, otra vez

Las tarjetas no pueden caer donde él está. Medí hasta dónde sube el sujeto en
cada tercio del cuadro, muestreando el crudo:

| tercio | el sujeto nunca sube de |
|---|---|
| izquierda | y = 964 |
| **centro** | **y = 772** ← el que manda |
| derecha | y = 840 |

El del medio manda, y encima es donde cae la columna del medio, que en este
video se llevó tres tarjetas. Así que las tarjetas viven entre **y=376 y
y=760**: tres de 120 px con 12 de aire.

Eso fija el tamaño de la tarjeta, y el tamaño fija todo lo demás:
270×120, icono de 68 y el nombre en dos o tres líneas de 26 px. **No alcanza
para un icono solo ni para un texto solo**: el icono es lo que se lee mientras
la tarjeta viaja, y el nombre es lo que hace que el cuadro final —siete tarjetas
repartidas— se pueda leer como resumen.

Los títulos de las columnas van arriba de todo, en y=258, en dos líneas de 40 px
con el salto escrito a mano (`"TE TRAE\nPACIENTES"`).

El subtítulo vuelve a ir **centrado en el lienzo y con el presupuesto normal de
cuatro palabras**: la gráfica está arriba y el subtítulo abajo, así que no se
pisan. Esto es al revés que en el formato ranking, donde la columna de puestos
ocupa una franja lateral y obliga a correrlo.

## Los iconos van dibujados, no bajados

Son conceptos genéricos —"cirugía", "antes y después", "palabras técnicas"—, no
marcas. Siete iconos de siete bancos distintos no comparten ni el grosor de
línea ni el redondeo, y la columna se ve armada con lo que había. Dibujados a
mano en `columnas/iconos.tsx` comparten los tres parámetros que importan: trazo
2,6, puntas redondas y caja de 48.

Es al revés que el formato ranking, donde los logos **tienen** que ser los de las
marcas y hay que bajarlos de las páginas oficiales.

## La animación

Una sola, y es la única del video. La tarjeta **aparece grande en el centro del
aire libre** (x=540, y=600, al 160 %), espera lo justo para que se lea, y se va
a su casillero con la curva de `curvas.ts`.

- 5 cuadros de fundido de entrada
- 7 cuadros quieta y grande
- 17 cuadros de viaje

Total 29 cuadros ≈ 0,97 s. El origen es el mismo para las tres columnas: lo que
se lee es el **viaje**, que es el sentido del formato ("lo nombro, lo coloco").
Si cada tarjeta apareciera ya en su columna, el formato no diría nada.

**Dónde se dispara:** la tarjeta tiene que posarse **sobre el nombre**. El
`offset` de cada una se mide contra el arranque de su bloque y se ajusta mirando
el subtítulo generado: el cue que dice el nombre y el aterrizaje tienen que caer
en el mismo segundo.

Las columnas no dibujan casilleros vacíos. En la referencia tampoco, y acá menos:
una columna se lleva dos tarjetas y otra tres, así que cualquier casillero
reservado queda colgando.
