$ErrorActionPreference = "Stop"
Set-StrictMode -Version 3.0

function Invoke-NativeStep {
    param(
        [Parameter(Mandatory)][string]$Label,
        [Parameter(Mandatory)][scriptblock]$Command
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo paso nativo: $Label (exit code $LASTEXITCODE)."
    }
}

function Test-IsMacOSHost {
    if ($env:OS -eq "Windows_NT") {
        return $false
    }

    $uname = Get-Command uname -ErrorAction SilentlyContinue
    if (-not $uname) {
        return $false
    }

    return (& $uname.Source) -eq "Darwin"
}

function Get-ExpoCliPath {
    param([Parameter(Mandatory)][string]$Root)

    $expoCli = Join-Path $Root "node_modules/.bin/expo"
    if (-not (Test-Path $expoCli)) {
        throw "No encontre CLI local de Expo en $expoCli"
    }

    return $expoCli
}

function Compress-AppBundle {
    param(
        [Parameter(Mandatory)][string]$SourcePath,
        [Parameter(Mandatory)][string]$DestinationPath
    )

    $ditto = Get-Command ditto -ErrorAction SilentlyContinue
    if ($ditto) {
        Invoke-NativeStep "zip app bundle" { & $ditto.Source -c -k --sequesterRsrc --keepParent $SourcePath $DestinationPath }
        return
    }

    Compress-Archive -LiteralPath $SourcePath -DestinationPath $DestinationPath -Force
}

if (-not (Test-IsMacOSHost)) {
    throw "Build iOS local sin cuentas requiere macOS con Xcode."
}

$root = Split-Path -Parent $PSScriptRoot
$env:CI = "1"
if (-not $env:NODE_ENV) {
    $env:NODE_ENV = "production"
}

$expoCli = Get-ExpoCliPath -Root $root

Push-Location $root
try {
    $versionInfoRaw = node ./scripts/bump-app-version.mjs --release none
    if ($LASTEXITCODE -ne 0) {
        throw "No pude leer version actual de app."
    }

    $versionInfo = $versionInfoRaw | ConvertFrom-Json
    $versionLabel = "v$($versionInfo.version)-b$($versionInfo.buildNumber)"
    $distDir = Join-Path $root "dist"
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null

    $versionedTarget = Join-Path $distDir "rea-ios-simulator-$versionLabel.zip"
    $latestTarget = Join-Path $distDir "rea-ios-simulator-latest.zip"

    foreach ($target in @($versionedTarget, $latestTarget)) {
        if (Test-Path $target) {
            Remove-Item $target -Force
        }
    }

    Invoke-NativeStep "expo prebuild ios" { & $expoCli prebuild --platform ios }

    $iosDir = Join-Path $root "ios"
    if (-not (Test-Path $iosDir)) {
        throw "Expo prebuild no genero carpeta ios."
    }

    $workspace = Get-ChildItem -Path $iosDir -Filter *.xcworkspace -ErrorAction SilentlyContinue | Select-Object -First 1
    $project = Get-ChildItem -Path $iosDir -Filter *.xcodeproj -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $workspace -and -not $project) {
        throw "No encontre proyecto Xcode en carpeta ios."
    }

    $scheme = if ($workspace) {
        [System.IO.Path]::GetFileNameWithoutExtension($workspace.Name)
    }
    else {
        [System.IO.Path]::GetFileNameWithoutExtension($project.Name)
    }

    $derivedDataPath = Join-Path $iosDir "build/derived-data"
    if (Test-Path $derivedDataPath) {
        Remove-Item $derivedDataPath -Recurse -Force
    }

    Push-Location $iosDir
    try {
        if ($workspace) {
            Invoke-NativeStep "xcodebuild workspace" {
                xcodebuild -workspace $workspace.Name -scheme $scheme -configuration Release -sdk iphonesimulator -derivedDataPath $derivedDataPath CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" build
            }
        }
        else {
            Invoke-NativeStep "xcodebuild project" {
                xcodebuild -project $project.Name -scheme $scheme -configuration Release -sdk iphonesimulator -derivedDataPath $derivedDataPath CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" build
            }
        }
    }
    finally {
        Pop-Location
    }

    $productsDir = Join-Path $derivedDataPath "Build/Products/Release-iphonesimulator"
    $appBundle = Get-ChildItem -Path $productsDir -Filter *.app -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $appBundle) {
        throw "No encontre .app generado en $productsDir"
    }

    Compress-AppBundle -SourcePath $appBundle.FullName -DestinationPath $versionedTarget
    Copy-Item $versionedTarget $latestTarget -Force

    Write-Host "Version app: $($versionInfo.version)"
    Write-Host "iOS buildNumber: $($versionInfo.buildNumber)"
    Write-Host "Artefacto versionado listo: $versionedTarget"
    Write-Host "Alias actualizado: $latestTarget"
}
finally {
    Pop-Location
}
