// n.b. use @hyrious/esbuild-dev to run this file
import esbuild, { BuildOptions } from "esbuild";
import pkg from "../package.json";

const common: BuildOptions = {
  bundle: true,
  platform: "node",
  target: "node14",
  external: Object.keys(pkg.dependencies),
  sourcemap: true,
};

esbuild.build({
  ...common,
  entryPoints: ["src/index.ts"],
  outfile: pkg.main,
});

esbuild.build({
  ...common,
  entryPoints: ["src/index.ts"],
  outfile: pkg.module,
  mainFields: ["module", "main"],
  format: "esm",
});

esbuild.build({
  ...common,
  entryPoints: ["src/bin.ts"],
  outfile: pkg.bin["esbuild-serve"],
  mainFields: ["module", "main"],
  banner: { js: "#!/usr/bin/env node" },
});
