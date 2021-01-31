import { BuildOptions, Service, startService } from "esbuild";
import { readFile } from "fs/promises";
import os from "os";
import fs from "fs";
import { join } from "path";

let service: Service | undefined;

function newTempFileName(): string {
    return join(os.tmpdir(), Math.random().toString(36).substring(2) + ".js");
}

export async function build(entry: string, options?: BuildOptions) {
    if (service == null) {
        service = await startService();
    }

    return new Promise<string>(async (resolve) => {
        const outfile = newTempFileName();
        try {
            await service!.build({
                entryPoints: [entry],
                sourcemap: "inline",
                bundle: true,
                outfile,
                ...(options ?? {}),
            });
            const result = await readFile(outfile, "utf-8");
            await fs.promises.unlink(outfile);
            resolve(result);
        } catch {
            resolve(`console.error("[esbuild] failed to bundle ${entry}")`);
        }
    });
}
