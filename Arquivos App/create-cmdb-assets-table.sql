-- Create cmdb_assets table
CREATE TABLE IF NOT EXISTS cmdb_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    
    -- Basic asset information
    asset_id VARCHAR(255) NOT NULL,
    name VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Server', 'Workstation', 'Network Device', 'Mobile Device', 'Storage', 'Infrastructure')),
    status VARCHAR(20) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Manutenção', 'Descomissionado')),
    
    -- Network information
    ip_address INET,
    mac_address VARCHAR(17),
    
    -- Location and ownership
    location VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    
    -- Technical specifications
    os VARCHAR(255),
    os_version VARCHAR(255),
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(255),
    asset_tag VARCHAR(255),
    
    -- Lifecycle information
    purchase_date TIMESTAMP WITH TIME ZONE,
    warranty_expiry TIMESTAMP WITH TIME ZONE,
    last_scan TIMESTAMP WITH TIME ZONE,
    
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
    UNIQUE(tenant_id, asset_id, source_tool)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_tenant_id ON cmdb_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_type ON cmdb_assets(type);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_status ON cmdb_assets(status);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_source_tool ON cmdb_assets(source_tool);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_location ON cmdb_assets(location);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_owner ON cmdb_assets(owner);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_ip_address ON cmdb_assets(ip_address);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_created_at ON cmdb_assets(created_at);

-- Create GIN index for raw_data JSONB column
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_raw_data ON cmdb_assets USING GIN (raw_data);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_tenant_type ON cmdb_assets(tenant_id, type);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_tenant_status ON cmdb_assets(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_cmdb_assets_tenant_location ON cmdb_assets(tenant_id, location);

-- Add comments
COMMENT ON TABLE cmdb_assets IS 'Stores asset data imported from various CMDB and discovery tools';
COMMENT ON COLUMN cmdb_assets.type IS 'Asset type: Server, Workstation, Network Device, Mobile Device, Storage, Infrastructure';
COMMENT ON COLUMN cmdb_assets.status IS 'Current status of the asset';
COMMENT ON COLUMN cmdb_assets.raw_data IS 'Original data from the source tool in JSON format';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cmdb_assets_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_cmdb_assets_updated_at ON cmdb_assets;
CREATE TRIGGER update_cmdb_assets_updated_at
    BEFORE UPDATE ON cmdb_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_cmdb_assets_updated_at_column();

-- Create RLS policies (Row Level Security)
ALTER TABLE cmdb_assets ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their tenant's assets
CREATE POLICY cmdb_assets_tenant_isolation ON cmdb_assets
    FOR ALL USING (tenant_id = (
        SELECT tenant_id FROM user_profiles 
        WHERE user_id = auth.uid()
    ));

-- Grant permissions
GRANT ALL ON cmdb_assets TO authenticated;
GRANT ALL ON cmdb_assets TO service_role;