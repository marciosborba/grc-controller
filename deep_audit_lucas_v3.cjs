
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

        console.log('--- 1. AUTH USERS (LUCAS) ---');
        const authRes = await client.query("SELECT id, email, created_at, last_sign_in_at FROM auth.users WHERE email = 'lucas.alcantara@gepriv.com'");
        console.log(JSON.stringify(authRes.rows, null, 2));

        console.log('\n--- 2. VPU RECORDS (LUCAS) ---');
        const vpuRes = await client.query("SELECT * FROM public.vendor_portal_users WHERE LOWER(email) = 'lucas.alcantara@gepriv.com'");
        console.log(JSON.stringify(vpuRes.rows, null, 2));

        console.log('\n--- 3. ALL USERS WITH "LUCAS" IN EMAIL ---');
        const allLucas = await client.query("SELECT id, email FROM auth.users WHERE email ILIKE '%lucas%'");
        console.log(JSON.stringify(allLucas.rows, null, 2));

        console.log('\n--- 4. SIMULATE check_is_vendor FOR ALL LUCAS IDS ---');
        for (const user of allLucas.rows) {
            const rpcCheckRes = await client.query("SELECT public.check_is_vendor($1, $2) as is_vendor", [user.id, user.email]);
            console.log(`ID: ${user.id}, Email: ${user.email} -> is_vendor: ${rpcCheckRes.rows[0].is_vendor}`);
        }

        console.log('\n--- 5. ACTIVE SESSIONS FOR ALL LUCAS IDS ---');
        for (const user of allLucas.rows) {
            const sessRes = await client.query("SELECT id, created_at, last_updated_at FROM auth.sessions WHERE user_id = $1", [user.id]);
            console.log(`Sessions for ${user.email} (${user.id}):`, JSON.stringify(sessRes.rows, null, 2));
        }

        await client.end();
    } catch (err) {
        console.error('❌ Error during audit:', err.message);
    }
}

deepAudit();
