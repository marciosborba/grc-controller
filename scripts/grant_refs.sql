GRANT SELECT ON vendor_registry TO anon;
GRANT SELECT ON assessment_frameworks TO anon;
GRANT SELECT ON vendor_registry TO service_role;
GRANT SELECT ON assessment_frameworks TO service_role;

-- Also check RLS on referenced tables
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('vendor_registry', 'assessment_frameworks');
