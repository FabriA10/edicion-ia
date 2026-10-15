# Arma la pista de la página: saltea las notificaciones, recorta la barra de estado y la
# barra de navegación de Android, y acelera cada tramo según cuánto tiene que mostrar.
# Sale a 30 fps fijos (el crudo es de cuadros variables: eso era lo que trababa el video).
$src = "pierina-glow\trabajo\pierina_cfr30.mp4"
$out = "mi-video\public\pierina_pagina.mp4"

# desde, hasta (segundos del crudo), velocidad
$tramos = @(
  @(7.2, 15.0, 2.0),   # hero + "Comprá por categoría"
  @(15.0, 23.6, 3.0),  # "Lo nuevo" + tarjetas de producto
  @(27.8, 33.0, 3.0),  # guía de talles
  @(33.0, 49.0, 4.0),  # pagos, showroom, envíos, cómo comprar
  @(52.5, 63.4, 3.0)   # tips, preguntas frecuentes, contacto, pie
)

$f = ""; $labels = ""
for ($i = 0; $i -lt $tramos.Count; $i++) {
  $a = $tramos[$i][0]; $b = $tramos[$i][1]; $v = $tramos[$i][2]
  $f += "[0:v]trim=start=$($a):end=$($b),setpts=(PTS-STARTPTS)/$v,crop=576:1160:0:46,fps=30[v$i];"
  $labels += "[v$i]"
}
$f += "$($labels)concat=n=$($tramos.Count):v=1:a=0,tpad=stop_mode=clone:stop_duration=5[out]"

ffmpeg -y -v error -i $src -filter_complex $f -map "[out]" -an -c:v libx264 -crf 15 -preset slow -pix_fmt yuv420p -r 30 $out
ffprobe -v error -show_entries format=duration:stream=nb_frames -of compact $out
