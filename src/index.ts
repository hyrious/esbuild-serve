import { listenAndServe } from "./util/listenAndServe";
import { Config } from "./util/types";

/**
 * Start a dev server.
 * @param config - tiny configuration.
 * @example
 * serve({ dir: '.' })
 */
export function serve(config?: Config) {
    config = Object.assign(
        {
            dir: ".",
            single: "",
            options: {},
        },
        config ?? {}
    );
    return listenAndServe(config);
}
