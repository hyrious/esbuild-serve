import { importFile } from "@hyrious/esbuild-dev";
import fs from "fs";
import path from "path";
import { UserConfig } from "./types";
import { possibleExts } from "./utils";

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

/**
 * find and load `esbuild.config.ts`
 */
export async function loadConfig() {
  for (const ext of possibleExts) {
    const file = lookupFile(`esbuild.config.${ext}`);
    if (file) {
      return (await importFile(file)).default as UserConfig;
    }
  }
}
