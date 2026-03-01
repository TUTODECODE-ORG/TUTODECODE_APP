const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const distAssetsDir = path.join(distDir, 'assets');
const rootAssetsDir = path.join(rootDir, 'assets');
const distIndexHtml = path.join(distDir, 'index.html');
const deployHintHtml = path.join(rootDir, 'index.deploy.html');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function syncAssets() {
  if (!fs.existsSync(distAssetsDir)) {
    console.log('[sync-web-assets] dist/assets introuvable, rien a synchroniser');
    return;
  }

  ensureDir(rootAssetsDir);
  const entries = fs.readdirSync(distAssetsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const src = path.join(distAssetsDir, entry.name);
    const dst = path.join(rootAssetsDir, entry.name);
    fs.copyFileSync(src, dst);
  }

  console.log('[sync-web-assets] assets synchronises: dist/assets -> assets');
}

function createStableEntryAliases() {
  if (!fs.existsSync(distIndexHtml) || !fs.existsSync(distAssetsDir)) {
    console.log('[sync-web-assets] index ou assets introuvables, alias stables non generes');
    return;
  }

  const indexHtml = fs.readFileSync(distIndexHtml, 'utf8');
  const scriptMatch = indexHtml.match(/src="\.\/assets\/(index-[^"]+\.js)"/i);
  const styleMatch = indexHtml.match(/href="\.\/assets\/(index-[^"]+\.css)"/i);

  if (!scriptMatch && !styleMatch) {
    console.log('[sync-web-assets] aucun entry hash detecte dans dist/index.html');
    return;
  }

  if (scriptMatch) {
    const hashedJs = scriptMatch[1];
    const jsSrc = path.join(distAssetsDir, hashedJs);
    const jsStableDist = path.join(distAssetsDir, 'index.js');
    if (fs.existsSync(jsSrc)) {
      fs.copyFileSync(jsSrc, jsStableDist);
      const jsStableRoot = path.join(rootAssetsDir, 'index.js');
      ensureDir(rootAssetsDir);
      fs.copyFileSync(jsSrc, jsStableRoot);
    }
  }

  if (styleMatch) {
    const hashedCss = styleMatch[1];
    const cssSrc = path.join(distAssetsDir, hashedCss);
    const cssStableDist = path.join(distAssetsDir, 'index.css');
    if (fs.existsSync(cssSrc)) {
      fs.copyFileSync(cssSrc, cssStableDist);
      const cssStableRoot = path.join(rootAssetsDir, 'index.css');
      ensureDir(rootAssetsDir);
      fs.copyFileSync(cssSrc, cssStableRoot);
    }
  }
  console.log('[sync-web-assets] aliases stables generes: assets/index.js et assets/index.css');
}

function writeDeployHint() {
  if (!fs.existsSync(distIndexHtml)) {
    console.log('[sync-web-assets] dist/index.html introuvable, deploy hint non genere');
    return;
  }

  fs.copyFileSync(distIndexHtml, deployHintHtml);
  console.log('[sync-web-assets] index.deploy.html genere depuis dist/index.html');
}

syncAssets();
createStableEntryAliases();
writeDeployHint();
