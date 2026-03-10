import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const sql = `
      -- Allow vendor portal users to read their own record (to allow subqueries on vendor_registry policy)
      DROP POLICY IF EXISTS "vendor_portal_users_self_read" ON public.vendor_portal_users;
      CREATE POLICY "vendor_portal_users_self_read" ON public.vendor_portal_users
          FOR SELECT
          USING (
            email = auth.email()
          );
    `;

        console.log('Applying RLS for vendor_portal_users...');
        await pool.query(sql);
        console.log('Vendor_portal_users RLS applied successfully.');
    } catch (err) {
        console.error('Error applying RLS:', err.message);
    } finally {
        await pool.end();
    }
}
main();
