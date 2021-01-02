import { BuildOptions, Service, startService } from "esbuild";
import { readFile } from "fs/promises";
import { file } from "tempy";

let service: Service | undefined;

export async function build(entry: string, options?: BuildOptions) {
    if (service == null) {
        service = await startService();
    }

    return new Promise<string>((resolve) => {
        file.task(async (outfile) => {
            try {
                await service!.build({
                    entryPoints: [entry],
                    sourcemap: "inline",
                    bundle: true,
                    outfile,
                    ...(options ?? {}),
                });
                resolve(await readFile(outfile, "utf-8"));
            } catch {
                resolve(`console.error("[esbuild] failed to bundle ${entry}")`);
            }
        });
    });
}
