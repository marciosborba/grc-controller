SELECT attname, attgenerated 
FROM pg_attribute 
WHERE attrelid = 'vendor_assessments'::regclass 
AND attname IN ('public_link', 'updated_at');
