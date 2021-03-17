import fs from "fs";
import esbuild from "esbuild";
import { listenAndServe } from "./util/listenAndServe";
import { resolveFilePath } from "./util/resolveFilePath";
import { resolveScripts } from "./util/resolveScripts";
import { Config } from "./util/types";
import { join } from "path";

export const defaultConfig: Config = {
    dir: ".",
    single: "",
    options: {
        format: "esm",
    },
};

function getConfig(config?: Config) {
    return Object.assign(defaultConfig, config ?? {});
}

/**
 * Start a dev server.
 * @param config - tiny configuration.
 * @example
 * serve({ dir: '.' })
 */
export function serve(config?: Config) {
    return listenAndServe(getConfig(config));
}

export async function build(config?: Config) {
    config = getConfig(config);
    const indexHtml = resolveFilePath("/", config);
    if (!fs.existsSync(indexHtml)) {
        console.log("not found index.html, can not know entry points");
        return;
    }
    let tasks: Promise<unknown>[] = [];
    for (const [out, entry] of resolveScripts(fs.readFileSync(indexHtml, "utf-8"))) {
        let outfile = out;
        if (outfile === entry) {
            outfile += ".js";
        }
        tasks.push(
            esbuild.build({
                entryPoints: [join(config.dir, entry)],
                sourcemap: true,
                bundle: true,
                outfile: join(config.dir, outfile),
                minify: true,
                ...config.options,
            })
        );
    }
    await Promise.allSettled(tasks);
}
