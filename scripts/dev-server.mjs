import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const root = await fs.realpath(path.resolve(path.dirname(scriptPath), ".."));
const assetsRoot = path.join(root, "dist");
const imagesRoot = path.join(root, "images");
const imagePrefix = "https://img.lancloudtech.com/lanxin/webpage/images/";
const privateDirectories = new Set([
  "scripts", "docs", "workers", "ops", "node_modules", "mocks", "prompts",
  "credentials", "coverage", "tests", "test", "fixtures", "tmp", "temp",
  "dist", "dist-pages", "legacy-site", "prototypes",
]);
const privateFiles = new Set([
  "package.json", "package-lock.json", "npm-shrinkwrap.json", "do_not_edit.txt", "manifest.json",
]);
const mimeTypes = new Map(Object.entries({
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
}));

class PreviewError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const notFound = () => new PreviewError(404, "Not found");

function checkRelativePath(relative) {
  if (path.isAbsolute(relative) || relative.split(path.sep).some((part) =>
    part.startsWith(".") || privateDirectories.has(part.toLowerCase()) || privateFiles.has(part.toLowerCase())
  )) throw notFound();
}

async function publicRealPath(candidate, boundary) {
  let real;
  try {
    real = await fs.realpath(candidate);
  } catch (error) {
    if (["ENOENT", "ENOTDIR", "EACCES", "ELOOP"].includes(error.code)) throw notFound();
    throw error;
  }
  const relative = path.relative(boundary, real);
  checkRelativePath(relative);
  return real;
}

export async function resolvePreviewRequest(target) {
  if (!target?.startsWith("/") || target.startsWith("//")) throw new PreviewError(400, "Invalid path");
  const queryAt = target.indexOf("?");
  const rawPath = queryAt < 0 ? target : target.slice(0, queryAt);
  const query = queryAt < 0 ? "" : target.slice(queryAt);
  if (/%(?:2f|5c)/i.test(rawPath)) throw new PreviewError(400, "Invalid path");
  let decoded;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    throw new PreviewError(400, "Invalid path encoding");
  }
  if (/[\u0000-\u001f\u007f\\%]/.test(decoded) || decoded.includes("//")) {
    throw new PreviewError(400, "Invalid path");
  }
  const relative = decoded.slice(1);
  checkRelativePath(relative);
  const isImage = relative.startsWith("images/");
  const boundary = isImage ? imagesRoot : assetsRoot;
  const localPath = isImage ? relative.slice("images/".length) : relative;
  let file = await publicRealPath(path.resolve(boundary, localPath), boundary);
  const entry = await fs.stat(file);
  if (entry.isDirectory()) {
    if (!rawPath.endsWith("/")) return { redirect: `${rawPath}/${query}` };
    file = await publicRealPath(path.join(file, "index.html"), boundary);
  }
  const mime = mimeTypes.get(path.extname(file).toLowerCase());
  if (!mime || !(await fs.stat(file)).isFile()) throw notFound();
  return { file, mime };
}

async function handleRequest(request, response) {
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.setHeader("X-Content-Type-Options", "nosniff");
  const send = (status, body, mime = "text/plain; charset=utf-8") => {
    response.writeHead(status, { "Content-Type": mime, "Content-Length": Buffer.byteLength(body) });
    response.end(request.method === "HEAD" ? undefined : body);
  };
  if (!["GET", "HEAD"].includes(request.method)) {
    response.setHeader("Allow", "GET, HEAD");
    send(405, "Method not allowed\n");
    return;
  }
  try {
    const resolved = await resolvePreviewRequest(request.url);
    if (resolved.redirect) {
      response.setHeader("Location", resolved.redirect);
      send(308, "Redirecting\n");
      return;
    }
    let body = await fs.readFile(resolved.file);
    if (resolved.mime.startsWith("text/html")) {
      body = Buffer.from(body.toString("utf8")
        .replaceAll(imagePrefix, "/images/")
        .replace(/\s*<script\b(?=[^>]*(?:data-lan-analytics\s*=\s*["']umami["']|src\s*=\s*["']https:\/\/stats\.lancloudtech\.com\/u\.js["']))[^>]*>\s*<\/script>/gi, ""));
    }
    send(200, body, resolved.mime);
  } catch (error) {
    const status = error instanceof PreviewError ? error.status
      : ["ENOENT", "ENOTDIR", "EACCES", "ELOOP"].includes(error.code) ? 404 : 500;
    send(status, `${status === 500 ? "Preview error" : status === 404 ? "Not found" : error.message}\n`);
  }
}

function parsePort(args) {
  if (args.length === 0) return 18987;
  if (args.length !== 2 || args[0] !== "--port" || !/^\d+$/.test(args[1])) {
    throw new Error("Usage: node scripts/dev-server.mjs [--port 18987]");
  }
  const port = Number(args[1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Port must be between 1 and 65535.");
  return port;
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const port = parsePort(process.argv.slice(2));
    const server = http.createServer(handleRequest);
    server.on("error", (error) => {
      console.error(`Local preview could not start (${error.code || "server error"}).`);
      process.exitCode = 1;
    });
    server.listen(port, "127.0.0.1", () => {
      console.log(`Local prelaunch package: http://127.0.0.1:${port}/ (legacy) and /preview/ (new)`);
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
