import { lstatSync } from "fs";
import { basename, dirname, resolve } from "path";
import { listenAndServe } from "./util/listenAndServe";

/**
 * Start a dev server.
 * @param argv - ARGV without 'node' and 'index.js',
 *               I mean `process.argv.slice(2)`
 * @example
 * serve()
 * serve(['dist'])
 * serve(['--help'])
 */
export function serve(argv = process.argv.slice(2)) {
    if (argv.length === 0) {
        argv.unshift(".");
    }

    if (argv[0] === "--help") {
        console.log("Currently esbuild-serve has nothing to config.");
        console.log("Feel free to raise an issue at");
        console.log("https://github.com/hyrious/esbuild-serve");
    }

    const config = {
        dir: ".",
        single: "",
    };
    const dir_or_file = argv[0];
    try {
        const stat = lstatSync(dir_or_file);
        if (stat.isFile()) {
            config.dir = resolve(dirname(dir_or_file));
            config.single = basename(dir_or_file);
        } else if (stat.isDirectory()) {
            config.dir = resolve(dir_or_file);
        } else {
            console.error("not file or directory", dir_or_file);
            console.error("what is it?");
            process.exit(1);
        }
    } catch {
        console.error("not found", dir_or_file);
        process.exit(1);
    }

    return listenAndServe(config);
}
