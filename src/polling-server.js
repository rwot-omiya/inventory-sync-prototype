import http from 'node:http';
import { createPollingService } from './polling-service.js';

const PORT = Number(process.env.POLLING_PORT || 3001);
const warehouseApiUrl = process.env.WAREHOUSE_API_URL || 'http://localhost:4000/inventory';
const poller = createPollingService({ warehouseApiUrl });

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

export function createPollingServer({ service = poller } = {}) {
  return http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/healthz') return json(res, 200, { ok: true, mode: 'five-minute-polling' });
    if (req.method === 'GET' && req.url === '/v1/polling/status') return json(res, 200, service.status());
    if (req.method === 'GET' && req.url?.startsWith('/v1/inventory/')) {
      const id = decodeURIComponent(req.url.split('/').pop());
      const message = service.getMessage(id);
      return message ? json(res, 200, message) : json(res, 404, { error: 'not_found', id });
    }
    return json(res, 404, { error: 'not_found' });
  });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  poller.start();
  createPollingServer().listen(PORT, () => console.log(`day-3 polling prototype listening on ${PORT}; interval=${poller.intervalMs}ms`));
}
