import { UserConfig } from "./config";

export function getOutfile(config: UserConfig) {
  if (config.build.outfile) {
    return config.build.outfile;
  } else if (config.build.entryPoints) {
    let name = config.build.entryPoints[0];
    if (name.endsWith(".js")) {
      return name;
    } else {
      return name + ".js";
    }
  } else {
    return "index.js";
  }
}
