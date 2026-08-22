# ASSIGNMENT — DAY 3

## Warehouse Polling, Message Caching, and Query Service

**Student/Developer:** Sarah Rwot-omiya  
**Project:** Maama Junior School Payment and Balance Synchronization  
**Working day:** Day 3  
**Assignment status:** Published working assignment

## Scenario

Maama Junior School is a private institution in Tororo District, Uganda. Parents report that after paying school fees through the school’s mobile-money pay code, they receive confirmation from the mobile-money provider or bank but do not receive a timely confirmation from the school support system.

The support tool must answer the operational question **“Is the balance cleared?”** using the latest available warehouse or payment-ledger information. For Day 3, implement the original synchronization specification: call the warehouse API every five minutes, cache the returned messages, and expose an endpoint that allows the support tool to query the cached state.

## Learning outcomes

By the end of Day 3, the developer should be able to build a small scheduled integration service, call an external REST API safely, normalize and cache returned messages, expose a read-only query endpoint, retain the last known state when an upstream request fails, and test time-based behavior without waiting five real minutes.

## Assignment requirements

Build a runnable mini-prototype that satisfies all of the following requirements:

| Requirement | Acceptance condition |
| --- | --- |
| Warehouse API polling | The service polls a configurable warehouse API every five minutes, equal to `300000` milliseconds. |
| Initial refresh | The service performs one poll when it starts instead of waiting for the first five-minute interval. |
| Message cache | Returned messages are cached by a stable message identifier. |
| Query endpoint | A client can retrieve a cached message through `GET /v1/inventory/:id`. |
| Polling status | The service exposes `GET /v1/polling/status` showing the interval, last poll time, last successful poll, last error, and cache size. |
| Failure behavior | If a warehouse request fails, the service records the error and keeps previously cached messages available. |
| Configuration | The warehouse API URL and listening port can be configured through environment variables. |
| Testability | The polling interval and fetch function can be injected or controlled in tests. |
| Documentation | The repository includes setup instructions, endpoint details, assumptions, limitations, and test evidence. |

## Suggested event/message shape

The warehouse API may return an array or an object containing a `messages` array. Each cacheable message must include a non-empty string `id`; other fields should be retained.

```json
{
  "messages": [
    {
      "id": "payment-1001",
      "accountId": "parent-account-42",
      "available": 120000,
      "required": 100000,
      "status": "cleared"
    }
  ]
}
```

## Required endpoints

The polling service should provide the following interface:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Confirm that the service is running in polling mode. |
| `GET` | `/v1/polling/status` | Inspect poll timing, errors, and cache size. |
| `GET` | `/v1/inventory/:id` | Return one cached warehouse message or `404` if it is unknown. |

A successful message query should return the cached message and a `cachedAt` timestamp. An unknown identifier should return a JSON error with HTTP `404`.

## Implementation tasks

First, create a polling service with a configurable warehouse URL and a default five-minute interval. The service should make an immediate request on startup and schedule subsequent requests using a timer. Keep the poller independent from the HTTP server so it can be tested with a mocked fetch function.

Next, implement the cache. Store each valid message by its `id`, preserve the latest version received, and add a cache timestamp. Invalid messages should be skipped without crashing the entire poll cycle.

Then, expose the query and status endpoints. The status response should help an operator determine whether the service has polled successfully and whether the cache contains data. Do not expose credentials or sensitive payment information in status responses.

Finally, add automated tests. Tests must use a short injected interval or replace the timer so they do not wait five minutes. Include a successful API response, an array response, a failed API response after a successful refresh, an unknown query, and verification that the configured interval is exactly five minutes by default.

## Evidence to submit

Submit the GitHub repository link, the main polling-service source file, the HTTP server file, the automated test file, and a short README or Day 3 report explaining how to run the service. Include test output showing the number of tests passed and failures. Record at least one implementation blocker and how it was resolved in the Learning & Blocker Journal.

## Marking guide

| Area | Marks |
| --- | ---: |
| Five-minute polling and immediate startup refresh | 20 |
| Correct message caching and update behavior | 20 |
| Query and polling-status endpoints | 20 |
| Error handling and retention of last known state | 15 |
| Automated tests and testability | 15 |
| Documentation, repository structure, and evidence | 10 |
| **Total** | **100** |

## Technical limitations and note about later work

This assignment is the Day 3 implementation of the original specification. A later client pivot may require polling to be deprecated in favor of signed asynchronous events. If that pivot is introduced, the developer should preserve this assignment as historical learning evidence while clearly separating it from the approved production implementation. The Day 3 prototype may use in-memory state, but a production service would require durable storage, secure secret management, monitoring, retry handling, and an authenticated upstream integration.

**Prepared by:** Sarah Rwot-omiya
