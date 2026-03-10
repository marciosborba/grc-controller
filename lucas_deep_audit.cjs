
const { Client } = require('pg');
require('dotenv').config();

async function audit() {
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

        console.log('--- AUTH USERS ---');
        const au = await client.query("SELECT id, email, created_at FROM auth.users WHERE email ILIKE '%lucas.alcantara%';");
        console.log(JSON.stringify(au.rows, null, 2));

        console.log('--- VENDOR PORTAL USERS (VPU) ---');
        const vpu = await client.query("SELECT id, email, is_active, vendor_id FROM vendor_portal_users WHERE email ILIKE '%lucas.alcantara%';");
        console.log(JSON.stringify(vpu.rows, null, 2));

        console.log('--- RPC check_is_vendor ---');
        const rpc = await client.query("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'check_is_vendor';");
        console.log(rpc.rows[0]?.routine_definition || 'NOT FOUND');

        await client.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

audit();
