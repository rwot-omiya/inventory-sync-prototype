# Scope Delta Analysis

**Project:** Maama Junior School inventory and balance-status synchronization  
**Decision:** Replace five-minute polling with verified webhooks  
**Prepared by:** Manus AI  
**Date:** 2026-08-22

## Executive summary

The original specification asked for a warehouse API poll every five minutes, message caching, and a query endpoint. The client later imposed a non-negotiable requirement that polling be terminated within 48 hours with no extension or negotiation. The delivered scope therefore preserves the cache and query outcomes while replacing the transport and trigger mechanism with an authenticated event handler.

| Dimension | Original specification | Final specification | Delta |
| --- | --- | --- | --- |
| Trigger | Warehouse API request every five minutes | Upstream warehouse event delivered to webhook | Polling removed; push delivery added |
| Freshness | At most five minutes, subject to poll success | Provider delivery latency plus retry behavior | Potentially lower latency; provider delivery is now a dependency |
| Security | API credentials and outbound request controls implied | HMAC signature, timestamp window, constant-time comparison | Security controls made explicit |
| State | Cache messages | Cache latest normalized state and event identity | Cache retained; idempotency added |
| Query | Expose a query endpoint | `GET /v1/balance-status/:itemId` | Contract made explicit |
| Failure handling | Poll retry/backoff to be designed | Webhook retry, deduplication, dead-letter path required | Responsibility shifts to sender/receiver contract |
| Deadline | No fixed termination deadline | Polling terminated within 48 hours | Hard constraint governs delivery |

## What was removed

The final code contains no warehouse API client, five-minute interval, scheduler, polling loop, or outbound inventory request. This is intentional. Retaining dormant polling code would create an operational ambiguity and could violate the deadline by allowing the obsolete mechanism to be reactivated accidentally.

## What was added

The service now verifies `X-Warehouse-Timestamp` and `X-Warehouse-Signature`, rejects stale or invalid messages, deduplicates by `eventId`, derives the cleared state, updates the cache, and exposes a query endpoint. The specification also identifies production hardening work: durable state, observability, secret rotation, HTTPS, and dead-letter handling.

## Risks and mitigations

Webhook delivery depends on the upstream system supporting callbacks and correctly retrying failed deliveries. The integration owner must validate that capability before production rollout. The receiver's replay window and idempotency controls limit duplicate and delayed-message effects. A durable event log and alerting should be added before the service becomes the system of record.

## Acceptance decision

The pivot is accepted because the business outcome—accurate support responses after a state change—is preserved, while the prohibited mechanism is removed. The 48-hour termination requirement is treated as a release gate, not as a future enhancement.
