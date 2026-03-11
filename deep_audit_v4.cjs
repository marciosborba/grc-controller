require('dotenv').config();
const { Client } = require('pg');

async function deepAudit() {
    const client = new Client({
        connectionString: `postgresql://postgres:${process.env.SUPABASE_DB_PASSWORD}@${new URL(process.env.SUPABASE_URL).hostname}:5432/postgres`
    });

    try {
        await client.connect();

        console.log('--- 🔍 DEEP AUDIT: LUCAS ACCOUNTS ---');

        // 1. Search all users with "lucas" in email (auth.users)
        const authUsers = await client.query("SELECT id, email, created_at, last_sign_in_at FROM auth.users WHERE email ILIKE '%lucas%'");
        console.log('\n[auth.users]');
        console.table(authUsers.rows);

        // 2. Search all profiles
        const profiles = await client.query("SELECT user_id, email, is_active FROM public.profiles WHERE email ILIKE '%lucas%' OR user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%lucas%')");
        console.log('\n[public.profiles]');
        console.table(profiles.rows);

        // 3. Search vendor_users
        const vendorUsers = await client.query("SELECT id, email, auth_user_id, is_active FROM public.vendor_users WHERE email ILIKE '%lucas%'");
        console.log('\n[public.vendor_users]');
        console.table(vendorUsers.rows);

        // 4. Search vendor_portal_users
        const vendorPortalUsers = await client.query("SELECT id, email, is_active FROM public.vendor_portal_users WHERE email ILIKE '%lucas%'");
        console.log('\n[public.vendor_portal_users]');
        console.table(vendorPortalUsers.rows);

        // 5. Active sessions in auth.sessions
        const sessions = await client.query("SELECT id, user_id, created_at, last_updated_at FROM auth.sessions WHERE user_id IN (SELECT id FROM auth.users WHERE email ILIKE '%lucas%')");
        console.log('\n[auth.sessions]');
        console.table(sessions.rows);

        // 6. Test check_is_vendor for EACH Lucas found
        console.log('\n[RPC Test: check_is_vendor]');
        for (const user of authUsers.rows) {
            const rpcRes = await client.query("SELECT public.check_is_vendor($1, $2)", [user.id, user.email]);
            console.log(`User ${user.email} (${user.id}) -> Status: ${rpcRes.rows[0].check_is_vendor}`);
        }

    } catch (err) {
        console.error('Audit failed:', err);
    } finally {
        await client.end();
    }
}

deepAudit();
