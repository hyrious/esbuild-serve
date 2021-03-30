import { defineConfig } from "./src";

export default defineConfig({
  build: {
    entryPoints: ["src/main.ts"],
    outfile: "dist/main.js",
    bundle: true,
    loader: { ".md": "text" },
  },
});
