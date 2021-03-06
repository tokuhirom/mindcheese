import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

// const isProd = process.env.BUILD === "production";
const name = "mindcheese";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ROLLUP
if you want to view the source visit the plugins github repository
*/
`;

export default {
  input: "src/mindmap/MindCheese.ts",
  output: [
    {
      file: `dist/${name}.cjs.js`,
      format: "cjs",
      sourcemap: "inline",
      banner,
    },
    {
      file: `dist/${name}.js`,
      format: "iife",
      sourcemap: "inline",
      name,
      banner,
    },
  ],
  plugins: [typescript(), nodeResolve({ browser: true }), commonjs()],
};
