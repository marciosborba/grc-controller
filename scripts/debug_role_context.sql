SELECT current_user as initial_user, session_user as initial_session;

SET LOCAL ROLE anon;

SELECT current_user as switched_user, session_user as switched_session;

SELECT has_schema_privilege('anon', 'public', 'usage') as has_public_usage;

SELECT count(*) as visible_rows 
FROM vendor_assessments 
WHERE public_link IS NOT NULL;
