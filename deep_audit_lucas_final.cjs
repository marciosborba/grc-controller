
const { Client } = require('pg');
require('dotenv').config();

async function deepAudit() {
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

        console.log('--- 1. RLS POLICIES FOR vendor_portal_users ---');
        const rlsRes = await client.query("SELECT * FROM pg_policies WHERE tablename = 'vendor_portal_users'");
        console.log(JSON.stringify(rlsRes.rows, null, 2));

        console.log('\n--- 2. ALL USERS WITH "LUCAS" IN EMAIL ---');
        const allLucas = await client.query("SELECT id, email, last_sign_in_at FROM auth.users WHERE email ILIKE '%lucas%'");
        console.log(JSON.stringify(allLucas.rows, null, 2));

        console.log('\n--- 3. VPU RECORDS FOR ALL LUCAS ---');
        for (const user of allLucas.rows) {
            const vpuRes = await client.query("SELECT * FROM public.vendor_portal_users WHERE email = $1", [user.email]);
            console.log(`VPU for ${user.email}:`, JSON.stringify(vpuRes.rows, null, 2));
        }

        console.log('\n--- 4. TEST RPC check_is_vendor ---');
        for (const user of allLucas.rows) {
            const rpcRes = await client.query("SELECT public.check_is_vendor($1, $2)", [user.id, user.email]);
            console.log(`RPC check_is_vendor(${user.id}, ${user.email}):`, rpcRes.rows[0]);
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error during audit:', err.message);
    }
}

deepAudit();
