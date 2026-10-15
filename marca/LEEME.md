# La marca de cada video

**Esta carpeta no trae la marca de ningún cliente.** Los proyectos se armaron para una
agencia de odontología que usaba petróleo, verde y blanco; eso se sacó. Lo que viene
es una paleta neutra (azul marino, un acento apagado y un acento claro, más un
blanco y un casi-negro) para que se vea el estilo sin pisar a nadie.

Para cada video nuevo hay que poner **la paleta de la marca del video**. Hay dos
niveles, según cuánta precisión haga falta.

## 1. Rápido: girar el matiz de toda la paleta

```bash
node marca/recolorear.mjs 10      # rojo
node marca/recolorear.mjs 30      # naranja
node marca/recolorear.mjs 120     # verde
node marca/recolorear.mjs 170     # verde azulado
node marca/recolorear.mjs 280     # violeta
node marca/recolorear.mjs 220     # vuelve a la paleta de base (azul)
```

Cambia, en **todos** los proyectos a la vez, los fondos oscuros, los acentos y el neón
derivados, conservando sus luminosidades. **No** toca los semáforos (verde/amarillo/rojo
de las tres columnas), el verde de WhatsApp, el azul de Instagram, los colores de los
personajes ni el blanco, el claro y el casi-negro. Se puede correr las veces que haga
falta: `marca/estado.json` recuerda en qué matiz quedó.

Pasarle `<carpeta>` como segundo argumento recolorea solo esa carpeta (por ejemplo,
`node marca/recolorear.mjs 10 proyectos/02-motion-graphic-neon`; ojo: `estado.json` es
global, así que usalo con una carpeta nueva o con un solo proyecto a la vez).

Sirve cuando la marca se resume en "es roja" o "es verde". Para la marca exacta,
seguí con el paso 2.

## 2. Exacto: los colores de la marca

Cada proyecto define su paleta en dos lugares:

| Archivo | Qué define |
|---|---|
| `src/base/marca.ts` (en `02-motion-graphic-neon` es `src/marca.ts`) | `MARCA = { fondo, acento, acentoClaro, claro, oscuro }`, y las tipografías `FUENTE` y `FUENTE_SUBTITULO` |
| `src/mg/base.ts`, `src/v4g/base.ts`, `src/v2/base.ts`, `src/v3/base.ts`, `src/v3/mg/base.ts`, `src/v4/base.ts` (motion neón) y `src/anim/base.ts` (animación 2D) | `C = { fondo, acento, acentoClaro, claro, oscuro, fondoBorde, neonNucleo, neonTubo, neonBrillo, apagado, … }` |

Qué es cada color:

- **`fondo`**: el color de marca más oscuro. Fondo de los motion graphics y del texto
  que va sobre superficies claras.
- **`acento`**: el color de marca de saturación media. Íconos, halos de neón, bordes.
  **Nunca como texto sobre fondo oscuro** (no llega a contraste).
- **`acentoClaro`**: el acento que se lee sobre oscuro. **Es el color por defecto de
  los subtítulos animados** (toda la letra, nunca un borde).
- **`claro`**: el blanco de la marca. El color de los subtítulos estáticos.
- **`oscuro`**: el casi-negro de textos y sombras.
- Los `neon*` y `fondoBorde` son derivados: el **núcleo del tubo** es un tono más claro
  que el brillo, para que se lea nítido; el halo, `acentoClaro` y `acento`.

Hay colores derivados escritos como hex directos en los componentes (sombras, degradés,
velos). Después de cambiar `MARCA` y `C`, corré `recolorear.mjs` con el matiz de la
marca para que esos acompañen, y mirá cuadros de prueba.

**Subtítulos sobre fondo claro** (la persona está contra una pared clara): el animado en
`acentoClaro` no se lee; va en `fondo`. La skill `subtitulos-animados` ya lo prevé.

## 3. Logos y tipografías de la marca

- **Logos**: los da quien contrata (el chat, Drive). Si hay que bajarlos de la web
  oficial, ver `criterio/logos-de-marcas.md`. **Fondo transparente**, sin su cuadro de
  color.
- **Tipografías**: Hando Bold para los subtítulos de todos los videos (es el estilo del
  editor, no de una marca) y Archivo para las palabras grandes de los motion graphics
  (`tipografias/`). Si la marca tiene su tipografía, se usa para el rótulo de marca,
  **no** para los subtítulos.
