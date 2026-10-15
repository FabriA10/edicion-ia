# Corrección de color

## El diagnóstico del set

El set de Isaias tiene una combinación que engaña:

- **Key cálida** sobre el lado derecho de la cara, bastante naranja.
- **Relleno verde** que rebota de la pared verde oliva y del polar del mismo color.
- **Contraste plano**, típico de HEVC de celular.

El error fácil —y el que cometí la primera vez— es leer "plano y verdoso" y
responder subiendo calidez y saturación. El resultado fue una cara naranja
fosforescente.

**La piel ya llega sobresaturada de rojo por la luz.** El grade tiene que
*domarla*, no acompañarla.

## El grade que funcionó

Curvas por canal con un filtro SVG `feComponentTransfer` de 7 puntos, más una
saturación casi neutra:

```xml
<filter id="grade" colorInterpolationFilters="sRGB">
  <feComponentTransfer>
    <feFuncR type="table" tableValues="0.000 0.155 0.323 0.495 0.665 0.832 0.985"/>
    <feFuncG type="table" tableValues="0.000 0.155 0.325 0.500 0.675 0.845 1.000"/>
    <feFuncB type="table" tableValues="0.014 0.110 0.282 0.492 0.705 0.883 0.986"/>
  </feComponentTransfer>
  <feColorMatrix type="saturate" values="1.02"/>
</filter>
```

Qué hace cada cosa:

- **Rojo bajado en altas** (termina en 0.985 y va por debajo de la línea recta en
  la mitad superior): dompe el naranja de la cara sin apagar la piel.
- **Verde casi neutro**: el verde de la pared ya es suficiente, no hace falta
  tocarlo, y bajarlo mucho ensucia la piel.
- **Azul levantado en sombras** (arranca en 0.014) y bajado apenas en altas:
  neutraliza el amarillo-verde del rebote y separa la piel del fondo.
- **Curva S muy leve** en los tres: da cuerpo sin quemar la cara.
- **Saturación 1.02**: prácticamente nada. La fuente ya viene alta.

## Por qué curvas SVG y no filtros CSS

`filter: contrast() saturate() hue-rotate()` es demasiado grueso: actúa igual en
todo el rango tonal y no permite tratar sombras distinto de altas, que es
justamente lo que hace falta acá. `feComponentTransfer` es el equivalente a curvas
por canal de un programa de color.

## Aplicarlo sólo al video

El grade va sobre la capa de video, **no sobre toda la composición**. Si lo ponés
en el contenedor raíz también tiñe los subtítulos, y el Claro deja de ser Claro.

```tsx
<AbsoluteFill style={{ backgroundColor: MARCA.fondo }}>
  <DefinicionDeColor />
  <AbsoluteFill style={{ filter: `url(#${GRADE_ID})` }}>
    {/* acá los tramos de video */}
  </AbsoluteFill>
  <Sonrisas ... />
  <Subtitulos ... />
</AbsoluteFill>
```

Lo mismo vale para las fotos de casos: van fuera del grade, porque vienen de otra
cámara y otra luz.

## Medí la piel, no la mires

"Se ve muy amarilla, se ve muy fea la piel" fue la corrección del video 6, y a
ojo no se resolvía: el grade parecía razonable. Con dos números sale en un
minuto.

Tomá la mejilla y la frente —un recorte de unos 150×120 alrededor de la cara—,
quedate con los píxeles de luminancia media (entre 90 y 230, para no meter pelo
ni sombra) y convertí el promedio a HLS:

```python
a = np.asarray(Image.open(still).convert("RGB")).astype(float)[980:1100, 465:615].reshape(-1, 3)
m = a.mean(1); sel = a[(m > 90) & (m < 230)]
h, l, s = colorsys.rgb_to_hls(*(sel.mean(0) / 255))
```

| | matiz | saturación |
|---|---|---|
| piel que se lee bien en cámara | **20-28°** | **~45 %** |
| arriba de 35° | se lee amarilla | |
| abajo de 15° | se lee rosada | |

En el video 6: el crudo ya venía en 32,8° y 52 %, y **el grade lo empeoraba** —
la curva de contraste subía la saturación a 60,5 %. Es un efecto que se olvida:
cualquier curva en S sube la saturación de rebote.

El arreglo son dos matrices después de la curva, no tocar la curva:

```
<feColorMatrix type="saturate"  values="0.78" />
<feColorMatrix type="hueRotate" values="-9" />
```

`saturate` baja la saturación sin mover el matiz ni la luminancia; `hueRotate`
corre el matiz del amarillo-naranja al naranja-rojo. Quedó en **25,5° y 48 %**.

Sobre el resto de la imagen no hacen casi nada, porque el buzo, la silla y el
escritorio son prácticamente neutros. Verificalo igual midiendo el buzo antes y
después: si se fue a gris, te pasaste con `saturate`.

## Cómo evaluarlo

Renderizá un frame con grade y extraé el mismo frame sin grade desde el archivo de
`public/`, y comparalos lado a lado. A ojo, sobre un solo frame, es muy fácil
pasarse: la referencia es lo que hace la diferencia.

Lo que tenés que ver: la piel más natural (menos naranja), el amarillo-verde del
ambiente bajando, y algo más de cuerpo en el contraste. Si la piel se ve más
saturada que en el original, te pasaste.
