import { UserConfig } from "./config";

export function getOutfile(config: UserConfig) {
  if (config.build.outfile) {
    return config.build.outfile;
  }
  return "index.js";
}
