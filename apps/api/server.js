const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 8787);
const ROOT = path.resolve(__dirname, '../..');
const STATE_FILE = path.join(ROOT, 'company-core', 'state.example.json');

function readState() {
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store'
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/health') {
    return sendJson(res, 200, { ok: true, service: 'ai-media-company-api' });
  }

  if (req.method === 'GET' && req.url === '/api/company-state') {
    try {
      return sendJson(res, 200, readState());
    } catch (error) {
      return sendJson(res, 500, { ok: false, error: error.message });
    }
  }

  sendJson(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`AI Media Company API listening on http://localhost:${PORT}`);
});
