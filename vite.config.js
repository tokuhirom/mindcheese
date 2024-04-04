// vite.config.js
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/mindmap/MindCheese.ts',
      formats: ['es', 'umd'],
      fileName: (format) => `mindcheese.${format}.js`,
      name: 'mindcheese',
    }
  },
  plugins: [dts()],
});
