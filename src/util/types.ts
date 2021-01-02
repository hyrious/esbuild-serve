import { BuildOptions } from "esbuild";

export interface Config {
    dir: string;
    single: string;
    options: BuildOptions;
}
