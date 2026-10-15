# Verifica que este equipo tenga todo lo necesario para editar con esta carpeta.
#
#   powershell -ExecutionPolicy Bypass -File instalar\verificar.ps1

$raiz = Split-Path -Parent $PSScriptRoot
$faltan = @()
$avisos = @()

function Titulo($t) { Write-Host ""; Write-Host "-- $t" -ForegroundColor Cyan }
function Ok($t) { Write-Host "   OK  $t" }
function Falta($t, $como) {
    Write-Host "   FALTA  $t. $como" -ForegroundColor Red
    $script:faltan += $t
}
function Aviso($t) {
    Write-Host "   OJO  $t" -ForegroundColor Yellow
    $script:avisos += $t
}

Write-Host "=== Edicion de video: verificacion del equipo ===" -ForegroundColor Yellow

# Herramientas de linea de comandos
$herramientas = @(
    @("Node.js", "node", "--version", "v24 (cualquier LTS reciente)", "Instalar de https://nodejs.org o: winget install OpenJS.NodeJS.LTS"),
    @("npm", "npm", "--version", "11", "Viene con Node.js"),
    @("FFmpeg", "ffmpeg", "-version", "9.0.1 full build", "Bajar el FULL build de https://www.gyan.dev/ffmpeg/builds/ o: winget install Gyan.FFmpeg"),
    @("FFprobe", "ffprobe", "-version", "", "Viene con FFmpeg"),
    @("Python", "python", "--version", "3.12", "Instalar de https://python.org o: winget install Python.Python.3.12")
)
foreach ($h in $herramientas) {
    Titulo $h[0]
    if (-not (Get-Command $h[1] -ErrorAction SilentlyContinue)) { Falta $h[0] $h[4]; continue }
    $v = (& $h[1] $h[2] 2>$null | Select-Object -First 1)
    Ok "$v"
    if ($h[3]) { Write-Host "       (referencia: $($h[3]))" -ForegroundColor DarkGray }
}

# Filtros de FFmpeg que usa el pipeline (no todos estan en el build 'essentials')
Titulo "Filtros de FFmpeg"
if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
    $filtros = ffmpeg -hide_banner -filters 2>$null | Out-String
    $sinFiltro = @()
    foreach ($f in @("silencedetect", "volumedetect", "aresample", "atrim", "loudnorm", "alimiter",
                     "acompressor", "equalizer", "highpass", "lowpass", "astats", "amix", "ebur128",
                     "sidechaincompress", "afade")) {
        if ($filtros -notmatch "\s$f\s") { $sinFiltro += $f }
    }
    if ($sinFiltro.Count -eq 0) { Ok "estan todos" }
    else { Falta "filtros de FFmpeg ($($sinFiltro -join ', '))" "Tenes el build 'essentials': instala el 'full'" }
}

# Paquetes de Python
Titulo "Paquetes de Python"
if (Get-Command python -ErrorAction SilentlyContinue) {
    foreach ($m in @(@("faster_whisper", "faster-whisper"), @("numpy", "numpy"), @("scipy", "scipy"), @("PIL", "pillow"), @("cv2", "opencv-python"))) {
        $v = python -c "import $($m[0]) as x; print(getattr(x, '__version__', 'ok'))" 2>$null
        if ($LASTEXITCODE -eq 0 -and $v) { Ok "$($m[1]) $v" }
        else { Falta $m[1] "Instalar con: pip install $($m[1])" }
    }
}

# Las skills, adentro de este paquete
Titulo "Skills del paquete"
foreach ($s in @("edicion-video", "subtitulos-animados", "motion-graphics", "transiciones-y-efectos", "audio-y-microfono", "sonidos-y-efectos")) {
    $archivo = Join-Path $raiz ".claude\skills\$s\SKILL.md"
    if (Test-Path $archivo) { Ok $s } else { Falta "skill $s" "Deberia estar en .claude\skills\$s del paquete" }
}
$refs = @(Get-ChildItem (Join-Path $raiz ".claude\skills\edicion-video\references") -Filter *.md -ErrorAction SilentlyContinue).Count
$scr = @(Get-ChildItem (Join-Path $raiz ".claude\skills\edicion-video\scripts") -File -ErrorAction SilentlyContinue).Count
Write-Host "       edicion-video: $refs referencias y $scr scripts (referencia: 12 y 8)" -ForegroundColor DarkGray
$crit = @(Get-ChildItem (Join-Path $raiz "criterio") -Filter *.md -ErrorAction SilentlyContinue).Count
Write-Host "       criterio: $crit archivos" -ForegroundColor DarkGray

# Sonidos y musica
Titulo "Sonidos y musica"
$nson = @(Get-ChildItem (Join-Path $raiz "sonidos") -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -ne "INDICE.md" }).Count
$nmus = @(Get-ChildItem (Join-Path $raiz "musica") -Filter *.mp3 -ErrorAction SilentlyContinue).Count
if ($nson -gt 100) { Ok "$nson sonidos" } else { Falta "sonidos" "La carpeta sonidos/ deberia tener ~170 archivos (hay $nson)" }
if ($nmus -gt 0) { Ok "$nmus temas de musica" } else { Aviso "No hay musica en musica/" }

# Los proyectos de Remotion
Titulo "Proyectos de Remotion"
$base = Join-Path $raiz "proyectos"
$principal = Join-Path $base "01-base-talking-head"
if (Test-Path (Join-Path $principal "node_modules\.bin\remotion.cmd")) {
    Ok "01-base-talking-head tiene sus dependencias"
} else {
    Falta "dependencias de Remotion" "Correr: powershell -ExecutionPolicy Bypass -File instalar\preparar-proyectos.ps1"
}
foreach ($p in Get-ChildItem $base -Directory) {
    if ($p.Name -eq "01-base-talking-head") { continue }
    if (-not (Test-Path (Join-Path $p.FullName "package.json"))) { continue }
    if (Test-Path (Join-Path $p.FullName "hyperframes.json")) { continue }  # HyperFrames: no usa Remotion
    if (Test-Path (Join-Path $p.FullName "node_modules\.bin\remotion.cmd")) { Ok "$($p.Name) enlazado" }
    else { Falta "enlace de $($p.Name)" "Correr instalar\preparar-proyectos.ps1" }
}

# Rutas de los scripts
Titulo "Rutas de los scripts"
# Se recorren solo src/ y trabajo/ de cada proyecto y las skills (no node_modules, que es enorme)
$dirsRutas = @(Join-Path $raiz ".claude\skills")
foreach ($p in Get-ChildItem $base -Directory) {
    foreach ($s in "src", "trabajo") {
        $d = Join-Path $p.FullName $s
        if (Test-Path $d) { $dirsRutas += $d }
    }
}
$pendientes = @(Get-ChildItem $dirsRutas -Recurse -File -Include *.py, *.mjs, *.sh -ErrorAction SilentlyContinue |
    Select-String -Pattern "@@PROYECTOS@@" -SimpleMatch -List)
if ($pendientes.Count -eq 0) { Ok "los marcadores @@PROYECTOS@@ estan resueltos" }
else { Aviso "Quedan $($pendientes.Count) script(s) con @@PROYECTOS@@: correr instalar\ajustar-rutas.ps1" }

# Tipografias
Titulo "Tipografias"
$fuentes = (Get-ChildItem "$env:WINDIR\Fonts", "$env:LOCALAPPDATA\Microsoft\Windows\Fonts" -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty Name) -join " "
foreach ($f in @("Hando", "Archivo")) {
    if ($fuentes -match $f) { Ok "$f instalada" }
    else { Aviso "$f no esta instalada en Windows. El render sale bien igual (los proyectos la cargan solos); instalala para ver bien las vistas previas (carpeta tipografias)." }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Yellow
if ($faltan.Count -eq 0) {
    Write-Host "Todo listo. Abri esta carpeta en Claude Code y pedile que edite." -ForegroundColor Green
} else {
    Write-Host "Falta: $($faltan -join ', ')" -ForegroundColor Red
    Write-Host "Ver instalar\INSTALACION.md" -ForegroundColor Red
}
if ($avisos.Count -gt 0) { Write-Host "Revisar $($avisos.Count) aviso(s) marcados con OJO." -ForegroundColor Yellow }
Write-Host ""
