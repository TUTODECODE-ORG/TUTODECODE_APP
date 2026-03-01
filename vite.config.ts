import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const viteCacheDir = process.platform === 'win32' && process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, 'tutodecode', 'vite-cache')
  : path.resolve(__dirname, 'node_modules/.vite')
const devPort = Number.parseInt(process.env.VITE_PORT || process.env.PORT || '5173', 10)
const resolvedDevPort = Number.isFinite(devPort) ? devPort : 5173

// https://vite.dev/config/
export default defineConfig({
  base: './',
  cacheDir: viteCacheDir,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuration pour Tauri
  clearScreen: false,
  server: {
    port: resolvedDevPort,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
    host: '0.0.0.0',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: Number.parseInt(process.env.VITE_HMR_PORT || String(resolvedDevPort), 10),
    },
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    // Tauri supports es2021
    target: ['es2021', 'chrome100', 'safari13'],
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'xterm': ['@xterm/xterm', '@xterm/addon-fit'],
          'webcontainer': ['@webcontainer/api'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@webcontainer/api'],
  },
})
