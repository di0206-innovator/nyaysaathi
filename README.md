# ⚖️ NyaySaathi (न्यायसाथी)
### Matter-Based Legal Action Navigator for India

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector_Ready-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

> **NyaySaathi is not an AI legal chatbot.**  
> It is an actionable, matter-centric legal navigation system designed for Indian citizens, tenants, consumers, and small enterprises. It organizes disputes, extracts evidence, assesses limitation periods, generates formal Indian legal notices, and provides direct escalation pathways to **NALSA free legal aid**, **e-Daakhil**, and **RERA**.

---

## 🧭 The 5-Stage Navigator Loop

Unlike transient chatbots that lose context and produce hallucinated certainty, NyaySaathi operates on a structured loop:

```
┌─────────────┐    ┌───────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ 1. CAPTURE  │ ─> │ 2. UNDERSTAND │ ─> │  3. ASSESS   │ ─> │   4. ACT    │ ─> │ 5. ESCALATE  │
└─────────────┘    └───────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
  Story, Files,      Chronology, OCR,     Risks, Gaps,        Notices, RTIs,     DLSA/NALSA,
  Parties, Stake     Verified Facts       Limitation Clock    Complaints, Plan   e-Daakhil, Bar
```

---

## 🏛️ 11-Layer System Architecture

```mermaid
graph TD
    UI[1. Client / UI Layer - Next.js & Tailwind CSS] --> Input[2. Input Capture Layer - Story, Files, Parties]
    Input --> MatterCtx[3. Matter Context Layer - State & Fact Aggregation]
    MatterCtx --> DocIntel[4. Document Intelligence Layer - OCR & Text Extract]
    DocIntel --> AIOrch[5. AI Orchestration Layer - 9-Agent Pipeline]
    AIOrch --> RAG[6. Legal Retrieval / RAG Layer - BNS, CPA 2019, RERA, Rent Acts]
    AIOrch --> Safety[7. Trust & Safety Layer - 4-Tier Verification & Disclaimers]
    Safety --> ActionDraft[8. Action & Drafting Layer - Legal Notices, Complaints, RTIs]
    Safety --> Escalation[9. Escalation Layer - NALSA/DLSA 15100, e-Daakhil, Advocates]
    ActionDraft --> Storage[10. Storage Layer - PostgreSQL / Supabase + pgvector]
    Escalation --> Storage
    Storage --> API[11. Backend API Layer - Next.js REST API Routes]
```

---

## 🤖 9 Internal Modular AI Agents

All AI logic is partitioned into modular, testable internal agents coordinated by a master orchestrator (`src/lib/agents/orchestrator.ts`):

1. **Intake Agent** (`intake-agent.ts`): Parses freeform narratives, normalizes party details, and identifies legal conflict classification.
2. **Document Intelligence Agent** (`doc-intel-agent.ts`): Simulates OCR text extraction, classifies lease agreements, invoices, and WhatsApp chats, and tags key clauses.
3. **Context & Timeline Agent** (`timeline-agent.ts`): Reconstructs a strict chronological milestone trail and spots missing documentary dates.
4. **Legal Retrieval Agent** (`retrieval-agent.ts`): Maps disputes to Indian statutory anchors (Bharatiya Nyaya Sanhita - BNS, Consumer Protection Act 2019, RERA Section 18, Model Tenancy Act, NI Act 138, Payment of Wages Act).
5. **Reasoning Agent** (`reasoning-agent.ts`): Synthesizes case strengths, evidentiary vulnerabilities, and anticipated counter-arguments.
6. **Risk Assessment Agent** (`risk-agent.ts`): Computes statutory limitation windows under the Indian Limitation Act 1963 and flags evidence gaps.
7. **Action Planner Agent** (`action-planner-agent.ts`): Structures a 3-phase checklist (*Immediate 0-48h*, *Short-Term 1-14d*, *Formal Escalation*).
8. **Drafting Agent** (`drafting-agent.ts`): Generates ready-to-send formal Indian Legal Demand Notices, e-Daakhil consumer complaint plaints, and 1-page Advocate Briefs.
9. **Safety Verification Agent** (`safety-agent.ts`): Enforces 4-tier output separation and injects statutory disclaimers.

---

## 🛡️ Trust & Safety: 4-Tier Classification

Every insight produced by NyaySaathi is explicitly categorized into one of four distinct tiers:

| Tier | Icon / Color | Definition | Indian Legal Example |
| :--- | :--- | :--- | :--- |
| **1. Verified Fact** | 🟢 Emerald | Direct statement grounded in uploaded agreements or verified transaction slips | *“₹75,000 security deposit paid via NEFT on 1 Feb 2025.”* |
| **2. Legal Meaning** | 🔵 Sky Blue | Plain-language explanation of statutory provisions and procedural rules | *“Under Indian tenancy law, ordinary wear and tear cannot be unilaterally deducted without GST bills.”* |
| **3. Possibility** | 🟡 Amber | Potential risk vectors, counter-arguments, and scenarios | *“Landlord may claim undocumented property damage or cite lack of joint move-out inspection.”* |
| **4. Counsel Required** | 🔴 Rose | Procedural steps requiring an enrolled advocate | *“Filing a formal vakalatnama or arguing in Court of Small Causes requires an enrolled Advocate.”* |

---

## 📂 Project Structure

```
nyaysaathi/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Global layout with Navbar & Footer
│   │   ├── page.tsx                    # Landing page & live test fixtures
│   │   ├── globals.css                 # Warm, calm Indian legal theme tokens
│   │   ├── matters/
│   │   │   ├── page.tsx                # Matter listing & category filtration
│   │   │   ├── new/page.tsx            # 4-Step guided matter capture wizard
│   │   │   └── [id]/page.tsx           # Full Matter Command Center
│   │   └── api/
│   │       └── matters/
│   │           ├── route.ts            # GET (list), POST (create)
│   │           └── [id]/
│   │               ├── route.ts        # GET, PATCH, DELETE
│   │               └── analyze/route.ts# Trigger 9-Agent Pipeline re-analysis
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Top bar with NALSA 15100 helpline badge
│   │   │   └── Footer.tsx              # Trust statements & official portal links
│   │   └── matter/
│   │       ├── MatterHeader.tsx        # Title, metadata, and re-analysis trigger
│   │       ├── TrustSafetyCard.tsx     # 4-tier transparent classification view
│   │       ├── TimelineView.tsx        # Chronological trail with evidence tags
│   │       ├── RiskAlertBox.tsx        # Risk vectors & missing info questionnaire
│   │       ├── ActionChecklist.tsx     # 3-phase checkable roadmap
│   │       ├── EvidenceUploader.tsx    # Evidence locker & OCR intelligence
│   │       ├── DraftStudio.tsx         # Notice generator with copy/download
│   │       ├── LawyerBriefCard.tsx     # 1-page condensed Advocate Case Brief
│   │       ├── EscalationPathwayCard.tsx# Portals (NALSA, e-Daakhil, RERA, 1930)
│   │       └── FollowUpQA.tsx          # Guardrailed matter clarification Q&A
│   ├── lib/
│   │   ├── agents/                     # 9 modular agents + orchestrator
│   │   ├── db/
│   │   │   ├── schema.sql              # Production PostgreSQL/Supabase schema
│   │   │   ├── mock-db.ts              # In-memory store with full CRUD
│   │   │   └── seed-data.ts            # Authentic Indian legal fixtures
│   │   ├── legal/
│   │   │   ├── statutes.ts             # Indian statutory provisions dictionary
│   │   │   └── indian-jurisdictions.ts # DLSA, e-Daakhil, Cybercrime directory
│   │   └── utils.ts                    # Formatting helpers (INR currency, dates)
│   └── types/
│       └── matter.ts                   # Core TypeScript domain models
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/di0206-innovator/nyaysaathi.git
cd nyaysaathi
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🗄️ Database & Vector RAG Schema

NyaySaathi includes a complete production-ready PostgreSQL / Supabase schema in [`src/lib/db/schema.sql`](src/lib/db/schema.sql):
- **Matters Table**: Core parent table tracking status, plain language summary, and claim amounts.
- **Parties & Documents**: Structured roles, evidence classifications, and OCR text.
- **pgvector Integration**: `vector(1536)` columns on documents and statutory knowledge base for semantic retrieval.
- **Row Level Security (RLS)**: Enforces tenant isolation per user.

---

## Phase 6 — Production Readiness

Phase 6 hardens NyaySaathi into a production-grade, secure, and verifiable legal action navigation platform.

### Component Readiness Matrix

| Component | Status | Description |
| :--- | :--- | :--- |
| **Authentication & Tenant Isolation** | `Production` | Supabase Auth + Bearer / Cookie session extraction with strict server-side ownership checks on all matter routes. |
| **Private Evidence Storage** | `Production` | Scoped deterministic private storage (`user/{userId}/matters/{matterId}/documents/{docId}/{filename}`) with 1-hour signed access URLs and 10MB file limits. |
| **API Layer & Authorization** | `Production` | IDOR-proof server-side authorization on all `/api/matters/*` endpoints with rollback handling and path traversal prevention. |
| **Legal RAG (pgvector)** | `Production` | Hybrid pgvector semantic search (`match_statutory_provisions`) on Supabase with automatic transparent fallback to local corpus. |
| **AI Provider Layer (Gemini)** | `Production` | Gemini 2.5 Flash with AbortController timeouts (30s), exponential backoff retries on 429/5xx, robust JSON sanitization, and fallback flags. |
| **Agent Pipeline Error Boundaries**| `Production` | Try-catch isolation around each agent in `MatterOrchestrator` ensuring partial agent failures retain prior valid matter state. |
| **PII Redaction & Security** | `Production` | Server-side redaction for Aadhaar (12 digits), PAN, IFSC/bank accounts, and auth tokens in logs and exports. |
| **Rate Limiting & Abuse Prevention**| `Production` | Sliding-window in-memory rate limiting across expensive routes (AI analysis, document uploads, legal Q&A). |
| **Indic Multilingual Glossaries** | `Production` | Hindi, Hinglish, Marathi translation preserving statutory citations and legal terminology. |
| **Deterministic Seed Demo** | `Production` | Seeded Bengaluru Tenancy Deposit matter showcasing full lifecycle without live cloud prerequisites. |
| **Live Court API Integrations** | `Future` | Planned e-Courts / e-Daakhil API filing direct submission. |

---

### Authentication Architecture & Tenant Isolation
NyaySaathi enforces multi-tenant isolation at the database, service, and API layers:
1. **Server-Side Validation**: Every protected route (`/api/matters/*`) invokes `AuthService.getAuthenticatedUser()`, which extracts and validates the caller identity via Supabase JWT or authorized session cookies.
2. **Strict Server-Side Ownership**: Endpoints verify `matter.userId === user.id`. Non-owners receive immediate `403 Forbidden` / `404 Not Found` responses to eliminate Insecure Direct Object References (IDOR).
3. **Dual Client Model**: Public clients only ever receive `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The privileged `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-only runtime contexts and is never exposed in client bundles.

---

### Storage Architecture
Evidence documents are never stored in public buckets:
- **Deterministic Path Structure**: `user/{userId}/matters/{matterId}/documents/{documentId}/{filename}`
- **Security & Integrity**: Signed URLs are generated on-demand with a 3600-second expiration window.
- **Upload Validation**: File uploads enforce a strict 10 MB ceiling and whitelist only verified MIME types (`application/pdf`, `image/png`, `image/jpeg`, `image/webp`, `text/plain`).
- **Atomic Operations**: Database record creation and storage uploads are synchronized; if a file upload fails, the database record is rolled back cleanly.

---

### RAG Retrieval Pipeline & Fallback Transparency
1. **Retrieval Flow**:
   $$\text{Matter Narrative} \longrightarrow \text{Query Construction} \longrightarrow \text{64-dim / 1536-dim Embedding} \longrightarrow \text{pgvector Cosine Search} \longrightarrow \text{Category / State Filters} \longrightarrow \text{Top-K Sources}$$
2. **Grounding Evaluation**:
   - Scores $\ge 0.65$: Grounded statutory explanation (`explanation` tier).
   - Scores $< 0.65$: Marked as uncertain (`possibility` tier) with explicit missing information callouts.
   - Zero matches: Escalated to `counsel_required`.
3. **Fallback Transparency**: If Supabase or external vector search is unreachable, the system transparently engages the deterministic statute corpus (`StatuteRAGProvider`), logging `isFallback: true` and returning traceable source metadata.

---

### Environment Variables

| Variable | Description | Exposure |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Public (Browser & Server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public API key | Public (Browser & Server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase administrative service role key | **Server-Only (Never Client)** |
| `GEMINI_API_KEY` | Google Gemini API Key for production LLM calls | **Server-Only (Never Client)** |

---

### Testing & Verification

NyaySaathi maintains an extensive test suite across Phases 2 through 6:

```bash
# Run complete test suite (Phase 2-6)
npm test

# Run ESLint validation
npm run lint

# Run optimized production build
npm run build
```

---

### Privacy & Security Notes
- **Zero Raw PII Logging**: Aadhaar numbers (`XXXX-XXXX-XXXX`), PAN numbers, Indian bank accounts, and authorization tokens are automatically sanitized by `Redactor` before structured log emission.
- **Path Traversal Protection**: Raw document retrieval routes sanitize filenames and block directory traversal (`..`).
- **XSS Prevention**: User inputs are escaped and structured as sanitized JSON trees rather than raw HTML templates.

---

## ⚖️ Important Legal Disclaimer

*NyaySaathi is an informational navigation and case preparation system designed to assist citizens in structuring facts and understanding their options. It does not provide formal legal advice, practice law, or create an advocate-client relationship. For court representation, affidavit attestation, or complex litigation, please consult an enrolled Advocate or visit your nearest District Legal Services Authority (DLSA) center (National Legal Aid Helpline: 15100).*

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
