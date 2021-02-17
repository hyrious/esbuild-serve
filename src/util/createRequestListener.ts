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
import { sendCss, sendHtml, sendJs, sendText } from "./sendWithType";
import { Config } from "./types";

export function createRequestListener(config: Config) {
    const clients = new Set<{
        res: ServerResponse;
        path: string | null;
    }>();
    const fileMap = new Map<string, string>();

    watch(config.dir).on("all", async (_event, _path) => {
        for (const { res, path } of clients) {
            if (config.crazy && path != null) {
                const file = resolveFilePath(path, config);
                const html = await readFile(file, "utf-8");
                if (file.endsWith(".html")) {
                    const dir = resolveDirname(path);
                    for (const [k, v] of resolveScripts(html)) {
                        const key = join(dir, k).replace(/\\/g, "/");
                        const value = join(dir, v).replace(/\\/g, "/");
                        fileMap.set(key, value);
                    }
                    res.write(`data: ${JSON.stringify({ type: "crazy", html })}\n\n`);
                } else {
                    res.write(`data: {"type":"refresh"}\n\n`);
                }
            } else {
                res.write(`data: {"type":"refresh"}\n\n`);
            }
        }
    });

    return async (req: IncomingMessage, res: ServerResponse) => {
        const url = new URL(req.url!, "http://localhost/");
        const pathname = url.pathname;

        if (req.method === "GET") {
            let file = pathname;

            if (file === "/__client") {
                return sendClient(res);
            } else if (file === "/__server") {
                const path = url.searchParams.get("path");
                const client = { res, path };
                clients.add(client);
                req.socket.addListener("close", () => {
                    clients.delete(client);
                });
                return sendServer(res);
            }

            file = resolveFilePath(file, config);

            if (fileMap.has(pathname)) {
                const path = fileMap.get(pathname);
                const file = resolveFilePath(path!, config);
                const js = await build(file, config.options);
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
                } else if (file.endsWith(".css")) {
                    sendCss(res, text);
                } else {
                    sendText(res, text);
                }
            } catch {
                await notFound(res);
            }
        } else {
            await notFound(res);
        }
    };
}
