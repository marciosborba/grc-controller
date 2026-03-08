-- =============================================================
-- Migration: RBAC tables for Risk Portal
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. Custom roles per tenant
CREATE TABLE IF NOT EXISTS tenant_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Module/portal permissions per role
CREATE TABLE IF NOT EXISTS role_module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES tenant_roles(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  can_access boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, module_key)
);

-- 3. Add system_role to profiles (guest, user, admin, etc.)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS system_role text DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS custom_role_id uuid REFERENCES tenant_roles(id) ON DELETE SET NULL;

-- 4. RLS: tenant_roles visible to tenant admins
ALTER TABLE tenant_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_roles_select" ON tenant_roles
  FOR SELECT USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tenant_roles_insert" ON tenant_roles
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tenant_roles_update" ON tenant_roles
  FOR UPDATE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "tenant_roles_delete" ON tenant_roles
  FOR DELETE USING (
    tenant_id IN (
      SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- 5. RLS: role_module_permissions
ALTER TABLE role_module_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_module_perms_select" ON role_module_permissions
  FOR SELECT USING (
    role_id IN (
      SELECT tr.id FROM tenant_roles tr
      WHERE tr.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "role_module_perms_all" ON role_module_permissions
  FOR ALL USING (
    role_id IN (
      SELECT tr.id FROM tenant_roles tr
      WHERE tr.tenant_id IN (
        SELECT tenant_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- 6. Index for performance
CREATE INDEX IF NOT EXISTS idx_tenant_roles_tenant_id ON tenant_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_role_module_perms_role_id ON role_module_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_system_role ON profiles(system_role);
