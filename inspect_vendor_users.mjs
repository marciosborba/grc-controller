import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        // List all vendor auth users (check for is_vendor OR check vendor_portal_users)
        const authUsers = await pool.query(`
            SELECT 
                au.id,
                au.email,
                au.email_confirmed_at,
                au.created_at,
                au.raw_user_meta_data,
                LEFT(au.encrypted_password, 10) as password_prefix,
                au.is_super_admin,
                au.banned_until,
                au.deleted_at
            FROM auth.users au
            WHERE au.email IN (
                SELECT email FROM public.vendor_portal_users
                UNION
                SELECT email FROM public.vendor_users
            )
            ORDER BY au.created_at DESC
        `);
        console.log('Vendor users in auth.users:');
        console.table(authUsers.rows);

        // Check vendor_portal_users
        const vpu = await pool.query(`SELECT id, email, vendor_id, tenant_id, force_password_change, created_at FROM public.vendor_portal_users ORDER BY created_at DESC LIMIT 10`);
        console.log('\nvendor_portal_users:');
        console.table(vpu.rows);

        // Check vendor_users
        const vu = await pool.query(`SELECT id, auth_user_id, email, vendor_id, role, is_active FROM public.vendor_users ORDER BY created_at DESC LIMIT 10`);
        console.log('\nvendor_users:');
        console.table(vu.rows);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
