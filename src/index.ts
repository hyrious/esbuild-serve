import chokidar from "chokidar";
import esbuild from "esbuild";
import fs from "fs";
import http, { RequestOptions, ServerResponse } from "http";
import path from "path";
import { UserConfig } from "./types";
import { lookupIndexHtml, searchEntries } from "./utils";

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

export async function serve(dir = process.cwd(), config?: UserConfig) {
  const indexHTML = lookupIndexHtml(dir);
  if (!indexHTML) {
    console.warn("not found index.html");
  }
  const servedir = indexHTML ? path.dirname(indexHTML) : dir;
  const buildOptions = indexHTML && searchEntries(fs.readFileSync(indexHTML, "utf8"), servedir);
  const { host, port, stop, wait } = await esbuild.serve(
    { host: "localhost", servedir, ...config?.serve },
    { bundle: true, ...buildOptions, ...config?.build }
  );
  // console.log(`[esbuild] serving http://${host}:${port}`);

  const clients = new Set<ServerResponse>();
  chokidar.watch(dir).on("change", () => {
    for (const client of clients) {
      client.write("event: reload\ndata\n\n");
    }
  });

  const server = http.createServer((req, res) => {
    const options: RequestOptions = {
      hostname: host,
      port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = http.request(options, (proxyRes) => {
      if (req.url === "/" || req.url === "/index.html") {
        const chunks: Buffer[] = [];
        proxyRes.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        proxyRes.on("end", () => {
          let html = Buffer.concat(chunks).toString("utf-8");
          if (headInjectRE.test(html)) {
            html = html.replace(headInjectRE, `${injectHTML}\n$&`);
          } else {
            html = injectHTML + "\n" + html;
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(html);
        });
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
  console.log(`[esbuild-serve] serving http://localhost:${3000}`);

  process.stdin.on("data", async (e) => {
    if (e.toString() === "exit\n") {
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
