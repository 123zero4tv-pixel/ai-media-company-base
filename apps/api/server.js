const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 8787);
const ROOT = path.resolve(__dirname, '../..');
const STATE_FILE = path.join(ROOT, 'company-core', 'state.json');
const FALLBACK_STATE_FILE = path.join(ROOT, 'company-core', 'state.example.json');
const WEB_ROOT = path.join(ROOT, 'apps', 'web');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp'
};

function readState() {
  const file = fs.existsSync(STATE_FILE) ? STATE_FILE : FALLBACK_STATE_FILE;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function send(res, status, body, type) {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2), 'application/json; charset=utf-8');
}

function serveWeb(req, res) {
  const pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(WEB_ROOT, relative);
  if (!file.startsWith(WEB_ROOT) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  }
  const ext = path.extname(file).toLowerCase();
  return send(res, 200, fs.readFileSync(file), MIME[ext] || 'application/octet-stream');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, service: 'ai-media-company-api', state: 'company-core' });
  }

  if (req.method === 'GET' && url.pathname === '/api/company-state') {
    try {
      return sendJson(res, 200, readState());
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message });
    }
  }

  if (req.method === 'GET') return serveWeb(req, res);
  return sendJson(res, 405, { ok: false, error: 'Method not allowed' });
});

server.listen(PORT, () => {
  console.log(`AI Media Company listening on http://localhost:${PORT}`);
});
