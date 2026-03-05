-- Add Risk Override fields
ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS risk_override_level text;
ALTER TABLE vendor_registry ADD COLUMN IF NOT EXISTS risk_override_reason text;
