import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';

export default defineConfig({
  plugins: [solid(), tailwindcss(), devtools()],
  build: {
    outDir: '../api/priv/static',
    target: 'esnext',
  },
});
