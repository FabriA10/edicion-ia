# Si un dato contradice la decisión, verificalo; no lo expliques

El patrón que hay que cortar: elegir una opción, encontrarse después con un dato que
no encaja, y construir una explicación de por qué el dato está mal en lugar de ir a
revisar la decisión.

Caso concreto (18/09/2026, video 4). Whisper transcribió un bloque ya elegido como
*"le cargás un infono"*. La conclusión fue "el modelo escuchó mal 'radiografía'" y
se entregó así. La transcripción era correcta: Isaias decía "un informe", se
frenaba y arrancaba de nuevo. Lo mismo con un "de" al final de otra frase, marcado
por tres modelos distintos y descartado las tres veces: también estaba.

Las dos veces el dato estaba bien y la decisión estaba mal, y las dos volvieron
como corrección. Costó cinco correcciones en ese video.

**Por qué:** cuando ya hay una elección hecha, cualquier evidencia en contra entra
como ruido a descartar. Eso convierte una verificación en un trámite y deja pasar
justo los defectos que la verificación existía para encontrar.

**Cómo aplicarlo:** si una medición, una transcripción o un número contradicen la
toma elegida, **verificar antes de seguir**: aislar el fragmento, medirlo por
separado, escuchar la evidencia sola. Si después de eso el dato sigue sin encajar,
ahí sí es ruido. Y armar verificaciones que puedan fallar de verdad: la que había
solo miraba si faltaba texto, y ninguno de esos defectos cambia el texto. Para eso
está `scripts/revisar-bloques.mjs` de la skill `edicion-video`. Ver
[proyecto-remotion.md](proyecto-remotion.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 18/09/2026*
