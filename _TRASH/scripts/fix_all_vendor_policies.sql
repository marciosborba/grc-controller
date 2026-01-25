-- Fix bad RLS policies on all vendor tables that try to query auth.users directly.
-- This resolves "Permission denied for table users" errors.

-- 1. vendor_risks (already fixed, but ensuring consistency)
DROP POLICY IF EXISTS "Users can access vendor_risks for their tenant" ON "public"."vendor_risks";
CREATE POLICY "Users can access vendor_risks for their tenant" ON "public"."vendor_risks"
FOR ALL TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- 2. vendor_incidents
DROP POLICY IF EXISTS "Users can access vendor_incidents for their tenant" ON "public"."vendor_incidents";
CREATE POLICY "Users can access vendor_incidents for their tenant" ON "public"."vendor_incidents"
FOR ALL TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- 3. vendor_contracts
DROP POLICY IF EXISTS "Users can access vendor_contracts for their tenant" ON "public"."vendor_contracts";
CREATE POLICY "Users can access vendor_contracts for their tenant" ON "public"."vendor_contracts"
FOR ALL TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- 4. vendor_performance_metrics
DROP POLICY IF EXISTS "Users can access vendor_performance_metrics for their tenant" ON "public"."vendor_performance_metrics";
CREATE POLICY "Users can access vendor_performance_metrics for their tenant" ON "public"."vendor_performance_metrics"
FOR ALL TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);

-- 5. vendor_communications
DROP POLICY IF EXISTS "Users can access vendor_communications for their tenant" ON "public"."vendor_communications";
CREATE POLICY "Users can access vendor_communications for their tenant" ON "public"."vendor_communications"
FOR ALL TO authenticated
USING (
  tenant_id IN (SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid())
);
