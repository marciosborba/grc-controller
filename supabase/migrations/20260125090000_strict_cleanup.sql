-- Strict Cleanup of RLS Policies to fix Recursion

-- 1. Drop Functions with CASCADE to remove dependent policies automatically
DROP FUNCTION IF EXISTS public.is_platform_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_platform_admin(uuid) CASCADE;

-- 2. Drop any remaining policies on Target Tables (e.g. recursive ones not using the function)
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('platform_admins', 'tenants', 'assessments', 'risk_assessments') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. Clean Recreate of Helper Function
CREATE OR REPLACE FUNCTION public.is_platform_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM platform_admins
        WHERE user_id = user_id_param
    );
END;
$$;

-- 4. Recreate Platform Admins Policies
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_admins_read_self_or_admin" ON platform_admins
    FOR SELECT USING (
        user_id = auth.uid() OR is_platform_admin(auth.uid())
    );

CREATE POLICY "platform_admins_manage_admin" ON platform_admins
    FOR ALL USING (is_platform_admin(auth.uid()));

-- 5. Recreate Tenants Policies
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants_read_own" ON tenants
    FOR SELECT USING (
        id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "tenants_manage_admin" ON tenants
    FOR ALL USING (is_platform_admin(auth.uid()));

CREATE POLICY "tenants_read_admin" ON tenants
    FOR SELECT USING (is_platform_admin(auth.uid()));

-- 6. Recreate Assessments Policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'assessments') THEN
        ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "assessments_read_own" ON assessments FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "assessments_manage_admin" ON assessments FOR ALL USING (is_platform_admin(auth.uid()))';
    END IF;
END $$;

-- 7. Recreate Risk Assessments Policies
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'risk_assessments') THEN
        ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
        
        EXECUTE 'CREATE POLICY "risk_assessments_read_own" ON risk_assessments FOR SELECT USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()))';
        EXECUTE 'CREATE POLICY "risk_assessments_manage_admin" ON risk_assessments FOR ALL USING (is_platform_admin(auth.uid()))';
    END IF;
END $$;
