import chokidar from "chokidar";
import esbuild from "esbuild";
import http, { IncomingMessage, RequestOptions, ServerResponse } from "http";
import { UserConfig } from "./types";
import { parse, text } from "./utils";

export function defineConfig(config: UserConfig) {
  return config;
}

const headInjectRE = /<\/head>/i;
const injectHTML = `
  <script type="module">
    let serverDown = false
    const source = new EventSource("/__server")
    source.onopen = () => {
      if (serverDown) location.reload()
      console.log("[esbuild-serve] connected")
    }
    source.onerror = () => {
      console.log("[esbuild-serve] disconnected")
      serverDown = true
    }
    source.addEventListener("reload", () => {
      location.reload()
    })
    source.addEventListener("down", () => {
      console.log("[esbuild-serve] disconnected")
      serverDown = true
    })
  </script>
`;
const errorHTML = `
<!DOCTYPE html>
<html lang="en">
<meta charset="utf-8">
<title>Error</title>
${injectHTML}
<body><pre>{content}</pre>
`;

export async function serve(dir = process.cwd(), config: Required<UserConfig>) {
  const { host, port, stop, wait } = await esbuild.serve(config.serve, config.build);
  // console.log(`[esbuild] serving http://${host}:${port}`);

  const clients = new Set<ServerResponse>();
  // NOTE: we watch all changes in "current" folder, which may be wrong.
  //       wait for https://github.com/evanw/esbuild/issues/1072
  //       to see if we have better choice.
  chokidar.watch(dir).on("change", () => {
    for (const client of clients) {
      client.write("event: reload\ndata\n\n");
    }
  });

  async function indexHtml(proxyRes: IncomingMessage, res: ServerResponse) {
    let html = await text(proxyRes);
    if (headInjectRE.test(html)) {
      html = html.replace(headInjectRE, `${injectHTML}\n$&`);
    } else {
      html = injectHTML + "\n" + html;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  async function plainText(proxyRes: IncomingMessage, res: ServerResponse) {
    const str = await text(proxyRes);
    const html = errorHTML.replace("{content}", str);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }

  const server = http.createServer((req, res) => {
    const options: RequestOptions = {
      hostname: host,
      port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const pathname = parse(req.url);
    const isHTML = pathname.endsWith("/") || pathname.endsWith(".html");
    const proxyReq = http.request(options, async (proxyRes) => {
      const { statusCode = 200 } = proxyRes;
      const isResponseOk = 200 <= statusCode && statusCode <= 399;
      if (isHTML && (isResponseOk || statusCode === 404)) {
        await indexHtml(proxyRes, res);
      } else if (config.single && statusCode === 404) {
        const redirectReq = http.request({ ...options, path: "/" }, (proxyRes) => {
          if (proxyRes.headers["content-type"]?.includes("html")) {
            return indexHtml(proxyRes, res);
          } else {
            return plainText(proxyRes, res);
          }
        });
        redirectReq.end();
      } else if (statusCode >= 500) {
        await plainText(proxyRes, res);
      } else {
        res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    });

    proxyReq.on("error", (e) => {
      if ((e as any).code === "ECONNRESET") {
        // ignore "socket hang up" error
      } else {
        throw e;
      }
    });

    if (req.url === "/__server") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(": hello, world!\n\n");
      clients.add(res);
      res.on("close", () => clients.delete(res));
    } else {
      req.pipe(proxyReq, { end: true });
    }
  });

  server.listen(3000);
  console.log(`[esbuild-serve] serving http://localhost:3000`);

  process.stdin.on("data", async (e) => {
    if (e.toString().startsWith("exit")) {
      for (const client of clients) {
        client.end("event: down\ndata\n\n");
      }
      server.close();
      stop();
      await wait;
      console.log("[esbuild-serve] stopped");
      process.exit(0);
    }
  });

  return server;
}
