-- Atualizar ou adicionar regra para que fornecedores logados vejam seus action plans

DROP POLICY IF EXISTS "vendor_public_access_action_plans" ON public.vendor_risk_action_plans;
DROP POLICY IF EXISTS "Vendors can view their own action plans" ON public.vendor_risk_action_plans;
DROP POLICY IF EXISTS "Vendors can update their own action plans" ON public.vendor_risk_action_plans;

CREATE POLICY "Vendors can view their own action plans" 
ON public.vendor_risk_action_plans 
FOR SELECT TO authenticated 
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.vendor_users WHERE vendor_id = vendor_risk_action_plans.vendor_id
    )
    OR tenant_id = current_setting('app.current_tenant', true)::uuid
);

CREATE POLICY "Vendors can update their own action plans" 
ON public.vendor_risk_action_plans 
FOR UPDATE TO authenticated 
USING (
    auth.uid() IN (
        SELECT auth_user_id FROM public.vendor_users WHERE vendor_id = vendor_risk_action_plans.vendor_id
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT auth_user_id FROM public.vendor_users WHERE vendor_id = vendor_risk_action_plans.vendor_id
    )
);
