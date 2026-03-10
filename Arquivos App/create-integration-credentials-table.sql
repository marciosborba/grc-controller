-- Create integration_credentials table
CREATE TABLE IF NOT EXISTS integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    integration_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_integration_credentials_tenant_id ON integration_credentials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_integration_credentials_type ON integration_credentials(integration_type);
CREATE INDEX IF NOT EXISTS idx_integration_credentials_active ON integration_credentials(is_active);

-- Add comments
COMMENT ON TABLE integration_credentials IS 'Stores encrypted credentials for security tool integrations';
COMMENT ON COLUMN integration_credentials.encrypted_credentials IS 'Encrypted JSON containing API keys, passwords, etc.';

-- Enable RLS
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY integration_credentials_tenant_isolation ON integration_credentials
    FOR ALL USING (tenant_id = (
        SELECT tenant_id FROM user_profiles 
        WHERE user_id = auth.uid()
    ));

-- Grant permissions
GRANT ALL ON integration_credentials TO authenticated;
GRANT ALL ON integration_credentials TO service_role;