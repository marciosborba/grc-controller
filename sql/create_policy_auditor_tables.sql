-- Create tables for Policy Auditor

-- DROP for clean state during development (optional, remove in prod if data persistence needed)
DROP TABLE IF EXISTS policy_control_matches;
DROP TABLE IF EXISTS policy_audits;

-- Table: policy_audits
CREATE TABLE IF NOT EXISTS policy_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL, 
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    framework_id UUID, -- Link to assessment_frameworks if exists
    framework_name TEXT, 
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    adequacy_percentage NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: policy_control_matches
CREATE TABLE IF NOT EXISTS policy_control_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID NOT NULL REFERENCES policy_audits(id) ON DELETE CASCADE,
    control_code TEXT, 
    control_description TEXT,
    detected_evidence TEXT, 
    framework_requirement_id UUID, 
    framework_requirement_code TEXT, 
    
    -- Metrics
    adequacy_score INTEGER DEFAULT 0 CHECK (adequacy_score BETWEEN 0 AND 100),
    maturity_level TEXT CHECK (maturity_level IN ('Initial', 'Managed', 'Defined', 'Quantitatively Managed', 'Optimizing')),
    status TEXT CHECK (status IN ('compliant', 'partial', 'non_compliant')),
    
    user_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_policy_audits_tenant_id ON policy_audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policy_audits_policy_id ON policy_audits(policy_id);
CREATE INDEX IF NOT EXISTS idx_policy_control_matches_audit_id ON policy_control_matches(audit_id);

-- Enable RLS
ALTER TABLE policy_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_control_matches ENABLE ROW LEVEL SECURITY;

-- Create Policies for RLS
CREATE POLICY "Users can view audit data for their tenant" ON policy_audits
    FOR SELECT USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert audit data for their tenant" ON policy_audits
    FOR INSERT WITH CHECK (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update audit data for their tenant" ON policy_audits
    FOR UPDATE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));
    
CREATE POLICY "Users can delete audit data for their tenant" ON policy_audits
    FOR DELETE USING (tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    ));

-- RLS for control matches (inherit from audit)
CREATE POLICY "Users can view control matches for their tenant" ON policy_control_matches
    FOR SELECT USING (audit_id IN (
        SELECT id FROM policy_audits WHERE tenant_id IN (
            SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert control matches for their tenant" ON policy_control_matches
    FOR INSERT WITH CHECK (audit_id IN (
        SELECT id FROM policy_audits WHERE tenant_id IN (
             SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
    ));
    
CREATE POLICY "Users can update control matches for their tenant" ON policy_control_matches
    FOR UPDATE USING (audit_id IN (
        SELECT id FROM policy_audits WHERE tenant_id IN (
             SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can delete control matches for their tenant" ON policy_control_matches
    FOR DELETE USING (audit_id IN (
        SELECT id FROM policy_audits WHERE tenant_id IN (
             SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

COMMENT ON TABLE policy_audits IS 'Tracks audits of internal policies against frameworks';
COMMENT ON TABLE policy_control_matches IS 'Specific controls detected and analyzed within a policy audit';
