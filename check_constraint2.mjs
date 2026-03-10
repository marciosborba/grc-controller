import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    const res = await pool.query(`
        SELECT t.relname, c.conname, pg_get_constraintdef(c.oid) AS constraint_def
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname IN ('action_plans', 'action_plan_activities') AND c.contype = 'c';
    `);

    res.rows.forEach(r => console.log(r));
}

run().then(() => pool.end()).catch(console.error);
