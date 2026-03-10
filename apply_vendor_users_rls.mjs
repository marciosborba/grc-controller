import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const sql = `
      -- Allow vendor users to read their own profile
      DROP POLICY IF EXISTS "vendor_users_self_read" ON public.vendor_users;
      CREATE POLICY "vendor_users_self_read" ON public.vendor_users
          FOR SELECT
          USING (
            auth_user_id = auth.uid()
          );
          
      -- ensure it is listed
    `;

        console.log('Applying RLS for vendor_users...');
        await pool.query(sql);
        console.log('Vendor_users RLS applied successfully.');
    } catch (err) {
        console.error('Error applying RLS:', err.message);
    } finally {
        await pool.end();
    }
}
main();
