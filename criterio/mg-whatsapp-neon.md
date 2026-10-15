# Motion graphic neón de WhatsApp

Motion graphic para un reel sobre el paciente que escribe por WhatsApp, no le
contestan y se enfría: *"a la persona que no le contestás… se olvida o lo termina
posponiendo"*.

Vive en `proyectos/02-motion-graphic-neon/`, una carpeta hermana
que usa el `node_modules` del proyecto principal por un enlace (lo arma
`instalar/preparar-proyectos.ps1`). No está dentro de `01-base-talking-head` porque ese
proyecto tenía cambios sin guardar de otra sesión
([sesiones-en-paralelo.md](sesiones-en-paralelo.md)).

- **v1** (`src/mg/`, render no incluido en esta carpeta): cuatro
  escenas con salida hacia arriba. Aprobada en estilo; le faltaba el timing.
- **v2** (`src/mg2/Mundo.tsx`, render no incluido en esta carpeta):
  un mundo continuo con cámara (abajo → diagonal abajo-izquierda → abajo) y un hilo
  de neón que une las escenas. Dura 6 s porque Isaias dijo que la frase dura eso en
  el reel. Los tiempos están en `VIAJES` y en los `desde` de cada lugar.

**El ritmo de habla de Isaias**, medido en 43 bloques de los videos 4, 6 y 7:
mediana de **7,3 sílabas por segundo** (p25 6,2, p75 8,0). Sirve para cronometrar
cuando no hay audio. Una frase de 29 sílabas le lleva unos 4 s a ritmo normal.

**Rutas largas:** no renderizar Remotion desde una carpeta temporal con ruta muy
larga (el scratchpad de Claude, por ejemplo). Si la ruta pasa los 260 caracteres,
Chrome headless falla con ENOENT.

Ver [motion-graphics-estilo.md](motion-graphics-estilo.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 23/09/2026*
