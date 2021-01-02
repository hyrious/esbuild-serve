import { createServer } from "http";
import { Config } from "./types";
import { createRequestListener } from "./createRequestListener";

const port = process.env.PORT || 4000;

export function listenAndServe(config: Config) {
    // https://dev.to/halilcanozcelik/building-a-web-server-with-pure-node-js-4g6i
    // https://www.digitalocean.com/community/tutorials/nodejs-server-sent-events-build-realtime-app
    // https://developer.mozilla.org/zh-CN/docs/Server-sent_events/Using_server-sent_events

    return createServer(createRequestListener(config)).listen(port, () => {
        console.log("server is listening to http://localhost:" + port);
    });
}
