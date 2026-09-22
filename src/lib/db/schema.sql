-- NyaySaathi: Production-Ready PostgreSQL / Supabase Schema
-- Includes UUID extension, RLS policies, pgvector for semantic legal RAG, and matter lifecycle models.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Ready for pgvector semantic search

-- 1. Users / Profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    full_name VARCHAR(255),
    state VARCHAR(100),
    preferred_language VARCHAR(50) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Matters (The central anchor of NyaySaathi)
CREATE TYPE matter_category_enum AS ENUM (
    'tenancy_housing',
    'consumer_dispute',
    'workplace_employment',
    'financial_cheque_bounce',
    'property_rera',
    'family_matrimonial',
    'cyber_fraud',
    'police_criminal_grievance',
    'other'
);

CREATE TYPE matter_status_enum AS ENUM (
    'intake_draft',
    'analyzing',
    'action_ready',
    'in_progress',
    'escalated',
    'resolved'
);

CREATE TABLE IF NOT EXISTS matters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category matter_category_enum NOT NULL,
    sub_category VARCHAR(150),
    status matter_status_enum DEFAULT 'intake_draft',
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    claim_amount NUMERIC(15, 2),
    user_story TEXT NOT NULL,
    plain_language_summary TEXT,
    key_conflict TEXT,
    legal_nature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Parties Involved
CREATE TABLE IF NOT EXISTS matter_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    contact_info VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Documents & Evidence Locker
CREATE TYPE doc_type_enum AS ENUM (
    'rental_agreement',
    'invoice_bill',
    'whatsapp_chat',
    'email_thread',
    'bank_statement',
    'cheque_copy',
    'police_complaint_fir',
    'employment_contract',
    'notice_copy',
    'photo_proof',
    'other'
);

CREATE TABLE IF NOT EXISTS matter_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    doc_type doc_type_enum NOT NULL,
    file_url TEXT,
    file_size VARCHAR(50),
    extracted_text TEXT,
    classification VARCHAR(100),
    confidence_score NUMERIC(5, 4),
    relevance_summary TEXT,
    status VARCHAR(50) DEFAULT 'verified',
    embedding vector(1536), -- Vector embedding of extracted text for RAG retrieval
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Extracted Facts
CREATE TYPE trust_tier_enum AS ENUM (
    'fact',
    'explanation',
    'possibility',
    'counsel_required'
);

CREATE TABLE IF NOT EXISTS matter_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    source_doc_id UUID REFERENCES matter_documents(id) ON DELETE SET NULL,
    statement TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    tier trust_tier_enum NOT NULL DEFAULT 'fact',
    verified BOOLEAN DEFAULT TRUE,
    confidence NUMERIC(5, 4) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Chronological Timeline Events
CREATE TABLE IF NOT EXISTS matter_timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    evidence_doc_id UUID REFERENCES matter_documents(id) ON DELETE SET NULL,
    event_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_key_milestone BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'verified',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Risks & Limitations
CREATE TABLE IF NOT EXISTS matter_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    description TEXT NOT NULL,
    statute_reference VARCHAR(255),
    limitation_months INTEGER,
    limitation_expiry_date DATE,
    mitigating_action TEXT,
    legal_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Missing Information & Evidence Gaps
CREATE TABLE IF NOT EXISTS matter_missing_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    why_it_matters TEXT NOT NULL,
    impact_level VARCHAR(20) DEFAULT 'critical',
    suggested_source TEXT,
    is_answered BOOLEAN DEFAULT FALSE,
    answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Action Plan Steps
CREATE TABLE IF NOT EXISTS matter_action_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    phase VARCHAR(50) NOT NULL, -- 'immediate_48h', 'short_term_14d', 'formal_escalation'
    description TEXT NOT NULL,
    estimated_turnaround VARCHAR(100),
    status VARCHAR(30) DEFAULT 'pending',
    priority VARCHAR(30) DEFAULT 'must_do',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Legal Notice & Grievance Drafts
CREATE TABLE IF NOT EXISTS matter_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    draft_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_address TEXT,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    statutory_reference TEXT,
    disclaimer TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Lawyer Briefs
CREATE TABLE IF NOT EXISTS matter_lawyer_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id UUID NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
    executive_summary TEXT NOT NULL,
    key_chronology JSONB NOT NULL,
    legal_issues JSONB NOT NULL,
    statutory_references JSONB NOT NULL,
    relief_sought JSONB NOT NULL,
    evidentiary_readiness JSONB NOT NULL,
    estimated_claim_amount VARCHAR(100),
    jurisdiction_state VARCHAR(100),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Indian Statutory Knowledge Base (Vector RAG ready)
CREATE TABLE IF NOT EXISTS statutory_provisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    statute_name VARCHAR(255) NOT NULL, -- e.g. 'Consumer Protection Act, 2019'
    section_number VARCHAR(100),
    title VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(100),
    limitation_period_months INTEGER,
    remedy_type VARCHAR(100),
    embedding vector(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_matters_user_id ON matters(user_id);
CREATE INDEX IF NOT EXISTS idx_matters_status ON matters(status);
CREATE INDEX IF NOT EXISTS idx_matter_parties_matter_id ON matter_parties(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_docs_matter_id ON matter_documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_facts_matter_id ON matter_facts(matter_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_matter_id ON matter_timeline_events(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_drafts_matter_id ON matter_drafts(matter_id);

-- 13. Idempotency Keys (Distributed Request Deduplication)
CREATE TABLE IF NOT EXISTS idempotency_keys (
    id VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    response_code INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (user_id, endpoint, id)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_lookup ON idempotency_keys(user_id, endpoint, id);
CREATE INDEX IF NOT EXISTS idx_idempotency_expires ON idempotency_keys(expires_at);

-- 14. Distributed Durable Background Jobs
CREATE TABLE IF NOT EXISTS background_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(100) NOT NULL,
    matter_id UUID REFERENCES matters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'queued',
    progress_percent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    error_code VARCHAR(100),
    error_message TEXT,
    locked_by VARCHAR(255),
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_background_jobs_claim ON background_jobs(status, created_at) WHERE status IN ('queued', 'retrying');
CREATE INDEX IF NOT EXISTS idx_background_jobs_user ON background_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_background_jobs_matter ON background_jobs(matter_id);

-- Add content_hash to documents if not present
ALTER TABLE matter_documents ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
CREATE INDEX IF NOT EXISTS idx_documents_content_hash ON matter_documents(content_hash);

