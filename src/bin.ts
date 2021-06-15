import type { BuildOptions } from "esbuild";
import fs from "fs";
import path from "path";
import { serve } from ".";
import { loadConfig } from "./config";
import exampleHTML from "./example.html.txt";
import { lookupIndexHtml, searchEntries } from "./utils";

function printCommandLine(servedir: string | undefined, options: BuildOptions) {
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
    } else {
      const key = "--" + k.replace(/(?<=[a-z])[A-Z]/g, (e) => "-" + e.toLowerCase());
      if (v === true) {
        args.push(key);
      } else if (v === false) {
        args.push(`${key}=false`);
      } else if (typeof v === "string") {
        args.push(`${key}=${JSON.stringify(v)}`);
      } else if (Array.isArray(v)) {
        for (const value of v) {
          args.push(`${key}:${JSON.stringify(value)}`);
        }
      } else if (typeof v === "object") {
        for (const [kk, value] of Object.entries(v)) {
          args.push(`${key}:${kk}=${JSON.stringify(value)}`);
        }
      }
    }
  }
  console.log(`esbuild ${args.join(" ")}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log("usage: esbuild-serve [dir]");
    return;
  }

  if (args[0] === "init") {
    fs.writeFileSync("index.html", exampleHTML);
    return;
  }

  const dir: string | undefined = !args[0]?.startsWith("-") ? args[0] : undefined;
  const config = await loadConfig();
  if (args.includes("--dry-run")) {
    const indexHTML = lookupIndexHtml(dir);
    if (!indexHTML) {
      console.warn("not found index.html");
    } else {
      const servedir = indexHTML ? path.dirname(indexHTML) : dir;
      const entries = searchEntries(fs.readFileSync(indexHTML, "utf8"), dir);
      const finalConfig: BuildOptions = { ...entries, ...config };
      printCommandLine(servedir, finalConfig);
    }
    return;
  } else {
    return serve(dir, config);
  }
}

main().catch(console.error);
