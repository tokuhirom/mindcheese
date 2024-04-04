import { defineConfig } from "vite";

export default defineConfig({
  build: {
    entry: "demo/browser.ts",
    outDir: "dist/demo",
    fileName: "browser.js",
  },
});
