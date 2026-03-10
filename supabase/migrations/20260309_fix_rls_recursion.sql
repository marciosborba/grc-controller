-- =============================================================
-- Migration: Fix Infinite Recursion in Profiles RLS
-- Period: 2026-03-09
-- =============================================================

-- 1. Create a helper function to get current user's tenant_id without recursion
-- SECURITY DEFINER bypasses RLS for the execution of THIS function
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT tenant_id FROM profiles WHERE id = auth.uid();
$$;

-- 2. Update Profiles Select Policy to use the helper function
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON profiles;
CREATE POLICY "Users can view profiles from their tenant"
    ON profiles
    FOR SELECT
    USING (
        id = auth.uid() 
        OR tenant_id = get_auth_tenant_id()
        OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
    );

-- 3. Update Profiles Update Policy to use the helper function
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

-- 4. Update User Roles Policies to be safe as well
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
