import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const vpu = await pool.query(`SELECT id, email, vendor_id, tenant_id, force_password_change FROM public.vendor_portal_users ORDER BY created_at DESC LIMIT 10`);
        console.log('=== vendor_portal_users ===');
        vpu.rows.forEach(r => console.log(r));

        const vu = await pool.query(`SELECT id, auth_user_id, email, vendor_id, role, is_active FROM public.vendor_users ORDER BY created_at DESC LIMIT 10`);
        console.log('\n=== vendor_users ===');
        vu.rows.forEach(r => console.log(r));

        const au = await pool.query(`
            SELECT au.id, au.email, LEFT(au.encrypted_password,10) as pass_prefix, au.email_confirmed_at IS NOT NULL as confirmed, au.deleted_at
            FROM auth.users au
            ORDER BY au.created_at DESC LIMIT 10
        `);
        console.log('\n=== auth.users (latest 10) ===');
        au.rows.forEach(r => console.log(r));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
