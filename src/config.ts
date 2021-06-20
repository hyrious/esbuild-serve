import { importFile } from "@hyrious/esbuild-dev";
import { BuildOptions } from "esbuild";
import fs from "fs";
import path from "path";
import { UserConfig } from "./types";
import { lookupIndexHtml, possibleExts, searchEntries } from "./utils";

function lookupFile(filename: string, dir = process.cwd()): string | undefined {
  const file = path.join(dir, filename);
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return file;
  }
  const parentDir = path.dirname(dir);
  if (parentDir !== dir) {
    return lookupFile(filename, parentDir);
  }
}

async function loadRawConfig() {
  for (const ext of possibleExts) {
    const file = lookupFile(`esbuild.config.${ext}`);
    if (file) {
      return (await importFile(file)).default as UserConfig;
    }
  }
}

export async function loadConfig(dir = process.cwd()) {
  const indexHTML = lookupIndexHtml(dir);
  if (!indexHTML) {
    console.warn("not found index.html");
  }
  const config = await loadRawConfig();
  const servedir = indexHTML ? path.dirname(indexHTML) : dir;
  const buildOptions = indexHTML && searchEntries(fs.readFileSync(indexHTML, "utf8"), servedir);
  const result: Required<UserConfig> = {
    serve: { host: "localhost", servedir, ...config?.serve },
    build: { bundle: true, sourcemap: true, ...buildOptions, ...config?.build },
  };
  return result;
}

export function printCommandLine(servedir: string | undefined, options: BuildOptions) {
  const args: string[] = [];
  servedir = servedir ? path.relative(process.cwd(), servedir) : ".";
  if (servedir === ".") {
    args.push("--serve");
  } else {
    args.push(`--servedir=${servedir}`);
  }
  for (const [k, v] of Object.entries(options)) {
    if (k === "entryPoints") {
      if (Array.isArray(v)) {
        args.push(v.map((e) => JSON.stringify(e)).join(" "));
      } else {
        for (const [out, src] of Object.entries(v)) {
          args.push(`${out}=${JSON.stringify(src)}`);
        }
      }
    } else if (k === "plugins") {
      // skip plugins as we can not use them in command line
    } else {
      const key = "--" + k.replace(/(?<=[a-z])[A-Z]/g, (e) => "-" + e.toLowerCase());
      if (v === true) {
        args.push(key);
      } else if (v === false) {
        args.push(`${key}=false`);
      } else if (Array.isArray(v)) {
        for (const value of v) {
          args.push(`${key}:${JSON.stringify(value)}`);
        }
      } else if (typeof v === "object") {
        for (const [kk, value] of Object.entries(v)) {
          args.push(`${key}:${kk}=${JSON.stringify(value)}`);
        }
      } else {
        args.push(`${key}=${JSON.stringify(v)}`);
      }
    }
  }
  console.log(`esbuild ${args.join(" ")}`);
}
