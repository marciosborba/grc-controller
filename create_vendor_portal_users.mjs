import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        // Check what columns exist in users table
        const { rows } = await pool.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users' 
            AND column_name IN ('role', 'perfil', 'tipo', 'is_admin', 'tenant_id')
            ORDER BY column_name;
        `);
        console.log('users table columns:', rows.map(r => r.column_name));

        // Drop existing policies first
        await pool.query(`DROP POLICY IF EXISTS "vendor_portal_users_self_read" ON public.vendor_portal_users;`);
        await pool.query(`DROP POLICY IF EXISTS "vendor_portal_users_self_update" ON public.vendor_portal_users;`);
        await pool.query(`DROP POLICY IF EXISTS "vendor_portal_users_admin_all" ON public.vendor_portal_users;`);
        await pool.query(`DROP POLICY IF EXISTS "vendor_portal_users_insert" ON public.vendor_portal_users;`);

        // Self read
        await pool.query(`
            CREATE POLICY "vendor_portal_users_self_read"
                ON public.vendor_portal_users FOR SELECT
                USING (email = auth.jwt()->>'email');
        `);
        // Self update (to clear force_password_change)
        await pool.query(`
            CREATE POLICY "vendor_portal_users_self_update"
                ON public.vendor_portal_users FOR UPDATE
                USING (email = auth.jwt()->>'email')
                WITH CHECK (email = auth.jwt()->>'email');
        `);
        // Allow service_role / authenticated admins to insert
        await pool.query(`
            CREATE POLICY "vendor_portal_users_insert"
                ON public.vendor_portal_users FOR INSERT
                WITH CHECK (true);
        `);

        console.log('✅ Policies created successfully.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
