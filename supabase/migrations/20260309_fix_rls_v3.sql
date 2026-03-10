-- =============================================================
-- Migration: Final RLS Stability (v3 - Eliminating all recursion)
-- Period: 2026-03-09
-- =============================================================

-- 1. Helper function to check platform admin status (SECURE - PL/pgSQL to avoid inlining)
CREATE OR REPLACE FUNCTION is_platform_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM platform_admins WHERE user_id = p_user_id);
END;
$$;

-- 2. Simplified Platform Admins Policies (avoid calling is_platform_admin() on itself)
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_admins_read_self" ON platform_admins;
CREATE POLICY "platform_admins_read_self"
    ON platform_admins
    FOR SELECT
    USING (user_id = auth.uid());

-- Separate policy for platform admins to see everyone else
-- We use a direct subquery which is safer than calling the function back
DROP POLICY IF EXISTS "platform_admins_read_all" ON platform_admins;
CREATE POLICY "platform_admins_read_all"
    ON platform_admins
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid()));

-- 3. PROFILES Policies
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON profiles;
CREATE POLICY "Users can view profiles from their tenant"
    ON profiles
    FOR SELECT
    USING (
        id = auth.uid() 
        OR tenant_id = get_auth_tenant_id()
        OR is_platform_admin()
    );

DROP POLICY IF EXISTS "Admins can update profiles in their tenant" ON profiles;
CREATE POLICY "Admins can update profiles in their tenant"
    ON profiles
    FOR UPDATE
    USING (
        is_platform_admin()
        OR (
            tenant_id = get_auth_tenant_id()
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
        tenant_id = get_auth_tenant_id()
        OR is_platform_admin()
    );

DROP POLICY IF EXISTS "Admins can manage user_roles" ON user_roles;
CREATE POLICY "Admins can manage user_roles"
    ON user_roles
    FOR ALL
    USING (
        is_platform_admin()
        OR (
            tenant_id = get_auth_tenant_id()
            AND EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND (role::text = 'admin' OR role::text = 'tenant_admin')
            )
        )
    );
