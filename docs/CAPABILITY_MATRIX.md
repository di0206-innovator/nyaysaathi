# NyaySaathi Canonical Capability Matrix

This document is the **single source of truth** regarding system maturity, external dependencies, production readiness, and empirical test evidence across all capabilities in NyaySaathi. Every architectural document, evaluation report, and README references this matrix.

---

## Authoritative Capability Register

| Capability | Current Status | Live? | External Dependency | Architectural Implementation & Evidence |
| :--- | :--- | :---: | :--- | :--- |
| **Authentication & Authorization** | `Production` | ✅ | Supabase Auth | Verified JWT session validation via `AuthService.getAuthenticatedUser()`; rejects mock identities, demo overrides, and spoofed `x-user-id` in production. Proved in `tests/prompt1-production-security.test.ts` & `tests/document-upload-security.test.ts`. |
| **Document Storage Security** | `Production` | ✅ | Supabase Storage / Memory Adapter | User-scoped path authorization (`user/{userId}/matters/{matterId}/documents/...`); strict 900-second (15-min) signed URL expiration; traversal defense; magic-byte MIME validation. Proved in `tests/production-durability-and-storage.test.ts`. |
| **Document Comparison** | `Production` | ✅ | None (In-Process) | Canonical comparison engine combining deterministic token overlap with normalized Levenshtein edit distance for typo tolerance; short-circuits identical clauses; detects unilateral liability shifts and ICA Section 74 penalties. Proved in `tests/document-comparison-engine.test.ts`. |
| **Grounded Legal Q&A** | `Production` | ✅ | Gemini 2.5 Flash / Rule Validator | Real claim-to-evidence validation pipeline (`qa-grounding-validator.ts`); extracts discrete claims; maps numeric values, dates, and terms against retrieved clauses; refutes unsupported assertions and suppresses unevidenced citations. Proved in `tests/qa-grounding-validator.test.ts`. |
| **Legal AI Benchmark Engine** | `Production` | ✅ | None (Empirical In-Process Evaluator) | 100-case Indian legal dispute dataset evaluating category classification, statutory retrieval, limitation window calculation under Indian Limitation Act / NI Act / CPA, evidence grounding, and ClaimSupportChecker overconfidence neutralizer. Proved in `tests/legal-benchmark.test.ts`. |
| **Legal Retrieval & RAG** | `Production / Degraded` | ⚠️ | Gemini `text-embedding-004` (768-dim) + pgvector | 768-dimensional vector cosine search across statutory corpus and evidence; transparent in-process fallback to deterministic statutory database with full provenance logging. Proved in `tests/ai-rag-multilingual.test.ts`. |
| **Document OCR & Extraction** | `Production / Degraded` | ⚠️ | Google Cloud Document AI / Tesseract.js | PDF text extraction via `pdf-parse`; OCR image extraction via Google Document AI with local Tesseract fallback; fails closed (`needs_ocr` / `needs_review`) on corrupt/empty files without hallucinating text. Proved in `tests/ocr-extraction.test.ts`. |
| **Multi-Agent Orchestration** | `Production` | ✅ | None (Directed Acyclic Graph) | 9 coordinated analytical agents (Intake, Retrieval, DocIntel, Reasoning, Timeline, Risk, Action Planner, Drafting, Safety); analytical state separated from persistent user workflow state. Proved in `tests/phase7-action-lifecycle.test.ts`. |
| **Limitation & Deadlines** | `Production` | ✅ | None (Statutory Rules Engine) | Exact limitation calculations under Indian Limitation Act 1963, Section 138 NI Act (15-day notice, 30-day filing), Consumer Protection Act (2-year bar), and RERA. Proved in `tests/persistence-and-intake.test.ts`. |
| **Rate Limiting & Concurrency** | `Production` | ✅ | Postgres RPC / In-Memory Sliding Window | Distributed atomic sliding window limiter; fails closed in production for expensive operations (`ai_analysis`, `compare_docs`, `document_extraction`) if distributed coordinator is unavailable. Proved in `tests/rate-limiter-concurrency.test.ts`. |
| **Durable Jobs & Async Processing**| `Production` | ✅ | Supabase DB / Worker Queue | Resilient background job queue (`/api/jobs/worker`); lease-based concurrency locking; exponential backoff retries; fail-closed authorization via `INTERNAL_SERVICE_KEY`. Proved in `tests/production-durability-and-storage.test.ts`. |
| **Government Portal e-Filing** | `Not integrated` | ❌ | e-Daakhil / NALSA / RERA Portals | Citizen-guided procedural dossier assembly; generates compliant petition drafts and index exhibits; formal submission requires authorized litigant/advocate submission on government portals. |
| **Postal Speed Post Dispatch** | `Not integrated` | ❌ | India Post API / Consignment Tracking | Automated generation of formal demand notices and speed post tracking logs; physical booking is citizen/advocate executed. |
| **Direct Email / SMS Gateway** | `Not integrated` | ❌ | SMTP / Indian DLT SMS Gateway | Communication records and notices are staged within the matter communication log; external broadcast is deliberately deferred to prevent unsolicited citizen outreach. |

---

## Operating Modes & Degradation Model

NyaySaathi is architected with a fail-closed production boundary and a transparent degradation tier:

```
[Citizen Request]
        │
        ▼
[Auth Boundary] ──(Unauthenticated)──► HTTP 401 Unauthorized
        │
        ▼
[Rate Limiter] ──(Limit Exceeded)──► HTTP 429 Too Many Requests
        │
        ▼
[Primary Engine: Gemini 2.5 Flash + Cloud Document AI + pgvector]
        │
        ├──► (Success) ──► Validated Grounded Output
        │
        └──► (Dependency Down / Unconfigured):
                 │
                 ├── [Production]: Fails closed with explicit AI service unavailable status
                 │
                 └── [Development / CI Test]: Deterministic rule engine fallback with `isFallback: true`
```
