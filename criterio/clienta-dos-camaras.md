# Formato de dos cámaras (videos de una clienta)

Desde el 23/09/2026 hay videos para una clienta (una doctora, odontóloga). El formato —útil para cualquier
entrevista o explicación con dos cámaras— es distinto al de los videos de Isaias:

- **Dos cámaras grabando a la vez.** Cámara 1 = de frente, iPhone, con el
  micrófono DJI de la doctora entrando ahí (mono). Cámara 2 = en diagonal, archivo
  `A001_...` de la app Blackmagic Camera, con el micrófono del celular (15 dB más
  bajo, sala). Arrancan casi juntas (video 1: la 2 va 15 ms detrás y deriva 7 ms en
  7 minutos). **La voz sale SIEMPRE de la cámara 1.**
- **Proporción pedida: 60 % frontal, 40 % diagonal**, alternando. Funciona cambiar
  de cámara en cada frase: tapa los saltos entre tomas.
- **Nico e Isaias hablan de fondo** (se oyen en eco) y eso no va. Se
  detectan comparando los dos micrófonos: con la doctora el DJI está ~10 dB por
  encima de la sala; con ellos la diferencia se da vuelta. Ojo con el cierre de
  una /k/: el eco de sala da un falso aviso.
- **Sus aprobaciones marcan la toma buena**: "continúen", "perfecto", "ahí va
  bien", "excelente" después de una pasada. Es el equivalente de las marcas
  habladas de Isaias ([cortes.md](cortes.md)).
- Durante la grabación cambian la redacción del guion (ej. "sinceramente" en vez
  de "con honestidad", el CTA de "agendar una consulta"): va la última formulación
  aprobada, y se avisa.
- **Cortes: más apretados que el 0,25 s de la skill.** La v1 del video 1 salía
  0,25 s después de que caía la frase; Isaias dijo *"excelente todo, ahora mejorá
  los cortes, excepto el CTA"*. La v2 sale a 60 ms de la cola (70-130 ms de
  silencio real por unión) y separa dos oraciones seguidas de la misma toma. Las
  pausas de coma adentro de una frase se dejaron.
- **Subtítulos de la clienta: Helvetica Bold** (pedida por Isaias para estos videos;
  el archivo no viene en la carpeta: es una fuente comercial), estáticos,
  con la sombra aprobada, **centrados a la mitad del cuadro**: en este plano de pie
  la mitad es el pecho, a la altura del micrófono. Isaias mandó un screenshot de la
  altura que no llegó al disco (pasa con las imágenes pegadas en el chat); se usó
  "en el medio", que fue lo que dijo.
- **Zooms**: pidió *"jugá con zoom in y zoom out, zoom in súper lento y progresivo
  en algunas tomas, no sólo el zoom out"*. Quedó: lento 1→1,10/1,12 a velocidad
  constante toda la toma (4), entra 1→1,10 con la curva (2), sale 1,3/1,25/1,2→1
  con la curva (3), y tomas quietas entre medio. El plano del CTA, sin zoom. La
  música la iba a mandar después.
- **Cuando pide una corrección con excepción, lo exceptuado queda idéntico**:
  mismos cuadros, mismas muestras y la misma ganancia de cierre que la versión
  anterior (*"no agregues nada al final ni corrijas esa parte por las dudas"*).

**Estado al 24/09:** la última versión renderizada es la v5 (subtítulos Helvetica
+ zooms). No consta si ya está aprobada.

**Por qué:** el primer video costó descubrir todo esto midiendo; el próximo
arranca de acá.

**Cómo aplicarlo:** el trabajo está en `proyectos/04-dos-camaras/`
(copia aparte del principal, sin juntar todavía; composición `DosCam01`). Los scripts
y el orden en que se corren están en `trabajo/doscam01/scripts/LEEME.txt` (tienen
rutas absolutas de la PC de Isaias adentro). La primera entrega va sin subtítulos
ni efectos; lo demás, cuando lo pidan. Ver
[sincronia-subtitulos.md](sincronia-subtitulos.md) y
[proyecto-remotion.md](proyecto-remotion.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 23/09/2026*
