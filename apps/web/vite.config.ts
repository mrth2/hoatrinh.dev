import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid({ ssr: true })],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
});
