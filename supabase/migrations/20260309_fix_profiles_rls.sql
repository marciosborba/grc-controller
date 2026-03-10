-- =============================================================
-- Migration: Fix RLS for profiles and user_roles
-- Period: 2026-03-09
-- =============================================================

-- 1. Allow admins to update profiles in their tenant
DROP POLICY IF EXISTS "Admins can update profiles in their tenant" ON profiles;
CREATE POLICY "Admins can update profiles in their tenant"
    ON profiles
    FOR UPDATE
    USING (
        (SELECT tenant_id FROM profiles WHERE user_id = auth.uid()) = tenant_id
        AND (
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND (role::text = 'admin' OR role::text = 'tenant_admin'))
            OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
        )
    );

-- 2. RLS for user_roles table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_all" ON user_roles;
CREATE POLICY "user_roles_select_all"
    ON user_roles
    FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;
CREATE POLICY "Admins can manage user_roles"
    ON user_roles
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
        AND (
            EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND (role::text = 'admin' OR role::text = 'tenant_admin'))
            OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
        )
    );

-- 3. Ensure profiles are visible to those who can manage roles
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON profiles;
CREATE POLICY "Users can view profiles from their tenant"
    ON profiles
    FOR SELECT
    USING (
        user_id = auth.uid() 
        OR tenant_id = (SELECT tenant_id FROM profiles WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
    );
