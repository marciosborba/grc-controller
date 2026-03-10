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
        console.log("Connected. Fixing persistent RLS issues...");

        // 1. custom_fonts
        await client.query(`DROP POLICY IF EXISTS "Users can view global and own tenant fonts" ON public.custom_fonts`);
        await client.query(`DROP POLICY IF EXISTS "custom_fonts_tenant_policy" ON public.custom_fonts`);

        await client.query(`
      CREATE POLICY "custom_fonts_tenant_policy" ON public.custom_fonts
      AS PERMISSIVE FOR ALL TO authenticated
      USING (
        tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))
        OR 
        tenant_id IS NULL
      )
      WITH CHECK (
        tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = (SELECT auth.uid()))
      )
    `);

        // 2. data_inventory
        await client.query(`DROP POLICY IF EXISTS "Users can manage own tenant data_inventory" ON public.data_inventory`);

        console.log("Successfully executed persistent fix.");

    } catch (err) {
        console.error("Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();
