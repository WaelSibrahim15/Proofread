# Architecture Decisions

## ADR-001: Simplified default pipeline
Status: accepted

We prioritize predictable speed and reliability over peak benchmark quality.
Default flow is single translation provider with one fallback + constrained proofreading.

## ADR-002: Transparency as a product requirement
Status: accepted

Each response must include a machine-readable and user-readable trace of what happened.
If users cannot explain the output path, the system is considered non-compliant.

## ADR-003: Arbitration as optional mode
Status: proposed

Legacy arbiter/reranker may return later as "HQ Slow Mode" only, not default.
