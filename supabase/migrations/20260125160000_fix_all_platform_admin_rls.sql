-- Fix all recursive RLS policies on platform_admins table

-- Drop existing policies that might be recursive
DROP POLICY IF EXISTS "platform_admins_manage_admin" ON "platform_admins";
DROP POLICY IF EXISTS "platform_admins_read_self_or_admin" ON "platform_admins";
DROP POLICY IF EXISTS "platform_admins_select" ON "platform_admins";
DROP POLICY IF EXISTS "platform_admins_insert" ON "platform_admins";
DROP POLICY IF EXISTS "platform_admins_update" ON "platform_admins";
DROP POLICY IF EXISTS "platform_admins_delete" ON "platform_admins";
DROP POLICY IF EXISTS "platform_admins_read_policy" ON "platform_admins";
DROP POLICY IF EXISTS "platform_admins_write_policy" ON "platform_admins";

-- Create new SAFE policies using the SECURITY DEFINER function is_platform_admin()
-- This function executes with owner privileges and avoids the RLS recursion loop

-- SELECT: Users can see themselves OR platform admins can see everyone
CREATE POLICY "platform_admins_select_safe" ON "platform_admins"
FOR SELECT
USING (
  user_id = auth.uid() OR is_platform_admin(auth.uid())
);

-- INSERT: Only platform admins can insert new admins
CREATE POLICY "platform_admins_insert_safe" ON "platform_admins"
FOR INSERT
WITH CHECK (
  is_platform_admin(auth.uid())
);

-- UPDATE: Only platform admins can update admins
CREATE POLICY "platform_admins_update_safe" ON "platform_admins"
FOR UPDATE
USING (
  is_platform_admin(auth.uid())
);

-- DELETE: Only platform admins can delete admins
CREATE POLICY "platform_admins_delete_safe" ON "platform_admins"
FOR DELETE
USING (
  is_platform_admin(auth.uid())
);
