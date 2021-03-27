// n.b. use @hyrious/esbuild-dev to run this file
import esbuild, { BuildOptions } from "esbuild";
import pkg from "../package.json";

const common: BuildOptions = {
  bundle: true,
  platform: "node",
  external: Object.keys(pkg.dependencies),
};

esbuild.build({
  ...common,
  entryPoints: ["src/index.ts"],
  outfile: "dist/index.js",
});

esbuild.build({
  ...common,
  entryPoints: ["src/bin.ts"],
  outfile: "dist/bin.js",
  minify: true,
  banner: { js: "#!/usr/bin/env node" },
});
