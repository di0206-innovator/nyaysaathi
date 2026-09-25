-- NyaySaathi: Phase 7 - Action Execution, Legal Workflow Tracking & Matter Lifecycle
-- Migration: 20260920_phase7_lifecycle_and_actions.sql

-- 1. Matter Actions (Extended Execution Items)
CREATE TABLE IF NOT EXISTS public.matter_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id TEXT NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    phase TEXT NOT NULL CHECK (phase IN ('immediate_48h', 'short_term_14d', 'formal_escalation')),
    description TEXT NOT NULL,
    estimated_turnaround TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'blocked', 'completed', 'skipped', 'expired')),
    priority TEXT NOT NULL DEFAULT 'recommended' CHECK (priority IN ('must_do', 'recommended', 'optional')),
    associated_draft_type TEXT,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    evidence_required BOOLEAN DEFAULT FALSE,
    evidence_document_ids TEXT[] DEFAULT '{}',
    notes TEXT,
    blocking_reason TEXT,
    steps JSONB DEFAULT '[]'::jsonb,
    completion_proof JSONB,
    result TEXT CHECK (result IN ('completed', 'rejected', 'no_response', 'partially_completed', 'awaiting_response')),
    grounding_status TEXT DEFAULT 'grounded',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Matter Communications Log
CREATE TABLE IF NOT EXISTS public.matter_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id TEXT NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'legal_notice', 'email', 'whatsapp', 'phone_call', 'service_request',
        'complaint_filed', 'authority_response', 'mediation_session',
        'payment_received', 'document_received', 'other'
    )),
    direction TEXT NOT NULL CHECK (direction IN ('outgoing', 'incoming')),
    date TIMESTAMPTZ NOT NULL,
    counterparty TEXT NOT NULL,
    summary TEXT NOT NULL,
    reference_number TEXT,
    document_ids TEXT[] DEFAULT '{}',
    response_expected_by TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'awaiting_response', 'responded', 'overdue', 'resolved')),
    outcome_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Matter Activity Events (Consolidated Historical + User Timeline)
CREATE TABLE IF NOT EXISTS public.matter_activity_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id TEXT NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('evidence_derived', 'user_recorded')),
    title TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    description TEXT NOT NULL,
    reference_id TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Matter Deadlines & Reminders (Deadline Engine 2.0)
CREATE TABLE IF NOT EXISTS public.matter_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id TEXT NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('statutory', 'action_step', 'response_expected', 'user_defined')),
    is_statutory BOOLEAN DEFAULT FALSE,
    is_user_defined BOOLEAN DEFAULT FALSE,
    confidence NUMERIC(3, 2) DEFAULT 0.85,
    trust_tier TEXT NOT NULL DEFAULT 'explanation' CHECK (trust_tier IN ('fact', 'explanation', 'possibility', 'counsel_required', 'unsupported')),
    related_action_id UUID REFERENCES public.matter_actions(id) ON DELETE SET NULL,
    related_event_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue', 'cancelled')),
    statute_reference TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Matter Escalation Workflows
CREATE TABLE IF NOT EXISTS public.matter_escalations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id TEXT NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
    route_id TEXT NOT NULL,
    authority_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
        'not_started', 'preparing', 'submitted', 'acknowledged',
        'under_review', 'hearing_scheduled', 'resolved', 'rejected', 'unknown'
    )),
    requirements TEXT[] DEFAULT '{}',
    documents_required TEXT[] DEFAULT '{}',
    optional_documents TEXT[] DEFAULT '{}',
    submission_method TEXT NOT NULL DEFAULT 'online_portal',
    official_portal TEXT,
    reference_number TEXT,
    submitted_at TIMESTAMPTZ,
    acknowledged_at TIMESTAMPTZ,
    next_step TEXT,
    notes TEXT,
    document_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Matter Resolutions
CREATE TABLE IF NOT EXISTS public.matter_resolutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id TEXT UNIQUE NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
    resolved_at TIMESTAMPTZ NOT NULL,
    resolution_type TEXT NOT NULL CHECK (resolution_type IN (
        'full_settlement', 'partial_settlement', 'court_order',
        'mediation_agreement', 'abandoned', 'complaint_dismissed', 'other'
    )),
    outcome TEXT NOT NULL,
    amount_recovered NUMERIC(12, 2),
    amount_disputed NUMERIC(12, 2),
    settlement_document_id TEXT,
    notes TEXT,
    is_reopened BOOLEAN DEFAULT FALSE,
    reopened_at TIMESTAMPTZ,
    reopened_reason TEXT,
    reopened_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Matter In-App / Email Notifications
CREATE TABLE IF NOT EXISTS public.matter_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matter_id TEXT NOT NULL REFERENCES public.matters(id) ON DELETE CASCADE,
    user_id UUID,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'in_app' CHECK (channel IN ('in_app', 'email')),
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_matter_actions_matter_id ON public.matter_actions(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_comms_matter_id ON public.matter_communications(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_events_matter_id ON public.matter_activity_events(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_deadlines_matter_id ON public.matter_deadlines(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_deadlines_due_date ON public.matter_deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_matter_escalations_matter_id ON public.matter_escalations(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_notifications_user_id ON public.matter_notifications(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.matter_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matter_notifications ENABLE ROW LEVEL SECURITY;

-- Dynamic RLS Policies linked to matters ownership
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can access actions for own matters" ON public.matter_actions;
    CREATE POLICY "Users can access actions for own matters"
        ON public.matter_actions FOR ALL
        USING (EXISTS (SELECT 1 FROM public.matters m WHERE m.id = matter_actions.matter_id AND (m.user_id = auth.uid() OR auth.role() = 'service_role')));

    DROP POLICY IF EXISTS "Users can access communications for own matters" ON public.matter_communications;
    CREATE POLICY "Users can access communications for own matters"
        ON public.matter_communications FOR ALL
        USING (EXISTS (SELECT 1 FROM public.matters m WHERE m.id = matter_communications.matter_id AND (m.user_id = auth.uid() OR auth.role() = 'service_role')));

    DROP POLICY IF EXISTS "Users can access activity events for own matters" ON public.matter_activity_events;
    CREATE POLICY "Users can access activity events for own matters"
        ON public.matter_activity_events FOR ALL
        USING (EXISTS (SELECT 1 FROM public.matters m WHERE m.id = matter_activity_events.matter_id AND (m.user_id = auth.uid() OR auth.role() = 'service_role')));

    DROP POLICY IF EXISTS "Users can access deadlines for own matters" ON public.matter_deadlines;
    CREATE POLICY "Users can access deadlines for own matters"
        ON public.matter_deadlines FOR ALL
        USING (EXISTS (SELECT 1 FROM public.matters m WHERE m.id = matter_deadlines.matter_id AND (m.user_id = auth.uid() OR auth.role() = 'service_role')));

    DROP POLICY IF EXISTS "Users can access escalations for own matters" ON public.matter_escalations;
    CREATE POLICY "Users can access escalations for own matters"
        ON public.matter_escalations FOR ALL
        USING (EXISTS (SELECT 1 FROM public.matters m WHERE m.id = matter_escalations.matter_id AND (m.user_id = auth.uid() OR auth.role() = 'service_role')));

    DROP POLICY IF EXISTS "Users can access resolutions for own matters" ON public.matter_resolutions;
    CREATE POLICY "Users can access resolutions for own matters"
        ON public.matter_resolutions FOR ALL
        USING (EXISTS (SELECT 1 FROM public.matters m WHERE m.id = matter_resolutions.matter_id AND (m.user_id = auth.uid() OR auth.role() = 'service_role')));

    DROP POLICY IF EXISTS "Users can access notifications for own matters" ON public.matter_notifications;
    CREATE POLICY "Users can access notifications for own matters"
        ON public.matter_notifications FOR ALL
        USING (EXISTS (SELECT 1 FROM public.matters m WHERE m.id = matter_notifications.matter_id AND (m.user_id = auth.uid() OR auth.role() = 'service_role')));
END $$;
