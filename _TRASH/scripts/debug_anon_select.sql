-- Check visibility as anon
SET LOCAL ROLE anon;

SELECT count(*) as visible_rows 
FROM vendor_assessments 
WHERE public_link IS NOT NULL 
  AND public_link_expires_at > now() 
  AND status IN ('sent', 'in_progress');
