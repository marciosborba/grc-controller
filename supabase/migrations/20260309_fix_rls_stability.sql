-- =============================================================
-- Migration: Fix RLS Stability (Breaking Recursion)
-- Period: 2026-03-09
-- =============================================================

-- 1. Redefine function as PL/pgSQL to avoid inlining and ensure SECURITY DEFINER behavior
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- This query bypasses RLS on profiles thanks to SECURITY DEFINER
    SELECT tenant_id INTO v_tenant_id 
    FROM profiles 
    WHERE id = auth.uid();
    
    RETURN v_tenant_id;
END;
$$;

-- 2. Update Profiles Policies with cautious checks
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON profiles;
CREATE POLICY "Users can view profiles from their tenant"
    ON profiles
    FOR SELECT
    USING (
        id = auth.uid() 
        OR tenant_id = get_auth_tenant_id()
        -- Direct check on platform_admins (usually less prone to recursion if not many policies there)
        OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update profiles in their tenant" ON profiles;
CREATE POLICY "Admins can update profiles in their tenant"
    ON profiles
    FOR UPDATE
    USING (
        tenant_id = get_auth_tenant_id()
        AND (
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND (role::text = 'admin' OR role::text = 'tenant_admin'))
            OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
        )
    );

-- 3. Update User Roles Policies
-- Avoid using get_auth_tenant_id() inside user_roles if possible to minimize dependency chain
-- but if we want per-tenant isolation, it's often needed.
DROP POLICY IF EXISTS "user_roles_select_all" ON user_roles;
CREATE POLICY "user_roles_select_all"
    ON user_roles
    FOR SELECT
    USING (
        tenant_id = get_auth_tenant_id()
        OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;
CREATE POLICY "Admins can manage user_roles"
    ON user_roles
    FOR ALL
    USING (
        tenant_id = get_auth_tenant_id()
        AND (
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND (role::text = 'admin' OR role::text = 'tenant_admin'))
            OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
        )
    );
