
const { Client } = require('pg');
require('dotenv').config();

async function verifyPolicies() {
    const client = new Client({
        host: 'db.myxvxponlmulnjstbjwd.supabase.co',
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
      SELECT policyname, qual, with_check
      FROM pg_policies
      WHERE tablename = 'vendor_registry'
      AND schemaname = 'public';
    `);
        console.log('--- ACTIVE RLS POLICIES FOR vendor_registry ---');
        res.rows.forEach(r => {
            console.log(`Policy: ${r.policyname}`);
            console.log(`USING: ${r.qual}`);
            console.log(`WITH CHECK: ${r.with_check}`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

verifyPolicies();
