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

function Get-EasCliPath {
    $easCli = Get-Command eas -ErrorAction SilentlyContinue
    if (-not $easCli) {
        throw "No encontre EAS CLI en PATH. Instala eas-cli o usa entorno donde `eas` este disponible."
    }

    return $easCli.Source
}

if (-not (Test-IsMacOSHost)) {
    throw "Build iOS local requiere macOS con Xcode."
}

$root = Split-Path -Parent $PSScriptRoot
$env:CI = "1"
if (-not $env:NODE_ENV) {
    $env:NODE_ENV = "production"
}

$easCli = Get-EasCliPath

function Remove-IosArtifacts {
    param([Parameter(Mandatory)][string]$DistDir)

    $patterns = @(
        "rea-ios-simulator*"
    )

    foreach ($pattern in $patterns) {
        Get-ChildItem -Path $DistDir -Filter $pattern -File -ErrorAction SilentlyContinue |
            Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

Push-Location $root
try {
    $distDir = Join-Path $root "dist"
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    Remove-IosArtifacts -DistDir $distDir

    $outputTarget = Join-Path $distDir "rea-ios-simulator.tar.gz"

    Invoke-NativeStep "eas local build ios" {
        & $easCli build --platform ios --profile simulator --local --non-interactive --output $outputTarget
    }

    if (-not (Test-Path $outputTarget)) {
        throw "No se genero artefacto iOS esperado: $outputTarget"
    }

    Write-Host "Artefacto listo: $outputTarget"
}
finally {
    Pop-Location
}
