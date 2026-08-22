# Learning & Blocker Journal

**Project:** Maama Junior School inventory synchronization  
**Author:** SARAH RWOT-OMIYA
**Date:** 22 August 2026

## Context

Parents reported receiving a mobile-money or bank notification but no confirmation from the school system. The delivery objective is to keep the support tool's “Is the balance cleared?” answer accurate after an upstream balance or inventory change.

## Learning log

| Entry | Learning | Design consequence |
| --- | --- | --- |
| 1 | A five-minute poll can leave support staff looking at stale state and creates an avoidable recurring dependency. | Preserve the cache and query contract but remove the polling trigger. |
| 2 | An event receiver must authenticate the raw message before parsing or applying it. | Verify HMAC over `timestamp.raw_body` and use a bounded timestamp window. |
| 3 | Providers retry deliveries, so a successful response must not imply that every delivery is new. | Deduplicate by `eventId` and return a successful duplicate response. |
| 4 | “Not cleared” and “unknown” are different support outcomes. | Return `404` for unknown records and `balanceCleared: false` only for known insufficient state. |

## Blocker log

| Blocker | Impact | Resolution or owner action |
| --- | --- | --- |
| The upstream warehouse/payment provider was not named in the brief. | Provider-specific webhook registration and signature headers cannot be completed from the brief alone. | Use a documented provider-neutral adapter contract; integration owner must map the provider's callback format before production. |
| No production database or deployment credentials were supplied. | A process restart loses the prototype cache. | Keep the runnable prototype in memory and record durable storage as a release hardening item. |
| The client deadline prohibits extensions. | Polling cannot be retained as a fallback. | Delete polling code and make webhook delivery a release prerequisite. |

## Delivered evidence

The repository contains a webhook handler, HMAC verification, replay protection, idempotent cache update, query endpoint, automated tests, an event-driven specification, a Scope Delta Analysis, and this journal. A separate confidential Adaptability Index records the pivot response.

## Follow-up checklist

Before production, configure the provider callback, place the service behind HTTPS, use a secret manager, persist event and current-state data, add delivery-lag and rejection metrics, and test provider retries and out-of-order events. These items do not reopen polling; they harden the chosen event-driven design.
