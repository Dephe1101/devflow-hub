import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

function manifestPlugin() {
  return {
    name: 'manifest-plugin',
    closeBundle() {
      const manifestPath = resolve(__dirname, 'dist/manifest.json');
      if (fs.existsSync(manifestPath)) {
        let manifest = fs.readFileSync(manifestPath, 'utf-8');
        const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd());
        const webAppUrl = env.VITE_WEB_APP_URL as string;
        const apiUrl = env.VITE_API_BASE_URL as string;

        if (!webAppUrl || !apiUrl) {
          console.warn('Missing VITE_WEB_APP_URL or VITE_API_BASE_URL in environment variables.');
        }

        try {
          const apiOrigin = new URL(apiUrl).origin + '/*';
          manifest = manifest.replace(/__WEB_APP_URL__/g, webAppUrl + '/*');
          manifest = manifest.replace(/__API_ORIGIN__/g, apiOrigin);
          fs.writeFileSync(manifestPath, manifest);
        } catch (e) {
          console.error('Failed to parse URL in manifest plugin', e);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), manifestPlugin()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
