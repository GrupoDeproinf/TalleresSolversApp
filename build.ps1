# Ruta al build.gradle
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$gradleFile = Join-Path $scriptDir "android\app\build.gradle"
$backupFile = "$gradleFile.bak"

# Backup de seguridad
Copy-Item $gradleFile $backupFile -Force
Write-Host "Backup creado: $backupFile"

# Leer contenido
$content = Get-Content $gradleFile
$newContent = @()
$found = $false

foreach ($line in $content) {
    if ($line -match "versionCode\s+(\d+)") {
        $oldCode = [int]$Matches[1]
        $newCode = $oldCode + 1
        $newLine = $line -replace "\d+", "$newCode"
        $newContent += $newLine
        Write-Host "versionCode actualizado: $oldCode -> $newCode"
        $found = $true
    } else {
        $newContent += $line
    }
}

if (-not $found) {
    Write-Warning "No se encontró versionCode en el archivo."
} else {
    Set-Content $gradleFile $newContent -Encoding UTF8
}

# Eliminar BOM si existe
$bytes = [System.IO.File]::ReadAllBytes($gradleFile)
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
    Write-Host "BOM detectado. Eliminando..."
    [System.IO.File]::WriteAllBytes($gradleFile, $bytes[3..($bytes.Length - 1)])
} else {
    Write-Host "No se detectó BOM."
}

# Ir a la carpeta android y compilar
Push-Location android
Write-Host "-----------------------------------------"
# Write-Host "GENERANDO APK..."
# ./gradlew assembleRelease
Write-Host "-----------------------------------------"
Write-Host "GENERANDO BUNDLE"
./gradlew bundleRelease
Pop-Location

# Abrir carpeta de salida (opcional)
Start-Process explorer "android\app\build\outputs"

# Mostrar rutas
Write-Host "-----------------------------------------"
Write-Host "APK generado: android\app\build\outputs\apk\release\app-release.apk"
Write-Host "AAB generado: android\app\build\outputs\bundle\release\app-release.aab"
