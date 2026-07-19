[CmdletBinding()]
param(
    [string]$DeviceId,
    [switch]$Apply
)

$ErrorActionPreference = "Stop"

$adbCommand = Get-Command adb -ErrorAction Stop
$adb = $adbCommand.Source

if (-not $DeviceId) {
    $deviceLine = & $adb devices | Select-String "`tdevice$" | Select-Object -First 1
    if (-not $deviceLine) {
        throw "No hay dispositivo Android en estado device. Inicia un AVD antes de continuar."
    }

    $DeviceId = ($deviceLine.ToString() -split "\s+")[0]
}

function Invoke-DeviceAdb {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & $adb -s $DeviceId @Arguments
}

$bootCompleted = (Invoke-DeviceAdb -Arguments @("shell", "getprop", "sys.boot_completed")).Trim()
if ($bootCompleted -ne "1") {
    throw "Dispositivo $DeviceId aun no termino de iniciar (sys.boot_completed=$bootCompleted)."
}

$emulatorCommand = Get-Command emulator -ErrorAction SilentlyContinue
$acceleration = if ($emulatorCommand) {
    (& $emulatorCommand.Source -accel-check 2>&1 | Out-String).Trim()
} else {
    "emulator no esta en PATH"
}

$state = [ordered]@{
    Device = $DeviceId
    Api = (Invoke-DeviceAdb -Arguments @("shell", "getprop", "ro.build.version.sdk")).Trim()
    Avd = (Invoke-DeviceAdb -Arguments @("shell", "getprop", "ro.boot.qemu.avd_name")).Trim()
    Size = (Invoke-DeviceAdb -Arguments @("shell", "wm", "size")).Trim()
    Density = (Invoke-DeviceAdb -Arguments @("shell", "wm", "density")).Trim()
    WindowAnimation = (Invoke-DeviceAdb -Arguments @("shell", "settings", "get", "global", "window_animation_scale")).Trim()
    TransitionAnimation = (Invoke-DeviceAdb -Arguments @("shell", "settings", "get", "global", "transition_animation_scale")).Trim()
    AnimatorDuration = (Invoke-DeviceAdb -Arguments @("shell", "settings", "get", "global", "animator_duration_scale")).Trim()
    Acceleration = $acceleration
}

$state | Format-List

if (-not $Apply) {
    Write-Output "Diagnostico solamente. Usa -Apply para desactivar animaciones y evitar suspension durante flows."
    exit 0
}

Invoke-DeviceAdb -Arguments @("shell", "settings", "put", "global", "window_animation_scale", "0")
Invoke-DeviceAdb -Arguments @("shell", "settings", "put", "global", "transition_animation_scale", "0")
Invoke-DeviceAdb -Arguments @("shell", "settings", "put", "global", "animator_duration_scale", "0")
Invoke-DeviceAdb -Arguments @("shell", "settings", "put", "system", "screen_off_timeout", "2147483647")

Write-Output "Optimizacion aplicada en ${DeviceId}: animaciones desactivadas y suspension evitada durante Maestro."
