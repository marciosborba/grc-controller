import pg from 'pg';
import fs from 'fs';
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
        fs.writeFileSync('status_constraint_utf8.txt', res.rows[0]?.def || 'Constraint not found', 'utf8');
        console.log('Saved to status_constraint_utf8.txt');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
}
main();
