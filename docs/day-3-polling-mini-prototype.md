# Day 3 — Warehouse Polling Mini-Prototype

**Project:** Maama Junior School payment and balance synchronization  
**Prepared by:** Sarah Rwot-omiya  
**Purpose:** Implement the original specification for Day 3

## Scope

This mini-prototype implements the original requirement to call a warehouse API every five minutes, cache the returned messages, and expose a query endpoint. It is kept in a separate polling module so the earlier webhook implementation remains available for comparison with the post-pivot design.

## Components

| Component | Location | Responsibility |
| --- | --- | --- |
| Polling service | [`src/polling-service.js`](../src/polling-service.js) | Fetches the warehouse API, caches messages by `id`, tracks status, and schedules a five-minute interval. |
| Polling server | [`src/polling-server.js`](../src/polling-server.js) | Exposes `/v1/inventory/:id`, `/v1/polling/status`, and `/healthz`. |
| Tests | [`test/polling-service.test.js`](../test/polling-service.test.js) | Verifies interval, fetch, cache, failure retention, and scheduling behavior. |

## Run the prototype

```bash
WAREHOUSE_API_URL=https://example.test/inventory npm run start:polling
```

The default port is `3001`, configurable with `POLLING_PORT`. The service polls immediately on startup and then every `300000` milliseconds (five minutes). The query endpoint is `GET /v1/inventory/:id`.

The prototype expects either a JSON array of messages or an object containing a `messages` array. Each cacheable message must contain a non-empty string `id`; other fields are retained as received, with a `cachedAt` timestamp added.

## Failure behavior

A failed warehouse request records the error and retains previously cached messages. This allows the query endpoint to continue returning the last known state while operators inspect `/v1/polling/status`.

## Relationship to the pivot

This is the Day 3 implementation of the **original** specification. The later client pivot required polling to be terminated within 48 hours, so this module is a teaching/demo artifact for the original requirement and should not be treated as the final production architecture. The webhook-only implementation remains in [`src/server.js`](../src/server.js).
