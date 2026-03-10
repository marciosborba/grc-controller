-- Fix Requirements Schema for Standard Frameworks

-- 1. Allow NULL tenant_id in requisitos_compliance
ALTER TABLE requisitos_compliance ALTER COLUMN tenant_id DROP NOT NULL;

-- 2. Update RLS Policies
-- First, drop the valid existing policy if it exists (handling the error if needed or just drop if exists)
DROP POLICY IF EXISTS "requisitos_compliance_tenant_policy" ON "public"."requisitos_compliance";

-- Create Read Policy for Global Standard Requirements (where tenant_id is NULL)
CREATE POLICY "requisitos_compliance_read_standard"
ON "public"."requisitos_compliance"
FOR SELECT
USING (tenant_id IS NULL);

-- Create Policy for Tenant Access (Read/Write own data)
-- Re-creating the tenant logic but separated
CREATE POLICY "requisitos_compliance_tenant_isolation"
ON "public"."requisitos_compliance"
FOR ALL
USING (
  tenant_id IS NOT NULL AND (
    tenant_id IN (
      SELECT profiles.tenant_id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  )
);
