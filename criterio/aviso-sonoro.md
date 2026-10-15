# Aviso sonoro al terminar un video

Cuando termina de editarse un video (render nuevo o corrección de uno existente),
reproducir un sonido audible en el sistema, además de escribir el mensaje. En
Windows, desde PowerShell:

```powershell
(New-Object Media.SoundPlayer "C:\Windows\Media\Alarm03.wav").PlaySync()
```

Isaias dio permiso explícito para reproducir sonido fuera de la ventana de Claude.

**Por qué:** los renders tardan y mientras tanto se hace otra cosa, con la pestaña
de Claude cerrada o en segundo plano; sin sonido el video queda listo y nadie se
entera hasta que vuelve a mirar.

**Cómo aplicarlo:** al final de cualquier vuelta que produzca un MP4 terminado,
sonar el aviso *después* de que el render pasó las verificaciones, no cuando
arranca. Vale para la primera versión y para cada corrección posterior. Ver
[trabajar-sin-preguntar.md](trabajar-sin-preguntar.md).

---
*De la memoria de Claude en la PC de Isaias · última versión: 17/09/2026*
