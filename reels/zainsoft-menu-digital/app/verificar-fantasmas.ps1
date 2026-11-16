# Extrae las franjas del cierre (píldoras PRÓXIMO y @zainsoft_) de TODOS los cuadros de un tramo y arma hojas para revisarlas a ojo.
param([string]$Video = '../out/final.mp4', [double]$Desde = 32.0, [double]$Hasta = 36.4)
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
Set-Location $PSScriptRoot
$dur = $Hasta - $Desde
ffmpeg -y -loglevel error -ss $Desde -t $dur -i $Video -vf "fps=30,crop=860:420:110:700,scale=216:-1,tile=9x8:padding=2:color=0x888888" -frames:v 1 trabajo/qa/fantasmas_todos.png
"Hoja: trabajo/qa/fantasmas_todos.png (todos los cuadros de $Desde a $Hasta s)"
