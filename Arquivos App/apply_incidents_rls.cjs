const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/.env' });

const client = new Client({
    connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.myxvxponlmulnjstbjwd.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
});

const sql = `
DROP POLICY IF EXISTS "Enable all access for authenticated users based on tenant_id" ON public."incidents";

CREATE POLICY "Enable all access for authenticated users based on tenant_id" ON public."incidents"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()))
WITH CHECK (tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()));
`;

client.connect().then(() => {
    console.log('Applying RLS policy to incidents table...');
    return client.query(sql);
}).then(() => {
    console.log("Successfully applied RLS policy.");
    client.end();
}).catch(err => {
    console.error("Error executing SQL:", err.message);
    client.end();
});
