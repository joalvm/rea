param(
    [ValidateSet("apk", "aab")]
    [string]$Artifact = "apk",

    [ValidateSet("none", "build", "patch", "minor", "major")]
    [string]$Release = "none"
)

$ErrorActionPreference = "Stop"

function Invoke-NativeStep {
    param(
        [string]$Label,
        [scriptblock]$Command
    )

    & $Command

    if ($LASTEXITCODE -ne 0) {
        throw "Fallo paso nativo: $Label (exit code $LASTEXITCODE)."
    }
}

function Stop-GradleDaemonsIfPresent {
    param([string]$AndroidDir)

    $javaDaemons = Get-CimInstance Win32_Process -Filter "name = 'java.exe'" |
        Where-Object { $_.CommandLine -match "GradleDaemon|KotlinCompileDaemon" } |
        Select-Object -ExpandProperty ProcessId

    foreach ($processId in $javaDaemons) {
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }

    $gradleWrapper = Join-Path $AndroidDir "gradlew.bat"
    if (-not (Test-Path $gradleWrapper)) {
        return
    }

    Push-Location $AndroidDir
    try {
        & .\gradlew.bat --stop | Out-Null
    }
    finally {
        Pop-Location
    }
}

$root = Split-Path -Parent $PSScriptRoot
$sdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$jdkRoot = Join-Path $env:LOCALAPPDATA "Programs\Temurin17"

if (-not $env:ANDROID_HOME -and (Test-Path $sdkRoot)) {
    $env:ANDROID_HOME = $sdkRoot
    $env:ANDROID_SDK_ROOT = $sdkRoot
}

if (-not $env:JAVA_HOME -and (Test-Path $jdkRoot)) {
    $env:JAVA_HOME = $jdkRoot
}

if ($env:JAVA_HOME) {
    $env:Path = "$($env:JAVA_HOME)\bin;$($env:Path)"
}

if ($env:ANDROID_HOME) {
    $env:Path = "$($env:ANDROID_HOME)\platform-tools;$($env:ANDROID_HOME)\cmdline-tools\latest\bin;$($env:Path)"
}

$env:CI = "1"

if (-not $env:NODE_ENV) {
    $env:NODE_ENV = "production"
}

Push-Location $root

try {
    Invoke-NativeStep "versionado de app" { node .\scripts\bump-app-version.mjs --release $Release }
    $versionInfoRaw = node .\scripts\bump-app-version.mjs --release none

    $versionInfo = $versionInfoRaw | ConvertFrom-Json
    $versionLabel = "v$($versionInfo.version)-b$($versionInfo.versionCode)"
    $distDir = Join-Path $root "dist"
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null

    $latestTarget = Join-Path $distDir "rea-release.$Artifact"
    if (Test-Path $latestTarget) {
        Remove-Item $latestTarget -Force
    }

    $androidDir = Join-Path $root "android"
    Stop-GradleDaemonsIfPresent $androidDir

    Invoke-NativeStep "brand assets" { powershell -NoProfile -ExecutionPolicy Bypass -File scripts\sync-brand-assets.ps1 }
    Invoke-NativeStep "expo prebuild android" { .\node_modules\.bin\expo.cmd prebuild --platform android }

    if (-not (Test-Path $androidDir)) {
        throw "Expo prebuild no genero carpeta android."
    }

    Push-Location $androidDir
    try {
        Invoke-NativeStep "gradle clean" { .\gradlew.bat clean --console=plain -q --no-daemon }

        if ($Artifact -eq "apk") {
            Invoke-NativeStep "gradle assembleRelease" { .\gradlew.bat assembleRelease --console=plain -q --no-daemon }
            $source = Join-Path $root "android\app\build\outputs\apk\release\app-release.apk"
            $versionedTarget = Join-Path $distDir "rea-$versionLabel.apk"
        }
        else {
            Invoke-NativeStep "gradle bundleRelease" { .\gradlew.bat bundleRelease --console=plain -q --no-daemon }
            $source = Join-Path $root "android\app\build\outputs\bundle\release\app-release.aab"
            $versionedTarget = Join-Path $distDir "rea-$versionLabel.aab"
        }
    }
    finally {
        Pop-Location
    }

    if (-not (Test-Path $source)) {
        throw "No se genero artefacto Android esperado: $source"
    }

    Copy-Item $source $versionedTarget -Force
    Copy-Item $source $latestTarget -Force

    Write-Host "Version app: $($versionInfo.version)"
    Write-Host "Android versionCode: $($versionInfo.versionCode)"
    Write-Host "iOS buildNumber: $($versionInfo.buildNumber)"
    Write-Host "Artefacto versionado listo: $versionedTarget"
    Write-Host "Alias actualizado: $latestTarget"
}
finally {
    Pop-Location
}
