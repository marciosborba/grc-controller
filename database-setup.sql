-- Create vulnerabilities table if it doesn't exist
CREATE TABLE IF NOT EXISTS vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Basic vulnerability information
    title VARCHAR(500) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low', 'Info')),
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In_Progress', 'Testing', 'Resolved', 'Accepted', 'False_Positive')),
    
    -- Scoring and classification
    cvss_score DECIMAL(3,1),
    cve_id VARCHAR(50),
    
    -- Asset information
    asset_name VARCHAR(255) NOT NULL,
    asset_ip INET,
    
    -- Source information
    source_tool VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    
    -- Network information
    port INTEGER,
    protocol VARCHAR(20),
    
    -- Dates
    first_found_date TIMESTAMP WITH TIME ZONE,
    last_found_date TIMESTAMP WITH TIME ZONE,
    
    -- Remediation
    solution TEXT,
    references TEXT[],
    
    -- Assignment and tracking
    assigned_to VARCHAR(255),
    due_date TIMESTAMP WITH TIME ZONE,
    sla_breach BOOLEAN DEFAULT FALSE,
    
    -- Raw data from source
    raw_data JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tenant_id ON vulnerabilities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_source_tool ON vulnerabilities(source_tool);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_asset_name ON vulnerabilities(asset_name);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_created_at ON vulnerabilities(created_at);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_cvss_score ON vulnerabilities(cvss_score);

-- Create GIN index for raw_data JSONB column
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_raw_data ON vulnerabilities USING GIN (raw_data);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tenant_status ON vulnerabilities(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tenant_severity ON vulnerabilities(tenant_id, severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_tenant_source ON vulnerabilities(tenant_id, source_tool);

-- Add comments
COMMENT ON TABLE vulnerabilities IS 'Stores vulnerability data imported from various security tools';
COMMENT ON COLUMN vulnerabilities.severity IS 'Vulnerability severity: Critical, High, Medium, Low, Info';
COMMENT ON COLUMN vulnerabilities.status IS 'Current status of the vulnerability';
COMMENT ON COLUMN vulnerabilities.cvss_score IS 'CVSS score (0.0 to 10.0)';
COMMENT ON COLUMN vulnerabilities.raw_data IS 'Original data from the source tool in JSON format';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_vulnerabilities_updated_at ON vulnerabilities;
CREATE TRIGGER update_vulnerabilities_updated_at
    BEFORE UPDATE ON vulnerabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies (Row Level Security)
ALTER TABLE vulnerabilities ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their tenant's vulnerabilities
CREATE POLICY vulnerabilities_tenant_isolation ON vulnerabilities
    FOR ALL USING (tenant_id = (
        SELECT tenant_id FROM user_profiles 
        WHERE user_id = auth.uid()
    ));

-- Grant permissions
GRANT ALL ON vulnerabilities TO authenticated;
GRANT ALL ON vulnerabilities TO service_role;