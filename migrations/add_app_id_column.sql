-- Add app_id column to vulnerabilities table
ALTER TABLE vulnerabilities ADD COLUMN IF NOT EXISTS app_id VARCHAR(50);

-- Create index for faster lookups by app_id
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_app_id ON vulnerabilities(app_id);
