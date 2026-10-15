# Resuelve los marcadores de ruta de los scripts de esta carpeta.
#
# Los scripts de proyectos/*/trabajo/scripts y de .claude/skills/*/scripts se
# escribieron en otra PC. En vez de rutas de esa PC traen marcadores:
#
#   @@PROYECTOS@@   la carpeta proyectos/ de este paquete
#   @@SONIDOS@@     la carpeta sonidos/ de este paquete
#   @@CRUDOS@@      donde estan los crudos de camara (MOV) -- se pasa con -Crudos
#   @@OBS@@         donde OBS guarda las grabaciones       -- se pasa con -Obs
#   @@DESCARGAS@@   la carpeta de Descargas
#
# Se puede correr las veces que haga falta (por ejemplo si movés la carpeta): recuerda
# el valor anterior en instalar\rutas-actuales.json.
#
#   powershell -ExecutionPolicy Bypass -File instalar\ajustar-rutas.ps1
#   powershell -ExecutionPolicy Bypass -File instalar\ajustar-rutas.ps1 -Crudos "D:\Videos\crudos" -Obs "D:\Obs grabaciones"
param(
    [string]$Crudos = "",
    [string]$Obs = "",
    [string]$Descargas = ""
)

$raiz = Split-Path -Parent $PSScriptRoot
$estadoArchivo = Join-Path $PSScriptRoot "rutas-actuales.json"
$barra = { param($p) ($p -replace '\\', '/').TrimEnd('/') }

$estado = @{
    "@@PROYECTOS@@" = "@@PROYECTOS@@"
    "@@SONIDOS@@"   = "@@SONIDOS@@"
    "@@CRUDOS@@"    = "@@CRUDOS@@"
    "@@OBS@@"       = "@@OBS@@"
    "@@DESCARGAS@@" = "@@DESCARGAS@@"
}
if (Test-Path $estadoArchivo) {
    $viejo = Get-Content $estadoArchivo -Raw -Encoding UTF8 | ConvertFrom-Json
    foreach ($k in @($estado.Keys)) { if ($viejo.$k) { $estado[$k] = [string]$viejo.$k } }
}

$nuevo = @{}
$nuevo["@@PROYECTOS@@"] = & $barra (Join-Path $raiz "proyectos")
$nuevo["@@SONIDOS@@"] = & $barra (Join-Path $raiz "sonidos")
if ($Crudos) { $nuevo["@@CRUDOS@@"] = & $barra $Crudos }
if ($Obs) { $nuevo["@@OBS@@"] = & $barra $Obs }
$desc = if ($Descargas) { $Descargas } else { Join-Path $env:USERPROFILE "Downloads" }
$nuevo["@@DESCARGAS@@"] = & $barra $desc

$extensiones = @(".py", ".mjs", ".sh", ".ts", ".tsx", ".txt", ".json")
# Solo src/ y trabajo/ de cada proyecto (no node_modules, que es una junction enorme) y las skills
$dirs = @()
$skills = Join-Path $raiz ".claude\skills"
if (Test-Path $skills) { $dirs += $skills }
$proy = Join-Path $raiz "proyectos"
if (Test-Path $proy) {
    foreach ($p in Get-ChildItem $proy -Directory) {
        foreach ($s in "src", "trabajo") {
            $d = Join-Path $p.FullName $s
            if (Test-Path $d) { $dirs += $d }
        }
    }
}
$archivos = @()
foreach ($d in $dirs) {
    $archivos += Get-ChildItem $d -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $extensiones -contains $_.Extension.ToLower() }
}
# los archivos sueltos de la raiz de cada proyecto (hoja.py, transcribir.py)
if (Test-Path $proy) {
    foreach ($p in Get-ChildItem $proy -Directory) {
        $archivos += Get-ChildItem $p.FullName -File -ErrorAction SilentlyContinue |
            Where-Object { $extensiones -contains $_.Extension.ToLower() -and $_.Name -ne "package-lock.json" }
    }
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
$cambiados = 0
foreach ($f in $archivos) {
    $texto = [System.IO.File]::ReadAllText($f.FullName, $utf8)
    $original = $texto
    foreach ($k in $nuevo.Keys) {
        $actual = $estado[$k]
        if ($actual -and $actual -ne $nuevo[$k] -and $texto.Contains($actual)) {
            $texto = $texto.Replace($actual, $nuevo[$k])
        }
        # el marcador original tambien (por si se copiaron archivos nuevos del paquete)
        if ($k -ne $nuevo[$k] -and $texto.Contains($k)) {
            $texto = $texto.Replace($k, $nuevo[$k])
        }
    }
    if ($texto -ne $original) {
        [System.IO.File]::WriteAllText($f.FullName, $texto, $utf8)
        $cambiados++
    }
}

foreach ($k in $nuevo.Keys) { $estado[$k] = $nuevo[$k] }
($estado | ConvertTo-Json) | Set-Content $estadoArchivo -Encoding UTF8

Write-Host "Rutas ajustadas en $cambiados archivo(s)."
Write-Host "  PROYECTOS = $($estado['@@PROYECTOS@@'])"
Write-Host "  SONIDOS   = $($estado['@@SONIDOS@@'])"
Write-Host "  CRUDOS    = $($estado['@@CRUDOS@@'])"
Write-Host "  OBS       = $($estado['@@OBS@@'])"
if ($estado['@@CRUDOS@@'] -like "@@*") { Write-Host "  (falta decir donde estan los crudos: volve a correr con -Crudos <carpeta>)" -ForegroundColor Yellow }
