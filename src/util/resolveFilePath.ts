import { join } from "path";
import { Config } from "./types";

export function resolveFilePath(file: string, config: Config) {
    if (file.endsWith("/")) {
        file += "index.html";
    }
    file = join(config.dir, "." + file);
    return file;
}
