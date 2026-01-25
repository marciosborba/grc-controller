-- Fix Infinite Recursion in RLS policies by using SECURITY DEFINER functions

-- 1. Ensure is_platform_admin is working and SECURITY DEFINER
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

-- 2. Update platform_admins policies to use the function (breaking the loop)
-- Using DO block to handle potential missing policies gracefully
DO $$
BEGIN
    DROP POLICY IF EXISTS "Platform admins can view platform admin records" ON platform_admins;
    DROP POLICY IF EXISTS "Platform admins can manage platform admin records" ON platform_admins;
    DROP POLICY IF EXISTS "Platform admins can view all tenants" ON tenants;
    DROP POLICY IF EXISTS "Platform admins can manage all tenants" ON tenants;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Platform admins can view platform admin records"
    ON platform_admins
    FOR SELECT
    USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage platform admin records"
    ON platform_admins
    FOR ALL
    USING (is_platform_admin(auth.uid()));

-- 3. Update tenants policies to use the function (breaking the loop)
CREATE POLICY "Platform admins can view all tenants"
    ON tenants
    FOR SELECT
    USING (is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins can manage all tenants"
    ON tenants
    FOR ALL
    USING (is_platform_admin(auth.uid()));

-- 4. Ensure risk_assessments exists
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_category VARCHAR(100),
    probability INTEGER CHECK (probability >= 1 AND probability <= 5),
    likelihood_score INTEGER CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
    risk_score INTEGER GENERATED ALWAYS AS (likelihood_score * impact_score) STORED,
    risk_level VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Identificado',
    assigned_to TEXT,
    due_date TIMESTAMPTZ,
    severity VARCHAR(20) DEFAULT 'medium',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    analysis_data JSONB DEFAULT '{}'
);

-- 5. Create Diagnostic Stats RPC (SECURITY DEFINER to bypass RLS for counts)
CREATE OR REPLACE FUNCTION get_diagnostic_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    total_users_count INTEGER;
    orphaned_profiles_count INTEGER;
    total_tenants_count INTEGER;
    active_tenants_count INTEGER;
    invalid_profiles_count INTEGER;
BEGIN
    -- Count total users in auth.users (requires security definer)
    SELECT COUNT(*) INTO total_users_count FROM auth.users;

    -- Count orphaned profiles (profile exists but no auth user)
    SELECT COUNT(*) INTO orphaned_profiles_count
    FROM profiles p
    LEFT JOIN auth.users u ON p.user_id = u.id
    WHERE u.id IS NULL;

    -- Count tenants
    SELECT COUNT(*) INTO total_tenants_count FROM tenants;
    
    -- Count active tenants
    SELECT COUNT(*) INTO active_tenants_count FROM tenants WHERE is_active = true;

    -- Count profiles with invalid tenant_id
    SELECT COUNT(*) INTO invalid_profiles_count
    FROM profiles p
    LEFT JOIN tenants t ON p.tenant_id = t.id
    WHERE t.id IS NULL;

    RETURN jsonb_build_object(
        'total_users', total_users_count,
        'orphaned_profiles', orphaned_profiles_count,
        'total_tenants', total_tenants_count,
        'active_tenants', active_tenants_count,
        'profiles_with_invalid_tenant', invalid_profiles_count
    );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_diagnostic_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_diagnostic_stats TO service_role;
