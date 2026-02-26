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
        console.log("Connected. Fixing multiple permissive policies...");

        const sql = `
-- 1. privacy_incidents
DROP POLICY IF EXISTS "Users can manage own tenant privacy_incidents" ON public.privacy_incidents;
DROP POLICY IF EXISTS "privacy_incidents_tenant_policy" ON public.privacy_incidents;

CREATE POLICY "privacy_incidents_tenant_policy" ON public.privacy_incidents
AS PERMISSIVE FOR ALL TO authenticated
USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))
WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()));

-- 2. consents
DROP POLICY IF EXISTS "Users can manage own tenant consents" ON public.consents;
DROP POLICY IF EXISTS "consents_tenant_policy" ON public.consents;

CREATE POLICY "consents_tenant_policy" ON public.consents
AS PERMISSIVE FOR ALL TO authenticated
USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))
WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()));

-- 3. custom_fonts
DROP POLICY IF EXISTS "Users can manage own tenant custom_fonts" ON public.custom_fonts;
DROP POLICY IF EXISTS "custom_fonts_tenant_policy" ON public.custom_fonts;

CREATE POLICY "custom_fonts_tenant_policy" ON public.custom_fonts
AS PERMISSIVE FOR ALL TO authenticated
USING (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()))
WITH CHECK (tenant_id IN (SELECT profiles.tenant_id FROM profiles WHERE profiles.user_id = auth.uid()));
    `;

        // Split by statement to execute individually for better error handling/reporting if needed,
        // or just execute as one block if confident.
        // Given the timeouts, maybe splitting is safer or safer to just run the file content.
        // I'll execute as one block for atomicity per table if possible, but PG client supports multi-statement.

        await client.query(sql);
        console.log("Successfully executed SQL fix.");

    } catch (err) {
        console.error("Execution Failed:", err);
    } finally {
        await client.end();
    }
}

run();
