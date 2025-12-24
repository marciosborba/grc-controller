-- Add is_standard column to assessment_frameworks
ALTER TABLE assessment_frameworks 
ADD COLUMN IF NOT EXISTS is_standard BOOLEAN DEFAULT false;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_assessment_frameworks_is_standard ON assessment_frameworks(is_standard);

-- Update existing market frameworks if any (based on padrao_origem)
UPDATE assessment_frameworks 
SET is_standard = true 
WHERE padrao_origem IS NOT NULL AND tipo_framework != 'custom';
