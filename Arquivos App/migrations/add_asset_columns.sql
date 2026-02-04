-- Add asset_type and asset_url columns to vulnerabilities table
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS asset_type VARCHAR(50);
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS asset_url VARCHAR(255);

-- Create index for asset_type (good for filtering)
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_asset_type ON vulnerabilities(asset_type);
