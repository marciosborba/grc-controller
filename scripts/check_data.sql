SELECT id, public_link, public_link_expires_at, status 
FROM vendor_assessments 
WHERE public_link IS NOT NULL 
LIMIT 5;
