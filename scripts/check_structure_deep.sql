SELECT inhparent::regclass 
FROM pg_inherits 
WHERE inhrelid = 'vendor_assessments'::regclass;

SELECT * 
FROM information_schema.column_privileges 
WHERE table_name = 'vendor_assessments' 
AND grantee = 'anon';
