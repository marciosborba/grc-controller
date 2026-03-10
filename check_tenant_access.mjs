import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});
async function main() {
    try {
        const { rows } = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='user_tenant_access'");
        console.log("user_tenant_access columns:", rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();
