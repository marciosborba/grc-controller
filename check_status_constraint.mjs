import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function main() {
    try {
        const res = await pool.query(`
            SELECT pg_get_constraintdef(oid) as def 
            FROM pg_constraint 
            WHERE conname = 'action_plans_status_check'
        `);
        console.log('Status Constraint rule:', res.rows[0]?.def || 'Constraint not found');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
