$ErrorActionPreference = "Stop"

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$parent = Split-Path -Parent $repo
$leaf = Split-Path -Leaf $repo
$device = "emulator-5554"
$oldLocation = (Get-Location).Path
$driveLetter = $null
$mounted = $false

try {
    $state = (& adb -s $device get-state 2>$null).Trim()
    if ($state -ne "device") {
        throw "No hay un AVD listo en $device. Inicia emulator-5554 antes de compilar."
    }

    $abi = (& adb -s $device shell getprop ro.product.cpu.abi 2>$null).Trim()
    if ([string]::IsNullOrWhiteSpace($abi)) {
        throw "No se pudo detectar el ABI de $device."
    }

    $usedDrives = (Get-PSDrive -PSProvider FileSystem).Name
    $driveLetter = @("M", "N", "O", "P", "Q", "R", "S", "T", "U", "V") |
        Where-Object { $_ -notin $usedDrives } |
        Select-Object -First 1
    if (-not $driveLetter) {
        throw "No hay una letra de unidad libre para acortar la ruta de Gradle."
    }

    $drive = "${driveLetter}:"
    & subst $drive $parent
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo montar $parent como $drive."
    }
    $mounted = $true

    $shortRepo = Join-Path "$drive\" $leaf
    $android = Join-Path $shortRepo "android"
    $apk = Join-Path $android "app\build\outputs\apk\release\app-release.apk"

    Set-Location $android
    $env:NODE_ENV = "production"
    $gradleArgs = @(
        "app:assembleRelease",
        "-x", "lint",
        "-x", "test",
        "--configure-on-demand",
        "--build-cache",
        "-PreactNativeDevServerPort=8081",
        "-PreactNativeArchitectures=$abi"
    )
    & .\gradlew.bat @gradleArgs
    if ($LASTEXITCODE -ne 0) {
        throw "La compilación release falló."
    }

    if (-not (Test-Path -LiteralPath $apk)) {
        throw "Gradle terminó sin generar $apk."
    }

    & adb -s $device install -r $apk
    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo instalar el APK release en $device."
    }

    Write-Output "Release instalada en $device ($abi)."
}
finally {
    Set-Location $oldLocation
    if ($mounted -and $driveLetter) {
        & subst "${driveLetter}:" /d
    }
}
