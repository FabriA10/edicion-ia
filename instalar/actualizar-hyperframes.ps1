# Instala o actualiza las skills de HyperFrames (github.com/heygen-com/hyperframes) en
# el kit SIN pisar las skills propias.
#
# Por qué existe: HyperFrames trae una skill llamada "motion-graphics", igual que la del
# kit. El 06/10/2026 un "npx skills add heygen-com/hyperframes" corrido en la raíz la
# pisó (se recuperó de la copia bajada de Drive). Por eso se baja todo en una carpeta
# aparte, se renombra la suya a "hyperframes-motion-graphics" y recién ahí se copia.
#
# NUNCA correr en la raíz del kit: "npx skills add/update heygen-com/hyperframes" ni
# "npx hyperframes skills [update]". Siempre este script:
#   powershell -ExecutionPolicy Bypass -File instalar\actualizar-hyperframes.ps1
$ErrorActionPreference = "Stop"
$kit = Split-Path $PSScriptRoot -Parent
$skills = Join-Path $kit ".claude\skills"
$propias = "audio-y-microfono", "edicion-video", "motion-graphics", "reel-dopamina-juanpi",
  "sonidos-y-efectos", "subtitulos-animados", "transiciones-y-efectos", "formato-partido",
  "estilos-de-referencia"
# Va al principio de la descripción de cada skill de HyperFrames: en este kit el video se
# hace en Remotion y HyperFrames se usa solo si Juanpi lo pide.
$prefijo = "HyperFrames, solo si Juanpi pide HyperFrames (en este kit el video va en Remotion) — "
$utf8 = New-Object System.Text.UTF8Encoding $false  # sin BOM: si no, el "---" deja de leerse

$huellas = @{}
foreach ($p in $propias) {
  $f = Join-Path $skills "$p\SKILL.md"
  if (Test-Path $f) { $huellas[$p] = (Get-FileHash $f).Hash }
}

$tmp = Join-Path $kit "tmp\hyperframes-skills"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Force (Join-Path $tmp ".claude\skills") | Out-Null
Push-Location $tmp
try {
  $env:DO_NOT_TRACK = "1"
  npx -y skills add heygen-com/hyperframes -a claude-code -s '*' -y --copy | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "npx skills add falló (código $LASTEXITCODE)" }
} finally { Pop-Location }

$nuevas = Join-Path $tmp ".claude\skills"
if (-not (Test-Path "$nuevas\hyperframes\SKILL.md")) { throw "No se bajaron las skills de HyperFrames en $nuevas" }
if (Test-Path "$nuevas\motion-graphics") { Rename-Item "$nuevas\motion-graphics" "hyperframes-motion-graphics" }

$copiadas = @()
foreach ($d in Get-ChildItem $nuevas -Directory) {
  if ($propias -contains $d.Name) {
    throw "HyperFrames trae '$($d.Name)', que choca con una skill del kit: renombrala en este script antes de seguir"
  }
  $dest = Join-Path $skills $d.Name
  if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
  Copy-Item $d.FullName $dest -Recurse
  $copiadas += $d.Name
}

# Retoques: el nombre nuevo, las referencias a /motion-graphics y nada de "skills update"
# (sus skills piden correrlo antes de usarse, y eso volvería a pisar la del kit).
$desc = [regex]'(?m)^(description:[ \t]*[>|][-+]?[ \t]*\r?\n[ \t]+|description:[ \t]*["'']|description:[ \t]+(?=[^>|"''\s]))'
foreach ($n in $copiadas) {
  foreach ($f in Get-ChildItem (Join-Path $skills $n) -Recurse -File -Include *.md, *.mjs) {
    $t = [IO.File]::ReadAllText($f.FullName, $utf8); $o = $t
    $t = $t -replace '(?<![\w./-])/motion-graphics\b', '/hyperframes-motion-graphics'
    $t = $t -replace '`motion-graphics`', '`hyperframes-motion-graphics`'
    $t = $t -replace '\bmotion-graphics instead\b', 'hyperframes-motion-graphics instead'
    $t = $t -replace '\.\./\.\./motion-graphics/', '../../hyperframes-motion-graphics/'
    $t = $t -replace 'npx hyperframes skills update[^`\r\n]*', 'instalar\actualizar-hyperframes.ps1'
    if ($f.Name -eq "SKILL.md" -and $f.Directory.Name -eq $n) {
      if ($n -eq "hyperframes-motion-graphics") {
        $t = $t -replace '(?m)^name:[ \t]*motion-graphics[ \t]*$', 'name: hyperframes-motion-graphics'
      }
      if ($n -eq "hyperframes") {
        $t = $t -replace 'HyperFrames is the default output framework\s+unless the user explicitly chooses another framework for the deliverable or asks only to record a\s+browser session\.', 'In this kit the default framework is Remotion: use HyperFrames only when the user explicitly asks for it.'
      }
      if (-not $t.Contains($prefijo)) { $t = $desc.Replace($t, '${1}' + $prefijo, 1) }
    }
    if ($t -ne $o) { [IO.File]::WriteAllText($f.FullName, $t, $utf8) }
  }
}

foreach ($p in $huellas.Keys) {
  if ((Get-FileHash (Join-Path $skills "$p\SKILL.md")).Hash -ne $huellas[$p]) { throw "Se modificó la skill del kit '$p'" }
}
Remove-Item $tmp -Recurse -Force
Write-Host "Listo: $($copiadas.Count) skills de HyperFrames ($($copiadas -join ', ')). Las del kit, intactas."
