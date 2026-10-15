# Subtítulos animados: curvas exactas y cómo replicarlas

Esta es la referencia de la skill `subtitulos-animados`: el criterio de cuándo
animar está allá, y acá están los números.

## De dónde salen los números

- **Fuente:** las composiciones *Smooth Line Up* y *Delayed Up slide* del
  Media Pool del proyecto *video 1 creativo* (Resolve Studio 20.3.2, 30 fps,
  1080×1920). Se leyeron de la base del proyecto y no se midieron en capturas.
  Las capturas del editor de curvas que mandó Isaias coinciden con estos
  valores.
- **La curva:** el evaluador que armó estas tablas se validó contra Resolve en
  vivo, leyendo `Displacement` en 17 tiempos fraccionarios de una curva del
  mismo tipo. El error máximo fue 1e-14.
- **El Follower:** su lógica (orden, retraso y qué se mueve por palabra) se
  midió con `GetDoD`, la caja del render del Text+, cuadro por cuadro. Ver
  "Cómo trabaja el Follower".

## Smooth Line Up

La línea entera sube desde un horizonte blando. Nace cortada a la mitad, en el
cuadro 1 ya está entera y el resto es asentamiento.

**Nodos:**

```
Template (Text+)   StyledText ← Follower1 (Follower)
Follower1          Line Offset ← Path1.Position
Path1              Displacement ← Path1Desplazamiento (curva)
Template           EffectMask ← Rectangle1 (invertida)
```

**Valores:**

| Qué | Valor |
|---|---|
| Follower1 | Orden 7 (Automático), retraso entre cada carácter, Retraso 0,6. En una sola línea no se nota: la línea usa el retraso de su primera letra, que es 0 |
| Path1 | de (0, −0,2) a (0, 0): sube 0,2 del alto = **384 px** |
| Keyframes | `[0] = { 0, RH = { 0.65, 0.64 } }` · `[20] = { 1, LH = { 4.05, 0.974 } }` |
| Rectangle1 | invertida, SoftEdge 0,0787 (85 px), Center (0,494; 0,117), Width 1,598, Height 0,648 |
| Remotion | `Easing.bezier(0.0325, 0.64, 0.2025, 0.974)` sobre 20 cuadros |

**El horizonte está puesto a propósito.** El borde superior de la máscara cae a
1346 px del techo: 386 px debajo del centro final de la línea, que es justo
donde arranca el centro del texto (384 px). Coincide a 2 px. Por eso la línea
nace a medio asomar y no aparece de golpe ni tarde. Es lo que pidió Isaias:
*"si no aparece medio rápido junto con la opacidad, la animación es al
pedo"*.

**Cuadro por cuadro:**

| Cuadro | Recorrido | Falta | Cuadro | Recorrido | Falta |
|---:|---:|---:|---:|---:|---:|
| 0 | 0,0 % | 384 px | 11 | 93,5 % | 25 px |
| 1 | 39,2 % | 233 px | 12 | 94,9 % | 19 px |
| 2 | 54,6 % | 174 px | 13 | 96,1 % | 15 px |
| 3 | 64,4 % | 137 px | 14 | 97,1 % | 11 px |
| 4 | 71,5 % | 110 px | 15 | 97,9 % | 8 px |
| 5 | 76,9 % | 89 px | 16 | 98,6 % | 6 px |
| 6 | 81,1 % | 72 px | 17 | 99,1 % | 4 px |
| 7 | 84,6 % | 59 px | 18 | 99,5 % | 2 px |
| 8 | 87,5 % | 48 px | 19 | 99,8 % | 1 px |
| 9 | 89,9 % | 39 px | 20 | 100,0 % | 0 px |
| 10 | 91,9 % | 31 px | | | |

## Delayed Up slide

Cada palabra sube por su cuenta y entra por una ventana blanda a la altura de la
línea. Las palabras llegan de a una.

**Nodos:**

```
Template (Text+)   StyledText ← Follower1_1 (Follower)
Follower1_1        Word Offset ← Path1_1.Position
Path1_1            Displacement ← Path1_1Desplazamiento (curva)
Template           EffectMask ← Rectangle1 (ventana, sin invertir)
Template → SoftGlow1 → MediaOut1
```

**Valores:**

| Qué | Valor |
|---|---|
| Follower1_1 | Orden 7 (Automático), retraso entre cada carácter, **Retraso 2** |
| Path1_1 | de (0, −0,166) a (0, 0): sube 0,166 del alto = **319 px** |
| Keyframes | `[0] = { 0, RH = { 1.2316, 0.9019 } }` · `[18] = { 1, LH = { 4.3714, 1 } }` |
| Rectangle1 | ventana centrada en la línea: Height 0,096 (104 px), SoftEdge 0,0409 (44 px). El Width queda en 0,5, el valor por defecto (540 px), y corta las líneas más anchas: en los videos de Isaias va en 1,2 |
| SoftGlow1 | Threshold 0,268, Gain 0,315, tamaño 100. Es el brillo de la plantilla: en el subtítulo de video queda afuera salvo que lo pida, porque compite con la sombra |
| Remotion | `Easing.bezier(0.0684, 0.9019, 0.2429, 1)` sobre 18 cuadros por palabra |

**El escalonado:** el retraso de cada palabra es 2 × la posición de su primera
letra, contando los espacios. Con *"y vivo en tucumán"*:

| Palabra | Primera letra | Arranca | 95 % posada |
|---|---:|---:|---:|
| y | 0 | 0 | 8 |
| vivo | 2 | 4 | 12 |
| en | 7 | 14 | 22 |
| tucumán | 10 | 20 | 28 |

Cada palabra pasa unos 2 cuadros tapada debajo de la ventana. Empieza a asomar
hacia el cuadro 2, en el 4 está a medio cruzar el borde blando y hacia el 12 o
13 ya está entera y posada.

**Cuadro por cuadro (cada palabra, desde su arranque):**

| Cuadro | Recorrido | Falta | Cuadro | Recorrido | Falta |
|---:|---:|---:|---:|---:|---:|
| 0 | 0,0 % | 319 px | 10 | 97,4 % | 8 px |
| 1 | 44,1 % | 178 px | 11 | 98,2 % | 6 px |
| 2 | 63,5 % | 116 px | 12 | 98,8 % | 4 px |
| 3 | 74,7 % | 81 px | 13 | 99,3 % | 2 px |
| 4 | 81,9 % | 58 px | 14 | 99,6 % | 1 px |
| 5 | 86,8 % | 42 px | 15 | 99,8 % | 1 px |
| 6 | 90,4 % | 31 px | 16 | 99,9 % | 0 px |
| 7 | 93,0 % | 22 px | 17 | 100,0 % | 0 px |
| 8 | 94,9 % | 16 px | 18 | 100,0 % | 0 px |
| 9 | 96,4 % | 12 px | | | |

## Cómo trabaja el Follower (medido, no supuesto)

- **`Order = 7` es Automático**, el valor por defecto (`INPN_Default = 7`), y
  ondea de izquierda a derecha. El menú lo muestra primero, pero en el archivo
  se guarda como 7: las plantillas de Blackmagic usan la numeración vieja,
  donde 0 es "hacia la derecha" y 4 es "aleatorio uno por uno" (*Random Write
  On*). No es "Curva manual".
- **Retraso entre cada carácter** = Retraso × posición del carácter, contando
  los espacios.
- **La opacidad y el color van por carácter.** Line Offset y Word Offset se
  aplican a la línea o a la palabra entera, con el tiempo de su primera letra.

La prueba es *Smooth Word Left* (Retraso 0,46, Word Offset horizontal de
−0,166 y opacidad animada). La caja del render crece letra por letra, pero
cada palabra se desplaza entera:

| Cuadro | Caja x | Qué se ve |
|---:|---|---|
| 0 | vacía | nada: opacidad 0 |
| 1 | 161–302 | "Smo": tres letras (retrasos 0; 0,46; 0,92), movidas juntas 107 px, que es el valor de la palabra |
| 3 | 215–451 | "Smooth" entera; "Word" arranca en 3,22 |
| 5 | 240–602 | "Smooth Word"; "Left" arranca en 5,52 |
| 20 | 268–813 | posado |

## Unidades de Fusion

- **Inputs de punto** (Center, offsets, trayectorias): X es fracción del ancho
  (× 1080) e Y es fracción del alto (× 1920). X está medido con `GetDoD`
  (−0,166 → −179 px); Y lo confirma el horizonte de *Smooth Line Up*, que
  coincide a 2 px.
- **Máscaras:** Width, Height y SoftEdge son fracción del ancho (× 1080).
- **Trayectoria (PolyPath):** los puntos están alrededor del centro 0,5; el
  punto (−0,5; −0,7) equivale al valor (0; −0,2).
- La plantilla tiene Text+ Size 0,08, que da unos 65–75 px de eme: la letra es
  algo más chica que el subtítulo de los videos (88 px). Los recorridos se copian
  en px del cuadro, que es como los mide Fusion.

## Remotion

### El componente

Está probado con render sobre un cuadro real del video 7. Va al lado de
`Subtitulos.tsx` y usa el mismo `marca.ts`:

```tsx
import { Fragment } from "react";
import { Easing, interpolate } from "remotion";
import { FUENTE_SUBTITULO, MARCA } from "./marca";

// Las curvas son los tiradores de los dos keyframes de las composiciones de
// Resolve pasados a cubic-bezier: dan lo mismo que Fusion cuadro por cuadro.
export const CURVA_SMOOTH_LINE_UP = Easing.bezier(0.0325, 0.64, 0.2025, 0.974);
export const CURVA_DELAYED_UP_SLIDE = Easing.bezier(0.0684, 0.9019, 0.2429, 1);

export type Animacion = "smooth-line-up" | "delayed-up-slide";

// Recorridos y bordes blandos en px de un cuadro 1080×1920, igual que en
// Fusion: el desplazamiento es fracción del alto (0,2 y 0,166) y el borde
// blando de la máscara, fracción del ancho.
const LINE_UP = { cuadros: 20, recorrido: 384, blando: 85 };
const DELAYED = { cuadros: 18, recorrido: 319, blando: 44, retrasoPorCaracter: 2 };

const SOMBRA = `0 4px 24px ${MARCA.tinta}cc, 0 2px 6px ${MARCA.tinta}99`;

export const SubtituloAnimado: React.FC<{
  texto: string;
  animacion: Animacion;
  // Cuadros desde que arrancó el cue.
  entrada: number;
  // Centro de la línea ya posada, en px del lienzo.
  centroX: number;
  centroY: number;
  // Ancho disponible y cuerpo ya ajustado con fitText, como en el estático.
  caja: number;
  cuerpo: number;
}> = ({ texto, animacion, entrada, centroX, centroY, caja, cuerpo }) => {
  const alto = cuerpo * 1.1;
  const letra: React.CSSProperties = {
    fontFamily: FUENTE_SUBTITULO,
    fontSize: cuerpo,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: -0.5,
    // Toda la letra en color de la marca, no un borde.
    color: MARCA.verdeLuz,
    textShadow: SOMBRA,
    whiteSpace: "nowrap",
  };

  if (animacion === "smooth-line-up") {
    const p = interpolate(entrada, [0, LINE_UP.cuadros], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: CURVA_SMOOTH_LINE_UP,
    });
    // El horizonte blando queda fijo justo donde arranca el centro de la
    // línea: nace cortada a la mitad y en el primer cuadro ya recorrió el 39 %,
    // así que se ve entera mientras todavía sube.
    const horizonte = centroY + LINE_UP.recorrido;
    const mascara = `linear-gradient(to bottom, #000 ${horizonte - LINE_UP.blando / 2}px, transparent ${horizonte + LINE_UP.blando / 2}px)`;
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          maskImage: mascara,
          WebkitMaskImage: mascara,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        <div
          style={{
            ...letra,
            position: "absolute",
            left: centroX - caja / 2,
            width: caja,
            top: centroY - alto / 2,
            textAlign: "center",
            transform: `translateY(${(1 - p) * LINE_UP.recorrido}px)`,
          }}
        >
          {texto}
        </div>
      </div>
    );
  }

  // Delayed Up slide: cada palabra sube por su cuenta y entra por una ventana
  // blanda fija a la altura de la línea. El retraso cuenta caracteres, espacios
  // incluidos, y la palabra entera arranca con el de su primera letra.
  let indice = 0;
  const palabras = texto.split(" ").map((palabra) => {
    const retraso = DELAYED.retrasoPorCaracter * indice;
    indice += palabra.length + 1;
    const p = interpolate(entrada - retraso, [0, DELAYED.cuadros], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: CURVA_DELAYED_UP_SLIDE,
    });
    return { palabra, y: (1 - p) * DELAYED.recorrido };
  });
  const b = DELAYED.blando;
  const ventana = `linear-gradient(to bottom, transparent 0px, #000 ${b}px, #000 ${alto + b}px, transparent ${alto + 2 * b}px)`;
  return (
    <div
      style={{
        position: "absolute",
        left: centroX - caja / 2,
        width: caja,
        top: centroY - alto / 2 - b,
        height: alto + 2 * b,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Sin repetir: fuera del degradé la máscara es transparente, y así la
        // palabra que todavía está abajo no reaparece en otra copia.
        maskImage: ventana,
        WebkitMaskImage: ventana,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      <div style={letra}>
        {palabras.map(({ palabra, y }, i) => (
          <Fragment key={i}>
            {i > 0 ? " " : null}
            <span style={{ display: "inline-block", transform: `translateY(${y}px)` }}>{palabra}</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
```

### Conectarlo al subtítulo

El cue se marca con la animación, y los que no la tienen quedan quietos:

```ts
// tipos.ts
export type Cue = { desde: number; hasta: number; texto: string; animacion?: Animacion };
```

```tsx
// Subtitulos.tsx, después de calcular `cuerpo` y `caja`
if (activo.animacion) {
  return (
    <SubtituloAnimado
      texto={activo.texto}
      animacion={activo.animacion}
      entrada={(t - activo.desde) * fps}
      centroX={centroX ?? width / 2}
      centroY={height * altura + (cuerpo * 1.1) / 2}
      caja={caja}
      cuerpo={cuerpo}
    />
  );
}
// El estático se dibuja sin opacity ni translateY: entra y sale al corte.
```

## Resolve

### Con las composiciones del proyecto

1. `folder get_clips` sobre `Master` devuelve los ids de *Smooth Line Up* y
   *Delayed Up slide*. Son los mismos que usa la base del proyecto.
2. Poné la composición en una pista libre, en el tiempo del cue, y recortala a
   su duración.
3. Con `fusion_comp set_input` y el ítem como destino:
   - el texto va en `Follower1.Text` o `Follower1_1.Text`;
   - el color va en `Template.Red1`, `Green1` y `Blue1` = `0.498`, `0.690` y
     `0.651`.
4. La altura del pecho se consigue moviendo el clip entero: Posición Y del
   Inspector, −442 px para el 73 %.

Los pasos 2 y 4 todavía no se probaron por MCP: verificá el resultado con un
cuadro renderizado.

### En otro proyecto: bloque para pegar

Pegalo en el editor de nodos de una composición vacía y conectá `Template` al
MediaOut. Si ya hay un Text+ llamado `Template`, Fusion renombra el pegado.
Los valores son los de las composiciones de Isaias, con el color de la marca y
Hando. No se probó pegándolo: es la sintaxis de Fusion, pero confirmalo la
primera vez.

**Smooth Line Up:**

```lua
{
	Tools = ordered() {
		Template = TextPlus {
			Inputs = {
				EffectMask = Input { SourceOp = "Rectangle1", Source = "Mask", },
				Width = Input { Value = 1080, },
				Height = Input { Value = 1920, },
				UseFrameFormatSettings = Input { Value = 1, },
				StyledText = Input { SourceOp = "Follower1", Source = "StyledText", },
				Font = Input { Value = "Hando", },
				Style = Input { Value = "Bold", },
				Red1 = Input { Value = 0.498, },
				Green1 = Input { Value = 0.69, },
				Blue1 = Input { Value = 0.651, },
				VerticalJustificationNew = Input { Value = 3, },
				HorizontalJustificationNew = Input { Value = 3, },
			},
		},
		Follower1 = StyledTextFollower {
			Inputs = {
				Order = Input { Value = 7, },
				Delay = Input { Value = 0.6, },
				Text = Input { Value = "hola, soy isaías", },
				LineOffset = Input { SourceOp = "Path1", Source = "Position", },
			},
		},
		Path1 = PolyPath {
			DrawMode = "InsertAndModify",
			Inputs = {
				Displacement = Input { SourceOp = "Path1Desplazamiento", Source = "Value", },
				PolyLine = Input {
					Value = Polyline {
						Points = {
							{ Linear = true, LockY = true, X = -0.5, Y = -0.7, RX = 0, RY = 0.0666666666666667 },
							{ Linear = true, LockY = true, X = -0.5, Y = -0.5, LX = 0, LY = -0.0666666666666667 }
						}
					},
				},
			},
		},
		Path1Desplazamiento = BezierSpline {
			SplineColor = { Red = 255, Green = 0, Blue = 255 },
			NameSet = true,
			KeyFrames = {
				[0] = { 0, RH = { 0.65, 0.64 }, Flags = { Linear = true, LockedY = true } },
				[20] = { 1, LH = { 4.05, 0.973999999999999 }, Flags = { LockedY = true } }
			}
		},
		Rectangle1 = RectangleMask {
			Inputs = {
				Filter = Input { Value = FuID { "Fast Gaussian" }, },
				SoftEdge = Input { Value = 0.0787, },
				Invert = Input { Value = 1, },
				MaskWidth = Input { Value = 1080, },
				MaskHeight = Input { Value = 1920, },
				PixelAspect = Input { Value = { 1, 1 }, },
				UseFrameFormatSettings = Input { Value = 1, },
				ClippingMode = Input { Value = FuID { "None" }, },
				Center = Input { Value = { 0.494397759103641, 0.116719242902208 }, },
				Width = Input { Value = 1.59803921568627, },
				Height = Input { Value = 0.648264984227129, },
			},
		},
	},
}
```

**Delayed Up slide** (sin el SoftGlow y con la ventana a lo ancho):

```lua
{
	Tools = ordered() {
		Template = TextPlus {
			Inputs = {
				EffectMask = Input { SourceOp = "Rectangle1", Source = "Mask", },
				Width = Input { Value = 1080, },
				Height = Input { Value = 1920, },
				UseFrameFormatSettings = Input { Value = 1, },
				StyledText = Input { SourceOp = "Follower1_1", Source = "StyledText", },
				Font = Input { Value = "Hando", },
				Style = Input { Value = "Bold", },
				Red1 = Input { Value = 0.498, },
				Green1 = Input { Value = 0.69, },
				Blue1 = Input { Value = 0.651, },
				VerticalJustificationNew = Input { Value = 3, },
				HorizontalJustificationNew = Input { Value = 3, },
			},
		},
		Follower1_1 = StyledTextFollower {
			Inputs = {
				Order = Input { Value = 7, },
				Delay = Input { Value = 2, },
				Text = Input { Value = StyledText { Value = "y vivo en tucumán" }, },
				WordOffset = Input { SourceOp = "Path1_1", Source = "Position", },
			},
		},
		Path1_1 = PolyPath {
			DrawMode = "InsertAndModify",
			Inputs = {
				Displacement = Input { SourceOp = "Path1_1Desplazamiento", Source = "Value", },
				PolyLine = Input {
					Value = Polyline {
						Points = {
							{ Linear = true, LockY = true, X = -0.5, Y = -0.666, RX = 0, RY = 0.0553333333333333 },
							{ Linear = true, LockY = true, X = -0.5, Y = -0.5, LX = 0, LY = -0.0553333333333333 }
						}
					},
				},
			},
		},
		Path1_1Desplazamiento = BezierSpline {
			SplineColor = { Red = 255, Green = 0, Blue = 255 },
			NameSet = true,
			KeyFrames = {
				[0] = { 0, RH = { 1.23157894736842, 0.901894736842105 }, Flags = { LockedY = true } },
				[18] = { 1, LH = { 4.37142857142857, 1 }, Flags = { LockedY = true } }
			}
		},
		Rectangle1 = RectangleMask {
			Inputs = {
				Filter = Input { Value = FuID { "Fast Gaussian" }, },
				SoftEdge = Input { Value = 0.0409, },
				MaskWidth = Input { Value = 1080, },
				MaskHeight = Input { Value = 1920, },
				PixelAspect = Input { Value = { 1, 1 }, },
				UseFrameFormatSettings = Input { Value = 1, },
				ClippingMode = Input { Value = FuID { "None" }, },
				Width = Input { Value = 1.2, },
				Height = Input { Value = 0.0959885386819485, },
			},
		},
	},
}
```

### Lo que el MCP no puede

`fusion_comp add_keyframe` crea keyframes con el suavizado por defecto, y
ninguna acción fija los tiradores (`LH`/`RH`) de una curva. Si reconstruís la
animación desde cero por MCP, la curva sale mal aunque los tiempos y los
valores estén bien. Por eso la animación se aplica con las composiciones del
proyecto o con el bloque para pegar.

## Leer una animación nueva

Cuando Isaias pase la próxima variante, los datos exactos están en la base del
proyecto. Copiá `Project.db` a scratch (nunca abras el original) y extraé la
composición:

```python
import sqlite3, zlib

# %APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Resolve Project Library\
#   Resolve Projects\Users\guest\Projects\<proyecto>\Project.db  → copialo antes
con = sqlite3.connect("file:copia/Project.db?mode=ro", uri=True)
for media_id, blob in con.execute("select Sm2MpMedia_id, CompositionBA from Sm2TiCompositionTable"):
    capa = zlib.decompress(blob[4:])  # 4 bytes de largo + zlib
    fin = capa.find(b"}", capa.find(b"Compressed = true")) + 1
    for k in range(fin, fin + 16):  # adentro viene otro zlib con las herramientas
        if capa[k] == 0x78 and capa[k + 1] in (0x01, 0x5E, 0x9C, 0xDA):
            print(media_id, zlib.decompress(capa[k:]).decode("latin-1"))
            break
```

`media_id` es el id que devuelve `folder get_clips`. En el texto buscá el
Follower (Orden, Retraso, qué input tiene conectado), el `PolyPath` (la
trayectoria), el `BezierSpline` (los `KeyFrames` con `LH` y `RH`) y las
máscaras. Si la composición está abierta en la página Fusion, validá también
en vivo:

- con `fusion_comp get_input` en tiempos fraccionarios sobre el `Displacement`
  del Path, contra tu evaluación de la curva;
- con `GetDoD` del Text+, si hay dudas de cómo escalona el Follower.
