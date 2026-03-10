-- =============================================================
-- Migration: Final RLS Stability (v8 - Absolute Recursion Break)
-- Period: 2026-03-09
-- =============================================================

-- 1. STABLE & SECURITY DEFINER Functions (Ready to bypass RLS)
CREATE OR REPLACE FUNCTION is_platform_admin(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
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
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
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

-- 2. FIX: Remove all recursion from platform_admins
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_admins_read_self" ON platform_admins;
DROP POLICY IF EXISTS "platform_admins_read_all" ON platform_admins;

-- This is the only policy for platform_admins. It is NOT recursive.
-- It only allows reading your own row.
-- The is_platform_admin() function will still see everyone because it's SECURITY DEFINER.
CREATE POLICY "platform_admins_read_self" 
    ON platform_admins 
    FOR SELECT 
    USING (user_id = auth.uid());

-- 3. PROFILES Policies
DROP POLICY IF EXISTS "Users can view profiles from their tenant" ON profiles;
CREATE POLICY "Users can view profiles from their tenant"
    ON profiles
    FOR SELECT
    USING (
        id = auth.uid() 
        OR is_platform_admin() 
        OR tenant_id = get_auth_tenant_id()
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
        is_platform_admin()
        OR tenant_id = get_auth_tenant_id()
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
