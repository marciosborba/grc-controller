-- No SET ROLE, running as connected user (postgres)

WITH updated_rows AS (
  UPDATE vendor_assessments 
  SET updated_at = now()
  WHERE public_link IS NOT NULL 
  RETURNING id
)
SELECT count(*) as updated_count FROM updated_rows;
