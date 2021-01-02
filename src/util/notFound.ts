import { ServerResponse } from "http";

export function notFound(res: ServerResponse) {
    res.writeHead(404);
    res.write("not found");
    res.end();
}
