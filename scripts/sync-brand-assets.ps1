$ErrorActionPreference = "Stop"

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
$referenceDir = Join-Path $root "references\logo"
$outputDir = Join-Path $root "assets\branding"

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# ─── CONFIGURACIÓN ───
# Umbral: 0-255. Cuanto más alto, más agresivo eliminando "casi blancos".
# 240-250 es ideal para fondos blancos con anti-aliasing.
$whiteThreshold = 245

# ─── FUNCIONES AUXILIARES ───

function Remove-WhiteBackground {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Source,
        [int]$Threshold = 245
    )

    # Forzar formato 32bpp ARGB para tener canal alpha real
    $bmp = New-Object System.Drawing.Bitmap $Source.Width, $Source.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($Source, 0, 0, $Source.Width, $Source.Height)
    $g.Dispose()

    $rect = New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height
    $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, $bmp.PixelFormat)

    $bytes = [Math]::Abs($data.Stride) * $bmp.Height
    $rgbValues = New-Object byte[] $bytes
    [Runtime.InteropServices.Marshal]::Copy($data.Scan0, $rgbValues, 0, $bytes)

    for ($i = 0; $i -lt $rgbValues.Length; $i += 4) {
        $b = $rgbValues[$i]
        $g = $rgbValues[$i + 1]
        $r = $rgbValues[$i + 2]
        # $a = $rgbValues[$i + 3] (actual alpha, normalmente 255 en PNG sin transparencia)

        # Calcular "qué tan blanco es" (promedio o luminosidad)
        $max = [Math]::Max($r, [Math]::Max($g, $b))
        $min = [Math]::Min($r, [Math]::Min($g, $b))
        $lightness = ($max + $min) / 2

        if ($lightness -ge $Threshold) {
            # Es blanco puro o casi: totalmente transparente
            $rgbValues[$i + 3] = 0
        }
        elseif ($lightness -ge ($Threshold - 40)) {
            # Zona de transición (anti-aliasing): transparencia parcial proporcional
            $factor = ($Threshold - $lightness) / 40  # 0.0 a 1.0
            # Invertir: cuanto más cerca del umbral, más transparente
            $alpha = [byte](255 * $factor)
            $rgbValues[$i + 3] = $alpha

            # También oscurecer ligeramente el color para que no quede "blanco fantasma"
            $rgbValues[$i] = [byte]($b * $factor)
            $rgbValues[$i + 1] = [byte]($g * $factor)
            $rgbValues[$i + 2] = [byte]($r * $factor)
        }
        # Si no es blanco, dejar el alpha que traiga (o 255 si no tenía)
    }

    [Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $data.Scan0, $bytes)
    $bmp.UnlockBits($data)
    return $bmp
}

function Save-PngWithQuality {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Bitmap,
        [Parameter(Mandatory = $true)][string]$Path
    )

    # GDI+ PNG es siempre lossless, pero nos aseguramos de guardar con el formato correcto
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.FormatID -eq [System.Drawing.Imaging.ImageFormat]::Png.Guid }
    $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::ColorDepth, 32)
    $Bitmap.Save($Path, $codec, $ep)
    $ep.Dispose()
}

function Save-ResizedCanvas {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [Parameter(Mandatory = $true)][int]$Width,
        [Parameter(Mandatory = $true)][int]$Height,
        [System.Drawing.Color]$Background,
        [double]$Scale = 0.84,
        [double]$Padding = 0.0  # Padding extra además del scale (0.0 a 0.5)
    )

    $canvas = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)

    # Fondo
    if ($Background.A -eq 0) {
        # Transparente: no limpiar con color, dejar vacío
        $g.Clear([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    } else {
        $g.Clear($Background)
    }

    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Área útil considerando scale + padding adicional
    $effectiveScale = $Scale * (1 - $Padding)
    $maxWidth = [int]($Width * $effectiveScale)
    $maxHeight = [int]($Height * $effectiveScale)

    $ratio = [Math]::Min($maxWidth / $Source.Width, $maxHeight / $Source.Height)
    $drawWidth = [int][Math]::Round($Source.Width * $ratio)
    $drawHeight = [int][Math]::Round($Source.Height * $ratio)
    $left = [int](($Width - $drawWidth) / 2)
    $top = [int](($Height - $drawHeight) / 2)

    $g.DrawImage($Source, $left, $top, $drawWidth, $drawHeight)
    $g.Dispose()

    Save-PngWithQuality -Bitmap $canvas -Path $Destination
    $canvas.Dispose()
}

function Save-FaviconIco {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    # Crear icono con transparencia real
    $iconSize = New-Object System.Drawing.Size 256, 256
    $iconBitmap = New-Object System.Drawing.Bitmap $Source, $iconSize
    $handle = $iconBitmap.GetHicon()
    $icon = [System.Drawing.Icon]::FromHandle($handle)
    $stream = [System.IO.File]::Create($Destination)

    try {
        $icon.Save($stream)
    }
    finally {
        $stream.Dispose()
        $icon.Dispose()
        $iconBitmap.Dispose()
        [NativeIcon]::DestroyIcon($handle) | Out-Null
    }
}

# ─── PROCESAMIENTO PRINCIPAL ───

$markReference = Join-Path $referenceDir "logo.png"
$horizontalReference = Join-Path $referenceDir "logo-horizontal.png"
$verticalReference = Join-Path $referenceDir "logo-vertical.png"

if (-not (Test-Path $markReference)) {
    throw "No se encontró logo.png en $referenceDir"
}

# Copiar logos horizontales/verticales tal cual (asumiendo que ya tienen fondo transparente o son para web)
if (Test-Path $horizontalReference) {
    Copy-Item $horizontalReference (Join-Path $outputDir "logo-horizontal.png") -Force
}
if (Test-Path $verticalReference) {
    Copy-Item $verticalReference (Join-Path $outputDir "logo-vertical.png") -Force
}

Write-Host "Procesando logo principal y eliminando fondo blanco (umbral: $whiteThreshold)..."
$rawMark = [System.Drawing.Bitmap]::FromFile($markReference)
$mark = Remove-WhiteBackground -Source $rawMark -Threshold $whiteThreshold
$rawMark.Dispose()

try {
    # ─── ASSETS GENÉRICOS / WEB ───
    Save-ResizedCanvas -Source $mark -Destination (Join-Path $outputDir "logo-mark.png") -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::Transparent) -Scale 0.82
    Save-ResizedCanvas -Source $mark -Destination (Join-Path $outputDir "icon.png") -Width 1024 -Height 1024 -Background ([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")) -Scale 0.82
    Save-ResizedCanvas -Source $mark -Destination (Join-Path $outputDir "adaptive-foreground.png") -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78 -Padding 0.05
    Save-ResizedCanvas -Source $mark -Destination (Join-Path $outputDir "splash-icon.png") -Width 512 -Height 512 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78 -Padding 0.05
    Save-ResizedCanvas -Source $mark -Destination (Join-Path $outputDir "favicon.png") -Width 256 -Height 256 -Background ([System.Drawing.Color]::Transparent) -Scale 0.8

    # ─── FAVICON ICO ───
    $faviconBitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $outputDir "favicon.png"))
    try {
        Save-FaviconIco -Source $faviconBitmap -Destination (Join-Path $outputDir "favicon.ico")
    }
    finally {
        $faviconBitmap.Dispose()
    }

    # ─── ANDROID ADAPTIVE ICON (API 26+) ───
    # Foreground: 108dp @ 4x = 432px. Debe ocupar ~66% del canvas (safe zone)
    $androidDir = Join-Path $outputDir "android"
    New-Item -ItemType Directory -Force -Path $androidDir | Out-Null

    Save-ResizedCanvas -Source $mark -Destination (Join-Path $androidDir "ic_launcher_foreground.png") -Width 432 -Height 432 -Background ([System.Drawing.Color]::Transparent) -Scale 0.66 -Padding 0.02

    # Background: color sólido o transparente (usualmente defines el color en colors.xml)
    # Aquí generamos un placeholder transparente; el color real va en tu proyecto
    $bgCanvas = New-Object System.Drawing.Bitmap 432, 432, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bgCanvas.Save((Join-Path $androidDir "ic_launcher_background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bgCanvas.Dispose()

    # ─── ANDROID LEGACY & ROUND ICONS (mipmap-*) ───
    $androidLegacyDir = Join-Path $androidDir "legacy"
    New-Item -ItemType Directory -Force -Path $androidLegacyDir | Out-Null

    $androidSizes = @{
        "mipmap-mdpi"    = 48
        "mipmap-hdpi"    = 72
        "mipmap-xhdpi"   = 96
        "mipmap-xxhdpi"  = 144
        "mipmap-xxxhdpi" = 192
    }

    foreach ($folder in $androidSizes.Keys) {
        $size = $androidSizes[$folder]
        $folderPath = Join-Path $androidLegacyDir $folder
        New-Item -ItemType Directory -Force -Path $folderPath | Out-Null

        # Legacy square (algunos launchers antiguos recortan esquinas, no redondean)
        Save-ResizedCanvas -Source $mark -Destination (Join-Path $folderPath "ic_launcher.png") -Width $size -Height $size -Background ([System.Drawing.Color]::Transparent) -Scale 0.80
        # Round icon (Android 7.1+)
        Save-ResizedCanvas -Source $mark -Destination (Join-Path $folderPath "ic_launcher_round.png") -Width $size -Height $size -Background ([System.Drawing.Color]::Transparent) -Scale 0.75 -Padding 0.02
    }

    # ─── iOS APP ICON SET ───
    # AppIcon.appiconset completo según Human Interface Guidelines
    $iosDir = Join-Path $outputDir "ios\AppIcon.appiconset"
    New-Item -ItemType Directory -Force -Path $iosDir | Out-Null

    $iosIcons = @(
        # iPhone Notification
        @{ "size" = 20; "scale" = 2; "id" = "icon-20@2x" },
        @{ "size" = 20; "scale" = 3; "id" = "icon-20@3x" },
        # iPhone Settings
        @{ "size" = 29; "scale" = 2; "id" = "icon-29@2x" },
        @{ "size" = 29; "scale" = 3; "id" = "icon-29@3x" },
        # iPhone Spotlight
        @{ "size" = 40; "scale" = 2; "id" = "icon-40@2x" },
        @{ "size" = 40; "scale" = 3; "id" = "icon-40@3x" },
        # iPhone App
        @{ "size" = 60; "scale" = 2; "id" = "icon-60@2x" },
        @{ "size" = 60; "scale" = 3; "id" = "icon-60@3x" },
        # iPad Settings
        @{ "size" = 29; "scale" = 1; "id" = "icon-29" },
        # iPad Spotlight
        @{ "size" = 40; "scale" = 1; "id" = "icon-40" },
        # iPad App
        @{ "size" = 76; "scale" = 1; "id" = "icon-76" },
        @{ "size" = 76; "scale" = 2; "id" = "icon-76@2x" },
        # iPad Pro App
        @{ "size" = 83.5; "scale" = 2; "id" = "icon-83.5@2x" },
        # App Store
        @{ "size" = 1024; "scale" = 1; "id" = "icon-1024" }
    )

    foreach ($icon in $iosIcons) {
        $px = [int][Math]::Round($icon.size * $icon.scale)
        $fileName = "$($icon.id).png"
        # iOS NO usa fondo transparente en App Store (1024) y algunos iconos,
        # pero para consistencia usamos blanco si tu logo no es 100% vector.
        # Si tu logo ya tiene fondo transparente y es plano, usa Transparent.
        if ($icon.size -eq 1024) {
            # App Store: debe tener fondo, NO transparente
            Save-ResizedCanvas -Source $mark -Destination (Join-Path $iosDir $fileName) -Width $px -Height $px -Background ([System.Drawing.Color]::White) -Scale 0.82
        } else {
            Save-ResizedCanvas -Source $mark -Destination (Join-Path $iosDir $fileName) -Width $px -Height $px -Background ([System.Drawing.Color]::Transparent) -Scale 0.82
        }
    }

    # Generar Contents.json para Xcode
    $contentsJson = @{
        "images" = @()
        "info" = @{
            "version" = 1
            "author" = "xcode"
        }
    }

    foreach ($icon in $iosIcons) {
        $contentsJson.images += @{
            "size" = "$($icon.size)x$($icon.size)"
            "idiom" = if ($icon.size -in @(20,29,40,60)) { "iphone" } else { "ipad" }
            "filename" = "$($icon.id).png"
            "scale" = "$($icon.scale)x"
        }
    }
    # Corregir: App Store es universal
    $contentsJson.images[-1].idiom = "ios-marketing"

    $contentsJson | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $iosDir "Contents.json") -Encoding UTF8

    Write-Host "`n✅ Brand assets listos en: $outputDir" -ForegroundColor Green
    Write-Host "   Android: $androidDir" -ForegroundColor Cyan
    Write-Host "   iOS: $iosDir" -ForegroundColor Cyan
    Write-Host "`n⚠️  Notas importantes:" -ForegroundColor Yellow
    Write-Host "   1. Si aún ves bordes blancos, sube `$whiteThreshold` a 250 o baja a 230." -ForegroundColor Yellow
    Write-Host "   2. Para Android adaptive icons, define el color de fondo en res/values/colors.xml" -ForegroundColor Yellow
    Write-Host "   3. El icono App Store (1024) tiene fondo blanco porque Apple lo exige sin transparencia." -ForegroundColor Yellow

}
finally {
    $mark.Dispose()
}
