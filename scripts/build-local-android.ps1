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

function Test-IsWindowsHost {
    return $env:OS -eq "Windows_NT"
}

function Get-EasCliPath {
    $easCli = Get-Command eas -ErrorAction SilentlyContinue
    if (-not $easCli) {
        throw "No encontre EAS CLI en PATH. Instala eas-cli o usa entorno donde `eas` este disponible."
    }

    return $easCli.Source
}

function Stop-GradleDaemonsIfPresent {
    param([Parameter(Mandatory)][string]$AndroidDir)

    if (Test-IsWindowsHost) {
        $javaDaemons = Get-CimInstance Win32_Process -Filter "name = 'java.exe'" |
            Where-Object { $_.CommandLine -match "GradleDaemon|KotlinCompileDaemon" } |
            Select-Object -ExpandProperty ProcessId

        foreach ($processId in $javaDaemons) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }

    $gradleWrapper = Get-GradleWrapperPath -AndroidDir $AndroidDir
    if (-not (Test-Path $gradleWrapper)) {
        return
    }

    Push-Location $AndroidDir
    try {
        Invoke-NativeStep "gradle --stop" { & $gradleWrapper --stop | Out-Null }
    }
    finally {
        Pop-Location
    }
}

function Get-GradleWrapperPath {
    param([Parameter(Mandatory)][string]$AndroidDir)

    if (Test-IsWindowsHost) {
        return Join-Path $AndroidDir "gradlew.bat"
    }

    return Join-Path $AndroidDir "gradlew"
}

function Get-ExpoCliPath {
    param([Parameter(Mandatory)][string]$Root)

    $expoCli = if (Test-IsWindowsHost) {
        Join-Path $Root "node_modules\.bin\expo.cmd"
    }
    else {
        Join-Path $Root "node_modules/.bin/expo"
    }

    if (-not (Test-Path $expoCli)) {
        throw "No encontre CLI local de Expo en $expoCli"
    }

    return $expoCli
}

function Set-AndroidEnvironmentDefaults {
    $sdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
    $jdkRoot = Join-Path $env:LOCALAPPDATA "Programs\Temurin17"

    if (Test-IsWindowsHost) {
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
    }

    $env:CI = "1"
    if (-not $env:NODE_ENV) {
        $env:NODE_ENV = "production"
    }
}

function Remove-AndroidArtifacts {
    param([Parameter(Mandatory)][string]$DistDir)

    $patterns = @(
        "rea-android*.apk",
        "rea-release.apk",
        "rea-v*.apk"
    )

    foreach ($pattern in $patterns) {
        Get-ChildItem -Path $DistDir -Filter $pattern -File -ErrorAction SilentlyContinue |
            Remove-Item -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-EasLocalAndroidBuild {
    param([Parameter(Mandatory)][string]$OutputPath)

    $easCli = Get-EasCliPath
    Invoke-NativeStep "eas local build android" {
        & $easCli build --platform android --profile preview --local --non-interactive --output $OutputPath
    }
}

function Invoke-WindowsFallbackAndroidBuild {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$OutputPath
    )

    $expoCli = Get-ExpoCliPath -Root $Root
    $androidDir = Join-Path $Root "android"
    Stop-GradleDaemonsIfPresent -AndroidDir $androidDir

    Invoke-NativeStep "expo prebuild android" { & $expoCli prebuild --platform android }

    if (-not (Test-Path $androidDir)) {
        throw "Expo prebuild no genero carpeta android."
    }

    $gradleWrapper = Get-GradleWrapperPath -AndroidDir $androidDir
    if (-not (Test-Path $gradleWrapper)) {
        throw "No existe wrapper de Gradle en $gradleWrapper"
    }

    Push-Location $androidDir
    try {
        Invoke-NativeStep "gradle clean" { & $gradleWrapper clean --console=plain -q --no-daemon }
        Invoke-NativeStep "gradle assembleRelease" { & $gradleWrapper assembleRelease --console=plain -q --no-daemon }
    }
    finally {
        Pop-Location
    }

    $source = Join-Path $Root "android\app\build\outputs\apk\release\app-release.apk"
    if (-not (Test-Path $source)) {
        throw "No se genero artefacto Android esperado: $source"
    }

    Copy-Item $source $OutputPath -Force
}

$root = Split-Path -Parent $PSScriptRoot
Set-AndroidEnvironmentDefaults

Push-Location $root
try {
    $distDir = Join-Path $root "dist"
    New-Item -ItemType Directory -Force -Path $distDir | Out-Null
    Remove-AndroidArtifacts -DistDir $distDir

    $outputTarget = Join-Path $distDir "rea-android.apk"

    if (Test-IsWindowsHost) {
        Write-Warning "EAS local para Android no tiene soporte oficial en Windows. Uso fallback nativo local. Si quieres EAS local estandar en Windows, usa WSL."
        Invoke-WindowsFallbackAndroidBuild -Root $root -OutputPath $outputTarget
    }
    else {
        Invoke-EasLocalAndroidBuild -OutputPath $outputTarget
    }

    if (-not (Test-Path $outputTarget)) {
        throw "No se genero artefacto Android esperado: $outputTarget"
    }

    Write-Host "Artefacto listo: $outputTarget"
}
finally {
    Pop-Location
}
