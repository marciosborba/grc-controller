-- Add missing fields to incidents table
-- This migration adds the fields that the incident management modal expects

-- Add severity field
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium';

-- Add type field  
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'security_breach';

-- Add detection_date field
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS detection_date TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add resolution_date field
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS resolution_date TIMESTAMP WITH TIME ZONE;

-- Add business_impact field
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS business_impact TEXT;

-- Add affected_systems field (JSON array)
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS affected_systems JSONB;

-- Add tags field (JSON array)
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS tags JSONB;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_detection_date ON incidents(detection_date);

-- Add comments
COMMENT ON COLUMN incidents.severity IS 'Incident severity level: low, medium, high, critical';
COMMENT ON COLUMN incidents.type IS 'Type of incident: security_breach, malware, phishing, etc.';
COMMENT ON COLUMN incidents.detection_date IS 'When the incident was first detected';
COMMENT ON COLUMN incidents.resolution_date IS 'When the incident was resolved';
COMMENT ON COLUMN incidents.business_impact IS 'Description of business impact';
COMMENT ON COLUMN incidents.affected_systems IS 'JSON array of affected systems';
COMMENT ON COLUMN incidents.tags IS 'JSON array of tags for categorization';