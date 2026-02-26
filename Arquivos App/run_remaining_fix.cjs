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
            // auth_lockouts
            `DROP POLICY IF EXISTS "Everyone can insert auth_lockouts" ON public.auth_lockouts`,
            `CREATE POLICY "Everyone can insert auth_lockouts" ON public.auth_lockouts FOR INSERT WITH CHECK (length(email) > 0)`,

            // policies
            `DROP POLICY IF EXISTS "Debug: Allow all access to policies" ON public.policies`,
            `CREATE POLICY "policies_tenant_policy" ON public.policies AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // vendor_assessments
            `DROP POLICY IF EXISTS "Debug: Allow all authenticated users" ON public.vendor_assessments`,
            `DROP POLICY IF EXISTS "Public Update" ON public.vendor_assessments`,
            `CREATE POLICY "vendor_assessments_tenant_policy" ON public.vendor_assessments AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`,

            // vendor_registry
            `DROP POLICY IF EXISTS "Debug: Allow all authenticated users" ON public.vendor_registry`,
            `CREATE POLICY "vendor_registry_tenant_policy" ON public.vendor_registry AS PERMISSIVE FOR ALL TO authenticated USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())) WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))`
        ];

        console.log(`Executing ${queries.length} queries...`);

        for (const q of queries) {
            try {
                await client.query(q);
                console.log(`Executed: ${q.substring(0, 50)}...`);
            } catch (e) {
                console.error(`Failed: ${q.substring(0, 50)}...`, e.message);
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
