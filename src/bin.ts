import { lstatSync } from "fs";
import minimist from "minimist";
import { basename, dirname, resolve } from "path";
import { serve, build, defaultConfig } from ".";
import { Config } from "./util/types";

const args = minimist(process.argv.slice(2));

// esbuild-serve --help
if (args.help) {
    console.log("Currently esbuild-serve has nothing to config.");
    console.log("Feel free to raise an issue at");
    console.log("https://github.com/hyrious/esbuild-serve");
    process.exit();
}

try {
    const config: Config = { ...defaultConfig };

    const dir_or_file = args._[0] ?? ".";
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

    if (args.jsx === "preact") {
        config.options.jsxFactory = "h";
    }

    if (args.build) {
        build(config);
    } else {
        serve(config);
    }
} catch {
    console.error("don't know what to serve");
    process.exit(1);
}
