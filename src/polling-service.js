const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

export function createPollingService({ warehouseApiUrl, fetchImpl = fetch, intervalMs = DEFAULT_INTERVAL_MS, cache = new Map() }) {
  if (!warehouseApiUrl) throw new Error('WAREHOUSE_API_URL is required');
  let timer;
  let running = false;
  let lastPollAt = null;
  let lastSuccessAt = null;
  let lastError = null;
  let messagesFetched = 0;

  async function pollOnce() {
    const startedAt = new Date().toISOString();
    lastPollAt = startedAt;
    try {
      const response = await fetchImpl(warehouseApiUrl, { headers: { accept: 'application/json' } });
      if (!response.ok) throw new Error(`warehouse_api_http_${response.status}`);
      const payload = await response.json();
      const messages = Array.isArray(payload) ? payload : payload.messages;
      if (!Array.isArray(messages)) throw new Error('warehouse_api_invalid_messages');
      for (const message of messages) {
        if (!message || typeof message.id !== 'string' || !message.id) continue;
        cache.set(message.id, { ...message, cachedAt: new Date().toISOString() });
      }
      messagesFetched = messages.length;
      lastSuccessAt = new Date().toISOString();
      lastError = null;
      return { ok: true, messagesFetched, cachedMessages: cache.size };
    } catch (error) {
      lastError = error.message;
      return { ok: false, error: lastError, cachedMessages: cache.size };
    }
  }

  function start() {
    if (running) return;
    running = true;
    void pollOnce();
    timer = setInterval(() => void pollOnce(), intervalMs);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = undefined;
    running = false;
  }

  function getMessage(id) {
    return cache.get(id) || null;
  }

  function status() {
    return { running, intervalMs, lastPollAt, lastSuccessAt, lastError, messagesFetched, cachedMessages: cache.size };
  }

  return { cache, pollOnce, start, stop, getMessage, status, intervalMs };
}

export { DEFAULT_INTERVAL_MS };
