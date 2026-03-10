import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    const { rows } = await pool.query(`SELECT policyname, cmd FROM pg_policies WHERE tablename = 'action_plans'`);
    console.log(JSON.stringify(rows, null, 2));
    pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
