-- Modify columns to allow null values for user references in test data
ALTER TABLE public.risk_assessments ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.compliance_records ALTER COLUMN created_by DROP NOT NULL;
ALTER TABLE public.audit_reports ALTER COLUMN auditor_id DROP NOT NULL;
ALTER TABLE public.security_incidents ALTER COLUMN reported_by DROP NOT NULL;
ALTER TABLE public.controls ALTER COLUMN created_by DROP NOT NULL;