# Detecta artefactos de render (cuadros que cambian según cómo se reparta el trabajo): renderiza dos veces y compara cuadro a cuadro.
param([string]$Comp = 'SistemaReel01', [string]$Scale = '0.5')
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
Set-Location $PSScriptRoot
npx remotion render src/index.ts $Comp trabajo/cmp_a.mp4 --scale=$Scale --gl=swangle --concurrency=1 | Out-Null
npx remotion render src/index.ts $Comp trabajo/cmp_b.mp4 --scale=$Scale --gl=swangle --concurrency=2 | Out-Null
ffmpeg -y -loglevel error -i trabajo/cmp_a.mp4 -i trabajo/cmp_b.mp4 -lavfi "psnr=stats_file=trabajo/cmp_psnr.log" -f null -
$malos = Get-Content trabajo/cmp_psnr.log | ForEach-Object {
  if ($_ -match 'n:(\d+).*psnr_avg:(\S+)') { $v = if ($Matches[2] -eq 'inf') { 99 } else { [double]$Matches[2] }; if ($v -lt 45) { '{0} (t={1:N2}s) psnr={2:N1}' -f $Matches[1], (([int]$Matches[1]) / 30), $v } }
}
if ($malos) { "CUADROS DISTINTOS:"; $malos } else { "Sin diferencias entre renders: no hay artefactos de repintado." }
