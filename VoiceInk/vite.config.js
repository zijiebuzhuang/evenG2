import { defineConfig } from 'vite';

const base = process.env.VITE_BASE_PATH || './';
const appVersion = process.env.npm_package_version || '0.0.0';

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  server: {
    host: '0.0.0.0',
    port: 5273,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
});
