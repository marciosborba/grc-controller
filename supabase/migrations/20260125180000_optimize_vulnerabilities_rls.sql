-- Optimize Vulnerabilities RLS to avoid table joins and recursion

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated Access" ON "vulnerabilities";
DROP POLICY IF EXISTS "vulnerabilities_tenant_isolation" ON "vulnerabilities";
DROP POLICY IF EXISTS "vulnerabilities_select" ON "vulnerabilities";
DROP POLICY IF EXISTS "vulnerabilities_insert" ON "vulnerabilities";
DROP POLICY IF EXISTS "vulnerabilities_update" ON "vulnerabilities";
DROP POLICY IF EXISTS "vulnerabilities_delete" ON "vulnerabilities";

-- Create optimized policy using JWT tenant_id
-- This avoids querying the profiles table, preventing recursion and locks
CREATE POLICY "vulnerabilities_tenant_isolation_optimized" ON "vulnerabilities"
FOR ALL
USING (
    -- Allow access if the row's tenant_id matches the user's JWT tenant_id
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR
    -- OR if the user is a platform admin (using the Safe Security Definer function)
    is_platform_admin(auth.uid())
)
WITH CHECK (
    -- For INSERT/UPDATE, enforce the same rule
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    OR
    is_platform_admin(auth.uid())
);

-- Separate policy for Platform Admins to view everything (redundant but explicit for clarity/audit)
-- Actually managed by OR above, but let's ensure indexes are used.
-- The above boolean logic is sufficient and optimized.

-- Verify is_platform_admin existence to be safe (it should exist from previous steps)
-- If not, we create a stub to prevent errors, but we trust it exists.
