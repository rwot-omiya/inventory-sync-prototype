# Polling Deprecation Notice — Day 4

**Prepared by:** Sarah Rwot-omiya  
**Effective:** Immediately upon the Day 4 pivot  
**Deadline:** Complete termination of polling as an approved production method within 48 hours

The five-minute warehouse polling method from Day 3 is deprecated. `src/polling-service.js`, `src/polling-server.js`, and `test/polling-service.test.js` remain only to demonstrate the original specification and the learning progression. They must not be deployed or used for the final service.

The package command has been renamed from `start:polling` to `start:polling:legacy` to reduce accidental execution. The approved service is the webhook-driven implementation started with `npm start`. It verifies upstream events, prevents replay and duplicate processing, updates the current-state cache, and serves the support query endpoint.

No extension or fallback polling path is part of the Day 4 scope. Production rollout depends on the upstream provider’s webhook configuration, durable storage, HTTPS, secret management, monitoring, and retry/dead-letter handling.
