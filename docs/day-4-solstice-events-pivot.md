# Day 4 — Solstice Events Asynchronous Pivot

**Prepared by:** Sarah Rwot-omiya  
**Client:** Solstice Events Co.  
**Prototype status:** Working

## Pivot implemented

The synchronous badge-printer call has been replaced with an asynchronous flow. A kiosk scan now creates a print request and publishes it to an in-memory message queue. The attendee immediately enters `pending`; the UI must not display `Checked In` at this point. The printer vendor later calls the completion webhook, and only a successful completion changes the attendee state to `checked_in`.

## State and API contract

| Endpoint | Behavior |
| --- | --- |
| `POST /v1/check-ins/scan` | Accepts `{ "attendeeId": "..." }`, publishes one print request, and returns `202` with `pending` state. |
| `GET /v1/check-ins/:attendeeId` | Returns `pending`, `checked_in`, or `print_failed` state. |
| `POST /webhooks/printer/completed` | Accepts `{ attendeeId, requestId, success }` and applies the printer result. |
| `GET /v1/queue/status` | Shows published and pending queue counts. |
| `GET /healthz` | Returns the asynchronous queue mode. |

## Duplicate and ordering guarantees

A scan for an attendee already in `pending` or `checked_in` is treated as a duplicate and does not publish another print request. A completion callback is applied only when its `requestId` matches the current request for that attendee. A callback for an unknown or old request is acknowledged as stale and cannot change the attendee’s state. Repeated callbacks for the same request are acknowledged as duplicates.

## Run and test

```bash
npm run start:checkin
npm test
```

The check-in server listens on port `3002` by default. The implementation is in [`src/checkin-service.js`](../src/checkin-service.js) and [`src/checkin-server.js`](../src/checkin-server.js); tests are in [`test/checkin-service.test.js`](../test/checkin-service.test.js).

## Prototype limitation

The queue and attendee state are in memory for this mini-prototype. A production deployment should use a durable queue, durable attendee state, authenticated vendor callbacks, retry/dead-letter handling, and an idempotency store shared across service instances.
