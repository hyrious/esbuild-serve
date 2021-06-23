import esbuild from "esbuild";
import fs from "fs";
import cp from "child_process";
import { serve } from ".";
import { loadConfig, printCommandLine } from "./config";
import exampleHTML from "./example.html.txt";
import help from "./help.txt";

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    return console.log(help);
  }

  if (args[0] === "init") {
    return fs.writeFileSync("index.html", exampleHTML);
  }

  const dir: string | undefined = !args[0]?.startsWith("-") ? args[0] : undefined;
  const config = await loadConfig(dir);
  const buildOptions = config.build;
  if (args.includes("--build")) {
    return await esbuild.build({ minify: true, ...buildOptions });
  }

  if (args.includes("--dry-run")) {
    return printCommandLine(config.serve?.servedir, buildOptions);
  }

  if (args.includes("--single")) {
    config.single = true;
  }

  const server = await serve(dir, config);
  if (args.includes("--open")) {
    if (process.platform === "darwin") {
      cp.execSync("open http://localhost:3000");
    }
    if (process.platform === "win32") {
      cp.execSync(`start "" http://localhost:3000`);
    }
  }
  return server;
}

main().catch(console.error);
