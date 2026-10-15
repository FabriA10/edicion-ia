# Logos de marcas: bajarlos de la página oficial

Cuando un video nombra marcas o software, Isaias manda los logos **como imágenes
adjuntas en el chat**. Esas imágenes no quedan en ningún archivo al que se pueda
llegar desde la sesión: ni en el temp del sistema ni en la carpeta del proyecto.

Isaias dio permiso explícito para resolverlo bajándolos: *"te doy permiso para que
entres a través de Google y busques páginas web, foros, para que pongan los
iconos"* (18/09/2026, video 4).

Lo que funciona es pedir el HTML de la página oficial de la marca y sacar la URL
del asset, en vez de buscar en Google:

```bash
curl -sL -A "<user agent de Chrome>" https://marca.com/ \
  | grep -oiE '(src|href|content)="[^"]*(logo|icon|brand)[^"]*\.(svg|png|webp)[^"]*"'
```

Los `.ico` no sirven (16-32 px). Sí sirven `/icon.svg`, los assets de
`_next/static/media/`, los CDN de Webflow y el `favicon.png` de 512.

**Por qué:** sin esto el video se frena esperando archivos que se creen mandados,
y nadie está mirando la pestaña para aclararlo.

**Cómo aplicarlo:** bajar los logos apenas se sabe qué marcas aparecen, guardarlos
en `public/logos/` del proyecto de Remotion y seguir. El formato donde se usan está
en `references/ranking.md` de la skill `edicion-video`
(el render de ejemplo (no viene en esta carpeta; se lo pedís a Isaias)). Ver
[proyecto-remotion.md](proyecto-remotion.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 18/09/2026*
