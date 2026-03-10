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
        console.log("Connected. Fixing assessments policies...");

        const sql = `
      DROP POLICY IF EXISTS "assessments_manage_admin" ON public.assessments;
      DROP POLICY IF EXISTS "assessments_read_own" ON public.assessments;
      DROP POLICY IF EXISTS "assessments_write_policy" ON public.assessments;

      -- Read Policy
      CREATE POLICY "assessments_read_policy" ON public.assessments
      FOR SELECT
      TO authenticated
      USING (
        is_platform_admin((SELECT auth.uid())) 
        OR 
        tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid())
      );

      -- Write Policies (Split to avoid SELECT overlap)
      CREATE POLICY "assessments_insert_policy" ON public.assessments FOR INSERT TO authenticated WITH CHECK (is_platform_admin((SELECT auth.uid())));
      CREATE POLICY "assessments_update_policy" ON public.assessments FOR UPDATE TO authenticated USING (is_platform_admin((SELECT auth.uid()))) WITH CHECK (is_platform_admin((SELECT auth.uid())));
      CREATE POLICY "assessments_delete_policy" ON public.assessments FOR DELETE TO authenticated USING (is_platform_admin((SELECT auth.uid())));
    `;

        await client.query(sql);
        console.log("Successfully executed SQL fix.");

    } catch (err) {
        console.error("Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();
