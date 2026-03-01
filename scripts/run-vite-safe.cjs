const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const net = require('node:net');

const projectRoot = process.cwd();
const legacyCacheDir = path.join(projectRoot, 'node_modules', '.vite');
const windowsCacheDir = process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, 'tutodecode', 'vite-cache')
  : null;
const cacheDir = process.platform === 'win32' && windowsCacheDir
  ? windowsCacheDir
  : path.join(projectRoot, 'node_modules', '.vite');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isPortFree(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, host);
  });
}

async function findAvailablePort(preferredPort = 5173, maxAttempts = 25) {
  for (let offset = 0; offset <= maxAttempts; offset += 1) {
    const candidate = preferredPort + offset;
    // eslint-disable-next-line no-await-in-loop
    const freeOnLoopback = await isPortFree(candidate, '127.0.0.1');
    // eslint-disable-next-line no-await-in-loop
    const freeOnAllInterfaces = await isPortFree(candidate, '0.0.0.0');

    if (freeOnLoopback && freeOnAllInterfaces) {
      return candidate;
    }
  }

  return preferredPort;
}

async function removeDirWithRetry(dirPath, retries = 6, delayMs = 250) {
  if (!fs.existsSync(dirPath)) return;

  for (let index = 0; index < retries; index += 1) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 2, retryDelay: 100 });
      return;
    } catch (error) {
      const isLast = index === retries - 1;
      if (isLast) {
        try {
          const fallbackName = `${dirPath}_stale_${Date.now()}`;
          fs.renameSync(dirPath, fallbackName);
          return;
        } catch {
          throw error;
        }
      }
      await sleep(delayMs);
    }
  }
}

async function run() {
  try {
    await removeDirWithRetry(legacyCacheDir);
    fs.mkdirSync(cacheDir, { recursive: true });
  } catch (error) {
    console.warn('[vite-safe] Impossible de nettoyer totalement le cache Vite:', error?.message || error);
  }

  const viteExecutable = process.platform === 'win32'
    ? path.join(projectRoot, 'node_modules', '.bin', 'vite.cmd')
    : path.join(projectRoot, 'node_modules', '.bin', 'vite');
  const requestedPort = Number.parseInt(process.env.PORT || process.env.VITE_PORT || '5173', 10);
  const basePort = Number.isFinite(requestedPort) ? requestedPort : 5173;
  const selectedPort = await findAvailablePort(basePort);
  const args = ['--port', String(selectedPort), ...process.argv.slice(2)];

  if (selectedPort !== basePort) {
    console.warn(`[vite-safe] Port ${basePort} occupé, bascule automatique sur ${selectedPort}.`);
  }

  const child = spawn(viteExecutable, args, {
    stdio: 'inherit',
    cwd: projectRoot,
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      VITE_CACHE_DIR: cacheDir,
      VITE_PORT: String(selectedPort),
      PORT: String(selectedPort),
      VITE_HMR_PORT: String(selectedPort),
    },
  });

  child.on('error', (error) => {
    console.error('[vite-safe] Échec du lancement de Vite:', error?.message || error);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

run();
