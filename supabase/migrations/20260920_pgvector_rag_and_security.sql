-- NyaySaathi Phase 6: pgvector Semantic Legal RAG & Production Security Hardening
-- Migration: 20260920_pgvector_rag_and_security.sql

-- 1. Enable pgvector extension for statutory retrieval
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Statutory Knowledge Base with Vector Embeddings
CREATE TABLE IF NOT EXISTS statutory_provisions (
    id TEXT PRIMARY KEY,
    statute_name TEXT NOT NULL,
    section_number TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    plain_summary TEXT NOT NULL,
    category TEXT NOT NULL,
    jurisdiction_state TEXT,
    forum_authority TEXT,
    remedy_type TEXT,
    source_url TEXT,
    embedding vector(64), -- 64-dim embedding vector matching NyaySaathi vectorizer
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on category and state for combined relational-vector retrieval
CREATE INDEX IF NOT EXISTS idx_statutory_provisions_category ON statutory_provisions(category);
CREATE INDEX IF NOT EXISTS idx_statutory_provisions_state ON statutory_provisions(jurisdiction_state);

-- 3. Match function for pgvector similarity search with metadata filtering
CREATE OR REPLACE FUNCTION match_statutory_provisions(
    query_embedding vector(64),
    filter_category TEXT DEFAULT NULL,
    filter_state TEXT DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.20,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id TEXT,
    statute_name TEXT,
    section_number TEXT,
    title TEXT,
    content TEXT,
    plain_summary TEXT,
    category TEXT,
    jurisdiction_state TEXT,
    forum_authority TEXT,
    remedy_type TEXT,
    source_url TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sp.id,
        sp.statute_name,
        sp.section_number,
        sp.title,
        sp.content,
        sp.plain_summary,
        sp.category,
        sp.jurisdiction_state,
        sp.forum_authority,
        sp.remedy_type,
        sp.source_url,
        1 - (sp.embedding <=> query_embedding) AS similarity
    FROM statutory_provisions sp
    WHERE (filter_category IS NULL OR sp.category = filter_category OR sp.category = 'general')
      AND (filter_state IS NULL OR sp.jurisdiction_state IS NULL OR sp.jurisdiction_state = filter_state)
      AND (1 - (sp.embedding <=> query_embedding)) >= match_threshold
    ORDER BY sp.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 4. User-Scoped RLS Policies Hardening
ALTER TABLE matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_steps ENABLE ROW LEVEL SECURITY;

-- Ensure users can strictly manage their own matters
DROP POLICY IF EXISTS "Users can access their own matters" ON matters;
CREATE POLICY "Users can access their own matters"
    ON matters
    FOR ALL
    USING (auth.uid() = user_id OR (user_id IS NULL AND auth.uid() IS NULL));

DROP POLICY IF EXISTS "Users can access documents of their matters" ON documents;
CREATE POLICY "Users can access documents of their matters"
    ON documents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM matters m
            WHERE m.id = documents.matter_id
            AND (m.user_id = auth.uid() OR (m.user_id IS NULL AND auth.uid() IS NULL))
        )
    );

DROP POLICY IF EXISTS "Users can access drafts of their matters" ON drafts;
CREATE POLICY "Users can access drafts of their matters"
    ON drafts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM matters m
            WHERE m.id = drafts.matter_id
            AND (m.user_id = auth.uid() OR (m.user_id IS NULL AND auth.uid() IS NULL))
        )
    );

-- 5. Seed Core Indian Statutory Knowledge Base
INSERT INTO statutory_provisions (
    id, statute_name, section_number, title, content, plain_summary,
    category, jurisdiction_state, forum_authority, remedy_type, source_url
) VALUES
(
    'cpa-sec-35',
    'Consumer Protection Act, 2019',
    'Section 35',
    'Manner in which complaint shall be made',
    'A consumer dispute complaint may be instituted before the District Consumer Commission regarding unfair trade practices or deficiency of service.',
    'Allows filing before District Commission for claims up to ₹50 Lakhs for deficient goods or services.',
    'consumer_dispute',
    NULL,
    'District Consumer Disputes Redressal Commission (DCDRC)',
    'Compensation, refund with interest, and punitive damages for unfair trade practice',
    'https://edaakhil.nic.in'
),
(
    'ni-sec-138',
    'Negotiable Instruments Act, 1881',
    'Section 138',
    'Dishonour of cheque for insufficiency of funds',
    'Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money is returned by the bank unpaid.',
    'Criminal and civil remedy for dishonoured cheque. Mandatory 15-day statutory notice required within 30 days of memo receipt.',
    'financial_cheque_bounce',
    NULL,
    'Judicial Magistrate First Class / Metropolitan Magistrate',
    'Imprisonment up to 2 years or fine up to twice the cheque amount',
    'https://indiankanoon.org/doc/1823824/'
),
(
    'kra-sec-14',
    'Karnataka Rent Act, 1999',
    'Section 14',
    'Refund of Security Deposit & Advance Rent',
    'Any advance or security deposit paid by the tenant shall be refunded by the landlord within one month from the date of vacating, subject to lawful deductions.',
    'Landlords in Karnataka must refund security deposits within 30 days of vacating with documented deduction receipts.',
    'tenancy_housing',
    'Karnataka',
    'Rent Court / Civil Court',
    'Refund of deposit with statutory interest and punitive damages for wrongful retention',
    'https://dpal.karnataka.gov.in'
),
(
    'mrc-sec-15',
    'Maharashtra Rent Control Act, 1999',
    'Section 15',
    'Relief against forfeiture and unlawful recovery',
    'A landlord shall not be entitled to the recovery of possession of any premises so long as the tenant pays, or is ready and willing to pay, the standard rent.',
    'Tenants in Maharashtra cannot be evicted without formal 90-day statutory notice and valid judicial decree.',
    'tenancy_housing',
    'Maharashtra',
    'Small Causes Court (Mumbai) / Civil Judge Junior Division',
    'Restitution of tenancy, injunction against unlawful lockout, refund of deposit',
    'https://bombayhighcourt.nic.in'
),
(
    'rera-sec-18',
    'Real Estate (Regulation and Development) Act, 2016',
    'Section 18',
    'Return of amount and compensation for delayed possession',
    'If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement for sale.',
    'Homebuyers can seek full refund with prescribed SBI MCLR+2% interest or monthly delay compensation.',
    'property_rera',
    NULL,
    'State Real Estate Regulatory Authority (RERA)',
    'Full refund with interest, or monthly delay compensation until actual handover',
    'https://rera.gov.in'
),
(
    'bns-sec-318',
    'Bharatiya Nyaya Sanhita, 2023',
    'Section 318',
    'Cheating and dishonestly inducing delivery of property',
    'Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
    'Cognizable offense for fraudulent inducement, dishonest misappropriation, or online financial scams.',
    'cyber_fraud',
    NULL,
    'Cyber Crime Police Station / Judicial Magistrate',
    'Criminal investigation, freezing of beneficiary bank accounts, restitution',
    'https://cybercrime.gov.in'
),
(
    'lsa-sec-12',
    'Legal Services Authorities Act, 1987',
    'Section 12',
    'Criteria for giving legal services',
    'Every person who has to file or defend a case shall be entitled to legal services under this Act if that person is a woman, child, SC/ST, or has annual income below prescribed limit.',
    'Provides free legal counsel, court fee exemption, and Lok Adalat dispute resolution for eligible citizens.',
    'general',
    NULL,
    'District Legal Services Authority (DLSA) / NALSA Helpline 15100',
    'Free advocate assignment, conciliation, and pre-litigation settlement',
    'https://nalsa.gov.in'
)
ON CONFLICT (id) DO UPDATE SET
    statute_name = EXCLUDED.statute_name,
    section_number = EXCLUDED.section_number,
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    plain_summary = EXCLUDED.plain_summary,
    category = EXCLUDED.category,
    jurisdiction_state = EXCLUDED.jurisdiction_state,
    forum_authority = EXCLUDED.forum_authority,
    remedy_type = EXCLUDED.remedy_type,
    source_url = EXCLUDED.source_url;
