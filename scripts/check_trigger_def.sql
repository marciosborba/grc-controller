SELECT pg_get_triggerdef(oid) as trigger_def
FROM pg_trigger 
WHERE tgname = 'update_vendor_assessments_updated_at';

SELECT p.prosrc as function_source
FROM pg_proc p
JOIN pg_trigger t ON t.tgfoid = p.oid
WHERE t.tgname = 'update_vendor_assessments_updated_at';
