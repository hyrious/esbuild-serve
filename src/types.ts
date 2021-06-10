import type { BuildOptions, ServeOptions } from "esbuild";

export interface UserConfig {
  serve?: ServeOptions;
  build?: BuildOptions;
}
