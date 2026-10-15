# Tipografías

- **HandoTrial-Bold.otf**: los subtítulos de todos los videos de Isaias (Hando Bold,
  una línea, minúscula). Es el estilo del editor, no de una marca.
- **Archivo-var.ttf** (Archivo variable, licencia OFL): las palabras grandes de los
  motion graphics (pesada y angosta: `wght 820, wdth 76`).

Los proyectos las cargan solos desde `public/` (con `FontFace`), así que **el render sale
bien aunque no estén instaladas en Windows**. Instalarlas sirve para ver bien las vistas
previas: `instalar\instalar.ps1 -Tipografias` las instala para tu usuario, o clic derecho →
Instalar.

El formato de dos cámaras (`proyectos/04-dos-camaras`) usaba **Helvetica Bold**. **No viene
en esta carpeta** (es una fuente comercial): ponela vos en `proyectos/04-dos-camaras/public/`
como `Helvetica-Bold.ttf` si tenés licencia, o cambiá la tipografía del componente
`src/doscam/SubtitulosDosCam.tsx` por otra (Arial Bold sirve de reemplazo).

## Licencias

**Hando está en versión *Trial***: antes de usarla en anuncios pagos de otro cliente, revisá que
la licencia lo cubra (y no la redistribuyas por fuera del equipo). Archivo es libre (OFL).
Playfair Display (usada en el libro de `10-gancho-susto-tarjetas`) también es OFL.
