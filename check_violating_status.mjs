import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: 'postgresql://postgres.myxvxponlmulnjstbjwd:Vo1agPUE4QGwlwqS@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Action Plans Statuses:");
        const res1 = await pool.query('SELECT status, COUNT(*) FROM action_plans GROUP BY status');
        console.table(res1.rows);

        console.log("Action Plan Activities Statuses:");
        const res2 = await pool.query('SELECT status, COUNT(*) FROM action_plan_activities GROUP BY status');
        console.table(res2.rows);

    } catch (err) {
        console.error("Error", err);
    }
}

run().then(() => pool.end()).catch(console.error);
