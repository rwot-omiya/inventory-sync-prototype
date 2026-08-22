# Maama Junior School Inventory Synchronization

This repository contains a webhook-driven synchronization service for keeping the support tool's **“Is the balance cleared?”** response current after a warehouse or payment-ledger update. The service is deliberately **webhook-first**: the originally proposed five-minute warehouse polling loop is deprecated and must not be used in production. See the [Day 4 polling deprecation notice](docs/polling-deprecation-notice.md).

## Why the design changed

The non-negotiable pivot requires the polling method to be terminated within 48 hours. The service therefore receives signed inventory events from the upstream system, verifies them, deduplicates them, updates a small in-memory cache, and exposes a read endpoint for the support tool. A production deployment should replace the in-memory maps with a durable store and configure the upstream provider's retry/dead-letter policy.

## Run locally

```bash
WEBHOOK_SECRET=replace-me npm start
```

The default port is `3000`; override it with `PORT`. Run tests with `npm test`.

## API

`POST /webhooks/warehouse/inventory` accepts JSON events with `eventId`, `itemId`, `available`, `required`, and optional `occurredAt`. The upstream sender must provide `X-Warehouse-Timestamp` and `X-Warehouse-Signature`. The signature is the lowercase HMAC-SHA256 digest of `timestamp + "." + raw request body`, using `WEBHOOK_SECRET`. Timestamps outside the five-minute replay window are rejected.

`GET /v1/balance-status/:itemId` returns the current cached record, including `balanceCleared`, `available`, `required`, `sourceEventId`, and synchronization times. A missing item returns `404`. `GET /healthz` provides a liveness response.

## Example

```bash
body='{"eventId":"evt-1001","itemId":"account-42","available":120000,"required":100000}'
timestamp=$(date +%s)
signature=$(printf '%s.%s' "$timestamp" "$body" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" -hex | sed 's/^.* //')
curl -i http://localhost:3000/webhooks/warehouse/inventory \\
  -H "content-type: application/json" \\
  -H "x-warehouse-timestamp: $timestamp" \\
  -H "x-warehouse-signature: $signature" \\
  --data "$body"

curl http://localhost:3000/v1/balance-status/account-42
```

## Operational notes

The handler is idempotent by `eventId`, uses constant-time signature comparison, preserves the raw body for verification, and rejects stale messages. For production, add durable event storage, structured audit logs, metrics, TLS termination, secret rotation, and a dead-letter path. No scheduler, timer, warehouse polling client, or five-minute job exists in this implementation.

See the [event-driven specification](docs/event-driven-specification.md), [polling deprecation notice](docs/polling-deprecation-notice.md), [Scope Delta Analysis](docs/scope-delta-analysis.md), [confidential Adaptability Index](docs/adaptability-index-confidential.md), and [Learning & Blocker Journal](docs/learning-and-blocker-journal.docx).
