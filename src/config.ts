import esbuild, { BuildOptions, ServeOptions } from "esbuild";
import fs from "fs";
import path from "path";

export interface UserConfig {
  build: BuildOptions;
  serve: ServeOptions;
}

export function defineConfig(options: Partial<UserConfig>) {
  return options;
}

function lookupPackageJson(dir = process.cwd()): string | undefined {
  const file = path.join(dir, "package.json");
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return file;
  } else {
    const parent = path.dirname(dir);
    if (parent !== dir) {
      return lookupPackageJson(parent);
    }
  }
}

async function bundleConfigFile(file: string, mjs = false) {
  const pkg = lookupPackageJson();
  let external: string[] | undefined;
  if (pkg) {
    const json = JSON.parse(fs.readFileSync(pkg, "utf-8"));
    external = [
      ...Object.keys(json.dependencies || {}),
      ...Object.keys(json.devDependencies || {}),
    ];
  }
  const result = await esbuild.build({
    entryPoints: [file],
    platform: "node",
    format: mjs ? "esm" : "cjs",
    bundle: true,
    write: false,
    external,
  });
  return result.outputFiles[0].text;
}

// basically copy from vite
export async function loadConfig() {
  const root = process.cwd();

  let resolvedPath: string | undefined;
  let isTS = false;
  let isMjs = false;

  try {
    const pkg = lookupPackageJson();
    if (pkg && JSON.parse(pkg).type === "module") {
      isMjs = true;
    }
  } catch {}

  const js = path.resolve(root, "esbuild.config.js");
  if (fs.existsSync(js)) resolvedPath = js;

  if (!resolvedPath) {
    const mjs = path.resolve(root, "esbuild.config.mjs");
    if (fs.existsSync(mjs)) {
      resolvedPath = mjs;
      isMjs = true;
    }
  }

  if (!resolvedPath) {
    const ts = path.resolve(root, "esbuild.config.ts");
    if (fs.existsSync(ts)) {
      resolvedPath = ts;
      isTS = true;
    }
  }

  if (!resolvedPath) {
    return null;
  }

  try {
    let userConfig: UserConfig | undefined;

    if (isMjs) {
      const fileUrl = require("url").pathToFileURL(resolvedPath);
      if (isTS) {
        const code = await bundleConfigFile(resolvedPath, true);
        fs.writeFileSync(resolvedPath + ".js", code);
        userConfig = (await (0, eval)(`import(fileUrl + '.js?t=${Date.now()}')`)).default;
        fs.unlinkSync(resolvedPath + ".js");
      } else {
        userConfig = (await (0, eval)(`import(fileUrl + '.js?t=${Date.now()}')`)).default;
      }
    } else {
      try {
        delete require.cache[require.resolve(resolvedPath)];
        userConfig = require(resolvedPath);
      } catch {
        const code = await bundleConfigFile(resolvedPath);
        fs.writeFileSync(resolvedPath + ".js", code);
        const raw = require(resolvedPath + ".js");
        fs.unlinkSync(resolvedPath + ".js");
        userConfig = raw.__esModule ? raw.default : raw;
      }
    }

    return userConfig || null;
  } catch {
    console.error("can not load config file at", resolvedPath);
    console.error("will assume no config");
    return null;
  }
}

function guessEntryPoints() {
  for (const basename of ["index", "main", "src/index", "src/main"]) {
    for (const extname of ["js", "mjs", "jsx", "ts", "tsx"]) {
      const fullname = `${basename}.${extname}`;
      if (fs.existsSync(fullname) && fs.statSync(fullname).isFile()) {
        return [fullname];
      }
    }
  }
}

export function defaultConfig(): UserConfig {
  return {
    build: {
      entryPoints: guessEntryPoints(),
      platform: "browser",
      format: "esm",
    },
    serve: {
      servedir: ".",
      host: "localhost",
    },
  };
}

export async function userConfig() {
  const config = await loadConfig();
  if (!config) return defaultConfig();
  const { build, serve } = defaultConfig();
  return {
    build: { ...build, ...config.build },
    serve: { ...serve, ...config.serve },
  };
}
