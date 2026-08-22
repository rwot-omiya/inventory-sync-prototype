import http from 'node:http';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 3000);
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'development-secret';
const MAX_SKEW_SECONDS = Number(process.env.MAX_SKEW_SECONDS || 300);
const records = new Map();
const processedEvents = new Map();

function timingSafeEqual(a, b) {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function signPayload(rawBody, timestamp, secret = WEBHOOK_SECRET) {
  return crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
}

export function verifyWebhook({ rawBody, timestamp, signature, now = Date.now(), secret = WEBHOOK_SECRET }) {
  const parsedTimestamp = Number(timestamp);
  if (!Number.isInteger(parsedTimestamp)) return { ok: false, reason: 'invalid_timestamp' };
  if (Math.abs(Math.floor(now / 1000) - parsedTimestamp) > MAX_SKEW_SECONDS) return { ok: false, reason: 'stale_timestamp' };
  const expected = signPayload(rawBody, parsedTimestamp, secret);
  if (!signature || !timingSafeEqual(expected, signature)) return { ok: false, reason: 'invalid_signature' };
  return { ok: true };
}

function json(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) req.destroy(new Error('payload_too_large'));
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function normalizeInventoryEvent(event) {
  if (!event || typeof event !== 'object') throw new Error('invalid_event');
  if (typeof event.eventId !== 'string' || !event.eventId) throw new Error('missing_event_id');
  if (typeof event.itemId !== 'string' || !event.itemId) throw new Error('missing_item_id');
  if (!Number.isFinite(event.available)) throw new Error('invalid_available');
  if (!Number.isFinite(event.required)) throw new Error('invalid_required');
  const receivedAt = event.occurredAt || new Date().toISOString();
  return {
    itemId: event.itemId,
    available: event.available,
    required: event.required,
    cleared: event.available >= event.required,
    occurredAt: receivedAt,
    syncedAt: new Date().toISOString(),
    sourceEventId: event.eventId
  };
}

export function applyInventoryEvent(event) {
  const current = records.get(event.itemId);
  if (current && current.sourceEventId === event.eventId) return { applied: false, duplicate: true, record: current };
  const next = normalizeInventoryEvent(event);
  records.set(next.itemId, next);
  processedEvents.set(event.eventId, Date.now());
  return { applied: true, duplicate: false, record: next };
}

export function createServer() {
  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/healthz') return json(res, 200, { ok: true, mode: 'webhook-only' });
      if (req.method === 'GET' && req.url?.startsWith('/v1/balance-status/')) {
        const itemId = decodeURIComponent(req.url.split('/').pop());
        const record = records.get(itemId);
        if (!record) return json(res, 404, { error: 'not_found', itemId });
        return json(res, 200, { itemId, balanceCleared: record.cleared, ...record });
      }
      if (req.method === 'POST' && req.url === '/webhooks/warehouse/inventory') {
        const rawBody = await readBody(req);
        const verification = verifyWebhook({
          rawBody,
          timestamp: req.headers['x-warehouse-timestamp'],
          signature: req.headers['x-warehouse-signature']
        });
        if (!verification.ok) return json(res, 401, { error: 'webhook_rejected', reason: verification.reason });
        let event;
        try { event = JSON.parse(rawBody); } catch { return json(res, 400, { error: 'invalid_json' }); }
        if (processedEvents.has(event.eventId)) return json(res, 200, { accepted: true, duplicate: true });
        const result = applyInventoryEvent(event);
        return json(res, 202, { accepted: true, duplicate: result.duplicate, itemId: result.record.itemId });
      }
      return json(res, 404, { error: 'not_found' });
    } catch (error) {
      return json(res, 400, { error: error.message || 'bad_request' });
    }
  });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  createServer().listen(PORT, () => console.log(`inventory sync listening on ${PORT}; webhook-only mode`));
}
