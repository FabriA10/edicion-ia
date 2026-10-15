# 📚 Guía y Mapa de Conocimientos de Edición

Esta carpeta contiene todo el conocimiento, criterios y reglas de edición probados en producción (basados en las correcciones de renders de Isaias y Juanpi).

---

## 🧭 Estructura de Conocimientos

### 1. Criterios de Edición (`criterio/`)
Contiene **33 documentos** de reglas estrictas de edición:
* **`cortes.md`**: Cortes sin aire entre tomas, ritmo dinámico ("generación Z").
* **`subtitulos.md`**: Tipografía Hando Bold, máximo 4 palabras por línea, minúsculas, a la altura del pecho.
* **`sincronia-subtitulos.md`**: Sincronización milimétrica con el ataque acústico de la voz.
* **`audio.md`**: Entrega obligatoria a `-14.5 LUFS`, pico máximo a `-1.0 dBTP`, ecualización de micrófono chico DJI.
* **`paquete-efectos-cada-3s.md`**: Regla de oro de retención: cada ~2 a 3 segundos debe ocurrir un evento visual o sonoro (punch-in zoom, animación, ícono, sonido de impacto, etc.).
* **`encuadre-y-zona-roja.md`**: Márgenes de seguridad de 120 px para evitar que los botones de Instagram/TikTok tapen elementos clave.
* **`musica-drop.md`**: Sincronización del drop musical en el momento exacto del giro o clímax del video.
* **`gancho-con-susto.md`**: Hooks agresivos e inesperados en los primeros 2 segundos.
* **`formato-chatgpt-simulado.md`**: Efecto máquina de escribir sincronizado a la voz.
* **`juanpi-compumaq.md`** y **`juanpi-referencias.md`**: Estilos de creadores de referencia (Devin Jatho, Lewis Dang, Ru Medias).

---

### 2. Guías Técnicas (`docs/guides/`)
* **`subtitulos-animados-curvas.md`**: Matemáticas y curvas de animación para subtítulos (`Smooth Line Up`, rebotes y slides).

---

### 3. Referencias Visuales (`referencias/`)
* Ejemplos en video (.mp4) y capturas fotograma a fotograma desglosando los estilos de:
  * **Devin Jatho** (tarjetas, chips, zooms, métricas).
  * **Lewis Dang** (diseño sonoro puro, chips interactivos).
  * **Ru Medias** (comparaciones crudo vs output, transiciones rápidas).

---

### 4. Biblioteca de Sonidos (`sonidos/`) y Música (`musica/`)
* **172 efectos de sonido clasificados:**
  * `Deep whoosh`
  * `Hook sound effects`
  * `Ui clicks`
  * Risers, pops, impactos y transiciones.
* **9 pistas musicales** preparadas para ducking y corte por voz.

---

### 5. Integración con Antigravity IDE
Todas estas reglas y criterios han sido instalados en:
* `C:\Users\fabri\.gemini\config\rules\`
* `C:\Users\fabri\.gemini\config\skills\`

Cualquier video que edites con este asistente aplicará estas reglas automáticamente sin que tengas que recordarlas.
