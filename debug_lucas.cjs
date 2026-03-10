
const { Client } = require('pg');
require('dotenv').config();

async function dumpAllPossibleLucas() {
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

        console.log('--- VPU ---');
        const vpu = await client.query("SELECT id, email, is_active, vendor_id, tenant_id FROM vendor_portal_users WHERE email ILIKE '%lucas%';");
        console.log(JSON.stringify(vpu.rows, null, 2));

        console.log('--- VU ---');
        const vu = await client.query("SELECT id, email, is_active, vendor_id, tenant_id, auth_user_id FROM vendor_users WHERE email ILIKE '%lucas%';");
        console.log(JSON.stringify(vu.rows, null, 2));

        console.log('--- Registry ---');
        const reg = await client.query("SELECT id, name FROM vendor_registry;");
        console.log(JSON.stringify(reg.rows, null, 2));

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

dumpAllPossibleLucas();
