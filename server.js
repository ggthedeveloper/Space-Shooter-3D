import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const ROOT = path.resolve(__dirname);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".ogg": "audio/ogg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf"
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";

  // Prevent directory traversal
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(ROOT, safePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    res.end("403 Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found: " + reqPath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, {
      "Content-Type": contentType,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*"
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function startServer(port, maxAttempts = 10) {
  server.listen(port, () => {
    console.log("Space Battle Game server running at http://localhost:" + port + "/");
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE" && maxAttempts > 0) {
      console.log("Port " + port + " is in use, trying " + (port + 1) + "...");
      startServer(port + 1, maxAttempts - 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(DEFAULT_PORT);
