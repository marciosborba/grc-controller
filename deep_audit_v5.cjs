require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

async function resilientAudit() {
    const email_pattern = '%lucas%';
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    console.log('--- 🔍 RESILIENT DEEP AUDIT: LUCAS ---');

    // 1. Check vendor_portal_users via Supabase Client (Public)
    console.log('\n[vendor_portal_users via client]');
    const { data: vpuData } = await supabase
        .from('vendor_portal_users')
        .select('id, email, is_active, vendor_id')
        .ilike('email', email_pattern);
    console.table(vpuData);

    // 2. Check vendor_users via Supabase Client (Public)
    console.log('\n[vendor_users via client]');
    const { data: vuData } = await supabase
        .from('vendor_users')
        .select('id, email, is_active, auth_user_id')
        .ilike('email', email_pattern);
    console.table(vuData);

    // 3. Try to connect to DB for auth schema
    console.log('\n[Direct DB Connection check]');
    const pgClient = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${new URL(process.env.SUPABASE_URL).hostname}:5432/postgres?sslmode=require`,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await pgClient.connect();
        console.log('✅ DB Connected');

        const authRes = await pgClient.query("SELECT id, email, last_sign_in_at FROM auth.users WHERE email ILIKE $1", [email_pattern]);
        console.log('\n[auth.users]');
        console.table(authRes.rows);

        const sessionRes = await pgClient.query("SELECT id, user_id, created_at FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE $1)", [email_pattern]);
        console.log('\n[auth.sessions]');
        console.table(sessionRes.rows);

        // Test RPC
        for (const user of authRes.rows) {
            const rpcRes = await pgClient.query("SELECT public.check_is_vendor($1, $2)", [user.id, user.email]);
            console.log(`User ${user.email} -> Status: ${rpcRes.rows[0].check_is_vendor}`);
        }

    } catch (err) {
        console.error('❌ DB Connection failed:', err.message);
        console.log('\n⚠️ Falling back to RPC investigation via Supabase Client...');

        // We can't see sessions, but we can try to find if there are multiple IDs
        if (vpuData) {
            for (const user of vpuData) {
                const { data: status } = await supabase.rpc('check_is_vendor', { check_email: user.email });
                console.log(`RPC Test for ${user.email} -> ${status}`);
            }
        }
    } finally {
        await pgClient.end();
    }
}

resilientAudit();
