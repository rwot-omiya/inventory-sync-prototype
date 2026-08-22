import test from 'node:test';
import assert from 'node:assert/strict';
import { createPollingService, DEFAULT_INTERVAL_MS } from '../src/polling-service.js';

test('uses the required five-minute default interval', () => {
  const service = createPollingService({ warehouseApiUrl: 'https://warehouse.test/inventory', fetchImpl: async () => ({ ok: true, json: async () => ({ messages: [] }) }) });
  assert.equal(service.intervalMs, DEFAULT_INTERVAL_MS);
});

test('polls immediately and caches warehouse messages', async () => {
  const service = createPollingService({
    warehouseApiUrl: 'https://warehouse.test/inventory',
    fetchImpl: async url => {
      assert.equal(url, 'https://warehouse.test/inventory');
      return { ok: true, json: async () => ({ messages: [{ id: 'msg-1', itemId: 'account-1', available: 150, required: 100 }] }) };
    }
  });
  const result = await service.pollOnce();
  assert.deepEqual(result, { ok: true, messagesFetched: 1, cachedMessages: 1 });
  assert.equal(service.getMessage('msg-1').available, 150);
  assert.equal(service.status().lastError, null);
});

test('retains cached messages when the warehouse API fails', async () => {
  let shouldFail = false;
  const service = createPollingService({
    warehouseApiUrl: 'https://warehouse.test/inventory',
    fetchImpl: async () => {
      if (shouldFail) return { ok: false, status: 503, json: async () => ({}) };
      return { ok: true, json: async () => [{ id: 'msg-2', state: 'cleared' }] };
    }
  });
  await service.pollOnce();
  shouldFail = true;
  const result = await service.pollOnce();
  assert.equal(result.ok, false);
  assert.equal(result.cachedMessages, 1);
  assert.equal(service.getMessage('msg-2').state, 'cleared');
  assert.equal(service.status().lastError, 'warehouse_api_http_503');
});

test('start schedules the next poll at the configured interval', async () => {
  const intervals = [];
  const originalSetInterval = global.setInterval;
  const originalClearInterval = global.clearInterval;
  global.setInterval = (fn, ms) => { intervals.push({ fn, ms }); return 123; };
  global.clearInterval = id => assert.equal(id, 123);
  try {
    const service = createPollingService({ warehouseApiUrl: 'https://warehouse.test/inventory', intervalMs: 300000, fetchImpl: async () => ({ ok: true, json: async () => ({ messages: [] }) }) });
    service.start();
    assert.equal(intervals[0].ms, 300000);
    service.stop();
  } finally {
    global.setInterval = originalSetInterval;
    global.clearInterval = originalClearInterval;
  }
});
