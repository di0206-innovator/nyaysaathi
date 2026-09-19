-- NyaySaathi Phase 8: Production Integrity, Data Model Convergence & Strict RLS
-- Migration: 20260920_phase8_production_integrity.sql

-- 1. Add storage_path to documents table for persistent private storage tracking
ALTER TABLE IF EXISTS public.documents
    ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 2. Add 768-dim embedding column for Gemini text-embedding-004 alignment
ALTER TABLE IF EXISTS public.statutory_provisions
    ADD COLUMN IF NOT EXISTS embedding_768 vector(768);

-- Create HNSW/ivfflat index on 768-dim embedding
CREATE INDEX IF NOT EXISTS idx_statutory_provisions_embedding_768
    ON public.statutory_provisions USING ivfflat (embedding_768 vector_cosine_ops)
    WITH (lists = 50);

-- Match function for 768-dim pgvector similarity search
CREATE OR REPLACE FUNCTION match_statutory_provisions_768(
    query_embedding vector(768),
    filter_category TEXT DEFAULT NULL,
    filter_state TEXT DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.25,
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
        1 - (sp.embedding_768 <=> query_embedding) AS similarity
    FROM public.statutory_provisions sp
    WHERE (sp.embedding_768 IS NOT NULL)
      AND (filter_category IS NULL OR sp.category = filter_category)
      AND (filter_state IS NULL OR sp.jurisdiction_state IS NULL OR sp.jurisdiction_state = filter_state)
      AND (1 - (sp.embedding_768 <=> query_embedding) >= match_threshold)
    ORDER BY sp.embedding_768 <=> query_embedding
    LIMIT match_count;
END;
$$;

-- 3. Production Rate Limiter Table (Shared Distributed Throttling)
CREATE TABLE IF NOT EXISTS public.matter_rate_limits (
    rate_key TEXT PRIMARY KEY,
    timestamps BIGINT[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RPC for sliding-window rate limiting in Postgres
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_key TEXT,
    p_max_requests INT,
    p_window_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_now_ms BIGINT := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
    v_cutoff_ms BIGINT := v_now_ms - (p_window_seconds * 1000)::BIGINT;
    v_timestamps BIGINT[];
    v_valid_timestamps BIGINT[];
    v_count INT;
    v_allowed BOOLEAN;
    v_remaining INT;
BEGIN
    SELECT timestamps INTO v_timestamps FROM public.matter_rate_limits WHERE rate_key = p_key FOR UPDATE;

    IF v_timestamps IS NULL THEN
        v_timestamps := '{}';
    END IF;

    -- Filter out expired timestamps
    SELECT ARRAY_AGG(ts) INTO v_valid_timestamps FROM UNNEST(v_timestamps) AS ts WHERE ts > v_cutoff_ms;
    IF v_valid_timestamps IS NULL THEN
        v_valid_timestamps := '{}';
    END IF;

    v_count := CARDINALITY(v_valid_timestamps);

    IF v_count < p_max_requests THEN
        v_valid_timestamps := ARRAY_APPEND(v_valid_timestamps, v_now_ms);
        v_allowed := TRUE;
        v_remaining := p_max_requests - (v_count + 1);
    ELSE
        v_allowed := FALSE;
        v_remaining := 0;
    END IF;

    INSERT INTO public.matter_rate_limits (rate_key, timestamps, updated_at)
    VALUES (p_key, v_valid_timestamps, NOW())
    ON CONFLICT (rate_key)
    DO UPDATE SET timestamps = v_valid_timestamps, updated_at = NOW();

    RETURN jsonb_build_object(
        'allowed', v_allowed,
        'remaining', v_remaining,
        'resetSeconds', p_window_seconds
    );
END;
$$;

-- 4. STRICT RLS POLICIES (Purging all anonymous bypasses)
-- A legal matter belongs exclusively to its authenticated owner: auth.uid() = user_id

-- MATTERS
ALTER TABLE public.matters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access their own matters" ON public.matters;
CREATE POLICY "Users can access their own matters"
    ON public.matters
    FOR ALL
    USING (auth.uid() = user_id);

-- DOCUMENTS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access documents of their matters" ON public.documents;
CREATE POLICY "Users can access documents of their matters"
    ON public.documents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = documents.matter_id
            AND m.user_id = auth.uid()
        )
    );

-- DRAFTS
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access drafts of their matters" ON public.drafts;
CREATE POLICY "Users can access drafts of their matters"
    ON public.drafts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = drafts.matter_id
            AND m.user_id = auth.uid()
        )
    );

-- PARTIES
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access parties of their matters" ON public.parties;
CREATE POLICY "Users can access parties of their matters"
    ON public.parties
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = parties.matter_id
            AND m.user_id = auth.uid()
        )
    );

-- FACTS
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access facts of their matters" ON public.facts;
CREATE POLICY "Users can access facts of their matters"
    ON public.facts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = facts.matter_id
            AND m.user_id = auth.uid()
        )
    );

-- TIMELINE EVENTS
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access timeline of their matters" ON public.timeline_events;
CREATE POLICY "Users can access timeline of their matters"
    ON public.timeline_events
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = timeline_events.matter_id
            AND m.user_id = auth.uid()
        )
    );

-- RISKS
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can access risks of their matters" ON public.risks;
CREATE POLICY "Users can access risks of their matters"
    ON public.risks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = risks.matter_id
            AND m.user_id = auth.uid()
        )
    );

-- PHASE 7 NORMALIZED WORKFLOW TABLES RLS HARDENING
DROP POLICY IF EXISTS "Users can access actions for own matters" ON public.matter_actions;
CREATE POLICY "Users can access actions for own matters"
    ON public.matter_actions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = matter_actions.matter_id
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can access communications for own matters" ON public.matter_communications;
CREATE POLICY "Users can access communications for own matters"
    ON public.matter_communications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = matter_communications.matter_id
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can access activity events for own matters" ON public.matter_activity_events;
CREATE POLICY "Users can access activity events for own matters"
    ON public.matter_activity_events
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = matter_activity_events.matter_id
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can access deadlines for own matters" ON public.matter_deadlines;
CREATE POLICY "Users can access deadlines for own matters"
    ON public.matter_deadlines
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = matter_deadlines.matter_id
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can access escalations for own matters" ON public.matter_escalations;
CREATE POLICY "Users can access escalations for own matters"
    ON public.matter_escalations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = matter_escalations.matter_id
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can access resolutions for own matters" ON public.matter_resolutions;
CREATE POLICY "Users can access resolutions for own matters"
    ON public.matter_resolutions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = matter_resolutions.matter_id
            AND m.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can access notifications for own matters" ON public.matter_notifications;
CREATE POLICY "Users can access notifications for own matters"
    ON public.matter_notifications
    FOR ALL
    USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.matters m
            WHERE m.id = matter_notifications.matter_id
            AND m.user_id = auth.uid()
        )
    );
