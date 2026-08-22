# CONFIDENTIAL — Adaptability Index

**Project:** Maama Junior School balance-status synchronization  
**Prepared by:** Sarah Rwot-omiya  
**Day:** Day 4 pivot response  
**Handling:** Internal delivery record; do not publish outside the project team

## Purpose

This index records how the implementation adapted when the instructor required the five-minute polling method to be terminated within 48 hours, with no extension or negotiation. It evaluates the delivery response rather than an individual’s personal performance.

| Adaptability dimension | Evidence | Assessment |
| --- | --- | --- |
| Constraint recognition | The 48-hour termination is recorded as a release gate in the replacement specification. | High |
| Scope control | The original cache and support query are preserved while the polling mechanism is removed from the approved production path. | High |
| Technical response | The service accepts verified events, rejects stale messages, deduplicates retries, and updates current state. | High |
| Traceability | The Day 3 poller is retained only as a clearly labeled legacy learning artifact, and the scope delta explains why. | High |
| Transparency | Provider-specific integration, durable storage, HTTPS, and monitoring limitations are explicitly recorded. | High |
| Reversibility | The provider-neutral event contract allows upstream mapping without restoring polling. | Medium-high |

## Adaptation record

The response did not attempt to negotiate the deadline or disguise the old design as the final solution. The five-minute poller was moved behind the explicit `start:polling:legacy` command and labeled deprecated. The normal webhook service remains the approved implementation path. This preserves evidence of Day 3 learning while preventing accidental use of the obsolete mechanism as the production default.

The pivot also required new safeguards: HMAC verification over the raw body, a five-minute replay window, constant-time signature comparison, event idempotency, clear unknown-versus-not-cleared semantics, and operational expectations for retries and dead-letter handling.

## Evidence

The evidence consists of the [event-driven specification](event-driven-specification.md), [Scope Delta Analysis](scope-delta-analysis.md), webhook implementation in `src/server.js`, automated tests, the Day 3 legacy polling artifact, and the Day 4 asynchronous check-in work. The repository’s test suite verifies the event path and confirms that preserved cache/query behavior remains functional.

## Residual limitations

The prototype uses process-local state and has not been connected to a named production provider. Before production release, the integration owner must configure the real callback, durable state, HTTPS, secret management, metrics, retry/dead-letter handling, and end-to-end tests. These limitations do not reopen or extend polling; they are hardening tasks for the event-driven design.

## Confidentiality note

This record contains no credentials, payment secrets, parent records, student records, or attendee personal data. It remains confidential because it documents internal decision-making and unresolved operational dependencies.
