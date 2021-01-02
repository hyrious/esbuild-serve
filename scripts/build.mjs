import esbuild from "esbuild";
import { performance } from "perf_hooks";
import { execSync } from "child_process";

const commonConfig = {
    bundle: true,
    platform: "node",
    external: ["esbuild", "chokidar", "tempy"],
};

console.log("[esbuild] building dist/*.js");
const t = performance.now();
Promise.all([
    esbuild.build({
        ...commonConfig,
        entryPoints: ["src/index.ts"],
        outfile: "dist/index.js",
    }),
    esbuild.build({
        ...commonConfig,
        minify: true,
        sourcemap: true,
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
