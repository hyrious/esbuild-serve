import { watch } from "chokidar";
import { readFile } from "fs/promises";
import { IncomingMessage, ServerResponse } from "http";
import { join } from "path";
import { URL } from "url";
import { build } from "./esbuildService";
import { notFound } from "./notFound";
import { resolveDirname } from "./resolveDirname";
import { resolveFilePath } from "./resolveFilePath";
import { resolveScripts } from "./resolveScripts";
import { sendClient } from "./sendClient";
import { sendServer } from "./sendServer";
import { sendHtml, sendJs, sendText } from "./sendWithType";
import { Config } from "./types";

export function createRequestListener(config: Config) {
    const clients = new Set<{ res: ServerResponse }>();
    const fileMap = new Map<string, string>();

    watch(config.dir).on("all", (_event, _path) => {
        for (const { res } of clients) {
            res.write(`data: {"type":"refresh"}\n\n`);
        }
    });

    return async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url, "http://localhost/");
        const pathname = url.pathname;

        if (req.method === "GET") {
            let file = pathname;

            if (file === "/__client") {
                return sendClient(res);
            } else if (file === "/__server") {
                const client = { res };
                clients.add(client);
                req.connection.addListener("close", () => {
                    clients.delete(client);
                });
                return sendServer(res);
            }

            file = resolveFilePath(file, config);

            if (fileMap.has(pathname)) {
                const path = fileMap.get(pathname);
                const file = resolveFilePath(path, config);
                const js = await build(file);
                return sendJs(res, js);
            }

            try {
                const text = await readFile(file, "utf-8");
                if (file.endsWith(".html")) {
                    const dir = resolveDirname(pathname);
                    for (const [k, v] of resolveScripts(text)) {
                        const key = join(dir, k).replace(/\\/g, "/");
                        const value = join(dir, v).replace(/\\/g, "/");
                        fileMap.set(key, value);
                    }
                    sendHtml(res, text);
                } else {
                    sendText(res, text);
                }
            } catch {
                notFound(res);
            }
        } else {
            notFound(res);
        }
    };
}
