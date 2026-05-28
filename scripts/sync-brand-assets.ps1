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

function New-TransparentBitmap {
    param([Parameter(Mandatory = $true)][string]$Path)

    $source = [System.Drawing.Bitmap]::FromFile($Path)
    $copy = New-Object System.Drawing.Bitmap $source
    $copy.MakeTransparent([System.Drawing.Color]::White)
    $source.Dispose()
    return $copy
}

function Save-CanvasImage {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory = $true)][string]$Destination,
        [Parameter(Mandatory = $true)][int]$Width,
        [Parameter(Mandatory = $true)][int]$Height,
        [Parameter(Mandatory = $true)][System.Drawing.Color]$Background,
        [double]$Scale = 0.84
    )

    $canvas = New-Object System.Drawing.Bitmap $Width, $Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.Clear($Background)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $maxWidth = [int]($Width * $Scale)
    $maxHeight = [int]($Height * $Scale)
    $ratio = [Math]::Min($maxWidth / $Source.Width, $maxHeight / $Source.Height)
    $drawWidth = [int][Math]::Round($Source.Width * $ratio)
    $drawHeight = [int][Math]::Round($Source.Height * $ratio)
    $left = [int](($Width - $drawWidth) / 2)
    $top = [int](($Height - $drawHeight) / 2)

    $graphics.DrawImage($Source, $left, $top, $drawWidth, $drawHeight)
    $canvas.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $canvas.Dispose()
}

function Save-Favicon {
    param(
        [Parameter(Mandatory = $true)][System.Drawing.Bitmap]$Source,
        [Parameter(Mandatory = $true)][string]$Destination
    )

    $iconBitmap = New-Object System.Drawing.Bitmap $Source, (New-Object System.Drawing.Size 64, 64)
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

$markReference = Join-Path $referenceDir "logo.png"
$horizontalReference = Join-Path $referenceDir "logo-horizontal.png"
$verticalReference = Join-Path $referenceDir "logo-vertical.png"

Copy-Item $horizontalReference (Join-Path $outputDir "logo-horizontal.png") -Force
Copy-Item $verticalReference (Join-Path $outputDir "logo-vertical.png") -Force

$mark = New-TransparentBitmap -Path $markReference

try {
    Save-CanvasImage -Source $mark -Destination (Join-Path $outputDir "logo-mark.png") -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::Transparent) -Scale 0.82
    Save-CanvasImage -Source $mark -Destination (Join-Path $outputDir "icon.png") -Width 1024 -Height 1024 -Background ([System.Drawing.ColorTranslator]::FromHtml("#FFFFFF")) -Scale 0.82
    Save-CanvasImage -Source $mark -Destination (Join-Path $outputDir "adaptive-foreground.png") -Width 1024 -Height 1024 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78
    Save-CanvasImage -Source $mark -Destination (Join-Path $outputDir "splash-icon.png") -Width 512 -Height 512 -Background ([System.Drawing.Color]::Transparent) -Scale 0.78
    Save-CanvasImage -Source $mark -Destination (Join-Path $outputDir "favicon.png") -Width 256 -Height 256 -Background ([System.Drawing.Color]::Transparent) -Scale 0.8

    $faviconBitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $outputDir "favicon.png"))
    try {
        Save-Favicon -Source $faviconBitmap -Destination (Join-Path $outputDir "favicon.ico")
    }
    finally {
        $faviconBitmap.Dispose()
    }
}
finally {
    $mark.Dispose()
}

Write-Host "Brand assets ready in assets/branding"
