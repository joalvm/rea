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
        Help = $false
    }

    for ($index = 0; $index -lt $Tokens.Length; $index++) {
        $token = $Tokens[$index]

        if ($token -match '^(--?|/)(help|h|\?)$') {
            $options.Help = $true
            continue
        }

        if ($token -match '^(--?|/)(platform|p)=(.+)$') {
            $options.Platform = $Matches[3].ToLowerInvariant()
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

        throw "Argumento no soportado: $token"
    }

    return [pscustomobject]$options
}

function Show-Usage {
    Write-Host "Uso: pwsh -File scripts/build.ps1 [--platform=android|ios|all]"
    Write-Host "Default platform: all"
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

$root = Split-Path -Parent $PSScriptRoot
$options = Parse-Options -Tokens $args

if ($options.Help) {
    Show-Usage
    exit 0
}

$targets = Resolve-Targets -Platform $options.Platform

if (($targets -contains "ios") -and -not (Test-IsMacOSHost)) {
    if ($options.Platform -eq "ios") {
        throw "Build iOS local requiere macOS con Xcode."
    }

    Write-Warning "Build iOS omitido en este host. Se construira solo Android porque iOS local requiere macOS con Xcode."
    $targets = @("android")
}

Push-Location $root
try {
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

    Write-Host "Targets construidos: $($targets -join ', ')"
}
finally {
    Pop-Location
}
