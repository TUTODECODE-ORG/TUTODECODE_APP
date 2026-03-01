const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const deployRootDir = path.join(rootDir, 'deploy', 'hostverge');
const deployPublicHtmlDir = path.join(deployRootDir, 'public_html');
const deployDownloadsDir = path.join(deployPublicHtmlDir, 'downloads');
const sourceDownloadsDir = path.join(distDir, 'downloads');

const msiDir = path.join(rootDir, 'src-tauri', 'target', 'release', 'bundle', 'msi');
const localAppData = process.env.LOCALAPPDATA || '';
const externalBundleRoot = localAppData
  ? path.join(localAppData, 'tutodecode', 'cargo-target', 'x86_64-pc-windows-msvc', 'release', 'bundle')
  : null;

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  ensureDir(dirPath);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findFirstByExt(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return null;
  const files = fs.readdirSync(dirPath)
    .filter((name) => name.toLowerCase().endsWith(ext.toLowerCase()))
    .map((name) => path.join(dirPath, name));
  return files.length > 0 ? files[0] : null;
}

function findFirstByExtInDirs(dirPaths, ext) {
  for (const dirPath of dirPaths) {
    const found = findFirstByExt(dirPath, ext);
    if (found) return found;
  }
  return null;
}

function removeLegacyClientServerZips(targetDir) {
  const legacyFiles = ['TutoDecode_Client_Pack.zip', 'TutoDecode_Server_Pack.zip'];
  for (const legacyName of legacyFiles) {
    const legacyPath = path.join(targetDir, legacyName);
    if (fs.existsSync(legacyPath)) {
      fs.unlinkSync(legacyPath);
    }
  }
}

function writeDeployGuide({ hasMsi }) {
  const guidePath = path.join(deployRootDir, 'README_HOSTVERGE_DEPLOY.txt');
  const lines = [
    'TutoDeCode - Package de deploiement Hostverge',
    '',
    '1) Ouvrez le File Manager Hostverge.',
    '2) Videz le dossier public_html (ou faites une sauvegarde).',
    '3) Uploadez le contenu local: deploy/hostverge/public_html',
    '4) Permissions recommandees: dossiers 755, fichiers 644.',
    '5) Purgez le cache CDN/Cloudflare si actif.',
    '',
    'Checklist de verification apres upload:',
    '- https://tutodecode.org/',
    '- https://tutodecode.org/downloads/Install-TutoDeCode-App-Windows.bat',
    '- https://tutodecode.org/downloads/Install-Ollama-Modele.bat',
    '- https://tutodecode.org/downloads/TutoDeCode-Setup.msi',
    '',
    'Note produit:',
    '- Pour installer l application, aucune compilation n est requise cote utilisateur.',
    '- La compilation locale (npm/rust) est reservee au mode developpement.',
    '',
    `Installateur MSI present dans le package: ${hasMsi ? 'OUI' : 'NON'}`,
    '',
    'Si MSI est NON: lancez `npm run app:windows` puis `npm run deploy:hostverge`.',
  ];

  fs.writeFileSync(guidePath, lines.join('\n'), 'utf8');
}

function main() {
  if (!fs.existsSync(distDir)) {
    console.error('[prepare-hostverge-deploy] dist introuvable. Lancez `npm run build` avant.');
    process.exit(1);
  }

  cleanDir(deployPublicHtmlDir);

  copyDirRecursive(distDir, deployPublicHtmlDir);

  ensureDir(deployDownloadsDir);
  if (fs.existsSync(sourceDownloadsDir)) {
    copyDirRecursive(sourceDownloadsDir, deployDownloadsDir);
  }

  removeLegacyClientServerZips(deployDownloadsDir);
  const exeInDeploy = path.join(deployDownloadsDir, 'TutoDeCode-Setup.exe');
  if (fs.existsSync(exeInDeploy)) {
    fs.unlinkSync(exeInDeploy);
  }

  const msiSource = findFirstByExtInDirs(
    [msiDir, ...(externalBundleRoot ? [path.join(externalBundleRoot, 'msi')] : [])],
    '.msi',
  );

  let hasMsi = false;

  if (msiSource) {
    fs.copyFileSync(msiSource, path.join(deployDownloadsDir, 'TutoDeCode-Setup.msi'));
    hasMsi = true;
  }

  writeDeployGuide({ hasMsi });

  console.log('[prepare-hostverge-deploy] package genere dans deploy/hostverge/public_html');
  console.log(`[prepare-hostverge-deploy] MSI: ${hasMsi ? 'OK' : 'MANQUANT'}`);
}

main();
