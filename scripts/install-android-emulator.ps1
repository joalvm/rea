$ErrorActionPreference = "Stop"

$sdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$jdkRoot = Join-Path $env:LOCALAPPDATA "Programs\Temurin17"
$workRoot = Join-Path $env:TEMP "rea-android-setup"
$cmdlineZip = Join-Path $workRoot "commandlinetools-win.zip"
$cmdlineUrl = "https://dl.google.com/android/repository/commandlinetools-win-14742923_latest.zip"
$cmdlineSha256 = "cc610ccbe83faddb58e1aa68e8fc8743bb30aa5e83577eceb4cc168dae95f9ee"
$jdkZip = Join-Path $workRoot "temurin17-jdk.zip"
$jdkUrl = "https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse?project=jdk"
$avdName = "Rea_API_36"
$systemImage = "system-images;android-36;google_apis;x86_64"

function Add-UserPathEntry {
  param([Parameter(Mandatory = $true)][string]$PathEntry)

  $current = [Environment]::GetEnvironmentVariable("Path", "User")
  $items = @()
  if ($current) {
    $items = $current -split ";" | Where-Object { $_ }
  }

  if ($items -notcontains $PathEntry) {
    $next = (@($items) + $PathEntry) -join ";"
    [Environment]::SetEnvironmentVariable("Path", $next, "User")
  }
}

function Download-File {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$OutFile
  )

  curl.exe -L $Url -o $OutFile
  if (!(Test-Path -LiteralPath $OutFile)) {
    throw "Download failed: $Url"
  }
}

New-Item -ItemType Directory -Force -Path $workRoot, $sdkRoot, $jdkRoot | Out-Null

if (!(Test-Path -LiteralPath (Join-Path $jdkRoot "bin\java.exe"))) {
  Write-Host "Downloading JDK 17..."
  Download-File -Url $jdkUrl -OutFile $jdkZip
  $jdkExtract = Join-Path $workRoot "jdk"
  Remove-Item -LiteralPath $jdkExtract -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path $jdkExtract | Out-Null
  Expand-Archive -LiteralPath $jdkZip -DestinationPath $jdkExtract -Force
  $javaHome = Get-ChildItem -LiteralPath $jdkExtract -Directory |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "bin\java.exe") } |
    Select-Object -First 1
  if (!$javaHome) {
    throw "Could not find java.exe in downloaded JDK."
  }
  Get-ChildItem -LiteralPath $jdkRoot -Force | Remove-Item -Recurse -Force
  Copy-Item -Path (Join-Path $javaHome.FullName "*") -Destination $jdkRoot -Recurse -Force
}

[Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkRoot, "User")
$env:JAVA_HOME = $jdkRoot
$env:Path = "$jdkRoot\bin;$env:Path"
Add-UserPathEntry -PathEntry (Join-Path $jdkRoot "bin")

$cmdlineLatest = Join-Path $sdkRoot "cmdline-tools\latest"
if (!(Test-Path -LiteralPath (Join-Path $cmdlineLatest "bin\sdkmanager.bat"))) {
  Write-Host "Downloading Android SDK command-line tools..."
  Download-File -Url $cmdlineUrl -OutFile $cmdlineZip
  $hash = (Get-FileHash -LiteralPath $cmdlineZip -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($hash -ne $cmdlineSha256) {
    throw "Command-line tools SHA256 mismatch: $hash"
  }

  $toolsExtract = Join-Path $workRoot "cmdline-tools"
  Remove-Item -LiteralPath $toolsExtract -Recurse -Force -ErrorAction SilentlyContinue
  Expand-Archive -LiteralPath $cmdlineZip -DestinationPath $toolsExtract -Force
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $cmdlineLatest) | Out-Null
  Remove-Item -LiteralPath $cmdlineLatest -Recurse -Force -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force -Path $cmdlineLatest | Out-Null
  Copy-Item -Path (Join-Path $toolsExtract "cmdline-tools\*") -Destination $cmdlineLatest -Recurse -Force
}

[Environment]::SetEnvironmentVariable("ANDROID_HOME", $sdkRoot, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $sdkRoot, "User")
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot

$sdkManager = Join-Path $cmdlineLatest "bin\sdkmanager.bat"
$avdManager = Join-Path $cmdlineLatest "bin\avdmanager.bat"
$emulator = Join-Path $sdkRoot "emulator\emulator.exe"
$adb = Join-Path $sdkRoot "platform-tools\adb.exe"

Add-UserPathEntry -PathEntry (Join-Path $cmdlineLatest "bin")
Add-UserPathEntry -PathEntry (Join-Path $sdkRoot "platform-tools")
Add-UserPathEntry -PathEntry (Join-Path $sdkRoot "emulator")
$env:Path = "$cmdlineLatest\bin;$sdkRoot\platform-tools;$sdkRoot\emulator;$env:Path"

Write-Host "Installing SDK packages..."
1..80 | ForEach-Object { "y" } | & $sdkManager --sdk_root=$sdkRoot --licenses | Out-Host
& $sdkManager --sdk_root=$sdkRoot "platform-tools" "emulator" "platforms;android-36" "build-tools;36.0.0" $systemImage

if (!(& $emulator -list-avds | Select-String -SimpleMatch $avdName)) {
  Write-Host "Creating AVD $avdName..."
  "no" | & $avdManager create avd --force --name $avdName --package $systemImage --device "pixel_7"
}

Write-Host ""
Write-Host "Android emulator setup complete."
Write-Host "SDK: $sdkRoot"
Write-Host "JDK: $jdkRoot"
Write-Host "ADB:"
& $adb version
Write-Host "AVDs:"
& $emulator -list-avds
