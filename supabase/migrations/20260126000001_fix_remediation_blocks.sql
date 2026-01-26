-- Fix remediation_tasks table structure
ALTER TABLE public.remediation_tasks 
ADD COLUMN IF NOT EXISTS proposed_vulnerability_status TEXT;

-- Make title nullable since we are not using it in the new Block UI
ALTER TABLE public.remediation_tasks 
ALTER COLUMN title DROP NOT NULL;
