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
        console.log("Connected. Fixing final RLS issues...");

        const sql = `
      -- 1. custom_fonts
      DROP POLICY IF EXISTS "Admins can manage all fonts" ON public.custom_fonts;
      DROP POLICY IF EXISTS "custom_fonts_tenant_policy" ON public.custom_fonts;

      CREATE POLICY "custom_fonts_tenant_policy" ON public.custom_fonts
      AS PERMISSIVE FOR ALL TO authenticated
      USING (
        is_platform_admin((SELECT auth.uid()))
        OR
        tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))
        OR 
        tenant_id IS NULL
      )
      WITH CHECK (
        is_platform_admin((SELECT auth.uid()))
        OR
        tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))
      );

      -- 2. data_inventory
      DROP POLICY IF EXISTS "data_inventory_tenant_policy" ON public.data_inventory;
      CREATE POLICY "data_inventory_tenant_policy" ON public.data_inventory
      AS PERMISSIVE FOR ALL TO authenticated
      USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))
      WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())));

      -- 3. data_subject_requests
      DROP POLICY IF EXISTS "Users can manage own tenant data_subject_requests" ON public.data_subject_requests;
      DROP POLICY IF EXISTS "data_subject_requests_tenant_policy" ON public.data_subject_requests;

      CREATE POLICY "data_subject_requests_tenant_policy" ON public.data_subject_requests
      AS PERMISSIVE FOR ALL TO authenticated
      USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())))
      WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid())));
    `;

        await client.query(sql);
        console.log("Successfully executed final fixes.");

    } catch (err) {
        console.error("Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();
