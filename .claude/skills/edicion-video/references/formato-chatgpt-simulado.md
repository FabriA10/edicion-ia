# Formato "ChatGPT simulado" (video 5, aprobado)

Isaias lo trajo de un reel de referencia (una mujer con la caja de ChatGPT
encima del plano, el texto que se va escribiendo, y "comentá PROMPT y te lo
envío por privado"). No pudo grabar la pantalla con OBS, así que **la escritura
se simula** en Remotion. Quedó aprobado entero el 26/09/2026: *"te quedó todo
excelente… las animaciones, los sonidos"*. Código: `07-chatgpt-simulado/src/v5/`.

## La estructura

| parte | material | gráfica |
|---|---|---|
| A · gancho | él señalando arriba, **sin hablar**; la voz en off viene grabada aparte | dos recuadros con borde de neón que suben (slide up): el antes y el resultado, cada uno cuando lo nombra; el logo de ChatGPT entre los dos cuando dice "ChatGPT" |
| B · el prompt | él frente a la compu leyendo el prompt en voz alta | la caja de ChatGPT entra de costado y el prompt se escribe **palabra por palabra cuando la dice**; al final se manda y ChatGPT "devuelve" el resultado |
| C · CTA | él a cámara | la conversación se va y entra "comentá PALABRA" animado con sonido |

El encuadre lo deja a propósito con aire arriba de la cabeza: toda la gráfica
vive ahí (medí el tope del pelo; en esta toma, y=938).

## Lo que hace que se crea

- **Copiar la interfaz de verdad**: caja #2F2F2F con radio 36, la foto adjunta
  arriba con su "×", el texto, y abajo "+", "Herramientas", el micrófono y el
  botón blanco con la flecha (gris mientras está vacía, con "Preguntá lo que
  quieras"). Se arma a partir del reel de referencia; la captura no hizo falta.
- **La caja se ancla ABAJO**, justo arriba del pelo, y crece hacia arriba
  mientras se escribe, como la real. Anclada arriba quedaba chica y lejos de él.
- **El texto que ya no entra corre para arriba**: un contenedor con
  `flexDirection: column-reverse`, `maxHeight` de 7 renglones y `overflow:
  hidden` deja siempre visible el final, sin medir nada.
- **Cada palabra aparece cuando la dice**, letra por letra en lo que tarda en
  llegar la siguiente (0,4 s como mucho), con el cursor titilando.
- **Al mandar**: el botón late, la caja se transforma en la conversación (el
  mensaje con la foto a la derecha, "Creando imagen…" con un brillo que pasa) y
  el resultado se revela **de arriba hacia abajo** con desenfoque que se limpia,
  como cuando ChatGPT genera una imagen. Las dos fotos quedan a la vista.

## El texto del prompt

- Es **lo que él lee**, palabra por palabra. Si manda el guion escrito, manda el
  guion; si no, se transcribe con large-v3 y se escribe eso.
- Una palabra escrita por cada palabra dicha: así el sincronismo es exacto.
  Sólo se corrige gramática obvia ("lo que faltan" → "los que faltan") y la
  puntuación de un texto escrito donde él hace pausa.
- **Voseo o no**: se escucha la palabra aislada con large-v3 tres veces — sin
  prompt, con un prompt que empuja al voseo y con uno que empuja al neutro. Si
  la palabra no cambia, es lo que dijo; si cambia, el audio es ambiguo y va la
  lectura sin empujón.

## Los tiempos

Una sola toma leída de corrido: **mapa lineal de la parte entera** (Whisper
contra el arranque y el final medidos) y cada palabra enganchada al ataque más
cercano si hay uno claro a menos de 120 ms. El anclaje por pausas del 4c acá
falló: asociaba todas las palabras al primer tramo.

## Los sonidos (sintetizados, `scratchpad/v5/sfx5.py`)

| sonido | cómo | cuándo |
|---|---|---|
| teclas | ruido de 3 ms con una resonancia de 1,8-3,2 kHz y un golpecito grave, a −29/−33 dBFS | una por letra, con el mismo reparto que la animación |
| whoosh | pasabanda que sube de 450 Hz a 4,2 kHz | cada recuadro que sube, la caja que entra y sale, el CTA |
| pop | seno de 900 Hz que cae a la mitad | el logo de ChatGPT, el CTA |
| enviar | ruido de 2,5-9 kHz, 160 ms | al mandar |
| campanita | 1318 + 1975 + 2637 Hz con caída | cuando termina de revelarse el resultado |

Las teclas van bajas: él está leyendo encima.

## Material que llega por Drive

Los videos de más de 30 MB no pasan por el chat del celular. Los sube a una
carpeta de Drive compartida con el link; la carpeta se lista con el conector
(`search_files` con `parentId = '<id>'`) y cada archivo se baja con:

    curl -L -o archivo "https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t"

Y al revés: si la entrega pesa menos de 30 MB (un video de ~35 s a 1080p), va
entera por el chat, sin copia liviana.
