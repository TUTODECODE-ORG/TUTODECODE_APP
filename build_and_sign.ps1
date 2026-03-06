# build_and_sign.ps1
# ============================================================
# TutoDeCode — Build + Sign toutes plateformes (Windows)
# ============================================================
# Usage : .\build_and_sign.ps1 [-Platform android|windows|all]

param(
    [string]$Platform = "all"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Write-Header($msg) {
    Write-Host ""
    Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
}

# ── ANDROID ─────────────────────────────────────────────────
function Build-Android {
    Write-Header "Android — APK & AAB Release"

    # Vérifier key.properties
    if (-not (Test-Path "android\key.properties")) {
        Write-Error "android\key.properties introuvable ! Configurez le keystore d'abord."
    }

    Write-Host "Build APK (sideload)..." -ForegroundColor Yellow
    flutter build apk --release
    if ($LASTEXITCODE -eq 0) {
        Write-Host "APK : build\app\outputs\flutter-apk\app-release.apk" -ForegroundColor Green
    }

    Write-Host "Build AAB (Google Play)..." -ForegroundColor Yellow
    $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
    Set-Location android
    .\gradlew bundleRelease
    Set-Location ..
    if ($LASTEXITCODE -eq 0) {
        Write-Host "AAB : build\app\outputs\bundle\release\app-release.aab" -ForegroundColor Green
    }

    # Afficher les infos du keystore utilisé
    Write-Host ""
    Write-Host "Keystore utilisé :" -ForegroundColor Cyan
    Select-String "keyAlias" android\key.properties | Write-Host
}

# ── WINDOWS ─────────────────────────────────────────────────
function Build-Windows {
    Write-Header "Windows — EXE Release"

    Write-Host "Compilation..." -ForegroundColor Yellow
    flutter build windows --release
    if ($LASTEXITCODE -ne 0) { Write-Error "Build Windows échoué" }
    Write-Host "Build OK" -ForegroundColor Green

    $exePath = "build\windows\x64\runner\Release\tutodecode_flutter.exe"
    if (-not (Test-Path $exePath)) { Write-Error "EXE introuvable : $exePath" }

    # Chercher signtool
    $signtool = Get-ChildItem "C:\Program Files (x86)\Windows Kits\10\bin" `
        -Recurse -Filter "signtool.exe" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -like "*x64*" } |
    Select-Object -First 1 -ExpandProperty FullName

    if ($signtool -and (Test-Path "windows\tutodecode-codesign.pfx")) {
        Write-Host "Signature avec certificat PFX..." -ForegroundColor Yellow
        & $signtool sign /f "windows\tutodecode-codesign.pfx" /p "d3uF^^cw$4wlQZy" `
            /fd SHA256 /v $exePath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "EXE signé avec succès" -ForegroundColor Green
        }
    }
    else {
        Write-Host "Certificat ou signtool non trouvé — EXE non signé" -ForegroundColor Yellow
    }

    Write-Host "EXE : $exePath" -ForegroundColor Green
}

# ── WEB ─────────────────────────────────────────────────────
function Build-Web {
    Write-Header "Web — Build statique"
    flutter build web --release --web-renderer canvaskit
    Write-Host "Web : build\web\" -ForegroundColor Green
    Write-Host "Note : Le web ne nécessite pas de signature (HTTPS géré par le serveur)" -ForegroundColor DarkGray
}

# ── MAIN ─────────────────────────────────────────────────────
Write-Header "TutoDeCode — Build & Sign"
Write-Host "Plateforme : $Platform" -ForegroundColor White
Write-Host "Date : $(Get-Date -Format 'yyyy-MM-dd HH:mm')" -ForegroundColor DarkGray

switch ($Platform.ToLower()) {
    "android" { Build-Android }
    "windows" { Build-Windows }
    "web" { Build-Web }
    "all" {
        Build-Android
        Build-Windows
        Build-Web
    }
    default { Write-Error "Plateforme inconnue. Utilisez : android, windows, web, all" }
}

Write-Header "Build terminé !"
Write-Host "Artefacts :"
Write-Host "  APK     : build\app\outputs\flutter-apk\app-release.apk"
Write-Host "  AAB     : build\app\outputs\bundle\release\app-release.aab"
Write-Host "  Windows : build\windows\x64\runner\Release\"
Write-Host "  Web     : build\web\"
