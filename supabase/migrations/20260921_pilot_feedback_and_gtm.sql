-- ==============================================================================
-- NYAYSAATHI 95+ PRODUCTION HARDENING: PILOT FEEDBACK, GTM & ATOMIC RATE LIMITING
-- ==============================================================================

-- 1. PERSISTENT PILOT FEEDBACK TABLE (Replaces in-memory store)
CREATE TABLE IF NOT EXISTS public.pilot_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    matter_id TEXT REFERENCES public.matters(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category TEXT NOT NULL,
    feedback_text TEXT,
    correction_text TEXT,
    correction_category TEXT CHECK (correction_category IN (
        'incorrect_fact',
        'incorrect_legal_explanation',
        'missing_evidence',
        'wrong_action',
        'wrong_deadline',
        'wrong_escalation',
        'unclear_draft',
        'other'
    )),
    advocate_consulted BOOLEAN NOT NULL DEFAULT FALSE,
    source TEXT NOT NULL DEFAULT 'direct',
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'verified', 'addressed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient analytics aggregation
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_user_id ON public.pilot_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_matter_id ON public.pilot_feedback(matter_id);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_created_at ON public.pilot_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_category ON public.pilot_feedback(category);

-- RLS Security Policies for Pilot Feedback
ALTER TABLE public.pilot_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can submit pilot feedback" ON public.pilot_feedback;
CREATE POLICY "Authenticated users can submit pilot feedback"
    ON public.pilot_feedback
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can view their own pilot feedback" ON public.pilot_feedback;
CREATE POLICY "Users can view their own pilot feedback"
    ON public.pilot_feedback
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. ADD ACQUISITION ATTRIBUTION & FIRST USEFUL ACTION TO MATTERS TABLE
ALTER TABLE public.matters ADD COLUMN IF NOT EXISTS acquisition_source TEXT DEFAULT 'direct';
ALTER TABLE public.matters ADD COLUMN IF NOT EXISTS first_useful_action_at TIMESTAMPTZ;

-- 3. CONCURRENCY-SAFE ATOMIC DISTRIBUTED RATE LIMITER
-- Uses PostgreSQL transactional advisory locking to prevent first-request race conditions
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
    v_lock_key BIGINT;
BEGIN
    -- Derive a 64-bit integer hash for transactional advisory lock
    v_lock_key := ('x' || substr(md5(p_key), 1, 16))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Fetch existing timestamps with row lock
    SELECT timestamps INTO v_timestamps
    FROM public.matter_rate_limits
    WHERE rate_key = p_key
    FOR UPDATE;

    IF v_timestamps IS NULL THEN
        v_timestamps := '{}';
    END IF;

    -- Filter out expired timestamps
    SELECT COALESCE(ARRAY_AGG(ts), '{}') INTO v_valid_timestamps
    FROM UNNEST(v_timestamps) AS ts
    WHERE ts > v_cutoff_ms;

    v_count := CARDINALITY(v_valid_timestamps);

    IF v_count < p_max_requests THEN
        v_valid_timestamps := ARRAY_APPEND(v_valid_timestamps, v_now_ms);
        v_allowed := TRUE;
        v_remaining := p_max_requests - (v_count + 1);
    ELSE
        v_allowed := FALSE;
        v_remaining := 0;
    END IF;

    -- Atomic upsert
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
