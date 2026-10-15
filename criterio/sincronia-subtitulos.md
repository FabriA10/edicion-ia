# Sincronía de subtítulos

Cómo hacer que cada subtítulo entre justo cuando arranca la palabra, sin confiar en
Whisper. Medido en el video 1 de la clienta (23/09/2026) contra marcas acústicas leídas
a mano en la envolvente (la /k/ de "cómo", la /t/ de "tocá", la /d/ de "de más"):

- **El mapa lineal por bloque de la skill no alcanza para subtítulos.** Sobre
  bloques de 6 s Whisper comprime los tiempos hacia el final ("información"
  terminaba 0,44 s antes que la voz) y los subtítulos del final de cada bloque
  entraban hasta 200 ms tarde.
- **Whisper sobre el render entero no sirve de juez**: pone las palabras hasta
  190 ms ANTES de su ataque real. Un chequeo que compara contra él da falsos
  "entra tarde". Hay que juzgar contra el audio (pausas, eses, explosivas).
- **Lo que funcionó:** partir cada bloque en **frases por sus pausas reales**,
  transcribir cada frase aislada y anclarla a su arranque y su final medidos
  (±75 ms). Después, **enganchar cada subtítulo al ataque acústico** de su primera
  palabra cuando es medible: fin de pausa, subida de la ese en agudos, explosión de
  una sorda (t k p qu). Y un cuadro de adelanto.
- **Las sonoras (d b g) no se enganchan solas**: entre vocales la /d/ casi no
  cierra y el detector salta a la consonante siguiente ("de SAN", +180 ms). Esas se
  miden a mano. Un alineador por conteo de sílabas dio el mismo ±75 ms que Whisper
  por frase: no vale el esfuerzo.

**Por qué:** Isaias revisa con lupa; un subtítulo 200 ms tarde se nota, y el
control que había (Whisper del render) no lo agarraba: decía lo contrario.

**Cómo aplicarlo:** los scripts están en
`proyectos/04-dos-camaras/trabajo/doscam01/scripts/`
(`palabras_tia2.py`, `cues_tia.mjs`, `ajustar_cues.py`, `check_subs.py`), con el
orden en que se corren en su `LEEME.txt`. Tienen rutas absolutas de la PC de Isaias
adentro: corregilas antes de usarlos. Ver [clienta-dos-camaras.md](clienta-dos-camaras.md)
y [verificar-no-explicar.md](verificar-no-explicar.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 23/09/2026*
