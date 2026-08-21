const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const MAX_BODY = 140 * 1024 * 1024;
const LOG_FILE = path.join(ROOT, "minimax-local.log");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      return sendJson(res, 204, {});
    }

    if (req.method === "GET" && req.url === "/api/ping") {
      logLine("PING ok");
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === "POST" && req.url === "/api/minimax/create") {
      const body = await readJson(req);
      const result = await createMiniMaxTask(body);
      return sendJson(res, 200, result);
    }

    if (req.method === "POST" && req.url === "/api/minimax/query") {
      const body = await readJson(req);
      const result = await queryMiniMaxTask(body);
      return sendJson(res, 200, result);
    }

    serveStatic(req, res);
  } catch (error) {
    const message = formatError(error);
    logLine(`ERROR ${req.method} ${req.url}: ${message}`);
    sendJson(res, 500, { error: message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`MiniMax H3 local studio: http://127.0.0.1:${PORT}`);
  logLine(`SERVER_START http://127.0.0.1:${PORT}`);
});

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativePath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, safePath);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0"
    });
    res.end(data);
  });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function createMiniMaxTask({ apiKey, apiHost, model, resolution, duration, prompt, imageDataUrl, imageDataUrls, textOnly = false }) {
  if (!apiKey) throw new Error("Missing MiniMax API key");
  if (!prompt) throw new Error("Missing prompt");
  const images = Array.isArray(imageDataUrls)
    ? imageDataUrls.filter(Boolean).slice(0, 4)
    : [imageDataUrl].filter(Boolean);
  if (!images.length && !textOnly) throw new Error("Missing character reference images");

  const payload = {
    model: model || "MiniMax-H3",
    content: [
      { type: "text", text: prompt },
      ...images.map((url) => ({ type: "image_url", image_url: { url }, role: "reference_image" }))
    ],
    duration: clampDuration(duration),
    resolution: resolution || "768P",
    ratio: "9:16"
  };
  const payloadBytes = Buffer.byteLength(JSON.stringify(payload));
  const hostname = normalizeApiHost(apiHost);
  logLine(`CREATE host=${hostname} model=${payload.model} resolution=${payload.resolution} duration=${payload.duration} ratio=${payload.ratio} images=${images.length} textOnly=${Boolean(textOnly)} promptChars=${prompt.length} payloadBytes=${payloadBytes}`);

  return minimaxRequest({
    method: "POST",
    hostname,
    path: "/v2/video_generation",
    apiKey,
    body: payload
  });
}

function queryMiniMaxTask({ apiKey, apiHost, taskId }) {
  if (!apiKey) throw new Error("Missing MiniMax API key");
  if (!taskId) throw new Error("Missing task id");
  const hostname = normalizeApiHost(apiHost);
  logLine(`QUERY host=${hostname} taskId=${taskId}`);
  return minimaxRequest({
    method: "GET",
    hostname,
    path: `/v2/query/video_generation/${encodeURIComponent(taskId)}`,
    apiKey
  });
}

function minimaxRequest({ method, hostname, path: requestPath, apiKey, body }) {
  const payload = body ? JSON.stringify(body) : "";
  const options = {
    hostname,
    path: requestPath,
    method,
    family: 4,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  };
  if (payload) {
    options.headers["Content-Length"] = Buffer.byteLength(payload);
  }

  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      let raw = "";
      response.on("data", (chunk) => {
        raw += chunk;
      });
      response.on("end", () => {
        let parsed;
        try {
          parsed = raw ? JSON.parse(raw) : {};
        } catch {
          parsed = { raw };
        }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          const message = formatMiniMaxError(response.statusCode, parsed, raw);
          logLine(`MINIMAX_ERROR ${method} ${requestPath}: ${message}`);
          reject(new Error(message));
          return;
        }
        logLine(`MINIMAX_OK ${method} ${requestPath}: HTTP ${response.statusCode}`);
        resolve(parsed);
      });
    });
    request.setTimeout(90000, () => {
      logLine(`TIMEOUT ${method} ${requestPath}`);
      request.destroy(new Error("MiniMax API request timed out"));
    });
    request.on("error", (error) => {
      logLine(`REQUEST_ERROR ${method} ${requestPath}: ${formatError(error)}`);
      reject(error);
    });
    if (payload) request.write(payload);
    request.end();
  });
}

function normalizeApiHost(value) {
  const host = String(value || "api.minimaxi.com").trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (host === "api.minimax.io" || host === "api.minimaxi.com") return host;
  throw new Error("Unsupported MiniMax API host");
}

function logLine(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  fs.appendFile(LOG_FILE, line, () => {});
}

function formatMiniMaxError(statusCode, parsed, raw) {
  const detail = parsed.error || parsed.message || parsed.status_msg || parsed.base_resp?.status_msg || raw || `HTTP ${statusCode}`;
  const message = stringifyDetail(detail);
  const code = parsed.code || parsed.status_code || parsed.base_resp?.status_code;
  return code ? `MiniMax HTTP ${statusCode}: ${message} (${code})` : `MiniMax HTTP ${statusCode}: ${message}`;
}

function formatError(error) {
  if (!error) return "Unknown server error";
  if (error.errors && Array.isArray(error.errors)) {
    const details = error.errors
      .map((item) => item.message || item.code || String(item))
      .filter(Boolean)
      .join("; ");
    return details ? `${error.message || "AggregateError"}: ${details}` : (error.message || "AggregateError");
  }
  return error.message || String(error);
}

function stringifyDetail(value) {
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data));
}

function clampDuration(value) {
  const number = Math.round(Number(value || 10));
  return Math.max(4, Math.min(15, number));
}
