require('dotenv').config();
const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

async function verifyFix() {
    const email = 'lucas.alcantara@gepriv.com';
    console.log(`\n🔍 --- FINAL VERIFICATION ---`);
    console.log(`Target: ${email}\n`);

    // 1. Check check_is_vendor RPC (via Supabase client)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { data: status, error: rpcError } = await supabase.rpc('check_is_vendor', {
        check_email: email
    });
    console.log(`✅ check_is_vendor status: "${status}" (Expected: "inactive")`);
    if (rpcError) console.error('Error in check_is_vendor:', rpcError);

    // 2. Check Database State (via PG for auth schema access)
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${new URL(process.env.SUPABASE_URL).hostname}:5432/postgres`
    });

    try {
        await client.connect();

        // Check vendor_portal_users
        const vpuRes = await client.query('SELECT is_active FROM public.vendor_portal_users WHERE email = $1', [email]);
        console.log(`✅ vendor_portal_users.is_active: ${vpuRes.rows[0]?.is_active} (Expected: false)`);

        // Check vendor_users and get user_id
        const vuRes = await client.query('SELECT is_active, auth_user_id FROM public.vendor_users WHERE email = $1', [email]);
        const vu = vuRes.rows[0];
        console.log(`✅ vendor_users.is_active: ${vu?.is_active} (Expected: false)`);

        // Check auth.sessions
        if (vu?.auth_user_id) {
            const sessionRes = await client.query('SELECT count(*) FROM auth.sessions WHERE user_id = $1', [vu.auth_user_id]);
            console.log(`✅ Active sessions in auth.sessions: ${sessionRes.rows[0].count} (Expected: 0)`);
        } else {
            // Lookup by auth.users email as backup
            const authUserRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
            const authUserId = authUserRes.rows[0]?.id;
            if (authUserId) {
                const sessionRes = await client.query('SELECT count(*) FROM auth.sessions WHERE user_id = $1', [authUserId]);
                console.log(`✅ Active sessions in auth.sessions (via auth.users lookup): ${sessionRes.rows[0].count} (Expected: 0)`);
            } else {
                console.log(`⚠️ Could not find user in auth.users by email.`);
            }
        }

    } catch (err) {
        console.error('Error in PG verification:', err);
    } finally {
        await client.end();
    }

    console.log(`\n🚀 Verification Complete.`);
}

verifyFix();
