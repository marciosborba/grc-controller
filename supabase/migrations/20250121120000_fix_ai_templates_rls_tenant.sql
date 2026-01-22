-- ============================================================================
-- MIGRATION: FIX AI PROMPT TEMPLATES RLS FOR TENANT ACCESS
-- ============================================================================

-- Drop restrictive policies
DROP POLICY IF EXISTS "Users can manage own templates" ON ai_grc_prompt_templates;

-- Create permissive policy for Tenant Users
-- Users can View/Insert/Update/Delete templates if they belong to the same tenant
CREATE POLICY "Users can manage tenant templates" ON ai_grc_prompt_templates 
FOR ALL 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Ensure "Platform admins" policy remains (it was All Access)
-- If not present, we can recreate it, but the previous migration should have handled it.
-- Just to be safe, let's ensure it exists or relies on the tenant check if admins also have tenant_id.

-- Note: The previous migration (20250818120000) created "Platform admins can manage all templates". 
-- That policy uses a check on `profiles.is_platform_admin` or `user_permissions.admin`.
-- This new policy adds specific access for regular tenant users.

-- Also ensure SELECT is covered.
-- Previous migration had: "Users can view public templates" (is_public=true)
-- We need: "Users can view tenant templates" (even if private)

DROP POLICY IF EXISTS "Users can view tenant templates" ON ai_grc_prompt_templates;

CREATE POLICY "Users can view tenant templates" ON ai_grc_prompt_templates 
FOR SELECT 
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- Fix for "Platform admins can view all templates" if needed, but existing should work.
