<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# NyaySaathi Autonomous Agent Development Directives

## 1. Prime Directive: Zero Fabrication & Truthful Provenance
- Never hallucinate legal terms, file contents, statutory citations, or user data.
- If a document is missing or unparseable, fail closed with `extractionStatus: 'needs_ocr'` or `'needs_review'` rather than generating plausible text.
- All extracted clauses must have verified line or character provenance back to source documents.
- When generating legal notice drafts, cite exclusively verified Indian statutes (BNS 2023, CPA 2019, Limitation Act 1963, NI Act 1881).

## 2. Next.js App Router & React 19 Standards
- Next.js version in this workspace is `16.3.5` with React 19.
- Maintain strict separation of Client Components (`'use client'`) and Server Components.
- For pages requiring SEO metadata, export `metadata` from server-side `page.tsx` or adjacent `layout.tsx`.
- Never use browser-only globals (`window`, `localStorage`, `document`) directly inside Server Components or during SSR rendering.
- Always include `use client` on interactive components utilizing hooks (`useState`, `useEffect`, `useRouter`, `useContext`).

## 3. Database & Supabase Migrations
- Schema authority lives in `supabase/migrations/*.sql`.
- Invariant: `matters.id` is typed as `TEXT PRIMARY KEY`.
- Any table with a foreign key to `matters(id)` must use `matter_id TEXT REFERENCES public.matters(id) ON DELETE CASCADE`.
- Never create or commit migration files with `matter_id UUID` referencing `matters(id)`.
- Always ensure `supabase/config.toml` is present and valid for Supabase Preview CI.

## 4. Quality Gates & Continuous Integration
Before declaring any task or ticket complete, execute:
1. `npm run lint` — Must report 0 errors and 0 warnings.
2. `npx tsc --noEmit` — Must report 0 type errors.
3. `npm test` — All 247 unit, security, and grounding tests must pass.
4. `npx playwright test` — Multi-viewport browser journey tests must pass.
5. `npm run build` — Turbopack production build must compile all 38 routes without error.
