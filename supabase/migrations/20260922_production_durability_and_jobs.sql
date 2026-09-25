-- ==============================================================================
-- NYAYSAATHI PRODUCTION DURABILITY, STORAGE POLICIES & DISTRIBUTED JOBS
-- ==============================================================================

-- 1. DURABLE BACKGROUND JOBS TABLE
CREATE TABLE IF NOT EXISTS public.background_jobs (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('deep_analysis', 'ocr_processing', 'advocate_pack_export', 'rag_indexing')),
    matter_id TEXT REFERENCES public.matters(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'retrying')),
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    payload JSONB DEFAULT '{}'::jsonb,
    result JSONB,
    error_code TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_background_jobs_status_created ON public.background_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_background_jobs_matter_id ON public.background_jobs(matter_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_user_id ON public.background_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_background_jobs_type ON public.background_jobs(type);

ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own background jobs" ON public.background_jobs;
CREATE POLICY "Users can view their own background jobs"
    ON public.background_jobs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert background jobs for their matters" ON public.background_jobs;
CREATE POLICY "Users can insert background jobs for their matters"
    ON public.background_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own background jobs" ON public.background_jobs;
CREATE POLICY "Users can update their own background jobs"
    ON public.background_jobs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- System / worker service role policy for durable job claiming & processing
DROP POLICY IF EXISTS "Service role can manage all background jobs" ON public.background_jobs;
CREATE POLICY "Service role can manage all background jobs"
    ON public.background_jobs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Concurrency-safe atomic job claiming function with FOR UPDATE SKIP LOCKED
CREATE OR REPLACE FUNCTION public.claim_background_job(
    p_worker_id TEXT,
    p_job_types TEXT[] DEFAULT NULL,
    p_stale_timeout_seconds INT DEFAULT 300
)
RETURNS SETOF public.background_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_job_id TEXT;
BEGIN
    -- Reclaim stale jobs that exceeded timeout
    UPDATE public.background_jobs
    SET status = 'retrying',
        updated_at = NOW()
    WHERE status = 'processing'
      AND started_at < (NOW() - (p_stale_timeout_seconds || ' seconds')::interval)
      AND attempts < max_attempts;

    -- Atomically select and lock the oldest queued/retrying job
    SELECT id INTO v_job_id
    FROM public.background_jobs
    WHERE (status = 'queued' OR status = 'retrying')
      AND (p_job_types IS NULL OR type = ANY(p_job_types))
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;

    IF v_job_id IS NOT NULL THEN
        RETURN QUERY
        UPDATE public.background_jobs
        SET status = 'processing',
            attempts = attempts + 1,
            started_at = NOW(),
            updated_at = NOW()
        WHERE id = v_job_id
        RETURNING *;
    END IF;
END;
$$;

-- Restrict worker claim execution to service_role only (never callable by end users)
REVOKE EXECUTE ON FUNCTION public.claim_background_job FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_background_job TO service_role;

-- 2. IDEMPOTENCY KEYS TABLE
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    id TEXT NOT NULL,
    user_id UUID NOT NULL,
    endpoint TEXT NOT NULL,
    request_hash TEXT,
    response_status INT NOT NULL,
    response_body JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (user_id, endpoint, id)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON public.idempotency_keys(expires_at);

ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can access their own idempotency keys" ON public.idempotency_keys;
CREATE POLICY "Users can access their own idempotency keys"
    ON public.idempotency_keys
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. DOCUMENT HASH & PROVENANCE COLUMNS
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS content_hash TEXT;
CREATE INDEX IF NOT EXISTS idx_documents_matter_hash ON public.documents(matter_id, content_hash);

-- 4. NOTIFICATIONS LIFECYCLE EXTENSION
ALTER TABLE IF EXISTS public.matter_notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'queued'
    CHECK (status IN ('queued', 'processing', 'sent', 'read', 'failed', 'retrying'));
CREATE INDEX IF NOT EXISTS idx_matter_notifications_status ON public.matter_notifications(status);

-- Provide compatibility table for public.notifications if accessed directly
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    matter_id TEXT REFERENCES public.matters(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'in_app',
    status TEXT DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'read', 'failed', 'retrying')),
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);

-- 5. STORAGE OBJECTS RLS POLICIES FOR 'evidence-documents' BUCKET
-- Ensure the evidence-documents bucket is private
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidence-documents', 'evidence-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS: Users can only access objects under their own 'user/{userId}/...' path prefix
DROP POLICY IF EXISTS "Users can read their own evidence documents" ON storage.objects;
CREATE POLICY "Users can read their own evidence documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'evidence-documents' AND
        (storage.foldername(name))[1] = 'user' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can upload their own evidence documents" ON storage.objects;
CREATE POLICY "Users can upload their own evidence documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'evidence-documents' AND
        (storage.foldername(name))[1] = 'user' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can update their own evidence documents" ON storage.objects;
CREATE POLICY "Users can update their own evidence documents"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'evidence-documents' AND
        (storage.foldername(name))[1] = 'user' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete their own evidence documents" ON storage.objects;
CREATE POLICY "Users can delete their own evidence documents"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'evidence-documents' AND
        (storage.foldername(name))[1] = 'user' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- 6. ATOMIC MATTER CREATION STORED PROCEDURE (Rollback safety)
CREATE OR REPLACE FUNCTION public.create_matter_atomic(
    p_matter JSONB,
    p_parties JSONB DEFAULT '[]'::jsonb,
    p_initial_event JSONB DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_matter_id TEXT;
    v_user_uuid UUID;
BEGIN
    v_matter_id := p_matter->>'id';
    IF v_matter_id IS NULL OR v_matter_id = '' THEN
        v_matter_id := gen_random_uuid()::TEXT;
    END IF;

    -- Safely parse user_id if valid UUID format, else leave NULL
    IF (p_matter->>'user_id') IS NOT NULL AND (p_matter->>'user_id') ~ '^[0-9a-fA-F-]{36}$' THEN
        v_user_uuid := (p_matter->>'user_id')::UUID;
    ELSE
        v_user_uuid := NULL;
    END IF;

    -- 1. Insert core matter
    INSERT INTO public.matters (
        id,
        user_id,
        title,
        category,
        sub_category,
        status,
        claim_amount,
        location_city,
        location_state,
        user_story,
        summary_plain,
        summary_conflict,
        summary_legal_nature,
        language,
        acquisition_source,
        created_at,
        updated_at
    ) VALUES (
        v_matter_id,
        v_user_uuid,
        p_matter->>'title',
        p_matter->>'category',
        p_matter->>'sub_category',
        COALESCE(p_matter->>'status', 'intake'),
        (p_matter->>'claim_amount')::NUMERIC,
        p_matter->>'location_city',
        p_matter->>'location_state',
        p_matter->>'user_story',
        p_matter->>'summary_plain',
        p_matter->>'summary_conflict',
        p_matter->>'summary_legal_nature',
        COALESCE(p_matter->>'language', 'en'),
        COALESCE(p_matter->>'acquisition_source', 'direct'),
        COALESCE((p_matter->>'created_at')::TIMESTAMPTZ, NOW()),
        COALESCE((p_matter->>'updated_at')::TIMESTAMPTZ, NOW())
    );

    -- 2. Insert parties if provided
    IF jsonb_array_length(p_parties) > 0 THEN
        INSERT INTO public.parties (
            id,
            matter_id,
            name,
            role,
            contact_info,
            address,
            city,
            state
        )
        SELECT
            COALESCE(elem->>'id', gen_random_uuid()::TEXT),
            v_matter_id,
            elem->>'name',
            elem->>'role',
            elem->>'contact_info',
            elem->>'address',
            elem->>'city',
            elem->>'state'
        FROM jsonb_array_elements(p_parties) AS elem;
    END IF;

    -- 3. Insert initial timeline activity event if provided
    IF p_initial_event IS NOT NULL THEN
        INSERT INTO public.timeline_events (
            id,
            matter_id,
            date,
            title,
            description,
            type,
            status,
            source,
            created_at
        ) VALUES (
            COALESCE(p_initial_event->>'id', gen_random_uuid()::TEXT),
            v_matter_id,
            COALESCE(p_initial_event->>'date', CURRENT_DATE::TEXT),
            p_initial_event->>'title',
            p_initial_event->>'description',
            COALESCE(p_initial_event->>'type', 'status_change'),
            COALESCE(p_initial_event->>'status', 'completed'),
            COALESCE(p_initial_event->>'source', 'system_generated'),
            NOW()
        );
    END IF;

    RETURN v_matter_id;
EXCEPTION
    WHEN OTHERS THEN
        -- PostgreSQL automatically rolls back the subtransaction on exception
        RAISE EXCEPTION 'Atomic matter creation transaction failed: %', SQLERRM;
END;
$$;
