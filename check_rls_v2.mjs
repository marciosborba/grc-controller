import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const { rows } = await pool.query(`
            SELECT tablename, policyname, roles, cmd, qual, with_check 
            FROM pg_policies 
            WHERE tablename IN ('vendor_assessments', 'vendor_registry', 'vendor_risk_action_plans');
        `);
        console.dir(rows, { depth: null });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
main();
