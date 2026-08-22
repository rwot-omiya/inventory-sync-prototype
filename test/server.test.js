import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { applyInventoryEvent, signPayload, verifyWebhook, createServer } from '../src/server.js';

const secret = 'test-secret';

test('accepts a correctly signed, recent webhook', () => {
  const rawBody = JSON.stringify({ eventId: 'evt-1', itemId: 'term-1', available: 120, required: 100 });
  const timestamp = Math.floor(Date.now() / 1000);
  assert.deepEqual(verifyWebhook({ rawBody, timestamp, signature: signPayload(rawBody, timestamp, secret), secret }), { ok: true });
});

test('rejects tampered and stale webhooks', () => {
  const timestamp = Math.floor(Date.now() / 1000);
  const rawBody = '{}';
  assert.equal(verifyWebhook({ rawBody, timestamp, signature: 'bad', secret }).reason, 'invalid_signature');
  assert.equal(verifyWebhook({ rawBody, timestamp: timestamp - 301, signature: signPayload(rawBody, timestamp - 301, secret), secret }).reason, 'stale_timestamp');
});

test('applies an event once and derives cleared status', () => {
  const event = { eventId: 'evt-test', itemId: 'account-1', available: 50, required: 50 };
  const first = applyInventoryEvent(event);
  const second = applyInventoryEvent(event);
  assert.equal(first.applied, true);
  assert.equal(first.record.cleared, true);
  assert.equal(second.duplicate, true);
});

test('serves the live balance-status query after a signed webhook', async t => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, resolve));
  t.after(() => server.close());
  const port = server.address().port;
  const body = JSON.stringify({ eventId: `evt-${Date.now()}`, itemId: 'account-query', available: 25, required: 100 });
  const timestamp = Math.floor(Date.now() / 1000);
  const response = await request({ port, path: '/webhooks/warehouse/inventory', method: 'POST', body, headers: {
    'x-warehouse-timestamp': String(timestamp),
    'x-warehouse-signature': signPayload(body, timestamp)
  }});
  assert.equal(response.status, 202);
  const query = await request({ port, path: '/v1/balance-status/account-query', method: 'GET' });
  assert.equal(query.status, 200);
  assert.equal(JSON.parse(query.body).balanceCleared, false);
});

function request({ port, path, method, body = '', headers = {} }) {
  return new Promise((resolve, reject) => {
    const req = http.request({ port, path, method, headers: { ...(body ? { 'content-length': Buffer.byteLength(body) } : {}), ...headers } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}
