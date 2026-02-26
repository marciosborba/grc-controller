const { Client } = require('pg');
require('dotenv').config();

const config = {
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

async function run() {
    try {
        await client.connect();
        console.log("Connected. Optimizing RLS policies...");

        const tables = [
            'apontamentos_auditoria',
            'audit_risk_assessments',
            'audit_risk_matrix_config',
            'audit_sampling_configs',
            'audit_sampling_items',
            'audit_sampling_plans',
            'consents',
            'custom_fonts'
        ];

        const queries = [
            // 1. apontamentos_auditoria
            `DROP POLICY IF EXISTS "apontamentos_auditoria_tenant_policy" ON public.apontamentos_auditoria`,
            `CREATE POLICY "apontamentos_auditoria_tenant_policy" ON public.apontamentos_auditoria AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`,

            // 2. audit_risk_assessments
            `DROP POLICY IF EXISTS "audit_risk_assessments_tenant" ON public.audit_risk_assessments`,
            `CREATE POLICY "audit_risk_assessments_tenant" ON public.audit_risk_assessments AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`,

            // 3. audit_risk_matrix_config
            `DROP POLICY IF EXISTS "audit_risk_matrix_config_tenant" ON public.audit_risk_matrix_config`,
            `CREATE POLICY "audit_risk_matrix_config_tenant" ON public.audit_risk_matrix_config AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`,

            // 4. audit_sampling_configs
            `DROP POLICY IF EXISTS "audit_sampling_configs_tenant" ON public.audit_sampling_configs`,
            `CREATE POLICY "audit_sampling_configs_tenant" ON public.audit_sampling_configs AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`,

            // 5. audit_sampling_items
            `DROP POLICY IF EXISTS "audit_sampling_items_tenant" ON public.audit_sampling_items`,
            `CREATE POLICY "audit_sampling_items_tenant" ON public.audit_sampling_items AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`,

            // 6. audit_sampling_plans
            `DROP POLICY IF EXISTS "audit_sampling_plans_tenant" ON public.audit_sampling_plans`,
            `CREATE POLICY "audit_sampling_plans_tenant" ON public.audit_sampling_plans AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`,

            // 7. consents
            `DROP POLICY IF EXISTS "consents_tenant_policy" ON public.consents`,
            `CREATE POLICY "consents_tenant_policy" ON public.consents AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`,

            // 8. custom_fonts
            `DROP POLICY IF EXISTS "custom_fonts_tenant_policy" ON public.custom_fonts`,
            `CREATE POLICY "custom_fonts_tenant_policy" ON public.custom_fonts AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))`
        ];

        console.log(`Executing ${queries.length} queries...`);

        for (const q of queries) {
            try {
                await client.query(q);
                // console.log(`Executed: ${q.substring(0, 50)}...`);
            } catch (e) {
                console.error(`Failed: ${q.substring(0, 100)}...`, e.message);
            }
        }
        console.log("Successfully executed RLS optimization.");

    } catch (err) {
        console.error("Global Error:", err);
    } finally {
        await client.end();
    }
}

run();
