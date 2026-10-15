# Instala todo lo necesario para editar con esta carpeta, en un solo paso.
#
#   powershell -ExecutionPolicy Bypass -File instalar\instalar.ps1
#
# Opciones:
#   -SoloVerificar        no instala nada: solo dice que falta
#   -SinHerramientas      no intenta instalar Node/FFmpeg/Python con winget
#   -SinDependencias      no corre npm ci (salta las dependencias de Remotion)
#   -Crudos <carpeta>     donde estan los crudos de camara (para los scripts)
#   -Obs <carpeta>        donde OBS guarda las grabaciones (para los scripts)
#   -Tipografias          instala Hando y Archivo para el usuario (solo para las vistas previas)
#
# Que hace, en orden:
#   1. Mira si estan Node.js, FFmpeg (full build) y Python; los que falten los instala con winget.
#   2. Instala los paquetes de Python (faster-whisper, numpy, scipy, pillow, opencv).
#   3. Instala las dependencias de Remotion UNA vez y enlaza los 11 proyectos (preparar-proyectos.ps1).
#   4. Resuelve las rutas de los scripts (ajustar-rutas.ps1).
#   5. (opcional) instala las tipografias.
#   6. Verifica todo (verificar.ps1).
param(
    [switch]$SoloVerificar,
    [switch]$SinHerramientas,
    [switch]$SinDependencias,
    [switch]$Tipografias,
    [string]$Crudos = "",
    [string]$Obs = ""
)

$raiz = Split-Path -Parent $PSScriptRoot
function Paso($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Yellow }

if ($SoloVerificar) {
    & (Join-Path $PSScriptRoot "verificar.ps1")
    exit 0
}

# 1. Herramientas
Paso "1. Herramientas (Node.js, FFmpeg, Python)"
$winget = Get-Command winget -ErrorAction SilentlyContinue
$instaladas = $false
$necesarias = @(
    @{ Nombre = "Node.js"; Comando = "node"; Id = "OpenJS.NodeJS.LTS" },
    @{ Nombre = "FFmpeg (full build)"; Comando = "ffmpeg"; Id = "Gyan.FFmpeg" },
    @{ Nombre = "Python 3.12"; Comando = "python"; Id = "Python.Python.3.12" }
)
foreach ($h in $necesarias) {
    if (Get-Command $h.Comando -ErrorAction SilentlyContinue) {
        Write-Host "  OK  $($h.Nombre)"
        continue
    }
    if ($SinHerramientas -or -not $winget) {
        Write-Host "  FALTA  $($h.Nombre). Instalalo a mano (ver instalar\INSTALACION.md)." -ForegroundColor Red
        continue
    }
    Write-Host "  Instalando $($h.Nombre) con winget..." -ForegroundColor Cyan
    winget install --id $h.Id -e --accept-package-agreements --accept-source-agreements
    $instaladas = $true
}
if ($instaladas) {
    Write-Host ""
    Write-Host "Se instalaron herramientas nuevas. Cerra esta terminal, abri una nueva y volve a correr instalar.ps1" -ForegroundColor Yellow
    Write-Host "(el PATH no se actualiza en la terminal que ya estaba abierta)." -ForegroundColor Yellow
    exit 0
}

# 2. Paquetes de Python
Paso "2. Paquetes de Python"
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m pip install --quiet --disable-pip-version-check faster-whisper numpy scipy pillow opencv-python
    if ($LASTEXITCODE -eq 0) { Write-Host "  OK  faster-whisper, numpy, scipy, pillow, opencv-python" }
    else { Write-Host "  FALLO pip. Corre a mano: pip install faster-whisper numpy scipy pillow opencv-python" -ForegroundColor Red }
} else {
    Write-Host "  (sin Python, se salta)" -ForegroundColor Yellow
}

# 3. Remotion
Paso "3. Proyectos de Remotion"
if ($SinDependencias) {
    Write-Host "  (se salta por -SinDependencias)" -ForegroundColor Yellow
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    & (Join-Path $PSScriptRoot "preparar-proyectos.ps1")
} else {
    Write-Host "  (sin Node.js, se salta)" -ForegroundColor Yellow
}

# 4. Rutas
Paso "4. Rutas de los scripts"
& (Join-Path $PSScriptRoot "ajustar-rutas.ps1") -Crudos $Crudos -Obs $Obs

# 5. Tipografias
if ($Tipografias) {
    Paso "5. Tipografias"
    $destino = Join-Path $env:LOCALAPPDATA "Microsoft\Windows\Fonts"
    New-Item -ItemType Directory -Force $destino | Out-Null
    $reg = "HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts"
    foreach ($f in Get-ChildItem (Join-Path $raiz "tipografias") -File | Where-Object { $_.Extension -in ".ttf", ".otf" }) {
        Copy-Item $f.FullName $destino -Force
        $tipo = if ($f.Extension -eq ".otf") { "(OpenType)" } else { "(TrueType)" }
        New-ItemProperty -Path $reg -Name "$($f.BaseName) $tipo" -Value (Join-Path $destino $f.Name) -PropertyType String -Force | Out-Null
        Write-Host "  OK  $($f.Name)"
    }
}

# 6. Verificar
Paso "6. Verificacion"
& (Join-Path $PSScriptRoot "verificar.ps1")
