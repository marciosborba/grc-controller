-- Add risk assessment columns to ethics_reports table
ALTER TABLE ethics_reports
ADD COLUMN IF NOT EXISTS risk_score numeric,
ADD COLUMN IF NOT EXISTS compliance_impact numeric,
ADD COLUMN IF NOT EXISTS regulatory_risk text,
ADD COLUMN IF NOT EXISTS reputational_risk text,
ADD COLUMN IF NOT EXISTS financial_impact_estimate numeric;

-- Add comment for documentation
COMMENT ON COLUMN ethics_reports.risk_score IS 'Calculated risk score based on category and severity';
COMMENT ON COLUMN ethics_reports.compliance_impact IS 'Estimated impact on compliance posture (0-100)';
