<#
.SYNOPSIS
Script to generate Google Play Store assets from existing images.
#>
Add-Type -AssemblyName System.Drawing

$inputLogo = "c:\tutodecode_flutter\assets\logo.png"
$iconOutput = "c:\tutodecode_flutter\android\play_store_icon_512.png"
$bgInput = "C:\Users\winancher\.gemini\antigravity\brain\5ea85cde-9c81-4499-a9b4-cf2f7a2edbc9\play_store_bg_1772790962110.png"
$featureOutput = "c:\tutodecode_flutter\android\play_store_feature_1024.png"

# 1. GENERATE ICON (512x512)
if (Test-Path $inputLogo) {
    Write-Host "Création de l'icône 512x512..."
    $img = [System.Drawing.Image]::FromFile($inputLogo)
    # create new 512x512 bitmap
    $iconBmp = New-Object Drawing.Bitmap 512, 512
    $g = [System.Drawing.Graphics]::FromImage($iconBmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Fill background if transparent to solid color? Actually PNG can be transparent. We'll just draw it.
    $g.DrawImage($img, 0, 0, 512, 512)
    
    $iconBmp.Save($iconOutput, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $img.Dispose()
    $iconBmp.Dispose()
    Write-Host "Icône OK : $iconOutput"
}
else {
    Write-Host "Le logo source n'existe pas : $inputLogo"
}

# 2. GENERATE FEATURE GRAPHIC (1024x500)
if (Test-Path $bgInput) {
    Write-Host "Création de l'image de présentation 1024x500..."
    $bgImg = [System.Drawing.Image]::FromFile($bgInput)
    $featureBmp = New-Object Drawing.Bitmap 1024, 500
    $g2 = [System.Drawing.Graphics]::FromImage($featureBmp)
    $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # crop center horizontally, resize to fill 1024x500
    # source image is 1024x1024
    $srcRect = New-Object System.Drawing.Rectangle 0, 262, 1024, 500
    $destRect = New-Object System.Drawing.Rectangle 0, 0, 1024, 500
    $g2.DrawImage($bgImg, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # Overlay logo in center?
    if (Test-Path $inputLogo) {
        $logoImg = [System.Drawing.Image]::FromFile($inputLogo)
        $logoSize = 300
        $x = (1024 - $logoSize) / 2
        $y = (500 - $logoSize) / 2
        
        # Add a subtle shadow
        $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 0, 0, 0))
        $shadowRect = New-Object System.Drawing.Rectangle ($x + 5), ($y + 5), $logoSize, $logoSize
        # Can't draw dropshadow easily on image, but we just draw the logo
        $g2.DrawImage($logoImg, $x, $y, $logoSize, $logoSize)
        $logoImg.Dispose()
    }
    
    $featureBmp.Save($featureOutput, [System.Drawing.Imaging.ImageFormat]::Png)
    $g2.Dispose()
    $bgImg.Dispose()
    $featureBmp.Dispose()
    Write-Host "Image de présentation OK : $featureOutput"
}
else {
    Write-Host "L'image de background n'a pas été trouvée."
}
