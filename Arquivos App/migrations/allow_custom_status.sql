-- Drop the check constraint on vulnerabilities.status
ALTER TABLE vulnerabilities DROP CONSTRAINT IF EXISTS vulnerabilities_status_check;

-- verify it's gone (optional, just for output)
SELECT conname FROM pg_constraint WHERE conname = 'vulnerabilities_status_check';
