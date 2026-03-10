-- Fix RLS policies for incidents table to support platform_admin users
-- This script updates the RLS policies to allow platform_admin users to access incidents across all tenants

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view incidents from their tenant" ON incidents;
DROP POLICY IF EXISTS "Users can create incidents for their tenant" ON incidents;
DROP POLICY IF EXISTS "Users can update incidents from their tenant" ON incidents;

-- Create updated policies that support platform_admin users

-- 1. SELECT policy - Users can view incidents from their tenant OR platform_admin can view all
CREATE POLICY "Users can view incidents from their tenant or platform_admin can view all" ON incidents
  FOR SELECT
  USING (
    -- Regular users: only their tenant
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Platform admins: can view all incidents
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );

-- 2. INSERT policy - Users can create incidents for their tenant OR platform_admin can create for any tenant
CREATE POLICY "Users can create incidents for their tenant or platform_admin can create for any" ON incidents
  FOR INSERT
  WITH CHECK (
    -- Regular users: only for their tenant
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Platform admins: can create for any tenant
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );

-- 3. UPDATE policy - Users can update incidents from their tenant OR platform_admin can update any
CREATE POLICY "Users can update incidents from their tenant or platform_admin can update any" ON incidents
  FOR UPDATE
  USING (
    -- Regular users: only their tenant
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    OR
    -- Platform admins: can update any incident
    EXISTS (SELECT 1 FROM platform_admins WHERE user_id = auth.uid())
  );

-- Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'incidents'
ORDER BY cmd;