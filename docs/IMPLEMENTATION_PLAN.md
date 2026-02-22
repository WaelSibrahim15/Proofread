# JuriVertō Implementation Plan

## 1) What we are changing from TRANSLA-T-800
Current pain points:
- high latency from multi-provider arbitration and judging
- frequent provider failures causing unstable UX
- low explainability of final selection decisions

Decision:
- default path becomes single-pass translation + constrained proofreading
- old arbiter path can remain an optional "HQ Slow Mode" later, not default

## 2) Scope for v1
In scope:
- translation via Provider A (default) and Provider B (fallback)
- proofreading pass (your existing proofreading logic/service integration)
- deterministic guardrails + validation checks
- end-user trace panel showing each step and timing

Out of scope for v1:
- multi-model fan-out arbitration
- COMET/Judge scoring loops
- complex reranking pipelines

## 3) Target request pipeline
1. Validate request and normalize text
2. Translate with primary provider (timeout budget, retries)
3. If failed/timeout -> fallback provider
4. Proofread translated output with constrained prompt
5. Run hard checks
   - number/date/amount consistency
   - named entities consistency (basic pass)
   - glossary constraints
6. Build response
   - final text
   - diff summary (proofread vs raw translation)
   - trace object (provider used, durations, fallback used, checks)

## 4) API design (proposed)
POST `/api/v1/translate`
- input: sourceText, sourceLang, targetLang, domain, glossaryId?, strictness?
- output:
  - `translation`
  - `proofreadTranslation`
  - `finalText`
  - `trace`: [{step, provider, durationMs, status, metadata}]
  - `checks`: [{name, status, details}]
  - `warnings`: []

GET `/api/v1/providers/health`
- lightweight provider reachability and latency snapshot

## 5) Prompting strategy for proofreading pass
Constrained proofread prompt requirements:
- preserve legal meaning exactly
- preserve numbers, dates, names, references, citations
- avoid adding/removing obligations or conditions
- output only corrected target-language text
- improve grammar/fluency and legal register only

## 6) UI plan (borrow from TRANSLA-T-800)
Reuse from existing frontend:
- page structure and major panels
- input/output editors
- settings surfaces

Add/replace:
- "Translation trace" panel (always visible/collapsible)
- "What changed in proofreading" diff chip/summary
- provider status badge (Primary/Fallback)

## 7) Integration with your existing proofreading app
Integration modes:
- Mode A (preferred): import proofreading logic as internal module/service
- Mode B: call proofreading app via internal API endpoint

Recommendation:
- start with Mode B for speed of delivery
- move to Mode A after contract stabilizes

Contract needed:
- input: target language text + constraints
- output: proofread text + metadata (tokens, duration, confidence if available)

## 8) Milestones
M0 (1-2 days): Project setup
- scaffold backend/frontend in new folder
- copy/reuse UI shell from TRANSLA-T-800 frontend
- define API contracts and trace schema

M1 (2-4 days): Core pipeline
- primary translation provider
- fallback provider
- timeout/retry policy
- proofread integration

M2 (2-3 days): Trust layer
- checks (numbers/dates/named entities)
- trace UI
- proofread-diff summary

M3 (1-2 days): Hardening
- failure-mode testing
- latency profiling
- prompt tuning for legal text

## 9) Honest risks and mitigations
Risk: proofreader may alter legal meaning.
Mitigation: strict prompt + invariant checks + optional user diff approval.

Risk: fallback quality mismatch.
Mitigation: language-pair specific provider preference table.

Risk: still too slow for long documents.
Mitigation: chunking strategy + stream partial progress + strict timeout budget.

## 10) Definition of done for v1
- p95 response time materially lower than current default flow
- successful completion rate improved under provider instability
- every result exposes clear step-by-step trace
- user can see and review proofreading deltas
