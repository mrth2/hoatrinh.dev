import solid from 'vite-plugin-solid';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [solid({ ssr: true })],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
});
