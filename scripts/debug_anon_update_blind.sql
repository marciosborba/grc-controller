SET LOCAL ROLE anon;

UPDATE vendor_assessments 
SET updated_at = now()
WHERE public_link IS NOT NULL;
