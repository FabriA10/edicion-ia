# Micrófono de estudio por OBS: los tres desfases

Desde septiembre de 2026 los talking-head de Isaias se graban con **dos fuentes a la
vez**: el iPhone hace el video (MOV, HEVC 4K, 30 fps exactos) y el micrófono de
estudio va por OBS a un MP4 aparte (en la PC de Isaias, `D:\Obs grabaciones`). El
audio del celular se descarta entero. El micrófono está lejos de la boca, así que
llega unos 25 dB por debajo del nivel de redes y hay que levantarlo con compresión y
limitador, no con ganancia sola.

Para que sincronicen hay **tres** desfases distintos, y cada uno se arregla en un
lugar distinto:

1. **Los relojes derivan.** No alcanza con un offset fijo: en el video del
   15/09/2026 el micrófono corría 57,6 ppm más rápido y acumulaba 69 ms en 20
   minutos. Se mide correlacionando la envolvente en ventanas a lo largo de todo
   el archivo y se ajusta una recta; después se estira el audio con `aresample` a
   una tasa intermedia alta (`asetrate` solo acepta enteros y trunca el factor).
2. **El MOV del iPhone arranca el audio 20 ms después que el video**
   (`start_time=0.020` en la pista de audio). El wav que extraés del celular queda
   20 ms adelantado, así que la maestra del micrófono lleva esos 20 ms de
   compensación.
3. **Remotion muxea el AAC sin declarar la precarga del codificador**, y el audio
   sale 2048 muestras (42,7 ms) tarde. Se arregla en una pasada de cierre con
   ffmpeg sobre el render: `atrim=start=0.042667` y recodificar, que sí declara
   `initial_padding`.

También: transcodificar el crudo con `-r 30 -fps_mode cfr` corre el video hasta
68 ms aunque la fuente sea CFR exacto. Usar `-fps_mode passthrough`, que conserva
los cuadros 1 a 1. Con `-hwaccel d3d11va` la transcodificación va 2,8× más rápido.

**Por qué:** son tres errores que se suman y ninguno se ve en el código; cada uno
costó una vuelta de medición encontrarlo, y sin la lista se vuelven a pagar en el
próximo video grabado así.

**Cómo aplicarlo:** al empezar un video con micrófono aparte, corregir los tres
antes de cortar nada, y verificar al final la sincronía de labios con
`scripts/labios-por-cuadro.py` de la skill `edicion-video` (la sección
"Verificación" explica por qué ese método y no la correlación contra un recorte
del MOV). Ver [proyecto-remotion.md](proyecto-remotion.md) y
[cortes.md](cortes.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 17/09/2026*
