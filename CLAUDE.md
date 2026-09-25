# NyaySaathi — Claude & AI Developer Manual

NyaySaathi is a sovereign GenAI legal document intelligence and procedural action platform engineered for India. It translates complex legal legalese into plain language, performs semantic clause redlining across agreement drafts, executes hallucination-free document Q&A, and navigates citizens through a 5-stage pre-litigation dispute lifecycle grounded in Indian statutes.

---

## 1. Tech Stack & Core Dependencies

- **Framework**: Next.js 16.3.5 (App Router, Turbopack enabled)
- **Language**: TypeScript 5.8 (Strict Mode, `noImplicitAny: true`)
- **Styling**: Tailwind CSS v4, dark brutalist theme, high-contrast monospace typography
- **Database & Auth**: Supabase PostgreSQL with `pgvector` (768-dim embeddings), Row Level Security (RLS)
- **AI Core**: Google Gemini 2.5 Flash (`@google/genai`), Google Document AI / Tesseract.js OCR
- **Testing**: Node.js native test runner (`node:test`, `node:assert/strict`), Playwright (multi-viewport E2E)
- **Linting & Code Quality**: ESLint 9 (`eslint.config.mjs`), TypeScript compiler (`tsc`)

---

## 2. Repository Filing & Directory Architecture

```
nyaysaathi/
├── .github/workflows/          # CI/CD pipelines (Lint, Typecheck, Unit, E2E, Playwright, Supabase RLS)
├── docs/                       # Canonical system documentation
│   ├── CAPABILITY_MATRIX.md    # Single source of truth for features, maturity, and dependencies
│   ├── SCHEMA_AUTHORITY.md     # Migration rules and database single source of truth
│   ├── THREAT_MODEL.md         # 12-vector security threat analysis and mitigation proofs
│   ├── AI_JUDGE_READINESS.md   # Architectural audit, benchmark results, and verification report
│   └── PHASE8_CHANGELOG.md     # Production hardening and state isolation log
├── public/                     # Static web assets & AI crawlers standards
│   ├── llms.txt                # Standardized AEO Markdown summary for LLM search bots
│   ├── llms-full.txt           # Deep ontological architecture document for AI engines
│   ├── icon.svg, favicon.ico   # Brand identity & SVG favicon
│   └── manifest.json           # Progressive Web Application manifest
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (public)/           # Landing page (/), features (/features), pilot (/pilot), login (/login)
│   │   ├── (studio)/           # understand (/understand), compare (/compare), ask (/ask)
│   │   ├── (matters)/          # matters listing (/matters), matter detail (/matters/[id]), new (/matters/new)
│   │   ├── (compliance)/       # privacy (/privacy), terms (/terms), analytics (/analytics)
│   │   ├── api/                # REST & RPC endpoints (/api/matters, /api/documents, /api/jobs, etc.)
│   │   ├── layout.tsx          # Root layout with comprehensive SEO/AEO/GEO metadata & JSON-LD
│   │   ├── robots.ts           # Search & Answer Engine crawling rules
│   │   └── sitemap.ts          # XML sitemap configuration
│   ├── components/             # Reusable UI component library
│   │   ├── layout/             # Glassmorphic Navbar, Footer, StickyMobileCTA
│   │   ├── matter/             # Matter workspace, timeline, evidence graph, drafts, actions
│   │   ├── seo/                # JsonLd structured schemas, GenerativeKnowledgeRegistry
│   │   └── ui/                 # Toast notifications, Cookie banner, Modal dialogs, Analytics tracker
│   ├── lib/                    # Core business logic & domain services
│   │   ├── agents/             # 9-Agent analytical DAG orchestrator & cost budget tracker
│   │   ├── ai/                 # Gemini 2.5 Flash provider, embeddings, and prompt templates
│   │   ├── auth/               # Supabase session validation and AuthContext provider
│   │   ├── db/                 # Supabase client, migrations reference, and seed scenarios
│   │   ├── legal/              # Clause comparison engine, grounding validator, statutory rules
│   │   ├── repository/         # Matter repository interfaces, Supabase adapter, Memory adapter
│   │   └── storage/            # Private document storage provider with canonical path enforcement
│   └── types/                  # Strict TypeScript interfaces and domain models
├── supabase/                   # Supabase database authority
│   ├── config.toml             # Supabase project configuration (Required for GitHub Preview)
│   └── migrations/             # Sequentially numbered PostgreSQL migration scripts
└── tests/                      # Automated test suites
    ├── e2e/                    # Playwright browser E2E specs (core-journey, document-journey)
    ├── legal-benchmark/        # 100-case Indian dispute empirical dataset
    └── *.test.ts               # Unit, security, RLS, concurrency, and grounding tests
```

---

## 3. Database Migration Authority (`supabase/`)

1. **Authority**: All database definitions are controlled exclusively by `supabase/migrations/*.sql`.
2. **Schema Invariants**:
   - `matters.id` is typed as `TEXT PRIMARY KEY` to support deterministic seed identifiers (`seed-matter-001`) and UUIDs.
   - All child tables (`matter_actions`, `matter_communications`, `matter_deadlines`, `matter_escalations`, `matter_resolutions`, `matter_notifications`, `background_jobs`, `pilot_feedback`) MUST define `matter_id TEXT REFERENCES public.matters(id) ON DELETE CASCADE`.
   - Never use `matter_id UUID` as a foreign key targeting `matters(id)`; Postgres will fail with incompatible type constraints.
   - Always run `npx supabase db lint` or verify migrations before pushing to guarantee Supabase Preview passes.

---

## 4. Verification & Testing Commands

Execute commands from the project root:

```bash
# 1. Static Analysis & Linting (Target: 0 warnings, 0 errors)
npm run lint

# 2. TypeScript Compilation Check (Target: 0 errors)
npx tsc --noEmit

# 3. Comprehensive Unit, Security & Grounding Suite (247 tests)
npm test

# 4. Multi-Viewport Browser Playwright E2E Suite (36 tests)
npx playwright test

# 5. Production App Bundle Build (Next.js Turbopack)
npm run build

# 6. Verify Local Production Readiness Script
npx tsx scripts/verify-production.ts
```

---

## 5. Indian Statutory & Legal Grounding Rules

NyaySaathi strictly adheres to Indian statutory codification and procedural law:
- **Bharatiya Nyaya Sanhita, 2023 (BNS)**: Cited for cheating (§318), criminal breach of trust (§316), and criminal conspiracy (§61). Never cite obsolete IPC sections in new drafting modules.
- **Bharatiya Sakshya Adhiniyam, 2023 (BSA)**: Section 63 governs electronic evidence certificates, hash integrity, and line provenance.
- **Consumer Protection Act, 2019 (CPA)**: 2-year statutory limitation under Section 69, unfair contracts (§2(47)), deficiency in service (§2(11)), and e-Daakhil filing pathways.
- **Limitation Act, 1963**: Article 55 for contract breach recovery (3-year window), Article 113 for residuary claims, Section 5 for condonation of delay.
- **Negotiable Instruments Act, 1881**: Section 138 mandatory 30-day statutory notice for cheque return memos.
- **Digital Personal Data Protection Act, 2023 (DPDPA)**: Zero-training policy on uploaded contracts, client-side regex redaction on Aadhaar, PAN, and banking coordinates.
- **Advocates Act, 1961**: NyaySaathi is an informational case preparation and evidence structuring system. It never purports to practice law or represent litigants in judicial forums.
