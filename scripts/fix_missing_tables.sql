
-- Create vendor_assessments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.vendor_assessments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id uuid NOT NULL,
    vendor_id uuid NOT NULL REFERENCES public.vendor_registry(id) ON DELETE CASCADE,
    framework_id uuid REFERENCES public.assessment_frameworks(id) ON DELETE SET NULL,
    assessment_name text NOT NULL,
    assessment_type text CHECK (assessment_type IN ('initial', 'annual', 'reassessment', 'incident_triggered', 'ad_hoc')) DEFAULT 'initial',
    status text CHECK (status IN ('draft', 'sent', 'in_progress', 'completed', 'approved', 'rejected', 'expired')) DEFAULT 'draft',
    priority text CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    due_date timestamp with time zone,
    start_date timestamp with time zone DEFAULT now(),
    completion_date timestamp with time zone,
    progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    responses jsonb DEFAULT '{}',
    overall_score numeric(3,2) CHECK (overall_score >= 0 AND overall_score <= 5),
    risk_level text CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    public_link text UNIQUE,
    public_link_expires_at timestamp with time zone,
    vendor_submitted_at timestamp with time zone,
    internal_review_status text CHECK (internal_review_status IN ('pending', 'in_review', 'approved', 'rejected', 'requires_clarification')) DEFAULT 'pending',
    reviewer_notes text,
    evidence_attachments jsonb DEFAULT '[]',
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    reviewed_by uuid,
    reviewed_at timestamp with time zone
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vendor_assessments_tenant_id ON public.vendor_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vendor_assessments_vendor_id ON public.vendor_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_assessments_status ON public.vendor_assessments(status);
CREATE INDEX IF NOT EXISTS idx_vendor_assessments_public_link ON public.vendor_assessments(public_link) WHERE public_link IS NOT NULL;

-- Enable RLS
ALTER TABLE public.vendor_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can access vendor_assessments for their tenant" ON public.vendor_assessments;
CREATE POLICY "Users can access vendor_assessments for their tenant" ON public.vendor_assessments
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Public assessment access" ON public.vendor_assessments;
CREATE POLICY "Public assessment access" ON public.vendor_assessments
    FOR SELECT USING (
        public_link IS NOT NULL 
        AND public_link_expires_at > now()
        AND status IN ('sent', 'in_progress')
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS update_vendor_assessments_updated_at ON public.vendor_assessments;
CREATE TRIGGER update_vendor_assessments_updated_at
    BEFORE UPDATE ON public.vendor_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your roles)
GRANT ALL ON public.vendor_assessments TO authenticated;
GRANT SELECT ON public.vendor_assessments TO anon; -- Needed for public link access if using anon key
