# CONFIDENTIAL — Adaptability Index

**Handling:** Internal delivery record. Do not publish outside the project team.  
**Project:** Maama Junior School inventory synchronization  
**Prepared by:** SARAH RWOT-OMIYA  
**Date:** 2026-08-21

## Purpose

This index records how implementation decisions adapted to the client's mandatory pivot: terminate polling within 48 hours, with no extension or scope negotiation. It is an engineering delivery assessment, not a performance appraisal of an individual.

| Dimension | Evidence in delivery | Assessment |
| --- | --- | --- |
| Constraint recognition | The pivot is treated as a release gate in the replacement specification and Scope Delta Analysis. | High |
| Scope control | The implementation retains the business outcome—current balance status—while removing the prohibited polling mechanism and unrelated payment-notification expansion. | High |
| Technical adaptation | The design changes from scheduled outbound reads to signed inbound events with replay protection and idempotency. | High |
| Transparency | Trade-offs, upstream webhook dependency, prototype in-memory storage, and production hardening are documented. | High |
| Reversibility | The event contract and adapter boundary allow a provider-specific sender integration without restoring polling. | Medium-high |
| Delivery evidence | Runnable source, tests, specification, README, journal, and committed history are included. | High |

## Decision record

The response prioritized the hard deadline over preserving the original implementation shape. The polling idea was not renamed or hidden; it was removed from code and explicitly prohibited in the specification. The cache and query contract were preserved because they directly support the stated operational question, “Is the balance cleared?”

## Residual limitations

The repository contains a runnable prototype with process-local state. A production release still requires a durable database, provider-specific webhook registration, HTTPS, secret management, delivery-lag monitoring, and a dead-letter workflow. These are recorded as follow-up hardening items rather than silently treated as complete.

## Confidentiality note

This document contains no webhook secrets, tokens, parent records, student records, or payment identifiers. Any future operational copy should remain access-controlled because it describes internal delivery decisions and unresolved integration dependencies.
