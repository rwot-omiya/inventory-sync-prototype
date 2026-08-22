import http from 'node:http';
import { createCheckInService } from './checkin-service.js';

const PORT = Number(process.env.CHECKIN_PORT || 3002);
const service = createCheckInService();

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function body(req) {
  let data = '';
  for await (const chunk of req) data += chunk;
  return JSON.parse(data || '{}');
}

export function createCheckInServer({ checkInService = service } = {}) {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/healthz') return json(res, 200, { ok: true, mode: 'async-queue' });
      if (req.method === 'GET' && req.url === '/v1/queue/status') return json(res, 200, checkInService.queueStatus());
      if (req.method === 'POST' && req.url === '/v1/check-ins/scan') {
        const result = checkInService.scan((await body(req)).attendeeId);
        return json(res, result.duplicate ? 200 : 202, result);
      }
      if (req.method === 'GET' && req.url?.startsWith('/v1/check-ins/')) {
        const attendeeId = decodeURIComponent(req.url.split('/').pop());
        const state = checkInService.get(attendeeId);
        return state ? json(res, 200, state) : json(res, 404, { error: 'attendee_not_found' });
      }
      if (req.method === 'POST' && req.url === '/webhooks/printer/completed') {
        const result = checkInService.complete(await body(req));
        return json(res, 202, result);
      }
      return json(res, 404, { error: 'not_found' });
    } catch (error) {
      return json(res, 400, { error: error.message || 'bad_request' });
    }
  });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  createCheckInServer().listen(PORT, () => console.log(`async check-in prototype listening on ${PORT}`));
}
