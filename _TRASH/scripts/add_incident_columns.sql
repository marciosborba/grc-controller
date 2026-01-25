-- Add missing columns to incidents table to match frontend Incident type

ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS type text DEFAULT 'security_breach',
ADD COLUMN IF NOT EXISTS detection_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS resolution_date timestamptz,
ADD COLUMN IF NOT EXISTS affected_systems text[],
ADD COLUMN IF NOT EXISTS business_impact text;

-- Ensure severity and priority are text (they likely are, but good to check/set defaults if needed)
-- They are already in the table based on previous checks.
