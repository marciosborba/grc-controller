SELECT conname, confrelid::regclass 
FROM pg_constraint 
WHERE conrelid = 'vendor_assessments'::regclass 
AND contype = 'f';
