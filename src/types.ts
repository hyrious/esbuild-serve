import type { BuildOptions, ServeOptions } from "esbuild";

export interface UserConfig {
  serve?: ServeOptions;
  build?: BuildOptions;
  /** Serve as single-page application. */
  single?: boolean;
}
