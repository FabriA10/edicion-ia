# Instala las dependencias de Remotion UNA sola vez (en 01-base-talking-head) y
# enlaza las demas carpetas de proyectos a ese mismo node_modules con una junction.
#
#   powershell -ExecutionPolicy Bypass -File instalar\preparar-proyectos.ps1

$raiz = Split-Path -Parent $PSScriptRoot
$base = Join-Path $raiz "proyectos"
$principal = Join-Path $base "01-base-talking-head"
$modulos = Join-Path $principal "node_modules"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Falta Node.js. Instalalo primero (ver instalar\INSTALACION.md)." -ForegroundColor Red
    exit 1
}

if (Test-Path (Join-Path $modulos ".bin\remotion.cmd")) {
    Write-Host "== 01-base-talking-head ya tiene sus dependencias ==" -ForegroundColor Cyan
} else {
    Write-Host "== Dependencias de 01-base-talking-head (una sola vez, ~560 MB) ==" -ForegroundColor Cyan
    Push-Location $principal
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm ci fallo; pruebo con npm install" -ForegroundColor Yellow
        npm install
    }
    Pop-Location
}

if (-not (Test-Path (Join-Path $modulos ".bin\remotion.cmd"))) {
    Write-Host "Remotion no quedo instalado. Mira el error de arriba." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "== Enlazando las otras carpetas al mismo node_modules ==" -ForegroundColor Cyan
foreach ($p in Get-ChildItem $base -Directory) {
    if ($p.Name -eq "01-base-talking-head") { continue }
    if (-not (Test-Path (Join-Path $p.FullName "package.json"))) { continue }
    if (Test-Path (Join-Path $p.FullName "hyperframes.json")) { continue }  # HyperFrames: no usa Remotion
    $enlace = Join-Path $p.FullName "node_modules"
    if (Test-Path $enlace) {
        Write-Host "  $($p.Name) ya tiene node_modules"
        continue
    }
    New-Item -ItemType Junction -Path $enlace -Target $modulos | Out-Null
    Write-Host "  $($p.Name) -> enlazado"
}

Write-Host ""
Write-Host "Listo. Para ver un proyecto: cd proyectos\01-base-talking-head ; npm run dev" -ForegroundColor Green
Write-Host "Para un proyecto nuevo (copia de otro), correr de nuevo este script: lo enlaza solo."
Write-Host "Ojo: para borrar una carpeta de proyecto, primero quitar su junction con:  cmd /c rmdir <proyecto>\node_modules"
