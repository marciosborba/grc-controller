-- Check if there are ANY valid assessments
SELECT count(*) as total_valid_assessments 
FROM vendor_assessments 
WHERE public_link IS NOT NULL 
  AND public_link_expires_at > now() 
  AND status IN ('sent', 'in_progress');

-- Try update as anon
SET LOCAL ROLE anon;

WITH updated_rows AS (
  UPDATE vendor_assessments 
  SET updated_at = now()
  WHERE public_link IS NOT NULL 
    AND public_link_expires_at > now() 
    AND status IN ('sent', 'in_progress')
  RETURNING id
)
SELECT count(*) as updated_count FROM updated_rows;
