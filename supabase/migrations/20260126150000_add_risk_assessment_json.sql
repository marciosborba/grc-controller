-- Add risk_assessment_data column to vulnerabilities table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vulnerabilities' AND column_name = 'risk_assessment_data') THEN
        ALTER TABLE vulnerabilities ADD COLUMN risk_assessment_data JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
