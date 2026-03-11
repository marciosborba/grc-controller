require('dotenv').config();
const { Client } = require('pg');

async function deepAudit() {
    const email_pattern = '%lucas%';
    const db_host = 'db.myxvxponlmulnjstbjwd.supabase.co'; // Corrigido

    const client = new Client({
        host: db_host,
        port: 5432,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to DB\n');

        // 1. auth.users
        const authRes = await client.query("SELECT id, email, created_at, last_sign_in_at FROM auth.users WHERE email ILIKE $1", [email_pattern]);
        console.log('--- auth.users ---');
        console.table(authRes.rows);

        // 2. profiles
        const profRes = await client.query("SELECT user_id, email, is_active FROM public.profiles WHERE email ILIKE $1", [email_pattern]);
        console.log('--- public.profiles ---');
        console.table(profRes.rows);

        // 3. vendor_users
        const vuRes = await client.query("SELECT id, email, auth_user_id, is_active FROM public.vendor_users WHERE email ILIKE $1", [email_pattern]);
        console.log('--- public.vendor_users ---');
        console.table(vuRes.rows);

        // 4. vendor_portal_users
        const vpuRes = await client.query("SELECT id, email, is_active FROM public.vendor_portal_users WHERE email ILIKE $1", [email_pattern]);
        console.log('--- public.vendor_portal_users ---');
        console.table(vpuRes.rows);

        // 5. sessions
        const sessRes = await client.query("SELECT id, user_id, created_at FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE $1)", [email_pattern]);
        console.log('--- auth.sessions ---');
        console.table(sessRes.rows);

        // 6. Test RPC check_is_vendor status
        console.log('\n--- RPC Test: check_is_vendor ---');
        for (const r of authRes.rows) {
            const checkRes = await client.query("SELECT public.check_is_vendor($1, $2)", [r.id, r.email]);
            console.log(`User ${r.email} -> Status: ${checkRes.rows[0].check_is_vendor}`);
        }

    } catch (err) {
        console.error('❌ Audit failed:', err.message);
    } finally {
        await client.end();
    }
}

deepAudit();
