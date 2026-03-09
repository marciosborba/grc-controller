-- =============================================================
-- Migration: Final RLS Stability (v11 - Total Isolation)
-- Period: 2026-03-09
-- =============================================================

-- 1. Drop existing functions to avoid parameter name/type conflicts
DROP FUNCTION IF EXISTS is_platform_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_platform_admin() CASCADE;

-- 2. Helper Functions (STABLE, SECURITY DEFINER, PL/pgSQL)
-- These functions RUN AS OWNER (postgres) and bypass RLS on the tables they read.

CREATE OR REPLACE FUNCTION is_platform_admin(user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM platform_admins WHERE user_id = user_id_param);
END;
$$;

CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID 
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- SECURITY DEFINER bypasses RLS on profiles
    SELECT tenant_id INTO v_tenant_id FROM profiles WHERE id = auth.uid() LIMIT 1;
    RETURN v_tenant_id;
END;
$$;

CREATE OR REPLACE FUNCTION is_tenant_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    v_tenant_id := get_auth_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN FALSE; END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = p_user_id 
        AND tenant_id = v_tenant_id
        AND (role::text = 'admin' OR role::text = 'tenant_admin')
    );
END;
$$;

-- 3. Refined Policies to consume these safe functions

-- PLATFORM_ADMINS:
ALTER TABLE platform_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "platform_admins_auth_read" ON platform_admins;
DROP POLICY IF EXISTS "platform_admins_full_access" ON platform_admins;

CREATE POLICY "platform_admins_auth_read" ON platform_admins FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "platform_admins_full_access" ON platform_admins FOR ALL USING (is_platform_admin());

-- TENANTS:
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenants_select_policy" ON tenants;
DROP POLICY IF EXISTS "tenants_admin_policy" ON tenants;

CREATE POLICY "tenants_select_policy" ON tenants FOR SELECT
    USING (id = get_auth_tenant_id() OR is_platform_admin());

CREATE POLICY "tenants_admin_policy" ON tenants FOR ALL
    USING (is_platform_admin());

-- PROFILES:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;

CREATE POLICY "profiles_select_policy" ON profiles FOR SELECT
    USING (id = auth.uid() OR tenant_id = get_auth_tenant_id() OR is_platform_admin());

CREATE POLICY "profiles_update_policy" ON profiles FOR UPDATE
    USING (id = auth.uid() OR is_tenant_admin() OR is_platform_admin());

-- USER_ROLES:
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin_policy" ON user_roles;

CREATE POLICY "user_roles_select_policy" ON user_roles FOR SELECT
    USING (tenant_id = get_auth_tenant_id() OR is_platform_admin());

CREATE POLICY "user_roles_admin_policy" ON user_roles FOR ALL
    USING (is_tenant_admin() OR is_platform_admin());
