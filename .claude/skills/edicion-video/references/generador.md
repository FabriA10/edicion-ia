# El generador de cortes y subtítulos

En vez de escribir a mano la lista de cortes y los subtítulos, conviene un script
que los derive de una tabla de bloques. Así, cuando hay que mover un corte, se
cambia un número y todo lo demás —tiempos de subtítulo incluido— se recalcula solo.

El generador vive fuera del repo (en el scratchpad de la sesión) y escribe
`src/cortes.ts`. Ese archivo generado sí va al repo.

## La tabla de bloques

Cada bloque del guion es una entrada:

```js
{
  motivo: "hook: no des listas, contá una historia",  // para acordarse de por qué
  ventana: [49.3, 55.0],    // dónde están las palabras en la transcripción de Whisper
  onset: 49.776,            // dónde arranca el habla de verdad (medido)
  fin: 54.79,               // dónde termina el habla de verdad (medido)
  corte: [49.77, 54.83],    // lo que se recorta del video
  continua: true,           // opcional: este bloque sigue la oración del anterior
  comparacion: true,        // opcional: acá van las fotos y se apagan los subtítulos
}
```

La separación entre `ventana` y `onset`/`fin` es la clave: `ventana` sirve para
sacar **el texto** de la transcripción, `onset`/`fin` para ubicarlo **en el tiempo
real**. Como Whisper deriva, los dos no coinciden y hay que mapear:

```js
const real = (t) => onset + ((t - primeraPalabra) * (fin - onset)) / (ultimaPalabra - primeraPalabra);
const enEdicion = (t) => real(t) - corte[0] + offsetAcumulado;
```

Ese mapa por bloque es lo que mantiene los subtítulos pegados al audio.

## Mejor: transcribir bloque por bloque

En un crudo largo con muchas pasadas de la misma frase, la transcripción sobre el
archivo entero **no sirve como fuente de texto**. Whisper funde palabras y arrastra
los tiempos justo en las zonas repetitivas, que son casi todo el crudo: en el video
4 se comió "de inteligencia artificial" del gancho y le puso 8 segundos de duración
a la palabra "radiografía".

La pasada larga sigue siendo necesaria —es con lo que leés el crudo como guion y
elegís las tomas—, pero una vez elegidos los bloques conviene **volver a
transcribir el recorte exacto de cada uno**. Sobre 4 segundos de audio los tiempos
salen bien y el texto ya es el del bloque. Tarda unos segundos por bloque.

Con eso el mapa `ventana` → `onset`/`fin` casi desaparece: los tiempos ya son
absolutos y correctos.

### Los arreglos van por rango, no por palabra

Whisper escucha mal nombres propios y voseo, y a veces con distinta cantidad de
palabras: "un infono" son dos tokens y "una radiografía" también, pero "anéreo,
cadiente y caviaria" son cuatro tokens de lo que en realidad es "el nervio, cada
diente y la vía aérea", que son ocho. Un mapa palabra→palabra no puede arreglar
eso.

Lo que funciona es una tabla por bloque de `[desde, hasta, "texto nuevo"]` que
reemplaza un rango de índices y **reparte el tiempo del rango entre las palabras
nuevas**. Los índices se sacan volcando las palabras numeradas de cada bloque.

Ojo con un caso que parece un error y no lo es: cuando un bloque arranca por un
empalme, Whisper le pega adelante la palabra que espera por contexto. En el video 4
el bloque que entra en "bueno" se transcribió como "Muy bueno", porque el "muy"
venía del bloque anterior. El arreglo `[0, 2, "bueno"]` lo saca.

## Para qué sirve cada bandera

**`continua`** evita que se capitalice a mitad de frase cuando una oración quedó
partida en dos bloques por un empalme. (Hoy todos los subtítulos van en minúscula,
así que no cambia el texto, pero la bandera sigue marcando la estructura y sirve si
algún día vuelve la capitalización.)

**`comparacion`** marca el bloque donde entran las fotos. De ahí salen dos cosas:
los momentos en que entra cada foto (atados a cada "esta sonrisa" del texto) y el
tramo donde hay que apagar los subtítulos.

## Lo que exporta

```ts
export const CORTES: Corte[]            // tramos del crudo que se mantienen
export const CUES: Cue[]                // subtítulos ya en tiempo de edición
export const COMPARACION: Comparacion   // cuándo entra cada foto
export const SIN_SUBTITULOS: Tramo      // dónde apagar los subtítulos
```

## Frames: el detalle que causa pantallazos

La duración de cada tramo y el recorte del video **tienen que salir del mismo
redondeo**. Si calculás la duración como `round((hasta-desde)*fps)` y el recorte
como `round(hasta*fps) - round(desde*fps)`, a veces difieren en un cuadro, el video
se queda sin material y se ve un pantallazo del color de fondo.

```tsx
const enFrames = (corte, fps) => {
  const desde = Math.round(corte.desde * fps);
  const hasta = Math.round(corte.hasta * fps);
  return { desde, hasta, duracion: hasta - desde };
};
```

### Si el corte previo lo hace un script de Python, el redondeo tiene que ser el mismo

`round()` de Python redondea **al par** (`round(0.5)` da 0) y `Math.round` de
JavaScript redondea **hacia arriba**. Cuando el pre-corte lo hace `cortar.py` y
la duración de la composición sale de `duracionTotal` en TypeScript, los dos
tienen que caer en el mismo cuadro.

En el video 7 no coincidían en cuatro bloques de treinta y cuatro, y **el total
daba igual igual** —2190 cuadros los dos—, así que no había ningún síntoma que
mirar. Pero en dos de esos cuatro el Python cerraba el bloque un cuadro antes, y
eran colas que tenían 20 ms de margen: 17 ms menos es media consonante.

```python
def cuadro(t):
    return math.floor(t * FPS + 0.5)   # el Math.round de JavaScript
```

### Si el MOV no es 30 fps exacto, los cuadros se eligen por pts, no por número

El crudo del 29/09 (dos MOV de iPhone) **no era CFR**: entre los cuadros de 20
ticks (1/600 s) había de 19 y de 21, y en los 18 minutos de la parte 2 el cuadro
n terminaba 65 ticks —108 ms, tres cuadros— antes de n/30. Elegir por número
(`select=between(n,…)` con n = t·30, como hacía `cortar4c.py`) dejaba el final
del crudo con la imagen atrasada contra la voz.

Cómo darse cuenta antes de cortar: `ffprobe -show_entries packet=pts` sobre el
MOV (no decodifica, tarda segundos) y comparar el pts de cada cuadro con n·20.
Si el `avg_frame_rate` no es `30/1` exacto, pasa.

Cómo se corta entonces: para cada bloque, el primer cuadro es el de **pts más
cercano** al borde de audio, y de ahí K cuadros seguidos (adentro de un bloque la
deriva no pasa de 15 ms). Cada bloque se codifica aparte con `-ss` al pts de ese
cuadro menos 5 ticks —cae entre ese cuadro y el anterior, así ffmpeg arranca
justo en él— y `-frames:v K`, y los segmentos se pegan con el demuxer concat.
Verificado con identidad de cuadro: el cuadro k del pre-corte correlaciona
0,9999 con el elegido y 0,99 con los vecinos. De paso sale directo del MOV 4K
en vez de pasar por una conversión intermedia a CRF 21.

Y el audio del MOV arranca después del primer cuadro (`start_time` 0,0017 y
0,015 s en esos dos): el wav de análisis lleva ese relleno adelante
(`adelay=720S:all=1`) para que su tiempo sea el del MOV.

Y en el `OffthreadVideo`, un cuadro de margen en `trimAfter` para que nunca se
quede corto:

```tsx
<OffthreadVideo src={staticFile(fuente)} trimBefore={desde} trimAfter={hasta + 1} />
```

La `Sequence` recorta igual a `duracion`, así que el cuadro extra nunca se ve.

## Orden de armado en la composición

```tsx
<AbsoluteFill style={{ backgroundColor: MARCA.fondo }}>
  <DefinicionDeColor />
  <AbsoluteFill style={{ filter: `url(#${GRADE_ID})` }}>
    {/* tramos de video: el grade va sólo acá */}
  </AbsoluteFill>
  <Sonrisas ... />     {/* fotos: sin grade, vienen de otra cámara */}
  <Subtitulos ... />   {/* siempre arriba de todo */}
</AbsoluteFill>
```
