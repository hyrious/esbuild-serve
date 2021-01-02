import { ServerResponse } from "http";
import { injectClient } from "./injectClient";

export function sendWithType(res: ServerResponse, type: string, text: string) {
    res.setHeader("Content-Type", type);
    res.write(text);
    res.end();
}

export function sendText(res: ServerResponse, text: string) {
    return sendWithType(res, "text/plain", text);
}

export function sendHtml(res: ServerResponse, text: string) {
    return sendWithType(res, "text/html", injectClient(text));
}

export function sendJs(res: ServerResponse, text: string) {
    return sendWithType(res, "text/javascript", text);
}
