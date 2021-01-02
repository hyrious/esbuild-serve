import { ServerResponse } from "http";

export function sendServer(res: ServerResponse) {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });
    res.write(": this is a comment\n\n");
}
