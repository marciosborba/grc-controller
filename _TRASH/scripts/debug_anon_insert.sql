SET LOCAL ROLE anon;

WITH inserted_rows AS (
  INSERT INTO vendor_assessments (public_link, status, vendor_id, tenant_id)
  VALUES ('test_link_' || md5(random()::text), 'in_progress', 'd5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'd5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5')
  RETURNING id
)
SELECT count(*) as inserted_count FROM inserted_rows;
