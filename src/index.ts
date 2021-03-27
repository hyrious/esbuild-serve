import esbuild from "esbuild";
import chokidar from "chokidar";
import { userConfig } from "./config";
import { createServer as createHTTPServer, request, ServerResponse } from "http";
import { getOutfile } from "./utils";
export { defineConfig, UserConfig } from "./config";

export async function createServer() {
  const config = await userConfig();
  const { host, port, stop, wait } = await esbuild.serve(config.serve, config.build);
  // console.log(`[esbuild] serving http://${host}:${port}`);
  const clients = new Set<ServerResponse>();

  chokidar.watch(config.serve.servedir ?? ".").on("change", () => {
    for (const client of clients) {
      client.write("event: reload\ndata\n\n");
    }
  });

  const server = createHTTPServer((req, res) => {
    const options = {
      hostname: host,
      port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };

    const proxyReq = request(options, (proxyRes) => {
      if (req.url === "/" || (proxyRes.statusCode === 404 && req.url === "/index.html")) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`<!DOCTYPE html><html><head><script type="module">
  const source = new EventSource("__server")
  source.onopen = () => {
    console.log("[esbuild-serve] connected")
  }
  source.addEventListener("reload", () => {
    location.reload()
  })
</script><title>App</title></head>
<body><div id="app"></div>
<script type="module" src="${getOutfile(config)}"></script>
</body></html>`);
        return;
      }

      if (req.url === "/__server") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(": hello world!\n\n");
        clients.add(res);
        return;
      }

      res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });
  }).listen(3000);
  console.log(`[esbuild-serve] serving http://localhost:${3000}`);

  process.stdin.on("data", async (e) => {
    if (e.toString() === "exit\n") {
      stop();
      await wait;
      server.close();
      console.log("[esbuild-serve] stopped");
      process.stdin.pause();
    }
  });

  return server;
}

export async function build() {
  const config = await userConfig();
  await esbuild.build(config.build);
}
