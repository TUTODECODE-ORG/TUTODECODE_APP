const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const downloadsDir = path.join(rootDir, 'public', 'downloads');
const publicDir = path.join(rootDir, 'public');

fs.mkdirSync(downloadsDir, { recursive: true });

const legacyPackageNames = [
  'TutoDecode_Client_Pack.zip',
  'TutoDecode_Server_Pack.zip',
  'TutoDeCode-Setup.exe',
];

for (const legacyName of legacyPackageNames) {
  const legacyPath = path.join(downloadsDir, legacyName);
  if (fs.existsSync(legacyPath)) {
    fs.unlinkSync(legacyPath);
  }
}

function copyIfExists(sourcePath, targetName) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return false;
  }
  const targetPath = path.join(downloadsDir, targetName);
  fs.copyFileSync(sourcePath, targetPath);
  return true;
}

function findFirstFileByExt(dirPath, extension) {
  if (!fs.existsSync(dirPath)) {
    return null;
  }
  const files = fs.readdirSync(dirPath)
    .filter((name) => name.toLowerCase().endsWith(extension.toLowerCase()))
    .map((name) => path.join(dirPath, name));
  return files.length > 0 ? files[0] : null;
}

function findFirstFileByExtInDirs(dirPaths, extension) {
  for (const dirPath of dirPaths) {
    const found = findFirstFileByExt(dirPath, extension);
    if (found) return found;
  }
  return null;
}

const files = {
  'Install-TutoDeCode-App-Windows.bat': String.raw`@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Installateur TutoDeCode (Windows)

set "SITE_BASE=https://tutodecode.org"
set "DOWNLOADS_URL=%SITE_BASE%/downloads"
set "DOWNLOAD_DIR=%USERPROFILE%\Downloads\TutoDeCode"
set "FALLBACK_DOWNLOAD_DIR=%TEMP%\TutoDeCode"

echo =============================================
echo  TutoDeCode - Installation
echo =============================================
echo Site officiel: %SITE_BASE%
echo Fichiers: %DOWNLOADS_URL%/
echo Installation standard: aucune compilation requise (MSI deja prete).
echo.

set "FORCE_BUILD=0"
if /I "%~1"=="--build" set "FORCE_BUILD=1"
if /I "%~1"=="/build" set "FORCE_BUILD=1"

if "%FORCE_BUILD%"=="1" goto BUILD_FROM_SOURCE

:DOWNLOAD_BUILD
echo.
echo [1/4] Creation du dossier de telechargement...
if not exist "%DOWNLOAD_DIR%\NUL" mkdir "%DOWNLOAD_DIR%" >nul 2>nul

set "WRITE_TEST=%DOWNLOAD_DIR%\.tdc_write_test.tmp"
break > "%WRITE_TEST%" 2>nul
if not exist "%WRITE_TEST%" (
  echo [ATTENTION] Acces refuse sur "%DOWNLOAD_DIR%".
  echo [INFO] Bascule vers un dossier temporaire: "%FALLBACK_DOWNLOAD_DIR%"
  set "DOWNLOAD_DIR=%FALLBACK_DOWNLOAD_DIR%"
  if not exist "%DOWNLOAD_DIR%\NUL" mkdir "%DOWNLOAD_DIR%" >nul 2>nul
  set "WRITE_TEST=%DOWNLOAD_DIR%\.tdc_write_test.tmp"
  break > "%WRITE_TEST%" 2>nul
)

if exist "%WRITE_TEST%" del /f /q "%WRITE_TEST%" >nul 2>nul

if not exist "%DOWNLOAD_DIR%\NUL" (
  echo [ERREUR] Impossible de creer un dossier de telechargement.
  echo Lancez ce script en tant qu'administrateur.
  echo Mode avance: relancez avec --build pour compiler localement.
  pause
  exit /b 1
)

echo [2/4] Recuperation de l'installateur TutoDeCode...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='SilentlyContinue';" ^
  "$bases=@('%DOWNLOADS_URL%','%SITE_BASE%');" ^
  "$out='%DOWNLOAD_DIR%';" ^
  "New-Item -ItemType Directory -Path $out -Force | Out-Null;" ^
  "$fileMap=@{" ^
  "  'TutoDeCode-Setup.msi'=@('TutoDeCode-Setup.msi','tutodecode-setup.msi');" ^
  "};" ^
  "$ok=$false;" ^
  "foreach($target in $fileMap.Keys){" ^
  "  $done=$false;" ^
  "  foreach($alias in $fileMap[$target]){" ^
  "    if($done){ continue }" ^
  "    foreach($b in $bases){" ^
  "      if($done){ continue }" ^
  "      try {" ^
  "        Invoke-WebRequest -Uri ($b + '/' + $alias) -OutFile (Join-Path $out $target) -UseBasicParsing;" ^
  "        Write-Host ('[OK] ' + $target + ' <= ' + $b + '/' + $alias);" ^
  "        $ok=$true;" ^
  "        $done=$true" ^
  "      } catch { }" ^
  "    }" ^
  "  }" ^
  "  if(-not $done){ Write-Host ('[SKIP] ' + $target) }" ^
  "}" ^
  "if(-not $ok){ exit 9 }"

if %ERRORLEVEL% equ 9 (
  echo [ERREUR] Aucun fichier compile n'a pu etre telecharge.
  echo La liste du dossier /downloads peut etre bloquee ^(403^) sur certains serveurs.
  echo [INFO] Si vous voyez encore "Client/Server", vous executez une ancienne copie du script.
  echo [INFO] Re-telechargez uniquement: https://tutodecode.org/downloads/Install-TutoDeCode-App-Windows.bat
  echo [INFO] Tentative de bascule automatique vers la compilation locale...
  timeout /t 2 >nul
  goto BUILD_FROM_SOURCE
)

set "MSI_PATH=%DOWNLOAD_DIR%\TutoDeCode-Setup.msi"

echo [3/4] Verification des installateurs...
if not exist "%MSI_PATH%" (
  echo [ERREUR] Aucun installateur trouve apres telechargement.
  echo [INFO] Tentative de bascule automatique vers la compilation locale...
  timeout /t 2 >nul
  goto BUILD_FROM_SOURCE
)

echo [4/4] Lancement de l'installation de TutoDeCode...
start "" msiexec /i "%MSI_PATH%"

start "" "%DOWNLOAD_DIR%"
echo.
echo [OK] Installateur lance. Suivez l'assistant pour finaliser l'installation professionnelle.
echo      Dossier telecharge: %DOWNLOAD_DIR%
pause
exit /b 0

:BUILD_FROM_SOURCE
echo.
echo Mode avance: compilation locale depuis le code source.

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT="

if exist "%CD%\package.json" set "PROJECT_ROOT=%CD%"
if not defined PROJECT_ROOT if exist "%SCRIPT_DIR%..\..\package.json" set "PROJECT_ROOT=%SCRIPT_DIR%..\.."
if not defined PROJECT_ROOT if exist "%CD%\TUTODECODE\app\package.json" set "PROJECT_ROOT=%CD%\TUTODECODE\app"
if not defined PROJECT_ROOT if exist "%CD%\app\package.json" set "PROJECT_ROOT=%CD%\app"
if not defined PROJECT_ROOT if exist "%USERPROFILE%\OneDrive\Bureau\TUTODECODE\app\package.json" set "PROJECT_ROOT=%USERPROFILE%\OneDrive\Bureau\TUTODECODE\app"
if not defined PROJECT_ROOT if exist "%USERPROFILE%\Desktop\TUTODECODE\app\package.json" set "PROJECT_ROOT=%USERPROFILE%\Desktop\TUTODECODE\app"

if not defined PROJECT_ROOT (
  echo [INFO] Dossier projet introuvable automatiquement.
  set /p PROJECT_ROOT=Entrez le chemin complet du dossier projet qui contient package.json : 
)

if not exist "%PROJECT_ROOT%\package.json" (
  echo [ERREUR] package.json introuvable dans "%PROJECT_ROOT%".
  echo Ce script doit etre lance dans/depuis le projet source TutoDeCode.
  echo.
  echo Si vous ne voulez PAS compiler, utilisez directement l'installateur pre-genere (.msi).
  pause
  exit /b 1
)

echo [INFO] Projet detecte: %PROJECT_ROOT%
pushd "%PROJECT_ROOT%"

where winget >nul 2>nul
set "HAS_WINGET=%ERRORLEVEL%"

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [INFO] Node.js/NPM non detecte.
  if "%HAS_WINGET%"=="0" (
    echo [ACTION] Installation Node.js LTS via winget...
    winget install -e --id OpenJS.NodeJS.LTS
  ) else (
    echo [ERREUR] winget indisponible, impossible d'installer Node automatiquement.
    echo Installez Node.js LTS: https://nodejs.org/
    popd
    pause
    exit /b 1
  )
)

where cargo >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [INFO] Rust/Cargo non detecte.
  if "%HAS_WINGET%"=="0" (
    echo [ACTION] Installation Rustup via winget...
    winget install -e --id Rustlang.Rustup
    echo [INFO] Rust installe. Si cargo reste introuvable, relancez ce script.
  ) else (
    echo [ERREUR] winget indisponible, impossible d'installer Rust automatiquement.
    echo Installez Rust: https://rustup.rs/
    popd
    pause
    exit /b 1
  )
)

if "%HAS_WINGET%"=="0" (
  echo [INFO] Verification WebView2 Runtime...
  winget install -e --id Microsoft.EdgeWebView2Runtime >nul 2>nul
)

echo.
echo [1/3] Installation des dependances npm...
call npm install
if %ERRORLEVEL% neq 0 (
  echo [ERREUR] npm install a echoue.
  popd
  pause
  exit /b 1
)

echo [2/3] Build de l'application Windows (.msi)...
call npm run app:windows
if %ERRORLEVEL% neq 0 (
  echo [ERREUR] Build Tauri echoue.
  popd
  pause
  exit /b 1
)

echo [3/3] Ouverture du dossier des installateurs...
if exist "%PROJECT_ROOT%\src-tauri\target\release\bundle\msi" (
  start "" "%PROJECT_ROOT%\src-tauri\target\release\bundle\msi"
)

popd
echo.
echo [OK] Build termine. Vos installateurs sont prets.
pause
exit /b 0
`,

  'Compiler-TutoDeCode-App-Windows.bat': String.raw`@echo off
setlocal EnableExtensions EnableDelayedExpansion
title TutoDeCode - Compilation locale (puriste)

echo =============================================
echo  TutoDeCode - Build local puriste
echo =============================================
echo Ce script compile localement l'application (.msi)
echo sans telechargement de binaire distant.
echo.

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT="

if exist "%CD%\package.json" set "PROJECT_ROOT=%CD%"
if not defined PROJECT_ROOT if exist "%SCRIPT_DIR%..\..\package.json" set "PROJECT_ROOT=%SCRIPT_DIR%..\.."
if not defined PROJECT_ROOT if exist "%CD%\TUTODECODE\app\package.json" set "PROJECT_ROOT=%CD%\TUTODECODE\app"
if not defined PROJECT_ROOT if exist "%CD%\app\package.json" set "PROJECT_ROOT=%CD%\app"
if not defined PROJECT_ROOT if exist "%USERPROFILE%\OneDrive\Bureau\TUTODECODE\app\package.json" set "PROJECT_ROOT=%USERPROFILE%\OneDrive\Bureau\TUTODECODE\app"
if not defined PROJECT_ROOT if exist "%USERPROFILE%\Desktop\TUTODECODE\app\package.json" set "PROJECT_ROOT=%USERPROFILE%\Desktop\TUTODECODE\app"

if not defined PROJECT_ROOT (
  echo [INFO] Dossier projet introuvable automatiquement.
  set /p PROJECT_ROOT=Entrez le chemin complet du dossier projet qui contient package.json : 
)

if not exist "%PROJECT_ROOT%\package.json" (
  echo [ERREUR] package.json introuvable dans "%PROJECT_ROOT%".
  pause
  exit /b 1
)

echo [INFO] Projet detecte: %PROJECT_ROOT%
pushd "%PROJECT_ROOT%"

where winget >nul 2>nul
set "HAS_WINGET=%ERRORLEVEL%"

where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [INFO] Node.js/NPM non detecte.
  if "%HAS_WINGET%"=="0" (
    winget install -e --id OpenJS.NodeJS.LTS
  ) else (
    echo [ERREUR] winget indisponible. Installez Node.js LTS: https://nodejs.org/
    popd
    pause
    exit /b 1
  )
)

where cargo >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [INFO] Rust/Cargo non detecte.
  if "%HAS_WINGET%"=="0" (
    winget install -e --id Rustlang.Rustup
    echo [INFO] Rust installe. Relancez ce script si cargo n'est pas encore disponible.
  ) else (
    echo [ERREUR] winget indisponible. Installez Rust: https://rustup.rs/
    popd
    pause
    exit /b 1
  )
)

if "%HAS_WINGET%"=="0" (
  winget install -e --id Microsoft.EdgeWebView2Runtime >nul 2>nul
)

echo.
echo [1/2] Build du frontend...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo [ERREUR] Echec du build frontend.
  popd
  pause
  exit /b 1
)

echo [2/2] Build Windows Tauri (.msi)...
call npm run app:windows
if %ERRORLEVEL% neq 0 (
  echo [ERREUR] Echec du build Tauri.
  popd
  pause
  exit /b 1
)

if exist "%PROJECT_ROOT%\src-tauri\target\release\bundle\msi" start "" "%PROJECT_ROOT%\src-tauri\target\release\bundle\msi"

popd
echo.
echo [OK] Compilation terminee. Les installateurs sont prets.
pause
exit /b 0
`,

  'Install-Ollama-Modele.bat': String.raw`@echo off
setlocal
title Installation Ollama + modele local

echo =============================================
echo  TutoDeCode - IA locale Ollama
echo =============================================
echo.

where winget >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [ERREUR] winget non disponible.
  echo Installez Ollama manuellement: https://ollama.com/download
  pause
  exit /b 1
)

echo [1/3] Installation Ollama via winget...
winget install -e --id Ollama.Ollama

echo [2/3] Verification binaire ollama...
where ollama >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo [ATTENTION] ollama non trouve dans le PATH.
  echo Redemarrez votre terminal puis relancez ce script.
  pause
  exit /b 1
)

echo [3/3] Telechargement du modele (llama3.2:3b)...
ollama pull llama3.2:3b

echo.
echo [OK] IA locale prete sur http://127.0.0.1:11434
echo Lancez ensuite TutoDeCode en mode application.
pause
exit /b 0
`,

    'README_INSTALLATION_LOCALE.txt': `TutoDeCode - Kit d'installation Windows

  SITE OFFICIEL
  - https://tutodecode.org/

  DOSSIER DES TELECHARGEMENTS
  - https://tutodecode.org/downloads/

  FICHIERS BAT
  - https://tutodecode.org/downloads/tutodecode.bat
  - https://tutodecode.org/downloads/Install-TutoDeCode-App-Windows.bat
  - https://tutodecode.org/downloads/Compiler-TutoDeCode-App-Windows.bat
  - https://tutodecode.org/downloads/Install-Ollama-Modele.bat

  FICHIERS COMPILES (deposes sur le site)
  - https://tutodecode.org/downloads/TutoDeCode-Setup.msi

1) Install-TutoDeCode-App-Windows.bat
  - Lance directement l'installation MSI officielle (aucune compilation requise)
  - Mode avance: utilisez --build pour compiler localement

1b) Compiler-TutoDeCode-App-Windows.bat
  - Mode puriste: compile localement uniquement (.msi)
  - Ne telecharge aucun binaire distant

2) Install-Ollama-Modele.bat
   - Installe Ollama
   - Telecharge le modele llama3.2:3b
   - Permet a GhostAI de repondre en local (127.0.0.1:11434)

Recommande:
- Le script app peut etre lance depuis n'importe ou.
- Sur Windows, lancer en tant qu'administrateur si besoin.
`,

  'tutodecode.bat': String.raw`@echo off
setlocal

set "REMOTE_BAT_1=https://tutodecode.org/downloads/Install-TutoDeCode-App-Windows.bat"
set "REMOTE_BAT_2=https://tutodecode.org/Install-TutoDeCode-App-Windows.bat"
set "BASE=%~dp0"
if exist "%BASE%Install-TutoDeCode-App-Windows.bat" (
  call "%BASE%Install-TutoDeCode-App-Windows.bat"
  exit /b %ERRORLEVEL%
)

echo [INFO] Script local introuvable, telechargement depuis tutodecode.org...
set "TEMP_BAT=%TEMP%\Install-TutoDeCode-App-Windows.bat"
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -Uri '%REMOTE_BAT_1%' -OutFile '%TEMP_BAT%' -UseBasicParsing; exit 0 } catch { exit 1 }"
if not exist "%TEMP_BAT%" powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Invoke-WebRequest -Uri '%REMOTE_BAT_2%' -OutFile '%TEMP_BAT%' -UseBasicParsing; exit 0 } catch { exit 1 }"

if exist "%TEMP_BAT%" (
  call "%TEMP_BAT%"
  exit /b %ERRORLEVEL%
)

echo [ERREUR] Impossible de recuperer le script d'installation.
echo Verifiez votre connexion et ces URLs:
echo   - %REMOTE_BAT_1%
echo   - %REMOTE_BAT_2%
pause
exit /b 1
`,
};

for (const [name, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(downloadsDir, name), content, 'utf8');
}

const mirroredRootFiles = [
  'Install-TutoDeCode-App-Windows.bat',
  'Compiler-TutoDeCode-App-Windows.bat',
  'Install-Ollama-Modele.bat',
  'README_INSTALLATION_LOCALE.txt',
  'tutodecode.bat',
];

const skippedMirrorCopies = [];

for (const name of mirroredRootFiles) {
  const source = path.join(downloadsDir, name);
  const target = path.join(publicDir, name);

  try {
    if (fs.existsSync(target)) {
      try {
        fs.unlinkSync(target);
      } catch {
        // noop: if unlink fails, we'll try copy and handle any error below
      }
    }

    fs.copyFileSync(source, target);
  } catch (error) {
    skippedMirrorCopies.push({ name, error: error?.code || String(error) });
  }
}

const localAppData = process.env.LOCALAPPDATA || '';
const externalTargetRoot = localAppData
  ? path.join(localAppData, 'tutodecode', 'cargo-target', 'x86_64-pc-windows-msvc', 'release', 'bundle')
  : null;

const msiSearchDirs = [
  path.join(rootDir, 'src-tauri', 'target', 'release', 'bundle', 'msi'),
  ...(externalTargetRoot ? [path.join(externalTargetRoot, 'msi')] : []),
];

const msiFile = findFirstFileByExtInDirs(msiSearchDirs, '.msi');

const copiedMsi = copyIfExists(msiFile, 'TutoDeCode-Setup.msi');

const courseBuilderSearchDirs = [
  path.join(rootDir, 'tools', 'CourseBuilderExe', 'bin', 'Release', 'net8.0-windows', 'win-x64', 'publish'),
  path.join(rootDir, 'tools', 'CourseBuilderExe', 'bin', 'Release', 'net8.0-windows', 'publish'),
  path.join(rootDir, 'tools', 'CourseBuilderExe', 'bin', 'Release', 'net8.0-windows'),
];

const courseBuilderExe = findFirstFileByExtInDirs(courseBuilderSearchDirs, '.exe');
const copiedCourseBuilder = copyIfExists(courseBuilderExe, 'CourseBuilderExe.exe');

const publicExePath = path.join(downloadsDir, 'TutoDeCode-Setup.exe');
if (fs.existsSync(publicExePath)) {
  fs.unlinkSync(publicExePath);
}

if (copiedMsi) {
  console.log('[generate-install-assets] installateur MSI copie dans public/downloads');
} else {
  console.log('[generate-install-assets] aucun installateur MSI detecte, conservation des assets existants');
}

if (copiedCourseBuilder) {
  console.log('[generate-install-assets] CourseBuilderExe.exe copie dans public/downloads');
} else {
  console.log('[generate-install-assets] CourseBuilderExe.exe non detecte (build C# requis)');
}

console.log('[generate-install-assets] fichiers generes dans public/downloads');
if (skippedMirrorCopies.length === 0) {
  console.log('[generate-install-assets] fichiers miroir generes dans public/');
} else {
  console.log('[generate-install-assets] fichiers miroir partiels dans public/ (certaines copies ignorees)');
  for (const entry of skippedMirrorCopies) {
    console.log(`[generate-install-assets] copie ignoree: ${entry.name} (${entry.error})`);
  }
}
