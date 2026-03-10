
const { Client } = require('pg');
require('dotenv').config();

async function getPolicies() {
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

        console.log('--- POLICIES vendor_portal_users ---');
        const res = await client.query("SELECT policyname, qual, with_check, cmd FROM pg_policies WHERE tablename = 'vendor_portal_users';");
        console.log(JSON.stringify(res.rows, null, 2));

        console.log('--- TABLE DEFINITION ---');
        const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendor_portal_users';");
        console.log(JSON.stringify(cols.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

getPolicies();
