import { build, BuildOptions } from "esbuild";
import { performance } from "perf_hooks";
import { execSync } from "child_process";
import pkg from "../package.json";

const commonConfig: Partial<BuildOptions> = {
    bundle: true,
    platform: "node",
    external: Object.keys(pkg.dependencies),
    sourcemap: true,
};

console.log("[esbuild] building dist/*.js");
const t = performance.now();
Promise.all([
    build({
        ...commonConfig,
        entryPoints: ["src/index.ts"],
        outfile: "dist/index.js",
    }),
    build({
        ...commonConfig,
        minify: true,
        entryPoints: ["src/bin.ts"],
        outfile: "dist/bin.js",
        banner: "#!/usr/bin/env node",
    }),
]).catch(console.error);
console.log("[esbuild] done in", performance.now() - t, "ms");
if (process.argv[2] === "-t") {
    console.log("[tsc] emit declaration file");
    execSync("yarn build:types");
}
