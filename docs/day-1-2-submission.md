# Day 1–2 Submission Record

**Project:** Maama Junior School payment and balance-status synchronization  
**Working days covered:** Day 1 and Day 2  
**Status:** Working prototype

## Day 1 — Understand the problem and define the solution

The problem identified was that parents receive confirmation from the mobile-money provider or bank, but the school support system does not reliably reflect whether the payment has cleared. The target support response is **“Is the balance cleared?”**

The first-day deliverable defines a webhook-driven approach. The service receives an update from the upstream warehouse or payment-ledger system, verifies the message, stores the latest state, and exposes a query endpoint. The original five-minute polling method is not included because the later pivot requires it to be terminated within 48 hours.

The Day 1 learning and blocker record is captured in the [Learning & Blocker Journal](learning-and-blocker-journal.docx). The provider-neutral event contract and security rules are in the [event-driven specification](event-driven-specification.md).

## Day 2 — Implement and verify the prototype

The second-day deliverable implements `POST /webhooks/warehouse/inventory` and `GET /v1/balance-status/:itemId`. The webhook handler preserves the raw request body, checks an HMAC-SHA256 signature, rejects stale timestamps, validates the event, prevents duplicate processing by `eventId`, and updates the current-state cache. The query endpoint returns `balanceCleared` based on `available >= required`.

The implementation is in [`src/server.js`](../src/server.js), and automated checks are in [`test/server.test.js`](../test/server.test.js). The tests cover valid signatures, invalid signatures, stale messages, idempotency, cache updates, and query responses.

## Evidence and limitation

The prototype passes the automated test suite. It is suitable as the Day 1–2 working mini-prototype. Production completion still requires the actual provider’s webhook configuration, durable storage, HTTPS deployment, secret management, monitoring, and end-to-end testing with the school’s live system.
