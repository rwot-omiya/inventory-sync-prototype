# Event-Driven Inventory Synchronization Specification

**Status:** Approved replacement specification  
**Owner:** Maama Junior School support and engineering teams  
**Pivot deadline:** The five-minute polling method is terminated within 48 hours of approval; no extension is in scope.

## 1. Purpose

Parents currently receive a mobile-money or bank confirmation but do not receive a corresponding school-system confirmation. This service keeps the support tool's response to **“Is the balance cleared?”** accurate whenever the upstream warehouse or payment-ledger state changes.

## 2. Scope

The service receives an upstream inventory/balance event, authenticates it, rejects stale or malformed messages, deduplicates retries, updates the current-state cache, and serves a low-latency query. The service does not initiate payments, send mobile-money messages, reconcile bank statements, or run a warehouse polling loop.

| Concern | Requirement |
| --- | --- |
| Event intake | `POST /webhooks/warehouse/inventory` over HTTPS |
| Authentication | HMAC-SHA256 over `timestamp.raw_body` with a shared secret |
| Replay control | Reject timestamps more than 300 seconds from server time |
| Idempotency | Accept an `eventId` once; return a successful duplicate response on retry |
| State | Cache latest `available`, `required`, and derived `cleared` values by `itemId` |
| Query | `GET /v1/balance-status/:itemId` |
| Health | `GET /healthz` |
| Polling | Removed. No five-minute timer, scheduler, or warehouse GET loop is permitted. |

## 3. Event contract

```json
{
  "eventId": "evt-1001",
  "itemId": "account-42",
  "available": 120000,
  "required": 100000,
  "occurredAt": "2026-08-22T08:00:00Z"
}
```

The sender supplies `X-Warehouse-Timestamp` as Unix seconds and `X-Warehouse-Signature` as the lowercase hexadecimal HMAC digest. The raw request bytes—not a re-serialized JSON object—are signed.

## 4. Processing flow

1. Receive the event over HTTPS.
2. Read the raw body and verify timestamp and signature using constant-time comparison.
3. Parse and validate the event schema.
4. Return `200` for an already-processed `eventId`; otherwise derive `cleared = available >= required` and update the current-state cache.
5. Return `202` after the event is accepted. The support tool reads the updated state from the query endpoint.

## 5. Query response

A successful query returns `200` with `itemId`, `balanceCleared`, `available`, `required`, `occurredAt`, `syncedAt`, and `sourceEventId`. A missing item returns `404`. The support interface should distinguish **unknown** from **not cleared** and should show the last synchronization timestamp to staff.

## 6. Reliability and security

The deployment must use HTTPS, a secret manager, secret rotation, structured audit logging, monitoring for rejected signatures and delivery lag, durable storage for events and state, and a dead-letter path for events that fail validation or processing. The sample implementation uses process memory to remain runnable without infrastructure; this is a deliberate prototype limitation, not a production storage recommendation.

## 7. Rollout and acceptance criteria

The upstream provider must be configured to deliver inventory/balance events to the webhook URL and retry transient failures. During rollout, send a signed test event, verify a `202` response, verify the query endpoint, replay the same event, and confirm that the replay does not change the record. Acceptance is complete when a new upstream state is reflected in the support query without any scheduled warehouse request.
