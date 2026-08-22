# Scope Delta Analysis — Day 4 Pivot

**Project:** Maama Junior School balance-status synchronization  
**Prepared by:** Sarah Rwot-omiya  
**Decision:** Deprecate polling and adopt verified event delivery  
**Deadline:** Polling terminated within 48 hours; no extension or negotiation

## Executive summary

The original specification required polling a warehouse API every five minutes, caching messages, and exposing a query endpoint. The instructor’s Day 4 pivot made that polling method obsolete and required the system to move to event-driven delivery. The cache and query outcomes remain valuable, but polling is no longer an approved production mechanism.

| Area | Before pivot | After pivot | Scope delta |
| --- | --- | --- | --- |
| Trigger | Outbound warehouse API request every five minutes | Inbound verified webhook/event | Polling trigger removed from the approved path |
| User-visible state | State refreshed after the next poll | State updated after a valid upstream event | Push delivery replaces scheduled refresh |
| Duplicate handling | Poll cycles could repeatedly observe the same message | Event identity and idempotency are required | Explicit replay protection added |
| Security | Outbound API access was implied | HMAC signature, timestamp window, and constant-time comparison | Webhook security made explicit |
| Query | Cached state exposed to the support tool | Same query contract retained | Business outcome preserved |
| Day 3 artifact | Five-minute poller exists as a learning prototype | Poller is marked legacy and must not run in production | Historical artifact retained only for traceability |

## Removed or deprecated

The Day 3 files `src/polling-service.js` and `src/polling-server.js` remain in the repository only as historical coursework evidence. The command is renamed to `npm run start:polling:legacy`, and the documentation labels it as deprecated. No production deployment, runbook, or default start command should invoke it.

## New work caused by the pivot

The pivot required an event contract, webhook verification, replay-window enforcement, idempotent processing, provider retry expectations, durable-state requirements, and a migration/rollout decision. The implementation also needed to distinguish an unknown record from a known record whose balance is not cleared.

## What remains unchanged

The service still maintains a current-state cache and exposes a query endpoint that answers whether the available amount meets the required amount. Tests for cache updates and query responses remain part of the regression suite. The pivot changes how state arrives; it does not change the support question the system answers.

## Acceptance decision

The new specification is accepted when the provider can deliver signed events, valid events update the current state, duplicate or stale events are harmless, and the support query reflects the update without any scheduled warehouse request. The 48-hour polling termination is a release gate.
