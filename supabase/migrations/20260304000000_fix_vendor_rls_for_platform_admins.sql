-- Fix RLS policies for all vendor_ tables to allow public.is_platform_admin(auth.uid()) to bypass tenant restrictions

-- 1. vendor_registry
DROP POLICY IF EXISTS "Users can access vendor_registry for their tenant" ON public.vendor_registry;
CREATE POLICY "Users can access vendor_registry for their tenant" ON public.vendor_registry
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 2. vendor_contacts
DROP POLICY IF EXISTS "Users can access vendor_contacts for their tenant" ON public.vendor_contacts;
CREATE POLICY "Users can access vendor_contacts for their tenant" ON public.vendor_contacts
    FOR ALL USING (
        exists (
            select 1 from public.vendor_registry vr 
            where vr.id = vendor_contacts.vendor_id 
            and vr.tenant_id = get_auth_tenant_id()
        ) OR
        public.is_platform_admin(auth.uid())
    );

-- 3. vendor_assessment_frameworks
DROP POLICY IF EXISTS "Users can access vendor_assessment_frameworks for their tenant" ON public.vendor_assessment_frameworks;
CREATE POLICY "Users can access vendor_assessment_frameworks for their tenant" ON public.vendor_assessment_frameworks
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        tenant_id = '00000000-0000-0000-0000-000000000000' OR
        public.is_platform_admin(auth.uid())
    );

-- 4. vendor_assessments
DROP POLICY IF EXISTS "Users can access vendor_assessments for their tenant" ON public.vendor_assessments;
CREATE POLICY "Users can access vendor_assessments for their tenant" ON public.vendor_assessments
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 5. vendor_risks
DROP POLICY IF EXISTS "Users can access vendor_risks for their tenant" ON public.vendor_risks;
CREATE POLICY "Users can access vendor_risks for their tenant" ON public.vendor_risks
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 6. vendor_risk_action_plans
DROP POLICY IF EXISTS "Users can access vendor_risk_action_plans for their tenant" ON public.vendor_risk_action_plans;
CREATE POLICY "Users can access vendor_risk_action_plans for their tenant" ON public.vendor_risk_action_plans
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 7. vendor_incidents
DROP POLICY IF EXISTS "Users can access vendor_incidents for their tenant" ON public.vendor_incidents;
CREATE POLICY "Users can access vendor_incidents for their tenant" ON public.vendor_incidents
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 8. vendor_communications
DROP POLICY IF EXISTS "Users can access vendor_communications for their tenant" ON public.vendor_communications;
CREATE POLICY "Users can access vendor_communications for their tenant" ON public.vendor_communications
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 9. vendor_performance_metrics
DROP POLICY IF EXISTS "Users can access vendor_performance_metrics for their tenant" ON public.vendor_performance_metrics;
CREATE POLICY "Users can access vendor_performance_metrics for their tenant" ON public.vendor_performance_metrics
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 10. vendor_contracts
DROP POLICY IF EXISTS "Users can access vendor_contracts for their tenant" ON public.vendor_contracts;
CREATE POLICY "Users can access vendor_contracts for their tenant" ON public.vendor_contracts
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 11. vendor_certifications
DROP POLICY IF EXISTS "Users can access vendor_certifications for their tenant" ON public.vendor_certifications;
CREATE POLICY "Users can access vendor_certifications for their tenant" ON public.vendor_certifications
    FOR ALL USING (
        exists (
            select 1 from public.vendor_registry vr 
            where vr.id = vendor_certifications.vendor_id 
            and vr.tenant_id = get_auth_tenant_id()
        ) OR
        public.is_platform_admin(auth.uid())
    );

-- 12. vendor_audit_logs
DROP POLICY IF EXISTS "Users can access vendor_audit_logs for their tenant" ON public.vendor_audit_logs;
CREATE POLICY "Users can access vendor_audit_logs for their tenant" ON public.vendor_audit_logs
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );

-- 13. vendor_notifications
DROP POLICY IF EXISTS "Users can access vendor_notifications for their tenant" ON public.vendor_notifications;
CREATE POLICY "Users can access vendor_notifications for their tenant" ON public.vendor_notifications
    FOR ALL USING (
        tenant_id = get_auth_tenant_id() OR
        public.is_platform_admin(auth.uid())
    );
