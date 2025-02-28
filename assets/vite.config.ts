import tailwindcss from '@tailwindcss/vite';
import devtools from 'solid-devtools/vite';
import Icons from 'unplugin-icons/vite';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  build: {
    outDir: '../priv/static',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/socket': {
        target: 'ws://localhost:4000',
        ws: true,
      },
    },
  },
  plugins: [
    devtools({
      autoname: true,
    }),
    solid(),
    tailwindcss(),
    Icons({
      compiler: 'solid',
    }),
  ],
});
