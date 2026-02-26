-- Fix redundant policies for assessment tables
-- The "allow_read_standard_*" policies (admin only) are subsumed by the 
-- broad "*_tenant_policy" policies which grant global read access to standard items (tenant_id IS NULL).

DROP POLICY IF EXISTS "allow_read_standard_controls" ON public.assessment_controls;
DROP POLICY IF EXISTS "allow_read_standard_definitions" ON public.assessment_definitions;
DROP POLICY IF EXISTS "allow_read_standard_frameworks" ON public.assessment_frameworks;
DROP POLICY IF EXISTS "allow_read_standard_mechanisms" ON public.assessment_mechanisms;
