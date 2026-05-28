param(
    [ValidateSet("apk", "aab")]
    [string]$Artifact = "apk",

    [ValidateSet("none", "build", "patch", "minor", "major")]
    [string]$Release = "none"
)

$ErrorActionPreference = "Stop"

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
    $versionInfoRaw = & node .\scripts\bump-app-version.mjs --release $Release

    if ($LASTEXITCODE -ne 0) {
        throw "No se pudo preparar versionado de app para build Android."
    }

    $versionInfo = $versionInfoRaw | ConvertFrom-Json
    $versionLabel = "v$($versionInfo.version)-b$($versionInfo.versionCode)"
    $distDir = Join-Path $root "dist"
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null

    $latestTarget = Join-Path $distDir "rea-release.$Artifact"
    if (Test-Path $latestTarget) {
        Remove-Item $latestTarget -Force
    }

    & powershell -NoProfile -ExecutionPolicy Bypass -File scripts\sync-brand-assets.ps1
    & .\node_modules\.bin\expo.cmd prebuild --platform android --clean

    if (-not (Test-Path (Join-Path $root "android"))) {
        throw "Expo prebuild no genero carpeta android."
    }

    Push-Location android
    try {
        .\gradlew.bat clean

        if ($Artifact -eq "apk") {
            .\gradlew.bat assembleRelease
            $source = Join-Path $root "android\app\build\outputs\apk\release\app-release.apk"
            $versionedTarget = Join-Path $distDir "rea-$versionLabel.apk"
        }
        else {
            .\gradlew.bat bundleRelease
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
