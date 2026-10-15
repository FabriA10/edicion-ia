# Varias sesiones de Claude sobre el mismo proyecto

Isaias suele abrir varios chats en paralelo sobre el mismo proyecto (por ejemplo,
`01-base-talking-head`), y ya pasó que una sesión pisara el trabajo de otra. Lo pidió
explícito: *"tener mucho cuidado con colapsar la edición del video... antes de que
te pongas a la obra, fíjate en eso"*.

**Cómo aplicarlo:** antes de tocar un proyecto compartido, revisar si hay otra
sesión sobre el mismo proyecto (`ListAgents`) y si esa carpeta tiene cambios sin
guardar (`git status`, si es un repo). Si los hay (lo típico: la otra sesión está
quieta pero dejó archivos modificados o nuevos sin commitear, y no hay una rama que
aísle nada), NO editar ahí directamente. Ni siquiera un git worktree alcanza,
porque un worktree no trae el trabajo sin commitear de la otra sesión.

La solución que funcionó: copiar el proyecto (`src/`, `reference/`, la
configuración; sin `node_modules`, `out/` ni los `trabajo/` de otros videos, que
pesan GB) a una carpeta hermana, enlazar `node_modules` con una junction de Windows
y trabajar ahí. Así nacieron `03-reel-iconos-tres-ejes`, `04-dos-camaras` y
`02-motion-graphic-neon` ([reel1-iconos.md](reel1-iconos.md)).

**Antes de juntar ese trabajo de vuelta** con el proyecto original hay que confirmar
que la otra sesión ya no tiene cambios pendientes en los mismos archivos. Si los
tiene, avisar en vez de juntar solo.

---
*De la memoria de Claude en la PC de Isaias · última versión: 22/09/2026*
