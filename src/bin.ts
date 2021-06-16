import esbuild from "esbuild";
import fs from "fs";
import { serve } from ".";
import { loadConfig, printCommandLine } from "./config";
import exampleHTML from "./example.html.txt";

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    return console.log("usage: esbuild-serve [dir]");
  }

  if (args[0] === "init") {
    return fs.writeFileSync("index.html", exampleHTML);
  }

  const dir: string | undefined = !args[0]?.startsWith("-") ? args[0] : undefined;
  const config = await loadConfig(dir);
  const buildOptions = config.build;
  if (args.includes("--build")) {
    return esbuild.buildSync({ minify: true, ...buildOptions });
  }

  if (args.includes("--dry-run")) {
    return printCommandLine(config.serve?.servedir, buildOptions);
  }

  return serve(dir, config);
}

main().catch(console.error);
