-- Fix vulnerabilities RLS policy to support guest users (vulnerability stakeholders)
-- Guest users have tenant_id in JWT user_metadata, not at the JWT root level.
-- The original policy only checked auth.jwt() ->> 'tenant_id' (root level),
-- which is null for guests, causing them to see no vulnerabilities.

DROP POLICY IF EXISTS "vulnerabilities_tenant_isolation_optimized" ON "vulnerabilities";

CREATE POLICY "vulnerabilities_tenant_isolation_optimized" ON "vulnerabilities"
FOR ALL
USING (
    tenant_id = COALESCE(
        -- Internal users: tenant_id at JWT root (set via custom hook / app_metadata)
        (auth.jwt() ->> 'tenant_id')::uuid,
        -- Guest users: tenant_id inside user_metadata
        (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    )
    OR
    is_platform_admin(auth.uid())
)
WITH CHECK (
    tenant_id = COALESCE(
        (auth.jwt() ->> 'tenant_id')::uuid,
        (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    )
    OR
    is_platform_admin(auth.uid())
);
