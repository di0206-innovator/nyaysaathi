-- NyaySaathi: Production PostgreSQL & Supabase Persistence Schema
-- Migration: 20260918_init_nyaysaathi_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Matters Table
CREATE TABLE IF NOT EXISTS matters (
    id TEXT PRIMARY KEY,
    user_id UUID,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    sub_category TEXT,
    status TEXT NOT NULL DEFAULT 'draft_review',
    claim_amount NUMERIC,
    location_city TEXT,
    location_state TEXT,
    user_story TEXT NOT NULL,
    summary_plain TEXT,
    summary_conflict TEXT,
    summary_legal_nature TEXT,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookups and category filtering
CREATE INDEX IF NOT EXISTS idx_matters_user_id ON matters(user_id);
CREATE INDEX IF NOT EXISTS idx_matters_category ON matters(category);
CREATE INDEX IF NOT EXISTS idx_matters_status ON matters(status);

-- 2. Parties Table
CREATE TABLE IF NOT EXISTS parties (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    contact_info TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parties_matter_id ON parties(matter_id);

-- 3. Documents & Evidence Table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    file_url TEXT,
    file_size TEXT,
    mime_type TEXT,
    extracted_text TEXT,
    classification TEXT,
    confidence_score NUMERIC DEFAULT 0.95,
    relevance_summary TEXT,
    key_quotes JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'verified',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_documents_matter_id ON documents(matter_id);

-- 4. Extracted Facts Table
CREATE TABLE IF NOT EXISTS facts (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    statement TEXT NOT NULL,
    category TEXT NOT NULL,
    source_doc_id TEXT,
    verified BOOLEAN DEFAULT TRUE,
    tier TEXT NOT NULL DEFAULT 'fact',
    confidence NUMERIC DEFAULT 0.9,
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_facts_matter_id ON facts(matter_id);

-- 5. Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_doc_id TEXT,
    evidence_title TEXT,
    is_key_milestone BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'verified',
    grounding_status TEXT DEFAULT 'grounded',
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_timeline_events_matter_id ON timeline_events(matter_id);

-- 6. Risks Table
CREATE TABLE IF NOT EXISTS risks (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    description TEXT NOT NULL,
    mitigating_action TEXT NOT NULL,
    legal_context TEXT,
    limitation_info JSONB,
    grounding_status TEXT DEFAULT 'grounded',
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_risks_matter_id ON risks(matter_id);

-- 7. Missing Information Table
CREATE TABLE IF NOT EXISTS missing_information (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    impact_on_outcome TEXT NOT NULL,
    recommended_doc_type TEXT,
    is_answered BOOLEAN DEFAULT FALSE,
    answer TEXT
);
CREATE INDEX IF NOT EXISTS idx_missing_info_matter_id ON missing_information(matter_id);

-- 8. Action Plan Steps Table
CREATE TABLE IF NOT EXISTS action_steps (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    phase TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_turnaround TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'recommended',
    associated_draft_type TEXT,
    grounding_status TEXT DEFAULT 'grounded',
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_action_steps_matter_id ON action_steps(matter_id);

-- 9. Legal Drafts Table
CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    communication_tier TEXT NOT NULL,
    title TEXT NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_address TEXT,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    disclaimer TEXT,
    paragraphs JSONB DEFAULT '[]'::jsonb,
    requires_advocate_review BOOLEAN DEFAULT FALSE,
    audit_log JSONB DEFAULT '[]'::jsonb,
    grounding_status TEXT DEFAULT 'grounded',
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_drafts_matter_id ON drafts(matter_id);

-- 10. Lawyer Briefs Table
CREATE TABLE IF NOT EXISTS lawyer_briefs (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL UNIQUE REFERENCES matters(id) ON DELETE CASCADE,
    executive_summary TEXT NOT NULL,
    key_chronology JSONB DEFAULT '[]'::jsonb,
    legal_issues_identified JSONB DEFAULT '[]'::jsonb,
    statutory_references JSONB DEFAULT '[]'::jsonb,
    relief_sought JSONB DEFAULT '[]'::jsonb,
    evidentiary_readiness JSONB,
    estimated_claim_amount TEXT,
    jurisdiction_state TEXT,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    grounding_status TEXT DEFAULT 'grounded',
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb
);

-- 11. Escalation Routes Table
CREATE TABLE IF NOT EXISTS escalation_routes (
    id TEXT PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    criteria_met BOOLEAN DEFAULT TRUE,
    eligibility_description TEXT,
    matching_reason TEXT,
    official_portal_url TEXT,
    toll_free_number TEXT,
    steps_to_apply JSONB DEFAULT '[]'::jsonb,
    cost_estimate TEXT,
    grounding_status TEXT DEFAULT 'grounded',
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_escalation_routes_matter_id ON escalation_routes(matter_id);

-- 12. Trust & Safety Items Table
CREATE TABLE IF NOT EXISTS trust_safety_items (
    id SERIAL PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    label TEXT NOT NULL,
    detail TEXT NOT NULL,
    confidence NUMERIC DEFAULT 0.9,
    grounding_ref_ids JSONB DEFAULT '[]'::jsonb,
    grounding_status TEXT DEFAULT 'grounded'
);
CREATE INDEX IF NOT EXISTS idx_trust_safety_matter_id ON trust_safety_items(matter_id);

-- 13. Evidence Graph Data Table
CREATE TABLE IF NOT EXISTS evidence_graphs (
    matter_id TEXT PRIMARY KEY REFERENCES matters(id) ON DELETE CASCADE,
    nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
    edges JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    original TEXT NOT NULL,
    rewritten TEXT NOT NULL,
    reason TEXT NOT NULL,
    component TEXT DEFAULT 'AI Safety',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_matter_id ON audit_logs(matter_id);

-- -------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- -------------------------------------------------------------
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can access their own matters
CREATE POLICY "Users can access their own matters"
    ON matters
    FOR ALL
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Allow access to documents linked to accessible matters
CREATE POLICY "Users can access documents of their matters"
    ON documents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM matters m
            WHERE m.id = documents.matter_id
            AND (m.user_id = auth.uid() OR m.user_id IS NULL)
        )
    );
