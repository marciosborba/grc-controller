-- Fix 'assessments' policy
DROP POLICY IF EXISTS "Assessments are viewable by tenant users" ON public.assessments;
CREATE POLICY "Assessments are viewable by tenant users"
    ON public.assessments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_tenant_access uta
            WHERE uta.tenant_id = assessments.tenant_id
            AND uta.user_id = auth.uid()
        )
        OR is_platform_admin(auth.uid())
    );

-- Fix 'vendor_assessments' policy
DROP POLICY IF EXISTS "Users can access vendor_assessments for their tenant" ON public.vendor_assessments;
CREATE POLICY "Users can access vendor_assessments for their tenant"
    ON public.vendor_assessments
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_tenant_access uta
            WHERE uta.tenant_id = vendor_assessments.tenant_id
            AND uta.user_id = auth.uid()
        )
        OR is_platform_admin(auth.uid())
    );

-- Fix 'vendor_registry' policy
DROP POLICY IF EXISTS "Users can access vendor_registry for their tenant" ON public.vendor_registry;
CREATE POLICY "Users can access vendor_registry for their tenant"
    ON public.vendor_registry
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_tenant_access uta
            WHERE uta.tenant_id = vendor_registry.tenant_id
            AND uta.user_id = auth.uid()
        )
        OR is_platform_admin(auth.uid())
    );

-- Also fix vendor_risks, vendor_incidents, etc just in case they have similar issues
DROP POLICY IF EXISTS "Users can access vendor_risks for their tenant" ON public.vendor_risks;
CREATE POLICY "Users can access vendor_risks for their tenant"
    ON public.vendor_risks
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_tenant_access uta
            WHERE uta.tenant_id = vendor_risks.tenant_id
            AND uta.user_id = auth.uid()
        )
        OR is_platform_admin(auth.uid())
    );

DROP POLICY IF EXISTS "Users can view action plans for their tenant" ON public.vendor_risk_action_plans;
CREATE POLICY "Users can view action plans for their tenant"
    ON public.vendor_risk_action_plans
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_tenant_access uta
            WHERE uta.tenant_id = vendor_risk_action_plans.tenant_id
            AND uta.user_id = auth.uid()
        )
        OR is_platform_admin(auth.uid())
    );
