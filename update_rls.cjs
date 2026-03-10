const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    host: 'db.myxvxponlmulnjstbjwd.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

client.connect()
    .then(() => {
        const sql = `
      DROP POLICY IF EXISTS "tenant_modules_select_policy" ON tenant_modules;
      CREATE POLICY "tenant_modules_select_policy"
      ON tenant_modules FOR SELECT
      TO authenticated
      USING (
         tenant_id IN (SELECT tenant_id FROM profiles WHERE id = auth.uid()) OR
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_platform_admin = true)
      );
    `;
        return client.query(sql);
    })
    .then(res => {
        console.log('Result:', res);
        client.end();
    })
    .catch(err => {
        console.error('Error:', err);
        client.end();
    });
