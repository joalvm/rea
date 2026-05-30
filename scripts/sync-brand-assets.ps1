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
    Regenera branding final de Rea para Expo iOS y Android.
.DESCRIPTION
    - Lee referencias base desde references/branding.
    - Detecta contenido util, recorta aire sobrante y limpia fondo blanco.
    - Genera solo assets finales usados por proyecto:
      - logos PNG para app
      - icono iOS/App Store
      - splash para iOS y Android
      - adaptive icon y notification icon para Android
      - SVG opcional en raiz si Potrace existe
    - No crea carpetas web, ios/, android/ ni referencias intermedias.
#>

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 3.0

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
if (-not $PSBoundParameters.ContainsKey("ReferenceDir")) {
    $ReferenceDir = Join-Path $root "references\branding"
}
if (-not $PSBoundParameters.ContainsKey("OutputDir")) {
    $OutputDir = Join-Path $root "assets\branding"
}

$script:PotraceVersion = "1.16"
$script:PotraceCacheRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("rea-brand-tools\potrace\" + $script:PotraceVersion)
$script:FinalOutputs = @(
    "adaptive-foreground.png",
    "adaptive-monochrome.png",
    "icon.png",
    "logo-horizontal.png",
    "logo-horizontal.svg",
    "logo-mark.png",
    "logo-mark.svg",
    "logo-vertical.png",
    "logo-vertical.svg",
    "notification-icon.png",
    "splash-icon.png"
)
$script:LegacyOutputs = @(
    "android",
    "ios",
    "references",
    "svg",
    "web",
    "favicon.ico",
    "favicon.png"
)
$script:BrandingSpecs = @(
    @{
        Name = "logo-mark"
        SourceFile = "logo.png"
        Kind = "mark"
        Threshold = 245
        TransitionRange = 40
        CropRatioX = 0.80
        CropRatioY = 0.80
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
        Kind = "horizontal"
        Threshold = 245
        TransitionRange = 40
        CropRatioX = 0.88
        CropRatioY = 0.84
        MinimumPaddingPx = 24
        GenerateSvg = $true
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
        Kind = "vertical"
        Threshold = 245
        TransitionRange = 40
        CropRatioX = 0.84
        CropRatioY = 0.88
        MinimumPaddingPx = 24
        GenerateSvg = $true
        SvgThreshold = 0.50
        SvgScale = 1
        SvgTurdSize = 6
        SvgAlphaMax = 1.05
        SvgOptTolerance = 0.35
        SvgUnit = 4
    }
)

function Ensure-Directory {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Force -Path $Path | Out-Null
    }

    return $Path
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

function Reset-ManagedOutputs {
    param([Parameter(Mandatory)][string]$BaseDir)

    Ensure-Directory $BaseDir | Out-Null
    foreach ($relativePath in ($script:FinalOutputs + $script:LegacyOutputs)) {
        Remove-PathIfExists -Path (Join-Path $BaseDir $relativePath)
    }
}

function Get-SpecValue {
    param(
        [Parameter(Mandatory)][hashtable]$Spec,
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)]$Default
    )

    if ($Spec.ContainsKey($Name) -and $null -ne $Spec[$Name]) {
        return $Spec[$Name]
    }

    return $Default
}

function ConvertTo-InvariantString {
    param([Parameter(Mandatory)]$Value)

    return [System.Convert]::ToString($Value, [System.Globalization.CultureInfo]::InvariantCulture)
}

function Save-Png {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Bitmap,
        [Parameter(Mandatory)][string]$Path
    )

    $parent = Split-Path -Parent $Path
    if ($parent) {
        Ensure-Directory $parent | Out-Null
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

function New-CroppedBitmap {
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

function New-FittedCanvasBitmap {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
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

        $effectiveScale = [Math]::Max(0.05, $Scale * (1.0 - $Padding))
        $maxWidth = [int][Math]::Round($Width * $effectiveScale)
        $maxHeight = [int][Math]::Round($Height * $effectiveScale)
        $ratio = [Math]::Min($maxWidth / [double]$Source.Width, $maxHeight / [double]$Source.Height)

        if ($ratio -le 0) {
            throw "No pude ajustar contenido dentro del canvas ${Width}x${Height}."
        }

        $drawWidth = [int][Math]::Round($Source.Width * $ratio)
        $drawHeight = [int][Math]::Round($Source.Height * $ratio)
        $left = [int][Math]::Round(($Width - $drawWidth) / 2.0)
        $top = [int][Math]::Round(($Height - $drawHeight) / 2.0)

        $graphics.DrawImage($Source, $left, $top, $drawWidth, $drawHeight)
        return $canvas
    }
    finally {
        $graphics.Dispose()
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

    $canvas = $null
    try {
        $canvas = New-FittedCanvasBitmap -Source $Source -Width $Width -Height $Height -Background $Background -Scale $Scale -Padding $Padding
        Save-Png -Bitmap $canvas -Path $Destination
    }
    finally {
        if ($canvas) {
            $canvas.Dispose()
        }
    }
}

function Save-MonochromeImage {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$Destination,
        [System.Drawing.Color]$FillColor = [System.Drawing.Color]::White,
        [int]$AlphaCutoff = 8
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

            for ($y = 0; $y -lt $work.Height; $y++) {
                $srcRow = $y * $srcStride
                $dstRow = $y * $dstStride

                for ($x = 0; $x -lt $work.Width; $x++) {
                    $srcIndex = $srcRow + ($x * 4)
                    $dstIndex = $dstRow + ($x * 4)
                    $alpha = $srcBuffer[$srcIndex + 3]

                    if ($alpha -lt $AlphaCutoff) {
                        continue
                    }

                    $dstBuffer[$dstIndex] = $FillColor.B
                    $dstBuffer[$dstIndex + 1] = $FillColor.G
                    $dstBuffer[$dstIndex + 2] = $FillColor.R
                    $dstBuffer[$dstIndex + 3] = [byte][Math]::Round(($alpha / 255.0) * $FillColor.A)
                }
            }

            [Runtime.InteropServices.Marshal]::Copy($dstBuffer, 0, $dstData.Scan0, $dstBytes)
        }
        finally {
            $work.UnlockBits($srcData)
            $result.UnlockBits($dstData)
        }

        Save-Png -Bitmap $result -Path $Destination
    }
    finally {
        $work.Dispose()
        $result.Dispose()
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
                        $value = 0
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

    return Get-ChildItem -Path $Root -Filter $Name -File -Recurse -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
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
    $toolRoot = Ensure-Directory (Join-Path $script:PotraceCacheRoot $downloadInfo.Architecture)
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

    Ensure-Directory $toolRoot | Out-Null
    Remove-PathIfExists -Path $binDir
    Remove-PathIfExists -Path $extractDir
    Ensure-Directory $binDir | Out-Null
    Ensure-Directory $extractDir | Out-Null

    Write-Host "Potrace no encontrado. Descargando binarios oficiales a cache temporal..." -ForegroundColor Yellow

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
    return $svg.Trim()
}

function Export-SvgAsset {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory)][string]$OutputPath,
        [Parameter(Mandatory)][hashtable]$Spec,
        [Parameter(Mandatory)]$Toolchain
    )

    if (-not $Toolchain -or -not $Toolchain.PotracePath) {
        return $false
    }

    $tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("rea-brand-trace-" + [Guid]::NewGuid().ToString("N"))
    $tempBmp = Join-Path $tempRoot "input.bmp"
    $tempSvg = Join-Path $tempRoot "output.svg"
    $traceInput = $tempBmp

    $threshold = ConvertTo-InvariantString (Get-SpecValue -Spec $Spec -Name "SvgThreshold" -Default 0.48)
    $turdSize = [int](Get-SpecValue -Spec $Spec -Name "SvgTurdSize" -Default 6)
    $alphaMax = ConvertTo-InvariantString (Get-SpecValue -Spec $Spec -Name "SvgAlphaMax" -Default 1.05)
    $optTolerance = ConvertTo-InvariantString (Get-SpecValue -Spec $Spec -Name "SvgOptTolerance" -Default 0.35)
    $unit = [int](Get-SpecValue -Spec $Spec -Name "SvgUnit" -Default 4)

    Ensure-Directory $tempRoot | Out-Null

    try {
        Save-TraceMaskBitmap -Source $Source -Path $tempBmp

        $potraceArgs = @(
            "-s",
            "--flat",
            "-t", (ConvertTo-InvariantString $turdSize),
            "-a", $alphaMax,
            "-O", $optTolerance,
            "-u", (ConvertTo-InvariantString $unit),
            "-o", $tempSvg
        )

        $potraceArgs += @("-k", $threshold)

        $potraceArgs += $traceInput
        & $Toolchain.PotracePath @potraceArgs

        if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $tempSvg)) {
            throw "potrace fallo generando SVG para $($Spec.Name)."
        }

        $svgContent = Get-Content -LiteralPath $tempSvg -Raw
        $svgContent = Convert-SvgToCurrentColor -SvgContent $svgContent -Id $Spec.Name
        Set-Content -LiteralPath $OutputPath -Value $svgContent -Encoding utf8 -NoNewline
        return $true
    }
    finally {
        Remove-PathIfExists -Path $tempRoot
    }
}

function Export-BrandingOutputs {
    param(
        [Parameter(Mandatory)][System.Drawing.Bitmap]$CleanBitmap,
        [Parameter(Mandatory)][hashtable]$Spec,
        [Parameter(Mandatory)][string]$BaseDir
    )

    switch ($Spec.Kind) {
        "mark" {
            Save-Png -Bitmap $CleanBitmap -Path (Join-Path $BaseDir "logo-mark.png")

            Save-CanvasImage -Source $CleanBitmap -Destination (Join-Path $BaseDir "icon.png") `
                -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::White) -Scale 0.82

            Save-CanvasImage -Source $CleanBitmap -Destination (Join-Path $BaseDir "splash-icon.png") `
                -Width 512 -Height 512 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78 -Padding 0.05

            $adaptiveForeground = $null
            $notificationCanvas = $null
            try {
                $adaptiveForeground = New-FittedCanvasBitmap -Source $CleanBitmap -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78 -Padding 0.05
                Save-Png -Bitmap $adaptiveForeground -Path (Join-Path $BaseDir "adaptive-foreground.png")
                Save-MonochromeImage -Source $adaptiveForeground -Destination (Join-Path $BaseDir "adaptive-monochrome.png")

                $notificationCanvas = New-FittedCanvasBitmap -Source $CleanBitmap -Width 96 -Height 96 -Background ([System.Drawing.Color]::Transparent) -Scale 0.72
                Save-MonochromeImage -Source $notificationCanvas -Destination (Join-Path $BaseDir "notification-icon.png")
            }
            finally {
                if ($notificationCanvas) {
                    $notificationCanvas.Dispose()
                }
                if ($adaptiveForeground) {
                    $adaptiveForeground.Dispose()
                }
            }
        }

        "horizontal" {
            Save-Png -Bitmap $CleanBitmap -Path (Join-Path $BaseDir "logo-horizontal.png")
        }

        "vertical" {
            Save-Png -Bitmap $CleanBitmap -Path (Join-Path $BaseDir "logo-vertical.png")
        }
    }
}

function Test-SourcesAvailable {
    param([Parameter(Mandatory)][hashtable[]]$Specs)

    $missing = @()
    foreach ($spec in $Specs) {
        $sourcePath = Join-Path $ReferenceDir $spec.SourceFile
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

Test-SourcesAvailable -Specs $script:BrandingSpecs

if (-not $KeepManagedOutputs) {
    Write-Host "Limpiando outputs gestionados..." -ForegroundColor Gray
    Reset-ManagedOutputs -BaseDir $OutputDir
}

Ensure-Directory $OutputDir | Out-Null

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

foreach ($spec in $script:BrandingSpecs) {
    $sourcePath = Join-Path $ReferenceDir $spec.SourceFile
    $sourceBitmap = $null
    $croppedBitmap = $null
    $cleanBitmap = $null

    Write-Host ""
    Write-Host ("Procesando: {0}" -f $spec.Name) -ForegroundColor Cyan

    try {
        $sourceBitmap = [System.Drawing.Bitmap]::FromFile($sourcePath)
        $bounds = Get-ContentBounds -Bitmap $sourceBitmap -Threshold ([int](Get-SpecValue -Spec $spec -Name "Threshold" -Default 245))

        if (-not $bounds) {
            throw "No se detecto contenido util en $($spec.SourceFile)."
        }

        Write-Host ("  Contenido: {0}x{1} en ({2},{3})" -f $bounds.Width, $bounds.Height, $bounds.X, $bounds.Y) -ForegroundColor Gray

        $croppedBitmap = New-CroppedBitmap `
            -Source $sourceBitmap `
            -Bounds $bounds `
            -TargetContentRatioX ([double](Get-SpecValue -Spec $spec -Name "CropRatioX" -Default 0.85)) `
            -TargetContentRatioY ([double](Get-SpecValue -Spec $spec -Name "CropRatioY" -Default 0.85)) `
            -MinimumPaddingPx ([int](Get-SpecValue -Spec $spec -Name "MinimumPaddingPx" -Default 0))

        $cleanBitmap = Remove-WhiteBackground `
            -Source $croppedBitmap `
            -Threshold ([int](Get-SpecValue -Spec $spec -Name "Threshold" -Default 245)) `
            -TransitionRange ([int](Get-SpecValue -Spec $spec -Name "TransitionRange" -Default 40))

        Export-BrandingOutputs -CleanBitmap $cleanBitmap -Spec $spec -BaseDir $OutputDir

        if ((Get-SpecValue -Spec $spec -Name "GenerateSvg" -Default $false) -and $potraceToolchain) {
            $svgPath = Join-Path $OutputDir ("{0}.svg" -f $spec.Name)
            $generated = Export-SvgAsset -Source $cleanBitmap -OutputPath $svgPath -Spec $spec -Toolchain $potraceToolchain
            if ($generated) {
                Write-Host ("  SVG: {0}" -f $svgPath) -ForegroundColor Green
            }
        }

        Write-Host ("  OK: {0}" -f $spec.Name) -ForegroundColor Green
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
Write-Host "  shared  -> logo-mark.png, logo-horizontal.png, logo-vertical.png" -ForegroundColor Gray
Write-Host "  iOS     -> icon.png, splash-icon.png" -ForegroundColor Gray
Write-Host "  Android -> icon.png, splash-icon.png, adaptive-foreground.png, adaptive-monochrome.png, notification-icon.png" -ForegroundColor Gray
Write-Host "  extras  -> *.svg en raiz (si Potrace disponible)" -ForegroundColor Gray
