import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { ServerResponse } from "http";
import { sendHtml } from "./sendWithType";

const TRY_FILES = ["404.html", "index.html"];

export async function notFound(res: ServerResponse) {
    for (const file of TRY_FILES) {
        if (existsSync(file)) {
            return sendHtml(res, await readFile(file, "utf-8"));
        }
    }
    res.writeHead(404);
    res.write("not found");
    res.end();
}
