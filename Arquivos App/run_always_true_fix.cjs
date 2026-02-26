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
        console.log("Connected to database.");

        const queries = [
            // 1. auth_lockouts
            `DROP POLICY IF EXISTS "Authenticated users can delete auth_lockouts" ON public.auth_lockouts`,
            `CREATE POLICY "Authenticated users can delete auth_lockouts" ON public.auth_lockouts FOR DELETE TO authenticated USING ((SELECT auth.uid() AS uid) IN (SELECT profiles.user_id FROM profiles WHERE profiles.role = 'admin' OR profiles.is_platform_admin = true))`,

            // 2. consents
            `DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.consents`,
            `CREATE POLICY "consents_tenant_policy" ON public.consents AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 3. data_inventory
            `DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.data_inventory`,
            `CREATE POLICY "data_inventory_tenant_policy" ON public.data_inventory AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 4. data_subject_requests
            `DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.data_subject_requests`,
            `CREATE POLICY "data_subject_requests_tenant_policy" ON public.data_subject_requests AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 5. ethics_communication_templates
            `DROP POLICY IF EXISTS "communication_templates_tenant_policy" ON public.ethics_communication_templates`,
            `CREATE POLICY "communication_templates_tenant_policy" ON public.ethics_communication_templates AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 6. ethics_corrective_actions
            `DROP POLICY IF EXISTS "corrective_actions_tenant_policy" ON public.ethics_corrective_actions`,
            `CREATE POLICY "corrective_actions_tenant_policy" ON public.ethics_corrective_actions AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 7. ethics_evidence
            `DROP POLICY IF EXISTS "evidence_tenant_policy" ON public.ethics_evidence`,
            `CREATE POLICY "evidence_tenant_policy" ON public.ethics_evidence AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 8. ethics_interviews
            `DROP POLICY IF EXISTS "interviews_tenant_policy" ON public.ethics_interviews`,
            `CREATE POLICY "interviews_tenant_policy" ON public.ethics_interviews AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 9. ethics_investigation_plans
            `DROP POLICY IF EXISTS "investigation_plans_tenant_policy" ON public.ethics_investigation_plans`,
            `CREATE POLICY "investigation_plans_tenant_policy" ON public.ethics_investigation_plans AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 10. ethics_metrics
            `DROP POLICY IF EXISTS "metrics_tenant_policy" ON public.ethics_metrics`,
            `CREATE POLICY "metrics_tenant_policy" ON public.ethics_metrics AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 11. ethics_regulatory_notifications
            `DROP POLICY IF EXISTS "regulatory_notifications_tenant_policy" ON public.ethics_regulatory_notifications`,
            `CREATE POLICY "regulatory_notifications_tenant_policy" ON public.ethics_regulatory_notifications AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 12. ethics_witnesses
            `DROP POLICY IF EXISTS "witnesses_tenant_policy" ON public.ethics_witnesses`,
            `CREATE POLICY "witnesses_tenant_policy" ON public.ethics_witnesses AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 13. legal_bases
            `DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.legal_bases`,
            `CREATE POLICY "legal_bases_tenant_policy" ON public.legal_bases AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 14. privacy_incidents
            `DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.privacy_incidents`,
            `CREATE POLICY "privacy_incidents_tenant_policy" ON public.privacy_incidents AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 15. processing_activities
            `DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.processing_activities`,
            `CREATE POLICY "processing_activities_tenant_policy" ON public.processing_activities AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 16. remediation_tasks
            `DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.remediation_tasks`,
            `CREATE POLICY "remediation_tasks_delete" ON public.remediation_tasks FOR DELETE TO authenticated USING (vulnerability_id IN (SELECT v.id FROM vulnerabilities v WHERE v.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())))`,

            `DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.remediation_tasks`,
            `CREATE POLICY "remediation_tasks_insert" ON public.remediation_tasks FOR INSERT TO authenticated WITH CHECK (vulnerability_id IN (SELECT v.id FROM vulnerabilities v WHERE v.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())))`,

            `DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.remediation_tasks`,
            `CREATE POLICY "remediation_tasks_update" ON public.remediation_tasks FOR UPDATE TO authenticated USING (vulnerability_id IN (SELECT v.id FROM vulnerabilities v WHERE v.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))) WITH CHECK (vulnerability_id IN (SELECT v.id FROM vulnerabilities v WHERE v.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())))`,

            // 17. risk_registrations
            `DROP POLICY IF EXISTS "risk_registrations_delete" ON public.risk_registrations`,
            `CREATE POLICY "risk_registrations_delete" ON public.risk_registrations FOR DELETE TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            `DROP POLICY IF EXISTS "risk_registrations_insert" ON public.risk_registrations`,
            `CREATE POLICY "risk_registrations_insert" ON public.risk_registrations FOR INSERT TO authenticated WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            `DROP POLICY IF EXISTS "risk_registrations_update" ON public.risk_registrations`,
            `CREATE POLICY "risk_registrations_update" ON public.risk_registrations FOR UPDATE TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // 18. vendor_risk_messages
            `DROP POLICY IF EXISTS "Internal users full access messages" ON public.vendor_risk_messages`,
            `CREATE POLICY "vendor_risk_messages_tenant_policy" ON public.vendor_risk_messages AS PERMISSIVE FOR ALL TO authenticated USING (vendor_id IN (SELECT vr.id FROM vendor_registry vr WHERE vr.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))) WITH CHECK (vendor_id IN (SELECT vr.id FROM vendor_registry vr WHERE vr.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())))`,

            // 19. vulnerability_attachments
            `DROP POLICY IF EXISTS "Enable access for authenticated users" ON public.vulnerability_attachments`,
            `CREATE POLICY "vulnerability_attachments_tenant_policy" ON public.vulnerability_attachments AS PERMISSIVE FOR ALL TO authenticated USING (vulnerability_id IN (SELECT v.id FROM vulnerabilities v WHERE v.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))) WITH CHECK (vulnerability_id IN (SELECT v.id FROM vulnerabilities v WHERE v.tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())))`
        ];

        console.log(`Executing ${queries.length} queries...`);

        for (const q of queries) {
            try {
                await client.query(q);
            } catch (e) {
                console.error(`Failed: ${q.substring(0, 100)}...`, e.message);
            }
        }
        console.log("Finished execution.");

    } catch (err) {
        console.error("Global Error:", err);
    } finally {
        await client.end();
    }
}

run();
