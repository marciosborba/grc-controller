import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function checkConstraint() {
    const res = await pool.query(`
        SELECT pg_get_constraintdef(c.oid) AS constraint_def
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'action_plans' AND c.conname = 'action_plans_status_check';
    `);

    if (res.rows.length > 0) {
        console.log("Constraint Definition:", res.rows[0].constraint_def);
    } else {
        console.log("Constraint not found.");
    }
}

checkConstraint().then(() => pool.end()).catch(console.error);
