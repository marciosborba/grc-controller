SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'vendor_assessments'::regclass;
