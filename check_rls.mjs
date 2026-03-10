import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        // Check RLS policies on vendor tables
        const rls = await pool.query(`
            SELECT tablename, policyname, cmd, qual, with_check
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename IN ('vendor_portal_users', 'vendor_users')
            ORDER BY tablename, policyname
        `);
        console.log('=== RLS Policies ===');
        rls.rows.forEach(r => {
            console.log(`[${r.tablename}] "${r.policyname}" (${r.cmd}): ${r.qual}`);
        });

        // Check if vendor_portal_users is RLS enabled
        const tables = await pool.query(`
            SELECT tablename, rowsecurity
            FROM pg_tables
            WHERE schemaname = 'public' AND tablename IN ('vendor_portal_users', 'vendor_users')
        `);
        console.log('\n=== RLS Status ===');
        tables.rows.forEach(r => console.log(`${r.tablename}: RLS=${r.rowsecurity}`));

        // Show current contents of vendor_portal_users
        const vpu = await pool.query(`SELECT id, email, vendor_id, tenant_id, force_password_change FROM public.vendor_portal_users ORDER BY created_at DESC`);
        console.log('\n=== vendor_portal_users ===');
        vpu.rows.forEach(r => console.log(r));

        // Show vendor_users
        const vu = await pool.query(`SELECT id, auth_user_id, email, vendor_id, role, is_active FROM public.vendor_users ORDER BY created_at DESC`);
        console.log('\n=== vendor_users ===');
        vu.rows.forEach(r => console.log(r));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
