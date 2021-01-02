import { ServerResponse } from "http";
import clientCode from "./client.txt";
import { sendJs } from "./sendWithType";

export function sendClient(res: ServerResponse) {
    return sendJs(res, clientCode);
}
