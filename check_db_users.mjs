import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        console.log('--- Checking recently created vendor users ---');

        // 1. auth.users
        const authRes = await pool.query(`
            SELECT id, email, role, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at
            FROM auth.users
            ORDER BY created_at DESC LIMIT 5
        `);
        console.log('auth.users (Top 5 Recent):');
        console.table(authRes.rows);

        // 2. vendor_users
        const vuRes = await pool.query(`
            SELECT id, vendor_id, auth_user_id, email, role, is_active
            FROM public.vendor_users
            ORDER BY created_at DESC LIMIT 5
        `);
        console.log('\nvendor_users (Top 5 Recent):');
        console.table(vuRes.rows);

        // 3. vendor_portal_users
        const vpuRes = await pool.query(`
            SELECT id, vendor_id, email, tenant_id, force_password_change
            FROM public.vendor_portal_users
            ORDER BY created_at DESC LIMIT 5
        `);
        console.log('\nvendor_portal_users (Top 5 Recent):');
        console.table(vpuRes.rows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
