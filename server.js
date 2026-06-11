const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(url.pathname);
  const filePath = pathname === "/"
    ? path.join(ROOT, "index.html")
    : path.join(ROOT, pathname);

  if (!filePath.startsWith(ROOT)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      serveIndex(res);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=86400"
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`chatbaomat: http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
});

function serveIndex(res) {
  fs.readFile(path.join(ROOT, "index.html"), (error, data) => {
    if (error) {
      send(res, 500, "Không đọc được index.html", "text/plain; charset=utf-8");
      return;
    }
    send(res, 200, data, "text/html; charset=utf-8");
  });
}

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}
