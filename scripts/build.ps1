$ErrorActionPreference = "Stop"
Set-StrictMode -Version 3.0

function Test-IsWindowsHost {
    return $env:OS -eq "Windows_NT"
}

function Test-IsMacOSHost {
    if (Test-IsWindowsHost) {
        return $false
    }

    $uname = Get-Command uname -ErrorAction SilentlyContinue
    if (-not $uname) {
        return $false
    }

    return (& $uname.Source) -eq "Darwin"
}

function Parse-Options {
    param([string[]]$Tokens)

    $options = [ordered]@{
        Platform = "all"
        Version = "minor"
        DryRun = $false
        Help = $false
    }

    for ($index = 0; $index -lt $Tokens.Length; $index++) {
        $token = $Tokens[$index]

        if ($token -match '^(--?|/)(help|h|\?)$') {
            $options.Help = $true
            continue
        }

        if ($token -match '^--dry-run$') {
            $options.DryRun = $true
            continue
        }

        if ($token -match '^(--?|/)(platform|p)=(.+)$') {
            $options.Platform = $Matches[3].ToLowerInvariant()
            continue
        }

        if ($token -match '^(--?|/)(version|v)=(.+)$') {
            $options.Version = $Matches[3].ToLowerInvariant()
            continue
        }

        if ($token -match '^(--?|/)(platform|p)$') {
            if ($index + 1 -ge $Tokens.Length) {
                throw "Falta valor para --platform."
            }

            $index += 1
            $options.Platform = $Tokens[$index].ToLowerInvariant()
            continue
        }

        if ($token -match '^(--?|/)(version|v)$') {
            if ($index + 1 -ge $Tokens.Length) {
                throw "Falta valor para --version."
            }

            $index += 1
            $options.Version = $Tokens[$index].ToLowerInvariant()
            continue
        }

        throw "Argumento no soportado: $token"
    }

    return [pscustomobject]$options
}

function Show-Usage {
    Write-Host "Uso: pwsh -File scripts/build.ps1 [--platform=android|ios|all] [--version=patch|minor|major] [--dry-run]"
    Write-Host "Default platform: all"
    Write-Host "Default version: minor"
}

function Invoke-Step {
    param(
        [Parameter(Mandatory)][string]$Label,
        [Parameter(Mandatory)][scriptblock]$Command
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "Fallo paso: $Label (exit code $LASTEXITCODE)."
    }
}

function Resolve-Targets {
    param([Parameter(Mandatory)][string]$Platform)

    $validPlatforms = @("android", "ios", "all")
    if ($validPlatforms -notcontains $Platform) {
        throw "Platform no soportada: $Platform"
    }

    if ($Platform -eq "all") {
        return @("android", "ios")
    }

    return @($Platform)
}

function Resolve-VersionKind {
    param([Parameter(Mandatory)][string]$Version)

    $validVersions = @("patch", "minor", "major", "none")
    if ($validVersions -notcontains $Version) {
        throw "Version no soportada: $Version"
    }

    return $Version
}

$root = Split-Path -Parent $PSScriptRoot
$options = Parse-Options -Tokens $args

if ($options.Help) {
    Show-Usage
    exit 0
}

$targets = Resolve-Targets -Platform $options.Platform
$versionKind = Resolve-VersionKind -Version $options.Version

if (($targets -contains "ios") -and -not (Test-IsMacOSHost)) {
    if ($options.Platform -eq "ios") {
        throw "Build iOS local sin cuentas requiere macOS con Xcode."
    }

    Write-Warning "Build iOS omitido en este host. Se construira solo Android porque iOS local requiere macOS con Xcode."
    $targets = @("android")
}

Push-Location $root
try {
    $previewInfoRaw = node ./scripts/bump-app-version.mjs --release $versionKind --dry-run
    if ($LASTEXITCODE -ne 0) {
        throw "No pude calcular siguiente version."
    }

    $previewInfo = $previewInfoRaw | ConvertFrom-Json

    if ($options.DryRun) {
        Write-Host "Dry run"
        Write-Host "Targets: $($targets -join ', ')"
        Write-Host "Release: $versionKind"
        Write-Host "Version actual: $($previewInfo.previousVersion)"
        Write-Host "Version siguiente: $($previewInfo.version)"
        Write-Host "Android versionCode siguiente: $($previewInfo.versionCode)"
        Write-Host "iOS buildNumber siguiente: $($previewInfo.buildNumber)"
        exit 0
    }

    $versionInfoRaw = node ./scripts/bump-app-version.mjs --release $versionKind
    if ($LASTEXITCODE -ne 0) {
        throw "No pude actualizar versionado."
    }

    $versionInfo = $versionInfoRaw | ConvertFrom-Json

    foreach ($target in $targets) {
        switch ($target) {
            "android" {
                Invoke-Step "build android" { & ./scripts/build-local-android.ps1 }
            }
            "ios" {
                Invoke-Step "build ios" { & ./scripts/build-local-ios.ps1 }
            }
        }
    }

    Write-Host "Version previa: $($versionInfo.previousVersion)"
    Write-Host "Version nueva: $($versionInfo.version)"
    Write-Host "Android versionCode: $($versionInfo.versionCode)"
    Write-Host "iOS buildNumber: $($versionInfo.buildNumber)"
    Write-Host "Targets construidos: $($targets -join ', ')"
}
finally {
    Pop-Location
}
