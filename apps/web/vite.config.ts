import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: { '@': new URL('./src', import.meta.url).pathname },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
