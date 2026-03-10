-- =============================================================
-- Migration: Final RLS Stability (v6 - Breaking platform_admins recursion)
-- Period: 2026-03-09
-- =============================================================

-- 1. Ensure functions are robust and SEC DEFINER
CREATE OR REPLACE FUNCTION is_platform_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM platform_admins WHERE user_id = user_id_param);
END;
$$;

CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid());
END;
$$;

-- 2. FIX: platform_admins policies MUST NOT be recursive
-- The previous "platform_admins_read_all" used a direct SELECT which triggered RLS again.
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_admins_read_self" ON platform_admins;
DROP POLICY IF EXISTS "platform_admins_read_all" ON platform_admins;

-- Simple policy: you can see your own entry
CREATE POLICY "platform_admins_read_self"
    ON platform_admins
    FOR SELECT
    USING (user_id = auth.uid());

-- Admin policy: use the SECURITY DEFINER function to check if caller is an admin
-- This works because the function runs as 'postgres' (bypass RLS)
CREATE POLICY "platform_admins_read_all"
    ON platform_admins
    FOR SELECT
    USING (is_platform_admin(auth.uid()));

-- 3. PROFILES Policies
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON profiles;
CREATE POLICY "Users can view profiles from their tenant"
    ON profiles
    FOR SELECT
    USING (
        id = auth.uid() 
        OR is_platform_admin() 
        OR tenant_id = (SELECT p.tenant_id FROM profiles p WHERE p.id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can update profiles in their tenant" ON profiles;
CREATE POLICY "Admins can update profiles in their tenant"
    ON profiles
    FOR UPDATE
    USING (
        is_platform_admin()
        OR (
            tenant_id = (SELECT p.tenant_id FROM profiles p WHERE p.id = auth.uid())
            AND EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND (role::text = 'admin' OR role::text = 'tenant_admin')
            )
        )
    );

-- 4. USER_ROLES Policies
DROP POLICY IF EXISTS "user_roles_select_all" ON user_roles;
CREATE POLICY "user_roles_select_all"
    ON user_roles
    FOR SELECT
    USING (
        is_platform_admin()
        OR tenant_id = (SELECT p.tenant_id FROM profiles p WHERE p.id = auth.uid())
    );

DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;
CREATE POLICY "Admins can manage user_roles"
    ON user_roles
    FOR ALL
    USING (
        is_platform_admin()
        OR (
            tenant_id = (SELECT p.tenant_id FROM profiles p WHERE p.id = auth.uid())
            AND EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND (role::text = 'admin' OR role::text = 'tenant_admin')
            )
        )
    );
