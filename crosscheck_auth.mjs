import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        // Full policy details
        const rls = await pool.query(`
            SELECT tablename, policyname, cmd, roles, qual, with_check
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename IN ('vendor_portal_users', 'vendor_users')
            ORDER BY tablename, policyname
        `);
        rls.rows.forEach(r => {
            console.log(`\n--- [${r.tablename}] "${r.policyname}" (${r.cmd}) ---`);
            console.log('USING:', r.qual);
            console.log('WITH CHECK:', r.with_check);
        });

        // Cross check
        const xc = await pool.query(`
            SELECT 
                vu.email,
                vu.auth_user_id as stored_auth_id,
                au.id as real_auth_id,
                (vu.auth_user_id = au.id) as ids_match
            FROM public.vendor_users vu
            LEFT JOIN auth.users au ON LOWER(au.email) = LOWER(vu.email)
        `);
        console.log('\n=== Cross Check ===');
        xc.rows.forEach(r => console.log(`Email: ${r.email} | stored_auth_id: ${r.stored_auth_id} | real_auth_id: ${r.real_auth_id} | match: ${r.ids_match}`));

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
