-- Update tipo_framework check constraint to support new market frameworks
DO $$
BEGIN
    -- Drop the existing constraint
    ALTER TABLE assessment_frameworks DROP CONSTRAINT IF EXISTS assessment_frameworks_tipo_framework_check;

    -- Add the new constraint with expanded values
    ALTER TABLE assessment_frameworks ADD CONSTRAINT assessment_frameworks_tipo_framework_check 
    CHECK (tipo_framework IN (
        -- Original values
        'compliance', 'security', 'privacy', 'operational', 'financial', 
        'governance', 'risk_management', 'quality', 'environmental', 'custom',
        -- New Market Framework values
        'ISO27001', 'NIST', 'LGPD', 'GDPR', 'PCI_DSS', 'SOX', 'COBIT', 'ITIL', 'CUSTOM'
    ));
END $$;
