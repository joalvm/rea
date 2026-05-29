#Requires -Version 5.1
[CmdletBinding()]
param(
    [string]$ReferenceDir,
    [string]$OutputDir,
    [switch]$SkipPotraceDownload,
    [switch]$ForcePotraceDownload,
    [switch]$KeepManagedOutputs,
    [int]$PotraceDownloadTimeoutSeconds = 45
)

<#
.SYNOPSIS
    Sincroniza brand assets a partir de imagenes de referencia.
.DESCRIPTION
    - Detecta contenido util y recalcula aire interno ideal.
    - Limpia fondo blanco/casi blanco.
    - Genera PNGs canonicos para Expo, Android, iOS y web.
    - Intenta vectorizar con Potrace; si no existe en PATH, descarga binarios
      oficiales a carpeta temporal y reutiliza cache local.
#>

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 3.0

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class NativeIcon {
    [DllImport("user32.dll", CharSet = CharSet.Auto)]
    public static extern bool DestroyIcon(IntPtr handle);
}
"@

$root = Split-Path -Parent $PSScriptRoot
if (-not $PSBoundParameters.ContainsKey("ReferenceDir")) {
    $ReferenceDir = Join-Path $root "references\logo"
}
if (-not $PSBoundParameters.ContainsKey("OutputDir")) {
    $OutputDir = Join-Path $root "assets\branding"
}

$script:PotraceVersion = "1.16"
$script:PotraceCacheRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("rea-brand-tools\potrace\" + $script:PotraceVersion)
$script:ManagedOutputRelativePaths = @(
    "adaptive-foreground.png",
    "favicon.ico",
    "favicon.png",
    "icon.png",
    "logo-horizontal.png",
    "logo-mark.png",
    "logo-vertical.png",
    "splash-icon.png",
    "android",
    "ios",
    "references",
    "svg",
    "web"
)

$assetsConfig = @(
    @{
        Name = "logo-mark"
        SourceFile = "logo.png"
        Type = "mark"
        Threshold = 245
        TransitionRange = 40
        TargetContentRatioX = 0.80
        TargetContentRatioY = 0.80
        MinimumPaddingPx = 24
        GenerateSvg = $true
        SvgThreshold = 0.48
        SvgScale = 1
        SvgTurdSize = 6
        SvgAlphaMax = 1.05
        SvgOptTolerance = 0.35
        SvgUnit = 4
    },
    @{
        Name = "logo-horizontal"
        SourceFile = "logo-horizontal.png"
        Type = "horizontal"
        Threshold = 245
        TransitionRange = 40
        TargetContentRatioX = 0.88
        TargetContentRatioY = 0.84
        MinimumPaddingPx = 24
        GenerateSvg = $true
        WebWidths = @(1200, 800, 400, 200)
        SvgThreshold = 0.50
        SvgScale = 1
        SvgTurdSize = 6
        SvgAlphaMax = 1.05
        SvgOptTolerance = 0.35
        SvgUnit = 4
    },
    @{
        Name = "logo-vertical"
        SourceFile = "logo-vertical.png"
        Type = "vertical"
        Threshold = 245
        TransitionRange = 40
        TargetContentRatioX = 0.84
        TargetContentRatioY = 0.88
        MinimumPaddingPx = 24
        GenerateSvg = $true
        WebHeights = @(1200, 800, 600)
        SvgThreshold = 0.50
        SvgScale = 1
        SvgTurdSize = 6
        SvgAlphaMax = 1.05
        SvgOptTolerance = 0.35
        SvgUnit = 4
    }
)

function New-Directory {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }

    return $Path
}

function Get-ConfigValue {
    param(
        [Parameter(Mandatory)][hashtable]$Config,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)]$Default
    )

    if ($Config.ContainsKey($Name) -and $null -ne $Config[$Name]) {
        return $Config[$Name]
    }

    return $Default
}

function ConvertTo-InvariantString {
    param([Parameter(Mandatory)]$Value)

    return [System.Convert]::ToString($Value, [System.Globalization.CultureInfo]::InvariantCulture)
}

function Remove-PathIfExists {
    param([Parameter(Mandatory)][string]$Path)

    if (Test-Path -LiteralPath $Path) {
        try {
            Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
        }
        catch [System.IO.FileNotFoundException] {
            return
        }
        catch [System.Management.Automation.ItemNotFoundException] {
            return
        }
    }
}

function Save-Png {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Bitmap,
        [Parameter(Mandatory)][string]$Path
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        New-Directory $parent | Out-Null
    }
    if (Test-Path -LiteralPath $Path) {
        Remove-Item -LiteralPath $Path -Force
    }

    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

function Convert-ToArgbBitmap {
    param([Parameter(Mandatory)][System.Drawing.Image]$Image)

    $bitmap = New-Object System.Drawing.Bitmap $Image.Width, $Image.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($Image, 0, 0, $Image.Width, $Image.Height)
    }
    finally {
        $graphics.Dispose()
    }

    return $bitmap
}

function Get-WhiteChannelScore {
    param(
        [byte]$Red,
        [byte]$Green,
        [byte]$Blue
    )

    return [Math]::Min($Red, [Math]::Min($Green, $Blue))
}

function Get-ContentBounds {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Bitmap,
        [int]$Threshold = 245,
        [int]$AlphaCutoff = 10
    )

    $work = Convert-ToArgbBitmap -Image $Bitmap
    try {
        $width = $work.Width
        $height = $work.Height
        $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
        $data = $work.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $work.PixelFormat)

        try {
            $stride = [Math]::Abs($data.Stride)
            $bytes = $stride * $height
            $buffer = New-Object byte[] $bytes
            [Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buffer, 0, $bytes)
        }
        finally {
            $work.UnlockBits($data)
        }

        $minX = $width
        $minY = $height
        $maxX = -1
        $maxY = -1

        for ($y = 0; $y -lt $height; $y++) {
            $rowOffset = $y * $stride

            for ($x = 0; $x -lt $width; $x++) {
                $index = $rowOffset + ($x * 4)
                $blue = $buffer[$index]
                $green = $buffer[$index + 1]
                $red = $buffer[$index + 2]
                $alpha = $buffer[$index + 3]

                if ($alpha -lt $AlphaCutoff) {
                    continue
                }

                if ((Get-WhiteChannelScore -Red $red -Green $green -Blue $blue) -lt $Threshold) {
                    if ($x -lt $minX) { $minX = $x }
                    if ($x -gt $maxX) { $maxX = $x }
                    if ($y -lt $minY) { $minY = $y }
                    if ($y -gt $maxY) { $maxY = $y }
                }
            }
        }

        if ($maxX -lt 0 -or $maxY -lt 0) {
            return $null
        }

        return [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
    }
    finally {
        $work.Dispose()
    }
}

function New-CroppedImage {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][System.Drawing.Rectangle]$Bounds,
        [double]$TargetContentRatioX = 0.85,
        [double]$TargetContentRatioY = 0.85,
        [int]$MinimumPaddingPx = 0
    )

    $ratioX = [Math]::Max(0.05, [Math]::Min($TargetContentRatioX, 0.98))
    $ratioY = [Math]::Max(0.05, [Math]::Min($TargetContentRatioY, 0.98))

    $contentWidth = $Bounds.Width
    $contentHeight = $Bounds.Height
    $canvasWidth = [int][Math]::Ceiling($contentWidth / $ratioX)
    $canvasHeight = [int][Math]::Ceiling($contentHeight / $ratioY)

    $canvasWidth = [Math]::Max($canvasWidth, $contentWidth + ($MinimumPaddingPx * 2))
    $canvasHeight = [Math]::Max($canvasHeight, $contentHeight + ($MinimumPaddingPx * 2))

    $centerX = $Bounds.X + ($contentWidth / 2.0)
    $centerY = $Bounds.Y + ($contentHeight / 2.0)

    $left = [int][Math]::Round($centerX - ($canvasWidth / 2.0))
    $top = [int][Math]::Round($centerY - ($canvasHeight / 2.0))
    $right = $left + $canvasWidth
    $bottom = $top + $canvasHeight

    $srcLeft = [Math]::Max(0, $left)
    $srcTop = [Math]::Max(0, $top)
    $srcRight = [Math]::Min($Source.Width, $right)
    $srcBottom = [Math]::Min($Source.Height, $bottom)

    $drawWidth = $srcRight - $srcLeft
    $drawHeight = $srcBottom - $srcTop
    $destLeft = $srcLeft - $left
    $destTop = $srcTop - $top

    $result = New-Object System.Drawing.Bitmap $canvasWidth, $canvasHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($result)
    try {
        $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

        $srcRect = New-Object System.Drawing.Rectangle $srcLeft, $srcTop, $drawWidth, $drawHeight
        $destRect = New-Object System.Drawing.Rectangle $destLeft, $destTop, $drawWidth, $drawHeight
        $graphics.DrawImage($Source, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    }
    finally {
        $graphics.Dispose()
    }

    return $result
}

function Remove-WhiteBackground {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [int]$Threshold = 245,
        [int]$TransitionRange = 40,
        [int]$AlphaCutoff = 10
    )

    $work = Convert-ToArgbBitmap -Image $Source
    $result = New-Object System.Drawing.Bitmap $work.Width, $work.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

    try {
        $rect = New-Object System.Drawing.Rectangle 0, 0, $work.Width, $work.Height
        $srcData = $work.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $work.PixelFormat)
        $dstData = $result.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, $result.PixelFormat)

        try {
            $srcStride = [Math]::Abs($srcData.Stride)
            $dstStride = [Math]::Abs($dstData.Stride)
            $srcBytes = $srcStride * $work.Height
            $dstBytes = $dstStride * $result.Height
            $srcBuffer = New-Object byte[] $srcBytes
            $dstBuffer = New-Object byte[] $dstBytes

            [Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBuffer, 0, $srcBytes)
            $transitionStart = [Math]::Max(0, $Threshold - $TransitionRange)

            for ($y = 0; $y -lt $work.Height; $y++) {
                $srcRow = $y * $srcStride
                $dstRow = $y * $dstStride

                for ($x = 0; $x -lt $work.Width; $x++) {
                    $srcIndex = $srcRow + ($x * 4)
                    $dstIndex = $dstRow + ($x * 4)

                    $blue = $srcBuffer[$srcIndex]
                    $green = $srcBuffer[$srcIndex + 1]
                    $red = $srcBuffer[$srcIndex + 2]
                    $alpha = $srcBuffer[$srcIndex + 3]

                    if ($alpha -lt $AlphaCutoff) {
                        continue
                    }

                    $whiteScore = Get-WhiteChannelScore -Red $red -Green $green -Blue $blue
                    if ($whiteScore -ge $Threshold) {
                        continue
                    }

                    $factor = 1.0
                    if ($whiteScore -ge $transitionStart -and $TransitionRange -gt 0) {
                        $factor = ($Threshold - $whiteScore) / [double]$TransitionRange
                    }

                    $factor = [Math]::Max(0.0, [Math]::Min($factor, 1.0))
                    $alphaFactor = ($alpha / 255.0) * $factor

                    $dstBuffer[$dstIndex] = [byte][Math]::Round($blue * $factor)
                    $dstBuffer[$dstIndex + 1] = [byte][Math]::Round($green * $factor)
                    $dstBuffer[$dstIndex + 2] = [byte][Math]::Round($red * $factor)
                    $dstBuffer[$dstIndex + 3] = [byte][Math]::Round(255 * $alphaFactor)
                }
            }

            [Runtime.InteropServices.Marshal]::Copy($dstBuffer, 0, $dstData.Scan0, $dstBytes)
        }
        finally {
            $work.UnlockBits($srcData)
            $result.UnlockBits($dstData)
        }

        return $result
    }
    finally {
        $work.Dispose()
    }
}

function Save-CanvasImage {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$Destination,
        [Parameter(Mandatory)][int]$Width,
        [Parameter(Mandatory)][int]$Height,
        [Parameter(Mandatory)][System.Drawing.Color]$Background,
        [double]$Scale = 0.84,
        [double]$Padding = 0.0
    )

    $canvas = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)

    try {
        if ($Background.A -eq 0) {
            $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
        else {
            $graphics.Clear($Background)
        }

        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

        $effectiveScale = $Scale * (1.0 - $Padding)
        $maxWidth = [int][Math]::Round($Width * $effectiveScale)
        $maxHeight = [int][Math]::Round($Height * $effectiveScale)
        $ratio = [Math]::Min($maxWidth / [double]$Source.Width, $maxHeight / [double]$Source.Height)

        $drawWidth = [int][Math]::Round($Source.Width * $ratio)
        $drawHeight = [int][Math]::Round($Source.Height * $ratio)
        $left = [int][Math]::Round(($Width - $drawWidth) / 2.0)
        $top = [int][Math]::Round(($Height - $drawHeight) / 2.0)

        $graphics.DrawImage($Source, $left, $top, $drawWidth, $drawHeight)
        Save-Png -Bitmap $canvas -Path $Destination
    }
    finally {
        $graphics.Dispose()
        $canvas.Dispose()
    }
}

function Save-ResizedImage {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$Destination,
        [Parameter(Mandatory)][int]$MaxWidth,
        [Parameter(Mandatory)][int]$MaxHeight
    )

    $ratio = [Math]::Min($MaxWidth / [double]$Source.Width, $MaxHeight / [double]$Source.Height)
    $newWidth = [int][Math]::Round($Source.Width * $ratio)
    $newHeight = [int][Math]::Round($Source.Height * $ratio)

    $canvas = New-Object System.Drawing.Bitmap $newWidth, $newHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
        $graphics.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($Source, 0, 0, $newWidth, $newHeight)

        Save-Png -Bitmap $canvas -Path $Destination
    }
    finally {
        $graphics.Dispose()
        $canvas.Dispose()
    }
}

function Save-FaviconIco {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$Destination
    )

    if (Test-Path -LiteralPath $Destination) {
        Remove-Item -LiteralPath $Destination -Force
    }

    $iconBitmap = New-Object System.Drawing.Bitmap $Source, (New-Object System.Drawing.Size 256, 256)
    $iconHandle = $iconBitmap.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    $stream = [System.IO.File]::Create($Destination)

    try {
        $icon.Save($stream)
    }
    finally {
        $stream.Dispose()
        $icon.Dispose()
        $iconBitmap.Dispose()
        [NativeIcon]::DestroyIcon($iconHandle) | Out-Null
    }
}

function Save-TraceMaskBitmap {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$Path,
        [int]$AlphaCutoff = 6
    )

    if (Test-Path -LiteralPath $Path) {
        Remove-Item -LiteralPath $Path -Force
    }

    $argb = Convert-ToArgbBitmap -Image $Source
    $mask = New-Object System.Drawing.Bitmap $Source.Width, $Source.Height, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    try {
        $rect = New-Object System.Drawing.Rectangle 0, 0, $argb.Width, $argb.Height
        $srcData = $argb.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, $argb.PixelFormat)
        $dstData = $mask.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, $mask.PixelFormat)

        try {
            $srcStride = [Math]::Abs($srcData.Stride)
            $dstStride = [Math]::Abs($dstData.Stride)
            $srcBytes = $srcStride * $argb.Height
            $dstBytes = $dstStride * $mask.Height
            $srcBuffer = New-Object byte[] $srcBytes
            $dstBuffer = New-Object byte[] $dstBytes

            [Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBuffer, 0, $srcBytes)

            for ($y = 0; $y -lt $argb.Height; $y++) {
                $srcRow = $y * $srcStride
                $dstRow = $y * $dstStride

                for ($x = 0; $x -lt $argb.Width; $x++) {
                    $srcIndex = $srcRow + ($x * 4)
                    $dstIndex = $dstRow + ($x * 3)
                    $alpha = $srcBuffer[$srcIndex + 3]

                    $value = 255
                    if ($alpha -gt $AlphaCutoff) {
                        $value = 255 - $alpha
                    }

                    $dstBuffer[$dstIndex] = [byte]$value
                    $dstBuffer[$dstIndex + 1] = [byte]$value
                    $dstBuffer[$dstIndex + 2] = [byte]$value
                }
            }

            [Runtime.InteropServices.Marshal]::Copy($dstBuffer, 0, $dstData.Scan0, $dstBytes)
        }
        finally {
            $argb.UnlockBits($srcData)
            $mask.UnlockBits($dstData)
        }

        $mask.Save($Path, [System.Drawing.Imaging.ImageFormat]::Bmp)
    }
    finally {
        $argb.Dispose()
        $mask.Dispose()
    }
}

function Resolve-CommandExecutable {
    param([Parameter(Mandatory)][string[]]$Names)

    foreach ($name in $Names) {
        $command = Get-Command $name -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $command) {
            continue
        }

        if ($command.PSObject.Properties.Match("Path").Count -gt 0 -and $command.Path) {
            return $command.Path
        }
        if ($command.PSObject.Properties.Match("Source").Count -gt 0 -and $command.Source) {
            return $command.Source
        }
        if ($command.Definition) {
            return $command.Definition
        }
    }

    return $null
}

function Find-Executable {
    param(
        [Parameter(Mandatory)][string]$Root,
        [Parameter(Mandatory)][string]$Name
    )

    if (-not (Test-Path -LiteralPath $Root)) {
        return $null
    }

    $match = Get-ChildItem -Path $Root -Filter $Name -File -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName

    return $match
}

function Get-PotraceDownloadInfo {
    $architecture = if ([System.Environment]::Is64BitOperatingSystem) { "win64" } else { "win32" }
    $fileName = "potrace-$($script:PotraceVersion).$architecture.zip"

    return @{
        Architecture = $architecture
        FileName = $fileName
        Url = "https://potrace.sourceforge.net/download/$($script:PotraceVersion)/$fileName"
    }
}

function Install-PotraceToolchain {
    param(
        [switch]$ForceDownload,
        [int]$TimeoutSeconds = 45
    )

    $downloadInfo = Get-PotraceDownloadInfo
    $toolRoot = New-Directory (Join-Path $script:PotraceCacheRoot $downloadInfo.Architecture)
    $binDir = Join-Path $toolRoot "bin"
    $zipPath = Join-Path $toolRoot $downloadInfo.FileName
    $extractDir = Join-Path $toolRoot "extract"
    $potraceTarget = Join-Path $binDir "potrace.exe"
    $mkbitmapTarget = Join-Path $binDir "mkbitmap.exe"

    if ((Test-Path -LiteralPath $potraceTarget) -and -not $ForceDownload) {
        return @{
            PotracePath = $potraceTarget
            MkbitmapPath = if (Test-Path -LiteralPath $mkbitmapTarget) { $mkbitmapTarget } else { $null }
            Source = "cache"
        }
    }

    New-Directory $toolRoot | Out-Null
    Remove-PathIfExists -Path $binDir
    Remove-PathIfExists -Path $extractDir
    New-Directory $binDir | Out-Null
    New-Directory $extractDir | Out-Null

    Write-Host "potrace no encontrado. Descargando binarios oficiales a cache temporal..." -ForegroundColor Yellow

    try {
        Invoke-WebRequest -Uri $downloadInfo.Url -OutFile $zipPath -UseBasicParsing -TimeoutSec $TimeoutSeconds
        Expand-Archive -LiteralPath $zipPath -DestinationPath $extractDir -Force

        $downloadedPotrace = Find-Executable -Root $extractDir -Name "potrace.exe"
        $downloadedMkbitmap = Find-Executable -Root $extractDir -Name "mkbitmap.exe"

        if (-not $downloadedPotrace) {
            throw "No aparecio potrace.exe tras extraer $($downloadInfo.FileName)."
        }

        Copy-Item -LiteralPath $downloadedPotrace -Destination $potraceTarget -Force
        if ($downloadedMkbitmap) {
            Copy-Item -LiteralPath $downloadedMkbitmap -Destination $mkbitmapTarget -Force
        }

        return @{
            PotracePath = $potraceTarget
            MkbitmapPath = if (Test-Path -LiteralPath $mkbitmapTarget) { $mkbitmapTarget } else { $null }
            Source = "download"
        }
    }
    catch {
        Write-Warning "No pude descargar o preparar Potrace automaticamente: $($_.Exception.Message)"
        return $null
    }
}

function Resolve-PotraceToolchain {
    param(
        [switch]$ForceDownload,
        [switch]$SkipDownload,
        [int]$TimeoutSeconds = 45
    )

    if (-not $ForceDownload) {
        $potracePath = Resolve-CommandExecutable -Names @("potrace.exe", "potrace")
        if ($potracePath) {
            $mkbitmapPath = Resolve-CommandExecutable -Names @("mkbitmap.exe", "mkbitmap")
            if (-not $mkbitmapPath) {
                $mkbitmapSibling = Join-Path (Split-Path -Parent $potracePath) "mkbitmap.exe"
                if (Test-Path -LiteralPath $mkbitmapSibling) {
                    $mkbitmapPath = $mkbitmapSibling
                }
            }

            return @{
                PotracePath = $potracePath
                MkbitmapPath = $mkbitmapPath
                Source = "path"
            }
        }
    }

    $downloadInfo = Get-PotraceDownloadInfo
    $cacheBinDir = Join-Path (Join-Path $script:PotraceCacheRoot $downloadInfo.Architecture) "bin"
    $cachedPotrace = Join-Path $cacheBinDir "potrace.exe"
    $cachedMkbitmap = Join-Path $cacheBinDir "mkbitmap.exe"

    if ((Test-Path -LiteralPath $cachedPotrace) -and -not $ForceDownload) {
        return @{
            PotracePath = $cachedPotrace
            MkbitmapPath = if (Test-Path -LiteralPath $cachedMkbitmap) { $cachedMkbitmap } else { $null }
            Source = "cache"
        }
    }

    if ($SkipDownload) {
        return $null
    }

    return Install-PotraceToolchain -ForceDownload:$ForceDownload -TimeoutSeconds $TimeoutSeconds
}

function Convert-SvgToCurrentColor {
    param(
        [Parameter(Mandatory)][string]$SvgContent,
        [string]$Id = ""
    )

    $svg = $SvgContent -replace '(?s)<\?xml[^>]*>\s*', ''
    $svg = $svg -replace '(?s)<!DOCTYPE[^>]*>\s*', ''
    $svg = $svg -replace '(?is)<metadata>.*?</metadata>', ''
    $svg = $svg -replace '(?is)<title>.*?</title>', ''
    $svg = $svg -replace '(?is)<desc>.*?</desc>', ''
    $svg = $svg -replace '(?s)<!--.*?-->', ''
    $svg = $svg -replace '\sversion="[^"]*"', ''
    $svg = $svg -replace '\swidth="[^"]*"', ''
    $svg = $svg -replace '\sheight="[^"]*"', ''
    $svg = $svg -replace '\spreserveAspectRatio="[^"]*"', ''
    $svg = $svg -replace '\sfill="[^"]*"', ''
    $svg = $svg -replace '\sstroke="[^"]*"', ''
    $svg = $svg -replace '\sfill-opacity="[^"]*"', ''
    $svg = $svg -replace '\sstroke-width="[^"]*"', ''
    $svg = $svg -replace '\sstroke-linecap="[^"]*"', ''
    $svg = $svg -replace '\sstroke-linejoin="[^"]*"', ''

    $attrs = @('fill="currentColor"')
    if ($Id) {
        $attrs += "id=`"$Id`""
        $attrs += 'class="brand-asset"'
    }

    $svg = $svg -replace '(<svg\b[^>]*)>', ("`$1 " + ($attrs -join " ") + ">")
    $svg = $svg -replace '\r?\n', ' '
    $svg = $svg -replace '>\s+<', '><'
    $svg = $svg -replace '\s{2,}', ' '
    $svg = [regex]::Replace($svg, '(?<num>-?\d+)\.0+\b', '${num}')
    $svg = [regex]::Replace($svg, '(?<int>-?\d+)\.(?<frac>\d*?[1-9])0+\b', '${int}.${frac}')
    $svg = $svg.Trim()

    return $svg
}

function Export-SvgAsset {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$OutputPath,
        [Parameter(Mandatory)][hashtable]$Asset,
        [Parameter(Mandatory)]$Toolchain
    )

    if (-not $Toolchain -or -not $Toolchain.PotracePath) {
        return $false
    }

    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("rea-brand-trace-" + [Guid]::NewGuid().ToString("N"))
    $tempBmp = Join-Path $tempRoot "input.bmp"
    $tempPbm = Join-Path $tempRoot "input.pbm"
    $tempSvg = Join-Path $tempRoot "output.svg"
    $traceInput = $tempBmp

    $scale = [int](Get-ConfigValue -Config $Asset -Name "SvgScale" -Default 2)
    $threshold = ConvertTo-InvariantString (Get-ConfigValue -Config $Asset -Name "SvgThreshold" -Default 0.48)
    $turdSize = [int](Get-ConfigValue -Config $Asset -Name "SvgTurdSize" -Default 3)
    $alphaMax = ConvertTo-InvariantString (Get-ConfigValue -Config $Asset -Name "SvgAlphaMax" -Default 1.0)
    $optTolerance = ConvertTo-InvariantString (Get-ConfigValue -Config $Asset -Name "SvgOptTolerance" -Default 0.20)
    $unit = [int](Get-ConfigValue -Config $Asset -Name "SvgUnit" -Default 10)

    New-Directory $tempRoot | Out-Null

    try {
        Save-TraceMaskBitmap -Source $Source -Path $tempBmp

        if ($Toolchain.MkbitmapPath) {
            $mkbitmapArgs = @(
                "-s", (ConvertTo-InvariantString $scale),
                "-t", $threshold,
                "-o", $tempPbm,
                $tempBmp
            )

            & $Toolchain.MkbitmapPath @mkbitmapArgs
            if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $tempPbm)) {
                throw "mkbitmap fallo preparando $($Asset.Name)."
            }

            $traceInput = $tempPbm
        }

        $potraceArgs = @(
            "-s",
            "--flat",
            "-t", (ConvertTo-InvariantString $turdSize),
            "-a", $alphaMax,
            "-O", $optTolerance,
            "-u", (ConvertTo-InvariantString $unit),
            "-o", $tempSvg
        )

        if (-not $Toolchain.MkbitmapPath) {
            $potraceArgs += @("-k", $threshold)
        }

        $potraceArgs += $traceInput
        & $Toolchain.PotracePath @potraceArgs

        if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $tempSvg)) {
            throw "potrace fallo generando SVG para $($Asset.Name)."
        }

        $svgContent = Get-Content -LiteralPath $tempSvg -Raw
        $svgContent = Convert-SvgToCurrentColor -SvgContent $svgContent -Id $Asset.Name
        New-Directory (Split-Path -Parent $OutputPath) | Out-Null
        Set-Content -LiteralPath $OutputPath -Value $svgContent -Encoding utf8 -NoNewline

        return $true
    }
    finally {
        Remove-PathIfExists -Path $tempRoot
    }
}

function Reset-ManagedOutputs {
    param([Parameter(Mandatory)][string]$BaseDir)

    New-Directory $BaseDir | Out-Null
    foreach ($relativePath in $script:ManagedOutputRelativePaths) {
        Remove-PathIfExists -Path (Join-Path $BaseDir $relativePath)
    }
}

function Export-AndroidAssets {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$BaseDir
    )

    Save-CanvasImage -Source $Source -Destination (Join-Path $BaseDir "adaptive-foreground.png") `
        -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78 -Padding 0.05

    $androidDir = New-Directory (Join-Path $BaseDir "android")
    Save-CanvasImage -Source $Source -Destination (Join-Path $androidDir "ic_launcher_foreground.png") `
        -Width 432 -Height 432 -Background ([System.Drawing.Color]::Transparent) -Scale 0.66

    $background = New-Object System.Drawing.Bitmap 432, 432, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        Save-Png -Bitmap $background -Path (Join-Path $androidDir "ic_launcher_background.png")
    }
    finally {
        $background.Dispose()
    }

    $sizes = @{
        "mipmap-mdpi" = 48
        "mipmap-hdpi" = 72
        "mipmap-xhdpi" = 96
        "mipmap-xxhdpi" = 144
        "mipmap-xxxhdpi" = 192
    }

    foreach ($folder in $sizes.Keys) {
        $size = $sizes[$folder]
        $folderPath = New-Directory (Join-Path $androidDir $folder)

        Save-CanvasImage -Source $Source -Destination (Join-Path $folderPath "ic_launcher.png") `
            -Width $size -Height $size -Background ([System.Drawing.Color]::Transparent) -Scale 0.80
        Save-CanvasImage -Source $Source -Destination (Join-Path $folderPath "ic_launcher_round.png") `
            -Width $size -Height $size -Background ([System.Drawing.Color]::Transparent) -Scale 0.75 -Padding 0.02
    }
}

function Export-IosAssets {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$BaseDir
    )

    $iosDir = New-Directory (Join-Path $BaseDir "ios\AppIcon.appiconset")
    $icons = @(
        @{ Size = 20; Scale = 2; Id = "icon-20@2x"; Idiom = "iphone" },
        @{ Size = 20; Scale = 3; Id = "icon-20@3x"; Idiom = "iphone" },
        @{ Size = 29; Scale = 2; Id = "icon-29@2x"; Idiom = "iphone" },
        @{ Size = 29; Scale = 3; Id = "icon-29@3x"; Idiom = "iphone" },
        @{ Size = 40; Scale = 2; Id = "icon-40@2x"; Idiom = "iphone" },
        @{ Size = 40; Scale = 3; Id = "icon-40@3x"; Idiom = "iphone" },
        @{ Size = 60; Scale = 2; Id = "icon-60@2x"; Idiom = "iphone" },
        @{ Size = 60; Scale = 3; Id = "icon-60@3x"; Idiom = "iphone" },
        @{ Size = 29; Scale = 1; Id = "icon-29"; Idiom = "ipad" },
        @{ Size = 40; Scale = 1; Id = "icon-40"; Idiom = "ipad" },
        @{ Size = 76; Scale = 1; Id = "icon-76"; Idiom = "ipad" },
        @{ Size = 76; Scale = 2; Id = "icon-76@2x"; Idiom = "ipad" },
        @{ Size = 83.5; Scale = 2; Id = "icon-83.5@2x"; Idiom = "ipad" },
        @{ Size = 1024; Scale = 1; Id = "icon-1024"; Idiom = "ios-marketing" }
    )

    $images = @()
    foreach ($icon in $icons) {
        $pixels = [int][Math]::Round($icon.Size * $icon.Scale)
        $fileName = "$($icon.Id).png"
        $background = if ($icon.Size -eq 1024) { [System.Drawing.Color]::White } else { [System.Drawing.Color]::Transparent }

        Save-CanvasImage -Source $Source -Destination (Join-Path $iosDir $fileName) `
            -Width $pixels -Height $pixels -Background $background -Scale 0.82

        $images += @{
            size = "$($icon.Size)x$($icon.Size)"
            idiom = $icon.Idiom
            filename = $fileName
            scale = "$($icon.Scale)x"
        }
    }

    @{
        images = $images
        info = @{
            version = 1
            author = "xcode"
        }
    } | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $iosDir "Contents.json") -Encoding utf8
}

function Export-WebAssets {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$BaseDir,
        [Parameter(Mandatory)][hashtable]$Asset
    )

    $webDir = New-Directory (Join-Path $BaseDir "web")

    switch ($Asset.Type) {
        "mark" {
            Save-Png -Bitmap $Source -Path (Join-Path $BaseDir "logo-mark.png")
            Save-Png -Bitmap $Source -Path (Join-Path $webDir "logo-mark.png")

            Save-CanvasImage -Source $Source -Destination (Join-Path $BaseDir "icon.png") `
                -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::White) -Scale 0.82
            Save-CanvasImage -Source $Source -Destination (Join-Path $webDir "icon.png") `
                -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::White) -Scale 0.82

            Save-CanvasImage -Source $Source -Destination (Join-Path $BaseDir "splash-icon.png") `
                -Width 512 -Height 512 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78 -Padding 0.05
            Save-CanvasImage -Source $Source -Destination (Join-Path $webDir "splash-icon.png") `
                -Width 512 -Height 512 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78 -Padding 0.05

            Save-CanvasImage -Source $Source -Destination (Join-Path $BaseDir "favicon.png") `
                -Width 256 -Height 256 -Background ([System.Drawing.Color]::Transparent) -Scale 0.80
            Save-CanvasImage -Source $Source -Destination (Join-Path $webDir "favicon.png") `
                -Width 256 -Height 256 -Background ([System.Drawing.Color]::Transparent) -Scale 0.80

            $faviconBitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $BaseDir "favicon.png"))
            try {
                Save-FaviconIco -Source $faviconBitmap -Destination (Join-Path $BaseDir "favicon.ico")
                Save-FaviconIco -Source $faviconBitmap -Destination (Join-Path $webDir "favicon.ico")
            }
            finally {
                $faviconBitmap.Dispose()
            }
        }

        "horizontal" {
            Save-Png -Bitmap $Source -Path (Join-Path $BaseDir "logo-horizontal.png")
            Save-Png -Bitmap $Source -Path (Join-Path $webDir "logo-horizontal.png")

            foreach ($width in (Get-ConfigValue -Config $Asset -Name "WebWidths" -Default @(1200, 800, 400, 200))) {
                Save-ResizedImage -Source $Source -Destination (Join-Path $webDir ("logo-horizontal-{0}.png" -f $width)) `
                    -MaxWidth $width -MaxHeight 800
            }
        }

        "vertical" {
            Save-Png -Bitmap $Source -Path (Join-Path $BaseDir "logo-vertical.png")
            Save-Png -Bitmap $Source -Path (Join-Path $webDir "logo-vertical.png")

            foreach ($height in (Get-ConfigValue -Config $Asset -Name "WebHeights" -Default @(1200, 800, 600))) {
                Save-ResizedImage -Source $Source -Destination (Join-Path $webDir ("logo-vertical-{0}.png" -f $height)) `
                    -MaxWidth 800 -MaxHeight $height
            }
        }
    }
}

function Test-SourcesAvailable {
    param([Parameter(Mandatory)][hashtable[]]$Assets)

    $missing = @()
    foreach ($asset in $Assets) {
        $sourcePath = Join-Path $ReferenceDir $asset.SourceFile
        if (-not (Test-Path -LiteralPath $sourcePath)) {
            $missing += $sourcePath
        }
    }

    if ($missing.Count -gt 0) {
        throw "Faltan referencias obligatorias:`n - " + ($missing -join "`n - ")
    }
}

$potraceToolchain = $null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SYNC BRAND ASSETS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Referencia: $ReferenceDir" -ForegroundColor Gray
Write-Host "Salida:     $OutputDir" -ForegroundColor Gray

Test-SourcesAvailable -Assets $assetsConfig

if (-not $KeepManagedOutputs) {
    Write-Host "Limpiando outputs gestionados..." -ForegroundColor Gray
    Reset-ManagedOutputs -BaseDir $OutputDir
}

New-Directory $OutputDir | Out-Null
$referenceOutputDir = New-Directory (Join-Path $OutputDir "references")
$svgOutputDir = New-Directory (Join-Path $OutputDir "svg")

$potraceToolchain = Resolve-PotraceToolchain `
    -ForceDownload:$ForcePotraceDownload `
    -SkipDownload:$SkipPotraceDownload `
    -TimeoutSeconds $PotraceDownloadTimeoutSeconds

if ($potraceToolchain -and $potraceToolchain.PotracePath) {
    $mkbitmapLabel = if ($potraceToolchain.MkbitmapPath) { " + mkbitmap" } else { "" }
    Write-Host ("Potrace listo via {0}{1}." -f $potraceToolchain.Source, $mkbitmapLabel) -ForegroundColor Green
}
else {
    Write-Host "Potrace no disponible. SVGs se omitiran; PNGs siguen." -ForegroundColor Yellow
}

foreach ($asset in $assetsConfig) {
    $sourcePath = Join-Path $ReferenceDir $asset.SourceFile
    $sourceBitmap = $null
    $croppedBitmap = $null
    $cleanBitmap = $null

    Write-Host ""
    Write-Host ("Procesando: {0}" -f $asset.Name) -ForegroundColor Cyan

    try {
        $sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
        $bounds = Get-ContentBounds -Bitmap $sourceBitmap -Threshold ([int](Get-ConfigValue -Config $asset -Name "Threshold" -Default 245))

        if (-not $bounds) {
            throw "No se detecto contenido util en $($asset.SourceFile)."
        }

        Write-Host ("  Contenido: {0}x{1} en ({2},{3})" -f $bounds.Width, $bounds.Height, $bounds.X, $bounds.Y) -ForegroundColor Gray

        $croppedBitmap = New-CroppedImage `
            -Source $sourceBitmap `
            -Bounds $bounds `
            -TargetContentRatioX ([double](Get-ConfigValue -Config $asset -Name "TargetContentRatioX" -Default 0.85)) `
            -TargetContentRatioY ([double](Get-ConfigValue -Config $asset -Name "TargetContentRatioY" -Default 0.85)) `
            -MinimumPaddingPx ([int](Get-ConfigValue -Config $asset -Name "MinimumPaddingPx" -Default 0))

        Save-Png -Bitmap $croppedBitmap -Path (Join-Path $referenceOutputDir ("{0}-cropped.png" -f $asset.Name))

        $cleanBitmap = Remove-WhiteBackground `
            -Source $croppedBitmap `
            -Threshold ([int](Get-ConfigValue -Config $asset -Name "Threshold" -Default 245)) `
            -TransitionRange ([int](Get-ConfigValue -Config $asset -Name "TransitionRange" -Default 40))

        Save-Png -Bitmap $cleanBitmap -Path (Join-Path $referenceOutputDir ("{0}-clean.png" -f $asset.Name))

        Export-WebAssets -Source $cleanBitmap -BaseDir $OutputDir -Asset $asset

        if ($asset.Type -eq "mark") {
            Export-AndroidAssets -Source $cleanBitmap -BaseDir $OutputDir
            Export-IosAssets -Source $cleanBitmap -BaseDir $OutputDir
        }

        if ((Get-ConfigValue -Config $asset -Name "GenerateSvg" -Default $false) -and $potraceToolchain) {
            $svgPath = Join-Path $svgOutputDir ("{0}.svg" -f $asset.Name)
            $generated = Export-SvgAsset -Source $cleanBitmap -OutputPath $svgPath -Asset $asset -Toolchain $potraceToolchain
            if ($generated) {
                Write-Host ("  SVG: {0}" -f $svgPath) -ForegroundColor Green
            }
        }

        Write-Host ("  OK: {0}" -f $asset.Name) -ForegroundColor Green
    }
    finally {
        if ($cleanBitmap) { $cleanBitmap.Dispose() }
        if ($croppedBitmap) { $croppedBitmap.Dispose() }
        if ($sourceBitmap) { $sourceBitmap.Dispose() }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BRAND ASSETS LISTOS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  root -> icon.png, splash-icon.png, adaptive-foreground.png, favicon.ico" -ForegroundColor Gray
Write-Host "  web  -> web\\logo-horizontal-*.png, web\\logo-vertical-*.png" -ForegroundColor Gray
Write-Host "  ios  -> ios\\AppIcon.appiconset\\Contents.json" -ForegroundColor Gray
Write-Host "  svg  -> svg\\*.svg (si Potrace disponible)" -ForegroundColor Gray
