-- =============================================================
-- Migration: Final RLS Stability and Platform Admin Access (v2)
-- Period: 2026-03-09
-- =============================================================

-- 1. Helper functions to check platform admin status (SECURE)
-- Case 1: Overload with parameter (keeps existing signature to avoid dependency issues)
CREATE OR REPLACE FUNCTION is_platform_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM platform_admins WHERE user_id = user_id_param);
$$;

-- Case 2: Overload without parameter for easy use in policies
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid());
$$;

-- 2. Refined tenant_id lookup (SECURE)
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid();
    RETURN v_tenant_id;
END;
$$;

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
        is_platform_admin() -- Platform admins can update any profile
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
        is_platform_admin() -- Platform admins can manage any roles
        OR (
            tenant_id = get_auth_tenant_id()
            AND EXISTS (
                SELECT 1 FROM user_roles 
                WHERE user_id = auth.uid() 
                AND (role::text = 'admin' OR role::text = 'tenant_admin')
            )
        )
    );

-- 5. PLATFORM_ADMINS Policies
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_admins_read_self" ON platform_admins;
CREATE POLICY "platform_admins_read_self"
    ON platform_admins
    FOR SELECT
    USING (user_id = auth.uid() OR is_platform_admin());
