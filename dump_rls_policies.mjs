import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgres://postgres.myxvxponlmulnjstbjwd:GEv123!!%40%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        const res = await pool.query(`
      SELECT tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename IN ('vendor_registry', 'vendor_assessments', 'action_plans', 'vendor_portal_users')
      ORDER BY tablename, policyname
    `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

run();
