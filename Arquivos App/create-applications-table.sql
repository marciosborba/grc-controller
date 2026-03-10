-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Basic application information
    app_id VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Web Application', 'Mobile App', 'API', 'Database', 'Cloud Service', 'Desktop App', 'Microservice')),
    status VARCHAR(20) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Desenvolvimento', 'Teste', 'Descontinuado', 'Manutenção')),
    
    -- Technical information
    url TEXT,
    technology VARCHAR(255) NOT NULL,
    framework VARCHAR(255),
    language VARCHAR(255),
    version VARCHAR(100),
    
    -- Ownership and organization
    owner VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    description TEXT,
    
    -- Development information
    repository_url TEXT,
    documentation_url TEXT,
    
    -- Environment and classification
    environment VARCHAR(20) NOT NULL DEFAULT 'Production' CHECK (environment IN ('Production', 'Staging', 'Development', 'Testing')),
    criticality VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (criticality IN ('Critical', 'High', 'Medium', 'Low')),
    data_classification VARCHAR(20) NOT NULL DEFAULT 'Internal' CHECK (data_classification IN ('Public', 'Internal', 'Confidential', 'Restricted')),
    
    -- Compliance and governance
    compliance_requirements TEXT[], -- Array of compliance requirements
    
    -- Lifecycle information
    last_deployment TIMESTAMP WITH TIME ZONE,
    created_date TIMESTAMP WITH TIME ZONE,
    
    -- Source information
    source_tool VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    
    -- Raw data from source
    raw_data JSONB,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Constraints
    UNIQUE(tenant_id, app_id, source_tool)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(type);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_environment ON applications(environment);
CREATE INDEX IF NOT EXISTS idx_applications_criticality ON applications(criticality);
CREATE INDEX IF NOT EXISTS idx_applications_source_tool ON applications(source_tool);
CREATE INDEX IF NOT EXISTS idx_applications_owner ON applications(owner);
CREATE INDEX IF NOT EXISTS idx_applications_department ON applications(department);
CREATE INDEX IF NOT EXISTS idx_applications_technology ON applications(technology);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Create GIN index for raw_data JSONB column
CREATE INDEX IF NOT EXISTS idx_applications_raw_data ON applications USING GIN (raw_data);

-- Create GIN index for compliance_requirements array
CREATE INDEX IF NOT EXISTS idx_applications_compliance ON applications USING GIN (compliance_requirements);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_applications_tenant_type ON applications(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_applications_tenant_status ON applications(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_tenant_environment ON applications(tenant_id, environment);
CREATE INDEX IF NOT EXISTS idx_applications_tenant_criticality ON applications(tenant_id, criticality);

-- Add comments
COMMENT ON TABLE applications IS 'Stores application inventory data imported from various tools and platforms';
COMMENT ON COLUMN applications.type IS 'Application type: Web Application, Mobile App, API, Database, Cloud Service, Desktop App, Microservice';
COMMENT ON COLUMN applications.status IS 'Current status of the application';
COMMENT ON COLUMN applications.environment IS 'Deployment environment: Production, Staging, Development, Testing';
COMMENT ON COLUMN applications.criticality IS 'Business criticality level';
COMMENT ON COLUMN applications.data_classification IS 'Data sensitivity classification';
COMMENT ON COLUMN applications.compliance_requirements IS 'Array of compliance requirements (GDPR, SOX, HIPAA, etc.)';
COMMENT ON COLUMN applications.raw_data IS 'Original data from the source tool in JSON format';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_applications_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_applications_updated_at_column();

-- Create RLS policies (Row Level Security)
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their tenant's applications
CREATE POLICY applications_tenant_isolation ON applications
    FOR ALL USING (tenant_id = (
        SELECT tenant_id FROM user_profiles 
        WHERE user_id = auth.uid()
    ));

-- Grant permissions
GRANT ALL ON applications TO authenticated;
GRANT ALL ON applications TO service_role;

-- Create view for application statistics
CREATE OR REPLACE VIEW application_stats AS
SELECT 
    tenant_id,
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'Ativo') as active_applications,
    COUNT(*) FILTER (WHERE criticality = 'Critical') as critical_applications,
    COUNT(*) FILTER (WHERE environment = 'Production') as production_applications,
    COUNT(*) FILTER (WHERE type = 'Web Application') as web_applications,
    COUNT(*) FILTER (WHERE type = 'Mobile App') as mobile_applications,
    COUNT(*) FILTER (WHERE type = 'API') as api_applications,
    COUNT(*) FILTER (WHERE data_classification = 'Confidential' OR data_classification = 'Restricted') as sensitive_applications
FROM applications
GROUP BY tenant_id;

-- Grant access to the view
GRANT SELECT ON application_stats TO authenticated;
GRANT SELECT ON application_stats TO service_role;